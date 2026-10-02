/* Gradient 365 — the energy system.
   Particles are drawn out of the headline along a few calm lanes, like threads of smoke, into the gap
   between the two buttons. There three silk ribbons form, cross once over and under past the core,
   knot, then peel off toward the café, supplier and brand devices.
   - On first load the braid draws itself down from the gap before anything else appears.
   - The cursor bends nearby particles toward it; hovering "Book a demo" brightens and speeds the flow.
   - Scrolling draws the ribbons the rest of the way down onto the devices in the ecosystem section below:
     café → phone, supplier → supplier dashboard, brand → brand dashboard. They fade once that section pins.
   (Site copy: originally landed on three cards under the stage.) */
(function () {
  const G = (window.G365 = window.G365 || {});
  const stage = document.getElementById("stage"), canvas = document.getElementById("energy");
  if (!stage || !canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = getComputedStyle(document.documentElement);
  const hex = (v, d) => (v && v.trim()) || d;
  const rgb = (h) => { const n = parseInt(h.replace("#", ""), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

  const RIBBONS = [
    { key: "cafe", color: rgb(hex(css.getPropertyValue("--e-cafe"), "#FF0000")), phase: 0 },
    { key: "supply", color: rgb(hex(css.getPropertyValue("--e-supply"), "#22C55E")), phase: (2 * Math.PI) / 3 },
    { key: "brand", color: rgb(hex(css.getPropertyValue("--e-brand"), "#7F00FF")), phase: (4 * Math.PI) / 3 },
  ];
  // where each ribbon lands: the target element, how far across its top edge (inner side, clear of the
  // section copy), and its slot when there's nothing to land on (narrow screens)
  const TARGETS = {
    cafe: { sel: ".eco-screen-mobile .eco-phone-chassis", at: 0.5, slot: 0.5 },
    supply: { sel: ".eco-screen-supplier .eco-device-scaler", at: 0.84, slot: 0.25 },
    brand: { sel: ".eco-screen-brand .eco-device-scaler", at: 0.16, slot: 0.75 },
  };
  const eco = document.getElementById("ecosystem");
  RIBBONS.forEach((r) => { r.target = document.querySelector(TARGETS[r.key].sel); r.pulses = []; });
  const PCOL = RIBBONS.map((r) => r.color);

  const STRANDS = 17;
  const LEAD = 60, TRUNK = 110, PEEL = 120, CHUNK = 4;  // samples: out of the button gap, the braid, the peel to each device
  const TURNS = 0.6;                                   // a single calm crossing before the knot
  const AMP = 30;                                      // how far the braid swings either side of centre
  const LANE_AT = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];  // where along the headline the smoke lanes start
  const LANE_COL = [0, 2, 1, 0, 2, 2, 0, 1, 2, 0];                               // café, brand, supplier… mirrored about the centre
  let W = 0, H = 0, cy = 220, dpr = 1, cx = 0, yS = 0, yK = 0, top = 0, O = [0, 0], landing = false, fade = 1;
  const actions = document.querySelector(".hero .actions"), heading = document.querySelector(".hero h1");
  const primary = document.querySelector(".hero .btn.primary");
  let lanes = [], particles = [];

  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const bezAt = (P, u) => {
    const m = 1 - u;
    return [m * m * m * P[0][0] + 3 * m * m * u * P[1][0] + 3 * m * u * u * P[2][0] + u * u * u * P[3][0],
            m * m * m * P[0][1] + 3 * m * m * u * P[1][1] + 3 * m * u * u * P[2][1] + u * u * u * P[3][1]];
  };

  function layout(nextCy) {
    if (nextCy) cy = nextCy;
    const r = stage.getBoundingClientRect();
    const ar = actions ? actions.getBoundingClientRect() : null;
    // measure the headline's actual lines, so the lanes start in the words wherever they wrap
    let lines = [];
    if (heading) { const rg = document.createRange(); rg.selectNodeContents(heading); lines = [...rg.getClientRects()].filter((b) => b.width > 24 && b.height > 10); }
    const headTop = lines.length ? Math.min(...lines.map((b) => b.top)) : (ar ? ar.top : r.top);
    top = Math.min(0, Math.round(headTop - 12 - r.top));
    W = r.width; H = r.height - top; dpr = Math.min(window.devicePixelRatio || 1, 2);
    // reach down far enough to cover the devices, with room for them to drift while the section pins
    const stacked = matchMedia("(max-width: 860px)").matches;
    const rects = RIBBONS.map((rb) => (rb.target ? rb.target.getBoundingClientRect() : null));
    landing = !stacked && rects.every((b) => b && b.width > 0 && b.top - r.bottom < 900);
    if (landing) H = Math.max(H, Math.max(...rects.map((b) => b.top - r.top - top)) + 260);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px"; canvas.style.top = top + "px";
    cx = W / 2;
    const toY = (pageY) => pageY - r.top - top;
    yK = cy + 150 - top;                          // the knot, below the card rows
    O = ar ? [cx, toY(ar.top + ar.height / 2)] : [cx, cy - 150 - top];   // the gap between the buttons
    yS = ar ? toY(ar.bottom) + 10 : O[1] + 30;

    // smoke lanes: from under the headline's last line, curving into the gap
    lanes = [];
    const bottomLine = lines.length ? lines.reduce((a, b) => (b.bottom > a.bottom ? b : a)) : null;
    const lastRow = bottomLine ? lines.filter((b) => Math.abs(b.bottom - bottomLine.bottom) < 4) : [];
    if (lastRow.length) {
      const x0 = Math.min(...lastRow.map((b) => b.left)) - r.left, x1 = Math.max(...lastRow.map((b) => b.right)) - r.left;
      const oy = toY(bottomLine.bottom - bottomLine.height * 0.22);
      LANE_AT.forEach((f, i) => {
        const x = x0 + (x1 - x0) * f, side = x < O[0] ? -1 : 1, reach = Math.abs(x - O[0]);
        lanes.push({ c: LANE_COL[i], P: [[x, oy], [x, oy + 26], [O[0] + side * Math.min(reach * 0.3, 80), O[1] - 34], [O[0], O[1]]] });
      });
    }

    track();
    draw(lastT);
  }

  // the devices move (hover, scroll-pinning), so their landing points are re-read every frame
  function track() {
    const cr = canvas.getBoundingClientRect();
    RIBBONS.forEach((rb) => {
      const T = TARGETS[rb.key];
      if (landing && rb.target) {
        const b = rb.target.getBoundingClientRect();
        rb.ex = b.left - cr.left + b.width * T.at; rb.ey = b.top - cr.top + 2;
      } else { rb.ex = W * T.slot; rb.ey = H; }
    });
    const pinned = landing && eco ? Math.max(0, -eco.getBoundingClientRect().top) : 0;
    fade = 1 - smooth(0, 180, pinned);
  }

  // centre line of one ribbon as samples: x, y, depth (0 back … 1 front), half-width
  function centreLine(rb, T) {
    const out = [];
    const flow = T * 0.45;                    // the braid pattern drifts slowly downward
    const yB = yS + 24;
    const A = [O, [cx, O[1] + (yB - O[1]) * 0.35], [cx, O[1] + (yB - O[1]) * 0.7], [cx, yB]];
    for (let k = 0; k < LEAD; k++) {
      const s = k / LEAD, [x, y] = bezAt(A, s);
      const th = 2 * Math.PI * 0.7 * s + rb.phase - flow;
      const sep = 3 * Math.sin(th) * smooth(0, 0.35, s) * (1 - smooth(0.75, 1, s));
      out.push([x + sep, y, (Math.cos(th) + 1) / 2, (0.4 + 3.4 * s * s) * (0.35 + 0.65 * Math.abs(Math.cos(th)))]);
    }
    for (let k = 0; k <= TRUNK; k++) {
      const s = k / TRUNK, th = 2 * Math.PI * TURNS * s + rb.phase - flow;
      const amp = AMP * smooth(0, 0.22, s) * (1 - smooth(0.8, 1, s));  // open gently, close into the knot
      const face = Math.abs(Math.cos(th));                               // edge-on at the sides, face-on at the front
      const z = (Math.cos(th) + 1) / 2;
      const hw = (3.8 + 11 * smooth(0, 0.25, s) * (1 - 0.6 * smooth(0.85, 1, s))) * (0.2 + 0.8 * face);
      out.push([cx + amp * Math.sin(th), yB + (yK - yB) * s, z, hw]);
    }
    const ey = rb.ey, inward = landing ? (cx - rb.ex) * 0.45 : 0;
    const P = [[cx, yK], [cx, yK + (ey - yK) * 0.45], [rb.ex + inward, ey - (ey - yK) * 0.3], [rb.ex, ey]];
    for (let k = 1; k <= PEEL; k++) {
      const u = k / PEEL, [x, y] = bezAt(P, u);
      const face = Math.abs(Math.cos(2 * Math.PI * 0.6 * u + rb.phase - T * 0.35));
      const hw = (4 + 16 * Math.sin(Math.PI * u)) * (0.16 + 0.84 * face) * Math.pow(Math.sin(Math.PI * Math.min(1, 0.5 + u * 0.52)), 0.6);
      out.push([x, y, 1, hw]);
    }
    for (let k = 0; k < out.length; k++) {
      const a = out[Math.max(0, k - 1)], b = out[Math.min(out.length - 1, k + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      out[k].push(-dy / l, dx / l);
    }
    return out;
  }

  /* ---------- state that shapes the drawing ---------- */
  let T = 0, lastT = 0, boost = 0, boostTarget = 0, scrollP = 0, bootR = 1, mouse = null;
  const bootAt = window.G365BOOT;                        // set by the page when the first-load sequence runs
  const reveal = () => 0.32 + 0.68 * smooth(0, 1, scrollP); // how far the ribbons reach toward their devices

  function drawParticles() {
    const glowR = 26 + 16 * boost;
    const g = ctx.createRadialGradient(O[0], O[1], 0, O[0], O[1], glowR);
    g.addColorStop(0, `rgba(127,0,255,${(0.1 + 0.12 * boost) * bootR})`); g.addColorStop(1, "rgba(127,0,255,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(O[0], O[1], glowR, 0, Math.PI * 2); ctx.fill();
    const m = mouse ? (() => { const cr = canvas.getBoundingClientRect(); return [mouse[0] - cr.left, mouse[1] - cr.top]; })() : null;
    particles.forEach((p) => {
      const L = lanes[p.lane]; if (!L) return;
      const a = p.t / p.life, u = Math.pow(a, 1.35);   // gentle to leave, gently drawn in
      let [x, y] = bezAt(L.P, u), [px, py] = bezAt(L.P, Math.max(0, u - 0.012));
      const sway = 2.4 * Math.sin(a * 7 + p.seed) * (1 - a);   // smoke drifts, it doesn't travel in rails
      x += sway; px += sway;
      if (m) {                                                 // the cursor draws nearby energy toward it
        const dx = m[0] - x, dy = m[1] - y, d = Math.hypot(dx, dy);
        if (d < 150) { const f = 0.28 * Math.pow(1 - d / 150, 2); x += dx * f; y += dy * f; px += dx * f * 0.8; py += dy * f * 0.8; }
      }
      const [R, Gc, B] = PCOL[L.c];
      const alpha = Math.min(1, a / 0.2) * (1 - Math.max(0, (a - 0.88) / 0.12)) * (0.5 + 0.25 * boost);
      ctx.strokeStyle = `rgba(${R},${Gc},${B},${(alpha * 0.5).toFixed(3)})`; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = `rgba(${R},${Gc},${B},${alpha.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(x, y, p.size * (1 - 0.3 * a), 0, Math.PI * 2); ctx.fill();
    });
  }

  function draw(Tn) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (fade <= 0) return;
    ctx.globalAlpha = fade;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    drawParticles();
    const lines = RIBBONS.map((rb) => ({ rb, L: centreLine(rb, Tn) }));
    const N = lines[0].L.length - 1;
    // how much of each ribbon is drawn: grows from the gap on first load, then down to the devices on scroll
    const reach = LEAD + TRUNK + reveal() * PEEL, drawn = Math.min(N, Math.floor(reach * bootR));
    const pos = (L, q, u, j) => {
      const [x, y, , hw, nx, ny] = L[q];
      const silk = hw > 3 ? 0.4 * Math.sin(q * 0.25 + j * 1.7 + Tn * 0.8) : 0;
      const off = u * hw + silk;
      return [x + nx * off, y + ny * off];
    };
    const lift0 = 1 + 0.6 * boost;
    for (let k = 0; k < drawn; k += CHUNK) {
      const kEnd = Math.min(drawn, k + CHUNK);
      const tip = smooth(drawn, drawn - 14, k);          // the leading edge fades out instead of stopping hard
      const order = lines.slice().sort((a, b) => a.L[k][2] - b.L[k][2]);
      order.forEach(({ rb, L }) => {
        const z = L[k][2], [R, Gc, B] = rb.color, t = k / N;
        let pulse = 0;
        rb.pulses.forEach((p) => { const d = (t - p.t) / 0.05; pulse += Math.exp(-d * d); });
        const depth = 0.4 + 0.6 * z, lift = (lift0 + 2.2 * pulse) * tip;
        ctx.beginPath();
        for (let q = k; q <= kEnd; q++) { const [px, py] = pos(L, q, -1, 0); q === k ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
        for (let q = kEnd; q >= k; q--) { const [px, py] = pos(L, q, 1, STRANDS - 1); ctx.lineTo(px, py); }
        ctx.closePath();
        ctx.fillStyle = `rgba(${R},${Gc},${B},${(0.055 * depth * lift).toFixed(3)})`;
        ctx.fill();
        for (let j = 0; j < STRANDS; j++) {
          const u = -1 + (2 * j) / (STRANDS - 1), edge = j === 0 || j === STRANDS - 1, sheen = j === 4;
          const a = (edge ? 0.62 : sheen ? 0.34 : 0.1 + 0.07 * (1 - Math.abs(u))) * depth * lift;
          ctx.strokeStyle = `rgba(${R},${Gc},${B},${Math.min(0.95, a).toFixed(3)})`;
          ctx.lineWidth = (edge ? 1.15 : sheen ? 0.95 : 0.6) * (0.85 + 0.3 * z) + 0.6 * pulse;
          ctx.beginPath();
          for (let q = k; q <= kEnd; q++) { const [px, py] = pos(L, q, u, j); q === k ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
          ctx.stroke();
        }
      });
    }
  }

  function fire(key) {
    if (reduce) return;
    const rb = RIBBONS.find((r) => r.key === key);
    if (rb && rb.pulses.length < 3) rb.pulses.push({ t: -0.05 });
  }

  /* ---------- input ---------- */
  addEventListener("pointermove", (e) => { mouse = [e.clientX, e.clientY]; }, { passive: true });
  document.addEventListener("pointerleave", () => { mouse = null; });
  if (primary) {
    primary.addEventListener("pointerenter", () => { boostTarget = 1; });
    primary.addEventListener("pointerleave", () => { boostTarget = 0; });
    primary.addEventListener("focus", () => { boostTarget = 1; });
    primary.addEventListener("blur", () => { boostTarget = 0; });
  }
  const readScroll = () => { scrollP = Math.min(1, Math.max(0, scrollY / 460)); };
  addEventListener("scroll", readScroll, { passive: true });
  readScroll();

  let visible = true, last = performance.now(), spawnDebt = 0, seed = 0;
  if ("IntersectionObserver" in window) new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(canvas);
  function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible || reduce) return;
    boost += (boostTarget - boost) * Math.min(1, dt * 3);
    const since = bootAt ? (now - bootAt) / 1000 : 99;
    bootR = smooth(0.15, 1.6, since);
    const pace = 1 + 1.3 * boost + 0.8 * scrollP;        // the button and the scroll both power the flow
    T += dt * pace; lastT = T;
    // a calm, steady draw of energy out of the headline
    if (lanes.length && since > 0.35) {
      spawnDebt += dt * 38 * (1 + 1.1 * boost);
      const cap = 100 + 50 * boost;
      while (spawnDebt >= 1 && particles.length < cap) {
        particles.push({ lane: (Math.random() * lanes.length) | 0, t: 0, life: 3 + Math.random(), size: 1.05 + Math.random() * 0.55, seed: (seed += 1.7) });
        spawnDebt -= 1;
      }
      if (particles.length >= cap) spawnDebt = 0;
    }
    for (let i = particles.length - 1; i >= 0; i--) { particles[i].t += dt * (1 + 0.8 * boost); if (particles[i].t >= particles[i].life) particles.splice(i, 1); }
    const reached = reveal() > 0.98;
    RIBBONS.forEach((rb) => {
      for (let i = rb.pulses.length - 1; i >= 0; i--) {
        const p = rb.pulses[i];
        p.t += dt * 0.7 * pace;
        if (!p.landed && p.t >= 0.98 && rb.target && landing && reached && fade > 0.5) {
          p.landed = true;
          const el = rb.target;
          el.style.setProperty("--g365-e", `rgb(${rb.color.join(",")})`);
          el.classList.remove("g365-hit"); void el.offsetWidth; el.classList.add("g365-hit");
          setTimeout(() => el.classList.remove("g365-hit"), 900);
        }
        if (p.t > 1.1) rb.pulses.splice(i, 1);
      }
    });
    track();
    draw(T);
  }

  G.energy = { fire, layout };
  const readCy = () => parseFloat(getComputedStyle(stage).getPropertyValue("--cy")) || cy;
  layout(readCy());
  addEventListener("resize", () => { clearTimeout(window.__et); window.__et = setTimeout(() => layout(readCy()), 180); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layout(readCy()));
  // the headline's words move during the first-load sequence; re-measure once they've settled
  if (bootAt) setTimeout(() => layout(readCy()), Math.max(0, bootAt + 3200 - performance.now()));
  requestAnimationFrame(tick);
})();
