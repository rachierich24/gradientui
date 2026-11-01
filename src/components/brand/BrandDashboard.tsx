'use client';

/* ─────────────────────────────────────────────────────────────────────────────
   GRADIENT — BRAND ANALYTICS DASHBOARD SHOWCASE SECTION
   Design System: White & Purple (#502B9A)
   Aesthetic Refinement: Linear precision · Stripe analytics clarity · Ramp elegance
   Orientation: Three-column layout, 520px frame height (strict horizon budget)
   Structure:
     1. Editorial Eyebrow & Stationary Headline
     2. Top App Bar & 4-Cell KPI Row
     3. Left Column: Trial Conversion Funnel & Weekly Reorder Volume
     4. Centre Column: Delhi NCR Café Distribution Map & Selected Café Intelligence
     5. Right Column: Barista Feedback & Live Commercial Telemetry
   ───────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { DelhiCafeMarker } from './DelhiRealMap';

const DelhiRealMap = dynamic(() => import('./DelhiRealMap'), {
  ssr: false,
  loading: () => (
    <div className="bdb-real-map-loading">
      <div className="bdb-map-spinner" />
      <span>Loading Delhi NCR Live GIS...</span>
    </div>
  ),
});
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/* ─── DATA SYSTEM: Realistic, Internally Consistent Metrics ───────────────── */
const CAMPAIGN_META = {
  brand: 'OatLife Artisanal',
  product: 'Barista Oat Milk',
  edition: 'Delhi NCR · 120 kits · 9 suppliers',
  status: 'Campaign active',
  dateRange: 'Oct 1 – Oct 31, 2026',
  totalKits: 120,
  deliveredKits: 112,
  trialsCompleted: 86,
  feedbackReceived: 67,
  positiveFeedbackPct: 78,
  weeklyReorders: 24,
  conversionRatePct: 27.9,
  weeklyVolumeLitres: 840,
  estimatedARR: '₹2.18L / mo',
};

const KPI_METRICS = [
  {
    id: 'kits',
    num: '01',
    label: 'Kits Delivered',
    value: '112 / 120',
    meta: '93.3% completion',
    type: 'progress',
    progress: 93.3,
  },
  {
    id: 'trials',
    num: '02',
    label: 'Trials Completed',
    value: '86 baristas',
    meta: '76.8% trial rate',
    type: 'badge',
    badge: '+14 this week',
  },
  {
    id: 'feedback',
    num: '03',
    label: 'Sensory Rating',
    value: '★ 4.8 / 5.0',
    meta: '67 verified reviews',
    type: 'sparkline',
    trend: [48, 54, 61, 68, 73, 78],
  },
  {
    id: 'reorders',
    num: '04',
    label: 'Weekly Reorders',
    value: '24 cafés',
    meta: '27.9% recurring conversion',
    type: 'badge_purple',
    badge: '₹2.18L / mo ARR',
  },
];

export type MapMarker = DelhiCafeMarker;

