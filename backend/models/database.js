/**
 * Mock Database Models
 * Replace with actual database models (MongoDB, PostgreSQL, etc.) later
 */

class Database {
  constructor() {
    this.users = {};
    this.investments = [];
    this.portfolios = {};
    this.transactions = [];
    this.supportTickets = [];
    this.announcements = [];
    this.kycSubmissions = [];
    this.twoFactorAuth = {};
    this.notificationSettings = {};
    this.userActivities = [];
    this.contactMessages = [];
    this.referralCodes = {}; // Store referral codes and their associated rewards
  }

  // User operations
  createUser(email, userData) {
    if (this.users[email]) return null;
    this.users[email] = { 
      email, 
      ...userData, 
      createdAt: new Date(),
      status: 'active',
      kycStatus: 'pending',
      twoFactorEnabled: false,
      referralCode: userData.referralCode || null,
      referredBy: userData.referralCode || null,
      referralRewards: 0 
    };
    return this.users[email];
  }

  getUserByEmail(email) {
    return this.users[email] || null;
  }

  getUserById(id) {
    const user = Object.values(this.users).find(u => u.id === id);
    return user || null;
  }

  updateUser(id, updates) {
    const user = this.getUserById(id);
    if (user) {
      const updatedUser = { ...user, ...updates, updatedAt: new Date() };
      this.users[user.email] = updatedUser;
      return updatedUser;
    }
    return null;
  }

  deleteUser(id) {
    const user = this.getUserById(id);
    if (user) {
      delete this.users[user.email];
      return true;
    }
    return false;
  }

  getAllUsers() {
    return Object.values(this.users);
  }

  // Investment operations
  createInvestment(investment) {
    this.investments.push({
      ...investment,
      createdAt: new Date()
    });
    return investment;
  }

  getInvestmentById(id) {
    return this.investments.find(inv => inv.id === id) || null;
  }

  getInvestmentsByUserId(userId) {
    return this.investments.filter(inv => inv.userId === userId);
  }

  updateInvestment(id, updates) {
    const investment = this.getInvestmentById(id);
    if (investment) {
      Object.assign(investment, updates, { updatedAt: new Date() });
    }
    return investment;
  }

  // Portfolio operations
  getPortfolio(userId) {
    return this.portfolios[userId] || null;
  }

  initPortfolio(userId) {
    if (!this.portfolios[userId]) {
      this.portfolios[userId] = {
        userId,
        balance: 0,
        earnings: 0,
        investments: [],
        createdAt: new Date()
      };
    }
    return this.portfolios[userId];
  }

  updatePortfolio(userId, updates) {
    if (!this.portfolios[userId]) this.initPortfolio(userId);
    this.portfolios[userId] = {
      ...this.portfolios[userId],
      ...updates,
      updatedAt: new Date()
    };
    return this.portfolios[userId];
  }

  // Transaction operations
  recordTransaction(transaction) {
    this.transactions.push({
      ...transaction,
      timestamp: new Date()
    });
    return transaction;
  }

  getTransactionsByUserId(userId) {
    return this.transactions.filter(t => t.userId === userId);
  }

  // Contact Message operations
  recordContactMessage(message) {
    this.contactMessages.push({
      ...message,
      createdAt: new Date()
    });
    return message;
  }

  getContactMessages() {
    return this.contactMessages;
  }

  getContactMessageById(messageId) {
    return this.contactMessages.find(m => m.id === messageId) || null;
  }

  updateContactMessage(messageId, updates) {
    const index = this.contactMessages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      this.contactMessages[index] = {
        ...this.contactMessages[index],
        ...updates,
        updatedAt: new Date()
      };
      return this.contactMessages[index];
    }
    return null;
  }

  deleteContactMessage(messageId) {
    const index = this.contactMessages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      this.contactMessages.splice(index, 1);
      return true;
    }
    return false;
  }

  // Referral operations
  generateReferralCode(userId) {
    // Generate a unique referral code (8 character alphanumeric)
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.referralCodes[code] = {
      code,
      userId,
      createdAt: new Date(),
      usageCount: 0,
      totalRewardsEarned: 0
    };
    return code;
  }

  getReferralCode(code) {
    return this.referralCodes[code] || null;
  }

  validateReferralCode(code) {
    const referral = this.referralCodes[code];
    return referral ? true : false;
  }

  recordReferralUsage(referralCode, newUserId) {
    const referral = this.referralCodes[referralCode];
    if (referral) {
      referral.usageCount++;
      return true;
    }
    return false;
  }

  addReferralReward(userId, amount) {
    const user = this.getUserById(userId);
    if (user) {
      user.referralRewards = (user.referralRewards || 0) + amount;
      return true;
    }
    return false;
  }

  getReferralStats(userId) {
    let referralCode = null;
    let stats = { usageCount: 0, totalRewards: 0 };

    // Find the user's referral code
    for (const [code, referral] of Object.entries(this.referralCodes)) {
      if (referral.userId === userId) {
        referralCode = code;
        stats = {
          usageCount: referral.usageCount,
          totalRewards: referral.totalRewardsEarned
        };
        break;
      }
    }

    return { referralCode, stats };
  }
}

// Export singleton instance
module.exports = new Database();
