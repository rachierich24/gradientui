'use client';
// A quiet particle field for behind the bento grid (after Magic UI's Particles): dots drift slowly, fade in
// near the edges, and lean toward the pointer, the lighter ones more than the heavier ones. Mostly ink, a few
// in brand green. Pauses off screen; drawn once, still, for reduced motion.
import { useEffect, useRef } from 'react';

type Dot = { x: number; y: number; tx: number; ty: number; r: number; a: number; ta: number; dx: number; dy: number; mg: number; green: boolean };

export function Particles({ className = '', density = 200, staticity = 46, ease = 60 }: {
  className?: string; density?: number; staticity?: number; ease?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current, cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    if (!wrap || !cv || !ctx) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // touch screens: the dots are soft and tiny, so 1× is enough, at about 30fps
    const coarse = matchMedia('(pointer: coarse)').matches;
    const dpr = coarse ? 1 : Math.min(2, window.devicePixelRatio || 1);
    const mouse = { x: 0, y: 0 };
    let W = 0, H = 0, raf = 0, dots: Dot[] = [];
    // The field spans the whole section (4,000px+ tall on a phone) but only a screen of it shows: each frame
    // clears and draws just that band. It's re-measured after a scroll or resize, never in the frame loop itself.
    let bandTop = 0, bandBot = 0, bandDirty = true, last = 0;
    const markBand = () => { bandDirty = true; };
    const measureBand = () => {
      const r = wrap.getBoundingClientRect();
      bandTop = Math.max(0, -r.top - 120);
      bandBot = Math.min(H, -r.top + window.innerHeight + 120);
      bandDirty = false;
    };

    const make = (): Dot => ({
      x: Math.random() * W, y: Math.random() * H, tx: 0, ty: 0,
      r: Math.random() < 0.8 ? 0.6 + Math.random() * 0.9 : 1.4 + Math.random() * 1.1,
      a: 0, ta: 0.18 + Math.random() * 0.5,
      dx: (Math.random() - 0.5) * 0.14, dy: (Math.random() - 0.5) * 0.14,
      mg: 0.1 + Math.random() * 4, green: Math.random() < 0.2,
    });
    const draw = (d: Dot) => {
      ctx.beginPath();
      ctx.arc(d.x + d.tx, d.y + d.ty, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.green ? `rgba(31, 169, 82, ${d.a})` : `rgba(18, 20, 19, ${d.a})`;
      ctx.fill();
    };
    const size = () => {
      W = wrap.clientWidth; H = wrap.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = `${W}px`; cv.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(density * Math.min(2, (W * H) / (1400 * 1400)));
      dots = Array.from({ length: n }, make);
      if (reduce) { ctx.clearRect(0, 0, W, H); dots.forEach((d) => { d.a = d.ta; draw(d); }); }
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (coarse && now - last < 30) return;
      last = now;
      if (bandDirty) measureBand();
      const y0 = bandTop, y1 = bandBot;
      if (y1 <= y0) return;
      ctx.clearRect(0, y0, W, y1 - y0);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const px = d.x + d.tx, py = d.y + d.ty;
        const edge = Math.min(px - d.r, W - px - d.r, py - d.r, H - py - d.r);
        const k = Math.max(0, Math.min(1, edge / 60));
        d.a = k >= 1 ? Math.min(d.ta, d.a + 0.015) : d.ta * k;
        d.x += d.dx; d.y += d.dy;
        d.tx += (mouse.x / (staticity / d.mg) - d.tx) / ease;
        d.ty += (mouse.y / (staticity / d.mg) - d.ty) / ease;
        if (d.x < -d.r || d.x > W + d.r || d.y < -d.r || d.y > H + d.r) { dots[i] = make(); continue; }
        if (py > y0 - 4 && py < y1 + 4) draw(d);
      }
    };
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left - W / 2, y = e.clientY - r.top - H / 2;
      if (Math.abs(x) < W / 2 && Math.abs(y) < H / 2) { mouse.x = x; mouse.y = y; }
    };

    size();
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      bandDirty = true;
      if (e.isIntersecting && !reduce) raf = requestAnimationFrame(frame);
    });
    io.observe(wrap);
    let rt: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => { size(); bandDirty = true; }, 200); });
    ro.observe(wrap);
    addEventListener('scroll', markBand, { passive: true });
    addEventListener('resize', markBand, { passive: true });
    if (!reduce) addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      io.disconnect();
      ro.disconnect();
      removeEventListener('scroll', markBand);
      removeEventListener('resize', markBand);
      removeEventListener('pointermove', onMove);
    };
  }, [density, staticity, ease]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
