'use client';
// The demand map of chapter 1 (demand-bento.tsx), in 3D: Delhi NCR as a model on the table, a white slab with
// inked edges and its real streets printed on it, seen from above at a tilt. The trial plays on it as the day
// moves: kits arc out from the 9 suppliers (green) to the 120 cafés (red), and a solid purple column rises from
// every café that orders every week, as tall as its weekly litres times how hot its neighbourhood runs for the
// chosen product, so switching product reshapes the city. The neighbourhood in focus is ringed and its columns
// stand in full colour. The camera drifts on its own, eases in as the trial goes on and leans toward the pointer.
// Everything that changes with the day is worked out on the GPU from one number (uDay). Named cafés and suppliers
// report hover (and keyboard focus) through onPoint; `filter` dims the cafés that haven't reached a funnel step,
// `hot` lights one supplier's or one café's routes, and `spot` labels a café.
// Geography: ./trial-geo.ts (streets and lakes © OpenStreetMap contributors). Styles: app/brand/brand-features.css
import { useEffect, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { CAFES, DAYS, HUBS, type Stage } from './trial-data';
import { AREA_AT, CAFE_AT, HUB_AT, MAP_FILE, unpackMap } from './trial-geo';
import type { MapHot } from './TrialMap';

export type MapSpot = { kind: 'cafe' | 'hub'; id: number; x: number; y: number } | null;
type Props = {
  dayRef: MutableRefObject<number>;
  filter: Stage | null;
  hot: MapHot;
  spot: number | null;
  still: boolean;
  onPoint: (p: MapSpot) => void;
  onFail: () => void;
  /** the neighbourhood in focus, by its place in AREAS (-1 for none) */
  focus?: number;
  /** how tall each neighbourhood's columns stand, by its place in AREAS (1 as recorded) */
  scale?: number[];
};

const FILTER: Record<Stage, number> = { delivered: 1, tried: 2, rated: 3, order: 4 };
const NAMED = CAFES.filter((c) => c.name);
const ORDERS = CAFES.filter((c) => c.o !== null);
const AREA_OF = new Map(AREA_AT.map((a, i) => [a.name, i]));
const TILT = THREE.MathUtils.degToRad(52); // the camera's lean from straight down
const TOP = 3.6; // the tallest a column can stand, in km
// the slab the city is printed on: every café, supplier and neighbourhood with a margin (more to the south, for the
// names), and its thickness
const SPAN = [...CAFE_AT, ...HUB_AT, ...AREA_AT.flatMap((a) => [{ x: a.x - a.r, z: a.z - a.r }, { x: a.x + a.r, z: a.z + a.r }])];
const PLATE = {
  x0: Math.min(...SPAN.map((p) => p.x)) - 1.6, x1: Math.max(...SPAN.map((p) => p.x)) + 1.6,
  z0: Math.min(...SPAN.map((p) => p.z)) - 1.6, z1: Math.max(...SPAN.map((p) => p.z)) + 2.6, t: 0.7,
};
// the page's colours, as GLSL: ink, the brand purple, the supplier green
const INK = 'vec3(0.082, 0.067, 0.114)', PURPLE = 'vec3(0.42, 0.2, 0.827)', GREEN = 'vec3(0.357, 0.839, 0.545)';
const NEVER = 99; // a stage a café never reaches

// shared GLSL: how far a café has got, and how much the funnel filter or a hovered supplier dims it
const STAGE = /* glsl */ `
  uniform float uDay, uFilter, uHotHub, uHotCafe;
  float stage(float at, float rate) { return clamp((uDay - at) * rate, 0.0, 1.0); }
  float dimFor(float reach, float hub, float id) {
    float f = uFilter < 0.5 ? 1.0 : 0.16 + 0.84 * reach;
    bool anyHot = uHotHub > -0.5 || uHotCafe > -0.5;
    bool isHot = abs(hub - uHotHub) < 0.5 || abs(id - uHotCafe) < 0.5;
    return f * (anyHot && !isHot ? 0.26 : 1.0);
  }
`;
// the streets and lakes are cut to the slab
const CLIP = /* glsl */ `float clip(vec2 xz) { return step(${PLATE.x0 + 0.25}, xz.x) * step(xz.x, ${PLATE.x1 - 0.25}) * step(${PLATE.z0 + 0.25}, xz.y) * step(xz.y, ${PLATE.z1 - 0.25}); }`;
// a solid block's faces: lit top, front and side, each inked round its edge (w, in device pixels)
const BLOCK = /* glsl */ `
  float outline(vec2 uv, float w) { vec2 g = max(fwidth(uv), vec2(1e-5)), d = min(uv, 1.0 - uv) / g; return 1.0 - smoothstep(w - 0.6, w + 0.6, min(d.x, d.y)); }
  vec3 face(vec3 n, vec3 top, vec3 front, vec3 side) { return n.y > 0.5 ? top : abs(n.z) > 0.5 ? front : side; }
`;
const VERT_WORLD = /* glsl */ `gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);`;

export function TrialMap3D({ dayRef, filter, hot, spot, still, onPoint, onFail, focus = -1, scale }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pinRef = useRef<HTMLSpanElement>(null);
  const live = useRef({ filter, hot, spot, still, onPoint, onFail, focus, scale });
  const focusRef = useRef<(kind: 'cafe' | 'hub', id: number) => void>(() => {});
  useEffect(() => { live.current = { filter, hot, spot, still, onPoint, onFail, focus, scale }; });

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      live.current.onFail();
      return;
    }
    let running = false, raf = 0, last = 0, time = 0, dirty = true, disposed = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'bdm3-gl';
    box.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 400);
    const { focus: f0, scale: s0 } = live.current;
    const U = {
      uDay: { value: 1 }, uFilter: { value: 0 }, uHotHub: { value: -1 }, uHotCafe: { value: -1 },
      uPx: { value: dpr }, uShow: { value: 0 }, uBoost: { value: dpr >= 1.5 ? 1.5 : 1 },
      // per neighbourhood, eased toward the panel's choice: how tall its columns stand, how much it's in focus, its ring
      uAreaH: { value: AREA_AT.map((_, i) => s0?.[i] ?? 1) },
      uAreaF: { value: AREA_AT.map((_, i) => (f0 === undefined || f0 < 0 || i === f0 ? 1 : 0)) },
      uAreaR: { value: AREA_AT.map((_, i) => (i === f0 ? 1 : 0)) },
    };
    const owned: { dispose: () => void }[] = [];
    const add = (obj: THREE.Object3D, order: number) => { obj.renderOrder = order; obj.frustumCulled = false; scene.add(obj); return obj; };
    // everything is drawn in renderOrder; only the slab and the columns write depth, so the columns hide each other
    // and whatever flies behind them
    const mat = (vertexShader: string, fragmentShader: string, o: { depth?: boolean; write?: boolean; blend?: Partial<THREE.ShaderMaterial> } = {}) => {
      const m = new THREE.ShaderMaterial({ uniforms: U, vertexShader, fragmentShader, transparent: true, depthTest: !!o.depth, depthWrite: !!o.write, ...o.blend });
      owned.push(m);
      return m;
    };
    const geo = <T extends THREE.BufferGeometry>(g: T) => { owned.push(g); return g; };
    const f32 = (n: number, f: (i: number) => number[]) => { const a: number[] = []; for (let i = 0; i < n; i++) a.push(...f(i)); return new Float32Array(a); };

    // the slab: white on top, its edges in two greys, drawn in ink like the cards around it, with a hard shadow
    const slab = geo(new THREE.BoxGeometry(PLATE.x1 - PLATE.x0, PLATE.t, PLATE.z1 - PLATE.z0).translate((PLATE.x0 + PLATE.x1) / 2, -PLATE.t / 2, (PLATE.z0 + PLATE.z1) / 2));
    const under = geo(new THREE.PlaneGeometry(PLATE.x1 - PLATE.x0, PLATE.z1 - PLATE.z0).rotateX(-Math.PI / 2).translate((PLATE.x0 + PLATE.x1) / 2 + 0.75, -PLATE.t - 0.01, (PLATE.z0 + PLATE.z1) / 2 + 0.75));
    add(new THREE.Mesh(under, mat(`void main() { ${VERT_WORLD} }`, `void main() { gl_FragColor = vec4(${INK}, 0.12); }`)), -1);
    add(new THREE.Mesh(slab, mat(
      `varying vec3 vN; varying vec2 vUv; void main() { vN = normal; vUv = uv; ${VERT_WORLD} }`,
      `uniform float uPx; varying vec3 vN; varying vec2 vUv; ${BLOCK}
       void main() {
         vec3 c = face(vN, vec3(1.0), vec3(0.925, 0.91, 0.95), vec3(0.85, 0.825, 0.9));
         gl_FragColor = vec4(mix(c, ${INK}, outline(vUv, 1.4 * uPx)), 1.0);
       }`,
      { depth: true, write: true },
    )), 0);

    // kit routes: an arc from each café's supplier, drawn as far as the kit has got, then a faint trace
    const N = 28, arcPos: number[] = [], arcS: number[] = [], arcData: number[] = [];
    for (const c of CAFES) {
      const a = HUB_AT[c.hub], b = CAFE_AT[c.id], h = 0.12 * Math.hypot(b.x - a.x, b.z - a.z) + 0.3;
      const at = (s: number) => [a.x + (b.x - a.x) * s, h * 4 * s * (1 - s), a.z + (b.z - a.z) * s];
      for (let k = 0; k < N; k++) {
        for (const s of [k / N, (k + 1) / N]) { arcPos.push(...at(s)); arcS.push(s); arcData.push(c.ship, c.d, c.hub, c.id); }
      }
    }
    const arcs = geo(new THREE.BufferGeometry());
    arcs.setAttribute('position', new THREE.Float32BufferAttribute(arcPos, 3));
    arcs.setAttribute('aS', new THREE.Float32BufferAttribute(arcS, 1));
    arcs.setAttribute('aData', new THREE.Float32BufferAttribute(arcData, 4));
    add(new THREE.LineSegments(arcs, mat(
      `attribute float aS; attribute vec4 aData; varying float vS, vP, vA; ${STAGE}
       void main() {
         float ship = aData.x, d = aData.y;
         vS = aS; vP = clamp((uDay - ship) / max(0.05, d - ship), 0.0, 1.0);
         float moving = clamp((uDay - ship) * 10.0, 0.0, 1.0) * (1.0 - clamp((uDay - d) * 1.4, 0.0, 1.0));
         bool anyHot = uHotHub > -0.5 || uHotCafe > -0.5;
         bool isHot = abs(aData.z - uHotHub) < 0.5 || abs(aData.w - uHotCafe) < 0.5;
         float a = mix(0.07, 0.7, moving);
         if (anyHot) a = isHot ? max(a, 0.85) : a * 0.2;
         if (uFilter > 0.5) a *= 0.35;
         vA = a; ${VERT_WORLD}
       }`,
      `varying float vS, vP, vA;
       void main() { if (vS > vP + 0.0005) discard; gl_FragColor = vec4(${INK}, vA * (0.3 + 0.7 * smoothstep(vP - 0.45, vP, vS))); }`,
      { depth: true },
    )), 10);

    // the kit itself, a purple square riding the front of its arc
    const kits = geo(new THREE.BufferGeometry());
    kits.setAttribute('position', new THREE.BufferAttribute(new Float32Array(CAFES.length * 3), 3));
    kits.setAttribute('aAB', new THREE.BufferAttribute(f32(CAFES.length, (i) => { const a = HUB_AT[CAFES[i].hub], b = CAFE_AT[i]; return [a.x, a.z, b.x, b.z]; }), 4));
    kits.setAttribute('aRun', new THREE.BufferAttribute(f32(CAFES.length, (i) => { const c = CAFES[i], a = HUB_AT[c.hub], b = CAFE_AT[i]; return [c.ship, c.d, 0.12 * Math.hypot(b.x - a.x, b.z - a.z) + 0.3]; }), 3));
    add(new THREE.Points(kits, mat(
      `attribute vec4 aAB; attribute vec3 aRun; uniform float uPx; varying float vA; ${STAGE}
       void main() {
         float p = clamp((uDay - aRun.x) / max(0.05, aRun.y - aRun.x), 0.0, 1.0);
         vec2 xz = mix(aAB.xy, aAB.zw, p);
         vA = smoothstep(aRun.x, aRun.x + 0.06, uDay) * (1.0 - smoothstep(aRun.y - 0.04, aRun.y + 0.04, uDay)) * (uFilter > 0.5 ? 0.4 : 1.0);
         gl_PointSize = 9.0 * uPx;
         gl_Position = projectionMatrix * viewMatrix * vec4(xz.x, aRun.z * 4.0 * p * (1.0 - p), xz.y, 1.0);
       }`,
      `varying float vA;
       void main() {
         vec2 p = abs(gl_PointCoord - 0.5) * 9.0;
         float sd = max(p.x, p.y);
         if (sd > 3.6 || vA < 0.01) discard;
         gl_FragColor = vec4(sd > 2.4 ? ${INK} : ${PURPLE}, vA);
       }`,
      { depth: true },
    )), 11);

    // each neighbourhood is a dashed circle on the ground; the one in focus is drawn in purple and tinted
    const flatQuad = geo(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2));
    const disks = geo(new THREE.InstancedBufferGeometry());
    disks.index = flatQuad.index;
    disks.setAttribute('position', flatQuad.getAttribute('position'));
    disks.setAttribute('aDisk', new THREE.InstancedBufferAttribute(f32(AREA_AT.length, (i) => [AREA_AT[i].x, AREA_AT[i].z, AREA_AT[i].r + 0.45, i]), 4));
    disks.instanceCount = AREA_AT.length;
    add(new THREE.Mesh(disks, mat(
      `attribute vec4 aDisk; uniform float uAreaR[${AREA_AT.length}]; varying vec2 vL; varying float vR, vRing;
       void main() {
         vL = position.xz * 2.0 * (aDisk.z + 0.3); vR = aDisk.z; vRing = uAreaR[int(aDisk.w + 0.5)];
         gl_Position = projectionMatrix * viewMatrix * vec4(aDisk.x + vL.x, 0.002, aDisk.y + vL.y, 1.0);
       }`,
      `uniform float uPx; varying vec2 vL; varying float vR, vRing;
       void main() {
         float dist = length(vL), fw = max(fwidth(dist), 1e-5), dr = abs(dist - vR) / fw;
         float solid = 1.0 - smoothstep(1.6 * uPx - 0.6, 1.6 * uPx + 0.6, dr);
         float dash = step(0.5, fract(atan(vL.y, vL.x) / 6.2832 * 44.0));
         float faint = (1.0 - smoothstep(0.6 * uPx, 0.6 * uPx + 1.0, dr)) * dash * 0.3;
         float fill = (1.0 - smoothstep(vR - fw, vR + fw, dist)) * 0.08;
         float a = mix(faint, max(solid, fill), vRing);
         if (a < 0.005) discard;
         gl_FragColor = vec4(mix(${INK}, ${PURPLE}, vRing), a);
       }`,
    )), 5);

    // cafés: a faint ring until the kit lands, then a red dot, deeper once tried; the named ones wear a ring you can point at
    const cafes = geo(new THREE.BufferGeometry());
    cafes.setAttribute('position', new THREE.BufferAttribute(f32(CAFES.length, (i) => [CAFE_AT[i].x, 0, CAFE_AT[i].z]), 3));
    cafes.setAttribute('aWhen', new THREE.BufferAttribute(f32(CAFES.length, (i) => { const c = CAFES[i]; return [c.d, c.t ?? NEVER, c.r ?? NEVER, c.o ?? NEVER]; }), 4));
    cafes.setAttribute('aWho', new THREE.BufferAttribute(f32(CAFES.length, (i) => [CAFES[i].hub, i, CAFES[i].name ? 1 : 0]), 3));
    add(new THREE.Points(cafes, mat(
      `attribute vec4 aWhen; attribute vec3 aWho; uniform float uPx; varying vec4 vK; varying float vDim, vNamed; ${STAGE}
       void main() {
         vK = vec4(stage(aWhen.x, 5.0), stage(aWhen.y, 5.0), stage(aWhen.z, 5.0), stage(aWhen.w, 4.0));
         float reach = uFilter < 1.5 ? vK.x : uFilter < 2.5 ? vK.y : uFilter < 3.5 ? vK.z : vK.w;
         vDim = dimFor(reach, aWho.x, aWho.y); vNamed = aWho.z;
         gl_PointSize = (aWho.z > 0.5 ? 16.0 : 9.0) * uPx;
         ${VERT_WORLD}
       }`,
      `varying vec4 vK; varying float vDim, vNamed;
       void main() {
         float size = vNamed > 0.5 ? 16.0 : 9.0, d = length(gl_PointCoord - 0.5) * size, rad = 3.1;
         float body = (1.0 - smoothstep(rad - 0.5, rad + 0.5, d)) * vK.x;
         float rim = (1.0 - smoothstep(0.35, 0.9, abs(d - rad + 0.4))) * vK.x;
         float ring = (1.0 - smoothstep(0.3, 0.9, abs(d - 2.6))) * (1.0 - vK.x) * 0.35;
         float mark = vNamed > 0.5 ? (1.0 - smoothstep(0.3, 0.9, abs(d - 6.6))) * 0.55 : 0.0;
         vec3 red = mix(vec3(1.0, 0.71, 0.675), vec3(1.0, 0.42, 0.365), vK.y);
         float a = max(max(body, rim), max(ring, mark));
         if (a < 0.005) discard;
         gl_FragColor = vec4(body > 0.5 ? mix(red, ${INK}, rim) : ${INK}, a * vDim);
       }`,
    )), 7);

    // suppliers: green squares, larger while you point at one
    const hubs = geo(new THREE.BufferGeometry());
    hubs.setAttribute('position', new THREE.BufferAttribute(f32(HUBS.length, (i) => [HUB_AT[i].x, 0.02, HUB_AT[i].z]), 3));
    hubs.setAttribute('aId', new THREE.BufferAttribute(f32(HUBS.length, (i) => [i]), 1));
    add(new THREE.Points(hubs, mat(
      `attribute float aId; uniform float uPx; varying float vHot; ${STAGE}
       void main() { vHot = abs(aId - uHotHub) < 0.5 ? 1.0 : 0.0; gl_PointSize = 15.0 * uPx; ${VERT_WORLD} }`,
      `varying float vHot;
       void main() {
         vec2 p = abs(gl_PointCoord - 0.5) * 15.0;
         float sd = max(p.x, p.y) - mix(4.4, 6.4, vHot);
         if (sd > 0.5) discard;
         gl_FragColor = vec4(sd > -1.4 ? ${INK} : ${GREEN}, 1.0 - smoothstep(-0.5, 0.5, sd));
       }`,
    )), 8);

    // demand: a solid column on each café that orders every week, as tall as its weekly litres times how hot its
    // neighbourhood runs for the chosen product, inked like the cards, with a hard shadow down and to the right
    const box3 = geo(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
    const cols = geo(new THREE.InstancedBufferGeometry());
    cols.index = box3.index;
    for (const k of ['position', 'normal', 'uv']) cols.setAttribute(k, box3.getAttribute(k));
    cols.setAttribute('aBase', new THREE.InstancedBufferAttribute(f32(ORDERS.length, (i) => [CAFE_AT[ORDERS[i].id].x, CAFE_AT[ORDERS[i].id].z]), 2));
    cols.setAttribute('aWho', new THREE.InstancedBufferAttribute(f32(ORDERS.length, (i) => { const c = ORDERS[i]; return [c.o!, c.litres!, c.hub, c.id]; }), 4));
    cols.setAttribute('aArea', new THREE.InstancedBufferAttribute(f32(ORDERS.length, (i) => [AREA_OF.get(ORDERS[i].area) ?? 0]), 1));
    cols.instanceCount = ORDERS.length;
    const COLUMN = /* glsl */ `
      attribute vec2 aBase; attribute vec4 aWho; attribute float aArea;
      uniform float uAreaH[${AREA_AT.length}], uAreaF[${AREA_AT.length}];
      varying vec3 vN; varying vec2 vUv; varying float vF, vDim; ${STAGE}
      vec3 column(out float on) {
        float ko = stage(aWho.x, 1.4), grow = ko * ko * (3.0 - 2.0 * ko);
        int k = int(aArea + 0.5);
        vN = normal; vUv = uv; vF = uAreaF[k]; vDim = dimFor(ko, aWho.z, aWho.w); on = grow;
        return position * vec3(0.4, max(0.001, (0.3 + aWho.y / 15.0) * uAreaH[k] * grow), 0.4);
      }`;
    add(new THREE.Mesh(cols, mat(
      `${COLUMN}
       void main() {
         float on; vec3 p = column(on);
         gl_Position = projectionMatrix * viewMatrix * vec4(aBase.x + p.x + p.y * 0.42, 0.004, aBase.y + p.z + p.y * 0.42, 1.0);
         if (on < 0.001) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
       }`,
      `void main() { gl_FragColor = vec4(0.875, 0.86, 0.9, 1.0); }`,
      // the darker of the shadow and what's under it, so roads show through and overlapping shadows don't stack
      { blend: { blending: THREE.CustomBlending, blendEquation: THREE.MinEquation, blendEquationAlpha: THREE.MaxEquation } },
    )), 4);
    add(new THREE.Mesh(cols, mat(
      `${COLUMN}
       void main() {
         float on; vec3 p = column(on);
         gl_Position = projectionMatrix * viewMatrix * vec4(aBase.x + p.x, p.y, aBase.y + p.z, 1.0);
         if (on < 0.001) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
       }`,
      `uniform float uPx; varying vec3 vN; varying vec2 vUv; varying float vF, vDim; ${BLOCK}
       void main() {
         vec3 hot = face(vN, vec3(0.72, 0.6, 0.98), ${PURPLE}, vec3(0.31, 0.13, 0.66));
         vec3 calm = face(vN, vec3(0.91, 0.87, 0.99), vec3(0.67, 0.57, 0.93), vec3(0.56, 0.45, 0.88));
         vec3 c = mix(vec3(0.95, 0.94, 0.97), mix(calm, hot, vF), vDim);
         gl_FragColor = vec4(mix(c, ${INK}, outline(vUv, 1.1 * uPx) * mix(0.4, 1.0, vF) * vDim), 1.0);
       }`,
      { depth: true, write: true },
    )), 9);

    // the streets and lakes arrive from the network and fade in, cut to the slab
    let shownAt = 0;
    fetch(MAP_FILE).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status))).then((buf) => {
      if (disposed) return;
      const { roads, lakes } = unpackMap(buf);
      const rp: number[] = [], rc: number[] = [];
      for (const { cls, pts } of roads) {
        for (let k = 0; k + 3 < pts.length; k += 2) { rp.push(pts[k], 0, pts[k + 1], pts[k + 2], 0, pts[k + 3]); rc.push(cls, cls); }
      }
      const streets = geo(new THREE.BufferGeometry());
      streets.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3));
      streets.setAttribute('aClass', new THREE.Float32BufferAttribute(rc, 1));
      add(new THREE.LineSegments(streets, mat(
        `attribute float aClass; uniform float uShow, uBoost; varying float vA; varying vec2 vXZ;
         void main() { vXZ = position.xz; vA = (aClass < 0.5 ? 0.55 : aClass < 1.5 ? 0.34 : aClass < 2.5 ? 0.2 : 0.11) * uShow * uBoost; ${VERT_WORLD} }`,
        `varying float vA; varying vec2 vXZ; ${CLIP}
         void main() { gl_FragColor = vec4(0.25, 0.22, 0.32, vA * clip(vXZ)); }`,
      )), 3);
      const lp: number[] = [], li: number[] = [], lr: number[] = [];
      for (const pts of lakes) {
        const ring: THREE.Vector2[] = [];
        for (let k = 0; k < pts.length; k += 2) ring.push(new THREE.Vector2(pts[k], pts[k + 1]));
        const base = lp.length / 3;
        for (const v of ring) lp.push(v.x, 0, v.y);
        for (const [a, b, c] of THREE.ShapeUtils.triangulateShape(ring, [])) li.push(base + a, base + b, base + c);
        ring.forEach((v, k) => { const w = ring[(k + 1) % ring.length]; lr.push(v.x, 0, v.y, w.x, 0, w.y); });
      }
      const water = geo(new THREE.BufferGeometry());
      water.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
      water.setIndex(li);
      add(new THREE.Mesh(water, mat(
        `uniform float uShow; varying vec2 vXZ; varying float vS; void main() { vXZ = position.xz; vS = uShow; ${VERT_WORLD} }`,
        `varying vec2 vXZ; varying float vS; ${CLIP} void main() { gl_FragColor = vec4(0.85, 0.9, 0.96, vS * clip(vXZ)); }`,
      )), 1);
      const shore = geo(new THREE.BufferGeometry());
      shore.setAttribute('position', new THREE.Float32BufferAttribute(lr, 3));
      add(new THREE.LineSegments(shore, mat(
        `uniform float uShow, uBoost; varying vec2 vXZ; varying float vA; void main() { vXZ = position.xz; vA = 0.3 * uShow * uBoost; ${VERT_WORLD} }`,
        `varying vec2 vXZ; varying float vA; ${CLIP} void main() { gl_FragColor = vec4(0.4, 0.5, 0.64, vA * clip(vXZ)); }`,
      )), 2);
      shownAt = performance.now();
    }).catch(() => { /* the trial still plays without the streets */ });

    // the camera: framed on the trial, drifting slowly, easing in as the trial goes on, leaning toward the pointer
    const target = new THREE.Vector3(0.15, 0.4, 0.2), v = new THREE.Vector3();
    let W = 0, H = 0, R0 = 40;
    const place = (r: number, yaw: number, tilt: number) => {
      camera.position.set(target.x + r * Math.sin(tilt) * Math.sin(yaw), target.y + r * Math.cos(tilt), target.z + r * Math.sin(tilt) * Math.cos(yaw));
      camera.lookAt(target);
      camera.updateMatrixWorld();
    };
    const fit = () => {
      W = box.clientWidth; H = box.clientHeight;
      if (!W || !H) return;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      // step the distance until the whole slab (its underside too) and the tallest column sit inside the frame
      for (let k = 0; k < 5; k++) {
        place(R0, 0, TILT);
        let m = 0;
        const fitIn = (x: number, y: number, z: number) => { v.set(x, y, z).project(camera); m = Math.max(m, Math.abs(v.x) / 0.92, v.y > 0 ? v.y / 0.86 : -v.y / 0.9); };
        for (const x of [PLATE.x0, PLATE.x1]) for (const z of [PLATE.z0, PLATE.z1]) for (const y of [0, -PLATE.t]) fitIn(x, y, z);
        for (const x of [PLATE.x0, PLATE.x1]) for (const z of [PLATE.z0, PLATE.z1]) fitIn(x, TOP, z);
        R0 *= m;
      }
      dirty = true;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(box);

    // pointing: the nearest named café or supplier within reach of the pointer
    const toScreen = (x: number, y: number, z: number) => { v.set(x, y, z).project(camera); return [(v.x + 1) * 0.5 * W, (1 - v.y) * 0.5 * H] as const; };
    const POINTS = [...NAMED.map((c) => ({ kind: 'cafe' as const, id: c.id, at: CAFE_AT[c.id], y: 0 })), ...HUBS.map((_, i) => ({ kind: 'hub' as const, id: i, at: HUB_AT[i], y: 0.02 }))];
    let held: { kind: 'cafe' | 'hub'; id: number } | null = null;
    const lean = { x: 0, y: 0, tx: 0, ty: 0 };
    const report = (p: (typeof POINTS)[number] | null) => {
      if ((p?.kind ?? null) === (held?.kind ?? null) && p?.id === held?.id) return;
      held = p ? { kind: p.kind, id: p.id } : null;
      box.classList.toggle('is-pointing', !!p);
      if (!p) return live.current.onPoint(null);
      const [x, y] = toScreen(p.at.x, p.y, p.at.z);
      live.current.onPoint({ kind: p.kind, id: p.id, x, y });
    };
    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      if (e.pointerType === 'mouse' && !held) { lean.tx = (px / r.width - 0.5) * 2; lean.ty = (py / r.height - 0.5) * 2; }
      let best = null, bd = 16;
      for (const p of POINTS) {
        const [x, y] = toScreen(p.at.x, p.y, p.at.z), d = Math.hypot(x - px, y - py);
        if (d < bd) { bd = d; best = p; }
      }
      report(best);
    };
    const onLeave = () => { lean.tx = lean.ty = 0; report(null); };
    box.addEventListener('pointermove', onMove);
    box.addEventListener('pointerleave', onLeave);
    focusRef.current = (kind, id) => report(POINTS.find((p) => p.kind === kind && p.id === id) ?? null);

    // only run while the map is on screen
    const was = { day: -1, filter: -1, hub: -2, cafe: -2, spot: -2 };
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
      last = now;
      const { filter: fl, hot: ht, spot: sp, still: calm } = live.current;
      const day = dayRef.current, f = fl ? FILTER[fl] : 0, hub = ht?.kind === 'hub' ? ht.id : -1, cafe = ht?.kind === 'cafe' ? ht.id : -1, sid = sp ?? -1;
      const show = shownAt ? Math.min(1, (now - shownAt) / 900) : 0;
      if (day !== was.day || f !== was.filter || hub !== was.hub || cafe !== was.cafe || sid !== was.spot || show !== U.uShow.value) dirty = true;
      const moving = !calm && !held;
      if (moving) { time += dt; dirty = true; }
      if (moving) {
        const k = 1 - Math.exp(-dt * 3);
        lean.x += (lean.tx - lean.x) * k; lean.y += (lean.ty - lean.y) * k;
        if (Math.abs(lean.tx - lean.x) + Math.abs(lean.ty - lean.y) > 0.001) dirty = true;
      }
      // the columns grow or settle to the chosen product, and the focus moves, over about half a second
      const { focus: fc = -1, scale: sc } = live.current, ease6 = calm ? 1 : 1 - Math.exp(-dt * 7);
      AREA_AT.forEach((_, i) => {
        const goal = [sc?.[i] ?? 1, fc < 0 || i === fc ? 1 : 0, i === fc ? 1 : 0];
        [U.uAreaH, U.uAreaF, U.uAreaR].forEach((u, j) => {
          const d = goal[j] - u.value[i];
          if (Math.abs(d) < 0.001) { u.value[i] = goal[j]; return; }
          u.value[i] += d * ease6; dirty = true;
        });
      });
      if (!dirty) return;
      dirty = false;
      Object.assign(was, { day, filter: f, hub, cafe, spot: sid });
      U.uDay.value = day; U.uFilter.value = f; U.uHotHub.value = hub; U.uHotCafe.value = cafe; U.uShow.value = show;
      const into = (day - 1) / (DAYS - 1), ease = into * into * (3 - 2 * into);
      const yaw = calm ? 0 : 0.1 * Math.sin((time * Math.PI * 2) / 48) + lean.x * 0.16;
      const tilt = TILT + (calm ? 0 : 0.026 * Math.sin((time * Math.PI * 2) / 34) - lean.y * 0.07);
      place(R0 * (1 - 0.06 * ease), yaw, tilt);
      renderer.render(scene, camera);
      // the neighbourhood names and the labelled café ride along in HTML, so they stay crisp
      AREA_AT.forEach((a, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const [x, y] = toScreen(a.x, 0, a.z + a.r + 1.1);
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
        el.style.opacity = '1';
      });
      const pin = pinRef.current;
      if (pin && sid >= 0) {
        const [x, y] = toScreen(CAFE_AT[sid].x, 0, CAFE_AT[sid].z);
        pin.style.left = `${x.toFixed(1)}px`;
        pin.style.top = `${y.toFixed(1)}px`;
      }
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; last = 0; dirty = true; raf = requestAnimationFrame(tick); }
      else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
    });
    io.observe(box);
    fit();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      box.removeEventListener('pointermove', onMove);
      box.removeEventListener('pointerleave', onLeave);
      focusRef.current = () => {};
      for (const o of owned) o.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [dayRef]);

  return (
    <div ref={boxRef} className="bdm3">
      <div className="bdm3-labels" aria-hidden="true">
        {AREA_AT.map((a, i) => <span key={a.name} className={i === focus ? 'is-on' : undefined} ref={(el) => { labelRefs.current[i] = el; }}>{a.name}</span>)}
      </div>
      {spot !== null && <span key={spot} ref={pinRef} className="bdb-pin bdm3-pin" aria-hidden="true">{CAFES[spot].name}</span>}
      <span className="bdm3-credit">© OpenStreetMap</span>
      {/* the named cafés and the suppliers, for the keyboard */}
      <div className="bdb-sr">
        {NAMED.map((c) => (
          <button key={c.id} type="button" onFocus={() => focusRef.current('cafe', c.id)} onBlur={() => focusRef.current('cafe', -1)}>{`${c.name}, ${c.area}`}</button>
        ))}
        {HUBS.map((h, i) => (
          <button key={h.name} type="button" onFocus={() => focusRef.current('hub', i)} onBlur={() => focusRef.current('hub', -1)}>{`${h.name}, a supplier carrying kits`}</button>
        ))}
      </div>
    </div>
  );
}
