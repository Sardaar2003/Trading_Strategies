import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { StockLogo } from './StockLogo';
import { API_BASE } from '../config/api';
import {
  X, Sparkles, Terminal, Activity, ShieldCheck, ChevronDown, ChevronUp,
  Cpu, Zap, Clock, DollarSign, Send, RefreshCw, AlertCircle, Trash2, Bot, User
} from 'lucide-react';

const PRESET_SKILLS = [
  { id: 'trading_ideas', name: 'Trading Ideas', icon: '🎯', prompt: 'Scan today\'s market and generate 5 high-probability trading setups with entry, targets, stop-loss, and risk:reward ratio.' },
  { id: 'technical_analyst', name: 'Technical Analyst', icon: '📊', prompt: 'Perform a detailed technical analysis breaking down support/resistance, 20/50 SMA, RSI, and provide a Buy/Hold/Sell signal.' },
  { id: 'news_converter', name: 'News Converter', icon: '📰', prompt: 'Analyze recent company & market news developments and translate them into short- and long-term price targets.' },
  { id: 'strategy_backtester', name: 'Strategy Backtest', icon: '🧪', prompt: 'Perform a simulated strategy backtest on 20/50 SMA crossover & RSI momentum filter over recent candles.' },
  { id: 'risk_manager', name: 'Risk Manager', icon: '🛡️', prompt: 'Audit portfolio allocation, identify overexposure risk, and suggest hedging against a 20% market downturn.' },
  { id: 'journal_analyzer', name: 'Journal Audit', icon: '📓', prompt: 'Review recent trades, identify FOMO or behavioral biases, and provide 3 discipline rules to increase consistency.' },
  { id: 'daily_plan', name: 'Daily Plan', icon: '📋', prompt: 'Design a timestamped daily trading plan from 08:30 AM pre-market scan to 03:30 PM market close protocol.' }
];

