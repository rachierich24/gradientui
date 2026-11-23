'use client';
// Section 03 — what the café portal does, as a bento after shopify.com's "Show up everywhere" grid: a wide card
// above, three cards in the middle (the centre one a slowly turning sphere of rings with categories in orbit, like
// Shopify's command centre), and a wide card below. Built from the supplier bento's parts (SupplierBentoGrid.tsx):
// a two-tone title, an arrow that expands the card in place into a dialog, a light and a red edge that follow the
// cursor, and a live mock-up in each card that only runs while it's on screen.
// The middle three are the hoverable ones: their film plays on hover (on touch screens, while on screen), as
// Shopify's play their video on hover. The wide cards play while on screen.
// The last card carries a little Gradient mark and is where the page zooms into the stories, as umanodesign.studio's
// last "How it works" card zooms into theirs: it pins mid-screen, holds a moment, then zooms in on the mark (the
// card's contents fade as they rush outward, the card and its surroundings wash to the stories' warm white, and the
// mark grows to half the screen, drawn at size so it stays sharp); the mark fades as the stories rise.
// Visuals: components/cafe/bento/* · Styles: app/cafe/cafe-bento.css
import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, MotionConfig, motion, useIsPresent, useReducedMotion } from 'framer-motion';
import { Check, useOnScreen } from '@/components/supplier/bento/shared';
import { openContactSalesModal } from '@/components/ContactSalesModal';
import { StockFilm } from './bento/StockFilm';
import { VerifiedFilm } from './bento/VerifiedFilm';
import { PriceSphere } from './bento/PriceSphere';
import { GstFilm } from './bento/GstFilm';
import { ChefsFilm } from './bento/ChefsFilm';
import { Rings } from './bento/Rings';

// run: playing · live: on screen · still: reduced motion · wide: the middle card that has the double width (Shopify widens the hovered one)
export type FilmState = { run: boolean; live: boolean; still: boolean; wide?: boolean };

type CardDef = {
  id: 'stock' | 'verified' | 'price' | 'gst' | 'chefs';
  kind: 'wide' | 'tile';
  title: string; muted: string;    // the two-tone title
  lead: string;                    // the line under it on the card
  desc: string; points: string[];  // the expanded dialog
  render: (s: FilmState) => ReactNode;
};

const CARDS: CardDef[] = [
  {
    id: 'stock', kind: 'wide', title: 'Your supplier ran out.', muted: 'Your café didn’t.',
    lead: 'When your usual supplier can’t deliver, Gradient finds verified suppliers near you who can, before you open.',
    desc: 'Low stock is flagged before it runs out. If your usual supplier can’t make it, Gradient asks verified suppliers near you, ranks them by distance, arrival time and price, and places the order with the one that gets it to your counter in time.',
    points: ['Low stock flagged before it runs out', 'Nearby suppliers ranked by distance, arrival and price', 'One tap to order from whoever arrives in time', 'Urgent requests answered in hours, not days'],
    render: (s) => <StockFilm {...s} />,
  },
  {
    id: 'verified', kind: 'tile', title: 'Verified distributors', muted: 'only',
    lead: 'Every distributor is checked for GST, FSSAI and the brand’s own authorisation before they can sell to you.',
    desc: 'You only buy from distributors Gradient has checked: their GSTIN and FSSAI licence, their bank account, and a letter from the brand authorising them to sell its products. So what arrives is genuine, billed properly and covered by the brand.',
    points: ['Brand authorisation on file for every listing', 'GSTIN and FSSAI licence checked', 'Bank account verified before the first payout', 'Re-checked every quarter'],
    render: (s) => <VerifiedFilm {...s} />,
  },
  {
    id: 'price', kind: 'tile', title: 'The best price', muted: 'on anything you buy',
    lead: 'Every supplier’s price for the same product, side by side. Order the best one in a tap.',
    desc: 'Search any product, from oat milk to takeaway cups, and see every verified supplier’s price for it side by side, with their delivery times. Gradient marks the best deal, and your cart can take the cheapest supplier for each item.',
    points: ['Every supplier’s price for the same product', 'Delivery time and minimum order beside each price', 'The best deal marked for you', 'Price drops on the things you reorder'],
    render: (s) => <PriceSphere {...s} />,
  },
  {
    id: 'gst', kind: 'tile', title: 'GST reports', muted: 'ready for your CA',
    lead: 'Every supplier bill lands in GST-ready reports, with input credit tracked and matched to GSTR-2B.',
    desc: 'Every bill from every supplier is kept with its GST details. Gradient adds up your input tax credit, matches each invoice against GSTR-2B so nothing is missed, and exports the month to Tally, Zoho Books or a sheet for your CA.',
    points: ['Every supplier invoice with its GST details', 'Input tax credit added up for the month', 'Invoices matched against GSTR-2B', 'Export to Tally, Zoho Books or a sheet'],
    render: (s) => <GstFilm {...s} />,
  },
  {
    id: 'chefs', kind: 'wide', title: 'Launch it with the people', muted: 'who make it.',
    lead: 'Planning a new drink or dish? Book a trial of any product and work on the recipe with the brand’s own chefs.',
    desc: 'Try before you stock it. Book a trial of any product on Gradient and the brand sends a kit, and its chef works through it with your team, from the first tasting to a recipe that’s costed and ready for your menu.',
    points: ['Trial kits of any product, on request', 'Tastings with the brand’s own chefs', 'Recipes developed and costed for your menu', 'Launch support when it goes on the board'],
    render: (s) => <ChefsFilm {...s} />,
  },
];

