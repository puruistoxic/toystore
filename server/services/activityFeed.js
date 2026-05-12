/**
 * Unified activity feed for the admin "Audit / activity" UI:
 *   admin panel changes (audit_logs)
 *   storefront + visitor actions (site_activity_logs)
 *   outreach / leads (lead_logs)
 */
const { getPool } = require('../db');

function likeFragment(raw) {
  if (!raw || !String(raw).trim()) return null;
  return `%${String(raw).replace(/%/g, '').replace(/\\/g, '')}%`;
}

/**
 * @param {object} q — req.query
 * @returns {Promise<{ rows: object[], total: number, page: number, limit: number, totalPages: number }>}
 */
async function queryActivityFeed(q) {
  const pool = getPool();
  const scope = ['all', 'admin', 'website'].includes(String(q.scope || 'all').toLowerCase())
    ? String(q.scope || 'all').toLowerCase()
    : 'all';
  const page = Math.max(1, parseInt(String(q.page || '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(q.limit || '50'), 10) || 50));
  const offset = (page - 1) * limit;
  const qLike = likeFragment(q.q);
  const action = q.action ? String(q.action) : '';
  const entity_type = q.entity_type ? String(q.entity_type) : '';
  const username = q.username ? String(q.username).trim() : '';

  let total = 0;
  const branches = [];
  const countParams = [];

  /* ---- Admin (audit_logs) -------------------------------------------- */
  if (scope === 'all' || scope === 'admin') {
    const w = [];
    const p = [];
    if (action) {
      w.push('al.action = ?');
      p.push(action);
    }
    if (entity_type) {
      w.push('al.entity_type = ?');
      p.push(entity_type);
    }
    if (username) {
      w.push('al.username LIKE ?');
      p.push(`%${username.replace(/%/g, '')}%`);
    }
    if (qLike) {
      w.push(
        '(al.username LIKE ? OR al.entity_name LIKE ? OR al.entity_id LIKE ? OR al.entity_type LIKE ? OR al.action LIKE ?)',
      );
      p.push(qLike, qLike, qLike, qLike, qLike);
    }
    const wh = w.length ? `AND ${w.join(' AND ')}` : '';
    const [cRows] = await pool.execute(`SELECT COUNT(*) AS c FROM audit_logs al WHERE 1=1 ${wh}`, p);
    total += Number(cRows[0]?.c) || 0;
    branches.push({
      sql: `SELECT al.id AS row_id, 'admin' AS source_kind, al.created_at AS occurred_at,
            al.username AS actor_display,
            CONCAT(al.action, ' · ', al.entity_type) AS action_title,
            TRIM(CONCAT_WS(' ', NULLIF(al.entity_name,''), NULLIF(al.entity_id,''))) AS detail_summary,
            al.ip_address AS ip_address,
            al.user_agent AS user_agent,
            CAST(COALESCE(al.changes, JSON_OBJECT()) AS CHAR(8000)) AS payload_json
            FROM audit_logs al WHERE 1=1 ${wh}`,
      params: p,
    });
  }

  /* ---- Storefront (site_activity_logs) ------------------------------- */
  if (scope === 'all' || scope === 'website') {
    const w = [];
    const p = [];
    if (qLike) {
      w.push(
        '(sal.actor_label LIKE ? OR sal.summary LIKE ? OR sal.action LIKE ? OR sal.category LIKE ? OR sal.email LIKE ? OR sal.phone LIKE ? OR sal.entity_id LIKE ?)',
      );
      p.push(qLike, qLike, qLike, qLike, qLike, qLike, qLike);
    }
    const wh = w.length ? `AND ${w.join(' AND ')}` : '';
    try {
      const [cRows] = await pool.execute(`SELECT COUNT(*) AS c FROM site_activity_logs sal WHERE 1=1 ${wh}`, p);
      total += Number(cRows[0]?.c) || 0;
      branches.push({
        sql: `SELECT sal.id AS row_id, 'storefront' AS source_kind, sal.created_at AS occurred_at,
              COALESCE(NULLIF(sal.actor_label,''), sal.email, sal.phone, IF(sal.customer_id IS NULL, 'Visitor', CONCAT('Customer #', sal.customer_id))) AS actor_display,
              CONCAT(sal.action, ' · ', sal.category) AS action_title,
              COALESCE(NULLIF(sal.summary,''), TRIM(CONCAT_WS(' ', sal.entity_type, sal.entity_id)), '') AS detail_summary,
              sal.ip AS ip_address,
              sal.user_agent AS user_agent,
              CAST(COALESCE(sal.meta_json, JSON_OBJECT()) AS CHAR(8000)) AS payload_json
              FROM site_activity_logs sal WHERE 1=1 ${wh}`,
        params: p,
      });
    } catch (e) {
      if (e.code !== 'ER_NO_SUCH_TABLE') console.warn('[activityFeed] site_activity_logs:', e.message);
    }
  }

  /* ---- Outreach (lead_logs) ------------------------------------------ */
  if (scope === 'all' || scope === 'website') {
    const w = [];
    const p = [];
    if (qLike) {
      w.push(
        '(ll.customer_name LIKE ? OR ll.customer_email LIKE ? OR ll.customer_phone LIKE ? OR ll.product_name LIKE ? OR ll.public_ref LIKE ? OR ll.source LIKE ? OR ll.channel LIKE ? OR ll.intent LIKE ?)',
      );
      p.push(qLike, qLike, qLike, qLike, qLike, qLike, qLike, qLike);
    }
    const wh = w.length ? `AND ${w.join(' AND ')}` : '';
    try {
      const [cRows] = await pool.execute(`SELECT COUNT(*) AS c FROM lead_logs ll WHERE 1=1 ${wh}`, p);
      total += Number(cRows[0]?.c) || 0;
      branches.push({
        sql: `SELECT ll.id AS row_id, 'outreach' AS source_kind, ll.created_at AS occurred_at,
              COALESCE(NULLIF(ll.customer_name,''), ll.customer_email, ll.customer_phone, 'Anonymous') AS actor_display,
              CONCAT('Lead · ', ll.channel) AS action_title,
              COALESCE(NULLIF(ll.product_name,''), LEFT(ll.message_preview, 160), ll.public_ref, '') AS detail_summary,
              ll.ip AS ip_address,
              ll.user_agent AS user_agent,
              CAST(JSON_OBJECT('public_ref', ll.public_ref, 'intent', ll.intent, 'source', ll.source, 'related_type', ll.related_type, 'related_ref', ll.related_ref) AS CHAR(8000)) AS payload_json
              FROM lead_logs ll WHERE 1=1 ${wh}`,
        params: p,
      });
    } catch (e) {
      if (e.code !== 'ER_NO_SUCH_TABLE') console.warn('[activityFeed] lead_logs:', e.message);
    }
  }

  if (!branches.length) {
    return { rows: [], total: 0, page, limit, totalPages: 0 };
  }

  const innerSql = branches.map((b) => `(${b.sql})`).join(' UNION ALL ');
  const allParams = branches.flatMap((b) => b.params);
  // NOTE: limit & offset are already sanitized integers above. mysql2 v3.11+
  // refuses LIMIT/OFFSET as prepared-statement params (ER_WRONG_ARGUMENTS),
  // so we inline them — safe because they're clamped ints, not user input.
  const [rows] = await pool.execute(
    `SELECT * FROM (${innerSql}) AS merged ORDER BY merged.occurred_at DESC LIMIT ${limit} OFFSET ${offset}`,
    allParams,
  );

  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
  return { rows, total, page, limit, totalPages };
}

module.exports = { queryActivityFeed };
