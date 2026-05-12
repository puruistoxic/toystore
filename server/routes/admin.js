const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool } = require('../db');
const { authenticateToken, requireRole, JWT_SECRET } = require('../middleware/auth');
const { logAudit } = require('../middleware/auditLog');

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Log incoming request for debugging (without password)
    console.log(`[Admin API] Login attempt for username: "${username}"`);
    console.log(`[Admin API] Request body keys:`, Object.keys(req.body));
    console.log(`[Admin API] Username type:`, typeof username, `Length:`, username?.length);
    console.log(`[Admin API] Password provided:`, password ? 'Yes' : 'No', `Length:`, password?.length);

    if (!username || !password) {
      console.error(`[Admin API] Login failed: Missing username or password`);
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Trim whitespace from username
    const trimmedUsername = username.trim();

    const pool = getPool();
    
    // First check if user exists (without is_active filter for debugging)
    const [allUsers] = await pool.execute(
      'SELECT * FROM admin_users WHERE username = ?',
      [trimmedUsername]
    );

    if (allUsers.length === 0) {
      console.error(`[Admin API] Login failed: User "${trimmedUsername}" not found`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = allUsers[0];
    console.log(`[Admin API] User found: ID=${user.id}, Active=${user.is_active}, HasHash=${!!user.password_hash}`);
    
    // Check if user is active
    if (!user.is_active) {
      console.error(`[Admin API] Login failed: User "${trimmedUsername}" is inactive`);
      return res.status(401).json({ error: 'Account is inactive. Please contact administrator.' });
    }

    // Check if password_hash exists
    if (!user.password_hash) {
      console.error(`[Admin API] Login failed: User "${trimmedUsername}" has no password hash`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`[Admin API] Password match result:`, passwordMatch);

    if (!passwordMatch) {
      console.error(`[Admin API] Login failed: Password mismatch for user "${trimmedUsername}"`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.execute(
      'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`[Admin API] ✅ Login successful for user "${trimmedUsername}" (ID: ${user.id})`);

    try {
      const ipAddress =
        req.ip ||
        req.connection?.remoteAddress ||
        String(req.headers['x-forwarded-for'] || '')
          .split(',')[0]
          .trim() ||
        'unknown';
      const userAgent = req.headers['user-agent'] || null;
      await pool.execute(
        `INSERT INTO audit_logs (user_id, username, action, entity_type, entity_id, entity_name, changes, ip_address, user_agent)
         VALUES (?, ?, 'LOGIN', 'admin_session', ?, ?, NULL, ?, ?)`,
        [user.id, user.username, String(user.id), trimmedUsername, ipAddress, userAgent],
      );
    } catch (auditErr) {
      console.warn('[Admin API] login audit log failed:', auditErr.message);
    }

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Admin API] Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

// Verify token
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.userId || req.user.id;
    const [users] = await pool.execute(
      'SELECT id, username, email, full_name, role FROM admin_users WHERE id = ? AND is_active = TRUE',
      [userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    res.json({
      success: true,
      user: {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
        fullName: users[0].full_name,
        role: users[0].role
      }
    });
  } catch (error) {
    console.error('[Admin API] Verify error:', error);
    res.status(500).json({ error: 'Verification failed', message: error.message });
  }
});

/* ---------------------------------------------------------------------------
 *  GET /admin/activity-feed
 *
 *  Unified timeline: admin audit_logs + storefront site_activity_logs +
 *  outreach lead_logs. Query params: scope=all|admin|website, page, limit,
 *  q, action, entity_type, username (admin filters).
 * -------------------------------------------------------------------------*/
router.get('/activity-feed', authenticateToken, async (req, res) => {
  try {
    const { queryActivityFeed } = require('../services/activityFeed');
    const out = await queryActivityFeed(req.query || {});
    res.json({
      activities: out.rows,
      pagination: {
        page: out.page,
        limit: out.limit,
        total: out.total,
        totalPages: out.totalPages,
      },
    });
  } catch (err) {
    console.error('[Admin API] activity-feed error:', err);
    res.status(500).json({ error: 'Failed to load activity', message: err.message });
  }
});

// ==================== USER MANAGEMENT ====================

/* ---------------------------------------------------------------------------
 *  GET /admin/users/directory
 *
 *  Unified view across every "person" the system knows about:
 *    - source = 'admin'    → admin_users (back-office accounts)
 *    - source = 'customer' → customers (signed-in storefront accounts)
 *    - source = 'guest'    → aggregated outreach (lead_logs) where the
 *                            contact has no matching customer record
 *
 *  This must be declared BEFORE the `/users/:id` route below so it isn't
 *  swallowed as a param. Same trick we used for /orders/stats.
 * -------------------------------------------------------------------------*/
router.get('/users/directory', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const type = String(req.query.type || 'all').toLowerCase();
    const q = String(req.query.q || '').trim();
    const status = String(req.query.status || '').toLowerCase();
    const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit || '100'), 10) || 100));
    const offset = Math.max(0, parseInt(String(req.query.offset || '0'), 10) || 0);
    const like = q ? `%${q.replace(/%/g, '')}%` : null;

    const rows = [];

    // ---- Admins ----------------------------------------------------------
    if (type === 'all' || type === 'admin') {
      const where = [];
      const params = [];
      if (like) {
        where.push('(username LIKE ? OR email LIKE ? OR full_name LIKE ?)');
        params.push(like, like, like);
      }
      if (status === 'active') where.push('is_active = 1');
      else if (status === 'inactive') where.push('is_active = 0');
      const sql = `
        SELECT id, username, email, full_name, role, is_active,
               last_login, created_at
        FROM admin_users
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}`;
      const [adminRows] = await pool.execute(sql, params);
      for (const a of adminRows) {
        rows.push({
          source: 'admin',
          id: a.id,
          ref: `admin:${a.id}`,
          username: a.username,
          name: a.full_name || null,
          email: a.email,
          phone: null,
          role: a.role,
          email_verified: true,
          phone_verified: null,
          is_active: !!a.is_active,
          last_seen_at: a.last_login,
          created_at: a.created_at,
          order_count: 0,
          lead_count: 0,
        });
      }
    }

    // ---- Storefront customers -------------------------------------------
    if (type === 'all' || type === 'customer') {
      const where = [];
      const params = [];
      if (like) {
        where.push('(c.full_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)');
        params.push(like, like, like);
      }
      if (status === 'active') where.push('c.is_active = 1');
      else if (status === 'inactive') where.push('c.is_active = 0');
      const sql = `
        SELECT c.id, c.full_name, c.email, c.phone, c.email_verified,
               c.phone_verified, c.is_active, c.last_login_at, c.created_at,
               (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS order_count,
               (SELECT COUNT(*) FROM lead_logs l WHERE l.customer_id = c.id) AS lead_count
        FROM customers c
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY c.created_at DESC
        LIMIT ${limit} OFFSET ${offset}`;
      const [custRows] = await pool.execute(sql, params);
      for (const c of custRows) {
        rows.push({
          source: 'customer',
          id: c.id,
          ref: `customer:${c.id}`,
          username: null,
          name: c.full_name,
          email: c.email,
          phone: c.phone,
          role: 'customer',
          email_verified: !!c.email_verified,
          phone_verified: !!c.phone_verified,
          is_active: !!c.is_active,
          last_seen_at: c.last_login_at,
          created_at: c.created_at,
          order_count: Number(c.order_count) || 0,
          lead_count: Number(c.lead_count) || 0,
        });
      }
    }

    // ---- Guest contacts (lead_logs without a customer link) -------------
    //
    //  Group by email when present, else by the last 10 digits of phone.
    //  Filter out anything that already maps to a registered customer.
    if (type === 'all' || type === 'guest') {
      const phoneDigits = `REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(l.customer_phone,''),' ',''),'+',''),'-',''),'(',''),')','')`;
      const where = ['l.customer_id IS NULL'];
      const params = [];
      if (like) {
        where.push('(l.customer_name LIKE ? OR l.customer_email LIKE ? OR l.customer_phone LIKE ?)');
        params.push(like, like, like);
      }
      // Need an email OR phone to dedupe by something
      where.push("(l.customer_email IS NOT NULL OR l.customer_phone IS NOT NULL)");
      const sql = `
        SELECT
          COALESCE(LOWER(NULLIF(l.customer_email,'')), CONCAT('p:', RIGHT(${phoneDigits}, 10))) AS contact_key,
          MAX(l.customer_name)  AS name,
          MAX(l.customer_email) AS email,
          MAX(l.customer_phone) AS phone,
          COUNT(*)               AS lead_count,
          MAX(l.created_at)      AS last_seen_at,
          MIN(l.created_at)      AS first_seen_at,
          MAX(l.related_type)    AS last_related_type,
          MAX(l.related_ref)     AS last_related_ref
        FROM lead_logs l
        LEFT JOIN customers ce
          ON ce.email IS NOT NULL
         AND LOWER(ce.email) = LOWER(l.customer_email)
        LEFT JOIN customers cp
          ON cp.phone IS NOT NULL
         AND RIGHT(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(cp.phone,' ',''),'+',''),'-',''),'(',''),')',''), 10)
             = RIGHT(${phoneDigits}, 10)
        WHERE ${where.join(' AND ')}
          AND ce.id IS NULL
          AND cp.id IS NULL
        GROUP BY contact_key
        ORDER BY last_seen_at DESC
        LIMIT ${limit} OFFSET ${offset}`;
      try {
        const [guestRows] = await pool.execute(sql, params);
        for (const g of guestRows) {
          rows.push({
            source: 'guest',
            id: g.contact_key,
            ref: `guest:${g.contact_key}`,
            username: null,
            name: g.name || null,
            email: g.email || null,
            phone: g.phone || null,
            role: 'guest',
            email_verified: null,
            phone_verified: null,
            is_active: true,
            last_seen_at: g.last_seen_at,
            created_at: g.first_seen_at,
            order_count: 0,
            lead_count: Number(g.lead_count) || 0,
            last_related_type: g.last_related_type || null,
            last_related_ref: g.last_related_ref || null,
          });
        }
      } catch (gErr) {
        // Guest aggregation is best-effort — never let it fail the directory.
        console.warn('[Admin API] users/directory guest aggregation failed:', gErr.message);
      }
    }

    // Sort newest-activity-first across sources
    rows.sort((a, b) => {
      const ta = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0;
      const tb = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0;
      if (tb !== ta) return tb - ta;
      return (
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    });

    // Aggregate counts by source for the UI tabs
    const counts = { admin: 0, customer: 0, guest: 0 };
    for (const r of rows) counts[r.source]++;

    res.json({ users: rows, counts, total: rows.length });
  } catch (err) {
    console.error('[Admin API] users/directory error:', err);
    res.status(500).json({ error: 'Failed to load user directory', message: err.message });
  }
});

