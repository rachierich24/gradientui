'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CapabilityCard {
  id: string;
  num: string;
  title: string;
  pill: string;
  description: string;
  pointers: string[];
}

const CAPABILITIES: CapabilityCard[] = [
  {
    id: 'demand-intelligence',
    num: '01',
    title: 'Demand Intelligence',
    pill: 'DEMAND SIGNALS · FORECASTING',
    description:
      'Track live consumption signals across café clusters to schedule batch production and eliminate distributor deadstock.',
    pointers: [
      'Live consumption telemetry across roasteries & cafés',
      'Batch production scheduled against real order intent',
      'Zero distributor deadstock and perishable batch waste',
    ],
  },
  {
    id: 'cafe-trials',
    num: '02',
    title: 'Direct Café Discovery',
    pill: 'SAMPLING FLIGHTS · TRIALS',
    description:
      'Seed products directly with head baristas and café procurement leads with verified sensory and tasting feedback.',
    pointers: [
      'Targeted sampling flights across 40+ verified venues',
      'Direct barista tasting scores & microfoam evaluation',
      'Frictionless cold-chain sample dispatch on demand',
    ],
  },
  {
    id: 'automated-reorders',
    num: '03',
    title: 'Automated Reorders',
    pill: 'PURCHASE ORDERS · VELOCITY',
    description:
      'Convert approved sample flights into recurring purchase orders without building costly manual field sales teams.',
    pointers: [
      'Instant Net-15 & Net-30 verified digital PO workflows',
      'Automated inventory replenishment and recurring orders',
      'Direct distribution reach across 140+ active café accounts',
    ],
  },
];

