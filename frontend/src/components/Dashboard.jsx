import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DeveloperConsole } from './DeveloperConsole';
import { GlassCard } from './GlassCard';
import { API_BASE } from '../config/api';
import {
  LayoutDashboard,
  Code,
  ArrowRight,
  ArrowLeft,
  Zap,
  Waves,
  Activity,
  ShieldCheck,
  Cpu,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  Sparkles,
  Radio,
  Clock,
  Bot
} from 'lucide-react';

export const Dashboard = ({ onOpenTradingOverview, onOpenAICopilot, onOpenThreeWaveStrategy }) => {
  const { user, isDeveloper } = useAuth();
  const [activeView, setActiveView] = useState('home'); // 'home', 'developer'
  const [zerodhaStatus, setZerodhaStatus] = useState(false);
  const [realLatency, setRealLatency] = useState(8);
  const [claudeBudget, setClaudeBudget] = useState({ left: 4.85, total: 5.00 });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const start = performance.now();
        const res = await fetch(`${API_BASE}/api/market/health`);
        const end = performance.now();
        const roundTripPing = Math.max(2, Math.round(end - start));
        setRealLatency(roundTripPing);

        const data = await res.json();
        if (data.success && data.claudeBudget) {
          setClaudeBudget(data.claudeBudget);
        }

        const zRes = await fetch(`${API_BASE}/api/auth/zerodha/status`);
        const zData = await zRes.json();
        if (zData.success && typeof zData.connected === 'boolean') {
          setZerodhaStatus(zData.connected);
        }
      } catch (e) {}
    };

    fetchStatus();
    const timer = setInterval(fetchStatus, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenOverview = () => {
    if (onOpenTradingOverview) onOpenTradingOverview();
  };

  const handleOpenThreeWaveStrategy = () => {
    if (onOpenThreeWaveStrategy) onOpenThreeWaveStrategy();
  };

  return (
    <div style={{ width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* VIEW 1: Main Dashboard Workspace */}
      {activeView === 'home' && (
        <>
          {/* Executive Hero Banner */}
          <div
            style={{
              width: '100%',
              borderRadius: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              boxShadow: 'var(--shadow-glass)',
              padding: '28px 36px',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            {/* Top Subtle Gradient Line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #00f2fe 0%, #10b981 50%, #a855f7 100%)'
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              {/* User Identity & Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '20px',
                      background: isDeveloper
                        ? 'linear-gradient(135deg, #a855f7, #6366f1)'
                        : 'linear-gradient(135deg, #00f2fe, #0284c7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      boxShadow: isDeveloper
                        ? '0 8px 24px rgba(168, 85, 247, 0.4)'
                        : '0 8px 24px rgba(0, 242, 254, 0.35)'
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '3px solid var(--bg-card)',
                      boxShadow: '0 0 8px #10b981'
                    }}
                    title="Active User Session"
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                      Welcome back, {user?.name}
                    </h1>
                    <span className={`badge ${isDeveloper ? 'badge-developer' : 'badge-user'}`} style={{ fontSize: '0.7rem', padding: '4px 12px' }}>
                      {isDeveloper ? 'DEVELOPER' : 'TRADER'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{user?.email}</span>
                    <span style={{ color: 'var(--text-subtle)' }}>•</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                      Authenticated via {user?.authProvider?.toUpperCase() || 'SESSION'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Quick Terminal Diagnostics Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* Zerodha Status Pill */}
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: '14px',
                    background: zerodhaStatus ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${zerodhaStatus ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldCheck size={16} color={zerodhaStatus ? '#10b981' : '#ef4444'} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Zerodha API
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: zerodhaStatus ? '#10b981' : '#ef4444' }}>
                      {zerodhaStatus ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                  </div>
                </div>

                {/* AI Model Status Pill */}
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: '14px',
                    background: 'rgba(0, 242, 254, 0.1)',
                    border: '1px solid rgba(0, 242, 254, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Cpu size={16} color="var(--color-primary)" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      AI Model
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      CLAUDE 3.7 SONNET
                    </span>
                  </div>
                </div>

                {/* Realtime Engine Status Pill */}
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: '14px',
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Radio size={16} color="#a855f7" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Scanner Feed
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#a855f7' }}>
                      SSE STREAM ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics / Stat Counters Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {/* Stat 1: System Latency */}
            <div
              style={{
                padding: '20px 24px',
                borderRadius: '18px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                boxShadow: 'var(--shadow-glass)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <Activity size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  System Latency
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  {realLatency}ms Real-Time
                </div>
              </div>
            </div>

            {/* Stat 2: Claude API Budget */}
            <div
              style={{
                padding: '20px 24px',
                borderRadius: '18px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                boxShadow: 'var(--shadow-glass)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Bot size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Claude API Budget
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  ${claudeBudget.left ? claudeBudget.left.toFixed(2) : '4.85'} / ${claudeBudget.total ? claudeBudget.total.toFixed(2) : '5.00'} Left
                </div>
              </div>
            </div>

            {/* Stat 3 */}
            <div
              style={{
                padding: '20px 24px',
                borderRadius: '18px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                boxShadow: 'var(--shadow-glass)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                <Sparkles size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target Expansion
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#a855f7', marginTop: '2px' }}>
                  1.618 Fib Golden Ratio
                </div>
              </div>
            </div>

            {/* Stat 4 */}
            <div
              style={{
                padding: '20px 24px',
                borderRadius: '18px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                boxShadow: 'var(--shadow-glass)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <BarChart2 size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Execution Engine
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
                  Institutional Grade
                </div>
              </div>
            </div>
          </div>

          {/* Primary Modules - Full Width 2-Column Responsive Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', width: '100%' }}>
            {/* MODULE 1: Trading Overview & Market Terminal */}
            <div
              onClick={handleOpenOverview}
              style={{
                width: '100%',
                cursor: 'pointer',
                padding: '32px',
                borderRadius: '24px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                boxShadow: 'var(--shadow-glass)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '28px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.boxShadow = '0 16px 40px var(--color-primary-glow)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--border-glass)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
              }}
            >
              {/* Accent Glow Circle */}
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)',
                  pointerEvents: 'none',
                  opacity: 0.6
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      flexShrink: 0,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #00f2fe 0%, #0284c7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 6px 20px var(--color-primary-glow)'
                    }}
                  >
                    <LayoutDashboard size={28} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                      Trading Overview & Market Terminal
                    </h2>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Live Market Quotes & Analytics
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                  Access live market quotes, real-time Zerodha ticker streams, stock symbol search, area trend charts, and fundamental overview metrics.
                </p>

                {/* Feature Bullet Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="var(--color-primary)" />
                    <span>Real-Time Zerodha SSE Market Stream & Ticker Tape</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="var(--color-primary)" />
                    <span>Interactive Technical Area & Price Action Charts</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="var(--color-primary)" />
                    <span>Instant Stock Search & Fundamental Metrics Panel</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-subtle)' }}>
                  Market Terminal Module
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenOverview();
                  }}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    padding: '10px 22px',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Launch Terminal <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* MODULE 2: ASTA 3rd Wave AI Strategy Scanner */}
            <div
              onClick={handleOpenThreeWaveStrategy}
              style={{
                width: '100%',
                cursor: 'pointer',
                padding: '32px',
                borderRadius: '24px',
                background: 'var(--bg-card)',
                border: '1.5px solid rgba(16, 185, 129, 0.4)',
                boxShadow: 'var(--shadow-glass)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '28px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
              }}
            >
              {/* Accent Glow Circle */}
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      flexShrink: 0,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
                    }}
                  >
                    <Waves size={28} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                      ASTA 3rd Wave AI Strategy
                    </h2>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Multi-Timeframe Scanner & AI Verdicts
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                  Algorithmic scanner executing 9-factor setup scoring, 1.618 Fibonacci expansion projections, and Claude 3.7 AI Executive Verdicts.
                </p>

                {/* Feature Bullet Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>Multi-Timeframe Wave Confirmation (Daily, 75m & 15m)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>1.618 Fibonacci Target & Stop Loss Calculation</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>Deep View Studio Modal & Interactive Candlestick Charts</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>
                  Zerodha Live Engine Active
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenThreeWaveStrategy();
                  }}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    padding: '10px 22px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    color: '#ffffff',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                    cursor: 'pointer'
                  }}
                >
                  Open Strategy Scanner <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* DEVELOPER CONSOLE BANNER (Only visible for Developer role) */}
          {isDeveloper && (
            <div
              onClick={() => setActiveView('developer')}
              style={{
                width: '100%',
                cursor: 'pointer',
                padding: '24px 32px',
                borderRadius: '20px',
                background: 'var(--bg-card)',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                boxShadow: 'var(--shadow-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-developer-purple)';
                e.currentTarget.style.boxShadow = '0 8px 24px var(--color-developer-purple-glow)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.35)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-developer-purple)' }}>
                  <Code size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    Developer System Diagnostics Console
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Inspect real-time Zerodha WebSocket ticks, backend API routes, environment variables, and execution trace logs.
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveView('developer');
                }}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '8px 18px',
                  borderRadius: '10px',
                  color: 'var(--color-developer-purple)',
                  borderColor: 'rgba(168, 85, 247, 0.35)',
                  cursor: 'pointer'
                }}
              >
                Open Console <ArrowRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* VIEW 2: Developer Console Page */}
      {activeView === 'developer' && isDeveloper && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => setActiveView('home')}
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

            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-subtle)' }}>
              Developer Console Diagnostics
            </span>
          </div>

          <DeveloperConsole />
        </div>
      )}
    </div>
  );
};
