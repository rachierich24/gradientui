/* Gradient 365 — live 3D products standing on the hero's isometric tiles.
   Each product is posed for the same view the flat pieces are drawn in (30° above the ground, turned 45°),
   so it stands on its tile. It pops up out of the tile's printed photo once the tile has landed on its
   lane, rides it in, and jumps into the hub. hero-flow.js says where everything is. */
(function () {
  const G = window.G365;
  const TAU = Math.PI * 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const ELEV = Math.PI / 6;   // camera elevation that gives the scene's 2:1 ground axes
  const backOut = (x) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

  G.createRiders = async function (canvas) {
    await G.loadProducts();
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return null; }
    // drawn a little above the screen's resolution, so the small products' edges and labels come out clean.
    // Adaptive: if frames keep running long (a phone that can't keep up), the canvas steps its resolution down
    // a notch at a time, never below 1×; fast devices never notice. Pauses (a hidden tab) don't count.
    let ratio = Math.min((window.devicePixelRatio || 1) * 1.25, 2), lastAt = 0, slow = 0;
    renderer.setPixelRatio(ratio);
    function pace(now) {
      const dt = lastAt ? now - lastAt : 0; lastAt = now;
      if (!dt || dt > 120) return;
      slow = Math.max(0, slow + (dt > 26 ? 1 : -0.5));
      if (slow > 40 && ratio > 1) {
        slow = 0; ratio = Math.max(1, Math.round((ratio - 0.25) * 100) / 100);
        renderer.setPixelRatio(ratio); renderer.setSize(W, H, false);
      }
    }
    renderer.outputEncoding = THREE.sRGBEncoding;
    // a touch under full exposure, so white products keep their shading against the white page
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.9;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.environment = G.studioEnv(renderer);
    G.studioLights(scene);
    // neutral light (a soft key from the left, a bright rim from the right): the products carry their sides' colours
    // themselves — red cafés, green suppliers, purple brands — so the light mustn't tint them
    const softKey = new THREE.DirectionalLight(0xffffff, 0.26); softKey.position.set(-5, 2, 3); scene.add(softKey);
    const rim = new THREE.DirectionalLight(0xffffff, 0.5); rim.position.set(4, 1, -2); scene.add(rim);
    // camera works in CSS pixels: x right, y down (negated), origin at the canvas's top-left
    const cam = new THREE.OrthographicCamera(0, 1, 0, -1, -4000, 4000);
    const makers = G.productMakers();

    const shadowTex = G.canvasTex(128, 64, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      g.addColorStop(0, "rgba(11,18,32,0.42)"); g.addColorStop(0.55, "rgba(11,18,32,0.16)"); g.addColorStop(1, "rgba(11,18,32,0)");
      ctx.setTransform(1, 0, 0, h / w, 0, 0); ctx.fillStyle = g; ctx.fillRect(0, 0, w, w);
    });
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    const shadowGeo = new THREE.PlaneGeometry(1, 1);
    // a pool of coloured light under a product while it's pointed at (white texture, tinted per side)
    const glowTex = G.canvasTex(128, 128, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, "rgba(255,255,255,0.9)"); g.addColorStop(0.45, "rgba(255,255,255,0.35)"); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    const glowMat = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 });

    // transmission forces an extra full-scene pass every frame; moving products use a lighter glass
    const quickGlass = new THREE.MeshPhysicalMaterial({ color: 0xf4fbfb, roughness: 0.05, transparent: true, opacity: 0.38, clearcoat: 1, depthWrite: false });
    const amber = new THREE.MeshPhysicalMaterial({ color: 0x8a4410, roughness: 0.2, clearcoat: 1 });
    function make(key) {
      const obj = makers[key]();
      obj.traverse((m) => { if (m.isMesh && m.material && m.material.transmission > 0) m.material = m.material.color.b < 0.2 ? amber : quickGlass; });
      // stand it on its base, centred, so it turns about its own upright axis
      const box = new THREE.Box3().setFromObject(obj), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
      obj.position.set(-c.x, -box.min.y, -c.z);
      const turn = new THREE.Group(); turn.add(obj);
      const tilt = new THREE.Group(); tilt.add(turn); tilt.rotation.x = ELEV;
      const shadow = new THREE.Mesh(shadowGeo, shadowMat.clone()); shadow.renderOrder = -1;
      // grounding: a tight, dark contact shadow right at its base, and a long soft one cast away from the light
      const ao = new THREE.Mesh(shadowGeo, shadowMat.clone()); ao.renderOrder = -1;
      const cast = new THREE.Mesh(shadowGeo, shadowMat.clone()); cast.renderOrder = -1;
      const glow = new THREE.Mesh(shadowGeo, glowMat.clone()); glow.renderOrder = -2; glow.visible = false;
      scene.add(tilt, shadow, ao, cast, glow);
      // every product squared to the ground grid, its front toward you on the right (+q), like the café cards
      return { tilt, turn, shadow, ao, cast, glow, hot: 0, foot: Math.max(s.x, s.z), tall: s.y, face: Math.PI / 4, dir: 1 };
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
      reset() { pool.forEach((r) => scene.remove(r.tilt, r.shadow, r.ao, r.cast, r.glow)); pool = new Map(); },
      // items: { id, key, x, y (the top of its tile, canvas px), size (tile size, px), pop 0..1 (rising out
      //          of the tile), hop 0..1, hx, hy (where the jump lands), flat (reduced motion: shrink in place),
      //          tint (its side's colour: a faint pool of it always lies under the product),
      //          hot (a colour while pointed at: the product lifts a little and the pool brightens) }
      // clipW: products never go right of this (canvas px), so only that much of the canvas is drawn
      render(items, t, still, clipW) {
        pace(performance.now());
        renderer.setScissorTest(!!clipW);
        if (clipW) renderer.setScissor(0, 0, Math.min(W, Math.ceil(clipW)), H);
        pool.forEach((r) => { r.tilt.visible = false; r.shadow.visible = false; r.ao.visible = false; r.cast.visible = false; r.glow.visible = false; });
        for (const it of items) {
          let r = pool.get(it.id);
          if (!r) { r = make(it.key); pool.set(it.id, r); }
          const g = it.pop, j = it.hop, e = j * j * (3 - 2 * j);
          // eases in and out of being pointed at
          r.hot += ((it.hot ? 1 : 0) - r.hot) * 0.18;
          const col = it.hot || it.tint;
          if (col && r.col !== col) { r.col = col; r.glow.material.color.set(col); }
          // grows up out of the tile with a little overshoot, then stands a touch larger than icon size
          const fit = Math.min(0.8 * it.size / r.foot, 1.1 * it.size / r.tall) * (g >= 1 ? 1 : Math.max(0, backOut(g))) * (1 + 0.06 * r.hot);
          // standing on its tile (a hair above it); lifted a little while pointed at
          const float = 0.6 * g + 7 * r.hot;
          let x = it.x, y = it.y - float, sc = fit;
          if (it.flat) sc *= 1 - j;
          else if (j > 0) {
            x = lerp(x, it.hx, e);
            y = lerp(y, it.hy, e) - Math.sin(Math.PI * j) * it.size * 0.9;
            sc *= 1 - 0.9 * j * j;
          }
          if (sc < 0.002) continue;
          // nearer the viewer (lower on screen) draws in front
          const depth = it.y * 3;
          r.tilt.visible = true;
          r.tilt.position.set(x, -y, depth);
          r.tilt.scale.setScalar(sc);
          // turns into its pose as it rises, holds it squared to the grid, and spins once on the way into the hub
          r.turn.rotation.y = r.face + (1 - g) * 1.6 * r.dir + (it.flat ? 0 : e * TAU * r.dir);
          // the contact shadow stays on the tile, a touch toward you on the right, away from the light
          const sw = it.size * 0.7 * g * (1 - 0.5 * j);
          r.shadow.visible = sw > 0.5;
          r.shadow.position.set(it.x + 1.5, -it.y - 0.8, depth - it.size * 2);
          r.shadow.scale.set(sw, sw * 0.5, 1);
          r.shadow.material.opacity = 0.9 * g * (1 - j) * (1 - 0.4 * r.hot);
          // the contact shadow: small and dark, right under the base, where it meets the tile
          const grounded = g * (1 - j) * (1 - 0.5 * r.hot);
          if (grounded > 0.02) {
            const aw = it.size * 0.46 * Math.min(1, r.foot * fit / (it.size * 0.6));
            r.ao.visible = true;
            r.ao.position.set(it.x + 0.6, -it.y - 0.4, depth - it.size * 1.95);
            r.ao.scale.set(aw, aw * 0.5, 1);
            r.ao.material.opacity = 1.0 * grounded;
            // the cast shadow: light comes from the upper left, so it stretches down the ground toward you on the
            // right (the 2:1 ground's +q, 26.6° below the horizontal), as long as the product is tall
            const ang = Math.atan2(1, 2), len = Math.max(it.size * 0.55, r.tall * fit * 1.05), wid = it.size * 0.42;
            r.cast.visible = true;
            r.cast.position.set(it.x + Math.cos(ang) * len * 0.34, -(it.y + Math.sin(ang) * len * 0.34), depth - it.size * 2);
            r.cast.rotation.z = -ang;
            r.cast.scale.set(len, wid, 1);
            r.cast.material.opacity = 0.5 * grounded;
          }
          // a faint pool of its side's colour under it, brighter and wider while it's pointed at
          const rest = it.tint ? 0.3 : 0, gOp = (rest + (0.62 - rest) * r.hot) * g * (1 - j);
          if (gOp > 0.01) {
            const gw = it.size * (1.3 + 0.4 * r.hot);
            r.glow.visible = true;
            r.glow.position.set(it.x, -it.y, depth - it.size * 2.1);
            r.glow.scale.set(gw, gw * 0.5, 1);
            r.glow.material.opacity = gOp;
          }
        }
        renderer.render(scene, cam);
      },
    };
  };
})();
