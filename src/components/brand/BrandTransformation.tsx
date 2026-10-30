'use client';

import React, { useRef, useState } from 'react';
import { AnimatedBeam } from '@/components/ui/animated-beam';

/* ─────────────────────────────────────────────────────────────────────────────
   5 WORKFLOW TRANSFORMATIONS
   Fragmented Supplier Operations → Gradient Hub → Connected Commerce
───────────────────────────────────────────────────────────────────────────── */

interface WorkflowItem {
  id: string;
  topic: string;
  // Left: Fragmented Old Way
  leftLabel: string;
  leftDesc: string;
  leftIcon: React.ReactNode;
  // Right: Connected Gradient Way
  rightLabel: string;
  rightDesc: string;
  rightIcon: React.ReactNode;
  // Summary for bottom card
  fromSummary: string;
  toSummary: string;
  curvature: number;
}

const WORKFLOWS: WorkflowItem[] = [
  {
    id: 'purchase-orders',
    topic: '01 · Purchase Orders',
    leftLabel: 'WhatsApp Chats',
    leftDesc: 'Unconfirmed orders & lost notes',
    leftIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    rightLabel: 'Digital Net-15 POs',
    rightDesc: 'Automated recurring reorders',
    rightIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    fromSummary: 'WhatsApp chat threads →',
    toSummary: 'Digital Net-15 standing POs & automated reorders',
    curvature: -32,
  },
  {
    id: 'cafe-discovery',
    topic: '02 · Café Discovery',
    leftLabel: 'Cold Calling',
    leftDesc: 'Unverified café leads & outreach',
    leftIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    rightLabel: '40+ Verified Cafés',
    rightDesc: 'Direct structured roastery network',
    rightIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    fromSummary: 'Manual cold calling →',
    toSummary: 'Direct access to 40+ verified specialty roasteries',
    curvature: -16,
  },
  {
    id: 'demand-planning',
    topic: '03 · Demand Planning',
    leftLabel: 'Spreadsheets',
    leftDesc: 'Formula errors & stock drift',
    leftIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
    rightLabel: 'Live Telemetry',
    rightDesc: 'Real-time demand signals & velocity',
    rightIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    fromSummary: 'Speculative guesswork →',
    toSummary: 'Real-time demand telemetry informing production',
    curvature: 0,
  },
  {
    id: 'product-launches',
    topic: '04 · Product Launches',
    leftLabel: 'Manual Sampling',
    leftDesc: 'Loose PDFs & uncertain trials',
    leftIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    rightLabel: 'Sampling Flights',
    rightDesc: 'Verified ★ 4.9 cupping feedback',
    rightIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    fromSummary: 'Loose PDF spec sheets →',
    toSummary: 'Targeted barista sampling flights with ★ 4.9 feedback',
    curvature: 16,
  },
  {
    id: 'inventory-wastage',
    topic: '05 · Inventory & Wastage',
    leftLabel: 'Assumed Batches',
    leftDesc: 'Speculative roast deadstock',
    leftIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    rightLabel: 'Connected Catalogue',
    rightDesc: 'Live synced wholesale inventory',
    rightIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    fromSummary: 'Overproduction risk →',
    toSummary: 'Coordinated wholesale stock with zero deadstock waste',
    curvature: 32,
  },
];

