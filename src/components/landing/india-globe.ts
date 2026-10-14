// Canvas engine for the India globe (IndiaGlobe.tsx). Plain Canvas 2D, no three.js.
// A photographic Earth at night on a black, starry sky: the surface is shaded per pixel (near-black
// seas, slate continents, deserts in deep brown), daylight and white cloud across the top, a thick
// blue atmosphere on the limb. Gold belongs to India alone: its dense city lights, a faint gold
// tint and border, and the routes into Delhi NCR. Elsewhere only faint cool-white lights show.

import { createEarthGL } from './india-globe-gl';

export type Side = 'cafe' | 'supply' | 'brand' | 'origin' | 'core';
export type GlobeNode = {
  name: string;
  at: [number, number];
  side: Side;
  metric?: string;
  subtitle?: string;
};

export const SIDE_COLOR: Record<Side, string> = {
  core: '#7C4DDB',
  cafe: '#9B6BFF',
  supply: '#6D4AE0',
  brand: '#7C4DDB',
  origin: '#5B3DC4',
};

export const CORE: GlobeNode = {
  name: 'Delhi NCR',
  at: [28.61, 77.21],
  side: 'core',
  metric: 'National Routing Engine',
  subtitle: 'Gradient 365 core dispatch and settlement hub',
};

