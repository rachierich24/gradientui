'use client';

/* ─────────────────────────────────────────────────────────────────────────────
   GRADIENT — BRAND ANALYTICS DASHBOARD SHOWCASE SECTION
   Role: Principal Staff Design Engineer (Linear · Stripe · Ramp · Notion)
   Design System: Stripe/Linear Hairline System · Electric Indigo (#5B3DF5)
   
   Architecture:
     Tier 1: Global Workspace Header (h: 50px)
     Tier 2: Executive KPI Telemetry Strip (h: 84px)
     Tier 3: Main Analytical Bento Grid (h: 418px)
       • Left: Trial Conversion Funnel + Weekly Reorder Volume
       • Center: Bangalore Café Distribution Cartography + Docked HUD
       • Right: Barista Feedback Sensory Scorecard + Live Commercial Telemetry
       
   Scroll Interaction:
     • Stationary editorial heading block
     • GSAP ScrollTrigger horizontal glide: Left Entrance → Center Dwell → Right Exit
   ───────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/* ─── DATA SYSTEM: Bangalore Café Distribution & Commercial Telemetry ────── */
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
    label: 'KITS DELIVERED',
    valBold: '112',
    valDenom: '/ 120',
    meta: '93.3% completion',
    type: 'progress',
    progress: 93.3,
  },
  {
    id: 'trials',
    num: '02',
    label: 'TRIALS COMPLETED',
    valBold: '86',
    valUnit: 'baristas',
    meta: '76.8% of delivered tried',
    badge: '+14 this week',
    type: 'badge',
  },
  {
    id: 'feedback',
    num: '03',
    label: 'POSITIVE FEEDBACK',
    valBold: '78%',
    meta: '67 verified reviews · ★ 4.8',
    type: 'sparkline',
    trend: [48, 54, 61, 67, 73, 78],
  },
  {
    id: 'reorders',
    num: '04',
    label: 'WEEKLY REORDERS',
    valBold: '24',
    valUnit: 'cafés',
    meta: '27.9% trial-to-recurring',
    badge: '₹2.18L/mo ARR',
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
  { id: 'm1', name: 'Little Brew Room', area: 'Indiranagar', x: 440, y: 110, status: 'reordered', volume: '36 L/wk', barista: 'Aditya K.', rating: 4.9, standingPO: 'Net-15 Active' },
  { id: 'm2', name: 'Subko Specialty Coffee', area: 'Indiranagar', x: 475, y: 95, status: 'reordered', volume: '48 L/wk', barista: 'Rohan M.', rating: 5.0, standingPO: 'Standing PO' },
  { id: 'm3', name: 'Paper & Pie', area: 'Indiranagar', x: 458, y: 130, status: 'reordered', volume: '24 L/wk', barista: 'Sameer V.', rating: 4.8, standingPO: 'Net-15 Active' },
  { id: 'm4', name: 'Araku Coffee Flagship', area: 'Indiranagar', x: 490, y: 118, status: 'trial_completed', volume: 'Review pending', barista: 'Pooja T.', rating: 4.7 },
  { id: 'm5', name: 'Coffee Mechanics', area: 'Indiranagar', x: 420, y: 100, status: 'delivered', volume: 'Trial in progress' },

  // Koramangala Cluster (7 reorders)
  { id: 'm6', name: 'Third Wave Coffee Roasters', area: 'Koramangala', x: 390, y: 165, status: 'reordered', volume: '42 L/wk', barista: 'Priya S.', rating: 4.9, standingPO: 'Net-15 Active' },
  { id: 'm7', name: 'Maverick & Farmer', area: 'Koramangala', x: 418, y: 180, status: 'reordered', volume: '30 L/wk', barista: 'Naveen C.', rating: 4.9, standingPO: 'Standing PO' },
  { id: 'm8', name: 'Second Crack Coffee', area: 'Koramangala', x: 370, y: 155, status: 'reordered', volume: '24 L/wk', barista: 'Divya R.', rating: 4.7, standingPO: 'Net-15 Active' },
  { id: 'm9', name: 'Blue Tokai 4th Block', area: 'Koramangala', x: 428, y: 162, status: 'trial_completed', volume: 'Cupping done', barista: 'Anil B.', rating: 4.8 },
  { id: 'm10', name: 'Slow Sip Studio', area: 'Koramangala', x: 400, y: 192, status: 'delivered', volume: 'Trial in progress' },

  // HSR Layout Cluster (5 reorders)
  { id: 'm11', name: 'Blue Tokai HSR Sector 2', area: 'HSR Layout', x: 480, y: 198, status: 'reordered', volume: '36 L/wk', barista: 'Karthik N.', rating: 4.7, standingPO: 'Net-15 Active' },
  { id: 'm12', name: 'Copper Kettle Café', area: 'HSR Layout', x: 505, y: 185, status: 'reordered', volume: '24 L/wk', barista: 'Manoj T.', rating: 4.6, standingPO: 'Standing PO' },
  { id: 'm13', name: 'Bean & Batch Co.', area: 'HSR Layout', x: 462, y: 210, status: 'trial_completed', volume: 'Tested in Flat White', barista: 'Arjun S.', rating: 4.5 },
  { id: 'm14', name: 'Sector Seven Espresso', area: 'HSR Layout', x: 520, y: 205, status: 'delivered', volume: 'Delivered via Sharma' },

  // Whitefield Cluster
  { id: 'm15', name: 'Brew & Bloom', area: 'Whitefield', x: 610, y: 110, status: 'reordered', volume: '24 L/wk', barista: 'Sahil P.', rating: 4.8, standingPO: 'Net-15 Active' },
  { id: 'm16', name: 'Windmills Craftworks Bar', area: 'Whitefield', x: 640, y: 98, status: 'trial_completed', volume: 'Microfoam verified', barista: 'Anita M.', rating: 4.6 },
  { id: 'm17', name: 'The Caffeine Bar Whitefield', area: 'Whitefield', x: 595, y: 128, status: 'delivered', volume: 'Delivered yesterday' },

  // Jayanagar Cluster (3 reorders)
  { id: 'm18', name: 'Morning Ritual Roasters', area: 'Jayanagar', x: 295, y: 172, status: 'reordered', volume: '30 L/wk', barista: 'Gautam P.', rating: 4.9, standingPO: 'Standing PO' },
  { id: 'm19', name: 'Subbarama Coffee Hub', area: 'Jayanagar', x: 318, y: 188, status: 'trial_completed', volume: 'Testing oat latte', barista: 'Rekha K.', rating: 4.5 },
  { id: 'm20', name: 'Southern Grounds', area: 'Jayanagar', x: 272, y: 160, status: 'delivered', volume: 'Delivery confirmed' },

  // Rajajinagar Cluster
  { id: 'm21', name: 'West End Roastery', area: 'Rajajinagar', x: 180, y: 120, status: 'trial_completed', volume: 'Cupping score 4.7', barista: 'Vikas N.', rating: 4.7 },
  { id: 'm22', name: 'Rajajinagar Artisanal', area: 'Rajajinagar', x: 205, y: 138, status: 'delivered', volume: 'Delivered via Kaveri' },
];

