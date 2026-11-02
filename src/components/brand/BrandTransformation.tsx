'use client';

import React, { useState } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   ORCHID-INSPIRED WHOLESALE ARCHITECTURE FOR GRADIENT
   Dark Purple Only · Minimal & Concise Content
   Branching Animated Beams: Top Cards → Divide at Central Bus → Lower Cards
   ───────────────────────────────────────────────────────────────────────────── */

type Mode = 'with' | 'without';

interface SupplierCategory {
  id: string;
  pill: string;
  title: string;
  icon: React.ReactNode;
  features: { icon: React.ReactNode; text: string }[];
  withStatus: string;
  withoutStatus: string;
}

interface ProtocolNode {
  id: string;
  shortLabel: string;
  withDesc: string;
  withIcon: React.ReactNode;
  withoutShortLabel: string;
  withoutDesc: string;
  withoutIcon: React.ReactNode;
  metric: string;
}

interface CafeNode {
  id: string;
  pill: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  features: { icon: React.ReactNode; text: string; withoutText: string }[];
}

/* ─── 1. TOP TIER: 4 MINIMAL WHOLESALE SOURCE CARDS ──────────────────────── */
const SUPPLIERS: SupplierCategory[] = [
  {
    id: 'roasters',
    pill: 'Sourcing',
    title: 'Specialty Roasters',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="7" rx="8" ry="4" />
        <path d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7" />
        <path d="M4 12c0 2.21 3.58 4 8 4s8-1.79 8-4" />
      </svg>
    ),
    features: [
      {
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ),
        text: 'Blue Tokai & Subko Arabica',
      },
      {
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
        text: '48-Hr Batch Roast Sync',
      },
      {
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        ),
        text: 'Direct Estate Micro-Lots',
      },
    ],
    withStatus: 'Roast Batch Synced',
    withoutStatus: 'Speculative Batches',
  },
  {
    id: 'milks',
    pill: 'Cold-Chain',
    title: 'Barista Milks',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h9l3 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4z" />
        <path d="M18 10h2a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-2" />
      </svg>
    ),
    features: [
      {
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22s5-5 8-12c1-2 3-2 4 0 3 7 8 12 8 12" />
          </svg>
        ),
        text: 'Oat Barista Pro & Amul',
      },
      {
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        ),
        text: 'Cold-Chain Par Replenishment',
      },
      {
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        ),
        text: 'Zero Lactose Spoilage',
      },
    ],
    withStatus: 'Cold-Chain Active',
    withoutStatus: 'Daily Stockout Risk',
  },
  {
    id: 'syrups',
    pill: 'Beverage',
    title: 'Beverage Bases',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2h4" />
        <path d="M12 2v4" />
        <path d="M8 6h8l2 4v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10l2-4z" />
      </svg>
    ),
    features: [
      {
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        ),
        text: 'Monin Gourmet & 1883 Syrups',
      },
      {
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18M7 8l10 8M17 8L7 16" />
          </svg>
        ),
        text: 'Botanicals & Uji Matcha',
      },
      {
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        ),
        text: 'Wholesale Tier Volume Rates',
      },
    ],
    withStatus: 'Tier Rates Locked',
    withoutStatus: 'Unstandardized Pricing',
  },
  {
    id: 'packaging',
    pill: 'Hardware',
    title: 'Bar Pack & Gear',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="6" />
        <path d="M13.2 13.2L20 20" />
      </svg>
    ),
    features: [
      {
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 6v12M6 12h12" />
          </svg>
        ),
        text: 'La Marzocco Spares & Burrs',
      },
      {
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 4 13a7 7 0 0 1 14-3v7" />
          </svg>
        ),
        text: 'Bio-Cup Compostable Cups',
      },
      {
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="14" height="12" rx="1" />
            <path d="M15 8h4l3 3v5h-7V8z" />
          </svg>
        ),
        text: 'Consolidated Route Freight',
      },
    ],
    withStatus: 'Bundled Freight',
    withoutStatus: 'High Shipping Costs',
  },
];

