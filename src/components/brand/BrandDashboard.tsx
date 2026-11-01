'use client';

/* ─────────────────────────────────────────────────────────────────────────────
   GRADIENT — BRAND ANALYTICS DASHBOARD SHOWCASE SECTION
   Design System: White & Purple (#502B9A)
   Aesthetic Inspiration: Gradient Bento System · Linear · Stripe · Ramp · Vercel
   Composition:
     1. Editorial Eyebrow
     2. Confident Headline & Secondary Supporting Description
     3. Signature Product Showcase: Wide, Beautifully Proportioned Dashboard (520px height)
   Scroll Interaction:
     • Heading remains stationary as the visual anchor.
     • The dashboard glides in from the left, settles stably under the heading,
       and moves towards the right and exits as the user continues scrolling.
   ───────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  edition: 'Bangalore · 120 kits · 9 suppliers',
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
    type: 'stepper',
    steps: ['Packed', 'Delivered', 'Tried', 'Reordered'],
    activeStep: 1,
  },
  {
    id: 'trials',
    num: '02',
    label: 'Trials Completed',
    value: '86 baristas',
    meta: '76.8% trial rate',
    type: 'avatars',
    avatars: ['LB', 'MR', 'BK', 'CK'],
    extraCount: 82,
  },
  {
    id: 'feedback',
    num: '03',
    label: 'Sensory Rating',
    value: '★ 4.8 / 5.0',
    meta: '67 verified reviews',
    type: 'rating_pill',
    tag: 'Foams for latte art ↗',
  },
  {
    id: 'reorders',
    num: '04',
    label: 'Weekly Reorders',
    value: '24 cafés',
    meta: '27.9% trial-to-recurring',
    type: 'revenue',
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

const BANGALORE_MARKERS: MapMarker[] = [
  // Indiranagar Cluster (Reordered)
  {
    id: 'm1',
    name: 'Little Brew Room',
    area: 'Indiranagar',
    x: 440,
    y: 105,
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
    name: 'Subko Specialty Coffee',
    area: 'Indiranagar',
    x: 475,
    y: 92,
    status: 'reordered',
    volume: '48 L/wk',
    barista: 'Rohan M.',
    rating: 5.0,
    standingPO: 'Standing Weekly PO',
    quote: '“Exceptional microfoam for latte art without scalding.”',
    supplier: 'Fresh Lane Foods',
  },
  {
    id: 'm3',
    name: 'Paper & Pie',
    area: 'Indiranagar',
    x: 458,
    y: 125,
    status: 'reordered',
    volume: '24 L/wk',
    barista: 'Sameer V.',
    rating: 4.8,
    standingPO: 'Net-15 Active',
    quote: '“Regulars asked for it by name in week two.”',
    supplier: 'Sharma Dairy · Route 4',
  },
  {
    id: 'm4',
    name: 'Araku Coffee Flagship',
    area: 'Indiranagar',
    x: 490,
    y: 114,
    status: 'trial_completed',
    volume: '30 L/wk intent',
    barista: 'Pooja T.',
    rating: 4.7,
    standingPO: 'PO Pending Review',
    quote: '“Great texture in cortados and flat whites.”',
    supplier: 'Sharma Dairy · Route 4',
  },
  {
    id: 'm5',
    name: 'Coffee Mechanics',
    area: 'Indiranagar',
    x: 420,
    y: 98,
    status: 'delivered',
    volume: 'Trial kit active',
    barista: 'Barista team',
    supplier: 'Sharma Dairy',
  },

  // Koramangala Cluster
  {
    id: 'm6',
    name: 'Third Wave Roasters',
    area: 'Koramangala',
    x: 390,
    y: 160,
    status: 'reordered',
    volume: '42 L/wk',
    barista: 'Priya S.',
    rating: 4.9,
    standingPO: 'Standing Weekly PO',
    quote: '“Steams silky and never splits, even hot.”',
    supplier: 'Hill Roasters Logistics',
  },
  {
    id: 'm7',
    name: 'Maverick & Farmer',
    area: 'Koramangala',
    x: 418,
    y: 175,
    status: 'reordered',
    volume: '30 L/wk',
    barista: 'Naveen C.',
    rating: 4.9,
    standingPO: 'Net-15 Active',
    quote: '“Clean oat sweetness without masking single-origin notes.”',
    supplier: 'Hill Roasters Logistics',
  },
  {
    id: 'm8',
    name: 'Second Crack Coffee',
    area: 'Koramangala',
    x: 370,
    y: 150,
    status: 'reordered',
    volume: '24 L/wk',
    barista: 'Divya R.',
    rating: 4.7,
    standingPO: 'Net-15 Active',
    quote: '“Silky microfoam and zero curdling with acidic roasts.”',
    supplier: 'Southfield Dairy',
  },
  {
    id: 'm9',
    name: 'Blue Tokai 4th Block',
    area: 'Koramangala',
    x: 428,
    y: 156,
    status: 'trial_completed',
    volume: 'Cupping done',
    barista: 'Anil B.',
    rating: 4.8,
    supplier: 'Hill Roasters Logistics',
  },
  {
    id: 'm10',
    name: 'Slow Sip Studio',
    area: 'Koramangala',
    x: 400,
    y: 188,
    status: 'delivered',
    volume: 'Trial kit active',
    supplier: 'Southfield Dairy',
  },

  // HSR Layout Cluster
  {
    id: 'm11',
    name: 'Blue Tokai HSR Sector 2',
    area: 'HSR Layout',
    x: 480,
    y: 194,
    status: 'reordered',
    volume: '36 L/wk',
    barista: 'Karthik N.',
    rating: 4.7,
    standingPO: 'Net-15 Active',
    quote: '“High repeat demand among daily tech park commuters.”',
    supplier: 'Eastline Supply',
  },
  {
    id: 'm12',
    name: 'Copper Kettle Café',
    area: 'HSR Layout',
    x: 505,
    y: 180,
    status: 'reordered',
    volume: '24 L/wk',
    barista: 'Manoj T.',
    rating: 4.6,
    standingPO: 'Standing PO',
    quote: '“Great in milk drinks, solid Net-15 case pricing.”',
    supplier: 'Eastline Supply',
  },
  {
    id: 'm13',
    name: 'Bean & Batch Co.',
    area: 'HSR Layout',
    x: 462,
    y: 206,
    status: 'trial_completed',
    volume: 'Flat white tested',
    barista: 'Arjun S.',
    rating: 4.5,
    supplier: 'Eastline Supply',
  },
  {
    id: 'm14',
    name: 'Sector Seven Espresso',
    area: 'HSR Layout',
    x: 520,
    y: 200,
    status: 'delivered',
    volume: 'Kit in testing',
    supplier: 'Eastline Supply',
  },

  // Whitefield Cluster
  {
    id: 'm15',
    name: 'Brew & Bloom',
    area: 'Whitefield',
    x: 610,
    y: 105,
    status: 'reordered',
    volume: '24 L/wk',
    barista: 'Sahil P.',
    rating: 4.8,
    standingPO: 'Net-15 Active',
    quote: '“Holds rosetta designs beautifully.”',
    supplier: 'Lakeside Foods',
  },
  {
    id: 'm16',
    name: 'Windmills Craft Bar',
    area: 'Whitefield',
    x: 640,
    y: 94,
    status: 'trial_completed',
    volume: 'Microfoam verified',
    barista: 'Anita M.',
    rating: 4.6,
    supplier: 'Lakeside Foods',
  },
  {
    id: 'm17',
    name: 'The Caffeine Bar',
    area: 'Whitefield',
    x: 595,
    y: 124,
    status: 'delivered',
    volume: 'Trial kit active',
    supplier: 'Lakeside Foods',
  },

  // Jayanagar Cluster
  {
    id: 'm18',
    name: 'Morning Ritual Roasters',
    area: 'Jayanagar',
    x: 295,
    y: 168,
    status: 'reordered',
    volume: '30 L/wk',
    barista: 'Gautam P.',
    rating: 4.9,
    standingPO: 'Standing Weekly PO',
    quote: '“Customers switched permanently from dairy.”',
    supplier: 'Southfield Dairy',
  },
  {
    id: 'm19',
    name: 'Subbarama Coffee Hub',
    area: 'Jayanagar',
    x: 318,
    y: 184,
    status: 'trial_completed',
    volume: 'Testing oat latte',
    barista: 'Rekha K.',
    rating: 4.5,
    supplier: 'Southfield Dairy',
  },
  {
    id: 'm20',
    name: 'Southern Grounds',
    area: 'Jayanagar',
    x: 272,
    y: 156,
    status: 'delivered',
    volume: 'Delivery confirmed',
    supplier: 'Southfield Dairy',
  },

  // Rajajinagar Cluster
  {
    id: 'm21',
    name: 'West End Roastery',
    area: 'Rajajinagar',
    x: 180,
    y: 115,
    status: 'trial_completed',
    volume: 'Cupping score 4.7',
    barista: 'Vikas N.',
    rating: 4.7,
    supplier: 'Northgate Dairy',
  },
  {
    id: 'm22',
    name: 'Rajajinagar Artisanal',
    area: 'Rajajinagar',
    x: 205,
    y: 134,
    status: 'delivered',
    volume: 'Delivered via Northgate',
    supplier: 'Northgate Dairy',
  },
];

const FUNNEL_STAGES = [
  { id: 'dispatched', name: 'Dispatched', icon: 'truck', count: 120, pct: '100%', highlight: false },
  { id: 'delivered', name: 'Delivered', icon: 'box', count: 112, pct: '93.3%', highlight: false },
  { id: 'trials', name: 'Tried', icon: 'cup', count: 86, pct: '76.8%', highlight: false },
  { id: 'feedback', name: 'Reviewed', icon: 'star', count: 67, pct: '77.9%', highlight: false },
  { id: 'reorders', name: 'Weekly POs', icon: 'repeat', count: 24, pct: '27.9%', highlight: true },
];

const FEEDBACK_ATTRS = [
  { label: 'Foam quality', score: 4.8, pct: 96, note: 'Approved for microfoam latte art' },
  { label: 'Steaming stability', score: 4.7, pct: 94, note: '0% splitting in light roasts' },
  { label: 'Taste in flat white', score: 4.6, pct: 92, note: 'Clean oat sweetness' },
  { label: 'Pricing perception', score: 4.1, pct: 82, note: 'Competitive with Net-15 tier' },
];

const WEEKLY_CHART = [
  { week: 'W1', litres: 180, cafes: 6 },
  { week: 'W2', litres: 340, cafes: 11 },
  { week: 'W3', litres: 560, cafes: 16 },
  { week: 'W4', litres: 720, cafes: 21 },
  { week: 'W5', litres: 840, cafes: 24, current: true },
  { week: 'W6', litres: 940, cafes: 27, projected: true },
];

const RECENT_ACTIVITIES = [
  {
    id: 'a1',
    time: '12m ago',
    icon: 'box',
    title: 'Trial kit delivered',
    cafe: 'Little Brew Room · Indiranagar',
    meta: 'Sharma Logistics route dispatch',
    dayBadge: 'Day 2',
  },
  {
    id: 'a2',
    time: '48m ago',
    icon: 'star',
    title: 'Barista trial completed',
    cafe: 'Third Wave · Koramangala',
    meta: 'Steamed 8 flat whites · Rated ★ 5.0',
    dayBadge: 'Day 5',
  },
  {
    id: 'a3',
    time: '4h ago',
    icon: 'repeat',
    title: 'First recurring order placed',
    cafe: 'Paper & Pie · Indiranagar',
    meta: '36 L/wk standing Net-15 PO',
    dayBadge: 'Day 10',
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

function SvgIcon({ name }: { name: string }) {
  switch (name) {
    case 'truck':
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case 'box':
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case 'cup':
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      );
    case 'star':
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="#502B9A" stroke="#502B9A" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'repeat':
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      );
    case 'check':
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    default:
      return null;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT: BrandDashboard
   ───────────────────────────────────────────────────────────────────────────── */
