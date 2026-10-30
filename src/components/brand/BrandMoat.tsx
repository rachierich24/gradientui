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

                    {/* Interactive, 3D Product Visual Workspace with Luxury Purple Theme */}
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
   CARD 01: DEMAND INTELLIGENCE (Actual 3D Coffee Pouch + Purple Telemetry HUD)
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
  { week: 'W5', stageLabel: 'Peak Forecast Order Window', volumeKg: 142, growth: '+34%', x: 162, y: 46 },
];

function RunningDemandIntelligence() {
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
  const tooltipX = Math.max(12, Math.min(118, activePoint.x - 24));
  const tooltipY = Math.max(22, activePoint.y - 24);

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
          {/* Luminous Purple Gradients */}
          <linearGradient id="purpleCurveGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C4DDB" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
          <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9333EA" stopOpacity="0.32" />
            <stop offset="60%" stopColor="#7C4DDB" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#07080D" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hudCardGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#161528" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#0B0B14" stopOpacity="0.98" />
          </linearGradient>
          <filter id="purpleGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ─── Isometric Floor Grid ─── */}
        <g stroke="rgba(168, 85, 247, 0.12)" strokeWidth="0.7">
          <path d="M20 176 L170 134 L320 176 L170 218 Z" fill="rgba(147, 51, 234, 0.025)" />
          <line x1="55" y1="166" x2="195" y2="208" />
          <line x1="90" y1="156" x2="230" y2="198" />
          <line x1="125" y1="146" x2="265" y2="188" />
          <line x1="195" y1="146" x2="55" y2="188" />
          <line x1="230" y1="156" x2="90" y2="198" />
          <line x1="265" y1="166" x2="125" y2="208" />
        </g>

        {/* ─── LEFT: Actual 3D Specialty Coffee Pouch Render ─── */}
        <g className="bmoat-product-group" transform="translate(14, 20)">
          {/* Ambient Purple Floor Reflection & Shadow */}
          <ellipse cx="56" cy="162" rx="42" ry="14" fill="#7C4DDB" fillOpacity="0.3" filter="blur(9px)" />
          <ellipse cx="56" cy="162" rx="26" ry="8" fill="#000000" fillOpacity="0.8" filter="blur(3px)" />

          {/* Actual 3D Pouch Image Cutout */}
          <image
            href="/brand/pouch_3d_cutout.png"
            x="4"
            y="12"
            width="106"
            height="152"
            preserveAspectRatio="xMidYMid meet"
            className="bmoat-product-3d"
          />
        </g>

        {/* ─── RIGHT: Interactive Frosted Glass Telemetry HUD ─── */}
        <g transform="translate(134, 32)">
          {/* Card Shadow */}
          <rect x="0" y="4" width="186" height="150" rx="12" fill="#000000" fillOpacity="0.65" filter="blur(6px)" />

          {/* Card Body */}
          <rect
            x="0"
            y="0"
            width="186"
            height="150"
            rx="12"
            fill="url(#hudCardGrad)"
            stroke="rgba(168, 85, 247, 0.28)"
            strokeWidth="0.9"
          />

          {/* Top Edge Specular Highlight */}
          <path d="M1 12 C 1 6, 6 1, 12 1 L 174 1 C 180 1, 185 6, 185 12" stroke="rgba(216, 180, 254, 0.45)" strokeWidth="0.9" fill="none" />

          {/* Header Row: Live Telemetry Status + Growth Capsule */}
          <g transform="translate(14, 18)">
            <circle cx="0" cy="-2" r="2.5" fill="#10B981" />
            <circle cx="0" cy="-2" r="5.5" stroke="#10B981" strokeWidth="0.6" strokeOpacity="0.5" className="bmoat-ping" />
            <text x="8" y="1" fill="#FFFFFF" fontSize="8.2" fontWeight="700" fontFamily="system-ui, sans-serif">
              Arabica AA Roast
            </text>
            <rect
              x="108"
              y="-10"
              width="50"
              height="16"
              rx="8"
              fill="rgba(147, 51, 234, 0.22)"
              stroke="rgba(168, 85, 247, 0.4)"
              strokeWidth="0.75"
            />
            <text
              x="133"
              y="1"
              fill="#E9D5FF"
              fontSize="7"
              fontWeight="700"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
            >
              {activePoint.growth} RISING
            </text>
          </g>

          <line x1="14" y1="28" x2="172" y2="28" stroke="rgba(168, 85, 247, 0.15)" strokeWidth="0.75" />

          {/* Chart Grid Lines */}
          <g stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" strokeWidth="0.75">
            <line x1="14" y1="52" x2="172" y2="52" />
            <line x1="14" y1="76" x2="172" y2="76" />
            <line x1="14" y1="104" x2="172" y2="104" />
          </g>

          {/* Shaded Area Under Curve */}
          <path
            d="M20 104 C 46 98, 76 86, 100 78 C 124 70, 146 52, 162 46 L 162 104 L 20 104 Z"
            fill="url(#purpleAreaGrad)"
          />

          {/* Glowing Purple Trendline */}
          <path
            d="M20 104 C 46 98, 76 86, 100 78 C 124 70, 146 52, 162 46"
            stroke="url(#purpleCurveGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Dynamic Laser Guide */}
          <line
            x1={activePoint.x}
            y1={activePoint.y}
            x2={activePoint.x}
            y2="104"
            stroke="#C084FC"
            strokeWidth="1"
            strokeDasharray="2 2"
            strokeOpacity="0.8"
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
                    <circle cx={pt.x} cy={pt.y} r="5.5" fill="#FFFFFF" filter="url(#purpleGlowFilter)" />
                    <circle cx={pt.x} cy={pt.y} r="2.5" fill="#6D28D9" />
                  </>
                ) : (
                  <circle cx={pt.x} cy={pt.y} r="2.8" fill="#1A152E" stroke="#A855F7" strokeWidth="0.8" />
                )}

                <text
                  x={pt.x}
                  y="118"
                  fill={isSelected ? '#C084FC' : 'rgba(255, 255, 255, 0.45)'}
                  fontSize="7"
                  fontWeight={isSelected ? '700' : '500'}
                  textAnchor="middle"
                  fontFamily="system-ui, sans-serif"
                >
                  {pt.week}
                </text>
              </g>
            );
          })}

          {/* Floating Volume Tooltip Badge */}
          <g
            transform={`translate(${tooltipX}, ${tooltipY})`}
            className="bmoat-dynamic-tooltip"
          >
            <rect
              x="0"
              y="0"
              width="48"
              height="18"
              rx="5"
              fill="#6D28D9"
              stroke="#A855F7"
              strokeWidth="0.9"
              filter="drop-shadow(0 4px 10px rgba(109, 40, 217, 0.5))"
            />
            <text
              x="24"
              y="12"
              fill="#FFFFFF"
              fontSize="8.2"
              fontWeight="800"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
            >
              {activePoint.volumeKg} kg
            </text>
          </g>

          {/* Live Telemetry Status Footnote */}
          <g transform="translate(14, 137)">
            <text
              x="0"
              y="0"
              fill="rgba(226, 232, 240, 0.85)"
              fontSize="6.8"
              fontWeight="600"
              fontFamily="system-ui, sans-serif"
            >
              {activePoint.stageLabel}
            </text>
            <text
              x="158"
              y="0"
              fill={isPaused ? '#C084FC' : 'rgba(255, 255, 255, 0.45)'}
              fontSize="6.2"
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
   CARD 02: DIRECT CAFÉ DISCOVERY (Actual 3D Glass Bottle + Purple Cupping HUD)
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
          <linearGradient id="laserBeamPurple" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#7C4DDB" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="turntablePurple" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E2248" />
            <stop offset="100%" stopColor="#120E1E" />
          </linearGradient>
          <filter id="whiteGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ─── Isometric Floor Grid ─── */}
        <g stroke="rgba(168, 85, 247, 0.12)" strokeWidth="0.7">
          <path d="M20 176 L170 134 L320 176 L170 218 Z" fill="rgba(147, 51, 234, 0.025)" />
          <line x1="55" y1="166" x2="195" y2="208" />
          <line x1="90" y1="156" x2="230" y2="198" />
          <line x1="195" y1="146" x2="55" y2="188" />
          <line x1="230" y1="156" x2="90" y2="198" />
        </g>

        {/* ─── LEFT: Actual 3D Craft Bottle on Illuminated Turntable ─── */}
        <g className="bmoat-product-group" transform="translate(16, 16)">
          {/* Base Floor Glow & Shadow */}
          <ellipse cx="50" cy="168" rx="36" ry="12" fill="#7C4DDB" fillOpacity="0.35" filter="blur(9px)" />

          {/* Elevated Turntable Pedestal */}
          <path
            d="M24 162 C 24 170, 76 170, 76 162 L 76 167 C 76 175, 24 175, 24 167 Z"
            fill="#120E1E"
            stroke="rgba(168, 85, 247, 0.35)"
            strokeWidth="0.8"
          />
          <ellipse cx="50" cy="162" rx="26" ry="8.5" fill="url(#turntablePurple)" stroke="rgba(192, 132, 252, 0.55)" strokeWidth="0.9" />
          <ellipse cx="50" cy="162" rx="18" ry="5.5" fill="none" stroke="rgba(216, 180, 254, 0.35)" strokeWidth="0.6" strokeDasharray="3 2" />

          {/* Actual 3D Glass Bottle Cutout Image */}
          <image
            href="/brand/bottle_3d_cutout.png"
            x="2"
            y="8"
            width="96"
            height="158"
            preserveAspectRatio="xMidYMid meet"
            className="bmoat-product-3d"
          />
        </g>

        {/* 3D Laser Spline Connector from Bottle to HUD */}
        <path
          d="M84 126 C 106 126, 114 96, 134 90"
          stroke="url(#laserBeamPurple)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {/* Flowing Glowing Photon Node */}
        <circle r="2.8" fill="#FFFFFF" filter="url(#whiteGlowFilter)">
          <animateMotion
            dur="2.4s"
            repeatCount="indefinite"
            path="M84 126 C 106 126, 114 96, 134 90"
          />
        </circle>

        {/* ─── RIGHT: Interactive Frosted Glass Sampling HUD ─── */}
        <g transform="translate(134, 30)">
          <rect x="0" y="4" width="186" height="152" rx="12" fill="#000000" fillOpacity="0.65" filter="blur(6px)" />

          <rect
            x="0"
            y="0"
            width="186"
            height="152"
            rx="12"
            fill="url(#hudCardGrad)"
            stroke="rgba(168, 85, 247, 0.28)"
            strokeWidth="0.9"
          />
          <path d="M1 12 C 1 6, 6 1, 12 1 L 174 1 C 180 1, 185 6, 185 12" stroke="rgba(216, 180, 254, 0.45)" strokeWidth="0.9" fill="none" />

          {/* Interactive Café Flight Tabs on Top */}
          <g transform="translate(12, 12)">
            {TRIAL_LIFECYCLE.map((stg, sIdx) => {
              const isTabSelected = selectedIdx === sIdx;
              return (
                <g
                  key={stg.id}
                  transform={`translate(${sIdx * 54}, 0)`}
                  onClick={() => {
                    setSelectedIdx(sIdx);
                    setIsPaused(true);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x="0"
                    y="0"
                    width="50"
                    height="18"
                    rx="5"
                    fill={isTabSelected ? '#6D28D9' : 'rgba(255, 255, 255, 0.05)'}
                    stroke={isTabSelected ? '#A855F7' : 'rgba(168, 85, 247, 0.2)'}
                    strokeWidth="0.8"
                  />
                  <text
                    x="25"
                    y="12"
                    fill={isTabSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}
                    fontSize="7.5"
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
          <g transform="translate(14, 42)">
            <circle cx="2" cy="0" r="2.5" fill="#10B981" />
            <circle cx="2" cy="0" r="5.5" stroke="#10B981" strokeWidth="0.6" strokeOpacity="0.5" className="bmoat-ping" />
            <text x="10" y="2.5" fill="#10B981" fontSize="7.2" fontWeight="700" letterSpacing="0.06em" fontFamily="system-ui, sans-serif">
              {currentStage.lifecycleStatus}
            </text>
            <text x="158" y="2.5" fill="#C084FC" fontSize="6.8" fontWeight="700" textAnchor="end" fontFamily="system-ui, sans-serif">
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
              <g transform="translate(14, 56)">
                <text x="0" y="8" fill="#FFFFFF" fontSize="9" fontWeight="700" fontFamily="system-ui, sans-serif">
                  {currentStage.venue}
                </text>
                <text x="0" y="20" fill="#94A3B8" fontSize="7.2" fontFamily="system-ui, sans-serif">
                  {currentStage.location}
                </text>
              </g>

              {/* Divider */}
              <line x1="14" y1="84" x2="172" y2="84" stroke="rgba(168, 85, 247, 0.15)" strokeWidth="0.75" />

              {/* Barista Evaluation Panel */}
              <g transform="translate(14, 94)">
                <rect
                  x="0"
                  y="0"
                  width="158"
                  height="44"
                  rx="7"
                  fill="rgba(147, 51, 234, 0.12)"
                  stroke="rgba(168, 85, 247, 0.32)"
                  strokeWidth="0.8"
                />
                {/* Evaluator Title & Clean Cupping Score Badge */}
                <text x="8" y="14" fill="#E9D5FF" fontSize="7.5" fontWeight="600" fontFamily="system-ui, sans-serif">
                  {currentStage.evaluator}
                </text>
                <rect
                  x="120"
                  y="5"
                  width="32"
                  height="15"
                  rx="4"
                  fill="#6D28D9"
                  stroke="#A855F7"
                  strokeWidth="0.6"
                />
                <text
                  x="136"
                  y="15.5"
                  fill="#FBBF24"
                  fontSize="8"
                  fontWeight="800"
                  textAnchor="middle"
                  fontFamily="system-ui, sans-serif"
                >
                  {currentStage.cuppingScore}
                </text>

                {/* Sensory Quote */}
                <text x="8" y="30" fill="#CBD5E1" fontSize="7" fontStyle="italic" fontFamily="system-ui, sans-serif">
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
   CARD 03: AUTOMATED REORDERS (Actual 3D Oat Carton + Purple Highway Bus)
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
    pathD: 'M74 100 C 104 100, 116 62, 138 62',
  },
  {
    id: 'tamarind',
    initial: 'T',
    venue: 'Tamarind Lane Café',
    status: 'Order Dispatched · Van 04',
    cases: '8 cs',
    targetY: 105,
    pathD: 'M74 100 L 138 106',
  },
  {
    id: 'bramblegate',
    initial: 'B',
    venue: 'Bramblegate Roasters',
    status: 'Standing PO · Reorder Ready',
    cases: '16 cs',
    targetY: 149,
    pathD: 'M74 100 C 104 100, 116 150, 138 150',
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
          <filter id="purpleGlowFilter2" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ─── Isometric Floor Grid ─── */}
        <g stroke="rgba(168, 85, 247, 0.12)" strokeWidth="0.7">
          <path d="M20 176 L170 134 L320 176 L170 218 Z" fill="rgba(147, 51, 234, 0.025)" />
          <line x1="55" y1="166" x2="195" y2="208" />
          <line x1="90" y1="156" x2="230" y2="198" />
          <line x1="125" y1="146" x2="265" y2="188" />
          <line x1="195" y1="146" x2="55" y2="188" />
          <line x1="230" y1="156" x2="90" y2="198" />
        </g>

        {/* ─── Top Scale Badge: 148 CAFÉS REORDERING in Brand Purple ─── */}
        <g transform="translate(182, 14)">
          <rect
            x="0"
            y="0"
            width="128"
            height="18"
            rx="9"
            fill="#6D28D9"
            stroke="#A855F7"
            strokeWidth="0.75"
            filter="drop-shadow(0 4px 12px rgba(109, 40, 217, 0.4))"
          />
          <circle cx="10" cy="9" r="2.5" fill="#A7F3D0" />
          <circle cx="10" cy="9" r="5" stroke="#A7F3D0" strokeWidth="0.5" strokeOpacity="0.6" className="bmoat-ping" />
          <text
            x="18"
            y="12"
            fill="#FFFFFF"
            fontSize="7"
            fontWeight="700"
            letterSpacing="0.04em"
            fontFamily="system-ui, sans-serif"
          >
            148 CAFÉS REORDERING
          </text>
        </g>

        {/* ─── DYNAMIC 3D HIGHWAY CONNECTOR PATHS IN BRAND PURPLE ─── */}
        <g>
          {VELOCITY_ROWS.map((row, rIdx) => {
            const isRowActive = activeRowIdx === rIdx;
            return (
              <path
                key={row.id}
                d={row.pathD}
                stroke={isRowActive ? '#C084FC' : 'rgba(168, 85, 247, 0.3)'}
                strokeWidth={isRowActive ? '2' : '1'}
                strokeLinecap="round"
                className={isRowActive ? 'bmoat-active-path' : ''}
              />
            );
          })}

          {/* Running Luminous White/Purple Packet Streaming into Active Row */}
          <circle r="3.2" fill="#FFFFFF" filter="url(#purpleGlowFilter2)">
            <animateMotion
              dur="1.8s"
              repeatCount="indefinite"
              path={activeRow.pathD}
            />
          </circle>

          {/* Supplier Carton Direct Connection Node */}
          <circle cx="74" cy="100" r="3.5" fill="#A855F7" />
          <circle cx="74" cy="100" r="7" stroke="#C084FC" strokeWidth="0.8" className="bmoat-ping" />
        </g>

        {/* ─── LEFT: Actual 3D Barista Oat Carton Render ─── */}
        <g className="bmoat-product-group" transform="translate(14, 20)">
          {/* Floor Glow & Contact Shadow */}
          <ellipse cx="56" cy="164" rx="42" ry="14" fill="#7C4DDB" fillOpacity="0.34" filter="blur(9px)" />
          <ellipse cx="56" cy="164" rx="26" ry="8" fill="#000000" fillOpacity="0.8" filter="blur(3px)" />

          {/* Actual 3D Carton Cutout Image */}
          <image
            href="/brand/carton_3d_cutout.png"
            x="4"
            y="10"
            width="106"
            height="156"
            preserveAspectRatio="xMidYMid meet"
            className="bmoat-product-3d"
          />
        </g>

        {/* ─── RIGHT: Interactive Purchase Order Slabs in Brand Purple ─── */}
        <g transform="translate(138, 42)">
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
                  width="174"
                  height="38"
                  rx="9"
                  fill={isSelected ? '#1A152E' : '#0E0D18'}
                  stroke={isSelected ? '#A855F7' : 'rgba(168, 85, 247, 0.22)'}
                  strokeWidth={isSelected ? '1.4' : '0.8'}
                />

                {/* Top Specular Line for Active Row */}
                {isSelected && (
                  <path d="M1 9 C 1 4, 4 1, 9 1 L 165 1 C 170 1, 173 4, 173 9" stroke="rgba(216, 180, 254, 0.7)" strokeWidth="0.9" fill="none" />
                )}

                {/* Monogram Avatar Badge in Brand Purple */}
                <rect
                  x="10"
                  y="8"
                  width="22"
                  height="22"
                  rx="5"
                  fill={isSelected ? '#6D28D9' : '#3B1868'}
                  stroke={isSelected ? '#C084FC' : 'rgba(168, 85, 247, 0.4)'}
                  strokeWidth="0.75"
                />
                <text
                  x="21"
                  y="22.5"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="800"
                  textAnchor="middle"
                  fontFamily="system-ui, sans-serif"
                >
                  {row.initial}
                </text>

                {/* Venue Title & Status */}
                <text
                  x="38"
                  y="17"
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontWeight={isSelected ? '700' : '600'}
                  fontFamily="system-ui, sans-serif"
                >
                  {row.venue}
                </text>
                <circle cx="41" cy="26" r="2" fill={isSelected ? '#10B981' : '#A855F7'} />
                {isSelected && (
                  <circle cx="41" cy="26" r="4.5" stroke="#10B981" strokeWidth="0.6" strokeOpacity="0.5" className="bmoat-ping" />
                )}
                <text
                  x="48"
                  y="28.5"
                  fill={isSelected ? '#E2E8F0' : 'rgba(255, 255, 255, 0.6)'}
                  fontSize="7.2"
                  fontWeight="500"
                  fontFamily="system-ui, sans-serif"
                >
                  {row.status}
                </text>

                {/* Order Quantity Badge in Frosted Capsule */}
                <rect
                  x="134"
                  y="11"
                  width="30"
                  height="16"
                  rx="4"
                  fill={isSelected ? 'rgba(147, 51, 234, 0.25)' : 'rgba(255, 255, 255, 0.04)'}
                  stroke={isSelected ? '#C084FC' : 'rgba(168, 85, 247, 0.2)'}
                  strokeWidth="0.6"
                />
                <text
                  x="149"
                  y="22"
                  fill="#FFFFFF"
                  fontSize="7.8"
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
