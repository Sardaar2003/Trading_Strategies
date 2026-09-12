import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { MarketChart } from './MarketChart';
import { ArrowLeft, LayoutDashboard, Search } from 'lucide-react';

export const TradingOverviewPage = ({ onBackToDashboard }) => {
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');

  return (
    <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Standalone Page Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', padding: '8px 4px' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <LayoutDashboard size={18} />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
            Trading Overview Page
          </h2>
        </div>

        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-subtle)', background: 'var(--bg-card)', padding: '6px 14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          Standalone Page View
        </div>
      </div>

      {/* Main Market Chart & Search Component */}
      <MarketChart
        selectedSymbol={selectedSymbol}
        onSelectSymbol={(sym) => setSelectedSymbol(sym)}
      />
    </div>
  );
};
