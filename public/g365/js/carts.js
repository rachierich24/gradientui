/* Gradient 365 — studio-lit 3D shopping carts that roll along the intersystem tracks.
   Wire basket in chrome, rubber wheels that turn with the distance travelled, a grip in the
   side's colour and a little cargo. Drawn on one transparent canvas over the tracks; the
   camera works in CSS pixels (x right, y down), like riders.js.
   Needs three.js + kit.js. API: G365.createCarts(canvas) -> { resize(), render(items) } */
(function () {
  const G = (window.G365 = window.G365 || {});

  G.createCarts = function (canvas) {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    if (!G.mat || !G.mat.chrome) G.buildMaterials();

    const scene = new THREE.Scene();
    scene.environment = G.studioEnv(renderer);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfd5de, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(-3, 5, 6); scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.5); rim.position.set(4, 2, -3); scene.add(rim);
    const cam = new THREE.OrthographicCamera(0, 1, 0, -1, -4000, 4000);

    /* ---------- materials ---------- */
    // satin steel rather than mirror chrome, so the cart reads against a light page
    const wire = new THREE.MeshStandardMaterial({ color: 0xa9b1bd, metalness: 0.9, roughness: 0.3 });
    const frame = new THREE.MeshStandardMaterial({ color: 0x3b4252, metalness: 0.7, roughness: 0.38 });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x1b2130, roughness: 0.62 });
    const kraft = new THREE.MeshStandardMaterial({ color: 0xb98a55, roughness: 0.8 });
    const tape = new THREE.MeshStandardMaterial({ color: 0xe6d3b4, roughness: 0.6 });
    const grip = {}, parcel = {};
    const tone = (hex) => {
      if (!grip[hex]) {
        grip[hex] = new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15 });
        parcel[hex] = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(hex).lerp(new THREE.Color(0xffffff), 0.12), roughness: 0.4, clearcoat: 0.6 });
      }
      return { grip: grip[hex], parcel: parcel[hex] };
    };

    /* ---------- geometry helpers ---------- */
    const UP = new THREE.Vector3(0, 1, 0);
    const rodGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1);
    function rod(group, a, b, r, mat) {
      const m = new THREE.Mesh(rodGeo, mat);
      const d = new THREE.Vector3().subVectors(b, a), len = d.length();
      m.scale.set(r, len, r);
      m.position.copy(a).addScaledVector(d, 0.5);
      m.quaternion.setFromUnitVectors(UP, d.normalize());
      group.add(m);
    }
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const wheelGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.05, 20);
    const hubGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.056, 12);

    // model space: forward = +x, up = +y, width along z; ~1.3 long
    function makeCart(hex) {
      const t = tone(hex), cart = new THREE.Group(), R = 0.021;
      // basket: wider at the top, like a real cart
      const bx = 0.44, bz = 0.27, tx = 0.58, tz = 0.33, y0 = 0.34, y1 = 0.84;
      const at = (s, sx, sz) => V(sx * (bx + (tx - bx) * s), y0 + (y1 - y0) * s, sz * (bz + (tz - bz) * s));
      [0, 0.34, 0.67, 1].forEach((s) => {
        const c = [at(s, -1, -1), at(s, 1, -1), at(s, 1, 1), at(s, -1, 1)];
        for (let i = 0; i < 4; i++) rod(cart, c[i], c[(i + 1) % 4], s === 1 ? R * 1.6 : R, wire);
      });
      for (let i = 0; i <= 8; i++) {                         // uprights along the long sides
        const f = -1 + (2 * i) / 8;
        [-1, 1].forEach((sz) => rod(cart, V(f * bx, y0, sz * bz), V(f * tx, y1, sz * tz), R * 0.8, wire));
      }
      for (let i = 1; i < 5; i++) {                          // uprights at the ends
        const f = -1 + (2 * i) / 5;
        [-1, 1].forEach((sx) => rod(cart, V(sx * bx, y0, f * bz), V(sx * tx, y1, f * tz), R * 0.8, wire));
      }
      for (let i = 1; i < 5; i++) { const f = -1 + (2 * i) / 5; rod(cart, V(-bx, y0, f * bz), V(bx, y0, f * bz), R * 0.8, wire); }
      // chassis + legs
      const cy = 0.13;
      [-1, 1].forEach((sz) => {
        rod(cart, V(-0.46, cy, sz * 0.22), V(0.44, cy, sz * 0.22), R * 1.5, frame);
        rod(cart, V(-0.4, cy, sz * 0.22), V(-bx, y0, sz * bz), R * 1.4, frame);
        rod(cart, V(0.38, cy, sz * 0.22), V(bx, y0, sz * bz), R * 1.4, frame);
      });
      rod(cart, V(-0.46, cy, -0.22), V(-0.46, cy, 0.22), R * 1.5, frame);
      // wheels (kept so they can turn)
      const wheels = [];
      [[-0.38, -0.23], [-0.38, 0.23], [0.36, -0.23], [0.36, 0.23]].forEach(([x, z]) => {
        const w = new THREE.Group();
        const tyre = new THREE.Mesh(wheelGeo, rubber); tyre.rotation.x = Math.PI / 2;
        const hub = new THREE.Mesh(hubGeo, frame); hub.rotation.x = Math.PI / 2;
        w.add(tyre, hub); w.position.set(x, 0.075, z);
        cart.add(w); wheels.push(w);
      });
      // handle with a coloured grip
      [-1, 1].forEach((sz) => rod(cart, V(-tx, y1, sz * tz), V(-0.74, 0.98, sz * tz), R * 1.6, wire));
      const g = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, tz * 2 + 0.06, 16), t.grip);
      g.rotation.x = Math.PI / 2; g.position.set(-0.74, 0.98, 0); cart.add(g);
      // cargo: a kraft carton and a parcel in the side's colour, peeking over the rim
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.5, 0.4), kraft);
      box.position.set(-0.13, y0 + 0.25, -0.02); box.rotation.y = 0.18; cart.add(box);
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.465, 0.014, 0.08), tape);
      strip.position.set(-0.13, y0 + 0.505, -0.02); strip.rotation.y = 0.18; cart.add(strip);
      const pc = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.38, 0.28), t.parcel);
      pc.position.set(0.23, y0 + 0.19, 0.06); pc.rotation.y = -0.25; cart.add(pc);
      return { cart, wheels };
    }

    const shadowTex = G.canvasTex(128, 64, (ctx, w, h) => {
      const gr = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gr.addColorStop(0, "rgba(20,24,38,0.32)"); gr.addColorStop(1, "rgba(20,24,38,0)");
      ctx.setTransform(1, 0, 0, h / w, 0, 0); ctx.fillStyle = gr; ctx.fillRect(0, 0, w, w);
    });
    const shadowGeo = new THREE.PlaneGeometry(1, 1);

    const pool = new Map();
    function get(it) {
      let c = pool.get(it.id);
      if (c) return c;
      const { cart, wheels } = makeCart(it.color);
      const yaw = new THREE.Group(); yaw.add(cart);
      const tilt = new THREE.Group(); tilt.add(yaw); tilt.rotation.x = 0.5;   // a three-quarter view from above
      const shadow = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
      shadow.renderOrder = -1;
      const holder = new THREE.Group(); holder.add(shadow, tilt);
      scene.add(holder);
      c = { holder, tilt, yaw, cart, wheels, shadow };
      pool.set(it.id, c);
      return c;
    }

    let W = 1, H = 1;
    function resize() {
      W = canvas.clientWidth || 1; H = canvas.clientHeight || 1;
      renderer.setSize(W, H, false);
      Object.assign(cam, { left: 0, right: W, top: 0, bottom: -H });
      cam.updateProjectionMatrix();
    }
    resize();

    return {
      resize,
      // items: { id, color, x, y (css px), yaw (rad, 0 = moving right), dist (px travelled), size (px), scale 0..1 }
      render(items) {
        pool.forEach((c) => (c.holder.visible = false));
        for (const it of items) {
          const c = get(it), s = it.size * it.scale;
          c.holder.visible = it.scale > 0.01;
          c.holder.position.set(it.x, -it.y, 0);
          c.tilt.scale.setScalar(s / 1.35);
          c.yaw.rotation.y = it.yaw;
          const spin = -(it.dist / (it.size / 1.35)) / 0.075;     // roll without slipping
          c.wheels.forEach((w) => (w.rotation.z = spin));
          c.shadow.position.set(0, -s * 0.06, -s * 2);
          c.shadow.scale.set(s * 1.25, s * 0.5, 1);
          c.shadow.material.opacity = it.scale;
        }
        renderer.render(scene, cam);
      },
    };
  };
})();
