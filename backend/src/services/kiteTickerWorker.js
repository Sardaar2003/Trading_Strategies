const { KiteTicker } = require('kiteconnect');
const EventEmitter = require('events');
const kiteAuth = require('./kiteAuth');
const instrumentManager = require('./instrumentManager');

/**
 * KiteTicker Worker Ingestion Engine
 * Maintains single, persistent WebSocket connection to Zerodha Kite Connect.
 */
class KiteTickerWorker extends EventEmitter {
  constructor() {
    super();
    this.ticker = null;
    this.isConnected = false;
    this.subscribedTokens = new Set();
    this.latestTicksMap = new Map(); // token -> normalized tick quote
    this.throttledTimer = null;
    this.dirtyTokens = new Set(); // tokens updated since last broadcast cycle
  }

  /**
   * Start the KiteTicker persistent WebSocket worker
   */
  async startWorker() {
    const apiKey = process.env.KITE_API_KEY;
    let accessToken = process.env.KITE_ACCESS_TOKEN;

    // Check if auto-login via TOTP 2FA is configured
    if (!accessToken && process.env.KITE_USER_ID && process.env.KITE_PASSWORD && process.env.KITE_TOTP_SECRET) {
      try {
        const session = await kiteAuth.autoLoginWithTOTP();
        accessToken = session.access_token;
      } catch (err) {
        console.warn('⚠️ Auto TOTP login attempt failed:', err.message);
      }
    }

    if (!apiKey || apiKey === 'your_zerodha_api_key' || !accessToken) {
      console.log('ℹ️ Zerodha KiteConnect active token not found. (Add KITE_USER_ID, KITE_PASSWORD, and KITE_TOTP_SECRET in .env for hands-free auto-login).');
      return false;
    }

    try {
      console.log('⚡ Initializing Zerodha KiteTicker WebSocket Engine...');
      this.ticker = new KiteTicker({
        api_key: apiKey,
        access_token: accessToken
      });

      // Enable auto reconnection with 50 retries and 5-second interval
      this.ticker.autoReconnect(true, 50, 5);

      this.ticker.on('connect', this._onConnect.bind(this));
      this.ticker.on('ticks', this._onTicks.bind(this));
      this.ticker.on('order_update', this._onOrderUpdate.bind(this));
      this.ticker.on('disconnect', this._onDisconnect.bind(this));
      this.ticker.on('error', this._onError.bind(this));
      this.ticker.on('reconnect', this._onReconnect.bind(this));
      this.ticker.on('noreconnect', this._onNoReconnect.bind(this));


      this.ticker.connect();
      this._startThrottledBroadcast();
      return true;
    } catch (err) {
      console.error('❌ Failed to start KiteTicker worker:', err.message || err);
      return false;
    }
  }

  /**
   * Triggered on successful WebSocket connection
   */
  _onConnect() {
    this.isConnected = true;
    console.log('🟢 Zerodha KiteTicker WebSocket Connected!');

    // Load default Indian tickers to subscribe
    const defaultSymbols = ['NIFTY 50', 'BANKNIFTY', 'RELIANCE', 'TCS', 'USDINR'];
    const tokens = instrumentManager.getTokensForSymbols(defaultSymbols);

    if (tokens.length > 0) {
      this.subscribe(tokens);
    }
  }

  /**
   * Subscribe to numeric instrument tokens
   */
  subscribe(tokens = []) {
    if (!tokens || tokens.length === 0) return;
    tokens.forEach((t) => this.subscribedTokens.add(Number(t)));

    if (this.ticker && this.isConnected) {
      const tokenArr = Array.from(this.subscribedTokens);
      console.log(`📡 KiteTicker Subscribing to ${tokenArr.length} tokens:`, tokenArr);
      this.ticker.subscribe(tokenArr);
      // Set Mode to Full or Quote (MODE_FULL = 'full', MODE_QUOTE = 'quote')
      this.ticker.setMode(this.ticker.MODE_QUOTE, tokenArr);
    }
  }

  /**
   * Non-blocking Zerodha ticks callback
   * Process raw binary tick payload in < 1ms
   */
  _onTicks(ticks = []) {
    const now = new Date();
    const istTimeString = now.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: false
    });

    for (let i = 0; i < ticks.length; i++) {
      const tick = ticks[i];
      const token = tick.instrument_token;
      const symbol = instrumentManager.getSymbol(token) || `TOKEN_${token}`;
      
      const lastPrice = tick.last_price || 0;
      const change = tick.change || 0; // % change from ohlc.close
      const open = tick.ohlc ? tick.ohlc.open : lastPrice;
      const high = tick.ohlc ? tick.ohlc.high : lastPrice;
      const low = tick.ohlc ? tick.ohlc.low : lastPrice;
      const close = tick.ohlc ? tick.ohlc.close : lastPrice;

      const normalizedTick = {
        symbol: symbol,
        token: token,
        price: lastPrice,
        change: ((lastPrice - close)).toFixed(2),
        changePercent: (change >= 0 ? '+' : '') + change.toFixed(2) + '%',
        high: high,
        low: low,
        close: close,
        volume: tick.volume_traded || 0,
        timestamp: istTimeString,
        provider: 'ZERODHA_KITE'
      };

      this.latestTicksMap.set(token, normalizedTick);
      this.dirtyTokens.add(token);
    }
  }

  /**
   * Throttled batch emitter (runs every 150ms)
   * Prevents UI freeze from high-frequency liquid ticks
   */
  _startThrottledBroadcast() {
    if (this.throttledTimer) clearInterval(this.throttledTimer);

    this.throttledTimer = setInterval(() => {
      if (this.dirtyTokens.size > 0) {
        const changedTicks = [];
        for (const token of this.dirtyTokens) {
          const tick = this.latestTicksMap.get(token);
          if (tick) changedTicks.push(tick);
        }
        this.dirtyTokens.clear();

        if (changedTicks.length > 0) {
          this.emit('batch_ticks', changedTicks);
        }
      }
    }, 150); // 150ms batching interval
  }

  _onOrderUpdate(order) {
    console.log('⚡ Live Order Update received from Zerodha WebSocket:', order?.order_id, order?.status);
    this.emit('order_update', order);
  }

  _onDisconnect(error) {

    this.isConnected = false;
    console.warn('🟡 KiteTicker WebSocket disconnected:', error);
  }

  _onReconnect(reconnect_count, allocation_interval) {
    console.log(`🔄 KiteTicker reconnecting attempt #${reconnect_count} in ${allocation_interval}s...`);
  }

  _onNoReconnect() {
    this.isConnected = false;
    console.error('🔴 KiteTicker reached maximum reconnect attempts without success.');
  }

  _onError(error) {
    console.error('❌ KiteTicker error:', error);
  }

  /**
   * Get snapshot of latest quotes
   */
  getSnapshot() {
    return Array.from(this.latestTicksMap.values());
  }
}

module.exports = new KiteTickerWorker();
