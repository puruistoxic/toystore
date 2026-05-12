/**
 * Razorpay Standard Web Checkout — backend endpoints.
 *
 * Routes (mounted at /api/payments in server/index.js):
 *   POST /api/payments/create-order   → creates a Razorpay order
 *   POST /api/payments/verify-payment → verifies the HMAC-SHA256 signature
 *   GET  /api/payments/config         → returns the public key id (browser-safe)
 *
 * Credentials are read from environment variables only. The KEY_SECRET is
 * used solely on the server to sign / verify requests; it is never returned
 * in any response and never reaches the browser bundle.
 */
const crypto = require('crypto');
const express = require('express');
const Razorpay = require('razorpay');

const router = express.Router();

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!KEY_ID || !KEY_SECRET) {
  console.warn(
    '[Razorpay] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing in env. ' +
      'The /api/payments/* endpoints will return 500 until both are set.',
  );
}

/** Lazily created singleton so a missing key fails on first request, not at import. */
let _client = null;
function getClient() {
  if (!KEY_ID || !KEY_SECRET) return null;
  if (!_client) {
    _client = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
  }
  return _client;
}

/** Generate a short receipt id (Razorpay limit: 40 chars). */
function generateReceipt(prefix = 'rcpt') {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(4).toString('hex');
  return `${prefix}_${ymd}_${rand}`.slice(0, 40);
}

/**
 * GET /api/payments/config
 * Returns the public key id so the frontend can render the checkout
 * without having to bake REACT_APP_RAZORPAY_KEY_ID into the bundle.
 * Browser-safe — only the public key id is returned.
 */
router.get('/config', (req, res) => {
  if (!KEY_ID) {
    return res.status(500).json({ error: 'Razorpay not configured on server' });
  }
  res.json({ key_id: KEY_ID });
});

/**
 * POST /api/payments/create-order
 * Body: { amount: number (in paise OR rupees), currency?: 'INR', receipt?: string,
 *         notes?: Record<string,string>, amountInRupees?: boolean }
 *
 * - Always sends `amount` to Razorpay in PAISE (smallest currency unit).
 * - If the caller passes `amountInRupees: true`, the value is multiplied by 100.
 * - Enforces minimum 100 paise (₹1.00).
 */
router.post('/create-order', async (req, res) => {
  try {
    const client = getClient();
    if (!client) {
      return res
        .status(500)
        .json({ error: 'Razorpay credentials not configured on server' });
    }

    const {
      amount,
      currency = 'INR',
      receipt,
      notes,
      amountInRupees = false,
    } = req.body || {};

    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return res.status(400).json({
        error: 'Invalid amount. Pass a positive number in paise (or rupees with amountInRupees=true).',
      });
    }

    const amountInPaise = Math.round(amountInRupees ? parsed * 100 : parsed);
    if (amountInPaise < 100) {
      return res
        .status(400)
        .json({ error: 'Minimum amount is 100 paise (₹1.00).' });
    }

    const order = await client.orders.create({
      amount: amountInPaise,
      currency,
      receipt: receipt && String(receipt).slice(0, 40) || generateReceipt(),
      notes: notes && typeof notes === 'object' ? notes : undefined,
    });

    return res.status(201).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      key_id: KEY_ID,
    });
  } catch (err) {
    const statusCode = err && err.statusCode ? Number(err.statusCode) : null;
    const description =
      (err && err.error && err.error.description) ||
      (err && err.message) ||
      'Failed to create Razorpay order';

    console.error('[Razorpay] create-order failed:', description, err);

    if (statusCode === 401) {
      return res.status(401).json({ error: 'Razorpay authentication failed. Check KEY_ID / KEY_SECRET.' });
    }
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return res.status(statusCode).json({ error: description });
    }
    return res.status(500).json({ error: description });
  }
});

/**
 * GET /api/payments/status/:payment_id
 *
 * Source-of-truth fetch from Razorpay's API. Use this to reconcile payments
 * when the browser checkout popup fails to post back (a known Razorpay
 * test-mode flake) — paste the payment_id from a success email here and
 * see Razorpay's recorded state (`created` / `authorized` / `captured` /
 * `refunded` / `failed`).
 *
 * Returns the safe subset of the Razorpay payment object — no secrets, no
 * raw card numbers (Razorpay never exposes those anyway).
 */
router.get('/status/:payment_id', async (req, res) => {
  try {
    const client = getClient();
    if (!client) {
      return res.status(500).json({ error: 'Razorpay credentials not configured on server' });
    }

    const paymentId = String(req.params.payment_id || '').trim();
    if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) {
      return res.status(400).json({ error: 'Invalid payment_id format' });
    }

    const p = await client.payments.fetch(paymentId);
    return res.json({
      id: p.id,
      order_id: p.order_id,
      status: p.status,
      amount: p.amount,
      currency: p.currency,
      method: p.method,
      captured: p.captured === true || p.status === 'captured',
      email: p.email,
      contact: p.contact,
      created_at: p.created_at,
      error_code: p.error_code || null,
      error_description: p.error_description || null,
      notes: p.notes || null,
    });
  } catch (err) {
    const statusCode = err && err.statusCode ? Number(err.statusCode) : null;
    const description =
      (err && err.error && err.error.description) ||
      (err && err.message) ||
      'Failed to fetch payment';

    console.error('[Razorpay] status fetch failed:', description);

    if (statusCode === 400 || statusCode === 404) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    if (statusCode === 401) {
      return res.status(401).json({ error: 'Razorpay authentication failed' });
    }
    return res.status(500).json({ error: description });
  }
});

