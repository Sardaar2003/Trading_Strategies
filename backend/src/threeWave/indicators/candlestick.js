/**
 * Candlestick Pattern Indicators (Ungli Pinbar, BBC, Volume Breakout)
 */

// Ungli Pattern (Reversal Wick >= 50%)
const isUngliSetup = (candle, wickRatio = 0.50, bodyPos = 0.35) => {
  if (!candle) return { bullishUngli: false, bearishUngli: false };
  const openP = Number(candle.open);
  const highP = Number(candle.high);
  const lowP = Number(candle.low);
  const closeP = Number(candle.close);

  const totalRange = highP - lowP;
  if (totalRange <= 0) return { bullishUngli: false, bearishUngli: false };

  const bodyHigh = Math.max(openP, closeP);
  const bodyLow = Math.min(openP, closeP);
  const bodySize = bodyHigh - bodyLow;

  const upperWick = highP - bodyHigh;
  const lowerWick = bodyLow - lowP;

  const lowerWickPct = lowerWick / totalRange;
  const bodyUpperPosition = (bodyLow - lowP) / totalRange;
  const bullishUngli = (lowerWickPct >= wickRatio) && (bodyUpperPosition >= (1.0 - bodyPos - (bodySize / totalRange)));

  const upperWickPct = upperWick / totalRange;
  const bodyLowerPosition = (highP - bodyHigh) / totalRange;
  const bearishUngli = (upperWickPct >= wickRatio) && (bodyLowerPosition >= (1.0 - bodyPos - (bodySize / totalRange)));

  return { bullishUngli, bearishUngli };
};

// Base Building Candle (BBC) Check
const isBbcCandle = (candles, index = null) => {
  if (!candles || candles.length < 20) return false;
  const targetIdx = index !== null ? index : candles.length - 1;
  if (targetIdx < 19 || targetIdx >= candles.length) return false;

  let trSum = 0;
  for (let i = targetIdx - 19; i <= targetIdx; i++) {
    const h = Number(candles[i].high);
    const l = Number(candles[i].low);
    const prevC = Number(candles[i - 1]?.close || candles[i].open);
    const tr = Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC));
    trSum += tr;
  }
  const atr20 = trSum / 20;
  const targetBar = candles[targetIdx];
  const barRange = Number(targetBar.high) - Number(targetBar.low);

  return barRange < (0.85 * atr20);
};

// Search for the most recent Base Building Candle (BBC) within lookback bars
const findRecentBbcCandle = (candles, lookback = 4) => {
  if (!candles || candles.length < 20) return null;
  const start = Math.max(19, candles.length - lookback);
  for (let i = candles.length - 1; i >= start; i--) {
    if (isBbcCandle(candles, i)) {
      return {
        candle: candles[i],
        index: i,
        barsAgo: (candles.length - 1) - i,
        high: Number(candles[i].high),
        low: Number(candles[i].low),
        close: Number(candles[i].close),
        open: Number(candles[i].open),
        date: candles[i].date
      };
    }
  }
  return null;
};

// Volume Breakout Check (>= 1.3x Avg Volume)
const isVolumeBreakout = (candles, avgPeriod = 20, multiplier = 1.3) => {
  if (!candles || candles.length < avgPeriod + 1) return false;
  const slice = candles.slice(- (avgPeriod + 1), -1);
  const avgVol = slice.reduce((acc, c) => acc + Number(c.volume || 0), 0) / avgPeriod;
  const currVol = Number(candles[candles.length - 1].volume || 0);

  if (avgVol <= 0) return true;
  return currVol >= (multiplier * avgVol);
};

module.exports = {
  isUngliSetup,
  isBbcCandle,
  findRecentBbcCandle,
  isVolumeBreakout
};
