/**
 * Investment Routes
 */

const express = require('express');
const router = express.Router();
const investmentService = require('../services/investmentService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateInvestment, handleValidationErrors } = require('../validators/inputValidator');
const { sendSuccess, sendError } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * GET /api/investments/plans
 * Get all investment plans (public)
 */
router.get('/plans', (req, res) => {
  try {
    const plans = investmentService.getPlans();
    sendSuccess(res, { plans, count: plans.length }, 200, 'Plans retrieved successfully');
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * POST /api/investments/create
 * Create a new investment
 */
router.post('/create', authenticateToken, validateInvestment, handleValidationErrors, async (req, res) => {
  try {
    const { planId, amount } = req.body;
    const userId = req.user.id;

    const investment = await investmentService.createInvestment(userId, planId, amount);
    sendSuccess(res, { investment }, 201, 'Investment created successfully');
  } catch (error) {
    sendError(res, error, error.statusCode || 400);
  }
});

/**
 * GET /api/investments/:investmentId
 * Get investment details
 */
router.get('/:investmentId', authenticateToken, async (req, res) => {
  try {
    const { investmentId } = req.params;
    const investment = investmentService.getInvestmentById(investmentId);

    if (!investment) {
      return sendError(res, { message: 'Investment not found' }, 404);
    }

    if (investment.userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    sendSuccess(res, { investment }, 200, 'Investment details retrieved');
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * GET /api/investments/user/:userId
 * Get all investments for a user
 */
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const investments = investmentService.getInvestmentsByUserId(userId);
    sendSuccess(res, { investments, count: investments.length }, 200, 'User investments retrieved');
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * PUT /api/investments/:investmentId/activate
 * Activate an investment
 */
router.put('/:investmentId/activate', authenticateToken, async (req, res) => {
  try {
    const { investmentId } = req.params;
    const investment = investmentService.getInvestmentById(investmentId);

    if (!investment) {
      return sendError(res, { message: 'Investment not found' }, 404);
    }

    if (investment.userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const updated = await investmentService.activateInvestment(investmentId);
    sendSuccess(res, { investment: updated }, 200, 'Investment activated');
  } catch (error) {
    sendError(res, error, error.statusCode || 400);
  }
});

/**
 * PUT /api/investments/:investmentId/cancel
 * Cancel an investment
 */
router.put('/:investmentId/cancel', authenticateToken, async (req, res) => {
  try {
    const { investmentId } = req.params;
    const investment = investmentService.getInvestmentById(investmentId);

    if (!investment) {
      return sendError(res, { message: 'Investment not found' }, 404);
    }

    if (investment.userId !== req.user.id) {
      return sendError(res, { message: 'Unauthorized' }, 403);
    }

    const updated = await investmentService.cancelInvestment(investmentId);
    sendSuccess(res, { investment: updated }, 200, 'Investment cancelled');
  } catch (error) {
    sendError(res, error, error.statusCode || 400);
  }
});

module.exports = router;
