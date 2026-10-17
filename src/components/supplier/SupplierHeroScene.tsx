'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { ThreePackagingScene } from './ThreePackagingScene';
import { OrderWorkflowDemo, WorkflowStage } from './OrderWorkflowDemo';
import { GhostType } from '@/components/ui/ghost-type';
import { BorderBeam } from '@/components/ui/border-beam';
import DotGrid from '@/components/ui/DotGrid';

interface OrderItem {
  id: string;
  cafe: string;
  outlet: string;
  items: string;
  total: string;
  window: string;
  status: 'new' | 'confirmed' | 'packing' | 'dispatched' | 'completed' | 'rejected';
  statusLabel: string;
  isDemoTarget?: boolean;
}

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: '#GRB-1048',
    cafe: 'Blue Tokai',
    outlet: 'Koramangala · Outlet #04',
    items: 'Arabica AA · 10kg',
    total: '₹8,200',
    window: 'Today · 12:05 PM',
    status: 'new',
    statusLabel: 'NEW ORDER',
    isDemoTarget: true,
  },
  {
    id: '#GRB-1047',
    cafe: 'Subko Specialty',
    outlet: 'Bandra West · Flagship',
    items: 'Ratnagiri Peaberry · 5kg',
    total: '₹4,800',
    window: 'Today · 01:30 PM',
    status: 'dispatched',
    statusLabel: 'DISPATCHED',
  },
  {
    id: '#GRB-1046',
    cafe: 'Third Wave Coffee',
    outlet: 'Indiranagar 100ft Rd',
    items: 'Cold Brew Blend · 15kg',
    total: '₹11,250',
    window: 'Today · 02:00 PM',
    status: 'confirmed',
    statusLabel: 'CONFIRMED',
  },
  {
    id: '#GRB-1045',
    cafe: 'Araku Coffee',
    outlet: 'Jubilee Hills · Hub',
    items: 'Micro-lot Selection · 8kg',
    total: '₹7,400',
    window: 'Today · 03:15 PM',
    status: 'completed',
    statusLabel: 'COMPLETED',
  },
];

interface SupplierHeroSceneProps {
  onJoinClick?: () => void;
}

export function SupplierHeroScene({ onJoinClick }: SupplierHeroSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const isReduced = prefersReduced ?? false;


  // Scroll Choreography (Phase 4):
  // Drives the pinned dashboard rise from bottom of viewport into dead center
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 26,
    mass: 0.25,
  });

  // Track numeric scroll progress for Three.js 3D scene
  const [scrollP, setScrollP] = useState(0);
  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    setScrollP(latest);
  });

  // 1. Hero Content choreography:
  // Fades out and moves upward as user scrolls from 0 to 0.4
  const heroY = useTransform(smoothProgress, [0, 0.42], [0, isReduced ? 0 : -140]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.32], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.4], [1, isReduced ? 1 : 0.95]);
  const heroPointerEvents = useTransform(smoothProgress, (p) => (p > 0.32 ? 'none' : 'auto'));


  // 3. Dashboard Rising Stage choreography:
  // Starts with master toolbar & cutting mat peeking higher at bottom of viewport (64vh), then rises into dead center (0vh)
  const dashboardY = useTransform(
    smoothProgress,
    [0, 0.48, 0.86, 1],
    isReduced ? ['0vh', '0vh', '0vh', '0vh'] : ['64vh', '0vh', '0vh', '-10vh']
  );
  const dashboardScale = useTransform(
    smoothProgress,
    [0, 0.48],
    isReduced ? [1, 1] : [0.94, 1]
  );
  const dashboardRotateX = useTransform(
    smoothProgress,
    [0, 0.48],
    isReduced ? [0, 0] : [3.5, 0]
  );

  // Workflow demonstration state (Stages 1 through 6)
  const [currentStage, setCurrentStage] = useState<WorkflowStage>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('Orders');

