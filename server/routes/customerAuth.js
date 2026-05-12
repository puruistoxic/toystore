/**
 * Customer (storefront) auth routes.
 *
 * Mounted at /api/customer/auth.
 *
 * Providers:
 *   - Magic link via email   (ALWAYS available; uses SMTP_* env vars)
 *   - Google OAuth           (enabled when GOOGLE_OAUTH_CLIENT_ID/SECRET set)
 *   - WhatsApp OTP           (Zavu: ZAVUDEV_API_KEY or WHATSAPP_OTP_API_KEY + WHATSAPP_OTP_PROVIDER=zavu)
 *
 * All providers issue the same customer JWT (see middleware/customerAuth.js).
 * Customer rows in `customers` are upserted by the verified identifier:
 *   - email      (magic link, Google)
 *   - phone      (WhatsApp OTP)
 *   - google_sub (Google subject id, used to merge across email changes)
 */
const crypto = require('crypto');
const express = require('express');
const { getPool } = require('../db');
const { signCustomerToken, requireCustomer, optionalCustomer } = require('../middleware/customerAuth');
const { issueMagicLink, consumeMagicLink } = require('../services/magicLink');

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*  Provider configuration helpers                                            */
/* -------------------------------------------------------------------------- */

function googleConfigured() {
  return !!(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET);
}
function zavuOtpApiKey() {
  return (process.env.ZAVUDEV_API_KEY || process.env.WHATSAPP_OTP_API_KEY || '').trim();
}
function whatsappOtpProvider() {
  const raw = (process.env.WHATSAPP_OTP_PROVIDER || '').trim().toLowerCase();
  return raw || 'zavu';
}
function whatsappConfigured() {
  const mode = whatsappOtpProvider();
  if (mode === 'none' || mode === 'off' || mode === 'disabled') return false;
  if (mode !== 'zavu') return false;
  return !!zavuOtpApiKey();
}

/** Public — tells the frontend which sign-in methods are enabled. */
router.get('/providers', (_req, res) => {
  res.json({
    magic_link: true,
    google: googleConfigured(),
    whatsapp_otp: whatsappConfigured(),
  });
});

/* -------------------------------------------------------------------------- */
/*  Customer upsert helpers                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Claim any guest orders (customer_id IS NULL) whose contact_email or
 * contact_phone matches the freshly-authenticated customer. This is how
 * orders placed during a guest checkout end up in the customer's profile
 * once they sign in with the same contact identifier.
 *
 * Cheap operation (single UPDATE; both columns are indexed). Safe to call
 * multiple times — affectedRows naturally drops to 0 once everything is
 * already linked.
 */
/**
 * Best-effort linking of guest orders to a signed-in customer.
 *
 * Matching is intentionally tolerant because legacy/guest orders may have been
 * stored with the phone exactly as typed (e.g. `09818326075`, `+91 98183...`)
 * while the customer record stores a normalized E.164-ish form (`919818326075`).
 *
 *  - email   → case-insensitive equality
 *  - phone   → strip non-digits in SQL via nested REPLACEs and match on the
 *              last 10 digits (sufficient for IN/local mobile numbers, also
 *              works for already-normalized values).
 */
async function claimGuestOrders(pool, { customerId, email, phone }) {
  if (!customerId) return { claimed: 0 };
  const conds = [];
  const params = [customerId];
  if (email) {
    conds.push('LOWER(contact_email) = ?');
    params.push(String(email).trim().toLowerCase());
  }
  if (phone) {
    const digits = String(phone).replace(/\D/g, '');
    const tail = digits.slice(-10);
    if (tail.length >= 8) {
      // Strip common phone punctuation from contact_phone in SQL, then suffix-match.
      conds.push(
        "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(contact_phone, ''), ' ', ''), '+', ''), '-', ''), '(', ''), ')', '') LIKE ?",
      );
      params.push('%' + tail);
    }
  }
  if (!conds.length) return { claimed: 0 };
  try {
    const [result] = await pool.execute(
      `UPDATE orders SET customer_id = ?
       WHERE customer_id IS NULL AND (${conds.join(' OR ')})`,
      params,
    );
    const claimed = result.affectedRows || 0;
    if (claimed > 0) {
      console.log(
        `[CustomerAuth] Claimed ${claimed} guest order(s) for customer ${customerId}`,
      );
    }
    return { claimed };
  } catch (e) {
    console.warn('[CustomerAuth] claimGuestOrders failed:', e.message);
    return { claimed: 0, error: e.message };
  }
}

