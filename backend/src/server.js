const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config/env');
const logger = require('./config/logger');
const connectDB = require('./config/db');
const passport = require('./config/passport');

const authRoutes = require('./routes/authRoutes');
const developerRoutes = require('./routes/developerRoutes');
const marketRoutes = require('./routes/marketRoutes');
const aiRoutes = require('./routes/aiRoutes');
const threeWaveRoutes = require('./routes/threeWaveRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// Trust reverse proxy (Essential for Render HTTPS cookie forwarding)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security Headers & Cross-Origin settings
app.use(helmet({
  contentSecurityPolicy: false // Disabled for dev flexiblity
}));

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logging via Morgan & Winston
app.use(
  morgan('dev', {
    stream: {
      write: message => logger.info(message.trim())
    }
  })
);

// MongoDB Session Configuration
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.mongoUri,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: 'native'
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
      httpOnly: true, // Prevents XSS cookie theft
      sameSite: config.isProduction ? 'none' : 'lax', // 'none' is required for cross-domain cookies between frontend & backend on Render
      secure: config.isProduction // Requires HTTPS in production
    }
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Root Route (API Welcome & Status)
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'AlphaTerminal Auth Backend API',
    status: 'UP',
    environment: config.nodeEnv,
    version: '1.0.0',
    documentation: {
      healthcheck: '/health',
      authRoutes: '/api/auth/*',
      developerRoutes: '/api/developer/*',
      aiRoutes: '/api/ai/*',
      threeWaveRoutes: '/api/three-wave/*'
    }
  });
});

// Healthcheck Route (supports both /health and /api/health)
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    environment: config.nodeEnv,
    sessionID: req.sessionID || null,
    authenticated: !!(req.session && req.session.user)
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Handle /favicon.ico to prevent 404 log clutter
app.get('/favicon.ico', (req, res) => res.status(204).end());

const { zerodhaCallback } = require('./controllers/authController');

// API Routes
app.get('/api/zerodha/callback', zerodhaCallback);
app.use('/api/auth', authRoutes);
app.use('/api/developer', developerRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/three-wave', threeWaveRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = config.port;

const kiteTickerWorker = require('./services/kiteTickerWorker');

const server = app.listen(PORT, () => {
  logger.info(`=======================================================`);
  logger.info(` Trading Auth Backend running in [${config.nodeEnv}] mode`);
  logger.info(` Server URL: http://localhost:${PORT}`);
  logger.info(` Allowed Client: ${config.clientUrl}`);
  logger.info(` Developer Emails: ${config.developerEmails.join(', ')}`);
  logger.info(`=======================================================`);

  // Automatically start Zerodha ingestion worker on backend startup
  kiteTickerWorker.startWorker();
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use by a background Node process.`);
    logger.info(`To free port ${PORT} automatically, run: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
    process.exit(1);
  } else {
    throw error;
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
});

// Graceful shutdown handling for nodemon restarts (SIGUSR2) and process termination (SIGINT / SIGTERM)
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Gracefully closing HTTP server...`);
  server.close(() => {
    logger.info('HTTP server closed. Releasing port 5000.');
    if (signal === 'SIGUSR2') {
      process.kill(process.pid, 'SIGUSR2');
    } else {
      process.exit(0);
    }
  });
};

process.once('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

