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
                {/* Oversized Background Number — peeks above and sinks behind the frosted card */}
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
                    {/* Card Title & Minimal Category Pill */}
                    <div className="bmoat-card-top">
                      <h3 className="bmoat-card-title">{card.title}</h3>
                      <div className="bmoat-pill">{card.pill}</div>
                    </div>

                    {/* Interactive, Running Capability Workspace */}
                    <div className="bmoat-graphic-frame">
                      {idx === 0 && <RunningDemandIntelligence />}
                      {idx === 1 && <RunningSamplingFlights />}
                      {idx === 2 && <RunningOrderVelocity />}
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
   MOCKUP 01: RUNNING DEMAND TELEMETRY
   - Continuous ambient telemetry scrubber running W1 -> W5 with smooth Framer springs.
   - User hover / scrub instantly locks to any point to inspect volume & roast burn.
   - Authentic B2B metrics: Batch Roast Run-rate, Depletion Velocity, Peak Demand.
───────────────────────────────────────────────────────────────────────────── */
interface TelemetryPoint {
  week: string;
  stageLabel: string;
  volumeKg: number;
  growth: string;
  burnRate: string;
  x: number;
  y: number;
}

const TELEMETRY_SERIES: TelemetryPoint[] = [
  { week: 'W1', stageLabel: 'Baseline Roast Cycle', volumeKg: 48, growth: '+12%', burnRate: 'Normal', x: 22, y: 104 },
  { week: 'W2', stageLabel: 'Secondary Roaster Pull', volumeKg: 68, growth: '+19%', burnRate: 'Steady', x: 58, y: 94 },
  { week: 'W3', stageLabel: 'Hauz Khas Cluster Surge', volumeKg: 94, growth: '+25%', burnRate: 'Elevated', x: 96, y: 80 },
  { week: 'W4', stageLabel: 'Multi-Outlet Depletion', volumeKg: 118, growth: '+29%', burnRate: 'High Velocity', x: 132, y: 66 },
  { week: 'W5', stageLabel: 'Peak Forecast Order Window', volumeKg: 142, growth: '+34%', burnRate: 'Batch Surge', x: 162, y: 50 },
];

