'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, animate, useInView, useScroll, useTransform, useSpring, useReducedMotion, useMotionValue, useMotionValueEvent, useMotionTemplate } from 'framer-motion';
import { MotionTimelineBar, AnimatedCursor, WorkflowNode, AnimatedBezierCable } from './ProductMotionEngine';

/* ─────────────────────────────────────────────────────────────────────────
   GRABBIT B2B SAAS PRODUCT INTERFACES (PHASE 5: IMMERSIVE COLOR FIELDS & PRODUCT REVEALS)
   Linear-inspired restraint · Stripe-style capability · Hyperpure operational context
   Front-Facing Flat Physical Model · Continuous Scroll-Driven Color Transitions
   90% Neutral UI · 10% Controlled Stakeholder Accent
───────────────────────────────────────────────────────────────────────── */

/* The supplier and brand frames are laid out once at their design size and scaled to the frame's width,
   like a screenshot, so the dense dashboards never reflow or overflow on smaller laptops. */
const FRAME_W = 980;
const FRAME_H = 612.5;
function useFrameZoom(frameRef: React.RefObject<HTMLDivElement | null>) {
  const [zoom, setZoom] = useState<number | null>(null);
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setZoom(window.innerWidth > 768 ? el.clientWidth / FRAME_W : null);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [frameRef]);
  return zoom === null
    ? undefined
    : ({ width: FRAME_W, height: FRAME_H, zoom, display: 'flex', flexDirection: 'column', position: 'relative', flexShrink: 0 } as React.CSSProperties);
}

/* ── Lightweight Animated Number Component (respects reduced motion) ── */
function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 900,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setDisplayValue(value);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(easeProgress * value);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, value, duration]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();

  return (
    <span ref={ref} className="stat-value-animated">
      {prefix}{formatted}{suffix}
    </span>
  );
}

