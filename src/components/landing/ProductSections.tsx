'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, useSpring, useReducedMotion, useMotionValue, interpolate, useMotionValueEvent } from 'framer-motion';
import { MotionTimelineBar, AnimatedCursor, WorkflowNode, AnimatedBezierCable } from './ProductMotionEngine';

/* ─────────────────────────────────────────────────────────────────────────
   GRABBIT B2B SAAS PRODUCT INTERFACES (PHASE 5: IMMERSIVE COLOR FIELDS & PRODUCT REVEALS)
   Linear-inspired restraint · Stripe-style capability · Hyperpure operational context
   Front-Facing Flat Physical Model · Continuous Scroll-Driven Color Transitions
   90% Neutral UI · 10% Controlled Stakeholder Accent
───────────────────────────────────────────────────────────────────────── */

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

  // Dynamic continuous chromatic transition across all chapters:
  // Café Red (#E03527) -> Supplier Green (#16A34A) -> Brand Purple (#6D28D9)
  const interpolateRedToGreen = interpolate([0, 1], ['#E03527', '#16A34A']);
  const interpolateGreenToPurple = interpolate([0, 1], ['#16A34A', '#6D28D9']);

  const productBg = useTransform(
    [smoothSupplierProgress, smoothBrandProgress],
    (values: number[]) => {
      const [sProg, bProg] = values;
      const s = Math.max(0, Math.min(1, sProg));
      const b = Math.max(0, Math.min(1, bProg));
      if (b > 0.01 && s >= 0.85) {
        return interpolateGreenToPurple(b);
      }
      return interpolateRedToGreen(s);
    }
  );

  // Sync the whole background CSS variable across the document
  useMotionValueEvent(productBg, 'change', (latest: string) => {
    if (supplierProgress.get() > 0 || brandProgress.get() > 0) {
      document.documentElement.style.setProperty('--universe-bg', String(latest));
    }
  });

  useEffect(() => {
    if (window.scrollY > 300) {
      document.documentElement.style.setProperty('--universe-bg', String(productBg.get()));
    }
  }, [productBg]);

  // Atmospheric radial fields opacity & subtle slow vertical drift
  // 1. Café Glow (Warm Red): visible as section enters, fades out as Supplier locks in
  const cafeGlowOpacity = useTransform(smoothSupplierProgress, [0.0, 0.5], [1, 0]);
  const cafeGlowY = useTransform(smoothSupplierProgress, [0.0, 1.0], ['0%', '-2%']);

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
      style={{ backgroundColor: productBg }}
    >
      {/* Immersive Atmospheric Color Fields */}
      <div className="universe-atmospheric-layer" aria-hidden="true">
        <motion.div
          className="env-atmospheric-field cafe-field"
          style={{ opacity: cafeGlowOpacity, y: cafeGlowY }}
        />
        <motion.div
          className="env-atmospheric-field supplier-field"
          style={{ opacity: supplierGlowOpacity, y: supplierGlowY }}
        />
        <motion.div
          className="env-atmospheric-field brand-field"
          style={{ opacity: brandGlowOpacity, y: brandGlowY }}
        />
      </div>

      <div ref={supplierRef}>
        <SupplierSection isMobile={isMobile} />
      </div>
      <div ref={brandRef}>
        <BrandSection isMobile={isMobile} />
      </div>
    </motion.div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   SECTION 01: CAFÉ PRODUCT
   Workflow: DISCOVER → ORDER → TRACK → RECEIVE → ANALYZE
═════════════════════════════════════════════════════════════════════════ */
interface CafeOrder {
  id: string;
  supplier: string;
  itemsCount: string;
  amount: string;
  status: 'In transit' | 'Processing' | 'Delivered' | 'Delayed';
  expected: string;
  timeline: {
    time: string;
    label: string;
    sub: string;
    status: 'completed' | 'active' | 'upcoming';
  }[];
}

const CAFE_ORDERS_DATA: CafeOrder[] = [
  {
    id: '#GRB-1048',
    supplier: 'Blue Tokai',
    itemsCount: '8 items',
    amount: '₹4,280',
    status: 'In transit',
    expected: 'Today, 12:05',
    timeline: [
      { time: '09:12', label: 'Order placed', sub: 'Confirmed by Barista', status: 'completed' },
      { time: '09:14', label: 'Supplier confirmed', sub: 'Blue Tokai Roastery', status: 'completed' },
      { time: '09:18', label: 'Packed', sub: 'Batch #BT-992', status: 'completed' },
      { time: '10:42', label: 'In transit', sub: 'Assigned: Express Fleet #4', status: 'active' },
      { time: '12:05', label: 'Expected delivery', sub: 'Estimated arrival in 18m', status: 'upcoming' },
    ],
  },
  {
    id: '#GRB-1047',
    supplier: 'Roastery House',
    itemsCount: '12 items',
    amount: '₹7,840',
    status: 'Processing',
    expected: 'Today, 16:30',
    timeline: [
      { time: '08:45', label: 'Order placed', sub: 'Auto-replenish order', status: 'completed' },
      { time: '09:10', label: 'Supplier confirmed', sub: 'Roastery House Central', status: 'completed' },
      { time: '10:15', label: 'Processing & Roast', sub: 'Medium dark batch', status: 'active' },
      { time: '14:00', label: 'Ready for dispatch', sub: 'Scheduled pickup', status: 'upcoming' },
      { time: '16:30', label: 'Expected delivery', sub: 'Afternoon slot', status: 'upcoming' },
    ],
  },
  {
    id: '#GRB-1046',
    supplier: 'Third Wave',
    itemsCount: '5 items',
    amount: '₹2,150',
    status: 'Delivered',
    expected: 'Yesterday',
    timeline: [
      { time: 'Yesterday 11:00', label: 'Order placed', sub: 'Specialty lot', status: 'completed' },
      { time: 'Yesterday 11:20', label: 'Packed', sub: 'Third Wave Roastery', status: 'completed' },
      { time: 'Yesterday 13:40', label: 'In transit', sub: 'Direct delivery', status: 'completed' },
      { time: 'Yesterday 15:10', label: 'Delivered', sub: 'Signed by Store Lead', status: 'completed' },
    ],
  },
  {
    id: '#GRB-1045',
    supplier: 'KC Roasters',
    itemsCount: '9 items',
    amount: '₹5,620',
    status: 'Delivered',
    expected: 'Yesterday',
    timeline: [
      { time: 'Yesterday 09:30', label: 'Order placed', sub: 'Filter SKUs', status: 'completed' },
      { time: 'Yesterday 10:00', label: 'Packed', sub: 'KC Roasters Bandra', status: 'completed' },
      { time: 'Yesterday 12:15', label: 'In transit', sub: 'Local logistics', status: 'completed' },
      { time: 'Yesterday 14:00', label: 'Delivered', sub: 'Stocked in pantry', status: 'completed' },
    ],
  },
];

