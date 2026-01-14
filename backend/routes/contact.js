/**
 * Contact & About API Routes
 * Public endpoints for contact form submissions and about page information
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { sendSuccess, sendError } = require('../utils/helpers');
const logger = require('../utils/logger');
const db = require('../models/database');

/**
 * ====================================
 * CONTACT ENDPOINTS (PUBLIC)
 * ====================================
 */

/**
 * POST /api/contact/send-message
 * Submit a contact form message
 * Public endpoint - no authentication required
 */
router.post('/send-message', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone is required if provided')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, { errors: errors.array() }, 400, 'Validation failed');
    }

    const { name, email, category, message, phone } = req.body;

    // Store contact message in database
    const contactMessage = {
      id: require('uuid').v4(),
      name,
      email,
      phone: phone || null,
      category,
      message,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
      response: null,
      respondedAt: null
    };

    // Save to database
    db.recordContactMessage(contactMessage);

    // Log the contact
    logger.info(`New contact message from ${email}`, { name, category });

    // Send success response
    sendSuccess(res, {
      messageId: contactMessage.id,
      status: 'received',
      message: 'We received your message. Our team will respond shortly.'
    }, 201, 'Message submitted successfully');

  } catch (error) {
    logger.error('Contact message submission error', error);
    sendError(res, { message: error.message }, 500, 'Failed to submit message');
  }
});

/**
 * GET /api/contact/categories
 * Get available contact categories
 * Public endpoint
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 1, name: 'General Inquiry', description: 'General questions about Rivertrade' },
      { id: 2, name: 'Technical Issue', description: 'Report technical problems or bugs' },
      { id: 3, name: 'Billing', description: 'Questions about billing and payments' },
      { id: 4, name: 'Account Support', description: 'Issues with your account' },
      { id: 5, name: 'Investment Help', description: 'Help with investments and portfolio' },
      { id: 6, name: 'Compliance', description: 'Compliance and regulatory questions' }
    ];

    sendSuccess(res, { categories }, 200, 'Categories retrieved');
  } catch (error) {
    logger.error('Get contact categories error', error);
    sendError(res, { message: error.message }, 500, 'Failed to retrieve categories');
  }
});

/**
 * GET /api/contact/faq
 * Get frequently asked questions
 * Public endpoint
 */
router.get('/faq', async (req, res) => {
  try {
    const faqs = [
      {
        id: 1,
        question: 'What is Rivertrade?',
        answer: 'Rivertrade is a leading investment platform offering cryptocurrency trading, portfolio management, and investment opportunities with competitive returns.'
      },
      {
        id: 2,
        question: 'How do I get started?',
        answer: 'Sign up for a free account, verify your email, complete KYC verification, and start investing with as little as $10.'
      },
      {
        id: 3,
        question: 'What are the minimum investment requirements?',
        answer: 'The minimum investment is $10. Different investment plans have different minimum amounts listed in the investments section.'
      },
      {
        id: 4,
        question: 'How long does KYC verification take?',
        answer: 'KYC verification typically takes 24-48 hours. You can track the status in your account settings.'
      },
      {
        id: 5,
        question: 'What are the withdrawal limits?',
        answer: 'You can withdraw up to your available balance. Large withdrawals may require additional verification for security.'
      },
      {
        id: 6,
        question: 'Is my data secure?',
        answer: 'Yes, we use bank-level encryption and security measures. All transactions are protected with SSL and multi-factor authentication is available.'
      },
      {
        id: 7,
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page, enter your email, and follow the reset link sent to your inbox.'
      },
      {
        id: 8,
        question: 'Can I enable 2FA for my account?',
        answer: 'Yes, you can enable two-factor authentication in your account security settings for added protection.'
      },
      {
        id: 9,
        question: 'What payment methods are accepted?',
        answer: 'We accept bank transfers, credit/debit cards, cryptocurrency, and digital wallets. Check the deposits section for current options.'
      },
      {
        id: 10,
        question: 'How are returns calculated?',
        answer: 'Returns vary by investment plan. Each plan shows the expected return rate. Your earnings are calculated daily and displayed in your dashboard.'
      }
    ];

    sendSuccess(res, { faqs, count: faqs.length }, 200, 'FAQs retrieved');
  } catch (error) {
    logger.error('Get FAQs error', error);
    sendError(res, { message: error.message }, 500, 'Failed to retrieve FAQs');
  }
});