/**
 * POST /api/payments/webhook
 *
 * Razorpay → your-server webhook. Configure in the Razorpay dashboard:
 *   1. Settings → Webhooks → Add new
 *   2. URL: https://<your-public-host>/api/payments/webhook
 *   3. Active events: payment.captured, payment.failed, order.paid (at minimum)
 *   4. Secret: any strong string. Put it in server/.env as RAZORPAY_WEBHOOK_SECRET.
 *
 * Verifies the X-Razorpay-Signature header against the raw request body using
 * HMAC-SHA256(rawBody, WEBHOOK_SECRET). The route mounts a dedicated raw-body
 * parser so the signature can be checked against the exact bytes Razorpay sent.
 *
 * Idempotency: Razorpay retries until you return 2xx. Make your downstream
 * handler (DB update / fulfilment) idempotent by keying on `payload.payment.entity.id`.
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error('[Razorpay] Webhook received but RAZORPAY_WEBHOOK_SECRET not set');
        return res.status(500).send('Webhook secret not configured');
      }

      const signatureHeader = req.header('x-razorpay-signature');
      if (!signatureHeader) {
        return res.status(400).send('Missing signature header');
      }

      const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
      const expected = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      let valid = false;
      try {
        const a = Buffer.from(expected, 'hex');
        const b = Buffer.from(String(signatureHeader), 'hex');
        valid = a.length === b.length && crypto.timingSafeEqual(a, b);
      } catch {
        valid = false;
      }

      if (!valid) {
        console.warn('[Razorpay] Webhook signature mismatch');
        return res.status(400).send('Invalid signature');
      }

      let event;
      try {
        event = JSON.parse(rawBody.toString('utf8'));
      } catch {
        return res.status(400).send('Invalid JSON');
      }

      const eventName = event && event.event;
      const payment = event && event.payload && event.payload.payment && event.payload.payment.entity;

      console.log(
        `[Razorpay] webhook ${eventName} payment=${payment && payment.id} order=${payment && payment.order_id} status=${payment && payment.status} amount=${payment && payment.amount}`,
      );

      // Mark our internal `orders` row as paid when Razorpay confirms capture.
      // Idempotent \u2014 the helper short-circuits if the order is already 'paid',
      // so receiving the same event twice is harmless.
      if (eventName === 'payment.captured' || eventName === 'order.paid') {
        try {
          const { getPool } = require('../db');
          const { markOrderPaidByRazorpayOrderId } = require('./orders');
          const pool = getPool();
          const razorpayOrderId = payment && payment.order_id;
          const razorpayPaymentId = payment && payment.id;
          if (razorpayOrderId && razorpayPaymentId && typeof markOrderPaidByRazorpayOrderId === 'function') {
            const result = await markOrderPaidByRazorpayOrderId(pool, {
              razorpayOrderId,
              razorpayPaymentId,
              method: payment.method || null,
            });
            console.log(
              `[Razorpay] webhook fulfilment: order=${result.public_ref || '-'} updated=${result.updated} reason=${result.reason || 'ok'}`,
            );
          }
        } catch (err) {
          console.error('[Razorpay] webhook fulfilment failed:', err.message);
          // Still 2xx \u2014 Razorpay will retry, but we don't want to retry on a
          // bug in our DB layer. Inspect logs.
        }
      }

      return res.status(200).json({ received: true });
    } catch (err) {
      console.error('[Razorpay] Webhook handler error:', err);
      return res.status(500).send('Webhook handler error');
    }
  },
);

/**
 * POST /api/payments/verify-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *
 * Verifies the signature using HMAC-SHA256(order_id + '|' + payment_id, KEY_SECRET).
 * Uses timing-safe comparison.
 */
router.post('/verify-payment', (req, res) => {
  try {
    if (!KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay key secret not configured on server' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        error:
          'Missing fields. Required: razorpay_order_id, razorpay_payment_id, razorpay_signature.',
        verified: false,
      });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(payload)
      .digest('hex');

    let isValid = false;
    try {
      const a = Buffer.from(expected, 'hex');
      const b = Buffer.from(String(razorpay_signature), 'hex');
      isValid = a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      isValid = false;
    }

    if (!isValid) {
      console.warn(
        `[Razorpay] Signature mismatch for order ${razorpay_order_id} / payment ${razorpay_payment_id}`,
      );
      return res
        .status(400)
        .json({ verified: false, error: 'Invalid payment signature' });
    }

    return res.json({
      verified: true,
      razorpay_order_id,
      razorpay_payment_id,
    });
  } catch (err) {
    console.error('[Razorpay] verify-payment failed:', err);
    return res
      .status(500)
      .json({ verified: false, error: 'Failed to verify signature' });
  }
});

module.exports = router;
