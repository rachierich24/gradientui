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
                {/* Oversized Background Number in Sleek Monochrome Titanium */}
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
                    {/* Card Title & Monochrome Category Pill */}
                    <div className="bmoat-card-top">
                      <h3 className="bmoat-card-title">{card.title}</h3>
                      <div className="bmoat-pill">{card.pill}</div>
                    </div>

                    {/* Interactive, Super 3D Monochrome Capability Workspace */}
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
   MOCKUP 01: SUPER 3D MONOCHROME DEMAND TELEMETRY
   - True isometric 3D coffee pouch with faceted gussets, crimp seal, and degassing valve
   - 3D isometric coordinate floor grid with technical CAD crosshairs
   - Floating 3D frosted glass telemetry HUD with luminous white curve and interactive scrub
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
  { week: 'W1', stageLabel: 'Baseline Roast Cycle', volumeKg: 48, growth: '+12%', x: 20, y: 104 },
  { week: 'W2', stageLabel: 'Secondary Roaster Pull', volumeKg: 68, growth: '+19%', x: 56, y: 94 },
  { week: 'W3', stageLabel: 'Hauz Khas Cluster Surge', volumeKg: 94, growth: '+25%', x: 94, y: 78 },
  { week: 'W4', stageLabel: 'Multi-Outlet Depletion', volumeKg: 118, growth: '+29%', x: 130, y: 64 },
  { week: 'W5', stageLabel: 'Peak Forecast Order Window', volumeKg: 142, growth: '+34%', x: 162, y: 48 },
];

