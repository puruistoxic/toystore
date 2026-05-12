/**
 * Admin API for DigiDukaanLive storefront: paid checkout orders, customers,
 * and legacy cart-based order requests (cart_enquiries).
 *
 * Mounted under the same prefix as routes/admin.js — paths are /store/...
 */
const express = require('express');
const { getPool } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logAudit } = require('../middleware/auditLog');
const { logSiteActivity } = require('../services/siteActivityLog');

const router = express.Router();

// Permission helpers (admin is implicitly allowed inside requireRole).
const canViewOrders = requireRole('order_processor', 'content_manager', 'viewer');
const canManageOrders = requireRole('order_processor');

const ORDER_STATUSES = new Set([
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded',
  'failed',
]);
const PAYMENT_STATUSES = new Set(['unpaid', 'paid', 'failed', 'refunded']);
const CART_ENQUIRY_STATUSES = new Set(['new', 'contacted', 'quoted', 'closed']);

function parseJSON(value) {
  if (value && typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}

async function recordOrderEvent(pool, orderId, type, message, meta) {
  try {
    await pool.execute(
      `INSERT INTO order_events (order_id, event_type, message, meta_json) VALUES (?, ?, ?, ?)`,
      [orderId, type, message || null, meta ? JSON.stringify(meta) : null],
    );
  } catch (e) {
    console.error('[AdminStorefront] recordOrderEvent:', e.message);
  }
}

router.use(authenticateToken);

/* -------------------------------------------------------------------------- */
/*  GET /store/dashboard — aggregated metrics for the admin Overview page    */
/* -------------------------------------------------------------------------- */

router.get('/store/dashboard', canViewOrders, async (req, res) => {
  try {
    const pool = getPool();
    const days = Math.min(365, Math.max(1, parseInt(String(req.query.days || '30'), 10) || 30));

    // Resolve window boundaries (UTC ISO date strings cooperate well with MySQL DATE()).
    const now = new Date();
    const periodEnd = new Date(now);
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - days);
    const prevEnd = new Date(periodStart);
    const prevStart = new Date(periodStart);
    prevStart.setDate(prevStart.getDate() - days);

    const fmt = (d) => d.toISOString().slice(0, 19).replace('T', ' ');
    const startSql = fmt(periodStart);
    const endSql = fmt(periodEnd);
    const prevStartSql = fmt(prevStart);
    const prevEndSql = fmt(prevEnd);

    const kpiSql = `
      SELECT
        COALESCE(SUM(CASE WHEN payment_status='paid' THEN total_amount ELSE 0 END), 0) AS revenue,
        COUNT(*) AS order_count,
        COUNT(DISTINCT customer_id) AS unique_customers,
        SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) AS delivered_count
      FROM orders
      WHERE created_at >= ? AND created_at < ?
    `;

    const [
      [curRows],
      [prevRows],
      [statusBreakdownRows],
      [seriesRows],
      [topProductsRows],
      [topPincodesRows],
      [newCustomersCur],
      [newCustomersPrev],
      [queueRows],
      [openCartsRows],
      [last7LeadsRows],
      [totalsRows],
      [openOrderTotalsRow],
    ] = await Promise.all([
      pool.execute(kpiSql, [startSql, endSql]),
      pool.execute(kpiSql, [prevStartSql, prevEndSql]),
      pool.execute(
        `SELECT status, COUNT(*) AS c
           FROM orders
          WHERE created_at >= ? AND created_at < ?
          GROUP BY status`,
        [startSql, endSql],
      ),
      pool.execute(
        `SELECT DATE(created_at) AS d,
                COALESCE(SUM(CASE WHEN payment_status='paid' THEN total_amount ELSE 0 END), 0) AS revenue,
                COUNT(*) AS orders
           FROM orders
          WHERE created_at >= ? AND created_at < ?
          GROUP BY DATE(created_at)
          ORDER BY d ASC`,
        [startSql, endSql],
      ),
      pool.execute(
        `SELECT oi.product_id,
                MAX(oi.product_name) AS product_name,
                MAX(oi.product_slug) AS product_slug,
                MAX(oi.image_url)    AS image_url,
                SUM(oi.quantity)     AS units,
                SUM(oi.line_total)   AS revenue,
                COUNT(DISTINCT oi.order_id) AS order_count
           FROM order_items oi
           JOIN orders o ON o.id = oi.order_id
          WHERE o.created_at >= ? AND o.created_at < ?
            AND o.status NOT IN ('cancelled', 'failed')
          GROUP BY oi.product_id, oi.product_name
          ORDER BY revenue DESC
          LIMIT 6`,
        [startSql, endSql],
      ),
      pool.execute(
        `SELECT COALESCE(delivery_pincode, ship_postal_code) AS pincode,
                MAX(ship_city)  AS city,
                MAX(ship_state) AS state,
                COUNT(*) AS orders,
                COALESCE(SUM(CASE WHEN payment_status='paid' THEN total_amount ELSE 0 END), 0) AS revenue
           FROM orders
          WHERE created_at >= ? AND created_at < ?
            AND COALESCE(delivery_pincode, ship_postal_code) IS NOT NULL
          GROUP BY COALESCE(delivery_pincode, ship_postal_code)
          ORDER BY orders DESC
          LIMIT 5`,
        [startSql, endSql],
      ),
      pool.execute(
        `SELECT COUNT(*) AS c FROM customers WHERE created_at >= ? AND created_at < ?`,
        [startSql, endSql],
      ),
      pool.execute(
        `SELECT COUNT(*) AS c FROM customers WHERE created_at >= ? AND created_at < ?`,
        [prevStartSql, prevEndSql],
      ),
      pool.execute(
        `SELECT
            SUM(CASE WHEN status='pending_payment' THEN 1 ELSE 0 END) AS pending_payment,
            SUM(CASE WHEN status='paid'           THEN 1 ELSE 0 END) AS to_process,
            SUM(CASE WHEN status='processing'     THEN 1 ELSE 0 END) AS to_ship,
            SUM(CASE WHEN status IN ('shipped','out_for_delivery') THEN 1 ELSE 0 END) AS in_transit
           FROM orders`,
      ),
      pool.execute(`SELECT COUNT(*) AS c FROM cart_enquiries WHERE status='new'`),
      pool.execute(
        `SELECT COUNT(*) AS c FROM lead_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      ),
      pool.execute(
        `SELECT
            (SELECT COUNT(*) FROM orders)         AS orders_total,
            (SELECT COUNT(*) FROM customers)      AS customers_total,
            (SELECT COUNT(*) FROM lead_logs)      AS leads_total,
            (SELECT COUNT(*) FROM cart_enquiries) AS carts_total`,
      ),
      pool.execute(
        `SELECT
            COALESCE(SUM(total_amount), 0) AS open_value,
            COUNT(*) AS open_count
           FROM orders
          WHERE status NOT IN ('delivered','cancelled','refunded','failed')`,
      ),
    ]);

    const cur = curRows[0] || {};
    const prev = prevRows[0] || {};

    const safe = (n) => Number(n) || 0;
    const pct = (a, b) => {
      const an = safe(a);
      const bn = safe(b);
      if (!bn) return an > 0 ? 100 : 0;
      return Math.round(((an - bn) / bn) * 100);
    };

    // Backfill the daily series so the sparkline always has `days` data points.
    const seriesByDate = new Map();
    for (const row of seriesRows) {
      const key =
        row.d instanceof Date
          ? row.d.toISOString().slice(0, 10)
          : String(row.d).slice(0, 10);
      seriesByDate.set(key, {
        date: key,
        revenue: Number(row.revenue) || 0,
        orders: Number(row.orders) || 0,
      });
    }
    const series = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(periodEnd);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      series.push(seriesByDate.get(key) || { date: key, revenue: 0, orders: 0 });
    }

    const status_breakdown = {};
    for (const row of statusBreakdownRows) {
      status_breakdown[String(row.status)] = Number(row.c) || 0;
    }

    const revenue = safe(cur.revenue);
    const revenuePrev = safe(prev.revenue);
    const orders = safe(cur.order_count);
    const ordersPrev = safe(prev.order_count);
    const aov = orders ? revenue / orders : 0;
    const aovPrev = ordersPrev ? revenuePrev / ordersPrev : 0;
    const customersNew = safe(newCustomersCur[0]?.c);
    const customersNewPrev = safe(newCustomersPrev[0]?.c);

    const top_products = topProductsRows.map((r) => ({
      product_id: r.product_id != null ? String(r.product_id) : null,
      product_name: r.product_name || 'Untitled',
      product_slug: r.product_slug || null,
      image_url: r.image_url || null,
      units: Number(r.units) || 0,
      revenue: Number(r.revenue) || 0,
      order_count: Number(r.order_count) || 0,
    }));

    const top_pincodes = topPincodesRows.map((r) => ({
      pincode: String(r.pincode || ''),
      city: r.city || null,
      state: r.state || null,
      orders: Number(r.orders) || 0,
      revenue: Number(r.revenue) || 0,
    }));

    const queue = {
      pending_payment: safe(queueRows[0]?.pending_payment),
      to_process: safe(queueRows[0]?.to_process),
      to_ship: safe(queueRows[0]?.to_ship),
      in_transit: safe(queueRows[0]?.in_transit),
      new_cart_requests: safe(openCartsRows[0]?.c),
      new_leads_7d: safe(last7LeadsRows[0]?.c),
    };

    res.json({
      period: { days, from: periodStart.toISOString(), to: periodEnd.toISOString() },
      kpis: {
        revenue: { value: revenue, previous: revenuePrev, delta_pct: pct(revenue, revenuePrev) },
        orders: { value: orders, previous: ordersPrev, delta_pct: pct(orders, ordersPrev) },
        aov: { value: aov, previous: aovPrev, delta_pct: pct(aov, aovPrev) },
        customers_new: {
          value: customersNew,
          previous: customersNewPrev,
          delta_pct: pct(customersNew, customersNewPrev),
        },
        delivered: {
          value: safe(cur.delivered_count),
          previous: safe(prev.delivered_count),
          delta_pct: pct(safe(cur.delivered_count), safe(prev.delivered_count)),
        },
      },
      series,
      status_breakdown,
      top_products,
      top_pincodes,
      queue,
      totals: {
        orders: safe(totalsRows[0]?.orders_total),
        customers: safe(totalsRows[0]?.customers_total),
        leads: safe(totalsRows[0]?.leads_total),
        carts: safe(totalsRows[0]?.carts_total),
        open_orders_value: Number(openOrderTotalsRow[0]?.open_value) || 0,
        open_orders_count: Number(openOrderTotalsRow[0]?.open_count) || 0,
      },
    });
  } catch (e) {
    console.error('[AdminStorefront] dashboard:', e);
    res.status(500).json({ error: 'Failed to load dashboard', message: e.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  GET /store/orders/stats                                                   */
/* -------------------------------------------------------------------------- */

router.get('/store/orders/stats', canViewOrders, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending_payment' THEN 1 ELSE 0 END) AS pending_payment,
        SUM(CASE WHEN status IN ('paid','processing','shipped','out_for_delivery') THEN 1 ELSE 0 END) AS active_fulfillment,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) AS revenue_paid_sum
      FROM orders
    `);
    const s = rows[0] || {};
    res.json({
      total: Number(s.total) || 0,
      pending_payment: Number(s.pending_payment) || 0,
      active_fulfillment: Number(s.active_fulfillment) || 0,
      delivered: Number(s.delivered) || 0,
      cancelled: Number(s.cancelled) || 0,
      revenue_paid_sum: Number(s.revenue_paid_sum) || 0,
    });
  } catch (e) {
    console.error('[AdminStorefront] orders/stats:', e);
    res.status(500).json({ error: 'Failed to load stats', message: e.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  GET /store/orders                                                         */
/* -------------------------------------------------------------------------- */

router.get('/store/orders', canViewOrders, async (req, res) => {
  try {
    const pool = getPool();
    const status = req.query.status ? String(req.query.status) : '';
    const statuses = req.query.statuses ? String(req.query.statuses) : '';
    const payment_status = req.query.payment_status ? String(req.query.payment_status) : '';
    const q = req.query.q ? String(req.query.q).trim() : '';
    const from = req.query.from ? String(req.query.from) : '';
    const to = req.query.to ? String(req.query.to) : '';
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '30'), 10) || 30));
    const offset = Math.max(0, parseInt(String(req.query.offset || '0'), 10) || 0);

    let orderBy = 'o.created_at DESC';
    if (req.query.sort === 'oldest') orderBy = 'o.created_at ASC';
    else if (req.query.sort === 'total_desc') orderBy = 'o.total_amount DESC';
    else if (req.query.sort === 'total_asc') orderBy = 'o.total_amount ASC';

    const where = [];
    const params = [];
    if (status && ORDER_STATUSES.has(status)) {
      where.push('o.status = ?');
      params.push(status);
    }
    if (statuses) {
      const list = statuses
        .split(',')
        .map((s) => s.trim())
        .filter((s) => ORDER_STATUSES.has(s));
      if (list.length) {
        where.push(`o.status IN (${list.map(() => '?').join(',')})`);
        params.push(...list);
      }
    }
    if (payment_status && PAYMENT_STATUSES.has(payment_status)) {
      where.push('o.payment_status = ?');
      params.push(payment_status);
    }
    if (q) {
      const like = `%${q.replace(/%/g, '')}%`;
      where.push(
        '(o.public_ref LIKE ? OR o.contact_email LIKE ? OR o.contact_phone LIKE ? OR o.contact_name LIKE ?)',
      );
      params.push(like, like, like, like);
    }
    if (from) {
      where.push('o.created_at >= ?');
      params.push(from);
    }
    if (to) {
      where.push('o.created_at < ?');
      params.push(to);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS c FROM orders o ${whereSql}`,
      params,
    );
    const total = Number(countRows[0]?.c) || 0;

    const [list] = await pool.execute(
      `SELECT o.id, o.public_ref, o.customer_id, o.contact_email, o.contact_phone, o.contact_name,
              o.status, o.payment_status, o.payment_method, o.total_amount, o.currency, o.created_at,
              o.shipping_carrier, o.tracking_number,
              (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count,
              c.email AS customer_account_email
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       ${whereSql}
       ORDER BY ${orderBy}
       LIMIT ${limit} OFFSET ${offset}`,
      params,
    );

    res.json({ orders: list, total, limit, offset });
  } catch (e) {
    console.error('[AdminStorefront] orders list:', e);
    res.status(500).json({ error: 'Failed to list orders', message: e.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  GET /store/orders/:ref                                                    */
/* -------------------------------------------------------------------------- */

router.get('/store/orders/:ref', canViewOrders, async (req, res) => {
  try {
    const ref = String(req.params.ref || '').trim();
    if (!ref) return res.status(400).json({ error: 'Missing reference' });
    const pool = getPool();
    const [orderRows] = await pool.execute(`SELECT * FROM orders WHERE public_ref = ? LIMIT 1`, [ref]);
    if (!orderRows.length) return res.status(404).json({ error: 'Order not found' });
    const order = orderRows[0];
    const [items] = await pool.execute(
      `SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC`,
      [order.id],
    );
    const [events] = await pool.execute(
      `SELECT id, event_type, message, meta_json, created_at FROM order_events WHERE order_id = ? ORDER BY id DESC LIMIT 50`,
      [order.id],
    );
    let customer = null;
    if (order.customer_id) {
      const [crows] = await pool.execute(
        `SELECT id, email, phone, full_name, email_verified, phone_verified, created_at FROM customers WHERE id = ? LIMIT 1`,
        [order.customer_id],
      );
      customer = crows[0] || null;
    }
    res.json({
      order,
      items,
      events: events.map((e) => ({ ...e, meta_json: parseJSON(e.meta_json) })),
      customer,
    });
  } catch (e) {
    console.error('[AdminStorefront] order detail:', e);
    res.status(500).json({ error: 'Failed to load order', message: e.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  PATCH /store/orders/:ref                                                  */
/* -------------------------------------------------------------------------- */

router.patch('/store/orders/:ref', canManageOrders, async (req, res) => {
  try {
    const ref = String(req.params.ref || '').trim();
    if (!ref) return res.status(400).json({ error: 'Missing reference' });
    const body = req.body || {};
    const pool = getPool();
    const [orderRows] = await pool.execute(`SELECT * FROM orders WHERE public_ref = ? LIMIT 1`, [ref]);
    if (!orderRows.length) return res.status(404).json({ error: 'Order not found' });
    const before = orderRows[0];

    const updates = [];
    const params = [];
    const events = []; // [{ type, message, meta }]

    if (body.status !== undefined) {
      const st = String(body.status);
      if (!ORDER_STATUSES.has(st)) {
        return res.status(400).json({ error: 'Invalid status', allowed: [...ORDER_STATUSES] });
      }
      if (st !== before.status) {
        updates.push('status = ?');
        params.push(st);
        if (st === 'shipped' || st === 'out_for_delivery') {
          updates.push('shipped_at = COALESCE(shipped_at, CURRENT_TIMESTAMP)');
        }
        if (st === 'delivered') {
          updates.push('delivered_at = COALESCE(delivered_at, CURRENT_TIMESTAMP)');
        }
        if (st === 'cancelled') {
          updates.push('cancelled_at = COALESCE(cancelled_at, CURRENT_TIMESTAMP)');
        }
        events.push({
          type: `order.${st}`,
          message: `Status changed to ${st.replace(/_/g, ' ')}`,
          meta: { admin_user: req.user?.username, from: before.status, to: st },
        });
      }
    }

    if (body.payment_status !== undefined) {
      const ps = String(body.payment_status);
      if (!PAYMENT_STATUSES.has(ps)) {
        return res.status(400).json({ error: 'Invalid payment_status', allowed: [...PAYMENT_STATUSES] });
      }
      if (ps !== before.payment_status) {
        updates.push('payment_status = ?');
        params.push(ps);
        if (ps === 'paid') {
          updates.push('paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP)');
        }
        events.push({
          type: `payment.${ps}`,
          message: `Payment status set to ${ps}`,
          meta: { admin_user: req.user?.username, from: before.payment_status, to: ps },
        });
      }
    }

    if (body.notes !== undefined) {
      const notes = body.notes === null ? null : String(body.notes).slice(0, 65000);
      updates.push('notes = ?');
      params.push(notes);
    }

    const shipFieldChanged = {};
    for (const [field, max] of [
      ['shipping_carrier', 120],
      ['tracking_number', 120],
      ['tracking_url', 500],
    ]) {
      if (body[field] !== undefined) {
        const next = body[field] === null ? null : String(body[field]).trim().slice(0, max) || null;
        if (next !== before[field]) {
          updates.push(`${field} = ?`);
          params.push(next);
          shipFieldChanged[field] = next;
        }
      }
    }
    if (Object.keys(shipFieldChanged).length) {
      events.push({
        type: 'order.tracking_updated',
        message: 'Tracking details updated',
        meta: { admin_user: req.user?.username, ...shipFieldChanged },
      });
    }

    if (!updates.length) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(before.id);
    await pool.execute(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, params);

    const [afterRows] = await pool.execute(`SELECT * FROM orders WHERE id = ? LIMIT 1`, [before.id]);
    const after = afterRows[0];

    for (const ev of events) {
      await recordOrderEvent(pool, before.id, ev.type, ev.message, ev.meta);
    }
    if (!events.length) {
      await recordOrderEvent(pool, before.id, 'admin_update', 'Order updated from admin console', {
        admin_user: req.user?.username,
      });
    }

    await logAudit(req, 'UPDATE', 'store_order', String(after.id), after.public_ref, {
      before: {
        status: before.status,
        payment_status: before.payment_status,
        shipping_carrier: before.shipping_carrier,
        tracking_number: before.tracking_number,
      },
      after: {
        status: after.status,
        payment_status: after.payment_status,
        shipping_carrier: after.shipping_carrier,
        tracking_number: after.tracking_number,
        notes: !!after.notes,
      },
    });

    void logSiteActivity({
      customer_id: after.customer_id || null,
      email: after.contact_email || null,
      phone: after.contact_phone || null,
      actor_label: req.user?.username || 'admin',
      action: 'admin_order_update',
      category: 'orders',
      summary: events.length
        ? events.map((e) => e.message).join(' · ')
        : 'Order updated from admin console',
      entity_type: 'store_order',
      entity_id: after.public_ref,
      meta: {
        admin_user: req.user?.username,
        before: { status: before.status, payment_status: before.payment_status },
        after: { status: after.status, payment_status: after.payment_status },
      },
      req,
    });

    res.json({ success: true, order: after });
  } catch (e) {
    console.error('[AdminStorefront] order patch:', e);
    res.status(500).json({ error: 'Failed to update order', message: e.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  POST /store/orders/:ref/refund — mark refund + record event              */
/* -------------------------------------------------------------------------- */

router.post('/store/orders/:ref/refund', canManageOrders, async (req, res) => {
  try {
    const ref = String(req.params.ref || '').trim();
    if (!ref) return res.status(400).json({ error: 'Missing reference' });
    const pool = getPool();
    const [orderRows] = await pool.execute(`SELECT * FROM orders WHERE public_ref = ? LIMIT 1`, [ref]);
    if (!orderRows.length) return res.status(404).json({ error: 'Order not found' });
    const order = orderRows[0];

    const reason = req.body?.reason ? String(req.body.reason).slice(0, 500) : null;
    const method = req.body?.method ? String(req.body.method).slice(0, 60) : null;
    let amount = req.body?.amount != null ? Number(req.body.amount) : Number(order.total_amount) || 0;
    if (!Number.isFinite(amount) || amount < 0) amount = 0;
    if (amount > Number(order.total_amount)) amount = Number(order.total_amount);

    await pool.execute(
      `UPDATE orders
         SET status = 'refunded',
             payment_status = 'refunded',
             refund_amount = ?,
             refund_reason = ?,
             refunded_at = COALESCE(refunded_at, CURRENT_TIMESTAMP)
       WHERE id = ?`,
      [amount, reason, order.id],
    );

    await recordOrderEvent(pool, order.id, 'order.refunded', `Refund of ₹${amount} marked`, {
      admin_user: req.user?.username,
      amount,
      reason,
      method,
    });

    await logAudit(req, 'REFUND', 'store_order', String(order.id), order.public_ref, {
      amount,
      reason,
      method,
    });

    void logSiteActivity({
      customer_id: order.customer_id || null,
      email: order.contact_email || null,
      phone: order.contact_phone || null,
      actor_label: req.user?.username || 'admin',
      action: 'order_refunded',
      category: 'orders',
      summary: `Refund ₹${amount}${reason ? ` (${reason})` : ''}`,
      entity_type: 'store_order',
      entity_id: order.public_ref,
      meta: { amount, reason, method, admin_user: req.user?.username },
      req,
    });

    const [afterRows] = await pool.execute(`SELECT * FROM orders WHERE id = ? LIMIT 1`, [order.id]);
    res.json({ success: true, order: afterRows[0] });
  } catch (e) {
    console.error('[AdminStorefront] order refund:', e);
    res.status(500).json({ error: 'Failed to refund order', message: e.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  POST /store/orders/:ref/events — append a custom timeline note            */
/* -------------------------------------------------------------------------- */

router.post('/store/orders/:ref/events', canManageOrders, async (req, res) => {
  try {
    const ref = String(req.params.ref || '').trim();
    const message = req.body?.message ? String(req.body.message).trim().slice(0, 500) : '';
    if (!ref) return res.status(400).json({ error: 'Missing reference' });
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const visibility = req.body?.visibility === 'customer' ? 'customer' : 'internal';
    const pool = getPool();
    const [rows] = await pool.execute(`SELECT id, public_ref FROM orders WHERE public_ref = ? LIMIT 1`, [ref]);
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];

    await recordOrderEvent(
      pool,
      order.id,
      visibility === 'customer' ? 'order.note_public' : 'order.note_internal',
      message,
      { admin_user: req.user?.username, visibility },
    );

    await logAudit(req, 'NOTE', 'store_order', String(order.id), order.public_ref, {
      visibility,
      preview: message.slice(0, 120),
    });

    res.json({ success: true });
  } catch (e) {
    console.error('[AdminStorefront] order event add:', e);
    res.status(500).json({ error: 'Failed to add event', message: e.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  GET /store/customers                                                      */
/* -------------------------------------------------------------------------- */

router.get('/store/customers', canViewOrders, async (req, res) => {
  try {
    const pool = getPool();
    const q = req.query.q ? String(req.query.q).trim() : '';
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '40'), 10) || 40));
    const offset = Math.max(0, parseInt(String(req.query.offset || '0'), 10) || 0);

    const where = [];
    const params = [];
    if (q) {
      const like = `%${q.replace(/%/g, '')}%`;
      where.push('(c.email LIKE ? OR c.phone LIKE ? OR c.full_name LIKE ?)');
      params.push(like, like, like);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS c FROM customers c ${whereSql}`,
      params,
    );
    const total = Number(countRows[0]?.c) || 0;

    const [rows] = await pool.execute(
      `SELECT c.*,
        (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS order_count
       FROM customers c
       ${whereSql}
       ORDER BY c.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params,
    );

    res.json({ customers: rows, total, limit, offset });
  } catch (e) {
    console.error('[AdminStorefront] customers list:', e);
    res.status(500).json({ error: 'Failed to list customers', message: e.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  GET /store/customers/:id                                                 */
/* -------------------------------------------------------------------------- */

router.get('/store/customers/:id', canViewOrders, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    const pool = getPool();
    const [crows] = await pool.execute(`SELECT * FROM customers WHERE id = ? LIMIT 1`, [id]);
    if (!crows.length) return res.status(404).json({ error: 'Customer not found' });
    const customer = crows[0];
    const [orders] = await pool.execute(
      `SELECT id, public_ref, status, payment_status, total_amount, currency, created_at
       FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 30`,
      [id],
    );
    const [addr] = await pool.execute(
      `SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, id ASC`,
      [id],
    );
    res.json({ customer, orders, addresses: addr });
  } catch (e) {
    console.error('[AdminStorefront] customer detail:', e);
    res.status(500).json({ error: 'Failed to load customer', message: e.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  GET /store/order-requests                                                 */
/* -------------------------------------------------------------------------- */

router.get('/store/order-requests', canViewOrders, async (req, res) => {
  try {
    const pool = getPool();
    const status = req.query.status ? String(req.query.status) : '';
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '40'), 10) || 40));
    const offset = Math.max(0, parseInt(String(req.query.offset || '0'), 10) || 0);

    const where = [];
    const params = [];
    if (status && CART_ENQUIRY_STATUSES.has(status)) {
      where.push('status = ?');
      params.push(status);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS c FROM cart_enquiries ${whereSql}`,
      params,
    );
    const total = Number(countRows[0]?.c) || 0;

    const [rows] = await pool.execute(
      `SELECT * FROM cart_enquiries ${whereSql} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params,
    );

    const list = rows.map((r) => {
      let itemCount = 0;
      const items = parseJSON(r.items_json);
      if (Array.isArray(items)) itemCount = items.length;
      return {
        id: r.id,
        public_ref: r.public_ref,
        customer_name: r.customer_name,
        customer_email: r.customer_email,
        customer_phone: r.customer_phone,
        status: r.status,
        created_at: r.created_at,
        item_count: itemCount,
        delivery_pincode: r.delivery_pincode || null,
      };
    });

    res.json({ order_requests: list, total, limit, offset });
  } catch (e) {
    console.error('[AdminStorefront] order-requests list:', e);
    res.status(500).json({ error: 'Failed to list order requests', message: e.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  GET /store/order-requests/:id                                             */
/* -------------------------------------------------------------------------- */

router.get('/store/order-requests/:id', canViewOrders, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    const pool = getPool();
    const [rows] = await pool.execute(`SELECT * FROM cart_enquiries WHERE id = ? LIMIT 1`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const r = rows[0];
    let items = parseJSON(r.items_json);
    if (!Array.isArray(items)) items = [];
    res.json({
      id: r.id,
      public_ref: r.public_ref,
      customer_name: r.customer_name,
      customer_email: r.customer_email,
      customer_phone: r.customer_phone,
      whatsapp_number: r.whatsapp_number,
      custom_message: r.custom_message,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      delivery_pincode: r.delivery_pincode || null,
      items,
    });
  } catch (e) {
    console.error('[AdminStorefront] order-requests detail:', e);
    res.status(500).json({ error: 'Failed to load order request', message: e.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  PATCH /store/order-requests/:id                                           */
/* -------------------------------------------------------------------------- */

router.patch('/store/order-requests/:id', canManageOrders, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    const status = req.body?.status != null ? String(req.body.status) : '';
    if (!CART_ENQUIRY_STATUSES.has(status)) {
      return res.status(400).json({ error: 'Invalid status', allowed: [...CART_ENQUIRY_STATUSES] });
    }
    const pool = getPool();
    const [rows] = await pool.execute(`SELECT id, public_ref, status FROM cart_enquiries WHERE id = ? LIMIT 1`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const before = rows[0];
    await pool.execute(`UPDATE cart_enquiries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
      status,
      id,
    ]);
    await logAudit(req, 'UPDATE', 'cart_enquiry', String(id), before.public_ref || String(id), {
      before: { status: before.status },
      after: { status },
    });
    res.json({ success: true, id, status });
  } catch (e) {
    console.error('[AdminStorefront] order-requests patch:', e);
    res.status(500).json({ error: 'Failed to update', message: e.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  Lead activity stream (lead_logs)                                          */
/* -------------------------------------------------------------------------- */

const LEAD_STATUSES = new Set(['new', 'followed_up', 'closed']);
const LEAD_CHANNELS = new Set([
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

router.get('/store/leads/stats', canViewOrders, async (req, res) => {
  try {
    const pool = getPool();
    const [byChan] = await pool.execute(
      `SELECT channel, COUNT(*) AS c FROM lead_logs GROUP BY channel`,
    );
    const [byStatus] = await pool.execute(
      `SELECT status, COUNT(*) AS c FROM lead_logs GROUP BY status`,
    );
    const [recent] = await pool.execute(
      `SELECT COUNT(*) AS c FROM lead_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    );
    res.json({
      by_channel: byChan,
      by_status: byStatus,
      last_7_days: Number(recent[0]?.c) || 0,
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load lead stats', message: e.message });
  }
});

router.get('/store/leads', canViewOrders, async (req, res) => {
  try {
    const pool = getPool();
    const channel = req.query.channel ? String(req.query.channel) : '';
    const status = req.query.status ? String(req.query.status) : '';
    const q = req.query.q ? String(req.query.q).trim() : '';
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '50'), 10) || 50));
    const offset = Math.max(0, parseInt(String(req.query.offset || '0'), 10) || 0);

    const where = [];
    const params = [];
    if (channel && LEAD_CHANNELS.has(channel)) {
      where.push('channel = ?');
      params.push(channel);
    }
    if (status && LEAD_STATUSES.has(status)) {
      where.push('status = ?');
      params.push(status);
    }
    if (q) {
      const like = `%${q.replace(/%/g, '')}%`;
      where.push(
        '(public_ref LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ? OR product_name LIKE ? OR related_ref LIKE ?)',
      );
      params.push(like, like, like, like, like, like);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS c FROM lead_logs ${whereSql}`,
      params,
    );
    const total = Number(countRows[0]?.c) || 0;
    const [rows] = await pool.execute(
      `SELECT id, public_ref, channel, source, intent,
              product_name, product_slug,
              customer_name, customer_email, customer_phone,
              whatsapp_number, page_url, delivery_pincode,
              related_type, related_ref, status, created_at
       FROM lead_logs
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params,
    );
    res.json({ leads: rows, total, limit, offset });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list leads', message: e.message });
  }
});

router.get('/store/leads/:id', canViewOrders, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    const pool = getPool();
    const [rows] = await pool.execute(`SELECT * FROM lead_logs WHERE id = ? LIMIT 1`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const r = rows[0];
    r.context_json = parseJSON(r.context_json);
    res.json(r);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load lead', message: e.message });
  }
});

router.patch('/store/leads/:id', canManageOrders, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    const pool = getPool();
    const updates = [];
    const params = [];
    if (req.body?.status != null) {
      const s = String(req.body.status);
      if (!LEAD_STATUSES.has(s)) {
        return res.status(400).json({ error: 'Invalid status', allowed: [...LEAD_STATUSES] });
      }
      updates.push('status = ?');
      params.push(s);
    }
    if (req.body?.notes !== undefined) {
      updates.push('notes = ?');
      params.push(req.body.notes == null ? null : String(req.body.notes).slice(0, 65000));
    }
    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
    params.push(id);
    await pool.execute(`UPDATE lead_logs SET ${updates.join(', ')} WHERE id = ?`, params);
    await logAudit(req, 'UPDATE', 'lead_log', String(id), null, req.body);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update lead', message: e.message });
  }
});

module.exports = router;
