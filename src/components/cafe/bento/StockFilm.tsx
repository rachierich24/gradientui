'use client';
// Top card: Shopify's "entered the chat" card, for a café that's about to run out. A request types itself into a
// bubble and is sent; a radar sweeps the neighbourhood; then the offers from the suppliers it found fan in as a
// React Bits <CardSwap /> (components/ui/CardSwap.tsx): a skewed 3D stack that deals itself, one offer to the
// front every few seconds, best first. Whichever offer is in front lights up its supplier on the radar, with a route
// drawn from the café to it. Visitors can drag or fling the front offer away, or click one behind to bring it
// forward; hovering a card pauses the deal. Plays while on screen; with reduced motion it shows the dealt stack.
import { useEffect, useState, type CSSProperties } from 'react';
import { Check, GradientMark, inr } from '@/components/supplier/bento/shared';
import CardSwap, { Card } from '@/components/ui/CardSwap';
import type { FilmState } from '../CafeBento';

const ASK = 'Out of oat milk.\nNeed 12 L by 7 AM.';
// suppliers around the café: angle (deg, 0 = up), distance on the radar (px), and whether they make 7 AM
const NEAR = [
  { av: 'FD', n: 'Freshway Dairy', short: 'Freshway', km: '1.2 km', eta: '6:40 AM', l: 198, a: 24, r: 70, ok: true },
  { av: 'MM', n: 'Milk Mantra Pro', short: 'Milk Mantra', km: '2.6 km', eta: '6:55 AM', l: 205, a: 238, r: 118, ok: true },
  { av: 'DF', n: 'Daily Farms', short: 'Daily Farms', km: '3.9 km', eta: '7:20 AM', l: 189, a: 322, r: 150, ok: false },
  { av: 'GV', n: 'Green Valley', short: 'Green Valley', km: '4.4 km', eta: '7:45 AM', l: 201, a: 196, r: 160, ok: false },
];
const pos = (a: number, r: number) => [Math.sin((a * Math.PI) / 180) * r, -Math.cos((a * Math.PI) / 180) * r] as const;

function Offer({ s, best }: { s: (typeof NEAR)[number]; best: boolean }) {
  return (
    <Card className="cbx-offer-card">
      <div className={`cbx-offer${s.ok ? '' : ' is-late'}`}>
        <div className="cbx-offer-top">
          <span className="cbx-offer-av">{s.av}</span>
          <span className="cbx-offer-who"><b>{s.n}</b><small><Check /> Verified · {s.km} away</small></span>
          {best ? <em>Best match</em> : !s.ok ? <em className="is-late">After 7 AM</em> : null}
        </div>
        <div className="cbx-offer-mid">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/landing/spotlight/barista-oat-carton.jpg" alt="" draggable={false} />
          <span className="cbx-offer-what"><small>Barista oat milk · 12 L</small><strong>{inr(s.l * 12)}</strong><span>{inr(s.l)} a litre</span></span>
          <span className="cbx-offer-eta"><small>Arrives</small><b>{s.eta}</b></span>
        </div>
        <span className="cbx-offer-btn">{s.ok ? `Order 12 L from ${s.short}` : 'Arrives after you open'}</span>
      </div>
    </Card>
  );
}

export function StockFilm({ run, still }: FilmState) {
  // type → scan → offers (then it stays on the offers, dealing them)
  const [phase, setPhase] = useState<'type' | 'scan' | 'offers'>(still ? 'offers' : 'type');
  const [chars, setChars] = useState(still ? ASK.length : 0);
  const [front, setFront] = useState(0);
  useEffect(() => {
    if (still) { setPhase('offers'); setChars(ASK.length); return; }
    if (!run || phase === 'offers') return;
    let n = 0;
    const ts: number[] = [];
    const typer = window.setInterval(() => { n += 1; setChars(n); if (n >= ASK.length) clearInterval(typer); }, 38);
    ts.push(window.setTimeout(() => setPhase('scan'), 1900));
    ts.push(window.setTimeout(() => setPhase('offers'), 3300));
    return () => { clearInterval(typer); ts.forEach(clearTimeout); };
  }, [run, still, phase]);
  const sent = phase !== 'type';
  const offers = phase === 'offers';
  const [fx, fy] = pos(NEAR[front].a, NEAR[front].r);
  return (
    <div className={`cbx-stock-film is-${phase}`}>
      {/* the neighbourhood: rings of distance around the café, swept while it searches */}
      <div className="cbx-radar" aria-hidden="true">
        <i style={{ '--r': '70px' } as CSSProperties} /><i style={{ '--r': '118px' } as CSSProperties} /><i style={{ '--r': '166px' } as CSSProperties} />
        <span className="cbx-sweep" />
        <svg className="cbx-route" viewBox="-200 -200 400 400" width="400" height="400">
          <line key={front} x1="0" y1="0" x2={fx.toFixed(1)} y2={fy.toFixed(1)} className={offers ? 'is-on' : undefined} />
        </svg>
        <span className="cbx-home"><GradientMark size={16} /></span>
        <small className="cbx-home-tx">Your café</small>
        {NEAR.map((s, i) => (
          <span key={s.n} className={`cbx-near${s.ok ? '' : ' is-late'}${offers ? ' is-on' : ''}${offers && i === front ? ' is-best' : ''}`}
            style={{ '--a': `${s.a}deg`, '--d': `${s.r}px`, transitionDelay: offers ? `${i * 120}ms` : '0ms' } as CSSProperties}>
            <i />
            <small>{s.km}</small>
          </span>
        ))}
      </div>
      {offers && <span className="cbx-near-count">{NEAR.length} suppliers nearby · {NEAR.filter((s) => s.ok).length} by 7 AM</span>}

      {/* the request */}
      <div className={`cbx-ask${sent ? ' is-sent' : ''}`}>
        <span>{ASK.slice(0, chars)}{!sent && chars < ASK.length ? <i className="cbx-caret" /> : null}</span>
        <button type="button" tabIndex={-1} aria-hidden="true" className={chars >= ASK.length && !sent ? 'is-ready' : undefined}>
          <svg viewBox="0 0 24 24"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" /></svg>
        </button>
      </div>

      {/* the offers, dealt by the stack itself (mounted when they arrive, so its fan-in plays) */}
      <div className="cbx-offers">
        {offers && (
          <CardSwap width={380} height={248} cardDistance={44} verticalDistance={36} depth={70} skewAmount={5} visibleCards={4}
            delay={2800} autoplay={run && !still} pauseOnHover theme="light" cardRadius={16} dim={0.55} parallax={0.4}
            onChange={setFront} ariaLabel="Offers from nearby suppliers"
            style={{ '--swap-shadow': '0 26px 50px -26px rgba(120, 20, 10, .42), 0 8px 18px -12px rgba(120, 20, 10, .22)', '--swap-tile': '#FFFFFF', '--swap-ink': '#E03E3E' } as CSSProperties}>
            {NEAR.map((s, i) => <Offer key={s.n} s={s} best={i === 0} />)}
          </CardSwap>
        )}
      </div>
    </div>
  );
}
