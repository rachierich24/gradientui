'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GhostTypeProps {
  /** The part of the headline that types itself first and stays */
  text?: string;
  /** Endings suggested one after another as ghost text */
  completions?: string[];
  /** The element rendered. Screen readers get the full sentence */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'span';
  /** Colour of the text. Leave unset to use surrounding text colour */
  textColor?: string;
  /** Colour of the caret, the accept sweep and the selection */
  accentColor?: string;
  /** Opacity of ghost text, relative to the text colour (default 0.42) */
  ghostOpacity?: number;
  /** Font family override */
  fontFamily?: string;
  /** Font size in pixels */
  fontSize?: number;
  /** Font weight */
  fontWeight?: number | string;
  /** Line height relative to font size */
  lineHeight?: number | string;
  /** Letter spacing in em */
  letterSpacing?: number | string;
  /** Where the headline sits: 'left' | 'center' | 'right' */
  align?: 'left' | 'center' | 'right';
  /** Whether to insert a line break between the base text and completions */
  breakAfterBase?: boolean;
  /** Milliseconds per typed character for base text */
  typeSpeed?: number;
  /** Milliseconds between streamed ghost words/characters */
  streamSpeed?: number;
  /** Whether ghost text streams in word by word or character by character */
  streamBy?: 'word' | 'char';
  /** Milliseconds before a suggestion appears */
  thinkDelay?: number;
  /** Milliseconds a suggestion waits before it is accepted */
  acceptDelay?: number;
  /** Milliseconds the accepted sentence stays before next suggestion */
  holdDelay?: number;
  /** How an accepted ending is removed: 'select' | 'backspace' | 'slide' */
  clearStyle?: 'select' | 'backspace' | 'slide';
  /** Shape of the caret: 'bar' | 'block' | 'underscore' */
  caret?: 'bar' | 'block' | 'underscore';
  /** Blink the caret while idle */
  caretBlink?: boolean;
  /** Show a key hint after the suggestion */
  hint?: boolean;
  /** Label of the key hint */
  hintLabel?: string;
  /** Sweep the accent colour through an accepted ending */
  sweep?: boolean;
  /** Cycle through the completions forever */
  loop?: boolean;
  /** Start typing when headline scrolls into view */
  startOnView?: boolean;
  /** Pause timing while mouse is over headline */
  pauseOnHover?: boolean;
  /** Click to accept a suggestion right away or skip to next */
  clickToAccept?: boolean;
  /** Pause the sequence */
  paused?: boolean;
  /** Called whenever a completion is accepted */
  onAccept?: (completion: string, index: number) => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
  /** Children or custom slot */
  children?: React.ReactNode;
}

