// The sample trial behind the brand dashboard (BrandDashboard.tsx, TrialMap.tsx): 120 cafés across
// Delhi NCR, the 9 suppliers who carry the kits on delivery runs they already make, and the day each café
// got its kit, tried it, rated it and started ordering every week. The 8 named cafés are written out by
// hand; the rest come from a fixed seed, so the server and the browser build the same map. Café and
// supplier names are made up and every figure is a sample.

export const DAYS = 21;
export const KITS = 120;

export type Stage = 'delivered' | 'tried' | 'rated' | 'order';
export type Hub = { name: string; x: number; y: number; kits: number };
export type Cafe = {
  id: number;
  name: string | null; // only the named cafés can be hovered
  area: string;
  x: number;
  y: number;
  hub: number; // index into HUBS: the supplier that already delivers to this café
  ship: number; // the day its kit leaves the supplier
  d: number; // the day it's delivered
  t: number | null; // a barista tries it (null: never)
  r: number | null; // they rate it
  o: number | null; // the café starts ordering every week
  stars: number | null;
  litres: number | null; // a week, once it orders
};

// neighbourhoods, where their cafés cluster and where their name sits on the map
export const AREAS = [
  { name: 'Rajouri Garden', x: 322, y: 70, n: 8, lx: 372, ly: 50 },
  { name: 'Connaught Place', x: 248, y: 122, n: 12, lx: 222, ly: 86 },
  { name: 'Noida', x: 190, y: 172, n: 6, lx: 170, ly: 204 },
  { name: 'Hauz Khas', x: 402, y: 150, n: 22, lx: 402, ly: 112 },
  { name: 'Gurugram', x: 552, y: 146, n: 12, lx: 552, ly: 110 },
  { name: 'Kamla Nagar', x: 364, y: 216, n: 22, lx: 356, ly: 257 },
  { name: 'Lajpat Nagar', x: 420, y: 276, n: 14, lx: 470, ly: 312 },
  { name: 'Saket', x: 282, y: 232, n: 14, lx: 252, ly: 196 },
  { name: 'Vasant Kunj', x: 262, y: 298, n: 10, lx: 314, ly: 306 },
];

const HUB_AT: [string, number, number][] = [
  ['Sharma Dairy', 448, 110],
  ['Fresh Lane Foods', 336, 186],
  ['Hill Roasters', 224, 214],
  ['Northgate Dairy', 272, 80],
  ['Yamuna Provisions', 184, 124],
  ['Eastline Supply', 510, 188],
  ['Lakeside Foods', 480, 258],
  ['Southfield Dairy', 212, 300],
  ['Old Market Traders', 330, 130],
];

const NAMED: Omit<Cafe, 'id' | 'x' | 'y' | 'hub' | 'ship'>[] = [
  { name: 'Little Brew Room', area: 'Hauz Khas', d: 1.9, t: 2.8, r: 4.7, stars: 4.8, o: 10.6, litres: 24 },
  { name: 'Tiny Tamper', area: 'Hauz Khas', d: 4.6, t: 8.7, r: 12.7, stars: 4.5, o: 19.6, litres: 20 },
  { name: 'Second Crack Coffee', area: 'Kamla Nagar', d: 2.2, t: 3.6, r: 5.8, stars: 4.6, o: 13.4, litres: 18 },
  { name: 'Slow Sip', area: 'Kamla Nagar', d: 5.4, t: 9.6, r: null, stars: null, o: null, litres: null },
  { name: 'Morning Ritual', area: 'Saket', d: 2.7, t: 5.6, r: 8.6, stars: 4.9, o: 14.7, litres: 30 },
  { name: 'Copper Kettle', area: 'Lajpat Nagar', d: 3.1, t: 4.8, r: 7.7, stars: 4.2, o: null, litres: null },
  { name: 'Brew & Bloom', area: 'Gurugram', d: 3.8, t: 6.7, r: 9.6, stars: 3.8, o: null, litres: null },
  { name: 'Steam Theory', area: 'Connaught Place', d: 3.6, t: 7.6, r: 11.6, stars: 4.7, o: 17.8, litres: 12 },
];

