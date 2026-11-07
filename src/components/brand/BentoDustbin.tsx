'use client';
// The bin the Before cards are thrown into (BrandBento.tsx), drawn in the page's line style: a white can with an
// open mouth, a brand purple lid that swings back on its hinge, and a count of what has gone in. How far it has
// risen (--bin) and how far the lid is open (--lid) come from the stage, set on scroll; it gives a small bump each
// time a card lands. Its mouth sits 21% of the way down: BentoCrumpleCanvas aims the paper there.
import type { RefObject } from 'react';

export function BentoDustbin({ cleared, dustbinRef }: { cleared: number; dustbinRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={dustbinRef} className="bbo-bin" aria-hidden="true">
      <svg viewBox="0 0 120 140">
        <ellipse className="bbo-bin-shadow" cx="60" cy="133" rx="46" ry="5" />
        <g key={cleared} className={`bbo-bin-can${cleared ? ' is-hit' : ''}`}>
          {/* the far rim, then the can in front of it: paper drops in through the open mouth and behind the front */}
          <path className="bbo-bin-line" d="M14 30A46 10 0 0 1 106 30" />
          <path className="bbo-bin-body" d="M14 30L23 124Q60 134 97 124L106 30A46 10 0 0 1 14 30Z" />
          <path className="bbo-bin-rib" d="M38 46l3 76M60 48v80M82 46l-3 76" />
        </g>
        <g className="bbo-bin-lid">
          <path d="M11 29Q60 7 109 29Q60 39 11 29Z" />
          <path className="bbo-bin-knob" d="M52 16.5h16" />
        </g>
      </svg>
      <span className="bbo-bin-count">{cleared >= 8 ? 'All 8 cleared' : cleared ? <><b>{cleared}</b> of 8 cleared</> : 'Clearing the board'}</span>
    </div>
  );
}
