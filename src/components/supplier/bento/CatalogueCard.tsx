'use client';
// Catalogue building: the catalogue as a folder of real product sheets. On loop, a new product sheet floats in,
// the folder's flap tips open, the sheet drops inside and the catalogue count ticks up. Hover peeks into the
// folder; click (or Enter) fans every sheet out so the products can be read.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, GradientMark, useScript } from './shared';

type Cat = 'coffee' | 'dairy' | 'syrups' | 'bakery';
const CATS: { key: Cat; label: string }[] = [
  { key: 'coffee', label: 'Coffee & tea' }, { key: 'dairy', label: 'Dairy' }, { key: 'syrups', label: 'Syrups' }, { key: 'bakery', label: 'Bakery' },
];
type P = { id: string; name: string; price: string; cat: Cat; img: string };
const SEED: P[] = [
  { id: 'cream', name: 'Amul Fresh Cream · 1 L', price: '₹215 / L', cat: 'dairy', img: '/landing/spotlight/amul-fresh-cream.png' },
  { id: 'vienna', name: 'Blue Tokai Vienna · 1 kg', price: '₹1,450 / kg', cat: 'coffee', img: '/landing/spotlight/blue-tokai-vienna-roast.jpg' },
  { id: 'caramel', name: 'Caramel Syrup · 750 ml', price: '₹560', cat: 'syrups', img: '/landing/spotlight/caramel-syrup-bottle.jpg' },
];
const INCOMING: P[] = [
  { id: 'oat', name: 'Barista Oat Milk · 1 L', price: '₹210 / L', cat: 'dairy', img: '/landing/spotlight/barista-oat-carton.jpg' },
  { id: 'callebaut', name: 'Callebaut 811 · 2.5 kg', price: '₹3,450', cat: 'bakery', img: '/landing/spotlight/callebaut-811-dark-chocolate.png' },
  { id: 'matcha', name: 'Ceremonial Matcha · 100 g', price: '₹1,890', cat: 'coffee', img: '/landing/spotlight/ceremonial-matcha-tin.jpg' },
  { id: 'vanilla', name: 'Vanilla Syrup · 750 ml', price: '₹580', cat: 'syrups', img: '/landing/spotlight/davinci-vanilla-syrup.webp' },
];
const CAT_SCRIPT = [['rest', 1300], ['arrive', 1150], ['receive', 900], ['close', 700], ['live', 1900]] as const;

// where each sheet sits, by rank (0 = newest, in front): resting in the folder, and fanned out when open
const REST = [{ x: 0, y: 0, r: -1.5 }, { x: -42, y: 11, r: -6.5 }, { x: 42, y: 8, r: 5.5 }];
const OPEN_WIDE = [{ x: 0, y: -74, r: 0 }, { x: -102, y: -56, r: -7.5 }, { x: 102, y: -60, r: 6.5 }];
const OPEN_NARROW = [{ x: 0, y: -66, r: 0 }, { x: -84, y: -48, r: -7 }, { x: 84, y: -52, r: 6 }];
type Mode = 'rest' | 'peek' | 'open';
function pose(rank: number, mode: Mode, floating: boolean, compact: boolean) {
  if (floating) return { x: 0, y: compact ? -92 : -104, rotate: -2.5, scale: 1, opacity: 1 };
  const r = REST[rank] ?? REST[2];
  if (mode === 'open') {
    const openPos = compact ? OPEN_NARROW : OPEN_WIDE;
    const o = openPos[rank] ?? openPos[2];
    return { x: o.x, y: o.y, rotate: o.r, scale: 1, opacity: 1 };
  }
  if (mode === 'peek') return { x: r.x * 1.18, y: r.y - 14, rotate: r.r * 1.4, scale: 1, opacity: 1 };
  return { x: r.x, y: r.y, rotate: r.r, scale: 1, opacity: 1 };
}

type Sheet = { k: string; p: P };

