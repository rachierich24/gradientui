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
            India&apos;s café economy.
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
                {/* Oversized Background Number in Restrained Violet Contour */}
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
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="bmoat-card-inner">
                    {/* Top: Card Title & Precision Category Pill */}
                    <div className="bmoat-card-top">
                      <h3 className="bmoat-card-title">{card.title}</h3>
                      <div className="bmoat-pill">{card.pill}</div>
                    </div>

                    {/* Middle: 3D Product Visual Workspace with Crisp HUD */}
                    <div className="bmoat-graphic-frame">
                      {idx === 0 && <DemandIntelligenceWorkspace />}
                      {idx === 1 && <SamplingFlightsWorkspace />}
                      {idx === 2 && <OrderVelocityWorkspace />}
                    </div>

                    {/* Bottom: Editorial Description */}
                    <p className="bmoat-card-desc">{card.description}</p>

                    {/* Bottom Divider & Razor-Sharp Pointers */}
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
   - Foreground 3D Coffee Pouch with soft contact shadow & violet rim glow
   - Clean, uncluttered forecast telemetry with scrubbable / auto-cycling points
   - Single glowing trendline, peak forecast node, zero visual clutter
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
  { week: 'W1', stageLabel: 'Baseline Roast Cycle', volumeKg: 48, growth: '+12%', x: 12, y: 58 },
  { week: 'W2', stageLabel: 'Secondary Roaster Pull', volumeKg: 68, growth: '+19%', x: 46, y: 52 },
  { week: 'W3', stageLabel: 'Hauz Khas Cluster Surge', volumeKg: 94, growth: '+25%', x: 80, y: 42 },
  { week: 'W4', stageLabel: 'Multi-Outlet Depletion', volumeKg: 118, growth: '+29%', x: 114, y: 28 },
  { week: 'W5', stageLabel: 'Peak Forecast Order Window', volumeKg: 142, growth: '+34%', x: 148, y: 14 },
];

