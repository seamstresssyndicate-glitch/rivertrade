/**
 * Admin Service
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../models/database');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

class AdminService {
  async getDashboardStats() {
    try {
      const allUsers = db.getAllUsers();
      const allInvestments = db.investments;
      const allTransactions = db.transactions;

      const stats = {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.status === 'active').length,
        totalInvestments: allInvestments.length,
        activeInvestments: allInvestments.filter(i => i.status === 'active').length,
        totalTransactions: allTransactions.length,
        totalDeposits: allTransactions
          .filter(t => t.type === 'deposit')
          .reduce((sum, t) => sum + t.amount, 0),
        totalWithdrawals: allTransactions
          .filter(t => t.type === 'withdrawal')
          .reduce((sum, t) => sum + t.amount, 0),
        pendingApprovals: allInvestments.filter(i => i.status === 'pending').length,
        pendingKYC: allUsers.filter(u => u.kycStatus === 'pending').length,
        systemHealth: {
          uptime: process.uptime(),
          timestamp: new Date()
        }
      };

      return stats;
    } catch (error) {
      logger.error('Get dashboard stats error', error);
      throw error;
    }
  }

  async getAllUsers(page = 1, limit = 10) {
    try {
      const users = db.getAllUsers();
      const total = users.length;
      const start = (page - 1) * limit;
      const paginatedUsers = users.slice(start, start + limit);

      return {
        users: paginatedUsers.map(u => ({
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          status: u.status,
          kycStatus: u.kycStatus,
          createdAt: u.createdAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get all users error', error);
      throw error;
    }
  }

  async searchUsers(query) {
    try {
      const users = db.getAllUsers();
      const filtered = users.filter(u =>
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        u.fullName.toLowerCase().includes(query.toLowerCase())
      );

      return filtered.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        status: u.status
      }));
    } catch (error) {
      logger.error('Search users error', error);
      throw error;
    }
  }

  async getUserDetails(userId) {
    try {
      const user = db.getUserById(userId);
      if (!user) return null;

      const userInvestments = db.getInvestmentsByUserId(userId);
      const userTransactions = db.getTransactionsByUserId(userId);

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt,
        investments: userInvestments,
        transactions: userTransactions,
        portfolio: db.getPortfolio(userId)
      };
    } catch (error) {
      logger.error('Get user details error', error);
      throw error;
    }
  }

  async updateUserStatus(userId, status) {
    try {
      const validStatuses = ['active', 'suspended', 'banned'];
      if (!validStatuses.includes(status)) {
        throw new ValidationError('Invalid status');
      }

      const user = db.updateUser(userId, { status });
      logger.info('User status updated', { userId, status });

      return user;
    } catch (error) {
      logger.error('Update user status error', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      db.deleteUser(userId);
      logger.info('User deleted', { userId });
    } catch (error) {
      logger.error('Delete user error', error);
      throw error;
    }
  }

  async getAllTransactions(page = 1, limit = 20) {
    try {
      const transactions = db.transactions;
      const total = transactions.length;
      const start = (page - 1) * limit;
      const paginated = transactions.slice(start, start + limit);

      return {
        transactions: paginated,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get all transactions error', error);
      throw error;
    }
  }

  async getTransactionDetails(transactionId) {
    try {
      const transaction = db.transactions.find(t => t.id === transactionId);
      return transaction || null;
    } catch (error) {
      logger.error('Get transaction details error', error);
      throw error;
    }
  }

  async getAllInvestments(page = 1, limit = 20) {
    try {
      const investments = db.investments;
      const total = investments.length;
      const start = (page - 1) * limit;
      const paginated = investments.slice(start, start + limit);

      return {
        investments: paginated,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get all investments error', error);
      throw error;
    }
  }

  async approveInvestment(investmentId) {
    try {
      const investment = db.updateInvestment(investmentId, {
        status: 'active',
        approvedAt: new Date()
      });

      logger.info('Investment approved', { investmentId });
      return investment;
    } catch (error) {
      logger.error('Approve investment error', error);
      throw error;
    }
  }

  async rejectInvestment(investmentId, reason) {
    try {
      const investment = db.updateInvestment(investmentId, {
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date()
      });

      logger.info('Investment rejected', { investmentId, reason });
      return investment;
    } catch (error) {
      logger.error('Reject investment error', error);
      throw error;
    }
  }

  async getKYCRequests() {
    try {
      const users = db.getAllUsers();
      return users.filter(u => u.kycStatus === 'pending');
    } catch (error) {
      logger.error('Get KYC requests error', error);
      throw error;
    }
  }

  async approveKYC(userId) {
    try {
      const user = db.updateUser(userId, { kycStatus: 'verified' });
      logger.info('KYC approved', { userId });
      return user;
    } catch (error) {
      logger.error('Approve KYC error', error);
      throw error;
    }
  }

  async rejectKYC(userId, reason) {
    try {
      const user = db.updateUser(userId, {
        kycStatus: 'rejected',
        kycRejectionReason: reason
      });
      logger.info('KYC rejected', { userId, reason });
      return user;
    } catch (error) {
      logger.error('Reject KYC error', error);
      throw error;
    }
  }

  async getSupportTickets(status = 'open') {
    try {
      return db.supportTickets.filter(t => t.status === status);
    } catch (error) {
      logger.error('Get support tickets error', error);
      throw error;
    }
  }

  async updateSupportTicket(ticketId, updates) {
    try {
      const ticketIndex = db.supportTickets.findIndex(t => t.id === ticketId);
      if (ticketIndex === -1) {
        throw new ValidationError('Ticket not found');
      }

      db.supportTickets[ticketIndex] = {
        ...db.supportTickets[ticketIndex],
        ...updates,
        updatedAt: new Date()
      };

      logger.info('Support ticket updated', { ticketId });
      return db.supportTickets[ticketIndex];
    } catch (error) {
      logger.error('Update support ticket error', error);
      throw error;
    }
  }

  async getReport(type = 'overview') {
    try {
      const stats = await this.getDashboardStats();

      const reports = {
        overview: stats,
        revenue: {
          deposits: stats.totalDeposits,
          withdrawals: stats.totalWithdrawals,
          net: stats.totalDeposits - stats.totalWithdrawals
        },
        users: {
          total: stats.totalUsers,
          active: stats.activeUsers,
          inactive: stats.totalUsers - stats.activeUsers
        },
        investments: {
          total: stats.totalInvestments,
          active: stats.activeInvestments,
          pending: stats.pendingApprovals
        }
      };

      return reports[type] || reports.overview;
    } catch (error) {
      logger.error('Get report error', error);
      throw error;
    }
  }

  async createAnnouncement(data) {
    try {
      const announcement = {
        id: uuidv4(),
        ...data,
        createdAt: new Date()
      };

      if (!db.announcements) db.announcements = [];
      db.announcements.push(announcement);

      logger.info('Announcement created', { announcementId: announcement.id });
      return announcement;
    } catch (error) {
      logger.error('Create announcement error', error);
      throw error;
    }
  }

  async getAnnouncements() {
    try {
      return db.announcements || [];
    } catch (error) {
      logger.error('Get announcements error', error);
      throw error;
    }
  }

  async deleteAnnouncement(announcementId) {
    try {
      if (!db.announcements) return;
      db.announcements = db.announcements.filter(a => a.id !== announcementId);
      logger.info('Announcement deleted', { announcementId });
    } catch (error) {
      logger.error('Delete announcement error', error);
      throw error;
    }
  }
}

module.exports = new AdminService();