const ARROW = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>;
// the little mark in the last card, and where it sits on it (the zoom's centre)
const LOGO = (
  <svg viewBox="0 0 28 28" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M7.68 8.31A8.5 8.5 0 0 1 20.32 8.31" /><path d="M22.08 11.37A8.5 8.5 0 0 1 15.77 22.31" /><path d="M12.23 22.31A8.5 8.5 0 0 1 5.92 11.37" />
    </g>
    <circle cx="14" cy="14" r="3" fill="currentColor" />
  </svg>
);
const LOGO_PX = 52, LOGO_Y = 0.6;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const AVATARS = ['/landing/spotlight/barista-oat-carton.jpg', '/landing/spotlight/arabica-coffee-bag.jpg', '/landing/spotlight/croissant-bakery.jpg'];
const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// the cursor's light and red edge (the supplier bento's "Magic Card")
function useGlow() {
  return (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget, r = el.getBoundingClientRect();
    el.style.setProperty('--cbx-mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--cbx-my', `${e.clientY - r.top}px`);
  };
}

function WideCard({ def, reduce, paused, onExpand }: { def: CardDef; reduce: boolean; paused: boolean; onExpand: () => void }) {
  const [ref, onScreen] = useOnScreen<HTMLElement>();
  const live = onScreen && !reduce && !paused;
  return (
    <motion.article ref={ref} layoutId={`cbx-${def.id}`} className={`cbx-card cbx-wide cbx-${def.id}`} style={{ borderRadius: 24 }} aria-label={`${def.title} ${def.muted}`}>
      {/* Shopify's row of AI-channel logos, as the things a café runs out of */}
      {def.id === 'stock' && (
        <div className="cbx-avs" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {AVATARS.map((src) => <img key={src} src={src} alt="" />)}
        </div>
      )}
      <div className="cbx-wide-copy">
        <h3>{def.title} <span>{def.muted}</span></h3>
        <p>{def.lead}</p>
      </div>
      <button type="button" className="cbx-arrow" onClick={onExpand} aria-label={`More: ${def.title} ${def.muted}`} aria-haspopup="dialog">{ARROW}</button>
      <div className="cbx-stage">{def.render({ run: live, live, still: reduce })}</div>
    </motion.article>
  );
}

function TileCard({ def, reduce, paused, hoverable, hover, wide, onHover, onExpand }: {
  def: CardDef; reduce: boolean; paused: boolean; hoverable: boolean; hover: boolean; wide: boolean; onHover: (on: boolean) => void; onExpand: () => void;
}) {
  const [ref, onScreen] = useOnScreen<HTMLElement>();
  const glow = useGlow();
  const live = onScreen && !reduce && !paused;
  return (
    <div className={`cbx-col cbx-col-${def.id}${hover ? ' is-hover' : ''}`}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') onHover(true); }}
      onPointerLeave={() => onHover(false)}>
      <motion.article ref={ref} layoutId={`cbx-${def.id}`} className={`cbx-card cbx-tile cbx-${def.id}`} style={{ borderRadius: 20 }}
        aria-label={`${def.title} ${def.muted}`} onPointerMove={glow}>
        <span className="cbx-glow" aria-hidden="true" />
        {def.id !== 'price' && <Rings className={`cbx-rings-${def.id === 'verified' ? 'left' : 'right'}`} />}
        <button type="button" className="cbx-arrow" onClick={onExpand} aria-label={`More: ${def.title} ${def.muted}`} aria-haspopup="dialog">{ARROW}</button>
        <div className="cbx-stage">{def.render({ run: live && (hover || !hoverable), live, still: reduce, wide })}</div>
      </motion.article>
      <div className="cbx-cap">
        <h3>{def.title} <span>{def.muted}</span></h3>
        <p>{def.lead}</p>
      </div>
    </div>
  );
}