export const NODES: GlobeNode[] = ([
  // Major Indian café & commercial hubs
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

  // Indian coffee origins
  ['Chikmagalur', 13.32, 75.77, 'origin', 'Birthplace of Indian Coffee', 'Western Ghats Single Origin Arabica Farms'],
  ['Coorg', 12.33, 75.80, 'origin', 'Coffee Bowl of India', 'High-Elevation Shade-Grown Estate Batches'],
  ['Araku Valley', 18.33, 82.88, 'origin', 'Specialty Micro-Lots', 'Award-Winning Organic Tribal Specialty Coffee'],

  // International corridors feeding India
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

const hexRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hexRgb(a), B = hexRgb(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
const ramp = (stops: string[], n: number) =>
  Array.from({ length: n }, (_, i) => {
    const t = (i / (n - 1)) * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(t));
    return mix(stops[k], stops[k + 1], t - k);
  });

type V3 = [number, number, number];
type Route = {
  node: GlobeNode; v: V3; pts: V3[]; dur: number;
  start: number; next: number; launch: number; sx: number; sy: number; vis: boolean;
};
type Opts = {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  mask: Uint8Array;
  onFocus: (n: GlobeNode | null) => void;
  onLive: (live: boolean) => void;
  /** a click on the globe (or Enter): opens the India explorer, with the clicked city if any */
  onExplore?: (n: GlobeNode | null) => void;
};

// Night palette: continents in deep navy to dusk blue, warm sodium-gold city lights, gold routes.
const THEME = {
  landNight: '#1B2645',
  landDay: '#5A6B92',
  light: '#FFD68A',
  lightHot: '#FFF1CC',
  arc: 'rgba(255, 205, 120, 0.32)',
  arcFocus: '#FFC970',
  arcHot: '#FFE2A6',
  head: '#FFFFFF',
  label: 'rgba(235, 240, 255, 0.92)',
  glow: '#FFB547',
};

// City lights: [lat, lon, weight]. Weight sets how many lights cluster there and how far they spread.
const WORLD_CITIES: [number, number, number][] = [
  [40.7,-74,5],[34,-118.2,4],[41.9,-87.6,4],[29.8,-95.4,3],[32.8,-96.8,3],[33.7,-84.4,3],[25.8,-80.2,3],[38.9,-77,3],[42.4,-71,3],
  [37.8,-122.4,3],[47.6,-122.3,2],[43.7,-79.4,3],[45.5,-73.6,2],[19.4,-99.1,4],[20.7,-103.3,2],[25.7,-100.3,2],[4.7,-74.1,3],
  [-12,-77,3],[-33.4,-70.6,3],[-34.6,-58.4,4],[-23.5,-46.6,5],[-22.9,-43.2,4],[10.5,-66.9,2],[23.1,-82.4,1],
  [51.5,-0.1,5],[48.9,2.35,5],[40.4,-3.7,4],[41.4,2.2,3],[38.7,-9.1,2],[41.9,12.5,3],[45.5,9.2,4],[52.5,13.4,3],[53.6,10,2],
  [48.1,11.6,2],[52.4,4.9,4],[50.8,4.4,3],[51.5,7.2,4],[52.2,21,3],[50.1,14.4,2],[48.2,16.4,2],[47.5,19,2],[44.4,26.1,2],
  [38,23.7,2],[41,29,5],[39.9,32.9,2],[55.8,37.6,5],[59.9,30.3,3],[50.5,30.5,3],[59.3,18.1,2],[59.9,10.8,1],[60.2,24.9,1],
  [53.3,-6.3,2],[53.5,-2.2,3],[30,31.2,5],[31.2,29.9,2],[6.5,3.4,4],[-4.3,15.3,2],[-26.2,28,4],[-33.9,18.4,2],[-1.3,36.8,2],
  [9,38.7,2],[33.6,-7.6,3],[36.8,3.1,2],[36.8,10.2,1],[5.6,-0.2,2],[15.6,32.5,1],[14.7,-17.5,1],[-8.8,13.2,1],
  [24.7,46.7,3],[21.5,39.2,2],[25.2,55.3,4],[25.3,51.5,2],[29.4,48,2],[35.7,51.4,4],[33.3,44.4,3],[24.9,67,4],[31.5,74.3,4],
  [33.7,73,2],[23.8,90.4,5],[27.7,85.3,1],[6.9,79.9,2],[41.3,69.2,2],[43.2,76.9,1],
  [39.9,116.4,5],[31.2,121.5,5],[23.1,113.3,5],[22.5,114.1,4],[29.6,106.5,3],[30.7,104.1,3],[30.6,114.3,3],[34.3,108.9,2],
  [39.1,117.2,3],[41.8,123.4,2],[45.8,126.6,2],[22.3,114.2,4],[25,121.5,3],[37.6,127,5],[35.1,129,2],[35.7,139.7,5],
  [34.7,135.5,4],[35.2,136.9,3],[33.6,130.4,2],[43.1,141.4,1],[14.6,121,4],[13.8,100.5,4],[21,105.8,3],[10.8,106.7,3],
  [3.1,101.7,3],[1.35,103.8,3],[-6.2,106.8,5],[-7.3,112.7,2],[16.8,96.2,2],[-33.9,151.2,3],[-37.8,145,3],[-27.5,153,2],
  [-32,115.9,1],[-36.8,174.8,1],
];
const INDIA_CITIES: [number, number, number][] = [
  [28.6,77.2,6],[19.1,72.9,6],[22.6,88.4,5],[13,77.6,5],[13.1,80.3,5],[17.4,78.5,5],[23,72.6,4],[18.5,73.9,4],[21.2,72.8,3],
  [26.9,75.8,3],[26.8,80.9,3],[26.4,80.3,3],[21.1,79.1,3],[22.7,75.9,3],[23.3,77.4,2],[25.6,85.1,3],[22.3,73.2,2],[30.9,75.9,2],
  [27.2,78,2],[20,73.8,2],[25.3,83,2],[34.1,74.8,1],[31.6,74.9,2],[30.7,76.8,2],[17.7,83.2,2],[16.5,80.6,2],[11,77,2],[9.9,78.1,2],
  [9.9,76.3,2],[8.5,76.9,2],[11.3,75.8,1],[12.9,74.9,1],[12.3,76.6,1],[15.5,73.8,1],[21.3,81.6,2],[23.3,85.3,2],[20.3,85.8,2],
  [26.1,91.7,2],[30.3,78,1],[26.3,73,1],[24.6,73.7,1],[22.3,70.8,2],[23.2,79.9,1],[26.2,78.2,1],[29,77.7,2],[19.9,75.3,1],
  [17.7,75.9,1],[15.4,75.1,1],[15.9,74.5,1],[10.8,78.7,1],[11.7,78.2,1],[16.3,80.4,1],[18,79.6,1],[26.7,88.4,1],[23.7,87,1],
  [23.8,86.4,1],[32.7,74.9,1],[31.1,77.2,1],[24.8,93.9,1],[23.8,91.3,1],[28.4,79.4,1],[25.4,81.8,2],[26.8,83.4,1],
];

const D = Math.PI / 180;
// Sun direction in view space (x right, y up, z toward the viewer): above and behind, so the top of
// the globe is in daylight (white cloud, blue-grey sea) while India sits on the night side.
const SUN = [-0.15, 0.6, -0.78].map((v, _, a) => v / Math.hypot(...a));
const HOME_LON = 79;
const INDIA_AT: [number, number] = [22, 79];

export const INDIA_MASK = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwP8AAAAAAAAAAAAAAAAAAOD/BwAAAAAAAAAAAAAAAAD4/x8AAAAAAAAAAAAAAAAA/P//AAAAAAAAAAAAAAAAAP7//wMAAAAAAAAAAAAAAAD4////AQAAAAAAAAAAAAAA8P///w8AAAAAAAAAAAAAAOD///8fAAAAAAAAAAAAAACA////HwAAAAAAAAAAAAAAAP///w8AAAAAAAAAAAAAAAD+//8PAAAAAAAAAAAAAAAA/P//DwAAAAAAAAAAAAAAAPz//wcAAAAAAAAAAAAAAAD8//8HAAAAAAAAAAAAAAAA/P//AwAAAAAAAAAAAAAAAPj//wEAAAAAAAAAAAAAAADw//8BAAAAAAAAAAAAAAAA4P//AQAAAAAAAAAAAAAAAAD+PwAAAAAAAAAAAAAAAAAA/j8AAAAAAAAAAAAAAAAAwP9/AAAAAAAAAAAAAAAAAMD/fwAAAAAAAAAAAAAAAADA/38BAAAAAAAAAAAAAAAAwP//AQAAAAAAAAAAAAAAAOD//w8AAAAAAAAAAAAAAADw//8fAAAAAAAAAAAAAAAA8P//fwAAAAAAAAAAAAAAAPj//38AAAAAAAAAAAAAAAD+//8/AAAAAAAAAAAAAAAA/v//HwAAAAAAAAAAAAAAAP7//x8AAAAAAAAAGAAAAAD///8fAAAAAAAA4BwAAADA////DwAAAAAAAPA/AAAA4P///38AAAAAAAD+PwAAAOD/////AAAAAAAA/18AAADw/////wMAAAAAgP//AQBg/P////8HAABwAMD//wEA8P//////fwAAcAD8//8AAPj///////8/AHAA8P//AAD8////////fwBwAPD/DwAA/P////////8A4CDw/wcAAPj/////////B+D///8BAADg//////////+/////AAAA8P//////////H/r//wAAAOD//////////w/4//8AAACA//////////8/+P//AAAAgP//////////f/j/PwAAAID//////////z8A4H8AAAAA//////////8fAMB/AAAAAP//////////DwDgPwAAACD//////////z8A8B8AAID///////////9/APwfAADg////////////fwD+AQAAwP///////////z8A7gMAAMD///////////9/AOYDAACA/////////////wDkAQAAAO7///////////8AwAEAAADg////////////AMAAAAAA/f///////////wDAAQAAAP/f//////////8AwAAAAAD+z/////////+vAAAAAAAA/J//////////AwAAAAAAAPif/////////wAAAAAAAADwj////////38AAAAAAAAAwIP/////////AAAAAAAAAAAA/////////wAAAAAAAAAAgP///////38AAAAAAAAAAID///////8/AAAAAAAAAACA////////HwAAAAAAAAAAgP///////wMAAAAAAAAAAID///////8AAAAAAAAAAACA//////9/AAAAAAAAAAAAAP//////PwAAAAAAAAAAAAD//////z8AAAAAAAAAAAAA//////8fAAAAAAAAAAAAAP//////BwAAAAAAAAAAAAD//////wMAAAAAAAAAAAAA/v////8BAAAAAAAAAAAAAP7///9/AAAAAAAAAAAAAAD+////PwAAAAAAAAAAAAAA/v///x8AAAAAAAAAAAAAAP7///8fAAAAAAAAAAAAAAD+////BwAAAAAAAAAAAAAA/P///wEAAAAAAAAAAAAAAPz//78AAAAAAAAAAAAAAAD4//8fAAAAAAAAAAAAAAAA+P//HwAAAAAAAAAAAAAAAPD//w8AAAAAAAAAAAAAAADw//8PAAAAAAAAAAAAAAAA4P//HwAAAAAAAAAAAAAAAMD//x8AAAAAAAAAAAAAAADA//8fAAAAAAAAAAAAAAAAwP//HwAAAAAAAAAAAAAAAID//w8AAAAAAAAAAAAAAACA//8fAAAAAACAAAAAAAAAgP//HwAAAAAAgAAAAAAAAID//x8AAAAAAIAAAAAAAAAA//8fAAAAAACAAAAAAAAAAP//DwAAAAAAAAAAAAAAAAD+/w8AAAAAAAAAAAAAAAAA/P8HAAAAAABAAAAAAAAAAPz/BwAAAAAAQAAAAAAAAAD4/wcAAAAAAEAAAAAAAAAA+P8HAAAAAAAAAAAAAAAAAPD/BwAAAAAAAAAAAAAAAADw/wcAAAAAAAAAAAAAAAAA8P8HAAAAAAAAAAAAAAAAAOD/AQAAAAAAAAAAAAAAAADg/wEAAAAAAAAAAAAAAAAAwP8AAAAAAAAAAAAAAAAAAOD/AAAAAAAAAAAAAAAAAADAPwAAAAAAAAAAAAAAAAAAwB8AAAAAAAAAAAAAAAAAAIAfAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const IM_W = 128, IM_H = 132, IM_STEP = 0.25, IM_LAT = 38, IM_LON = 67;

const vec = (lat: number, lon: number): V3 =>
  [Math.cos(lat * D) * Math.sin(lon * D), Math.sin(lat * D), Math.cos(lat * D) * Math.cos(lon * D)];
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
function arc(a: [number, number], b: [number, number], lift: number, n = 120): V3[] {
  const A = vec(...a), B = vec(...b);
  const w = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])), sw = Math.sin(w) || 1;
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, ka = Math.sin((1 - t) * w) / sw, kb = Math.sin(t * w) / sw, h = 1 + lift * Math.sin(Math.PI * t);
    return [(A[0] * ka + B[0] * kb) * h, (A[1] * ka + B[1] * kb) * h, (A[2] * ka + B[2] * kb) * h];
  });
}

