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

interface MapMarker {
  id: string;
  name: string;
  area: string;
  x: number;
  y: number;
  status: 'reordered' | 'trial_completed' | 'delivered';
  volume?: string;
  barista?: string;
  rating?: number;
  standingPO?: string;
  quote?: string;
  supplier?: string;
}

const DELHI_MARKERS: MapMarker[] = [
  // Hauz Khas Cluster (South Delhi Anchor)
  {
    id: 'm1',
    name: 'Little Brew Room',
    area: 'Hauz Khas',
    x: 378,
    y: 164,
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
    name: 'Tiny Tamper',
    area: 'Hauz Khas',
    x: 398,
    y: 154,
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
    name: 'Blue Tokai HKV',
    area: 'Hauz Khas',
    x: 362,
    y: 174,
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
    name: "Elma's Bakery & Coffee",
    area: 'Hauz Khas',
    x: 412,
    y: 166,
    status: 'trial_completed',
    volume: 'Testing batch 2',
    barista: 'Zoya K.',
    rating: 4.7,
    supplier: 'Sharma Dairy',
  },
  {
    id: 'm5',
    name: 'Coast Cafe',
    area: 'Hauz Khas',
    x: 382,
    y: 182,
    status: 'delivered',
    volume: 'Kit delivered',
    supplier: 'Sharma Dairy',
  },

  // Connaught Place Cluster (Central Delhi Commercial Heart)
  {
    id: 'm6',
    name: 'Steam Theory',
    area: 'Connaught Place',
    x: 385,
    y: 104,
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
    name: 'United Coffee House',
    area: 'Connaught Place',
    x: 408,
    y: 92,
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
    name: 'Barista Heritage CP',
    area: 'Connaught Place',
    x: 368,
    y: 112,
    status: 'trial_completed',
    volume: 'Latte art approved',
    barista: 'Pooja T.',
    rating: 4.6,
    supplier: 'Old Market Traders',
  },
  {
    id: 'm9',
    name: 'The Chai Story CP',
    area: 'Connaught Place',
    x: 416,
    y: 116,
    status: 'delivered',
    volume: 'Trial kit active',
    supplier: 'Yamuna Provisions',
  },

  // Saket & Saidulajab / Champa Gali Cluster (South Delhi)
  {
    id: 'm10',
    name: 'Morning Ritual',
    area: 'Saket',
    x: 386,
    y: 222,
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
    name: 'Jugmug Thela',
    area: 'Saket',
    x: 408,
    y: 214,
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
    name: 'Rose Cafe',
    area: 'Saket',
    x: 366,
    y: 232,
    status: 'trial_completed',
    volume: 'Cortado verified',
    barista: 'Simran L.',
    rating: 4.6,
    supplier: 'Southfield Dairy',
  },
  {
    id: 'm13',
    name: 'Soho Bistro',
    area: 'Saket',
    x: 422,
    y: 232,
    status: 'delivered',
    volume: 'Kit in testing',
    supplier: 'Southfield Dairy',
  },

  // Lajpat Nagar & Defence Colony Cluster (South-East Delhi)
  {
    id: 'm14',
    name: 'Copper Kettle',
    area: 'Lajpat Nagar',
    x: 468,
    y: 148,
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
    name: 'Colocal Def Col',
    area: 'Lajpat Nagar',
    x: 486,
    y: 138,
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
    name: 'Defence Bakery Cafe',
    area: 'Lajpat Nagar',
    x: 452,
    y: 160,
    status: 'trial_completed',
    volume: 'Cappuccino tested',
    barista: 'Rishi K.',
    rating: 4.5,
    supplier: 'Eastline Supply',
  },

  // Kamla Nagar / North Campus Cluster
  {
    id: 'm17',
    name: 'Second Crack Coffee',
    area: 'Kamla Nagar',
    x: 360,
    y: 48,
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
    name: 'Slow Sip Studio',
    area: 'Kamla Nagar',
    x: 338,
    y: 56,
    status: 'trial_completed',
    volume: 'Flat white trial',
    barista: 'Arun K.',
    rating: 4.6,
    supplier: 'Northgate Dairy',
  },
  {
    id: 'm19',
    name: "Rico's North Campus",
    area: 'Kamla Nagar',
    x: 382,
    y: 44,
    status: 'delivered',
    volume: 'Delivered via Northgate',
    supplier: 'Northgate Dairy',
  },

  // Rajouri Garden & West Delhi Cluster
  {
    id: 'm20',
    name: 'West End Roastery',
    area: 'Rajouri Garden',
    x: 245,
    y: 110,
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
    name: 'Café After Hours',
    area: 'Rajouri Garden',
    x: 226,
    y: 124,
    status: 'trial_completed',
    volume: 'Sensory rating 4.6',
    barista: 'Neha S.',
    rating: 4.6,
    supplier: 'Northgate Dairy',
  },

  // Vasant Kunj & Aerocity Cluster
  {
    id: 'm22',
    name: 'The Grammar Room',
    area: 'Vasant Kunj',
    x: 295,
    y: 200,
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
    name: 'Plum Aerocity',
    area: 'Vasant Kunj',
    x: 274,
    y: 186,
    status: 'trial_completed',
    volume: 'Barista trial done',
    barista: 'Karan J.',
    rating: 4.7,
    supplier: 'Southfield Dairy',
  },

  // Gurugram Corridor
  {
    id: 'm24',
    name: 'Brew & Bloom',
    area: 'Gurugram',
    x: 172,
    y: 236,
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
    name: 'Di Ghent Cafe',
    area: 'Gurugram',
    x: 148,
    y: 246,
    status: 'trial_completed',
    volume: 'Cupping score 4.8',
    barista: 'Isha B.',
    rating: 4.8,
    supplier: 'Hill Roasters Logistics',
  },

  // Noida Corridor
  {
    id: 'm26',
    name: 'Roastery Coffee House',
    area: 'Noida',
    x: 550,
    y: 170,
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
    name: 'The Haven Cafe',
    area: 'Noida',
    x: 574,
    y: 184,
    status: 'trial_completed',
    volume: 'Trial kit active',
    barista: 'Meera P.',
    rating: 4.6,
    supplier: 'Lakeside Foods',
  },
];

