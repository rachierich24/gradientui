'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

type Edge = 'l' | 'r' | 't' | 'b';

interface LinkDef {
  id: string;
  from: string;
  to: string;
  fromEdge: Edge;
  toEdge: Edge;
  startDir: 'h' | 'v';
  midSplit?: number;
  stakeholder: 'cafe' | 'supplier' | 'brand' | 'neutral';
  color: string;
  secondary?: boolean;
  hasTriplePort?: boolean;
}

interface PulseEffect {
  id: number;
  x: number;
  y: number;
  color: string;
}

// Color tokens
const COLOR_CAFE = '#E5483B';
const COLOR_SUPPLIER = '#22C55E';
const COLOR_BRAND = '#6D28D9';
const COLOR_GRABBIT = '#266DF0';
const COLOR_NEUTRAL = '#D9D9D2';

// Purely orthogonal links — absolutely ZERO diagonals!
const GRAPH_LINKS: LinkDef[] = [
  // ─── FLOW 01: CAFÉ → ORDERS → DEMAND → GRABBIT (RED) ───
  {
    id: 'link-cafe-orders',
    from: 'port-cafe-r',
    to: 'port-orders-l',
    fromEdge: 'r',
    toEdge: 'l',
    startDir: 'h',
    midSplit: 0.5,
    stakeholder: 'cafe',
    color: COLOR_CAFE,
    hasTriplePort: true,
  },
  {
    id: 'link-orders-demand',
    from: 'port-orders-b',
    to: 'port-demand-t',
    fromEdge: 'b',
    toEdge: 't',
    startDir: 'v',
    midSplit: 0.5,
    stakeholder: 'cafe',
    color: COLOR_CAFE,
  },
  {
    id: 'link-demand-grabbit',
    from: 'port-demand-b',
    to: 'port-grabbit-t',
    fromEdge: 'b',
    toEdge: 't',
    startDir: 'v',
    midSplit: 0.5,
    stakeholder: 'cafe',
    color: COLOR_CAFE,
  },

  // ─── FLOW 02: GRABBIT → ORDER ROUTING → SUPPLIER → INVENTORY → FULFILLMENT → DISPATCH (GREEN) ───
  {
    id: 'link-grabbit-routing',
    from: 'port-grabbit-l',
    to: 'port-routing-r',
    fromEdge: 'l',
    toEdge: 'r',
    startDir: 'h',
    midSplit: 0.5,
    stakeholder: 'supplier',
    color: COLOR_SUPPLIER,
    hasTriplePort: true,
  },
  {
    id: 'link-routing-supplier',
    from: 'port-routing-b',
    to: 'port-supplier-t',
    fromEdge: 'b',
    toEdge: 't',
    startDir: 'v',
    midSplit: 0.5,
    stakeholder: 'supplier',
    color: COLOR_SUPPLIER,
  },
  {
    id: 'link-supplier-fulfillment',
    from: 'port-supplier-l',
    to: 'port-fulfillment-b',
    fromEdge: 'l',
    toEdge: 'b',
    startDir: 'h',
    midSplit: 0.5,
    stakeholder: 'supplier',
    color: COLOR_SUPPLIER,
  },
  {
    id: 'link-fulfillment-inventory',
    from: 'port-fulfillment-t',
    to: 'port-inventory-b',
    fromEdge: 't',
    toEdge: 'b',
    startDir: 'v',
    midSplit: 0.5,
    stakeholder: 'supplier',
    color: COLOR_SUPPLIER,
  },
  {
    id: 'link-supplier-dispatch',
    from: 'port-supplier-r',
    to: 'port-dispatch-l',
    fromEdge: 'r',
    toEdge: 'l',
    startDir: 'h',
    midSplit: 0.5,
    stakeholder: 'supplier',
    color: COLOR_SUPPLIER,
    hasTriplePort: true,
  },

  // ─── FLOW 03: GRABBIT → DEMAND SIGNALS → BRAND → ADOPTION → REPEAT ORDERS → GMV (PURPLE) ───
  {
    id: 'link-grabbit-signals',
    from: 'port-grabbit-r',
    to: 'port-signals-l',
    fromEdge: 'r',
    toEdge: 'l',
    startDir: 'h',
    midSplit: 0.5,
    stakeholder: 'brand',
    color: COLOR_BRAND,
    hasTriplePort: true,
  },
  {
    id: 'link-signals-brand',
    from: 'port-signals-b',
    to: 'port-brand-t',
    fromEdge: 'b',
    toEdge: 't',
    startDir: 'v',
    midSplit: 0.5,
    stakeholder: 'brand',
    color: COLOR_BRAND,
  },
  {
    id: 'link-brand-repeat',
    from: 'port-brand-r',
    to: 'port-repeat-b',
    fromEdge: 'r',
    toEdge: 'b',
    startDir: 'h',
    midSplit: 0.5,
    stakeholder: 'brand',
    color: COLOR_BRAND,
    hasTriplePort: true,
  },
  {
    id: 'link-repeat-adoption',
    from: 'port-repeat-t',
    to: 'port-adoption-b',
    fromEdge: 't',
    toEdge: 'b',
    startDir: 'v',
    midSplit: 0.5,
    stakeholder: 'brand',
    color: COLOR_BRAND,
  },
  {
    id: 'link-brand-gmv',
    from: 'port-brand-l',
    to: 'port-gmv-r',
    fromEdge: 'l',
    toEdge: 'r',
    startDir: 'h',
    midSplit: 0.5,
    stakeholder: 'brand',
    color: COLOR_BRAND,
  },
  {
    id: 'link-gmv-grabbit',
    from: 'port-gmv-t',
    to: 'port-grabbit-b',
    fromEdge: 't',
    toEdge: 'b',
    startDir: 'v',
    midSplit: 0.5,
    stakeholder: 'brand',
    color: COLOR_BRAND,
  },

  // ─── SECONDARY QUIET CROSS-RELATIONSHIPS (NEUTRAL / OCCASIONAL) ───
  {
    id: 'link-demand-signals-bridge',
    from: 'port-demand-r',
    to: 'port-signals-t',
    fromEdge: 'r',
    toEdge: 't',
    startDir: 'h',
    midSplit: 0.5,
    stakeholder: 'neutral',
    color: COLOR_NEUTRAL,
    secondary: true,
  },
  {
    id: 'link-routing-fulfillment-bridge',
    from: 'port-routing-l',
    to: 'port-fulfillment-r',
    fromEdge: 'l',
    toEdge: 'r',
    startDir: 'h',
    midSplit: 0.5,
    stakeholder: 'neutral',
    color: COLOR_NEUTRAL,
    secondary: true,
  },
  {
    id: 'link-dispatch-gmv-bridge',
    from: 'port-dispatch-r',
    to: 'port-gmv-l',
    fromEdge: 'r',
    toEdge: 'l',
    startDir: 'h',
    midSplit: 0.5,
    stakeholder: 'neutral',
    color: COLOR_NEUTRAL,
    secondary: true,
  },
];

// Helper to generate orthogonal paths with filleted 90-degree corner arcs
function createOrthogonalPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  startDir: 'h' | 'v',
  splitRatio = 0.5,
  radius = 14
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (Math.abs(dx) < 1) return `M ${x1} ${y1} L ${x2} ${y2}`;
  if (Math.abs(dy) < 1) return `M ${x1} ${y1} L ${x2} ${y2}`;

  if (startDir === 'h') {
    const midX = x1 + dx * splitRatio;
    const r1 = Math.min(radius, Math.abs(dx * splitRatio), Math.abs(dy));
    const r2 = Math.min(radius, Math.abs(dx * (1 - splitRatio)), Math.abs(dy));
    const signX = dx > 0 ? 1 : -1;
    const signY = dy > 0 ? 1 : -1;

    return (
      `M ${x1} ${y1} ` +
      `L ${midX - signX * r1} ${y1} ` +
      `A ${r1} ${r1} 0 0 ${dx * dy > 0 ? 1 : 0} ${midX} ${y1 + signY * r1} ` +
      `L ${midX} ${y2 - signY * r2} ` +
      `A ${r2} ${r2} 0 0 ${dx * dy > 0 ? 0 : 1} ${midX + signX * r2} ${y2} ` +
      `L ${x2} ${y2}`
    );
  } else {
    const midY = y1 + dy * splitRatio;
    const r1 = Math.min(radius, Math.abs(dy * splitRatio), Math.abs(dx));
    const r2 = Math.min(radius, Math.abs(dy * (1 - splitRatio)), Math.abs(dx));
    const signX = dx > 0 ? 1 : -1;
    const signY = dy > 0 ? 1 : -1;

    return (
      `M ${x1} ${y1} ` +
      `L ${x1} ${midY - signY * r1} ` +
      `A ${r1} ${r1} 0 0 ${dx * dy > 0 ? 0 : 1} ${x1 + signX * r1} ${midY} ` +
      `L ${x2 - signX * r2} ${midY} ` +
      `A ${r2} ${r2} 0 0 ${dx * dy > 0 ? 1 : 0} ${x2} ${midY + signY * r2} ` +
      `L ${x2} ${y2}`
    );
  }
}