function DemandIntelligenceWorkspace() {
  const [activeIdx, setActiveIdx] = useState<number>(4);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % TELEMETRY_SERIES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activePoint = TELEMETRY_SERIES[activeIdx];
  const tooltipX = Math.max(6, Math.min(98, activePoint.x - 26));
  const tooltipY = Math.max(1, activePoint.y - 12);

  return (
    <div
      className="bmoat-workspace"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle Ground CAD Grid */}
      <svg className="bmoat-frame-bg-svg" viewBox="0 0 340 236" fill="none" aria-hidden="true">
        <path d="M10 190 L170 140 L330 190 L170 240 Z" stroke="rgba(168, 85, 247, 0.08)" strokeWidth="0.7" fill="rgba(147, 51, 234, 0.015)" />
        <line x1="50" y1="178" x2="210" y2="228" stroke="rgba(168, 85, 247, 0.06)" strokeWidth="0.6" />
        <line x1="90" y1="165" x2="250" y2="215" stroke="rgba(168, 85, 247, 0.06)" strokeWidth="0.6" />
      </svg>

      {/* Foreground 3D Product (Left) */}
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
            {activePoint.growth} Surge
          </div>
        </div>

        {/* Clean Forecast Chart */}
        <div className="bmoat-hud-chart-box">
          <svg className="bmoat-hud-chart-svg" viewBox="0 0 160 68" fill="none">
            <defs>
              <linearGradient id="curveGrad1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9333EA" />
                <stop offset="60%" stopColor="#C084FC" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
              <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A855F7" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#08070D" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Restrained Guide Lines */}
            <line x1="5" y1="18" x2="155" y2="18" stroke="rgba(255,255,255,0.04)" strokeDasharray="2 2" />
            <line x1="5" y1="38" x2="155" y2="38" stroke="rgba(255,255,255,0.04)" strokeDasharray="2 2" />
            <line x1="5" y1="58" x2="155" y2="58" stroke="rgba(255,255,255,0.04)" strokeDasharray="2 2" />

            {/* Shaded Area Under Curve */}
            <path
              d="M 12 58 Q 45 54, 80 42 T 148 14 L 148 62 L 12 62 Z"
              fill="url(#areaGrad1)"
            />

            {/* Glowing Line */}
            <path
              d="M 12 58 Q 45 54, 80 42 T 148 14"
              fill="none"
              stroke="url(#curveGrad1)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Dynamic Laser Guide on Active Node */}
            <line
              x1={activePoint.x}
              y1={activePoint.y}
              x2={activePoint.x}
              y2="60"
              stroke="#C084FC"
              strokeWidth="0.9"
              strokeDasharray="2 2"
              strokeOpacity="0.6"
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
                  <circle cx={pt.x} cy={pt.y} r="8" fill="transparent" />
                  {isSelected ? (
                    <circle cx={pt.x} cy={pt.y} r="4.2" fill="#FFFFFF" stroke="#9333EA" strokeWidth="1.8" />
                  ) : (
                    <circle cx={pt.x} cy={pt.y} r="2.2" fill="#1C182F" stroke="#A855F7" strokeWidth="0.7" />
                  )}
                </g>
              );
            })}

            {/* Floating Tooltip Pill */}
            <g transform={`translate(${tooltipX}, ${tooltipY})`}>
              <rect width="52" height="15" rx="4" fill="#581C87" stroke="#A855F7" strokeWidth="0.6" />
              <text x="26" y="10.5" fill="#FFFFFF" fontSize="7.5" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">
                {activePoint.volumeKg} kg · {activeIdx === 4 ? 'Peak' : 'Forecast'}
              </text>
            </g>
          </svg>

          {/* Crisp X-Axis Labels */}
          <div className="bmoat-hud-axis-row">
            {TELEMETRY_SERIES.map((pt, pIdx) => (
              <span
                key={pt.week}
                className={`bmoat-hud-axis-lbl ${activeIdx === pIdx ? 'active' : ''}`}
                onClick={() => {
                  setActiveIdx(pIdx);
                  setIsPaused(true);
                }}
                onMouseEnter={() => {
                  setActiveIdx(pIdx);
                  setIsPaused(true);
                }}
              >
                {pt.week}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Footer Meta with Safe Spacing */}
        <div className="bmoat-hud-footer-row">
          <span className="bmoat-hud-footer-desc">Hauz Khas Cluster</span>
          <strong className="bmoat-hud-footer-tag">TELEMETRY ACTIVE</strong>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   WORKSPACE 02: DIRECT CAFÉ DISCOVERY
   - Large, recognizable 3D Craft Glass Bottle on dark pedestal
   - Restrained hairline connector spline with calm streaming photon
   - Focused, single-window trial preview: one product, one café identity,
     one trial status, one tasting evaluation
───────────────────────────────────────────────────────────────────────────── */
interface TrialVenue {
  id: string;
  stageNum: string;
  stageShort: string;
  venue: string;
  location: string;
  cuppingScore: string;
  sensoryQuote: string;
}

const TRIAL_VENUES: TrialVenue[] = [
  {
    id: 'tamarind',
    stageNum: '02',
    stageShort: 'In Brew',
    venue: 'Tamarind Lane Roastery',
    location: 'Hauz Khas · Roaster Tier 1 (42 Venues)',
    cuppingScore: '★ 4.9',
    sensoryQuote: '“Dense microfoam balance & zero curdling approved”',
  },
  {
    id: 'hillfold',
    stageNum: '01',
    stageShort: 'Active',
    venue: 'Hillfold Espresso Lab',
    location: 'Indiranagar · Multi-Outlet Barista Team',
    cuppingScore: '★ 4.8',
    sensoryQuote: '“Clean cold-chain delivery and excellent crema stability”',
  },
  {
    id: 'bramblegate',
    stageNum: '03',
    stageShort: 'Ready',
    venue: 'Bramblegate Roastery',
    location: 'Bandra West · Artisanal Single Origin',
    cuppingScore: '★ 5.0',
    sensoryQuote: '“Signature cold brew flight evaluated and approved”',
  },
];

function SamplingFlightsWorkspace() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setSelectedIdx((prev) => (prev + 1) % TRIAL_VENUES.length);
    }, 4800);
    return () => clearInterval(timer);
  }, [isPaused]);

  const currentVenue = TRIAL_VENUES[selectedIdx];

  return (
    <div
      className="bmoat-workspace"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background CAD Grid & Delicate Hairline Spline Connector */}
      <svg className="bmoat-frame-bg-svg" viewBox="0 0 340 236" fill="none" aria-hidden="true">
        <path d="M10 190 L170 140 L330 190 L170 240 Z" stroke="rgba(168, 85, 247, 0.08)" strokeWidth="0.7" fill="rgba(147, 51, 234, 0.015)" />
        {/* Dynamic laser spline connector path from bottle's neck to card */}
        <path d="M 72 135 C 92 135, 102 102, 114 98" stroke="rgba(192, 132, 252, 0.55)" strokeWidth="1.2" strokeDasharray="3 3" />
        {/* Constant Streaming Photon Pulse along the Path */}
        <circle r="2.8" fill="#FFFFFF" filter="drop-shadow(0 0 5px #C084FC)">
          <animateMotion dur="2.8s" repeatCount="indefinite" path="M 72 135 C 92 135, 102 102, 114 98" />
        </circle>
      </svg>

      {/* 3D Product Stage on Subtle Pedestal (Left) */}
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
        {/* Live Status Row */}
        <div className="bmoat-hud-row-head">
          <div className="bmoat-hud-badge-green">
            <span className="bmoat-live-dot" />
            <span>Sampling Flight</span>
          </div>
          <div className="bmoat-hud-capsule-purple">
            Stage {currentVenue.stageNum} · {currentVenue.stageShort}
          </div>
        </div>

        {/* Venue Information with smooth crossfade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVenue.id}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.22 }}
            className="bmoat-hud-venue-block"
          >
            <div className="bmoat-hud-venue-title">{currentVenue.venue}</div>
            <div className="bmoat-hud-venue-meta">{currentVenue.location}</div>
          </motion.div>
        </AnimatePresence>

        {/* Sensory Evaluation Box with smooth crossfade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVenue.id + '-sensory'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bmoat-hud-sensory-box"
          >
            <div className="bmoat-hud-sensory-head">
              <span>Head Barista Sensory Score</span>
              <span className="bmoat-hud-score-badge">{currentVenue.cuppingScore}</span>
            </div>
            <p className="bmoat-hud-sensory-quote">{currentVenue.sensoryQuote}</p>
          </motion.div>
        </AnimatePresence>

        {/* Footer Status with Safe Breathing Room */}
        <div className="bmoat-hud-footer-row">
          <span>Cold-Chain Dispatch</span>
          <strong className="bmoat-hud-footer-tag">CALIBRATED</strong>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   WORKSPACE 03: AUTOMATED REORDERS
   - Prominent 3D Barista Oat Milk carton with grounded stage
   - Single clean active PO route connector with animated photon pulse
   - Three compact café order rows with clear identities and stable dimensions
