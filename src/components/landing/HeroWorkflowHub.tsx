'use client';

import React, { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   GRADIENT HERO — 3D CONTINUOUS CONVEYOR WORKFLOW ANIMATION
   Design Reference: Chatsheet 3D automation hero workflow + Gradient 365
   
   Architecture:
   - LEFT: Organic branching network of dotted guide lines carrying floating
     3D isometric procurement tiles (WhatsApp, Spreadsheets, Roast Beans,
     Oat Milk, Syrups, PDF Invoices) gliding continuously into the hub tunnel.
   - CENTER: Elevated 3D circular cylinder platform hub with dark sidewall,
     entrance tunnel notch on left, royal-blue target dial, rotating concentric
     laser rings, central aperture jewel, and upward vertical light flare.
   - RIGHT: 3D translucent conveyor belt carrying continuous 3D isometric
     workflow sheets (Net-15 POs, Smart Reorders, Telemetry Sync) with glossy
     action pill buttons, spreadsheet grids, and miniature connected app badges.
   - MOTION: Constant running, silky-smooth 60fps continuous animation.
───────────────────────────────────────────────────────────────────────────── */

interface WorkflowCardData {
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

const WORKFLOW_CARDS: WorkflowCardData[] = [
  {
    id: 'card-po',
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
    id: 'card-reorder',
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
    id: 'card-telemetry',
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
    id: 'card-trial',
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
      setCaptionIndex((prev) => (prev + 1) % WORKFLOW_CARDS.length);
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
          viewBox="0 0 1240 600"
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
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.22" />
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

            {/* Conveyor Bed Gradient */}
            <linearGradient id="conveyorBedGrad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#0055D4" stopOpacity="0.07" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Realistic Contact Shadow on Floor Under Hub */}
            <filter id="hubFloorShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="24" stdDeviation="18" floodColor="#0F172A" floodOpacity="0.14" />
            </filter>

            {/* Sheet Drop Shadows */}
            <filter id="sheetDropShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="2" dy="16" stdDeviation="14" floodColor="#0F172A" floodOpacity="0.10" />
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0055D4" floodOpacity="0.05" />
            </filter>

            {/* Floating 3D Tile Shadow */}
            <filter id="tileDropShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="1" dy="8" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.11" />
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
          <ellipse cx="510" cy="355" rx="460" ry="210" fill="rgba(0, 85, 212, 0.015)" />
          <ellipse cx="510" cy="335" rx="320" ry="140" fill="rgba(238, 246, 255, 0.55)" />

          {/* Perspective Ground Grid Rays */}
          <g stroke="rgba(0, 85, 212, 0.035)" strokeWidth="1" strokeDasharray="3 4">
            <line x1="60" y1="355" x2="1180" y2="355" />
            <line x1="40" y1="510" x2="510" y2="355" />
            <line x1="80" y1="180" x2="510" y2="355" />
          </g>

          {/* Upward Vertical Light Flare behind Central Hub */}
          <path
            d="M 405 352 C 420 230, 440 130, 510 105 C 580 130, 600 230, 615 352 Z"
            fill="url(#hubUpwardBeam)"
            className="hflow-hub-aura"
          />

          {/* ─── LEFT: DOTTED BRANCHING NETWORK (Chatsheet Signature Delta) ─── */}
          <g stroke="#94A3B8" strokeWidth="1.6" strokeDasharray="4 5" opacity="0.65" fill="none">
            {/* Branch 1: Top-Left Outer Curve */}
            <path id="branchPath1" d="M 40 330 C 130 305, 210 340, 270 380 C 330 420, 385 410, 436 405" />

            {/* Branch 2: Top-Left Mid Curve */}
            <path id="branchPath2" d="M 100 395 C 180 375, 245 400, 305 420 C 365 435, 400 415, 436 405" />

            {/* Branch 3: Left-Mid Trunk Curve */}
            <path id="branchPath3" d="M 70 470 C 160 455, 245 440, 325 430 C 375 425, 405 415, 436 405" />

            {/* Branch 4: Bottom-Left Curve */}
            <path id="branchPath4" d="M 150 545 C 220 530, 280 485, 340 455 C 380 435, 410 415, 436 405" />

            {/* Branch 5: Bottom-Center Curve */}
            <path id="branchPath5" d="M 250 580 C 310 555, 350 505, 380 465 C 400 435, 420 415, 436 405" />

            {/* Branch 6: Foreground Direct Feeder */}
            <path id="branchPath6" d="M 335 465 C 375 450, 405 425, 436 405" />
          </g>

          {/* Convergence Node Glow right at Tunnel Mouth */}
          <circle cx="436" cy="405" r="4" fill="#38BDF8" filter="url(#glow)" />
          <circle cx="436" cy="405" r="2" fill="#FFFFFF" />

          {/* ─── LEFT: CONTINUOUS RUNNING 3D ISOMETRIC TILES ─── */}
          {/* Tile 1: WhatsApp Chat (Green) on Branch 1 */}
          <g>
            <animateMotion dur="11s" repeatCount="indefinite" begin="0s" path="M 40 330 C 130 305, 210 340, 270 380 C 330 420, 385 410, 436 405" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.12;0.82;0.94;1" dur="11s" repeatCount="indefinite" begin="0s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-21" y="-21" width="42" height="42" rx="9" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-21" y="-16" width="42" height="42" rx="9" fill="#CBD5E1" />
              <rect x="-21" y="-21" width="42" height="42" rx="9" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.2" />
              <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#DCFCE7" />
              {/* WhatsApp Chat Speech Bubble Glyph */}
              <path d="M -7 -4 C -7 -7, 7 -7, 7 -4 C 7 -1, 3 1, 0 1 L -4 4 L -3 1 C -6 1, -7 -1, -7 -4 Z" fill="#25D366" />
              <circle cx="0" cy="-3" r="1.5" fill="#FFFFFF" />
            </g>
          </g>

          {/* Tile 2: PDF Purchase Order (Coral) on Branch 1 (Offset) */}
          <g>
            <animateMotion dur="11s" repeatCount="indefinite" begin="-5.5s" path="M 40 330 C 130 305, 210 340, 270 380 C 330 420, 385 410, 436 405" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.12;0.82;0.94;1" dur="11s" repeatCount="indefinite" begin="-5.5s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-21" y="-21" width="42" height="42" rx="9" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-21" y="-16" width="42" height="42" rx="9" fill="#CBD5E1" />
              <rect x="-21" y="-21" width="42" height="42" rx="9" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.2" />
              <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#FEE2E2" />
              {/* PDF Document Glyph */}
              <path d="M -5 -7 L 2 -7 L 6 -3 L 6 7 L -5 7 Z" fill="none" stroke="#E11D48" strokeWidth="1.5" strokeLinejoin="round" />
              <polygon points="2,-7 6,-3 2,-3" fill="#E11D48" />
              <line x1="-3" y1="1" x2="3" y2="1" stroke="#E11D48" strokeWidth="1.2" />
              <line x1="-3" y1="4" x2="1" y2="4" stroke="#E11D48" strokeWidth="1.2" />
            </g>
          </g>

          {/* Tile 3: Specialty Roast Bean (Amber) on Branch 2 */}
          <g>
            <animateMotion dur="12s" repeatCount="indefinite" begin="0s" path="M 100 395 C 180 375, 245 400, 305 420 C 365 435, 400 415, 436 405" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.12;0.82;0.94;1" dur="12s" repeatCount="indefinite" begin="0s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-21" y="-21" width="42" height="42" rx="9" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-21" y="-16" width="42" height="42" rx="9" fill="#CBD5E1" />
              <rect x="-21" y="-21" width="42" height="42" rx="9" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.2" />
              <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#FEF3C7" />
              {/* Coffee Bean Glyph */}
              <ellipse cx="0" cy="0" rx="6" ry="4" fill="#B45309" transform="rotate(-30 0 0)" />
              <path d="M -3 -3 Q 0 0, 3 3" stroke="#FEF3C7" strokeWidth="1" fill="none" />
            </g>
          </g>

          {/* Tile 4: Excel / Sheets Table (Emerald) on Branch 3 */}
          <g>
            <animateMotion dur="10s" repeatCount="indefinite" begin="0s" path="M 70 470 C 160 455, 245 440, 325 430 C 375 425, 405 415, 436 405" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.12;0.82;0.94;1" dur="10s" repeatCount="indefinite" begin="0s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-21" y="-21" width="42" height="42" rx="9" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-21" y="-16" width="42" height="42" rx="9" fill="#CBD5E1" />
              <rect x="-21" y="-21" width="42" height="42" rx="9" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.2" />
              <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#ECFDF5" />
              {/* Spreadsheet Grid Glyph */}
              <rect x="-6" y="-6" width="12" height="12" rx="1.5" stroke="#107C41" strokeWidth="1.3" fill="none" />
              <line x1="-6" y1="-2" x2="6" y2="-2" stroke="#107C41" strokeWidth="1" />
              <line x1="-6" y1="2" x2="6" y2="2" stroke="#107C41" strokeWidth="1" />
              <line x1="-1" y1="-6" x2="-1" y2="6" stroke="#107C41" strokeWidth="1" />
            </g>
          </g>

          {/* Tile 5: Barista Oat Milk Carton (Purple) on Branch 4 */}
          <g>
            <animateMotion dur="12s" repeatCount="indefinite" begin="0s" path="M 150 545 C 220 530, 280 485, 340 455 C 380 435, 410 415, 436 405" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.12;0.82;0.94;1" dur="12s" repeatCount="indefinite" begin="0s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-21" y="-21" width="42" height="42" rx="9" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-21" y="-16" width="42" height="42" rx="9" fill="#CBD5E1" />
              <rect x="-21" y="-21" width="42" height="42" rx="9" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.2" />
              <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#F3EEFD" />
              {/* Milk Carton Glyph */}
              <rect x="-5" y="-5" width="10" height="12" rx="1.5" stroke="#7C3AED" strokeWidth="1.4" fill="none" />
              <polygon points="-5,-5 0,-8 5,-5" stroke="#7C3AED" strokeWidth="1.3" fill="none" />
              <circle cx="0" cy="1" r="1.5" fill="#7C3AED" />
            </g>
          </g>

          {/* Tile 6: Vanilla Syrup Bottle (Cyan) on Branch 5 */}
          <g>
            <animateMotion dur="13s" repeatCount="indefinite" begin="0s" path="M 250 580 C 310 555, 350 505, 380 465 C 400 435, 420 415, 436 405" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.12;0.82;0.94;1" dur="13s" repeatCount="indefinite" begin="0s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-21" y="-21" width="42" height="42" rx="9" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-21" y="-16" width="42" height="42" rx="9" fill="#CBD5E1" />
              <rect x="-21" y="-21" width="42" height="42" rx="9" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.2" />
              <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#EFF6FF" />
              {/* Syrup Bottle Glyph */}
              <rect x="-4" y="-2" width="8" height="10" rx="1.5" stroke="#0284C7" strokeWidth="1.3" fill="none" />
              <rect x="-2" y="-6" width="4" height="4" rx="0.8" stroke="#0284C7" strokeWidth="1.1" fill="none" />
              <rect x="-3" y="1" width="6" height="4" fill="#0284C7" opacity="0.4" />
            </g>
          </g>

          {/* Tile 7: Foreground Feeder (Google Drive / Cloud Folder style) on Branch 6 */}
          <g>
            <animateMotion dur="9s" repeatCount="indefinite" begin="-2s" path="M 335 465 C 375 450, 405 425, 436 405" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.15;0.80;0.92;1" dur="9s" repeatCount="indefinite" begin="-2s" />
            <g transform="matrix(0.866025, 0.5, -0.866025, 0.5, 0, 0)">
              <rect x="-21" y="-21" width="42" height="42" rx="9" fill="rgba(15, 23, 42, 0.12)" filter="url(#tileDropShadow)" />
              <rect x="-21" y="-16" width="42" height="42" rx="9" fill="#CBD5E1" />
              <rect x="-21" y="-21" width="42" height="42" rx="9" fill="#FFFFFF" stroke="rgba(226, 232, 240, 0.95)" strokeWidth="1.2" />
              <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#FEF2F2" />
              {/* Cold-Chain Dispatch Box Glyph */}
              <polygon points="0,-6 6,-3 0,0 -6,-3" stroke="#DC2626" strokeWidth="1.2" fill="none" />
              <polygon points="-6,-3 0,0 0,6 -6,3" stroke="#DC2626" strokeWidth="1.2" fill="none" />
              <polygon points="0,0 6,-3 6,3 0,6" stroke="#DC2626" strokeWidth="1.2" fill="none" />
            </g>
          </g>

          {/* ─── RIGHT: 3D CONVEYOR BED (Rolling Belt towards Top-Right) ─── */}
          <path
            d="M 555 352 L 1180 -16 L 1255 26 L 630 392 Z"
            fill="url(#conveyorBedGrad)"
            stroke="rgba(0, 85, 212, 0.08)"
            strokeWidth="1"
            strokeDasharray="6 6"
            className="hflow-conveyor-rail"
          />

          {/* ─── RIGHT: CONTINUOUS 3D WORKFLOW SHEETS (Chatsheet Signature) ─── */}
          {WORKFLOW_CARDS.map((card, idx) => (
            <g
              key={card.id}
              className={`hflow-stream-sheet hflow-stream-sheet-${idx}`}
            >
              {/* 3D Isometric Workflow Sheet (Matrix 30° slant) */}
              <g transform="matrix(0.866025, -0.5, 0.866025, 0.5, 0, 0)">
                {/* Drop Shadow */}
                <rect
                  x="-106"
                  y="-72"
                  width="212"
                  height="144"
                  rx="16"
                  fill="rgba(15, 23, 42, 0.12)"
                  filter="url(#sheetDropShadow)"
                />

                {/* 3D Sidewall Bevel Edge */}
                <rect
                  x="-106"
                  y="-66"
                  width="212"
                  height="144"
                  rx="16"
                  fill="#94A3B8"
                />

                {/* Top White Frosted Sheet Surface */}
                <rect
                  x="-106"
                  y="-72"
                  width="212"
                  height="144"
                  rx="16"
                  fill="#FFFFFF"
                  stroke="#0055D4"
                  strokeWidth="1.6"
                />

                {/* Corner Anchor Node (Chatsheet signature detail) */}
                <circle cx="-88" cy="-56" r="4.5" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.2" />
                <circle cx="-88" cy="-56" r="2" fill="#0055D4" />

                {/* Subtle Spreadsheet Grid Lines */}
                <line x1="-96" y1="-22" x2="96" y2="-22" stroke="rgba(0, 85, 212, 0.08)" strokeWidth="1" />
                <line x1="-96" y1="18" x2="96" y2="18" stroke="rgba(0, 85, 212, 0.08)" strokeWidth="1" />
                <line x1="-8" y1="-64" x2="-8" y2="60" stroke="rgba(0, 85, 212, 0.08)" strokeWidth="1" />

                {/* 3D Glossy Action Pill (Chatsheet Signature) */}
                <rect
                  x="-14"
                  y="-62"
                  width="114"
                  height="26"
                  rx="13"
                  fill={`url(#${card.pillGrad})`}
                  filter="url(#pillShadow)"
                />
                <path
                  d="M -1 -60 L 86 -60"
                  stroke="rgba(255, 255, 255, 0.55)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <text
                  x="43"
                  y="-45"
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontWeight="750"
                  letterSpacing="0.04em"
                  textAnchor="middle"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {card.pillText}
                </text>

                {/* Workflow Card Content */}
                <text
                  x="-88"
                  y="-2"
                  fill="#0F172A"
                  fontSize="12.5"
                  fontWeight="750"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {card.title}
                </text>
                <text
                  x="-88"
                  y="11"
                  fill="#64748B"
                  fontSize="9"
                  fontWeight="500"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {card.detail}
                </text>

                {/* Metric & Status Badge on Right of Grid */}
                <text
                  x="96"
                  y="-2"
                  fill="#0055D4"
                  fontSize="11.5"
                  fontWeight="800"
                  textAnchor="end"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {card.metric}
                </text>
                <rect
                  x="54"
                  y="4"
                  width="42"
                  height="13"
                  rx="3.5"
                  fill={card.badgeBg}
                />
                <text
                  x="75"
                  y="13.5"
                  fill={card.badgeColor}
                  fontSize="7.5"
                  fontWeight="750"
                  textAnchor="middle"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {card.badge}
                </text>

                {/* Row of Miniature Connected App / Product Badges (Chatsheet Signature) */}
                <g transform="translate(-88, 29)">
                  {/* Badge 1: Coffee Bean */}
                  <rect x="0" y="0" width="20" height="20" rx="5.5" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="0.8" />
                  <ellipse cx="10" cy="10" rx="4.5" ry="3.2" fill="#B45309" transform="rotate(-30 10 10)" />
                  <line x1="7.5" y1="7.5" x2="12.5" y2="12.5" stroke="#FEF3C7" strokeWidth="0.8" />

                  {/* Badge 2: Oat Milk */}
                  <rect x="25" y="0" width="20" height="20" rx="5.5" fill="#EDE9FE" stroke="#DDD6FE" strokeWidth="0.8" />
                  <rect x="32" y="5.5" width="7" height="10" rx="1.3" fill="#7C3AED" />
                  <polygon points="32,5.5 35.5,2.5 39,5.5" fill="#6D28D9" />

                  {/* Badge 3: Vanilla Syrup */}
                  <rect x="50" y="0" width="20" height="20" rx="5.5" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="0.8" />
                  <rect x="58" y="7" width="4.5" height="8.5" rx="1.3" fill="#0284C7" />
                  <rect x="59" y="4.5" width="2.2" height="2.8" fill="#0369A1" />

                  {/* Badge 4: Verified Check */}
                  <rect x="75" y="0" width="20" height="20" rx="5.5" fill="#DCFCE7" stroke="#BBF7D0" strokeWidth="0.8" />
                  <polyline points="79.5,10 83.5,14 90.5,7" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>
            </g>
          ))}

          {/* ─── CENTER: 3D CYLINDER PLATFORM HUB (Elevated, Rendered ON TOP) ─── */}
          <g transform="translate(520, 365)">
            {/* Soft Neutral Ground Contact Shadow on Floor */}
            <ellipse
              cx="0"
              cy="52"
              rx="126"
              ry="42"
              fill="rgba(15, 23, 42, 0.14)"
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

            {/* PHYSICAL ENTRANCE TUNNEL NOTCH (Where left incoming lines feed) */}
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

            {/* THE ROYAL BLUE SUNKEN CORE / WELL (Chatsheet Signature) */}
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
              {WORKFLOW_CARDS[captionIndex].title} → {WORKFLOW_CARDS[captionIndex].pillText}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