// ─── EXACT ATTIO DIRECTION-AWARE BORDER BEAM PATH ───
// The ray starts at the incoming port and circumnavigates the card
function getDirectionalBorderBeamPath(w: number, h: number, r = 12, startEdge: Edge = 'l') {
  if (startEdge === 'l') {
    return `M 0.5 ${h / 2} L 0.5 ${r} A ${r} ${r} 0 0 1 ${r} 0.5 L ${w - r} 0.5 A ${r} ${r} 0 0 1 ${w - 0.5} ${r} L ${w - 0.5} ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h - 0.5} L ${r} ${h - 0.5} A ${r} ${r} 0 0 1 0.5 ${h - r} L 0.5 ${h / 2}`;
  }
  if (startEdge === 'r') {
    return `M ${w - 0.5} ${h / 2} L ${w - 0.5} ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h - 0.5} L ${r} ${h - 0.5} A ${r} ${r} 0 0 1 0.5 ${h - r} L 0.5 ${r} A ${r} ${r} 0 0 1 ${r} 0.5 L ${w - r} 0.5 A ${r} ${r} 0 0 1 ${w - 0.5} ${r} L ${w - 0.5} ${h / 2}`;
  }
  if (startEdge === 't') {
    return `M ${w / 2} 0.5 L ${w - r} 0.5 A ${r} ${r} 0 0 1 ${w - 0.5} ${r} L ${w - 0.5} ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h - 0.5} L ${r} ${h - 0.5} A ${r} ${r} 0 0 1 0.5 ${h - r} L 0.5 ${r} A ${r} ${r} 0 0 1 ${r} 0.5 L ${w / 2} 0.5`;
  }
  return `M ${w / 2} ${h - 0.5} L ${r} ${h - 0.5} A ${r} ${r} 0 0 1 0.5 ${h - r} L 0.5 ${r} A ${r} ${r} 0 0 1 ${r} 0.5 L ${w - r} 0.5 A ${r} ${r} 0 0 1 ${w - 0.5} ${r} L ${w - 0.5} ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h - 0.5} L ${w / 2} ${h - 0.5}`;
}

// ─── BORDER BEAM COMPONENT (MINIMAL & PRECISE PERIMETER RAY) ───
function CardBorderRay({
  width,
  height,
  radius = 12,
  startEdge = 'l',
  color,
  isDrawing,
  drawProgress,
  isCompleted,
}: {
  width: number;
  height: number;
  radius?: number;
  startEdge?: Edge;
  color: string;
  isDrawing: boolean;
  drawProgress: number; // 0 to 1
  isCompleted: boolean;
}) {
  if (width <= 0 || height <= 0 || (!isDrawing && !isCompleted)) return null;

  const d = getDirectionalBorderBeamPath(width, height, radius, startEdge);
  const offset = isCompleted ? 0 : 1000 * (1 - Math.min(1, Math.max(0, drawProgress)));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className="attio-card-beam-svg"
      aria-hidden="true"
    >
      {/* 1. Permanent solid border left behind by the traveling ray */}
      <path
        d={d}
        pathLength={1000}
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={1000}
        strokeDashoffset={offset}
        className="attio-beam-solid-trace"
        style={{
          stroke: color,
        }}
      />

      {/* 2. Traveling ray head (clean & crisp subtle glow) */}
      {isDrawing && drawProgress < 0.995 && (
        <path
          d={d}
          pathLength={1000}
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="80 920"
          strokeDashoffset={offset}
          className="attio-beam-ray-head"
          style={{
            filter: `drop-shadow(0 0 3px ${color})`,
          }}
        />
      )}

      {/* 3. White spark tip leading the ray */}
      {isDrawing && drawProgress < 0.995 && (
        <path
          d={d}
          pathLength={1000}
          stroke="#FFFFFF"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="18 982"
          strokeDashoffset={offset}
          className="attio-beam-ray-core"
          style={{
            stroke: '#FFFFFF',
            filter: 'drop-shadow(0 0 2px #FFFFFF)',
          }}
        />
      )}
    </svg>
  );
}

// Attio Circular Socket Port Component
function SocketPort({
  edge,
  color,
  isActive,
}: {
  edge: 'l' | 'r' | 't' | 'b';
  color: string;
  isActive: boolean;
}) {
  const edgeClass = edge === 'l' ? 'is-left' : edge === 'r' ? 'is-right' : edge === 't' ? 'is-top' : 'is-bottom';
  return (
    <div className={`attio-socket-port ${edgeClass} ${isActive ? 'is-active' : ''}`}>
      <span
        className="attio-socket-inner-dot"
        style={{
          backgroundColor: isActive ? color : '#CDCED2',
          boxShadow: isActive ? `0 0 6px ${color}` : 'none',
        }}
      />
    </div>
  );
}

// Triple Socket Port Component
function TripleSocketPort({
  edge,
  color,
  isActive,
}: {
  edge: 'l' | 'r' | 't' | 'b';
  color: string;
  isActive: boolean;
}) {
  const edgeClass = edge === 'l' ? 'is-left' : edge === 'r' ? 'is-right' : edge === 't' ? 'is-top' : 'is-bottom';
  return (
    <div className={`attio-socket-port triple-port ${edgeClass} ${isActive ? 'is-active' : ''}`}>
      <span
        className="attio-socket-inner-dot"
        style={{
          backgroundColor: isActive ? color : '#CDCED2',
          boxShadow: isActive ? `0 0 6px ${color}` : 'none',
        }}
      />
      <span
        className="attio-socket-inner-dot triple-dot-2"
        style={{
          backgroundColor: isActive ? color : '#CDCED2',
          boxShadow: isActive ? `0 0 6px ${color}` : 'none',
        }}
      />
      <span
        className="attio-socket-inner-dot triple-dot-3"
        style={{
          backgroundColor: isActive ? color : '#CDCED2',
          boxShadow: isActive ? `0 0 6px ${color}` : 'none',
        }}
      />
    </div>
  );
}

// Pipeline Step Type
type StepItem =
  | {
    type: 'node';
    nodeId: string;
    color: string;
    duration: number;
    startEdge: Edge;
    phase: 1 | 2 | 3 | 4;
    stakeholder: 'cafe' | 'supplier' | 'brand' | 'grabbit';
    metricPulse?: string;
    activeText: string;
    completedText: string;
  }
  | {
    type: 'wire';
    wireId: string;
    color: string;
    duration: number;
    phase: 1 | 2 | 3 | 4;
    departPort?: string;
    arrivePort?: string;
  };

