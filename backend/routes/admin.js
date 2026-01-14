/**
 * Admin Routes
 * Management endpoints for admin panel
 */

const express = require('express');
const router = express.Router();
const adminService = require('../services/adminService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/adminMiddleware');
const { sendSuccess, sendError } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * GET /api/admin/dashboard
 * Get admin dashboard statistics
 */
router.get('/dashboard', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    sendSuccess(res, { stats }, 200, 'Dashboard stats retrieved');
  } catch (error) {
    logger.error('Dashboard stats error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
router.get('/users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const users = await adminService.getAllUsers(page, limit);
    sendSuccess(res, users, 200, 'Users retrieved');
  } catch (error) {
    logger.error('Get users error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/admin/users/search
 * Search users by email or name
 */
router.get('/users/search', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return sendError(res, { message: 'Search query required' }, 400);
    }
    const users = await adminService.searchUsers(query);
    sendSuccess(res, { users, count: users.length }, 200, 'Users found');
  } catch (error) {
    logger.error('User search error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/admin/users/:userId
 * Get user details
 */
router.get('/users/:userId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const user = await adminService.getUserDetails(req.params.userId);
    if (!user) {
      return sendError(res, { message: 'User not found' }, 404);
    }
    sendSuccess(res, { user }, 200, 'User details retrieved');
  } catch (error) {
    logger.error('Get user details error', error);
    sendError(res, error);
  }
});

/**
 * PUT /api/admin/users/:userId
 * Update user status
 */
router.put('/users/:userId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await adminService.updateUserStatus(req.params.userId, status);
    sendSuccess(res, { user }, 200, 'User status updated');
  } catch (error) {
    logger.error('Update user status error', error);
    sendError(res, error, error.statusCode || 400);
  }
});

/**
 * DELETE /api/admin/users/:userId
 * Delete user account
 */
router.delete('/users/:userId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    await adminService.deleteUser(req.params.userId);
    sendSuccess(res, {}, 200, 'User deleted');
  } catch (error) {
    logger.error('Delete user error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/admin/transactions
 * Get all transactions
 */
router.get('/transactions', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const transactions = await adminService.getAllTransactions(page, limit);
    sendSuccess(res, transactions, 200, 'Transactions retrieved');
  } catch (error) {
    logger.error('Get transactions error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/admin/transactions/:transactionId
 * Get transaction details
 */
router.get('/transactions/:transactionId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const transaction = await adminService.getTransactionDetails(req.params.transactionId);
    sendSuccess(res, { transaction }, 200, 'Transaction details retrieved');
  } catch (error) {
    logger.error('Get transaction details error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/admin/investments
 * Get all investments
 */
router.get('/investments', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const investments = await adminService.getAllInvestments(page, limit);
    sendSuccess(res, investments, 200, 'Investments retrieved');
  } catch (error) {
    logger.error('Get investments error', error);
    sendError(res, error);
  }
});

/**
 * PUT /api/admin/investments/:investmentId/approve
 * Approve pending investment
 */
router.put('/investments/:investmentId/approve', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const investment = await adminService.approveInvestment(req.params.investmentId);
    sendSuccess(res, { investment }, 200, 'Investment approved');
  } catch (error) {
    logger.error('Approve investment error', error);
    sendError(res, error);
  }
});

/**
 * PUT /api/admin/investments/:investmentId/reject
 * Reject investment
 */
router.put('/investments/:investmentId/reject', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const investment = await adminService.rejectInvestment(req.params.investmentId, reason);
    sendSuccess(res, { investment }, 200, 'Investment rejected');
  } catch (error) {
    logger.error('Reject investment error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/admin/kyc-requests
 * Get pending KYC verification requests
 */
router.get('/kyc-requests', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const kycRequests = await adminService.getKYCRequests();
    sendSuccess(res, { kycRequests, count: kycRequests.length }, 200, 'KYC requests retrieved');
  } catch (error) {
    logger.error('Get KYC requests error', error);
    sendError(res, error);
  }
});

/**
 * PUT /api/admin/kyc-requests/:userId/approve
 * Approve KYC verification
 */
router.put('/kyc-requests/:userId/approve', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const user = await adminService.approveKYC(req.params.userId);
    sendSuccess(res, { user }, 200, 'KYC approved');
  } catch (error) {
    logger.error('Approve KYC error', error);
    sendError(res, error);
  }
});

/**
 * PUT /api/admin/kyc-requests/:userId/reject
 * Reject KYC verification
 */
router.put('/kyc-requests/:userId/reject', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await adminService.rejectKYC(req.params.userId, reason);
    sendSuccess(res, { user }, 200, 'KYC rejected');
  } catch (error) {
    logger.error('Reject KYC error', error);
    sendError(res, error);
  }
});

/**
 * POST /api/admin/support-tickets
 * Get support tickets
 */
