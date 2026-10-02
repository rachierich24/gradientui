'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'gradient.cookie-consent';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const choice = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY);
    if (choice) return;
    const id = window.setTimeout(() => setShow(true), 900);  // let page settle first
    return () => window.clearTimeout(id);
  }, []);

  const decide = (val: 'accept' | 'reject') => {
    try { localStorage.setItem(STORAGE_KEY, val); } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cc-banner" role="dialog" aria-label="Cookie preferences">
      <p className="cc-text">
        We use cookies to improve your experience.<br />
        You can opt out of certain cookies.<br />
        Find out more in our{' '}
        <Link href="/privacy" className="cc-link">privacy policy</Link>.
      </p>
      <div className="cc-actions">
        <button className="cc-btn cc-accept" onClick={() => decide('accept')}>Continue</button>
        <button className="cc-btn cc-reject" onClick={() => decide('reject')}>Reject</button>
      </div>
    </div>
  );
}
