'use client';
// "Across India": the network on a dotted globe, just above the footer. Hub cities route into
// the Delhi NCR core. Hover is a lens and city cards; a click takes control so the globe can
// be rotated, zoomed and flown city to city. Night and Day themes; the choice is remembered.
// The canvas engine lives in ./india-globe.ts. Styles: app/india-globe.css
import { useEffect, useRef, useState } from 'react';
import { createIndiaGlobe, kmBetween, CORE, SIDE_COLOR, type GlobeNode, type GlobeTheme } from './india-globe';

const SIDE = {
  cafe: { tag: 'Café hub', line: 'Cafés order ahead and restock from every supplier in one cart.' },
  supply: { tag: 'Supplier hub', line: 'Suppliers publish catalogues, sync stock and dispatch to cafés.' },
  brand: { tag: 'Brand hub', line: 'Brands place trials with cafés and track sell-through.' },
  core: { tag: 'Gradient core', line: 'Where Gradient is built. Every route on the map ends here.' },
};
const THEME_KEY = 'g365-globe-theme';

export function IndiaGlobe() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const api = useRef<ReturnType<typeof createIndiaGlobe> | null>(null);
  const [node, setNode] = useState<GlobeNode | null>(null);
  const [live, setLive] = useState(false);
  const [theme, setTheme] = useState<GlobeTheme>('night');
  const themeRef = useRef(theme);

  useEffect(() => {
    try { const t = localStorage.getItem(THEME_KEY); if (t === 'day' || t === 'night') setTheme(t); } catch {}
  }, []);

  useEffect(() => {
    themeRef.current = theme;
    api.current?.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    const root = rootRef.current, canvas = canvasRef.current, card = cardRef.current;
    if (!root || !canvas || !card) return;
    let alive = true;
    fetch('/g365/land-720x360.bin')
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        if (!alive) return;
        api.current = createIndiaGlobe({
          root, canvas, card, mask: new Uint8Array(buf), theme: themeRef.current, onFocus: setNode, onLive: setLive,
        });
      })
      .catch(() => {});
    return () => { alive = false; api.current?.destroy(); api.current = null; };
  }, []);

  const pick = (t: GlobeTheme) => {
    setTheme(t);
    try { localStorage.setItem(THEME_KEY, t); } catch {}
  };
  const side = node ? SIDE[node.side] : null;
  const color = node && node.side !== 'core' ? SIDE_COLOR[node.side] : undefined;

  return (
    <section className={`l-sec ig is-${theme}`} id="across-india" aria-labelledby="ig-title">
      <div className="l-wrap">
        <div
          className={`ig-panel${live ? ' is-live' : ''}`}
          ref={rootRef}
          tabIndex={0}
          aria-label="Interactive globe of the Gradient network across India. Press Enter to rotate it with the arrow keys, Escape to let go."
        >
          <canvas className="ig-canvas" ref={canvasRef} aria-hidden="true" />

          <div className="ig-copy">
            <span className="ig-eyebrow">The Gradient intersystem · India</span>
            <h2 id="ig-title">From Delhi NCR <span>to every café counter.</span></h2>
            <p>Cafés, suppliers and brands in every city trade over one system. Orders, stock and visits travel to the side that needs them.</p>
          </div>

          <div className="ig-mode" role="group" aria-label="Globe theme" data-globe-ui>
            <button type="button" aria-pressed={theme === 'night'} onClick={() => pick('night')}>Night</button>
            <button type="button" aria-pressed={theme === 'day'} onClick={() => pick('day')}>Day</button>
          </div>

          <div className="ig-ctl" data-globe-ui>
            {live ? (
              <>
                <span>Drag to rotate · scroll to zoom</span>
                <button type="button" onClick={() => api.current?.recenter()}>Recenter</button>
                <button type="button" className="is-primary" onClick={() => api.current?.setLive(false)}>Done</button>
              </>
            ) : (
              <button type="button" className="ig-start" onClick={() => api.current?.setLive(true)}>
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5v13M1.5 8h13M3.4 3.4l9.2 9.2M12.6 3.4l-9.2 9.2" /></svg>
                Click to explore the network
              </button>
            )}
          </div>

          <div className="ig-card" ref={cardRef} role="status" aria-live="polite" style={{ '--c': color } as React.CSSProperties}>
            {node && side && (
              <>
                <span className="ig-card-tag"><i />{side.tag}</span>
                <strong>{node.name}</strong>
                <p>{side.line}</p>
                {node !== CORE && <span className="ig-card-km">{kmBetween(node.at, CORE.at).toLocaleString('en-IN')} km to Delhi NCR</span>}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
