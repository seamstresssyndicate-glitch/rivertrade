/**
 * Admin Authorization Middleware
 */

const { AuthorizationError } = require('../utils/errors');

const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      details: 'User not authenticated'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      details: 'Admin access required'
    });
  }

  next();
};

const authorizeSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      details: 'Super admin access required'
    });
  }

  next();
};

module.exports = {
  authorizeAdmin,
  authorizeSuperAdmin
};
