/**
 * Storefront / visitor activity (distinct from admin `audit_logs`).
 * Never throws — failures are logged only.
 */
const { getPool } = require('../db');

function pickIp(req) {
  if (!req) return null;
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    (req.headers && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) ||
    null
  );
}

function clip(s, max) {
  if (s == null) return null;
  const t = String(s);
  return t.length > max ? t.slice(0, max) : t;
}

/**
 * @param {object} o
 * @param {number|null} [o.customer_id]
 * @param {string|null} [o.email]
 * @param {string|null} [o.phone]
 * @param {string|null} [o.actor_label]
 * @param {string} o.action
 * @param {string} o.category
 * @param {string|null} [o.summary]
 * @param {string|null} [o.entity_type]
 * @param {string|null} [o.entity_id]
 * @param {object|null} [o.meta]
 * @param {object|null} [o.req]
 */
async function logSiteActivity(o) {
  try {
    const pool = getPool();
    const ip = clip(pickIp(o.req), 64);
    const ua = o.req?.headers?.['user-agent'] ? clip(o.req.headers['user-agent'], 800) : null;
    const metaJson = o.meta && typeof o.meta === 'object' ? JSON.stringify(o.meta).slice(0, 32000) : null;
    await pool.execute(
      `INSERT INTO site_activity_logs (
        customer_id, email, phone, actor_label, action, category,
        summary, entity_type, entity_id, meta_json, ip, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        o.customer_id != null && Number.isFinite(Number(o.customer_id)) ? Number(o.customer_id) : null,
        clip(o.email, 255),
        clip(o.phone, 32),
        clip(o.actor_label, 255),
        clip(o.action, 80),
        clip(o.category, 40),
        clip(o.summary, 500),
        clip(o.entity_type, 40),
        clip(o.entity_id, 64),
        metaJson,
        ip,
        ua,
      ],
    );
  } catch (e) {
    console.warn('[siteActivityLog]', e.message);
  }
}

module.exports = { logSiteActivity, pickIp };
