// test/validation.test.js — characterization tests: each test asserts a HYPOTHESIS about expected
// behavior derived from the code. A failure here means the code does NOT guarantee that property
// (a latent gap or bug to resolve via red-green-refactor, or an edge case to document).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  createRun, advance, runToCompletion, runWorkflow, serialize, deserialize,
} from '../lib/engine.js';
import { defaultAdapters, noopAdapter } from '../lib/adapters.js';
import { PHASES, ARTIFACT_NAMES } from '../lib/phases.js';
import { strictGate, ironLawGate } from '../lib/gates.js';
import { createStore } from '../lib/store.js';
import { saveCheckpoint, loadCheckpoint } from '../lib/checkpoint.js';
import { status, skip, override } from '../lib/ux.js';

// ── H-IMMUTABLE: advance must NOT mutate the input state ─────────────────────────────────
test('H-IMMUTABLE: advance returns a new state and leaves the input untouched', () => {
  const before = createRun('idea X');
  const snapshot = JSON.stringify(before);
  const after = advance(before);
  assert.notEqual(after, before, 'a new object is returned');
  assert.equal(JSON.stringify(before), snapshot, 'input state is not mutated');
});

// ── H-SERIALIZE-RICH: round-trip preserves a RICH state (blocked + gateResults + log) ─────
test('H-SERIALIZE-RICH: serialize/deserialize preserves a blocked state with gateResults + log', () => {
  const gate = strictGate({ build: () => ({ pass: false, reason: 'no failing test' }) });
  const blocked = runToCompletion(createRun('idea X'), { gate });
  assert.equal(blocked.status, 'blocked');
  const round = deserialize(serialize(blocked));
  assert.deepEqual(round, blocked);
});

// ── H-ADAPTERS-COMPLETE: defaultAdapters has exactly one adapter per phase ────────────────
test('H-ADAPTERS-COMPLETE: defaultAdapters covers every phase, no more no less', () => {
  assert.equal(Object.keys(defaultAdapters).length, PHASES.length);
  for (const p of PHASES) {
    assert.ok(defaultAdapters[p], `missing adapter for ${p}`);
    assert.equal(defaultAdapters[p].name, p);
  }
});

// ── H-ARTIFACT-UNIQUE: artifact filenames are unique; a full run yields exactly 5 ─────────
test('H-ARTIFACT-UNIQUE: ARTIFACT_NAMES values are unique and runWorkflow yields exactly PHASES.length artifacts', () => {
  const names = Object.values(ARTIFACT_NAMES);
  assert.equal(new Set(names).size, names.length);
  const { artifacts } = runWorkflow('idea X');
  assert.equal(Object.keys(artifacts).length, PHASES.length);
});

// ── H-GATE-VERIFY: ironLawGate blocks verify when the report lacks the 'complete' marker ──
test('H-GATE-VERIFY: ironLawGate blocks verify without a complete-marker report', () => {
  const adapters = {
    ...defaultAdapters,
    verify: { name: 'verify', run: ({ intent }) => ({ output: 'x', artifact: `# Report\n\nIntent: ${intent}\n\n(not done)\n` }) },
  };
  const st = runToCompletion(createRun('idea X'), { gate: ironLawGate, adapters });
  assert.equal(st.status, 'blocked');
  assert.equal(st.blocked.phase, 'verify');
});

// ── H-GATE-EMPTY: strictGate({}) passes every phase ──────────────────────────────────────
test('H-GATE-EMPTY: strictGate with no rules passes every phase to completion', () => {
  const st = runToCompletion(createRun('idea X'), { gate: strictGate({}) });
  assert.equal(st.status, 'complete');
});

// ── H-STORE-VERSION: save returns a monotonically increasing version; get latest vs version ─
test('H-STORE-VERSION: save returns {name, version} increasing; get distinguishes versions', () => {
  const s = createStore();
  const r1 = s.save('a.md', 'one');
  const r2 = s.save('a.md', 'two');
  assert.deepEqual(r1, { name: 'a.md', version: 1 });
  assert.deepEqual(r2, { name: 'a.md', version: 2 });
  assert.equal(s.get('a.md'), 'two');
  assert.equal(s.get('a.md', 1), 'one');
});

// ── H-STORE-VERSION-EDGE: get(name, 0) and out-of-range version return null ───────────────
test('H-STORE-VERSION-EDGE: version 0 / out-of-range / unknown name return null', () => {
  const s = createStore();
  s.save('a.md', 'only');
  assert.equal(s.get('a.md', 0), null);
  assert.equal(s.get('a.md', 99), null);
  assert.equal(s.get('missing.md'), null);
});

// ── H-LOAD-MISSING: loadCheckpoint on a dir without checkpoint.json throws ───────────────
test('H-LOAD-MISSING: loadCheckpoint throws when no checkpoint.json exists', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'loom-empty-'));
  assert.throws(() => loadCheckpoint(dir));
  fs.rmSync(dir, { recursive: true, force: true });
});

// ── H-SKIP-LAST: skipping the only remaining pending phase completes the run ─────────────
test('H-SKIP-LAST: skip on the last pending phase transitions to complete', () => {
  let st = createRun('idea X');
  st.completed = PHASES.slice(0, 4);
  st.pending = ['verify'];
  st = skip(st);
  assert.equal(st.status, 'complete');
  assert.deepEqual(st.pending, []);
});

// ── H-SKIP-AWAITING: skipping the phase being awaited must NOT leave a stale await ─────────
test('H-SKIP-AWAITING: skip on awaiting-confirm clears the stale await and resumes running', () => {
  let st = createRun('idea X', { mode: 'assist' });
  st = advance(st); // -> awaiting-confirm on 'brainstorm'
  assert.equal(st.status, 'awaiting-confirm');
  st = skip(st); // drop the awaited phase
  assert.notEqual(st.status, 'awaiting-confirm', 'no stale await after skipping the awaited phase');
  assert.ok(!st.awaitingConfirm || !st.pending.includes(st.awaitingConfirm), 'awaited phase is gone');
});

// ── H-ADVANCE-PARTIAL-ADAPTERS: a missing adapter for a phase is surfaced (no silent undefined) ──
test('H-ADVANCE-PARTIAL-ADAPTERS: advancing a phase with no adapter fails loudly (no silent undefined artifact)', () => {
  const partial = { ...defaultAdapters };
  delete partial.spec;
  let st = createRun('idea X');
  st = advance(st); // brainstorm ok
  assert.throws(() => advance(st, { adapters: partial }), /spec|undefined|Cannot read|adapter/i);
});
