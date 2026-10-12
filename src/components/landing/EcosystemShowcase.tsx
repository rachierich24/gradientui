'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValueEvent,
} from 'framer-motion';
import { Icon } from './icons';

/* ─── SCREEN BORDER BEAM (Apple / Attio style traveling perimeter ray) ─── */
function ScreenBorderBeam({
  color,
  radius = 16,
  isActive,
}: {
  color: string;
  radius?: number;
  isActive: boolean;
}) {
  if (!isActive) return null;

  return (
    <div className="eco-border-beam-container" style={{ borderRadius: radius }}>
      <svg
        className="eco-border-beam-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Soft glowing ambient aura */}
        <rect
          x="1"
          y="1"
          width="98"
          height="98"
          rx={radius > 20 ? 18 : 6}
          fill="none"
          stroke={color}
          strokeWidth="3.6"
          strokeLinecap="round"
          pathLength={1000}
          strokeDasharray="95 905"
          className="eco-beam-glow-trace"
          style={{
            filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color})`,
            stroke: color,
          }}
        />
        {/* Crisp core traveling ray */}
        <rect
          x="1"
          y="1"
          width="98"
          height="98"
          rx={radius > 20 ? 18 : 6}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          pathLength={1000}
          strokeDasharray="75 925"
          className="eco-beam-core-ray"
          style={{
            filter: `drop-shadow(0 0 4px ${color})`,
            stroke: color,
          }}
        />
        {/* Pure white spark nucleus leading the ray */}
        <rect
          x="1"
          y="1"
          width="98"
          height="98"
          rx={radius > 20 ? 18 : 6}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          pathLength={1000}
          strokeDasharray="20 980"
          className="eco-beam-spark-tip"
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   GRABBIT ECOSYSTEM → CAFÉ STORY CONTINUOUS SHOWCASE
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

  // Active Video Tour Stage: 'mobile' -> 'supplier' -> 'brand' -> 'mobile'
  const [activeVideoScreen, setActiveVideoScreen] = useState<'mobile' | 'supplier' | 'brand'>('mobile');
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const supplierVideoRef = useRef<HTMLVideoElement | null>(null);
  const brandVideoRef = useRef<HTMLVideoElement | null>(null);

  // Transition to next screen
  const advanceToNext = useCallback(() => {
    setActiveVideoScreen((curr) => {
      if (curr === 'mobile') return 'supplier';
      if (curr === 'supplier') return 'brand';
      return 'mobile';
    });
  }, []);

  // Video ended handlers
  const handleMobileEnded = useCallback(() => {
    setActiveVideoScreen('supplier');
  }, []);

  const handleSupplierEnded = useCallback(() => {
    setActiveVideoScreen('brand');
  }, []);

  const handleBrandEnded = useCallback(() => {
    setActiveVideoScreen('mobile');
  }, []);

  // Sync video play/pause with activeVideoScreen and viewport visibility
  useEffect(() => {
    const vMob = mobileVideoRef.current;
    const vSupp = supplierVideoRef.current;
    const vBrand = brandVideoRef.current;

    if (!vMob || !vSupp || !vBrand) return;

    if (!isVisible) {
      vMob.pause();
      vSupp.pause();
      vBrand.pause();
      return;
    }

    if (activeVideoScreen === 'mobile') {
      // Pause suppliers & brands on first screen
      vSupp.pause();
      try { vSupp.currentTime = 0; } catch {}
      vBrand.pause();
      try { vBrand.currentTime = 0; } catch {}

      // Play mobile
      try { vMob.currentTime = 0; } catch {}
      const p = vMob.play();
      if (p !== undefined) p.catch(() => {});
    } else if (activeVideoScreen === 'supplier') {
      // Pause mobile & brands on first screen
      vMob.pause();
      try { vMob.currentTime = 0; } catch {}
      vBrand.pause();
      try { vBrand.currentTime = 0; } catch {}

      // Play supplier
      try { vSupp.currentTime = 0; } catch {}
      const p = vSupp.play();
      if (p !== undefined) p.catch(() => {});
    } else if (activeVideoScreen === 'brand') {
      // Pause mobile & supplier on first screen
      vMob.pause();
      try { vMob.currentTime = 0; } catch {}
      vSupp.pause();
      try { vSupp.currentTime = 0; } catch {}

      // Play brand
      try { vBrand.currentTime = 0; } catch {}
      const p = vBrand.play();
      if (p !== undefined) p.catch(() => {});
    }
  }, [activeVideoScreen, isVisible]);

  // Safety fallback timer (advances if onEnded is delayed or dropped)
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      advanceToNext();
    }, 10500);
    return () => clearTimeout(timer);
  }, [activeVideoScreen, isVisible, advanceToNext]);

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
              <div className="eco-device-scaler" style={{ position: 'relative' }}>
                <ScreenBorderBeam color="#22C55E" radius={14} isActive={activeVideoScreen === 'supplier'} />
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
                <div className="eco-app-body eco-video-body">
                  <video
                    ref={supplierVideoRef}
                    src="/suppliers.mp4"
                    playsInline
                    muted
                    preload="auto"
                    className="eco-dashboard-video"
                    onEnded={handleSupplierEnded}
                  />
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
                  <ScreenBorderBeam color="#E5483B" radius={38} isActive={activeVideoScreen === 'mobile'} />
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

                    {/* ─── Phone Screen Content (Cafe Video) ─── */}
                    <div className="eco-phone-viewport eco-video-phone-viewport">
                      <video
                        ref={mobileVideoRef}
                        src="/cafe.mp4"
                        playsInline
                        muted
                        preload="auto"
                        className="eco-mobile-video"
                        onEnded={handleMobileEnded}
                      />
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
              <div className="eco-device-scaler" style={{ position: 'relative' }}>
                <ScreenBorderBeam color="#8B5CF6" radius={14} isActive={activeVideoScreen === 'brand'} />
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
                <div className="eco-app-body eco-video-body">
                  <video
                    ref={brandVideoRef}
                    src="/brands.mp4"
                    playsInline
                    muted
                    preload="auto"
                    className="eco-dashboard-video"
                    onEnded={handleBrandEnded}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
