const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('./env');
const User = require('../models/User');
const logger = require('./logger');

if (config.googleClientId && config.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: `${config.clientUrl}/api/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0]?.value?.toLowerCase();
          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          let user = await User.findOne({ email });

          // Determine role based on developer email list in env.js
          const isDev = config.developerEmails.includes(email);
          const role = isDev ? 'developer' : 'user';

          if (!user) {
            user = await User.create({
              name: profile.displayName || 'Google User',
              email: email,
              googleId: profile.id,
              avatar: profile.photos[0]?.value || '',
              authProvider: 'google',
              role: role,
              lastLoginAt: new Date()
            });
            logger.info(`New user registered via Google OAuth: ${user.email} (Role: ${user.role})`);
          } else {
            user.googleId = profile.id;
            user.lastLoginAt = new Date();
            if (isDev && user.role !== 'developer') {
              user.role = 'developer';
            }
            await user.save();
            logger.info(`Existing user logged in via Google OAuth: ${user.email} (Role: ${user.role})`);
          }

          return done(null, user);
        } catch (error) {
          logger.error(`Google Strategy Error: ${error.message}`);
          return done(error, null);
        }
      }
    )
  );
} else {
  logger.warn('Google Client ID/Secret missing in .env config. Live Passport Google OAuth is inactive.');
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