const DELHI_MARKERS: MapMarker[] = [
  // Hauz Khas Cluster (South Delhi Anchor)
  {
    id: 'm1',
    lat: 28.549,
    lng: 77.1985,
    name: 'Little Brew Room',
    area: 'Hauz Khas',
    status: 'reordered',
    volume: '36 L/wk',
    barista: 'Aditya K.',
    rating: 4.9,
    standingPO: 'Net-15 Active',
    quote: '“Holds a rosetta better than the oat milk we use now.”',
    supplier: 'Sharma Dairy · Route 4',
  },
  {
    id: 'm2',
    lat: 28.5525,
    lng: 77.2015,
    name: 'Tiny Tamper',
    area: 'Hauz Khas',
    status: 'reordered',
    volume: '28 L/wk',
    barista: 'Sneha G.',
    rating: 4.8,
    standingPO: 'Net-15 Active',
    quote: '“Steams silky microfoam without scorch notes.”',
    supplier: 'Sharma Dairy · Route 4',
  },
  {
    id: 'm3',
    lat: 28.5475,
    lng: 77.203,
    name: 'Blue Tokai HKV',
    area: 'Hauz Khas',
    status: 'reordered',
    volume: '44 L/wk',
    barista: 'Farhan M.',
    rating: 5.0,
    standingPO: 'Standing Weekly PO',
    quote: '“Highest oat flat white repeat rate in Delhi.”',
    supplier: 'Fresh Lane Foods',
  },
  {
    id: 'm4',
    lat: 28.5485,
    lng: 77.2055,
    name: "Elma's Bakery & Coffee",
    area: 'Hauz Khas',
    status: 'trial_completed',
    volume: 'Testing batch 2',
    barista: 'Zoya K.',
    rating: 4.7,
    supplier: 'Sharma Dairy',
  },
  {
    id: 'm5',
    lat: 28.5535,
    lng: 77.195,
    name: 'Coast Cafe',
    area: 'Hauz Khas',
    status: 'delivered',
    volume: 'Kit delivered',
    supplier: 'Sharma Dairy',
  },

  // Connaught Place Cluster (Central Delhi Commercial Heart)
  {
    id: 'm6',
    lat: 28.6315,
    lng: 77.2185,
    name: 'Steam Theory',
    area: 'Connaught Place',
    status: 'reordered',
    volume: '32 L/wk',
    barista: 'Kabir V.',
    rating: 4.8,
    standingPO: 'Standing Weekly PO',
    quote: '“Pairs impeccably with washed Ethiopian roasts.”',
    supplier: 'Old Market Traders',
  },
  {
    id: 'm7',
    lat: 28.6335,
    lng: 77.2215,
    name: 'United Coffee House',
    area: 'Connaught Place',
    status: 'reordered',
    volume: '40 L/wk',
    barista: 'Rajesh S.',
    rating: 4.7,
    standingPO: 'Net-15 Active',
    quote: '“Old-school crowd loved the lighter oat finish.”',
    supplier: 'Old Market Traders',
  },
  {
    id: 'm8',
    lat: 28.629,
    lng: 77.2155,
    name: 'Barista Heritage CP',
    area: 'Connaught Place',
    status: 'trial_completed',
    volume: 'Latte art approved',
    barista: 'Pooja T.',
    rating: 4.6,
    supplier: 'Old Market Traders',
  },
  {
    id: 'm9',
    lat: 28.6345,
    lng: 77.214,
    name: 'The Chai Story CP',
    area: 'Connaught Place',
    status: 'delivered',
    volume: 'Trial kit active',
    supplier: 'Yamuna Provisions',
  },

  // Saket & Saidulajab / Champa Gali Cluster (South Delhi)
  {
    id: 'm10',
    lat: 28.523,
    lng: 77.2065,
    name: 'Morning Ritual',
    area: 'Saket',
    status: 'reordered',
    volume: '30 L/wk',
    barista: 'Gautam P.',
    rating: 4.9,
    standingPO: 'Standing Weekly PO',
    quote: '“Steams silky and never splits, even hot.”',
    supplier: 'Southfield Dairy',
  },
  {
    id: 'm11',
    lat: 28.5195,
    lng: 77.2015,
    name: 'Jugmug Thela',
    area: 'Saket',
    status: 'reordered',
    volume: '26 L/wk',
    barista: 'Manish R.',
    rating: 4.8,
    standingPO: 'Net-15 Active',
    quote: '“Champa Gali regulars order oat iced lattes daily.”',
    supplier: 'Southfield Dairy',
  },
  {
    id: 'm12',
    lat: 28.518,
    lng: 77.2045,
    name: 'Rose Cafe',
    area: 'Saket',
    status: 'trial_completed',
    volume: 'Cortado verified',
    barista: 'Simran L.',
    rating: 4.6,
    supplier: 'Southfield Dairy',
  },
  {
    id: 'm13',
    lat: 28.5215,
    lng: 77.209,
    name: 'Soho Bistro',
    area: 'Saket',
    status: 'delivered',
    volume: 'Kit in testing',
    supplier: 'Southfield Dairy',
  },

  // Lajpat Nagar & Defence Colony Cluster (South-East Delhi)
  {
    id: 'm14',
    lat: 28.569,
    lng: 77.2435,
    name: 'Copper Kettle',
    area: 'Lajpat Nagar',
    status: 'reordered',
    volume: '24 L/wk',
    barista: 'Manoj T.',
    rating: 4.6,
    standingPO: 'Net-15 Active',
    quote: '“Great in milk drinks, solid Net-15 case pricing.”',
    supplier: 'Eastline Supply',
  },
  {
    id: 'm15',
    lat: 28.5725,
    lng: 77.234,
    name: 'Colocal Def Col',
    area: 'Lajpat Nagar',
    status: 'reordered',
    volume: '38 L/wk',
    barista: 'Tanvi M.',
    rating: 4.9,
    standingPO: 'Standing PO',
    quote: '“Microfoam matches our craft chocolate drinks.”',
    supplier: 'Eastline Supply',
  },
  {
    id: 'm16',
    lat: 28.5705,
    lng: 77.2315,
    name: 'Defence Bakery Cafe',
    area: 'Lajpat Nagar',
    status: 'trial_completed',
    volume: 'Cappuccino tested',
    barista: 'Rishi K.',
    rating: 4.5,
    supplier: 'Eastline Supply',
  },

  // Kamla Nagar / North Campus Cluster
  {
    id: 'm17',
    lat: 28.6835,
    lng: 77.2085,
    name: 'Second Crack Coffee',
    area: 'Kamla Nagar',
    status: 'reordered',
    volume: '26 L/wk',
    barista: 'Divya R.',
    rating: 4.7,
    standingPO: 'Net-15 Active',
    quote: '“Silky microfoam and zero curdling with acidic roasts.”',
    supplier: 'Northgate Dairy',
  },
  {
    id: 'm18',
    lat: 28.6805,
    lng: 77.205,
    name: 'Slow Sip Studio',
    area: 'Kamla Nagar',
    status: 'trial_completed',
    volume: 'Flat white trial',
    barista: 'Arun K.',
    rating: 4.6,
    supplier: 'Northgate Dairy',
  },
  {
    id: 'm19',
    lat: 28.6855,
    lng: 77.203,
    name: "Rico's North Campus",
    area: 'Kamla Nagar',
    status: 'delivered',
    volume: 'Delivered via Northgate',
    supplier: 'Northgate Dairy',
  },

  // Rajouri Garden & West Delhi Cluster
  {
    id: 'm20',
    lat: 28.644,
    lng: 77.1225,
    name: 'West End Roastery',
    area: 'Rajouri Garden',
    status: 'reordered',
    volume: '28 L/wk',
    barista: 'Vikas N.',
    rating: 4.7,
    standingPO: 'Net-15 Active',
    quote: '“Big hit with young espresso purists in West Delhi.”',
    supplier: 'Northgate Dairy',
  },
  {
    id: 'm21',
    lat: 28.6385,
    lng: 77.1185,
    name: 'Café After Hours',
    area: 'Rajouri Garden',
    status: 'trial_completed',
    volume: 'Sensory rating 4.6',
    barista: 'Neha S.',
    rating: 4.6,
    supplier: 'Northgate Dairy',
  },

  // Vasant Kunj & Aerocity Cluster
  {
    id: 'm22',
    lat: 28.5185,
    lng: 77.1625,
    name: 'The Grammar Room',
    area: 'Vasant Kunj',
    status: 'reordered',
    volume: '34 L/wk',
    barista: 'Aman D.',
    rating: 4.9,
    standingPO: 'Standing Weekly PO',
    quote: '“Flawless latte art hold, zero aftertaste.”',
    supplier: 'Southfield Dairy',
  },
  {
    id: 'm23',
    lat: 28.5515,
    lng: 77.1215,
    name: 'Plum Aerocity',
    area: 'Vasant Kunj',
    status: 'trial_completed',
    volume: 'Barista trial done',
    barista: 'Karan J.',
    rating: 4.7,
    supplier: 'Southfield Dairy',
  },

  // Gurugram Corridor
  {
    id: 'm24',
    lat: 28.4965,
    lng: 77.0915,
    name: 'Brew & Bloom',
    area: 'Gurugram',
    status: 'reordered',
    volume: '32 L/wk',
    barista: 'Sahil P.',
    rating: 4.8,
    standingPO: 'Net-15 Active',
    quote: '“Cyber Hub tech commuters order repeat flat whites.”',
    supplier: 'Hill Roasters Logistics',
  },
  {
    id: 'm25',
    lat: 28.4725,
    lng: 77.0875,
    name: 'Di Ghent Cafe',
    area: 'Gurugram',
    status: 'trial_completed',
    volume: 'Cupping score 4.8',
    barista: 'Isha B.',
    rating: 4.8,
    supplier: 'Hill Roasters Logistics',
  },

  // Noida Corridor
  {
    id: 'm26',
    lat: 28.5715,
    lng: 77.3245,
    name: 'Roastery Coffee House',
    area: 'Noida',
    status: 'reordered',
    volume: '30 L/wk',
    barista: 'Nitin C.',
    rating: 4.8,
    standingPO: 'Net-15 Active',
    quote: '“Clean foam stretch, perfect for cortados.”',
    supplier: 'Lakeside Foods',
  },
  {
    id: 'm27',
    lat: 28.5685,
    lng: 77.3295,
    name: 'The Haven Cafe',
    area: 'Noida',
    status: 'trial_completed',
    volume: 'Trial kit active',
    barista: 'Meera P.',
    rating: 4.6,
    supplier: 'Lakeside Foods',
  },
];

