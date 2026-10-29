'use client';

import React, { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   GRADIENT HERO — 3D CONTINUOUS CONVEYOR WORKFLOW ANIMATION
   Primary reference: Chatsheet 3D automation hero workflow
   
   Architecture:
   - LEFT: 3 distinct curved conveyor lines converging into the hub portal,
           carrying 3D isometric procurement tiles with authentic café-supplier icons.
   - CENTER: Elevated 3D circular cylinder platform hub with dark slate sidewall,
             physical entrance tunnel notch, vibrant royal-blue circular well/dial,
             concentric segmented laser rings, and clean upward vertical light flare.
             (NO blue bowl underneath; realistic ground contact shadow on floor).
   - RIGHT: 3D translucent conveyor belt carrying continuous 3D isometric workflow sheets,
            each equipped with glossy royal-blue action pill buttons, spreadsheet grid,
            and miniature connected app/procurement icon badges along the bottom edge.
───────────────────────────────────────────────────────────────────────────── */

interface WorkflowCardData {
  id: string;
  pillText: string;
  title: string;
  detail: string;
  metric: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
}

const WORKFLOW_CARDS: WorkflowCardData[] = [
  {
    id: 'card-sync',
    pillText: 'AUTOMATION ACTION',
    title: 'Arabica AA Roast',
    detail: 'Southfield Supply · 120 kg',
    metric: '₹1,850/kg',
    badge: 'LIVE SYNC',
    badgeColor: '#16A34A',
    badgeBg: 'rgba(22, 163, 74, 0.12)',
  },
  {
    id: 'card-trial',
    pillText: 'STRATEGY CONTENT',
    title: 'Sampling Flight',
    detail: 'Vanilla Syrup · ★ 4.9',
    metric: '42 Cafés',
    badge: 'APPROVED',
    badgeColor: '#0055D4',
    badgeBg: 'rgba(0, 85, 212, 0.1)',
  },
  {
    id: 'card-po',
    pillText: 'VERIFIED PO',
    title: 'Net-15 Restock',
    detail: '12 Cases · Weekly Standing',
    metric: '₹84,200',
    badge: 'DISPATCH',
    badgeColor: '#16A34A',
    badgeBg: 'rgba(22, 163, 74, 0.12)',
  },
  {
    id: 'card-reorder',
    pillText: 'SMART REORDER',
    title: 'Barista Oat Milk',
    detail: 'Standing Mon 08:30 · Cold Chain',
    metric: 'Van Slot 02',
    badge: 'CONFIRMED',
    badgeColor: '#7C3AED',
    badgeBg: 'rgba(124, 58, 237, 0.12)',
  },
];

// Conveyor slot positions along the 30° isometric conveyor axis (receding up-right)
const CONVEYOR_SLOTS = [
  { x: 535, y: 350, scale: 0.68, opacity: 0 },    // Slot 0: Emerging from behind hub
  { x: 700, y: 256, scale: 1.0, opacity: 1 },     // Slot 1: Active front sheet
  { x: 865, y: 160, scale: 0.90, opacity: 0.95 }, // Slot 2: Mid conveyor sheet
  { x: 1030, y: 66, scale: 0.78, opacity: 0.75 }, // Slot 3: Receding sheet
  { x: 1195, y: -28, scale: 0.65, opacity: 0 },   // Slot 4: Exiting conveyor
];

export function HeroWorkflowHub() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hubPulse, setHubPulse] = useState<boolean>(false);

  // Conveyor continuous advancement loop
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setHubPulse(true);
      setTimeout(() => setHubPulse(false), 950);
      setActiveStep((prev) => (prev + 1) % WORKFLOW_CARDS.length);
    }, 3200);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      className="hflow-section"
      aria-label="Gradient 3D Continuous Conveyor Workflow Animation"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Soft Ambient Radial Vignette */}
      <div className="hflow-ambient-glow" aria-hidden="true" />

      <div className="hflow-container">
        <svg
          viewBox="0 0 1240 580"
          className="hflow-svg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Hub Sidewall Charcoal Gradient */}
            <linearGradient id="hubSideGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="35%" stopColor="#111827" />
              <stop offset="100%" stopColor="#0B0F19" />
            </linearGradient>

            {/* Hub Royal Blue Dial/Well Gradient (Chatsheet Signature) */}
            <linearGradient id="hubRoyalBlueWell" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="45%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>

            {/* Upward Vertical Light Flare (Strictly upward; NO bottom spill) */}
            <linearGradient id="hubUpwardBeam" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
              <stop offset="45%" stopColor="#0055D4" stopOpacity="0.08" />
              <stop offset="90%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Glossy 3D Blue Action Pill Gradient */}
            <linearGradient id="bluePillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="55%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>

            {/* Conveyor Bed Gradient */}
            <linearGradient id="conveyorBedGrad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#0055D4" stopOpacity="0.07" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Track Active Convergence Glow */}
            <linearGradient id="trackGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#0055D4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            {/* Realistic Contact Shadow on Floor Under Hub */}
            <filter id="hubFloorShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="24" stdDeviation="18" floodColor="#0F172A" floodOpacity="0.16" />
            </filter>

            {/* Card Drop Shadows */}
            <filter id="sheetDropShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="3" dy="16" stdDeviation="14" floodColor="#0F172A" floodOpacity="0.11" />
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0055D4" floodOpacity="0.06" />
            </filter>

            {/* Floating Tile Shadow */}
            <filter id="tileDropShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="2" dy="8" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.10" />
            </filter>

            {/* Action Pill Shadow */}
            <filter id="pillShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1E40AF" floodOpacity="0.4" />
            </filter>

            {/* Glow Filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Ambient Vignette & Ground Grid Rays */}
          <ellipse cx="510" cy="335" rx="460" ry="210" fill="rgba(0, 85, 212, 0.015)" />
          <ellipse cx="510" cy="315" rx="320" ry="140" fill="rgba(238, 246, 255, 0.55)" />

          <g stroke="rgba(0, 85, 212, 0.035)" strokeWidth="1" strokeDasharray="3 4">
            <line x1="60" y1="335" x2="1180" y2="335" />
            <line x1="100" y1="490" x2="510" y2="335" />
            <line x1="80" y1="180" x2="510" y2="335" />
          </g>

          {/* Upward Vertical Light Flare (Extends strictly UPWARD behind Hub) */}
          <path
            d="M 405 332 C 420 220, 440 120, 510 95 C 580 120, 600 220, 615 332 Z"
            fill="url(#hubUpwardBeam)"
            className="hflow-hub-aura"
            opacity={hubPulse ? 0.9 : 0.65}
          />

          {/* ─── RIGHT: 3D CONVEYOR BED (Rolling Belt towards Top-Right) ─── */}
          <path
            d="M 545 332 L 1180 -36 L 1255 6 L 620 372 Z"
            fill="url(#conveyorBedGrad)"
            stroke="rgba(0, 85, 212, 0.08)"
            strokeWidth="1"
            strokeDasharray="6 6"
            className="hflow-conveyor-rail"
          />

          {/* ─── RIGHT: 3D CONVEYOR CARDS MOVING TOWARDS THE RIGHT ─── */}
          {WORKFLOW_CARDS.map((card, idx) => {
            const slotIndex = (idx - activeStep + WORKFLOW_CARDS.length * 4) % WORKFLOW_CARDS.length;
            const slot = CONVEYOR_SLOTS[slotIndex] || CONVEYOR_SLOTS[0];
            const isFront = slotIndex === 1;

            return (
              <g
                key={card.id}
                className={`hflow-conveyor-card ${isFront ? 'is-front' : ''}`}
                style={{
                  transform: `translate(${slot.x}px, ${slot.y}px)`,
                  opacity: slot.opacity,
                  transition: 'transform 1200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 900ms ease',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setActiveStep((idx - 1 + WORKFLOW_CARDS.length) % WORKFLOW_CARDS.length);
                  setIsPaused(true);
                }}
              >
                {/* 3D Isometric Workflow Sheet (Matrix 30° slant) */}
                <g transform={`matrix(0.866025, -0.5, 0.866025, 0.5, 0, 0) scale(${slot.scale})`}>
                  {/* Drop Shadow */}
                  <rect
                    x="-112"
                    y="-78"
                    width="224"
                    height="154"
                    rx="18"
                    fill="rgba(15, 23, 42, 0.12)"
                    filter="url(#sheetDropShadow)"
                  />

                  {/* 3D Sidewall Bevel Edge */}
                  <rect
                    x="-112"
                    y="-72"
                    width="224"
                    height="154"
                    rx="18"
                    fill={isFront ? '#94A3B8' : '#CBD5E1'}
                  />

                  {/* Top White Frosted Sheet Surface */}
                  <rect
                    x="-112"
                    y="-78"
                    width="224"
                    height="154"
                    rx="18"
                    fill="#FFFFFF"
                    stroke={isFront ? '#0055D4' : 'rgba(0, 85, 212, 0.2)'}
                    strokeWidth={isFront ? '2' : '1.4'}
                  />

                  {/* Corner Anchor Node (Chatsheet signature detail) */}
                  <circle cx="-94" cy="-60" r="5" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.2" />
                  <circle cx="-94" cy="-60" r="2.2" fill="#0055D4" />

                  {/* Subtle Spreadsheet Grid Lines */}
                  <line x1="-102" y1="-26" x2="102" y2="-26" stroke="rgba(0, 85, 212, 0.08)" strokeWidth="1" />
                  <line x1="-102" y1="20" x2="102" y2="20" stroke="rgba(0, 85, 212, 0.08)" strokeWidth="1" />
                  <line x1="-8" y1="-70" x2="-8" y2="66" stroke="rgba(0, 85, 212, 0.08)" strokeWidth="1" />

                  {/* 3D Glossy Blue Action Pill (Chatsheet Signature) */}
                  <rect
                    x="-16"
                    y="-68"
                    width="122"
                    height="28"
                    rx="14"
                    fill="url(#bluePillGrad)"
                    filter="url(#pillShadow)"
                  />
                  {/* White Specular Edge on Pill */}
                  <path
                    d="M -2 -66 L 92 -66"
                    stroke="rgba(255, 255, 255, 0.55)"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                  <text
                    x="45"
                    y="-50"
                    fill="#FFFFFF"
                    fontSize="9"
                    fontWeight="700"
                    letterSpacing="0.04em"
                    textAnchor="middle"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {card.pillText}
                  </text>

                  {/* Workflow Card Content */}
                  <text
                    x="-94"
                    y="-4"
                    fill="#0F172A"
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {card.title}
                  </text>
                  <text
                    x="-94"
                    y="10"
                    fill="#64748B"
                    fontSize="9.5"
                    fontWeight="500"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {card.detail}
                  </text>

                  {/* Metric & Status Badge on Right of Grid */}
                  <text
                    x="100"
                    y="-4"
                    fill="#0055D4"
                    fontSize="12"
                    fontWeight="800"
                    textAnchor="end"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {card.metric}
                  </text>
                  <rect
                    x="56"
                    y="3"
                    width="44"
                    height="14"
                    rx="4"
                    fill={card.badgeBg}
                  />
                  <text
                    x="78"
                    y="13"
                    fill={card.badgeColor}
                    fontSize="8"
                    fontWeight="700"
                    textAnchor="middle"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {card.badge}
                  </text>

                  {/* Row of Miniature Connected App / Product Badges (Chatsheet Signature) */}
                  <g transform="translate(-94, 34)">
                    {/* Badge 1: Coffee Bean */}
                    <rect x="0" y="0" width="22" height="22" rx="6" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
                    <ellipse cx="11" cy="11" rx="5" ry="3.5" fill="#B45309" transform="rotate(-30 11 11)" />
                    <line x1="8" y1="8" x2="14" y2="14" stroke="#FEF3C7" strokeWidth="1" />

                    {/* Badge 2: Oat Milk */}
                    <rect x="28" y="0" width="22" height="22" rx="6" fill="#EDE9FE" stroke="#DDD6FE" strokeWidth="1" />
                    <rect x="35" y="6" width="8" height="11" rx="1.5" fill="#7C3AED" />
                    <polygon points="35,6 39,3 43,6" fill="#6D28D9" />

                    {/* Badge 3: Vanilla Syrup */}
                    <rect x="56" y="0" width="22" height="22" rx="6" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
                    <rect x="64.5" y="8" width="5" height="9" rx="1.5" fill="#0284C7" />
                    <rect x="66" y="5" width="2" height="3" fill="#0369A1" />

                    {/* Badge 4: Verified Check */}
                    <rect x="84" y="0" width="22" height="22" rx="6" fill="#DCFCE7" stroke="#BBF7D0" strokeWidth="1" />
                    <polyline points="89,11 93,15 101,7" fill="none" stroke="#16A34A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </g>
              </g>
            );
          })}

          {/* ─── CENTER: 3D CYLINDER PLATFORM HUB (Elevated, Realistic Floor Shadow) ─── */}
          <g transform="translate(510, 335)">
            {/* Soft, Neutral Ground Contact Shadow on Floor (NO Blue Bowl!) */}
            <ellipse
              cx="0"
              cy="52"
              rx="124"
              ry="42"
              fill="rgba(15, 23, 42, 0.15)"
              filter="url(#hubFloorShadow)"
            />

            {/* 3D Cylinder Sidewall (Dark Charcoal Matte) */}
            <path
              d="M -118 0 L -118 32 C -118 68, 118 68, 118 32 L 118 0 Z"
              fill="url(#hubSideGrad)"
            />

            {/* Cylinder Bottom Bevel Line */}
            <path
              d="M -118 32 C -118 68, 118 68, 118 32"
              stroke="rgba(56, 189, 248, 0.28)"
              strokeWidth="2"
              fill="none"
            />

            {/* PHYSICAL ENTRANCE TUNNEL NOTCH ON LEFT (Where incoming lines feed) */}
            <path
              d="M -98 12 L -70 19 L -70 34 L -98 27 Z"
              fill="#060912"
            />
            {/* Glowing Threshold Laser inside Notch */}
            <line x1="-98" y1="27" x2="-70" y2="34" stroke="#38BDF8" strokeWidth="2.2" opacity="0.9" />
            <circle
              cx="-84"
              cy="25"
              r="4"
              fill="#38BDF8"
              filter="url(#glow)"
              className={hubPulse ? 'hflow-portal-flash' : ''}
            />

            {/* Outer Beveled White Rim (Crisp White/Silver Chamfer) */}
            <ellipse
              cx="0"
              cy="0"
              rx="118"
              ry="46"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />

            <ellipse
              cx="0"
              cy="0"
              rx="106"
              ry="41"
              fill="#F8FAFC"
              stroke="#E2E8F0"
              strokeWidth="1.2"
            />

            {/* THE ROYAL BLUE SUNKEN CORE / WELL (Chatsheet's Signature) */}
            <ellipse
              cx="0"
              cy="0"
              rx="96"
              ry="37"
              fill="url(#hubRoyalBlueWell)"
            />

            {/* Groove 1: Outer Rotating Laser Ring */}
            <ellipse
              cx="0"
              cy="0"
              rx="80"
              ry="31"
              fill="none"
              stroke="#60A5FA"
              strokeWidth={hubPulse ? '4.8' : '3.8'}
              strokeDasharray="56 16 42 14 62 18"
              className="hflow-radar-ring-outer"
            />

            {/* Groove 2: Middle Counter-Rotating Laser Ring */}
            <ellipse
              cx="0"
              cy="0"
              rx="58"
              ry="22.5"
              fill="none"
              stroke="#93C5FD"
              strokeWidth="2.8"
              strokeDasharray="38 14 26 12 44 14"
              className="hflow-radar-ring-inner"
            />

            {/* Groove 3: Inner Concentric Ring */}
            <ellipse
              cx="0"
              cy="0"
              rx="38"
              ry="14.5"
              fill="none"
              stroke="#BFDBFE"
              strokeWidth="2"
              strokeDasharray="26 10 32 10"
            />

            {/* Central Bullseye Jewel */}
            <ellipse
              cx="0"
              cy="0"
              rx="22"
              ry="8.5"
              fill="#1E40AF"
              stroke="#93C5FD"
              strokeWidth="1.4"
            />
            <circle cx="0" cy="0" r="4.5" fill="#FFFFFF" filter="url(#glow)" />
            <circle cx="0" cy="0" r="2.2" fill="#38BDF8" />

            {/* Expanding Pulse Wave across Blue Dial on Cycle */}
            {hubPulse && (
              <ellipse
                cx="0"
                cy="0"
                rx="92"
                ry="35.5"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2.8"
                className="hflow-ping"
              />
            )}
          </g>

          {/* ─── LEFT: 3 DISTINCT CONVEYOR LINES (TOP, MIDDLE, BOTTOM) ─── */}
          {/* Line 1: Top Conveyor Stream */}
          <path
            id="trackLine1"
            d="M 50 195 C 160 175, 260 210, 420 348"
            stroke="rgba(148, 163, 184, 0.45)"
            strokeWidth="1.8"
            strokeDasharray="5 5"
            fill="none"
          />

          {/* Line 2: Middle Feeder Stream */}
          <path
            id="trackLine2"
            d="M 60 348 C 180 348, 290 348, 420 348"
            stroke="rgba(148, 163, 184, 0.45)"
            strokeWidth="1.8"
            strokeDasharray="5 5"
            fill="none"
          />

          {/* Line 3: Bottom Conveyor Stream */}
          <path
            id="trackLine3"
            d="M 80 480 C 190 470, 290 420, 420 348"
            stroke="rgba(148, 163, 184, 0.45)"
            strokeWidth="1.8"
            strokeDasharray="5 5"
            fill="none"
          />

          {/* Final Laser Feeder directly into Hub Entrance Notch */}
          <path
            d="M 420 348 L 442 350"
            stroke="url(#trackGlow)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="420" cy="348" r="4.5" fill="#0055D4" filter="url(#glow)" />
          <circle cx="420" cy="348" r="2" fill="#FFFFFF" />

          {/* ─── CONTINUOUS GLIDING 3D TILES ON LINE 1 (TOP STREAM) ─── */}
          <g>
            <animateMotion dur="12s" repeatCount="indefinite" begin="0s" path="M 50 195 C 160 175, 260 210, 420 348" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.1;0.84;0.95;1" dur="12s" repeatCount="indefinite" begin="0s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-24" y="-19" width="48" height="48" rx="11" fill="#CBD5E1" />
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.3" />
              <rect x="-16" y="-16" width="32" height="32" rx="7" fill="#EFF6FF" />
              {/* Coffee Cup Glyph */}
              <path d="M -7 -4 L -7 4 C -7 7, 5 7, 5 4 L 5 -4 Z" stroke="#0055D4" strokeWidth="1.8" fill="none" />
              <path d="M 5 -2 C 8 -2, 8 2, 5 2" stroke="#0055D4" strokeWidth="1.5" fill="none" />
            </g>
          </g>

          <g>
            <animateMotion dur="12s" repeatCount="indefinite" begin="-4s" path="M 50 195 C 160 175, 260 210, 420 348" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.1;0.84;0.95;1" dur="12s" repeatCount="indefinite" begin="-4s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-24" y="-19" width="48" height="48" rx="11" fill="#CBD5E1" />
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.3" />
              <rect x="-16" y="-16" width="32" height="32" rx="7" fill="#FAF5FF" />
              {/* Milk Carton Glyph */}
              <rect x="-6" y="-8" width="12" height="15" rx="1.5" stroke="#7C3AED" strokeWidth="1.5" fill="none" />
              <polygon points="-6,-8 0,-12 6,-8" stroke="#7C3AED" strokeWidth="1.4" fill="none" />
            </g>
          </g>

          <g>
            <animateMotion dur="12s" repeatCount="indefinite" begin="-8s" path="M 50 195 C 160 175, 260 210, 420 348" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.1;0.84;0.95;1" dur="12s" repeatCount="indefinite" begin="-8s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-24" y="-19" width="48" height="48" rx="11" fill="#CBD5E1" />
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.3" />
              <rect x="-16" y="-16" width="32" height="32" rx="7" fill="#FEF3C7" />
              {/* Syrup Bottle Glyph */}
              <rect x="-5" y="-5" width="10" height="13" rx="2" stroke="#D97706" strokeWidth="1.5" fill="none" />
              <rect x="-2" y="-10" width="4" height="5" stroke="#D97706" strokeWidth="1.3" fill="none" />
            </g>
          </g>

          {/* ─── CONTINUOUS GLIDING 3D TILES ON LINE 2 (MIDDLE FEEDER) ─── */}
          <g>
            <animateMotion dur="11s" repeatCount="indefinite" begin="0s" path="M 60 348 C 180 348, 290 348, 420 348" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.1;0.84;0.95;1" dur="11s" repeatCount="indefinite" begin="0s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-24" y="-19" width="48" height="48" rx="11" fill="#CBD5E1" />
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.3" />
              <rect x="-16" y="-16" width="32" height="32" rx="7" fill="#F0FDF4" />
              {/* Supply Box Isometric Glyph */}
              <polygon points="0,-8 7,-4 0,0 -7,-4" stroke="#059669" strokeWidth="1.4" fill="none" />
              <polygon points="-7,-4 0,0 0,8 -7,4" stroke="#059669" strokeWidth="1.4" fill="none" />
              <polygon points="0,0 7,-4 7,4 0,8" stroke="#059669" strokeWidth="1.4" fill="none" />
            </g>
          </g>

          <g>
            <animateMotion dur="11s" repeatCount="indefinite" begin="-3.6s" path="M 60 348 C 180 348, 290 348, 420 348" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.1;0.84;0.95;1" dur="11s" repeatCount="indefinite" begin="-3.6s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-24" y="-19" width="48" height="48" rx="11" fill="#CBD5E1" />
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.3" />
              <rect x="-16" y="-16" width="32" height="32" rx="7" fill="#EFF6FF" />
              {/* Storefront Façade Glyph */}
              <polygon points="-7,-1 0,-6 7,-1" stroke="#0055D4" strokeWidth="1.4" fill="none" />
              <rect x="-6" y="-1" width="12" height="9" stroke="#0055D4" strokeWidth="1.4" fill="none" />
              <rect x="-2" y="2" width="4" height="6" stroke="#0055D4" strokeWidth="1.2" fill="none" />
            </g>
          </g>

          <g>
            <animateMotion dur="11s" repeatCount="indefinite" begin="-7.3s" path="M 60 348 C 180 348, 290 348, 420 348" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.1;0.84;0.95;1" dur="11s" repeatCount="indefinite" begin="-7.3s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-24" y="-19" width="48" height="48" rx="11" fill="#CBD5E1" />
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.3" />
              <rect x="-16" y="-16" width="32" height="32" rx="7" fill="#FEF2F2" />
              {/* Demand Telemetry Line Glyph */}
              <path d="M -7 5 L -2 0 L 2 3 L 7 -5" stroke="#DC2626" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>

          {/* ─── CONTINUOUS GLIDING 3D TILES ON LINE 3 (BOTTOM STREAM) ─── */}
          <g>
            <animateMotion dur="13s" repeatCount="indefinite" begin="0s" path="M 80 480 C 190 470, 290 420, 420 348" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.1;0.84;0.95;1" dur="13s" repeatCount="indefinite" begin="0s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-24" y="-19" width="48" height="48" rx="11" fill="#CBD5E1" />
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.3" />
              <rect x="-16" y="-16" width="32" height="32" rx="7" fill="#F0F9FF" />
              {/* Wholesale Tag Glyph */}
              <polygon points="-6,-6 1,-6 6,-1 0,5 -6,-1" stroke="#0284C7" strokeWidth="1.4" fill="none" />
              <circle cx="-2" cy="-2" r="1.5" fill="#0284C7" />
            </g>
          </g>

          <g>
            <animateMotion dur="13s" repeatCount="indefinite" begin="-4.3s" path="M 80 480 C 190 470, 290 420, 420 348" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.1;0.84;0.95;1" dur="13s" repeatCount="indefinite" begin="-4.3s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-24" y="-19" width="48" height="48" rx="11" fill="#CBD5E1" />
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.3" />
              <rect x="-16" y="-16" width="32" height="32" rx="7" fill="#FEFCE8" />
              {/* Eco Roaster Bag Glyph */}
              <path d="M -6 -7 L 6 -7 L 4 7 L -4 7 Z" stroke="#CA8A04" strokeWidth="1.4" fill="none" />
            </g>
          </g>

          <g>
            <animateMotion dur="13s" repeatCount="indefinite" begin="-8.6s" path="M 80 480 C 190 470, 290 420, 420 348" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.1;0.84;0.95;1" dur="13s" repeatCount="indefinite" begin="-8.6s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-24" y="-19" width="48" height="48" rx="11" fill="#CBD5E1" />
              <rect x="-24" y="-24" width="48" height="48" rx="11" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.3" />
              <rect x="-16" y="-16" width="32" height="32" rx="7" fill="#F0FDF4" />
              {/* Ripple Cup Glyph */}
              <polygon points="-5,-6 5,-6 3 6 -3 6" stroke="#16A34A" strokeWidth="1.4" fill="none" />
            </g>
          </g>
        </svg>

        {/* Live Running Sequence Caption Footnote */}
        <div className="hflow-footer-caption">
          <div className="hflow-caption-pill">
            <span className="hflow-pill-pulse" aria-hidden="true" />
            <span className="hflow-pill-label">LIVE ECOSYSTEM PIPELINE</span>
            <span className="hflow-pill-sep">·</span>
            <span className="hflow-pill-metric">
              {WORKFLOW_CARDS[activeStep].title} → {WORKFLOW_CARDS[activeStep].pillText}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
