// Run: node --test --experimental-strip-types src/lib/utils.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { cn } from './utils.ts';

test('joins strings and drops falsy values', () => {
  assert.equal(cn('a', false, null, undefined, '', 0, 'b'), 'a b');
});

test('conditional && pattern used at call sites', () => {
  const isSweeping = false;
  assert.equal(cn('ghost-type-accepted font-inherit not-italic', isSweeping && 'relative inline-block'), 'ghost-type-accepted font-inherit not-italic');
  assert.equal(cn('x', true && 'relative inline-block'), 'x relative inline-block');
});

test('undefined className (optional prop)', () => {
  assert.equal(cn('absolute aspect-square', undefined), 'absolute aspect-square');
  assert.equal(cn('relative select-none', 'ghost-type-inline', 'sup-hero-headline'), 'relative select-none ghost-type-inline sup-hero-headline');
});

test('arrays, nested arrays, objects, numbers (clsx parity)', () => {
  assert.equal(cn(['a', ['b', false, 'c']], { d: true, e: 0, f: 'yes' }, 7), 'a b c d f 7');
  assert.equal(cn(), '');
});