/* ─── 2. MIDDLE TIER: 6 PROTOCOL BADGES ALONG THE HIGHWAY ─────────────────── */
const PROTOCOLS: ProtocolNode[] = [
  {
    id: 'net15',
    shortLabel: 'Net-15',
    withDesc: 'Automated Standing Purchase Orders',
    withIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15l2 2 4-4" />
      </svg>
    ),
    withoutShortLabel: 'WhatsApp',
    withoutDesc: 'Unconfirmed Audio Notes & Text Threads',
    withoutIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    metric: '< 90s Approval',
  },
  {
    id: 'api',
    shortLabel: 'EDI / API',
    withDesc: 'Live Wholesale Catalog & Price Sync',
    withIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="6" height="6" rx="1.5" />
        <rect x="16" y="3" width="6" height="6" rx="1.5" />
        <rect x="9" y="15" width="6" height="6" rx="1.5" />
        <path d="M5 9v3a2 2 0 0 0 2 2h2" />
        <path d="M19 9v3a2 2 0 0 1-2 2h-2" />
      </svg>
    ),
    withoutShortLabel: 'Calling',
    withoutDesc: 'Endless Phone Follow-ups',
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
    withDesc: 'Real-Time Bean Velocity Tracking',
    withIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h3.5l2.5-7 4 14 3.5-9 2 4H22" />
      </svg>
    ),
    withoutShortLabel: 'Excel',
    withoutDesc: 'Formula Errors & Stock Discrepancies',
    withoutIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
      </svg>
    ),
    metric: 'Live Velocity',
  },
  {
    id: 'coldchain',
    shortLabel: 'Cold Chain',
    withDesc: 'GPS Route-Dispatched Fleet Logistics',
    withIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="14" height="12" rx="1" />
        <path d="M15 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="17.5" cy="18.5" r="2.5" />
      </svg>
    ),
    withoutShortLabel: 'Receipts',
    withoutDesc: 'Lost Paper Delivery Chits',
    withoutIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V8z" />
      </svg>
    ),
    metric: '99.4% On-Time',
  },
  {
    id: 'restock',
    shortLabel: 'Restock',
    withDesc: 'Algorithmic Safety Par Replenishment',
    withIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
      </svg>
    ),
    withoutShortLabel: 'Deadstock',
    withoutDesc: 'Overproduced Roast Staleness',
    withoutIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      </svg>
    ),
    metric: 'Zero Waste',
  },
  {
    id: 'erp',
    shortLabel: 'ERP Sync',
    withDesc: 'Instant Tally, Zoho Books & SAP Sync',
    withIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    withoutShortLabel: 'Panic Run',
    withoutDesc: 'Emergency Supermarket Retail Runs',
    withoutIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      </svg>
    ),
    metric: '100% Compliant',
  },
];

