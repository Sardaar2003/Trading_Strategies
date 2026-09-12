/**
 * Real-Time Scan Progress & Terminal Execution Log Stream Tracker
 */

let scanState = {
  isScanning: false,
  universeId: '',
  presetId: '',
  currentSymbol: '',
  scannedCount: 0,
  totalSymbols: 0,
  progressPct: 0,
  hitsCount: 0,
  nearHitsCount: 0,
  logs: []
};

const startScanProgress = (universeId, presetId, totalSymbols) => {
  scanState = {
    isScanning: true,
    universeId,
    presetId,
    currentSymbol: '',
    scannedCount: 0,
    totalSymbols,
    progressPct: 0,
    hitsCount: 0,
    nearHitsCount: 0,
    logs: [
      {
        id: 1,
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        text: `🚀 Initialized Zerodha Market Scan for Universe: ${universeId} (${totalSymbols} Equities)...`
      }
    ]
  };
};

const updateSymbolProgress = (symbol, evalRes, isHit, isNearHit) => {
  scanState.scannedCount += 1;
  scanState.currentSymbol = symbol;
  scanState.progressPct = Math.min(100, Math.round((scanState.scannedCount / scanState.totalSymbols) * 100));

  if (isHit) scanState.hitsCount += 1;
  if (isNearHit) scanState.nearHitsCount += 1;

  const timeStr = new Date().toLocaleTimeString();
  let logType = 'normal';
  let logText = `[${scanState.scannedCount}/${scanState.totalSymbols}] ${symbol} evaluated. Price: ₹${evalRes.latestPrice} | Bull: ${evalRes.bullishScore} | Bear: ${evalRes.bearishScore}`;

  if (isHit) {
    logType = 'hit';
    logText = `🔥 [${scanState.scannedCount}/${scanState.totalSymbols}] ⭐ 3RD WAVE TRIGGERED for ${symbol}! Signal: ${evalRes.signal} | Confidence: ${evalRes.confidencePct}% | Target: ₹${evalRes.targets?.targetPrice || '-'}`;
  } else if (isNearHit) {
    logType = 'near_hit';
    logText = `⚡ [${scanState.scannedCount}/${scanState.totalSymbols}] Near-Hit Candidate ${symbol}: Building Base (Score: Bull ${evalRes.bullishScore}, Bear ${evalRes.bearishScore})`;
  }

  scanState.logs.push({
    id: scanState.logs.length + 1,
    timestamp: timeStr,
    type: logType,
    text: logText
  });

  if (scanState.logs.length > 150) {
    scanState.logs.shift();
  }
};

const finishScanProgress = (hitsCount, nearHitsCount) => {
  scanState.isScanning = false;
  scanState.progressPct = 100;
  scanState.logs.push({
    id: scanState.logs.length + 1,
    timestamp: new Date().toLocaleTimeString(),
    type: 'success',
    text: `🎉 Zerodha Market Scan Completed! Total Scanned: ${scanState.scannedCount} | HITs: ${hitsCount} | Near-Hits: ${nearHitsCount}`
  });
};

const getScanProgress = () => scanState;

module.exports = {
  startScanProgress,
  updateSymbolProgress,
  finishScanProgress,
  getScanProgress
};