async function upsertByEmail(pool, { email, fullName, googleSub, markEmailVerified = true }) {
  const normalized = String(email).trim().toLowerCase();

  const [existing] = await pool.execute(
    `SELECT id, email, phone, full_name, google_sub, email_verified
     FROM customers WHERE email = ? LIMIT 1`,
    [normalized],
  );
  let customer;
  if (existing.length) {
    const c = existing[0];
    await pool.execute(
      `UPDATE customers SET
         full_name = COALESCE(?, full_name),
         google_sub = COALESCE(?, google_sub),
         email_verified = CASE WHEN ? THEN 1 ELSE email_verified END,
         last_login_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [fullName || null, googleSub || null, markEmailVerified ? 1 : 0, c.id],
    );
    customer = { id: c.id, email: normalized, phone: c.phone, full_name: fullName || c.full_name };
  } else {
    const [ins] = await pool.execute(
      `INSERT INTO customers (email, full_name, google_sub, email_verified, last_login_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [normalized, fullName || null, googleSub || null, markEmailVerified ? 1 : 0],
    );
    customer = { id: ins.insertId, email: normalized, phone: null, full_name: fullName || null };
  }
  await claimGuestOrders(pool, {
    customerId: customer.id,
    email: customer.email,
    phone: customer.phone,
  });
  return customer;
}

async function upsertByPhone(pool, { phone, fullName }) {
  const normalized = String(phone).replace(/\D/g, '');
  const [existing] = await pool.execute(
    `SELECT id, email, phone, full_name FROM customers WHERE phone = ? LIMIT 1`,
    [normalized],
  );
  let customer;
  if (existing.length) {
    const c = existing[0];
    await pool.execute(
      `UPDATE customers SET
         full_name = COALESCE(?, full_name),
         phone_verified = 1,
         last_login_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [fullName || null, c.id],
    );
    customer = { id: c.id, email: c.email, phone: normalized, full_name: fullName || c.full_name };
  } else {
    const [ins] = await pool.execute(
      `INSERT INTO customers (phone, full_name, phone_verified, last_login_at)
       VALUES (?, ?, 1, CURRENT_TIMESTAMP)`,
      [normalized, fullName || null],
    );
    customer = { id: ins.insertId, email: null, phone: normalized, full_name: fullName || null };
  }
  await claimGuestOrders(pool, {
    customerId: customer.id,
    email: customer.email,
    phone: customer.phone,
  });
  return customer;
}

function publicCustomer(c) {
  return {
    id: c.id,
    email: c.email,
    phone: c.phone,
    full_name: c.full_name,
    email_verified: c.email_verified === 1 || c.email_verified === true,
    phone_verified: c.phone_verified === 1 || c.phone_verified === true,
  };
}

/* -------------------------------------------------------------------------- */
/*  Magic-link sign-in                                                        */
/* -------------------------------------------------------------------------- */

router.post('/magic-link/request', async (req, res) => {
  try {
    const { email, redirect_to: redirectTo } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }
    const ip = req.ip || req.headers['x-forwarded-for'] || null;
    const ua = req.headers['user-agent'] || '';

    const result = await issueMagicLink({ email, redirectTo, ip, userAgent: ua });

    // Always respond 200 with a generic message so we don't leak
    // which emails have an existing account.
    return res.json({
      success: true,
      message: 'If that email is valid, a sign-in link has been sent.',
      // In dev (no SMTP configured / delivery failed), surface the URL so
      // the developer can complete the flow without an email provider.
      dev_url: result.delivered ? undefined : result.devUrl,
    });
  } catch (err) {
    if (err && err.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    console.error('[CustomerAuth] magic-link/request failed:', err);
    return res.status(500).json({ error: 'Could not issue sign-in link' });
  }
});

router.post('/magic-link/verify', async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token is required' });
    }
    const email = await consumeMagicLink(token);
    const pool = getPool();
    const customer = await upsertByEmail(pool, { email, markEmailVerified: true });
    const jwtToken = signCustomerToken(customer);

    // Re-read so we can return the verified flags
    const [rows] = await pool.execute(
      `SELECT id, email, phone, full_name, email_verified, phone_verified
       FROM customers WHERE id = ? LIMIT 1`,
      [customer.id],
    );
    const c = rows[0] || customer;
    const { logSiteActivity } = require('../services/siteActivityLog');
    void logSiteActivity({
      customer_id: c.id,
      email: c.email,
      phone: c.phone || null,
      actor_label: c.full_name || c.email,
      action: 'sign_in',
      category: 'auth',
      summary: 'Signed in with email magic link',
      entity_type: 'customer',
      entity_id: String(c.id),
      meta: { method: 'magic_link' },
      req,
    });
    return res.json({
      token: jwtToken,
      customer: rows[0] ? publicCustomer(rows[0]) : publicCustomer(customer),
    });
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    console.error('[CustomerAuth] magic-link/verify failed:', err);
    return res.status(500).json({ error: 'Could not verify sign-in link' });
  }
});

/* -------------------------------------------------------------------------- */
/*  Google OAuth (scaffold)                                                   */
/*                                                                            */
/*  Enable by setting in server/.env:                                         */
/*    GOOGLE_OAUTH_CLIENT_ID=...                                              */
/*    GOOGLE_OAUTH_CLIENT_SECRET=...                                          */
/*    GOOGLE_OAUTH_REDIRECT_URI=https://<host>/api/customer/auth/google/cb    */
/*                                                                            */
/*  Then add the same redirect URI to your Google Cloud OAuth client.         */
/*  We use the Authorization Code flow with PKCE-style state \u2014 no extra     */
/*  npm packages needed (uses global fetch from Node 18+).                    */
/* -------------------------------------------------------------------------- */

router.get('/google/start', async (req, res) => {
  if (!googleConfigured()) {
    return res.status(503).json({ error: 'Google sign-in is not configured on this server.' });
  }
  try {
    const pool = getPool();
    const state = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const redirectTo = typeof req.query.redirect_to === 'string' ? req.query.redirect_to.slice(0, 500) : null;
    await pool.execute(
      `INSERT INTO oauth_states (state, provider, redirect_to, expires_at) VALUES (?, 'google', ?, ?)`,
      [state, redirectTo, expiresAt],
    );

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
      access_type: 'online',
    });
    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  } catch (err) {
    console.error('[CustomerAuth] google/start failed:', err);
    return res.status(500).json({ error: 'Could not start Google sign-in' });
  }
});

router.get('/google/cb', async (req, res) => {
  if (!googleConfigured()) {
    return res.status(503).send('Google sign-in is not configured.');
  }
  const { code, state } = req.query;
  if (!code || !state) return res.status(400).send('Missing code/state');

  try {
    const pool = getPool();
    const [stateRows] = await pool.execute(
      `SELECT id, redirect_to, expires_at FROM oauth_states WHERE state = ? AND provider = 'google' LIMIT 1`,
      [String(state)],
    );
    if (!stateRows.length) return res.status(400).send('Invalid state');
    const s = stateRows[0];
    await pool.execute('DELETE FROM oauth_states WHERE id = ?', [s.id]);
    if (new Date(s.expires_at).getTime() < Date.now()) return res.status(400).send('State expired');

    // Exchange code for tokens
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenResp.ok) {
      const t = await tokenResp.text();
      console.error('[CustomerAuth] google token exchange failed:', t);
      return res.status(502).send('Google token exchange failed');
    }
    const tokenJson = await tokenResp.json();

    // Decode id_token (JWT) without verifying signature \u2014 OK because we
    // received it directly from Google's HTTPS token endpoint.
    const idToken = tokenJson.id_token;
    if (!idToken || idToken.split('.').length !== 3) {
      return res.status(502).send('Invalid id_token from Google');
    }
    const payloadB64 = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
    const email = payload.email && String(payload.email).toLowerCase();
    const fullName = payload.name || null;
    const sub = payload.sub ? String(payload.sub) : null;
    const emailVerified = payload.email_verified === true || payload.email_verified === 'true';
    if (!email || !emailVerified) return res.status(400).send('Google account email not verified');

    const customer = await upsertByEmail(pool, {
      email,
      fullName,
      googleSub: sub,
      markEmailVerified: true,
    });
    const jwtToken = signCustomerToken(customer);

    const { logSiteActivity } = require('../services/siteActivityLog');
    void logSiteActivity({
      customer_id: customer.id,
      email: customer.email,
      phone: customer.phone || null,
      actor_label: fullName || email,
      action: 'sign_in',
      category: 'auth',
      summary: 'Signed in with Google',
      entity_type: 'customer',
      entity_id: String(customer.id),
      meta: { method: 'google' },
      req,
    });

    // Bounce back to the SPA with the token in the URL fragment so it
    // never hits the server logs.
    const base = (process.env.MAGIC_LINK_BASE_URL || process.env.REACT_APP_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const dest = new URL('/account/verify', base);
    if (s.redirect_to) dest.searchParams.set('redirect', s.redirect_to);
    const fragment = new URLSearchParams({ provider: 'google', token: jwtToken });
    return res.redirect(`${dest.toString()}#${fragment.toString()}`);
  } catch (err) {
    console.error('[CustomerAuth] google/cb failed:', err);
    return res.status(500).send('Google sign-in failed');
  }
});

function sha256Hex(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

/* -------------------------------------------------------------------------- */
/*  WhatsApp OTP (Zavu / @zavudev/sdk)                                        */
/*                                                                            */
/*  Configure: WHATSAPP_OTP_PROVIDER=zavu (default), ZAVUDEV_API_KEY=…        */
/*  Optional: WHATSAPP_OTP_SENDER, WHATSAPP_OTP_TEMPLATE_ID (cold WhatsApp)  */
/* -------------------------------------------------------------------------- */

async function sendWhatsappOtp({ phone, code }) {
  if (!whatsappConfigured()) {
    console.log(`[WhatsApp OTP] (stub) ${phone} → ${code}`);
    return { delivered: false, devCode: code };
  }
  const { sendZavuWhatsappOtp } = require('../services/zavuWhatsappOtp');
  await sendZavuWhatsappOtp({ phoneDigits: phone, code });
  return { delivered: true };
}

/**
 * Validates the latest OTP for `normalized` phone, increments attempts on failure,
 * and marks the row consumed on success. Returns `{ ok, status?, error? }`.
 */
async function consumeWhatsappOtpIfValid(pool, normalized, plainCode) {
  const [rows] = await pool.execute(
    `SELECT id, code_hash, attempts, expires_at, consumed_at
     FROM whatsapp_otp_codes WHERE phone = ? ORDER BY id DESC LIMIT 1`,
    [normalized],
  );
  if (!rows.length) return { ok: false, status: 400, error: 'Request a new OTP.' };
  const row = rows[0];
  if (row.consumed_at) return { ok: false, status: 400, error: 'OTP already used. Request a new one.' };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, status: 400, error: 'OTP expired. Request a new one.' };
  }
  if (row.attempts >= 5) {
    return { ok: false, status: 429, error: 'Too many incorrect attempts. Request a new OTP.' };
  }

  const candidate = sha256Hex(`${normalized}:${String(plainCode).trim()}`);
  if (candidate !== row.code_hash) {
    await pool.execute(`UPDATE whatsapp_otp_codes SET attempts = attempts + 1 WHERE id = ?`, [row.id]);
    return { ok: false, status: 400, error: 'Incorrect OTP.' };
  }
  await pool.execute(`UPDATE whatsapp_otp_codes SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?`, [row.id]);
  return { ok: true };
}

