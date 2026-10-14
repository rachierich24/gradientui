'use client';
// The India explorer: opens from the globe's "Explore network" button (or a click on the globe).
// India at night from orbit (the globe's NASA imagery: gold city lights inside India's official
// outline), every hub and its route into Delhi NCR, counts by hub type, and a card for the selected city. Closes with ×, Escape or a click outside. Styles: app/india-globe.css
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CORE, NODES, kmBetween, INDIA_MASK, IM_W, IM_H, IM_STEP, IM_LAT, IM_LON, type GlobeNode, type Side } from './india-globe';

const KIND: Record<Side, { one: string; many: string; color: string }> = {
  core: { one: 'Gradient core', many: 'Core', color: '#FFC870' },
  cafe: { one: 'Café hub', many: 'Café hubs', color: '#FFAA55' },
  supply: { one: 'Supplier hub', many: 'Supplier hubs', color: '#7CC4FF' },
  brand: { one: 'Brand hub', many: 'Brand hubs', color: '#C9A2FF' },
  origin: { one: 'Coffee origin', many: 'Coffee origins', color: '#6EE7B7' },
};
const ORDER: Side[] = ['cafe', 'supply', 'brand', 'origin'];
const LAT0 = 6, LAT1 = 37.6, LON0 = 67, LON1 = 98, K = Math.cos(22 * Math.PI / 180);
const inMap = (n: GlobeNode) => n.at[0] >= LAT0 && n.at[0] <= LAT1 && n.at[1] >= LON0 && n.at[1] <= LON1;

const INDIA = NODES.filter(inMap);
const ABROAD = NODES.filter((n) => !inMap(n));

type Props = { open: boolean; initial: GlobeNode | null; onClose: () => void };

