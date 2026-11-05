'use client';

import React from 'react';

export interface BentoDustbinProps {
  isOpen: boolean;
  isCatching: boolean;
  isSettled: boolean;
  clearedCount: number; // 0 to 8
  isAfterActive: boolean;
  onTriggerToss: () => void;
  dustbinRef: React.RefObject<HTMLDivElement | null>;
}

export function BentoDustbin({
  isOpen,
  isCatching,
  isSettled,
  clearedCount,
  isAfterActive,
  onTriggerToss,
  dustbinRef,
}: BentoDustbinProps) {
  return (
    <div
      ref={dustbinRef}
      className={`bbo-dustbin ${isOpen ? 'is-open' : ''} ${isCatching ? 'is-catching' : ''} ${isSettled ? 'is-settled' : ''} ${isAfterActive ? 'is-after-active' : ''}`}
      onClick={onTriggerToss}
      role="button"
      tabIndex={0}
      title={isAfterActive ? 'Click to reset & review manual coordination' : 'Click to toss manual clutter into dustbin'}
      aria-label="Trash the manual coordination clutter"
    >
      {/* Status Pill Badge */}
      <div className="bbo-dustbin-badge">
        <span className="bbo-dustbin-dot" />
        <span className="bbo-dustbin-text">
          {clearedCount >= 8 && isAfterActive
            ? '✓ 8/8 Cleared · Clean Board'
            : isOpen && clearedCount > 0
            ? `Tossing (${clearedCount}/8)...`
            : '🗑️ Toss Clutter'}
        </span>
      </div>

      {/* Modern High-End Industrial Vector Dustbin */}
      <div className="bbo-dustbin-art">
        <svg
          width="116"
          height="136"
          viewBox="0 -24 120 156"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="bbo-dustbin-svg"
        >
          <defs>
            {/* Metallic body gradient */}
            <linearGradient id="bboCanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#150B28" />
              <stop offset="22%" stop-color="#2D1750" />
              <stop offset="50%" stop-color="#46257C" />
              <stop offset="78%" stop-color="#281448" />
              <stop offset="100%" stop-color="#100720" />
            </linearGradient>

            {/* Deep interior void / black hole */}
            <radialGradient id="bboVoidGrad" cx="50%" cy="35%" r="60%">
              <stop offset="0%" stop-color="#3B1C6E" />
              <stop offset="45%" stop-color="#140728" />
              <stop offset="100%" stop-color="#04010A" />
            </radialGradient>

            {/* Rim iridescent violet highlight */}
            <linearGradient id="bboRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#7C3AED" />
              <stop offset="35%" stop-color="#E9D5FF" />
              <stop offset="70%" stop-color="#A78BFA" />
              <stop offset="100%" stop-color="#5B21B6" />
            </linearGradient>

            {/* Lid gradient */}
            <linearGradient id="bboLidGrad" x1="0%" y1="0%" x2="100%" y2="60%">
              <stop offset="0%" stop-color="#351964" />
              <stop offset="45%" stop-color="#55279E" />
              <stop offset="100%" stop-color="#1C0C38" />
            </linearGradient>

            {/* Chrome handle shine */}
            <linearGradient id="bboHandleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#9CA3AF" />
              <stop offset="50%" stop-color="#FFFFFF" />
              <stop offset="100%" stop-color="#6B7280" />
            </linearGradient>

            {/* Neon base glow */}
            <filter id="bboGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#8B5CF6" flood-opacity="0.5" />
            </filter>
          </defs>

          {/* Ground Contact Shadow */}
          <ellipse cx="60" cy="116" rx="44" ry="7.5" fill="rgba(12, 5, 26, 0.45)" filter="blur(3.5px)" />

          {/* 1. Interior Void (Below the front rim, where balls enter) */}
          <g className="bbo-can-void">
            <ellipse cx="60" cy="24" rx="40" ry="13" fill="url(#bboVoidGrad)" stroke="#2E1650" stroke-width="1.5" />
            <ellipse cx="60" cy="26" rx="26" ry="7" fill="#8B5CF6" opacity="0.45" filter="blur(3px)" />
          </g>

          {/* 2. Canister Main Body */}
          <g className="bbo-can-body">
            <path d="M 20,24 L 27,106 Q 60,116 93,106 L 100,24 Q 60,36 20,24 Z" fill="url(#bboCanGrad)" />

            {/* Vertical tactile fluting */}
            <path d="M 36,29 L 41,108" stroke="rgba(255,255,255,0.09)" stroke-width="1.5" stroke-linecap="round" />
            <path d="M 37.5,29 L 42.5,108" stroke="rgba(0,0,0,0.35)" stroke-width="1.5" stroke-linecap="round" />

            <path d="M 52,31 L 54,110" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-linecap="round" />
            <path d="M 53.5,31 L 55.5,110" stroke="rgba(0,0,0,0.35)" stroke-width="1.5" stroke-linecap="round" />

            <path d="M 68,31 L 66,110" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-linecap="round" />
            <path d="M 69.5,31 L 67.5,110" stroke="rgba(0,0,0,0.35)" stroke-width="1.5" stroke-linecap="round" />

            <path d="M 84,29 L 79,108" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" stroke-linecap="round" />
            <path d="M 85.5,29 L 80.5,108" stroke="rgba(0,0,0,0.35)" stroke-width="1.5" stroke-linecap="round" />

            {/* Base accent neon ring */}
            <path d="M 27,106 Q 60,116 93,106" stroke="#8B5CF6" stroke-width="2.5" fill="none" opacity="0.85" filter="url(#bboGlow)" />

            {/* Front Lip / Rim (renders on top of the void so balls fall into it) */}
            <path d="M 20,24 Q 60,38 100,24" stroke="url(#bboRimGrad)" stroke-width="3.5" fill="none" stroke-linecap="round" />
            <path d="M 22,24 Q 60,36 98,24" stroke="rgba(255,255,255,0.4)" stroke-width="1" fill="none" />
          </g>

          {/* 3. Dynamic Hinged Lid */}
          <g className="bbo-can-lid" style={{ transformOrigin: '100px 18px' }}>
            <path d="M 16,20 Q 60,6 104,20 Q 60,28 16,20 Z" fill="url(#bboLidGrad)" stroke="#4A2188" stroke-width="1.5" />
            <path d="M 14,21 Q 60,31 106,21" stroke="url(#bboRimGrad)" stroke-width="2" fill="none" />
            <rect x="50" y="6" width="20" height="5" rx="2.5" fill="url(#bboHandleGrad)" stroke="#374151" stroke-width="0.8" />
            <rect x="53" y="4" width="14" height="2" rx="1" fill="#FFFFFF" opacity="0.7" />
          </g>

          {/* 4. Particle Puffs on Impact */}
          <g className="bbo-can-particles">
            <circle className="bbo-puff p1" cx="44" cy="18" r="2.5" fill="#DDD6FE" />
            <circle className="bbo-puff p2" cx="58" cy="14" r="3" fill="#A78BFA" />
            <circle className="bbo-puff p3" cx="72" cy="16" r="2.2" fill="#C4B5FD" />
            <circle className="bbo-puff p4" cx="62" cy="22" r="2.8" fill="#FFFFFF" />
          </g>
        </svg>
      </div>
    </div>
  );
}