/** Minimum seconds between two OTP requests for the same phone. */
const WHATSAPP_OTP_RESEND_COOLDOWN_S = 30;

router.post('/whatsapp-otp/request', async (req, res) => {
  try {
    const { phone } = req.body || {};
    const normalized = String(phone || '').replace(/\D/g, '');
    if (!normalized || normalized.length < 10 || normalized.length > 15) {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }

    const pool = getPool();

    // Rate-limit: refuse a fresh OTP request inside the cooldown window.
    const [recent] = await pool.execute(
      `SELECT created_at FROM whatsapp_otp_codes
        WHERE phone = ? AND consumed_at IS NULL
        ORDER BY id DESC LIMIT 1`,
      [normalized],
    );
    if (recent.length) {
      const lastTs = new Date(recent[0].created_at).getTime();
      const ageS = Math.floor((Date.now() - lastTs) / 1000);
      if (ageS < WHATSAPP_OTP_RESEND_COOLDOWN_S) {
        const retry = WHATSAPP_OTP_RESEND_COOLDOWN_S - ageS;
        return res.status(429).json({
          error: `Please wait ${retry}s before requesting another code.`,
          retry_after_seconds: retry,
        });
      }
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = sha256Hex(`${normalized}:${code}`);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Persist FIRST so a successful WhatsApp send is always paired with a
    // verifiable DB row. Older codes get invalidated atomically.
    await pool.execute(
      `UPDATE whatsapp_otp_codes SET consumed_at = CURRENT_TIMESTAMP
        WHERE phone = ? AND consumed_at IS NULL`,
      [normalized],
    );
    const [ins] = await pool.execute(
      `INSERT INTO whatsapp_otp_codes (phone, code_hash, expires_at, ip)
       VALUES (?, ?, ?, ?)`,
      [normalized, codeHash, expiresAt, req.ip || null],
    );

    let send;
    try {
      send = await sendWhatsappOtp({ phone: normalized, code });
    } catch (sendErr) {
      console.error('[CustomerAuth] WhatsApp OTP send failed:', sendErr.message || sendErr);
      // Roll back the inserted row so the user isn't holding a phantom OTP.
      await pool
        .execute(`UPDATE whatsapp_otp_codes SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?`, [ins.insertId])
        .catch(() => {});
      return res.status(502).json({
        error:
          'Could not send WhatsApp right now. Check server logs, Zavu credentials, and that WHATSAPP_OTP_TEMPLATE_ID is set for new conversations. You can use email sign-in instead.',
      });
    }

    return res.json({
      success: true,
      message: 'If that number is valid, a WhatsApp OTP has been sent.',
      resend_after_seconds: WHATSAPP_OTP_RESEND_COOLDOWN_S,
      dev_code: send.delivered ? undefined : send.devCode,
    });
  } catch (err) {
    console.error('[CustomerAuth] whatsapp-otp/request failed:', err);
    return res.status(500).json({ error: 'Could not send WhatsApp OTP' });
  }
});

router.post('/whatsapp-otp/verify', async (req, res) => {
  try {
    const { phone, code } = req.body || {};
    const normalized = String(phone || '').replace(/\D/g, '');
    if (!normalized || !code) return res.status(400).json({ error: 'phone and code required' });

    const pool = getPool();
    const chk = await consumeWhatsappOtpIfValid(pool, normalized, code);
    if (!chk.ok) return res.status(chk.status).json({ error: chk.error });

    const customer = await upsertByPhone(pool, { phone: normalized });
    const jwtToken = signCustomerToken(customer);
    const { logSiteActivity } = require('../services/siteActivityLog');
    void logSiteActivity({
      customer_id: customer.id,
      email: customer.email || null,
      phone: normalized,
      actor_label: customer.full_name || customer.phone,
      action: 'sign_in',
      category: 'auth',
      summary: 'Signed in with WhatsApp OTP',
      entity_type: 'customer',
      entity_id: String(customer.id),
      meta: { method: 'whatsapp_otp' },
      req,
    });
    return res.json({ token: jwtToken, customer: publicCustomer({ ...customer, phone_verified: 1 }) });
  } catch (err) {
    console.error('[CustomerAuth] whatsapp-otp/verify failed:', err);
    return res.status(500).json({ error: 'Could not verify OTP' });
  }
});

/**
 * Signed-in customer: verify WhatsApp OTP and attach that number to this account
 * (does not create a separate customer row).
 */
router.post('/whatsapp-otp/link-verify', requireCustomer, async (req, res) => {
  try {
    const { phone, code } = req.body || {};
    const normalized = String(phone || '').replace(/\D/g, '');
    if (!normalized || !code) return res.status(400).json({ error: 'phone and code required' });

    const pool = getPool();
    const chk = await consumeWhatsappOtpIfValid(pool, normalized, code);
    if (!chk.ok) return res.status(chk.status).json({ error: chk.error });

    const [taken] = await pool.execute(
      `SELECT id FROM customers WHERE phone = ? AND id <> ? AND is_active = 1 LIMIT 1`,
      [normalized, req.customer.id],
    );
    if (taken.length) {
      return res.status(409).json({
        error: 'That phone number is already linked to another account.',
      });
    }

    try {
      await pool.execute(
        `UPDATE customers SET phone = ?, phone_verified = 1, last_login_at = CURRENT_TIMESTAMP
         WHERE id = ? AND is_active = 1`,
        [normalized, req.customer.id],
      );
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'That phone number is already linked to another account.' });
      }
      throw e;
    }

    const [meRows] = await pool.execute(
      `SELECT id, email, phone, full_name, email_verified, phone_verified, created_at
       FROM customers WHERE id = ? AND is_active = 1 LIMIT 1`,
      [req.customer.id],
    );
    if (!meRows.length) return res.status(404).json({ error: 'Account not found' });
    const row = meRows[0];

    await claimGuestOrders(pool, {
      customerId: row.id,
      email: row.email || null,
      phone: normalized,
    });

    const jwtToken = signCustomerToken({
      id: row.id,
      email: row.email || null,
      phone: row.phone || null,
    });

    const { logSiteActivity } = require('../services/siteActivityLog');
    void logSiteActivity({
      customer_id: row.id,
      email: row.email || null,
      phone: normalized,
      actor_label: row.full_name || row.phone,
      action: 'profile_update',
      category: 'account',
      summary: 'Linked WhatsApp (phone verified via OTP)',
      entity_type: 'customer',
      entity_id: String(row.id),
      meta: { method: 'whatsapp_otp_link' },
      req,
    });

    return res.json({ token: jwtToken, customer: publicCustomer(row) });
  } catch (err) {
    console.error('[CustomerAuth] whatsapp-otp/link-verify failed:', err);
    return res.status(500).json({ error: 'Could not link phone' });
  }
});

