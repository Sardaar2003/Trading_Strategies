/**
 * Zerodha KiteConnect Live Data Stream Provider
 */
const zerodhaMarketService = require('../../services/zerodhaMarketService');
const logger = require('../../config/logger');

const fetchSymbolCandles = async (symbol, tideTf = '1Y', waveTf = '1M') => {
  try {
    const tideSeriesRes = await zerodhaMarketService.getTimeSeries(symbol, tideTf, 120);
    const waveSeriesRes = await zerodhaMarketService.getTimeSeries(symbol, waveTf, 120);

    return {
      tideCandles: tideSeriesRes?.values || [],
      waveCandles: waveSeriesRes?.values || []
    };
  } catch (err) {
    logger.error(`[ZERODHA FETCHER] Error fetching candles for ${symbol}: ${err.message}`);
    return { tideCandles: [], waveCandles: [] };
  }
};

module.exports = {
  fetchSymbolCandles
};
