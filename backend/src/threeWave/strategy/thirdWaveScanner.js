/**
 * ASTA 3rd Wave Setup Evaluator & Multi-Symbol Scanner
 */
const { calculateEMA, calculateRSI } = require('../indicators/oscillators');
const { isUngliSetup, isBbcCandle, findRecentBbcCandle, isVolumeBreakout } = require('../indicators/candlestick');
const { analyzeBBNC } = require('../indicators/bollinger');
const { analyzeWaveStructure } = require('../indicators/waveAnalysis');
const { calculate3rdWaveTargets } = require('../indicators/fibonacci');
const { SCANNER_UNIVERSES } = require('../data/stockUniverse');
const { fetchSymbolCandles } = require('../data/zerodhaFetcher');
const { runMultiAgentSwarmOrchestrator } = require('../agents/orchestrator');
const logger = require('../../config/logger');

// Supported Preset Timeframes
const TIMEFRAME_PRESETS = [
  { id: 'position_daily_60m', label: 'Position / Daily (Daily / 60m)', tide: '1Y', tideInterval: 'day', wave: '1M', waveInterval: '60minute' },
  { id: 'swing_weekly_daily', label: 'Swing Trading (Weekly / Daily)', tide: '5Y', tideInterval: 'week', wave: '1Y', waveInterval: 'day' },
  { id: 'short_daily_15m', label: 'Short Position (Daily / 15m)', tide: '1Y', tideInterval: 'day', wave: '5D', waveInterval: '15minute' },
  { id: 'intraday_60m_15m', label: 'Intraday Momentum (60m / 15m)', tide: '1M', tideInterval: '60minute', wave: '5D', waveInterval: '15minute' },
  { id: 'scalping_15m_5m', label: 'Scalping (15m / 5m)', tide: '5D', tideInterval: '15minute', wave: '1D', waveInterval: '5minute' },
  { id: 'micro_5m_3m', label: 'Micro Scalper (5m / 3m)', tide: '1D', tideInterval: '5minute', wave: '1D', waveInterval: '3minute' }
];

