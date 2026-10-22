'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface ThreePackagingSceneProps {
  scrollProgress?: number; // 0 (hero resting) to 1 (dashboard centered/released)
}

export function ThreePackagingScene({ scrollProgress = 0 }: ThreePackagingSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── 1. Scene, Camera, WebGL Renderer ───
    const scene = new THREE.Scene();

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 14.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const disposables: { dispose: () => void }[] = [];

    // soft studio reflections for the 3D props
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();
    disposables.push(envTex);

    // ─── 2. Studio lighting for real 3D props ───
    // a low, soft base so the props keep their form (strong flat ambient washes 3D objects out),
    // one warm key from the upper right, a cool fill and a thin rim to separate them from the page
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xb9ad9a, 0.55);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.1);
    keyLight.position.set(8, 12, 10);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8eef5, 0.45);
    fillLight.position.set(-10, 4, 8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(-2, 8, -10);
    scene.add(rimLight);

    // ─── 3. Left Scene: Specialty Coffee Supply ───
    const leftRootGroup = new THREE.Group();
    leftRootGroup.name = 'grocery-tote';

    // ─── 4. Right Scene: Café Bakery Food Supply ───
    const rightRootGroup = new THREE.Group();
    rightRootGroup.name = 'cafe-bakery-food-supply';


    // ─── The two props: 3D models from Meshy, textured in Blender (scripts/blender/meshy_props.py) ───
    // Left: a canvas tote of café groceries with green stripes. Right: stacked kraft cartons with green bands.
    // Both are fully interactive: hover lifts them, drag turns them, a click spins them.
    const allMaterials: THREE.Material[] = [];
    const PROP_SCALE = 1.8; // the models are ~1.9 units tall
    let disposed = false;

    type Prop = {
      pivot: THREE.Group; // base orientation + interaction lives here
      hit: THREE.Mesh; // an invisible box the pointer is tested against
      hover: number; // 0..1, eased
      yaw: number; // drag / spin rotation, radians
      spin: { v: number };
    };

    function softShadow(width: number, depth: number) {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const ctx = c.getContext('2d');
      if (ctx) {
        const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'rgba(40,30,18,0.40)');
        g.addColorStop(0.55, 'rgba(40,30,18,0.15)');
        g.addColorStop(1, 'rgba(40,30,18,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 128, 128);
      }
      const tex = new THREE.CanvasTexture(c);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
      const geo = new THREE.PlaneGeometry(1, 1);
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.scale.set(width, depth, 1);
      disposables.push(tex, mat, geo);
      allMaterials.push(mat);
      return m;
    }

    // tilt: the prop is tipped over (z) and leaned toward the viewer (x) by an outer group, so drag / spin still turn
    // it around its own axis; the shadow stays flat on the ground, under the lowest point
    function makeProp(
      url: string, root: THREE.Group, baseYaw: number, tilt: { z: number; x: number },
      shadow: { w: number; d: number; x: number; y: number },
      onLoad?: (model: THREE.Object3D) => void,
    ): Prop {
      const tiltGroup = new THREE.Group();
      tiltGroup.rotation.set(tilt.x, 0, tilt.z);
      root.add(tiltGroup);
      const pivot = new THREE.Group();
      pivot.rotation.y = baseYaw;
      tiltGroup.add(pivot);
      const sh = softShadow(shadow.w * PROP_SCALE, shadow.d * PROP_SCALE);
      sh.position.set(shadow.x * PROP_SCALE, shadow.y * PROP_SCALE, 0);
      root.add(sh);
      const hitGeo = new THREE.BoxGeometry(1, 1, 1);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hit = new THREE.Mesh(hitGeo, hitMat);
      disposables.push(hitGeo, hitMat);
      pivot.add(hit);
      new GLTFLoader().load(url, (gltf) => {
        if (disposed) return;
        const model = gltf.scene;
        model.scale.setScalar(PROP_SCALE);
        model.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            m.transparent = true;
            (m as THREE.MeshStandardMaterial).envMapIntensity = 0.45; // soft reflections, no plastic sheen
            allMaterials.push(m);
            disposables.push(m);
          });
          disposables.push(mesh.geometry);
        });
        // fit the invisible hit box to the model, measured before it has a parent (so in pivot space)
        const box = new THREE.Box3().setFromObject(model);
        box.getSize(hit.scale).multiplyScalar(1.04);
        box.getCenter(hit.position);
        onLoad?.(model);
        pivot.add(model);
      });
      return { pivot, hit, hover: 0, yaw: 0, spin: { v: 0 } };
    }

    // the tote stands upright in the bottom-left; the boxes tumble in the bottom-right, the top box knocked loose and turning on its own
    const tote = makeProp('/supplier/props/tote.gltf', leftRootGroup, 0.5, { z: 0, x: 0 }, { w: 2.2, d: 1.4, x: 0, y: -0.94 });
    const boxes = makeProp('/supplier/props/boxes.gltf', rightRootGroup, -0.55, { z: 0.55, x: 0.1 }, { w: 1.9, d: 1.2, x: 0.2, y: -0.86 }, (model) => {
      const top = model.getObjectByName('box_top');
      if (top) {
        top.position.x -= 0.18;          // knocked off the stack, toward the page
        top.position.y += 0.08;
        top.rotation.set(0.35, 0.5, 0.45);
      }
    });
    const props = [tote, boxes];

    // ─── pointer: hover, drag to turn, click to spin ───
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let hovered: Prop | null = null;
    let drag: { prop: Prop; x: number; moved: number } | null = null;

    const pick = (e: PointerEvent): Prop | null => {
      const r = container.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return null;
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(props.map((p) => p.hit), false);
      return hits.length ? props.find((p) => p.hit === hits[0].object) ?? null : null;
    };
    const setCursor = (c: string) => {
      document.body.style.cursor = c;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (drag) {
        const dx = e.clientX - drag.x;
        drag.x = e.clientX;
        drag.moved += Math.abs(dx);
        drag.prop.yaw += dx * 0.012;
        return;
      }
      const p = pick(e);
      if (p !== hovered) {
        hovered = p;
        setCursor(p ? 'grab' : '');
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const p = pick(e);
      if (!p) return;
      e.preventDefault();
      drag = { prop: p, x: e.clientX, moved: 0 };
      setCursor('grabbing');
    };
    const onPointerUp = () => {
      if (!drag) return;
      const { prop, moved } = drag;
      drag = null;
      setCursor(hovered ? 'grab' : '');
      if (moved < 4 && !prefersReducedMotion) {
        // a click: one full, eased turn
        const from = prop.yaw;
        prop.spin.v = 0;
        gsap.to(prop.spin, {
          v: 1,
          duration: 1.1,
          ease: 'power3.inOut',
          onUpdate: () => {
            prop.yaw = from + prop.spin.v * Math.PI * 2;
          },
        });
      }
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp, { passive: true });

    scene.add(leftRootGroup);
    scene.add(rightRootGroup);


    // ─── 5. Positioning & Responsive Layout (Relume-Style Edge Bleed & Framing) ───
    function updateLayoutPositions() {
      const currentWidth = container?.clientWidth || window.innerWidth;
      const currentHeight = container?.clientHeight || window.innerHeight;

      const isMobile = currentWidth < 768;

      if (isMobile) {
        // Offscreen on mobile to preserve 100% clean typography
        leftRootGroup.position.set(-999, -999, 0);
        rightRootGroup.position.set(999, 999, 0);
        return;
      }

      // Compute exact visible camera frustum half-width and half-height at Z = 0
      const aspect = currentWidth / currentHeight;
      const dist = camera.position.z; // 14.8
      const vHalfHeight = dist * Math.tan((camera.fov * Math.PI) / 360);
      const vHalfWidth = vHalfHeight * aspect;

      // Tasteful, refined scale: smaller physical packaging presence
      const scale = currentWidth < 1050 ? 0.62 : currentWidth < 1360 ? 0.74 : 0.86;

      leftRootGroup.scale.set(scale, scale, scale);
      rightRootGroup.scale.set(scale, scale, scale);

      // Relume edge alignment:
      // the props' on-screen half-widths, kept fully on screen
      // Position center so it hugs the flank with ~25-30% edge tuck
      const leftHalfW = 1.4 * PROP_SCALE * scale;
      const rightHalfW = 1.05 * PROP_SCALE * scale;

      const baseXLeft = -vHalfWidth + leftHalfW * 0.6;   // tucked into the left edge
      const baseXRight = vHalfWidth - rightHalfW * 1.35;

      // Lowered down vertically to frame the center headline and flank the rising cutting mat
      const baseY = currentWidth < 1180 ? -2.05 : -1.82;

      leftRootGroup.userData.baseX = baseXLeft;
      leftRootGroup.userData.baseY = baseY;
      leftRootGroup.userData.baseZ = 0;

      rightRootGroup.userData.baseX = baseXRight;
      rightRootGroup.userData.baseY = baseY;
      rightRootGroup.userData.baseZ = 0;
    }

    updateLayoutPositions();

    // ─── 6. Smooth GSAP Mouse Parallax Physics ───
    const mouseProxy = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;

      gsap.to(mouseProxy, {
        x: nx * 0.1,
        y: ny * 0.06,
        duration: 0.85,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(mouseProxy, {
        x: 0,
        y: 0,
        duration: 1.2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      updateLayoutPositions();
    };
    window.addEventListener('resize', handleResize);

    // ─── 7. 60fps Micro-Animation Loop (Idle Drift + Scroll Recession) ───
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Compute scroll progress directly from hero-scene element
      let p = 0;
      const heroSection = document.getElementById('hero-scene');
      if (heroSection) {
        const totalTravel = heroSection.offsetHeight - window.innerHeight;
        if (totalTravel > 0) {
          p = Math.max(0, Math.min(1, window.scrollY / totalTravel));
        }
      } else if (scrollRef.current !== undefined) {
        p = scrollRef.current;
      }

      // Phase 5.2 / Section 8: Subtle breathing drift (8-11s cycle, different timing)
      const idleFloatLeft = prefersReducedMotion ? 0 : Math.sin(elapsedTime * 0.55) * 0.026;
      const idleFloatRight = prefersReducedMotion ? 0 : Math.cos(elapsedTime * 0.62) * 0.026;
      const idleRotLeft = prefersReducedMotion ? 0 : Math.cos(elapsedTime * 0.45) * 0.006;
      const idleRotRight = prefersReducedMotion ? 0 : Math.sin(elapsedTime * 0.52) * 0.006;

      // Phase 5.6 / Section 8: Coordinated scroll recession
      const scrollRecedeX = p * 8.2;
      const scrollRecedeY = p * 3.6;
      const scrollTiltZ = p * 0.12;
      const meshOpacity = Math.max(0, Math.min(1, 1 - p * 2.2));

      // interaction: hover lift and the drag / spin turn (drag turns ease back toward rest when let go)
      props.forEach((pr) => {
        const target = pr === hovered || drag?.prop === pr ? 1 : 0;
        pr.hover += (target - pr.hover) * 0.12;
        if (!drag || drag.prop !== pr) {
          if (!gsap.isTweening(pr.spin)) {
            const rest = Math.round(pr.yaw / (Math.PI * 2)) * Math.PI * 2;
            pr.yaw += (rest - pr.yaw) * 0.02;
          }
        }
        pr.pivot.rotation.y = (pr === tote ? 0.5 : -0.55) + pr.yaw;
        pr.pivot.position.y = pr.hover * 0.22;
        pr.pivot.scale.setScalar(1 + pr.hover * 0.04);
      });

      // Apply opacity fade
      allMaterials.forEach((m) => {
        m.opacity = meshOpacity;
      });

      // Smooth pointer parallax + base studio orientation + scroll tilt
      leftRootGroup.rotation.y = 0.22 + mouseProxy.x * 0.08 + idleRotLeft;
      leftRootGroup.rotation.x = 0.08 - mouseProxy.y * 0.06;
      leftRootGroup.rotation.z = -0.02 + scrollTiltZ;

      rightRootGroup.rotation.y = -0.20 + mouseProxy.x * 0.08 + idleRotRight;
      rightRootGroup.rotation.x = 0.12 - mouseProxy.y * 0.06;
      rightRootGroup.rotation.z = 0.02 - scrollTiltZ;

      if (leftRootGroup.userData.baseX !== undefined) {
        leftRootGroup.position.x = leftRootGroup.userData.baseX - scrollRecedeX + mouseProxy.x * 0.12;
        leftRootGroup.position.y = leftRootGroup.userData.baseY + idleFloatLeft - scrollRecedeY - mouseProxy.y * 0.08;

        rightRootGroup.position.x = rightRootGroup.userData.baseX + scrollRecedeX - mouseProxy.x * 0.12;
        rightRootGroup.position.y = rightRootGroup.userData.baseY + idleFloatRight - scrollRecedeY - mouseProxy.y * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    // ─── 8. Cleanup on Unmount ───
    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.body.style.cursor = '';
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      disposables.forEach((d) => d.dispose());
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="sup-three-canvas-container"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 6,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  );
}