// the city's outline, smoothed into curves below
const LAND_AT = [
  [318, 22], [392, 34], [452, 60], [520, 78], [590, 100], [620, 144], [604, 190], [546, 210], [500, 234], [486, 284],
  [456, 326], [392, 346], [318, 348], [254, 342], [208, 322], [182, 284], [154, 240], [136, 190], [136, 142], [158, 98],
  [204, 62], [258, 34],
];
export const LAKES = [
  { cx: 354, cy: 162, rx: 8, ry: 5, rot: -10 },
  { cx: 446, cy: 228, rx: 17, ry: 6.5, rot: -20 },
  { cx: 298, cy: 54, rx: 9, ry: 4.5, rot: 8 },
  { cx: 322, cy: 252, rx: 6, ry: 3.5, rot: 0 },
];

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const unsmooth = (y: number) => 0.5 - Math.sin(Math.asin(1 - 2 * y) / 3); // the inverse of smoothstep
const r1 = (v: number) => Math.round(v * 10) / 10;
const r2 = (v: number) => Math.round(v * 100) / 100;

function smoothLoop(pts: number[][]) {
  const n = pts.length, at = (i: number) => pts[(i + n) % n];
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const [a, b, c, e] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    d += `C${r1(b[0] + (c[0] - a[0]) / 6)} ${r1(b[1] + (c[1] - a[1]) / 6)} ${r1(c[0] - (e[0] - b[0]) / 6)} ${r1(c[1] - (e[1] - b[1]) / 6)} ${c[0]} ${c[1]}`;
  }
  return d + 'Z';
}

function build() {
  const rand = rng(20261028);
  const hubs: Hub[] = HUB_AT.map(([name, x, y]) => ({ name, x, y, kits: 0 }));
  const cafes: Cafe[] = [];

  // cafés sit on a sunflower spiral around their neighbourhood, so they spread evenly without overlapping;
  // the named ones take spots 0 and 4, near the middle
  for (const a of AREAS) {
    const R = 5 * Math.sqrt(a.n) + 8, turn = rand() * Math.PI * 2, named = NAMED.filter((c) => c.area === a.name);
    for (let i = 0; i < a.n; i++) {
      const rr = R * Math.sqrt((i + 0.6) / a.n), th = turn + i * 2.39996;
      const x = r1(a.x + rr * Math.cos(th) * 1.18 + (rand() - 0.5) * 2);
      const y = r1(a.y + rr * Math.sin(th) * 0.86 + (rand() - 0.5) * 2);
      const n = i % 4 === 0 ? named[i / 4] : undefined;
      cafes.push({
        id: cafes.length, name: null, area: a.name, x, y, hub: 0, ship: 1, d: 0,
        t: null, r: null, o: null, stars: null, litres: null, ...n,
      });
    }
  }

  // each café gets its kit from the nearest supplier
  const dist = (c: Cafe) => Math.hypot(c.x - hubs[c.hub].x, c.y - hubs[c.hub].y);
  for (const c of cafes) {
    let best = Infinity;
    hubs.forEach((h, i) => { const k = Math.hypot(c.x - h.x, c.y - h.y); if (k < best) { best = k; c.hub = i; } });
    hubs[c.hub].kits++;
  }

  const gen = cafes.filter((c) => !c.name);
  // deliveries run from day 1.5 to day 6, shorter routes first (give or take)
  gen.map((c) => [c, dist(c) / 90 + rand() * 1.4] as const).sort((a, b) => a[1] - b[1])
    .forEach(([c], k) => { c.d = r2(1.5 + 4.4 * unsmooth((k + 0.5) / gen.length)); });
  for (const c of cafes) c.ship = r2(Math.max(1, c.d - 0.45 - dist(c) / 70 - rand() * 0.4));

  // the keenest cafés try it sooner, rate it sooner and are the ones that go on to order
  const keen = new Map(gen.map((c) => [c, rand()]));
  const byKeen = [...gen].sort((a, b) => keen.get(b)! - keen.get(a)!);
  byKeen.forEach((c, k) => {
    const e = keen.get(c)!;
    if (k < 96) c.t = r2(c.d + 0.6 + (1 - e) * 2.8 + rand() * 0.6);
    if (k < 81) {
      c.r = r2(c.t! + 1.1 + (1 - e) * 3 + rand() * 0.8);
      c.stars = Math.min(5, Math.max(3.5, r1(3.5 + e * 1.4 + (rand() - 0.5) * 0.4)));
    }
  });
  const orderers = byKeen.slice(0, 26).sort((a, b) => a.r! - b.r!);
  orderers.forEach((c, k) => {
    c.o = r2(Math.min(20.9, Math.max(10.3 + 10.4 * unsmooth((k + 0.5) / orderers.length), c.r! + 1.5)));
    c.stars = Math.max(c.stars!, 4.4);
  });

  // nudge the generated ratings so the 88 reviews average 4.6
  const rated = cafes.filter((c) => c.stars !== null), mine = rated.filter((c) => !c.name);
  for (let i = 0; i < 4; i++) {
    const gap = 4.6 - rated.reduce((s, c) => s + c.stars!, 0) / rated.length;
    for (const c of mine) c.stars = Math.min(5, Math.max(3.5, r1(c.stars! + (gap * rated.length) / mine.length)));
  }

  // weekly orders of 8 to 16 litres, scaled so all 31 cafés add up to 420 L a week
  const want = 420 - cafes.reduce((s, c) => s + (c.name && c.litres ? c.litres : 0), 0);
  const raw = orderers.map(() => 8 + Math.floor(rand() * 5) * 2), sum = raw.reduce((s, v) => s + v, 0);
  orderers.forEach((c, k) => { c.litres = Math.round((raw[k] * want) / sum); });
  orderers[orderers.length - 1].litres! += want - orderers.reduce((s, c) => s + c.litres!, 0);

  return { hubs, cafes };
}

