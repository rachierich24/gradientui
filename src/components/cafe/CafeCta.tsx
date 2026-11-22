'use client';
// Section 06 — the ask: "Download the app now. Or use it right here." Laid out after zomato.com's "Download the app
// now!" card (a soft card, the words and store badges on the left, a phone rising out of its bottom edge on the
// right), with its own vibe:
//
//  · The phone is the hero's photograph again (a hand holding it, so the page ends the way it began), leaning in
//    a little and rising out of the card as it comes into view. It follows the pointer slightly.
//  · Its screen is a 7:05 AM lock screen: the date, the clock in the page's serif, and Gradient notifications for
//    that morning arriving one at a time (a delivery, a better price, something running low, the GST bills, a chef
//    tasting — the same names and numbers as the hero and the bento). Each one makes the phone buzz.
//  · The QR is on a sticker taped over the card's right edge, hanging a little outside it, not on the phone's
//    screen. Below 960px it's left out (on a phone no one scans their own screen); the badges and the web link stay.
//  The notifications only cycle while the card is on screen. With reduced motion everything is still: three
//  notifications, no buzz, no drift.
import { useEffect, useRef, useState, type CSSProperties } from 'react';

const WEB_APP = 'https://cafe.gradient365.com';
// There's no App Store or Play Store listing yet, so until there is, both badges open the web app (it works on a
// phone too), as does the QR. Put the store links here when the apps are live, and regenerate the QR
// (public/cafe/app-qr.svg) if its link changes.
const APP_STORE_URL = WEB_APP;
const PLAY_STORE_URL = WEB_APP;
const HAND_SRC = '/cafe/hand-phone.webp?v=2';   // the hero's photograph, same version (public/ is cached for a day)
const QR_SRC = '/cafe/app-qr.svg?v=1';
const PING_MS = 2800;

// that morning's notifications, newest on top
const PINGS: { t: string; b: string }[] = [
  { t: 'Out for delivery', b: 'Baker’s Basket #4832 is on its way: 24 croissants, at your door by 7:30.' },
  { t: 'Best price today', b: 'Oat milk is ₹7 a litre cheaper at Freshway Dairy. Switch this week’s order?' },
  { t: 'Running low', b: 'About two days of 8 oz lids left. Reorder from PackRight?' },
  { t: 'October’s bills are matched', b: '96 of 97 bills match GSTR-2B. Send the export to your CA?' },
  { t: 'Tasting confirmed', b: 'Chef Meera brings the matcha trial kit on Thursday at 11 AM.' },
];
const AGO = ['now', '3m ago', '8m ago', ''];

const MARK_ARCS = (
  <>
    <path d="M7.68 8.31A8.5 8.5 0 0 1 20.32 8.31" /><path d="M22.08 11.37A8.5 8.5 0 0 1 15.77 22.31" /><path d="M12.23 22.31A8.5 8.5 0 0 1 5.92 11.37" />
  </>
);
const MARK = (
  <svg viewBox="0 0 28 28" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">{MARK_ARCS}</g>
    <circle cx="14" cy="14" r="3" fill="currentColor" />
  </svg>
);
const ARROW = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
// the store marks (Simple Icons, CC0)
const APPLE = (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" /></svg>
);
const PLAY = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924z" />
    <path fill="#34A853" d="M13.544 10.989l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973z" />
    <path fill="#FBBC04" d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594z" />
    <path fill="#EA4335" d="M13.544 13.056l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" />
  </svg>
);

