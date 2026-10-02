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

  // Track exact arrival of the Brand section into the viewport:
  // Starts transitioning as Brand section enters bottom of viewport ('start end')
  // Completes transition as Brand section header reaches comfortable reading zone ('start 30%')
  const { scrollYProgress: brandProgress } = useScroll({
    target: brandRef,
    offset: ['start end', 'start 30%'],
  });

  // Dynamic chromatic transition for the whole background:
  // Starts at 100% solid Supplier Green (#16A34A) and completely shifts to Brand Purple (#6D28D9)
  const productBg = useTransform(
    brandProgress,
    [0.0, 1.0],
    ['#16A34A', '#6D28D9']
  );

  // Sync the whole background CSS variable across the document
  useMotionValueEvent(productBg, 'change', (latest) => {
    document.documentElement.style.setProperty('--universe-bg', latest);
  });

  // Atmospheric radial fields opacity & subtle slow vertical drift
  const supplierGlowOpacity = useTransform(brandProgress, [0.0, 0.4], [1, 0]);
  const brandGlowOpacity = useTransform(brandProgress, [0.1, 0.5, 0.9, 1.0], [0, 1, 1, 1]);

  const supplierGlowY = useTransform(brandProgress, [0.0, 1.0], ['2%', '1%']);
  const brandGlowY = useTransform(brandProgress, [0.0, 1.0], ['1%', '-1%']);

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
                  <span>app.grabbit.io/cafe/orders</span>
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

                {/* Unified Grabbit Sidebar */}
                <aside className="dashboard-sidebar" aria-label="Café Dashboard Navigation">
                  <div>
                    <div className="sidebar-brand-header">
                      <div className="sidebar-grabbit-logo">
                        <span className="grabbit-mark">G</span>
                        <span className="grabbit-name">Grabbit</span>
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
}

const SUPPLIER_PRODUCTS_DATA: SupplierProduct[] = [
  { name: 'Arabica Beans', category: 'Coffee', price: '₹680/kg', stock: '82 kg', orders: 24, status: 'Available' },
  { name: 'Oat Milk', category: 'Dairy Alternative', price: '₹210/L', stock: '18 L', orders: 17, status: 'Low stock' },
  { name: 'Sourdough', category: 'Bakery', price: '₹180', stock: '42 units', orders: 9, status: 'Available' },
  { name: 'Takeaway Cups', category: 'Packaging', price: '₹320', stock: '120 packs', orders: 31, status: 'Available' },
  { name: 'Matcha Powder', category: 'Tea', price: '₹1,240', stock: '6 kg', orders: 12, status: 'Low stock' },
];

