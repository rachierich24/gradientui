'use client';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

export const OPEN_CONTACT_SALES_EVENT = 'gradient:open-contact-sales';
export function openContactSalesModal() {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(OPEN_CONTACT_SALES_EVENT));
}

type Role = 'cafe' | 'supplier' | 'brand';
const ROLES: { value: Role; label: string }[] = [
  { value: 'cafe', label: 'Café owner' },
  { value: 'supplier', label: 'Supplier / roaster' },
  { value: 'brand', label: 'Brand' },
];

// Per-role follow-up: label + placeholder for the one extra field that's actually
// useful to us (outlet count for cafés, category for suppliers/brands).
const ROLE_FIELD: Record<Role, { label: string; placeholder: string }> = {
  cafe: { label: 'Number of outlets', placeholder: 'e.g. 3' },
  supplier: { label: 'What do you supply', placeholder: 'e.g. Coffee beans, dairy, packaging' },
  brand: { label: 'Product category', placeholder: 'e.g. Packaged coffee, syrups, snacks' },
};

const ROLE_EMAIL: Record<Role, { label: string; placeholder: string }> = {
  cafe: { label: 'Café email', placeholder: 'Your café\'s email' },
  supplier: { label: 'Supplier email', placeholder: 'Your business email' },
  brand: { label: 'Brand email', placeholder: 'Your brand\'s email' },
};

type FormState = {
  role: Role | '';
  first: string; last: string; email: string; phone: string;
  city: string; roleDetail: string; details: string;
};
const EMPTY_FORM: FormState = { role: '', first: '', last: '', email: '', phone: '', city: '', roleDetail: '', details: '' };

const TOTAL_STEPS = 5;

export function ContactSalesModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onOpen = () => { setOpen(true); setStep(0); setSubmitted(false); setError(null); setForm(EMPTY_FORM); };
    window.addEventListener(OPEN_CONTACT_SALES_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CONTACT_SALES_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [open, step]);

  if (!open) return null;

  const set = (k: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const roleLabel = form.role ? ROLES.find(r => r.value === form.role)?.label : '';
  const roleField = form.role ? ROLE_FIELD[form.role] : null;
  const roleEmail = form.role ? ROLE_EMAIL[form.role] : { label: 'Company email', placeholder: 'Your work email' };

  const canContinue = [
    !!form.role,
    form.first.trim() !== '' && form.last.trim() !== '',
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    true, // city/role-detail step - optional
    true, // details step - optional
  ][step];

  const next = (e: FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
  };
  const back = () => setStep(s => Math.max(0, s - 1));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    const details = [
      form.details.trim(),
      roleLabel && `Role: ${roleLabel}`,
      form.city && `City: ${form.city}`,
      roleField && form.roleDetail && `${roleField.label}: ${form.roleDetail}`,
      form.phone && `Phone: ${form.phone}`,
    ].filter(Boolean).join('\n');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.first} ${form.last}`.trim(),
          email: form.email,
          company: roleLabel || '',
          message: details || 'Contact sales request',
        }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) {
        setError('Could not send your request. Please try again or email hello@unifiednexgrade.com.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Network error. Please try again or email hello@unifiednexgrade.com.');
    } finally {
      setSending(false);
    }
  };

  const isLast = step === TOTAL_STEPS - 1;

  return (
    <div className="csm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="csm-dialog" role="dialog" aria-modal="true" aria-label="Contact sales">
        {!submitted && (
          <div className="csm-progress">
            <div className="csm-progress-fill" style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
          </div>
        )}
        {!submitted && step > 0 && (
          <button type="button" className="csm-back" onClick={back} aria-label="Back">←</button>
        )}
        <button type="button" className="csm-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>

        {submitted ? (
          <div className="csm-success">
            <div className="csm-success-ic">✅</div>
            <h2>Message received!</h2>
            <p>Thanks for reaching out. We&apos;ll get back to you within 1–2 business days.</p>
          </div>
        ) : (
          <form onSubmit={isLast ? handleSubmit : next} className="csm-form">
            {step === 0 && (
              <>
                <h2 className="csm-title">How can we help?</h2>
                <p className="csm-sub">This routes you to the right person on our team.</p>
                <div className="csm-choices">
                  {ROLES.map(r => (
                    <button
                      type="button"
                      key={r.value}
                      className={`csm-choice ${form.role === r.value ? 'is-selected' : ''}`}
                      onClick={() => { setForm(f => ({ ...f, role: r.value })); setStep(1); }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="csm-title">What&apos;s your name?</h2>
                <p className="csm-sub">Just a few more details…</p>
                <div className="csm-row">
                  <div className="csm-field">
                    <label>First name</label>
                    <input ref={firstFieldRef} required value={form.first} onChange={set('first')} placeholder="First" />
                  </div>
                  <div className="csm-field">
                    <label>Last name</label>
                    <input required value={form.last} onChange={set('last')} placeholder="Last" />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="csm-title">How can we reach you?</h2>
                <p className="csm-sub">We&apos;ll use this to follow up.</p>
                <div className="csm-field">
                  <label>{roleEmail.label}</label>
                  <input ref={firstFieldRef} type="email" required value={form.email} onChange={set('email')} placeholder={roleEmail.placeholder} />
                </div>
                <div className="csm-field">
                  <label>Phone number (optional)</label>
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="Your phone number" />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="csm-title">
                  {form.role === 'cafe' && 'Tell us about your café'}
                  {form.role === 'supplier' && 'Tell us about your supply'}
                  {form.role === 'brand' && 'Tell us about your brand'}
                </h2>
                <p className="csm-sub">This information will only be used to reach out to you.</p>
                <div className="csm-field">
                  <label>City</label>
                  <input ref={firstFieldRef} value={form.city} onChange={set('city')} placeholder="e.g. Bengaluru" />
                </div>
                {roleField && (
                  <div className="csm-field">
                    <label>{roleField.label}</label>
                    <input value={form.roleDetail} onChange={set('roleDetail')} placeholder={roleField.placeholder} />
                  </div>
                )}
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="csm-title">Anything else?</h2>
                <p className="csm-sub">Optional. Tell us about your needs and questions.</p>
                <div className="csm-field">
                  <textarea rows={5} value={form.details} onChange={set('details')} placeholder="Tell us about your needs and questions" />
                </div>
              </>
            )}

            {error && <p className="csm-error">{error}</p>}
            <button type="submit" className="csm-submit" disabled={sending || (!isLast && !canContinue)}>
              {isLast ? (sending ? 'Sending…' : 'Submit') : 'Continue'}
            </button>
            {isLast && (
              <p className="csm-legal">
                By submitting, you agree to our{' '}
                <a href="/privacy">Privacy Policy</a>.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
