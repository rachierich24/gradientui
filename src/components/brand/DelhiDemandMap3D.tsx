'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Image from 'next/image';

export type ProductType = 'oat' | 'cold' | 'almond';
export type IntensityFilter = 'all' | 'Very High' | 'High' | 'Moderate' | 'Low';

export interface ClusterPin {
  id: string;
  name: string;
  // Position in percent (0..100) inside map viewport
  x: number;
  y: number;
  growth: Record<ProductType, string>;
  growthNum: Record<ProductType, number>;
  intensity: 'Very High' | 'High' | 'Moderate' | 'Low';
  cafes: number;
  rating: number;
  weeklyLitres: number;
  topRoaster: string;
  sensoryNote: string;
  dispatchSlot: string;
}

const PIN_DELAYS: Record<string, number> = {
  cp: 0.10,
  gurugram: 0.13,
  kamla: 0.16,
  rajouri: 0.20,
  hauz: 0.23,
  lajpat: 0.26,
  saket: 0.29,
  vasant: 0.32,
  noida: 0.35,
};

// Spaced cluster pins with generous breathing room matching Delhi NCR topography
const CLUSTERS: ClusterPin[] = [
  {
    id: 'kamla',
    name: 'Kamla Nagar',
    x: 61.0,
    y: 22.0,
    growth: { oat: '+16.8%', cold: '+19.5%', almond: '+11.5%' },
    growthNum: { oat: 16.8, cold: 19.5, almond: 11.5 },
    intensity: 'High',
    cafes: 24,
    rating: 4.7,
    weeklyLitres: 290,
    topRoaster: 'Second Crack Roastery',
    sensoryNote: 'Prefers lighter roast, high foam elasticity',
    dispatchSlot: 'Slot 01 · North Loop',
  },
  {
    id: 'rajouri',
    name: 'Rajouri Garden',
    x: 35.0,
    y: 32.0,
    growth: { oat: '+12.6%', cold: '+14.9%', almond: '+8.9%' },
    growthNum: { oat: 12.6, cold: 14.9, almond: 8.9 },
    intensity: 'Moderate',
    cafes: 19,
    rating: 4.6,
    weeklyLitres: 210,
    topRoaster: 'West Delhi Coffee Lab',
    sensoryNote: 'Fast weekend surge, iced beverage heavy',
    dispatchSlot: 'Slot 02 · West Arterial',
  },
  {
    id: 'cp',
    name: 'Connaught Place',
    x: 60.0,
    y: 40.0,
    growth: { oat: '+22.1%', cold: '+28.4%', almond: '+16.3%' },
    growthNum: { oat: 22.1, cold: 28.4, almond: 16.3 },
    intensity: 'Very High',
    cafes: 38,
    rating: 4.9,
    weeklyLitres: 420,
    topRoaster: 'Steam Theory Roasters',
    sensoryNote: 'Tier-1 velocity · Zero splitting at 68°C',
    dispatchSlot: 'Primary Hub · Continuous Run',
  },
  {
    id: 'hauz',
    name: 'Hauz Khas',
    x: 48.0,
    y: 52.0,
    growth: { oat: '+14.2%', cold: '+17.1%', almond: '+10.2%' },
    growthNum: { oat: 14.2, cold: 17.1, almond: 10.2 },
    intensity: 'High',
    cafes: 31,
    rating: 4.8,
    weeklyLitres: 340,
    topRoaster: 'Little Brew Room',
    sensoryNote: 'Holds rosetta microfoam better than dairy',
    dispatchSlot: 'Slot 03 · South Metro Corridor',
  },
  {
    id: 'lajpat',
    name: 'Lajpat Nagar',
    x: 70.0,
    y: 54.0,
    growth: { oat: '+15.9%', cold: '+18.6%', almond: '+12.1%' },
    growthNum: { oat: 15.9, cold: 18.6, almond: 12.1 },
    intensity: 'High',
    cafes: 22,
    rating: 4.7,
    weeklyLitres: 270,
    topRoaster: 'South Delhi Roasters',
    sensoryNote: 'High cold brew keg conversion',
    dispatchSlot: 'Slot 03 · South Ring Corridor',
  },
  {
    id: 'saket',
    name: 'Saket',
    x: 58.0,
    y: 70.0,
    growth: { oat: '+13.5%', cold: '+16.2%', almond: '+9.4%' },
    growthNum: { oat: 13.5, cold: 16.2, almond: 9.4 },
    intensity: 'Moderate',
    cafes: 26,
    rating: 4.7,
    weeklyLitres: 310,
    topRoaster: 'Select City Pour Lab',
    sensoryNote: 'Consistent 12-case weekly reorders',
    dispatchSlot: 'Slot 04 · Saket-Mehrauli Loop',
  },
  {
    id: 'vasant',
    name: 'Vasant Kunj',
    x: 38.0,
    y: 68.0,
    growth: { oat: '+11.3%', cold: '+13.8%', almond: '+14.6%' },
    growthNum: { oat: 11.3, cold: 13.8, almond: 14.6 },
    intensity: 'Moderate',
    cafes: 18,
    rating: 4.8,
    weeklyLitres: 230,
    topRoaster: 'Hillfold Specialty Lab',
    sensoryNote: 'Highest almond & oat specialty share',
    dispatchSlot: 'Slot 04 · Southwest Spine',
  },
  {
    id: 'gurugram',
    name: 'Gurugram',
    x: 23.0,
    y: 76.0,
    growth: { oat: '+20.7%', cold: '+26.1%', almond: '+15.8%' },
    growthNum: { oat: 20.7, cold: 26.1, almond: 15.8 },
    intensity: 'Very High',
    cafes: 46,
    rating: 4.9,
    weeklyLitres: 580,
    topRoaster: 'Cyber City Artisans',
    sensoryNote: 'Fastest growing B2B corporate cafe cluster',
    dispatchSlot: 'Express Van 04 · NH-48 Direct',
  },
  {
    id: 'noida',
    name: 'Noida',
    x: 88.0,
    y: 52.0,
    growth: { oat: '+10.1%', cold: '+12.4%', almond: '+7.8%' },
    growthNum: { oat: 10.1, cold: 12.4, almond: 7.8 },
    intensity: 'Low',
    cafes: 24,
    rating: 4.5,
    weeklyLitres: 195,
    topRoaster: 'Sector 62 Roasters',
    sensoryNote: 'Emerging hub with trial kit velocity',
    dispatchSlot: 'Express Van 02 · DND Corridor',
  },
];

