/**
 * Referral Routes
 */

const express = require('express');
const router = express.Router();
const referralService = require('../services/referralService');
const userService = require('../services/userService');
const { sendSuccess, sendError } = require('../utils/helpers');
const { authMiddleware } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

/**
 * GET /api/referrals/stats
 * Get user's referral statistics (requires authentication)
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await userService.getReferralStats(userId);
    sendSuccess(res, stats, 200, 'Referral stats retrieved successfully');
  } catch (error) {
    logger.error('Get referral stats error', error);
    sendError(res, error, error.statusCode || 500);
  }
});

/**
 * POST /api/referrals/claim-reward
 * Claim pending referral rewards (requires authentication)
 */
router.post('/claim-reward', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userService.claimReferralReward(userId);
    sendSuccess(res, result, 200, 'Referral reward claimed successfully');
  } catch (error) {
    logger.error('Claim referral reward error', error);
    sendError(res, error, error.statusCode || 500);
  }
});

/**
 * GET /api/referrals/validate/:code
 * Validate a referral code without authentication
 */
router.get('/validate/:code', (req, res) => {
  try {
    const { code } = req.params;
    const validation = referralService.validateReferralCode(code);
    
    if (validation.valid) {
      sendSuccess(res, {
        valid: true,
        code: validation.referralCode,
        referrerId: validation.referrerId,
        referrerName: validation.referrerName,
        bonus: 5 // $5 welcome bonus
      }, 200, 'Referral code is valid');
    } else {
      sendSuccess(res, {
        valid: false,
        message: validation.message
      }, 200, 'Referral validation result');
    }
  } catch (error) {
    logger.error('Validate referral code error', error);
    sendError(res, error, error.statusCode || 500);
  }
});

/**
 * GET /api/referrals/info/:code
 * Get detailed information about a referral code
 */
router.get('/info/:code', (req, res) => {
  try {
    const { code } = req.params;
    const info = referralService.getReferralInfo(code);
    sendSuccess(res, info, 200, 'Referral information retrieved');
  } catch (error) {
    logger.error('Get referral info error', error);
    sendError(res, error, error.statusCode || 500);
  }
});

module.exports = router;
