'use client';
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE WHOLE SYSTEM: BEFORE GRADIENT → AFTER GRADIENT
 * 
 * Preserves the original fly-in entrance transition:
 * - Pinned stage: eight tiles fly in tilted from around the screen (--fx, --fy, --fr)
 *   and lock into the grid with cubic ease.
 * - Once assembled, the operational transformation unfolds from Before to After:
 *   BEFORE: Fragmented operations, manual calling, missing visibility.
 *   AFTER: Connected ecosystem, targeted reach, verified telemetry.
 * 
 * Both states share 100% IDENTICAL bento grid dimensions, positions, internal
 * alignment, spacing, and border radii.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { BentoDustbin } from './BentoDustbin';
import { BentoCrumpleCanvas, type BentoCrumpleHandle } from './BentoCrumpleCanvas';
import { PaperCrumple } from '@/components/ui/PaperCrumple';
import { fmt, reduced, useTween } from './shared';
import { ATTRS, CAFES, DAYS, EVENTS, HUBS, VERDICT } from './trial-data';
import { openContactSalesModal } from '@/components/ContactSalesModal';

type Vars = CSSProperties & Record<`--${string}`, string | number>;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const out3 = (k: number) => 1 - (1 - k) ** 3;

// Each tile in DOM order (Row 1 to Row 3)
const TILES = [
  { id: 'brand', from: [-40, -30], r: -14, at: 0 },
  { id: 'reach', from: [4, -50], r: 8, at: 0.05 },
  { id: 'feed', from: [40, -26], r: 10, at: 0.10 },
  { id: 'num', from: [-48, 10], r: -11, at: 0.15 },
  { id: 'rate', from: [-14, 54], r: 12, at: 0.20 },
  { id: 'kit', from: [6, 56], r: -9, at: 0.25 },
  { id: 'chart', from: [-36, 48], r: 6, at: 0.30 },
  { id: 'waste', from: [46, 36], r: -12, at: 0.35 },
] as const;

type TileId = (typeof TILES)[number]['id'];

// Scroll timeline thresholds across the pinned section:
// 0.00 -> 0.06: Before cards are sitting peacefully in place (grounded). Purple cards off-screen.
// 0.06 -> 0.72: The purple After Gradient cards come flying in tilted and lock onto the grid over the Before cards!
// 0.72 -> 1.00: The settled, interactive After Gradient state with full telemetry.
const BUILD = [0.06, 0.72];
const FLIGHT = 0.44;

