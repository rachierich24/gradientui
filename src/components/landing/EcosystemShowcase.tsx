'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValueEvent,
} from 'framer-motion';
import { Icon } from './icons';

/* ─────────────────────────────────────────────────────────────────────────
   GRABBIT ECOSYSTEM → CAFÉ STORY CONTINUOUS SHOWCASE
   Architecture:
   - CONTINUOUS TWO-CHAPTER NARRATIVE:
       Chapter 1: One Connected Ecosystem (Blue Background · Dashboards + Phone)
       Transition: Dashboards recede (-80px / +80px), background shifts to #FFFCF3
       Chapter 2: Cafés Section (Cream Background · Flanking Copy + Pinned Phone)
   - SHARED PERSISTENT PHONE:
       The central smartphone NEVER disappears or remounts.
       It remains the physical visual anchor throughout the entire experience.
   - TWO-PHASE PRODUCT FILM SYSTEM:
       In Chapter 1: Phone displays an authentic, polished STATIC Café starting screen.
       In Chapter 2: Phone comes alive with the independent 6-state looping product film!
   - SCROLL IS SEPARATED FROM FILM PLAYBACK:
       Scroll controls entrance, dashboard exit, pinning, and section release.
       Scroll does NOT scrub video progress.
───────────────────────────────────────────────────────────────────────── */

export type CafeFilmState =
  | 'DISCOVER'
  | 'SELECT'
  | 'ORDER'
  | 'CONFIRM'
  | 'TRACK'
  | 'DELIVER';

interface FilmStep {
  state: CafeFilmState;
  duration: number; // in milliseconds
  chapter: string;
}

const CAFE_FILM_STEPS: FilmStep[] = [
  { state: 'TRACK', duration: 8000, chapter: '03 / 04 · TRACK' },
  { state: 'DELIVER', duration: 5000, chapter: '04 / 04 · DELIVER' },
  { state: 'DISCOVER', duration: 5000, chapter: '01 / 04 · DISCOVER' },
  { state: 'ORDER', duration: 5000, chapter: '02 / 04 · ORDER' },
];

