'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function PackagingScene() {
  const prefersReduced = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const isReduced = prefersReduced ?? false;

  useEffect(() => {
    if (isReduced) return;
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates around center (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isReduced]);

  // Restrained parallax offsets: 4–8px translation, 1–1.5deg rotation
  const leftX = isReduced ? 0 : mousePos.x * -7;
  const leftY = isReduced ? 0 : mousePos.y * -6;
  const leftRot = isReduced ? 0 : mousePos.x * -1.2;

  const rightX = isReduced ? 0 : mousePos.x * 8;
  const rightY = isReduced ? 0 : mousePos.y * 6;
  const rightRot = isReduced ? 0 : mousePos.x * 1.4;

  return (
    <div className="sup-packaging-scene" aria-hidden="true">
      {/* ─── LEFT: Oversized Corrugated Cardboard Shipping Boxes ─── */}
      <motion.div
        className="sup-pack-left"
        animate={{
          x: leftX,
          y: leftY,
          rotate: leftRot,
        }}
        transition={{
          type: 'spring',
          damping: 35,
          stiffness: 120,
          mass: 0.8,
        }}
      >
        {/* Subtle idle float animation wrapper */}
        <motion.div
          animate={
            isReduced
              ? {}
              : {
                  y: [-3, 5, -3],
                  rotateZ: [-0.5, 0.5, -0.5],
                }
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ width: '100%', height: '100%', position: 'relative' }}
        >
          {/* Cardboard Packaging Asset */}
          <img
            src="/supplier/grabbit_kraft_cartons.jpg"
            alt="Corrugated kraft cardboard wholesale coffee boxes"
            loading="eager"
          />

          {/* Technical Supply Chain Annotation Tag */}
          <div className="sup-pack-tag-left">
            <span className="tag-code">SKU-ARABICA-AA</span>
            <span>10KG · ROAST DEPOT</span>
          </div>
        </motion.div>
      </motion.div>

      {/* ─── RIGHT: Oversized Heavy-Duty Green Reusable Delivery Crates ─── */}
      <motion.div
        className="sup-pack-right"
        animate={{
          x: rightX,
          y: rightY,
          rotate: rightRot,
        }}
        transition={{
          type: 'spring',
          damping: 35,
          stiffness: 120,
          mass: 0.8,
        }}
      >
        <motion.div
          animate={
            isReduced
              ? {}
              : {
                  y: [4, -5, 4],
                  rotateZ: [0.5, -0.5, 0.5],
                }
          }
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.8,
          }}
          style={{ width: '100%', height: '100%', position: 'relative' }}
        >
          {/* Reusable Crates Asset */}
          <img
            src="/supplier/grabbit_green_crates.jpg"
            alt="Forest green reusable wholesale delivery crates"
            loading="eager"
          />

          {/* Technical Logistics Annotation Tag */}
          <div className="sup-pack-tag-right">
            <span className="tag-status" />
            <span>DISPATCH POD · CRATE #C-88</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
