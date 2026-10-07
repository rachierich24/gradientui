// Canvas engine for the India globe (IndiaGlobe.tsx). Plain Canvas 2D, no three.js:
// a Fibonacci dot field masked to land, lit around India, with routes from every hub city
// into the Delhi NCR core. Idle, it sways and leans toward the cursor; once the visitor clicks,
// it rotates (drag, momentum), zooms (wheel) and flies to cities.

export type Side = 'cafe' | 'supply' | 'brand';
export type GlobeNode = { name: string; at: [number, number]; side: Side | 'core' };

export type GlobeTheme = 'night' | 'day';
export const SIDE_COLOR: Record<Side, string> = { cafe: '#E5483B', supply: '#1F9D57', brand: '#9B6BFF' };
export const CORE: GlobeNode = { name: 'Delhi NCR', at: [28.61, 77.21], side: 'core' };
export const NODES: GlobeNode[] = ([
  ['Mumbai', 19.08, 72.88, 'cafe'], ['Bengaluru', 12.97, 77.59, 'cafe'], ['Kolkata', 22.57, 88.36, 'cafe'],
  ['Kochi', 9.93, 76.27, 'cafe'], ['Chandigarh', 30.73, 76.78, 'cafe'], ['Indore', 22.72, 75.86, 'cafe'],
  ['Ahmedabad', 23.02, 72.57, 'supply'], ['Jaipur', 26.91, 75.79, 'supply'], ['Nagpur', 21.15, 79.09, 'supply'],
  ['Coimbatore', 11.02, 76.96, 'supply'], ['Guwahati', 26.14, 91.74, 'supply'],
  ['Pune', 18.52, 73.86, 'brand'], ['Hyderabad', 17.39, 78.49, 'brand'], ['Chennai', 13.08, 80.27, 'brand'],
  ['Goa', 15.49, 73.83, 'brand'], ['Lucknow', 26.85, 80.95, 'brand'],
] as const).map(([name, lat, lon, side]) => ({ name, at: [lat, lon], side }));

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
type Route = { node: GlobeNode; v: V3; pts: V3[]; dur: number; start: number; next: number; launch: number; sx: number; sy: number; vis: boolean };
type Opts = {
  root: HTMLElement; canvas: HTMLCanvasElement; card: HTMLElement; mask: Uint8Array;
  onFocus: (n: GlobeNode | null) => void; onLive: (live: boolean) => void; theme: GlobeTheme;
};

const THEMES = {
  night: {
    world: '#5E68B8', india: ramp(['#A78BFA', '#F0ABFC', '#FFE4F1']), track: 'rgba(170,180,255,.18)', glow: '140,110,255', glowA: 0.22,
    hubFill: '#0B0E24', core: '#EEF0FF', head: '#FFFFFF', ringA: 0.9, label: 'rgba(238,240,255,.92)', lens: '170,150,255',
    side: { cafe: '#FF6A5C', supply: '#3DDC84', brand: '#B48CFF' } as Record<Side, string>, coreGlow: '#8C6BFF', blend: 'lighter' as GlobalCompositeOperation,
  },
  day: {
    world: '#9AA0CC', india: ramp(['#5B3DF5', '#9B4DF0', '#D9468F']), track: 'rgba(40,40,110,.16)', glow: '120,90,255', glowA: 0.12,
    hubFill: '#FFFFFF', core: '#142B63', head: '#FFFFFF', ringA: 0.75, label: 'rgba(16,20,42,.9)', lens: '91,61,245',
    side: { cafe: '#E5483B', supply: '#1F9D57', brand: '#7C4DDB' } as Record<Side, string>, coreGlow: '#7C5CFF', blend: 'source-over' as GlobalCompositeOperation,
  },
};

const D = Math.PI / 180;
const HOME = { lon: 81, lat: 22, z: 1 };

