'use client';
// Before and after, the section after the hero: a brand's café launch told as one sentence, then edited. It
// opens on the launch as it goes today: a distributor, a field rep, kits left in a back room, six weeks of not
// knowing. When the section comes into view, Gradient's cursor edits it the way a copy editor would. The lines
// spread to make room, and each detour is struck through and its replacement written in above it. Then the edits are taken: struck words drop out, the kept words close up, the insertions settle into
// the line, and the paragraph ends a good deal shorter. Pointing at an edit marks it. With reduced motion it shows
// the marked-up draft and nothing moves. Figures come from the sample Delhi NCR trial.
// Styles: app/brand/brand-compare.css
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { reduced } from './shared';

// the sentence: kept words, and edits as [what's struck, what's written in]
const RUNS: (string | readonly [string, string])[] = [
  'You send your product to',
  ['a distributor, who passes it to a field rep, who drops a few at', '120 verified'],
  'cafés,',
  ['where they sit in a back room', 'on the milk run they already get'],
  '— and',
  ['six weeks', 'eight days'],
  'later,',
  ['you still don’t know who', '100 baristas have'],
  'tasted it.',
];

// the sentence as words: kept, struck (in the original) and written in (in the clean copy)
type Tok = { text: string; kind: 'keep' | 'cut' | 'add'; edit: number };
const TOKS: Tok[] = [];
const EDITS: { cuts: number[]; adds: number[] }[] = [];
for (const run of RUNS) {
  if (typeof run === 'string') {
    for (const w of run.split(' ')) TOKS.push({ text: w, kind: 'keep', edit: -1 });
    continue;
  }
  const k = EDITS.length, e = { cuts: [] as number[], adds: [] as number[] };
  for (const w of run[0].split(' ')) { e.cuts.push(TOKS.length); TOKS.push({ text: w, kind: 'cut', edit: k }); }
  for (const w of run[1].split(' ')) { e.adds.push(TOKS.length); TOKS.push({ text: w, kind: 'add', edit: k }); }
  EDITS.push(e);
}
const IN_A = TOKS.map((_, i) => i).filter((i) => TOKS[i].kind !== 'add'); // the original
const IN_B = TOKS.map((_, i) => i).filter((i) => TOKS[i].kind !== 'cut'); // the clean copy

// the edit, 0 → 1: the lines spread, four edits (strike, then write in), a beat, then the edits are taken
const LH = 1.2; // the sentence's line height, as in the stylesheet
const SPREAD = 0.04;
const strikeAt = (k: number) => 0.05 + k * 0.135;
const STRIKE = 0.065, TYPE = 0.05;
const typeAt = (k: number) => strikeAt(k) + STRIKE - 0.005;
const typedBy = (k: number) => typeAt(k) + TYPE;
const MARKED = 0.6, TAKE = 0.64, TAKEN = 0.93;
const AUTOPLAY = 9500; // ms for the whole edit, when it plays by itself

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (k: number) => k * k * (3 - 2 * k);
const glide = (k: number) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);

// where every word sits in the original (one line height) and in the clean copy, measured from hidden paragraphs
type Geo = {
  em: number; sp: number; w: number; lines: number; hb: number;
  ax: number[]; aw: number[]; line: number[]; gapA: number[]; cutAt: number[]; cutLen: number[];
  bx: number[]; by: number[]; bw: number[]; gapB: number[];
};

const words = (list: number[]) => list.map((i, n) => (
  <Fragment key={i}>
    {n ? ' ' : null}
    <span data-i={i}>{TOKS[i].text}</span>
  </Fragment>
));