export function BrandDashboard() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinWrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // User interactive selection
  const [selectedCafe, setSelectedCafe] = useState<MapMarker>(BANGALORE_MARKERS[0]);
  const [hoveredMarker, setHoveredMarker] = useState<MapMarker | null>(null);
  const [activeWeekIndex, setActiveWeekIndex] = useState<number>(4); // W5 (current)
  const [mapFilter, setMapFilter] = useState<'all' | 'reordered' | 'trial_completed' | 'delivered'>('all');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [motionPhase, setMotionPhase] = useState<'entrance' | 'center' | 'exit'>('center');

  // Filtered markers based on tab
  const visibleMarkers = useMemo(() => {
    if (mapFilter === 'all') return BANGALORE_MARKERS;
    return BANGALORE_MARKERS.filter((m) => m.status === mapFilter);
  }, [mapFilter]);

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

              {/* KPI Summary Strip: Inspired by Gradient Bento & Ramp/Stripe Precision */}
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

                      {/* 01: Kit progression pills (Packed · Delivered · Tried · Reordered) */}
                      {kpi.type === 'stepper' && kpi.steps && (
                        <div className="bdb-kpi-steps-cluster">
                          {kpi.steps.map((step, idx) => (
                            <span
                              key={step}
                              className={`bdb-kpi-step-chip ${idx <= (kpi.activeStep ?? 0) ? 'is-done' : ''}`}
                            >
                              {step}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 02: Barista avatar cluster ([LB] [MR] [BK] +82) */}
                      {kpi.type === 'avatars' && kpi.avatars && (
                        <div className="bdb-kpi-avatar-cluster">
                          <div className="bdb-kpi-avatars-stack">
                            {kpi.avatars.map((initials, i) => (
                              <span key={i} className={`bdb-avatar-bubble bdb-av-${i}`}>
                                {initials}
                              </span>
                            ))}
                          </div>
                          <span className="bdb-kpi-avatar-more">+{kpi.extraCount}</span>
                        </div>
                      )}

                      {/* 03: Rating pill (Foams for latte art ↗) */}
                      {kpi.type === 'rating_pill' && kpi.tag && (
                        <span className="bdb-kpi-sensory-tag">{kpi.tag}</span>
                      )}

                      {/* 04: ARR Badge */}
                      {kpi.type === 'revenue' && kpi.badge && (
                        <span className="bdb-kpi-badge badge-purple">{kpi.badge}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </header>

            {/* Main 3-Column Body Grid (Proportioned, Spacious, High Authenticity) */}
            <div className="bdb-body-grid">
              {/* ═══════════════════════════════════════════════════════════
                  COLUMN 1: CONVERSION FUNNEL & REORDER CADENCE
                  ═══════════════════════════════════════════════════════════ */}
              <div className="bdb-col bdb-col-left">
                {/* 1. Trial Conversion Funnel (Lifecycle Pipeline) */}
                <div className="bdb-card bdb-funnel-card">
                  <div className="bdb-card-header">
                    <div>
                      <h3 className="bdb-card-title">Trial Conversion Funnel</h3>
                      <span className="bdb-card-sub">Sampling seed to recurring weekly orders</span>
                    </div>
                    <span className="bdb-pill-indicator">Full Cycle</span>
                  </div>

                  <div className="bdb-funnel-list">
                    {FUNNEL_STAGES.map((stg) => (
                      <div key={stg.id} className={`bdb-funnel-row ${stg.highlight ? 'is-highlight' : ''}`}>
                        <div className="bdb-f-left">
                          <span className="bdb-f-icon-chip">
                            <SvgIcon name={stg.icon} />
                          </span>
                          <span className="bdb-f-name">{stg.name}</span>
                        </div>
                        <div className="bdb-f-bar-wrap">
                          <div
                            className={`bdb-f-bar-fill ${stg.highlight ? 'bar-purple' : 'bar-neutral'}`}
                            style={{ width: `${(stg.count / 120) * 100}%` }}
                          />
                        </div>
                        <div className="bdb-f-right">
                          <span className="bdb-f-count">{stg.count}</span>
                          <span className="bdb-f-pct">{stg.pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Weekly Reorder Volume (Area Wave & Scrubber) */}
                <div className="bdb-card bdb-reorder-card">
                  <div className="bdb-card-header">
                    <div>
                      <h3 className="bdb-card-title">Weekly Reorder Volume</h3>
                      <span className="bdb-card-sub">Litres dispatched & ARR run-rate</span>
                    </div>
                    <span className="bdb-pill-indicator text-purple">840 L/wk</span>
                  </div>

                  {/* Top Dynamic Stat Callout */}
                  <div className="bdb-reorder-headline">
                    <div className="bdb-rh-main">
                      <span className="bdb-rh-number">{WEEKLY_CHART[activeWeekIndex].litres} L</span>
                      <span className="bdb-rh-period">
                        a week · {WEEKLY_CHART[activeWeekIndex].week} {WEEKLY_CHART[activeWeekIndex].projected ? 'forecast' : 'orders'}
                      </span>
                    </div>
                    <span className="bdb-rh-tag">
                      {WEEKLY_CHART[activeWeekIndex].cafes} cafés
                    </span>
                  </div>

                  {/* Sleek SVG Wave Area Chart */}
                  <div className="bdb-wave-chart-stage">
                    <svg viewBox="0 0 260 48" preserveAspectRatio="none" className="bdb-wave-svg">
                      <defs>
                        <linearGradient id="reorderWaveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#502B9A" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#502B9A" stopOpacity="0.01" />
                        </linearGradient>
                      </defs>

                      {/* Area Fill */}
                      <polygon
                        points="0,48 0,38 45,30 95,22 150,14 205,8 260,4 260,48"
                        fill="url(#reorderWaveGrad)"
                      />

                      {/* Actual Line */}
                      <path
                        d="M 0,38 Q 45,30 95,22 T 205,8"
                        fill="none"
                        stroke="#502B9A"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      {/* Projected Segment (Dashed) */}
                      <path
                        d="M 205,8 Q 232,6 260,4"
                        fill="none"
                        stroke="#502B9A"
                        strokeWidth="1.8"
                        strokeDasharray="3 3"
                        strokeLinecap="round"
                        opacity="0.6"
                      />

                      {/* Current Active Week Indicator */}
                      <circle cx="205" cy="8" r="4.5" fill="#502B9A" stroke="#FFFFFF" strokeWidth="2" />
                    </svg>

                    {/* Interactive Clickable Week Pills */}
                    <div className="bdb-wave-week-ticks">
                      {WEEKLY_CHART.map((wc, idx) => (
                        <button
                          key={wc.week}
                          type="button"
                          className={`bdb-week-tick-btn ${activeWeekIndex === idx ? 'is-active' : ''} ${wc.projected ? 'is-projected' : ''}`}
                          onClick={() => setActiveWeekIndex(idx)}
                        >
                          {wc.week}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bdb-reorder-stat-row">
                    <span><b>24</b> Repeat Cafés</span>
                    <span className="bdb-sep">·</span>
                    <span><b>36L</b> Avg/wk</span>
                    <span className="bdb-sep">·</span>
                    <span className="text-purple"><b>₹2.18L</b>/mo ARR</span>
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════
                  COLUMN 2: BANGALORE CAFÉ DISTRIBUTION MAP (Centerpiece)
                  ═══════════════════════════════════════════════════════════ */}
              <div className="bdb-col bdb-col-center">
                <div className="bdb-card bdb-map-card">
                  <div className="bdb-card-header">
                    <div className="bdb-map-header-left">
                      <h3 className="bdb-card-title">Bangalore Café Distribution</h3>
                      <span className="bdb-card-sub">120 trial kits seeded across 6 prime corridors</span>
                    </div>

                    {/* Interactive Filter Pills */}
                    <div className="bdb-map-filter-tabs">
                      <button
                        type="button"
                        className={`bdb-map-tab-btn ${mapFilter === 'all' ? 'is-active' : ''}`}
                        onClick={() => setMapFilter('all')}
                      >
                        All (120)
                      </button>
                      <button
                        type="button"
                        className={`bdb-map-tab-btn ${mapFilter === 'reordered' ? 'is-active' : ''}`}
                        onClick={() => setMapFilter('reordered')}
                      >
                        Reordered (24)
                      </button>
                      <button
                        type="button"
                        className={`bdb-map-tab-btn ${mapFilter === 'trial_completed' ? 'is-active' : ''}`}
                        onClick={() => setMapFilter('trial_completed')}
                      >
                        Tried (86)
                      </button>
                    </div>
                  </div>

                  {/* SVG Map Canvas with docked floating detail card */}
                  <div className="bdb-map-stage">
                    <svg viewBox="0 0 760 320" className="bdb-bangalore-svg" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <radialGradient id="mapGlowProportion" cx="50%" cy="50%" r="55%">
                          <stop offset="0%" stopColor="#502B9A" stopOpacity="0.05" />
                          <stop offset="60%" stopColor="#502B9A" stopOpacity="0.015" />
                          <stop offset="100%" stopColor="#502B9A" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      <rect width="760" height="320" fill="url(#mapGlowProportion)" />

                      {/* Concentric subtle radar coordinate rings */}
                      <g className="bdb-map-rings" stroke="#ECE8F2" strokeWidth="1" fill="none">
                        <circle cx="430" cy="150" r="70" strokeDasharray="3 4" opacity="0.6" />
                        <circle cx="430" cy="150" r="140" strokeDasharray="4 6" opacity="0.4" />
                        <circle cx="430" cy="150" r="220" strokeDasharray="4 8" opacity="0.25" />
                      </g>

                      {/* Low-contrast clean Bengaluru corridor road grid */}
                      <g className="bdb-map-roads" stroke="#ECE8F2" strokeWidth="1.2" fill="none">
                        {/* Outer Ring Road arc */}
                        <path d="M 130,40 C 240,25 530,45 670,135 C 720,185 640,250 440,255 C 280,255 160,210 130,140 Z" strokeDasharray="4 3" strokeWidth="1.3" stroke="#E2DFE8" />
                        {/* Old Airport Rd & 100ft arterial */}
                        <path d="M 150,125 L 630,125" />
                        {/* North-South Hosur Corridor */}
                        <path d="M 390,25 L 390,255" />
                        {/* Diagonal logistics connectors */}
                        <path d="M 230,55 L 550,235" strokeDasharray="2 3" opacity="0.7" />
                        <path d="M 550,55 L 230,235" strokeDasharray="2 3" opacity="0.7" />
                        <path d="M 190,90 Q 410,140 600,90" />
                        <path d="M 190,185 Q 410,130 600,185" />
                      </g>

                      {/* Prime Corridor Labels */}
                      <g className="bdb-map-labels" fill="#77727F" fontSize="9.5" fontWeight="700" letterSpacing="0.08em">
                        <text x="440" y="78">INDIRANAGAR</text>
                        <text x="360" y="210">KORAMANGALA</text>
                        <text x="500" y="226">HSR LAYOUT</text>
                        <text x="590" y="78">WHITEFIELD</text>
                        <text x="235" y="180">JAYANAGAR</text>
                        <text x="145" y="102">RAJAJINAGAR</text>
                      </g>

                      {/* Interactive Markers */}
                      <g className="bdb-map-markers">
                        {visibleMarkers.map((m) => {
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
                              {/* Glowing Radar Ping for Reordered Cafés */}
                              {isReordered && (
                                <circle r="11" fill="none" stroke="#502B9A" strokeWidth="1.2" className="bdb-marker-ping" />
                              )}
                              {/* Base marker circle */}
                              <circle
                                r={isReordered ? 6 : 5}
                                fill={isReordered ? '#502B9A' : isTried ? '#FFFFFF' : '#F1ECF8'}
                                stroke={isReordered ? '#FFFFFF' : '#502B9A'}
                                strokeWidth={isReordered ? 1.8 : 1.5}
                              />
                              {/* Inner pupil for tried cafes */}
                              {isTried && <circle r="2.2" fill="#502B9A" />}
                            </g>
                          );
                        })}
                      </g>
                    </svg>

                    {/* Marker Hover Tooltip */}
                    {hoveredMarker && (
                      <div
                        className="bdb-map-tooltip"
                        style={{
                          left: `${(hoveredMarker.x / 760) * 100}%`,
                          top: `${(hoveredMarker.y / 320) * 100}%`,
                        }}
                      >
                        <div className="bdb-tooltip-name">{hoveredMarker.name}</div>
                        <div className="bdb-tooltip-sub">
                          {hoveredMarker.area} ·{' '}
                          <span className={hoveredMarker.status === 'reordered' ? 'text-purple' : ''}>
                            {hoveredMarker.status === 'reordered'
                              ? 'Weekly Reordered'
                              : hoveredMarker.status === 'trial_completed'
                              ? 'Trial Completed'
                              : 'Kit Delivered'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Docked Floating Café Intelligence Card (Bento Style with Quote & Telemetry) */}
                    {selectedCafe && (
                      <div className="bdb-cafe-dock-card">
                        <div className="bdb-dock-header">
                          <div className="bdb-dock-title-group">
                            <span className="bdb-dock-name">{selectedCafe.name}</span>
                            <span className="bdb-dock-area">· {selectedCafe.area}</span>
                          </div>
                          <span
                            className={`bdb-dock-status ${
                              selectedCafe.status === 'reordered'
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

                        {/* Verbatim Barista Feedback in Dock Card */}
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
                {/* 1. Barista Feedback Intelligence (Inspiration: Gradient Bento Rating Card) */}
                <div className="bdb-card bdb-feedback-card">
                  <div className="bdb-card-header">
                    <div>
                      <h3 className="bdb-card-title">Barista Feedback</h3>
                      <span className="bdb-card-sub">Sensory ratings across 67 trials</span>
                    </div>

                    {/* Stacked Barista Avatars in Header */}
                    <div className="bdb-feedback-header-right">
                      <div className="bdb-header-avatars">
                        <span className="bdb-hav">LB</span>
                        <span className="bdb-hav">MR</span>
                        <span className="bdb-hav">BK</span>
                      </div>
                      <div className="bdb-rating-overall">
                        <span className="bdb-overall-stars">★ 4.8</span>
                      </div>
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
                      “Exceptional microfoam for latte art without scalding.”
                    </p>
                    <span className="bdb-quote-author">
                      — Rohan M., Head Barista · Maverick & Farmer
                    </span>
                  </div>
                </div>

                {/* 2. Live Commercial Telemetry Feed (Inspiration: Gradient Bento Feed Card) */}
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

                  <div className="bdb-activity-list">
                    {RECENT_ACTIVITIES.map((act) => (
                      <div key={act.id} className="bdb-act-row">
                        <div className="bdb-act-icon-box">
                          <SvgIcon name={act.icon} />
                        </div>
                        <div className="bdb-act-content">
                          <div className="bdb-act-header-line">
                            <span className="bdb-act-title">{act.title}</span>
                            <span className="bdb-act-day">{act.dayBadge}</span>
                          </div>
                          <span className="bdb-act-cafe">
                            {act.cafe} {act.meta && <span className="bdb-act-meta">· {act.meta}</span>}
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
