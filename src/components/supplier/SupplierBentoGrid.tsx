'use client';
// Supplier bento grid, in the manner of Ramp's product grid: quiet grey cards, a two-tone title, an arrow that
// expands the card in place, and a live product mock-up in each. Cards light up under the cursor (Magic Card),
// each card's film runs only while it's on screen, and everything respects reduced motion.
// Cards: components/supplier/bento/* · Styles: app/supplier/bento.css
import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, MotionConfig, motion, useIsPresent, useReducedMotion } from 'framer-motion';
import { Check, useOnScreen } from './bento/shared';
import { OrdersCard } from './bento/OrdersCard';
import { GrowthCard } from './bento/GrowthCard';
import { CatalogueCard } from './bento/CatalogueCard';
import { AlertsCard } from './bento/AlertsCard';
import { IntegrationsCard } from './bento/IntegrationsCard';
import { WhatsAppCard } from './bento/WhatsAppCard';
import { HistoryCard } from './bento/HistoryCard';

type CardDef = {
  area: string; label: string; title: string; muted: string;
  desc: string; points: string[];
  glow?: boolean;
  render: (run: boolean, still: boolean) => ReactNode;
};
const CARDS: CardDef[] = [
  {
    area: 'orders', label: 'Order management', title: 'Order management', muted: 'that runs itself, from order to dispatch',
    desc: 'Every order from every café lands in one live queue. Accept it in a click and Gradient carries it through packing, dispatch and delivery, with every stage a glance away and the café updated at each step.',
    points: ['Every stage at a glance, from new to delivered', 'One-click accept, or auto-accept trusted cafés', 'Pick lists and dispatch routes made for you', 'Cafés see live status and ETA, no follow-up calls'],
    render: (run) => <OrdersCard run={run} />,
  },
  {
    area: 'growth', label: 'Sales growth', title: 'Sales growth', muted: 'from your first month on Gradient',
    desc: 'Suppliers on Gradient reach more cafés from the first month. New cafés find you in the marketplace, reorders come in without a sales call, and sales, cafés and orders sit together in one view.',
    points: ['Discovered by 340+ cafés from day one', 'Reorders that arrive without a sales call', 'Sales, cafés and order trends in one view', 'Know which products are winning, week by week'],
    render: (run, still) => <GrowthCard run={run} still={still} />,
  },
  {
    area: 'catalogue', label: 'Catalogue building', title: 'Catalogue building', muted: 'organised, priced and live for every café',
    desc: 'Keep products in folders by category. Add a photo, price and minimum order once and it is live for every café on Gradient; change a price and every café sees it instantly.',
    points: ['Folders by category, with live counts', 'Publish once, sell to 340+ cafés', 'Price lists and MOQs per café tier', 'Bulk upload from a sheet in minutes'],
    render: (run) => <CatalogueCard run={run} />,
  },
  {
    area: 'alerts', label: 'Early stock-out alerts', title: 'Early alerts', muted: 'before a single SKU runs out',
    desc: 'Gradient watches your stock against live café demand and warns you days before an item runs out, with a suggested reorder you can turn into a PO in one tap.',
    points: ['Days-of-cover for every SKU, live', 'Demand trends from every café you serve', 'Suggested reorder quantities', 'One-tap purchase orders to your mill or brand'],
    render: (run) => <AlertsCard run={run} />,
  },
  {
    area: 'integrations', label: 'Integrations', title: 'Integrations', muted: 'with the tools you already use', glow: false,
    desc: 'Orders, invoices and stock sync with the accounting, payments and logistics tools you already run on, so nothing is typed twice.',
    points: ['Tally, Zoho Books and QuickBooks', 'Razorpay, PhonePe and Paytm payments', 'Shiprocket and Delhivery for shipping', 'WhatsApp and Gmail order updates'],
    render: (run) => <IntegrationsCard run={run} />,
  },
  {
    area: 'whatsapp', label: 'WhatsApp automation', title: 'WhatsApp automation', muted: 'that turns every chat into a paid order',
    desc: 'Cafés keep ordering the way they already do, on WhatsApp. Gradient reads the message, creates the order, confirms the slot, shares the invoice and collects the payment, without you typing a reply.',
    points: ['Orders read straight from WhatsApp chats', 'Instant confirmation with the delivery slot', 'Invoices and UPI payment links in the chat', 'Switch auto-pilot off any time to reply yourself'],
    render: (run, still) => <WhatsAppCard run={run} still={still} />,
  },
  {
    area: 'history', label: 'Order history and bill sync', title: 'Order history', muted: 'and bill sync, all in one place',
    desc: 'Every order, invoice and payment in one searchable history. Bills sync to your accounting software the moment they are raised, and payments are matched to the right invoice on their own.',
    points: ['Every order and invoice, searchable in seconds', 'Bills synced to Tally and Zoho Books automatically', 'UPI and bank payments matched to invoices', 'Payment reminders sent on WhatsApp for dues'],
    render: (run, still) => <HistoryCard run={run} still={still} />,
  },
];