function RunningDemandIntelligence() {
  const [activeIdx, setActiveIdx] = useState<number>(4);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isBagHovered, setIsBagHovered] = useState<boolean>(false);

  // Running ambient telemetry transition loop (advances smoothly every 2.4s unless hovered)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % TELEMETRY_SERIES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activePoint = TELEMETRY_SERIES[activeIdx];
  const tooltipX = Math.max(14, Math.min(116, activePoint.x - 24));
  const tooltipY = Math.max(30, activePoint.y - 24);

  return (
    <div
      className="bmoat-canvas"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <svg
        viewBox="0 0 340 220"
        className="bmoat-canvas-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="v1LineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="65%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#F3E8FF" />
          </linearGradient>
          <linearGradient id="v1AreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7E22CE" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="bagFrontFace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E1C2B" />
            <stop offset="100%" stopColor="#0F0D17" />
          </linearGradient>
          <linearGradient id="bagSideFace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#151322" />
            <stop offset="100%" stopColor="#090812" />
          </linearGradient>
          <filter id="softGlowV1" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Isometric Foundation Floor Grid with Coordinate Dots */}
        <g stroke="rgba(168, 85, 247, 0.12)" strokeWidth="0.75">
          <path
            d="M45 174 L170 126 L295 174 L170 210 Z"
            fill="rgba(147, 51, 234, 0.025)"
          />
          <line x1="82" y1="160" x2="207" y2="198" />
          <line x1="120" y1="145" x2="245" y2="183" />
          <circle cx="82" cy="160" r="1.5" fill="#8B5CF6" fillOpacity="0.4" />
          <circle cx="207" cy="198" r="1.5" fill="#8B5CF6" fillOpacity="0.4" />
          <circle cx="120" cy="145" r="1.5" fill="#8B5CF6" fillOpacity="0.4" />
          <circle cx="245" cy="183" r="1.5" fill="#8B5CF6" fillOpacity="0.4" />
        </g>

        {/* ─── LEFT: 2.5D Specialty Coffee Bag with Degassing Valve ─── */}
        <g
          className="bmoat-product-group"
          transform="translate(36, 52)"
          onMouseEnter={() => setIsBagHovered(true)}
          onMouseLeave={() => setIsBagHovered(false)}
          style={{ cursor: 'pointer' }}
        >
          {/* Base Drop Shadow */}
          <ellipse cx="38" cy="120" rx="30" ry="8" fill="#000000" fillOpacity="0.55" filter="blur(4px)" />

          {/* Top Folded Seal */}
          <path d="M12 12 L64 12 L58 18 L6 18 Z" fill="#26213A" stroke="#8B5CF6" strokeWidth="0.75" />
          <line x1="10" y1="15" x2="60" y2="15" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="0.5" strokeDasharray="2 1.5" />

          {/* Side Gusset */}
          <path
            d="M6 18 L18 24 L18 114 L6 108 Z"
            fill="url(#bagSideFace)"
            stroke="rgba(168, 85, 247, 0.3)"
            strokeWidth="0.75"
          />

          {/* Front Face with subtle hover illumination */}
          <path
            d="M18 24 L58 18 L68 108 L18 114 Z"
            fill="url(#bagFrontFace)"
            stroke={isBagHovered ? 'rgba(192, 132, 252, 0.75)' : 'rgba(168, 85, 247, 0.55)'}
            strokeWidth={isBagHovered ? '1.1' : '0.9'}
          />

          {/* Lavender Rim Highlight */}
          <path d="M18 24 L58 18 L68 108" stroke="rgba(216, 180, 254, 0.5)" strokeWidth="0.75" fill="none" />

          {/* Degassing Aroma Valve with Continuous Pulse Wave */}
          <circle cx="38" cy="45" r="4.2" fill="#171424" stroke="#8B5CF6" strokeWidth="0.8" />
          <circle cx="38" cy="45" r="1.5" fill="#C084FC" />
          <circle cx="38" cy="45" r="7" stroke="#A855F7" strokeWidth="0.6" strokeOpacity={isBagHovered ? 0.7 : 0.35} className="bmoat-ping" />

          {/* Pouch Label */}
          <rect
            x="24"
            y="58"
            width="34"
            height="38"
            rx="3"
            fill="#151221"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="0.6"
          />
          <rect x="27" y="63" width="28" height="2" rx="1" fill="#8B5CF6" />
          <text x="28" y="73" fill="#FFFFFF" fontSize="5" fontWeight="800" fontFamily="system-ui, sans-serif">
            HILLFOLD
          </text>
          <text x="28" y="80" fill="#C084FC" fontSize="4.2" fontWeight="600" fontFamily="system-ui, sans-serif">
            ARABICA AA
          </text>
          <text x="28" y="91" fill="#94A3B8" fontSize="3.6" fontFamily="system-ui, sans-serif">
            500G ROAST
          </text>
        </g>

        {/* ─── RIGHT: Running Demand Forecast Telemetry Interface ─── */}
        <g transform="translate(132, 40)">
          {/* Card Base */}
          <rect
            x="0"
            y="0"
            width="178"
            height="140"
            rx="10"
            fill="#0C0B14"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="0.8"
          />

          {/* Header Row: Live Telemetry Status + Dynamic Growth Badge */}
          <g transform="translate(14, 18)">
            <circle cx="0" cy="-2.5" r="2.5" fill="#22C55E" />
            <circle cx="0" cy="-2.5" r="5" stroke="#22C55E" strokeWidth="0.6" strokeOpacity="0.4" className="bmoat-ping" />
            <text x="8" y="0.5" fill="#F8FAFC" fontSize="8" fontWeight="700" fontFamily="system-ui, sans-serif">
              Arabica AA Roast
            </text>
            <rect
              x="104"
              y="-10"
              width="46"
              height="15"
              rx="7.5"
              fill="rgba(168, 85, 247, 0.14)"
              stroke="rgba(168, 85, 247, 0.35)"
              strokeWidth="0.75"
            />
            <text
              x="127"
              y="0.5"
              fill="#C084FC"
              fontSize="6.8"
              fontWeight="700"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
            >
              {activePoint.growth} RISING
            </text>
          </g>

          {/* Divider */}
          <line x1="14" y1="28" x2="164" y2="28" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.75" />

          {/* Chart Grid Lines */}
          <g stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" strokeWidth="0.75">
            <line x1="14" y1="52" x2="164" y2="52" />
            <line x1="14" y1="76" x2="164" y2="76" />
            <line x1="14" y1="104" x2="164" y2="104" />
          </g>

          {/* Shaded Area Under Forecast Curve */}
          <path
            d="M22 104 C 48 98, 78 86, 102 78 C 126 70, 148 56, 162 50 L 162 104 L 22 104 Z"
            fill="url(#v1AreaGrad)"
          />

          {/* Smooth Forecast Trendline */}
          <path
            d="M22 104 C 48 98, 78 86, 102 78 C 126 70, 148 56, 162 50"
            stroke="url(#v1LineGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Dynamic Scrub Vertical Cursor Guide Line */}
          <line
            x1={activePoint.x}
            y1={activePoint.y}
            x2={activePoint.x}
            y2="104"
            stroke="rgba(192, 132, 252, 0.6)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* 5 Weekly Points with Generous Interactive Hit Areas */}
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
                {/* Hit area */}
                <circle cx={pt.x} cy={pt.y} r="10" fill="transparent" />

                {isSelected ? (
                  <>
                    <circle cx={pt.x} cy={pt.y} r="5" fill="#C084FC" filter="url(#softGlowV1)" />
                    <circle cx={pt.x} cy={pt.y} r="2.2" fill="#FFFFFF" />
                  </>
                ) : (
                  <circle cx={pt.x} cy={pt.y} r="2.5" fill="#2E2840" stroke="#7C3AED" strokeWidth="0.8" />
                )}

                {/* X-Axis Week Labels */}
                <text
                  x={pt.x}
                  y="116"
                  fill={isSelected ? '#C084FC' : 'rgba(148, 163, 184, 0.6)'}
                  fontSize="6.5"
                  fontWeight={isSelected ? '700' : '500'}
                  textAnchor="middle"
                  fontFamily="system-ui, sans-serif"
                >
                  {pt.week}
                </text>
              </g>
            );
          })}

          {/* Floating Data Tooltip Centered Above the Active Point */}
          <g
            transform={`translate(${tooltipX}, ${tooltipY})`}
            className="bmoat-dynamic-tooltip"
          >
            <rect
              x="0"
              y="0"
              width="48"
              height="17"
              rx="4"
              fill="#161324"
              stroke="#A855F7"
              strokeWidth="0.85"
            />
            <text
              x="24"
              y="11.5"
              fill="#FFFFFF"
              fontSize="7.5"
              fontWeight="700"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
            >
              {activePoint.volumeKg} kg
            </text>
          </g>

          {/* Live Telemetry Status Footnote */}
          <g transform="translate(14, 130)">
            <text
              x="0"
              y="0"
              fill="rgba(203, 213, 225, 0.85)"
              fontSize="6.5"
              fontWeight="600"
              fontFamily="system-ui, sans-serif"
            >
              {activePoint.stageLabel}
            </text>
            <text
              x="150"
              y="0"
              fill={isPaused ? '#C084FC' : 'rgba(148, 163, 184, 0.6)'}
              fontSize="6"
              fontWeight={isPaused ? '700' : '500'}
              textAnchor="end"
              fontFamily="system-ui, sans-serif"
            >
              {isPaused ? 'PAUSED · TAP TO SCRUB' : 'AUTO-RUNNING'}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MOCKUP 02: RUNNING SAMPLING FLIGHTS & SENSORY LIFECYCLE
   - Continuous lifecycle transitions across 3 specialty café trial stages.
   - Live progress indicator showing dispatch -> barista cupping -> MOQ unlock.
   - Authentic B2B metrics: Microfoam Curdling Test, Extraction Balance, MOQ PO.
