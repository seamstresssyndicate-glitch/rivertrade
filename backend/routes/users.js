/**
 * User Profile Routes
 */

const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { sendSuccess, sendError } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * GET /api/users/profile/:userId
 * Get user profile
 */
router.get('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const profile = await userService.getUserProfile(userId);
    sendSuccess(res, { profile }, 200, 'Profile retrieved');
  } catch (error) {
    logger.error('Get profile error', error);
    sendError(res, error);
  }
});

/**
 * PUT /api/users/profile/:userId
 * Update user profile
 */
router.put('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const { fullName, phone, address, city, country } = req.body;
    const profile = await userService.updateProfile(userId, {
      fullName,
      phone,
      address,
      city,
      country
    });

    sendSuccess(res, { profile }, 200, 'Profile updated');
  } catch (error) {
    logger.error('Update profile error', error);
    sendError(res, error, error.statusCode || 400);
  }
});

/**
 * POST /api/users/:userId/kyc
 * Submit KYC verification
 */
router.post('/:userId/kyc', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const { docType, docNumber, docImage, selfieImage } = req.body;
    const kyc = await userService.submitKYC(userId, {
      docType,
      docNumber,
      docImage,
      selfieImage
    });

    sendSuccess(res, { kyc }, 201, 'KYC submitted for verification');
  } catch (error) {
    logger.error('Submit KYC error', error);
    sendError(res, error, error.statusCode || 400);
  }
});

/**
 * GET /api/users/:userId/kyc
 * Get KYC status
 */
router.get('/:userId/kyc', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const kyc = await userService.getKYCStatus(userId);
    sendSuccess(res, { kyc }, 200, 'KYC status retrieved');
  } catch (error) {
    logger.error('Get KYC status error', error);
    sendError(res, error);
  }
});

/**
 * PUT /api/users/:userId/password
 * Change password
 */
router.put('/:userId/password', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;
    await userService.changePassword(userId, oldPassword, newPassword, confirmPassword);

    sendSuccess(res, {}, 200, 'Password changed successfully');
  } catch (error) {
    logger.error('Change password error', error);
    sendError(res, error, error.statusCode || 400);
  }
});

/**
 * POST /api/users/:userId/two-factor
 * Enable 2FA
 */
router.post('/:userId/two-factor', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const twoFactor = await userService.enableTwoFactor(userId);
    sendSuccess(res, { twoFactor }, 201, '2FA setup initiated');
  } catch (error) {
    logger.error('Enable 2FA error', error);
    sendError(res, error);
  }
});

/**
 * PUT /api/users/:userId/two-factor
 * Verify and confirm 2FA
 */
router.put('/:userId/two-factor', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const { code } = req.body;
    await userService.verifyTwoFactor(userId, code);
    sendSuccess(res, {}, 200, '2FA enabled successfully');
  } catch (error) {
    logger.error('Verify 2FA error', error);
    sendError(res, error, error.statusCode || 400);
  }
});

/**
 * POST /api/users/:userId/notification-settings
 * Update notification settings
 */
router.post('/:userId/notification-settings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const { email, sms, push, marketing } = req.body;
    const settings = await userService.updateNotificationSettings(userId, {
      email,
      sms,
      push,
      marketing
    });

    sendSuccess(res, { settings }, 200, 'Notification settings updated');
  } catch (error) {
    logger.error('Update notification settings error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/users/:userId/activities
 * Get user activities/login history
 */
router.get('/:userId/activities', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const activities = await userService.getUserActivities(userId);
    sendSuccess(res, { activities, count: activities.length }, 200, 'Activities retrieved');
  } catch (error) {
    logger.error('Get activities error', error);
    sendError(res, error);
  }
});

/**
 * POST /api/users/:userId/contact-support
 * Submit support ticket
 */
router.post('/:userId/contact-support', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const { subject, message, category } = req.body;
    const ticket = await userService.createSupportTicket(userId, {
      subject,
      message,
      category
    });

    sendSuccess(res, { ticket }, 201, 'Support ticket created');
  } catch (error) {
    logger.error('Create support ticket error', error);
    sendError(res, error);
  }
});

module.exports = router;
