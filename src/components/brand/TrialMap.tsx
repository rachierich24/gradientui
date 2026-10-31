'use client';
// The live map inside the brand dashboard (BrandDashboard.tsx): Delhi NCR as a field of dots, the 9
// suppliers as small squares and the 120 cafés in the trial as faint rings. Nothing here re-renders as the
// trial plays; the moving parts are CSS reading --day from the dashboard. Each kit's route draws itself from
// its supplier while the kit is on the way, with a bright dot riding its front, and each café fills in as
// it's delivered, tried and rated, then lights up when it starts ordering every week. `sx` stretches the
// city to the panel and `ms` sizes the markers (see mapFit). The named cafés and the suppliers report hover
// and focus through onPoint, and `hot` lights up the one being looked at, with its routes.
// It's three stacked SVGs on their own layers, so scrolling never repaints the city's thousands of dots
// and the named cafés' pulses never repaint the rest: the city (still), the trial (moves with the day) and
// the pulses (always moving). Styles: app/brand/brand-dashboard.css
import { memo, useMemo, type CSSProperties, type SyntheticEvent } from 'react';
import { CAFES, HUBS, mapGeometry } from './trial-data';

export type MapPoint = { kind: 'cafe' | 'hub'; id: number; el: Element } | null;
export type MapHot = { kind: 'cafe' | 'hub'; id: number } | null;
type Geometry = ReturnType<typeof mapGeometry>;

const vars = (v: Record<string, number>) => v as CSSProperties;
const NAMED = CAFES.filter((c) => c.name);

const City = memo(function City({ g }: { g: Geometry }) {
  return (
    <svg className="bdm bdm-city" viewBox={g.viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <pattern id="bdm-grain" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="0.8" /></pattern>
        <radialGradient id="bdm-land" cx="50%" cy="46%" r="60%">
          <stop offset="0" stopColor="#8B5CF6" stopOpacity="0.3" />
          <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.03" />
        </radialGradient>
        {/* the dots thin out toward the city's edge */}
        <radialGradient id="bdm-fade-g" cx="50%" cy="48%" r="58%">
          <stop offset="0.45" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.15" />
        </radialGradient>
        <mask id="bdm-fade" maskContentUnits="userSpaceOnUse"><path d={g.land} fill="url(#bdm-fade-g)" /></mask>
      </defs>
      <path d={g.land} className="bdm-land" />
      <path d={g.land} className="bdm-grain" mask="url(#bdm-fade)" />
      <path d={g.land} className="bdm-coast" />
      {g.lakes.map((l) => (
        <ellipse key={`${l.cx}-${l.cy}`} className="bdm-lake" cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} transform={`rotate(${l.rot} ${l.cx} ${l.cy})`} />
      ))}
      <ellipse className="bdm-road" cx={g.road.cx} cy={g.road.cy} rx={g.road.rx} ry={g.road.ry} />
      {g.areas.map((a) => <text key={a.name} className="bdm-area" x={a.x} y={a.y}>{a.name}</text>)}
    </svg>
  );
});

