// Canvas engine for the India globe (IndiaGlobe.tsx). Plain Canvas 2D, no three.js:
// High-density chromatic Fibonacci dot field masked to land, centered with India prominently
// focused, featuring delicate, slow-flowing energy streams and real-time trade signals.
// Inspired by Attio typography and BVNK / Stripe white-background point-cloud globe.

export type Side = 'cafe' | 'supply' | 'brand' | 'origin' | 'core';
export type GlobeNode = {
  name: string;
  at: [number, number];
  side: Side;
  metric?: string;
  subtitle?: string;
};


export const SIDE_COLOR: Record<Side, string> = {
  core: '#6366F1',
  cafe: '#F43F5E',
  supply: '#10B981',
  brand: '#8B5CF6',
  origin: '#F59E0B',
};

export const CORE: GlobeNode = {
  name: 'Delhi NCR',
  at: [28.61, 77.21],
  side: 'core',
  metric: 'National Routing Engine',
  subtitle: 'Gradient 365 core dispatch and settlement hub',
};

export const NODES: GlobeNode[] = ([
  // Major Indian Café & Commercial Hubs
  ['Mumbai', 19.08, 72.88, 'cafe', '412 Pickups Synced', 'Primary Roaster & High-Street Corridor'],
  ['Bengaluru', 12.97, 77.59, 'cafe', '1,240 SKUs Live', 'Specialty Café & Tech Capital Hub'],
  ['Hyderabad', 17.39, 78.49, 'brand', '320 Outlets Synced', 'Micro-Roaster & Fast-Growth Corridor'],
  ['Kolkata', 22.57, 88.36, 'cafe', '180 Cafés Active', 'Eastern Gateway & Heritage Coffee Trade'],
  ['Chennai', 13.08, 80.27, 'supply', 'Port & Coastal Roasters', 'Green Bean Import & Roastery Logistics'],
  ['Pune', 18.52, 73.86, 'brand', '94 Outlets Synced', 'Artisanal Roaster & Trial Corridor'],
  ['Ahmedabad', 23.02, 72.57, 'supply', 'Bulk Distribution Hub', 'FMCG Dairy, Syrups & Packaging Depot'],
  ['Kochi', 9.93, 76.27, 'supply', 'Malabar Port Hub', 'Monsooned Malabar Export & Processing'],
  ['Jaipur', 26.91, 75.79, 'cafe', '65 Cafés Connected', 'Specialty Tourism & Café Network'],
  ['Chandigarh', 30.73, 76.78, 'cafe', '110 Cafés Connected', 'North Tier Flagship Network'],
  ['Goa', 15.49, 73.83, 'brand', '84 Hospitality Venues', 'Boutique Café & Roaster Hub'],
  ['Indore', 22.72, 75.86, 'supply', 'Central Depot', 'Central India Transit & Roaster Supply'],
  ['Guwahati', 26.14, 91.74, 'supply', 'NE Gateway', 'Organic Tea & Shade-Grown Arabica Depot'],
  ['Coimbatore', 11.02, 76.96, 'supply', 'Machinery Depot', 'Espresso Machines & Grinder Tech Hub'],
  ['Lucknow', 26.85, 80.95, 'brand', '45 Outlets Connected', 'Awadh Specialty Café Corridor'],

  // Iconic Indian Coffee Origins (Agricultural Heartlands)
  ['Chikmagalur', 13.32, 75.77, 'origin', 'Birthplace of Indian Coffee', 'Western Ghats Single Origin Arabica Farms'],
  ['Coorg', 12.33, 75.80, 'origin', 'Coffee Bowl of India', 'High-Elevation Shade-Grown Estate Batches'],
  ['Araku Valley', 18.33, 82.88, 'origin', 'Specialty Micro-Lots', 'Award-Winning Organic Tribal Specialty Coffee'],

  // International Specialty Origins (Global trade lines feeding India)
  ['Dubai', 25.20, 55.27, 'supply', 'Transit Gateway', 'Roasting Logistics & MENA Trade Route'],
  ['Singapore', 1.35, 103.82, 'brand', 'APAC Roaster Hub', 'Specialty Packaging & Equipment Hub'],
  ['Addis Ababa', 9.03, 38.74, 'origin', 'Yirgacheffe Origin', 'Ethiopian Washed & Natural Heirloom Imports'],
  ['Bogotá', 4.71, -74.07, 'origin', 'Supremo Origin', 'Colombian Specialty Green Bean Imports'],
] as const).map(([name, lat, lon, side, metric, subtitle]) => ({
  name,
  at: [lat, lon],
  side: side as Side,
  metric,
  subtitle,
}));

export const kmBetween = (a: [number, number], b: [number, number]) => {
  const r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
  return Math.round(12742 * Math.asin(Math.sqrt(h)));
};

