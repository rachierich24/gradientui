/* Gradient 365 — hero flow stage, drawn in isometric 3D.
   The stage is a ground plane seen from 30° above and turned 45° (2:1 axes), the same view the live
   products in riders.js are posed for. Three dotted branches meet at a junction in front of the hub:
   cafés come in from the far left along a wave, suppliers straight up from the bottom left, brands up
   from below. Every product starts as a photo printed on a tile; café tiles arrive standing on edge and
   topple flat onto their lane. Once a tile is flat its product pops up in 3D, rides in and jumps into the hub.
   Each landing connects one arc of the Gradient mark on the hub's top: café, then supplier, then brand.
   When the mark is whole the order is complete: a ripple runs across the ground and its order sheet
   glides out of the far side of the hub, rises to float over its lane and drifts on up it with the others.
   Pointed at, a product or a sheet takes its sides' colours: red cafés, green suppliers, purple brands.
   Ported from the standalone hero; the opening-sequence classes live on #g365hero instead of <html>. */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const mod = (a, n) => ((a % n) + n) % n;
  const backOut = (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const SQ = Math.SQRT1_2, COS30 = Math.cos(Math.PI / 6);

  /* ================= flow stage ================= */
  // seven products per side of the counter; the last value is the side, which picks the arc it connects
  const PRODUCTS = [
    // cafés: what a café buys and uses every day
    ["carton", "Barista Milk", "cafe"],
    ["cup", "12oz Cup", "cafe"],
    ["bottle", "Vanilla", "cafe"],
    ["paperBag", "Pastry Bags", "cafe"],
    ["carton", "Oat Milk", "cafe"],
    ["cupStack", "Ripple Cup", "cafe"],
    ["bottle", "Hazelnut", "cafe"],
    // suppliers: wholesale stock, packed and dispatched
    ["box", "Bulk Carton", "supply"],
    ["tote", "Order Tote", "supply"],
    ["crate", "Weekly Crate", "supply"],
    ["box", "Filter Paper", "supply"],
    ["tote", "Cold Tote", "supply"],
    ["crate", "Bar Restock", "supply"],
    ["box", "Lid Carton", "supply"],
    // brands: branded coffee placed into cafés
    ["bag0", "Guji 1kg", "brand"],
    ["bag1", "Huila 1kg", "brand"],
    ["bag2", "Mogiana 1kg", "brand"],
    ["bag0", "Kenya AA", "brand"],
    ["bag1", "House Blend", "brand"],
    ["bag2", "Decaf 1kg", "brand"],
    ["bag0", "Sidamo 1kg", "brand"],
  ];
  const POOL = [0, 1, 2].map((j) => PRODUCTS.slice(j * 7, j * 7 + 7));

  // The ground plan, in ground units (geo.u turns them into px). p runs away to the right, q toward you
  // to the right; the hub sits at the origin. Everything is drawn with the same projection:
  //   x = cx + (p + q)·A,  y = cy + (q − p)·A/2 − h·u·cos30°,  A = u/√2
  // so a = (p + q)/√2 runs straight across the screen and b = (q − p)/√2 straight down it.
  const R = 78;                           // hub radius
  const TRUNK = 80;                       // the junction sits this far in front of the hub's rim
  const TILE = 56, TILE_H = 6;            // input tile: size, thickness
  const STEP = 100;                       // ground between two products arriving, one after another (clear of each other at the junction)
  const RATE = 0.62;                      // products per second: one lands about every 1.6 s, cycling the sides
  const HOP = 40;                         // a product jumps for the hub this far before the rim
  const PL = 236, PH = 3;                 // order sheet: length along its lane (140 across, under the hub's width), thickness
  const OUT_PITCH = PL + 44;              // one place in the queue of sheets
  const FLOAT = 6;                        // once clear of the hub, sheets glide this high over their lane, bobbing a little
  const HOLD = 0.55;                      // the whole mark stays connected this long (in products) after an order completes
  const SHEETS = 7;
  const OFF = 280;                        // the layers reach this far above the stage, so sheets rise beside the copy
  const SIDES = ["cafe", "supply", "brand"];
  // each side's colour, as on its portal (/cafe, /supplier, /brand): a faint pool of it under every product, brighter
  // while it's pointed at (CSS uses the same, as --e-*)
  const GLOW = ["#E03E3E", "#1FA952", "#6B33D3"];

  const stage = document.getElementById("stage"), rowsEl = document.getElementById("rows");
  const core = document.getElementById("core"), canvas = document.getElementById("riders");
  const imgs = {};
  let geo = {}, branches = [], tiles = [], sheets = [], riders = null, frame = 0, connected = -1;
  let pos = 31.4;   // products landed so far (fractional): item n lands when pos reaches n; order m is items 3m … 3m + 2

  // a 3D direction (p, q, h) on screen, and a ground point in layer px
  function P3(v) { return [(v[0] + v[1]) * geo.A, (v[1] - v[0]) * geo.A / 2 - v[2] * geo.u * COS30]; }
  function proj(p, q, h) { const d = P3([p, q, h || 0]); return [geo.cx + d[0], geo.cy + d[1]]; }
  // lays an element flat on the ground, centred on (p, q) at height h; its own x runs along p, y along q
  function onGround(p, q, h, s) {
    const [x, y] = proj(p, q, h);
    return `${geo.mat}${x.toFixed(1)},${y.toFixed(1)})${s ? ` scale(${s.toFixed(3)})` : ""} translate(-50%,-50%)`;
  }

  // a café card standing on the grid like a sign on its lane: upright on its near edge, its face toward you
  // on the right (+q), the print the right way up. It tips back about that edge until it lies flat.
  // phi runs from -STAND (standing) to 0 (flat): the card's own x stays along p, its own y swings from
  // straight down to along q. Returns its on-screen axes, its centre (relative to where the flat tile's
  // centre is), and the shadow offset (in its own space) that draws its thickness.
  const STAND = 78 * Math.PI / 180;
  function cardFrame(phi) {
    const c = Math.cos(phi), s = Math.sin(phi);
    const a = P3([1, 0, 0]), b = P3([0, c, s]), t = P3([0, s, -c]);   // −normal; normal = x × y = (0, −s, c)
    const det = a[0] * b[1] - b[0] * a[1] || 1e-6;
    let lx = (b[1] * t[0] - b[0] * t[1]) / det, ly = (a[0] * t[1] - a[1] * t[0]) / det;
    const m = Math.hypot(lx, ly); if (m > 3) { lx *= 3 / m; ly *= 3 / m; }
    // pivoting on its near edge (q + TILE/2): the centre sits half a card back from that edge along its own y
    return { a, b, lx, ly, dq: TILE / 2 * (1 - c), dh: -TILE / 2 * s };
  }

  // a polyline on the ground (p, q), measured from its first point
  function polyPath(pts) {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const len = cum[cum.length - 1];
    return {
      pts, len,
      at(s) {
        s = clamp(s, 0, len);
        let lo = 0, hi = cum.length - 1;
        while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= s) lo = mid; else hi = mid; }
        const f = (s - cum[lo]) / (cum[hi] - cum[lo] || 1);
        return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f];
      },
    };
  }
  // uniform Catmull–Rom through control points, sampled
  function spline(ctrl, per) {
    const out = [];
    for (let i = 0; i < ctrl.length - 1; i++) {
      const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
      for (let k = 0; k < per; k++) {
        const t = k / per, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (p2[c] - p0[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (3 * p1[c] - p0[c] - 3 * p2[c] + p3[c]) * t3)));
      }
    }
    out.push(ctrl[ctrl.length - 1]);
    return out;
  }

  function fillSheet(S, m) {
    S.m = m; S.fill = -1;
    S.rows.forEach((row, j) => {
      const p = POOL[j][mod(m, 7)];
      if (row.img.dataset.k !== p[0]) {
        row.img.dataset.k = p[0];
        if (imgs[p[0]]) { row.img.src = imgs[p[0]]; row.img.classList.add("ready"); } else { row.img.removeAttribute("src"); row.img.classList.remove("ready"); }
      }
      row.name.textContent = p[1];
    });
    S.no.textContent = "#" + (4821 + m);
    // orders come through the morning, a few minutes apart
    const mins = 6 * 60 + 12 + mod(m, 200) * 3;
    S.tm.textContent = String(Math.floor(mins / 60) % 24).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0");
  }
  // a café tile falling flat: it tips over faster and faster, hits the lane, and bounces a touch
  const tip = (c) => { const g = 1 - c; return g < 0.82 ? 1 - (g / 0.82) * (g / 0.82) : 0.07 * Math.sin(Math.PI * (g - 0.82) / 0.18); };

  // keeps the sheets out from under the headline and subtitle: a hole in the layer's mask
  function measureHole() {
    const hero = document.querySelector("#g365hero .hero"), st = stage.getBoundingClientRect();
    if (!hero) return;
    let x0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const h1 = hero.querySelector("h1"), sub = hero.querySelector(".hero-sub");
    const add = (b) => { if (!b || !b.width) return; x0 = Math.min(x0, b.left); x1 = Math.max(x1, b.right); y1 = Math.max(y1, b.bottom); };
    if (h1) add(h1.getBoundingClientRect());
    if (sub) { const r = document.createRange(); r.selectNodeContents(sub); add(r.getBoundingClientRect()); }
    if (!isFinite(x0)) return;
    rowsEl.style.setProperty("--hx0", Math.round(x0 - st.left - 24) + "px");
    rowsEl.style.setProperty("--hx1", Math.round(x1 - st.left + 24) + "px");
    rowsEl.style.setProperty("--hy", Math.round(y1 - st.top + OFF + 4) + "px");
  }

  function build() {
    const W = stage.clientWidth, narrow = W < 640;
    const u = narrow ? clamp(W / 680, 0.5, 0.62) : clamp(W / 1300, 0.7, 1.2);
    const A = SQ * u, Ru = R * u, hh = Math.round(20 * u);
    const cyS = Math.round((narrow ? 84 : 140) + hh + Ru / 2);    // the hub's footprint centre, stage px
    const yJ = cyS + (R + TRUNK) * u / (2 * Math.SQRT2);           // the junction, stage px
    const H = Math.round(yJ + (narrow ? 120 : 150) * u + 40);
    geo = { W, H, u, A, Ru, hh, cx: Math.round(W * (narrow ? 0.56 : 0.5)), cy: cyS + OFF,
      mat: `matrix(${A.toFixed(5)},${(-A / 2).toFixed(5)},${A.toFixed(5)},${(A / 2).toFixed(5)},` };
    stage.style.height = H + "px";
    stage.style.setProperty("--off", OFF + "px");
    canvas.style.top = -OFF + "px"; canvas.style.height = H + OFF + "px";

    // the hub: a white disc with the mark on its top, on a dark wall
    core.style.left = geo.cx - Ru + "px"; core.style.top = cyS - Ru / 2 - hh + "px";
    core.style.width = 2 * Ru + "px"; core.style.height = Ru + hh + "px";
    core.style.setProperty("--hr", Ru + "px");
    const place = (el, size, x, y) => { if (el) { el.style.width = el.style.height = size + "px"; el.style.transform = `${geo.mat}${x},${y}) translate(-50%,-50%)`; } };
    place(core.querySelector(".hub-top"), 2 * R, Ru, Ru / 2);
    // a bevel peeking out under the top's rim, and a tight contact shadow where the wall meets the ground
    place(core.querySelector(".hub-lip"), 2 * R + 3, Ru, Ru / 2 + 1.6);
    place(core.querySelector(".hub-ao"), 2.16 * R, Ru, Ru / 2 + hh);
    // light comes from the upper left: the hub's shadow falls toward you on the right (+q)
    place(core.querySelector(".hub-glow"), 3.6 * R, Ru + 0.42 * R * A, Ru / 2 + hh + 0.21 * R * A);
    place(core.querySelector(".hub-wave"), 2 * R, Ru, Ru / 2 + hh);
    if (window.G365 && G365.energy) G365.energy.layout(cyS);

    rowsEl.innerHTML = ""; tiles = []; sheets = [];
    if (riders) { riders.reset(); riders.resize(); }

    // a faint dotted floor around the hub, so the scene stands on something
    const floor = document.createElement("div"); floor.className = "floor";
    floor.style.transform = onGround(-(R + TRUNK) / 2, 0, 0);   // centred between the junction and the hub
    rowsEl.appendChild(floor);

    // the three branches, each measured from the junction J outward
    const pJ = -(R + TRUNK), Wl = W, Hl = H + OFF;
    const fromJ = ([a, b]) => [pJ + (a - b) * SQ, (a + b) * SQ];
    const span = geo.cx / u + pJ * SQ;                           // J to the left edge, across the screen
    // in from the left edge, over a crest level with the hub, down into a dip, then up into the junction
    const wave = spline([[0, 0], [-40, 40], [-0.26 * span, 58], [-0.48 * span, -40], [-0.72 * span, -190], [-0.98 * span, -150], [-1.5 * span, -90]], 16);
    const paths = [
      polyPath(wave.map(fromJ)),                                  // cafés: in from the far left
      polyPath([[pJ, 0], [pJ - 3000, 0]]),                        // suppliers: straight up the main diagonal
      polyPath([[pJ, 0], [pJ - 3000 * SQ, 3000 * SQ]]),           // brands: straight up from below
    ];
    branches = paths.map((path, j) => {
      // how far out along the branch a tile is still inside the layer
      let lvis = 0;
      for (let s = 0; s <= path.len; s += 6) {
        const [x, y] = proj(...path.at(s), 0);
        if (x < -70 || x > Wl + 70 || y > Hl + 30 || y < -30) break;
        lvis = s;
      }
      const b = { j, path, lvis };
      if (j === 0) {
        // café tiles arrive standing on edge; they topple on the way down from the crest and lie flat
        // by the middle of the descent, then their products pop up
        const across = (s) => { const g = path.at(s); return (g[0] - pJ + g[1]) * SQ; };
        const reach = (f) => { let s = 0; while (s < path.len && across(s) > -f * span) s += 6; return s; };
        b.landB = Math.max(reach(0.36), 110); b.landA = Math.max(reach(0.62), b.landB + 60);
        b.popA = b.landB - 6; b.popB = b.landB - 70;
      } else {
        // products pop up once their tile has fully faded in from the edge
        b.popA = Math.max(70, Math.min(lvis * 0.72, 300, lvis - 170)); b.popB = b.popA - 70;
      }
      return b;
    });
    geo.lMax = Math.max(...branches.map((b) => b.lvis));
    // and how far up the queue a sheet is still on screen (past the right edge, or faded out at the top)
    const pOut = Math.min((W + 60 - geo.cx) / A, 2 * (geo.cy - 40) / A) + PL;
    geo.sMaxP = (pOut - R + 6) / OUT_PITCH + 0.2;

    // dotted lanes on the ground, all flowing toward the hub and then on out under the sheets
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "flow"); svg.setAttribute("width", W); svg.setAttribute("height", Hl);
    svg.setAttribute("aria-hidden", "true");
    rowsEl.appendChild(svg);
    const line = (pts, cls) => {
      const el = document.createElementNS(NS, "path");
      el.setAttribute("d", pts.map((pt, i) => { const [x, y] = proj(pt[0], pt[1], 0); return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }).join(""));
      if (cls) el.setAttribute("class", cls);
      svg.appendChild(el);
    };
    branches.forEach((b) => {
      const pts = [];
      for (let s = Math.min(b.path.len, b.lvis + 80); s > 0; s -= 10) pts.push(b.path.at(s));
      pts.push(b.path.at(0));
      line(pts, "b-" + SIDES[b.j]);     // lights up in its side's colour while one of its products is pointed at
    });
    line([[pJ, 0], [-R, 0]]);
    line([[R, 0], [pOut + 120, 0]], "out");
    // the junction: a small ring on the ground where the three lanes meet, with a dot at its heart
    const ring = (r, cls) => {
      const [jx, jy] = proj(pJ, 0, 0), el = document.createElementNS(NS, "ellipse");
      el.setAttribute("cx", jx.toFixed(1)); el.setAttribute("cy", jy.toFixed(1));
      el.setAttribute("rx", (r * u).toFixed(1)); el.setAttribute("ry", (r * u / 2).toFixed(1));
      el.setAttribute("class", cls); svg.appendChild(el);
    };
    ring(15, "node"); ring(2.6, "node-dot");

    // one tile per product (7 per side): fixed, so each always carries the same product
    const shadowsFrag = document.createDocumentFragment(), tilesFrag = document.createDocumentFragment();
    POOL.forEach((pool, j) => pool.forEach((p, k) => {
      const sh = document.createElement("div"); sh.className = "tsh";
      const el = document.createElement("div"); el.className = "tile";
      el.innerHTML = `<i class="print"><img alt="" data-k="${p[0]}"></i><i class="pip"></i>`;
      el.style.setProperty("--c", `var(--e-${SIDES[j]})`); sh.style.setProperty("--c", `var(--e-${SIDES[j]})`);
      shadowsFrag.appendChild(sh); tilesFrag.appendChild(el);
      tiles.push({ el, sh, j, name: p[1], print: el.firstChild, key: p[0], id: j + ":" + k, frame: -1, on: false, tumbling: false, popped: false, op: -1, pr: -1, so: -1, sx: 0, sy: 0, up: 0 });
    }));
    rowsEl.appendChild(shadowsFrag); rowsEl.appendChild(tilesFrag);

    // order sheets: order number and time, one line per side, and a floating "Synced" tag
    for (let i = 0; i < SHEETS; i++) {
      const el = document.createElement("div"); el.className = "sheet";
      el.innerHTML = `<div class="pp"><div class="hd"><span class="no"></span><span class="tm"></span></div>` +
        [["cafe", "Café"], ["supply", "Supplier"], ["brand", "Brand"]].map(([k, side]) => `<div class="ln s-${k}"><span class="th"><img alt=""></span><b></b><small>${side}</small></div>`).join("") + `</div>` +
        `<div class="tag"><svg class="ck" viewBox="0 0 14 14" aria-hidden="true"><path pathLength="1" d="M3.2 7.4 L6 10 L10.8 4.4"/></svg>Synced</div>`;
      rowsEl.appendChild(el);
      const lns = [...el.querySelectorAll(".ln")];
      const rows = lns.map((ln) => ({ el: ln, img: ln.querySelector("img"), name: ln.querySelector("b") }));
      sheets.push({ el, rows, tag: el.querySelector(".tag"), ck: el.querySelector(".ck path"), no: el.querySelector(".no"), tm: el.querySelector(".tm"),
        m: null, frame: -1, on: false, cut: -1, g: -1, fill: -1, lift: -1, op: -1, ckv: -1 });
    }

    applyImages();
    measureHole();
  }
  function applyImages() {
    rowsEl.querySelectorAll("img[data-k]").forEach((im) => { const src = imgs[im.dataset.k]; if (src && im.getAttribute("src") !== src) { im.src = src; im.classList.add("ready"); } });
  }

  let boost = 0, lastY = scrollY, last = performance.now();
  const onScroll = () => { boost = Math.min(4, boost + Math.abs(scrollY - lastY) * 0.03); lastY = scrollY; };
  addEventListener("scroll", onScroll, { passive: true });

  // where the pointer is over the stage, in layer px (null when it's elsewhere), and the tile it's on
  let ptr = null, hot = null;
  // the name of the product under the pointer, floating over it (above the 3D canvas)
  const ptag = document.createElement("div");
  ptag.className = "ptag"; ptag.setAttribute("aria-hidden", "true");
  ptag.innerHTML = `<i></i><b></b><small></small>`;
  stage.appendChild(ptag);
  stage.addEventListener("pointermove", (e) => { const r = stage.getBoundingClientRect(); ptr = [e.clientX - r.left, e.clientY - r.top + OFF]; }, { passive: true });
  stage.addEventListener("pointerleave", () => { ptr = null; });

  function show(o, on) { if (o.on !== on) { o.on = on; o.el.style.visibility = on ? "visible" : "hidden"; if (o.sh) o.sh.style.visibility = o.el.style.visibility; } }
  function setOp(o, key, el, v) { v = Math.round(v * 100) / 100; if (o[key] !== v) { o[key] = v; el.style.opacity = v; } }

  // the mark on the hub connects one arc per product of the order in hand, and stays whole for a beat
  function connect() {
    const n = Math.floor(pos), m = Math.floor(n / 3);
    let k = n - 3 * m + 1;
    if (k === 3 && pos - (3 * m + 2) > HOLD) k = 0;
    if (k === connected) return;
    connected = k;
    core.classList.toggle("on-cafe", k >= 1);
    core.classList.toggle("on-supply", k >= 2);
    core.classList.toggle("on-brand", k >= 3);
  }

  // the product under the pointer lights up in its side's colour (hit-tested every frame, so it follows the
  // product as it moves under a still pointer)
  function setHot(T) {
    if (T === hot) return;
    if (hot) { hot.el.classList.remove("hot"); hot.sh.classList.remove("hot"); }
    hot = T;
    if (hot) { hot.el.classList.add("hot"); hot.sh.classList.add("hot"); stage.dataset.hot = SIDES[hot.j]; }
    else delete stage.dataset.hot;
  }

  function draw(t) {
    frame++;
    const items = [], hub = [geo.cx, geo.cy - geo.hh];   // the centre of the hub's top, where products land
    let best = null, bestD = 1;
    const nMin = Math.ceil(pos - 0.5), nMax = Math.floor(pos + (TRUNK + geo.lMax) / STEP) + 1;
    for (let n = nMin; n <= nMax; n++) {
      const j = mod(n, 3), m = Math.floor(n / 3), B = branches[j], T = tiles[j * 7 + mod(m, 7)];
      const d = (n - pos) * STEP, dj = d - TRUNK;   // distance to the hub's rim, and to the junction
      // brand products climb straight up into the junction, right in front of whatever just passed it:
      // they hang back a little on their branch and catch up as they merge, so they never cover it
      const s = j === 2 && dj > 0 ? dj + 40 * smooth(0, 60, dj) : dj;
      if (s > B.lvis || T.frame === frame) continue;
      T.frame = frame;
      show(T, true);
      const [p, q] = s > 0 ? B.path.at(s) : [-R - d, 0];
      const c = j === 0 ? smooth(B.landB, B.landA, dj) : 0;            // 1 while standing, 0 once it lies flat
      const pop = s <= 0 ? 1 : 1 - smooth(B.popB, B.popA, s);           // the product rising out of its tile
      // its footprint on the ground: a thin line under a standing card, the whole square once flat
      let fq = 0, fw = 1;
      if (c > 0.002) {
        // standing upright on the grid on its near edge, then tipping back about that edge to lie flat
        const f = cardFrame(-STAND * tip(c));
        const [x, y] = proj(p, q + f.dq, TILE_H + f.dh);
        T.el.style.transform = `matrix(${f.a[0].toFixed(4)},${f.a[1].toFixed(4)},${f.b[0].toFixed(4)},${f.b[1].toFixed(4)},${x.toFixed(1)},${y.toFixed(1)}) translate(-50%,-50%)`;
        T.el.style.setProperty("--lx", f.lx.toFixed(3)); T.el.style.setProperty("--ly", f.ly.toFixed(3));
        T.tumbling = true;
        // the card covers the ground from its near edge back by its own depth (TILE·cos phi): centre and depth
        fq = f.dq; fw = Math.max(0.28, 1 - f.dq / (TILE / 2));
      }
      // it fades in as it comes in from the edge, and once its product has jumped it dissolves into the
      // lane before it reaches the hub
      const op = smooth(4, 34, d) * smooth(B.lvis, B.lvis - 150, s);
      if (c <= 0.002) {
        if (T.tumbling) { T.tumbling = false; T.el.style.removeProperty("--lx"); T.el.style.removeProperty("--ly"); }
        T.el.style.transform = onGround(p, q, TILE_H, op < 1 ? 0.86 + 0.14 * op : 0);
      }
      setOp(T, "op", T.el, op);
      setOp(T, "pr", T.print, riders ? 1 - smooth(0, 0.45, pop) : 1);
      // its soft shadow falls a little toward you on the right, away from the light, under its footprint
      {
        const [x, y] = proj(p, q + fq + 6, 0);
        T.sh.style.transform = `${geo.mat}${x.toFixed(1)},${y.toFixed(1)}) scale(1,${fw.toFixed(3)}) translate(-50%,-50%)`;
      }
      setOp(T, "so", T.sh, op);
      // is the pointer on this tile or the product standing on it?
      if (ptr && op > 0.5) {
        const [tx, ty] = proj(p, q, TILE_H), up = pop > 0.4 || c > 0.3 ? TILE * geo.u * 0.42 : 0;
        const dx = (ptr[0] - tx) / (TILE * geo.A * 1.05), dy = (ptr[1] - (ty - up)) / (TILE * geo.A * 0.55 + up);
        const dd = dx * dx + dy * dy;
        if (dd < bestD) { bestD = dd; best = T; }
        T.sx = tx; T.sy = ty; T.up = up;
      }
      // a small ripple runs across the tile as its product pops up out of it
      if (pop > 0.02 && !T.popped) { T.popped = true; if (!reduce) T.el.classList.add("pop"); }
      else if (pop <= 0.02 && T.popped) { T.popped = false; T.el.classList.remove("pop"); }
      if (pop > 0 && d > 0) {
        const [x, y] = proj(p, q, TILE_H);
        items.push({ id: T.id, key: T.key, x, y, size: TILE * geo.u, pop, hop: clamp((HOP - d) / HOP, 0, 1), hx: hub[0], hy: hub[1], flat: reduce, tint: GLOW[T.j] });
      }
    }
    tiles.forEach((T) => { if (T.frame !== frame) show(T, false); });
    setHot(best);
    if (hot) {
      const it = items.find((i) => i.id === hot.id); if (it) it.hot = GLOW[hot.j];
      // its name floats just over the top of it (stage px)
      const top = hot.sy - OFF - (hot.up ? TILE * geo.u * 1.08 : TILE * geo.A * 0.6) - 8;
      ptag.style.transform = `translate(${hot.sx.toFixed(1)}px,${top.toFixed(1)}px) translate(-50%,-100%)`;
      if (ptag.dataset.id !== hot.id) {
        ptag.dataset.id = hot.id;
        ptag.querySelector("b").textContent = hot.name;
        ptag.querySelector("small").textContent = ["Café", "Supplier", "Brand"][hot.j];
        ptag.style.setProperty("--c", `var(--e-${SIDES[hot.j]})`);
      }
    }
    ptag.classList.toggle("on", !!hot);

    // order sheets glide out of the hub and on up their lane without stopping
    const done = Math.floor((pos - 2) / 3);                                // the last order completed
    for (let m = done; m > done - SHEETS; m--) {
      const place = (pos - 3 * m - 2) / 3, S = sheets[mod(m, SHEETS)];  // 0 as order m completes, one place per order after
      if (place > geo.sMaxP) break;
      if (S.m !== m) fillSheet(S, m);
      S.frame = frame;
      show(S, true);
      // clear of the hub it rises to float a little over the lane, bobbing gently; --lift pushes its soft
      // shadow back down by as much, so the shadow stays on the ground
      const bob = reduce ? 0 : 2 * Math.sin(t * 1.4 + m * 1.9);
      const lift = Math.round((FLOAT + bob) * smooth(0.25, 0.8, place) * 10) / 10;
      const front = R - 6 + place * OUT_PITCH;
      S.el.style.transform = onGround(front - PL / 2, 0, PH + lift);
      if (lift !== S.lift) { S.lift = lift; S.el.style.setProperty("--lift", lift); }
      // whatever is still inside the hub is cut away (the hub hides it anyway; this keeps it from poking out in front)
      const cut = Math.max(0, Math.round(PL - front));
      if (cut !== S.cut) { S.cut = cut; S.el.style.clipPath = cut > 0 ? `inset(-80px -80px -80px ${cut}px)` : "none"; }
      // its lines fill in one after another as it comes out, so it never slides out as a blank sheet
      const fill = Math.round(smooth(0.12, 0.72, place) * 50) / 50;
      if (fill !== S.fill) {
        S.fill = fill;
        S.rows.forEach((row, j) => {
          const k = smooth(0.18 * j, 0.18 * j + 0.64, fill);
          row.el.style.opacity = k.toFixed(2);
          row.el.style.transform = k < 1 ? `translateX(${(-10 * (1 - k)).toFixed(1)}px)` : "";
        });
      }
      // sheets further up the queue recede a little
      setOp(S, "op", S.el, 1 - 0.1 * clamp(place - 1, 0, 4));
      // its tag pops up as it clears the hub, the tick draws itself, and then it floats gently over the sheet
      const g = Math.round(smooth(0.66, 1, place) * 100) / 100, tb = reduce ? 0 : 1.6 * Math.sin(t * 2.1 + m * 1.7);
      if (g !== S.g) { S.g = g; S.tag.style.opacity = g; }
      S.tag.style.transform = `translate(${(15 + tb).toFixed(2)}px,${(-15 - tb).toFixed(2)}px) scale(${(0.7 + 0.3 * backOut(g)).toFixed(3)})`;
      const ck = Math.round(smooth(0.86, 1, place) * 50) / 50;
      if (ck !== S.ckv) { S.ckv = ck; S.ck.style.strokeDashoffset = (1.001 - ck).toFixed(3); }
    }
    sheets.forEach((S) => { if (S.frame !== frame) show(S, false); });

    if (riders) riders.render(items, t, reduce, geo.cx + geo.Ru * 0.75);
  }

  function restart(cls) { core.classList.remove(cls); void core.offsetWidth; core.classList.add(cls); }

  function tick(now) {
    // the hero unmounted (client-side navigation): stop, rather than animate detached elements forever
    if (!stage.isConnected) { removeEventListener("scroll", onScroll); removeEventListener("resize", onResize); return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    boost *= Math.pow(0.08, dt);
    const scrollP = clamp(scrollY / 460, 0, 1);
    const k = (reduce ? 0.25 : 1) * (1 + boost) * (1 + 1.4 * scrollP);
    const before = pos;
    pos += RATE * k * dt;
    let landed = false, completed = false;
    for (let n = Math.floor(before) + 1; n <= Math.floor(pos); n++) { landed = true; if (mod(n, 3) === 2) completed = true; }
    connect();
    if (stageVisible) draw(now / 1000);
    if (!reduce) {
      if (landed) restart("blip");
      if (completed) restart("wave");   // the mark is whole: a ripple runs out across the ground
    }
    requestAnimationFrame(tick);
  }

  let stageVisible = true;
  if ("IntersectionObserver" in window) new IntersectionObserver((es) => { stageVisible = es[0].isIntersecting; }, { rootMargin: `${OFF}px 0px 0px 0px` }).observe(stage);
  build();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureHole).catch(() => {});
  let rt, lastW = stage.clientWidth;
  // phones fire resize when the URL bar shows or hides; only a width change moves anything
  function onResize() { clearTimeout(rt); rt = setTimeout(() => { if (stage.clientWidth !== lastW) { lastW = stage.clientWidth; build(); } else measureHole(); }, 150); }
  addEventListener("resize", onResize);
  requestAnimationFrame(tick);

  // live 3D products on the tiles; studio photos for the tiles' prints and the sheets
  if (window.G365 && window.G365.createRiders) {
    G365.createRiders(canvas).then((r) => { if (r) riders = r; else stage.classList.add("no-gl"); }).catch(() => stage.classList.add("no-gl"));
  } else stage.classList.add("no-gl");
  if (window.G365 && window.G365.renderThumbs) {
    G365.renderThumbs([...new Set(PRODUCTS.map((p) => p[0]))]).then((out) => {
      Object.assign(imgs, out); applyImages();
      sheets.forEach((S) => { if (S.m !== null) { const m = S.m; S.m = null; S.rows.forEach((r) => { r.img.dataset.k = ""; }); fillSheet(S, m); } });
    }).catch(() => {});
  }

  /* ================= first load: energy first, then the page switches on ================= */
  (function boot() {
    const d = document.getElementById("g365hero"), h1 = d && d.querySelector(".hero h1");
    if (!d || !h1 || !d.classList.contains("boot-head")) return;
    // split the headline into words so they can rise in one by one
    const words = [];
    const split = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement("span"); w.className = "w"; w.textContent = part; frag.appendChild(w); words.push(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          if (n.hasAttribute("data-no-split") || n.classList.contains("hero-pill")) {
            n.classList.add("w");
            words.push(n);
          } else {
            split(n);
          }
        }
      });
    };
    split(h1);
    words.forEach((w, i) => { w.style.transitionDelay = i * 75 + "ms"; });
    h1.classList.add("split");
    const t0 = window.G365BOOT || performance.now();
    const at = (ms, fn) => setTimeout(fn, Math.max(0, t0 + ms - performance.now()));
    at(1100, () => d.classList.remove("boot-head"));                       // words rise in, in navy
    at(1750, () => d.classList.remove("boot-ui"));                         // nav and buttons arrive
    at(2050, () => d.classList.remove("boot-rows"));                       // the hub, lanes and products rise in
    at(2350 + words.length * 75, () => {                                   // the light ignites across the words
      words.forEach((w) => { w.style.transitionDelay = ""; });
      h1.classList.add("settled");
      d.classList.remove("boot-solid");
      measureHole();
    });
  })();

})();
