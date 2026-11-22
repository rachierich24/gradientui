'use client';

import React, { useRef, useState, useEffect, useCallback, type CSSProperties } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValueEvent,
  useMotionValue,
} from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────
   THE ECOSYSTEM, THEN A TOUR OF THE THREE PORTALS
   One pinned stage over a tall track (.eco-track, 480vh; the stage is 100vh, so 380vh of scroll):

   1. Chapter 1 — "Connecting cafés, suppliers & brands": the supplier portal, the café app on a phone and
      the brand portal side by side. Pointing at a side portal brings it to the centre and plays its film.
   2. The phone comes down into the tour: the side portals fall away and the heading lifts, a red panel
      rises from below on the right, and the phone comes down and across into it, growing as it lands.
      A rail and the café's words come in on the left.
   3. The tour, after mixpanel.com's product tour (read from its page: a sticky stage over about a screen
      of scroll per product, switched at scroll thresholds, each switch a timed transition):
      · a rail on the left (Cafés · Suppliers · Brands): the active one filled, its icon in its colour;
      · the words: a tinted chip, a two-line title, a line, a pill button, and a bordered card that
        follows the film playing ("Now showing"), whose segments seek it;
      · a tall colour panel on the right — red, then green, then purple — holding the product.
      On a switch the old words go at once and the new ones fade up 10px; the panel's colour field
      crossfades; the product is cleared and rebuilt — the phone drops out and a browser window rises in
      with the supplier film; from supplier to brand the window stays and its film, address and badge
      change. A floating card (a delivery, an order, a repeat order) pops in after each, like Mixpanel's
      insight cards.
   At 860px and below, and with reduced motion, the portals are a plain stack of cards instead.
───────────────────────────────────────────────────────────────────────── */

type PortalId = 'cafe' | 'supplier' | 'brand';
type Step = { at: number; title: string; text: string };
type Portal = {
  id: PortalId; anchor: string; rail: string; chip: string; title: string; body: string;
  cta: { label: string; href: string }; film: string; url?: string; steps: Step[];
};

const PORTALS: Portal[] = [
  {
    id: 'cafe', anchor: 'for-cafes', rail: 'Cafés', chip: 'For cafés',
    title: 'Everything your café needs, from order to delivery.',
    body: 'Find verified suppliers, order from all of them in one basket, follow every delivery and keep your stock in sync.',
    cta: { label: 'Explore the café app', href: '/cafe' }, film: '/cafe.mp4',
    // the chapters of /cafe.mp4, in seconds
    steps: [
      { at: 0, title: 'Discover suppliers', text: 'Browse verified suppliers with clear wholesale prices.' },
      { at: 5, title: 'Order in seconds', text: 'One basket across every supplier. No WhatsApp mix-ups.' },
      { at: 11, title: 'Track every delivery', text: 'Live route, driver and cold-chain temperature.' },
      { at: 16, title: 'Keep stock in sync', text: 'Stock updates the moment a delivery is signed for.' },
    ],
  },
  {
    id: 'supplier', anchor: 'for-suppliers', rail: 'Suppliers', chip: 'For suppliers',
    title: 'Supply more. Manage less.',
    body: 'Every café’s order lands in one inbox. Accept a morning’s orders together, pack them into runs and follow every van.',
    cta: { label: 'Explore the supplier portal', href: '/supplier' }, film: '/suppliers.mp4', url: 'app.gradient365.com/supplier',
    steps: [
      { at: 0, title: 'Every order, one inbox', text: 'Orders from every café arrive as clean purchase orders.' },
      { at: 3, title: 'Accept in batches', text: 'Select a morning’s orders and accept them together.' },
      { at: 6, title: 'Pack and assign runs', text: 'Accepted orders are packed and grouped into delivery runs.' },
      { at: 10, title: 'Track runs live', text: 'Vans out, drops done and the on-time rate, as they happen.' },
    ],
  },
  {
    id: 'brand', anchor: 'for-brands', rail: 'Brands', chip: 'For brands',
    title: 'Grow distribution across India’s best cafés.',
    body: 'See which cafés stock you and what they sell, watch demand on a live map, and turn trials into weekly orders.',
    cta: { label: 'Explore the brand portal', href: '/brand' }, film: '/brands.mp4', url: 'app.gradient365.com/brand',
    steps: [
      { at: 0, title: 'Sales across every café', text: 'Revenue and orders from every café that stocks you.' },
      { at: 4, title: 'See where it sells', text: 'A live map of consumption, down to the neighbourhood.' },
      { at: 9, title: 'Every order and trial, live', text: 'Repeat orders and new trials, the moment they’re placed.' },
    ],
  },
];

