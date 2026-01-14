/**
 * Referral Service
 * Handles referral code validation, tracking, and reward distribution
 */

const db = require('../models/database');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

class ReferralService {
  /**
   * Validate a referral code
   * @param {string} code - The referral code to validate
   * @returns {Object} Referral information if valid
   */
  validateReferralCode(code) {
    try {
      if (!code || code.trim().length === 0) {
        return { valid: false, message: 'No referral code provided' };
      }

      const referral = db.getReferralCode(code.toUpperCase());
      if (!referral) {
        return { valid: false, message: 'Invalid referral code' };
      }

      const referrer = db.getUserById(referral.userId);
      if (!referrer || referrer.status !== 'active') {
        return { valid: false, message: 'Referral code is no longer valid' };
      }

      return { 
        valid: true, 
        referralCode: code.toUpperCase(),
        referrerId: referral.userId,
        referrerName: referrer.fullName || referrer.email
      };
    } catch (error) {
      logger.error('Referral validation error', error, { code });
      return { valid: false, message: 'Error validating referral code' };
    }
  }

  /**
   * Record a new referral
   * @param {string} referralCode - The referral code used
   * @param {string} newUserId - The ID of the new user
   * @param {number} initialReward - Initial reward for using referral code (optional)
   * @returns {Object} Result of referral recording
   */
  recordReferral(referralCode, newUserId, initialReward = 0) {
    try {
      const code = referralCode.toUpperCase();
      const referral = db.getReferralCode(code);

      if (!referral) {
        throw new ValidationError('Invalid referral code');
      }

      // Record usage
      db.recordReferralUsage(code, newUserId);

      // Add reward to referrer if applicable
      if (initialReward > 0) {
        db.addReferralReward(referral.userId, initialReward);
        logger.info('Referral reward added', { 
          referrerId: referral.userId, 
          newUserId, 
          reward: initialReward 
        });
      }

      logger.info('Referral recorded', { 
        referralCode: code, 
        newUserId, 
        referrerId: referral.userId 
      });

      return { 
        success: true, 
        message: 'Referral recorded successfully',
        reward: initialReward
      };
    } catch (error) {
      logger.error('Error recording referral', error, { referralCode, newUserId });
      throw error;
    }
  }

  /**
   * Get referral statistics for a user
   * @param {string} userId - The user's ID
   * @returns {Object} User's referral statistics
   */
  getUserReferralStats(userId) {
    try {
      const { referralCode, stats } = db.getReferralStats(userId);
      
      return {
        referralCode,
        usageCount: stats.usageCount,
        totalRewards: stats.totalRewards,
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error('Error getting referral stats', error, { userId });
      throw error;
    }
  }

  /**
   * Get referral information by code
   * @param {string} code - The referral code
   * @returns {Object} Referral information
   */
  getReferralInfo(code) {
    try {
      const referral = db.getReferralCode(code.toUpperCase());
      if (!referral) {
        throw new ValidationError('Referral code not found');
      }

      const referrer = db.getUserById(referral.userId);
      return {
        code: referral.code,
        referrer: {
          name: referrer.fullName || referrer.email,
          email: referrer.email
        },
        usageCount: referral.usageCount,
        totalRewardsEarned: referral.totalRewardsEarned,
        createdAt: referral.createdAt
      };
    } catch (error) {
      logger.error('Error getting referral info', error, { code });
      throw error;
    }
  }
}

module.exports = new ReferralService();
