/**
 * Auth Routes
 */

const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const referralService = require('../services/referralService');
const { verifyRecaptcha } = require('../middleware/recaptcha');
const { validateRegister, validateLogin, handleValidationErrors } = require('../validators/inputValidator');
const { sendSuccess, sendError } = require('../utils/helpers');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 */
router.post('/register', registerLimiter, validateRegister, handleValidationErrors, verifyRecaptcha, async (req, res) => {
  try {
    const { email, password, fullName, referralCode } = req.body;
    
    // Register the user
    const user = await authService.register(email, password, fullName);
    
    // Handle referral code if provided
    if (referralCode) {
      const validation = referralService.validateReferralCode(referralCode);
      if (validation.valid) {
        // Record the referral with optional welcome bonus
        const welcomeBonus = 5; // 5 USD welcome bonus for new users
        referralService.recordReferral(referralCode, user.id, welcomeBonus);
        
        // Add bonus info to response
        user.welcomeBonus = welcomeBonus;
        user.referralApplied = true;
      } else {
        logger.warn('Invalid referral code provided during registration', { email, referralCode });
      }
    }
    
    sendSuccess(res, user, 201, 'User registered successfully');
  } catch (error) {
    sendError(res, error, error.statusCode);
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', loginLimiter, validateLogin, handleValidationErrors, verifyRecaptcha, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result, 200, 'Login successful');
  } catch (error) {
    sendError(res, error, error.statusCode);
  }
});

/**
 * GET /api/auth/verify
 */
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return sendError(res, { message: 'No token provided' }, 401);
    }

    const decoded = authService.verifyToken(token);
    sendSuccess(res, { decoded }, 200, 'Token is valid');
  } catch (error) {
    sendError(res, error, 401);
  }
});

/**
 * GET /api/auth/referral/validate/:code
 * Validate a referral code without registering
 */
router.get('/referral/validate/:code', (req, res) => {
  try {
    const { code } = req.params;
    const validation = referralService.validateReferralCode(code);
    
    if (validation.valid) {
      sendSuccess(res, {
        valid: true,
        code: validation.referralCode,
        referrerId: validation.referrerId,
        referrerName: validation.referrerName
      }, 200, 'Referral code is valid');
    } else {
      sendSuccess(res, {
        valid: false,
        message: validation.message
      }, 200, 'Referral validation result');
    }
  } catch (error) {
    sendError(res, error, error.statusCode);
  }
});

module.exports = router;
