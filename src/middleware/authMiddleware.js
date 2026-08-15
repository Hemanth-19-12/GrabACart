// Grab A Cart - JWT Authentication Middleware
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'grab_a_cart_super_secret_jwt_token_key_2026';

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Token format invalid. Expected format: Bearer <token>'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

const requireSeller = (req, res, next) => {
  if (!req.user || (req.user.role !== 'seller' && req.user.role !== 'admin')) {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Seller authorization required. Contact Admin for account creation.'
    });
  }
  next();
};

authenticateJWT.authenticateJWT = authenticateJWT;
authenticateJWT.requireSeller = requireSeller;

module.exports = authenticateJWT;
