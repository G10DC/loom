// test/engine.test.js — M0: hardcoded 5-phase spine emits markdown artifacts in order.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  runWorkflow,
  createRun,
  advance,
  runToCompletion,
  serialize,
  deserialize,
} from '../lib/engine.js';

test('runWorkflow runs the 5-phase spine in fixed order', () => {
  const { phases } = runWorkflow('build a CLI todo app');
  assert.deepEqual(phases, ['brainstorm', 'spec', 'plan', 'build', 'verify']);
});

test('runWorkflow emits one markdown artifact per phase, with stable names', () => {
  const { artifacts } = runWorkflow('build a CLI todo app');
  assert.deepEqual(
    Object.keys(artifacts),
    ['brainstorm.md', 'spec.md', 'plan.md', 'tests.md', 'report.md'],
  );
});

test('every artifact is markdown (starts with a heading) and carries the intent', () => {
  const { artifacts } = runWorkflow('build a CLI todo app');
  for (const [name, doc] of Object.entries(artifacts)) {
    assert.match(doc, /^#\s/m, `${name} must start with a markdown heading`);
    assert.match(doc, /build a CLI todo app/, `${name} must reference the intent`);
  }
});

test('runWorkflow is deterministic + offline (same intent -> identical output, no network)', () => {
  const a = runWorkflow('idea X');
  const b = runWorkflow('idea X');
  assert.deepEqual(a, b);
  assert.equal(a.status, 'complete');
});

test('the verify phase report references the iron-law gates', () => {
  const { artifacts } = runWorkflow('idea X');
  assert.match(artifacts['report.md'], /root cause|verify|failing test/i);
});

// ── M1: state machine + checkpoint/resume ──────────────────────────────────────────────

test('createRun yields the initial state: nothing done, all phases pending, running', () => {
  const st = createRun('idea X');
  assert.equal(st.intent, 'idea X');
  assert.deepEqual(st.completed, []);
  assert.deepEqual(st.pending, ['brainstorm', 'spec', 'plan', 'build', 'verify']);
  assert.equal(st.status, 'running');
});

test('advance runs exactly one phase: completes it, logs the transition, moves it out of pending', () => {
  let st = createRun('idea X');
  st = advance(st);
  assert.deepEqual(st.completed, ['brainstorm']);
  assert.deepEqual(st.pending, ['spec', 'plan', 'build', 'verify']);
  assert.ok(st.artifacts['brainstorm.md'], 'artifact produced');
  assert.deepEqual(st.log, ['brainstorm -> done']);
  assert.equal(st.status, 'running');
});

test('five advances complete the run; advance is idempotent once complete', () => {
  let st = createRun('idea X');
  for (let i = 0; i < 5; i++) st = advance(st);
  assert.equal(st.status, 'complete');
  assert.deepEqual(st.pending, []);
  assert.equal(st.completed.length, 5);
  const done = st;
  const again = advance(done); // no-op at complete
  assert.equal(again.status, 'complete');
  assert.deepEqual(again.completed, done.completed);
});

test('serialize -> deserialize is a lossless round-trip', () => {
  let st = createRun('idea X');
  st = advance(st);
  st = advance(st);
  assert.deepEqual(deserialize(serialize(st)), st);
});

test('FR-3: resume after interruption yields artifacts IDENTICAL to an uninterrupted run', () => {
  const full = runWorkflow('idea X'); // uninterrupted reference
  let st = createRun('idea X');
  st = advance(st);
  st = advance(st); // interrupted after 2 phases
  const resumed = runToCompletion(deserialize(serialize(st))); // checkpoint + resume
  assert.equal(resumed.status, 'complete');
  assert.deepEqual(resumed.artifacts, full.artifacts);
  assert.deepEqual(resumed.completed, ['brainstorm', 'spec', 'plan', 'build', 'verify']);
});