const DELHI_PARKS = [
  { name: 'Sanjay Van / Mehrauli Forest', d: 'M 285,182 C 305,178 328,188 324,208 C 320,224 296,224 280,214 C 274,198 280,188 285,182 Z' },
  { name: 'Hauz Khas Deer Park & Lake', d: 'M 364,158 C 378,156 386,163 383,172 C 376,178 362,176 360,168 C 358,162 362,158 364,158 Z' },
  { name: 'Central Ridge Reserve', d: 'M 318,108 C 334,103 344,113 341,128 C 337,142 324,142 314,133 C 309,118 313,110 318,108 Z' },
  { name: 'Yamuna Bio Park (North)', d: 'M 418,28 C 434,26 441,33 439,46 C 434,53 421,53 417,43 C 414,33 417,28 418,28 Z' },
];

const CORRIDOR_CLUSTERS = [
  { name: 'Hauz Khas', count: 22, x: 434, y: 160 },
  { name: 'Connaught Place', count: 12, x: 442, y: 92 },
  { name: 'Saket', count: 14, x: 442, y: 228 },
  { name: 'Lajpat Nagar', count: 14, x: 508, y: 142 },
  { name: 'Kamla Nagar', count: 22, x: 405, y: 46 },
  { name: 'Rajouri Garden', count: 8, x: 202, y: 116 },
  { name: 'Vasant Kunj', count: 10, x: 265, y: 200 },
  { name: 'Gurugram', count: 12, x: 135, y: 242 },
  { name: 'Noida', count: 6, x: 598, y: 170 },
];

const HIGHWAY_SHIELDS = [
  { label: 'NH 48', x: 218, y: 220 },
  { label: 'DND', x: 482, y: 164 },
  { label: 'NH 44', x: 370, y: 22 },
  { label: 'NH 19', x: 478, y: 218 },
];

const SUPPLIER_HUBS = [
  { name: 'Sharma Dairy', area: 'Central Hub', x: 410, y: 130 },
  { name: 'Fresh Lane Foods', area: 'South Hub', x: 350, y: 180 },
  { name: 'Hill Roasters', area: 'Gurugram Route', x: 210, y: 220 },
  { name: 'Northgate Dairy', area: 'North Hub', x: 330, y: 65 },
  { name: 'Eastline Supply', area: 'East Hub', x: 510, y: 160 },
  { name: 'Southfield Dairy', area: 'Southwest Hub', x: 280, y: 230 },
];

