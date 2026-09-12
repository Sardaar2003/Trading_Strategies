/**
 * Scanner Agent State Schema Helper (LangGraph Architecture Alignment)
 */

const createAgentState = (symbol, algoResult) => {
  return {
    symbol,
    algoResult,
    tideSummary: '',
    waveSummary: '',
    riskSummary: '',
    claudeVerdict: '',
    finalSignal: algoResult.signal || 'NEUTRAL',
    finalConfidence: algoResult.confidencePct || 0,
    agentTrace: []
  };
};

module.exports = {
  createAgentState
};
