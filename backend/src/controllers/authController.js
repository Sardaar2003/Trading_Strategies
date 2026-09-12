const User = require('../models/User');
const config = require('../config/env');
const logger = require('../config/logger');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, requestedRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: name, email, and password.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    // Role assignment: auto-developer if email matches DEVELOPER_EMAILS or explicitly requested developer in dev mode
    const isDevListed = config.developerEmails.includes(normalizedEmail);
    const assignedRole = isDevListed || requestedRole === 'developer' ? 'developer' : 'user';

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      role: assignedRole,
      authProvider: 'local',
      lastLoginAt: new Date()
    });

    logger.info(`User registered successfully: ${user.email} (Role: ${user.role})`);

    // Store user data in req.session
    const sessionUserData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      authProvider: user.authProvider
    };

    req.session.user = sessionUserData;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: sessionUserData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & start session
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      logger.warn(`Login attempt for un-registered account: ${normalizedEmail}`);
      return res.status(404).json({
        success: false,
        error: 'Account not found. Please sign up using your Google Account.'
      });
    }

    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({
        success: false,
        error: 'This account was created with Google Sign-In. Please sign in with Google.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Invalid password attempt for email: ${normalizedEmail}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials.'
      });
    }

    // Check if email was added to developer list in env.js after creation
    if (config.developerEmails.includes(normalizedEmail) && user.role !== 'developer') {
      user.role = 'developer';
    }

    user.lastLoginAt = new Date();
    await user.save();

    const sessionUserData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      authProvider: user.authProvider
    };

    req.session.user = sessionUserData;

    logger.info(`User logged in: ${user.email} (Role: ${user.role}, SessionID: ${req.sessionID})`);

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      user: sessionUserData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sign out user & destroy session
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res, next) => {
  const userEmail = req.session?.user?.email || 'Unknown user';
  const sessionID = req.sessionID;

  req.session.destroy(err => {
    if (err) {
      logger.error(`Error destroying session for ${userEmail}: ${err.message}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to destroy session.'
      });
    }

    res.clearCookie('connect.sid');
    logger.info(`User signed out: ${userEmail} (Destroyed SessionID: ${sessionID})`);

    return res.status(200).json({
      success: true,
      message: 'Signed out successfully.'
    });
  });
};

// @desc    Get currently logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated.'
      });
    }

    // Refresh user state from DB
    const user = await User.findById(req.session.user.id);
    if (!user) {
      req.session.destroy();
      return res.status(404).json({
        success: false,
        error: 'User account no longer exists.'
      });
    }

    const updatedSessionData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      authProvider: user.authProvider,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    };

    req.session.user = updatedSessionData;

    return res.status(200).json({
      success: true,
      user: updatedSessionData,
      sessionInfo: {
        sessionId: req.sessionID,
        cookieExpires: req.session.cookie.expires,
        ip: req.ip,
        userAgent: req.get('user-agent')
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Google ID Token / OAuth login
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
  try {
    const { email, name, avatar, googleId } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required for Google Sign-In.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    const isDevListed = config.developerEmails.includes(normalizedEmail);
    const role = isDevListed ? 'developer' : 'user';

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        googleId: googleId || `google_${Date.now()}`,
        avatar: avatar || '',
        authProvider: 'google',
        role: role,
        lastLoginAt: new Date()
      });
      logger.info(`Registered new user via Google Auth: ${user.email} (Role: ${user.role})`);
    } else {
      user.lastLoginAt = new Date();
      if (isDevListed && user.role !== 'developer') {
        user.role = 'developer';
      }
      await user.save();
      logger.info(`Logged in user via Google Auth: ${user.email} (Role: ${user.role})`);
    }

    const sessionUserData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      authProvider: user.authProvider
    };

    req.session.user = sessionUserData;

    return res.status(200).json({
      success: true,
      message: 'Signed in with Google successfully.',
      user: sessionUserData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete account and destroy session data
// @route   DELETE /api/auth/account
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated.'
      });
    }

    const userId = req.session.user.id;
    const userEmail = req.session.user.email;
    const sessionID = req.sessionID;

    // Delete user from MongoDB
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: 'User account not found.'
      });
    }

    logger.warn(`ACCOUNT DELETION: User '${userEmail}' (ID: ${userId}) permanently deleted their account.`);

    // Destroy active session
    req.session.destroy(err => {
      if (err) {
        logger.error(`Error destroying session during account deletion for ${userEmail}: ${err.message}`);
      }

      res.clearCookie('connect.sid');

      return res.status(200).json({
        success: true,
        message: 'Your account and all associated data have been permanently deleted.'
      });
    });
  } catch (error) {
    next(error);
  }
};

const kiteAuth = require('../services/kiteAuth');
const kiteTickerWorker = require('../services/kiteTickerWorker');

// @desc    Redirect to Zerodha Login Page
// @route   GET /api/auth/zerodha/login
// @access  Public
const zerodhaLogin = (req, res) => {
  const apiKey = process.env.KITE_API_KEY || 'zomd9qtsxdgix90u';
  const redirectUrl = `https://kite.zerodha.com/connect/login?v=3&api_key=${apiKey}`;
  res.redirect(redirectUrl);
};

// @desc    Zerodha OAuth Callback Endpoint (Popup Window & Tab Redirect compatible)
// @route   GET /api/auth/zerodha/callback
// @access  Public
const zerodhaCallback = async (req, res, next) => {
  try {
    const { request_token, status } = req.query;

    if (status === 'cancelled' || !request_token) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>Zerodha Connection Cancelled</title></head>
          <body style="background:#0b0e14; color:#ff9800; font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
            <div style="text-align:center; padding: 20px;">
              <h2>⚠️ Login Cancelled</h2>
              <p style="color:#a0aec0;">Returning to AlphaTerminal...</p>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'ZERODHA_AUTH_CANCELLED' }, '*');
                window.close();
              } else {
                window.location.href = '${config.clientUrl}?error=zerodha_login_cancelled';
              }
            </script>
          </body>
        </html>
      `);
    }

const zerodhaMarketService = require('../services/zerodhaMarketService');

    // Exchange request_token for access_token
    const session = await kiteAuth.generateSession(request_token);

    // Start KiteTicker persistent WebSocket ingestion worker & refresh live quotes!
    kiteTickerWorker.startWorker();
    await zerodhaMarketService.refreshZerodhaConnection();

    logger.info(`Zerodha connected successfully! Access Token generated.`);

    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Zerodha Connected</title></head>
        <body style="background:#0b0e14; color:#00c853; font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
          <div style="text-align:center; padding: 20px;">
            <h2 style="font-size:24px; margin-bottom:8px;">🟢 Zerodha Connected!</h2>
            <p style="color:#a0aec0; font-size:14px;">Live WebSocket streaming activated. Returning to AlphaTerminal...</p>
          </div>
          <script>
            try {
              const channel = new BroadcastChannel('zerodha_auth_channel');
              channel.postMessage({ type: 'ZERODHA_AUTH_SUCCESS' });
            } catch(e) {}

            try {
              if (window.opener) {
                window.opener.postMessage({ type: 'ZERODHA_AUTH_SUCCESS' }, '*');
              }
            } catch(e) {}

            setTimeout(() => {
              window.close();
            }, 600);
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    logger.error(`Zerodha OAuth Callback Error: ${err.message}`);
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Zerodha Connection Error</title></head>
        <body style="background:#0b0e14; color:#ff3b30; font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
          <div style="text-align:center; padding: 20px;">
            <h2>❌ Zerodha Session Failed</h2>
            <p style="color:#a0aec0; font-size:14px;">${err.message || 'Unable to exchange request token'}</p>
          </div>
          <script>
            setTimeout(() => {
              if (window.opener) {
                window.opener.postMessage({ type: 'ZERODHA_AUTH_ERROR', message: '${err.message}' }, '*');
                window.close();
              } else {
                window.location.href = '${config.clientUrl}?error=zerodha_session_failed';
              }
            }, 2500);
          </script>
        </body>
      </html>
    `);
  }
};

