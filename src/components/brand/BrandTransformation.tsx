'use client';

import React, { useState } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   EDITORIAL COMPARISON ROWS DATA
   Comparing fragmented supplier operations to connected commerce with Gradient
───────────────────────────────────────────────────────────────────────────── */

interface TransformationRow {
  id: string;
  category: string;
  oldLabel: string;
  oldText: string;
  newLabel: string;
  newText: string;
}

const COMPARISON_ROWS: TransformationRow[] = [
  {
    id: 'cafe-discovery',
    category: 'Café Discovery',
    oldLabel: 'Manual Outreach',
    oldText: 'Finding café contacts manually, making cold calls, and maintaining disconnected contact lists.',
    newLabel: 'Verified Network',
    newText: 'Discover and reach relevant cafés through a structured supplier and brand ecosystem.',
  },
  {
    id: 'product-launches',
    category: 'Product Launches',
    oldLabel: 'Uncertain Sampling',
    oldText: 'Introducing new products through expensive manual outreach and uncertain sampling.',
    newLabel: 'Structured Sampling',
    newText: 'Coordinate targeted product discovery, trial packs, café sampling, and verified barista feedback.',
  },
  {
    id: 'demand-planning',
    category: 'Demand Planning',
    oldLabel: 'Assumed Batches',
    oldText: 'Making production decisions based on assumptions and incomplete demand information.',
    newLabel: 'Telemetry Insights',
    newText: 'Use demand signals and café purchasing patterns to inform production and batch planning.',
  },
  {
    id: 'purchase-orders',
    category: 'Purchase Orders',
    oldLabel: 'Fragmented Chats',
    oldText: 'Handling purchase requests across WhatsApp conversations, calls, and scattered spreadsheets.',
    newLabel: 'Automated Workflows',
    newText: 'Coordinate structured digital purchase orders and recurring café reorders on Net-15 terms.',
  },
  {
    id: 'inventory-wastage',
    category: 'Inventory & Wastage',
    oldLabel: 'Deadstock Risk',
    oldText: 'Managing stock with fragmented information, increasing the risk of overproduction and deadstock.',
    newLabel: 'Coordinated Supply',
    newText: 'Improve demand-supply coordination and eliminate speculative overproduction waste.',
  },
];

export function BrandTransformation() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

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

        {/* ─── 2. Main Minimal Comparison Canvas (Light Mode / White Background) ─── */}
        <div className="btrans-minimal-card">
          {/* Left Side: Without Gradient */}
          <div className="btrans-side-left">
            <h3 className="btrans-side-title">Without Gradient</h3>
            <ul className="btrans-points-list">
              <li className="btrans-point-item">
                <div className="btrans-icon-box btrans-icon-muted" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </div>
                <div className="btrans-point-text btrans-text-muted">
                  Scattered WhatsApp chats, manual calls &amp; unconfirmed notes
                </div>
              </li>
              <li className="btrans-point-item">
                <div className="btrans-icon-box btrans-icon-muted" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </div>
                <div className="btrans-point-text btrans-text-muted">
                  Speculative batch roasting based on guesswork &amp; deadstock waste
                </div>
              </li>
              <li className="btrans-point-item">
                <div className="btrans-icon-box btrans-icon-muted" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </div>
                <div className="btrans-point-text btrans-text-muted">
                  Manual cold outreach to unverified café leads &amp; disconnected contacts
                </div>
              </li>
            </ul>
          </div>

          {/* Right Side: With Gradient inside Luminous Aperture */}
          <div className="btrans-side-right">
            {/* Luminous Organic Concentric Aperture Rings */}
            <div className="btrans-aperture-bg" aria-hidden="true">
              <div className="btrans-ring-glow" />
              <div className="btrans-ring-layer-1" />
              <div className="btrans-ring-layer-2" />
              <div className="btrans-ring-layer-3" />
              <div className="btrans-ring-void" />
            </div>

            {/* Centered Content */}
            <div className="btrans-right-content">
              <h3 className="btrans-side-title">With Gradient</h3>
              <ul className="btrans-points-list">
                <li className="btrans-point-item">
                  <div className="btrans-icon-box btrans-icon-accent" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="btrans-point-text btrans-text-bright">
                    Automated digital purchase orders &amp; recurring Net-15 reorders
                  </div>
                </li>
                <li className="btrans-point-item">
                  <div className="btrans-icon-box btrans-icon-accent" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="btrans-point-text btrans-text-bright">
                    Live demand telemetry scheduling batches against real order intent
                  </div>
                </li>
                <li className="btrans-point-item">
                  <div className="btrans-icon-box btrans-icon-accent" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="btrans-point-text btrans-text-bright">
                    Direct access to 40+ verified specialty roasteries &amp; café buyers
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── 3. Detailed Editorial Comparison Rows (Light Mode) ─── */}
        <div className="btrans-comparison-section">
          <div className="btrans-comp-head-row" aria-hidden="true">
            <div className="btrans-comp-head-before">The Old Way · Fragmented</div>
            <div />
            <div className="btrans-comp-head-after">The Gradient Way · Connected</div>
          </div>

          <div className="btrans-comp-list" role="list">
            {COMPARISON_ROWS.map((row) => (
              <div
                key={row.id}
                role="listitem"
                className={`btrans-comp-row ${hoveredRow === row.id ? 'is-hovered' : ''}`}
                onMouseEnter={() => setHoveredRow(row.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <div className="btrans-comp-col-before">
                  <span className="btrans-comp-label btrans-label-muted">{row.category} · {row.oldLabel}</span>
                  <p className="btrans-comp-text btrans-text-before">{row.oldText}</p>
                </div>

                <div className="btrans-comp-arrow-wrap" aria-hidden="true">
                  <div className="btrans-comp-arrow">→</div>
                </div>

                <div className="btrans-comp-col-after">
                  <span className="btrans-comp-label btrans-label-accent">{row.newLabel}</span>
                  <p className="btrans-comp-text btrans-text-after">{row.newText}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
