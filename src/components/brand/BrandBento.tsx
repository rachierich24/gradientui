'use client';
// The whole system, the section after Built for brands: everything Gradient does for a brand on one bento board
// that comes together as you scroll. The stage pins; the eight tiles fly in from around the screen, tilted, and
// lock into the grid. Once a tile has landed it's live, and a soft light follows the pointer across the board:
//   brand       the mark, and a button that opens the trial form
//   reach       ads keep landing on a café owner's phone; "Send" drops the next one
//   feed        the trial as it happens, a new event every couple of seconds (hover holds it)
//   numbers     cafés, weekly orders, litres: tabs that count up (they rotate until you pick one)
//   rating      what baristas said, one quote at a time (the arrow skips ahead)
//   kit         the carton turns towards the pointer; its steps tick on (tap one to jump there)
//   reorders    twelve weeks of reorders; point along the chart to read any week
//   waste       drag what you'd usually make and see what the forecast saves
// On a phone nothing pins: two columns, each tile flies in as it scrolls up. With reduced motion everything is
// simply there and nothing rotates by itself. Names and figures are samples. Styles: app/brand/brand-bento.css
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { fmt, reduced, useTween } from './shared';
import { ATTRS, EVENTS, ICONS, VERDICT } from './trial-data';
import { openContactSalesModal } from '@/components/ContactSalesModal';

type Vars = CSSProperties & Record<`--${string}`, string | number>;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const out3 = (k: number) => 1 - (1 - k) ** 3;

// each tile: where it flies in from (vw, vh), how far it's turned, and when it sets off (share of the build)
const TILES = [
  { id: 'brand', from: [-40, -30], r: -14, at: 0 },
  { id: 'feed', from: [40, -26], r: 10, at: 0.04 },
  { id: 'reach', from: [4, -50], r: 8, at: 0.09 },
  { id: 'kit', from: [6, 56], r: -9, at: 0.13 },
  { id: 'num', from: [-48, 10], r: -11, at: 0.17 },
  { id: 'waste', from: [46, 36], r: -12, at: 0.21 },
  { id: 'rate', from: [-14, 54], r: 12, at: 0.25 },
  { id: 'chart', from: [-36, 48], r: 6, at: 0.29 },
] as const;
type TileId = (typeof TILES)[number]['id'];
const BUILD = [0.04, 0.62]; // the part of the section's scroll the build takes
const FLIGHT = 0.42;

/** Runs `fn` every `ms` while `on`, unless reduced motion is set. */
function useEvery(on: boolean, ms: number, fn: () => void) {
  const f = useRef(fn);
  f.current = fn;
  useEffect(() => {
    if (!on || reduced()) return;
    const id = window.setInterval(() => f.current(), ms);
    return () => window.clearInterval(id);
  }, [on, ms]);
}

export function BrandBento() {
  const sec = useRef<HTMLElement>(null);
  const tiles = useRef<(HTMLDivElement | null)[]>([]);
  const [landed, setLanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const el = sec.current;
    if (!el) return;
    let raf = 0, seen = '';
    const frame = () => {
      raf = 0;
      const V = window.innerHeight, wide = window.innerWidth > 980, still = reduced();
      const r = el.getBoundingClientRect();
      const b = clamp((clamp(-r.top / Math.max(1, r.height - V)) - BUILD[0]) / (BUILD[1] - BUILD[0]));
      const now: string[] = [];
      TILES.forEach((t, i) => {
        const tile = tiles.current[i];
        if (!tile) return;
        let k: number;
        if (still) k = 1;
        else if (wide) k = clamp((b - t.at) / FLIGHT);
        else { const tr = tile.parentElement!.getBoundingClientRect(); k = clamp((0.98 * V - tr.top) / (0.42 * V)); }
        const e = out3(k);
        tile.style.setProperty('--e', e.toFixed(4));
        if (e > 0.985) now.push(t.id);
      });
      const key = now.join();
      if (key !== seen) { seen = key; setLanded(Object.fromEntries(now.map((id) => [id, true]))); }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    kick();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', kick); window.removeEventListener('resize', kick); };
  }, []);

  // the light that follows the pointer, on whichever tile it's over
  const glow = (e: PointerEvent<HTMLDivElement>) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('.bbo-t');
    if (!t) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', `${e.clientX - r.left}px`);
    t.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const tile = (id: TileId, tone: string, label: string, body: (on: boolean) => ReactNode) => {
    const i = TILES.findIndex((t) => t.id === id), t = TILES[i], on = !!landed[id];
    return (
      <div className={`bbo-slot bbo-a-${id}`}>
        <div
          ref={(n) => { tiles.current[i] = n; }}
          className={`bbo-t ${tone}${on ? ' is-in' : ''}`}
          style={{ '--fx': t.from[0], '--fy': t.from[1], '--fr': t.r } as Vars}
          role="group"
          aria-label={label}
        >
          {body(on)}
        </div>
      </div>
    );
  };

  return (
    <section ref={sec} className="bbo" id="system" aria-labelledby="bbo-title">
      <div className="bbo-stage">
        <header className="bbo-head">
          <div>
            <span className="bbo-eye">The whole system</span>
            <h2 id="bbo-title">Every café you sell to,<br /> on one board.</h2>
          </div>
          <span className="bbo-hint"><i />Every tile is live. Try one.</span>
        </header>

        <div className="bbo-grid" onPointerMove={glow}>
          {tile('brand', 't-pur', 'Gradient for brands', () => (
            <div className="bbo-brand">
              <b>gradient<i /></b>
              <span>for brands</span>
              <button type="button" onClick={openContactSalesModal}>Launch a trial <em aria-hidden="true">→</em></button>
            </div>
          ))}
          {tile('reach', 't-lav', 'Ads that land in café owners’ apps', (on) => <Reach on={on} />)}
          {tile('feed', 't-dark', 'Your trial, live', (on) => <Feed on={on} />)}
          {tile('num', 't-lav', 'Trial numbers', (on) => <Numbers on={on} />)}
          {tile('rate', 't-lav', 'What baristas said', (on) => <Rating on={on} />)}
          {tile('kit', 't-lav', 'Trial kits, tracked to the cup', (on) => <Kit on={on} />)}
          {tile('chart', 't-pur', 'Weekly reorders', (on) => <Reorders on={on} />)}
          {tile('waste', 't-pur', 'Waste the forecast saves', (on) => <Waste on={on} />)}
        </div>

        <p className="bbo-foot">Sample figures · names are illustrative</p>
      </div>
    </section>
  );
}