const FUNNEL_STAGES = [
  { id: 'dispatched', num: '01', name: 'Dispatched', count: 120, pct: '100%', highlight: false },
  { id: 'delivered', num: '02', name: 'Delivered', count: 112, pct: '93.3%', highlight: false },
  { id: 'trials', num: '03', name: 'Tried', count: 86, pct: '76.8%', highlight: false },
  { id: 'feedback', num: '04', name: 'Reviewed', count: 67, pct: '77.9%', highlight: false },
  { id: 'reorders', num: '05', name: 'Weekly POs', count: 24, pct: '27.9%', highlight: true },
];

const FEEDBACK_ATTRS = [
  { label: 'Foam quality', score: 4.8, pct: 96, note: 'Approved for microfoam latte art' },
  { label: 'Steaming stability', score: 4.7, pct: 94, note: '0% splitting in light roasts' },
  { label: 'Taste in flat white', score: 4.6, pct: 92, note: 'Clean oat sweetness' },
  { label: 'Pricing perception', score: 4.1, pct: 82, note: 'Competitive with Net-15 tier' },
];

const WEEKLY_CHART = [
  { week: 'W1', litres: 180, cafes: 6, x: 18, y: 44 },
  { week: 'W2', litres: 340, cafes: 11, x: 64, y: 36 },
  { week: 'W3', litres: 560, cafes: 16, x: 110, y: 26 },
  { week: 'W4', litres: 720, cafes: 21, x: 156, y: 17 },
  { week: 'W5', litres: 840, cafes: 24, x: 202, y: 11, current: true },
  { week: 'W6', litres: 940, cafes: 27, x: 248, y: 6, projected: true },
];

