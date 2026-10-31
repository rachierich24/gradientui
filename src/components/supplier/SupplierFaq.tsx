'use client';
// Supplier FAQ, as "ask anything". A supplier types a question (or taps one of the questions looping
// underneath) and gets an answer from the supplier help desk (./faq-kb.ts) through /api/supplier-faq,
// which can have Claude phrase the answer from the help desk entries. The answer types itself in, says
// which help desk entry it came from and suggests related questions. A question the help desk can't answer
// goes to the supplier team by email (/api/contact). If the API can't be reached, the same help desk is
// searched in the browser. Styles: app/supplier/supplier-faq.css
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CONFIDENT, KB, search, type Entry } from './faq-kb';

type Answer =
  | { q: string; state: 'thinking' }
  | { q: string; state: 'answered'; text: string; source?: Entry; related: Entry[] }
  | { q: string; state: 'unknown'; related: Entry[] };

const byId = (id: string) => KB.find((e) => e.id === id);
const ROWS = [KB.filter((_, i) => i % 2 === 0), KB.filter((_, i) => i % 2 === 1)];

async function ask(q: string): Promise<{ text?: string; source?: Entry; related: Entry[] }> {
  try {
    const res = await fetch('/api/supplier-faq', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question: q }) });
    if (!res.ok) throw new Error(String(res.status));
    const out = (await res.json()) as { mode: 'ai' | 'kb' | 'none'; answer?: string; sources: string[] };
    const found = out.sources.map(byId).filter((e): e is Entry => !!e);
    return out.mode === 'none' ? { related: found } : { text: out.answer, source: found[0], related: found };
  } catch {
    const hits = search(q, 4);
    return hits[0] && hits[0].score >= CONFIDENT
      ? { text: hits[0].entry.a, source: hits[0].entry, related: hits.map((h) => h.entry) }
      : { related: hits.map((h) => h.entry) };
  }
}

// the placeholder types out questions people ask, one after another
function usePlaceholder(active: boolean) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!active || matchMedia('(prefers-reduced-motion: reduce)').matches) { setText(KB[3].q); return; }
    const list = [KB[3], KB[2], KB[9], KB[11], KB[5], KB[0]].map((e) => e.q);
    let i = 0, n = 0, back = false, tm = 0;
    const tick = () => {
      const s = list[i];
      if (!back) { n++; if (n >= s.length) { back = true; tm = window.setTimeout(tick, 1800); setText(s); return; } }
      else { n -= 2; if (n <= 0) { back = false; n = 0; i = (i + 1) % list.length; } }
      setText(s.slice(0, Math.max(0, n)));
      tm = window.setTimeout(tick, back ? 18 : 38);
    };
    tm = window.setTimeout(tick, 400);
    return () => clearTimeout(tm);
  }, [active]);
  return text;
}

// the answer types itself in, word by word
function Typed({ text, onDone }: { text: string; onDone?: () => void }) {
  const [n, setN] = useState(0);
  const parts = text.split(/(\s+)/);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(parts.length); done.current?.(); return; }
    setN(0);
    let k = 0;
    const id = window.setInterval(() => {
      k += 2;
      setN(k);
      if (k >= parts.length) { clearInterval(id); done.current?.(); }
    }, 28);
    return () => clearInterval(id);
  }, [text, parts.length]);
  return <>{parts.slice(0, n).join('')}{n < parts.length && <span className="sfq-caret" aria-hidden="true" />}</>;
}

function SendToTeam({ q }: { q: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Supplier FAQ', email, company: '', message: `Question from the supplier FAQ:\n\n${q}` }),
      });
      setState(res.ok ? 'sent' : 'error');
    } catch { setState('error'); }
  };
  if (state === 'sent') return <p className="sfq-sent">Sent. Our supplier team will answer at <b>{email}</b>, usually within a working day.</p>;
  return (
    <form className="sfq-team" onSubmit={submit}>
      <input type="email" required placeholder="Your work email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Your email" />
      <button type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Ask the team'}</button>
      {state === 'error' && <span className="sfq-err">That didn’t go through. Write to hello@unifiednexgrade.com instead.</span>}
    </form>
  );
}

