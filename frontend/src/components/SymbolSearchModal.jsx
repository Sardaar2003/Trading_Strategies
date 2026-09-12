import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from './GlassCard';
import { StockLogo } from './StockLogo';
import { Search, X, Plus, Check, ChevronDown, Crosshair, Trash2, Filter } from 'lucide-react';
import { API_BASE } from '../config/api';

export const SymbolSearchModal = ({
  isOpen,
  onClose,
  onSelectSymbol,
  initialQuery = '',
  initialCategory = 'Stocks',
  initialExchange = 'ALL'
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedExchange, setSelectedExchange] = useState(initialExchange);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const inputRef = useRef(null);

  const categories = [
    'All',
    'Stocks',
    'Funds',
    'Futures',
    'Forex',
    'Crypto',
    'Indices',
    'Bonds',
    'Economy',
    'Options'
  ];

  const [activeDropdown, setActiveDropdown] = useState(null); // 'exchange' | 'type' | 'sector' | null
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');

  const exchangesList = [
    { label: 'All Exchanges (NSE, BSE)', value: 'ALL' },
    { label: 'NSE (National Stock Exchange)', value: 'NSE' },
    { label: 'BSE (Bombay Stock Exchange)', value: 'BSE' },
    { label: 'CDS (Currency Derivatives)', value: 'CDS' },
    { label: 'MCX (Commodities Exchange)', value: 'MCX' }
  ];

  const typesList = [
    { label: 'All Types', value: 'ALL' },
    { label: 'Equity Stocks', value: 'EQ' },
    { label: 'Indices', value: 'IND' },
    { label: 'Futures', value: 'FUT' },
    { label: 'Options', value: 'OPT' }
  ];

  const sectorsList = [
    { label: 'All Sectors', value: 'ALL' },
    { label: 'Banking & Financials', value: 'Banking' },
    { label: 'IT & Technology', value: 'IT' },
    { label: 'Energy & Power', value: 'Energy' },
    { label: 'Automobile', value: 'Automobile' },
    { label: 'Telecom & Tech', value: 'Telecom' },
    { label: 'FMCG & Consumer', value: 'FMCG' }
  ];

  // Load user watchlist from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('trading_works_watchlist');
      if (saved) setWatchlist(JSON.parse(saved));
      else setWatchlist(['HDFCBANK', 'RELIANCE', 'ICICIBANK', 'INFY']);
    } catch (e) {}
  }, []);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      fetchResults(query, selectedExchange, selectedCategory);
    }
  }, [isOpen]);

  // Debounced search fetch handler
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchResults(query, selectedExchange, selectedCategory);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, selectedExchange, selectedCategory, isOpen]);

  const fetchResults = async (q, ex, cat) => {
    try {
      setLoading(true);
      const url = `${API_BASE}/api/market/search?query=${encodeURIComponent(q)}&exchange=${encodeURIComponent(ex)}&category=${encodeURIComponent(cat)}&limit=50`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setResults(data.data);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Failed to search instruments:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = (e, symbol) => {
    e.stopPropagation();
    let updated;
    if (watchlist.includes(symbol)) {
      updated = watchlist.filter(s => s !== symbol);
    } else {
      updated = [...watchlist, symbol];
    }
    setWatchlist(updated);
    try {
      localStorage.setItem('trading_works_watchlist', JSON.stringify(updated));
    } catch (err) {}
  };

  if (!isOpen) return null;

  return (
    <div
      className="symbol-search-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="symbol-search-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          background: 'var(--bg-card)',
          borderRadius: '24px',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >

        {/* Modal Header */}
        <div style={{
          padding: '20px 24px 16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-glass)'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.4rem',
            fontWeight: 800,
            margin: 0,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em'
          }}>
            Add symbol
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-subtle)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input Section */}
        <div style={{ padding: '20px 24px 12px 24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 18px',
            borderRadius: '16px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-glass)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}>
            <Search size={20} style={{ color: 'var(--text-subtle)', marginRight: '12px' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Symbol, ISIN, or CUSIP"
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main)',
                fontSize: '1.05rem',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Primary Category Pill Tabs Row (Exactly matches screenshot) */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingTop: '16px',
            paddingBottom: '8px',
            scrollbarWidth: 'none'
          }}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory(cat);
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    background: isSelected ? 'var(--text-main)' : 'var(--bg-input)',
                    color: isSelected ? 'var(--bg-card)' : 'var(--text-subtle)'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Secondary Filters Dropdowns Row (Curved Custom Glass Dropdowns) */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            paddingTop: '10px',
            flexWrap: 'wrap'
          }}>
            {/* Exchange Curved Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'exchange' ? null : 'exchange');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 16px',
                  borderRadius: '16px',
                  background: activeDropdown === 'exchange' ? 'var(--text-main)' : 'var(--bg-input)',
                  color: activeDropdown === 'exchange' ? 'var(--bg-card)' : 'var(--text-main)',
                  border: '1px solid var(--border-glass)',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{exchangesList.find(e => e.value === selectedExchange)?.label || 'All Exchanges'}</span>
                <ChevronDown size={14} style={{ transform: activeDropdown === 'exchange' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
              </button>

              {activeDropdown === 'exchange' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    zIndex: 1000,
                    minWidth: '240px',
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-glass)',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  {exchangesList.map(ex => {
                    const isSelected = selectedExchange === ex.value;
                    return (
                      <div
                        key={ex.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExchange(ex.value);
                          setActiveDropdown(null);
                        }}
                        style={{
                          padding: '9px 14px',
                          borderRadius: '10px',
                          fontSize: '0.825rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? 'var(--color-primary)' : 'var(--text-main)',
                          background: isSelected ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-input)'; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span>{ex.label}</span>
                        {isSelected && <Check size={14} color="var(--color-primary)" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* All Types Curved Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'type' ? null : 'type');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 16px',
                  borderRadius: '16px',
                  background: activeDropdown === 'type' ? 'var(--text-main)' : 'var(--bg-input)',
                  color: activeDropdown === 'type' ? 'var(--bg-card)' : 'var(--text-main)',
                  border: '1px solid var(--border-glass)',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{typesList.find(t => t.value === selectedType)?.label || 'All types'}</span>
                <ChevronDown size={14} style={{ transform: activeDropdown === 'type' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
              </button>

              {activeDropdown === 'type' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    zIndex: 1000,
                    minWidth: '200px',
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-glass)',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  {typesList.map(t => {
                    const isSelected = selectedType === t.value;
                    return (
                      <div
                        key={t.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedType(t.value);
                          setActiveDropdown(null);
                        }}
                        style={{
                          padding: '9px 14px',
                          borderRadius: '10px',
                          fontSize: '0.825rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? 'var(--color-primary)' : 'var(--text-main)',
                          background: isSelected ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-input)'; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span>{t.label}</span>
                        {isSelected && <Check size={14} color="var(--color-primary)" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* All Sectors Curved Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'sector' ? null : 'sector');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 16px',
                  borderRadius: '16px',
                  background: activeDropdown === 'sector' ? 'var(--text-main)' : 'var(--bg-input)',
                  color: activeDropdown === 'sector' ? 'var(--bg-card)' : 'var(--text-main)',
                  border: '1px solid var(--border-glass)',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{sectorsList.find(s => s.value === selectedSector)?.label || 'All sectors'}</span>
                <ChevronDown size={14} style={{ transform: activeDropdown === 'sector' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
              </button>

              {activeDropdown === 'sector' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    zIndex: 1000,
                    minWidth: '210px',
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-glass)',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  {sectorsList.map(s => {
                    const isSelected = selectedSector === s.value;
                    return (
                      <div
                        key={s.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSector(s.value);
                          setActiveDropdown(null);
                        }}
                        style={{
                          padding: '9px 14px',
                          borderRadius: '10px',
                          fontSize: '0.825rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? 'var(--color-primary)' : 'var(--text-main)',
                          background: isSelected ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-input)'; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span>{s.label}</span>
                        {isSelected && <Check size={14} color="var(--color-primary)" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stock List Results Table */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 12px 16px 12px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-subtle)', fontSize: '0.9rem' }}>
              Searching Zerodha master catalog...
            </div>
          ) : results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {results.map((stk) => {
                const isWatchlisted = watchlist.includes(stk.symbol);

                return (
                  <div
                    key={`${stk.symbol}-${stk.exchange}-${stk.token}`}
                    onClick={() => {
                      onSelectSymbol(stk.symbol, stk);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      borderBottom: '1px solid var(--border-glass)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Left: Logo & Company Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                      <StockLogo symbol={stk.symbol} size={36} />
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', overflow: 'hidden' }}>
                        <span style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '1rem',
                          fontWeight: 800,
                          color: 'var(--text-main)',
                          letterSpacing: '-0.01em'
                        }}>
                          {stk.symbol}
                        </span>
                        <span style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-subtle)',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '320px'
                        }}>
                          {stk.name}
                        </span>
                      </div>
                    </div>

                    {/* Right: Category, Exchange & Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-subtle)',
                        textTransform: 'lowercase',
                        fontWeight: 600
                      }}>
                        {stk.category === 'Stocks' ? 'stock' : stk.category.toLowerCase()}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: stk.exchange === 'NSE' ? '#3b82f6' : stk.exchange === 'BSE' ? '#00c853' : '#a855f7',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.06)'
                        }}>
                          {stk.exchange}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-subtle)' }}>
              <Search size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-main)', fontWeight: 700 }}>
                No instruments matched "{query}"
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                Try searching for company names or symbols like HDFCBANK, RELIANCE, BSE, SBIN, PAYTM, INFY, or COALINDIA.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
