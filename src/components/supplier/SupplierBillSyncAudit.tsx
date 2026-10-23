'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import PixelCard from '@/components/ui/PixelCard';

export function SupplierBillSyncAudit() {
  // [[currentStep, direction]] where direction: 1 = forward (slide left, enter right), -1 = backward
  const [[activeStep, direction], setStepState] = useState<[1 | 2 | 3 | 4 | 5, number]>([1, 1]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const prefersReduced = useReducedMotion();

  // SVG refs for dynamic pixel-perfect connector lines
  const reconSvgRef = useRef<SVGSVGElement>(null);
  const shareSvgRef = useRef<SVGSVGElement>(null);
  const [reconCoords, setReconCoords] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);
  const [shareCoords, setShareCoords] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);

  // Step navigation helper with directional awareness
  const goToStep = useCallback((nextStep: 1 | 2 | 3 | 4 | 5, pauseAutoPlay = true) => {
    if (pauseAutoPlay) setIsPlaying(false);
    setStepState(([prev]) => {
      let dir = nextStep > prev ? 1 : -1;
      if (prev === 5 && nextStep === 1) dir = 1;
      if (prev === 1 && nextStep === 5) dir = -1;
      return [nextStep, dir];
    });
  }, []);

  // Auto-cycle through the 5 steps sequentially every 2.2 seconds (faster, brisk pace)
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setStepState(([prev]) => {
        const next = (prev === 5 ? 1 : prev + 1) as 1 | 2 | 3 | 4 | 5;
        return [next, 1];
      });
    }, 2200);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Beam progress percentage (0% to 100%) moving briskly till the end across the 5-step loop
  const [beamProgress, setBeamProgress] = useState<number>(20);
  const [isLoopReset, setIsLoopReset] = useState<boolean>(false);

  useEffect(() => {
    if (activeStep === 1 && direction === 1) {
      setIsLoopReset(true);
      setBeamProgress(0);
      const timer = setTimeout(() => {
        setIsLoopReset(false);
        setBeamProgress(20);
      }, 25);
      return () => clearTimeout(timer);
    } else {
      setIsLoopReset(false);
      setBeamProgress((activeStep / 5) * 100);
    }
  }, [activeStep, direction]);

  // Automated random hover loop across the 3 pillar cards (pauses when user hovers manually)
  const [randomPillarIndex, setRandomPillarIndex] = useState<number | null>(0);
  const [isPillarHoveredByUser, setIsPillarHoveredByUser] = useState<boolean>(false);

  useEffect(() => {
    if (isPillarHoveredByUser) return;
    const timer = setInterval(() => {
      setRandomPillarIndex(prev => {
        const candidates = [0, 1, 2].filter(idx => idx !== prev);
        return candidates[Math.floor(Math.random() * candidates.length)];
      });
    }, 2800);
    return () => clearInterval(timer);
  }, [isPillarHoveredByUser]);

  // Recalculate dynamic connector line coordinates directly relative to the active SVG (1:1 CSS pixels, no viewBox scaling)
  const updateCoordinates = useCallback(() => {
    if (activeStep === 4 && reconSvgRef.current) {
      const svgRect = reconSvgRef.current.getBoundingClientRect();
      if (svgRect.width === 0 || svgRect.height === 0) return;

      const pairs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
      for (let i = 0; i < 4; i++) {
        const leftEl = document.getElementById(`sup-recon-left-${i}`);
        const rightEl = document.getElementById(`sup-recon-right-${i}`);
        if (leftEl && rightEl) {
          const lRect = leftEl.getBoundingClientRect();
          const rRect = rightEl.getBoundingClientRect();
          pairs.push({
            x1: Math.round(lRect.left + lRect.width / 2 - svgRect.left),
            y1: Math.round(lRect.top + lRect.height / 2 - svgRect.top),
            x2: Math.round(rRect.left + rRect.width / 2 - svgRect.left),
            y2: Math.round(rRect.top + rRect.height / 2 - svgRect.top),
          });
        }
      }
      if (pairs.length > 0) {
        setReconCoords(pairs);
      }
    } else if (activeStep === 5 && shareSvgRef.current) {
      const svgRect = shareSvgRef.current.getBoundingClientRect();
      if (svgRect.width === 0 || svgRect.height === 0) return;

      const docEl = document.getElementById('sup-report-doc-anchor');
      if (docEl) {
        const dRect = docEl.getBoundingClientRect();
        const x1 = Math.round(dRect.left + dRect.width / 2 - svgRect.left);
        const y1 = Math.round(dRect.top + dRect.height / 2 - svgRect.top);

        const pairs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
        for (let i = 0; i < 3; i++) {
          const avEl = document.getElementById(`sup-recipient-anchor-${i}`);
          if (avEl) {
            const aRect = avEl.getBoundingClientRect();
            pairs.push({
              x1,
              y1,
              x2: Math.round(aRect.left + aRect.width / 2 - svgRect.left),
              y2: Math.round(aRect.top + aRect.height / 2 - svgRect.top),
            });
          }
        }
        if (pairs.length > 0) {
          setShareCoords(pairs);
        }
      }
    }
  }, [activeStep]);

  // Sync coordinates on mount, step switch, and after motion spring settles
  useEffect(() => {
    const raf1 = requestAnimationFrame(updateCoordinates);
    const t1 = setTimeout(updateCoordinates, 20);
    const t2 = setTimeout(updateCoordinates, 70);
    const t3 = setTimeout(updateCoordinates, 150);
    const t4 = setTimeout(updateCoordinates, 260);

    window.addEventListener('resize', updateCoordinates);
    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('resize', updateCoordinates);
    };
  }, [activeStep, updateCoordinates]);

  // Snappy, crisp frame-to-frame stage variants with directional sliding + zoom (ultra-fast 60fps handoff)
  const stageVariants = {
    enter: (dir: number) =>
      prefersReduced
        ? { opacity: 0 }
        : {
            x: dir * 36,
            opacity: 0,
            scale: 0.97,
          },
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 480, damping: 32, mass: 0.5 },
        scale: { type: 'spring', stiffness: 480, damping: 32, mass: 0.5 },
        opacity: { duration: 0.13 },
      },
    },
    exit: (dir: number) =>
      prefersReduced
        ? { opacity: 0 }
        : {
            x: -dir * 36,
            opacity: 0,
            scale: 0.97,
            transition: {
              x: { duration: 0.11, ease: [0.32, 0, 0.67, 0] },
              scale: { duration: 0.11, ease: [0.32, 0, 0.67, 0] },
              opacity: { duration: 0.09 },
            },
          },
  };

  return (
    <section
      className="sup-billsync-section"
      id="bill-sync-audit"
      aria-label="Smart Bill Sync, Automated GST Reconciliation and CA Audit Vault"
    >
      <div className="sup-billsync-backdrop">
        <div className="sup-billsync-grid-bg" />
        <div className="sup-billsync-glow" />
      </div>

      <div className="sup-billsync-container">
        {/* ─── Two-Tone Section Header ─── */}
        <div className="sup-billsync-header">
          <div className="sup-billsync-eyebrow">
            <span className="sup-billsync-eyebrow-dot" />
            <span>SMART BILL SYNC &amp; GST AUDIT</span>
          </div>
          <h2 className="sup-billsync-heading">
            Every bill paid.<br />
            <span className="sup-billsync-heading-muted">
              Scanned, synced, and CA-ready.
            </span>
          </h2>
          <p className="sup-billsync-desc">
            Gradient AI automatically reconciles café bills with bank debits and GSTR-2B, delivering airtight audit reports to your CA in one click.
          </p>
        </div>

        {/* ─── HUD Terminal Shell (Magic Receipt AI Inspired · Pure White Canvas) ─── */}
        <div className="sup-billsync-terminal">
          {/* Internal HUD Grid & Soft Radial Glow */}
          <div className="sup-billsync-terminal-grid" />
          <div className="sup-terminal-glow" />

          {/* Viewfinder Framing Brackets [ ] and Center Ticks ├ ┤ */}
          <div className="sup-hud-brackets">
            <div className="sup-hud-corner sup-hud-corner-tl" />
            <div className="sup-hud-corner sup-hud-corner-tr" />
            <div className="sup-hud-corner sup-hud-corner-bl" />
            <div className="sup-hud-corner sup-hud-corner-br" />
            <div className="sup-hud-tick-left" />
            <div className="sup-hud-tick-right" />
          </div>

          {/* Top Bar: Centered Progress Bar + Ticker + Battery & Pause Controls */}
          <div className="sup-terminal-top">
            <div className="sup-terminal-top-right">
              {/* Green Battery Status Indicator */}
              <div className="sup-battery-indicator" title="AI OCR Engine // 100% Online">
                <span className="sup-battery-bar" />
                <span className="sup-battery-bar" />
                <span className="sup-battery-bar" />
                <span className="sup-battery-bar" />
                <span className="sup-battery-bar" />
              </div>

              {/* Pause/Play Toggle */}
              <button
                type="button"
                className="sup-terminal-playpause"
                title={isPlaying ? 'Pause auto-play' : 'Resume auto-play'}
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
              >
                {isPlaying ? (
                  <div className="sup-pause-bars">
                    <span className="sup-pause-bar" />
                    <span className="sup-pause-bar" />
                  </div>
                ) : (
                  <span className="sup-play-triangle" />
                )}
              </button>
            </div>

            {/* Animated Progress Bar (Solid Primary Green Beam) */}
            <div className="sup-loading-bar-container">
              <motion.div
                className="sup-loading-bar-fill"
                initial={false}
                animate={{ width: `${beamProgress}%` }}
                transition={{
                  duration: isLoopReset ? 0.03 : (isPlaying ? 2.16 : 0.22),
                  ease: isPlaying && !isLoopReset ? 'linear' : [0.16, 1, 0.3, 1],
                }}
              />
            </div>

            {/* Dynamic Monospace Ticker with smooth slide cross-fade */}
            <div className="sup-loading-ticker-text-wrapper">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeStep}
                  custom={direction}
                  className="sup-loading-ticker-text"
                  initial={{ opacity: 0, y: direction * 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -direction * 6 }}
                  transition={{ duration: 0.12 }}
                >
                  {activeStep === 1 && 'GRADIENT AI IS ANALYZING YOUR RECEIPTS...'}
                  {activeStep === 2 && 'ALL PAID BILLS SCANNED & ARRANGED IN ONE PLACE...'}
                  {activeStep === 3 && 'GRADIENT AI IS ANALYZING YOUR BANK STATEMENT & GSTR-2B...'}
                  {activeStep === 4 && 'RECONCILIATION IN PROGRESS...'}
                  {activeStep === 5 && 'REPORT AND SHARE WITH YOUR CA'}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ─── Center Visual Stage with Cinematic Directional Transitions ─── */}
          <div className="sup-terminal-stage">
            <AnimatePresence mode="wait" custom={direction}>
              {/* ─────────────────────────────────────────────────────────────
                  STEP 1: Single Receipt Scanned with Green Laser (Screenshot 1)
                  ───────────────────────────────────────────────────────────── */}
              {activeStep === 1 && (
                <motion.div
                  key="step-1-single-scan"
                  custom={direction}
                  variants={stageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="sup-stage-frame-container"
                >
                  <motion.div
                    className="sup-receipt-wrapper"
                    initial={{ scale: 0.94, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  >
                    <div className="sup-thermal-receipt">
                      <div className="sup-receipt-grid-overlay" />

                      {/* Animated Primary Green Laser Scanning Beam */}
                      <div className="sup-laser-scanner">
                        <div className="sup-laser-gradient" />
                        <div className="sup-laser-line" />
                      </div>

                      <div className="sup-receipt-content">
                        <div className="sup-receipt-brand-row">
                          <span className="sup-receipt-header">Gradient AI</span>
                          <span className="sup-receipt-tag">OCR ACTIVE</span>
                        </div>
                        <div className="sup-receipt-meta-line">
                          <span>Terminal #3</span>
                          <span>31-03-2025</span>
                        </div>

                        <div className="sup-receipt-dotted-line" />

                        {/* QTY / ITEM / PRICE Table matching Screenshot 1 */}
                        <div className="sup-receipt-table-header">
                          <span>QTY</span>
                          <span>ITEM</span>
                          <span className="sup-receipt-price-col">PRICE</span>
                        </div>

                        <div className="sup-receipt-table-row">
                          <span>01</span>
                          <span>ARABICA BEANS (40 KG)</span>
                          <span className="sup-receipt-price-col">38,000.00</span>
                        </div>
                        <div className="sup-receipt-table-row">
                          <span>01</span>
                          <span>BARISTA OAT MILK (120L)</span>
                          <span className="sup-receipt-price-col">14,400.00</span>
                        </div>
                        <div className="sup-receipt-table-row">
                          <span>01</span>
                          <span>CUSTOM KRAFT BAGS</span>
                          <span className="sup-receipt-price-col">9,500.00</span>
                        </div>
                        <div className="sup-receipt-table-row">
                          <span>04</span>
                          <span>MONIN SYRUPS PACK</span>
                          <span className="sup-receipt-price-col">3,200.00</span>
                        </div>
                        <div className="sup-receipt-table-row">
                          <span>01</span>
                          <span>ESPRESSO MACHINE AMC</span>
                          <span className="sup-receipt-price-col">6,500.00</span>
                        </div>

                        <div className="sup-receipt-dotted-line" />

                        <div className="sup-receipt-total-row">
                          <span>TOTAL 5 ITEMS</span>
                          <span>71,600.00</span>
                        </div>

                        {/* Barcode & THANK YOU Pill */}
                        <div className="sup-barcode-container">
                          <svg className="sup-barcode-svg" viewBox="0 0 200 32" fill="#111813">
                            <rect x="0" y="0" width="3" height="32" />
                            <rect x="5" y="0" width="6" height="32" />
                            <rect x="14" y="0" width="2" height="32" />
                            <rect x="18" y="0" width="7" height="32" />
                            <rect x="28" y="0" width="3" height="32" />
                            <rect x="34" y="0" width="8" height="32" />
                            <rect x="45" y="0" width="3" height="32" />
                            <rect x="51" y="0" width="5" height="32" />
                            <rect x="59" y="0" width="7" height="32" />
                            <rect x="69" y="0" width="3" height="32" />
                            <rect x="75" y="0" width="6" height="32" />
                            <rect x="84" y="0" width="2" height="32" />
                            <rect x="89" y="0" width="5" height="32" />
                            <rect x="97" y="0" width="8" height="32" />
                            <rect x="108" y="0" width="3" height="32" />
                            <rect x="114" y="0" width="6" height="32" />
                            <rect x="123" y="0" width="2" height="32" />
                            <rect x="128" y="0" width="7" height="32" />
                            <rect x="138" y="0" width="4" height="32" />
                            <rect x="145" y="0" width="7" height="32" />
                            <rect x="155" y="0" width="3" height="32" />
                            <rect x="161" y="0" width="5" height="32" />
                            <rect x="169" y="0" width="2" height="32" />
                            <rect x="174" y="0" width="7" height="32" />
                            <rect x="184" y="0" width="4" height="32" />
                            <rect x="191" y="0" width="6" height="32" />
                          </svg>
                          <span className="sup-thankyou-capsule">THANK YOU</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 2: 3 Authentic Thermal Receipts Stacked in a Column (Screenshot 2)
                  ───────────────────────────────────────────────────────────── */}
              {activeStep === 2 && (
                <motion.div
                  key="step-2-stacked-bills"
                  custom={direction}
                  variants={stageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="sup-stage-frame-container"
                >
                  <div className="sup-stacked-receipts-stage">
                    {/* Bill 1: Blue Tokai */}
                    <motion.div
                      className="sup-stacked-thermal-card"
                      initial={{ opacity: 0, x: direction * 40, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 26, delay: 0.02 }}
                    >
                      <div className="sup-mini-receipt-inner">
                        <div className="sup-mini-receipt-head">
                          <span className="sup-mini-vendor">Blue Tokai Roasters</span>
                          <span className="sup-mini-inv">INV-8824</span>
                        </div>
                        <div className="sup-mini-receipt-body">
                          <span className="sup-mini-items">Arabica Specialty (40kg)</span>
                          <span className="sup-mini-amt">₹38,000.00</span>
                        </div>
                        <div className="sup-mini-barcode-row">
                          <span className="sup-mini-barcode" />
                          <span className="sup-mini-status">✓ SCANNED &amp; VAULTED</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Bill 2: PackCraft */}
                    <motion.div
                      className="sup-stacked-thermal-card"
                      initial={{ opacity: 0, x: direction * 40, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 26, delay: 0.05 }}
                    >
                      <div className="sup-mini-receipt-inner">
                        <div className="sup-mini-receipt-head">
                          <span className="sup-mini-vendor">PackCraft Packaging</span>
                          <span className="sup-mini-inv">INV-6419</span>
                        </div>
                        <div className="sup-mini-receipt-body">
                          <span className="sup-mini-items">PLA Cups 350ml &amp; Sleeves</span>
                          <span className="sup-mini-amt">₹9,500.00</span>
                        </div>
                        <div className="sup-mini-barcode-row">
                          <span className="sup-mini-barcode" />
                          <span className="sup-mini-status">✓ SCANNED &amp; VAULTED</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Bill 3: Barista Oat Co */}
                    <motion.div
                      className="sup-stacked-thermal-card"
                      initial={{ opacity: 0, x: direction * 40, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 26, delay: 0.08 }}
                    >
                      <div className="sup-mini-receipt-inner">
                        <div className="sup-mini-receipt-head">
                          <span className="sup-mini-vendor">Barista Dairy &amp; Oat Co.</span>
                          <span className="sup-mini-inv">INV-4120</span>
                        </div>
                        <div className="sup-mini-receipt-body">
                          <span className="sup-mini-items">Oat Milk Barista Blend (120L)</span>
                          <span className="sup-mini-amt">₹14,400.00</span>
                        </div>
                        <div className="sup-mini-barcode-row">
                          <span className="sup-mini-barcode" />
                          <span className="sup-mini-status">✓ SCANNED &amp; VAULTED</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 3 & 4: Bank Statement Scan & Reconciliation (Screenshots 3 & 4)
                  ───────────────────────────────────────────────────────────── */}
              {(activeStep === 3 || activeStep === 4) && (
                <motion.div
                  key="step-3-4-bank-reconcile"
                  custom={direction}
                  variants={stageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="sup-stage-frame-container"
                >
                  <div className="sup-recon-split-stage">
                    {/* Left: 4 Docked Micro Receipts */}
                    <div className="sup-docked-receipts-column">
                      {/* Item 0 */}
                      <div className="sup-micro-receipt-wrapper">
                        <div className="sup-micro-receipt-card">
                          <div className="sup-micro-receipt-title">Gradient AI</div>
                          <div className="sup-micro-receipt-vendor">Blue Tokai #8824</div>
                          <div className="sup-micro-receipt-price">₹38,000.00</div>
                        </div>
                        <span
                          id="sup-recon-left-0"
                          className={`sup-micro-receipt-node-anchor ${activeStep === 4 ? 'is-active' : ''}`}
                        />
                      </div>

                      {/* Item 1 */}
                      <div className="sup-micro-receipt-wrapper">
                        <div className="sup-micro-receipt-card">
                          <div className="sup-micro-receipt-title">Gradient AI</div>
                          <div className="sup-micro-receipt-vendor">Oat Co. #4120</div>
                          <div className="sup-micro-receipt-price">₹14,400.00</div>
                        </div>
                        <span
                          id="sup-recon-left-1"
                          className={`sup-micro-receipt-node-anchor ${activeStep === 4 ? 'is-active' : ''}`}
                        />
                      </div>

                      {/* Item 2 */}
                      <div className="sup-micro-receipt-wrapper">
                        <div className="sup-micro-receipt-card">
                          <div className="sup-micro-receipt-title">Gradient AI</div>
                          <div className="sup-micro-receipt-vendor">PackCraft #6419</div>
                          <div className="sup-micro-receipt-price">₹9,500.00</div>
                        </div>
                        <span
                          id="sup-recon-left-2"
                          className={`sup-micro-receipt-node-anchor ${activeStep === 4 ? 'is-active' : ''}`}
                        />
                      </div>

                      {/* Item 3 */}
                      <div className="sup-micro-receipt-wrapper">
                        <div className="sup-micro-receipt-card">
                          <div className="sup-micro-receipt-title">Gradient AI</div>
                          <div className="sup-micro-receipt-vendor">AMC Care #9910</div>
                          <div className="sup-micro-receipt-price">₹6,500.00</div>
                        </div>
                        <span
                          id="sup-recon-left-3"
                          className={`sup-micro-receipt-node-anchor ${activeStep === 4 ? 'is-active' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Right: Bank Statement & GSTR-2B Ledger Panel */}
                    <div className="sup-bank-statement-panel">
                      <div className="sup-statement-grid-overlay" />

                      {/* Laser Scanner sweeping across Bank Statement in Step 3 */}
                      {activeStep === 3 && (
                        <div className="sup-laser-scanner">
                          <div className="sup-laser-gradient" />
                          <div className="sup-laser-line" />
                        </div>
                      )}

                      <div className="sup-statement-content">
                        <div className="sup-statement-header">
                          <span className="sup-statement-icon">🏛️</span>
                          <div className="sup-statement-title-wrap">
                            <span className="sup-statement-title">Bank Statement &amp; GSTR-2B</span>
                            <span className="sup-statement-sub">HDFC CA-99201 • Auto-Sync Active</span>
                          </div>
                        </div>

                        <div className="sup-statement-balance-bar">
                          <span>Beginning Balance</span>
                          <span className="sup-statement-balance-val">₹4,56,800.00</span>
                        </div>

                        <table className="sup-statement-table">
                          <thead>
                            <tr>
                              <th>DATE</th>
                              <th>DESCRIPTION</th>
                              <th style={{ textAlign: 'right' }}>AMOUNT</th>
                              <th style={{ textAlign: 'right' }}>BALANCE</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Row 0 */}
                            <tr className={activeStep === 4 ? 'is-highlighted' : ''}>
                              <td>
                                <span
                                  id="sup-recon-right-0"
                                  className={`sup-statement-row-node-anchor ${activeStep === 4 ? 'is-active' : ''}`}
                                />
                                07/01
                              </td>
                              <td>BLUE TOKAI ROASTERS (INV-8824)</td>
                              <td className="sup-table-amt-neg">-38,000.00</td>
                              <td style={{ textAlign: 'right' }}>4,18,800.00</td>
                            </tr>

                            {/* Row 1 */}
                            <tr className={activeStep === 4 ? 'is-highlighted' : ''}>
                              <td>
                                <span
                                  id="sup-recon-right-1"
                                  className={`sup-statement-row-node-anchor ${activeStep === 4 ? 'is-active' : ''}`}
                                />
                                07/01
                              </td>
                              <td>OAT CO. BARISTA SUPPLY (INV-4120)</td>
                              <td className="sup-table-amt-neg">-14,400.00</td>
                              <td style={{ textAlign: 'right' }}>4,04,400.00</td>
                            </tr>

                            {/* Row 2 */}
                            <tr className={activeStep === 4 ? 'is-highlighted' : ''}>
                              <td>
                                <span
                                  id="sup-recon-right-2"
                                  className={`sup-statement-row-node-anchor ${activeStep === 4 ? 'is-active' : ''}`}
                                />
                                07/02
                              </td>
                              <td>PACKCRAFT SUSTAINABLE (INV-6419)</td>
                              <td className="sup-table-amt-neg">-9,500.00</td>
                              <td style={{ textAlign: 'right' }}>3,94,900.00</td>
                            </tr>

                            {/* Row 3 */}
                            <tr className={activeStep === 4 ? 'is-highlighted' : ''}>
                              <td>
                                <span
                                  id="sup-recon-right-3"
                                  className={`sup-statement-row-node-anchor ${activeStep === 4 ? 'is-active' : ''}`}
                                />
                                07/03
                              </td>
                              <td>LA MARZOCCO AMC CARE (INV-9910)</td>
                              <td className="sup-table-amt-neg">-6,500.00</td>
                              <td style={{ textAlign: 'right' }}>3,88,400.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Simple Clean Dotted Connecting Lines Linking Bills to Bank Statement in Step 4 */}
                    {activeStep === 4 && (
                      <svg
                        ref={reconSvgRef}
                        className="sup-recon-svg-lines-layer"
                        fill="none"
                      >
                        {reconCoords.map((c, i) => (
                          <line
                            key={i}
                            x1={c.x1}
                            y1={c.y1}
                            x2={c.x2}
                            y2={c.y2}
                            stroke="#1FA952"
                            strokeWidth="1.8"
                            strokeDasharray="4 5"
                            strokeLinecap="round"
                            className="sup-dotted-flowing-line"
                          />
                        ))}
                      </svg>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 5: Report and Share (Screenshot 5)
                  ───────────────────────────────────────────────────────────── */}
              {activeStep === 5 && (
                <motion.div
                  key="step-5-report-share"
                  custom={direction}
                  variants={stageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="sup-stage-frame-container"
                >
                  <div className="sup-report-share-stage">
                    {/* Left: Report Document Card */}
                    <div className="sup-report-document-card">
                      <span id="sup-report-doc-anchor" className="sup-report-doc-anchor" />
                      <div className="sup-report-doc-top">
                        <div className="sup-report-document-title">Report</div>
                        <span className="sup-report-ready-badge">✓ GSTR-3B READY</span>
                      </div>

                      <div className="sup-report-skeleton-lines">
                        <div className="sup-report-skeleton-row">
                          <span className="sup-report-skeleton-dot" />
                          <span className="sup-report-skeleton-bar" style={{ width: '130px' }} />
                        </div>
                        <div className="sup-report-skeleton-row">
                          <span className="sup-report-skeleton-dot" />
                          <span className="sup-report-skeleton-bar" style={{ width: '150px' }} />
                        </div>
                        <div className="sup-report-skeleton-row">
                          <span className="sup-report-skeleton-dot" />
                          <span className="sup-report-skeleton-bar" style={{ width: '110px' }} />
                        </div>
                        <div className="sup-report-skeleton-row">
                          <span className="sup-report-skeleton-dot" />
                          <span className="sup-report-skeleton-bar" style={{ width: '140px' }} />
                        </div>
                      </div>

                      <div className="sup-report-itc-summary">
                        <span className="sup-report-itc-label">Total ITC Claimable</span>
                        <span className="sup-report-itc-val">₹2,48,790.00</span>
                      </div>
                    </div>

                    {/* Simple Clean Dotted Connecting Lines to 3 Recipients */}
                    <svg
                      ref={shareSvgRef}
                      className="sup-report-svg-lines-layer"
                      fill="none"
                    >
                      {shareCoords.map((c, i) => (
                        <line
                          key={i}
                          x1={c.x1}
                          y1={c.y1}
                          x2={c.x2}
                          y2={c.y2}
                          stroke="#1FA952"
                          strokeWidth="1.8"
                          strokeDasharray="4 5"
                          strokeLinecap="round"
                          className="sup-dotted-flowing-line"
                        />
                      ))}
                    </svg>

                    {/* Right: 3 Recipient Avatar Nodes */}
                    <div className="sup-report-recipients-column">
                      {/* Recipient 0: Chartered Accountant (CA) */}
                      <div className="sup-recipient-avatar-node">
                        <span id="sup-recipient-anchor-0" className="sup-recipient-anchor-dot" />
                        <div className="sup-recipient-avatar-circle">
                          <Image
                            src="/supplier/avatars/accountant.jpg"
                            alt="Chartered Accountant"
                            width={56}
                            height={56}
                            className="sup-recipient-avatar-img"
                          />
                        </div>
                        <div className="sup-recipient-details">
                          <span className="sup-recipient-role">Chartered Accountant (CA)</span>
                          <span className="sup-recipient-name">Direct Audit Access &bull; Full GSTR-3B Pack</span>
                        </div>
                      </div>

                      {/* Recipient 1: Tax & GST Auditor */}
                      <div className="sup-recipient-avatar-node">
                        <span id="sup-recipient-anchor-1" className="sup-recipient-anchor-dot" />
                        <div className="sup-recipient-avatar-circle">
                          <Image
                            src="/supplier/avatars/auditor.jpg"
                            alt="Tax Auditor"
                            width={56}
                            height={56}
                            className="sup-recipient-avatar-img"
                          />
                        </div>
                        <div className="sup-recipient-details">
                          <span className="sup-recipient-role">Tax &amp; GST Auditor</span>
                          <span className="sup-recipient-name">Zero-Leakage ITC &bull; Verified 2B Ledger</span>
                        </div>
                      </div>

                      {/* Recipient 2: Café Owner & Finance */}
                      <div className="sup-recipient-avatar-node">
                        <span id="sup-recipient-anchor-2" className="sup-recipient-anchor-dot" />
                        <div className="sup-recipient-avatar-circle">
                          <Image
                            src="/supplier/avatars/cafe_owner.jpg"
                            alt="Café Finance Partner"
                            width={56}
                            height={56}
                            className="sup-recipient-avatar-img"
                          />
                        </div>
                        <div className="sup-recipient-details">
                          <span className="sup-recipient-role">Café Owner &amp; Finance</span>
                          <span className="sup-recipient-name">Instant P&amp;L Sync &bull; Automated Exports</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── 5-Step Selector Controller (Minimal Pill Bar Below Terminal) ─── */}
        <div className="sup-phase-pills-bar">
          <button
            type="button"
            className={`sup-phase-pill-btn ${activeStep === 1 ? 'is-active' : ''}`}
            onClick={() => goToStep(1)}
          >
            <span className="sup-phase-pill-num">01</span>
            <span>Scan Bill</span>
          </button>

          <button
            type="button"
            className={`sup-phase-pill-btn ${activeStep === 2 ? 'is-active' : ''}`}
            onClick={() => goToStep(2)}
          >
            <span className="sup-phase-pill-num">02</span>
            <span>All Bills Arranged</span>
          </button>

          <button
            type="button"
            className={`sup-phase-pill-btn ${activeStep === 3 ? 'is-active' : ''}`}
            onClick={() => goToStep(3)}
          >
            <span className="sup-phase-pill-num">03</span>
            <span>Scan Bank Statement</span>
          </button>

          <button
            type="button"
            className={`sup-phase-pill-btn ${activeStep === 4 ? 'is-active' : ''}`}
            onClick={() => goToStep(4)}
          >
            <span className="sup-phase-pill-num">04</span>
            <span>Reconcile GST &amp; Debits</span>
          </button>

          <button
            type="button"
            className={`sup-phase-pill-btn ${activeStep === 5 ? 'is-active' : ''}`}
            onClick={() => goToStep(5)}
          >
            <span className="sup-phase-pill-num">05</span>
            <span>Report &amp; Share with CA</span>
          </button>
        </div>

        {/* ─── Three Minimal Pillar Cards Below with React Bits PixelCard ─── */}
        <div
          className="sup-pillars-grid"
          onMouseEnter={() => {
            setIsPillarHoveredByUser(true);
            setRandomPillarIndex(null);
          }}
          onMouseLeave={() => {
            setIsPillarHoveredByUser(false);
          }}
        >
          <PixelCard
            theme="light"
            colors={['#EBF8F0', '#C2ECD4', '#1FA952', '#0D5228']}
            glowColor="#1FA952"
            gap={6}
            pixelSize={2.4}
            speed={25}
            spotlight={0.45}
            glow={0.35}
            opacity={0.7}
            fade={0.25}
            trigger="hover"
            radius={18}
            clickPulse
            intro
            introDelay={0}
            forcedActive={randomPillarIndex === 0}
            className="sup-pillar-card-pixel"
          >
            <div className="sup-pillar-content">
              <div className="sup-pillar-num">01 // INGESTION</div>
              <h3 className="sup-pillar-title">All Bills Arranged In One Place</h3>
              <p className="sup-pillar-desc">
                Snap crumpled paper slips with your phone or auto-forward email PDFs.
                Gradient AI extracts line items, HSN classifications, and vendor GSTINs into one searchable vault.
              </p>
            </div>
          </PixelCard>

          <PixelCard
            theme="light"
            colors={['#EBF8F0', '#C2ECD4', '#1FA952', '#0D5228']}
            glowColor="#1FA952"
            gap={6}
            pixelSize={2.4}
            speed={25}
            spotlight={0.45}
            glow={0.35}
            opacity={0.7}
            fade={0.25}
            trigger="hover"
            radius={18}
            clickPulse
            intro
            introDelay={140}
            forcedActive={randomPillarIndex === 1}
            className="sup-pillar-card-pixel"
          >
            <div className="sup-pillar-content">
              <div className="sup-pillar-num">02 // RECONCILIATION</div>
              <h3 className="sup-pillar-title">Automated GST &amp; Bank Statement Sync</h3>
              <p className="sup-pillar-desc">
                Three-way cross-verification: every billed rupee is cross-checked against your bank debits and government GSTR-2B portal entries to capture 100% of your claimable Input Tax Credit.
              </p>
            </div>
          </PixelCard>

          <PixelCard
            theme="light"
            colors={['#EBF8F0', '#C2ECD4', '#1FA952', '#0D5228']}
            glowColor="#1FA952"
            gap={6}
            pixelSize={2.4}
            speed={25}
            spotlight={0.45}
            glow={0.35}
            opacity={0.7}
            fade={0.25}
            trigger="hover"
            radius={18}
            clickPulse
            intro
            introDelay={280}
            forcedActive={randomPillarIndex === 2}
            className="sup-pillar-card-pixel"
          >
            <div className="sup-pillar-content">
              <div className="sup-pillar-num">03 // CA AUDIT REPORT</div>
              <h3 className="sup-pillar-title">Clean, Frictionless CA Reporting</h3>
              <p className="sup-pillar-desc">
                Chartered Accountants can log in via a read-only link or download reconciled Tally XML and Excel files. No missing bills, no midnight WhatsApp panic, and zero audit stress.
              </p>
            </div>
          </PixelCard>
        </div>
      </div>
    </section>
  );
}

export default SupplierBillSyncAudit;
