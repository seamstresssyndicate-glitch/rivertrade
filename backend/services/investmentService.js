/**
 * Investment Service
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../models/database');
const { INVESTMENT_PLANS, INVESTMENT_STATUS } = require('../config/constants');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

class InvestmentService {
  getPlans() {
    return INVESTMENT_PLANS;
  }

  getPlanById(planId) {
    return INVESTMENT_PLANS.find(plan => plan.id === planId) || null;
  }

  async createInvestment(userId, planId, amount) {
    try {
      const plan = this.getPlanById(planId);

      if (!plan) {
        throw new ValidationError('Invalid investment plan');
      }

      if (amount < plan.minAmount || amount > plan.maxAmount) {
        throw new ValidationError(
          `Amount must be between ${plan.minAmount} and ${plan.maxAmount}`
        );
      }

      const investmentId = uuidv4();
      const investment = {
        id: investmentId,
        userId,
        planId,
        planName: plan.name,
        amount,
        status: INVESTMENT_STATUS.PENDING,
        returnRate: plan.returnRate,
        duration: plan.duration,
        startDate: null,
        endDate: null,
        returns: 0
      };

      db.createInvestment(investment);
      logger.info('Investment created', { investmentId, userId, planId, amount });

      return investment;
    } catch (error) {
      logger.error('Investment creation error', error, { userId, planId, amount });
      throw error;
    }
  }

  getInvestmentById(investmentId) {
    return db.getInvestmentById(investmentId);
  }

  getInvestmentsByUserId(userId) {
    return db.getInvestmentsByUserId(userId);
  }

  async activateInvestment(investmentId) {
    try {
      const investment = db.getInvestmentById(investmentId);

      if (!investment) {
        throw new ValidationError('Investment not found');
      }

      const updated = db.updateInvestment(investmentId, {
        status: INVESTMENT_STATUS.ACTIVE,
        startDate: new Date()
      });

      logger.info('Investment activated', { investmentId });
      return updated;
    } catch (error) {
      logger.error('Investment activation error', error);
      throw error;
    }
  }

  async cancelInvestment(investmentId) {
    try {
      const investment = db.getInvestmentById(investmentId);

      if (!investment) {
        throw new ValidationError('Investment not found');
      }

      if (investment.status === INVESTMENT_STATUS.CANCELLED) {
        throw new ValidationError('Investment is already cancelled');
      }

      const updated = db.updateInvestment(investmentId, {
        status: INVESTMENT_STATUS.CANCELLED
      });

      logger.info('Investment cancelled', { investmentId });
      return updated;
    } catch (error) {
      logger.error('Investment cancellation error', error);
      throw error;
    }
  }

  calculateReturns(investment) {
    if (investment.status !== INVESTMENT_STATUS.ACTIVE) {
      return 0;
    }

    const daysActive = Math.floor(
      (new Date() - new Date(investment.startDate)) / (1000 * 60 * 60 * 24)
    );
    const monthsActive = daysActive / 30;
    const returnAmount = investment.amount * (investment.returnRate / 100) * monthsActive;

    return Math.floor(returnAmount * 100) / 100;
  }
}

module.exports = new InvestmentService();
