'use client';
// Early stock-out alerts: stock bars drain against live café demand; when one runs low an alert names it, with
// the days left and a suggested reorder, and drafts the PO itself if nobody does.
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Window, useEvery } from './shared';

/* ═════════════════════════ 4. EARLY STOCK-OUT ALERTS ═════════════════════════ */
const SKUS = [
  { name: 'Barista Oat Milk', stock: 0.82, burn: 0.05, up: 18, cafes: 42, reorder: '120 L', img: '/landing/spotlight/barista-oat-carton.jpg' },
  { name: 'Arabica AA', stock: 0.64, burn: 0.014, up: 9, cafes: 31, reorder: '40 kg', img: '/landing/spotlight/arabica-coffee-bag.jpg' },
  { name: 'Fresh cream', stock: 0.55, burn: 0.02, up: 12, cafes: 27, reorder: '60 L', img: '/landing/spotlight/amul-fresh-cream.png' },
  { name: 'Vanilla syrup', stock: 0.71, burn: 0.011, up: 6, cafes: 19, reorder: '24 btl', img: '/landing/spotlight/davinci-vanilla-syrup.webp' },
];

export function AlertsCard({ run }: { run: boolean }) {
  const [lv, setLv] = useState(SKUS.map((s) => s.stock));
  const [alert, setAlert] = useState<number | null>(null); // which SKU the alert is about
  const [po, setPo] = useState(false);
  const lowest = lv.indexOf(Math.min(...lv));
  const low = lv[lowest] < 0.2;

  useEvery(420, run && !po, () => setLv((l) => l.map((v, i) => Math.max(0.08, v - SKUS[i].burn * (0.6 + Math.random() * 0.8)))));
  useEffect(() => { if (low && !po && alert === null) setAlert(lowest); }, [low, po, alert, lowest]);
  const draft = useCallback(() => {
    setPo(true);
    setAlert((a) => {
      if (a !== null) setTimeout(() => setLv((l) => l.map((v, i) => (i === a ? 0.92 : v))), 500);
      return a;
    });
    setTimeout(() => { setAlert(null); setPo(false); }, 2400);
  }, []);
  // if nobody presses it, the alert drafts the PO itself after a moment, then stock is restored
  useEffect(() => {
    if (!run || alert === null || po) return;
    const id = setTimeout(draft, 3600);
    return () => clearTimeout(id);
  }, [run, alert, po, draft]);

  return (
    <Window title="Inventory · Watchlist" className="sbx-alert-win">
      <ul className="sbx-skus">
        {SKUS.map((s, i) => {
          const days = Math.max(1, Math.round(lv[i] * 16));
          const state = lv[i] < 0.2 ? 'crit' : lv[i] < 0.35 ? 'warn' : 'ok';
          return (
            <li key={s.name} className={`is-${state}`}>
              <img src={s.img} alt="" />
              <span className="sbx-sku-txt"><b>{s.name}</b><small>{days} days left</small></span>
              <span className="sbx-bar"><i style={{ width: `${lv[i] * 100}%` }} /></span>
            </li>
          );
        })}
      </ul>
      <AnimatePresence>
        {alert !== null && (
          <motion.div className="sbx-alert" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }}>
            <span className="sbx-warn" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2 20h20zM12 10v4M12 17h.01" /></svg></span>
            <div>
              <b>{SKUS[alert].name} runs out in {Math.max(1, Math.round(lv[alert] * 16))} days</b>
              <small>Demand up {SKUS[alert].up}% across {SKUS[alert].cafes} cafés. Suggested reorder: {SKUS[alert].reorder}.</small>
            </div>
            <button type="button" className={po ? 'is-done' : ''} onClick={draft} disabled={po}>{po ? 'PO drafted ✓' : 'Draft PO'}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </Window>
  );
}