const FUNNEL_STAGES = [
  { id: 'dispatched', idx: '01', name: 'Dispatched', count: 120, pct: '100%', fillPct: 100, highlight: false },
  { id: 'delivered', idx: '02', name: 'Delivered', count: 112, pct: '93.3%', fillPct: 93.3, highlight: false },
  { id: 'trials', idx: '03', name: 'Tried', count: 86, pct: '76.8%', fillPct: 76.8, highlight: false },
  { id: 'feedback', idx: '04', name: 'Reviewed', count: 67, pct: '77.9%', fillPct: 55.8, highlight: false },
  { id: 'reorders', idx: '05', name: 'Weekly POs', count: 24, pct: '27.9%', fillPct: 27.9, highlight: true },
];

const FEEDBACK_ATTRS = [
  { label: 'Foam quality', note: 'Approved for microfoam latte art', score: '4.8', pct: 96, muted: false },
  { label: 'Steaming stability', note: '0% splitting in light roasts', score: '4.7', pct: 94, muted: false },
  { label: 'Taste in flat white', note: 'Clean oat sweetness', score: '4.6', pct: 92, muted: false },
  { label: 'Pricing perception', note: 'Competitive with Net-15 tier', score: '4.1', pct: 82, muted: true },
];

const WEEKLY_CHART = [
  { week: 'W1', litres: 180, cafes: 6, heightPct: 21 },
  { week: 'W2', litres: 340, cafes: 11, heightPct: 38 },
  { week: 'W3', litres: 560, cafes: 16, heightPct: 58 },
  { week: 'W4', litres: 720, cafes: 21, heightPct: 74 },
  { week: 'W5', litres: 840, cafes: 24, heightPct: 88, current: true },
  { week: 'W6', litres: 920, cafes: 26, heightPct: 100, projected: true },
];

