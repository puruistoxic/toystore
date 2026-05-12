/**
 * Storefront orders router.
 *
 * Mounted at /api/orders.
 *
 * Flow:
 *   1. POST   /checkout          \u2014 customer (guest or signed-in) submits cart
 *                                 items + contact + shipping address. Server
 *                                 prices items from the DB (never trust the
 *                                 client), creates an `orders` row with
 *                                 status='pending_payment', and returns the
 *                                 order public_ref + amount.
 *   2. POST   /:ref/pay          \u2014 creates a Razorpay order for the same
 *                                 amount, stores razorpay_order_id, returns
 *                                 { key_id, razorpay_order_id, amount }.
 *   3. POST   /:ref/confirm      \u2014 verifies HMAC signature, marks the order
 *                                 paid (idempotent \u2014 webhook may have done it
 *                                 already), returns the updated order.
 *   4. GET    /:ref              \u2014 public tracking lookup by public_ref
 *                                 (intentionally not authed so the link can
 *                                 be shared / bookmarked).
 *   5. GET    /                  \u2014 list orders for the signed-in customer.
 */
const crypto = require('crypto');
const express = require('express');
const Razorpay = require('razorpay');
const { getPool } = require('../db');
const { optionalCustomer, requireCustomer } = require('../middleware/customerAuth');
const customerAuthRoutes = require('./customerAuth');

const router = express.Router();

const VALID_ORDER_STATUSES = new Set([
  'pending_payment', 'paid', 'processing', 'shipped',
  'out_for_delivery', 'delivered', 'cancelled', 'refunded', 'failed',
]);
const VALID_PAYMENT_STATUSES = new Set(['unpaid', 'paid', 'failed', 'refunded']);

const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

let _rzp = null;
function getRzp() {
  if (!RZP_KEY_ID || !RZP_KEY_SECRET) return null;
  if (!_rzp) _rzp = new Razorpay({ key_id: RZP_KEY_ID, key_secret: RZP_KEY_SECRET });
  return _rzp;
}

function generateOrderRef() {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `KTS-${ymd}-${rand}`;
}

function parseJSON(value) {
  if (value && typeof value === 'string') {
    try { return JSON.parse(value); } catch { return null; }
  }
  return value;
}

async function recordEvent(pool, orderId, type, message, meta) {
  try {
    await pool.execute(
      `INSERT INTO order_events (order_id, event_type, message, meta_json) VALUES (?, ?, ?, ?)`,
      [orderId, type, message || null, meta ? JSON.stringify(meta) : null],
    );
  } catch (err) {
    console.error('[Orders] recordEvent failed:', err.message);
  }
}

/** Load order + items + (recent) events, by public_ref. */
async function loadOrderByRef(pool, ref) {
  const [orderRows] = await pool.execute(
    `SELECT * FROM orders WHERE public_ref = ? LIMIT 1`,
    [ref],
  );
  if (!orderRows.length) return null;
  const order = orderRows[0];
  const [items] = await pool.execute(
    `SELECT id, product_id, product_slug, product_name, brand, unit_price, quantity, line_total, image_url, line_note
     FROM order_items WHERE order_id = ? ORDER BY id ASC`,
    [order.id],
  );
  const [events] = await pool.execute(
    `SELECT id, event_type, message, meta_json, created_at FROM order_events WHERE order_id = ? ORDER BY id DESC LIMIT 20`,
    [order.id],
  );
  return {
    order,
    items,
    events: events.map((e) => ({ ...e, meta_json: parseJSON(e.meta_json) })),
  };
}

function shippableOrder(order, items, events) {
  return {
    public_ref: order.public_ref,
    customer_id: order.customer_id,
    contact: {
      email: order.contact_email,
      phone: order.contact_phone,
      name: order.contact_name,
    },
    shipping_address: order.ship_line1
      ? {
          full_name: order.ship_full_name,
          phone: order.ship_phone,
          line1: order.ship_line1,
          line2: order.ship_line2,
          landmark: order.ship_landmark,
          city: order.ship_city,
          state: order.ship_state,
          postal_code: order.ship_postal_code,
          country: order.ship_country,
        }
      : null,
    amounts: {
      subtotal: Number(order.subtotal_amount),
      shipping: Number(order.shipping_amount),
      discount: Number(order.discount_amount),
      tax: Number(order.tax_amount),
      total: Number(order.total_amount),
      currency: order.currency,
    },
    status: order.status,
    payment_status: order.payment_status,
    payment: {
      method: order.payment_method,
      razorpay_order_id: order.razorpay_order_id,
      razorpay_payment_id: order.razorpay_payment_id,
      paid_at: order.paid_at,
    },
    notes: order.notes,
    custom_message: order.custom_message,
    delivery_pincode: order.delivery_pincode,
    created_at: order.created_at,
    updated_at: order.updated_at,
    items: items.map((it) => ({
      ...it,
      unit_price: Number(it.unit_price),
      line_total: Number(it.line_total),
    })),
    events,
  };
}

