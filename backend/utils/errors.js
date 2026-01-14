/**
 * Custom Error Class
 */
class APIError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
  }
}

/**
 * Validation Error Class
 */
class ValidationError extends APIError {
  constructor(message, details = null) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error Class
 */
class AuthError extends APIError {
  constructor(message = 'Authentication failed', details = null) {
    super(message, 401, details);
    this.name = 'AuthError';
  }
}

/**
 * Authorization Error Class
 */
class AuthorizationError extends APIError {
  constructor(message = 'Access denied', details = null) {
    super(message, 403, details);
    this.name = 'AuthorizationError';
  }
}

module.exports = {
  APIError,
  ValidationError,
  AuthError,
  AuthorizationError
};