───────────────────────────────────────────────────────────────────────────── */
interface OrderVelocityRow {
  id: string;
  initial: string;
  venue: string;
  status: string;
  cases: string;
  avatarBg: string;
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
    avatarBg: '#6D28D9',
    statusColor: '#10B981',
    pathD: 'M 74 110 C 95 110, 102 68, 114 68',
  },
  {
    id: 'tamarind',
    initial: 'T',
    venue: 'Tamarind Lane Café',
    status: 'Dispatched · Van 04',
    cases: '8 cs',
    avatarBg: '#3B1B54',
    statusColor: '#93C5FD',
    pathD: 'M 74 110 L 114 112',
  },
  {
    id: 'bramblegate',
    initial: 'B',
    venue: 'Bramblegate Roastery',
    status: 'Standing PO · Ready',
    cases: '16 cs',
    avatarBg: '#231336',
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
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeRow = VELOCITY_ROWS[activeRowIdx];

  return (
    <div
      className="bmoat-workspace"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background CAD Grid & Active Highway Line */}
      <svg className="bmoat-frame-bg-svg" viewBox="0 0 340 236" fill="none" aria-hidden="true">
        <path d="M10 190 L170 140 L330 190 L170 240 Z" stroke="rgba(168, 85, 247, 0.08)" strokeWidth="0.7" fill="rgba(147, 51, 234, 0.015)" />
        {/* Dynamic Highway Path to Active Row */}
        <path
          d={activeRow.pathD}
          stroke="rgba(192, 132, 252, 0.75)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        {/* Continuous Streaming Packet along Active Row Path */}
        <circle r="2.8" fill="#FFFFFF" filter="drop-shadow(0 0 5px #C084FC)">
          <animateMotion
            dur="2.4s"
            repeatCount="indefinite"
            path={activeRow.pathD}
          />
        </circle>
        {/* Connection node on carton */}
        <circle cx="74" cy="110" r="3" fill="#A855F7" />
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
        {/* Header */}
        <div className="bmoat-hud-row-head">
          <div className="bmoat-hud-badge-green" style={{ color: '#E9D5FF' }}>
            <span className="bmoat-live-dot" style={{ background: '#A855F7', boxShadow: '0 0 6px #A855F7' }} />
            <span>Recurring Velocity</span>
          </div>
          <div className="bmoat-hud-capsule-purple">
            148 Cafés
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
                <div className="bmoat-hud-po-avatar" style={{ background: row.avatarBg }}>
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