export function BrandBento() {
  const secRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<(HTMLDivElement | null)[]>([]);
  const beforeCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const afterCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dustbinRef = useRef<HTMLDivElement>(null);
  const crumpleCanvasRef = useRef<BentoCrumpleHandle>(null);
  const activeTimeline = useRef<gsap.core.Timeline | null>(null);

  const [landed, setLanded] = useState<Record<string, boolean>>({});
  const [morphProgress, setMorphProgress] = useState(0); // 0 = Before, 1 = After
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [isBinOpen, setIsBinOpen] = useState(false);
  const [isBinCatching, setIsBinCatching] = useState(false);
  const [isBinSettled, setIsBinSettled] = useState(false);
  const [clearedCount, setClearedCount] = useState(0);
  const [isTossAnimating, setIsTossAnimating] = useState(false);
  const manualTimer = useRef<number | null>(null);

  // ── Phased Programmatic Sequence: Real Three.js Paper Crumple & 3D Toss Cascade ──
  const playCrumpleAndTossSequence = () => {
    if (isTossAnimating) return;
    setIsManualOverride(true);
    setIsTossAnimating(true);
    if (activeTimeline.current) activeTimeline.current.kill();

    // 1. Dustbin lid pops open
    setIsBinOpen(true);
    setIsBinSettled(false);
    setClearedCount(0);

    // 2. Three.js PaperCrumple physics & 3D parabolic trajectory cascade
    crumpleCanvasRef.current?.playTossSequence(
      (cardIndex) => {
        setIsBinCatching(true);
        setTimeout(() => setIsBinCatching(false), 240);
        setClearedCount(cardIndex + 1);
      },
      () => {
        setIsTossAnimating(false);
        setMorphProgress(1);
        setClearedCount(8);
        setIsBinSettled(true);
        setIsBinOpen(false);
        setLanded(Object.fromEntries(TILES.map((t) => [t.id, true])));

        // Smoothly ensure page scroll matches After position
        const el = secRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const totalScrollable = Math.max(1, rect.height - window.innerHeight);
          const targetScroll = window.scrollY + rect.top + 0.78 * totalScrollable;
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }

        // Bloom After purple cards into their grid slots
        const bloomTl = gsap.timeline();
        afterCardsRef.current.forEach((ac, idx) => {
          if (ac) {
            bloomTl.fromTo(
              ac,
              { scale: 0.85, opacity: 0, filter: 'blur(8px)' },
              { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.45, ease: 'back.out(1.4)' },
              idx === 0 ? 0 : '-=0.34'
            );
          }
        });

        if (manualTimer.current) window.clearTimeout(manualTimer.current);
        manualTimer.current = window.setTimeout(() => {
          setIsManualOverride(false);
        }, 800);
      }
    );
  };

  // ── Reset Back to Initial Manual Coordination Cards ──
  const resetToBefore = () => {
    if (activeTimeline.current) activeTimeline.current.kill();
    setIsManualOverride(true);
    setIsTossAnimating(false);
    setMorphProgress(0);
    setLanded({});
    setIsBinOpen(false);
    setIsBinSettled(false);
    setClearedCount(0);

    crumpleCanvasRef.current?.reset();

    // Smoothly scroll back to top of the section
    const el = secRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const targetScroll = window.scrollY + rect.top + 20;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }

    // Reset before cards back to pristine initial state
    beforeCardsRef.current.forEach((card) => {
      if (card) {
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.style.transform = '';
      }
    });

    // Reset after cards
    afterCardsRef.current.forEach((ac) => {
      if (ac) {
        gsap.set(ac, { opacity: 0, scale: 0.85, clearProps: 'filter' });
      }
    });

    if (manualTimer.current) window.clearTimeout(manualTimer.current);
    manualTimer.current = window.setTimeout(() => {
      setIsManualOverride(false);
    }, 600);
  };

  // ── Scroll-Linked Timeline Controller ──
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;

    let rafId = 0;

    const onScroll = () => {
      rafId = 0;
      if (isManualOverride || isTossAnimating) return;

      const V = window.innerHeight;
      const rect = el.getBoundingClientRect();
      const totalScrollable = Math.max(1, rect.height - V);
      const secProgress = clamp(-rect.top / totalScrollable);

      if (secProgress < 0.08) {
        setMorphProgress(0);
        setIsBinOpen(false);
        setIsBinSettled(false);
        setClearedCount(0);
        crumpleCanvasRef.current?.reset();

        beforeCardsRef.current.forEach((c) => {
          if (c) {
            c.style.opacity = '1';
            c.style.visibility = 'visible';
            c.style.transform = '';
          }
        });
        afterCardsRef.current.forEach((a) => {
          if (a) {
            a.style.opacity = '0';
            a.style.transform = 'scale(0.85)';
          }
        });
        setLanded({});
      } else if (secProgress < 0.86) {
        setIsBinOpen(true);
        setIsBinSettled(false);

        const p = clamp((secProgress - 0.08) / 0.78);
        setMorphProgress(p);
        crumpleCanvasRef.current?.setScrollProgress(p);

        let caught = 0;
        for (let i = 0; i < 8; i++) {
          if (p >= i * 0.07 + 0.28) caught++;
        }
        setClearedCount(caught);

        afterCardsRef.current.forEach((a) => {
          if (a) {
            a.style.opacity = '0';
            a.style.transform = 'scale(0.85)';
          }
        });
        setLanded({});
      } else {
        // Fully into After state
        setIsBinOpen(false);
        setIsBinSettled(true);
        setClearedCount(8);
        setMorphProgress(1);
        crumpleCanvasRef.current?.setScrollProgress(1);

        beforeCardsRef.current.forEach((c) => {
          if (c) {
            c.style.opacity = '0';
            c.style.visibility = 'hidden';
          }
        });
        afterCardsRef.current.forEach((a) => {
          if (a) {
            a.style.opacity = '1';
            a.style.transform = 'scale(1)';
          }
        });
        setLanded(Object.fromEntries(TILES.map((t) => [t.id, true])));
      }
    };

    const kick = () => {
      if (!rafId) rafId = requestAnimationFrame(onScroll);
    };

    kick();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
    };
  }, [isManualOverride, isTossAnimating]);

  // Pointer light that follows cursor across cards
  const handlePointerGlow = (e: PointerEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('.bbo-t-after');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    target.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  // Toggle button between states
  const handleToggleState = (targetState: 0 | 1) => {
    if (targetState === 1) {
      playCrumpleAndTossSequence();
    } else {
      resetToBefore();
    }
  };

  const morph = morphProgress;
  const isAfterActive = morph >= 0.88;
  // Helper to render each tile:
  // 1. BEFORE CARD stays where it is from before (grounded in the grid)
  // 2. AFTER CARD (purple Gradient) comes flying into the screen with the 3D flying transition
  const renderTile = (
    id: TileId,
    toneBefore: string,
    toneAfter: string,
    label: string,
    beforeContent: ReactNode,
    afterContent: (on: boolean) => ReactNode
  ) => {
    const i = TILES.findIndex((t) => t.id === id);
    const t = TILES[i];
    const isTileLanded = !!landed[id];

    return (
      <div className={`bbo-slot bbo-a-${id}`}>
        {/* 1. BEFORE CARD: Crumples like paper and tosses into dustbin */}
        <div
          ref={(n) => { beforeCardsRef.current[i] = n; }}
          className={`bbo-card-before ${toneBefore}`}
          role="group"
          aria-label={`Before: ${label}`}
        >
          {beforeContent}
        </div>

        {/* 2. AFTER CARD (PURPLE/LAVENDER): Blooms into place on clean board */}
        <div
          ref={(n) => {
            tilesRef.current[i] = n;
            afterCardsRef.current[i] = n;
          }}
          className={`bbo-t-after ${toneAfter}${isTileLanded ? ' is-in' : ''}`}
          style={{ '--fx': t.from[0], '--fy': t.from[1], '--fr': t.r } as Vars}
          role="group"
          aria-label={`Gradient: ${label}`}
        >
          {afterContent(isTileLanded)}
        </div>
      </div>
    );
  };

  return (
    <section ref={secRef} className={`bbo ${isAfterActive ? 'is-after-mode' : ''}`} id="system" aria-labelledby="bbo-title" style={{ '--morph': morph } as Vars}>
      <div ref={stageRef} className="bbo-stage">
        {/* Dynamic Header with State Indicator & Crossfading Headline */}
        <header className="bbo-head">
          <div className="bbo-head-main">
            <div className="bbo-eyebrow-row">
              <span className="bbo-eye">THE WHOLE SYSTEM</span>
              <div className="bbo-switcher" role="tablist" aria-label="Operational state">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isAfterActive}
                  className={`bbo-switch-pill ${!isAfterActive ? 'is-active' : ''}`}
                  onClick={() => handleToggleState(0)}
                >
                  <span className="bbo-switch-dot before" />
                  BEFORE GRADIENT
                </button>
                <div className="bbo-switch-track">
                  <div className="bbo-switch-indicator" style={{ left: `${morph * 50}%` }} />
                </div>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isAfterActive}
                  className={`bbo-switch-pill ${isAfterActive ? 'is-active' : ''}`}
                  onClick={() => handleToggleState(1)}
                >
                  <span className="bbo-switch-dot after" />
                  AFTER GRADIENT
                </button>
              </div>
            </div>

            <h2 id="bbo-title" className="bbo-headline">
              <span
                className="bbo-title-layer bbo-title-before"
                style={{
                  opacity: Math.max(0, 1 - morph * 1.8),
                  transform: `translateY(${morph * -8}px)`,
                  pointerEvents: morph < 0.5 ? 'auto' : 'none',
                }}
              >
                Fragmented operations.<br />Manual coordination.
              </span>
              <span
                className="bbo-title-layer bbo-title-after"
                style={{
                  opacity: Math.max(0, (morph - 0.2) * 1.25),
                  transform: `translateY(${(1 - morph) * 8}px)`,
                  pointerEvents: morph >= 0.5 ? 'auto' : 'none',
                }}
              >
                Every café you sell to,<br />on one connected board.
              </span>
            </h2>
          </div>

          <div className="bbo-head-sub">
            <p style={{ opacity: Math.max(0, 1 - morph * 1.6) }}>
              Before: Disconnected spreadsheets, unreturned calls, invisible logistics, and guesswork.
            </p>
            <p style={{ opacity: Math.max(0, (morph - 0.3) * 1.4) }}>
              With Gradient: Targeted café discovery, end-to-end tracked flights, and recurring PO replenishment.
            </p>
          </div>
        </header>

        {/* The Exact 8-Card Bento Grid */}
        <div className="bbo-grid" onPointerMove={handlePointerGlow}>
          {/* CARD A: BRAND (Row 1, Cols 1-3) */}
          {renderTile(
            'brand',
            't-before-brand',
            't-pur',
            'Brand Outreach',
            <CardABefore />,
            () => <CardAAfter />
          )}

          {/* CARD B: REACH (Row 1, Cols 4-8) */}
          {renderTile(
            'reach',
            't-before-reach',
            't-lav',
            'Café Acquisition',
            <CardBBefore />,
            (on) => <Reach on={on} />
          )}

          {/* CARD C: FEED (Rows 1-2, Cols 9-12, Tall) */}
          {renderTile(
            'feed',
            't-before-dark',
            't-dark',
            'Product Tracking',
            <CardCBefore />,
            (on) => <Feed on={on} />
          )}

          {/* CARD D: NUMBERS (Row 2, Cols 1-2) */}
          {renderTile(
            'num',
            't-before-lav',
            't-lav',
            'Café Orders and Demand',
            <CardDBefore />,
            (on) => <Numbers on={on} />
          )}

          {/* CARD E: RATING (Row 2, Cols 3-5) */}
          {renderTile(
            'rate',
            't-before-lav',
            't-lav',
            'Product Feedback',
            <CardEBefore />,
            (on) => <Rating on={on} />
          )}

          {/* CARD F: KIT (Rows 2-3, Cols 6-8, Tall) */}
          {renderTile(
            'kit',
            't-before-kit',
            't-lav',
            'Trial Kit Management',
            <CardFBefore />,
            (on) => <Kit on={on} />
          )}

          {/* CARD G: CHART (Row 3, Cols 1-5) */}
          {renderTile(
            'chart',
            't-before-dark',
            't-pur',
            'Demand Forecasting',
            <CardGBefore />,
            (on) => <Reorders on={on} />
          )}

          {/* CARD H: WASTE (Row 3, Cols 9-12) */}
          {renderTile(
            'waste',
            't-before-dark',
            't-pur',
            'Supply and Wastage',
            <CardHBefore />,
            (on) => <Waste on={on} />
          )}
        </div>

        {/* Real Three.js 3D Paper Crumple Canvas (React Bits solver) */}
        <BentoCrumpleCanvas
          ref={crumpleCanvasRef}
          beforeCardsRef={beforeCardsRef}
          dustbinRef={dustbinRef}
          stageRef={stageRef}
        />

        {/* Popped-Out Modern Industrial Dustbin in Bottom Right */}
        <BentoDustbin
          isOpen={isBinOpen}
          isCatching={isBinCatching}
          isSettled={isBinSettled}
          clearedCount={clearedCount}
          isAfterActive={isAfterActive}
          onTriggerToss={() => {
            if (isAfterActive) {
              resetToBefore();
            } else {
              playCrumpleAndTossSequence();
            }
          }}
          dustbinRef={dustbinRef}
        />

        <p className="bbo-foot">
          {isAfterActive ? 'Sample figures · names are illustrative' : 'Fragmented operations typical in manual F&B distribution'}
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   BEFORE GRADIENT CARDS
───────────────────────────────────────────────────────────────────────────── */

