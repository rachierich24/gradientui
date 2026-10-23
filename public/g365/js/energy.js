/* Gradient 365 — the hero's core, and one order delivered to every side.
   - Each card that crosses the core lights the matching segment of the Gradient mark inside it.
   - Scrolling down, one order (Oat Milk, 12 L) leaves the core three times over: it drops out of the core,
     then sweeps into the café phone, the supplier dashboard and the brand dashboard in the ecosystem
     section below, landing as each device rises to meet it — the same order, seen by every side.
     It is fully scroll-scrubbed, so it flies back into the core on the way up.
   API used by hero-flow.js: G365.energy.fire(side), G365.energy.layout() */
(function () {
  const G = (window.G365 = window.G365 || {});
  const core = document.getElementById("core");
  if (!core) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  /* ---------- the core lights the row that just passed through it ---------- */
  const timers = {};
  function fire(side) {
    if (reduce) return;
    const k = side === "supply" || side === "brand" ? side : "cafe";
    core.classList.add("lit-" + k);
    clearTimeout(timers[k]);
    timers[k] = setTimeout(() => core.classList.remove("lit-" + k), 700);
  }

  /* ---------- deliveries ---------- */
  // `ax`/`ay` place the landing point on the device; `from`/`to` are each order's share of the scroll,
  // staggered café → supplier → brand, the order in which a real order moves. The café order leads and
  // lands lowest (mid-phone); the other two turn off above it, so no two paths ever cross.
  const SIDES = [
    { key: "cafe", color: "#E5483B", sel: ".eco-screen-mobile .eco-phone-chassis", ax: 0.5, ay: 0.42, from: 0.03, to: 0.84,
      tag: "Café app", title: "Oat Milk · 12 L", line: "Order placed", meta: "₹2,520" },
    { key: "supply", color: "#16A34A", sel: ".eco-screen-supplier .eco-device-scaler", ax: 0.5, ay: 0.3, from: 0.06, to: 0.88,
      tag: "Supplier portal", title: "PO #4821", line: "Received · dispatch 12:05", meta: "12 L" },
    { key: "brand", color: "#7C4DDB", sel: ".eco-screen-brand .eco-device-scaler", ax: 0.5, ay: 0.3, from: 0.09, to: 0.92,
      tag: "Brand portal", title: "Oat Milk", line: "Demand up in 42 cafés", meta: "+18%" },
  ];
  let eco = document.getElementById("ecosystem");
  const layer = document.createElement("div");
  layer.className = "g365-deliveries";
  layer.setAttribute("aria-hidden", "true");
  SIDES.forEach((s) => {
    const el = document.createElement("div");
    el.className = "g365-chip";
    el.style.setProperty("--c", s.color);
    el.innerHTML =
      `<span class="ph"><img alt=""></span>` +
      `<span class="tx"><b><i></i>${s.tag}</b><strong>${s.title}</strong><small>${s.line}</small></span><em>${s.meta}</em>`;
    layer.appendChild(el);
    s.el = el; s.img = el.querySelector("img"); s.prev = 0; s.shown = false;
  });
  document.body.appendChild(layer);

  // borrow the carton photo the hero has already rendered for its own cards
  let haveThumb = false;
  function thumb() {
    const im = document.querySelector('#rows img[data-k="carton"].ready');
    if (!im) return;
    SIDES.forEach((s) => { s.img.src = im.src; s.img.classList.add("ready"); });
    haveThumb = true;
  }

  const wideQ = matchMedia("(min-width: 861px)");
  function hide(s) { if (s.shown) { s.el.style.opacity = "0"; s.shown = false; } }
  function land(s) {
    const el = s.target;
    el.style.setProperty("--g365-e", s.color);
    el.classList.remove("g365-hit"); void el.offsetWidth; el.classList.add("g365-hit");
    setTimeout(() => el.classList.remove("g365-hit"), 900);
  }

  function frame() {
    if (!core.isConnected) { layer.remove(); return; }          // the hero unmounted (client-side navigation)
    requestAnimationFrame(frame);
    if (!eco || !eco.isConnected) eco = document.getElementById("ecosystem");
    if (reduce || !eco || !wideQ.matches) { SIDES.forEach(hide); return; }
    // progress runs from the top of the page to just before the ecosystem section pins
    const end = eco.getBoundingClientRect().top + scrollY - 40;
    const p = end > 0 ? scrollY / end : 0;
    if (p > 1.2) { SIDES.forEach((s) => { s.prev = 1; hide(s); }); return; }
    // a side portal centred and playing its video in front: keep the cards off it
    if (eco.querySelector(".has-side-focus")) { SIDES.forEach(hide); return; }
    if (!haveThumb) thumb();
    const c = core.getBoundingClientRect();
    const sx = c.left + c.width / 2, sy = c.bottom - 12;
    // the section heading sits in the orders' path: they pass behind it, fading out as they cross
    const hd = eco.querySelector(".eco-text-wrap");
    const hb = hd ? hd.getBoundingClientRect() : null;
    SIDES.forEach((s) => {
      const raw = (p - s.from) / (s.to - s.from);
      if (!s.target || !s.target.isConnected) s.target = document.querySelector(s.sel);
      if (s.target && s.prev < 0.97 && raw >= 0.97) land(s);
      s.prev = raw;
      if (raw <= 0 || raw >= 1 || !s.target) { hide(s); return; }
      const r = s.target.getBoundingClientRect();
      const ex = r.left + r.width * s.ax, ey = r.top + r.height * s.ay;
      // fall at an even pace (so each order stays in view while the hero scrolls away), and only bank
      // sideways over the last stretch, once it is below the section heading
      const py = 0.15 * raw + 0.85 * raw * raw * (3 - 2 * raw), px = smooth(0.04, 0.5, raw);
      const x = sx + (ex - sx) * px, y = sy + (ey - sy) * py;
      const grow = smooth(0, 0.16, raw), settle = smooth(0.84, 1, raw), lift = Math.sin(Math.PI * raw);
      const scale = (0.4 + 0.6 * grow) * (1 - 0.18 * settle);
      const rot = Math.sign(ex - sx) * 3 * Math.sin(Math.PI * px);
      s.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      let behind = 1;
      if (hb && hb.height > 0 && x > hb.left - 140 && x < hb.right + 140) {
        const out = Math.max(hb.top - y, y - hb.bottom);          // < 0 while inside the heading's band
        behind = smooth(-6, 34, out);
      }
      s.el.style.opacity = (grow * (1 - settle) * behind).toFixed(3);
      s.el.style.setProperty("--lift", lift.toFixed(3));
      s.shown = true;
    });
  }
  requestAnimationFrame(frame);

  G.energy = { fire, layout() {} };
})();
