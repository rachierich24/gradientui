'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

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
}

interface BracketDef {
  id: string;
  edge: Edge;
  stakeholder: 'cafe' | 'supplier' | 'brand' | 'neutral';
}

// Color tokens
const COLOR_CAFE = '#E5483B';
const COLOR_SUPPLIER = '#22C55E';
const COLOR_BRAND = '#6D28D9';
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
  // ─── FLOW 04: NETWORK RETURN / DOWNSTREAM GMV ACTIVITY → GRABBIT CORE ───
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

// Ports equipped with the Attio 3-dot bracket socket system
const BRACKET_PORT_CONFIGS: BracketDef[] = [
  { id: 'port-cafe-r', edge: 'r', stakeholder: 'cafe' },
  { id: 'port-orders-l', edge: 'l', stakeholder: 'cafe' },
  { id: 'port-orders-b', edge: 'b', stakeholder: 'cafe' },
  { id: 'port-demand-t', edge: 't', stakeholder: 'cafe' },
  { id: 'port-routing-r', edge: 'r', stakeholder: 'supplier' },
  { id: 'port-supplier-r', edge: 'r', stakeholder: 'supplier' },
  { id: 'port-dispatch-l', edge: 'l', stakeholder: 'supplier' },
  { id: 'port-supplier-l', edge: 'l', stakeholder: 'supplier' },
  { id: 'port-signals-l', edge: 'l', stakeholder: 'brand' },
  { id: 'port-brand-l', edge: 'l', stakeholder: 'brand' },
  { id: 'port-gmv-r', edge: 'r', stakeholder: 'brand' },
  { id: 'port-brand-r', edge: 'r', stakeholder: 'brand' },
];

function createOrthogonalPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  startDir: 'h' | 'v',
  midSplit = 0.5,
  r = 14
): string {
  if (Math.abs(y1 - y2) < 2) return `M ${x1} ${y1} L ${x2} ${y2}`;
  if (Math.abs(x1 - x2) < 2) return `M ${x1} ${y1} L ${x2} ${y2}`;

  if (startDir === 'h') {
    const mx = x1 + (x2 - x1) * midSplit;
    const sx1 = Math.sign(mx - x1);
    const sy = Math.sign(y2 - y1);
    const sx2 = Math.sign(x2 - mx);
    const radius = Math.min(r, Math.abs(mx - x1) / 2, Math.abs(x2 - mx) / 2, Math.abs(y2 - y1) / 2);

    return [
      `M ${x1} ${y1}`,
      `L ${mx - sx1 * radius} ${y1}`,
      `Q ${mx} ${y1} ${mx} ${y1 + sy * radius}`,
      `L ${mx} ${y2 - sy * radius}`,
      `Q ${mx} ${y2} ${mx + sx2 * radius} ${y2}`,
      `L ${x2} ${y2}`,
    ].join(' ');
  } else {
    const my = y1 + (y2 - y1) * midSplit;
    const sy1 = Math.sign(my - y1);
    const sx = Math.sign(x2 - x1);
    const sy2 = Math.sign(y2 - my);
    const radius = Math.min(r, Math.abs(my - y1) / 2, Math.abs(y2 - my) / 2, Math.abs(x2 - x1) / 2);

    return [
      `M ${x1} ${y1}`,
      `L ${x1} ${my - sy1 * radius}`,
      `Q ${x1} ${my} ${x1 + sx * radius} ${my}`,
      `L ${x2 - sx * radius} ${my}`,
      `Q ${x2} ${my} ${x2} ${my + sy2 * radius}`,
      `L ${x2} ${y2}`,
    ].join(' ');
  }
}

function createBracketCurve(x: number, y: number, edge: Edge, span = 12, depth = 9, r = 5): string {
  if (edge === 'r') {
    return `M ${x} ${y - span} L ${x + depth - r} ${y - span} Q ${x + depth} ${y - span} ${x + depth} ${y - span + r} L ${x + depth} ${y + span - r} Q ${x + depth} ${y + span} ${x + depth - r} ${y + span} L ${x} ${y + span}`;
  }
  if (edge === 'l') {
    return `M ${x} ${y - span} L ${x - depth + r} ${y - span} Q ${x - depth} ${y - span} ${x - depth} ${y - span + r} L ${x - depth} ${y + span - r} Q ${x - depth} ${y + span} ${x - depth + r} ${y + span} L ${x} ${y + span}`;
  }
  if (edge === 'b') {
    return `M ${x - span} ${y} L ${x - span} ${y + depth - r} Q ${x - span} ${y + depth} ${x - span + r} ${y + depth} L ${x + span - r} ${y + depth} Q ${x + span} ${y + depth} ${x + span} ${y + depth - r} L ${x + span} ${y}`;
  }
  return `M ${x - span} ${y} L ${x - span} ${y - depth + r} Q ${x - span} ${y - depth} ${x - span + r} ${y - depth} L ${x + span - r} ${y - depth} Q ${x + span} ${y - depth} ${x + span} ${y - depth + r} L ${x + span} ${y}`;
}