/* ─── 3. BOTTOM TIER: 5 CONCISE CAFÉ OUTLET CARDS ────────────────────────── */
const CAFES: CafeNode[] = [
  {
    id: 'cafe-1',
    pill: 'Single Origin',
    name: 'Roastery Lab',
    subtitle: 'Specialty Espresso',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6M10 3v5l-5 8.5A2 2 0 0 0 6.7 20h10.6a2 2 0 0 0 1.7-3.5L14 8V3" />
      </svg>
    ),
    features: [
      {
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ),
        text: 'Standing Net-15 PO',
        withoutText: 'WhatsApp Audio Order',
      },
      {
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 14 14" />
          </svg>
        ),
        text: '0% Stockout Drift',
        withoutText: '18% Bean Deadstock',
      },
    ],
  },
  {
    id: 'cafe-2',
    pill: 'Multi-Unit',
    name: 'Regional Chain',
    subtitle: '14 Synced Locations',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
      </svg>
    ),
    features: [
      {
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        ),
        text: 'Central EDI Dispatch',
        withoutText: 'Phone Calling Matrix',
      },
      {
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ),
        text: '99.8% On-Time Par',
        withoutText: 'Excel Formula Lag',
      },
    ],
  },
  {
    id: 'cafe-3',
    pill: 'Artisanal',
    name: 'Artisan Bar',
    subtitle: 'Single-Origin Focus',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      </svg>
    ),
    features: [
      {
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ),
        text: 'Fresh Roast Match',
        withoutText: 'Stale Beans (Roast Gap)',
      },
      {
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ),
        text: 'Zero Deadstock Waste',
        withoutText: 'Oat Milk Shortage',
      },
    ],
  },
  {
    id: 'cafe-4',
    pill: 'Enterprise',
    name: 'Hotel Lounge',
    subtitle: 'High-Volume F&B',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M4 18h16M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z" />
      </svg>
    ),
    features: [
      {
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          </svg>
        ),
        text: 'Direct SAP/Tally Sync',
        withoutText: 'Paper Delivery Chits',
      },
      {
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
        text: 'Buffer Par Locked',
        withoutText: 'Weekend Par Shortage',
      },
    ],
  },
  {
    id: 'cafe-5',
    pill: 'High Velocity',
    name: 'Airport Express',
    subtitle: 'Zero Downtime',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    features: [
      {
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="14" height="12" rx="1" />
            <path d="M15 8h4l3 3v5h-7V8z" />
          </svg>
        ),
        text: 'Daily Route Van Run',
        withoutText: 'Supermarket Panic Run',
      },
      {
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
        text: 'Rush Hour Protected',
        withoutText: 'Peak Revenue Loss',
      },
    ],
  },
];

/* ─── 4. SUMMARY IMPACT PILLARS ───────────────────────────────────────────── */
const SUMMARY_WITH = [
  {
    metric: '< 90s / Week',
    title: 'Automated Standing POs',
    desc: 'Standing PO approvals on Net-15 terms replacing hours of fragmented WhatsApp texting.',
  },
  {
    metric: '99.4% On-Time',
    title: 'Consolidated Route Dispatch',
    desc: 'Roastery beans, fresh oat milk, and consumables arrive bundled in a single scheduled delivery.',
  },
  {
    metric: 'Zero Deadstock',
    title: 'Telemetry-Matched Batches',
    desc: 'Roasters roast exactly what verified cafés consume, eliminating overproduction waste.',
  },
];

const SUMMARY_WITHOUT = [
  {
    metric: '6–8 Hours / Wk',
    title: 'Lost in Manual Coordination',
    desc: 'Hours wasted every week texting roasters, sending audio reminders, and cross-checking paper slips.',
  },
  {
    metric: '18–24% Wastage',
    title: 'Deadstock & Supermarket Panics',
    desc: 'Speculative roasting creates stale beans, while unexpected spikes force emergency retail runs.',
  },
  {
    metric: '7+ Broken Tools',
    title: 'Siloed Friction Channels',
    desc: 'Procurement scattered across personal WhatsApp, phone calls, spreadsheets, and paper receipts.',
  },
];

/* ─── 5. SYNCHRONIZED TWO-PHASE BRANCHING BEAMS ─────────────────────────
   Phase 1: Feeder beam drops from top card to horizontal bus junction (y=80)
   Phase 2: Beam DIVIDES into Left & Right branches cascading to café cards
   ───────────────────────────────────────────────────────────────────────── */
const FEEDER_BEAMS = [
  { id: 'f0', x: 162, delay: '0s' },
  { id: 'f1', x: 454, delay: '1.1s' },
  { id: 'f2', x: 746, delay: '2.2s' },
  { id: 'f3', x: 1038, delay: '3.3s' },
];

