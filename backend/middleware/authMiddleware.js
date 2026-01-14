/**
 * JWT Authentication Middleware
 */

const { verifyToken } = require('../utils/helpers');
const { AuthError } = require('../utils/errors');

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided',
      details: 'Authorization token is required'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

module.exports = { authenticateToken };