// India as on its official map (Natural Earth outline plus all of Jammu & Kashmir and Ladakh),
// 0.25° cells from 38°N / 67°E, 128 × 132, one bit each. Only used to decide which dots are lit.
const INDIA_MASK = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwP8AAAAAAAAAAAAAAAAAAOD/BwAAAAAAAAAAAAAAAAD4/x8AAAAAAAAAAAAAAAAA/P//AAAAAAAAAAAAAAAAAP7//wMAAAAAAAAAAAAAAAD4////AQAAAAAAAAAAAAAA8P///w8AAAAAAAAAAAAAAOD///8fAAAAAAAAAAAAAACA////HwAAAAAAAAAAAAAAAP///w8AAAAAAAAAAAAAAAD+//8PAAAAAAAAAAAAAAAA/P//DwAAAAAAAAAAAAAAAPz//wcAAAAAAAAAAAAAAAD8//8HAAAAAAAAAAAAAAAA/P//AwAAAAAAAAAAAAAAAPj//wEAAAAAAAAAAAAAAADw//8BAAAAAAAAAAAAAAAA4P//AQAAAAAAAAAAAAAAAAD+PwAAAAAAAAAAAAAAAAAA/j8AAAAAAAAAAAAAAAAAwP9/AAAAAAAAAAAAAAAAAMD/fwAAAAAAAAAAAAAAAADA/38BAAAAAAAAAAAAAAAAwP//AQAAAAAAAAAAAAAAAOD//w8AAAAAAAAAAAAAAADw//8fAAAAAAAAAAAAAAAA8P//fwAAAAAAAAAAAAAAAPj//38AAAAAAAAAAAAAAAD+//8/AAAAAAAAAAAAAAAA/v//HwAAAAAAAAAAAAAAAP7//x8AAAAAAAAAGAAAAAD///8fAAAAAAAA4BwAAADA////DwAAAAAAAPA/AAAA4P///38AAAAAAAD+PwAAAOD/////AAAAAAAA/18AAADw/////wMAAAAAgP//AQBg/P////8HAABwAMD//wEA8P//////fwAAcAD8//8AAPj///////8/AHAA8P//AAD8////////fwBwAPD/DwAA/P////////8A4CDw/wcAAPj/////////B+D///8BAADg//////////+/////AAAA8P//////////H/r//wAAAOD//////////w/4//8AAACA//////////8/+P//AAAAgP//////////f/j/PwAAAID//////////z8A4H8AAAAA//////////8fAMB/AAAAAP//////////DwDgPwAAACD//////////z8A8B8AAID///////////9/APwfAADg////////////fwD+AQAAwP///////////z8A7gMAAMD///////////9/AOYDAACA/////////////wDkAQAAAO7///////////8AwAEAAADg////////////AMAAAAAA/f///////////wDAAQAAAP/f//////////8AwAAAAAD+z/////////+vAAAAAAAA/J//////////AwAAAAAAAPif/////////wAAAAAAAADwj////////38AAAAAAAAAwIP/////////AAAAAAAAAAAA/////////wAAAAAAAAAAgP///////38AAAAAAAAAAID///////8/AAAAAAAAAACA////////HwAAAAAAAAAAgP///////wMAAAAAAAAAAID///////8AAAAAAAAAAACA//////9/AAAAAAAAAAAAAP//////PwAAAAAAAAAAAAD//////z8AAAAAAAAAAAAA//////8fAAAAAAAAAAAAAP//////BwAAAAAAAAAAAAD//////wMAAAAAAAAAAAAA/v////8BAAAAAAAAAAAAAP7///9/AAAAAAAAAAAAAAD+////PwAAAAAAAAAAAAAA/v///x8AAAAAAAAAAAAAAP7///8fAAAAAAAAAAAAAAD+////BwAAAAAAAAAAAAAA/P///wEAAAAAAAAAAAAAAPz//78AAAAAAAAAAAAAAAD4//8fAAAAAAAAAAAAAAAA+P//HwAAAAAAAAAAAAAAAPD//w8AAAAAAAAAAAAAAADw//8PAAAAAAAAAAAAAAAA4P//HwAAAAAAAAAAAAAAAMD//x8AAAAAAAAAAAAAAADA//8fAAAAAAAAAAAAAAAAwP//HwAAAAAAAAAAAAAAAID//w8AAAAAAAAAAAAAAACA//8fAAAAAACAAAAAAAAAgP//HwAAAAAAgAAAAAAAAID//x8AAAAAAIAAAAAAAAAA//8fAAAAAACAAAAAAAAAAP//DwAAAAAAAAAAAAAAAAD+/w8AAAAAAAAAAAAAAAAA/P8HAAAAAABAAAAAAAAAAPz/BwAAAAAAQAAAAAAAAAD4/wcAAAAAAEAAAAAAAAAA+P8HAAAAAAAAAAAAAAAAAPD/BwAAAAAAAAAAAAAAAADw/wcAAAAAAAAAAAAAAAAA8P8HAAAAAAAAAAAAAAAAAOD/AQAAAAAAAAAAAAAAAADg/wEAAAAAAAAAAAAAAAAAwP8AAAAAAAAAAAAAAAAAAOD/AAAAAAAAAAAAAAAAAADAPwAAAAAAAAAAAAAAAAAAwB8AAAAAAAAAAAAAAAAAAIAfAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const IM_W = 128, IM_H = 132, IM_STEP = 0.25, IM_LAT = 38, IM_LON = 67;
const RING = ['#7F00FF', '#FF2E4D', '#22C55E'];             // the logo ring
const vec = (lat: number, lon: number): V3 => [Math.cos(lat * D) * Math.sin(lon * D), Math.sin(lat * D), Math.cos(lat * D) * Math.cos(lon * D)];
const visible = (p: number[]) => p[2] > 0 || p[0] * p[0] + p[1] * p[1] > 1;