const RECENT_ACTIVITIES = [
  {
    id: 'a1',
    time: '12m ago',
    icon: 'box',
    title: 'Trial kit delivered',
    cafe: 'Little Brew Room · Hauz Khas',
    badge: 'Route 4',
  },
  {
    id: 'a2',
    time: '48m ago',
    icon: 'star',
    title: 'Barista trial completed',
    cafe: 'Second Crack · Kamla Nagar',
    badge: '★ 4.9',
  },
  {
    id: 'a3',
    time: '4h ago',
    icon: 'repeat',
    title: 'First recurring order placed',
    cafe: 'Steam Theory · Connaught Place',
    badge: '32 L/wk PO',
  },
];

/* ─── INLINE SVGS: Clean Minimal Icons ───────────────────────────────────── */

/* ─── RESTROFLOW SAAS ICONS ──────────────────────────────────────────────── */
function SvgRailGrid() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function SvgRailStore() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SvgRailPackage() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function SvgRailUsers() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SvgRailAnalytics() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function SvgRailSettings() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function SvgRailLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function SvgSearch() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SvgOrderDoc() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function SvgCheckCircle() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function SvgTruck() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function SvgStarFilled() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#502B9A" stroke="#502B9A" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}


/* ─── KPI MINI-VISUALIZATIONS ────────────────────────────────────────────── */
function SvgCardSparkline() {
  return (
    <svg width="64" height="24" viewBox="0 0 64 24" fill="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points="0,24 0,18 12,16 24,14 36,10 48,7 64,2 64,24" fill="url(#heroSpark)" />
      <polyline points="0,18 12,16 24,14 36,10 48,7 64,2" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="64" cy="2" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}

function SvgCohortBars() {
  return (
    <svg width="56" height="24" viewBox="0 0 56 24" fill="none" style={{ display: 'block' }}>
      <rect x="2" y="16" width="6" height="8" rx="1.5" fill="#EAE7EF" />
      <rect x="11" y="13" width="6" height="11" rx="1.5" fill="#E2DFEC" />
      <rect x="20" y="10" width="6" height="14" rx="1.5" fill="#D3CDE2" />
      <rect x="29" y="7" width="6" height="17" rx="1.5" fill="#B9AFD2" />
      <rect x="38" y="4" width="6" height="20" rx="1.5" fill="#8E78BE" />
      <rect x="47" y="1" width="6" height="23" rx="1.5" fill="#502B9A" />
    </svg>
  );
}

function SvgRadialProgress({ pct = 93.3 }: { pct?: number }) {
  const radius = 12;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ position: 'relative', width: '30px', height: '30px', display: 'grid', placeItems: 'center' }}>
      <svg width="30" height="30" viewBox="0 0 30 30" style={{ display: 'block' }}>
        <circle cx="15" cy="15" r={radius} stroke="#F0EDF5" strokeWidth="2.8" fill="none" />
        <circle
          cx="15"
          cy="15"
          r={radius}
          stroke="#502B9A"
          strokeWidth="2.8"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 15 15)"
        />
      </svg>
      <span style={{ position: 'absolute', fontSize: '7.5px', fontWeight: 800, color: '#502B9A' }}>
        93%
      </span>
    </div>
  );
}

function SvgSensorySpark() {
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" fill="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sensoryGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#502B9A" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#502B9A" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points="0,24 0,16 12,14 24,10 36,7 48,4 60,2 60,24" fill="url(#sensoryGrad)" />
      <polyline points="0,16 12,14 24,10 36,7 48,4 60,2" fill="none" stroke="#502B9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="60" cy="2" r="2.5" fill="#502B9A" />
    </svg>
  );
}

function SvgGradientLogo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#502B9A" />
      <path d="M12 6a6 6 0 1 0 6 6h-6V6z" fill="#FFFFFF" />
      <circle cx="15.5" cy="8.5" r="1.5" fill="#F1ECF8" />
    </svg>
  );
}

function SvgBell() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function SvgDownload() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SvgChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SvgTimelineIcon({ name }: { name: string }) {
  switch (name) {
    case 'box':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case 'star':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#502B9A" stroke="#502B9A" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'repeat':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      );
    default:
      return null;
  }
}

function SvgKpiSparkline({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 52;
  const h = 14;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');
  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '52px', height: '14px', display: 'block' }}>
      <polygon points={areaPoints} fill="rgba(80, 43, 154, 0.08)" />
      <polyline points={points} fill="none" stroke="#502B9A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT: BrandDashboard
   ───────────────────────────────────────────────────────────────────────────── */
