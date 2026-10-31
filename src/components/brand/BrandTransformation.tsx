'use client';

import React, { useState } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   ORCHID-INSPIRED WHOLESALE ARCHITECTURE FOR GRADIENT
   White background · Minimal & Creative Workflow
   Interactive Mode Switcher: "Before Gradient" vs "With Gradient"
   ───────────────────────────────────────────────────────────────────────────── */

type Mode = 'with' | 'without';

interface SupplierCategory {
  id: string;
  category: string;
  icon: React.ReactNode;
  brands: { name: string; tag: string }[];
  withStatus: string;
  withoutStatus: string;
}

interface ProtocolNode {
  id: string;
  shortLabel: string;
  withLabel: string;
  withDesc: string;
  withIcon: React.ReactNode;
  withoutShortLabel: string;
  withoutLabel: string;
  withoutDesc: string;
  withoutIcon: React.ReactNode;
  metric: string;
}

interface CafeNode {
  id: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  withBadge: string;
  withPo: string;
  withInventory: string;
  withoutBadge: string;
  withoutPo: string;
  withoutInventory: string;
}

/* ─── 1. TOP TIER: 4 SUPPLIER CATEGORIES ─────────────────────────────────── */
const SUPPLIERS: SupplierCategory[] = [
  {
    id: 'roasters',
    category: 'SPECIALTY ROASTERS',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    brands: [
      { name: 'Blue Tokai', tag: 'Estate Arabica' },
      { name: 'Araku Coffee', tag: 'Biodynamic' },
      { name: 'Subko Specialty', tag: 'Micro-lots' },
      { name: 'Kapi Kottai', tag: 'Single Origin' },
    ],
    withStatus: '48-Hr Batch Roast Sync',
    withoutStatus: 'Speculative Roast Guesswork',
  },
  {
    id: 'milks',
    category: 'BARISTA MILKS',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2h8v3H8z" />
        <path d="M7 5h10l2 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9l2-4z" />
        <path d="M10 12h4" />
        <path d="M12 10v4" />
      </svg>
    ),
    brands: [
      { name: 'Oat Barista Pro', tag: 'Microfoam Std' },
      { name: 'Amul Barista', tag: 'Fresh Dairy' },
      { name: 'Epigamia Almond', tag: 'Plant Base' },
      { name: 'Raw Pressery', tag: 'Cold-Pressed' },
    ],
    withStatus: 'Cold-Chain Par Replenished',
    withoutStatus: 'Frequent Spoilage & Stockouts',
  },
  {
    id: 'syrups',
    category: 'BEVERAGE BASES',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
    brands: [
      { name: 'Monin Gourmet', tag: 'Puree & Sauce' },
      { name: '1883 Maison', tag: 'Craft Syrups' },
      { name: 'Torani Artisan', tag: 'Botanicals' },
      { name: 'Uji Matcha', tag: 'Ceremonial' },
    ],
    withStatus: 'Wholesale Tier Volume Rates',
    withoutStatus: 'Inconsistent Ad-hoc Pricing',
  },
  {
    id: 'packaging',
    category: 'BAR PACK & GEAR',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    brands: [
      { name: 'Bio-Cup Compostable', tag: 'Eco Cups' },
      { name: 'Kraft Sleeves', tag: 'Heat Ribbed' },
      { name: 'La Marzocco Spares', tag: 'Portafilters' },
      { name: 'Mahlkönig Burrs', tag: 'Precision' },
    ],
    withStatus: 'Consolidated Route Dispatch',
    withoutStatus: 'Separate High-Cost Shipping',
  },
];

