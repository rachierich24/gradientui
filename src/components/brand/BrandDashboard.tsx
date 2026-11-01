'use client';

/* ─────────────────────────────────────────────────────────────────────────────
   GRADIENT — BRAND ANALYTICS DASHBOARD
   Design System: White & Purple (#502B9A)
   Inspiration: Linear · Stripe · Ramp · Vercel
   Experience:
     • Single-screen command center (ultra-compact vertical footprint, 100% visible)
     • Pinned GSAP ScrollTrigger moves the whole dashboard horizontally across the screen:
       Left off-screen → Center dwell → Right off-screen
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
  edition: 'Bangalore · 120 kits · 9 suppliers',
  status: 'Active Campaign',
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
    badge: '+14 this wk',
    type: 'badge',
  },
  {
    id: 'feedback',
    num: '03',
    label: 'Positive Feedback',
    value: '78%',
    meta: '67 reviews · ★ 4.8',
    type: 'sparkline',
    trend: [48, 55, 62, 69, 74, 78],
  },
  {
    id: 'reorders',
    num: '04',
    label: 'Weekly Reorders',
    value: '24 cafés',
    meta: '27.9% net conv.',
    badge: '₹2.18L / mo ARR',
    type: 'revenue',
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
  { id: 'm1', name: 'Little Brew Room', area: 'Indiranagar', x: 395, y: 88, status: 'reordered', volume: '36 L/wk', barista: 'Aditya K.', rating: 4.9, standingPO: 'Net-15 Active' },
  { id: 'm2', name: 'Subko Specialty Coffee', area: 'Indiranagar', x: 425, y: 76, status: 'reordered', volume: '48 L/wk', barista: 'Rohan M.', rating: 5.0, standingPO: 'Standing PO' },
  { id: 'm3', name: 'Paper & Pie', area: 'Indiranagar', x: 410, y: 102, status: 'reordered', volume: '24 L/wk', barista: 'Sameer V.', rating: 4.8, standingPO: 'Net-15 Active' },
  { id: 'm4', name: 'Araku Coffee Flagship', area: 'Indiranagar', x: 438, y: 92, status: 'trial_completed', volume: 'Review pending', barista: 'Pooja T.', rating: 4.7 },
  { id: 'm5', name: 'Coffee Mechanics', area: 'Indiranagar', x: 378, y: 80, status: 'delivered', volume: 'Trial in progress' },

  // Koramangala Cluster (7 reorders)
  { id: 'm6', name: 'Third Wave Coffee Roasters', area: 'Koramangala', x: 350, y: 130, status: 'reordered', volume: '42 L/wk', barista: 'Priya S.', rating: 4.9, standingPO: 'Net-15 Active' },
  { id: 'm7', name: 'Maverick & Farmer', area: 'Koramangala', x: 375, y: 142, status: 'reordered', volume: '30 L/wk', barista: 'Naveen C.', rating: 4.9, standingPO: 'Standing PO' },
  { id: 'm8', name: 'Second Crack Coffee', area: 'Koramangala', x: 332, y: 122, status: 'reordered', volume: '24 L/wk', barista: 'Divya R.', rating: 4.7, standingPO: 'Net-15 Active' },
  { id: 'm9', name: 'Blue Tokai 4th Block', area: 'Koramangala', x: 382, y: 128, status: 'trial_completed', volume: 'Cupping done', barista: 'Anil B.', rating: 4.8 },
  { id: 'm10', name: 'Slow Sip Studio', area: 'Koramangala', x: 358, y: 150, status: 'delivered', volume: 'Trial in progress' },

  // HSR Layout Cluster (5 reorders)
  { id: 'm11', name: 'Blue Tokai HSR Sector 2', area: 'HSR Layout', x: 428, y: 155, status: 'reordered', volume: '36 L/wk', barista: 'Karthik N.', rating: 4.7, standingPO: 'Net-15 Active' },
  { id: 'm12', name: 'Copper Kettle Café', area: 'HSR Layout', x: 448, y: 145, status: 'reordered', volume: '24 L/wk', barista: 'Manoj T.', rating: 4.6, standingPO: 'Standing PO' },
  { id: 'm13', name: 'Bean & Batch Co.', area: 'HSR Layout', x: 412, y: 165, status: 'trial_completed', volume: 'Tested in Flat White', barista: 'Arjun S.', rating: 4.5 },
  { id: 'm14', name: 'Sector Seven Espresso', area: 'HSR Layout', x: 460, y: 160, status: 'delivered', volume: 'Delivered via Sharma' },

  // Whitefield Cluster
  { id: 'm15', name: 'Brew & Bloom', area: 'Whitefield', x: 545, y: 88, status: 'reordered', volume: '24 L/wk', barista: 'Sahil P.', rating: 4.8, standingPO: 'Net-15 Active' },
  { id: 'm16', name: 'Windmills Craftworks Bar', area: 'Whitefield', x: 570, y: 78, status: 'trial_completed', volume: 'Microfoam verified', barista: 'Anita M.', rating: 4.6 },
  { id: 'm17', name: 'The Caffeine Bar Whitefield', area: 'Whitefield', x: 530, y: 102, status: 'delivered', volume: 'Delivered yesterday' },

  // Jayanagar Cluster (3 reorders)
  { id: 'm18', name: 'Morning Ritual Roasters', area: 'Jayanagar', x: 265, y: 135, status: 'reordered', volume: '30 L/wk', barista: 'Gautam P.', rating: 4.9, standingPO: 'Standing PO' },
  { id: 'm19', name: 'Subbarama Coffee Hub', area: 'Jayanagar', x: 285, y: 148, status: 'trial_completed', volume: 'Testing oat latte', barista: 'Rekha K.', rating: 4.5 },
  { id: 'm20', name: 'Southern Grounds', area: 'Jayanagar', x: 245, y: 125, status: 'delivered', volume: 'Delivery confirmed' },

  // Rajajinagar Cluster
  { id: 'm21', name: 'West End Roastery', area: 'Rajajinagar', x: 165, y: 95, status: 'trial_completed', volume: 'Cupping score 4.7', barista: 'Vikas N.', rating: 4.7 },
  { id: 'm22', name: 'Rajajinagar Artisanal', area: 'Rajajinagar', x: 185, y: 110, status: 'delivered', volume: 'Delivered via Kaveri' },
];

const FUNNEL_STAGES = [
  { id: 'dispatched', name: 'Dispatched', count: 120, pct: '100%', highlight: false },
  { id: 'delivered', name: 'Delivered', count: 112, pct: '93.3%', highlight: false },
  { id: 'trials', name: 'Completed', count: 86, pct: '76.8%', highlight: false },
  { id: 'feedback', name: 'Feedback', count: 67, pct: '77.9%', highlight: false },
  { id: 'reorders', name: 'Weekly POs', count: 24, pct: '27.9%', highlight: true },
];

const FEEDBACK_ATTRS = [
  { label: 'Foam quality', score: 4.8, pct: 96, note: 'Approved for microfoam' },
  { label: 'Steaming stability', score: 4.7, pct: 94, note: '0% splitting in roasts' },
  { label: 'Taste in flat white', score: 4.6, pct: 92, note: 'Clean oat sweetness' },
  { label: 'Pricing perception', score: 4.1, pct: 82, note: 'Volume Net-15 tier' },
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
    title: 'Trial kit delivered',
    cafe: 'Little Brew Room · Indiranagar',
  },
  {
    id: 'a2',
    time: '48m ago',
    title: 'Barista trial completed (★5.0)',
    cafe: 'Third Wave · Koramangala',
  },
  {
    id: 'a3',
    time: '4h ago',
    title: 'Standing Net-15 PO (36 L/wk)',
    cafe: 'Paper & Pie · Indiranagar',
  },
];

/* ─── INLINE SVGS ────────────────────────────────────────────────────────── */
function SvgGradientLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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