const built = build();
export const HUBS = built.hubs;
export const CAFES = built.cafes;

/**
 * The map drawn for a panel of a given shape. The city is laid out about 484 × 326; `sx` stretches it
 * sideways to fill a wide panel. Neighbourhoods, suppliers, lakes and the outline move with the stretch,
 * but each neighbourhood's cluster of cafés only widens a little, so the clusters stay round.
 */
export function mapGeometry(sx: number) {
  const CX = 378, X = (x: number) => r1(CX + (x - CX) * sx), spread = 1 + (sx - 1) * 0.35;
  const at = new Map(AREAS.map((a) => [a.name, a]));
  const hubs = HUBS.map((h) => ({ x: X(h.x), y: h.y }));
  const cafes = CAFES.map((c) => {
    const a = at.get(c.area)!, h = hubs[c.hub], x = r1(X(a.x) + (c.x - a.x) * spread), dx = x - h.x, dy = c.y - h.y;
    // the kit's route: a gentle clockwise arc from the supplier
    return { x, y: c.y, route: `M${h.x} ${h.y}Q${r1((h.x + x) / 2 - dy * 0.22)} ${r1((h.y + c.y) / 2 + dx * 0.22)} ${x} ${c.y}` };
  });
  return {
    hubs,
    cafes,
    land: smoothLoop(LAND_AT.map(([x, y]) => [X(x), y])),
    areas: AREAS.map((a) => ({ name: a.name, x: X(a.lx), y: a.ly })),
    lakes: LAKES.map((l) => ({ ...l, cx: X(l.cx), rx: r1(l.rx * sx) })),
    road: { cx: X(370), cy: 196, rx: r1(162 * sx), ry: 120 },
    viewBox: `${r1(CX - 242 * sx - 30)} -26 ${r1(484 * sx + 60)} 404`,
  };
}
/** The stretch and marker size that fit the map to a panel `w` × `h` px. */
export function mapFit(w: number, h: number) {
  const sx = Math.round(Math.min(1.9, Math.max(1, ((w / h) * 404 - 60) / 484)) * 20) / 20;
  const scale = Math.min(w / (484 * sx + 60), h / 404);
  return { sx, ms: Math.round(Math.min(1.6, Math.max(1, 0.8 / scale)) * 10) / 10 };
}

