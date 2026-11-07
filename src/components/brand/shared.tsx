'use client';
// Small helpers shared by the Brand Portal sections.
import { useEffect, useRef, useState } from 'react';

export const reduced = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True once the element has been on screen (or while it is, with `stay` false). */
export function useOnScreen<T extends Element>(threshold = 0.25, stay = true) {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); if (stay) io.disconnect(); } else if (!stay) setOn(false);
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, stay]);
  return [ref, on] as const;
}

/** A number that eases to its new value whenever the value changes. */
export function useTween(target: number, ms = 600) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (reduced()) { setV(target); from.current = target; return; }
    const a = from.current, t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.max(0, Math.min(1, (now - t0) / ms)), e = 1 - (1 - k) ** 3;
      const x = a + (target - a) * e;
      from.current = x;
      setV(x);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { lenis?: { scrollTo: (t: HTMLElement) => void } }).lenis;
  if (lenis) lenis.scrollTo(el); else el.scrollIntoView({ behavior: 'smooth' });
}
