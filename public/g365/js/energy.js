/* Gradient 365 — the energy: a single black stream.
   A thin black line leaves the gap between the two buttons, runs down behind the card rows and the
   core, then flares into a smooth bell that comes to rest just above the three devices in the ecosystem
   section; from its edge three thin lines drop onto the supplier dashboard, the phone and the brand dashboard.
   - Soft bands of light flow down through it continuously, so it always reads as moving.
   - Cards crossing the core send a bright glint down the line; inside the flare it drifts toward that
     card's device and runs down that device's line; when it arrives the device ripples. With no cards crossing, one still runs every few seconds.
   - On first load the stream draws itself down from the gap; hovering "Start free" speeds the flow and brightens it.
   - It fades once the ecosystem section pins. */
(function () {
  const G = (window.G365 = window.G365 || {});
  const stage = document.getElementById("stage"), canvas = document.getElementById("energy");
  if (!stage || !canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HIT = "#0A0A0A";

  // where each side lands: how far across the device's top edge, and its x when there's nothing to land on
  const SIDES = [
    { key: "supply", sel: ".eco-screen-supplier .eco-device-scaler", at: 0.84, slot: 0.3 },
    { key: "cafe", sel: ".eco-screen-mobile .eco-phone-chassis", at: 0.5, slot: 0.5 },
    { key: "brand", sel: ".eco-screen-brand .eco-device-scaler", at: 0.16, slot: 0.7 },
  ];
  SIDES.forEach((s) => { s.target = document.querySelector(s.sel); });
  const eco = document.getElementById("ecosystem");
  const pulses = [];

  let W = 0, H = 0, cy = 220, dpr = 1, cx = 0, top = 0, landing = false, fade = 1;
  let yO = 0, y0 = 0, yEnd = 0, spread = 200;
  const STEM = 2.2;                                     // half-width of the line
  const actions = document.querySelector(".hero .actions");
  const primary = document.querySelector(".hero .btn.primary");
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function layout(nextCy) {
    if (nextCy) cy = nextCy;
    const r = stage.getBoundingClientRect();
    const ar = actions ? actions.getBoundingClientRect() : null;
    top = Math.min(0, Math.round((ar ? ar.top : r.top) - 40 - r.top));
    W = r.width; H = r.height - top; dpr = Math.min(window.devicePixelRatio || 1, 2);
    const stacked = matchMedia("(max-width: 860px)").matches;
    const rects = SIDES.map((s) => (s.target ? s.target.getBoundingClientRect() : null));
    landing = false;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px"; canvas.style.top = top + "px";
    cx = W / 2;
    const toY = (pageY) => pageY - r.top - top;
    yO = ar ? toY(ar.top + ar.height / 2) : cy - 150 - top;   // the gap between the buttons
    y0 = cy + 110 - top;                                      // the flare opens below the card rows
    track();
    draw(lastT);
  }

  // the stream softly dissolves at the base of the hero stage without intruding on the ecosystem section
  function track() {
    yEnd = y0 + 75;
    spread = 0;
    const pinned = eco ? Math.max(0, -eco.getBoundingClientRect().top) : 0;
    fade = 1 - smooth(0, 140, pinned);
  }

  // half-width of the stream: a clean, elegant vertical laser beam
  function hwAt(y) {
    const lead = smooth(yO, yO + 36, y);                     // the line eases out of the gap
    return STEM * (0.3 + 0.7 * lead);
  }

  /* ---------- state that shapes the drawing ---------- */
  let T = 0, lastT = 0, boost = 0, boostTarget = 0, bootR = 1;
  const bootAt = window.G365BOOT;                           // set by the page when the first-load sequence runs

  function draw(Tn) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, W, H);
    if (fade <= 0 || yEnd <= yO) return;
    ctx.globalAlpha = fade;
    const yDraw = yO + (yEnd - yO) * bootR;                  // on first load the stream pours down from the gap
    if (yDraw <= yO + 2) return;

    // the shape: down the left edge, back up the right
    const STEP = 3, left = [], right = [];
    for (let y = yO; y <= yDraw; y += STEP) { const w = hwAt(y); left.push([cx - w, y]); right.push([cx + w, y]); }
    const w1 = hwAt(yDraw); left.push([cx - w1, yDraw]); right.push([cx + w1, yDraw]);
    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (const p of left) ctx.lineTo(p[0], p[1]);
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath();

    // body: elegant dark stream that softly dissolves before the next section
    const span = Math.max(1, yEnd - yO);
    const body = ctx.createLinearGradient(0, yO, 0, yEnd);
    body.addColorStop(0, "rgba(10,10,10,0.0)");
    body.addColorStop(Math.min(0.99, 40 / span), "rgba(10,10,10,0.95)");
    body.addColorStop(Math.max(0.05, (y0 - yO) / span), "rgba(14,14,14,0.95)");
    body.addColorStop(0.75, "rgba(20,20,20,0.4)");
    body.addColorStop(1, "rgba(24,24,24,0.0)");
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 10;
    ctx.fillStyle = body; ctx.fill();
    ctx.restore();

    // everything below paints only inside the stream
    ctx.globalCompositeOperation = "source-atop";
    // a soft lit centre, like a rounded surface catching light
    const sheenW = 12;
    const gloss = ctx.createLinearGradient(cx - sheenW, 0, cx + sheenW, 0);
    gloss.addColorStop(0, "rgba(255,255,255,0)");
    gloss.addColorStop(0.5, `rgba(255,255,255,${(0.14 + 0.08 * boost).toFixed(3)})`);
    gloss.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gloss; ctx.fillRect(cx - sheenW, yO, sheenW * 2, yEnd - yO);

    // bands of light flowing down
    const BANDS = 3, period = span + 80;
    for (let i = 0; i < BANDS; i++) {
      const yb = yO - 40 + ((Tn * 150 + (i * period) / BANDS) % period);
      const g = ctx.createLinearGradient(0, yb - 30, 0, yb + 30);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.5, `rgba(255,255,255,${(0.16 + 0.1 * boost).toFixed(3)})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.fillRect(cx - 10, yb - 30, 20, 60);
    }

    ctx.globalCompositeOperation = "source-over";

    // lines to devices only if landing is active
    const legs = smooth(0.92, 1, bootR);
    if (landing && legs > 0) {
      ctx.globalAlpha = fade * legs;
      ctx.lineCap = "round";
      for (const s of SIDES) {
        const top = yEnd - 1, bottom = top + (s.ey - top) * legs;
        ctx.strokeStyle = "#0A0A0A"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(s.ex, top); ctx.lineTo(s.ex, bottom); ctx.stroke();
        if (legs < 1) continue;
        ctx.fillStyle = "rgba(0,0,0,0.08)"; ctx.beginPath(); ctx.arc(s.ex, s.ey, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#0A0A0A"; ctx.beginPath(); ctx.arc(s.ex, s.ey, 3.6, 0, Math.PI * 2); ctx.fill();
      }
      // pulses running down the lines
      for (const p of pulses) {
        const s = SIDES.find((q) => q.key === p.side), y = yO + (s.ey - yO) * p.t;
        if (y <= yEnd || y > s.ey) continue;
        const g = ctx.createRadialGradient(s.ex, y, 0, s.ex, y, 10);
        g.addColorStop(0, "rgba(255,255,255,0.95)"); g.addColorStop(0.35, "rgba(255,255,255,0.5)"); g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g; ctx.fillRect(s.ex - 10, y - 10, 20, 20);
      }
      ctx.globalAlpha = fade;
    }
  }

  let lastFire = 0, nextSide = 0;
  function fire(side) {
    if (reduce) return;
    const key = SIDES.some((s) => s.key === side) ? side : SIDES[(Math.random() * 3) | 0].key;
    if (pulses.length < 5) pulses.push({ t: -0.02, side: key });
    lastFire = performance.now();
  }

  /* ---------- input ---------- */
  if (primary) {
    primary.addEventListener("pointerenter", () => { boostTarget = 1; });
    primary.addEventListener("pointerleave", () => { boostTarget = 0; });
    primary.addEventListener("focus", () => { boostTarget = 1; });
    primary.addEventListener("blur", () => { boostTarget = 0; });
  }
  if (reduce) addEventListener("scroll", () => { track(); draw(T); }, { passive: true });

  let visible = true, last = performance.now();
  if ("IntersectionObserver" in window) new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(canvas);
  function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible || reduce) return;
    boost += (boostTarget - boost) * Math.min(1, dt * 3);
    const since = bootAt ? (now - bootAt) / 1000 : 99;
    bootR = smooth(0.15, 1.8, since);
    const pace = 1 + 1.2 * boost;
    T += dt * pace; lastT = T;
    if (since > 2 && now - lastFire > 2600) fire(SIDES[(nextSide++) % 3].key);
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += dt * 0.42 * pace;
      if (!p.landed && p.t >= 0.97) {
        p.landed = true;
        const el = SIDES.find((s) => s.key === p.side).target;
        if (el && landing && fade > 0.5) {
          el.style.setProperty("--g365-e", HIT);
          el.classList.remove("g365-hit"); void el.offsetWidth; el.classList.add("g365-hit");
          setTimeout(() => el.classList.remove("g365-hit"), 900);
        }
      }
      if (p.t > 1.05) pulses.splice(i, 1);
    }
    track();
    draw(T);
  }

  G.energy = { fire, layout };
  const readCy = () => parseFloat(getComputedStyle(stage).getPropertyValue("--cy")) || cy;
  layout(readCy());
  addEventListener("resize", () => { clearTimeout(window.__et); window.__et = setTimeout(() => layout(readCy()), 180); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layout(readCy()));
  // the hero's layout settles during the first-load sequence; re-measure once it has
  if (bootAt) setTimeout(() => layout(readCy()), Math.max(0, bootAt + 3200 - performance.now()));
  requestAnimationFrame(tick);
})();