const PIPELINE_SEQUENCE: StepItem[] = [
  // ── PHASE 1: CAFÉ DEMAND ──
  {
    type: 'node',
    nodeId: 'node-cafe',
    color: COLOR_CAFE,
    duration: 1500,
    startEdge: 'r',
    phase: 1,
    stakeholder: 'cafe',
    activeText: 'Emitting Demand...',
    completedText: 'Demand Live',
  },
  {
    type: 'wire',
    wireId: 'link-cafe-orders',
    color: COLOR_CAFE,
    duration: 1100,
    phase: 1,
    departPort: 'port-cafe-r',
    arrivePort: 'port-orders-l',
  },
  {
    type: 'node',
    nodeId: 'node-orders',
    color: COLOR_CAFE,
    duration: 1200,
    startEdge: 'l',
    phase: 1,
    stakeholder: 'cafe',
    metricPulse: 'orders',
    activeText: 'Verifying PO...',
    completedText: 'Verified',
  },
  {
    type: 'wire',
    wireId: 'link-orders-demand',
    color: COLOR_CAFE,
    duration: 1000,
    phase: 1,
    departPort: 'port-orders-b',
    arrivePort: 'port-demand-t',
  },
  {
    type: 'node',
    nodeId: 'node-demand',
    color: COLOR_CAFE,
    duration: 1200,
    startEdge: 't',
    phase: 1,
    stakeholder: 'cafe',
    metricPulse: 'demand',
    activeText: 'Aggregating...',
    completedText: '+18.4% Surge',
  },
  {
    type: 'wire',
    wireId: 'link-demand-grabbit',
    color: COLOR_CAFE,
    duration: 1150,
    phase: 1,
    departPort: 'port-demand-b',
    arrivePort: 'port-grabbit-t',
  },

  // ── PHASE 2: GRABBIT CORE PROCESSING ──
  {
    type: 'node',
    nodeId: 'node-grabbit',
    color: COLOR_GRABBIT,
    duration: 1650,
    startEdge: 't',
    phase: 2,
    stakeholder: 'grabbit',
    metricPulse: 'grabbit',
    activeText: 'Routing Circuit...',
    completedText: 'Routed',
  },

  // ── PHASE 3: SUPPLIER FULFILLMENT ──
  {
    type: 'wire',
    wireId: 'link-grabbit-routing',
    color: COLOR_SUPPLIER,
    duration: 1100,
    phase: 3,
    departPort: 'port-grabbit-l',
    arrivePort: 'port-routing-r',
  },
  {
    type: 'node',
    nodeId: 'node-routing',
    color: COLOR_SUPPLIER,
    duration: 1200,
    startEdge: 'r',
    phase: 3,
    stakeholder: 'supplier',
    metricPulse: 'routing',
    activeText: 'Assigning Hub...',
    completedText: 'Assigned',
  },
  {
    type: 'wire',
    wireId: 'link-routing-supplier',
    color: COLOR_SUPPLIER,
    duration: 1100,
    phase: 3,
    departPort: 'port-routing-b',
    arrivePort: 'port-supplier-t',
  },
  {
    type: 'node',
    nodeId: 'node-supplier',
    color: COLOR_SUPPLIER,
    duration: 1550,
    startEdge: 't',
    phase: 3,
    stakeholder: 'supplier',
    metricPulse: 'supplier',
    activeText: 'Locking Order...',
    completedText: 'Ready',
  },
  {
    type: 'wire',
    wireId: 'link-supplier-fulfillment',
    color: COLOR_SUPPLIER,
    duration: 1050,
    phase: 3,
    departPort: 'port-supplier-l',
    arrivePort: 'port-fulfillment-b',
  },
  {
    type: 'node',
    nodeId: 'node-fulfillment',
    color: COLOR_SUPPLIER,
    duration: 1150,
    startEdge: 'b',
    phase: 3,
    stakeholder: 'supplier',
    metricPulse: 'fulfillment',
    activeText: 'Validating SLA...',
    completedText: '98.8% SLA',
  },
  {
    type: 'wire',
    wireId: 'link-fulfillment-inventory',
    color: COLOR_SUPPLIER,
    duration: 950,
    phase: 3,
    departPort: 'port-fulfillment-t',
    arrivePort: 'port-inventory-b',
  },
  {
    type: 'node',
    nodeId: 'node-inventory',
    color: COLOR_SUPPLIER,
    duration: 1150,
    startEdge: 'b',
    phase: 3,
    stakeholder: 'supplier',
    metricPulse: 'inventory',
    activeText: 'Allocating Stock...',
    completedText: '1,240 SKUs',
  },
  {
    type: 'wire',
    wireId: 'link-supplier-dispatch',
    color: COLOR_SUPPLIER,
    duration: 1050,
    phase: 3,
    departPort: 'port-supplier-r',
    arrivePort: 'port-dispatch-l',
  },
  {
    type: 'node',
    nodeId: 'node-dispatch',
    color: COLOR_SUPPLIER,
    duration: 1150,
    startEdge: 'l',
    phase: 3,
    stakeholder: 'supplier',
    metricPulse: 'dispatch',
    activeText: 'Scheduling...',
    completedText: '12:05 PM',
  },

  // ── PHASE 4: BRAND DEMAND INTELLIGENCE ──
  {
    type: 'wire',
    wireId: 'link-grabbit-signals',
    color: COLOR_BRAND,
    duration: 1100,
    phase: 4,
    departPort: 'port-grabbit-r',
    arrivePort: 'port-signals-l',
  },
  {
    type: 'node',
    nodeId: 'node-signals',
    color: COLOR_BRAND,
    duration: 1200,
    startEdge: 'l',
    phase: 4,
    stakeholder: 'brand',
    metricPulse: 'signals',
    activeText: 'Broadcasting...',
    completedText: '125 Cafés',
  },
  {
    type: 'wire',
    wireId: 'link-signals-brand',
    color: COLOR_BRAND,
    duration: 1100,
    phase: 4,
    departPort: 'port-signals-b',
    arrivePort: 'port-brand-t',
  },
  {
    type: 'node',
    nodeId: 'node-brand',
    color: COLOR_BRAND,
    duration: 1550,
    startEdge: 't',
    phase: 4,
    stakeholder: 'brand',
    metricPulse: 'brand',
    activeText: 'Syncing POs...',
    completedText: 'Connected',
  },
  {
    type: 'wire',
    wireId: 'link-brand-repeat',
    color: COLOR_BRAND,
    duration: 1050,
    phase: 4,
    departPort: 'port-brand-r',
    arrivePort: 'port-repeat-b',
  },
  {
    type: 'node',
    nodeId: 'node-repeat',
    color: COLOR_BRAND,
    duration: 1150,
    startEdge: 'b',
    phase: 4,
    stakeholder: 'brand',
    metricPulse: 'repeat',
    activeText: 'Calculating...',
    completedText: '31 POs',
  },
  {
    type: 'wire',
    wireId: 'link-repeat-adoption',
    color: COLOR_BRAND,
    duration: 950,
    phase: 4,
    departPort: 'port-repeat-t',
    arrivePort: 'port-adoption-b',
  },
  {
    type: 'node',
    nodeId: 'node-adoption',
    color: COLOR_BRAND,
    duration: 1150,
    startEdge: 'b',
    phase: 4,
    stakeholder: 'brand',
    metricPulse: 'adoption',
    activeText: 'Verifying...',
    completedText: '85 Verified',
  },
  {
    type: 'wire',
    wireId: 'link-brand-gmv',
    color: COLOR_BRAND,
    duration: 1050,
    phase: 4,
    departPort: 'port-brand-l',
    arrivePort: 'port-gmv-r',
  },
  {
    type: 'node',
    nodeId: 'node-gmv',
    color: COLOR_BRAND,
    duration: 1150,
    startEdge: 'r',
    phase: 4,
    stakeholder: 'brand',
    metricPulse: 'gmv',
    activeText: 'Reconciling...',
    completedText: '₹6.4L Verified',
  },
  {
    type: 'wire',
    wireId: 'link-gmv-grabbit',
    color: COLOR_BRAND,
    duration: 1100,
    phase: 4,
    departPort: 'port-gmv-t',
    arrivePort: 'port-grabbit-b',
  },
];

