// The sample Café Demand Index behind the demand map (BrandFeatures.tsx): how hot café demand runs in 43 Indian
// cities for three of a brand's products, now and four weeks out, scored 0–300 in bands like an air-quality index.
// Each product has its own geography: oat milk peaks in the southern and western coffee cities, cold brew in the
// hot tech cities and climbs into summer, almond milk in the north. City positions are real; café counts, scores
// and batch sizes are samples, and the product names are generic.
import { INDIA, project } from './india-map';

/** The map's box: India plus a margin for the labels. */
export const VIEW = { x: -34, y: -12, w: INDIA.w + 68, h: INDIA.h + 36 };

type CityAt = { id: string; name: string; lon: number; lat: number; cafes: number; side?: 'l' };
const AT: CityAt[] = [
  { id: 'del', name: 'Delhi NCR', lon: 77.21, lat: 28.61, cafes: 3100 },
  { id: 'bom', name: 'Mumbai', lon: 72.88, lat: 19.08, cafes: 2600, side: 'l' },
  { id: 'blr', name: 'Bengaluru', lon: 77.59, lat: 12.97, cafes: 2400, side: 'l' },
  { id: 'hyd', name: 'Hyderabad', lon: 78.49, lat: 17.39, cafes: 1500 },
  { id: 'pnq', name: 'Pune', lon: 73.86, lat: 18.52, cafes: 1300 },
  { id: 'maa', name: 'Chennai', lon: 80.27, lat: 13.08, cafes: 1200 },
  { id: 'ccu', name: 'Kolkata', lon: 88.36, lat: 22.57, cafes: 1100 },
  { id: 'amd', name: 'Ahmedabad', lon: 72.57, lat: 23.02, cafes: 800, side: 'l' },
  { id: 'jai', name: 'Jaipur', lon: 75.79, lat: 26.91, cafes: 600, side: 'l' },
  { id: 'ixc', name: 'Chandigarh', lon: 76.78, lat: 30.73, cafes: 520 },
  { id: 'goi', name: 'Goa', lon: 73.83, lat: 15.49, cafes: 480, side: 'l' },
  { id: 'cok', name: 'Kochi', lon: 76.27, lat: 9.93, cafes: 450, side: 'l' },
  { id: 'lko', name: 'Lucknow', lon: 80.95, lat: 26.85, cafes: 400 },
  { id: 'idr', name: 'Indore', lon: 75.86, lat: 22.72, cafes: 380 },
  { id: 'cjb', name: 'Coimbatore', lon: 76.96, lat: 11.02, cafes: 300, side: 'l' },
  { id: 'mys', name: 'Mysuru', lon: 76.64, lat: 12.3, cafes: 260, side: 'l' },
  { id: 'vtz', name: 'Visakhapatnam', lon: 83.22, lat: 17.69, cafes: 240 },
  { id: 'bbi', name: 'Bhubaneswar', lon: 85.82, lat: 20.3, cafes: 220 },
  { id: 'gau', name: 'Guwahati', lon: 91.74, lat: 26.14, cafes: 200 },
  { id: 'ddn', name: 'Dehradun', lon: 78.03, lat: 30.32, cafes: 240 },
  { id: 'nag', name: 'Nagpur', lon: 79.09, lat: 21.15, cafes: 210 },
  { id: 'stv', name: 'Surat', lon: 72.83, lat: 21.17, cafes: 260, side: 'l' },
  { id: 'bdq', name: 'Vadodara', lon: 73.18, lat: 22.31, cafes: 200 },
  { id: 'trv', name: 'Thiruvananthapuram', lon: 76.94, lat: 8.52, cafes: 220 },
  { id: 'ixe', name: 'Mangaluru', lon: 74.86, lat: 12.91, cafes: 180, side: 'l' },
  { id: 'shl', name: 'Shillong', lon: 91.89, lat: 25.58, cafes: 120 },
  { id: 'atq', name: 'Amritsar', lon: 74.87, lat: 31.63, cafes: 160, side: 'l' },
  { id: 'luh', name: 'Ludhiana', lon: 75.86, lat: 30.9, cafes: 180, side: 'l' },
  { id: 'bho', name: 'Bhopal', lon: 77.41, lat: 23.26, cafes: 190 },
  { id: 'knu', name: 'Kanpur', lon: 80.33, lat: 26.45, cafes: 140, side: 'l' },
  { id: 'pat', name: 'Patna', lon: 85.14, lat: 25.59, cafes: 150 },
  { id: 'ixr', name: 'Ranchi', lon: 85.31, lat: 23.34, cafes: 110 },
  { id: 'rpr', name: 'Raipur', lon: 81.63, lat: 21.25, cafes: 100 },
  { id: 'udr', name: 'Udaipur', lon: 73.71, lat: 24.59, cafes: 160, side: 'l' },
  { id: 'sxr', name: 'Srinagar', lon: 74.8, lat: 34.08, cafes: 90, side: 'l' },
  { id: 'ixl', name: 'Leh', lon: 77.58, lat: 34.15, cafes: 60 },
  { id: 'gtk', name: 'Gangtok', lon: 88.61, lat: 27.33, cafes: 80 },
  { id: 'pny', name: 'Puducherry', lon: 79.81, lat: 11.94, cafes: 140 },
  { id: 'ixm', name: 'Madurai', lon: 78.12, lat: 9.93, cafes: 120 },
  { id: 'isk', name: 'Nashik', lon: 73.79, lat: 20, cafes: 120 },
  { id: 'vns', name: 'Varanasi', lon: 82.97, lat: 25.32, cafes: 130 },
  { id: 'imf', name: 'Imphal', lon: 93.94, lat: 24.82, cafes: 50 },
  { id: 'ixz', name: 'Port Blair', lon: 92.73, lat: 11.62, cafes: 40, side: 'l' },
];

