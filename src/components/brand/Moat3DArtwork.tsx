'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED THREE.JS CONSTANTS & HELPERS
   - Color palette directly matching Brand Portal Purple (#502B9A):
     #08080C (obsidian canvas), #251448 (glass violet), #502B9A / #7F48E8 (pure purple core)
───────────────────────────────────────────────────────────────────────────── */
const COLOR_GLASS_FILL = 0x251448;
const COLOR_GLASS_EDGE = 0x7f48e8;
const COLOR_ACTIVE_FILL = 0x502b9a;
const COLOR_ACTIVE_EMISSIVE = 0x6d3bcf;
const COLOR_ACTIVE_EDGE = 0xd9c6fa;

function createIsometricCamera(width: number, height: number, distance: number = 3.6) {
  const aspect = width / height;
  const camera = new THREE.OrthographicCamera(
    -distance * aspect,
    distance * aspect,
    distance,
    -distance,
    0.1,
    100
  );
  camera.position.set(5.2, 4.4, 5.2);
  camera.lookAt(0, 0, 0);
  return camera;
}

function setupLighting(scene: THREE.Scene) {
  const ambLight = new THREE.AmbientLight(0x251448, 2.2);
  scene.add(ambLight);

  const dirLight = new THREE.DirectionalLight(0xf3edfd, 2.6);
  dirLight.position.set(4, 7, 3);
  scene.add(dirLight);

  const rimLight = new THREE.PointLight(0x502b9a, 4.5, 14);
  rimLight.position.set(-3, 3, -3);
  scene.add(rimLight);
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. DEMAND STRATA 3D (Card 1: Demand Intelligence)
   - 3-tiered stacked isometric data strata
   - Exploded view separation transition on hover
   - Active peak forecast cube that pulses and reacts to W1-W5 telemetry scrub
───────────────────────────────────────────────────────────────────────────── */
interface DemandStrata3DProps {
  isHovered?: boolean;
  activeIdx?: number;
}

export function DemandStrata3D({ isHovered = false, activeIdx = 4 }: DemandStrata3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isHoveredRef = useRef(isHovered);
  const activeIdxRef = useRef(activeIdx);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    activeIdxRef.current = activeIdx;
  }, [activeIdx]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || 118;
    let height = container.clientHeight || 180;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = createIsometricCamera(width, height, 3.5);
    setupLighting(scene);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Materials
    const glassMat = new THREE.MeshStandardMaterial({
      color: COLOR_GLASS_FILL,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.62,
    });
    const edgeMat = new THREE.LineBasicMaterial({
      color: COLOR_GLASS_EDGE,
      transparent: true,
      opacity: 0.85,
    });
    const activeMat = new THREE.MeshStandardMaterial({
      color: COLOR_ACTIVE_FILL,
      emissive: COLOR_ACTIVE_EMISSIVE,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.1,
    });
    const activeEdgeMat = new THREE.LineBasicMaterial({
      color: COLOR_ACTIVE_EDGE,
      linewidth: 2,
    });

    // 3 Stacked Slabs
    const slabGeo = new RoundedBoxGeometry(2.7, 0.26, 1.85, 4, 0.04);
    const slabEdges = new THREE.EdgesGeometry(slabGeo);
    const slabs: THREE.Mesh[] = [];

    for (let i = 0; i < 3; i++) {
      const slab = new THREE.Mesh(slabGeo, glassMat);
      slab.add(new THREE.LineSegments(slabEdges, edgeMat));
      slab.position.y = (i - 1) * 0.72;
      rootGroup.add(slab);
      slabs.push(slab);
    }

    // Top Deck: Modular Forecast & Telemetry Blocks
    const peakGeo = new RoundedBoxGeometry(0.72, 0.48, 0.72, 4, 0.05);
    const peakEdges = new THREE.EdgesGeometry(peakGeo);
    const peakCube = new THREE.Mesh(peakGeo, activeMat);
    peakCube.add(new THREE.LineSegments(peakEdges, activeEdgeMat));
    peakCube.position.set(-0.58, 0.98, -0.32);
    rootGroup.add(peakCube);

    const sub1Geo = new RoundedBoxGeometry(0.58, 0.26, 0.58, 4, 0.04);
    const sub1Edges = new THREE.EdgesGeometry(sub1Geo);
    const subCube1 = new THREE.Mesh(sub1Geo, glassMat);
    subCube1.add(new THREE.LineSegments(sub1Edges, edgeMat));
    subCube1.position.set(0.62, 0.88, 0.36);
    rootGroup.add(subCube1);

    const sub2Geo = new RoundedBoxGeometry(0.48, 0.22, 0.48, 4, 0.04);
    const sub2Edges = new THREE.EdgesGeometry(sub2Geo);
    const subCube2 = new THREE.Mesh(sub2Geo, glassMat);
    subCube2.add(new THREE.LineSegments(sub2Edges, edgeMat));
    subCube2.position.set(0.62, 0.86, -0.34);
    rootGroup.add(subCube2);

    // Data connector pins linking the strata
    const pinGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.6, 8);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0x7f48e8, transparent: true, opacity: 0.45 });
    const pin1 = new THREE.Mesh(pinGeo, pinMat);
    pin1.position.set(-0.58, 0.1, -0.32);
    rootGroup.add(pin1);

    // Mouse Parallax
    let mouseX = 0, mouseY = 0;
    let targetRotX = 0, targetRotY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x * 0.35;
      mouseY = y * 0.25;
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', () => {
      mouseX = 0;
      mouseY = 0;
    });

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Mouse Parallax Smooth Lerp
      targetRotX = mouseY;
      targetRotY = mouseX;
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.08;
      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.08;

      // Gentle floating levitation
      rootGroup.position.y = Math.sin(time * 1.6) * 0.06;

      // Exploded View Transition on Hover: slabs smoothly expand apart
      const targetGap = isHoveredRef.current ? 1.08 : 0.72;
      slabs[0].position.y += (-targetGap - slabs[0].position.y) * 0.08;
      slabs[1].position.y += (0 - slabs[1].position.y) * 0.08;
      slabs[2].position.y += (targetGap - slabs[2].position.y) * 0.08;

      // Top blocks float with the top slab
      const topBaseY = slabs[2].position.y;
      const currentActiveIdx = activeIdxRef.current;
      const volumeFactor = 0.8 + (currentActiveIdx / 4) * 0.45;

      peakCube.position.y += (topBaseY + 0.32 * volumeFactor - peakCube.position.y) * 0.1;
      peakCube.scale.setScalar(1.0 + Math.sin(time * 3.5) * 0.04);
      subCube1.position.y += (topBaseY + 0.16 - subCube1.position.y) * 0.08;
      subCube2.position.y += (topBaseY + 0.14 - subCube2.position.y) * 0.08;
      pin1.position.y = (slabs[0].position.y + slabs[2].position.y) * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 118;
      height = container.clientHeight || 180;
      renderer.setSize(width, height);
      const aspect = width / height;
      camera.left = -3.5 * aspect;
      camera.right = 3.5 * aspect;
      camera.top = 3.5;
      camera.bottom = -3.5;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      slabGeo.dispose();
      slabEdges.dispose();
      peakGeo.dispose();
      peakEdges.dispose();
      sub1Geo.dispose();
      sub2Geo.dispose();
      pinGeo.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="bmoat-3d-wrap" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. CAFE DISCOVERY 3D (Card 2: Direct Café Discovery)
   - Turntable laser ring with central artisanal craft bottle / specimen wireframe
   - 4 floating satellite café trial nodes orbiting around the vessel
   - Active node illuminates and connects via a neon laser beam
