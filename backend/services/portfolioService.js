/**
 * Portfolio Service
 */

const db = require('../models/database');
const investmentService = require('./investmentService');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

class PortfolioService {
  async getPortfolio(userId) {
    try {
      let portfolio = db.getPortfolio(userId);
      if (!portfolio) {
        portfolio = db.initPortfolio(userId);
      }

      const investments = investmentService.getInvestmentsByUserId(userId);
      const investmentDetails = investments.map(inv => ({
        ...inv,
        currentReturns: investmentService.calculateReturns(inv)
      }));

      const totalReturns = investmentDetails.reduce((sum, inv) => sum + inv.currentReturns, 0);

      return {
        ...portfolio,
        investments: investmentDetails,
        totalReturns: Math.floor(totalReturns * 100) / 100,
        totalInvested: investments.reduce((sum, inv) => sum + inv.amount, 0)
      };
    } catch (error) {
      logger.error('Portfolio retrieval error', error, { userId });
      throw error;
    }
  }

  async deposit(userId, amount) {
    try {
      if (amount <= 0) {
        throw new ValidationError('Deposit amount must be greater than 0');
      }

      let portfolio = db.getPortfolio(userId);
      if (!portfolio) {
        portfolio = db.initPortfolio(userId);
      }

      const newBalance = portfolio.balance + amount;
      const updated = db.updatePortfolio(userId, {
        balance: newBalance
      });

      // Record transaction
      db.recordTransaction({
        userId,
        type: 'deposit',
        amount,
        balanceAfter: newBalance,
        status: 'completed'
      });

      logger.info('Deposit recorded', { userId, amount, newBalance });
      return updated;
    } catch (error) {
      logger.error('Deposit error', error, { userId, amount });
      throw error;
    }
  }

  async withdraw(userId, amount) {
    try {
      if (amount <= 0) {
        throw new ValidationError('Withdrawal amount must be greater than 0');
      }

      const portfolio = db.getPortfolio(userId);
      if (!portfolio) {
        throw new ValidationError('Portfolio not found');
      }

      if (portfolio.balance < amount) {
        throw new ValidationError('Insufficient balance');
      }

      const newBalance = portfolio.balance - amount;
      const updated = db.updatePortfolio(userId, {
        balance: newBalance
      });

      // Record transaction
      db.recordTransaction({
        userId,
        type: 'withdrawal',
        amount,
        balanceAfter: newBalance,
        status: 'completed'
      });

      logger.info('Withdrawal recorded', { userId, amount, newBalance });
      return updated;
    } catch (error) {
      logger.error('Withdrawal error', error, { userId, amount });
      throw error;
    }
  }

  async getEarnings(userId) {
    try {
      const investments = investmentService.getInvestmentsByUserId(userId);
      const earnings = investments.reduce((total, inv) => {
        return total + investmentService.calculateReturns(inv);
      }, 0);

      return {
        totalEarnings: Math.floor(earnings * 100) / 100,
        activeInvestments: investments.filter(inv => inv.status === 'active').length,
        totalInvested: investments.reduce((sum, inv) => sum + inv.amount, 0)
      };
    } catch (error) {
      logger.error('Earnings calculation error', error, { userId });
      throw error;
    }
  }

  async getTransactionHistory(userId) {
    try {
      return db.getTransactionsByUserId(userId);
    } catch (error) {
      logger.error('Transaction history error', error, { userId });
      throw error;
    }
  }
}

module.exports = new PortfolioService();
