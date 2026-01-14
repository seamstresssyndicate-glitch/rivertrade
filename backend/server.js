const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import middleware
const { apiKeyAuth } = require('./middleware/apiAuth');
const { apiLimiter } = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const investmentRoutes = require('./routes/investments');
const portfolioRoutes = require('./routes/portfolio');
const adminRoutes = require('./routes/admin');
const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/users');
const marketRoutes = require('./routes/market');
const contactRoutes = require('./routes/contact');
const referralRoutes = require('./routes/referrals');

// Import utilities
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== SECURITY MIDDLEWARE =====
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// ===== BODY PARSER MIDDLEWARE =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ===== LOGGING MIDDLEWARE =====
app.use(requestLogger);

// ===== RATE LIMITING =====
app.use('/api/', apiLimiter);

// ===== PUBLIC ENDPOINTS =====
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Server is running',
    timestamp: new Date(),
    version: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV
  });
});

// ===== API KEY AUTHENTICATION =====
app.use('/api/', apiKeyAuth);

// ===== API ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/referrals', referralRoutes);

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// ===== ERROR HANDLER =====
app.use(errorHandler);

// ===== START SERVER =====
const server = app.listen(PORT, () => {
  logger.info(`🚀 Rivertrade Backend Server running`, {
    port: PORT,
    environment: process.env.NODE_ENV,
    url: `http://${process.env.SERVER_HOST}:${PORT}`
  });
  console.log(`
╔════════════════════════════════════════════════════╗
║   🚀 Rivertrade Backend Server Started             ║
╠════════════════════════════════════════════════════╣
║   Port: ${PORT}                                         ║
║   Environment: ${process.env.NODE_ENV}                          ║
║   API Version: ${process.env.API_VERSION || 'v1'}                              ║
║   URL: http://localhost:${PORT}                         ║
╚════════════════════════════════════════════════════╝
  `);
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;
