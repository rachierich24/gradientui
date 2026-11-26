'use client';
// The supplier portal's hero. On wide screens a pinned scrub: the words fade up as the dashboard rises from the bottom
// of the screen into the centre, with the 3D packaging (three.js) at the sides. On a phone (768px and under) no pin and
// no 3D: the words, then the same dashboard, which rises into place as it scrolls up.
// The dashboard is HeroOrderBoard: one café order through six steps, in pictures, in a 16:9 window on every screen.
// This component owns its clock (which step, playing or paused; it only runs while on screen).
// Styles: app/supplier/supplier.css (hero), app/supplier/supplier-board.css (the board)
import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { GhostType } from '@/components/ui/ghost-type';
import { BorderBeam } from '@/components/ui/border-beam';
import DotGrid from '@/components/ui/DotGrid';
import { HeroOrderBoard, type BoardStage } from './HeroOrderBoard';

// three.js (~600 kB) stays out of the initial bundle; the scene mounts after hydration, on wide screens only.
const ThreePackagingScene = dynamic(
  () => import('./ThreePackagingScene').then((m) => m.ThreePackagingScene),
  { ssr: false },
);

// how long each step holds before the next (ms)
// (long enough for each moment to finish: the reply types out, the label lands, the van arrives, the bank pings)
const STEP_MS: Record<BoardStage, number> = { 1: 3100, 2: 3300, 3: 2900, 4: 3400, 5: 3800, 6: 3600 };

interface SupplierHeroSceneProps {
  onJoinClick?: () => void;
}

