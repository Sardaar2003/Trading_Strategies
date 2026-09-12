const User = require('../models/User');
const config = require('../config/env');
const logger = require('../config/logger');

const seedDefaultDeveloper = async () => {
  try {
    const devEmail = config.defaultDevEmail.trim().toLowerCase();
    let devUser = await User.findOne({ email: devEmail });

    if (!devUser) {
      devUser = await User.create({
        name: 'Default Developer',
        email: devEmail,
        password: config.defaultDevPassword,
        role: 'developer',
        authProvider: 'local'
      });
      logger.info(
        `[SEED SUCCESS] Default Developer Account created -> Email: ${devUser.email} | Role: ${devUser.role}`
      );
    } else {
      // Ensure role is developer
      if (devUser.role !== 'developer') {
        devUser.role = 'developer';
        await devUser.save();
      }
      logger.info(`[SEED CHECK] Default Developer Account verified -> Email: ${devUser.email} | Role: ${devUser.role}`);
    }
  } catch (error) {
    logger.error(`[SEED ERROR] Failed to seed default developer account: ${error.message}`);
  }
};

module.exports = seedDefaultDeveloper;
