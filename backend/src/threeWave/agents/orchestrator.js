/**
 * LangGraph Multi-Agent StateGraph Workflow Orchestrator
 */
const { tideAgentNode } = require('./tideAgent');
const { waveAgentNode } = require('./waveAgent');
const { riskAgentNode } = require('./riskAgent');
const { claudeVerifierNode } = require('./claudeLlm');

const runMultiAgentSwarmOrchestrator = async (symbol, evalResult, tideTf, waveTf) => {
  // Step A: Tide Agent Node
  const tideState = tideAgentNode(symbol, evalResult);

  // Step B: Wave Agent Node
  const waveState = waveAgentNode(symbol, evalResult);

  // Step C: Risk Agent Node
  const riskState = riskAgentNode(symbol, evalResult);

  // Combine Subagent States
  const subagentState = {
    tideSummary: tideState.tideSummary,
    waveSummary: waveState.waveSummary,
    riskSummary: riskState.riskSummary
  };

  // Step D: Claude LLM Verifier Node
  const claudeVerdict = await claudeVerifierNode(symbol, evalResult, subagentState, tideTf, waveTf);

  // Step E: Consensus Evaluator Node
  let finalSignal = evalResult.signal;
  let finalConfidence = evalResult.confidencePct;

  if (riskState.isRejected) {
    finalSignal = 'REJECTED (Low R:R Ratio < 2.0)';
    finalConfidence = 0.0;
  }

  const agentTrace = [
    `1. ${tideState.tideSummary}`,
    `2. ${waveState.waveSummary}`,
    `3. ${riskState.riskSummary}`
  ];

  return {
    finalSignal,
    finalConfidence,
    claudeVerdict,
    agentTrace,
    tideSummary: tideState.tideSummary,
    waveSummary: waveState.waveSummary,
    riskSummary: riskState.riskSummary
  };
};

module.exports = {
  runMultiAgentSwarmOrchestrator
};
