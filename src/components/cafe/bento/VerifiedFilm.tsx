'use client';
// Left card, after Shopify's "Get a store that's built to sell". A distributor's profile, cropped by the card's
// edge, with a red selection frame (Shopify's purple "Group" frame) and an assistant input in the corner. At rest
// it shows the verified profile. On hover it plays like Shopify's film: a request types itself into the input, a
// glossy sweep passes over the framed checks and they run again one by one, then the frame jumps to the header
// (Shopify's "Group" → "Header") as the brand's authorisation lands and the seal stamps. On leaving, it resets.
import { useEffect, useState } from 'react';
import { Check, GradientMark } from '@/components/supplier/bento/shared';
import type { FilmState } from '../CafeBento';

const ASK = 'Verify Freshway Dairy';
const CHECKS = [
  ['Brand authorisation', 'Letter on file'],
  ['GSTIN', '07AABCF2291K1Z4'],
  ['FSSAI licence', '13324999000412'],
  ['Bank account', 'Penny-drop verified'],
] as const;
const PRODUCTS = ['/landing/spotlight/amul-fresh-cream.png', '/landing/spotlight/amul-butter-500g.png', '/landing/spotlight/amul-mozzarella-cheese.png'];
const SHIELD = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z" /></svg>;

export function VerifiedFilm({ run, still }: FilmState) {
  const [chars, setChars] = useState(0);       // how much of the request is typed
  const [done, setDone] = useState(4);         // checks ticked
  const [scan, setScan] = useState(false);     // the sweep over the framed checks
  const [onHead, setOnHead] = useState(false); // the frame sits on the header (authorised) instead of the checks
  const [seal, setSeal] = useState(true);
  useEffect(() => {
    const rest = () => { setChars(0); setDone(4); setScan(false); setOnHead(false); setSeal(true); };
    if (!run || still) { rest(); return; }
    const ts: number[] = [];
    let typer = 0;
    const at = (ms: number, f: () => void) => { ts.push(window.setTimeout(f, ms)); };
    const play = () => {
      setSeal(false); setOnHead(false); setScan(false); setDone(4); setChars(0);
      let n = 0;
      clearInterval(typer);
      typer = window.setInterval(() => { n += 1; setChars(n); if (n >= ASK.length) clearInterval(typer); }, 40);
      at(1150, () => { setScan(true); setDone(0); });
      at(1950, () => setScan(false));
      [0, 1, 2, 3].forEach((i) => at(2150 + i * 420, () => setDone(i + 1)));
      at(4050, () => { setOnHead(true); setSeal(true); });
      at(7200, play);
    };
    at(200, play);
    return () => { ts.forEach(clearTimeout); clearInterval(typer); };
  }, [run, still]);

  return (
    <div className="cbx-ver">
      <div className="cbx-ver-panel">
        <div className={`cbx-ver-head cbx-sel${onHead ? ' is-on' : ''}`}>
          <span className="cbx-sel-tag">{SHIELD} Authorised</span>
          <span className="cbx-ver-av">FD</span>
          <span><b>Freshway Dairy</b><small>{onHead ? 'Brand-authorised distributor' : 'Distributor · Delhi NCR'}</small></span>
        </div>
        <div className="cbx-ver-products">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {PRODUCTS.map((p) => <img key={p} src={p} alt="" />)}
          <span>+ 84</span>
        </div>
        <div className={`cbx-ver-frame cbx-sel${onHead ? '' : ' is-on'}${scan ? ' is-scan' : ''}`}>
          <span className="cbx-sel-tag">{SHIELD} Verified</span>
          <ul>
            {CHECKS.map(([k, v], i) => (
              <li key={k} className={done > i ? 'is-done' : undefined}>
                <span className="cbx-ver-dot">{done > i ? <Check /> : null}</span>
                <span><b>{k}</b><small>{done > i ? v : 'Checking…'}</small></span>
              </li>
            ))}
          </ul>
          <span className="cbx-shimmer" aria-hidden="true" />
        </div>
        {/* past the narrow card's edge, so it only comes into view when the card widens (as Shopify's second model
            does): the brand's letter authorising this distributor, stamped once the frame lands on "Authorised" */}
        <div className="cbx-ver-doc" aria-hidden="true">
          <small>Letter of authorisation</small>
          <b>Freshway Dairy</b>
          <p>is an authorised distributor of our dairy range for Delhi NCR, valid until March 2027.</p>
          <i /><i /><i className="is-short" />
          <svg className="cbx-ver-sign" viewBox="0 0 120 34"><path d="M4 24c10-14 18-18 20-10s-4 14 2 10 10-18 16-14-2 16 4 12 12-12 18-10 2 10 8 8 14-6 22-8 10 0 18-2" /></svg>
          <span className={`cbx-ver-stamp${onHead ? ' is-on' : ''}`}>{SHIELD} Brand verified</span>
        </div>
      </div>
      <span className={`cbx-seal${seal ? ' is-on' : ''}`} aria-hidden="true"><Check /><small>Verified</small></span>
      {/* the assistant's input (Shopify's Sidekick prompt), cropped by the card's edge */}
      <div className={`cbx-prompt${chars > 0 ? ' is-typing' : ''}`} aria-hidden="true">
        <span className="cbx-prompt-mark"><GradientMark size={13} /></span>
        <span className="cbx-prompt-tx">{ASK.slice(0, chars)}<i className="cbx-caret" /></span>
      </div>
    </div>
  );
}
