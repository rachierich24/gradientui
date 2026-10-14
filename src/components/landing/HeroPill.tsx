'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// Authentic Iconsax / FontAwesome styled vector SVG icons
function IconCafe() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="pill-svg-icon">
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="pill-svg-icon">
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="pill-svg-icon">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export interface EcosystemSide {
  id: 'cafe' | 'supplier' | 'brand';
  label: string;
  icon: React.ReactNode;
  textColor: string;
  bg: string;
  border: string;
  glow: string;
}

export const ECOSYSTEM_SIDES: EcosystemSide[] = [
  {
    id: 'cafe',
    label: 'cafés',
    icon: <IconCafe />,
    textColor: '#DC2626',
    bg: 'rgba(255, 68, 56, 0.08)',
    border: 'rgba(255, 68, 56, 0.24)',
    glow: '0 3px 16px -2px rgba(255, 68, 56, 0.18)',
  },
  {
    id: 'supplier',
    label: 'suppliers',
    icon: <IconSupplier />,
    textColor: '#059669',
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.24)',
    glow: '0 3px 16px -2px rgba(16, 185, 129, 0.18)',
  },
  {
    id: 'brand',
    label: 'brands',
    icon: <IconBrand />,
    textColor: '#7C3AED',
    bg: 'rgba(139, 92, 246, 0.08)',
    border: 'rgba(139, 92, 246, 0.24)',
    glow: '0 3px 16px -2px rgba(139, 92, 246, 0.18)',
  },
];

// Unified Notion-grade spring physics for smooth moving away and coming together
const NOTION_SPRING = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 28,
  mass: 0.82,
};

export function HeroHeadline() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ECOSYSTEM_SIDES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = ECOSYSTEM_SIDES[index];

  return (
    <LayoutGroup id="notion-hero-headline-group">
      <span className="hero-h1-line1">The operating system where</span>
      <span className="hero-h1-line2">
        <motion.span
          layout="position"
          className="hero-word-lead"
          transition={NOTION_SPRING}
        >
          all
        </motion.span>

        <motion.span
          layout
          className={`hero-pill hero-pill--${current.id}`}
          data-no-split="true"
          style={{
            backgroundColor: current.bg,
            borderColor: current.border,
            boxShadow: current.glow,
          }}
          transition={{
            layout: NOTION_SPRING,
            backgroundColor: { duration: 0.32 },
            borderColor: { duration: 0.32 },
            boxShadow: { duration: 0.32 },
          }}
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
          <span className="hero-pill-content-box">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={current.id}
                className="hero-pill-content"
                initial={{ y: 15, opacity: 0, filter: 'blur(3px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -15, opacity: 0, filter: 'blur(3px)' }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="hero-pill-icon" aria-hidden="true" style={{ color: current.textColor }}>
                  {current.icon}
                </span>
                <span className="hero-pill-word" style={{ color: current.textColor }}>
                  {current.label}
                </span>
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.span>

        <motion.span
          layout="position"
          className="hero-word-trail"
          transition={NOTION_SPRING}
        >
          are connected.
        </motion.span>
      </span>
    </LayoutGroup>
  );
}

// Backward-compatible alias
export function HeroPill() {
  return <HeroHeadline />;
}