/* -------------------------------------------------------------------------- */
/*  POST /api/orders/checkout                                                 */
/* -------------------------------------------------------------------------- */

router.post('/checkout', optionalCustomer, async (req, res) => {
  try {
    const pool = getPool();
    const b = req.body || {};

    const items = Array.isArray(b.items) ? b.items : [];
    if (!items.length) return res.status(400).json({ error: 'Cart is empty' });

    const contact = b.contact || {};
    const email = (contact.email || '').trim().toLowerCase();
    // Store as digits-only so customer↔order linking is reliable. The
    // user-facing/shipping phone (ship_phone) preserves the original format.
    const phone = String(contact.phone || '').replace(/\D/g, '');
    const name = (contact.name || '').trim();
    if (!email && !phone) {
      return res.status(400).json({ error: 'Provide at least an email or phone for contact.' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const ship = b.shipping_address || {};
    const shipRequired = ['full_name', 'phone', 'line1', 'city', 'state', 'postal_code'];
    for (const k of shipRequired) {
      if (!ship[k] || !String(ship[k]).trim()) {
        return res.status(400).json({ error: `Shipping ${k.replace('_', ' ')} is required` });
      }
    }

    // ---- Server-side pricing: fetch authoritative prices from `products`.
    // Items the client sends may include unit_price as a hint; we IGNORE it
    // when a DB price is available. This prevents tampering.
    const productIds = items.map((i) => i.product_id).filter(Boolean).map(String);
    let priceMap = new Map();
    if (productIds.length) {
      const placeholders = productIds.map(() => '?').join(',');
      try {
        const [pRows] = await pool.execute(
          `SELECT id, slug, name, brand, price, images FROM products WHERE id IN (${placeholders})`,
          productIds,
        );
        priceMap = new Map(pRows.map((p) => [String(p.id), p]));
      } catch (e) {
        console.warn('[Orders] product price lookup failed, falling back to client-provided prices:', e.message);
      }
    }

    let subtotal = 0;
    const finalItems = [];
    for (const it of items) {
      const qty = Math.max(1, Math.floor(Number(it.quantity) || 1));
      const idStr = it.product_id != null ? String(it.product_id) : null;
      const dbRow = idStr ? priceMap.get(idStr) : null;

      const unitPrice = Number(
        dbRow && dbRow.price != null
          ? dbRow.price
          : it.unit_price != null
          ? it.unit_price
          : 0,
      );
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return res.status(400).json({ error: 'Invalid unit_price for an item' });
      }
      const productName = dbRow?.name || String(it.product_name || '').trim();
      if (!productName) return res.status(400).json({ error: 'Each item needs a product_name' });

      let imageUrl = it.image_url || null;
      if (!imageUrl && dbRow?.images) {
        const imgs = parseJSON(dbRow.images);
        if (Array.isArray(imgs) && imgs.length) imageUrl = imgs[0];
      }

      const lineTotal = +(unitPrice * qty).toFixed(2);
      subtotal += lineTotal;

      finalItems.push({
        product_id: idStr,
        product_slug: dbRow?.slug || it.product_slug || null,
        product_name: productName.slice(0, 500),
        brand: dbRow?.brand || it.brand || null,
        unit_price: unitPrice,
        quantity: qty,
        line_total: lineTotal,
        image_url: imageUrl || null,
        line_note: it.line_note ? String(it.line_note).slice(0, 500) : null,
      });
    }

    subtotal = +subtotal.toFixed(2);
    const shipping = +(Number(b.shipping_amount) || 0).toFixed(2);
    const discount = +(Number(b.discount_amount) || 0).toFixed(2);
    const tax = +(Number(b.tax_amount) || 0).toFixed(2);
    const total = +(subtotal + shipping + tax - discount).toFixed(2);
    if (total < 1) {
      return res.status(400).json({ error: 'Order total must be at least \u20b91.' });
    }

    // Allocate a public_ref + insert
    let publicRef = null;
    let orderId = null;
    for (let i = 0; i < 8; i++) {
      publicRef = generateOrderRef();
      try {
        const [r] = await pool.execute(
          `INSERT INTO orders (
            public_ref, customer_id,
            contact_email, contact_phone, contact_name,
            ship_full_name, ship_phone, ship_line1, ship_line2, ship_landmark,
            ship_city, ship_state, ship_postal_code, ship_country,
            subtotal_amount, shipping_amount, discount_amount, tax_amount, total_amount, currency,
            status, payment_status,
            notes, custom_message, delivery_pincode
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment', 'unpaid', ?, ?, ?)`,
          [
            publicRef,
            req.customer?.id || null,
            email || null,
            phone || null,
            name || null,
            String(ship.full_name).slice(0, 255),
            String(ship.phone).replace(/\s+/g, '').slice(0, 20),
            String(ship.line1).slice(0, 255),
            ship.line2 ? String(ship.line2).slice(0, 255) : null,
            ship.landmark ? String(ship.landmark).slice(0, 255) : null,
            String(ship.city).slice(0, 120),
            String(ship.state).slice(0, 120),
            String(ship.postal_code).replace(/\s+/g, '').slice(0, 20),
            (ship.country || 'India').toString().slice(0, 120),
            subtotal,
            shipping,
            discount,
            tax,
            total,
            'INR',
            b.notes ? String(b.notes).slice(0, 1000) : null,
            b.custom_message ? String(b.custom_message).slice(0, 2000) : null,
            b.delivery_pincode ? String(b.delivery_pincode).replace(/\s+/g, '').slice(0, 20) : null,
          ],
        );
        orderId = r.insertId;
        break;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') continue;
        throw err;
      }
    }
    if (!orderId) return res.status(500).json({ error: 'Could not allocate order reference' });

    // Insert items
    for (const it of finalItems) {
      await pool.execute(
        `INSERT INTO order_items (
          order_id, product_id, product_slug, product_name, brand,
          unit_price, quantity, line_total, image_url, line_note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          it.product_id,
          it.product_slug,
          it.product_name,
          it.brand,
          it.unit_price,
          it.quantity,
          it.line_total,
          it.image_url,
          it.line_note,
        ],
      );
    }

    await recordEvent(pool, orderId, 'order.created', 'Order created (pending payment)', {
      subtotal,
      shipping,
      discount,
      tax,
      total,
      item_count: finalItems.length,
    });

    try {
      const { logLead } = require('../services/leadLogger');
      await logLead({
        channel: 'order',
        source: 'api:/orders/checkout',
        intent: 'checkout',
        contact: { name, email, phone },
        message: b.custom_message ? String(b.custom_message).slice(0, 2000) : null,
        delivery_pincode: b.delivery_pincode || null,
        related_type: 'order',
        related_ref: publicRef,
        customer_id: req.customer?.id || null,
        context: { total, currency: 'INR', item_count: finalItems.length },
        req,
      });
    } catch (e) {
      console.warn('[leadLogger] order checkout mirror failed:', e.message);
    }

    const data = await loadOrderByRef(pool, publicRef);
    return res.status(201).json({ success: true, order: shippableOrder(data.order, data.items, data.events) });
  } catch (err) {
    console.error('[Orders] checkout failed:', err);
    return res.status(500).json({ error: 'Could not create order' });
  }
});

/* -------------------------------------------------------------------------- */
/*  POST /api/orders/:ref/pay  \u2014 create Razorpay order, return checkout opts */
/* -------------------------------------------------------------------------- */

router.post('/:ref/pay', async (req, res) => {
  try {
    const ref = String(req.params.ref || '').trim();
    if (!/^[A-Za-z0-9-]+$/.test(ref)) return res.status(400).json({ error: 'Invalid reference' });
    const rzp = getRzp();
    if (!rzp) return res.status(500).json({ error: 'Razorpay not configured' });

    const pool = getPool();
    const [rows] = await pool.execute(`SELECT * FROM orders WHERE public_ref = ? LIMIT 1`, [ref]);
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];

    if (order.payment_status === 'paid') {
      return res.status(409).json({ error: 'Order is already paid', already_paid: true });
    }

    const amountPaise = Math.round(Number(order.total_amount) * 100);
    if (amountPaise < 100) return res.status(400).json({ error: 'Order amount too low for online payment' });

    // Re-use existing Razorpay order if one is already attached and still 'created'.
    if (order.razorpay_order_id) {
      try {
        const existing = await rzp.orders.fetch(order.razorpay_order_id);
        if (existing && existing.status === 'created' && Number(existing.amount) === amountPaise) {
          return res.json({
            key_id: RZP_KEY_ID,
            razorpay_order_id: existing.id,
            amount: existing.amount,
            currency: existing.currency,
            order_ref: order.public_ref,
            prefill: {
              name: order.ship_full_name || order.contact_name || undefined,
              email: order.contact_email || undefined,
              contact: order.ship_phone || order.contact_phone || undefined,
            },
          });
        }
      } catch (e) {
        console.warn('[Orders] could not reuse Razorpay order, creating fresh:', e.message);
      }
    }

    const rzpOrder = await rzp.orders.create({
      amount: amountPaise,
      currency: order.currency || 'INR',
      receipt: order.public_ref.slice(0, 40),
      notes: {
        order_ref: order.public_ref,
        customer_id: order.customer_id ? String(order.customer_id) : '',
      },
    });

    await pool.execute(
      `UPDATE orders SET razorpay_order_id = ? WHERE id = ?`,
      [rzpOrder.id, order.id],
    );
    await recordEvent(pool, order.id, 'razorpay.order_created', null, {
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
    });

    return res.json({
      key_id: RZP_KEY_ID,
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      order_ref: order.public_ref,
      prefill: {
        name: order.ship_full_name || order.contact_name || undefined,
        email: order.contact_email || undefined,
        contact: order.ship_phone || order.contact_phone || undefined,
      },
    });
  } catch (err) {
    console.error('[Orders] pay failed:', err);
    return res.status(500).json({ error: 'Could not start payment' });
  }
});

/* -------------------------------------------------------------------------- */
/*  POST /api/orders/:ref/confirm  \u2014 verify signature & mark paid           */
/* -------------------------------------------------------------------------- */

async function markOrderPaid(pool, orderId, { paymentId, signature, method }) {
  await pool.execute(
    `UPDATE orders
     SET payment_status = 'paid',
         status = CASE WHEN status = 'pending_payment' THEN 'paid' ELSE status END,
         razorpay_payment_id = ?,
         razorpay_signature = COALESCE(?, razorpay_signature),
         payment_method = COALESCE(?, payment_method),
         paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP)
     WHERE id = ?`,
    [paymentId, signature || null, method || null, orderId],
  );
}

router.post('/:ref/confirm', async (req, res) => {
  try {
    const ref = String(req.params.ref || '').trim();
    if (!/^[A-Za-z0-9-]+$/.test(ref)) return res.status(400).json({ error: 'Invalid reference' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment fields' });
    }
    if (!RZP_KEY_SECRET) return res.status(500).json({ error: 'Razorpay not configured' });

    const pool = getPool();
    const [rows] = await pool.execute(`SELECT * FROM orders WHERE public_ref = ? LIMIT 1`, [ref]);
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];

    if (order.razorpay_order_id && order.razorpay_order_id !== razorpay_order_id) {
      return res.status(400).json({ error: 'Razorpay order_id does not match this order' });
    }

    const expected = crypto
      .createHmac('sha256', RZP_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    let valid = false;
    try {
      const a = Buffer.from(expected, 'hex');
      const b = Buffer.from(String(razorpay_signature), 'hex');
      valid = a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch { valid = false; }
    if (!valid) {
      await recordEvent(pool, order.id, 'payment.signature_invalid', 'Signature mismatch', {
        razorpay_order_id, razorpay_payment_id,
      });
      return res.status(400).json({ error: 'Invalid payment signature', verified: false });
    }

    await markOrderPaid(pool, order.id, {
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });
    await recordEvent(pool, order.id, 'payment.captured', 'Payment confirmed by client signature', {
      razorpay_order_id, razorpay_payment_id,
    });

    try {
      const { logSiteActivity } = require('../services/siteActivityLog');
      void logSiteActivity({
        customer_id: order.customer_id || null,
        email: order.contact_email || null,
        phone: order.contact_phone || null,
        actor_label: order.contact_name || order.ship_full_name || null,
        action: 'payment_confirmed',
        category: 'orders',
        summary: `Order ${ref} payment confirmed`,
        entity_type: 'order',
        entity_id: ref,
        meta: { razorpay_payment_id, razorpay_order_id },
        req,
      });
    } catch (e) {
      /* non-fatal */
    }

    const data = await loadOrderByRef(pool, ref);
    return res.json({ verified: true, order: shippableOrder(data.order, data.items, data.events) });
  } catch (err) {
    console.error('[Orders] confirm failed:', err);
    return res.status(500).json({ error: 'Could not confirm payment' });
  }
});

/* -------------------------------------------------------------------------- */
/*  GET /api/orders/stats \u2014 dashboard counters for the signed-in customer   */
/*                                                                            */
/*  IMPORTANT: this must be declared BEFORE the catch-all GET /:ref handler   */
/*  below, otherwise Express will match "stats" as a :ref parameter and 404.  */
/* -------------------------------------------------------------------------- */

router.get('/stats', requireCustomer, async (req, res) => {
  try {
    const pool = getPool();
    await lazyClaimForCustomer(pool, req.customer.id);

    const range = (req.query.range || '').toString();
    const dateFilter = RANGE_DAYS[range]
      ? ` AND created_at >= (NOW() - INTERVAL ${RANGE_DAYS[range]} DAY)`
      : '';

    const [byStatus] = await pool.execute(
      `SELECT status, COUNT(*) AS c
       FROM orders WHERE customer_id = ?${dateFilter}
       GROUP BY status`,
      [req.customer.id],
    );
    const [byPayment] = await pool.execute(
      `SELECT payment_status, COUNT(*) AS c
       FROM orders WHERE customer_id = ?${dateFilter}
       GROUP BY payment_status`,
      [req.customer.id],
    );
    const [[totals]] = await pool.execute(
      `SELECT
         COUNT(*) AS total_orders,
         COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) AS lifetime_spent,
         COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) AS paid_orders,
         COUNT(CASE WHEN status = 'pending_payment' THEN 1 END) AS pending_payment_orders
       FROM orders WHERE customer_id = ?${dateFilter}`,
      [req.customer.id],
    );

    const statusCounts = {};
    for (const row of byStatus) statusCounts[row.status] = Number(row.c);
    const paymentCounts = {};
    for (const row of byPayment) paymentCounts[row.payment_status] = Number(row.c);

    res.json({
      total_orders: Number(totals.total_orders) || 0,
      paid_orders: Number(totals.paid_orders) || 0,
      pending_payment_orders: Number(totals.pending_payment_orders) || 0,
      lifetime_spent: Number(totals.lifetime_spent) || 0,
      status_counts: statusCounts,
      payment_counts: paymentCounts,
    });
  } catch (err) {
    console.error('[Orders] stats failed:', err);
    res.status(500).json({ error: 'Could not load order stats' });
  }
});

/* -------------------------------------------------------------------------- */
/*  GET /api/orders/:ref \u2014 public tracking (link is the credential)         */
/* -------------------------------------------------------------------------- */

router.get('/:ref', optionalCustomer, async (req, res) => {
  try {
    const ref = String(req.params.ref || '').trim();
    if (!/^[A-Za-z0-9-]+$/.test(ref)) return res.status(400).json({ error: 'Invalid reference' });
    const pool = getPool();
    const data = await loadOrderByRef(pool, ref);
    if (!data) return res.status(404).json({ error: 'Order not found' });

    // If the order belongs to a customer, only return full details to:
    //   - the matching signed-in customer, OR
    //   - anyone with the public_ref (the tracking link itself is the cred).
    // We currently allow anyone with the ref to see it (matches existing
    // /order-request/:ref behaviour); the customer-only constraint here is
    // a future tightening point.
    return res.json({ order: shippableOrder(data.order, data.items, data.events) });
  } catch (err) {
    console.error('[Orders] get failed:', err);
    return res.status(500).json({ error: 'Could not load order' });
  }
});

/* -------------------------------------------------------------------------- */
/*  GET /api/orders \u2014 list orders for signed-in customer                    */
/*                                                                            */
/*  Query params (all optional):                                              */
/*    status            one of VALID_ORDER_STATUSES                           */
/*    payment_status    one of VALID_PAYMENT_STATUSES                         */
/*    q                 free-text match against public_ref (case insensitive) */
/*    page              1-based page (default 1)                              */
/*    limit             page size (default 20, max 100)                       */
/*                                                                            */
/*  Before reading, we run a "lazy claim" so any guest orders whose contact   */
/*  email/phone matches the signed-in customer get linked in. Safe to run on  */
/*  every request \u2014 it's a single indexed UPDATE that no-ops after first run. */
/* -------------------------------------------------------------------------- */

async function lazyClaimForCustomer(pool, customerId) {
  if (!customerId) return;
  try {
    const [rows] = await pool.execute(
      `SELECT email, phone FROM customers WHERE id = ? LIMIT 1`,
      [customerId],
    );
    if (!rows.length) return;
    const claim = customerAuthRoutes.claimGuestOrders;
    if (typeof claim === 'function') {
      await claim(pool, {
        customerId,
        email: rows[0].email,
        phone: rows[0].phone,
      });
    }
  } catch (e) {
    console.warn('[Orders] lazyClaimForCustomer warning:', e.message);
  }
}

const SORT_OPTIONS = {
  newest: 'id DESC',
  oldest: 'id ASC',
  highest: 'total_amount DESC, id DESC',
  lowest: 'total_amount ASC, id DESC',
};

const RANGE_DAYS = { '30d': 30, '90d': 90, '180d': 180, '365d': 365 };

router.get('/', requireCustomer, async (req, res) => {
  try {
    const pool = getPool();
    await lazyClaimForCustomer(pool, req.customer.id);

    const where = ['customer_id = ?'];
    const params = [req.customer.id];

    const status = (req.query.status || '').toString();
    if (status && VALID_ORDER_STATUSES.has(status)) {
      where.push('status = ?');
      params.push(status);
    }

    const paymentStatus = (req.query.payment_status || '').toString();
    if (paymentStatus && VALID_PAYMENT_STATUSES.has(paymentStatus)) {
      where.push('payment_status = ?');
      params.push(paymentStatus);
    }

    const q = (req.query.q || '').toString().trim();
    if (q) {
      where.push('public_ref LIKE ?');
      params.push(`%${q.replace(/[%_]/g, '\\$&').toUpperCase()}%`);
    }

    // Date range — either ?range=30d/90d/180d/365d OR explicit ?from / ?to
    const range = (req.query.range || '').toString();
    if (RANGE_DAYS[range]) {
      // RANGE_DAYS is a server-controlled allowlist of integers, safe to
      // inline. MySQL's `INTERVAL N DAY` does not always accept a bound
      // parameter in prepared statements (varies by version), so we inject
      // the validated integer here directly.
      where.push(`created_at >= (NOW() - INTERVAL ${RANGE_DAYS[range]} DAY)`);
    } else {
      const from = (req.query.from || '').toString().trim();
      const to = (req.query.to || '').toString().trim();
      const dateOk = (s) => /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?)?$/.test(s);
      if (from && dateOk(from)) {
        where.push('created_at >= ?');
        params.push(from);
      }
      if (to && dateOk(to)) {
        where.push('created_at <= ?');
        params.push(to.length === 10 ? `${to} 23:59:59` : to);
      }
    }

    const sortParam = (req.query.sort || 'newest').toString();
    const orderBy = SORT_OPTIONS[sortParam] || SORT_OPTIONS.newest;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // Count
    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM orders ${whereSql}`,
      params,
    );

    // List. We avoid pool.execute() for LIMIT/OFFSET (some mysql2 versions
    // refuse them as prepared params with non-numeric types) and inline
    // them (along with the validated ORDER BY) after Number-coercion above
    // so they're guaranteed-safe.
    const [rows] = await pool.query(
      `SELECT id, public_ref, status, payment_status,
              subtotal_amount, total_amount, currency,
              razorpay_order_id, razorpay_payment_id,
              created_at, paid_at, cancelled_at,
              ship_city, ship_state, ship_postal_code
       FROM orders ${whereSql}
       ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`,
      params,
    );

    // Pull a few thumbnails per order for the list view.
    const orderIds = rows.map((r) => r.id);
    const thumbsByOrder = new Map();
    const itemCountByOrder = new Map();
    if (orderIds.length) {
      const placeholders = orderIds.map(() => '?').join(',');
      const [items] = await pool.query(
        `SELECT order_id, id, product_name, image_url, quantity, line_total
         FROM order_items
         WHERE order_id IN (${placeholders})
         ORDER BY order_id ASC, id ASC`,
        orderIds,
      );
      for (const it of items) {
        itemCountByOrder.set(it.order_id, (itemCountByOrder.get(it.order_id) || 0) + 1);
        const arr = thumbsByOrder.get(it.order_id) || [];
        if (arr.length < 3) {
          arr.push({
            id: it.id,
            name: it.product_name,
            image_url: it.image_url,
            quantity: it.quantity,
          });
          thumbsByOrder.set(it.order_id, arr);
        }
      }
    }

    res.json({
      page,
      limit,
      total: Number(total) || 0,
      orders: rows.map((r) => ({
        public_ref: r.public_ref,
        status: r.status,
        payment_status: r.payment_status,
        subtotal_amount: Number(r.subtotal_amount),
        total_amount: Number(r.total_amount),
        currency: r.currency,
        item_count: itemCountByOrder.get(r.id) || 0,
        items_preview: thumbsByOrder.get(r.id) || [],
        razorpay_order_id: r.razorpay_order_id,
        razorpay_payment_id: r.razorpay_payment_id,
        created_at: r.created_at,
        paid_at: r.paid_at,
        cancelled_at: r.cancelled_at,
        ship_city: r.ship_city,
        ship_state: r.ship_state,
        ship_postal_code: r.ship_postal_code,
      })),
    });
  } catch (err) {
    console.error('[Orders] list failed:', err);
    res.status(500).json({ error: 'Could not load orders' });
  }
});

