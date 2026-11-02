'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { DemandStrata3D, CafeDiscovery3D, OrderVelocity3D } from './Moat3DArtwork';

interface CapabilityPillar {
  id: string;
  num: string;
  pillar: string;
  title: string;
  subtitle: string;
  metric1Val: string;
  metric1Lbl: string;
  metric2Val: string;
  metric2Lbl: string;
  tags: string[];
}

const PILLARS: CapabilityPillar[] = [
  {
    id: 'demand-intelligence',
    num: '01',
    pillar: 'PILLAR 01 · TELEMETRY',
    title: 'Demand Intelligence',
    subtitle: 'Track real-time roastery consumption to schedule batch production with zero deadstock.',
    metric1Val: '98.4%',
    metric1Lbl: 'Forecast Accuracy',
    metric2Val: '0 kg',
    metric2Lbl: 'Distributor Deadstock',
    tags: ['Live Cluster Telemetry', 'Batch Production Intent'],
  },
  {
    id: 'cafe-trials',
    num: '02',
    pillar: 'PILLAR 02 · DISCOVERY',
    title: 'Direct Café Sampling',
    subtitle: 'Seed product flights directly to head baristas with verified cupping and sensory scores.',
    metric1Val: '40+',
    metric1Lbl: 'Verified Roasteries',
    metric2Val: '★ 4.9',
    metric2Lbl: 'Avg Microfoam Score',
    tags: ['Cold-Chain Dispatch', 'Head Barista Feedback'],
  },
  {
    id: 'automated-reorders',
    num: '03',
    pillar: 'PILLAR 03 · COMMERCE',
    title: 'Automated Reorders',
    subtitle: 'Convert approved trial flights into recurring Net-15 purchase orders without field sales.',
    metric1Val: '140+',
    metric1Lbl: 'Active Accounts',
    metric2Val: 'Net-15',
    metric2Lbl: 'Automated PO Channel',
    tags: ['Standing Replenishment', 'Instant Commercial POs'],
  },
];