function SupplierSection({ isMobile }: { isMobile: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center 45%'],
  });

  // Left to Right scroll-driven entrance:
  // Glides from left to right (-220px -> 0) in the exact same manner as the purple Brand dashboard
  const rawX = useTransform(scrollYProgress, [0, 1], [isMobile ? -70 : -220, 0]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.25, 0.88], [0, 0.4, 1]);
  const rawScale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);

  const springConfig = { stiffness: 90, damping: 20, mass: 0.35 };
  const supplierX = useSpring(rawX, springConfig);
  const supplierOpacity = useSpring(rawOpacity, springConfig);
  const supplierScale = useSpring(rawScale, springConfig);

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

  const supplierRotateY = useTransform(smoothMouseX, (val) => 4.5 + val);
  const supplierRotateX = useTransform(smoothMouseY, (val) => 3.5 + val);

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

  const supplierCursorCoords = [
    { x: '52%', y: '160px', label: 'Accept PO #SP-992' },
    { x: '42%', y: '335px', label: 'Stock Allocated' },
    { x: '75%', y: '315px', label: 'Dispatch Fleet' },
  ];

  const [activeFeature, setActiveFeature] = useState(0);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(SUPPLIER_PRODUCTS_DATA[0]);
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
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredProducts = SUPPLIER_PRODUCTS_DATA.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                x: shouldReduceMotion ? 0 : supplierX,
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
                stepLabels={['Incoming PO', 'Auto-Allocate', 'Dispatch']}
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
                  <span>app.grabbit.io/supplier/catalog</span>
                </div>
                <div className="browser-actions">
                  <span className="browser-status-tag" style={{ background: '#ECFDF5', color: '#047857', borderColor: '#A7F3D0' }}>Wholesale Live</span>
                  <div className="browser-user-badge">
                    <span className="browser-avatar" style={{ background: '#064E3B' }}>RS</span>
                    <span>RoastSupply Co.</span>
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

                {/* Unified Grabbit Sidebar */}
                <aside className="dashboard-sidebar" aria-label="Supplier Dashboard Navigation">
                  <div>
                    <div className="sidebar-brand-header">
                      <div className="sidebar-grabbit-logo">
                        <span className="grabbit-mark" style={{ background: '#064E3B' }}>G</span>
                        <span className="grabbit-name">Grabbit</span>
                      </div>
                      <span className="sidebar-org-sub">Supplier OS</span>
                    </div>

                    <div className="sidebar-nav-section-label">Inventory & Trade</div>
                    <nav className="sidebar-nav">
                      <button type="button" className="sidebar-item">
                        <SvgIcons.Overview />
                        <span>Overview</span>
                      </button>
                      <button type="button" className="sidebar-item active">
                        <SvgIcons.Inventory />
                        <span>Products</span>
                        <span className="sidebar-badge-count">128</span>
                      </button>
                      <button type="button" className="sidebar-item">
                        <SvgIcons.Orders />
                        <span>Orders</span>
                      </button>
                      <button type="button" className="sidebar-item">
                        <SvgIcons.Deliveries />
                        <span>Deliveries</span>
                      </button>
                      <button type="button" className="sidebar-item">
                        <SvgIcons.Payments />
                        <span>Invoices</span>
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
                      <span>SLA 99.4% · Active</span>
                    </div>
                  </div>
                </aside>

                {/* Main Operations Area */}
                <main className={`dashboard-main ${activeFeature !== null ? 'has-active-feature' : ''}`}>
                  {/* Top Navigation */}
                  <div className="dashboard-top-nav">
                    <div className="dashboard-heading-group">
                      <div className="dashboard-title-row">
                        <h3 className="dashboard-page-title">Products</h3>
                        <span className="dash-date-indicator">Today · 27 Sep 2026</span>
                      </div>
                      <span className="dashboard-page-subtitle">Manage your catalogue and availability</span>
                    </div>

                    <div className="dashboard-top-nav-right">
                      <button type="button" className="dash-icon-btn" title="Search Catalogue" aria-label="Search Catalogue">
                        <SvgIcons.Search />
                      </button>
                      <button type="button" className="dash-icon-btn" title="Notifications" aria-label="Notifications">
                        <SvgIcons.Bell />
                        <span className="dash-notif-dot" />
                      </button>
                      <button
                        type="button"
                        className="dash-btn-primary"
                        onClick={() => setShowAddProductModal(true)}
                      >
                        <span>+</span>
                        <span>Add Product</span>
                      </button>
                    </div>
                  </div>

                  {/* Supplier Metrics */}
                  <div className={`dashboard-overview-row ${activeFeature === 1 ? 'highlight-active-supplier' : ''}`}>
                    <div className="dashboard-stat">
                      <span className="stat-label">Active products</span>
                      <div className="stat-value">
                        <AnimatedCounter value={128} />
                      </div>
                      <div className="stat-trend positive">
                        <span>↑ 6 added</span>
                        <span className="stat-context">across 4 categories</span>
                      </div>
                    </div>

                    <div className="dashboard-stat">
                      <span className="stat-label">Low stock warnings</span>
                      <div className="stat-value">
                        <AnimatedCounter value={7} />
                      </div>
                      <div className="stat-trend warning">
                        <span>● Action required</span>
                        <span className="stat-context">auto-alert sent</span>
                      </div>
                    </div>

                    <div className="dashboard-stat">
                      <span className="stat-label">Orders today</span>
                      <div className="stat-value">
                        <AnimatedCounter value={34} />
                      </div>
                      <div className="stat-trend positive">
                        <span>↑ 18.4% volume</span>
                        <span className="stat-context">₹1.84L GMV</span>
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
                            ? 'Incoming PO: The Corner Café ($3,840)'
                            : motionStep === 1
                            ? 'Pallet Stock Reserved (142 cs)'
                            : 'Dispatch Route #2 Assigned'}
                        </span>
                      </div>
                      <span className="workflow-target-time">
                        {motionStep === 0
                          ? 'Auto-routed to Warehouse 2'
                          : motionStep === 1
                          ? 'Picked & Packed in 4m'
                          : 'Van #2 leaving distribution center'}
                      </span>
                    </div>
                  </div>

                  {/* Control Bar */}
                  <div className="dashboard-controls-bar">
                    <div className="dash-search-box">
                      <SvgIcons.Search />
                      <input
                        type="text"
                        placeholder="Search products or SKUs..."
                        className="dash-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Filter products or SKUs"
                      />
                    </div>

                    <div className="dash-filter-group">
                      <span className="dash-filter-pill">Category: All</span>
                      <span className="dash-filter-pill">Availability: In Stock</span>
                      <span className="dash-filter-pill">Sort: Orders</span>
                    </div>
                  </div>

                  {/* Asymmetrical Bento: Products Table + Inventory Health / Demand + Delivery Pipeline */}
                  <div className="dashboard-bento">
                    {/* Left: Products Table */}
                    <div className={`dashboard-card ${activeFeature === 0 ? 'highlight-active-supplier' : ''}`} style={{ padding: '10px 12px' }}>
                      <div className="card-header">
                        <span className="card-title">Catalog Inventory</span>
                        <span className="card-subtitle">5 active café wholesale lines</span>
                      </div>

                      <div className="dashboard-table-container">
                        <table className="dashboard-table" role="table" aria-label="Supplier wholesale catalog">
                          <thead>
                            <tr>
                              <th scope="col">Product</th>
                              <th scope="col">Category</th>
                              <th scope="col">Price</th>
                              <th scope="col">Stock</th>
                              <th scope="col">Orders</th>
                              <th scope="col">Status</th>
                              <th scope="col" style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map((p) => (
                              <tr
                                key={p.name}
                                className={`dashboard-table-row ${selectedProduct.name === p.name ? 'selected' : ''}`}
                                onClick={() => setSelectedProduct(p)}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelectedProduct(p);
                                  }
                                }}
                                role="button"
                                aria-pressed={selectedProduct.name === p.name}
                                aria-label={`Select product ${p.name}`}
                              >
                                <td className="table-cell-bold">{p.name}</td>
                                <td className="table-cell-sub">{p.category}</td>
                                <td className="table-cell-num">{p.price}</td>
                                <td>{p.stock}</td>
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
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right: Supporting Modules (Inventory Distribution & Weekly Analytics) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Inventory Health Module */}
                      <div className="dashboard-card">
                        <div className="card-header">
                          <span className="card-title">Inventory health</span>
                          <span className="card-subtitle">130 Total SKUs</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', marginBottom: '6px' }}>
                          <span style={{ color: '#166534', fontWeight: 600 }}>Healthy: 121</span>
                          <span style={{ color: '#D97706', fontWeight: 600 }}>Low: 7</span>
                          <span style={{ color: '#B91C1C', fontWeight: 600 }}>Out: 2</span>
                        </div>
                        <div style={{ width: '100%', height: '5px', borderRadius: '9999px', background: '#F3F4F6', display: 'flex', overflow: 'hidden' }}>
                          <div style={{ width: '88%', background: '#22C55E' }} title="Healthy: 121" />
                          <div style={{ width: '9%', background: '#F59E0B' }} title="Low Stock: 7" />
                          <div style={{ width: '3%', background: '#EF4444' }} title="Out of Stock: 2" />
                        </div>
                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#737373' }}>
                          <span>Top: <strong>Arabica Beans</strong> (+24%)</span>
                          <span>Low: <strong>Matcha</strong> (6 remaining)</span>
                        </div>
                      </div>

                      {/* Orders by Week Analytics with Tooltips */}
                      <div className="dashboard-card">
                        <div className="card-header">
                          <span className="card-title">Orders by week</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534' }}>+14.8%</span>
                        </div>
                        <div className="spend-chart-container">
                          <div className="spend-chart-bars">
                            <div className="spend-col" tabIndex={0}>
                              <div className="chart-tooltip">W1: 18 orders</div>
                              <div className="spend-bar" style={{ height: '48%' }} />
                              <span className="spend-col-label">W1</span>
                            </div>
                            <div className="spend-col" tabIndex={0}>
                              <div className="chart-tooltip">W2: 24 orders</div>
                              <div className="spend-bar" style={{ height: '64%' }} />
                              <span className="spend-col-label">W2</span>
                            </div>
                            <div className="spend-col" tabIndex={0}>
                              <div className="chart-tooltip">W3: 29 orders</div>
                              <div className="spend-bar" style={{ height: '82%' }} />
                              <span className="spend-col-label">W3</span>
                            </div>
                            <div className="spend-col" tabIndex={0}>
                              <div className="chart-tooltip">W4: 34 orders (+14.8%)</div>
                              <div className="spend-bar active" style={{ height: '96%' }} />
                              <span className="spend-col-label">W4</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Wide Bento Tile: Horizontal Operational Order Pipeline */}
                    <div className={`dashboard-card pipeline-card ${activeFeature === 2 ? 'highlight-active-supplier' : ''}`}>
                      <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="card-title">Order Fulfillment Pipeline</span>
                          <span className="card-subtitle">Real-time café dispatch tracking</span>
                        </div>
                        <span className="status-pill status-available">
                          <span className="status-dot" aria-hidden="true" />
                          Live Queue
                        </span>
                      </div>

                      <div className="pipeline-steps">
                        <div className="pipeline-line-bg" />
                        <div className="pipeline-line-fill" />

                        <div className="pipeline-step-node completed">
                          <div className="pipeline-circle" aria-hidden="true">✓</div>
                          <span className="pipeline-step-title">Order received</span>
                          <span className="pipeline-step-count">12 queued</span>
                        </div>

                        <div className="pipeline-step-node completed">
                          <div className="pipeline-circle" aria-hidden="true">✓</div>
                          <span className="pipeline-step-title">Picking</span>
                          <span className="pipeline-step-count">8 in bin</span>
                        </div>

                        <div className="pipeline-step-node completed">
                          <div className="pipeline-circle" aria-hidden="true">✓</div>
                          <span className="pipeline-step-title">Packed</span>
                          <span className="pipeline-step-count">6 ready</span>
                        </div>

                        <div className="pipeline-step-node active">
                          <div className="pipeline-circle" aria-hidden="true">4</div>
                          <span className="pipeline-step-title">Dispatched</span>
                          <span className="pipeline-step-count" style={{ color: '#166534', fontWeight: 600 }}>4 on road</span>
                        </div>

                        <div className="pipeline-step-node">
                          <div className="pipeline-circle" aria-hidden="true">17</div>
                          <span className="pipeline-step-title">Delivered</span>
                          <span className="pipeline-step-count">17 today</span>
                        </div>
                      </div>

                      {/* Today's Deliveries quick list */}
                      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(23, 23, 23, 0.05)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div className="delivery-item-row">
                          <div>
                            <div style={{ fontWeight: 600, color: '#171717' }}>#GRB-1048 · Blue Tokai</div>
                            <div style={{ fontSize: '9.5px', color: '#737373' }}>ETA: 12:05 (In transit)</div>
                          </div>
                          <div className="delivery-prog-bar"><div className="delivery-prog-fill" style={{ width: '85%' }} /></div>
                        </div>

                        <div className="delivery-item-row">
                          <div>
                            <div style={{ fontWeight: 600, color: '#171717' }}>#GRB-1043 · Third Wave</div>
                            <div style={{ fontSize: '9.5px', color: '#737373' }}>ETA: 14:20 (Dispatched)</div>
                          </div>
                          <div className="delivery-prog-bar"><div className="delivery-prog-fill" style={{ width: '50%' }} /></div>
                        </div>

                        <div className="delivery-item-row">
                          <div>
                            <div style={{ fontWeight: 600, color: '#171717' }}>#GRB-1038 · Roastery</div>
                            <div style={{ fontSize: '9.5px', color: '#737373' }}>ETA: 16:30 (Packing)</div>
                          </div>
                          <div className="delivery-prog-bar"><div className="delivery-prog-fill" style={{ width: '25%' }} /></div>
                        </div>
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
                        <div className="dash-form-row">
                          <label className="dash-form-label" htmlFor="supplier-product-name">Product Name</label>
                          <input type="text" id="supplier-product-name" className="dash-form-input" defaultValue="Single Origin Cold Brew Concentrate" />
                        </div>
                        <div className="dash-form-row">
                          <label className="dash-form-label" htmlFor="supplier-category-select">Category</label>
                          <select className="dash-form-select" id="supplier-category-select">
                            <option>Coffee & Beans</option>
                            <option>Dairy & Plant Milks</option>
                            <option>Packaging & Cups</option>
                            <option>Tea & Beverage Bases</option>
                          </select>
                        </div>
                        <div className="dash-form-row">
                          <label className="dash-form-label" htmlFor="supplier-price-input">Wholesale Price (per unit/kg)</label>
                          <input type="text" id="supplier-price-input" className="dash-form-input" defaultValue="₹840" />
                        </div>
                        <div className="dash-modal-actions">
                          <button type="button" className="dash-btn-ghost" onClick={() => setShowAddProductModal(false)}>Cancel</button>
                          <button
                            type="button"
                            className="dash-btn-primary"
                            onClick={() => {
                              setShowAddProductModal(false);
                              showToast('Single Origin Cold Brew Concentrate published');
                            }}
                          >
                            Save SKU
                          </button>
                        </div>
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
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="section-eyebrow">FOR SUPPLIERS</span>
            <h2 className="section-title">
              Supply more.<br />
              Manage less.
            </h2>
            <p className="section-description">
              Keep products, orders, inventory and deliveries moving from one operational workspace.
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
                  <span className="feature-heading">Manage inventory.</span>
                  <span className="feature-text">Real-time SKU availability and batch control.</span>
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
                  <span className="feature-heading">Process café orders.</span>
                  <span className="feature-text">Instant purchase order approvals and invoicing.</span>
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
                  <span className="feature-heading">Coordinate deliveries.</span>
                  <span className="feature-text">5-stage verified dispatch and route tracking.</span>
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
}

