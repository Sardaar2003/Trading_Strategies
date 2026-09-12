/**
 * Bollinger Bands & Bandwidth Narrow Channel (BBNC Squeeze) Indicator
 */

const analyzeBBNC = (candles, period = 20, stdMult = 2.0) => {
  if (!candles || candles.length < 30) {
    return { isSqueeze: false, bbncDn: false, bbncUp: false, bandwidth: 0, pctB: 0.5 };
  }

  const closes = candles.map(c => Number(c.close));
  const lows = candles.map(c => Number(c.low));
  const highs = candles.map(c => Number(c.high));

  const bandwidths = [];
  const upperBands = [];
  const lowerBands = [];
  const pctBs = [];

  for (let i = period - 1; i < candles.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
    const std = Math.sqrt(variance);

    const upper = mean + stdMult * std;
    const lower = mean - stdMult * std;
    const bw = mean > 0 ? (upper - lower) / mean : 0;
    const pctB = (upper - lower) > 0 ? (closes[i] - lower) / (upper - lower) : 0.5;

    upperBands.push(upper);
    lowerBands.push(lower);
    bandwidths.push(bw);
    pctBs.push(pctB);
  }

  const currBw = bandwidths[bandwidths.length - 1] || 0;
  const recentBws = bandwidths.slice(-100);
  const sortedBws = [...recentBws].sort((a, b) => a - b);
  const quantileIdx = Math.floor(sortedBws.length * 0.15);
  const threshold = sortedBws[quantileIdx] || 0;

  const isSqueeze = currBw <= threshold;

  // Check last 3 candles for lower/upper band touch
  const recentLows = lows.slice(-3);
  const recentHighs = highs.slice(-3);
  const recentLower = lowerBands.slice(-3);
  const recentUpper = upperBands.slice(-3);

  const bbncDn = recentLows.some((l, idx) => l <= (recentLower[idx] * 1.005));
  const bbncUp = recentHighs.some((h, idx) => h >= (recentUpper[idx] * 0.995));

  return {
    isSqueeze,
    bbncDn,
    bbncUp,
    bandwidth: Number(currBw.toFixed(4)),
    pctB: Number((pctBs[pctBs.length - 1] || 0.5).toFixed(4))
  };
};

module.exports = {
  analyzeBBNC
};