const FUNNEL_STAGES = [
  { id: 'dispatched', name: 'Dispatched', count: 120, pct: '100%', highlight: false },
  { id: 'delivered', name: 'Delivered', count: 112, pct: '93.3%', highlight: false },
  { id: 'trials', name: 'Tried', count: 86, pct: '76.8%', highlight: false },
  { id: 'feedback', name: 'Reviewed', count: 67, pct: '77.9%', highlight: false },
  { id: 'reorders', name: 'Weekly reorders', count: 24, pct: '27.9%', highlight: true },
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
    meta: 'Sharma Dairy route dispatch',
  },
  {
    id: 'a2',
    time: '48m ago',
    icon: 'star',
    title: 'Barista trial completed',
    cafe: 'Second Crack · Kamla Nagar',
    meta: 'Steamed 8 flat whites · Rated ★ 4.9',
  },
  {
    id: 'a3',
    time: '4h ago',
    icon: 'repeat',
    title: 'First recurring order placed',
    cafe: 'Steam Theory · Connaught Place',
    meta: '32 L/wk standing Net-15 PO',
  },
];

/* ─── INLINE SVGS: Clean Minimal Icons ───────────────────────────────────── */
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
                  Watch your trial turn into <span className="bdb-title-purple">weekly orders.</span>
                </h2>
                <p className="bdb-sub">
                  Every kit, every barista's verdict, every café that starts ordering — all the signals behind your brand's growth, in one place.
                </p>
              </div>

              {/* Trajectory Phase Switcher (Interactive Pills) */}
              <div className="bdb-bay-switcher" role="tablist" aria-label="Dashboard Motion Trajectory">
                <button
                  type="button"
                  role="tab"
                  aria-selected={motionPhase === 'entrance'}
                  className={`bdb-bay-btn ${motionPhase === 'entrance' ? 'is-active' : ''}`}
                  onClick={() => jumpToPhase('entrance')}
                  title="Coming from the left side of the screen"
                >
                  <span className="bdb-bay-dot" />
                  <span>← From Left</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={motionPhase === 'center'}
                  className={`bdb-bay-btn ${motionPhase === 'center' ? 'is-active' : ''}`}
                  onClick={() => jumpToPhase('center')}
                  title="Centered on screen"
                >
                  <span className="bdb-bay-dot" />
                  <span>● In Center</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={motionPhase === 'exit'}
                  className={`bdb-bay-btn ${motionPhase === 'exit' ? 'is-active' : ''}`}
                  onClick={() => jumpToPhase('exit')}
                  title="Exiting towards the right side of the screen"
                >
                  <span className="bdb-bay-dot" />
                  <span>Exit Right →</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─── 3. THE DASHBOARD: VISUAL HERO OF THIS SECTION (Aspect Ratio ~2.65:1, 520px height) ─── */}
          <div ref={frameRef} className="bdb-viewport-frame">
            {/* Top Application Bar */}
            <header className="bdb-app-header">
              <div className="bdb-nav-top">
                <div className="bdb-nav-left">
                  <div className="bdb-logo-group">
                    <SvgGradientLogo />
                    <span className="bdb-logo-text">Gradient</span>
                  </div>

                  <span className="bdb-nav-divider" aria-hidden="true" />

                  <div className="bdb-brand-tag">
                    <span className="bdb-brand-avatar">OL</span>
                    <span className="bdb-brand-name">{CAMPAIGN_META.brand}</span>
                  </div>

                  <div className="bdb-campaign-dropdown">
                    <span className="bdb-campaign-chip">{CAMPAIGN_META.product} (Q4 Launch)</span>
                    <SvgChevronDown className="bdb-chip-icon" />
                  </div>
                </div>

                <div className="bdb-nav-right">
                  <div className="bdb-live-status-pill">
                    <span className="bdb-status-pulse-dot" />
                    <span>{CAMPAIGN_META.status}</span>
                  </div>

                  <div className="bdb-date-pill">
                    <span>{CAMPAIGN_META.dateRange}</span>
                    <SvgChevronDown className="bdb-chip-icon" />
                  </div>

                  <button type="button" className="bdb-export-btn" title="Export CSV / PDF Report">
                    <SvgDownload />
                    <span>Export</span>
                  </button>

                  <div className="bdb-bell-icon" title="3 Notifications">
                    <SvgBell />
                    <span className="bdb-bell-dot" />
                  </div>

                  <div className="bdb-user-profile" title="Signed in as Brand Administrator">
                    <span className="bdb-user-avatar">VR</span>
                  </div>
                </div>
              </div>

              {/* KPI Summary Strip: Clean, Horizontally Balanced Stripe/Ramp Hierarchy */}
              <div className="bdb-kpi-bar">
                {KPI_METRICS.map((kpi) => (
                  <div key={kpi.id} className="bdb-kpi-cell">
                    <div className="bdb-kpi-meta-row">
                      <div className="bdb-kpi-label-group">
                        <span className="bdb-kpi-idx">{kpi.num}</span>
                        <span className="bdb-kpi-label">{kpi.label}</span>
                      </div>
                      <span className="bdb-kpi-sub">{kpi.meta}</span>
                    </div>

                    <div className="bdb-kpi-main-row">
                      <span className="bdb-kpi-val">{kpi.value}</span>

                      {/* 01: Clean proportional progress indicator */}
                      {kpi.type === 'progress' && (
                        <div className="bdb-kpi-track-wrap">
                          <div className="bdb-kpi-track-fill" style={{ width: `${kpi.progress}%` }} />
                        </div>
                      )}

                      {/* 02: Subtle weekly trend chip */}
                      {kpi.type === 'badge' && kpi.badge && (
                        <span className="bdb-kpi-badge">{kpi.badge}</span>
                      )}

                      {/* 03: Minimal sparkline indicator */}
                      {kpi.type === 'sparkline' && kpi.trend && (
                        <SvgKpiSparkline data={kpi.trend} />
                      )}

                      {/* 04: Revenue ARR Tag */}
                      {kpi.type === 'badge_purple' && kpi.badge && (
                        <span className="bdb-kpi-badge badge-purple">{kpi.badge}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </header>

            {/* Main 3-Column Body Grid (Proportioned, Crisp Borders, Zero Overflow) */}
            <div className="bdb-body-grid">
              {/* ═══════════════════════════════════════════════════════════
                  COLUMN 1: CONVERSION FUNNEL & REORDER ANALYTICS
                  ═══════════════════════════════════════════════════════════ */}
              <div className="bdb-col bdb-col-left">
                {/* 1. Trial Conversion Funnel (Precise Proportional Bars) */}
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
                        <span className="bdb-f-name">{stg.name}</span>
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

                {/* 2. Weekly Reorder Volume (Professional Trend Analytics) */}
                <div className="bdb-card bdb-reorder-card">
                  <div className="bdb-card-header">
                    <div>
                      <h3 className="bdb-card-title">Weekly Reorder Volume</h3>
                      <span className="bdb-card-sub">Litres dispatched & repeat velocity</span>
                    </div>
                    <span className="bdb-card-meta-pill text-purple">840 L/wk</span>
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

                  {/* Clean SVG Trend Chart with Subtle Gridlines */}
                  <div className="bdb-chart-container">
                    <svg viewBox="0 0 260 54" preserveAspectRatio="none" className="bdb-trend-svg">
                      {/* Subtle Horizontal Reference Gridlines */}
                      <line x1="0" y1="12" x2="260" y2="12" stroke="#F1EDF6" strokeWidth="0.8" strokeDasharray="3 3" />
                      <line x1="0" y1="30" x2="260" y2="30" stroke="#F1EDF6" strokeWidth="0.8" strokeDasharray="3 3" />
                      <line x1="0" y1="48" x2="260" y2="48" stroke="#F1EDF6" strokeWidth="0.8" />

                      {/* Restrained Area Gradient Fill */}
                      <polygon
                        points="18,48 18,44 64,36 110,26 156,17 202,11 248,6 248,48"
                        fill="rgba(80, 43, 154, 0.05)"
                      />

                      {/* Actual Data Series Line */}
                      <path
                        d="M 18,44 L 64,36 L 110,26 L 156,17 L 202,11"
                        fill="none"
                        stroke="#502B9A"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Projected Segment (Dashed) */}
                      <path
                        d="M 202,11 L 248,6"
                        fill="none"
                        stroke="#502B9A"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        strokeLinecap="round"
                        opacity="0.5"
                      />

                      {/* Data Point Nodes */}
                      {WEEKLY_CHART.map((wc, idx) => (
                        <circle
                          key={wc.week}
                          cx={wc.x}
                          cy={wc.y}
                          r={activeWeekIndex === idx ? 3.8 : 2.4}
                          fill={activeWeekIndex === idx ? '#502B9A' : '#FFFFFF'}
                          stroke="#502B9A"
                          strokeWidth={activeWeekIndex === idx ? 2 : 1.2}
                          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                          onClick={() => setActiveWeekIndex(idx)}
                        />
                      ))}
                    </svg>

                    {/* Minimal Axis Labels */}
                    <div className="bdb-chart-axis">
                      {WEEKLY_CHART.map((wc, idx) => (
                        <button
                          key={wc.week}
                          type="button"
                          className={`bdb-axis-btn ${activeWeekIndex === idx ? 'is-active' : ''} ${wc.projected ? 'is-projected' : ''}`}
                          onClick={() => setActiveWeekIndex(idx)}
                        >
                          {wc.week}
                        </button>
                      ))}
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
                  COLUMN 2: DELHI NCR CAFÉ DISTRIBUTION MAP (Centerpiece)
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

                  {/* SVG Map Canvas with Integrated Lower Telemetry Deck */}
                  <div className="bdb-map-stage">
                    {/* Lamar-style Top Floating Controls Overlay */}
                    <div className="bdb-map-ctrl-top-left">
                      <div className="bdb-mode-toggle" role="tablist" aria-label="Map View Mode">
                        <button
                          type="button"
                          role="tab"
                          aria-selected={mapViewMode === 'corridors'}
                          className={`bdb-mode-btn ${mapViewMode === 'corridors' ? 'is-active' : ''}`}
                          onClick={() => setMapViewMode('corridors')}
                        >
                          ● Corridors
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={mapViewMode === 'routes'}
                          className={`bdb-mode-btn ${mapViewMode === 'routes' ? 'is-active' : ''}`}
                          onClick={() => setMapViewMode('routes')}
                        >
                          Network Hubs
                        </button>
                      </div>
                    </div>

                    <div className="bdb-map-ctrl-top-right">
                      <span className="bdb-location-pill">📍 Delhi NCR · Central Hub</span>
                      <div className="bdb-zoom-ctrl" role="group" aria-label="Map Zoom">
                        <button type="button" className="bdb-zoom-btn" title="Zoom in">+</button>
                        <button type="button" className="bdb-zoom-btn" title="Zoom out">−</button>
                      </div>
                    </div>

                    <svg viewBox="0 0 760 320" className="bdb-delhi-svg" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <radialGradient id="mapGlowDelhi" cx="50%" cy="50%" r="55%">
                          <stop offset="0%" stopColor="#502B9A" stopOpacity="0.04" />
                          <stop offset="60%" stopColor="#502B9A" stopOpacity="0.01" />
                          <stop offset="100%" stopColor="#502B9A" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      <rect width="760" height="320" fill="url(#mapGlowDelhi)" />

                      {/* Lamar-style Soft Forest / Ridge Reserves */}
                      <g className="bdb-map-parks" opacity="0.9">
                        {DELHI_PARKS.map((park) => (
                          <path key={park.name} d={park.d} className="bdb-map-park" />
                        ))}
                      </g>

                      {/* Delhi NCT State Boundary Polygon (Simplified) */}
                      <path
                        d="M 370,15 C 410,12 445,30 475,55 C 505,80 520,120 525,165 C 530,210 500,255 450,278 C 400,295 330,285 280,260 C 230,235 195,190 185,145 C 175,95 240,40 370,15 Z"
                        fill="rgba(80, 43, 154, 0.015)"
                        stroke="rgba(80, 43, 154, 0.18)"
                        strokeWidth="1.2"
                        strokeDasharray="4 4"
                      />

                      {/* Yamuna River Ribbon (North to South-East) */}
                      <path
                        d="M 450,0 C 445,40 435,70 422,95 C 418,115 425,135 445,155 C 475,185 495,210 525,245 C 545,270 560,290 575,320"
                        fill="none"
                        stroke="#D8CFEA"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 450,0 C 445,40 435,70 422,95 C 418,115 425,135 445,155 C 475,185 495,210 525,245 C 545,270 560,290 575,320"
                        fill="none"
                        stroke="#502B9A"
                        strokeWidth="1.2"
                        strokeOpacity="0.32"
                        strokeLinecap="round"
                      />

                      {/* Yamuna River Water Label */}
                      <text x="488" y="194" fontSize="7" fontWeight="750" letterSpacing="0.14em" fill="#988FB0" transform="rotate(35 488 194)" opacity="0.9" style={{ pointerEvents: 'none' }}>
                        YAMUNA RIVER
                      </text>

                      {/* Major Arterial Road Corridors (Dual Casing) */}
                      <g className="bdb-map-roads" fill="none">
                        {/* Inner Ring Road Loop (Dual casing effect) */}
                        <path d="M 270,122 C 270,82 320,66 375,66 C 430,66 448,92 448,135 C 448,170 425,188 375,188 C 320,188 270,165 270,122 Z" stroke="#DCD5E6" strokeWidth="2.2" />
                        <path d="M 270,122 C 270,82 320,66 375,66 C 430,66 448,92 448,135 C 448,170 425,188 375,188 C 320,188 270,165 270,122 Z" stroke="#FFFFFF" strokeWidth="1.1" />

                        {/* Outer Ring Road Arc */}
                        <path d="M 215,135 C 215,198 280,222 375,222 C 445,222 515,200 528,168" stroke="#E2DDEB" strokeWidth="1.8" strokeDasharray="4 3" />

                        {/* NH48 (Mehrauli-Gurgaon Rd & Aerocity Expressway) */}
                        <path d="M 315,165 L 265,195 L 160,245" stroke="#DCD5E6" strokeWidth="2.2" />
                        <path d="M 315,165 L 265,195 L 160,245" stroke="#FFFFFF" strokeWidth="1" />

                        {/* DND Flyway & Barapullah Corridor across Yamuna to Noida */}
                        <path d="M 405,158 L 448,158 L 515,175 L 585,175" stroke="#DCD5E6" strokeWidth="2.2" />
                        <path d="M 405,158 L 448,158 L 515,175 L 585,175" stroke="#FFFFFF" strokeWidth="1" />

                        {/* Radial Connectors */}
                        <path d="M 375,66 L 365,10" stroke="#E4DFEC" strokeWidth="1.2" />
                        <path d="M 270,122 L 195,122" stroke="#E4DFEC" strokeWidth="1.2" />
                        <path d="M 448,170 L 495,255" stroke="#E4DFEC" strokeWidth="1.2" />
                        <path d="M 385,104 L 380,164 L 385,222" stroke="#ECE8F2" strokeWidth="1" strokeDasharray="2 2" />
                      </g>

                      {/* Highway Route Shields (Lamar GIS style) */}
                      <g className="bdb-road-shields" style={{ pointerEvents: 'none' }}>
                        {HIGHWAY_SHIELDS.map((s) => (
                          <g key={s.label} transform={`translate(${s.x}, ${s.y})`} className="bdb-road-shield">
                            <rect x="-10" y="-5.5" width="20" height="11" rx="2.5" fill="#FFFFFF" stroke="#D1CBDC" strokeWidth="0.8" />
                            <text textAnchor="middle" dy="2.8" fontSize="6" fontWeight="800" fill="#502B9A" letterSpacing="0.04em">
                              {s.label}
                            </text>
                          </g>
                        ))}
                      </g>

                      {/* Lamar-style Corridor Cluster Count Badges */}
                      <g className="bdb-cluster-badges" style={{ pointerEvents: 'none' }}>
                        {CORRIDOR_CLUSTERS.map((cl) => (
                          <g key={cl.name} transform={`translate(${cl.x}, ${cl.y})`} className="bdb-cluster-badge">
                            <circle r="7.5" fill="#502B9A" />
                            <circle r="10.5" fill="none" stroke="rgba(80, 43, 154, 0.22)" strokeWidth="1" />
                            <text textAnchor="middle" dy="2.6" fill="#FFFFFF" fontSize="6.5" fontWeight="800">
                              {cl.count}
                            </text>
                          </g>
                        ))}
                      </g>

                      {/* Key Corridor Labels: Positioned cleanly offset from marker clusters */}
                      <g className="bdb-map-labels" fill="#77727F" fontSize="8" fontWeight="700" letterSpacing="0.08em" style={{ pointerEvents: 'none' }}>
                        <text x="392" y="82" textAnchor="middle">CONNAUGHT PLACE</text>
                        <text x="387" y="142" textAnchor="middle">HAUZ KHAS</text>
                        <text x="394" y="248" textAnchor="middle">SAKET</text>
                        <text x="240" y="212" textAnchor="end">VASANT KUNJ</text>
                        <text x="470" y="126" textAnchor="middle">LAJPAT NAGAR</text>
                        <text x="360" y="32" textAnchor="middle">KAMLA NAGAR</text>
                        <text x="235" y="96" textAnchor="middle">RAJOURI GARDEN</text>
                        <text x="160" y="222" textAnchor="middle">GURUGRAM</text>
                        <text x="562" y="156" textAnchor="middle">NOIDA</text>
                      </g>

                      {/* Optional Logistics Routes Layer (when in routes mode) */}
                      {mapViewMode === 'routes' && (
                        <g className="bdb-logistics-routes" stroke="#502B9A" strokeWidth="1" fill="none" opacity="0.45" strokeDasharray="3 3">
                          {SUPPLIER_HUBS.map((hub) => (
                            <path key={hub.name} d={`M ${hub.x},${hub.y} Q ${(hub.x + 380) / 2},${(hub.y + 160) / 2 - 15} 380,160`} />
                          ))}
                        </g>
                      )}

                      {/* Restrained Location Markers */}
                      <g className="bdb-map-markers">
                        {DELHI_MARKERS.map((m) => {
                          const isReordered = m.status === 'reordered';
                          const isTried = m.status === 'trial_completed';
                          const isSelected = selectedCafe?.id === m.id;

                          return (
                            <g
                              key={m.id}
                              className={`bdb-marker-group ${isReordered ? 'marker-reorder' : isTried ? 'marker-tried' : 'marker-delivered'} ${isSelected ? 'is-selected' : ''}`}
                              transform={`translate(${m.x}, ${m.y})`}
                              onMouseEnter={() => setHoveredMarker(m)}
                              onMouseLeave={() => setHoveredMarker(null)}
                              onClick={() => setSelectedCafe(m)}
                              style={{ cursor: 'pointer' }}
                            >
                              {/* Pulsing Aura Ping for Reordered Cafés */}
                              {isReordered && (
                                <circle r="10" fill="none" stroke="#502B9A" strokeWidth="1.1" className="bdb-marker-ping" />
                              )}
                              {/* Base marker circle */}
                              <circle
                                r={isReordered ? 5.5 : 4.5}
                                fill={isReordered ? '#502B9A' : isTried ? '#FFFFFF' : '#F1ECF8'}
                                stroke={isReordered ? '#FFFFFF' : '#502B9A'}
                                strokeWidth={isReordered ? 1.6 : 1.4}
                              />
                              {/* Inner pupil for tried cafes */}
                              {isTried && <circle r="2" fill="#502B9A" />}
                            </g>
                          );
                        })}
                      </g>
                    </svg>

                    {/* Lamar-style Interactive Tooltip */}
                    {hoveredMarker && (
                      <div
                        className="bdb-lamar-tooltip"
                        style={{
                          left: `${(hoveredMarker.x / 760) * 100}%`,
                          top: `${(hoveredMarker.y / 320) * 100}%`,
                        }}
                      >
                        <div className="bdb-lt-header">
                          <span className="bdb-lt-title">{hoveredMarker.name}</span>
                          <span className="bdb-lt-status">{hoveredMarker.status === 'reordered' ? 'Weekly PO Active' : 'Trial Kit'}</span>
                        </div>
                        <div className="bdb-lt-body">
                          <span>{hoveredMarker.area} · {hoveredMarker.volume || '24 L/wk'}</span>
                          <span className="bdb-lt-hint">Click to inspect</span>
                        </div>
                        <div className="bdb-lt-arrow" />
                      </div>
                    )}

                    {/* Integrated Selected Café Telemetry Deck */}
                    {selectedCafe && (
                      <div className="bdb-cafe-dock-card">
                        <div className="bdb-dock-header">
                          <div className="bdb-dock-title-group">
                            <span className="bdb-dock-name">{selectedCafe.name}</span>
                            <span className="bdb-dock-area">· {selectedCafe.area}</span>
                          </div>
                          <span
                            className={`bdb-dock-status ${selectedCafe.status === 'reordered'
                                ? 'status-reordered'
                                : selectedCafe.status === 'trial_completed'
                                  ? 'status-tried'
                                  : 'status-delivered'
                              }`}
                          >
                            {selectedCafe.status === 'reordered'
                              ? '● Weekly Reorder Active'
                              : selectedCafe.status === 'trial_completed'
                                ? '◎ Trial Completed'
                                : '○ Trial Kit Delivered'}
                          </span>
                        </div>

                        {/* Verbatim Barista Cupping Feedback */}
                        {selectedCafe.quote && (
                          <div className="bdb-dock-quote">
                            <span>{selectedCafe.quote}</span>
                          </div>
                        )}

                        <div className="bdb-dock-details">
                          <div className="bdb-dock-stat">
                            <span className="bdb-dock-label">WEEKLY VOLUME</span>
                            <span className="bdb-dock-val text-purple">{selectedCafe.volume || '24 L/wk'}</span>
                          </div>
                          <div className="bdb-dock-stat">
                            <span className="bdb-dock-label">HEAD BARISTA</span>
                            <span className="bdb-dock-val">{selectedCafe.barista || 'Staff cupping'}</span>
                          </div>
                          <div className="bdb-dock-stat">
                            <span className="bdb-dock-label">CUPPING SCORE</span>
                            <span className="bdb-dock-val">
                              {selectedCafe.rating ? `★ ${selectedCafe.rating}` : 'Pending review'}
                            </span>
                          </div>
                          <div className="bdb-dock-stat">
                            <span className="bdb-dock-label">LOGISTICS & PO</span>
                            <span className="bdb-dock-val">{selectedCafe.supplier || 'Sharma Dairy'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════
                  COLUMN 3: BARISTA FEEDBACK & LIVE COMMERCIAL TELEMETRY
                  ═══════════════════════════════════════════════════════════ */}
              <div className="bdb-col bdb-col-right">
                {/* 1. Barista Feedback (Clean Sensory Rating Hierarchy) */}
                <div className="bdb-card bdb-feedback-card">
                  <div className="bdb-card-header">
                    <div>
                      <h3 className="bdb-card-title">Barista Feedback</h3>
                      <span className="bdb-card-sub">67 verified trials</span>
                    </div>
                    <div className="bdb-rating-overall">
                      <span className="bdb-overall-stars">★ 4.8</span>
                      <span className="bdb-overall-max">/ 5.0</span>
                    </div>
                  </div>

                  <div className="bdb-feedback-list">
                    {FEEDBACK_ATTRS.map((attr) => (
                      <div key={attr.label} className="bdb-attr-compact">
                        <div className="bdb-attr-meta">
                          <span className="bdb-attr-name">
                            {attr.label} <span className="bdb-attr-note">· {attr.note}</span>
                          </span>
                          <span className="bdb-attr-num">{attr.score}</span>
                        </div>
                        <div className="bdb-attr-track">
                          <div className="bdb-attr-fill" style={{ width: `${attr.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Featured Barista Review Quote */}
                  <div className="bdb-quote-pill">
                    <p className="bdb-quote-text">
                      “Holds a rosetta better than the oat milk we use now.”
                    </p>
                    <span className="bdb-quote-author">
                      — Aditya K., Head Barista · Little Brew Room (Hauz Khas)
                    </span>
                  </div>
                </div>

                {/* 2. Live Commercial Telemetry (Chronological Activity Feed) */}
                <div className="bdb-card bdb-activity-card">
                  <div className="bdb-card-header">
                    <div>
                      <h3 className="bdb-card-title">Live Commercial Telemetry</h3>
                      <span className="bdb-card-sub">Route dispatches & Net-15 POs</span>
                    </div>
                    <span className="bdb-live-tag">
                      <span className="bdb-live-dot" /> Live
                    </span>
                  </div>

                  <div className="bdb-timeline-list">
                    {RECENT_ACTIVITIES.map((act) => (
                      <div key={act.id} className="bdb-tl-item">
                        <div className="bdb-tl-node">
                          <span className="bdb-tl-icon-box">
                            <SvgTimelineIcon name={act.icon} />
                          </span>
                          <span className="bdb-tl-line" />
                        </div>
                        <div className="bdb-tl-content">
                          <div className="bdb-tl-header-line">
                            <span className="bdb-tl-title">{act.title}</span>
                            <span className="bdb-tl-time">{act.time}</span>
                          </div>
                          <span className="bdb-tl-cafe">
                            {act.cafe} {act.meta && <span className="bdb-tl-meta">· {act.meta}</span>}
                          </span>
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
    </section>
  );
}
