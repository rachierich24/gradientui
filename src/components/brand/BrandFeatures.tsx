'use client';
// Built for brands, the section after the capabilities: what Gradient does for a brand, in four chapters you
// scroll through. The stage pins for the length of the section. On the left, on dark: the chapter's headline
// and line, and the four chapters as a list, the current one lit with a line that fills as you go (each one
// jumps to its chapter). On the right, on a light dotted canvas: the chapter's picture, which assembles itself
// as you scroll into the chapter and lifts away as you leave it (the pictures are in ./feature-scenes.tsx).
//   1. Know where it'll sell: a bento grid around the heat map of India (./demand-bento.tsx)
//   2. Reach café owners directly: no cold calls
//   3. Trial kits, tracked to the cup
//   4. Your field team, without the field team: the network
// On a phone nothing pins: each chapter is its headline, then its picture, which assembles as it scrolls up.
// With reduced motion every picture is simply there. Styles: app/brand/brand-features.css
import { useEffect, useMemo, useRef, useState } from 'react';
import { reduced } from './shared';
import { KitScene, NetworkScene, ReachScene, type Vars } from './feature-scenes';
import { DemandBento } from './demand-bento';

const CHAPTERS = [
  {
    id: 'demand', label: 'Demand map', title: 'Know where it’ll sell.',
    text: 'A demand index for every city, read each week from what cafés actually order. Launch where it runs hot, and make just enough of it.',
  },
  {
    id: 'reach', label: 'Direct reach', title: 'Reach café owners directly.',
    text: 'No cold calls, no samples that go quiet. Pick the cafés that fit your product and put it in front of their owners, in the Gradient app they already order from.',
  },
  {
    id: 'kits', label: 'Trial kits', title: 'Trial kits, tracked to the cup.',
    text: 'Kits ride with the suppliers your cafés already buy from. You see every one delivered, tried, rated and reordered.',
  },
  {
    id: 'network', label: 'The network', title: 'Your field team, without the field team.',
    text: 'Gradient’s network of suppliers and cafés does the legwork, from the first trial to the weekly order, and keeps you in the loop the whole way.',
  },
];
const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function BrandFeatures() {
  const sec = useRef<HTMLElement>(null);
  const scenes = useRef<(HTMLDivElement | null)[]>([]);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const heard = useRef<((k: number, u: number) => void)[]>([]);
  const listen = useMemo(() => CHAPTERS.map((_, i) => (fn: (k: number, u: number) => void) => { heard.current[i] = fn; }), []);
  const [act, setAct] = useState(0);
  const geo = useRef({ L: 1 });

  // Scroll: s runs from the moment the section's top is 60% of the way down the screen; each chapter takes an
  // equal share (L) of the rest. Within a chapter, u goes 0 → 1: the picture assembles over the first 45%
  // (--k), holds, and lifts away over the last 10% (--x) as the next one comes in.
  useEffect(() => {
    const el = sec.current;
    if (!el) return;
    const N = CHAPTERS.length;
    let raf = 0, last = -1;
    const frame = () => {
      raf = 0;
      const r = el.getBoundingClientRect(), V = window.innerHeight, wide = window.innerWidth > 980, still = reduced();
      const s = 0.6 * V - r.top, L = (r.height - 0.4 * V) / N;
      geo.current.L = L;
      let near = 0, nearD = Infinity;
      for (let i = 0; i < N; i++) {
        const sc = scenes.current[i];
        if (!sc) continue;
        let u = s / L - i;
        if (!wide) {
          const b = sc.getBoundingClientRect();
          u = (0.95 * V - b.top) / (0.75 * V);
          const d = Math.abs(b.top + b.height / 2 - V / 2);
          if (d < nearD) { nearD = d; near = i; }
        }
        const k = still ? (u > -0.25 ? 1 : 0) : clamp(u / 0.45);
        sc.style.setProperty('--k', k.toFixed(4));
        sc.style.setProperty('--u', (still ? 1 : clamp(u)).toFixed(4));
        sc.style.setProperty('--x', (wide && i < N - 1 ? clamp((u - 0.9) / 0.1) : 0).toFixed(4));
        heard.current[i]?.(k, still ? 1 : clamp(u));
        items.current[i]?.style.setProperty('--p', clamp(u).toFixed(4));
      }
      const a = wide ? Math.min(N - 1, Math.max(0, Math.floor(s / L))) : near;
      if (a !== last) { last = a; setAct(a); }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    kick();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', kick); window.removeEventListener('resize', kick); };
  }, []);

  // The pictures are drawn on a fixed board, scaled to fit the canvas (or, on a phone, the screen's width)
  useEffect(() => {
    const el = sec.current, box = scenes.current[0];
    if (!el || !box) return;
    const fit = () => {
      const wide = window.innerWidth > 980, w = box.clientWidth, h = box.clientHeight;
      const f = wide ? Math.min(w / 680, h / 680, 1.2) : Math.min(w / 400, 1.2);
      el.style.setProperty('--fit', f.toFixed(4));
      window.dispatchEvent(new Event('bfx-fit'));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  const go = (i: number) => {
    const el = sec.current;
    if (!el) return;
    const V = window.innerHeight, top = el.getBoundingClientRect().top + window.scrollY - 0.6 * V + (i + 0.5) * geo.current.L;
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: number, o?: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(top, { duration: 1.2 }); else window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <section ref={sec} className="bfx" id="features" aria-labelledby="bfx-title" style={{ '--n': CHAPTERS.length } as Vars}>
      <div className="bfx-stage">
        <div className="bfx-eye">
          <span>Built for brands</span>
          <h2 id="bfx-title" className="bfx-sr">What Gradient does for your brand</h2>
        </div>

        {CHAPTERS.map((c, i) => (
          <div key={c.id} className="bfx-chap">
            <div className={`bfx-text${i === act ? ' is-on' : ''}`}>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
            <div ref={(n) => { scenes.current[i] = n; }} className={`bfx-scene bfx-s-${c.id}${i === act ? ' is-on' : ''}`}>
              <div className="bfx-art">
                {i === 0 ? <DemandBento active={i === act} listen={listen[i]} /> : i === 1 ? <ReachScene /> : i === 2 ? <KitScene /> : <NetworkScene />}
              </div>
            </div>
          </div>
        ))}

        <ol className="bfx-list" aria-label="Chapters">
          {CHAPTERS.map((c, i) => (
            <li key={c.id} ref={(n) => { items.current[i] = n; }} className={i === act ? 'is-on' : ''}>
              <button type="button" onClick={() => go(i)} aria-current={i === act ? 'step' : undefined}>
                <em>{String(i + 1).padStart(2, '0')}</em>
                <span>{c.label}</span>
                <i aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>

        <p className="bfx-foot">Sample figures · names are illustrative</p>
      </div>
    </section>
  );
}
