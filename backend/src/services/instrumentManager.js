const axios = require('axios');
const fs = require('fs');
const path = require('path');
const kiteAuth = require('./kiteAuth');

const INSTRUMENTS_CACHE_FILE = path.join(__dirname, '../../instruments_cache.json');

/**
 * Default fallback Instrument Token Mappings for key Indian Market Tickers.
 */
const DEFAULT_INSTRUMENT_MAPPINGS = {
  'NIFTY 50': 256265,
  'NIFTY BANK': 260105,
  'BANKNIFTY': 260105,
  'RELIANCE': 738561,
  'TCS': 2953217,
  'INFY': 408065,
  'HDFCBANK': 341249,
  'ICICIBANK': 1270529,
  'TATAMOTORS': 884737,
  'SBIN': 779521,
  'BHARTIARTL': 2714625,
  'ITC': 424961,
  'COALINDIA': 5215745,
  'WIPRO': 969473,
  'PAYTM': 1386753,
  'ZOMATO': 1305344,
  'USDINR': 452867,
  'USD/INR': 452867
};

class InstrumentManager {
  constructor() {
    this.symbolToToken = new Map();
    this.tokenToSymbol = new Map();
    this.allInstruments = [];
    this.lastSyncDate = null;
    this.initialized = false;

    // Load defaults immediately
    this._loadDefaults();

    // 1. Try loading cached instruments from local disk instantly
    this.loadInstrumentsFromDisk();

    // 2. Fetch fresh instruments dump from Zerodha API
    this.refreshInstruments();

    // 3. Schedule pre-market daily refresh (8:15 AM IST)
    this._scheduleDailyPreMarketRefresh();
  }

