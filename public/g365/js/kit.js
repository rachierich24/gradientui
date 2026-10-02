/* Gradient 365 — shared kit: palette, materials, geometry + texture helpers */
(function () {
  const G = (window.G365 = window.G365 || {});
  const C = (G.colors = {
    navy: 0x142b63, navyDeep: 0x0f214d, teal: 0x10b8b5, tealLight: 0x39d6cf,
    ground: 0xf8fbfc, white: 0xffffff, shell: 0xf3f5f7, kraft: 0xc9a77c,
  });

  /* ---------- geometry ---------- */
  function rrShape(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    r = Math.min(r, w / 2, h / 2);
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  G.rrShape = rrShape;

  // Rounded box: rounded in the XY profile, bevelled along Z. Centered.
  G.roundedBox = function (w, h, d, r, bevel) {
    const b = Math.min(bevel == null ? r * 0.6 : bevel, d / 2 - 0.001);
    const geo = new THREE.ExtrudeGeometry(rrShape(w - b * 2, h - b * 2, Math.max(r - b, 0.001)), {
      depth: d - b * 2, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 5, curveSegments: 10,
    });
    geo.translate(0, 0, -(d - b * 2) / 2);
    geo.computeVertexNormals();
    return geo;
  };

  // Lathe from [radius, y] pairs
  G.lathe = function (pts, seg) {
    return new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg || 48);
  };

  /* ---------- canvas textures ---------- */
  G.canvasTex = function (w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    draw(ctx, w, h);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    return t;
  };
  G.rr = function (ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  };
  G.font = (wt, px, mono) => `${wt} ${px}px ${mono ? '"Geist Mono", ui-monospace, Menlo, monospace' : '"Geist", -apple-system, Helvetica, Arial, sans-serif'}`;

  // Paper grain for physical products (subtle imperfection)
  G.grain = function (base, amt, size) {
    return G.canvasTex(size || 256, size || 256, (ctx, w, h) => {
      ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
      const img = ctx.getImageData(0, 0, w, h), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * amt;
        d[i] += n; d[i + 1] += n; d[i + 2] += n;
      }
      ctx.putImageData(img, 0, 0);
    });
  };

  /* ---------- materials ---------- */
  const M = (G.mat = {});
  G.buildMaterials = function () {
    M.shell = new THREE.MeshPhysicalMaterial({ color: 0xf1f4f7, roughness: 0.38, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.3 });
    M.shellMatte = new THREE.MeshStandardMaterial({ color: 0xe9edf1, roughness: 0.55 });
    M.belt = new THREE.MeshStandardMaterial({ color: 0xdfe4ea, roughness: 0.78 });
    M.brushed = new THREE.MeshStandardMaterial({ color: 0xc9d0d8, roughness: 0.3, metalness: 1 });
    M.chrome = new THREE.MeshStandardMaterial({ color: 0xe7ebef, roughness: 0.12, metalness: 1 });
    M.navy = new THREE.MeshPhysicalMaterial({ color: C.navyDeep, roughness: 0.35, metalness: 0.15, clearcoat: 0.8, clearcoatRoughness: 0.2 });
    M.navyGloss = new THREE.MeshPhysicalMaterial({ color: C.navy, roughness: 0.18, metalness: 0.2, clearcoat: 1 });
    M.glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, roughness: 0.06, metalness: 0, transmission: 1, thickness: 0.15, ior: 1.45,
      transparent: true, opacity: 1, envMapIntensity: 0.7, clearcoat: 1, clearcoatRoughness: 0.05,
    });
    M.glassTint = new THREE.MeshPhysicalMaterial({
      color: 0xd8f4f3, roughness: 0.12, transmission: 0.9, thickness: 0.5, ior: 1.4, transparent: true, envMapIntensity: 1,
    });
    M.tealGlow = new THREE.MeshBasicMaterial({ color: C.tealLight, transparent: true, opacity: 0.9, toneMapped: false });
    M.tealLine = new THREE.MeshBasicMaterial({ color: C.teal, transparent: true, opacity: 0.55, toneMapped: false });
    return M;
  };

  /* ---------- studio environment (soft boxes for reflections) ---------- */
  G.studioEnv = function (renderer) {
    const env = new THREE.Scene();
    const room = new THREE.Mesh(new THREE.BoxGeometry(40, 20, 40), new THREE.MeshBasicMaterial({ color: 0xb9c3cd, side: THREE.BackSide }));
    room.position.y = 6;
    env.add(room);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: 0x98a4b1 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -3.9;
    env.add(floor);
    const panel = (w, h, x, y, z, ry, rx, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k * 1.02), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); env.add(m);
    };
    panel(18, 3, 0, 15.5, 0, 0, Math.PI / 2, 5);      // overhead strip
    panel(8, 8, -15, 6, 6, Math.PI / 2.4, 0, 3.2);    // key softbox
    panel(10, 5, 16, 5, -4, -Math.PI / 2.2, 0, 2.2);  // fill
    panel(14, 2.5, 0, 6, -19, 0, 0, 1.8);             // back rim strip
    const tealCard = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 1.1, 1.05) }));
    tealCard.position.set(8, 1, 18); tealCard.rotation.y = Math.PI; env.add(tealCard);
    const pm = new THREE.PMREMGenerator(renderer);
    const rt = pm.fromScene(env, 0.035);
    pm.dispose();
    return rt.texture;
  };

  G.smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  G.rand = (function () { let s = 365; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
})();