/* ─── 2. MIDDLE TIER: 6 PROTOCOL NODES ────────────────────────────────────── */
const PROTOCOLS: ProtocolNode[] = [
  {
    id: 'net15',
    shortLabel: 'Net-15',
    withLabel: 'Net-15 PO',
    withDesc: 'Automated Standing Purchase Orders',
    withIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <polyline points="9 15 11 17 15 13" />
      </svg>
    ),
    withoutShortLabel: 'WhatsApp',
    withoutLabel: 'WhatsApp Chats',
    withoutDesc: 'Unconfirmed Audio Notes & Text Threads',
    withoutIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    metric: '< 90s PO Approval',
  },
  {
    id: 'api',
    shortLabel: 'EDI / API',
    withLabel: 'EDI / API',
    withDesc: 'Live Wholesale Catalog & Price Sync',
    withIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    withoutShortLabel: 'Calling',
    withoutLabel: 'Phone Calls',
    withoutDesc: 'Endless Roaster Lead Chasing',
    withoutIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    metric: 'Real-Time Sync',
  },
  {
    id: 'telemetry',
    shortLabel: 'Telemetry',
    withLabel: 'Telemetry',
    withDesc: 'Real-Time Bean Velocity & Consumption',
    withIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    withoutShortLabel: 'Spreadsheet',
    withoutLabel: 'Excel Drift',
    withoutDesc: 'Broken Formulas & Stock Discrepancies',
    withoutIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
    metric: 'Live Velocity Tracking',
  },
  {
    id: 'coldchain',
    shortLabel: 'Cold Chain',
    withLabel: 'Cold-Chain',
    withDesc: 'GPS Route-Dispatched Consolidated Logistics',
    withIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    withoutShortLabel: 'Receipts',
    withoutLabel: 'Paper Chits',
    withoutDesc: 'Lost Delivery Receipts & Tax Mismatch',
    withoutIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V8z" />
      </svg>
    ),
    metric: '99.4% On-Time Delivery',
  },
  {
    id: 'restock',
    shortLabel: 'Restock',
    withLabel: 'Auto Restock',
    withDesc: 'Algorithmic Safety Par Buffering',
    withIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
      </svg>
    ),
    withoutShortLabel: 'Deadstock',
    withoutLabel: 'Deadstock Batches',
    withoutDesc: 'Overproduced Roast Stock & Staleness',
    withoutIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    metric: 'Zero Deadstock Waste',
  },
  {
    id: 'erp',
    shortLabel: 'ERP Sync',
    withLabel: 'ERP Sync',
    withDesc: 'Instant Tally, Zoho & SAP Reconciliation',
    withIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    withoutShortLabel: 'Panic Run',
    withoutLabel: 'Retail Panic',
    withoutDesc: 'Emergency Supermarket Runs at Full Retail',
    withoutIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    metric: '100% Tax Compliant',
  },
];

/* ─── 3. BOTTOM TIER: 5 CAFÉ OUTLETS ──────────────────────────────────────── */
const CAFES: CafeNode[] = [
  {
    id: 'cafe-1',
    name: 'Roastery Lab',
    type: 'Specialty Espresso Bar',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      </svg>
    ),
    withBadge: 'Standing PO Verified',
    withPo: 'Net-15 Standing PO',
    withInventory: '0% Stockout Drift',
    withoutBadge: 'WhatsApp Order Lost',
    withoutPo: 'Loose Audio Note',
    withoutInventory: '18% Bean Deadstock',
  },
  {
    id: 'cafe-2',
    name: 'Regional Chain',
    type: '14 Outlets Sync HQ',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    withBadge: '14 Outlets Synced',
    withPo: 'Central EDI Dispatch',
    withInventory: '99.8% On-Time Par',
    withoutBadge: '4-Day Reconcile Lag',
    withoutPo: 'Phone Call Matrix',
    withoutInventory: 'Excel Formula Drift',
  },
  {
    id: 'cafe-3',
    name: 'Artisan Espresso',
    type: 'Single-Origin Focus',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    withBadge: 'Fresh Roast Match',
    withPo: 'Consumption Trigger',
    withInventory: 'Zero Deadstock Waste',
    withoutBadge: 'Stale Beans (Roast Gap)',
    withoutPo: 'Ad-hoc Urgent Order',
    withoutInventory: 'Oat Milk Shortage',
  },
  {
    id: 'cafe-4',
    name: 'Hotel Lounge F&B',
    type: 'High-Volume Hospitality',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15" />
      </svg>
    ),
    withBadge: 'Enterprise Synced',
    withPo: 'Direct SAP/Tally PO',
    withInventory: 'Buffer Par Locked',
    withoutBadge: 'Invoice Tax Mismatch',
    withoutPo: 'Paper Delivery Chits',
    withoutInventory: 'Weekend Par Shortage',
  },
  {
    id: 'cafe-5',
    name: 'Airport Express',
    type: 'Zero-Downtime Station',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    withBadge: 'Zero Downtime',
    withPo: 'Daily Route Van Run',
    withInventory: 'Rush Par Protected',
    withoutBadge: 'Morning Rush Outage',
    withoutPo: 'Panic WhatsApp Ping',
    withoutInventory: 'Peak Revenue Loss',
  },
];