const BRANCH_BEAMS = [
  // Top Card 0 (Roasters, x=162) divides to Café 0 (134) & Café 1 (367)
  {
    id: 'b0-left',
    d: 'M 162,80 L 148,80 Q 134,80 134,96 L 134,160',
    delay: '0s',
  },
  {
    id: 'b0-right',
    d: 'M 162,80 L 353,80 Q 367,80 367,96 L 367,160',
    delay: '0s',
  },

  // Top Card 1 (Milks, x=454) divides to Café 1 (367) & Café 2 (600)
  {
    id: 'b1-left',
    d: 'M 454,80 L 381,80 Q 367,80 367,96 L 367,160',
    delay: '1.1s',
  },
  {
    id: 'b1-right',
    d: 'M 454,80 L 586,80 Q 600,80 600,96 L 600,160',
    delay: '1.1s',
  },

  // Top Card 2 (Syrups, x=746) divides to Café 2 (600) & Café 3 (833)
  {
    id: 'b2-left',
    d: 'M 746,80 L 614,80 Q 600,80 600,96 L 600,160',
    delay: '2.2s',
  },
  {
    id: 'b2-right',
    d: 'M 746,80 L 819,80 Q 833,80 833,96 L 833,160',
    delay: '2.2s',
  },

  // Top Card 3 (Gear, x=1038) divides to Café 3 (833) & Café 4 (1066)
  {
    id: 'b3-left',
    d: 'M 1038,80 L 847,80 Q 833,80 833,96 L 833,160',
    delay: '3.3s',
  },
  {
    id: 'b3-right',
    d: 'M 1038,80 L 1052,80 Q 1066,80 1066,96 L 1066,160',
    delay: '3.3s',
  },
];

const JUNCTION_NODES = [
  { id: 'j0', x: 162, delay: '0s' },
  { id: 'j1', x: 454, delay: '1.1s' },
  { id: 'j2', x: 746, delay: '2.2s' },
  { id: 'j3', x: 1038, delay: '3.3s' },
];

const DESTINATION_PIPS = [
  { id: 'p0', x: 134, delay: '0.3s' },
  { id: 'p1', x: 367, delay: '0.3s' },
  { id: 'p2', x: 600, delay: '1.4s' },
  { id: 'p3', x: 833, delay: '2.5s' },
  { id: 'p4', x: 1066, delay: '3.6s' },
];

