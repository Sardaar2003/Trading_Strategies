/**
 * Wave Structure Analysis (Fractal Swings, HL/LH, Trendline Breakouts)
 */

// Fractal Swing Highs and Swing Lows
const findFractalSwings = (candles, windowSize = 3) => {
  const n = candles.length;
  const swingHighs = [];
  const swingLows = [];

  const highs = candles.map(c => Number(c.high));
  const lows = candles.map(c => Number(c.low));

  for (let i = windowSize; i < n - windowSize; i++) {
    const leftH = highs.slice(i - windowSize, i);
    const rightH = highs.slice(i + 1, i + windowSize + 1);
    if (highs[i] > Math.max(...leftH) && highs[i] >= Math.max(...rightH)) {
      swingHighs.push({ index: i, high: highs[i], date: candles[i].date });
    }

    const leftL = lows.slice(i - windowSize, i);
    const rightL = lows.slice(i + 1, i + windowSize + 1);
    if (lows[i] < Math.min(...leftL) && lows[i] <= Math.min(...rightL)) {
      swingLows.push({ index: i, low: lows[i], date: candles[i].date });
    }
  }

  return { swingHighs, swingLows };
};

// Wave Structure Analysis (Two HLs/LHs and TLBO/TLBD)
const analyzeWaveStructure = (candles, windowSize = 3) => {
  if (!candles || candles.length < 20) {
    return { hasTwoHls: false, hasTwoLhs: false, tlboDetected: false, tlbdDetected: false };
  }

  const { swingHighs, swingLows } = findFractalSwings(candles, windowSize);
  const closes = candles.map(c => Number(c.close));
  const currClose = closes[closes.length - 1];

  let hasTwoHls = false;
  let hasTwoLhs = false;

  if (swingLows.length >= 2) {
    const sl1 = swingLows[swingLows.length - 2].low;
    const sl2 = swingLows[swingLows.length - 1].low;
    hasTwoHls = sl2 > sl1;
  }

  if (swingHighs.length >= 2) {
    const sh1 = swingHighs[swingHighs.length - 2].high;
    const sh2 = swingHighs[swingHighs.length - 1].high;
    hasTwoLhs = sh2 < sh1;
  }

  let tlboDetected = false;
  let tlbdDetected = false;

  if (swingHighs.length >= 2) {
    const sh1 = swingHighs[swingHighs.length - 2];
    const sh2 = swingHighs[swingHighs.length - 1];
    const pos1 = sh1.index;
    const pos2 = sh2.index;
    if (pos2 > pos1) {
      const slope = (sh2.high - sh1.high) / (pos2 - pos1);
      const currPos = candles.length - 1;
      const projectedTl = sh2.high + slope * (currPos - pos2);
      if (slope < 0 && currClose > projectedTl) {
        tlboDetected = true;
      }
    }
  }

  if (swingLows.length >= 2) {
    const sl1 = swingLows[swingLows.length - 2];
    const sl2 = swingLows[swingLows.length - 1];
    const pos1 = sl1.index;
    const pos2 = sl2.index;
    if (pos2 > pos1) {
      const slope = (sl2.low - sl1.low) / (pos2 - pos1);
      const currPos = candles.length - 1;
      const projectedTl = sl2.low + slope * (currPos - pos2);
      if (slope > 0 && currClose < projectedTl) {
        tlbdDetected = true;
      }
    }
  }

  return {
    hasTwoHls,
    hasTwoLhs,
    tlboDetected,
    tlbdDetected,
    swingLowCount: swingLows.length,
    swingHighCount: swingHighs.length
  };
};

module.exports = {
  findFractalSwings,
  analyzeWaveStructure
};
