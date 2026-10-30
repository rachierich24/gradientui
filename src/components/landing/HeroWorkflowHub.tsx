'use client';

import React, { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   GRADIENT HERO — 3D CONTINUOUS CONVEYOR WORKFLOW ANIMATION
   Inspired by Gradient 365 (gradient365.com) hero flow:
   - LEFT: Continuous stream of 3D incoming cards (fragmented café & supplier
     orders, trial flights, raw demand) moving from the left into the center hub.
   - CENTER: Elevated 3D platform hub with royal-blue dial, rotating holographic
     laser rings, glowing entrance notch, and upward ambient light beam.
   - RIGHT: Continuous stream of 3D connected workflow cards (automated Net-15 POs,
     smart reorders, live telemetry sync) emerging from the hub and moving towards
     the right into the distance.
   - TRANSITION: Constant running, silky-smooth 60fps continuous conveyor motion.
───────────────────────────────────────────────────────────────────────────── */

interface LeftCardData {
  id: string;
  category: string;
  catColor: string;
  catBg: string;
  title: string;
  detail: string;
  metric: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  iconType: 'oatmilk' | 'coffee' | 'syrup' | 'cups';
}

interface RightCardData {
  id: string;
  pillText: string;
  pillGrad: string;
  title: string;
  detail: string;
  metric: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
}

const LEFT_CARDS: LeftCardData[] = [
  {
    id: 'left-milk',
    category: 'CAFÉ REQUISITION',
    catColor: '#7C3AED',
    catBg: 'rgba(124, 58, 237, 0.08)',
    title: 'Barista Oat Milk · 80 L',
    detail: 'Blue Tokai Roastery · Delhi NCR',
    metric: '₹16,800',
    badge: 'UNSTRUCTURED CHAT',
    badgeColor: '#D97706',
    badgeBg: 'rgba(217, 119, 6, 0.1)',
    iconType: 'oatmilk',
  },
  {
    id: 'left-coffee',
    category: 'ROAST BATCH',
    catColor: '#059669',
    catBg: 'rgba(5, 150, 105, 0.08)',
    title: 'Arabica AA Roast · 120 kg',
    detail: 'Southfield Roastery · Lot #402',
    metric: '₹1,850/kg',
    badge: 'DEMAND SIGNAL',
    badgeColor: '#7C3AED',
    badgeBg: 'rgba(124, 58, 237, 0.1)',
    iconType: 'coffee',
  },
  {
    id: 'left-syrup',
    category: 'SAMPLE FLIGHT',
    catColor: '#0284C7',
    catBg: 'rgba(2, 132, 199, 0.08)',
    title: 'Vanilla & Hazelnut Syrups',
    detail: 'Tamarind Lane · 42 Cafés',
    metric: '★ 4.9 Cupping',
    badge: 'TRIAL PACK',
    badgeColor: '#0055D4',
    badgeBg: 'rgba(0, 85, 212, 0.1)',
    iconType: 'syrup',
  },
  {
    id: 'left-cups',
    category: 'PACKAGING PO',
    catColor: '#D97706',
    catBg: 'rgba(217, 119, 6, 0.08)',
    title: '12oz Ripple Cups · 5k pcs',
    detail: 'Subko Roasters · Bandra Hub',
    metric: '₹32,500',
    badge: 'MANUAL ORDER',
    badgeColor: '#DC2626',
    badgeBg: 'rgba(220, 38, 38, 0.1)',
    iconType: 'cups',
  },
];

const RIGHT_CARDS: RightCardData[] = [
  {
    id: 'right-po',
    pillText: 'AUTOMATED ORDER',
    pillGrad: 'bluePillGrad',
    title: 'Net-15 Recurring PO #8492',
    detail: '148 Cafés Reordering · Weekly',
    metric: '₹1,98,400',
    badge: 'CONFIRMED',
    badgeColor: '#16A34A',
    badgeBg: 'rgba(22, 163, 74, 0.12)',
  },
  {
    id: 'right-reorder',
    pillText: 'DISPATCH WORKFLOW',
    pillGrad: 'purplePillGrad',
    title: 'Hillfold Roastery · Net-15',
    detail: 'Van Slot 02 · Temp Monitored',
    metric: '₹84,200',
    badge: 'EN ROUTE',
    badgeColor: '#2563EB',
    badgeBg: 'rgba(37, 99, 235, 0.12)',
  },
  {
    id: 'right-telemetry',
    pillText: 'TELEMETRY SYNC',
    pillGrad: 'emeraldPillGrad',
    title: 'Catalogue Telemetry Stream',
    detail: '40+ Verified Specialty Venues',
    metric: '₹2,76,300',
    badge: 'ACTIVE VELOCITY',
    badgeColor: '#059669',
    badgeBg: 'rgba(5, 150, 105, 0.12)',
  },
  {
    id: 'right-trial',
    pillText: 'PO CONVERSION',
    pillGrad: 'indigoPillGrad',
    title: 'Sampling Flight → Standing PO',
    detail: 'Bramblegate Roasters · Tier 1',
    metric: '16 Cases / mo',
    badge: 'VERIFIED ★ 4.9',
    badgeColor: '#7C3AED',
    badgeBg: 'rgba(124, 58, 237, 0.12)',
  },
];

export function HeroWorkflowHub() {
  const [captionIndex, setCaptionIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Cycling caption footnote
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCaptionIndex((prev) => (prev + 1) % RIGHT_CARDS.length);
    }, 3500);
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

            {/* Hub Royal Blue Dial/Well Gradient */}
            <linearGradient id="hubRoyalBlueWell" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="45%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>

            {/* Upward Vertical Light Flare */}
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

            {/* Glossy 3D Purple Pill Gradient */}
            <linearGradient id="purplePillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="55%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>

            {/* Glossy 3D Emerald Pill Gradient */}
            <linearGradient id="emeraldPillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="55%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            {/* Glossy 3D Indigo Pill Gradient */}
            <linearGradient id="indigoPillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="55%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#3730A3" />
            </linearGradient>

            {/* Right Conveyor Bed Gradient */}
            <linearGradient id="conveyorBedGradRight" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#0055D4" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Left Conveyor Bed Gradient */}
            <linearGradient id="conveyorBedGradLeft" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#0055D4" stopOpacity="0.08" />
            </linearGradient>

            {/* Realistic Contact Shadow on Floor Under Hub */}
            <filter id="hubFloorShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="24" stdDeviation="18" floodColor="#0F172A" floodOpacity="0.16" />
            </filter>

            {/* Card Drop Shadows */}
            <filter id="sheetDropShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="2" dy="14" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.10" />
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0055D4" floodOpacity="0.05" />
            </filter>

            {/* Action Pill Shadow */}
            <filter id="pillShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1E40AF" floodOpacity="0.35" />
            </filter>

            {/* Glow Filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Ambient Vignette & Ground Rays */}
          <ellipse cx="510" cy="335" rx="460" ry="210" fill="rgba(0, 85, 212, 0.015)" />
          <ellipse cx="510" cy="315" rx="320" ry="140" fill="rgba(238, 246, 255, 0.55)" />

          {/* Perspective Ground Grid Lines */}
          <g stroke="rgba(0, 85, 212, 0.035)" strokeWidth="1" strokeDasharray="3 4">
            <line x1="60" y1="335" x2="1180" y2="335" />
            <line x1="40" y1="490" x2="510" y2="335" />
            <line x1="80" y1="180" x2="510" y2="335" />
          </g>

          {/* Upward Vertical Light Flare behind Central Hub */}
          <path
            d="M 405 332 C 420 220, 440 120, 510 95 C 580 120, 600 220, 615 332 Z"
            fill="url(#hubUpwardBeam)"
            className="hflow-hub-aura"
          />

          {/* ─── LEFT: 3D CONVEYOR BED (Entering into the Center Hub) ─── */}
          <path
            d="M -90 460 L 360 325 L 420 355 L -30 490 Z"
            fill="url(#conveyorBedGradLeft)"
            stroke="rgba(124, 58, 237, 0.07)"
            strokeWidth="1"
            strokeDasharray="6 6"
            className="hflow-conveyor-rail-left"
          />

          {/* Left Incoming Laser Guide Track */}
          <path
            d="M -70 475 C 130 425, 260 380, 390 335"
            stroke="rgba(148, 163, 184, 0.45)"
            strokeWidth="1.8"
            strokeDasharray="5 5"
            fill="none"
          />

          {/* ─── RIGHT: 3D CONVEYOR BED (Rolling Belt towards Top-Right) ─── */}
          <path
            d="M 545 332 L 1180 -36 L 1255 6 L 620 372 Z"
            fill="url(#conveyorBedGradRight)"
            stroke="rgba(0, 85, 212, 0.08)"
            strokeWidth="1"
            strokeDasharray="6 6"
            className="hflow-conveyor-rail"
          />

          {/* ─── LEFT: CONTINUOUS RUNNING CARDS (Moving into Center Hub) ─── */}
          {LEFT_CARDS.map((card, idx) => (
            <g
              key={card.id}
              className={`hflow-stream-card-left hflow-stream-left-${idx}`}
            >
              {/* 3D Isometric Card Container */}
              <g transform="matrix(0.866025, -0.5, 0.866025, 0.5, 0, 0)">
                {/* Drop Shadow */}
                <rect
                  x="-96"
                  y="-62"
                  width="192"
                  height="124"
                  rx="14"
                  fill="rgba(15, 23, 42, 0.12)"
                  filter="url(#sheetDropShadow)"
                />

                {/* 3D Sidewall Bevel Edge */}
                <rect
                  x="-96"
                  y="-56"
                  width="192"
                  height="124"
                  rx="14"
                  fill="#CBD5E1"
                />

                {/* Card Surface */}
                <rect
                  x="-96"
                  y="-62"
                  width="192"
                  height="124"
                  rx="14"
                  fill="#FFFFFF"
                  stroke="rgba(148, 163, 184, 0.35)"
                  strokeWidth="1.2"
                />

                {/* Category Pill Tag on Left Card */}
                <rect
                  x="-82"
                  y="-52"
                  width="92"
                  height="18"
                  rx="9"
                  fill={card.catBg}
                />
                <text
                  x="-36"
                  y="-40"
                  fill={card.catColor}
                  fontSize="7.5"
                  fontWeight="750"
                  letterSpacing="0.06em"
                  textAnchor="middle"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {card.category}
                </text>

                {/* Top-Right Raw Status Badge */}
                <rect
                  x="20"
                  y="-52"
                  width="64"
                  height="18"
                  rx="4"
                  fill={card.badgeBg}
                />
                <text
                  x="52"
                  y="-40"
                  fill={card.badgeColor}
                  fontSize="7"
                  fontWeight="750"
                  letterSpacing="0.04em"
                  textAnchor="middle"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {card.badge}
                </text>

                {/* Card Title & Subtitle */}
                <text
                  x="-82"
                  y="-14"
                  fill="#0F172A"
                  fontSize="11.5"
                  fontWeight="750"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {card.title}
                </text>
                <text
                  x="-82"
                  y="1"
                  fill="#64748B"
                  fontSize="8.5"
                  fontWeight="500"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {card.detail}
                </text>

                {/* Divider Line */}
                <line
                  x1="-84"
                  y1="12"
                  x2="84"
                  y2="12"
                  stroke="rgba(0, 0, 0, 0.06)"
                  strokeWidth="1"
                />

                {/* Bottom Row: Metric & 3D Product Miniature Icon */}
                <g transform="translate(-82, 22)">
                  {/* Miniature Product Icon */}
                  {card.iconType === 'oatmilk' && (
                    <g transform="translate(0, 2)">
                      <rect x="0" y="2" width="12" height="18" rx="2" fill="#7C3AED" />
                      <polygon points="0,2 6,-3 12,2" fill="#6D28D9" />
                      <text x="6" y="14" fill="#FFFFFF" fontSize="6" fontWeight="800" textAnchor="middle">OAT</text>
                    </g>
                  )}
                  {card.iconType === 'coffee' && (
                    <g transform="translate(0, 2)">
                      <rect x="0" y="0" width="14" height="20" rx="3" fill="#B45309" />
                      <ellipse cx="7" cy="8" rx="4" ry="2.5" fill="#FEF3C7" />
                      <line x1="7" y1="6" x2="7" y2="10" stroke="#B45309" strokeWidth="0.8" />
                    </g>
                  )}
                  {card.iconType === 'syrup' && (
                    <g transform="translate(2, 2)">
                      <rect x="2" y="6" width="10" height="14" rx="2" fill="#0284C7" />
                      <rect x="5" y="1" width="4" height="6" rx="1" fill="#0369A1" />
                      <rect x="4" y="10" width="6" height="6" fill="#FFFFFF" opacity="0.85" />
                    </g>
                  )}
                  {card.iconType === 'cups' && (
                    <g transform="translate(0, 2)">
                      <polygon points="1,2 13,2 10,20 4,20" fill="#059669" />
                      <rect x="0" y="0" width="14" height="3" rx="1.5" fill="#10B981" />
                    </g>
                  )}

                  <text
                    x="22"
                    y="14"
                    fill="#0F172A"
                    fontSize="11"
                    fontWeight="800"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {card.metric}
                  </text>
                  <text
                    x="166"
                    y="14"
                    fill="#94A3B8"
                    fontSize="7.5"
                    fontWeight="600"
                    textAnchor="end"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    RAW INFLOW →
                  </text>
                </g>
              </g>
            </g>
          ))}

          {/* ─── RIGHT: CONTINUOUS RUNNING CARDS (Moving towards Right) ─── */}
          {RIGHT_CARDS.map((card, idx) => (
            <g
              key={card.id}
              className={`hflow-stream-card-right hflow-stream-right-${idx}`}
            >
              {/* 3D Isometric Workflow Sheet */}
              <g transform="matrix(0.866025, -0.5, 0.866025, 0.5, 0, 0)">
                {/* Drop Shadow */}
                <rect
                  x="-96"
                  y="-62"
                  width="192"
                  height="124"
                  rx="14"
                  fill="rgba(15, 23, 42, 0.12)"
                  filter="url(#sheetDropShadow)"
                />

                {/* 3D Sidewall Bevel Edge */}
                <rect
                  x="-96"
                  y="-56"
                  width="192"
                  height="124"
                  rx="14"
                  fill="#94A3B8"
                />

                {/* Top White Frosted Sheet Surface */}
                <rect
                  x="-96"
                  y="-62"
                  width="192"
                  height="124"
                  rx="14"
                  fill="#FFFFFF"
                  stroke="#0055D4"
                  strokeWidth="1.6"
                />

                {/* Corner Anchor Node */}
                <circle cx="-80" cy="-48" r="4.5" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.2" />
                <circle cx="-80" cy="-48" r="2" fill="#0055D4" />

                {/* Subtle Spreadsheet Grid Lines */}
                <line x1="-88" y1="-20" x2="88" y2="-20" stroke="rgba(0, 85, 212, 0.08)" strokeWidth="1" />
                <line x1="-88" y1="16" x2="88" y2="16" stroke="rgba(0, 85, 212, 0.08)" strokeWidth="1" />
                <line x1="-8" y1="-56" x2="-8" y2="52" stroke="rgba(0, 85, 212, 0.08)" strokeWidth="1" />

                {/* 3D Glossy Action Pill */}
                <rect
                  x="-12"
                  y="-54"
                  width="100"
                  height="22"
                  rx="11"
                  fill={`url(#${card.pillGrad})`}
                  filter="url(#pillShadow)"
                />
                <path
                  d="M 0 -52 L 76 -52"
                  stroke="rgba(255, 255, 255, 0.55)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <text
                  x="38"
                  y="-40"
                  fill="#FFFFFF"
                  fontSize="7.5"
                  fontWeight="750"
                  letterSpacing="0.04em"
                  textAnchor="middle"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {card.pillText}
                </text>

                {/* Workflow Card Content */}
                <text
                  x="-80"
                  y="-2"
                  fill="#0F172A"
                  fontSize="11"
                  fontWeight="750"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {card.title}
                </text>
                <text
                  x="-80"
                  y="10"
                  fill="#64748B"
                  fontSize="8"
                  fontWeight="500"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {card.detail}
                </text>

                {/* Metric & Status Badge */}
                <text
                  x="86"
                  y="-2"
                  fill="#0055D4"
                  fontSize="10.5"
                  fontWeight="800"
                  textAnchor="end"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {card.metric}
                </text>
                <rect
                  x="48"
                  y="4"
                  width="38"
                  height="12"
                  rx="3.5"
                  fill={card.badgeBg}
                />
                <text
                  x="67"
                  y="13"
                  fill={card.badgeColor}
                  fontSize="7"
                  fontWeight="750"
                  textAnchor="middle"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {card.badge}
                </text>

                {/* Row of Miniature Connected Procurement App Badges */}
                <g transform="translate(-80, 26)">
                  {/* Badge 1: Coffee Bean */}
                  <rect x="0" y="0" width="18" height="18" rx="5" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="0.8" />
                  <ellipse cx="9" cy="9" rx="4" ry="2.8" fill="#B45309" transform="rotate(-30 9 9)" />
                  <line x1="6.5" y1="6.5" x2="11.5" y2="11.5" stroke="#FEF3C7" strokeWidth="0.8" />

                  {/* Badge 2: Oat Milk */}
                  <rect x="23" y="0" width="18" height="18" rx="5" fill="#EDE9FE" stroke="#DDD6FE" strokeWidth="0.8" />
                  <rect x="29" y="5" width="6.5" height="9" rx="1.2" fill="#7C3AED" />
                  <polygon points="29,5 32.25,2.5 35.5,5" fill="#6D28D9" />

                  {/* Badge 3: Vanilla Syrup */}
                  <rect x="46" y="0" width="18" height="18" rx="5" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="0.8" />
                  <rect x="53" y="6.5" width="4" height="7.5" rx="1.2" fill="#0284C7" />
                  <rect x="54" y="4" width="2" height="2.5" fill="#0369A1" />

                  {/* Badge 4: Verified Check */}
                  <rect x="69" y="0" width="18" height="18" rx="5" fill="#DCFCE7" stroke="#BBF7D0" strokeWidth="0.8" />
                  <polyline points="73,9 76.5,12.5 83,6" fill="none" stroke="#16A34A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>
            </g>
          ))}

          {/* ─── CENTER: 3D CYLINDER PLATFORM HUB ─── */}
          <g transform="translate(510, 335)">
            {/* Soft Neutral Ground Contact Shadow on Floor */}
            <ellipse
              cx="0"
              cy="52"
              rx="124"
              ry="42"
              fill="rgba(15, 23, 42, 0.15)"
              filter="url(#hubFloorShadow)"
            />

            {/* 3D Cylinder Sidewall */}
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

            {/* PHYSICAL ENTRANCE TUNNEL NOTCH (Where left incoming cards feed) */}
            <path
              d="M -98 12 L -70 19 L -70 34 L -98 27 Z"
              fill="#060912"
            />
            <line x1="-98" y1="27" x2="-70" y2="34" stroke="#38BDF8" strokeWidth="2.2" opacity="0.9" />
            <circle
              cx="-84"
              cy="25"
              r="4"
              fill="#38BDF8"
              filter="url(#glow)"
              className="hflow-portal-flash"
            />

            {/* Outer Beveled White Rim */}
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

            {/* THE ROYAL BLUE SUNKEN CORE / WELL */}
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
              strokeWidth="3.8"
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

            {/* Continuous Gentle Pulse Wave */}
            <ellipse
              cx="0"
              cy="0"
              rx="92"
              ry="35.5"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.5"
              className="hflow-ping-continuous"
            />
          </g>
        </svg>

        {/* Live Running Sequence Caption Footnote */}
        <div className="hflow-footer-caption">
          <div className="hflow-caption-pill">
            <span className="hflow-pill-pulse" aria-hidden="true" />
            <span className="hflow-pill-label">LIVE ECOSYSTEM PIPELINE</span>
            <span className="hflow-pill-sep">·</span>
            <span className="hflow-pill-metric">
              {LEFT_CARDS[captionIndex].title} → {RIGHT_CARDS[captionIndex].title} ({RIGHT_CARDS[captionIndex].pillText})
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