export function EcosystemShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion();

  // Visibility state via IntersectionObserver (pauses playback when off-screen)
  const [isVisible, setIsVisible] = useState(false);

  // Chapter 2 Café Section Activation State
  // Turned on when user scrolls past the transition threshold (~48% of track)
  const [isCafeActive, setIsCafeActive] = useState(false);

  // Hover Focus State for Chapter 1 (Supplier Left · Phone Center · Brand Right)
  const [hoveredScreen, setHoveredScreen] = useState<'supplier' | 'mobile' | 'brand' | null>(null);

  // Subtle Pointer-Response Parallax State (Requirement 17)
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Time-based Product Film State Machine (Active only in Chapter 2)
  const [filmIndex, setFilmIndex] = useState(0);

  // IntersectionObserver for viewport awareness
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Track scroll progress along the continuous narrative track
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  // Inertial spring smoothing: absorbs mouse wheel notches into liquid continuous motion
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    mass: 0.28,
    restDelta: 0.0001,
  });

  // Activate Café product film when scroll reaches the Café chapter
  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    const active = latest >= 0.32;
    setIsCafeActive(active);
    if (!active && latest < 0.32) {
      setFilmIndex(0); // Reset to first frame when returning to ecosystem
    } else if (active) {
      setHoveredScreen(null); // Clear hover in Café section
    }

    // Immediately clear hover state as soon as user begins scrolling down
    if (latest > 0.08) {
      setHoveredScreen(null);
    }

    // Requirement 18: Disable / neutralize pointer parallax immediately during scroll
    setIsScrolling(true);
    setPointerOffset({ x: 0, y: 0 });
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 180);
  });

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isScrolling || isCafeActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // 2-3px subtle spatial response (Requirement 17)
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6; // -3px to +3px
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6; // -3px to +3px
    setPointerOffset({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  };

  const handlePointerLeave = () => {
    setHoveredScreen(null);
    setPointerOffset({ x: 0, y: 0 });
  };

  // Independent Time-Driven Product Film Loop (runs ONLY when isCafeActive && isVisible)
  useEffect(() => {
    if (!isCafeActive || !isVisible || isReduced) return;

    const currentStep = CAFE_FILM_STEPS[filmIndex];

    const timer = setTimeout(() => {
      setFilmIndex((prev) => (prev + 1) % CAFE_FILM_STEPS.length);
    }, currentStep.duration);

    return () => clearTimeout(timer);
  }, [isCafeActive, isVisible, filmIndex, isReduced]);

  const currentStep = CAFE_FILM_STEPS[filmIndex];
  const currentState = isCafeActive ? currentStep.state : 'DISCOVER';

  // ─── Continuous Scroll Interpolations (Smooth, Paced & Tangible Downward Motion) ───
  
  // 1. Seamless background transition from White to Café Red (#E03527):
  const containerBg = useTransform(
    smoothProgress,
    [0.0, 0.12, 0.46, 1.0],
    [
      '#FFFFFF', // Holds White comfortably through Chapter 1
      '#FFFFFF', // Begins graceful color shift at 0.12
      '#E03527', // Smoothly saturates to full Café Red at 0.46
      '#E03527', // Holds Café Red throughout Chapter 2 until unpin
    ]
  );

  useMotionValueEvent(containerBg, 'change', (latest) => {
    document.documentElement.style.setProperty('--universe-bg', latest);
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--universe-bg', containerBg.get());
  }, [containerBg]);

  // 2. Chapter 1 Ecosystem Header Copy: glides gently upward and fades out
  const ecoTextOpacity = useTransform(smoothProgress, [0.0, 0.10, 0.32], [1, 1, 0]);
  const ecoTextY = useTransform(smoothProgress, [0.0, 0.10, 0.32], [0, 0, -60]);

  // 3. Side dashboards (Supplier Left & Brand Right):
  // Gracefully recede outward, scale down, and float upward
  const supplierX = useTransform(smoothProgress, [0.0, 0.10, 0.36], [0, 0, -80]);
  const supplierY = useTransform(smoothProgress, [0.0, 0.10, 0.36], [0, 0, -45]);
  const supplierScale = useTransform(smoothProgress, [0.0, 0.10, 0.36], [1.0, 1.0, 0.92]);
  const supplierOpacity = useTransform(smoothProgress, [0.0, 0.10, 0.34], [1, 1, 0]);

  const brandX = useTransform(smoothProgress, [0.0, 0.10, 0.36], [0, 0, 80]);
  const brandY = useTransform(smoothProgress, [0.0, 0.10, 0.36], [0, 0, -45]);
  const brandScale = useTransform(smoothProgress, [0.0, 0.10, 0.36], [1.0, 1.0, 0.92]);
  const brandOpacity = useTransform(smoothProgress, [0.0, 0.10, 0.34], [1, 1, 0]);

  // 4. Central Phone Protagonist:
  // Starts slightly elevated in Chapter 1 (-16px), then glides DOWN smoothly into place (+6px)
  // while scaling into prominent, commanding hero display (1.00 -> 1.44).
  // Remains at scale 1.44 throughout and after the transition.
  const phoneY = useTransform(
    smoothProgress,
    [0.0, 0.12, 0.44, 1.0],
    [-16, -16, 6, 6]
  );
  const phoneScale = useTransform(
    smoothProgress,
    [0.0, 0.12, 0.44, 1.0],
    [1.00, 1.00, 1.44, 1.44]
  );
  const phoneOpacity = useTransform(smoothProgress, [0.0, 1.0], [1, 1]);

  // 5. Chapter 2 Café story flanking content (Headline left + 4 narrative cards right):
  // Glides smoothly UP from below (+70px -> 0px) over a generous, comfortable scroll window
  // giving the unmistakable sensation of descending into the new section
  const cafeContentY = useTransform(
    smoothProgress,
    [0.0, 0.16, 0.46, 1.0],
    [70, 70, 0, 0]
  );
  const cafeContentOpacity = useTransform(
    smoothProgress,
    [0.0, 0.16, 0.44, 1.0],
    [0, 0, 1, 1]
  );

  const stageBg = isReduced ? '#FFFFFF' : 'var(--universe-bg, #FFFFFF)';

  return (
    <section
      className="eco-track"
      ref={trackRef}
      id="ecosystem"
      aria-label="Grabbit Ecosystem and Café Workflow"
    >
      {/* Anchor for direct navigation to Café story */}
      <div id="for-cafes" className="eco-cafe-anchor" aria-hidden="true" />

      <motion.div
        className="eco-sticky-stage"
        ref={containerRef}
        style={{
          backgroundColor: stageBg,
        }}
      >
        {/* Organic top curve from hero */}
        <div className="eco-top-curve" aria-hidden="true">
          <svg
            viewBox="0 0 1440 40"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M0,40 Q720,0 1440,40 L1440,40 L0,40 Z"
              style={{ fill: stageBg }}
            />
          </svg>
        </div>

        {/* Radial illumination aura */}
        <div className="eco-radial-glow" aria-hidden="true" />

        {/* ─── CHAPTER 1: ONE CONNECTED ECOSYSTEM COPY ─── */}
        <div className="eco-container">
          <motion.div
            className="eco-text-wrap"
            style={
              isReduced
                ? { opacity: 1, y: 0 }
                : { opacity: ecoTextOpacity, y: ecoTextY }
            }
          >
            <div className="eco-eyebrow">ONE CONNECTED ECOSYSTEM</div>
            <h2 className="eco-headline">
              <span>How your café</span>
              <span>sources, orders &amp; tracks.</span>
              <span>In real time.</span>
            </h2>
            <p className="eco-body">
              Watch one order move from café to supplier to delivery — with every side of the ecosystem connected.
            </p>
          </motion.div>
        </div>

        {/* ─── CHAPTER 2: CAFÉ STORY FLANKING CONTENT (85-90% Neutral Cream · 10-15% Yellow Accents) ─── */}
        <motion.div
          className="eco-cafe-story-wrap"
          style={
            isReduced
              ? { opacity: 1, y: 0 }
              : {
                  opacity: cafeContentOpacity,
                  y: cafeContentY,
                  pointerEvents: isCafeActive ? 'auto' : 'none',
                }
          }
        >
          {/* Left Panel: Headline & Value Proposition */}
          <div className="eco-cafe-left-panel">
            <span className="eco-cafe-eyebrow">FOR CAFÉS</span>
            <h2 className="eco-cafe-headline">
              Everything your<br />
              café needs.<br />
              From order to<br />
              delivery.
            </h2>
            <p className="eco-cafe-body">
              Discover products, place orders, track fulfilment, and keep your inventory moving — all from one place.
            </p>
          </div>

          {/* Right Panel: 4 Supporting Narrative Points */}
          <div className="eco-cafe-right-panel">
            <div
              className={`eco-cafe-step ${currentState === 'DISCOVER' ? 'is-active-step' : ''}`}
              onClick={() => setFilmIndex(2)}
            >
              <div className="eco-cafe-step-header">
                <span className="eco-cafe-step-num">01</span>
                <h5 className="eco-cafe-step-title">Discover suppliers</h5>
              </div>
              <p className="eco-cafe-step-desc">
                Direct access to verified specialty roasters, dairy partners, and bar supplies with transparent wholesale rates.
              </p>
            </div>

            <div
              className={`eco-cafe-step ${currentState === 'ORDER' ? 'is-active-step' : ''}`}
              onClick={() => setFilmIndex(3)}
            >
              <div className="eco-cafe-step-header">
                <span className="eco-cafe-step-num">02</span>
                <h5 className="eco-cafe-step-title">Order in seconds</h5>
              </div>
              <p className="eco-cafe-step-desc">
                One consolidated Net-15 basket across every roaster and vendor. Zero manual WhatsApp PO errors.
              </p>
            </div>

            <div
              className={`eco-cafe-step ${currentState === 'TRACK' ? 'is-active-step' : ''}`}
              onClick={() => setFilmIndex(0)}
            >
              <div className="eco-cafe-step-header">
                <span className="eco-cafe-step-num">03</span>
                <h5 className="eco-cafe-step-title">Track every delivery</h5>
              </div>
              <p className="eco-cafe-step-desc">
                Live dispatch timeline with driver details, cold-chain temperature verification, and guaranteed delivery SLA.
              </p>
            </div>

            <div
              className={`eco-cafe-step ${currentState === 'DELIVER' ? 'is-active-step' : ''}`}
              onClick={() => setFilmIndex(1)}
            >
              <div className="eco-cafe-step-header">
                <span className="eco-cafe-step-num">04</span>
                <h5 className="eco-cafe-step-title">Keep inventory moving</h5>
              </div>
              <p className="eco-cafe-step-desc">
                Automated digital stock reconciliation the instant the barista signs the delivery manifest.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─── 3D VIEWPORT WITH PERSISTENT SHARED OBJECTS ─── */}
        <div
          className="eco-stage-viewport"
          style={{
            ['--px' as any]: `${pointerOffset.x}px`,
            ['--py' as any]: `${pointerOffset.y}px`,
          }}
        >
          <div className="eco-screens-group">
            {/* ─────────────────────────────────────────────────────────
                LEFT SCREEN: SUPPLIER DESKTOP DASHBOARD (16:9 Aspect Ratio)
                Visible in Chapter 1 · Recedes into Chapter 2
            ─────────────────────────────────────────────────────────── */}
            <motion.div
              className={`eco-browser-window eco-screen-supplier ${
                hoveredScreen === 'supplier'
                  ? 'is-hovered'
                  : hoveredScreen !== null
                  ? 'is-dimmed'
                  : ''
              }`}
              onMouseEnter={() => !isCafeActive && setHoveredScreen('supplier')}
              onMouseMove={handlePointerMove}
              onMouseLeave={handlePointerLeave}
              style={
                isReduced
                  ? { transform: 'none', opacity: 0.95 }
                  : {
                      x: supplierX,
                      y: supplierY,
                      scale: supplierScale,
                      opacity: supplierOpacity,
                      pointerEvents: isCafeActive ? 'none' : 'auto',
                      zIndex: hoveredScreen === 'supplier' ? 40 : 10,
                    }
              }
            >
              <div className="eco-device-scaler">
                {/* Chrome Top Bar */}
                <div className="eco-chrome">
                  <div className="eco-chrome-dots">
                    <span className="eco-dot eco-dot-red" />
                    <span className="eco-dot eco-dot-yellow" />
                    <span className="eco-dot eco-dot-green" />
                  </div>
                  <div className="eco-url-bar">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>supplier.grabbit.io/live-orders</span>
                  </div>
                  <div className="eco-window-role-badge badge-supplier">SUPPLIER</div>
                </div>

                {/* App Body */}
                <div className="eco-app-body">
                  {/* Sidebar - Compact Icon Rail (~40px) */}
                  <div className="eco-sidebar">
                    <div className="eco-sidebar-brand">
                      <div className="eco-logo-dot">g</div>
                    </div>
                    <nav className="eco-nav-list">
                      <div className="eco-nav-item active-supplier" title="Overview">
                        <Icon.Dashboard size={13} />
                      </div>
                      <div className="eco-nav-item" title="Orders">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                        </svg>
                      </div>
                      <div className="eco-nav-item" title="Suppliers">
                        <Icon.Users size={13} />
                      </div>
                      <div className="eco-nav-item" title="Analytics">
                        <Icon.Chart size={13} />
                      </div>
                      <div className="eco-nav-item" title="Fleet">
                        <Icon.Truck size={13} />
                      </div>
                      <div className="eco-nav-item eco-nav-bottom" title="Settings">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                      </div>
                    </nav>
                  </div>

                  {/* Main Content Area */}
                  <div className="eco-main-content">
                    <div className="eco-content-header">
                      <div className="eco-title-group">
                        <h4>Wholesale Orders &amp; Dispatch</h4>
                        <span>Koramangala Hub · Blue Tokai Wholesale Operations</span>
                      </div>
                      <div className="eco-header-actions">
                        <span className="eco-badge-live">
                          <span className="eco-dot-pulse" />
                          Live Feed
                        </span>
                      </div>
                    </div>

                    {/* Supplier KPI Row */}
                    <div className="eco-kpi-row">
                      <div className="eco-kpi-card">
                        <div className="eco-kpi-val" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                          <span style={{ fontSize: '18px', fontWeight: 700 }}>{hoveredScreen === 'supplier' ? '39' : '38'}</span> <span className="eco-kpi-badge" style={{ color: '#16A34A', fontSize: '9px', fontWeight: 600 }}>↑ 26%</span>
                        </div>
                        <div className="eco-kpi-label" style={{ margin: 0 }}>Orders Today</div>
                      </div>
                      <div className="eco-kpi-card">
                        <div className="eco-kpi-val" style={{ marginBottom: '3px', fontSize: '18px', fontWeight: 700 }}>
                          16
                        </div>
                        <div className="eco-kpi-label" style={{ margin: 0 }}>POs on entry</div>
                      </div>
                      <div className="eco-kpi-card">
                        <div className="eco-kpi-val" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px', color: '#16A34A' }}>
                          <span style={{ fontSize: '18px', fontWeight: 700 }}>98.8%</span> <span className="eco-kpi-badge" style={{ color: '#16A34A', fontSize: '9px', fontWeight: 600 }}>↑ 2.2%</span>
                        </div>
                        <div className="eco-kpi-label" style={{ margin: 0 }}>On-time SLA</div>
                      </div>
                    </div>

                    {/* Fleet Route Strip */}
                    <div className="eco-ai-banner eco-banner-supplier">
                      <div className="eco-truck-circle">
                        <Icon.Truck size={12} style={{ color: '#16A34A' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span style={{ color: '#0F172A', fontSize: '9.5px', fontWeight: 700 }}>
                          Fleet Route #B-04: Koramangala → Indiranagar
                        </span>
                        <span style={{ color: '#64748B', fontSize: '8px', marginTop: '1px' }}>
                          Driver Ramesh · In Transit · ETA 12:05 PM
                        </span>
                      </div>
                      <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: 700 }}>›</span>
                    </div>

                    {/* Live Wholesale Orders Table */}
                    <table className="eco-table">
                      <thead>
                        <tr>
                          <th>ORDER ID</th>
                          <th>CAFÉ</th>
                          <th>ITEMS</th>
                          <th>AMOUNT</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Subtle new row appears when hovered */}
                        {hoveredScreen === 'supplier' && (
                          <tr className="eco-table-row eco-table-row-new">
                            <td>
                              <strong>#GRB-1048</strong>
                            </td>
                            <td>Subko Coffee</td>
                            <td>Arabica AA 10kg</td>
                            <td style={{ fontWeight: 600, color: '#16A34A' }}>₹7,200</td>
                            <td>
                              <span className="eco-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>New</span>
                            </td>
                          </tr>
                        )}
                        <tr className="eco-table-row">
                          <td>
                            <strong>#GRB-1047</strong>
                          </td>
                          <td>Subko Coffee</td>
                          <td>Arabica AA 10kg</td>
                          <td style={{ fontWeight: 600 }}>₹7,200</td>
                          <td>
                            <span className="eco-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>In Transit</span>
                          </td>
                        </tr>
                        <tr className="eco-table-row">
                          <td>
                            <strong>#GRB-1046</strong>
                          </td>
                          <td>Araku Coffee</td>
                          <td>Barista Oat (12L)</td>
                          <td style={{ fontWeight: 600 }}>₹5,520</td>
                          <td>
                            <span className="eco-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>Delivered</span>
                          </td>
                        </tr>
                        <tr className="eco-table-row">
                          <td>
                            <strong>#GRB-1045</strong>
                          </td>
                          <td>Third Wave</td>
                          <td>Ripple Cups (1000s)</td>
                          <td style={{ fontWeight: 600 }}>₹4,260</td>
                          <td>
                            <span className="eco-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>Packed</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ─────────────────────────────────────────────────────────
                CENTER OBJECT: PERSISTENT SMARTPHONE PROTAGONIST (100% Focus)
                Remains front-facing & stationary across Chapter 1 & 2!
            ─────────────────────────────────────────────────────────── */}
            <motion.div
              className={`eco-screen-mobile ${
                hoveredScreen === 'mobile'
                  ? 'is-hovered'
                  : hoveredScreen !== null
                  ? 'is-dimmed'
                  : ''
              }`}
              onMouseEnter={() => !isCafeActive && setHoveredScreen('mobile')}
              onMouseMove={handlePointerMove}
              onMouseLeave={handlePointerLeave}
              style={
                isReduced
                  ? { transform: 'none' }
                  : {
                      y: phoneY,
                      scale: phoneScale,
                      opacity: phoneOpacity,
                      zIndex: hoveredScreen === 'mobile' ? 45 : 20,
                    }
              }
            >
              <div className="eco-device-scaler">
                {/* Realistic Ambient Floating Drop Shadow behind phone */}
                <div className="eco-phone-back-shadow" aria-hidden="true" />
                <div className="eco-phone-chassis">
                  {/* Physical Hardware Side Buttons */}
                  <div className="eco-phone-btn eco-btn-action" aria-hidden="true" />
                  <div className="eco-phone-btn eco-btn-vol-up" aria-hidden="true" />
                  <div className="eco-phone-btn eco-btn-vol-down" aria-hidden="true" />
                  <div className="eco-phone-btn eco-btn-power" aria-hidden="true" />

                  {/* Speaker Micro-Slit */}
                  <div className="eco-phone-speaker" aria-hidden="true" />

                  {/* Inner Screen Display */}
                  <div className="eco-phone-screen-container">
                    {/* Physical Glass Surface Reflection */}
                    <div className="eco-phone-glass-glare" aria-hidden="true" />

                    {/* Dynamic Island Cutout */}
                    <div className="eco-phone-island" aria-hidden="true">
                      <div className="eco-island-pill">
                        <span className="eco-island-dot" />
                      </div>
                    </div>

                    {/* Realistic iOS Status Bar */}
                    <div className="eco-phone-statusbar">
                      <span className="eco-phone-time">9:41</span>
                      <div className="eco-phone-icons">
                        <svg className="eco-phone-sig" viewBox="0 0 17 11" fill="currentColor">
                          <rect x="0" y="7" width="2.5" height="4" rx="0.6" />
                          <rect x="4" y="5" width="2.5" height="6" rx="0.6" />
                          <rect x="8" y="2.5" width="2.5" height="8.5" rx="0.6" />
                          <rect x="12" y="0" width="2.5" height="11" rx="0.6" />
                        </svg>
                        <svg className="eco-phone-wifi" viewBox="0 0 15 11" fill="currentColor">
                          <path d="M7.5 11a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4zM3.8 7.3a5.2 5.2 0 0 1 7.4 0 .8.8 0 0 0 1.1-1.1 6.8 6.8 0 0 0-9.6 0 .8.8 0 1 0 1.1 1.1zM1.2 4.7a8.8 8.8 0 0 1 12.6 0 .8.8 0 0 0 1.1-1.1 10.4 10.4 0 0 0-14.8 0 .8.8 0 1 0 1.1 1.1z" />
                        </svg>
                        <div className="eco-phone-batt">
                          <div className="eco-phone-batt-fill" />
                        </div>
                      </div>
                    </div>

                    {/* ─── Phone Screen Content (Static in Ch.1 · Film in Ch.2) ─── */}
                    <div className="eco-phone-viewport">
                      {/* SCENE 01: DISCOVER (Active or Static) */}
                      {currentState === 'DISCOVER' && (
                        <div className="eco-film-scene scene-discover" key="discover">
                          <div className="eco-mob-top-nav">
                            <div className="eco-mob-avatar">BT</div>
                            <div>
                              <span className="eco-mob-greeting" style={{ fontSize: '9.5px', fontWeight: 700, color: '#0F172A' }}>Blue Tokai</span>
                              <h5 className="eco-mob-cafe-name" style={{ fontSize: '8px', color: '#64748B', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '2px' }}>Koramangala <span>⌄</span></h5>
                            </div>
                            <div className="eco-mob-cart-icon">
                              <Icon.Cart size={13} />
                              <span className="eco-mob-badge" style={{ background: '#E03527', width: '10px', height: '10px', top: '-1px', right: '-1px', fontSize: '6px' }}>5</span>
                            </div>
                          </div>

                          {/* Search Bar */}
                          <div className={isCafeActive ? "eco-mob-search-active-bar" : `eco-mob-search-trigger ${hoveredScreen === 'mobile' ? 'is-focused' : ''}`}>
                            <Icon.Search size={12} />
                            {isCafeActive ? (
                              <>
                                <span className="eco-typed-query">Arabica Beans<span className="eco-cursor">|</span></span>
                                <span className="eco-search-clear">×</span>
                              </>
                            ) : (
                              <>
                                <span style={{ color: '#94A3B8', fontWeight: 400, fontSize: '8.5px' }}>Search products, brands, or categories</span>
                                {hoveredScreen === 'mobile' && <span className="eco-cursor">|</span>}
                              </>
                            )}
                          </div>

                          {/* Category Navigation */}
                          <div className="eco-mob-chips">
                            <span className="eco-chip active">All</span>
                            <span className="eco-chip">Beans</span>
                            <span className="eco-chip">Dairy</span>
                            <span className="eco-chip">Syrups</span>
                            <span className="eco-chip">Cups</span>
                            <span className="eco-chip">More</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                            <div className="eco-mob-section-title" style={{ margin: 0, textTransform: 'none', color: '#0F172A', fontSize: '10px', fontWeight: 700 }}>Verified Suppliers</div>
                            <div style={{ fontSize: '7.5px', color: '#64748B', fontWeight: 600 }}>View all →</div>
                          </div>
                          <div className="eco-mob-suppliers-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '12px' }}>
                            <div className="eco-mob-supp-card active-card" style={{ padding: '4px 2px' }}>
                              <div className="eco-supp-circle" style={{ width: '18px', height: '18px', fontSize: '7px' }}>BT</div>
                              <span style={{ fontSize: '7px' }}>Blue Tokai</span>
                              <small style={{ fontSize: '6px' }}>2h dispatch</small>
                            </div>
                            <div className="eco-mob-supp-card" style={{ padding: '4px 2px' }}>
                              <div className="eco-supp-circle" style={{ width: '18px', height: '18px', fontSize: '7px', background: '#FFFFFF', color: '#16A34A', border: '1px solid #E2E8F0' }}>🌲</div>
                              <span style={{ fontSize: '7px' }}>Araku</span>
                              <small style={{ fontSize: '6px' }}>1d dispatch</small>
                            </div>
                            <div className="eco-mob-supp-card" style={{ padding: '4px 2px' }}>
                              <div className="eco-supp-circle" style={{ width: '18px', height: '18px', fontSize: '7px', background: '#F1F5F9', color: '#0F172A' }}>SUB</div>
                              <span style={{ fontSize: '7px' }}>Subko</span>
                              <small style={{ fontSize: '6px' }}>Direct origin</small>
                            </div>
                            <div className="eco-mob-supp-card" style={{ padding: '4px 2px' }}>
                              <div className="eco-supp-circle" style={{ width: '18px', height: '18px', fontSize: '7px', background: '#0F172A', color: '#FFFFFF' }}>TW</div>
                              <span style={{ fontSize: '7px' }}>Third Wave</span>
                              <small style={{ fontSize: '6px' }}>1d dispatch</small>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                            <div className="eco-mob-section-title" style={{ margin: 0, textTransform: 'none', color: '#0F172A', fontSize: '10px', fontWeight: 700 }}>Top Products</div>
                            <div style={{ fontSize: '7.5px', color: '#64748B', fontWeight: 600 }}>View all →</div>
                          </div>
                          
                          <div className="eco-mob-product-list">
                            {/* Product 1 */}
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              marginBottom: '8px',
                              padding: '2px 4px',
                              borderRadius: '6px',
                              background: hoveredScreen === 'mobile' ? 'rgba(250, 204, 21, 0.08)' : 'transparent',
                              transition: 'background 0.2s ease',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img 
                                  src="/landing/arabica-beans.jpg" 
                                  alt="Arabica AA Beans" 
                                  style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} 
                                />
                                <div>
                                  <h6 style={{ margin: 0, fontSize: '9px', fontWeight: 700, color: '#0F172A' }}>Arabica AA Specialty Roast</h6>
                                  <span style={{ display: 'block', fontSize: '7.5px', color: '#64748B', margin: '1px 0' }}>Blue Tokai · Medium Viennese</span>
                                  <strong style={{ fontSize: '8.5px', color: '#0F172A' }}>₹820 / kg</strong>
                                </div>
                              </div>
                              <div style={{ 
                                width: '16px', 
                                height: '16px', 
                                background: '#0F172A', 
                                borderRadius: '50%', 
                                color: '#FFFFFF', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '12px', 
                                cursor: 'pointer',
                                transform: hoveredScreen === 'mobile' ? 'scale(1.15)' : 'scale(1)',
                                transition: 'transform 0.2s ease',
                              }}>+</div>
                            </div>

                            {/* Product 2 */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', padding: '2px 4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img 
                                  src="/landing/oat-milk.jpg" 
                                  alt="Barista Oat Milk" 
                                  style={{ width: '28px', height: '28px', objectFit: 'contain', background: '#F8FAFC', borderRadius: '4px', flexShrink: 0 }} 
                                />
                                <div>
                                  <h6 style={{ margin: 0, fontSize: '9px', fontWeight: 700, color: '#0F172A' }}>Barista Oat Milk</h6>
                                  <span style={{ display: 'block', fontSize: '7.5px', color: '#64748B', margin: '1px 0' }}>Minor Figures</span>
                                  <strong style={{ fontSize: '8.5px', color: '#0F172A' }}>₹420 / 1L</strong>
                                </div>
                              </div>
                              <div style={{ width: '16px', height: '16px', background: '#0F172A', borderRadius: '50%', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer' }}>+</div>
                            </div>

                            {/* Product 3 */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', padding: '2px 4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img 
                                  src="/landing/chocolate-syrup.jpg" 
                                  alt="Chocolate Syrup" 
                                  style={{ width: '28px', height: '28px', objectFit: 'contain', background: '#F8FAFC', borderRadius: '4px', flexShrink: 0 }} 
                                />
                                <div>
                                  <h6 style={{ margin: 0, fontSize: '9px', fontWeight: 700, color: '#0F172A' }}>Chocolate Syrup</h6>
                                  <span style={{ display: 'block', fontSize: '7.5px', color: '#64748B', margin: '1px 0' }}>Monin</span>
                                  <strong style={{ fontSize: '8.5px', color: '#0F172A' }}>₹680 / 700ml</strong>
                                </div>
                              </div>
                              <div style={{ width: '16px', height: '16px', background: '#0F172A', borderRadius: '50%', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer' }}>+</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SCENE 02: SELECT (Product Detail + Stepper) */}
                      {currentState === 'SELECT' && (
                        <div className="eco-film-scene scene-select" key="select">
                          <div className="eco-mob-back-strip">
                            <span>Product Specification · Indiranagar</span>
                            <span className="eco-mob-badge-cart">Available</span>
                          </div>

                          {/* Product Detail Card */}
                          <div className="eco-order-spec-card">
                            <div className="eco-order-spec-head">
                              <div className="eco-order-spec-icon">☕</div>
                              <div>
                                <h5>Arabica AA Specialty Roast</h5>
                                <small>Blue Tokai · Medium Vienna Roast</small>
                              </div>
                              <span className="eco-order-spec-rate">₹820 / 1 kg</span>
                            </div>
                            <div className="eco-stepper-row">
                              <button className="eco-step-btn" aria-label="Decrease quantity">−</button>
                              <span className="eco-step-val">2 kg</span>
                              <button className="eco-step-btn" aria-label="Increase quantity">+</button>
                              <span className="eco-stepper-calc-inline">₹1,640</span>
                            </div>
                            <div className="eco-added-btn-inline">
                              <Icon.Check size={11} />
                              <span>✓ 2 kg Added to order</span>
                            </div>
                          </div>

                          {/* Delivery SLA Note */}
                          <div className="eco-warehouse-note" style={{ marginTop: '8px' }}>
                            <span>⚡ Direct from Koramangala Roasting Hub · Ready for 12:05 PM morning dispatch.</span>
                          </div>
                        </div>
                      )}

                      {/* SCENE 03: ORDER (Cart Drawer) */}
                      {currentState === 'ORDER' && (
                        <div className="eco-film-scene scene-order" key="order">
                          <div className="eco-mob-back-strip">
                            <span>Your Order</span>
                            <span className="eco-mob-badge-cart">3 items</span>
                          </div>

                          {/* Order Basket items */}
                          <div className="eco-basket-items-list">
                            <div className="eco-basket-row">
                              <div className="eco-b-dot" />
                              <div className="eco-b-info">
                                <strong>2 × Arabica AA Specialty Roast</strong>
                                <small>Blue Tokai Roasters (2 kg)</small>
                              </div>
                              <span className="eco-b-price">₹1,640</span>
                            </div>
                            <div className="eco-basket-row">
                              <div className="eco-b-dot" />
                              <div className="eco-b-info">
                                <strong>1 × Barista Oat Milk (6L)</strong>
                                <small>Urban Platter Direct</small>
                              </div>
                              <span className="eco-b-price">₹690</span>
                            </div>
                            <div className="eco-basket-row">
                              <div className="eco-b-dot" />
                              <div className="eco-b-info">
                                <strong>3 × Natural Dark Chocolate Syrup</strong>
                                <small>Artisan Syrups Co.</small>
                              </div>
                              <span className="eco-b-price">₹1,130</span>
                            </div>
                          </div>

                          {/* Basket Summary */}
                          <div className="eco-basket-summary">
                            <div className="eco-sum-total">
                              <span>Total Payable (Net-15 Invoice)</span>
                              <span>₹3,460</span>
                            </div>
                            <div className="eco-delivery-eta-badge">
                              <span>⚡ Guaranteed Delivery: Today · 12:05 PM</span>
                            </div>
                          </div>

                          <div className="eco-place-order-cta pressed">
                            <span>Place Order · ₹3,460</span>
                            <span>✓ Placing...</span>
                          </div>
                        </div>
                      )}

                      {/* SCENE 04: CONFIRM (Supplier Confirmed) */}
                      {currentState === 'CONFIRM' && (
                        <div className="eco-film-scene scene-placed" key="confirm">
                          <div className="eco-placed-check-circle">
                            <Icon.Check size={24} />
                          </div>
                          <h4>Order Confirmed!</h4>
                          <div className="eco-placed-po-num">Order #GRB-1048</div>
                          <p className="eco-placed-subtitle">
                            Transmitted to Blue Tokai Wholesale Portal. Unified Net-15 invoice generated.
                          </p>

                          <div className="eco-placed-status-card confirmed-state">
                            <div className="eco-status-green-dot" />
                            <div>
                              <strong style={{ color: '#166534' }}>✓ Supplier Confirmed</strong>
                              <small style={{ color: '#15803D' }}>Confirmed in 42s · Blue Tokai Roasters</small>
                            </div>
                          </div>

                          <div className="eco-confirm-breakdown">
                            <div className="eco-cf-row">
                              <span>Total Amount</span>
                              <strong>₹3,460 (Net-15)</strong>
                            </div>
                            <div className="eco-cf-row">
                              <span>Delivery Outlet</span>
                              <strong>Blue Tokai Indiranagar</strong>
                            </div>
                            <div className="eco-cf-row">
                              <span>Fulfillment Hub</span>
                              <strong>Koramangala Roasting Facility</strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SCENE 05: TRACK (Live Milestone Timeline - Matches Reference Screenshot) */}
                      {currentState === 'TRACK' && (
                        <div className="eco-film-scene scene-tracking" key="track">
                          <div className="eco-track-head">
                            <span className="eco-live-pulse-badge">
                              <span className="eco-pulse-dot" /> LIVE FLEET TRACKING
                            </span>
                            <h4>Track Your Order</h4>
                            <span className="eco-track-eta">Order #GRB-1048 · Arriving 12:05 PM</span>
                          </div>

                          <div className="eco-driver-card">
                            <div className="eco-driver-avatar-wrap">
                              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                <rect width="28" height="28" rx="8" fill="#E2E8F0" />
                                <circle cx="14" cy="10.5" r="4.2" fill="#64748B" />
                                <path d="M6.5 22.5c0-4.14 3.36-7.5 7.5-7.5s7.5 3.36 7.5 7.5" fill="#64748B" />
                              </svg>
                            </div>
                            <div className="eco-driver-info">
                              <strong>Driver Ramesh Kumar</strong>
                              <span>Refrigerated Van #B-04 · Temp 4°C</span>
                            </div>
                          </div>

                          <div className="eco-tracking-steps-list">
                            <div className="eco-t-step done">
                              <span className="t-icon">✓</span>
                              <div>
                                <strong>Order placed</strong>
                                <small>10:15 AM · Blue Tokai Wholesale</small>
                              </div>
                            </div>
                            <div className="eco-t-step done">
                              <span className="t-icon">✓</span>
                              <div>
                                <strong>Supplier confirmed</strong>
                                <small>10:16 AM (Confirmed in 42s)</small>
                              </div>
                            </div>
                            <div className="eco-t-step done">
                              <span className="t-icon">✓</span>
                              <div>
                                <strong>Packed &amp; Sealed</strong>
                                <small>10:42 AM · Batch #AB-842</small>
                              </div>
                            </div>
                            <div className="eco-t-step active">
                              <span className="t-icon beacon">●</span>
                              <div>
                                <strong style={{ color: '#2563EB' }}>In transit (Driver Ramesh)</strong>
                                <small>1.2 km away · Near 100ft Road</small>
                              </div>
                            </div>
                            <div className="eco-t-step pending">
                              <span className="t-icon">○</span>
                              <div>
                                <strong>Delivered &amp; Verified</strong>
                                <small>ETA 12:05 PM</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SCENE 06: DELIVER (Delivered & Inventory Updated) */}
                      {currentState === 'DELIVER' && (
                        <div className="eco-film-scene scene-delivered" key="deliver">
                          <div className="eco-delivered-badge-wrap">
                            <div className="eco-delivered-icon">✓</div>
                            <h4>Order Delivered!</h4>
                            <span className="eco-del-time">12:05 PM · Indiranagar Flagship</span>
                            <small className="eco-signed-by">Signed &amp; verified by Head Barista Arjun</small>
                          </div>

                          <div className="eco-inventory-sync-box">
                            <div className="eco-inv-box-title">
                              <Icon.Box size={11} />
                              <span>Auto-Inventory Updated</span>
                            </div>
                            <div className="eco-inv-row">
                              <span>Arabica AA Coffee Beans</span>
                              <strong style={{ color: '#16A34A' }}>+2 kg (14 kg total · Par OK)</strong>
                            </div>
                            <div className="eco-inv-row">
                              <span>Barista Oat Milk</span>
                              <strong style={{ color: '#16A34A' }}>+1 L (32 L total · Par OK)</strong>
                            </div>
                            <div className="eco-inv-row">
                              <span>Natural Chocolate Syrup</span>
                              <strong style={{ color: '#16A34A' }}>+3 btl (Stock Healthy)</strong>
                            </div>
                          </div>

                          <div className="eco-reorder-loop-box">
                            <div className="eco-reorder-txt">
                              <strong>Ecosystem Synchronized</strong>
                              <span>Inventory par updated · Net-15 receipt archived</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phone Bottom Tab Bar (5 Tabs matching reference image) */}
                    <div className="eco-phone-bottom-nav">
                      <div className={`eco-p-tab ${currentState === 'DISCOVER' ? 'active' : ''}`}>
                        <Icon.Dashboard size={11} />
                        <span>Home</span>
                      </div>
                      <div
                        className={`eco-p-tab ${
                          currentState === 'SELECT' ||
                          currentState === 'ORDER' ||
                          currentState === 'CONFIRM' ||
                          currentState === 'TRACK'
                            ? 'active'
                            : ''
                        }`}
                      >
                        <Icon.Cart size={11} />
                        <span>Orders</span>
                      </div>
                      <div className="eco-p-tab">
                        <Icon.Box size={11} />
                        <span>Suppliers</span>
                      </div>
                      <div className={`eco-p-tab ${currentState === 'DELIVER' ? 'active' : ''}`}>
                        <Icon.Receipt size={11} />
                        <span>Stock</span>
                      </div>
                      <div className="eco-p-tab">
                        <Icon.Users size={11} />
                        <span>Account</span>
                      </div>
                    </div>

                    {/* Bottom Home Indicator Bar */}
                    <div className="eco-phone-home-indicator" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ─────────────────────────────────────────────────────────
                RIGHT SCREEN: BRAND DESKTOP DASHBOARD (16:9 Aspect Ratio)
                Visible in Chapter 1 · Recedes into Chapter 2
            ─────────────────────────────────────────────────────────── */}
            <motion.div
              className={`eco-browser-window eco-screen-brand ${
                hoveredScreen === 'brand'
                  ? 'is-hovered'
                  : hoveredScreen !== null
                  ? 'is-dimmed'
                  : ''
              }`}
              onMouseEnter={() => !isCafeActive && setHoveredScreen('brand')}
              onMouseMove={handlePointerMove}
              onMouseLeave={handlePointerLeave}
              style={
                isReduced
                  ? { transform: 'none', opacity: 0.95 }
                  : {
                      x: brandX,
                      y: brandY,
                      scale: brandScale,
                      opacity: brandOpacity,
                      pointerEvents: isCafeActive ? 'none' : 'auto',
                      zIndex: hoveredScreen === 'brand' ? 40 : 10,
                    }
              }
            >
              <div className="eco-device-scaler">
                {/* Chrome Top Bar */}
                <div className="eco-chrome">
                  <div className="eco-chrome-dots">
                    <span className="eco-dot eco-dot-red" />
                    <span className="eco-dot eco-dot-yellow" />
                    <span className="eco-dot eco-dot-green" />
                  </div>
                  <div className="eco-url-bar">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>brand.grabbit.io/campaigns/trials-funnel</span>
                  </div>
                  <div className="eco-window-role-badge badge-brand">BRAND</div>
                </div>

                {/* App Body */}
                <div className="eco-app-body">
                  {/* Sidebar - Compact Icon Rail (~40px) */}
                  <div className="eco-sidebar">
                    <div className="eco-sidebar-brand">
                      <div className="eco-brand-grid-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" rx="1.5" />
                          <rect x="14" y="3" width="7" height="7" rx="1.5" />
                          <rect x="14" y="14" width="7" height="7" rx="1.5" />
                          <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                      </div>
                    </div>
                    <nav className="eco-nav-list">
                      <div className="eco-nav-item active-brand" title="Overview">
                        <Icon.Chart size={13} />
                      </div>
                      <div className="eco-nav-item" title="Campaigns">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 11l18-5v12L3 14v-3z" />
                          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                        </svg>
                      </div>
                      <div className="eco-nav-item" title="Cafés">
                        <Icon.Users size={13} />
                      </div>
                      <div className="eco-nav-item" title="Products">
                        <Icon.Box size={13} />
                      </div>
                      <div className="eco-nav-item" title="Trials">
                        <Icon.Filter size={13} />
                      </div>
                      <div className="eco-nav-item eco-nav-bottom" title="Settings">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                      </div>
                    </nav>
                  </div>

                  {/* Main Content Area */}
                  <div className="eco-main-content">
                    <div className="eco-content-header">
                      <div className="eco-title-group">
                        <h4>Café Adoption &amp; Distribution</h4>
                        <span>Bengaluru Specialty Cafés · Verified Wholesale Signals</span>
                      </div>
                      <div className="eco-header-actions">
                        <span className="eco-badge-purple">
                          <span className="eco-dot-pulse" style={{ background: '#9333EA' }} />
                          Network Active
                        </span>
                      </div>
                    </div>

                    {/* Brand KPI Row */}
                    <div className="eco-kpi-row">
                      <div className="eco-kpi-card">
                        <div className="eco-kpi-val" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                          <span style={{ fontSize: '18px', fontWeight: 700 }}>{hoveredScreen === 'brand' ? '125' : '124'}</span> <span className="eco-kpi-badge" style={{ color: '#7C3AED', fontSize: '9px', fontWeight: 600 }}>↑ 18%</span>
                        </div>
                        <div className="eco-kpi-label" style={{ margin: 0 }}>Cafés Sampled</div>
                      </div>
                      <div className="eco-kpi-card">
                        <div className="eco-kpi-val" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px', color: '#7C3AED' }}>
                          <span style={{ fontSize: '18px', fontWeight: 700 }}>25.0%</span> <span className="eco-kpi-badge" style={{ color: '#7C3AED', fontSize: '9px', fontWeight: 600 }}>↑ 3.1%</span>
                        </div>
                        <div className="eco-kpi-label" style={{ margin: 0 }}>Recurring Conversion</div>
                      </div>
                      <div className="eco-kpi-card">
                        <div className="eco-kpi-val" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                          <span style={{ fontSize: '18px', fontWeight: 700 }}>₹6.4L</span> <span className="eco-kpi-badge" style={{ color: '#7C3AED', fontSize: '9px', fontWeight: 600 }}>↑ 12%</span>
                        </div>
                        <div className="eco-kpi-label" style={{ margin: 0 }}>Projected GMV</div>
                      </div>
                    </div>

                    {/* 4-Stage Adoption Funnel Strip */}
                    <div className="eco-funnel-strip">
                      <div className="eco-funnel-step">
                        <span className="eco-funnel-label">SENT</span>
                        <strong className="eco-funnel-num">124</strong>
                        <span className="eco-funnel-conv">100%</span>
                      </div>
                      <span className="eco-funnel-arr">→</span>
                      <div className="eco-funnel-step">
                        <span className="eco-funnel-label">TRIED</span>
                        <strong className="eco-funnel-num">93</strong>
                        <span className="eco-funnel-conv">74%</span>
                      </div>
                      <span className="eco-funnel-arr">→</span>
                      <div className="eco-funnel-step">
                        <span className="eco-funnel-label">LIKED</span>
                        <strong className="eco-funnel-num">67</strong>
                        <span className="eco-funnel-conv">71%</span>
                      </div>
                      <span className="eco-funnel-arr">→</span>
                      <div className="eco-funnel-step">
                        <span className="eco-funnel-label">REPEAT POs</span>
                        <strong className="eco-funnel-num" style={{ color: '#7C3AED' }}>
                          {hoveredScreen === 'brand' ? '32' : '31'}
                        </strong>
                        <span className="eco-funnel-conv" style={{ color: '#7C3AED' }}>48%</span>
                      </div>
                    </div>

                    {/* Product Adoption Cards (2 rows with crisp spacing, no overflow) */}
                    <div className="eco-campaigns-list">
                      <div className="eco-campaign-card">
                        <div className="eco-camp-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img 
                            src="/landing/coffee-bag-red.jpg" 
                            alt="Arabica AA Red Pouch" 
                            style={{ width: '26px', height: '32px', objectFit: 'contain', background: '#FFFFFF', borderRadius: '4px', flexShrink: 0, border: '1px solid #F1F5F9' }} 
                          />
                          <div>
                            <h5 style={{ margin: 0, fontSize: '9.5px', fontWeight: 700, color: '#0F172A' }}>Single-Origin Arabica AA Specialty Roast</h5>
                            <span className="eco-camp-cafes" style={{ fontSize: '8px', color: '#64748B', marginTop: '1px', display: 'block' }}>125 Cafés · 85 verified reordering</span>
                          </div>
                        </div>
                        <div className="eco-camp-right">
                          <span className="eco-pill" style={{ background: '#EDE9FE', color: '#6D28D9', fontWeight: 600, fontSize: '8px' }}>
                            Active · 31 Repeat POs
                          </span>
                        </div>
                      </div>
                      <div className="eco-campaign-card">
                        <div className="eco-camp-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img 
                            src="/landing/matcha.jpg" 
                            alt="Ceremonial Matcha Tin" 
                            style={{ width: '26px', height: '32px', objectFit: 'contain', background: '#FFFFFF', borderRadius: '4px', flexShrink: 0, border: '1px solid #F1F5F9' }} 
                          />
                          <div>
                            <h5 style={{ margin: 0, fontSize: '9.5px', fontWeight: 700, color: '#0F172A' }}>Organic Ceremonial Grade Matcha</h5>
                            <span className="eco-camp-cafes" style={{ fontSize: '8px', color: '#64748B', marginTop: '1px', display: 'block' }}>85 Cafés · 62 kits tested</span>
                          </div>
                        </div>
                        <div className="eco-camp-right">
                          <span className="eco-pill" style={{ background: '#EDE9FE', color: '#6D28D9', fontWeight: 600, fontSize: '8px' }}>
                            Active · 19 Repeat POs
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