/** CARD A (BEFORE): Manual outreach & spreadsheet contact list */
function CardABefore() {
  return (
    <div className="bbo-bf-brand">
      <div className="bbo-bf-head">
        <span className="bbo-bf-tag">MANUAL OUTREACH</span>
        <h3>Finding your next café.</h3>
      </div>
      <div className="bbo-bf-sheet">
        <div className="bbo-bf-sheet-row head">
          <span>Café Account</span>
          <span>Channel</span>
          <span>Status</span>
        </div>
        <div className="bbo-bf-sheet-row">
          <b>Blue Tokai · Khan Mkt</b>
          <span>Cold Email</span>
          <em className="is-warn">No reply (14d)</em>
        </div>
        <div className="bbo-bf-sheet-row">
          <b>Subko · Bandra West</b>
          <span>Instagram DM</span>
          <em className="is-muted">Unread</em>
        </div>
        <div className="bbo-bf-sheet-row">
          <b>Roastery Coffee House</b>
          <span>Front Desk</span>
          <em className="is-warn">Gatekeeper</em>
        </div>
      </div>
      <p className="bbo-bf-sub">Finding and reaching the right cafés takes time.</p>
    </div>
  );
}

/** CARD A (AFTER): Brand discovery and launch CTA */
function CardAAfter() {
  return (
    <div className="bbo-brand">
      <div className="bbo-brand-title">
        <b>gradient<i></i></b>
        <span>for brands</span>
      </div>
      <button type="button" onClick={openContactSalesModal}>
        Launch a trial <em aria-hidden="true">→</em>
      </button>
      <p className="bbo-af-note">Your brand becomes discoverable to the right cafés.</p>
    </div>
  );
}