function ramp(stops: string[], n = 64) {
  const c = stops.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
  return Array.from({ length: n }, (_, i) => {
    const t = (i / (n - 1)) * (c.length - 1), k = Math.min(c.length - 2, Math.floor(t)), f = t - k;
    return `rgb(${c[k].map((v, j) => Math.round(v + (c[k + 1][j] - v) * f)).join(',')})`;
  });
}

type V3 = [number, number, number];
type Route = {
  node: GlobeNode;
  v: V3;
  pts: V3[];
  dur: number;
  start: number;
  next: number;
  launch: number;
  sx: number;
  sy: number;
  vis: boolean;
};

type Opts = {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  mask: Uint8Array;
  onFocus: (n: GlobeNode | null) => void;
  onLive: (live: boolean) => void;
};

// Pure, pristine white aesthetic with chromatic iridescent point-cloud and glowing comets
const THEME = {
  bg: '#FFFFFF',
  world: '#A8B2DC',
  // Rich iridescent chromatic palette from South (warm rose/amber) to North (deep violet/indigo)
  india: ramp([
    '#4F46E5', // Royal Indigo (North / Himalayas)
    '#7C3AED', // Electric Violet
    '#9333EA', // Purple
    '#C026D3', // Fuchsia
    '#E11D48', // Crimson Rose
    '#F43F5E', // Coral Rose
    '#FB7185', // Peach
    '#F59E0B', // Sunset Amber (South)
  ], 64),
  track: 'rgba(99, 102, 241, 0.14)',
  trackLit: 'rgba(244, 63, 94, 0.32)',
  glow: '129, 140, 248',
  glowA: 0.16,
  hubFill: '#FFFFFF',
  core: '#4F46E5',
  head: '#FFFFFF',
  ringA: 0.85,
  label: 'rgba(17, 24, 39, 0.92)',
  lens: '99, 102, 241',
  side: {
    core: '#6366F1',
    cafe: '#F43F5E',
    supply: '#10B981',
    brand: '#8B5CF6',
    origin: '#F59E0B',
  } as Record<Side, string>,
  coreGlow: '#6366F1',
};

const D = Math.PI / 180;
// Systematic half-globe: central meridian 78.5°E, viewing tilt -12.0° centers India symmetrically, z: 1.25 makes India 25% bigger
const HOME = { lon: 78.5, lat: -12.0, z: 1.25 };

