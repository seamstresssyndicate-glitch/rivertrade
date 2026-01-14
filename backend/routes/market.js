/**
 * Market Data Routes
 */

const express = require('express');
const router = express.Router();
const marketService = require('../services/marketService');
const { sendSuccess, sendError } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * GET /api/market/prices
 * Get current cryptocurrency prices
 */
router.get('/prices', async (req, res) => {
  try {
    const { currency = 'usd', assets } = req.query;
    const prices = await marketService.getPrices(currency, assets);
    sendSuccess(res, { prices }, 200, 'Prices retrieved');
  } catch (error) {
    logger.error('Get prices error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/market/bitcoin
 * Get Bitcoin data
 */
router.get('/bitcoin', async (req, res) => {
  try {
    const { currency = 'usd' } = req.query;
    const bitcoinData = await marketService.getBitcoinData(currency);
    sendSuccess(res, { bitcoin: bitcoinData }, 200, 'Bitcoin data retrieved');
  } catch (error) {
    logger.error('Get Bitcoin data error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/market/chart/:asset
 * Get chart data for asset
 */
router.get('/chart/:asset', async (req, res) => {
  try {
    const { asset } = req.params;
    const { timeframe = '1d', currency = 'usd' } = req.query;
    const chartData = await marketService.getChartData(asset, timeframe, currency);
    sendSuccess(res, { chartData }, 200, 'Chart data retrieved');
  } catch (error) {
    logger.error('Get chart data error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/market/trending
 * Get trending assets
 */
router.get('/trending', async (req, res) => {
  try {
    const trending = await marketService.getTrendingAssets();
    sendSuccess(res, { trending }, 200, 'Trending assets retrieved');
  } catch (error) {
    logger.error('Get trending error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/market/performance
 * Get market performance
 */
router.get('/performance', async (req, res) => {
  try {
    const performance = await marketService.getMarketPerformance();
    sendSuccess(res, { performance }, 200, 'Market performance retrieved');
  } catch (error) {
    logger.error('Get performance error', error);
    sendError(res, error);
  }
});

module.exports = router;
