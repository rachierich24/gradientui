'use client';
// Right card, after Shopify's "Sell on every channel". At rest the pieces of a café's GST month (returns, input
// credit, e-invoices, the books it all goes to) drift slowly up along the sphere's outer rings, as Shopify's channel
// logos do. On hover they fade away and a panel takes their place, as Shopify's "Built into every store" does: an
// eyebrow, then two features, each a tile with a title and a line, and an arrow that slides in beside the first.
import type { CSSProperties } from 'react';
import { Check } from '@/components/supplier/bento/shared';
import type { FilmState } from '../CafeBento';

// label or logo, x (% of the card), size, drift period (s), phase (s)
const TILES: { t?: string; img?: string; x: number; s: number; d: number; p: number }[] = [
  { t: 'GSTR-2B', x: 52, s: 62, d: 19, p: 0 },
  { img: '/logos/integrations/tally.svg', x: 14, s: 56, d: 22, p: 3.5 },
  { t: 'ITC', x: 66, s: 52, d: 17, p: 6.5 },
  { t: 'GSTR-3B', x: 24, s: 60, d: 21, p: 10 },
  { img: '/logos/integrations/zoho.svg', x: 60, s: 54, d: 23, p: 13 },
  { t: 'e-Invoice', x: 10, s: 58, d: 20, p: 16 },
  { t: 'HSN', x: 42, s: 48, d: 18, p: 17.5 },
];
const GHOSTS = [{ x: 36, d: 24, p: 2 }, { x: 80, d: 26, p: 8 }, { x: 30, d: 25, p: 14 }, { x: 78, d: 22, p: 19 }];
const ARROW = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;

export function GstFilm({ run, live, still }: FilmState) {
  const open = run && !still;
  return (
    <div className={`cbx-gst-film${open ? ' is-open' : ''}${live ? '' : ' is-paused'}`}>
      <div className="cbx-gst-drift" aria-hidden="true">
        {GHOSTS.map((g, i) => (
          <span key={`g${i}`} className="cbx-drifter" style={{ left: `${g.x}%`, '--d': `${g.d}s`, '--p': `${-g.p}s` } as CSSProperties}>
            <span className="cbx-ghost" />
          </span>
        ))}
        {TILES.map((tl, i) => (
          <span key={i} className="cbx-drifter" style={{ left: `${tl.x}%`, '--d': `${tl.d}s`, '--p': `${-tl.p}s` } as CSSProperties}>
            <span className="cbx-tile-chip" style={{ width: tl.s, height: tl.s }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {tl.img ? <img src={tl.img} alt="" /> : <b>{tl.t}</b>}
            </span>
          </span>
        ))}
      </div>

      <div className="cbx-gst-panel" aria-hidden={!open}>
        <small className="cbx-gst-eyebrow">Built into every bill</small>
        <div className="cbx-gst-feat">
          <div className="cbx-gst-art is-red"><span className="cbx-gst-badge"><Check /> GSTR-2B matched</span></div>
          <b>Input credit, tracked <i className="cbx-gst-go">{ARROW}</i></b>
          <small>₹18,420 to claim this month.</small>
        </div>
        <div className="cbx-gst-feat">
          <div className="cbx-gst-art is-books">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <span><img src="/logos/integrations/tally.svg" alt="" /></span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <span><img src="/logos/integrations/zoho.svg" alt="" /></span>
          </div>
          <b>One-click export</b>
          <small>Your month, straight to Tally or Zoho Books.</small>
        </div>
      </div>
    </div>
  );
}
