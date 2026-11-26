'use client';
// The hero's dashboard: one café order's journey through the Supplier Portal, played like a short product film
// rather than explained in paragraphs. A 16:9 app window on every screen, a phone included.
//
// Each of the six steps (received → connect → accept → pack → dispatch → paid) is a moment of the product in motion,
// built the way product films on startup sites are: a cursor glides in and clicks the thing that moves the order on
// (accept, print the label, dispatch); the frame eases in a touch toward the action; the reply types itself; numbers
// count up; events land in an activity log; the bank's notification drops in at the end. One idea per step, a few
// words under it, the same order throughout (its card, its status, its log), so it reads as one continuous story.
//
// Wide, the window has a slim top bar, an icon rail and the order's panel (status, activity, payout) at the right.
// Narrow (a phone), the same 16:9 window keeps just the step track, the moment and its name. Every size is relative
// to the window's own width (container units), so it scales as one piece. The hero (SupplierHeroScene) owns the
// clock: which step, playing or paused. Styles: app/supplier/supplier-board.css
import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { animate, motion, MotionConfig, AnimatePresence, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';

export type BoardStage = 1 | 2 | 3 | 4 | 5 | 6;

const ic = (d: ReactNode) => <svg viewBox="0 0 24 24" aria-hidden="true">{d}</svg>;
const I = {
  received: ic(<><path d="M4 13l2.5-7h11L20 13v6H4z" /><path d="M4 13h4.5l1 2h5l1-2H20" /></>),
  connect: ic(<path d="M5 6h14v9h-9l-4 3v-3H5z" />),
  accept: ic(<><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>),
  pack: ic(<><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></>),
  dispatch: ic(<><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="17.5" r="1.6" /><circle cx="17.5" cy="17.5" r="1.6" /></>),
  paid: ic(<><path d="M4 8h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4z" /><path d="M4 8l11-4v4M15.5 13.5h4.5" /></>),
  home: ic(<path d="M4 11l8-6 8 6v8h-5v-5H9v5H4z" />),
  orders: ic(<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>),
  check: ic(<path d="m5 12.5 4.5 4.5L19 7.5" />),
  pause: ic(<path d="M8 5v14M16 5v14" />),
  play: ic(<path d="M7 4.5v15l12-7.5z" />),
  arrow: ic(<path d="M4 12h15M13 6l6 6-6 6" />),
  beans: ic(<><ellipse cx="12" cy="12" rx="5.6" ry="8" transform="rotate(30 12 12)" /><path d="M14.6 5.6c-2.6 2-3.6 4.4-2.6 6.6s.2 4.6-2.6 6.2" /></>),
  shield: ic(<><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="m8.8 12 2.2 2.2 4.4-4.6" /></>),
  scale: ic(<><path d="M5 20h14l-1.5-9h-11z" /><path d="M9 11a3 3 0 0 1 6 0" /></>),
  seal: ic(<><circle cx="12" cy="12" r="7.5" /><path d="M9 12h6" /></>),
  qr: ic(<><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" /><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2" /></>),
  bank: ic(<><path d="M3 10l9-6 9 6" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" /></>),
};

const STEPS: { id: BoardStage; label: string; icon: ReactNode; title: string; sub: string }[] = [
  { id: 1, label: 'Received', icon: I.received, title: 'Orders arrive from WhatsApp', sub: 'Read and filed as #GRB-1048' },
  { id: 2, label: 'Connect', icon: I.connect, title: 'The café’s notes, on the order', sub: 'No calls back and forth' },
  { id: 3, label: 'Accept', icon: I.accept, title: 'Accept in one tap', sub: '10 kg reserved from your stock' },
  { id: 4, label: 'Pack', icon: I.pack, title: 'Weighed, sealed, labelled', sub: 'Checked before it leaves the bay' },
  { id: 5, label: 'Dispatch', icon: I.dispatch, title: 'Out for delivery', sub: 'A live route and ETA for the café' },
  { id: 6, label: 'Paid', icon: I.paid, title: 'Paid the next day', sub: 'Released from escrow on delivery' },
];
const STATUS: Record<BoardStage, string> = { 1: 'New', 2: 'New', 3: 'Confirmed', 4: 'Packed', 5: 'In transit', 6: 'Paid' };
// the order's activity, one event per step (the panel shows those that have happened, newest first)
const LOG: { s: BoardStage; t: string; l: string }[] = [
  { s: 1, t: '9:42 PM', l: 'Order from WhatsApp' },
  { s: 2, t: '9:44 PM', l: 'Café added a note' },
  { s: 3, t: '10:01 AM', l: 'Accepted · 10 kg reserved' },
  { s: 4, t: '11:30 AM', l: 'Packed · 10.45 kg' },
  { s: 5, t: '11:46 AM', l: 'Out for delivery' },
  { s: 6, t: '12:02 PM', l: 'Delivered · ₹8,200 paid' },
];

const EASE = [0.2, 0.7, 0.2, 1] as const;
const rise = (delay = 0) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay, ease: EASE } });

