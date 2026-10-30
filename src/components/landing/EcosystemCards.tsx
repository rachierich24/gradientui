'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// ─── VERIFIED LIVE PLATFORMS FOR THE THREE SIDES OF THE ECOSYSTEM ───
const ECOSYSTEM_LINKS = {
  cafes: 'https://cafe.gradient365.com',
  suppliers: 'https://supplier.gradient365.com',
  brands: 'https://brand.gradient365.com',
};

// ─── PRODUCT SCREENS ───
// One dashboard per side of the network. The cards show it at half scale inside a browser frame;
// the expanded tab shows it full size.

const MiniFrame = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <div className="mock-preview-shell eco-mini">
    <div className="eco-preview-chrome">
      <div className="eco-preview-dots">
        <div className="eco-preview-dot is-red" />
        <div className="eco-preview-dot is-yellow" />
        <div className="eco-preview-dot is-green" />
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="eco-preview-address is-link"
        onClick={(e) => e.stopPropagation()}
        title={`Visit ${href.replace('https://', '')}`}
      >
        <span className="eco-address-lock">🔒</span> {href.replace('https://', '')} <span className="eco-address-ext">↗</span>
      </a>
    </div>
    <div className="eco-mini-stage">{children}</div>
  </div>
);

const BRAND_BARS = [
  { height: 42, label: 'W1', value: '42 POs · ₹3.4L' },
  { height: 60, label: 'W2', value: '60 POs · ₹4.9L' },
  { height: 78, label: 'W3', value: '78 POs · ₹6.2L' },
  { height: 95, label: 'W4', value: '95 POs · ₹7.8L' },
  { height: 68, label: 'W5', value: '68 POs · ₹5.5L' },
];

const SUP_ORDERS = [
  { id: 'GRB-1049', cafe: 'Hillfold', area: 'Hauz Khas', items: 'Arabica AA · 12 kg', value: '₹9,840', status: 'New', cls: 'is-new' },
  { id: 'GRB-1048', cafe: 'Lantern Row', area: 'Saket', items: 'Oat milk · 24 L', value: '₹5,040', status: 'Packing', cls: 'is-pack' },
  { id: 'GRB-1047', cafe: 'Sundial Roasters', area: 'GK II', items: 'Kraft cups · 6 packs', value: '₹3,120', status: 'On the road', cls: 'is-road' },
  { id: 'GRB-1046', cafe: 'Ridgeway Coffee', area: 'Jangpura', items: 'House blend · 18 kg', value: '₹14,760', status: 'Packing', cls: 'is-pack' },
  { id: 'GRB-1045', cafe: 'Tamarind Lane', area: 'Hauz Khas', items: 'Fresh cream · 40 L', value: '₹8,600', status: 'Delivered', cls: 'is-done' },
];
const SUP_RUNS = [
  { name: 'Run 2 · Vasant Kunj', done: 12, total: 14 },
  { name: 'Run 4 · Greater Kailash', done: 8, total: 11 },
  { name: 'Run 5 · Malviya Nagar', done: 7, total: 12 },
];

