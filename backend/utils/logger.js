const fs = require('fs');
const path = require('path');

/**
 * Logger utility
 */
class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  log(level, message, data = {}) {
    const logMessage = {
      timestamp: this.getTimestamp(),
      level,
      message,
      ...data
    };

    console.log(`[${level}] ${message}`, data);

    // Write to file
    this.writeToFile(logMessage);
  }

  info(message, data = {}) {
    this.log('INFO', message, data);
  }

  error(message, error, data = {}) {
    this.log('ERROR', message, {
      error: error?.message || error,
      stack: error?.stack,
      ...data
    });
  }

  warn(message, data = {}) {
    this.log('WARN', message, data);
  }

  debug(message, data = {}) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('DEBUG', message, data);
    }
  }

  writeToFile(logMessage) {
    const filename = path.join(
      this.logDir,
      `${new Date().toISOString().split('T')[0]}.log`
    );
    fs.appendFileSync(
      filename,
      JSON.stringify(logMessage) + '\n',
      'utf8'
    );
  }
}

module.exports = new Logger();
