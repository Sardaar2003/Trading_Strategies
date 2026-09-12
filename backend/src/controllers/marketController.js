const zerodhaMarketService = require('../services/zerodhaMarketService');
const instrumentManager = require('../services/instrumentManager');
const logger = require('../config/logger');

// @desc    Get real-time Indian market quotes
// @route   GET /api/market/quotes
// @access  Public
const getMarketQuotes = async (req, res, next) => {
  try {
    const quotes = await zerodhaMarketService.getQuotes();

    return res.status(200).json({
      success: true,
      timestamp: new Date(),
      quotes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Indian market OHLC candlestick time series
// @route   GET /api/market/time_series
// @access  Public
const getMarketTimeSeries = async (req, res, next) => {
  try {
    const symbol = req.query.symbol || 'NIFTY 50';
    const interval = req.query.interval || req.query.timeframe || '1D';
    const outputsize = parseInt(req.query.outputsize, 10) || 60;

    const series = await zerodhaMarketService.getTimeSeries(symbol, interval, outputsize);

    return res.status(200).json({
      success: true,
      data: series
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stream real-time Indian market data via Zerodha SSE Fan-Out Hub
// @route   GET /api/market/stream
// @access  Public
const streamMarketData = (req, res) => {
  zerodhaMarketService.subscribeStream(req, res);
};

// @desc    Search Zerodha Master Instruments (NSE, BSE, CDS, MCX)
// @route   GET /api/market/search
// @access  Public
const searchMarketInstruments = (req, res) => {
  try {
    const query = req.query.query || req.query.q || '';
    const exchange = req.query.exchange || 'ALL';
    const category = req.query.category || 'All';
    const limit = parseInt(req.query.limit, 10) || 50;

    const results = instrumentManager.searchInstruments({ query, exchange, category, limit });

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

let totalClaudeCostUsed = 0.15;
let totalClaudeCalls = 5;

// @desc    Get live system health, API latency and Claude budget
// @route   GET /api/market/health
// @access  Public
const getSystemHealth = (req, res) => {
  const budgetLeft = Math.max(0, 5.00 - totalClaudeCostUsed);

  return res.status(200).json({
    success: true,
    claudeBudget: {
      total: 5.00,
      used: parseFloat(totalClaudeCostUsed.toFixed(2)),
      left: parseFloat(budgetLeft.toFixed(2)),
      calls: totalClaudeCalls
    },
    serverTime: new Date().toISOString()
  });
};

const recordClaudeUsage = (cost = 0.015) => {
  totalClaudeCostUsed += cost;
  totalClaudeCalls += 1;
};

module.exports = {
  getMarketQuotes,
  getMarketTimeSeries,
  streamMarketData,
  searchMarketInstruments,
  getSystemHealth,
  recordClaudeUsage
};
