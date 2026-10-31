'use client';
// Chapter 1 of the features section (BrandFeatures.tsx), "Know where it'll sell": the demand story as a bento
// grid that comes together as you scroll into the chapter. Five tiles fly in from around the canvas on the
// chapter's --k and lock into the grid: the live heat map of India, the city in focus (its index set large),
// the hottest cities, the next four weeks of demand, and next month's batch against the usual one. Once the
// grid stands the map tours on its own, product by product, and every tile follows the city it's on; pick a
// product or point at a hot city to take over, and the tour resumes once you've left the map.
// Map data: ./demand-data.ts, ./india-map.ts, ./demand-heat.ts. Styles: app/brand/brand-features.css (bdg-)
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { fmt, reduced, useTween } from './shared';
import { INDIA } from './india-map';
import { CITIES, PRODUCTS, RAMP, VIEW, bandOf, batch, heat, scoreAt } from './demand-data';
import { createHeat } from './demand-heat';

type Vars = CSSProperties & Record<`--${string}`, string | number>;
type Props = { active: boolean; listen: (fn: (k: number) => void) => void };
const at = (x: number, y: number) => ({ left: `${((x - VIEW.x) / VIEW.w) * 100}%`, top: `${((y - VIEW.y) / VIEW.h) * 100}%` });

/** A tile: where it flies in from (px on the board), how far it's turned, and when it sets off. */
function Tile({ area, tone, from, d, children, label }: { area: string; tone: string; from: [number, number, number]; d: number; children: ReactNode; label: string }) {
  return (
    <div className={`bdg-t bdg-${area} ${tone}`} style={{ '--dx': from[0], '--dy': from[1], '--r': from[2], '--d': d } as Vars} role="group" aria-label={label}>
      {children}
    </div>
  );
}

