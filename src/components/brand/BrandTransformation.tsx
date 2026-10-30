'use client';

import React, { useState, useEffect, useRef } from 'react';
import { reduced } from './shared';

/* ─────────────────────────────────────────────────────────────────────────────
   DATA & WORKFLOW DEFINITIONS
   Matching the 5 core transformations from fragmented operations to connected commerce
───────────────────────────────────────────────────────────────────────────── */

interface WorkflowPair {
  id: string;
  category: string;
  // Left: Fragmented Old Way
  oldType: string;
  oldIcon: string;
  oldIconBg: string;
  oldTitle: string;
  oldMeta: string;
  oldDescription: string;
  // Right: Connected Gradient Way
  gradCategory: string;
  gradStatus: string;
  gradTitle: string;
  gradMeta: string;
  gradDescription: string;
  // SVG coordinates for splines
  leftStart: { x: number; y: number };
  hubIn: { x: number; y: number };
  hubOut: { x: number; y: number };
  rightEnd: { x: number; y: number };
}

const WORKFLOW_PAIRS: WorkflowPair[] = [
  {
    id: 'purchase-orders',
    category: 'Purchase Orders',
    oldType: 'WhatsApp Message',
    oldIcon: 'W',
    oldIconBg: '#15803D',
    oldTitle: '“Can you send 10 cases of oat milk tomorrow?”',
    oldMeta: '10:42 AM · Unconfirmed chat thread',
    oldDescription: 'Handling purchase requests across fragmented WhatsApp chats, phone calls, and manual notes.',
    gradCategory: 'Digital Purchase Orders',
    gradStatus: 'STANDING PO',
    gradTitle: 'Automated Reorder Pipeline',
    gradMeta: 'Net-15 Verified Digital PO · 12 cs Auto-Dispatched',
    gradDescription: 'Coordinate structured digital purchase orders and recurring café reorders on Net-15 terms.',
    leftStart: { x: 260, y: 85 },
    hubIn: { x: 532, y: 248 },
    hubOut: { x: 668, y: 248 },
    rightEnd: { x: 870, y: 75 },
  },
  {
    id: 'catalog-inventory',
    category: 'Product Catalogue',
    oldType: 'Inventory Spreadsheet',
    oldIcon: 'X',
    oldIconBg: '#047857',
    oldTitle: 'SKU: OAT-BARISTA · Stock: 4 cs · #REF!',
    oldMeta: 'Overdue formula error · Outdated numbers',
    oldDescription: 'Managing stock and catalogue pricing across disconnected desktop spreadsheets.',
    gradCategory: 'Connected Catalog',
    gradStatus: 'SYNCED LIVE',
    gradTitle: 'Live Supplier Product System',
    gradMeta: 'Single source of truth · Auto-synced wholesale inventory',
    gradDescription: 'Connect live brand catalogues with real-time wholesale pricing, availability, and MOQs.',
    leftStart: { x: 350, y: 178 },
    hubIn: { x: 532, y: 260 },
    hubOut: { x: 668, y: 260 },
    rightEnd: { x: 870, y: 170 },
  },
  {
    id: 'cafe-discovery',
    category: 'Café Discovery',
    oldType: 'Cold Calling Outreach',
    oldIcon: 'P',
    oldIconBg: '#B45309',
    oldTitle: 'Call #14 · Blue Tokai Hauz Khas',
    oldMeta: 'Voicemail · No verified procurement contact',
    oldDescription: 'Finding café contacts manually, making cold calls, and maintaining disconnected contact lists.',
    gradCategory: 'Café Discovery',
    gradStatus: 'VERIFIED DIRECT',
    gradTitle: 'Structured Roastery Network',
    gradMeta: 'Direct access to 40+ verified specialty cafés & roasteries',
    gradDescription: 'Discover and reach relevant cafés through a structured supplier and brand ecosystem.',
    leftStart: { x: 255, y: 275 },
    hubIn: { x: 532, y: 270 },
    hubOut: { x: 668, y: 270 },
    rightEnd: { x: 870, y: 265 },
  },
  {
    id: 'sampling-launches',
    category: 'Product Launches',
    oldType: 'Loose Spec PDF',
    oldIcon: 'D',
    oldIconBg: '#BE123C',
    oldTitle: 'Vanilla_Syrup_Spec_Final_v3.pdf',
    oldMeta: 'Sent via email · Outdated wholesale pricing',
    oldDescription: 'Introducing new products through expensive manual outreach and uncertain sampling.',
    gradCategory: 'Sampling Flights',
    gradStatus: 'IN BREW',
    gradTitle: 'Targeted Barista Trials',
    gradMeta: 'Cold-chain sample flights with verified ★ 4.9 cupping scores',
    gradDescription: 'Coordinate targeted product discovery, trial packs, café sampling, and verified barista feedback.',
    leftStart: { x: 350, y: 370 },
    hubIn: { x: 532, y: 280 },
    hubOut: { x: 668, y: 280 },
    rightEnd: { x: 870, y: 360 },
  },
  {
    id: 'demand-planning',
    category: 'Demand & Wastage',
    oldType: 'Assumed Batch Note',
    oldIcon: 'N',
    oldIconBg: '#475569',
    oldTitle: 'Batch 12 Roast: estimate 80kg?',
    oldMeta: 'Speculative batch schedule · High deadstock risk',
    oldDescription: 'Making production decisions based on assumptions and incomplete demand information.',
    gradCategory: 'Demand Intelligence',
    gradStatus: 'PREDICTIVE',
    gradTitle: 'Cluster Depletion Telemetry',
    gradMeta: '+34% consumption velocity across Hauz Khas cluster',
    gradDescription: 'Use live demand signals and café purchasing patterns to inform production and eliminate waste.',
    leftStart: { x: 275, y: 460 },
    hubIn: { x: 532, y: 292 },
    hubOut: { x: 668, y: 292 },
    rightEnd: { x: 870, y: 455 },
  },
];