const Pulses = memo(function Pulses({ g, ms }: { g: Geometry; ms: number }) {
  return (
    <svg className="bdm bdm-pulses" viewBox={g.viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {NAMED.filter((c) => c.o !== null).map((c) => (
        <g key={c.id} className="c-live" transform={`translate(${g.cafes[c.id].x} ${g.cafes[c.id].y})`} style={vars({ '--o': c.o! })}>
          <circle className="c-pulse" r={Math.round(4.6 * ms * 10) / 10} />
        </g>
      ))}
    </svg>
  );
});

type Props = { sx: number; ms: number; hot: MapHot; onPoint: (p: MapPoint) => void };

export const TrialMap = memo(function TrialMap({ sx, ms, hot, onPoint }: Props) {
  const g = useMemo(() => mapGeometry(sx), [sx]);
  const r = (v: number) => Math.round(v * ms * 10) / 10;
  const pick = (e: SyntheticEvent) => {
    const el = (e.target as Element).closest?.('[data-cafe],[data-hub]');
    if (!el) return onPoint(null);
    const cafe = el.getAttribute('data-cafe');
    onPoint(cafe !== null ? { kind: 'cafe', id: Number(cafe), el } : { kind: 'hub', id: Number(el.getAttribute('data-hub')), el });
  };
  // a hovered supplier lights its routes and cafés; a hovered café lights its own route
  const lit = (c: (typeof CAFES)[number]) => !!hot && (hot.kind === 'hub' ? c.hub === hot.id : c.id === hot.id);

  return (
    <>
      <City g={g} />
      <svg
        className={`bdm bdm-trial${hot ? ' has-hot' : ''}`}
        viewBox={g.viewBox}
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label={`Map of the trial: ${CAFES.length} cafés and ${HUBS.length} suppliers across Delhi NCR`}
        onPointerOver={pick}
        onPointerLeave={() => onPoint(null)}
        onFocus={pick}
        onBlur={() => onPoint(null)}
      >
        <defs>
          <radialGradient id="bdm-glow">
            <stop offset="0" stopColor="#D9C8FF" stopOpacity="0.95" />
            <stop offset="0.3" stopColor="#A47CFF" stopOpacity="0.5" />
            <stop offset="1" stopColor="#7C4DDB" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bdm-hub-glow">
            <stop offset="0" stopColor="#C4A8FF" stopOpacity="0.55" />
            <stop offset="1" stopColor="#7C4DDB" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="bdm-routes">
          {CAFES.map((c) => <path key={c.id} d={g.cafes[c.id].route} pathLength={1} className={lit(c) ? 'is-hot' : undefined} style={vars({ '--s': c.ship, '--d': c.d })} />)}
        </g>
        <g className="bdm-kits" style={{ strokeWidth: r(3.4) }}>
          {CAFES.map((c) => <path key={c.id} d={g.cafes[c.id].route} pathLength={1} style={vars({ '--s': c.ship, '--d': c.d })} />)}
        </g>

        <g className="bdm-hubs">
          {HUBS.map((h, i) => (
            <g key={h.name} className={`bdm-hub${hot?.kind === 'hub' && hot.id === i ? ' is-hot' : ''}`} data-hub={i} transform={`translate(${g.hubs[i].x} ${g.hubs[i].y})`}>
              <circle className="h-glow" r={r(18)} />
              <rect x={-r(4.5)} y={-r(4.5)} width={r(9)} height={r(9)} rx={r(2.4)} />
              <circle className="h-core" r={r(1.5)} />
              <circle className="h-hit" r={r(11)} />
            </g>
          ))}
        </g>

        <g className="bdm-cafes">
          {CAFES.map((c) => (
            <g
              key={c.id}
              className={`bdm-cafe${c.name ? ' is-named' : ''}${lit(c) ? ' is-hot' : ''}`}
              transform={`translate(${g.cafes[c.id].x} ${g.cafes[c.id].y})`}
              style={vars({ '--d': c.d, '--t': c.t ?? 99, '--r': c.r ?? 99, '--o': c.o ?? 99 })}
              {...(c.name ? { 'data-cafe': c.id, tabIndex: 0, role: 'button', 'aria-label': `${c.name}, ${c.area}` } : {})}
            >
              <circle className="c-glow" r={r(10)} />
              <circle className="c-ring" r={r(3)} />
              <circle className="c-dot" r={r(2.2)} />
              <circle className="c-try" r={r(2.3)} />
              <circle className="c-rate" r={r(2.5)} />
              <circle className="c-hot" r={r(2.4)} />
              {c.name && (
                <>
                  <circle className="c-mark" r={r(5.6)} />
                  <circle className="c-hit" r={r(11)} />
                </>
              )}
            </g>
          ))}
        </g>
      </svg>
      <Pulses g={g} ms={ms} />
    </>
  );
});
