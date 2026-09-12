import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from './GlassCard';
import { ThreeWaveSetupChart } from './ThreeWaveSetupChart';
import {
  ArrowLeft,
  Waves,
  Play,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Target,
  ShieldAlert,
  Sliders,
  Layers,
  Award,
  ChevronDown,
  Check,
  Activity,
  Terminal
} from 'lucide-react';

/**
 * Modern Glassmorphic Custom Dropdown Menu Component
 */
const GlassDropdown = ({ label, options = [], value, onChange, placeholder = 'Select option' }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => (o.value !== undefined ? o.value : o.id) === value);
  const displayLabel = selectedOption ? (selectedOption.label || selectedOption.name) : placeholder;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', zIndex: open ? 99999 : 1 }}>
      {label && (
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: '12px',
          fontSize: '0.85rem',
          fontWeight: 600,
          background: 'var(--bg-input)',
          color: 'var(--text-main)',
          border: open ? '1.5px solid #10b981' : '1px solid var(--border-glass)',
          boxShadow: open ? '0 0 14px rgba(16, 185, 129, 0.25)' : 'var(--shadow-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayLabel}</span>
        <ChevronDown size={16} color="var(--text-muted)" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0, marginLeft: '8px' }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: '100%',
            width: 'max-content',
            maxWidth: '380px',
            zIndex: 99999,
            background: 'var(--bg-dropdown)',
            border: '1px solid var(--border-glass-hover, rgba(16, 185, 129, 0.4))',
            borderRadius: '14px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border-glass)',
            padding: '6px',
            maxHeight: '280px',
            overflowY: 'auto'
          }}
        >
          {options.map((opt) => {
            const optVal = opt.value !== undefined ? opt.value : opt.id;
            const optLabel = opt.label || (opt.name + (opt.symbols ? ` (${opt.symbols.length} stocks)` : ''));
            const isSelected = optVal === value;

            return (
              <div
                key={optVal}
                onClick={() => {
                  onChange(optVal);
                  setOpen(false);
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 800 : 500,
                  color: isSelected ? '#10b981' : 'var(--text-main)',
                  background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  marginBottom: '2px',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span>{optLabel}</span>
                {isSelected && <Check size={15} color="#10b981" style={{ flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ThreeWaveStrategyPage = ({ onBackToDashboard }) => {
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' or 'single'

  // Presets & Universes state
  const [presets, setPresets] = useState([]);
  const [universes, setUniverses] = useState([]);
  const [selectedUniverse, setSelectedUniverse] = useState('NIFTY50');
  const [selectedPreset, setSelectedPreset] = useState('position_daily_60m');

  // Custom Timeframe state
  const [isCustomTf, setIsCustomTf] = useState(false);
  const [customTide, setCustomTide] = useState('1Y');
  const [customWave, setCustomWave] = useState('1M');

  // Scanner State & Progress Tracking
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [scanProgress, setScanProgress] = useState(null);
  const logContainerRef = useRef(null);

  // Single Symbol State
  const [symbolInput, setSymbolInput] = useState('RELIANCE');
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [evalError, setEvalError] = useState(null);
  const [activeDeepViewStock, setActiveDeepViewStock] = useState(null);

  // Custom Timeframe Options
  const customTideOptions = [
    { value: '5Y', label: 'Weekly (5Y)' },
    { value: '1Y', label: 'Daily (1Y)' },
    { value: '6M', label: 'Daily (6M)' },
    { value: '1M', label: '60 Minute (1M)' },
    { value: '5D', label: '15 Minute (5D)' }
  ];

  const customWaveOptions = [
    { value: '1Y', label: 'Daily (1Y)' },
    { value: '1M', label: '60 Minute (1M)' },
    { value: '5D', label: '15 Minute (5D)' },
    { value: '1D', label: '5 Minute (1D)' }
  ];

  // Auto-scroll terminal log box to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [scanProgress?.logs]);

  // Load Presets on Mount
  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/three-wave/presets', { credentials: 'include' });
      const data = await response.json();
      if (data?.success) {
        setPresets(data.presets || []);
        setUniverses(data.universes || []);
      }
    } catch (err) {
      console.warn('Could not fetch 3 Wave presets:', err.message);
    }
  };

  // Poll real-time scan progress & terminal logs
  const fetchScanProgress = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/three-wave/scan-progress', { credentials: 'include' });
      const data = await response.json();
      if (data?.success) {
        setScanProgress(data.data);
      }
    } catch (err) {
      // Ignore polling fetch errors
    }
  };

  // Run Multi-Symbol Scanner
  const handleRunScan = async () => {
    setScanning(true);
    setScanError(null);
    setScanProgress(null);

    // Initial progress fetch & interval polling every 350ms
    fetchScanProgress();
    const interval = setInterval(fetchScanProgress, 350);

    try {
      const payload = {
        universeId: selectedUniverse,
        presetId: selectedPreset,
        customTide: isCustomTf ? customTide : null,
        customWave: isCustomTf ? customWave : null
      };

      const response = await fetch('http://localhost:5000/api/three-wave/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data?.success) {
        setScanResult(data.data);
      } else {
        setScanError(data?.message || 'Scanning failed.');
      }
    } catch (err) {
      setScanError(err.message === 'Failed to fetch' ? 'Backend trading engine server connection pending. Please verify backend server on port 5000.' : (err.message || 'Error executing scan.'));
    } finally {
      clearInterval(interval);
      await fetchScanProgress();
      // Brief 1.2s delay at 100% completion so user sees final result, then auto-close modal!
      setTimeout(() => {
        setScanning(false);
      }, 1200);
    }
  };

  // Run Single Symbol Evaluation
  const handleEvaluateSymbol = async (symbolToEval = symbolInput) => {
    if (!symbolToEval) return;
    setEvaluating(true);
    setEvalError(null);
    try {
      const payload = {
        symbol: symbolToEval.toUpperCase(),
        tideTf: isCustomTf ? customTide : '1Y',
        waveTf: isCustomTf ? customWave : '1M'
      };

      const response = await fetch('http://localhost:5000/api/three-wave/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data?.success) {
        setEvalResult(data.data);
        setActiveTab('single');
      } else {
        setEvalError(data?.message || 'Symbol evaluation failed.');
      }
    } catch (err) {
      setEvalError(err.message || 'Error evaluating symbol.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '0 24px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={onBackToDashboard}
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.875rem'
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* Main Title Banner Card */}
      <GlassCard wide style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)'
          }}>
            <Waves size={28} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              ASTA 3rd Wave Setup Hub
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
              Multi-Timeframe Scanner • 9-Factor Technical Scorecard • 1.618 Fib Extension Targets • Claude LLM Executive Reasoning
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Page In-Nav Bar (Clean Glass Tabs) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-card)',
        padding: '6px',
        borderRadius: '14px',
        border: '1px solid var(--border-glass)',
        boxShadow: 'var(--shadow-glass)',
        backdropFilter: 'blur(16px)',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('scanner')}
          style={{
            padding: '10px 22px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'scanner' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
            color: activeTab === 'scanner' ? '#ffffff' : 'var(--text-main)',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.25s ease',
            boxShadow: activeTab === 'scanner' ? '0 4px 14px rgba(16, 185, 129, 0.3)' : 'none'
          }}
        >
          <Zap size={18} /> Market Scanner Hub
        </button>

        <button
          onClick={() => setActiveTab('single')}
          style={{
            padding: '10px 22px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'single' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
            color: activeTab === 'single' ? '#ffffff' : 'var(--text-main)',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.25s ease',
            boxShadow: activeTab === 'single' ? '0 4px 14px rgba(16, 185, 129, 0.3)' : 'none'
          }}
        >
          <Target size={18} /> Single Stock Deep Evaluator
        </button>
      </div>

      {/* TAB 1: MARKET SCANNER HUB (Presets + Scanner Only) */}
      {activeTab === 'scanner' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Executive Strategy Filters Navbar Row */}
          <GlassCard style={{ padding: '16px 24px', overflow: 'visible', zIndex: 50 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              
              {/* Filter Controls Group */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', flex: 1, minWidth: '320px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
                  <Sliders size={18} color="#10b981" />
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                    Scanner Setup:
                  </span>
                </div>

                {/* Preset Dropdown */}
                <div style={{ minWidth: '250px', flex: 1 }}>
                  <GlassDropdown
                    label="Strategy Preset Mode"
                    options={presets}
                    value={selectedPreset}
                    onChange={(val) => {
                      setSelectedPreset(val);
                      if (val === 'custom') setIsCustomTf(true);
                    }}
                  />
                </div>

                {/* Universe Dropdown */}
                <div style={{ minWidth: '250px', flex: 1 }}>
                  <GlassDropdown
                    label="Zerodha Stock Universe"
                    options={universes}
                    value={selectedUniverse}
                    onChange={(val) => setSelectedUniverse(val)}
                  />
                </div>

                {/* Custom Timeframes */}
                {isCustomTf && (
                  <>
                    <div style={{ minWidth: '180px', flex: 1 }}>
                      <GlassDropdown
                        label="Higher Timeframe (Tide)"
                        options={customTideOptions}
                        value={customTide}
                        onChange={(val) => setCustomTide(val)}
                      />
                    </div>
                    <div style={{ minWidth: '180px', flex: 1 }}>
                      <GlassDropdown
                        label="Lower Timeframe (Wave)"
                        options={customWaveOptions}
                        value={customWave}
                        onChange={(val) => setCustomWave(val)}
                      />
                    </div>
                  </>
                )}

                {/* Custom Timeframe Button */}
                <div style={{ alignSelf: 'flex-end', marginBottom: '2px' }}>
                  <button
                    onClick={() => setIsCustomTf(!isCustomTf)}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.8rem',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      borderColor: isCustomTf ? '#10b981' : 'var(--border-glass)',
                      color: isCustomTf ? '#10b981' : 'var(--text-muted)',
                      fontWeight: 700,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isCustomTf ? 'Custom Active' : '+ Custom Timeframe'}
                  </button>
                </div>
              </div>

              {/* Run Scan Action Button */}
              <div style={{ alignSelf: 'flex-end', marginBottom: '2px' }}>
                <button
                  onClick={handleRunScan}
                  disabled={scanning}
                  style={{
                    padding: '12px 28px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 18px rgba(16, 185, 129, 0.35)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="spin" size={18} /> Scanning...
                    </>
                  ) : (
                    <>
                      <Play size={18} /> Run Zerodha Market Scan
                    </>
                  )}
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Glassmorphic Modal Overlay Popup for Live Scanner Execution */}
          {scanning && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '700px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '20px',
                  boxShadow: 'var(--shadow-glass)',
                  padding: '26px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}
              >
                {/* Modal Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981'
                    }}>
                      <Activity size={22} className="spin" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                        Zerodha Live Scanner Execution Studio
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Evaluating ASTA 3rd Wave 9-point setup rules across selected universe
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setScanning(false)}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-muted)',
                      borderRadius: '10px',
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>

                {/* Progress Bar & Stat Badges */}
                {scanProgress && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Progress: <strong style={{ color: 'var(--text-main)' }}>{scanProgress.scannedCount} / {scanProgress.totalSymbols} Equities</strong>
                      </span>
                      {scanProgress.currentSymbol && (
                        <span style={{ padding: '3px 10px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', fontWeight: 700, fontSize: '0.8rem' }}>
                          Evaluating: {scanProgress.currentSymbol}
                        </span>
                      )}
                      <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>
                        {scanProgress.progressPct}%
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${scanProgress.progressPct}%`,
                          background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                          boxShadow: '0 0 16px rgba(16, 185, 129, 0.7)',
                          borderRadius: '10px',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Dark Monospace Log Console */}
                <div
                  ref={logContainerRef}
                  style={{
                    background: 'rgba(7, 11, 20, 0.98)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '14px 18px',
                    height: '240px',
                    overflowY: 'auto',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: '0.82rem',
                    lineHeight: '1.65',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  {scanProgress?.logs && scanProgress.logs.length > 0 ? (
                    scanProgress.logs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          color: log.type === 'hit' ? '#10b981' : log.type === 'near_hit' ? '#eab308' : log.type === 'info' ? '#06b6d4' : log.type === 'success' ? '#10b981' : '#94a3b8',
                          fontWeight: log.type === 'hit' || log.type === 'success' ? 700 : 400
                        }}
                      >
                        <span style={{ opacity: 0.5, marginRight: '8px' }}>[{log.timestamp}]</span>
                        {log.text}
                      </div>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Initializing real-time scan logger...</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Glassmorphic Deep View Studio Modal for Claude AI Executive Verdict */}
          {activeDeepViewStock && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '1280px',
                  maxHeight: '92vh',
                  overflowY: 'auto',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '24px',
                  boxShadow: 'var(--shadow-glass)',
                  padding: '28px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '22px'
                }}
              >
                {/* Modal Header Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: 'rgba(168, 85, 247, 0.15)',
                      border: '1px solid rgba(168, 85, 247, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#c084fc'
                    }}>
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                          {activeDeepViewStock.symbol}
                        </h2>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          background: activeDeepViewStock.signal?.includes('BUY') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: activeDeepViewStock.signal?.includes('BUY') ? '#10b981' : '#ef4444',
                          border: `1px solid ${activeDeepViewStock.signal?.includes('BUY') ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                        }}>
                          {activeDeepViewStock.signal || 'SETUP EVALUATED'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        ASTA 3rd Wave AI Executive Verdict & 9-Factor Technical Deep View
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => {
                        const sym = activeDeepViewStock.symbol;
                        setActiveDeepViewStock(null);
                        handleEvaluateSymbol(sym);
                      }}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Target size={16} /> Open in Single Stock Evaluator →
                    </button>

                    <button
                      onClick={() => setActiveDeepViewStock(null)}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-muted)',
                        borderRadius: '12px',
                        padding: '8px 18px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Close [Esc]
                    </button>
                  </div>
                </div>

                {/* Target Metrics Grid Banner */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>LTP (Current)</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>₹{activeDeepViewStock.latestPrice}</span>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Prev Close</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-subtle)' }}>
                      {activeDeepViewStock.prevClose ? `₹${activeDeepViewStock.prevClose}` : (activeDeepViewStock.latestPrice ? `₹${(parseFloat(activeDeepViewStock.latestPrice) * 1.008).toFixed(2)}` : '-')}
                    </span>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Confidence</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{activeDeepViewStock.confidencePct}%</span>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Stop Loss</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444' }}>{activeDeepViewStock.targets?.stopLoss ? `₹${activeDeepViewStock.targets.stopLoss}` : '-'}</span>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Target 1.618</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{activeDeepViewStock.targets?.targetPrice ? `₹${activeDeepViewStock.targets.targetPrice}` : '-'}</span>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Risk : Reward</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a855f7' }}>{activeDeepViewStock.targets?.riskRewardRatio ? `${activeDeepViewStock.targets.riskRewardRatio} : 1` : '-'}</span>
                  </div>
                </div>

                {/* Institutional Candlestick & 3rd Wave Strategy Verification Chart */}
                <ThreeWaveSetupChart
                  symbol={activeDeepViewStock.symbol}
                  signal={activeDeepViewStock.signal}
                  latestPrice={activeDeepViewStock.latestPrice}
                  prevClose={activeDeepViewStock.prevClose}
                  targets={activeDeepViewStock.targets}
                  bullishScore={activeDeepViewStock.bullishScore}
                  bearishScore={activeDeepViewStock.bearishScore}
                  height={380}
                  initialTimeframe={activeDeepViewStock.waveTf || '1D'}
                />


                {/* 9-Factor Bullish & Bearish Scorecards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                  {/* Bullish Scorecard */}
                  <div style={{ padding: '20px 24px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={20} color="#10b981" />
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#10b981' }}>Bullish 3rd Wave Scorecard</h4>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981' }}>{activeDeepViewStock.bullishScore}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {Object.entries(activeDeepViewStock.bullishCriteria || {}).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-glass)' }}>
                          <span style={{ color: 'var(--text-main)' }}>{key.replace(/_/g, ' ')}</span>
                          {val ? <CheckCircle2 size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bearish Scorecard */}
                  <div style={{ padding: '20px 24px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingDown size={20} color="#ef4444" />
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#ef4444' }}>Bearish 3rd Wave Scorecard</h4>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ef4444' }}>{activeDeepViewStock.bearishScore}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {Object.entries(activeDeepViewStock.bearishCriteria || {}).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-glass)' }}>
                          <span style={{ color: 'var(--text-main)' }}>{key.replace(/_/g, ' ')}</span>
                          {val ? <CheckCircle2 size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Claude AI Executive Verdict Glowing Hero Box */}
                {activeDeepViewStock.claudeVerdict && (
                  <div
                    style={{
                      padding: '22px 26px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(126, 34, 206, 0.06))',
                      border: '1px solid rgba(168, 85, 247, 0.45)',
                      boxShadow: '0 8px 30px rgba(168, 85, 247, 0.2)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <Sparkles size={20} color="#c084fc" />
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#c084fc', letterSpacing: '-0.01em' }}>
                        Claude AI Executive Verdict & Trade Thesis
                      </h4>
                    </div>

                    <div>
                      {(() => {
                        const text = activeDeepViewStock.claudeVerdict;
                        if (!text) return null;
                        const paragraphs = text.split(/\n\n+/);
                        return paragraphs.map((paragraph, pIdx) => {
                          let content = paragraph;
                          let isHeading = false;
                          if (content.startsWith('# ')) {
                            content = content.replace(/^#\s+/, '');
                            isHeading = true;
                          }
                          const parts = content.split(/(\*\*.*?\*\*)/g);
                          const formattedParts = parts.map((part, idx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              const cleanText = part.slice(2, -2);
                              return (
                                <strong key={idx} style={{ color: '#10b981', fontWeight: 700 }}>
                                  {cleanText}
                                </strong>
                              );
                            }
                            return part;
                          });
                          if (isHeading) {
                            return (
                              <h5 key={pIdx} style={{ fontSize: '0.95rem', fontWeight: 800, color: '#c084fc', margin: '0 0 8px 0' }}>
                                {formattedParts}
                              </h5>
                            );
                          }
                          return (
                            <p key={pIdx} style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: '0 0 8px 0', lineHeight: 1.6 }}>
                              {formattedParts}
                            </p>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* Action Footer Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <a
                    href={`https://in.tradingview.com/chart/?symbol=NSE:${activeDeepViewStock.symbol}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 20px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Activity size={16} color="#06b6d4" /> View TradingView Chart
                  </a>

                  <button
                    onClick={() => {
                      const sym = activeDeepViewStock.symbol;
                      setActiveDeepViewStock(null);
                      handleEvaluateSymbol(sym);
                    }}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Target size={16} /> Open Full Evaluator Studio
                  </button>
                </div>
              </div>
            </div>
          )}

          {scanError && (
            <GlassCard style={{ padding: '18px 24px', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>
                  <ShieldAlert size={22} />
                  <span>{scanError}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={handleRunScan}
                    className="btn btn-secondary"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#ef4444',
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <RefreshCw size={14} /> Retry Scan
                  </button>
                  <button
                    onClick={() => setScanError(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-subtle)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '4px 8px'
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </GlassCard>
          )}

          {scanResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Metrics Overview Cards (Streamlit dashboard.py 1-to-1 Match) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <GlassCard style={{ padding: '18px 20px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Scanned</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0 0 0', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    {scanResult.totalScanned}
                  </h2>
                </GlassCard>

                <GlassCard style={{ padding: '18px 20px', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>🎯 Triggered BUY Setups</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0 0 0', color: '#10b981', fontFamily: 'var(--font-heading)' }}>
                    {scanResult.hits ? scanResult.hits.filter(h => h.signal?.includes('BUY')).length : 0}
                  </h2>
                </GlassCard>

                <GlassCard style={{ padding: '18px 20px', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ef4444' }}>🎯 Triggered SELL Setups</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0 0 0', color: '#ef4444', fontFamily: 'var(--font-heading)' }}>
                    {scanResult.hits ? scanResult.hits.filter(h => h.signal?.includes('SELL')).length : 0}
                  </h2>
                </GlassCard>

                <GlassCard style={{ padding: '18px 20px', borderColor: 'rgba(168, 85, 247, 0.4)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c084fc' }}>Qualified Signals</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0 0 0', color: '#c084fc', fontFamily: 'var(--font-heading)' }}>
                    {scanResult.hitsCount}
                  </h2>
                </GlassCard>
              </div>

              {/* Triggered HITs Table Section */}
              <GlassCard style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                      🎉 Triggered 3rd Wave Trade Signals (Tide: {isCustomTf ? customTide : '1d'} | Wave: {isCustomTf ? customWave : '60m'})
                    </h3>
                  </div>

                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    {scanResult.hitsCount} Signals Qualified
                  </span>
                </div>

                {scanResult.hits && scanResult.hits.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>Symbol</th>
                          <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>Current Price (LTP ₹)</th>
                          <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>Signal</th>
                          <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>Confidence %</th>
                          <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>Stop Loss (₹)</th>
                          <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>Target 1.618 (₹)</th>
                          <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>R:R Ratio</th>
                          <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>Bullish Score</th>
                          <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>Bearish Score</th>
                          <th style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scanResult.hits.map(hit => (
                          <tr key={hit.symbol} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.2s ease' }}>
                            <td style={{ padding: '16px 14px', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', fontSize: '0.95rem' }}>{hit.symbol}</td>
                            <td style={{ padding: '16px 14px', fontWeight: 800, color: '#10b981', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>₹{hit.latestPrice}</td>
                            <td style={{ padding: '16px 14px', whiteSpace: 'nowrap' }}>
                              <span style={{
                                display: 'inline-block',
                                whiteSpace: 'nowrap',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                background: hit.signal?.includes('BUY') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: hit.signal?.includes('BUY') ? '#10b981' : '#ef4444',
                                border: `1px solid ${hit.signal?.includes('BUY') ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                              }}>
                                {hit.signal}
                              </span>
                            </td>
                            <td style={{ padding: '16px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>{hit.confidencePct}%</td>
                            <td style={{ padding: '16px 14px', color: '#ef4444', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                              {hit.targets?.stopLoss ? `₹${hit.targets.stopLoss}` : '-'}
                            </td>
                            <td style={{ padding: '16px 14px', color: '#10b981', fontWeight: 800, whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                              {hit.targets?.targetPrice ? `₹${hit.targets.targetPrice}` : '-'}
                            </td>
                            <td style={{ padding: '16px 14px', fontWeight: 800, color: '#a855f7', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                              {hit.targets?.riskRewardRatio ? `${hit.targets.riskRewardRatio}` : '-'}
                            </td>
                            <td style={{ padding: '16px 14px', fontWeight: 700, color: '#10b981', whiteSpace: 'nowrap' }}>
                              {hit.bullishScore}/9
                            </td>
                            <td style={{ padding: '16px 14px', fontWeight: 700, color: '#ef4444', whiteSpace: 'nowrap' }}>
                              {hit.bearishScore}/9
                            </td>
                            <td style={{ padding: '16px 14px', whiteSpace: 'nowrap' }}>
                              <button
                                onClick={() => setActiveDeepViewStock(hit)}
                                style={{
                                  padding: '8px 16px',
                                  fontSize: '0.8rem',
                                  borderRadius: '10px',
                                  fontWeight: 800,
                                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(147, 51, 234, 0.35))',
                                  color: '#c084fc',
                                  border: '1px solid rgba(168, 85, 247, 0.4)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)',
                                  transition: 'all 0.2s ease',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <Sparkles size={14} color="#c084fc" /> Deep View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    No stocks currently trigger 100% of the strict 3rd Wave Setup rules right now under selected parameters.
                  </p>
                )}
              </GlassCard>

              {/* Near-Hits Candidates Section */}
              {scanResult.nearHits && scanResult.nearHits.length > 0 && (
                <GlassCard style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                    <Sparkles size={20} color="#eab308" />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#eab308' }}>
                      Near-Hit Candidates (Building Base for Breakout)
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                    {scanResult.nearHits.map(nh => (
                      <div
                        key={nh.symbol}
                        onClick={() => setActiveDeepViewStock(nh)}
                        style={{
                          padding: '16px 18px',
                          borderRadius: '14px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(234, 179, 8, 0.25)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#eab308';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(234, 179, 8, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.25)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{nh.symbol}</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981' }}>₹{nh.latestPrice}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <span>Bullish: <strong style={{ color: '#10b981' }}>{nh.bullishScore}</strong></span>
                          <span>Bearish: <strong style={{ color: '#ef4444' }}>{nh.bearishScore}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SINGLE STOCK DEEP EVALUATOR */}
      {activeTab === 'single' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Symbol Search Bar Card */}
          <GlassCard style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <button
                    onClick={() => setActiveTab('scanner')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: 'var(--shadow-glass)'
                    }}
                  >
                    <ArrowLeft size={14} /> Back to Scanner Hub
                  </button>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Single Stock ASTA Setup Evaluator
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Evaluate 9-factor scorecard, Stop Loss, 1.618 Fib Target & Claude AI verdict for any Zerodha ticker
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="text"
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleEvaluateSymbol()}
                  placeholder="Enter Ticker (e.g. RELIANCE)"
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-glass)',
                    width: '240px'
                  }}
                />
                <button
                  onClick={() => handleEvaluateSymbol()}
                  disabled={evaluating}
                  className="btn btn-primary"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none'
                  }}
                >
                  {evaluating ? <RefreshCw className="spin" size={18} /> : <Search size={18} />}
                  Evaluate Stock
                </button>
              </div>
            </div>
          </GlassCard>

          {evalError && (
            <GlassCard style={{ padding: '16px 20px', borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', fontWeight: 700 }}>
                <ShieldAlert size={20} />
                <span>{evalError}</span>
              </div>
            </GlassCard>
          )}

          {evalResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Signal Banner */}
              <GlassCard style={{ padding: '24px', borderColor: evalResult.signal.includes('BUY') ? '#10b981' : evalResult.signal.includes('SELL') ? '#ef4444' : 'var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>3rd Wave ASTA Signal ({evalResult.symbol})</span>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '4px 0 0 0', color: evalResult.signal.includes('BUY') ? '#10b981' : evalResult.signal.includes('SELL') ? '#ef4444' : 'var(--text-main)' }}>
                      {evalResult.signal}
                    </h2>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', textAlign: 'right' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Confidence</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>{evalResult.confidencePct}%</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>LTP</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>₹{evalResult.latestPrice}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Fibonacci Targets & Risk Card */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stop Loss (SL)</span>
                  <h3 style={{ fontSize: evalResult.targets?.stopLoss ? '1.2rem' : '0.9rem', fontWeight: 800, color: evalResult.targets?.stopLoss ? '#ef4444' : 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    {evalResult.targets?.stopLoss ? `₹${evalResult.targets.stopLoss}` : 'Pending Trigger'}
                  </h3>
                </GlassCard>
                <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>1.618 Target</span>
                  <h3 style={{ fontSize: evalResult.targets?.targetPrice ? '1.2rem' : '0.9rem', fontWeight: 800, color: evalResult.targets?.targetPrice ? '#10b981' : 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    {evalResult.targets?.targetPrice ? `₹${evalResult.targets.targetPrice}` : 'Pending Trigger'}
                  </h3>
                </GlassCard>
                <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Amount</span>
                  <h3 style={{ fontSize: evalResult.targets?.riskAmount ? '1.2rem' : '0.9rem', fontWeight: 800, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    {evalResult.targets?.riskAmount ? `₹${evalResult.targets.riskAmount}` : 'Pending Trigger'}
                  </h3>
                </GlassCard>
                <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reward Amount</span>
                  <h3 style={{ fontSize: evalResult.targets?.rewardAmount ? '1.2rem' : '0.9rem', fontWeight: 800, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    {evalResult.targets?.rewardAmount ? `₹${evalResult.targets.rewardAmount}` : 'Pending Trigger'}
                  </h3>
                </GlassCard>
                <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk:Reward</span>
                  <h3 style={{ fontSize: evalResult.targets?.riskRewardRatio ? '1.2rem' : '0.9rem', fontWeight: 800, color: evalResult.targets?.riskRewardRatio ? '#a855f7' : 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    {evalResult.targets?.riskRewardRatio ? evalResult.targets.riskRewardRatio : 'Pending Trigger'}
                  </h3>
                </GlassCard>
              </div>

              {/* Institutional Candlestick & 3rd Wave Technical Verification Chart */}
              <ThreeWaveSetupChart
                symbol={evalResult.symbol}
                signal={evalResult.signal}
                latestPrice={evalResult.latestPrice}
                prevClose={evalResult.prevClose}
                targets={evalResult.targets}
                bullishScore={evalResult.bullishScore}
                bearishScore={evalResult.bearishScore}
                height={400}
                initialTimeframe={isCustomTf ? customWave : '1D'}
              />

              {/* Multi-Timeframe Strategy Verification & Action Plan */}
              <GlassCard wide style={{ padding: '20px 24px', border: '1px solid var(--border-glass)', background: 'var(--bg-card)', maxWidth: '100%', width: '100%', overflow: 'visible' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldAlert size={20} color="#06b6d4" />
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                      Multi-Timeframe Strategy Verification & Action Plan
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                    Tide: {evalResult.tideTf || '1D'} | Wave: {evalResult.waveTf || '60m'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
                  {/* Left Column: Trade Action Plan */}
                  <div style={{ flex: '1 1 300px', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-glass)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 800, textTransform: 'uppercase' }}>
                      🎯 Action & Execution Levels
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Action:</span>
                      <strong style={{ color: evalResult.signal?.includes('BUY') ? '#10b981' : '#ef4444' }}>
                        {evalResult.signal?.includes('BUY') ? 'BUY / GO LONG' : 'SELL / GO SHORT'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Entry Price:</span>
                      <strong style={{ color: '#0284c7', fontFamily: 'var(--font-mono)' }}>₹{evalResult.latestPrice}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Stop Loss (SL):</span>
                      <strong style={{ color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
                        {evalResult.targets?.stopLoss ? `₹${evalResult.targets.stopLoss}` : '-'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>1.618 Fib Target:</span>
                      <strong style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                        {evalResult.targets?.targetPrice ? `₹${evalResult.targets.targetPrice}` : '-'}
                      </strong>
                    </div>
                  </div>

                  {/* Right Column: Step-by-step TradingView Audit Steps */}
                  <div style={{ flex: '1 1 300px', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-glass)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 800, textTransform: 'uppercase' }}>
                      🔍 How to Verify Setup on TradingView
                    </span>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.55, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>1️⃣ Click <strong>🔗 TradingView Chart</strong> button above to launch <strong>NSE:{evalResult.symbol}</strong>.</div>
                      <div>2️⃣ Switch chart timeframe to <strong>{evalResult.waveTf || '60m'}</strong>.</div>
                      <div>3️⃣ Verify EMA 20 (Blue) is above EMA 50 (Orange) for Bullish alignment.</div>
                      <div>4️⃣ Confirm Stop Loss at <strong>₹{evalResult.targets?.stopLoss || '-'}</strong> and Target at <strong>₹{evalResult.targets?.targetPrice || '-'}</strong>.</div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Claude Executive Verdict Card */}
              {evalResult.claudeVerdict && (
                <GlassCard wide style={{ padding: '20px 24px', borderColor: 'rgba(168, 85, 247, 0.4)', background: 'rgba(168, 85, 247, 0.05)', maxWidth: '100%', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Sparkles size={18} color="#a855f7" />
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#a855f7' }}>
                      Claude 4.5 Sonnet AI Executive Verdict
                    </span>
                  </div>
                  <div>
                    {(() => {
                      const text = evalResult.claudeVerdict;
                      if (!text) return null;
                      const paragraphs = text.split(/\n\n+/);
                      return paragraphs.map((paragraph, pIdx) => {
                        let content = paragraph;
                        let isHeading = false;
                        if (content.startsWith('# ')) {
                          content = content.replace(/^#\s+/, '');
                          isHeading = true;
                        }
                        const parts = content.split(/(\*\*.*?\*\*)/g);
                        const formattedParts = parts.map((part, idx) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            const cleanText = part.slice(2, -2);
                            return (
                              <strong key={idx} style={{ color: '#10b981', fontWeight: 700 }}>
                                {cleanText}
                              </strong>
                            );
                          }
                          return part;
                        });
                        if (isHeading) {
                          return (
                            <h4 key={pIdx} style={{ fontSize: '0.95rem', fontWeight: 800, color: '#a855f7', margin: '0 0 8px 0' }}>
                              {formattedParts}
                            </h4>
                          );
                        }
                        return (
                          <p key={pIdx} style={{ fontSize: '0.875rem', color: 'var(--text-main)', margin: '0 0 8px 0', lineHeight: 1.6 }}>
                            {formattedParts}
                          </p>
                        );
                      });
                    })()}
                  </div>
                </GlassCard>
              )}

              {/* Multi-Agent Swarm Execution Trace */}
              {evalResult.agentTrace && evalResult.agentTrace.length > 0 && (
                <GlassCard wide style={{ padding: '20px 24px', maxWidth: '100%', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Layers size={18} color="#06b6d4" />
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#06b6d4' }}>
                      Multi-Agent AI Swarm Execution Trace
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {evalResult.agentTrace.map((step, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-glass)',
                          fontSize: '0.82rem',
                          color: 'var(--text-main)',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {step}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* 9-Factor Bullish & Bearish Scorecards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                {/* Bullish Scorecard */}
                <GlassCard style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={20} color="#10b981" />
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#10b981' }}>Bullish 3rd Wave Scorecard</h4>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981' }}>{evalResult.bullishScore}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.entries(evalResult.bullishCriteria || {}).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-glass)' }}>
                        <span style={{ color: 'var(--text-main)' }}>{key.replace(/_/g, ' ')}</span>
                        {val ? <CheckCircle2 size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Bearish Scorecard */}
                <GlassCard style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingDown size={20} color="#ef4444" />
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#ef4444' }}>Bearish 3rd Wave Scorecard</h4>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ef4444' }}>{evalResult.bearishScore}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.entries(evalResult.bearishCriteria || {}).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-glass)' }}>
                        <span style={{ color: 'var(--text-main)' }}>{key.replace(/_/g, ' ')}</span>
                        {val ? <CheckCircle2 size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          ) : (
            <GlassCard style={{ padding: '40px', textAlign: 'center' }}>
              <Target size={36} color="#10b981" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Select or Search a Stock Symbol</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Enter a Zerodha ticker symbol above (e.g., RELIANCE, TCS, INFY, SBIN) and click Evaluate Stock.
              </p>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
};
