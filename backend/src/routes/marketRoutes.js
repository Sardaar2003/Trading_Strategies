const express = require('express');
const router = express.Router();
const { getMarketQuotes, getMarketTimeSeries, streamMarketData, searchMarketInstruments, getSystemHealth } = require('../controllers/marketController');

router.get('/health', getSystemHealth);
router.get('/quotes', getMarketQuotes);
router.get('/time_series', getMarketTimeSeries);
router.get('/stream', streamMarketData);
router.get('/search', searchMarketInstruments);

module.exports = router;
