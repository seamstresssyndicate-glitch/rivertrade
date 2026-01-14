/**
 * Contact Service
 * Business logic for contact form submissions and about page data
 */

const db = require('../models/database');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class ContactService {
  /**
   * Submit a contact message
   */
  async submitContactMessage(contactData) {
    try {
      const message = {
        id: uuidv4(),
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone || null,
        category: contactData.category,
        message: contactData.message,
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date(),
        response: null,
        respondedAt: null
      };

      // Store in database
      db.recordContactMessage(message);

      logger.info(`Contact message submitted by ${message.email}`, {
        messageId: message.id,
        category: message.category
      });

      return {
        id: message.id,
        status: 'received',
        message: 'We received your message. Our team will respond shortly.'
      };
    } catch (error) {
      logger.error('Submit contact message error', error);
      throw error;
    }
  }

  /**
   * Get all contact messages (admin)
   */
  async getContactMessages(filters = {}) {
    try {
      const { status, category, limit = 50, offset = 0 } = filters;
      const messages = db.getContactMessages();

      let filtered = messages;

      // Apply filters
      if (status) {
        filtered = filtered.filter(m => m.status === status);
      }
      if (category) {
        filtered = filtered.filter(m => m.category === category);
      }

      // Apply pagination
      const paginated = filtered.slice(offset, offset + limit);

      return {
        data: paginated,
        total: filtered.length,
        limit,
        offset
      };
    } catch (error) {
      logger.error('Get contact messages error', error);
      throw error;
    }
  }

  /**
   * Get a specific contact message
   */
  async getContactMessage(messageId) {
    try {
      const message = db.getContactMessageById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }
      return message;
    } catch (error) {
      logger.error('Get contact message error', error);
      throw error;
    }
  }

  /**
   * Respond to a contact message
   */
  async respondToContactMessage(messageId, response) {
    try {
      const message = db.getContactMessageById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      const updated = {
        ...message,
        response,
        status: 'responded',
        respondedAt: new Date(),
        updatedAt: new Date()
      };

      db.updateContactMessage(messageId, updated);

      logger.info(`Contact message responded to`, { messageId });

      return updated;
    } catch (error) {
      logger.error('Respond to contact message error', error);
      throw error;
    }
  }

  /**
   * Update message status
   */
  async updateMessageStatus(messageId, status) {
    try {
      const message = db.getContactMessageById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      const updated = {
        ...message,
        status,
        updatedAt: new Date()
      };

      db.updateContactMessage(messageId, updated);

      logger.info(`Contact message status updated`, { messageId, status });

      return updated;
    } catch (error) {
      logger.error('Update message status error', error);
      throw error;
    }
  }

  /**
   * Delete a contact message
   */
  async deleteContactMessage(messageId) {
    try {
      const message = db.getContactMessageById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      db.deleteContactMessage(messageId);

      logger.info(`Contact message deleted`, { messageId });

      return { success: true, message: 'Message deleted successfully' };
    } catch (error) {
      logger.error('Delete contact message error', error);
      throw error;
    }
  }

  /**
   * Get contact statistics
   */
  async getContactStatistics() {
    try {
      const messages = db.getContactMessages();

      const stats = {
        total_messages: messages.length,
        new_messages: messages.filter(m => m.status === 'new').length,
        responded_messages: messages.filter(m => m.status === 'responded').length,
        in_progress: messages.filter(m => m.status === 'in_progress').length,
        closed: messages.filter(m => m.status === 'closed').length,
        by_category: {}
      };

      // Count by category
      messages.forEach(msg => {
        stats.by_category[msg.category] = (stats.by_category[msg.category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Get contact statistics error', error);
      throw error;
    }
  }
}

module.exports = new ContactService();
