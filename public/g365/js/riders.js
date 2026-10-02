/* Gradient 365 — live 3D products riding the rows, clipped at the beam where they become cards */
(function () {
  const G = window.G365;
  const TAU = Math.PI * 2;
  const wrap = (a) => a - TAU * Math.floor((a + Math.PI) / TAU);
  const lerp = (a, b, t) => a + (b - a) * t;

  G.createRiders = async function (canvas) {
    await G.loadProducts();
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.environment = G.studioEnv(renderer);
    G.studioLights(scene);
    // brand gradient as light: navy key from the left, teal rim from the right
    const navyKey = new THREE.DirectionalLight(0x4E86D8, 0.55); navyKey.position.set(-5, 2, 3); scene.add(navyKey);
    const tealRim = new THREE.DirectionalLight(0x39D6CF, 0.85); tealRim.position.set(4, 1, -2); scene.add(tealRim);
    // camera works in CSS pixels: x right, y down (negated), origin at the stage's top-left
    const cam = new THREE.OrthographicCamera(0, 1, 0, -1, -4000, 4000);
    const makers = G.productMakers();

    const shadowTex = G.canvasTex(128, 48, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, "rgba(15,33,77,0.35)"); g.addColorStop(1, "rgba(15,33,77,0)");
      ctx.setTransform(1, 0, 0, h / w, 0, 0); ctx.fillStyle = g; ctx.fillRect(0, 0, w, w);
    });
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    const shadowGeo = new THREE.PlaneGeometry(1, 1);
    const auraTex = G.canvasTex(128, 128, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, "rgba(57,214,207,0.55)"); g.addColorStop(0.45, "rgba(28,94,168,0.22)"); g.addColorStop(1, "rgba(28,94,168,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    const auraMat = new THREE.MeshBasicMaterial({ map: auraTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });

    // transmission forces an extra full-scene pass every frame; moving products use a lighter glass
    const quickGlass = new THREE.MeshPhysicalMaterial({ color: 0xf4fbfb, roughness: 0.05, transparent: true, opacity: 0.38, clearcoat: 1, depthWrite: false });
    const amber = new THREE.MeshPhysicalMaterial({ color: 0x8a4410, roughness: 0.2, clearcoat: 1 });
    function make(key) {
      const obj = makers[key]();
      obj.traverse((m) => { if (m.isMesh && m.material && m.material.transmission > 0) m.material = m.material.color.b < 0.2 ? amber : quickGlass; });
      const box = new THREE.Box3().setFromObject(obj), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
      obj.position.sub(c);
      const pivot = new THREE.Group(); pivot.add(obj);
      const shadow = new THREE.Mesh(shadowGeo, shadowMat.clone()); shadow.renderOrder = -1;
      const aura = new THREE.Mesh(shadowGeo, auraMat.clone()); aura.renderOrder = -2;
      const holder = new THREE.Group(); holder.add(aura, shadow, pivot);
      scene.add(holder);
      return { holder, pivot, shadow, aura, size: Math.max(s.x, s.y, s.z), spin: 0.35 + Math.random() * 0.35, phase: Math.random() * TAU, bob: Math.random() * TAU };
    }

    let pool = new Map(), W = 1, H = 1;
    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      renderer.setSize(W, H, false);
      Object.assign(cam, { left: 0, right: W, top: 0, bottom: -H });
      cam.updateProjectionMatrix();
    }
    resize();

    return {
      resize,
      reset() { pool.forEach((r) => scene.remove(r.holder)); pool = new Map(); },
      // items: { id, key, x, y, ang (rad), settle 0..1, px (thumbnail size), show }
      render(items, t, still) {
        pool.forEach((r) => (r.holder.visible = false));
        for (const it of items) {
          if (!it.show) continue;
          let r = pool.get(it.id);
          if (!r) { r = make(it.key); pool.set(it.id, r); }
          const st = it.settle, free = 1 - st;
          const px = lerp(it.px * 1.45, it.px * 0.8, st);
          const bob = still ? 0 : Math.sin(t * 1.6 + r.bob) * 5 * free;
          r.holder.visible = true;
          r.holder.position.set(it.x, -(it.y + bob - 10 * free), 0);
          r.holder.rotation.z = -it.ang * st;
          r.pivot.scale.setScalar(px / r.size);
          // free spin while riding, easing into the exact three-quarter pose used by the card photo
          const spinA = wrap((still ? 0 : t * r.spin) + r.phase + 0.5);
          r.pivot.rotation.set(lerp(0.42, 0.3, st), -0.5 + spinA * free, lerp(0.04 * Math.sin(t + r.bob), 0, st));
          // the closer to the Core, the stronger the gradient light on the product
          r.aura.material.opacity = 0.14 + 0.5 * st;
          r.aura.scale.set(px * 2.1, px * 2.1, 1);
          r.aura.position.set(0, 0, -px * 3);
          r.shadow.position.set(0, -px * 0.55, -px * 2);
          r.shadow.scale.set(px * 1.2, px * 0.28, 1);
          r.shadow.material.opacity = 0.9 * free;
        }
        renderer.setScissorTest(true);
        renderer.setScissor(0, 0, W / 2, H);
        renderer.clear();
        renderer.render(scene, cam);
      },
    };
  };
})();
