const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trading_auth',
  sessionSecret: process.env.SESSION_SECRET || 'trading_super_secret_session_key_fallback_2026',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  developerEmails: (process.env.DEVELOPER_EMAILS || 'dev@trading.com')
    .split(',')
    .map(email => email.trim().toLowerCase()),
  defaultDevEmail: process.env.DEFAULT_DEV_EMAIL || 'dev@trading.com',
  defaultDevPassword: process.env.DEFAULT_DEV_PASSWORD || 'Developer123!',
  twelveDataApiKey: process.env.TWELVE_DATA_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  logLevel: process.env.LOG_LEVEL || 'info',
  isProduction: process.env.NODE_ENV === 'production',
};

// Log warning if key secrets are missing in non-dev environment
if (config.isProduction && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.includes('fallback'))) {
  console.warn('[CONFIG WARNING] Production environment detected but SESSION_SECRET is not securely set!');
}

module.exports = Object.freeze(config);
