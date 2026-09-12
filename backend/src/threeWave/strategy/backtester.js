/**
 * Historical Rolling Window Backtester Engine
 */

const runHistoricalBacktest = async (symbol, tideCandles, waveCandles) => {
  if (!tideCandles || tideCandles.length < 30 || !waveCandles || waveCandles.length < 30) {
    return {
      symbol,
      totalTrades: 0,
      wins: 0,
      losses: 0,
      winRatePct: 0,
      netProfitPct: 0,
      tradeLog: []
    };
  }

  // Rolling backtest window simulation
  const tradeLog = [];
  let wins = 0;
  let losses = 0;
  let totalProfit = 0;

  for (let i = 25; i < waveCandles.length - 5; i += 5) {
    const entryPrice = Number(waveCandles[i].close);
    const exitPrice = Number(waveCandles[Math.min(i + 5, waveCandles.length - 1)].close);
    const profitPct = Number((((exitPrice - entryPrice) / entryPrice) * 100).toFixed(2));

    const isWin = profitPct > 0;
    if (isWin) wins++;
    else losses++;

    totalProfit += profitPct;

    tradeLog.push({
      tradeIndex: tradeLog.length + 1,
      entryDate: waveCandles[i].date || `Bar-${i}`,
      entryPrice,
      exitPrice,
      profitPct,
      result: isWin ? 'WIN' : 'LOSS'
    });
  }

  const totalTrades = wins + losses;
  const winRatePct = totalTrades > 0 ? Number(((wins / totalTrades) * 100).toFixed(1)) : 0;
  const netProfitPct = Number(totalProfit.toFixed(2));

  return {
    symbol,
    totalTrades,
    wins,
    losses,
    winRatePct,
    netProfitPct,
    tradeLog
  };
};

module.exports = {
  runHistoricalBacktest
};
