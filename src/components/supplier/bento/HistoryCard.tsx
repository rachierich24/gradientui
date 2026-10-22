'use client';
// Order history & bill sync: every order in one searchable list (rows spring into view as it scrolls, a selection
// glides between them, arrow keys move it), and the selected order's bill as a receipt. New bills are read by a
// scan line, then sync to the accounting app and get matched to their payment, line by line.
import { useEffect, useId, useRef, useState, type KeyboardEvent, type Ref } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Glyph, GradientMark, Window, initials, inr } from './shared';

type Sync = 'synced' | 'syncing' | 'due';
type Order = { id: string; cafe: string; area: string; date: string; inv: string; pay: string; lines: [string, number, number][]; sync: Sync };
const ORDERS: Order[] = [
  { id: 'GRD-4831', cafe: 'Raydee Café', area: 'Indiranagar', date: '24 Oct', inv: 'INV-2291', pay: 'UPI', sync: 'syncing', lines: [['Barista Oat Milk · 1 L', 20, 210], ['Arabica AA · 1 kg', 5, 820]] },
  { id: 'GRD-4830', cafe: 'Blue Tokai', area: 'Koramangala', date: '24 Oct', inv: 'INV-2290', pay: 'NEFT', sync: 'synced', lines: [['Arabica AA · 1 kg', 12, 820], ['Barista Oat Milk · 1 L', 12, 210]] },
  { id: 'GRD-4829', cafe: 'Third Wave Coffee', area: 'Indiranagar', date: '23 Oct', inv: 'INV-2289', pay: 'UPI', sync: 'syncing', lines: [['Barista Oat Milk · 1 L', 24, 210], ['Vanilla syrup · 750 ml', 6, 580]] },
  { id: 'GRD-4828', cafe: 'Subko', area: 'Bandra West', date: '23 Oct', inv: 'INV-2288', pay: 'UPI', sync: 'due', lines: [['Callebaut 811 · 2.5 kg', 2, 3450], ['Ceremonial matcha · 100 g', 4, 1890]] },
  { id: 'GRD-4827', cafe: 'Araku Café', area: 'Indiranagar', date: '22 Oct', inv: 'INV-2287', pay: 'UPI', sync: 'synced', lines: [['Fresh cream · 1 L', 20, 215], ['Callebaut 811 · 2.5 kg', 1, 3450]] },
  { id: 'GRD-4826', cafe: 'Dope Coffee', area: 'HSR Layout', date: '22 Oct', inv: 'INV-2286', pay: 'UPI', sync: 'syncing', lines: [['Vanilla syrup · 750 ml', 6, 580], ['Fresh cream · 1 L', 10, 215]] },
  { id: 'GRD-4825', cafe: 'Kitchen at 12th', area: 'Jayanagar', date: '21 Oct', inv: 'INV-2285', pay: 'Card', sync: 'synced', lines: [['Amul butter · 500 g', 20, 285], ['Fresh cream · 1 L', 12, 215]] },
  { id: 'GRD-4824', cafe: 'Roastery Coffee House', area: 'Banjara Hills', date: '21 Oct', inv: 'INV-2284', pay: 'NEFT', sync: 'synced', lines: [['Ceremonial matcha · 100 g', 8, 1890]] },
  { id: 'GRD-4823', cafe: 'Maverick & Farmer', area: 'Indiranagar', date: '20 Oct', inv: 'INV-2283', pay: 'UPI', sync: 'due', lines: [['Arabica AA · 1 kg', 8, 820], ['Barista Oat Milk · 1 L', 18, 210]] },
  { id: 'GRD-4822', cafe: 'Slay Coffee', area: 'HSR Layout', date: '20 Oct', inv: 'INV-2282', pay: 'UPI', sync: 'synced', lines: [['Caramel syrup · 750 ml', 6, 560], ['Paper cups · 12 oz', 500, 6.5]] },
  { id: 'GRD-4821', cafe: 'KC Roasters', area: 'Koramangala', date: '19 Oct', inv: 'INV-2281', pay: 'NEFT', sync: 'synced', lines: [['Arabica AA · 1 kg', 20, 820]] },
  { id: 'GRD-4820', cafe: 'Raydee Café', area: 'Indiranagar', date: '19 Oct', inv: 'INV-2280', pay: 'UPI', sync: 'synced', lines: [['Barista Oat Milk · 1 L', 24, 210], ['Fresh cream · 1 L', 8, 215]] },
];
const INITIAL: Record<string, Sync> = Object.fromEntries(ORDERS.map((o) => [o.id, o.sync]));
const subtotal = (o: Order) => o.lines.reduce((a, [, q, p]) => a + q * p, 0);
const SEARCH = 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4.2-4.2';

