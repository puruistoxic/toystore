/**
 * Persist every outreach lead in `lead_logs`.
 *
 * Source-of-truth tables (orders, enquiries, cart_enquiries) still exist for
 * the specific flows that own those records. `lead_logs` is a *cross-channel
 * activity stream* used by the admin console to ensure no enquiry — WhatsApp
 * click, quote request, contact form, popup, support DM — slips through.
 *
 * Designed to never throw at the caller: a log failure should NOT break the
 * primary action (sending email, opening WhatsApp, saving the order…).
 */
const crypto = require('crypto');
const { getPool } = require('../db');

const ALLOWED_CHANNELS = new Set([
  'whatsapp',
  'email',
  'phone',
  'contact_form',
  'quote_request',
  'product_enquiry',
  'cart_enquiry',
  'order',
  'other',
]);

function generatePublicRef() {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `LEAD-${ymd}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function pickIp(req) {
  if (!req) return null;
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    (req.headers && (req.headers['x-forwarded-for'] || '').split(',')[0].trim()) ||
    null
  );
}

function clip(value, max) {
  if (value == null) return null;
  const s = String(value);
  return s.length > max ? s.slice(0, max) : s;
}

/**
 * @param {object} opts
 * @param {string} opts.channel  one of ALLOWED_CHANNELS
 * @param {string} [opts.source]  page/component label, e.g. 'WhatsAppButton-floating'
 * @param {string} [opts.intent]  freeform, e.g. 'product_enquiry', 'quote_request'
 * @param {object} [opts.product]  { id, name, slug }
 * @param {object} [opts.contact] { name, email, phone }
 * @param {string} [opts.whatsapp_number] destination wa number
 * @param {string} [opts.message]  message preview / body
 * @param {string} [opts.page_url]
 * @param {string} [opts.referrer]
 * @param {string} [opts.delivery_pincode]
 * @param {string} [opts.related_type] 'order' | 'cart_enquiry' | 'enquiry' | 'quote_request' | …
 * @param {string} [opts.related_ref]
 * @param {object} [opts.context]   freeform context
 * @param {number} [opts.customer_id]
 * @param {object} [opts.req]       Express request — for IP / UA only
 * @returns {Promise<{ id:number, public_ref:string } | null>}
 */
async function logLead(opts = {}) {
  try {
    const channel = ALLOWED_CHANNELS.has(opts.channel) ? opts.channel : 'other';
    const product = opts.product || {};
    const contact = opts.contact || {};
    const ip = pickIp(opts.req);
    const userAgent = opts.req?.headers?.['user-agent'] || null;
    const publicRef = generatePublicRef();
    const pool = getPool();

    const [result] = await pool.execute(
      `INSERT INTO lead_logs (
        public_ref, channel, source, intent,
        product_id, product_name, product_slug,
        customer_name, customer_email, customer_phone,
        whatsapp_number, message_preview, page_url, referrer,
        delivery_pincode, related_type, related_ref,
        context_json, ip, user_agent, customer_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        publicRef,
        channel,
        clip(opts.source, 120),
        clip(opts.intent, 120),
        clip(product.id, 50),
        clip(product.name, 500),
        clip(product.slug, 255),
        clip(contact.name, 255),
        clip(contact.email, 255),
        clip(contact.phone, 20),
        clip(opts.whatsapp_number, 20),
        clip(opts.message, 2000),
        clip(opts.page_url, 800),
        clip(opts.referrer, 800),
        clip(opts.delivery_pincode, 10),
        clip(opts.related_type, 40),
        clip(opts.related_ref, 64),
        opts.context ? JSON.stringify(opts.context).slice(0, 60000) : null,
        clip(ip, 64),
        clip(userAgent, 800),
        opts.customer_id != null && Number.isFinite(Number(opts.customer_id))
          ? Number(opts.customer_id)
          : null,
      ],
    );

    return { id: result.insertId, public_ref: publicRef };
  } catch (err) {
    console.error('[leadLogger] failed:', err.message);
    return null;
  }
}

module.exports = { logLead, generatePublicRef, ALLOWED_CHANNELS };