interface ComputedBracket {
  id: string;
  x: number;
  y: number;
  edge: Edge;
  stakeholder: 'cafe' | 'supplier' | 'brand' | 'neutral';
  curvePath: string;
  dot1: [number, number];
  dot2: [number, number];
  dot3: [number, number];
}

interface PulseEffect {
  id: string;
  x: number;
  y: number;
  color: string;
}

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
      dot1: [number, number];
      dot2: [number, number];
      junction?: [number, number];
      secondary?: boolean;
    }[]
  >([]);

  const [brackets, setBrackets] = useState<ComputedBracket[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [inView, setInView] = useState(false);

  // Active hover states
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredStakeholder, setHoveredStakeholder] = useState<'cafe' | 'supplier' | 'brand' | 'grabbit' | null>(null);
  const [grabbitHovered, setGrabbitHovered] = useState(false);

  // Central Grabbit Processing State ('cafe' | 'supplier' | 'brand' | null)
  const [grabbitProcessing, setGrabbitProcessing] = useState<'cafe' | 'supplier' | 'brand' | null>(null);

  // Active ports flashing
  const [activePorts, setActivePorts] = useState<Record<string, boolean>>({});

  // Dynamic live signal counter (starts 2633, increments subtly every ~22s)
  const [signalCount, setSignalCount] = useState(2633);

  // Micro-data live metrics (animating on signal arrival)
  const [cafeOrdersCount, setCafeOrdersCount] = useState(38);
  const [supplierOrdersCount, setSupplierOrdersCount] = useState(38);
  const [inventoryCount, setInventoryCount] = useState(1240);
  const [brandRepeatCount, setBrandRepeatCount] = useState(31);

  // Active signal packet travelling
  const [activePacket, setActivePacket] = useState<{
    link: string;
    color: string;
    progress: number;
  } | null>(null);
  const [activeLinkId, setActiveLinkId] = useState<string | null>(null);

  // Arrival pulse rings
  const [arrivalPulses, setArrivalPulses] = useState<PulseEffect[]>([]);

  const pathEls = useRef<Record<string, SVGPathElement | null>>({});

  // Live counter timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSignalCount((c) => (c >= 2635 ? 2633 : c + 1));
    }, 22000);
    return () => clearInterval(timer);
  }, []);

  // Route paths and compute 3-dot brackets dynamically
  const route = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const sr = stage.getBoundingClientRect();
    setSize({ w: sr.width, h: sr.height });

    if (sr.width < 768) {
      setPaths([]);
      setBrackets([]);
      return;
    }

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

    // 1. Build Paths
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

      const d = createOrthogonalPath(x1, y1, x2, y2, link.startDir, link.midSplit ?? 0.5, 14);

      const jx = link.startDir === 'h' ? x1 + (x2 - x1) * (link.midSplit ?? 0.5) : x1;
      const jy = link.startDir === 'v' ? y1 + (y2 - y1) * (link.midSplit ?? 0.5) : y2;

      outPaths.push({
        id: link.id,
        d,
        stakeholder: link.stakeholder,
        color: link.color,
        dot1: [x1, y1],
        dot2: [x2, y2],
        junction: Math.abs(x1 - x2) > 20 && Math.abs(y1 - y2) > 20 ? [jx, jy] : undefined,
        secondary: link.secondary,
      });
    }
    setPaths(outPaths);

    // 2. Build 3-Dot Brackets (Attio-style card port sockets)
    const outBrackets: ComputedBracket[] = [];
    const span = 12;
    const depth = 9;

    for (const bConf of BRACKET_PORT_CONFIGS) {
      const pos = rect(bConf.id);
      if (!pos) continue;

      let x = pos.cx;
      let y = pos.cy;

      if (bConf.edge === 'r') x = pos.r;
      else if (bConf.edge === 'l') x = pos.l;
      else if (bConf.edge === 't') y = pos.t;
      else if (bConf.edge === 'b') y = pos.b;

      const curvePath = createBracketCurve(x, y, bConf.edge, span, depth, 5);

      let dot1: [number, number];
      let dot2: [number, number] = [x, y];
      let dot3: [number, number];

      if (bConf.edge === 'r' || bConf.edge === 'l') {
        dot1 = [x, y - span];
        dot3 = [x, y + span];
      } else {
        dot1 = [x - span, y];
        dot3 = [x + span, y];
      }

      outBrackets.push({
        id: bConf.id,
        x,
        y,
        edge: bConf.edge,
        stakeholder: bConf.stakeholder,
        curvePath,
        dot1,
        dot2,
        dot3,
      });
    }
    setBrackets(outBrackets);
  }, []);

  const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsoLayoutEffect(() => {
    route();
    const ro = new ResizeObserver(() => route());
    if (stageRef.current) ro.observe(stageRef.current);
    const t = setTimeout(route, 200);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [route]);

  useEffect(() => {
    const n = stageRef.current;
    if (!n) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: '100px',
    });
    io.observe(n);
    return () => io.disconnect();
  }, []);

  // Flash active port bracket
  const flashPort = useCallback((portId: string) => {
    setActivePorts((prev) => ({ ...prev, [portId]: true }));
    setTimeout(() => {
      setActivePorts((prev) => {
        const next = { ...prev };
        delete next[portId];
        return next;
      });
    }, 450);
  }, []);

  // Trigger DOM border light and arrival pulse
  const triggerNodeArrival = useCallback((nodeId: string, color: string, arrivingPort?: string) => {
    if (arrivingPort) flashPort(arrivingPort);

    const el = els.current[nodeId];
    if (el) {
      el.classList.remove('pulse');
      void el.offsetWidth;
      el.classList.add('pulse');

      const stage = stageRef.current;
      if (stage) {
        const sr = stage.getBoundingClientRect();
        const b = el.getBoundingClientRect();
        const pulseX = b.left - sr.left + b.width / 2;
        const pulseY = b.top - sr.top + b.height / 2;

        const pulseId = `pulse-${Date.now()}-${Math.random()}`;
        setArrivalPulses((prev) => [...prev, { id: pulseId, x: pulseX, y: pulseY, color }]);
        setTimeout(() => {
          setArrivalPulses((prev) => prev.filter((p) => p.id !== pulseId));
        }, 700);
      }
    }
  }, [flashPort]);

  // ─── SEQUENTIAL ANIMATION & GRABBIT NETWORK ROUTER PIPELINE ───
  useEffect(() => {
    if (!inView || paths.length === 0) return;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let raf = 0;
    let lastTime = performance.now();
    let currentStepIndex = 0;
    let nextStepTime = performance.now() + 1000;

    const PIPELINE_STEPS = [
      // ── Sequence A (Café -> Grabbit) ──
      {
        link: 'link-cafe-orders',
        color: COLOR_CAFE,
        duration: 0.9,
        departPort: 'port-cafe-r',
        arrivePort: 'port-orders-l',
        onArrive: () => {
          triggerNodeArrival('node-orders', COLOR_CAFE, 'port-orders-l');
          setCafeOrdersCount(39);
          setTimeout(() => setCafeOrdersCount(38), 1400);
        },
      },
      {
        link: 'link-orders-demand',
        color: COLOR_CAFE,
        duration: 0.85,
        departPort: 'port-orders-b',
        arrivePort: 'port-demand-t',
        onArrive: () => {
          triggerNodeArrival('node-demand', COLOR_CAFE, 'port-demand-t');
        },
      },
      {
        link: 'link-demand-grabbit',
        color: COLOR_CAFE,
        duration: 1.0,
        departPort: 'port-demand-b',
        arrivePort: 'port-grabbit-t',
        onArrive: () => {
          // Packet enters Grabbit -> Processing state
          triggerNodeArrival('node-grabbit', COLOR_CAFE, 'port-grabbit-t');
          setGrabbitProcessing('cafe');
          setTimeout(() => {
            setGrabbitProcessing(null);
          }, 450);
        },
      },

      // ── Sequence B (Grabbit -> Supplier) ──
      {
        link: 'link-grabbit-routing',
        color: COLOR_SUPPLIER,
        duration: 0.9,
        departPort: 'port-grabbit-l',
        arrivePort: 'port-routing-r',
        onArrive: () => {
          triggerNodeArrival('node-routing', COLOR_SUPPLIER, 'port-routing-r');
        },
      },
      {
        link: 'link-routing-supplier',
        color: COLOR_SUPPLIER,
        duration: 0.95,
        departPort: 'port-routing-b',
        arrivePort: 'port-supplier-t',
        onArrive: () => {
          triggerNodeArrival('node-supplier', COLOR_SUPPLIER);
          setSupplierOrdersCount(39);
          setTimeout(() => setSupplierOrdersCount(38), 1400);
        },
      },
      {
        link: 'link-supplier-fulfillment',
        color: COLOR_SUPPLIER,
        duration: 0.9,
        departPort: 'port-supplier-l',
        arrivePort: 'port-fulfillment-b',
        onArrive: () => {
          triggerNodeArrival('node-fulfillment', COLOR_SUPPLIER);
        },
      },
      {
        link: 'link-fulfillment-inventory',
        color: COLOR_SUPPLIER,
        duration: 0.85,
        departPort: 'port-fulfillment-t',
        arrivePort: 'port-inventory-b',
        onArrive: () => {
          triggerNodeArrival('node-inventory', COLOR_SUPPLIER);
          setInventoryCount(1239);
          setTimeout(() => setInventoryCount(1240), 1600);
        },
      },
      {
        link: 'link-supplier-dispatch',
        color: COLOR_SUPPLIER,
        duration: 0.9,
        departPort: 'port-supplier-r',
        arrivePort: 'port-dispatch-l',
        onArrive: () => {
          triggerNodeArrival('node-dispatch', COLOR_SUPPLIER, 'port-dispatch-l');
          // Dispatch signal reaches downstream -> Grabbit transforms to Brand insight
          setTimeout(() => {
            flashPort('port-grabbit-l');
            setGrabbitProcessing('supplier');
            setTimeout(() => setGrabbitProcessing(null), 450);
          }, 300);
        },
      },

      // ── Sequence C (Grabbit -> Brand) ──
      {
        link: 'link-grabbit-signals',
        color: COLOR_BRAND,
        duration: 0.9,
        departPort: 'port-grabbit-r',
        arrivePort: 'port-signals-l',
        onArrive: () => {
          triggerNodeArrival('node-signals', COLOR_BRAND, 'port-signals-l');
        },
      },
      {
        link: 'link-signals-brand',
        color: COLOR_BRAND,
        duration: 0.95,
        departPort: 'port-signals-b',
        arrivePort: 'port-brand-t',
        onArrive: () => {
          triggerNodeArrival('node-brand', COLOR_BRAND);
        },
      },
      {
        link: 'link-brand-repeat',
        color: COLOR_BRAND,
        duration: 0.9,
        departPort: 'port-brand-r',
        arrivePort: 'port-repeat-b',
        onArrive: () => {
          triggerNodeArrival('node-repeat', COLOR_BRAND);
          setBrandRepeatCount(32);
          setTimeout(() => setBrandRepeatCount(31), 1400);
        },
      },
      {
        link: 'link-repeat-adoption',
        color: COLOR_BRAND,
        duration: 0.85,
        departPort: 'port-repeat-t',
        arrivePort: 'port-adoption-b',
        onArrive: () => {
          triggerNodeArrival('node-adoption', COLOR_BRAND);
        },
      },
      {
        link: 'link-brand-gmv',
        color: COLOR_BRAND,
        duration: 0.9,
        departPort: 'port-brand-l',
        arrivePort: 'port-gmv-r',
        onArrive: () => {
          triggerNodeArrival('node-gmv', COLOR_BRAND, 'port-gmv-r');
        },
      },
      {
        link: 'link-gmv-grabbit',
        color: COLOR_BRAND,
        duration: 0.95,
        departPort: 'port-gmv-t',
        arrivePort: 'port-grabbit-b',
        onArrive: () => {
          triggerNodeArrival('node-grabbit', COLOR_BRAND, 'port-grabbit-b');
          setGrabbitProcessing('brand');
          setSignalCount((c) => c + 1);
          setTimeout(() => setGrabbitProcessing(null), 450);
        },
      },
    ];

    let currentProgress = 0;
    let isRunning = false;

    const frame = (now: number) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      if (!isRunning && now >= nextStepTime) {
        isRunning = true;
        currentProgress = 0;
        const currentStep = PIPELINE_STEPS[currentStepIndex];
        setActiveLinkId(currentStep.link);
        if (currentStep.departPort) flashPort(currentStep.departPort);
      }

      if (isRunning) {
        const step = PIPELINE_STEPS[currentStepIndex];
        currentProgress += dt / step.duration;

        if (currentProgress >= 1) {
          step.onArrive();
          isRunning = false;
          setActivePacket(null);
          setActiveLinkId(null);

          const wasSequenceEnd =
            currentStepIndex === 2 || currentStepIndex === 7 || currentStepIndex === 12;

          currentStepIndex = (currentStepIndex + 1) % PIPELINE_STEPS.length;
          const pause = wasSequenceEnd ? 2400 + Math.random() * 1200 : 350;
          nextStepTime = now + pause;
        } else {
          setActivePacket({
            link: step.link,
            color: step.color,
            progress: currentProgress,
          });
        }
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView, paths, triggerNodeArrival, flashPort]);

  // Compute live SVG packet coordinates
  let packetElement = null;
  if (activePacket) {
    const pathEl = pathEls.current[activePacket.link];
    if (pathEl) {
      const totalLen = pathEl.getTotalLength();
      const pt = pathEl.getPointAtLength(activePacket.progress * totalLen);
      // Briefly increase to 5.5px at the central chip
      const isNearHub = activePacket.link.includes('grabbit') && (activePacket.progress > 0.8 || activePacket.progress < 0.2);
      const rSize = isNearHub ? 5.2 : 4.2;

      packetElement = (
        <g transform={`translate(${pt.x}, ${pt.y})`} className="att-packet-group">
          <circle r={rSize} fill={activePacket.color} className="att-packet-core" />
          <circle r={rSize * 1.8} fill={activePacket.color} opacity="0.25" className="att-packet-glow" />
        </g>
      );
    }
  }

  // Hover triggers for secondary and primary cards
  const handleCardHover = (nodeId: string, stakeholder: 'cafe' | 'supplier' | 'brand' | 'grabbit') => {
    setHoveredNode(nodeId);
    setHoveredStakeholder(stakeholder);

    const targetLink = GRAPH_LINKS.find((l) => l.from.includes(nodeId) || l.to.includes(nodeId));
    if (targetLink) setActiveLinkId(targetLink.id);
  };

  const handleCardLeave = () => {
    setHoveredNode(null);
    setHoveredStakeholder(null);
    if (!activePacket) setActiveLinkId(null);
  };

  // Hover Grabbit chip interaction
  const handleGrabbitMouseEnter = () => {
    setGrabbitHovered(true);
    setHoveredStakeholder('grabbit');
    setHoveredNode('grabbit');
  };

  const handleGrabbitMouseLeave = () => {
    setGrabbitHovered(false);
    handleCardLeave();
  };

  const getStakeholderColor = (sh: string) => {
    if (sh === 'cafe') return COLOR_CAFE;
    if (sh === 'supplier') return COLOR_SUPPLIER;
    if (sh === 'brand') return COLOR_BRAND;
    return COLOR_NEUTRAL;
  };

  return (
    <section className="att-section" id="ecosystem" aria-labelledby="att-title">
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
        {/* SVG Orthogonal Relationship Wires & 3-Dot Brackets */}
        <svg className="att-wires" width={size.w} height={size.h} aria-hidden="true">
          {/* 1. Wire Paths */}
          {paths.map((p) => {
            const isActive = activeLinkId === p.id;
            const isHovered =
              hoveredStakeholder &&
              (hoveredStakeholder === p.stakeholder ||
                (hoveredStakeholder === 'grabbit' && p.id.includes('grabbit')));

            const strokeColor = isActive || isHovered ? p.color : COLOR_NEUTRAL;

            return (
              <g key={p.id}>
                <path
                  ref={(n) => {
                    pathEls.current[p.id] = n;
                  }}
                  className={`att-wire-path ${isActive || isHovered ? 'is-active' : ''} ${
                    p.secondary ? 'is-secondary' : ''
                  }`}
                  d={p.d}
                  stroke={strokeColor}
                />

                {/* Subtle Orthogonal Branch Junctions */}
                {p.junction && (
                  <circle
                    cx={p.junction[0]}
                    cy={p.junction[1]}
                    r="2.5"
                    className="att-wire-junction"
                  />
                )}
              </g>
            );
          })}

          {/* 2. Attio 3-Dot Connection Bracket Sockets */}
          {brackets.map((b) => {
            const isPortActive = activePorts[b.id];
            const isConnectedLinkActive =
              activeLinkId &&
              GRAPH_LINKS.find(
                (l) => l.id === activeLinkId && (l.from === b.id || l.to === b.id)
              );

            const isHovered =
              hoveredStakeholder &&
              (hoveredStakeholder === b.stakeholder ||
                (hoveredStakeholder === 'grabbit' && b.id.includes('grabbit')));

            const activeColor = getStakeholderColor(b.stakeholder);
            const isHighlighted = isPortActive || isConnectedLinkActive || isHovered;
            const bracketStroke = isHighlighted ? activeColor : '#CDC9BE';
            const midDotFill = isHighlighted ? activeColor : '#FFFFFF';

            return (
              <g key={b.id} className="att-bracket-socket-group">
                {/* Curved outer bracket wire */}
                <path
                  d={b.curvePath}
                  fill="none"
                  stroke={bracketStroke}
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="att-bracket-wire"
                />

                {/* Top Dot */}
                <circle
                  cx={b.dot1[0]}
                  cy={b.dot1[1]}
                  r="2.5"
                  fill="#FAF9F5"
                  stroke={bracketStroke}
                  strokeWidth="1.2"
                  className="att-bracket-dot"
                />

                {/* Middle Dot */}
                <circle
                  cx={b.dot2[0]}
                  cy={b.dot2[1]}
                  r={isHighlighted ? '3.2' : '2.5'}
                  fill={midDotFill}
                  stroke={bracketStroke}
                  strokeWidth="1.2"
                  className="att-bracket-dot is-mid"
                />

                {/* Bottom Dot */}
                <circle
                  cx={b.dot3[0]}
                  cy={b.dot3[1]}
                  r="2.5"
                  fill="#FAF9F5"
                  stroke={bracketStroke}
                  strokeWidth="1.2"
                  className="att-bracket-dot"
                />

                {/* Expanding Halo on Active Middle Dot */}
                {isPortActive && (
                  <circle
                    cx={b.dot2[0]}
                    cy={b.dot2[1]}
                    r="8"
                    fill="none"
                    stroke={activeColor}
                    strokeWidth="1.5"
                    className="att-bracket-halo"
                  />
                )}
              </g>
            );
          })}

          {/* 3. Traveling Signal Packet */}
          {packetElement}

          {/* 4. Expanding Arrival Pulse Rings */}
          {arrivalPulses.map((pulse) => (
            <circle
              key={pulse.id}
              cx={pulse.x}
              cy={pulse.y}
              r="22"
              fill="none"
              stroke={pulse.color}
              strokeWidth="2"
              className="att-arrival-pulse-ring"
            />
          ))}
        </svg>

        {/* ══════════════════════════════════════════════════════════════
            ZONE 1: CAFÉ & DEMAND CREATION (UPPER CANVAS)
        ══════════════════════════════════════════════════════════════ */}

        {/* 1. Primary Café Card (~260px) */}
        <div
          className={`att-card att-card-primary att-card-cafe ${
            hoveredStakeholder && hoveredStakeholder !== 'cafe' && hoveredStakeholder !== 'grabbit'
              ? 'is-dimmed'
              : ''
          }`}
          ref={reg('node-cafe')}
          onMouseEnter={() => handleCardHover('cafe', 'cafe')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-right" ref={reg('port-cafe-r')} />
          <div className="att-port-anchor is-bottom" ref={reg('port-cafe-b')} />

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
              <span className="att-attr-val font-semibold">{cafeOrdersCount}</span>
            </div>
          </div>

          <div className="att-card-footer">
            <span className="att-status-dot is-cafe" />
            <span className="att-footer-text">Live demand signals</span>
          </div>
        </div>

        {/* Secondary: Orders */}
        <div
          className={`att-card att-card-secondary att-node-orders ${
            hoveredStakeholder && hoveredStakeholder !== 'cafe' && hoveredStakeholder !== 'grabbit'
              ? 'is-dimmed'
              : ''
          }`}
          ref={reg('node-orders')}
          onMouseEnter={() => handleCardHover('orders', 'cafe')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-left" ref={reg('port-orders-l')} />
          <div className="att-port-anchor is-bottom" ref={reg('port-orders-b')} />
          <div className="att-port-anchor is-top" ref={reg('port-orders-t')} />

          <div className="att-sec-header">
            <span className="att-sec-label">ORDERS</span>
            <span className="att-sec-dot is-cafe" />
          </div>
          <span className="att-sec-metric">{cafeOrdersCount} active</span>
        </div>

        {/* Secondary: Demand */}
        <div
          className={`att-card att-card-secondary att-node-demand ${
            hoveredStakeholder && hoveredStakeholder !== 'cafe' && hoveredStakeholder !== 'grabbit'
              ? 'is-dimmed'
              : ''
          }`}
          ref={reg('node-demand')}
          onMouseEnter={() => handleCardHover('demand', 'cafe')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-top" ref={reg('port-demand-t')} />
          <div className="att-port-anchor is-bottom" ref={reg('port-demand-b')} />
          <div className="att-port-anchor is-right" ref={reg('port-demand-r')} />

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
          className={`att-grabbit-chip ${
            grabbitProcessing ? `is-processing is-processing-${grabbitProcessing}` : ''
          } ${grabbitHovered ? 'is-hovered' : ''}`}
          ref={reg('node-grabbit')}
          onMouseEnter={handleGrabbitMouseEnter}
          onMouseLeave={handleGrabbitMouseLeave}
        >
          {/* 4 Physical Orthogonal Connection Ports (Top, Bottom, Left, Right) */}
          <div
            className={`att-chip-port is-top ${activePorts['port-grabbit-t'] ? 'is-active is-cafe' : ''}`}
            ref={reg('port-grabbit-t')}
          >
            <span className="att-chip-port-core" />
          </div>
          <div
            className={`att-chip-port is-bottom ${activePorts['port-grabbit-b'] ? 'is-active is-brand' : ''}`}
            ref={reg('port-grabbit-b')}
          >
            <span className="att-chip-port-core" />
          </div>
          <div
            className={`att-chip-port is-left ${activePorts['port-grabbit-l'] ? 'is-active is-supplier' : ''}`}
            ref={reg('port-grabbit-l')}
          >
            <span className="att-chip-port-core" />
          </div>
          <div
            className={`att-chip-port is-right ${activePorts['port-grabbit-r'] ? 'is-active is-brand' : ''}`}
            ref={reg('port-grabbit-r')}
          >
            <span className="att-chip-port-core" />
          </div>

          {/* Internal Processing Ring Pulse (Section 21) */}
          {grabbitProcessing && (
            <span className={`att-chip-process-ring is-${grabbitProcessing}`} />
          )}

          <div className="att-chip-inner">
            {/* Minimal High-Precision Tripartite Network Engine Mark */}
            <div className="att-chip-mark-wrap">
              <svg viewBox="0 0 28 28" width="28" height="28" className="att-chip-mark" aria-hidden="true">
                {/* Café Red Arc (-138° to -42° across top) */}
                <path
                  d="M 7.68 8.31 A 8.5 8.5 0 0 1 20.32 8.31"
                  fill="none"
                  stroke={COLOR_CAFE}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  className={`att-mark-arc is-cafe ${grabbitProcessing === 'cafe' ? 'is-active' : ''}`}
                />
                {/* Brand Purple Arc (-18° to 78° down right side) */}
                <path
                  d="M 22.08 11.37 A 8.5 8.5 0 0 1 15.77 22.31"
                  fill="none"
                  stroke={COLOR_BRAND}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  className={`att-mark-arc is-brand ${grabbitProcessing === 'brand' ? 'is-active' : ''}`}
                />
                {/* Supplier Green Arc (102° to 198° down left side) */}
                <path
                  d="M 12.23 22.31 A 8.5 8.5 0 0 1 5.92 11.37"
                  fill="none"
                  stroke={COLOR_SUPPLIER}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  className={`att-mark-arc is-supplier ${grabbitProcessing === 'supplier' ? 'is-active' : ''}`}
                />
                {/* Precision Outer Optical Bezel */}
                <circle
                  cx="14"
                  cy="14"
                  r="2.8"
                  fill="#FFFFFF"
                  stroke="#CDC9BE"
                  strokeWidth="1.1"
                />
                {/* Dynamic Central Lens Dot */}
                <circle
                  cx="14"
                  cy="14"
                  r="1.3"
                  fill="#8A867B"
                  className={`att-mark-core-lens ${
                    grabbitProcessing ? `is-active is-active-${grabbitProcessing}` : ''
                  }`}
                />
              </svg>
            </div>

            {/* Hairline Structural Divider */}
            <div className="att-chip-divider" />

            {/* Content (Editorial Hardware/Software Hierarchy) */}
            <div className="att-chip-body">
              <div className="att-chip-primary-line">
                <span className="att-chip-brand">grabbit</span>
                <div className="att-chip-signals-badge">
                  <span className={`att-chip-status-dot ${grabbitProcessing ? 'is-pulsing' : ''}`} />
                  <span className="att-chip-signals">{signalCount.toLocaleString()} signals</span>
                </div>
              </div>
              <div className="att-chip-routing-track">
                <span
                  className={`att-chip-track-node is-cafe ${
                    grabbitProcessing === 'cafe' ? 'is-active' : ''
                  }`}
                >
                  CAFÉ
                </span>
                <span className="att-chip-track-arrow">→</span>
                <span
                  className={`att-chip-track-node is-supplier ${
                    grabbitProcessing === 'supplier' ? 'is-active' : ''
                  }`}
                >
                  SUPPLIER
                </span>
                <span className="att-chip-track-arrow">→</span>
                <span
                  className={`att-chip-track-node is-brand ${
                    grabbitProcessing === 'brand' ? 'is-active' : ''
                  }`}
                >
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
          className={`att-card att-card-secondary att-node-routing ${
            hoveredStakeholder &&
            hoveredStakeholder !== 'supplier' &&
            hoveredStakeholder !== 'grabbit'
              ? 'is-dimmed'
              : ''
          }`}
          ref={reg('node-routing')}
          onMouseEnter={() => handleCardHover('routing', 'supplier')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-right" ref={reg('port-routing-r')} />
          <div className="att-port-anchor is-bottom" ref={reg('port-routing-b')} />

          <div className="att-sec-header">
            <span className="att-sec-label">ORDER ROUTING</span>
            <span className="att-sec-dot is-supplier" />
          </div>
          <span className="att-sec-metric">{supplierOrdersCount} today</span>
        </div>

        {/* Secondary: Inventory */}
        <div
          className={`att-card att-card-secondary att-node-inventory ${
            hoveredStakeholder &&
            hoveredStakeholder !== 'supplier' &&
            hoveredStakeholder !== 'grabbit'
              ? 'is-dimmed'
              : ''
          }`}
          ref={reg('node-inventory')}
          onMouseEnter={() => handleCardHover('inventory', 'supplier')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-bottom" ref={reg('port-inventory-b')} />

          <div className="att-sec-header">
            <span className="att-sec-label">INVENTORY</span>
            <span className="att-sec-dot is-supplier" />
          </div>
          <span className="att-sec-metric">{inventoryCount.toLocaleString()} SKUs</span>
        </div>

        {/* Secondary: Fulfillment */}
        <div
          className={`att-card att-card-secondary att-node-fulfillment ${
            hoveredStakeholder &&
            hoveredStakeholder !== 'supplier' &&
            hoveredStakeholder !== 'grabbit'
              ? 'is-dimmed'
              : ''
          }`}
          ref={reg('node-fulfillment')}
          onMouseEnter={() => handleCardHover('fulfillment', 'supplier')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-bottom" ref={reg('port-fulfillment-b')} />
          <div className="att-port-anchor is-top" ref={reg('port-fulfillment-t')} />

          <div className="att-sec-header">
            <span className="att-sec-label">FULFILLMENT</span>
            <span className="att-sec-dot is-supplier" />
          </div>
          <span className="att-sec-metric">98.8% SLA</span>
        </div>

        {/* 2. Primary Supplier Card (~260px) */}
        <div
          className={`att-card att-card-primary att-card-supplier ${
            hoveredStakeholder &&
            hoveredStakeholder !== 'supplier' &&
            hoveredStakeholder !== 'grabbit'
              ? 'is-dimmed'
              : ''
          }`}
          ref={reg('node-supplier')}
          onMouseEnter={() => handleCardHover('supplier', 'supplier')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-top" ref={reg('port-supplier-t')} />
          <div className="att-port-anchor is-left" ref={reg('port-supplier-l')} />
          <div className="att-port-anchor is-right" ref={reg('port-supplier-r')} />

          <div className="att-card-header">
            <div className="att-card-header-left">
              <div className="att-card-icon-wrap is-supplier">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
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
              <span className="att-attr-val font-semibold">{supplierOrdersCount} today</span>
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
          className={`att-card att-card-secondary att-node-dispatch ${
            hoveredStakeholder &&
            hoveredStakeholder !== 'supplier' &&
            hoveredStakeholder !== 'grabbit'
              ? 'is-dimmed'
              : ''
          }`}
          ref={reg('node-dispatch')}
          onMouseEnter={() => handleCardHover('dispatch', 'supplier')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-left" ref={reg('port-dispatch-l')} />
          <div className="att-port-anchor is-right" ref={reg('port-dispatch-r')} />

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
          className={`att-card att-card-secondary att-node-signals ${
            hoveredStakeholder &&
            hoveredStakeholder !== 'brand' &&
            hoveredStakeholder !== 'grabbit'
              ? 'is-dimmed'
              : ''
          }`}
          ref={reg('node-signals')}
          onMouseEnter={() => handleCardHover('signals', 'brand')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-left" ref={reg('port-signals-l')} />
          <div className="att-port-anchor is-bottom" ref={reg('port-signals-b')} />
          <div className="att-port-anchor is-top" ref={reg('port-signals-t')} />

          <div className="att-sec-header">
            <span className="att-sec-label">DEMAND SIGNALS</span>
            <span className="att-sec-dot is-brand" />
          </div>
          <span className="att-sec-metric">125 cafés</span>
        </div>

        {/* Secondary: Adoption */}
        <div
          className={`att-card att-card-secondary att-node-adoption ${
            hoveredStakeholder &&
            hoveredStakeholder !== 'brand' &&
            hoveredStakeholder !== 'grabbit'
              ? 'is-dimmed'
              : ''
          }`}
          ref={reg('node-adoption')}
          onMouseEnter={() => handleCardHover('adoption', 'brand')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-bottom" ref={reg('port-adoption-b')} />

          <div className="att-sec-header">
            <span className="att-sec-label">ADOPTION</span>
            <span className="att-sec-dot is-brand" />
          </div>
          <span className="att-sec-metric">85 verified</span>
        </div>

        {/* Secondary: Repeat Orders */}
        <div
          className={`att-card att-card-secondary att-node-repeat ${
            hoveredStakeholder &&
            hoveredStakeholder !== 'brand' &&
            hoveredStakeholder !== 'grabbit'
              ? 'is-dimmed'
              : ''
          }`}
          ref={reg('node-repeat')}
          onMouseEnter={() => handleCardHover('repeat', 'brand')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-bottom" ref={reg('port-repeat-b')} />
          <div className="att-port-anchor is-top" ref={reg('port-repeat-t')} />

          <div className="att-sec-header">
            <span className="att-sec-label">REPEAT ORDERS</span>
            <span className="att-sec-dot is-brand" />
          </div>
          <span className="att-sec-metric">{brandRepeatCount} POs</span>
        </div>

        {/* 3. Primary Brand Card (~260px) */}
        <div
          className={`att-card att-card-primary att-card-brand ${
            hoveredStakeholder &&
            hoveredStakeholder !== 'brand' &&
            hoveredStakeholder !== 'grabbit'
              ? 'is-dimmed'
              : ''
          }`}
          ref={reg('node-brand')}
          onMouseEnter={() => handleCardHover('brand', 'brand')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-top" ref={reg('port-brand-t')} />
          <div className="att-port-anchor is-right" ref={reg('port-brand-r')} />
          <div className="att-port-anchor is-left" ref={reg('port-brand-l')} />

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
              <span className="att-attr-val">{brandRepeatCount}</span>
            </div>
            <div className="att-attr-row">
              <span className="att-attr-label">Projected GMV</span>
              <span className="att-attr-val">₹6.4L</span>
            </div>
          </div>

          <div className="att-card-footer">
            <span className="att-status-dot is-brand" />
            <span className="att-footer-text">Adoption + demand insights</span>
          </div>
        </div>

        {/* Secondary: Projected GMV */}
        <div
          className={`att-card att-card-secondary att-node-gmv ${
            hoveredStakeholder &&
            hoveredStakeholder !== 'brand' &&
            hoveredStakeholder !== 'grabbit'
              ? 'is-dimmed'
              : ''
          }`}
          ref={reg('node-gmv')}
          onMouseEnter={() => handleCardHover('gmv', 'brand')}
          onMouseLeave={handleCardLeave}
        >
          <div className="att-port-anchor is-top" ref={reg('port-gmv-t')} />
          <div className="att-port-anchor is-right" ref={reg('port-gmv-r')} />
          <div className="att-port-anchor is-left" ref={reg('port-gmv-l')} />

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
