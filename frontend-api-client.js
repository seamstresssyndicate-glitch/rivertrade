/**
 * Frontend API Client
 * Handles all communication with the backend server
 */

class APIClient {
  constructor(baseURL = 'http://localhost:5000', apiKey = 'rivertrade-secret-api-key-2026') {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  /**
   * Make an API request
   * @param {string} endpoint - API endpoint path
   * @param {object} options - Request options (method, body, headers, etc.)
   * @returns {Promise} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...options.headers
    };

    // Add auth token if available
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed (${endpoint}):`, error);
      throw error;
    }
  }

  // HTTP Methods
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, { method: 'POST', body: data });
  }

  put(endpoint, data) {
    return this.request(endpoint, { method: 'PUT', body: data });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ===== AUTH ENDPOINTS =====
  async register(email, password, fullName, recaptchaToken) {
    return this.post('/api/auth/register', { 
      email, 
      password, 
      fullName,
      recaptchaToken 
    });
  }

  async login(email, password, recaptchaToken) {
    const response = await this.post('/api/auth/login', { 
      email, 
      password,
      recaptchaToken 
    });
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userId', response.userId);
      localStorage.setItem('userEmail', response.email);
    }
    return response;
  }

  async verifyToken() {
    return this.get('/api/auth/verify');
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
  }

  // ===== INVESTMENT ENDPOINTS =====
  async getInvestmentPlans() {
    return this.get('/api/investments');
  }

  async createInvestment(userId, planId, amount) {
    return this.post('/api/investments/create', { userId, planId, amount });
  }

  async getInvestmentDetails(investmentId) {
    return this.get(`/api/investments/${investmentId}`);
  }

  async updateInvestment(investmentId, data) {
    return this.put(`/api/investments/${investmentId}`, data);
  }

  // ===== PORTFOLIO ENDPOINTS =====
  async getPortfolio(userId) {
    return this.get(`/api/portfolio/${userId}`);
  }

  async depositFunds(userId, amount) {
    return this.post(`/api/portfolio/${userId}/deposit`, { amount });
  }

  async getEarnings(userId) {
    return this.get(`/api/portfolio/${userId}/earnings`);
  }

  // ===== CONTACT & ABOUT ENDPOINTS (PUBLIC) =====
  
  // Contact endpoints
  async submitContactForm(name, email, category, message, phone = null) {
    return this.post('/api/contact/send-message', {
      name,
      email,
      category,
      message,
      phone
    });
  }

  async getContactCategories() {
    return this.get('/api/contact/categories');
  }

  async getFAQs() {
    return this.get('/api/contact/faq');
  }

  // About endpoints
  async getCompanyInfo() {
    return this.get('/api/about/company-info');
  }

  async getCompanyValues() {
    return this.get('/api/about/values');
  }

  async getTeamMembers() {
    return this.get('/api/about/team');
  }

  async getTestimonials() {
    return this.get('/api/about/testimonials');
  }

  async getStatistics() {
    return this.get('/api/about/statistics');
  }

  async getFeatures() {
    return this.get('/api/about/features');
  }

  // ===== UTILITY METHODS =====
  isLoggedIn() {
    return !!localStorage.getItem('authToken');
  }

  getUserId() {
    return localStorage.getItem('userId');
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }
}

// Initialize global API client
const apiClient = new APIClient('http://localhost:5000', 'rivertrade-secret-api-key-2026');

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = apiClient;
}