/* ── Shared Geometric SVG Icons ── */
const SvgIcons = {
  Overview: () => (
    <svg className="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  Orders: () => (
    <svg className="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
  Inventory: () => (
    <svg className="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  Menu: () => (
    <svg className="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  ),
  Suppliers: () => (
    <svg className="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  ),
  Deliveries: () => (
    <svg className="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  Payments: () => (
    <svg className="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  Analytics: () => (
    <svg className="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  Campaigns: () => (
    <svg className="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Network: () => (
    <svg className="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="5" r="3" />
      <circle cx="6" cy="19" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="12" y1="8" x2="6" y2="16" />
      <line x1="12" y1="8" x2="18" y2="16" />
    </svg>
  ),
  Search: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Bell: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Help: () => (
    <svg className="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Settings: () => (
    <svg className="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

/* ═════════════════════════════════════════════════════════════════════════
   PRODUCT SECTIONS ROOT (PHASE 5: IMMERSIVE COLOR UNIVERSE)
═════════════════════════════════════════════════════════════════════════ */
export function ProductSections() {
  const localContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const supplierRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  // 1. Track arrival of the Supplier section into the viewport:
  // Starts transitioning as Supplier section enters bottom of viewport ('start end')
  // Completes transition as Supplier section reaches comfortable reading zone ('start 30%')
  const { scrollYProgress: supplierProgress } = useScroll({
    target: supplierRef,
    offset: ['start end', 'start 30%'],
  });

  // 2. Track arrival of the Brand section into the viewport:
  // Starts transitioning as Brand section enters bottom of viewport ('start end')
  // Completes transition as Brand section header reaches comfortable reading zone ('start 30%')
  const { scrollYProgress: brandProgress } = useScroll({
    target: brandRef,
    offset: ['start end', 'start 30%'],
  });

  // Inertial spring smoothing for butter-smooth color universe transitions:
  const smoothSupplierProgress = useSpring(supplierProgress, {
    stiffness: 70,
    damping: 24,
    mass: 0.28,
    restDelta: 0.0001,
  });

  const smoothBrandProgress = useSpring(brandProgress, {
    stiffness: 70,
    damping: 24,
    mass: 0.28,
    restDelta: 0.0001,
  });

  // Café -> supplier -> brand hand-off. Scrubbed by scroll, the café's order card leaves the phone and docks
  // into the supplier's Incoming orders; then a consumption ping leaves that row and docks into the brand's
  // Live consumption. Each landing floods the (white) universe with that chapter's colour from the dock point.
  const isReducedMotion = useReducedMotion();
  const isStatic = !!isReducedMotion || isMobile; // no couriers: show both chapters already coloured
  const [orderDocked, setOrderDocked] = useState(false);
  const [pingDocked, setPingDocked] = useState(false);
  const green = useFlood();
  const purple = useFlood();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Where the brand chapter starts inside the universe: the split between the green and purple floods.
  const [brandTop, setBrandTop] = useState(0);
  useEffect(() => {
    const universe = localContainerRef.current;
    if (!universe) return;
    const ro = new ResizeObserver(() => setBrandTop(brandRef.current?.offsetTop ?? 0));
    ro.observe(universe);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!isStatic) return;
    setOrderDocked(true);
    setPingDocked(true);
    green.fill();
    purple.fill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStatic]);

  // Dock when the target row reaches this fraction of the viewport height.
  const landAt = (rect: DOMRect, y: number, at: number) => rect.top + y - window.innerHeight * at;

  const order = useScrollCourier({
    enabled: !isStatic,
    endScale: (to) => to.width / ORDER_CARD_W,
    measure: (y) => {
      const eco = document.getElementById('ecosystem');
      const phone = document.querySelector('.eco-phone-chassis')?.getBoundingClientRect();
      const to = document.querySelector('[data-dock="supplier-order"]')?.getBoundingClientRect();
      if (!eco || !phone || !to) return null;
      const unpin = eco.getBoundingClientRect().top + y + eco.offsetHeight - window.innerHeight;
      return { from: phone, to, startAt: unpin, landAt: landAt(to, y, 0.55) };
    },
    onLand: (to, instant) => {
      setOrderDocked(true);
      green.flood(to, instant);
    },
    onReset: () => {
      setOrderDocked(false);
      green.reset();
    },
  });

  const ping = useScrollCourier({
    enabled: !isStatic,
    endScale: () => 1,
    measure: (y) => {
      const brand = brandRef.current?.getBoundingClientRect();
      const from = document.querySelector('[data-dock="supplier-order"]')?.getBoundingClientRect();
      const to = document.querySelector('[data-dock="brand-live"]')?.getBoundingClientRect();
      if (!brand || !from || !to) return null;
      return { from, to, startAt: brand.top + y - window.innerHeight, landAt: landAt(to, y, 0.7) };
    },
    onLand: (to, instant) => {
      setPingDocked(true);
      purple.flood(to, instant);
    },
    onReset: () => {
      setPingDocked(false);
      purple.reset();
    },
  });

  // Atmospheric radial fields opacity & subtle slow vertical drift
  // 2. Supplier Glow (Vibrant Green): fades in as Supplier arrives, fades out as Brand arrives
  const supplierGlowOpacity = useTransform(
    [smoothSupplierProgress, smoothBrandProgress],
    (values: number[]) => {
      const [sProg, bProg] = values;
      if (bProg > 0) {
        return Math.max(0, 1 - bProg / 0.4);
      }
      if (sProg <= 0.1) return 0;
      if (sProg >= 0.8) return 1;
      return (sProg - 0.1) / 0.7;
    }
  );
  const supplierGlowY = useTransform(smoothBrandProgress, [0.0, 1.0], ['2%', '1%']);

  // 3. Brand Glow (Rich Purple): fades in as Brand arrives
  const brandGlowOpacity = useTransform(smoothBrandProgress, [0.1, 0.5, 0.9, 1.0], [0, 1, 1, 1]);
  const brandGlowY = useTransform(smoothBrandProgress, [0.0, 1.0], ['1%', '-1%']);

  return (
    <motion.div
      ref={localContainerRef}
      className="product-universe"
      id="product-universe"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {mounted && !isStatic && createPortal(
        <>
          <motion.div className="courier courier-order" aria-hidden="true" style={order.style}>
            <div className="courier-order-head">
              <strong>Tamarind Lane Cafe</strong>
              <span>· Hauz Khas · Just now</span>
            </div>
            <div className="courier-order-body">6 x Hillfold House Espresso 1 kg</div>
            <div className="courier-order-foot">
              <span>➔ New order</span>
              <b>₹6,900</b>
            </div>
          </motion.div>
          <motion.div className="courier courier-ping" aria-hidden="true" style={ping.style}>
            <span className="courier-ping-dot" />
            Consumed · 6 x House Espresso · Hauz Khas
          </motion.div>
        </>,
        document.body
      )}
      {/* Colour floods, each clipped to a circle that grows from its dock point. Green covers the supplier
          chapter and purple the brand chapter (both start white); they overlap by 2 x CHAPTER_FADE around the
          boundary with opposing masks, so the chapters blend instead of meeting at a line. */}
      <motion.div
        ref={green.layer}
        className="product-universe-flood"
        aria-hidden="true"
        style={{
          backgroundColor: '#16A34A',
          clipPath: green.clip,
          bottom: 'auto',
          height: brandTop + CHAPTER_FADE,
          maskImage: `linear-gradient(to bottom, #000 calc(100% - ${CHAPTER_FADE * 2}px), transparent)`,
        }}
      >
        <div className="universe-atmospheric-layer">
          <motion.div
            className="env-atmospheric-field supplier-field"
            style={{ opacity: supplierGlowOpacity, y: supplierGlowY }}
          />
        </div>
      </motion.div>
      <motion.div
        ref={purple.layer}
        className="product-universe-flood"
        aria-hidden="true"
        style={{
          backgroundColor: '#6D28D9',
          clipPath: purple.clip,
          top: brandTop - CHAPTER_FADE,
          maskImage: `linear-gradient(to bottom, transparent, #000 ${CHAPTER_FADE * 2}px)`,
        }}
      >
        <div className="universe-atmospheric-layer">
          <motion.div
            className="env-atmospheric-field brand-field"
            style={{ opacity: brandGlowOpacity, y: brandGlowY }}
          />
        </div>
      </motion.div>

      <div ref={supplierRef}>
        <SupplierSection isMobile={isMobile} docked={orderDocked} />
      </div>
      <div ref={brandRef}>
        <BrandSection isMobile={isMobile} docked={pingDocked} />
      </div>
    </motion.div>
  );
}


const ORDER_CARD_W = 300; // px, matches .courier-order
const CHAPTER_FADE = 220; // px either side of the supplier/brand boundary where green blends into purple
const FLOODED = 100000; // px: a clip circle this big covers the whole universe

// A colour layer revealed by a circle growing from a dock point, slowly, once a courier lands there.
function useFlood() {
  const r = useMotionValue(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const clip = useMotionTemplate`circle(${r}px at ${x}px ${y}px)`;
  const layer = useRef<HTMLDivElement>(null);
  const fill = () => r.set(FLOODED);
  const flood = (at: DOMRect, instant: boolean) => {
    if (!layer.current) return;
    const u = layer.current.getBoundingClientRect();
    x.set(at.left + at.width / 2 - u.left);
    y.set(at.top + at.height / 2 - u.top);
    if (instant) return fill();
    animate(r, Math.hypot(u.width, window.innerHeight * 1.4), { duration: 4, ease: [0.45, 0, 0.4, 1], onComplete: fill });
  };
  const reset = () => {
    r.stop();
    r.set(0);
  };
  return { clip, layer, fill, flood, reset };
}

type CourierLeg = { from: DOMRect; to: DOMRect; startAt: number; landAt: number };

// Something that travels, in page coordinates, from one live element to another while the page scrolls from
// `startAt` to `landAt` (scroll positions), then lands. Scrolling back above `startAt` resets it.
function useScrollCourier({ enabled, measure, endScale, onLand, onReset }: {
  enabled: boolean;
  measure: (scrollY: number) => CourierLeg | null;
  endScale: (to: DOMRect) => number;
  onLand: (to: DOMRect, instant: boolean) => void;
  onReset: () => void;
}) {
  const left = useMotionValue(0);
  const top = useMotionValue(0);
  const scale = useMotionValue(0);
  const opacity = useMotionValue(0);
  const target = useMotionValue(0);
  const progress = useSpring(target, { stiffness: 50, damping: 18, mass: 0.7, restDelta: 0.0005 });
  const leg = useRef<{ fx: number; fy: number; tx: number; ty: number; s1: number } | null>(null);
  const landed = useRef(false);
  const { scrollY } = useScroll();

  const track = (y: number) => {
    const g = measure(y);
    if (!g) return null;
    leg.current = {
      fx: g.from.left + g.from.width / 2 + window.scrollX,
      fy: g.from.top + g.from.height / 2 + y,
      tx: g.to.left + g.to.width / 2 + window.scrollX,
      ty: g.to.top + g.to.height / 2 + y,
      s1: endScale(g.to),
    };
    target.set(Math.max(0, Math.min(1, (y - g.startAt) / Math.max(1, g.landAt - g.startAt))));
    return g;
  };

  useMotionValueEvent(scrollY, 'change', (y: number) => {
    if (enabled) track(y);
  });

  useMotionValueEvent(progress, 'change', (p: number) => {
    const l = leg.current;
    if (!l) return;
    if (p <= 0.001) {
      opacity.set(0);
      if (landed.current) {
        landed.current = false;
        onReset();
      }
      return;
    }
    if (landed.current) return;
    const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // easeInOutCubic
    const emerge = Math.min(1, p / 0.08);
    left.set(l.fx + (l.tx - l.fx) * e);
    top.set(l.fy + (l.ty - l.fy) * e);
    scale.set((1 + (l.s1 - 1) * e) * (0.6 + 0.4 * emerge)); // own size -> the docked row's size
    opacity.set(emerge);
    if (p >= 0.995) {
      landed.current = true;
      animate(opacity, 0, { duration: 0.35, ease: 'easeOut' });
      const to = measure(window.scrollY)?.to;
      if (to) onLand(to, false);
    }
  });

  useEffect(() => {
    if (!enabled) return;
    // Opened mid-page (reload, anchor link): land without the journey.
    const g = track(window.scrollY);
    if (g && window.scrollY >= g.landAt) {
      landed.current = true;
      target.jump(1);
      progress.jump(1);
      onLand(g.to, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { style: { left, top, scale, opacity } };
}

/* ═════════════════════════════════════════════════════════════════════════
   SECTION 02: SUPPLIER PRODUCT
   Workflow: PRODUCTS → ORDERS → INVENTORY → FULFILLMENT → DELIVERY
═════════════════════════════════════════════════════════════════════════ */
interface SupplierProduct {
  name: string;
  category: string;
  price: string;
  stock: string;
  orders: number;
  status: 'Available' | 'Low stock';
  batch: string;
  par: string;
}

const INITIAL_SUPPLIER_PRODUCTS: SupplierProduct[] = [
  { name: 'Arabica Specialty Beans (Medium)', category: 'Specialty Coffee', price: '₹680/kg', stock: '82 kg', orders: 24, status: 'Available', batch: 'Batch #ROAST-402 (Roasted 2d ago)', par: '120 kg' },
  { name: 'Barista Oat Milk (Steam-Stable)', category: 'Plant & Dairy', price: '₹210/L', stock: '18 L', orders: 17, status: 'Low stock', batch: 'Cold-Chain Lot #OAT-91', par: '60 L' },
  { name: '12oz Ripple Kraft Cups + Lids', category: 'Packaging', price: '₹4.20/pc', stock: '3,200 pcs', orders: 31, status: 'Available', batch: 'EcoFibre Lot #C-88', par: '2,000 pcs' },
  { name: 'Artisan Sourdough Loaves (Sliced)', category: 'Bakery', price: '₹180/ea', stock: '42 units', orders: 9, status: 'Available', batch: 'Fresh Bake 05:00 AM', par: '30 units' },
  { name: 'Madagascar Vanilla Syrup (750ml)', category: 'Syrups & Bases', price: '₹540/btl', stock: '28 btls', orders: 14, status: 'Available', batch: 'Batch #SYR-12', par: '25 btls' },
  { name: 'Uji Kyoto Ceremonial Matcha', category: 'Beverage Bases', price: '₹1,450/kg', stock: '4 kg', orders: 12, status: 'Low stock', batch: 'Air-freight Lot #M-04', par: '10 kg' },
];

interface WhatsAppPO {
  id: string;
  cafe: string;
  location: string;
  rawText: string;
  parsedSummary: string;
  amount: string;
  status: 'Picked' | 'In Van #1' | 'Scheduled';
  time: string;
}

const INITIAL_WHATSAPP_POS: WhatsAppPO[] = [
  {
    id: 'ORD-9314',
    cafe: 'Tamarind Lane Cafe',
    location: 'Hauz Khas',
    rawText: '"Same as last week please, 6 bags House Espresso for tomorrow morning"',
    parsedSummary: '6 x Hillfold House Espresso 1 kg',
    amount: '₹6,900',
    status: 'Scheduled',
    time: 'Just now',
  },
  {
    id: 'ORD-9313',
    cafe: 'Brewhaus Collective',
    location: 'Greater Kailash',
    rawText: '"10kg Filter Blend + 12L oat milk, usual 7-9 slot"',
    parsedSummary: '10 x Filter Blend 1 kg + 12 L Barista Oat',
    amount: '₹18,420',
    status: 'Picked',
    time: '3m ago',
  },
  {
    id: 'ORD-9312',
    cafe: 'Saffron Steps Cafe',
    location: 'Saket',
    rawText: '"Add 500 kraft cups and 6 vanilla syrups to tomorrow\'s run"',
    parsedSummary: '500 Ripple Cups + 6 btls Vanilla Syrup',
    amount: '₹8,760',
    status: 'In Van #1',
    time: '6m ago',
  },
  {
    id: 'ORD-9311',
    cafe: 'Lantern Row Cafe',
    location: 'Malviya Nagar',
    rawText: '"3 bags House Espresso and the decaf, same window as always"',
    parsedSummary: '3 x House Espresso 1 kg + 2 x Decaf 1 kg',
    amount: '₹9,820',
    status: 'Picked',
    time: '48m ago',
  },
];

function SupplierSection({ isMobile, docked }: { isMobile: boolean; docked: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasStyle = useFrameZoom(frameRef);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center 45%'],
  });

  // Gentle scroll-driven entrance:
  const rawY = useTransform(scrollYProgress, [0, 1], [isMobile ? 0 : 28, 0]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.25, 0.88], [0.35, 0.7, 1]);
  const rawScale = useTransform(scrollYProgress, [0, 1], [0.97, 1]);

  const springConfig = { stiffness: 70, damping: 24, mass: 0.28, restDelta: 0.0001 };
  const supplierY = useSpring(rawY, springConfig);
  const supplierOpacity = useSpring(rawOpacity, springConfig);
  const supplierScale = useSpring(rawScale, springConfig);

  // Desktop 3D Mouse Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseSpring = { stiffness: 140, damping: 24, mass: 0.2 };
  const smoothMouseX = useSpring(mouseX, mouseSpring);
  const smoothMouseY = useSpring(mouseY, mouseSpring);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isMobile || shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct * 3.6);
    mouseY.set(-yPct * 2.4);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const supplierRotateY = useTransform(smoothMouseX, (val) => 3.6 + val * 0.7);
  const supplierRotateX = useTransform(smoothMouseY, (val) => 2.2 - val * 0.4);

  // Simulation step
  const [motionStep, setMotionStep] = useState(0);
  const [isMotionPlaying, setIsMotionPlaying] = useState(true);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  useEffect(() => {
    if (!isMotionPlaying || isUserInteracting) return;
    const timer = setInterval(() => {
      setMotionStep((prev) => (prev + 1) % 3);
    }, 3200);
    return () => clearInterval(timer);
  }, [isMotionPlaying, isUserInteracting]);

  const handleUserInteract = () => {
    setIsUserInteracting(true);
    const timeout = setTimeout(() => setIsUserInteracting(false), 4500);
    return () => clearTimeout(timeout);
  };

  const supplierCursorCoords = [
    { x: '40%', y: '250px', label: 'Accept ORD-9314' },
    { x: '78%', y: '235px', label: 'Assign to run R-08' },
    { x: '78%', y: '345px', label: 'Dispatch R-07' },
  ];

  // Interactive UI State
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTab, setActiveTab] = useState<'catalog' | 'whatsapp' | 'routes' | 'settlement'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [products, setProducts] = useState<SupplierProduct[]>(INITIAL_SUPPLIER_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<SupplierProduct>(INITIAL_SUPPLIER_PRODUCTS[0]);
  const [whatsappPOs, setWhatsappPOs] = useState<WhatsAppPO[]>(INITIAL_WHATSAPP_POS);
  useEffect(() => {
    if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
  }, []);
  const [selectedVan, setSelectedVan] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Specialty Coffee');
  const [newProductPrice, setNewProductPrice] = useState('₹820/kg');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');



  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddProductModal(false);
    };
    if (showAddProductModal) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddProductModal]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleSimulateWhatsAppPO = () => {
    const newPO: WhatsAppPO = {
      id: 'ORD-9315',
      cafe: 'Juniper Steps Cafe',
      location: 'Hauz Khas',
      rawText: '"Urgent: Send 20kg Arabica Medium + 10L Barista Oat for tomorrow rush"',
      parsedSummary: '20kg Arabica (Medium) + 10L Barista Oat',
      amount: '₹19,200',
      status: 'Picked',
      time: 'Just now',
    };
    setWhatsappPOs((prev) => [newPO, ...prev]);
    showToast('⚡ WhatsApp order from Juniper Steps Cafe parsed: ORD-9315 created (₹19,200)');
  };

  const handleAllocateBatch = () => {
    setProducts((prev) =>
      prev.map((p) =>
        p.name === selectedProduct.name
          ? { ...p, stock: `${parseInt(p.stock) + 10 || 92} kg`, orders: p.orders + 1 }
          : p
      )
    );
    showToast(`Batch #ROAST-402: Allocated +10kg stock for ${selectedProduct.name}`);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newProductName.trim() || 'Single Origin Cold Brew Blend';
    const newSku: SupplierProduct = {
      name,
      category: newProductCategory,
      price: newProductPrice,
      stock: '50 kg',
      orders: 1,
      status: 'Available',
      batch: 'Batch #ROAST-NEW',
      par: '80 kg',
    };
    setProducts((prev) => [newSku, ...prev]);
    setSelectedProduct(newSku);
    setShowAddProductModal(false);
    showToast(`Published wholesale SKU: ${name}`);
  };

  const scrollToAnchor = (anchorId: string, tab: 'catalog' | 'whatsapp' | 'routes' | 'settlement') => {
    setActiveTab(tab);
    setHasScrolled(true);
    const target = document.getElementById(anchorId);
    if (target && mainScrollRef.current) {
      const parentTop = mainScrollRef.current.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      mainScrollRef.current.scrollBy({ top: targetTop - parentTop - 10, behavior: 'smooth' });
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section
      ref={sectionRef}
      className="product-story-section"
      id="for-suppliers"
      role="region"
      aria-label="Supplier Operations Section"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="product-ambient-glow" aria-hidden="true" />
      <div className="product-story-container">
        <div className="product-grid-supplier">

          {/* Left: Dynamic 3D Tilted Product Interface with Google-Style Motion Workflow */}
          <div className="product-stage">
            <motion.div
              ref={frameRef}
              className="product-frame"
              style={{
                x: 0,
                y: shouldReduceMotion ? 0 : supplierY,
                opacity: shouldReduceMotion ? 1 : supplierOpacity,
                scale: shouldReduceMotion ? 1 : supplierScale,
                rotateY: shouldReduceMotion || isMobile ? 0 : supplierRotateY,
                rotateX: shouldReduceMotion || isMobile ? 0 : supplierRotateX,
              }}
              onMouseEnter={handleUserInteract}
              onClick={handleUserInteract}
            >
              <div className="product-frame-canvas" style={canvasStyle}>
              {/* Google-Style Product Motion Vignette Chrome */}
              <MotionTimelineBar
                currentStep={motionStep}
                totalSteps={3}
                stepLabels={['Order In', 'Assign Run', 'Dispatch']}
                isPlaying={isMotionPlaying && !isUserInteracting}
                onTogglePlay={() => setIsMotionPlaying(!isMotionPlaying)}
                accentColor="#22C55E"
              />

              <AnimatedCursor
                x={supplierCursorCoords[motionStep].x}
                y={supplierCursorCoords[motionStep].y}
                isClicking={isMotionPlaying && !isUserInteracting}
                label={supplierCursorCoords[motionStep].label}
                accentColor="#22C55E"
              />
              {/* Browser Chrome */}
              <div className="browser-top-bar">
                <div className="browser-dots" aria-hidden="true">
                  <span className="browser-dot" />
                  <span className="browser-dot" />
                  <span className="browser-dot" />
                </div>
                <div className="browser-url-pill">
                  <svg className="browser-url-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>app.gradient365.com/supplier/orders</span>
                </div>
                <div className="browser-actions">
                  <div className="browser-user-badge">
                    <span className="browser-avatar" style={{ background: '#064E3B' }}>SS</span>
                    <span>Southfield Supply Co.</span>
                  </div>
                </div>
              </div>

              {/* Shared SaaS Dashboard UI */}
              <div className="dashboard-layout">
                {/* Toast Notification */}
                {toastMessage && (
                  <div className="dash-toast-banner" role="status">
                    <span>✓</span> {toastMessage}
                  </div>
                )}

                {/* Unified Gradient Sidebar */}
                <aside className="dashboard-sidebar sidebar-dense" aria-label="Supplier Dashboard Navigation">
                  <div>
                    <div className="sidebar-brand-header">
                      <div className="sidebar-grabbit-logo">
                        <span className="grabbit-mark" style={{ background: '#064E3B' }}>G</span>
                        <span className="grabbit-name">Gradient</span>
                      </div>
                      <span className="sidebar-org-sub">Supplier</span>
                    </div>
                    <div className="sidebar-workspace">
                      <span className="sidebar-workspace-mark" style={{ background: '#DCFCE7', color: '#15803D' }}>SF</span>
                      <span className="sidebar-workspace-text"><strong>Southfield Supply Co.</strong><small>South Delhi hub · 3 warehouses</small></span>
                    </div>

                    <div className="sidebar-nav-section-label">Operations</div>
                    <nav className="sidebar-nav">
                      <button type="button" className="sidebar-item" onClick={() => showToast('Supplier overview opened')}>
                        <SvgIcons.Overview />
                        <span>Overview</span>
                      </button>
                      <button
                        type="button"
                        className={`sidebar-item ${activeTab === 'whatsapp' ? 'active' : ''}`}
                        onClick={() => scrollToAnchor('sup-whatsapp-section', 'whatsapp')}
                      >
                        <SvgIcons.Orders />
                        <span>Orders</span>
                        <span className="sidebar-badge-count" style={{ background: '#DCFCE7', color: '#166534' }}>13</span>
                      </button>
                      <button
                        type="button"
                        className={`sidebar-item ${activeTab === 'routes' ? 'active' : ''}`}
                        onClick={() => scrollToAnchor('sup-route-section', 'routes')}
                      >
                        <SvgIcons.Deliveries />
                        <span>Delivery runs</span>
                        <span className="sidebar-badge-count" style={{ background: '#DCFCE7', color: '#166534' }}>4 live</span>
                      </button>
                      <button
                        type="button"
                        className={`sidebar-item ${activeTab === 'settlement' ? 'active' : ''}`}
                        onClick={() => scrollToAnchor('sup-settlement-section', 'settlement')}
                      >
                        <SvgIcons.Payments />
                        <span>Invoices</span>
                        <span className="sidebar-badge-count" style={{ background: '#FEF3C7', color: '#92400E' }}>9 due</span>
                      </button>
                    </nav>

                    <div className="sidebar-nav-section-label">Catalogue</div>
                    <nav className="sidebar-nav">
                      <button
                        type="button"
                        className={`sidebar-item ${activeTab === 'catalog' ? 'active' : ''}`}
                        onClick={() => scrollToAnchor('sup-catalog-table', 'catalog')}
                      >
                        <SvgIcons.Menu />
                        <span>Catalogue</span>
                        <span className="sidebar-badge-count">318</span>
                      </button>
                      <button type="button" className="sidebar-item" onClick={() => showToast('6 SKUs below par: reorder suggested')}>
                        <SvgIcons.Inventory />
                        <span>Inventory</span>
                        <span className="sidebar-badge-count" style={{ background: '#FEF3C7', color: '#92400E' }}>6 low</span>
                      </button>
                    </nav>

                    <div className="sidebar-nav-section-label">Customers</div>
                    <nav className="sidebar-nav">
                      <button type="button" className="sidebar-item" onClick={() => showToast('142 cafés supplied this month')}>
                        <SvgIcons.Suppliers />
                        <span>Cafes</span>
                        <span className="sidebar-badge-count">142</span>
                      </button>
                      <button type="button" className="sidebar-item" onClick={() => showToast('7 open enquiries')}>
                        <SvgIcons.Network />
                        <span>Enquiries</span>
                        <span className="sidebar-badge-count">7</span>
                      </button>
                      <button type="button" className="sidebar-item" onClick={() => showToast('4 brand purchase orders')}>
                        <SvgIcons.Campaigns />
                        <span>Brand orders</span>
                        <span className="sidebar-badge-count">4</span>
                      </button>
                      <button type="button" className="sidebar-item" onClick={() => showToast('Demand forecast by zone opened')}>
                        <SvgIcons.Analytics />
                        <span>Demand</span>
                      </button>
                    </nav>
                  </div>

                  <div className="sidebar-footer">
                    <div className="sidebar-today">
                      <div className="sidebar-today-head"><span>Today</span><span>Thu 22 Oct</span></div>
                      <div className="sidebar-today-row"><span>Delivered</span><strong>62</strong></div>
                      <div className="sidebar-today-row"><span>Value</span><strong>₹4.8L</strong></div>
                      <div className="sidebar-today-row"><span>On time</span><strong>98.4%</strong></div>
                      <div className="sidebar-today-bar"><i style={{ width: '98.4%', background: '#16A34A' }} /></div>
                    </div>
                    <button type="button" className="sidebar-item" onClick={() => showToast('Warehouse settings & pricing rules')}>
                      <SvgIcons.Settings />
                      <span>Settings</span>
                    </button>
                    <div className="sidebar-user">
                      <span className="sidebar-user-avatar">RK</span>
                      <span className="sidebar-workspace-text"><strong>Ravi Kulkarni</strong><small>Fulfilment lead · 8 on shift</small></span>
                    </div>
                  </div>
                </aside>

                {/* Main Operations Area (Contained Smooth Scrolling) */}
                <main
                  ref={mainScrollRef}
                  className="dashboard-main"
                  data-lenis-prevent
                  tabIndex={0}
                  aria-label="Supplier operational workspace"
                >
                  {/* Top Navigation Bar */}
                  <div className="dashboard-top-nav">
                    <div className="dashboard-heading-group">
                      <div className="dashboard-title-row">
                        <h3 className="dashboard-page-title">Orders</h3>
                      </div>
                    </div>

                    <div className="dashboard-top-nav-right">
                      <span className="status-pill status-available">
                        <span className="status-dot" aria-hidden="true" />
                        312 orders this week
                      </span>
                      <button
                        type="button"
                        className="dash-btn-primary"
                        onClick={handleSimulateWhatsAppPO}
                      >
                        <span>+</span>
                        <span>Simulate WhatsApp PO</span>
                      </button>
                    </div>
                  </div>
                  {/* Four live order-board counts */}
                  <div className="dashboard-overview-row dashboard-overview-row--four">
                    <div className="dashboard-stat">
                      <span className="stat-label">New</span>
                      <div className="stat-value">{docked ? 13 : 12}</div>
                      <div className="stat-trend positive"><span>+3 in 10 min</span></div>
                    </div>
                    <div className="dashboard-stat">
                      <span className="stat-label">In progress</span>
                      <div className="stat-value">24</div>
                      <div className="stat-trend"><span>Pack &amp; invoice</span></div>
                    </div>
                    <div className="dashboard-stat">
                      <span className="stat-label">Dispatched</span>
                      <div className="stat-value">16</div>
                      <div className="stat-trend"><span>On the road · 4 runs</span></div>
                    </div>
                    <div className="dashboard-stat" style={{ background: '#F0FDF4' }}>
                      <span className="stat-label" style={{ color: '#15803D' }}>Delivered</span>
                      <div className="stat-value" style={{ color: '#15803D' }}>62</div>
                      <div className="stat-trend positive"><span>Today · 98.4% on time</span></div>
                    </div>
                  </div>

                  {/* Clean 2-Column Bento Workspace */}
                  <div className="dashboard-bento">
                    {/* Left: Live WhatsApp PO Stream */}
                    <div className="dashboard-card" style={{ padding: '10px 12px' }}>
                      <div className="card-header">
                        <div>
                          <span className="card-title" id="sup-whatsapp-section">Incoming orders</span>
                        </div>
                        <button
                          type="button"
                          className="table-action-btn"
                          style={{ background: '#DCFCE7', color: '#166534', borderColor: '#BBF7D0' }}
                          onClick={handleSimulateWhatsAppPO}
                        >
                          + Simulate order
                        </button>
                      </div>

                      <div className="simple-order-list">
                        {whatsappPOs.slice(0, 4).map((po) => (
                          <div
                            key={po.id}
                            className={`simple-order-card${po.id === 'ORD-9314' ? ` dock-target${docked ? ' is-docked' : ''}` : ''}`}
                            data-dock={po.id === 'ORD-9314' ? 'supplier-order' : undefined}
                            onClick={() => showToast(`Order manifest opened for ${po.cafe} (${po.amount})`)}
                          >
                            <div className="simple-card-header">
                              <span className="simple-card-title">{po.cafe} <span style={{ fontWeight: 500, color: '#64748B' }}>· {po.location} · {po.time}</span></span>
                              <span className={`status-pill status-${po.status === 'Picked' ? 'processing' : po.status === 'In Van #1' ? 'transit' : 'available'}`}>
                                <span className="status-dot" aria-hidden="true" />
                                {po.status}
                              </span>
                            </div>
                            <div className="simple-card-body">{po.rawText}</div>
                            <div className="simple-card-footer">
                              <span style={{ color: '#166534', fontWeight: 600 }}>➔ {po.parsedSummary}</span>
                              <span style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono, monospace)' }}>{po.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Production Roasting & Van Route Dispatch */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Today's delivery runs */}
                      <div className="dashboard-card" style={{ padding: '10px 12px' }} id="sup-route-section">
                        <div className="card-header">
                          <span className="card-title">Delivery runs</span>
                          <span className="status-pill status-transit">63 / 90 drops</span>
                        </div>
                        <div style={{ height: '5px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden', marginBottom: '8px' }}>
                          <div style={{ width: '70%', height: '100%', background: '#16A34A', borderRadius: '99px' }} />
                        </div>
                        <div className="simple-route-strip">
                          <div className="simple-route-row">
                            <span><strong>R-07</strong> Jangpura &amp; Nizamuddin</span>
                            <span style={{ color: '#166534', fontWeight: 600 }}>On road · 0/12</span>
                          </div>
                          <div className="simple-route-row">
                            <span><strong>R-04</strong> Greater Kailash</span>
                            <span style={{ color: '#166534', fontWeight: 600 }}>8/11 · ETA 9:40</span>
                          </div>
                          <div className="simple-route-row">
                            <span><strong>R-02</strong> Vasant Kunj &amp; Mehrauli</span>
                            <span style={{ color: '#166534', fontWeight: 600 }}>12/14</span>
                          </div>
                          <div className="simple-route-row">
                            <span><strong>R-05</strong> Malviya Nagar</span>
                            <span style={{ color: '#166534', fontWeight: 600 }}>7/12</span>
                          </div>
                        </div>
                      </div>

                      {/* Low stock + cold chain */}
                      <div className="dashboard-card" style={{ padding: '10px 12px' }} id="sup-catalog-table">
                        <div className="card-header">
                          <span className="card-title">Low stock</span>
                          <span className="status-pill" style={{ background: '#FEF3C7', color: '#92400E' }}>6 SKUs</span>
                        </div>
                        <div className="simple-route-strip">
                          {products.filter((p) => p.status === 'Low stock').concat(products.filter((p) => p.status !== 'Low stock')).slice(0, 4).map((p) => (
                            <div className="simple-route-row" key={p.name} onClick={() => { setSelectedProduct(p); handleAllocateBatch(); }}>
                              <span>{p.name}</span>
                              <span style={{ color: p.status === 'Low stock' ? '#92400E' : '#166534', fontWeight: 600 }}>{p.stock} · par {p.par}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </main>
              </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Minimal, Typographic Editorial */}
          <motion.div
            className="product-text-column"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="section-eyebrow">FOR SUPPLIERS</span>
            <h2 className="section-title">
              Supply more.<br />
              Manage less.
            </h2>
            <p className="section-description">
              Take orders from WhatsApp, plan your roast, dispatch vans, and get paid the next day.
            </p>

            <div className="feature-list">
              <div
                className={`feature-item ${activeFeature === 0 ? 'active' : ''}`}
                onClick={() => { setActiveFeature(0); showToast('Roast par schedule synced: 180kg scheduled'); }}
                onMouseEnter={() => setActiveFeature(0)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveFeature(0);
                    scrollToAnchor('sup-catalog-table', 'catalog');
                  }
                }}
                aria-pressed={activeFeature === 0}
              >
                <span className="feature-num">01</span>
                <div className="feature-content">
                  <span className="feature-heading">Know your stock and roast plan.</span>
                  <span className="feature-text">Live inventory and roast batches, with alerts before you run low.</span>
                </div>
              </div>

              <div
                className={`feature-item ${activeFeature === 1 ? 'active' : ''}`}
                onClick={() => { setActiveFeature(1); handleSimulateWhatsAppPO(); }}
                onMouseEnter={() => setActiveFeature(1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveFeature(1);
                    scrollToAnchor('sup-whatsapp-section', 'whatsapp');
                  }
                }}
                aria-pressed={activeFeature === 1}
              >
                <span className="feature-num">02</span>
                <div className="feature-content">
                  <span className="feature-heading">Turn WhatsApp into orders.</span>
                  <span className="feature-text">Voice notes and chats become clean purchase orders in seconds.</span>
                </div>
              </div>

              <div
                className={`feature-item ${activeFeature === 2 ? 'active' : ''}`}
                onClick={() => { setActiveFeature(2); showToast('Morning van routes dispatched: 34 café deliveries'); }}
                onMouseEnter={() => setActiveFeature(2)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveFeature(2);
                    scrollToAnchor('sup-route-section', 'routes');
                  }
                }}
                aria-pressed={activeFeature === 2}
              >
                <span className="feature-num">03</span>
                <div className="feature-content">
                  <span className="feature-heading">Dispatch and get paid next day.</span>
                  <span className="feature-text">Plan van routes and receive bank settlement the next morning.</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   SECTION 03: BRAND PRODUCT
   Workflow: DISCOVER CAFÉS → LAUNCH → DISTRIBUTE → TRACK → ANALYZE
   Vertical visual progression: Details Top ↓ → Product (0° Y) → Details Bottom ↑
═════════════════════════════════════════════════════════════════════════ */
interface BrandCampaign {
  title: string;
  cafes: string;
  product: string;
  status: 'Active' | 'Scheduled' | 'Completed';
  performance: string;
  reach: string;
  orders: string;
  revenue: string;
  period: string;
  approval: string;
  reorderRate: string;
  metro: 'Bangalore' | 'Mumbai' | 'Delhi-NCR' | 'All';
}

const INITIAL_BRAND_CAMPAIGNS: BrandCampaign[] = [
  {
    title: 'House Espresso · South Delhi',
    cafes: '46 cafés',
    product: 'Hillfold House Espresso',
    status: 'Active',
    performance: '50% Conversion',
    reach: '46 cafés',
    orders: '312 orders',
    revenue: '₹5.2L',
    period: '01 Oct → 31 Oct',
    approval: '4.8 ★ barista score',
    reorderRate: '64%',
    metro: 'Delhi-NCR',
  },
  {
    title: 'Cold Brew launch · Gurugram',
    cafes: '41 cafés',
    product: 'Cold Brew Coarse',
    status: 'Active',
    performance: '37 tried',
    reach: '41 cafés',
    orders: '96 kits',
    revenue: '₹2.2L',
    period: '08 Oct → 07 Nov',
    approval: '4.7 ★ barista score',
    reorderRate: '58%',
    metro: 'Delhi-NCR',
  },
  {
    title: 'Filter Blend refill · Noida',
    cafes: '28 cafés',
    product: 'Hillfold Filter Blend',
    status: 'Scheduled',
    performance: 'Starts 1 Nov',
    reach: '28 cafés',
    orders: '120 kits queued',
    revenue: '₹1.1L projected',
    period: '01 Nov → 30 Nov',
    approval: '4.6 ★ barista score',
    reorderRate: '61%',
    metro: 'Delhi-NCR',
  },
  {
    title: 'Decaf Swiss Water · Central Delhi',
    cafes: '19 cafés',
    product: 'Decaf Swiss Water',
    status: 'Completed',
    performance: '68% Conversion',
    reach: '19 cafés',
    orders: '74 bags',
    revenue: '₹1.4L',
    period: '01 Sep → 30 Sep',
    approval: '4.7 ★ barista score',
    reorderRate: '66%',
    metro: 'Delhi-NCR',
  },
];

interface BaristaReview {
  id: string;
  cafe: string;
  metro: string;
  barista: string;
  rating: number;
  product: string;
  comment: string;
  outcome: string;
}

const INITIAL_BARISTA_REVIEWS: BaristaReview[] = [
  {
    id: 'REV-101',
    cafe: 'Tamarind Lane Cafe',
    metro: 'Delhi NCR · Hauz Khas',
    barista: 'Head Barista',
    rating: 4.9,
    product: 'Hillfold House Espresso',
    comment: 'Holds a sweet, even shot through the morning rush. Milk drinks keep the chocolate note.',
    outcome: 'Repeat order: 6 x 1 kg every week',
  },
  {
    id: 'REV-102',
    cafe: 'Brewhaus Collective',
    metro: 'Delhi NCR · Greater Kailash',
    barista: 'Lead Barista',
    rating: 4.8,
    product: 'Hillfold Filter Blend',
    comment: 'Clean pour-over profile, consistent roast to roast. Easy to dial in on batch brew.',
    outcome: 'Switched the filter bar to Hillfold',
  },
  {
    id: 'REV-103',
    cafe: 'Saffron Steps Cafe',
    metro: 'Delhi NCR · Saket',
    barista: 'Beverage lead',
    rating: 4.7,
    product: 'Cold Brew Coarse',
    comment: 'Trial kit sold out in four days. Smooth, low acid, customers asked for it by name.',
    outcome: 'Converted to a standing order',
  },
];

function BrandSection({ isMobile, docked }: { isMobile: boolean; docked: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasStyle = useFrameZoom(frameRef);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center 45%'],
  });

  // Gentle scroll-driven entrance:
  const rawY = useTransform(scrollYProgress, [0, 1], [isMobile ? 0 : 28, 0]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.25, 0.88], [0.35, 0.7, 1]);
  const rawScale = useTransform(scrollYProgress, [0, 1], [0.97, 1]);

  const springConfig = { stiffness: 70, damping: 24, mass: 0.28, restDelta: 0.0001 };
  const brandY = useSpring(rawY, springConfig);
  const brandOpacity = useSpring(rawOpacity, springConfig);
  const brandScale = useSpring(rawScale, springConfig);

  // Desktop 3D Mouse Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseSpring = { stiffness: 140, damping: 24, mass: 0.2 };
  const smoothMouseX = useSpring(mouseX, mouseSpring);
  const smoothMouseY = useSpring(mouseY, mouseSpring);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isMobile || shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct * 3.6);
    mouseY.set(-yPct * 2.4);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const brandRotateY = useTransform(smoothMouseX, (val) => -3.6 + val * 0.7);
  const brandRotateX = useTransform(smoothMouseY, (val) => 2.2 - val * 0.4);

  // Simulation step
  const [motionStep, setMotionStep] = useState(0);
  const [isMotionPlaying, setIsMotionPlaying] = useState(true);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  useEffect(() => {
    if (!isMotionPlaying || isUserInteracting) return;
    const timer = setInterval(() => {
      setMotionStep((prev) => (prev + 1) % 3);
    }, 3200);
    return () => clearInterval(timer);
  }, [isMotionPlaying, isUserInteracting]);

  const handleUserInteract = () => {
    setIsUserInteracting(true);
    const timeout = setTimeout(() => setIsUserInteracting(false), 4500);
    return () => clearTimeout(timeout);
  };

  const brandCursorCoords = [
    { x: '40%', y: '250px', label: 'South Delhi hotspot' },
    { x: '78%', y: '235px', label: 'Tamarind Lane reorder' },
    { x: '78%', y: '345px', label: 'Trial → orders 50%' },
  ];

  // Interactive UI State
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'telemetry' | 'funnel' | 'share'>('campaigns');
  const [selectedMetro, setSelectedMetro] = useState<'All' | 'Bangalore' | 'Mumbai' | 'Delhi-NCR'>('All');
  const [campaigns, setCampaigns] = useState<BrandCampaign[]>(INITIAL_BRAND_CAMPAIGNS);
  useEffect(() => {
    if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
  }, []);
  const [selectedCampaign, setSelectedCampaign] = useState<BrandCampaign>(INITIAL_BRAND_CAMPAIGNS[0]);
  const [baristaReviews, setBaristaReviews] = useState<BaristaReview[]>(INITIAL_BARISTA_REVIEWS);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignProduct, setNewCampaignProduct] = useState('Barista Oat Milk');
  const [newCampaignMetro, setNewCampaignMetro] = useState<'Bangalore' | 'Mumbai' | 'Delhi-NCR'>('Bangalore');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');



  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowNewCampaignModal(false);
    };
    if (showNewCampaignModal) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNewCampaignModal]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newCampaignTitle.trim() || 'Single Origin Nitro Canisters Trial';
    const newCamp: BrandCampaign = {
      title,
      cafes: '40 cafés',
      product: newCampaignProduct,
      status: 'Active',
      performance: 'Pending Tastings',
      reach: '40 verified venues',
      orders: '180 pre-orders',
      revenue: '₹65K',
      period: '01 Nov → 30 Nov',
      approval: '4.9 ★',
      reorderRate: '75%',
      metro: newCampaignMetro,
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    setSelectedCampaign(newCamp);
    setShowNewCampaignModal(false);
    showToast(`Flight initiated: ${title} (${newCampaignMetro})`);
  };

  const handleSeedMoreKits = () => {
    showToast(`Dispatched 20 more trial kits across ${selectedMetro === 'All' ? 'Delhi NCR' : selectedMetro} cafés`);
  };

  const scrollToAnchor = (anchorId: string, tab: 'campaigns' | 'telemetry' | 'funnel' | 'share') => {
    setActiveTab(tab);
    setHasScrolled(true);
    const target = document.getElementById(anchorId);
    if (target && mainScrollRef.current) {
      const parentTop = mainScrollRef.current.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      mainScrollRef.current.scrollBy({ top: targetTop - parentTop - 10, behavior: 'smooth' });
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.product.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMetro = selectedMetro === 'All' || c.metro === selectedMetro || c.metro === 'All';
    return matchesSearch && matchesMetro;
  });

  return (
    <section
      ref={sectionRef}
      className="product-story-section"
      id="for-brands"
      role="region"
      aria-label="Brand Operations Section"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="product-ambient-glow" aria-hidden="true" />
      <div className="product-story-container">
        <div className="product-grid-brand">

          {/* Left: Minimal, Typographic Editorial */}
          <motion.div
            className="product-text-column"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="section-eyebrow">FOR BRANDS</span>
            <h2 className="section-title">
              Grow distribution across India’s best cafés.
            </h2>
            <p className="section-description">
              Put your product in front of verified baristas, see what they use, and turn trials into weekly orders.
            </p>

            <div className="feature-list">
              <div
                className={`feature-item ${activeFeature === 0 ? 'active' : ''}`}
                onClick={() => { setActiveFeature(0); showToast('Filtering 312 specialty cafés across BLR, BOM, DEL'); }}
                onMouseEnter={() => setActiveFeature(0)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveFeature(0);
                    scrollToAnchor('brand-campaigns-table', 'campaigns');
                  }
                }}
                aria-pressed={activeFeature === 0}
              >
                <span className="feature-num">01</span>
                <div className="feature-content">
                  <span className="feature-heading">Find the right cafés.</span>
                  <span className="feature-text">Filter verified specialty cafés by city and volume.</span>
                </div>
              </div>

              <div
                className={`feature-item ${activeFeature === 1 ? 'active' : ''}`}
                onClick={() => { setActiveFeature(1); setShowNewCampaignModal(true); }}
                onMouseEnter={() => setActiveFeature(1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveFeature(1);
                    scrollToAnchor('brand-telemetry-section', 'telemetry');
                  }
                }}
                aria-pressed={activeFeature === 1}
              >
                <span className="feature-num">02</span>
                <div className="feature-content">
                  <span className="feature-heading">Send samples.</span>
                  <span className="feature-text">Baristas test your product and score it.</span>
                </div>
              </div>

              <div
                className={`feature-item ${activeFeature === 2 ? 'active' : ''}`}
                onClick={() => { setActiveFeature(2); showToast('78% trial-to-PO conversion rate · Standing Net-15'); }}
                onMouseEnter={() => setActiveFeature(2)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveFeature(2);
                    scrollToAnchor('brand-funnel-section', 'funnel');
                  }
                }}
                aria-pressed={activeFeature === 2}
              >
                <span className="feature-num">03</span>
                <div className="feature-content">
                  <span className="feature-heading">Turn trials into repeat orders.</span>
                  <span className="feature-text">78% of approved trials reorder every week.</span>
                </div>
              </div>

              <div
                className={`feature-item ${activeFeature === 3 ? 'active' : ''}`}
                onClick={() => { setActiveFeature(3); showToast('Market velocity: 4,200L/month oat milk consumed'); }}
                onMouseEnter={() => setActiveFeature(3)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveFeature(3);
                    scrollToAnchor('brand-share-section', 'share');
                  }
                }}
                aria-pressed={activeFeature === 3}
              >
                <span className="feature-num">04</span>
                <div className="feature-content">
                  <span className="feature-heading">See what sells.</span>
                  <span className="feature-text">Daily usage and market share, by city.</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Dynamic 3D Tilted Product Interface with Google-Style Motion Workflow */}
          <div className="product-stage">
            <motion.div
              ref={frameRef}
              className="product-frame"
              style={{
                x: 0,
                y: shouldReduceMotion ? 0 : brandY,
                opacity: shouldReduceMotion ? 1 : brandOpacity,
                scale: shouldReduceMotion ? 1 : brandScale,
                rotateY: shouldReduceMotion || isMobile ? 0 : brandRotateY,
                rotateX: shouldReduceMotion || isMobile ? 0 : brandRotateX,
              }}
              onMouseEnter={handleUserInteract}
              onClick={handleUserInteract}
            >
              <div className="product-frame-canvas" style={canvasStyle}>
              {/* Google-Style Product Motion Vignette Chrome */}
              <MotionTimelineBar
                currentStep={motionStep}
                totalSteps={3}
                stepLabels={['Where it sells', 'Live orders', 'Trial → repeat']}
                isPlaying={isMotionPlaying && !isUserInteracting}
                onTogglePlay={() => setIsMotionPlaying(!isMotionPlaying)}
                accentColor="#9333EA"
              />

              <AnimatedCursor
                x={brandCursorCoords[motionStep].x}
                y={brandCursorCoords[motionStep].y}
                isClicking={isMotionPlaying && !isUserInteracting}
                label={brandCursorCoords[motionStep].label}
                accentColor="#9333EA"
              />
              {/* Browser Chrome */}
              <div className="browser-top-bar">
                <div className="browser-dots" aria-hidden="true">
                  <span className="browser-dot" />
                  <span className="browser-dot" />
                  <span className="browser-dot" />
                </div>
                <div className="browser-url-pill">
                  <svg className="browser-url-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>app.gradient365.com/brand/dashboard</span>
                </div>
                <div className="browser-actions">
                  <div className="browser-user-badge">
                    <span className="browser-avatar" style={{ background: '#6D28D9' }}>HR</span>
                    <span>Hillfold Roasters</span>
                  </div>
                </div>
              </div>

              {/* Shared SaaS Dashboard UI */}
              <div className="dashboard-layout">
                {/* Toast Notification */}
                {toastMessage && (
                  <div className="dash-toast-banner" role="status">
                    <span>✓</span> {toastMessage}
                  </div>
                )}

                {/* Unified Gradient Sidebar */}
                <aside className="dashboard-sidebar sidebar-dense" aria-label="Brand Dashboard Navigation">
                  <div>
                    <div className="sidebar-brand-header">
                      <div className="sidebar-grabbit-logo">
                        <span className="grabbit-mark" style={{ background: '#6D28D9' }}>G</span>
                        <span className="grabbit-name">Gradient</span>
                      </div>
                      <span className="sidebar-org-sub">Brand portal</span>
                    </div>
                    <div className="sidebar-workspace">
                      <span className="sidebar-workspace-mark" style={{ background: '#F1EAFE', color: '#6D28D9' }}>HR</span>
                      <span className="sidebar-workspace-text"><strong>Hillfold Roasters</strong><small>Delhi NCR · 15 districts</small></span>
                    </div>

                    <div className="sidebar-nav-section-label">Overview</div>
                    <nav className="sidebar-nav">
                      <button
                        type="button"
                        className={`sidebar-item ${activeTab === 'funnel' ? 'active' : ''}`}
                        onClick={() => scrollToAnchor('brand-funnel-section', 'funnel')}
                      >
                        <SvgIcons.Overview />
                        <span>Dashboard</span>
                      </button>
                      <button type="button" className="sidebar-item" onClick={() => showToast('9 open café queries')}>
                        <SvgIcons.Network />
                        <span>Cafe Queries</span>
                        <span className="sidebar-badge-count" style={{ background: '#EDE9FE', color: '#6D28D9' }}>9</span>
                      </button>
                      <button
                        type="button"
                        className={`sidebar-item ${activeTab === 'telemetry' ? 'active' : ''}`}
                        onClick={() => scrollToAnchor('brand-telemetry-section', 'telemetry')}
                      >
                        <SvgIcons.Analytics />
                        <span>Live Consumption</span>
                        <span className="sidebar-badge-count" style={{ background: '#DCFCE7', color: '#15803D' }}>live</span>
                      </button>
                      <button type="button" className="sidebar-item" onClick={() => showToast('Delhi NCR heatmap: South Delhi is the hotspot')}>
                        <SvgIcons.Search />
                        <span>Heatmaps</span>
                        <span className="sidebar-badge-count" style={{ background: '#EDE9FE', color: '#6D28D9' }}>new</span>
                      </button>
                    </nav>

                    <div className="sidebar-nav-section-label">Network</div>
                    <nav className="sidebar-nav">
                      <button type="button" className="sidebar-item" onClick={() => showToast('Distributor sales by zone')}>
                        <SvgIcons.Payments />
                        <span>Distributor Sales</span>
                      </button>
                      <button type="button" className="sidebar-item" onClick={() => showToast('4 linked distributors')}>
                        <SvgIcons.Suppliers />
                        <span>Supplier Network</span>
                        <span className="sidebar-badge-count">4</span>
                      </button>
                      <button type="button" className="sidebar-item" onClick={() => showToast('12 supplier orders in flight')}>
                        <SvgIcons.Deliveries />
                        <span>Supplier Orders</span>
                        <span className="sidebar-badge-count">12</span>
                      </button>
                    </nav>

                    <div className="sidebar-nav-section-label">Brand</div>
                    <nav className="sidebar-nav">
                      <button type="button" className="sidebar-item" onClick={() => showToast('18 products listed')}>
                        <SvgIcons.Menu />
                        <span>Products</span>
                        <span className="sidebar-badge-count">18</span>
                      </button>
                      <button
                        type="button"
                        className={`sidebar-item ${activeTab === 'campaigns' ? 'active' : ''}`}
                        onClick={() => scrollToAnchor('brand-campaigns-table', 'campaigns')}
                      >
                        <SvgIcons.Campaigns />
                        <span>Trial Campaigns</span>
                        <span className="sidebar-badge-count" style={{ background: '#EDE9FE', color: '#6D28D9' }}>3 live</span>
                      </button>
                    </nav>
                  </div>

                  <div className="sidebar-footer">
                    <div className="sidebar-today">
                      <div className="sidebar-today-head"><span>This month</span><span>Oct</span></div>
                      <div className="sidebar-today-row"><span>Target</span><strong>₹16L</strong></div>
                      <div className="sidebar-today-row"><span>Achieved</span><strong>₹14.2L · 89%</strong></div>
                      <div className="sidebar-today-bar"><i style={{ width: '89%', background: '#7C3AED' }} /></div>
                      <div className="sidebar-today-row"><span>Trials running</span><strong>3 · 41 cafés</strong></div>
                    </div>
                    <button type="button" className="sidebar-item" onClick={() => showToast('Brand settings')}>
                      <SvgIcons.Settings />
                      <span>Settings</span>
                    </button>
                    <div className="sidebar-user">
                      <span className="sidebar-user-avatar">KM</span>
                      <span className="sidebar-workspace-text"><strong>Kavya Menon</strong><small>Regional Manager · North</small></span>
                    </div>
                  </div>
                </aside>

                {/* Main Operations Area (Contained Smooth Scrolling) */}
                <main
                  ref={mainScrollRef}
                  className="dashboard-main"
                  tabIndex={0}
                  data-lenis-prevent
                  aria-label="Brand growth and telemetry workspace"
                >
                  {/* Top Navigation */}
                  <div className="dashboard-top-nav">
                    <div className="dashboard-heading-group">
                      <div className="dashboard-title-row">
                        <h3 className="dashboard-page-title">Dashboard</h3>
                      </div>
                    </div>

                    <div className="dashboard-top-nav-right">
                      <button
                        type="button"
                        className="dash-btn-primary"
                        style={{ background: '#7C3AED' }}
                        onClick={() => setShowNewCampaignModal(true)}
                      >
                        <span>+</span>
                        <span>New trial campaign</span>
                      </button>
                    </div>
                  </div>
                  {/* Month-to-date brand KPIs */}
                  <div className="dashboard-overview-row dashboard-overview-row--four">
                    <div className="dashboard-stat">
                      <span className="stat-label">Revenue</span>
                      <div className="stat-value">₹14.2L</div>
                      <div className="stat-trend positive"><span>↑ 36% vs Sept</span></div>
                    </div>
                    <div className="dashboard-stat">
                      <span className="stat-label">Orders</span>
                      <div className="stat-value">584</div>
                      <div className="stat-trend"><span>via 4 distributors</span></div>
                    </div>
                    <div className="dashboard-stat">
                      <span className="stat-label">Active cafés</span>
                      <div className="stat-value">142</div>
                      <div className="stat-trend positive"><span>+11 this month</span></div>
                    </div>
                    <div className="dashboard-stat" id="brand-funnel-section">
                      <span className="stat-label">Trial conversion</span>
                      <div className="stat-value" style={{ color: '#6D28D9' }}>50%</div>
                      <div className="stat-trend"><span>25 of 50 cafés ordered</span></div>
                    </div>
                  </div>

                  {/* Clean 2-Column Bento Workspace */}
                  <div className="dashboard-bento">
                    {/* Left: Active Sampling Flights */}
                    <div className="dashboard-card" style={{ padding: '10px 12px' }}>
                      <div className="card-header">
                        <div>
                          <span className="card-title" id="brand-campaigns-table">Trial campaigns</span>
                        </div>
                        <button
                          type="button"
                          className="table-action-btn"
                          style={{ background: '#F5F3FF', color: '#6D28D9', borderColor: '#DDD6FE' }}
                          onClick={() => setShowNewCampaignModal(true)}
                        >
                          + New campaign
                        </button>
                      </div>

                      <div className="simple-flight-list">
                        {campaigns.slice(0, 4).map((c) => (
                          <div
                            key={c.title}
                            className="simple-flight-card"
                            onClick={() => showToast(`Telemetry view opened for ${c.title} (${c.approval})`)}
                          >
                            <div className="simple-card-header">
                              <span className="simple-card-title">{c.title}</span>
                              <span className="status-pill" style={{ background: '#F5F3FF', color: '#6D28D9' }}>
                                <span className="status-dot" style={{ background: '#7C3AED' }} aria-hidden="true" />
                                {c.status}
                              </span>
                            </div>
                            <div className="simple-card-footer">
                              <span style={{ color: '#6D28D9', fontWeight: 600 }}>{c.cafes} · {c.reorderRate} reorder</span>
                              <span style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono, monospace)' }}>{c.revenue}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Barista Scorecard & Wholesale Conversion Engine */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Live consumption, newest first */}
                      <div className="dashboard-card" style={{ padding: '10px 12px' }} id="brand-telemetry-section">
                        <div className="card-header">
                          <span className="card-title">Live consumption</span>
                          <span className="status-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>● {docked ? 11 : 10} today</span>
                        </div>
                        <div className="simple-route-strip">
                          {[
                            ['Tamarind Lane Cafe', 'Hauz Khas · 6 x House Espresso', '₹6,900', true],
                            ['Brewhaus Collective', 'Greater Kailash · 10 x Filter Blend', '₹9,800', false],
                            ['Saffron Steps Cafe', 'Saket · 6 x Filter Blend', '₹5,880', false],
                            ['Juniper Steps Cafe', 'Hauz Khas · 4 x Decaf', '₹4,960', false],
                            ['Ember & Oat', 'Vasant Kunj · 10 x House Espresso', '₹11,200', false],
                            ['Lantern Row Cafe', 'Malviya Nagar · Cold Brew trial', 'Trial', false],
                          ].map(([cafe, line, amt, hot]) => (
                            <div
                              className={`simple-route-row${hot ? ` dock-target${docked ? ' is-docked' : ''}` : ''}`}
                              key={cafe as string}
                              data-dock={hot ? 'brand-live' : undefined}
                              style={hot ? { background: '#F5F3FF', borderRadius: '6px', padding: '3px 5px', margin: '0 -5px' } : undefined}
                            >
                              <span><strong>{cafe}</strong> <span style={{ color: '#64748B' }}>{line}</span></span>
                              <span style={{ color: hot ? '#6D28D9' : '#0F172A', fontWeight: 700 }}>{amt}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Where it sells: Delhi NCR districts */}
                      <div className="dashboard-card" style={{ padding: '10px 12px' }} id="brand-share-section">
                        <div className="card-header">
                          <span className="card-title">Top districts · 7d</span>
                          <span style={{ fontSize: '9.5px', color: '#7C3AED', fontWeight: 700 }}>206 orders</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {[
                            ['South Delhi', 55, '#6D28D9'],
                            ['Gurugram', 36, '#A8A29E'],
                            ['New Delhi', 26, '#A8A29E'],
                            ['Noida', 22, '#A8A29E'],
                            ['Central', 15, '#A8A29E'],
                            ['South West', 13, '#A8A29E'],
                          ].map(([name, n, c]) => (
                            <div key={name as string}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#334155', marginBottom: '2px' }}>
                                <span>{name}</span>
                                <strong>{n}</strong>
                              </div>
                              <div style={{ height: '4px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden' }}>
                                <div style={{ width: `${((n as number) / 55) * 100}%`, height: '100%', background: c as string, borderRadius: '99px' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>                    </div>
                  </div>

                  {/* Accessible New Campaign Modal */}
                  {showNewCampaignModal && (
                    <div className="dash-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-brand-campaign-title">
                      <div className="dash-modal-card">
                        <div className="dash-modal-header">
                          <h4 className="dash-modal-title" id="modal-brand-campaign-title">Deploy Barista Sampling Flight</h4>
                          <button
                            type="button"
                            className="dash-modal-close"
                            onClick={() => setShowNewCampaignModal(false)}
                            aria-label="Close modal"
                          >
                            ✕
                          </button>
                        </div>
                        <form onSubmit={handleCreateCampaign}>
                          <div className="dash-form-row">
                            <label className="dash-form-label" htmlFor="brand-campaign-title">Campaign Title</label>
                            <input
                              type="text"
                              id="brand-campaign-title"
                              className="dash-form-input"
                              placeholder="e.g. Nitro Cold Brew Autumn Launch"
                              value={newCampaignTitle}
                              onChange={(e) => setNewCampaignTitle(e.target.value)}
                              required
                            />
                          </div>
                          <div className="dash-form-row" style={{ marginTop: '8px' }}>
                            <label className="dash-form-label" htmlFor="brand-product-select">Target Product SKU</label>
                            <select
                              className="dash-form-select"
                              id="brand-product-select"
                              value={newCampaignProduct}
                              onChange={(e) => setNewCampaignProduct(e.target.value)}
                            >
                              <option>Hillfold House Espresso</option>
                              <option>Hillfold Filter Blend</option>
                              <option>Cold Brew Coarse</option>
                              <option>Decaf Swiss Water</option>
                            </select>
                          </div>
                          <div className="dash-form-row" style={{ marginTop: '8px' }}>
                            <label className="dash-form-label" htmlFor="brand-metro-select">Target Metro Hub</label>
                            <select
                              className="dash-form-select"
                              id="brand-metro-select"
                              value={newCampaignMetro}
                              onChange={(e) => setNewCampaignMetro(e.target.value as any)}
                            >
                              <option value="Bangalore">Bangalore (148 Specialty Cafés)</option>
                              <option value="Mumbai">Mumbai (98 Specialty Cafés)</option>
                              <option value="Delhi-NCR">Delhi NCR (66 Specialty Cafés)</option>
                            </select>
                          </div>
                          <div className="dash-modal-actions" style={{ marginTop: '12px' }}>
                            <button type="button" className="dash-btn-ghost" onClick={() => setShowNewCampaignModal(false)}>Cancel</button>
                            <button type="submit" className="dash-btn-primary" style={{ background: '#7C3AED' }}>
                              Deploy Sampling Flight
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </main>
              </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
