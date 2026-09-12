import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { SessionSecurityModal } from './SessionSecurityModal';
import { ShieldCheck, LogOut, Code, User as UserIcon, Clock, Activity, Lock, ChevronDown, Zap } from 'lucide-react';

// Professional SVG Flag & Commodity Badge Component
const MarketIcon = ({ type }) => {
  const style = { width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.3)', strokeWidth: 0 };

  switch (type) {
    case 'IN': // India Flag Badge
      return (
        <svg viewBox="0 0 32 32" style={style}>
          <rect width="32" height="10.67" fill="#FF9933" />
          <rect y="10.67" width="32" height="10.67" fill="#FFFFFF" />
          <rect y="21.33" width="32" height="10.67" fill="#128807" />
          <circle cx="16" cy="16" r="3" fill="none" stroke="#000080" strokeWidth="1" />
        </svg>
      );
    case 'US': // US Flag Badge
      return (
        <svg viewBox="0 0 32 32" style={style}>
          <rect width="32" height="32" fill="#B22234" />
          <path d="M0,4.9H32M0,9.8H32M0,14.8H32M0,19.7H32M0,24.6H32M0,29.5H32" stroke="#FFFFFF" strokeWidth="2.4" />
          <rect width="14" height="17" fill="#3C3B6E" />
          <circle cx="4" cy="4" r="1" fill="#FFF" /><circle cx="10" cy="4" r="1" fill="#FFF" />
          <circle cx="7" cy="8.5" r="1" fill="#FFF" />
          <circle cx="4" cy="13" r="1" fill="#FFF" /><circle cx="10" cy="13" r="1" fill="#FFF" />
        </svg>
      );
    case 'GB': // UK Union Jack Badge
      return (
        <svg viewBox="0 0 32 32" style={style}>
          <rect width="32" height="32" fill="#00247D" />
          <path d="M0,0 L32,32 M32,0 L0,32" stroke="#FFFFFF" strokeWidth="4" />
          <path d="M0,0 L32,32 M32,0 L0,32" stroke="#CF142B" strokeWidth="2" />
          <path d="M16,0 V32 M0,16 H32" stroke="#FFFFFF" strokeWidth="7" />
          <path d="M16,0 V32 M0,16 H32" stroke="#CF142B" strokeWidth="4" />
        </svg>
      );
    case 'EU': // EU Flag Badge
      return (
        <svg viewBox="0 0 32 32" style={style}>
          <rect width="32" height="32" fill="#003399" />
          <circle cx="16" cy="8" r="1" fill="#FFCC00" />
          <circle cx="21.6" cy="9.5" r="1" fill="#FFCC00" />
          <circle cx="24" cy="16" r="1" fill="#FFCC00" />
          <circle cx="21.6" cy="22.5" r="1" fill="#FFCC00" />
          <circle cx="16" cy="24" r="1" fill="#FFCC00" />
          <circle cx="10.4" cy="22.5" r="1" fill="#FFCC00" />
          <circle cx="8" cy="16" r="1" fill="#FFCC00" />
          <circle cx="10.4" cy="9.5" r="1" fill="#FFCC00" />
        </svg>
      );
    case 'CA': // Canada Flag Badge
      return (
        <svg viewBox="0 0 32 32" style={style}>
          <rect width="32" height="32" fill="#FFFFFF" />
          <rect width="8" height="32" fill="#FF0000" />
          <rect x="24" width="8" height="32" fill="#FF0000" />
          <path d="M16 8 L18 13 L22 12 L19 16 L21 21 L16 19 L11 21 L13 16 L10 12 L14 13 Z" fill="#FF0000" />
        </svg>
      );
    case 'SG': // Singapore Flag Badge
      return (
        <svg viewBox="0 0 32 32" style={style}>
          <rect width="32" height="16" fill="#ED2939" />
          <rect y="16" width="32" height="16" fill="#FFFFFF" />
          <circle cx="8" cy="8" r="4" fill="#FFFFFF" />
          <circle cx="9.5" cy="8" r="3.5" fill="#ED2939" />
        </svg>
      );
    case 'JP': // Japan Flag Badge
      return (
        <svg viewBox="0 0 32 32" style={style}>
          <rect width="32" height="32" fill="#FFFFFF" />
          <circle cx="16" cy="16" r="8" fill="#BC002D" />
        </svg>
      );
    case 'BRENT': // Oil Barrel Icon
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', flexShrink: 0 }}>
          <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
        </svg>
      );
    case 'GOLD': // Gold Bullion Icon
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', flexShrink: 0 }}>
          <rect x="2" y="7" width="20" height="13" rx="2" fill="rgba(255,215,0,0.15)" />
          <path d="M6 7L9 3h6l3 4" />
          <line x1="12" y1="11" x2="12" y2="16" />
        </svg>
      );
    case 'BTC': // Bitcoin Token Icon
      return (
        <svg viewBox="0 0 32 32" style={style}>
          <circle cx="16" cy="16" r="16" fill="#F7931A" />
          <path d="M22 13.5c0-1.8-1.2-2.7-3.1-3.2v-2.3h-1.6v2.2c-.4 0-.8 0-1.3.1v-2.3h-1.6v2.4h-3.6v1.8h1.4c.8 0 .9.5.9.8v6.6c0 .3-.1.8-.9.8h-1.4v1.8h3.6v2.4h1.6v-2.3c.5.1.9.1 1.3.1v2.3h1.6v-2.3c2.7-.4 4.5-1.5 4.5-3.9 0-1.9-1-2.9-2.6-3.4 1.3-.4 2.2-1.3 2.2-2.7zm-3.6 5.8c0 1.5-2.6 1.8-4.2 1.8v-3.4c1.6 0 4.2.3 4.2 1.6zm.5-5.5c0 1.4-2.2 1.6-3.7 1.6v-3.1c1.5 0 3.7.2 3.7 1.5z" fill="#FFF" />
        </svg>
      );
    default:
      return null;
  }
};

