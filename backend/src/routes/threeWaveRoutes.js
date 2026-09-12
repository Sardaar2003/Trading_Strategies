const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const threeWaveService = require('../services/threeWaveStrategyService');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * GET /api/three-wave/presets
 * Fetch supported strategy presets, custom timeframe options, and symbol universes
 */
router.get('/presets', (req, res) => {
  try {
    return res.json({
      success: true,
      presets: threeWaveService.TIMEFRAME_PRESETS,
      universes: threeWaveService.SCANNER_UNIVERSES,
      customTideOptions: [
        { value: '5Y', label: 'Weekly (5Y)' },
        { value: '1Y', label: 'Daily (1Y)' },
        { value: '6M', label: 'Daily (6M)' },
        { value: '1M', label: '60 Minute (1M)' },
        { value: '5D', label: '15 Minute (5D)' }
      ],
      customWaveOptions: [
        { value: '1Y', label: 'Daily (1Y)' },
        { value: '1M', label: '60 Minute (1M)' },
        { value: '5D', label: '15 Minute (5D)' },
        { value: '1D', label: '5 Minute (1D)' },
        { value: '1D_3M', label: '3 Minute (1D)' }
      ]
    });
  } catch (err) {
    logger.error(`Error getting 3 Wave presets: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to fetch strategy presets' });
  }
});

const { getScanProgress } = require('../threeWave/utils/scanProgressTracker');

/**
 * GET /api/three-wave/scan-progress
 * Fetch real-time progress and terminal execution logs during universe scan
 */
router.get('/scan-progress', (req, res) => {
  try {
    const progressState = getScanProgress();
    return res.json({
      success: true,
      data: progressState
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch scan progress' });
  }
});

/**
 * POST /api/three-wave/scan
 * Run parallel multi-symbol scanner across selected Zerodha universe and timeframes
 */
router.post('/scan', async (req, res) => {
  try {
    const { universeId = 'NIFTY50', presetId = 'position_daily_60m', customTide, customWave } = req.body;
    logger.info(`[3 WAVE SCAN] Running scan for Universe: ${universeId}, Preset: ${presetId}`);

    const result = await threeWaveService.runUniverseScan({
      universeId,
      presetId,
      customTide,
      customWave
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    logger.error(`Error running 3 Wave scanner: ${err.message}`);
    return res.status(500).json({ success: false, message: `Scanner failed: ${err.message}` });
  }
});

/**
 * POST /api/three-wave/evaluate
 * Perform deep single-symbol 3rd Wave evaluation with detailed 9-factor scorecard
 */
router.post('/evaluate', async (req, res) => {
  try {
    const { symbol = 'RELIANCE', tideTf = '1Y', waveTf = '1M' } = req.body;
    logger.info(`[3 WAVE EVALUATE] Evaluating symbol: ${symbol} (Tide: ${tideTf}, Wave: ${waveTf})`);

    const result = await threeWaveService.runSingleSymbolEvaluation({
      symbol,
      tideTf,
      waveTf
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    logger.error(`Error evaluating 3 Wave for symbol ${req.body?.symbol}: ${err.message}`);
    return res.status(500).json({ success: false, message: `Evaluation failed: ${err.message}` });
  }
});

module.exports = router;