export function BrandTransformation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  // 5 left node refs
  const leftRef0 = useRef<HTMLDivElement>(null);
  const leftRef1 = useRef<HTMLDivElement>(null);
  const leftRef2 = useRef<HTMLDivElement>(null);
  const leftRef3 = useRef<HTMLDivElement>(null);
  const leftRef4 = useRef<HTMLDivElement>(null);
  const leftRefs = [leftRef0, leftRef1, leftRef2, leftRef3, leftRef4];

  // 5 right node refs
  const rightRef0 = useRef<HTMLDivElement>(null);
  const rightRef1 = useRef<HTMLDivElement>(null);
  const rightRef2 = useRef<HTMLDivElement>(null);
  const rightRef3 = useRef<HTMLDivElement>(null);
  const rightRef4 = useRef<HTMLDivElement>(null);
  const rightRefs = [rightRef0, rightRef1, rightRef2, rightRef3, rightRef4];

  const [activeWorkflow, setActiveWorkflow] = useState<number | null>(null);

  return (
    <section
      className="btrans-section"
      id="transformation"
      aria-labelledby="btrans-heading"
    >
      <div className="btrans-bg-glow" aria-hidden="true" />

      <div className="btrans-container">
        {/* ─── 1. Editorial Header ─── */}
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

        {/* ─── 2. Animated Beam Integration Canvas (White Background) ─── */}
        <div className="btrans-beam-stage" ref={containerRef}>
          {/* Left Column: Fragmented Operations */}
          <div className="btrans-beam-col btrans-col-left">
            <div className="btrans-beam-col-label left">
              The Old Way · Fragmented
            </div>

            <div className="btrans-node-list">
              {WORKFLOWS.map((wf, idx) => (
                <div
                  key={`left-${wf.id}`}
                  className={`btrans-node-row-left ${activeWorkflow === idx ? 'is-active' : ''}`}
                  onMouseEnter={() => setActiveWorkflow(idx)}
                  onMouseLeave={() => setActiveWorkflow(null)}
                >
                  <div className="btrans-node-info">
                    <span className="btrans-node-label">{wf.leftLabel}</span>
                    <span className="btrans-node-desc">{wf.leftDesc}</span>
                  </div>

                  <div
                    ref={leftRefs[idx]}
                    className="btrans-node-circle btrans-circle-muted"
                    aria-label={wf.leftLabel}
                  >
                    {wf.leftIcon}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Column: The Gradient Platform Hub */}
          <div className="btrans-beam-center" ref={centerRef}>
            <div className="btrans-hub-halo" aria-hidden="true" />
            <div className="btrans-hub-circle">
              <div className="btrans-hub-logo">G</div>
            </div>
            <div className="btrans-hub-label-wrap">
              <span className="btrans-hub-title">Gradient Hub</span>
              <span className="btrans-hub-badge">Connected Core</span>
            </div>
          </div>

          {/* Right Column: Connected Commerce */}
          <div className="btrans-beam-col btrans-col-right">
            <div className="btrans-beam-col-label right">
              The Gradient Way · Connected
            </div>

            <div className="btrans-node-list">
              {WORKFLOWS.map((wf, idx) => (
                <div
                  key={`right-${wf.id}`}
                  className={`btrans-node-row-right ${activeWorkflow === idx ? 'is-active' : ''}`}
                  onMouseEnter={() => setActiveWorkflow(idx)}
                  onMouseLeave={() => setActiveWorkflow(null)}
                >
                  <div
                    ref={rightRefs[idx]}
                    className="btrans-node-circle btrans-circle-accent"
                    aria-label={wf.rightLabel}
                  >
                    {wf.rightIcon}
                  </div>

                  <div className="btrans-node-info">
                    <span className="btrans-node-label">{wf.rightLabel}</span>
                    <span className="btrans-node-desc">{wf.rightDesc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Animated Beams: Left Nodes → Center Hub */}
          {WORKFLOWS.map((wf, idx) => (
            <AnimatedBeam
              key={`beam-in-${wf.id}`}
              containerRef={containerRef}
              fromRef={leftRefs[idx]}
              toRef={centerRef}
              curvature={wf.curvature}
              duration={4}
              delay={idx * 0.45}
              pathColor="#E2E8F0"
              pathWidth={activeWorkflow === idx ? 2.8 : 2}
              pathOpacity={activeWorkflow !== null && activeWorkflow !== idx ? 0.25 : 0.65}
              gradientStartColor="#94A3B8"
              gradientStopColor="#7C3AED"
            />
          ))}

          {/* Animated Beams: Center Hub → Right Nodes */}
          {WORKFLOWS.map((wf, idx) => (
            <AnimatedBeam
              key={`beam-out-${wf.id}`}
              containerRef={containerRef}
              fromRef={centerRef}
              toRef={rightRefs[idx]}
              curvature={wf.curvature}
              duration={4}
              delay={idx * 0.45 + 0.25}
              pathColor="#E2E8F0"
              pathWidth={activeWorkflow === idx ? 2.8 : 2}
              pathOpacity={activeWorkflow !== null && activeWorkflow !== idx ? 0.25 : 0.65}
              gradientStartColor="#7C3AED"
              gradientStopColor="#C084FC"
            />
          ))}
        </div>

        {/* ─── 3. Five Transformation Topic Cards Below ─── */}
        <div className="btrans-workflow-strip" role="list">
          {WORKFLOWS.map((wf, idx) => (
            <div
              key={`card-${wf.id}`}
              role="listitem"
              className={`btrans-workflow-card ${activeWorkflow === idx ? 'is-active' : ''}`}
              onMouseEnter={() => setActiveWorkflow(idx)}
              onMouseLeave={() => setActiveWorkflow(null)}
            >
              <div className="btrans-wf-topic">{wf.topic}</div>
              <div className="btrans-wf-from">{wf.fromSummary}</div>
              <div className="btrans-wf-to">{wf.toSummary}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