function SyncMark({ s }: { s: Sync }) {
  if (s === 'synced') return <span className="sbx-hi-st is-ok" title="Synced"><Check /></span>;
  if (s === 'due') return <span className="sbx-hi-st is-due">Due</span>;
  return <span className="sbx-hi-st is-wait" title="Syncing"><i className="sbx-spin" /></span>;
}

function Receipt({ o, sync, still, ref }: { o: Order; sync: Sync; still: boolean; ref?: Ref<HTMLElement> }) {
  // a bill that's still syncing is read first (scan line), then each check lands in turn
  const fresh = sync === 'syncing';
  const [step, setStep] = useState(fresh ? 0 : 2);
  const st = fresh && !still ? step : 2;
  useEffect(() => {
    if (!fresh || still) return;
    const a = setTimeout(() => setStep(1), 950), b = setTimeout(() => setStep(2), 1550);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [fresh, still]);
  const sub = subtotal(o), gst = Math.round(sub * 0.05);
  const due = o.sync === 'due';
  return (
    <motion.article
      ref={ref}
      className="sbx-rc"
      initial={{ y: 26, opacity: 0, rotate: 1.2 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      exit={{ y: -18, opacity: 0, rotate: -0.8, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
    >
      <header className="sbx-rc-head">
        <span className="sbx-rc-logo"><GradientMark size={12} /></span>
        <span><b>Tax invoice</b><small>{o.inv} · {o.date}</small></span>
      </header>
      <div className="sbx-rc-to"><small>Billed to</small><b>{o.cafe}</b><small>{o.area} · {o.id}</small></div>
      <ul className="sbx-rc-lines">
        {o.lines.map(([n, q, p]) => <li key={n}><span>{n}</span><span>× {q}</span><span>{inr(q * p)}</span></li>)}
      </ul>
      <div className="sbx-rc-sum"><span>Subtotal</span><span>{inr(sub)}</span></div>
      <div className="sbx-rc-sum"><span>GST 5%</span><span>{inr(gst)}</span></div>
      <div className="sbx-rc-total"><span>Total</span><b>{inr(sub + gst)}</b></div>
      <ul className="sbx-rc-sync">
        <li className={st >= 1 ? 'is-ok' : 'is-wait'}>
          {st >= 1 ? <Check /> : <i className="sbx-spin" />}<span>{st >= 1 ? 'Synced to Tally' : 'Syncing to Tally…'}</span>
        </li>
        <li className={due ? 'is-due' : st >= 2 ? 'is-ok' : 'is-wait'}>
          {due ? <i className="sbx-rc-due" /> : st >= 2 ? <Check /> : <i className="sbx-spin" />}
          <span>{due ? 'Payment due · reminder sent on WhatsApp' : st >= 2 ? `Matched to ${o.pay} payment` : 'Matching payment…'}</span>
        </li>
      </ul>
      {fresh && !still && <span className="sbx-rc-scan" aria-hidden="true" />}
    </motion.article>
  );
}

export function HistoryCard({ run, still }: { run: boolean; still: boolean }) {
  const uid = useId().replace(/:/g, '');
  const [sel, setSel] = useState(0);
  const [sync, setSync] = useState<Record<string, Sync>>(INITIAL);
  const [hold, setHold] = useState(false);
  const [fade, setFade] = useState({ top: 0, bottom: 1 });
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const o = ORDERS[sel];
  // with reduced motion there's no sync to watch, so bills show as already synced
  const status = (id: string): Sync => (still && sync[id] === 'syncing' ? 'synced' : sync[id]);

  // the film walks down the history, a bill every few seconds
  useEffect(() => {
    if (!run || hold) return;
    const id = setTimeout(() => setSel((i) => (i + 1) % ORDERS.length), 3000);
    return () => clearTimeout(id);
  }, [run, hold, sel]);

  // each pass through the history starts with the newest bills still syncing, so every loop shows them sync
  useEffect(() => { if (sel === 0) setSync(INITIAL); }, [sel]);

  // a selected bill that was syncing finishes syncing
  useEffect(() => {
    if (sync[o.id] !== 'syncing' || still) return;
    const id = setTimeout(() => setSync((m) => ({ ...m, [o.id]: 'synced' })), 1600);
    return () => clearTimeout(id);
  }, [o.id, sync, still]);

  // keep the selected row in view
  useEffect(() => {
    const list = listRef.current, row = rowRefs.current[sel];
    if (!list || !row) return;
    const top = row.offsetTop - list.clientHeight * 0.32;
    list.scrollTo({ top: sel === 0 ? 0 : Math.max(0, top), behavior: still ? 'auto' : 'smooth' });
  }, [sel, still]);
  useEffect(() => () => clearTimeout(holdTimer.current), []);

  const pick = (i: number) => {
    setSel(i);
    setHold(true);
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setHold(false), 7000);
  };
  const onKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      pick((sel + (e.key === 'ArrowDown' ? 1 : ORDERS.length - 1)) % ORDERS.length);
    }
  };
  const onScroll = () => {
    const l = listRef.current;
    if (!l) return;
    setFade({ top: Math.min(1, l.scrollTop / 40), bottom: Math.min(1, (l.scrollHeight - l.scrollTop - l.clientHeight) / 40) });
  };

  return (
    <Window title="Gradient · Order history">
      <div className="sbx-body">
        <div className="sbx-hi">
          <div className="sbx-hi-left">
            <div className="sbx-hi-search"><Glyph d={SEARCH} /><span>Search 2,481 orders, cafés, invoices</span><kbd>⌘K</kbd></div>
            <div className="sbx-hi-sum"><span>October</span><b>214 orders · ₹13.4L billed</b></div>
            <div className="sbx-hi-listwrap">
              <ul
                ref={listRef}
                className="sbx-hi-list"
                role="listbox"
                tabIndex={0}
                aria-label="Order history"
                aria-activedescendant={`${uid}-row-${sel}`}
                onKeyDown={onKey}
                onScroll={onScroll}
                data-lenis-prevent
              >
                {ORDERS.map((r, i) => (
                  <motion.li
                    key={r.id}
                    id={`${uid}-row-${i}`}
                    ref={(n: HTMLLIElement | null) => { rowRefs.current[i] = n; }}
                    role="option"
                    aria-selected={i === sel}
                    className={`sbx-hi-row${i === sel ? ' is-sel' : ''}`}
                    onClick={() => pick(i)}
                    initial={still ? false : { scale: 0.7, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ root: listRef, amount: 0.5 }}
                    transition={{ duration: 0.22, delay: 0.04 }}
                  >
                    {i === sel && <motion.span layoutId={`${uid}-sel`} className="sbx-hi-sel" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                    <span className="sbx-hi-date">{r.date}</span>
                    <span className="sbx-av">{initials(r.cafe)}</span>
                    <span className="sbx-hi-who"><b>{r.cafe}</b><small>{r.id} · {r.lines.length} items</small></span>
                    <span className="sbx-hi-amt">{inr(subtotal(r) * 1.05)}</span>
                    <SyncMark s={status(r.id)} />
                  </motion.li>
                ))}
              </ul>
              <span className="sbx-hi-fade is-top" style={{ opacity: fade.top }} aria-hidden="true" />
              <span className="sbx-hi-fade is-bottom" style={{ opacity: fade.bottom }} aria-hidden="true" />
            </div>
          </div>
          <div className="sbx-hi-right">
            <AnimatePresence mode="popLayout" initial={false}>
              <Receipt key={o.id} o={o} sync={sync[o.id]} still={still} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Window>
  );
}
