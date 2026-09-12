/**
 * LTF Wave Structure, Trendline Breakout & Ungli Pinbar Analyst Agent (Wave Agent)
 */

const waveAgentNode = (symbol, evalResult) => {
  const crit = evalResult.signal?.includes('BUY') ? evalResult.bullishCriteria : evalResult.bearishCriteria;
  const twoHls = crit?.Wave_Two_HLs || false;
  const twoLhs = crit?.Wave_Two_LHs || false;
  const tlbo = crit?.Wave_TLBO || crit?.Wave_TLBD || false;
  const ungli = crit?.Wave_Ungli || false;
  const bbc = crit?.Wave_BBC || false;
  const vol = crit?.Volume_BO || crit?.Volume_BD || false;

  const summary = `Wave LTF Analysis for ${symbol}: Wave Structure: ${twoHls ? 'Two HLs Confirmed' : (twoLhs ? 'Two LHs Confirmed' : 'Incomplete Swings')}. Trendline Break: ${tlbo ? 'TLBO/TLBD Triggered' : 'None'}. Ungli Setup Bar: ${ungli ? 'YES' : 'NO'}. BBC Candle: ${bbc ? 'YES' : 'NO'}. Breakout Volume: ${vol ? 'HIGH (PASSED)' : 'LOW (FAILED)'}.`;
  return { waveSummary: summary };
};

module.exports = {
  waveAgentNode
};