function Expanded({ def, still, onClose }: { def: CardDef; still: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const present = useIsPresent();   // while it fades out, clicks pass through to the page
  useEffect(() => {
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; lenis?.start(); removeEventListener('keydown', onKey); };
  }, [onClose]);
  const start = () => { onClose(); openContactSalesModal(); };
  return (
    <motion.div className="cbx-overlay" style={{ pointerEvents: present ? 'auto' : 'none' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.05 } }} onClick={onClose}>
      <motion.div layoutId={`cbx-${def.id}`} className={`cbx-card cbx-modal cbx-${def.id}`} style={{ borderRadius: 24 }} role="dialog" aria-modal="true"
        aria-label={`${def.title} ${def.muted}`} onClick={(e) => e.stopPropagation()} transition={{ type: 'spring', stiffness: 230, damping: 30 }}>
        <header className="cbx-modal-head">
          <h3>{def.title} <span>{def.muted}</span></h3>
          <button ref={closeRef} type="button" className="cbx-arrow cbx-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </header>
        <motion.div className="cbx-modal-body" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.18, ease: [0.4, 0, 0.2, 1] }}>
          <div className="cbx-modal-copy">
            <p>{def.desc}</p>
            <ul>{def.points.map((pt) => <li key={pt}><span className="cbx-tick"><Check /></span>{pt}</li>)}</ul>
            <button type="button" className="cbx-modal-cta" onClick={start}>Start ordering <span aria-hidden="true">→</span></button>
          </div>
          <div className={`cbx-stage cbx-modal-stage is-${def.kind}`}>{def.render({ run: !still, live: !still, still, wide: true })}</div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function CafeBento() {
  const prefersReduced = useReducedMotion() ?? false;
  const [open, setOpen] = useState<CardDef['id'] | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hoverable, setHoverable] = useState(true);
  useEffect(() => { setMounted(true); setHoverable(canHover()); }, []);
  // Shopify's row: the hovered middle card takes the double width (the centre one has it at rest), the columns
  // easing over 0.9 s (cafe-bento.css). The side cards' rings stay centred on the centre card as the widths move.
  const [hovered, setHovered] = useState<CardDef['id'] | null>(null);
  const wide = hovered ?? 'price';
  const rowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const place = () => {
      const centre = row.querySelector<HTMLElement>('.cbx-col-price .cbx-tile');
      if (!centre) return;
      const c = centre.getBoundingClientRect(), cx = c.left + c.width / 2;
      row.querySelectorAll<HTMLElement>('.cbx-col-verified .cbx-tile, .cbx-col-gst .cbx-tile').forEach((t) => {
        t.style.setProperty('--ring-x', `${(cx - t.getBoundingClientRect().left).toFixed(1)}px`);
      });
    };
    place();
    const ro = new ResizeObserver(place);
    row.querySelectorAll('.cbx-tile').forEach((t) => ro.observe(t));
    return () => ro.disconnect();
  }, [open]);
  // the zoom out of the last card, into the stories
  const zoomRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLSpanElement>(null);
  const zcardRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const zs = zoomRef.current, veil = veilRef.current, wrap = zcardRef.current, wash = washRef.current, logo = logoRef.current;
    if (!zs || !veil || !wrap || !wash || !logo) return;
    const still = window.matchMedia('(max-width: 900px), (prefers-reduced-motion: reduce)');
    let raf = 0, last = 0, seen = false, zN = -1, zF = -1;
    const frame = (t: number) => {
      raf = 0;
      if (!seen) return;
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(64, t - last) : 16.7;
      last = t;
      if (still.matches) return;
      // read
      const vw = window.innerWidth, vh = window.innerHeight;
      const top = zs.getBoundingClientRect().top, zh = zs.offsetHeight, W = wrap.offsetWidth, H = wrap.offsetHeight;
      // where we are: a short hold once pinned, then the zoom; the mark fades over the half screen after the pin
      const range = zh - vh, d = -top, hold = range * 0.16;
      const nT = clamp((d - hold) / (range - hold)), fT = clamp((d - range) / (vh * 0.5));
      const a = 1 - Math.pow(0.8, dt / 16.7);
      zN = zN < 0 ? nT : zN + (nT - zN) * a;
      zF = zF < 0 ? fT : zF + (fT - zF) * a;
      // scale about the mark until the card covers the screen and the mark is half its height — at a constant rate
      // (equal scroll, equal zoom), so the card visibly grows from the first scroll
      const oy = vh / 2 + (LOGO_Y - 0.5) * H;
      const cover = Math.max(vw / W, oy / (LOGO_Y * H), (vh - oy) / ((1 - LOGO_Y) * H));
      const end = Math.max(cover * 1.6, (Math.min(vw, vh) * 0.5) / LOGO_PX);
      const s = Math.pow(end, zN);
      // write: the contents rush outward and fade (to ~45%), the card washes white once it fills the screen (28–58%)
      wrap.style.transform = `scale(${s.toFixed(4)})`;
      wrap.style.setProperty('--zf', (1 - clamp((zN - 0.08) / 0.37)).toFixed(3));
      wrap.classList.toggle('is-zooming', zN > 0.01);
      wash.style.opacity = clamp((zN - 0.28) / 0.3).toFixed(3);
      veil.style.opacity = clamp(zN / 0.3).toFixed(3);
      logo.style.top = `${oy.toFixed(1)}px`;
      logo.style.width = logo.style.height = `${(LOGO_PX * s).toFixed(1)}px`;
      logo.style.opacity = (1 - zF).toFixed(3);
    };
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    }, { rootMargin: '50% 0px 50% 0px' });
    io.observe(zs);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  // the server can't know the visitor's motion setting, so the first render matches it and still frames swap in after
  const reduce = mounted && prefersReduced;
  const close = useCallback(() => setOpen(null), []);
  const openDef = CARDS.find((c) => c.id === open) ?? null;
  const card = (id: CardDef['id']) => {
    const def = CARDS.find((c) => c.id === id)!;
    if (def.id === open) return <div key={id} className={`cbx-card cbx-${def.kind} cbx-${id} cbx-placeholder`} aria-hidden="true" />;
    return def.kind === 'wide'
      ? <WideCard key={id} def={def} reduce={reduce} paused={open !== null} onExpand={() => setOpen(id)} />
      : <TileCard key={id} def={def} reduce={reduce} paused={open !== null} hoverable={hoverable} hover={hovered === id} wide={wide === id}
          onHover={(on) => setHovered((h) => (on ? id : h === id ? null : h))} onExpand={() => setOpen(id)} />;
  };
  return (
    <section className="cafe-sec cbx-section" id="why-gradient" aria-labelledby="cbx-h">
      <MotionConfig reducedMotion="user">
        <div className="cbx-wrap">
          <h2 className="cbx-h" id="cbx-h">Source from everywhere. <span>Without going anywhere.</span></h2>
          <div className="cbx-grid">
            {card('stock')}
            <div className={`cbx-row is-wide-${wide}`} ref={rowRef}>
              {(['verified', 'price', 'gst'] as const).map((id) =>
                id === open
                  ? <div key={id} className={`cbx-col cbx-col-${id}`}><div className={`cbx-card cbx-tile cbx-${id} cbx-placeholder`} aria-hidden="true" /></div>
                  : card(id))}
            </div>
          </div>
        </div>
        {/* the last card, on a pinned stage: it carries the little mark the page zooms into */}
        <div className="cbx-zoom" ref={zoomRef}>
          <div className="cbx-zoom-panel">
            <span className="cbx-zoom-veil" ref={veilRef} aria-hidden="true" />
            <div className="cbx-zoom-card" ref={zcardRef}>
              {card('chefs')}
              <span className="cbx-zoom-wash" ref={washRef} aria-hidden="true" />
            </div>
            <span className="cbx-zoom-logo" ref={logoRef} aria-hidden="true">{LOGO}</span>
          </div>
        </div>
        {mounted && createPortal(
          <AnimatePresence>{openDef && <Expanded key={openDef.id} def={openDef} still={reduce} onClose={close} />}</AnimatePresence>,
          // inside the page root, so the dialog keeps the café fonts and colours
          document.querySelector('.cafe-portal-root') ?? document.body,
        )}
      </MotionConfig>
    </section>
  );
}
