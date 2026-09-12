/**
 * Fibonacci Target & Stop Loss Calculation (1.618 Extension Target Math)
 */

const calculate3rdWaveTargets = (
  entryPrice,
  wave1Low,
  wave1High,
  wave2LowOrHigh,
  isBullish = true,
  fibRatio = 1.618,
  boCandle = null,
  bbcCandle = null
) => {
  const wave1Height = Math.abs(wave1High - wave1Low);
  let targetPrice = 0;
  let targetEqual = 0;
  let stopLoss = 0;
  let stopLossReference = '';
  let risk = 0;
  let reward = 0;

  if (isBullish) {
    // ASTA Step 4 Target: 1.62 Times OR Equal to Wave 1 / Wave A (Fib. Extension)
    targetPrice = wave2LowOrHigh + (wave1Height * fibRatio);
    targetEqual = wave2LowOrHigh + wave1Height;

    // ASTA Step 3 Stop Loss: Below BO Candle / Below BBC Candle
    if (boCandle || bbcCandle) {
      const boLow = Number(boCandle?.low ?? wave2LowOrHigh);
      const bbcLow = Number(bbcCandle?.low ?? boLow);
      const refLow = Math.min(boLow, bbcLow);
      // Place SL just below the candle low with micro tick/buffer
      stopLoss = refLow - Math.max(0.05, refLow * 0.001);
      stopLossReference = bbcCandle
        ? `Below BO/BBC Candle Low (₹${refLow.toFixed(2)})`
        : `Below BO Candle Low (₹${refLow.toFixed(2)})`;
    } else {
      stopLoss = wave2LowOrHigh * 0.995;
      stopLossReference = `Below Wave 2 Low (₹${wave2LowOrHigh.toFixed(2)})`;
    }

    risk = entryPrice - stopLoss;
    reward = targetPrice - entryPrice;
  } else {
    // ASTA Step 4 Target: 1.62 Times OR Equal to Wave 1 / Wave A (Fib. Extension)
    targetPrice = wave2LowOrHigh - (wave1Height * fibRatio);
    targetEqual = wave2LowOrHigh - wave1Height;

    // ASTA Step 3 Stop Loss: Above BD Candle / Above BBC Candle
    if (boCandle || bbcCandle) {
      const bdHigh = Number(boCandle?.high ?? wave2LowOrHigh);
      const bbcHigh = Number(bbcCandle?.high ?? bdHigh);
      const refHigh = Math.max(bdHigh, bbcHigh);
      // Place SL just above the candle high with micro tick/buffer
      stopLoss = refHigh + Math.max(0.05, refHigh * 0.001);
      stopLossReference = bbcCandle
        ? `Above BD/BBC Candle High (₹${refHigh.toFixed(2)})`
        : `Above BD Candle High (₹${refHigh.toFixed(2)})`;
    } else {
      stopLoss = wave2LowOrHigh * 1.005;
      stopLossReference = `Above Wave 2 High (₹${wave2LowOrHigh.toFixed(2)})`;
    }

    risk = stopLoss - entryPrice;
    reward = entryPrice - targetPrice;
  }

  const rrRatio = risk > 0 ? reward / risk : 0.0;

  return {
    entryPrice: Number(entryPrice.toFixed(2)),
    stopLoss: Number(stopLoss.toFixed(2)),
    stopLossReference,
    targetPrice: Number(targetPrice.toFixed(2)),
    targetEqual: Number(targetEqual.toFixed(2)),
    targetRatio: fibRatio,
    targetDescription: `1.62x Wave 1 Extension (Fib. Extension tool)`,
    riskAmount: Number(Math.max(0, risk).toFixed(2)),
    rewardAmount: Number(Math.max(0, reward).toFixed(2)),
    riskRewardRatio: Number(rrRatio.toFixed(2))
  };
};

module.exports = {
  calculate3rdWaveTargets
};