export function createIndiaGlobe({ root, canvas, mask, onFocus, onLive, onExplore }: Opts) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { setLive: () => {}, recenter: () => {}, destroy: () => {} };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const land = (lat: number, lon: number) => {
    const i = ((Math.floor((lon + 180) * 2) % 720) + 720) % 720, j = Math.min(359, Math.max(0, Math.floor((90 - lat) * 2)));
    const n = j * 720 + i;
    return (mask[n >> 3] >> (n & 7)) & 1;
  };
  const im = Uint8Array.from(atob(INDIA_MASK), (c) => c.charCodeAt(0));
  // The planet itself: WebGL with NASA imagery when available (india-globe-gl.ts); otherwise the
  // per-pixel 2D surface and drawn city lights below take over.
  const earth = createEarthGL(root, canvas, mask, { bits: im, w: IM_W, h: IM_H, lat0: IM_LAT, lon0: IM_LON, step: IM_STEP });
  const imBit = (i: number, j: number) =>
    i < 0 || j < 0 || i >= IM_W || j >= IM_H ? 0 : (im[(j * IM_W + i) >> 3] >> ((j * IM_W + i) & 7)) & 1;
  const inIndia = (lat: number, lon: number) => imBit(Math.floor((lon - IM_LON) / IM_STEP), Math.floor((IM_LAT - lat) / IM_STEP));
  const indiaWeight = (lat: number, lon: number) => {
    const i = Math.floor((lon - IM_LON) / IM_STEP), j = Math.floor((IM_LAT - lat) / IM_STEP);
    let n = 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) n += imBit(i + di, j + dj);
    return n / 9;
  };

  // Dots: [x, y, z, size, india weight, seed]. The world is an even Fibonacci field;
  // India is its own tighter lattice; it seeds India's rural lights.
  const dots: number[][] = [];
  const g = Math.PI * (3 - Math.sqrt(5)), N = 200000;
  for (let k = 0; k < N; k++) {
    const lat = Math.asin(1 - (2 * (k + 0.5)) / N) / D, lon = (((k * g) / D) % 360) - 180;
    if (!land(lat, lon) || inIndia(lat, lon)) continue;
    const v = vec(lat, lon);
    dots.push([v[0], v[1], v[2], 0.85 + ((k * 7919) % 100) / 330, 0, (k * 0.618) % 1]);
  }
  for (let row = 0, lat = 6.6; lat < 37.6; row++, lat += 0.26) {
    const step = 0.26 / Math.cos(lat * D);
    for (let lon = 67 + ((row % 2) * step) / 2; lon < 98; lon += step) {
      if (!inIndia(lat, lon)) continue;
      const v = vec(lat, lon);
      dots.push([v[0], v[1], v[2], 0.9 + (((row * 31 + lon * 97) | 0) % 100) / 400, 0.55 + 0.45 * indiaWeight(lat, lon), ((row * 0.37 + lon) * 0.618) % 1]);
    }
  }

  const coreV = vec(...CORE.at);
  const inIndiaBox = (n: GlobeNode) => n.at[0] >= 6 && n.at[0] <= 37.6 && n.at[1] >= 67 && n.at[1] <= 98;
  const routes: Route[] = NODES.filter(inIndiaBox).map((node) => {
    const v = vec(...node.at), ang = Math.acos(Math.min(1, v[0] * coreV[0] + v[1] * coreV[1] + v[2] * coreV[2]));
    return {
      node, v, pts: arc(node.at, CORE.at, 0.03 + ang * 0.32, 140), dur: 5 + ang * 9,
      start: -1, next: -1, launch: -9, sx: 0, sy: 0, vis: false,
    };
  });
  const landings: number[] = [];

  // City lights: Gaussian clusters around each city (kept on land), plus rural scatter that is
  // much denser across India. [x, y, z, size, seed, india]. Seeded, so the map is the same every visit.
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
  const lights: number[][] = [];
  const addCity = ([lat, lon, w]: [number, number, number], density: number, india: number) => {
    const n = Math.round(w * w * density), sig = 0.22 + w * 0.13;
    for (let i = 0; i < n; i++) {
      const gx = gauss(), gy = gauss(), la = lat + gy * sig, lo = lon + (gx * sig) / Math.cos(lat * D);
      if (!land(la, lo)) continue;
      const v = vec(la, lo), core = Math.max(0, 1 - Math.hypot(gx, gy) * 0.45);
      lights.push([v[0], v[1], v[2], (0.55 + core) * (0.75 + w * 0.07), rnd(), india]);
    }
  };
  WORLD_CITIES.forEach((c) => addCity(c, 4, 0));
  INDIA_CITIES.forEach((c) => addCity(c, 14, 1));
  for (const p of dots) if (p[4] > 0 ? rnd() < 0.25 : rnd() < 0.004) lights.push([p[0], p[1], p[2], 0.45 + rnd() * 0.35, rnd(), p[4] > 0 ? 1 : 0]);
  // Stars: fixed points on the sky, [x, y, size, alpha, seed]
  const stars = Array.from({ length: 420 }, () => [rnd(), rnd(), 0.4 + rnd() * 0.9, 0.12 + rnd() * 0.55, rnd()]);

  // Surface textures, made once: value-noise fbm on a 512×256 equirectangular grid that wraps
  // east–west. One varies the greens (terrain), the other is cloud cover, stretched into bands.
  const TW = 512, TH = 256;
  const fbm = (octaves: number, sx: number) => {
    const out = new Float32Array(TW * TH);
    let amp = 1, total = 0;
    for (let o = 0; o < octaves; o++) {
      const gw = Math.round(8 * sx * 2 ** o), gh = Math.round(4 * 2 ** o), grid = new Float32Array(gw * (gh + 1));
      for (let i = 0; i < grid.length; i++) grid[i] = rnd();
      for (let y = 0; y < TH; y++) {
        const gy = (y / TH) * gh, j = Math.floor(gy), fy = gy - j, ey = fy * fy * (3 - 2 * fy);
        for (let x = 0; x < TW; x++) {
          const gx = (x / TW) * gw, i = Math.floor(gx), fx = gx - i, ex = fx * fx * (3 - 2 * fx), i1 = (i + 1) % gw;
          const a = grid[j * gw + i], b = grid[j * gw + i1], c = grid[(j + 1) * gw + i], d = grid[(j + 1) * gw + i1];
          out[y * TW + x] += amp * ((a + (b - a) * ex) * (1 - ey) + (c + (d - c) * ex) * ey);
        }
      }
      total += amp; amp *= 0.5;
    }
    for (let i = 0; i < out.length; i++) out[i] /= total;
    return out;
  };
  const terrain = fbm(5, 1), cloudTex = fbm(5, 2);
  const texAt = (tex: Float32Array, lat: number, lon: number) => {
    const u = (((lon + 180) / 360) * TW) % TW, v = ((90 - lat) / 180) * (TH - 1);
    const i0 = (Math.floor(u) + TW) % TW, i1 = (i0 + 1) % TW, j = Math.min(TH - 2, Math.max(0, Math.floor(v)));
    const fu = u - Math.floor(u), fv = Math.min(1, Math.max(0, v - j));
    const a = tex[j * TW + i0], b = tex[j * TW + i1], c = tex[(j + 1) * TW + i0], d = tex[(j + 1) * TW + i1];
    return (a + (b - a) * fu) * (1 - fv) + (c + (d - c) * fu) * fv;
  };
  const landBit = (i: number, j: number) => {
    i = ((i % 720) + 720) % 720; j = j < 0 ? 0 : j > 359 ? 359 : j;
    const n = j * 720 + i;
    return (mask[n >> 3] >> (n & 7)) & 1;
  };
  const landSoft = (lat: number, lon: number) => {
    const u = (lon + 180) * 2 - 0.5, v = (90 - lat) * 2 - 0.5, i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j;
    return (landBit(i, j) * (1 - fu) + landBit(i + 1, j) * fu) * (1 - fv) + (landBit(i, j + 1) * (1 - fu) + landBit(i + 1, j + 1) * fu) * fv;
  };
  const indiaSoft = (lat: number, lon: number) => {
    const u = (lon - IM_LON) / IM_STEP - 0.5, v = (IM_LAT - lat) / IM_STEP - 0.5;
    if (u < -2 || v < -2 || u > IM_W + 1 || v > IM_H + 1) return 0;
    const i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j;
    return (imBit(i, j) * (1 - fu) + imBit(i + 1, j) * fu) * (1 - fv) + (imBit(i, j + 1) * (1 - fu) + imBit(i + 1, j + 1) * fu) * fv;
  };

  const surf = document.createElement('canvas'), sctx = surf.getContext('2d')!;
  let img: ImageData | null = null, texKey = '', texT = -9;
  const indiaV = vec(...INDIA_AT);
  const coreHit = { node: CORE, sx: 0, sy: 0, vis: false };

  // Pre-rendered soft glow sprites: far cheaper than arc() per point.
  const sprites = new Map<string, HTMLCanvasElement>();
  const sprite = (key: string, paint: (g: CanvasRenderingContext2D) => void) => {
    let c = sprites.get(key);
    if (!c) { c = document.createElement('canvas'); c.width = c.height = 36; paint(c.getContext('2d')!); sprites.set(key, c); }
    return c;
  };
  const glow = (color: string) => sprite(`g${color}`, (g) => {
    const r = g.createRadialGradient(18, 18, 0, 18, 18, 18);
    r.addColorStop(0, color); r.addColorStop(0.3, color + 'AA'); r.addColorStop(0.7, color + '2A'); r.addColorStop(1, color + '00');
    g.fillStyle = r; g.fillRect(0, 0, 36, 36);
  });

  let W = 0, H = 0, DPR = 1, onScreen = false, live = false, raf = 0, intro = reduce ? 1 : 0, introAt = -1;
  let homeLat = -20, scrollP = reduce ? 1 : 0;
  const view = { lon: reduce ? HOME_LON : HOME_LON + 40, lat: homeLat, z: 1 };
  const goal = { lon: HOME_LON, lat: homeLat, z: 1 };
  const spin = { lon: 0, lat: 0 };
  const mouse = { x: 0, y: 0, in: false, k: 0 };
  let drag: { x: number; y: number; moved: boolean; engage?: boolean } | null = null;
  let hover: GlobeNode | null = null, pinned: GlobeNode | null = null, shown: GlobeNode | null = null;
  let base = 1;

  // capTop: where the globe's curve may start, just below any headline laid over the stage
  let capTop = 28;
  const header = root.querySelector<HTMLElement>('.ig-header');
  const size = () => {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    capTop = header ? header.offsetTop + header.offsetHeight + Math.max(16, H * 0.03) : 28;
  };
  const ro = new ResizeObserver(size); ro.observe(canvas); if (header) ro.observe(header); size();
  const io = new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    if (onScreen && introAt < 0) introAt = performance.now();
  }, { rootMargin: '100px' });
  io.observe(root);

  const focus = () => { const n = pinned || hover; if (n !== shown) { shown = n; onFocus(n); } };
  const home = () => { goal.lon = HOME_LON; goal.lat = homeLat; goal.z = 1; spin.lon = spin.lat = 0; };
  const setLive = (on: boolean) => {
    if (live === on) return;
    live = on; onLive(on);
    if (on) root.setAttribute('data-lenis-prevent', ''); else root.removeAttribute('data-lenis-prevent');
    if (!on) { pinned = null; home(); focus(); }
  };
  const recenter = () => { pinned = null; home(); focus(); };
  const flyTo = (n: GlobeNode) => { goal.lon = n.at[1]; goal.lat = homeLat + (n.at[0] - INDIA_AT[0]); goal.z = Math.max(goal.z, 1.3); };
  const local = (e: PointerEvent | WheelEvent) => { const r = root.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; };
  const nodeAt = (x: number, y: number) => {
    let best: GlobeNode | null = null, bd = 20;
    for (const r of [coreHit, ...routes]) {
      if (!r.vis) continue;
      const d = Math.hypot(r.sx - x, r.sy - y);
      if (d < bd) { bd = d; best = r.node; }
    }
    return best;
  };
  const overUI = (e: Event) => !!(e.target as HTMLElement).closest('button, a, [data-globe-ui]');
  const clampLat = (v: number) => Math.max(homeLat - 30, Math.min(homeLat + 30, v));

  const onMove = (e: PointerEvent) => {
    const [x, y] = local(e);
    mouse.x = x; mouse.y = y; mouse.in = e.pointerType === 'mouse';
    if (drag) {
      const dx = x - drag.x, dy = y - drag.y, k = 57.3 / (base * view.z);
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      if (!drag.engage) { goal.lon -= dx * k; goal.lat = clampLat(goal.lat + dy * k); spin.lon = -dx * k; spin.lat = dy * k; }
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
    if (d.engage && d.moved) return;
    if (d.engage) { onExplore ? onExplore(nodeAt(...local(e))) : setLive(true); return; }
    else if (d.moved) return;
    pinned = nodeAt(...local(e));
    if (pinned) flyTo(pinned);
    focus();
  };
  const onCancel = () => { drag = null; root.classList.remove('dragging'); };
  const onWheel = (e: WheelEvent) => {
    if (!live) return;
    e.preventDefault();
    goal.z = Math.max(0.8, Math.min(2.2, goal.z * Math.exp(-e.deltaY * 0.0014)));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && live) { setLive(false); return; }
    if ((e.key === 'Enter' || e.key === ' ') && !live && e.target === root) { e.preventDefault(); if (onExplore) onExplore(null); else setLive(true); return; }
    if (!live || !e.key.startsWith('Arrow')) return;
    e.preventDefault();
    const s = 4 / view.z;
    if (e.key === 'ArrowLeft') goal.lon -= s;
    if (e.key === 'ArrowRight') goal.lon += s;
    if (e.key === 'ArrowUp') goal.lat = clampLat(goal.lat + s);
    if (e.key === 'ArrowDown') goal.lat = clampLat(goal.lat - s);
  };
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerleave', onLeave);
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointerup', onUp);
  root.addEventListener('pointercancel', onCancel);
  root.addEventListener('wheel', onWheel, { passive: false });
  root.addEventListener('keydown', onKey);

  // Surface palette (RGB): night and day values are blended by sunlight
  const OCEAN_N = [5, 8, 18], OCEAN_D = [44, 66, 104];
  const LAND_N = [20, 25, 37], LAND_N2 = [27, 31, 42], LAND_D = [70, 82, 100], LAND_D2 = [88, 96, 108];
  const DESERT_N = [40, 33, 29], DESERT_D = [150, 128, 104];
  const GOLD_N = [96, 68, 20], GOLD_D = [180, 140, 60], GOLD_EDGE = [255, 206, 120];
  const CLOUD_N = [22, 28, 46], CLOUD_D = [236, 240, 248], ATM = [95, 155, 255];
  const box = (lat: number, lon: number, la0: number, la1: number, lo0: number, lo1: number, f = 3) =>
    smooth(la0 - f, la0 + f, lat) * (1 - smooth(la1 - f, la1 + f, lat)) * smooth(lo0 - f, lo0 + f, lon) * (1 - smooth(lo1 - f, lo1 + f, lon));
  // Sahara and Arabia, the Australian interior, the Gobi: the brown deserts of the night photos
  const desertAt = (lat: number, lon: number) => Math.max(box(lat, lon, 15, 31, -16, 57), box(lat, lon, -31, -20, 121, 141), box(lat, lon, 38, 46, 94, 112));
  const HALF = (() => { const h = [SUN[0], SUN[1], SUN[2] + 1], l = Math.hypot(h[0], h[1], h[2]); return h.map((v) => v / l); })();
  const smooth = (a: number, b: number, x: number) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

  // Paint the visible disk into the surface buffer: for each pixel, find its latitude and longitude,
  // then shade ocean / land / India, clouds, sun glint and the atmosphere toward the limb.
  const paintSurface = (cx: number, cy: number, R: number, S: number, t: number) => {
    const w = Math.max(1, Math.ceil(W * S)), h = Math.max(1, Math.ceil(H * S));
    if (surf.width !== w || surf.height !== h || !img) { surf.width = w; surf.height = h; img = sctx.createImageData(w, h); }
    const d = img.data; d.fill(0);
    const cL = Math.cos(view.lon * D), sL = Math.sin(view.lon * D), ct = Math.cos(view.lat * D), st = Math.sin(view.lat * D);
    const r = R * S, ox = cx * S, oy = cy * S, drift = reduce ? 0 : t * 0.7;
    for (let py = Math.max(0, Math.floor(oy - r)); py < h; py++) {
      const y = (oy - py - 0.5) / r;
      if (y <= -1 || y >= 1) continue;
      const half = Math.sqrt(1 - y * y) * r;
      for (let px = Math.max(0, Math.floor(ox - half)); px < Math.min(w, Math.ceil(ox + half)); px++) {
        const x = (px + 0.5 - ox) / r, r2 = x * x + y * y;
        if (r2 >= 1) continue;
        const z = Math.sqrt(1 - r2);
        const Y = y * ct + z * st, z1 = -y * st + z * ct, X = x * cL + z1 * sL, Z = z1 * cL - x * sL;
        const lat = Math.asin(Y) / D, lon = Math.atan2(X, Z) / D;
        const sun = x * SUN[0] + y * SUN[1] + z * SUN[2], day = smooth(-0.12, 0.32, sun);
        const landK = smooth(0.38, 0.62, landSoft(lat, lon));
        const ir = landK > 0.01 ? indiaSoft(lat, lon) : 0, indK = smooth(0.3, 0.7, ir);
        let cr = OCEAN_N[0] + (OCEAN_D[0] - OCEAN_N[0]) * day, cg = OCEAN_N[1] + (OCEAN_D[1] - OCEAN_N[1]) * day, cb = OCEAN_N[2] + (OCEAN_D[2] - OCEAN_N[2]) * day;
        if (landK > 0) {
          const n = smooth(0.3, 0.75, texAt(terrain, lat, lon));
          const nr = LAND_N[0] + (LAND_N2[0] - LAND_N[0]) * n, ng = LAND_N[1] + (LAND_N2[1] - LAND_N[1]) * n, nb = LAND_N[2] + (LAND_N2[2] - LAND_N[2]) * n;
          const dr = LAND_D[0] + (LAND_D2[0] - LAND_D[0]) * n, dg = LAND_D[1] + (LAND_D2[1] - LAND_D[1]) * n, db = LAND_D[2] + (LAND_D2[2] - LAND_D[2]) * n;
          let lr = nr + (dr - nr) * day, lg = ng + (dg - ng) * day, lb = nb + (db - nb) * day;
          const dk = desertAt(lat, lon) * (0.6 + 0.4 * n) * (1 - indK);
          if (dk > 0) {
            lr += (DESERT_N[0] + (DESERT_D[0] - DESERT_N[0]) * day - lr) * dk;
            lg += (DESERT_N[1] + (DESERT_D[1] - DESERT_N[1]) * day - lg) * dk;
            lb += (DESERT_N[2] + (DESERT_D[2] - DESERT_N[2]) * day - lb) * dk;
          }
          if (indK > 0) {
            const gr = GOLD_N[0] + (GOLD_D[0] - GOLD_N[0]) * day, gg = GOLD_N[1] + (GOLD_D[1] - GOLD_N[1]) * day, gb = GOLD_N[2] + (GOLD_D[2] - GOLD_N[2]) * day;
            const gk = indK * (0.32 + 0.1 * n);
            lr += (gr - lr) * gk; lg += (gg - lg) * gk; lb += (gb - lb) * gk;
          }
          cr += (lr - cr) * landK; cg += (lg - cg) * landK; cb += (lb - cb) * landK;
        }
        if (ir > 0.02 && ir < 0.98) {                                   // India's gold border
          const e = (1 - Math.abs(ir * 2 - 1)) ** 1.5 * 0.55;
          cr += (GOLD_EDGE[0] - cr) * e; cg += (GOLD_EDGE[1] - cg) * e; cb += (GOLD_EDGE[2] - cb) * e;
        }
        if (day > 0 && landK < 1) {                                     // sun glint on the water
          const spec = Math.max(0, x * HALF[0] + y * HALF[1] + z * HALF[2]) ** 70 * (1 - landK) * day * 190;
          cr += spec; cg += spec; cb += spec * 0.9;
        }
        const ck = smooth(0.47, 0.78, texAt(cloudTex, lat, lon - drift)) * (0.1 + 0.8 * day) * (1 - indK * 0.85);
        if (ck > 0) {
          const qr = CLOUD_N[0] + (CLOUD_D[0] - CLOUD_N[0]) * day, qg = CLOUD_N[1] + (CLOUD_D[1] - CLOUD_N[1]) * day, qb = CLOUD_N[2] + (CLOUD_D[2] - CLOUD_N[2]) * day;
          cr += (qr - cr) * ck; cg += (qg - cg) * ck; cb += (qb - cb) * ck;
        }
        const atm = (1 - z) ** 2.2 * 0.9, al = 0.45 + 0.55 * day;
        cr += (ATM[0] * al - cr) * atm; cg += (ATM[1] * al - cg) * atm; cb += (ATM[2] * al - cb) * atm;
        const i = (py * w + px) * 4;
        d[i] = cr; d[i + 1] = cg; d[i + 2] = cb; d[i + 3] = 255 * Math.min(1, (1 - Math.sqrt(r2)) * r * 1.5);
      }
    }
    sctx.putImageData(img, 0, 0);
  };

  const P = [0, 0, 0];
  let last = performance.now();
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!onScreen || !W) return;
    const t = reduce ? 8 : now / 1000;
    if (!reduce && introAt >= 0) intro = Math.min(1, (now - introAt) / 2400);
    const fade = (1 - (1 - intro) ** 3) * (earth ? earth.reveal(now) : 1);
    // Scroll progress through the stage: 0 as its top enters the viewport, 1 once its base reaches
    // the bottom of the viewport. The rim fills by this; eased so it glides with smooth scrolling.
    const box = root.getBoundingClientRect();
    const target = Math.max(0, Math.min(1, (window.innerHeight - box.top) / Math.max(1, box.height)));
    scrollP = reduce ? target : scrollP + (target - scrollP) * Math.min(1, dt * 6);

    // Geometry: a sphere whose cap fills the stage below the headline. Its centre sits below the
    // bottom edge, so the limb meets the footer line near both page edges. India is tilted up to sit
    // a little below the middle of the visible cap.
    const wide = W > 860;
    base = Math.max(120, Math.min((H - capTop) / 0.7, W * (wide ? 0.56 : 0.98)));
    const cx = W / 2, cy = H + base * 0.3, capY = cy - base;
    homeLat = INDIA_AT[0] - Math.asin(Math.min(0.98, (cy - (capY + (H - capY) * 0.55)) / base)) / D;

    if (!live && !reduce) {
      const lean = mouse.in ? 1 : 0;
      goal.lon = HOME_LON + Math.sin(t * 0.05) * 2 + lean * (mouse.x / W - 0.5) * 5;
      goal.lat = homeLat - lean * (mouse.y / H - 0.5) * 3;
    } else if (live && !drag && Math.abs(spin.lon) + Math.abs(spin.lat) > 0.002) {
      goal.lon += spin.lon; goal.lat = clampLat(goal.lat + spin.lat); spin.lon *= 0.93; spin.lat *= 0.93;
    }
    if (reduce && !live) { goal.lat = homeLat; view.lat = homeLat; }
    const ease = reduce ? 1 : drag ? 0.5 : intro < 1 ? 0.035 : 0.07;
    view.lon += (goal.lon - view.lon) * ease; view.lat += (goal.lat - view.lat) * ease; view.z += (goal.z - view.z) * 0.09;
    mouse.k += ((mouse.in && !drag ? 1 : 0) - mouse.k) * Math.min(1, dt * 7);

    const R = base * view.z, rot = rotator(view.lon, view.lat);
    const zs = Math.min(1.7, view.z) * Math.max(0.75, Math.min(1.25, base / 800));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Sky: fixed stars, a few twinkling
    ctx.fillStyle = '#FFFFFF';
    for (const st of stars) {
      if (earth) { const dx = st[0] * W - cx, dy = st[1] * H - cy; if (dx * dx + dy * dy < R * R * 1.02) continue; }
      const tw = reduce ? 1 : 0.6 + 0.4 * Math.sin(t * (0.5 + st[4]) + st[4] * 30);
      ctx.globalAlpha = st[3] * tw * fade;
      ctx.fillRect(st[0] * W, st[1] * H, st[2], st[2]);
    }
    ctx.globalAlpha = 1;

    // Atmosphere outside the limb
    const outer = ctx.createRadialGradient(cx, cy, R * 0.985, cx, cy, R * 1.09);
    outer.addColorStop(0, `rgba(110, 170, 255, ${0.92 * fade})`);
    outer.addColorStop(0.2, `rgba(80, 140, 250, ${0.36 * fade})`);
    outer.addColorStop(1, 'rgba(40, 90, 200, 0)');
    // (a ring only: inside its inner radius a radial gradient keeps its first colour, which would
    // otherwise wash the whole planet blue)
    ctx.fillStyle = outer; ctx.beginPath(); ctx.arc(cx, cy, R * 1.09, 0, Math.PI * 2); ctx.arc(cx, cy, R * 0.985, 0, Math.PI * 2, true); ctx.fill('evenodd');

    // The surface, painted per pixel at reduced resolution and scaled up (soft, like a photograph).
    // Repainted when the view moves, and a few times a second so the clouds drift.
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
    if (earth) {
      earth.render({ W, H, DPR, cx, cy, R, lon: view.lon, lat: view.lat, fade, t, mx: mouse.x, my: mouse.y, lens: mouse.k, sun: SUN });
    } else {
      const S = Math.min(0.6, Math.sqrt(260000 / Math.max(1, W * H)));
      const key = `${view.lon.toFixed(2)}|${view.lat.toFixed(2)}|${view.z.toFixed(3)}|${W}|${H}`;
      if ((key !== texKey && (t - texT > 0.033 || reduce)) || t - texT > 0.15 || !img) { texKey = key; texT = t; paintSurface(cx, cy, R, S, t); }
      ctx.globalAlpha = fade; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(surf, 0, 0, surf.width / S, surf.height / S);
    }
    const sunAt = () => P[0] * SUN[0] + P[1] * SUN[1] + P[2] * SUN[2];

    // A warm bloom over India so the gold reads as lit from within
    rot(indiaV[0], indiaV[1], indiaV[2], P);
    if (P[2] > 0) {
      const gx = cx + P[0] * R, gy = cy - P[1] * R, gr = R * 0.3;
      ctx.globalCompositeOperation = 'lighter';
      const bloom = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      bloom.addColorStop(0, `rgba(255, 186, 80, ${(earth ? 0.1 : 0.16) * fade})`); bloom.addColorStop(1, 'rgba(255, 186, 80, 0)');
      ctx.fillStyle = bloom; ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;

    // City lights (2D fallback only; with WebGL they come from the Black Marble imagery):
    // gold across India, faint cool white elsewhere; hidden on the day side
    ctx.globalCompositeOperation = 'lighter';
    const LR = 130, lk = mouse.k, mx = mouse.x, my = mouse.y;
    for (const L of earth ? [] : lights) {
      rot(L[0], L[1], L[2], P);
      if (P[2] <= 0.02) continue;
      const sx = cx + P[0] * R, sy = cy - P[1] * R;
      if (sy < -6 || sy > H + 6 || sx < -6 || sx > W + 6) continue;
      const nightK = 1 - Math.max(0, Math.min(1, (sunAt() + 0.08) / 0.32));
      if (nightK <= 0.02) continue;
      let boost = 0;
      if (lk > 0.01) { const d = Math.hypot(sx - mx, sy - my); if (d < LR) boost = (1 - d / LR) ** 2 * lk; }
      const tw = reduce ? 1 : 0.82 + 0.18 * Math.sin(t * 1.8 + L[4] * 50);
      const s = L[3] * (2.4 + boost * 2.5) * zs * (0.5 + 0.5 * P[2]);
      if (L[5]) {                                                   // India: gold
        ctx.globalAlpha = Math.min(1, nightK * tw * (0.5 + 0.5 * P[2]) * (0.9 + boost) * fade);
        ctx.drawImage(glow(L[3] > 1.2 || boost > 0.4 ? THEME.lightHot : THEME.light), sx - s, sy - s, s * 2, s * 2);
      } else {                                                      // everywhere else: faint, cool
        ctx.globalAlpha = Math.min(1, nightK * tw * (0.5 + 0.5 * P[2]) * (0.22 + boost * 0.4) * fade);
        ctx.drawImage(glow('#C4D6FF'), sx - s * 0.7, sy - s * 0.7, s * 1.4, s * 1.4);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.restore();

    // The limb itself: a crisp line of atmosphere
    ctx.globalAlpha = 0.75 * fade; ctx.strokeStyle = 'rgba(160, 205, 255, 1)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.globalAlpha = 1;

    // Routes: fine gold arcs drawn in on entry, each carrying a slow pulse into the core
    const f = pinned || hover, running = !reduce && intro >= 1;
    routes.forEach((r, i) => {
      rot(r.v[0], r.v[1], r.v[2], P);
      r.sx = cx + P[0] * R; r.sy = cy - P[1] * R; r.vis = P[2] > 0.03 && intro > 0.5 && r.sy < H - 4;
      const Q = r.pts.map((q) => { rot(q[0], q[1], q[2], P); return [cx + P[0] * R, cy - P[1] * R, visible(P) ? 1 : 0]; }), m = Q.length - 1;
      const on = !f || f === r.node || f === CORE, dim = on ? 1 : 0.25, focused = f === r.node;

      if (running) {
        if (r.next < 0) r.next = t + 0.4 + i * 0.5 + Math.random() * 2.5;
        if (r.start < 0 && t >= r.next) { r.start = t; r.launch = t; }
        if (r.start >= 0 && t - r.start >= r.dur) {
          r.start = -1; r.next = t + 2 + Math.random() * 6;
          landings.push(t); if (landings.length > 8) landings.shift();
        }
      }
      const p = r.start >= 0 ? (t - r.start) / r.dur : -1, e = p < 0 ? 0 : 0.5 - Math.cos(Math.PI * p) / 2;
      const drawn = Math.max(0, Math.min(1, intro * 2.2 - 0.7 - i * 0.025));
      const path = (to: number) => {
        ctx.beginPath();
        let pen = false;
        for (let k = 0; k <= Math.min(m, to); k++) {
          const q = Q[k];
          if (!q[2]) { pen = false; continue; }
          if (pen) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]);
          pen = true;
        }
        ctx.stroke();
      };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.globalAlpha = dim; ctx.strokeStyle = focused ? THEME.arcFocus : THEME.arc; ctx.lineWidth = focused ? 1.6 : 1;
      path(m * drawn);

      if (p >= 0 && running) {
        const head = e * m, L = m * 0.2, from = Math.max(0, head - L);
        ctx.strokeStyle = THEME.arcHot;
        for (let k = Math.floor(from); k < head; k++) {
          const a = Q[k], b = Q[Math.min(m, k + 1)];
          if (!a[2] || !b[2]) continue;
          const u = (k - from) / L;
          ctx.globalAlpha = dim * u ** 1.5; ctx.lineWidth = 0.5 + 1.9 * u;
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        }
        const hq = Q[Math.min(m, Math.round(head))];
        if (hq[2]) {
          ctx.globalAlpha = dim; ctx.drawImage(glow(THEME.glow), hq[0] - 10, hq[1] - 10, 20, 20);
          ctx.fillStyle = THEME.head; ctx.beginPath(); ctx.arc(hq[0], hq[1], 1.4, 0, 7); ctx.fill();
        }
      }
      if (r.vis && drawn > 0.98) {                                   // glowing endpoint
        const lk2 = Math.min(1, (t - r.launch) / 1.2);
        if (lk2 < 1) { ctx.globalAlpha = dim * (1 - lk2) ** 2 * 0.7; ctx.strokeStyle = THEME.arc; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(r.sx, r.sy, 3 + lk2 * 14, 0, 7); ctx.stroke(); }
        ctx.globalAlpha = dim * (focused ? 1 : 0.85); ctx.drawImage(glow(THEME.glow), r.sx - 8, r.sy - 8, 16, 16);
        ctx.fillStyle = THEME.head; ctx.beginPath(); ctx.arc(r.sx, r.sy, focused ? 2.4 : 1.7, 0, 7); ctx.fill();
        if (focused || live) {
          ctx.font = `600 ${focused ? 11 : 9.5}px ui-monospace, "SF Mono", Menlo, monospace`;
          if ('letterSpacing' in ctx) ctx.letterSpacing = '0.1em';
          ctx.globalAlpha = focused ? 1 : 0.7; ctx.fillStyle = THEME.label;
          ctx.fillText(r.node.name.toUpperCase(), r.sx + 8, r.sy - 7);
          if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
        }
      }
      ctx.globalAlpha = 1;
    });

    // The core: a white-hot point in a gold halo that swells as pulses land
    rot(coreV[0], coreV[1], coreV[2], P);
    coreHit.sx = cx + P[0] * R; coreHit.sy = cy - P[1] * R; coreHit.vis = P[2] > 0.03 && intro > 0.5;
    if (P[2] > 0.03) {
      const hx = coreHit.sx, hy = coreHit.sy, lastL = landings.length ? t - landings[landings.length - 1] : 9;
      const beat = Math.max(0, 1 - lastL / 0.9);
      for (const lt of landings) {
        const k = (t - lt) / 1.8;
        if (k < 0 || k >= 1) continue;
        ctx.globalAlpha = fade * (1 - k) ** 2 * 0.7; ctx.strokeStyle = THEME.arc; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(hx, hy, 10 + (1 - (1 - k) ** 3) * 42, 0, 7); ctx.stroke();
      }
      ctx.globalAlpha = fade * (0.85 + 0.15 * beat); ctx.drawImage(glow(THEME.glow), hx - 34, hy - 34, 68, 68);
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = fade; ctx.drawImage(glow('#FFF4DC'), hx - 16, hy - 16, 32, 32);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(hx, hy, 3.6 + beat, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255, 205, 120, 0.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(hx, hy, 6 + beat, 0, 7); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // The horizon line the globe rests on
    const line = ctx.createLinearGradient(0, 0, W, 0);
    line.addColorStop(0, 'rgba(140, 185, 255, 0)');
    line.addColorStop(0.18, 'rgba(140, 185, 255, 0.35)');
    line.addColorStop(0.5, 'rgba(140, 185, 255, 0.8)');
    line.addColorStop(0.82, 'rgba(140, 185, 255, 0.35)');
    line.addColorStop(1, 'rgba(140, 185, 255, 0)');
    ctx.globalAlpha = fade; ctx.fillStyle = line; ctx.fillRect(0, H - 1, W, 1);
    ctx.globalAlpha = 1;

    // The rim: a blue outline along the limb, horizon to horizon. A faint track shows the whole
    // edge; the lit part fills from the left horizon, over the top, to the right with scroll.
    const s0 = Math.min(0.999, (cy - H) / R), a0 = Math.asin(s0);
    const from = Math.PI + a0, span = Math.PI - 2 * a0, to = from + span * scrollP;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.16 * fade; ctx.strokeStyle = '#7FB2FF'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, from, from + span); ctx.stroke();
    if (scrollP > 0.002) {
      // Metallic banding: dark and light blues alternate so the thin line reads as polished,
      // with a white highlight at the crown.
      const rim = ctx.createConicGradient(from, cx, cy), k = span / (2 * Math.PI);
      [['#1E3A8A', 0], ['#3B82F6', 0.12], ['#C7DDFF', 0.24], ['#2563EB', 0.36], ['#FFFFFF', 0.5],
       ['#60A5FA', 0.64], ['#DBEAFE', 0.76], ['#1D4ED8', 0.88], ['#1E3A8A', 1]].forEach(([c, u]) => rim.addColorStop(k * (u as number), c as string));
      rim.addColorStop(Math.min(1, k + 0.001), '#1E3A8A');
      ctx.strokeStyle = rim; ctx.lineCap = 'butt';
      ctx.save(); ctx.globalAlpha = 0.22 * fade; ctx.lineWidth = 8; ctx.filter = 'blur(8px)';
      ctx.beginPath(); ctx.arc(cx, cy, R, from, to); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.45 * fade; ctx.lineWidth = 2.2; ctx.filter = 'blur(1.5px)';
      ctx.beginPath(); ctx.arc(cx, cy, R, from, to); ctx.stroke(); ctx.restore();
      ctx.globalAlpha = fade; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, from, to); ctx.stroke();

      // A glint: a short white highlight that slides along the lit part every few seconds
      if (!reduce) {
        const cyc = (t * 0.16) % 1.4;
        if (cyc < 1) {
          const lit = to - from, c = from + lit * cyc, len = Math.min(lit, span * 0.07);
          ctx.strokeStyle = '#FFFFFF';
          for (let j = 0; j < 4; j++) {
            const l = len * (1 - j * 0.22);
            ctx.globalAlpha = fade * (0.18 + j * 0.2) * Math.sin(Math.PI * cyc);
            ctx.lineWidth = 1 + (3 - j) * 0.35;
            ctx.beginPath(); ctx.arc(cx, cy, R, Math.max(from, c - l / 2), Math.min(to, c + l / 2)); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1; ctx.lineCap = 'round';
    }
  };
  raf = requestAnimationFrame(frame);

  return {
    setLive,
    recenter,
    destroy() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); earth?.destroy();
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
