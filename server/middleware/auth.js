const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
    // Ensure user object has userId (JWT typically has 'id' or 'userId')
    req.user = {
      userId: decoded.userId || decoded.id || decoded.user_id,
      username: decoded.username || decoded.user || 'unknown',
      email: decoded.email,
      role: decoded.role
    };
    next();
  });
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};

