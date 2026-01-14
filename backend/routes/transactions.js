/**
 * Transaction Routes
 */

const express = require('express');
const router = express.Router();
const transactionService = require('../services/transactionService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateDeposit, handleValidationErrors } = require('../validators/inputValidator');
const { sendSuccess, sendError } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * POST /api/transactions/deposit
 * Initiate deposit
 */
router.post('/deposit', authenticateToken, validateDeposit, handleValidationErrors, async (req, res) => {
  try {
    const { amount, method, currency } = req.body;
    const userId = req.user.id;

    const transaction = await transactionService.initiateDeposit({
      userId,
      amount,
      method,
      currency
    });

    sendSuccess(res, { transaction }, 201, 'Deposit initiated');
  } catch (error) {
    logger.error('Deposit error', error);
    sendError(res, error, error.statusCode || 400);
  }
});

/**
 * POST /api/transactions/withdraw
 * Initiate withdrawal
 */
router.post('/withdraw', authenticateToken, validateDeposit, handleValidationErrors, async (req, res) => {
  try {
    const { amount, method, address } = req.body;
    const userId = req.user.id;

    const transaction = await transactionService.initiateWithdrawal({
      userId,
      amount,
      method,
      address
    });

    sendSuccess(res, { transaction }, 201, 'Withdrawal initiated');
  } catch (error) {
    logger.error('Withdrawal error', error);
    sendError(res, error, error.statusCode || 400);
  }
});

/**
 * GET /api/transactions/:userId
 * Get user transactions
 */
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const type = req.query.type;
    const transactions = await transactionService.getUserTransactions(userId, type);
    sendSuccess(res, { transactions, count: transactions.length }, 200, 'Transactions retrieved');
  } catch (error) {
    logger.error('Get transactions error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/transactions/:userId/deposits
 * Get user deposits
 */
router.get('/:userId/deposits', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const deposits = await transactionService.getUserDeposits(userId);
    sendSuccess(res, { deposits, count: deposits.length }, 200, 'Deposits retrieved');
  } catch (error) {
    logger.error('Get deposits error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/transactions/:userId/withdrawals
 * Get user withdrawals
 */
router.get('/:userId/withdrawals', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const withdrawals = await transactionService.getUserWithdrawals(userId);
    sendSuccess(res, { withdrawals, count: withdrawals.length }, 200, 'Withdrawals retrieved');
  } catch (error) {
    logger.error('Get withdrawals error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/transactions/status/:transactionId
 * Check transaction status
 */
router.get('/status/:transactionId', authenticateToken, async (req, res) => {
  try {
    const transaction = await transactionService.getTransactionStatus(req.params.transactionId);
    sendSuccess(res, { transaction }, 200, 'Transaction status retrieved');
  } catch (error) {
    logger.error('Get transaction status error', error);
    sendError(res, error);
  }
});

/**
 * POST /api/transactions/:transactionId/cancel
 * Cancel pending transaction
 */
router.post('/:transactionId/cancel', authenticateToken, async (req, res) => {
  try {
    const transaction = await transactionService.cancelTransaction(req.params.transactionId);
    sendSuccess(res, { transaction }, 200, 'Transaction cancelled');
  } catch (error) {
    logger.error('Cancel transaction error', error);
    sendError(res, error, error.statusCode || 400);
  }
});

module.exports = router;
