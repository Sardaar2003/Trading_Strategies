const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const mongoose = require('mongoose');
const config = require('../config/env');
const logger = require('../config/logger');

// @desc    Get recent system logs (Developer Only)
// @route   GET /api/developer/logs
// @access  Private/Developer
const getSystemLogs = async (req, res, next) => {
  try {
    const logType = req.query.type === 'error' ? 'error.log' : 'combined.log';
    const logFilePath = path.join(__dirname, '../../logs', logType);

    if (!fs.existsSync(logFilePath)) {
      return res.status(200).json({
        success: true,
        logs: [`No ${logType} file generated yet.`]
      });
    }

    const fileContent = fs.readFileSync(logFilePath, 'utf8');
    const logLines = fileContent
      .trim()
      .split('\n')
      .filter(line => line.trim().length > 0)
      .slice(-100) // Return last 100 log entries
      .reverse();

    return res.status(200).json({
      success: true,
      logType,
      count: logLines.length,
      logs: logLines
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered system users (Developer Only)
// @route   GET /api/developer/users
// @access  Private/Developer
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        authProvider: u.authProvider,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Promote or demote user role (Developer Only)
// @route   PUT /api/developer/users/:id/role
// @access  Private/Developer
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'developer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be either "user" or "developer".'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.'
      });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    logger.info(
      `Developer RBAC Action: User '${user.email}' role updated from '${previousRole}' to '${role}' by developer '${req.session.user.email}'`
    );

    return res.status(200).json({
      success: true,
      message: `User role updated to '${role}'.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get server health and system statistics (Developer Only)
// @route   GET /api/developer/stats
// @access  Private/Developer
const getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const developerUsers = await User.countDocuments({ role: 'developer' });
    const standardUsers = await User.countDocuments({ role: 'user' });

    // Inspect active session collection in MongoDB if present
    let activeSessionsCount = 'N/A';
    try {
      const sessionDb = mongoose.connection.db;
      if (sessionDb) {
        const sessionsCollection = sessionDb.collection('sessions');
        activeSessionsCount = await sessionsCollection.countDocuments({});
      }
    } catch (e) {
      logger.warn(`Could not count sessions collection: ${e.message}`);
    }

    const memoryUsage = process.memoryUsage();

    return res.status(200).json({
      success: true,
      stats: {
        environment: config.nodeEnv,
        uptimeSeconds: Math.floor(process.uptime()),
        dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        mongoHost: mongoose.connection.host || 'N/A',
        totalUsers,
        standardUsers,
        developerUsers,
        activeSessionsCount,
        developerEmailList: config.developerEmails,
        memoryUsageMB: {
          rss: (memoryUsage.rss / 1024 / 1024).toFixed(2),
          heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
          heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete a user account and purge session data (Developer Only)
// @route   DELETE /api/developer/users/:id
// @access  Private/Developer
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentDevId = req.session.user.id;

    if (id === currentDevId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own account from the Developer Console. Use Session & Security settings.'
      });
    }

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        error: 'Target user not found.'
      });
    }

    const deletedEmail = userToDelete.email;
    await User.findByIdAndDelete(id);

    // Purge active sessions for this user from MongoDB sessions collection if accessible
    try {
      const sessionDb = mongoose.connection.db;
      if (sessionDb) {
        const sessionsCollection = sessionDb.collection('sessions');
        // Delete all sessions containing this user's ID
        await sessionsCollection.deleteMany({
          $or: [
            { 'session.user.id': id },
            { 'session.user.id': new mongoose.Types.ObjectId(id) },
            { 'session.user.email': deletedEmail }
          ]
        });
      }
    } catch (sessionErr) {
      logger.warn(`Could not purge session documents for deleted user ${deletedEmail}: ${sessionErr.message}`);
    }

    logger.warn(
      `RBAC ADMIN ACTION: Developer '${req.session.user.email}' permanently deleted user '${deletedEmail}' (ID: ${id}) and purged sessions.`
    );

    return res.status(200).json({
      success: true,
      message: `User '${deletedEmail}' and all associated session data have been permanently deleted.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemLogs,
  getAllUsers,
  updateUserRole,
  getSystemStats,
  deleteUser
};
