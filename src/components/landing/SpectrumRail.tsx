'use client';
// Fixed left-edge rail that fills plum -> teal -> amber as the page scrolls.
// The gradient IS the brand (Brand -> Supplier -> Cafe, flowing down the chain)
// and doubles as a scroll-progress indicator. Purpose over decoration.
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

export function LSpectrumRail() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <div className="spectrum-rail" aria-hidden="true">
      <motion.div
        className="spectrum-rail-fill"
        style={{ scaleY: reduce ? 1 : scaleY }}
      />
    </div>
  );
}