router.get('/support-tickets', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const status = req.query.status || 'open';
    const tickets = await adminService.getSupportTickets(status);
    sendSuccess(res, { tickets, count: tickets.length }, 200, 'Support tickets retrieved');
  } catch (error) {
    logger.error('Get support tickets error', error);
    sendError(res, error);
  }
});

/**
 * PUT /api/admin/support-tickets/:ticketId
 * Update support ticket
 */
router.put('/support-tickets/:ticketId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { status, response } = req.body;
    const ticket = await adminService.updateSupportTicket(req.params.ticketId, { status, response });
    sendSuccess(res, { ticket }, 200, 'Ticket updated');
  } catch (error) {
    logger.error('Update ticket error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/admin/reports
 * Get system reports
 */
router.get('/reports', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const type = req.query.type || 'overview';
    const report = await adminService.getReport(type);
    sendSuccess(res, { report }, 200, 'Report retrieved');
  } catch (error) {
    logger.error('Get report error', error);
    sendError(res, error);
  }
});

/**
 * POST /api/admin/announcements
 * Create announcement
 */
router.post('/announcements', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { title, message, type, priority } = req.body;
    const announcement = await adminService.createAnnouncement({
      title,
      message,
      type,
      priority
    });
    sendSuccess(res, { announcement }, 201, 'Announcement created');
  } catch (error) {
    logger.error('Create announcement error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/admin/announcements
 * Get all announcements
 */
router.get('/announcements', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const announcements = await adminService.getAnnouncements();
    sendSuccess(res, { announcements }, 200, 'Announcements retrieved');
  } catch (error) {
    logger.error('Get announcements error', error);
    sendError(res, error);
  }
});

/**
 * DELETE /api/admin/announcements/:announcementId
 * Delete announcement
 */
router.delete('/announcements/:announcementId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    await adminService.deleteAnnouncement(req.params.announcementId);
    sendSuccess(res, {}, 200, 'Announcement deleted');
  } catch (error) {
    logger.error('Delete announcement error', error);
    sendError(res, error);
  }
});

/**
 * ====================================
 * CONTACT MANAGEMENT ENDPOINTS
 * ====================================
 */

/**
 * GET /api/admin/contacts
 * Get all contact form submissions
 */
router.get('/contacts', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { status, category, limit = 50, offset = 0 } = req.query;
    const contactService = require('../services/contactService');
    const messages = await contactService.getContactMessages({
      status,
      category,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    sendSuccess(res, messages, 200, 'Contact messages retrieved');
  } catch (error) {
    logger.error('Get contact messages error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/admin/contacts/:messageId
 * Get a specific contact message
 */
router.get('/contacts/:messageId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const contactService = require('../services/contactService');
    const message = await contactService.getContactMessage(req.params.messageId);
    sendSuccess(res, { message }, 200, 'Contact message retrieved');
  } catch (error) {
    logger.error('Get contact message error', error);
    sendError(res, { message: error.message }, 404);
  }
});

/**
 * POST /api/admin/contacts/:messageId/respond
 * Respond to a contact message
 */
router.post('/contacts/:messageId/respond', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { response } = req.body;
    if (!response) {
      return sendError(res, { message: 'Response text required' }, 400);
    }
    const contactService = require('../services/contactService');
    const updated = await contactService.respondToContactMessage(req.params.messageId, response);
    sendSuccess(res, { message: updated }, 200, 'Response sent successfully');
  } catch (error) {
    logger.error('Respond to contact message error', error);
    sendError(res, error);
  }
});

/**
 * PUT /api/admin/contacts/:messageId/status
 * Update contact message status
 */
router.put('/contacts/:messageId/status', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return sendError(res, { message: 'Status required' }, 400);
    }
    const contactService = require('../services/contactService');
    const updated = await contactService.updateMessageStatus(req.params.messageId, status);
    sendSuccess(res, { message: updated }, 200, 'Status updated successfully');
  } catch (error) {
    logger.error('Update contact message status error', error);
    sendError(res, error);
  }
});

/**
 * DELETE /api/admin/contacts/:messageId
 * Delete a contact message
 */
router.delete('/contacts/:messageId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const contactService = require('../services/contactService');
    await contactService.deleteContactMessage(req.params.messageId);
    sendSuccess(res, {}, 200, 'Contact message deleted');
  } catch (error) {
    logger.error('Delete contact message error', error);
    sendError(res, error);
  }
});

/**
 * GET /api/admin/contacts/statistics
 * Get contact form statistics
 */
router.get('/contact-statistics', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const contactService = require('../services/contactService');
    const stats = await contactService.getContactStatistics();
    sendSuccess(res, { statistics: stats }, 200, 'Contact statistics retrieved');
  } catch (error) {
    logger.error('Get contact statistics error', error);
    sendError(res, error);
  }
});

