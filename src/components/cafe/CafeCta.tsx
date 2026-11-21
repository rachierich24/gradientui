// Section 04 — the ask. A simple first pass: one red card, one line, two buttons.
export function CafeCta({ onStart }: { onStart: () => void }) {
  return (
    <section className="cafe-sec cafe-sec-cta" aria-labelledby="cafe-cta-h">
      <div className="cafe-wrap">
        <div className="cafe-cta">
          <h2 className="cafe-cta-h" id="cafe-cta-h">Your next order is one tap away.</h2>
          <p>Bring your suppliers, your outlets and your bills into one portal. Cafés can start free.</p>
          <div className="cafe-cta-actions">
            <button type="button" className="cafe-btn cafe-btn-white" onClick={onStart}>Start ordering</button>
            <a className="cafe-btn cafe-btn-ghost" href="https://cafe.gradient365.com">Log in</a>
          </div>
        </div>
      </div>
    </section>
  );
}
