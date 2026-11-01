'use client';

/* ─────────────────────────────────────────────────────────────────────────────
   GRADIENT — BRAND ANALYTICS DASHBOARD
   Design System: White & Purple (#502B9A)
   Inspiration: Linear · Stripe · Ramp · Vercel
   Scroll Experience: Smooth Entrance → Settling → Pinned Horizontal Pan → Clean Exit
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
  edition: 'Bangalore · Trial campaign · 120 kits · 9 suppliers',
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
  estimatedARR: '₹2,18,400 / mo',
};

interface MetricCardData {
  id: string;
  num: string;
  title: string;
  value: string;
  subtext: string;
  type: 'progress' | 'pill' | 'sparkline' | 'revenue';
  progress?: number;
  badge?: string;
  trend?: number[];
}

const OVERVIEW_METRICS: MetricCardData[] = [
  {
    id: 'kits',
    num: '01',
    title: 'Kits delivered',
    value: '112 / 120',
    subtext: '93% delivery completion',
    type: 'progress',
    progress: 93.3,
  },
  {
    id: 'trials',
    num: '02',
    title: 'Trials completed',
    value: '86 baristas',
    subtext: '77% of delivered kits tried',
    type: 'pill',
    badge: '+14 this week',
  },
  {
    id: 'feedback',
    num: '03',
    title: 'Positive feedback',
    value: '78%',
    subtext: '67 verified reviews · ★ 4.8 avg',
    type: 'sparkline',
    trend: [48, 55, 62, 69, 74, 78],
  },
  {
    id: 'reorders',
    num: '04',
    title: 'Weekly reorders',
    value: '24 cafés',
    subtext: '27.9% trial-to-recurring conversion',
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
}

const BANGALORE_MARKERS: MapMarker[] = [
  // Indiranagar Cluster (9 reorders)
  { id: 'm1', name: 'Little Brew Room', area: 'Indiranagar', x: 395, y: 145, status: 'reordered', volume: '36 L/wk', barista: 'Aditya K.', rating: 4.9, standingPO: 'Net-15 Active' },
  { id: 'm2', name: 'Subko Specialty Coffee', area: 'Indiranagar', x: 425, y: 130, status: 'reordered', volume: '48 L/wk', barista: 'Rohan M.', rating: 5.0, standingPO: 'Standing PO' },
  { id: 'm3', name: 'Paper & Pie', area: 'Indiranagar', x: 410, y: 165, status: 'reordered', volume: '24 L/wk', barista: 'Sameer V.', rating: 4.8, standingPO: 'Net-15 Active' },
  { id: 'm4', name: 'Araku Coffee Flagship', area: 'Indiranagar', x: 440, y: 150, status: 'trial_completed', volume: 'Review pending', barista: 'Pooja T.', rating: 4.7 },
  { id: 'm5', name: 'Coffee Mechanics', area: 'Indiranagar', x: 380, y: 125, status: 'delivered', volume: 'Trial in progress' },

  // Koramangala Cluster (7 reorders)
  { id: 'm6', name: 'Third Wave Coffee Roasters', area: 'Koramangala', x: 350, y: 215, status: 'reordered', volume: '42 L/wk', barista: 'Priya S.', rating: 4.9, standingPO: 'Net-15 Active' },
  { id: 'm7', name: 'Maverick & Farmer', area: 'Koramangala', x: 375, y: 235, status: 'reordered', volume: '30 L/wk', barista: 'Naveen C.', rating: 4.9, standingPO: 'Standing PO' },
  { id: 'm8', name: 'Second Crack Coffee', area: 'Koramangala', x: 335, y: 200, status: 'reordered', volume: '24 L/wk', barista: 'Divya R.', rating: 4.7, standingPO: 'Net-15 Active' },
  { id: 'm9', name: 'Blue Tokai 4th Block', area: 'Koramangala', x: 385, y: 210, status: 'trial_completed', volume: 'Cupping done', barista: 'Anil B.', rating: 4.8 },
  { id: 'm10', name: 'Slow Sip Studio', area: 'Koramangala', x: 360, y: 250, status: 'delivered', volume: 'Trial in progress' },

  // HSR Layout Cluster (5 reorders)
  { id: 'm11', name: 'Blue Tokai HSR Sector 2', area: 'HSR Layout', x: 430, y: 280, status: 'reordered', volume: '36 L/wk', barista: 'Karthik N.', rating: 4.7, standingPO: 'Net-15 Active' },
  { id: 'm12', name: 'Copper Kettle Café', area: 'HSR Layout', x: 450, y: 260, status: 'reordered', volume: '24 L/wk', barista: 'Manoj T.', rating: 4.6, standingPO: 'Standing PO' },
  { id: 'm13', name: 'Bean & Batch Co.', area: 'HSR Layout', x: 415, y: 295, status: 'trial_completed', volume: 'Tested in Flat White', barista: 'Arjun S.', rating: 4.5 },
  { id: 'm14', name: 'Sector Seven Espresso', area: 'HSR Layout', x: 465, y: 290, status: 'delivered', volume: 'Delivered via Sharma' },

  // Whitefield Cluster
  { id: 'm15', name: 'Brew & Bloom', area: 'Whitefield', x: 550, y: 145, status: 'reordered', volume: '24 L/wk', barista: 'Sahil P.', rating: 4.8, standingPO: 'Net-15 Active' },
  { id: 'm16', name: 'Windmills Craftworks Bar', area: 'Whitefield', x: 575, y: 130, status: 'trial_completed', volume: 'Microfoam verified', barista: 'Anita M.', rating: 4.6 },
  { id: 'm17', name: 'The Caffeine Bar Whitefield', area: 'Whitefield', x: 535, y: 165, status: 'delivered', volume: 'Delivered yesterday' },

  // Jayanagar Cluster (3 reorders)
  { id: 'm18', name: 'Morning Ritual Roasters', area: 'Jayanagar', x: 275, y: 235, status: 'reordered', volume: '30 L/wk', barista: 'Gautam P.', rating: 4.9, standingPO: 'Standing PO' },
  { id: 'm19', name: 'Subbarama Coffee Hub', area: 'Jayanagar', x: 295, y: 250, status: 'trial_completed', volume: 'Testing oat latte', barista: 'Rekha K.', rating: 4.5 },
  { id: 'm20', name: 'Southern Grounds', area: 'Jayanagar', x: 255, y: 220, status: 'delivered', volume: 'Delivery confirmed' },

  // Rajajinagar Cluster
  { id: 'm21', name: 'West End Roastery', area: 'Rajajinagar', x: 190, y: 170, status: 'trial_completed', volume: 'Cupping score 4.7', barista: 'Vikas N.', rating: 4.7 },
  { id: 'm22', name: 'Rajajinagar Artisanal', area: 'Rajajinagar', x: 210, y: 190, status: 'delivered', volume: 'Delivered via Kaveri' },
];

const FUNNEL_STAGES = [
  { id: 'dispatched', name: 'Kits dispatched', count: 120, pct: '100%', drop: 'Base campaign seed', active: false },
  { id: 'delivered', name: 'Kits delivered', count: 112, pct: '93.3%', drop: '-8 in transit', active: false },
  { id: 'trials', name: 'Trials completed', count: 86, pct: '76.8%', drop: '-26 scheduled', active: true },
  { id: 'feedback', name: 'Feedback received', count: 67, pct: '77.9%', drop: '-19 in review', active: true },
  { id: 'reorders', name: 'Weekly reorders', count: 24, pct: '35.8%', drop: '20.0% network conv.', active: true, highlight: true },
];

const FEEDBACK_ATTRS = [
  { label: 'Foam quality', score: 4.8, pct: 96, comment: '96% baristas approved for microfoam & latte art' },
  { label: 'Steaming performance', score: 4.7, pct: 94, comment: '0% splitting with light and medium espresso' },
  { label: 'Taste in flat white', score: 4.6, pct: 92, comment: 'Clean oat sweetness without graininess' },
  { label: 'Café pricing perception', score: 4.1, pct: 82, comment: 'Competitive volume tiers with Net-15 terms' },
];

const BARISTA_REVIEWS = [
  {
    quote: 'Creates exceptional microfoam for tulip and rosetta latte art without scalding.',
    author: 'Rohan M.',
    role: 'Head Barista',
    cafe: 'Maverick & Farmer',
    area: 'Indiranagar',
    stars: 5,
  },
  {
    quote: 'Consistent steaming performance; holds texture through the entire morning rush.',
    author: 'Priya S.',
    role: 'Lead Brewer',
    cafe: 'Third Wave Coffee',
    area: 'Koramangala',
    stars: 5,
  },
  {
    quote: 'A little expensive compared to our current supplier, but customers actively request it.',
    author: 'Karthik N.',
    role: 'Café Partner',
    cafe: 'Blue Tokai',
    area: 'HSR Layout',
    stars: 4,
  },
];

const WEEKLY_CHART = [
  { week: 'W1', litres: 180, cafes: 6 },
  { week: 'W2', litres: 340, cafes: 11 },
  { week: 'W3', litres: 560, cafes: 16 },
  { week: 'W4', litres: 720, cafes: 21 },
  { week: 'W5', litres: 840, cafes: 24, current: true },
  { week: 'W6', litres: 920, cafes: 26, projected: true },
];

const RECENT_ACTIVITIES = [
  {
    id: 'a1',
    time: '12m ago',
    type: 'delivery',
    title: 'Trial kit delivered',
    cafe: 'Little Brew Room · Indiranagar',
    meta: 'Delivered via Sharma Logistics route van',
  },
  {
    id: 'a2',
    time: '48m ago',
    type: 'trial',
    title: 'Barista trial completed',
    cafe: 'Third Wave · Koramangala',
    meta: 'Steamed 8 Flat Whites · Rated ★ 5.0',
  },
  {
    id: 'a3',
    time: '2h ago',
    type: 'feedback',
    title: 'New cupping feedback logged',
    cafe: 'Subko Specialty · Indiranagar',
    meta: '“Best oat microfoam texture so far”',
  },
  {
    id: 'a4',
    time: '4h ago',
    type: 'order',
    title: 'First recurring order placed',
    cafe: 'Paper & Pie · Indiranagar',
    meta: '36 Litres / wk · Standing Net-15 PO',
  },
  {
    id: 'a5',
    time: 'Yesterday',
    type: 'recurring',
    title: 'Weekly standing PO confirmed',
    cafe: 'Blue Tokai · HSR Layout',
    meta: '48 Litres recurring batch dispatch',
  },
];

/* ─── INLINE SVGS: Clean Minimal Icons ───────────────────────────────────── */
function SvgGradientLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#502B9A" />
      <path d="M12 6a6 6 0 1 0 6 6h-6V6z" fill="#FFFFFF" />
      <circle cx="15.5" cy="8.5" r="1.5" fill="#F1ECF8" />
    </svg>
  );
}