/** Where the trial stands on a given (fractional) day. */
export function tally(day: number) {
  let delivered = 0, tried = 0, rated = 0, order = 0, stars = 0, litres = 0;
  for (const c of CAFES) {
    if (c.d <= day) delivered++;
    if (c.t !== null && c.t <= day) tried++;
    if (c.r !== null && c.r <= day) { rated++; stars += c.stars!; }
    if (c.o !== null && c.o <= day) { order++; litres += c.litres!; }
  }
  return { delivered, tried, rated, order, litres, avg: rated ? stars / rated : null };
}

export function stageOf(c: Cafe, day: number) {
  if (c.o !== null && c.o <= day) return { k: 'order', label: 'Orders weekly' } as const;
  if (c.r !== null && c.r <= day) return { k: 'rated', label: 'Rated it' } as const;
  if (c.t !== null && c.t <= day) return { k: 'tried', label: 'Tried it' } as const;
  if (c.d <= day) return { k: 'delivered', label: 'Kit delivered' } as const;
  return { k: 'way', label: c.ship <= day ? 'Kit on the way' : 'Kit packed' } as const;
}

const named = (name: string) => CAFES.find((c) => c.name === name)!;
const nth = (vals: (number | null)[], n: number) => (vals.filter((v) => v !== null) as number[]).sort((a, b) => a - b)[n - 1];
const allIn = Math.max(...CAFES.map((c) => c.d));
const hundred = nth(CAFES.map((c) => c.t), 100);
const firstOrder = nth(CAFES.map((c) => c.o), 1);
const lastReview = nth(CAFES.map((c) => c.r), 88);

export type TrialEvent = { id: string; day: number; icon: keyof typeof ICONS; title: string; meta: string };
const orderEvent = (name: string): TrialEvent => {
  const c = named(name);
  return { id: `o-${c.id}`, day: c.o!, icon: 'repeat', title: `${name} now orders weekly`, meta: `${c.litres} L a week · via ${HUBS[c.hub].name}` };
};
const rateEvent = (name: string, meta: string): TrialEvent => {
  const c = named(name);
  return { id: `r-${c.id}`, day: c.r!, icon: 'star', title: `${name} rated it ${c.stars!.toFixed(1)}`, meta };
};
const EVENT_LIST: TrialEvent[] = [
  { id: 'ship', day: 1.05, icon: 'truck', title: `${KITS} kits left ${HUBS.length} suppliers`, meta: 'On delivery runs they already make' },
  { id: 'first', day: named('Little Brew Room').d, icon: 'box', title: 'Kit delivered to Little Brew Room', meta: `Hauz Khas · via ${HUBS[named('Little Brew Room').hub].name}` },
  rateEvent('Little Brew Room', '“Holds a rosetta better than ours”'),
  { id: 'all', day: allIn, icon: 'check', title: `All ${KITS} kits delivered`, meta: 'No couriers, no extra trips' },
  rateEvent('Copper Kettle', 'Wants a better price on a case'),
  { id: 'hundred', day: hundred, icon: 'cup', title: '100 baristas have tried it', meta: `In ${Math.round(hundred)} days, across 9 neighbourhoods` },
  rateEvent('Morning Ritual', '“Steams silky and never splits”'),
  orderEvent('Little Brew Room'),
  orderEvent('Second Crack Coffee'),
  { id: 'reviews', day: lastReview, icon: 'star', title: '88 baristas have rated it', meta: 'Average 4.6 out of 5' },
  orderEvent('Morning Ritual'),
  orderEvent('Steam Theory'),
  orderEvent('Tiny Tamper'),
  { id: 'done', day: DAYS, icon: 'check', title: 'Trial complete', meta: '31 cafés now order every week' },
];
export const EVENTS = EVENT_LIST.sort((a, b) => a.day - b.day);

