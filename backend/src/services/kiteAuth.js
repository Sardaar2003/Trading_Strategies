const fs = require('fs');
const path = require('path');
const { KiteConnect } = require('kiteconnect');
const { generate } = require('otplib');
const axios = require('axios');

const TOKEN_FILE_PATH = path.join(__dirname, '../../zerodhaToken.json');

/**
 * Zerodha Kite Connect Authentication Service
 * Manages daily access token generation, validation, and storage.
 */
class KiteAuthService {
  constructor() {
    this.apiKey = process.env.KITE_API_KEY || '';
    this.apiSecret = process.env.KITE_API_SECRET || '';
    this.accessToken = process.env.KITE_ACCESS_TOKEN || '';
    this.totpSecret = process.env.KITE_TOTP_SECRET || '';
    this.kc = null;

    // Load stored access token from disk
    try {
      if (fs.existsSync(TOKEN_FILE_PATH)) {
        const fileContent = fs.readFileSync(TOKEN_FILE_PATH, 'utf8');
        const tokenData = JSON.parse(fileContent);
        if (tokenData && tokenData.accessToken) {
          this.accessToken = tokenData.accessToken;
          process.env.KITE_ACCESS_TOKEN = tokenData.accessToken;
          console.log('🔑 Loaded stored Zerodha KiteConnect access token from disk.');
        }
      }
    } catch (e) {}

    if (this.apiKey) {
      this.kc = new KiteConnect({
        api_key: this.apiKey,
        access_token: this.accessToken
      });
    }
  }

  /**
   * Get an active KiteConnect instance initialized with current access token
   */
  getKiteInstance() {
    if (!this.kc && this.apiKey) {
      this.kc = new KiteConnect({
        api_key: this.apiKey,
        access_token: this.accessToken || process.env.KITE_ACCESS_TOKEN
      });
    }
    if (this.kc && this.accessToken) {
      this.kc.setAccessToken(this.accessToken);
    }
    return this.kc;
  }

  /**
   * Set access token manually or from fresh authentication
   */
  setAccessToken(token) {
    this.accessToken = token;
    process.env.KITE_ACCESS_TOKEN = token;
    if (this.kc) {
      this.kc.setAccessToken(token);
    }
    try {
      fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify({
        accessToken: token,
        updatedAt: new Date().toISOString()
      }, null, 2), 'utf8');
      console.log('💾 Zerodha access token saved to persistent disk storage.');
    } catch (err) {
      console.error('Failed to save zerodhaToken.json:', err.message);
    }
  }

  /**
   * Generates TOTP code using 2FA secret (if configured)
   */
  async generateTOTP(totpSecret) {
    const secret = totpSecret || this.totpSecret || process.env.KITE_TOTP_SECRET;
    if (!secret) {
      throw new Error('KITE_TOTP_SECRET is not configured in .env');
    }
    try {
      return await generate({ secret });
    } catch (err) {
      if (err.name === 'SecretTooShortError' || secret.length < 16) {
        throw new Error(`KITE_TOTP_SECRET in .env ('${secret}') is too short. Please copy your permanent 32-character TOTP key from Zerodha (Profile -> Password & Security -> Enable 2FA TOTP -> "Can't scan? Copy key").`);
      }
      throw err;
    }
  }

  /**
   * Automated 100% Hands-Free Zerodha Login using User Credentials & TOTP 2FA
   */
  async autoLoginWithTOTP(userId, password, totpSecret) {
    const user = userId || process.env.KITE_USER_ID;
    const pwd = password || process.env.KITE_PASSWORD;
    const secret = totpSecret || process.env.KITE_TOTP_SECRET;

    if (!user || !pwd || !secret) {
      throw new Error('KITE_USER_ID, KITE_PASSWORD, and KITE_TOTP_SECRET are required for auto login.');
    }

    try {
      console.log(`⚡ Initiating Automated Zerodha TOTP Login for User '${user}'...`);

      // Step 1: User ID + Password Login
      const loginRes = await axios.post(
        'https://kite.zerodha.com/api/login',
        new URLSearchParams({ api_key: this.apiKey, user_id: user, password: pwd }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const requestId = loginRes.data?.data?.request_id;
      if (!requestId) throw new Error('Zerodha Login step failed: No request_id returned.');

      // Step 2: Generate 6-Digit TOTP Code dynamically
      const totpCode = await this.generateTOTP(secret);

      // Step 3: Two-Factor Authentication
      const twofaRes = await axios.post(
        'https://kite.zerodha.com/api/twofa',
        new URLSearchParams({ api_key: this.apiKey, user_id: user, request_id: requestId, twofa_value: totpCode }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const setCookies = twofaRes.headers['set-cookie'];
      const cookieHeader = setCookies ? setCookies.map(c => c.split(';')[0]).join('; ') : '';

      // Step 4: OAuth Connect Authorize Redirect
      const loginUrl = `https://kite.zerodha.com/connect/login?v=3&api_key=${this.apiKey}`;
      const authRes = await axios.get(loginUrl, {
        headers: { Cookie: cookieHeader },
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status < 400
      });

      const redirectLocation = authRes.headers.location || '';
      const urlObj = new URL(redirectLocation, 'http://localhost:5000');
      const requestToken = urlObj.searchParams.get('request_token');

      if (!requestToken) {
        throw new Error('Zerodha OAuth Redirect did not yield request_token.');
      }

      // Step 5: Exchange request_token for official access_token
      const session = await this.generateSession(requestToken);
      console.log('🟢 Automated Zerodha TOTP Auto-Login Successful!');
      return session;
    } catch (err) {
      console.error('❌ Automated Zerodha TOTP Login Error:', err.response?.data?.message || err.message);
      throw err;
    }
  }

  /**
   * Exchange request_token for access_token
   */
  async generateSession(requestToken) {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('KITE_API_KEY and KITE_API_SECRET must be configured');
    }

    const kc = new KiteConnect({ api_key: this.apiKey });
    try {
      const response = await kc.generateSession(requestToken, this.apiSecret);
      this.setAccessToken(response.access_token);
      console.log('✅ Zerodha KiteConnect Session Generated Successfully!');
      return response;
    } catch (err) {
      console.error('❌ Failed to generate Zerodha session:', err.message || err);
      throw err;
    }
  }

  /**
   * Validates if current credentials are operational
   */
  isConfigured() {
    return Boolean(this.apiKey && this.apiKey !== 'your_zerodha_api_key' && this.accessToken);
  }
}

module.exports = new KiteAuthService();
