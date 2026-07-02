// test/budget.test.js — M5: per-phase budget + shouldCompact thresholds.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBudget } from '../lib/budget.js';

test('track accumulates per phase and total', () => {
  const b = createBudget();
  b.track('brainstorm', 1000);
  b.track('brainstorm', 500);
  b.track('spec', 2000);
  assert.equal(b.phase('brainstorm'), 1500);
  assert.equal(b.phase('spec'), 2000);
  assert.equal(b.total(), 3500);
});

test('shouldCompact: within budget when below warn threshold', () => {
  const b = createBudget();
  b.track('brainstorm', 1000);
  const v = b.shouldCompact();
  assert.equal(v.compact, false);
  assert.match(v.reason, /within budget/);
});

test('shouldCompact: warns (compact=false) between warn and compact thresholds', () => {
  const b = createBudget({ warnAt: 1000, compactAt: 2000 });
  b.track('brainstorm', 1500);
  const v = b.shouldCompact();
  assert.equal(v.compact, false);
  assert.match(v.reason, /warn/);
});

test('shouldCompact: compact=true at/above the compact threshold', () => {
  const b = createBudget({ warnAt: 1000, compactAt: 2000 });
  b.track('brainstorm', 2000);
  const v = b.shouldCompact();
  assert.equal(v.compact, true);
  assert.match(v.reason, /compact/);
});

test('budget is advisory: tracking never mutates external state (conclusions live elsewhere)', () => {
  const b = createBudget();
  b.track('brainstorm', 999_999);
  assert.equal(b.shouldCompact().compact, true);
  // nothing was destroyed; the number is just reported
  assert.equal(b.total(), 999_999);
});
