/**
 * reCAPTCHA Verification Middleware
 * Verifies reCAPTCHA token from frontend
 */

const verifyRecaptcha = async (req, res, next) => {
  const recaptchaToken = req.body.recaptchaToken;

  if (!recaptchaToken) {
    return res.status(400).json({
      error: 'reCAPTCHA token is required',
      message: 'Please complete the reCAPTCHA verification'
    });
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(403).json({
        error: 'reCAPTCHA verification failed',
        message: 'Please complete the reCAPTCHA verification and try again'
      });
    }

    // Check score (for reCAPTCHA v3)
    if (data.score && data.score < 0.5) {
      return res.status(403).json({
        error: 'reCAPTCHA score too low',
        message: 'Suspicious activity detected. Please try again'
      });
    }

    // Store verification result in request for logging
    req.recaptchaData = {
      success: data.success,
      score: data.score || null,
      action: data.action || null,
      challengeTimestamp: data.challenge_ts,
      hostname: data.hostname
    };

    next();
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    res.status(500).json({
      error: 'reCAPTCHA verification error',
      details: error.message
    });
  }
};

module.exports = { verifyRecaptcha };
