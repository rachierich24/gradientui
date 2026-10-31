'use client';
// Brand dashboard, the section after the hero: a brand's own view of a live trial, built to be played with.
// The section pins while you scroll. The dashboard slides in from the left and its screen lights up part by
// part; scrolling on then plays the trial from day 1 to day 21. Kits leave 9 suppliers on delivery runs they
// already make and reach 120 cafés, baristas try and rate the product, and cafés light up as they start
// ordering every week. One dark card answers three questions: how the trial converts (the funnel on the
// left, which is also the map's legend and filter), where (the map) and why (what baristas say, on the
// right). The weekly orders are drawn against the forecast Gradient made before the trial began. Every
// figure follows the day, so scrolling back rewinds it; the timeline can also be dragged, stepped with the
// arrow keys or played, and pointing along it previews each day's news. Pointing at a step of the funnel
// shows those cafés on the map, a café or supplier tells its story, and a barista score shows what was said
// about it and which café said it. With reduced motion the section doesn't pin and opens on day 21.
// Data: ./trial-data.ts. Map: ./TrialMap.tsx. Styles: app/brand/brand-dashboard.css
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { fmt, reduced } from './shared';
import { TrialMap, type MapHot, type MapPoint } from './TrialMap';
import type { MapSpot } from './TrialMap3D';
import { ATTRS, CAFES, DAYS, EVENTS, FORECAST, HUBS, ICONS, KITS, MARKS, WEEKLY, forecastAt, latestQuote, mapFit, stageOf, tally, type Stage, type TrialEvent } from './trial-data';

const P0 = 0.22, P1 = 0.9; // the stretch of the pinned scroll that plays day 1 to day 21
const SPEED = 2.6; // days a second while playing

const OAT = 'M12 21V9M12 9c0-3 2-5 4-6 0 3-1.5 5-4 6zM12 13c0-3-2-5-4-6 0 3 1.5 5 4 6zM12 17c0-3 2-5 4-6 0 3-1.5 5-4 6z';
const PLAY = 'M8.5 5.8v12.4a.8.8 0 0 0 1.2.7l10-6.2a.8.8 0 0 0 0-1.4l-10-6.2a.8.8 0 0 0-1.2.7z';
const PAUSE = 'M7 5h3.6v14H7zM13.4 5H17v14h-3.4z';
const REPLAY = 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v4h4';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (x: number) => { const k = clamp(x); return k * k * (3 - 2 * k); };
const pct = (a: number, b: number) => (a && b ? Math.round((a / b) * 100) : null);
const along = (d: number) => (d - 1) / (DAYS - 1); // how far along the trial a day is, 0 to 1
const rise = (i: number) => ({ '--i': i }) as CSSProperties; // the order the screen lights up in
const initials = (name: string) => name.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('');
const CAFE_ID = new Map(CAFES.filter((c) => c.name).map((c) => [c.name!, c.id]));
// the 3D map (and three.js with it) loads after the page; without WebGL the flat map takes its place
const TrialMap3D = dynamic(() => import('./TrialMap3D').then((m) => m.TrialMap3D), { ssr: false });