export const Navbar = ({ onNavigateHome, onNavigateOverview, onNavigateAICopilot, onNavigateThreeWave, currentPage = 'dashboard' }) => {
  const { user, logout, isDeveloper } = useAuth();
  const [quotes, setQuotes] = useState({
    'NIFTY 50': { price: 24852.15, percent_change: 0.45 },
    'BANKNIFTY': { price: 51230.80, percent_change: 0.62 },
    'RELIANCE': { price: 1263.00, percent_change: -0.86 },
    'TCS': { price: 4215.00, percent_change: 0.75 },
    'INFY': { price: 1895.40, percent_change: -0.35 },
    'USD/INR': { price: 83.92, percent_change: 0.12 }
  });
  const [tickStatus, setTickStatus] = useState({});
  const [sseConnected, setSseConnected] = useState(false);
  const [lastFetched, setLastFetched] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }) + ' IST');
  const [zerodhaConnected, setZerodhaConnected] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [inputToken, setInputToken] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);

  useEffect(() => {
    const checkZerodhaStatus = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/zerodha/status');
        const data = await res.json();
        if (data.success && typeof data.connected === 'boolean') {
          setZerodhaConnected(data.connected);
        }
      } catch (e) {}
    };

    checkZerodhaStatus();
    const intervalId = setInterval(checkZerodhaStatus, 3000);
    window.addEventListener('focus', checkZerodhaStatus);

    const params = new URLSearchParams(window.location.search);
    if (params.get('zerodha_connected') === 'true') {
      setZerodhaConnected(true);
    }

    const handleMessage = (event) => {
      if (event.data?.type === 'ZERODHA_AUTH_SUCCESS') {
        setZerodhaConnected(true);
        checkZerodhaStatus();
      }
    };

    let channel;
    try {
      channel = new BroadcastChannel('zerodha_auth_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'ZERODHA_AUTH_SUCCESS') {
          setZerodhaConnected(true);
          checkZerodhaStatus();
        }
      };
    } catch(e) {}

    window.addEventListener('message', handleMessage);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', checkZerodhaStatus);
      window.removeEventListener('message', handleMessage);
      if (channel) channel.close();
    };
  }, []);

  const handleZerodhaPopup = (e) => {
    e.preventDefault();
    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      'http://localhost:5000/api/auth/zerodha/login',
      'Zerodha OAuth Login',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=no,resizable=yes`
    );
  };

  const handleManualTokenSubmit = async (e) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    setTokenLoading(true);
    try {
      const isReqToken = inputToken.trim().length === 32; // Standard Zerodha request token length
      const body = isReqToken ? { request_token: inputToken.trim() } : { access_token: inputToken.trim() };
      
      const res = await fetch('http://localhost:5000/api/auth/zerodha/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setZerodhaConnected(true);
        setShowTokenModal(false);
        setInputToken('');
      } else {
        alert(data.error || 'Failed to authenticate Zerodha token');
      }
    } catch (err) {
      alert('Error connecting to backend server');
    } finally {
      setTokenLoading(false);
    }
  };

  const [marketStatusInfo, setMarketStatusInfo] = useState({ isOpen: false, statusText: 'MARKET CLOSED' });

  useEffect(() => {
    let eventSource;
    const streamUrl = 'http://localhost:5000/api/market/stream';

    try {
      eventSource = new EventSource(streamUrl);

      eventSource.onopen = () => {
        setSseConnected(true);
      };

      eventSource.onmessage = (e) => {
        setSseConnected(true);
        try {
          const payload = JSON.parse(e.data);

          if (payload.marketStatus) {
            setMarketStatusInfo(payload.marketStatus);
          }

          if (typeof payload.zerodhaConnected === 'boolean') {
            setZerodhaConnected(payload.zerodhaConnected);
          }

          if (payload.timestamp) {
            const timeStr = new Date(payload.timestamp).toLocaleTimeString('en-US', { hour12: false }) + ' IST';
            setLastFetched(timeStr);
          }

          if (payload.quotes) {
            const newQuotes = payload.quotes;

            setQuotes(prevQuotes => {
              const newTicks = {};
              
              Object.keys(newQuotes).forEach(sym => {
                const oldP = prevQuotes[sym]?.price || newQuotes[sym].price;
                const newP = newQuotes[sym].price;
                if (newP > oldP) newTicks[sym] = 'up';
                else if (newP < oldP) newTicks[sym] = 'down';
              });

              setTickStatus(newTicks);
              setTimeout(() => setTickStatus({}), 600);

              return { ...prevQuotes, ...newQuotes };
            });
          }
        } catch (err) {}
      };

      eventSource.onerror = () => {
        if (eventSource.readyState === EventSource.CLOSED) {
          setSseConnected(false);
        }
      };
    } catch (err) {
      console.error('SSE Stream Connection Error:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Dynamic Symbol Mapping Meta Helper
  const getSymbolMeta = (sym) => {
    if (sym === 'USD/INR') return { label: 'USD/INR', flag: 'IN', prefix: '₹' };
    return { label: sym, flag: 'IN', prefix: '₹' };
  };




  const symbolList = Object.keys(quotes);
  // Duplicate list twice for seamless infinite circular loop marquee animation
  const marqueeList = [...symbolList, ...symbolList];

  return (
    <header className="terminal-header">
      {/* Primary Navigation Row */}
      <div className="top-navbar">
        <div
          className="brand"
          onClick={onNavigateHome}
          style={{ cursor: 'pointer' }}
          title="Go to Dashboard Home"
        >
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 20L9 14L13 18L21 6" />
              <polyline points="16 6 21 6 21 11" />
              <line x1="6" y1="11" x2="6" y2="16" strokeWidth="2" opacity="0.6" />
              <line x1="18" y1="9" x2="18" y2="14" strokeWidth="2" opacity="0.6" />
            </svg>
          </div>
          <span style={{ fontSize: '1.35rem', letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)' }}>
            Alpha<span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>Terminal</span>
          </span>
        </div>



        <div className="nav-actions">
          {/* Live Fetch Timestamp Badge */}
          <span
            style={{
              fontSize: '0.725rem',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0, 242, 254, 0.08)',
              color: 'var(--color-primary)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Last Market Tick Timestamp"
          >
            <Clock size={12} />
            <span style={{ fontFamily: 'var(--font-mono)' }}>{lastFetched}</span>
          </span>

          {/* Single Clean Live Stream Indicator Badge */}
          <span
            style={{
              fontSize: '0.725rem',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: !sseConnected
                ? 'rgba(255, 171, 0, 0.12)'
                : marketStatusInfo.isOpen
                ? 'rgba(0, 200, 83, 0.12)'
                : 'rgba(255, 59, 48, 0.12)',
              color: !sseConnected
                ? '#ffab00'
                : marketStatusInfo.isOpen
                ? 'var(--color-accent-green)'
                : '#ff3b30',
              border: `1px solid ${
                !sseConnected
                  ? 'rgba(255, 171, 0, 0.3)'
                  : marketStatusInfo.isOpen
                  ? 'rgba(0, 200, 83, 0.3)'
                  : 'rgba(255, 59, 48, 0.3)'
              }`,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title={marketStatusInfo.message || 'Indian Market Status'}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: !sseConnected
                  ? '#ffab00'
                  : marketStatusInfo.isOpen
                  ? 'var(--color-accent-green)'
                  : '#ff3b30',
                boxShadow: sseConnected && marketStatusInfo.isOpen ? '0 0 8px var(--color-accent-green)' : 'none'
              }}
            />
            {!sseConnected
              ? 'CONNECTING...'
              : marketStatusInfo.isOpen
              ? 'LIVE STREAMING'
              : 'MARKET CLOSED'}
          </span>

          {/* Zerodha Kite Connect Status / 1-Click Login Popup Button */}
          {zerodhaConnected ? (
            <span
              style={{
                fontSize: '0.725rem',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(0, 200, 83, 0.12)',
                color: 'var(--color-accent-green)',
                border: '1px solid rgba(0, 200, 83, 0.3)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Zerodha KiteConnect active token verified"
            >
              <ShieldCheck size={13} />
              ZERODHA ACTIVE
            </span>
          ) : (
            <button
              onClick={handleZerodhaPopup}
              style={{
                fontSize: '0.725rem',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.2))',
                color: 'var(--color-primary)',
                border: '1px solid rgba(0, 242, 254, 0.4)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 10px rgba(0, 242, 254, 0.15)',
                transition: 'all 0.2s ease'
              }}
              title="Click to Connect Zerodha Kite Account (1-Click Popup)"
            >
              <Activity size={13} />
              ⚡ CONNECT ZERODHA
            </button>
          )}

          <ThemeToggle />

          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(prev => !prev)}
                className="btn btn-secondary"
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid var(--border-glass)'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
                    color: '#0b0e14',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user.name || 'USER'}</span>
                <ChevronDown size={14} style={{ transform: userDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '250px',
                    borderRadius: '16px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-glass)',
                    boxShadow: 'var(--shadow-glass), 0 10px 30px rgba(0,0,0,0.3)',
                    padding: '12px',
                    zIndex: 99999,
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)'
                  }}
                >
                  <div style={{ padding: '8px 12px 12px 12px', borderBottom: '1px solid var(--border-glass)', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px', wordBreak: 'break-all' }}>{user.email}</div>
                    <span className={`badge ${isDeveloper ? 'badge-developer' : 'badge-user'}`} style={{ marginTop: '8px', fontSize: '0.65rem' }}>
                      {isDeveloper ? 'DEVELOPER' : 'TRADER'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSessionModalOpen(true);
                      setUserDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Lock size={15} color="var(--color-primary)" />
                    <span>Session & Security</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'transparent',
                      border: 'none',
                      color: '#ff3b30',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginTop: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SessionSecurityModal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
      />

      {/* Dedicated Bloomberg/TradingView Infinite Circular Running Macro Ticker Tape */}
      <div className="ticker-tape-container">
        {/* Infinite Marquee Runner */}
        <div className="ticker-marquee-wrapper">
          <div className="ticker-marquee">
            {marqueeList.map((symbol, idx) => {
              const item = quotes[symbol] || {};
              const rawPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price || item.close || 0);
              const rawChange = typeof item.percent_change === 'number' ? item.percent_change : parseFloat(item.percent_change || item.change || 0);
              const isUp = rawChange >= 0;
              const tick = tickStatus[symbol];
              const meta = getSymbolMeta(symbol);

              const prevCloseCalc = rawPrice * (1 - (rawChange / 100));

              return (
                <div className="ticker-chip" key={`${symbol}-${idx}`}>
                  <MarketIcon type={meta.flag} />
                  <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.75rem' }}>{meta.label}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>LTP:</span>
                  <span style={{ fontWeight: 800, fontFamily: 'Inter, -apple-system, sans-serif', fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem', color: '#10b981' }}>
                    {meta.prefix}{rawPrice ? rawPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                    (Close: {meta.prefix}{prevCloseCalc ? prevCloseCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'})
                  </span>
                  <span
                    style={{
                      color: isUp ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      background: isUp ? 'rgba(0, 200, 83, 0.15)' : 'rgba(255, 59, 48, 0.15)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      transition: 'all 0.3s ease',
                      transform: tick ? 'scale(1.08)' : 'scale(1)'
                    }}
                  >
                    {isUp ? '+' : ''}{isNaN(rawChange) ? '0.00' : rawChange.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