/**
 * ====================================
 * ABOUT PAGE ENDPOINTS (PUBLIC)
 * ====================================
 */

/**
 * GET /api/about/company-info
 * Get company information for about page
 * Public endpoint
 */
router.get('/company-info', async (req, res) => {
  try {
    const companyInfo = {
      name: 'Rivertrade',
      tagline: 'Your Gateway to Investment Success',
      mission: 'To democratize investment opportunities and provide accessible, secure trading solutions for everyone.',
      vision: 'To become the world\'s most trusted investment platform with innovative features and exceptional customer service.',
      description: 'Founded in 2020, Rivertrade has grown to serve thousands of investors worldwide. We provide a seamless trading experience with advanced tools, educational resources, and 24/7 support.',
      founded: 2020,
      headquarters: 'Global Operations',
      users: 50000,
      assets_under_management: '$500M+',
      countries: 150
    };

    sendSuccess(res, { company: companyInfo }, 200, 'Company information retrieved');
  } catch (error) {
    logger.error('Get company info error', error);
    sendError(res, { message: error.message }, 500, 'Failed to retrieve company information');
  }
});

/**
 * GET /api/about/values
 * Get company values
 * Public endpoint
 */
router.get('/values', async (req, res) => {
  try {
    const values = [
      {
        id: 1,
        title: 'Trust',
        description: 'We prioritize transparency, security, and honest communication with our users.',
        icon: 'shield-alt'
      },
      {
        id: 2,
        title: 'Innovation',
        description: 'We continuously develop cutting-edge features to improve the trading experience.',
        icon: 'lightbulb'
      },
      {
        id: 3,
        title: 'Accessibility',
        description: 'We make investing simple and accessible to everyone, regardless of experience level.',
        icon: 'handshake'
      },
      {
        id: 4,
        title: 'Excellence',
        description: 'We maintain high standards in everything we do, from platform security to customer service.',
        icon: 'star'
      },
      {
        id: 5,
        title: 'Community',
        description: 'We foster a supportive community of investors helping each other succeed.',
        icon: 'users'
      },
      {
        id: 6,
        title: 'Responsibility',
        description: 'We operate ethically and comply with all regulatory requirements globally.',
        icon: 'gavel'
      }
    ];

    sendSuccess(res, { values, count: values.length }, 200, 'Company values retrieved');
  } catch (error) {
    logger.error('Get company values error', error);
    sendError(res, { message: error.message }, 500, 'Failed to retrieve company values');
  }
});

/**
 * GET /api/about/team
 * Get team members
 * Public endpoint
 */
router.get('/team', async (req, res) => {
  try {
    const team = [
      {
        id: 1,
        name: 'John CEO',
        role: 'Chief Executive Officer',
        bio: 'Visionary leader with 15+ years in fintech',
        avatar: 'JC'
      },
      {
        id: 2,
        name: 'Sarah CTO',
        role: 'Chief Technology Officer',
        bio: 'Expert in blockchain and secure systems',
        avatar: 'SC'
      },
      {
        id: 3,
        name: 'Mike CFO',
        role: 'Chief Financial Officer',
        bio: 'Finance expert ensuring platform stability',
        avatar: 'MC'
      },
      {
        id: 4,
        name: 'Emma CMO',
        role: 'Chief Marketing Officer',
        bio: 'Building global brand presence',
        avatar: 'EC'
      },
      {
        id: 5,
        name: 'James CRO',
        role: 'Chief Risk Officer',
        bio: 'Ensuring compliance and security',
        avatar: 'JR'
      },
      {
        id: 6,
        name: 'Lisa Head of Support',
        role: 'Head of Customer Support',
        bio: 'Dedicated to customer satisfaction',
        avatar: 'LH'
      },
      {
        id: 7,
        name: 'Robert Head of Security',
        role: 'Head of Security',
        bio: 'Leading cybersecurity initiatives',
        avatar: 'RS'
      },
      {
        id: 8,
        name: 'Diana Product Lead',
        role: 'Product Lead',
        bio: 'Designing innovative features',
        avatar: 'DP'
      }
    ];

    sendSuccess(res, { team, count: team.length }, 200, 'Team information retrieved');
  } catch (error) {
    logger.error('Get team error', error);
    sendError(res, { message: error.message }, 500, 'Failed to retrieve team information');
  }
});