const ARROW = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>;

function Card({ def, reduce, paused, onExpand }: { def: CardDef; reduce: boolean; paused: boolean; onExpand: () => void }) {
  const [ref, onScreen] = useOnScreen<HTMLElement>();
  const glow = def.glow !== false;
  // Magic Card: a soft light and a green edge follow the cursor across the card
  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--sbx-mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--sbx-my', `${e.clientY - r.top}px`);
  };
  return (
    <motion.article
      ref={ref}
      layoutId={`sbx-card-${def.area}`}
      className={`sbx-card sbx-${def.area}${glow ? ' has-glow' : ''}`}
      aria-label={def.label}
      style={{ borderRadius: 20 }}
      onPointerMove={glow ? onMove : undefined}
    >
      {glow && <span className="sbx-glow" aria-hidden="true" />}
      <header className="sbx-head">
        <h3>{def.title} <span>{def.muted}</span></h3>
        <button type="button" className="sbx-arrow" onClick={onExpand} aria-label={`Expand: ${def.label}`} aria-haspopup="dialog">{ARROW}</button>
      </header>
      <div className="sbx-stage">{def.render(onScreen && !reduce && !paused, reduce)}</div>
    </motion.article>
  );
}

function Expanded({ def, still, onClose }: { def: CardDef; still: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const present = useIsPresent(); // while it fades out, clicks pass through to the page
  useEffect(() => {
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prevOverflow; lenis?.start(); removeEventListener('keydown', onKey); };
  }, [onClose]);
  const join = () => {
    onClose();
    const el = document.getElementById('join') || document.getElementById('onboarding');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.dispatchEvent(new CustomEvent('open-supplier-modal'));
  };
  return (
    <motion.div className="sbx-overlay" style={{ pointerEvents: present ? 'auto' : 'none' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.05 } }} onClick={onClose}>
      <motion.div
        layoutId={`sbx-card-${def.area}`}
        className={`sbx-card sbx-modal sbx-${def.area}`}
        style={{ borderRadius: 24 }}
        role="dialog"
        aria-modal="true"
        aria-label={def.label}
        onClick={(e) => e.stopPropagation()}
        transition={{ type: 'spring', stiffness: 230, damping: 30 }}
      >
        <header className="sbx-head">
          <h3>{def.title} <span>{def.muted}</span></h3>
          <button ref={closeRef} type="button" className="sbx-arrow sbx-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </header>
        <motion.div className="sbx-modal-body" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.18, ease: [0.4, 0, 0.2, 1] }}>
          <div className="sbx-modal-copy">
            <p>{def.desc}</p>
            <ul>
              {def.points.map((pt) => <li key={pt}><span className="sbx-tick"><Check /></span>{pt}</li>)}
            </ul>
            <button type="button" className="sbx-modal-cta" onClick={join}>Join as a Supplier <span aria-hidden="true">→</span></button>
          </div>
          <div className="sbx-stage sbx-modal-stage">{def.render(!still, still)}</div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function SupplierBentoGrid() {
  const prefersReduced = useReducedMotion() ?? false;
  const [open, setOpen] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // the server can't know the visitor's motion setting, so the first render matches it and still frames swap in after
  const reduce = mounted && prefersReduced;
  const close = useCallback(() => setOpen(null), []);
  const openDef = CARDS.find((c) => c.area === open) ?? null;
  return (
    <MotionConfig reducedMotion="user">
      <div className="sbx-grid">
        {CARDS.map((c) =>
          c.area === open ? (
            <div key={c.area} className={`sbx-card sbx-${c.area} sbx-placeholder`} aria-hidden="true" />
          ) : (
            <Card key={c.area} def={c} reduce={reduce} paused={open !== null} onExpand={() => setOpen(c.area)} />
          ),
        )}
        {mounted && createPortal(
          <AnimatePresence>{openDef && <Expanded key={openDef.area} def={openDef} still={reduce} onClose={close} />}</AnimatePresence>,
          document.body,
        )}
      </div>
    </MotionConfig>
  );
}