// Delivery corridors connecting clusters
const NETWORK_ROUTES = [
  { id: 'cp-kamla', from: 'cp', to: 'kamla', path: 'M 600 225 Q 605 174 610 124' },
  { id: 'cp-rajouri', from: 'cp', to: 'rajouri', path: 'M 600 225 Q 475 202 350 180' },
  { id: 'cp-hauz', from: 'cp', to: 'hauz', path: 'M 600 225 Q 540 258 480 292' },
  { id: 'cp-lajpat', from: 'cp', to: 'lajpat', path: 'M 600 225 Q 650 264 700 303' },
  { id: 'lajpat-noida', from: 'lajpat', to: 'noida', path: 'M 700 303 Q 790 297 880 292' },
  { id: 'hauz-saket', from: 'hauz', to: 'saket', path: 'M 480 292 Q 530 342 580 393' },
  { id: 'hauz-vasant', from: 'hauz', to: 'vasant', path: 'M 480 292 Q 430 337 380 382' },
  { id: 'hauz-gurugram', from: 'hauz', to: 'gurugram', path: 'M 480 292 Q 355 359 230 427' },
];

const PRODUCT_DATA: Record<ProductType, { growth: string; vsDay: string; totalCafes: number; sparkline: number[] }> = {
  oat: {
    growth: '+18.4%',
    vsDay: 'vs. Day 13',
    totalCafes: 248,
    sparkline: [12, 14, 15.2, 16.0, 16.8, 17.5, 18.4],
  },
  cold: {
    growth: '+24.6%',
    vsDay: 'vs. Day 13',
    totalCafes: 274,
    sparkline: [14, 16.5, 18.2, 20.1, 21.8, 23.4, 24.6],
  },
  almond: {
    growth: '+14.2%',
    vsDay: 'vs. Day 13',
    totalCafes: 218,
    sparkline: [10, 11.2, 11.8, 12.5, 13.1, 13.8, 14.2],
  },
};