function SvgBell() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function SvgDownload() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SvgChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SvgSparkline({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 110;
  const h = 28;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');
  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      <polygon points={areaPoints} fill="rgba(80, 43, 154, 0.08)" />
      <polyline points={points} fill="none" stroke="#502B9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  const bodyGridRef = useRef<HTMLDivElement>(null);

  // User interactive selection
  const [selectedCafe, setSelectedCafe] = useState<MapMarker | null>(BANGALORE_MARKERS[0]);
  const [hoveredMarker, setHoveredMarker] = useState<MapMarker | null>(null);
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeBay, setActiveBay] = useState<number>(0);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ─── Scroll-Driven Animation Implementation (GSAP + ScrollTrigger) ─────── */
  useIsomorphicLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isMobile || prefersReducedMotion) {
      if (bodyGridRef.current) gsap.set(bodyGridRef.current, { clearProps: 'all' });
      if (frameRef.current) gsap.set(frameRef.current, { clearProps: 'all' });
      return;
    }

    const section = sectionRef.current;
    const pinWrap = pinWrapRef.current;
    const frame = frameRef.current;
    const bodyGrid = bodyGridRef.current;
    if (!section || !pinWrap || !frame || !bodyGrid) return;

    const ctx = gsap.context(() => {
      // 1. PHASE 1: ENTRANCE ANIMATION (As section scrolls into view from top 85%)
      gsap.fromTo(
        frame,
        {
          x: -90,
          opacity: 0.15,
          scale: 0.97,
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'top 20%',
            scrub: 0.6,
          },
        }
      );

      // 2. PHASE 2 + 3 + 4: PINNED SECTION WITH HORIZONTAL PAN
      const getPanDistance = () => {
        const frameW = frame.clientWidth;
        const totalW = bodyGrid.scrollWidth;
        const overflow = totalW - frameW;
        return Math.max(0, overflow + 32);
      };

      const pinTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.5}`,
          pin: pinWrap,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.38) setActiveBay(0);
            else if (p < 0.76) setActiveBay(1);
            else setActiveBay(2);
          },
        },
      });

      // Phase 2: Settling pause at start (User reads Bay 1: Overview & Map)
      pinTimeline.to(bodyGrid, {
        x: 0,
        duration: 0.16,
      });

      // Phase 3: Smooth horizontal travel across the continuous canvas
      pinTimeline.to(bodyGrid, {
        x: () => -getPanDistance(),
        duration: 0.72,
        ease: 'none',
      });

      // Phase 4: Final settle before unpinning into next section
      pinTimeline.to(bodyGrid, {
        duration: 0.12,
      });
    }, section);

    return () => ctx.revert();
  }, [isMobile]);

  // Jump to bay helper for quick navigation buttons
  const scrollToBay = (index: number) => {
    setActiveBay(index);
    if (!bodyGridRef.current || !frameRef.current) return;
    const frameW = frameRef.current.clientWidth;
    const totalW = bodyGridRef.current.scrollWidth;
    const maxScroll = Math.max(0, totalW - frameW + 32);
    const targetX = index === 0 ? 0 : index === 1 ? -maxScroll * 0.52 : -maxScroll;

    gsap.to(bodyGridRef.current, {
      x: targetX,
      duration: 0.55,
      ease: 'power3.out',
    });
  };

  return (
    <section ref={sectionRef} className="bdb-section" id="dashboard" aria-label="Brand Analytics Dashboard">
      {/* Background ambient lighting in pure subtle purple */}
      <div className="bdb-bg-ambient" aria-hidden="true" />

      {/* Main Pinned Stage */}
      <div ref={pinWrapRef} className="bdb-pin-wrap">
        <div className="bdb-container">
          {/* ─── 0. Editorial Header (Watch your trial turn into weekly orders.) ─── */}
          <div className="bdb-editorial-header">
            <div className="bdb-eyebrow">
              <span className="bdb-eyebrow-pip" aria-hidden="true" />
              <span>BRAND INTELLIGENCE PLATFORM · LIVE CAMPAIGN TELEMETRY</span>
            </div>

            <div className="bdb-header-row">
              <div className="bdb-title-wrap">
                <h2 className="bdb-title">
                  Watch your trial turn into <span className="bdb-title-purple">weekly orders.</span>
                </h2>
                <p className="bdb-sub">
                  Every kit, every barista’s verdict and every café that starts ordering, in one dashboard only your brand can see.
                </p>
              </div>

              {/* Navigation Bay Pills (Quick jump indicators) */}
              <div className="bdb-bay-switcher" role="tablist" aria-label="Dashboard Panes">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeBay === 0}
                  className={`bdb-bay-btn ${activeBay === 0 ? 'is-active' : ''}`}
                  onClick={() => scrollToBay(0)}
                >
                  <span className="bdb-bay-dot" />
                  <span>Overview & Map</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeBay === 1}
                  className={`bdb-bay-btn ${activeBay === 1 ? 'is-active' : ''}`}
                  onClick={() => scrollToBay(1)}
                >
                  <span className="bdb-bay-dot" />
                  <span>Conversion & Reviews</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeBay === 2}
                  className={`bdb-bay-btn ${activeBay === 2 ? 'is-active' : ''}`}
                  onClick={() => scrollToBay(2)}
                >
                  <span className="bdb-bay-dot" />
                  <span>Reorder ARR & Feed</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─── Viewport Frame (Viewport clipping window for horizontal slide) ─── */}
          <div ref={frameRef} className="bdb-viewport-frame">
            {/* ─── A. Navigation and Campaign Header (Sticky Top of Dashboard) ─── */}
            <header className="bdb-app-header">
              {/* Top Nav Row */}
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
                    <span>Export Report</span>
                  </button>

                  <div className="bdb-bell-icon" title="3 Notifications">
                    <SvgBell />
                    <span className="bdb-bell-dot" />
                  </div>

                  <div className="bdb-user-profile" title="Signed in as Head of Growth">
                    <span className="bdb-user-avatar">VR</span>
                  </div>
                </div>
              </div>

              {/* Sub-Header Campaign Row */}
              <div className="bdb-campaign-bar">
                <div className="bdb-campaign-bar-left">
                  <h1 className="bdb-campaign-name">{CAMPAIGN_META.product}</h1>
                  <span className="bdb-campaign-meta">{CAMPAIGN_META.edition}</span>
                </div>

                <div className="bdb-campaign-bar-right">
                  <div className="bdb-conversion-headline">
                    <span className="bdb-conv-pill">
                      <b>{CAMPAIGN_META.weeklyReorders}</b> of {CAMPAIGN_META.deliveredKits} Cafés Reordered
                    </span>
                    <span className="bdb-conv-subtext">27.9% Trial-to-Recurring Order Conversion</span>
                  </div>
                </div>
              </div>
            </header>

            {/* ─── Horizontally Sliding Analytical Canvas ─── */}
            <div className="bdb-canvas-window">
              <div ref={bodyGridRef} className="bdb-body-grid">
                {/* ═══════════════════════════════════════════════════════════
                    BAY 1: OVERVIEW METRICS & GEOGRAPHIC BANGALORE MAP
                    ═══════════════════════════════════════════════════════════ */}
                <section className="bdb-bay bdb-bay-overview" aria-label="Overview Metrics and Café Map">
                  {/* B. Overview Metrics (4 Cards) */}
                  <div className="bdb-metrics-grid">
                    {OVERVIEW_METRICS.map((m) => (
                      <div key={m.id} className="bdb-metric-card">
                        <div className="bdb-metric-header">
                          <span className="bdb-metric-num">{m.num}</span>
                          <span className="bdb-metric-title">{m.title}</span>
                        </div>

                        <div className="bdb-metric-value">{m.value}</div>

                        <div className="bdb-metric-footer">
                          <span className="bdb-metric-subtext">{m.subtext}</span>

                          {m.type === 'progress' && (
                            <div className="bdb-progress-bar" role="progressbar" aria-valuenow={m.progress} aria-valuemin={0} aria-valuemax={100}>
                              <div className="bdb-progress-fill" style={{ width: `${m.progress}%` }} />
                            </div>
                          )}

                          {m.type === 'pill' && m.badge && (
                            <span className="bdb-metric-badge">{m.badge}</span>
                          )}

                          {m.type === 'sparkline' && m.trend && (
                            <div className="bdb-sparkline-wrap">
                              <SvgSparkline data={m.trend} />
                            </div>
                          )}

                          {m.type === 'revenue' && m.badge && (
                            <span className="bdb-metric-badge badge-purple">{m.badge}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* C. Café Distribution Map (Bangalore Vector Map) */}
                  <div className="bdb-map-card">
                    <div className="bdb-map-header">
                      <div className="bdb-map-header-left">
                        <h3 className="bdb-card-title">Bangalore Café Distribution</h3>
                        <span className="bdb-card-subtitle">120 trial kits seeded across 6 prime café corridors</span>
                      </div>

                      {/* Map Marker Legend */}
                      <div className="bdb-map-legend">
                        <span className="bdb-legend-item">
                          <span className="bdb-legend-dot dot-delivered" /> Delivered (112)
                        </span>
                        <span className="bdb-legend-item">
                          <span className="bdb-legend-dot dot-tried" /> Trial Completed (86)
                        </span>
                        <span className="bdb-legend-item">
                          <span className="bdb-legend-dot dot-reordered" /> Weekly Reorder (24)
                        </span>
                      </div>
                    </div>

                    {/* Interactive SVG Bangalore Map */}
                    <div className="bdb-map-stage">
                      <svg viewBox="0 0 640 360" className="bdb-bangalore-svg" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#502B9A" stopOpacity="0.03" />
                            <stop offset="100%" stopColor="#502B9A" stopOpacity="0" />
                          </radialGradient>
                        </defs>

                        {/* Ambient light base */}
                        <rect width="640" height="360" fill="url(#mapGlow)" />

                        {/* Low-contrast Bangalore street grid & arterial routes */}
                        <g className="bdb-map-roads" stroke="#EBE8F0" strokeWidth="1.2" fill="none">
                          {/* Outer Ring Road (ORR arc) */}
                          <path d="M 120,50 C 220,40 480,60 580,170 C 620,230 540,330 380,350 C 240,350 140,270 120,170 Z" strokeDasharray="4 3" strokeWidth="1.5" stroke="#E2DFE8" />
                          {/* Inner arterial corridors */}
                          <path d="M 140,170 L 520,170" />
                          <path d="M 340,50 L 340,350" />
                          <path d="M 220,90 L 460,310" />
                          <path d="M 460,90 L 220,310" />
                          <path d="M 180,130 Q 340,190 500,130" />
                          <path d="M 180,250 Q 340,170 500,250" />
                          {/* Lake contours (subtle) */}
                          <path d="M 370,155 C 385,150 400,158 395,170 C 390,180 375,175 370,155 Z" fill="#F8F7FA" stroke="#EBE8F0" />
                          <path d="M 420,220 C 450,215 470,230 455,245 C 440,260 415,240 420,220 Z" fill="#F8F7FA" stroke="#EBE8F0" />
                        </g>

                        {/* District / Neighborhood Labels */}
                        <g className="bdb-map-labels" fill="#77727F" fontSize="10.5" fontWeight="600" letterSpacing="0.06em">
                          <text x="395" y="110">INDIRANAGAR</text>
                          <text x="330" y="270">KORAMANGALA</text>
                          <text x="455" y="320">HSR LAYOUT</text>
                          <text x="530" y="105">WHITEFIELD</text>
                          <text x="215" y="240">JAYANAGAR</text>
                          <text x="145" y="150">RAJAJINAGAR</text>
                        </g>

                        {/* All Café Location Markers */}
                        <g className="bdb-map-markers">
                          {BANGALORE_MARKERS.map((m) => {
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
                                {/* Active Ping Ring for Reordered Cafés */}
                                {isReordered && (
                                  <circle r="12" fill="none" stroke="#502B9A" strokeWidth="1.5" className="bdb-marker-ping" />
                                )}

                                {/* Outer Ring */}
                                <circle
                                  r={isReordered ? 7 : 5.5}
                                  fill={isReordered ? '#502B9A' : isTried ? '#FFFFFF' : '#F1ECF8'}
                                  stroke={isReordered ? '#FFFFFF' : '#502B9A'}
                                  strokeWidth={isReordered ? 2 : 1.8}
                                />

                                {/* Core Dot */}
                                {isTried && <circle r="2.5" fill="#502B9A" />}
                              </g>
                            );
                          })}
                        </g>
                      </svg>

                      {/* Tooltip on Hover */}
                      {hoveredMarker && (
                        <div
                          className="bdb-map-tooltip"
                          style={{
                            left: `${(hoveredMarker.x / 640) * 100}%`,
                            top: `${(hoveredMarker.y / 360) * 100}%`,
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
                          {hoveredMarker.volume && (
                            <div className="bdb-tooltip-metric">{hoveredMarker.volume}</div>
                          )}
                        </div>
                      )}

                      {/* Selected Café Profile Card (Click to inspect) */}
                      {selectedCafe && (
                        <div className="bdb-selected-cafe-card">
                          <div className="bdb-cafe-card-top">
                            <div>
                              <span className="bdb-cafe-tag">{selectedCafe.area}</span>
                              <h4 className="bdb-cafe-title">{selectedCafe.name}</h4>
                            </div>
                            <span
                              className={`bdb-cafe-status-badge ${
                                selectedCafe.status === 'reordered'
                                  ? 'badge-reordered'
                                  : selectedCafe.status === 'trial_completed'
                                  ? 'badge-tried'
                                  : 'badge-delivered'
                              }`}
                            >
                              {selectedCafe.status === 'reordered'
                                ? '● Reordered'
                                : selectedCafe.status === 'trial_completed'
                                ? '◎ Tried'
                                : '○ Delivered'}
                            </span>
                          </div>

                          <div className="bdb-cafe-details-row">
                            <div className="bdb-cafe-detail-item">
                              <span className="bdb-detail-label">WEEKLY VOLUME</span>
                              <span className="bdb-detail-val text-purple">{selectedCafe.volume || '18 L/wk'}</span>
                            </div>
                            <div className="bdb-cafe-detail-item">
                              <span className="bdb-detail-label">HEAD BARISTA</span>
                              <span className="bdb-detail-val">{selectedCafe.barista || 'Staff cupping'}</span>
                            </div>
                            <div className="bdb-cafe-detail-item">
                              <span className="bdb-detail-label">SENSORY SCORE</span>
                              <span className="bdb-detail-val">
                                {selectedCafe.rating ? `★ ${selectedCafe.rating}` : 'Pending review'}
                              </span>
                            </div>
                            <div className="bdb-cafe-detail-item">
                              <span className="bdb-detail-label">PO CHANNEL</span>
                              <span className="bdb-detail-val">{selectedCafe.standingPO || 'Verified Net-15'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    BAY 2: TRIAL CONVERSION FUNNEL & BARISTA FEEDBACK
                    ═══════════════════════════════════════════════════════════ */}
                <section className="bdb-bay bdb-bay-conversion" aria-label="Trial Conversion and Feedback">
                  {/* D. Trial Conversion Funnel */}
                  <div className="bdb-funnel-card">
                    <div className="bdb-card-header-simple">
                      <div>
                        <h3 className="bdb-card-title">Trial Conversion Funnel</h3>
                        <span className="bdb-card-subtitle">Complete product lifecycle from warehouse dispatch to repeat order</span>
                      </div>
                      <span className="bdb-pill-indicator">Full Campaign Cycle</span>
                    </div>

                    <div className="bdb-funnel-stages">
                      {FUNNEL_STAGES.map((stg, idx) => (
                        <div key={stg.id} className={`bdb-funnel-step ${stg.highlight ? 'is-highlight' : ''}`}>
                          <div className="bdb-step-header">
                            <span className="bdb-step-index">0{idx + 1}</span>
                            <span className="bdb-step-name">{stg.name}</span>
                          </div>

                          <div className="bdb-step-metric-row">
                            <span className="bdb-step-count">{stg.count}</span>
                            <span className="bdb-step-pct">{stg.pct}</span>
                          </div>

                          <div className="bdb-step-bar-wrap">
                            <div
                              className={`bdb-step-bar-fill ${stg.highlight ? 'bar-purple' : stg.active ? 'bar-medium' : 'bar-muted'}`}
                              style={{ width: `${(stg.count / 120) * 100}%` }}
                            />
                          </div>

                          <span className="bdb-step-dropoff">{stg.drop}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* E. Barista Feedback Intelligence */}
                  <div className="bdb-feedback-card">
                    <div className="bdb-card-header-simple">
                      <div>
                        <h3 className="bdb-card-title">Barista Feedback Intelligence</h3>
                        <span className="bdb-card-subtitle">Sensory ratings across 67 verified specialty café trials</span>
                      </div>
                      <div className="bdb-rating-overall">
                        <span className="bdb-overall-stars">★ 4.8</span>
                        <span className="bdb-overall-count">/ 5.0</span>
                      </div>
                    </div>

                    {/* 4 Horizontal Rating Bars */}
                    <div className="bdb-rating-bars">
                      {FEEDBACK_ATTRS.map((attr) => (
                        <div key={attr.label} className="bdb-attr-row">
                          <div className="bdb-attr-info">
                            <span className="bdb-attr-label">{attr.label}</span>
                            <span className="bdb-attr-score">{attr.score} <small>/ 5.0</small></span>
                          </div>
                          <div className="bdb-attr-track">
                            <div className="bdb-attr-fill" style={{ width: `${attr.pct}%` }} />
                          </div>
                          <span className="bdb-attr-comment">{attr.comment}</span>
                        </div>
                      ))}
                    </div>

                    {/* What Baristas Are Saying (Concise Review Cards) */}
                    <div className="bdb-reviews-section">
                      <h4 className="bdb-reviews-title">What baristas are saying</h4>
                      <div className="bdb-review-cards">
                        {BARISTA_REVIEWS.map((rev, rIdx) => (
                          <div key={rIdx} className="bdb-review-card">
                            <p className="bdb-review-quote">“{rev.quote}”</p>
                            <div className="bdb-review-author">
                              <span className="bdb-author-name">{rev.author}</span>
                              <span className="bdb-author-role">
                                {rev.role} · {rev.cafe} ({rev.area})
                              </span>
                              <span className="bdb-review-stars">{'★'.repeat(rev.stars)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════
                    BAY 3: WEEKLY REORDER INTELLIGENCE & RECENT ACTIVITY
                    ═══════════════════════════════════════════════════════════ */}
                <section className="bdb-bay bdb-bay-reorders" aria-label="Reorders and Activity Feed">
                  {/* F. Weekly Reorder Intelligence */}
                  <div className="bdb-reorder-card">
                    <div className="bdb-card-header-simple">
                      <div>
                        <h3 className="bdb-card-title">Weekly Reorder Intelligence</h3>
                        <span className="bdb-card-subtitle">Active replenishment cadence and commercial volume growth</span>
                      </div>
                      <span className="bdb-pill-indicator text-purple">840 L / Wk</span>
                    </div>

                    {/* High-level Commercial KPI Strip */}
                    <div className="bdb-kpi-strip">
                      <div className="bdb-kpi-item">
                        <span className="bdb-kpi-k">REPEAT CAFÉS</span>
                        <span className="bdb-kpi-v">24</span>
                      </div>
                      <div className="bdb-kpi-item">
                        <span className="bdb-kpi-k">REPEAT CONV.</span>
                        <span className="bdb-kpi-v">27.9%</span>
                      </div>
                      <div className="bdb-kpi-item">
                        <span className="bdb-kpi-k">EST. RECURRING ARR</span>
                        <span className="bdb-kpi-v text-purple">₹2.18L / mo</span>
                      </div>
                    </div>

                    {/* Weekly Order Volume Trend Chart */}
                    <div className="bdb-chart-container">
                      <div className="bdb-chart-title-row">
                        <span className="bdb-chart-label">WEEKLY VOLUME DISPATCH (LITRES)</span>
                        <span className="bdb-chart-sub">Week 1 through Week 6 Projection</span>
                      </div>

                      <div className="bdb-bars-row">
                        {WEEKLY_CHART.map((wc, idx) => (
                          <div
                            key={wc.week}
                            className={`bdb-bar-col ${hoveredWeek === idx ? 'is-hovered' : ''}`}
                            onMouseEnter={() => setHoveredWeek(idx)}
                            onMouseLeave={() => setHoveredWeek(null)}
                          >
                            <div className="bdb-bar-tooltip">
                              <b>{wc.litres} L</b>
                              <small>{wc.cafes} cafés</small>
                            </div>
                            <div className="bdb-bar-track">
                              <div
                                className={`bdb-bar-actual ${wc.projected ? 'bar-projected' : wc.current ? 'bar-current' : ''}`}
                                style={{ height: `${(wc.litres / 1000) * 100}%` }}
                              />
                            </div>
                            <span className="bdb-bar-week">{wc.week}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Compact Strategic Insight Card */}
                    <div className="bdb-insight-banner">
                      <div className="bdb-insight-icon">💡</div>
                      <div className="bdb-insight-text">
                        <b>Indiranagar cafés</b> are showing stronger reorder activity (+38% vs city average), driven by high-velocity oat flat white volume.
                      </div>
                    </div>
                  </div>

                  {/* G. Recent Activity Timeline */}
                  <div className="bdb-activity-card">
                    <div className="bdb-card-header-simple">
                      <div>
                        <h3 className="bdb-card-title">Live Commercial Activity</h3>
                        <span className="bdb-card-subtitle">Real-time sampling flights and recurring PO confirmations</span>
                      </div>
                      <span className="bdb-live-badge">Live feed</span>
                    </div>

                    <div className="bdb-timeline-feed">
                      {RECENT_ACTIVITIES.map((act) => (
                        <div key={act.id} className="bdb-timeline-item">
                          <div className="bdb-item-aside">
                            <span className="bdb-timeline-time">{act.time}</span>
                            <span className="bdb-timeline-pip" />
                          </div>

                          <div className="bdb-item-content">
                            <div className="bdb-item-header">
                              <span className="bdb-item-title">{act.title}</span>
                            </div>
                            <div className="bdb-item-cafe">{act.cafe}</div>
                            <div className="bdb-item-meta">{act.meta}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