function SvgSparkline({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 56;
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
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      <polygon points={areaPoints} fill="rgba(80, 43, 154, 0.08)" />
      <polyline points={points} fill="none" stroke="#502B9A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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
  const [selectedCafe, setSelectedCafe] = useState<MapMarker>(BANGALORE_MARKERS[0]);
  const [hoveredMarker, setHoveredMarker] = useState<MapMarker | null>(null);
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [motionPhase, setMotionPhase] = useState<'entrance' | 'center' | 'exit'>('center');

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
     • Phase 2 (33% - 67%): Settles in center of screen for inspection
     • Phase 3 (67% - 100%): Moves towards right side of screen and goes away
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
        const frameW = frame.offsetWidth || 1280;
        return Math.round((winW + frameW) / 2 + 80);
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
          start: 'top 70px',
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

      // 2. Settling & Center Dwell: Rests in center of screen
      masterTL.to(frame, {
        x: 0,
        opacity: 1,
        scale: 1,
        ease: 'none',
        duration: 0.34,
      });

      // 3. Exit: Moves towards right side and goes away off-screen
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
    <section ref={sectionRef} className="bdb-section" id="dashboard" aria-label="Brand Analytics Dashboard">
      <div className="bdb-bg-ambient" aria-hidden="true" />

      {/* Main Pinned Stage */}
      <div ref={pinWrapRef} className="bdb-pin-wrap">
        <div className="bdb-container">
          {/* ─── 0. Editorial Header (Watch your trial turn into weekly orders.) ─── */}
          <div className="bdb-editorial-header">
            <div className="bdb-header-row">
              <div className="bdb-title-wrap">
                <div className="bdb-eyebrow">
                  <span className="bdb-eyebrow-pip" aria-hidden="true" />
                  <span>BRAND INTELLIGENCE PLATFORM · LIVE CAMPAIGN TELEMETRY</span>
                </div>
                <h2 className="bdb-title">
                  Watch your trial turn into <span className="bdb-title-purple">weekly orders.</span>
                </h2>
                <p className="bdb-sub">
                  Every kit, every barista’s verdict and every café that starts ordering, in one dashboard only your brand can see.
                </p>
              </div>

              {/* Trajectory Phase Switcher */}
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

          {/* ─── The Whole Dashboard (Compact, Minimal, Single-Screen Viewport) ─── */}
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
                    <span className="bdb-campaign-chip">{CAMPAIGN_META.product} (Q4)</span>
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

              {/* KPI Summary Strip: All 4 key metrics in one compact, horizontal hairline row */}
              <div className="bdb-kpi-bar">
                {KPI_METRICS.map((kpi) => (
                  <div key={kpi.id} className="bdb-kpi-cell">
                    <div className="bdb-kpi-meta-row">
                      <span className="bdb-kpi-idx">{kpi.num}</span>
                      <span className="bdb-kpi-label">{kpi.label}</span>
                    </div>

                    <div className="bdb-kpi-main-row">
                      <span className="bdb-kpi-val">{kpi.value}</span>
                      {kpi.type === 'progress' && (
                        <div className="bdb-kpi-progress">
                          <div className="bdb-kpi-progress-fill" style={{ width: `${kpi.progress}%` }} />
                        </div>
                      )}
                      {kpi.type === 'badge' && kpi.badge && (
                        <span className="bdb-kpi-badge">{kpi.badge}</span>
                      )}
                      {kpi.type === 'sparkline' && kpi.trend && (
                        <div className="bdb-kpi-sparkline">
                          <SvgSparkline data={kpi.trend} />
                        </div>
                      )}
                      {kpi.type === 'revenue' && kpi.badge && (
                        <span className="bdb-kpi-badge badge-purple">{kpi.badge}</span>
                      )}
                    </div>

                    <span className="bdb-kpi-sub">{kpi.meta}</span>
                  </div>
                ))}
              </div>
            </header>

            {/* Main 3-Column Body Grid */}
            <div className="bdb-body-grid">
              {/* ═══════════════════════════════════════════════════════════
                  COLUMN 1: CONVERSION FUNNEL & REORDER CADENCE
                  ═══════════════════════════════════════════════════════════ */}
              <div className="bdb-col bdb-col-left">
                {/* 1. Trial Conversion Funnel */}
                <div className="bdb-card bdb-funnel-card">
                  <div className="bdb-card-header">
                    <div>
                      <h3 className="bdb-card-title">Trial Conversion Funnel</h3>
                      <span className="bdb-card-sub">Seed to recurring order</span>
                    </div>
                    <span className="bdb-pill-indicator">Full Cycle</span>
                  </div>

                  <div className="bdb-funnel-list">
                    {FUNNEL_STAGES.map((stg, idx) => (
                      <div key={stg.id} className={`bdb-funnel-row ${stg.highlight ? 'is-highlight' : ''}`}>
                        <div className="bdb-f-left">
                          <span className="bdb-f-idx">0{idx + 1}</span>
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

                {/* 2. Weekly Reorder Volume & ARR */}
                <div className="bdb-card bdb-reorder-card">
                  <div className="bdb-card-header">
                    <div>
                      <h3 className="bdb-card-title">Weekly Reorder Volume</h3>
                      <span className="bdb-card-sub">Litres dispatched & ARR run-rate</span>
                    </div>
                    <span className="bdb-pill-indicator text-purple">840 L/wk</span>
                  </div>

                  <div className="bdb-bars-compact">
                    {WEEKLY_CHART.map((wc, idx) => (
                      <div
                        key={wc.week}
                        className={`bdb-bar-item ${hoveredWeek === idx ? 'is-hovered' : ''}`}
                        onMouseEnter={() => setHoveredWeek(idx)}
                        onMouseLeave={() => setHoveredWeek(null)}
                      >
                        <div className="bdb-bar-tooltip">
                          <b>{wc.litres} L</b>
                          <small>{wc.cafes} cafés</small>
                        </div>
                        <div className="bdb-bar-track">
                          <div
                            className={`bdb-bar-fill ${wc.projected ? 'is-projected' : wc.current ? 'is-current' : ''}`}
                            style={{ height: `${(wc.litres / 1000) * 100}%` }}
                          />
                        </div>
                        <span className="bdb-bar-label">{wc.week}</span>
                      </div>
                    ))}
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

                  {/* SVG Map Canvas with docked floating detail card */}
                  <div className="bdb-map-stage">
                    <svg viewBox="0 0 640 260" className="bdb-bangalore-svg" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <radialGradient id="mapGlowCompact" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#502B9A" stopOpacity="0.04" />
                          <stop offset="100%" stopColor="#502B9A" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      <rect width="640" height="260" fill="url(#mapGlowCompact)" />

                      {/* Low-contrast road grid */}
                      <g className="bdb-map-roads" stroke="#ECE8F2" strokeWidth="1.1" fill="none">
                        <path d="M 120,30 C 220,20 480,40 580,120 C 620,160 540,210 380,215 C 240,215 140,180 120,120 Z" strokeDasharray="4 3" strokeWidth="1.2" stroke="#E2DFE8" />
                        <path d="M 140,110 L 520,110" />
                        <path d="M 340,25 L 340,210" />
                        <path d="M 220,50 L 460,195" />
                        <path d="M 460,50 L 220,195" />
                        <path d="M 180,80 Q 340,120 500,80" />
                        <path d="M 180,155 Q 340,110 500,155" />
                      </g>

                      {/* Corridor Labels */}
                      <g className="bdb-map-labels" fill="#77727F" fontSize="9" fontWeight="650" letterSpacing="0.06em">
                        <text x="395" y="68">INDIRANAGAR</text>
                        <text x="325" y="172">KORAMANGALA</text>
                        <text x="448" y="188">HSR LAYOUT</text>
                        <text x="525" y="68">WHITEFIELD</text>
                        <text x="210" y="152">JAYANAGAR</text>
                        <text x="140" y="88">RAJAJINAGAR</text>
                      </g>

                      {/* Interactive Markers */}
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
                              {isReordered && (
                                <circle r="9" fill="none" stroke="#502B9A" strokeWidth="1.2" className="bdb-marker-ping" />
                              )}
                              <circle
                                r={isReordered ? 5.5 : 4.5}
                                fill={isReordered ? '#502B9A' : isTried ? '#FFFFFF' : '#F1ECF8'}
                                stroke={isReordered ? '#FFFFFF' : '#502B9A'}
                                strokeWidth={isReordered ? 1.6 : 1.4}
                              />
                              {isTried && <circle r="2" fill="#502B9A" />}
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
                          left: `${(hoveredMarker.x / 640) * 100}%`,
                          top: `${(hoveredMarker.y / 260) * 100}%`,
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

                    {/* Docked Floating Café Intelligence Card */}
                    {selectedCafe && (
                      <div className="bdb-cafe-dock-card">
                        <div className="bdb-dock-header">
                          <div className="bdb-dock-title-group">
                            <span className="bdb-dock-name">{selectedCafe.name}</span>
                            <span className="bdb-dock-area">{selectedCafe.area}</span>
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
                            <span className="bdb-dock-label">PO CHANNEL</span>
                            <span className="bdb-dock-val">{selectedCafe.standingPO || 'Verified Net-15'}</span>
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
                {/* 1. Barista Feedback Intelligence */}
                <div className="bdb-card bdb-feedback-card">
                  <div className="bdb-card-header">
                    <div>
                      <h3 className="bdb-card-title">Barista Feedback</h3>
                      <span className="bdb-card-sub">Sensory ratings across 67 trials</span>
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
                          <span className="bdb-attr-name">{attr.label}</span>
                          <span className="bdb-attr-num">{attr.score}</span>
                        </div>
                        <div className="bdb-attr-track">
                          <div className="bdb-attr-fill" style={{ width: `${attr.pct}%` }} />
                        </div>
                        <span className="bdb-attr-sub">{attr.note}</span>
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

                {/* 2. Live Commercial Telemetry Feed */}
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
                        <span className="bdb-act-time">{act.time}</span>
                        <div className="bdb-act-body">
                          <span className="bdb-act-title">{act.title}</span>
                          <span className="bdb-act-cafe">{act.cafe}</span>
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
