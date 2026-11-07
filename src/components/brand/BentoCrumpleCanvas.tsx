'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import * as THREE from 'three';
import {
  createPaperPath,
  randomSource,
  type PaperPath,
} from '@/components/ui/PaperCrumple';

export interface BentoCrumpleHandle {
  reset: () => void;
  /** lays the cards out for the clearing, 0 → 1, and returns how many are in the bin */
  setScrollProgress: (progress: number) => number;
  syncPositions: () => void;
}

// The clearing, 0 → 1: each card takes CARD of it, the next starting STEP later. A card spends the first CRUMPLE of
// its share being crumpled where it lies (so you can watch it happen), then arcs over into the bin's mouth, shrinking
// to a wad that fits, and drops in behind the front of the can.
const CARD = 0.3, STEP = (1 - CARD) / 7, CRUMPLE = 0.52;
// the board clears from the middle out, starting with the card the bin stands on (indices as in BrandBento's TILES)
const ORDER = [5, 4, 1, 3, 0, 6, 2, 7];
const WAD = 150; // the widest a wad is drawn as it reaches the bin (its paper, crumpled, is about 0.4 of that)
const smooth = (k: number) => k * k * (3 - 2 * k);
const inOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);

export interface BentoCrumpleCanvasProps {
  beforeCardsRef: React.RefObject<(HTMLDivElement | null)[]>;
  dustbinRef: React.RefObject<HTMLDivElement | null>;
  stageRef: React.RefObject<HTMLElement | null>;
}

// Exact aspect ratios of the 8 captured Before cards (height / width)
const CARD_ASPECTS = [
  418 / 634, // 0: Brand (col 1-3)
  418 / 1072, // 1: Reach (col 4-8)
  862 / 852, // 2: Feed (col 9-12 tall)
  420 / 414, // 3: Numbers (col 1-2)
  420 / 634, // 4: Rating (col 3-5)
  862 / 634, // 5: Kit (col 6-8 tall)
  418 / 1072, // 6: Chart (col 1-5)
  418 / 852, // 7: Waste (col 9-12)
];

interface CardMeshInfo {
  index: number;
  group: THREE.Group;
  geometry: THREE.BufferGeometry;
  renderPositions: Float32Array;
  renderNormals: Float32Array;
  renderUvs: Float32Array;
  faceNormals: Float32Array;
  incidentFaces: number[][];
  indices: number[];
  paperPath: PaperPath;
  positions: Float32Array;
  aspect: number;
  cardWidth: number;
  cardHeight: number;
  startX: number;
  startY: number;
  mouthX: number;
  mouthY: number;
  arcH: number;
  tumbleX: number;
  tumbleY: number;
  tumbleZ: number;
  currentFold: number;
  currentFlight: number;
  isCaught: boolean;
  isActive: boolean;
}