/* -------------------------------------------------------------------------- */
/*  Session                                                                   */
/* -------------------------------------------------------------------------- */

router.get('/me', requireCustomer, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, email, phone, full_name, email_verified, phone_verified, created_at
       FROM customers WHERE id = ? AND is_active = 1 LIMIT 1`,
      [req.customer.id],
    );
    if (!rows.length) return res.status(404).json({ error: 'Account not found' });
    return res.json({ customer: publicCustomer(rows[0]) });
  } catch (err) {
    console.error('[CustomerAuth] /me failed:', err);
    return res.status(500).json({ error: 'Could not load profile' });
  }
});

router.patch('/me', requireCustomer, async (req, res) => {
  try {
    const { full_name, phone } = req.body || {};
    const pool = getPool();
    const sets = [];
    const params = [];
    let newPhone = null;
    if (typeof full_name === 'string') {
      sets.push('full_name = ?');
      params.push(full_name.trim().slice(0, 255) || null);
    }
    if (typeof phone === 'string') {
      newPhone = phone.replace(/\D/g, '') || null;
      sets.push('phone = ?');
      params.push(newPhone);
    }
    if (!sets.length) return res.json({ ok: true });
    params.push(req.customer.id);
    try {
      await pool.execute(`UPDATE customers SET ${sets.join(', ')} WHERE id = ?`, params);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'That phone number is already linked to another account.' });
      }
      throw e;
    }

    // If a phone was just attached, sweep any guest orders that match.
    if (newPhone) {
      const [meRows] = await pool.execute(
        `SELECT email FROM customers WHERE id = ? LIMIT 1`,
        [req.customer.id],
      );
      await claimGuestOrders(pool, {
        customerId: req.customer.id,
        email: meRows[0]?.email || null,
        phone: newPhone,
      });
    }
    const { logSiteActivity } = require('../services/siteActivityLog');
    void logSiteActivity({
      customer_id: req.customer.id,
      email: req.customer.email || null,
      phone: newPhone || req.customer.phone || null,
      actor_label: null,
      action: 'profile_update',
      category: 'account',
      summary: 'Updated profile',
      entity_type: 'customer',
      entity_id: String(req.customer.id),
      meta: { fields: Object.keys(req.body || {}) },
      req,
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[CustomerAuth] PATCH /me failed:', err);
    return res.status(500).json({ error: 'Could not update profile' });
  }
});

/**
 * Stateless JWT — logout is mostly client-side (drop the token).
 * When a valid customer token is sent, we record the sign-out for the activity feed.
 */
router.post('/logout', optionalCustomer, (req, res) => {
  if (req.customer?.id) {
    const { logSiteActivity } = require('../services/siteActivityLog');
    void logSiteActivity({
      customer_id: req.customer.id,
      email: req.customer.email || null,
      phone: req.customer.phone || null,
      actor_label: null,
      action: 'sign_out',
      category: 'auth',
      summary: 'Signed out',
      entity_type: 'customer',
      entity_id: String(req.customer.id),
      meta: null,
      req,
    });
  }
  res.json({ ok: true });
});

/* -------------------------------------------------------------------------- */
/*  Addresses                                                                 */
/* -------------------------------------------------------------------------- */

router.get('/addresses', requireCustomer, async (req, res) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT id, label, full_name, phone, line1, line2, landmark, city, state,
            postal_code, country, is_default, created_at
     FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, id DESC`,
    [req.customer.id],
  );
  res.json({ addresses: rows });
});

