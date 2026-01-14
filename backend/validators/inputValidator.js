/**
 * Input Validators
 */

const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('recaptchaToken')
    .notEmpty()
    .withMessage('reCAPTCHA token is required')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('recaptchaToken')
    .notEmpty()
    .withMessage('reCAPTCHA token is required')
];

const validateInvestment = [
  body('planId')
    .notEmpty()
    .withMessage('Plan ID is required'),
  body('amount')
    .isNumeric()
    .custom(value => value > 0)
    .withMessage('Amount must be greater than 0')
];

const validateDeposit = [
  body('amount')
    .isNumeric()
    .custom(value => value > 0)
    .withMessage('Deposit amount must be greater than 0')
];

/**
 * Validation error handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateInvestment,
  validateDeposit,
  handleValidationErrors
};