  _loadDefaults() {
    const popularDefaults = [
      { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', exchange: 'NSE', category: 'Stocks', type: 'EQ', token: 341249, exchange_token: 1333, last_price: 1658.2, tick_size: 0.05, lot_size: 1, segment: 'NSE' },
      { symbol: 'RELIANCE', name: 'Reliance Industries Limited', exchange: 'NSE', category: 'Stocks', type: 'EQ', token: 738561, exchange_token: 2885, last_price: 1257.5, tick_size: 0.05, lot_size: 1, segment: 'NSE' },
      { symbol: 'BSE', name: 'BSE Ltd.', exchange: 'NSE', category: 'Stocks', type: 'EQ', token: 1307649, exchange_token: 5108, last_price: 2450.0, tick_size: 0.05, lot_size: 1, segment: 'NSE' },
      { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', category: 'Stocks', type: 'EQ', token: 779521, exchange_token: 3045, last_price: 818.4, tick_size: 0.05, lot_size: 1, segment: 'NSE' },
      { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', exchange: 'NSE', category: 'Stocks', type: 'EQ', token: 1270529, exchange_token: 4963, last_price: 1222.1, tick_size: 0.05, lot_size: 1, segment: 'NSE' },
      { symbol: 'PAYTM', name: 'One 97 Communications Ltd.', exchange: 'NSE', category: 'Stocks', type: 'EQ', token: 1386753, exchange_token: 5417, last_price: 680.5, tick_size: 0.05, lot_size: 1, segment: 'NSE' },
      { symbol: 'INFY', name: 'Infosys Limited', exchange: 'NSE', category: 'Stocks', type: 'EQ', token: 408065, exchange_token: 1594, last_price: 1902.0, tick_size: 0.05, lot_size: 1, segment: 'NSE' },
      { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', exchange: 'NSE', category: 'Stocks', type: 'EQ', token: 2953217, exchange_token: 11536, last_price: 4215.0, tick_size: 0.05, lot_size: 1, segment: 'NSE' },
      { symbol: 'COALINDIA', name: 'Coal India Ltd.', exchange: 'NSE', category: 'Stocks', type: 'EQ', token: 5215745, exchange_token: 20374, last_price: 388.4, tick_size: 0.05, lot_size: 1, segment: 'NSE' },
      { symbol: 'ZOMATO', name: 'Zomato Ltd.', exchange: 'NSE', category: 'Stocks', type: 'EQ', token: 1305344, exchange_token: 5099, last_price: 265.0, tick_size: 0.05, lot_size: 1, segment: 'NSE' },
      { symbol: 'WIPRO', name: 'Wipro Ltd.', exchange: 'NSE', category: 'Stocks', type: 'EQ', token: 969473, exchange_token: 3787, last_price: 520.0, tick_size: 0.05, lot_size: 1, segment: 'NSE' },
      { symbol: 'NIFTY 50', name: 'NSE NIFTY 50 Index', exchange: 'NSE', category: 'Indices', type: 'IND', token: 256265, exchange_token: 1, last_price: 23478.0, tick_size: 0.05, lot_size: 1, segment: 'NSE-IND' },
      { symbol: 'BANKNIFTY', name: 'NIFTY Bank Index', exchange: 'NSE', category: 'Indices', type: 'IND', token: 260105, exchange_token: 16, last_price: 51320.0, tick_size: 0.05, lot_size: 1, segment: 'NSE-IND' },
      { symbol: 'USD/INR', name: 'US Dollar / Indian Rupee', exchange: 'CDS', category: 'Forex', type: 'FUT', token: 452867, exchange_token: 1769, last_price: 83.94, tick_size: 0.0025, lot_size: 1000, segment: 'CDS-FUT' }
    ];

    for (const item of popularDefaults) {
      this.symbolToToken.set(item.symbol.toUpperCase(), item.token);
      this.tokenToSymbol.set(item.token, item.symbol.toUpperCase());
    }
    this.allInstruments = popularDefaults;
  }

  /**
   * Load instruments dump from local disk cache (`instruments_cache.json`)
   */
  loadInstrumentsFromDisk() {
    try {
      if (fs.existsSync(INSTRUMENTS_CACHE_FILE)) {
        const fileData = fs.readFileSync(INSTRUMENTS_CACHE_FILE, 'utf8');
        const parsed = JSON.parse(fileData);
        if (parsed && Array.isArray(parsed.instruments) && parsed.instruments.length > 0) {
          this.allInstruments = parsed.instruments;
          this.lastSyncDate = parsed.lastSyncDate || new Date().toISOString();
          parsed.instruments.forEach(inst => {
            if (inst.symbol && inst.token) {
              this.symbolToToken.set(inst.symbol.toUpperCase(), inst.token);
              this.tokenToSymbol.set(inst.token, inst.symbol.toUpperCase());
            }
          });
          console.log(`✅ Loaded ${parsed.instruments.length} Zerodha instruments from persistent disk cache (${this.lastSyncDate}).`);
          this.initialized = true;
        }
      }
    } catch (err) {
      console.warn(`⚠️ Could not load instruments_cache.json from disk: ${err.message}`);
    }
  }

  /**
   * Save instruments dump to persistent disk cache (`instruments_cache.json`)
   */
  saveInstrumentsToDisk() {
    try {
      const payload = {
        lastSyncDate: new Date().toISOString(),
        count: this.allInstruments.length,
        instruments: this.allInstruments
      };
      fs.writeFileSync(INSTRUMENTS_CACHE_FILE, JSON.stringify(payload, null, 2), 'utf8');
      console.log(`💾 Saved ${this.allInstruments.length} Zerodha instruments to local disk cache.`);
    } catch (err) {
      console.warn(`⚠️ Failed to save instruments_cache.json to disk: ${err.message}`);
    }
  }

  /**
   * Fetch Zerodha Master Instruments dump across exchange segments
   * Endpoints supported:
   * GET https://api.kite.trade/instruments
   * GET https://api.kite.trade/instruments/NSE
   * GET https://api.kite.trade/instruments/BSE
   */
  async refreshInstruments(exchangeFilter = null) {
    try {
      // If official KiteConnect SDK instance is logged in, try using native kc.getInstruments()
      const kc = kiteAuth.getKiteInstance();
      if (kc && kiteAuth.accessToken) {
        try {
          const sdkInstruments = exchangeFilter ? await kc.getInstruments(exchangeFilter) : await kc.getInstruments();
          if (Array.isArray(sdkInstruments) && sdkInstruments.length > 0) {
            this._processSdkInstruments(sdkInstruments);
            this.saveInstrumentsToDisk();
            return;
          }
        } catch (e) {
          console.warn(`Kite SDK getInstruments deferred, falling back to direct HTTP CSV dump: ${e.message}`);
        }
      }

      const url = exchangeFilter
        ? `https://api.kite.trade/instruments/${exchangeFilter}`
        : 'https://api.kite.trade/instruments';

      console.log(`🔄 Downloading Zerodha Master Instruments CSV dump from ${url}...`);
      const response = await axios.get(url, { timeout: 20000 });

      if (typeof response.data === 'string') {
        const lines = response.data.split('\n');
        const parsedInstruments = [];

        // Header: instrument_token,exchange_token,tradingsymbol,name,last_price,expiry,strike,tick_size,lot_size,instrument_type,segment,exchange
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const cols = lines[i].split(',');
          if (cols.length >= 12) {
            const token = parseInt(cols[0], 10);
            const exchange_token = parseInt(cols[1], 10) || 0;
            const symbol = cols[2].replace(/"/g, '').trim().toUpperCase();
            let rawName = cols[3].replace(/"/g, '').trim();
            const last_price = parseFloat(cols[4]) || 0;
            const tick_size = parseFloat(cols[7]) || 0.05;
            const lot_size = parseInt(cols[8], 10) || 1;
            const type = cols[9].replace(/"/g, '').trim().toUpperCase();
            const segment = cols[10].replace(/"/g, '').trim().toUpperCase();
            const exchange = cols[11].replace(/"/g, '').trim().toUpperCase();

            if (!symbol || isNaN(token)) continue;

            let category = 'Stocks';
            if (type === 'IND' || segment.includes('IND')) category = 'Indices';
            else if (type === 'FUT' || segment.includes('FUT')) category = 'Futures';
            else if (type === 'CE' || type === 'PE' || segment.includes('OPT')) category = 'Options';
            else if (exchange === 'CDS' || segment.includes('CDS')) category = 'Forex';
            else if (exchange === 'MCX') category = 'Commodities';

            const name = rawName && rawName !== symbol ? rawName : `${symbol} (${exchange} ${category})`;

            this.symbolToToken.set(symbol, token);
            this.tokenToSymbol.set(token, symbol);

            if (['NSE', 'BSE', 'CDS', 'MCX', 'NFO', 'BFO'].includes(exchange)) {
              parsedInstruments.push({
                symbol,
                name,
                exchange,
                category,
                type,
                token,
                instrument_token: token,
                exchange_token,
                last_price,
                tick_size,
                lot_size,
                segment
              });
            }
          }
        }

        if (parsedInstruments.length > 0) {
          this.allInstruments = parsedInstruments;
          this.lastSyncDate = new Date().toISOString();
          console.log(`✅ Loaded ${parsedInstruments.length} Zerodha instruments into search engine catalog.`);
          this.initialized = true;
          this.saveInstrumentsToDisk();
        }
      }
    } catch (err) {
      console.warn('⚠️ Could not fetch remote Zerodha instruments catalog, serving persistent disk cache:', err.message);
    }
  }

  _processSdkInstruments(instrumentsArray = []) {
    const parsed = [];
    for (const inst of instrumentsArray) {
      const token = inst.instrument_token;
      const symbol = (inst.tradingsymbol || '').toUpperCase();
      const name = inst.name || symbol;
      const exchange = (inst.exchange || 'NSE').toUpperCase();
      const type = (inst.instrument_type || 'EQ').toUpperCase();
      const segment = (inst.segment || exchange).toUpperCase();

      if (!symbol || !token) continue;

      let category = 'Stocks';
      if (type === 'IND' || segment.includes('IND')) category = 'Indices';
      else if (type === 'FUT' || segment.includes('FUT')) category = 'Futures';
      else if (type === 'CE' || type === 'PE' || segment.includes('OPT')) category = 'Options';
      else if (exchange === 'CDS') category = 'Forex';
      else if (exchange === 'MCX') category = 'Commodities';

      this.symbolToToken.set(symbol, token);
      this.tokenToSymbol.set(token, symbol);

      parsed.push({
        symbol,
        name: name !== symbol ? name : `${symbol} (${exchange})`,
        exchange,
        category,
        type,
        token,
        instrument_token: token,
        exchange_token: inst.exchange_token || 0,
        last_price: inst.last_price || 0,
        tick_size: inst.tick_size || 0.05,
        lot_size: inst.lot_size || 1,
        segment
      });
    }

    if (parsed.length > 0) {
      this.allInstruments = parsed;
      this.lastSyncDate = new Date().toISOString();
      console.log(`✅ Processed ${parsed.length} instruments via KiteConnect SDK.`);
      this.initialized = true;
    }
  }

  /**
   * Fast In-Memory Search Engine for Zerodha Instruments
   */
  searchInstruments({ query = '', exchange = 'ALL', category = 'All', limit = 50 } = {}) {
    const cleanQuery = (query || '').toLowerCase().trim();
    const cleanExchange = (exchange || 'ALL').toUpperCase().trim();
    const cleanCategory = (category || 'All').trim();

    return this.allInstruments.filter((item) => {
      // Exchange Filter (ALL, NSE, BSE, CDS, MCX, NFO)
      if (cleanExchange !== 'ALL' && item.exchange !== cleanExchange) {
        return false;
      }

      // Category Filter (All, Stocks, Funds, Futures, Forex, Crypto, Indices, Bonds, Economy, Options)
      if (cleanCategory !== 'All') {
        if (cleanCategory === 'Stocks' && item.category !== 'Stocks') return false;
        if (cleanCategory === 'Indices' && item.category !== 'Indices') return false;
        if (cleanCategory === 'Futures' && item.category !== 'Futures') return false;
        if (cleanCategory === 'Forex' && item.category !== 'Forex') return false;
        if (cleanCategory === 'Options' && item.category !== 'Options') return false;
        if (cleanCategory === 'Commodities' && item.category !== 'Commodities') return false;
      }

      // Query Search (matches symbol or company name)
      if (!cleanQuery) return true;

      const symLower = item.symbol.toLowerCase();
      const nameLower = item.name.toLowerCase();
      return symLower.includes(cleanQuery) || nameLower.includes(cleanQuery);
    }).slice(0, limit);
  }

  /**
   * Schedule pre-market refresh once daily at 8:15 AM IST
   */
  _scheduleDailyPreMarketRefresh() {
    // Schedule check every hour to see if IST time is 8:15 AM
    setInterval(() => {
      const now = new Date();
      const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      if (istTime.getHours() === 8 && istTime.getMinutes() === 15) {
        console.log('🌅 Pre-market setup (8:15 AM IST): Refreshing Zerodha Master Instruments catalog...');
        this.refreshInstruments();
      }
    }, 60 * 1000);
  }

  /**
   * Get token for a symbol name (e.g. "NIFTY 50" -> 256265)
   */
  getToken(symbol) {
    if (!symbol) return null;
    const cleanSymbol = symbol.toUpperCase().trim();
    return this.symbolToToken.get(cleanSymbol) || DEFAULT_INSTRUMENT_MAPPINGS[cleanSymbol] || null;
  }

  /**
   * Get symbol name for a numeric token (e.g. 256265 -> "NIFTY 50")
   */
  getSymbol(token) {
    const numToken = Number(token);
    return this.tokenToSymbol.get(numToken) || null;
  }

  /**
   * Get complete instrument details object for a symbol (e.g. "TATASTEEL" -> { symbol, name, last_price, exchange, ... })
   */
  getInstrumentDetails(symbol) {
    if (!symbol) return null;
    const cleanSymbol = symbol.toUpperCase().trim();
    return this.allInstruments.find(inst => inst.symbol === cleanSymbol) || null;
  }

  /**
   * Return array of numeric tokens for a list of human-readable symbols
   */
  getTokensForSymbols(symbolsArray = []) {
    const tokens = [];
    for (const sym of symbolsArray) {
      const token = this.getToken(sym);
      if (token) tokens.push(token);
    }
    return tokens;
  }
}

module.exports = new InstrumentManager();
