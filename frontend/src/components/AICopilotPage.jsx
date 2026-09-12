import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from './GlassCard';
import { StockLogo } from './StockLogo';
import { MarkdownText } from './MarkdownText';
import { API_BASE } from '../config/api';
import {
  ArrowLeft, Bot, Sparkles, Terminal, Activity, ShieldCheck, ChevronDown, ChevronUp,
  Cpu, Zap, Clock, Send, RefreshCw, Trash2, User, Sliders, Layers, Database,
  Plus, Edit3, CheckCircle, AlertTriangle, Settings, HelpCircle, X
} from 'lucide-react';

const INITIAL_SKILLS = [
  { id: 'trading_ideas', name: 'Trading Ideas', icon: '🎯', desc: 'Scan market for 5 high-probability trade setups with TP/SL ratios.', active: true, prompt: 'Scan today\'s market and generate 5 high-probability trading setups with entry, targets, stop-loss, and risk:reward ratio.' },
  { id: 'technical_analyst', name: 'Technical Analyst', icon: '📊', desc: 'Deep breakdown of SMA 20/50, RSI 14, and support/resistance levels.', active: true, prompt: 'Perform a detailed technical analysis breaking down support/resistance, 20/50 SMA, RSI, and provide a Buy/Hold/Sell signal.' },
  { id: 'news_converter', name: 'News Converter', icon: '📰', desc: 'Translate news developments into short & long-term price targets.', active: true, prompt: 'Analyze recent company & market news developments and translate them into short- and long-term price targets.' },
  { id: 'strategy_backtester', name: 'Strategy Backtest', icon: '🧪', desc: 'Historical SMA crossover & RSI filter simulated backtesting.', active: true, prompt: 'Perform a simulated strategy backtest on 20/50 SMA crossover & RSI momentum filter over recent candles.' },
  { id: 'risk_manager', name: 'Risk Manager', icon: '🛡️', desc: 'Audit portfolio allocation, exposure risk & market downturn hedging.', active: true, prompt: 'Audit portfolio allocation, identify overexposure risk, and suggest hedging against a 20% market downturn.' },
  { id: 'journal_analyzer', name: 'Journal Audit', icon: '📓', desc: 'Review recent trades, identify FOMO & discipline rules.', active: true, prompt: 'Review recent trades, identify FOMO or behavioral biases, and provide 3 discipline rules to increase consistency.' },
  { id: 'daily_plan', name: 'Daily Protocol', icon: '📋', desc: 'Pre-market 08:30 AM to market close 03:30 PM protocol.', active: true, prompt: 'Design a timestamped daily trading plan from 08:30 AM pre-market scan to 03:30 PM market close protocol.' }
];

const CONNECTORS = [
  { id: 'zerodha', name: 'Zerodha KiteConnect Stream', status: 'connected', type: 'WebSocket / SSE', details: 'Live tick stream & OHLC candle data' },
  { id: 'nse_news', name: 'NSE Market News Feed', status: 'connected', type: 'REST API', details: 'Real-time exchange corporate announcements' },
  { id: 'ta_engine', name: 'Technical Indicator Engine', status: 'connected', type: 'Internal Computation', details: 'SMA 20/50, RSI 14, Support/Resistance Pivots' },
  { id: 'tv_webhooks', name: 'TradingView Webhooks', status: 'available', type: 'Webhook Trigger', details: 'Automated execution signal alerts' }
];

const POPULAR_TICKERS = [
  { value: 'GENERAL', label: '🌐 All / General Market' },
  { value: 'RELIANCE', label: 'RELIANCE (NSE)' },
  { value: 'TCS', label: 'TCS (NSE)' },
  { value: 'INFY', label: 'INFY (NSE)' },
  { value: 'HDFCBANK', label: 'HDFCBANK (NSE)' },
  { value: 'NIFTY 50', label: 'NIFTY 50 Index' },
  { value: 'BANKNIFTY', label: 'NIFTY Bank' },
  { value: 'COALINDIA', label: 'COALINDIA (NSE)' },
  { value: 'USD/INR', label: 'USD/INR Currency' }
];