/** CARD B (BEFORE): Cold calls, manual calling logs, unanswered */
function CardBBefore() {
  return (
    <div className="bbo-bf-reach">
      <div className="bbo-bf-reach-l">
        <small className="bbo-bf-label">MANUAL ACQUISITION</small>
        <h3>Cold calls. One café at a time.</h3>
        <div className="bbo-bf-reach-chips">
          <span className="bbo-bf-chip is-bad">18 cold calls</span>
          <span className="bbo-bf-chip">1 callback pending</span>
        </div>
        <p className="bbo-bf-sub">Expensive outreach with limited reach.</p>
      </div>

      <div className="bbo-bf-phone" aria-hidden="true">
        <div className="bbo-bf-phone-scr">
          <span className="bbo-bf-phone-time">11:15 AM</span>
          <div className="bbo-bf-call-entry missed">
            <i>✕</i>
            <div>
              <b>Missed Call (3)</b>
              <span>Shift Barista · Kamla Nagar</span>
            </div>
          </div>
          <div className="bbo-bf-call-entry">
            <i>!</i>
            <div>
              <b>Voicemail Left</b>
              <span>"Too busy during rush, try next week"</span>
            </div>
          </div>
          <div className="bbo-bf-call-entry rejected">
            <i>—</i>
            <div>
              <b>Call Rejected</b>
              <span>"Not taking new dairy vendor calls"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** CARD C (BEFORE): Fragmented product tracking, missing visibility */
function CardCBefore() {
  return (
    <div className="bbo-bf-feed">
      <div className="bbo-bf-feed-head">
        <small><i className="dot-warn" /> UNTRACKED · DELHI NCR</small>
        <span>Barista Oat Milk (Batch 04)</span>
      </div>

      <div className="bbo-bf-feed-title">
        <b>Where is your product?</b>
        <small>3 couriers · 0 confirmations</small>
      </div>

      <div className="bbo-bf-feed-ruler" aria-hidden="true">
        <div className="bbo-bf-gap-bar" />
        <span className="bbo-bf-ruler-tag">Location unknown</span>
      </div>

      <ol className="bbo-bf-feed-list" aria-live="off">
        <li>
          <em>D08</em>
          <i className="status-warn" />
          <div>
            <b>Courier marked "Delivered"</b>
            <span>Café head barista says box not received</span>
          </div>
        </li>
        <li>
          <em>D06</em>
          <i className="status-err" />
          <div>
            <b>Van 03 delayed in transit</b>
            <span>Driver phone switched off · no tracking link</span>
          </div>
        </li>
        <li>
          <em>D04</em>
          <i className="status-muted" />
          <div>
            <b>Sample left with security gate</b>
            <span>No delivery signature · awaiting verification</span>
          </div>
        </li>
        <li>
          <em>D02</em>
          <i className="status-muted" />
          <div>
            <b>Dispatched via 3rd-party parcel</b>
            <span>Manual phone check needed with roastery</span>
          </div>
        </li>
      </ol>

      <p className="bbo-bf-sub">Limited visibility from dispatch to café.</p>
    </div>
  );
}

/** CARD D (BEFORE): Unclear weekly demand, disconnected notebook */
function CardDBefore() {
  return (
    <div className="bbo-bf-num">
      <div className="bbo-bf-tabs" role="tablist">
        <span className="bbo-bf-tab is-on">Loose Sheets</span>
        <span className="bbo-bf-tab">WhatsApp</span>
        <span className="bbo-bf-tab">Notebook</span>
      </div>
      <div className="bbo-bf-num-body">
        <b>~14?<small> unconfirmed</small></b>
        <span>Estimated weekly orders</span>
      </div>
      <p className="bbo-bf-sub">Demand is difficult to understand.</p>
    </div>
  );
}

/** CARD E (BEFORE): Scattered WhatsApp snippets, unstructured feedback */
function CardEBefore() {
  return (
    <div className="bbo-bf-rate">
      <div className="bbo-bf-rate-top">
        <span className="bbo-bf-tag">UNSTRUCTURED</span>
        <h3>Feedback scattered everywhere.</h3>
      </div>
      <div className="bbo-bf-chat-snippets">
        <div className="bbo-bf-chat-bubble">
          <small>WhatsApp · 11:42 PM</small>
          <p>“Hey bro milk was okayish i guess, didn’t test with single origin”</p>
        </div>
        <div className="bbo-bf-chat-bubble audio">
          <small>Voice note (0:48) · Unlistened</small>
          <div className="bbo-bf-wave-dummy" />
        </div>
      </div>
      <p className="bbo-bf-sub">Feedback exists, but insights are hard to extract.</p>
    </div>
  );
}

/** CARD F (BEFORE): Paper dispatch tag with unconfirmed outcomes & optional 3D PaperCrumple */
function CardFBefore() {
  const [show3D, setShow3D] = useState(false);

  return (
    <div className="bbo-bf-kit">
      <div className="bbo-bf-kit-header">
        <h3>Samples sent. Follow-ups pending.</h3>
        <button
          type="button"
          className="bbo-3d-toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShow3D(!show3D);
          }}
          title={show3D ? "Switch to standard card view" : "Switch to interactive 3D WebGL paper crumple"}
        >
          {show3D ? '📄 Card' : '✨ 3D Crumple'}
        </button>
      </div>

      {show3D ? (
        <div className="bbo-3d-crumple-wrap">
          <PaperCrumple
            src="/brand/manual-sample-tag.png"
            alt="Manual sample dispatch slip"
            width={240}
            height={300}
            sceneHeight={300}
            releaseBehavior="creased"
            crumpleAmount={0.85}
            crumpleDuration={0.45}
            releaseDuration={0.4}
            foldCount={7}
            foldSharpness={0.65}
            wrinkleDepth={0.75}
            creaseStrength={0.22}
            paperColor="#F4F0E8"
            paperTexture={0.1}
            lightIntensity={1.8}
            lightAngle={-35}
            draggable={true}
            returnToOrigin={true}
          />
          <span className="bbo-3d-hint">Hold & drag to crumple with Three.js</span>
        </div>
      ) : (
        <div className="bbo-bf-tag">
          <header>
            <small>MANUAL SAMPLE</small>
            <b>BATCH-04</b>
          </header>
          <p className="bbo-bf-tag-to">
            <small>To</small>
            <span>Blue Tokai (?) · Khan Market</span>
          </p>
          <ol>
            <li className="is-done">
              <i>?</i>
              <b>Dispatched</b>
              <em>Oct 12</em>
            </li>
            <li className="is-warn">
              <i>?</i>
              <b>Left at reception</b>
              <em>Oct 14</em>
            </li>
            <li>
              <i>—</i>
              <b>Barista cupping score</b>
              <em>No record</em>
            </li>
            <li>
              <i>—</i>
              <b>Repeat reorder</b>
              <em>Never called back</em>
            </li>
          </ol>
          <footer>
            <span className="bbo-bf-stamp">Awaiting Call</span>
            <span className="bbo-bf-note">No centralized follow-up</span>
          </footer>
        </div>
      )}

      <p className="bbo-bf-sub">Trial progress is difficult to track.</p>
    </div>
  );
}