export function BrandDashboard() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinWrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // User interactive selection
  const [selectedCafe, setSelectedCafe] = useState<MapMarker>(DELHI_MARKERS[0]);
  const [hoveredMarker, setHoveredMarker] = useState<MapMarker | null>(null);
  const [activeWeekIndex, setActiveWeekIndex] = useState<number>(4); // W5 (current)
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [motionPhase, setMotionPhase] = useState<'entrance' | 'center' | 'exit'>('center');
  const [mapViewMode, setMapViewMode] = useState<'corridors' | 'routes'>('corridors');

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ─── Scroll-Driven Animation Implementation (GSAP + ScrollTrigger) ───────
     THE WHOLE DASHBOARD MOVES ACROSS SCREEN:
     • Phase 1 (0% - 33%): Glides from left side of screen into center
     • Phase 2 (33% - 67%): Settles in center of screen directly under stationary heading
     • Phase 3 (67% - 100%): Moves towards right side of screen and exits
     ────────────────────────────────────────────────────────────────────────── */
  useIsomorphicLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isMobile || prefersReducedMotion) {
      if (frameRef.current) gsap.set(frameRef.current, { clearProps: 'all' });
      return;
    }

    const section = sectionRef.current;
    const pinWrap = pinWrapRef.current;
    const frame = frameRef.current;
    if (!section || !pinWrap || !frame) return;

    const ctx = gsap.context(() => {
      const getTravelDistance = () => {
        const winW = window.innerWidth;
        const frameW = frame.offsetWidth || 1400;
        return Math.round((winW + frameW) / 2 + 100);
      };

      // Initial state: Off-screen to the left
      gsap.set(frame, {
        x: -getTravelDistance(),
        opacity: 0,
        scale: 0.97,
      });

      // Master Pinned Scroll-Driven Timeline
      const masterTL = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          id: 'dashboard-scroll-track',
          start: 'top top',
          end: () => `+=${window.innerHeight * 2.2}`,
          pin: pinWrap,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.33) setMotionPhase('entrance');
            else if (p <= 0.67) setMotionPhase('center');
            else setMotionPhase('exit');
          },
        },
      });

      // 1. Entrance: Glides from left of screen into center
      masterTL.to(frame, {
        x: 0,
        opacity: 1,
        scale: 1,
        ease: 'power2.out',
        duration: 0.33,
      });

      // 2. Settling & Center Dwell: Rests in center directly below stationary heading
      masterTL.to(frame, {
        x: 0,
        opacity: 1,
        scale: 1,
        ease: 'none',
        duration: 0.34,
      });

      // 3. Exit: Moves towards right side and exits off-screen
      masterTL.to(frame, {
        x: () => getTravelDistance(),
        opacity: 0,
        scale: 0.97,
        ease: 'power2.in',
        duration: 0.33,
      });
    }, section);

    return () => ctx.revert();
  }, [isMobile]);

  // Jump to phase helper for quick navigation pills
  const jumpToPhase = (phase: 'entrance' | 'center' | 'exit') => {
    setMotionPhase(phase);
    const st = ScrollTrigger.getById('dashboard-scroll-track');
    if (!st) return;
    const targetProgress = phase === 'entrance' ? 0.05 : phase === 'center' ? 0.50 : 0.95;
    const targetScroll = st.start + (st.end - st.start) * targetProgress;
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  };

  return (
    <section ref={sectionRef} className="bdb-section" id="dashboard" aria-label="Brand Analytics Dashboard Showcase">
      <div className="bdb-bg-ambient" aria-hidden="true" />

      {/* Main Pinned Stage */}
      <div ref={pinWrapRef} className="bdb-pin-wrap">
        <div className="bdb-container">
          {/* ─── SECTION HEADING BLOCK (Stationary Anchor) ─── */}
          <div className="bdb-editorial-header">
            {/* 1. Small Editorial Eyebrow */}
            <div className="bdb-eyebrow">
              <span className="bdb-eyebrow-pip" aria-hidden="true" />
              <span>BRAND INTELLIGENCE PLATFORM · LIVE CAMPAIGN TELEMETRY</span>
            </div>

            {/* 2. Strong Headline & Supporting Description Row */}
            <div className="bdb-header-row">
              <div className="bdb-title-wrap">
                <h2 className="bdb-title">
                  Live analytics <span className="bdb-title-purple">dashboard for brands.</span>
                </h2>
                <p className="bdb-sub">
                  Track trial dispatches, barista sensory ratings, and weekly reorders across your café network in real time.
                </p>
              </div>

              {/* Trajectory Phase Switcher (Interactive Pills) */}
             
            </div>
          </div>

          {/* ─── 3. THE DASHBOARD: VISUAL HERO OF THIS SECTION (Aspect Ratio ~2.65:1, 520px height) ─── */}
          <div ref={frameRef} className="bdb-viewport-frame">
            {/* ─── 1. Left Slim Navigation Rail (RestroFlow Aesthetic) ─── */}
            <nav className="bdb-nav-rail" aria-label="Brand Portal Navigation">
              <div className="bdb-rail-top">
                <div className="bdb-rail-brand-icon" title="Gradient Brand Intelligence">
                  <span className="bdb-rail-grid-dot" />
                  <span className="bdb-rail-grid-dot" />
                  <span className="bdb-rail-grid-dot" />
                  <span className="bdb-rail-grid-dot" />
                </div>

                <div className="bdb-rail-links">
                  <button type="button" className="bdb-rail-btn is-active" title="Campaign Dashboard">
                    <SvgRailGrid />
                  </button>
                  <button type="button" className="bdb-rail-btn" title="Café Network">
                    <SvgRailStore />
                  </button>
                  <button type="button" className="bdb-rail-btn" title="Trial Dispatches">
                    <SvgRailPackage />
                  </button>
                  <button type="button" className="bdb-rail-btn" title="Sensory Analytics">
                    <SvgRailAnalytics />
                  </button>
                  <button type="button" className="bdb-rail-btn" title="Baristas & Partners">
                    <SvgRailUsers />
                  </button>
                </div>
              </div>

              <div className="bdb-rail-bottom">
                <button type="button" className="bdb-rail-btn" title="3 Notifications">
                  <SvgBell />
                  <span className="bdb-rail-badge-dot" />
                </button>
                <button type="button" className="bdb-rail-btn" title="Settings">
                  <SvgRailSettings />
                </button>
                <button type="button" className="bdb-rail-btn" title="Log Out">
                  <SvgRailLogout />
                </button>
              </div>
            </nav>

            {/* ─── 2. Main Dashboard Content Column ─── */}
            <div className="bdb-main-content">
              {/* Top Application Bar */}
              <header className="bdb-top-app-bar">
                <div className="bdb-header-brand-info">
                  <span className="bdb-header-brand-title">Gradient Brand Portal</span>
                  <span className="bdb-header-brand-sub">{CAMPAIGN_META.product} · {CAMPAIGN_META.edition}</span>
                </div>

                {/* RestroFlow Sleek Search Input Pill */}
                <div className="bdb-header-search-pill">
                  <SvgSearch />
                  <span className="bdb-search-placeholder">Search corridors, cafés, roasts...</span>
                  <span className="bdb-search-kbd">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: '-0.5px', marginRight: '2px' }}>
                      <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                    </svg>K
                  </span>
                </div>

                {/* Right Controls */}
                <div className="bdb-header-right-group">
                  <div className="bdb-live-status-pill">
                    <span className="bdb-status-pulse-dot" />
                    <span>{CAMPAIGN_META.status}</span>
                  </div>

                  <div className="bdb-user-profile-pill">
                    <span className="bdb-user-profile-avatar">VR</span>
                    <div className="bdb-user-profile-text">
                      <span className="bdb-user-profile-name">George Daniel</span>
                      <span className="bdb-user-profile-role">Brand Manager</span>
                    </div>
                  </div>
                </div>
              </header>

              {/* ─── 3. Top 4 KPI Modular Cards (Enhanced Split Layout) ─── */}
              <div className="bdb-kpi-modular-grid">
                {/* Card 1: Purple Hero Card */}
                <div className="bdb-kpi-card bdb-kpi-hero-card">
                  <div className="bdb-kpi-card-top">
                    <div className="bdb-kpi-title-left">
                      <div className="bdb-kpi-icon-pill hero-icon-pill">
                        <SvgOrderDoc />
                      </div>
                      <span className="bdb-kpi-card-title hero-title">Weekly Reorders</span>
                    </div>
                    <span className="bdb-kpi-card-badge hero-badge">+27.9% Conv</span>
                  </div>

                  <div className="bdb-kpi-card-bottom">
                    <div className="bdb-kpi-val-group">
                      <div className="bdb-kpi-main-val hero-val">
                        {CAMPAIGN_META.weeklyReorders} <span className="bdb-kpi-unit hero-unit">cafés</span>
                      </div>
                      <span className="bdb-kpi-sub-pill hero-sub-pill">
                        {CAMPAIGN_META.estimatedARR} ARR
                      </span>
                    </div>
                    <div className="bdb-kpi-viz">
                      <SvgCardSparkline />
                    </div>
                  </div>
                </div>

                {/* Card 2: Trials Completed */}
                <div className="bdb-kpi-card">
                  <div className="bdb-kpi-card-top">
                    <div className="bdb-kpi-title-left">
                      <div className="bdb-kpi-icon-pill">
                        <SvgCheckCircle />
                      </div>
                      <span className="bdb-kpi-card-title">Trials Completed</span>
                    </div>
                    <span className="bdb-kpi-card-badge badge-green">▲ +14 this wk</span>
                  </div>

                  <div className="bdb-kpi-card-bottom">
                    <div className="bdb-kpi-val-group">
                      <div className="bdb-kpi-main-val">
                        {CAMPAIGN_META.trialsCompleted} <span className="bdb-kpi-unit">baristas</span>
                      </div>
                      <span className="bdb-kpi-sub-pill">
                        76.8% trial rate
                      </span>
                    </div>
                    <div className="bdb-kpi-viz">
                      <SvgCohortBars />
                    </div>
                  </div>
                </div>

                {/* Card 3: Kits Delivered */}
                <div className="bdb-kpi-card">
                  <div className="bdb-kpi-card-top">
                    <div className="bdb-kpi-title-left">
                      <div className="bdb-kpi-icon-pill">
                        <SvgTruck />
                      </div>
                      <span className="bdb-kpi-card-title">Kits Delivered</span>
                    </div>
                    <span className="bdb-kpi-card-badge badge-purple">93.3% Fulfilled</span>
                  </div>

                  <div className="bdb-kpi-card-bottom">
                    <div className="bdb-kpi-val-group">
                      <div className="bdb-kpi-main-val">
                        {CAMPAIGN_META.deliveredKits} <span className="bdb-kpi-unit">/ {CAMPAIGN_META.totalKits} kits</span>
                      </div>
                      <span className="bdb-kpi-sub-pill">
                        8 kits in transit
                      </span>
                    </div>
                    <div className="bdb-kpi-viz">
                      <SvgRadialProgress pct={93.3} />
                    </div>
                  </div>
                </div>

                {/* Card 4: Sensory Rating */}
                <div className="bdb-kpi-card">
                  <div className="bdb-kpi-card-top">
                    <div className="bdb-kpi-title-left">
                      <div className="bdb-kpi-icon-pill">
                        <SvgStarFilled />
                      </div>
                      <span className="bdb-kpi-card-title">Sensory Rating</span>
                    </div>
                    <span className="bdb-kpi-card-badge badge-purple">96% Approved</span>
                  </div>

                  <div className="bdb-kpi-card-bottom">
                    <div className="bdb-kpi-val-group">
                      <div className="bdb-kpi-main-val">
                        ★ 4.8 <span className="bdb-kpi-unit">/ 5.0</span>
                      </div>
                      <span className="bdb-kpi-sub-pill">
                        {CAMPAIGN_META.feedbackReceived} verified reviews
                      </span>
                    </div>
                    <div className="bdb-kpi-viz">
                      <SvgSensorySpark />
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── 4. Main 3-Column Body Grid (RestroFlow Clean SaaS Proportions) ─── */}
              <div className="bdb-body-grid">
                {/* ═══════════════════════════════════════════════════════════
                    COLUMN 1: CONVERSION FUNNEL & REORDER VOLUME
                    ═══════════════════════════════════════════════════════════ */}
                <div className="bdb-col bdb-col-left">
                  {/* 1. Trial Conversion Funnel */}
                  <div className="bdb-card bdb-funnel-card">
                    <div className="bdb-card-header">
                      <div>
                        <h3 className="bdb-card-title">Trial Conversion Funnel</h3>
                        <span className="bdb-card-sub">Sampling seed to recurring weekly orders</span>
                      </div>
                      <span className="bdb-card-meta-pill">Full Cycle</span>
                    </div>

                    <div className="bdb-funnel-list">
                      {FUNNEL_STAGES.map((stg) => (
                        <div key={stg.id} className={`bdb-funnel-row ${stg.highlight ? 'is-highlight' : ''}`}>
                          <div className="bdb-f-left">
                            <span className="bdb-f-idx">{stg.num}</span>
                            <span className="bdb-f-name">{stg.name}</span>
                          </div>
                          <div className="bdb-f-bar-wrap">
                            <div
                              className={`bdb-f-bar-fill ${stg.highlight ? 'bar-purple' : 'bar-neutral'}`}
                              style={{ width: `${(stg.count / 120) * 100}%` }}
                            />
                          </div>
                          <div className="bdb-f-metrics">
                            <span className="bdb-f-count">{stg.count}</span>
                            <span className="bdb-f-pct">{stg.pct}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Weekly Reorder Volume (RestroFlow-style vertical bars with active week tag) */}
                  <div className="bdb-card bdb-reorder-card">
                    <div className="bdb-card-header">
                      <div>
                        <h3 className="bdb-card-title">Weekly Reorder Volume</h3>
                        <span className="bdb-card-sub">Litres dispatched & repeat velocity</span>
                      </div>
                      <span className="bdb-card-meta-pill text-purple">{CAMPAIGN_META.weeklyVolumeLitres} L/wk</span>
                    </div>

                    {/* Concise Analytics Headline */}
                    <div className="bdb-reorder-headline">
                      <div className="bdb-rh-main">
                        <span className="bdb-rh-number">{WEEKLY_CHART[activeWeekIndex].litres} L</span>
                        <span className="bdb-rh-period">
                          {WEEKLY_CHART[activeWeekIndex].week} {WEEKLY_CHART[activeWeekIndex].projected ? 'forecast' : 'orders'}
                        </span>
                      </div>
                      <span className="bdb-rh-cafes">
                        {WEEKLY_CHART[activeWeekIndex].cafes} repeat cafés
                      </span>
                    </div>

                    {/* RestroFlow-style Vertical Bar Chart with Active Week Floating Pill */}
                    <div className="bdb-bars-stage">
                      <div className="bdb-bars-grid">
                        {WEEKLY_CHART.map((wc, idx) => {
                          const isCurrent = idx === activeWeekIndex;
                          const isProjected = wc.projected;
                          const heightPct = Math.max(16, Math.round((wc.litres / 1000) * 100));

                          return (
                            <div
                              key={wc.week}
                              className={`bdb-bar-col ${isCurrent ? 'is-active' : ''} ${isProjected ? 'is-projected' : ''}`}
                              onClick={() => setActiveWeekIndex(idx)}
                              role="button"
                              tabIndex={0}
                              title={`${wc.week}: ${wc.litres} L (${wc.cafes} repeat cafés)`}
                            >
                              {isCurrent && (
                                <span className="bdb-bar-floating-tag">{wc.litres}L</span>
                              )}
                              <div className="bdb-bar-track">
                                <div
                                  className={`bdb-bar-fill ${isProjected ? 'is-projected' : isCurrent ? 'is-current' : ''}`}
                                  style={{ height: `${heightPct}%` }}
                                />
                              </div>
                              <span className="bdb-bar-label">{wc.week}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Summary Stat Footer */}
                    <div className="bdb-reorder-stat-row">
                      <span><b>24</b> Repeat Cafés</span>
                      <span className="bdb-stat-dot">·</span>
                      <span><b>36L</b> Avg/wk</span>
                      <span className="bdb-stat-dot">·</span>
                      <span className="text-purple"><b>₹2.18L</b>/mo ARR</span>
                    </div>
                  </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    COLUMN 2: CENTRAL DELHI REAL MAP (KEPT AS IS)
                    ═══════════════════════════════════════════════════════════ */}
                <div className="bdb-col bdb-col-center">
                  <div className="bdb-card bdb-map-card">
                    <div className="bdb-card-header">
                      <div className="bdb-map-header-left">
                        <h3 className="bdb-card-title">Delhi NCR Café Distribution</h3>
                        <span className="bdb-card-sub">120 trial kits seeded across 9 capital corridors</span>
                      </div>

                      {/* Clean Minimal Legend */}
                      <div className="bdb-map-legend">
                        <span className="bdb-legend-item">
                          <span className="bdb-legend-dot dot-delivered" /> Delivered (112)
                        </span>
                        <span className="bdb-legend-item">
                          <span className="bdb-legend-dot dot-tried" /> Tried (86)
                        </span>
                        <span className="bdb-legend-item">
                          <span className="bdb-legend-dot dot-reordered" /> Reordered (24)
                        </span>
                      </div>
                    </div>

                    {/* Real Leaflet Map Container */}
                    <div className="bdb-map-stage">
                      <DelhiRealMap
                        cafes={DELHI_MARKERS}
                        selectedCafe={selectedCafe}
                        onSelectCafe={setSelectedCafe}
                        hoveredCafe={hoveredMarker}
                        onHoverCafe={setHoveredMarker}
                        mapViewMode={mapViewMode}
                        onChangeViewMode={setMapViewMode}
                      />
                    </div>
                  </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    COLUMN 3: BARISTA FEEDBACK & MINIMAL TIMELINE TELEMETRY
                    ═══════════════════════════════════════════════════════════ */}
                <div className="bdb-col bdb-col-right">
                  {/* 1. Barista Feedback (Minimalist Sensory Ratings) */}
                  <div className="bdb-card bdb-feedback-card">
                    <div className="bdb-card-header">
                      <div>
                        <h3 className="bdb-card-title">Barista Feedback</h3>
                        <span className="bdb-card-sub">67 verified trials</span>
                      </div>
                      <div className="bdb-feedback-header-badge">
                        <span className="bdb-overall-stars">★ 4.8</span>
                        <span className="bdb-overall-max">/ 5.0</span>
                      </div>
                    </div>

                    <div className="bdb-feedback-list">
                      {FEEDBACK_ATTRS.map((attr) => (
                        <div key={attr.label} className="bdb-attr-compact">
                          <div className="bdb-attr-meta">
                            <span className="bdb-attr-name">{attr.label}</span>
                            <span className="bdb-attr-num">{attr.score}</span>
                          </div>
                          <div className="bdb-attr-track">
                            <div className="bdb-attr-fill" style={{ width: `${attr.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Featured Barista Review Quote */}
                    <div className="bdb-quote-card">
                      <p className="bdb-quote-text">
                        “Holds a rosetta better than the oat milk we use now.”
                      </p>
                      <span className="bdb-quote-author">
                        Aditya K. · Head Barista, Little Brew Room
                      </span>
                    </div>
                  </div>

                  {/* 2. Live Commercial Telemetry (Sleek Borderless Timeline) */}
                  <div className="bdb-card bdb-activity-card">
                    <div className="bdb-card-header">
                      <div>
                        <h3 className="bdb-card-title">Live Commercial Telemetry</h3>
                        <span className="bdb-card-sub">Route dispatches & POs</span>
                      </div>
                      <span className="bdb-live-tag">
                        <span className="bdb-live-dot" /> Live
                      </span>
                    </div>

                    <div className="bdb-telemetry-feed">
                      {RECENT_ACTIVITIES.map((act, idx) => (
                        <div key={act.id} className="bdb-telemetry-row">
                          <div className="bdb-timeline-marker">
                            <div className="bdb-timeline-dot">
                              <SvgTimelineIcon name={act.icon} />
                            </div>
                            {idx < RECENT_ACTIVITIES.length - 1 && <div className="bdb-timeline-line" />}
                          </div>
                          <div className="bdb-timeline-body">
                            <div className="bdb-timeline-header">
                              <span className="bdb-timeline-title">{act.title}</span>
                              <span className="bdb-timeline-time">{act.time}</span>
                            </div>
                            <div className="bdb-timeline-meta">
                              <span className="bdb-timeline-cafe">{act.cafe}</span>
                              <span className="bdb-timeline-badge">{act.badge}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
