'use client';
// The live map inside the brand dashboard (BrandDashboard.tsx), in 3D: Delhi NCR at night, seen from above at a
// tilt, its real streets a fine violet web and its lakes dark. The trial plays on it as the day moves: kits arc
// out from the 9 suppliers to the 120 cafés, each café brightens as it's delivered, tried and rated, and a
// column of light rises from every café that orders every week, as tall as its weekly litres, so by day 21 the
// city shows where the demand is. The camera drifts on its own, eases in as the trial goes on and leans toward
// the pointer. Everything that changes with the day is worked out on the GPU from one number (uDay), so playing
// the trial costs one uniform a frame. Named cafés and suppliers report hover (and keyboard focus) through
// onPoint; `filter` dims the cafés that haven't reached a funnel step, `hot` lights one supplier's or one café's
// routes, and `spot` labels a café. If WebGL isn't there, onFail lets the dashboard fall back to the flat map.
// Geography: ./trial-geo.ts (streets and lakes © OpenStreetMap contributors). Styles: app/brand/brand-dashboard.css
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
};

const FILTER: Record<Stage, number> = { delivered: 1, tried: 2, rated: 3, order: 4 };
const NAMED = CAFES.filter((c) => c.name);
const ORDERS = CAFES.filter((c) => c.o !== null);
const TILT = THREE.MathUtils.degToRad(50); // the camera's lean from straight down
const BOX = { x0: -11.6, x1: 11.9, z0: -8.6, z1: 8.2, top: 3.6 }; // the trial's footprint, and its tallest column, in km
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
// the city fades out toward the frame's edges
const EDGE = /* glsl */ `float edge(vec2 xz) { return 1.0 - smoothstep(10.5, 18.0, length(xz * vec2(0.9, 1.2))); }`;
const VERT_WORLD = /* glsl */ `gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);`;

