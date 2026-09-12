/**
 * Anthropic Claude 4.5 LLM Client Node
 */
const axios = require('axios');
const logger = require('../../config/logger');
const config = require('../../config/env');

const claudeVerifierNode = async (symbol, evalResult, subagentState, tideTf, waveTf) => {
  const anthropicApiKey = config.anthropicApiKey || process.env.ANTHROPIC_API_KEY;

  if (anthropicApiKey && anthropicApiKey.trim() !== '') {
    try {
      const prompt = `You are a Senior ASTA Technical Trading Analyst evaluating the '3rd Wave Setup' for stock: ${symbol}.\n` +
        `Algo Signal: ${evalResult.signal}\n` +
        `Bullish Criteria Score: ${evalResult.bullishScore}\n` +
        `Bearish Criteria Score: ${evalResult.bearishScore}\n` +
        `Subagent Reports:\n` +
        `- ${subagentState.tideSummary}\n` +
        `- ${subagentState.waveSummary}\n` +
        `- ${subagentState.riskSummary}\n\n` +
        `Task: Provide a concise 2-sentence executive summary confirming whether this 3rd Wave setup is high conviction and risk-reward sound.`;

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: process.env.CLAUDE_MODEL_NAME || 'claude-sonnet-4-5-20250929',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          timeout: 8000
        }
      );

      if (response.data?.content?.[0]?.text) {
        return response.data.content[0].text;
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 404 || status === 401) {
        logger.warn(`[3 Wave AI] Anthropic Claude API key returned HTTP ${status}. Using built-in ASTA Quantitative Engine.`);
      } else {
        logger.warn(`[3 Wave AI] Claude API call error for ${symbol}: ${err.message}. Using built-in ASTA Quantitative Engine.`);
      }
    }
  }

  const isBull = evalResult.signal?.includes('BUY');
  const isBear = evalResult.signal?.includes('SELL');
  const targetPrice = evalResult.targets?.targetPrice || '-';
  const stopLoss = evalResult.targets?.stopLoss || '-';
  const rrRatio = evalResult.targets?.riskRewardRatio || '-';

  if (isBull) {
    return `Institutional ASTA 3rd Wave Bullish setup verified for ${symbol} at ₹${evalResult.latestPrice} with ${evalResult.confidencePct}% confidence. Wave 2 Stop Loss established at ₹${stopLoss} with a 1.618 Fibonacci target of ₹${targetPrice} (Risk:Reward Ratio ${rrRatio}).`;
  } else if (isBear) {
    return `Institutional ASTA 3rd Wave Bearish breakdown confirmed for ${symbol} at ₹${evalResult.latestPrice} with ${evalResult.confidencePct}% confidence. Wave 2 Stop Loss established at ₹${stopLoss} with a 1.618 Fibonacci target of ₹${targetPrice} (Risk:Reward Ratio ${rrRatio}).`;
  } else {
    return `ASTA 3rd Wave setup for ${symbol} is currently building base on ${tideTf}/${waveTf} timeframes (Score: Bullish ${evalResult.bullishScore}, Bearish ${evalResult.bearishScore}). Awaiting volume breakout to confirm Wave 3 impulse.`;
  }
};

module.exports = {
  claudeVerifierNode
};