const PHASES = [
  { id: 'fragmented', label: '01 Fragmented Operations', targetProgress: 0.0 },
  { id: 'convergence', label: '02 Convergence', targetProgress: 0.45 },
  { id: 'hub', label: '03 Gradient Hub', targetProgress: 0.72 },
  { id: 'connected', label: '04 Connected Commerce', targetProgress: 1.0 },
];

export function BrandTransformation() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [activePhaseIdx, setActivePhaseIdx] = useState<number>(3); // Default to Connected Commerce
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(1.0);

  // Scroll listener to update progress when in viewport
  useEffect(() => {
    if (reduced()) return;

    let rafId = 0;
    const handleScroll = () => {
      if (isManualOverride) return;
      const el = stageRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      const startY = windowH * 0.85;
      const endY = windowH * 0.25;

      const progress = Math.max(0, Math.min(1, (startY - rect.top) / (startY - endY)));
      setScrollProgress(progress);

      if (progress < 0.25) setActivePhaseIdx(0);
      else if (progress < 0.58) setActivePhaseIdx(1);
      else if (progress < 0.85) setActivePhaseIdx(2);
      else setActivePhaseIdx(3);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [isManualOverride]);

  const selectPhase = (idx: number) => {
    setIsManualOverride(true);
    setActivePhaseIdx(idx);
    setScrollProgress(PHASES[idx].targetProgress);
    setTimeout(() => setIsManualOverride(false), 7000);
  };

  const p = scrollProgress; // 0.0 to 1.0

  return (
    <section
      className="btrans-section"
      id="transformation"
      ref={sectionRef}
      aria-labelledby="btrans-heading"
    >
      <div className="btrans-bg-glow" aria-hidden="true" />

      <div className="btrans-container">
        {/* ─── 1. Editorial Introduction ─── */}
        <div className="btrans-header">
          <div className="btrans-eyebrow">
            <span className="btrans-eyebrow-line" aria-hidden="true" />
            <span>THE GRADIENT DIFFERENCE</span>
          </div>
          <h2 id="btrans-heading" className="btrans-title">
            The old way was fragmented.<br />
            The new way is connected.
          </h2>
          <p className="btrans-sub">
            From scattered conversations and manual procurement to a connected ecosystem for brands, suppliers and cafés.
          </p>
        </div>

        {/* ─── Interactive Phase Navigation Controller ─── */}
        <div className="btrans-controls" role="tablist" aria-label="Transformation Stages">
          {PHASES.map((phase, idx) => (
            <button
              key={phase.id}
              type="button"
              role="tab"
              aria-selected={activePhaseIdx === idx}
              className={`btrans-ctrl-btn ${activePhaseIdx === idx ? 'active' : ''}`}
              onClick={() => selectPhase(idx)}
            >
              <span>{phase.label.slice(0, 2)}</span>
              {phase.label.slice(3)}
            </button>
          ))}
        </div>

        {/* ─── 2. Main 3-Zone Visual Stage ─── */}
        <div className="btrans-stage" ref={stageRef}>
          {/* Zone Labels (Desktop) */}
          <div className="btrans-zone-label btrans-label-left">
            <span>WITHOUT GRADIENT</span>
          </div>
          <div className="btrans-zone-label btrans-label-right">
            <span className="btrans-live-dot" />
            <span>WITH GRADIENT</span>
          </div>

          {/* SVG Bézier Spline Network & Continuous Photon Streams */}
          <svg className="btrans-svg-canvas" viewBox="0 0 1200 540" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="splineLeftGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#64748B" stopOpacity={0.12 + p * 0.3} />
                <stop offset="70%" stopColor="#A855F7" stopOpacity={0.3 + p * 0.5} />
                <stop offset="100%" stopColor="#C084FC" stopOpacity={0.5 + p * 0.5} />
              </linearGradient>
              <linearGradient id="splineRightGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#C084FC" stopOpacity={0.3 + p * 0.7} />
                <stop offset="60%" stopColor="#A855F7" stopOpacity={0.2 + p * 0.6} />
                <stop offset="100%" stopColor="#6D28D9" stopOpacity={0.1 + p * 0.4} />
              </linearGradient>
            </defs>

            {/* 5 Left Convergence Splines */}
            {WORKFLOW_PAIRS.map((pair, idx) => {
              const isSpotlit = hoveredRow === idx;
              const pathD = `M ${pair.leftStart.x} ${pair.leftStart.y} C ${(pair.leftStart.x + pair.hubIn.x) / 2} ${pair.leftStart.y}, ${pair.hubIn.x - 40} ${pair.hubIn.y}, ${pair.hubIn.x} ${pair.hubIn.y}`;
              return (
                <path
                  key={`left-${pair.id}`}
                  d={pathD}
                  stroke={isSpotlit ? '#E9D5FF' : 'url(#splineLeftGrad)'}
                  strokeWidth={isSpotlit ? 2.2 : 1.2}
                  strokeDasharray={p < 0.35 ? '3 3' : 'none'}
                  strokeOpacity={isSpotlit ? 1 : Math.max(0.2, p * 0.85)}
                  style={{ transition: 'stroke 240ms ease, stroke-width 240ms ease' }}
                />
              );
            })}

            {/* 5 Right Divergence Splines */}
            {WORKFLOW_PAIRS.map((pair, idx) => {
              const isSpotlit = hoveredRow === idx;
              const pathD = `M ${pair.hubOut.x} ${pair.hubOut.y} C ${pair.hubOut.x + 40} ${pair.hubOut.y}, ${(pair.hubOut.x + pair.rightEnd.x) / 2} ${pair.rightEnd.y}, ${pair.rightEnd.x} ${pair.rightEnd.y}`;
              return (
                <g key={`right-${pair.id}`}>
                  <path
                    d={pathD}
                    stroke={isSpotlit ? '#E9D5FF' : 'url(#splineRightGrad)'}
                    strokeWidth={isSpotlit ? 2.4 : 1.4}
                    strokeOpacity={isSpotlit ? 1 : Math.max(0.15, p * 0.95)}
                    style={{ transition: 'stroke 240ms ease, stroke-width 240ms ease' }}
                  />
                  {/* Flowing Photon Packets along active paths */}
                  <circle r={isSpotlit ? 3.5 : 2.6} fill="#FFFFFF" filter="drop-shadow(0 0 5px #C084FC)">
                    <animateMotion
                      dur={`${2.6 + idx * 0.3}s`}
                      repeatCount="indefinite"
                      path={pathD}
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* ─── Zone A: Left Disconnected Fragments ─── */}
          <div className="btrans-zone-fragments">
            {WORKFLOW_PAIRS.map((pair, idx) => {
              const isSpotlit = hoveredRow === idx;

              // Motion rules:
              // Phase 1 (p < 0.25): resting at original coordinates, opacity: 1
              // Phase 2 (0.25 <= p < 0.7): glides inward toward hub
              // Phase 3 & 4 (p >= 0.7): sits back at resting coordinates at calm subdued opacity: 0.35
              let translateX = 0;
              let translateY = 0;
              let scale = 1;
              let opacity = 1;

              if (p >= 0.25 && p < 0.72) {
                const factor = (p - 0.25) / 0.47; // 0 to 1
                translateX = factor * 210;
                translateY = factor * (270 - pair.leftStart.y) * 0.45;
                scale = 1 - factor * 0.18;
                opacity = 1 - factor * 0.55;
              } else if (p >= 0.72) {
                translateX = 0;
                translateY = 0;
                scale = 1;
                opacity = isSpotlit ? 0.95 : 0.35;
              } else {
                opacity = isSpotlit ? 1 : 0.95;
              }

              const rotateDeg = p >= 0.25 && p < 0.72 ? 0 : idx % 2 === 0 ? -2.2 : 1.8;

              return (
                <div
                  key={`frag-${pair.id}`}
                  id={`frag-${idx + 1}`}
                  className={`btrans-fragment ${isSpotlit ? 'is-spotlit' : ''}`}
                  style={{
                    transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotateDeg}deg)`,
                    opacity,
                    borderColor: isSpotlit ? 'rgba(168, 85, 247, 0.45)' : undefined,
                  }}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div className="btrans-frag-head">
                    <span className="btrans-frag-icon" style={{ background: pair.oldIconBg, color: '#FFF' }}>
                      {pair.oldIcon}
                    </span>
                    <span>{pair.oldType}</span>
                  </div>
                  <div className="btrans-frag-title">{pair.oldTitle}</div>
                  <div className="btrans-frag-meta">{pair.oldMeta}</div>
                </div>
              );
            })}
          </div>

          {/* ─── Zone B: Center Gradient Hub (Elevated 2.5D Platform) ─── */}
          <div className="btrans-hub-wrap">
            <div
              className={`btrans-hub-platform ${p >= 0.4 ? 'is-active' : ''}`}
              style={{
                boxShadow:
                  p >= 0.4
                    ? `0 16px 44px rgba(0, 0, 0, 0.9), 0 0 ${30 + p * 35}px rgba(168, 85, 247, ${0.35 + p * 0.4})`
                    : '0 12px 32px rgba(0, 0, 0, 0.8), 0 0 24px -4px rgba(147, 51, 234, 0.25)',
              }}
            >
              <div className="btrans-hub-ring-outer" />
              <div
                className="btrans-hub-ring-pulse"
                style={{
                  borderColor: p >= 0.4 ? 'rgba(216, 180, 254, 0.6)' : 'rgba(192, 132, 252, 0.25)',
                }}
              />
              <div className="btrans-hub-core">
                <span className="btrans-hub-logo">G</span>
              </div>
            </div>
            <div className="btrans-hub-badge">
              Gradient Coordination Engine
            </div>
          </div>

          {/* ─── Zone C: Right Organized Workflows ─── */}
          <div className="btrans-zone-workflows">
            {WORKFLOW_PAIRS.map((pair, idx) => {
              const isSpotlit = hoveredRow === idx;
              // Emerge smoothly as p increases
              const emergeProgress = Math.max(0, Math.min(1, (p - 0.25) / 0.75));
              const opacity = isSpotlit ? 1 : Math.max(0.32, emergeProgress);
              const translateX = (1 - emergeProgress) * 18;

              return (
                <div
                  key={`wf-${pair.id}`}
                  id={`wf-${idx + 1}`}
                  className={`btrans-workflow ${isSpotlit ? 'is-spotlit' : ''}`}
                  style={{
                    transform: `translateX(${translateX}px)`,
                    opacity,
                    borderColor: isSpotlit
                      ? 'rgba(192, 132, 252, 0.7)'
                      : p >= 0.6
                      ? 'rgba(168, 85, 247, 0.32)'
                      : 'rgba(168, 85, 247, 0.14)',
                    boxShadow: isSpotlit
                      ? '0 12px 32px rgba(0, 0, 0, 0.75), 0 0 20px rgba(168, 85, 247, 0.35)'
                      : undefined,
                  }}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div className="btrans-wf-head">
                    <div className="btrans-wf-badge">
                      <span className="btrans-wf-dot" />
                      <span>{pair.gradCategory}</span>
                    </div>
                    <div className="btrans-wf-status">{pair.gradStatus}</div>
                  </div>
                  <div className="btrans-wf-title">{pair.gradTitle}</div>
                  <div className="btrans-wf-desc">{pair.gradMeta}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 3. Comparison Details Rows (5 Editorial Rows) ─── */}
        <div className="btrans-comparison-section">
          <div className="btrans-comp-head-row">
            <div className="btrans-comp-head-before">THE OLD WAY · FRAGMENTED</div>
            <div className="btrans-comp-head-center" />
            <div className="btrans-comp-head-after">THE GRADIENT WAY · CONNECTED</div>
          </div>

          <div className="btrans-comp-list" role="list">
            {WORKFLOW_PAIRS.map((pair, idx) => {
              const isHovered = hoveredRow === idx;

              return (
                <div
                  key={`comp-${pair.id}`}
                  className={`btrans-comp-row ${isHovered ? 'is-hovered' : ''}`}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                  role="listitem"
                >
                  {/* Left Column: The Old Way */}
                  <div className="btrans-comp-col-before">
                    <span className="btrans-comp-label btrans-label-muted">
                      {pair.category}
                    </span>
                    <p className="btrans-comp-text btrans-text-before">
                      {pair.oldDescription}
                    </p>
                  </div>

                  {/* Center Column: Directional Arrow Node */}
                  <div className="btrans-comp-arrow-wrap" aria-hidden="true">
                    <div className="btrans-comp-arrow">→</div>
                  </div>

                  {/* Right Column: The Gradient Way */}
                  <div className="btrans-comp-col-after">
                    <span className="btrans-comp-label btrans-label-accent">
                      {pair.gradTitle}
                    </span>
                    <p className="btrans-comp-text btrans-text-after">
                      {pair.gradDescription}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
