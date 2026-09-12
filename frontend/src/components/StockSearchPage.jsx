import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { StockLogo } from './StockLogo';
import { SymbolSearchModal } from './SymbolSearchModal';
import { Search, ArrowLeft, TrendingUp, TrendingDown, Building2, BarChart2, Layers, Filter, CheckCircle2 } from 'lucide-react';

export const StockSearchPage = ({ onSelectStock, onBackToOverview, defaultSymbol = 'RELIANCE' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [liveQuotes, setLiveQuotes] = useState({});
  const [zerodhaConnected, setZerodhaConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const masterCatalog = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', exchange: 'NSE', category: 'Energy' },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', exchange: 'NSE', category: 'IT' },
    { symbol: 'INFY', name: 'Infosys Ltd.', exchange: 'NSE', category: 'IT' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', exchange: 'NSE', category: 'Banking' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', exchange: 'NSE', category: 'Banking' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', exchange: 'NSE', category: 'Automobile' },
    { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', category: 'Banking' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', exchange: 'NSE', category: 'Telecom' },
    { symbol: 'ITC', name: 'ITC Ltd.', exchange: 'NSE', category: 'FMCG' },
    { symbol: 'COALINDIA', name: 'Coal India Ltd.', exchange: 'NSE', category: 'Energy' },
    { symbol: 'WIPRO', name: 'Wipro Ltd.', exchange: 'NSE', category: 'IT' },
    { symbol: 'NIFTY 50', name: 'NIFTY 50 Index', exchange: 'NSE', category: 'Indices' },
    { symbol: 'BANKNIFTY', name: 'NIFTY Bank Index', exchange: 'NSE', category: 'Indices' },
    { symbol: 'USD/INR', name: 'US Dollar / Indian Rupee', exchange: 'CDS', category: 'Currencies' }
  ];

  const categories = ['All', 'Equities', 'IT', 'Banking', 'Indices', 'Energy', 'Automobile', 'Currencies'];

  useEffect(() => {
    let eventSource;
    try {
      eventSource = new EventSource('http://localhost:5000/api/market/stream');
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (typeof payload.zerodhaConnected === 'boolean') {
            setZerodhaConnected(payload.zerodhaConnected);
          }
          if (payload.quotes) {
            setLiveQuotes(payload.quotes);
          }
        } catch (err) {}
      };
    } catch (err) {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  const query = searchQuery.toLowerCase().trim();
  let filteredCatalog = masterCatalog.filter((stk) => {
    const matchesSearch =
      !query ||
      stk.symbol.toLowerCase().includes(query) ||
      stk.name.toLowerCase().includes(query) ||
      stk.category.toLowerCase().includes(query) ||
      stk.exchange.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Equities' && !['Indices', 'Currencies'].includes(stk.category)) ||
      stk.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (query && !filteredCatalog.some(s => s.symbol.toLowerCase() === query)) {
    const formattedSym = query.toUpperCase().replace(/\s+/g, '');
    filteredCatalog.unshift({
      symbol: formattedSym,
      name: `${searchQuery.toUpperCase()} (NSE Equity)`,
      exchange: formattedSym.includes('USD') || formattedSym.includes('INR') ? 'CDS' : 'NSE',
      category: 'Equities'
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Top Search Banner Card */}
      <GlassCard wide style={{ padding: '32px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onBackToOverview}
              className="btn btn-secondary"
              style={{
                padding: '8px 14px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Stock Search & Discovery
              </h1>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
                Instant real-time search across Indian equities, market indices, and currency derivatives.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: zerodhaConnected ? '#00c853' : '#ffab00', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: zerodhaConnected ? '#00c853' : '#ffab00' }} />
            {zerodhaConnected ? 'Live Zerodha Stream Connected' : 'Preserved Offline Cache Mode'}
          </div>
        </div>

        {/* Large Prominent Search Input Field */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <div
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 22px',
              borderRadius: '20px',
              background: 'var(--bg-input)',
              border: '2px solid var(--color-primary)',
              boxShadow: '0 0 24px var(--color-primary-glow)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={24} style={{ color: 'var(--color-primary)', marginRight: '14px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Symbol, ISIN, or Company Name (e.g. HDFCBANK, RELIANCE, BSE, SBIN, PAYTM)..."
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main)',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="btn btn-primary"
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Search size={16} /> Open Symbol Finder
            </button>
          </div>
        </div>
              <button
                onClick={() => setSearchQuery('')}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '10px' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-subtle)', marginRight: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '6px 14px',
                fontSize: '0.825rem',
                fontWeight: 700,
                borderRadius: '16px',
                border: '1px solid var(--border-glass)',
                boxShadow: selectedCategory === cat ? '0 0 12px var(--color-primary-glow)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Stock Cards Results Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 8px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Search Results ({filteredCatalog.length} stocks)
          </h3>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-subtle)' }}>
            Showing items matching "{searchQuery || selectedCategory}"
          </span>
        </div>

        {filteredCatalog.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
            {filteredCatalog.map((stk) => {
              const live = liveQuotes[stk.symbol];
              const price = live?.price ? parseFloat(live.price) : 358.50;
              const change = live?.percent_change !== undefined ? live.percent_change : 0.45;
              const isUp = change >= 0;
              const highVal = live?.high ? parseFloat(live.high) : price * 1.02;
              const lowVal = live?.low ? parseFloat(live.low) : price * 0.98;
              const low52Val = (lowVal * 0.85).toFixed(2);
              const high52Val = (highVal * 1.15).toFixed(2);
              const rangePct = Math.min(100, Math.max(0, ((price - parseFloat(low52Val)) / Math.max(1, parseFloat(high52Val) - parseFloat(low52Val))) * 100));

              return (
                <GlassCard
                  key={stk.symbol}
                  style={{
                    padding: '24px',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.25s ease',
                    border: stk.symbol === defaultSymbol ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                    boxShadow: stk.symbol === defaultSymbol ? '0 0 20px var(--color-primary-glow)' : 'var(--shadow-glass)'
                  }}
                >
                  <div>
                    {/* Header Row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <StockLogo symbol={stk.symbol} size={42} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                              {stk.symbol}
                            </span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-subtle)' }}>
                              {stk.exchange}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.825rem', color: 'var(--text-subtle)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                            {stk.name}
                          </div>
                        </div>
                      </div>

                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                        {stk.category}
                      </span>
                    </div>

                    {/* Price and Day Change */}
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Inter, sans-serif', color: 'var(--text-main)' }}>
                          ₹{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: isUp ? 'rgba(0, 200, 83, 0.15)' : 'rgba(255, 59, 48, 0.15)',
                        color: isUp ? '#00c853' : '#ff3b30',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}>
                        {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{isUp ? '+' : ''}{change}%</span>
                      </div>
                    </div>

                    {/* 52-Week Range Bar */}
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '4px' }}>
                        <span>Day Low: ₹{lowVal.toFixed(2)}</span>
                        <span>Day High: ₹{highVal.toFixed(2)}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${rangePct}%`, background: 'var(--color-primary)', borderRadius: '3px' }} />
                      </div>
                    </div>

                    {/* Key Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-glass)', fontSize: '0.8rem' }}>
                      <div style={{ color: 'var(--text-subtle)' }}>
                        Status: <strong style={{ color: 'var(--text-main)' }}>{live ? 'Zerodha Live' : 'NSE Listed'}</strong>
                      </div>
                      <div style={{ color: 'var(--text-subtle)', textAlign: 'right' }}>
                        Exchange: <strong style={{ color: 'var(--text-main)' }}>{stk.exchange}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => onSelectStock(stk.symbol)}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <BarChart2 size={16} /> Analyze Chart & Details
                  </button>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <GlassCard style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Search size={36} style={{ color: 'var(--text-subtle)', marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              No Stock Results Found
            </h4>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.875rem' }}>
              No stocks matched "{searchQuery}". Try searching for TCS, RELIANCE, INFY, HDFC, SBIN, or NIFTY.
            </p>
          </GlassCard>
        )}
      </div>

      <SymbolSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectSymbol={(sym) => onSelectStock(sym)}
        initialQuery={searchQuery}
      />

    </div>
  );
};
