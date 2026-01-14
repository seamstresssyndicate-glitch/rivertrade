/**
 * Authentication API Client
 * Wrapper for backend authentication endpoints
 */

class AuthAPI {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
  }

  /**
   * Make authenticated request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers
      });

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/auth.html';
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Get user profile
   * @returns {Promise} User profile
   */
  async getProfile() {
    return this.request('/users/profile');
  }

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   * @returns {Promise} Updated profile
   */
  async updateProfile(updates) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} Change response
   */
  async changePassword(currentPassword, newPassword) {
    return this.request('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  /**
   * Enable 2FA
   * @returns {Promise} 2FA setup response
   */
  async enable2FA() {
    return this.request('/users/2fa/enable', {
      method: 'POST'
    });
  }

  /**
   * Verify 2FA code
   * @param {string} code - 2FA code
   * @returns {Promise} Verification response
   */
  async verify2FA(code) {
    return this.request('/users/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }

  /**
   * Disable 2FA
   * @param {string} password - User password for confirmation
   * @returns {Promise} Disable response
   */
  async disable2FA(password) {
    return this.request('/users/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  }

  /**
   * Validate referral code
   * @param {string} code - The referral code to validate
   * @returns {Promise} Validation response
   */
  async validateReferralCode(code) {
    try {
      const response = await fetch(`${this.baseURL}/referrals/validate/${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to validate referral code');
      }

      return await response.json();
    } catch (error) {
      console.error('Referral validation error:', error);
      throw error;
    }
  }

  /**
   * Get user's referral statistics
   * @returns {Promise} Referral stats
   */
  async getReferralStats() {
    return this.request('/referrals/stats');
  }

  /**
   * Claim referral rewards
   * @returns {Promise} Claim response
   */
  async claimReferralReward() {
    return this.request('/referrals/claim-reward', {
      method: 'POST'
    });
  }

  /**
   * Get referral information
   * @param {string} code - The referral code
   * @returns {Promise} Referral information
   */
  async getReferralInfo(code) {
    try {
      const response = await fetch(`${this.baseURL}/referrals/info/${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get referral information');
      }

      return await response.json();
    } catch (error) {
      console.error('Get referral info error:', error);
      throw error;
    }
  }
}

// Create global instance
const authAPI = new AuthAPI();