export function BrandMoat() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Scroll progress tracked directly against the cards grid
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ['start end', 'center center'],
  });

  // Spring smoothing for organic, fluid response on wheel ticks and touch
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 26,
    mass: 0.25,
    restDelta: 0.0001,
  });

  // ── Phase 1: 01, 02, 03 numerals reveal ONE BY ONE ──────────────────────────
  const num0Opacity = useTransform(smoothProgress, [0.04, 0.18], [0, 1]);
  const num0Y = useTransform(smoothProgress, [0.04, 0.18], [-24, 0]);
  const num0Scale = useTransform(smoothProgress, [0.04, 0.18], [0.90, 1]);

  const num1Opacity = useTransform(smoothProgress, [0.18, 0.32], [0, 1]);
  const num1Y = useTransform(smoothProgress, [0.18, 0.32], [-24, 0]);
  const num1Scale = useTransform(smoothProgress, [0.18, 0.32], [0.90, 1]);

  const num2Opacity = useTransform(smoothProgress, [0.32, 0.46], [0, 1]);
  const num2Y = useTransform(smoothProgress, [0.32, 0.46], [-24, 0]);
  const num2Scale = useTransform(smoothProgress, [0.32, 0.46], [0.90, 1]);

  const numTransforms = [
    { opacity: num0Opacity, y: num0Y, scale: num0Scale },
    { opacity: num1Opacity, y: num1Y, scale: num1Scale },
    { opacity: num2Opacity, y: num2Y, scale: num2Scale },
  ];

  // ── Phase 2: AND THEN the 3 cards below come UP and OVER them ───────────────
  const card0Y = useTransform(smoothProgress, [0.48, 0.82], [115, 0]);
  const card1Y = useTransform(smoothProgress, [0.53, 0.87], [115, 0]);
  const card2Y = useTransform(smoothProgress, [0.58, 0.92], [115, 0]);

  const card0Opacity = useTransform(smoothProgress, [0.48, 0.68], [0, 1]);
  const card1Opacity = useTransform(smoothProgress, [0.53, 0.73], [0, 1]);
  const card2Opacity = useTransform(smoothProgress, [0.58, 0.78], [0, 1]);

  const cardTransforms = [
    { y: card0Y, opacity: card0Opacity },
    { y: card1Y, opacity: card1Opacity },
    { y: card2Y, opacity: card2Opacity },
  ];

  return (
    <section className="bmoat-section" id="capabilities" aria-labelledby="bmoat-title">
      <div className="bmoat-bg-glow" aria-hidden="true" />

      <div className="bmoat-container">
        {/* Editorial Section Header: The 3 Pillars of Brand Growth */}
        <div className="bmoat-header">
          <div className="bmoat-eyebrow">
            <span className="bmoat-eyebrow-line" aria-hidden="true" />
            <span>THE THREE PILLARS</span>
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
        <div className="bmoat-grid" ref={gridRef}>
          {PILLARS.map((card, idx) => {
            const isHovered = hoveredIdx === idx;
            const numT = numTransforms[idx];
            const cardT = cardTransforms[idx];

            return (
              <div key={card.id} className="bmoat-card-wrap">
                {/* Oversized Background Number in Restrained Violet Contour - Revealed 1 by 1 */}
                <motion.div
                  className={`bmoat-bg-num ${isHovered ? 'is-lit' : ''}`}
                  aria-hidden="true"
                  style={{
                    opacity: numT.opacity,
                    y: numT.y,
                    scale: numT.scale,
                  }}
                >
                  {card.num}
                </motion.div>

                {/* 3 Cards Coming Up and Over 01, 02, 03 - Pure Scroll-Driven Transition */}
                <motion.div
                  className={`bmoat-card ${isHovered ? 'is-hovered' : ''}`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    y: cardT.y,
                    opacity: cardT.opacity,
                  }}
                >
                  <div className="bmoat-card-inner">
                    {/* Top: Pillar Badge, Title & Crisp Value Prop */}
                    <div className="bmoat-card-top">
                      <div className="bmoat-pillar-badge">{card.pillar}</div>
                      <h3 className="bmoat-card-title">{card.title}</h3>
                      <p className="bmoat-pillar-sub">{card.subtitle}</p>
                    </div>

                    {/* Middle: 3D Product Visual Workspace with Crisp Minimal HUD */}
                    <div className="bmoat-graphic-frame">
                      {idx === 0 && <DemandIntelligenceWorkspace />}
                      {idx === 1 && <SamplingFlightsWorkspace />}
                      {idx === 2 && <OrderVelocityWorkspace />}
                    </div>

                    {/* Bottom: Minimal Pillar Commercial Metrics & Proof Tags */}
                    <div className="bmoat-pillar-footer">
                      <div className="bmoat-pillar-metrics">
                        <div className="bmoat-metric-item">
                          <span className="bmoat-metric-val">{card.metric1Val}</span>
                          <span className="bmoat-metric-lbl">{card.metric1Lbl}</span>
                        </div>
                        <div className="bmoat-metric-sep" aria-hidden="true" />
                        <div className="bmoat-metric-item">
                          <span className="bmoat-metric-val">{card.metric2Val}</span>
                          <span className="bmoat-metric-lbl">{card.metric2Lbl}</span>
                        </div>
                      </div>

                      <div className="bmoat-pillar-tags">
                        {card.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="bmoat-pillar-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
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
        <path d="M10 190 L170 140 L330 190 L170 240 Z" stroke="rgba(80, 43, 154, 0.2)" strokeWidth="0.7" fill="rgba(80, 43, 154, 0.03)" />
        <line x1="50" y1="178" x2="210" y2="228" stroke="rgba(80, 43, 154, 0.14)" strokeWidth="0.6" />
        <line x1="90" y1="165" x2="250" y2="215" stroke="rgba(80, 43, 154, 0.14)" strokeWidth="0.6" />
      </svg>

      {/* Super 3D Interactive Artwork: Demand Strata Stack (Marco Madonna style) */}
      <div className="bmoat-stage-left">
        <DemandStrata3D activeIdx={activeIdx} isHovered={isPaused} />
      </div>

      {/* Aesthetic Minimalist HUD (Right) */}
      <div className="bmoat-hud-right">
        {/* Top Header */}
        <div className="bmoat-hud-row-head">
          <div className="bmoat-hud-badge-clean">
            <span className="bmoat-live-dot" />
            <span>Arabica AA</span>
          </div>
          <div className="bmoat-hud-capsule-purple">
            {activePoint.growth} Surge
          </div>
        </div>

        {/* Hero Metric Callout */}
        <div className="bmoat-hud-stat-hero">
          <div className="bmoat-hud-big-num">
            {activePoint.volumeKg} <span className="bmoat-hud-unit">kg/wk</span>
          </div>
          <div className="bmoat-hud-sublabel">{activeIdx === 4 ? 'Peak Forecast Window' : 'Consumption Run-Rate'}</div>
        </div>

        {/* Clean Forecast Sparkline */}
        <div className="bmoat-hud-chart-box">
          <svg className="bmoat-hud-chart-svg" viewBox="0 0 160 48" fill="none">
            <defs>
              <linearGradient id="curveGrad1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3A1F70" />
                <stop offset="50%" stopColor="#502B9A" />
                <stop offset="100%" stopColor="#D9C6FA" />
              </linearGradient>
              <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#502B9A" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#08070D" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Shaded Area Under Curve */}
            <path
              d="M 12 40 Q 45 36, 80 26 T 148 10 L 148 44 L 12 44 Z"
              fill="url(#areaGrad1)"
            />

            {/* Glowing Line */}
            <path
              d="M 12 40 Q 45 36, 80 26 T 148 10"
              fill="none"
              stroke="url(#curveGrad1)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* 5 Scrub Points */}
            {TELEMETRY_SERIES.map((pt, pIdx) => {
              const isSelected = activeIdx === pIdx;
              const mappedY = 40 - (pt.volumeKg - 48) * (30 / 94);
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
                  <circle cx={pt.x} cy={mappedY} r="7" fill="transparent" />
                  {isSelected ? (
                    <circle cx={pt.x} cy={mappedY} r="3.5" fill="#FFFFFF" stroke="#502B9A" strokeWidth="1.8" />
                  ) : (
                    <circle cx={pt.x} cy={mappedY} r="2" fill="#150B28" stroke="#7F48E8" strokeWidth="0.8" />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Crisp X-Axis Strip */}
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

        {/* Dynamic Minimal Footer */}
        <div className="bmoat-hud-footer-clean">
          <span className="bmoat-hud-footer-cluster">Hauz Khas Cluster</span>
          <span className="bmoat-hud-footer-pill">Telemetry Active</span>
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
        <path d="M10 190 L170 140 L330 190 L170 240 Z" stroke="rgba(80, 43, 154, 0.2)" strokeWidth="0.7" fill="rgba(80, 43, 154, 0.03)" />
        {/* Dynamic laser spline connector path from bottle's neck to card */}
        <path d="M 72 135 C 92 135, 102 102, 114 98" stroke="rgba(127, 72, 232, 0.65)" strokeWidth="1.2" strokeDasharray="3 3" />
        {/* Constant Streaming Photon Pulse along the Path */}
        <circle r="2.8" fill="#FFFFFF" filter="drop-shadow(0 0 6px #7F48E8)">
          <animateMotion dur="2.8s" repeatCount="indefinite" path="M 72 135 C 92 135, 102 102, 114 98" />
        </circle>
      </svg>

      {/* Super 3D Interactive Artwork: Café Discovery Orbiting Nodes (Marco Madonna style) */}
      <div className="bmoat-stage-left">
        <CafeDiscovery3D activeVenueIdx={selectedIdx} isHovered={isPaused} />
      </div>

      {/* Aesthetic Minimalist HUD (Right) */}
      <div className="bmoat-hud-right">
        {/* Header */}
        <div className="bmoat-hud-row-head">
          <div className="bmoat-hud-badge-clean">
            <span className="bmoat-live-dot" />
            <span>Sample Flight</span>
          </div>
          <div className="bmoat-hud-capsule-purple">
            Stage {currentVenue.stageNum}
          </div>
        </div>

        {/* Hero Venue Identity */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVenue.id}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.18 }}
            className="bmoat-hud-venue-hero"
          >
            <div className="bmoat-hud-venue-name">{currentVenue.venue}</div>
            <div className="bmoat-hud-venue-loc">{currentVenue.location.split('·')[0].trim()} · Tier 1 Roaster</div>
          </motion.div>
        </AnimatePresence>

        {/* Minimal Sensory Score Card */}
        <div className="bmoat-hud-score-card">
          <div className="bmoat-hud-score-header">
            <span className="bmoat-hud-score-badge">{currentVenue.cuppingScore}</span>
            <span className="bmoat-hud-score-text">Head Barista Cupping</span>
          </div>
          <div className="bmoat-hud-verdict-clean">Microfoam & crema balance approved</div>
        </div>

        {/* Minimal Footer */}
        <div className="bmoat-hud-footer-clean">
          <span className="bmoat-hud-footer-cluster">Cold-Chain Route</span>
          <span className="bmoat-hud-footer-pill">Calibrated</span>
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
    avatarBg: '#251448',
    statusColor: '#B491F5',
    pathD: 'M 74 110 C 95 110, 102 68, 114 68',
  },
  {
    id: 'tamarind',
    initial: 'T',
    venue: 'Tamarind Lane Café',
    status: 'Dispatched · Van 04',
    cases: '8 cs',
    avatarBg: '#3A1F70',
    statusColor: '#D9C6FA',
    pathD: 'M 74 110 L 114 112',
  },
  {
    id: 'bramblegate',
    initial: 'B',
    venue: 'Bramblegate Roastery',
    status: 'Standing PO · Ready',
    cases: '16 cs',
    avatarBg: '#502B9A',
    statusColor: '#B491F5',
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
        <path d="M10 190 L170 140 L330 190 L170 240 Z" stroke="rgba(80, 43, 154, 0.2)" strokeWidth="0.7" fill="rgba(80, 43, 154, 0.03)" />
        {/* Dynamic Highway Path to Active Row */}
        <path
          d={activeRow.pathD}
          stroke="rgba(127, 72, 232, 0.75)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        {/* Continuous Streaming Packet along Active Row Path */}
        <circle r="2.8" fill="#FFFFFF" filter="drop-shadow(0 0 6px #7F48E8)">
          <animateMotion
            dur="2.4s"
            repeatCount="indefinite"
            path={activeRow.pathD}
          />
        </circle>
        {/* Connection node on carton */}
        <circle cx="74" cy="110" r="3" fill="#7F48E8" />
      </svg>

      {/* Super 3D Interactive Artwork: Automated Reorders 3x3 Matrix (Marco Madonna style) */}
      <div className="bmoat-stage-left">
        <OrderVelocity3D
          activeRowIdx={activeRowIdx}
          isHovered={isPaused}
          onSelectRow={(idx) => {
            setActiveRowIdx(idx);
            setIsPaused(true);
          }}
        />
      </div>

      {/* Aesthetic Minimalist HUD (Right) */}
      <div className="bmoat-hud-right">
        {/* Header */}
        <div className="bmoat-hud-row-head">
          <div className="bmoat-hud-badge-clean">
            <span className="bmoat-live-dot" style={{ background: '#7F48E8', boxShadow: '0 0 8px #7F48E8' }} />
            <span>Standing POs</span>
          </div>
          <div className="bmoat-hud-capsule-purple">
            148 Cafés
          </div>
        </div>

        {/* Hero Active PO Display */}
        <div className="bmoat-hud-po-hero">
          <div className="bmoat-hud-po-hero-top">
            <span className="bmoat-hud-po-hero-name">{activeRow.venue}</span>
            <span className="bmoat-hud-po-hero-qty">{activeRow.cases}/wk</span>
          </div>
          <div className="bmoat-hud-po-hero-status" style={{ color: activeRow.statusColor }}>
            ● {activeRow.status}
          </div>
        </div>

        {/* Clean Interactive Café Tabs */}
        <div className="bmoat-hud-tabs-row">
          {VELOCITY_ROWS.map((row, rIdx) => {
            const isSelected = activeRowIdx === rIdx;
            return (
              <button
                key={row.id}
                type="button"
                className={`bmoat-hud-tab-chip ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setActiveRowIdx(rIdx);
                  setIsPaused(true);
                }}
              >
                {row.initial} · {row.cases}
              </button>
            );
          })}
        </div>

        {/* Minimal Footer */}
        <div className="bmoat-hud-footer-clean">
          <span className="bmoat-hud-footer-cluster">Digital PO Stream</span>
          <span className="bmoat-hud-footer-pill">Automated</span>
        </div>
      </div>
    </div>
  );
}