/* ─── the film's pieces ─── */

// a number that counts up when its moment appears
function Count({ to, decimals = 0, delay = 0.25, duration = 1.1 }: { to: number; decimals?: number; delay?: number; duration?: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? to : 0);
  const text = useTransform(mv, (v) => v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
  useEffect(() => {
    if (reduce) return;
    const c = animate(mv, to, { duration, delay, ease: EASE });
    return () => c.stop();
  }, [mv, to, delay, duration, reduce]);
  return <motion.span>{text}</motion.span>;
}

// text that types itself, a character at a time (its bubble grows with it, as a chat does)
function Typed({ text, delay, speed = 30 }: { text: string; delay: number; speed?: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (reduce) return;
    let i = 0;
    let iv: ReturnType<typeof setInterval> | undefined;
    const t = setTimeout(() => {
      iv = setInterval(() => { i += 1; setN(i); if (i >= text.length && iv) clearInterval(iv); }, speed);
    }, delay * 1000);
    return () => { clearTimeout(t); if (iv) clearInterval(iv); };
  }, [text, delay, speed, reduce]);
  return (
    <span className="sjb-typed" aria-label={text}>{text.slice(0, n)}{n < text.length && <span className="sjb-caret" aria-hidden="true" />}</span>
  );
}

// a pointer that glides to what it's about to press, and presses it, like a screen recording. Positions are % of the
// moment's own box, so it lands on the same spot at any size; the press ripples out from that spot.
type Pt = [string, string];
function Cursor({ path, times, delay = 0, duration, press }: { path: Pt[]; times: number[]; delay?: number; duration: number; press?: { at: number; x: string; y: string } }) {
  return (
    <>
      {press && (
        <motion.span className="sjb-press" style={{ left: press.x, top: press.y }} initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1], opacity: [0.55, 0] }} transition={{ delay: press.at, duration: 0.55, ease: 'easeOut' }} />
      )}
      <motion.span className="sjb-cursor" initial={{ left: path[0][0], top: path[0][1], opacity: 0 }}
        animate={{ left: path.map((p) => p[0]), top: path.map((p) => p[1]), opacity: path.map((_, i) => (i === 0 ? 0 : 1)) }}
        transition={{ delay, duration, times, ease: [0.45, 0, 0.2, 1] }}>
        <motion.svg viewBox="0 0 24 24" aria-hidden="true" animate={press ? { scale: [1, 0.8, 1] } : undefined}
          transition={press ? { delay: press.at - 0.06, duration: 0.24 } : undefined}>
          <path d="M5 2.8v16.4l4.4-4.1 2.9 6.4 2.7-1.2-2.9-6.3h6.1z" />
        </motion.svg>
      </motion.span>
    </>
  );
}