export const BentoCrumpleCanvas = forwardRef<BentoCrumpleHandle, BentoCrumpleCanvasProps>(
  function BentoCrumpleCanvas({ beforeCardsRef, dustbinRef, stageRef }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const cardMeshesRef = useRef<CardMeshInfo[]>([]);
    const animFrameRef = useRef<number>(0);
    const isPlayingRef = useRef<boolean>(false);
    const texturesRef = useRef<THREE.Texture[]>([]);

    // ── Helper: Deform mesh vertices using React Bits createPaperPath simulation ──
    const deformMesh = useCallback((card: CardMeshInfo, foldValue: number) => {
      const fold = Math.min(1, Math.max(0, foldValue));
      card.currentFold = fold;
      const samples = card.paperPath.samples;
      const sampleFrame = fold * (samples.length - 1);
      const lower = Math.floor(sampleFrame);
      const upper = Math.min(lower + 1, samples.length - 1);
      const mix = sampleFrame - lower;
      const from = samples[lower];
      const to = samples[upper];

      // Linear blend between simulation keyframe samples
      for (let i = 0; i < card.positions.length; i++) {
        card.positions[i] = from[i] + (to[i] - from[i]) * mix;
      }

      // Compute individual face normals
      const ind = card.indices;
      for (let face = 0; face < ind.length; face += 3) {
        const aIdx = ind[face] * 3;
        const bIdx = ind[face + 1] * 3;
        const cIdx = ind[face + 2] * 3;
        const bx = card.positions[bIdx] - card.positions[aIdx];
        const by = card.positions[bIdx + 1] - card.positions[aIdx + 1];
        const bz = card.positions[bIdx + 2] - card.positions[aIdx + 2];
        const cx = card.positions[cIdx] - card.positions[aIdx];
        const cy = card.positions[cIdx + 1] - card.positions[aIdx + 1];
        const cz = card.positions[cIdx + 2] - card.positions[aIdx + 2];
        let nx = by * cz - bz * cy;
        let ny = bz * cx - bx * cz;
        let nz = bx * cy - by * cx;
        const len = Math.hypot(nx, ny, nz) || 1;
        card.faceNormals[face] = nx / len;
        card.faceNormals[face + 1] = ny / len;
        card.faceNormals[face + 2] = nz / len;
      }

      // Compute weighted vertex normals for crisp polygonal crease shading
      for (let i = 0; i < ind.length; i++) {
        const source = ind[i] * 3;
        const face = Math.floor(i / 3) * 3;
        let nx = 0,
          ny = 0,
          nz = 0;
        const neighbors = card.incidentFaces[ind[i]];
        for (let n = 0; n < neighbors.length; n++) {
          const neighbor = neighbors[n];
          const dot =
            card.faceNormals[face] * card.faceNormals[neighbor] +
            card.faceNormals[face + 1] * card.faceNormals[neighbor + 1] +
            card.faceNormals[face + 2] * card.faceNormals[neighbor + 2];
          const weight = THREE.MathUtils.smoothstep(dot, 0.72, 0.98);
          nx += card.faceNormals[neighbor] * weight;
          ny += card.faceNormals[neighbor + 1] * weight;
          nz += card.faceNormals[neighbor + 2] * weight;
        }
        const len = Math.hypot(nx, ny, nz) || 1;
        card.renderPositions[i * 3] = card.positions[source];
        card.renderPositions[i * 3 + 1] = card.positions[source + 1];
        card.renderPositions[i * 3 + 2] = card.positions[source + 2];
        card.renderNormals[i * 3] = nx / len;
        card.renderNormals[i * 3 + 1] = ny / len;
        card.renderNormals[i * 3 + 2] = nz / len;
      }

      card.geometry.attributes.position.needsUpdate = true;
      card.geometry.attributes.normal.needsUpdate = true;
    }, []);

    // ── Synchronize 3D meshes with DOM elements ──
    const syncPositions = useCallback(() => {
      const stage = stageRef.current;
      const bin = dustbinRef.current;
      const cards = beforeCardsRef.current;
      if (!stage || !cameraRef.current || !rendererRef.current) return;

      const stageRect = stage.getBoundingClientRect();
      const stageW = stageRect.width;
      const stageH = stageRect.height;

      // Update camera projection to match exact stage pixel viewport
      const camera = cameraRef.current;
      const fov = 40;
      camera.fov = fov;
      camera.aspect = stageW / stageH;
      const dist = stageH / 2 / Math.tan((fov * Math.PI) / 360);
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      const size = rendererRef.current.getSize(new THREE.Vector2());
      if (size.x !== stageW || size.y !== stageH) rendererRef.current.setSize(stageW, stageH, false);

      // Dustbin mouth in 3D world space (centered)
      let mouthX = 0;
      let mouthY = 0;
      if (bin) {
        const binRect = bin.getBoundingClientRect();
        mouthX = binRect.left + binRect.width / 2 - (stageRect.left + stageW / 2);
        mouthY = stageRect.top + stageH / 2 - (binRect.top + binRect.height * 0.21);
      }

      cardMeshesRef.current.forEach((cardMesh, i) => {
        const domCard = cards ? cards[i] : null;
        if (!domCard) return;
        const rect = domCard.getBoundingClientRect();
        const cardW = rect.width;
        const cardH = rect.height;

        // Position card center in 3D world coordinates
        const startX = rect.left + cardW / 2 - (stageRect.left + stageW / 2);
        const startY = stageRect.top + stageH / 2 - (rect.top + cardH / 2);

        cardMesh.cardWidth = cardW;
        cardMesh.cardHeight = cardH;
        cardMesh.startX = startX;
        cardMesh.startY = startY;
        cardMesh.mouthX = mouthX;
        cardMesh.mouthY = mouthY;
        const distToMouth = Math.hypot(mouthX - startX, mouthY - startY);
        cardMesh.arcH = Math.max(70, Math.min(170, distToMouth * 0.28));

        if (!cardMesh.isActive) {
          cardMesh.group.position.set(startX, startY, 0);
          cardMesh.group.scale.set(cardW, cardW, cardW);
          cardMesh.group.rotation.set(0, 0, 0);
        }
      });
    }, [beforeCardsRef, dustbinRef, stageRef]);

    // ── Setup Three.js Stage & Paper Meshes ──
    useEffect(() => {
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      if (!canvas || !stage) return;

      const stageRect = stage.getBoundingClientRect();
      const stageW = Math.max(10, stageRect.width);
      const stageH = Math.max(10, stageRect.height);

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        });
      } catch (e) {
        console.error('WebGL failed to initialize', e);
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(stageW, stageH, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      rendererRef.current = renderer;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const fov = 40;
      const dist = stageH / 2 / Math.tan((fov * Math.PI) / 360);
      const camera = new THREE.PerspectiveCamera(fov, stageW / stageH, 1, 10000);
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Realistic lighting for physical paper creases
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0xb0a8c4, 1.3);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xfffbf2, 2.4);
      dirLight.position.set(-240, 360, 480);
      scene.add(dirLight);

      // Subtle violet rim light from central dustbin
      const purpleRim = new THREE.PointLight(0xa78bfa, 2.5, 1200);
      purpleRim.position.set(0, 0, 220);
      scene.add(purpleRim);

      // Subtle paper grain bump texture
      const grainRng = randomSource(42);
      const grainData = new Uint8Array(128 * 128 * 4);
      for (let i = 0; i < grainData.length; i += 4) {
        const val = 120 + Math.floor(grainRng() * 135);
        grainData[i] = val;
        grainData[i + 1] = val;
        grainData[i + 2] = val;
        grainData[i + 3] = 255;
      }
      const grainTexture = new THREE.DataTexture(grainData, 128, 128);
      grainTexture.wrapS = grainTexture.wrapT = THREE.RepeatWrapping;
      grainTexture.repeat.set(4, 4);
      grainTexture.needsUpdate = true;

      // Load static textures for the 8 cards
      const texLoader = new THREE.TextureLoader();
      const loadedTextures: THREE.Texture[] = [];
      for (let i = 0; i < 8; i++) {
        const tex = texLoader.load(`/brand/card-before-${i}.png`, () => {
          renderer.render(scene, camera);
        });
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        loadedTextures.push(tex);
      }
      texturesRef.current = loadedTextures;

      // Build 8 Paper Meshes using React Bits PaperCrumple physical solver
      const cardMeshes: CardMeshInfo[] = [];

      for (let i = 0; i < 8; i++) {
        const resolution = 16;
        const aspect = CARD_ASPECTS[i];
        const shortSide = Math.min(1, aspect);
        const columns = Math.max(8, Math.round(resolution / Math.max(1, aspect)));
        const rows = Math.max(8, Math.round(resolution * Math.min(1, aspect)));
        const count = (columns + 1) * (rows + 1);

        const original = new Float32Array(count * 3);
        const positions = new Float32Array(count * 3);
        const uvs = new Float32Array(count * 2);
        const indices: number[] = [];
        const rng = randomSource(7 + i * 43);

        // Standard React Bits PaperCrumple vertex layout:
        // u from 0 to 1, v from 0 to 1
        // x = u - 0.5 (centered at 0)
        // y = (v - 0.5) * aspect (centered at 0)
        for (let row = 0; row <= rows; row++) {
          for (let col = 0; col <= columns; col++) {
            const idx = row * (columns + 1) + col;
            const u = (col + (col > 0 && col < columns ? (rng() - 0.5) * 0.45 : 0)) / columns;
            const v = (row + (row > 0 && row < rows ? (rng() - 0.5) * 0.45 : 0)) / rows;
            const x = u - 0.5;
            const y = (v - 0.5) * aspect;

            original[idx * 3] = x;
            original[idx * 3 + 1] = y;
            original[idx * 3 + 2] = 0;
            positions[idx * 3] = x;
            positions[idx * 3 + 1] = y;
            positions[idx * 3 + 2] = 0;

            uvs[idx * 2] = u;
            uvs[idx * 2 + 1] = v;

            if (col < columns && row < rows) {
              const a = idx;
              const b = idx + 1;
              const c = idx + columns + 1;
              const d = c + 1;
              if (rng() > 0.5) indices.push(a, b, d, a, d, c);
              else indices.push(a, b, c, b, d, c);
            }
          }
        }

        // Run the React Bits createPaperPath physics simulation (64 samples)
        const foldTotal = 8 + (i % 3);
        const sharpness = 0.72;
        const depth = 0.95;
        const paperPath = createPaperPath(
          original,
          indices,
          shortSide,
          foldTotal,
          sharpness,
          depth,
          7 + i * 43
        );

        const renderPositions = new Float32Array(indices.length * 3);
        const renderNormals = new Float32Array(indices.length * 3);
        const renderUvs = new Float32Array(indices.length * 2);
        const faceNormals = new Float32Array(indices.length);
        const incidentFaces: number[][] = Array.from({ length: count }, () => []);

        for (let k = 0; k < indices.length; k++) {
          const vIdx = indices[k];
          renderUvs[k * 2] = uvs[vIdx * 2];
          renderUvs[k * 2 + 1] = uvs[vIdx * 2 + 1];
          incidentFaces[vIdx].push(Math.floor(k / 3) * 3);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(renderPositions, 3).setUsage(THREE.DynamicDrawUsage)
        );
        geometry.setAttribute(
          'normal',
          new THREE.BufferAttribute(renderNormals, 3).setUsage(THREE.DynamicDrawUsage)
        );
        geometry.setAttribute('uv', new THREE.BufferAttribute(renderUvs, 2));

        // Front material with printed card screenshot + fine paper bump texture
        const frontMaterial = new THREE.MeshStandardMaterial({
          map: loadedTextures[i],
          bumpMap: grainTexture,
          bumpScale: 0.05,
          roughness: 0.82,
          metalness: 0.02,
          side: THREE.FrontSide,
        });

        // Back material with textured kraft paper stock
        const backMaterial = new THREE.MeshStandardMaterial({
          color: 0xf5f0e6,
          bumpMap: grainTexture,
          bumpScale: 0.06,
          roughness: 0.92,
          metalness: 0.0,
          side: THREE.BackSide,
        });

        const frontMesh = new THREE.Mesh(geometry, frontMaterial);
        const backMesh = new THREE.Mesh(geometry, backMaterial);
        const group = new THREE.Group();
        group.add(frontMesh, backMesh);
        group.visible = false; // Initially hidden until crumple triggers
        scene.add(group);

        const cardInfo: CardMeshInfo = {
          index: i,
          group,
          geometry,
          renderPositions,
          renderNormals,
          renderUvs,
          faceNormals,
          incidentFaces,
          indices,
          paperPath,
          positions,
          aspect,
          cardWidth: 320,
          cardHeight: 200,
          startX: 0,
          startY: 0,
          mouthX: 0,
          mouthY: 0,
          arcH: 160,
          tumbleX: (i % 2 === 0 ? 1 : -1) * (14 + i * 2),
          tumbleY: (i % 3 === 0 ? -1 : 1) * (16 + i * 3),
          tumbleZ: (i % 2 === 1 ? 1 : -1) * (18 + i * 2),
          currentFold: 0,
          currentFlight: 0,
          isCaught: false,
          isActive: false,
        };

        // Initialize flat vertices
        deformMesh(cardInfo, 0);
        cardMeshes.push(cardInfo);
      }

      cardMeshesRef.current = cardMeshes;
      syncPositions();

      // Initial render
      renderer.render(scene, camera);

      // Handle window resize
      const handleResize = () => {
        syncPositions();
        renderer.render(scene, camera);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        cardMeshes.forEach((c) => {
          c.geometry.dispose();
          scene.remove(c.group);
        });
        renderer.dispose();
      };
    }, [deformMesh, syncPositions, stageRef]);

    // ── Reset All Cards to Flat Initial State ──
    const reset = useCallback(() => {
      isPlayingRef.current = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      const cards = beforeCardsRef.current;
      cardMeshesRef.current.forEach((cardMesh, i) => {
        cardMesh.isActive = false;
        cardMesh.isCaught = false;
        cardMesh.currentFold = 0;
        cardMesh.currentFlight = 0;
        cardMesh.group.visible = false;
        cardMesh.group.position.set(cardMesh.startX, cardMesh.startY, 0);
        cardMesh.group.scale.set(cardMesh.cardWidth, cardMesh.cardWidth, cardMesh.cardWidth);
        cardMesh.group.rotation.set(0, 0, 0);
        deformMesh(cardMesh, 0);

        // Restore DOM card visibility
        if (cards && cards[i]) {
          cards[i]!.style.opacity = '1';
          cards[i]!.style.visibility = 'visible';
        }
      });

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    }, [beforeCardsRef, deformMesh]);

    // ── Scrubbing: the clearing, driven by scroll ──
    const setScrollProgress = useCallback(
      (progress: number) => {
        syncPositions();
        const cards = beforeCardsRef.current;
        const q = Math.min(1, Math.max(0, progress));
        let caught = 0;

        cardMeshesRef.current.forEach((card, i) => {
          const local = Math.min(1, Math.max(0, (q - ORDER.indexOf(i) * STEP) / CARD));
          const dom = cards ? cards[i] : null;
          const showDom = (on: boolean) => {
            if (!dom) return;
            dom.style.opacity = on ? '1' : '0';
            dom.style.visibility = on ? 'visible' : 'hidden';
          };

          if (local <= 0) {
            card.group.visible = false;
            card.isActive = false;
            card.isCaught = false;
            showDom(true);
            return;
          }
          if (local >= 1) {
            card.group.visible = false;
            card.isCaught = true;
            caught++;
            showDom(false);
            return;
          }

          card.isActive = true;
          card.isCaught = false;
          card.group.visible = true;
          showDom(false);
          const tilt = i % 2 === 0 ? 1 : -1;

          if (local <= CRUMPLE) {
            // crumpled where it lies: it lifts a little and draws in as the paper folds
            const k = smooth(local / CRUMPLE);
            deformMesh(card, k);
            card.group.position.set(card.startX, card.startY, Math.sin(k * Math.PI) * 28);
            card.group.rotation.set(k * 0.16, -k * 0.12, k * 0.3 * tilt);
            const sc = card.cardWidth * (1 - 0.3 * k);
            card.group.scale.set(sc, sc, sc);
            return;
          }

          // thrown: a soft arc to the mouth, a wad small enough to fit, then down behind the front of the can
          deformMesh(card, 1);
          const f = (local - CRUMPLE) / (1 - CRUMPLE), e = inOut(f);
          const from = card.cardWidth * 0.7, to = Math.min(from, WAD);
          let x = card.startX + (card.mouthX - card.startX) * e;
          let y = card.startY + (card.mouthY - card.startY) * e + 4 * card.arcH * f * (1 - f);
          let z = 28 * (1 - f) + Math.sin(f * Math.PI) * 70;
          let sc = from + (to - from) * smooth(Math.min(1, f / 0.8));
          if (f > 0.78) {
            const drop = (f - 0.78) / 0.22;
            x = card.mouthX;
            y = card.mouthY - drop * 60;
            z *= 1 - drop;
            sc *= 1 - drop * 0.35;
          }
          card.group.position.set(x, y, z);
          card.group.rotation.set(0.3 + f * card.tumbleX * 0.35, -0.12 + f * card.tumbleY * 0.35, 0.3 * tilt + f * card.tumbleZ * 0.35);
          card.group.scale.set(sc, sc, sc);
        });

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        return caught;
      },
      [beforeCardsRef, deformMesh, syncPositions]
    );

    useImperativeHandle(
      ref,
      () => ({
        reset,
        setScrollProgress,
        syncPositions,
      }),
      [reset, setScrollProgress, syncPositions]
    );

    return <canvas ref={canvasRef} className="bbo-crumple-canvas" aria-hidden="true" />;
  }
);
