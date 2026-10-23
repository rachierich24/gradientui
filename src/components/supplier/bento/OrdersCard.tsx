'use client';
// Order management: a looping product film. A café order arrives as a notification, lands in the queue, is
// accepted with a click, then walks Accepted → Packed → Dispatched. A macOS-style dock at the foot of the window
// mirrors the pipeline: each stage is an icon with a live count, the order's icon hops as it arrives and a dot
// glides along the dock with it. The dock magnifies under the pointer (the film's own cursor shows it off).
import { Fragment, useEffect, useRef, useState, type MutableRefObject, type Ref } from 'react';
import {
  AnimatePresence, animate, motion, useAnimationControls, useMotionValue, useSpring, useTransform, type MotionValue,
} from 'framer-motion';
import { Check, EASE, Glyph, Notif, Pointer, Window, clock, initials, inr, monotone, useCountUp, useScript } from './shared';

type Line = { name: string; qty: string; amt: number };
type Q = { cafe: string; area: string; lines: Line[] };
const QUEUE: Q[] = [
  { cafe: 'Raydee Café', area: 'Indiranagar', lines: [{ name: 'Barista Oat Milk · 1 L', qty: '× 20', amt: 4200 }, { name: 'Arabica AA · 1 kg', qty: '× 5', amt: 4100 }] },
  { cafe: 'Araku Café', area: 'Indiranagar', lines: [{ name: 'Fresh cream · 1 L', qty: '× 20', amt: 4300 }, { name: 'Callebaut 811 · 2.5 kg', qty: '× 1', amt: 3450 }] },
  { cafe: 'Blue Tokai', area: 'Koramangala', lines: [{ name: 'Arabica AA · 1 kg', qty: '× 12', amt: 9840 }, { name: 'Barista Oat Milk · 1 L', qty: '× 12', amt: 2520 }] },
  { cafe: 'Third Wave Coffee', area: 'Indiranagar', lines: [{ name: 'Barista Oat Milk · 1 L', qty: '× 24', amt: 5040 }, { name: 'Vanilla syrup · 750 ml', qty: '× 6', amt: 3480 }] },
  { cafe: 'Subko', area: 'Bandra West', lines: [{ name: 'Callebaut 811 · 2.5 kg', qty: '× 2', amt: 6900 }, { name: 'Ceremonial matcha · 100 g', qty: '× 4', amt: 7560 }] },
];
const qTotal = (q: Q) => q.lines.reduce((a, l) => a + l.amt, 0);
type Stage = 0 | 1 | 2 | 3;
type Item = { id: number; q: Q; stage: Stage; open: boolean; t: number };
const SEED: Item[] = [
  { id: 4817, q: { cafe: 'Dope Coffee', area: 'HSR Layout', lines: [{ name: 'Vanilla syrup · 750 ml', qty: '× 6', amt: 3480 }, { name: 'Fresh cream · 1 L', qty: '× 10', amt: 2150 }] }, stage: 3, open: true, t: 36 },
  { id: 4816, q: QUEUE[4], stage: 3, open: false, t: 29 },
  { id: 4815, q: QUEUE[3], stage: 3, open: false, t: 22 },
  { id: 4814, q: QUEUE[2], stage: 3, open: false, t: 15 },
];
const ORDER_SCRIPT = [
  ['hold', 1300], ['settle', 900], ['notify', 1700], ['land', 1050], ['aim', 950], ['press', 320],
  ['accepted', 1050], ['packed', 1050], ['dispatched', 1200], ['dock', 1700],
] as const;
const STEPS = ['Accepted', 'Packed', 'Dispatched'] as const;

