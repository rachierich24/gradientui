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
    { x: '35%', y: '230px', label: 'Parse WhatsApp PO' },
    { x: '75%', y: '190px', label: 'Roast Batch #4 (180kg)' },
    { x: '75%', y: '295px', label: 'Dispatch Morning Fleet' },
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
                  className="dashboard-main"
                  data-lenis-prevent
                  tabIndex={0}
                  aria-label="Supplier operational workspace"
                >
                  {/* Top Navigation Bar */}
                  <div className="dashboard-top-nav">
                    <div className="dashboard-heading-group">
                      <div className="dashboard-title-row">
                        <h3 className="dashboard-page-title">Wholesale Operations</h3>
                        <span className="dash-date-indicator">Today · 27 Sep 2026</span>
                      </div>
                      <span className="dashboard-page-subtitle">RoastSupply & Dairy Co. · Bangalore Indiranagar Hub</span>
                    </div>

                    <div className="dashboard-top-nav-right">
                      <span className="status-pill status-available">
                        <span className="status-dot" aria-hidden="true" />
                        34 Orders Synced
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

                  {/* Linear Core Journey Pipeline (Clean & Minimal) */}
                  <div className="linear-core-pipeline" role="region" aria-label="Wholesale Lifecycle Pipeline">
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge">01 Ingest</span>
                      <span className="pipeline-step-title">WhatsApp POs</span>
                      <span className="pipeline-step-proof">34 Auto-Parsed</span>
                    </div>
                    <span className="pipeline-arrow-separator">➔</span>
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge">02 Production</span>
                      <span className="pipeline-step-title">Roast Batching</span>
                      <span className="pipeline-step-proof">180kg Scheduled</span>
                    </div>
                    <span className="pipeline-arrow-separator">➔</span>
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge">03 Dispatch</span>
                      <span className="pipeline-step-title">Morning Routes</span>
                      <span className="pipeline-step-proof">3 Vans · 07:30 Cutoff</span>
                    </div>
                    <span className="pipeline-arrow-separator">➔</span>
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge">04 Settlement</span>
                      <span className="pipeline-step-title">T+1 Bank Payout</span>
                      <span className="pipeline-step-proof">₹1.84L HDFC</span>
                    </div>
                  </div>

                  {/* Three High-Signal Metrics */}
                  <div className="dashboard-overview-row">
                    <div className="dashboard-stat">
                      <span className="stat-label">Today's Demand (34 Cafés)</span>
                      <div className="stat-value">₹1.84L</div>
                      <div className="stat-trend positive">
                        <span>↑ 18.4% volume</span>
                        <span className="stat-context">100% WhatsApp auto-parsed</span>
                      </div>
                    </div>

                    <div className="dashboard-stat">
                      <span className="stat-label">Batch Roast #4 Scheduled</span>
                      <div className="stat-value">180 kg</div>
                      <div className="stat-trend positive">
                        <span>● 06:00 AM Roaster 1</span>
                        <span className="stat-context">Arabica Medium Roast</span>
                      </div>
                    </div>

                    <div className="dashboard-stat">
                      <span className="stat-label">T+1 Automated Settlement</span>
                      <div className="stat-value" style={{ color: '#15803D' }}>₹1.84L</div>
                      <div className="stat-trend positive">
                        <span>✓ HDFC Disbursed</span>
                        <span className="stat-context">Zero bad debt guarantee</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean 2-Column Bento Workspace */}
                  <div className="dashboard-bento">
                    {/* Left: Live WhatsApp PO Stream */}
                    <div className="dashboard-card" style={{ padding: '10px 12px' }}>
                      <div className="card-header">
                        <div>
                          <span className="card-title">Live WhatsApp PO Stream</span>
                          <span className="card-subtitle">AI converts voice & text orders into verified POs</span>
                        </div>
                        <button
                          type="button"
                          className="table-action-btn"
                          style={{ background: '#DCFCE7', color: '#166534', borderColor: '#BBF7D0' }}
                          onClick={handleSimulateWhatsAppPO}
                        >
                          + Simulate Incoming PO
                        </button>
                      </div>

                      <div className="simple-order-list">
                        {whatsappPOs.slice(0, 2).map((po) => (
                          <div
                            key={po.id}
                            className="simple-order-card"
                            onClick={() => showToast(`Order manifest opened for ${po.cafe} (${po.amount})`)}
                          >
                            <div className="simple-card-header">
                              <span className="simple-card-title">{po.cafe}</span>
                              <span className={`status-pill status-${po.status === 'Picked' ? 'processing' : po.status === 'In Van #1' ? 'transit' : 'available'}`}>
                                <span className="status-dot" aria-hidden="true" />
                                {po.status}
                              </span>
                            </div>
                            <div className="simple-card-meta">{po.location} · {po.time}</div>
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
                      {/* Batch Roasting Card */}
                      <div className="dashboard-card" style={{ padding: '10px 12px' }}>
                        <div className="card-header">
                          <span className="card-title">⚡ Batch Roast #4</span>
                          <span style={{ fontSize: '9.5px', color: '#166534', fontWeight: 700 }}>180 kg Arabica</span>
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#64748B', marginBottom: '6px' }}>
                          Consolidated across 34 café POs · Scheduled 05:00 AM
                        </div>
                        <div style={{ height: '5px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden', marginBottom: '8px' }}>
                          <div style={{ width: '82%', height: '100%', background: '#16A34A', borderRadius: '99px' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#334155' }}>
                          <span>Roasted: <strong>148 kg</strong></span>
                          <span>Finishing: <strong>32 kg</strong></span>
                        </div>
                      </div>

                      {/* Morning Route Dispatch */}
                      <div className="dashboard-card" style={{ padding: '10px 12px' }}>
                        <div className="card-header">
                          <span className="card-title">🚚 Morning Fleet Clusters</span>
                          <span className="status-pill status-transit">07:30 Cutoff</span>
                        </div>
                        <div className="simple-route-strip">
                          <div className="simple-route-row">
                            <span><strong>Van #1</strong> (Driver: Ramesh)</span>
                            <span style={{ color: '#166534', fontWeight: 600 }}>14 Drops · Indiranagar</span>
                          </div>
                          <div className="simple-route-row">
                            <span><strong>Van #2</strong> (Driver: Suresh)</span>
                            <span style={{ color: '#166534', fontWeight: 600 }}>11 Drops · Koramangala</span>
                          </div>
                          <div className="simple-route-row">
                            <span><strong>Van #3</strong> (Driver: Imran)</span>
                            <span style={{ color: '#166534', fontWeight: 600 }}>9 Drops · CBD & Lavelle</span>
                          </div>
                        </div>
                      </div>

                      {/* Stripe Automated Bank Settlement Card */}
                      <div className="dashboard-card" style={{ padding: '10px 12px', background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                        <div className="card-header" style={{ marginBottom: '2px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#14532D' }}>T+1 Automated Bank Settlement</span>
                          <span style={{ fontSize: '9px', color: '#166534', fontWeight: 600 }}>UTR: HDFC-99281048</span>
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#166534', lineHeight: 1.4 }}>
                          <strong>₹1,84,200.00</strong> auto-disbursed at 06:00 AM IST directly to HDFC Bank account.
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #DCFCE7' }}>
                          <span style={{ fontSize: '9px', color: '#15803D', fontWeight: 700 }}>✓ Zero Bad Debt Escrow</span>
                          <button
                            type="button"
                            className="table-action-btn"
                            style={{ fontSize: '9px', padding: '2px 6px' }}
                            onClick={() => showToast('GST reconciliation ledger exported to Tally')}
                          >
                            Tally GST Sync
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  <span className="feature-heading">Manage inventory &amp; roast par.</span>
                  <span className="feature-text">Real-time SKU availability, roast-date batch control, and automated par alerts.</span>
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
                  <span className="feature-heading">Auto-parse WhatsApp orders.</span>
                  <span className="feature-text">AI converts voice notes and chats into structured digital POs in 3 seconds.</span>
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
    { x: '35%', y: '235px', label: 'Deploy Barista Sampling Flight' },
    { x: '75%', y: '190px', label: '94.2% SCA Cupping Score' },
    { x: '75%', y: '330px', label: 'Convert to Net-15 Standing PO' },
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
                  <span className="feature-heading">Target verified cafés by tier.</span>
                  <span className="feature-text">Filter high-volume specialty coffee bars across Bangalore, Mumbai, and Delhi NCR.</span>
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
                  <span className="feature-heading">Seed barista sampling flights.</span>
                  <span className="feature-text">Collect live sensory feedback, microfoam performance, and taste scorecards.</span>
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
                  <span className="feature-heading">Convert trials into recurring GMV.</span>
                  <span className="feature-text">78% of approved trials convert into weekly automatic wholesale replenishment.</span>
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
                  className="dashboard-main"
                  tabIndex={0}
                  data-lenis-prevent
                  aria-label="Brand growth and telemetry workspace"
                >
                  {/* Top Navigation */}
                  <div className="dashboard-top-nav">
                    <div className="dashboard-heading-group">
                      <div className="dashboard-title-row">
                        <h3 className="dashboard-page-title">Brand OS Telemetry</h3>
                        <span className="dash-date-indicator">Q3 · Active Distribution</span>
                      </div>
                      <span className="dashboard-page-subtitle">Origins Beverage &amp; Oat Co. · Specialty Café Distribution</span>
                    </div>

                    <div className="dashboard-top-nav-right">
                      <span className="status-pill" style={{ background: '#F5F3FF', color: '#6D28D9', borderColor: '#DDD6FE' }}>
                        <span className="status-dot" style={{ background: '#7C3AED' }} aria-hidden="true" />
                        312 Cafés Reached
                      </span>
                      <button
                        type="button"
                        className="dash-btn-primary"
                        style={{ background: '#7C3AED' }}
                        onClick={() => setShowNewCampaignModal(true)}
                      >
                        <span>+</span>
                        <span>Deploy Sampling Flight</span>
                      </button>
                    </div>
                  </div>

                  {/* Linear Core Journey Pipeline */}
                  <div className="linear-core-pipeline" role="region" aria-label="Brand Distribution Lifecycle Pipeline">
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge" style={{ color: '#7C3AED', background: '#F5F3FF' }}>01 Seed</span>
                      <span className="pipeline-step-title">Sampling Flights</span>
                      <span className="pipeline-step-proof">312 Cafés</span>
                    </div>
                    <span className="pipeline-arrow-separator">➔</span>
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge" style={{ color: '#7C3AED', background: '#F5F3FF' }}>02 Cupping</span>
                      <span className="pipeline-step-title">Barista Feedback</span>
                      <span className="pipeline-step-proof">94.2% Approval</span>
                    </div>
                    <span className="pipeline-arrow-separator">➔</span>
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge" style={{ color: '#7C3AED', background: '#F5F3FF' }}>03 Convert</span>
                      <span className="pipeline-step-title">Standing POs</span>
                      <span className="pipeline-step-proof">78% Reorder Rate</span>
                    </div>
                    <span className="pipeline-arrow-separator">➔</span>
                    <div className="pipeline-stage">
                      <span className="pipeline-step-badge" style={{ color: '#7C3AED', background: '#F5F3FF' }}>04 Velocity</span>
                      <span className="pipeline-step-title">Direct Telemetry</span>
                      <span className="pipeline-step-proof">₹4.82L/mo MRR</span>
                    </div>
                  </div>

                  {/* Three High-Signal Metrics */}
                  <div className="dashboard-overview-row">
                    <div className="dashboard-stat">
                      <span className="stat-label">Active Specialty Cafés</span>
                      <div className="stat-value" style={{ color: '#6D28D9' }}>312</div>
                      <div className="stat-trend positive">
                        <span>↑ 28 New this month</span>
                        <span className="stat-context">Bangalore, Mumbai, Delhi</span>
                      </div>
                    </div>

                    <div className="dashboard-stat">
                      <span className="stat-label">Barista Sensory Approval</span>
                      <div className="stat-value">94.2%</div>
                      <div className="stat-trend positive">
                        <span>★ 4.9 / 5.0 (SCA scale)</span>
                        <span className="stat-context">141 Cupping reviews logged</span>
                      </div>
                    </div>

                    <div className="dashboard-stat">
                      <span className="stat-label">Recurring Wholesale GMV</span>
                      <div className="stat-value" style={{ color: '#15803D' }}>₹4.82L</div>
                      <div className="stat-trend positive">
                        <span>✓ 78% Trial Reorder</span>
                        <span className="stat-context">Standing weekly Net-15 POs</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean 2-Column Bento Workspace */}
                  <div className="dashboard-bento">
                    {/* Left: Active Sampling Flights */}
                    <div className="dashboard-card" style={{ padding: '10px 12px' }}>
                      <div className="card-header">
                        <div>
                          <span className="card-title">Active Sampling Flights</span>
                          <span className="card-subtitle">Direct seeding to verified barista stations</span>
                        </div>
                        <button
                          type="button"
                          className="table-action-btn"
                          style={{ background: '#F5F3FF', color: '#6D28D9', borderColor: '#DDD6FE' }}
                          onClick={() => setShowNewCampaignModal(true)}
                        >
                          + New Flight
                        </button>
                      </div>

                      <div className="simple-flight-list">
                        {campaigns.slice(0, 2).map((c) => (
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
                            <div className="simple-card-meta">{c.metro} · {c.cafes} · {c.period}</div>
                            <div className="simple-card-body">{c.product} — seeded directly to espresso stations</div>
                            <div className="simple-card-footer">
                              <span style={{ color: '#6D28D9', fontWeight: 600 }}>★ {c.approval} ({c.reorderRate} reorder)</span>
                              <span style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono, monospace)' }}>{c.revenue} GMV</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Barista Scorecard & Wholesale Conversion Engine */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Barista Sensory Scorecard */}
                      <div className="dashboard-card" style={{ padding: '10px 12px' }}>
                        <div className="card-header">
                          <span className="card-title">☕ Barista Cupping Scorecard</span>
                          <span style={{ fontSize: '9.5px', color: '#7C3AED', fontWeight: 700 }}>94.2% (SCA Standard)</span>
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#64748B', marginBottom: '8px' }}>
                          Aggregated from 141 blind cupping trials across 3 metros
                        </div>

                        {/* Attribute progress bars */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#334155', marginBottom: '2px' }}>
                              <span>Microfoam Gloss &amp; Texture</span>
                              <strong>9.8 / 10</strong>
                            </div>
                            <div style={{ height: '4px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden' }}>
                              <div style={{ width: '98%', height: '100%', background: '#7C3AED', borderRadius: '99px' }} />
                            </div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#334155', marginBottom: '2px' }}>
                              <span>Steam Stability (Past 65°C)</span>
                              <strong>9.6 / 10</strong>
                            </div>
                            <div style={{ height: '4px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden' }}>
                              <div style={{ width: '96%', height: '100%', background: '#7C3AED', borderRadius: '99px' }} />
                            </div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#334155', marginBottom: '2px' }}>
                              <span>Acidity Balance in Light Roasts</span>
                              <strong>9.4 / 10</strong>
                            </div>
                            <div style={{ height: '4px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden' }}>
                              <div style={{ width: '94%', height: '100%', background: '#7C3AED', borderRadius: '99px' }} />
                            </div>
                          </div>
                        </div>

                        {/* Recent Barista quote */}
                        <div style={{ padding: '6px 8px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid rgba(23, 23, 23, 0.05)', fontSize: '9px', color: '#475569', fontStyle: 'italic', lineHeight: 1.35 }}>
                          &ldquo;Microfoam holds glossy latte art past 65°C with zero curdling in high-acidity roasts.&rdquo;
                          <div style={{ fontStyle: 'normal', fontWeight: 600, color: '#1E293B', marginTop: '3px' }}>
                            — Head Barista Vikram, Third Wave Coffee
                          </div>
                        </div>
                      </div>

                      {/* Standing Wholesale Reorder Engine */}
                      <div className="dashboard-card" style={{ padding: '10px 12px', background: '#FAF5FF', borderColor: '#E9D5FF' }}>
                        <div className="card-header" style={{ marginBottom: '2px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#581C87' }}>Wholesale Conversion Engine</span>
                          <span style={{ fontSize: '9px', color: '#7C3AED', fontWeight: 600 }}>Net-15 Auto-Debit</span>
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#6B21A8', lineHeight: 1.4 }}>
                          <strong>78% of approved tastings</strong> automatically convert to weekly recurring wholesale orders.
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #F3E8FF' }}>
                          <span style={{ fontSize: '9px', color: '#7C3AED', fontWeight: 700 }}>₹4.82L Active Monthly GMV</span>
                          <button
                            type="button"
                            className="table-action-btn"
                            style={{ fontSize: '9px', padding: '2px 6px' }}
                            onClick={() => showToast('Dispatched 20 additional barista tasting flights')}
                          >
                            + Seed 20 Cafés
                          </button>
                        </div>
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