router.post('/addresses', requireCustomer, async (req, res) => {
  try {
    const b = req.body || {};
    const required = ['full_name', 'phone', 'line1', 'city', 'state', 'postal_code'];
    for (const k of required) {
      if (!b[k] || !String(b[k]).trim()) return res.status(400).json({ error: `${k} is required` });
    }
    const pool = getPool();
    // First address becomes default automatically.
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS c FROM customer_addresses WHERE customer_id = ?`,
      [req.customer.id],
    );
    const isFirst = Number(countRows[0]?.c || 0) === 0;
    const wantDefault = b.is_default || isFirst;

    if (wantDefault) {
      await pool.execute(`UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?`, [req.customer.id]);
    }
    const [ins] = await pool.execute(
      `INSERT INTO customer_addresses (
        customer_id, label, full_name, phone, line1, line2, landmark, city, state, postal_code, country, is_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.customer.id,
        (b.label || '').toString().slice(0, 50) || null,
        String(b.full_name).slice(0, 255),
        String(b.phone).replace(/\s+/g, '').slice(0, 20),
        String(b.line1).slice(0, 255),
        (b.line2 || '').toString().slice(0, 255) || null,
        (b.landmark || '').toString().slice(0, 255) || null,
        String(b.city).slice(0, 120),
        String(b.state).slice(0, 120),
        String(b.postal_code).replace(/\s+/g, '').slice(0, 20),
        (b.country || 'India').toString().slice(0, 120),
        wantDefault ? 1 : 0,
      ],
    );
    const { logSiteActivity } = require('../services/siteActivityLog');
    void logSiteActivity({
      customer_id: req.customer.id,
      email: req.customer.email || null,
      phone: req.customer.phone || null,
      actor_label: null,
      action: 'address_create',
      category: 'account',
      summary: `Added delivery address #${ins.insertId}`,
      entity_type: 'customer_address',
      entity_id: String(ins.insertId),
      meta: { city: String(b.city).slice(0, 120), postal_code: String(b.postal_code).replace(/\s+/g, '').slice(0, 20) },
      req,
    });
    res.status(201).json({ id: ins.insertId });
  } catch (err) {
    console.error('[CustomerAuth] POST /addresses failed:', err);
    res.status(500).json({ error: 'Could not save address' });
  }
});