export const AITradingCopilotPanel = ({ isOpen, onClose, selectedSymbol = 'RELIANCE', currentPrice, priceChange }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hello! I am your **Claude 3.7 AI Trading Chatbot**, grounded in live Zerodha market data.\n\nAsk me anything about **${selectedSymbol}**, technical levels, trading setups, backtesting, or risk management!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      telemetry: null,
      reasoningLogs: null
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSkillId, setActiveSkillId] = useState('trading_ideas');
  const [openDebugIds, setOpenDebugIds] = useState({});

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = async (customText = null, skillId = activeSkillId) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || loading) return;

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
          symbol: selectedSymbol,
          skillId,
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
        content: `Conversation reset. I am ready to analyze **${selectedSymbol}** or any other ticker!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const toggleDebugDrawer = (id) => {
    setOpenDebugIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 99998
        }}
      />

      {/* Right-Side Chatbot Sliding Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          height: '100vh',
          width: '460px',
          maxWidth: '95vw',
          background: 'var(--bg-card)',
          borderLeft: '1.5px solid var(--border-glass)',
          boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.6)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Header Bar */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-input)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(79, 172, 254, 0.25))',
              border: '1px solid rgba(0, 242, 254, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <Bot size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  AI Trading Chatbot
                </h3>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(0, 200, 83, 0.15)',
                  color: '#00c853',
                  border: '1px solid rgba(0, 200, 83, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00c853' }} />
                  Claude 3.7
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                Zerodha Grounded Assistant
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={handleClearChat}
              title="Clear Chat History"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                transition: 'color 0.2s'
              }}
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onClose}
              title="Close Chatbot"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Active Symbol Context Strip */}
        <div style={{
          padding: '10px 20px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StockLogo symbol={selectedSymbol} size={26} />
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
              {selectedSymbol}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', background: 'var(--bg-input)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-glass)' }}>
              NSE
            </span>
          </div>

          {currentPrice && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Inter, sans-serif' }}>
                ₹{typeof currentPrice === 'number' ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : currentPrice}
              </span>
              {priceChange !== undefined && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: priceChange >= 0 ? '#00c853' : '#ff3b30' }}>
                  {priceChange >= 0 ? '+' : ''}{priceChange}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Preset Skill Chips Bar (Quick Prompts) */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          background: 'var(--bg-card)',
          scrollbarWidth: 'none'
        }}>
          {PRESET_SKILLS.map(skill => (
            <button
              key={skill.id}
              onClick={() => {
                setActiveSkillId(skill.id);
                handleSendMessage(skill.prompt, skill.id);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
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

        {/* Main Chat Message Thread */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-subtle)', padding: '0 4px' }}>
                  {isUser ? (
                    <>
                      <span>You</span>
                      <User size={12} />
                    </>
                  ) : (
                    <>
                      <Bot size={12} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Claude 3.7 AI</span>
                    </>
                  )}
                  <span>• {msg.timestamp}</span>
                </div>

                {/* Message Bubble Container */}
                <div
                  style={{
                    maxWidth: '88%',
                    padding: '14px 16px',
                    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isUser
                      ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.2))'
                      : 'var(--bg-input)',
                    border: isUser ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid var(--border-glass)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    lineHeight: 1.65,
                    fontFamily: 'Inter, sans-serif',
                    whiteSpace: 'pre-wrap',
                    boxShadow: isUser ? '0 4px 14px rgba(0, 242, 254, 0.15)' : 'var(--shadow-glass)'
                  }}
                >
                  {msg.content}
                </div>

                {/* Per-Message Debug Log & Telemetry Bar (For AI Messages) */}
                {!isUser && msg.reasoningLogs && (
                  <div style={{ width: '100%', maxWidth: '88%', marginTop: '4px' }}>
                    <div style={{
                      borderRadius: '10px',
                      border: '1px solid var(--border-glass)',
                      background: 'rgba(0,0,0,0.15)',
                      overflow: 'hidden'
                    }}>
                      <button
                        onClick={() => toggleDebugDrawer(msg.id)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-subtle)',
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Terminal size={13} style={{ color: 'var(--color-primary)' }} />
                          <span>🔍 Reasoning & Debug Log ({msg.reasoningLogs.length} steps)</span>
                        </div>
                        {openDebugIds[msg.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {openDebugIds[msg.id] && (
                        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                          {msg.reasoningLogs.map((log, lIdx) => (
                            <div key={lIdx} style={{ fontSize: '0.7rem', fontFamily: 'monospace', padding: '6px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)', fontWeight: 700 }}>
                                <span>[{log.step}] {log.title}</span>
                                <span style={{ color: '#00c853' }}>{log.status}</span>
                              </div>
                              <div style={{ color: 'var(--text-subtle)', fontSize: '0.675rem', marginTop: '2px' }}>{log.details}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {msg.telemetry && (
                      <div style={{ display: 'flex', gap: '10px', fontSize: '0.675rem', color: 'var(--text-subtle)', marginTop: '4px', paddingLeft: '4px' }}>
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

          {/* Typing Loading Indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '14px', background: 'var(--bg-input)', border: '1px solid var(--border-glass)', width: 'fit-content', color: 'var(--text-subtle)', fontSize: '0.8rem' }}>
              <RefreshCw size={14} className="spin" style={{ color: 'var(--color-primary)' }} />
              <span>Claude 3.7 Sonnet thinking & analyzing {selectedSymbol}...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom Chat Input Bar */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-glass)',
          background: 'var(--bg-input)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask Claude about ${selectedSymbol} or strategy...`}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '16px',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border-glass)',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
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
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              opacity: loading || !inputPrompt.trim() ? 0.6 : 1,
              cursor: loading || !inputPrompt.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? <RefreshCw size={18} className="spin" /> : <Send size={18} />}
          </button>
        </div>

      </div>
    </>,
    document.body
  );
};