/** The day the first café starts ordering every week. */
export const FIRST_ORDER = firstOrder;

/**
 * Gradient's forecast of the weekly orders, made from each area's demand before the trial began: a band of
 * litres a week that opens when reorders can first start and ends at 370–460 L. The cafés end up ordering
 * 420 L, inside it all the way.
 */
export const FORECAST = { from: 9.4, lo: 370, hi: 460 };
export function forecastAt(day: number) {
  const x = Math.min(1, Math.max(0, (day - FORECAST.from) / (DAYS - FORECAST.from))), k = x * x * (3 - 2 * x);
  const mid = ((FORECAST.lo + FORECAST.hi) / 2) * k, half = ((FORECAST.hi - FORECAST.lo) / 2) * Math.sqrt(k);
  return [Math.max(0, mid - half), mid + half] as const;
}

export const MARKS = [
  { day: 1, label: 'Kits ship' },
  { day: Math.ceil(allIn), label: 'All delivered' },
  { day: Math.round(firstOrder), label: 'First order' },
  { day: Math.round(lastReview), label: 'Reviews in' },
  { day: DAYS, label: 'Trial ends' },
];

export type Quote = { text: string; who: string; cafe: string; stars: number; day: number };
export const ATTRS: { label: string; score: number; quote: Quote }[] = [
  { label: 'Foams for latte art', score: 4.8, quote: { text: 'Holds a rosetta better than the oat milk we use now.', who: 'Head barista', cafe: 'Little Brew Room', stars: 5, day: 5 } },
  { label: 'Steams without splitting', score: 4.7, quote: { text: 'Steams silky and never splits, even when it runs hot.', who: 'Barista', cafe: 'Morning Ritual', stars: 5, day: 9 } },
  { label: 'Taste in a flat white', score: 4.5, quote: { text: 'A little sweet for a flat white. We’d order an unsweetened one.', who: 'Barista', cafe: 'Brew & Bloom', stars: 4, day: 10 } },
  { label: 'Price for cafés', score: 3.9, quote: { text: 'Great in milk drinks, but we’d need a better price on a case of 12.', who: 'Owner', cafe: 'Copper Kettle', stars: 4, day: 8 } },
];
export const VERDICT: Quote = { text: 'Regulars asked for it by name in week two. We order it weekly now.', who: 'Owner', cafe: 'Morning Ritual', stars: 5, day: 15 };
/** The newest thing a barista said, as of a day. */
export const latestQuote = (day: number) => [...ATTRS.map((a) => a.quote), VERDICT].filter((q) => q.day <= day).sort((a, b) => b.day - a.day)[0] ?? null;

/** Litres ordered a week, sampled every quarter day from day 1 to day 21 and smoothed for the sparkline. */
export const WEEKLY = (() => {
  const raw = Array.from({ length: (DAYS - 1) * 4 + 1 }, (_, i) => tally(1 + i / 4).litres);
  return raw.map((_, i) => {
    const w = raw.slice(Math.max(0, i - 4), i + 5);
    return w.reduce((s, v) => s + v, 0) / w.length;
  });
})();

export const ICONS = {
  truck: 'M2.5 6.5h11v9.5h-11zM13.5 10h4l3 3.2v2.8h-7zM6.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  box: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9',
  cup: 'M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zM17 10h1.5a2.5 2.5 0 0 1 0 5H17',
  star: 'M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8z',
  repeat: 'M17 3l3 3-3 3M4 12v-2a4 4 0 0 1 4-4h12M7 21l-3-3 3-3M20 12v2a4 4 0 0 1-4 4H4',
  check: 'M5 12.5l4.5 4.5L19 7.5',
};