router.patch('/addresses/:id', requireCustomer, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: 'Invalid address id' });
    const pool = getPool();
    const [own] = await pool.execute(
      `SELECT id FROM customer_addresses WHERE id = ? AND customer_id = ? LIMIT 1`,
      [id, req.customer.id],
    );
    if (!own.length) return res.status(404).json({ error: 'Address not found' });

    const b = req.body || {};
    const map = {
      label: (v) => ['label = ?', (v || '').toString().slice(0, 50) || null],
      full_name: (v) => ['full_name = ?', String(v).slice(0, 255)],
      phone: (v) => ['phone = ?', String(v).replace(/\s+/g, '').slice(0, 20)],
      line1: (v) => ['line1 = ?', String(v).slice(0, 255)],
      line2: (v) => ['line2 = ?', (v || '').toString().slice(0, 255) || null],
      landmark: (v) => ['landmark = ?', (v || '').toString().slice(0, 255) || null],
      city: (v) => ['city = ?', String(v).slice(0, 120)],
      state: (v) => ['state = ?', String(v).slice(0, 120)],
      postal_code: (v) => ['postal_code = ?', String(v).replace(/\s+/g, '').slice(0, 20)],
      country: (v) => ['country = ?', (v || 'India').toString().slice(0, 120)],
    };
    const sets = [];
    const params = [];
    for (const k of Object.keys(map)) {
      if (b[k] !== undefined) {
        const [sql, val] = map[k](b[k]);
        sets.push(sql);
        params.push(val);
      }
    }

    if (b.is_default === true || b.is_default === 1) {
      await pool.execute(
        `UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?`,
        [req.customer.id],
      );
      sets.push('is_default = 1');
    }

    if (!sets.length) return res.json({ ok: true });
    params.push(id);
    await pool.execute(`UPDATE customer_addresses SET ${sets.join(', ')} WHERE id = ?`, params);
    const { logSiteActivity } = require('../services/siteActivityLog');
    void logSiteActivity({
      customer_id: req.customer.id,
      email: req.customer.email || null,
      phone: req.customer.phone || null,
      actor_label: null,
      action: 'address_update',
      category: 'account',
      summary: `Updated address #${id}`,
      entity_type: 'customer_address',
      entity_id: String(id),
      meta: null,
      req,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[CustomerAuth] PATCH /addresses/:id failed:', err);
    res.status(500).json({ error: 'Could not update address' });
  }
});