export function CatalogueCard({ run }: { run: boolean }) {
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const { phase } = useScript(CAT_SCRIPT, run && !hover && !open);
  const [sheets, setSheets] = useState<Sheet[]>(SEED.map((p) => ({ k: `${p.id}-seed`, p })));
  const [incoming, setIncoming] = useState<Sheet | null>(null);
  const [count, setCount] = useState(248);
  const [cats, setCats] = useState<Record<Cat, number>>({ coffee: 64, dairy: 48, syrups: 36, bakery: 52 });
  const [live, setLive] = useState<P | null>(null);
  const n = useRef(0);
  const incRef = useRef<Sheet | null>(null);
  const frontRef = useRef<P>(SEED[0]);

  useEffect(() => {
    const mq = matchMedia('(max-width: 720px)');
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    switch (phase) {
      case 'rest':
        setLive(null);
        break;
      case 'arrive': {
        const p = INCOMING[n.current % INCOMING.length];
        incRef.current = { k: `${p.id}-${n.current}`, p };
        setIncoming(incRef.current);
        n.current += 1;
        break;
      }
      case 'receive': {
        // the new sheet drops into the front slot; the oldest sinks out of view
        const inc = incRef.current;
        if (!inc) break;
        incRef.current = null;
        frontRef.current = inc.p;
        setIncoming(null);
        setSheets((l) => [inc, ...l.slice(0, 2)]);
        break;
      }
      case 'close': {
        const p = frontRef.current;
        setCount((c) => c + 1);
        setCats((c) => ({ ...c, [p.cat]: c[p.cat] + 1 }));
        setLive(p);
        break;
      }
    }
  }, [phase]);

  const mode: Mode = open ? 'open' : hover ? 'peek' : 'rest';
  const flap = open ? -60 : hover ? -16 : phase === 'receive' ? -34 : 0;
  const list = incoming ? [incoming, ...sheets] : sheets;
  const toggle = () => setOpen((o) => !o);

  return (
    <div className="sbx-fd-wrap">
      <div
        className={`sbx-fd${open ? ' is-open' : ''}`}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={`Catalogue folder, ${count} products. ${open ? 'Close' : 'Open'} to see the latest products`}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => { setHover(false); setOpen(false); }}
        onClick={toggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
      >
        <div className="sbx-fd-back"><span className="sbx-fd-tab">Catalogue</span></div>
        <AnimatePresence initial={false}>
          {list.map((s, i) => {
            const isIncoming = incoming?.k === s.k;
            const rank = incoming ? i - 1 : i;
            const openPos = compact ? OPEN_NARROW : OPEN_WIDE;
            return (
              <motion.div
                key={s.k}
                className="sbx-fd-paper"
                style={{ zIndex: isIncoming ? 20 : 10 - rank }}
                initial={{ x: 118, y: -146, rotate: 14, opacity: 0, scale: 0.9 }}
                animate={pose(rank, mode, isIncoming, compact)}
                exit={{ y: 46, opacity: 0, scale: 0.94, transition: { duration: 0.45 } }}
                transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                whileHover={open ? { y: (openPos[rank] ?? openPos[2]).y - 10, scale: 1.05, rotate: 0 } : undefined}
              >
                <span className="sbx-fd-ph"><img src={s.p.img} alt="" loading="lazy" /></span>
                <b>{s.p.name}</b>
                <small>{s.p.price}</small>
                {isIncoming && <em className="sbx-fd-new">New</em>}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <motion.div className="sbx-fd-front" animate={{ rotateX: flap }} transition={{ type: 'spring', stiffness: 170, damping: 19 }}>
          <span className="sbx-fd-mark"><GradientMark size={14} /></span>
          <AnimatePresence mode="wait" initial={false}>
            {live ? (
              <motion.span key="live" className="sbx-fd-label" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <b><i className="sbx-fd-ok"><Check /></i>{live.name.split(' · ')[0]} is live</b>
                <small>Visible to your cafés now</small>
              </motion.span>
            ) : (
              <motion.span key="count" className="sbx-fd-label" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <b>{count} products</b>
                <small>Live for your cafés</small>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <div className="sbx-fd-cats">
        {CATS.map((c) => (
          <span key={c.key} className={live?.cat === c.key ? 'is-hot' : ''}>
            {c.label}
            <motion.b key={cats[c.key]} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{cats[c.key]}</motion.b>
          </span>
        ))}
      </div>
      {/* "Tap" on a touch screen, "Click" with a mouse (bento.css shows one) */}
      <p className="sbx-fd-hint" aria-hidden="true">
        <span className="sbx-on-fine">{open ? 'Click to close' : 'Click the folder to open it'}</span>
        <span className="sbx-on-touch">{open ? 'Tap to close' : 'Tap the folder to open it'}</span>
      </p>
    </div>
  );
}
