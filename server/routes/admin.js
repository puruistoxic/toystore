const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool } = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
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

// ==================== USER MANAGEMENT ====================

// Get all users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { search, role, is_active } = req.query;
    let query = 'SELECT id, username, email, full_name, role, is_active, last_login, created_at FROM admin_users WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
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
router.post('/users', authenticateToken, async (req, res) => {
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
router.put('/users/:id', authenticateToken, async (req, res) => {
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
router.delete('/users/:id', authenticateToken, async (req, res) => {
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