export function GhostType({
  text = 'Every café order.',
  completions = [
    'You’d actually fulfill.',
    'Roasted, packed, dispatched.',
    'Ready to pack and ship.',
    'Settled in 24 hours.',
  ],
  as: Component = 'h1',
  textColor,
  accentColor = '#1FA952',
  ghostOpacity = 0.45,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  align = 'center',
  breakAfterBase = true,
  typeSpeed = 35,
  streamSpeed = 48,
  streamBy = 'char',
  thinkDelay = 220,
  acceptDelay = 500,
  holdDelay = 2200,
  caret = 'bar',
  caretBlink = true,
  hint = false,
  hintLabel = 'Tab',
  sweep = true,
  loop = true,
  startOnView = true,
  pauseOnHover = false,
  clickToAccept = true,
  paused = false,
  onAccept,
  className,
  style,
}: GhostTypeProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(!startOnView);
  const [isHovered, setIsHovered] = useState(false);

  // Base text typing state
  const [typedBaseLength, setTypedBaseLength] = useState(text.length);

  // Completions state machine:
  // phase: 'streaming' | 'holding' | 'exiting'
  const [completionIndex, setCompletionIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<'streaming' | 'holding' | 'exiting'>('streaming');
  const [isSweeping, setIsSweeping] = useState(false);

  const currentCompletion = useMemo(() => {
    if (!completions.length) return '';
    return completions[completionIndex % completions.length];
  }, [completions, completionIndex]);

  // Observer for startOnView
  useEffect(() => {
    if (!startOnView) {
      setIsInView(true);
      return;
    }
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [startOnView]);

  // 1. Initial base text typewriter
  useEffect(() => {
    if (!isInView || paused) return;
    if (typedBaseLength < text.length) {
      const timer = setTimeout(() => {
        setTypedBaseLength((prev) => prev + 1);
      }, typeSpeed);
      return () => clearTimeout(timer);
    }
  }, [isInView, paused, typedBaseLength, text.length, typeSpeed]);

  // 2. When completionIndex advances, reset to 'streaming' with charIndex 0
  useEffect(() => {
    setCharIndex(0);
    setPhase('streaming');
    setIsSweeping(false);
  }, [completionIndex]);

  // 3. Phase: 'streaming' -> types ghost characters smoothly
  useEffect(() => {
    if (!isInView || paused || (pauseOnHover && isHovered)) return;
    if (phase !== 'streaming') return;

    if (charIndex < currentCompletion.length) {
      const timer = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, streamSpeed);
      return () => clearTimeout(timer);
    } else {
      // Completed streaming characters -> trigger acceptance and switch to holding
      const acceptTimer = setTimeout(() => {
        setIsSweeping(true);
        if (sweep) {
          setTimeout(() => setIsSweeping(false), 650);
        }
        if (onAccept) {
          onAccept(currentCompletion, completionIndex % completions.length);
        }
        setPhase('holding');
      }, acceptDelay);
      return () => clearTimeout(acceptTimer);
    }
  }, [
    isInView,
    paused,
    pauseOnHover,
    isHovered,
    phase,
    charIndex,
    currentCompletion,
    streamSpeed,
    acceptDelay,
    sweep,
    onAccept,
    completionIndex,
    completions.length,
  ]);

  // 4. Phase: 'holding' -> pause for comfortable reading before exit transition
  useEffect(() => {
    if (!isInView || paused || (pauseOnHover && isHovered)) return;
    if (phase !== 'holding') return;

    if (!loop && completionIndex >= completions.length - 1) {
      return; // Stop on last item if loop is false
    }

    const timer = setTimeout(() => {
      setPhase('exiting');
    }, holdDelay);
    return () => clearTimeout(timer);
  }, [isInView, paused, pauseOnHover, isHovered, phase, loop, completionIndex, completions.length, holdDelay]);

  // 5. Phase: 'exiting' -> smooth slide up & fade out before advancing
  useEffect(() => {
    if (phase !== 'exiting') return;

    const timer = setTimeout(() => {
      setCompletionIndex((prev) => (prev + 1) % completions.length);
    }, 380); // Duration matches motion exit transition
    return () => clearTimeout(timer);
  }, [phase, completions.length]);

  // Manual skip on click
  const handleSlotClick = useCallback(() => {
    if (!clickToAccept) return;
    if (phase === 'streaming') {
      // Instantly accept current
      setCharIndex(currentCompletion.length);
      setIsSweeping(true);
      setTimeout(() => setIsSweeping(false), 650);
      setPhase('holding');
    } else if (phase === 'holding') {
      // Immediately start exit transition
      setPhase('exiting');
    }
  }, [clickToAccept, phase, currentCompletion.length]);

  const displayedBase = text.slice(0, typedBaseLength);
  const streamedGhost = currentCompletion.slice(0, charIndex);
  const isAccepted = phase === 'holding' || phase === 'exiting';

  return (
    <Component
      ref={containerRef as unknown as React.RefObject<HTMLHeadingElement>}
      className={cn(
        'relative select-none',
        breakAfterBase ? 'ghost-type-root' : 'ghost-type-inline',
        className
      )}
      style={{
        color: textColor,
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing: letterSpacing ? `${letterSpacing}em` : undefined,
        cursor: clickToAccept ? 'pointer' : 'default',
        ...style,
      }}
      onClick={handleSlotClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`${text} ${currentCompletion}`}
    >
      {/* ─── 1. Persistent Typed Base Text ─── */}
      <span className="ghost-type-base font-inherit">
        {displayedBase}
      </span>

      {/* ─── 2. Completion Slot (Fluid Slide & Fade Animated Presence in Loop) ─── */}
      <span className="ghost-type-slot font-inherit">
        <motion.span
          key={`completion-${completionIndex}`}
          className="ghost-type-completion-animated inline-flex items-baseline"
          initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
          animate={{
            opacity: phase === 'exiting' ? 0 : 1,
            y: phase === 'exiting' ? -14 : 0,
            filter: phase === 'exiting' ? 'blur(3px)' : 'blur(0px)',
          }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          {isAccepted ? (
            /* Accepted Text with Green Sweep confirmation */
            <span
              className={cn(
                'ghost-type-accepted font-inherit not-italic',
                isSweeping && 'relative inline-block'
              )}
              style={{ fontStyle: 'normal' }}
            >
              {currentCompletion}
              {isSweeping && (
                <span
                  className="absolute inset-0 pointer-events-none animate-ghost-sweep"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
                    mixBlendMode: 'screen',
                    opacity: 0.85,
                  }}
                />
              )}
            </span>
          ) : (
            /* Ghost Autocomplete Streaming Prediction */
            <span
              className="ghost-type-ghost font-inherit not-italic"
              style={{
                opacity: ghostOpacity,
                fontStyle: 'normal',
              }}
            >
              {streamedGhost}
              {hint && (
                <span
                  className="ml-2 inline-flex items-center text-[10px] font-sans font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded border opacity-70"
                  style={{
                    borderColor: 'currentColor',
                  }}
                >
                  {hintLabel}
                </span>
              )}
            </span>
          )}

          {/* Caret */}
          <span
            className={cn(
              'ghost-type-caret',
              caretBlink && 'animate-caret-blink'
            )}
            style={{
              backgroundColor: accentColor || 'currentColor',
            }}
            aria-hidden="true"
          />
        </motion.span>
      </span>
    </Component>
  );
}

export default GhostType;
