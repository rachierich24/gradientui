'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

// Authentic Iconsax / FontAwesome styled vector SVG icons
function IconCafe() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="notion-pill-svg">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8z" />
      <line x1="6" y1="2" x2="6" y2="4.5" />
      <line x1="10" y1="2" x2="10" y2="4.5" />
      <line x1="14" y1="2" x2="14" y2="4.5" />
    </svg>
  );
}

function IconSupplier() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="notion-pill-svg">
      <rect x="1.5" y="4.5" width="13" height="11" rx="1.5" />
      <path d="M14.5 7.5h4.2l3.3 3.5v4.5h-7.5v-8z" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17.5" cy="18" r="2" />
      <line x1="8" y1="18" x2="15.5" y2="18" />
    </svg>
  );
}

function IconBrand() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="notion-pill-svg">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export interface EcosystemSide {
  id: 'cafe' | 'supplier' | 'brand';
  label: string;
  icon: React.ReactNode;
  bg: string;
  dotColor: string;
}

// Platform ecosystem brand colors matching website main sections:
// Red (Cafés): #E5483B / rgba(229, 72, 59, 0.24)
// Green (Suppliers): #22C55E / rgba(34, 197, 94, 0.24)
// Purple (Brands): #8B5CF6 / rgba(139, 92, 246, 0.26)
export const ECOSYSTEM_SIDES: EcosystemSide[] = [
  {
    id: 'cafe',
    label: 'cafés',
    icon: <IconCafe />,
    dotColor: '#E5483B',
    bg: 'rgba(229, 72, 59, 0.24)',
  },
  {
    id: 'supplier',
    label: 'suppliers',
    icon: <IconSupplier />,
    dotColor: '#16A34A',
    bg: 'rgba(34, 197, 94, 0.24)',
  },
  {
    id: 'brand',
    label: 'brands',
    icon: <IconBrand />,
    dotColor: '#7C3AED',
    bg: 'rgba(139, 92, 246, 0.26)',
  },
];

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function HeroHeadline() {
  const [index, setIndex] = useState(0);
  const [inlineSize, setInlineSize] = useState<number | undefined>(undefined);
  const [isPaused, setIsPaused] = useState(false);
  const measureRef = useRef<HTMLSpanElement>(null);

  const current = ECOSYSTEM_SIDES[index] ?? ECOSYSTEM_SIDES[0];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ECOSYSTEM_SIDES.length);
    }, 2500); // 2.5s Notion cadence
    return () => clearInterval(interval);
  }, [isPaused]);

  useIsomorphicLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => {
      // Add +5px breathing room so bold glyphs never clip on right edge
      setInlineSize(Math.ceil(el.scrollWidth) + 5);
    };
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [current.label, index]);

  return (
    <>
      <span className="hero-h1-line1">The operating system where</span>
      <span className="hero-h1-line2">
        <span className="hero-word-lead">all</span>
        <span
          className="homepageHeroTeamsAndAgents-module-scss-module__KlQGRG__productPillAnimation notion-pill-animation"
          style={{
            '--color-background': current.bg,
            '--color-dot': current.dotColor,
            '--pill-label-inline-size': inlineSize !== undefined ? `${inlineSize}px` : undefined,
          } as React.CSSProperties}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onClick={() => setIndex((prev) => (prev + 1) % ECOSYSTEM_SIDES.length)}
          title={`Click to switch ecosystem side (Currently: ${current.label})`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIndex((prev) => (prev + 1) % ECOSYSTEM_SIDES.length);
            }
          }}
        >
          <span className="notion-pill-icon" aria-hidden="true" style={{ color: current.dotColor }}>
            {current.icon}
          </span>
          <span className="homepageHeroTeamsAndAgents-module-scss-module__KlQGRG__productPillLabel notion-pill-label">
            <span
              ref={measureRef}
              key={current.id}
              className="homepageHeroTeamsAndAgents-module-scss-module__KlQGRG__productPillLabelMeasure notion-pill-label-measure"
            >
              {current.label}
            </span>
          </span>
        </span>
        <span className="hero-word-trail">are connected.</span>
      </span>
    </>
  );
}

// Backward-compatible alias
export function HeroPill() {
  return <HeroHeadline />;
}