// Core Setup Evaluator Engine — ASTA 3rd Wave Setup Checklist
const evaluate3rdWaveSetup = (symbol, tideCandles, waveCandles) => {
  if (!tideCandles || tideCandles.length < 20 || !waveCandles || waveCandles.length < 20) {
    return {
      symbol,
      status: 'INSUFFICIENT_DATA',
      signal: 'NEUTRAL',
      confidencePct: 0,
      bullishScore: '0/8',
      bearishScore: '0/8',
      latestPrice: 0,
      bullishCriteria: {},
      bearishCriteria: {},
      supportingIndicators: { volumeBreakout: false, status: 'FAIL', rule: 'Above average Volume on BO / BD Candle (MUST)' },
      targets: {}
    };
  }

  // 1. TIDE ANALYSIS (Screen 1 - Higher Timeframe)
  const tideCloses = tideCandles.map(c => Number(c.close));
  const tideEma20 = calculateEMA(tideCloses, 20);
  const tideLatestClose = tideCloses[tideCloses.length - 1];
  const tideLatestEma20 = tideEma20[tideEma20.length - 1] || tideLatestClose;

  const tideUptick = tideLatestClose > tideLatestEma20;
  const tideDowntick = tideLatestClose < tideLatestEma20;

  const tideBbnc = analyzeBBNC(tideCandles);
  const tideRsiSeries = calculateRSI(tideCloses, 14);
  const tideRsi = tideRsiSeries[tideRsiSeries.length - 1] || 50;

  // 2. WAVE ANALYSIS (Screen 2 - Lower Timeframe)
  const waveCloses = waveCandles.map(c => Number(c.close));
  const waveStruct = analyzeWaveStructure(waveCandles);
  const waveRsiSeries = calculateRSI(waveCloses, 14);
  const waveRsi = waveRsiSeries[waveRsiSeries.length - 1] || 50;

  const currWaveBar = waveCandles[waveCandles.length - 1];
  const ungli = isUngliSetup(currWaveBar);
  const currIsBbc = isBbcCandle(waveCandles);
  const recentBbcObj = findRecentBbcCandle(waveCandles, 4);
  const hasBbc = currIsBbc || Boolean(recentBbcObj);
  const volBo = isVolumeBreakout(waveCandles);

  // TLBO + BBC Combined Rule (Breakout with or out of Base Building Candle consolidation)
  const waveTlboBbc = waveStruct.tlboDetected && hasBbc;
  const waveTlbdBbc = waveStruct.tlbdDetected && hasBbc;

  // Wave - Double Screen Confirmation Rule:
  // Both Screen 1 (Tide HTF trend) AND Screen 2 (Wave LTF setup trigger) confirm direction
  const doubleScreenBullish = Boolean(
    tideUptick &&
    (tideBbnc.bbncDn || tideBbnc.isSqueeze || tideRsi > 50.0) &&
    (waveStruct.hasTwoHls || waveStruct.tlboDetected || ungli.bullishUngli)
  );

  const doubleScreenBearish = Boolean(
    tideDowntick &&
    (tideBbnc.bbncUp || tideBbnc.isSqueeze || tideRsi < 50.0) &&
    (waveStruct.hasTwoLhs || waveStruct.tlbdDetected || ungli.bearishUngli)
  );

  // STEP 1: ENTRY CRITERIA — 8-Factor ASTA Scorecard
  const bullishCriteria = {
    'Tide - Uptick': tideUptick,
    'Tide - BBNC - DN': tideBbnc.bbncDn || tideBbnc.isSqueeze,
    'Tide - P > 50 (Nice to have)': tideRsi > 50.0,
    'Wave - Two HLs': waveStruct.hasTwoHls,
    'Wave - TLBO + BBC': waveTlboBbc,
    'Wave - Ungli setup': ungli.bullishUngli,
    'Wave - P > 50': waveRsi > 50.0,
    'Wave - Double Screen Confirmation': doubleScreenBullish
  };

  const bearishCriteria = {
    'Tide - Downtick': tideDowntick,
    'Tide - BBNC - UP': tideBbnc.bbncUp || tideBbnc.isSqueeze,
    'Tide - P < 50 (Nice to have)': tideRsi < 50.0,
    'Wave - Two LHs': waveStruct.hasTwoLhs,
    'Wave - TLBD + BBC': waveTlbdBbc,
    'Wave - Ungli setup': ungli.bearishUngli,
    'Wave - Price < 50': waveRsi < 50.0,
    'Wave - Double Screen Confirmation': doubleScreenBearish
  };

  const totalCriteria = 8;
  const bullishScore = Object.values(bullishCriteria).filter(Boolean).length;
  const bearishScore = Object.values(bearishCriteria).filter(Boolean).length;

  // STEP 2: SUPPORTING INDICATORS (Volume on BO/BD Candle — MUST)
  const supportingIndicators = {
    volumeBreakout: volBo,
    status: volBo ? 'PASS' : 'FAIL',
    rule: 'Above average Volume on BO / BD Candle (MUST)'
  };

  let signal = 'NEUTRAL';
  let confidencePct = 0.0;
  let targets = {};
  const latestPrice = Number(currWaveBar.close);

  const waveLows20 = waveCandles.slice(-20).map(c => Number(c.low));
  const waveHighs20 = waveCandles.slice(-20).map(c => Number(c.high));
  const waveLows5 = waveCandles.slice(-5).map(c => Number(c.low));
  const waveHighs5 = waveCandles.slice(-5).map(c => Number(c.high));

  // Identification of BO/BD candle and BBC candle for ASTA Step 3 Stop Loss
  const bbcCandleRef = recentBbcObj?.candle || (currIsBbc ? currWaveBar : null);

  if (bullishScore >= 5 && volBo && (waveStruct.hasTwoHls || ungli.bullishUngli || waveStruct.tlboDetected)) {
    signal = 'BUY (3rd Wave Bullish)';
    confidencePct = Number(((bullishScore / totalCriteria) * 100).toFixed(1));
    targets = calculate3rdWaveTargets(
      latestPrice,
      Math.min(...waveLows20),
      Math.max(...waveHighs20),
      Math.min(...waveLows5),
      true,
      1.618,
      currWaveBar,
      bbcCandleRef
    );
  } else if (bearishScore >= 5 && volBo && (waveStruct.hasTwoLhs || ungli.bearishUngli || waveStruct.tlbdDetected)) {
    signal = 'SELL (3rd Wave Bearish)';
    confidencePct = Number(((bearishScore / totalCriteria) * 100).toFixed(1));
    targets = calculate3rdWaveTargets(
      latestPrice,
      Math.min(...waveLows20),
      Math.max(...waveHighs20),
      Math.max(...waveHighs5),
      false,
      1.618,
      currWaveBar,
      bbcCandleRef
    );
  }

  return {
    symbol,
    signal,
    confidencePct,
    bullishScore: `${bullishScore}/${totalCriteria}`,
    bearishScore: `${bearishScore}/${totalCriteria}`,
    latestPrice,
    bullishCriteria,
    bearishCriteria,
    supportingIndicators,
    targets,
    waveStructure: waveStruct,
    bbnc: tideBbnc
  };
};