const RECENT_ACTIVITIES = [
  {
    id: 'a1',
    time: '12m ago',
    title: 'Trial kit delivered',
    cafe: 'Little Brew Room · Indiranagar',
    meta: 'Sharma Logistics route dispatch',
  },
  {
    id: 'a2',
    time: '48m ago',
    title: 'Barista trial completed',
    cafe: 'Third Wave · Koramangala',
    meta: 'Steamed 8 flat whites · Rated 4.9★',
  },
  {
    id: 'a3',
    time: '4h ago',
    title: 'First recurring order placed',
    cafe: 'Paper & Pie · Indiranagar',
    meta: '36 L/wk standing Net-15 PO',
    highlightMeta: true,
  },
];

/* ─── INLINE SVGS: High-Craft Lucide-Style Icons ──────────────────────────── */
function SvgBrandLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="bdb-logo-svg">
      <rect width="24" height="24" rx="6" fill="#5B3DF5" />
      <path d="M7 16V8M7 8L12 13M12 13L17 8M17 8V16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SvgBell() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function SvgDownload() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SvgChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SvgMicroSparkline({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 72;
  const h = 22;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="bdb-sparkline-svg">
      <defs>
        <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5B3DF5" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#5B3DF5" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#sparklineGrad)" />
      <polyline points={points} fill="none" stroke="#5B3DF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

  // User interactive state
  const [selectedCafe, setSelectedCafe] = useState<MapMarker>(BANGALORE_MARKERS[0]);
  const [hoveredMarker, setHoveredMarker] = useState<MapMarker | null>(null);
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [motionPhase, setMotionPhase] = useState<'entrance' | 'center' | 'exit'>('center');

  // Viewport resize detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ─── Scroll-Driven Horizontal Translation Timeline (GSAP + ScrollTrigger) ── */
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
        scale: 0.98,
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

      // 1. Entrance: Glides from left into screen center
      masterTL.to(frame, {
        x: 0,
        opacity: 1,
        scale: 1,
        ease: 'power2.out',
        duration: 0.33,
      });

      // 2. Center Dwell: Settles stably below stationary heading
      masterTL.to(frame, {
        x: 0,
        opacity: 1,
        scale: 1,
        ease: 'none',
        duration: 0.34,
      });

      // 3. Exit: Glides towards right side and exits
      masterTL.to(frame, {
        x: () => getTravelDistance(),
        opacity: 0,
        scale: 0.98,
        ease: 'power2.in',
        duration: 0.33,
      });
    }, section);

    return () => ctx.revert();
  }, [isMobile]);

  // Phase Jump Helper for Direct Navigation Pills
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

      {/* Main Pinned Stage Container */}
      <div ref={pinWrapRef} className="bdb-pin-wrap">
        <div className="bdb-container">
          {/* ─── 0. STATIONARY EDITORIAL HEADING BLOCK ─── */}
          <div className="bdb-editorial-header">
            {/* Editorial Eyebrow */}
            <div className="bdb-eyebrow">
              <span className="bdb-eyebrow-pip" aria-hidden="true" />
              <span>BRAND INTELLIGENCE PLATFORM · LIVE CAMPAIGN TELEMETRY</span>
            </div>

            {/* Headline, Secondary Copy & Trajectory Control Pills */}
            <div className="bdb-header-row">
              <div className="bdb-title-wrap">
                <h2 className="bdb-title">
                  Watch your trial turn into <span className="bdb-title-purple">weekly orders.</span>
                </h2>
                <p className="bdb-sub">
                  Every kit, every barista's verdict, every café that starts ordering — all the signals behind your brand's growth, in one place.
                </p>
              </div>

              {/* Trajectory Phase Switcher (Linear / Vercel style) */}
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

          {/* ─── THE DASHBOARD FRAME (Visual Hero · Stripe/Linear Hairline System) ─── */}
          <div ref={frameRef} className="bdb-viewport-frame">
            {/* ═══════════════════════════════════════════════════════════
                TIER 1: GLOBAL WORKSPACE HEADER (Height: 50px)
                Notion / Linear Context Switcher + Ramp Controls
                ═══════════════════════════════════════════════════════════ */}
            <header className="bdb-tier-header">
              {/* Left Context Switcher */}
              <div className="bdb-hdr-left">
                <div className="bdb-app-logo-badge">
                  <SvgBrandLogo />
                  <span className="bdb-logo-title">Gradient</span>
                </div>

                <span className="bdb-hdr-slash" aria-hidden="true">/</span>

                <div className="bdb-workspace-badge">
                  <span className="bdb-ws-avatar">OL</span>
                  <span className="bdb-ws-name">{CAMPAIGN_META.brand}</span>
                </div>

                <span className="bdb-hdr-slash" aria-hidden="true">/</span>

                <button type="button" className="bdb-campaign-dropdown-btn">
                  <span>{CAMPAIGN_META.product} (Q4 Launch)</span>
                  <SvgChevronDown className="bdb-chevron-icon" />
                </button>
              </div>

              {/* Right Global Actions */}
              <div className="bdb-hdr-right">
                <div className="bdb-status-pill">
                  <span className="bdb-status-pulse-dot" />
                  <span>Campaign active</span>
                </div>

                <button type="button" className="bdb-date-picker-btn">
                  <span>{CAMPAIGN_META.dateRange}</span>
                  <SvgChevronDown className="bdb-chevron-icon" />
                </button>

                <button type="button" className="bdb-export-action-btn" title="Export CSV / PDF Telemetry Report">
                  <SvgDownload />
                  <span>Export</span>
                </button>

                <button type="button" className="bdb-utility-bell-btn" title="Notifications">
                  <SvgBell />
                  <span className="bdb-bell-unread-dot" />
                </button>

                <div className="bdb-user-avatar-badge" title="Signed in as Brand Administrator">
                  <span>VR</span>
                </div>
              </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════
                TIER 2: EXECUTIVE KPI TELEMETRY STRIP (Height: 84px)
                4 Equal-Width Cells Divided by 1px Hairline Borders
                ═══════════════════════════════════════════════════════════ */}
            <div className="bdb-tier-kpis">
              {KPI_METRICS.map((kpi) => (
                <div key={kpi.id} className="bdb-kpi-cell">
                  {/* Row 1: Index + Label (left) & Metric Context (right) */}
                  <div className="bdb-kpi-row-top">
                    <div className="bdb-kpi-heading-group">
                      <span className="bdb-kpi-num">{kpi.num}</span>
                      <span className="bdb-kpi-label">{kpi.label}</span>
                    </div>
                    <span className="bdb-kpi-meta-sub">{kpi.meta}</span>
                  </div>

                  {/* Row 2: Hero Numerical Stat (left) & Visual Component (right) */}
                  <div className="bdb-kpi-row-bot">
                    <div className="bdb-kpi-value-group">
                      <span className="bdb-kpi-val-bold">{kpi.valBold}</span>
                      {kpi.valDenom && <span className="bdb-kpi-val-denom">{kpi.valDenom}</span>}
                      {kpi.valUnit && <span className="bdb-kpi-val-unit">{kpi.valUnit}</span>}
                    </div>

                    <div className="bdb-kpi-visual-slot">
                      {kpi.type === 'progress' && (
                        <div className="bdb-kpi-progress-track">
                          <div className="bdb-kpi-progress-fill" style={{ width: `${kpi.progress}%` }} />
                        </div>
                      )}

                      {kpi.type === 'badge' && kpi.badge && (
                        <span className="bdb-kpi-delta-pill">{kpi.badge}</span>
                      )}

                      {kpi.type === 'sparkline' && kpi.trend && (
                        <div className="bdb-kpi-sparkline-wrap">
                          <SvgMicroSparkline data={kpi.trend} />
                        </div>
                      )}

                      {kpi.type === 'revenue' && kpi.badge && (
                        <span className="bdb-kpi-revenue-hero-pill">{kpi.badge}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ═══════════════════════════════════════════════════════════
                TIER 3: MAIN ANALYTICAL BENTO GRID (Height: 418px)
                12-Column CSS Grid: Left (3 cols) | Center (6 cols) | Right (3 cols)
                ═══════════════════════════════════════════════════════════ */}
            <div className="bdb-tier-bento">
              {/* ─────────────────────────────────────────────────────────
                  LEFT COLUMN (col-span-3): Funnel & Weekly Reorder Volume
                  ───────────────────────────────────────────────────────── */}
              <div className="bdb-bento-col bdb-bento-col-left">
                {/* 1. Trial Conversion Funnel */}
                <div className="bdb-panel bdb-funnel-panel">
                  <div className="bdb-panel-header">
                    <div>
                      <h3 className="bdb-panel-title">Trial Conversion Funnel</h3>
                      <p className="bdb-panel-sub">Sampling seed to recurring weekly orders</p>
                    </div>
                    <span className="bdb-subtle-badge">Full Cycle</span>
                  </div>

                  <div className="bdb-funnel-rows">
                    {FUNNEL_STAGES.map((stg) => (
                      <div
                        key={stg.id}
                        className={`bdb-funnel-row ${stg.highlight ? 'is-bottom-line' : ''}`}
                      >
                        <div className="bdb-funnel-z1">
                          <span className="bdb-funnel-idx">{stg.idx}</span>
                          <span className="bdb-funnel-label">{stg.name}</span>
                        </div>

                        <div className="bdb-funnel-z2">
                          <div className="bdb-funnel-track">
                            <div
                              className={`bdb-funnel-fill ${stg.highlight ? 'fill-primary' : 'fill-muted'}`}
                              style={{ width: `${stg.fillPct}%` }}
                            />
                          </div>
                        </div>

                        <div className="bdb-funnel-z3">
                          <span className="bdb-funnel-count">{stg.count}</span>
                          <span className="bdb-funnel-pct">{stg.pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Weekly Reorder Volume */}
                <div className="bdb-panel bdb-volume-panel">
                  <div className="bdb-panel-header">
                    <div>
                      <h3 className="bdb-panel-title">Weekly Reorder Volume</h3>
                      <p className="bdb-panel-sub">Litres dispatched & ARR run-rate</p>
                    </div>
                    <span className="bdb-brand-subtle-pill">840 L/wk</span>
                  </div>

                  {/* 6-Column Bar Chart with Reference Grid Lines */}
                  <div className="bdb-chart-wrap">
                    {/* Horizontal Reference Grid Hairlines */}
                    <div className="bdb-chart-gridline gridline-top" aria-hidden="true" />
                    <div className="bdb-chart-gridline gridline-mid" aria-hidden="true" />

                    <div className="bdb-chart-columns">
                      {WEEKLY_CHART.map((wc, idx) => (
                        <div
                          key={wc.week}
                          className={`bdb-chart-col-item ${hoveredWeek === idx ? 'is-hovered' : ''}`}
                          onMouseEnter={() => setHoveredWeek(idx)}
                          onMouseLeave={() => setHoveredWeek(null)}
                        >
                          {/* Tooltip on Hover */}
                          <div className="bdb-col-tooltip">
                            <span className="bdb-tt-litres">{wc.litres} L</span>
                            <span className="bdb-tt-cafes">{wc.cafes} cafés</span>
                          </div>

                          <div className="bdb-col-bar-track">
                            <div
                              className={`bdb-col-bar-fill ${
                                wc.projected ? 'bar-projected' : wc.current ? 'bar-current' : 'bar-historical'
                              }`}
                              style={{ height: `${wc.heightPct}%` }}
                            />
                          </div>

                          <span className={`bdb-col-x-label ${wc.projected ? 'label-strong' : ''}`}>
                            {wc.week}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hairline Divided 3-Column Footer Metric Strip */}
                  <div className="bdb-volume-footer-strip">
                    <div className="bdb-vol-foot-cell">
                      <span className="bdb-vol-foot-bold">24</span>
                      <span className="bdb-vol-foot-lbl">Repeat Cafés</span>
                    </div>
                    <div className="bdb-vol-foot-divider" aria-hidden="true" />
                    <div className="bdb-vol-foot-cell">
                      <span className="bdb-vol-foot-bold">36L</span>
                      <span className="bdb-vol-foot-lbl">Avg/wk</span>
                    </div>
                    <div className="bdb-vol-foot-divider" aria-hidden="true" />
                    <div className="bdb-vol-foot-cell">
                      <span className="bdb-vol-foot-bold text-brand">₹2.18L/mo</span>
                      <span className="bdb-vol-foot-lbl">ARR</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  CENTER COLUMN (col-span-6): Bangalore Cartography & Docked HUD
                  ───────────────────────────────────────────────────────── */}
              <div className="bdb-bento-col bdb-bento-col-center">
                <div className="bdb-panel bdb-map-panel">
                  {/* Cartography Header & Interactive Legend */}
                  <div className="bdb-panel-header bdb-map-header">
                    <div>
                      <h3 className="bdb-panel-title">Bangalore Café Distribution</h3>
                      <p className="bdb-panel-sub">120 trial kits seeded across 6 prime corridors</p>
                    </div>

                    <div className="bdb-carto-legend">
                      <span className="bdb-carto-legend-item">
                        <span className="bdb-legend-marker marker-delivered-ring" />
                        <span>Delivered (112)</span>
                      </span>
                      <span className="bdb-carto-legend-item">
                        <span className="bdb-legend-marker marker-tried-dot" />
                        <span>Tried (86)</span>
                      </span>
                      <span className="bdb-carto-legend-item">
                        <span className="bdb-legend-marker marker-reorder-solid" />
                        <span>Reordered (24)</span>
                      </span>
                    </div>
                  </div>

                  {/* Recessed Cartography Canvas Stage */}
                  <div className="bdb-carto-stage">
                    <svg viewBox="0 0 760 330" className="bdb-carto-svg" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        {/* Architectural Dot Grid Pattern */}
                        <pattern id="archDotGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                          <circle cx="2" cy="2" r="0.9" fill="#D4D4D8" />
                        </pattern>
                      </defs>

                      {/* Recessed Canvas Background Fill */}
                      <rect width="760" height="330" fill="#FAFAFA" />
                      <rect width="760" height="330" fill="url(#archDotGrid)" opacity="0.85" />

                      {/* Concentric Catchment Geometry & Axis Crosshairs */}
                      <g className="bdb-carto-geometry" stroke="#E4E4E7" strokeWidth="1" strokeDasharray="3 3" fill="none">
                        {/* Horizontal & Vertical Crosshairs */}
                        <line x1="90" y1="145" x2="670" y2="145" />
                        <line x1="420" y1="35" x2="420" y2="255" />

                        {/* Concentric Catchment Rings */}
                        <circle cx="420" cy="145" r="70" opacity="0.6" />
                        <circle cx="420" cy="145" r="145" opacity="0.45" />
                        <circle cx="420" cy="145" r="220" opacity="0.3" />
                      </g>

                      {/* Organic Catchment Hull Outlining Active Corridor Nodes */}
                      <path
                        d="M 160,118 C 230,70 420,55 640,88 C 670,118 650,150 540,215 C 470,240 330,225 240,205 C 160,180 145,142 160,118 Z"
                        stroke="#C4B5FD"
                        strokeWidth="1.2"
                        strokeDasharray="4 4"
                        fill="rgba(245, 243, 255, 0.45)"
                      />

                      {/* Corridor Typography Labels with Crisp Pill Backgrounds */}
                      <g className="bdb-corridor-labels">
                        {/* INDIRANAGAR */}
                        <g transform="translate(440, 68)">
                          <rect x="-4" y="-10" width="76" height="15" rx="3" fill="rgba(255,255,255,0.88)" stroke="#E4E4E7" strokeWidth="0.75" />
                          <text x="34" y="1" fill="#71717A" fontSize="9" fontWeight="600" letterSpacing="0.08em" textAnchor="middle">INDIRANAGAR</text>
                        </g>

                        {/* KORAMANGALA */}
                        <g transform="translate(360, 206)">
                          <rect x="-4" y="-10" width="82" height="15" rx="3" fill="rgba(255,255,255,0.88)" stroke="#E4E4E7" strokeWidth="0.75" />
                          <text x="37" y="1" fill="#71717A" fontSize="9" fontWeight="600" letterSpacing="0.08em" textAnchor="middle">KORAMANGALA</text>
                        </g>

                        {/* HSR LAYOUT */}
                        <g transform="translate(500, 226)">
                          <rect x="-4" y="-10" width="68" height="15" rx="3" fill="rgba(255,255,255,0.88)" stroke="#E4E4E7" strokeWidth="0.75" />
                          <text x="30" y="1" fill="#71717A" fontSize="9" fontWeight="600" letterSpacing="0.08em" textAnchor="middle">HSR LAYOUT</text>
                        </g>

                        {/* WHITEFIELD */}
                        <g transform="translate(595, 78)">
                          <rect x="-4" y="-10" width="70" height="15" rx="3" fill="rgba(255,255,255,0.88)" stroke="#E4E4E7" strokeWidth="0.75" />
                          <text x="31" y="1" fill="#71717A" fontSize="9" fontWeight="600" letterSpacing="0.08em" textAnchor="middle">WHITEFIELD</text>
                        </g>

                        {/* JAYANAGAR */}
                        <g transform="translate(240, 182)">
                          <rect x="-4" y="-10" width="66" height="15" rx="3" fill="rgba(255,255,255,0.88)" stroke="#E4E4E7" strokeWidth="0.75" />
                          <text x="29" y="1" fill="#71717A" fontSize="9" fontWeight="600" letterSpacing="0.08em" textAnchor="middle">JAYANAGAR</text>
                        </g>

                        {/* RAJAJINAGAR */}
                        <g transform="translate(145, 102)">
                          <rect x="-4" y="-10" width="74" height="15" rx="3" fill="rgba(255,255,255,0.88)" stroke="#E4E4E7" strokeWidth="0.75" />
                          <text x="33" y="1" fill="#71717A" fontSize="9" fontWeight="600" letterSpacing="0.08em" textAnchor="middle">RAJAJINAGAR</text>
                        </g>
                      </g>

                      {/* 22 Interactive Spatial Café Nodes */}
                      <g className="bdb-carto-nodes">
                        {BANGALORE_MARKERS.map((m) => {
                          const isReordered = m.status === 'reordered';
                          const isTried = m.status === 'trial_completed';
                          const isSelected = selectedCafe?.id === m.id;

                          return (
                            <g
                              key={m.id}
                              className={`bdb-spatial-node ${isSelected ? 'is-active-node' : ''}`}
                              transform={`translate(${m.x}, ${m.y})`}
                              onMouseEnter={() => setHoveredMarker(m)}
                              onMouseLeave={() => setHoveredMarker(null)}
                              onClick={() => setSelectedCafe(m)}
                            >
                              {/* Selected Active Outer Focus Pulse */}
                              {isSelected && (
                                <circle r="12" fill="none" stroke="#5B3DF5" strokeWidth="1.5" className="bdb-pulse-ring" />
                              )}

                              {/* Reordered Halo */}
                              {isReordered && !isSelected && (
                                <circle r="9" fill="none" stroke="#5B3DF5" strokeWidth="1" strokeOpacity="0.25" />
                              )}

                              {/* Core Node Circle */}
                              <circle
                                r={isReordered ? 5.5 : 4.5}
                                fill={isReordered ? '#5B3DF5' : isTried ? '#DDD6FE' : '#FFFFFF'}
                                stroke={isReordered ? '#FFFFFF' : '#5B3DF5'}
                                strokeWidth={isReordered ? 1.75 : 1.5}
                              />

                              {/* Inner Tried Dot */}
                              {isTried && <circle r="2" fill="#5B3DF5" />}
                            </g>
                          );
                        })}
                      </g>
                    </svg>

                    {/* Interactive Marker Hover Tooltip */}
                    {hoveredMarker && (
                      <div
                        className="bdb-carto-tooltip"
                        style={{
                          left: `${(hoveredMarker.x / 760) * 100}%`,
                          top: `${(hoveredMarker.y / 330) * 100}%`,
                        }}
                      >
                        <span className="bdb-tt-name">{hoveredMarker.name}</span>
                        <span className="bdb-tt-sub">
                          {hoveredMarker.area} ·{' '}
                          <span className={hoveredMarker.status === 'reordered' ? 'text-brand' : ''}>
                            {hoveredMarker.status === 'reordered'
                              ? 'Weekly Reordered'
                              : hoveredMarker.status === 'trial_completed'
                              ? 'Trial Completed'
                              : 'Kit Delivered'}
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Docked Floating HUD Inspection Card (Linear/Ramp Elevated Inspector) */}
                    {selectedCafe && (
                      <div className="bdb-docked-hud-card">
                        {/* HUD Top Bar */}
                        <div className="bdb-hud-top-bar">
                          <div className="bdb-hud-title-wrap">
                            <span className="bdb-hud-name">{selectedCafe.name}</span>
                            <span className="bdb-hud-corridor">{selectedCafe.area}</span>
                          </div>

                          <div className="bdb-hud-status-badge">
                            <span className="bdb-hud-status-dot" />
                            <span>
                              {selectedCafe.status === 'reordered'
                                ? 'Weekly Reorder Active'
                                : selectedCafe.status === 'trial_completed'
                                ? 'Trial Completed'
                                : 'Kit Delivered'}
                            </span>
                          </div>
                        </div>

                        {/* HUD 4-Column Metric Grid Divided by Hairlines */}
                        <div className="bdb-hud-metrics-grid">
                          <div className="bdb-hud-metric-cell">
                            <span className="bdb-hud-metric-lbl">WEEKLY VOLUME</span>
                            <span className="bdb-hud-metric-val text-brand">{selectedCafe.volume || '36 L/wk'}</span>
                          </div>

                          <div className="bdb-hud-vdivider" aria-hidden="true" />

                          <div className="bdb-hud-metric-cell">
                            <span className="bdb-hud-metric-lbl">HEAD BARISTA</span>
                            <span className="bdb-hud-metric-val">{selectedCafe.barista || 'Aditya K.'}</span>
                          </div>

                          <div className="bdb-hud-vdivider" aria-hidden="true" />

                          <div className="bdb-hud-metric-cell">
                            <span className="bdb-hud-metric-lbl">CUPPING SCORE</span>
                            <span className="bdb-hud-metric-val">
                              <span className="text-brand">★</span> {selectedCafe.rating ? selectedCafe.rating.toFixed(1) : '4.9'}
                            </span>
                          </div>

                          <div className="bdb-hud-vdivider" aria-hidden="true" />

                          <div className="bdb-hud-metric-cell">
                            <span className="bdb-hud-metric-lbl">PO CHANNEL</span>
                            <span className="bdb-hud-metric-val po-val-row">
                              <span className="bdb-emerald-live-dot" />
                              <span>{selectedCafe.standingPO || 'Net-15 Active'}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  RIGHT COLUMN (col-span-3): Barista Feedback & Telemetry
                  ───────────────────────────────────────────────────────── */}
              <div className="bdb-bento-col bdb-bento-col-right">
                {/* 1. Barista Feedback Sensory Scorecard */}
                <div className="bdb-panel bdb-feedback-panel">
                  <div className="bdb-panel-header">
                    <div>
                      <h3 className="bdb-panel-title">Barista Feedback</h3>
                      <p className="bdb-panel-sub">Sensory ratings across 67 trials</p>
                    </div>
                    <span className="bdb-scorecard-badge">★ 4.8 / 5.0</span>
                  </div>

                  {/* 4 Sensory Metric Rows */}
                  <div className="bdb-sensory-rows">
                    {FEEDBACK_ATTRS.map((attr) => (
                      <div key={attr.label} className="bdb-sensory-row">
                        <div className="bdb-sensory-meta-line">
                          <span className="bdb-sensory-name">{attr.label}</span>
                          <span className="bdb-sensory-consensus">· {attr.note}</span>
                          <span className="bdb-sensory-score">{attr.score}</span>
                        </div>
                        <div className="bdb-sensory-track">
                          <div
                            className={`bdb-sensory-fill ${attr.muted ? 'fill-muted-indigo' : 'fill-primary'}`}
                            style={{ width: `${attr.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Editorial Verbatim Callout Box */}
                  <div className="bdb-verbatim-box">
                    <p className="bdb-verbatim-quote">
                      “Exceptional microfoam for latte art without scalding.”
                    </p>
                    <span className="bdb-verbatim-author">
                      — Rohan M., Head Barista · Maverick & Farmer
                    </span>
                  </div>
                </div>

                {/* 2. Live Commercial Telemetry Stream (Ramp Activity Pattern) */}
                <div className="bdb-panel bdb-telemetry-panel">
                  <div className="bdb-panel-header">
                    <div>
                      <h3 className="bdb-panel-title">Live Commercial Telemetry</h3>
                      <p className="bdb-panel-sub">Route dispatches & Net-15 POs</p>
                    </div>
                    <div className="bdb-live-pulse-badge">
                      <span className="bdb-live-emerald-dot" />
                      <span>Live</span>
                    </div>
                  </div>

                  {/* Vertical Timeline Stream */}
                  <div className="bdb-timeline-stream">
                    <div className="bdb-timeline-vertical-line" aria-hidden="true" />

                    {RECENT_ACTIVITIES.map((act) => (
                      <div key={act.id} className="bdb-timeline-event">
                        {/* Left: Monospace Timestamp */}
                        <div className="bdb-event-time-col">
                          <span className="bdb-event-time">{act.time}</span>
                        </div>

                        {/* Right: Node Indicator + 2-Line Event Content */}
                        <div className="bdb-event-content-col">
                          <span className="bdb-event-node-dot" />
                          <div className="bdb-event-line1">{act.title}</div>
                          <div className="bdb-event-line2">
                            <span className="bdb-event-cafe">{act.cafe}</span>
                            <span className="bdb-event-divider"> — </span>
                            <span className={`bdb-event-meta ${act.highlightMeta ? 'meta-brand' : ''}`}>
                              {act.meta}
                            </span>
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
    </section>
  );
}