function CafeSection({ isMobile }: { isMobile: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center 48%'],
  });

  // Right to Left scroll-driven entrance:
  // As user moves and scrolls down, screen glides from right to left (+220px -> 0) into display
  const rawX = useTransform(scrollYProgress, [0, 1], [isMobile ? 70 : 220, 0]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.25, 0.88], [0, 0.4, 1]);
  const rawScale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);

  const springConfig = { stiffness: 90, damping: 20, mass: 0.35 };
  const cafeX = useSpring(rawX, springConfig);
  const cafeOpacity = useSpring(rawOpacity, springConfig);
  const cafeScale = useSpring(rawScale, springConfig);

  // Desktop 3D Mouse Parallax (Refined ~4.5° Y, 3.5° X tilt with cursor tracking)
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

  const cafeRotateY = useTransform(smoothMouseX, (val) => -4.5 + val);
  const cafeRotateX = useTransform(smoothMouseY, (val) => 3.5 + val);

  // Google-Style Product Motion Workflow Simulation (~9.5s cycle)
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

  const cafeCursorCoords = [
    { x: '78%', y: '155px', label: 'Auto-Replenish' },
    { x: '45%', y: '335px', label: 'PO Confirmed' },
    { x: '82%', y: '295px', label: 'Fleet in Transit' },
  ];

  const [activeFeature, setActiveFeature] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<CafeOrder>(CAFE_ORDERS_DATA[0]);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('All');

  // Handle Escape key for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowNewOrderModal(false);
    };
    if (showNewOrderModal) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNewOrderModal]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredOrders = CAFE_ORDERS_DATA.filter((o) => {
    const matchesSearch = o.supplier.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSupplier = supplierFilter === 'All' || o.supplier.toLowerCase().includes(supplierFilter.toLowerCase());
    return matchesSearch && matchesSupplier;
  });

  return (
    <section
      ref={sectionRef}
      className="product-story-section"
      id="for-cafes"
      role="region"
      aria-label="Café Operations Section"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="product-ambient-glow" aria-hidden="true" />
      <div className="product-story-container">
        <div className="product-grid-cafe">

          {/* Left: Minimal, Typographic Editorial */}
          <motion.div
            className="product-text-column"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="section-eyebrow">FOR CAFÉS</span>
            <h2 className="section-title">
              Everything your café<br />
              needs, in one place.
            </h2>
            <p className="section-description">
              Order supplies, manage inventory, track deliveries and understand your operations from one platform.
            </p>

            <div className="feature-list">
              <div
                className={`feature-item ${activeFeature === 0 ? 'active' : ''}`}
                onClick={() => setActiveFeature(0)}
                onMouseEnter={() => setActiveFeature(0)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveFeature(0);
                  }
                }}
                aria-pressed={activeFeature === 0}
              >
                <span className="feature-num">01</span>
                <div className="feature-content">
                  <span className="feature-heading">Track every order.</span>
                  <span className="feature-text">Compare suppliers and monitor live shipments.</span>
                </div>
              </div>

              <div
                className={`feature-item ${activeFeature === 1 ? 'active' : ''}`}
                onClick={() => setActiveFeature(1)}
                onMouseEnter={() => setActiveFeature(1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveFeature(1);
                  }
                }}
                aria-pressed={activeFeature === 1}
              >
                <span className="feature-num">02</span>
                <div className="feature-content">
                  <span className="feature-heading">Know what&apos;s arriving.</span>
                  <span className="feature-text">Real-time timeline tracking with verified ETAs.</span>
                </div>
              </div>

              <div
                className={`feature-item ${activeFeature === 2 ? 'active' : ''}`}
                onClick={() => setActiveFeature(2)}
                onMouseEnter={() => setActiveFeature(2)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveFeature(2);
                  }
                }}
                aria-pressed={activeFeature === 2}
              >
                <span className="feature-num">03</span>
                <div className="feature-content">
                  <span className="feature-heading">Stay ahead of inventory.</span>
                  <span className="feature-text">Automated replenishment alerts before stock outs.</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Dynamic 3D Tilted Product Interface with Google-Style Motion Workflow */}
          <div className="product-stage">
            <motion.div
              className="product-frame"
              style={{
                x: shouldReduceMotion ? 0 : cafeX,
                opacity: shouldReduceMotion ? 1 : cafeOpacity,
                scale: shouldReduceMotion ? 1 : cafeScale,
                rotateY: shouldReduceMotion || isMobile ? 0 : cafeRotateY,
                rotateX: shouldReduceMotion || isMobile ? 0 : cafeRotateX,
              }}
              onMouseEnter={handleUserInteract}
              onClick={handleUserInteract}
            >
              {/* Google-Style Product Motion Vignette Chrome */}
              <MotionTimelineBar
                currentStep={motionStep}
                totalSteps={3}
                stepLabels={['Stock Alert', 'Instant PO', 'Live Fleet']}
                isPlaying={isMotionPlaying && !isUserInteracting}
                onTogglePlay={() => setIsMotionPlaying(!isMotionPlaying)}
                accentColor="#EAB308"
              />

              <AnimatedCursor
                x={cafeCursorCoords[motionStep].x}
                y={cafeCursorCoords[motionStep].y}
                isClicking={isMotionPlaying && !isUserInteracting}
                label={cafeCursorCoords[motionStep].label}
                accentColor="#EAB308"
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
                  <span>app.gradient365.com/cafe/orders</span>
                </div>
                <div className="browser-actions">
                  <span className="browser-status-tag">Connected</span>
                  <div className="browser-user-badge">
                    <span className="browser-avatar">TC</span>
                    <span>The Corner Café</span>
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
                <aside className="dashboard-sidebar" aria-label="Café Dashboard Navigation">
                  <div>
                    <div className="sidebar-brand-header">
                      <div className="sidebar-grabbit-logo">
                        <span className="grabbit-mark">G</span>
                        <span className="grabbit-name">Gradient</span>
                      </div>
                      <span className="sidebar-org-sub">Café OS</span>
                    </div>

                    <div className="sidebar-nav-section-label">Operations</div>
                    <nav className="sidebar-nav">
                      <button type="button" className="sidebar-item">
                        <SvgIcons.Overview />
                        <span>Overview</span>
                      </button>
                      <button type="button" className="sidebar-item active">
                        <SvgIcons.Orders />
                        <span>Orders</span>
                        <span className="sidebar-badge-count">48</span>
                      </button>
                      <button type="button" className="sidebar-item">
                        <SvgIcons.Inventory />
                        <span>Inventory</span>
                      </button>
                      <button type="button" className="sidebar-item">
                        <SvgIcons.Menu />
                        <span>Menu</span>
                      </button>
                      <button type="button" className="sidebar-item">
                        <SvgIcons.Suppliers />
                        <span>Suppliers</span>
                      </button>
                      <button type="button" className="sidebar-item">
                        <SvgIcons.Payments />
                        <span>Payments</span>
                      </button>
                      <button type="button" className="sidebar-item">
                        <SvgIcons.Analytics />
                        <span>Analytics</span>
                      </button>
                    </nav>
                  </div>

                  <div className="sidebar-footer">
                    <button type="button" className="sidebar-item">
                      <SvgIcons.Help />
                      <span>Help</span>
                    </button>
                    <button type="button" className="sidebar-item">
                      <SvgIcons.Settings />
                      <span>Settings</span>
                    </button>
                    <div className="sidebar-pill-status">
                      <span className="status-dot-pulse" aria-hidden="true" />
                      <span>Live Sync · 3s</span>
                    </div>
                  </div>
                </aside>

                {/* Main Operations Area */}
                <main className={`dashboard-main ${activeFeature !== null ? 'has-active-feature' : ''}`}>
                  {/* Top Navigation */}
                  <div className="dashboard-top-nav">
                    <div className="dashboard-heading-group">
                      <div className="dashboard-title-row">
                        <h3 className="dashboard-page-title">Orders</h3>
                        <span className="dash-date-indicator">Today · 27 Sep 2026</span>
                      </div>
                      <span className="dashboard-page-subtitle">Manage café purchasing and incoming deliveries</span>
                    </div>

                    <div className="dashboard-top-nav-right">
                      <button type="button" className="dash-icon-btn" title="Search Orders" aria-label="Search Orders">
                        <SvgIcons.Search />
                      </button>
                      <button type="button" className="dash-icon-btn" title="Notifications" aria-label="Notifications (1 unread)">
                        <SvgIcons.Bell />
                        <span className="dash-notif-dot" />
                      </button>
                      <button
                        type="button"
                        className="dash-btn-primary"
                        onClick={() => setShowNewOrderModal(true)}
                      >
                        <span>+</span>
                        <span>New Order</span>
                      </button>
                    </div>
                  </div>

                  {/* Overview Metrics (Cards 01, 02, 03) */}
                  <div className="dashboard-overview-row">
                    <div className="dashboard-stat">
                      <span className="stat-label">Orders today</span>
                      <div className="stat-value">
                        <AnimatedCounter value={48} />
                      </div>
                      <div className="stat-trend positive">
                        <span>↑ 12.4%</span>
                        <span className="stat-context">vs yesterday</span>
                      </div>
                    </div>

                    <div className="dashboard-stat">
                      <span className="stat-label">Pending orders</span>
                      <div className="stat-value">
                        <AnimatedCounter value={6} />
                      </div>
                      <div className="stat-trend warning">
                        <span>● 3 arriving today</span>
                        <span className="stat-context">on schedule</span>
                      </div>
                    </div>

                    <div className="dashboard-stat">
                      <span className="stat-label">Monthly spend</span>
                      <div className="stat-value">
                        <AnimatedCounter value={12.4} prefix="₹" suffix="K" decimals={1} />
                      </div>
                      <div className="stat-trend positive">
                        <span>↑ 8.2%</span>
                        <span className="stat-context">vs last month</span>
                      </div>
                    </div>
                  </div>

                  {/* Attio-Style Workflow Automation Showcase */}
                  <div className="dash-workflow-showcase dash-dot-grid">
                    <WorkflowNode
                      title="⚡ Auto-Restock Trigger"
                      subtitle="Rule: Oat Milk inventory < 12 units"
                      badgeText="Automated Sequence"
                      accentColor="#E03527"
                    />
                    <AnimatedBezierCable
                      startX={190}
                      startY={25}
                      endX={340}
                      endY={25}
                      accentColor="#E03527"
                    />
                    <div className="workflow-target-card">
                      <div
                        className="workflow-target-badge"
                        style={{
                          color: motionStep === 0 ? '#B91C1C' : '#15803D',
                          background: motionStep === 0 ? '#FEE2E2' : '#DCFCE7',
                          borderColor: motionStep === 0 ? '#FECACA' : '#BBF7D0',
                        }}
                      >
                        <span className="motion-live-dot" style={{ background: motionStep === 0 ? '#E03527' : '#16A34A' }} />
                        <span>
                          {motionStep === 0
                            ? 'Trigger Fired: Reorder 16 cs'
                            : motionStep === 1
                            ? 'PO #GRB-1048 Issued'
                            : 'Express Fleet #4 En Route'}
                        </span>
                      </div>
                      <span className="workflow-target-time">
                        {motionStep === 0
                          ? 'Threshold reached at 09:15'
                          : motionStep === 1
                          ? 'Supplier Confirmed (0.4s)'
                          : 'ETA 18 min · Live GPS Active'}
                      </span>
                    </div>
                  </div>

                  {/* Order Control Bar */}
                  <div className="dashboard-controls-bar">
                    <div className="dash-search-box">
                      <SvgIcons.Search />
                      <input
                        type="text"
                        placeholder="Search orders, suppliers..."
                        className="dash-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Filter orders by supplier or ID"
                      />
                    </div>

                    <div className="dash-filter-group">
                      <button
                        type="button"
                        className="dash-filter-pill"
                        onClick={() => setSupplierFilter(supplierFilter === 'All' ? 'Blue' : 'All')}
                      >
                        <span>Supplier: {supplierFilter}</span>
                      </button>
                      <span className="dash-filter-pill">Date: Today</span>
                      <span className="dash-filter-pill">Status: All</span>
                    </div>
                  </div>

                  {/* Bento Arrangement: Left Table + Bottom Modules | Right Live Timeline */}
                  <div className="dashboard-bento">
                    {/* Left Column: Orders Table & Supporting Modules */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className={`dashboard-card ${activeFeature === 0 ? 'highlight-active-cafe' : ''}`} style={{ padding: '10px 12px' }}>
                        <div className="card-header">
                          <span className="card-title">Recent Purchases</span>
                          <span className="card-subtitle">Click row to inspect live fulfillment</span>
                        </div>

                        <div className="dashboard-table-container">
                          <table className="dashboard-table" role="table" aria-label="Café recent orders">
                            <thead>
                              <tr>
                                <th scope="col">Supplier</th>
                                <th scope="col">Order</th>
                                <th scope="col">Items</th>
                                <th scope="col">Amount</th>
                                <th scope="col">Status</th>
                                <th scope="col">Expected</th>
                                <th scope="col" style={{ textAlign: 'right' }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredOrders.map((o) => (
                                <tr
                                  key={o.id}
                                  className={`dashboard-table-row ${selectedOrder.id === o.id ? 'selected' : ''}`}
                                  onClick={() => setSelectedOrder(o)}
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setSelectedOrder(o);
                                    }
                                  }}
                                  role="button"
                                  aria-pressed={selectedOrder.id === o.id}
                                  aria-label={`Select order ${o.id} from ${o.supplier}`}
                                >
                                  <td className="table-cell-bold">{o.supplier}</td>
                                  <td className="table-cell-sub">{o.id}</td>
                                  <td>{o.itemsCount}</td>
                                  <td className="table-cell-num">{o.amount}</td>
                                  <td>
                                    <span className={`status-pill status-${o.status === 'In transit' ? 'transit' : o.status === 'Processing' ? 'processing' : 'delivered'}`}>
                                      <span className="status-dot" aria-hidden="true" />
                                      {o.status}
                                    </span>
                                  </td>
                                  <td className="table-cell-sub">{o.expected}</td>
                                  <td style={{ textAlign: 'right' }}>
                                    <span className="table-action-arrow" aria-hidden="true">
                                      <SvgIcons.ArrowRight />
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Supporting Micro-Bento: Inventory Health + Spending Module */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {/* Inventory Module */}
                        <div className={`dashboard-card ${activeFeature === 2 ? 'highlight-active-cafe' : ''}`}>
                          <div className="card-header">
                            <span className="card-title">Inventory health</span>
                            <span className="card-subtitle">Bar items</span>
                          </div>
                          <div className="inventory-list">
                            <div className="inventory-row">
                              <div className="inventory-row-header">
                                <span className="inventory-item-name">Arabica Beans</span>
                                <span style={{ color: '#166534', fontWeight: 600 }}>82%</span>
                              </div>
                              <div className="inventory-bar-bg">
                                <div className="inventory-bar-fill" style={{ width: '82%' }} />
                              </div>
                            </div>

                            <div className="inventory-row">
                              <div className="inventory-row-header">
                                <span className="inventory-item-name">Oat Milk</span>
                                <span style={{ color: '#166534', fontWeight: 600 }}>64%</span>
                              </div>
                              <div className="inventory-bar-bg">
                                <div className="inventory-bar-fill" style={{ width: '64%' }} />
                              </div>
                            </div>

                            <div className="inventory-row">
                              <div className="inventory-row-header">
                                <span className="inventory-item-name">Takeaway Cups</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ color: '#B91C1C', fontWeight: 700, fontSize: '9.5px' }}>43% Low</span>
                                  <button
                                    type="button"
                                    className="btn-reorder-micro"
                                    onClick={() => showToast('Reorder PO queued for Takeaway Cups (1,000 pk)')}
                                  >
                                    Reorder
                                  </button>
                                </div>
                              </div>
                              <div className="inventory-bar-bg">
                                <div className="inventory-bar-fill warning" style={{ width: '43%' }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Monthly Spending Module with Interactive Tooltips */}
                        <div className={`dashboard-card ${activeFeature === 2 ? 'highlight-active-cafe' : ''}`}>
                          <div className="card-header">
                            <span className="card-title">Monthly spend</span>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#171717' }}>₹12.4K</span>
                          </div>
                          <div className="spend-chart-container">
                            <div className="spend-chart-bars">
                              <div className="spend-col" tabIndex={0}>
                                <div className="chart-tooltip">May: ₹5.6K</div>
                                <div className="spend-bar" style={{ height: '45%' }} />
                                <span className="spend-col-label">May</span>
                              </div>
                              <div className="spend-col" tabIndex={0}>
                                <div className="chart-tooltip">Jun: ₹7.8K</div>
                                <div className="spend-bar" style={{ height: '62%' }} />
                                <span className="spend-col-label">Jun</span>
                              </div>
                              <div className="spend-col" tabIndex={0}>
                                <div className="chart-tooltip">Jul: ₹9.8K</div>
                                <div className="spend-bar" style={{ height: '78%' }} />
                                <span className="spend-col-label">Jul</span>
                              </div>
                              <div className="spend-col" tabIndex={0}>
                                <div className="chart-tooltip">Aug: ₹8.9K</div>
                                <div className="spend-bar" style={{ height: '70%' }} />
                                <span className="spend-col-label">Aug</span>
                              </div>
                              <div className="spend-col" tabIndex={0}>
                                <div className="chart-tooltip">Sep: ₹12.4K (Target)</div>
                                <div className="spend-bar active" style={{ height: '94%' }} />
                                <span className="spend-col-label">Sep</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#737373', marginTop: '2px' }}>
                              <span>+8.2% vs last month</span>
                              <span style={{ fontWeight: 600, color: '#166534' }}>On Budget</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Live Operational Timeline & Order Detail */}
                    <div className={`dashboard-card order-detail-card timeline-card ${activeFeature === 1 ? 'highlight-active-cafe' : ''}`}>
                      <div className="order-detail-header">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span className="order-detail-id">{selectedOrder.id}</span>
                          <span className={`status-pill status-${selectedOrder.status === 'In transit' ? 'transit' : selectedOrder.status === 'Processing' ? 'processing' : 'delivered'}`}>
                            <span className="status-dot" aria-hidden="true" />
                            {selectedOrder.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="order-detail-supplier">{selectedOrder.supplier}</div>
                        <div className="order-detail-meta">
                          <span>{selectedOrder.itemsCount}</span>
                          <span style={{ fontWeight: 700, color: '#171717' }}>{selectedOrder.amount}</span>
                        </div>
                      </div>

                      {/* Live Timeline with pulsing node */}
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Operational Timeline
                      </div>

                      <div className="timeline-vertical">
                        <div className="timeline-v-line" />
                        <div
                          className="timeline-v-line-progress"
                          style={{
                            height: selectedOrder.status === 'Delivered' ? '100%' : selectedOrder.status === 'In transit' ? '74%' : '48%',
                          }}
                        />

                        {selectedOrder.timeline.map((step, idx) => (
                          <div key={idx} className={`timeline-v-item ${step.status}`}>
                            <div className="timeline-v-node" aria-hidden="true" />
                            <div className="timeline-v-content">
                              <span className="timeline-v-label">{step.label}</span>
                              <span className="timeline-v-sub">{step.sub}</span>
                            </div>
                            <span className="timeline-v-time">{step.time}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(23, 23, 23, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#737373' }}>
                        <span>ETA: {selectedOrder.expected}</span>
                        <button
                          type="button"
                          style={{ background: 'transparent', border: 'none', color: '#854D0E', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                          onClick={() => showToast(`Invoice #${selectedOrder.id} downloaded.`)}
                        >
                          View Invoice →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Accessible Quick Add Order Modal */}
                  {showNewOrderModal && (
                    <div className="dash-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-cafe-order-title">
                      <div className="dash-modal-card">
                        <div className="dash-modal-header">
                          <h4 className="dash-modal-title" id="modal-cafe-order-title">New Café Purchase Order</h4>
                          <button
                            type="button"
                            className="dash-modal-close"
                            onClick={() => setShowNewOrderModal(false)}
                            aria-label="Close modal"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="dash-form-row">
                          <label className="dash-form-label" htmlFor="cafe-supplier-select">Select Verified Supplier</label>
                          <select className="dash-form-select" id="cafe-supplier-select">
                            <option>Blue Tokai Roastery</option>
                            <option>Roastery House</option>
                            <option>Third Wave Coffee</option>
                            <option>KC Roasters</option>
                          </select>
                        </div>
                        <div className="dash-form-row">
                          <label className="dash-form-label" htmlFor="cafe-sku-input">Primary SKU & Quantity</label>
                          <input type="text" id="cafe-sku-input" className="dash-form-input" defaultValue="Attikan Estate Blend · 10 kg" />
                        </div>
                        <div className="dash-form-row">
                          <label className="dash-form-label" htmlFor="cafe-slot-input">Delivery Slot</label>
                          <input type="text" id="cafe-slot-input" className="dash-form-input" defaultValue="Today, Morning 09:00 - 12:00" />
                        </div>
                        <div className="dash-modal-actions">
                          <button type="button" className="dash-btn-ghost" onClick={() => setShowNewOrderModal(false)}>Cancel</button>
                          <button
                            type="button"
                            className="dash-btn-primary"
                            onClick={() => {
                              setShowNewOrderModal(false);
                              showToast('PO #GRB-1049 dispatched to Blue Tokai Roastery');
                            }}
                          >
                            Dispatch PO
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </main>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
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
    id: 'PO-GRD-1048',
    cafe: 'Third Wave Coffee',
    location: 'Indiranagar 12th Main',
    rawText: '"Need 40kg Arabica medium roast + 15L Barista Oat tomorrow 7 AM"',
    parsedSummary: '40kg Arabica (Medium) + 15L Barista Oat',
    amount: '₹34,200',
    status: 'In Van #1',
    time: '12m ago',
  },
  {
    id: 'PO-GRD-1043',
    cafe: 'Blue Tokai Roasters',
    location: 'Koramangala 4th Block',
    rawText: '"Repeat regular weekly order 25kg house blend + 500 kraft cups"',
    parsedSummary: '25kg House Blend + 500 Ripple Cups',
    amount: '₹19,800',
    status: 'Picked',
    time: '34m ago',
  },
  {
    id: 'PO-GRD-1038',
    cafe: 'Araku Specialty Store',
    location: 'Lavelle Road',
    rawText: '"Add 10 btls Madagascar Vanilla syrup to our morning run please"',
    parsedSummary: '10 btls Madagascar Vanilla Syrup (750ml)',
    amount: '₹5,400',
    status: 'Scheduled',
    time: '1h ago',
  },
];

function SupplierSection({ isMobile }: { isMobile: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
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
    { x: '52%', y: '160px', label: 'Parse WhatsApp PO' },
    { x: '42%', y: '335px', label: 'Auto Batch Allocated' },
    { x: '75%', y: '315px', label: 'Dispatch Morning Fleet' },
  ];

  // Interactive UI State
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTab, setActiveTab] = useState<'catalog' | 'whatsapp' | 'routes' | 'settlement'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [products, setProducts] = useState<SupplierProduct[]>(INITIAL_SUPPLIER_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<SupplierProduct>(INITIAL_SUPPLIER_PRODUCTS[0]);
  const [whatsappPOs, setWhatsappPOs] = useState<WhatsAppPO[]>(INITIAL_WHATSAPP_POS);
  const [selectedVan, setSelectedVan] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Specialty Coffee');
  const [newProductPrice, setNewProductPrice] = useState('₹820/kg');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Contained wheel scrolling: allows mouse wheel over dashboard to smoothly scroll the inner container without scrolling the landing page
  useEffect(() => {
    const el = mainScrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const canScrollDown = e.deltaY > 0 && scrollTop + clientHeight < scrollHeight - 1;
      const canScrollUp = e.deltaY < 0 && scrollTop > 1;

      if (canScrollDown || canScrollUp) {
        e.preventDefault();
        e.stopPropagation();
        el.scrollTop += e.deltaY;
        setHasScrolled(true);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

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
      id: `PO-GRD-${Math.floor(1050 + Math.random() * 50)}`,
      cafe: 'Subko Specialty Roastery',
      location: 'Bandra West, Mumbai',
      rawText: '"Urgent: Send 20kg Arabica Medium + 10L Barista Oat for tomorrow rush"',
      parsedSummary: '20kg Arabica (Medium) + 10L Barista Oat',
      amount: '₹19,200',
      status: 'Picked',
      time: 'Just now',
    };
    setWhatsappPOs((prev) => [newPO, ...prev]);
    showToast('⚡ WhatsApp order from Subko parsed: PO #GRD-1051 created (₹19,200)');
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
              {/* Google-Style Product Motion Vignette Chrome */}
              <MotionTimelineBar
                currentStep={motionStep}
                totalSteps={3}
                stepLabels={['WhatsApp Ingest', 'Batch Allocation', 'Route Dispatch']}
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
                  <span>app.gradient365.com/supplier/wholesale</span>
                </div>
                <div className="browser-actions">
                  <span className="browser-status-tag" style={{ background: '#ECFDF5', color: '#047857', borderColor: '#A7F3D0' }}>Wholesale Live · BLR Hub</span>
                  <div className="browser-user-badge">
                    <span className="browser-avatar" style={{ background: '#064E3B' }}>RS</span>
                    <span>RoastSupply & Dairy Co.</span>
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
                <aside className="dashboard-sidebar" aria-label="Supplier Dashboard Navigation">
                  <div>
                    <div className="sidebar-brand-header">
                      <div className="sidebar-grabbit-logo">
                        <span className="grabbit-mark" style={{ background: '#064E3B' }}>G</span>
                        <span className="grabbit-name">Gradient</span>
                      </div>
                      <span className="sidebar-org-sub">Supplier OS</span>
                    </div>

                    <div className="sidebar-nav-section-label">Inventory & Trade</div>
                    <nav className="sidebar-nav">
                      <button
                        type="button"
                        className={`sidebar-item ${activeTab === 'catalog' ? 'active' : ''}`}
                        onClick={() => scrollToAnchor('sup-catalog-table', 'catalog')}
                      >
                        <SvgIcons.Inventory />
                        <span>Catalog & Stock</span>
                        <span className="sidebar-badge-count">{products.length}</span>
                      </button>
                      <button
                        type="button"
                        className={`sidebar-item ${activeTab === 'whatsapp' ? 'active' : ''}`}
                        onClick={() => scrollToAnchor('sup-whatsapp-section', 'whatsapp')}
                      >
                        <SvgIcons.Orders />
                        <span>WhatsApp POs</span>
                        <span className="sidebar-badge-count" style={{ background: '#DCFCE7', color: '#166534' }}>34</span>
                      </button>
                      <button
                        type="button"
                        className={`sidebar-item ${activeTab === 'routes' ? 'active' : ''}`}
                        onClick={() => scrollToAnchor('sup-route-section', 'routes')}
                      >
                        <SvgIcons.Deliveries />
                        <span>Van Routes</span>
                        <span className="sidebar-badge-count">3</span>
                      </button>
                      <button
                        type="button"
                        className={`sidebar-item ${activeTab === 'settlement' ? 'active' : ''}`}
                        onClick={() => scrollToAnchor('sup-settlement-section', 'settlement')}
                      >
                        <SvgIcons.Payments />
                        <span>T+1 Ledger</span>
                      </button>
                      <button
                        type="button"
                        className="sidebar-item"
                        onClick={() => showToast('Full distributor GMV analytics opened')}
                      >
                        <SvgIcons.Analytics />
                        <span>Analytics</span>
                      </button>
                    </nav>
                  </div>

                  <div className="sidebar-footer">
                    <button type="button" className="sidebar-item" onClick={() => showToast('Supplier documentation & route guide')}>
                      <SvgIcons.Help />
                      <span>Help</span>
                    </button>
                    <button type="button" className="sidebar-item" onClick={() => showToast('Warehouse settings & pricing rules')}>
                      <SvgIcons.Settings />
                      <span>Settings</span>
                    </button>
                    <div className="sidebar-pill-status">
                      <span className="status-dot-pulse" aria-hidden="true" />
                      <span>SLA 99.4% · Active</span>
                    </div>
                  </div>
                </aside>

                {/* Main Operations Area (Contained Smooth Scrolling) */}
                <main
                  ref={mainScrollRef}
                  className={`dashboard-main ${activeFeature !== null ? 'has-active-feature' : ''}`}
                  onScroll={() => setHasScrolled(true)}
                  tabIndex={0}
                  aria-label="Scrollable supplier operational workspace"
                >
                  {/* Floating Scroll Prompt */}
                  <div className={`dash-scroll-prompt ${hasScrolled ? 'faded' : ''}`}>
                    ↕ Scroll down to view dispatch &amp; settlements
                  </div>

                  {/* Top Navigation */}
                  <div className="dashboard-top-nav">
                    <div className="dashboard-heading-group">
                      <div className="dashboard-title-row">
                        <h3 className="dashboard-page-title">Wholesale Operations</h3>
                        <span className="dash-date-indicator">Today · 27 Sep 2026</span>
                      </div>
                      <span className="dashboard-page-subtitle">Aggregated café demand, route dispatch, and automated T+1 settlements</span>
                    </div>

                    <div className="dashboard-top-nav-right">
                      <button
                        type="button"
                        className="dash-icon-btn"
                        title="Search Catalogue"
                        aria-label="Search Catalogue"
                        onClick={() => showToast('Search focused. Type below to filter SKUs.')}
                      >
                        <SvgIcons.Search />
                      </button>
                      <button
                        type="button"
                        className="dash-icon-btn"
                        title="Notifications"
                        aria-label="Notifications"
                        onClick={() => showToast('34 WhatsApp orders processed for tomorrow morning')}
                      >
                        <SvgIcons.Bell />
                        <span className="dash-notif-dot" />
                      </button>
                      <button
                        type="button"
                        className="dash-btn-primary"
                        onClick={() => setShowAddProductModal(true)}
                      >
                        <span>+</span>
                        <span>Add SKU</span>
                      </button>
                    </div>
                  </div>

                  {/* Moat View Navigation Tabs */}
                  <div className="dash-view-tabs" role="tablist" aria-label="Operational views">
                    <button
                      type="button"
                      className={`dash-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('sup-catalog-table', 'catalog')}
                    >
                      📦 Catalog &amp; Par ({products.length})
                    </button>
                    <button
                      type="button"
                      className={`dash-tab-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('sup-whatsapp-section', 'whatsapp')}
                    >
                      ⚡ WhatsApp POs ({whatsappPOs.length})
                    </button>
                    <button
                      type="button"
                      className={`dash-tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('sup-route-section', 'routes')}
                    >
                      🚚 Morning Dispatch (3 Vans)
                    </button>
                    <button
                      type="button"
                      className={`dash-tab-btn ${activeTab === 'settlement' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('sup-settlement-section', 'settlement')}
                    >
                      💳 T+1 Payout (₹1.84L)
                    </button>
                  </div>

                  {/* Supplier Moat Metrics Row */}
                  <div className={`dashboard-overview-row ${activeFeature === 1 ? 'highlight-active-supplier' : ''}`}>
                    <div
                      className="dashboard-stat"
                      style={{ cursor: 'pointer' }}
                      onClick={() => scrollToAnchor('sup-whatsapp-section', 'whatsapp')}
                      title="Click to view aggregated orders"
                    >
                      <span className="stat-label">Orders Today (34 Cafés)</span>
                      <div className="stat-value">
                        <AnimatedCounter value={34} />
                      </div>
                      <div className="stat-trend positive">
                        <span>↑ 18.4% volume</span>
                        <span className="stat-context">₹1.84L GMV</span>
                      </div>
                    </div>

                    <div
                      className="dashboard-stat"
                      style={{ cursor: 'pointer' }}
                      onClick={() => scrollToAnchor('sup-settlement-section', 'settlement')}
                      title="Click to view T+1 settlement ledger"
                    >
                      <span className="stat-label">T+1 Bank Settlement</span>
                      <div className="stat-value" style={{ color: '#15803D' }}>
                        <span>₹1.84L</span>
                      </div>
                      <div className="stat-trend positive">
                        <span>● Settled HDFC</span>
                        <span className="stat-context">Zero bad debt</span>
                      </div>
                    </div>

                    <div
                      className="dashboard-stat"
                      style={{ cursor: 'pointer' }}
                      onClick={() => scrollToAnchor('sup-catalog-table', 'catalog')}
                      title="Click to view inventory health"
                    >
                      <span className="stat-label">Par Telemetry</span>
                      <div className="stat-value">
                        <AnimatedCounter value={121} />
                        <span style={{ fontSize: '12px', color: '#737373', fontWeight: 500 }}>/ 130 SKUs</span>
                      </div>
                      <div className="stat-trend warning">
                        <span>● 7 Low stock</span>
                        <span className="stat-context">auto-par reorder</span>
                      </div>
                    </div>
                  </div>

                  {/* Attio-Style Workflow Automation Showcase */}
                  <div className="dash-workflow-showcase dash-dot-grid">
                    <WorkflowNode
                      title="⚙️ Autonomous Batch Allocator"
                      subtitle="Wholesale Order Auto-Batching"
                      badgeText="Smart Allocation"
                      accentColor="#22C55E"
                    />
                    <AnimatedBezierCable
                      startX={190}
                      startY={25}
                      endX={340}
                      endY={25}
                      accentColor="#22C55E"
                    />
                    <div className="workflow-target-card">
                      <div
                        className="workflow-target-badge"
                        style={{
                          color: '#15803D',
                          background: '#DCFCE7',
                          borderColor: '#BBF7D0',
                        }}
                      >
                        <span className="motion-live-dot" style={{ background: '#22C55E' }} />
                        <span>
                          {motionStep === 0
                            ? 'Incoming WhatsApp PO: Third Wave (₹34,200)'
                            : motionStep === 1
                            ? 'Pallet Stock Reserved (Batch #ROAST-402)'
                            : 'Van #1 Indiranagar Loop Dispatched'}
                        </span>
                      </div>
                      <span className="workflow-target-time">
                        {motionStep === 0
                          ? 'Auto-parsed in 3s · No manual typing'
                          : motionStep === 1
                          ? 'Par level deducted: 82kg remaining'
                          : '14 Café drops queued before 7:30 AM'}
                      </span>
                    </div>
                  </div>

                  {/* Control Bar: Search & Category Filter Pills */}
                  <div className="dashboard-controls-bar" id="sup-catalog-table">
                    <div className="dash-search-box">
                      <SvgIcons.Search />
                      <input
                        type="text"
                        placeholder="Filter by SKU or category..."
                        className="dash-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Filter products or SKUs"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '10px' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Clickable Category Pills */}
                    <div className="dash-filter-group" role="radiogroup" aria-label="Category filters">
                      {['All', 'Specialty Coffee', 'Plant & Dairy', 'Packaging', 'Syrups & Bases'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`dash-filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Asymmetrical Bento: Products Table + Inventory Health / Weekly Demand */}
                  <div className="dashboard-bento">
                    {/* Left: Products Table with Clickable Rows */}
                    <div className={`dashboard-card ${activeFeature === 0 ? 'highlight-active-supplier' : ''}`} style={{ padding: '10px 12px' }}>
                      <div className="card-header">
                        <div>
                          <span className="card-title">Live Wholesale Catalog</span>
                          <span className="card-subtitle">Showing {filteredProducts.length} verified cafe wholesale lines</span>
                        </div>
                        <span className="status-pill status-available">
                          <span className="status-dot" aria-hidden="true" />
                          Interactive Catalog
                        </span>
                      </div>

                      <div className="dashboard-table-container">
                        <table className="dashboard-table" role="table" aria-label="Supplier wholesale catalog">
                          <thead>
                            <tr>
                              <th scope="col">Product SKU</th>
                              <th scope="col">Category</th>
                              <th scope="col">Price</th>
                              <th scope="col">Stock</th>
                              <th scope="col">Orders</th>
                              <th scope="col">Status</th>
                              <th scope="col" style={{ textAlign: 'right' }}>Select</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map((p) => {
                              const isSelected = selectedProduct.name === p.name;
                              return (
                                <tr
                                  key={p.name}
                                  className={`dashboard-table-row ${isSelected ? 'selected' : ''}`}
                                  onClick={() => setSelectedProduct(p)}
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setSelectedProduct(p);
                                    }
                                  }}
                                  role="button"
                                  aria-pressed={isSelected}
                                  aria-label={`Select product ${p.name}`}
                                >
                                  <td className="table-cell-bold">
                                    <div>{p.name}</div>
                                    <div style={{ fontSize: '9px', color: '#888', fontWeight: 400 }}>{p.batch}</div>
                                  </td>
                                  <td className="table-cell-sub">{p.category}</td>
                                  <td className="table-cell-num">{p.price}</td>
                                  <td>
                                    <span style={{ fontWeight: 600 }}>{p.stock}</span>
                                    <span style={{ fontSize: '9px', color: '#999', marginLeft: '4px' }}>/ par {p.par}</span>
                                  </td>
                                  <td className="table-cell-num">{p.orders}</td>
                                  <td>
                                    <span className={`status-pill status-${p.status === 'Available' ? 'available' : 'low'}`}>
                                      <span className="status-dot" aria-hidden="true" />
                                      {p.status}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <span className="table-action-arrow" aria-hidden="true">
                                      <SvgIcons.ArrowRight />
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Selected SKU Action Strip */}
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(23, 23, 23, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#171717' }}>Selected: {selectedProduct.name}</span>
                          <div style={{ fontSize: '9.5px', color: '#737373' }}>{selectedProduct.batch} · {selectedProduct.orders} café orders in queue</div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="dash-tab-btn"
                            style={{ background: '#DCFCE7', color: '#166534', borderColor: '#BBF7D0' }}
                            onClick={handleAllocateBatch}
                          >
                            + Allocate Batch (+10kg)
                          </button>
                          <button
                            type="button"
                            className="dash-tab-btn"
                            onClick={() => showToast(`e-POD route manifest generated for ${selectedProduct.name}`)}
                          >
                            Print ePOD Slip
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Supporting Modules (Inventory Distribution & Weekly Analytics) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Inventory Health Module */}
                      <div className="dashboard-card">
                        <div className="card-header">
                          <span className="card-title">Inventory Health</span>
                          <span className="card-subtitle">130 Total SKUs</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', marginBottom: '6px' }}>
                          <span style={{ color: '#166534', fontWeight: 600 }}>Safe Par: 121</span>
                          <span style={{ color: '#D97706', fontWeight: 600 }}>Low: 7</span>
                          <span style={{ color: '#B91C1C', fontWeight: 600 }}>Critical: 2</span>
                        </div>
                        <div style={{ width: '100%', height: '5px', borderRadius: '9999px', background: '#F3F4F6', display: 'flex', overflow: 'hidden' }}>
                          <div style={{ width: '88%', background: '#22C55E' }} title="Healthy: 121" />
                          <div style={{ width: '9%', background: '#F59E0B' }} title="Low Stock: 7" />
                          <div style={{ width: '3%', background: '#EF4444' }} title="Out of Stock: 2" />
                        </div>
                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#737373' }}>
                          <span>Top: <strong>Arabica Beans</strong> (+24%)</span>
                          <span>Low: <strong>Matcha</strong> (4 kg)</span>
                        </div>
                      </div>

                      {/* Orders by Week Analytics with Tooltips */}
                      <div className="dashboard-card">
                        <div className="card-header">
                          <span className="card-title">Weekly Café Reorders</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534' }}>+18.4% Vol</span>
                        </div>
                        <div className="spend-chart-container">
                          <div className="spend-chart-bars">
                            <div className="spend-col" tabIndex={0} onClick={() => showToast('Week 1: 18 café reorders (₹98K GMV)')}>
                              <div className="chart-tooltip">W1: 18 orders</div>
                              <div className="spend-bar" style={{ height: '48%' }} />
                              <span className="spend-col-label">W1</span>
                            </div>
                            <div className="spend-col" tabIndex={0} onClick={() => showToast('Week 2: 24 café reorders (₹1.32L GMV)')}>
                              <div className="chart-tooltip">W2: 24 orders</div>
                              <div className="spend-bar" style={{ height: '64%' }} />
                              <span className="spend-col-label">W2</span>
                            </div>
                            <div className="spend-col" tabIndex={0} onClick={() => showToast('Week 3: 29 café reorders (₹1.61L GMV)')}>
                              <div className="chart-tooltip">W3: 29 orders</div>
                              <div className="spend-bar" style={{ height: '82%' }} />
                              <span className="spend-col-label">W3</span>
                            </div>
                            <div className="spend-col" tabIndex={0} onClick={() => showToast('Week 4: 34 café reorders (₹1.84L GMV)')}>
                              <div className="chart-tooltip">W4: 34 orders (+18.4%)</div>
                              <div className="spend-bar active" style={{ height: '96%' }} />
                              <span className="spend-col-label">W4</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── SCROLL DOWN MOAT SECTION 1: WhatsApp Ingest Feed ── */}
                  <div className="dash-moat-section" id="sup-whatsapp-section">
                    <div className="dash-section-header">
                      <div className="dash-section-title">
                        <span>⚡ WhatsApp PO Ingest Engine</span>
                        <span className="dash-section-badge" style={{ background: '#DCFCE7', color: '#15803D' }}>Zero Retyping</span>
                      </div>
                      <button
                        type="button"
                        className="dash-tab-btn"
                        style={{ background: '#22C55E', color: '#FFFFFF', borderColor: '#16A34A' }}
                        onClick={handleSimulateWhatsAppPO}
                      >
                        + Simulate Incoming WhatsApp PO
                      </button>
                    </div>
                    <span style={{ fontSize: '10px', color: '#737373' }}>
                      Gradient AI automatically converts unorganized WhatsApp messages & voice notes from café baristas into verified purchase orders.
                    </span>

                    <div className="whatsapp-po-stream">
                      {whatsappPOs.map((po) => (
                        <div key={po.id} className="whatsapp-po-card" tabIndex={0} onClick={() => showToast(`Opening order audit thread for ${po.cafe}`)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="whatsapp-tag">WA Auto</span>
                            <div>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: '#171717' }}>
                                {po.cafe} <span style={{ fontWeight: 400, color: '#737373', fontSize: '9.5px' }}>· {po.location}</span>
                              </div>
                              <div style={{ fontSize: '9.5px', color: '#525252', fontStyle: 'italic' }}>{po.rawText}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534' }}>{po.amount}</div>
                            <div style={{ fontSize: '9px', color: '#888' }}>{po.status} · {po.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── SCROLL DOWN MOAT SECTION 2: Morning Van Route Optimization ── */}
                  <div className="dash-moat-section" id="sup-route-section">
                    <div className="dash-section-header">
                      <div className="dash-section-title">
                        <span>🚚 Morning Fleet Route Dispatch</span>
                        <span className="dash-section-badge" style={{ background: '#E0F2FE', color: '#0369A1' }}>3 Vans Active</span>
                      </div>
                      <span style={{ fontSize: '9.5px', color: '#737373' }}>Delivery cutoff: 07:30 AM before café morning peak</span>
                    </div>

                    <div className="route-grid">
                      <div
                        className={`route-van-card ${selectedVan === 0 ? 'selected' : ''}`}
                        onClick={() => { setSelectedVan(0); showToast('Van #1 Route Selected: Indiranagar Loop (14 Stops)'); }}
                        tabIndex={0}
                        role="button"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '11px', color: '#171717' }}>Van #1 · Indiranagar</span>
                          <span className="status-pill status-available" style={{ fontSize: '8.5px', padding: '1px 5px' }}>85% Done</span>
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#737373' }}>Driver: Ramesh · 14 Drops</div>
                        <div className="delivery-prog-bar" style={{ width: '100%', height: '4px' }}>
                          <div className="delivery-prog-fill" style={{ width: '85%' }} />
                        </div>
                        <div style={{ fontSize: '9px', color: '#166534', fontWeight: 600 }}>Next: Third Wave (ETA 8m)</div>
                      </div>

                      <div
                        className={`route-van-card ${selectedVan === 1 ? 'selected' : ''}`}
                        onClick={() => { setSelectedVan(1); showToast('Van #2 Route Selected: Koramangala Hub (12 Stops)'); }}
                        tabIndex={0}
                        role="button"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '11px', color: '#171717' }}>Van #2 · Koramangala</span>
                          <span className="status-pill status-transit" style={{ fontSize: '8.5px', padding: '1px 5px' }}>50% Done</span>
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#737373' }}>Driver: Suresh · 12 Drops</div>
                        <div className="delivery-prog-bar" style={{ width: '100%', height: '4px' }}>
                          <div className="delivery-prog-fill" style={{ width: '50%' }} />
                        </div>
                        <div style={{ fontSize: '9px', color: '#B45309', fontWeight: 600 }}>Next: Blue Tokai (ETA 14m)</div>
                      </div>

                      <div
                        className={`route-van-card ${selectedVan === 2 ? 'selected' : ''}`}
                        onClick={() => { setSelectedVan(2); showToast('Van #3 Route Selected: Whitefield Hub (8 Stops)'); }}
                        tabIndex={0}
                        role="button"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '11px', color: '#171717' }}>Van #3 · Whitefield</span>
                          <span className="status-pill status-scheduled" style={{ fontSize: '8.5px', padding: '1px 5px' }}>Loading</span>
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#737373' }}>Driver: Manjunath · 8 Drops</div>
                        <div className="delivery-prog-bar" style={{ width: '100%', height: '4px' }}>
                          <div className="delivery-prog-fill" style={{ width: '15%', background: '#8B5CF6' }} />
                        </div>
                        <div style={{ fontSize: '9px', color: '#6D28D9', fontWeight: 600 }}>Departs 06:30 AM</div>
                      </div>
                    </div>
                  </div>

                  {/* ── SCROLL DOWN MOAT SECTION 3: T+1 Automated Settlements ── */}
                  <div className="dash-moat-section" id="sup-settlement-section" style={{ paddingBottom: '16px' }}>
                    <div className="dash-section-header">
                      <div className="dash-section-title">
                        <span>💳 Instant T+1 Settlement &amp; Invoicing Ledger</span>
                        <span className="dash-section-badge" style={{ background: '#DCFCE7', color: '#15803D' }}>Zero Bad Debt</span>
                      </div>
                      <button
                        type="button"
                        className="dash-tab-btn"
                        onClick={() => showToast('GST reconciliation ledger exported to Tally / Zoho Books')}
                      >
                        Export GST Ledger (Tally Sync)
                      </button>
                    </div>

                    <div className="settlement-ledger-card">
                      <div className="settlement-stat-row">
                        <div>
                          <span style={{ fontSize: '10px', color: '#525252', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>Settled Today to HDFC Bank</span>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: '#166534' }}>₹1,84,200.00</div>
                          <span style={{ fontSize: '9.5px', color: '#737373' }}>UTR: HDFC-99281048 · Disbursed 06:00 AM IST</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '9.5px', color: '#525252', fontWeight: 600 }}>Transit Escrow: ₹45,300</span>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#171717' }}>Bad Debt: ₹0.00</div>
                          <span style={{ fontSize: '9px', color: '#16A34A', fontWeight: 600 }}>✓ Gradient Escrow Guaranteed</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '9.5px', color: '#525252', borderTop: '1px solid #DCFCE7', paddingTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>34 Verified Café B2B e-Invoices Auto-Generated</span>
                        <span style={{ fontWeight: 600, color: '#166534' }}>All Payments Secured Before Delivery</span>
                      </div>
                    </div>
                  </div>

                  {/* Add Product Modal */}
                  {showAddProductModal && (
                    <div className="dash-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-supplier-product-title">
                      <div className="dash-modal-card">
                        <div className="dash-modal-header">
                          <h4 className="dash-modal-title" id="modal-supplier-product-title">Publish Wholesale Product</h4>
                          <button
                            type="button"
                            className="dash-modal-close"
                            onClick={() => setShowAddProductModal(false)}
                            aria-label="Close modal"
                          >
                            ✕
                          </button>
                        </div>
                        <form onSubmit={handleCreateProduct}>
                          <div className="dash-form-row">
                            <label className="dash-form-label" htmlFor="supplier-product-name">Product Name</label>
                            <input
                              type="text"
                              id="supplier-product-name"
                              className="dash-form-input"
                              placeholder="e.g. Single Origin Cold Brew Concentrate"
                              value={newProductName}
                              onChange={(e) => setNewProductName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="dash-form-row" style={{ marginTop: '8px' }}>
                            <label className="dash-form-label" htmlFor="supplier-category-select">Category</label>
                            <select
                              className="dash-form-select"
                              id="supplier-category-select"
                              value={newProductCategory}
                              onChange={(e) => setNewProductCategory(e.target.value)}
                            >
                              <option>Specialty Coffee</option>
                              <option>Plant & Dairy</option>
                              <option>Packaging</option>
                              <option>Syrups & Bases</option>
                              <option>Beverage Bases</option>
                            </select>
                          </div>
                          <div className="dash-form-row" style={{ marginTop: '8px' }}>
                            <label className="dash-form-label" htmlFor="supplier-price-input">Wholesale Price (per unit/kg)</label>
                            <input
                              type="text"
                              id="supplier-price-input"
                              className="dash-form-input"
                              value={newProductPrice}
                              onChange={(e) => setNewProductPrice(e.target.value)}
                              required
                            />
                          </div>
                          <div className="dash-modal-actions" style={{ marginTop: '12px' }}>
                            <button type="button" className="dash-btn-ghost" onClick={() => setShowAddProductModal(false)}>Cancel</button>
                            <button type="submit" className="dash-btn-primary">
                              Save &amp; Publish SKU
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </main>
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
              Auto-aggregate café demand from WhatsApp, batch roast par levels, dispatch morning van fleets, and receive guaranteed T+1 payouts without credit risk.
            </p>

            <div className="feature-list">
              <div
                className={`feature-item ${activeFeature === 0 ? 'active' : ''}`}
                onClick={() => { setActiveFeature(0); scrollToAnchor('sup-catalog-table', 'catalog'); }}
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
                  <span className="feature-heading">Manage inventory &amp; roast par.</span>
                  <span className="feature-text">Real-time SKU availability, roast-date batch control, and automated par alerts.</span>
                </div>
              </div>

              <div
                className={`feature-item ${activeFeature === 1 ? 'active' : ''}`}
                onClick={() => { setActiveFeature(1); scrollToAnchor('sup-whatsapp-section', 'whatsapp'); }}
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
                  <span className="feature-heading">Auto-parse WhatsApp orders.</span>
                  <span className="feature-text">AI converts voice notes and chats into structured digital POs in 3 seconds.</span>
                </div>
              </div>

              <div
                className={`feature-item ${activeFeature === 2 ? 'active' : ''}`}
                onClick={() => { setActiveFeature(2); scrollToAnchor('sup-route-section', 'routes'); }}
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
                  <span className="feature-heading">Morning route dispatch &amp; T+1 payout.</span>
                  <span className="feature-text">Clustered delivery runs with digital ePOD and next-morning bank settlement.</span>
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
    title: 'Barista Oat Milk Indiranagar Flight',
    cafes: '120 cafés',
    product: 'Barista Oat Milk',
    status: 'Active',
    performance: '84% Adoption',
    reach: '120 cafés',
    orders: '1,284 cartons',
    revenue: '₹2.1L',
    period: '01 Sep → 30 Sep',
    approval: '94% Barista Score',
    reorderRate: '78%',
    metro: 'Bangalore',
  },
  {
    title: 'Nitro Cold Brew Single-Origin Trial',
    cafes: '85 cafés',
    product: 'Nitro Cold Brew',
    status: 'Active',
    performance: '92% Score',
    reach: '85 cafés',
    orders: '640 pre-booked',
    revenue: '₹1.4L',
    period: '15 Sep → 15 Oct',
    approval: '98% Barista Score',
    reorderRate: '82%',
    metro: 'Mumbai',
  },
  {
    title: 'Kyoto Ceremonial Matcha Flights',
    cafes: '62 cafés',
    product: 'Uji Matcha',
    status: 'Scheduled',
    performance: '76% Projected',
    reach: '62 cafés',
    orders: '380 kits queued',
    revenue: '₹95K projected',
    period: '01 Oct → 31 Oct',
    approval: '91% Barista Score',
    reorderRate: '71%',
    metro: 'Delhi-NCR',
  },
  {
    title: 'Madagascar Vanilla & Cascara Syrups',
    cafes: '45 cafés',
    product: 'Craft Syrups',
    status: 'Completed',
    performance: '88% Conversion',
    reach: '45 cafés',
    orders: '890 bottles',
    revenue: '₹1.8L',
    period: '01 Aug → 31 Aug',
    approval: '95% Barista Score',
    reorderRate: '84%',
    metro: 'Bangalore',
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
    cafe: 'Third Wave Coffee',
    metro: 'Bangalore · Indiranagar',
    barista: 'Head Barista Vikram',
    rating: 5.0,
    product: 'Barista Oat Milk',
    comment: 'Microfoam texture is identical to whole milk. Holds glossy latte art for 8+ mins without curdling in high-acidity roasts.',
    outcome: 'Added 15 cases/wk to weekly auto-replenish',
  },
  {
    id: 'REV-102',
    cafe: 'Blue Tokai Roasters',
    metro: 'Bangalore · Koramangala',
    barista: 'Lead Barista Ananya',
    rating: 5.0,
    product: 'Nitro Cold Brew Canisters',
    comment: 'Creamy nitrogen cascade with dense head. Customers loved the clean finish. Zero bar prep time.',
    outcome: 'Switched 100% of cold tap line to Origins',
  },
  {
    id: 'REV-103',
    cafe: 'Subko Specialty Coffee',
    metro: 'Mumbai · Bandra West',
    barista: 'Beverage Director Rohan',
    rating: 4.9,
    product: 'Barista Oat Milk',
    comment: '38% of our morning iced lattes converted to this oat milk in week one. Clean natural sweetness.',
    outcome: 'Contract signed across 4 Mumbai stores',
  },
];

function BrandSection({ isMobile }: { isMobile: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
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
    { x: '55%', y: '165px', label: 'Filter 150 Specialty Cafés' },
    { x: '68%', y: '260px', label: 'Deploy Barista Sampling Kits' },
    { x: '45%', y: '345px', label: '94% Barista Approval Score' },
  ];

  // Interactive UI State
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'telemetry' | 'funnel' | 'share'>('campaigns');
  const [selectedMetro, setSelectedMetro] = useState<'All' | 'Bangalore' | 'Mumbai' | 'Delhi-NCR'>('All');
  const [campaigns, setCampaigns] = useState<BrandCampaign[]>(INITIAL_BRAND_CAMPAIGNS);
  const [selectedCampaign, setSelectedCampaign] = useState<BrandCampaign>(INITIAL_BRAND_CAMPAIGNS[0]);
  const [baristaReviews, setBaristaReviews] = useState<BaristaReview[]>(INITIAL_BARISTA_REVIEWS);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignProduct, setNewCampaignProduct] = useState('Barista Oat Milk');
  const [newCampaignMetro, setNewCampaignMetro] = useState<'Bangalore' | 'Mumbai' | 'Delhi-NCR'>('Bangalore');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Contained wheel scrolling: allows mouse wheel over dashboard to smoothly scroll the inner container without scrolling the landing page
  useEffect(() => {
    const el = mainScrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const canScrollDown = e.deltaY > 0 && scrollTop + clientHeight < scrollHeight - 1;
      const canScrollUp = e.deltaY < 0 && scrollTop > 1;

      if (canScrollDown || canScrollUp) {
        e.preventDefault();
        e.stopPropagation();
        el.scrollTop += e.deltaY;
        setHasScrolled(true);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

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
    showToast(`Dispatched 20 additional barista tasting flights across ${selectedMetro === 'All' ? 'Bangalore' : selectedMetro} specialty cafés`);
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
              Eliminate distributor blindness. Seed tasting flights directly to verified barista stations, measure real-time café consumption telemetry, and convert trials into weekly recurring wholesale orders.
            </p>

            <div className="feature-list">
              <div
                className={`feature-item ${activeFeature === 0 ? 'active' : ''}`}
                onClick={() => { setActiveFeature(0); scrollToAnchor('brand-campaigns-table', 'campaigns'); }}
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
                  <span className="feature-heading">Target verified cafés by tier.</span>
                  <span className="feature-text">Filter high-volume specialty coffee bars across Bangalore, Mumbai, and Delhi NCR.</span>
                </div>
              </div>

              <div
                className={`feature-item ${activeFeature === 1 ? 'active' : ''}`}
                onClick={() => { setActiveFeature(1); scrollToAnchor('brand-telemetry-section', 'telemetry'); }}
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
                  <span className="feature-heading">Seed barista sampling flights.</span>
                  <span className="feature-text">Collect live sensory feedback, microfoam performance, and taste scorecards.</span>
                </div>
              </div>

              <div
                className={`feature-item ${activeFeature === 2 ? 'active' : ''}`}
                onClick={() => { setActiveFeature(2); scrollToAnchor('brand-funnel-section', 'funnel'); }}
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
                  <span className="feature-heading">Convert trials into recurring GMV.</span>
                  <span className="feature-text">78% of approved trials convert into weekly automatic wholesale replenishment.</span>
                </div>
              </div>

              <div
                className={`feature-item ${activeFeature === 3 ? 'active' : ''}`}
                onClick={() => { setActiveFeature(3); scrollToAnchor('brand-share-section', 'share'); }}
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
                  <span className="feature-heading">Direct consumption &amp; shelf share.</span>
                  <span className="feature-text">Track daily liters consumed, city velocity, and market share vs competing products.</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Dynamic 3D Tilted Product Interface with Google-Style Motion Workflow */}
          <div className="product-stage">
            <motion.div
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
              {/* Google-Style Product Motion Vignette Chrome */}
              <MotionTimelineBar
                currentStep={motionStep}
                totalSteps={3}
                stepLabels={['Target Cafés', 'Deploy Flights', 'Barista Feedback']}
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
                  <span>app.gradient365.com/brand/telemetry</span>
                </div>
                <div className="browser-actions">
                  <span className="browser-status-tag" style={{ background: '#F5F3FF', color: '#6D28D9', borderColor: '#DDD6FE' }}>Direct Telemetry · Active</span>
                  <div className="browser-user-badge">
                    <span className="browser-avatar" style={{ background: '#6D28D9' }}>OB</span>
                    <span>Origins Beverage &amp; Oat Co.</span>
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
                <aside className="dashboard-sidebar" aria-label="Brand Dashboard Navigation">
                  <div>
                    <div className="sidebar-brand-header">
                      <div className="sidebar-grabbit-logo">
                        <span className="grabbit-mark" style={{ background: '#6D28D9' }}>G</span>
                        <span className="grabbit-name">Gradient</span>
                      </div>
                      <span className="sidebar-org-sub">Brand OS</span>
                    </div>

                    <div className="sidebar-nav-section-label">Growth &amp; Reach</div>
                    <nav className="sidebar-nav">
                      <button
                        type="button"
                        className={`sidebar-item ${activeTab === 'campaigns' ? 'active' : ''}`}
                        onClick={() => scrollToAnchor('brand-campaigns-table', 'campaigns')}
                      >
                        <SvgIcons.Campaigns />
                        <span>Campaigns &amp; Flights</span>
                        <span className="sidebar-badge-count">{campaigns.length}</span>
                      </button>
                      <button
                        type="button"
                        className={`sidebar-item ${activeTab === 'telemetry' ? 'active' : ''}`}
                        onClick={() => scrollToAnchor('brand-telemetry-section', 'telemetry')}
                      >
                        <SvgIcons.Network />
                        <span>Barista Telemetry</span>
                        <span className="sidebar-badge-count" style={{ background: '#EDE9FE', color: '#6D28D9' }}>312</span>
                      </button>
                      <button
                        type="button"
                        className={`sidebar-item ${activeTab === 'funnel' ? 'active' : ''}`}
                        onClick={() => scrollToAnchor('brand-funnel-section', 'funnel')}
                      >
                        <SvgIcons.Overview />
                        <span>Conversion Funnel</span>
                        <span className="sidebar-badge-count">78%</span>
                      </button>
                      <button
                        type="button"
                        className={`sidebar-item ${activeTab === 'share' ? 'active' : ''}`}
                        onClick={() => scrollToAnchor('brand-share-section', 'share')}
                      >
                        <SvgIcons.Analytics />
                        <span>Market Share</span>
                      </button>
                    </nav>
                  </div>

                  <div className="sidebar-footer">
                    <button type="button" className="sidebar-item" onClick={() => showToast('Brand playbook & sampling logistics guide')}>
                      <SvgIcons.Help />
                      <span>Help</span>
                    </button>
                    <button type="button" className="sidebar-item" onClick={() => showToast('Brand privacy & competitor-blind settings')}>
                      <SvgIcons.Settings />
                      <span>Settings</span>
                    </button>
                    <div className="sidebar-pill-status" style={{ background: '#F5F3FF', color: '#6D28D9' }}>
                      <span className="status-dot-pulse" style={{ background: '#6D28D9' }} aria-hidden="true" />
                      <span>312 Cafés Reached</span>
                    </div>
                  </div>
                </aside>

                {/* Main Operations Area (Contained Smooth Scrolling) */}
                <main
                  ref={mainScrollRef}
                  className={`dashboard-main ${activeFeature !== null ? 'has-active-feature' : ''}`}
                  onScroll={() => setHasScrolled(true)}
                  tabIndex={0}
                  aria-label="Scrollable brand telemetry workspace"
                >
                  {/* Floating Scroll Prompt */}
                  <div className={`dash-scroll-prompt ${hasScrolled ? 'faded' : ''}`}>
                    ↕ Scroll down to view barista feedback &amp; conversion funnel
                  </div>

                  {/* Top Navigation */}
                  <div className="dashboard-top-nav">
                    <div className="dashboard-heading-group">
                      <div className="dashboard-title-row">
                        <h3 className="dashboard-page-title">Brand Growth &amp; Telemetry</h3>
                        <span className="dash-date-indicator">Q3 · Active Distribution</span>
                      </div>
                      <span className="dashboard-page-subtitle">Direct café consumption telemetry, barista tasting flights, and recurring contracts</span>
                    </div>

                    <div className="dashboard-top-nav-right">
                      <button
                        type="button"
                        className="dash-icon-btn"
                        title="Search Campaigns"
                        aria-label="Search Campaigns"
                        onClick={() => showToast('Search focused. Filter flights by name.')}
                      >
                        <SvgIcons.Search />
                      </button>
                      <button
                        type="button"
                        className="dash-icon-btn"
                        title="Notifications"
                        aria-label="Notifications"
                        onClick={() => showToast('141 barista tasting scorecards logged across 3 cities')}
                      >
                        <SvgIcons.Bell />
                        <span className="dash-notif-dot" />
                      </button>
                      <button
                        type="button"
                        className="dash-btn-primary"
                        onClick={() => setShowNewCampaignModal(true)}
                      >
                        <span>+</span>
                        <span>New Flight</span>
                      </button>
                    </div>
                  </div>

                  {/* Moat View Navigation Tabs */}
                  <div className="dash-view-tabs" role="tablist" aria-label="Brand views">
                    <button
                      type="button"
                      className={`dash-tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('brand-campaigns-table', 'campaigns')}
                    >
                      🚀 Active Flights ({campaigns.length})
                    </button>
                    <button
                      type="button"
                      className={`dash-tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('brand-telemetry-section', 'telemetry')}
                    >
                      ☕ Barista Scorecards (141)
                    </button>
                    <button
                      type="button"
                      className={`dash-tab-btn ${activeTab === 'funnel' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('brand-funnel-section', 'funnel')}
                    >
                      📊 Conversion Funnel (78%)
                    </button>
                    <button
                      type="button"
                      className={`dash-tab-btn ${activeTab === 'share' ? 'active' : ''}`}
                      onClick={() => scrollToAnchor('brand-share-section', 'share')}
                    >
                      📈 Market Share (44%)
                    </button>
                  </div>

                  {/* Brand Moat KPI Area */}
                  <div className="dashboard-overview-row">
                    <div
                      className="dashboard-stat"
                      style={{ cursor: 'pointer' }}
                      onClick={() => scrollToAnchor('brand-telemetry-section', 'telemetry')}
                      title="Click to view verified café telemetry"
                    >
                      <span className="stat-label">Cafés Reached</span>
                      <div className="stat-value">
                        <AnimatedCounter value={312} />
                      </div>
                      <div className="stat-trend positive">
                        <span>↑ +34 this month</span>
                        <span className="stat-context">2,410L daily sell-through</span>
                      </div>
                    </div>

                    <div
                      className="dashboard-stat"
                      style={{ cursor: 'pointer' }}
                      onClick={() => scrollToAnchor('brand-telemetry-section', 'telemetry')}
                      title="Click to view barista approval"
                    >
                      <span className="stat-label">Barista Approval Rating</span>
                      <div className="stat-value" style={{ color: '#6D28D9' }}>
                        <span>94.2%</span>
                        <span style={{ fontSize: '11px', color: '#888', fontWeight: 500, marginLeft: '4px' }}>4.9★</span>
                      </div>
                      <div className="stat-trend positive">
                        <span>● 141 Tastings</span>
                        <span className="stat-context">zero curdling in light roast</span>
                      </div>
                    </div>

                    <div
                      className="dashboard-stat"
                      style={{ cursor: 'pointer' }}
                      onClick={() => scrollToAnchor('brand-funnel-section', 'funnel')}
                      title="Click to view recurring reorder conversion"
                    >
                      <span className="stat-label">Trial-to-Reorder Rate</span>
                      <div className="stat-value">
                        <AnimatedCounter value={78} suffix="%" />
                      </div>
                      <div className="stat-trend positive">
                        <span>↑ ₹4.8L recurring</span>
                        <span className="stat-context">110 cafés on auto-cart</span>
                      </div>
                    </div>
                  </div>

                  {/* Attio-Style Workflow Automation Showcase */}
                  <div className="dash-workflow-showcase dash-dot-grid">
                    <WorkflowNode
                      title="🎯 Sampling Flight Targeter"
                      subtitle="Filter: Top 150 Specialty Cafés"
                      badgeText="Audience Sequence"
                      accentColor="#9333EA"
                    />
                    <AnimatedBezierCable
                      startX={190}
                      startY={25}
                      endX={340}
                      endY={25}
                      accentColor="#9333EA"
                    />
                    <div className="workflow-target-card">
                      <div
                        className="workflow-target-badge"
                        style={{
                          color: '#6D28D9',
                          background: '#EDE9FE',
                          borderColor: '#DDD6FE',
                        }}
                      >
                        <span className="motion-live-dot" style={{ background: '#9333EA' }} />
                        <span>
                          {motionStep === 0
                            ? '142 Cafés Targeted (Tier-1 Specialty)'
                            : motionStep === 1
                            ? '1,500 Sample Kits Deployed to Baristas'
                            : '94% Barista Approval · 78% Reorder Conversion'}
                        </span>
                      </div>
                      <span className="workflow-target-time">
                        {motionStep === 0
                          ? 'Bangalore Indiranagar & Mumbai Bandra'
                          : motionStep === 1
                          ? 'Seeded with digital tasting scorecards'
                          : '110 Cafés placed weekly recurring wholesale orders'}
                      </span>
                    </div>
                  </div>

                  {/* Control Bar: Search & Metro Filter Pills */}
                  <div className="dashboard-controls-bar" id="brand-campaigns-table">
                    <div className="dash-search-box">
                      <SvgIcons.Search />
                      <input
                        type="text"
                        placeholder="Filter campaigns or products..."
                        className="dash-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Filter campaigns or products"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '10px' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Clickable Metro Pills */}
                    <div className="dash-filter-group" role="radiogroup" aria-label="Metro filters">
                      {(['All', 'Bangalore', 'Mumbai', 'Delhi-NCR'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          className={`dash-filter-pill ${selectedMetro === m ? 'active' : ''}`}
                          onClick={() => setSelectedMetro(m)}
                        >
                          {m === 'All' ? 'All Metros (312)' : `${m} Hub`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Asymmetrical Bento: Campaigns Table + Detail/Analytics + Network & Adoption */}
                  <div className="dashboard-bento">
                    {/* Left: Campaigns Table with Clickable Rows */}
                    <div className={`dashboard-card ${activeFeature === 1 ? 'highlight-active-brand' : ''}`} style={{ padding: '10px 12px' }}>
                      <div className="card-header">
                        <div>
                          <span className="card-title">Targeted Sampling Campaigns</span>
                          <span className="card-subtitle">Showing {filteredCampaigns.length} active brand flights</span>
                        </div>
                        <span className="status-pill status-active">
                          <span className="status-dot" aria-hidden="true" />
                          Live Flights
                        </span>
                      </div>

                      <div className="dashboard-table-container">
                        <table className="dashboard-table" role="table" aria-label="Brand active campaigns">
                          <thead>
                            <tr>
                              <th scope="col">Campaign Flight</th>
                              <th scope="col">Cafés</th>
                              <th scope="col">Product</th>
                              <th scope="col">Status</th>
                              <th scope="col">Adoption</th>
                              <th scope="col" style={{ textAlign: 'right' }}>Select</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCampaigns.map((c) => {
                              const isSelected = selectedCampaign.title === c.title;
                              return (
                                <tr
                                  key={c.title}
                                  className={`dashboard-table-row ${isSelected ? 'selected' : ''}`}
                                  onClick={() => setSelectedCampaign(c)}
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setSelectedCampaign(c);
                                    }
                                  }}
                                  role="button"
                                  aria-pressed={isSelected}
                                  aria-label={`Select campaign ${c.title}`}
                                >
                                  <td className="table-cell-bold">
                                    <div>{c.title}</div>
                                    <div style={{ fontSize: '9px', color: '#888', fontWeight: 400 }}>{c.metro} · {c.period}</div>
                                  </td>
                                  <td>{c.cafes}</td>
                                  <td className="table-cell-sub">{c.product}</td>
                                  <td>
                                    <span className={`status-pill status-${c.status === 'Active' ? 'active' : c.status === 'Scheduled' ? 'scheduled' : 'completed'}`}>
                                      <span className="status-dot" aria-hidden="true" />
                                      {c.status}
                                    </span>
                                  </td>
                                  <td className="table-cell-num" style={{ color: '#6D28D9', fontWeight: 700 }}>{c.performance}</td>
                                  <td style={{ textAlign: 'right' }}>
                                    <span className="table-action-arrow" aria-hidden="true">
                                      <SvgIcons.ArrowRight />
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Selected Campaign Detail Panel */}
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(23, 23, 23, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#171717' }}>Selected Flight: {selectedCampaign.title}</span>
                          <div style={{ fontSize: '9.5px', color: '#737373' }}>
                            {selectedCampaign.reach} · Orders: {selectedCampaign.orders} · Reorder: {selectedCampaign.reorderRate}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="dash-tab-btn"
                            style={{ background: '#EDE9FE', color: '#5B21B6', borderColor: '#DDD6FE' }}
                            onClick={handleSeedMoreKits}
                          >
                            + Seed Next Flight (+20 Cafés)
                          </button>
                          <button
                            type="button"
                            className="dash-tab-btn"
                            onClick={() => showToast(`141 barista sensory evaluations exported for ${selectedCampaign.title}`)}
                          >
                            Export Scorecards
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Abstract Café Network & Product Adoption */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Abstract Café Reach Cluster */}
                      <div className={`dashboard-card ${activeFeature === 0 ? 'highlight-active-brand' : ''}`}>
                        <div className="card-header">
                          <span className="card-title">Café Distribution Mesh</span>
                          <span className="card-subtitle">312 verified nodes</span>
                        </div>
                        <div className="network-viz-container">
                          <svg className="network-svg" viewBox="0 0 200 64" aria-label="Abstract network graph connecting Brand to 312 cafes">
                            <line x1="100" y1="32" x2="35" y2="18" stroke="#DDD6FE" strokeWidth="1.2" strokeDasharray="2,2" />
                            <line x1="100" y1="32" x2="45" y2="48" stroke="#DDD6FE" strokeWidth="1.2" strokeDasharray="2,2" />
                            <line x1="100" y1="32" x2="155" y2="20" stroke="#DDD6FE" strokeWidth="1.2" strokeDasharray="2,2" />
                            <line x1="100" y1="32" x2="165" y2="46" stroke="#DDD6FE" strokeWidth="1.2" strokeDasharray="2,2" />
                            <line x1="100" y1="32" x2="100" y2="12" stroke="#DDD6FE" strokeWidth="1.2" strokeDasharray="2,2" />
                            <line x1="100" y1="32" x2="100" y2="52" stroke="#DDD6FE" strokeWidth="1.2" strokeDasharray="2,2" />

                            <circle cx="35" cy="18" r="4" fill="#C4B5FD" />
                            <circle cx="45" cy="48" r="4.5" fill="#A78BFA" />
                            <circle cx="155" cy="20" r="4" fill="#C4B5FD" />
                            <circle cx="165" cy="46" r="5" fill="#A78BFA" />
                            <circle cx="100" cy="12" r="3.5" fill="#DDD6FE" />
                            <circle cx="100" cy="52" r="4" fill="#DDD6FE" />

                            <circle cx="100" cy="32" r="8" fill="#6D28D9" />
                            <circle cx="100" cy="32" r="12" fill="none" stroke="#6D28D9" strokeWidth="1" opacity="0.3" />
                          </svg>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#6B5E87', marginTop: '6px' }}>
                          <span>78% active weekly reorders</span>
                          <span style={{ fontWeight: 600, color: '#2E1065' }}>+34 venues this month</span>
                        </div>
                      </div>

                      {/* Product Adoption Breakdown */}
                      <div className={`dashboard-card ${activeFeature === 2 ? 'highlight-active-brand' : ''}`}>
                        <div className="card-header">
                          <span className="card-title">Consumption Velocity</span>
                          <span className="card-subtitle">Daily Café Liters</span>
                        </div>
                        <div className="inventory-list">
                          <div className="inventory-row">
                            <div className="inventory-row-header">
                              <span className="inventory-item-name">Barista Oat Milk</span>
                              <span style={{ color: '#5B21B6', fontWeight: 600 }}>1,840 L/day (84%)</span>
                            </div>
                            <div className="inventory-bar-bg">
                              <div className="inventory-bar-fill" style={{ width: '84%', background: '#6D28D9' }} />
                            </div>
                          </div>

                          <div className="inventory-row">
                            <div className="inventory-row-header">
                              <span className="inventory-item-name">Nitro Cold Brew</span>
                              <span style={{ color: '#7C3AED', fontWeight: 600 }}>380 L/day (72%)</span>
                            </div>
                            <div className="inventory-bar-bg">
                              <div className="inventory-bar-fill" style={{ width: '72%', background: '#9333EA' }} />
                            </div>
                          </div>

                          <div className="inventory-row">
                            <div className="inventory-row-header">
                              <span className="inventory-item-name">Craft Syrups</span>
                              <span style={{ color: '#5B21B6', fontWeight: 600 }}>190 Btl/day (64%)</span>
                            </div>
                            <div className="inventory-bar-bg">
                              <div className="inventory-bar-fill" style={{ width: '64%', background: '#A78BFA' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── SCROLL DOWN MOAT SECTION 1: Verified Barista Station Tasting Notes ── */}
                  <div className="dash-moat-section" id="brand-telemetry-section">
                    <div className="dash-section-header">
                      <div className="dash-section-title">
                        <span>☕ Verified Barista Tasting Telemetry</span>
                        <span className="dash-section-badge" style={{ background: '#EDE9FE', color: '#6D28D9' }}>141 Submissions</span>
                      </div>
                      <button
                        type="button"
                        className="dash-tab-btn"
                        style={{ background: '#7C3AED', color: '#FFFFFF', borderColor: '#6D28D9' }}
                        onClick={handleSeedMoreKits}
                      >
                        + Seed Flight to 20 New Cafés
                      </button>
                    </div>
                    <span style={{ fontSize: '10px', color: '#737373' }}>
                      Real, unfiltered feedback logged directly by head baristas during structured tasting flights on Gradient.
                    </span>

                    <div className="barista-reviews-grid">
                      {baristaReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="barista-quote-card"
                          onClick={() => showToast(`Full sensory scorecard opened for ${rev.cafe}`)}
                          tabIndex={0}
                          role="button"
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '10.5px', color: '#171717' }}>{rev.cafe}</span>
                            <span style={{ color: '#F59E0B', fontSize: '10px', fontWeight: 700 }}>★★★★★ {rev.rating}</span>
                          </div>
                          <div style={{ fontSize: '9px', color: '#737373' }}>{rev.barista} · {rev.metro}</div>
                          <p style={{ margin: '2px 0', fontSize: '9.5px', color: '#333333', fontStyle: 'italic', lineHeight: 1.35 }}>
                            &ldquo;{rev.comment}&rdquo;
                          </p>
                          <div style={{ fontSize: '9px', color: '#15803D', fontWeight: 600, borderTop: '1px dashed #EDE9FE', paddingTop: '4px' }}>
                            ✓ {rev.outcome}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── SCROLL DOWN MOAT SECTION 2: Trial-to-Wholesale Conversion Funnel ── */}
                  <div className="dash-moat-section" id="brand-funnel-section">
                    <div className="dash-section-header">
                      <div className="dash-section-title">
                        <span>📊 Trial-to-Wholesale Recurring Funnel</span>
                        <span className="dash-section-badge" style={{ background: '#DCFCE7', color: '#15803D' }}>78% Reorder Conversion</span>
                      </div>
                      <span style={{ fontSize: '9.5px', color: '#737373' }}>Every liked trial converts into an automated weekly wholesale cart lead</span>
                    </div>

                    <div className="conversion-funnel-card">
                      <div className="funnel-bar-step">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                          <span style={{ fontWeight: 600, color: '#171717' }}>1. Targeted Barista Sampling Kits Seeded</span>
                          <span style={{ fontWeight: 700, color: '#6D28D9' }}>150 Cafés (100%)</span>
                        </div>
                        <div className="funnel-bar-track"><div className="funnel-bar-fill" style={{ width: '100%' }} /></div>
                      </div>

                      <div className="funnel-bar-step">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                          <span style={{ fontWeight: 600, color: '#171717' }}>2. Verified Barista Tasting Scorecards Logged</span>
                          <span style={{ fontWeight: 700, color: '#6D28D9' }}>141 Cafés (94%)</span>
                        </div>
                        <div className="funnel-bar-track"><div className="funnel-bar-fill" style={{ width: '94%' }} /></div>
                      </div>

                      <div className="funnel-bar-step">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                          <span style={{ fontWeight: 600, color: '#171717' }}>3. Café Blackboard &amp; Menu Listing Approved</span>
                          <span style={{ fontWeight: 700, color: '#6D28D9' }}>124 Cafés (88%)</span>
                        </div>
                        <div className="funnel-bar-track"><div className="funnel-bar-fill" style={{ width: '88%' }} /></div>
                      </div>

                      <div className="funnel-bar-step">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                          <span style={{ fontWeight: 600, color: '#15803D' }}>4. Weekly Recurring Wholesale Replenishment</span>
                          <span style={{ fontWeight: 800, color: '#15803D' }}>110 Cafés (78% Converted!)</span>
                        </div>
                        <div className="funnel-bar-track"><div className="funnel-bar-fill" style={{ width: '78%', background: '#16A34A' }} /></div>
                      </div>
                    </div>
                  </div>

                  {/* ── SCROLL DOWN MOAT SECTION 3: Regional Market Share Benchmarks ── */}
                  <div className="dash-moat-section" id="brand-share-section" style={{ paddingBottom: '16px' }}>
                    <div className="dash-section-header">
                      <div className="dash-section-title">
                        <span>📈 Regional Specialty Category Share</span>
                        <span className="dash-section-badge" style={{ background: '#EDE9FE', color: '#6D28D9' }}>Category Leader</span>
                      </div>
                      <span style={{ fontSize: '9.5px', color: '#737373' }}>Benchmark: Specialty Cafés in Bangalore, Mumbai &amp; Delhi NCR</span>
                    </div>

                    <div className="market-share-grid">
                      <div className="market-share-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '11px', color: '#171717' }}>Origins Barista Oat</span>
                          <span style={{ color: '#6D28D9', fontWeight: 800, fontSize: '11px' }}>44% Share</span>
                        </div>
                        <div className="funnel-bar-track"><div className="funnel-bar-fill" style={{ width: '44%' }} /></div>
                        <div style={{ fontSize: '9px', color: '#15803D', fontWeight: 600 }}>↑ +14% growth vs traditional dairy</div>
                      </div>

                      <div className="market-share-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '11px', color: '#171717' }}>Commercial Cow Dairy</span>
                          <span style={{ color: '#737373', fontWeight: 800, fontSize: '11px' }}>32% Share</span>
                        </div>
                        <div className="funnel-bar-track"><div className="funnel-bar-fill" style={{ width: '32%', background: '#A3A3A3' }} /></div>
                        <div style={{ fontSize: '9px', color: '#991B1B' }}>↓ -8% declining in third-wave cafés</div>
                      </div>
                    </div>
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
                              <option>Barista Oat Milk (Steam-Stable)</option>
                              <option>Nitro Cold Brew Single-Origin Canisters</option>
                              <option>Kyoto Ceremonial Uji Matcha</option>
                              <option>Madagascar Vanilla &amp; Cascara Syrups</option>
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
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