───────────────────────────────────────────────────────────────────────────── */
interface TrialStage {
  id: string;
  tabLabel: string;
  venue: string;
  location: string;
  lifecycleStatus: string;
  statusColor: string;
  evaluator: string;
  sensoryQuote: string;
  cuppingScore: string;
  actionNote: string;
  dockX: number;
  dockY: number;
}

const TRIAL_LIFECYCLE: TrialStage[] = [
  {
    id: 'tamarind',
    tabLabel: 'Tamarind',
    venue: 'Tamarind Lane Roastery',
    location: 'Hauz Khas · Roaster Tier 1 (42 Venues)',
    lifecycleStatus: 'TRIAL ACTIVE · IN BREW',
    statusColor: '#10B981',
    evaluator: 'Head Barista Tasting Evaluation',
    sensoryQuote: '"Dense microfoam balance & zero curdling approved"',
    cuppingScore: '★ 4.8',
    actionNote: 'Opening Net-15 MOQ Unlocked (12 Cases)',
    dockX: 74,
    dockY: 172,
  },
  {
    id: 'hillfold',
    tabLabel: 'Hillfold',
    venue: 'Hillfold Espresso Lab',
    location: 'Indiranagar · Multi-Outlet Barista Team',
    lifecycleStatus: 'EN ROUTE · VAN SLOT 02',
    statusColor: '#60A5FA',
    evaluator: 'Cold-Chain Dispatch Verification',
    sensoryQuote: '"Sample flight scheduled for morning calibration"',
    cuppingScore: 'CALIB',
    actionNote: 'Batch tracking active · ETA 08:30 AM',
    dockX: 74,
    dockY: 172,
  },
  {
    id: 'bramblegate',
    tabLabel: 'Bramble',
    venue: 'Bramblegate Roasters',
    location: 'Bandra West · Artisanal Single Origin',
    lifecycleStatus: 'EVALUATED · STANDING PO',
    statusColor: '#C084FC',
    evaluator: 'Lead Roaster Sensory Protocol',
    sensoryQuote: '"Signature iced vanilla latte test approved"',
    cuppingScore: '★ 5.0',
    actionNote: 'Recurring standing order confirmed (16 cs)',
    dockX: 74,
    dockY: 172,
  },
];