export function BrandCompare() {
  const sec = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const ma = useRef<HTMLParagraphElement>(null);
  const mb = useRef<HTMLParagraphElement>(null);
  const els = useRef<(HTMLSpanElement | null)[]>([]);
  const caret = useRef<HTMLSpanElement>(null);
  const geo = useRef<Geo | null>(null);
  const t = useRef(0);
  const raf = useRef(0);
  const calm = useRef(false);
  const [hot, setHot] = useState(-1);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const b0 = box.current, a = ma.current, b = mb.current;
    if (!b0 || !a || !b) return;
    const n = TOKS.length, em = parseFloat(getComputedStyle(b0).fontSize), z = () => new Array<number>(n).fill(0);
    const g: Geo = {
      em, sp: em * 0.25, w: b0.clientWidth, lines: 1, hb: b.offsetHeight,
      ax: z(), aw: z(), line: z(), gapA: z(), cutAt: z(), cutLen: EDITS.map(() => 0), bx: z(), by: z(), bw: z(), gapB: z(),
    };
    a.querySelectorAll<HTMLElement>('[data-i]').forEach((s) => {
      const i = Number(s.dataset.i);
      g.ax[i] = s.offsetLeft; g.aw[i] = s.offsetWidth; g.line[i] = Math.round(s.offsetTop / (LH * em));
    });
    b.querySelectorAll<HTMLElement>('[data-i]').forEach((s) => {
      const i = Number(s.dataset.i);
      g.bx[i] = s.offsetLeft; g.by[i] = s.offsetTop; g.bw[i] = s.offsetWidth;
    });
    // a space, from the first two words that share a line
    for (let n2 = 1; n2 < IN_A.length; n2++) {
      const i = IN_A[n2 - 1], j = IN_A[n2];
      if (g.line[i] === g.line[j]) { g.sp = g.ax[j] - g.ax[i] - g.aw[i]; break; }
    }
    g.lines = Math.max(...IN_A.map((i) => g.line[i])) + 1;
    // a strike runs on through the space to the next struck word, when that word is on the same line
    IN_A.forEach((i, n2) => {
      const j = IN_A[n2 + 1];
      if (j !== undefined && TOKS[i].kind === 'cut' && TOKS[j].kind === 'cut' && TOKS[j].edit === TOKS[i].edit && g.line[j] === g.line[i]) g.gapA[i] = g.sp;
    });
    IN_B.forEach((i, n2) => {
      const j = IN_B[n2 + 1];
      if (j !== undefined && TOKS[i].kind === 'add' && TOKS[j].kind === 'add' && TOKS[j].edit === TOKS[i].edit && g.by[j] === g.by[i]) g.gapB[i] = g.sp;
    });
    EDITS.forEach((e, k) => {
      let len = 0;
      for (const i of e.cuts) { g.cutAt[i] = len; len += g.aw[i] + g.gapA[i]; }
      g.cutLen[k] = len;
    });
    geo.current = g;
  }, []);

  // lays every word out for the edit's current point, t
  const paint = useCallback(() => {
    const g = geo.current, b0 = box.current;
    if (!g || !b0) return;
    const tt = t.current, { em, sp } = g;
    const narrow = g.w < 520, S = narrow ? 0.5 : 0.42, lhA = narrow ? 1.95 : 1.75; // insertion size, draft spacing
    const lineB = LH * em, lineA = lhA * em, pad = (lhA - LH) * em * 0.72, cap = em * 0.98;
    const spread = ease(clamp(tt / SPREAD));
    const gone = clamp((tt - TAKE) / 0.05); // struck words fade first
    const r = glide(clamp((tt - TAKE - 0.03) / (TAKEN - TAKE - 0.03))); // then everything settles
    // the lines spread apart to make room for the edits, and the paragraph closes up once they're taken
    const yA = (i: number) => mix(g.line[i] * lineB, g.line[i] * lineA + pad, spread);
    b0.style.height = `${mix(mix(g.lines * lineB, g.lines * lineA, spread), g.hb, r).toFixed(1)}px`;

    // each insertion is written above the first word it replaces, kept inside the column
    const ann = EDITS.map((e) => {
      const f = e.cuts[0];
      let len = 0;
      const offs = e.adds.map((i, j) => { const o = len; len += g.bw[i] + (j < e.adds.length - 1 ? sp : 0); return o; });
      return { x: Math.min(g.ax[f], Math.max(0, g.w - len * S)), y: yA(f) - lineB * S * 0.9, len, offs };
    });

    TOKS.forEach((tok, i) => {
      const el = els.current[i];
      if (!el) return;
      if (tok.kind === 'keep') {
        el.style.transform = `translate3d(${mix(g.ax[i], g.bx[i], r).toFixed(1)}px, ${mix(yA(i), g.by[i], r).toFixed(1)}px, 0)`;
        return;
      }
      const k = tok.edit;
      if (tok.kind === 'cut') {
        const s = clamp((clamp((tt - strikeAt(k)) / STRIKE) * g.cutLen[k] - g.cutAt[i]) / (g.aw[i] + g.gapA[i]));
        el.style.transform = `translate3d(${g.ax[i].toFixed(1)}px, ${yA(i).toFixed(1)}px, 0)`;
        el.style.setProperty('--s', s.toFixed(3));
        el.style.setProperty('--g', `${g.gapA[i]}px`);
        el.style.opacity = (1 - gone).toFixed(3);
        el.style.pointerEvents = s > 0 && gone < 1 ? 'auto' : 'none';
        return;
      }
      const a = ann[k], o = a.offs[EDITS[k].adds.indexOf(i)];
      const f = clamp((clamp((tt - typeAt(k)) / TYPE) * a.len - o) / g.bw[i]); // how much of it is written
      el.style.transform = `translate3d(${mix(a.x + o * S, g.bx[i], r).toFixed(1)}px, ${mix(a.y, g.by[i], r).toFixed(1)}px, 0) scale(${mix(S, 1, r).toFixed(4)})`;
      el.style.clipPath = f >= 1 ? '' : `inset(-40% ${((1 - f) * 100).toFixed(2)}% -40% 0)`;
      el.style.opacity = f > 0 ? '1' : '0';
      el.style.setProperty('--gb', `${g.gapB[i]}px`);
      el.style.pointerEvents = f > 0 ? 'auto' : 'none';
    });

    // the cursor: at the stroke's front while striking, at the pen while writing in, travelling in between
    const c0 = caret.current;
    if (c0) {
      const start = (k: number) => { const f = EDITS[k].cuts[0]; return [g.ax[f], yA(f) + (lineB - cap) / 2, cap]; };
      const pen = (k: number, len: number) => [ann[k].x + len * S, ann[k].y + ((lineB - cap) / 2) * S, cap * S];
      const front = (k: number, len: number) => {
        const cuts = EDITS[k].cuts;
        for (const i of cuts) {
          if (len <= g.cutAt[i] + g.aw[i] || i === cuts[cuts.length - 1]) return [g.ax[i] + Math.min(g.aw[i], Math.max(0, len - g.cutAt[i])), yA(i) + (lineB - cap) / 2, cap];
        }
        return start(k);
      };
      let c = start(0);
      for (let k = 0; k < EDITS.length; k++) {
        if (tt < strikeAt(k)) {
          if (k) {
            const u = ease(clamp((tt - typedBy(k - 1)) / (strikeAt(k) - typedBy(k - 1)))), p = pen(k - 1, ann[k - 1].len), q = start(k);
            c = p.map((v, n) => mix(v, q[n], u));
          }
          break;
        }
        if (tt < strikeAt(k) + STRIKE) { c = front(k, clamp((tt - strikeAt(k)) / STRIKE) * g.cutLen[k]); break; }
        c = pen(k, clamp((tt - typeAt(k)) / TYPE) * ann[k].len);
        if (tt < typedBy(k)) break;
      }
      c0.style.transform = `translate3d(${c[0].toFixed(1)}px, ${c[1].toFixed(1)}px, 0)`;
      c0.style.height = `${c[2].toFixed(1)}px`;
      c0.style.opacity = (clamp(tt / 0.015) * (1 - clamp((tt - TAKE) / 0.03))).toFixed(3);
    }
  }, []);

  // eases the edit to `to` over `ms` (the timeline has its own pacing inside)
  const run = useCallback((to: number, ms: number) => {
    cancelAnimationFrame(raf.current);
    const from = t.current, t0 = performance.now();
    const step = (now: number) => {
      const k = ms > 0 ? Math.min(1, (now - t0) / ms) : 1;
      t.current = from + (to - from) * k;
      paint();
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [paint]);

  // measure once the type has loaded, and again on resize
  useEffect(() => {
    calm.current = reduced();
    if (calm.current) t.current = MARKED;
    const fit = () => { measure(); paint(); };
    fit();
    setReady(true);
    let live = true;
    document.fonts?.ready.then(() => { if (live) fit(); });
    window.addEventListener('resize', fit);
    return () => { live = false; window.removeEventListener('resize', fit); };
  }, [measure, paint]);

  // it plays by itself once it's in view, pausing if you scroll away before it's done
  useEffect(() => {
    const el = sec.current;
    if (!el || calm.current) return;
    let wait = 0;
    const io = new IntersectionObserver(([e]) => {
      clearTimeout(wait);
      if (e.isIntersecting) {
        if (t.current < 1) wait = window.setTimeout(() => run(1, (1 - t.current) * AUTOPLAY), t.current > 0 ? 200 : 600);
      } else cancelAnimationFrame(raf.current);
    }, { threshold: 0.45 });
    io.observe(el);
    return () => { clearTimeout(wait); io.disconnect(); cancelAnimationFrame(raf.current); };
  }, [run]);

  return (
    <section ref={sec} className="bcx" id="compare" aria-label="Before and after">
      <p className="bcx-sr">
        Before Gradient: {IN_A.map((i) => TOKS[i].text).join(' ')} With Gradient: {IN_B.map((i) => TOKS[i].text).join(' ')}
      </p>
      <div ref={box} className={`bcx-text${ready ? ' is-ready' : ''}`} aria-hidden="true">
        <p ref={ma} className="bcx-m is-a">{words(IN_A)}</p>
        <p ref={mb} className="bcx-m is-b">{words(IN_B)}</p>
        {TOKS.map((tok, i) => (
          <span
            key={i}
            ref={(n) => { els.current[i] = n; }}
            className={`bcx-v is-${tok.kind}${tok.edit >= 0 && tok.edit === hot ? ' is-hot' : ''}`}
            onPointerEnter={tok.edit >= 0 ? () => setHot(tok.edit) : undefined}
            onPointerLeave={tok.edit >= 0 ? () => setHot(-1) : undefined}
          >
            {tok.text}
          </span>
        ))}
        <span ref={caret} className="bcx-caret"><i>Gradient</i></span>
      </div>
    </section>
  );
}