export function IndiaExplorer({ open, initial, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [selected, setSelected] = useState<GlobeNode>(CORE);
  const [hover, setHover] = useState<GlobeNode | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  // open / close with an exit animation; lock page scroll (Lenis too) while open
  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement;
      setSelected(initial ?? CORE); setClosing(false); setMounted(true);
      const lenis = (window as unknown as { lenis?: { stop: () => void } }).lenis;
      lenis?.stop(); document.documentElement.style.overflow = 'hidden';
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const id = setTimeout(() => {
      setMounted(false); setClosing(false);
      (window as unknown as { lenis?: { start: () => void } }).lenis?.start();
      document.documentElement.style.overflow = '';
      lastFocus.current?.focus?.();
    }, 260);
    return () => clearTimeout(id);
  }, [open, initial]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mounted || closing) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mounted, closing, onClose]);

  const counts = useMemo(() => ORDER.map((s) => ({ s, n: INDIA.filter((x) => x.side === s).length })), []);
  if (!mounted) return null;

  const k = KIND[selected.side];
  return createPortal(
    <div className={`igm${closing ? ' is-closing' : ''}`} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="igm-dialog" role="dialog" aria-modal="true" aria-labelledby="igm-title">
        <button type="button" className="igm-close" ref={closeRef} onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /></svg>
        </button>

        <div className="igm-map">
          <IndiaMap selected={selected} hover={hover} onHover={setHover} onSelect={setSelected} />
          <span className="igm-map-cap">India at night · routes into the Delhi NCR core · hover or tap a hub</span>
        </div>

        <div className="igm-side">
          <span className="igm-eyebrow">Gradient network · India</span>
          <h2 id="igm-title">{INDIA.length} hubs across India. One core in Delhi NCR.</h2>

          <div className="igm-counts">
            {counts.map(({ s, n }) => (
              <div key={s} style={{ '--c': KIND[s].color } as React.CSSProperties}>
                <strong>{n}</strong><span><i />{KIND[s].many}</span>
              </div>
            ))}
          </div>

          <article className="igm-card" key={selected.name} style={{ '--c': k.color } as React.CSSProperties}>
            <span className="igm-tag"><i />{k.one}</span>
            <h3>{selected.name}</h3>
            {selected.subtitle && <p>{selected.subtitle}</p>}
            <dl>
              {selected.metric && <div><dt>Signal</dt><dd>{selected.metric}</dd></div>}
              <div>
                <dt>{selected === CORE ? 'Routes in' : 'To Delhi NCR'}</dt>
                <dd>{selected === CORE ? `${NODES.length} routes` : `${kmBetween(selected.at, CORE.at).toLocaleString('en-IN')} km`}</dd>
              </div>
            </dl>
          </article>

          <div className="igm-list">
            {ORDER.map((s) => (
              <section key={s}>
                <h4>{KIND[s].many}</h4>
                <div>
                  {INDIA.filter((n) => n.side === s).map((n) => (
                    <button key={n.name} type="button" aria-pressed={selected === n} style={{ '--c': KIND[s].color } as React.CSSProperties}
                      onClick={() => setSelected(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(null)}>
                      <i />{n.name}
                    </button>
                  ))}
                </div>
              </section>
            ))}
            {ABROAD.length > 0 && (
              <section>
                <h4>International corridors</h4>
                <div>
                  {ABROAD.map((n) => (
                    <button key={n.name} type="button" aria-pressed={selected === n} style={{ '--c': KIND[n.side].color } as React.CSSProperties} onClick={() => setSelected(n)}>
                      <i />{n.name}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
          <p className="igm-note">Hub signals shown are illustrative.</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ---------- the map: India at night from orbit, routes with slow pulses, glowing pins ---------- */

const IMG = { day: '/g365/earth/day-2048.jpg', night: '/g365/earth/night-4096.jpg' };

function IndiaMap({ selected, hover, onHover, onSelect }: {
  selected: GlobeNode; hover: GlobeNode | null; onHover: (n: GlobeNode | null) => void; onSelect: (n: GlobeNode) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef({ selected, hover });
  state.current = { selected, hover };

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // India's official outline as a tiny white-on-transparent image, scaled up smoothly when used
    const bits = Uint8Array.from(atob(INDIA_MASK), (c) => c.charCodeAt(0));
    const maskCv = document.createElement('canvas');
    maskCv.width = IM_W; maskCv.height = IM_H;
    const md = maskCv.getContext('2d')!.createImageData(IM_W, IM_H);
    for (let n = 0; n < IM_W * IM_H; n++) {
      const on = (bits[n >> 3] >> (n & 7)) & 1;
      md.data[n * 4] = md.data[n * 4 + 1] = md.data[n * 4 + 2] = 255; md.data[n * 4 + 3] = on * 255;
    }
    maskCv.getContext('2d')!.putImageData(md, 0, 0);

    // The same NASA imagery as the globe (already in the browser cache by now)
    const imgs = { day: new Image(), night: new Image() };
    let ready = 0, readyAt = -1;
    const onImg = () => { if (++ready === 2) { paintLayer(); readyAt = performance.now(); } };
    imgs.day.onload = onImg; imgs.night.onload = onImg;
    imgs.day.src = IMG.day; imgs.night.src = IMG.night;

    let W = 0, H = 0, DPR = 1, scale = 1, ox = 0, oy = 0, raf = 0;
    const layer = document.createElement('canvas');
    const xy = (lat: number, lon: number) => [ox + (lon - LON0) * K * scale, oy + (LAT1 - lat) * scale] as const;
    const off = () => {
      const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
      return [c, c.getContext('2d')!] as const;
    };
    // the part of an equirectangular image that fills the canvas at the map's projection
    const crop = (img: HTMLImageElement) => {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const lonL = LON0 - ox / (K * scale), lonR = LON0 + (W - ox) / (K * scale), latT = LAT1 + oy / scale, latB = LAT1 - (H - oy) / scale;
      return [((lonL + 180) / 360) * iw, ((90 - latT) / 180) * ih, ((lonR - lonL) / 360) * iw, ((latT - latB) / 180) * ih] as const;
    };
    // a cheap bloom: shrink, then scale back up additively
    const bloom = (g: CanvasRenderingContext2D, src: HTMLCanvasElement, k: number, alpha: number) => {
      const s = document.createElement('canvas');
      s.width = Math.max(1, Math.ceil(src.width / k)); s.height = Math.max(1, Math.ceil(src.height / k));
      const sg = s.getContext('2d')!; sg.imageSmoothingQuality = 'high'; sg.drawImage(src, 0, 0, s.width, s.height);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.globalAlpha = alpha;
      g.imageSmoothingQuality = 'high'; g.drawImage(s, 0, 0, layer.width, layer.height); g.restore();
    };

    // Static layer: moonlit land, India's lights in gold with a bloom and a gold border,
    // faint cool lights elsewhere, and a vignette
    const paintLayer = () => {
      layer.width = cv.width; layer.height = cv.height;
      const g = layer.getContext('2d')!;
      g.setTransform(DPR, 0, 0, DPR, 0, 0);
      g.fillStyle = '#04060D'; g.fillRect(0, 0, W, H);
      if (ready < 2) return;

      g.drawImage(imgs.day, ...crop(imgs.day), 0, 0, W, H);
      g.globalCompositeOperation = 'multiply'; g.fillStyle = '#1A2136'; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'source-over';

      const [mx0, my0] = xy(IM_LAT, IM_LON), mw = IM_W * IM_STEP * K * scale, mh = IM_H * IM_STEP * scale;
      const [Mc, M] = off();
      M.setTransform(DPR, 0, 0, DPR, 0, 0); M.imageSmoothingQuality = 'high';
      M.drawImage(maskCv, mx0, my0, mw, mh);

      const [Lc, L] = off();
      L.setTransform(DPR, 0, 0, DPR, 0, 0); L.drawImage(imgs.night, ...crop(imgs.night), 0, 0, W, H);

      const [Gc, G] = off();                                          // India: gold
      G.drawImage(Lc, 0, 0);
      G.globalCompositeOperation = 'multiply'; G.fillStyle = '#FFC468'; G.fillRect(0, 0, Gc.width, Gc.height);
      G.globalCompositeOperation = 'destination-in'; G.drawImage(Mc, 0, 0);

      const [Oc, O] = off();                                          // elsewhere: faint, cool
      O.drawImage(Lc, 0, 0);
      O.globalCompositeOperation = 'multiply'; O.fillStyle = '#8EA6D6'; O.fillRect(0, 0, Oc.width, Oc.height);
      O.globalCompositeOperation = 'destination-out'; O.drawImage(Mc, 0, 0);

      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.3; g.drawImage(Oc, 0, 0);
      g.globalAlpha = 1; g.drawImage(Gc, 0, 0); g.globalAlpha = 0.5; g.drawImage(Gc, 0, 0);
      g.restore();
      bloom(g, Gc, 8, 0.9);
      bloom(g, Gc, 24, 0.7);

      // gold border: the mask minus a slightly eroded copy of itself
      const [Ec, E] = off(), [Rc, Rg] = off(), px = Math.max(1, Math.round(1.4 * DPR));
      Rg.drawImage(Mc, 0, 0);
      Rg.globalCompositeOperation = 'destination-in';
      for (const [dx, dy] of [[px, 0], [-px, 0], [0, px], [0, -px]]) Rg.drawImage(Mc, dx, dy);
      E.drawImage(Mc, 0, 0);
      E.globalCompositeOperation = 'destination-out'; E.drawImage(Rc, 0, 0);
      E.globalCompositeOperation = 'source-in'; E.fillStyle = '#FFD58A'; E.fillRect(0, 0, Ec.width, Ec.height);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 0.75; g.drawImage(Ec, 0, 0); g.restore();
      bloom(g, Ec, 6, 0.8);

      const vig = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
      vig.addColorStop(0, 'rgba(2, 3, 8, 0)'); vig.addColorStop(1, 'rgba(2, 3, 8, 0.75)');
      g.fillStyle = vig; g.fillRect(0, 0, W, H);
    };
    const size = () => {
      DPR = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      const pad = 28, dw = (LON1 - LON0) * K, dh = LAT1 - LAT0;
      scale = Math.min((W - pad * 2) / dw, (H - pad * 2) / dh);
      ox = (W - dw * scale) / 2; oy = (H - dh * scale) / 2;
      paintLayer();
    };
    const ro = new ResizeObserver(size); ro.observe(cv); size();

    // glow sprites for pins and pulse heads
    const glows = new Map<string, HTMLCanvasElement>();
    const glow = (c: string) => {
      let s = glows.get(c);
      if (!s) {
        s = document.createElement('canvas'); s.width = s.height = 48;
        const sg = s.getContext('2d')!, r = sg.createRadialGradient(24, 24, 0, 24, 24, 24);
        r.addColorStop(0, c); r.addColorStop(0.3, c + 'AA'); r.addColorStop(1, c + '00');
        sg.fillStyle = r; sg.fillRect(0, 0, 48, 48); glows.set(c, s);
      }
      return s;
    };

    // routes: a curve from each hub into the core, each sending a slow pulse now and then
    const core = () => xy(...CORE.at);
    const routes = INDIA.map((n, i) => ({ n, start: -1, next: 0.6 + i * 0.45 + Math.random() * 2, dur: 3.2 + Math.random() * 1.6 }));
    const curve = (n: GlobeNode) => {
      const [x1, y1] = xy(...n.at), [x2, y2] = core(), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
      return { x1, y1, x2, y2, qx: mx - dy * 0.22, qy: my + dx * 0.22 };
    };
    const at = (c: ReturnType<typeof curve>, u: number) => {
      const a = (1 - u) ** 2, b = 2 * (1 - u) * u, d = u * u;
      return [a * c.x1 + b * c.qx + d * c.x2, a * c.y1 + b * c.qy + d * c.y2] as const;
    };
    const landings: number[] = [];

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const t = now / 1000, { selected: sel, hover: hov } = state.current, focus = hov || sel;
      const reveal = readyAt < 0 ? 0 : Math.min(1, (now - readyAt) / 700);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.globalAlpha = reveal; ctx.drawImage(layer, 0, 0); ctx.globalAlpha = 1;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      for (const r of routes) {
        const c = curve(r.n), lit = focus === r.n && focus !== CORE, color = KIND[r.n.side].color;
        ctx.lineCap = 'round';
        ctx.globalAlpha = focus === CORE || lit ? 1 : 0.5;
        ctx.strokeStyle = lit ? color : 'rgba(255, 205, 130, 0.26)'; ctx.lineWidth = lit ? 1.8 : 1;
        ctx.beginPath(); ctx.moveTo(c.x1, c.y1); ctx.quadraticCurveTo(c.qx, c.qy, c.x2, c.y2); ctx.stroke();
        if (!reduce) {
          if (r.start < 0 && t >= r.next) r.start = t;
          if (r.start >= 0) {
            const p = (t - r.start) / r.dur;
            if (p >= 1) { r.start = -1; r.next = t + 1.5 + Math.random() * 5; landings.push(t); if (landings.length > 6) landings.shift(); }
            else {
              const e = 0.5 - Math.cos(Math.PI * p) / 2;
              ctx.globalCompositeOperation = 'lighter';
              for (let j = 0; j < 14; j++) {
                const u0 = Math.max(0, e - 0.2 * (1 - j / 14)), u1 = Math.max(0, e - 0.2 * (1 - (j + 1) / 14));
                const [ax, ay] = at(c, u0), [bx, by] = at(c, u1);
                ctx.globalAlpha = (j / 14) ** 1.5; ctx.strokeStyle = color; ctx.lineWidth = 0.6 + 2 * (j / 14);
                ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
              }
              const [hx, hy] = at(c, e);
              ctx.globalAlpha = 1; ctx.drawImage(glow(color), hx - 9, hy - 9, 18, 18);
              ctx.globalCompositeOperation = 'source-over';
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      // pins: a coloured glow, a white core and a hairline ring
      for (const r of routes) {
        const [x, y] = xy(...r.n.at), color = KIND[r.n.side].color, on = focus === r.n;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = on ? 1 : 0.75; ctx.drawImage(glow(color), x - (on ? 16 : 11), y - (on ? 16 : 11), on ? 32 : 22, on ? 32 : 22);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        if (on) { ctx.globalAlpha = 0.55 + 0.3 * Math.sin(t * 3); ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
        ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, on ? 5 : 4, 0, 7); ctx.stroke();
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x, y, on ? 2.6 : 2, 0, 7); ctx.fill();
      }

      // core: a white-hot point in a gold halo, rippling as pulses land
      const [hx, hy] = core();
      for (const lt of landings) {
        const k = (t - lt) / 1.6;
        if (k < 0 || k >= 1) continue;
        ctx.globalAlpha = (1 - k) ** 2 * 0.8; ctx.strokeStyle = '#FFC870'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(hx, hy, 9 + k * 36, 0, 7); ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(glow('#FFC870'), hx - 30, hy - 30, 60, 60);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(255, 210, 140, 0.9)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(hx, hy, 7, 0, 7); ctx.stroke();
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(hx, hy, 3.6, 0, 7); ctx.fill();

      // labels: the core always, plus the focused hub, on a small dark-glass pill
      const label = (n: GlobeNode, x: number, y: number) => {
        ctx.font = '600 11px ui-monospace, "SF Mono", Menlo, monospace';
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0.08em';
        const text = n.name.toUpperCase(), w = ctx.measureText(text).width + 16;
        const lx = Math.min(W - w - 6, x + 12), ly = y - 24;
        ctx.fillStyle = 'rgba(8, 11, 22, 0.86)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(lx, ly, w, 20, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#F3F5FF'; ctx.fillText(text, lx + 8, ly + 14);
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      };
      label(CORE, hx, hy);
      if (focus !== CORE && inMap(focus)) { const [x, y] = xy(...focus.at); label(focus, x, y); }
    };
    raf = requestAnimationFrame(frame);

    const pick = (e: PointerEvent) => {
      const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
      let best: GlobeNode | null = null, bd = 16;
      for (const n of [CORE, ...INDIA]) { const [px, py] = xy(...n.at), d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = n; } }
      return best;
    };
    const move = (e: PointerEvent) => { const n = pick(e); cv.style.cursor = n ? 'pointer' : 'default'; onHover(n); };
    const leave = () => onHover(null);
    const click = (e: PointerEvent) => { const n = pick(e); if (n) onSelect(n); };
    cv.addEventListener('pointermove', move); cv.addEventListener('pointerleave', leave); cv.addEventListener('pointerup', click);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      imgs.day.onload = imgs.night.onload = null;
      cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerleave', leave); cv.removeEventListener('pointerup', click);
    };
  }, [onHover, onSelect]);

  return <canvas ref={ref} className="igm-canvas" role="img" aria-label="India at night from orbit, with Gradient hubs and their routes into Delhi NCR" />;
}
