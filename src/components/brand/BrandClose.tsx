'use client';

import React, { useEffect, useRef, useState } from 'react';

export function BrandClose({ onStart }: { onStart: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [torchMode, setTorchMode] = useState<'idle' | 'activating' | 'torch'>('idle');
  const timerRef = useRef<NodeJS.Timeout[]>([]);
  const secRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      timerRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (torchMode !== 'idle') return;

    // Trigger 2-3 second cinematic torch transition
    setTorchMode('activating');

    // Settle into full torch at 1900ms
    const t1 = setTimeout(() => {
      setTorchMode('torch');
    }, 1900);

    // After the transition finishes (at 2400ms), execute button functionality
    const t2 = setTimeout(() => {
      onStart();
    }, 2400);

    // Reset back to idle button after 7.5 seconds so user can replay if modal closes
    const t3 = setTimeout(() => {
      setTorchMode('idle');
    }, 7500);

    timerRef.current = [t1, t2, t3];
  };

  // Scroll-based progress tracker: drives line emergence from screen edges and projector light beam
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;

    let rafId = 0;
    const updateScroll = () => {
      rafId = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Generous, smooth scroll range so the lines emerge slowly and gracefully strictly based on scroll
      const scrollRange = vh * 1.25;
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / scrollRange));
      el.style.setProperty('--scroll-p', progress.toFixed(4));
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(updateScroll);
    };

    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Subtle interactive 3D tilt towards cursor on pointer move
  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn || e.pointerType !== 'mouse') return;
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    btn.style.transform = `perspective(600px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-2px)`;
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    if (btnRef.current) {
      btnRef.current.style.transform = '';
    }
  };

  return (
    <section
      ref={secRef}
      className="bcl"
      aria-labelledby="bcl-title"
    >
      {/* ─── Leftmost 3D Glowing Torus Arc (Slides Out From Extreme Left Screen Edge On Scroll) ─── */}
      <svg
        className="bcl-arc-svg bcl-arc-left"
        viewBox="0 0 380 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bcl-arc-grad-l" x1="15%" y1="85%" x2="85%" y2="15%">
            <stop offset="0%" stopColor="#371488" />
            <stop offset="25%" stopColor="#6B33D3" />
            <stop offset="65%" stopColor="#7D42E3" />
            <stop offset="100%" stopColor="#B89DF2" />
          </linearGradient>
        </defs>
        <path
          className="bcl-arc-path"
          pathLength={400}
          d="M 15 190 A 135 135 0 0 0 270 125"
          stroke="url(#bcl-arc-grad-l)"
          strokeWidth="50"
          strokeLinecap="round"
        />
      </svg>

      {/* ─── Rightmost 3D Glowing Torus Arc (Slides Out From Extreme Right Screen Edge On Scroll) ─── */}
      <svg
        className="bcl-arc-svg bcl-arc-right"
        viewBox="0 0 380 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bcl-arc-grad-r" x1="15%" y1="15%" x2="85%" y2="85%">
            <stop offset="0%" stopColor="#B89DF2" />
            <stop offset="35%" stopColor="#7D42E3" />
            <stop offset="75%" stopColor="#6B33D3" />
            <stop offset="100%" stopColor="#371488" />
          </linearGradient>
        </defs>
        <path
          className="bcl-arc-path"
          pathLength={400}
          d="M 365 190 A 135 135 0 0 0 110 255"
          stroke="url(#bcl-arc-grad-r)"
          strokeWidth="50"
          strokeLinecap="round"
        />
      </svg>

      <div className="bcl-inner">
        {/* ─── Pill Badge ─── */}


        {/* ─── Main Headline ─── */}
        <h2 id="bcl-title" className="bcl-title">
          Start your
          <br />
          free trial today
        </h2>

        {/* ─── Subtitle ─── */}
        <p className="bcl-sub">
          Unlock the full potential of your brand with verified café demand telemetry and automated reorders.
        </p>

        {/* ─── Centered CTA Design with Realistic Minimal Volumetric Light Projector ─── */}
        <div className={`bcl-center-cta cta-mode-${torchMode}`}>
          <button
            ref={btnRef}
            type="button"
            className={`bcl-central-btn mode-${torchMode} ${isHovered ? 'is-hovered' : ''}`}
            onClick={handleClick}
            onPointerMove={handlePointerMove}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={handlePointerLeave}
            aria-label="Build Your Brand Identity - Launch Trial"
            disabled={torchMode === 'activating'}
          >
            {/* Left side chassis: Minimal Matte Obsidian Capsule */}
            <span className="bcl-cbtn-left">
              <span className="bcl-cbtn-plus">+</span>
              <span className="bcl-cbtn-action">Build</span>
            </span>

            {/* Glowing razor-sharp vertical optical slit / aperture */}
            <span className="bcl-cbtn-slit-wrap" aria-hidden="true">
              <span className="bcl-cbtn-slit" />
              <span className="bcl-cbtn-slit-halo" />
              <span className="bcl-cbtn-slit-flare" />
            </span>

            {/* Projector Section: Volumetric Light Beams OUT of the button */}
            <span className="bcl-cbtn-projector">
              {/* Dark right cover enclosing the button into a normal, complete pill before click */}
              <span className="bcl-cbtn-right-cover" aria-hidden="true" />

              <span className="bcl-light-rig" aria-hidden="true">
                <span className="bcl-beam-ambient" />
                <svg
                  className="bcl-beam-svg"
                  viewBox="0 0 480 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="bcl-beam-core" x1="0%" y1="50%" x2="100%" y2="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
                      <stop offset="8%" stopColor="#F4F0FD" stopOpacity="0.92" />
                      <stop offset="24%" stopColor="#B89DF2" stopOpacity="0.85" />
                      <stop offset="50%" stopColor="#6B33D3" stopOpacity="0.7" />
                      <stop offset="75%" stopColor="#5924BE" stopOpacity="0.32" />
                      <stop offset="90%" stopColor="#4A1FB0" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#371488" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="bcl-beam-soft" x1="0%" y1="50%" x2="100%" y2="50%">
                      <stop offset="0%" stopColor="#DDD1FA" stopOpacity="0.85" />
                      <stop offset="16%" stopColor="#B89DF2" stopOpacity="0.72" />
                      <stop offset="42%" stopColor="#7D42E3" stopOpacity="0.5" />
                      <stop offset="68%" stopColor="#6B33D3" stopOpacity="0.25" />
                      <stop offset="86%" stopColor="#5924BE" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#371488" stopOpacity="0" />
                    </linearGradient>
                    <filter id="bcl-soft-penumbra" x="-20%" y="-40%" width="140%" height="180%">
                      <feGaussianBlur stdDeviation="14" />
                    </filter>
                    <filter id="bcl-core-glow" x="-10%" y="-20%" width="120%" height="140%">
                      <feGaussianBlur stdDeviation="5" />
                    </filter>
                  </defs>

                  {/* Volumetric feathered outer penumbra envelope with natural hyperbolic flare */}
                  <path
                    d="M 0 88 Q 240 45 480 15 L 480 205 Q 240 175 0 132 Z"
                    fill="url(#bcl-beam-soft)"
                    filter="url(#bcl-soft-penumbra)"
                  />
                  {/* Atmospheric mid-density projector beam */}
                  <path
                    d="M 0 92 Q 230 55 450 28 L 450 192 Q 230 165 0 128 Z"
                    fill="url(#bcl-beam-core)"
                    filter="url(#bcl-core-glow)"
                    opacity="0.85"
                  />
                  {/* Concentrated luminous inner laser core */}
                  <path
                    d="M 0 96 Q 200 70 380 48 L 380 172 Q 200 150 0 124 Z"
                    fill="url(#bcl-beam-core)"
                    opacity="0.65"
                  />
                </svg>

                {/* Dynamic photon wave stream */}
                <span className="bcl-photon-stream-box">
                  <span className="bcl-photon-wave-1" />
                  <span className="bcl-photon-wave-2" />
                </span>
              </span>

              {/* Refined illuminated typography with sleek animated chevron */}
              <span className="bcl-cbtn-text">
                <span>Your Brand Identity</span>
                <svg
                  className="bcl-cbtn-chevron"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M 5 12 h 14 M 13 6 l 6 6 l -6 6" />
                </svg>
              </span>
            </span>
          </button>

          {/* 3D Perspective Grid Floor centered underneath */}
          <div className="bcl-grid-floor" aria-hidden="true">
            <div className="bcl-grid-plane" />
            <div className="bcl-grid-light-spot" />
          </div>

          {/* Secondary Question Prompt centered below */}
          <button
            type="button"
            className="bcl-footer-note-btn"
            onClick={onStart}
          >
            Stuck in your brand growth? Talk with our team.
          </button>
        </div>
      </div>
    </section>
  );
}

export default BrandClose;
