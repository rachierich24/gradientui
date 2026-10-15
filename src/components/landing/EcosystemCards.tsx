'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Icon } from './icons';

// ─── VERIFIED LIVE PLATFORMS FOR THE THREE SIDES OF THE ECOSYSTEM ───
const ECOSYSTEM_LINKS = {
  cafes: 'https://cafe.gradient365.com',
  suppliers: 'https://supplier.gradient365.com',
  brands: 'https://brand.gradient365.com',
};

// ─── RICH, AUTHENTIC UI MOCKUP COMPONENTS ───

const CafePreview = ({
  large = false,
  onOpen,
}: {
  large?: boolean;
  onOpen?: () => void;
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Beans' | 'Dairy' | 'Syrups'>('All');
  const [addedItems, setAddedItems] = useState<Record<string, number>>({});
  const [cartCount, setCartCount] = useState(2);
  const [totalPrice, setTotalPrice] = useState(1240);

  const handleAdd = (id: string, name: string, price: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddedItems((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setCartCount((c) => c + 1);
    setTotalPrice((t) => t + price);
  };

  return (
    <div className={`mock-preview-shell is-cafe ${large ? 'is-large' : ''}`}>
      {!large && (
        <div className="eco-preview-chrome">
          <div className="eco-preview-dots">
            <div className="eco-preview-dot is-red" />
            <div className="eco-preview-dot is-yellow" />
            <div className="eco-preview-dot is-green" />
          </div>
          <a
            href={ECOSYSTEM_LINKS.cafes}
            target="_blank"
            rel="noopener noreferrer"
            className="eco-preview-address is-link"
            onClick={(e) => e.stopPropagation()}
            title="Visit cafe.gradient365.com"
          >
            <span className="eco-address-lock">🔒</span> cafe.gradient365.com <span className="eco-address-ext">↗</span>
          </a>
        </div>
      )}

      {/* Search & Filter Header */}
      <div className="mock-cafe-header">
        <div className="mock-cafe-search">
          <Icon.Search size={large ? 13 : 10} />
          <span>Search beans, milks, syrups...</span>
        </div>
        <div className="mock-cafe-pill-row">
          {(['All', 'Beans', 'Dairy', ...(large ? ['Syrups'] : [])] as const).map((pill) => (
            <button
              key={pill}
              type="button"
              className={`mock-cafe-pill ${activeFilter === pill ? 'is-active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveFilter(pill as 'All' | 'Beans' | 'Dairy' | 'Syrups');
              }}
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className={`mock-cafe-content ${large ? 'is-large' : ''}`}>
        {/* Product 1: Arabica Beans */}
        {(activeFilter === 'All' || activeFilter === 'Beans') && (
          <div className="mock-cafe-card">
            <div className="mock-cafe-img-wrap">
              <img
                src="/landing/spotlight/arabica-beans.jpg"
                alt="Arabica Estate Beans"
                className="mock-cafe-img-photo"
                loading="lazy"
              />
              <span className="mock-cafe-tag">Verified</span>
            </div>
            <div className="mock-cafe-card-info">
              <div className="mock-cafe-card-name">Arabica Estate AA</div>
              <div className="mock-cafe-card-meta">
                <span className="mock-cafe-card-price">₹820 / kg</span>
                <button
                  type="button"
                  className={`mock-cafe-add-btn ${addedItems['arabica'] ? 'is-added' : ''}`}
                  onClick={(e) => handleAdd('arabica', 'Arabica Estate AA', 820, e)}
                >
                  {addedItems['arabica'] ? `Added (${addedItems['arabica']})` : '+ Quick PO'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product 2: Barista Oat Milk */}
        {(activeFilter === 'All' || activeFilter === 'Dairy') && (
          <div className="mock-cafe-card">
            <div className="mock-cafe-img-wrap">
              <img
                src="/landing/spotlight/barista-oat-carton.jpg"
                alt="Barista Oat Milk"
                className="mock-cafe-img-photo"
                loading="lazy"
              />
              <span className="mock-cafe-tag">Verified</span>
            </div>
            <div className="mock-cafe-card-info">
              <div className="mock-cafe-card-name">Barista Oat Milk 1L</div>
              <div className="mock-cafe-card-meta">
                <span className="mock-cafe-card-price">₹420 / L</span>
                <button
                  type="button"
                  className={`mock-cafe-add-btn ${addedItems['oat'] ? 'is-added' : ''}`}
                  onClick={(e) => handleAdd('oat', 'Barista Oat Milk 1L', 420, e)}
                >
                  {addedItems['oat'] ? `Added (${addedItems['oat']})` : '+ Quick PO'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product 3 (Shown in large modal or when Syrups selected) */}
        {large && (activeFilter === 'All' || activeFilter === 'Syrups') && (
          <div className="mock-cafe-card">
            <div className="mock-cafe-img-wrap">
              <img
                src="/landing/spotlight/caramel-syrup-bottle.jpg"
                alt="Caramel Artisan Syrup"
                className="mock-cafe-img-photo"
                loading="lazy"
              />
              <span className="mock-cafe-tag">Verified</span>
            </div>
            <div className="mock-cafe-card-info">
              <div className="mock-cafe-card-name">Caramel Artisan Syrup</div>
              <div className="mock-cafe-card-meta">
                <span className="mock-cafe-card-price">₹680 / btl</span>
                <button
                  type="button"
                  className={`mock-cafe-add-btn ${addedItems['caramel'] ? 'is-added' : ''}`}
                  onClick={(e) => handleAdd('caramel', 'Caramel Artisan Syrup', 680, e)}
                >
                  {addedItems['caramel'] ? `Added (${addedItems['caramel']})` : '+ Quick PO'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Live Cart Bar */}
      {large ? (
        <a
          href={ECOSYSTEM_LINKS.cafes}
          target="_blank"
          rel="noopener noreferrer"
          className="mock-cafe-bottom-strip is-clickable-cart"
          onClick={(e) => e.stopPropagation()}
          title="Open live PO order on cafe.gradient365.com"
        >
          <div className="mock-cafe-cart-info">
            <span className="mock-cafe-cart-badge">{cartCount} items</span>
            <span className="mock-cafe-cart-total">₹{totalPrice.toLocaleString()} PO batch</span>
          </div>
          <div className="mock-cafe-dispatch-pill">
            <span>⚡ Next-Day 8 AM</span>
            <span className="mock-cafe-checkout-arrow">↗</span>
          </div>
        </a>
      ) : (
        <div
          className="mock-cafe-bottom-strip is-clickable-cart"
          title="Click to expand cafe tab"
          onClick={(e) => {
            e.stopPropagation();
            onOpen?.();
          }}
        >
          <div className="mock-cafe-cart-info">
            <span className="mock-cafe-cart-badge">{cartCount} items</span>
            <span className="mock-cafe-cart-total">₹{totalPrice.toLocaleString()} PO batch</span>
          </div>
          <div className="mock-cafe-dispatch-pill">
            <span>⚡ Next-Day 8 AM</span>
            <span className="mock-cafe-checkout-arrow">→</span>
          </div>
        </div>
      )}
    </div>
  );
};

const SupplierPreview = ({
  large = false,
  onOpen,
}: {
  large?: boolean;
  onOpen?: () => void;
}) => {
  const [selectedTab, setSelectedTab] = useState<'orders' | 'fleet' | 'analytics'>('orders');
  const [activeRow, setActiveRow] = useState<number | null>(null);

  return (
    <div className={`mock-preview-shell is-supplier ${large ? 'is-large' : ''}`}>
      {!large && (
        <div className="eco-preview-chrome">
          <div className="eco-preview-dots">
            <div className="eco-preview-dot is-red" />
            <div className="eco-preview-dot is-yellow" />
            <div className="eco-preview-dot is-green" />
          </div>
          <a
            href={ECOSYSTEM_LINKS.suppliers}
            target="_blank"
            rel="noopener noreferrer"
            className="eco-preview-address is-link"
            onClick={(e) => e.stopPropagation()}
            title="Visit supplier.gradient365.com"
          >
            <span className="eco-address-lock">🔒</span> supplier.gradient365.com <span className="eco-address-ext">↗</span>
          </a>
        </div>
      )}

      <div className="mock-sup-split">
        {/* Dark Green Sidebar with Icons */}
        <div className="mock-sup-sidebar">
          <button
            type="button"
            className={`mock-sup-icon ${selectedTab === 'orders' ? 'is-active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTab('orders');
            }}
            title="Orders Feed"
          >
            <Icon.Box size={large ? 16 : 12} />
          </button>
          <button
            type="button"
            className={`mock-sup-icon ${selectedTab === 'fleet' ? 'is-active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTab('fleet');
            }}
            title="Fleet Dispatch"
          >
            <Icon.Truck size={large ? 16 : 12} />
          </button>
          <button
            type="button"
            className={`mock-sup-icon ${selectedTab === 'analytics' ? 'is-active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTab('analytics');
            }}
            title="SLA Analytics"
          >
            <Icon.Chart size={large ? 16 : 12} />
          </button>
        </div>

        {/* Main Fulfillment Feed */}
        <div className="mock-sup-main">
          {/* KPI Row */}
          <div className="mock-sup-kpi">
            <div className="mock-sup-kpi-box">
              <div className="mock-sup-kpi-top">
                <span className="mock-sup-kpi-val">39</span>
                <span className="mock-sup-kpi-trend">+14%</span>
              </div>
              <div className="mock-sup-kpi-lbl">Orders Today</div>
            </div>
            <div className="mock-sup-kpi-box">
              <div className="mock-sup-kpi-top">
                <span className="mock-sup-kpi-val">98.8%</span>
                <span className="mock-sup-kpi-trend is-sla">Target</span>
              </div>
              <div className="mock-sup-kpi-lbl">On-Time SLA</div>
            </div>
          </div>

          {/* Live Orders Stream */}
          <div className="mock-sup-orders-list">
            {[
              { id: '#GRB-1049', cafe: 'Blue Tokai · 12kg', badge: 'New PO', badgeClass: 'is-new' },
              { id: '#GRB-1048', cafe: 'Third Wave · 24L', badge: 'Fulfilling', badgeClass: 'is-transit' },
              { id: '#GRB-1047', cafe: 'Subko Roasters · 6pk', badge: 'Dispatched', badgeClass: 'is-dispatched' },
              ...(large
                ? [{ id: '#GRB-1046', cafe: 'Araku Coffee · 18kg', badge: 'Ready', badgeClass: 'is-new' }]
                : []),
            ].map((order, idx) => (
              <div
                key={order.id}
                className={`mock-sup-row ${activeRow === idx ? 'is-selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveRow(activeRow === idx ? null : idx);
                }}
              >
                <div className="mock-sup-row-left">
                  <span className="mock-sup-order-id">{order.id}</span>
                  <span className="mock-sup-order-cafe">{order.cafe}</span>
                </div>
                <span className={`mock-sup-badge ${order.badgeClass}`}>{order.badge}</span>
              </div>
            ))}
          </div>

          {/* Bottom Fleet Status Bar */}
          {large ? (
            <a
              href={ECOSYSTEM_LINKS.suppliers}
              target="_blank"
              rel="noopener noreferrer"
              className="mock-sup-bottom-strip is-clickable-fleet"
              onClick={(e) => e.stopPropagation()}
              title="Open Live Fleet Route on supplier.gradient365.com"
            >
              <div className="mock-sup-fleet-status">
                <span className="mock-sup-fleet-dot" />
                <span className="mock-sup-fleet-text">Fleet Route #3 · 4 drops remaining</span>
              </div>
              <span className="mock-sup-eta">ETA 11:20 AM ↗</span>
            </a>
          ) : (
            <div
              className="mock-sup-bottom-strip is-clickable-fleet"
              title="Click to expand supplier tab"
              onClick={(e) => {
                e.stopPropagation();
                onOpen?.();
              }}
            >
              <div className="mock-sup-fleet-status">
                <span className="mock-sup-fleet-dot" />
                <span className="mock-sup-fleet-text">Fleet Route #3 · 4 drops remaining</span>
              </div>
              <span className="mock-sup-eta">ETA 11:20 AM →</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BrandPreview = ({
  large = false,
  onOpen,
}: {
  large?: boolean;
  onOpen?: () => void;
}) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const bars = [
    { height: 42, label: 'W1', value: '42 POs · ₹3.4L' },
    { height: 60, label: 'W2', value: '60 POs · ₹4.9L' },
    { height: 78, label: 'W3', value: '78 POs · ₹6.2L' },
    { height: 95, label: 'W4', value: '95 POs · ₹7.8L' },
    { height: 68, label: 'W5', value: '68 POs · ₹5.5L' },
  ];

  return (
    <div className={`mock-preview-shell is-brand ${large ? 'is-large' : ''}`}>
      {!large && (
        <div className="eco-preview-chrome">
          <div className="eco-preview-dots">
            <div className="eco-preview-dot is-red" />
            <div className="eco-preview-dot is-yellow" />
            <div className="eco-preview-dot is-green" />
          </div>
          <a
            href={ECOSYSTEM_LINKS.brands}
            target="_blank"
            rel="noopener noreferrer"
            className="eco-preview-address is-link"
            onClick={(e) => e.stopPropagation()}
            title="Visit brand.gradient365.com"
          >
            <span className="eco-address-lock">🔒</span> brand.gradient365.com <span className="eco-address-ext">↗</span>
          </a>
        </div>
      )}

      {/* Header */}
      <div className="mock-brand-header">
        <div className="mock-brand-title-wrap">
          <div className="mock-brand-title">Café Adoption</div>
          <div className="mock-brand-sub">Demand velocity</div>
        </div>
        <span className="mock-brand-period-pill">Last 30 days</span>
      </div>

      {/* Animated Bar Chart */}
      <div className="mock-brand-chart">
        {bars.map((bar, i) => (
          <div
            key={i}
            className="mock-brand-bar-col"
            onMouseEnter={() => setHoveredBar(i)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            {hoveredBar === i && <div className="mock-brand-tooltip">{bar.value}</div>}
            <div className="mock-brand-bar">
              <motion.div
                className="mock-brand-bar-fill"
                initial={{ height: '0%' }}
                animate={{ height: `${bar.height}%` }}
                transition={{ duration: 1.1, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="mock-brand-bar-lbl">{bar.label}</span>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="mock-brand-stats">
        <div className="mock-brand-stat-box">
          <div className="mock-brand-stat-top">
            <span className="mock-brand-stat-val">124</span>
            <span className="mock-brand-stat-trend">+18.4%</span>
          </div>
          <div className="mock-brand-stat-lbl">Cafés Reached</div>
        </div>
        <div className="mock-brand-stat-box">
          <div className="mock-brand-stat-top">
            <span className="mock-brand-stat-val">25.0%</span>
            <span className="mock-brand-stat-trend">+4.2%</span>
          </div>
          <div className="mock-brand-stat-lbl">Repeat POs</div>
        </div>
      </div>

      {/* Bottom Top-SKUs Feed */}
      {large ? (
        <a
          href={ECOSYSTEM_LINKS.brands}
          target="_blank"
          rel="noopener noreferrer"
          className="mock-brand-bottom-strip is-clickable-brand"
          onClick={(e) => e.stopPropagation()}
          title="View SKU Intelligence on brand.gradient365.com"
        >
          <div className="mock-brand-sku-row">
            <span className="mock-brand-sku-name">Arabica Estate AA</span>
            <span className="mock-brand-sku-metric">88 cafés · 94% retention</span>
          </div>
          <div className="mock-brand-sku-row">
            <span className="mock-brand-sku-name">Barista Oat Milk</span>
            <span className="mock-brand-sku-metric">64 cafés · 89% retention ↗</span>
          </div>
        </a>
      ) : (
        <div
          className="mock-brand-bottom-strip is-clickable-brand"
          title="Click to expand brand tab"
          onClick={(e) => {
            e.stopPropagation();
            onOpen?.();
          }}
        >
          <div className="mock-brand-sku-row">
            <span className="mock-brand-sku-name">Arabica Estate AA</span>
            <span className="mock-brand-sku-metric">88 cafés · 94% retention</span>
          </div>
          <div className="mock-brand-sku-row">
            <span className="mock-brand-sku-name">Barista Oat Milk</span>
            <span className="mock-brand-sku-metric">64 cafés · 89% retention →</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── STAKEHOLDER CARDS CONFIG ───

const CARDS = [
  {
    id: 'cafes',
    index: '01',
    title: 'CAFÉS',
    visitLabel: 'VISIT CAFÉ PLATFORM',
    tagline: 'THE SOURCING ENGINE',
    theme: 'cafe',
    color: '#E03527',
    desc: 'Run your café from sourcing to delivery.',
    headline: 'Run your café from sourcing to delivery',
    expandedTitle: 'Everything your café needs to run smoothly.',
    expandedDesc:
      'Discover verified roasters and suppliers, order specialty beans and dairy, track real-time dispatches, and optimize procurement from a single dashboard.',
    features: [
      'Multi-supplier marketplace catalog',
      'Automated recurring purchase orders',
      'Live delivery dispatch tracking',
      'Real-time inventory low-stock alerts',
      'Consolidated monthly supplier invoices',
    ],
    link: ECOSYSTEM_LINKS.cafes,
    miniPreview: (onOpen?: () => void) => <CafePreview onOpen={onOpen} />,
    largePreview: <CafePreview large />,
  },
  {
    id: 'suppliers',
    index: '02',
    title: 'SUPPLIERS',
    visitLabel: 'VISIT SUPPLIER PLATFORM',
    tagline: 'THE DISPATCH NETWORK',
    theme: 'supplier',
    color: '#22C55E',
    desc: 'Receive wholesale orders and manage dispatch.',
    headline: 'Receive wholesale orders and run dispatch',
    expandedTitle: 'Fulfill wholesale demand without paperwork chaos.',
    expandedDesc:
      'Receive inbound café purchase orders instantly, streamline fulfillment queues, route local delivery fleets, and guarantee 99%+ on-time SLAs.',
    features: [
      'Instant PO notification & digital confirmation',
      'Automated batch picking & packing lists',
      'Fleet dispatch routing & delivery tracking',
      'Live inventory SKU sync across all accounts',
      'Real-time SLA performance & fulfillment score',
    ],
    link: ECOSYSTEM_LINKS.suppliers,
    miniPreview: (onOpen?: () => void) => <SupplierPreview onOpen={onOpen} />,
    largePreview: <SupplierPreview large />,
  },
  {
    id: 'brands',
    index: '03',
    title: 'BRANDS',
    visitLabel: 'VISIT BRAND PLATFORM',
    tagline: 'THE DEMAND RADAR',
    theme: 'brand',
    color: '#6D28D9',
    desc: 'Understand café adoption and distribution.',
    headline: 'See where café demand is growing',
    expandedTitle: 'See exactly where café demand is growing.',
    expandedDesc:
      'Gain real-time visibility into HORECA product adoption, monitor repeat reorder velocity across independent cafés, and track regional SKU market share.',
    features: [
      'Regional café distribution & adoption map',
      'Repeat reorder velocity & retention cohorts',
      'Product SKU performance benchmarking',
      'Predictive wholesale demand forecasting',
      'Real-time brand GMV analytics & growth insights',
    ],
    link: ECOSYSTEM_LINKS.brands,
    miniPreview: (onOpen?: () => void) => <BrandPreview onOpen={onOpen} />,
    largePreview: <BrandPreview large />,
  },
];

// ─── TAB WINDOW ANIMATION VARIANTS (CLEAN, GPU-ACCELERATED TRANSITIONS) ───

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

const tabWindowVariants = {
  initial: {
    opacity: 0,
    scale: 0.94,
    y: 18,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 12,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// ─── MAIN COMPONENT ───

export function EcosystemCards() {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const isReduced = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling and manage Lenis virtual scroll
  useEffect(() => {
    if (activeCardId) {
      document.body.style.overflow = 'hidden';
      const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
      lenis?.stop();
    } else {
      document.body.style.overflow = '';
      const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
      const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
      lenis?.start();
    };
  }, [activeCardId]);

  // Open modal tab directly
  const openCard = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setActiveCardId(id);
  };

  // Switch tabs inside the open window
  const switchPlatformTab = (newId: string) => {
    setActiveCardId(newId);
  };

  // Close / minimize window back into the card
  const closeCard = () => {
    setActiveCardId(null);
  };

  // Close on Escape key or switch tabs on 1, 2, 3
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeCardId) {
        closeCard();
      } else if (activeCardId) {
        if (e.key === '1') switchPlatformTab('cafes');
        if (e.key === '2') switchPlatformTab('suppliers');
        if (e.key === '3') switchPlatformTab('brands');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCardId]);

  const activeCard = CARDS.find((c) => c.id === activeCardId) || CARDS[0];

  return (
    <section className="eco-section" id="ecosystem-cards" aria-label="The Gradient Ecosystem">
      <div className="eco-cards-container eco-container">
        {/* Section Header */}
        <motion.div
          className="eco-header"
          initial={isReduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eco-header-eyebrow">THE GRADIENT ECOSYSTEM</span>
          <h2 className="eco-header-title">Built for every side of the supply chain.</h2>
          <p className="eco-header-desc">
            One connected network for cafés, suppliers, and brands. Food supply, live catalogues, and order management made simple.
          </p>
        </motion.div>

        {/* 3 Cards Grid */}
        <div className="eco-grid">
          {CARDS.map((card, i) => {
            const isDimmed = activeCardId !== null && activeCardId !== card.id;
            const isActive = activeCardId === card.id;

            return (
              <motion.div
                key={card.id}
                className="eco-card-wrapper"
                initial={isReduced ? { opacity: 1 } : { opacity: 0, y: 32 + i * 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className={`eco-card ${isDimmed ? 'is-dimmed' : ''} ${isActive ? 'is-active-tab' : ''}`}
                  data-eco-card-id={card.id}
                  onClick={(e) => openCard(card.id, e)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${card.title} platform tab`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openCard(card.id);
                    }
                  }}
                >
                  <div className="eco-card-inner">
                    <div className="eco-bento-head">
                      <span className="eco-bento-label"><i />{card.index} · {card.title}</span>
                      <h3 className="eco-bento-title">{card.headline}</h3>
                      <button
                        type="button"
                        className="eco-bento-expand"
                        onClick={(e) => openCard(card.id, e)}
                        aria-label={`Expand ${card.title} platform`}
                      >
                        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" /></svg>
                      </button>
                    </div>

                    <div
                      className="eco-preview-container"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCard(card.id, e);
                      }}
                    >
                      {card.miniPreview(() => openCard(card.id))}
                    </div>

                    <div className="eco-bento-foot">
                      <span className="eco-bento-domain">{card.link.replace('https://', '')}</span>
                      <a
                        href={card.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="eco-bento-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit platform <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Expanded Interactive macOS Tab Window Rendered in Portal */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeCardId && (
            <motion.div
              key="eco-tab-overlay"
              className="eco-tab-overlay"
              variants={overlayVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={closeCard}
            >
              {/* Dynamic ambient color glow */}
              <div
                className="eco-tab-ambient-glow"
                style={{
                  background: `radial-gradient(ellipse at 50% 30%, ${activeCard.color}24 0%, ${activeCard.color}06 50%, transparent 75%)`,
                }}
              />

              <motion.div
                key="eco-tab-window"
                className="eco-tab-window"
                variants={tabWindowVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                {/* ─── SLEEK macOS TITLEBAR ─── */}
                <div className="eco-tab-titlebar">
                  {/* Left: Authentic Traffic Lights */}
                  <div className="eco-traffic-lights">
                    <button
                      type="button"
                      className="eco-traffic-dot is-close"
                      onClick={closeCard}
                      title="Close tab (Esc)"
                      aria-label="Close tab"
                    >
                      <span className="eco-traffic-symbol">✕</span>
                    </button>
                    <button
                      type="button"
                      className="eco-traffic-dot is-minimize"
                      onClick={closeCard}
                      title="Minimize tab back to card (Esc)"
                      aria-label="Minimize tab"
                    >
                      <span className="eco-traffic-symbol">−</span>
                    </button>
                    <button
                      type="button"
                      className="eco-traffic-dot is-expand"
                      onClick={() => window.open(activeCard.link, '_blank')}
                      title={`Open ${activeCard.link} in new window`}
                      aria-label="Open in new window"
                    >
                      <span className="eco-traffic-symbol">↗</span>
                    </button>
                  </div>

                  {/* Center: Segmented Platform Switcher */}
                  <div className="eco-tab-switcher">
                    {CARDS.map((c) => {
                      const isActive = activeCardId === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          className={`eco-tab-pill ${isActive ? 'is-active' : ''}`}
                          onClick={() => switchPlatformTab(c.id)}
                        >
                          <span className="eco-tab-pill-dot" style={{ background: c.color }} />
                          <span className="eco-tab-pill-idx">{c.index}</span>
                          <span className="eco-tab-pill-title">{c.title}</span>
                          {isActive && (
                            <motion.div
                              layoutId="eco-tab-pill-indicator"
                              className="eco-tab-pill-indicator"
                              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right: Clean Minimal Address Pill & Esc Hint */}
                  <div className="eco-tab-titlebar-right">
                    <a
                      href={activeCard.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="eco-tab-url-pill"
                      title={`Open live website: ${activeCard.link}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="eco-url-lock">🔒</span>
                      <span className="eco-url-text">{activeCard.link.replace('https://', '')}</span>
                      <span className="eco-url-arrow">↗</span>
                    </a>

                    <button
                      type="button"
                      className="eco-tab-esc-badge"
                      onClick={closeCard}
                      title="Minimize tab (Esc)"
                    >
                      <span>esc</span>
                    </button>
                  </div>
                </div>

                {/* ─── STAGE: MINIMAL PANORAMIC CANVAS ─── */}
                <div className="eco-tab-stage-panoramic">
                  {/* Context Header Strip */}
                  <div className="eco-tab-header-strip">
                    <div className="eco-strip-left">
                      <div className="eco-strip-eyebrow" style={{ color: activeCard.color }}>
                        {activeCard.index} · {activeCard.tagline}
                      </div>
                      <h3 className="eco-strip-heading">{activeCard.expandedTitle}</h3>
                      <p className="eco-strip-desc">{activeCard.expandedDesc}</p>
                    </div>

                    <div className="eco-strip-right">
                      <div className="eco-strip-chips">
                        {activeCard.features.slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="eco-strip-chip">
                            <span className="eco-chip-dot" style={{ background: activeCard.color }} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                      <a
                        href={activeCard.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="eco-strip-visit-link"
                        style={{ color: activeCard.color, borderColor: `${activeCard.color}40` }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Visit {activeCard.title} Platform</span>
                        <span className="arrow">↗</span>
                      </a>
                    </div>
                  </div>

                  {/* Wide Interactive Workspace Viewport */}
                  <div className="eco-tab-panoramic-workspace">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeCard.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}
                      >
                        {activeCard.largePreview}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* ─── FOOTER STATUSBAR ─── */}
                <div className="eco-tab-statusbar">
                  <div className="eco-status-left">
                    <span className="eco-status-live-dot" />
                    <span>Live Workspace · {activeCard.link.replace('https://', '')}</span>
                    <span className="eco-status-sep">·</span>
                    <span className="eco-status-shortcut">Shortcuts: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> switch tabs</span>
                  </div>
                  <div className="eco-status-right">
                    <span>Press <kbd>ESC</kbd> or click ✕ to close</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}