function Icon({ d, className }: { d: string; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>;
}

const DIGITS = [...'0123456789'].map((n) => <span key={n}>{n}</span>);
/** A number whose digits roll to their new value. */
function Odo({ value }: { value: string }) {
  const chars = [...value];
  return (
    <span className="odo">
      <span className="bdb-sr">{value}</span>
      <span className="odo-in" aria-hidden="true">
        {chars.map((ch, i) => {
          const key = chars.length - i; // counted from the right, so units stay units as the number grows
          return /\d/.test(ch)
            ? <span key={key} className="odo-d" style={{ '--n': ch } as CSSProperties}><span>{DIGITS}</span></span>
            : <span key={`s${key}`} className="odo-s">{ch}</span>;
        })}
      </span>
    </span>
  );
}

// litres ordered a week, drawn up to today over the band Gradient forecast before the trial
const CW = 240, CH = 60;
const cx = (d: number) => along(d) * CW, cy = (l: number) => CH - 1 - (l / 480) * (CH - 6);
const ACTUAL = WEEKLY.map((v, i) => `${i ? 'L' : 'M'}${cx(1 + i / 4).toFixed(1)} ${cy(v).toFixed(1)}`).join('');
const BAND = (() => {
  const top: string[] = [], bottom: string[] = [], mid: string[] = [];
  for (let i = 0; i <= 48; i++) {
    const d = FORECAST.from + ((DAYS - FORECAST.from) * i) / 48, [lo, hi] = forecastAt(d), x = cx(d).toFixed(1);
    top.push(`${x} ${cy(hi).toFixed(1)}`);
    bottom.unshift(`${x} ${cy(lo).toFixed(1)}`);
    mid.push(`${x} ${cy((lo + hi) / 2).toFixed(1)}`);
  }
  return { area: `M${top.join('L')}L${bottom.join('L')}Z`, mid: `M${mid.join('L')}` };
})();
function Forecast({ day }: { day: number }) {
  const v = WEEKLY[Math.round((day - 1) * 4)];
  return (
    <span className="bdb-fc" aria-hidden="true">
      <svg viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="bdb-fc-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C4A8FF" stopOpacity="0.32" /><stop offset="1" stopColor="#C4A8FF" stopOpacity="0" /></linearGradient>
          <clipPath id="bdb-fc-cut"><rect width={cx(day)} height={CH} /></clipPath>
        </defs>
        <path d={`M0 ${CH - 1}H${CW}`} className="bdb-fc-base" />
        <path d={BAND.area} className="bdb-fc-band" />
        <path d={BAND.mid} className="bdb-fc-mid" />
        <g clipPath="url(#bdb-fc-cut)">
          <path d={`${ACTUAL}V${CH}H0Z`} className="bdb-fc-area" />
          <path d={ACTUAL} className="bdb-fc-line" />
        </g>
      </svg>
      <i style={{ left: `${along(day) * 100}%`, top: `${(cy(v) / CH) * 100}%` }} />
    </span>
  );
}

/** The notification at the top of the map: what just happened, or "live" between events. It only
 * re-renders when the event changes, so its spring only measures itself then. */
const Island = memo(function Island({ ev, done }: { ev: TrialEvent | null; done: boolean }) {
  return (
    <div className="bdb-island-row">
      <motion.div layout className={`bdb-island${ev ? ' is-open' : ''}`} style={{ borderRadius: 22 }} transition={{ type: 'spring', stiffness: 420, damping: 36 }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {ev ? (
            <motion.span
              key={ev.id}
              layout="position"
              className="bdb-island-ev"
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
              transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <span className={`bdb-island-ic is-${ev.icon}`}><Icon d={ICONS[ev.icon]} /></span>
              <span className="bdb-island-tx"><b>{ev.title}</b><small>{ev.meta}</small></span>
            </motion.span>
          ) : (
            <motion.span key={done ? 'done' : 'idle'} layout="position" className={`bdb-island-idle${done ? ' is-done' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <i />{done ? 'Trial complete' : 'Live · Delhi NCR'}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

type Tip = { kind: 'cafe' | 'hub'; id: number; x: number; y: number };

export function BrandDashboard() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const exact = useRef(1); // the day to the fraction, as the scroll has it
  const still = useRef(false); // reduced motion: nothing pins, and the day only moves when you drag it
  const drag = useRef(false);
  const halt = useRef<() => void>(() => {});
  const [calm, setCalm] = useState(false);
  const [day, setDay] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [peek, setPeek] = useState<Stage | null>(null);
  const [pin, setPin] = useState<Stage | null>(null);
  const [attr, setAttr] = useState<number | null>(null);
  const [say, setSay] = useState(false); // the pointer (or focus) is on what baristas say
  const [tip, setTip] = useState<Tip | null>(null);
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);
  const [scan, setScan] = useState<number | null>(null); // the day under the pointer on the timeline
  const [fit, setFit] = useState({ sx: 1, ms: 1 });
  const [flat, setFlat] = useState(false); // no WebGL: the flat map instead of the 3D one
  const filter = peek ?? pin;

  // --day carries the exact day to the CSS (the map, the timeline); React re-renders every quarter day
  const show = useCallback((d: number) => {
    const v = d.toFixed(3);
    if (stageRef.current && stageRef.current.style.getPropertyValue('--day') !== v) stageRef.current.style.setProperty('--day', v);
    exact.current = d;
    setDay(Math.round(d * 4) / 4);
  }, []);

  // --a: how far the dashboard has slid in (0 = off the left edge, 1 = in place); the day follows the pinned scroll
  useEffect(() => {
    const track = trackRef.current, stage = stageRef.current;
    if (!track || !stage) return;
    const io = new IntersectionObserver(([e]) => stage.classList.toggle('is-in', e.isIntersecting));
    io.observe(stage);
    if (reduced()) { still.current = true; setCalm(true); stage.style.setProperty('--a', '1'); show(DAYS); return () => io.disconnect(); }
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = track.getBoundingClientRect(), vh = window.innerHeight;
      stage.style.setProperty('--a', smooth((vh - r.top) / (vh * 1.3)).toFixed(4));
      const p = clamp(-r.top / Math.max(1, track.offsetHeight - vh));
      show(1 + (DAYS - 1) * clamp((p - P0) / (P1 - P0)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      io.disconnect();
      halt.current();
    };
  }, [show]);

  // the map stretches to its panel's shape
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (!width || !height) return;
      const next = mapFit(width, height);
      setFit((f) => (f.sx === next.sx && f.ms === next.ms ? f : next));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // moving the day means moving the scroll, so the page and the dashboard never disagree
  const goTo = useCallback((d: number) => {
    d = clamp(d, 1, DAYS);
    const track = trackRef.current;
    if (still.current || !track) return show(d);
    const span = track.offsetHeight - window.innerHeight;
    const y = track.getBoundingClientRect().top + window.scrollY + (P0 + ((P1 - P0) * (d - 1)) / (DAYS - 1)) * span;
    const lenis = (window as unknown as { lenis?: { scrollTo: (y: number, o: { immediate: boolean }) => void } }).lenis;
    if (lenis) lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y);
  }, [show]);

  const play = () => {
    if (playing) return halt.current();
    let d = exact.current >= DAYS - 0.05 ? 1 : exact.current, last = 0, raf = 0;
    const end = () => {
      cancelAnimationFrame(raf);
      setPlaying(false);
      halt.current = () => {};
      window.removeEventListener('wheel', end);
      window.removeEventListener('touchstart', end);
      window.removeEventListener('keydown', end);
    };
    const step = (now: number) => {
      if (last) d = Math.min(DAYS, d + ((now - last) / 1000) * SPEED);
      last = now;
      goTo(d);
      if (d >= DAYS) end(); else raf = requestAnimationFrame(step);
    };
    halt.current = end;
    setPlaying(true);
    raf = requestAnimationFrame(step);
    // any scrolling of your own takes the wheel back
    window.addEventListener('wheel', end, { passive: true });
    window.addEventListener('touchstart', end, { passive: true });
    window.addEventListener('keydown', end);
  };

  const dayAt = (x: number) => {
    const r = railRef.current!.getBoundingClientRect();
    return 1 + (DAYS - 1) * clamp((x - r.left) / r.width);
  };
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    halt.current();
    drag.current = true;
    setScan(null);
    e.currentTarget.setPointerCapture(e.pointerId);
    goTo(dayAt(e.clientX));
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current) return goTo(dayAt(e.clientX));
    if (e.pointerType === 'mouse') setScan(Math.round(dayAt(e.clientX)));
  };
  const onUp = () => { drag.current = false; };
  const onKey = (e: KeyboardEvent) => {
    const by: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 5, PageDown: -5, Home: -DAYS, End: DAYS };
    if (!(e.key in by)) return;
    e.preventDefault();
    halt.current();
    goTo(Math.round(exact.current) + by[e.key]);
  };

  // a soft light that follows the pointer across the card
  const light = (e: PointerEvent<HTMLDivElement>) => {
    const el = lightRef.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    el.style.transform = `translate3d(${(e.clientX - r.left).toFixed(0)}px, ${(e.clientY - r.top).toFixed(0)}px, 0)`;
    el.style.opacity = '1';
  };
  const unlight = () => { if (lightRef.current) lightRef.current.style.opacity = '0'; };

  // the 3D map reports where the point is; the flat map hands over its element
  const onPoint = useCallback((p: MapPoint | MapSpot) => {
    if (p && 'x' in p) return setTip({ kind: p.kind, id: p.id, x: p.x, y: p.y });
    const box = mapRef.current?.getBoundingClientRect();
    if (!p || !box) return setTip(null);
    const r = p.el.getBoundingClientRect();
    setTip({ kind: p.kind, id: p.id, x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top });
  }, []);
  const toFlat = useCallback(() => setFlat(true), []);
  // the story sits above the point if it fits, else below, else beside it, and always inside the map
  useLayoutEffect(() => {
    const el = tipRef.current, box = mapRef.current;
    if (!el || !box || !tip) return;
    const W = box.clientWidth, H = box.clientHeight, w = el.offsetWidth, h = el.offsetHeight, gap = 14;
    let left = tip.x - w / 2, top = tip.y - gap - h;
    if (top < 6) {
      if (tip.y + gap + h <= H - 6) top = tip.y + gap;
      else { left = tip.x + gap + w <= W - 6 ? tip.x + gap : tip.x - gap - w; top = tip.y - h / 2; }
    }
    el.style.left = `${clamp(left, 6, W - w - 6)}px`;
    el.style.top = `${clamp(top, 6, H - h - 6)}px`;
  });

  // what baristas say: a score shows what was said about it, and the café that said it is marked on the map
  const quote = attr !== null ? ATTRS[attr].quote : latestQuote(day);
  const heard = !!quote && quote.day <= day;
  const spotId = say && heard ? CAFE_ID.get(quote!.cafe) ?? null : null;
  useLayoutEffect(() => {
    const box = mapRef.current, el = spotId !== null && box ? box.querySelector(`[data-cafe="${spotId}"]`) : null;
    if (!box || !el) return setSpot(null);
    const b = box.getBoundingClientRect(), r = el.getBoundingClientRect();
    setSpot({ x: r.left + r.width / 2 - b.left, y: r.top + r.height / 2 - b.top });
  }, [spotId, fit]);

  // the map only re-renders when what's being looked at changes
  const tipKind = tip?.kind, tipId = tip?.id;
  const hot = useMemo<MapHot>(
    () => (tipKind !== undefined && tipId !== undefined ? { kind: tipKind, id: tipId } : spotId !== null ? { kind: 'cafe', id: spotId } : null),
    [tipKind, tipId, spotId],
  );

  const t = tally(day);
  const today = Math.floor(day), done = day >= DAYS;
  const ev = [...EVENTS].reverse().find((e) => e.day <= day && e.day > day - 1.5) ?? null;
  const steps = [
    { k: 'delivered', label: 'Kits delivered', short: 'Delivered', n: t.delivered, of: KITS, conv: null, of2: '' },
    { k: 'tried', label: 'Baristas tried it', short: 'Tried', n: t.tried, of: null, conv: pct(t.tried, t.delivered), of2: 'of the cafés with a kit' },
    { k: 'rated', label: 'Rated it', short: 'Rated', n: t.rated, of: null, conv: pct(t.rated, t.tried), of2: 'of the baristas who tried it' },
  ] as const;
  const orderConv = pct(t.order, t.rated);
  const toggle = (k: Stage) => setPin((p) => (p === k ? null : k));
  const peekAt = (k: Stage) => (e: PointerEvent) => { if (e.pointerType === 'mouse') setPeek(k); };
  const scanEv = scan !== null ? EVENTS.find((e) => Math.round(e.day) === scan) ?? null : null;

  let tipBody = null;
  if (tip?.kind === 'cafe') {
    const c = CAFES[tip.id], s = stageOf(c, day);
    const rows: [string, number | null, string | null][] = [
      ['Kit delivered', c.d, `via ${HUBS[c.hub].name}`],
      ['A barista tried it', c.t, null],
      [c.r !== null && c.r <= day ? `Rated it ${c.stars!.toFixed(1)} ★` : 'Rated it', c.r, null],
      ['Orders every week', c.o, c.litres ? `${c.litres} L a week` : null],
    ];
    tipBody = (
      <>
        <div className="bdb-tip-h">
          <span><b>{c.name}</b><small>{c.area}</small></span>
          <em className={`bdb-tip-chip is-${s.k}`}>{s.label}</em>
        </div>
        <ol>
          {rows.map(([label, at, sub]) => {
            const on = at !== null && at <= day;
            return (
              <li key={label} className={on ? 'is-on' : undefined}>
                <i />
                <span>{label}{on && sub && <small>{sub}</small>}</span>
                <em>{on ? `Day ${Math.floor(at!)}` : done ? 'Not yet' : '–'}</em>
              </li>
            );
          })}
        </ol>
      </>
    );
  } else if (tip?.kind === 'hub') {
    const h = HUBS[tip.id], got = CAFES.filter((c) => c.hub === tip.id && c.d <= day).length;
    tipBody = (
      <>
        <div className="bdb-tip-h">
          <span><b>{h.name}</b><small>Supplier · already delivers to these cafés</small></span>
        </div>
        <div className="bdb-tip-run">
          <span>Kits delivered</span><b>{got}<small>/{h.kits}</small></b>
          <i style={{ '--w': got / h.kits } as CSSProperties} />
        </div>
      </>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <section className="bdb" id="platform" aria-labelledby="bdb-title">
        <div ref={trackRef} className="bdb-track">
          <div ref={stageRef} className="bdb-stage">
            <div className="brd-wrap bdb-head">
              <h2 id="bdb-title">Watch your trial turn into weekly orders.</h2>
              <p>Every kit, every barista’s verdict and every café that starts ordering, in one dashboard only your brand can see.</p>
            </div>

            <div className="brd-wrap bdb-win-wrap">
              <div className="bdb-aura" aria-hidden="true" />
              <div className="bdb-card" role="region" aria-label={`Sample brand dashboard, day ${today} of ${DAYS}`} onPointerMove={light} onPointerLeave={unlight}>
                <div ref={lightRef} className="bdb-light" aria-hidden="true" />

                <header className="bdb-bar bdb-in" style={rise(0)}>
                  <span className="bdb-logo" aria-hidden="true"><Icon d={OAT} /></span>
                  <span className="bdb-product">
                    <b>Barista Oat Milk</b>
                    <small>Delhi NCR trial · {KITS} kits · {HUBS.length} suppliers</small>
                  </span>
                  <em className="bdb-sample">Sample figures</em>
                </header>

                <div className="bdb-body">
                  {/* how it converts: each step is also the map's legend, and pointing at it shows those cafés */}
                  <div className={`bdb-funnel bdb-in${filter ? ' has-f' : ''}`} style={rise(1)}>
                    <p className="bdb-eyebrow">From kit to reorder</p>
                    <div className="bdb-steps">
                      {steps.map((s) => (
                        <button
                          key={s.k}
                          type="button"
                          className={`bdb-step is-${s.k}${filter === s.k ? ' is-on' : ''}`}
                          aria-pressed={pin === s.k}
                          aria-label={`${s.label}: ${s.n}${s.of ? ` of ${s.of}` : ''}${s.conv !== null ? `, ${s.conv}% ${s.of2}` : ''}. Show these cafés on the map`}
                          onPointerEnter={peekAt(s.k)}
                          onPointerLeave={() => setPeek(null)}
                          onClick={() => toggle(s.k)}
                        >
                          <span className="bdb-step-l" aria-hidden="true">
                            <i className="bdb-sw" />
                            <span className="bdb-long">{s.label}</span><span className="bdb-short">{s.short}</span>
                            {s.conv !== null && <em>{s.conv}%</em>}
                          </span>
                          <b aria-hidden="true"><Odo value={String(s.n)} />{s.of && <small>/{s.of}</small>}</b>
                          <span className="bdb-step-bar" aria-hidden="true"><i style={{ transform: `scaleX(${s.n / KITS})` }} /></span>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className={`bdb-out is-order${filter === 'order' ? ' is-on' : ''}${t.order ? '' : ' is-zero'}`}
                      aria-pressed={pin === 'order'}
                      aria-label={`Ordering every week: ${t.order} ${t.order === 1 ? 'café' : 'cafés'}, ${fmt(t.litres)} litres a week, against a forecast of ${FORECAST.lo} to ${FORECAST.hi}. Show these cafés on the map`}
                      onPointerEnter={peekAt('order')}
                      onPointerLeave={() => setPeek(null)}
                      onClick={() => toggle('order')}
                    >
                      <span className="bdb-out-h" aria-hidden="true">
                        <i className="bdb-sw" />
                        <span className="bdb-long">Ordering every week</span><span className="bdb-short">Ordering</span>
                        {orderConv !== null && <em>{orderConv}%</em>}
                      </span>
                      <b className="bdb-out-n" aria-hidden="true"><Odo value={String(t.order)} /><small>{t.order === 1 ? 'café' : 'cafés'}</small></b>
                      <span className="bdb-out-l" aria-hidden="true">{t.order ? `${fmt(t.litres)} L a week` : 'First reorders usually land in week two'}</span>
                      <Forecast day={day} />
                      <span className="bdb-fc-key" aria-hidden="true">
                        <span><i className="is-actual" />Orders</span>
                        <span><i className="is-fc" />Forecast {FORECAST.lo}–{FORECAST.hi} L</span>
                      </span>
                    </button>
                  </div>

                  {/* where */}
                  <div ref={mapRef} className={`bdb-map bdb-in${filter ? ` f-${filter}` : ''}`} style={rise(2)}>
                    {flat
                      ? <TrialMap sx={fit.sx} ms={fit.ms} hot={hot} onPoint={onPoint} />
                      : <TrialMap3D dayRef={exact} filter={filter} hot={hot} spot={spotId} still={calm} onPoint={onPoint} onFail={toFlat} />}
                    <Island ev={ev} done={done} />
                    {tip && tipBody && (
                      <div key={`${tip.kind}${tip.id}`} ref={tipRef} className="bdb-tip" role="status">
                        {tipBody}
                      </div>
                    )}
                    {spot && spotId !== null && !tip && (
                      <span key={spotId} className="bdb-pin" style={{ left: spot.x, top: spot.y }} aria-hidden="true">{CAFES[spotId].name}</span>
                    )}
                  </div>

                  {/* why */}
                  <div
                    className="bdb-voice bdb-in"
                    style={rise(3)}
                    onPointerEnter={(e) => { if (e.pointerType === 'mouse') setSay(true); }}
                    onPointerLeave={() => { setSay(false); setAttr(null); }}
                  >
                    <p className="bdb-eyebrow">What baristas say<span>{t.rated ? `${t.rated} ${t.rated === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}</span></p>
                    <div className={`bdb-score${t.avg ? '' : ' is-zero'}`}>
                      <b>{t.avg ? <Odo value={t.avg.toFixed(1)} /> : '–'}</b>
                      <i aria-hidden="true">★</i>
                      <small>average rating</small>
                    </div>
                    <div className="bdb-attrs">
                      {ATTRS.map((a, i) => (
                        <button
                          key={a.label}
                          type="button"
                          className={`bdb-attr${attr === i ? ' is-on' : ''}`}
                          style={{ '--w': t.rated ? a.score / 5 : 0 } as CSSProperties}
                          onPointerEnter={() => setAttr(i)}
                          onClick={() => { setAttr(i); setSay(true); }}
                          onFocus={() => { setAttr(i); setSay(true); }}
                          onBlur={() => { setAttr(null); setSay(false); }}
                          aria-label={`${a.label}: ${t.rated ? `${a.score.toFixed(1)} out of 5` : 'no reviews yet'}. Show what baristas said`}
                        >
                          <span>{a.label}</span>
                          <b>{t.rated ? a.score.toFixed(1) : '–'}</b>
                          <i />
                        </button>
                      ))}
                    </div>
                    <div className="bdb-quote">
                      <p className="bdb-quote-k" aria-hidden="true">{attr !== null ? ATTRS[attr].label : 'Latest review'}</p>
                      <AnimatePresence mode="wait" initial={false}>
                        {quote && heard ? (
                          <motion.figure
                            key={quote.text}
                            initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
                            transition={{ duration: 0.24 }}
                          >
                            <blockquote>“{quote.text}”</blockquote>
                            <figcaption>
                              <span className="bdb-avatar" aria-hidden="true">{initials(quote.cafe)}</span>
                              <span className="bdb-who"><b>{quote.who}</b>{quote.cafe}</span>
                              <span className="bdb-stars" aria-label={`${quote.stars} out of 5`}>{'★'.repeat(quote.stars)}<i>{'★'.repeat(5 - quote.stars)}</i></span>
                            </figcaption>
                          </motion.figure>
                        ) : (
                          <motion.p key={attr ?? 'wait'} className="bdb-wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                            {attr !== null ? 'No one has said much about this yet.' : 'Reviews start coming in once baristas have tried it.'}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* when: the scroll is the trial's clock, and it can be dragged */}
                <div className="bdb-time bdb-in" style={rise(4)}>
                  {!calm && (
                    <button type="button" className={`bdb-play${playing ? ' is-on' : ''}`} onClick={play} aria-label={playing ? 'Pause the trial' : done ? 'Replay the trial' : 'Play the trial'}>
                      <Icon d={playing ? PAUSE : done ? REPLAY : PLAY} className={!playing && done ? 'is-line' : undefined} />
                    </button>
                  )}
                  <div
                    className={`bdb-rail${scan !== null ? ' is-scan' : ''}`}
                    role="slider"
                    tabIndex={0}
                    aria-label="Trial day"
                    aria-valuemin={1}
                    aria-valuemax={DAYS}
                    aria-valuenow={today}
                    aria-valuetext={`Day ${today} of ${DAYS}`}
                    onKeyDown={onKey}
                    onPointerDown={onDown}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                    onPointerLeave={() => setScan(null)}
                  >
                    <span ref={railRef} className="bdb-rail-track"><i /></span>
                    <span className="bdb-rail-evs" aria-hidden="true">
                      {EVENTS.map((e) => <i key={e.id} className={e.day <= day ? 'is-on' : undefined} style={{ left: `${along(e.day) * 100}%` }} />)}
                    </span>
                    {scan !== null && (
                      <span className="bdb-rail-scan" style={{ left: `${along(scan) * 100}%`, '--fn': along(scan) } as CSSProperties} aria-hidden="true">
                        <b>Day {scan}{scanEv && <small>{scanEv.title}</small>}</b>
                      </span>
                    )}
                    <span className="bdb-rail-head" aria-hidden="true"><b>{`Day ${today}`}</b></span>
                    <span className="bdb-rail-marks" aria-hidden="true">
                      {MARKS.map((m) => (
                        <span key={m.label} className={day >= m.day ? 'is-on' : undefined} style={{ left: `${along(m.day) * 100}%` }}>{m.label}</span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