/* ─── 4. SUMMARY IMPACT PILLARS ───────────────────────────────────────────── */
const SUMMARY_WITH = [
  {
    metric: '< 90s / Week',
    title: 'Automated Standing POs',
    desc: 'Replaces 6+ hours of fragmented WhatsApp messaging with automated weekly standing PO approvals on Net-15 terms.',
  },
  {
    metric: '99.4% On-Time',
    title: 'Cold-Chain Consolidated Van Dispatch',
    desc: 'Roastery beans, fresh barista oat, and consumables arrive bundled in a single scheduled delivery route.',
  },
  {
    metric: 'Zero Deadstock',
    title: 'Telemetry-Matched Batches',
    desc: 'Roasters roast exactly what verified cafés consume, eliminating overproduction waste and stale bags.',
  },
];

const SUMMARY_WITHOUT = [
  {
    metric: '6–8 Hours / Wk',
    title: 'Lost in Manual Coordination',
    desc: 'Hours wasted every week texting roasters, sending audio reminders, and cross-checking handwritten delivery chits.',
  },
  {
    metric: '18–24% Wastage',
    title: 'Deadstock & Supermarket Panics',
    desc: 'Speculative roasting creates stale beans, while unexpected spikes force baristas to buy emergency retail milk.',
  },
  {
    metric: '7+ Broken Tools',
    title: 'Siloed Friction Channels',
    desc: 'Procurement scattered across personal WhatsApp, phone calls, spreadsheets, sticky notes, and paper receipts.',
  },
];

