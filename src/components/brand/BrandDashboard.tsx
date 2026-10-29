'use client';
// Brand dashboard, the section after the hero: a brand's own view of a live trial, built to be played with.
// The section pins while you scroll. First the dashboard slides in from the left and settles, its panels
// trailing it a little and catching up as it lands. Scrolling on then plays the trial from day 1 to day 21:
// on the live map, kits leave 9 suppliers on delivery runs they already make and reach 120 cafés, baristas
// try and rate the product, and cafés light up as they start ordering every week. Every figure follows the
// day, so scrolling back rewinds it. The timeline can also be dragged, stepped with the arrow keys or played;
// the KPI cards and the map's legend filter the map; the named cafés and the suppliers tell their story on
// hover; each barista score shows what was said about it; and a notification in the map's corner announces
// what just happened. With reduced motion the section doesn't pin and opens on day 21.
// Data: ./trial-data.ts. Map: ./TrialMap.tsx. Styles: app/brand/brand-dashboard.css
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { fmt, reduced } from './shared';
import { TrialMap, type MapHot, type MapPoint } from './TrialMap';
import { ATTRS, CAFES, DAYS, EVENTS, HUBS, ICONS, KITS, MARKS, WEEKLY, latestQuote, mapFit, stageOf, tally, type Stage, type TrialEvent } from './trial-data';

const P0 = 0.22, P1 = 0.9; // the stretch of the pinned scroll that plays day 1 to day 21
const SPEED = 2.6; // days a second while playing

