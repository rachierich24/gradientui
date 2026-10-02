/* Gradient 365 — hero flow stage: builds the moving card rows and runs the opening sequence.
   Ported from the standalone hero; the opening-sequence classes live on #g365hero instead of <html>. */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  /* ================= flow stage ================= */
  // one row per side of the counter, top to bottom: cafés, suppliers, brands.
  // Seven products each, so nothing repeats on screen; names stay short enough to never truncate.
  // The last value is the side, which picks the energy a card fires when it crosses the core.
  const PRODUCTS = [
    // row 1 — cafés: what a café buys and uses every day
    ["carton", "Barista Milk", "\u20b992 / L", "\u20b91,64,230", "9.3%", "cafe"],
    ["cup", "12oz Cup", "\u20b96.50", "\u20b92,02,700", "4.6%", "cafe"],
    ["bottle", "Vanilla", "\u20b9640", "\u20b996,480", "4.6%", "cafe"],
    ["paperBag", "Pastry Bags", "\u20b94", "\u20b968,900", "2.1%", "cafe"],
    ["carton", "Oat Milk", "\u20b9210 / L", "\u20b91,98,400", "12.6%", "cafe"],
    ["cupStack", "Ripple Cup", "\u20b99", "\u20b93,01,450", "2.8%", "cafe"],
    ["bottle", "Hazelnut", "\u20b9640", "\u20b972,150", "3.7%", "cafe"],

    // row 2 — suppliers: wholesale stock, packed and dispatched
    ["box", "Bulk Carton", "\u20b93,800", "\u20b91,74,600", "6.1%", "supply"],
    ["tote", "Order Tote", "\u20b92,300", "\u20b91,06,200", "7.4%", "supply"],
    ["crate", "Weekly Crate", "\u20b912,400", "\u20b93,12,800", "4.1%", "supply"],
    ["box", "Filter Paper", "\u20b9420", "\u20b958,700", "5.4%", "supply"],
    ["tote", "Cold Tote", "\u20b92,650", "\u20b984,300", "3.2%", "supply"],
    ["crate", "Bar Restock", "\u20b99,800", "\u20b92,44,000", "6.8%", "supply"],
    ["box", "Lid Carton", "\u20b91,150", "\u20b977,900", "4.9%", "supply"],

    // row 3 — brands: branded coffee placed into cafés
    ["bag0", "Guji 1kg", "\u20b91,850 / kg", "\u20b94,82,560", "3.9%", "brand"],
    ["bag1", "Huila 1kg", "\u20b91,650 / kg", "\u20b93,58,900", "11.5%", "brand"],
    ["bag2", "Mogiana 1kg", "\u20b91,420 / kg", "\u20b96,11,300", "13.7%", "brand"],
    ["bag0", "Kenya AA", "\u20b92,100 / kg", "\u20b92,76,300", "8.2%", "brand"],
    ["bag1", "House Blend", "\u20b91,380 / kg", "\u20b95,12,900", "7.1%", "brand"],
    ["bag2", "Decaf 1kg", "\u20b91,560 / kg", "\u20b91,12,800", "4.4%", "brand"],
    ["bag0", "Sidamo 1kg", "\u20b91,920 / kg", "\u20b92,04,500", "5.8%", "brand"],
  ];
  const stage = document.getElementById("stage"), rowsEl = document.getElementById("rows");
  const core = document.getElementById("core");
  const imgs = {};
  let rows = [], geo = {}, riders = null;

  function cardHTML(p) {
    return `<div class="face skel"><i class="ph"></i><div class="bars"><b></b><b></b></div><span class="sep"></span><div class="bars r"><b></b><b></b></div></div>` +
      `<div class="face full s-${p[5]}"><div class="ph"><img alt="" data-k="${p[0]}"></div><div class="info"><strong>${p[1]}</strong><span>${p[2]}</span></div><span class="sep"></span>` +
      `<div class="metric"><strong>${p[3]}</strong><span>Orders / mo<em>\u2197 ${p[4]}</em></span></div></div>`;
  }

  function build() {
    const W = stage.clientWidth, narrow = W < 640;
    // the core sits just under the buttons, with the top row rising beside them — like Dropship
    geo = narrow
      ? { cw: 224, ch: 50, gap: 20, rowGap: 80, s: 0.17, c: 230, cy: 200 }
      : { cw: Math.max(262, Math.min(304, W * 0.19)), ch: 62, gap: 28, rowGap: 102, s: 0.18, c: 340, cy: 226 };
    geo.pitch = geo.cw + geo.gap;
    geo.ph = geo.ch - 18;
    geo.half = 44;
    stage.style.setProperty("--cw", geo.cw + "px"); stage.style.setProperty("--ch", geo.ch + "px"); stage.style.setProperty("--ph", geo.ph + "px");
    stage.style.setProperty("--cy", geo.cy + "px");
    if (window.G365 && G365.energy) G365.energy.layout(geo.cy);
    rowsEl.innerHTML = ""; rows = []; geo.W = W;
    if (riders) { riders.reset(); riders.resize(); }
    const count = Math.ceil((W + geo.pitch * 2) / geo.pitch) + 1;
    [-1, 0, 1].forEach((r, ri) => {
      const cards = [];
      for (let i = 0; i < count; i++) {
        const pool = PRODUCTS.slice(ri * 7, ri * 7 + 7), p = pool[i % pool.length];
        const el = document.createElement("div"); el.className = "card"; el.innerHTML = cardHTML(p);
        rowsEl.appendChild(el);
        cards.push({ el, skel: el.children[0], full: el.children[1], i, prev: null, key: p[0], side: p[5], id: ri + ":" + i });
      }
      rows.push({ r, cards, span: count * geo.pitch, off: ri * geo.pitch * 0.45, speed: [58, 68, 50][ri] });
    });
    applyImages();
  }
  function applyImages() {
    rowsEl.querySelectorAll("img[data-k]").forEach((im) => { const src = imgs[im.dataset.k]; if (src && !im.src) { im.src = src; im.classList.add("ready"); } });
  }

  let boost = 0, lastY = scrollY, last = performance.now();
  addEventListener("scroll", () => { boost = Math.min(4, boost + Math.abs(scrollY - lastY) * 0.03); lastY = scrollY; }, { passive: true });

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    boost *= Math.pow(0.08, dt);
    const scrollP = Math.min(1, Math.max(0, scrollY / 460));
    const k = (reduce ? 0.25 : 1) * (1 + boost) * (1 + 1.4 * scrollP), { cw, ch, rowGap, s, c, cy, pitch } = geo;
    let crossed = false;
    const items = [], px = geo.ph, ox = -cw / 2 + 10 + px / 2, t = now / 1000;
    rows.forEach((row) => {
      row.off += row.speed * k * dt;
      row.cards.forEach((cd) => {
        const dx = ((cd.i * pitch + row.off) % row.span + row.span) % row.span - row.span / 2;
        if (cd.prev !== null && cd.prev < geo.half && dx >= geo.half) { crossed = true; if (window.G365 && G365.energy) G365.energy.fire(cd.side); }
        cd.prev = dx;
        // fan: outer rows splay away from the centre line, like pages of a book
        const h = Math.sqrt(dx * dx + c * c);
        const y = cy + row.r * rowGap + row.r * s * (h - c);
        const ang = Math.atan((row.r * s * dx) / h) * 180 / Math.PI;
        cd.el.style.transform = `translate(${dx - cw / 2}px, ${y - ch / 2}px) rotate(${ang}deg)`;
        // cards resolve just past the core, never under it
        const b = Math.min(cw, Math.max(0, geo.half + cw / 2 - dx));
        cd.skel.style.clipPath = `inset(0 ${cw - b}px 0 0 round 12px)`;
        // until a card reaches the core its coloured face stays fully hidden, shadow and border included
        cd.full.style.clipPath = b >= cw - 0.5 ? "inset(0 0 0 100%)" : `inset(-40px -40px -40px ${b}px)`;
        if (riders) {
          // the product rides exactly where the card's photo will be
          const a = ang * Math.PI / 180, tx = dx + ox * Math.cos(a);
          items.push({ id: cd.id, key: cd.key, x: geo.W / 2 + tx, y: y + ox * Math.sin(a), ang: a,
            settle: smooth(-210, -px * 0.6, tx), px, show: tx < px && tx > -geo.W / 2 - px });
        }
      });
    });
    if (riders && stageVisible) riders.render(items, t, reduce);
    if (crossed && !reduce) { core.classList.remove("blip"); void core.offsetWidth; core.classList.add("blip"); }
    requestAnimationFrame(tick);
  }

  let stageVisible = true;
  if ("IntersectionObserver" in window) new IntersectionObserver((es) => { stageVisible = es[0].isIntersecting; }).observe(stage);
  build();
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 150); });
  requestAnimationFrame(tick);

  // live 3D products on the left; photography for the cards on the right
  if (window.G365 && window.G365.createRiders) {
    G365.createRiders(document.getElementById("riders")).then((r) => { if (r) riders = r; else stage.classList.add("no-gl"); }).catch(() => stage.classList.add("no-gl"));
  } else stage.classList.add("no-gl");
  if (window.G365 && window.G365.renderThumbs) {
    G365.renderThumbs([...new Set(PRODUCTS.map((p) => p[0]))]).then((out) => { Object.assign(imgs, out); applyImages(); }).catch(() => {});
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
        } else if (n.nodeType === 1) split(n);
      });
    };
    split(h1);
    words.forEach((w, i) => { w.style.transitionDelay = i * 75 + "ms"; });
    h1.classList.add("split");
    const t0 = window.G365BOOT || performance.now();
    const at = (ms, fn) => setTimeout(fn, Math.max(0, t0 + ms - performance.now()));
    at(1100, () => d.classList.remove("boot-head"));                       // words rise in, in navy
    at(1750, () => d.classList.remove("boot-ui"));                         // nav and buttons arrive
    at(2050, () => d.classList.remove("boot-rows"));                       // cards, products and the tile slide in
    at(2350 + words.length * 75, () => {                                   // the light ignites across the words
      words.forEach((w) => { w.style.transitionDelay = ""; });
      h1.classList.add("settled");
      d.classList.remove("boot-solid");
    });
  })();

})();