export function DelhiDemandMap3D() {
  const [product, setProduct] = useState<ProductType>('oat');
  const [intensityFilter, setIntensityFilter] = useState<IntensityFilter>('all');
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(20);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Simulation timer for 21-day flight
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentDay((prev) => (prev >= 21 ? 1 : prev + 1));
    }, 450);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const cur = PRODUCT_DATA[product];
  const dynamicCafes = Math.round(cur.totalCafes * (0.65 + (currentDay / 21) * 0.35));
  const activeClusterObj = selectedCluster ? CLUSTERS.find((c) => c.id === selectedCluster) : null;

  // Compute SVG Sparkline points for the Overall Demand Card
  const sparklineD = useMemo(() => {
    const pts = cur.sparkline;
    const min = 8, max = 26;
    const w = 70, h = 14;
    const coords = pts.map((val, idx) => {
      const px = (idx / (pts.length - 1)) * w;
      const py = h - ((val - min) / (max - min)) * (h - 4) - 2;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    });
    return `M ${coords.join(' L ')}`;
  }, [cur]);

  return (
    <div className="ddm-container">
      <div className="ddm-inner">
        {/* ─── Top Header Bar (Minimal & Sleek) ─── */}
        <header className="ddm-header">
          {/* Left: Live Indicator + Title + Day Badge */}
          <div className="ddm-header-left">
            <span className="ddm-live-indicator" aria-label="Live Telemetry">
              <span className="ddm-live-halo" />
              <span className="ddm-live-core" />
            </span>
            <div className="ddm-header-titles">
              <h3 className="ddm-header-title">
                Café Demand Index <span className="ddm-dot-sep">·</span> Delhi NCR
              </h3>
            </div>
            <span className="ddm-day-chip">Day {currentDay}/21</span>
          </div>

          {/* Right: Interactive Product Selector Pills */}
          <nav className="ddm-pills" aria-label="Product selector">
            <button
              type="button"
              onClick={() => startTransition(() => setProduct('oat'))}
              className={`ddm-pill-btn ${product === 'oat' ? 'is-active' : ''}`}
              aria-pressed={product === 'oat'}
            >
              <span>Oat Milk</span>
            </button>
            <button
              type="button"
              onClick={() => startTransition(() => setProduct('cold'))}
              className={`ddm-pill-btn ${product === 'cold' ? 'is-active' : ''}`}
              aria-pressed={product === 'cold'}
            >
              <span>Cold Brew</span>
            </button>
            <button
              type="button"
              onClick={() => startTransition(() => setProduct('almond'))}
              className={`ddm-pill-btn ${product === 'almond' ? 'is-active' : ''}`}
              aria-pressed={product === 'almond'}
            >
              <span>Almond Milk</span>
            </button>
          </nav>
        </header>

        {/* ─── Floating Top-Left Overall Demand Card (Compact & Clear of Pins) ─── */}
        <aside className="ddm-card-demand" aria-label="Overall demand telemetry">
          <div className="ddm-side-card-title">Overall Demand</div>
          <div className="ddm-demand-num">
            {cur.growth} <span className="ddm-demand-arrow">↗</span>
          </div>
          <div className="ddm-sparkline-wrap" aria-hidden="true">
            <svg viewBox="0 0 70 14" className="ddm-sparkline-svg">
              <defs>
                <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6B33D3" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#6B33D3" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={`${sparklineD} L 70,14 L 0,14 Z`} fill="url(#spark-fill)" />
              <path
                d={sparklineD}
                fill="none"
                stroke="#6B33D3"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="ddm-side-card-sub">{cur.vsDay}</div>
        </aside>

        {/* ─── Floating Middle-Left Demand Intensity Legend Card (Compact & Clear of Pins) ─── */}
        <aside className="ddm-card-legend" aria-label="Demand intensity filter">
          <div className="ddm-side-card-title">Demand Intensity</div>
          <div className="ddm-legend-grid">
            {[
              { label: 'Very High' as const, bg: '#6B33D3' },
              { label: 'High' as const, bg: '#8B5CF6' },
              { label: 'Moderate' as const, bg: '#C4B5FD' },
              { label: 'Low' as const, bg: '#DDD6FE' },
            ].map((tier) => {
              const active = intensityFilter === tier.label;
              return (
                <button
                  key={tier.label}
                  type="button"
                  onClick={() => setIntensityFilter(active ? 'all' : tier.label)}
                  className={`ddm-legend-chip-btn ${active ? 'is-active' : ''}`}
                  title={active ? 'Clear filter' : `Filter ${tier.label} zones`}
                >
                  <span className="ddm-legend-swatch" style={{ background: tier.bg }} />
                  <span className="ddm-legend-chip-name">{tier.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ─── Dedicated Map Viewport (Ensures Entire Northern Terrain Rim Is 100% Visible) ─── */}
        <div className="ddm-map-viewport">
          {/* 3D Extruded Map Plate */}
          <div className="ddm-bg-plate">
            <Image
              src="/brand/delhi-demand-map-3d-clean.jpg"
              alt="Café Demand Index · Delhi NCR 3D Map"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 760px"
            />
          </div>

          {/* Interactive Supply & Demand Arteries */}
          <svg
            className="ddm-routes"
            viewBox="0 0 1000 562"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="route-pulse" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6B33D3" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#C084FC" stopOpacity="0.3" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {NETWORK_ROUTES.map((r, i) => {
              const isRouteActive = selectedCluster && (r.from === selectedCluster || r.to === selectedCluster);
              return (
                <g key={r.id}>
                  <path
                    d={r.path}
                    className={`ddm-route-line ${isRouteActive ? 'is-active' : ''}`}
                  />
                  {/* Flowing demand particle */}
                  <circle r={isRouteActive ? '4' : '2.5'} fill="#6B33D3" filter="url(#glow)">
                    <animateMotion
                      path={r.path}
                      dur={`${3.2 + (i % 3) * 0.8}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* 9 Interactive Cluster Pins with Zero-Flicker Hitbox and Bridge */}
          {CLUSTERS.map((c) => {
            const isDimmed = intensityFilter !== 'all' && c.intensity !== intensityFilter;
            const isSelected = selectedCluster === c.id;

            // Pins in upper half or middle open downwards; pins in lower third open upwards
            const isBottom = c.y <= 55;
            const isLeft = c.x < 28;
            const isRight = c.x > 75;

            const tooltipClass = [
              'ddm-tooltip',
              isBottom ? 'is-tooltip-bottom' : '',
              isLeft ? 'is-tooltip-left' : '',
              isRight ? 'is-tooltip-right' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div
                key={c.id}
                style={
                  {
                    left: `${c.x}%`,
                    top: `${c.y}%`,
                    '--pin-d': PIN_DELAYS[c.id] ?? 0.2,
                  } as React.CSSProperties
                }
                className={`ddm-pin-wrapper ${isDimmed ? 'is-dimmed' : ''} ${
                  isSelected ? 'is-selected' : ''
                }`}
                onClick={() => setSelectedCluster(isSelected ? null : c.id)}
              >
                {/* Pulsing Radar Ring & Ground Dot */}
                <div className="ddm-pin-radar">
                  <span className="ddm-pin-radar-ring" />
                  <span className="ddm-pin-radar-dot" />
                </div>

                {/* Pin Badge with Live Equalizer */}
                <div className="ddm-pin-badge">
                  <div className="ddm-pin-eq" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="ddm-pin-name">{c.name}</span>
                  <span className="ddm-pin-growth">↑ {c.growth[product]}</span>
                </div>

                {/* Stem pointing to cluster center */}
                <div className="ddm-pin-stem" />

                {/* Sensory Detail Card (Pure White with Purple Accents & Seamless Hover Bridge) */}
                <div className={tooltipClass}>
                  <div className="ddm-tooltip-head">
                    <span className="ddm-tooltip-title">{c.name}</span>
                    <span className="ddm-tooltip-badge">{c.intensity}</span>
                  </div>

                  <div className="ddm-tooltip-live">
                    <span className="ddm-live-dot" />
                    <span>{c.dispatchSlot}</span>
                  </div>

                  <div className="ddm-tooltip-grid">
                    <div className="ddm-tooltip-item">
                      <span className="ddm-tooltip-label">Demand Surge</span>
                      <span className="ddm-tooltip-val-growth">{c.growth[product]}</span>
                    </div>
                    <div className="ddm-tooltip-item">
                      <span className="ddm-tooltip-label">Active Cafés</span>
                      <span className="ddm-tooltip-val">{c.cafes}</span>
                    </div>
                    <div className="ddm-tooltip-item">
                      <span className="ddm-tooltip-label">Weekly Vol.</span>
                      <span className="ddm-tooltip-val">{c.weeklyLitres} L</span>
                    </div>
                    <div className="ddm-tooltip-item">
                      <span className="ddm-tooltip-label">Sensory Score</span>
                      <span className="ddm-tooltip-val-score">★ {c.rating}</span>
                    </div>
                  </div>

                  <div className="ddm-tooltip-foot">
                    <span className="ddm-tooltip-foot-label">Key Roaster:</span>
                    <span className="ddm-tooltip-foot-val">{c.topRoaster}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Bottom Scrubber Bar & Telemetry (Minimal & Sleek) ─── */}
        <footer className="ddm-bottom-bar">
          {/* Left: Scrubber Controls + Simulation Play Button */}
          <div className="ddm-scrubber-group">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`ddm-play-btn ${isPlaying ? 'is-playing' : ''}`}
              title={isPlaying ? 'Pause simulation' : 'Auto-play 21-day timeline'}
              aria-label={isPlaying ? 'Pause telemetry playback' : 'Play telemetry playback'}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="7 5 19 12 7 19 7 5" />
                </svg>
              )}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <span className="ddm-day-label">
              Day <b>{String(currentDay).padStart(2, '0')}</b>
            </span>

            {/* 21 Scrubber Segment Pills */}
            <div className="ddm-scrubber-tracks">
              {Array.from({ length: 21 }, (_, i) => {
                const dayNum = i + 1;
                const isPast = dayNum <= currentDay;
                const isCur = dayNum === currentDay;
                return (
                  <button
                    key={dayNum}
                    type="button"
                    title={`Day ${dayNum} of 21`}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentDay(dayNum);
                    }}
                    onMouseEnter={() => {
                      if (!isPlaying) setCurrentDay(dayNum);
                    }}
                    className={`ddm-scrubber-pill ${isCur ? 'is-current' : isPast ? 'is-past' : ''}`}
                    aria-label={`Jump to Day ${dayNum}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Right: Minimal Live Telemetry */}
          <div className="ddm-bottom-stats">
            <div className="ddm-bottom-stat">
              <span className="ddm-stat-bullet">●</span>
              <span className="ddm-bottom-stat-val">{dynamicCafes}</span>
              <span className="ddm-bottom-stat-sub">Cafés</span>
            </div>

            <div className="ddm-bottom-divider" />

            <div className="ddm-bottom-stat">
              <span className="ddm-stat-bullet" style={{ color: '#6B33D3' }}>
                ↑
              </span>
              <span className="ddm-bottom-stat-val">{cur.growth}</span>
            </div>

            <div className="ddm-bottom-divider" />

            <div className="ddm-bottom-stat">
              <span className="ddm-stat-bullet">📍</span>
              <span className="ddm-bottom-stat-val">
                {activeClusterObj ? activeClusterObj.name : '9 Zones'}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default DelhiDemandMap3D;
