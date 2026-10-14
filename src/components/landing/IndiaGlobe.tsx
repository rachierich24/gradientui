'use client';
// "Across India": the network on a violet globe rising from the footer line, India at the centre.
// The globe itself only hovers; "Explore network" (or a click on the globe) opens the India
// explorer with the map, hubs and stats.
// Engine: ./india-globe.ts · Explorer: ./IndiaExplorer.tsx · Styles: app/india-globe.css
import { useCallback, useEffect, useRef, useState } from 'react';
import { createIndiaGlobe, type GlobeNode } from './india-globe';
import { IndiaExplorer } from './IndiaExplorer';
import { loadG365 } from './g365-scripts';

export function IndiaGlobe() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<ReturnType<typeof createIndiaGlobe> | null>(null);

  const [explore, setExplore] = useState<{ open: boolean; city: GlobeNode | null }>({ open: false, city: null });
  const openExplorer = useCallback((city: GlobeNode | null) => setExplore({ open: true, city }), []);
  const closeExplorer = useCallback(() => setExplore((x) => ({ ...x, open: false })), []);

  useEffect(() => {
    const root = rootRef.current,
      canvas = canvasRef.current;
    if (!root || !canvas) return;
    let alive = true;

    // three.js (self-hosted, shared with the hero) powers the WebGL Earth; if it fails to load,
    // the engine falls back to its 2D surface
    Promise.all([
      fetch('/g365/land-720x360.bin').then((r) => r.arrayBuffer()),
      loadG365(['three.min.js']).catch(() => {}),
    ])
      .then(([buf]) => {
        if (!alive) return;
        api.current = createIndiaGlobe({
          root,
          canvas,
          mask: new Uint8Array(buf),
          onFocus: () => {},
          onLive: () => {},
          onExplore: openExplorer,
        });
      })
      .catch(() => {});

    return () => {
      alive = false;
      api.current?.destroy();
      api.current = null;
    };
  }, [openExplorer]);

  return (
    <section className="l-sec ig" id="across-india" aria-labelledby="ig-title">
      {/* One screen: headline over the sky, the globe rising beneath it */}
      <div
        className="ig-stage"
        ref={rootRef}
        tabIndex={0}
        aria-label="Globe of the Gradient network across India. Press Enter to open the India explorer."
      >
        <canvas
          className="ig-canvas"
          ref={canvasRef}
          aria-hidden="true"
        />

        {/* Headline over the sky: the globe's curve starts just below it (measured by the engine) */}
          <div className="ig-header">
            <h2 id="ig-title">
              <span className="ig-line1">Nationwide supply infrastructure, connected in real time.</span>
              <span className="ig-line2 ig-white-text">Direct fulfillment from verified brands to local café counters.</span>
            </h2>

            <p className="ig-subtitle">
              16 hub cities and 1,200+ partner outlets — powering automated replenishment and zero-stockout logistics.
            </p>

            <div className="ig-metrics-strip" aria-label="Network stats">
              <div className="ig-metric-chip">
                <span className="ig-metric-val">16</span>
                <span className="ig-metric-lbl">Active Hubs</span>
              </div>
              <div className="ig-metric-div" />
              <div className="ig-metric-chip">
                <span className="ig-metric-val">14,200+</span>
                <span className="ig-metric-lbl">Daily Signals</span>
              </div>
              <div className="ig-metric-div" />
              <div className="ig-metric-chip">
                <span className="ig-metric-val">T+7</span>
                <span className="ig-metric-lbl">Settlement SLA</span>
              </div>
              <div className="ig-metric-div" />
              <div className="ig-metric-chip">
                <span className="ig-metric-val">99.8%</span>
                <span className="ig-metric-lbl">On-Time Sync</span>
              </div>
            </div>
          </div>

        <div className="ig-ctl" data-globe-ui>
          <button type="button" className="ig-start" onClick={() => openExplorer(null)}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 1.5v13M1.5 8h13M3.4 3.4l9.2 9.2M12.6 3.4l-9.2 9.2" />
            </svg>
            <span>Explore network</span>
          </button>
        </div>
      </div>

      <IndiaExplorer open={explore.open} initial={explore.city} onClose={closeExplorer} />
    </section>
  );
}
