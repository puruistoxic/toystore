/**
 * Customer JWT middleware.
 *
 * Storefront customers (shoppers) authenticate via /api/customer/auth/*.
 * Their JWT is distinct from admin tokens:
 *   - Different `aud` claim ("customer")
 *   - Different signing secret (CUSTOMER_JWT_SECRET, falls back to JWT_SECRET)
 * so an admin token can never accidentally be accepted as a customer token
 * and vice-versa.
 */
const jwt = require('jsonwebtoken');

const CUSTOMER_JWT_SECRET =
  process.env.CUSTOMER_JWT_SECRET ||
  process.env.JWT_SECRET ||
  'change-me-customer-secret';

const CUSTOMER_TOKEN_TTL = process.env.CUSTOMER_JWT_TTL || '30d';
const CUSTOMER_AUDIENCE = 'customer';

function signCustomerToken(customer) {
  return jwt.sign(
    {
      sub: String(customer.id),
      customer_id: customer.id,
      email: customer.email || null,
      phone: customer.phone || null,
    },
    CUSTOMER_JWT_SECRET,
    {
      audience: CUSTOMER_AUDIENCE,
      expiresIn: CUSTOMER_TOKEN_TTL,
    },
  );
}

function verifyCustomerToken(token) {
  return jwt.verify(token, CUSTOMER_JWT_SECRET, { audience: CUSTOMER_AUDIENCE });
}

/** Strict — request fails with 401 if no/invalid customer token. */
function requireCustomer(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return res.status(401).json({ error: 'Sign-in required' });
  try {
    const decoded = verifyCustomerToken(token);
    req.customer = {
      id: Number(decoded.customer_id || decoded.sub),
      email: decoded.email || null,
      phone: decoded.phone || null,
    };
    return next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
}

/** Optional — populates `req.customer` if a valid token is present, else continues. */
function optionalCustomer(req, _res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return next();
  try {
    const decoded = verifyCustomerToken(token);
    req.customer = {
      id: Number(decoded.customer_id || decoded.sub),
      email: decoded.email || null,
      phone: decoded.phone || null,
    };
  } catch {
    /* ignore — treat as guest */
  }
  return next();
}

module.exports = {
  CUSTOMER_JWT_SECRET,
  CUSTOMER_AUDIENCE,
  signCustomerToken,
  verifyCustomerToken,
  requireCustomer,
  optionalCustomer,
};
