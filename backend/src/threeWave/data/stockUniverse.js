/**
 * Zerodha Stock Universes Provider (Nifty 50, Nifty Next 50, Midcap, Smallcap, F&O)
 */

const SCANNER_UNIVERSES = [
  {
    id: 'NIFTY50',
    name: '🇮🇳 Nifty 50 Benchmark',
    symbols: [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'BHARTIARTL', 'SBIN', 'ITC', 'LT', 'HINDUNILVR',
      'AXISBANK', 'KOTAKBANK', 'M&M', 'NTPC', 'MARUTI', 'SUNPHARMA', 'TITAN', 'ULTRACEMCO', 'POWERGRID', 'TATASTEEL',
      'BAJFINANCE', 'ADANIENT', 'JSWSTEEL', 'ASIANPAINT', 'HCLTECH', 'WIPRO', 'TECHM', 'ONGC', 'COALINDIA', 'TATAMOTORS'
    ]
  },
  {
    id: 'NIFTY_NEXT50',
    name: '🚀 Nifty Next 50 (Junior Bluechips)',
    symbols: [
      'ADANIPORTS', 'AMBUJACEM', 'AUROPHARMA', 'BANKBARODA', 'BERGEPAINT', 'BHARATFORG', 'BPCL', 'BRITANNIA',
      'CANBK', 'CHOLAFIN', 'COLPAL', 'CONCOR', 'DABUR', 'DIVISLAB', 'FEDERALBNK', 'GODREJPROP', 'HAVELLS',
      'ICICIGI', 'IOC', 'INDUSINDBK', 'NAUKRI', 'JINDALSTEL', 'LICHSGFIN', 'LUPIN', 'MAXHEALTH', 'NMDC',
      'PIDILITIND', 'PNB', 'SRF', 'TATAELXSI', 'TVSMOTOR'
    ]
  },
  {
    id: 'FNO',
    name: '⚡ Nifty F&O Active Derivatives',
    symbols: [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC', 'AXISBANK', 'KOTAKBANK',
      'TATAMOTORS', 'BAJAJFINSV', 'HEROMOTOCO', 'EICHERMOT', 'COALINDIA', 'GRASIM', 'HDFCLIFE', 'SBILIFE', 'CIPLA',
      'DRREDDY', 'APOLLOHOSP', 'HINDALCO', 'VEDL', 'TRENT', 'BEL', 'HAL', 'TATAPOWER', 'PFC', 'RECLTD', 'DLF',
      'SIEMENS', 'ABB', 'INDIGO', 'GAIL', 'ZOMATO', 'PAYTM', 'BSE'
    ]
  },
  {
    id: 'NIFTY100',
    name: '📊 Nifty 100 Largecap',
    symbols: [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'BHARTIARTL', 'SBIN', 'ITC', 'LT', 'HINDUNILVR',
      'AXISBANK', 'KOTAKBANK', 'M&M', 'NTPC', 'MARUTI', 'SUNPHARMA', 'TITAN', 'ULTRACEMCO', 'POWERGRID', 'TATASTEEL',
      'BAJFINANCE', 'ADANIENT', 'JSWSTEEL', 'ASIANPAINT', 'HCLTECH', 'WIPRO', 'TECHM', 'ONGC', 'COALINDIA', 'TATAMOTORS',
      'ADANIPORTS', 'AMBUJACEM', 'AUROPHARMA', 'BANKBARODA', 'BPCL', 'BRITANNIA', 'CHOLAFIN', 'DABUR', 'DIVISLAB', 'GODREJPROP'
    ]
  },
  {
    id: 'MIDCAP100',
    name: '📊 Nifty Midcap 100',
    symbols: [
      'ASHOKLEY', 'ASTRAL', 'AUFORTUNE', 'BALKRISIND', 'BANDHANBNK', 'BHARATFORG', 'BSOFT', 'COFORGE',
      'CONCOR', 'CUMMINSIND', 'DIXON', 'ESCORTS', 'GLENMARK', 'GMRINFRA', 'GODREJPROP', 'IDFCFIRSTB',
      'INDIAMART', 'IPCALAB', 'JUBLFOOD', 'KAYNES', 'KPITTECH', 'MPHASIS', 'OBEROIRLTY', 'PERSISTENT',
      'POLYCAB', 'RECLTD', 'SAIL', 'SUZLON', 'TRENT'
    ]
  },
  {
    id: 'SMALLCAP100',
    name: '🔬 Nifty Smallcap 100',
    symbols: [
      'ANGELONE', 'BATAINDIA', 'CENTURYTEX', 'CESC', 'CYIENT', 'DATAPATTNS', 'EXIDEIND', 'HFCL',
      'IEX', 'IRCTC', 'KEC', 'MANAPPURAM', 'MCX', 'NATIONALUM', 'NCC', 'RADICO', 'RAMCOCEM', 'RBLBANK', 'SJVN', 'SUZLON'
    ]
  },
  {
    id: 'NIFTY500',
    name: '🏆 Nifty 500 Broad Market',
    symbols: [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC', 'AXISBANK', 'KOTAKBANK',
      'TATAMOTORS', 'WIPRO', 'COALINDIA', 'ZOMATO', 'PAYTM', 'BSE', 'ABB', 'AMBUJACEM', 'AUROPHARMA', 'ASIANPAINT',
      'DRREDDY', 'GODREJPROP', 'HINDUNILVR', 'MARUTI'
    ]
  },
  {
    id: 'ALL_NSE',
    name: '🌐 ALL NSE Traded Equities',
    symbols: [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC', 'AXISBANK', 'KOTAKBANK',
      'TATAMOTORS', 'WIPRO', 'COALINDIA', 'ZOMATO', 'PAYTM', 'BSE', 'ABB', 'AMBUJACEM', 'AUROPHARMA', 'ASIANPAINT',
      'DRREDDY', 'GODREJPROP', 'HINDUNILVR', 'MARUTI'
    ]
  }
];

module.exports = {
  SCANNER_UNIVERSES
};
