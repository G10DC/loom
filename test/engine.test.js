// test/engine.test.js — M0: hardcoded 5-phase spine emits markdown artifacts in order.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runWorkflow } from '../lib/engine.js';

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