/* ---------- the dock ---------- */
type DockKey = 'new' | 'accepted' | 'packing' | 'dispatch' | 'invoices' | 'chats';
const DOCK: { key: DockKey; label: string; d: string }[] = [
  { key: 'new', label: 'New orders', d: 'M3 13l2.6-8h12.8L21 13v6H3zM3 13h5l1.6 2.6h4.8L16 13h5' },
  { key: 'accepted', label: 'Accepted', d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.2 12.4l2.6 2.6 5-5.4' },
  { key: 'packing', label: 'Packing', d: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9' },
  { key: 'dispatch', label: 'Out for delivery', d: 'M2.5 6.5h11v9.5h-11zM13.5 10h4l3 3.2v2.8h-7zM6.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
  { key: 'invoices', label: 'Invoices', d: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3' },
  { key: 'chats', label: 'Café chats', d: 'M4 5h16v11H9.5L4 20z' },
];
type Counts = Partial<Record<DockKey, number>>;

function DockIcon({ item, mouseX, base, mag, count, bump, tip, here, iconRef }: {
  item: (typeof DOCK)[number]; mouseX: MotionValue<number>; base: number; mag: number;
  count?: number; bump: number; tip: boolean; here: boolean; iconRef: (n: HTMLSpanElement | null) => void;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  // distance from the pointer to this icon's centre sets its size, smoothed by a spring (Magic UI's dock)
  const dist = useTransform(mouseX, (v: number) => {
    const b = ref.current?.getBoundingClientRect();
    return b && Number.isFinite(v) ? v - (b.left + b.width / 2) : 1e4;
  });
  const target = useTransform(dist, [-140, 0, 140], [base, mag, base]);
  const size = useSpring(target, { mass: 0.1, stiffness: 160, damping: 13 });
  const hop = useAnimationControls();
  useEffect(() => {
    if (bump) hop.start({ y: [0, -15, 0, -6, 0], transition: { duration: 0.8, times: [0, 0.3, 0.58, 0.78, 1], ease: 'easeOut' } });
  }, [bump, hop]);
  return (
    <motion.span
      ref={(n: HTMLSpanElement | null) => { ref.current = n; iconRef(n); }}
      role="listitem"
      aria-label={count !== undefined ? `${item.label}: ${count}` : item.label}
      className={`sbx-dk-ic${tip ? ' is-tip' : ''}`}
      style={{ width: size, height: size }}
    >
      <motion.span className="sbx-dk-face" animate={hop}>
        <Glyph d={item.d} />
        {count !== undefined && (
          <motion.b key={count} className="sbx-dk-badge" initial={{ scale: 0.55 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 520, damping: 17 }}>{count}</motion.b>
        )}
      </motion.span>
      <span className="sbx-dk-tip">{item.label}{count !== undefined ? ` · ${count}` : ''}</span>
      {here && <motion.i layoutId="sbx-dk-here" className="sbx-dk-dot" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />}
    </motion.span>
  );
}

function Dock({ mouseX, counts, bumps, at, tip, base, mag, dockRef, iconRefs }: {
  mouseX: MotionValue<number>; counts: Counts; bumps: Record<DockKey, number>; at: DockKey; tip: DockKey | null;
  base: number; mag: number; dockRef: Ref<HTMLDivElement>; iconRefs: MutableRefObject<Partial<Record<DockKey, HTMLSpanElement | null>>>;
}) {
  return (
    <div
      ref={dockRef}
      className="sbx-dock"
      role="list"
      aria-label="Order pipeline"
      onPointerMove={(e) => mouseX.set(e.clientX)}
      onPointerLeave={() => mouseX.set(Infinity)}
    >
      {DOCK.map((it) => (
        <Fragment key={it.key}>
          {it.key === 'invoices' && <span className="sbx-dk-sep" aria-hidden="true" />}
          <DockIcon
            item={it} mouseX={mouseX} base={base} mag={mag} count={counts[it.key]} bump={bumps[it.key]}
            tip={tip === it.key} here={at === it.key} iconRef={(n) => { iconRefs.current[it.key] = n; }}
          />
        </Fragment>
      ))}
    </div>
  );
}

/* ---------- queue pieces ---------- */
function Spark({ data }: { data: number[] }) {
  const W = 96, H = 30, lo = Math.min(...data), hi = Math.max(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, H - 4 - ((v - lo) / (hi - lo || 1)) * (H - 8)] as [number, number]);
  const { d } = monotone(pts), [lx, ly] = pts[pts.length - 1];
  return (
    <svg className="sbx-spark" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <path d={`${d} L${W} ${H} L0 ${H} Z`} className="sbx-spark-fill" />
      <path d={d} className="sbx-spark-line" />
      <circle cx={lx} cy={ly} r="2.6" className="sbx-spark-dot" />
    </svg>
  );
}

function Steps({ stage, t }: { stage: Stage; t: number }) {
  return (
    <div className="sbx-steps">
      <span className="sbx-track"><motion.i initial={false} animate={{ scaleX: Math.max(0, (stage - 1) / 2) }} transition={{ duration: 0.7, ease: EASE }} /></span>
      {STEPS.map((s, i) => {
        const done = stage >= i + 1;
        return (
          <div key={s} className={`sbx-step${done ? ' is-done' : ''}${stage === i + 1 ? ' is-now' : ''}`}>
            <i>{done && <Check />}</i>
            <b>{s}</b>
            <small>{done ? clock(t + i * 2 + 1) : 'Pending'}</small>
          </div>
        );
      })}
    </div>
  );
}

function OrderRow({ it, acceptRef, pressed }: { it: Item; acceptRef: Ref<HTMLButtonElement>; pressed: boolean }) {
  return (
    <motion.li
      className={`sbx-ord${it.open ? ' is-open' : ''}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ height: { duration: 0.55, ease: EASE }, opacity: { duration: 0.4 } }}
    >
      <div className="sbx-ord-card">
        <div className="sbx-ord-row">
          <span className="sbx-av">{initials(it.q.cafe)}</span>
          <span className="sbx-ord-who"><b>{it.q.cafe}</b><small>{it.q.area} · #{it.id}</small></span>
          <span className="sbx-ord-amt">{inr(qTotal(it.q))}</span>
          <AnimatePresence initial={false}>
            {!it.open && (
              <motion.span className={`sbx-ord-st${it.stage === 3 ? ' is-done' : ''}`} initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                {it.stage === 3 ? <><Check />Dispatched</> : it.stage === 0 ? 'New' : STEPS[it.stage - 1]}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence initial={false}>
          {it.open && (
            <motion.div className="sbx-ord-more" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.5, ease: EASE }}>
              <ul className="sbx-lines">
                {it.q.lines.map((l) => (
                  <li key={l.name}><span>{l.name}</span><span>{l.qty}</span><span>{inr(l.amt)}</span></li>
                ))}
              </ul>
              <div className="sbx-act">
                <AnimatePresence mode="wait" initial={false}>
                  {it.stage === 0 ? (
                    <motion.button key="accept" ref={acceptRef} type="button" className={`sbx-accept${pressed ? ' is-down' : ''}`} exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }} tabIndex={-1}>
                      Accept order
                    </motion.button>
                  ) : (
                    <motion.div key="steps" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                      <Steps stage={it.stage} t={it.t} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence initial={false}>
                {it.stage === 3 && (
                  <motion.div className="sbx-eta" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.45, ease: EASE }}>
                    <span><i />Out for delivery · Rider Ramesh K.</span><b>ETA {clock(it.t + 46)}</b>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}

type Cur = {
  x: number; y: number; mode: 'park' | 'aim' | 'leave' | 'dock'; down: boolean; press: number;
  px: number; py: number; fx: number; fy: number; vx: number; vy: number;
};

export function OrdersCard({ run }: { run: boolean }) {
  const { phase } = useScript(ORDER_SCRIPT, run);
  const [items, setItems] = useState<Item[]>(SEED);
  const [toast, setToast] = useState<Q | null>(null);
  const [stats, setStats] = useState({ n: 56, v: 291533, spark: [12, 14, 13, 17, 16, 19, 18, 22, 21, 24, 23, 26] });
  const [cur, setCur] = useState<Cur>({ x: 0, y: 0, mode: 'park', down: false, press: 0, px: 0, py: 0, fx: 0, fy: 0, vx: 0, vy: 0 });
  const [counts, setCounts] = useState<Counts>({ new: 2, accepted: 8, packing: 5, dispatch: 12, chats: 3 });
  const [bumps, setBumps] = useState<Record<DockKey, number>>({ new: 0, accepted: 0, packing: 0, dispatch: 0, invoices: 0, chats: 0 });
  const [at, setAt] = useState<DockKey>('dispatch');
  const [tip, setTip] = useState<DockKey | null>(null);
  const [compact, setCompact] = useState(false);
  const mouseX = useMotionValue(Infinity);
  const next = useRef(0);
  const delivered = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const camRef = useRef<HTMLDivElement>(null);
  const acceptRef = useRef<HTMLButtonElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<Partial<Record<DockKey, HTMLSpanElement | null>>>({});
  const value = useCountUp(stats.v, run);

  useEffect(() => {
    const mq = matchMedia('(max-width: 720px)');
    const f = () => setCompact(mq.matches);
    f();
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    const top = (fn: (it: Item) => Item) => setItems((l) => l.map((it, i) => (i === 0 ? fn(it) : it)));
    const advance = (from: DockKey | null, to: DockKey) => {
      setCounts((c) => ({ ...c, ...(from ? { [from]: Math.max(0, (c[from] ?? 1) - 1) } : {}), [to]: (c[to] ?? 0) + 1 }));
      setBumps((b) => ({ ...b, [to]: b[to] + 1 }));
      setAt(to);
    };
    const cam = camRef.current;
    const rel = (el: Element) => {
      const c = cam!.getBoundingClientRect(), b = el.getBoundingClientRect(), k = c.width / cam!.offsetWidth || 1;
      return { x: (b.left - c.left) / k, y: (b.top - c.top) / k, w: b.width / k, h: b.height / k, b };
    };
    timers.current.forEach(clearTimeout);
    timers.current = [];
    switch (phase) {
      case 'settle':
        top((it) => ({ ...it, open: false }));
        setTip(null);
        mouseX.set(Infinity);
        if (delivered.current) setCounts((c) => ({ ...c, dispatch: Math.max(0, (c.dispatch ?? 1) - 1) })); // a delivery completes
        if (cam) setCur((c) => ({ ...c, mode: 'park', down: false, x: cam.offsetWidth - 40, y: cam.offsetHeight + 24 }));
        break;
      case 'notify':
        setToast(QUEUE[next.current % QUEUE.length]);
        break;
      case 'land': {
        const q = QUEUE[next.current % QUEUE.length], id = 4818 + next.current;
        next.current += 1;
        setToast(null);
        setItems((l) => [{ id, q, stage: 0 as Stage, open: true, t: l[0].t + 7 }, ...l].slice(0, 4));
        setStats((s) => ({ n: s.n + 1, v: s.v + qTotal(q), spark: [...s.spark.slice(1), s.spark[s.spark.length - 1] + 2 + (id % 3)] }));
        advance(null, 'new');
        break;
      }
      case 'aim': {
        const btn = acceptRef.current;
        if (cam && btn) {
          const r = rel(btn);
          setCur((p) => ({ ...p, mode: 'aim', x: r.x + r.w * 0.64, y: r.y + r.h * 0.58 }));
        }
        break;
      }
      case 'press':
        setCur((c) => ({ ...c, down: true, press: c.press + 1, px: c.x, py: c.y })); // the ripple stays where the click landed
        break;
      case 'accepted':
        top((it) => ({ ...it, stage: 1 }));
        advance('new', 'accepted');
        setCur((c) => ({ ...c, down: false, mode: 'leave', x: c.x + 64, y: c.y + 84 }));
        break;
      case 'packed':
        top((it) => ({ ...it, stage: 2 }));
        advance('accepted', 'packing');
        break;
      case 'dispatched':
        top((it) => ({ ...it, stage: 3 }));
        advance('packing', 'dispatch');
        delivered.current = true;
        break;
      case 'dock': {
        // the cursor drops to the dock, then glides along it to "Out for delivery"; the icons magnify as it passes
        const ic = iconRefs.current.dispatch, dk = dockRef.current;
        if (cam && ic && dk) {
          const d = rel(dk), r = rel(ic);
          const entryX = d.x + 14, y = r.y + r.h * 0.58, endX = r.x + r.w * 0.56;
          setCur((p) => ({ ...p, mode: 'dock', fx: p.x, fy: p.y, vx: entryX, vy: y, x: endX, y }));
          timers.current.push(setTimeout(() => {
            mouseX.set(d.b.left + 14);
            animate(mouseX, r.b.left + r.b.width / 2, { duration: 0.62, ease: [0.45, 0, 0.15, 1] });
          }, 470));
          timers.current.push(setTimeout(() => setTip('dispatch'), 1050));
        }
        break;
      }
    }
  }, [phase, mouseX]);

  const zoom = phase === 'aim' || phase === 'press' || phase === 'accepted' || phase === 'packed';
  const shown = cur.mode === 'aim' || cur.mode === 'dock';
  const glide = cur.mode === 'park' ? { duration: 0 } : { duration: cur.mode === 'aim' ? 0.85 : 0.55, ease: [0.45, 0, 0.15, 1] };
  const path = cur.mode === 'dock'
    ? { x: [cur.fx, cur.vx, cur.x], y: [cur.fy, cur.vy, cur.y] }
    : { x: cur.x, y: cur.y };
  const pathT = cur.mode === 'dock' ? { duration: 1.1, times: [0, 0.42, 1], ease: [0.45, 0, 0.15, 1] } : glide;

  return (
    <Window title="Gradient · Orders">
      <div className="sbx-body">
        <motion.div ref={camRef} className="sbx-cam" animate={{ scale: zoom ? 1.035 : 1 }} transition={{ duration: 0.9, ease: EASE }}>
          <div className="sbx-stats">
            <div>
              <small>Today</small>
              <strong>{stats.n} orders</strong>
              <span>{inr(value)} received</span>
            </div>
            <Spark data={stats.spark} />
          </div>
          <ul className="sbx-ords">
            <AnimatePresence initial={false}>
              {items.map((it, i) => (
                <OrderRow key={it.id} it={it} acceptRef={i === 0 ? acceptRef : null} pressed={i === 0 && cur.down} />
              ))}
            </AnimatePresence>
          </ul>
          <Dock
            mouseX={mouseX} counts={counts} bumps={bumps} at={at} tip={tip}
            base={compact ? 32 : 40} mag={compact ? 44 : 58} dockRef={dockRef} iconRefs={iconRefs}
          />
          {cur.press > 0 && (
            <motion.span key={cur.press} className="sbx-ripple" style={{ left: cur.px, top: cur.py }} initial={{ scale: 0.3, opacity: 0.45 }} animate={{ scale: 1.7, opacity: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} />
          )}
          <motion.span
            className="sbx-pointer"
            initial={false}
            animate={{ ...path, opacity: shown ? 1 : 0, scale: cur.down ? 0.84 : 1 }}
            transition={{ x: pathT, y: pathT, opacity: cur.mode === 'park' ? { duration: 0 } : { duration: 0.35 }, scale: { duration: 0.12 } }}
            aria-hidden="true"
          >
            <Pointer />
          </motion.span>
        </motion.div>
        <AnimatePresence>
          {toast && <Notif key={toast.cafe} title={`New order from ${toast.cafe}`} sub={`${toast.lines.length} items · ${inr(qTotal(toast))} · ${toast.area}`} />}
        </AnimatePresence>
      </div>
    </Window>
  );
}
