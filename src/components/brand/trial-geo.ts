// Where the sample trial sits on a real map of Bangalore, for the 3D map (TrialMap3D.tsx). Kilometres from the
// map's centre, east = +x and south = +z, so north runs into the screen. The streets and lakes in
// public/brand/blr-map.bin use the same projection: OpenStreetMap's motorways down to tertiary roads, and lakes
// over 2 hectares, simplified below a pixel and stored in decametres (© OpenStreetMap contributors). Each
// neighbourhood sits at its real centre; its cafés keep their places around it from the flat layout in
// trial-data.ts, scaled to kilometres, and each supplier keeps its place beside the cafés it serves.
import { AREAS, CAFES, HUBS } from './trial-data';

export const MAP_FILE = '/brand/blr-map.bin';
const LAT0 = 12.968, LON0 = 77.648;
const KX = 111.32 * Math.cos((LAT0 * Math.PI) / 180), KZ = 110.57;
const project = (lat: number, lon: number) => [(lon - LON0) * KX, -(lat - LAT0) * KZ] as const;

const CENTRES: Record<string, [number, number]> = {
  Hebbal: [13.0358, 77.597],
  Malleshwaram: [13.002, 77.569],
  Rajajinagar: [12.989, 77.552],
  Indiranagar: [12.975, 77.64],
  Whitefield: [12.97, 77.745],
  Koramangala: [12.9352, 77.6245],
  'HSR Layout': [12.912, 77.644],
  Jayanagar: [12.929, 77.584],
  'JP Nagar': [12.904, 77.584],
};
const K = 0.035; // kilometres per unit of the flat layout

/** Each neighbourhood's centre and the radius its cafés spread over. */
export const AREA_AT = AREAS.map((a) => {
  const [x, z] = project(...CENTRES[a.name]);
  return { name: a.name, x, z, r: (5 * Math.sqrt(a.n) + 8) * K };
});
const AREA_OF = new Map(AREAS.map((a, i) => [a.name, i]));

export const CAFE_AT = CAFES.map((c) => {
  const i = AREA_OF.get(c.area)!, a = AREAS[i], g = AREA_AT[i];
  return { x: g.x + (c.x - a.x) * K, z: g.z + (c.y - a.y) * K };
});

export const HUB_AT = HUBS.map((h, i) => {
  const mine = CAFES.filter((c) => c.hub === i);
  if (!mine.length) return { x: 0, z: 0 };
  const avg = (f: (c: (typeof CAFES)[number]) => number) => mine.reduce((s, c) => s + f(c), 0) / mine.length;
  return { x: avg((c) => CAFE_AT[c.id].x) + (h.x - avg((c) => c.x)) * K, z: avg((c) => CAFE_AT[c.id].z) + (h.y - avg((c) => c.y)) * K };
});

/** The streets and lakes, unpacked from MAP_FILE: road polylines (with their class, 0 = motorway or trunk
 * down to 3 = tertiary) and lake outlines, in kilometres. */
export function unpackMap(buf: ArrayBuffer) {
  const v = new Int16Array(buf);
  let i = 0;
  const roads: { cls: number; pts: number[] }[] = [];
  for (let n = v[i++]; n > 0; n--) {
    const cls = v[i++], len = v[i++], pts: number[] = [];
    for (let k = 0; k < len * 2; k++) pts.push(v[i++] / 100);
    roads.push({ cls, pts });
  }
  const lakes: number[][] = [];
  for (let n = v[i++]; n > 0; n--) {
    const len = v[i++], pts: number[] = [];
    for (let k = 0; k < len * 2; k++) pts.push(v[i++] / 100);
    lakes.push(pts);
  }
  return { roads, lakes };
}
