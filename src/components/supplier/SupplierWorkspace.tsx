'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { OrderWorkflowDemo, WorkflowStage } from './OrderWorkflowDemo';

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

export function SupplierWorkspace() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageCardRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const isReduced = prefersReduced ?? false;

  // Workflow demonstration state (Stages 1 through 6)
  const [currentStage, setCurrentStage] = useState<WorkflowStage>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeSidebar, setActiveSidebar] = useState<string>('Orders');
  const [hasInteractedManually, setHasInteractedManually] = useState<boolean>(false);

  // Scroll choreography (Phase 5):
  // As the section enters the viewport, the dashboard straightens from 3.5deg tilt to 0deg and scales from 0.93 to 1.0
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'start 20%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.35,
  });

  const stageRotateX = useTransform(smoothProgress, [0, 1], [isReduced ? 0 : 3.5, 0]);
  const stageScale = useTransform(smoothProgress, [0, 1], [isReduced ? 1 : 0.93, 1]);
  const stageY = useTransform(smoothProgress, [0, 1], [isReduced ? 0 : 60, 0]);

  // Autoplay loop timer (12–16 seconds cycle)
  useEffect(() => {
    if (!isPlaying) return;

    const stageDurations: Record<WorkflowStage, number> = {
      1: 2500, // Order arrival
      2: 2400, // Review details
      3: 2000, // Accept & Confirm
      4: 2600, // Pack & Checklist
      5: 2800, // Dispatch Route & GPS Tracking
      6: 3000, // Completed & Escrow Payout
    };

    const timer = setTimeout(() => {
      setCurrentStage((prev) => {
        if (prev === 6) return 1;
        return (prev + 1) as WorkflowStage;
      });
    }, stageDurations[currentStage]);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStage]);

  const handleStageSelect = (stage: WorkflowStage) => {
    setCurrentStage(stage);
    setHasInteractedManually(true);
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStage(1);
    setIsPlaying(true);
    setHasInteractedManually(false);
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

  const getDemoStatusLabel = (): string => {
    switch (currentStage) {
      case 1:
        return 'NEW ORDER · INGEST';
      case 2:
        return 'REVIEWING SPECS';
      case 3:
        return 'CONFIRMED ✓';
      case 4:
        return 'PACKING & SEALED';
      case 5:
        return 'VAN 04 EN ROUTE';
      case 6:
        return 'DELIVERED · SETTLED';
      default:
        return 'NEW ORDER';
    }
  };

  return (
    <section
      className="sup-workspace-section"
      id="order-workspace"
      ref={containerRef}
      aria-label="Interactive Supplier Cockpit"
    >
      <div className="sup-container">
        {/* Section Header */}
        <div className="sup-workspace-header">
          <div className="sup-workspace-badge">
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--sup-fresh)',
              }}
            />
            <span>OPERATIONAL COCKPIT DEMONSTRATION</span>
          </div>

          <h2 className="sup-workspace-title">
            From arrival to settlement, watch the fulfillment engine move.
          </h2>

          <p className="sup-workspace-desc">
            An automated walkthrough demonstrating how incoming café POs are verified, packaged into returnable crates, and tracked live to barista delivery.
          </p>
        </div>

        {/* Workspace Interactive Demo Controls Bar */}
        <div className="sup-demo-controller">
          <div className="sup-stage-scrubber">
            <button
              type="button"
              className={`sup-step-pill ${currentStage === 1 ? 'active' : ''}`}
              onClick={() => handleStageSelect(1)}
            >
              <span className="sup-step-num">01</span>
              <span>Order Received</span>
            </button>

            <button
              type="button"
              className={`sup-step-pill ${currentStage === 2 ? 'active' : ''}`}
              onClick={() => handleStageSelect(2)}
            >
              <span className="sup-step-num">02</span>
              <span>Café Connect</span>
            </button>

            <button
              type="button"
              className={`sup-step-pill ${currentStage === 3 ? 'active' : ''}`}
              onClick={() => handleStageSelect(3)}
            >
              <span className="sup-step-num">03</span>
              <span>Accept / Reject</span>
            </button>

            <button
              type="button"
              className={`sup-step-pill ${currentStage === 4 ? 'active' : ''}`}
              onClick={() => handleStageSelect(4)}
            >
              <span className="sup-step-num">04</span>
              <span>Prepare &amp; Pack</span>
            </button>

            <button
              type="button"
              className={`sup-step-pill ${currentStage === 5 ? 'active' : ''}`}
              onClick={() => handleStageSelect(5)}
            >
              <span className="sup-step-num">05</span>
              <span>Dispatch Route</span>
            </button>

            <button
              type="button"
              className={`sup-step-pill ${currentStage === 6 ? 'active' : ''}`}
              onClick={() => handleStageSelect(6)}
            >
              <span className="sup-step-num">06</span>
              <span>Delivery Completed</span>
            </button>
          </div>

          <div className="sup-demo-playback">
            <button
              type="button"
              className={`sup-playback-btn ${isPlaying ? 'active-play' : ''}`}
              onClick={handleTogglePlay}
              aria-label={isPlaying ? 'Pause Demo' : 'Play Demo'}
            >
              {isPlaying ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  <span>Pause Demo</span>
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Play Walkthrough</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="sup-playback-btn"
              onClick={handleReset}
              aria-label="Reset and Replay Demo"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* ─── 16:9 Workspace Browser Stage on Green Cutting Mat (Relume exact visual) ─── */}
        <motion.div
          className="sup-stage-cutting-mat"
          style={{
            rotateX: stageRotateX,
            scale: stageScale,
            y: stageY,
            transformPerspective: 1200,
          }}
        >
          <div
            className="sup-stage-container"
            ref={stageCardRef}
          >
            {/* ─── LEFT: Dark Forest Green Sidebar ─── */}
            <aside className="sup-sidebar" aria-label="Supplier Workspace Navigation">
              <div>
                {/* Brand & Hub Identity */}
                <div className="sup-sidebar-brand">
                  <div className="sup-sidebar-brand-mark">G</div>
                  <div className="sup-sidebar-brand-text">
                    <span className="sup-sidebar-brand-name">Blue Tokai Roastery</span>
                    <span className="sup-sidebar-hub-name">Depot Hub · Koramangala</span>
                  </div>
                </div>

                {/* Navigation Items */}
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
                    const isActive = activeSidebar === item.name;
                    return (
                      <li
                        key={item.name}
                        className={`sup-sidebar-item ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveSidebar(item.name)}
                      >
                        <div className="sup-sidebar-item-left">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d={item.icon} />
                          </svg>
                          <span>{item.name}</span>
                        </div>
                        {item.count && (
                          <span className="sup-sidebar-count-badge">{item.count}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Sidebar User Profile Footer */}
              <div className="sup-sidebar-footer">
                <div className="sup-user-badge">
                  <div className="sup-user-avatar">VS</div>
                  <div className="sup-user-info">
                    <span className="sup-user-name">Vikram S.</span>
                    <span className="sup-user-role">Head of Ops</span>
                  </div>
                </div>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--sup-fresh)',
                  }}
                  title="Active Connection"
                />
              </div>
            </aside>

            {/* ─── RIGHT: Main Dashboard Stage Canvas ─── */}
            <main className="sup-main-canvas">
              {/* Top Bar (Relume style with collaborator avatars & action buttons) */}
              <div className="sup-topbar">
                <div className="sup-topbar-left">
                  <h3 className="sup-topbar-title">Incoming Wholesale Orders</h3>
                  <span className="sup-status-live-pill">
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--sup-fresh)',
                      }}
                    />
                    <span>Accepting orders</span>
                  </span>
                </div>

                <div className="sup-topbar-right">
                  <div className="sup-search-input">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span>Search POs, SKU, Café...</span>
                  </div>

                  {/* Collaborator Avatars (Relume exact visual) */}
                  <div style={{ display: 'flex', alignItems: 'center', marginLeft: '6px', marginRight: '6px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#15803D', color: '#fff', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFFFFF', zIndex: 3 }} title="Priya (Head Barista)">
                      PS
                    </div>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#D97706', color: '#fff', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFFFFF', marginLeft: '-8px', zIndex: 2 }} title="Ramesh (EV Fleet)">
                      RK
                    </div>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0284C7', color: '#fff', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFFFFF', marginLeft: '-8px', zIndex: 1 }} title="Vikram (Roastery Ops)">
                      VS
                    </div>
                  </div>

                  {/* Share button */}
                  <button
                    type="button"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid var(--sup-border)',
                      borderRadius: '7px',
                      padding: '5px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--sup-text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    Share
                  </button>

                  {/* Relume Publish / Dispatch Action Button */}
                  <button
                    type="button"
                    style={{
                      background: 'var(--sup-primary)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '7px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
                    }}
                  >
                    <span>Dispatch Batch</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* 3 Compact Operational Metrics */}
              <div className="sup-metrics-strip">
                <div className="sup-metric-tile">
                  <div className="sup-metric-label">New Orders Today</div>
                  <div className="sup-metric-value-row">
                    <span className="sup-metric-num">12</span>
                    <span className="sup-metric-tag">+3 since 10am · ₹98.4K</span>
                  </div>
                </div>

                <div className="sup-metric-tile">
                  <div className="sup-metric-label">Fulfillment Queue</div>
                  <div className="sup-metric-value-row">
                    <span className="sup-metric-num">4</span>
                    <span className="sup-metric-tag" style={{ color: '#D97706' }}>1 urgent cutoff</span>
                  </div>
                </div>

                <div className="sup-metric-tile">
                  <div className="sup-metric-label">Dispatch On-Time Rate</div>
                  <div className="sup-metric-value-row">
                    <span className="sup-metric-num">98.4%</span>
                    <span className="sup-metric-tag" style={{ color: 'var(--sup-primary)' }}>3 routes active</span>
                  </div>
                </div>
              </div>

              {/* Orders Table & Interactive Order Overlay */}
              <div className="sup-orders-body" style={{ position: 'relative' }}>
                {/* ─── Relume-Style Floating Collaborative Cursors ─── */}
                <div
                  className="sup-collab-cursor"
                  style={{
                    top: '28px',
                    right: '80px',
                  }}
                >
                  <div className="sup-collab-pointer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#15803D">
                      <polygon points="3 3 10 21 14 14 21 10 3 3" />
                    </svg>
                    <div className="sup-collab-avatar" style={{ background: '#15803D' }}>
                      PS
                    </div>
                    <span className="sup-collab-tag" style={{ background: '#15803D' }}>
                      Priya (Head Barista)
                    </span>
                  </div>
                  <div className="sup-collab-bubble">
                    &quot;Airtight degassing valve verified. Ready for Koramangala 12:00 PM rush!&quot;
                  </div>
                </div>

                <div
                  className="sup-collab-cursor"
                  style={{
                    bottom: '40px',
                    right: '180px',
                  }}
                >
                  <div className="sup-collab-pointer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#D97706">
                      <polygon points="3 3 10 21 14 14 21 10 3 3" />
                    </svg>
                    <div className="sup-collab-avatar" style={{ background: '#D97706' }}>
                      RK
                    </div>
                    <span className="sup-collab-tag" style={{ background: '#D97706' }}>
                      Ramesh (EV Fleet)
                    </span>
                  </div>
                </div>

                <div className="sup-orders-table-card">
                  <div className="sup-table-head">
                    <div>Order ID</div>
                    <div>Café &amp; Outlet</div>
                    <div>Items &amp; Quantity</div>
                    <div>Total</div>
                    <div>Delivery Window</div>
                    <div>Status</div>
                    <div style={{ textAlign: 'right' }}>Action</div>
                  </div>

                  {INITIAL_ORDERS.map((ord) => {
                    const isDemoRow = ord.isDemoTarget;
                    const displayStatus = isDemoRow ? getDemoOrderStatus() : ord.status;
                    const displayLabel = isDemoRow ? getDemoStatusLabel() : ord.statusLabel;

                    return (
                      <div
                        key={ord.id}
                        className={`sup-table-row ${isDemoRow ? 'highlighted-order' : ''}`}
                        onClick={() => {
                          if (isDemoRow) {
                            handleStageSelect(2);
                          }
                        }}
                      >
                        <div className="sup-order-id">{ord.id}</div>
                        <div className="sup-cafe-col">
                          <span className="sup-cafe-name">{ord.cafe}</span>
                          <span className="sup-cafe-outlet">{ord.outlet}</span>
                        </div>
                        <div style={{ color: 'var(--sup-text-secondary)', fontSize: '12.5px' }}>
                          {ord.items}
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--sup-text-primary)' }}>
                          {ord.total}
                        </div>
                        <div style={{ color: 'var(--sup-text-secondary)', fontSize: '12px' }}>
                          {ord.window}
                        </div>
                        <div>
                          <span className={`sup-status-badge ${displayStatus}`}>
                            {displayLabel}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="sup-action-btn-mini"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isDemoRow) {
                                handleStageSelect(2);
                              }
                            }}
                          >
                            {isDemoRow ? 'View Flow' : 'Details'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dynamic Demonstration Drawer/Overlay (Stages 2-6) */}
                <OrderWorkflowDemo
                  currentStage={currentStage}
                  onStageChange={handleStageSelect}
                  isPlaying={isPlaying}
                  onTogglePlay={handleTogglePlay}
                  onReset={handleReset}
                />
              </div>
            </main>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
