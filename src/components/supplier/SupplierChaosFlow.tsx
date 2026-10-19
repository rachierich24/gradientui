'use client';
// "Before Gradient → one truck". What wholesale supply looks like for a supplier today: café orders in
// WhatsApp chats and voice notes, a paper order book, a stock sheet that never adds up, Tally, payment
// reminders, a challan nobody signed, crates nobody counted, a driver asking for the address, all joined
// by dotted hand-offs. As you scroll, a Gradient truck drives in and every one of those pieces is tossed
// into its cargo box, whose side then lights up with the same run on Gradient: the order book, the route
// with ePOD sign-offs, reserved stock, tracked crates, e-invoices synced to Tally and the T+1 payout.
// Everything sits on one fixed 1200 × 640 canvas, scaled to fit, so arrows and cards always meet.
// Styles: app/supplier/supplier-flow.css
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Caveat } from 'next/font/google';

const hand = Caveat({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-hand', display: 'swap' });

const CW = 1200, CH = 640;
// the truck at rest: the cargo box is where every card is tossed
const TRUCK = { left: 120, top: 128, boxW: 700, boxH: 300, w: 960, h: 360 };

const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function SupplierChaosFlow() {
  const secRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const truckRef = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);

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

  // scroll drives everything: the truck's drive, the toss into the box, the screen powering on
  useEffect(() => {
    const sec = secRef.current, canvas = canvasRef.current, truck = truckRef.current;
    if (!sec || !canvas || !truck) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = Array.from(canvas.querySelectorAll<HTMLElement>('[data-card]')).map((el) => ({
      el,
      cx: el.offsetLeft + el.offsetWidth / 2,
      cy: el.offsetTop + el.offsetHeight / 2,
      rot: parseFloat(el.dataset.rot || '0'),
      at: parseFloat(el.dataset.fly || '0.36'),
      jx: parseFloat(el.dataset.jx || '0'),
    }));
    const fades = Array.from(sec.querySelectorAll<HTMLElement>('[data-in],[data-out]'));
    const wheels = Array.from(truck.querySelectorAll<SVGGElement>('[data-wheel]'));

    const apply = (p: number) => {
      const drive = reduce ? 1 : ease(clamp01((p - 0.24) / 0.26));
      // start fully off the left edge of the screen, wherever the canvas sits
      const margin = ((stageRef.current?.clientWidth ?? CW * s) - CW * s) / 2 / s;
      const tx = (1 - drive) * -(TRUCK.left + TRUCK.w + margin + 40);
      // once parked, it grows a little so the screen on the box reads clearly
      const grow = 1 + 0.14 * ease(clamp01((p - 0.5) / 0.12));
      truck.style.transform = `translate3d(${tx}px, 0, 0) scale(${grow})`;
      truck.style.opacity = reduce ? String(clamp01((p - 0.36) / 0.1)) : '1';
      const turn = `rotate(${(tx / 36) * (180 / Math.PI)}deg)`;
      for (const w of wheels) w.style.transform = turn;

      const bx = TRUCK.left + TRUCK.boxW * 0.5 + tx, by = TRUCK.top + TRUCK.boxH * 0.5;
      for (const c of cards) {
        const f = ease(clamp01((p - c.at) / 0.13));
        if (reduce) {
          c.el.style.transform = `rotate(${c.rot}deg)`;
          c.el.style.opacity = String(1 - clamp01((p - 0.3) / 0.08));
          continue;
        }
        const dx = (bx + c.jx - c.cx) * f, dy = (by - c.cy) * f - 110 * Math.sin(Math.PI * f);
        c.el.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${c.rot * (1 - f) + 14 * f}deg) scale(${1 - 0.88 * f})`;
        c.el.style.opacity = String(1 - clamp01((f - 0.62) / 0.38));
      }
      for (const el of fades) {
        let a = 1;
        if (el.dataset.in) a = Math.min(a, clamp01((p - parseFloat(el.dataset.in)) / 0.06));
        if (el.dataset.out) a = Math.min(a, 1 - clamp01((p - parseFloat(el.dataset.out)) / 0.06));
        el.style.opacity = String(a);
        if (el.hasAttribute('data-rise')) el.style.transform = `translate3d(0, ${(1 - a) * 10}px, 0)`;
      }
    };

    let raf = 0, on = false, last = -1;
    const tick = () => {
      if (!on) return;
      const r = sec.getBoundingClientRect();
      const p = clamp01(-r.top / Math.max(1, r.height - window.innerHeight));
      if (Math.abs(p - last) > 0.0004) { apply(p); last = p; }
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (on) raf = requestAnimationFrame(tick);
    }, { rootMargin: '200px' });
    io.observe(sec);
    apply(0);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [s]);

  return (
    <section className={`sfl ${hand.variable}`} ref={secRef} aria-labelledby="sfl-title">
      <div className="sfl-stage" ref={stageRef}>
        <div className="sfl-head" ref={headRef}>
          <div className="sfl-copy" data-out="0.26" data-rise>
            <span className="sfl-eyebrow">Before Gradient</span>
            <h2 id="sfl-title">This is what running wholesale supply on WhatsApp looks like.</h2>
            <p>Orders in chats and voice notes, a paper order book, a stock sheet that never adds up, Tally, payment reminders, challans, crates and a driver who can&apos;t find the café.</p>
          </div>
          <div className="sfl-copy is-after" data-in="0.5" data-rise aria-hidden="true">
            <span className="sfl-eyebrow">On Gradient</span>
            <h2>Now every order rides in one place.</h2>
            <p>Café orders, stock, the route, crates, e-invoices and payouts on one screen, from the first message to the signed delivery.</p>
          </div>
        </div>

        <div className="sfl-diagram" style={{ width: CW * s, height: CH * s }}>
          <div className="sfl-canvas" ref={canvasRef} style={{ transform: `scale(${s})` }}>
            {/* dotted hand-offs between the pieces */}
            <svg className="sfl-links" viewBox={`0 0 ${CW} ${CH}`} aria-hidden="true" data-out="0.24">
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
            <div className="sfl-card sfl-wa" data-card data-rot="-1.5" data-fly="0.33" data-jx="-200" style={{ left: 30, top: 40, width: 284 }}>
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

            <div className="sfl-card sfl-book" data-card data-rot="-3" data-fly="0.345" data-jx="-120" style={{ left: 346, top: 22, width: 232 }}>
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

            <div className="sfl-card sfl-sheet" data-card data-rot="0" data-fly="0.36" data-jx="-160" style={{ left: 40, top: 330, width: 334 }}>
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

            <div className="sfl-card sfl-calls" data-card data-rot="1.5" data-fly="0.375" data-jx="-40" style={{ left: 404, top: 290, width: 200 }}>
              <div className="sfl-in">
                <p><i className="ph" /><span><b>Maverick &amp; Farmer</b><small>4 missed calls</small></span></p>
                <p><i className="ph" /><span><b>Unknown number</b><small>2 missed calls</small></span></p>
              </div>
            </div>

            <div className="sfl-card sfl-pay" data-card data-rot="2" data-fly="0.39" data-jx="40" style={{ left: 618, top: 36, width: 234 }}>
              <div className="sfl-in">
                <span className="tag">Payment reminder #3</span>
                <b>₹18,400 due</b>
                <small>Third Wave · Indiranagar · 47 days overdue</small>
                <span className="btn">Send reminder</span>
              </div>
            </div>

            <div className="sfl-card sfl-tally" data-card data-rot="0" data-fly="0.42" data-jx="160" style={{ left: 880, top: 40, width: 290 }}>
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

            <div className="sfl-card sfl-challan" data-card data-rot="2.5" data-fly="0.44" data-jx="170" style={{ left: 872, top: 330, width: 262 }}>
              <div className="sfl-in">
                <b>DELIVERY CHALLAN <span>No. 2207</span></b>
                <ul><li><span>Arabica AA 10kg</span><span>1</span></li><li><span>Oat milk 1L</span><span>12</span></li><li><span>Crates</span><span>3</span></li></ul>
                <div className="sign"><small>Received by</small><span /></div>
                <em className="stamp">Signature missing</em>
              </div>
            </div>

            <div className="sfl-card sfl-sticky" data-card data-rot="-4" data-fly="0.41" data-jx="60" style={{ left: 642, top: 300, width: 172 }}>
              <div className="sfl-in">
                <span className="tape" />
                <p>Crates out: 42<br />back: 31 ??<br />Ramesh to check</p>
              </div>
            </div>

            <div className="sfl-card sfl-chat" data-card data-rot="0" data-fly="0.43" data-jx="20" style={{ left: 600, top: 470, width: 262 }}>
              <div className="sfl-in">
                <i>R</i>
                <span><small>Ramesh · Driver</small><b>Sir café band hai. Address galat hai kya?</b></span>
              </div>
            </div>

            <div className="sfl-card sfl-file" data-card data-rot="0" data-fly="0.38" data-jx="-60" style={{ left: 420, top: 498, width: 112 }}>
              <div className="sfl-in"><span className="doc"><b>PDF</b></span><small>rate_list_OLD_v2.pdf</small></div>
            </div>

            <div className="sfl-card sfl-mail" data-card data-rot="0" data-fly="0.4" data-jx="100" style={{ left: 820, top: 250, width: 64 }}>
              <div className="sfl-in"><span className="env" /><em>1,284</em></div>
            </div>

            <div className="sfl-card sfl-folder" data-card data-rot="0" data-fly="0.37" data-jx="0" style={{ left: 596, top: 196, width: 96 }}>
              <div className="sfl-in"><span className="fd" /><small>[PENDING] POs</small></div>
            </div>

            {/* ── the truck: its cargo box shows the same run on Gradient ── */}
            <div className="sfl-road" style={{ top: TRUCK.top + TRUCK.h }} data-in="0.26" aria-hidden="true" />
            <div className="sfl-truck" ref={truckRef} style={{ left: TRUCK.left, top: TRUCK.top, width: TRUCK.w, height: TRUCK.h }} aria-label="A Gradient delivery truck whose cargo box shows today's run in the Supplier Portal">
              <div className="sfl-shadow" />
              <div className="sfl-box" style={{ width: TRUCK.boxW, height: TRUCK.boxH }}>
                <div className="sfl-screen" data-in="0.5">
                  <header data-in="0.53" data-rise>
                    <span className="mark" /><b>Gradient</b><small>Supplier Portal</small>
                    <span className="live"><i />Run 04 · Van 04 · Live</span>
                  </header>
                  <div className="sfl-grid">
                    <section className="ob">
                      <h4 data-in="0.55" data-rise>Today&apos;s order book</h4>
                      {[
                        ['Blue Tokai · Koramangala', '10kg Arabica AA', '₹8,200', 'Delivered', 'ok'],
                        ['Maverick & Farmer · 80ft Rd', '12× Oat milk 1L', '₹2,160', 'Loaded', 'go'],
                        ['Third Wave · Indiranagar', '6kg House blend', '₹4,980', 'Packed', 'go'],
                        ['Roast Depot · HSR', '4× Vanilla syrup', '₹3,060', 'Allocated', 'wait'],
                      ].map(([c, it, amt, st, k], i) => (
                        <div className="row" key={c} data-in={String(0.57 + i * 0.025)} data-rise>
                          <span><b>{c}</b><small>{it}</small></span>
                          <em>{amt}</em>
                          <i className={k}>{st}</i>
                        </div>
                      ))}
                    </section>
                    <section className="rt">
                      <h4 data-in="0.6" data-rise>Route</h4>
                      {[
                        ['10:40', 'Koramangala', 'ePOD signed', true],
                        ['11:20', '80ft Road', 'Arriving', false],
                        ['12:05', 'Indiranagar', 'Next', false],
                      ].map(([t, place, st, done], i) => (
                        <div className={`stop${done ? ' done' : ''}`} key={String(place)} data-in={String(0.62 + i * 0.025)} data-rise>
                          <i /><span><b>{place}</b><small>{t} · {st}</small></span>
                        </div>
                      ))}
                    </section>
                    <section className="kp">
                      {[
                        ['Stock reserved', '35 units', 'Bay 02'],
                        ['Crates tracked', '42 / 42', '0 missing'],
                        ['e-Invoice', 'IRN ✓', 'Synced to Tally'],
                        ['Escrow', '₹18,400', 'Payout T+1'],
                      ].map(([l, v, sub], i) => (
                        <div className="tile" key={l} data-in={String(0.66 + i * 0.025)} data-rise>
                          <small>{l}</small><b>{v}</b><span>{sub}</span>
                        </div>
                      ))}
                    </section>
                  </div>
                </div>
              </div>
              <div className="sfl-chassis" />
              <svg className="sfl-cab" viewBox="0 0 250 230" aria-hidden="true">
                <defs>
                  <linearGradient id="sfl-cab-g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#2BC064" />
                    <stop offset="1" stopColor="#14843E" />
                  </linearGradient>
                  <linearGradient id="sfl-glass" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#E8F6EE" />
                    <stop offset="1" stopColor="#A9D9BC" />
                  </linearGradient>
                </defs>
                <path d="M6 18Q6 8 16 8H132Q150 8 160 22L214 96Q222 106 236 110Q246 113 246 126V206Q246 214 238 214H6Z" fill="url(#sfl-cab-g)" />
                <path d="M26 28H128Q138 28 144 36L190 100H26Z" fill="url(#sfl-glass)" />
                <path d="M100 28V100" stroke="#14843E" strokeWidth="5" />
                <path d="M26 112H200" stroke="rgba(0,0,0,0.14)" strokeWidth="1.5" />
                <rect x="40" y="126" width="22" height="5" rx="2.5" fill="rgba(0,0,0,0.25)" />
                <text x="74" y="168" className="sfl-cab-word">Gradient</text>
                <rect x="226" y="132" width="20" height="16" rx="4" fill="#FFF6D6" />
                <rect x="200" y="196" width="48" height="14" rx="5" fill="#0D5228" />
              </svg>
              {[64, 168, 812].map((x) => (
                <svg key={x} className="sfl-wheel" viewBox="-40 -40 80 80" style={{ left: x }} aria-hidden="true">
                  <g data-wheel>
                    <circle r="36" fill="#1A1F1C" />
                    <circle r="22" fill="#C9D3CC" />
                    <circle r="8" fill="#5E6B62" />
                    {[0, 72, 144, 216, 288].map((a) => (
                      <rect key={a} x="-2.5" y="-20" width="5" height="11" rx="2" fill="#7E8B82" transform={`rotate(${a})`} />
                    ))}
                  </g>
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
