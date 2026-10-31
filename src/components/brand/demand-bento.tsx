'use client';
// Chapter 1 of the features section (BrandFeatures.tsx), "Know where it'll sell": the demand story as a bento
// grid that comes together as you scroll into the chapter. Three tiles fly in from around the canvas on the
// chapter's --k and lock into the grid: across the top, wide, the dashboard's live 3D map of the Delhi NCR trial
// (TrialMap3D.tsx), which plays day 1 to day 21 as you scroll through the chapter, just as it does in the
// dashboard; under it, the neighbourhood in focus (its index set large) and the hottest neighbourhoods. Once the
// grid stands the tiles tour on their own, product by product; pick a product, or point at a café or a
// neighbourhood, to take over, and the tour resumes once you've left the map.
// Styles: app/brand/brand-features.css (bdg-), the map's own in brand-dashboard.css
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { reduced, useTween } from './shared';
import { AREA_DEMAND, PRODUCTS, bandOf } from './demand-data';
import { AREAS, CAFES, DAYS } from './trial-data';
import type { MapSpot } from './TrialMap3D';

// the 3D map (and three.js with it) loads after the page
const TrialMap3D = dynamic(() => import('./TrialMap3D').then((m) => m.TrialMap3D), { ssr: false });
type Vars = CSSProperties & Record<`--${string}`, string | number>;
type Props = { active: boolean; listen: (fn: (k: number, u: number) => void) => void };
const AREA_OF = new Map(AREAS.map((a, i) => [a.name, i]));
const smooth = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k * k * (3 - 2 * k); };

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
  const [pointed, setPointed] = useState(-1);
  const [ready, setReady] = useState(false);
  const [calm, setCalm] = useState(false);
  const prod = PRODUCTS[p];
  const scores = AREA_DEMAND[prod.id];
  const vals = useMemo(() => scores.map((s) => s[0]), [scores]);
  const order = useMemo(() => vals.map((_, i) => i).sort((a, b) => vals[b] - vals[a]), [vals]);
  const held = pointed >= 0;
  const ci = held ? pointed : order[step % 3], area = AREAS[ci].name, v = vals[ci];
  const [now, next] = scores[ci], chg = Math.round(((next - now) / now) * 100);

  // the scroll is the trial's clock, as in the dashboard: day 1 as the chapter comes in, day 21 before it leaves
  const day = useRef(1);
  const clock = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapSpot>(null);
  useEffect(() => setCalm(reduced()), []);
  useEffect(() => {
    listen((k, u) => {
      day.current = 1 + (DAYS - 1) * smooth((u - 0.1) / 0.72);
      const el = clock.current, d = String(Math.max(1, Math.round(day.current)));
      if (el && el.dataset.day !== d) { el.dataset.day = d; el.style.setProperty('--t', String((+d - 1) / (DAYS - 1))); el.firstElementChild!.textContent = `Day ${d}`; }
      setReady((r) => (r ? k > 0.6 : k > 0.94));
    });
  }, [listen]);
  // pointing at a café on the map focuses its neighbourhood
  const onPoint = useCallback((s: MapSpot) => {
    setMap(s);
    if (s?.kind === 'cafe') setPointed(AREA_OF.get(CAFES[s.id].area) ?? -1);
  }, []);

  // the tour: three hottest neighbourhoods, then the next product
  useEffect(() => {
    if (!active || !ready || held || calm) return;
    const id = window.setInterval(() => {
      setStep((s) => {
        if (s % 3 === 2) setP((q) => (q + 1) % PRODUCTS.length);
        return s + 1;
      });
    }, 2800);
    return () => window.clearInterval(id);
  }, [active, ready, held, calm]);

  // picking a product holds its hottest neighbourhood until you leave the map
  const pick = (i: number) => {
    const s = AREA_DEMAND[PRODUCTS[i].id];
    setP(i); setStep(0); setPointed(s.reduce((b, x, j) => (x[0] > s[b][0] ? j : b), 0));
  };
  const tv = useTween(v, 500);

  return (
    <div className="bdg">
      <Tile area="map" tone="bdg-dark" from={[-150, 90, -6]} d={0} label="Café demand index across Delhi NCR">
        <div className="bdg-map" onPointerLeave={() => { setPointed(-1); setMap(null); }}>
          <TrialMap3D dayRef={day} filter={null} hot={map} spot={map?.kind === 'cafe' && CAFES[map.id].name ? map.id : null} still={calm} onPoint={onPoint} onFail={() => {}} />
          <div className="bdg-map-head">
            <small><i />Café Demand Index · Delhi NCR</small>
            <div className="bdg-pills" role="group" aria-label="Product">
              {PRODUCTS.map((q, i) => (
                <button key={q.id} type="button" className={i === p ? 'is-on' : ''} aria-pressed={i === p} onClick={() => pick(i)}>{q.short}</button>
              ))}
            </div>
          </div>
          <div ref={clock} className="bdg-clock" aria-hidden="true"><span>Day 1</span><i /><span>of {DAYS}</span></div>
        </div>
      </Tile>

      <Tile area="read" tone="bdg-pur" from={[-120, 120, 7]} d={0.12} label={`${area}: index ${Math.round(v)}`}>
        <div className="bdg-read" aria-live={held ? 'polite' : 'off'}>
          <small>{prod.short} · {area}</small>
          <b>{Math.round(tv)}</b>
          <span className="bdg-band">{bandOf(v).label} demand</span>
          <span className="bdg-trend">{chg > 2 ? `↗ Rising ${chg}% in 4 weeks` : chg < -2 ? `↘ Easing ${-chg}% in 4 weeks` : '→ Holding steady'}</span>
        </div>
      </Tile>

      <Tile area="rank" tone="bdg-lav" from={[170, 60, -8]} d={0.22} label={`Hottest neighbourhoods for ${prod.short}`}>
        <div className="bdg-rank" onPointerLeave={() => setPointed(-1)}>
          <small>Hottest for {prod.short.toLowerCase()}</small>
          {order.slice(0, 3).map((i) => (
            <button key={AREAS[i].name} type="button" className={i === ci ? 'is-on' : ''} style={{ '--k2': vals[i] / 220 } as Vars}
              onPointerEnter={() => setPointed(i)} onFocus={() => setPointed(i)} onBlur={() => setPointed(-1)} onClick={() => setPointed(i)}>
              <span>{AREAS[i].name}</span><i /><b>{Math.round(vals[i])}</b>
            </button>
          ))}
        </div>
      </Tile>
    </div>
  );
}