// Rotate a globe-frame unit vector so (lat0, lon0) faces the viewer
function rotator(lon0: number, lat0: number) {
  const cL = Math.cos(lon0 * D), sL = Math.sin(lon0 * D), ct = Math.cos(lat0 * D), st = Math.sin(lat0 * D);
  return (X: number, Y: number, Z: number, o: number[]) => {
    const x = X * cL - Z * sL, z = Z * cL + X * sL;
    o[0] = x; o[1] = Y * ct - z * st; o[2] = Y * st + z * ct;
  };
}

// Great-circle arc between two points, lifted off the surface
function arc(a: [number, number], b: [number, number], lift: number, n = 72): V3[] {
  const A = vec(...a), B = vec(...b);
  const w = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])), sw = Math.sin(w) || 1;
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, ka = Math.sin((1 - t) * w) / sw, kb = Math.sin(t * w) / sw, h = 1 + lift * Math.sin(Math.PI * t);
    return [(A[0] * ka + B[0] * kb) * h, (A[1] * ka + B[1] * kb) * h, (A[2] * ka + B[2] * kb) * h];
  });
}

export function createIndiaGlobe({ root, canvas, card, mask, onFocus, onLive, theme: startTheme }: Opts) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { setLive: () => {}, recenter: () => {}, setTheme: () => {}, destroy: () => {} };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const land = (lat: number, lon: number) => {
    const i = ((Math.floor((lon + 180) * 2) % 720) + 720) % 720, j = Math.min(359, Math.max(0, Math.floor((90 - lat) * 2))), n = j * 720 + i;
    return (mask[n >> 3] >> (n & 7)) & 1;
  };

  const im = Uint8Array.from(atob(INDIA_MASK), (c) => c.charCodeAt(0));
  const imBit = (i: number, j: number) => (i < 0 || j < 0 || i >= IM_W || j >= IM_H ? 0 : (im[(j * IM_W + i) >> 3] >> ((j * IM_W + i) & 7)) & 1);
  const inIndia = (lat: number, lon: number) => imBit(Math.floor((lon - IM_LON) / IM_STEP), Math.floor((IM_LAT - lat) / IM_STEP));
  // soft edge: the share of neighbouring cells inside India, so the coast and border fade over ~half a degree
  const indiaWeight = (lat: number, lon: number) => {
    const i = Math.floor((lon - IM_LON) / IM_STEP), j = Math.floor((IM_LAT - lat) / IM_STEP);
    let n = 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) n += imBit(i + di, j + dj);
    return n / 9;
  };

  // Dots: [x, y, z, size, india weight]. The world is a sparse dim field; India gets its own
  // fine, even lattice (offset rows, ~0.24° apart) so it reads crisp at this zoom.
  const INDIA = vec(22, 80), dots: number[][] = [], g = Math.PI * (3 - Math.sqrt(5)), N = 150000;
  for (let k = 0; k < N; k++) {
    const lat = Math.asin(1 - (2 * (k + 0.5)) / N) / D, lon = (((k * g) / D) % 360) - 180;
    if (!land(lat, lon) || inIndia(lat, lon)) continue;
    const v = vec(lat, lon);
    dots.push([v[0], v[1], v[2], 0.7 + ((k * 7919) % 100) / 100, 0]);
  }
  for (let row = 0, lat = 6; lat < 37.6; row++, lat += 0.24) {
    const step = 0.24 / Math.cos(lat * D);
    for (let lon = 67 + (row % 2) * step / 2; lon < 98; lon += step) {
      if (!inIndia(lat, lon)) continue;
      const v = vec(lat, lon);
      dots.push([v[0], v[1], v[2], 0.7 + (((row * 31 + lon * 97) | 0) % 100) / 100, 0.35 + 0.65 * indiaWeight(lat, lon)]);
    }
  }
  const coreV = vec(...CORE.at);
  const routes: Route[] = NODES.map((node) => {
    const v = vec(...node.at), ang = Math.acos(Math.min(1, v[0] * coreV[0] + v[1] * coreV[1] + v[2] * coreV[2]));
    return { node, v, pts: arc(node.at, CORE.at, 0.02 + ang * 0.42, 120), dur: 3.4 + ang * 12, start: -1, next: -1, launch: -9, sx: 0, sy: 0, vis: false };
  });
  const landings: { c: string; t: number }[] = [];
  const coreHit = { node: CORE, sx: 0, sy: 0, vis: false };
  let T = THEMES[startTheme];

  // Pre-rendered sprites: drawImage of a soft round dot is far cheaper than arc() per dot,
  // and anti-aliases cleanly where fillRect gave hard square pixels.
  const sprites = new Map<string, HTMLCanvasElement>();
  const sprite = (key: string, paint: (g: CanvasRenderingContext2D) => void) => {
    let c = sprites.get(key);
    if (!c) { c = document.createElement('canvas'); c.width = c.height = 32; paint(c.getContext('2d')!); sprites.set(key, c); }
    return c;
  };
  const dot = (color: string) => sprite(`d${color}`, (g) => {
    const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    r.addColorStop(0, color); r.addColorStop(0.55, color); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.beginPath(); g.arc(16, 16, 16, 0, 7); g.fill();
  });
  const glow = (color: string) => sprite(`g${color}`, (g) => {
    const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    r.addColorStop(0, color); r.addColorStop(0.25, color + 'AA'); r.addColorStop(1, color + '00');
    g.fillStyle = r; g.fillRect(0, 0, 32, 32);
  });

  let W = 0, H = 0, DPR = 1, onScreen = false, live = false, raf = 0, intro = reduce ? 1 : 0, introAt = -1;
  const view = { ...HOME, lon: reduce ? HOME.lon : HOME.lon + 60 }, goal = { ...HOME }, spin = { lon: 0, lat: 0 };
  const mouse = { x: 0, y: 0, in: false, k: 0 };
  let drag: { x: number; y: number; moved: boolean; engage?: boolean } | null = null;
  let hover: GlobeNode | null = null, pinned: GlobeNode | null = null, shown: GlobeNode | null = null;
  let base = 1;

  const size = () => {
    DPR = Math.min(2, devicePixelRatio || 1); W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  };
  const ro = new ResizeObserver(size); ro.observe(canvas); size();
  const io = new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    if (onScreen && introAt < 0) introAt = performance.now();
  }, { rootMargin: '80px' });
  io.observe(root);

  const focus = () => {
    const n = pinned || hover;
    if (n !== shown) { shown = n; onFocus(n); }
  };
  const setLive = (on: boolean) => {
    if (live === on) return;
    live = on; onLive(on);
    if (on) root.setAttribute('data-lenis-prevent', ''); else root.removeAttribute('data-lenis-prevent');
    if (!on) { pinned = null; Object.assign(goal, HOME); spin.lon = spin.lat = 0; focus(); }
  };
  const recenter = () => { pinned = null; Object.assign(goal, HOME); spin.lon = spin.lat = 0; focus(); };
  const flyTo = (n: GlobeNode) => { goal.lon = n.at[1]; goal.lat = n.at[0]; goal.z = Math.max(goal.z, 1.25); };
  const local = (e: PointerEvent | WheelEvent) => { const r = root.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; };
  const nodeAt = (x: number, y: number) => {
    let best: GlobeNode | null = null, bd = 18;
    for (const r of [coreHit, ...routes]) {
      if (!r.vis) continue;
      const d = Math.hypot(r.sx - x, r.sy - y);
      if (d < bd) { bd = d; best = r.node; }
    }
    return best;
  };
  const overUI = (e: Event) => !!(e.target as HTMLElement).closest('button, a, [data-globe-ui]');

  const onMove = (e: PointerEvent) => {
    const [x, y] = local(e);
    mouse.x = x; mouse.y = y; mouse.in = e.pointerType === 'mouse';
    if (drag) {
      const dx = x - drag.x, dy = y - drag.y, k = 57.3 / (base * view.z);
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      if (!drag.engage) {
        goal.lon -= dx * k; goal.lat = Math.max(-50, Math.min(60, goal.lat + dy * k));
        spin.lon = -dx * k; spin.lat = dy * k;
      }
      drag.x = x; drag.y = y;
      return;
    }
    hover = overUI(e) ? null : nodeAt(x, y);
    root.classList.toggle('on-node', !!hover);
    focus();
  };
  const onLeave = () => { mouse.in = false; hover = null; root.classList.remove('on-node'); focus(); };
  const onDown = (e: PointerEvent) => {
    if (overUI(e)) return;
    const [x, y] = local(e);
    if (!live) { drag = { x, y, moved: false, engage: true }; return; }
    drag = { x, y, moved: false }; spin.lon = spin.lat = 0;
    root.setPointerCapture(e.pointerId); root.classList.add('dragging');
  };
  const onUp = (e: PointerEvent) => {
    if (!drag) return;
    const d = drag; drag = null; root.classList.remove('dragging');
    if (d.engage && d.moved) return;                         // a scroll gesture on touch, not a click
    if (d.engage) setLive(true);
    else if (d.moved) return;
    pinned = nodeAt(...local(e));
    if (pinned) flyTo(pinned);
    focus();
  };
  const onCancel = () => { drag = null; root.classList.remove('dragging'); };
  const onWheel = (e: WheelEvent) => {
    if (!live) return;
    e.preventDefault();
    goal.z = Math.max(0.45, Math.min(2, goal.z * Math.exp(-e.deltaY * 0.0015)));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && live) { setLive(false); return; }
    if ((e.key === 'Enter' || e.key === ' ') && !live && e.target === root) { e.preventDefault(); setLive(true); return; }
    if (!live || !e.key.startsWith('Arrow')) return;
    e.preventDefault();
    const s = 4 / view.z;
    if (e.key === 'ArrowLeft') goal.lon -= s;
    if (e.key === 'ArrowRight') goal.lon += s;
    if (e.key === 'ArrowUp') goal.lat = Math.min(60, goal.lat + s);
    if (e.key === 'ArrowDown') goal.lat = Math.max(-50, goal.lat - s);
  };
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerleave', onLeave);
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointerup', onUp);
  root.addEventListener('pointercancel', onCancel);
  root.addEventListener('wheel', onWheel, { passive: false });
  root.addEventListener('keydown', onKey);

  const placeCard = (sx: number, sy: number) => {
    const cw = card.offsetWidth, ch = card.offsetHeight;
    let x = sx + 20;
    if (x + cw > W - 16) x = sx - cw - 20;
    const y = Math.max(16, Math.min(H - ch - 16, sy - ch / 2));
    card.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const P = [0, 0, 0];
  let last = performance.now();
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!onScreen || !W) return;
    const t = reduce ? 8 : now / 1000;
    if (!reduce && introAt >= 0) intro = Math.min(1, (now - introAt) / 2400);
    const fade = 1 - (1 - intro) ** 3;

    // where the globe wants to be: home + sway + lean toward the cursor, or wherever the visitor put it
    if (!live && !reduce) {
      const lean = mouse.in ? 1 : 0;
      goal.lon = HOME.lon + Math.sin(t * 0.06) * 1.2 + lean * (mouse.x / W - 0.5) * 3;
      goal.lat = HOME.lat - lean * (mouse.y / H - 0.5) * 2;
    } else if (live && !drag && Math.abs(spin.lon) + Math.abs(spin.lat) > 0.002) {
      goal.lon += spin.lon; goal.lat = Math.max(-50, Math.min(60, goal.lat + spin.lat));
      spin.lon *= 0.93; spin.lat *= 0.93;
    }
    const ease = reduce ? 1 : drag ? 0.5 : intro < 1 ? 0.035 : 0.075;
    view.lon += (goal.lon - view.lon) * ease; view.lat += (goal.lat - view.lat) * ease; view.z += (goal.z - view.z) * 0.1;
    mouse.k += ((mouse.in && !drag ? 1 : 0) - mouse.k) * Math.min(1, dt * 8);

    const wide = W > 820;
    // zoomed so India fills the right of the panel (it spans roughly 0.47R tall)
    base = wide ? Math.min(H * 1.75, W * 0.95) : Math.min(W * 1.9, H * 1.05);
    const R = base * view.z, cx = wide ? W * 0.67 : W * 0.5, cy = wide ? H * 0.53 : H * 0.68;
    const rot = rotator(view.lon, view.lat);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // atmosphere: the logo ring, slowly turning
    const ring = ctx.createConicGradient(t * 0.12, cx, cy);
    [...RING, RING[0]].forEach((c, i) => ring.addColorStop(i / 3, c));
    ctx.save(); ctx.globalAlpha = T.ringA * 0.3 * fade; ctx.strokeStyle = ring; ctx.lineWidth = 28; ctx.filter = 'blur(20px)';
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.01, 0, 7); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = T.ringA * fade; ctx.strokeStyle = ring; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.restore();

    // a soft glow under India
    rot(INDIA[0], INDIA[1], INDIA[2], P);
    if (P[2] > 0) {
      const gx = cx + P[0] * R, gy = cy - P[1] * R, gr = R * 0.34, glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      glow.addColorStop(0, `rgba(${T.glow},${T.glowA * fade})`); glow.addColorStop(1, `rgba(${T.glow},0)`);
      ctx.fillStyle = glow; ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
    }

    // dots: soft round sprites. A dim world, India lit with a slow shimmer, a lens under the cursor
    const LR = 120, lk = mouse.k, mx = mouse.x, my = mouse.y, zs = Math.min(1.6, view.z);
    for (const p of dots) {
      rot(p[0], p[1], p[2], P);
      if (P[2] <= 0) continue;
      let sx = cx + P[0] * R, sy = cy - P[1] * R;
      if (sy < -6 || sy > H + 6 || sx < -6 || sx > W + 6) continue;
      const rim = Math.pow(1 - P[2], 0.75), ind = p[4];
      let s = (1.15 + 0.95 * ind + 0.35 * (p[3] - 0.7)) * zs, boost = 0;
      if (lk > 0.01) {
        const dx = sx - mx, dy = sy - my, d = Math.hypot(dx, dy);
        if (d < LR) { const f = (1 - d / LR) ** 2 * lk; sx += dx * f * 0.35; sy += dy * f * 0.35; s *= 1 + f * 1.2; boost = f; }
      }
      const lit = ind > 0.08 || boost > 0.2;
      const shimmer = lit && !reduce ? 0.78 + 0.22 * Math.sin(t * 1.3 + p[3] * 41) : 1;
      ctx.globalAlpha = Math.min(1, ((ind > 0 ? 0.3 + 0.62 * ind * shimmer : 0.05 + 0.14 * rim) + boost * 0.6) * fade);
      ctx.drawImage(dot(lit ? T.india[Math.max(0, Math.min(63, ((sy / H) * 63 + boost * 20) | 0))] : T.world), sx - s / 2, sy - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    if (lk > 0.01) {
      const lens = ctx.createRadialGradient(mx, my, 0, mx, my, LR);
      lens.addColorStop(0, `rgba(${T.lens},${0.14 * lk})`); lens.addColorStop(1, `rgba(${T.lens},0)`);
      ctx.fillStyle = lens; ctx.fillRect(mx - LR, my - LR, LR * 2, LR * 2);
    }

    // routes: faint arcs drawn in on entry. Each fires one pulse at a time, rests, then fires again;
    // the path lights up while a pulse travels it, and the core ripples when it lands.
    const f = pinned || hover, running = !reduce && intro >= 1;
    routes.forEach((r, i) => {
      const side = r.node.side as Side, color = T.side[side];
      rot(r.v[0], r.v[1], r.v[2], P);
      r.sx = cx + P[0] * R; r.sy = cy - P[1] * R; r.vis = P[2] > 0.05 && intro > 0.5;
      const Q = r.pts.map((q) => { rot(q[0], q[1], q[2], P); return [cx + P[0] * R, cy - P[1] * R, visible(P) ? 1 : 0]; }), m = Q.length - 1;
      const on = !f || f === r.node || f === CORE, dim = on ? 1 : 0.18, focused = f === r.node;

      if (running) {
        if (r.next < 0) r.next = t + 0.3 + i * 0.42 + Math.random() * 1.6;
        if (r.start < 0 && t >= r.next) { r.start = t; r.launch = t; }
        if (r.start >= 0 && t - r.start >= r.dur) {
          r.start = -1; r.next = t + 1.8 + Math.random() * 5.5;
          landings.push({ c: color, t }); if (landings.length > 8) landings.shift();
        }
      }
      const p = r.start >= 0 ? (t - r.start) / r.dur : -1, e = p < 0 ? 0 : 0.5 - Math.cos(Math.PI * p) / 2;

      const drawn = Math.max(0, Math.min(1, intro * 2.2 - 0.6 - i * 0.04));
      const path = (from: number, to: number) => {
        ctx.beginPath();
        let pen = false;
        for (let k = Math.max(0, Math.floor(from)); k <= Math.min(m, to); k++) {
          const q = Q[k];
          if (!q[2]) { pen = false; continue; }
          if (pen) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]);
          pen = true;
        }
        ctx.stroke();
      };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.globalAlpha = dim; ctx.strokeStyle = T.track; ctx.lineWidth = 0.8;
      path(0, m * drawn);
      if (focused || p >= 0) {                                         // the lit path
        ctx.globalAlpha = dim * (focused ? 0.55 : 0.22 * Math.sin(Math.PI * Math.max(0, p)));
        ctx.strokeStyle = color; ctx.lineWidth = focused ? 1.6 : 1.1;
        path(0, m);
      }

      ctx.globalCompositeOperation = T.blend;
      if (p >= 0 && running) {                                         // tapered comet
        const head = e * m, L = m * 0.24, from = Math.max(0, head - L);
        ctx.strokeStyle = color;
        for (let k = Math.floor(from); k < head; k++) {
          const a = Q[k], b = Q[Math.min(m, k + 1)];
          if (!a[2] || !b[2]) continue;
          const u = (k - from) / L;
          ctx.globalAlpha = dim * u ** 1.6; ctx.lineWidth = 0.4 + 2.2 * u;
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        }
        const hq = Q[Math.min(m, Math.round(head))];
        if (hq[2]) {
          ctx.globalAlpha = dim; ctx.drawImage(glow(color), hq[0] - 11, hq[1] - 11, 22, 22);
          ctx.fillStyle = T.head; ctx.beginPath(); ctx.arc(hq[0], hq[1], 1.5, 0, 7); ctx.fill();
        }
      }
      if (r.vis) {                                                     // the hub: halo, dot, hairline ring
        const lk2 = Math.min(1, (t - r.launch) / 1.1);
        if (lk2 < 1) { ctx.globalAlpha = dim * (1 - lk2) ** 2 * 0.8; ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(r.sx, r.sy, 4 + lk2 * 16, 0, 7); ctx.stroke(); }
        ctx.globalAlpha = dim * (focused ? 0.9 : 0.5); ctx.drawImage(glow(color), r.sx - 9, r.sy - 9, 18, 18);
      }
      ctx.globalCompositeOperation = 'source-over';
      if (r.vis) {
        ctx.globalAlpha = on ? 1 : 0.45;
        ctx.strokeStyle = color; ctx.lineWidth = 0.9;
        ctx.globalAlpha *= focused ? 0.9 : 0.35;
        ctx.beginPath(); ctx.arc(r.sx, r.sy, focused ? 7.5 + Math.sin(t * 3) : 5.2, 0, 7); ctx.stroke();
        ctx.globalAlpha = on ? 1 : 0.45;
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(r.sx, r.sy, focused ? 3 : 2.3, 0, 7); ctx.fill();
        if (focused || live || view.z > 1.25) {
          ctx.font = `500 ${focused ? 11.5 : 10}px ui-monospace, "SF Mono", Menlo, monospace`;
          if ('letterSpacing' in ctx) ctx.letterSpacing = '0.08em';
          ctx.globalAlpha *= focused ? 1 : 0.75; ctx.fillStyle = T.label; ctx.fillText(r.node.name.toUpperCase(), r.sx + 10, r.sy - 8);
          if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
        }
      }
      ctx.globalAlpha = 1;
    });

    // the core: Delhi NCR as a beacon. A soft glow, landing ripples in the sender's colour,
    // a hairline orbit and the logo arc turning slowly inside it.
    rot(coreV[0], coreV[1], coreV[2], P);
    coreHit.sx = cx + P[0] * R; coreHit.sy = cy - P[1] * R; coreHit.vis = P[2] > 0.05 && intro > 0.5;
    if (P[2] > 0.05) {
      const hx = coreHit.sx, hy = coreHit.sy, last = landings.length ? t - landings[landings.length - 1].t : 9;
      const beat = Math.max(0, 1 - last / 0.8);
      ctx.globalCompositeOperation = T.blend;
      ctx.globalAlpha = fade * (0.55 + 0.35 * beat); ctx.drawImage(glow(T.coreGlow), hx - 40, hy - 40, 80, 80);
      for (const h of landings) {
        const k = (t - h.t) / 1.6;
        if (k < 0 || k >= 1) continue;
        ctx.globalAlpha = fade * (1 - k) ** 2 * 0.85; ctx.strokeStyle = h.c; ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.arc(hx, hy, 14 + (1 - (1 - k) ** 3) * 44, 0, 7); ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = fade * 0.22; ctx.strokeStyle = T.label; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(hx, hy, 19, 0, 7); ctx.stroke();
      ctx.globalAlpha = fade;
      ctx.fillStyle = T.hubFill; ctx.beginPath(); ctx.arc(hx, hy, 12.5, 0, 7); ctx.fill();
      const spin = reduce ? 0 : t * 0.7, logo = ctx.createConicGradient(spin, hx, hy);
      [...RING, RING[0]].forEach((c, i) => logo.addColorStop(i / 3, c));
      ctx.strokeStyle = logo; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(hx, hy, 8, spin, spin + 4.6); ctx.stroke();
      ctx.fillStyle = T.core; ctx.beginPath(); ctx.arc(hx, hy, 2.6 + beat * 0.8, 0, 7); ctx.fill();
      ctx.font = '600 11px ui-monospace, "SF Mono", Menlo, monospace';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0.14em';
      ctx.fillStyle = T.label; ctx.fillText('DELHI NCR', hx + 26, hy + 4);
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      ctx.globalAlpha = 1;
    }

    if (shown) {
      const r = shown === CORE ? coreHit : routes.find((x) => x.node === shown);
      if (r?.vis) { card.dataset.show = ''; placeCard(r.sx, r.sy); } else delete card.dataset.show;
    } else delete card.dataset.show;
  };
  raf = requestAnimationFrame(frame);

  return {
    setLive, recenter,
    setTheme(t: GlobeTheme) { T = THEMES[t]; },
    destroy() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
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