// Get all users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { search, role, is_active } = req.query;
    let query = 'SELECT id, username, email, full_name, role, is_active, last_login, created_at FROM admin_users WHERE 1=1';
    const params = [];

    if (search) {
      // Smart multi-word search: handles words in any order
      const { buildSmartSearchCondition } = require('../utils/searchHelper');
      const searchFields = ['username', 'email', 'full_name'];
      const { condition, params: searchParams } = buildSmartSearchCondition(search, searchFields);
      if (condition) {
        query += ` AND ${condition}`;
        params.push(...searchParams);
      }
    }

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' || is_active === true);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('[Admin API] Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users', message: error.message });
  }
});

// Get user by ID
router.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, username, email, full_name, role, is_active, last_login, created_at FROM admin_users WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('[Admin API] Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user', message: error.message });
  }
});

// Create user
router.post('/users', authenticateToken, requireRole(), async (req, res) => {
  try {
    const { username, email, password, full_name, role, is_active } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const pool = getPool();

    // Check if username or email already exists
    const [existing] = await pool.execute(
      'SELECT id FROM admin_users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, passwordHash, full_name || null, role || 'admin', is_active !== undefined ? is_active : true]
    );

    const userId = result.insertId;

    // Log audit
    await logAudit(req, 'CREATE', 'admin_user', userId.toString(), username, null, { username, email, full_name, role });

    res.json({ success: true, id: userId, message: 'User created successfully' });
  } catch (error) {
    console.error('[Admin API] Create user error:', error);
    res.status(500).json({ error: 'Failed to create user', message: error.message });
  }
});