// the frame eases in a touch toward the action, then back (a camera move)
function Zoom({ origin, at, children, className }: { origin: string; at: number; children: ReactNode; className: string }) {
  return (
    <motion.div className={className} style={{ transformOrigin: origin }} animate={{ scale: [1, 1.06, 1.06, 1] }}
      transition={{ delay: at, duration: 1.9, times: [0, 0.25, 0.72, 1], ease: 'easeInOut' }}>
      {children}
    </motion.div>
  );
}

/* ─── the six moments ─── */

// 01 the café's WhatsApp message is read (the quantity and the product light up) and filed as an order
function Received() {
  const mark = (delay: number) => ({ initial: { backgroundColor: 'rgba(31,169,82,0)' }, animate: { backgroundColor: 'rgba(31,169,82,0.2)' }, transition: { delay, duration: 0.3 } });
  return (
    <div className="sjb-sc sjb-recv">
      <motion.div className="sjb-wa" {...rise(0)}>
        <span className="sjb-wa-from">Hillfold</span>
        Kal <motion.mark {...mark(0.45)}>10kg</motion.mark> <motion.mark {...mark(0.62)}>Arabica AA</motion.mark> bhej dena
        <small>9:42 PM<span className="sjb-ticks" aria-label="read">{I.check}{I.check}</span></small>
      </motion.div>
      <motion.span className="sjb-to" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, duration: 0.4 }}>{I.arrow}</motion.span>
      <motion.div className="sjb-oc" initial={{ opacity: 0, y: -12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 1 }}>
        <span className="sjb-av">HK<i className="sjb-ping" /></span>
        <span className="sjb-oc-t">
          <small>New order</small>
          <b>Hillfold</b>
          <motion.em initial={{ backgroundColor: 'rgba(31,169,82,0.2)' }} animate={{ backgroundColor: 'rgba(31,169,82,0)' }} transition={{ delay: 1.5, duration: 0.9 }}>10 kg Arabica AA</motion.em>
        </span>
        <strong>₹8,200</strong>
      </motion.div>
    </div>
  );
}

// 02 the café's note arrives on the order; the supplier is typing, and the reply types itself out
function Connect() {
  return (
    <div className="sjb-sc sjb-chat">
      <motion.span className="sjb-day" {...rise(0)}>Today · on order #GRB-1048</motion.span>
      <motion.div className="sjb-msg" {...rise(0.05)}><i>PS</i><p>One-way valve bags, please.<time>9:44</time></p></motion.div>
      <motion.div className="sjb-typing" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ times: [0, 0.15, 0.85, 1], duration: 0.85, delay: 0.5 }}>
        <i /><i /><i />
      </motion.div>
      <motion.div className="sjb-msg is-me" {...rise(1.25)}><i>VS</i><p><Typed text="Done. Batch AA-409, roasted today." delay={1.45} /><time>9:45</time></p></motion.div>
      <motion.span className="sjb-seen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6, duration: 0.3 }}>Seen</motion.span>
    </div>
  );
}

// 03 the cursor comes in and presses Accept; the button fills, and 10 kg comes off the stock
function Accept() {
  return (
    <Zoom className="sjb-sc sjb-accept" origin="19% 50%" at={0.2}>
      <motion.div className="sjb-btn" animate={{ scale: [1, 0.94, 1] }} transition={{ delay: 0.72, duration: 0.3 }}>
        <motion.span className="sjb-btn-fill" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.78, duration: 0.42, ease: EASE }} />
        <motion.span className="sjb-btn-l" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 0.78, duration: 0.15 }}>Accept order</motion.span>
        <motion.span className="sjb-btn-l is-done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95, duration: 0.3 }}>{I.check}Accepted</motion.span>
      </motion.div>
      <motion.div className="sjb-stock" {...rise(0.15)}>
        <div className="sjb-stock-h"><span>{I.beans}Arabica AA</span><b>40 → 30 kg</b></div>
        <div className="sjb-bar"><motion.i initial={{ width: '0%' }} animate={{ width: '25%' }} transition={{ delay: 1.15, duration: 0.6, ease: EASE }} /></div>
        <small>10 kg reserved for #GRB-1048</small>
      </motion.div>
      <Cursor path={[['92%', '160%'], ['92%', '160%'], ['20%', '56%'], ['26%', '82%']]} times={[0, 0.12, 0.6, 1]} duration={1.25}
        press={{ at: 0.74, x: '19%', y: '50%' }} />
    </Zoom>
  );
}

