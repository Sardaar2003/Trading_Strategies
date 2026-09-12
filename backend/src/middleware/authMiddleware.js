const logger = require('../config/logger');

// Check if req.session.user exists
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  logger.warn(`Unauthorized access attempt to ${req.originalUrl} from IP ${req.ip}`);
  return res.status(401).json({
    success: false,
    error: 'Unauthorized. Please sign in to access this resource.'
  });
};

// Check if user is guest (not logged in)
const ensureGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.status(400).json({
      success: false,
      error: 'You are already signed in.'
    });
  }
  next();
};

module.exports = {
  isAuthenticated,
  ensureGuest
};