/* -------------------------------------------------------------------------- */
/*  POST /api/orders/:ref/claim \u2014 manually link an orphan order             */
/*                                                                            */
/*  Covers the edge case where a customer placed an order as a guest using   */
/*  a different email/phone than the one they signed up with, so the         */
/*  automatic email/phone match couldn't link it. Requires the signed-in     */
/*  customer to prove they know the order's contact identifier.              */
/* -------------------------------------------------------------------------- */

router.post('/:ref/claim', requireCustomer, async (req, res) => {
  try {
    const ref = String(req.params.ref || '').trim();
    if (!/^[A-Za-z0-9-]+$/.test(ref)) return res.status(400).json({ error: 'Invalid reference' });
    const b = req.body || {};
    const email = (b.email || '').toString().trim().toLowerCase();
    const phone = (b.phone || '').toString().replace(/\D/g, '');
    if (!email && !phone) {
      return res.status(400).json({ error: 'Provide the email or phone you used at checkout.' });
    }

    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, customer_id, contact_email, contact_phone FROM orders WHERE public_ref = ? LIMIT 1`,
      [ref],
    );
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];

    if (order.customer_id && order.customer_id === req.customer.id) {
      return res.json({ already_linked: true });
    }
    if (order.customer_id && order.customer_id !== req.customer.id) {
      return res.status(409).json({ error: 'This order is already linked to a different account.' });
    }

    const emailMatches = email && order.contact_email && order.contact_email.toLowerCase() === email;
    const phoneMatches = phone && order.contact_phone && order.contact_phone.replace(/\D/g, '') === phone;
    if (!emailMatches && !phoneMatches) {
      return res.status(403).json({ error: 'The details you provided don\'t match this order.' });
    }

    await pool.execute(`UPDATE orders SET customer_id = ? WHERE id = ?`, [req.customer.id, order.id]);
    await recordEvent(pool, order.id, 'order.claimed', 'Linked to customer account', {
      customer_id: req.customer.id,
      matched: emailMatches ? 'email' : 'phone',
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[Orders] claim failed:', err);
    res.status(500).json({ error: 'Could not claim order' });
  }
});

/* -------------------------------------------------------------------------- */
/*  POST /api/orders/:ref/cancel \u2014 customer-initiated cancel                 */
/*                                                                            */
/*  Only allowed while the order is still in 'pending_payment' (i.e. nothing  */
/*  shipped or charged yet). For paid orders the customer must contact us.    */
/* -------------------------------------------------------------------------- */

router.post('/:ref/cancel', optionalCustomer, async (req, res) => {
  try {
    const ref = String(req.params.ref || '').trim();
    if (!/^[A-Za-z0-9-]+$/.test(ref)) return res.status(400).json({ error: 'Invalid reference' });
    const pool = getPool();
    const [rows] = await pool.execute(`SELECT * FROM orders WHERE public_ref = ? LIMIT 1`, [ref]);
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];

    if (order.customer_id && req.customer?.id && order.customer_id !== req.customer.id) {
      return res.status(403).json({ error: 'Not your order' });
    }
    if (order.status !== 'pending_payment') {
      return res.status(409).json({ error: `Cannot cancel an order with status ${order.status}` });
    }

    await pool.execute(
      `UPDATE orders
       SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [order.id],
    );
    await recordEvent(pool, order.id, 'order.cancelled', 'Cancelled by customer', {
      by: req.customer?.id ? 'customer' : 'guest',
    });

    try {
      const { logSiteActivity } = require('../services/siteActivityLog');
      void logSiteActivity({
        customer_id: order.customer_id || req.customer?.id || null,
        email: order.contact_email || null,
        phone: order.contact_phone || null,
        actor_label: order.contact_name || order.ship_full_name || null,
        action: 'order_cancelled',
        category: 'orders',
        summary: `Order ${ref} cancelled before payment`,
        entity_type: 'order',
        entity_id: ref,
        meta: { by: req.customer?.id ? 'customer' : 'guest' },
        req,
      });
    } catch (e) {
      /* non-fatal */
    }

    const data = await loadOrderByRef(pool, ref);
    return res.json({ order: shippableOrder(data.order, data.items, data.events) });
  } catch (err) {
    console.error('[Orders] cancel failed:', err);
    return res.status(500).json({ error: 'Could not cancel order' });
  }
});

