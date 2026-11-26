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

   1. Chapter 1 — "Connecting cafés, suppliers & brands": the supplier portal on a tablet, the café app on a phone
      and the brand portal on a tablet, rising in side by side, each showing a picture made to explain its portal
      (no films here: they play in the tour).
   2. The phone comes down into the tour: the side portals fall away and the heading lifts, a red panel
      rises from below on the right, and the phone comes down and across into it, growing as it lands.
      A rail and the café's words come in on the left.
   3. The tour, after mixpanel.com's product tour (read from its page: a sticky stage over about a screen
      of scroll per product, switched at scroll thresholds, each switch a timed transition):
      · a rail on the left (Cafés · Suppliers · Brands): the active one filled, its icon in its colour;
      · the words: a tinted chip, a two-line title, a line, a pill button, and a bordered card that
        follows the film playing ("Now showing"), whose segments seek it;
      · a tall colour panel on the right — red, then green, then purple — holding the product.
      On a switch the old words go at once and the new ones fade up 10px; the panel's colour fades to the
      next portal's; the product is cleared and rebuilt — the phone drops out and a browser window rises in
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

/* Each portal's colour field, in that portal's own colour only — the main colour of its site (/cafe #E03E3E,
   /supplier #1FA952, /brand #6B33D3) with its lighter tints and deeper shades (the sites' own: #C42D2D;
   #178A42, #0D5228; #3A1F70, #251448): the base gradient's three stops, then four soft blobs (alpha per slot).
   A switch is a plain fade from one to the next, so no other colour shows on the way. */
