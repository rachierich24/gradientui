'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

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
    renderer.toneMappingExposure = 1.02;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const disposables: { dispose: () => void }[] = [];

    // ─── 2. Balanced Studio Lighting ───
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbf2, 1.8);
    keyLight.position.set(8, 14, 12);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xedf2f7, 0.9);
    fillLight.position.set(-10, 6, 8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(0, 10, -10);
    scene.add(rimLight);

    // ─── 3. Left Scene: Specialty Coffee Supply ───
    const leftRootGroup = new THREE.Group();
    leftRootGroup.name = 'specialty-coffee-supply';

    // ─── 4. Right Scene: Café Bakery Food Supply ───
    const rightRootGroup = new THREE.Group();
    rightRootGroup.name = 'cafe-bakery-food-supply';

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();

    // Coffee Texture & Mesh
    const coffeeAspect = 1200 / 896; // ~1.339
    const coffeeWidth = 5.9;
    const coffeeHeight = coffeeWidth / coffeeAspect; // ~4.40

    const coffeeGeo = new THREE.PlaneGeometry(coffeeWidth, coffeeHeight, 16, 16);
    disposables.push(coffeeGeo);

    const coffeeTexture = textureLoader.load('/supplier/specialty_coffee_cutout.png', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      coffeeMat.needsUpdate = true;
    });
    disposables.push(coffeeTexture);

    const coffeeMat = new THREE.MeshStandardMaterial({
      map: coffeeTexture,
      transparent: true,
      alphaTest: 0.002,
      roughness: 0.88,
      metalness: 0.04,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
    disposables.push(coffeeMat);

    const coffeeMesh = new THREE.Mesh(coffeeGeo, coffeeMat);
    // Natural subtle 3D studio orientation
    coffeeMesh.rotation.set(0.08, 0.22, -0.02);
    leftRootGroup.add(coffeeMesh);

    // Food Texture & Mesh
    const foodAspect = 1200 / 896; // ~1.339
    const foodWidth = 6.4;
    const foodHeight = foodWidth / foodAspect; // ~4.78

    const foodGeo = new THREE.PlaneGeometry(foodWidth, foodHeight, 16, 16);
    disposables.push(foodGeo);

    const foodTexture = textureLoader.load('/supplier/cafe_food_cutout.png', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      foodMat.needsUpdate = true;
    });
    disposables.push(foodTexture);

    const foodMat = new THREE.MeshStandardMaterial({
      map: foodTexture,
      transparent: true,
      alphaTest: 0.002,
      roughness: 0.82,
      metalness: 0.08,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
    disposables.push(foodMat);

    const foodMesh = new THREE.Mesh(foodGeo, foodMat);
    // Natural subtle 3D studio orientation
    foodMesh.rotation.set(0.12, -0.20, 0.02);
    rightRootGroup.add(foodMesh);

    scene.add(leftRootGroup);
    scene.add(rightRootGroup);

    const allMaterials = [coffeeMat, foodMat];

    // ─── 5. Positioning & Responsive Layout ───
    function updateLayoutPositions() {
      const currentWidth = container?.clientWidth || window.innerWidth;
      const currentHeight = container?.clientHeight || window.innerHeight;

      const isMobile = currentWidth < 768;

      if (isMobile) {
        // Offscreen on mobile to preserve 100% clean typography
        leftRootGroup.position.set(-999, -999, 0);
        rightRootGroup.position.set(999, 999, 0);
      } else {
        // Positioned cleanly in the hero flanks, lowered down to frame the central copy without overlap
        const xOffset = currentWidth >= 1440 ? 6.5 : currentWidth >= 1200 ? 6.0 : 5.4;
        const yOffset = currentWidth < 1180 ? -2.15 : -1.85;
        const scale = currentWidth < 1050 ? 0.65 : currentWidth < 1280 ? 0.78 : 0.98;

        leftRootGroup.scale.set(scale, scale, scale);
        rightRootGroup.scale.set(scale, scale, scale);

        leftRootGroup.userData.baseX = -xOffset;
        leftRootGroup.userData.baseY = yOffset;
        leftRootGroup.userData.baseZ = 0;

        rightRootGroup.userData.baseX = xOffset;
        rightRootGroup.userData.baseY = yOffset;
        rightRootGroup.userData.baseZ = 0;
      }
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
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
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