// Where things happen along the track (fractions of its 380vh of scroll)
const REST = 0.07;      // chapter 1 holds still until here
const LAND = 0.27;      // the phone has come down into the panel
const TOUR_ON = 0.2;    // the tour's words and rail take over (pointer events, films)
const SUP_AT = 0.52;    // the supplier portal takes the panel
const BRAND_AT = 0.76;  // the brand portal takes the panel
const RANGE_VH = 380;
// a portal's anchor sits half a screen past its threshold, so the section rail lights it as the panel switches,
// and jumping to it (nav, rail) lands inside that portal's stretch of scroll
const anchorTop = (p: number) => `${(p * RANGE_VH + 50).toFixed(1)}vh`;
const STARTS = [LAND, SUP_AT, BRAND_AT];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
// an element's offset inside an ancestor, ignoring transforms
const offsetIn = (el: HTMLElement, root: HTMLElement) => {
  let x = 0, y = 0, n: HTMLElement | null = el;
  while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
  return n === root ? { x, y } : null;
};

const ICONS: Record<PortalId, React.ReactNode> = {
  cafe: <><path d="M4 7.5h12V13a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" /><path d="M16 9.5h1.6a2.4 2.4 0 0 1 0 4.8H16" fill="none" stroke="currentColor" strokeWidth="1.9" /><rect x="3" y="19.6" width="14" height="1.9" rx=".95" /></>,
  supplier: <><path d="M12 3.2l8 4.4-8 4.4-8-4.4z" opacity=".55" /><path d="M3.6 8.6l7.6 4.2v8.4l-7.6-4.2z" /><path d="M20.4 8.6l-7.6 4.2v8.4l7.6-4.2z" opacity=".8" /></>,
  brand: <path fillRule="evenodd" d="M3 12.4V4h8.4L21 13.6 13.6 21zM7.6 9.2a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z" />,
};
const PortalIcon = ({ id }: { id: PortalId }) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{ICONS[id]}</svg>;
const Chevron = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>;
const Lock = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/* "Now showing": the chapter of the film playing, with a segment per chapter (past ones full, the current one
   filling as it plays); a segment seeks the film to its chapter. Reads the film every frame while `on`. */
