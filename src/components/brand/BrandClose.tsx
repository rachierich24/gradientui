'use client';
// The close, just before the footer: one line, one button. After the whole story, the only thing left to say is
// the ask, so it gets a screen of its own and nothing else. The button opens the same contact form as the navbar's.
// Styles: app/brand/brand-close.css
export function BrandClose({ onStart }: { onStart: () => void }) {
  return (
    <section className="bcl" aria-labelledby="bcl-title">
      <h2 id="bcl-title">Your product, in India&rsquo;s best <em>cafés.</em></h2>
      <p>Pick the neighbourhoods, we&rsquo;ll get the kits there. See what sells in three weeks.</p>
      <button type="button" className="bcl-go" onClick={onStart}>
        Launch your first trial
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </button>
    </section>
  );
}
