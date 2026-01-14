/**
 * Response Helper
 */
const sendSuccess = (res, data = {}, statusCode = 200, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date()
  });
};

const sendError = (res, error, statusCode = 500, details = null) => {
  const errorMessage = error?.message || error || 'Internal Server Error';
  const code = error?.statusCode || statusCode;

  res.status(code).json({
    success: false,
    error: errorMessage,
    details,
    timestamp: new Date()
  });
};

/**
 * Password hashing
 */
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * JWT Token
 */
const jwt = require('jsonwebtoken');

const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Validation helpers
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  return password && password.length >= 6;
};

const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

module.exports = {
  sendSuccess,
  sendError,
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  isValidEmail,
  isValidPassword,
  isValidPhone
};