// 04 weighed and checked; then the cursor prints the label, which lands on the parcel
function Pack() {
  return (
    <Zoom className="sjb-sc sjb-pack" origin="14% 50%" at={1.2}>
      <motion.div className="sjb-parcel" initial={{ opacity: 0, scale: 0.92, rotate: -3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/supplier/grabbit_sealed_parcel.jpg" alt="" draggable={false} />
        <motion.span className="sjb-label" initial={{ opacity: 0, scale: 1.5, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: -4 }}
          transition={{ delay: 1.85, type: 'spring', stiffness: 420, damping: 18 }}>{I.qr}<b>#GRB-1048</b></motion.span>
      </motion.div>
      <div className="sjb-pack-r">
        <motion.div className="sjb-weight" {...rise(0.1)}><Count to={10.45} decimals={2} duration={0.9} /><span className="sjb-unit">kg</span></motion.div>
        <ul className="sjb-checks">
          {[{ t: 'Weighed', i: I.scale }, { t: 'Sealed', i: I.seal }, { t: 'Labelled', i: I.qr }].map((c, k) => (
            <motion.li key={c.t} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k < 2 ? 0.5 + k * 0.38 : 1.95, duration: 0.35 }}>
              {c.i}{c.t}<span className="sjb-tick">{I.check}</span>
            </motion.li>
          ))}
        </ul>
      </div>
      <Cursor path={[['70%', '150%'], ['70%', '150%'], ['22%', '70%'], ['30%', '96%']]} times={[0, 0.3, 0.72, 1]} delay={0.6} duration={1.5}
        press={{ at: 1.72, x: '20%', y: '66%' }} />
    </Zoom>
  );
}

// the van follows the route (a cubic curve, sampled for its keyframes)
const ROUTE = 'M22 94 C 140 112, 200 14, 356 30';
const VAN = (() => {
  const p = [[22, 94], [140, 112], [200, 14], [356, 30]];
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12, u = 1 - t;
    xs.push(u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0]);
    ys.push(u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]);
  }
  return { xs, ys };
})();

