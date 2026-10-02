'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────
   ATTIO & GOOGLE-STYLE PRODUCT WORKFLOW MOTION ENGINE
   Pure Vector DOM + SVG Choreographed Micro-Ad Demonstrations
   Zero video asset bandwidth · 60fps · Interactive · Step-by-step progress
───────────────────────────────────────────────────────────────────────── */

export interface MotionEngineControlsProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  accentColor: string;
}

/* ── Minimal Timeline Bar (Top Chrome) ── */
export function MotionTimelineBar({
  currentStep,
  stepLabels,
  isPlaying,
  onTogglePlay,
  accentColor,
}: MotionEngineControlsProps) {
  return (
    <div className="motion-timeline-bar" aria-label="Workflow motion demonstration progress">
      <div className="motion-timeline-badge">
        <span className="motion-live-dot" style={{ backgroundColor: accentColor }} />
        <span>LIVE MOTION DEMO</span>
      </div>

      <div className="motion-steps-list">
        {stepLabels.map((label, idx) => {
          const isActive = currentStep === idx;
          const isDone = currentStep > idx;
          return (
            <div
              key={label}
              className={`motion-step-pill ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
            >
              <span className="motion-step-num">0{idx + 1}</span>
              <span className="motion-step-label">{label}</span>
              {isActive && isPlaying && (
                <motion.div
                  className="motion-step-progress-fill"
                  style={{ backgroundColor: accentColor }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 3.2, ease: 'linear' }}
                  key={currentStep}
                />
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="motion-play-pause-btn"
        onClick={onTogglePlay}
        title={isPlaying ? 'Pause simulation' : 'Play simulation'}
        aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
      >
        {isPlaying ? (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* ── Attio-Style Left Vertical Motion Stage Rail ── */
export function AttioMotionRail({
  steps,
  currentStep,
  onSelectStep,
  accentColor = '#2563EB',
}: {
  steps: { id: string; label: string; sub?: string }[];
  currentStep: number;
  onSelectStep: (idx: number) => void;
  accentColor?: string;
}) {
  return (
    <nav className="attio-motion-rail" aria-label="Product Workflow Motions">
      <div className="attio-rail-header">
        <span className="attio-rail-kicker">AUTOMATION PIPELINE</span>
      </div>
      <div className="attio-rail-list">
        {steps.map((st, idx) => {
          const isActive = currentStep === idx;
          return (
            <button
              key={st.id}
              type="button"
              className={`attio-rail-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectStep(idx)}
              aria-current={isActive ? 'step' : undefined}
            >
              {isActive && (
                <motion.span
                  className="attio-rail-active-indicator"
                  layoutId="attioRailIndicator"
                  style={{ backgroundColor: accentColor }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="attio-rail-label">{st.label}</span>
              {st.sub && <span className="attio-rail-sub">{st.sub}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ── Attio Workflow Automation Node Card ── */
export function WorkflowNode({
  icon,
  title,
  subtitle,
  badgeText = 'Automated Sequence',
  accentColor = '#F97316',
  className = '',
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
  badgeText?: string;
  accentColor?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={`attio-workflow-node ${className}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="node-icon-box" style={{ color: accentColor }}>
        {icon || (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        )}
      </div>
      <div className="node-content">
        <div className="node-title-row">
          <span className="node-title">{title}</span>
          {badgeText && (
            <span className="node-badge" style={{ color: accentColor, backgroundColor: `${accentColor}18` }}>
              {badgeText}
            </span>
          )}
        </div>
        <span className="node-subtitle">{subtitle}</span>
      </div>
      <div className="node-handle-dot" style={{ borderColor: accentColor }} />
    </motion.div>
  );
}

/* ── Animated Bezier Cable with Electric Energy Flow ── */
export function AnimatedBezierCable({
  startX = 190,
  startY = 25,
  endX = 330,
  endY = 25,
  accentColor = '#2563EB',
  flowSpeed = 1.8,
}: {
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  accentColor?: string;
  flowSpeed?: number;
}) {
  const dx = endX - startX;
  const dy = endY - startY;
  const cx1 = startX + dx * 0.45;
  const cy1 = startY - 8;
  const cx2 = startX + dx * 0.55;
  const cy2 = endY + 8;

  const pathData = `M ${startX} ${startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${endX} ${endY}`;
  const gradId = `cable-grad-${accentColor.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg className="attio-bezier-cable" viewBox="0 0 500 50" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="1" />
        </linearGradient>
      </defs>
      {/* Background track line */}
      <path
        d={pathData}
        stroke="rgba(0, 0, 0, 0.10)"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4 4"
      />
      {/* Dynamic Animated Pulse Cable */}
      <motion.path
        d={pathData}
        stroke={`url(#${gradId})`}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="14 120"
        animate={{ strokeDashoffset: [-134, 0] }}
        transition={{ repeat: Infinity, duration: flowSpeed, ease: 'linear' }}
      />
      {/* Terminal target dot */}
      <circle cx={endX} cy={endY} r="3.5" fill={accentColor} />
    </svg>
  );
}

/* ── Stylized Google/Figma-Style Animated Virtual Cursor ── */
export function AnimatedCursor({
  x,
  y,
  isClicking,
  label,
  accentColor = '#2563EB',
}: {
  x: number | string;
  y: number | string;
  isClicking: boolean;
  label?: string;
  accentColor?: string;
}) {
  return (
    <motion.div
      className="animated-virtual-cursor"
      animate={{ left: x, top: y }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.4 }}
      aria-hidden="true"
    >
      <div className={`cursor-body ${isClicking ? 'clicking' : ''}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M5.5 3.5L11.5 20.5L14.5 13.5L21.5 10.5L5.5 3.5Z"
            fill="#171717"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        {label && (
          <span className="cursor-label-tag" style={{ backgroundColor: accentColor }}>
            {label}
          </span>
        )}
        <AnimatePresence>
          {isClicking && (
            <motion.span
              className="cursor-click-ripple"
              style={{ borderColor: accentColor }}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
