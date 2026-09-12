/**
 * HTF Trend & Volatility Squeeze Analyst Agent (Tide Agent)
 */

const tideAgentNode = (symbol, evalResult) => {
  const crit = evalResult.signal?.includes('BUY') ? evalResult.bullishCriteria : evalResult.bearishCriteria;
  const tideUptick = crit?.['Tide - Uptick'] ?? crit?.Tide_Uptick ?? false;
  const tideDowntick = crit?.['Tide - Downtick'] ?? crit?.Tide_Downtick ?? false;
  const tideBbnc = crit?.['Tide - BBNC - DN'] ?? crit?.['Tide - BBNC - UP'] ?? crit?.Tide_BBNC_DN ?? crit?.Tide_BBNC_UP ?? false;
  const tideP = crit?.['Tide - P > 50 (Nice to have)'] ?? crit?.['Tide - P < 50 (Nice to have)'] ?? crit?.['Tide - P > 50'] ?? crit?.['Tide - P < 50'] ?? crit?.Tide_P_gt_50 ?? crit?.Tide_P_lt_50 ?? false;

  const summary = `Tide HTF Analysis for ${symbol}: Trend Direction: ${tideUptick ? 'Uptick' : (tideDowntick ? 'Downtick' : 'Neutral')}. BBNC Squeeze/Touch: ${tideBbnc ? 'YES' : 'NO'}. Tide Momentum P > 50: ${tideP ? 'PASS' : 'FAIL'}.`;
  return { tideSummary: summary };
};

module.exports = {
  tideAgentNode
};
