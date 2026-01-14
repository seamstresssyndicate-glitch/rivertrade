/**
 * Transaction Service
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../models/database');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

class TransactionService {
  async initiateDeposit(data) {
    try {
      const { userId, amount, method, currency } = data;

      if (amount <= 0) {
        throw new ValidationError('Amount must be greater than 0');
      }

      const transaction = {
        id: uuidv4(),
        userId,
        type: 'deposit',
        amount,
        method,
        currency,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      db.recordTransaction(transaction);
      logger.info('Deposit initiated', { userId, amount, method });

      return transaction;
    } catch (error) {
      logger.error('Initiate deposit error', error);
      throw error;
    }
  }

  async initiateWithdrawal(data) {
    try {
      const { userId, amount, method, address } = data;

      if (amount <= 0) {
        throw new ValidationError('Amount must be greater than 0');
      }

      const portfolio = db.getPortfolio(userId);
      if (!portfolio || portfolio.balance < amount) {
        throw new ValidationError('Insufficient balance');
      }

      const transaction = {
        id: uuidv4(),
        userId,
        type: 'withdrawal',
        amount,
        method,
        address,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      db.recordTransaction(transaction);
      logger.info('Withdrawal initiated', { userId, amount, method });

      return transaction;
    } catch (error) {
      logger.error('Initiate withdrawal error', error);
      throw error;
    }
  }

  async getUserTransactions(userId, type = null) {
    try {
      let transactions = db.getTransactionsByUserId(userId);

      if (type) {
        transactions = transactions.filter(t => t.type === type);
      }

      return transactions;
    } catch (error) {
      logger.error('Get user transactions error', error);
      throw error;
    }
  }

  async getUserDeposits(userId) {
    try {
      return db.getTransactionsByUserId(userId).filter(t => t.type === 'deposit');
    } catch (error) {
      logger.error('Get user deposits error', error);
      throw error;
    }
  }

  async getUserWithdrawals(userId) {
    try {
      return db.getTransactionsByUserId(userId).filter(t => t.type === 'withdrawal');
    } catch (error) {
      logger.error('Get user withdrawals error', error);
      throw error;
    }
  }

  async getTransactionStatus(transactionId) {
    try {
      const transaction = db.transactions.find(t => t.id === transactionId);
      if (!transaction) {
        throw new ValidationError('Transaction not found');
      }
      return transaction;
    } catch (error) {
      logger.error('Get transaction status error', error);
      throw error;
    }
  }

  async cancelTransaction(transactionId) {
    try {
      const transaction = db.transactions.find(t => t.id === transactionId);

      if (!transaction) {
        throw new ValidationError('Transaction not found');
      }

      if (transaction.status !== 'pending') {
        throw new ValidationError('Only pending transactions can be cancelled');
      }

      transaction.status = 'cancelled';
      transaction.updatedAt = new Date();

      logger.info('Transaction cancelled', { transactionId });
      return transaction;
    } catch (error) {
      logger.error('Cancel transaction error', error);
      throw error;
    }
  }
}

module.exports = new TransactionService();