export function Intersystem() {
  const stageRef = useRef<HTMLDivElement>(null);
  const els = useRef<Record<string, HTMLElement | null>>({});
  const reg = useCallback((k: string) => (n: HTMLElement | null) => {
    els.current[k] = n;
  }, []);

  const [paths, setPaths] = useState<
    {
      id: string;
      d: string;
      stakeholder: 'cafe' | 'supplier' | 'brand' | 'neutral';
      color: string;
      arrowhead?: string;
      secondary?: boolean;
    }[]
  >([]);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [inView, setInView] = useState(true);

  // Hover states
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredStakeholder, setHoveredStakeholder] = useState<'cafe' | 'supplier' | 'brand' | 'grabbit' | null>(null);

  // Active ports flashing
  const [activePorts, setActivePorts] = useState<Record<string, boolean>>({});

  // Dynamic live signal counter
  const [signalCount, setSignalCount] = useState(2634);

  // Micro-data live metrics
  const [cafeOrdersCount, setCafeOrdersCount] = useState(38);
  const [supplierOrdersCount, setSupplierOrdersCount] = useState(38);
  const [inventoryCount, setInventoryCount] = useState(1240);
  const [brandRepeatCount, setBrandRepeatCount] = useState(31);

  // Central Grabbit Processing State
  const [grabbitProcessing, setGrabbitProcessing] = useState<'cafe' | 'supplier' | 'brand' | null>(null);

  // ─── ATTIO BORDER RAY & WIRE STATE ───
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [drawingNode, setDrawingNode] = useState<{ id: string; color: string; progress: number; startEdge: Edge } | null>(null);
  const [completedWires, setCompletedWires] = useState<Set<string>>(new Set());
  const [drawingWire, setDrawingWire] = useState<{ id: string; color: string; progress: number; x: number; y: number } | null>(null);

  const wireLengthsRef = useRef<Record<string, number>>({});

  // Dual arrival pulse rings
  const [arrivalPulses, setArrivalPulses] = useState<PulseEffect[]>([]);

  const pathEls = useRef<Record<string, SVGPathElement | null>>({});
  const [cardDims, setCardDims] = useState<Record<string, { w: number; h: number }>>({});

  // Flash port with dual halo & core flare
  const flashPort = useCallback((portId: string, color: string) => {
    setActivePorts((prev) => ({ ...prev, [portId]: true }));
    const stage = stageRef.current;
    const portEl = els.current[portId];
    if (stage && portEl) {
      const pr = portEl.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      const pulseId = Date.now() + Math.random();
      setArrivalPulses((prev) => [
        ...prev,
        {
          id: pulseId,
          x: pr.left - sr.left + pr.width / 2,
          y: pr.top - sr.top + pr.height / 2,
          color,
        },
      ]);
      setTimeout(() => {
        setArrivalPulses((prev) => prev.filter((p) => p.id !== pulseId));
      }, 750);
    }
  }, []);

  // Update card dimensions
  const updateDims = useCallback(() => {
    const dims: Record<string, { w: number; h: number }> = {};
    for (const [k, el] of Object.entries(els.current)) {
      if (el && k.startsWith('node-')) {
        dims[k] = { w: el.offsetWidth, h: el.offsetHeight };
      }
    }
    setCardDims(dims);
  }, []);

  // Route paths dynamically
  const route = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const sr = stage.getBoundingClientRect();
    setSize({ w: sr.width, h: sr.height });

    if (sr.width < 768) {
      setPaths([]);
      return;
    }

    updateDims();

    const rect = (k: string) => {
      const n = els.current[k];
      if (!n) return null;
      const b = n.getBoundingClientRect();
      return {
        l: b.left - sr.left,
        r: b.right - sr.left,
        t: b.top - sr.top,
        b: b.bottom - sr.top,
        cx: b.left - sr.left + b.width / 2,
        cy: b.top - sr.top + b.height / 2,
      };
    };

    const outPaths: typeof paths = [];
    for (const link of GRAPH_LINKS) {
      const a = rect(link.from);
      const z = rect(link.to);
      if (!a || !z) continue;

      let x1 = a.cx;
      let y1 = a.cy;
      let x2 = z.cx;
      let y2 = z.cy;

      if (link.fromEdge === 'r') x1 = a.r;
      else if (link.fromEdge === 'l') x1 = a.l;
      else if (link.fromEdge === 't') y1 = a.t;
      else if (link.fromEdge === 'b') y1 = a.b;

      if (link.toEdge === 'r') x2 = z.r;
      else if (link.toEdge === 'l') x2 = z.l;
      else if (link.toEdge === 't') y2 = z.t;
      else if (link.toEdge === 'b') y2 = z.b;

      let d = createOrthogonalPath(x1, y1, x2, y2, link.startDir, link.midSplit ?? 0.5, 14);

      if (link.hasTriplePort) {
        const offset = 8;
        let xo = link.fromEdge === 't' || link.fromEdge === 'b' ? offset : 0;
        let yo = link.fromEdge === 'l' || link.fromEdge === 'r' ? offset : 0;
        let d1 = createOrthogonalPath(x1 - xo, y1 - yo, x2, y2, link.startDir, link.midSplit ?? 0.5, 14);
        let d2 = createOrthogonalPath(x1 + xo, y1 + yo, x2, y2, link.startDir, link.midSplit ?? 0.5, 14);
        d = d + " " + d1 + " " + d2;
      }

      let ah = '';
      if (link.toEdge === 'l') {
        ah = `M ${x2 - 5} ${y2 - 4} L ${x2} ${y2} L ${x2 - 5} ${y2 + 4}`;
      } else if (link.toEdge === 'r') {
        ah = `M ${x2 + 5} ${y2 - 4} L ${x2} ${y2} L ${x2 + 5} ${y2 + 4}`;
      } else if (link.toEdge === 't') {
        ah = `M ${x2 - 4} ${y2 - 5} L ${x2} ${y2} L ${x2 + 4} ${y2 - 5}`;
      } else if (link.toEdge === 'b') {
        ah = `M ${x2 - 4} ${y2 + 5} L ${x2} ${y2} L ${x2 + 4} ${y2 + 5}`;
      }

      outPaths.push({
        id: link.id,
        d,
        stakeholder: link.stakeholder,
        color: link.color,
        arrowhead: ah,
        secondary: link.secondary,
      });
    }
    setPaths(outPaths);
  }, [updateDims]);

  useLayoutEffect(() => {
    route();
  }, [route]);

  useEffect(() => {
    const handleResize = () => {
      route();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [route]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
      },
      { threshold: 0, rootMargin: '200px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ─── CHOREOGRAPHED RAY & WIRE SEQUENCE LOOP (CONTINUOUS REPEAT) ───
  useEffect(() => {
    if (!inView || paths.length === 0) return;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let raf = 0;
    let stepIndex = 0;
    let progress = 0;
    let lastTime = performance.now();
    let isHolding = false;
    let holdEndTime = 0;
    let hasDepartFlashed = false;
    let hasArriveFlashed = false;
    let lastStep = -1;

    const frame = (now: number) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      // When hold ends, reset all completed items and cleanly repeat the entire sequence again
      if (isHolding) {
        if (now >= holdEndTime) {
          isHolding = false;
          setCompletedNodes(new Set());
          setCompletedWires(new Set());
          setActivePorts({});
          setDrawingNode(null);
          setDrawingWire(null);
          setArrivalPulses([]);
          setGrabbitProcessing(null);
          setCafeOrdersCount(38);
          setSupplierOrdersCount(38);
          setInventoryCount(1240);
          setBrandRepeatCount(31);
          stepIndex = 0;
          progress = 0;
          lastStep = -1;
          hasDepartFlashed = false;
          hasArriveFlashed = false;
        }
        raf = requestAnimationFrame(frame);
        return;
      }

      if (stepIndex !== lastStep) {
        lastStep = stepIndex;
        hasDepartFlashed = false;
        hasArriveFlashed = false;
      }
      (window as any).__ANIM = { stepIndex, progress, isHolding, lastStep };

      const currentStep = PIPELINE_SEQUENCE[stepIndex];
      const stepDurationSec = currentStep.duration / 1000;
      progress += dt / stepDurationSec;

      if (currentStep.type === 'node') {
        setDrawingNode({
          id: currentStep.nodeId,
          color: currentStep.color,
          progress: Math.min(1, progress),
          startEdge: currentStep.startEdge,
        });

        if (progress >= 0.5 && currentStep.metricPulse) {
          if (currentStep.metricPulse === 'orders') setCafeOrdersCount(39);
          if (currentStep.metricPulse === 'grabbit') {
            setGrabbitProcessing('cafe');
            setSignalCount((c) => c + 1);
          }
          if (currentStep.metricPulse === 'routing') setSupplierOrdersCount(39);
          if (currentStep.metricPulse === 'inventory') setInventoryCount(1239);
          if (currentStep.metricPulse === 'repeat') setBrandRepeatCount(32);
        }

        if (progress >= 1) {
          setCompletedNodes((prev) => new Set(prev).add(currentStep.nodeId));
          setDrawingNode(null);

          if (currentStep.metricPulse === 'orders') setTimeout(() => setCafeOrdersCount(38), 1200);
          if (currentStep.metricPulse === 'grabbit') setTimeout(() => setGrabbitProcessing(null), 600);
          if (currentStep.metricPulse === 'routing') setTimeout(() => setSupplierOrdersCount(38), 1200);
          if (currentStep.metricPulse === 'inventory') setTimeout(() => setInventoryCount(1240), 1200);
          if (currentStep.metricPulse === 'repeat') setTimeout(() => setBrandRepeatCount(31), 1200);

          progress = 0;
          stepIndex++;
          if (stepIndex >= PIPELINE_SEQUENCE.length) {
            isHolding = true;
            holdEndTime = now + 1200;
          }
        }
      } else {
        if (currentStep.departPort && !hasDepartFlashed) {
          hasDepartFlashed = true;
          flashPort(currentStep.departPort, currentStep.color);
        }

        const pathEl = pathEls.current[currentStep.wireId];
        let px = 0;
        let py = 0;
        if (pathEl) {
          if (!wireLengthsRef.current[currentStep.wireId]) {
            wireLengthsRef.current[currentStep.wireId] = pathEl.getTotalLength();
          }
          const totalLength = wireLengthsRef.current[currentStep.wireId];
          const point = pathEl.getPointAtLength(Math.min(1, progress) * totalLength);
          px = point.x;
          py = point.y;
        }

        setDrawingWire({
          id: currentStep.wireId,
          color: currentStep.color,
          progress: Math.min(1, progress),
          x: px,
          y: py,
        });

        if (progress >= 1) {
          setCompletedWires((prev) => new Set(prev).add(currentStep.wireId));
          setDrawingWire(null);

          if (currentStep.arrivePort && !hasArriveFlashed) {
            hasArriveFlashed = true;
            flashPort(currentStep.arrivePort, currentStep.color);
          }

          progress = 0;
          stepIndex++;
          if (stepIndex >= PIPELINE_SEQUENCE.length) {
            isHolding = true;
            holdEndTime = now + 1200;
          }
        }
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView, paths.length, flashPort]);

  // Hover triggers
  const handleCardHover = (nodeKey: string, stakeholder: 'cafe' | 'supplier' | 'brand' | 'grabbit') => {
    setHoveredNode(nodeKey);
    setHoveredStakeholder(stakeholder);
  };

  const handleCardLeave = () => {
    setHoveredNode(null);
    setHoveredStakeholder(null);
  };

  // Helper to determine border color and active reaction classes
  const getCardBorderClass = (nodeId: string, stakeholder: string) => {
    const isCompleted = completedNodes.has(nodeId);
    const isHovered = hoveredNode && nodeId.includes(hoveredNode);
    const isDrawing = drawingNode?.id === nodeId;

    let cls = '';
    if (isDrawing) {
      cls += ` is-active-drawing is-stakeholder-${stakeholder}`;
    }
    if (isCompleted || isHovered) {
      cls += ` is-colored-${stakeholder}`;
    }
    return cls;
  };

  return (
    <section className="att-section" id="intersystem" aria-labelledby="att-title">
      <div className="att-grid-bg" />

      {/* ─── HEADER ─── */}
      <div className="att-header">
        <span className="att-eyebrow">ONE CONNECTED ECOSYSTEM</span>
        <h2 id="att-title" className="att-title">
          One network. Every side of the supply chain.
        </h2>
        <p className="att-desc">
          Cafés create demand. Suppliers fulfill it. Brands see what moves — all through one connected network.
        </p>
      </div>

      {/* ─── DENSE ORTHOGONAL GRAPH STAGE ─── */}
      <div className="att-stage" ref={stageRef}>
        {/* SVG Orthogonal Relationship Wires & Ports */}
        <svg className="att-wires" width={size.w} height={size.h} aria-hidden="true">
          {/* 1. Base Inactive Wires & Static Paths */}
          {paths.map((p) => {
            const isCompleted = completedWires.has(p.id);
            const isCurrentlyDrawing = drawingWire?.id === p.id;
            const isHovered =
              hoveredStakeholder &&
              (hoveredStakeholder === p.stakeholder ||
                (hoveredStakeholder === 'grabbit' && p.id.includes('grabbit')));

            const strokeColor = isCompleted || isHovered ? p.color : COLOR_NEUTRAL;
            const isActive = isCompleted || isCurrentlyDrawing || isHovered;

            return (
              <g key={p.id}>
                {/* Glowing underlay for active wire */}
                {isActive && (
                  <path
                    d={p.d}
                    className="att-wire-glow-underlay"
                    stroke={p.color}
                  />
                )}

                {/* Base wire stroke */}
                <path
                  ref={(n) => {
                    pathEls.current[p.id] = n;
                  }}
                  className={`att-wire-path ${isActive ? 'is-active' : ''} ${p.secondary ? 'is-secondary' : ''}`}
                  d={p.d}
                  stroke={strokeColor}
                />

                {/* Arrowhead at destination port */}
                {p.arrowhead && (
                  <path
                    d={p.arrowhead}
                    className={`att-wire-arrowhead ${isActive ? 'is-active' : ''}`}
                    stroke={strokeColor}
                  />
                )}
              </g>
            );
          })}

          {/* 2. Actively Drawing Wire Line with Animated StrokeDashoffset & Minimal Photon */}
          {drawingWire && (
            <g>
              {/* Clean advancing wire line */}
              <path
                d={paths.find((p) => p.id === drawingWire.id)?.d || ''}
                pathLength={1000}
                fill="none"
                stroke={drawingWire.color}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={1000}
                strokeDashoffset={1000 * (1 - drawingWire.progress)}
              />

              {/* Minimal photon packet head */}
              <circle
                cx={drawingWire.x}
                cy={drawingWire.y}
                r="4"
                fill={drawingWire.color}
                style={{
                  filter: `drop-shadow(0 0 3px ${drawingWire.color})`,
                }}
              />

              {/* Crisp pure-white photon nucleus */}
              <circle
                cx={drawingWire.x}
                cy={drawingWire.y}
                r="1.8"
                fill="#FFFFFF"
              />
            </g>
          )}

          {/* 3. Minimal Arrival Pulse Ring */}
          {arrivalPulses.map((pulse) => (
            <g key={pulse.id}>
              <circle
                cx={pulse.x}
                cy={pulse.y}
                r="3"
                fill="none"
                stroke={pulse.color}
                className="att-arrival-halo-inner"
              />
            </g>
          ))}
        </svg>

        {/* ══════════════════════════════════════════════════════════════
            ZONE 1: CAFÉ & DEMAND CREATION (UPPER CANVAS)
        ══════════════════════════════════════════════════════════════ */}

        {/* 1. Primary Café Card (~260px) */}
        <div
          className={`att-card att-card-primary att-card-cafe ${hoveredStakeholder && hoveredStakeholder !== 'cafe' && hoveredStakeholder !== 'grabbit'
            ? 'is-dimmed'
            : ''
            } ${getCardBorderClass('node-cafe', 'cafe')}`}
          ref={reg('node-cafe')}
          onMouseEnter={() => handleCardHover('cafe', 'cafe')}
          onMouseLeave={handleCardLeave}
        >
          {/* Attio Trigger Tag at top-left */}
          <div className="att-trigger-tag">
            <svg viewBox="0 0 7.5 8.2" fill="currentColor" width="7" height="7.5">
              <path d="M0 1.44C0 .34 1.19-.35 2.15.19l4.65 2.64c.97.55.97 1.95 0 2.5L2.15 7.97C1.19 8.51 0 7.82 0 6.72V1.44Z" />
            </svg>
            <span>Trigger</span>
          </div>

          <div className="att-port-anchor is-right" ref={reg('port-cafe-r')} />
          <div className="att-port-anchor is-bottom" ref={reg('port-cafe-b')} />

          <TripleSocketPort
            edge="r"
            color={COLOR_CAFE}
            isActive={activePorts['port-cafe-r'] || completedWires.has('link-cafe-orders') || drawingWire?.id === 'link-cafe-orders'}
          />

          {/* Directional Border Ray & Permanent Border */}
          <CardBorderRay
            width={cardDims['node-cafe']?.w || 260}
            height={cardDims['node-cafe']?.h || 180}
            radius={14}
            startEdge="r"
            color={COLOR_CAFE}
            isDrawing={drawingNode?.id === 'node-cafe'}
            drawProgress={drawingNode?.id === 'node-cafe' ? drawingNode.progress : 1}
            isCompleted={completedNodes.has('node-cafe') || hoveredNode === 'cafe'}
          />

          <div className="att-card-header">
            <div className="att-card-header-left">
              <div className="att-card-icon-wrap is-cafe">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
              </div>
              <span className="att-card-title">Café</span>
            </div>
            <span className="att-card-badge is-cafe">DEMAND</span>
          </div>

          <div className="att-card-body">
            <div className="att-attr-row">
              <span className="att-attr-label">Order demand</span>
              <span className="att-attr-val">Arabica AA · 10 kg</span>
            </div>
            <div className="att-attr-row">
              <span className="att-attr-label">Pickup / delivery</span>
              <span className="att-attr-val">Today · 12:05 PM</span>
            </div>
            <div className="att-attr-row is-highlight-row">
              <span className="att-attr-label">Active orders</span>
              <span
                className={`att-attr-val font-semibold ${cafeOrdersCount === 39 ? 'is-pulsed' : ''}`}
                style={{ color: cafeOrdersCount === 39 ? COLOR_CAFE : undefined }}
              >
                {cafeOrdersCount}
              </span>
            </div>
          </div>

          <div className="att-card-footer">
            <span className="att-status-dot is-cafe" />
            <span className="att-footer-text">Live demand signals</span>
          </div>
        </div>

        {/* Secondary: Orders */}
        <div
          className={`att-card att-card-secondary att-node-orders ${hoveredStakeholder && hoveredStakeholder !== 'cafe' && hoveredStakeholder !== 'grabbit'
            ? 'is-dimmed'
            : ''
            } ${getCardBorderClass('node-orders', 'cafe')}`}
          ref={reg('node-orders')}
          onMouseEnter={() => handleCardHover('orders', 'cafe')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-left" ref={reg('port-orders-l')} />
          <div className="att-port-anchor is-bottom" ref={reg('port-orders-b')} />

          <SocketPort
            edge="l"
            color={COLOR_CAFE}
            isActive={activePorts['port-orders-l'] || completedWires.has('link-cafe-orders')}
          />
          <SocketPort
            edge="b"
            color={COLOR_CAFE}
            isActive={activePorts['port-orders-b'] || completedWires.has('link-orders-demand') || drawingWire?.id === 'link-orders-demand'}
          />

          <CardBorderRay
            width={cardDims['node-orders']?.w || 140}
            height={cardDims['node-orders']?.h || 60}
            radius={10}
            startEdge="l"
            color={COLOR_CAFE}
            isDrawing={drawingNode?.id === 'node-orders'}
            drawProgress={drawingNode?.id === 'node-orders' ? drawingNode.progress : 1}
            isCompleted={completedNodes.has('node-orders') || hoveredNode === 'orders'}
          />

          <div className="att-sec-header">
            <span className="att-sec-label">ORDERS</span>
            <span className="att-sec-dot is-cafe" />
          </div>
          <span
            className={`att-sec-metric ${cafeOrdersCount === 39 ? 'is-pulsed' : ''}`}
            style={{ color: cafeOrdersCount === 39 ? COLOR_CAFE : undefined }}
          >
            {cafeOrdersCount} active
          </span>
        </div>

        {/* Secondary: Demand */}
        <div
          className={`att-card att-card-secondary att-node-demand ${hoveredStakeholder && hoveredStakeholder !== 'cafe' && hoveredStakeholder !== 'grabbit'
            ? 'is-dimmed'
            : ''
            } ${getCardBorderClass('node-demand', 'cafe')}`}
          ref={reg('node-demand')}
          onMouseEnter={() => handleCardHover('demand', 'cafe')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-top" ref={reg('port-demand-t')} />
          <div className="att-port-anchor is-bottom" ref={reg('port-demand-b')} />
          <div className="att-port-anchor is-right" ref={reg('port-demand-r')} />

          <SocketPort
            edge="t"
            color={COLOR_CAFE}
            isActive={activePorts['port-demand-t'] || completedWires.has('link-orders-demand')}
          />
          <SocketPort
            edge="b"
            color={COLOR_CAFE}
            isActive={activePorts['port-demand-b'] || completedWires.has('link-demand-grabbit') || drawingWire?.id === 'link-demand-grabbit'}
          />

          <CardBorderRay
            width={cardDims['node-demand']?.w || 155}
            height={cardDims['node-demand']?.h || 60}
            radius={10}
            startEdge="t"
            color={COLOR_CAFE}
            isDrawing={drawingNode?.id === 'node-demand'}
            drawProgress={drawingNode?.id === 'node-demand' ? drawingNode.progress : 1}
            isCompleted={completedNodes.has('node-demand') || hoveredNode === 'demand'}
          />

          <div className="att-sec-header">
            <span className="att-sec-label">DEMAND</span>
            <span className="att-sec-dot is-cafe" />
          </div>
          <span className="att-sec-metric">+18.4% this week</span>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            ZONE 2: REFINED GRABBIT NETWORK CORE (THE ROUTING ENGINE)
        ══════════════════════════════════════════════════════════════ */}

        <div
          className={`att-grabbit-chip ${grabbitProcessing ? `is-processing is-processing-${grabbitProcessing}` : ''
            } ${getCardBorderClass('node-grabbit', 'grabbit')} ${hoveredStakeholder === 'grabbit' ? 'is-hovered' : ''}`}
          ref={reg('node-grabbit')}
          onMouseEnter={() => handleCardHover('grabbit', 'grabbit')}
          onMouseLeave={handleCardLeave}
        >

          <div className="att-port-anchor is-top" ref={reg('port-grabbit-t')} />
          <div className="att-port-anchor is-bottom" ref={reg('port-grabbit-b')} />
          <div className="att-port-anchor is-left" ref={reg('port-grabbit-l')} />
          <div className="att-port-anchor is-right" ref={reg('port-grabbit-r')} />

          <SocketPort
            edge="t"
            color={COLOR_CAFE}
            isActive={activePorts['port-grabbit-t'] || completedWires.has('link-demand-grabbit')}
          />
          <SocketPort
            edge="b"
            color={COLOR_BRAND}
            isActive={activePorts['port-grabbit-b'] || completedWires.has('link-gmv-grabbit')}
          />
          <TripleSocketPort
            edge="l"
            color={COLOR_SUPPLIER}
            isActive={activePorts['port-grabbit-l'] || completedWires.has('link-grabbit-routing') || drawingWire?.id === 'link-grabbit-routing'}
          />
          <TripleSocketPort
            edge="r"
            color={COLOR_BRAND}
            isActive={activePorts['port-grabbit-r'] || completedWires.has('link-grabbit-signals') || drawingWire?.id === 'link-grabbit-signals'}
          />

          <CardBorderRay
            width={cardDims['node-grabbit']?.w || 326}
            height={cardDims['node-grabbit']?.h || 64}
            radius={14}
            startEdge="t"
            color={COLOR_GRABBIT}
            isDrawing={drawingNode?.id === 'node-grabbit'}
            drawProgress={drawingNode?.id === 'node-grabbit' ? drawingNode.progress : 1}
            isCompleted={completedNodes.has('node-grabbit') || hoveredNode === 'grabbit'}
          />

          <div className="att-chip-inner">
            <div className="att-chip-mark-wrap">
              <svg viewBox="0 0 28 28" width="28" height="28" className="att-chip-mark" aria-hidden="true">
                <path
                  d="M 7.68 8.31 A 8.5 8.5 0 0 1 20.32 8.31"
                  fill="none"
                  stroke={COLOR_CAFE}
                  strokeWidth={drawingNode?.id === 'node-grabbit' ? "2.6" : "2.2"}
                  strokeLinecap="round"
                  style={{
                    opacity: grabbitProcessing === 'cafe' || completedNodes.has('node-cafe') ? 1 : 0.6,
                    filter: grabbitProcessing === 'cafe' || drawingNode?.id === 'node-grabbit' ? `drop-shadow(0 0 6px ${COLOR_CAFE})` : 'none',
                    transition: 'all 0.25s',
                  }}
                />
                <path
                  d="M 22.08 11.37 A 8.5 8.5 0 0 1 15.77 22.31"
                  fill="none"
                  stroke={COLOR_BRAND}
                  strokeWidth={drawingNode?.id === 'node-grabbit' ? "2.6" : "2.2"}
                  strokeLinecap="round"
                  style={{
                    opacity: grabbitProcessing === 'brand' || completedNodes.has('node-brand') ? 1 : 0.6,
                    filter: grabbitProcessing === 'brand' || drawingNode?.id === 'node-grabbit' ? `drop-shadow(0 0 6px ${COLOR_BRAND})` : 'none',
                    transition: 'all 0.25s',
                  }}
                />
                <path
                  d="M 12.23 22.31 A 8.5 8.5 0 0 1 5.92 11.37"
                  fill="none"
                  stroke={COLOR_SUPPLIER}
                  strokeWidth={drawingNode?.id === 'node-grabbit' ? "2.6" : "2.2"}
                  strokeLinecap="round"
                  style={{
                    opacity: grabbitProcessing === 'supplier' || completedNodes.has('node-supplier') ? 1 : 0.6,
                    filter: grabbitProcessing === 'supplier' || drawingNode?.id === 'node-grabbit' ? `drop-shadow(0 0 6px ${COLOR_SUPPLIER})` : 'none',
                    transition: 'all 0.25s',
                  }}
                />
                <circle
                  cx="14"
                  cy="14"
                  r="3"
                  fill="#FFFFFF"
                  stroke={drawingNode?.id === 'node-grabbit' ? COLOR_GRABBIT : "#CDC9BE"}
                  strokeWidth="1.2"
                />
                <circle
                  cx="14"
                  cy="14"
                  r="1.4"
                  fill={drawingNode?.id === 'node-grabbit' ? COLOR_GRABBIT : "#8A867B"}
                  style={{
                    filter: drawingNode?.id === 'node-grabbit' ? `drop-shadow(0 0 4px ${COLOR_GRABBIT})` : 'none',
                  }}
                />
              </svg>
            </div>

            <div className="att-chip-divider" />

            <div className="att-chip-body">
              <div className="att-chip-primary-line">
                <span className="att-chip-brand">grabbit</span>
                <div className="att-chip-signals-badge">
                </div>
              </div>
              <div className="att-chip-routing-track">
                <span className={`att-chip-track-node is-cafe ${completedNodes.has('node-cafe') ? 'is-active' : ''}`}>
                  CAFÉ
                </span>
                <span className="att-chip-track-arrow">→</span>
                <span className={`att-chip-track-node is-supplier ${completedNodes.has('node-supplier') ? 'is-active' : ''}`}>
                  SUPPLIER
                </span>
                <span className="att-chip-track-arrow">→</span>
                <span className={`att-chip-track-node is-brand ${completedNodes.has('node-brand') ? 'is-active' : ''}`}>
                  BRAND
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            ZONE 3: SUPPLIER & FULFILLMENT (LOWER-LEFT CANVAS)
        ══════════════════════════════════════════════════════════════ */}

        {/* Secondary: Order Routing */}
        <div
          className={`att-card att-card-secondary att-node-routing ${hoveredStakeholder && hoveredStakeholder !== 'supplier' && hoveredStakeholder !== 'grabbit'
            ? 'is-dimmed'
            : ''
            } ${getCardBorderClass('node-routing', 'supplier')}`}
          ref={reg('node-routing')}
          onMouseEnter={() => handleCardHover('routing', 'supplier')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-right" ref={reg('port-routing-r')} />
          <div className="att-port-anchor is-bottom" ref={reg('port-routing-b')} />

          <SocketPort
            edge="r"
            color={COLOR_SUPPLIER}
            isActive={activePorts['port-routing-r'] || completedWires.has('link-grabbit-routing')}
          />
          <SocketPort
            edge="b"
            color={COLOR_SUPPLIER}
            isActive={activePorts['port-routing-b'] || completedWires.has('link-routing-supplier') || drawingWire?.id === 'link-routing-supplier'}
          />

          <CardBorderRay
            width={cardDims['node-routing']?.w || 145}
            height={cardDims['node-routing']?.h || 60}
            radius={10}
            startEdge="r"
            color={COLOR_SUPPLIER}
            isDrawing={drawingNode?.id === 'node-routing'}
            drawProgress={drawingNode?.id === 'node-routing' ? drawingNode.progress : 1}
            isCompleted={completedNodes.has('node-routing') || hoveredNode === 'routing'}
          />

          <div className="att-sec-header">
            <span className="att-sec-label">ORDER ROUTING</span>
            <span className="att-sec-dot is-supplier" />
          </div>
          <span
            className={`att-sec-metric ${supplierOrdersCount === 39 ? 'is-pulsed' : ''}`}
            style={{ color: supplierOrdersCount === 39 ? COLOR_SUPPLIER : undefined }}
          >
            {supplierOrdersCount} today
          </span>
        </div>

        {/* Secondary: Inventory */}
        <div
          className={`att-card att-card-secondary att-node-inventory ${hoveredStakeholder && hoveredStakeholder !== 'supplier' && hoveredStakeholder !== 'grabbit'
            ? 'is-dimmed'
            : ''
            } ${getCardBorderClass('node-inventory', 'supplier')}`}
          ref={reg('node-inventory')}
          onMouseEnter={() => handleCardHover('inventory', 'supplier')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-bottom" ref={reg('port-inventory-b')} />

          <SocketPort
            edge="b"
            color={COLOR_SUPPLIER}
            isActive={activePorts['port-inventory-b'] || completedWires.has('link-fulfillment-inventory')}
          />

          <CardBorderRay
            width={cardDims['node-inventory']?.w || 145}
            height={cardDims['node-inventory']?.h || 60}
            radius={10}
            startEdge="b"
            color={COLOR_SUPPLIER}
            isDrawing={drawingNode?.id === 'node-inventory'}
            drawProgress={drawingNode?.id === 'node-inventory' ? drawingNode.progress : 1}
            isCompleted={completedNodes.has('node-inventory') || hoveredNode === 'inventory'}
          />

          <div className="att-sec-header">
            <span className="att-sec-label">INVENTORY</span>
            <span className="att-sec-dot is-supplier" />
          </div>
          <span className="att-sec-metric">{inventoryCount.toLocaleString()} SKUs</span>
        </div>

        {/* Secondary: Fulfillment */}
        <div
          className={`att-card att-card-secondary att-node-fulfillment ${hoveredStakeholder && hoveredStakeholder !== 'supplier' && hoveredStakeholder !== 'grabbit'
            ? 'is-dimmed'
            : ''
            } ${getCardBorderClass('node-fulfillment', 'supplier')}`}
          ref={reg('node-fulfillment')}
          onMouseEnter={() => handleCardHover('fulfillment', 'supplier')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-bottom" ref={reg('port-fulfillment-b')} />
          <div className="att-port-anchor is-top" ref={reg('port-fulfillment-t')} />

          <SocketPort
            edge="b"
            color={COLOR_SUPPLIER}
            isActive={activePorts['port-fulfillment-b'] || completedWires.has('link-supplier-fulfillment')}
          />
          <SocketPort
            edge="t"
            color={COLOR_SUPPLIER}
            isActive={activePorts['port-fulfillment-t'] || completedWires.has('link-fulfillment-inventory') || drawingWire?.id === 'link-fulfillment-inventory'}
          />

          <CardBorderRay
            width={cardDims['node-fulfillment']?.w || 140}
            height={cardDims['node-fulfillment']?.h || 60}
            radius={10}
            startEdge="b"
            color={COLOR_SUPPLIER}
            isDrawing={drawingNode?.id === 'node-fulfillment'}
            drawProgress={drawingNode?.id === 'node-fulfillment' ? drawingNode.progress : 1}
            isCompleted={completedNodes.has('node-fulfillment') || hoveredNode === 'fulfillment'}
          />

          <div className="att-sec-header">
            <span className="att-sec-label">FULFILLMENT</span>
            <span className="att-sec-dot is-supplier" />
          </div>
          <span className="att-sec-metric">98.8% SLA</span>
        </div>

        {/* 2. Primary Supplier Card (~260px) */}
        <div
          className={`att-card att-card-primary att-card-supplier ${hoveredStakeholder && hoveredStakeholder !== 'supplier' && hoveredStakeholder !== 'grabbit'
            ? 'is-dimmed'
            : ''
            } ${getCardBorderClass('node-supplier', 'supplier')}`}
          ref={reg('node-supplier')}
          onMouseEnter={() => handleCardHover('supplier', 'supplier')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-top" ref={reg('port-supplier-t')} />
          <div className="att-port-anchor is-left" ref={reg('port-supplier-l')} />
          <div className="att-port-anchor is-right" ref={reg('port-supplier-r')} />

          <SocketPort
            edge="t"
            color={COLOR_SUPPLIER}
            isActive={activePorts['port-supplier-t'] || completedWires.has('link-routing-supplier')}
          />
          <SocketPort
            edge="l"
            color={COLOR_SUPPLIER}
            isActive={activePorts['port-supplier-l'] || completedWires.has('link-supplier-fulfillment') || drawingWire?.id === 'link-supplier-fulfillment'}
          />
          <TripleSocketPort
            edge="r"
            color={COLOR_SUPPLIER}
            isActive={activePorts['port-supplier-r'] || completedWires.has('link-supplier-dispatch') || drawingWire?.id === 'link-supplier-dispatch'}
          />

          <CardBorderRay
            width={cardDims['node-supplier']?.w || 260}
            height={cardDims['node-supplier']?.h || 180}
            radius={14}
            startEdge="t"
            color={COLOR_SUPPLIER}
            isDrawing={drawingNode?.id === 'node-supplier'}
            drawProgress={drawingNode?.id === 'node-supplier' ? drawingNode.progress : 1}
            isCompleted={completedNodes.has('node-supplier') || hoveredNode === 'supplier'}
          />

          <div className="att-card-header">
            <div className="att-card-header-left">
              <div className="att-card-icon-wrap is-supplier">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <span className="att-card-title">Supplier</span>
            </div>
            <span className="att-card-badge is-supplier">FULFILLMENT</span>
          </div>

          <div className="att-card-body">
            <div className="att-attr-row is-highlight-row">
              <span className="att-attr-label">Incoming orders</span>
              <span
                className={`att-attr-val font-semibold ${supplierOrdersCount === 39 ? 'is-pulsed' : ''}`}
                style={{ color: supplierOrdersCount === 39 ? COLOR_SUPPLIER : undefined }}
              >
                {supplierOrdersCount} today
              </span>
            </div>
            <div className="att-attr-row">
              <span className="att-attr-label">Live inventory</span>
              <span className="att-attr-val">{inventoryCount.toLocaleString()} SKUs</span>
            </div>
            <div className="att-attr-row">
              <span className="att-attr-label">Dispatch status</span>
              <span className="att-attr-val">98.8% on time</span>
            </div>
          </div>

          <div className="att-card-footer">
            <span className="att-status-dot is-supplier" />
            <span className="att-footer-text">Inventory + fulfillment</span>
          </div>
        </div>

        {/* Secondary: Dispatch */}
        <div
          className={`att-card att-card-secondary att-node-dispatch ${hoveredStakeholder && hoveredStakeholder !== 'supplier' && hoveredStakeholder !== 'grabbit'
            ? 'is-dimmed'
            : ''
            } ${getCardBorderClass('node-dispatch', 'supplier')}`}
          ref={reg('node-dispatch')}
          onMouseEnter={() => handleCardHover('dispatch', 'supplier')}
          onMouseLeave={handleCardLeave}
        >

          <div className="att-port-anchor is-left" ref={reg('port-dispatch-l')} />
          <div className="att-port-anchor is-right" ref={reg('port-dispatch-r')} />

          <SocketPort
            edge="l"
            color={COLOR_SUPPLIER}
            isActive={activePorts['port-dispatch-l'] || completedWires.has('link-supplier-dispatch')}
          />

          <CardBorderRay
            width={cardDims['node-dispatch']?.w || 135}
            height={cardDims['node-dispatch']?.h || 60}
            radius={10}
            startEdge="l"
            color={COLOR_SUPPLIER}
            isDrawing={drawingNode?.id === 'node-dispatch'}
            drawProgress={drawingNode?.id === 'node-dispatch' ? drawingNode.progress : 1}
            isCompleted={completedNodes.has('node-dispatch') || hoveredNode === 'dispatch'}
          />

          <div className="att-sec-header">
            <span className="att-sec-label">DISPATCH</span>
            <span className="att-sec-dot is-supplier" />
          </div>
          <span className="att-sec-metric">12:05 PM</span>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            ZONE 4: BRAND & DEMAND INTELLIGENCE (RIGHT CANVAS)
        ══════════════════════════════════════════════════════════════ */}

        {/* Secondary: Demand Signals */}
        <div
          className={`att-card att-card-secondary att-node-signals ${hoveredStakeholder && hoveredStakeholder !== 'brand' && hoveredStakeholder !== 'grabbit'
            ? 'is-dimmed'
            : ''
            } ${getCardBorderClass('node-signals', 'brand')}`}
          ref={reg('node-signals')}
          onMouseEnter={() => handleCardHover('signals', 'brand')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-left" ref={reg('port-signals-l')} />
          <div className="att-port-anchor is-bottom" ref={reg('port-signals-b')} />
          <div className="att-port-anchor is-top" ref={reg('port-signals-t')} />

          <SocketPort
            edge="l"
            color={COLOR_BRAND}
            isActive={activePorts['port-signals-l'] || completedWires.has('link-grabbit-signals')}
          />
          <SocketPort
            edge="b"
            color={COLOR_BRAND}
            isActive={activePorts['port-signals-b'] || completedWires.has('link-signals-brand') || drawingWire?.id === 'link-signals-brand'}
          />

          <CardBorderRay
            width={cardDims['node-signals']?.w || 150}
            height={cardDims['node-signals']?.h || 60}
            radius={10}
            startEdge="l"
            color={COLOR_BRAND}
            isDrawing={drawingNode?.id === 'node-signals'}
            drawProgress={drawingNode?.id === 'node-signals' ? drawingNode.progress : 1}
            isCompleted={completedNodes.has('node-signals') || hoveredNode === 'signals'}
          />

          <div className="att-sec-header">
            <span className="att-sec-label">DEMAND SIGNALS</span>
            <span className="att-sec-dot is-brand" />
          </div>
          <span className="att-sec-metric">125 cafés</span>
        </div>

        {/* Secondary: Adoption */}
        <div
          className={`att-card att-card-secondary att-node-adoption ${hoveredStakeholder && hoveredStakeholder !== 'brand' && hoveredStakeholder !== 'grabbit'
            ? 'is-dimmed'
            : ''
            } ${getCardBorderClass('node-adoption', 'brand')}`}
          ref={reg('node-adoption')}
          onMouseEnter={() => handleCardHover('adoption', 'brand')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-bottom" ref={reg('port-adoption-b')} />

          <SocketPort
            edge="b"
            color={COLOR_BRAND}
            isActive={activePorts['port-adoption-b'] || completedWires.has('link-repeat-adoption')}
          />

          <CardBorderRay
            width={cardDims['node-adoption']?.w || 140}
            height={cardDims['node-adoption']?.h || 60}
            radius={10}
            startEdge="b"
            color={COLOR_BRAND}
            isDrawing={drawingNode?.id === 'node-adoption'}
            drawProgress={drawingNode?.id === 'node-adoption' ? drawingNode.progress : 1}
            isCompleted={completedNodes.has('node-adoption') || hoveredNode === 'adoption'}
          />

          <div className="att-sec-header">
            <span className="att-sec-label">ADOPTION</span>
            <span className="att-sec-dot is-brand" />
          </div>
          <span className="att-sec-metric">85 verified</span>
        </div>

        {/* Secondary: Repeat Orders */}
        <div
          className={`att-card att-card-secondary att-node-repeat ${hoveredStakeholder && hoveredStakeholder !== 'brand' && hoveredStakeholder !== 'grabbit'
            ? 'is-dimmed'
            : ''
            } ${getCardBorderClass('node-repeat', 'brand')}`}
          ref={reg('node-repeat')}
          onMouseEnter={() => handleCardHover('repeat', 'brand')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-bottom" ref={reg('port-repeat-b')} />
          <div className="att-port-anchor is-top" ref={reg('port-repeat-t')} />

          <SocketPort
            edge="b"
            color={COLOR_BRAND}
            isActive={activePorts['port-repeat-b'] || completedWires.has('link-brand-repeat')}
          />
          <SocketPort
            edge="t"
            color={COLOR_BRAND}
            isActive={activePorts['port-repeat-t'] || completedWires.has('link-repeat-adoption') || drawingWire?.id === 'link-repeat-adoption'}
          />

          <CardBorderRay
            width={cardDims['node-repeat']?.w || 140}
            height={cardDims['node-repeat']?.h || 60}
            radius={10}
            startEdge="b"
            color={COLOR_BRAND}
            isDrawing={drawingNode?.id === 'node-repeat'}
            drawProgress={drawingNode?.id === 'node-repeat' ? drawingNode.progress : 1}
            isCompleted={completedNodes.has('node-repeat') || hoveredNode === 'repeat'}
          />

          <div className="att-sec-header">
            <span className="att-sec-label">REPEAT ORDERS</span>
            <span className="att-sec-dot is-brand" />
          </div>
          <span
            className={`att-sec-metric ${brandRepeatCount === 32 ? 'is-pulsed' : ''}`}
            style={{ color: brandRepeatCount === 32 ? COLOR_BRAND : undefined }}
          >
            {brandRepeatCount} POs
          </span>
        </div>

        {/* 3. Primary Brand Card (~260px) */}
        <div
          className={`att-card att-card-primary att-card-brand ${hoveredStakeholder && hoveredStakeholder !== 'brand' && hoveredStakeholder !== 'grabbit'
            ? 'is-dimmed'
            : ''
            } ${getCardBorderClass('node-brand', 'brand')}`}
          ref={reg('node-brand')}
          onMouseEnter={() => handleCardHover('brand', 'brand')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-top" ref={reg('port-brand-t')} />
          <div className="att-port-anchor is-right" ref={reg('port-brand-r')} />
          <div className="att-port-anchor is-left" ref={reg('port-brand-l')} />

          <SocketPort
            edge="t"
            color={COLOR_BRAND}
            isActive={activePorts['port-brand-t'] || completedWires.has('link-signals-brand')}
          />
          <TripleSocketPort
            edge="r"
            color={COLOR_BRAND}
            isActive={activePorts['port-brand-r'] || completedWires.has('link-brand-repeat') || drawingWire?.id === 'link-brand-repeat'}
          />
          <SocketPort
            edge="l"
            color={COLOR_BRAND}
            isActive={activePorts['port-brand-l'] || completedWires.has('link-brand-gmv') || drawingWire?.id === 'link-brand-gmv'}
          />

          <CardBorderRay
            width={cardDims['node-brand']?.w || 260}
            height={cardDims['node-brand']?.h || 180}
            radius={14}
            startEdge="t"
            color={COLOR_BRAND}
            isDrawing={drawingNode?.id === 'node-brand'}
            drawProgress={drawingNode?.id === 'node-brand' ? drawingNode.progress : 1}
            isCompleted={completedNodes.has('node-brand') || hoveredNode === 'brand'}
          />

          <div className="att-card-header">
            <div className="att-card-header-left">
              <div className="att-card-icon-wrap is-brand">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20V10" />
                  <path d="M18 20V4" />
                  <path d="M6 20v-4" />
                </svg>
              </div>
              <span className="att-card-title">Brand</span>
            </div>
            <span className="att-card-badge is-brand">DEMAND INTELLIGENCE</span>
          </div>

          <div className="att-card-body">
            <div className="att-attr-row is-highlight-row">
              <span className="att-attr-label">Cafés reached</span>
              <span className="att-attr-val font-semibold">125</span>
            </div>
            <div className="att-attr-row">
              <span className="att-attr-label">Repeat POs</span>
              <span
                className={`att-attr-val ${brandRepeatCount === 32 ? 'is-pulsed' : ''}`}
                style={{ color: brandRepeatCount === 32 ? COLOR_BRAND : undefined }}
              >
                {brandRepeatCount}
              </span>
            </div>
            <div className="att-attr-row">
              <span className="att-attr-label">Projected GMV</span>
              <span className="att-attr-val font-semibold">₹6.4L</span>
            </div>
          </div>

          <div className="att-card-footer">
            <span className="att-status-dot is-brand" />
            <span className="att-footer-text">Adoption + demand insights</span>
          </div>
        </div>

        {/* Secondary: Projected GMV */}
        <div
          className={`att-card att-card-secondary att-node-gmv ${hoveredStakeholder && hoveredStakeholder !== 'brand' && hoveredStakeholder !== 'grabbit'
            ? 'is-dimmed'
            : ''
            } ${getCardBorderClass('node-gmv', 'brand')}`}
          ref={reg('node-gmv')}
          onMouseEnter={() => handleCardHover('gmv', 'brand')}
          onMouseLeave={handleCardLeave}
        >

          <div className="att-port-anchor is-top" ref={reg('port-gmv-t')} />
          <div className="att-port-anchor is-right" ref={reg('port-gmv-r')} />
          <div className="att-port-anchor is-left" ref={reg('port-gmv-l')} />

          <SocketPort
            edge="r"
            color={COLOR_BRAND}
            isActive={activePorts['port-gmv-r'] || completedWires.has('link-brand-gmv')}
          />
          <SocketPort
            edge="t"
            color={COLOR_BRAND}
            isActive={activePorts['port-gmv-t'] || completedWires.has('link-gmv-grabbit') || drawingWire?.id === 'link-gmv-grabbit'}
          />

          <CardBorderRay
            width={cardDims['node-gmv']?.w || 145}
            height={cardDims['node-gmv']?.h || 60}
            radius={10}
            startEdge="r"
            color={COLOR_BRAND}
            isDrawing={drawingNode?.id === 'node-gmv'}
            drawProgress={drawingNode?.id === 'node-gmv' ? drawingNode.progress : 1}
            isCompleted={completedNodes.has('node-gmv') || hoveredNode === 'gmv'}
          />

          <div className="att-sec-header">
            <span className="att-sec-label">PROJECTED GMV</span>
            <span className="att-sec-dot is-brand" />
          </div>
          <span className="att-sec-metric">₹6.4L</span>
        </div>
      </div>
    </section>
  );
}