function RunningDemandIntelligence() {
  const [activeIdx, setActiveIdx] = useState<number>(4);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isBagHovered, setIsBagHovered] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % TELEMETRY_SERIES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activePoint = TELEMETRY_SERIES[activeIdx];
  const tooltipX = Math.max(12, Math.min(118, activePoint.x - 24));
  const tooltipY = Math.max(24, activePoint.y - 24);

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
          {/* Pure Monochrome & Glass Gradients */}
          <linearGradient id="monoCurveGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="60%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id="monoAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#94A3B8" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="pouchFront3D" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2D3040" />
            <stop offset="45%" stopColor="#1E202C" />
            <stop offset="100%" stopColor="#0F1017" />
          </linearGradient>
          <linearGradient id="pouchSide3D" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#191B26" />
            <stop offset="100%" stopColor="#0A0B10" />
          </linearGradient>
          <linearGradient id="pouchTopCrimp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3E4256" />
            <stop offset="100%" stopColor="#222432" />
          </linearGradient>
          <linearGradient id="hudCardGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#141620" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#0A0B10" stopOpacity="0.98" />
          </linearGradient>
          <filter id="whiteGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ─── 3D Isometric CAD Foundation Grid ─── */}
        <g stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.7">
          <path d="M30 168 L170 122 L310 168 L170 214 Z" fill="rgba(255, 255, 255, 0.015)" />
          <line x1="65" y1="156" x2="205" y2="202" />
          <line x1="100" y1="145" x2="240" y2="191" />
          <line x1="135" y1="133" x2="275" y2="179" />
          <line x1="205" y1="133" x2="65" y2="179" />
          <line x1="240" y1="145" x2="100" y2="191" />
          <line x1="275" y1="156" x2="135" y2="202" />
          <path d="M168 168 H172 M170 166 V170" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="0.8" />
          <path d="M98 168 H102 M100 166 V170" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.8" />
          <path d="M238 168 H242 M240 166 V170" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.8" />
        </g>

        {/* ─── LEFT: True 3D Specialty Coffee Pouch with Precision Crimp ─── */}
        <g
          className="bmoat-product-group"
          transform="translate(32, 46)"
          onMouseEnter={() => setIsBagHovered(true)}
          onMouseLeave={() => setIsBagHovered(false)}
          style={{ cursor: 'pointer' }}
        >
          {/* Dual-Stage Ambient Occlusion Floor Shadow */}
          <ellipse cx="40" cy="124" rx="34" ry="10" fill="#000000" fillOpacity="0.7" filter="blur(6px)" />
          <ellipse cx="40" cy="124" rx="20" ry="5.5" fill="#000000" fillOpacity="0.85" filter="blur(2.5px)" />

          {/* 3D Isometric Scanner Rings */}
          <ellipse cx="40" cy="123" rx="28" ry="8.5" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.75" />
          <ellipse cx="40" cy="123" rx="18" ry="5.5" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="0.5" strokeDasharray="3 2" />

          {/* Top Seal Crimp Ridge with Beveled Teeth */}
          <path
            d="M10 16 L66 12 L60 22 L6 26 Z"
            fill="url(#pouchTopCrimp)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="0.75"
          />
          {[14, 20, 26, 32, 38, 44, 50, 56, 62].map((kx) => (
            <line
              key={kx}
              x1={kx}
              y1={14 + (kx - 14) * -0.07}
              x2={kx - 5}
              y2={24 + (kx - 14) * -0.07}
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="0.6"
            />
          ))}

          {/* Side Gusset (Faceted in 3D Perspective) */}
          <path
            d="M6 26 L20 34 L18 118 L6 110 Z"
            fill="url(#pouchSide3D)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="0.75"
          />
          <line x1="12" y1="30" x2="11" y2="114" stroke="rgba(0, 0, 0, 0.55)" strokeWidth="0.9" />
          <line x1="13" y1="30" x2="12" y2="114" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.5" />

          {/* Front Face with Curvature Gradient */}
          <path
            d="M20 34 L60 22 L72 108 L18 118 Z"
            fill="url(#pouchFront3D)"
            stroke={isBagHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)'}
            strokeWidth={isBagHovered ? '1.2' : '0.9'}
          />

          {/* High-Contrast Razor Specular Edge Highlight */}
          <path d="M20 34 L60 22 L72 108" stroke="rgba(255, 255, 255, 0.65)" strokeWidth="0.8" fill="none" />
          <line x1="20" y1="34" x2="18" y2="118" stroke="#FFFFFF" strokeWidth="1.1" strokeOpacity="0.8" />

          {/* 3D Recessed Aroma Degassing Valve */}
          <ellipse cx="42" cy="50" rx="5.5" ry="5.5" fill="#15161F" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.8" />
          <ellipse cx="42" cy="50" rx="3.5" ry="3.5" fill="#0C0D12" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="0.6" />
          <circle cx="42" cy="50" r="1.2" fill="#FFFFFF" />
          <circle cx="42" cy="50" r="8" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity={isBagHovered ? 0.6 : 0.25} className="bmoat-ping" />

          {/* Technical Monochrome Architectural Label */}
          <rect
            x="26"
            y="64"
            width="36"
            height="40"
            rx="2.5"
            fill="#0F1017"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="0.7"
          />
          <line x1="29" y1="68" x2="59" y2="68" stroke="#FFFFFF" strokeWidth="1" />
          <text x="30" y="77" fill="#FFFFFF" fontSize="5.2" fontWeight="800" letterSpacing="0.06em" fontFamily="system-ui, sans-serif">
            HILLFOLD
          </text>
          <text x="30" y="84" fill="#CBD5E1" fontSize="4.2" fontWeight="600" letterSpacing="0.04em" fontFamily="system-ui, sans-serif">
            ARABICA AA
          </text>
          <text x="30" y="93" fill="#64748B" fontSize="3.5" fontFamily="system-ui, sans-serif">
            BATCH ROAST · 500G
          </text>
          <g stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.6">
            <line x1="30" y1="98" x2="30" y2="101" />
            <line x1="32" y1="98" x2="32" y2="101" />
            <line x1="33" y1="98" x2="33" y2="101" />
            <line x1="36" y1="98" x2="36" y2="101" />
            <line x1="38" y1="98" x2="38" y2="101" />
            <line x1="41" y1="98" x2="41" y2="101" />
            <line x1="44" y1="98" x2="44" y2="101" />
          </g>
        </g>

        {/* ─── RIGHT: Super 3D Frosted Glass Telemetry HUD ─── */}
        <g transform="translate(132, 36)">
          <rect x="0" y="4" width="180" height="144" rx="10" fill="#000000" fillOpacity="0.6" filter="blur(5px)" />

          <rect
            x="0"
            y="0"
            width="180"
            height="144"
            rx="10"
            fill="url(#hudCardGrad)"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="0.8"
          />

          {/* High-Tech Specular Rim Highlight */}
          <path d="M1 10 C 1 5, 5 1, 10 1 L 170 1 C 175 1, 179 5, 179 10" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.9" fill="none" />

          {/* Header Row: Live Telemetry Status + Monochrome Growth Capsule */}
          <g transform="translate(14, 18)">
            <circle cx="0" cy="-2.5" r="2.5" fill="#FFFFFF" />
            <circle cx="0" cy="-2.5" r="5.5" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.45" className="bmoat-ping" />
            <text x="8" y="0.5" fill="#FFFFFF" fontSize="8" fontWeight="700" fontFamily="system-ui, sans-serif">
              Arabica AA Roast
            </text>
            <rect
              x="104"
              y="-10"
              width="48"
              height="15"
              rx="7.5"
              fill="rgba(255, 255, 255, 0.08)"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="0.75"
            />
            <text
              x="128"
              y="0.5"
              fill="#FFFFFF"
              fontSize="6.8"
              fontWeight="700"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
            >
              {activePoint.growth} RISING
            </text>
          </g>

          <line x1="14" y1="28" x2="166" y2="28" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.75" />

          {/* Chart Grid Lines */}
          <g stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" strokeWidth="0.75">
            <line x1="14" y1="52" x2="166" y2="52" />
            <line x1="14" y1="76" x2="166" y2="76" />
            <line x1="14" y1="104" x2="166" y2="104" />
          </g>

          {/* Shaded Area Under Curve */}
          <path
            d="M20 104 C 46 98, 76 86, 100 78 C 124 70, 146 54, 162 48 L 162 104 L 20 104 Z"
            fill="url(#monoAreaGrad)"
          />

          {/* High-Luminance White Forecast Trendline */}
          <path
            d="M20 104 C 46 98, 76 86, 100 78 C 124 70, 146 54, 162 48"
            stroke="url(#monoCurveGrad)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Dynamic Laser Vertical Cursor Guide */}
          <line
            x1={activePoint.x}
            y1={activePoint.y}
            x2={activePoint.x}
            y2="104"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeDasharray="2 2"
            strokeOpacity="0.7"
          />

          {/* 5 Weekly Points */}
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
                <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />

                {isSelected ? (
                  <>
                    <circle cx={pt.x} cy={pt.y} r="5" fill="#FFFFFF" filter="url(#whiteGlowFilter)" />
                    <circle cx={pt.x} cy={pt.y} r="2.2" fill="#0C0D12" />
                  </>
                ) : (
                  <circle cx={pt.x} cy={pt.y} r="2.6" fill="#1A1C26" stroke="#94A3B8" strokeWidth="0.8" />
                )}

                <text
                  x={pt.x}
                  y="117"
                  fill={isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)'}
                  fontSize="6.8"
                  fontWeight={isSelected ? '700' : '500'}
                  textAnchor="middle"
                  fontFamily="system-ui, sans-serif"
                >
                  {pt.week}
                </text>
              </g>
            );
          })}

          {/* Floating 3D Data Tooltip */}
          <g
            transform={`translate(${tooltipX}, ${tooltipY})`}
            className="bmoat-dynamic-tooltip"
          >
            <rect
              x="0"
              y="0"
              width="48"
              height="18"
              rx="4"
              fill="#0F1017"
              stroke="#FFFFFF"
              strokeWidth="0.9"
            />
            <text
              x="24"
              y="12"
              fill="#FFFFFF"
              fontSize="8"
              fontWeight="800"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
            >
              {activePoint.volumeKg} kg
            </text>
          </g>

          {/* Live Telemetry Status Footnote */}
          <g transform="translate(14, 133)">
            <text
              x="0"
              y="0"
              fill="rgba(255, 255, 255, 0.85)"
              fontSize="6.5"
              fontWeight="600"
              fontFamily="system-ui, sans-serif"
            >
              {activePoint.stageLabel}
            </text>
            <text
              x="152"
              y="0"
              fill={isPaused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)'}
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
   MOCKUP 02: SUPER 3D CYLINDRICAL CRAFT BOTTLE & SAMPLING HUD
   - True 3D glass cylinder bottle on multi-tier extruded turntable pedestal
   - Knurled titanium cap, double-wall glass refractions, and liquid core
   - Dynamic 3D laser spline feeding into floating barista cupping capsule
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
    sensoryQuote: '"Dense microfoam balance & zero curdling approved"',
    cuppingScore: '★ 4.8',
  },
  {
    id: 'hillfold',
    tabLabel: 'Hillfold',
    venue: 'Hillfold Espresso Lab',
    location: 'Indiranagar · Multi-Outlet Barista Team',
    lifecycleStatus: 'EN ROUTE · VAN SLOT 02',
    evaluator: 'Cold-Chain Dispatch Verification',
    sensoryQuote: '"Sample flight scheduled for calibration"',
    cuppingScore: 'CALIB',
  },
  {
    id: 'bramblegate',
    tabLabel: 'Bramble',
    venue: 'Bramblegate Roasters',
    location: 'Bandra West · Artisanal Single Origin',
    lifecycleStatus: 'EVALUATED · STANDING PO',
    evaluator: 'Lead Roaster Sensory Protocol',
    sensoryQuote: '"Signature iced vanilla latte test approved"',
    cuppingScore: '★ 5.0',
  },
];

