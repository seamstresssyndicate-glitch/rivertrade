/**
 * Request Logger Middleware
 */

const morgan = require('morgan');
const logger = require('../utils/logger');

// Custom morgan token for logging
morgan.token('user-id', (req) => req.user?.id || 'anonymous');

// Custom morgan format
const morganFormat = ':method :url :status :res[content-length] - :response-time ms [:user-id]';

// Create morgan middleware
const requestLogger = morgan(morganFormat, {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  }
});

module.exports = requestLogger;