export function BrandTransformation() {
  const [mode, setMode] = useState<Mode>('with');
  const [hoveredProtocol, setHoveredProtocol] = useState<number | null>(null);

  const isWith = mode === 'with';

  return (
    <section
      className="btrans-section"
      id="transformation"
      aria-labelledby="btrans-heading"
    >
      {/* Background ambient lighting */}
      <div className="btrans-bg-glow" aria-hidden="true" />

      <div className="btrans-container">
        {/* ─── 1. Editorial Header & Toggle Switcher ─── */}
        <div className="btrans-header-wrap">
          <div className="btrans-eyebrow">
            <span className="btrans-eyebrow-line" aria-hidden="true" />
            <span>WHOLESALE ARCHITECTURE · BEFORE VS WITH GRADIENT</span>
          </div>

          <div className="btrans-header-content">
            <h2 id="btrans-heading" className="btrans-title">
              {isWith ? (
                <>
                  Simple, Fast,{' '}
                  <span className="btrans-title-highlight">Automated.</span>
                </>
              ) : (
                <>
                  Fragmented, Manual,{' '}
                  <span className="btrans-title-warning">Slow.</span>
                </>
              )}
            </h2>

            <p className="btrans-sub">
              {isWith
                ? 'Replacing the need for brittle WhatsApp ordering, loose audio notes, and speculative roast batches with an automated, synchronized wholesale network.'
                : 'Scattered conversations, lost paper receipts, formula errors, and emergency supermarket runs leave roasters and café operators stranded in manual chaos.'}
            </p>
          </div>

          {/* Interactive Orchid-Style Toggle Switch */}
          <div className="btrans-toggle-container" role="tablist" aria-label="Transformation View Mode">
            <button
              type="button"
              role="tab"
              aria-selected={!isWith}
              className={`btrans-toggle-pill ${!isWith ? 'is-active is-without' : ''}`}
              onClick={() => setMode('without')}
            >
              <span className="btrans-toggle-dot without" aria-hidden="true" />
              <span>Before Gradient</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={isWith}
              className={`btrans-toggle-pill ${isWith ? 'is-active is-with' : ''}`}
              onClick={() => setMode('with')}
            >
              <span className="btrans-toggle-dot with" aria-hidden="true" />
              <span>With Gradient</span>
            </button>
          </div>
        </div>

        {/* ─── 2. Architecture Canvas (Pure White Minimal Theme) ─── */}
        <div className={`btrans-canvas ${isWith ? 'is-connected' : 'is-fragmented'}`}>
          {/* Top Frame: 4 Verified Supplier Categories */}
          <div className="btrans-top-frame">
            <div className="btrans-frame-header">
              <span className={`btrans-frame-tag ${isWith ? 'tag-verified' : 'tag-warning'}`}>
                {isWith ? (
                  <>
                    <span className="btrans-live-pulse-dot" />
                    VERIFIED WHOLESALE SUPPLIERS · UNIFIED ECOSYSTEM
                  </>
                ) : (
                  <>
                    <span className="btrans-alert-dot">⚠</span>
                    DISCONNECTED SUPPLIER SILOS · UNCOORDINATED OUTREACH
                  </>
                )}
              </span>
            </div>

            <div className="btrans-suppliers-grid">
              {SUPPLIERS.map((sup) => (
                <div key={sup.id} className="btrans-supplier-card">
                  <div className="btrans-supplier-head">
                    <span className="btrans-supplier-icon" aria-hidden="true">
                      {sup.icon}
                    </span>
                    <span className="btrans-supplier-title">{sup.category}</span>
                  </div>

                  <div className="btrans-brand-pills">
                    {sup.brands.map((b) => (
                      <div key={b.name} className="btrans-brand-badge">
                        <span className="btrans-brand-bullet" />
                        <span className="btrans-brand-name">{b.name}</span>
                        <span className="btrans-brand-sub">{b.tag}</span>
                      </div>
                    ))}
                  </div>

                  <div className="btrans-supplier-footer">
                    <span className={`btrans-supplier-status ${isWith ? 'status-ok' : 'status-bad'}`}>
                      {isWith ? '● ' + sup.withStatus : '⚠ ' + sup.withoutStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Middle Tier: The Integration Bus with 6 Protocol Nodes & Dynamic SVG Beams ─── */}
          <div className="btrans-middle-bus-zone">
            {/* SVG Data Rails / Beam Cables with Dead-Center Coordinates */}
            <svg
              className="btrans-svg-bus"
              viewBox="0 0 1200 140"
              fill="none"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="beamGradPulse" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.2" />
                  <stop offset="45%" stopColor="#A855F7" stopOpacity="0.95" />
                  <stop offset="55%" stopColor="#C084FC" stopOpacity="1" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.2" />
                </linearGradient>

                <linearGradient id="dropGradPulse" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {isWith ? (
                /* ── WITH GRADIENT: Exact alignment with cards & horizontal bus ── */
                <g className="btrans-rails-connected">
                  {/* 4 Upper Trunks dropping dead-center from Top 4 Supplier Cards to Bus (y=70) */}
                  <line x1="177" y1="0" x2="177" y2="70" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="459" y1="0" x2="459" y2="70" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="741" y1="0" x2="741" y2="70" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="1023" y1="0" x2="1023" y2="70" stroke="#CBD5E1" strokeWidth="1.5" />

                  {/* Upper Animated Pulses */}
                  <line x1="177" y1="0" x2="177" y2="70" stroke="#A855F7" strokeWidth="2.5" strokeDasharray="18 52" className="btrans-anim-dash-down" />
                  <line x1="459" y1="0" x2="459" y2="70" stroke="#A855F7" strokeWidth="2.5" strokeDasharray="18 52" className="btrans-anim-dash-down" style={{ animationDelay: '-0.7s' }} />
                  <line x1="741" y1="0" x2="741" y2="70" stroke="#A855F7" strokeWidth="2.5" strokeDasharray="18 52" className="btrans-anim-dash-down" style={{ animationDelay: '-1.4s' }} />
                  <line x1="1023" y1="0" x2="1023" y2="70" stroke="#A855F7" strokeWidth="2.5" strokeDasharray="18 52" className="btrans-anim-dash-down" style={{ animationDelay: '-2.1s' }} />

                  {/* Central Horizontal Bus Highway (y=70) */}
                  <line x1="100" y1="70" x2="1100" y2="70" stroke="#E2E8F0" strokeWidth="2" />
                  <line x1="100" y1="70" x2="1100" y2="70" stroke="url(#beamGradPulse)" strokeWidth="2.5" className="btrans-anim-beam-horizontal" />

                  {/* 5 Lower Trunks dropping dead-center to 5 Bottom Café Cards (y=70 to 140) */}
                  <line x1="134" y1="70" x2="134" y2="140" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="367" y1="70" x2="367" y2="140" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="600" y1="70" x2="600" y2="140" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="833" y1="70" x2="833" y2="140" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="1066" y1="70" x2="1066" y2="140" stroke="#CBD5E1" strokeWidth="1.5" />

                  {/* Lower Animated Pulses */}
                  <line x1="134" y1="70" x2="134" y2="140" stroke="url(#dropGradPulse)" strokeWidth="2.5" strokeDasharray="18 52" className="btrans-anim-dash-down" style={{ animationDelay: '-0.3s' }} />
                  <line x1="367" y1="70" x2="367" y2="140" stroke="url(#dropGradPulse)" strokeWidth="2.5" strokeDasharray="18 52" className="btrans-anim-dash-down" style={{ animationDelay: '-1.0s' }} />
                  <line x1="600" y1="70" x2="600" y2="140" stroke="url(#dropGradPulse)" strokeWidth="2.5" strokeDasharray="18 52" className="btrans-anim-dash-down" style={{ animationDelay: '-1.7s' }} />
                  <line x1="833" y1="70" x2="833" y2="140" stroke="url(#dropGradPulse)" strokeWidth="2.5" strokeDasharray="18 52" className="btrans-anim-dash-down" style={{ animationDelay: '-0.8s' }} />
                  <line x1="1066" y1="70" x2="1066" y2="140" stroke="url(#dropGradPulse)" strokeWidth="2.5" strokeDasharray="18 52" className="btrans-anim-dash-down" style={{ animationDelay: '-1.5s' }} />
                </g>
              ) : (
                /* ── WITHOUT GRADIENT: Tangled chaotic spaghetti hairball lines ── */
                <g className="btrans-rails-fragmented">
                  <path d="M 177 0 C 260 70, 750 60, 833 140" stroke="#FCA5A5" strokeWidth="1.5" strokeDasharray="5 5" />
                  <path d="M 177 0 C 220 50, 340 80, 367 140" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" />
                  <path d="M 459 0 C 350 60, 150 80, 134 140" stroke="#F87171" strokeWidth="1.5" strokeDasharray="6 4" />
                  <path d="M 459 0 C 650 40, 950 60, 1066 140" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" />
                  <path d="M 741 0 C 580 70, 390 60, 367 140" stroke="#FCA5A5" strokeWidth="1.5" strokeDasharray="5 5" />
                  <path d="M 741 0 C 700 70, 620 80, 600 140" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" />
                  <path d="M 1023 0 C 850 70, 250 60, 134 140" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="6 4" />
                  <path d="M 1023 0 C 950 60, 870 70, 833 140" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="5 5" />

                  {/* Warning friction points */}
                  <circle cx="510" cy="62" r="3.5" fill="#EF4444" />
                  <circle cx="340" cy="74" r="3" fill="#F87171" />
                  <circle cx="810" cy="68" r="3.5" fill="#EF4444" />
                </g>
              )}
            </svg>

            {/* 6 Protocol Badges positioned along the central line */}
            <div className="btrans-protocols-row">
              {PROTOCOLS.map((p, idx) => {
                const shortLabel = isWith ? p.shortLabel : p.withoutShortLabel;
                const fullDesc = isWith ? p.withDesc : p.withoutDesc;
                const icon = isWith ? p.withIcon : p.withoutIcon;

                return (
                  <div
                    key={p.id}
                    className={`btrans-protocol-node ${isWith ? 'is-with' : 'is-without'} ${
                      hoveredProtocol === idx ? 'is-hovered' : ''
                    }`}
                    onMouseEnter={() => setHoveredProtocol(idx)}
                    onMouseLeave={() => setHoveredProtocol(null)}
                  >
                    <div className="btrans-protocol-disc">
                      <span className="btrans-protocol-icon" aria-hidden="true">
                        {icon}
                      </span>
                    </div>

                    <span className="btrans-protocol-pill-label">
                      {shortLabel}
                    </span>

                    {/* Quick hover intelligence tooltip */}
                    <div className="btrans-protocol-tooltip" role="tooltip">
                      <div className="btrans-tooltip-title">{fullDesc}</div>
                      <div className="btrans-tooltip-metric">
                        {isWith ? p.metric : '⚠ Unverified Manual Bottleneck'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Bottom Tier: 5 Destination Café Outlets ─── */}
          <div className="btrans-bottom-cafes">
            <div className="btrans-cafes-grid">
              {CAFES.map((c) => {
                const badge = isWith ? c.withBadge : c.withoutBadge;
                const poVal = isWith ? c.withPo : c.withoutPo;
                const invVal = isWith ? c.withInventory : c.withoutInventory;

                return (
                  <div key={c.id} className={`btrans-cafe-card ${isWith ? 'card-with' : 'card-without'}`}>
                    <div className="btrans-cafe-header">
                      <div className="btrans-cafe-icon-title">
                        <span className="btrans-cafe-avatar" aria-hidden="true">
                          {c.icon}
                        </span>
                        <div className="btrans-cafe-text-wrap">
                          <div className="btrans-cafe-name">{c.name}</div>
                          <div className="btrans-cafe-type">{c.type}</div>
                        </div>
                      </div>

                      <span className={`btrans-cafe-badge ${isWith ? 'badge-ok' : 'badge-bad'}`}>
                        {badge}
                      </span>
                    </div>

                    {/* Structured Specs */}
                    <div className="btrans-cafe-specs">
                      <div className="btrans-spec-row">
                        <span className="btrans-spec-label">PO CHANNEL</span>
                        <span className={`btrans-spec-val ${isWith ? 'val-ok' : 'val-bad'}`}>{poVal}</span>
                      </div>
                      <div className="btrans-spec-row">
                        <span className="btrans-spec-label">INVENTORY</span>
                        <span className={`btrans-spec-val ${isWith ? 'val-ok' : 'val-bad'}`}>{invVal}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── 3. High-Impact Summary Comparison Bar ─── */}
        <div className="btrans-summary-strip">
          <div className="btrans-summary-grid">
            {(isWith ? SUMMARY_WITH : SUMMARY_WITHOUT).map((item, idx) => (
              <div key={idx} className={`btrans-summary-card ${isWith ? 'card-with' : 'card-without'}`}>
                <div className={`btrans-summary-metric ${isWith ? 'metric-with' : 'metric-without'}`}>
                  {item.metric}
                </div>
                <h3 className="btrans-summary-title">{item.title}</h3>
                <p className="btrans-summary-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
