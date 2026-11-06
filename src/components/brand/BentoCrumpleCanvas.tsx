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
  playTossSequence: (
    onCardCaught: (cardIndex: number) => void,
    onComplete: () => void
  ) => void;
  reset: () => void;
  setScrollProgress: (progress: number) => void;
  syncPositions: () => void;
}

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

      rendererRef.current.setSize(stageW, stageH, false);

      // Dustbin mouth in 3D world space (centered)
      let mouthX = 0;
      let mouthY = 0;
      if (bin) {
        const binRect = bin.getBoundingClientRect();
        mouthX = binRect.left + binRect.width / 2 - (stageRect.left + stageW / 2);
        mouthY = stageRect.top + stageH / 2 - (binRect.top + 48);
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
        cardMesh.arcH = Math.max(140, Math.min(260, distToMouth * 0.38));

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

    // ── Play Sequence: Physical Crumple & 3D Toss Cascade ──
    const playTossSequence = useCallback(
      (onCardCaught: (cardIndex: number) => void, onComplete: () => void) => {
        syncPositions();
        isPlayingRef.current = true;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        const startTime = performance.now();
        const cards = beforeCardsRef.current;

        // Timing per card (seconds)
        // Phase A: In-place paper crumpling (0.72s) -> tactile paper creasing & contraction
        // Phase B: 3D parabolic launch & flight to central dustbin (0.68s)
        const crumpleDuration = 0.72;
        const flightDuration = 0.68;
        const stagger = 0.18;

        const loop = (time: number) => {
          const elapsed = (time - startTime) / 1000;
          let allFinished = true;

          cardMeshesRef.current.forEach((card, i) => {
            const cardStart = i * stagger;
            const cardTime = elapsed - cardStart;

            if (cardTime < 0) {
              allFinished = false;
              return;
            }

            card.isActive = true;

            // When card begins crumpling, swap DOM card for 3D Three.js paper sheet
            if (!card.group.visible) {
              card.group.visible = true;
              if (cards && cards[i]) {
                cards[i]!.style.opacity = '0';
                cards[i]!.style.visibility = 'hidden';
              }
            }

            if (cardTime <= crumpleDuration) {
              // ── Phase A: In-Place 3D Paper Crumpling ──
              allFinished = false;
              const foldProgress = Math.min(1, cardTime / crumpleDuration);
              const foldEase = foldProgress * foldProgress * (3 - 2 * foldProgress);
              deformMesh(card, foldEase);

              // Lift slightly towards camera as paper contracts into wad
              const liftZ = Math.sin(foldProgress * Math.PI) * 48;
              card.group.position.set(card.startX, card.startY, liftZ);

              // Subtle natural twist during crumple
              const twist = foldProgress * 0.35;
              card.group.rotation.set(
                twist * 0.45,
                -twist * 0.35,
                twist * (i % 2 === 0 ? 0.7 : -0.7)
              );
              card.group.scale.set(card.cardWidth, card.cardWidth, card.cardWidth);
            } else {
              // ── Phase B: 3D Flight & Parabolic Toss to Central Dustbin ──
              deformMesh(card, 1); // Keep fully crumpled!

              const flightTime = cardTime - crumpleDuration;
              const flightProgress = Math.min(1, flightTime / flightDuration);
              card.currentFlight = flightProgress;

              if (flightProgress < 1) {
                allFinished = false;

                const p = flightProgress;
                const pEase = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

                const curX = card.startX + (card.mouthX - card.startX) * pEase;
                const arc = 4 * card.arcH * p * (1 - p);
                let curY = card.startY + (card.mouthY - card.startY) * pEase + arc;

                // High 3D arc leaping out towards camera, then diving deep into the dustbin hole
                let curZ = 35 * (1 - p) + Math.sin(p * Math.PI) * 160;
                let scaleMul = 1;

                if (p > 0.70) {
                  const plunge = (p - 0.70) / 0.30;
                  curZ -= plunge * 150;
                  curY -= plunge * 55; // Plunge DOWN into the center canister interior!
                  scaleMul = Math.max(0.01, 1 - plunge * 0.96);
                }

                if (p >= 0.95) {
                  // Vanish completely into the dark void
                  card.group.visible = false;
                }

                card.group.position.set(curX, curY, curZ);

                // Full 3D tumbling rotation
                card.group.rotation.x = 0.2 + p * card.tumbleX;
                card.group.rotation.y = -0.15 + p * card.tumbleY;
                card.group.rotation.z = (i % 2 === 0 ? 0.3 : -0.3) + p * card.tumbleZ;

                const finalScale = card.cardWidth * scaleMul;
                card.group.scale.set(finalScale, finalScale, finalScale);
              } else {
                // Plunged into dustbin!
                card.group.visible = false;
                if (!card.isCaught) {
                  card.isCaught = true;
                  onCardCaught(i);
                }
              }
            }
          });

          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }

          if (!allFinished) {
            animFrameRef.current = requestAnimationFrame(loop);
          } else {
            // Guarantee all cards are completely invisible and caught
            cardMeshesRef.current.forEach((c) => {
              c.group.visible = false;
              c.isCaught = true;
            });
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
              rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
            isPlayingRef.current = false;
            onComplete();
          }
        };

        animFrameRef.current = requestAnimationFrame(loop);
      },
      [beforeCardsRef, deformMesh, syncPositions]
    );

    // ── Scrubbing Support for Scroll-Linked Animation ──
    const setScrollProgress = useCallback(
      (progress: number) => {
        if (isPlayingRef.current) return;
        syncPositions();

        const cards = beforeCardsRef.current;
        const p = Math.min(1, Math.max(0, progress));

        // When p >= 0.74, all cards are cleanly inside the central dustbin!
        if (p >= 0.74) {
          cardMeshesRef.current.forEach((card, idx) => {
            card.group.visible = false;
            card.isCaught = true;
            if (cards && cards[idx]) {
              cards[idx]!.style.opacity = '0';
              cards[idx]!.style.visibility = 'hidden';
            }
          });
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
          return;
        }

        // Active cascade for p < 0.74:
        // 8 cards spread across p = 0.0 to 0.74
        // Each card has stagger = 0.055, duration = 0.32
        const stagger = 0.055;
        const cardDuration = 0.32;

        cardMeshesRef.current.forEach((card, i) => {
          const cardStart = i * stagger;
          const localP = Math.min(1, Math.max(0, (p - cardStart) / cardDuration));

          if (localP <= 0) {
            card.group.visible = false;
            card.isActive = false;
            card.isCaught = false;
            if (cards && cards[i]) {
              cards[i]!.style.opacity = '1';
              cards[i]!.style.visibility = 'visible';
            }
          } else if (localP < 1) {
            card.group.visible = true;
            card.isActive = true;
            card.isCaught = false;
            if (cards && cards[i]) {
              cards[i]!.style.opacity = '0';
              cards[i]!.style.visibility = 'hidden';
            }

            if (localP <= 0.45) {
              // ── Phase A: In-Place 3D Crumpling ──
              const crumpleP = localP / 0.45;
              const foldEase = crumpleP * crumpleP * (3 - 2 * crumpleP);
              deformMesh(card, foldEase);
              const liftZ = Math.sin(crumpleP * Math.PI) * 48;
              card.group.position.set(card.startX, card.startY, liftZ);
              const twist = crumpleP * 0.35;
              card.group.rotation.set(
                twist * 0.45,
                -twist * 0.35,
                twist * (i % 2 === 0 ? 0.7 : -0.7)
              );
              card.group.scale.set(card.cardWidth, card.cardWidth, card.cardWidth);
            } else {
              // ── Phase B: 3D Parabolic Flight to Central Dustbin ──
              deformMesh(card, 1);
              const flightP = (localP - 0.45) / 0.55;
              const pEase = flightP < 0.5 ? 2 * flightP * flightP : 1 - Math.pow(-2 * flightP + 2, 2) / 2;
              const curX = card.startX + (card.mouthX - card.startX) * pEase;
              const arc = 4 * card.arcH * flightP * (1 - flightP);
              let curY = card.startY + (card.mouthY - card.startY) * pEase + arc;
              let curZ = 35 * (1 - flightP) + Math.sin(flightP * Math.PI) * 160;

              let scaleMul = 1;
              if (flightP > 0.70) {
                const plunge = (flightP - 0.70) / 0.30;
                curZ -= plunge * 150;
                curY -= plunge * 55; // Plunge DOWN into the center canister opening!
                scaleMul = Math.max(0.01, 1 - plunge * 0.96);
              }

              if (flightP >= 0.95) {
                // Already inside the dark opening, hide completely!
                card.group.visible = false;
              }

              card.group.position.set(curX, curY, curZ);
              card.group.rotation.set(
                0.2 + flightP * card.tumbleX,
                -0.15 + flightP * card.tumbleY,
                (i % 2 === 0 ? 0.3 : -0.3) + flightP * card.tumbleZ
              );
              const finalScale = card.cardWidth * scaleMul;
              card.group.scale.set(finalScale, finalScale, finalScale);
            }
          } else {
            // localP >= 1: 100% swallowed into dustbin
            card.group.visible = false;
            card.isCaught = true;
            if (cards && cards[i]) {
              cards[i]!.style.opacity = '0';
              cards[i]!.style.visibility = 'hidden';
            }
          }
        });

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      },
      [beforeCardsRef, deformMesh, syncPositions]
    );

    useImperativeHandle(
      ref,
      () => ({
        playTossSequence,
        reset,
        setScrollProgress,
        syncPositions,
      }),
      [playTossSequence, reset, setScrollProgress, syncPositions]
    );

    return <canvas ref={canvasRef} className="bbo-crumple-canvas" aria-hidden="true" />;
  }
);
