const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const config = require('../config/env');
const {
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
} = require('../controllers/authController');
const { isAuthenticated, ensureGuest } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Rate-limited Auth Routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', isAuthenticated, logout);
router.get('/me', isAuthenticated, getMe);
router.delete('/account', isAuthenticated, deleteAccount);

// Zerodha Connect OAuth 1-Click Login & Callback
router.get('/zerodha/status', getZerodhaStatus);
router.get('/zerodha/login', zerodhaLogin);
router.get('/zerodha/callback', zerodhaCallback);
router.post('/zerodha/token', zerodhaToken);

// Google Sign-In Endpoint (direct token validation / fallback)
router.post('/google', googleAuth);


// Live Passport Google OAuth Routes (if configured)
if (config.googleClientId && config.googleClientSecret) {
  router.get('/google/oauth', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: `${config.clientUrl}?error=google_auth_failed` }),
    (req, res) => {
      // Establish session
      req.session.user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        authProvider: 'google'
      };
      res.redirect(config.clientUrl);
    }
  );
}

module.exports = router;
