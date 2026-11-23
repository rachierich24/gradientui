// The sphere's rings: concentric circles, a few with a lit arc sweeping round them. The centre card draws them
// around its middle; the side cards draw the same rings around that same centre (off their own edge, via
// .cbx-rings-left / .cbx-rings-right), so only the outer arcs show and the rings read as one across the row.
import type { CSSProperties } from 'react';

// radius px, lit-arc sweep time s (0 = no arc), direction
const RINGS: [number, number, 1 | -1][] = [
  [92, 0, 1], [150, 14, 1], [214, 22, -1], [288, 30, 1], [376, 0, 1], [470, 38, -1], [580, 0, 1],
];

export function Rings({ className = '' }: { className?: string }) {
  return (
    <div className={`cbx-rings ${className}`} aria-hidden="true">
      {RINGS.map(([r, t, dir], i) => (
        <i key={r} className={t ? 'is-lit' : undefined}
          style={{ '--r': `${r}px`, '--t': `${t}s`, '--dir': dir === 1 ? 'normal' : 'reverse', '--from': `${i * 67}deg`, '--o': Math.max(0.05, 0.17 - i * 0.017) } as CSSProperties} />
      ))}
    </div>
  );
}