export function BrandMoat() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section className="bmoat-section" id="capabilities" aria-labelledby="bmoat-title">
      <div className="bmoat-bg-glow" aria-hidden="true" />

      <div className="bmoat-container">
        {/* Editorial Section Header */}
        <div className="bmoat-header">
          <div className="bmoat-eyebrow">
            <span className="bmoat-eyebrow-line" aria-hidden="true" />
            <span>PLATFORM CAPABILITIES</span>
          </div>
          <h2 id="bmoat-title" className="bmoat-title">
            Built for brands selling into<br />
            India’s café economy.
          </h2>
          <p className="bmoat-sub">
            Three interconnected capabilities that replace blind cold outreach and speculative production with verified demand telemetry, structured sampling flights, and automated reorders.
          </p>
        </div>

        {/* 3-Column Cards Grid with Layered Background Numerals */}
        <div className="bmoat-grid">
          {CAPABILITIES.map((card, idx) => {
            const isHovered = hoveredIdx === idx;

            return (
              <div key={card.id} className="bmoat-card-wrap">
                {/* Oversized Background Number in Electric Purple */}
                <div
                  className={`bmoat-bg-num ${isHovered ? 'is-lit' : ''}`}
                  aria-hidden="true"
                >
                  {card.num}
                </div>

                <motion.div
                  className={`bmoat-card ${isHovered ? 'is-hovered' : ''}`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="bmoat-card-inner">
                    {/* Card Title & Purple Category Pill */}
                    <div className="bmoat-card-top">
                      <h3 className="bmoat-card-title">{card.title}</h3>
                      <div className="bmoat-pill">{card.pill}</div>
                    </div>

                    {/* Interactive, 3D Product Visual Workspace with Crisp HTML HUD */}
                    <div className="bmoat-graphic-frame">
                      {idx === 0 && <DemandIntelligenceWorkspace />}
                      {idx === 1 && <SamplingFlightsWorkspace />}
                      {idx === 2 && <OrderVelocityWorkspace />}
                    </div>

                    {/* Concise Supporting Description */}
                    <p className="bmoat-card-desc">{card.description}</p>

                    {/* Minimal Razor-Sharp Pointers */}
                    <ul className="bmoat-pointers">
                      {card.pointers.map((pt, pIdx) => (
                        <li key={pIdx} className="bmoat-pointer-item">
                          <span className="bmoat-pointer-dot" aria-hidden="true" />
                          <span className="bmoat-pointer-text">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   WORKSPACE 01: DEMAND INTELLIGENCE
   - Enhanced 3D Coffee Pouch with floating ambient glow and shadow
   - Continuous interactive forecast telemetry with scrubbable W1-W5 points
───────────────────────────────────────────────────────────────────────────── */
interface TelemetryPoint {
  week: string;
  stageLabel: string;
  volumeKg: number;
  growth: string;
  x: number;
  y: number;
}

const TELEMETRY_SERIES: TelemetryPoint[] = [
  { week: 'W1', stageLabel: 'Baseline Roast Cycle', volumeKg: 48, growth: '+12%', x: 15, y: 65 },
  { week: 'W2', stageLabel: 'Secondary Roaster Pull', volumeKg: 68, growth: '+19%', x: 48, y: 58 },
  { week: 'W3', stageLabel: 'Hauz Khas Cluster Surge', volumeKg: 94, growth: '+25%', x: 82, y: 46 },
  { week: 'W4', stageLabel: 'Multi-Outlet Depletion', volumeKg: 118, growth: '+29%', x: 115, y: 32 },
  { week: 'W5', stageLabel: 'Peak Forecast Order Window', volumeKg: 142, growth: '+34%', x: 150, y: 18 },
];

function DemandIntelligenceWorkspace() {
  const [activeIdx, setActiveIdx] = useState<number>(4);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % TELEMETRY_SERIES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activePoint = TELEMETRY_SERIES[activeIdx];
  const tooltipX = Math.max(10, Math.min(115, activePoint.x - 20));
  const tooltipY = Math.max(0, activePoint.y - 18);

  return (
    <div
      className="bmoat-workspace"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background CAD Grid */}
      <svg className="bmoat-frame-bg-svg" viewBox="0 0 340 236" fill="none" aria-hidden="true">
        <path d="M10 190 L170 140 L330 190 L170 240 Z" stroke="rgba(168, 85, 247, 0.12)" strokeWidth="0.7" fill="rgba(147, 51, 234, 0.02)" />
        <line x1="50" y1="178" x2="210" y2="228" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="0.7" />
        <line x1="90" y1="165" x2="250" y2="215" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="0.7" />
        <line x1="130" y1="152" x2="290" y2="202" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="0.7" />
      </svg>

      {/* 3D Product Stage (Left) */}
      <div className="bmoat-stage-left">
        <img
          src="/brand/pouch_3d_cutout.png"
          alt="Hillfold Arabica Coffee Pouch 3D"
          className="bmoat-stage-img"
        />
        <div className="bmoat-stage-shadow" />
      </div>

      {/* Crisp HTML Glass HUD (Right) */}
      <div className="bmoat-hud-right">
        {/* Top Header */}
        <div className="bmoat-hud-row-head">
          <div className="bmoat-hud-badge-green">
            <span className="bmoat-live-dot" />
            <span>Arabica AA Roast</span>
          </div>
          <div className="bmoat-hud-capsule-purple">
            {activePoint.growth} RISING
          </div>
        </div>

        {/* Interactive Scrubbable Trendline */}
        <div className="bmoat-hud-chart-box">
          <svg className="bmoat-hud-chart-svg" viewBox="0 0 165 75" fill="none">
            <defs>
              <linearGradient id="curveGrad1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="50%" stopColor="#C084FC" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
              <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9333EA" stopOpacity="0.38" />
                <stop offset="60%" stopColor="#7C4DDB" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#0B0A14" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Guides */}
            <line x1="8" y1="20" x2="158" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
            <line x1="8" y1="42" x2="158" y2="42" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
            <line x1="8" y1="64" x2="158" y2="64" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />

            {/* Shaded Area Under Curve */}
            <path
              d="M 15 65 Q 45 60, 82 46 T 150 18 L 150 68 L 15 68 Z"
              fill="url(#areaGrad1)"
            />

            {/* Glowing Line */}
            <path
              d="M 15 65 Q 45 60, 82 46 T 150 18"
              fill="none"
              stroke="url(#curveGrad1)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />

            {/* Dynamic Laser Guide */}
            <line
              x1={activePoint.x}
              y1={activePoint.y}
              x2={activePoint.x}
              y2="66"
              stroke="#C084FC"
              strokeWidth="1"
              strokeDasharray="2 2"
              strokeOpacity="0.75"
            />

            {/* 5 Scrub Points */}
            {TELEMETRY_SERIES.map((pt, pIdx) => {
              const isSelected = activeIdx === pIdx;
              return (
                <g
                  key={pt.week}
                  onClick={() => {
                    setActiveIdx(pIdx);
                    setIsPaused(true);
                  }}
                  onMouseEnter={() => {
                    setActiveIdx(pIdx);
                    setIsPaused(true);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={pt.x} cy={pt.y} r="10" fill="transparent" />
                  {isSelected ? (
                    <>
                      <circle cx={pt.x} cy={pt.y} r="4.5" fill="#FFFFFF" />
                      <circle cx={pt.x} cy={pt.y} r="2.2" fill="#6D28D9" />
                    </>
                  ) : (
                    <circle cx={pt.x} cy={pt.y} r="2.4" fill="#1C182F" stroke="#A855F7" strokeWidth="0.8" />
                  )}
                </g>
              );
            })}

            {/* Floating Tooltip Pill */}
            <g transform={`translate(${tooltipX}, ${tooltipY})`}>
              <rect width="38" height="15" rx="4" fill="#6D28D9" stroke="#A855F7" strokeWidth="0.6" />
              <text x="19" y="11" fill="#FFFFFF" fontSize="8" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">
                {activePoint.volumeKg} kg
              </text>
            </g>
          </svg>

          {/* Crisp X-Axis HTML Labels */}
          <div className="bmoat-hud-axis-row">
            {TELEMETRY_SERIES.map((pt, pIdx) => (
              <span
                key={pt.week}
                className={`bmoat-hud-axis-lbl ${activeIdx === pIdx ? 'active' : ''}`}
                onClick={() => {
                  setActiveIdx(pIdx);
                  setIsPaused(true);
                }}
              >
                {pt.week}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Meta Row */}
        <div className="bmoat-hud-footer-row">
          <span className="bmoat-hud-footer-desc">{activePoint.stageLabel}</span>
          <span className="bmoat-hud-footer-tag">
            {isPaused ? 'PAUSED' : 'AUTO-RUNNING'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   WORKSPACE 02: DIRECT CAFÉ DISCOVERY
   - Enhanced 3D Craft Glass Bottle on Turntable Pedestal
   - Dynamic Laser Spline Connector with streaming animated photon node
   - Interactive Venue Tabs & Sensory Cupping HUD
───────────────────────────────────────────────────────────────────────────── */
interface TrialStage {
  id: string;
  tabLabel: string;
  venue: string;
  location: string;
  lifecycleStatus: string;
  evaluator: string;
  sensoryQuote: string;
  cuppingScore: string;
}

const TRIAL_LIFECYCLE: TrialStage[] = [
  {
    id: 'tamarind',
    tabLabel: 'Tamarind',
    venue: 'Tamarind Lane Roastery',
    location: 'Hauz Khas · Roaster Tier 1 (42 Venues)',
    lifecycleStatus: 'TRIAL ACTIVE · IN BREW',
    evaluator: 'Head Barista Tasting Evaluation',
    sensoryQuote: '“Dense microfoam balance & zero curdling approved”',
    cuppingScore: '★ 4.8',
  },
  {
    id: 'hillfold',
    tabLabel: 'Hillfold',
    venue: 'Hillfold Espresso Lab',
    location: 'Indiranagar · Multi-Outlet Barista Team',
    lifecycleStatus: 'EN ROUTE · VAN SLOT 02',
    evaluator: 'Cold-Chain Dispatch Verification',
    sensoryQuote: '“Sample flight scheduled for calibration”',
    cuppingScore: 'CALIB',
  },
  {
    id: 'bramblegate',
    tabLabel: 'Bramble',
    venue: 'Bramblegate Roasters',
    location: 'Bandra West · Artisanal Single Origin',
    lifecycleStatus: 'EVALUATED · STANDING PO',
    evaluator: 'Lead Roaster Sensory Protocol',
    sensoryQuote: '“Signature iced vanilla latte test approved”',
    cuppingScore: '★ 5.0',
  },
];

function SamplingFlightsWorkspace() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setSelectedIdx((prev) => (prev + 1) % TRIAL_LIFECYCLE.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isPaused]);

  const currentStage = TRIAL_LIFECYCLE[selectedIdx];

  return (
    <div
      className="bmoat-workspace"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background CAD Grid & Glowing Laser Spline Connector */}
      <svg className="bmoat-frame-bg-svg" viewBox="0 0 340 236" fill="none" aria-hidden="true">
        <path d="M10 190 L170 140 L330 190 L170 240 Z" stroke="rgba(168, 85, 247, 0.12)" strokeWidth="0.7" fill="rgba(147, 51, 234, 0.02)" />
        {/* Dynamic laser spline connector path from bottle's neck to card */}
        <path d="M 72 135 C 92 135, 102 102, 114 98" stroke="rgba(192, 132, 252, 0.75)" strokeWidth="1.6" strokeDasharray="3 3" />
        {/* Constant Streaming Photon Pulse along the Path */}
        <circle r="3" fill="#FFFFFF" filter="drop-shadow(0 0 6px #C084FC)">
          <animateMotion dur="2.2s" repeatCount="indefinite" path="M 72 135 C 92 135, 102 102, 114 98" />
        </circle>
      </svg>

      {/* 3D Product Stage with Turntable Base (Left) */}
      <div className="bmoat-stage-left">
        <img
          src="/brand/bottle_3d_cutout.png"
          alt="Tamarind Lane Craft Bottle 3D"
          className="bmoat-stage-img bottle"
        />
        <div className="bmoat-stage-turntable" />
        <div className="bmoat-stage-shadow" />
      </div>

      {/* Crisp HTML Glass HUD (Right) */}
      <div className="bmoat-hud-right">
        {/* Interactive Clickable Venue Tabs */}
        <div className="bmoat-hud-tabs">
          {TRIAL_LIFECYCLE.map((stg, sIdx) => {
            const isTabSelected = selectedIdx === sIdx;
            return (
              <button
                key={stg.id}
                type="button"
                className={`bmoat-hud-tab-btn ${isTabSelected ? 'active' : ''}`}
                onClick={() => {
                  setSelectedIdx(sIdx);
                  setIsPaused(true);
                }}
              >
                {stg.tabLabel}
              </button>
            );
          })}
        </div>

        {/* Live Status Row */}
        <div className="bmoat-hud-row-head" style={{ marginTop: '3px' }}>
          <div className="bmoat-hud-badge-green">
            <span className="bmoat-live-dot" />
            <span>{currentStage.lifecycleStatus}</span>
          </div>
          <div className="bmoat-hud-capsule-purple">
            STAGE 0{selectedIdx + 1}
          </div>
        </div>

        {/* Venue Information */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage.id}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.2 }}
            className="bmoat-hud-venue-block"
          >
            <div className="bmoat-hud-venue-title">{currentStage.venue}</div>
            <div className="bmoat-hud-venue-meta">{currentStage.location}</div>
          </motion.div>
        </AnimatePresence>

        {/* Sensory Evaluation Box */}
        <div className="bmoat-hud-sensory-box">
          <div className="bmoat-hud-sensory-head">
            <span>{currentStage.evaluator}</span>
            <span className="bmoat-hud-score-badge">{currentStage.cuppingScore}</span>
          </div>
          <p className="bmoat-hud-sensory-quote">{currentStage.sensoryQuote}</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   WORKSPACE 03: AUTOMATED REORDERS
   - Enhanced 3D Barista Oat Milk Carton with grounded stage
   - Branching Highway Connector Lines with continuous streaming packet
   - Stacked Interactive Purchase Order Rows
───────────────────────────────────────────────────────────────────────────── */
interface OrderVelocityRow {
  id: string;
  initial: string;
  venue: string;
  status: string;
  cases: string;
  badgeBg: string;
  statusColor: string;
  pathD: string;
}

const VELOCITY_ROWS: OrderVelocityRow[] = [
  {
    id: 'hillfold',
    initial: 'H',
    venue: 'Hillfold Roastery',
    status: 'Net-15 Recurring PO',
    cases: '12 cs',
    badgeBg: '#6D28D9',
    statusColor: '#10B981',
    pathD: 'M 74 110 C 95 110, 102 68, 114 68',
  },
  {
    id: 'tamarind',
    initial: 'T',
    venue: 'Tamarind Lane Café',
    status: 'Order Dispatched · Van 04',
    cases: '8 cs',
    badgeBg: '#4C1D95',
    statusColor: '#93C5FD',
    pathD: 'M 74 110 L 114 112',
  },
  {
    id: 'bramblegate',
    initial: 'B',
    venue: 'Bramblegate Roasters',
    status: 'Standing PO · Ready',
    cases: '16 cs',
    badgeBg: '#3B0764',
    statusColor: '#C084FC',
    pathD: 'M 74 110 C 95 110, 102 156, 114 156',
  },
];

function OrderVelocityWorkspace() {
  const [activeRowIdx, setActiveRowIdx] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveRowIdx((prev) => (prev + 1) % VELOCITY_ROWS.length);
    }, 2600);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeRow = VELOCITY_ROWS[activeRowIdx];

  return (
    <div
      className="bmoat-workspace"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background CAD Grid & Branching Highway Lines */}
      <svg className="bmoat-frame-bg-svg" viewBox="0 0 340 236" fill="none" aria-hidden="true">
        <path d="M10 190 L170 140 L330 190 L170 240 Z" stroke="rgba(168, 85, 247, 0.12)" strokeWidth="0.7" fill="rgba(147, 51, 234, 0.02)" />
        {/* Dynamic Branching Highway Paths */}
        {VELOCITY_ROWS.map((row, rIdx) => {
          const isRowActive = activeRowIdx === rIdx;
          return (
            <path
              key={row.id}
              d={row.pathD}
              stroke={isRowActive ? '#C084FC' : 'rgba(168, 85, 247, 0.35)'}
              strokeWidth={isRowActive ? '1.8' : '1.2'}
              strokeLinecap="round"
            />
          );
        })}
        {/* Continuous Streaming Packet along Active Row Path */}
        <circle r="3.2" fill="#FFFFFF" filter="drop-shadow(0 0 6px #C084FC)">
          <animateMotion
            dur="1.8s"
            repeatCount="indefinite"
            path={activeRow.pathD}
          />
        </circle>
        {/* Connection node on carton */}
        <circle cx="74" cy="110" r="3.5" fill="#A855F7" />
        <circle cx="74" cy="110" r="6" stroke="#C084FC" strokeWidth="0.8" opacity="0.6" />
      </svg>

      {/* 3D Product Stage (Left) */}
      <div className="bmoat-stage-left">
        <img
          src="/brand/carton_3d_cutout.png"
          alt="Barista Oat Milk Carton 3D"
          className="bmoat-stage-img"
        />
        <div className="bmoat-stage-shadow" />
      </div>

      {/* Crisp HTML Glass HUD (Right) */}
      <div className="bmoat-hud-right">
        {/* Scale Header */}
        <div className="bmoat-hud-row-head">
          <div className="bmoat-hud-badge-green" style={{ color: '#E9D5FF' }}>
            <span className="bmoat-live-dot" style={{ background: '#A855F7', boxShadow: '0 0 8px #A855F7' }} />
            <span>ACTIVE VELOCITY</span>
          </div>
          <div className="bmoat-hud-capsule-purple" style={{ background: '#6D28D9', borderColor: '#A855F7' }}>
            148 CAFÉS
          </div>
        </div>

        {/* Stacked Interactive PO Cards */}
        <div className="bmoat-hud-po-list">
          {VELOCITY_ROWS.map((row, rIdx) => {
            const isSelected = activeRowIdx === rIdx;

            return (
              <div
                key={row.id}
                className={`bmoat-hud-po-row ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setActiveRowIdx(rIdx);
                  setIsPaused(true);
                }}
                onMouseEnter={() => {
                  setActiveRowIdx(rIdx);
                  setIsPaused(true);
                }}
              >
                <div className="bmoat-hud-po-avatar" style={{ background: row.badgeBg }}>
                  {row.initial}
                </div>
                <div className="bmoat-hud-po-info">
                  <div className="bmoat-hud-po-name">{row.venue}</div>
                  <div className="bmoat-hud-po-status" style={{ color: row.statusColor }}>
                    ● {row.status}
                  </div>
                </div>
                <div className="bmoat-hud-po-qty">{row.cases}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