const BRAND_CAMPAIGNS_DATA: BrandCampaign[] = [
  {
    title: 'Summer Cold Brew',
    cafes: '120 cafés',
    product: 'Cold Brew',
    status: 'Active',
    performance: '82%',
    reach: '120 cafés',
    orders: '1,284',
    revenue: '₹2.1L',
    period: '01 Sep → 30 Sep',
  },
  {
    title: 'Matcha Month',
    cafes: '85 cafés',
    product: 'Matcha',
    status: 'Scheduled',
    performance: 'Pending',
    reach: '85 cafés',
    orders: '420 pre-booked',
    revenue: '₹1.2L projected',
    period: '01 Oct → 31 Oct',
  },
  {
    title: 'Festive Blends',
    cafes: '210 cafés',
    product: 'Signature Blend',
    status: 'Completed',
    performance: '91%',
    reach: '210 cafés',
    orders: '2,940',
    revenue: '₹4.8L',
    period: '01 Aug → 31 Aug',
  },
];

function BrandSection({ isMobile }: { isMobile: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center 45%'],
  });

  // Right to Left scroll-driven entrance:
  // Symmetrical to Supplier section's left-to-right glide: Brand glides from right to left (+220px -> 0)
  const rawX = useTransform(scrollYProgress, [0, 1], [isMobile ? 70 : 220, 0]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.25, 0.88], [0, 0.4, 1]);
  const rawScale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);

  const springConfig = { stiffness: 90, damping: 20, mass: 0.35 };
  const brandX = useSpring(rawX, springConfig);
  const brandOpacity = useSpring(rawOpacity, springConfig);
  const brandScale = useSpring(rawScale, springConfig);

  // Desktop 3D Mouse Parallax (Symmetrical to Supplier: -4.5° Y tilt angled left towards editorial text)
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

  const brandRotateY = useTransform(smoothMouseX, (val) => -4.5 + val);
  const brandRotateX = useTransform(smoothMouseY, (val) => 3.5 + val);

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

  const brandCursorCoords = [
    { x: '55%', y: '165px', label: '142 Venues Filtered' },
    { x: '68%', y: '260px', label: 'Deploy Sampling Flight' },
    { x: '45%', y: '345px', label: '4.9★ Barista Approval' },
  ];

  const [activeFeature, setActiveFeature] = useState(0);
  const [selectedCampaign, setSelectedCampaign] = useState<BrandCampaign>(BRAND_CAMPAIGNS_DATA[0]);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
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
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredCampaigns = BRAND_CAMPAIGNS_DATA.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

          {/* Left: Minimal, Typographic Editorial (Symmetrical to Supplier) */}
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
              Launch targeted product campaigns, seed samples to verified venues, and measure real sell-through.
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
                  <span className="feature-heading">Find the right cafés.</span>
                  <span className="feature-text">Filter verified venues by location, volume, and tier.</span>
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
                  <span className="feature-heading">Launch products with precision.</span>
                  <span className="feature-text">Seed curated sampling flights and log direct barista feedback.</span>
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
                  <span className="feature-heading">Track product adoption.</span>
                  <span className="feature-text">Monitor reorder velocity and shelf turnover across cities.</span>
                </div>
              </div>

              <div
                className={`feature-item ${activeFeature === 3 ? 'active' : ''}`}
                onClick={() => setActiveFeature(3)}
                onMouseEnter={() => setActiveFeature(3)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveFeature(3);
                  }
                }}
                aria-pressed={activeFeature === 3}
              >
                <span className="feature-num">04</span>
                <div className="feature-content">
                  <span className="feature-heading">Measure campaign performance.</span>
                  <span className="feature-text">Track verifiable ROI and distributor sell-through.</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Dynamic 3D Tilted Product Interface with Google-Style Motion Workflow */}
          <div className="product-stage">
            <motion.div
              className="product-frame"
              style={{
                x: shouldReduceMotion ? 0 : brandX,
                y: 0,
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
                <span>app.grabbit.io/brand/campaigns</span>
              </div>
              <div className="browser-actions">
                <span className="browser-status-tag" style={{ background: '#F5F3FF', color: '#6D28D9', borderColor: '#DDD6FE' }}>Distribution Active</span>
                <div className="browser-user-badge">
                  <span className="browser-avatar" style={{ background: '#6D28D9' }}>OB</span>
                  <span>Origins Brand Co.</span>
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

              {/* Unified Grabbit Sidebar */}
              <aside className="dashboard-sidebar" aria-label="Brand Dashboard Navigation">
                <div>
                  <div className="sidebar-brand-header">
                    <div className="sidebar-grabbit-logo">
                      <span className="grabbit-mark" style={{ background: '#6D28D9' }}>G</span>
                      <span className="grabbit-name">Grabbit</span>
                    </div>
                    <span className="sidebar-org-sub">Brand OS</span>
                  </div>

                  <div className="sidebar-nav-section-label">Growth & Reach</div>
                  <nav className="sidebar-nav">
                    <button type="button" className="sidebar-item">
                      <SvgIcons.Overview />
                      <span>Overview</span>
                    </button>
                    <button type="button" className="sidebar-item">
                      <SvgIcons.Inventory />
                      <span>Products</span>
                    </button>
                    <button type="button" className="sidebar-item">
                      <SvgIcons.Network />
                      <span>Café Network</span>
                    </button>
                    <button type="button" className="sidebar-item active">
                      <SvgIcons.Campaigns />
                      <span>Campaigns</span>
                      <span className="sidebar-badge-count">4</span>
                    </button>
                    <button type="button" className="sidebar-item">
                      <SvgIcons.Analytics />
                      <span>Analytics</span>
                    </button>
                    <button type="button" className="sidebar-item">
                      <SvgIcons.Overview />
                      <span>Reports</span>
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
                  <div className="sidebar-pill-status" style={{ background: '#F5F3FF', color: '#6D28D9' }}>
                    <span className="status-dot-pulse" style={{ background: '#6D28D9' }} aria-hidden="true" />
                    <span>312 Cafés Reached</span>
                  </div>
                </div>
              </aside>

              {/* Main Operations Area */}
              <main className={`dashboard-main ${activeFeature !== null ? 'has-active-feature' : ''}`}>
                {/* Top Navigation */}
                <div className="dashboard-top-nav">
                  <div className="dashboard-heading-group">
                    <div className="dashboard-title-row">
                      <h3 className="dashboard-page-title">Campaigns</h3>
                      <span className="dash-date-indicator">Q3 · Active Cycle</span>
                    </div>
                    <span className="dashboard-page-subtitle">Launch and understand product distribution</span>
                  </div>

                  <div className="dashboard-top-nav-right">
                    <button type="button" className="dash-icon-btn" title="Search Campaigns" aria-label="Search Campaigns">
                      <SvgIcons.Search />
                    </button>
                    <button type="button" className="dash-icon-btn" title="Notifications" aria-label="Notifications">
                      <SvgIcons.Bell />
                      <span className="dash-notif-dot" />
                    </button>
                    <button
                      type="button"
                      className="dash-btn-primary"
                      onClick={() => setShowNewCampaignModal(true)}
                    >
                      <span>+</span>
                      <span>New Campaign</span>
                    </button>
                  </div>
                </div>

                {/* Brand KPI Area */}
                <div className="dashboard-overview-row">
                  <div className="dashboard-stat">
                    <span className="stat-label">Cafés reached</span>
                    <div className="stat-value">
                      <AnimatedCounter value={312} />
                    </div>
                    <div className="stat-trend positive">
                      <span>↑ +34 this month</span>
                      <span className="stat-context">across 7 metros</span>
                    </div>
                  </div>

                  <div className="dashboard-stat">
                    <span className="stat-label">Product adoption</span>
                    <div className="stat-value">
                      <AnimatedCounter value={68} suffix="%" />
                    </div>
                    <div className="stat-trend positive">
                      <span>↑ 5.4%</span>
                      <span className="stat-context">trial-to-reorder</span>
                    </div>
                  </div>

                  <div className="dashboard-stat">
                    <span className="stat-label">Campaign revenue</span>
                    <div className="stat-value">
                      <AnimatedCounter value={4.8} prefix="₹" suffix="L" decimals={1} />
                    </div>
                    <div className="stat-trend positive">
                      <span>↑ +22% ROI</span>
                      <span className="stat-context">4 active flights</span>
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
                          ? '142 Cafés Targeted'
                          : motionStep === 1
                          ? '1,500 Sample Kits Deployed'
                          : '94% Barista Approval · 78% Reorder'}
                      </span>
                    </div>
                    <span className="workflow-target-time">
                      {motionStep === 0
                        ? 'High-density metro coverage'
                        : motionStep === 1
                        ? 'Flights active in 3 cities'
                        : 'Surge sell-through recorded'}
                    </span>
                  </div>
                </div>

                {/* Control Bar */}
                <div className="dashboard-controls-bar">
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
                  </div>

                  <div className="dash-filter-group">
                    <span className="dash-filter-pill">Status: All</span>
                    <span className="dash-filter-pill">City: All Metros</span>
                    <span className="dash-filter-pill">Cycle: Q3 2026</span>
                  </div>
                </div>

                {/* Asymmetrical Bento: Campaigns Table + Detail/Analytics + Network & Adoption */}
                <div className="dashboard-bento">
                  {/* Left: Campaigns Table */}
                  <div className={`dashboard-card ${activeFeature === 1 ? 'highlight-active-brand' : ''}`} style={{ padding: '10px 12px' }}>
                    <div className="card-header">
                      <span className="card-title">Active Flights</span>
                      <span className="card-subtitle">Click row to review performance telemetry</span>
                    </div>

                    <div className="dashboard-table-container">
                      <table className="dashboard-table" role="table" aria-label="Brand active campaigns">
                        <thead>
                          <tr>
                            <th scope="col">Campaign</th>
                            <th scope="col">Cafés</th>
                            <th scope="col">Product</th>
                            <th scope="col">Status</th>
                            <th scope="col">Adoption</th>
                            <th scope="col" style={{ textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCampaigns.map((c) => (
                            <tr
                              key={c.title}
                              className={`dashboard-table-row ${selectedCampaign.title === c.title ? 'selected' : ''}`}
                              onClick={() => setSelectedCampaign(c)}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setSelectedCampaign(c);
                                }
                              }}
                              role="button"
                              aria-pressed={selectedCampaign.title === c.title}
                              aria-label={`Select campaign ${c.title}`}
                            >
                              <td className="table-cell-bold">{c.title}</td>
                              <td>{c.cafes}</td>
                              <td className="table-cell-sub">{c.product}</td>
                              <td>
                                <span className={`status-pill status-${c.status === 'Active' ? 'active' : c.status === 'Scheduled' ? 'scheduled' : 'completed'}`}>
                                  <span className="status-dot" aria-hidden="true" />
                                  {c.status}
                                </span>
                              </td>
                              <td className="table-cell-num">{c.performance}</td>
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

                    {/* Campaign Detail Panel */}
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(23, 23, 23, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#171717' }}>{selectedCampaign.title.toUpperCase()}</span>
                        <div style={{ fontSize: '9.5px', color: '#737373' }}>Period: {selectedCampaign.period} · {selectedCampaign.reach} · Orders: {selectedCampaign.orders}</div>
                      </div>
                      <button
                        type="button"
                        className="btn-reorder-micro"
                        style={{ background: '#EDE9FE', color: '#5B21B6', borderColor: '#DDD6FE' }}
                        onClick={() => showToast(`Full metrics report opened for ${selectedCampaign.title}`)}
                      >
                        View Campaign →
                      </button>
                    </div>
                  </div>

                  {/* Right: Abstract Café Network & Product Adoption */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Abstract Café Reach Cluster */}
                    <div className={`dashboard-card ${activeFeature === 0 ? 'highlight-active-brand' : ''}`}>
                      <div className="card-header">
                        <span className="card-title">Café Network Mesh</span>
                        <span className="card-subtitle">312 nodes · 7 metros</span>
                      </div>
                      <div className="network-viz-container">
                        <svg className="network-svg" viewBox="0 0 200 64" aria-label="Abstract network graph connecting Brand to 312 cafes">
                          {/* Connection Lines */}
                          <line x1="100" y1="32" x2="35" y2="18" stroke="#DDD6FE" strokeWidth="1.2" strokeDasharray="2,2" />
                          <line x1="100" y1="32" x2="45" y2="48" stroke="#DDD6FE" strokeWidth="1.2" strokeDasharray="2,2" />
                          <line x1="100" y1="32" x2="155" y2="20" stroke="#DDD6FE" strokeWidth="1.2" strokeDasharray="2,2" />
                          <line x1="100" y1="32" x2="165" y2="46" stroke="#DDD6FE" strokeWidth="1.2" strokeDasharray="2,2" />
                          <line x1="100" y1="32" x2="100" y2="12" stroke="#DDD6FE" strokeWidth="1.2" strokeDasharray="2,2" />
                          <line x1="100" y1="32" x2="100" y2="52" stroke="#DDD6FE" strokeWidth="1.2" strokeDasharray="2,2" />

                          {/* Outer Café Nodes */}
                          <circle cx="35" cy="18" r="4" fill="#C4B5FD" />
                          <circle cx="45" cy="48" r="4.5" fill="#A78BFA" />
                          <circle cx="155" cy="20" r="4" fill="#C4B5FD" />
                          <circle cx="165" cy="46" r="5" fill="#A78BFA" />
                          <circle cx="100" cy="12" r="3.5" fill="#DDD6FE" />
                          <circle cx="100" cy="52" r="4" fill="#DDD6FE" />

                          {/* Center Brand Hub */}
                          <circle cx="100" cy="32" r="8" fill="#6D28D9" />
                          <circle cx="100" cy="32" r="12" fill="none" stroke="#6D28D9" strokeWidth="1" opacity="0.3" />
                        </svg>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#6B5E87', marginTop: '6px' }}>
                        <span>68% active reorders</span>
                        <span style={{ fontWeight: 600, color: '#2E1065' }}>+34 venues this month</span>
                      </div>
                    </div>

                    {/* Product Adoption Breakdown */}
                    <div className={`dashboard-card ${activeFeature === 2 ? 'highlight-active-brand' : ''}`}>
                      <div className="card-header">
                        <span className="card-title">Product Adoption</span>
                        <span className="card-subtitle">Conversion by SKU</span>
                      </div>
                      <div className="inventory-list">
                        <div className="inventory-row">
                          <div className="inventory-row-header">
                            <span className="inventory-item-name">Cold Brew</span>
                            <span style={{ color: '#5B21B6', fontWeight: 600 }}>82%</span>
                          </div>
                          <div className="inventory-bar-bg">
                            <div className="inventory-bar-fill" style={{ width: '82%', background: '#6D28D9' }} />
                          </div>
                        </div>

                        <div className="inventory-row">
                          <div className="inventory-row-header">
                            <span className="inventory-item-name">Matcha</span>
                            <span style={{ color: '#7C3AED', fontWeight: 600 }}>68%</span>
                          </div>
                          <div className="inventory-bar-bg">
                            <div className="inventory-bar-fill" style={{ width: '68%', background: '#9333EA' }} />
                          </div>
                        </div>

                        <div className="inventory-row">
                          <div className="inventory-row-header">
                            <span className="inventory-item-name">Signature Blend</span>
                            <span style={{ color: '#5B21B6', fontWeight: 600 }}>54%</span>
                          </div>
                          <div className="inventory-bar-bg">
                            <div className="inventory-bar-fill" style={{ width: '54%', background: '#A78BFA' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wide Bento Tile: Campaign Lifecycle Timeline */}
                  <div className={`dashboard-card pipeline-card ${activeFeature === 3 ? 'highlight-active-brand' : ''}`}>
                    <div className="card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="card-title">Campaign Lifecycle Timeline</span>
                        <span className="card-subtitle">Flight verification and attribution</span>
                      </div>
                      <span className="status-pill status-active">
                        <span className="status-dot" aria-hidden="true" />
                        Flight Tracking
                      </span>
                    </div>

                    <div className="pipeline-steps">
                      <div className="pipeline-line-bg" />
                      <div className="pipeline-line-fill" style={{ background: '#6D28D9', width: '75%' }} />

                      <div className="pipeline-step-node completed">
                        <div className="pipeline-circle" style={{ background: '#6D28D9', borderColor: '#5B21B6' }} aria-hidden="true">✓</div>
                        <span className="pipeline-step-title">Campaign created</span>
                        <span className="pipeline-step-count">Scope & budget</span>
                      </div>

                      <div className="pipeline-step-node completed">
                        <div className="pipeline-circle" style={{ background: '#6D28D9', borderColor: '#5B21B6' }} aria-hidden="true">✓</div>
                        <span className="pipeline-step-title">Products selected</span>
                        <span className="pipeline-step-count">Cold brew kits</span>
                      </div>

                      <div className="pipeline-step-node completed">
                        <div className="pipeline-circle" style={{ background: '#6D28D9', borderColor: '#5B21B6' }} aria-hidden="true">✓</div>
                        <span className="pipeline-step-title">Cafés targeted</span>
                        <span className="pipeline-step-count">120 verified venues</span>
                      </div>

                      <div className="pipeline-step-node active">
                        <div className="pipeline-circle" style={{ borderColor: '#6D28D9', color: '#5B21B6' }} aria-hidden="true">4</div>
                        <span className="pipeline-step-title">Campaign launched</span>
                        <span className="pipeline-step-count" style={{ color: '#5B21B6', fontWeight: 600 }}>Active flight</span>
                      </div>

                      <div className="pipeline-step-node">
                        <div className="pipeline-circle" aria-hidden="true">5</div>
                        <span className="pipeline-step-title">Performance tracked</span>
                        <span className="pipeline-step-count">Conversion logged</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accessible New Campaign Modal */}
                {showNewCampaignModal && (
                  <div className="dash-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-brand-campaign-title">
                    <div className="dash-modal-card">
                      <div className="dash-modal-header">
                        <h4 className="dash-modal-title" id="modal-brand-campaign-title">Create Café Growth Campaign</h4>
                        <button
                          type="button"
                          className="dash-modal-close"
                          onClick={() => setShowNewCampaignModal(false)}
                          aria-label="Close modal"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="dash-form-row">
                        <label className="dash-form-label" htmlFor="brand-campaign-title">Campaign Title</label>
                        <input type="text" id="brand-campaign-title" className="dash-form-input" defaultValue="Nitro Cold Brew Fall Rollout" />
                      </div>
                      <div className="dash-form-row">
                        <label className="dash-form-label" htmlFor="brand-metro-select">Target Metro & Venue Tier</label>
                        <select className="dash-form-select" id="brand-metro-select">
                          <option>Tier 1 Specialty Cafés · Bangalore & Mumbai (150 venues)</option>
                          <option>Delhi NCR Specialty Bars (80 venues)</option>
                          <option>All Metros · High Footfall (300 venues)</option>
                        </select>
                      </div>
                      <div className="dash-form-row">
                        <label className="dash-form-label" htmlFor="brand-sampling-input">Sampling Units / Target Adoption</label>
                        <input type="text" id="brand-sampling-input" className="dash-form-input" defaultValue="1,500 sample kits · 75% target reorder" />
                      </div>
                      <div className="dash-modal-actions">
                        <button type="button" className="dash-btn-ghost" onClick={() => setShowNewCampaignModal(false)}>Cancel</button>
                        <button
                          type="button"
                          className="dash-btn-primary"
                          onClick={() => {
                            setShowNewCampaignModal(false);
                            showToast('Nitro Cold Brew Fall Rollout campaign flight initiated');
                          }}
                        >
                          Launch Flight
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