/** Each city on the map, and how far its demand spreads (in map units), which grows with its cafés. */
export const CITIES = AT.map((c) => ({ ...c, ...project(c.lon, c.lat), r: 56 + 14 * Math.sqrt(c.cafes / 100) }));
export const CAFES_TRACKED = AT.reduce((s, c) => s + c.cafes, 0);

type Scores = Record<string, readonly [number, number]>;
export type Product = { id: string; short: string; name: string; k: number; scores: Scores };

// each city's index now and four weeks out; k turns an index and a café count into litres a month
export const PRODUCTS: Product[] = [
  {
    id: 'oat', short: 'Oat Milk', name: 'Barista Oat Milk · 1 L', k: 0.0051,
    scores: {
      blr: [182, 196], bom: [171, 180], del: [164, 178], pnq: [148, 162], hyd: [139, 151], goi: [128, 133], ixc: [118, 129],
      maa: [112, 124], cok: [104, 113], ccu: [96, 108], jai: [92, 101], amd: [88, 97], mys: [86, 91], ddn: [77, 85],
      cjb: [74, 82], pny: [72, 76], idr: [71, 84], lko: [68, 79], udr: [66, 71], trv: [63, 70], ixe: [61, 66], shl: [58, 63],
      vtz: [54, 60], gau: [52, 61], stv: [51, 58], bbi: [49, 57], luh: [48, 55], bdq: [47, 53], nag: [46, 52], gtk: [45, 48],
      atq: [44, 49], vns: [43, 49], bho: [42, 50], ixm: [41, 46], sxr: [39, 42], isk: [38, 44], ixl: [35, 30], knu: [33, 38],
      pat: [31, 37], ixr: [29, 34], ixz: [28, 30], rpr: [27, 31], imf: [24, 27],
    },
  },
  {
    id: 'brew', short: 'Cold Brew', name: 'Cold Brew Concentrate · 1 L', k: 0.0035,
    scores: {
      blr: [168, 189], hyd: [161, 184], bom: [158, 176], pnq: [152, 170], maa: [149, 173], del: [131, 170], goi: [124, 140],
      amd: [112, 141], cok: [102, 118], ccu: [98, 121], ixc: [92, 118], jai: [84, 112], stv: [81, 102], cjb: [78, 90],
      pny: [76, 88], vtz: [72, 89], trv: [70, 79], ixe: [68, 77], idr: [66, 84], bdq: [64, 80], mys: [62, 70], lko: [61, 80],
      nag: [58, 82], ixm: [57, 68], bbi: [55, 71], ddn: [52, 63], udr: [49, 62], bho: [47, 63], isk: [46, 58], luh: [45, 60],
      vns: [44, 58], gau: [41, 50], atq: [40, 52], knu: [38, 52], pat: [36, 49], rpr: [35, 47], ixz: [34, 38], ixr: [33, 42],
      shl: [30, 34], gtk: [26, 29], imf: [25, 29], sxr: [22, 27], ixl: [18, 22],
    },
  },
  {
    id: 'almond', short: 'Almond Milk', name: 'Almond Milk · 1 L', k: 0.0033,
    scores: {
      del: [176, 184], ixc: [158, 163], jai: [141, 146], bom: [138, 141], amd: [132, 139], lko: [129, 136], luh: [121, 127],
      atq: [118, 124], idr: [112, 118], blr: [109, 112], pnq: [104, 108], ddn: [98, 102], sxr: [92, 95], udr: [88, 91],
      ccu: [87, 90], bdq: [86, 90], stv: [84, 88], hyd: [83, 86], knu: [81, 86], bho: [79, 84], vns: [72, 77], isk: [68, 72],
      nag: [64, 68], maa: [62, 64], pat: [61, 66], goi: [58, 60], bbi: [52, 55], ixr: [49, 52], cok: [48, 50], rpr: [47, 50],
      vtz: [46, 48], mys: [44, 46], gau: [44, 47], cjb: [42, 45], ixe: [41, 43], ixl: [41, 43], trv: [39, 41], pny: [37, 39],
      gtk: [36, 38], ixm: [35, 37], shl: [33, 35], imf: [21, 23], ixz: [19, 20],
    },
  },
];