function NowShowing({ p, film, on, onSeek }: { p: Portal; film: React.RefObject<HTMLVideoElement | null>; on: boolean; onSeek: (at: number) => void }) {
  const [step, setStep] = useState(0);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const v = film.current;
      if (!v || !v.duration) return;
      const t = v.currentTime;
      let i = 0;
      p.steps.forEach((s, k) => { if (t >= s.at) i = k; });
      const end = i + 1 < p.steps.length ? p.steps[i + 1].at : v.duration;
      const f = clamp((t - p.steps[i].at) / Math.max(0.1, end - p.steps[i].at));
      setStep((s) => (s === i ? s : i));
      fills.current.forEach((el, k) => el?.style.setProperty('--f', String(k < i ? 1 : k === i ? f : 0)));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on, p, film]);
  const s = p.steps[step];
  return (
    <div className="pt-now">
      <div className="pt-now-in">
        <div className="pt-now-head"><span>Now showing</span><span>{String(step + 1).padStart(2, '0')} / {String(p.steps.length).padStart(2, '0')}</span></div>
        <b className="pt-now-title" key={s.title}>{s.title}</b>
        <p className="pt-now-text" key={s.text}>{s.text}</p>
        <div className="pt-now-segs">
          {p.steps.map((x, k) => (
            <button key={x.title} type="button" aria-label={`Play: ${x.title}`} onClick={() => onSeek(x.at)}>
              <span ref={(el) => { fills.current[k] = el; }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// the words for a portal: chip, title, line, button, and the film's chapters
function PortalCopy({ p, film, on, onSeek }: { p: Portal; film: React.RefObject<HTMLVideoElement | null>; on: boolean; onSeek: (at: number) => void }) {
  return (
    <>
      <span className="pt-chip"><PortalIcon id={p.id} />{p.chip}</span>
      <h3 className="pt-title">{p.title}</h3>
      <p className="pt-body">{p.body}</p>
      <a className="pt-cta" href={p.cta.href}>{p.cta.label}<Chevron /></a>
      <NowShowing p={p} film={film} on={on} onSeek={onSeek} />
    </>
  );
}

// the floating card each portal gets once its product is in (Mixpanel's insight cards)
function FloatCard({ id }: { id: PortalId }) {
  if (id === 'cafe') {
    return (
      <div className="pt-float is-cafe">
        <span className="pt-float-icon"><PortalIcon id="cafe" /></span>
        <span className="pt-float-tx"><small>ORD-9314 · Southfield Supply Co.</small><b>Out for delivery</b></span>
        <span className="pt-float-eta"><small>ETA</small><b>7:40</b></span>
        <span className="pt-float-track"><i /><i /><i /><i /></span>
      </div>
    );
  }
  if (id === 'supplier') {
    return (
      <div className="pt-float is-supplier">
        <span className="pt-float-from"><b>Tamarind Lane Cafe</b> · Hauz Khas · WhatsApp</span>
        <span className="pt-float-bubble">“Same as last week please, 6 bags House Espresso for tomorrow morning”</span>
        <span className="pt-float-po"><span><b>6 × House Espresso 1 kg</b><small>Tomorrow, 7–9 AM</small></span><em>₹6,900</em><i>Accepted</i></span>
      </div>
    );
  }
  return (
    <div className="pt-float is-brand">
      <span className="pt-float-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
      <span className="pt-float-tx"><small>Repeat order · just now</small><b>Tamarind Lane Cafe</b><small>Hauz Khas · 6 × House Espresso</small></span>
      <span className="pt-float-amt">₹6,900</span>
    </div>
  );
}

export function EcosystemShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion();

  // Visibility: the films only play while the section is on screen and the tab is showing
  const [isVisible, setIsVisible] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(() => (typeof document !== 'undefined' ? !document.hidden : true));
  // The tour (desktop with motion) or the stacked cards (narrow screens, reduced motion)
  const [desk, setDesk] = useState(true);

  // Chapter 1 state
  const [hoveredScreen, setHoveredScreen] = useState<'supplier' | 'mobile' | 'brand' | null>(null);
  const [activeVideoScreen, setActiveVideoScreen] = useState<'mobile' | 'supplier' | 'brand'>('mobile');
  const [isAtRest, setIsAtRest] = useState(true);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // The tour's state
  const [tourOn, setTourOn] = useState(false);   // its words and rail have taken over
  const [landed, setLanded] = useState(false);   // the phone has come down into the panel
  const [tab, setTab] = useState(0);             // 0 café · 1 supplier · 2 brand

  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const supplierVideoRef = useRef<HTMLVideoElement | null>(null);
  const brandVideoRef = useRef<HTMLVideoElement | null>(null);
  const tourSupRef = useRef<HTMLVideoElement | null>(null);
  const tourBrandRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 861px) and (prefers-reduced-motion: no-preference)');
    const set = () => setDesk(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  useEffect(() => {
    const onVis = () => setIsTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Chromium pausing background media to save power rejects play(); those rejections are expected
  useEffect(() => {
    const quiet = (msg: string, name = '') =>
      name === 'AbortError' || name === 'NotAllowedError' || /AbortError|paused to save power|play\(\)|interrupted/.test(msg);
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason as { name?: string; message?: string } | undefined;
      if (quiet(String(r?.message ?? r ?? ''), String(r?.name ?? ''))) e.preventDefault();
    };
    const onError = (e: ErrorEvent) => { if (quiet(String(e.message || ''))) e.preventDefault(); };
    window.addEventListener('unhandledrejection', onRejection);
    window.addEventListener('error', onError);
    return () => { window.removeEventListener('unhandledrejection', onRejection); window.removeEventListener('error', onError); };
  }, []);

  const safePlay = useCallback((video: HTMLVideoElement | null) => {
    if (!video || document.hidden) return;
    try {
      video.muted = true;
      const pr = video.play();
      if (pr && typeof pr.catch === 'function') pr.catch(() => {});
    } catch {}
  }, []);
  const safePause = useCallback((video: HTMLVideoElement | null) => { try { video?.pause(); } catch {} }, []);
  const loop = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    try { v.currentTime = 0; } catch {}
    safePlay(v);
  }, [safePlay]);

  // Which film plays: in the tour, the active portal's; in chapter 1, the phone's, or a side portal's while it
  // has the centre. The window films start from the top each time their portal comes in.
  useEffect(() => {
    const films = { phone: mobileVideoRef.current, sup: supplierVideoRef.current, brand: brandVideoRef.current, tSup: tourSupRef.current, tBrand: tourBrandRef.current };
    const playing = !isVisible || !isTabVisible ? null
      : desk && tourOn ? (['phone', 'tSup', 'tBrand'] as const)[tab]
      : activeVideoScreen === 'mobile' ? 'phone' : activeVideoScreen === 'supplier' ? 'sup' : 'brand';
    let t: ReturnType<typeof setTimeout> | undefined;
    (Object.keys(films) as (keyof typeof films)[]).forEach((k) => {
      const v = films[k];
      if (!v) return;
      if (k === playing) {
        if (k === 'phone') safePlay(v);
        else { try { v.currentTime = 0; } catch {} t = setTimeout(() => safePlay(v), k === 'sup' || k === 'brand' ? 250 : 320); }
      } else {
        safePause(v);
        if (k !== 'phone') { try { v.currentTime = 0; } catch {} }
      }
    });
    return () => { if (t) clearTimeout(t); };
  }, [activeVideoScreen, isVisible, isTabVisible, tourOn, tab, desk, safePlay, safePause]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setIsVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ─── Scroll ───
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  // springy smoothing for the scrubbed motion (chapter 1 → tour); the tour's switches use the raw progress
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.28, restDelta: 0.0001 });

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    setTourOn(p >= TOUR_ON);
    setLanded(p >= LAND - 0.01);
    setTab(p < SUP_AT ? 0 : p < BRAND_AT ? 1 : 2);
  });
  useMotionValueEvent(smoothProgress, 'change', (p) => {
    if (p > REST * 0.9) { setHoveredScreen(null); setActiveVideoScreen('mobile'); }
    setIsAtRest(p <= REST * 0.9);
    // the pointer parallax steps aside while scrolling
    setIsScrolling(true);
    setPointerOffset({ x: 0, y: 0 });
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 180);
  });

  // Chapter 1's heading lifts away and its side portals fall back, outward and up
  const ecoTextOpacity = useTransform(smoothProgress, [0, REST, REST + 0.08], [1, 1, 0]);
  const ecoTextY = useTransform(smoothProgress, [0, REST, REST + 0.08], [0, 0, -60]);
  const sideOut = [0, REST, REST + 0.12];
  const supplierX = useTransform(smoothProgress, sideOut, [0, 0, -90]);
  const brandX = useTransform(smoothProgress, sideOut, [0, 0, 90]);
  const sideY = useTransform(smoothProgress, sideOut, [0, 0, -50]);
  const sideScale = useTransform(smoothProgress, sideOut, [1, 1, 0.9]);
  const sideOpacity = useTransform(smoothProgress, [0, REST, REST + 0.1], [1, 1, 0]);

  // The panel rises from below; the rail and words come in
  const panelY = useTransform(smoothProgress, [REST + 0.02, LAND - 0.03], ['104%', '0%'], { ease: (t) => 1 - (1 - t) ** 3 });
  const panelOpacity = useTransform(smoothProgress, [REST + 0.02, REST + 0.05], [0, 1]);
  const frontOpacity = useTransform(smoothProgress, [LAND - 0.1, LAND - 0.01], [0, 1]);
  const frontY = useTransform(smoothProgress, [LAND - 0.1, LAND - 0.01], [24, 0]);

  // The phone comes down and across into the panel's slot, growing to fill it. The move is measured from
  // layout (offsets ignore transforms) whenever the stage changes size.
  const dropX = useMotionValue(0), dropY = useMotionValue(24), dropScale = useMotionValue(1);
  useEffect(() => {
    const measure = () => {
      const ph = phoneRef.current, slot = slotRef.current, stage = stageRef.current;
      if (!ph || !slot || !stage || !slot.offsetHeight) { dropX.set(0); dropY.set(24); dropScale.set(1); return; }
      const a = offsetIn(ph, stage), b = offsetIn(slot, stage);
      if (!a || !b) return;
      dropX.set(b.x + slot.offsetWidth / 2 - (a.x + ph.offsetWidth / 2));
      dropY.set(b.y + slot.offsetHeight / 2 - (a.y + ph.offsetHeight / 2));
      dropScale.set(slot.offsetHeight / ph.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    if (slotRef.current) ro.observe(slotRef.current);
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [dropX, dropY, dropScale, desk]);
  // down first, then across: the drop leads and the slide follows a little later
  const kDown = (p: number) => smooth(clamp((p - REST) / (LAND - REST - 0.03)));
  const kAcross = (p: number) => smooth(clamp((p - REST - 0.03) / (LAND - REST - 0.03)));
  const phoneX = useTransform([smoothProgress, dropX], ([p, dx]: number[]) => (desk ? dx * kAcross(p) : 0));
  const phoneY = useTransform([smoothProgress, dropY], ([p, dy]: number[]) => (desk ? 24 + (dy - 24) * kDown(p) : 24));
  const phoneScale = useTransform([smoothProgress, dropScale], ([p, s]: number[]) => (desk ? 1 + (s - 1) * kDown(p) : 1));

  // ─── Chapter 1: pointing at a side portal brings it to the centre and plays its film ───
  const supplierWinRef = useRef<HTMLDivElement>(null);
  const brandWinRef = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState({ supplier: { x: 0, s: 1 }, brand: { x: 0, s: 1 } });
  useEffect(() => {
    const measure = () => {
      const sup = supplierWinRef.current, brand = brandWinRef.current, group = sup?.parentElement;
      if (!sup || !brand || !group || window.innerWidth <= 860) { setFocus({ supplier: { x: 0, s: 1 }, brand: { x: 0, s: 1 } }); return; }
      const centre = group.clientWidth / 2, target = Math.min(group.clientWidth * 0.68, 820);
      const of = (el: HTMLElement) => ({ x: Math.round(centre - (el.offsetLeft + el.offsetWidth / 2)), s: +Math.min(1.75, target / el.offsetWidth).toFixed(3) });
      setFocus({ supplier: of(sup), brand: of(brand) });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  const sideFocused = isAtRest && (hoveredScreen === 'supplier' || hoveredScreen === 'brand') && focus.supplier.s > 1;
  const focusVars = (side: 'supplier' | 'brand') => ({ ['--focus-x' as string]: `${focus[side].x}px`, ['--focus-scale' as string]: focus[side].s }) as CSSProperties;
  const focusSide = useCallback((side: 'supplier' | 'brand') => {
    if (!isAtRest) return;
    setHoveredScreen(side);
    setActiveVideoScreen(side);
  }, [isAtRest]);
  const unfocusSide = useCallback(() => {
    setHoveredScreen(null);
    setActiveVideoScreen('mobile');
    setPointerOffset({ x: 0, y: 0 });
  }, []);
  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isScrolling || !isAtRest) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 6, y = ((e.clientY - r.top) / r.height - 0.5) * 6;
    setPointerOffset({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  };

  // ─── The tour's controls ───
  const films = [mobileVideoRef, tourSupRef, tourBrandRef];
  const seek = useCallback((k: number, at: number) => {
    const v = films[k].current;
    if (!v) return;
    try { v.currentTime = at; } catch {}
    safePlay(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePlay]);
  // the rail jumps to a portal's anchor
  const goTo = useCallback((k: number) => {
    const el = document.getElementById(PORTALS[k].anchor);
    if (!el) return;
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: Element, o?: object) => void } }).lenis;
    if (lenis?.scrollTo) lenis.scrollTo(el, { offset: 0 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const P = PORTALS[tab];
  const stageBg = '#FFFFFF';

  return (
    <section className={`eco-track${desk ? ' is-tour' : ''}`} ref={trackRef} id="ecosystem" aria-label="The Gradient ecosystem: cafés, suppliers and brands">
      {/* each portal's anchor, half a screen past where it takes the panel (see anchorTop) */}
      {desk && PORTALS.map((p, k) => <span key={p.id} id={p.anchor} className="pt-anchor" style={{ top: anchorTop(STARTS[k]) }} aria-hidden="true" />)}

      <motion.div className="eco-sticky-stage" ref={stageRef} style={{ backgroundColor: stageBg }}>
        {/* the curve from the hero */}
        <div className="eco-top-curve" aria-hidden="true">
          <svg viewBox="0 0 1440 40" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 Q720,0 1440,40 L1440,40 L0,40 Z" style={{ fill: stageBg }} />
          </svg>
        </div>
        <div className="eco-radial-glow" aria-hidden="true" />

        {/* ─── CHAPTER 1: the heading ─── */}
        <div className="eco-container">
          <motion.div
            className="eco-text-wrap"
            style={isReduced ? { opacity: 1, y: 0 } : { opacity: ecoTextOpacity, y: ecoTextY, pointerEvents: isAtRest ? 'auto' : 'none' }}
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

        {/* ─── THE TOUR, BEHIND THE DEVICES: the colour panel (it rises from below as the phone comes down) ─── */}
        {desk && (
          <div className="pt-back" aria-hidden="true">
            <motion.div className="pt-panel" style={{ y: panelY, opacity: panelOpacity }}>
              {PORTALS.map((p, k) => <span key={p.id} className={`pt-field is-${p.id}${k === tab ? ' is-on' : ''}`} />)}
              <span className="pt-grain" />
              <div className="pt-area">
                {/* the phone's place in the panel: it comes down into this box (measured, never drawn) */}
                <div className="pt-slot" ref={slotRef} />
                {/* the supplier and brand portals share one window: from one to the other only its insides change */}
                <div className={`pt-window${tab > 0 ? ' is-on' : ''}`} data-portal={tab === 2 ? 'brand' : 'supplier'}>
                  <div className="eco-chrome">
                    <div className="eco-chrome-dots"><span className="eco-dot eco-dot-red" /><span className="eco-dot eco-dot-yellow" /><span className="eco-dot eco-dot-green" /></div>
                    <div className="eco-url-bar" key={`url-${tab}`}>
                      <Lock /><span>{(tab === 2 ? PORTALS[2] : PORTALS[1]).url}</span>
                      <span className={`eco-url-ping ${tab === 2 ? 'ping-brand' : 'ping-supplier'}`} />
                    </div>
                    <div className={`eco-window-role-badge ${tab === 2 ? 'badge-brand' : 'badge-supplier'}`} key={`badge-${tab}`}>
                      <span className="eco-role-dot" />{tab === 2 ? 'BRAND' : 'SUPPLIER'}
                    </div>
                  </div>
                  <div className="eco-video-body pt-films">
                    <video ref={tourSupRef} className={`pt-film${tab === 1 ? ' is-on' : ''}`} src="/suppliers.mp4" playsInline muted
                      preload={tourOn ? 'auto' : 'metadata'} onEnded={loop} />
                    <video ref={tourBrandRef} className={`pt-film${tab === 2 ? ' is-on' : ''}`} src="/brands.mp4" playsInline muted
                      preload={tourOn ? 'auto' : 'metadata'} onEnded={loop} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ─── THE DEVICES (chapter 1; the phone carries on into the tour) ─── */}
        <div className="eco-stage-viewport" style={{ ['--px' as string]: `${pointerOffset.x}px`, ['--py' as string]: `${pointerOffset.y}px` } as CSSProperties}>
          <div className={`eco-screens-group ${sideFocused ? 'has-side-focus' : ''}`}>
            {/* left: the supplier portal */}
            <motion.div
              ref={supplierWinRef}
              className={`eco-browser-window eco-screen-supplier ${activeVideoScreen === 'supplier' ? 'is-video-active' : ''} ${hoveredScreen === 'supplier' ? 'is-hovered' : hoveredScreen !== null ? 'is-dimmed' : ''}`}
              onMouseEnter={() => focusSide('supplier')} onMouseMove={handlePointerMove} onMouseLeave={unfocusSide} onClick={() => focusSide('supplier')}
              style={isReduced ? { transform: 'none', opacity: 0.95 } : { x: supplierX, y: sideY, scale: sideScale, opacity: sideOpacity, pointerEvents: isAtRest ? 'auto' : 'none', zIndex: hoveredScreen === 'supplier' ? 45 : 10 }}
            >
              <div className="eco-device-scaler" style={{ position: 'relative', ...focusVars('supplier') }}>
                <div className="eco-screen-ambient-glow glow-supplier" aria-hidden="true" />
                <div className="eco-chrome">
                  <div className="eco-chrome-dots"><span className="eco-dot eco-dot-red" /><span className="eco-dot eco-dot-yellow" /><span className="eco-dot eco-dot-green" /></div>
                  <div className="eco-url-bar"><Lock /><span>app.gradient365.com/supplier</span><span className="eco-url-ping ping-supplier" /></div>
                  <div className="eco-window-role-badge badge-supplier"><span className="eco-role-dot" />SUPPLIER</div>
                </div>
                <div className="eco-app-body eco-video-body">
                  <video ref={supplierVideoRef} src="/suppliers.mp4" playsInline muted preload="metadata" className="eco-dashboard-video" onEnded={loop} />
                </div>
              </div>
            </motion.div>

            {/* centre: the café app on a phone — it comes down into the tour's panel */}
            <motion.div
              ref={phoneRef}
              className={`eco-screen-mobile ${activeVideoScreen === 'mobile' ? 'is-video-active' : ''} ${hoveredScreen === 'mobile' ? 'is-hovered' : hoveredScreen !== null ? 'is-dimmed' : ''}${desk && tourOn && tab !== 0 ? ' is-tour-out' : ''}`}
              onMouseEnter={() => isAtRest && setHoveredScreen('mobile')} onMouseMove={handlePointerMove} onMouseLeave={unfocusSide}
              onClick={() => { setActiveVideoScreen('mobile'); setHoveredScreen(null); }}
              style={isReduced ? { transform: 'none' } : { x: phoneX, y: phoneY, scale: phoneScale, zIndex: sideFocused ? 15 : 30 }}
            >
              <div className="eco-device-scaler">
                <div className="eco-phone-back-shadow" aria-hidden="true" />
                <div className="eco-phone-chassis">
                  <div className="eco-phone-btn eco-btn-action" aria-hidden="true" />
                  <div className="eco-phone-btn eco-btn-vol-up" aria-hidden="true" />
                  <div className="eco-phone-btn eco-btn-vol-down" aria-hidden="true" />
                  <div className="eco-phone-btn eco-btn-power" aria-hidden="true" />
                  <div className="eco-phone-speaker" aria-hidden="true" />
                  <div className="eco-phone-screen-container">
                    <div className="eco-phone-glass-glare" aria-hidden="true" />
                    <div className="eco-phone-island" aria-hidden="true"><div className="eco-island-pill"><span className="eco-island-dot" /><span className="eco-island-status-pulse" /></div></div>
                    <div className="eco-phone-statusbar">
                      <span className="eco-phone-time">9:41</span>
                      <div className="eco-phone-icons">
                        <svg className="eco-phone-sig" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="2.5" height="4" rx="0.6" /><rect x="4" y="5" width="2.5" height="6" rx="0.6" /><rect x="8" y="2.5" width="2.5" height="8.5" rx="0.6" /><rect x="12" y="0" width="2.5" height="11" rx="0.6" /></svg>
                        <svg className="eco-phone-wifi" viewBox="0 0 15 11" fill="currentColor"><path d="M7.5 11a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4zM3.8 7.3a5.2 5.2 0 0 1 7.4 0 .8.8 0 0 0 1.1-1.1 6.8 6.8 0 0 0-9.6 0 .8.8 0 1 0 1.1 1.1zM1.2 4.7a8.8 8.8 0 0 1 12.6 0 .8.8 0 0 0 1.1-1.1 10.4 10.4 0 0 0-14.8 0 .8.8 0 1 0 1.1 1.1z" /></svg>
                        <div className="eco-phone-batt"><div className="eco-phone-batt-fill" /></div>
                      </div>
                    </div>
                    <div className="eco-phone-viewport eco-video-phone-viewport">
                      <video ref={mobileVideoRef} src="/cafe.mp4" playsInline muted preload="metadata" className="eco-mobile-video" onEnded={loop} />
                    </div>
                    <div className="eco-phone-home-indicator" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* right: the brand portal */}
            <motion.div
              ref={brandWinRef}
              className={`eco-browser-window eco-screen-brand ${activeVideoScreen === 'brand' ? 'is-video-active' : ''} ${hoveredScreen === 'brand' ? 'is-hovered' : hoveredScreen !== null ? 'is-dimmed' : ''}`}
              onMouseEnter={() => focusSide('brand')} onMouseMove={handlePointerMove} onMouseLeave={unfocusSide} onClick={() => focusSide('brand')}
              style={isReduced ? { transform: 'none', opacity: 0.95 } : { x: brandX, y: sideY, scale: sideScale, opacity: sideOpacity, pointerEvents: isAtRest ? 'auto' : 'none', zIndex: hoveredScreen === 'brand' ? 45 : 10 }}
            >
              <div className="eco-device-scaler" style={{ position: 'relative', ...focusVars('brand') }}>
                <div className="eco-screen-ambient-glow glow-brand" aria-hidden="true" />
                <div className="eco-chrome">
                  <div className="eco-chrome-dots"><span className="eco-dot eco-dot-red" /><span className="eco-dot eco-dot-yellow" /><span className="eco-dot eco-dot-green" /></div>
                  <div className="eco-url-bar"><Lock /><span>app.gradient365.com/brand</span><span className="eco-url-ping ping-brand" /></div>
                  <div className="eco-window-role-badge badge-brand"><span className="eco-role-dot" />BRAND</div>
                </div>
                <div className="eco-app-body eco-video-body">
                  <video ref={brandVideoRef} src="/brands.mp4" playsInline muted preload="metadata" className="eco-dashboard-video" onEnded={loop} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ─── THE TOUR, IN FRONT: the rail, the words, and the floating cards ─── */}
        {desk && (
          <motion.div className={`pt-front${tourOn ? ' is-on' : ''}`} style={{ opacity: frontOpacity, y: frontY }} data-portal={P.id}>
            <nav className="pt-rail" aria-label="Portals">
              <div className="pt-rail-items">
                {PORTALS.map((p, k) => (
                  <button key={p.id} type="button" data-portal={p.id} className={k === tab ? 'is-on' : undefined} aria-current={k === tab ? 'true' : undefined} onClick={() => goTo(k)}>
                    <PortalIcon id={p.id} /><span>{p.rail}</span>
                  </button>
                ))}
              </div>
            </nav>
            {/* keyed by portal: on a switch the old words go at once and the new ones fade up (cafe-tour CSS) */}
            <div className="pt-copy" key={P.id} data-portal={P.id}>
              <PortalCopy p={P} film={films[tab]} on={tourOn && isVisible} onSeek={(at) => seek(tab, at)} />
            </div>
            <div className="pt-over" aria-hidden="true">
              {landed && <FloatCard key={P.id} id={P.id} />}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ─── NARROW SCREENS AND REDUCED MOTION: the three portals as plain cards ─── */}
      {!desk && <PortalStack />}
    </section>
  );
}

/* the stacked version: each portal's words over its colour panel and product; a card's film plays while it's in view */
function PortalStack() {
  return (
    <div className="pt-stack">
      {PORTALS.map((p) => <StackCard key={p.id} p={p} />)}
    </div>
  );
}
function StackCard({ p }: { p: Portal }) {
  const ref = useRef<HTMLElement>(null);
  const film = useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const v = film.current;
    if (!v) return;
    if (inView && !document.hidden) { v.muted = true; v.play().catch(() => {}); } else v.pause();
  }, [inView]);
  const seek = (at: number) => { const v = film.current; if (!v) return; try { v.currentTime = at; } catch {} v.play().catch(() => {}); };
  return (
    <article className="pt-card" id={p.anchor} ref={ref} data-portal={p.id}>
      <div className="pt-copy is-static" data-portal={p.id}>
        <PortalCopy p={p} film={film} on={inView} onSeek={seek} />
      </div>
      <div className="pt-card-panel">
        <span className={`pt-field is-${p.id} is-on`} />
        <span className="pt-grain" />
        {p.id === 'cafe' ? (
          <div className="pt-mphone"><video ref={film} src={p.film} playsInline muted loop preload="none" /></div>
        ) : (
          <div className="pt-window is-on is-static" data-portal={p.id}>
            <div className="eco-chrome">
              <div className="eco-chrome-dots"><span className="eco-dot eco-dot-red" /><span className="eco-dot eco-dot-yellow" /><span className="eco-dot eco-dot-green" /></div>
              <div className="eco-url-bar"><Lock /><span>{p.url}</span></div>
            </div>
            <div className="eco-video-body pt-films"><video ref={film} className="pt-film is-on" src={p.film} playsInline muted loop preload="none" /></div>
          </div>
        )}
      </div>
    </article>
  );
}
