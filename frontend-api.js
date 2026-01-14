/**
 * Frontend API Client
 * General purpose API client for all backend requests
 */

class FrontendAPI {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
  }

  /**
   * Make API request with authentication
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

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/auth.html';
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed (${endpoint}):`, error);
      throw error;
    }
  }

  // ===== PORTFOLIO ENDPOINTS =====
  async getPortfolio() {
    return this.request('/portfolio');
  }

  async getPortfolioSummary() {
    return this.request('/portfolio/summary');
  }

  // ===== INVESTMENT ENDPOINTS =====
  async getInvestmentPlans() {
    return this.request('/investments/plans');
  }

  async createInvestment(investmentData) {
    return this.request('/investments', {
      method: 'POST',
      body: investmentData
    });
  }

  async getMyInvestments() {
    return this.request('/investments/my-investments');
  }

  async getInvestmentDetails(investmentId) {
    return this.request(`/investments/${investmentId}`);
  }

  // ===== TRANSACTION ENDPOINTS =====
  async getTransactions() {
    return this.request('/transactions');
  }

  async deposit(amount, method) {
    return this.request('/transactions/deposit', {
      method: 'POST',
      body: { amount, method }
    });
  }

  async withdraw(amount, address) {
    return this.request('/transactions/withdraw', {
      method: 'POST',
      body: { amount, address }
    });
  }

  // ===== MARKET DATA ENDPOINTS =====
  async getMarketData() {
    return this.request('/market/data');
  }

  async getCoinPrice(symbol) {
    return this.request(`/market/price/${symbol}`);
  }

  async getMarketTicker() {
    return this.request('/market/ticker');
  }

  // ===== CONTACT ENDPOINTS =====
  async sendContactMessage(message) {
    return this.request('/contact', {
      method: 'POST',
      body: message
    });
  }

  async getContactMessages() {
    return this.request('/contact/messages');
  }

  // ===== ADMIN ENDPOINTS =====
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getUsers() {
    return this.request('/admin/users');
  }

  async getUserStats() {
    return this.request('/admin/users/stats');
  }

  async updateUserStatus(userId, status) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: { status }
    });
  }

  async getAllTransactions() {
    return this.request('/admin/transactions');
  }

  async getAllInvestments() {
    return this.request('/admin/investments');
  }

  async getKYCRequests() {
    return this.request('/admin/kyc/requests');
  }

  async approveKYC(kycId) {
    return this.request(`/admin/kyc/${kycId}/approve`, {
      method: 'PUT'
    });
  }

  async rejectKYC(kycId, reason) {
    return this.request(`/admin/kyc/${kycId}/reject`, {
      method: 'PUT',
      body: { reason }
    });
  }
}

// Create global instance
const frontendAPI = new FrontendAPI();
