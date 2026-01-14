/**
 * Portfolio Routes
 */

const express = require('express');
const router = express.Router();
const portfolioService = require('../services/portfolioService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateDeposit, handleValidationErrors } = require('../validators/inputValidator');
const { sendSuccess, sendError } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * GET /api/portfolio/:userId
 * Get user portfolio
 */
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const portfolio = await portfolioService.getPortfolio(userId);
    sendSuccess(res, { portfolio }, 200, 'Portfolio retrieved');
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * POST /api/portfolio/:userId/deposit
 * Add funds to portfolio
 */
router.post('/:userId/deposit', authenticateToken, validateDeposit, handleValidationErrors, async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const portfolio = await portfolioService.deposit(userId, amount);
    sendSuccess(res, { portfolio }, 200, 'Deposit successful');
  } catch (error) {
    sendError(res, error, error.statusCode || 400);
  }
});

/**
 * POST /api/portfolio/:userId/withdraw
 * Withdraw funds from portfolio
 */
router.post('/:userId/withdraw', authenticateToken, validateDeposit, handleValidationErrors, async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const portfolio = await portfolioService.withdraw(userId, amount);
    sendSuccess(res, { portfolio }, 200, 'Withdrawal successful');
  } catch (error) {
    sendError(res, error, error.statusCode || 400);
  }
});

/**
 * GET /api/portfolio/:userId/earnings
 * Get portfolio earnings
 */
router.get('/:userId/earnings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const earnings = await portfolioService.getEarnings(userId);
    sendSuccess(res, { earnings }, 200, 'Earnings retrieved');
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * GET /api/portfolio/:userId/transactions
 * Get transaction history
 */
router.get('/:userId/transactions', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const transactions = await portfolioService.getTransactionHistory(userId);
    sendSuccess(res, { transactions, count: transactions.length }, 200, 'Transaction history retrieved');
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = router;