const FIELD: Record<PortalId, string[]> = {
  cafe: ['#EC5F5C', '#E03E3E', '#C42D2D', '#F6B3B0', '#9E1F1F', '#EA716E', '#B42626'],
  supplier: ['#3DBB6A', '#1FA952', '#178A42', '#A6DDBA', '#0D5228', '#62C386', '#11663A'],
  brand: ['#8452DF', '#6B33D3', '#4E23A8', '#C7AEF2', '#251448', '#9A72E6', '#3A1F70'],
};
const FIELD_ALPHA = [1, 1, 1, 0.85, 0.6, 0.7, 0.5];
const rgbA = (hex: string, a: number) => { const n = parseInt(hex.slice(1), 16); return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${a})`; };
const fieldVars = (id: PortalId) => Object.fromEntries(FIELD[id].map((c, i) => [`--p${i}`, rgbA(c, FIELD_ALPHA[i])])) as CSSProperties;

// Where things happen along the track (fractions of its 380vh of scroll)
const RISE = 0.15;      // the devices have risen into the pinned stage (payop: phones rise in from below, behind the heading)
const REST = 0.23;      // chapter 1 holds still until here, while one order arrives on each device in turn
const LAND = 0.395;     // the phone has come down into the panel
const TOUR_ON = 0.335;  // the tour's words and rail take over (pointer events, films)
const SUP_AT = 0.6;     // the supplier portal takes the panel
const BRAND_AT = 0.8;   // the brand portal takes the panel
const RANGE_VH = 460;   // .eco-track is 560vh: one pinned screen plus this
// a portal's anchor sits half a screen past its threshold, so the section rail lights it as the panel switches,
// and jumping to it (nav, rail) lands inside that portal's stretch of scroll
const anchorTop = (p: number) => `${(p * RANGE_VH + 50).toFixed(1)}vh`;
const STARTS = [LAND, SUP_AT, BRAND_AT];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
// without the pinned tour (phones, tablets, reduced motion) the side portals take no scroll-driven motion: CSS
// places and tilts them (portal-tour.css). Opacity is set too, so none is left over from the first render.
const STILL_SIDE: CSSProperties = { transform: 'none', opacity: 1 };
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
const Mark = () => (
  <svg viewBox="0 0 28 28" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M7.68 8.31A8.5 8.5 0 0 1 20.32 8.31" /><path d="M22.08 11.37A8.5 8.5 0 0 1 15.77 22.31" /><path d="M12.23 22.31A8.5 8.5 0 0 1 5.92 11.37" /></g>
    <circle cx="14" cy="14" r="3" fill="currentColor" />
  </svg>
);
/* One order arriving on every side, once chapter 1's devices have risen in: a push notification on the café's phone,
   then a new order on the supplier's dashboard, then demand moving on the brand's (staggered in portal-tour.css). */
const ORDER_TOASTS = {
  phone: (
    <div className="eco-toast is-phone" aria-hidden="true">
      <span className="eco-toast-icon"><Mark /></span>
      <span className="eco-toast-tx"><span className="eco-toast-top"><b>Gradient</b><time>now</time></span><strong>Order placed · Oat Milk 12 L</strong><small>3 suppliers, one bill · 7:30 AM</small></span>
    </div>
  ),
  supplier: (
    <div className="eco-toast is-supplier" aria-hidden="true">
      <span className="eco-toast-icon"><PortalIcon id="supplier" /></span>
      <span className="eco-toast-tx"><span className="eco-toast-top"><b>New order</b><time>just now</time></span><strong>PO #4821 · Oat Milk 12 L</strong><small>Tamarind Lane Cafe · Hauz Khas</small></span>
      <em>₹2,520</em>
    </div>
  ),
  brand: (
    <div className="eco-toast is-brand" aria-hidden="true">
      <span className="eco-toast-icon"><PortalIcon id="brand" /></span>
      <span className="eco-toast-tx"><span className="eco-toast-top"><b>Demand</b><time>this week</time></span><strong>Oat Milk up 18%</strong><small>Reordered by 42 cafés</small></span>
    </div>
  ),
};
const Lock = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
/* Chapter 1's portals are tablets (portal-tour.css) open on the portal's own page, a picture made to explain it in
   that page's own words and colours (public/landing/portals):
   · supplier.webp, after /supplier: "Every café order. Settled in 24 hours." A WhatsApp order read into PO #4821,
     a run signed for drop by drop, a T+1 payout, on the page's green cutting mat;
   · brand.webp, after /brand: "Know where it'll sell. Tracked to the cup." The demand map, the Barista Oat Milk
     trial (120 kits → 100 tried → 88 rated → 31 weekly POs) and a barista's review, on its dot grid;
   · cafe.webp (the phone), after /cafe: "Stop chasing. Start brewing." Three verified suppliers' prices with the
     best marked, a low-stock reorder, one order on one bill.
   They tell one story, Tamarind Lane Cafe's oat milk order, which the notifications carry from device to device.
   The browser bar is a tablet's: back and forward, the address, the portal's badge (no window buttons, no live dot) */
const TabletBar = ({ p }: { p: Portal }) => (
  <div className="eco-chrome is-tablet">
    <span className="eco-nav" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M14.5 6l-6 6 6 6" /></svg>
      <svg viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6" /></svg>
    </span>
    <div className="eco-url-bar"><Lock /><span>gradient365.com/{p.id}</span></div>
    <div className={`eco-window-role-badge badge-${p.id}`}><span className="eco-role-dot" />{p.id === 'brand' ? 'BRAND' : 'SUPPLIER'}</div>
  </div>
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

  // (chapter 1's devices don't react to the pointer: no hover, no focus, no parallax)

  // The tour's state
  const [tourOn, setTourOn] = useState(false);   // its words and rail have taken over
  const [landed, setLanded] = useState(false);   // the phone has come down into the panel
  const [arrived, setArrived] = useState(false); // chapter 1's devices have risen in: the order arrives on each
  const [tab, setTab] = useState(0);             // 0 café · 1 supplier · 2 brand
  // the phone's film is playing in the panel, so chapter 1's still on its screen has faded
  const [phoneLive, setPhoneLive] = useState(false);

  // the films (chapter 1 shows stills; these play only in the tour)
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const tourSupRef = useRef<HTMLVideoElement | null>(null);
  const tourBrandRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // the pinned tour needs a desktop-sized screen: wide, and tall enough to hold its stage (a phone on its side
    // is wider than 861px but only ~400px tall, so it gets the stacked cards)
    const mq = window.matchMedia('(min-width: 861px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)');
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

  // Which film plays: none in chapter 1 (its devices show stills). In the tour, only the active portal's, from the top
  // each time its portal comes in: the café's once the phone has come down into the panel (its still fades as the film
  // starts, onPlaying), a window's a beat after the window has risen. Hidden tabs and scrolling away only pause it.
  const filmOn = useRef<string | null>(null);
  useEffect(() => {
    const films = { phone: mobileVideoRef.current, tSup: tourSupRef.current, tBrand: tourBrandRef.current };
    const active = desk && landed ? (['phone', 'tSup', 'tBrand'] as const)[tab] : null;
    const fresh = active !== filmOn.current;
    filmOn.current = active;
    if (!desk || !landed) setPhoneLive(false);
    let t: ReturnType<typeof setTimeout> | undefined;
    (Object.keys(films) as (keyof typeof films)[]).forEach((k) => {
      const v = films[k];
      if (!v) return;
      if (k !== active || !isVisible || !isTabVisible) { safePause(v); if (k === active && fresh) { try { v.currentTime = 0; } catch {} } return; }
      if (fresh) { safePause(v); try { v.currentTime = 0; } catch {} }   // paused first, so 'playing' fires again
      if (fresh && k !== 'phone') t = setTimeout(() => safePlay(v), 320);
      else safePlay(v);
    });
    return () => { if (t) clearTimeout(t); };
  }, [isVisible, isTabVisible, landed, tab, desk, safePlay, safePause]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setIsVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Without the pinned tour (phones, tablets) chapter 1's arrival is scrubbed by the scroll, as the desktop's is: the
  // heading rises in line by line as it comes up the screen; the phone rises and the two portals fan out from behind
  // it while the devices come into view, settling as they reach the bottom of the screen. There one order arrives on
  // each device in turn, and goes again if you scroll back. The progress goes to CSS as variables (portal-tour.css,
  // .is-play). Reduced motion shows it all at rest.
  const play = !desk && !isReduced;
  const textRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: textP } = useScroll({ target: textRef, offset: ['start 98%', 'start 55%'] });
  const { scrollYProgress: groupP } = useScroll({ target: groupRef, offset: ['start end', 'end end'] });
  const settle = { stiffness: 140, damping: 30, mass: 0.35, restDelta: 0.0005 };
  const textK = useSpring(textP, settle);
  const groupK = useSpring(groupP, settle);
  // eased in and out over the stretch where each piece is actually on screen: the phone while it comes up past the
  // bottom edge, the portals a beat behind it, settling as the devices reach the bottom of the screen
  const kLine1 = useTransform(textK, (t: number) => smooth(clamp(t / 0.6)));
  const kLine2 = useTransform(textK, (t: number) => smooth(clamp((t - 0.15) / 0.6)));
  const kLine3 = useTransform(textK, (t: number) => smooth(clamp((t - 0.3) / 0.6)));
  const kPhone = useTransform(groupK, (k: number) => smooth(clamp((k - 0.05) / 0.7)));
  const kSides = useTransform(groupK, (k: number) => smooth(clamp((k - 0.25) / 0.7)));
  const [devArrived, setDevArrived] = useState(false);
  useMotionValueEvent(groupP, 'change', (k) => { if (k > 0.97) setDevArrived(true); else if (k < 0.85) setDevArrived(false); });

  // ─── Scroll ───
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  // springy smoothing for the scrubbed motion (chapter 1 → tour); the tour's switches use the raw progress
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.28, restDelta: 0.0001 });

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    // risen and at rest: the order arrives on each device in turn (and leaves as chapter 1 moves on)
    setArrived(p >= RISE * 0.97 && p < REST + 0.02);
    setTourOn(p >= TOUR_ON);
    setLanded(p >= LAND - 0.01);
    setTab(p < SUP_AT ? 0 : p < BRAND_AT ? 1 : 2);
  });

  /* Chapter 1's arrival, after payop.com's phones: the stage pins with only its heading showing, then the devices
     rise into it from below over the first stretch of the track (0 → RISE) — the phone first; the two portals a
     beat later, fanning out from behind it and turning into their pose, facing the centre, the centre one facing
     you. Nothing flies down from the hero any more; instead, once they're in, one order arrives on each device in
     turn, as its own notification (.eco-toast). */
  const vh = useMotionValue(900);
  useEffect(() => {
    const set = () => vh.set(window.innerHeight);
    set();
    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  }, [vh]);
  const easeOut = (t: number) => 1 - (1 - t) ** 3;
  const kPhoneIn = (p: number) => easeOut(clamp(p / (RISE * 0.8)));
  const kSideIn = (p: number) => easeOut(clamp((p - RISE * 0.25) / (RISE * 0.75)));   // a beat behind the phone
  const enter = smoothProgress;

  // Chapter 1's heading lifts away and its side portals fall back, outward and up
  const ecoTextOpacity = useTransform(smoothProgress, [0, REST, REST + 0.08], [1, 1, 0]);
  const ecoTextY = useTransform(smoothProgress, [0, REST, REST + 0.08], [0, 0, -60]);
  const sideOut = [0, REST, REST + 0.12];
  const supplierOutX = useTransform(smoothProgress, sideOut, [0, 0, -90]);
  const brandOutX = useTransform(smoothProgress, sideOut, [0, 0, 90]);
  const sideOutY = useTransform(smoothProgress, sideOut, [0, 0, -50]);
  const sideScale = useTransform(smoothProgress, sideOut, [1, 1, 0.9]);
  const sideOutOpacity = useTransform(smoothProgress, [0, REST, REST + 0.1], [1, 1, 0]);
  // in: tucked 200px toward the phone and 70% of a screen low (below the stage), out to their places
  const supplierX = useTransform([supplierOutX, enter], ([o, e]: number[]) => (isReduced || !desk ? 0 : o + 200 * (1 - kSideIn(e))));
  const brandX = useTransform([brandOutX, enter], ([o, e]: number[]) => (isReduced || !desk ? 0 : o - 200 * (1 - kSideIn(e))));
  const sideY = useTransform([sideOutY, enter, vh], ([o, e, h]: number[]) => (isReduced || !desk ? 0 : o + 0.7 * h * (1 - kSideIn(e))));
  const sideOpacity = useTransform([sideOutOpacity, enter], ([o, e]: number[]) => (desk ? o * clamp((e - RISE * 0.25) / (RISE * 0.35)) : 1));
  // their pose, like payop's side phones: turned to face the centre and leaning back, so the edge turned toward you
  // shows (portal-tour.css draws it, in the portal's colour); turned further while they come in
  const supplierRotY = useTransform(enter, (e: number) => 24 + 14 * (1 - kSideIn(e)));
  const brandRotY = useTransform(enter, (e: number) => -(24 + 14 * (1 - kSideIn(e))));
  const sideRotX = useTransform(enter, (e: number) => 8 + 10 * (1 - kSideIn(e)));

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
  // first it rises in from 55% of a screen below (and grows the last 8%), then comes down into the tour
  const phoneY = useTransform([smoothProgress, dropY, enter, vh], ([p, dy, e, h]: number[]) =>
    (desk ? 24 + (dy - 24) * kDown(p) + 0.55 * h * (1 - kPhoneIn(e)) : 24));
  const phoneScale = useTransform([smoothProgress, dropScale, enter], ([p, s, e]: number[]) =>
    (desk ? (1 + (s - 1) * kDown(p)) * (0.92 + 0.08 * kPhoneIn(e)) : 1));
  // the phone in 3D too: it rises tipped well back, settles turned a little toward the left portal and leaning back
  // (so its red frame shows on the right, --edge), and straightens as it comes down into the tour
  const phoneRotY = useTransform([smoothProgress, enter], ([p, e]: number[]) => (desk ? -10 * (1 - kDown(p)) - 4 * (1 - kPhoneIn(e)) : 0));
  const phoneRotX = useTransform([smoothProgress, enter], ([p, e]: number[]) => (desk ? (7 + 14 * (1 - kPhoneIn(e))) * (1 - kDown(p)) : 0));
  const phoneEdge = useTransform(smoothProgress, (p: number) => (desk ? 1 - kDown(p) : 0));

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
    <section className={`eco-track${desk ? ' is-tour' : ''}${play ? ' is-play' : ''}`} ref={trackRef} id="ecosystem" aria-label="The Gradient ecosystem: cafés, suppliers and brands">
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
            ref={textRef}
            className="eco-text-wrap"
            style={play ? { opacity: 1, y: 0, ['--kt1' as string]: kLine1, ['--kt2' as string]: kLine2, ['--kt3' as string]: kLine3 }
              : isReduced || !desk ? { opacity: 1, y: 0 } : { opacity: ecoTextOpacity, y: ecoTextY, pointerEvents: tourOn ? 'none' : 'auto' }}
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
              {PORTALS.map((p, k) => <span key={p.id} className={`pt-field${k === tab ? ' is-on' : ''}`} style={fieldVars(p.id)} />)}
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
        <div className="eco-stage-viewport">
          <motion.div ref={groupRef} className={`eco-screens-group${(desk ? arrived : play && devArrived) ? ' is-arrived' : ''}`}
            style={play ? { ['--kp' as string]: kPhone, ['--ks' as string]: kSides } : {}}>
            {/* left: the supplier portal */}
            <motion.div
              className="eco-browser-window eco-screen-supplier"
              style={isReduced || !desk ? STILL_SIDE : { x: supplierX, y: sideY, scale: sideScale, opacity: sideOpacity, rotateY: supplierRotY, rotateX: sideRotX, transformPerspective: 1400, zIndex: 10 }}
            >
              <div className="eco-device-scaler" style={{ position: 'relative' }}>
                <TabletBar p={PORTALS[1]} />
                {ORDER_TOASTS.supplier}
                <div className="eco-app-body eco-video-body">
                  <img src="/landing/portals/supplier.webp" width={1824} height={900} className="eco-dashboard-video" loading="lazy" decoding="async" draggable={false}
                    alt="For roasters and distributors: every café order, settled in 24 hours. A café’s WhatsApp message read into purchase order #4821, a delivery run signed for drop by drop, and ₹11,400 paid the next day." />
                </div>
              </div>
            </motion.div>

            {/* centre: the café app on a phone — it comes down into the tour's panel */}
            <motion.div
              ref={phoneRef}
              className={`eco-screen-mobile${desk && tourOn && tab !== 0 ? ' is-tour-out' : ''}`}
              style={isReduced ? { transform: 'none' } : { x: phoneX, y: phoneY, scale: phoneScale, rotateY: phoneRotY, rotateX: phoneRotX, transformPerspective: 1400, zIndex: 30, ['--edge' as string]: phoneEdge }}
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
                    {ORDER_TOASTS.phone}
                    <div className="eco-phone-statusbar">
                      <span className="eco-phone-time">9:41</span>
                      <div className="eco-phone-icons">
                        <svg className="eco-phone-sig" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="2.5" height="4" rx="0.6" /><rect x="4" y="5" width="2.5" height="6" rx="0.6" /><rect x="8" y="2.5" width="2.5" height="8.5" rx="0.6" /><rect x="12" y="0" width="2.5" height="11" rx="0.6" /></svg>
                        <svg className="eco-phone-wifi" viewBox="0 0 15 11" fill="currentColor"><path d="M7.5 11a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4zM3.8 7.3a5.2 5.2 0 0 1 7.4 0 .8.8 0 0 0 1.1-1.1 6.8 6.8 0 0 0-9.6 0 .8.8 0 1 0 1.1 1.1zM1.2 4.7a8.8 8.8 0 0 1 12.6 0 .8.8 0 0 0 1.1-1.1 10.4 10.4 0 0 0-14.8 0 .8.8 0 1 0 1.1 1.1z" /></svg>
                        <div className="eco-phone-batt"><div className="eco-phone-batt-fill" /></div>
                      </div>
                    </div>
                    {/* chapter 1 shows a picture of the café app ("One basket. Every supplier."); the film under it
                        plays once the phone has come down into the tour's panel, and the picture fades */}
                    <div className={`eco-phone-viewport eco-video-phone-viewport${phoneLive ? ' is-live' : ''}`}>
                      <video ref={mobileVideoRef} src="/cafe.mp4" playsInline muted preload={desk ? (tourOn ? 'auto' : 'metadata') : 'none'} className="eco-mobile-video"
                        onEnded={loop} onPlaying={() => { if (desk && landed) setPhoneLive(true); }} />
                      <img className="eco-phone-still" src="/landing/portals/cafe.webp" width={1080} height={2240} loading="lazy" decoding="async" draggable={false}
                        alt="For cafés: stop chasing, start brewing. Three verified suppliers’ prices for oat milk side by side with the best one marked, a low-stock alert, and one order across three suppliers on one bill." />
                    </div>
                    <div className="eco-phone-home-indicator" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* right: the brand portal */}
            <motion.div
              className="eco-browser-window eco-screen-brand"
              style={isReduced || !desk ? STILL_SIDE : { x: brandX, y: sideY, scale: sideScale, opacity: sideOpacity, rotateY: brandRotY, rotateX: sideRotX, transformPerspective: 1400, zIndex: 10 }}
            >
              <div className="eco-device-scaler" style={{ position: 'relative' }}>
                <TabletBar p={PORTALS[2]} />
                {ORDER_TOASTS.brand}
                <div className="eco-app-body eco-video-body">
                  <img src="/landing/portals/brand.webp" width={1824} height={900} className="eco-dashboard-video" loading="lazy" decoding="async" draggable={false}
                    alt="For brands: know where it’ll sell, tracked to the cup. A demand map of South Delhi for Barista Oat Milk, a trial of 120 kits that 100 baristas tried and 31 cafés now order weekly, and a barista’s review." />
                </div>
              </div>
            </motion.div>
          </motion.div>
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
      {/* the portal's colour fills the whole card; the words and the product sit on it */}
      <span className="pt-field is-on" style={fieldVars(p.id)} aria-hidden="true" />
      <span className="pt-grain" aria-hidden="true" />
      <div className="pt-copy is-static" data-portal={p.id}>
        <PortalCopy p={p} film={film} on={inView} onSeek={seek} />
      </div>
      <div className="pt-card-panel">
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