/** A city's index for a product, `t` of the way from now (0) to four weeks out (1). */
export const scoreAt = (p: Product, id: string, t: number) => { const [a, b] = p.scores[id]; return a + (b - a) * t; };

/** Next month's batch for a city: what the forecast says to make, and what you'd have made without it. */
export function batch(p: Product, id: string) {
  const c = AT.find((q) => q.id === id)!;
  const make = Math.max(100, Math.round((c.cafes * p.scores[id][1] * p.k) / 100) * 100);
  const step = make >= 1000 ? 500 : 50;
  return { make, usual: Math.max(make + step, Math.round((make * 1.65) / step) * step) };
}

/** Each neighbourhood's index now and in four weeks, per product, in the order of AREAS in ./trial-data.ts. Sample figures. */
export const AREA_DEMAND: Record<string, [number, number][]> = {
  oat: [[148, 160], [176, 184], [121, 138], [188, 201], [171, 186], [109, 121], [142, 150], [158, 166], [97, 104]],
  brew: [[102, 110], [184, 199], [133, 151], [162, 170], [192, 214], [118, 124], [96, 103], [149, 161], [88, 93]],
  almond: [[84, 90], [139, 147], [92, 104], [151, 163], [128, 140], [64, 71], [117, 122], [133, 146], [106, 118]],
};

export const BANDS = [
  { label: 'Low', to: 50 },
  { label: 'Moderate', to: 100 },
  { label: 'High', to: 150 },
  { label: 'Very high', to: 200 },
  { label: 'Peak', to: 300 },
] as const;
export const bandOf = (v: number) => BANDS.find((b) => v <= b.to) ?? BANDS[BANDS.length - 1];

// ---------- the heat colours: one hue, deep indigo through the brand violet to lilac, a warm white at the core ----------
export const STOPS: [number, string][] = [
  [0, '#160E3D'], [0.14, '#24156B'], [0.3, '#3B23A8'], [0.46, '#5B3BD6'],
  [0.6, '#8667EE'], [0.74, '#B6A0FA'], [0.87, '#E2D8FF'], [1, '#FFF7EC'],
];
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** 256 colours, RGB packed in threes, for the heat at 0…1. */
export const LUT = (() => {
  const out = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const v = i / 255, k = STOPS.findIndex(([at]) => at >= v), [a0, c0] = STOPS[Math.max(0, k - 1)], [a1, c1] = STOPS[k];
    const f = a1 === a0 ? 0 : (v - a0) / (a1 - a0), A = hex(c0), B = hex(c1);
    for (let j = 0; j < 3; j++) out[i * 3 + j] = Math.round(A[j] + (B[j] - A[j]) * f);
  }
  return out;
})();
/** The heat colour for an index (0–300), optionally washed towards white. */
export function heat(v: number, white = 0) {
  const i = Math.round(Math.min(1, Math.max(0, v / 300)) * 255) * 3;
  const [r, g, b] = [0, 1, 2].map((j) => Math.round(LUT[i + j] + (255 - LUT[i + j]) * white));
  return `rgb(${r} ${g} ${b})`;
}
export const RAMP = `linear-gradient(90deg, ${STOPS.map(([at, c]) => `${c} ${at * 100}%`).join(', ')})`;
