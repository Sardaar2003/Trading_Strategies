/**
 * Risk-to-Reward Ratio & Target Verification Agent (Risk Agent)
 */

const riskAgentNode = (symbol, evalResult) => {
  const targets = evalResult.targets || {};
  if (!targets || !targets.entryPrice) {
    return { riskSummary: `Risk & Target Assessment for ${symbol}: No active setup targets computed. Minimum R:R check pending signal breakout.`, isRejected: false };
  }

  const rrRatio = targets.riskRewardRatio || 0.0;
  const entry = targets.entryPrice;
  const sl = targets.stopLoss;
  const target = targets.targetPrice;
  const rrPass = rrRatio >= 2.0;

  const summary = `Risk & Target Assessment for ${symbol}: Entry: ₹${entry} | Stop Loss: ₹${sl} | Target (1.618 Fib): ₹${target}. Risk-to-Reward Ratio: ${rrRatio}:1 (${rrPass ? 'ACCEPTED >= 2.0' : 'REJECTED < 2.0'}).`;
  return { riskSummary: summary, isRejected: !rrPass };
};

module.exports = {
  riskAgentNode
};
