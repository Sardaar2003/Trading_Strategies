/**
 * LTF Wave Structure, Trendline Breakout & Ungli Pinbar Analyst Agent (Wave Agent)
 */

const waveAgentNode = (symbol, evalResult) => {
  const crit = evalResult.signal?.includes('BUY') ? evalResult.bullishCriteria : evalResult.bearishCriteria;
  const twoHls = crit?.['Wave - Two HLs'] ?? crit?.Wave_Two_HLs ?? false;
  const twoLhs = crit?.['Wave - Two LHs'] ?? crit?.Wave_Two_LHs ?? false;
  const tlboBbc = crit?.['Wave - TLBO + BBC'] ?? crit?.['Wave - TLBD + BBC'] ?? crit?.Wave_TLBO ?? crit?.Wave_TLBD ?? false;
  const ungli = crit?.['Wave - Ungli setup'] ?? crit?.Wave_Ungli ?? false;
  const doubleScreen = crit?.['Wave - Double Screen Confirmation'] ?? false;
  const vol = evalResult.supportingIndicators?.volumeBreakout ?? crit?.Volume_BO ?? crit?.Volume_BD ?? false;

  const summary = `Wave LTF Analysis for ${symbol}: Wave Structure: ${twoHls ? 'Two HLs Confirmed' : (twoLhs ? 'Two LHs Confirmed' : 'Incomplete Swings')}. Trendline + Base: ${tlboBbc ? 'TLBO+BBC Triggered' : 'None'}. Ungli Setup Bar: ${ungli ? 'YES' : 'NO'}. Double Screen: ${doubleScreen ? 'CONFIRMED' : 'NO'}. Breakout Volume (MUST): ${vol ? 'HIGH (PASSED)' : 'LOW (FAILED)'}.`;
  return { waveSummary: summary };
};

module.exports = {
  waveAgentNode
};