export function SupplierFaq() {
  const [q, setQ] = useState('');
  const [focus, setFocus] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [typed, setTyped] = useState(false);
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [seen, setSeen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const run = useRef(0);
  const placeholder = usePlaceholder(seen && !focus && !q);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = async (question: string) => {
    const text = question.trim();
    if (text.length < 3) return;
    const id = ++run.current;
    setQ('');
    setTyped(false);
    setVote(null);
    setAnswer({ q: text, state: 'thinking' });
    const [out] = await Promise.all([ask(text), new Promise((r) => setTimeout(r, 450))]);
    if (id !== run.current) return;
    const related = out.related.filter((e) => e !== out.source).slice(0, 3);
    setAnswer(out.text ? { q: text, state: 'answered', text: out.text, source: out.source, related } : { q: text, state: 'unknown', related });
  };

  return (
    <section className="sup-section-shell alt-bg sfq" id="faq" ref={ref} aria-labelledby="sfq-title">
      <div className="sup-container">
        <div className="sup-section-header">
          <div className="sup-section-eyebrow"><span className="dot" /><span>FREQUENTLY ASKED QUESTIONS</span></div>
          <h2 className="sup-section-title" id="sfq-title">Ask anything about selling on Gradient.</h2>
          <p className="sup-section-desc">Type your question or pick one suppliers often ask. Answers come from our supplier help desk, and anything it can’t answer goes to a person.</p>
        </div>

        <div className="sfq-box">
          <form className={`sfq-ask${focus ? ' is-focus' : ''}`} onSubmit={(e) => { e.preventDefault(); go(q); }}>
            <svg className="sfq-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              ref={input} value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
              placeholder={placeholder || 'Ask about payments, delivery, pricing…'} aria-label="Ask a question" maxLength={300} enterKeyHint="send"
            />
            <button type="submit" disabled={q.trim().length < 3} aria-label="Ask">
              <span>Ask</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </form>

          {answer && (
            <div className="sfq-thread" aria-live="polite">
              <div className="sfq-you"><span>{answer.q}</span></div>
              <div className="sfq-reply">
                <span className="sfq-mark" aria-hidden="true">G</span>
                <div className="sfq-reply-body">
                  {answer.state === 'thinking' && <span className="sfq-dots" aria-label="Finding the answer"><i /><i /><i /></span>}
                  {answer.state === 'answered' && (
                    <>
                      <p><Typed text={answer.text} onDone={() => setTyped(true)} /></p>
                      <div className={`sfq-meta${typed ? ' is-on' : ''}`}>
                        {answer.source && <span className="sfq-src">From the help desk · {answer.source.topic}</span>}
                        <span className="sfq-vote">
                          Helpful?
                          <button type="button" aria-pressed={vote === 'up'} onClick={() => setVote('up')} aria-label="Yes">👍</button>
                          <button type="button" aria-pressed={vote === 'down'} onClick={() => setVote('down')} aria-label="No">👎</button>
                        </span>
                      </div>
                      {vote === 'down' && <div className="sfq-more"><p>Sorry about that. Leave your email and the supplier team will answer it properly.</p><SendToTeam q={answer.q} /></div>}
                    </>
                  )}
                  {answer.state === 'unknown' && (
                    <div className="sfq-more">
                      <p>The help desk doesn’t have an answer for that yet. Leave your email and our supplier team will reply.</p>
                      <SendToTeam q={answer.q} />
                    </div>
                  )}
                  {answer.state !== 'thinking' && answer.related.length > 0 && (typed || answer.state === 'unknown') && (
                    <div className="sfq-related">
                      <small>{answer.state === 'unknown' ? 'Maybe one of these helps' : 'Related'}</small>
                      {answer.related.map((e) => <button key={e.id} type="button" onClick={() => go(e.q)}>{e.q}</button>)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`sfq-loop${seen ? '' : ' is-paused'}`} aria-label="Questions suppliers ask">
          {ROWS.map((row, r) => (
            <div key={r} className={`sfq-row${r ? ' is-rev' : ''}`}>
              <div className="sfq-track">
                {[0, 1].map((copy) => row.map((e) => (
                  <button key={`${copy}-${e.id}`} type="button" className="sfq-chip" onClick={() => go(e.q)} tabIndex={copy ? -1 : 0} aria-hidden={copy ? true : undefined}>
                    <span className="t">{e.topic}</span>{e.q}
                  </button>
                )))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
