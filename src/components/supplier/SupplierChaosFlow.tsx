'use client';
// "Before Gradient → one truck → the portal". What wholesale supply looks like for a supplier today:
// café orders in WhatsApp chats and voice notes, a paper order book, a stock sheet that never adds up,
// Tally, payment reminders, a challan nobody signed, crates nobody counted, a driver asking for the
// address, all joined by dotted hand-offs. Scrolling on: a Gradient box truck drives in and every piece
// is tossed into its cargo box; the screen on the box powers on; the truck drives off and the screen
// lifts away, growing into the full Supplier Portal (SupplierDashboard), which is live and clickable.
// The chaos and the truck sit on one fixed 1200 × 640 canvas, scaled to fit; the dashboard lives at
// stage level and is mapped onto the box's screen with one transform, so it travels as a single object.
// Styles: app/supplier/supplier-flow.css
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Caveat } from 'next/font/google';
import { SupplierDashboard } from './SupplierDashboard';

const hand = Caveat({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-hand', display: 'swap' });

const CW = 1200, CH = 640;
// The truck at rest (canvas units). SLOT is the screen opening on the cargo box, relative to the truck.
// The cargo box rises above the cab (as real box trucks do): it spans y = BOX_TOP…300 in truck units,
// so its side panel matches the portal's proportions. The screen fills that panel edge to edge.
const TRUCK = { left: 110, top: 120, w: 980, h: 380, boxW: 700 };
const BOX_TOP = -86, LIFT = 90; // the svg extends LIFT units above the truck box for the taller cargo box
const SLOT = { x: 18, y: -73, w: 674, h: 354 };

// Scroll timeline (0 → 1 across the pinned section)
const T = {
  headOut: 0.17,
  driveIn: [0.15, 0.36], // truck arrives
  flyLen: 0.11, // each card's toss
  screenOn: [0.37, 0.43], // the box screen powers on
  headIn: 0.39, headOut2: 0.59,
  leave: [0.58, 0.77], // truck drives off while the screen lifts and grows
  live: 0.77, // from here the dashboard is the page
};

const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const span = (p: number, [a, b]: number[]) => clamp01((p - a) / (b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export function SupplierChaosFlow() {
  const secRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const truckRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  const [live, setLive] = useState(false);

  // scale the canvas to the room left under the heading
  useLayoutEffect(() => {
    const fit = () => {
      const st = stageRef.current;
      if (!st) return;
      // stage padding (92 top, 24 bottom) + the gap under the heading (24)
      const w = st.clientWidth - 32, h = st.clientHeight - 140 - (headRef.current?.offsetHeight ?? 160);
      setS(Math.max(0.3, Math.min(1.12, w / CW, h / CH)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (stageRef.current) ro.observe(stageRef.current);
    if (headRef.current) ro.observe(headRef.current);
    return () => ro.disconnect();
  }, []);

  // scroll drives everything
  useEffect(() => {
    const sec = secRef.current, stage = stageRef.current, canvas = canvasRef.current, truck = truckRef.current;
    const slot = slotRef.current, dash = dashRef.current;
    if (!sec || !stage || !canvas || !truck || !slot || !dash) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = Array.from(canvas.querySelectorAll<HTMLElement>('[data-card]')).map((el) => ({
      el,
      cx: el.offsetLeft + el.offsetWidth / 2,
      cy: el.offsetTop + el.offsetHeight / 2,
      rot: parseFloat(el.dataset.rot || '0'),
      at: parseFloat(el.dataset.fly || '0.25'),
      jx: parseFloat(el.dataset.jx || '0'),
    }));
    const fades = Array.from(sec.querySelectorAll<HTMLElement>('[data-in],[data-out]'));
    const wheels = Array.from(truck.querySelectorAll<SVGGElement>('[data-wheel]'));

    // Where the dashboard sits on the truck (the slot, measured at rest) and where it ends (its own
    // layout box). Both are re-measured on resize; neither moves while the stage is pinned.
    let from = { x: 0, y: 0, w: 1, h: 1 }, to = { x: 0, y: 0, w: 1, h: 1 };
    const measure = () => {
      const sr = stage.getBoundingClientRect(), r = slot.getBoundingClientRect();
      from = { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height };
      to = { x: dash.offsetLeft, y: dash.offsetTop, w: dash.offsetWidth, h: dash.offsetHeight };
    };
    measure();
    const ro = new ResizeObserver(() => { measure(); last = -1; });
    ro.observe(stage); ro.observe(dash);

    let isLive = false;
    const apply = (p: number) => {
      const margin = (stage.clientWidth - CW * s) / 2 / s;
      const inK = reduce ? 1 : ease(span(p, T.driveIn)), outK = reduce ? 0 : ease(span(p, T.leave));
      const tx = (1 - inK) * -(TRUCK.left + TRUCK.w + margin + 40) + outK * (CW - TRUCK.left + margin + 60);
      truck.style.transform = `translate3d(${tx}px, 0, 0)`;
      truck.style.opacity = reduce ? String(clamp01((p - 0.3) / 0.08) * (1 - clamp01((p - T.leave[0]) / 0.08))) : '1';
      const turn = `rotate(${(tx / 38) * (180 / Math.PI)}deg)`;
      for (const w of wheels) w.style.transform = turn;

      // every piece of the chaos is tossed into the box
      const bx = TRUCK.left + TRUCK.boxW * 0.5 + tx, by = TRUCK.top + (BOX_TOP + 300) / 2;
      for (const c of cards) {
        const f = ease(clamp01((p - c.at) / T.flyLen));
        if (reduce) {
          c.el.style.transform = `rotate(${c.rot}deg)`;
          c.el.style.opacity = String(1 - clamp01((p - 0.2) / 0.08));
          continue;
        }
        const dx = (bx + c.jx - c.cx) * f, dy = (by - c.cy) * f - 110 * Math.sin(Math.PI * f);
        c.el.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${c.rot * (1 - f) + 14 * f}deg) scale(${1 - 0.88 * f})`;
        c.el.style.opacity = String(1 - clamp01((f - 0.62) / 0.38));
      }

      // the screen: on the box, then lifting off and growing into the full portal
      const on = span(p, T.screenOn), k = reduce ? (p >= T.leave[0] + 0.04 ? 1 : 0) : ease(span(p, T.leave));
      const a = lerp(from.w / to.w, 1, k);
      const x = lerp(from.x, to.x, k), y = lerp(from.y, to.y, k);
      const cut = Math.max(0, to.h - from.h / (from.w / to.w)) * (1 - k);
      dash.style.transform = `translate3d(${x - to.x}px, ${y - to.y}px, 0) scale(${a})`;
      // once it has landed, nothing is clipped, so the tour's callouts can sit off its edges
      dash.style.clipPath = k > 0.999 ? 'none' : `inset(0 0 ${cut}px 0 round ${lerp(4 / a, 14, k)}px)`;
      dash.style.opacity = String(reduce ? Math.max(on * (1 - clamp01((p - T.leave[0]) / 0.04)), k) : on);
      dash.style.setProperty('--lift', String(k));
      dash.style.pointerEvents = k > 0.97 ? 'auto' : 'none';
      dash.toggleAttribute('data-landed', k > 0.999);
      // live while the portal is in place: the guided tour plays; scrolling back rewinds it
      const nowLive = p >= T.live;
      if (nowLive !== isLive) { isLive = nowLive; setLive(nowLive); }

      for (const el of fades) {
        let o = 1;
        if (el.dataset.in) o = Math.min(o, clamp01((p - parseFloat(el.dataset.in)) / 0.05));
        if (el.dataset.out) o = Math.min(o, 1 - clamp01((p - parseFloat(el.dataset.out)) / 0.05));
        el.style.opacity = String(o);
        if (el.hasAttribute('data-rise')) el.style.transform = `translate3d(0, ${(1 - o) * 10}px, 0)`;
      }
    };

    let raf = 0, on = false, last = -1;
    const tick = () => {
      if (!on) return;
      const r = sec.getBoundingClientRect();
      const p = clamp01(-r.top / Math.max(1, r.height - window.innerHeight));
      if (Math.abs(p - last) > 0.0003) { apply(p); last = p; }
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (on) raf = requestAnimationFrame(tick);
    }, { rootMargin: '200px' });
    io.observe(sec);
    apply(0);
    return () => { io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); };
  }, [s]);

  return (
    <section className={`sfl ${hand.variable}`} ref={secRef} aria-labelledby="sfl-title">
      <div className="sfl-stage" ref={stageRef}>
        <div className="sfl-head" ref={headRef}>
          <div className="sfl-copy" data-out={String(T.headOut)} data-rise>
            <span className="sfl-eyebrow">Before Gradient</span>
            <h2 id="sfl-title">This is what running wholesale supply on WhatsApp looks like.</h2>
            <p>Orders in chats and voice notes, a paper order book, a stock sheet that never adds up, Tally, payment reminders, challans, crates and a driver who can&apos;t find the café.</p>
          </div>
          <div className="sfl-copy is-after" data-in={String(T.headIn)} data-out={String(T.headOut2)} data-rise aria-hidden="true">
            <span className="sfl-eyebrow">On Gradient</span>
            <h2>Now every order rides in one place.</h2>
            <p>Café orders, stock, the route, crates, e-invoices and payouts on one screen, from the first message to the signed delivery.</p>
          </div>
        </div>

        <div className="sfl-diagram" style={{ width: CW * s, height: CH * s }}>
          <div className="sfl-canvas" ref={canvasRef} style={{ transform: `scale(${s})` }}>
            {/* dotted hand-offs between the pieces */}
            <svg className="sfl-links" viewBox={`0 0 ${CW} ${CH}`} aria-hidden="true" data-out="0.15">
              <defs>
                <marker id="sfl-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M1 1.5L7 5L1 8.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
              </defs>
              {[
                'M314 118C336 118 330 96 346 96',
                'M462 238C462 262 484 266 488 290',
                'M404 340C388 344 384 344 376 350',
                'M578 118C598 118 600 96 616 96',
                'M852 104C866 104 868 112 880 112',
                'M1022 236C1022 282 1000 292 1000 330',
                'M872 432C842 432 832 392 816 386',
                'M726 436C726 452 730 456 732 470',
                'M598 512C570 516 548 530 524 540',
                'M374 482C396 492 402 528 418 542',
                'M734 176C742 230 800 268 818 280',
                'M640 270C650 288 690 286 700 300',
                'M172 302C172 314 174 318 174 330',
              ].map((d, i) => <path key={i} d={d} markerEnd="url(#sfl-arrow)" />)}
            </svg>

            {/* ── the pieces ── */}
            <div className="sfl-card sfl-wa" data-card data-rot="-1.5" data-fly="0.22" data-jx="-200" style={{ left: 30, top: 40, width: 284 }}>
              <div className="sfl-in">
                <div className="sfl-wa-top"><i>BT</i><div><b>Blue Tokai · Koramangala</b><small>online</small></div><em>23</em></div>
                <div className="sfl-wa-body">
                  <p className="in">Bhaiya kal subah 10kg Arabica AA bhej dena<time>9:42 PM</time></p>
                  <p className="in voice"><span className="play" /><span className="wave" /><time>0:42</time></p>
                  <p className="in">Aur 12 oat milk. Rate purana wala na?<time>9:44 PM</time></p>
                  <p className="out">ok sir, kal bhejta hoon<time>11:58 PM</time></p>
                </div>
              </div>
            </div>

            <div className="sfl-card sfl-book" data-card data-rot="-3" data-fly="0.235" data-jx="-120" style={{ left: 346, top: 22, width: 232 }}>
              <div className="sfl-in">
                <b>ORDER BOOK · OCT</b>
                <ol>
                  <li><s>17/10 Third Wave 4kg</s></li>
                  <li>17/10 Blue Tokai 10kg AA ✓</li>
                  <li>Maverick, oat milk ×12 ?</li>
                  <li>Third Wave 6kg (rate??)</li>
                  <li className="circ">call back!!</li>
                </ol>
                <span className="ring" />
              </div>
            </div>

            <div className="sfl-card sfl-sheet" data-card data-rot="0" data-fly="0.25" data-jx="-160" style={{ left: 40, top: 330, width: 334 }}>
              <div className="sfl-in">
                <div className="sfl-win"><i /><i /><i /><span>stock_FINAL_v3 (2).xlsx</span></div>
                <table>
                  <thead><tr><th>SKU</th><th>Opening</th><th>Out</th><th>Balance</th></tr></thead>
                  <tbody>
                    <tr><td>Arabica AA 25kg</td><td>140</td><td>152</td><td className="bad">−12</td></tr>
                    <tr><td>Oat milk 1L</td><td>96</td><td>84</td><td>12</td></tr>
                    <tr><td>House blend</td><td>60</td><td>?</td><td className="bad">#REF!</td></tr>
                    <tr><td>Cups 8oz</td><td>2,000</td><td>1,450</td><td>550</td></tr>
                    <tr><td>Syrup vanilla</td><td>36</td><td>40</td><td className="bad">−4</td></tr>
                  </tbody>
                </table>
                <div className="sfl-tabs"><span className="on">Oct</span><span>Oct (2)</span><span>old</span></div>
              </div>
            </div>

            <div className="sfl-card sfl-calls" data-card data-rot="1.5" data-fly="0.265" data-jx="-40" style={{ left: 404, top: 290, width: 200 }}>
              <div className="sfl-in">
                <p><i className="ph" /><span><b>Maverick &amp; Farmer</b><small>4 missed calls</small></span></p>
                <p><i className="ph" /><span><b>Unknown number</b><small>2 missed calls</small></span></p>
              </div>
            </div>

            <div className="sfl-card sfl-pay" data-card data-rot="2" data-fly="0.28" data-jx="40" style={{ left: 618, top: 36, width: 234 }}>
              <div className="sfl-in">
                <span className="tag">Payment reminder #3</span>
                <b>₹18,400 due</b>
                <small>Third Wave · Indiranagar · 47 days overdue</small>
                <span className="btn">Send reminder</span>
              </div>
            </div>

            <div className="sfl-card sfl-tally" data-card data-rot="0" data-fly="0.31" data-jx="160" style={{ left: 880, top: 40, width: 290 }}>
              <div className="sfl-in">
                <div className="sfl-win"><i /><i /><i /><span>Sales Voucher · GST</span></div>
                <dl>
                  <div><dt>Party</dt><dd>Blue Tokai Koramangala</dd></div>
                  <div><dt>Invoice no.</dt><dd className="blank" /></div>
                  <div><dt>Amount</dt><dd>₹8,200.00</dd></div>
                </dl>
                <p className="warn">e-Invoice IRN not generated · not synced for 3 days</p>
              </div>
            </div>

            <div className="sfl-card sfl-challan" data-card data-rot="2.5" data-fly="0.33" data-jx="170" style={{ left: 872, top: 330, width: 262 }}>
              <div className="sfl-in">
                <b>DELIVERY CHALLAN <span>No. 2207</span></b>
                <ul><li><span>Arabica AA 10kg</span><span>1</span></li><li><span>Oat milk 1L</span><span>12</span></li><li><span>Crates</span><span>3</span></li></ul>
                <div className="sign"><small>Received by</small><span /></div>
                <em className="stamp">Signature missing</em>
              </div>
            </div>

            <div className="sfl-card sfl-sticky" data-card data-rot="-4" data-fly="0.3" data-jx="60" style={{ left: 642, top: 300, width: 172 }}>
              <div className="sfl-in">
                <span className="tape" />
                <p>Crates out: 42<br />back: 31 ??<br />Ramesh to check</p>
              </div>
            </div>

            <div className="sfl-card sfl-chat" data-card data-rot="0" data-fly="0.32" data-jx="20" style={{ left: 600, top: 470, width: 262 }}>
              <div className="sfl-in">
                <i>R</i>
                <span><small>Ramesh · Driver</small><b>Sir café band hai. Address galat hai kya?</b></span>
              </div>
            </div>

            <div className="sfl-card sfl-file" data-card data-rot="0" data-fly="0.27" data-jx="-60" style={{ left: 420, top: 498, width: 112 }}>
              <div className="sfl-in"><span className="doc"><b>PDF</b></span><small>rate_list_OLD_v2.pdf</small></div>
            </div>

            <div className="sfl-card sfl-mail" data-card data-rot="0" data-fly="0.29" data-jx="100" style={{ left: 820, top: 250, width: 64 }}>
              <div className="sfl-in"><span className="env" /><em>1,284</em></div>
            </div>

            <div className="sfl-card sfl-folder" data-card data-rot="0" data-fly="0.26" data-jx="0" style={{ left: 596, top: 196, width: 96 }}>
              <div className="sfl-in"><span className="fd" /><small>[PENDING] POs</small></div>
            </div>

            {/* ── the truck ── */}
            <div className="sfl-road" style={{ top: TRUCK.top + 360 }} data-in="0.17" data-out="0.62" aria-hidden="true" />
            {/* where the screen sits when the truck is parked (measured, never drawn) */}
            <div className="sfl-slot" ref={slotRef} style={{ left: TRUCK.left + SLOT.x, top: TRUCK.top + SLOT.y, width: SLOT.w, height: SLOT.h }} aria-hidden="true" />
            <div className="sfl-truck" ref={truckRef} style={{ left: TRUCK.left, top: TRUCK.top, width: TRUCK.w, height: TRUCK.h }} aria-hidden="true">
              <div className="sfl-shadow" />
              <svg viewBox={`0 ${-LIFT} ${TRUCK.w} ${TRUCK.h + LIFT}`} width={TRUCK.w} height={TRUCK.h + LIFT} style={{ marginTop: -LIFT }}>
                <defs>
                  <linearGradient id="sfl-alu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FCFDFC" /><stop offset="0.55" stopColor="#F0F3F1" /><stop offset="1" stopColor="#E2E8E4" />
                  </linearGradient>
                  <linearGradient id="sfl-paint" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#24563C" /><stop offset="0.5" stopColor="#1A4430" /><stop offset="1" stopColor="#123323" />
                  </linearGradient>
                  <linearGradient id="sfl-glass" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#3C5248" /><stop offset="1" stopColor="#16221C" />
                  </linearGradient>
                  <linearGradient id="sfl-steel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#D6DDD8" /><stop offset="1" stopColor="#8D9A92" />
                  </linearGradient>
                  <radialGradient id="sfl-rim" cx="0.4" cy="0.35" r="0.75">
                    <stop offset="0" stopColor="#D2D9D4" /><stop offset="1" stopColor="#77847C" />
                  </radialGradient>
                </defs>

                {/* cargo box: ribbed aluminium, rear door with hinges, marker lights, the mounted screen */}
                <rect x="0" y={BOX_TOP} width={TRUCK.boxW} height={300 - BOX_TOP} rx="6" fill="url(#sfl-alu)" stroke="#C9D3CC" />
                {Array.from({ length: 13 }, (_, i) => 25 + i * 54).map((x) => <path key={x} d={`M${x} ${BOX_TOP + 12}V282`} stroke="rgba(30,50,40,0.06)" strokeWidth="2" />)}
                <rect x="0" y={BOX_TOP} width={TRUCK.boxW} height="11" rx="5" fill="#DDE4DF" />
                <rect x="0" y="282" width={TRUCK.boxW} height="18" fill="#D2DAD4" />
                <text x="26" y="295" className="sfl-livery">GRADIENT SUPPLIER FLEET · VAN 04</text>
                <rect x="0" y={BOX_TOP} width="16" height={300 - BOX_TOP} fill="#E6ECE8" stroke="#C9D3CC" />
                {[-40, 100, 240].map((y) => <rect key={y} x="3" y={y} width="9" height="16" rx="2" fill="#B5C0B8" />)}
                <path d={`M10 ${BOX_TOP + 24}V270`} stroke="#AEB9B1" strokeWidth="2" />
                <rect x="40" y="287" width="11" height="6" rx="1.5" fill="#E9A23B" />
                <rect x="648" y="287" width="11" height="6" rx="1.5" fill="#E9A23B" />
                <rect x={SLOT.x - 1} y={SLOT.y - 1} width={SLOT.w + 2} height={SLOT.h + 2} rx="5" fill="#E9EEEA" stroke="#CBD5CE" />

                {/* chassis, fuel tank, mudflap */}
                <rect x="6" y="300" width="962" height="14" rx="4" fill="#1D2320" />
                <rect x="598" y="306" width="90" height="26" rx="11" fill="url(#sfl-steel)" />
                <path d="M612 312H674" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="306" y="300" width="9" height="42" rx="2" fill="#171C19" />

                {/* cab: deep forest green, raked windscreen, door, mirror, lights, bumper, step */}
                <path d="M708 300V96Q708 80 724 80H834Q850 80 860 93L914 168Q920 177 931 179L956 185Q972 189 972 205V286Q972 300 958 300Z" fill="url(#sfl-paint)" />
                <path d="M836 300A44 44 0 0 1 924 300Z" fill="#0C110E" />
                <path d="M726 96H828Q840 96 848 107L893 168H726Z" fill="url(#sfl-glass)" />
                <path d="M742 104L776 104L740 150Z" fill="rgba(255,255,255,0.12)" />
                <path d="M790 96V168" stroke="#163A28" strokeWidth="6" />
                <path d="M716 177H902" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
                <path d="M850 180V290" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
                <rect x="818" y="196" width="20" height="4.5" rx="2.2" fill="#0B2015" />
                <path d="M902 122L928 108" stroke="#0E2318" strokeWidth="3.5" strokeLinecap="round" />
                <rect x="924" y="88" width="12" height="36" rx="4" fill="#102A1D" />
                <text x="734" y="240" className="sfl-cab-word">Gradient</text>
                <rect x="956" y="201" width="16" height="20" rx="3" fill="#F3F0E2" />
                <rect x="960" y="225" width="10" height="6" rx="1.5" fill="#E9A23B" />
                <rect x="936" y="270" width="44" height="18" rx="4" fill="#1B211E" />
                <rect x="778" y="292" width="46" height="7" rx="2" fill="#2A312D" />

                {/* wheels: dual rear axle and the front axle; they roll with the truck */}
                {[150, 252, 880].map((cx) => (
                  <g key={cx} transform={`translate(${cx} 322)`}>
                    <g data-wheel className="sfl-wheel">
                      <circle r="38" fill="#121614" />
                      <circle r="35.5" fill="none" stroke="#202723" strokeWidth="3" strokeDasharray="3 4" />
                      <circle r="29" fill="none" stroke="#28302B" strokeWidth="1" />
                      <circle r="22" fill="url(#sfl-rim)" />
                      <circle r="15" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
                      {[0, 60, 120, 180, 240, 300].map((deg) => (
                        <circle key={deg} r="1.9" cx={Math.cos((deg * Math.PI) / 180) * 10} cy={Math.sin((deg * Math.PI) / 180) * 10} fill="#39433D" />
                      ))}
                      <circle r="5.5" fill="#46514A" />
                    </g>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* the portal: on the truck's screen first, then lifted off and grown to full size */}
        <div className="sfl-dash" ref={dashRef}>
          <SupplierDashboard live={live} />
        </div>
      </div>
    </section>
  );
}