export function BrandTransformation() {
  const [mode, setMode] = useState<Mode>('with');
  const [hoveredProtocol, setHoveredProtocol] = useState<number | null>(null);
  const [hoveredSupplier, setHoveredSupplier] = useState<number | null>(null);

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
                  <span className="btrans-title-muted">Slow.</span>
                </>
              )}
            </h2>

            <p className="btrans-sub">
              {isWith
                ? 'Connected supply chain operating system replacing manual WhatsApp coordination with real-time wholesale distribution.'
                : 'Scattered conversations, lost paper receipts, formula errors, and emergency supermarket runs leave roasters and café operators stranded in manual chaos.'}
            </p>
          </div>

          {/* Interactive Orchid-Style Toggle Switch (Strict Purple & White) */}
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
          {/* Top Frame: 4 Concise Supplier Cards */}
          <div className="btrans-top-frame">
            <div className="btrans-frame-header">
              <span className={`btrans-frame-tag ${isWith ? 'tag-verified' : 'tag-muted'}`}>
                {isWith ? (
                  <>
                    <span className="btrans-live-pulse-dot" />
                    VERIFIED WHOLESALE SUPPLIERS · UNIFIED ECOSYSTEM
                  </>
                ) : (
                  <>
                    <span className="btrans-hollow-dot" />
                    DISCONNECTED SUPPLIER SILOS · UNCOORDINATED OUTREACH
                  </>
                )}
              </span>
            </div>

            <div className="btrans-suppliers-grid">
              {SUPPLIERS.map((sup, sIdx) => (
                <div
                  key={sup.id}
                  className={`btrans-supplier-card ${hoveredSupplier === sIdx ? 'is-hovered' : ''}`}
                  onMouseEnter={() => setHoveredSupplier(sIdx)}
                  onMouseLeave={() => setHoveredSupplier(null)}
                >
                  {/* Top Category Badge */}
                  <div className="btrans-card-top-pill">
                    <span className="btrans-pill-badge">{sup.pill}</span>
                    <span className="btrans-supplier-icon" aria-hidden="true">
                      {sup.icon}
                    </span>
                  </div>

                  <h3 className="btrans-supplier-title">{sup.title}</h3>

                  {/* Concise 3-bullet list with icons */}
                  <div className="btrans-feature-list">
                    {sup.features.map((f, fIdx) => (
                      <div key={fIdx} className="btrans-feature-item">
                        <span className="btrans-feature-icon" aria-hidden="true">
                          {f.icon}
                        </span>
                        <span className="btrans-feature-text">{f.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="btrans-supplier-footer">
                    <span className={`btrans-supplier-status ${isWith ? 'status-ok' : 'status-muted'}`}>
                      {isWith ? '● ' + sup.withStatus : '○ ' + sup.withoutStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Middle Tier: The Integration Bus with Dark Purple Branching Beams ─── */}
          <div className="btrans-middle-bus-zone">
            {/* SVG Data Rails / Beam Cables with Dead-Center Coordinates */}
            <svg
              className="btrans-svg-bus"
              viewBox="0 0 1200 160"
              fill="none"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                {/* Luminous Dark Purple Laser Filter */}
                <filter id="beamLaserGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Pure Dark Purple Gradient for the Beam (Gradient's Brand Purple) */}
                <linearGradient id="beamGradDarkPurple" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6B33D3" stopOpacity="0.5" />
                  <stop offset="40%" stopColor="#6B33D3" stopOpacity="1" />
                  <stop offset="80%" stopColor="#5522B8" stopOpacity="1" />
                  <stop offset="100%" stopColor="#2B1760" stopOpacity="1" />
                </linearGradient>

                {/* Dark Purple Ambient Halo Gradient */}
                <linearGradient id="beamGradDarkHalo" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6B33D3" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#6B33D3" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#2B1760" stopOpacity="0.3" />
                </linearGradient>

                {/* Horizontal beam gradient for branches */}
                <linearGradient id="beamGradHoriz" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6B33D3" stopOpacity="0.4" />
                  <stop offset="30%" stopColor="#6B33D3" stopOpacity="1" />
                  <stop offset="70%" stopColor="#5522B8" stopOpacity="1" />
                  <stop offset="100%" stopColor="#2B1760" stopOpacity="0.6" />
                </linearGradient>

                <linearGradient id="beamGradHorizHalo" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6B33D3" stopOpacity="0.25" />
                  <stop offset="50%" stopColor="#6B33D3" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#2B1760" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {isWith ? (
                /* ── WITH GRADIENT: Exact alignment with cards & horizontal bus ── */
                <g className="btrans-rails-connected">
                  {/* Layer 1: Base static conduit rails in dark purple hairline */}
                  <g className="btrans-static-conduits">
                    <line x1="90" y1="80" x2="1110" y2="80" stroke="rgba(107, 51, 211, 0.15)" strokeWidth="1.5" strokeDasharray="4 4" />

                    {/* 8 Branching conduit tracks */}
                    {BRANCH_BEAMS.map((bb) => (
                      <path
                        key={`static-${bb.id}`}
                        d={bb.d}
                        stroke="rgba(107, 51, 211, 0.12)"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    ))}

                    {/* Direct vertical feeders */}
                    <line x1="162" y1="0" x2="162" y2="80" stroke="rgba(107, 51, 211, 0.15)" strokeWidth="1.5" />
                    <line x1="454" y1="0" x2="454" y2="80" stroke="rgba(107, 51, 211, 0.15)" strokeWidth="1.5" />
                    <line x1="746" y1="0" x2="746" y2="80" stroke="rgba(107, 51, 211, 0.15)" strokeWidth="1.5" />
                    <line x1="1038" y1="0" x2="1038" y2="80" stroke="rgba(107, 51, 211, 0.15)" strokeWidth="1.5" />

                    <line x1="134" y1="80" x2="134" y2="160" stroke="rgba(107, 51, 211, 0.15)" strokeWidth="1.5" />
                    <line x1="367" y1="80" x2="367" y2="160" stroke="rgba(107, 51, 211, 0.15)" strokeWidth="1.5" />
                    <line x1="600" y1="80" x2="600" y2="160" stroke="rgba(107, 51, 211, 0.15)" strokeWidth="1.5" />
                    <line x1="833" y1="80" x2="833" y2="160" stroke="rgba(107, 51, 211, 0.15)" strokeWidth="1.5" />
                    <line x1="1066" y1="80" x2="1066" y2="160" stroke="rgba(107, 51, 211, 0.15)" strokeWidth="1.5" />
                  </g>

                  {/* Layer 2A: 4 Dynamic FEEDER Beams (Top Card → Junction y=80) */}
                  <g className="btrans-active-feeders">
                    {FEEDER_BEAMS.map((fb) => (
                      <React.Fragment key={`feeder-${fb.id}`}>
                        {/* Outer Dark Purple Glow */}
                        <path
                          d={`M ${fb.x},0 L ${fb.x},80`}
                          pathLength={100}
                          fill="none"
                          stroke="url(#beamGradDarkHalo)"
                          strokeWidth={9}
                          strokeLinecap="round"
                          filter="url(#beamLaserGlow)"
                          className="btrans-feeder-beam"
                          style={{ animationDelay: fb.delay }}
                        />
                        {/* Core Solid Dark Purple Laser */}
                        <path
                          d={`M ${fb.x},0 L ${fb.x},80`}
                          pathLength={100}
                          fill="none"
                          stroke="url(#beamGradDarkPurple)"
                          strokeWidth={3.5}
                          strokeLinecap="round"
                          className="btrans-feeder-beam"
                          style={{ animationDelay: fb.delay }}
                        />
                      </React.Fragment>
                    ))}
                  </g>

                  {/* Layer 2B: 8 Dynamic BRANCH Beams (Junction y=80 → Divide Left & Right → Cafés) */}
                  <g className="btrans-active-branches">
                    {BRANCH_BEAMS.map((bb) => (
                      <React.Fragment key={`branch-${bb.id}`}>
                        {/* Outer Dark Purple Glow */}
                        <path
                          d={bb.d}
                          pathLength={500}
                          fill="none"
                          stroke="url(#beamGradHorizHalo)"
                          strokeWidth={9}
                          strokeLinecap="round"
                          filter="url(#beamLaserGlow)"
                          className="btrans-branch-beam"
                          style={{ animationDelay: bb.delay }}
                        />

                        {/* Core Solid Dark Purple Laser Stream */}
                        <path
                          d={bb.d}
                          pathLength={500}
                          fill="none"
                          stroke="url(#beamGradHoriz)"
                          strokeWidth={3.5}
                          strokeLinecap="round"
                          className="btrans-branch-beam"
                          style={{ animationDelay: bb.delay }}
                        />
                      </React.Fragment>
                    ))}
                  </g>

                  {/* Layer 3: 4 Animated Dividing Junction Nodes where beams hit & split */}
                  <g className="btrans-dividing-junctions">
                    {JUNCTION_NODES.map((jn) => (
                      <g key={`junction-${jn.id}`}>
                        <circle cx={jn.x} cy="80" r="6" fill="#6B33D3" />
                        <circle cx={jn.x} cy="80" r="2.5" fill="#EDE9FE" />
                        <circle
                          cx={jn.x}
                          cy="80"
                          r="13"
                          fill="none"
                          stroke="#6B33D3"
                          strokeWidth="2"
                          className="btrans-junction-ring"
                          style={{ animationDelay: jn.delay }}
                        />
                      </g>
                    ))}
                  </g>

                  {/* Layer 4: 5 Destination Receiving Pips */}
                  <g className="btrans-destination-pips">
                    {DESTINATION_PIPS.map((dp) => (
                      <g key={`pip-${dp.id}`}>
                        <circle cx={dp.x} cy="158" r="5" fill="#6B33D3" />
                        <circle cx={dp.x} cy="158" r="2" fill="#EDE9FE" />
                        <circle
                          cx={dp.x}
                          cy="158"
                          r="10"
                          fill="none"
                          stroke="#6B33D3"
                          strokeWidth="1.8"
                          className="btrans-dest-ring"
                          style={{ animationDelay: dp.delay }}
                        />
                      </g>
                    ))}
                  </g>
                </g>
              ) : (
                /* ── WITHOUT GRADIENT: Muted slate-lavender tangled criss-cross hairball ── */
                <g className="btrans-rails-fragmented">
                  <path d="M 177 0 C 260 80, 750 70, 833 160" stroke="rgba(148, 163, 184, 0.45)" strokeWidth="1.5" strokeDasharray="5 5" />
                  <path d="M 177 0 C 220 55, 340 90, 367 160" stroke="rgba(203, 213, 225, 0.7)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <path d="M 459 0 C 350 70, 150 90, 134 160" stroke="rgba(148, 163, 184, 0.55)" strokeWidth="1.5" strokeDasharray="6 4" />
                  <path d="M 459 0 C 650 45, 950 70, 1066 160" stroke="rgba(203, 213, 225, 0.7)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <path d="M 741 0 C 580 80, 390 70, 367 160" stroke="rgba(148, 163, 184, 0.45)" strokeWidth="1.5" strokeDasharray="5 5" />
                  <path d="M 741 0 C 700 80, 620 90, 600 160" stroke="rgba(203, 213, 225, 0.7)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <path d="M 1023 0 C 850 80, 250 70, 134 160" stroke="rgba(148, 163, 184, 0.55)" strokeWidth="1.5" strokeDasharray="6 4" />
                  <path d="M 1023 0 C 950 70, 870 80, 833 160" stroke="rgba(203, 213, 225, 0.7)" strokeWidth="1.5" strokeDasharray="5 5" />

                  {/* Warning friction points in muted slate */}
                  <circle cx="510" cy="72" r="3.5" fill="#94A3B8" />
                  <circle cx="340" cy="84" r="3" fill="#CBD5E1" />
                  <circle cx="810" cy="78" r="3.5" fill="#94A3B8" />
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
                        {isWith ? p.metric : '○ Manual Bottleneck'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Bottom Tier: 5 Concise Café Destination Outlets ─── */}
          <div className="btrans-bottom-cafes">
            <div className="btrans-cafes-grid">
              {CAFES.map((c) => {
                return (
                  <div key={c.id} className={`btrans-cafe-card ${isWith ? 'card-with' : 'card-without'}`}>
                    {/* Top Pill */}
                    <div className="btrans-card-top-pill">
                      <span className={`btrans-pill-badge ${isWith ? 'badge-ok' : 'badge-muted'}`}>
                        {isWith ? c.pill : 'Fragmented'}
                      </span>
                      <span className="btrans-cafe-avatar" aria-hidden="true">
                        {c.icon}
                      </span>
                    </div>

                    <div className="btrans-cafe-name-wrap">
                      <div className="btrans-cafe-name">{c.name}</div>
                      <div className="btrans-cafe-sub">{c.subtitle}</div>
                    </div>

                    {/* Concise 2-bullet feature list with icons */}
                    <div className="btrans-feature-list">
                      {c.features.map((f, fIdx) => (
                        <div key={fIdx} className="btrans-feature-item">
                          <span className={`btrans-feature-icon ${isWith ? 'icon-purple' : 'icon-muted'}`} aria-hidden="true">
                            {f.icon}
                          </span>
                          <span className={`btrans-feature-text ${isWith ? '' : 'text-muted'}`}>
                            {isWith ? f.text : f.withoutText}
                          </span>
                        </div>
                      ))}
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
