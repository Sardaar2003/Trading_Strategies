import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, X, ShieldAlert } from 'lucide-react';

export const ZerodhaDisconnectModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [zerodhaConnected, setZerodhaConnected] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const checkStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/zerodha/status');
      const data = await res.json();
      if (data.success) {
        setZerodhaConnected(data.connected);
        if (!data.connected && !dismissed) {
          setIsOpen(true);
        } else if (data.connected) {
          setIsOpen(false);
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    checkStatus();
    const intervalId = setInterval(checkStatus, 3000);
    window.addEventListener('focus', checkStatus);

    let channel;
    try {
      channel = new BroadcastChannel('zerodha_auth_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'ZERODHA_AUTH_SUCCESS') {
          setZerodhaConnected(true);
          setIsOpen(false);
          checkStatus();
        }
      };
    } catch (e) {}

    const handleWindowMessage = (event) => {
      if (event.data?.type === 'ZERODHA_AUTH_SUCCESS') {
        setZerodhaConnected(true);
        setIsOpen(false);
        checkStatus();
      }
    };
    window.addEventListener('message', handleWindowMessage);

    let eventSource;
    try {
      eventSource = new EventSource('http://localhost:5000/api/market/stream');
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (typeof payload.zerodhaConnected === 'boolean') {
            setZerodhaConnected(payload.zerodhaConnected);
            if (payload.zerodhaConnected) {
              setIsOpen(false);
            }
          }
        } catch (err) {}
      };
    } catch (err) {}

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', checkStatus);
      window.removeEventListener('message', handleWindowMessage);
      if (channel) channel.close();
      if (eventSource) eventSource.close();
    };
  }, [dismissed]);

  const handleZerodhaPopup = () => {
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

  if (!isOpen || zerodhaConnected) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 7, 12, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px'
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '28px',
          borderRadius: '20px',
          background: 'var(--bg-card)',
          border: '1px solid rgba(255, 171, 0, 0.4)',
          boxShadow: 'var(--shadow-glass), 0 0 30px rgba(255, 171, 0, 0.15)',
          position: 'relative'
        }}
      >
        <button
          onClick={() => {
            setIsOpen(false);
            setDismissed(true);
          }}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-muted)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="Dismiss Modal"
        >
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'rgba(255, 171, 0, 0.15)',
              border: '1px solid rgba(255, 171, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffab00',
              boxShadow: '0 0 20px rgba(255, 171, 0, 0.2)'
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#ffab00',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'rgba(255, 171, 0, 0.12)',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 171, 0, 0.3)'
              }}
            >
              Action Required
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '6px 0 0 0', color: 'var(--text-main)' }}>
              Zerodha KiteConnect Disconnected
            </h3>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-input)',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid var(--border-glass)',
            marginBottom: '24px'
          }}
        >
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
            The top ticker tape and candlestick charts are currently operating in <strong>Fallback Mode</strong>.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '10px', margin: '10px 0 0 0' }}>
            Data displayed in the top ticker tape (<strong>NIFTY 50</strong>, <strong>BANKNIFTY</strong>, <strong>RELIANCE</strong>, <strong>TCS</strong>, <strong>INFY</strong>, <strong>USD/INR</strong>) and charts may not reflect accurate, live real-time market prices. Connect Zerodha to activate official streaming.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleZerodhaPopup}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
              color: '#0b0e14',
              fontWeight: 800,
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 6px 20px rgba(0, 242, 254, 0.35)'
            }}
          >
            <Activity size={18} />
            ⚡ Connect Zerodha Now For Accurate Live Data
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              setDismissed(true);
            }}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '12px',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              border: '1px solid var(--border-glass)',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            Continue & View Fallback Data
          </button>
        </div>
      </div>
    </div>
  );
};
