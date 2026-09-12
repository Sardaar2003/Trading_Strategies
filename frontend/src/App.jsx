import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { GlassCard } from './components/GlassCard';
import { SignInForm } from './components/SignInForm';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { TradingOverviewPage } from './components/TradingOverviewPage';
import { ThreeWaveStrategyPage } from './components/ThreeWaveStrategyPage';
import { ZerodhaDisconnectModal } from './components/ZerodhaDisconnectModal';
import { TrendingUp } from 'lucide-react';

export const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'trading_overview', 'three_wave_strategy'

  if (loading) {
    return (
      <div className="app-container">
        <ZerodhaDisconnectModal />
        <Navbar />
        <main className="main-content">
          <GlassCard style={{ textAlign: 'center', padding: '48px' }}>
            <div className="spin" style={{ display: 'inline-block', marginBottom: '16px' }}>
              <TrendingUp size={36} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Initializing Trading Session...</h3>
          </GlassCard>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <ZerodhaDisconnectModal />
      <Navbar
        currentPage={currentPage}
        onNavigateHome={() => setCurrentPage('dashboard')}
        onNavigateOverview={() => setCurrentPage('trading_overview')}
        onNavigateThreeWave={() => setCurrentPage('three_wave_strategy')}
      />

      <main
        className={`main-content ${user ? 'full-width-main' : ''}`}
        style={user ? { alignItems: 'flex-start', paddingTop: '28px', maxWidth: '100%', width: '100%', padding: '24px 36px' } : { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(80vh - 80px)' }}
      >
        {user ? (
          currentPage === 'trading_overview' ? (
            <TradingOverviewPage onBackToDashboard={() => setCurrentPage('dashboard')} />
          ) : currentPage === 'three_wave_strategy' ? (
            <ThreeWaveStrategyPage onBackToDashboard={() => setCurrentPage('dashboard')} />
          ) : (
            <Dashboard
              onOpenTradingOverview={() => setCurrentPage('trading_overview')}
              onOpenThreeWaveStrategy={() => setCurrentPage('three_wave_strategy')}
            />
          )
        ) : (
          <GlassCard className="auth-card" style={{ maxWidth: '460px', width: '100%', margin: '0 auto', padding: '36px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                Alpha<span style={{ color: 'var(--color-primary)' }}>Terminal</span> Portal
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                Institutional grade dual-theme trading terminal
              </p>
            </div>

            <SignInForm />
          </GlassCard>
        )}
      </main>
    </div>
  );
};

