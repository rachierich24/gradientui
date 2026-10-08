'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Icon } from './icons';

const ECOSYSTEM_LINKS = {
  cafes: 'https://cafe.grabbit.io',
  suppliers: 'https://supplier.grabbit.io',
  brands: 'https://brand.grabbit.io',
};

// ─── RICH, AUTHENTIC UI MOCKUP COMPONENTS ───

const CafePreview = ({
  large = false,
  onOpen,
}: {
  large?: boolean;
  onOpen?: () => void;
}) => (
  <div className={`mock-preview-shell is-cafe ${large ? 'is-large' : ''}`}>
    <div className="eco-preview-chrome">
      <div className="eco-preview-dots">
        <div className="eco-preview-dot is-red" />
        <div className="eco-preview-dot" />
        <div className="eco-preview-dot" />
      </div>
      <div className="eco-preview-address">grabbit.io/cafe/marketplace</div>
    </div>

    {/* Search & Filter Header */}
    <div className="mock-cafe-header">
      <div className="mock-cafe-search">
        <Icon.Search size={large ? 13 : 10} />
        <span>Search beans, milks, syrups...</span>
      </div>
      <div className="mock-cafe-pill-row">
        <span className="mock-cafe-pill is-active">All</span>
        <span className="mock-cafe-pill">Beans</span>
        <span className="mock-cafe-pill">Dairy</span>
        {large && <span className="mock-cafe-pill">Syrups</span>}
      </div>
    </div>

    {/* Product Catalog Grid */}
    <div className={`mock-cafe-content ${large ? 'is-large' : ''}`}>
      {/* Product 1: Arabica Beans */}
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
              className="mock-cafe-add-btn"
              onClick={(e) => {
                e.stopPropagation();
                onOpen?.();
              }}
            >
              + Quick PO
            </button>
          </div>
        </div>
      </div>

      {/* Product 2: Barista Oat Milk */}
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
              className="mock-cafe-add-btn"
              onClick={(e) => {
                e.stopPropagation();
                onOpen?.();
              }}
            >
              + Quick PO
            </button>
          </div>
        </div>
      </div>

      {/* Product 3 (Shown in large modal) */}
      {large && (
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
              <span className="mock-cafe-add-btn">+ Quick PO</span>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Bottom Live Cart Bar */}
    <div className="mock-cafe-bottom-strip">
      <div className="mock-cafe-cart-info">
        <span className="mock-cafe-cart-badge">2 items</span>
        <span className="mock-cafe-cart-total">₹1,240 PO batch</span>
      </div>
      <div className="mock-cafe-dispatch-pill">
        <span>⚡ Next-Day 8 AM</span>
      </div>
    </div>
  </div>
);

const SupplierPreview = ({ large = false }: { large?: boolean }) => (
  <div className={`mock-preview-shell is-supplier ${large ? 'is-large' : ''}`}>
    <div className="eco-preview-chrome">
      <div className="eco-preview-dots">
        <div className="eco-preview-dot is-green" />
        <div className="eco-preview-dot" />
        <div className="eco-preview-dot" />
      </div>
      <div className="eco-preview-address">grabbit.io/supplier/dispatch</div>
    </div>

    <div className="mock-sup-split">
      {/* Dark Green Sidebar with Icons */}
      <div className="mock-sup-sidebar">
        <div className="mock-sup-icon is-active">
          <Icon.Box size={large ? 16 : 12} />
        </div>
        <div className="mock-sup-icon">
          <Icon.Truck size={large ? 16 : 12} />
        </div>
        <div className="mock-sup-icon">
          <Icon.Chart size={large ? 16 : 12} />
        </div>
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
          <div className="mock-sup-row">
            <div className="mock-sup-row-left">
              <span className="mock-sup-order-id">#GRB-1049</span>
              <span className="mock-sup-order-cafe">Blue Tokai · 12kg</span>
            </div>
            <span className="mock-sup-badge is-new">New PO</span>
          </div>
          <div className="mock-sup-row">
            <div className="mock-sup-row-left">
              <span className="mock-sup-order-id">#GRB-1048</span>
              <span className="mock-sup-order-cafe">Third Wave · 24L</span>
            </div>
            <span className="mock-sup-badge is-transit">Fulfilling</span>
          </div>
          <div className="mock-sup-row">
            <div className="mock-sup-row-left">
              <span className="mock-sup-order-id">#GRB-1047</span>
              <span className="mock-sup-order-cafe">Subko Roasters · 6pk</span>
            </div>
            <span className="mock-sup-badge is-dispatched">Dispatched</span>
          </div>
        </div>

        {/* Bottom Fleet Status Bar */}
        <div className="mock-sup-bottom-strip">
          <div className="mock-sup-fleet-status">
            <span className="mock-sup-fleet-dot" />
            <span className="mock-sup-fleet-text">Fleet Route #3 · 4 drops remaining</span>
          </div>
          <span className="mock-sup-eta">ETA 11:20 AM</span>
        </div>
      </div>
    </div>
  </div>
);

const BrandPreview = ({ large = false }: { large?: boolean }) => (
  <div className={`mock-preview-shell is-brand ${large ? 'is-large' : ''}`}>
    <div className="eco-preview-chrome">
      <div className="eco-preview-dots">
        <div className="eco-preview-dot is-purple" />
        <div className="eco-preview-dot" />
        <div className="eco-preview-dot" />
      </div>
      <div className="eco-preview-address">grabbit.io/brand/intelligence</div>
    </div>

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
      {[
        { height: 42, label: 'W1' },
        { height: 60, label: 'W2' },
        { height: 78, label: 'W3' },
        { height: 95, label: 'W4' },
        { height: 68, label: 'W5' },
      ].map((bar, i) => (
        <div key={i} className="mock-brand-bar-col">
          <div className="mock-brand-bar">
            <motion.div
              className="mock-brand-bar-fill"
              initial={{ height: '0%' }}
              whileInView={{ height: `${bar.height}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
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
    <div className="mock-brand-bottom-strip">
      <div className="mock-brand-sku-row">
        <span className="mock-brand-sku-name">Arabica Estate AA</span>
        <span className="mock-brand-sku-metric">88 cafés · 94% retention</span>
      </div>
      <div className="mock-brand-sku-row">
        <span className="mock-brand-sku-name">Barista Oat Milk</span>
        <span className="mock-brand-sku-metric">64 cafés · 89% retention</span>
      </div>
    </div>
  </div>
);

// ─── STAKEHOLDER CARDS CONFIG ───

const CARDS = [
  {
    id: 'cafes',
    index: '01',
    title: 'CAFÉS',
    theme: 'cafe',
    color: '#E03527',
    desc: 'Run your café from sourcing to delivery.',
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
    miniPreview: (onOpen: () => void) => <CafePreview onOpen={onOpen} />,
    largePreview: <CafePreview large />,
  },
  {
    id: 'suppliers',
    index: '02',
    title: 'SUPPLIERS',
    theme: 'supplier',
    color: '#22C55E',
    desc: 'Receive wholesale orders and manage dispatch.',
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
    miniPreview: () => <SupplierPreview />,
    largePreview: <SupplierPreview large />,
  },
  {
    id: 'brands',
    index: '03',
    title: 'BRANDS',
    theme: 'brand',
    color: '#6D28D9',
    desc: 'Understand café adoption and distribution.',
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
    miniPreview: () => <BrandPreview />,
    largePreview: <BrandPreview large />,
  },
];

const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
};

// ─── MAIN COMPONENT ───

export function EcosystemCards() {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const isReduced = useReducedMotion();

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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCardId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openCard = (id: string) => {
    setActiveCardId(id);
  };

  return (
    <section className="eco-section" id="ecosystem-cards" aria-label="The Grabbit Ecosystem">
      <div className="eco-container">
        {/* Section Header */}
        <motion.div
          className="eco-header"
          initial={isReduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eco-header-eyebrow">THE GRABBIT ECOSYSTEM</span>
          <h2 className="eco-header-title">Built differently for every side of the supply chain.</h2>
          <p className="eco-header-desc">
            One connected network. Three purpose-built platforms tailored for cafés, suppliers, and brands.
          </p>
        </motion.div>

        {/* 3 Cards Grid */}
        <div className="eco-grid">
          {CARDS.map((card, i) => {
            const isDimmed = activeCardId !== null && activeCardId !== card.id;

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
                  className={`eco-card ${isDimmed ? 'is-dimmed' : ''}`}
                  onClick={() => openCard(card.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${card.title} platform overview`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openCard(card.id);
                    }
                  }}
                >
                  <div className="eco-card-inner">
                    {/* Top Tab Header */}
                    <div className="eco-card-tab">
                      <div className="eco-card-tab-label">
                        <span className="eco-card-tab-idx">{card.index}</span> {card.title}
                      </div>
                      <div className={`eco-card-tab-line ${card.theme}-line`} />
                    </div>

                    {/* Rich Mini UI Mockup */}
                    <div className="eco-preview-container">
                      {card.miniPreview(() => openCard(card.id))}
                    </div>

                    {/* Bottom Metadata & Working Open Button */}
                    <div className="eco-card-bottom">
                      <h3 className="eco-card-title">{card.title}</h3>
                      <p className="eco-card-desc">{card.desc}</p>

                      <button
                        type="button"
                        className={`eco-card-cta ${card.theme}-cta`}
                        title={`Open ${card.title} platform preview`}
                      >
                        VISIT {card.title} PLATFORM <span className="arrow">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Expanded Interactive Window Overlay */}
      <AnimatePresence>
        {activeCardId && (
          <motion.div
            className="eco-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setActiveCardId(null)}
          >
            {/* Expanded Modal Window */}
            <motion.div
              className="eco-expanded-window"
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={springTransition}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Window Chrome & Tabs */}
              <div className="eco-expanded-chrome">
                <div className="eco-expanded-tabs">
                  {CARDS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`eco-expanded-tab ${activeCardId === c.id ? 'is-active' : ''}`}
                      onClick={() => setActiveCardId(c.id)}
                    >
                      <span>{c.index}</span> {c.title}
                      {activeCardId === c.id && (
                        <motion.div
                          layoutId="active-tab-indicator"
                          className="eco-expanded-tab-indicator"
                          style={{ background: c.color }}
                          transition={springTransition}
                        />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="eco-close-btn"
                  onClick={() => setActiveCardId(null)}
                  aria-label="Close preview"
                >
                  <Icon.X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="eco-expanded-content">
                {/* Left Overview Column */}
                <div className="eco-expanded-sidebar">
                  <h3>{CARDS.find((c) => c.id === activeCardId)?.expandedTitle}</h3>
                  <p>{CARDS.find((c) => c.id === activeCardId)?.expandedDesc}</p>

                  <div className="eco-expanded-features">
                    {CARDS.find((c) => c.id === activeCardId)?.features.map((feature, i) => (
                      <div key={i} className="eco-feature-item">
                        <div
                          className="eco-feature-icon"
                          style={{
                            background: `${CARDS.find((c) => c.id === activeCardId)?.color}15`,
                            color: CARDS.find((c) => c.id === activeCardId)?.color,
                          }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href={CARDS.find((c) => c.id === activeCardId)?.link}
                    target="_blank"
                    rel="noreferrer"
                    className="eco-expanded-cta"
                    style={{ background: CARDS.find((c) => c.id === activeCardId)?.color }}
                  >
                    LAUNCH {CARDS.find((c) => c.id === activeCardId)?.title} APP ↗
                  </a>
                </div>

                {/* Right Interactive Mockup Stage */}
                <div className="eco-expanded-main">
                  <div className="eco-large-preview">
                    {CARDS.find((c) => c.id === activeCardId)?.largePreview}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
