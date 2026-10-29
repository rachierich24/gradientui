'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValueEvent,
  useMotionValue,
} from 'framer-motion';
import { Icon } from './icons';

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

// Café chapter start times inside /cafe.mp4, in seconds. The highlighted step follows the video.
const CAFE_VIDEO_CHAPTERS: { state: CafeFilmState; start: number }[] = [
  { state: 'DISCOVER', start: 0 },
  { state: 'ORDER', start: 5 },
  { state: 'TRACK', start: 11 },
  { state: 'DELIVER', start: 16 },
];

// How long a side portal takes to glide to the centre before its video starts.
const FOCUS_MS = 600;

export function EcosystemShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion();

  // Visibility state via IntersectionObserver (pauses playback when off-screen)
  const [isVisible, setIsVisible] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(() => {
    if (typeof document !== 'undefined') {
      return !document.hidden;
    }
    return true;
  });

  // Tab visibility awareness (Page Visibility API)
  useEffect(() => {
    const handleVisibility = () => {
      const visible = !document.hidden;
      setIsTabVisible(visible);
      if (!visible) {
        try { mobileVideoRef.current?.pause(); } catch {}
        try { supplierVideoRef.current?.pause(); } catch {}
        try { brandVideoRef.current?.pause(); } catch {}
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Suppress unhandled AbortError caused by Chromium pausing background media to save power (https://goo.gl/LdLk22)
  useEffect(() => {
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      const name = String(reason?.name || '');
      const msg = String(reason?.message || reason || '');
      if (
        name === 'AbortError' ||
        name === 'NotAllowedError' ||
        msg.includes('AbortError') ||
        msg.includes('play()') ||
        msg.includes('paused to save power') ||
        msg.includes('interrupted')
      ) {
        e.preventDefault();
      }
    };

    const handleWindowError = (e: ErrorEvent) => {
      const msg = String(e.message || '');
      if (
        msg.includes('AbortError') ||
        msg.includes('paused to save power') ||
        msg.includes('play()') ||
        msg.includes('interrupted')
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleWindowError);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleWindowError);
    };
  }, []);

  // Chapter 2 Café Section Activation State
  // Turned on when user scrolls past the transition threshold (~48% of track)
  const [isCafeActive, setIsCafeActive] = useState(false);

  // Hover Focus State for Chapter 1 (Supplier Left · Phone Center · Brand Right)
  const [hoveredScreen, setHoveredScreen] = useState<'supplier' | 'mobile' | 'brand' | null>(null);

  // True while Chapter 1 sits at rest (before the user scrolls on); side-portal focus needs it
  const [isAtRest, setIsAtRest] = useState(true);

  // Subtle Pointer-Response Parallax State (Requirement 17)
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Café step highlighted in Chapter 2, driven by the phone video's playback time
  const [cafeState, setCafeState] = useState<CafeFilmState>('DISCOVER');

  // Active Video Tour Stage: 'mobile' -> 'supplier' -> 'brand' -> 'mobile'
  const [activeVideoScreen, setActiveVideoScreen] = useState<'mobile' | 'supplier' | 'brand'>('mobile');
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const supplierVideoRef = useRef<HTMLVideoElement | null>(null);
  const brandVideoRef = useRef<HTMLVideoElement | null>(null);

  // Safe play/pause helpers to guard against AbortError
  const safePlay = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    try {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined && typeof playPromise.catch === 'function') {
        playPromise.catch((err: unknown) => {
          // Swallow any AbortError, NotAllowedError, or power-saving pause interruption (https://goo.gl/LdLk22)
          const name = (err as any)?.name;
          const msg = String((err as any)?.message || err || '');
          if (
            name === 'AbortError' ||
            name === 'NotAllowedError' ||
            msg.includes('pause') ||
            msg.includes('save power') ||
            msg.includes('interrupted') ||
            msg.includes('AbortError')
          ) {
            return;
          }
        });
      }
    } catch {
      // Synchronous play invocation errors safely swallowed
    }
  }, []);

  const safePause = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    try {
      video.pause();
    } catch {}
  }, []);

  // Videos loop cleanly while active:
  const handleMobileEnded = useCallback(() => {
    const v = mobileVideoRef.current;
    if (v) {
      try { v.currentTime = 0; } catch {}
      safePlay(v);
    }
  }, [safePlay]);

  // In the café chapter, the phone video always owns playback
  useEffect(() => {
    if (isCafeActive) {
      setActiveVideoScreen('mobile');
      setHoveredScreen(null);
    }
  }, [isCafeActive]);

  const handleSupplierEnded = useCallback(() => {
    const v = supplierVideoRef.current;
    if (v) {
      try { v.currentTime = 0; } catch {}
      safePlay(v);
    }
  }, [safePlay]);

  const handleBrandEnded = useCallback(() => {
    const v = brandVideoRef.current;
    if (v) {
      try { v.currentTime = 0; } catch {}
      safePlay(v);
    }
  }, [safePlay]);

  // Sync video play/pause with activeVideoScreen and viewport visibility
  useEffect(() => {
    const vMob = mobileVideoRef.current;
    const vSupp = supplierVideoRef.current;
    const vBrand = brandVideoRef.current;

    if (!vMob || !vSupp || !vBrand) return;

    if (!isVisible || !isTabVisible) {
      safePause(vMob);
      safePause(vSupp);
      safePause(vBrand);
      return;
    }

    if (activeVideoScreen === 'mobile') {
      safePause(vSupp);
      try { vSupp.currentTime = 0; } catch {}
      safePause(vBrand);
      try { vBrand.currentTime = 0; } catch {}

      safePlay(vMob);
    } else if (activeVideoScreen === 'supplier') {
      safePause(vMob);
      safePause(vBrand);
      try { vBrand.currentTime = 0; } catch {}

      try { vSupp.currentTime = 0; } catch {}
      // Play once the window has glided to the centre
      const t = setTimeout(() => safePlay(vSupp), 250);
      return () => clearTimeout(t);
    } else if (activeVideoScreen === 'brand') {
      safePause(vMob);
      safePause(vSupp);
      try { vSupp.currentTime = 0; } catch {}

      try { vBrand.currentTime = 0; } catch {}
      const t = setTimeout(() => safePlay(vBrand), 250);
      return () => clearTimeout(t);
    }
  }, [activeVideoScreen, isVisible, isTabVisible, safePlay, safePause]);

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
      setCafeState('DISCOVER'); // Reset to the first step when returning to ecosystem
    } else if (active) {
      setHoveredScreen(null); // Clear hover in Café section
    }

    // Immediately clear hover and return to normal when user scrolls
    if (latest > 0.08) {
      setHoveredScreen(null);
      setActiveVideoScreen('mobile');
    }
    // Side-portal focus only holds while the section sits at rest; scrolling on releases it
    setIsAtRest(latest <= 0.08);

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
    setActiveVideoScreen('mobile');
    setPointerOffset({ x: 0, y: 0 });
  };

  // The highlighted café step follows the phone video's chapters
  const handleMobileTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const t = e.currentTarget.currentTime;
    let state = CAFE_VIDEO_CHAPTERS[0].state;
    for (const c of CAFE_VIDEO_CHAPTERS) if (t >= c.start) state = c.state;
    setCafeState(state);
  }, []);

  // Clicking a step jumps the phone video to that chapter
  const seekCafeChapter = useCallback((state: CafeFilmState) => {
    const v = mobileVideoRef.current;
    const chapter = CAFE_VIDEO_CHAPTERS.find((c) => c.state === state);
    if (!v || !chapter) return;
    try { v.currentTime = chapter.start; } catch {}
    setCafeState(state);
    safePlay(v);
  }, [safePlay]);

  const currentState = isCafeActive ? cafeState : 'DISCOVER';

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
  // Starts slightly elevated in Chapter 1 (-16px), then glides DOWN while scaling into the hero
  // display (1.00 -> up to 1.44), landing with its centre midway between the nav and the bottom of the
  // screen. The drop and the final scale are measured from the pinned stage (see the effect below),
  // so it lands centred and clear of the copy on any screen size.
  const phoneRef = useRef<HTMLDivElement>(null);
  const phoneDrop = useMotionValue(6);
  // The café chapter's phone scale: 1.44 where it fits, smaller where the copy columns or the screen
  // height would otherwise collide with it.
  const phoneMaxScale = useMotionValue(1.44);
  useEffect(() => {
    const NAV = 72, GUTTER = 24;
    const measure = () => {
      const el = phoneRef.current, stage = el?.closest<HTMLElement>('.eco-sticky-stage');
      if (!el || !stage || window.innerWidth <= 860) { phoneDrop.set(6); phoneMaxScale.set(1.44); return; }
      let top = 0, n: HTMLElement | null = el;
      while (n && n !== stage) { top += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
      if (n !== stage) return;
      const centre = top + el.offsetHeight / 2, target = NAV + (stage.clientHeight - NAV) / 2;
      phoneDrop.set(target - centre);
      const left = stage.querySelector('.eco-cafe-left-panel')?.getBoundingClientRect();
      const right = stage.querySelector('.eco-cafe-right-panel')?.getBoundingClientRect();
      const r = el.getBoundingClientRect(), cx = r.left + r.width / 2;
      const half = left && right ? Math.min(cx - left.right, right.left - cx) - GUTTER : Infinity;
      const fitW = (2 * half) / el.offsetWidth;
      const fitH = (stage.clientHeight - NAV - 2 * GUTTER) / el.offsetHeight;
      phoneMaxScale.set(Math.max(1, Math.min(1.44, fitW, fitH)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (phoneRef.current) ro.observe(phoneRef.current);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [phoneDrop, phoneMaxScale]);
  const phoneY = useTransform([smoothProgress, phoneDrop], ([p, drop]: number[]) => {
    if (p <= 0.12) return 0;
    if (p >= 0.44) return drop;
    const k = (p - 0.12) / 0.32, e = k * k * (3 - 2 * k);
    return drop * e;
  });
  const phoneScale = useTransform([smoothProgress, phoneMaxScale], ([p, max]: number[]) => {
    if (p <= 0.12) return 1;
    if (p >= 0.44) return max;
    return 1 + (max - 1) * ((p - 0.12) / 0.32);
  });
  const phoneOpacity = useTransform(smoothProgress, [0.0, 1.0], [1, 1]);

  // Side portal focus: while its video plays, a side window glides to the centre of the stage and
  // scales up in front of the phone. Measured from layout (offsets ignore transforms), desktop only.
  const supplierWinRef = useRef<HTMLDivElement>(null);
  const brandWinRef = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState({ supplier: { x: 0, s: 1 }, brand: { x: 0, s: 1 } });
  useEffect(() => {
    const measure = () => {
      const sup = supplierWinRef.current, brand = brandWinRef.current;
      const group = sup?.parentElement;
      if (!sup || !brand || !group || window.innerWidth <= 860) {
        setFocus({ supplier: { x: 0, s: 1 }, brand: { x: 0, s: 1 } });
        return;
      }
      const centre = group.clientWidth / 2;
      const target = Math.min(group.clientWidth * 0.68, 820);
      const of = (el: HTMLElement) => ({
        x: Math.round(centre - (el.offsetLeft + el.offsetWidth / 2)),
        s: +Math.min(1.75, target / el.offsetWidth).toFixed(3),
      });
      setFocus({ supplier: of(sup), brand: of(brand) });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  const sideFocused = isAtRest && !isCafeActive && (hoveredScreen === 'supplier' || hoveredScreen === 'brand') && focus.supplier.s > 1;
  // Always supply the calculated focus variables so CSS transforms animate smoothly
  const focusVars = (side: 'supplier' | 'brand') => ({
    ['--focus-x' as any]: `${focus[side].x}px`,
    ['--focus-scale' as any]: focus[side].s,
  });

  // Hovering a side portal brings it to the centre and plays its video
  const focusSide = useCallback((side: 'supplier' | 'brand') => {
    if (isCafeActive) return;
    setHoveredScreen(side);
    setActiveVideoScreen(side);
  }, [isCafeActive]);

  // Leaving a side portal immediately returns it to its normal place
  const unfocusSide = useCallback(() => {
    setHoveredScreen(null);
    setActiveVideoScreen('mobile');
    setPointerOffset({ x: 0, y: 0 });
  }, []);

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

  // Connect stage background to the shared continuous --universe-bg so that when the
  // user scrolls from Cafe Red to Supplier Green, the entire stage transitions seamlessly as one surface.
  const stageBg = isReduced ? '#FFFFFF' : 'var(--universe-bg, #FFFFFF)';

  return (
    <section
      className="eco-track"
      ref={trackRef}
      id="ecosystem"
      aria-label="Gradient Ecosystem and Café Workflow"
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
            <h2 className="eco-headline">
              <span className="eco-headline-main">Connecting cafés, suppliers &amp; brands.</span>
              <span className="eco-headline-highlight">Food supply made easy.</span>
            </h2>
            <p className="eco-body">
              Browse live supplier catalogues, place unified orders, and track deliveries in real time across the entire ecosystem.
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
              Find suppliers, place orders, track deliveries and keep stock up to date, all in one place.
            </p>
          </div>

          {/* Right Panel: 4 Supporting Narrative Points */}
          <div className="eco-cafe-right-panel">
            <div
              className={`eco-cafe-step ${currentState === 'DISCOVER' ? 'is-active-step' : ''}`}
              onClick={() => seekCafeChapter('DISCOVER')}
            >
              <div className="eco-cafe-step-header">
                <span className="eco-cafe-step-num">01</span>
                <h5 className="eco-cafe-step-title">Discover suppliers</h5>
              </div>
              <p className="eco-cafe-step-desc">
                Browse verified suppliers with clear wholesale prices.
              </p>
            </div>

            <div
              className={`eco-cafe-step ${currentState === 'ORDER' ? 'is-active-step' : ''}`}
              onClick={() => seekCafeChapter('ORDER')}
            >
              <div className="eco-cafe-step-header">
                <span className="eco-cafe-step-num">02</span>
                <h5 className="eco-cafe-step-title">Order in seconds</h5>
              </div>
              <p className="eco-cafe-step-desc">
                One basket across every supplier. No WhatsApp mix-ups.
              </p>
            </div>

            <div
              className={`eco-cafe-step ${currentState === 'TRACK' ? 'is-active-step' : ''}`}
              onClick={() => seekCafeChapter('TRACK')}
            >
              <div className="eco-cafe-step-header">
                <span className="eco-cafe-step-num">03</span>
                <h5 className="eco-cafe-step-title">Track every delivery</h5>
              </div>
              <p className="eco-cafe-step-desc">
                Live route, driver and cold-chain temperature.
              </p>
            </div>

            <div
              className={`eco-cafe-step ${currentState === 'DELIVER' ? 'is-active-step' : ''}`}
              onClick={() => seekCafeChapter('DELIVER')}
            >
              <div className="eco-cafe-step-header">
                <span className="eco-cafe-step-num">04</span>
                <h5 className="eco-cafe-step-title">Keep stock in sync</h5>
              </div>
              <p className="eco-cafe-step-desc">
                Stock updates the moment a delivery is signed for.
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
          <div className={`eco-screens-group ${sideFocused ? 'has-side-focus' : ''}`}>
            {/* ─────────────────────────────────────────────────────────
                LEFT SCREEN: SUPPLIER DESKTOP DASHBOARD (16:9 Aspect Ratio)
                Visible in Chapter 1 · Recedes into Chapter 2
            ─────────────────────────────────────────────────────────── */}
            <motion.div
              ref={supplierWinRef}
              className={`eco-browser-window eco-screen-supplier ${
                activeVideoScreen === 'supplier' ? 'is-video-active' : ''
              } ${
                hoveredScreen === 'supplier'
                  ? 'is-hovered'
                  : hoveredScreen !== null
                  ? 'is-dimmed'
                  : ''
              }`}
              onMouseEnter={() => focusSide('supplier')}
              onMouseMove={handlePointerMove}
              onMouseLeave={unfocusSide}
              onClick={() => focusSide('supplier')}
              style={
                isReduced
                  ? { transform: 'none', opacity: 0.95 }
                  : {
                      x: supplierX,
                      y: supplierY,
                      scale: supplierScale,
                      opacity: supplierOpacity,
                      pointerEvents: isCafeActive ? 'none' : 'auto',
                      zIndex: hoveredScreen === 'supplier' ? 45 : 10,
                    }
              }
            >
              <div className="eco-device-scaler" style={{ position: 'relative', ...focusVars('supplier') }}>
                <div className="eco-screen-ambient-glow glow-supplier" aria-hidden="true" />
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
                    <span>app.gradient365.com/supplier</span>
                    <span className="eco-url-ping ping-supplier" />
                  </div>
                  <div className="eco-window-role-badge badge-supplier">
                    <span className="eco-role-dot" />
                    SUPPLIER
                  </div>
                </div>

                {/* App Body */}
                <div className="eco-app-body eco-video-body">
                  <video
                    ref={supplierVideoRef}
                    src="/suppliers.mp4"
                    playsInline
                    muted
                    preload="metadata"
                    className="eco-dashboard-video"
                    onEnded={handleSupplierEnded}
                    onError={(e) => {
                      try {
                        e.currentTarget.pause();
                      } catch {}
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* ─────────────────────────────────────────────────────────
                CENTER OBJECT: PERSISTENT SMARTPHONE PROTAGONIST (100% Focus)
                Remains front-facing & stationary across Chapter 1 & 2!
            ─────────────────────────────────────────────────────────── */}
            <motion.div
              ref={phoneRef}
              className={`eco-screen-mobile ${
                activeVideoScreen === 'mobile' ? 'is-video-active' : ''
              } ${
                hoveredScreen === 'mobile'
                  ? 'is-hovered'
                  : hoveredScreen !== null
                  ? 'is-dimmed'
                  : ''
              }`}
              onMouseEnter={() => !isCafeActive && setHoveredScreen('mobile')}
              onMouseMove={handlePointerMove}
              onMouseLeave={unfocusSide}
              onClick={() => {
                setActiveVideoScreen('mobile');
                setHoveredScreen(null);
              }}
              style={
                isReduced
                  ? { transform: 'none' }
                  : {
                      y: phoneY,
                      scale: phoneScale,
                      opacity: phoneOpacity,
                      zIndex: sideFocused ? 15 : 30,
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
                        <span className="eco-island-status-pulse" />
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
                        preload="metadata"
                        className="eco-mobile-video"
                        onEnded={handleMobileEnded}
                        onTimeUpdate={handleMobileTimeUpdate}
                        onError={(e) => {
                          try {
                            e.currentTarget.pause();
                          } catch {}
                        }}
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
              ref={brandWinRef}
              className={`eco-browser-window eco-screen-brand ${
                activeVideoScreen === 'brand' ? 'is-video-active' : ''
              } ${
                hoveredScreen === 'brand'
                  ? 'is-hovered'
                  : hoveredScreen !== null
                  ? 'is-dimmed'
                  : ''
              }`}
              onMouseEnter={() => focusSide('brand')}
              onMouseMove={handlePointerMove}
              onMouseLeave={unfocusSide}
              onClick={() => focusSide('brand')}
              style={
                isReduced
                  ? { transform: 'none', opacity: 0.95 }
                  : {
                      x: brandX,
                      y: brandY,
                      scale: brandScale,
                      opacity: brandOpacity,
                      pointerEvents: isCafeActive ? 'none' : 'auto',
                      zIndex: hoveredScreen === 'brand' ? 45 : 10,
                    }
              }
            >
              <div className="eco-device-scaler" style={{ position: 'relative', ...focusVars('brand') }}>
                <div className="eco-screen-ambient-glow glow-brand" aria-hidden="true" />
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
                    <span>app.gradient365.com/brand</span>
                    <span className="eco-url-ping ping-brand" />
                  </div>
                  <div className="eco-window-role-badge badge-brand">
                    <span className="eco-role-dot" />
                    BRAND
                  </div>
                </div>

                {/* App Body */}
                <div className="eco-app-body eco-video-body">
                  <video
                    ref={brandVideoRef}
                    src="/brands.mp4"
                    playsInline
                    muted
                    preload="metadata"
                    className="eco-dashboard-video"
                    onEnded={handleBrandEnded}
                    onError={(e) => {
                      try {
                        e.currentTarget.pause();
                      } catch {}
                    }}
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