/** CARD G (BEFORE): Irregular guessed demand, erratic overproduction */
function CardGBefore() {
  return (
    <div className="bbo-bf-chart">
      <div className="bbo-bf-chart-header">
        <small className="bbo-bf-label">SPECULATIVE PRODUCTION</small>
        <h3>Producing without clear demand.</h3>
      </div>
      <div className="bbo-bf-chart-visual">
        <svg viewBox="0 0 400 130" fill="none" className="bbo-bf-erratic-svg">
          <path
            d="M 10 90 L 60 40 L 110 110 L 170 30 L 230 95 L 290 20 L 350 85 L 390 60"
            stroke="#8E889D"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <path
            d="M 10 90 L 60 40 L 110 110 L 170 30 L 230 95 L 290 20 L 350 85 L 390 60 L 390 120 L 10 120 Z"
            fill="rgba(142, 136, 157, 0.12)"
          />
          <circle cx="290" cy="20" r="4" fill="#C25E5E" />
        </svg>
        <div className="bbo-bf-chart-legend">
          <span className="badge-err">Batch Guess: 4,000 L</span>
          <span className="badge-muted">Actual Need: 2,400 L</span>
        </div>
      </div>
      <p className="bbo-bf-sub">Overproduction and underproduction become expensive.</p>
    </div>
  );
}