/* -------------------------------------------------------------------------- */
/*  POST /api/orders/:ref/reorder \u2014 return items to repopulate the cart      */
/*                                                                            */
/*  We don't mutate any state here; the client takes the returned items and   */
/*  merges them into its cart context. Item prices will be re-priced server-  */
/*  side at /checkout anyway, so the response is purely advisory.             */
/* -------------------------------------------------------------------------- */

router.post('/:ref/reorder', optionalCustomer, async (req, res) => {
  try {
    const ref = String(req.params.ref || '').trim();
    if (!/^[A-Za-z0-9-]+$/.test(ref)) return res.status(400).json({ error: 'Invalid reference' });
    const pool = getPool();
    const data = await loadOrderByRef(pool, ref);
    if (!data) return res.status(404).json({ error: 'Order not found' });
    const order = data.order;
    if (order.customer_id && req.customer?.id && order.customer_id !== req.customer.id) {
      return res.status(403).json({ error: 'Not your order' });
    }
    res.json({
      items: data.items.map((it) => ({
        product_id: it.product_id,
        product_slug: it.product_slug,
        product_name: it.product_name,
        brand: it.brand,
        unit_price: Number(it.unit_price),
        quantity: it.quantity,
        image_url: it.image_url,
      })),
    });
  } catch (err) {
    console.error('[Orders] reorder failed:', err);
    return res.status(500).json({ error: 'Could not load order items' });
  }
});

/* Helper exposed for the Razorpay webhook to mark an order paid. */
async function markOrderPaidByRazorpayOrderId(pool, { razorpayOrderId, razorpayPaymentId, method }) {
  const [rows] = await pool.execute(
    `SELECT id, public_ref, payment_status FROM orders WHERE razorpay_order_id = ? LIMIT 1`,
    [razorpayOrderId],
  );
  if (!rows.length) return { updated: false, reason: 'no_matching_order' };
  const order = rows[0];
  if (order.payment_status === 'paid') {
    return { updated: false, reason: 'already_paid', public_ref: order.public_ref };
  }
  await markOrderPaid(pool, order.id, {
    paymentId: razorpayPaymentId,
    method: method || null,
  });
  await recordEvent(pool, order.id, 'webhook.payment_captured', 'Payment captured (via webhook)', {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
  });
  return { updated: true, public_ref: order.public_ref };
}

module.exports = router;
module.exports.markOrderPaidByRazorpayOrderId = markOrderPaidByRazorpayOrderId;