// 05 the cursor presses Dispatch; the route draws itself as the van drives it, and the café sees the ETA
function Dispatch() {
  return (
    <div className="sjb-sc sjb-route">
      <svg viewBox="0 0 380 124" aria-hidden="true">
        {/* a faint street plan under the route (Apple Maps, light): blocks, a park, a canal, the streets */}
        <defs><clipPath id="sjb-map-clip"><rect width="380" height="124" rx="14" /></clipPath></defs>
        <g clipPath="url(#sjb-map-clip)" className="sjb-map">
          <rect width="380" height="124" className="ground" />
          <path d="M-10 18C80 6 150 24 230 8S350 -4 390 6" className="water" />
          <rect x="182" y="52" width="64" height="30" rx="6" className="park" />
          <path d="M0 62H380M0 104H380M58 0V124M128 0V124M268 0V124M330 0V124M150 124L240 0" className="street" />
          <path d="M0 62H380M58 0V124M268 0V124" className="avenue" />
        </g>
        <path d={ROUTE} className="sjb-road" />
        <motion.path d={ROUTE} className="sjb-done" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.75, duration: 2.5, ease: 'easeInOut' }} />
        <circle cx="22" cy="94" r="6" className="sjb-depot" />
        <g transform="translate(356 30)" className="sjb-pin"><circle r="9" /><circle r="3.2" className="in" /></g>
        <motion.g initial={{ x: VAN.xs[0], y: VAN.ys[0], opacity: 0 }} animate={{ x: VAN.xs, y: VAN.ys, opacity: 1 }}
          transition={{ delay: 0.75, duration: 2.5, ease: 'easeInOut', opacity: { delay: 0.6, duration: 0.2 } }}>
          <circle r="15" className="sjb-van-halo" />
          <rect x="-11" y="-8" width="22" height="16" rx="5" className="sjb-van" />
          <path d="M-6 -2h6v5h-6zM0 0h3l2.5 2.5V3H0z" className="sjb-van-ico" />
        </motion.g>
      </svg>
      <motion.span className="sjb-go" {...rise(0)}>
        <motion.span className="sjb-go-fill" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 0.3, ease: EASE }} />
        <motion.span className="sjb-go-l" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 0.5, duration: 0.12 }}>Dispatch</motion.span>
        <motion.span className="sjb-go-l is-done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.62, duration: 0.2 }}>{I.check}Sent</motion.span>
      </motion.span>
      <motion.span className="sjb-chip is-eta" {...rise(1)}><i />ETA 12:02</motion.span>
      <motion.span className="sjb-chip is-km" {...rise(1.3)}>2.4 km</motion.span>
      <Cursor path={[['34%', '150%'], ['9%', '104%'], ['16%', '128%']]} times={[0, 0.55, 1]} duration={0.85}
        press={{ at: 0.46, x: '8%', y: '100%' }} />
    </div>
  );
}

