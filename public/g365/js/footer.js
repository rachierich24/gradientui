/* Gradient 365 — footer wordmark. It draws itself as a type specimen first (guides, outlines, anchor
   points), then a diagonal wipe fills it with the energy gradient and the construction fades away. */
(function () {
  const host = document.getElementById("ftMark");
  if (!host) return;
  const NS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Instrument Sans SemiBold, "gradient", in font units (1000 upm, baseline at y = 0)
  const GLYPHS = [{"d":"M291 215Q190 215 126 171Q61 127 49 52L169 52Q178 78 208 92Q239 107 288 107Q359 107 393 76Q427 44 427 -20L427 -130L436 -128Q424 -72 375 -38Q326 -5 255 -5Q187 -5 137 -37Q86 -69 58 -126Q30 -184 30 -261Q30 -339 59 -397Q88 -455 140 -488Q193 -520 263 -520Q335 -520 382 -485Q428 -451 439 -390L431 -389L431 -510L554 -510L554 -21Q554 88 484 152Q413 215 291 215ZM296 -105Q357 -105 393 -147Q430 -188 430 -263Q430 -338 393 -379Q356 -420 295 -420Q235 -420 198 -378Q161 -337 161 -262Q161 -187 198 -146Q235 -105 296 -105Z","p":[291,215,49,52,169,52,288,107,427,-20,427,-130,436,-128,255,-5,30,-261,263,-520,439,-390,431,-389,431,-510,554,-510,554,-21,291,215,296,-105,430,-263,295,-420,161,-262,296,-105]},{"d":"M653 0L653 -510L776 -510L776 -387L779 -387L779 0ZM779 -266L766 -387Q784 -452 827 -486Q870 -520 930 -520Q951 -520 960 -516L960 -397Q955 -399 946 -400Q937 -400 924 -400Q851 -400 815 -368Q779 -336 779 -266Z","p":[653,0,653,-510,776,-510,776,-387,779,-387,779,0,779,-266,766,-387,930,-520,960,-516,960,-397,924,-400,779,-266]},{"d":"M1326 0Q1321 -20 1318 -44Q1316 -68 1316 -102L1312 -102L1312 -344Q1312 -384 1290 -404Q1267 -425 1221 -425Q1176 -425 1150 -409Q1123 -392 1117 -361L996 -361Q1004 -432 1064 -476Q1124 -520 1225 -520Q1330 -520 1384 -472Q1438 -425 1438 -333L1438 -102Q1438 -78 1441 -53Q1445 -28 1452 0ZM1149 10Q1072 10 1026 -28Q981 -67 981 -132Q981 -202 1032 -243Q1083 -284 1176 -298L1335 -322L1335 -242L1197 -221Q1152 -214 1129 -196Q1107 -178 1107 -146Q1107 -117 1128 -101Q1149 -86 1186 -86Q1240 -86 1276 -113Q1312 -140 1312 -179L1326 -102Q1306 -47 1260 -19Q1215 10 1149 10Z","p":[1326,0,1316,-102,1312,-102,1312,-344,1221,-425,1117,-361,996,-361,1225,-520,1438,-333,1438,-102,1452,0,1149,10,981,-132,1176,-298,1335,-322,1335,-242,1197,-221,1107,-146,1186,-86,1312,-179,1326,-102,1149,10]},{"d":"M1895 0L1895 -115L1905 -113Q1892 -57 1842 -23Q1792 10 1723 10Q1653 10 1602 -23Q1550 -55 1522 -114Q1494 -173 1494 -253Q1494 -334 1523 -394Q1552 -454 1604 -487Q1657 -520 1727 -520Q1799 -520 1846 -485Q1893 -451 1904 -390L1891 -389L1891 -720L2018 -720L2018 0ZM1760 -93Q1821 -93 1858 -136Q1894 -178 1894 -255Q1894 -332 1857 -374Q1820 -416 1759 -416Q1699 -416 1662 -374Q1625 -331 1625 -254Q1625 -177 1662 -135Q1699 -93 1760 -93Z","p":[1895,0,1895,-115,1905,-113,1723,10,1494,-253,1727,-520,1904,-390,1891,-389,1891,-720,2018,-720,2018,0,1760,-93,1894,-255,1759,-416,1625,-254,1760,-93]},{"d":"M2117 0L2117 -510L2243 -510L2243 0ZM2111 -594L2111 -733L2249 -733L2249 -594Z","p":[2117,0,2117,-510,2243,-510,2243,0,2111,-594,2111,-733,2249,-733,2249,-594]},{"d":"M2571 10Q2490 10 2430 -24Q2369 -58 2335 -118Q2302 -178 2302 -256Q2302 -334 2335 -394Q2369 -453 2429 -487Q2489 -520 2569 -520Q2645 -520 2701 -488Q2757 -457 2788 -400Q2819 -343 2819 -267Q2819 -253 2818 -241Q2817 -229 2815 -217L2380 -217L2380 -305L2718 -305L2692 -281Q2692 -353 2659 -389Q2626 -425 2567 -425Q2503 -425 2466 -381Q2428 -337 2428 -254Q2428 -172 2466 -128Q2503 -85 2572 -85Q2612 -85 2642 -100Q2672 -115 2686 -146L2805 -146Q2780 -74 2720 -32Q2661 10 2571 10Z","p":[2571,10,2302,-256,2569,-520,2819,-267,2815,-217,2380,-217,2380,-305,2718,-305,2692,-281,2567,-425,2428,-254,2572,-85,2686,-146,2805,-146,2571,10]},{"d":"M2878 0L2878 -510L3001 -510L3001 -390L3004 -390L3004 0ZM3236 0L3236 -322Q3236 -369 3212 -393Q3188 -417 3142 -417Q3102 -417 3070 -399Q3039 -381 3022 -349Q3004 -317 3004 -275L2991 -397Q3017 -453 3067 -487Q3117 -520 3187 -520Q3270 -520 3316 -473Q3363 -426 3363 -348L3363 0Z","p":[2878,0,2878,-510,3001,-510,3001,-390,3004,-390,3004,0,3236,0,3236,-322,3142,-417,3004,-275,2991,-397,3187,-520,3363,-348,3363,0]},{"d":"M3684 10Q3590 10 3546 -34Q3501 -79 3501 -168L3501 -626L3628 -673L3628 -165Q3628 -128 3648 -110Q3668 -92 3711 -92Q3728 -92 3742 -94Q3755 -97 3767 -101L3767 -3Q3755 3 3733 7Q3711 10 3684 10ZM3403 -411L3403 -510L3767 -510L3767 -411Z","p":[3684,10,3501,-168,3501,-626,3628,-673,3628,-165,3711,-92,3767,-101,3767,-3,3684,10,3403,-411,3403,-510,3767,-510,3767,-411]}];
  const TEXT_W = 3794;

  // the ring from the nav logo, rebuilt as a solid shape so it can be outlined like the letters
  const R = 320, r = 186, cx = TEXT_W + 110 + R, cy = -R, cap = (R - r) / 2;
  const ring = `M${cx + R} ${cy}A${R} ${R} 0 1 1 ${cx} ${cy - R}A${cap} ${cap} 0 0 1 ${cx} ${cy - r}` +
    `A${r} ${r} 0 1 0 ${cx + r} ${cy}A${cap} ${cap} 0 0 1 ${cx + R} ${cy}Z`;
  const DOT = 72;
  const W = cx + R, X0 = -40, Y0 = -790, VW = W + 80, VH = 1060;

  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  const svg = el("svg", { viewBox: `${X0} ${Y0} ${VW} ${VH}`, "aria-hidden": "true", focusable: "false" });
  const defs = el("defs", {}, svg);
  // the headline's energy — --energy at 100deg on a 300%-wide box, sliding 0% → 100% over 7s and back (a touch quicker than the h1's 11s)
  const BW = VW * 3, A = (10 * Math.PI) / 180, GL = BW * Math.cos(A) + VH * Math.sin(A);
  const gcx = X0 + BW / 2, gcy = Y0 + VH / 2, gdx = (GL / 2) * Math.cos(A), gdy = (GL / 2) * Math.sin(A);
  const grad = el("linearGradient", { id: "ftEnergy", gradientUnits: "userSpaceOnUse",
    x1: gcx - gdx, y1: gcy - gdy, x2: gcx + gdx, y2: gcy + gdy }, defs);
  // deep navy with a single band of light passing left to right, then a rest — the same light as the headline
  [["0", "#142B63"], [".41", "#142B63"], [".455", "#7F00FF"], [".5", "#FF0000"], [".545", "#22C55E"], [".59", "#142B63"], ["1", "#142B63"]]
    .forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, grad));
  if (!reduce) el("animateTransform", { attributeName: "gradientTransform", type: "translate", values: `${-2 * VW} 0;0 0;0 0`, dur: "8s",
    repeatCount: "indefinite", calcMode: "spline", keyTimes: "0;.62;1", keySplines: ".45 .05 .55 .95;0 0 1 1" }, grad);
  const wipe = el("polygon", {}, el("clipPath", { id: "ftWipe" }, defs));

  const guides = el("g", { class: "ft-guides" }, svg);
  const lines = el("g", { class: "ft-lines" }, svg);
  const fill = el("g", { class: "ft-fill", "clip-path": "url(#ftWipe)", fill: "url(#ftEnergy)" }, svg);
  const dots = el("g", { class: "ft-dots" }, svg);

  // typographic guides: descender, baseline, x-height, ascender
  [215, 0, -520, -720].forEach((y, i) => el("line", { x1: X0, y1: y, x2: X0 + VW, y2: y, pathLength: 1, style: `--i:${i * 110}` }, guides));
  el("line", { x1: cx - R - 90, y1: cy, x2: cx + R + 90, y2: cy, pathLength: 1, style: "--i:620" }, guides);
  el("line", { x1: cx, y1: cy - R - 90, x2: cx, y2: cy + R + 90, pathLength: 1, style: "--i:680" }, guides);
  el("circle", { cx, cy, r: R, pathLength: 1, style: "--i:740" }, guides);

  const radii = [];
  const shapes = GLYPHS.map((g) => ({ d: g.d, pts: g.p }));
  shapes.push({ d: ring, pts: [cx + R, cy, cx, cy - R, cx, cy - r, cx + r, cy, cx, cy], dot: true });
  shapes.forEach((s, gi) => {
    const t = 200 + gi * 110;
    // each contour draws on its own, so counters trace alongside their outer shape
    s.d.split(/(?=M)/).forEach((sub) => el("path", { d: sub, pathLength: 1, style: `--i:${t}` }, lines));
    el("path", { d: s.d }, fill);
    if (s.dot) {
      el("circle", { cx, cy, r: DOT, pathLength: 1, style: `--i:${t + 200}` }, lines);
      el("circle", { cx, cy, r: DOT }, fill);
    }
    for (let k = 0; k < s.pts.length; k += 2) radii.push(el("circle", { cx: s.pts[k], cy: s.pts[k + 1], style: `--i:${t + 160 + k * 9}` }, dots));
  });
  host.appendChild(svg);

  // hairlines and dots stay the same on-screen size at any width
  function size() {
    const w = Math.max(1, svg.clientWidth || host.clientWidth), u = VW / w, dot = Math.min(2.4, Math.max(1.1, w / 520));
    svg.style.setProperty("--sw", ((w < 600 ? 0.8 : 1.1) * u).toFixed(2));
    radii.forEach((c) => c.setAttribute("r", (dot * u).toFixed(2)));
  }
  size();
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(size, 120); });

  // the fill edge leans like Stable's: filled below-left of a line sloping down to the right
  const S = 0.68, EX0 = Y0 + VH, EX1 = W + 40 + (-Y0) / S;
  function setWipe(ex) {
    wipe.setAttribute("points", `-20000,-2000 ${ex - 2000 / S},-2000 ${ex + 2000 / S},2000 -20000,2000`);
  }
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  if (reduce) { setWipe(EX1); host.classList.add("play", "done"); return; }
  setWipe(-EX0 / S - 200);

  function play() {
    host.classList.add("play");
    const start = performance.now() + 1300, dur = 2000, from = -EX0 / S - 200;
    (function step(now) {
      const x = Math.min(1, Math.max(0, (now - start) / dur));
      setWipe(from + (EX1 - from) * ease(x));
      if (x < 1) requestAnimationFrame(step);
      else setTimeout(() => host.classList.add("done"), 250);
    })(performance.now());
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); play(); } }, { threshold: 0.4 });
    io.observe(host);
  } else play();
})();