export function TrialMap3D({ dayRef, filter, hot, spot, still, onPoint, onFail }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pinRef = useRef<HTMLSpanElement>(null);
  const live = useRef({ filter, hot, spot, still, onPoint, onFail });
  const focusRef = useRef<(kind: 'cafe' | 'hub', id: number) => void>(() => {});
  useEffect(() => { live.current = { filter, hot, spot, still, onPoint, onFail }; });

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
    const U = {
      uDay: { value: 1 }, uFilter: { value: 0 }, uHotHub: { value: -1 }, uHotCafe: { value: -1 }, uTime: { value: 0 },
      uPx: { value: dpr }, uShow: { value: 0 }, uBoost: { value: dpr >= 1.5 ? 1.5 : 1 },
      uLilac: { value: new THREE.Color('#C4A8FF') }, uViolet: { value: new THREE.Color('#7C4DDB') }, uRoad: { value: new THREE.Color('#9F8BFF') },
    };
    const owned: { dispose: () => void }[] = [];
    const add = (obj: THREE.Object3D, order: number) => { obj.renderOrder = order; obj.frustumCulled = false; scene.add(obj); return obj; };
    const mat = (vertexShader: string, fragmentShader: string, additive = true) => {
      const m = new THREE.ShaderMaterial({ uniforms: U, vertexShader, fragmentShader, transparent: true, depthTest: false, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
      owned.push(m);
      return m;
    };
    const geo = <T extends THREE.BufferGeometry>(g: T) => { owned.push(g); return g; };
    const f32 = (n: number, f: (i: number) => number[]) => { const a: number[] = []; for (let i = 0; i < n; i++) a.push(...f(i)); return new Float32Array(a); };

    // a soft violet light under the city
    const ground = geo(new THREE.PlaneGeometry(46, 46).rotateX(-Math.PI / 2));
    add(new THREE.Mesh(ground, mat(
      `varying vec2 vXZ; void main() { vXZ = position.xz; ${VERT_WORLD} }`,
      `uniform vec3 uViolet; varying vec2 vXZ;
       void main() { float r = length(vXZ * vec2(0.85, 1.15)); gl_FragColor = vec4(uViolet, 0.2 * pow(1.0 - smoothstep(0.0, 14.0, r), 1.6)); }`,
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
         float a = mix(0.08, 0.95, moving);
         if (anyHot) a = isHot ? max(a, 0.8) : a * 0.22;
         if (uFilter > 0.5) a *= 0.35;
         vA = a; ${VERT_WORLD}
       }`,
      `uniform vec3 uLilac; varying float vS, vP, vA;
       void main() { if (vS > vP + 0.0005) discard; gl_FragColor = vec4(uLilac, vA * (0.22 + 0.78 * smoothstep(vP - 0.45, vP, vS))); }`,
    )), 4);

    // the kit itself, riding the front of its arc
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
         gl_PointSize = 13.0 * uPx;
         gl_Position = projectionMatrix * viewMatrix * vec4(xz.x, aRun.z * 4.0 * p * (1.0 - p), xz.y, 1.0);
       }`,
      `varying float vA;
       void main() {
         float d = length(gl_PointCoord - 0.5) * 2.0;
         float a = (pow(max(0.0, 1.0 - d), 3.0) * 0.9 + 1.0 - smoothstep(0.12, 0.24, d)) * vA;
         if (a < 0.01) discard;
         gl_FragColor = vec4(1.0, 0.97, 1.0, min(1.0, a));
       }`,
    )), 11);

    // a pool of light under each café that orders, then its column
    const quad = geo(new THREE.PlaneGeometry(1, 1));
    const orderData = (size: number, f: (c: (typeof CAFES)[number]) => number[]) => new THREE.InstancedBufferAttribute(f32(ORDERS.length, (i) => f(ORDERS[i])), size);
    const flat = geo(new THREE.InstancedBufferGeometry());
    const flatQuad = geo(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2));
    flat.index = flatQuad.index;
    flat.setAttribute('position', flatQuad.getAttribute('position'));
    flat.setAttribute('aBase', orderData(2, (c) => [CAFE_AT[c.id].x, CAFE_AT[c.id].z]));
    flat.setAttribute('aWho', orderData(4, (c) => [c.o!, c.litres!, c.hub, c.id]));
    flat.instanceCount = ORDERS.length;
    add(new THREE.Mesh(flat, mat(
      `attribute vec2 aBase; attribute vec4 aWho; varying vec2 vP; varying float vA; ${STAGE}
       void main() {
         float ko = stage(aWho.x, 2.0);
         vP = position.xz * 2.0;
         vA = ko * dimFor(ko, aWho.z, aWho.w);
         gl_Position = projectionMatrix * viewMatrix * vec4(vec3(aBase.x, 0.0, aBase.y) + position * 1.1, 1.0);
       }`,
      `uniform vec3 uViolet; varying vec2 vP; varying float vA;
       void main() { gl_FragColor = vec4(uViolet, pow(max(0.0, 1.0 - length(vP)), 2.2) * 0.75 * vA); }`,
    )), 5);

    const beams = geo(new THREE.InstancedBufferGeometry());
    const beamQuad = geo(new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0));
    beams.index = beamQuad.index;
    beams.setAttribute('position', beamQuad.getAttribute('position'));
    beams.setAttribute('aBase', flat.getAttribute('aBase'));
    beams.setAttribute('aWho', flat.getAttribute('aWho'));
    beams.instanceCount = ORDERS.length;
    add(new THREE.Mesh(beams, mat(
      `attribute vec2 aBase; attribute vec4 aWho; varying vec2 vUv; varying float vA; ${STAGE}
       void main() {
         float ko = stage(aWho.x, 1.4), grow = ko * ko * (3.0 - 2.0 * ko);
         vec3 base = vec3(aBase.x, 0.0, aBase.y), toCam = cameraPosition - base;
         vec3 side = normalize(vec3(toCam.z, 0.0, -toCam.x));
         vec3 p = base + side * position.x * 0.2 + vec3(0.0, position.y * (0.55 + aWho.y / 30.0 * 3.0) * grow, 0.0);
         vUv = vec2(position.x + 0.5, position.y);
         vA = step(0.001, ko) * dimFor(ko, aWho.z, aWho.w);
         gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
       }`,
      `uniform vec3 uViolet, uLilac; varying vec2 vUv; varying float vA;
       void main() {
         float across = 1.0 - abs(vUv.x - 0.5) * 2.0, core = pow(across, 5.0), halo = pow(across, 1.5);
         float up = pow(1.0 - vUv.y, 1.15);
         vec3 col = mix(mix(uViolet, uLilac, core), vec3(1.0, 0.96, 0.9), core * up * up);
         gl_FragColor = vec4(col, (halo * 0.42 + core * 0.75) * up * vA);
       }`,
    )), 10);

    // the named cafés that order send a slow ripple across the ground
    const named = NAMED.filter((c) => c.o !== null);
    const ripples = geo(new THREE.InstancedBufferGeometry());
    ripples.index = flatQuad.index;
    ripples.setAttribute('position', flatQuad.getAttribute('position'));
    ripples.setAttribute('aRip', new THREE.InstancedBufferAttribute(f32(named.length, (i) => [CAFE_AT[named[i].id].x, CAFE_AT[named[i].id].z, named[i].o!, i / named.length]), 4));
    ripples.setAttribute('aWho', new THREE.InstancedBufferAttribute(f32(named.length, (i) => [named[i].hub, named[i].id]), 2));
    ripples.instanceCount = named.length;
    add(new THREE.Mesh(ripples, mat(
      `attribute vec4 aRip; attribute vec2 aWho; varying vec2 vP; varying float vA, vPhase; ${STAGE}
       void main() {
         float ko = stage(aRip.z, 3.0);
         vP = position.xz * 2.0; vPhase = aRip.w;
         vA = ko * dimFor(ko, aWho.x, aWho.y);
         gl_Position = projectionMatrix * viewMatrix * vec4(vec3(aRip.x, 0.0, aRip.y) + position * 1.5, 1.0);
       }`,
      `uniform vec3 uLilac; uniform float uTime; varying vec2 vP; varying float vA, vPhase;
       void main() {
         float t = fract(uTime / 2.8 + vPhase);
         float ring = 1.0 - smoothstep(0.0, 0.05, abs(length(vP) - t));
         gl_FragColor = vec4(uLilac, ring * (1.0 - t) * 0.6 * vA);
       }`,
    )), 6);

    // cafés: a faint ring until the kit lands, then a dot that goes white when tried, lilac when rated and
    // warm white once it orders; the named ones wear a thin ring you can point at
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
         gl_PointSize = (aWho.z > 0.5 ? 18.0 : 9.0) * uPx;
         ${VERT_WORLD}
       }`,
      `uniform vec3 uLilac; varying vec4 vK; varying float vDim, vNamed;
       void main() {
         float size = vNamed > 0.5 ? 18.0 : 9.0, d = length(gl_PointCoord - 0.5) * size;
         float rad = 2.2 + 0.5 * vK.w;
         float body = (1.0 - smoothstep(rad - 0.75, rad + 0.75, d)) * vK.x * mix(mix(0.45, 0.95, vK.y), 1.0, vK.z);
         float ring = (1.0 - smoothstep(0.3, 1.0, abs(d - 2.6))) * (1.0 - vK.x) * 0.34;
         float mark = vNamed > 0.5 ? (1.0 - smoothstep(0.35, 1.1, abs(d - 6.5))) * 0.55 : 0.0;
         vec3 col = mix(vec3(1.0), mix(uLilac, vec3(1.0, 0.96, 0.92), vK.w), vK.z);
         float a = max(body, max(ring, mark));
         if (a < 0.005) discard;
         gl_FragColor = vec4(body >= max(ring, mark) ? col : vec3(1.0), a * vDim);
       }`,
      false,
    )), 7);

    // suppliers: small rounded squares that glow while they send kits out
    const hubs = geo(new THREE.BufferGeometry());
    hubs.setAttribute('position', new THREE.BufferAttribute(f32(HUBS.length, (i) => [HUB_AT[i].x, 0.02, HUB_AT[i].z]), 3));
    hubs.setAttribute('aId', new THREE.BufferAttribute(f32(HUBS.length, (i) => [i]), 1));
    add(new THREE.Points(hubs, mat(
      `attribute float aId; uniform float uPx; varying float vHot, vOut; ${STAGE}
       void main() {
         vHot = abs(aId - uHotHub) < 0.5 ? 1.0 : 0.0;
         vOut = clamp((uDay - 1.0) * 4.0, 0.0, 1.0) * clamp((6.4 - uDay) / 0.8, 0.0, 1.0);
         gl_PointSize = 56.0 * uPx; ${VERT_WORLD}
       }`,
      `uniform vec3 uViolet; varying float vHot, vOut;
       void main() { float d = length(gl_PointCoord - 0.5) * 2.0; gl_FragColor = vec4(uViolet, pow(max(0.0, 1.0 - d), 2.4) * max(vOut, vHot * 0.7)); }`,
    )), 8);
    add(new THREE.Points(hubs, mat(
      `attribute float aId; uniform float uPx; varying float vHot; ${STAGE}
       void main() { vHot = abs(aId - uHotHub) < 0.5 ? 1.0 : 0.0; gl_PointSize = 15.0 * uPx; ${VERT_WORLD} }`,
      `uniform vec3 uLilac; varying float vHot;
       void main() {
         vec2 p = (gl_PointCoord - 0.5) * 15.0, q = abs(p) - vec2(3.4);
         float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 1.8;
         float fill = 1.0 - smoothstep(-0.5, 0.5, sd), border = 1.0 - smoothstep(0.45, 1.2, abs(sd + 0.65));
         float core = 1.0 - smoothstep(0.9, 1.8, length(p));
         vec3 col = mix(vec3(0.12, 0.09, 0.22), mix(uLilac, vec3(1.0), vHot), max(border, core));
         float a = max(fill * 0.94, border);
         if (a < 0.01) discard;
         gl_FragColor = vec4(col, a);
       }`,
      false,
    )), 9);

    // the streets and lakes arrive from the network and fade in
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
         void main() { vXZ = position.xz; vA = (aClass < 0.5 ? 0.5 : aClass < 1.5 ? 0.33 : aClass < 2.5 ? 0.21 : 0.12) * uShow * uBoost; ${VERT_WORLD} }`,
        `uniform vec3 uRoad; varying float vA; varying vec2 vXZ; ${EDGE}
         void main() { gl_FragColor = vec4(uRoad, vA * edge(vXZ)); }`,
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
        `varying vec2 vXZ; varying float vS; ${EDGE} void main() { gl_FragColor = vec4(0.03, 0.025, 0.06, 0.75 * vS * edge(vXZ)); }`,
        false,
      )), 1);
      const shore = geo(new THREE.BufferGeometry());
      shore.setAttribute('position', new THREE.Float32BufferAttribute(lr, 3));
      add(new THREE.LineSegments(shore, mat(
        `uniform float uShow, uBoost; varying vec2 vXZ; varying float vA; void main() { vXZ = position.xz; vA = 0.26 * uShow * uBoost; ${VERT_WORLD} }`,
        `uniform vec3 uLilac; varying vec2 vXZ; varying float vA; ${EDGE} void main() { gl_FragColor = vec4(uLilac, vA * edge(vXZ)); }`,
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
      // step the distance until the footprint (and its tallest column) sits inside the frame, leaving the top for the notification
      for (let k = 0; k < 5; k++) {
        place(R0, 0, TILT);
        let m = 0;
        for (const x of [BOX.x0, BOX.x1]) for (const z of [BOX.z0, BOX.z1]) for (const y of [0, BOX.top]) {
          v.set(x, y, z).project(camera);
          m = Math.max(m, Math.abs(v.x) / 0.86, v.y > 0 ? v.y / 0.74 : -v.y / 0.86);
        }
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
      if (!dirty) return;
      dirty = false;
      Object.assign(was, { day, filter: f, hub, cafe, spot: sid });
      U.uDay.value = day; U.uFilter.value = f; U.uHotHub.value = hub; U.uHotCafe.value = cafe; U.uShow.value = show;
      U.uTime.value = calm ? 0 : time;
      const into = (day - 1) / (DAYS - 1), ease = into * into * (3 - 2 * into);
      const yaw = calm ? 0 : 0.1 * Math.sin((time * Math.PI * 2) / 48) + lean.x * 0.11;
      const tilt = TILT + (calm ? 0 : 0.026 * Math.sin((time * Math.PI * 2) / 34) - lean.y * 0.05);
      place(R0 * (1 - 0.06 * ease), yaw, tilt);
      renderer.render(scene, camera);
      // the neighbourhood names and the labelled café ride along in HTML, so they stay crisp
      AREA_AT.forEach((a, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const [x, y] = toScreen(a.x, 0, a.z + a.r + 0.5);
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
        {AREA_AT.map((a, i) => <span key={a.name} ref={(el) => { labelRefs.current[i] = el; }}>{a.name}</span>)}
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
