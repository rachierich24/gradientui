'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type WorkflowStage = 1 | 2 | 3 | 4 | 5 | 6;

export interface WorkflowStageInfo {
  num: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  durationMs: number;
}

export const WORKFLOW_STAGES: Record<WorkflowStage, WorkflowStageInfo> = {
  1: {
    num: '01',
    shortLabel: 'Received',
    title: 'Café Places Wholesale Order',
    subtitle: 'Blue Tokai (Koramangala) places wholesale order #GRB-1048 for 10kg Arabica AA.',
    durationMs: 2800,
  },
  2: {
    num: '02',
    shortLabel: 'Connect',
    title: 'Café Owner Real-Time Connect',
    subtitle: 'Head Barista Priya connects live with roastery with roast notes & valve specifications.',
    durationMs: 3000,
  },
  3: {
    num: '03',
    shortLabel: 'Accept',
    title: '1-Click Accept / Reject Decision',
    subtitle: 'Supplier validates depot inventory and locks batch #AA-409 with automated sync.',
    durationMs: 2600,
  },
  4: {
    num: '04',
    shortLabel: 'Pack',
    title: 'Parcel Picking & Quality Verification',
    subtitle: '10kg Arabica AA weighed to 10.45kg gross, degassing valve sealed, and QR affixed.',
    durationMs: 3000,
  },
  5: {
    num: '05',
    shortLabel: 'Dispatch',
    title: 'EV Fleet Delivery in Transit',
    subtitle: 'Ramesh (EV Fleet) dispatches crate #C-88 with live GPS route and temperature tracking.',
    durationMs: 3400,
  },
  6: {
    num: '06',
    shortLabel: 'Escrow',
    title: 'Order Fulfilled & Escrow Released',
    subtitle: 'Barista verifies ePOD on glass; ₹8,200 payment is instantly released to supplier account.',
    durationMs: 3600,
  },
};