───────────────────────────────────────────────────────────────────────────── */
interface CafeDiscovery3DProps {
  isHovered?: boolean;
  activeVenueIdx?: number;
}

export function CafeDiscovery3D({ isHovered = false, activeVenueIdx = 0 }: CafeDiscovery3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isHoveredRef = useRef(isHovered);
  const activeIdxRef = useRef(activeVenueIdx);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    activeIdxRef.current = activeVenueIdx;
  }, [activeVenueIdx]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || 118;
    let height = container.clientHeight || 180;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = createIsometricCamera(width, height, 3.6);
    setupLighting(scene);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Materials
    const glassMat = new THREE.MeshStandardMaterial({
      color: COLOR_GLASS_FILL,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.62,
    });
    const edgeMat = new THREE.LineBasicMaterial({
      color: COLOR_GLASS_EDGE,
      transparent: true,
      opacity: 0.85,
    });
    const activeMat = new THREE.MeshStandardMaterial({
      color: COLOR_ACTIVE_FILL,
      emissive: COLOR_ACTIVE_EMISSIVE,
      emissiveIntensity: 0.9,
      roughness: 0.15,
      metalness: 0.1,
    });
    const activeEdgeMat = new THREE.LineBasicMaterial({
      color: COLOR_ACTIVE_EDGE,
      linewidth: 2,
    });

    // Base Circular Turntable & Concentric Radar Ring
    const ringGeo = new THREE.RingGeometry(1.65, 1.76, 40);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x502b9a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.1;
    rootGroup.add(ring);

    const innerRingGeo = new THREE.RingGeometry(0.85, 0.92, 32);
    const innerRing = new THREE.Mesh(innerRingGeo, ringMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = -1.09;
    rootGroup.add(innerRing);

    // Central Artisanal Specimen Bottle (Lathe Wireframe Profile)
    const points: THREE.Vector2[] = [
      new THREE.Vector2(0.0, -1.0),
      new THREE.Vector2(0.52, -1.0),
      new THREE.Vector2(0.54, 0.15),
      new THREE.Vector2(0.38, 0.55),
      new THREE.Vector2(0.24, 0.8),
      new THREE.Vector2(0.24, 1.1),
      new THREE.Vector2(0.28, 1.14),
      new THREE.Vector2(0.28, 1.25),
      new THREE.Vector2(0.0, 1.25),
    ];
    const bottleGeo = new THREE.LatheGeometry(points, 20);
    const bottleWire = new THREE.WireframeGeometry(bottleGeo);
    const bottleLine = new THREE.LineSegments(
      bottleWire,
      new THREE.LineBasicMaterial({ color: 0x7f48e8, transparent: true, opacity: 0.85 })
    );
    const bottleMesh = new THREE.Mesh(bottleGeo, glassMat);
    bottleMesh.add(bottleLine);
    rootGroup.add(bottleMesh);

    // Orbiting Satellite Nodes (Café Discovery Flights)
    const satGeo = new RoundedBoxGeometry(0.44, 0.44, 0.44, 3, 0.04);
    const satEdges = new THREE.EdgesGeometry(satGeo);
    const satellites: THREE.Mesh[] = [];
    const baseAngles = [0.3, 1.85, 3.4, 4.95];

    baseAngles.forEach((ang, idx) => {
      const sat = new THREE.Mesh(satGeo, glassMat);
      sat.add(new THREE.LineSegments(satEdges, edgeMat));
      rootGroup.add(sat);
      satellites.push(sat);
    });

    // Dynamic Laser Spline from Bottle Neck to Active Satellite Node
    const lineMat = new THREE.LineDashedMaterial({
      color: 0xffffff,
      dashSize: 0.14,
      gapSize: 0.08,
      linewidth: 2,
    });
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(1, 0.5, 1),
    ]);
    const laserLine = new THREE.Line(laserGeo, lineMat);
    laserLine.computeLineDistances();
    rootGroup.add(laserLine);

    // Mouse Parallax
    let mouseX = 0, mouseY = 0;
    let targetRotX = 0, targetRotY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x * 0.35;
      mouseY = y * 0.25;
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', () => {
      mouseX = 0;
      mouseY = 0;
    });

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Mouse Parallax Smooth Lerp
      targetRotX = mouseY;
      targetRotY = mouseX;
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.08;
      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.08;

      // Turntable slow rotation
      ring.rotation.z = time * 0.18;
      innerRing.rotation.z = -time * 0.24;

      // Gentle vertical float
      rootGroup.position.y = Math.sin(time * 1.5) * 0.05;

      // Orbiting Satellites Transition
      const activeIdx = activeIdxRef.current % satellites.length;
      const orbitRadius = isHoveredRef.current ? 1.75 : 1.48;

      satellites.forEach((sat, i) => {
        const isSelected = i === activeIdx;
        const currentAngle = baseAngles[i] + time * 0.22;
        const targetX = Math.cos(currentAngle) * orbitRadius;
        const targetZ = Math.sin(currentAngle) * orbitRadius;
        const targetY = isSelected ? 0.35 + Math.sin(time * 3) * 0.06 : -0.25 + Math.sin(time * 2 + i) * 0.04;

        sat.position.x += (targetX - sat.position.x) * 0.1;
        sat.position.z += (targetZ - sat.position.z) * 0.1;
        sat.position.y += (targetY - sat.position.y) * 0.1;

        sat.material = isSelected ? activeMat : glassMat;
        sat.scale.setScalar(isSelected ? 1.15 : 0.92);

        // Update Laser Beam from bottle to active satellite node
        if (isSelected) {
          const positions = laserLine.geometry.attributes.position;
          positions.setXYZ(0, 0, 0.45, 0);
          positions.setXYZ(1, sat.position.x, sat.position.y, sat.position.z);
          positions.needsUpdate = true;
          laserLine.computeLineDistances();
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 118;
      height = container.clientHeight || 180;
      renderer.setSize(width, height);
      const aspect = width / height;
      camera.left = -3.6 * aspect;
      camera.right = 3.6 * aspect;
      camera.top = 3.6;
      camera.bottom = -3.6;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      bottleGeo.dispose();
      bottleWire.dispose();
      satGeo.dispose();
      satEdges.dispose();
      ringGeo.dispose();
      innerRingGeo.dispose();
      laserGeo.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="bmoat-3d-wrap" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. ORDER VELOCITY 3D (Card 3: Automated Reorders)
   - Isometric 3x3 fulfillment matrix grid on launchpad
   - Individual cubes elevate and light up in radiant purple with spring transitions
   - Interactive click & hover sync with the PO route list
───────────────────────────────────────────────────────────────────────────── */
interface OrderVelocity3DProps {
  isHovered?: boolean;
  activeRowIdx?: number;
  onSelectRow?: (idx: number) => void;
}

export function OrderVelocity3D({
  isHovered = false,
  activeRowIdx = 0,
  onSelectRow,
}: OrderVelocity3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isHoveredRef = useRef(isHovered);
  const activeIdxRef = useRef(activeRowIdx);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    activeIdxRef.current = activeRowIdx;
  }, [activeRowIdx]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || 118;
    let height = container.clientHeight || 180;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = createIsometricCamera(width, height, 3.6);
    setupLighting(scene);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Materials
    const glassMat = new THREE.MeshStandardMaterial({
      color: COLOR_GLASS_FILL,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.62,
    });
    const edgeMat = new THREE.LineBasicMaterial({
      color: COLOR_GLASS_EDGE,
      transparent: true,
      opacity: 0.85,
    });
    const activeMat = new THREE.MeshStandardMaterial({
      color: COLOR_ACTIVE_FILL,
      emissive: COLOR_ACTIVE_EMISSIVE,
      emissiveIntensity: 0.9,
      roughness: 0.15,
      metalness: 0.1,
    });
    const activeEdgeMat = new THREE.LineBasicMaterial({
      color: COLOR_ACTIVE_EDGE,
      linewidth: 2,
    });

    // Base Launch Platform with Perimeter Edge
    const baseGeo = new RoundedBoxGeometry(2.9, 0.14, 2.9, 3, 0.03);
    const baseEdges = new THREE.EdgesGeometry(baseGeo);
    const baseMesh = new THREE.Mesh(baseGeo, glassMat);
    baseMesh.position.y = -0.92;
    baseMesh.add(new THREE.LineSegments(baseEdges, edgeMat));
    rootGroup.add(baseMesh);

    // 3x3 Array of Precision Matrix Cubes
    const cubeGeo = new RoundedBoxGeometry(0.64, 0.64, 0.64, 4, 0.05);
    const cubeEdges = new THREE.EdgesGeometry(cubeGeo);
    const matrixCubes: { mesh: THREE.Mesh; gridX: number; gridZ: number; idx: number }[] = [];

    let count = 0;
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        const cube = new THREE.Mesh(cubeGeo, glassMat);
        cube.add(new THREE.LineSegments(cubeEdges, edgeMat));
        cube.position.set(x * 0.88, -0.42, z * 0.88);
        rootGroup.add(cube);
        matrixCubes.push({ mesh: cube, gridX: x, gridZ: z, idx: count++ });
      }
    }

    // Floating Dispatch Packet above active node
    const dispatchGeo = new RoundedBoxGeometry(0.36, 0.36, 0.36, 3, 0.04);
    const dispatchEdges = new THREE.EdgesGeometry(dispatchGeo);
    const dispatchCube = new THREE.Mesh(dispatchGeo, activeMat);
    dispatchCube.add(new THREE.LineSegments(dispatchEdges, activeEdgeMat));
    dispatchCube.position.set(0, 0.65, 0);
    rootGroup.add(dispatchCube);

    // Active Row Mapping to 3x3 grid positions:
    // row 0 -> (0, 0) center, row 1 -> (-1, 0), row 2 -> (1, 1)
    const activeMapping = [4, 3, 8];

    // Mouse Parallax & Interactive Cube Click
    let mouseX = 0, mouseY = 0;
    let targetRotX = 0, targetRotY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x * 0.35;
      mouseY = y * 0.25;
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', () => {
      mouseX = 0;
      mouseY = 0;
    });

    // Click handler on matrix
    const onClick = () => {
      if (onSelectRow) {
        const next = (activeIdxRef.current + 1) % 3;
        onSelectRow(next);
      }
    };
    container.addEventListener('click', onClick);

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Mouse Parallax Smooth Lerp
      targetRotX = mouseY;
      targetRotY = mouseX;
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.08;
      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.08;

      // Platform hover float
      rootGroup.position.y = Math.sin(time * 1.5) * 0.05;

      // Active Cube Elevation Spring
      const activeSlot = activeMapping[activeIdxRef.current % activeMapping.length];

      matrixCubes.forEach((item) => {
        const isHighlight = item.idx === activeSlot;
        const targetY = isHighlight
          ? 0.32 + Math.sin(time * 3.5) * 0.04
          : -0.42;

        item.mesh.position.y += (targetY - item.mesh.position.y) * 0.12;
        item.mesh.material = isHighlight ? activeMat : glassMat;
        item.mesh.scale.setScalar(isHighlight ? 1.08 : 0.94);

        if (isHighlight) {
          // Dispatch packet tracks above the active cube
          dispatchCube.position.x += (item.mesh.position.x - dispatchCube.position.x) * 0.14;
          dispatchCube.position.z += (item.mesh.position.z - dispatchCube.position.z) * 0.14;
          dispatchCube.position.y = item.mesh.position.y + 0.65 + Math.sin(time * 4) * 0.06;
          dispatchCube.rotation.y = time * 0.8;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 118;
      height = container.clientHeight || 180;
      renderer.setSize(width, height);
      const aspect = width / height;
      camera.left = -3.6 * aspect;
      camera.right = 3.6 * aspect;
      camera.top = 3.6;
      camera.bottom = -3.6;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      baseGeo.dispose();
      baseEdges.dispose();
      cubeGeo.dispose();
      cubeEdges.dispose();
      dispatchGeo.dispose();
      dispatchEdges.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="bmoat-3d-wrap"
      style={{ width: '100%', height: '100%', position: 'relative', cursor: 'pointer' }}
      title="Click to toggle active purchase order batch"
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}

