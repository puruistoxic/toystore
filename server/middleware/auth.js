const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Canonical RBAC roles. `admin` is the super-role and is always allowed.
 * Backwards compatibility: legacy `editor` is treated like `content_manager`.
 */
const ROLE_ALIASES = {
  editor: 'content_manager',
};

function normaliseRole(role) {
  const r = String(role || '').toLowerCase().trim();
  return ROLE_ALIASES[r] || r || 'viewer';
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = {
      userId: decoded.userId || decoded.id || decoded.user_id,
      username: decoded.username || decoded.user || 'unknown',
      email: decoded.email,
      role: normaliseRole(decoded.role),
      rawRole: decoded.role,
    };
    next();
  });
}

/**
 * Express middleware that allows requests whose `req.user.role` is in the
 * `allowed` list. `admin` is always allowed. Must run after authenticateToken.
 */
function requireRole(...allowed) {
  const allowSet = new Set(allowed.flat().map((r) => normaliseRole(r)));
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const role = normaliseRole(req.user.role);
    if (role === 'admin' || allowSet.has(role)) {
      return next();
    }
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Your role does not have permission to perform this action.',
      required: [...allowSet],
      role,
    });
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  normaliseRole,
  JWT_SECRET,
};

