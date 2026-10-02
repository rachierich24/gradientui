/* Gradient 365 — café supply products (base sits at y = 0, centred on x/z) */
(function () {
  const G = window.G365, C = G.colors;
  const P = (G.products = {});
  const phys = (o) => new THREE.MeshPhysicalMaterial(o);
  const shadow = (g) => { g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return g; };

  /* ---- label artwork ---- */
  function bagArt(bg, ink, accent, roaster, origin) {
    return G.canvasTex(512, 768, (ctx, w, h) => {
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      // grain
      for (let i = 0; i < 2600; i++) { ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.035})`; ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      ctx.fillStyle = ink; ctx.textAlign = "center";
      ctx.font = G.font(500, 20, true); ctx.fillText("EST. 2014", w / 2, 250);
      ctx.font = G.font(600, 52); ctx.fillText(roaster, w / 2, 318);
      ctx.fillStyle = accent; ctx.fillRect(w / 2 - 28, 350, 56, 4);
      ctx.fillStyle = ink; ctx.font = G.font(400, 26); ctx.fillText(origin, w / 2, 420);
      ctx.globalAlpha = 0.6; ctx.font = G.font(400, 19, true);
      ctx.fillText("WASHED \u00b7 1950 MASL", w / 2, 462); ctx.fillText("FLORAL \u00b7 STONE FRUIT", w / 2, 492);
      ctx.globalAlpha = 1; ctx.font = G.font(500, 24, true); ctx.fillText("1 KG \u00b7 WHOLE BEAN", w / 2, 640);
    });
  }
  function cartonArt() {
    return G.canvasTex(256, 512, (ctx, w, h) => {
      ctx.fillStyle = "#fbfcfd"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#142B63"; ctx.fillRect(0, h * 0.62, w, h * 0.38);
      ctx.fillStyle = "#39D6CF"; ctx.fillRect(0, h * 0.6, w, 8);
      ctx.fillStyle = "#142B63"; ctx.textAlign = "center";
      ctx.font = G.font(600, 34); ctx.fillText("Barista", w / 2, 170);
      ctx.font = G.font(400, 20, true); ctx.fillText("WHOLE MILK", w / 2, 206);
      ctx.fillStyle = "#fff"; ctx.font = G.font(500, 18, true); ctx.fillText("2 L \u00b7 3.6% FAT", w / 2, 400);
    });
  }
  function boxLabel(line1, line2, teal) {
    return G.canvasTex(512, 320, (ctx, w, h) => {
      ctx.fillStyle = "#ffffff"; G.rr(ctx, 0, 0, w, h, 18); ctx.fill();
      ctx.fillStyle = teal ? "#10B8B5" : "#142B63"; ctx.fillRect(28, 30, 10, 10);
      ctx.fillStyle = "#0F214D"; ctx.font = G.font(500, 30, true); ctx.fillText(line1, 52, 42);
      ctx.fillStyle = "#52607F"; ctx.font = G.font(400, 26, true); ctx.fillText(line2, 28, 92);
      for (let i = 0, x = 28; x < w - 40; i++) { const bw = 2 + ((i * 7) % 5); ctx.fillStyle = "#0F214D"; ctx.fillRect(x, 150, bw, 120); x += bw + 3 + ((i * 3) % 4); }
    });
  }
  G.tagArt = function (a, b) {
    return G.canvasTex(512, 256, (ctx, w, h) => {
      ctx.fillStyle = "rgba(255,255,255,0.96)"; G.rr(ctx, 4, 4, w - 8, h - 8, 36); ctx.fill();
      ctx.strokeStyle = "rgba(20,43,99,0.12)"; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = "#10B8B5"; ctx.beginPath(); ctx.arc(52, 70, 10, 0, 7); ctx.fill();
      ctx.fillStyle = "#52607F"; ctx.font = G.font(500, 30, true); ctx.fillText(a, 78, 81);
      ctx.fillStyle = "#0F214D"; ctx.font = G.font(500, 46); ctx.fillText(b, 40, 170);
    });
  };

  /* ---- coffee bag: pillow-sided, crimped top, degassing valve ---- */
  const bagVariants = [
    ["#0F214D", "#FFFFFF", "#39D6CF", "Northfield", "Ethiopia Guji"],
    ["#F4F1EC", "#142B63", "#10B8B5", "Halden & Co", "Colombia Huila"],
    ["#C9A77C", "#1c1a17", "#0F214D", "Oro Verde", "Brazil Mogiana"],
  ];
  const bagMats = bagVariants.map((v) => {
    const side = phys({ color: v[0], roughness: 0.62, clearcoat: 0.15 });
    const front = phys({ map: bagArt(...v), roughness: 0.58, clearcoat: 0.15 });
    return [side, side, side, side, front, front];
  });
  P.bag = function (variant) {
    const g = new THREE.Group(), w = 0.6, h = 0.92, d = 0.3;
    const geo = new THREE.BoxGeometry(w, h, d, 10, 20, 6), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const t = (p.getY(i) + h / 2) / h, pinch = G.smooth(0.72, 1, t);
      const bulge = Math.sin(Math.PI * Math.min(1, t / 0.9));
      p.setZ(i, p.getZ(i) * (1 - pinch * 0.9) * (0.8 + 0.28 * bulge));
      p.setX(i, p.getX(i) * (1 + 0.035 * bulge));
    }
    geo.computeVertexNormals();
    const body = new THREE.Mesh(geo, bagMats[variant % 3]);
    body.position.y = h / 2; g.add(body);
    const crimp = new THREE.Mesh(G.roundedBox(w * 1.02, 0.07, 0.035, 0.012, 0.008), bagMats[variant % 3][0]);
    crimp.position.y = h - 0.02; g.add(crimp);
    const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 24), G.mat.shellMatte);
    valve.rotation.x = Math.PI / 2; valve.position.set(0, h * 0.8, d * 0.3); g.add(valve);
    return shadow(g);
  };

  /* ---- takeaway cup with sleeve + lid ---- */
  const cupMat = phys({ color: 0xfbfbfa, roughness: 0.45, clearcoat: 0.3 });
  const sleeveMat = phys({ map: G.grain("#b8946a", 18), roughness: 0.85 });
  const lidMat = phys({ color: 0x142b63, roughness: 0.3, clearcoat: 0.7 });
  P.cup = function (lidWhite) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(G.lathe([[0, 0], [0.155, 0], [0.165, 0.01], [0.22, 0.6], [0.228, 0.62], [0, 0.62]]), cupMat));
    const sl = new THREE.Mesh(G.lathe([[0.176, 0.14], [0.2, 0.44]]), sleeveMat);
    sl.material.side = THREE.DoubleSide; g.add(sl);
    const lid = new THREE.Mesh(G.lathe([[0, 0.7], [0.07, 0.7], [0.085, 0.68], [0.2, 0.665], [0.235, 0.65], [0.238, 0.62], [0.225, 0.6], [0, 0.6]]), lidWhite ? cupMat : lidMat);
    g.add(lid);
    return shadow(g);
  };

  /* ---- milk carton with gable top ---- */
  const cartonFront = phys({ map: cartonArt(), roughness: 0.5, clearcoat: 0.2 });
  const cartonSide = phys({ color: 0xfbfcfd, roughness: 0.5, clearcoat: 0.2 });
  P.carton = function () {
    const g = new THREE.Group(), s = 0.34, h = 0.64;
    const body = new THREE.Mesh(new THREE.BoxGeometry(s, h, s), [cartonSide, cartonSide, cartonSide, cartonSide, cartonFront, cartonSide]);
    body.position.y = h / 2; g.add(body);
    const tri = new THREE.Shape(); tri.moveTo(-s / 2, 0); tri.lineTo(s / 2, 0); tri.lineTo(0, 0.16); tri.closePath();
    const gable = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: s, bevelEnabled: false }), cartonSide);
    gable.rotation.y = Math.PI / 2; gable.position.set(-s / 2, h, 0); g.add(gable);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.05, s), cartonSide); fin.position.y = h + 0.175; g.add(fin);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.035, 24), phys({ color: C.teal, roughness: 0.35 }));
    cap.position.set(0, h + 0.1, 0.07); cap.rotation.x = 0.8; g.add(cap);
    return shadow(g);
  };

  /* ---- syrup bottle: glass, amber liquid, chrome pump ---- */
  const liquid = phys({ color: 0x9a4d12, roughness: 0.15, transmission: 0.45, thickness: 1, transparent: true });
  const bottleLabel = G.canvasTex(512, 160, (ctx, w, h) => {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#0F214D"; ctx.font = G.font(600, 34); ctx.textAlign = "center"; ctx.fillText("Vanilla Bean", w / 4, 76);
    ctx.font = G.font(400, 18, true); ctx.fillText("750 ML \u00b7 SYRUP", w / 4, 112);
    ctx.fillStyle = "#10B8B5"; ctx.fillRect(w / 4 - 20, 128, 40, 3);
  });
  P.bottle = function () {
    const g = new THREE.Group();
    const prof = [[0, 0.005], [0.12, 0], [0.13, 0.02], [0.13, 0.6], [0.11, 0.68], [0.045, 0.74], [0.045, 0.8], [0, 0.8]];
    g.add(new THREE.Mesh(G.lathe(prof), G.mat.glass));
    g.add(new THREE.Mesh(G.lathe([[0, 0.02], [0.115, 0.02], [0.115, 0.5], [0, 0.5]]), liquid));
    const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.133, 0.133, 0.22, 48, 1, true), phys({ map: bottleLabel, roughness: 0.6 }));
    lab.position.y = 0.3; lab.rotation.y = -Math.PI / 2; g.add(lab);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.06, 32), G.mat.navy); collar.position.y = 0.8; g.add(collar);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 16), G.mat.chrome); stem.position.y = 0.88; g.add(stem);
    const head = new THREE.Mesh(G.roundedBox(0.18, 0.04, 0.05, 0.02, 0.012), G.mat.navy); head.position.set(0.05, 0.95, 0); g.add(head);
    return shadow(g);
  };

  /* ---- nested paper cup stack ---- */
  P.cupStack = function () {
    const g = new THREE.Group();
    const cup = G.lathe([[0.15, 0], [0.21, 0.5], [0.222, 0.51]], 40);
    const m = cupMat.clone(); m.side = THREE.DoubleSide;
    for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(cup, m); c.position.y = i * 0.06; g.add(c); }
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.18, 0.06, 40, 1, true), phys({ color: C.teal, roughness: 0.4, side: THREE.DoubleSide }));
    band.position.y = 0.24; g.add(band);
    return shadow(g);
  };

  /* ---- shipping box with tape + label ---- */
  const kraft = phys({ map: G.grain("#caa77b", 22), roughness: 0.88 });
  const tape = phys({ color: 0xe9e2d4, roughness: 0.35, clearcoat: 0.6, transparent: true, opacity: 0.85 });
  P.box = function (w, h, d, labelA, labelB) {
    const g = new THREE.Group();
    const b = new THREE.Mesh(G.roundedBox(w, h, d, 0.018, 0.012), kraft); b.position.y = h / 2; g.add(b);
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.004, d + 0.004), tape); t.position.y = h + 0.001; g.add(t);
    const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, h * 0.35, 0.004), tape); t2.position.set(0, h * 0.82, d / 2 + 0.002); g.add(t2);
    if (labelA) {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.46, w * 0.46 * 0.625), new THREE.MeshStandardMaterial({ map: boxLabel(labelA, labelB, true), roughness: 0.6, transparent: true }));
      l.position.set(w * 0.2, h * 0.4, d / 2 + 0.003); g.add(l);
    }
    return shadow(g);
  };

  /* ---- paper bag with rolled top ---- */
  P.paperBag = function () {
    const g = new THREE.Group(), w = 0.46, h = 0.62, d = 0.28;
    const m = phys({ map: G.grain("#d8c2a0", 16), roughness: 0.9 });
    const b = new THREE.Mesh(G.roundedBox(w, h, d, 0.01, 0.008), m); b.position.y = h / 2; g.add(b);
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, w, 20), m); roll.rotation.z = Math.PI / 2; roll.position.y = h + 0.02; g.add(roll);
    const stamp = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.068, 40, 1, 0, Math.PI * 1.55), new THREE.MeshBasicMaterial({ color: C.navy, transparent: true, opacity: 0.8 }));
    stamp.position.set(0, h * 0.55, d / 2 + 0.002); g.add(stamp);
    return shadow(g);
  };

  /* ---- open crate (organised order) ---- */
  P.crate = function (fill) {
    const g = new THREE.Group(), w = 1.25, h = 0.48, d = 0.9, tk = 0.045;
    const frame = G.mat.navy, slat = G.mat.shell;
    const base = new THREE.Mesh(G.roundedBox(w, 0.05, d, 0.03, 0.02), frame); base.position.y = 0.025; g.add(base);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const post = new THREE.Mesh(G.roundedBox(0.07, h, 0.07, 0.03, 0.02), frame);
      post.position.set(sx * (w / 2 - 0.035), h / 2, sz * (d / 2 - 0.035)); g.add(post);
    });
    for (let i = 0; i < 2; i++) {
      const y = 0.16 + i * 0.2;
      [1, -1].forEach((sz) => { const s = new THREE.Mesh(G.roundedBox(w - 0.1, 0.1, tk, 0.03, 0.015), slat); s.position.set(0, y, sz * (d / 2 - 0.03)); g.add(s); });
      [1, -1].forEach((sx) => { const s = new THREE.Mesh(G.roundedBox(tk, 0.1, d - 0.1, 0.015, 0.015), slat); s.position.set(sx * (w / 2 - 0.03), y, 0); g.add(s); });
    }
    const accent = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.012, 0.004), G.mat.tealGlow); accent.position.set(-w / 2 + 0.3, 0.42, d / 2 + 0.001); g.add(accent);
    if (fill === 0) {
      [-0.36, 0, 0.36].forEach((x, i) => { const b = P.bag(i); b.scale.setScalar(0.62); b.position.set(x, 0.05, -0.12); g.add(b); });
      [-0.3, 0.3].forEach((x) => { const c = P.cup(true); c.scale.setScalar(0.62); c.position.set(x, 0.05, 0.22); g.add(c); });
    } else {
      [-0.4, -0.13, 0.14, 0.41].forEach((x, i) => { const c = i % 2 ? P.carton() : P.bottle(); c.scale.setScalar(0.72); c.position.set(x, 0.05, -0.05); g.add(c); });
    }
    return shadow(g);
  };

  /* ---- small standing order tag ---- */
  P.tag = function (a, b, scale) {
    const s = scale || 0.5, g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s / 2), new THREE.MeshBasicMaterial({ map: G.tagArt(a, b), transparent: true, depthWrite: false, toneMapped: false }));
    g.add(m);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.34, 8), G.mat.chrome); pin.position.y = -s / 4 - 0.17; g.add(pin);
    return g;
  };

  /* ---- sealed fulfilment tote ---- */
  P.tote = function () {
    const g = new THREE.Group(), w = 1.05, h = 0.52, d = 0.78;
    const body = new THREE.Mesh(G.roundedBox(w, h, d, 0.08, 0.05), G.mat.shell); body.position.y = h / 2; g.add(body);
    const lid = new THREE.Mesh(G.roundedBox(w + 0.03, 0.06, d + 0.03, 0.08, 0.03), G.mat.navyGloss); lid.position.y = h + 0.02; g.add(lid);
    const band = new THREE.Mesh(new THREE.BoxGeometry(w * 0.55, 0.014, 0.004), G.mat.tealGlow); band.position.set(0, h * 0.72, d / 2 + 0.002); g.add(band);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.26), new THREE.MeshStandardMaterial({ map: boxLabel("CAF\u00c9 LUNE", "#24817 \u00b7 14 ITEMS"), roughness: 0.6, transparent: true }));
    lab.position.set(-0.16, h * 0.38, d / 2 + 0.003); g.add(lab);
    return shadow(g);
  };
})();