function RunningSamplingFlights() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Running ambient transition loop (rotates stage every 3.2s unless paused)
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
      className="bmoat-canvas"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <svg
        viewBox="0 0 340 220"
        className="bmoat-canvas-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="v2FluidGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7E22CE" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#4A1D72" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#2E0854" />
          </linearGradient>
          <linearGradient id="v2BeamGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
          </linearGradient>
          <filter id="softGlowV2" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Understated Isometric Foundation Plane */}
        <g stroke="rgba(168, 85, 247, 0.12)" strokeWidth="0.75">
          <path
            d="M45 174 L170 126 L295 174 L170 210 Z"
            fill="rgba(147, 51, 234, 0.025)"
          />
          <line x1="82" y1="160" x2="207" y2="198" />
          <line x1="120" y1="145" x2="245" y2="183" />
        </g>

        {/* ─── LEFT: Featured Craft Syrup Bottle & Glowing Pedestal Platform ─── */}
        <g transform="translate(50, 46)">
          {/* Circular Pedestal Platform Base */}
          <ellipse cx="24" cy="126" rx="22" ry="7.5" fill="rgba(168, 85, 247, 0.12)" stroke="rgba(192, 132, 252, 0.6)" strokeWidth="0.8" />
          <ellipse cx="24" cy="126" rx="14" ry="4.5" fill="#000000" fillOpacity="0.5" filter="blur(3px)" />

          {/* Gold Screw Cap */}
          <rect x="18" y="14" width="12" height="12" rx="1.5" fill="#D4AF37" stroke="#FDE047" strokeWidth="0.6" />
          <line x1="18" y1="18" x2="30" y2="18" stroke="#854D0E" strokeWidth="0.5" />
          <path d="M17 26 L31 26 L34 38 L14 38 Z" fill="#1C142A" stroke="rgba(216, 180, 254, 0.35)" strokeWidth="0.75" />

          {/* Glass Bottle Body */}
          <rect
            x="10"
            y="38"
            width="28"
            height="86"
            rx="5.5"
            fill="url(#v2FluidGrad)"
            stroke="rgba(168, 85, 247, 0.6)"
            strokeWidth="1"
          />

          {/* Specular Highlight Streak */}
          <path d="M13 42 L15.5 42 L15.5 118 L13 118 Z" fill="rgba(255, 255, 255, 0.22)" />

          {/* Bottle Front Label */}
          <rect x="14" y="58" width="20" height="46" rx="2" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5" />
          <rect x="16" y="62" width="16" height="2" fill="#6B21A8" />
          <text x="24" y="71" fill="#1E1B4B" fontSize="4.2" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">
            VANILLA
          </text>
          <text x="24" y="76" fill="#7E22CE" fontSize="3.6" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">
            CRAFT
          </text>
          <text x="24" y="81" fill="#64748B" fontSize="3" textAnchor="middle" fontFamily="system-ui, sans-serif">
            SYRUP
          </text>
          <line x1="17" y1="87" x2="31" y2="87" stroke="#CBD5E1" strokeWidth="0.4" />
          <text x="24" y="96" fill="#475569" fontSize="2.8" textAnchor="middle" fontFamily="system-ui, sans-serif">
            700 ML
          </text>
        </g>

        {/* Dynamic Dispatch Connector Beam to Card */}
        <path
          d="M86 150 C 110 142, 118 104, 132 98"
          stroke="url(#v2BeamGrad)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />

        {/* Flowing particle along beam */}
        <circle r="2.4" fill="#F3E8FF" filter="url(#softGlowV2)">
          <animateMotion
            dur="2.4s"
            repeatCount="indefinite"
            path="M86 150 C 110 142, 118 104, 132 98"
          />
        </circle>

        {/* ─── RIGHT: Interactive Sampling Flight Interface Card ─── */}
        <g transform="translate(132, 40)">
          {/* Card Base */}
          <rect
            x="0"
            y="0"
            width="178"
            height="140"
            rx="10"
            fill="#0C0B14"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="0.8"
          />

          {/* Interactive Café Flight Tabs on Top */}
          <g transform="translate(12, 10)">
            {TRIAL_LIFECYCLE.map((stg, sIdx) => {
              const isTabSelected = selectedIdx === sIdx;
              return (
                <g
                  key={stg.id}
                  transform={`translate(${sIdx * 52}, 0)`}
                  onClick={() => {
                    setSelectedIdx(sIdx);
                    setIsPaused(true);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x="0"
                    y="0"
                    width="48"
                    height="16"
                    rx="4"
                    fill={isTabSelected ? 'rgba(168, 85, 247, 0.22)' : 'rgba(255, 255, 255, 0.03)'}
                    stroke={isTabSelected ? '#A855F7' : 'rgba(255, 255, 255, 0.07)'}
                    strokeWidth="0.75"
                  />
                  <text
                    x="24"
                    y="10.5"
                    fill={isTabSelected ? '#F3E8FF' : 'rgba(148, 163, 184, 0.7)'}
                    fontSize="6.8"
                    fontWeight={isTabSelected ? '700' : '500'}
                    textAnchor="middle"
                    fontFamily="system-ui, sans-serif"
                  >
                    {stg.tabLabel}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Status Row with Live Ping */}
          <g transform="translate(14, 38)">
            <circle cx="2" cy="0" r="2.5" fill={currentStage.statusColor} />
            <circle cx="2" cy="0" r="5" stroke={currentStage.statusColor} strokeWidth="0.6" strokeOpacity="0.4" className="bmoat-ping" />
            <text x="10" y="2.5" fill={currentStage.statusColor} fontSize="7" fontWeight="700" letterSpacing="0.06em" fontFamily="system-ui, sans-serif">
              {currentStage.lifecycleStatus}
            </text>
            <text x="150" y="2.5" fill="rgba(148, 163, 184, 0.6)" fontSize="6.5" textAnchor="end" fontFamily="system-ui, sans-serif">
              STAGE 0{selectedIdx + 1}
            </text>
          </g>

          {/* Target Venue Details with Smooth Transition */}
          <AnimatePresence mode="wait">
            <motion.g
              key={currentStage.id}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.22 }}
            >
              <g transform="translate(14, 52)">
                <text x="0" y="8" fill="#F8FAFC" fontSize="8.5" fontWeight="700" fontFamily="system-ui, sans-serif">
                  {currentStage.venue}
                </text>
                <text x="0" y="19" fill="#94A3B8" fontSize="7" fontFamily="system-ui, sans-serif">
                  {currentStage.location}
                </text>
              </g>

              {/* Divider */}
              <line x1="14" y1="78" x2="164" y2="78" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.75" />

              {/* Barista Evaluation Block */}
              <g transform="translate(14, 88)">
                <rect
                  x="0"
                  y="0"
                  width="150"
                  height="38"
                  rx="6"
                  fill="rgba(168, 85, 247, 0.06)"
                  stroke="rgba(168, 85, 247, 0.2)"
                  strokeWidth="0.75"
                />
                <text x="8" y="13" fill="#F8FAFC" fontSize="7" fontWeight="600" fontFamily="system-ui, sans-serif">
                  {currentStage.evaluator}
                </text>
                <text x="8" y="25" fill="#C084FC" fontSize="6.8" fontFamily="system-ui, sans-serif">
                  {currentStage.sensoryQuote}
                </text>
                <text
                  x="142"
                  y="21"
                  fill="#FBBF24"
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="end"
                  fontFamily="system-ui, sans-serif"
                >
                  {currentStage.cuppingScore}
                </text>
              </g>
            </motion.g>
          </AnimatePresence>
        </g>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MOCKUP 03: RUNNING PURCHASE ORDER VELOCITY STREAM
   - Continuous live dispatch stream routing order packets into the 3 venues.
   - Highlights the active PO path with glowing lavender energy flow.
   - User hover / click locks to any venue to inspect order frequency & cases.
   - Authentic B2B terms: Net-15 PO, Cold-Chain Delivery Slot, Recurring Cadence.
───────────────────────────────────────────────────────────────────────────── */
interface OrderVelocityRow {
  id: string;
  initial: string;
  avatarColor: string;
  venue: string;
  status: string;
  statusColor: string;
  cases: string;
  terms: string;
  targetY: number;
  pathD: string;
}

const VELOCITY_ROWS: OrderVelocityRow[] = [
  {
    id: 'hillfold',
    initial: 'H',
    avatarColor: '#8B5CF6',
    venue: 'Hillfold Roastery',
    status: 'Net-15 Recurring PO',
    statusColor: '#34D399',
    cases: '12 cs',
    terms: 'Standing Monday Auto-Trigger',
    targetY: 61,
    pathD: 'M96 108 C 112 108, 122 61, 142 61',
  },
  {
    id: 'tamarind',
    initial: 'T',
    avatarColor: '#6B21A8',
    venue: 'Tamarind Lane Café',
    status: 'Order Dispatched · Van 04',
    statusColor: '#60A5FA',
    cases: '8 cs',
    terms: 'Bi-Weekly Tuesday Cycle',
    targetY: 105,
    pathD: 'M96 108 L 142 105',
  },
  {
    id: 'bramblegate',
    initial: 'B',
    avatarColor: '#4C1D95',
    venue: 'Bramblegate Roasters',
    status: 'Standing PO · Reorder Ready',
    statusColor: '#C084FC',
    cases: '16 cs',
    terms: 'Net-30 Digital Verified PO',
    targetY: 149,
    pathD: 'M96 108 C 112 108, 122 149, 142 149',
  },
];

function RunningOrderVelocity() {
  const [activeRowIdx, setActiveRowIdx] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Running order stream (rotates active PO route every 2.6s unless hovered)
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
      className="bmoat-canvas"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <svg
        viewBox="0 0 340 220"
        className="bmoat-canvas-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="v3OatFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#221E31" />
            <stop offset="100%" stopColor="#12101B" />
          </linearGradient>
          <linearGradient id="v3OatSide" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#181523" />
            <stop offset="100%" stopColor="#0B0912" />
          </linearGradient>
          <filter id="softGlowV3" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Understated Isometric Foundation Plane */}
        <g stroke="rgba(168, 85, 247, 0.12)" strokeWidth="0.75">
          <path
            d="M45 174 L170 126 L295 174 L170 210 Z"
            fill="rgba(147, 51, 234, 0.025)"
          />
          <line x1="82" y1="160" x2="207" y2="198" />
          <line x1="120" y1="145" x2="245" y2="183" />
        </g>

        {/* ─── Scale Badge: 148 CAFÉS REORDERING ─── */}
        <g transform="translate(186, 14)">
          <rect
            x="0"
            y="0"
            width="122"
            height="18"
            rx="9"
            fill="rgba(147, 51, 234, 0.15)"
            stroke="rgba(168, 85, 247, 0.4)"
            strokeWidth="0.75"
          />
          <circle cx="10" cy="9" r="2.5" fill="#C084FC" />
          <circle cx="10" cy="9" r="5" stroke="#C084FC" strokeWidth="0.5" strokeOpacity="0.4" className="bmoat-ping" />
          <text
            x="18"
            y="12"
            fill="#E9D5FF"
            fontSize="6.8"
            fontWeight="700"
            letterSpacing="0.04em"
            fontFamily="system-ui, sans-serif"
          >
            148 CAFÉS REORDERING
          </text>
        </g>

        {/* ─── DYNAMIC RUNNING CONNECTOR PATHS ─── */}
        <g>
          {VELOCITY_ROWS.map((row, rIdx) => {
            const isRowActive = activeRowIdx === rIdx;
            return (
              <path
                key={row.id}
                d={row.pathD}
                stroke={isRowActive ? 'rgba(192, 132, 252, 0.85)' : 'rgba(168, 85, 247, 0.2)'}
                strokeWidth={isRowActive ? '1.5' : '0.8'}
                strokeLinecap="round"
                className={isRowActive ? 'bmoat-active-path' : ''}
              />
            );
          })}

          {/* Running Order Packet Streaming into Active Row */}
          <circle r="2.8" fill="#F3E8FF" filter="url(#softGlowV3)">
            <animateMotion
              dur="1.8s"
              repeatCount="indefinite"
              path={activeRow.pathD}
            />
          </circle>

          {/* Supplier Carton Edge Origin Port with Pulse */}
          <circle cx="96" cy="108" r="3" fill="#8B5CF6" />
          <circle cx="96" cy="108" r="5.5" stroke="#C084FC" strokeWidth="0.7" className="bmoat-ping" />
        </g>

        {/* ─── LEFT: 2.5D Barista Oat Milk Carton ─── */}
        <g className="bmoat-product-group" transform="translate(36, 54)">
          <ellipse cx="36" cy="118" rx="26" ry="8" fill="#000000" fillOpacity="0.5" filter="blur(4px)" />

          <path d="M12 28 L38 16 L64 28 L38 40 Z" fill="#29243E" stroke="#8B5CF6" strokeWidth="0.75" />
          <path d="M38 16 L38 10 L44 13 L44 19 Z" fill="#312E81" stroke="#818CF8" strokeWidth="0.5" />

          {/* Screw Cap with Inner Lip */}
          <ellipse cx="44" cy="25" rx="4" ry="2.2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
          <ellipse cx="44" cy="25" rx="2" ry="1.1" fill="#E2E8F0" />

          <path
            d="M12 28 L38 40 L38 112 L12 100 Z"
            fill="url(#v3OatSide)"
            stroke="rgba(168, 85, 247, 0.35)"
            strokeWidth="0.8"
          />

          <path
            d="M38 40 L64 28 L64 100 L38 112 Z"
            fill="url(#v3OatFront)"
            stroke="rgba(168, 85, 247, 0.6)"
            strokeWidth="0.9"
          />

          <line x1="38" y1="40" x2="38" y2="112" stroke="rgba(216, 180, 254, 0.5)" strokeWidth="0.8" />

          <rect
            x="42"
            y="48"
            width="18"
            height="46"
            rx="2"
            fill="rgba(255, 255, 255, 0.04)"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="0.5"
          />
          <text x="51" y="58" fill="#F8FAFC" fontSize="4.8" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">
            OAT
          </text>
          <text x="51" y="64" fill="#C084FC" fontSize="4" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">
            BARISTA
          </text>
          <circle cx="51" cy="73" r="4" stroke="#8B5CF6" strokeWidth="0.7" fill="none" />
          <path d="M49 73 L50.5 74.5 L53.5 71.5" stroke="#8B5CF6" strokeWidth="0.7" />
          <text x="51" y="83" fill="#94A3B8" fontSize="3" textAnchor="middle" fontFamily="system-ui, sans-serif">
            MICROFOAM
          </text>
          <text x="51" y="89" fill="#CBD5E1" fontSize="2.8" textAnchor="middle" fontFamily="system-ui, sans-serif">
            1 LITRE
          </text>
        </g>

        {/* ─── RIGHT: Interactive Purchase Order Rows with Live Highlighting ─── */}
        <g transform="translate(142, 42)">
          {VELOCITY_ROWS.map((row, rIdx) => {
            const isSelected = activeRowIdx === rIdx;
            const offsetY = rIdx * 44;

            return (
              <g
                key={row.id}
                transform={`translate(0, ${offsetY})`}
                onClick={() => {
                  setActiveRowIdx(rIdx);
                  setIsPaused(true);
                }}
                onMouseEnter={() => {
                  setActiveRowIdx(rIdx);
                  setIsPaused(true);
                }}
                style={{ cursor: 'pointer' }}
                className="bmoat-interactive-row"
              >
                {/* Row Frame with Dynamic Selection Illumination */}
                <rect
                  x="0"
                  y="0"
                  width="166"
                  height="38"
                  rx="8"
                  fill={isSelected ? '#141024' : '#0B0A12'}
                  stroke={isSelected ? 'rgba(168, 85, 247, 0.65)' : 'rgba(255, 255, 255, 0.07)'}
                  strokeWidth={isSelected ? '1.1' : '0.75'}
                />

                {/* Avatar Badge */}
                <rect
                  x="10"
                  y="9"
                  width="20"
                  height="20"
                  rx="4"
                  fill={row.avatarColor}
                  fillOpacity={isSelected ? 1 : 0.75}
                />
                <text
                  x="20"
                  y="22"
                  fill="#FFFFFF"
                  fontSize="9"
                  fontWeight="800"
                  textAnchor="middle"
                  fontFamily="system-ui, sans-serif"
                >
                  {row.initial}
                </text>

                {/* Venue Title & Status */}
                <text
                  x="36"
                  y="17"
                  fill={isSelected ? '#FFFFFF' : '#E2E8F0'}
                  fontSize="8.2"
                  fontWeight={isSelected ? '700' : '600'}
                  fontFamily="system-ui, sans-serif"
                >
                  {row.venue}
                </text>
                <circle cx="39" cy="26" r="2" fill={row.statusColor} />
                {isSelected && (
                  <circle cx="39" cy="26" r="4" stroke={row.statusColor} strokeWidth="0.6" strokeOpacity="0.4" className="bmoat-ping" />
                )}
                <text
                  x="45"
                  y="28.5"
                  fill={row.statusColor}
                  fontSize="7"
                  fontWeight="500"
                  fontFamily="system-ui, sans-serif"
                >
                  {row.status}
                </text>

                {/* Order Quantity Badge with Active Highlight */}
                <rect
                  x="128"
                  y="11"
                  width="28"
                  height="16"
                  rx="4"
                  fill={isSelected ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.04)'}
                  stroke={isSelected ? 'rgba(168, 85, 247, 0.45)' : 'rgba(255, 255, 255, 0.08)'}
                  strokeWidth="0.6"
                />
                <text
                  x="142"
                  y="22"
                  fill={isSelected ? '#E9D5FF' : '#94A3B8'}
                  fontSize="7.5"
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="system-ui, sans-serif"
                >
                  {row.cases}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