function RunningSamplingFlights() {
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
          <linearGradient id="bottleGlass3D" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1E202B" />
            <stop offset="25%" stopColor="#2E3245" />
            <stop offset="50%" stopColor="#181924" />
            <stop offset="85%" stopColor="#101118" />
            <stop offset="100%" stopColor="#08090D" />
          </linearGradient>
          <linearGradient id="capMetal3D" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#64748B" />
            <stop offset="35%" stopColor="#F1F5F9" />
            <stop offset="70%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="turntable3D" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#282A38" />
            <stop offset="100%" stopColor="#101118" />
          </linearGradient>
          <linearGradient id="beamLaserWhite" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#64748B" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* ─── 3D Isometric CAD Foundation Grid ─── */}
        <g stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.7">
          <path d="M30 168 L170 122 L310 168 L170 214 Z" fill="rgba(255, 255, 255, 0.015)" />
          <line x1="65" y1="156" x2="205" y2="202" />
          <line x1="100" y1="145" x2="240" y2="191" />
          <line x1="205" y1="133" x2="65" y2="179" />
          <line x1="240" y1="145" x2="100" y2="191" />
        </g>

        {/* ─── LEFT: 3D Cylindrical Bottle on Extruded Turntable Pedestal ─── */}
        <g transform="translate(42, 40)">
          {/* Base Floor Shadows */}
          <ellipse cx="32" cy="134" rx="30" ry="10" fill="#000000" fillOpacity="0.7" filter="blur(5px)" />

          {/* 3D Extruded Turntable Platform (Lower Tier) */}
          <path
            d="M6 130 C 6 137, 58 137, 58 130 L 58 134 C 58 141, 6 141, 6 134 Z"
            fill="#101118"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="0.6"
          />
          <ellipse cx="32" cy="130" rx="26" ry="8" fill="url(#turntable3D)" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="0.75" />

          {/* Upper Turntable Platform (Elevated) */}
          <path
            d="M12 124 C 12 130, 52 130, 52 124 L 52 127 C 52 133, 12 133, 12 127 Z"
            fill="#090A0F"
          />
          <ellipse cx="32" cy="124" rx="20" ry="6" fill="#1C1E2A" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.8" />
          <ellipse cx="32" cy="124" rx="14" ry="4.2" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="0.5" strokeDasharray="2 2" />

          {/* Knurled Titanium Screw Cap in 3D */}
          <ellipse cx="32" cy="14" rx="6.5" ry="2.2" fill="#F8FAFC" stroke="#FFFFFF" strokeWidth="0.6" />
          <rect x="25.5" y="14" width="13" height="12" fill="url(#capMetal3D)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.6" />
          {[27, 29, 31, 33, 35, 37].map((kx) => (
            <line key={kx} x1={kx} y1="15" x2={kx} y2="25" stroke="rgba(0, 0, 0, 0.35)" strokeWidth="0.5" />
          ))}

          {/* Tapered Glass Neck */}
          <path d="M25 26 L39 26 L42 38 L22 38 Z" fill="#161722" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.75" />
          <line x1="28" y1="27" x2="26" y2="37" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.75" />

          {/* 3D Glass Cylinder Body */}
          <rect
            x="18"
            y="38"
            width="28"
            height="84"
            rx="5"
            fill="url(#bottleGlass3D)"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="0.9"
          />

          {/* Hard Specular Reflection Streak down Left Flank */}
          <line x1="21" y1="40" x2="21" y2="120" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.75" />
          <line x1="23" y1="42" x2="23" y2="118" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.6" />

          {/* Subtle Ambient Bounce Highlight down Right Flank */}
          <line x1="43" y1="42" x2="43" y2="118" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="0.8" />

          {/* Technical Monochrome Bottle Label */}
          <rect x="22" y="58" width="20" height="46" rx="2" fill="#0C0D12" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="0.6" />
          <rect x="24" y="62" width="16" height="1.5" fill="#FFFFFF" />
          <text x="32" y="71" fill="#FFFFFF" fontSize="4.2" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">
            VANILLA
          </text>
          <text x="32" y="76" fill="#E2E8F0" fontSize="3.6" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">
            CRAFT
          </text>
          <text x="32" y="81" fill="#94A3B8" fontSize="3" textAnchor="middle" fontFamily="system-ui, sans-serif">
            SYRUP
          </text>
          <line x1="25" y1="86" x2="39" y2="86" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.4" />
          <text x="32" y="94" fill="#64748B" fontSize="2.8" textAnchor="middle" fontFamily="system-ui, sans-serif">
            700 ML
          </text>
        </g>

        {/* 3D Laser Spline Connector from Bottle to HUD */}
        <path
          d="M86 148 C 108 140, 116 102, 132 96"
          stroke="url(#beamLaserWhite)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />

        {/* Flowing White Photon Node */}
        <circle r="2.5" fill="#FFFFFF" filter="url(#whiteGlowFilter)">
          <animateMotion
            dur="2.4s"
            repeatCount="indefinite"
            path="M86 148 C 108 140, 116 102, 132 96"
          />
        </circle>

        {/* ─── RIGHT: Super 3D Frosted Glass Sampling HUD ─── */}
        <g transform="translate(132, 36)">
          <rect x="0" y="4" width="180" height="144" rx="10" fill="#000000" fillOpacity="0.6" filter="blur(5px)" />

          <rect
            x="0"
            y="0"
            width="180"
            height="144"
            rx="10"
            fill="url(#hudCardGrad)"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="0.8"
          />
          <path d="M1 10 C 1 5, 5 1, 10 1 L 170 1 C 175 1, 179 5, 179 10" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.9" fill="none" />

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
                    height="17"
                    rx="4.5"
                    fill={isTabSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)'}
                    stroke={isTabSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)'}
                    strokeWidth="0.75"
                  />
                  <text
                    x="24"
                    y="11"
                    fill={isTabSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
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
            <circle cx="2" cy="0" r="2.5" fill="#FFFFFF" />
            <circle cx="2" cy="0" r="5.5" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.45" className="bmoat-ping" />
            <text x="10" y="2.5" fill="#FFFFFF" fontSize="7" fontWeight="700" letterSpacing="0.06em" fontFamily="system-ui, sans-serif">
              {currentStage.lifecycleStatus}
            </text>
            <text x="152" y="2.5" fill="rgba(255, 255, 255, 0.45)" fontSize="6.5" textAnchor="end" fontFamily="system-ui, sans-serif">
              STAGE 0{selectedIdx + 1}
            </text>
          </g>

          {/* Target Venue Details */}
          <AnimatePresence mode="wait">
            <motion.g
              key={currentStage.id}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.22 }}
            >
              <g transform="translate(14, 52)">
                <text x="0" y="8" fill="#FFFFFF" fontSize="8.5" fontWeight="700" fontFamily="system-ui, sans-serif">
                  {currentStage.venue}
                </text>
                <text x="0" y="19" fill="#94A3B8" fontSize="7" fontFamily="system-ui, sans-serif">
                  {currentStage.location}
                </text>
              </g>

              {/* Divider */}
              <line x1="14" y1="78" x2="166" y2="78" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.75" />

              {/* Barista Evaluation Panel */}
              <g transform="translate(14, 88)">
                <rect
                  x="0"
                  y="0"
                  width="152"
                  height="40"
                  rx="6"
                  fill="rgba(255, 255, 255, 0.04)"
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="0.75"
                />
                {/* Evaluator Title & Clean Cupping Score Badge */}
                <text x="8" y="13" fill="#E2E8F0" fontSize="7" fontWeight="600" fontFamily="system-ui, sans-serif">
                  {currentStage.evaluator}
                </text>
                <rect
                  x="116"
                  y="4"
                  width="30"
                  height="14"
                  rx="3"
                  fill="rgba(255, 255, 255, 0.09)"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="0.6"
                />
                <text
                  x="131"
                  y="14"
                  fill="#FFFFFF"
                  fontSize="7.5"
                  fontWeight="800"
                  textAnchor="middle"
                  fontFamily="system-ui, sans-serif"
                >
                  {currentStage.cuppingScore}
                </text>

                {/* Sensory Quote on Separate Row */}
                <text x="8" y="28" fill="#CBD5E1" fontSize="6.5" fontFamily="system-ui, sans-serif">
                  {currentStage.sensoryQuote}
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
   MOCKUP 03: SUPER 3D GABLE-TOP CARTON & HIGHWAY DISTRIBUTION BUS
   - Authentic 3D tetra-pack gable carton with slanted roof, crimp, and angled screw cap
   - 3D branching network traces routing order packets into 3D floating venue slabs
   - Pure monochrome high-velocity purchase order telemetry