export const AICopilotPage = ({ onBackToDashboard }) => {
  const [selectedSymbol, setSelectedSymbol] = useState('GENERAL');
  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [activeTab, setActiveTab] = useState('skills'); // 'skills', 'connectors', 'guardrails'
  const [activeSkillId, setActiveSkillId] = useState('trading_ideas');

  // Guardrails state
  const [maxRiskPercent, setMaxRiskPercent] = useState(2.0);
  const [stopLossEnforced, setStopLossEnforced] = useState(true);
  const [maxDrawdownCap, setMaxDrawdownCap] = useState(15.0);

  // Skill Add/Edit Modal States
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null); // skill object if editing

  const [skillFormName, setSkillFormName] = useState('');
  const [skillFormIcon, setSkillFormIcon] = useState('⚡');
  const [skillFormDesc, setSkillFormDesc] = useState('');
  const [skillFormPrompt, setSkillFormPrompt] = useState('');

  // Messages Thread State
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Welcome to your **AI Trading Intelligence Studio** powered by **Claude 3.7 Sonnet**!\n\nI am your general AI trading co-pilot grounded in live Zerodha market data. Ask me anything about:\n• **Technical Analysis** & Indicator signals for any stock\n• **Trade Setups** with Entry, Targets & Stop-Loss\n• **Market News & Macro** analysis\n• **Strategy Backtesting** & Risk Management\n\nType any stock or question below, or pick a skill to begin!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      telemetry: null,
      reasoningLogs: null
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDebugIds, setOpenDebugIds] = useState({});

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleToggleSkill = (skillId) => {
    setSkills(prev => prev.map(s => s.id === skillId ? { ...s, active: !s.active } : s));
  };

  const handleOpenAddModal = () => {
    setEditingSkill(null);
    setSkillFormName('');
    setSkillFormIcon('⚡');
    setSkillFormDesc('');
    setSkillFormPrompt('');
    setShowAddSkillModal(true);
  };

  const handleOpenEditModal = (skill) => {
    setEditingSkill(skill);
    setSkillFormName(skill.name);
    setSkillFormIcon(skill.icon);
    setSkillFormDesc(skill.desc || '');
    setSkillFormPrompt(skill.prompt);
    setShowAddSkillModal(true);
  };

  const handleSaveSkillForm = (e) => {
    e.preventDefault();
    if (!skillFormName.trim() || !skillFormPrompt.trim()) return;

    if (editingSkill) {
      // Update existing skill
      setSkills(prev => prev.map(s => s.id === editingSkill.id ? {
        ...s,
        name: skillFormName.trim(),
        icon: skillFormIcon.trim() || '⚡',
        desc: skillFormDesc.trim() || 'Custom user-defined trading skill.',
        prompt: skillFormPrompt.trim()
      } : s));
    } else {
      // Create new skill
      const newSkill = {
        id: `custom_${Date.now()}`,
        name: skillFormName.trim(),
        icon: skillFormIcon.trim() || '⚡',
        desc: skillFormDesc.trim() || 'Custom user-defined trading skill.',
        active: true,
        prompt: skillFormPrompt.trim()
      };
      setSkills(prev => [...prev, newSkill]);
    }

    setShowAddSkillModal(false);
  };

  const handleSendMessage = async (customText = null, skillId = null) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || loading) return;

    // If user clicked a preset skill chip (customText exists), use selected skillId.
    // If user typed into the chat input, use 'conversational' to allow free-form AI chat!
    const effectiveSkillId = customText ? (skillId || activeSkillId) : 'conversational';

    const userMsgId = `user-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputPrompt('');
    setLoading(true);

    try {
      const historyPayload = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch(`${API_BASE}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedSymbol === 'GENERAL' ? 'RELIANCE' : selectedSymbol,
          skillId: effectiveSkillId,
          userPrompt: textToSend,
          timeframe: '1D',
          conversationHistory: historyPayload
        })
      });

      const data = await res.json();

      if (data.success) {
        const assistantMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.output,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          telemetry: data.telemetry,
          reasoningLogs: data.reasoningLogs,
          model: data.model
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `⚠️ **Error**: ${data.error || 'Failed to generate response'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ **Network Error**: Unable to connect to backend AI server.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Conversation thread cleared. I am ready to analyze any market prompt!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const toggleDebugDrawer = (id) => {
    setOpenDebugIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeSkillsList = skills.filter(s => s.active);

  return (
    <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 8px' }}>
      {/* Top Page Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', padding: '4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBackToDashboard}
            className="btn btn-secondary"
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(168, 85, 247, 0.25))',
              border: '1px solid rgba(0, 242, 254, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              boxShadow: '0 4px 14px rgba(0, 242, 254, 0.2)'
            }}>
              <Bot size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                AI Trading Intelligence Studio
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                Claude 3.7 Sonnet Studio • Grounded in Live Zerodha Market Feeds
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: '14px',
            background: 'rgba(0, 200, 83, 0.12)',
            color: '#00c853',
            border: '1px solid rgba(0, 200, 83, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00c853' }} />
            ZERODHA LIVE STREAM ACTIVE
          </span>
        </div>
      </div>

      {/* Main Studio Split-Screen Workspace (Console Sidebar + Chat Canvas) */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', minHeight: 'calc(100vh - 160px)' }}>

        {/* LEFT SIDEBAR: Skills, Connectors & Guardrails Console */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '24px',
          border: '1.5px solid var(--border-glass)',
          boxShadow: 'var(--shadow-glass)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Console Tab Selector */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-glass)',
            background: 'var(--bg-input)'
          }}>
            <button
              onClick={() => setActiveTab('skills')}
              style={{
                flex: 1,
                padding: '14px 8px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'skills' ? '2.5px solid var(--color-primary)' : 'none',
                color: activeTab === 'skills' ? 'var(--color-primary)' : 'var(--text-subtle)',
                fontWeight: activeTab === 'skills' ? 800 : 600,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Layers size={15} /> Skills ({skills.length})
            </button>
            <button
              onClick={() => setActiveTab('connectors')}
              style={{
                flex: 1,
                padding: '14px 8px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'connectors' ? '2.5px solid var(--color-primary)' : 'none',
                color: activeTab === 'connectors' ? 'var(--color-primary)' : 'var(--text-subtle)',
                fontWeight: activeTab === 'connectors' ? 800 : 600,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Database size={15} /> Connectors
            </button>
            <button
              onClick={() => setActiveTab('guardrails')}
              style={{
                flex: 1,
                padding: '14px 8px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'guardrails' ? '2.5px solid var(--color-primary)' : 'none',
                color: activeTab === 'guardrails' ? 'var(--color-primary)' : 'var(--text-subtle)',
                fontWeight: activeTab === 'guardrails' ? 800 : 600,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <ShieldCheck size={15} /> Guardrails
            </button>
          </div>

          {/* TAB 1: Skills Manager */}
          {activeTab === 'skills' && (
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-subtle)', letterSpacing: '0.05em' }}>
                  INSTALLED AGENT SKILLS
                </span>
                <button
                  onClick={handleOpenAddModal}
                  style={{
                    background: 'rgba(0, 242, 254, 0.12)',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    color: 'var(--color-primary)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Plus size={13} /> Add Skill
                </button>
              </div>

              {skills.map(skill => (
                <div
                  key={skill.id}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    background: skill.active ? 'rgba(0, 242, 254, 0.06)' : 'var(--bg-input)',
                    border: skill.active ? '1px solid rgba(0, 242, 254, 0.35)' : '1px solid var(--border-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>{skill.icon}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>{skill.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => handleOpenEditModal(skill)}
                        title="Edit Skill Prompts & Logic"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-subtle)',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Edit3 size={15} />
                      </button>
                      <input
                        type="checkbox"
                        checked={skill.active}
                        onChange={() => handleToggleSkill(skill.id)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', lineHeight: 1.4 }}>
                    {skill.desc}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Connectors Suite */}
          {activeTab === 'connectors' && (
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-subtle)', letterSpacing: '0.05em' }}>
                ACTIVE MARKET DATA CONNECTORS
              </span>

              {CONNECTORS.map(conn => (
                <div
                  key={conn.id}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>{conn.name}</span>
                    <span style={{
                      fontSize: '0.675rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: conn.status === 'connected' ? 'rgba(0, 200, 83, 0.15)' : 'rgba(255, 171, 0, 0.15)',
                      color: conn.status === 'connected' ? '#00c853' : '#ffab00',
                      border: `1px solid ${conn.status === 'connected' ? 'rgba(0, 200, 83, 0.3)' : 'rgba(255, 171, 0, 0.3)'}`
                    }}>
                      {conn.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    Protocol: <strong style={{ color: 'var(--text-main)' }}>{conn.type}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {conn.details}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Guardrails Config (Clean, Spacious Layout) */}
          {activeTab === 'guardrails' && (
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-subtle)', letterSpacing: '0.05em' }}>
                RISK & EXECUTION CONTROLS
              </span>

              {/* Guardrail Card 1: Max Risk */}
              <div style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>Max Risk per Trade</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-primary)' }}>{maxRiskPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.5"
                  value={maxRiskPercent}
                  onChange={(e) => setMaxRiskPercent(parseFloat(e.target.value))}
                  style={{ accentColor: 'var(--color-primary)', cursor: 'pointer', width: '100%' }}
                />
                <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
                  Cap individual position allocation per signal.
                </div>
              </div>

              {/* Guardrail Card 2: Stop Loss */}
              <div style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>Mandatory Stop-Loss</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', marginTop: '2px' }}>Reject trade setups lacking SL bounds</div>
                </div>
                <input
                  type="checkbox"
                  checked={stopLossEnforced}
                  onChange={(e) => setStopLossEnforced(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#00c853' }}
                />
              </div>

              {/* Guardrail Card 3: Max Drawdown */}
              <div style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>Max Portfolio Drawdown</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ff3b30' }}>{maxDrawdownCap}%</span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="30.0"
                  step="1.0"
                  value={maxDrawdownCap}
                  onChange={(e) => setMaxDrawdownCap(parseFloat(e.target.value))}
                  style={{ accentColor: '#ff3b30', cursor: 'pointer', width: '100%' }}
                />
                <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
                  Trigger safe-mode circuit breaker on drawdown breach.
                </div>
              </div>
            </div>
          )}

          {/* Model Status Footer */}
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-glass)',
            background: 'var(--bg-input)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={16} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>Claude 3.7 Sonnet</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Temp: 0.2 • Grounded</span>
          </div>
        </div>

        {/* RIGHT MAIN WORKSPACE: Full Conversational AI Trading Chatbot */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '24px',
          border: '1.5px solid var(--border-glass)',
          boxShadow: 'var(--shadow-glass)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>

          {/* Chat Workspace Top Bar */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-glass)',
            background: 'var(--bg-input)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.2))',
                border: '1px solid rgba(0, 242, 254, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}>
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Conversational AI Trading Assistant
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                  Grounded in Live Zerodha Feeds & Configured Skills
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Target Instrument (Optional):</span>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    borderRadius: '10px',
                    padding: '5px 10px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {POPULAR_TICKERS.map(item => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleClearChat}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-subtle)',
                  borderRadius: '10px',
                  padding: '6px 14px',
                  fontSize: '0.775rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={15} /> Clear Thread
              </button>
            </div>
          </div>

          {/* Quick Skill Chips Selector Bar */}
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border-glass)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            background: 'var(--bg-card)',
            scrollbarWidth: 'none'
          }}>
            {activeSkillsList.map(skill => (
              <button
                key={skill.id}
                onClick={() => {
                  setActiveSkillId(skill.id);
                  handleSendMessage(skill.prompt, skill.id);
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: '16px',
                  fontSize: '0.775rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: activeSkillId === skill.id ? '1.5px solid var(--color-primary)' : '1px solid var(--border-glass)',
                  background: activeSkillId === skill.id ? 'rgba(0, 242, 254, 0.15)' : 'var(--bg-input)',
                  color: activeSkillId === skill.id ? 'var(--color-primary)' : 'var(--text-subtle)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{skill.icon}</span>
                <span>{skill.name}</span>
              </button>
            ))}
          </div>

          {/* Conversational Message Thread with Rich Markdown Parsing */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    gap: '6px'
                  }}
                >
                  {/* Message Sender Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-subtle)', padding: '0 4px' }}>
                    {isUser ? (
                      <>
                        <span>You</span>
                        <User size={13} />
                      </>
                    ) : (
                      <>
                        <Bot size={14} style={{ color: 'var(--color-primary)' }} />
                        <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>Claude 3.7 AI</span>
                      </>
                    )}
                    <span>• {msg.timestamp}</span>
                  </div>

                  {/* Rich Markdown Message Bubble */}
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '18px 22px',
                      borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      background: isUser
                        ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.2))'
                        : 'var(--bg-input)',
                      border: isUser ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid var(--border-glass)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      lineHeight: 1.7,
                      fontFamily: 'Inter, sans-serif',
                      boxShadow: isUser ? '0 4px 16px rgba(0, 242, 254, 0.15)' : 'var(--shadow-glass)'
                    }}
                  >
                    <MarkdownText text={msg.content} />
                  </div>

                  {/* Reasoning & Telemetry Drawer for AI Responses */}
                  {!isUser && msg.reasoningLogs && (
                    <div style={{ width: '100%', maxWidth: '85%', marginTop: '4px' }}>
                      <div style={{
                        borderRadius: '14px',
                        border: '1px solid var(--border-glass)',
                        background: 'rgba(0,0,0,0.2)',
                        overflow: 'hidden'
                      }}>
                        <button
                          onClick={() => toggleDebugDrawer(msg.id)}
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-subtle)',
                            fontSize: '0.775rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Terminal size={15} style={{ color: 'var(--color-primary)' }} />
                            <span>🔍 Reasoning & Chain-of-Thought ({msg.reasoningLogs.length} steps)</span>
                          </div>
                          {openDebugIds[msg.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>

                        {openDebugIds[msg.id] && (
                          <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                            {msg.reasoningLogs.map((log, lIdx) => (
                              <div key={lIdx} style={{ fontSize: '0.75rem', fontFamily: 'monospace', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)', fontWeight: 700 }}>
                                  <span>[{log.step}] {log.title}</span>
                                  <span style={{ color: '#00c853' }}>{log.status}</span>
                                </div>
                                <div style={{ color: 'var(--text-subtle)', fontSize: '0.725rem', marginTop: '4px' }}>{log.details}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {msg.telemetry && (
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.725rem', color: 'var(--text-subtle)', marginTop: '6px', paddingLeft: '4px' }}>
                          <span>⏱️ {msg.telemetry.latencyMs}ms</span>
                          <span>•</span>
                          <span>⚡ {msg.telemetry.totalTokens} Tokens</span>
                          <span>•</span>
                          <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Est. Cost: ${msg.telemetry.costUSD} (₹{msg.telemetry.costINR})</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderRadius: '16px', background: 'var(--bg-input)', border: '1px solid var(--border-glass)', width: 'fit-content', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                <RefreshCw size={16} className="spin" style={{ color: 'var(--color-primary)' }} />
                <span>Claude 3.7 Sonnet reasoning & evaluating market data...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Bottom Chat Input Section */}
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border-glass)',
            background: 'var(--bg-input)',
            display: 'flex',
            gap: '14px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask Claude about market setups, technical analysis, or any stock..."
              style={{
                flex: 1,
                padding: '16px 20px',
                borderRadius: '16px',
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border-glass)',
                color: 'var(--text-main)',
                fontSize: '0.925rem',
                outline: 'none',
                fontFamily: 'Inter, sans-serif'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputPrompt.trim()}
              className="btn btn-primary"
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: loading || !inputPrompt.trim() ? 0.6 : 1,
                cursor: loading || !inputPrompt.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? <RefreshCw size={22} className="spin" /> : <Send size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Skill Modal */}
      {showAddSkillModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '480px',
            maxWidth: '100%',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-glass)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {editingSkill ? '✏️ Edit Agent Skill' : '➕ Create Custom Agent Skill'}
              </h3>
              <button
                onClick={() => setShowAddSkillModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSkillForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)' }}>Icon</label>
                  <input
                    type="text"
                    placeholder="Icon"
                    value={skillFormIcon}
                    onChange={(e) => setSkillFormIcon(e.target.value)}
                    style={{ width: '80px', padding: '12px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', textAlign: 'center', fontSize: '1.1rem' }}
                  />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)' }}>Skill Name</label>
                  <input
                    type="text"
                    placeholder="Skill Name (e.g. Technical Analyst)"
                    value={skillFormName}
                    onChange={(e) => setSkillFormName(e.target.value)}
                    style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', outline: 'none', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)' }}>Short Description</label>
                <input
                  type="text"
                  placeholder="Short description of what this skill does..."
                  value={skillFormDesc}
                  onChange={(e) => setSkillFormDesc(e.target.value)}
                  style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)' }}>System Prompt / Analysis Logic</label>
                <textarea
                  placeholder="Enter system prompt instructions for Claude 3.7..."
                  value={skillFormPrompt}
                  onChange={(e) => setSkillFormPrompt(e.target.value)}
                  rows={5}
                  style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', outline: 'none', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '10px 20px', borderRadius: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: 800 }}
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