export function SupplierHeroScene({ onJoinClick }: SupplierHeroSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion() ?? false;

  // Scroll choreography (wide screens): the pinned dashboard rises from the bottom of the viewport into the centre
  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ['start start', 'end end'] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 95, damping: 26, mass: 0.25 });

  // Phones (768px and under): no pinned scrub, no 3D packaging (three.js isn't even downloaded there)
  const [phone, setPhone] = useState(false);
  const [show3d, setShow3d] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const set = () => { setPhone(mq.matches); setShow3d(!mq.matches); };
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  // On a phone the dashboard settles cleanly upright inside the first viewport
  const matRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: matP } = useScroll({ target: matRef, offset: ['start end', 'start 58%'] });
  const matK = useSpring(matP, { stiffness: 120, damping: 28, mass: 0.3 });
  const matY = useTransform(matK, (k) => (phone && !isReduced ? (1 - k) * 32 : 0));
  const matScale = useTransform(matK, (k) => (phone && !isReduced ? 0.96 + 0.04 * k : 1));
  const matRotX = useTransform(matK, (k) => (phone && !isReduced ? (1 - k) * 8 : 0));

  // the words fade and lift as the dashboard comes up (wide screens; phones override this in CSS)
  const heroY = useTransform(smoothProgress, [0, 0.42], [0, isReduced ? 0 : -140]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.32], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.4], [1, isReduced ? 1 : 0.95]);
  const heroPointerEvents = useTransform(smoothProgress, (p) => (p > 0.32 ? 'none' : 'auto'));

  // the dashboard: peeking at the bottom (64vh low), rising into the centre, then easing up as the hero leaves
  const dashboardY = useTransform(smoothProgress, [0, 0.48, 0.86, 1], isReduced ? ['0vh', '0vh', '0vh', '0vh'] : ['64vh', '0vh', '0vh', '-10vh']);
  const dashboardScale = useTransform(smoothProgress, [0, 0.48], isReduced ? [1, 1] : [0.94, 1]);
  const dashboardRotateX = useTransform(smoothProgress, [0, 0.48], isReduced ? [0, 0] : [3.5, 0]);

  // the walkthrough: six steps on a loop, only while the dashboard is on screen
  const [stage, setStage] = useState<BoardStage>(1);
  const [playing, setPlaying] = useState(true);
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const el = matRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: '120px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || !onScreen) return;
    const t = setTimeout(() => setStage((s) => (s === 6 ? 1 : ((s + 1) as BoardStage))), STEP_MS[stage]);
    return () => clearTimeout(t);
  }, [playing, onScreen, stage]);
  const pickStage = (s: BoardStage) => { setStage(s); setPlaying(true); };

  // "See how it works": to the dashboard. On the desktop that's two-thirds through the pinned scrub (where it has
  // risen to the centre); on a phone it's simply the dashboard, just under the nav
  const seeHow = () => {
    const scene = sceneRef.current, mat = matRef.current;
    if (!scene || !mat) return;
    const top = scene.getBoundingClientRect().top + window.scrollY;
    const y = phone
      ? mat.getBoundingClientRect().top + window.scrollY - 84
      : top + 0.67 * Math.max(0, scene.offsetHeight - window.innerHeight);
    const lenis = (window as unknown as { lenis?: { scrollTo: (y: number, o?: { duration?: number }) => void } }).lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: isReduced ? 'auto' : 'smooth' });
  };

  return (
    <section className="sup-hero-scene" ref={sceneRef} id="hero-scene" aria-label="Gradient Supplier Portal">
      {/* ─── Pinned sticky stage (wide screens: 100vh during the scrub) ─── */}
      <div className="sup-sticky-stage">
        {/* the dot grid behind everything (WebGL) */}
        <div className="sup-hero-dotgrid-wrap" aria-hidden="true">
          <DotGrid
            dotSize={1.3}
            gap={11}
            baseColor="#94A3B8"
            activeColor="#1FA952"
            radius={160}
            force={12}
            spring={0.018}
            damping={0.82}
            rippleSpeed={420}
            rippleWidth={500}
            rippleF={11}
            rippleDecay={2.2}
            ambientRipples={true}
            opacity={0.85}
            intro={true}
            mouseInteraction={true}
            clickShock={true}
          />
        </div>

        {/* the 3D packaging at the sides (wide screens only) */}
        {show3d && <ThreePackagingScene progress={smoothProgress} />}

        {/* ─── the words ─── */}
        <motion.div
          className="sup-hero-content"
          style={{
            y: heroY,
            opacity: heroOpacity,
            scale: heroScale,
            pointerEvents: heroPointerEvents as unknown as React.CSSProperties['pointerEvents'],
          }}
        >
          <div className="sup-hero-eyebrow-relume">FOR SPECIALTY ROASTERS &amp; DISTRIBUTORS</div>

          {/* the typed line can't wrap, so its longest phrase sets the headline's size. On a phone the longest
              ("Roasted, packed, dispatched.", 14.4em) is swapped for a shorter one, so the headline can be ~30%
              larger (supplier.css sizes it to fit 11.4em). Keyed, so it starts cleanly when the list changes. */}
          <GhostType
            key={phone ? 'phone' : 'wide'}
            as="h1"
            className="sup-hero-headline"
            text="Every café order."
            breakAfterBase={true}
            completions={[
              'You’d actually fulfill.',
              phone ? 'Packed and dispatched.' : 'Roasted, packed, dispatched.',
              'Ready to pack and ship.',
              'Settled in 24 hours.',
            ]}
            textColor="#0C0A09"
            accentColor="#1FA952"
            align="center"
            ghostOpacity={0.4}
            typeSpeed={35}
            streamSpeed={45}
            thinkDelay={240}
            acceptDelay={850}
            holdDelay={2100}
            sweep={true}
            loop={true}
            clickToAccept={true}
          />

          <p className="sup-hero-sub">
            Receive wholesale orders, manage inventory, and move every delivery forward, all from one supplier workspace.
          </p>

          <div className="sup-hero-btn-group">
            <button type="button" onClick={onJoinClick} className="sup-btn-hero-primary">
              <span>Join as a Supplier</span>
              <span aria-hidden="true">→</span>
            </button>
            <button type="button" onClick={seeHow} className="sup-btn-hero-secondary">
              <BorderBeam size={48} duration={4} borderWidth={1.5} colorFrom="#15803D" colorTo="#86efac" />
              <span>See how it works</span>
              <span aria-hidden="true">↓</span>
            </button>
          </div>
        </motion.div>

        {/* ─── the dashboard, on the green cutting mat ─── */}
        <motion.div
          className="sup-dashboard-rising-stage"
          style={{ y: dashboardY, scale: dashboardScale, rotateX: dashboardRotateX, transformPerspective: 1200 }}
          id="order-workspace"
        >
          {/* target anchor for #demo */}
          <div id="demo" style={{ position: 'absolute', top: '-100px', pointerEvents: 'none' }} aria-hidden="true" />
          <motion.div
            className="sup-stage-cutting-mat"
            ref={matRef}
            style={{ y: matY, scale: matScale, rotateX: matRotX, transformPerspective: 1000, transformOrigin: '50% 0%' }}
          >
            <HeroOrderBoard stage={stage} playing={playing} durations={STEP_MS} onStage={pickStage} onTogglePlay={() => setPlaying((p) => !p)} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