// Expanded supplier view: the day's orders and delivery runs.
const SupplierDashboard = () => (
  <div className="mock-preview-shell is-supplier is-large bd is-supplier-dash" data-lenis-prevent>
    <div className="bd-head">
      <div>
        <div className="bd-title">Today&apos;s orders</div>
        <div className="bd-sub">Every café order, packed and on its way</div>
      </div>
      <span className="bd-pill">Today</span>
    </div>
    <div className="bd-kpis">
      {[
        { v: '39', l: 'Orders today', t: '+14%' },
        { v: '98.8%', l: 'Delivered on time', t: '+0.6%' },
        { v: '₹2.4L', l: 'Billed today', t: '+9%' },
        { v: '3', l: 'Vans on the road', t: '' },
      ].map((k) => (
        <div key={k.l} className="bd-kpi">
          <div className="bd-kpi-v">{k.v}{k.t && <span className="bd-trend">{k.t}</span>}</div>
          <div className="bd-kpi-l">{k.l}</div>
        </div>
      ))}
    </div>
    <div className="bd-main">
      <section className="bd-panel" aria-label="Incoming orders">
        <div className="bd-panel-title">Incoming orders</div>
        <ul className="bd-orders">
          {SUP_ORDERS.map((o) => (
            <li key={o.id}>
              <span className="bd-ord-av">{o.cafe.slice(0, 1)}</span>
              <span className="bd-ord-main">
                <b>{o.cafe}</b> <span>{o.area}</span>
                <small>{o.items}</small>
              </span>
              <span className="bd-ord-val">{o.value}</span>
              <span className={`bd-status ${o.cls}`}>{o.status}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="bd-panel" aria-label="Delivery runs">
        <div className="bd-panel-title">Delivery runs</div>
        <ul className="bd-runs">
          {SUP_RUNS.map((r) => (
            <li key={r.name}>
              <div className="bd-prod-row"><span className="bd-prod-name">{r.name}</span><span className="bd-prod-cafes">{r.done}/{r.total} drops</span></div>
              <div className="bd-meter"><span style={{ width: `${Math.round((r.done / r.total) * 100)}%` }} /></div>
            </li>
          ))}
        </ul>
        <div className="bd-note">Next van leaves at 11:20 AM with 4 drops</div>
      </section>
    </div>
  </div>
);

const CAFE_PRODUCTS = [
  { id: 'arabica', name: 'Arabica Estate AA', sup: 'Hillfold Roasters', price: 820, unit: 'kg', img: '/landing/spotlight/arabica-beans.jpg' },
  { id: 'oat', name: 'Barista Oat Milk', sup: 'Pantry Lane', price: 420, unit: 'L', img: '/landing/spotlight/barista-oat-carton.jpg' },
  { id: 'caramel', name: 'Caramel Syrup', sup: 'Marigold Foods', price: 680, unit: 'btl', img: '/landing/spotlight/caramel-syrup-bottle.jpg' },
  { id: 'matcha', name: 'Ceremonial Matcha', sup: 'Sundial', price: 1890, unit: 'tin', img: '/landing/spotlight/ceremonial-matcha-tin.jpg' },
];

// Expanded café view: browse, add to the basket, see the delivery slot.
const CafeDashboard = () => {
  const [basket, setBasket] = useState<Record<string, number>>({ arabica: 2, oat: 6 });
  const add = (id: string) => setBasket((b) => ({ ...b, [id]: (b[id] ?? 0) + 1 }));
  const lines = CAFE_PRODUCTS.filter((p) => basket[p.id]);
  const total = lines.reduce((sum, p) => sum + p.price * basket[p.id], 0);
  return (
    <div className="mock-preview-shell is-cafe is-large bd is-cafe-dash" data-lenis-prevent>
      <div className="bd-head">
        <div>
          <div className="bd-title">Order supplies</div>
          <div className="bd-sub">Tamarind Lane Cafe · Hauz Khas</div>
        </div>
        <span className="bd-pill">Delivery tomorrow, 8 AM</span>
      </div>
      <div className="bd-kpis">
        {[
          { v: '₹42,180', l: 'Spent this month', t: '8% less' },
          { v: '14', l: 'Orders this month', t: '' },
          { v: '6', l: 'Suppliers, one bill', t: '' },
          { v: '0', l: 'Missed deliveries', t: '' },
        ].map((k) => (
          <div key={k.l} className="bd-kpi">
            <div className="bd-kpi-v">{k.v}{k.t && <span className="bd-trend">{k.t}</span>}</div>
            <div className="bd-kpi-l">{k.l}</div>
          </div>
        ))}
      </div>
      <div className="bd-main is-cafe-main">
        <section className="bd-panel" aria-label="Products">
          <div className="bd-panel-title">Reorder your usuals</div>
          <div className="bd-shelf">
            {CAFE_PRODUCTS.map((p) => (
              <div key={p.id} className="bd-item">
                <Image src={p.img} alt={p.name} width={240} height={180} sizes="200px" className="bd-item-img" />
                <div className="bd-item-name">{p.name}</div>
                <div className="bd-item-sup">{p.sup}</div>
                <div className="bd-item-foot">
                  <span>₹{p.price.toLocaleString('en-IN')} / {p.unit}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); add(p.id); }}>
                    {basket[p.id] ? `${basket[p.id]} added` : 'Add'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="bd-panel" aria-label="Basket">
          <div className="bd-panel-title">Basket</div>
          <ul className="bd-basket">
            {lines.map((p) => (
              <li key={p.id}><span>{basket[p.id]} × {p.name}</span><b>₹{(p.price * basket[p.id]).toLocaleString('en-IN')}</b></li>
            ))}
          </ul>
          <div className="bd-total"><span>Total</span><b>₹{total.toLocaleString('en-IN')}</b></div>
          <div className="bd-cta">Place order</div>
          <div className="bd-note">Split across {new Set(lines.map((p) => p.sup)).size} suppliers, one delivery</div>
        </section>
      </div>
    </div>
  );
};

// Expanded brand view: a full dashboard instead of the card's bar strip stretched to window size.
const BRAND_PRODUCTS = [
  { name: 'Arabica Estate AA', cafes: 88, retention: 94, img: '/landing/spotlight/arabica-beans.jpg' },
  { name: 'Barista Oat Milk 1L', cafes: 64, retention: 89, img: '/landing/spotlight/barista-oat-carton.jpg' },
  { name: 'Caramel Artisan Syrup', cafes: 41, retention: 81, img: '/landing/spotlight/caramel-syrup-bottle.jpg' },
  { name: 'Ceremonial Matcha', cafes: 27, retention: 72, img: '/landing/spotlight/ceremonial-matcha-tin.jpg' },
];
const BRAND_AREAS = [
  { area: 'Hauz Khas', growth: '+24%' },
  { area: 'Saket', growth: '+17%' },
  { area: 'Greater Kailash', growth: '+11%' },
  { area: 'Malviya Nagar', growth: '+8%' },
];

const BrandDashboard = ({ bars = BRAND_BARS }: { bars?: { height: number; label: string; value: string }[] }) => (
  <div className="mock-preview-shell is-brand is-large bd" data-lenis-prevent>
    <div className="bd-head">
      <div>
        <div className="bd-title">Café adoption</div>
        <div className="bd-sub">How your products are moving through cafés</div>
      </div>
      <span className="bd-pill">Last 30 days</span>
    </div>

    <div className="bd-kpis">
      {[
        { v: '124', l: 'Cafés reached', t: '+18.4%' },
        { v: '25.0%', l: 'Repeat purchase orders', t: '+4.2%' },
        { v: '343', l: 'Purchase orders', t: '+31%' },
        { v: '₹27.8L', l: 'Order value', t: '+22%' },
      ].map((k) => (
        <div key={k.l} className="bd-kpi">
          <div className="bd-kpi-v">{k.v}<span className="bd-trend">{k.t}</span></div>
          <div className="bd-kpi-l">{k.l}</div>
        </div>
      ))}
    </div>

    <div className="bd-main">
      <section className="bd-panel bd-chart-panel" aria-label="Weekly purchase orders">
        <div className="bd-panel-title">Weekly purchase orders</div>
        <div className="bd-chart">
          <div className="bd-grid" aria-hidden="true"><span>100</span><span>50</span><span>0</span></div>
          <div className="bd-bars">
            {bars.map((bar, i) => (
              <div key={bar.label} className={`bd-bar-col${bar.height === Math.max(...bars.map((b) => b.height)) ? ' is-peak' : ''}`} title={bar.value}>
                <span className="bd-bar-val">{bar.height}</span>
                <div className="bd-bar-track">
                  <motion.div
                    className="bd-bar-fill"
                    initial={{ height: '0%' }}
                    animate={{ height: `${bar.height}%` }}
                    transition={{ duration: 0.9, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="bd-bar-lbl">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bd-panel" aria-label="Top products">
        <div className="bd-panel-title">Top products</div>
        <ul className="bd-products">
          {BRAND_PRODUCTS.map((p) => (
            <li key={p.name}>
              <Image src={p.img} alt="" width={80} height={80} sizes="40px" className="bd-prod-img" />
              <div className="bd-prod-body">
              <div className="bd-prod-row"><span className="bd-prod-name">{p.name}</span><span className="bd-prod-cafes">{p.cafes} cafés</span></div>
              <div className="bd-meter"><span style={{ width: `${p.retention}%` }} /></div>
              <div className="bd-prod-ret">{p.retention}% reorder</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>

    <div className="bd-areas">
      <span className="bd-areas-lbl">Growing fastest</span>
      {BRAND_AREAS.map((a) => (
        <span key={a.area} className="bd-area">{a.area} <b>{a.growth}</b></span>
      ))}
    </div>
  </div>
);

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
    miniPreview: () => <MiniFrame href={ECOSYSTEM_LINKS.cafes}><CafeDashboard /></MiniFrame>,
    largePreview: <CafeDashboard />,
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
    headline: 'Take café orders and run dispatch',
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
    miniPreview: () => <MiniFrame href={ECOSYSTEM_LINKS.suppliers}><SupplierDashboard /></MiniFrame>,
    largePreview: <SupplierDashboard />,
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
    miniPreview: () => <MiniFrame href={ECOSYSTEM_LINKS.brands}><BrandDashboard /></MiniFrame>,
    largePreview: <BrandDashboard />,
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
                      <span className="eco-bento-label"><i />{card.title}</span>
                      <h3 className="eco-bento-title">{card.headline}</h3>
                      <a
                        href={card.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="eco-bento-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {card.link.replace('https://', '')} <span aria-hidden="true">↗</span>
                      </a>
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
                      {card.miniPreview()}
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