export function CafeCta({ onStart }: { onStart: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);     // has come into view: the phone rises, the words come in
  const [onScreen, setOnScreen] = useState(false); // is on screen now: the notifications cycle
  const [still, setStill] = useState(false);       // reduced motion
  const [n, setN] = useState(-1);                  // the newest notification so far (-1: none yet)
  const [date, setDate] = useState('');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setStill(reduce);
    if (reduce) setN(2);
    setDate(new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }));
    const card = cardRef.current;
    if (!card) return;
    const io = new IntersectionObserver(([e]) => {
      setOnScreen(e.isIntersecting);
      if (e.isIntersecting) setInView(true);
    }, { threshold: 0.3 });
    io.observe(card);
    return () => io.disconnect();
  }, []);

  // a notification every PING_MS while the card is on screen (the first a moment after the phone has risen)
  useEffect(() => {
    if (!onScreen || still) return;
    let t = window.setTimeout(function tick() {
      setN((k) => k + 1);
      t = window.setTimeout(tick, PING_MS);
    }, 1100);
    return () => clearTimeout(t);
  }, [onScreen, still]);

  // each one buzzes the phone
  useEffect(() => {
    const el = phoneRef.current;
    if (n < 0 || still || !el) return;
    el.classList.remove('is-buzz');
    void el.offsetWidth;   // restart the animation
    el.classList.add('is-buzz');
  }, [n, still]);

  // the pointer tilts the phone a little (and moves the rings and the sticker the other way), smoothed
  useEffect(() => {
    const card = cardRef.current;
    if (!card || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0, last = 0;
    const frame = (t: number) => {
      const dt = last ? Math.min(64, t - last) : 16.7;
      last = t;
      const a = 1 - Math.pow(0.88, dt / 16.7);
      x += (tx - x) * a; y += (ty - y) * a;
      card.style.setProperty('--tx', x.toFixed(4));
      card.style.setProperty('--ty', y.toFixed(4));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(frame) : 0;
      if (!raf) {
        last = 0;
        // back at rest: drop the 3D tilt, so the phone's screen is drawn crisp rather than resampled
        if (!tx && !ty) card.classList.remove('is-tilting');
      }
    };
    const kick = () => { card.classList.add('is-tilting'); if (!raf) raf = requestAnimationFrame(frame); };
    const onMove = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      kick();
    };
    const onLeave = () => { tx = 0; ty = 0; kick(); };
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);
    return () => { card.removeEventListener('pointermove', onMove); card.removeEventListener('pointerleave', onLeave); cancelAnimationFrame(raf); };
  }, []);

  // the three newest, plus the one leaving at the bottom
  const shown = [n, n - 1, n - 2, n - 3].map((k, pos) => ({ k, pos })).filter(({ k }) => k >= 0);

  return (
    <section className="cafe-sec cct-sec" id="get-the-app" aria-labelledby="cafe-cta-h">
      <div className="cafe-wrap">
        <div className={`cct-shell${inView ? ' is-in' : ''}`}>
        <div className="cct-card" ref={cardRef}>
          {/* behind the phone: a warm glow */}
          <div className="cct-back" aria-hidden="true"><span className="cct-glow" /></div>

          <div className="cct-copy">
            <p className="cct-eyebrow"><i />The Gradient app</p>
            <h2 className="cct-h" id="cafe-cta-h">
              <span className="cct-mask"><span>Download the app now.</span></span>
              <span className="cct-mask"><span className="is-red">Or use it right here.</span></span>
            </h2>
            <p className="cct-lead">
              Reorder from behind the counter at 6 AM, approve a supplier’s bill from the market, and hear about anything
              running low before the rush. One account, on your phone and on the web.
            </p>
            <div className="cct-stores">
              <a className="cct-store" href={APP_STORE_URL} aria-label="Download on the App Store">
                {APPLE}<span><small>Download on the</small><b>App Store</b></span>
              </a>
              <a className="cct-store" href={PLAY_STORE_URL} aria-label="Get it on Google Play">
                {PLAY}<span><small>Get it on</small><b>Google Play</b></span>
              </a>
            </div>
            <div className="cct-or" aria-hidden="true"><span>or</span></div>
            <div className="cct-web">
              <a className="cct-web-btn" href={WEB_APP}>Use it in your browser {ARROW}</a>
              <p>Nothing to install, and cafés can start free. New to Gradient? <button type="button" onClick={onStart}>Talk to us</button></p>
            </div>
          </div>

          {/* the hand and phone, rising out of the card's bottom edge */}
          <div className="cct-stage" aria-hidden="true">
            <div className="cct-tilt">
              <div className="cct-phone" ref={phoneRef}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="cct-hand" src={HAND_SRC} width={1024} height={1024} alt="" loading="lazy" decoding="async" draggable={false} />
                <div className="ch-glass">
                  <div className="cct-lock">
                    <svg className="cct-wall" viewBox="0 0 28 28"><g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">{MARK_ARCS}</g><circle cx="14" cy="14" r="2.6" fill="currentColor" /></svg>
                    <div className="ch-status">
                      <span />
                      <span className="ch-icons">
                        <i className="ch-signal"><b /><b /><b /><b /></i>
                        <svg className="ch-wifi" viewBox="0 0 16 12"><path d="M8 11.2 5.6 8.6a3.4 3.4 0 0 1 4.8 0L8 11.2Zm-4.3-4.6L2.3 5.1a8 8 0 0 1 11.4 0l-1.4 1.5a6 6 0 0 0-8.6 0ZM.8 3.6-.6 2.1a12 12 0 0 1 17.2 0l-1.4 1.5a10 10 0 0 0-14.4 0Z" /></svg>
                        <i className="ch-battery"><b /></i>
                      </span>
                    </div>
                    <svg className="cct-padlock" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.6" fill="currentColor" /><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                    <p className="cct-date" suppressHydrationWarning>{date || ' '}</p>
                    <p className="cct-clock">7:05</p>
                    <div className="cct-pings">
                      {shown.map(({ k, pos }) => {
                        const p = PINGS[k % PINGS.length];
                        return (
                          <div key={k} className="cct-ping" data-pos={pos} style={{ '--pos': pos } as CSSProperties}>
                            <span className="cct-ping-icon">{MARK}</span>
                            <span className="cct-ping-tx">
                              <span className="cct-ping-top"><b>{p.t}</b><time>{AGO[pos]}</time></span>
                              <span className="cct-ping-body">{p.b}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <span className="cct-lockbtn is-torch"><svg viewBox="0 0 24 24"><path d="M8 3h8l-1.5 5v12a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V8L8 3Zm4 9v2" /></svg></span>
                    <span className="cct-lockbtn is-cam"><svg viewBox="0 0 24 24"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2h5.6l1.5 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9Z" /><circle cx="12" cy="13" r="3.4" /></svg></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* the QR, on a sticker taped over the card's right edge (outside the card, which clips the phone) */}
        <div className="cct-qr">
          <span className="cct-tape" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={QR_SRC} width={132} height={132} alt="QR code that opens the Gradient café app on your phone" loading="lazy" decoding="async" />
          <b>Scan for the app</b>
          <small>Point your phone’s camera here</small>
        </div>
        </div>
      </div>
    </section>
  );
}
