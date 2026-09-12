const mongoose = require('mongoose');
const config = require('./env');
const logger = require('./logger');
const seedDefaultDeveloper = require('../utils/seedDeveloper');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    await seedDefaultDeveloper();
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    // In dev mode, log helpful troubleshooting tip if MongoDB isn't running
    logger.warn('Please ensure MongoDB daemon is running locally or MONGO_URI in .env points to a reachable cluster.');
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting reconnection...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected successfully.');
});

module.exports = connectDB;