// Update user
router.put('/users/:id', authenticateToken, requireRole(), async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, password, full_name, role, is_active } = req.body;

    const pool = getPool();

    // Get old data for audit log
    const [oldRows] = await pool.execute(
      'SELECT * FROM admin_users WHERE id = ?',
      [userId]
    );

    if (oldRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldData = oldRows[0];

    // Check if username or email already exists (excluding current user)
    if (username || email) {
      const [existing] = await pool.execute(
        'SELECT id FROM admin_users WHERE (username = ? OR email = ?) AND id != ?',
        [username || oldData.username, email || oldData.email, userId]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
    }

    // Build update query
    const updates = [];
    const params = [];

    if (username !== undefined) {
      updates.push('username = ?');
      params.push(username);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (full_name !== undefined) {
      updates.push('full_name = ?');
      params.push(full_name);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      params.push(passwordHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(userId);

    await pool.execute(
      `UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Log audit
    await logAudit(req, 'UPDATE', 'admin_user', userId, username || oldData.username, oldData, req.body);

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('[Admin API] Update user error:', error);
    res.status(500).json({ error: 'Failed to update user', message: error.message });
  }
});

// Delete user (soft delete by setting is_active to false)
router.delete('/users/:id', authenticateToken, requireRole(), async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user.userId || req.user.id;

    // Prevent self-deletion
    if (parseInt(userId) === parseInt(currentUserId)) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const pool = getPool();

    // Get old data for audit log
    const [oldRows] = await pool.execute(
      'SELECT * FROM admin_users WHERE id = ?',
      [userId]
    );

    if (oldRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldData = oldRows[0];

    // Soft delete by setting is_active to false
    await pool.execute(
      'UPDATE admin_users SET is_active = FALSE WHERE id = ?',
      [userId]
    );

    // Log audit
    await logAudit(req, 'DELETE', 'admin_user', userId, oldData.username, oldData, null);

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    console.error('[Admin API] Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user', message: error.message });
  }
});

module.exports = router;

