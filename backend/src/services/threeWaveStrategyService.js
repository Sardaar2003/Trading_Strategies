/**
 * -------------------------------------------------------------------
 * ASTA 3rd Wave AI Strategy Service (Modular Facade)
 * Delegating to modular engine structure in src/threeWave/
 * -------------------------------------------------------------------
 */

const {
  evaluate3rdWaveSetup,
  runUniverseScan,
  runSingleSymbolEvaluation,
  TIMEFRAME_PRESETS,
  SCANNER_UNIVERSES
} = require('../threeWave/strategy/thirdWaveScanner');

const { runHistoricalBacktest } = require('../threeWave/strategy/backtester');

module.exports = {
  evaluate3rdWaveSetup,
  runUniverseScan,
  runSingleSymbolEvaluation,
  runHistoricalBacktest,
  TIMEFRAME_PRESETS,
  SCANNER_UNIVERSES
};
