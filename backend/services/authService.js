/**
 * Authentication Service
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../models/database');
const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');
const { ValidationError, AuthError } = require('../utils/errors');
const logger = require('../utils/logger');

class AuthService {
  async register(email, password, fullName) {
    try {
      // Check if user exists
      if (db.getUserByEmail(email)) {
        throw new ValidationError('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const userId = uuidv4();
      const user = db.createUser(email, {
        id: userId,
        password: hashedPassword,
        fullName,
        status: 'active',
        role: 'user'
      });

      // Generate a unique referral code for this user
      const referralCode = db.generateReferralCode(userId);
      user.referralCode = referralCode;

      // Initialize portfolio
      db.initPortfolio(userId);

      // Log action
      logger.info('User registered', { email, userId, referralCode });

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        referralCode: referralCode
      };
    } catch (error) {
      logger.error('Registration error', error, { email });
      throw error;
    }
  }

  async login(email, password) {
    try {
      const user = db.getUserByEmail(email);

      if (!user) {
        throw new AuthError('Invalid email or password');
      }

      // Compare passwords
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new AuthError('Invalid email or password');
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      logger.info('User logged in', { email, userId: user.id });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      };
    } catch (error) {
      logger.error('Login error', error, { email });
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      const { verifyToken } = require('../utils/helpers');
      const decoded = verifyToken(token);
      return decoded;
    } catch (error) {
      throw new AuthError('Invalid or expired token');
    }
  }
}

module.exports = new AuthService();