router.delete('/addresses/:id', requireCustomer, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: 'Invalid address id' });
    const pool = getPool();
    const [own] = await pool.execute(
      `SELECT id, is_default FROM customer_addresses WHERE id = ? AND customer_id = ? LIMIT 1`,
      [id, req.customer.id],
    );
    if (!own.length) return res.status(404).json({ error: 'Address not found' });
    await pool.execute(`DELETE FROM customer_addresses WHERE id = ?`, [id]);
    // Promote another address to default if we just removed the default one.
    if (own[0].is_default) {
      await pool.execute(
        `UPDATE customer_addresses SET is_default = 1
         WHERE customer_id = ?
         ORDER BY id DESC LIMIT 1`,
        [req.customer.id],
      );
    }
    const { logSiteActivity } = require('../services/siteActivityLog');
    void logSiteActivity({
      customer_id: req.customer.id,
      email: req.customer.email || null,
      phone: req.customer.phone || null,
      actor_label: null,
      action: 'address_delete',
      category: 'account',
      summary: `Removed address #${id}`,
      entity_type: 'customer_address',
      entity_id: String(id),
      meta: null,
      req,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[CustomerAuth] DELETE /addresses/:id failed:', err);
    res.status(500).json({ error: 'Could not delete address' });
  }
});

module.exports = router;
module.exports.claimGuestOrders = claimGuestOrders;
