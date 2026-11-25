'use client';
// Bottom card: Shopify's "Sell across borders", for launching something new. Where Shopify lists countries, this
// lists the brands' chefs; the trial kits sit in a React Bits <Stack /> that deals itself (autoplay, fanned), the
// order pill is the booked tasting, and the shipping list is the launch plan, ticking off from trial to menu.
// Whichever kit is on top sets the chef; each time one comes up, its booking plays: "Book a trial" is pressed, the
// tasting is booked and the plan ticks off, then the stack sends it to the back. Visitors can drag, flick or click
// the top kit too. Plays while on screen.
import { useEffect, useMemo, useState } from 'react';
import { Check, initials } from '@/components/supplier/bento/shared';
import Stack from '@/components/ui/Stack';
import type { FilmState } from '../CafeBento';

const CHEFS = [
  { n: 'Chef Meera', b: 'Matcha', item: 'Ceremonial matcha', size: '100 g trial tin', img: '/landing/spotlight/ceremonial-matcha-tin.jpg', dish: 'Iced matcha tonic', when: 'Thu, 11 AM', tone: '#E9F1E4' },
  { n: 'Chef Arjun', b: 'Chocolate', item: 'Dark couverture 70%', size: '500 g trial pack', img: '/landing/spotlight/callebaut-811-dark-chocolate.png', dish: 'Thick hot chocolate', when: 'Fri, 3 PM', tone: '#F1E7E1' },
  { n: 'Chef Kabir', b: 'Syrups', item: 'Hazelnut syrup', size: '250 ml trial bottle', img: '/landing/spotlight/monin-hazelnut-syrup.png', dish: 'Hazelnut cold brew', when: 'Mon, 10 AM', tone: '#F3EBDD' },
  { n: 'Chef Ananya', b: 'Dairy', item: 'Whipping cream', size: '1 L trial pack', img: '/landing/spotlight/amul-whipping-cream.png', dish: 'Vienna coffee', when: 'Tue, 4 PM', tone: '#E8EEF4' },
];
// one chef's booking, ms from when their kit comes to the top: press, booked, plan; the stack moves on at DEAL
const BEATS = [900, 1700, 2600];
const DEAL = 5400;

export function ChefsFilm({ run, still }: FilmState) {
  const [ci, setCi] = useState(0);          // the chef whose kit is on top
  const [at, setAt] = useState(still ? 3 : 0);   // 0 picked · 1 pressed · 2 booked · 3 planning
  useEffect(() => {
    if (still) { setAt(3); return; }
    if (!run) return;
    setAt(0);
    const ts = BEATS.map((t, i) => window.setTimeout(() => setAt(i + 1), t));
    return () => ts.forEach(clearTimeout);
  }, [ci, run, still]);
  // the plan ticks off step by step once the tasting is booked
  const [ticks, setTicks] = useState(still ? 3 : 0);
  useEffect(() => {
    if (still) { setTicks(3); return; }
    if (at < 3) { setTicks(0); return; }
    let n = 0;
    const id = setInterval(() => { n += 1; setTicks(n); if (n >= 3) clearInterval(id); }, 520);
    return () => clearInterval(id);
  }, [at, ci, still]);

  const c = CHEFS[ci];
  const steps = [`Trial kit: ${c.item}`, `Tasting with ${c.n}`, `Recipe: ${c.dish}`, 'Live on your menu'];
  // the kits; only the one on top shows its booking
  const kits = useMemo(() => CHEFS.map((ch, i) => {
    const live = i === ci;
    return (
      <div key={ch.n} className="cbx-kit">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ch.img} alt="" draggable={false} />
        <b>{ch.item}</b>
        <small>{ch.size} · from the brand</small>
        <span className={`cbx-kit-btn${live && at >= 1 ? ' is-down' : ''}${live && at >= 2 ? ' is-done' : ''}`}>
          {live && at >= 2 ? <><Check /> Trial booked</> : 'Book a trial'}
        </span>
      </div>
    );
  }), [ci, at]);

  return (
    <div className="cbx-chefs-film">
      {/* the brands' chefs (Shopify's country list) */}
      <ul className="cbx-chef-list" aria-hidden="true">
        {CHEFS.map((ch, i) => (
          <li key={ch.n} className={i === ci ? 'is-on' : undefined}>
            <span style={{ background: ch.tone }}>{initials(ch.n.replace('Chef ', ''))}</span>
          </li>
        ))}
      </ul>

      {/* the trial kits, dealt by the stack itself */}
      <div className="cbx-kit-stack">
        <Stack cards={kits} layout="fan" spread={0.55} depth={0.3} radius={16} visible={4}
          autoplay={run && !still} autoplayDelay={DEAL} pauseOnHover sendToBackOnClick
          onChange={setCi} ariaLabel="Trial kits from brand chefs" />
      </div>

      {/* the booked tasting (Shopify's order pill) */}
      <div className={`cbx-pill${at >= 2 ? ' is-on' : ''}`}>
        <span className="cbx-pill-av" style={{ background: c.tone }}>{initials(c.n.replace('Chef ', ''))}</span>
        <span>Tasting with {c.n} · {c.when}</span>
      </div>

      {/* the launch plan (Shopify's shipping list), over a field of dots */}
      <div className="cbx-dots" aria-hidden="true" />
      <div className="cbx-plan">
        <div className="cbx-plan-head"><b>Launch plan</b><small>{c.b} · with {c.n}</small></div>
        <ul>
          {steps.map((s, i) => (
            <li key={s} className={i < ticks ? 'is-done' : i === ticks ? 'is-now' : undefined}>
              <span className="cbx-box">{i < ticks ? <Check /> : null}</span>{s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
