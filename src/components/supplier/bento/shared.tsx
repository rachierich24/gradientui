'use client';
// Shared pieces for the supplier bento cards: timing hooks, number formatting, the smooth-curve helper,
// small icons, the mock app window and the frosted notification. Styles: app/supplier/bento.css
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';

export const EASE = [0.4, 0, 0.2, 1] as const;
export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
export const initials = (s: string) => s.split(' ').map((w) => w[0]).slice(0, 2).join('');
export const clock = (m: number) => `${(10 + Math.floor(m / 60)) % 24}:${String(m % 60).padStart(2, '0')}`;

export function useOnScreen<T extends Element>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, on] as const;
}

export function useEvery(ms: number, active: boolean, fn: () => void) {
  const cb = useRef(fn);
  cb.current = fn;
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => cb.current(), ms);
    return () => clearInterval(id);
  }, [ms, active]);
}

export function useCountUp(target: number, active: boolean, ms = 900) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (!active) { setV(target); from.current = target; return; }
    const start = performance.now(), a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / ms), e = 1 - Math.pow(1 - k, 3);
      setV(a + (target - a) * e);
      if (k < 1) raf = requestAnimationFrame(step);
      else from.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, ms]);
  return v;
}

// A card plays a short scripted sequence on loop, like a product film: phases advance on a timer while the
// card is on screen, and hold where they are when it isn't.
export function useScript<P extends string>(script: ReadonlyArray<readonly [P, number]>, run: boolean) {
  const [s, setS] = useState({ i: 0, loop: 0 });
  useEffect(() => {
    if (!run) return;
    const id = setTimeout(
      () => setS((p) => (p.i + 1 >= script.length ? { i: 0, loop: p.loop + 1 } : { i: p.i + 1, loop: p.loop })),
      script[s.i][1],
    );
    return () => clearTimeout(id);
  }, [run, s, script]);
  return { phase: script[s.i][0], loop: s.loop };
}

// monotone cubic curve through points (no overshoot), plus y at any x along it
export function monotone(pts: [number, number][]) {
  const n = pts.length;
  const ms: number[] = [], m: number[] = [];
  for (let i = 0; i < n - 1; i++) ms.push((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0]));
  m[0] = ms[0]; m[n - 1] = ms[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = ms[i - 1] * ms[i] <= 0 ? 0 : (ms[i - 1] + ms[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (ms[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / ms[i], b = m[i + 1] / ms[i], h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * ms[i]; m[i + 1] = t * b * ms[i]; }
  }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], h = (x1 - x0) / 3;
    d += `C${(x0 + h).toFixed(1)} ${(y0 + m[i] * h).toFixed(1)} ${(x1 - h).toFixed(1)} ${(y1 - m[i + 1] * h).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  const at = (x: number) => {
    let i = 0;
    while (i < n - 2 && x > pts[i + 1][0]) i++;
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], dx = x1 - x0, t = Math.min(1, Math.max(0, (x - x0) / dx));
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * dx * m[i] + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * dx * m[i + 1];
  };
  return { d, at };
}

export function GradientMark({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 28 28" width={size} height={size} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M7.68 8.31A8.5 8.5 0 0 1 20.32 8.31" /><path d="M22.08 11.37A8.5 8.5 0 0 1 15.77 22.31" /><path d="M12.23 22.31A8.5 8.5 0 0 1 5.92 11.37" />
      </g>
      <circle cx="14" cy="14" r="3" fill="currentColor" />
    </svg>
  );
}
export function Check() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
export function Pointer() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2.5v16.2l4.3-4.1 2.9 6.6 2.6-1.1-2.9-6.5 5.9-.3z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" /></svg>;
}
// a stroked 24×24 line icon
export function Glyph({ d, className }: { d: string; className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path d={d} /></svg>;
}

export function Window({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`sbx-window ${className}`}>
      <div className="sbx-chrome"><i /><i /><i /><span>{title}</span></div>
      {children}
    </div>
  );
}

export function Notif({ title, sub }: { title: string; sub: string }) {
  return (
    <motion.div
      className="sbx-notif"
      initial={{ opacity: 0, y: -18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 26, scale: 0.94, transition: { duration: 0.35, ease: EASE } }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
    >
      <span className="sbx-app"><GradientMark size={16} /></span>
      <span className="sbx-notif-tx">
        <span className="sbx-notif-meta"><b>Gradient</b><small>now</small></span>
        <b>{title}</b>
        <small>{sub}</small>
      </span>
    </motion.div>
  );
}
