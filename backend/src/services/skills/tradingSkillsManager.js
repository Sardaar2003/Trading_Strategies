/**
 * Trading Agent Skills Engine
 * Enforces structured trading skill templates, technical indicator calculations,
 * and Zerodha market data grounding for AI prompts.
 */

const calculateSMA = (prices, period) => {
  if (!prices || prices.length < period) return null;
  const slice = prices.slice(0, period);
  const sum = slice.reduce((acc, p) => acc + p, 0);
  return parseFloat((sum / period).toFixed(2));
};

const calculateRSI = (prices, period = 14) => {
  if (!prices || prices.length < period + 1) return 50.0;
  let gains = 0;
  let losses = 0;
  for (let i = 0; i < period; i++) {
    const diff = prices[i] - prices[i + 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100.0;
  const rs = avgGain / avgLoss;
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
};

const calculateSupportResistance = (candles) => {
  if (!candles || candles.length === 0) {
    return { support1: 0, support2: 0, resistance1: 0, resistance2: 0 };
  }
  const highs = candles.map(c => parseFloat(c.high || c.close));
  const lows = candles.map(c => parseFloat(c.low || c.close));
  const maxH = Math.max(...highs);
  const minL = Math.min(...lows);
  const currentP = parseFloat(candles[0]?.close || maxH);

  const pivot = (maxH + minL + currentP) / 3;
  const r1 = 2 * pivot - minL;
  const s1 = 2 * pivot - maxH;
  const r2 = pivot + (maxH - minL);
  const s2 = pivot - (maxH - minL);

  return {
    pivot: parseFloat(pivot.toFixed(2)),
    resistance1: parseFloat(r1.toFixed(2)),
    resistance2: parseFloat(r2.toFixed(2)),
    support1: parseFloat(s1.toFixed(2)),
    support2: parseFloat(s2.toFixed(2))
  };
};

const SKILLS_REGISTRY = {
  'conversational': {
    id: 'conversational',
    name: 'Conversational Assistant',
    icon: '💬',
    description: 'Natural conversational AI assistant for general trading and market queries.',
    buildPrompt: ({ symbol, price, pctChange, indicators, userPrompt }) => `
You are an expert institutional AI Trading Assistant powered by Claude 3.7 Sonnet for Indian Stock Markets (NSE/BSE).
Answer the user's question directly, helpfully, and concisely.

Market Context (Grounded Data):
- Instrument: ${symbol || 'General Market'}
- Spot Price: ₹${price} (${pctChange}%)
- Technical Metrics: RSI(14)=${indicators.rsi}, SMA(20)=₹${indicators.sma20}, Pivot=₹${indicators.levels.pivot}

User Query: "${userPrompt || 'Hello'}"

Instructions:
- If the user says a greeting (e.g. "Hi", "Hello", "Hey"), reply with a warm, professional greeting as an AI Trading Co-Pilot and ask how you can assist their trading today.
- If the user asks a specific question about stocks, indicators, strategy, or risk, answer their question directly using clean markdown.
- Do NOT output a pre-made 5-setup template unless the user explicitly requested trading setups!
`
  },

  'trading_ideas': {
    id: 'trading_ideas',
    name: 'Trading Ideas Generator',
    icon: '🎯',
    description: 'Scans market and generates 5 high-probability trading setups with entry, targets, stop-loss, and R:R ratio.',
    buildPrompt: ({ symbol, price, open, high, low, pctChange, indicators, userPrompt }) => `
You are an expert quantitative technical strategist acting as a Trading Co-Pilot.
Scan current market data for ${symbol} and generate 5 high-probability trading setups (Day Trading, Swing, Momentum Breakout, Reversal, Scalp).

Current Grounded Market Data for ${symbol}:
- Current Price: ₹${price}
- Day Open: ₹${open} | High: ₹${high} | Low: ₹${low} | Change: ${pctChange}%
- Technical Indicators: SMA(20)=₹${indicators.sma20}, SMA(50)=₹${indicators.sma50}, RSI(14)=${indicators.rsi}
- Key Levels: Pivot=₹${indicators.levels.pivot}, Support 1=₹${indicators.levels.support1}, Resistance 1=₹${indicators.levels.resistance1}

User Specific Request: ${userPrompt || 'Generate 5 actionable setups for today.'}

MANDATORY OUTPUT FORMAT:
For each of the 5 setups, provide:
1. Setup Name & Strategy Type (e.g. Bullish Breakout, Mean Reversion)
2. Entry Price Range
3. Target 1 (TP1) & Target 2 (TP2)
4. Stop Loss (SL)
5. Risk:Reward Ratio (Must be minimum 1:2)
6. Technical Rationale (Grounded in RSI, SMA, and Support/Resistance levels provided above)
`
  },

  'technical_analyst': {
    id: 'technical_analyst',
    name: 'Automated Technical Analyst',
    icon: '📊',
    description: 'Multi-timeframe breakdown of support/resistance, moving averages, trendlines, and momentum signals.',
    buildPrompt: ({ symbol, price, open, high, low, pctChange, indicators, userPrompt }) => `
You are a senior Technical Analyst. Perform a thorough technical analysis for ${symbol}.

Current Grounded Market Context:
- Asset: ${symbol}
- Spot Price: ₹${price} (Change: ${pctChange}%)
- Session OHLC: Open ₹${open}, High ₹${high}, Low ₹${low}
- Indicators: RSI(14) = ${indicators.rsi}, 20 SMA = ₹${indicators.sma20}, 50 SMA = ₹${indicators.sma50}
- Pivot Points: Pivot ₹${indicators.levels.pivot}, Resistance 1 ₹${indicators.levels.resistance1}, Resistance 2 ₹${indicators.levels.resistance2}, Support 1 ₹${indicators.levels.support1}, Support 2 ₹${indicators.levels.support2}

User Request: ${userPrompt || 'Break down daily technical levels and provide a Buy/Hold/Sell signal.'}

Provide a structured report:
1. Executive Summary & Actionable Signal (BUY / SELL / NEUTRAL) with Confidence Rating (1-100%)
2. Key Support & Resistance Map
3. Moving Average & Momentum Oscillator Analysis
4. Trendline & Chart Pattern Identification
5. Step-by-Step Execution Plan with Trigger Price
`
  },

  'news_converter': {
    id: 'news_converter',
    name: 'News to Trading Converter',
    icon: '📰',
    description: 'Translates market news, earnings, and macro catalysts into immediate short- and long-term trading implications.',
    buildPrompt: ({ symbol, price, pctChange, userPrompt }) => `
You are a Financial News & Macro Catalyst Strategist.
Translate recent market developments and sector news for ${symbol} into concrete trading implications.

Market State:
- Stock/Index: ${symbol}
- Current Price: ₹${price} (${pctChange}%)

News Context / Headline: ${userPrompt || 'Analyze impact of recent quarterly earnings, sector demand, and interest rate trends.'}

Deliver:
1. Catalyst Summary (Key takeaway)
2. Immediate Short-Term Sentiment (Bullish / Bearish / Neutral)
3. Expected Price Volatility Impact (%)
4. Recommended Position (Long, Short, Option Hedging, or Stand Aside)
5. Key Invalidations / Risk Factors
`
  },

  'strategy_backtester': {
    id: 'strategy_backtester',
    name: 'Strategy Backtester',
    icon: '🧪',
    description: 'Simulates quantitative trading strategy performance (Win Rate, Profit Factor, Max Drawdown).',
    buildPrompt: ({ symbol, price, indicators, userPrompt }) => `
You are a Quantitative Backtesting Specialist.
Perform a simulated backtest evaluation of the specified trading strategy on ${symbol}.

Current Market Profile:
- Symbol: ${symbol} | Spot Price: ₹${price}
- Benchmark Volatility & Range: RSI=${indicators.rsi}, SMA20=₹${indicators.sma20}

Strategy Under Test: ${userPrompt || '20/50 SMA Crossover + RSI 14 Momentum Filter over last 6 months.'}

Provide a quantitative backtest audit:
1. Simulated Win Rate (%)
2. Profit Factor & Expectations (e.g. 1.85)
3. Maximum Drawdown (%)
4. Total Trades & Average Duration
5. Strategy Edge Optimization (3 improvements to increase profitability)
`
  },

  'risk_manager': {
    id: 'risk_manager',
    name: 'Portfolio Risk Manager',
    icon: '🛡️',
    description: 'Audits portfolio allocation, flags hidden correlations, and designs hedging strategies against 20% downturns.',
    buildPrompt: ({ symbol, price, userPrompt }) => `
You are a Chief Risk Officer (CRO) for an institutional desk.
Analyze portfolio risk and recommend hedging strategies for ${symbol} and broader holdings.

Context:
- Primary Ticker: ${symbol} (Price ₹${price})
- User Portfolio Detail: ${userPrompt || 'Concentrated in Indian Equities (Reliance, HDFC Bank, TCS, Coal India).'}

Provide:
1. Concentration & Volatility Risk Score (1-10 Scale)
2. Overexposure & Hidden Asset Correlations
3. Tail Risk Protection Strategy (20% Market Downturn Hedge)
4. Rebalancing & Position Sizing Recommendations
`
  },

  'journal_analyzer': {
    id: 'journal_analyzer',
    name: 'Trading Journal Analyzer',
    icon: '📓',
    description: 'Audits trade execution history, detects psychological biases, and formulates 3 strict discipline rules.',
    buildPrompt: ({ symbol, userPrompt }) => `
You are a Performance & Trading Psychology Coach.
Review recent trade logs to uncover behavioral flaws and execution leaks.

Trade Logs Provided: ${userPrompt || '5 recent trades: 2 winners chasing breakouts, 3 losses holding past stop-loss hoping for reversal.'}

Provide:
1. Execution Audit & Recurring Errors (e.g. FOMO, Revenge Trading, Stop Loss Removal)
2. Behavioral Bias Classification
3. 3 Non-Negotiable Execution Rules to immediately increase consistency
4. Risk Management Rules for Next Session
`
  },

  'daily_plan': {
    id: 'daily_plan',
    name: 'Fully Automated Trading Plan',
    icon: '📋',
    description: 'Generates a timestamped daily trading checklist covering pre-market scan, opening strategies, and closing procedures.',
    buildPrompt: ({ symbol, price, open, high, low, pctChange, indicators, userPrompt }) => `
You are a Head Trader crafting a daily operational checklist for ${symbol}.

Market Baseline:
- Symbol: ${symbol} @ ₹${price} (${pctChange}%)
- Session Range: ₹${low} - ₹${high} | Open: ₹${open}
- Pivot: ₹${indicators.levels.pivot} | S1: ₹${indicators.levels.support1} | R1: ₹${indicators.levels.resistance1}

Custom Focus: ${userPrompt || 'Standard intraday & momentum execution checklist.'}

Deliver a timestamped operational plan:
1. 08:30 - 09:15 AM: Pre-Market Scanning & Level Plotting Checklist
2. 09:15 - 09:45 AM: Opening Range Breakout (ORB) Rules & Conditions
3. 09:45 - 01:30 PM: Mid-Session Trend Continuation & Adjustment Rules
4. 01:30 - 03:30 PM: Exit Management, Target Scaling & EOD Close Protocol
`
  }
};

const prepareSkillContext = ({ symbol, timeSeries = [], quote = {}, skillId, userPrompt }) => {
  const skill = SKILLS_REGISTRY[skillId] || SKILLS_REGISTRY['conversational'];
  const candles = (timeSeries && timeSeries.length > 0) ? timeSeries : [];

  const prices = candles.map(c => parseFloat(c.close || c.price || 0)).filter(p => p > 0);

  const price = quote?.price || (prices.length > 0 ? prices[0] : 1000.0);
  const open = quote?.open || (candles.length > 0 ? parseFloat(candles[candles.length - 1].open || price) : price);
  const high = quote?.high || (prices.length > 0 ? Math.max(...prices) : price * 1.01);
  const low = quote?.low || (prices.length > 0 ? Math.min(...prices) : price * 0.99);
  const pctChange = quote?.percent_change !== undefined ? quote.percent_change : 0.0;

  const sma20 = calculateSMA(prices, 20) || (price * 0.98);
  const sma50 = calculateSMA(prices, 50) || (price * 0.95);
  const rsi = calculateRSI(prices, 14);
  const levels = calculateSupportResistance(candles);

  const indicators = { sma20, sma50, rsi, levels };

  const prompt = skill.buildPrompt({
    symbol,
    price,
    open,
    high,
    low,
    pctChange,
    indicators,
    userPrompt
  });

  return {
    skill,
    indicators,
    contextSummary: {
      symbol,
      price,
      open,
      high,
      low,
      pctChange,
      indicatorsCalculated: { sma20, sma50, rsi, levels }
    },
    prompt
  };
};

module.exports = {
  SKILLS_REGISTRY,
  prepareSkillContext,
  calculateSMA,
  calculateRSI,
  calculateSupportResistance
};