// Precomputed bitmask for India's high-definition borders
const INDIA_MASK = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwP8AAAAAAAAAAAAAAAAAAOD/BwAAAAAAAAAAAAAAAAD4/x8AAAAAAAAAAAAAAAAA/P//AAAAAAAAAAAAAAAAAP7//wMAAAAAAAAAAAAAAAD4////AQAAAAAAAAAAAAAA8P///w8AAAAAAAAAAAAAAOD///8fAAAAAAAAAAAAAACA////HwAAAAAAAAAAAAAAAP///w8AAAAAAAAAAAAAAAD+//8PAAAAAAAAAAAAAAAA/P//DwAAAAAAAAAAAAAAAPz//wcAAAAAAAAAAAAAAAD8//8HAAAAAAAAAAAAAAAA/P//AwAAAAAAAAAAAAAAAPj//wEAAAAAAAAAAAAAAADw//8BAAAAAAAAAAAAAAAA4P//AQAAAAAAAAAAAAAAAAD+PwAAAAAAAAAAAAAAAAAA/j8AAAAAAAAAAAAAAAAAwP9/AAAAAAAAAAAAAAAAAMD/fwAAAAAAAAAAAAAAAADA/38BAAAAAAAAAAAAAAAAwP//AQAAAAAAAAAAAAAAAOD//w8AAAAAAAAAAAAAAADw//8fAAAAAAAAAAAAAAAA8P//fwAAAAAAAAAAAAAAAPj//38AAAAAAAAAAAAAAAD+//8/AAAAAAAAAAAAAAAA/v//HwAAAAAAAAAAAAAAAP7//x8AAAAAAAAAGAAAAAD///8fAAAAAAAA4BwAAADA////DwAAAAAAAPA/AAAA4P///38AAAAAAAD+PwAAAOD/////AAAAAAAA/18AAADw/////wMAAAAAgP//AQBg/P////8HAABwAMD//wEA8P//////fwAAcAD8//8AAPj///////8/AHAA8P//AAD8////////fwBwAPD/DwAA/P////////8A4CDw/wcAAPj/////////B+D///8BAADg//////////+/////AAAA8P//////////H/r//wAAAOD//////////w/4//8AAACA//////////8/+P//AAAAgP//////////f/j/PwAAAID//////////z8A4H8AAAAA//////////8fAMB/AAAAAP//////////DwDgPwAAACD//////////z8A8B8AAID///////////9/APwfAADg////////////fwD+AQAAwP///////////z8A7gMAAMD///////////9/AOYDAACA/////////////wDkAQAAAO7///////////8AwAEAAADg////////////AMAAAAAA/f///////////wDAAQAAAP/f//////////8AwAAAAAD+z/////////+vAAAAAAAA/J//////////AwAAAAAAAPif/////////wAAAAAAAADwj////////38AAAAAAAAAwIP/////////AAAAAAAAAAAA/////////wAAAAAAAAAAgP///////38AAAAAAAAAAID///////8/AAAAAAAAAACA////////HwAAAAAAAAAAgP///////wMAAAAAAAAAAID///////8AAAAAAAAAAACA//////9/AAAAAAAAAAAAAP//////PwAAAAAAAAAAAAD//////z8AAAAAAAAAAAAA//////8fAAAAAAAAAAAAAP//////BwAAAAAAAAAAAAD//////wMAAAAAAAAAAAAA/v////8BAAAAAAAAAAAAAP7///9/AAAAAAAAAAAAAAD+////PwAAAAAAAAAAAAAA/v///x8AAAAAAAAAAAAAAP7///8fAAAAAAAAAAAAAAD+////BwAAAAAAAAAAAAAA/P///wEAAAAAAAAAAAAAAPz//78AAAAAAAAAAAAAAAD4//8fAAAAAAAAAAAAAAAA+P//HwAAAAAAAAAAAAAAAPD//w8AAAAAAAAAAAAAAADw//8PAAAAAAAAAAAAAAAA4P//HwAAAAAAAAAAAAAAAMD//x8AAAAAAAAAAAAAAADA//8fAAAAAAAAAAAAAAAAwP//HwAAAAAAAAAAAAAAAID//w8AAAAAAAAAAAAAAACA//8fAAAAAACAAAAAAAAAgP//HwAAAAAAgAAAAAAAAID//x8AAAAAAIAAAAAAAAAA//8fAAAAAACAAAAAAAAAAP//DwAAAAAAAAAAAAAAAAD+/w8AAAAAAAAAAAAAAAAA/P8HAAAAAABAAAAAAAAAAPz/BwAAAAAAQAAAAAAAAAD4/wcAAAAAAEAAAAAAAAAA+P8HAAAAAAAAAAAAAAAAAPD/BwAAAAAAAAAAAAAAAADw/wcAAAAAAAAAAAAAAAAA8P8HAAAAAAAAAAAAAAAAAOD/AQAAAAAAAAAAAAAAAADg/wEAAAAAAAAAAAAAAAAAwP8AAAAAAAAAAAAAAAAAAOD/AAAAAAAAAAAAAAAAAADAPwAAAAAAAAAAAAAAAAAAwB8AAAAAAAAAAAAAAAAAAIAfAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const IM_W = 128, IM_H = 132, IM_STEP = 0.25, IM_LAT = 38, IM_LON = 67;
// Gradient brand spectrum
const RING = ['#7F00FF', '#FF2E4D', '#22C55E', '#F59E0B'];
const vec = (lat: number, lon: number): V3 => [
  Math.cos(lat * D) * Math.sin(lon * D),
  Math.sin(lat * D),
  Math.cos(lat * D) * Math.cos(lon * D),
];
const visible = (p: number[]) => p[2] > 0 || p[0] * p[0] + p[1] * p[1] > 1;

// Rotator matrix: rotates unit vector so (lat0, lon0) faces the viewer directly
function rotator(lon0: number, lat0: number) {
  const cL = Math.cos(lon0 * D), sL = Math.sin(lon0 * D), ct = Math.cos(lat0 * D), st = Math.sin(lat0 * D);
  return (X: number, Y: number, Z: number, o: number[]) => {
    const x = X * cL - Z * sL, z = Z * cL + X * sL;
    o[0] = x;
    o[1] = Y * ct - z * st;
    o[2] = Y * st + z * ct;
  };
}

// Great-circle arc lifted off the surface to create graceful 3D flight paths
function arc(a: [number, number], b: [number, number], lift: number, n = 96): V3[] {
  const A = vec(...a), B = vec(...b);
  const w = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])), sw = Math.sin(w) || 1;
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, ka = Math.sin((1 - t) * w) / sw, kb = Math.sin(t * w) / sw;
    const h = 1 + lift * Math.sin(Math.PI * t);
    return [(A[0] * ka + B[0] * kb) * h, (A[1] * ka + B[1] * kb) * h, (A[2] * ka + B[2] * kb) * h];
  });
}

