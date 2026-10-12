'use client';
// "Across India": the network on a delicate, chromatic point-cloud globe in pure white background.
// Centered composition with India prominently focused, slow-flowing energy streams,
// and floating trade transaction badges inspired by Attio & BVNK / Stripe.
// Engine: ./india-globe.ts · Styles: app/india-globe.css
import { useEffect, useRef, useState } from 'react';
import {
  createIndiaGlobe,
  kmBetween,
  CORE,
  SIDE_COLOR,
  type GlobeNode,
} from './india-globe';

const SIDE = {
  cafe: { tag: 'Café Hub', line: 'Cafés order ahead, manage stock and reorder from suppliers in one unified cart.' },
  supply: { tag: 'Supplier Hub', line: 'Suppliers publish catalogues, monitor warehouse inventory and fulfil POs.' },
  brand: { tag: 'Brand Hub', line: 'Brands place trials with premier cafés and monitor real-time sell-through.' },
  origin: { tag: 'Coffee Origin', line: 'Specialty Arabica & Robusta estates dispatching micro-lots to roasteries.' },
  core: { tag: 'Gradient Core', line: 'National routing engine in Delhi NCR. Every trade route connects here.' },
};

export function IndiaGlobe() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<ReturnType<typeof createIndiaGlobe> | null>(null);

  const [node, setNode] = useState<GlobeNode | null>(null);
  const [live, setLive] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const root = rootRef.current,
      canvas = canvasRef.current;
    if (!root || !canvas) return;
    let alive = true;

    fetch('/g365/land-720x360.bin')
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        if (!alive) return;
        api.current = createIndiaGlobe({
          root,
          canvas,
          mask: new Uint8Array(buf),
          onFocus: setNode,
          onLive: setLive,
        });
      })
      .catch(() => {});

    return () => {
      alive = false;
      api.current?.destroy();
      api.current = null;
    };
  }, []);

  useEffect(() => {
    const section = rootRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;

      // Calculate progress: 0 when section is below viewport, 1 when fully in view
      let progress = 0;
      if (sectionTop < windowHeight && sectionBottom > 0) {
        progress = Math.min(1, Math.max(0, (windowHeight - sectionTop) / (windowHeight + rect.height)));
      }
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Call once on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const side = node ? SIDE[node.side] : null;
  const color = node ? SIDE_COLOR[node.side] : undefined;

  return (
    <section className="l-sec ig" id="across-india" aria-labelledby="ig-title">
      <div className="l-wrap ig-outer">
        {/* Centered Attio-inspired headline & editorial copy */}
        <div className="ig-header">
          <div className="ig-badge">
            <span className="ig-badge-dot" aria-hidden="true" />
            <span>The Gradient Intersystem · All-India Network</span>
          </div>

          <h2 id="ig-title">
            Connecting India’s coffee trade. <br />
            <span className="ig-gradient-text">From origin to every café counter.</span>
          </h2>

          <p className="ig-subtitle">
            16 hub cities, 1,200+ cafés, and India’s premier roasters and suppliers — routed in real-time
            over one unified national supply network.
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
      </div>

      {/* Unboxed Celestial Half-Globe Stage - NO BOX around the globe */}
      <div
        className={`ig-stage${live ? ' is-live' : ''}`}
        ref={rootRef}
        tabIndex={0}
        aria-label="Interactive 3D half-globe of the Gradient network across India. Drag to inspect or click to zoom."
      >
        <canvas
          className="ig-canvas"
          ref={canvasRef}
          aria-hidden="true"
          style={{ opacity: scrollProgress }}
        />

          {/* Interactive controls */}
          <div className="ig-ctl" data-globe-ui>
            {live ? (
              <>
                <span className="ig-ctl-hint">Drag to rotate · Scroll to zoom</span>
                <button type="button" className="ig-btn" onClick={() => api.current?.recenter()}>
                  Recenter India
                </button>
                <button type="button" className="ig-btn is-primary" onClick={() => api.current?.setLive(false)}>
                  Done
                </button>
              </>
            ) : (
              <button type="button" className="ig-start" onClick={() => api.current?.setLive(true)}>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 1.5v13M1.5 8h13M3.4 3.4l9.2 9.2M12.6 3.4l-9.2 9.2" />
                </svg>
                <span>Explore Network</span>
              </button>
            )}
          </div>

        </div>
      </section>
    );
  }