/* ───────────────────────────── the tiles ───────────────────────────── */

const ADS = [
  ['New from Oat Barista', 'Claim a free trial kit for your café'],
  ['Kit on its way', 'Riding with Sharma Dairy · arrives tomorrow'],
  ['How did it pour?', 'Rate Barista Oat Milk in 10 seconds'],
  ['Reorder in one tap', '24 L of oat milk, same as last week'],
];
function Reach({ on }: { on: boolean }) {
  const [n, setN] = useState(1);
  const [held, setHeld] = useState(false);
  useEvery(on && !held, 3600, () => setN((x) => x + 1));
  const list = Array.from({ length: Math.min(n, 3) }, (_, k) => n - 1 - k);
  return (
    <div className="bbo-reach" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
      <div className="bbo-reach-l">
        <small>Direct reach</small>
        <h3>Your ad, in every café owner’s app.</h3>
        <div className="bbo-reach-act">
          <span className="bbo-chip">0 cold calls</span>
          <button type="button" className="bbo-send" onClick={() => setN((x) => x + 1)}>Send <em aria-hidden="true">↗</em></button>
        </div>
      </div>
      <div className="bbo-phone" aria-hidden="true">
        <div className="bbo-phone-scr">
          <span className="bbo-phone-time">10:42</span>
          {list.map((k) => (
            <div key={k} className="bbo-notif"><i>G</i><div><b>{ADS[k % ADS.length][0]}</b><span>{ADS[k % ADS.length][1]}</span></div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Feed({ on }: { on: boolean }) {
  const [n, setN] = useState(4);
  const [held, setHeld] = useState(false);
  useEvery(on && !held, 2300, () => setN((x) => x + 1));
  const rows = Array.from({ length: 5 }, (_, k) => n - k).filter((k) => k >= 0);
  return (
    <div className="bbo-feed" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
      <div className="bbo-feed-head">
        <small><i className={held ? 'is-held' : ''} />{held ? 'Paused' : 'Live'} · Delhi NCR trial</small>
        <span>Barista Oat Milk</span>
      </div>
      <ol aria-live="off">
        {rows.map((k) => {
          const ev = EVENTS[k % EVENTS.length];
          return (
            <li key={k}>
              <i><svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONS[ev.icon]} /></svg></i>
              <div><b>{ev.title}</b><span>{ev.meta}</span></div>
              <em>Day {Math.max(1, Math.round(ev.day))}</em>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const NUMS = [
  { label: 'Cafés in trial', tab: 'Cafés', v: 120, unit: '', note: 'across 9 neighbourhoods' },
  { label: 'Order weekly', tab: 'Orders', v: 31, unit: '', note: 'by day 21, up from 0' },
  { label: 'Litres a week', tab: 'Litres', v: 420, unit: ' L', note: 'in standing reorders' },
];
function Numbers({ on }: { on: boolean }) {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  useEvery(on && !held, 3200, () => setI((x) => (x + 1) % NUMS.length));
  const n = NUMS[i], v = useTween(on ? n.v : 0, 900);
  return (
    <div className="bbo-num">
      <div className="bbo-tabs" role="tablist" aria-label="Trial numbers">
        {NUMS.map((q, k) => (
          <button key={q.tab} type="button" role="tab" aria-selected={k === i} className={k === i ? 'is-on' : ''} onClick={() => { setHeld(true); setI(k); }}>{q.tab}</button>
        ))}
      </div>
      <b>{Math.round(v)}<small>{n.unit}</small></b>
      <span>{n.label} · {n.note}</span>
    </div>
  );
}

const QUOTES = [...ATTRS.map((a) => ({ score: a.score, label: a.label, q: a.quote })), { score: 4.9, label: 'Would order again', q: VERDICT }];
function Rating({ on }: { on: boolean }) {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  useEvery(on && !held, 4600, () => setI((x) => (x + 1) % QUOTES.length));
  const q = QUOTES[i], v = useTween(on ? q.score : 0, 700);
  return (
    <div className="bbo-rate" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
      <div className="bbo-rate-top">
        <b>{v.toFixed(1)}</b>
        <span>{q.label}</span>
        <button type="button" className="bbo-arrow" aria-label="Next quote" onClick={() => setI((x) => (x + 1) % QUOTES.length)}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" /></svg>
        </button>
      </div>
      <p key={i}>“{q.q.text}”</p>
      <div className="bbo-who">
        <div className="bbo-faces" aria-hidden="true">
          {QUOTES.map((x, k) => <i key={k} className={k === i ? 'is-on' : ''}>{x.q.cafe.split(' ').map((w) => w[0]).join('').slice(0, 2)}</i>)}
        </div>
        <small>{q.q.who} · {q.q.cafe}</small>
      </div>
    </div>
  );
}

const STEPS = ['Packed', 'Delivered', 'Tried', 'Reordered'];
function Kit({ on }: { on: boolean }) {
  const [s, setS] = useState(0);
  const [held, setHeld] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEvery(on && !held, 1800, () => setS((x) => (x + 1) % (STEPS.length + 1)));
  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    const el = box.current;
    if (!el || reduced()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--tx', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    el.style.setProperty('--ty', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  };
  const reset = () => { box.current?.style.setProperty('--tx', '0'); box.current?.style.setProperty('--ty', '0'); };
  return (
    <div className="bbo-kit" ref={box} onPointerMove={tilt} onPointerLeave={reset}>
      <h3>Trial kits, tracked to the cup.</h3>
      <ol>
        {STEPS.map((x, k) => (
          <li key={x}><button type="button" className={k < s ? 'is-done' : ''} onClick={() => { setHeld(true); setS(k + 1); }}>{k < s ? '✓ ' : ''}{x}</button></li>
        ))}
      </ol>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/carton_3d_cutout.png" alt="" width={560} height={924} loading="lazy" />
    </div>
  );
}

const WEEKLY = [40, 62, 96, 138, 176, 214, 252, 288, 330, 366, 398, 420];
function Reorders({ on }: { on: boolean }) {
  const [w, setW] = useState<number | null>(null);
  const k = w ?? WEEKLY.length - 1, v = useTween(on ? WEEKLY[k] : 0, 500);
  const X = (i: number) => (i / (WEEKLY.length - 1)) * 600, Y = (x: number) => 200 - (x / 460) * 150;
  const line = WEEKLY.map((x, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(x).toFixed(1)}`).join('');
  const scrub = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setW(Math.round(clamp((e.clientX - r.left) / r.width) * (WEEKLY.length - 1)));
  };
  return (
    <div className={`bbo-waves${on ? ' is-on' : ''}`} onPointerMove={scrub} onPointerDown={scrub} onPointerLeave={() => setW(null)}>
      <svg viewBox="0 0 600 220" preserveAspectRatio="none" aria-hidden="true">
        <path className="w1" d="M0 70C70 50 110 120 180 106s120-70 190-44 120 66 230 34V220H0Z" />
        <path className="w2" d={`${line}L600 220L0 220Z`} />
        <path className="w3" d={line} />
      </svg>
      <span className="bbo-cursor" style={{ left: `${(k / (WEEKLY.length - 1)) * 100}%`, top: `${(Y(WEEKLY[k]) / 220) * 100}%` }} aria-hidden="true" />
      <div className="bbo-legend"><small>Weekly reorders · {w === null ? 'point to read a week' : `week ${k + 1}`}</small></div>
      <div className="bbo-big"><b>{fmt(v)} L</b><small>{w === null ? 'a week, by week 12' : `in week ${k + 1}`}</small></div>
    </div>
  );
}

function Waste({ on }: { on: boolean }) {
  const MAKE = 2400;
  const [usual, setUsual] = useState(4000);
  const saved = usual - MAKE, pct = Math.round((saved / usual) * 100), sv = useTween(on ? saved : 0, 600);
  return (
    <div className="bbo-waste">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="r0" cx="60" cy="60" r="44" />
        <circle className="r1" cx="60" cy="60" r="44" pathLength={100} style={{ strokeDasharray: `${on ? (MAKE / usual) * 100 : 0} 100` }} />
      </svg>
      <span className="bbo-badge">−{pct}%</span>
      <div className="bbo-waste-body">
        <small>Saved against your usual batch</small>
        <b>{fmt(sv)} L</b>
        <label>
          <span>You’d usually make <em>{fmt(usual)} L</em></span>
          <input type="range" min={2600} max={5000} step={100} value={usual} onChange={(e) => setUsual(Number(e.target.value))} style={{ '--v': (usual - 2600) / 2400 } as Vars} />
        </label>
      </div>
    </div>
  );
}
