'use client';
// WhatsApp automation, as an animated notification list (after Magic UI's Animated List): one café's chat
// becomes an order, a confirmation, an invoice and a payment, each step springing in at the top while the
// earlier ones slide down. Auto-pilot can be switched off, which pauses the flow.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GradientMark, clock, inr } from './shared';

type Flow = { cafe: string; msg: string; order: string; items: number; amt: number; slot: string; inv: string; t: number };
const FLOWS: Flow[] = [
  { cafe: 'Raydee Café', msg: 'Need 20 L oat milk and 5 kg Arabica for tomorrow 🙏', order: 'GRD-4831', items: 2, amt: 8300, slot: 'tomorrow, 9–11 AM', inv: 'INV-2291', t: 41 },
  { cafe: 'Third Wave Coffee', msg: 'Same as last week, plus 6 vanilla syrups please', order: 'GRD-4832', items: 3, amt: 11760, slot: 'today, 4–6 PM', inv: 'INV-2292', t: 52 },
  { cafe: 'Subko', msg: '2 packs of Callebaut 811 and 4 matcha tins', order: 'GRD-4833', items: 2, amt: 14460, slot: 'tomorrow, 8–10 AM', inv: 'INV-2293', t: 63 },
];
type Kind = 'wa' | 'order' | 'confirm' | 'invoice' | 'paid';
const COLOR: Record<Kind, string> = { wa: '#25D366', order: '#121413', confirm: '#1E86FF', invoice: '#FFB800', paid: '#00C9A7' };
const ICON: Record<Exclude<Kind, 'order'>, string> = {
  wa: 'M12 3.6a8.4 8.4 0 0 0-7.2 12.7L3.6 20.4l4.2-1.1A8.4 8.4 0 1 0 12 3.6z',
  confirm: 'M2.5 12.6l3.6 3.6 7-7.6M10.4 15.4l.8.8 8.3-8.6',
  invoice: 'M6 3h9l4 4v14H6zM14.5 3v4.5H19M9 12.5h7M9 16.5h5',
  paid: 'M7 5h10M7 9h10M7 5c4.5 0 6 1.8 6 4s-1.5 4-6 4l6.5 6',
};
function steps(f: Flow) {
  return [
    { kind: 'wa' as const, title: 'New WhatsApp order', time: clock(f.t), body: `${f.cafe}: “${f.msg}”` },
    { kind: 'order' as const, title: 'Order created automatically', time: clock(f.t), body: `${f.order} · ${f.items} items · ${inr(f.amt)}` },
    { kind: 'confirm' as const, title: 'Confirmation sent', time: clock(f.t), body: `Delivery ${f.slot} ✓✓` },
    { kind: 'invoice' as const, title: 'Invoice shared in the chat', time: clock(f.t + 1), body: `${f.inv} · ${inr(f.amt)} · PDF` },
    { kind: 'paid' as const, title: 'Payment received', time: clock(f.t + 26), body: `${inr(f.amt)} via UPI from ${f.cafe}` },
  ];
}

export function WhatsAppCard({ run, still }: { run: boolean; still: boolean }) {
  const [auto, setAuto] = useState(true);
  const [flow, setFlow] = useState(0);
  const [shown, setShown] = useState(1);
  const active = run && auto;

  // one step every ~1.1s; after the payment lands, hold, clear, and start the next café
  useEffect(() => {
    if (!active) return;
    const id = shown < 5
      ? setTimeout(() => setShown((s) => s + 1), shown === 0 ? 650 : 1150)
      : setTimeout(() => setShown(0), 2600);
    return () => clearTimeout(id);
  }, [active, shown]);
  useEffect(() => {
    if (shown === 0) setFlow((x) => (x + 1) % FLOWS.length);
  }, [shown]);

  const items = steps(FLOWS[flow]).slice(0, still ? 5 : shown).reverse();

  return (
    <div className="sbx-wa">
      <div className="sbx-wa-bar">
        <span className="sbx-wa-src">
          <i className="sbx-wa-logo" aria-hidden="true"><svg viewBox="0 0 24 24"><path d={ICON.wa} /></svg></i>
          <span><b>WhatsApp Business</b><small>{auto ? 'Replies, invoices and payment links go out on their own' : 'Paused · new chats wait for your reply'}</small></span>
        </span>
        <button type="button" role="switch" aria-checked={auto} className={`sbx-switch${auto ? ' is-on' : ''}`} onClick={() => setAuto((a) => !a)}>
          <span>Auto-pilot</span>
          <i><motion.b layout transition={{ type: 'spring', stiffness: 500, damping: 32 }} /></i>
        </button>
      </div>
      <ul className="sbx-wa-list" aria-live="polite">
        <AnimatePresence>
          {items.map((it) => (
            <motion.li
              key={`${flow}-${it.kind}`}
              layout
              initial={still ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, originY: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 350, damping: 40 }}
              className="sbx-wa-item"
            >
              <span className="sbx-wa-ic" style={{ background: COLOR[it.kind] }}>
                {it.kind === 'order' ? <GradientMark size={18} /> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICON[it.kind]} /></svg>}
              </span>
              <span className="sbx-wa-tx">
                <span className="sbx-wa-title"><b>{it.title}</b><small>· {it.time}</small></span>
                <small>{it.body}</small>
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
