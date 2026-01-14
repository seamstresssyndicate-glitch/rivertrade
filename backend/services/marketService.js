/**
 * Market Service
 * Handles cryptocurrency market data
 */

const logger = require('../utils/logger');
const { ValidationError } = require('../utils/errors');

class MarketService {
  async getPrices(currency = 'usd', assets = null) {
    try {
      // Mock data - replace with real API calls to CoinGecko, Binance, etc.
      const prices = {
        bitcoin: { usd: 42500, eur: 39500, gbp: 33500 },
        ethereum: { usd: 2300, eur: 2100, gbp: 1850 },
        ripple: { usd: 0.52, eur: 0.48, gbp: 0.42 },
        litecoin: { usd: 95, eur: 88, gbp: 75 }
      };

      const result = {};
      for (const [asset, priceData] of Object.entries(prices)) {
        result[asset] = priceData[currency] || priceData.usd;
      }

      return result;
    } catch (error) {
      logger.error('Get prices error', error);
      throw error;
    }
  }

  async getBitcoinData(currency = 'usd') {
    try {
      // Mock Bitcoin data
      return {
        price: 42500,
        change24h: 2.5,
        change7d: -1.2,
        marketCap: 850000000000,
        volume24h: 32000000000,
        dominance: 45.2,
        currency
      };
    } catch (error) {
      logger.error('Get Bitcoin data error', error);
      throw error;
    }
  }

  async getChartData(asset, timeframe = '1d', currency = 'usd') {
    try {
      // Mock chart data
      const basePrice = 42500;
      const chartData = [];

      const pointCount = {
        '1h': 60,
        '4h': 96,
        '1d': 30,
        '1w': 52,
        '1m': 365
      };

      const count = pointCount[timeframe] || 30;

      for (let i = 0; i < count; i++) {
        const variation = (Math.random() - 0.5) * 500;
        chartData.push({
          time: new Date(Date.now() - (count - i) * 86400000),
          price: basePrice + variation,
          volume: Math.random() * 1000000000
        });
      }

      return {
        asset,
        timeframe,
        currency,
        data: chartData
      };
    } catch (error) {
      logger.error('Get chart data error', error);
      throw error;
    }
  }

  async getTrendingAssets() {
    try {
      // Mock trending data
      return [
        { name: 'Bitcoin', symbol: 'BTC', change: 2.5, rank: 1 },
        { name: 'Ethereum', symbol: 'ETH', change: 1.8, rank: 2 },
        { name: 'Ripple', symbol: 'XRP', change: 5.2, rank: 6 },
        { name: 'Cardano', symbol: 'ADA', change: -1.5, rank: 4 }
      ];
    } catch (error) {
      logger.error('Get trending assets error', error);
      throw error;
    }
  }

  async getMarketPerformance() {
    try {
      // Mock market performance
      return {
        btcDominance: 45.2,
        ethDominance: 18.5,
        altDominance: 36.3,
        totalMarketCap: 1800000000000,
        volume24h: 75000000000,
        fearGreedIndex: 65,
        trend: 'bullish'
      };
    } catch (error) {
      logger.error('Get market performance error', error);
      throw error;
    }
  }
}

module.exports = new MarketService();
