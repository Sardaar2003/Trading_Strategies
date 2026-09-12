const path = require('path');
const { createLogger, format, transports } = require('winston');
const config = require('./env');

const logDir = path.join(__dirname, '../../logs');

const customFormat = format.printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level.toUpperCase()}]: ${stack || message} ${metaString}`;
});

const logger = createLogger({
  level: config.logLevel,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'trading-auth-backend' },
  transports: [
    new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logDir, 'combined.log') })
  ]
});

// Always add console output with color formatting
logger.add(
  new transports.Console({
    format: format.combine(
      format.colorize(),
      format.timestamp({ format: 'HH:mm:ss' }),
      customFormat
    )
  })
);

module.exports = logger;