// 06 paid: the amount counts up, escrow hands it to the bank, and the bank's notification drops in
function Paid() {
  return (
    <div className="sjb-sc sjb-paid">
      <motion.div className="sjb-toast" initial={{ opacity: 0, y: -12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 24 }}>
        <span className="sjb-toast-i">{I.bank}</span>
        <span className="sjb-toast-t"><b>₹8,200 credited</b><small>HDFC Bank · from Gradient escrow</small></span>
        <em>now</em>
      </motion.div>
      <div className="sjb-paid-row">
        <motion.span className="sjb-shield" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
          {I.shield}<i className="sjb-burst" />
        </motion.span>
        <div className="sjb-paid-r">
          <motion.div className="sjb-amt" {...rise(0.1)}>₹<Count to={8200} delay={0.3} /></motion.div>
          <motion.div className="sjb-flow" {...rise(0.4)}>
            <span>Escrow</span>
            <i className="sjb-flow-line"><motion.b initial={{ left: '0%' }} animate={{ left: '100%' }} transition={{ delay: 0.75, duration: 0.9, ease: EASE }} /></i>
            <span>Your bank</span>
            <em>T+1</em>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const SCENES: Record<BoardStage, ComponentType> = { 1: Received, 2: Connect, 3: Accept, 4: Pack, 5: Dispatch, 6: Paid };

export function HeroOrderBoard({ stage, playing, durations, onStage, onTogglePlay }: {
  stage: BoardStage; playing: boolean; durations: Record<BoardStage, number>;
  onStage: (s: BoardStage) => void; onTogglePlay: () => void;
}) {
  const step = STEPS[stage - 1];
  const Scene = SCENES[stage];
  const payout = stage === 6 ? 1 : stage >= 3 ? 0.22 : 0;
  const log = LOG.filter((e) => e.s <= stage).reverse();
  return (
    <MotionConfig reducedMotion="user">
      <div className={`sjb${playing ? '' : ' is-paused'}`} role="group" aria-label="An order moving through the Supplier Portal">
        <div className="sjb-in">
          {/* the window's title bar (macOS): the three lights, the title in the middle, live + play/pause at the right */}
          <div className="sjb-top">
            <span className="sjb-lights" aria-hidden="true"><i /><i /><i /></span>
            <span className="sjb-title"><span className="sjb-logo">G</span><b>Hillfold Roastery</b><span className="sjb-title-sub">Orders</span></span>
            <span className="sjb-live"><i />Live</span>
            <button type="button" className="sjb-play" onClick={onTogglePlay} aria-label={playing ? 'Pause the walkthrough' : 'Play the walkthrough'}>
              {playing ? I.pause : I.play}
            </button>
          </div>

          <div className="sjb-body">
            {/* the sidebar (wide windows): a source list, Orders selected */}
            <nav className="sjb-side" aria-hidden="true">
              <span className="sjb-side-h">Portal</span>
              {[{ i: I.home, l: 'Overview' }, { i: I.orders, l: 'Orders', n: '12', on: true }, { i: I.pack, l: 'Catalogue' }, { i: I.dispatch, l: 'Dispatch' }, { i: I.paid, l: 'Payouts' }].map((x) => (
                <span key={x.l} className={`sjb-side-i${x.on ? ' is-on' : ''}`}>{x.i}<span>{x.l}</span>{x.n && <em>{x.n}</em>}</span>
              ))}
              <span className="sjb-side-me"><i>VS</i><span><b>Vikram S.</b><small>Head of ops</small></span></span>
            </nav>

            <div className="sjb-main">
              {/* the six steps */}
              <ol className="sjb-track" style={{ ['--p' as string]: (stage - 1) / 5 }}>
                <span className="sjb-track-line" aria-hidden="true"><i /></span>
                {STEPS.map((s) => (
                  <li key={s.id} className={s.id < stage ? 'is-done' : s.id === stage ? 'is-on' : undefined}>
                    <button type="button" onClick={() => onStage(s.id)} aria-current={s.id === stage ? 'step' : undefined} aria-label={`${s.id}. ${s.label}`}>
                      <span className="sjb-node">
                        {s.id < stage ? I.check : s.icon}
                        {s.id === stage && (
                          <svg key={`ring-${stage}`} className="sjb-ring" viewBox="0 0 40 40" aria-hidden="true" style={{ ['--dur' as string]: `${durations[stage]}ms` }}>
                            <circle cx="20" cy="20" r="18.5" pathLength={100} />
                          </svg>
                        )}
                      </span>
                      <span className="sjb-node-l">{s.label}</span>
                    </button>
                  </li>
                ))}
              </ol>

              {/* the step's moment, and a few words under it */}
              <div className="sjb-show">
                <div className="sjb-stage">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={stage} className="sjb-scene" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.3, ease: EASE }}>
                      <Scene />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="sjb-cap" aria-live="polite">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={stage} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: EASE }}>
                      <b>{step.title}</b>
                      <span>{step.sub}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* the order (wide screens): who, what, status, what's happened, and the payout */}
            <aside className="sjb-sum" aria-hidden="true">
              <div className="sjb-sum-h"><span>Order</span><b>#GRB-1048</b></div>
              <div className="sjb-cafe"><i>HK</i><span><b>Hillfold</b><small>Koramangala · Outlet 04</small></span></div>
              <div className="sjb-item"><span className="sjb-bean">{I.beans}</span><span><b>Arabica AA</b><small>10 kg · lot AA-409</small></span></div>
              <div className="sjb-total">
                <span>Total</span><b>₹8,200</b>
              </div>
              <motion.span key={STATUS[stage]} className={`sjb-status s${stage}`} initial={{ scale: 0.92, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}><i />{STATUS[stage]}</motion.span>
              <div className="sjb-log">
                <span className="sjb-log-h">Activity</span>
                <ul>
                  <AnimatePresence initial={false}>
                    {log.map((e) => (
                      <motion.li key={e.s} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }} className={e.s === stage ? 'is-new' : undefined}>
                        <i /><span>{e.l}</span><time>{e.t}</time>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
              <div className="sjb-payout">
                <div className="sjb-payout-h"><span>Payout</span><small>{stage === 6 ? 'Released · T+1' : stage >= 3 ? 'Held in escrow' : 'On acceptance'}</small></div>
                <div className="sjb-payout-bar"><i style={{ width: `${payout * 100}%` }} /></div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
