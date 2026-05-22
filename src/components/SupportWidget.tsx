'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

type Msg = { from: 'them' | 'me'; node: ReactNode; time: string };

const GREETING_TEXT = "Hi there, you're speaking with Gradient's AI Agent. How can I help you today?";
const EMAIL = 'gradient365.team@gmail.com';
const PHONE_DISPLAY = '+91 74960 64936';
const PHONE_DIAL    = '+917496064936';

const timeNow = () => 'Just now';

// Extract a valid Indian mobile (must start 6-9, 10 digits). Returns formatted "+91 XXXXX XXXXX" or null.
function extractPhone(text: string): string | null {
  const cleaned = text.replace(/[^\d+]/g, '');
  const m = cleaned.match(/(?:\+?91|0)?([6-9]\d{9})/);
  if (!m) return null;
  const d = m[1];
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
}

function ContactAlternatives() {
  return (
    <div className="sw-contacts">
      <div className="sw-contacts-h">Or reach us directly:</div>
      <a href={`mailto:${EMAIL}`} className="sw-contact">📧 {EMAIL}</a>
      <a href={`tel:${PHONE_DIAL}`} className="sw-contact">📞 {PHONE_DISPLAY}</a>
    </div>
  );
}

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  // close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuWrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  // first-open greeting flow
  useEffect(() => {
    if (!open || msgs.length > 0) return;
    setTyping(true);
    const id = window.setTimeout(() => {
      setTyping(false);
      setMsgs([{ from: 'them', node: GREETING_TEXT, time: timeNow() }]);
    }, 900);
    return () => window.clearTimeout(id);
  }, [open, msgs.length]);

  // auto-scroll to latest
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMsgs(m => [...m, { from: 'me', node: text, time: timeNow() }]);
    setInput('');
    setTyping(true);

    const phone = extractPhone(text);
    const reply: ReactNode = phone ? (
      <>Got it someone from the Gradient team will reach you at <strong>{phone}</strong> shortly. Expect a call within the next business day.</>
    ) : (
      <>
        Please share your phone number and a team member will call you back.
        <ContactAlternatives />
      </>
    );

    // Fire-and-forget notification email when phone detected.
    if (phone) {
      fetch('/api/contact-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message: text }),
      }).catch(err => console.warn('callback-email failed', err));
    }

    window.setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { from: 'them', node: reply, time: timeNow() }]);
    }, 1100);
  };

  return (
    <>
      <button
        className={`sw-fab ${open ? 'sw-fab-open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close support' : 'Open support'}
      >
        {open ? <ChevronDown /> : <Smile />}
      </button>

      {open && (
        <div className={`sw-panel ${expanded ? 'sw-expanded' : ''}`} role="dialog" aria-label="Gradient support chat">
          <header className="sw-h">
            <button className="sw-h-icon" aria-label="Back">
              <ChevronLeft />
            </button>
            <div className="sw-h-mark">G</div>
            <div className="sw-h-meta">
              <div className="sw-h-name">Gradient Support</div>
              <div className="sw-h-sub">The team can also help</div>
            </div>
            <div className="sw-menu-wrap" ref={menuWrapRef}>
              <button
                className={`sw-h-icon ${menuOpen ? 'sw-h-icon-on' : ''}`}
                onClick={() => setMenuOpen(o => !o)}
                aria-label="More options"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              ><Dots /></button>
              {menuOpen && (
                <div className="sw-menu" role="menu">
                  <button
                    className="sw-menu-item"
                    role="menuitem"
                    onClick={() => { setExpanded(e => !e); setMenuOpen(false); }}
                  >
                    {expanded ? <Collapse /> : <Expand />}
                    <span>{expanded ? 'Collapse window' : 'Expand window'}</span>
                  </button>
                </div>
              )}
            </div>
            <button className="sw-h-icon" onClick={() => setOpen(false)} aria-label="Close"><Close /></button>
          </header>

          <div className="sw-body" ref={bodyRef}>
            <p className="sw-intro">Ask us anything, or share your feedback.</p>

            {msgs.map((m, i) => (
              <div key={i} className={`sw-row sw-row-${m.from}`}>
                <div className="sw-bubble">{m.node}</div>
                {m.from === 'them' && <div className="sw-meta">Gradient Support · {m.time}</div>}
              </div>
            ))}

            {typing && (
              <div className="sw-row sw-row-them">
                <div className="sw-bubble sw-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          <div className="sw-input-wrap">
            <input
              className="sw-input"
              placeholder="Message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <div className="sw-actions">
              <button className="sw-i" aria-label="Attach"><Paperclip /></button>
              <button className="sw-i" aria-label="Emoji"><Emoji /></button>
              <button className="sw-i" aria-label="Voice"><Mic /></button>
              <button
                className={`sw-send ${input.trim() ? 'sw-send-on' : ''}`}
                disabled={!input.trim()}
                onClick={send}
                aria-label="Send"
              >
                <ArrowUp />
              </button>
            </div>
          </div>

          <p className="sw-privacy">
            By chatting with us, you agree to our <a href="/privacy">Privacy Policy</a>. Your personal data may be processed per this policy.
          </p>
        </div>
      )}
    </>
  );
}

// ── inline icons (avoid pulling from landing/icons to keep widget standalone) ──
const S = (p: { d?: string; children?: React.ReactNode; size?: number }) => (
  <svg width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {p.d ? <path d={p.d} /> : p.children}
  </svg>
);
const Smile = () => <S size={22}><circle cx="12" cy="12" r="9.5" /><path d="M8 14.5c1.2 1.3 2.6 2 4 2s2.8-.7 4-2" /></S>;
const ChevronDown = () => <S d="M6 9l6 6 6-6" size={22} />;
const ChevronLeft = () => <S d="M15 18l-6-6 6-6" />;
const Dots = () => <S><circle cx="5" cy="12" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="19" cy="12" r="1.2" fill="currentColor" /></S>;
const Close = () => <S d="M6 6l12 12M18 6L6 18" />;
const Paperclip = () => <S d="M21 12L13 20a5 5 0 01-7-7l9-9a3.5 3.5 0 015 5l-9 9a2 2 0 01-3-3l8-8" />;
const Emoji = () => <S><circle cx="12" cy="12" r="9" /><circle cx="9" cy="10" r="1" fill="currentColor" /><circle cx="15" cy="10" r="1" fill="currentColor" /><path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8" /></S>;
const Mic = () => <S><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></S>;
const ArrowUp = () => <S d="M12 19V5M5 12l7-7 7 7" size={16} />;
const Expand = () => <S size={16}><path d="M4 14v6h6M20 10V4h-6M4 20l8-8M20 4l-8 8" /></S>;
const Collapse = () => <S size={16}><path d="M10 4v6H4M14 20v-6h6M10 10L4 4M14 14l6 6" /></S>;