/**
 * GET /api/about/testimonials
 * Get customer testimonials
 * Public endpoint
 */
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = [
      {
        id: 1,
        name: 'Ahmed Khan',
        title: 'Investor from UAE',
        content: 'Rivertrade has transformed my investment portfolio. Great returns and excellent support!',
        rating: 5,
        avatar: 'AK'
      },
      {
        id: 2,
        name: 'Maria Santos',
        title: 'Trader from Brazil',
        content: 'The platform is user-friendly and the security features give me peace of mind.',
        rating: 5,
        avatar: 'MS'
      },
      {
        id: 3,
        name: 'Chen Liu',
        title: 'Investor from Singapore',
        content: 'Best investment platform I\'ve used. Transparent, reliable, and profitable.',
        rating: 5,
        avatar: 'CL'
      },
      {
        id: 4,
        name: 'Sophie Martin',
        title: 'Trader from France',
        content: 'Customer support is outstanding. They helped me optimize my portfolio strategy.',
        rating: 5,
        avatar: 'SM'
      },
      {
        id: 5,
        name: 'James Wilson',
        title: 'Investor from UK',
        content: 'The 24/7 support and competitive returns make Rivertrade my go-to platform.',
        rating: 5,
        avatar: 'JW'
      },
      {
        id: 6,
        name: 'Priya Sharma',
        title: 'Trader from India',
        content: 'Withdrawals are fast and easy. Highly recommended for serious investors.',
        rating: 5,
        avatar: 'PS'
      }
    ];

    sendSuccess(res, { testimonials, count: testimonials.length }, 200, 'Testimonials retrieved');
  } catch (error) {
    logger.error('Get testimonials error', error);
    sendError(res, { message: error.message }, 500, 'Failed to retrieve testimonials');
  }
});

/**
 * GET /api/about/statistics
 * Get company statistics
 * Public endpoint
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = {
      total_users: 50000,
      active_traders: 25000,
      total_transactions: 150000,
      assets_managed: 500000000,
      countries_served: 150,
      avg_customer_rating: 4.8,
      uptime_percentage: 99.9,
      support_response_time: '< 5 minutes',
      investment_plans: 5,
      total_returns_distributed: 25000000,
      platform_security_audits: 12
    };

    sendSuccess(res, { statistics: stats }, 200, 'Statistics retrieved');
  } catch (error) {
    logger.error('Get statistics error', error);
    sendError(res, { message: error.message }, 500, 'Failed to retrieve statistics');
  }
});

/**
 * GET /api/about/features
 * Get platform features
 * Public endpoint
 */
router.get('/features', async (req, res) => {
  try {
    const features = [
      {
        id: 1,
        name: 'Easy Registration',
        description: 'Sign up in minutes with just an email and password',
        icon: 'user-plus'
      },
      {
        id: 2,
        name: 'Secure Trading',
        description: 'Bank-level encryption and SSL protection for all transactions',
        icon: 'lock'
      },
      {
        id: 3,
        name: '24/7 Support',
        description: 'Round-the-clock customer support via chat, email, and phone',
        icon: 'headset'
      },
      {
        id: 4,
        name: 'Real-time Charts',
        description: 'Live price updates and advanced charting tools',
        icon: 'chart-line'
      },
      {
        id: 5,
        name: 'Flexible Investments',
        description: 'Multiple investment plans with varying returns and durations',
        icon: 'hand-holding-usd'
      },
      {
        id: 6,
        name: 'KYC Verification',
        description: 'Fast and easy identity verification in 24-48 hours',
        icon: 'id-card'
      },
      {
        id: 7,
        name: 'Two-Factor Auth',
        description: 'Optional 2FA for enhanced account security',
        icon: 'shield-alt'
      },
      {
        id: 8,
        name: 'Mobile App',
        description: 'Trade on the go with our mobile application',
        icon: 'mobile-alt'
      }
    ];

    sendSuccess(res, { features, count: features.length }, 200, 'Features retrieved');
  } catch (error) {
    logger.error('Get features error', error);
    sendError(res, { message: error.message }, 500, 'Failed to retrieve features');
  }
});

module.exports = router;
