'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // lerp and duration are mutually exclusive in Lenis — use lerp alone for a
    // smooth-but-responsive follow. Higher wheelMultiplier = more travel per
    // wheel notch, so less hand-scrolling to move down the page.
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1.3,
      touchMultiplier: 1.5,
    });
    // Expose so sections can freeze/resume smooth scroll (e.g. the stats graph
    // locks scroll while its count-up + curve draw plays). body{overflow:hidden}
    // alone does NOT stop Lenis — its virtual scroll keeps running.
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);

  return <>{children}</>;
}
