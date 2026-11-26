'use client';
// Section 14, the ask: a card in the portal's own green (its deep shades) on the white page.
//  · Left: the question, and what a supplier gets, as three proofs: one portal, GST invoices, T+1 payout.
//  · Right: the application on a white card. The three steps to going live, the business name, and what they supply
//    (four choices, not a dropdown). Submitting opens the contact form already set to "supplier", with the business
//    name and category filled in (openContactSalesModalWith), so nothing typed here is lost.
// Styles: app/supplier/supplier-cta.css
import { useId, useState, type ReactNode, type SyntheticEvent } from 'react';
import { openContactSalesModalWith } from '@/components/ContactSalesModal';

const ic = (d: ReactNode) => <svg viewBox="0 0 24 24" aria-hidden="true">{d}</svg>;

const CATEGORIES = [
  { id: 'coffee', label: 'Coffee roaster', full: 'Specialty coffee (single origin & blends)',
    icon: ic(<><ellipse cx="12" cy="12" rx="5.6" ry="8" transform="rotate(30 12 12)" /><path d="M14.6 5.6c-2.6 2-3.6 4.4-2.6 6.6s.2 4.6-2.6 6.2" /></>) },
  { id: 'dairy', label: 'Dairy & plant milk', full: 'Wholesale dairy, oat & plant milk',
    icon: ic(<><path d="M8 3h8v3l2 3v12H6V9l2-3z" /><path d="M6 9h12" /></>) },
  { id: 'packaging', label: 'Packaging & cups', full: 'Biodegradable packaging & cups',
    icon: ic(<><path d="M6.5 8h11l-1.4 12.5H7.9z" /><path d="M5.5 8h13M7.5 4.5h9L17.5 8h-11z" /></>) },
  { id: 'syrups', label: 'Syrups & bakery', full: 'Beverage syrups, matcha & bakery',
    icon: ic(<><path d="M10 2.5h4v3l2 3V21H8V8.5l2-3z" /><path d="M8 13h8" /></>) },
] as const;

const PROOFS = [
  { k: '1 portal', v: 'For every café order', icon: ic(<><path d="M12 3 3 8l9 5 9-5-9-5z" /><path d="m3 13 9 5 9-5" /></>) },
  { k: 'GST invoices', v: 'Built for you', icon: ic(<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6M9 16h3" /></>) },
  { k: 'T+1 payout', v: 'Guaranteed', icon: ic(<><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" /><path d="m9 15 2 2 4-4" /></>) },
];

const STEPS = ['Apply', 'Get verified', 'Go live'];

const STORE = ic(<><path d="M4 10v10h16V10" /><path d="M3 10l2-6h14l2 6z" /><path d="M10 20v-5h4v5" /></>);
const ARROW = ic(<path d="M5 12h14M13 6l6 6-6 6" />);
const LOCK = ic(<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>);

export function SupplierCta() {
  const uid = useId();
  const [name, setName] = useState('');
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]['id']>('coffee');

  const submit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    openContactSalesModalWith({ role: 'supplier', company: name, roleDetail: CATEGORIES.find((c) => c.id === cat)?.full });
  };

  return (
    <section className="sct-section" id="cta" aria-labelledby={`${uid}-title`}>
      <div className="sup-container">
        <div className="sct-card">
          {/* the Gradient mark, large and faint, in the corner */}
          <svg className="sct-mark" viewBox="0 0 28 28" aria-hidden="true">
            <path d="M7.68 8.31A8.5 8.5 0 0 1 20.32 8.31" /><path d="M22.08 11.37A8.5 8.5 0 0 1 15.77 22.31" /><path d="M12.23 22.31A8.5 8.5 0 0 1 5.92 11.37" />
          </svg>

          <div className="sct-copy">
            <span className="sct-chip"><i aria-hidden="true" />For wholesale suppliers</span>
            <h2 className="sct-title" id={`${uid}-title`}>
              Ready to streamline your <em>wholesale café supply?</em>
            </h2>
            <p className="sct-desc">
              Receive structured orders, eliminate WhatsApp chaos, sync with your roaster production queue, and automate
              guaranteed next-day bank settlement.
            </p>
            <ul className="sct-proofs">
              {PROOFS.map((p) => (
                <li key={p.k}>
                  <span className="sct-proof-ic">{p.icon}</span>
                  <span><b>{p.k}</b><small>{p.v}</small></span>
                </li>
              ))}
            </ul>
          </div>

          <form className="sct-form" onSubmit={submit} aria-labelledby={`${uid}-form`}>
            <ol className="sct-steps" aria-label="Three steps to going live">
              {STEPS.map((s, i) => (
                <li key={s} className={i === 0 ? 'is-on' : undefined} aria-current={i === 0 ? 'step' : undefined}><b>{i + 1}</b>{s}</li>
              ))}
            </ol>
            <h3 id={`${uid}-form`}>Get verified in under 2 hours</h3>
            <p>Enter your roastery, dairy or wholesale business name to start priority verification.</p>

            <label className="sct-field">
              <span className="sct-label">Business name</span>
              <span className="sct-input">
                {STORE}
                <input type="text" name="business" autoComplete="organization" placeholder="e.g. Sundial Roasters"
                  value={name} onChange={(e) => setName(e.target.value)} />
              </span>
            </label>

            <fieldset className="sct-cats">
              <legend className="sct-label">What do you supply?</legend>
              <div className="sct-cat-grid">
                {CATEGORIES.map((c) => (
                  <label key={c.id} className="sct-cat">
                    <input type="radio" name={`${uid}-cat`} value={c.id} checked={cat === c.id} onChange={() => setCat(c.id)} />
                    <span>{c.icon}{c.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button type="submit" className="sct-submit">Apply as a verified supplier{ARROW}</button>
            <p className="sct-note">{LOCK}Zero onboarding fee · FSSAI &amp; GST required</p>
          </form>
        </div>
      </div>
    </section>
  );
}