const NAV = [
  ['Overview', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
  ['Trials', 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3'],
  ['Cafés', ICONS.cup],
  ['Feedback', 'M4 5h16v11H9l-5 4z'],
  ['Orders', ICONS.box],
  ['Suppliers', ICONS.truck],
] as const;
const OAT = 'M12 21V9M12 9c0-3 2-5 4-6 0 3-1.5 5-4 6zM12 13c0-3-2-5-4-6 0 3 1.5 5 4 6zM12 17c0-3 2-5 4-6 0 3-1.5 5-4 6z';
const LOCK = 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3';
const MOUSE = 'M12 3a5 5 0 0 1 5 5v8a5 5 0 0 1-10 0V8a5 5 0 0 1 5-5zM12 7v3';
const PLAY = 'M8.5 5.8v12.4a.8.8 0 0 0 1.2.7l10-6.2a.8.8 0 0 0 0-1.4l-10-6.2a.8.8 0 0 0-1.2.7z';
const PAUSE = 'M7 5h3.6v14H7zM13.4 5H17v14h-3.4z';
const REPLAY = 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v4h4';
const LEGEND: [Stage | null, string][] = [[null, 'On the way'], ['delivered', 'Delivered'], ['tried', 'Tried'], ['rated', 'Rated'], ['order', 'Orders weekly']];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (x: number) => { const k = clamp(x); return k * k * (3 - 2 * k); };
const lag = (px: number) => ({ '--lag': px }) as CSSProperties;
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const initials = (name: string) => name.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('');

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

// litres ordered a week, drawn up to today
const SW = 120, SH = 36;
const sx = (i: number) => (i / (WEEKLY.length - 1)) * SW, sy = (v: number) => SH - 3 - (v / 420) * (SH - 8);
const SPARK = WEEKLY.map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join('');
function Spark({ day }: { day: number }) {
  const i = ((day - 1) / (DAYS - 1)) * (WEEKLY.length - 1);
  return (
    <svg className="bdb-spark" viewBox={`0 0 ${SW} ${SH}`} aria-hidden="true">
      <defs>
        <linearGradient id="bdb-spark-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.32" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <clipPath id="bdb-spark-cut"><rect width={sx(i)} height={SH} /></clipPath>
      </defs>
      <g clipPath="url(#bdb-spark-cut)">
        <path d={`${SPARK}L${SW} ${SH}L0 ${SH}Z`} fill="url(#bdb-spark-fill)" />
        <path d={SPARK} className="bdb-spark-line" />
      </g>
      <circle cx={sx(i)} cy={sy(WEEKLY[Math.round(i)])} r="2.6" className="bdb-spark-dot" />
    </svg>
  );
}

/** The notification in the map's top corner: what just happened, or "live" between events. It only
 * re-renders when the event changes, so its spring only measures itself then. */
const Island = memo(function Island({ ev }: { ev: TrialEvent | null }) {
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
            <motion.span key="idle" layout="position" className="bdb-island-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <i />Live map · Bangalore
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
  const [tip, setTip] = useState<Tip | null>(null);
  const [fit, setFit] = useState({ sx: 1.6, ms: 1 });
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
    e.currentTarget.setPointerCapture(e.pointerId);
    goTo(dayAt(e.clientX));
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => { if (drag.current) goTo(dayAt(e.clientX)); };
  const onUp = () => { drag.current = false; };
  const onKey = (e: KeyboardEvent) => {
    const by: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 5, PageDown: -5, Home: -DAYS, End: DAYS };
    if (!(e.key in by)) return;
    e.preventDefault();
    halt.current();
    goTo(Math.round(exact.current) + by[e.key]);
  };

  // the light that follows the pointer across the cards and the map
  const glow = (e: PointerEvent<HTMLDivElement>) => {
    for (const el of e.currentTarget.querySelectorAll<HTMLElement>('.bdb-glow')) {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(0)}px`);
      el.style.setProperty('--my', `${(e.clientY - r.top).toFixed(0)}px`);
    }
  };
  const unglow = (e: PointerEvent<HTMLDivElement>) => {
    for (const el of e.currentTarget.querySelectorAll<HTMLElement>('.bdb-glow')) { el.style.removeProperty('--mx'); el.style.removeProperty('--my'); }
  };

  const onPoint = useCallback((p: MapPoint) => {
    const box = mapRef.current?.getBoundingClientRect();
    if (!p || !box) return setTip(null);
    const r = p.el.getBoundingClientRect();
    setTip({ kind: p.kind, id: p.id, x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top });
  }, []);
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
  // the map only re-renders when what's being looked at changes
  const tipKind = tip?.kind, tipId = tip?.id;
  const hot = useMemo<MapHot>(() => (tipKind !== undefined && tipId !== undefined ? { kind: tipKind, id: tipId } : null), [tipKind, tipId]);

  const t = tally(day), was = tally(day - 1);
  const today = Math.floor(day), done = day >= DAYS;
  const ev = [...EVENTS].reverse().find((e) => e.day <= day && e.day > day - 1.5) ?? null;
  const quote = attr !== null ? ATTRS[attr].quote : latestQuote(day);
  const heard = t.rated / 88; // how much of the feedback is in
  const kpis = [
    { k: 'delivered', label: 'Kits delivered', short: 'Delivered', value: String(t.delivered), unit: `/${KITS}`, sub: `via ${HUBS.length} suppliers`, bar: t.delivered / KITS, up: t.delivered - was.delivered },
    { k: 'tried', label: 'Baristas tried it', short: 'Tried it', value: String(t.tried), sub: `${pct(t.tried, KITS)}% of cafés`, bar: t.tried / KITS, up: t.tried - was.tried, conv: t.tried ? pct(t.tried, t.delivered) : null },
    { k: 'rated', label: 'Average rating', short: 'Rating', value: t.avg ? t.avg.toFixed(1) : '–', sub: `${t.rated} reviews`, bar: t.avg ? t.avg / 5 : 0, up: 0, conv: t.rated ? pct(t.rated, t.tried) : null },
    { k: 'order', label: 'Ordering every week', short: 'Ordering', value: String(t.order), unit: t.order === 1 ? ' café' : ' cafés', sub: `${fmt(t.litres)} L a week`, bar: 0, up: t.order - was.order, conv: t.order ? pct(t.order, t.rated) : null },
  ] as const;
  const toggle = (k: Stage) => setPin((p) => (p === k ? null : k));
  const badges: Record<string, string | number | null> = { Trials: done ? null : 'Live', Cafés: t.delivered, Feedback: t.rated, Orders: t.order, Suppliers: HUBS.length };

  let tipBody = null;
  if (tip?.kind === 'cafe') {
    const c = CAFES[tip.id], s = stageOf(c, day);
    const steps: [string, number | null, string | null][] = [
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
          {steps.map(([label, at, sub]) => {
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
          <i style={{ '--w': `${(got / h.kits) * 100}%` } as CSSProperties} />
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
              <div className="bdb-head-r">
                <p>Every kit, every barista’s verdict and every café that starts ordering, in one dashboard only your brand can see.</p>
                {!calm && <span className="bdb-hint"><Icon d={MOUSE} />Scroll to play the trial, or drag its timeline.</span>}
              </div>
            </div>

            <div className="brd-wrap bdb-win-wrap">
              <div className="bdb-aura" aria-hidden="true" />
              <div className="bdb-frame">
                <div className="bdb-win" role="region" aria-label={`Sample brand dashboard, day ${today} of ${DAYS}`} onPointerMove={glow} onPointerLeave={unglow}>
                  <div className="bdb-chrome" aria-hidden="true">
                    <i /><i /><i />
                    <span>Gradient · Brand Portal</span>
                    <em className="brd-sample">Sample figures</em>
                  </div>

                  <aside className="bdb-side bdb-lag" style={lag(0)}>
                    <div className="bdb-brand">
                      <span className="bdb-logo" aria-hidden="true"><Icon d={OAT} /></span>
                      <span className="bdb-brand-tx"><b>Your brand</b><small>Barista Oat Milk · 1 L</small></span>
                    </div>
                    <nav className="bdb-nav" aria-hidden="true">
                      {NAV.map(([label, d]) => {
                        const badge = badges[label];
                        return (
                          <span key={label} className={label === 'Trials' ? 'is-on' : undefined}>
                            <Icon d={d} /><span className="bdb-nav-tx">{label}</span>
                            {badge !== undefined && badge !== null && <em className={badge === 'Live' ? 'is-live' : undefined}>{badge}</em>}
                          </span>
                        );
                      })}
                    </nav>
                    <p className="bdb-private"><Icon d={LOCK} /><span>Only your team sees this. Other brands never do.</span></p>
                  </aside>

                  <div className="bdb-main">
                    <div className="bdb-top bdb-lag" style={lag(40)}>
                      <div className="bdb-title">
                        <b>Bangalore specialty trial</b>
                        <small>Barista Oat Milk · {KITS} kits · {HUBS.length} suppliers · {DAYS} days</small>
                      </div>
                      <span className={`bdb-status${done ? ' is-done' : ''}`}>
                        <i />{done ? 'Trial complete' : <>Live<span className="bdb-status-day"> · day {today} of {DAYS}</span></>}
                      </span>
                    </div>

                    <div className="bdb-scrub bdb-lag" style={lag(70)}>
                      {!calm && (
                        <button type="button" className={`bdb-play${playing ? ' is-on' : ''}`} onClick={play} aria-label={playing ? 'Pause the trial' : done ? 'Replay the trial' : 'Play the trial'}>
                          <Icon d={playing ? PAUSE : done ? REPLAY : PLAY} className={!playing && done ? 'is-line' : undefined} />
                        </button>
                      )}
                      <div
                        className="bdb-rail"
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
                      >
                        <span ref={railRef} className="bdb-rail-track"><i /></span>
                        <span className="bdb-rail-ticks" aria-hidden="true">
                          {Array.from({ length: DAYS - 2 }, (_, i) => <i key={i} style={{ left: `${((i + 1) / (DAYS - 1)) * 100}%` }} />)}
                        </span>
                        <span className="bdb-rail-head"><b>Day {today}</b></span>
                        <span className="bdb-rail-marks" aria-hidden="true">
                          {MARKS.map((m) => (
                            <span key={m.label} className={day >= m.day ? 'is-on' : undefined} style={{ left: `${((m.day - 1) / (DAYS - 1)) * 100}%` }}>{m.label}</span>
                          ))}
                        </span>
                      </div>
                    </div>

                    <div className="bdb-kpis bdb-lag" style={lag(110)}>
                      {kpis.map((k) => (
                        <button
                          key={k.k}
                          type="button"
                          className={`bdb-kpi bdb-glow is-${k.k}${filter === k.k ? ' is-on' : ''}${k.k === 'order' && done ? ' is-done' : ''}`}
                          aria-pressed={pin === k.k}
                          aria-label={`${k.label}: ${k.value}${'unit' in k ? k.unit : ''}, ${k.sub}. Show these cafés on the map`}
                          onPointerEnter={() => setPeek(k.k)}
                          onPointerLeave={() => setPeek(null)}
                          onClick={() => toggle(k.k)}
                        >
                          {'conv' in k && k.conv !== null && <span className="bdb-conv" aria-hidden="true">{k.conv}%</span>}
                          <span className="bdb-kpi-h" aria-hidden="true">
                            <small><span className="bdb-kpi-long">{k.label}</span><span className="bdb-kpi-short">{k.short}</span></small>
                            {k.up > 0 && <em key={today} className="bdb-up">+{k.up}<span className="bdb-up-tx"> today</span></em>}
                          </span>
                          <b aria-hidden="true">
                            {k.k === 'rated' && t.avg && <i className="bdb-star">★</i>}
                            <Odo value={k.value} />
                            {'unit' in k && <span>{k.unit}</span>}
                          </b>
                          <span className="bdb-kpi-sub" aria-hidden="true">{k.sub}</span>
                          {k.k !== 'order' ? <span className="bdb-bar" aria-hidden="true"><i style={{ width: `${k.bar * 100}%` }} /></span> : t.litres > 0 && <Spark day={day} />}
                        </button>
                      ))}
                    </div>

                    <div className="bdb-live bdb-glow bdb-lag" style={lag(170)}>
                      <div ref={mapRef} className={`bdb-map${filter ? ` f-${filter}` : ''}`}>
                        <TrialMap sx={fit.sx} ms={fit.ms} hot={hot} onPoint={onPoint} />

                        <Island ev={ev} />

                        <div className="bdb-legend">
                          {LEGEND.map(([k, label]) => k ? (
                            <button key={k} type="button" className={`is-${k}`} aria-pressed={pin === k} onPointerEnter={() => setPeek(k)} onPointerLeave={() => setPeek(null)} onClick={() => toggle(k)}>
                              <i />{label}
                            </button>
                          ) : (
                            <span key="way" className="is-way"><i />{label}</span>
                          ))}
                        </div>

                        {tip && tipBody && (
                          <div key={`${tip.kind}${tip.id}`} ref={tipRef} className="bdb-tip" role="status">
                            {tipBody}
                          </div>
                        )}
                      </div>

                      <div className="bdb-say">
                        <div className="bdb-say-h"><b>What baristas say</b><small>{t.rated} reviews</small></div>
                        <div className="bdb-attrs">
                          {ATTRS.map((a, i) => (
                            <button
                              key={a.label}
                              type="button"
                              className={`bdb-attr${attr === i ? ' is-on' : ''}`}
                              style={{ '--w': `${(a.score / 5) * heard * 100}%` } as CSSProperties}
                              onPointerEnter={() => setAttr(i)}
                              onPointerLeave={() => setAttr(null)}
                              onFocus={() => setAttr(i)}
                              onBlur={() => setAttr(null)}
                              aria-label={`${a.label}: ${heard > 0.02 ? `${a.score.toFixed(1)} out of 5` : 'no reviews yet'}. Show what baristas said`}
                            >
                              <span>{a.label}</span>
                              <b>{heard > 0.02 ? a.score.toFixed(1) : '–'}</b>
                              <i />
                            </button>
                          ))}
                        </div>
                        <div className="bdb-quote">
                          <AnimatePresence mode="wait" initial={false}>
                            {quote && quote.day <= day ? (
                              <motion.figure key={quote.text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
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