/** CARD H (BEFORE): Deadstock and inventory discrepancy */
function CardHBefore() {
  return (
    <div className="bbo-bf-waste">
      <span className="bbo-bf-waste-badge">+38% Excess</span>
      <div className="bbo-bf-waste-body">
        <small>Wastage adds up</small>
        <b>1,600 L</b>
        <span className="bbo-bf-waste-sub">Unsold stock dumped per cycle</span>
        <div className="bbo-bf-waste-bar">
          <div className="bbo-bf-waste-fill" style={{ width: '68%' }} />
        </div>
      </div>
      <p className="bbo-bf-sub">Disconnected demand and supply create unnecessary losses.</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   AFTER GRADIENT CARDS
───────────────────────────────────────────────────────────────────────────── */

/** Runs `fn` every `ms` while `on`, unless reduced motion is set. */
function useEvery(on: boolean, ms: number, fn: () => void) {
  const f = useRef(fn);
  f.current = fn;
  useEffect(() => {
    if (!on || reduced()) return;
    const id = window.setInterval(() => f.current(), ms);
    return () => window.clearInterval(id);
  }, [on, ms]);
}

const ADS = [
  ['New from Oat Barista', 'Claim a free trial kit for your café'],
  ['Kit on its way', 'Riding with Sharma Dairy · arrives tomorrow'],
  ['How did it pour?', 'Rate Barista Oat Milk in 10 seconds'],
  ['Reorder in one tap', '24 L of oat milk, same as last week'],
];

function Reach({ on }: { on: boolean }) {
  const [n, setN] = useState(1);
  const [held, setHeld] = useState(false);
  useEvery(on && !held, 3600, () => setN((x) => x + 1));
  const list = Array.from({ length: Math.min(n, 3) }, (_, k) => n - 1 - k);

  return (
    <div className="bbo-reach" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
      <div className="bbo-reach-l">
        <small>Direct reach</small>
        <h3>Your ad, in every café owner’s app.</h3>
        <div className="bbo-reach-act">
          <span className="bbo-chip">0 cold calls</span>
          <button type="button" className="bbo-send" onClick={() => setN((x) => x + 1)}>
            Send <em aria-hidden="true">↗</em>
          </button>
        </div>
        <p className="bbo-af-sub">Reach relevant cafés through Gradient instead of manual outreach.</p>
      </div>
      <div className="bbo-phone" aria-hidden="true">
        <div className="bbo-phone-scr">
          <span className="bbo-phone-time">10:42</span>
          {list.map((k) => (
            <div key={k} className="bbo-notif">
              <i>G</i>
              <div>
                <b>{ADS[k % ADS.length][0]}</b>
                <span>{ADS[k % ADS.length][1]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FIRST = 3;
const pad = (d: number) => String(Math.max(1, Math.round(d))).padStart(2, '0');

function Feed({ on }: { on: boolean }) {
  const [n, setN] = useState(0);
  const [held, setHeld] = useState(false);
  useEvery(on && !held, 2300, () => setN((x) => x + 1));
  const top = FIRST + (n % (EVENTS.length - FIRST)), round = Math.floor(n / (EVENTS.length - FIRST));
  const rows = Array.from({ length: 5 }, (_, k) => top - k).filter((k) => k >= 0);
  const day = Math.max(1, Math.round(useTween(on ? EVENTS[top].day : 1, 700)));

  return (
    <div className="bbo-feed" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
      <div className="bbo-feed-head">
        <small><i className={held ? 'is-held' : ''} />{held ? 'Paused' : 'Live'} · Delhi NCR</small>
        <span>Barista Oat Milk</span>
      </div>
      <div className="bbo-day">
        <b>Day {pad(day)}</b><small>of {DAYS}</small>
      </div>
      <div className="bbo-ruler" aria-hidden="true">
        {Array.from({ length: DAYS }, (_, k) => (
          <i key={k} className={k + 1 < day ? 'is-past' : k + 1 === day ? 'is-now' : ''} />
        ))}
      </div>
      <ol aria-live="off">
        {rows.map((k) => {
          const ev = EVENTS[k];
          return (
            <li key={`${round}-${k}`}>
              <em>D{pad(ev.day)}</em>
              <i aria-hidden="true" />
              <div><b>{ev.title}</b><span>{ev.meta}</span></div>
            </li>
          );
        })}
      </ol>
      <p className="bbo-af-sub feed-foot">Every product. Every delivery. Visible.</p>
    </div>
  );
}

const NUMS = [
  { label: 'Cafés in trial', tab: 'Cafés', v: 120, unit: '', note: 'across 9 neighbourhoods' },
  { label: 'Order weekly', tab: 'Orders', v: 31, unit: '', note: 'by day 21, up from 0' },
  { label: 'Litres a week', tab: 'Litres', v: 420, unit: ' L', note: 'in standing reorders' },
];

function Numbers({ on }: { on: boolean }) {
  const [i, setI] = useState(1);
  const [held, setHeld] = useState(false);
  useEvery(on && !held, 3200, () => setI((x) => (x + 1) % NUMS.length));
  const n = NUMS[i], v = useTween(on ? n.v : 0, 900);

  return (
    <div className="bbo-num">
      <div className="bbo-tabs" role="tablist" aria-label="Trial numbers">
        {NUMS.map((q, k) => (
          <button
            key={q.tab}
            type="button"
            role="tab"
            aria-selected={k === i}
            className={k === i ? 'is-on' : ''}
            onClick={() => { setHeld(true); setI(k); }}
          >
            {q.tab}
          </button>
        ))}
      </div>
      <b>{Math.round(v)}<small>{n.unit}</small></b>
      <span>{n.label} · {n.note}</span>
      <p className="bbo-af-sub">Know what’s moving.</p>
    </div>
  );
}

const QUOTES = [
  ...ATTRS.map((a) => ({ score: a.score, label: a.label, q: a.quote })),
  { score: 4.9, label: 'Would order again', q: VERDICT },
];

function Rating({ on }: { on: boolean }) {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  useEvery(on && !held, 4600, () => setI((x) => (x + 1) % QUOTES.length));
  const q = QUOTES[i], v = useTween(on ? q.score : 0, 700);

  return (
    <div className="bbo-rate" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
      <div className="bbo-rate-top">
        <b>{v.toFixed(1)}</b>
        <span>{q.label}</span>
        <button
          type="button"
          className="bbo-arrow"
          aria-label="Next quote"
          onClick={() => setI((x) => (x + 1) % QUOTES.length)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" /></svg>
        </button>
      </div>
      <p key={i}>“{q.q.text}”</p>
      <div className="bbo-who">
        <div className="bbo-faces" aria-hidden="true">
          {QUOTES.map((x, k) => (
            <i key={k} className={k === i ? 'is-on' : ''}>
              {x.q.cafe.split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </i>
          ))}
        </div>
        <small>{q.q.who} · {q.q.cafe}</small>
      </div>
      <p className="bbo-af-sub rate-foot">Know what cafés actually want.</p>
    </div>
  );
}

const KIT_CAFE = CAFES.find((c) => c.name === 'Little Brew Room')!;
const STEPS = [
  { name: 'Packed', day: 1, note: `Packed at ${HUBS[KIT_CAFE.hub].name}` },
  { name: 'Delivered', day: KIT_CAFE.d, note: 'Came on the morning milk run' },
  { name: 'Tried', day: KIT_CAFE.t!, note: `Head barista rated it ${KIT_CAFE.stars!.toFixed(1)}` },
  { name: 'Reordered', day: KIT_CAFE.o!, note: `Now ${KIT_CAFE.litres} L a week, standing` },
];

function Kit({ on }: { on: boolean }) {
  const [s, setS] = useState(0);
  const [held, setHeld] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEvery(on && !held, 1700, () => setS((x) => (x + 1) % (STEPS.length + 3)));
  const done = Math.min(s, STEPS.length), last = STEPS[Math.max(0, done - 1)];

  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    const el = box.current;
    if (!el || reduced()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--tx', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    el.style.setProperty('--ty', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  };
  const reset = () => {
    box.current?.style.setProperty('--tx', '0');
    box.current?.style.setProperty('--ty', '0');
  };

  return (
    <div className="bbo-kit" ref={box} onPointerMove={tilt} onPointerLeave={reset}>
      <h3>Trial kits, tracked to the cup.</h3>
      <div className="bbo-tag">
        <header>
          <small>Trial kit</small>
          <b>LBR-024</b>
        </header>
        <p className="bbo-tag-to">
          <small>To</small>
          <span>{KIT_CAFE.name} · {KIT_CAFE.area}</span>
        </p>
        <ol>
          {STEPS.map((x, k) => (
            <li key={x.name} className={k < done ? 'is-done' : ''}>
              <button type="button" onClick={() => { setHeld(true); setS(k + 1); }}>
                <i aria-hidden="true">
                  <svg viewBox="0 0 12 12"><path d="M2.6 6.4 5 8.8l4.4-5.6" pathLength={1} /></svg>
                </i>
                <b>{x.name}</b>
                <em>Day {Math.round(x.day)}</em>
              </button>
            </li>
          ))}
        </ol>
        <footer>
          <span key={done} className="bbo-tag-note">{done ? last.note : 'Waiting at the supplier'}</span>
          <i className="bbo-bars" aria-hidden="true" />
        </footer>
        <span className={`bbo-stamp${done === STEPS.length ? ' is-on' : ''}`} aria-hidden="true">
          Reordering
        </span>
      </div>
      <p className="bbo-af-sub kit-foot">Trial kits, tracked to the cup.</p>
    </div>
  );
}

const WEEKLY = [40, 62, 96, 138, 176, 214, 252, 288, 330, 366, 398, 420];

function Reorders({ on }: { on: boolean }) {
  const [w, setW] = useState<number | null>(null);
  const k = w ?? WEEKLY.length - 1, v = useTween(on ? WEEKLY[k] : 0, 500);
  const X = (i: number) => (i / (WEEKLY.length - 1)) * 600, Y = (x: number) => 200 - (x / 460) * 150;
  const line = WEEKLY.map((x, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(x).toFixed(1)}`).join('');

  const scrub = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setW(Math.round(clamp((e.clientX - r.left) / r.width) * (WEEKLY.length - 1)));
  };

  return (
    <div
      className={`bbo-waves${on ? ' is-on' : ''}`}
      onPointerMove={scrub}
      onPointerDown={scrub}
      onPointerLeave={() => setW(null)}
    >
      <svg viewBox="0 0 600 220" preserveAspectRatio="none" aria-hidden="true">
        <path className="w1" d="M0 70C70 50 110 120 180 106s120-70 190-44 120 66 230 34V220H0Z" />
        <path className="w2" d={`${line}L600 220L0 220Z`} />
        <path className="w3" d={line} />
      </svg>
      <span
        className="bbo-cursor"
        style={{ left: `${(k / (WEEKLY.length - 1)) * 100}%`, top: `${(Y(WEEKLY[k]) / 220) * 100}%` }}
        aria-hidden="true"
      />
      <div className="bbo-legend">
        <small>Weekly reorders · {w === null ? 'point to read a week' : `week ${k + 1}`}</small>
        <span className="bbo-aqi-pill">● DEMAND STABLE (+18% SURGE)</span>
      </div>
      <div className="bbo-big">
        <b>{fmt(v)} L</b>
        <small>{w === null ? 'a week, by week 12' : `in week ${k + 1}`}</small>
      </div>
      <p className="bbo-af-sub reorder-foot">Know what to produce next.</p>
    </div>
  );
}

function Waste({ on }: { on: boolean }) {
  const MAKE = 2400;
  const [usual, setUsual] = useState(4000);
  const saved = usual - MAKE, pct = Math.round((saved / usual) * 100), sv = useTween(on ? saved : 0, 600);

  return (
    <div className="bbo-waste">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="r0" cx="60" cy="60" r="44" />
        <circle
          className="r1"
          cx="60"
          cy="60"
          r="44"
          pathLength={100}
          style={{ strokeDasharray: `${on ? (MAKE / usual) * 100 : 0} 100` }}
        />
      </svg>
      <span className="bbo-badge">−{pct}%</span>
      <div className="bbo-waste-body">
        <small>Saved against your usual batch</small>
        <b>{fmt(sv)} L</b>
        <label>
          <span>You’d usually make <em>{fmt(usual)} L</em></span>
          <input
            type="range"
            min={2600}
            max={5000}
            step={100}
            value={usual}
            onChange={(e) => setUsual(Number(e.target.value))}
            style={{ '--v': (usual - 2600) / 2400 } as Vars}
          />
        </label>
      </div>
      <p className="bbo-af-sub waste-foot">Produce closer to actual demand.</p>
    </div>
  );
}