// Scan multi-symbol universe over Zerodha historical candles
const { startScanProgress, updateSymbolProgress, finishScanProgress } = require('../utils/scanProgressTracker');

const runUniverseScan = async ({ universeId = 'NIFTY50', presetId = 'position_daily_60m', customTide = null, customWave = null }) => {
  let tideTf = '1Y';
  let waveTf = '1M';

  if (customTide && customWave) {
    tideTf = customTide;
    waveTf = customWave;
  } else {
    const preset = TIMEFRAME_PRESETS.find(p => p.id === presetId) || TIMEFRAME_PRESETS[0];
    tideTf = preset.tide;
    waveTf = preset.wave;
  }

  const selectedUniverse = SCANNER_UNIVERSES.find(u => u.id === universeId) || SCANNER_UNIVERSES[0];
  const symbols = selectedUniverse.symbols;

  // Initialize progress tracker
  startScanProgress(universeId, presetId, symbols.length);

  const hits = [];
  const nearHits = [];
  const scanned = [];

  for (const sym of symbols) {
    try {
      const { tideCandles, waveCandles } = await fetchSymbolCandles(sym, tideTf, waveTf);
      const evalRes = evaluate3rdWaveSetup(sym, tideCandles, waveCandles);

      const bScore = parseInt(evalRes.bullishScore.split('/')[0], 10);
      const sScore = parseInt(evalRes.bearishScore.split('/')[0], 10);
      const maxScore = Math.max(bScore, sScore);

      let isHit = false;
      let isNearHit = false;

      if (evalRes.signal.includes('BUY') || evalRes.signal.includes('SELL')) {
        isHit = true;
        const swarmRes = await runMultiAgentSwarmOrchestrator(sym, evalRes, tideTf, waveTf);
        hits.push({
          ...evalRes,
          signal: swarmRes.finalSignal,
          confidencePct: swarmRes.finalConfidence,
          tideTimeframe: tideTf,
          waveTimeframe: waveTf,
          claudeVerdict: swarmRes.claudeVerdict,
          agentTrace: swarmRes.agentTrace
        });
      } else if (maxScore >= 4) {
        isNearHit = true;
        nearHits.push({
          ...evalRes,
          tideTimeframe: tideTf,
          waveTimeframe: waveTf
        });
      }

      updateSymbolProgress(sym, evalRes, isHit, isNearHit);

      scanned.push({
        symbol: sym,
        signal: evalRes.signal,
        latestPrice: evalRes.latestPrice,
        bullishScore: evalRes.bullishScore,
        bearishScore: evalRes.bearishScore,
        confidencePct: evalRes.confidencePct
      });
    } catch (err) {
      logger.error(`Error scanning symbol ${sym}: ${err.message}`);
    }
  }

  finishScanProgress(hits.length, nearHits.length);

  return {
    universeId,
    presetId,
    tideTimeframe: tideTf,
    waveTimeframe: waveTf,
    totalScanned: scanned.length,
    hitsCount: hits.length,
    nearHitsCount: nearHits.length,
    hits,
    nearHits,
    scanned
  };
};

// Single Symbol Evaluation
const runSingleSymbolEvaluation = async ({ symbol = 'RELIANCE', tideTf = '1Y', waveTf = '1M' }) => {
  const cleanSymbol = symbol.trim().toUpperCase();
  const { tideCandles, waveCandles } = await fetchSymbolCandles(cleanSymbol, tideTf, waveTf);

  const evalRes = evaluate3rdWaveSetup(cleanSymbol, tideCandles, waveCandles);
  const swarmRes = await runMultiAgentSwarmOrchestrator(cleanSymbol, evalRes, tideTf, waveTf);

  return {
    ...evalRes,
    signal: swarmRes.finalSignal,
    confidencePct: swarmRes.finalConfidence,
    tideTimeframe: tideTf,
    waveTimeframe: waveTf,
    claudeVerdict: swarmRes.claudeVerdict,
    agentTrace: swarmRes.agentTrace,
    tideSummary: swarmRes.tideSummary,
    waveSummary: swarmRes.waveSummary,
    riskSummary: swarmRes.riskSummary,
    tideCandleCount: tideCandles.length,
    waveCandleCount: waveCandles.length
  };
};

module.exports = {
  evaluate3rdWaveSetup,
  runUniverseScan,
  runSingleSymbolEvaluation,
  TIMEFRAME_PRESETS,
  SCANNER_UNIVERSES
};
