const logger = require('../config/logger');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Accepts target roles e.g. authorize('developer') or authorize('developer', 'admin')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    const userRole = req.session.user.role || 'user';

    if (!allowedRoles.includes(userRole)) {
      logger.warn(
        `RBAC Security Alert: User '${req.session.user.email}' (Role: ${userRole}) attempted unauthorized access to '${req.originalUrl}' requiring roles: [${allowedRoles.join(', ')}]`
      );

      return res.status(403).json({
        success: false,
        error: 'Forbidden. You do not have the required permissions (Developer Role needed).'
      });
    }

    next();
  };
};

module.exports = {
  authorize
};