interface OrderWorkflowDemoProps {
  currentStage: WorkflowStage;
  onStageChange: (stage: WorkflowStage) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

export function OrderWorkflowDemo({
  currentStage,
  onStageChange,
  isPlaying,
  onTogglePlay,
  onReset,
}: OrderWorkflowDemoProps) {
  const [isRejected, setIsRejected] = useState(false);
  const [vanProgress, setVanProgress] = useState(15);
  const [checklistIndex, setChecklistIndex] = useState(0);

  // Progressive checklist ticks during Stage 4
  useEffect(() => {
    if (currentStage === 4) {
      setChecklistIndex(1);
      const t1 = setTimeout(() => setChecklistIndex(2), 600);
      const t2 = setTimeout(() => setChecklistIndex(3), 1200);
      const t3 = setTimeout(() => setChecklistIndex(4), 1800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else if (currentStage > 4) {
      setChecklistIndex(4);
    } else {
      setChecklistIndex(0);
    }
  }, [currentStage]);

  // Van progress along route during Stage 5
  useEffect(() => {
    if (currentStage === 5) {
      setVanProgress(18);
      const timer = setTimeout(() => {
        setVanProgress(88);
      }, 400);
      return () => clearTimeout(timer);
    } else if (currentStage === 6) {
      setVanProgress(96);
    } else {
      setVanProgress(15);
    }
  }, [currentStage]);

  const handleManualAccept = () => {
    setIsRejected(false);
    onStageChange(4);
  };

  const handleManualReject = () => {
    setIsRejected(true);
    if (isPlaying) {
      onTogglePlay();
    }
  };
  return (
    <div className="sup-motion-container">

      {/* ─── STAGE 1: ORDER ARRIVAL TOAST (When in table view) ─── */}
      <AnimatePresence>
        {currentStage === 1 && (
          <motion.div
            className="sup-stage1-banner"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.24 }}
          >
            <div className="sup-stage1-badge">
              <span className="sup-pulse-ring" />
              <span>JUST RECEIVED</span>
            </div>
            <div className="sup-stage1-detail">
              <strong>PO #GRB-1048</strong> from <strong>Blue Tokai Koramangala</strong> · 10kg Arabica AA (₹8,200) · Auto-assigned to Roastery Bay
            </div>
            <button
              type="button"
              className="sup-stage1-cta"
              onClick={() => onStageChange(2)}
            >
              <span>Connect with Café →</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── STAGE 2: CAFÉ OWNER CONNECT DRAWER ─── */}
      <AnimatePresence>
        {currentStage === 2 && (
          <motion.div
            className="sup-connect-drawer"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="sup-connect-header">
              <div className="sup-connect-user">
                <div className="sup-connect-avatar">PS</div>
                <div>
                  <div className="sup-connect-name">Priya S. · Head Barista &amp; Café Manager</div>
                  <div className="sup-connect-sub">Blue Tokai Coffee Roasters · Koramangala Outlet #04</div>
                </div>
              </div>
              <div className="sup-connect-badge">
                <span className="brand-dot" />
                <span>ONLINE NOW</span>
              </div>
            </div>

            {/* Chat Exchange */}
            <div className="sup-connect-chat">
              <div className="sup-chat-msg cafe">
                <div className="sup-msg-bubble">
                  &ldquo;Hi Vikram! For lot <strong>#GRB-1048</strong>, please ensure one-way degassing valves on the 10kg roast bags. Prepping for our 12:00 PM rush!&rdquo;
                </div>
                <span className="sup-msg-time">Today 10:42 AM · Verified Café Order Note</span>
              </div>

              <div className="sup-chat-msg supplier">
                <div className="sup-msg-bubble reply">
                  &ldquo;Confirmed Priya! Batch #AA-409 roasted this morning is queued on the packing bay. Valve seals verified.&rdquo;
                </div>
                <span className="sup-msg-time">Vikram S. (Supplier Ops) · 10:43 AM</span>
              </div>
            </div>

            {/* Bottom action */}
            <div className="sup-connect-footer">
              <span className="sup-connect-hint">Order specs confirmed with buyer. Ready for decision.</span>
              <button
                type="button"
                className="sup-btn-accept-sm"
                onClick={() => onStageChange(3)}
              >
                <span>Proceed to Accept Order →</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── STAGE 3: ACCEPT / REJECT DECISION DOCK ─── */}
      <AnimatePresence>
        {currentStage === 3 && (
          <motion.div
            className="sup-decision-dock"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sup-decision-header">
              <div className="sup-decision-title">
                <span className="sup-verified-check">✓</span>
                <span>Depot Capacity &amp; Roast Inventory Verified</span>
              </div>
              <div className="sup-decision-total">
                <span>Total Wholesale Value:</span>
                <strong>₹8,200.00</strong>
              </div>
            </div>

            {isRejected ? (
              <div className="sup-reject-card">
                <div className="sup-reject-title">Capacity Limit Reached (Order Rejected)</div>
                <div className="sup-reject-desc">
                  Café notified to select alternative roasted blend from Indiranagar depot. Demonstration paused.
                </div>
                <button
                  type="button"
                  className="sup-reject-reset-btn"
                  onClick={() => {
                    setIsRejected(false);
                    onStageChange(3);
                  }}
                >
                  ↺ Reset and Accept Order
                </button>
              </div>
            ) : (
              <div className="sup-decision-body">
                <div className="sup-decision-summary">
                  <div className="sup-decision-item">
                    <span className="label">Roast Lot</span>
                    <span className="val">Batch #AA-409 (10kg Reserve)</span>
                  </div>
                  <div className="sup-decision-item">
                    <span className="label">Delivery Window</span>
                    <span className="val">Today · 12:05 PM Cutoff</span>
                  </div>
                  <div className="sup-decision-item">
                    <span className="label">Escrow Lock</span>
                    <span className="val" style={{ color: 'var(--sup-forest)', fontWeight: 700 }}>₹8,200 HDFC Protected</span>
                  </div>
                </div>

                <div className="sup-decision-actions">
                  <button
                    type="button"
                    className="sup-btn-accept-lg"
                    onClick={handleManualAccept}
                  >
                    <span>✓ Accept Order &amp; Lock Batch</span>
                  </button>
                  <button
                    type="button"
                    className="sup-btn-reject-lg"
                    onClick={handleManualReject}
                  >
                    <span>✕ Reject / Alternate Depot</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── STAGE 4: PARCEL PICKING & PACKAGING BAY ─── */}
      <AnimatePresence>
        {currentStage === 4 && (
          <motion.div
            className="sup-fulfillment-stage"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sup-f-header">
              <div className="sup-f-title">
                <span className="sup-f-dot" style={{ background: '#D97706' }} />
                <span>Roastery Packaging &amp; Verification Bay</span>
              </div>
              <span className="sup-status-badge packing">PACKED &amp; SEALED</span>
            </div>

            <div className="sup-packaging-layout">
              {/* Left: Photorealistic sealed parcel with live weight */}
              <div className="sup-parcel-card">
                <div className="sup-parcel-img-wrap">
                  <img
                    src="/supplier/grabbit_sealed_parcel.jpg"
                    alt="Sealed wholesale coffee parcel with dispatch QR code"
                  />
                  <div className="sup-parcel-tag">TAMPER-SEALED</div>
                </div>
                <div className="sup-weight-scale">
                  <div className="sup-weight-label">Digital Scale Gross Weight</div>
                  <div className="sup-weight-val">
                    <span className="sup-weight-num">10.45</span>
                    <span className="sup-weight-unit">KG</span>
                    <span className="sup-weight-ok">✓ TARE ACCURATE</span>
                  </div>
                </div>
              </div>

              {/* Right: Automated verification checklist */}
              <div className="sup-checklist-card">
                <div className="sup-checklist-title">Automated Dispatch Verification:</div>
                <div className="sup-checklist-items">
                  {[
                    { label: '10kg Arabica AA Lot #AA-409 Verified', detail: 'Medium-dark roast profile match' },
                    { label: 'Moisture Level Tested (< 11.2%)', detail: 'Optimal extraction equilibrium' },
                    { label: 'Airtight Degassing Valve Heat-Sealed', detail: 'CO2 release without oxygen ingress' },
                    { label: 'Dispatch QR Barcode Affixed', detail: 'Tracking ID: GRB-1048-KT04' },
                  ].map((item, idx) => {
                    const isDone = checklistIndex > idx;
                    return (
                      <motion.div
                        key={item.label}
                        className={`sup-check-row ${isDone ? 'done' : ''}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.12 }}
                      >
                        <span className={`sup-check-circle ${isDone ? 'checked' : ''}`}>
                          {isDone ? '✓' : idx + 1}
                        </span>
                        <div className="sup-check-text">
                          <span className="sup-check-name">{item.label}</span>
                          <span className="sup-check-detail">{item.detail}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="sup-f-footer">
                  <span className="sup-f-note">Crate #C-88 ready for EV Cargo pickup</span>
                  <button
                    type="button"
                    className="sup-action-btn-green"
                    onClick={() => onStageChange(5)}
                  >
                    <span>Proceed to Dispatch →</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── STAGE 5: EV COURIER ROUTE IN TRANSIT ─── */}
      <AnimatePresence>
        {currentStage === 5 && (
          <motion.div
            className="sup-fulfillment-stage"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sup-f-header">
              <div className="sup-f-title">
                <span className="sup-f-dot" style={{ background: 'var(--sup-fresh)' }} />
                <span>Morning Dispatch Route · Live GPS Radar</span>
              </div>
              <span className="sup-status-badge dispatched">IN TRANSIT</span>
            </div>

            <div className="sup-radar-layout">
              {/* Telemetry Row */}
              <div className="sup-telemetry-row">
                <div className="sup-telem-box">
                  <span className="telem-label">Assigned Carrier</span>
                  <strong className="telem-val">Ramesh Kumar · EV Van #04</strong>
                </div>
                <div className="sup-telem-box">
                  <span className="telem-label">Destination</span>
                  <strong className="telem-val">Blue Tokai · Koramangala 80ft Rd</strong>
                </div>
                <div className="sup-telem-box">
                  <span className="telem-label">Estimated Arrival</span>
                  <strong className="telem-val" style={{ color: 'var(--sup-forest)' }}>12:02 PM (3m ahead)</strong>
                </div>
                <div className="sup-telem-box">
                  <span className="telem-label">Crate Temp</span>
                  <strong className="telem-val">21.4°C · Climate Monitored</strong>
                </div>
              </div>

              {/* Animated Road Track with Driving EV Van */}
              <div className="sup-route-radar-box">
                <div className="sup-route-ends">
                  <div className="sup-point origin">
                    <span className="point-dot origin-dot" />
                    <div className="point-text">
                      <span className="point-title">Roastery Depot Hub</span>
                      <span className="point-sub">Koramangala 1st Block · Dispatched 11:46 AM</span>
                    </div>
                  </div>

                  <div className="sup-point dest">
                    <span className="point-dot dest-dot" />
                    <div className="point-text">
                      <span className="point-title">Blue Tokai Roastery</span>
                      <span className="point-sub">Koramangala Outlet #04 · ETA 12:02 PM</span>
                    </div>
                  </div>
                </div>

                {/* Road Canvas with Van */}
                <div className="sup-road-track">
                  <div className="sup-road-base" />
                  <div
                    className="sup-road-progress"
                    style={{ width: `${vanProgress}%` }}
                  />
                  <div
                    className="sup-road-vehicle"
                    style={{ left: `calc(${vanProgress}% - 22px)` }}
                  >
                    <div className="sup-van-icon-wrapper">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                      <span className="sup-van-ping" />
                    </div>
                  </div>
                </div>

                <div className="sup-route-metrics">
                  <span>Distance Covered: 2.1 km / 2.4 km</span>
                  <span className="live-gps-dot">● Live GPS Ping 1s ago</span>
                </div>
              </div>

              <div className="sup-f-footer">
                <span className="sup-f-note">Driver arriving at Blue Tokai loading bay</span>
                <button
                  type="button"
                  className="sup-action-btn-green"
                  onClick={() => onStageChange(6)}
                >
                  <span>Verify Delivery ePOD →</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── STAGE 6: DELIVERY COMPLETE & ESCROW SETTLEMENT ─── */}
      <AnimatePresence>
        {currentStage === 6 && (
          <motion.div
            className="sup-fulfillment-stage"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sup-f-header">
              <div className="sup-f-title">
                <span className="sup-f-dot" style={{ background: 'var(--sup-fresh)' }} />
                <span>Order Fulfilled &amp; Instant Escrow Release</span>
              </div>
              <span className="sup-status-badge completed">DELIVERED &amp; SETTLED</span>
            </div>

            <div className="sup-complete-layout">
              {/* Left: Barista ePOD verification card */}
              <div className="sup-epod-card">
                <div className="sup-epod-header">
                  <div className="sup-epod-badge">
                    <span className="epod-check">✓</span>
                    <span>Electronic Proof of Delivery (ePOD)</span>
                  </div>
                  <span className="epod-time">Today · 12:02 PM</span>
                </div>

                <div className="sup-signature-pad">
                  <div className="sig-label">Digital Barista Glass Signature</div>
                  <div className="sig-stroke">
                    <span>Priya S.</span>
                    <span className="sig-title">Head Barista · Koramangala Hub</span>
                  </div>
                  <div className="sig-meta">
                    <span>Airtight valve seal verified on delivery</span>
                    <span className="sig-dispute">Zero Disputes Logged</span>
                  </div>
                </div>

                <div className="sup-crate-return">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                  <span>Circular Logistics: Reusable Crate #C-88 logged for return pickup</span>
                </div>
              </div>

              {/* Right: Escrow release payout shield */}
              <div className="sup-escrow-card">
                <div className="sup-escrow-glow-wrap">
                  <div className="sup-escrow-shield">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                  </div>
                  <div className="sup-escrow-title">₹8,200.00 Released to Supplier</div>
                  <div className="sup-escrow-desc">
                    HDFC Smart Escrow settlement released upon verified ePOD. T+1 direct credit to Blue Tokai Roastery bank account.
                  </div>
                </div>

                <div className="sup-escrow-details">
                  <div className="escrow-item">
                    <span>Order Total:</span>
                    <strong>₹8,200.00</strong>
                  </div>
                  <div className="escrow-item">
                    <span>Platform Commission:</span>
                    <strong>0% (Direct Roaster Plan)</strong>
                  </div>
                  <div className="escrow-item payout">
                    <span>Net Supplier Payout:</span>
                    <strong style={{ color: 'var(--sup-forest)' }}>₹8,200.00</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="sup-replay-walkthrough-btn"
                  onClick={onReset}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  <span>↺ Replay Video Walkthrough</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