// @desc    Manually set request_token or access_token in-app
// @route   POST /api/auth/zerodha/token
// @access  Public
const zerodhaToken = async (req, res, next) => {
  try {
    const { request_token, access_token } = req.body;

    if (!request_token && !access_token) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either request_token or access_token.'
      });
    }

    if (request_token) {
      await kiteAuth.generateSession(request_token);
    } else if (access_token) {
      kiteAuth.setAccessToken(access_token);
    }

    kiteTickerWorker.startWorker();
    await zerodhaMarketService.refreshZerodhaConnection();

    return res.status(200).json({
      success: true,
      message: 'Zerodha credentials updated and KiteTicker worker activated!'
    });
  } catch (err) {
    logger.error(`Manual Zerodha Token Set Error: ${err.message}`);
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to authenticate Zerodha token'
    });
  }
};

// @desc    Get active Zerodha connection status
// @route   GET /api/auth/zerodha/status
// @access  Public
const getZerodhaStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    connected: Boolean(kiteAuth.accessToken || process.env.KITE_ACCESS_TOKEN),
    hasCredentials: Boolean(process.env.KITE_USER_ID && process.env.KITE_TOTP_SECRET)
  });
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  googleAuth,
  deleteAccount,
  zerodhaLogin,
  zerodhaCallback,
  zerodhaToken,
  getZerodhaStatus
};