───────────────────────────────────────────────────────────────────────────── */
interface OrderVelocityRow {
  id: string;
  initial: string;
  venue: string;
  status: string;
  cases: string;
  targetY: number;
  pathD: string;
}

const VELOCITY_ROWS: OrderVelocityRow[] = [
  {
    id: 'hillfold',
    initial: 'H',
    venue: 'Hillfold Roastery',
    status: 'Net-15 Recurring PO',
    cases: '12 cs',
    targetY: 61,
    pathD: 'M66 94 C 98 94, 114 62, 140 62',
  },
  {
    id: 'tamarind',
    initial: 'T',
    venue: 'Tamarind Lane Café',
    status: 'Order Dispatched · Van 04',
    cases: '8 cs',
    targetY: 105,
    pathD: 'M66 94 L 140 106',
  },
  {
    id: 'bramblegate',
    initial: 'B',
    venue: 'Bramblegate Roasters',
    status: 'Standing PO · Reorder Ready',
    cases: '16 cs',
    targetY: 149,
    pathD: 'M66 94 C 98 94, 114 150, 140 150',
  },
];

function RunningOrderVelocity() {
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
          <linearGradient id="cartonFront3D" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2E3040" />
            <stop offset="100%" stopColor="#12131A" />
          </linearGradient>
          <linearGradient id="cartonSide3D" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#181A24" />
            <stop offset="100%" stopColor="#0B0C12" />
          </linearGradient>
          <linearGradient id="cartonRoof3D" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3C3F54" />
            <stop offset="100%" stopColor="#202230" />
          </linearGradient>
        </defs>

        {/* ─── 3D Isometric CAD Foundation Grid ─── */}
        <g stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.7">
          <path d="M30 168 L170 122 L310 168 L170 214 Z" fill="rgba(255, 255, 255, 0.015)" />
          <line x1="65" y1="156" x2="205" y2="202" />
          <line x1="100" y1="145" x2="240" y2="191" />
          <line x1="205" y1="133" x2="65" y2="179" />
          <line x1="240" y1="145" x2="100" y2="191" />
        </g>

        {/* ─── Scale Badge: 148 CAFÉS REORDERING in Monochrome Frosted Glass ─── */}
        <g transform="translate(186, 12)">
          <rect
            x="0"
            y="0"
            width="124"
            height="18"
            rx="9"
            fill="rgba(255, 255, 255, 0.08)"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="0.75"
          />
          <circle cx="10" cy="9" r="2.5" fill="#FFFFFF" />
          <circle cx="10" cy="9" r="5.5" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.45" className="bmoat-ping" />
          <text
            x="18"
            y="12"
            fill="#FFFFFF"
            fontSize="6.8"
            fontWeight="700"
            letterSpacing="0.04em"
            fontFamily="system-ui, sans-serif"
          >
            148 CAFÉS REORDERING
          </text>
        </g>

        {/* ─── DYNAMIC 3D HIGHWAY CONNECTOR PATHS ─── */}
        <g>
          {VELOCITY_ROWS.map((row, rIdx) => {
            const isRowActive = activeRowIdx === rIdx;
            return (
              <path
                key={row.id}
                d={row.pathD}
                stroke={isRowActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.16)'}
                strokeWidth={isRowActive ? '1.8' : '0.8'}
                strokeLinecap="round"
                className={isRowActive ? 'bmoat-active-path' : ''}
              />
            );
          })}

          {/* Running Luminous White Packet Streaming into Active Row */}
          <circle r="3" fill="#FFFFFF" filter="url(#whiteGlowFilter)">
            <animateMotion
              dur="1.8s"
              repeatCount="indefinite"
              path={activeRow.pathD}
            />
          </circle>

          {/* Supplier Carton Direct Connection Node */}
          <circle cx="66" cy="94" r="3" fill="#FFFFFF" />
          <circle cx="66" cy="94" r="6" stroke="#FFFFFF" strokeWidth="0.7" className="bmoat-ping" />
        </g>

        {/* ─── LEFT: True 3D Gable-Top Barista Carton ─── */}
        <g className="bmoat-product-group" transform="translate(34, 48)">
          <ellipse cx="38" cy="120" rx="28" ry="8.5" fill="#000000" fillOpacity="0.7" filter="blur(5px)" />

          {/* Gable Roof Structure */}
          <path d="M38 14 L42 16 L42 11 L38 9 Z" fill="#4B4E63" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.5" />
          <path d="M12 26 L38 14 L64 24 L38 36 Z" fill="url(#cartonRoof3D)" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="0.75" />

          {/* 3D Angled Screw Cap with perspective cylindrical lip */}
          <ellipse cx="44" cy="22" rx="4.5" ry="2.2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.6" />
          <ellipse cx="44" cy="22" rx="2.5" ry="1.2" fill="#E2E8F0" />

          {/* Carton Left Side (Shadowed 3D Plane) */}
          <path
            d="M12 26 L38 36 L38 114 L12 102 Z"
            fill="url(#cartonSide3D)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="0.8"
          />

          {/* Carton Front Face (Lighted 3D Plane) */}
          <path
            d="M38 36 L66 24 L66 102 L38 114 Z"
            fill="url(#cartonFront3D)"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="0.9"
          />

          {/* Center Vertical Corner Bevel Highlight */}
          <line x1="38" y1="36" x2="38" y2="114" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.85" />

          {/* Technical Monochrome Carton Graphic */}
          <rect
            x="42"
            y="48"
            width="20"
            height="46"
            rx="2"
            fill="#0C0D12"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="0.5"
          />
          <text x="52" y="58" fill="#FFFFFF" fontSize="5" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">
            OAT
          </text>
          <text x="52" y="64" fill="#CBD5E1" fontSize="4.2" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">
            BARISTA
          </text>
          <circle cx="52" cy="73" r="4.2" stroke="#FFFFFF" strokeWidth="0.7" fill="none" />
          <path d="M50 73 L51.5 74.5 L54.5 71.5" stroke="#FFFFFF" strokeWidth="0.8" />
          <text x="52" y="83" fill="#94A3B8" fontSize="3" textAnchor="middle" fontFamily="system-ui, sans-serif">
            MICROFOAM
          </text>
          <text x="52" y="89" fill="#64748B" fontSize="2.8" textAnchor="middle" fontFamily="system-ui, sans-serif">
            1 LITRE
          </text>
        </g>

        {/* ─── RIGHT: Interactive Purchase Order Slabs ─── */}
        <g transform="translate(140, 42)">
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
                {/* 3D Slab Base */}
                <rect
                  x="0"
                  y="0"
                  width="170"
                  height="38"
                  rx="8"
                  fill={isSelected ? '#141622' : '#0B0C12'}
                  stroke={isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)'}
                  strokeWidth={isSelected ? '1.2' : '0.75'}
                />

                {/* Top Rim Specular Line for Active Row */}
                {isSelected && (
                  <path d="M1 8 C 1 4, 4 1, 8 1 L 162 1 C 166 1, 169 4, 169 8" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.9" fill="none" />
                )}

                {/* Monogram Avatar Badge in Charcoal / Silver */}
                <rect
                  x="10"
                  y="9"
                  width="20"
                  height="20"
                  rx="4.5"
                  fill={isSelected ? '#2A2D3D' : '#161822'}
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="0.6"
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
                  fill="#FFFFFF"
                  fontSize="8.2"
                  fontWeight={isSelected ? '700' : '600'}
                  fontFamily="system-ui, sans-serif"
                >
                  {row.venue}
                </text>
                <circle cx="39" cy="26" r="2" fill="#FFFFFF" />
                {isSelected && (
                  <circle cx="39" cy="26" r="4" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.45" className="bmoat-ping" />
                )}
                <text
                  x="45"
                  y="28.5"
                  fill="rgba(255, 255, 255, 0.65)"
                  fontSize="7"
                  fontWeight="500"
                  fontFamily="system-ui, sans-serif"
                >
                  {row.status}
                </text>

                {/* Order Quantity Badge in Frosted Capsule */}
                <rect
                  x="132"
                  y="11"
                  width="28"
                  height="16"
                  rx="4"
                  fill={isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)'}
                  stroke={isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.12)'}
                  strokeWidth="0.6"
                />
                <text
                  x="146"
                  y="22"
                  fill="#FFFFFF"
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
