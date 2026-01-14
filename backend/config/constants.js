/**
 * Constants and Configuration
 */

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User already exists with this email',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
  MISSING_API_KEY: 'Missing API Key',
  INVALID_API_KEY: 'Invalid API Key',
  RECAPTCHA_FAILED: 'reCAPTCHA verification failed',
  INVALID_INPUT: 'Invalid input provided',
  SERVER_ERROR: 'Internal server error',
  UNAUTHORIZED: 'Unauthorized access'
};

const INVESTMENT_PLANS = [
  {
    id: '1',
    name: 'Starter Plan',
    minAmount: 100,
    maxAmount: 1000,
    returnRate: 5,
    duration: 30,
    description: 'Perfect for beginners'
  },
  {
    id: '2',
    name: 'Professional Plan',
    minAmount: 1000,
    maxAmount: 10000,
    returnRate: 8,
    duration: 60,
    description: 'For experienced traders'
  },
  {
    id: '3',
    name: 'Premium Plan',
    minAmount: 10000,
    maxAmount: 100000,
    returnRate: 12,
    duration: 90,
    description: 'Maximum returns'
  }
];

const INVESTMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PAUSED: 'paused'
};

module.exports = {
  HTTP_STATUS,
  ERROR_MESSAGES,
  INVESTMENT_PLANS,
  INVESTMENT_STATUS
};
