/**
 * Fibonacci Target & Stop Loss Calculation (1.618 Extension Target Math)
 */

const calculate3rdWaveTargets = (entryPrice, wave1Low, wave1High, wave2LowOrHigh, isBullish = true, fibRatio = 1.618) => {
  const wave1Height = Math.abs(wave1High - wave1Low);
  let targetPrice = 0;
  let stopLoss = 0;
  let risk = 0;
  let reward = 0;

  if (isBullish) {
    targetPrice = wave2LowOrHigh + (wave1Height * fibRatio);
    stopLoss = wave2LowOrHigh * 0.995;
    risk = entryPrice - stopLoss;
    reward = targetPrice - entryPrice;
  } else {
    targetPrice = wave2LowOrHigh - (wave1Height * fibRatio);
    stopLoss = wave2LowOrHigh * 1.005;
    risk = stopLoss - entryPrice;
    reward = entryPrice - targetPrice;
  }

  const rrRatio = risk > 0 ? reward / risk : 0.0;

  return {
    entryPrice: Number(entryPrice.toFixed(2)),
    stopLoss: Number(stopLoss.toFixed(2)),
    targetPrice: Number(targetPrice.toFixed(2)),
    riskAmount: Number(Math.max(0, risk).toFixed(2)),
    rewardAmount: Number(Math.max(0, reward).toFixed(2)),
    riskRewardRatio: Number(rrRatio.toFixed(2))
  };
};

module.exports = {
  calculate3rdWaveTargets
};