const STAGE_DURATIONS: Record<WorkflowStage, number> = {
  1: 2800, // Order arrival
  2: 3000, // Café Owner Connect
  3: 2600, // Accept & Confirm
  4: 3000, // Pack & Checklist
  5: 3400, // Dispatch Route & GPS Tracking
  6: 3600, // Completed & Escrow Payout
};

  // Autoplay loop timer (continuous perpetual loop through all 6 stages)
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      setCurrentStage((prev) => (prev === 6 ? 1 : ((prev + 1) as WorkflowStage)));
    }, STAGE_DURATIONS[currentStage]);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStage]);

  const handleStageSelect = (stage: WorkflowStage) => {
    setCurrentStage(stage);
    setIsPlaying(true);
  };
  const handleTogglePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setCurrentStage(1);
    setIsPlaying(true);
  };

  const getDemoOrderStatus = (): OrderItem['status'] => {
    switch (currentStage) {
      case 1:
      case 2:
        return 'new';
      case 3:
        return 'confirmed';
      case 4:
        return 'packing';
      case 5:
        return 'dispatched';
      case 6:
        return 'completed';
      default:
        return 'new';
    }
  };

  return (
    <section
      className="sup-hero-scene"
      ref={sceneRef}
      id="hero-scene"
      aria-label="Grabbit Supplier Portal Hero and Interactive Cockpit"
    >
      {/* ─── Pinned Sticky Stage (Occupies 100vh during the 240vh scroll scrub) ─── */}
      <div className="sup-sticky-stage">
        {/* ─── REACT BITS DOTGRID BACKGROUND (WebGL2 Interactive Physics) ─── */}
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

        {/* ─── REAL-TIME THREE.JS 3D ISOMETRIC GRID STRUCTURES ─── */}
        <ThreePackagingScene scrollProgress={scrollP} />


        {/* ─── CENTER: Relume-Inspired Minimal Hero Typography & Prompt Card ─── */}
        <motion.div
          className="sup-hero-content"
          style={{
            y: heroY,
            opacity: heroOpacity,
            scale: heroScale,
            pointerEvents: heroPointerEvents as unknown as React.CSSProperties['pointerEvents'],
          }}
        >
          {/* Eyebrow: Vibrant uppercase tracked text, matching Relume cadence */}
          <div className="sup-hero-eyebrow-relume">
            TRUSTED BY 340+ SPECIALTY ROASTERS &amp; DISTRIBUTORS
          </div>

          {/* AI-Style Ghost Type Headline (React Bits Pro) */}
          <GhostType
            as="h1"
            className="sup-hero-headline"
            text="Every café order."
            breakAfterBase={true}
            completions={[
              "You’d actually fulfill.",
              "Roasted, packed, dispatched.",
              "Ready to pack and ship.",
              "Settled in 24 hours.",
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

          {/* Subtitle: Restrained, generous line height */}
          <p className="sup-hero-sub">
            Receive wholesale orders, manage inventory, and move every delivery forward—all from one supplier workspace.
          </p>

          {/* Clean Minimal Hero CTA Buttons */}
          <div className="sup-hero-btn-group">
            <button
              type="button"
              onClick={onJoinClick}
              className="sup-btn-hero-primary"
            >
              <span>Join as a Supplier</span>
              <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as unknown as { lenis?: { scrollTo: (y: number, opts?: { duration?: number }) => void } }).lenis) {
                  (window as unknown as { lenis: { scrollTo: (y: number, opts?: { duration?: number }) => void } }).lenis.scrollTo(850, { duration: 1.2 });
                } else {
                  window.scrollTo({ top: 850, behavior: 'smooth' });
                }
              }}
              className="sup-btn-hero-secondary"
            >
              <BorderBeam
                size={48}
                duration={4}
                borderWidth={1.5}
                colorFrom="#15803D"
                colorTo="#86efac"
              />
              <span>See how it works</span>
              <span aria-hidden="true">↓</span>
            </button>
          </div>
        </motion.div>

        {/* ─── CRITICAL INTERACTION: Dashboard Rising Stage on Green Cutting Mat ─── */}
        <motion.div
          className="sup-dashboard-rising-stage"
          style={{
            y: dashboardY,
            scale: dashboardScale,
            rotateX: dashboardRotateX,
            transformPerspective: 1200,
          }}
          id="order-workspace"
        >
          {/* Target anchor for #demo */}
          <div id="demo" style={{ position: 'absolute', top: '-100px', pointerEvents: 'none' }} aria-hidden="true" />

          {/* Green Cutting Mat Sheet framing the Dashboard */}
          <div className="sup-stage-cutting-mat">
            {/* ─── UNIFIED RELUME-STYLE MASTER TOOLBAR ATOP THE CUTTING MAT ─── */}
            <div className="sup-mat-master-toolbar">
              {/* Left: Brand / Depot dropdown selector */}
              <div className="sup-mat-brand-badge">
                <span className="brand-dot" />
                <span className="brand-title">Blue Tokai Roastery</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Center: The 6 Interactive Workflow Stage Pills */}
              <div className="sup-mat-stage-pills" role="tablist" aria-label="Order Workflow Stages">
                {[
                  { stage: 1, num: '01', label: 'Received' },
                  { stage: 2, num: '02', label: 'Connect' },
                  { stage: 3, num: '03', label: 'Accept' },
                  { stage: 4, num: '04', label: 'Pack' },
                  { stage: 5, num: '05', label: 'Dispatch' },
                  { stage: 6, num: '06', label: 'Escrow' },
                ].map(({ stage, num, label }) => {
                  const isActive = currentStage === stage;
                  const isCompleted = currentStage > stage;
                  return (
                    <button
                      key={stage}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`sup-step-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      onClick={() => handleStageSelect(stage as WorkflowStage)}
                    >
                      <span className="sup-pill-idx">{isCompleted ? '✓' : num}</span>
                      <span>{label}</span>
                      {isActive && isPlaying && (
                        <motion.span
                          className="sup-step-pill-progress"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{
                            duration: (STAGE_DURATIONS[currentStage] || 3000) / 1000,
                            ease: 'linear',
                          }}
                          key={`pill-progress-${currentStage}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right: Collaborators + Demo Playback + Primary Action */}
              <div className="sup-mat-actions-right">
                <div className="sup-collab-stack" title="3 collaborators active in workspace">
                  <div className="sup-collab-avatar-stack" style={{ background: '#15803D' }}>PS</div>
                  <div className="sup-collab-avatar-stack" style={{ background: '#D97706' }}>RK</div>
                  <div className="sup-collab-avatar-stack" style={{ background: '#0284C7' }}>VS</div>
                </div>

                <button
                  type="button"
                  className={`sup-playback-btn ${isPlaying ? 'active-play' : ''}`}
                  onClick={handleTogglePlay}
                  aria-label={isPlaying ? 'Pause Demo' : 'Play Walkthrough'}
                >
                  {isPlaying ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      <span>Play</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="sup-mat-dispatch-btn"
                  onClick={onJoinClick}
                >
                  <span>Dispatch Batch</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>

            {/* 16:9 Operational Dashboard Card */}
            <div className="sup-stage-container">
              {/* Sidebar */}
              <aside className="sup-sidebar" aria-label="Supplier Workspace Navigation">
                <div>
                  <div className="sup-sidebar-brand">
                    <div className="sup-sidebar-brand-mark">G</div>
                    <div className="sup-sidebar-brand-text">
                      <span className="sup-sidebar-brand-name">Blue Tokai Roastery</span>
                      <span className="sup-sidebar-hub-name">Depot Hub · Koramangala</span>
                    </div>
                  </div>

                  <ul className="sup-sidebar-nav">
                    {[
                      { name: 'Overview', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
                      { name: 'Orders', icon: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0', count: '12' },
                      { name: 'Catalogue', icon: 'M4 6h16M4 12h16M4 18h7' },
                      { name: 'Inventory', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
                      { name: 'Dispatch', icon: 'M1 3h15v13H1zM16 8h4l3 3v5h-7z' },
                      { name: 'Invoices', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6' },
                      { name: 'Analytics', icon: 'M18 20V10M12 20V4M6 20v-6' },
                      { name: 'Settings', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
                    ].map((item) => {
                      const isActive = activeTab === item.name;
                      return (
                        <li
                          key={item.name}
                          className={`sup-sidebar-item ${isActive ? 'active' : ''}`}
                          onClick={() => setActiveTab(item.name)}
                        >
                          <div className="sup-sidebar-item-left">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d={item.icon} />
                            </svg>
                            <span>{item.name}</span>
                          </div>
                          {item.count && <span className="sup-sidebar-count">{item.count}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="sup-sidebar-user">
                  <div className="sup-user-avatar">VS</div>
                  <div className="sup-user-info">
                    <span className="sup-user-name">Vikram S.</span>
                    <span className="sup-user-role">Head of Ops</span>
                  </div>
                  <div className="sup-user-status" />
                </div>
              </aside>

              {/* Main Workspace Cockpit */}
              <main className="sup-cockpit-main" aria-label="Incoming Wholesale Orders List">
                {/* Cockpit Subbar: Real-time search filter and status tabs */}
                <header className="sup-cockpit-subbar">
                  <div className="sup-subbar-search">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span>Filter active orders, roast lots or destination cafés…</span>
                  </div>

                  <div className="sup-subbar-filters">
                    {['All Orders (12)', 'Fulfillment (4)', 'Dispatched (3)', 'Settled (5)'].map((tab) => {
                      const isTabActive = activeTab === tab || (activeTab === 'Orders' && tab.startsWith('All'));
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={`sup-subbar-chip ${isTabActive ? 'active' : ''}`}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  <div className="sup-subbar-status-chip">
                    <span className="live-dot" />
                    <span>Live ESCROW Active</span>
                  </div>
                </header>

                {/* Workflow Demonstration Viewport */}
                <div className="sup-workflow-content-viewport" style={{ width: '100%' }}>
                  {currentStage <= 3 ? (
                    <>
                      {/* Embedded Workflow Demo Layer for Stages 1, 2, 3 */}
                      <OrderWorkflowDemo
                        currentStage={currentStage}
                        onStageChange={(newStage) => setCurrentStage(newStage)}
                        isPlaying={isPlaying}
                        onTogglePlay={handleTogglePlay}
                        onReset={handleReset}
                      />

                      {/* Orders Table */}
                      <div className="sup-orders-table-card" style={{ margin: '0 24px 20px' }}>
                        <div className="sup-table-head">
                          <div>ORDER ID</div>
                          <div>CAFÉ &amp; OUTLET</div>
                          <div>ITEMS &amp; QUANTITY</div>
                          <div>TOTAL</div>
                          <div>DELIVERY WINDOW</div>
                          <div>STATUS</div>
                          <div>ACTION</div>
                        </div>

                        <div className="sup-table-body">
                          {INITIAL_ORDERS.map((order) => {
                            const isTarget = order.isDemoTarget;
                            const displayStatus = isTarget ? getDemoOrderStatus() : order.status;
                            const isHighlighted = isTarget && currentStage >= 1;

                            return (
                              <div
                                key={order.id}
                                className={`sup-table-row ${isHighlighted ? 'demo-active-row' : ''}`}
                                onClick={() => {
                                  if (isTarget) {
                                    setCurrentStage(2);
                                    setIsPlaying(true);
                                  }
                                }}
                              >
                                <div className="sup-cell-id">{order.id}</div>
                                <div className="sup-cell-cafe">
                                  <span className="sup-cafe-name">{order.cafe}</span>
                                  <span className="sup-cafe-outlet">{order.outlet}</span>
                                </div>
                                <div className="sup-cell-items">{order.items}</div>
                                <div className="sup-cell-total">{order.total}</div>
                                <div className="sup-cell-window">{order.window}</div>
                                <div className="sup-cell-status">
                                  <span className={`sup-badge status-${displayStatus}`}>
                                    {displayStatus.toUpperCase()}
                                  </span>
                                </div>
                                <div className="sup-cell-action">
                                  {isTarget ? (
                                    <button
                                      type="button"
                                      className={`sup-row-action-btn ${currentStage >= 3 ? 'locked' : ''}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (currentStage === 1) setCurrentStage(2);
                                        else if (currentStage === 2) setCurrentStage(3);
                                        else setCurrentStage(4);
                                        setIsPlaying(true);
                                      }}
                                    >
                                      <span>
                                        {currentStage === 1 ? 'Connect' : currentStage === 2 ? 'Decide' : 'Batch Locked'}
                                      </span>
                                      <span className="sup-btn-arrow" aria-hidden="true">
                                        {currentStage >= 3 ? '✓' : '→'}
                                      </span>
                                    </button>
                                  ) : (
                                    <span className="sup-action-static">
                                      <span className="sup-action-static-dot" />
                                      <span>Managed</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Dedicated Cinema Fulfillment Stages 4, 5, 6 */
                    <OrderWorkflowDemo
                      currentStage={currentStage}
                      onStageChange={(newStage) => setCurrentStage(newStage)}
                      isPlaying={isPlaying}
                      onTogglePlay={handleTogglePlay}
                      onReset={handleReset}
                    />
                  )}
                </div>
              </main>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
