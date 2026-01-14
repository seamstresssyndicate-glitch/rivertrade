/**
 * User Service
 */

const db = require('../models/database');
const { hashPassword, comparePassword } = require('../utils/helpers');
const { ValidationError, AuthError } = require('../utils/errors');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class UserService {
  async getUserProfile(userId) {
    try {
      const user = db.getUserById(userId);
      if (!user) {
        throw new ValidationError('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
        status: user.status,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt
      };
    } catch (error) {
      logger.error('Get user profile error', error);
      throw error;
    }
  }

  async updateProfile(userId, updates) {
    try {
      const user = db.updateUser(userId, updates);
      logger.info('User profile updated', { userId });

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country
      };
    } catch (error) {
      logger.error('Update profile error', error);
      throw error;
    }
  }

  async submitKYC(userId, data) {
    try {
      const kyc = {
        id: uuidv4(),
        userId,
        ...data,
        status: 'pending',
        submittedAt: new Date()
      };

      if (!db.kycSubmissions) db.kycSubmissions = [];
      db.kycSubmissions.push(kyc);

      db.updateUser(userId, { kycStatus: 'pending' });
      logger.info('KYC submitted', { userId });

      return kyc;
    } catch (error) {
      logger.error('Submit KYC error', error);
      throw error;
    }
  }

  async getKYCStatus(userId) {
    try {
      const user = db.getUserById(userId);
      if (!user) {
        throw new ValidationError('User not found');
      }

      const kyc = (db.kycSubmissions || []).find(k => k.userId === userId);

      return {
        status: user.kycStatus,
        submittedAt: kyc?.submittedAt,
        verifiedAt: kyc?.verifiedAt,
        rejectionReason: user.kycRejectionReason
      };
    } catch (error) {
      logger.error('Get KYC status error', error);
      throw error;
    }
  }

  async changePassword(userId, oldPassword, newPassword, confirmPassword) {
    try {
      if (newPassword !== confirmPassword) {
        throw new ValidationError('Passwords do not match');
      }

      if (newPassword.length < 6) {
        throw new ValidationError('Password must be at least 6 characters');
      }

      const user = db.getUserById(userId);
      if (!user) {
        throw new ValidationError('User not found');
      }

      const isPasswordValid = await comparePassword(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new AuthError('Invalid current password');
      }

      const hashedPassword = await hashPassword(newPassword);
      db.updateUser(userId, { password: hashedPassword });

      logger.info('Password changed', { userId });
    } catch (error) {
      logger.error('Change password error', error);
      throw error;
    }
  }

  async enableTwoFactor(userId) {
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const twoFactor = {
        userId,
        secret: code,
        enabled: false,
        createdAt: new Date()
      };

      if (!db.twoFactorAuth) db.twoFactorAuth = {};
      db.twoFactorAuth[userId] = twoFactor;

      logger.info('2FA setup initiated', { userId });
      return { secret: code, qrCode: `otpauth://totp/Rivertrade:${db.getUserById(userId).email}?secret=${code}` };
    } catch (error) {
      logger.error('Enable 2FA error', error);
      throw error;
    }
  }

  async verifyTwoFactor(userId, code) {
    try {
      const twoFactor = db.twoFactorAuth?.[userId];
      if (!twoFactor) {
        throw new ValidationError('2FA not set up');
      }

      // In production, use proper TOTP library
      if (twoFactor.secret !== code) {
        throw new ValidationError('Invalid 2FA code');
      }

      db.twoFactorAuth[userId] = { ...twoFactor, enabled: true };
      db.updateUser(userId, { twoFactorEnabled: true });

      logger.info('2FA verified and enabled', { userId });
    } catch (error) {
      logger.error('Verify 2FA error', error);
      throw error;
    }
  }

  async updateNotificationSettings(userId, settings) {
    try {
      if (!db.notificationSettings) db.notificationSettings = {};

      db.notificationSettings[userId] = {
        ...settings,
        updatedAt: new Date()
      };

      logger.info('Notification settings updated', { userId });
      return db.notificationSettings[userId];
    } catch (error) {
      logger.error('Update notification settings error', error);
      throw error;
    }
  }

  async getUserActivities(userId) {
    try {
      if (!db.userActivities) db.userActivities = [];
      return db.userActivities.filter(a => a.userId === userId);
    } catch (error) {
      logger.error('Get user activities error', error);
      throw error;
    }
  }

  async createSupportTicket(userId, data) {
    try {
      const ticket = {
        id: uuidv4(),
        userId,
        ...data,
        status: 'open',
        createdAt: new Date()
      };

      if (!db.supportTickets) db.supportTickets = [];
      db.supportTickets.push(ticket);

      logger.info('Support ticket created', { userId, ticketId: ticket.id });
      return ticket;
    } catch (error) {
      logger.error('Create support ticket error', error);
      throw error;
    }
  }

  async getReferralStats(userId) {
    try {
      const referralService = require('./referralService');
      const stats = referralService.getUserReferralStats(userId);
      return stats;
    } catch (error) {
      logger.error('Get referral stats error', error, { userId });
      throw error;
    }
  }

  async claimReferralReward(userId) {
    try {
      const user = db.getUserById(userId);
      if (!user) {
        throw new ValidationError('User not found');
      }

      const pendingRewards = user.referralRewards || 0;
      if (pendingRewards <= 0) {
        throw new ValidationError('No pending referral rewards to claim');
      }

      // Add rewards to portfolio/balance
      const portfolio = db.getPortfolio(userId);
      if (portfolio) {
        const newBalance = (portfolio.balance || 0) + pendingRewards;
        db.updatePortfolio(userId, { balance: newBalance });
      }

      // Reset referral rewards
      db.updateUser(userId, { referralRewards: 0 });

      logger.info('Referral reward claimed', { userId, amount: pendingRewards });

      return {
        success: true,
        amountClaimed: pendingRewards,
        message: `Successfully claimed $${pendingRewards} referral bonus`
      };
    } catch (error) {
      logger.error('Claim referral reward error', error, { userId });
      throw error;
    }
  }
}

module.exports = new UserService();
