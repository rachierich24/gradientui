'use client';
// Mock UI fragments used inside hero/showcase - ported from Figma Make export 0005.js
import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  motion, MotionConfig, useInView, useReducedMotion,
  animate, useMotionValue, useMotionValueEvent,
} from 'framer-motion';
import { Icon } from './icons';

// Shared entrance choreography - panels/metrics/rows rise + fade in a stagger,
// the way a live SaaS dashboard (Attio) populates as it loads.
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } } };
const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] } },
};
// Sidebar rows drop in from the top one after another, then settle into place.
const sideContainer = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const drop = {
  hidden: { opacity: 0, y: -22 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 520, damping: 30, mass: 0.6 } },
};

// Number that counts up when scrolled into view.
function CountNum({ value, prefix = '', suffix = '', decimals = 0 }:
  { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const fmt = (v: number) => prefix + v.toFixed(decimals) + suffix;
  const [txt, setTxt] = useState(fmt(reduce ? value : 0));
  useMotionValueEvent(mv, 'change', (v) => setTxt(fmt(v)));
  useEffect(() => {
    if (reduce || !inView) return;
    const c = animate(mv, value, { duration: 1.1, ease: [0.22, 0.61, 0.36, 1] });
    return () => c.stop();
  }, [inView, reduce, value, mv]);
  return <span ref={ref}>{txt}</span>;
}

// Cycling typewriter for the "Ask:" bar - types a query, holds, deletes, next.
const ASK_QUERIES = [
  'which cafes need oat milk before 4pm?',
  'top suppliers by on-time delivery this week',
  'which brand trials are ready to convert?',
];
function AskTyper() {
  const reduce = useReducedMotion();
  const [txt, setTxt] = useState(reduce ? ASK_QUERIES[0] : '');
  useEffect(() => {
    if (reduce) return;
    let qi = 0, ci = 0, dir = 1;
    let timer = 0;
    const tick = () => {
      const q = ASK_QUERIES[qi];
      ci += dir;
      setTxt(q.slice(0, ci));
      let delay = dir > 0 ? 45 : 22;
      if (ci >= q.length) { dir = -1; delay = 1700; }
      else if (ci <= 0) { dir = 1; qi = (qi + 1) % ASK_QUERIES.length; delay = 360; }
      timer = window.setTimeout(tick, delay);
    };
    timer = window.setTimeout(tick, 700);
    return () => clearTimeout(timer);
  }, [reduce]);
  return <span className="cmd-ask">Ask: &ldquo;{txt}<span className="cmd-caret" />&rdquo;</span>;
}

// Sidebar mirrors the real café-portal nav (src/app/(dashboard)/layout.tsx).
const SIDE_NAV = [
  { lab: 'Overview', ic: <Icon.Dashboard size={14}/>, active: true },
  { lab: 'Orders', ic: <Icon.Cart size={14}/>, ct: '9' },
  { lab: 'Catalogue', ic: <Icon.Menu size={14}/> },
  { lab: 'Inventory', ic: <Icon.Box size={14}/> },
  { lab: 'Suppliers', ic: <Icon.Truck size={14}/> },
  { lab: 'Payments', ic: <Icon.Card size={14}/> },
  { lab: 'Reports', ic: <Icon.Chart size={14}/> },
  { lab: 'Reviews', ic: <Icon.Star size={14}/> },
  { lab: 'Brand Requests', ic: <Icon.Sparkle size={14}/> },
];
// KPIs mirror the portal's "Supply Overview" tiles. `spark` is a 6-point trend.
const METRICS = [
  { lab: "Today's deliveries", value: 8, suffix: ' arriving', d: 'across 12 carriers', spark: [4, 6, 5, 7, 6, 8] },
  { lab: 'Low stock items', value: 4, suffix: ' SKUs', d: 'auto-reorder ready', spark: [7, 6, 6, 5, 5, 4] },
  { lab: 'Pending orders', value: 6, suffix: ' orders', d: 'awaiting dispatch', spark: [9, 7, 8, 6, 7, 6] },
  { lab: 'On-time suppliers', value: 92, suffix: '%', d: 'on-time this week', spark: [86, 89, 88, 90, 91, 92] },
];
// Static assets served from CloudFront (S3) in prod; falls back to /public in dev.
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? '';
// Two-letter initials fallback (used if a logo image fails to load).
function initials(name: string) {
  const words = name.split('/')[0].trim().split(/\s+/).filter(w => /[a-z]/i.test(w[0]));
  const ini = words.length >= 2 ? words[0][0] + words[1][0] : (words[0]?.slice(0, 2) ?? '');
  return ini.toUpperCase();
}
// Real café/brand logos (same assets as the landing logo strip).
const ORDERS = [
  { cafe: 'Blue Tokai / Indiranagar', supplier: 'Dairycraft', value: 'Rs 38,400', status: 'Packing', cls: 'active', img: '/logos/blue-tokai.png', co: 'var(--ink)' },
  { cafe: 'Subko / Bandra', supplier: 'Urban Platter', value: 'Rs 71,920', status: 'Dispatch', cls: 'info', img: '/logos/subko.png', co: 'var(--c-orange)' },
  { cafe: 'Third Wave / Koramangala', supplier: 'Araku Estates', value: 'Rs 22,180', status: 'Counter', cls: 'pending', img: '/logos/third-wave.png', co: 'var(--c-purple)' },
  { cafe: 'Sleepy Owl / Powai', supplier: 'KC Roasters', value: 'Rs 54,600', status: 'Packing', cls: 'active', img: '/logos/sleepy-owl.png', co: 'var(--c-blue)' },
  { cafe: 'Araku / Aundh', supplier: 'Corridor Seven', value: 'Rs 41,750', status: 'Dispatch', cls: 'info', img: '/logos/araku.png', co: 'var(--c-green)' },
  { cafe: 'Rage Coffee / HSR', supplier: 'Country Bean', value: 'Rs 18,240', status: 'Counter', cls: 'pending', img: '/logos/rage-coffee.jpeg', co: 'var(--c-pink)' },
];

// Café logo tile with initials fallback if the image fails.
function RowAvatar({ name, img, co }: { name: string; img?: string; co: string }) {
  const [err, setErr] = useState(false);
  if (img && !err) {
    return (
      <span className="cmd-av cmd-av--logo">
        <img src={`${ASSET_BASE}${img}`} alt={name} loading="lazy" onError={() => setErr(true)} />
      </span>
    );
  }
  return <span className="cmd-av" style={{ background: co }}>{initials(name)}</span>;
}
const FUNNEL = [
  { step: 'Sent', n: 124, h: 112 },
  { step: 'Tried', n: 92, h: 94 },
  { step: 'Liked', n: 66, h: 76 },
  { step: 'Ordered', n: 31, h: 58 },
];

// Data definitions for the 3 ecosystem personas
const ROLE_DATA = {
  cafe: {
    portal: 'Café OS',
    kicker: 'Today / Bengaluru Café Network',
    title: 'One-Cart Sourcing & Morning Dispatch',
    desc: 'Managing 8 verified specialty roasters and cold-chain dairy deliveries in a single Net-15 cart.',
    pipeline: [
      { step: '01', title: 'Multi-Vendor Cart', proof: '8 Roasters' },
      { step: '02', title: 'Single Net-15 Statement', proof: 'Auto-Split PO' },
      { step: '03', title: 'Cold-Chain Dispatch', proof: '3.8°C IoT Probe' },
      { step: '04', title: 'Par Auto-Replenish', proof: 'PO Queued' },
    ],
    metrics: [
      { lab: "Today's deliveries", value: 8, suffix: ' arriving', d: 'across 12 carriers', delta: '↑ 12.4%', cls: 'pos', spark: [4, 6, 5, 7, 6, 8] },
      { lab: 'Net-15 line used', value: 85.4, prefix: '₹', suffix: 'K', d: 'due Oct 10 · 1 invoice', delta: '42% limit', cls: 'pos', spark: [60, 68, 72, 78, 82, 85] },
      { lab: 'Cold-chain probe', value: 3.8, suffix: '°C', d: 'Van #04 · ETA 18m', delta: '● Optimal (2-5°C)', cls: 'pos', spark: [3.9, 4.0, 3.8, 3.7, 3.8, 3.8] },
      { lab: 'Auto-reorder items', value: 3, suffix: ' SKUs', d: 'oat milk & cups low', delta: 'Auto-triggered', cls: 'warn', spark: [6, 5, 5, 4, 4, 3] },
    ],
    orders: [
      { cafe: 'Blue Tokai / Indiranagar', supplier: 'Dairycraft', value: '₹38,400', status: 'In transit', cls: 'active', img: '/logos/blue-tokai.png', co: 'var(--ink)' },
      { cafe: 'Subko / Bandra', supplier: 'Urban Platter', value: '₹71,920', status: 'Cold Dispatch', cls: 'info', img: '/logos/subko.png', co: 'var(--c-orange)' },
      { cafe: 'Third Wave / Koramangala', supplier: 'Araku Estates', value: '₹22,180', status: 'Scheduled', cls: 'pending', img: '/logos/third-wave.png', co: 'var(--c-purple)' },
      { cafe: 'Sleepy Owl / Powai', supplier: 'KC Roasters', value: '₹54,600', status: 'In transit', cls: 'active', img: '/logos/sleepy-owl.png', co: 'var(--c-blue)' },
    ],
    sideNoteTitle: 'Consolidated Billing',
    sideNoteDesc: '8 vendor deliveries unified into 1 monthly Net-15 statement. Zero WhatsApp voice notes.',
  },
  supplier: {
    portal: 'Wholesale Hub',
    kicker: 'Live Ops / Wholesale Fulfilment',
    title: 'Automated Demand & T+1 Settlement',
    desc: '34 café orders aggregated into 3 morning delivery loops with instant escrow payouts.',
    pipeline: [
      { step: '01', title: 'WhatsApp PO Ingest', proof: '34 Cafés' },
      { step: '02', title: 'Batch Roast #4', proof: '180kg Locked' },
      { step: '03', title: 'Multi-Drop Route', proof: '3 Vans Active' },
      { step: '04', title: 'T+1 HDFC Payout', proof: '₹1.84L Disbursed' },
    ],
    metrics: [
      { lab: 'Demands aggregated', value: 34, suffix: ' cafés', d: 'all midnight POs parsed', delta: '↑ 18.4% vol', cls: 'pos', spark: [20, 24, 26, 30, 31, 34] },
      { lab: 'T+1 Bank payout', value: 1.84, prefix: '₹', suffix: 'L', d: 'HDFC **4821 at 06:00', delta: 'Settled today', cls: 'pos', spark: [1.1, 1.3, 1.4, 1.6, 1.7, 1.84] },
      { lab: 'Roast batch volume', value: 180, suffix: ' kg', d: 'Arabica medium profile', delta: 'Batch #4 locked', cls: 'pos', spark: [110, 130, 145, 160, 170, 180] },
      { lab: 'On-time fleet rate', value: 98.4, suffix: '%', d: 'morning cutoff 07:30', delta: '● Zero late drops', cls: 'pos', spark: [96, 97, 98, 97, 98, 98.4] },
    ],
    orders: [
      { cafe: 'Third Wave (5 Outlets)', supplier: 'Batch #ROAST-402', value: '₹48,200', status: 'Loaded Van 1', cls: 'active', img: '/logos/third-wave.png', co: 'var(--c-purple)' },
      { cafe: 'Blue Tokai Hub', supplier: 'Single Origin Lot', value: '₹62,400', status: 'In transit', cls: 'info', img: '/logos/blue-tokai.png', co: 'var(--ink)' },
      { cafe: 'Subko Specialty', supplier: 'Barista Oat Milk', value: '₹34,800', status: 'Delivered', cls: 'pos', img: '/logos/subko.png', co: 'var(--c-orange)' },
      { cafe: 'Araku Flagship', supplier: 'Ripple Cups 12oz', value: '₹18,500', status: 'Van 2 Route', cls: 'active', img: '/logos/araku.png', co: 'var(--c-green)' },
    ],
    sideNoteTitle: 'Zero Bad Debt',
    sideNoteDesc: '100% payments guaranteed via Gradient Escrow before vans leave the roastery.',
  },
  brand: {
    portal: 'Brand OS',
    kicker: 'Growth & Telemetry / Q3 Flights',
    title: 'Verified Barista Trials & Conversion',
    desc: 'Track 141 direct barista cupping evaluations and 78% transition into recurring weekly orders.',
    pipeline: [
      { step: '01', title: 'Targeted Flights', proof: '180 Seeded' },
      { step: '02', title: 'Barista Cupping', proof: '141 Notes' },
      { step: '03', title: 'Recurring Wholesale', proof: '78% Converted' },
      { step: '04', title: 'Category Share', proof: '44% Blind' },
    ],
    metrics: [
      { lab: 'Cafés reached', value: 312, suffix: ' venues', d: 'across BLR & BOM hubs', delta: '↑ +34 this mo', cls: 'pos', spark: [210, 240, 265, 280, 298, 312] },
      { lab: 'Barista cupping score', value: 94.2, suffix: '%', d: '141 tasting scorecards', delta: '4.9★ rating', cls: 'pos', spark: [90, 91, 93, 92, 94, 94.2] },
      { lab: 'Recurring volume', value: 2410, suffix: ' L/day', d: 'daily oat milk consumption', delta: '↑ ₹4.8L ARR', cls: 'pos', spark: [1400, 1650, 1890, 2100, 2250, 2410] },
      { lab: 'Category share', value: 44, suffix: '%', d: 'plant milk category leader', delta: 'Blind telemetry', cls: 'pos', spark: [28, 32, 35, 38, 41, 44] },
    ],
    orders: [
      { cafe: 'Subko Specialty / Bandra', supplier: 'Barista Oat Trial', value: 'Converted', status: 'Weekly 120L', cls: 'active', img: '/logos/subko.png', co: 'var(--c-orange)' },
      { cafe: 'Blue Tokai / Koramangala', supplier: 'Matcha Uji Lot', value: 'Cupped', status: '4.9★ Score', cls: 'info', img: '/logos/blue-tokai.png', co: 'var(--ink)' },
      { cafe: 'Third Wave / Indiranagar', supplier: 'Vanilla Syrup 750ml', value: 'Converted', status: 'Weekly 24 Btl', cls: 'active', img: '/logos/third-wave.png', co: 'var(--c-purple)' },
      { cafe: 'Araku / Lavelle Rd', supplier: 'Organic Cascara', value: 'Sampling', status: 'In Review', cls: 'pending', img: '/logos/araku.png', co: 'var(--c-green)' },
    ],
    sideNoteTitle: 'Privacy Wall Enforced',
    sideNoteDesc: 'Competitors cannot see your cafe accounts or pricing. All benchmarking is blind and aggregated.',
  },
};

export function HeroDashboard() {
  const [role, setRole] = useState<'cafe' | 'supplier' | 'brand'>('cafe');
  const cur = ROLE_DATA[role];

  return (
    <MotionConfig reducedMotion="user">
      <div className="cmd">
        <motion.aside
          className="cmd-side"
          variants={sideContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-8%' }}
        >
          <motion.div className="cmd-workspace" variants={drop}>
            <div className="cmd-mark" style={{ background: role === 'supplier' ? '#15803D' : role === 'brand' ? '#6D28D9' : 'var(--ink)' }}>
              {role === 'supplier' ? 'S' : role === 'brand' ? 'B' : 'G'}
            </div>
            <div>
              <strong>Gradient</strong>
              <span>{cur.portal}</span>
            </div>
          </motion.div>
          {SIDE_NAV.map((it) => (
            <motion.div className={`cmd-nav ${it.active ? 'on' : ''}`} key={it.lab} variants={drop}>
              {it.ic}
              <span>{it.lab}</span>
              {it.ct && <b>{it.ct}</b>}
            </motion.div>
          ))}
          <motion.div className="cmd-side-note" variants={drop}>
            <span>{cur.sideNoteTitle}</span>
            <strong>{cur.sideNoteDesc}</strong>
          </motion.div>
        </motion.aside>

        <main className="cmd-main">
          {/* Linear / Stripe Role Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div className="cmd-persona-bar" role="tablist" aria-label="Ecosystem Stakeholder Perspectives">
              <button
                type="button"
                className={`cmd-persona-btn ${role === 'cafe' ? 'active' : ''}`}
                onClick={() => setRole('cafe')}
              >
                <span>☕</span>
                <span>Café Operations</span>
              </button>
              <button
                type="button"
                className={`cmd-persona-btn ${role === 'supplier' ? 'active' : ''}`}
                onClick={() => setRole('supplier')}
              >
                <span>🚚</span>
                <span>Supplier Wholesale</span>
              </button>
              <button
                type="button"
                className={`cmd-persona-btn ${role === 'brand' ? 'active' : ''}`}
                onClick={() => setRole('brand')}
              >
                <span>✨</span>
                <span>Brand Telemetry</span>
              </button>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-soft)' }}>
              <span className="cmd-live-dot" />
              <span>Live Network Sync</span>
            </div>
          </div>

          {/* Minimal Linear-Style Core Idea Pipeline */}
          <div className="cmd-core-flow">
            <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-soft)' }}>CORE PIPELINE:</span>
            {cur.pipeline.map((p, idx) => (
              <React.Fragment key={p.step}>
                <span className="flow-active">
                  <strong style={{ opacity: 0.6, marginRight: 3 }}>{p.step}</strong>
                  {p.title}
                  <small style={{ marginLeft: 4, padding: '1px 5px', borderRadius: 4, background: 'rgba(0,0,0,0.05)', fontSize: 9.5, fontWeight: 700 }}>
                    {p.proof}
                  </small>
                </span>
                {idx < cur.pipeline.length - 1 && <span className="flow-arrow">➔</span>}
              </React.Fragment>
            ))}
          </div>

          <div className="cmd-top">
            <div>
              <span className="cmd-kicker">{cur.kicker}</span>
              <h2>{cur.title}</h2>
              <p>{cur.desc}</p>
            </div>
            <div className="cmd-search">
              <Icon.Search size={14}/>
              <AskTyper />
              <span className="cmd-kbd">⌘K</span>
            </div>
          </div>

          <motion.div
            className="cmd-metrics"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-8%' }}
            key={role}
          >
            {cur.metrics.map((s) => (
              <motion.div className="cmd-metric" key={s.lab} variants={rise}>
                <span>{s.lab}</span>
                <strong><CountNum value={s.value} prefix={(s as any).prefix || ''} suffix={s.suffix} decimals={(s as any).prefix ? 1 : (s.suffix.includes('%') || s.suffix.includes('°C') ? 1 : 0)} /></strong>
                <div className="cmd-spark">
                  {s.spark.map((v, i) => (
                    <motion.i
                      key={i}
                      style={{ height: `${(v / Math.max(...s.spark)) * 100}%`, transformOrigin: 'bottom' }}
                      initial={{ scaleY: 0, opacity: 0 }}
                      whileInView={{ scaleY: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.05, ease: [0.22, 0.61, 0.36, 1] }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <small>{s.d}</small>
                  <span className={`cmd-metric-delta ${s.cls}`}>{s.delta}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="cmd-grid"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-8%' }}
          >
            <motion.section className="cmd-panel wide" variants={rise}>
              <div className="cmd-panel-head">
                <strong>{role === 'supplier' ? 'Morning Dispatch Manifest' : role === 'brand' ? 'Trial & Flight Conversions' : 'Orders routed by supplier'}</strong>
                <span className="cmd-live"><span className="cmd-live-dot" />{role === 'supplier' ? 'T+1 Escrow Ready' : role === 'brand' ? 'Verified Cuppings' : 'Live split PO'}</span>
              </div>
              {cur.orders.map((row, i) => (
                <motion.div
                  className="cmd-row"
                  key={row.cafe}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.15 + i * 0.08, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  <div className="cmd-row-name">
                    <RowAvatar name={row.cafe} img={row.img} co={row.co} />
                    <div>
                      <strong>{row.cafe}</strong>
                      <span>{row.supplier}</span>
                    </div>
                  </div>
                  <b>{row.value}</b>
                  <em className={`pill ${row.cls}`}>{row.status}</em>
                </motion.div>
              ))}
            </motion.section>

            <motion.section className="cmd-panel" variants={rise}>
              <div className="cmd-panel-head">
                <strong>{role === 'supplier' ? 'T+1 Settlement Velocity' : 'Brand trial funnel'}</strong>
                <span>{role === 'supplier' ? 'HDFC Bank Auto' : 'Own products only'}</span>
              </div>
              <div className="cmd-funnel">
                {FUNNEL.map((f, i) => (
                  <motion.div
                    key={f.step}
                    initial={{ height: 40, opacity: 0 }}
                    whileInView={{ height: f.h, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.08, ease: [0.22, 0.61, 0.36, 1] }}
                  >
                    <span>{f.step}</span>
                    <strong><CountNum value={f.n} /></strong>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            <motion.section className="cmd-panel dark" variants={rise}>
              <div className="cmd-panel-head">
                <strong>Privacy &amp; Escrow Wall</strong>
                <span>Enforced</span>
              </div>
              <p>Competitor pricing, negotiated cafe deals, and other brands&apos; sales never enter competitor workspaces.</p>
              <div className="cmd-locks">
                <span>SKU scope</span>
                <span>Cafe identity</span>
                <span>Escrow locked</span>
              </div>
            </motion.section>
          </motion.div>
        </main>
      </div>
    </MotionConfig>
  );
}

export function ShowcaseSourcing() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 200px) minmax(0, 1fr) minmax(220px, 240px)', height: '100%' }}>
      <div style={{ borderRight: '1px solid var(--border-soft)', padding: 18, background: 'var(--surface-2)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--ink-soft)', marginBottom: 12 }}>Filter</div>
        {[
          { lab: 'Category', val: 'Coffee · Beans' },
          { lab: 'Origin', val: 'Karnataka' },
          { lab: 'Roast', val: 'Medium' },
          { lab: 'MOQ', val: '5–25 kg' },
          { lab: 'Lead time', val: '< 48h' },
        ].map((f, i) => (
          <div key={i} style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 10, marginBottom: 8, border: '1px solid var(--border-soft)' }}>
            <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{f.lab}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{f.val}</div>
          </div>
        ))}
        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-soft)' }}>248 SKUs · 34 suppliers</div>
      </div>
      <div style={{ padding: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, minWidth: 0 }}>
          <div style={{ flex: 1, minWidth: 0, padding: '8px 12px', background: 'var(--surface-2)', border: '1px solid var(--border-soft)', borderRadius: 10, fontSize: 12.5, color: 'var(--ink-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>🔎 Search 1,840 SKUs · 87 suppliers</div>
          <button style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, padding: '7px 10px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border-soft)', color: 'var(--ink)', whiteSpace: 'nowrap' }}>Best price</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, minWidth: 0 }}>
          {[
            { nm: 'Attikan Estate', sup: 'Blue Tokai', pr: '₹820/kg', moq: '5kg', co: 'orange' },
            { nm: 'Monsoon Malabar', sup: 'Araku', pr: '₹740/kg', moq: '10kg', co: 'green' },
            { nm: 'Ratnagiri Peaberry', sup: 'Subko', pr: '₹960/kg', moq: '5kg', co: 'purple' },
            { nm: 'Kelagur Heights', sup: 'Third Wave', pr: '₹680/kg', moq: '15kg', co: 'blue' },
            { nm: 'Bibi Plantation', sup: 'Roastery', pr: '₹890/kg', moq: '8kg', co: 'pink' },
            { nm: 'Sandalwood Reserve', sup: 'Devans', pr: '₹920/kg', moq: '3kg', co: 'cyan' },
          ].map((p, i) => (
            <div key={i} style={{ border: '1px solid var(--border-soft)', borderRadius: 10, overflow: 'hidden', background: 'var(--surface)', minWidth: 0 }}>
              <div style={{ aspectRatio: '1.6', background: `var(--c-${p.co}-bg)`, display: 'grid', placeItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 99, background: `var(--c-${p.co})`, opacity: .25 }}></div>
              </div>
              <div style={{ padding: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nm}</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.sup} · MOQ {p.moq}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{p.pr}</div>
                  <button style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 7px', borderRadius: 6, background: 'var(--ink)', color: '#fff', border: 0, whiteSpace: 'nowrap' }}>+ Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <aside style={{ borderLeft: '1px solid var(--border-soft)', padding: 18, background: 'var(--surface-2)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Cart · 8 items</div>
        {[
          { nm: 'Attikan Estate', q: '5kg', pr: '₹4,100' },
          { nm: 'Monsoon Malabar', q: '10kg', pr: '₹7,400' },
          { nm: 'Ratnagiri', q: '5kg', pr: '₹4,800' },
        ].map((c, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-soft)', fontSize: 12 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{c.nm}</div>
              <div style={{ color: 'var(--ink-soft)', fontSize: 11, marginTop: 2 }}>{c.q}</div>
            </div>
            <div style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{c.pr}</div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontWeight: 700, fontSize: 14 }}>
          <span>Total</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>₹32,460</span>
        </div>
        <button style={{ width: '100%', padding: '11px 14px', background: 'var(--ink)', color: '#fff', borderRadius: 10, border: 0, fontWeight: 600, marginTop: 14, fontSize: 13 }}>Place order →</button>
        <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 8 }}>3 suppliers · combined into 1 invoice</div>
      </aside>
    </div>
  );
}

export function ShowcaseInventory() {
  return (
    <div style={{ padding: 18, height: '100%', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--surface)', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minWidth: 0 }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: '-.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Inventory · Indiranagar</h3>
          <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 }}>6 cafés · Last sync 12s</div>
        </div>
        <div style={{ flexShrink: 0, display: 'flex', gap: 6 }}>
          <button style={{ fontSize: 11.5, fontWeight: 600, padding: '6px 10px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border-soft)', color: 'var(--ink)', whiteSpace: 'nowrap' }}>Reorder list</button>
          <button style={{ fontSize: 11.5, fontWeight: 600, padding: '6px 10px', borderRadius: 8, background: 'var(--ink)', border: 0, color: '#fff', whiteSpace: 'nowrap' }}>Auto-replenish ON</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 12, flex: 1, minHeight: 0 }}>
        <div style={{ border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'hidden', minWidth: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {['SKU', 'On hand', 'Par', 'Reorder', 'Trend'].map((h, i) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10, fontWeight: 500, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.04em', width: i === 0 ? '34%' : i === 3 ? '24%' : i === 4 ? '14%' : '14%' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { nm: 'Whole milk · 1L', on: '24', par: '40', re: 'Auto · today', pct: 0.6, low: true },
                { nm: 'Oat milk · 1L', on: '12', par: '20', re: 'Auto · today', pct: 0.6, low: true },
                { nm: 'Espresso beans · 1kg', on: '34', par: '30', re: '', pct: 1.0, low: false },
                { nm: 'Sugar sachets ×500', on: '8', par: '12', re: 'Pending', pct: 0.66, low: true },
                { nm: '12oz cups ×1000', on: '6', par: '8', re: '', pct: 0.75, low: false },
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.nm}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{r.on}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--ink-soft)' }}>{r.par}</td>
                  <td style={{ padding: '8px 10px' }}>
                    {r.re === '' ? <span style={{ color: 'var(--ink-soft)' }}>–</span> : <span className={`pill ${r.low ? 'pending' : 'info'}`} style={{ fontSize: 10, padding: '2px 7px', whiteSpace: 'nowrap' }}>{r.re}</span>}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ width: '100%', height: 5, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, r.pct * 100)}%`, background: r.low ? 'var(--c-orange)' : 'var(--c-green)', borderRadius: 99 }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          <div style={{ padding: 14, background: 'var(--c-purple-bg)', borderRadius: 12, color: 'var(--c-purple)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .85 }}>AI suggestion</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 6, lineHeight: 1.35, color: 'var(--ink)' }}>Raise par on Oat milk by 30%, weekend demand up 22%.</div>
            <button style={{ marginTop: 10, padding: '5px 11px', background: 'var(--c-purple)', color: '#fff', border: 0, borderRadius: 7, fontSize: 11, fontWeight: 600 }}>Apply</button>
          </div>
          <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border-soft)', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)' }}>This week&apos;s wastage</div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', marginTop: 4 }}>2.1%</div>
            <div style={{ fontSize: 10.5, color: 'var(--c-green)', fontWeight: 600, marginTop: 2 }}>↓ 0.7pp vs last week</div>
            <div style={{ marginTop: 10, flex: 1, minHeight: 28 }}>
              <div className="mini-bars" style={{ height: '100%' }}>
                {[40, 55, 35, 60, 30, 25, 20].map((h, i) => (
                  <div key={i} className="b" style={{ height: `${h}%`, background: i > 3 ? 'var(--c-green)' : 'var(--c-orange)' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShowcaseInsights() {
  const ranges = ['1W', '4W', '12W', '1Y'] as const;
  type Range = typeof ranges[number];
  const seriesByRange: Record<Range, number[]> = {
    '1W':  [58, 72, 65, 80, 74, 88, 95],
    '4W':  [62, 70, 58, 76, 82, 68, 90, 86],
    '12W': [62, 78, 45, 88, 92, 70, 95, 80, 100, 86, 72, 110],
    '1Y':  [48, 55, 62, 70, 68, 76, 84, 90, 88, 102, 110, 124],
  };
  const titleByRange: Record<Range, string> = {
    '1W':  'GMV · Last 7 days',
    '4W':  'GMV · Trailing 4 weeks',
    '12W': 'GMV · Trailing 12 weeks',
    '1Y':  'GMV · Last 12 months',
  };
  const [range, setRange] = useState<Range>('12W');
  const days = seriesByRange[range];
  const max = Math.max(...days);
  const w = 880, h = 280, pad = 30;
  const xs = days.map((_, i) => pad + (i * (w - pad * 2)) / (days.length - 1));
  const ys = days.map(v => h - pad - ((v / max) * (h - pad * 2)));
  const path = days.map((_, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${ys[i]}`).join(' ');
  const area = `${path} L ${xs[xs.length-1]} ${h - pad} L ${xs[0]} ${h - pad} Z`;
  const peakIdx = ys.reduce((best, _, i) => (days[i] > days[best] ? i : best), 0);
  const peakLabel = range === '1Y' ? `Month ${peakIdx + 1}` : `Week ${peakIdx + 1}`;
  const peakValue = `₹${(days[peakIdx] / 10).toFixed(1)}L`;

  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    el.style.transition = 'none';
    el.style.clipPath = 'inset(0 100% 0 0)';
    void el.offsetHeight;
    const id = requestAnimationFrame(() => {
      el.style.transition = '';
      el.style.clipPath = '';
    });
    return () => cancelAnimationFrame(id);
  }, [range]);

  return (
    <div style={{ padding: 28, height: '100%', display: 'flex', flexDirection: 'column', gap: 18, background: 'var(--surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>{titleByRange[range]}</h3>
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 3 }}>All cafés · Compared to industry benchmark</div>
        </div>
        <div style={{ display: 'inline-flex', gap: 4, padding: 3, background: 'var(--surface-2)', borderRadius: 8, fontSize: 11.5 }} role="tablist">
          {ranges.map((t) => {
            const on = range === t;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setRange(t)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontWeight: 600,
                  background: on ? 'var(--surface)' : 'transparent',
                  color: on ? 'var(--ink)' : 'var(--ink-soft)',
                  boxShadow: on ? '0 1px 2px rgba(0,0,0,.04)' : 'none',
                  border: 0,
                  cursor: 'pointer',
                  transition: 'background .18s, color .18s',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { l: 'GMV', v: '₹84.2L', d: '+18.4%', cls: 'green' },
          { l: 'Orders', v: '1,284', d: '+12.1%', cls: 'blue' },
          { l: 'Avg. ticket', v: '₹6,540', d: '+5.6%', cls: 'purple' },
          { l: 'Repeat rate', v: '72%', d: '+3.2pp', cls: 'orange' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '14px 16px', border: '1px solid var(--border-soft)', borderRadius: 12 }}>
            <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', fontWeight: 600 }}>{s.l}</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: `var(--c-${s.cls})`, marginTop: 4, fontWeight: 600 }}>{s.d}</div>
          </div>
        ))}
      </div>

      <div ref={chartRef} className="insights-chart" style={{ border: '1px solid var(--border-soft)', borderRadius: 14, padding: 18, flex: 1, position: 'relative' }}>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs>
            <linearGradient id="grad-line" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--c-purple)" stopOpacity=".25"/>
              <stop offset="100%" stopColor="var(--c-purple)" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map(i => (
            <line key={i} x1={pad} x2={w - pad} y1={pad + i * ((h - pad * 2) / 3)} y2={pad + i * ((h - pad * 2) / 3)} stroke="var(--border-soft)" strokeWidth="1" />
          ))}
          <path d={area} fill="url(#grad-line)" />
          <path d={path} fill="none" stroke="var(--c-purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {xs.map((x, i) => (
            <circle key={i} cx={x} cy={ys[i]} r="4" fill="var(--surface)" stroke="var(--c-purple)" strokeWidth="2" />
          ))}
          <g transform={`translate(${xs[peakIdx]} ${ys[peakIdx]})`}>
            <rect x="-58" y="-46" width="116" height="34" rx="8" fill="var(--ink)" />
            <text x="0" y="-30" textAnchor="middle" fill="rgba(255,255,255,.6)" fontSize="9" fontFamily="var(--font-sans)">{peakLabel}</text>
            <text x="0" y="-18" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)">{peakValue}</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
