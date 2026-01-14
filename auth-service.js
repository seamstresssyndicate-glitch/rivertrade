/**
 * Authentication Service
 * Handles all authentication-related API calls to the backend
 */

class AuthService {
  constructor(apiBaseURL = 'http://localhost:5000/api') {
    this.apiBaseURL = apiBaseURL;
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Registration response
   */
  async register(userData) {
    try {
      const response = await fetch(`${this.apiBaseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Login response
   */
  async login(email, password) {
    try {
      const response = await fetch(`${this.apiBaseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  }

  /**
   * Get current user
   * @returns {Object} Current user data
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Get auth token
   * @returns {string} Auth token
   */
  getToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Verify reCAPTCHA token
   * @param {string} token - reCAPTCHA token
   * @returns {Promise} Verification response
   */
  async verifyRecaptcha(token) {
    try {
      const response = await fetch(`${this.apiBaseURL}/auth/verify-recaptcha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      return await response.json();
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      throw error;
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise} New token
   */
  async refreshToken() {
    try {
      const response = await fetch(`${this.apiBaseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        this.logout();
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} Reset request response
   */
  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${this.apiBaseURL}/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      return await response.json();
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise} Reset response
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${this.apiBaseURL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });

      return await response.json();
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
}

// Create global instance
const authService = new AuthService();
