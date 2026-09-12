const aiTradingService = require('../services/aiTradingService');
const tradingSkillsManager = require('../services/skills/tradingSkillsManager');

// @desc    Run AI Trading Intelligence Analysis (Claude 3.7 Sonnet)
// @route   POST /api/ai/analyze
// @access  Public
const analyzeTradingPrompt = async (req, res, next) => {
  try {
    const { symbol = 'RELIANCE', skillId = 'trading_ideas', userPrompt = '', timeframe = '1D', conversationHistory = [] } = req.body;

    const result = await aiTradingService.runAITradingAnalysis({
      symbol,
      skillId,
      userPrompt,
      timeframe,
      conversationHistory
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Available Trading Skills Registry
// @route   GET /api/ai/skills
// @access  Public
const getTradingSkills = (req, res) => {
  const skills = Object.values(tradingSkillsManager.SKILLS_REGISTRY).map(s => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    description: s.description
  }));

  return res.status(200).json({
    success: true,
    count: skills.length,
    skills
  });
};

// @desc    Get AI Models Configuration & Status
// @route   GET /api/ai/models
// @access  Public
const getAIModelsInfo = (req, res) => {
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);
  return res.status(200).json({
    success: true,
    activeModel: {
      id: 'claude-3-7-sonnet-20250219',
      name: 'Claude 3.7 Sonnet',
      provider: 'Anthropic',
      status: hasKey ? 'ACTIVE_NATIVE' : 'ACTIVE_SIMULATED',
      inputPricePer1M: '$3.00',
      outputPricePer1M: '$15.00',
      features: ['Extended Reasoning', 'Zerodha Market Grounding', 'Risk Guardrails', 'Chain-of-Thought Debugging']
    }
  });
};

// @desc    Get Aggregated AI Usage & Telemetry Stats
// @route   GET /api/ai/telemetry
// @access  Public
const getAITelemetry = (req, res) => {
  const telemetry = aiTradingService.getTelemetry();
  return res.status(200).json({
    success: true,
    telemetry
  });
};

module.exports = {
  analyzeTradingPrompt,
  getTradingSkills,
  getAIModelsInfo,
  getAITelemetry
};
