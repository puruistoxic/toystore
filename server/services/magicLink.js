/**
 * Magic-link issuance and delivery.
 *
 * - Generates a high-entropy random token (32 random bytes, base64url).
 * - Stores only SHA-256(token) in the DB so a leaked DB never yields a
 *   usable login link.
 * - Expires after MAGIC_LINK_TTL_MIN (default 15 minutes).
 * - Single-use: marked consumed_at on first redemption.
 * - Email delivery uses nodemailer via SMTP_* env vars (your existing
 *   ZeptoMail config in server/.env).
 */
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { getPool } = require('../db');

const TOKEN_TTL_MIN = Math.max(1, parseInt(process.env.MAGIC_LINK_TTL_MIN || '15', 10));

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function generateRawToken() {
  return crypto.randomBytes(32).toString('base64url');
}

/** Resolve the public site URL the magic link should point at. */
function getMagicLinkBaseUrl() {
  const explicit = process.env.MAGIC_LINK_BASE_URL || process.env.SITE_URL || process.env.REACT_APP_SITE_URL;
  if (explicit && /^https?:\/\//i.test(explicit)) {
    return explicit.replace(/\/+$/, '');
  }
  return 'http://localhost:3000';
}

function buildMagicUrl(token, redirectTo) {
  const base = getMagicLinkBaseUrl();
  const url = new URL('/account/verify', base);
  url.searchParams.set('token', token);
  if (redirectTo) url.searchParams.set('redirect', redirectTo);
  return url.toString();
}

function createSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    tls: { rejectUnauthorized: false },
  });
}

function buildMagicEmail({ to, magicUrl, ttlMin }) {
  const from =
    process.env.SMTP_FROM ||
    `"DigiDukaanLive" <${process.env.SMTP_FROM_EMAIL || 'noreply@digidukaanlive.com'}>`;
  return {
    from,
    to,
    subject: 'Your DigiDukaanLive sign-in link',
    text:
      `Hi,\n\nClick the link below to sign in to DigiDukaanLive. ` +
      `This link expires in ${ttlMin} minutes and can only be used once.\n\n${magicUrl}\n\n` +
      `If you did not request this, you can safely ignore this email.`,
    html: `
      <!DOCTYPE html>
      <html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0d9488; margin-top: 0;">Sign in to DigiDukaanLive</h2>
        <p>Click the button below to sign in. This link expires in <strong>${ttlMin} minutes</strong> and can only be used once.</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${magicUrl}" style="display:inline-block; background:#0d9488; color:#fff; padding:14px 24px; border-radius:10px; text-decoration:none; font-weight:600;">Sign in</a>
        </p>
        <p style="font-size: 12px; color: #666;">Or paste this URL into your browser:</p>
        <p style="font-size: 12px; word-break: break-all;"><a href="${magicUrl}">${magicUrl}</a></p>
        <hr style="border:none; border-top:1px solid #eee; margin: 32px 0;">
        <p style="font-size: 12px; color: #999;">If you did not request this, you can safely ignore this email \u2014 no one will be able to sign in without clicking the link.</p>
      </body></html>
    `,
  };
}

/**
 * Issue a magic link for `email` and send it via SMTP.
 * Always returns `{ delivered }`; never throws on delivery failure (the route
 * still responds 200 to avoid leaking which emails exist) but logs server-side.
 */
async function issueMagicLink({ email, redirectTo, ip, userAgent }) {
  const pool = getPool();
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    const err = new Error('Invalid email');
    err.status = 400;
    throw err;
  }

  const rawToken = generateRawToken();
  const tokenHash = sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MIN * 60 * 1000);

  await pool.execute(
    `INSERT INTO magic_link_tokens (email, token_hash, purpose, expires_at, ip, user_agent)
     VALUES (?, ?, 'login', ?, ?, ?)`,
    [normalized, tokenHash, expiresAt, ip || null, (userAgent || '').slice(0, 500) || null],
  );

  const magicUrl = buildMagicUrl(rawToken, redirectTo);

  // Always log it server-side — invaluable in dev where SMTP may be off.
  console.log(`[MagicLink] Issued for ${normalized} \u2192 ${magicUrl} (expires in ${TOKEN_TTL_MIN} min)`);

  const transporter = createSmtpTransporter();
  if (!transporter) {
    console.warn('[MagicLink] SMTP_HOST not set \u2014 link only logged to server console.');
    return { delivered: false, devUrl: magicUrl };
  }

  try {
    await transporter.sendMail(buildMagicEmail({ to: normalized, magicUrl, ttlMin: TOKEN_TTL_MIN }));
    return { delivered: true };
  } catch (err) {
    console.error('[MagicLink] Email delivery failed:', err && err.message);
    return { delivered: false, devUrl: magicUrl };
  }
}

/**
 * Consume a magic-link token. Returns the verified email on success,
 * throws an Error with `status` set on failure.
 */
async function consumeMagicLink(rawToken) {
  if (!rawToken || typeof rawToken !== 'string' || rawToken.length < 16) {
    const err = new Error('Invalid token');
    err.status = 400;
    throw err;
  }
  const pool = getPool();
  const tokenHash = sha256Hex(rawToken);

  const [rows] = await pool.execute(
    `SELECT id, email, expires_at, consumed_at
     FROM magic_link_tokens WHERE token_hash = ? LIMIT 1`,
    [tokenHash],
  );
  if (!rows.length) {
    const err = new Error('Invalid or expired sign-in link');
    err.status = 400;
    throw err;
  }
  const row = rows[0];
  if (row.consumed_at) {
    const err = new Error('This sign-in link has already been used. Request a new one.');
    err.status = 400;
    throw err;
  }
  const expiresAt = row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at);
  if (Date.now() > expiresAt.getTime()) {
    const err = new Error('This sign-in link has expired. Request a new one.');
    err.status = 400;
    throw err;
  }

  await pool.execute(
    `UPDATE magic_link_tokens SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [row.id],
  );
  return String(row.email);
}

module.exports = {
  issueMagicLink,
  consumeMagicLink,
  buildMagicUrl,
  getMagicLinkBaseUrl,
  TOKEN_TTL_MIN,
};
