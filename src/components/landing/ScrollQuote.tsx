'use client';
// Scroll-pinned word-by-word color reveal.
// Section pins to viewport, words transition from --ink-faint to --ink as scroll progresses.
import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

const QUOTE = `“We replaced six WhatsApp groups with Gradient. On day three our supplier called to ask what changed. Orders had doubled.”`;
const ATTRIB = { name: 'Ananya Kapoor', role: 'Founder · Third Wave Coffee Roasters' };

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const color = useTransform(progress, range, ['#CDC6BB', '#221F1B']);
  return (
    <motion.span style={{ color, marginRight: '0.22em', display: 'inline-block', transition: 'color 60ms linear' }}>
      {word}
    </motion.span>
  );
}

export function LScrollQuote() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Outer 160vh, sticky 100vh → pinned phase ends at progress ~0.375.
  // Reveal + attribution finish before that so nothing pops after it unpins.
  const attribOpacity = useTransform(scrollYProgress, [0.27, 0.35], [0, 1]);
  const attribY = useTransform(scrollYProgress, [0.27, 0.35], [12, 0]);

  const words = QUOTE.split(' ');
  const PACK_START = 0.04;
  const PACK_END = 0.24;            // last word fully inked by progress 0.24
  const slice = (PACK_END - PACK_START) / words.length;

  return (
    <section ref={ref} className="sq-outer">
      <div className="sq-sticky">
        <p className="sq-quote">
          {words.map((w, i) => {
            const start = PACK_START + i * slice;
            const end = start + slice * 1.8;
            return <Word key={i} word={w} progress={scrollYProgress} range={[start, end]} />;
          })}
        </p>
        <motion.div className="sq-attrib" style={{ opacity: attribOpacity, y: attribY }}>
          <div className="sq-name">{ATTRIB.name}</div>
          <div className="sq-role">{ATTRIB.role}</div>
        </motion.div>
      </div>
    </section>
  );
}