export function createIndiaGlobe({ root, canvas, mask, onFocus, onLive }: Opts) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { setLive: () => {}, recenter: () => {}, destroy: () => {} };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const land = (lat: number, lon: number) => {
    const i = ((Math.floor((lon + 180) * 2) % 720) + 720) % 720;
    const j = Math.min(359, Math.max(0, Math.floor((90 - lat) * 2)));
    const n = j * 720 + i;
    return (mask[n >> 3] >> (n & 7)) & 1;
  };

  const im = Uint8Array.from(atob(INDIA_MASK), (c) => c.charCodeAt(0));
  const imBit = (i: number, j: number) =>
    i < 0 || j < 0 || i >= IM_W || j >= IM_H ? 0 : (im[(j * IM_W + i) >> 3] >> ((j * IM_W + i) & 7)) & 1;
  const inIndia = (lat: number, lon: number) =>
    imBit(Math.floor((lon - IM_LON) / IM_STEP), Math.floor((IM_LAT - lat) / IM_STEP));
  const indiaWeight = (lat: number, lon: number) => {
    const i = Math.floor((lon - IM_LON) / IM_STEP), j = Math.floor((IM_LAT - lat) / IM_STEP);
    let n = 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) n += imBit(i + di, j + dj);
    return n / 9;
  };

  // Dense point-cloud generation
  const INDIA_CENTER = vec(21.8, 79.0);
  const dots: number[][] = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  const N = 160000;

  // Global land dots (delicate background field)
  for (let k = 0; k < N; k++) {
    const lat = Math.asin(1 - (2 * (k + 0.5)) / N) / D, lon = (((k * g) / D) % 360) - 180;
    if (!land(lat, lon) || inIndia(lat, lon)) continue;
    const v = vec(lat, lon);
    dots.push([v[0], v[1], v[2], 0.75 + ((k * 7919) % 100) / 100, 0, lat]);
  }

  // Systematic high-definition India dot matrix (geographically true, uniform hexagonal lattice)
  const LAT_STEP = 0.22;
  for (let row = 0, lat = 6.8; lat < 37.6; row++, lat += LAT_STEP) {
    const cosLat = Math.cos(lat * D);
    const lonStep = LAT_STEP / Math.max(0.1, cosLat);
    const lonStart = 67.0 + ((row % 2) * lonStep) / 2;
    for (let lon = lonStart; lon < 98.0; lon += lonStep) {
      if (!inIndia(lat, lon)) continue;
      const v = vec(lat, lon);
      dots.push([
        v[0],
        v[1],
        v[2],
        0.92 + (((row * 31 + lon * 97) | 0) % 100) / 100,
        0.70 + 0.30 * indiaWeight(lat, lon),
        lat,
      ]);
    }
  }

  const coreV = vec(...CORE.at);

  // Routes: Domestic hubs to Delhi NCR + origin links + international corridors
  const routes: Route[] = NODES.map((node) => {
    const at = node.at;
    const v = vec(...at);
    const ang = Math.acos(Math.min(1, v[0] * coreV[0] + v[1] * coreV[1] + v[2] * coreV[2]));
    const isIntl = node.at[0] <= 6 || node.at[0] >= 36 || node.at[1] <= 66 || node.at[1] >= 96;
    const lift = isIntl ? 0.08 + ang * 0.45 : 0.03 + ang * 0.40;
    const dur = 8.5 + ang * 18.0;
    return {
      node,
      v,
      pts: arc(at, CORE.at, lift, 120),
      dur,
      start: -1,
      next: -1,
      launch: -9,
      sx: 0,
      sy: 0,
      vis: false,
    };
  });

  const landings: { c: string; t: number }[] = [];
  const coreHit = { node: CORE, sx: 0, sy: 0, vis: false };

  // Pre-rendered sprites for buttery smooth 60fps rendering
  const sprites = new Map<string, HTMLCanvasElement>();
  const sprite = (key: string, paint: (g: CanvasRenderingContext2D) => void) => {
    let c = sprites.get(key);
    if (!c) {
      c = document.createElement('canvas');
      c.width = c.height = 36;
      paint(c.getContext('2d')!);
      sprites.set(key, c);
    }
    return c;
  };

  const dot = (color: string) =>
    sprite(`d${color}`, (g) => {
      const r = g.createRadialGradient(18, 18, 0, 18, 18, 18);
      r.addColorStop(0, color);
      r.addColorStop(0.65, color);
      r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r;
      g.beginPath();
      g.arc(18, 18, 18, 0, Math.PI * 2);
      g.fill();
    });

  const glow = (color: string) =>
    sprite(`g${color}`, (g) => {
      const r = g.createRadialGradient(18, 18, 0, 18, 18, 18);
      r.addColorStop(0, color);
      r.addColorStop(0.3, color + 'BB');
      r.addColorStop(0.7, color + '33');
      r.addColorStop(1, color + '00');
      g.fillStyle = r;
      g.fillRect(0, 0, 36, 36);
    });

  let W = 0, H = 0, DPR = 1, onScreen = false, live = false, raf = 0, intro = reduce ? 1 : 0, introAt = -1;
  const view = { ...HOME, lon: reduce ? HOME.lon : HOME.lon + 45 };
  const goal = { ...HOME };
  const spin = { lon: 0, lat: 0 };
  const mouse = { x: 0, y: 0, in: false, k: 0 };
  let drag: { x: number; y: number; moved: boolean; engage?: boolean } | null = null;
  let hover: GlobeNode | null = null, pinned: GlobeNode | null = null, shown: GlobeNode | null = null;
  let base = 1;

  const size = () => {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
  };

  const ro = new ResizeObserver(size);
  ro.observe(canvas);
  size();

  const io = new IntersectionObserver(
    ([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen && introAt < 0) introAt = performance.now();
    },
    { rootMargin: '100px' },
  );
  io.observe(root);

  const focus = () => {
    const n = pinned || hover;
    if (n !== shown) {
      shown = n;
      onFocus(n);
    }
  };

  const setLive = (on: boolean) => {
    if (live === on) return;
    live = on;
    onLive(on);
    if (on) root.setAttribute('data-lenis-prevent', '');
    else root.removeAttribute('data-lenis-prevent');
    if (!on) {
      pinned = null;
      Object.assign(goal, HOME);
      spin.lon = spin.lat = 0;
      focus();
    }
  };

  const recenter = () => {
    pinned = null;
    Object.assign(goal, HOME);
    spin.lon = spin.lat = 0;
    focus();
  };

  const flyTo = (n: GlobeNode) => {
    goal.lon = n.at[1];
    goal.lat = n.at[0];
    goal.z = Math.max(goal.z, 1.35);
  };

  const local = (e: PointerEvent | WheelEvent) => {
    const r = root.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };

  const nodeAt = (x: number, y: number) => {
    let best: GlobeNode | null = null, bd = 22;
    for (const r of [coreHit, ...routes]) {
      if (!r.vis) continue;
      const d = Math.hypot(r.sx - x, r.sy - y);
      if (d < bd) {
        bd = d;
        best = r.node;
      }
    }
    return best;
  };

  const overUI = (e: Event) => !!(e.target as HTMLElement).closest('button, a, [data-globe-ui]');

  const onMove = (e: PointerEvent) => {
    const [x, y] = local(e);
    mouse.x = x;
    mouse.y = y;
    mouse.in = e.pointerType === 'mouse';
    if (drag) {
      const dx = x - drag.x, dy = y - drag.y, k = 56.0 / (base * view.z);
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      if (!drag.engage) {
        goal.lon -= dx * k;
        goal.lat = Math.max(-34, Math.min(12, goal.lat + dy * k));
        spin.lon = -dx * k;
        spin.lat = dy * k;
      }
      drag.x = x;
      drag.y = y;
      return;
    }
    hover = overUI(e) ? null : nodeAt(x, y);
    root.classList.toggle('on-node', !!hover);
    focus();
  };

  const onLeave = () => {
    mouse.in = false;
    hover = null;
    root.classList.remove('on-node');
    focus();
  };

  const onDown = (e: PointerEvent) => {
    if (overUI(e)) return;
    const [x, y] = local(e);
    if (!live) {
      drag = { x, y, moved: false, engage: true };
      return;
    }
    drag = { x, y, moved: false };
    spin.lon = spin.lat = 0;
    root.setPointerCapture(e.pointerId);
    root.classList.add('dragging');
  };

  const onUp = (e: PointerEvent) => {
    if (!drag) return;
    const d = drag;
    drag = null;
    root.classList.remove('dragging');
    if (d.engage && d.moved) return;
    if (d.engage) setLive(true);
    else if (d.moved) return;
    pinned = nodeAt(...local(e));
    if (pinned) flyTo(pinned);
    focus();
  };

  const onCancel = () => {
    drag = null;
    root.classList.remove('dragging');
  };

  const onWheel = (e: WheelEvent) => {
    if (!live) return;
    e.preventDefault();
    goal.z = Math.max(0.75, Math.min(2.2, goal.z * Math.exp(-e.deltaY * 0.0014)));
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && live) {
      setLive(false);
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && !live && e.target === root) {
      e.preventDefault();
      setLive(true);
      return;
    }
    if (!live || !e.key.startsWith('Arrow')) return;
    e.preventDefault();
    const s = 3.6 / view.z;
    if (e.key === 'ArrowLeft') goal.lon -= s;
    if (e.key === 'ArrowRight') goal.lon += s;
    if (e.key === 'ArrowUp') goal.lat = Math.min(12, goal.lat + s);
    if (e.key === 'ArrowDown') goal.lat = Math.max(-34, goal.lat - s);
  };

  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerleave', onLeave);
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointerup', onUp);
  root.addEventListener('pointercancel', onCancel);
  root.addEventListener('wheel', onWheel, { passive: false });
  root.addEventListener('keydown', onKey);

  const P = [0, 0, 0];
  let last = performance.now();

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!onScreen || !W) return;

    const t = reduce ? 8 : now / 1000;
    if (!reduce && introAt >= 0) intro = Math.min(1, (now - introAt) / 2000);
    const fade = 1 - (1 - intro) ** 3;

    // Gentle ambient sway & cursor parallax
    if (!live && !reduce) {
      const lean = mouse.in ? 1 : 0;
      goal.lon = HOME.lon + Math.sin(t * 0.045) * 1.5 + lean * ((mouse.x / W - 0.5) * 3.5);
      goal.lat = HOME.lat - lean * ((mouse.y / H - 0.5) * 2.5);
    } else if (live && !drag && Math.abs(spin.lon) + Math.abs(spin.lat) > 0.001) {
      goal.lon += spin.lon;
      goal.lat = Math.max(-34, Math.min(12, goal.lat + spin.lat));
      spin.lon *= 0.94;
      spin.lat *= 0.94;
    }

    const ease = reduce ? 1 : drag ? 0.5 : intro < 1 ? 0.04 : 0.07;
    view.lon += (goal.lon - view.lon) * ease;
    view.lat += (goal.lat - view.lat) * ease;
    view.z += (goal.z - view.z) * 0.09;
    mouse.k += ((mouse.in && !drag ? 1 : 0) - mouse.k) * Math.min(1, dt * 7);

    const wide = W > 860;
    // Centered half globe composition: sphere center at the bottom horizon baseline
    const cx = W * 0.5;
    const cy = H - 1; // Horizon baseline anchored at the bottom edge

    // Radius: expansive half-dome filling vertical height
    base = wide ? Math.min(W * 0.46, H - 24) : Math.min(W * 0.52, H - 20);
    const Ry = base * view.z;
    // Natural horizontal dome stretch: elegant half dome while maintaining authentic, systematic India proportions
    const stretchX = wide ? 1.18 : 1.12;
    const Rx = Ry * stretchX;
    const rot = rotator(view.lon, view.lat);

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Upper hemisphere clipping: ensures clean cutoff at the horizon baseline
    ctx.save();
    ctx.beginPath();
    ctx.rect(-20, -20, W + 40, cy + 1);
    ctx.clip();

    // Soft celestial sphere volume & atmosphere (horizontally stretched half dome)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, Rx * 1.03, Ry * 1.03, 0, Math.PI, Math.PI * 2, false);
    const sphereGlow = ctx.createRadialGradient(cx, cy, Ry * 0.2, cx, cy, Ry * 1.04);
    sphereGlow.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    sphereGlow.addColorStop(0.65, 'rgba(246, 248, 255, 0.82)');
    sphereGlow.addColorStop(0.9, 'rgba(238, 242, 255, 0.35)');
    sphereGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sphereGlow;
    ctx.fill();
    ctx.restore();

    // Gradient brand spectrum upper celestial horizon arc (elliptical curve)
    const ringSpin = t * 0.04;
    const ringGrad = ctx.createConicGradient(ringSpin, cx, cy);
    [...RING, RING[0]].forEach((c, i) => ringGrad.addColorStop(i / 4, c));

    // Soft atmospheric halo over the dome
    ctx.save();
    ctx.globalAlpha = THEME.ringA * 0.28 * fade;
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 24;
    ctx.filter = 'blur(16px)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, Rx * 1.004, Ry * 1.004, 0, Math.PI, Math.PI * 2, false);
    ctx.stroke();
    ctx.restore();

    // Razor-sharp celestial horizon hairline
    ctx.save();
    ctx.globalAlpha = THEME.ringA * 0.74 * fade;
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Rx, Ry, 0, Math.PI, Math.PI * 2, false);
    ctx.stroke();
    ctx.restore();

    // Radiant soft light bloom over India
    rot(INDIA_CENTER[0], INDIA_CENTER[1], INDIA_CENTER[2], P);
    if (P[2] > 0) {
      const gx = cx + P[0] * Rx, gy = cy - P[1] * Ry, grX = Rx * 0.42, grY = Ry * 0.42;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(gx, gy, grX, grY, 0, 0, Math.PI * 2);
      const indiaGlow = ctx.createRadialGradient(gx, gy, 0, gx, gy, grY);
      indiaGlow.addColorStop(0, 'rgba(244, 63, 94, 0.20)');
      indiaGlow.addColorStop(0.5, 'rgba(124, 58, 237, 0.12)');
      indiaGlow.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = indiaGlow;
      ctx.fill();
      ctx.restore();
    }

    // Point cloud rendering (chromatic iridescent dots with systematic India lattice)
    const LR = 130, lk = mouse.k, mx = mouse.x, my = mouse.y, zs = Math.min(1.6, view.z);
    for (const p of dots) {
      rot(p[0], p[1], p[2], P);
      if (P[2] <= 0) continue;
      let sx = cx + P[0] * Rx, sy = cy - P[1] * Ry;
      if (sy < -8 || sy > cy + 2 || sx < -8 || sx > W + 8) continue;

      const rim = Math.pow(1 - P[2], 0.8);
      const ind = p[4];
      const lat = p[5];
      // Systematic India dots: crisp, uniform matrix
      let s = (ind > 0 ? 2.3 : 1.1) * zs;
      let boost = 0;

      if (lk > 0.01) {
        const dx = sx - mx, dy = sy - my, d = Math.hypot(dx, dy);
        if (d < LR) {
          const f = (1 - d / LR) ** 2 * lk;
          sx += dx * f * 0.35;
          sy += dy * f * 0.35;
          s *= 1 + f * 1.25;
          boost = f;
        }
      }

      const lit = ind > 0.05 || boost > 0.15;
      const shimmer = lit && !reduce ? 0.85 + 0.15 * Math.sin(t * 1.1 + p[3] * 37) : 1;
      ctx.globalAlpha = Math.min(1, ((ind > 0 ? 0.35 + 0.65 * ind * shimmer : 0.08 + 0.18 * rim) + boost * 0.55) * fade);

      // Chromatic India dot coloring: latitude gradient from South (amber/rose) to North (violet/indigo)
      let dotColor = THEME.world;
      if (lit) {
        // Map latitude 8°N - 36°N to index 0..63
        const latIdx = Math.max(0, Math.min(63, Math.round(((36 - lat) / 28) * 63 + boost * 10)));
        dotColor = THEME.india[latIdx] || THEME.india[32];
      }
      ctx.drawImage(dot(dotColor), sx - s / 2, sy - s / 2, s, s);
    }
    ctx.globalAlpha = 1;

    // Interactive soft lens under mouse
    if (lk > 0.01) {
      const lens = ctx.createRadialGradient(mx, my, 0, mx, my, LR);
      lens.addColorStop(0, `rgba(${THEME.lens}, ${0.12 * lk})`);
      lens.addColorStop(1, `rgba(${THEME.lens}, 0)`);
      ctx.fillStyle = lens;
      ctx.fillRect(mx - LR, my - LR, LR * 2, LR * 2);
    }

    // DELICATE, SLOW-FLOWING ENERGY STREAMS (featherweight, luminous, serene)
    const f = pinned || hover;
    const running = !reduce && intro >= 1;

    routes.forEach((r, i) => {
      const side = r.node.side as Side;
      const color = THEME.side[side] || THEME.side.cafe;
      rot(r.v[0], r.v[1], r.v[2], P);
      r.sx = cx + P[0] * Rx;
      r.sy = cy - P[1] * Ry;
      r.vis = P[2] > 0.05 && intro > 0.4;

      const Q = r.pts.map((q) => {
        rot(q[0], q[1], q[2], P);
        return [cx + P[0] * Rx, cy - P[1] * Ry, visible(P) ? 1 : 0];
      });
      const m = Q.length - 1;
      const on = !f || f === r.node || f === CORE;
      const dim = on ? 1 : 0.16;
      const focused = f === r.node;

      // Staggered slow launch timer
      if (running) {
        if (r.next < 0) r.next = t + 0.4 + i * 0.65 + Math.random() * 2.2;
        if (r.start < 0 && t >= r.next) {
          r.start = t;
          r.launch = t;
        }
        if (r.start >= 0 && t - r.start >= r.dur) {
          r.start = -1;
          r.next = t + 2.5 + Math.random() * 6.0;
          landings.push({ c: color, t });
          if (landings.length > 8) landings.shift();
        }
      }

      // Smooth cosine easing along the journey
      const p = r.start >= 0 ? (t - r.start) / r.dur : -1;
      const e = p < 0 ? 0 : 0.5 - Math.cos(Math.PI * p) / 2;
      const drawn = Math.max(0, Math.min(1, intro * 2.0 - 0.5 - i * 0.03));

      const path = (from: number, to: number) => {
        ctx.beginPath();
        let pen = false;
        for (let k = Math.max(0, Math.floor(from)); k <= Math.min(m, to); k++) {
          const q = Q[k];
          if (!q[2]) {
            pen = false;
            continue;
          }
          if (pen) ctx.lineTo(q[0], q[1]);
          else ctx.moveTo(q[0], q[1]);
          pen = true;
        }
        ctx.stroke();
      };

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Featherweight stationary route track
      ctx.globalAlpha = dim * 0.75;
      ctx.strokeStyle = THEME.track;
      ctx.lineWidth = 0.75;
      path(0, m * drawn);

      // Lit track aura when pulse travels or focused
      if (focused || p >= 0) {
        ctx.globalAlpha = dim * (focused ? 0.65 : 0.26 * Math.sin(Math.PI * Math.max(0, p)));
        ctx.strokeStyle = color;
        ctx.lineWidth = focused ? 1.4 : 0.95;
        path(0, m);
      }

      // Ethereal slow luminous comet / energy pulse - ENDS ONLY WITH NORMAL LINE, NO DOTS
      if (p >= 0 && running) {
        const head = e * m;
        const L = m * 0.32;
        const from = Math.max(0, head - L);

        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        for (let k = Math.floor(from); k < head; k++) {
          const a = Q[k], b = Q[Math.min(m, k + 1)];
          if (!a[2] || !b[2]) continue;
          const u = (k - from) / L;
          ctx.globalAlpha = dim * u ** 1.8 * 0.85;
          ctx.lineWidth = 0.4 + 1.8 * u;
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.stroke();
        }
        // NOTE: No dot at the front of the energy line. Pure flowing line only.
      }

      // City labels when focused or zoomed (normal clean lines, NO endpoint dots)
      if (r.vis) {
        if (focused || live || view.z > 1.25) {
          ctx.font = `600 ${focused ? 11.5 : 10}px ui-monospace, "SF Mono", Menlo, monospace`;
          if ('letterSpacing' in ctx) ctx.letterSpacing = '0.08em';
          ctx.globalAlpha = focused ? 1 : 0.75;
          ctx.fillStyle = THEME.label;
          ctx.fillText(r.node.name.toUpperCase(), r.sx + 8, r.sy - 6);
          if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
        }
      }
      ctx.globalAlpha = 1;
    });

    // The Central Beacon: Delhi NCR Core
    rot(coreV[0], coreV[1], coreV[2], P);
    coreHit.sx = cx + P[0] * Rx;
    coreHit.sy = cy - P[1] * Ry;
    coreHit.vis = P[2] > 0.05 && intro > 0.4;

    if (P[2] > 0.05) {
      const hx = coreHit.sx, hy = coreHit.sy;
      const lastL = landings.length ? t - landings[landings.length - 1].t : 9;
      const beat = Math.max(0, 1 - lastL / 1.0);

      // Soft purple aura
      ctx.globalAlpha = fade * (0.6 + 0.3 * beat);
      ctx.drawImage(glow(THEME.coreGlow), hx - 44, hy - 44, 88, 88);

      // Concentric ripples expanding when arrivals land
      for (const h of landings) {
        const k = (t - h.t) / 2.2;
        if (k < 0 || k >= 1) continue;
        ctx.globalAlpha = fade * (1 - k) ** 2 * 0.8;
        ctx.strokeStyle = h.c;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(hx, hy, 14 + (1 - (1 - k) ** 3) * 48, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Clean label for core destination (NO DOT)
      ctx.font = '700 11px ui-monospace, "SF Mono", Menlo, monospace';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0.14em';
      ctx.fillStyle = THEME.label;
      ctx.fillText('DELHI NCR', hx + 10, hy - 8);
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      ctx.globalAlpha = 1;
    }

    // Restore upper hemisphere clipping context before drawing baseline
    ctx.restore();

    // Horizon Baseline (spans horizontally stretched base and transitions into footer)
    const horizGrad = ctx.createLinearGradient(cx - Rx * 1.15, cy, cx + Rx * 1.15, cy);
    horizGrad.addColorStop(0, 'rgba(226, 232, 240, 0)');
    horizGrad.addColorStop(0.12, 'rgba(226, 232, 240, 0.7)');
    horizGrad.addColorStop(0.35, 'rgba(99, 102, 241, 0.45)');
    horizGrad.addColorStop(0.5, 'rgba(244, 63, 94, 0.55)');
    horizGrad.addColorStop(0.65, 'rgba(99, 102, 241, 0.45)');
    horizGrad.addColorStop(0.88, 'rgba(226, 232, 240, 0.7)');
    horizGrad.addColorStop(1, 'rgba(226, 232, 240, 0)');

    ctx.strokeStyle = horizGrad;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - Rx * 1.15, cy);
    ctx.lineTo(cx + Rx * 1.15, cy);
    ctx.stroke();

    // Delicate dashed latitude ticks as in the user's sketch
    ctx.save();
    ctx.setLineDash([4, 12]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - Rx * 1.2, cy + 4);
    ctx.lineTo(cx + Rx * 1.2, cy + 4);
    ctx.stroke();
    ctx.restore();

  };

  raf = requestAnimationFrame(frame);

  return {
    setLive,
    recenter,
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      root.removeAttribute('data-lenis-prevent');
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onCancel);
      root.removeEventListener('wheel', onWheel);
      root.removeEventListener('keydown', onKey);
    },
  };
}
