// POST /api/supplier-faq
// Body: { question: string }
// Answers a supplier's question from the help desk in components/supplier/faq-kb.ts. With ANTHROPIC_API_KEY
// set, Claude writes the answer from the closest entries (and only from them); without it, the closest
// entry is returned as it is. Either way, a question the help desk can't answer comes back as `none`, and
// the section offers to send it to the team.

import { NextResponse } from 'next/server';
import { CONFIDENT, KB, search } from '@/components/supplier/faq-kb';

export const runtime = 'edge';

const MODEL = process.env.SUPPLIER_FAQ_MODEL || 'claude-haiku-5-5';
const SYSTEM = `You answer questions from wholesale suppliers (coffee roasters, dairies, bakeries, packaging makers) about selling to cafés through Gradient.
Answer using only the help desk entries you are given. Do not add facts, numbers, prices or promises that are not in them.
If the entries do not answer the question, reply with exactly: NO_ANSWER
Write 1–3 short sentences in plain text, no markdown, no greeting, in the same language as the question.`;

type Out = { mode: 'ai' | 'kb' | 'none'; answer?: string; sources: string[] };

export async function POST(req: Request) {
  let question = '';
  try {
    question = String((await req.json())?.question ?? '').trim().slice(0, 300);
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad-json' }, { status: 400 });
  }
  if (question.length < 3) return NextResponse.json({ ok: false, reason: 'too-short' }, { status: 400 });

  const hits = search(question, 4);
  const best = hits[0];
  const fallback: Out = best && best.score >= CONFIDENT
    ? { mode: 'kb', answer: best.entry.a, sources: [best.entry.id] }
    : { mode: 'none', sources: hits.map((h) => h.entry.id) };

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json(fallback);

  // give Claude the closest entries (or all of them if nothing matched by words: it may be phrased oddly)
  const context = (hits.length ? hits.map((h) => h.entry) : KB).map((e) => `[${e.id}] Q: ${e.q}\nA: ${e.a}`).join('\n\n');
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL, max_tokens: 300, system: SYSTEM,
        messages: [{ role: 'user', content: `Help desk entries:\n\n${context}\n\nSupplier's question: ${question}` }],
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`anthropic ${res.status}`);
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (data.content ?? []).filter((c) => c.type === 'text').map((c) => c.text ?? '').join('').trim();
    if (!text || text.includes('NO_ANSWER')) return NextResponse.json({ mode: 'none', sources: fallback.sources } satisfies Out);
    return NextResponse.json({ mode: 'ai', answer: text, sources: hits.slice(0, 2).map((h) => h.entry.id) } satisfies Out);
  } catch (err) {
    console.warn('[supplier-faq] falling back to the help desk:', err);
    return NextResponse.json(fallback);
  }
}