export function DemandBento({ active, listen }: Props) {
  const [p, setP] = useState(0);
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  const [ready, setReady] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const prod = PRODUCTS[p];
  const vals = useMemo(() => CITIES.map((c) => scoreAt(prod, c.id, 0)), [prod]);
  const order = useMemo(() => CITIES.map((_, i) => i).sort((a, b) => vals[b] - vals[a]), [vals]);
  const ci = order[step % 3], city = CITIES[ci], v = vals[ci];
  const [now, next] = prod.scores[city.id], chg = Math.round(((next - now) / now) * 100);
  const { make, usual } = batch(prod, city.id);

  // the heat: blooms with the scroll, eases between products
  const L = useRef({ shown: null as Float32Array | null, target: new Float32Array(CITIES.length), gain: 0, raf: 0, kick: () => {} });
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const h = createHeat(el, 13), S = L.current;
    const tick = () => {
      S.raf = 0;
      if (!S.shown) S.shown = Float32Array.from(S.target);
      let moving = false;
      for (let i = 0; i < S.target.length; i++) {
        const dd = S.target[i] - S.shown[i];
        if (Math.abs(dd) > 0.05) { S.shown[i] += dd * (reduced() ? 1 : 0.08); moving = true; } else S.shown[i] = S.target[i];
      }
      h.draw(S.shown, S.gain);
      if (moving) S.raf = requestAnimationFrame(tick);
    };
    S.kick = () => { if (!S.raf) S.raf = requestAnimationFrame(tick); };
    const ro = new ResizeObserver(() => { h.resize(); S.kick(); });
    ro.observe(el);
    return () => { ro.disconnect(); cancelAnimationFrame(S.raf); S.raf = 0; S.kick = () => {}; };
  }, []);
  useEffect(() => { L.current.target.set(vals); L.current.kick(); }, [vals]);
  useEffect(() => {
    listen((k) => {
      const S = L.current, g = Math.min(1, Math.max(0, (k - 0.3) / 0.6));
      if (Math.abs(S.gain - g) > 0.004) { S.gain = g; S.kick(); }
      setReady((r) => (r ? k > 0.6 : k > 0.94));
    });
  }, [listen]);

  // the tour: three hottest cities, then the next product
  useEffect(() => {
    if (!active || !ready || held || reduced()) return;
    const id = window.setInterval(() => {
      setStep((s) => {
        if (s % 3 === 2) setP((q) => (q + 1) % PRODUCTS.length);
        return s + 1;
      });
    }, 2800);
    return () => window.clearInterval(id);
  }, [active, ready, held]);

  const pick = (i: number) => { setHeld(true); setP(i); setStep(0); };
  const onMap = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = VIEW.x + ((e.clientX - r.left) / r.width) * VIEW.w, y = VIEW.y + ((e.clientY - r.top) / r.height) * VIEW.h;
    const near = order.slice(0, 3).findIndex((i) => Math.hypot(CITIES[i].x - x, CITIES[i].y - y) < 70);
    if (near >= 0) { setHeld(true); setStep(near); }
  };

  const tv = useTween(v, 500), tm = useTween(make, 600);
  // the next four weeks for the city in focus, a smooth climb (or dip) with a little texture
  const weeks = [0, 0.25, 0.5, 0.75, 1].map((t, k) => scoreAt(prod, city.id, t) + (k % 2 ? 3 : -2) * (k && k < 4 ? 1 : 0));
  const lo = Math.min(...weeks) - 8, hi = Math.max(...weeks) + 3;
  const pts = weeks.map((w, k) => [k * 75, 70 - ((w - lo) / (hi - lo)) * 64] as const);
  const line = pts.map(([x, y], k) => (k ? `S${x - 37.5} ${y} ${x} ${y}` : `M${x} ${y}`)).join('');

  return (
    <div className="bdg">
      <Tile area="map" tone="bdg-dark" from={[-150, 90, -6]} d={0} label="Café demand index across India">
        <div className="bdg-map" onPointerLeave={() => setHeld(false)}>
          <div className="bdg-map-head">
            <small><i />Café Demand Index</small>
            <div className="bdg-pills" role="group" aria-label="Product">
              {PRODUCTS.map((q, i) => (
                <button key={q.id} type="button" className={i === p ? 'is-on' : ''} aria-pressed={i === p} onClick={() => pick(i)}>{q.short}</button>
              ))}
            </div>
          </div>
          <div className="bdg-mapbox" onPointerMove={onMap}>
            <svg className="bdg-layer" viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} aria-hidden="true">
              <defs><pattern id="bdg-dots" width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="6.5" cy="6.5" r="1.7" /></pattern></defs>
              <path className="bdg-land" d={INDIA.d} />
              <path d={INDIA.d} fill="url(#bdg-dots)" />
            </svg>
            <canvas ref={canvas} className="bdg-layer bdg-heat" aria-hidden="true" />
            <svg className="bdg-layer bdg-edge" viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} aria-hidden="true"><path d={INDIA.d} /></svg>
            <span className={`bdg-pin${city.x > VIEW.x + VIEW.w * 0.55 ? ' is-l' : ''}`} style={{ ...at(city.x, city.y), '--c': heat(v, 0.2) } as Vars} aria-hidden="true">
              <i className="bdg-ring" /><i className="bdg-core" /><span>{city.name}</span>
            </span>
          </div>
          <div className="bdg-scale" aria-hidden="true"><span>Low</span><i style={{ background: RAMP }} /><span>Peak</span></div>
        </div>
      </Tile>

      <Tile area="read" tone="bdg-pur" from={[140, -90, 7]} d={0.1} label={`${city.name}: index ${Math.round(v)}`}>
        <div className="bdg-read" aria-live={held ? 'polite' : 'off'}>
          <small>{prod.short} · {city.name}</small>
          <b>{Math.round(tv)}</b>
          <span className="bdg-band">{bandOf(v).label} demand</span>
          <span className="bdg-trend">{chg > 2 ? `↗ Rising ${chg}% in 4 weeks` : chg < -2 ? `↘ Easing ${-chg}% in 4 weeks` : '→ Holding steady'}</span>
        </div>
      </Tile>

      <Tile area="rank" tone="bdg-lav" from={[170, 40, -8]} d={0.2} label={`Hottest cities for ${prod.short}`}>
        <div className="bdg-rank">
          <small>Hottest for {prod.short.toLowerCase()}</small>
          {order.slice(0, 3).map((i, r) => (
            <button key={CITIES[i].id} type="button" className={i === ci ? 'is-on' : ''} style={{ '--k2': vals[i] / 300 } as Vars} onClick={() => { setHeld(true); setStep(r); }}>
              <span>{CITIES[i].name}</span><i /><b>{Math.round(vals[i])}</b>
            </button>
          ))}
        </div>
      </Tile>

      <Tile area="wave" tone="bdg-lav" from={[-90, 140, 5]} d={0.28} label="Demand over the next four weeks">
        <div className="bdg-wave">
          <div className="bdg-wave-top"><small>Next 4 weeks · {city.name}</small><b>{chg > 0 ? '+' : ''}{chg}%</b></div>
          <svg viewBox="-4 -4 308 82" preserveAspectRatio="none" aria-hidden="true">
            <path className="bdg-area" d={`${line}L300 78L0 78Z`} />
            <path className="bdg-line" d={line} />
          </svg>
          <div className="bdg-weeks" aria-hidden="true"><span>Now</span><span>+1</span><span>+2</span><span>+3</span><span>+4 wks</span></div>
        </div>
      </Tile>

      <Tile area="waste" tone="bdg-pur" from={[120, 150, -10]} d={0.36} label={`Next month: make ${make} litres, not ${usual}`}>
        <div className="bdg-waste">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle className="r0" cx="50" cy="50" r="40" />
            <circle className="r1" cx="50" cy="50" r="40" pathLength={100} style={{ strokeDasharray: `${(make / usual) * 100} 100` }} />
          </svg>
          <small>Next month</small>
          <b>{fmt(tm)} L</b>
          <span>not {fmt(usual)} · −{Math.round((1 - make / usual) * 100)}% waste</span>
        </div>
      </Tile>
    </div>
  );
}
