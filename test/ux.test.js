// test/ux.test.js — M7: status query, intervene (skip), override+resume.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, advance, runToCompletion } from '../lib/engine.js';
import { ironLawGate } from '../lib/gates.js';
import { defaultAdapters, makeAdapter } from '../lib/adapters.js';
import { status, skip, override } from '../lib/ux.js';

test('status reports current phase + progress mid-flight', () => {
  let st = createRun('X');
  st = advance(st); // brainstorm done
  const s = status(st);
  assert.equal(s.phase, 'spec');
  assert.deepEqual(s.completed, ['brainstorm']);
  assert.deepEqual(s.pending, ['spec', 'plan', 'build', 'verify']);
  assert.equal(s.status, 'running');
  assert.deepEqual(s.artifacts, ['brainstorm.md']);
});

test('status at complete reports no current phase', () => {
  const st = runToCompletion(createRun('X'));
  const s = status(st);
  assert.equal(s.phase, null);
  assert.equal(s.status, 'complete');
  assert.deepEqual(s.completed, ['brainstorm', 'spec', 'plan', 'build', 'verify']);
});

test('intervene: skip drops the current phase; resume continues without it', () => {
  let st = createRun('X');
  st = advance(st); // brainstorm done
  st = skip(st); // skip spec
  assert.deepEqual(st.pending, ['plan', 'build', 'verify']);
  assert.match(st.log.at(-1), /spec -> skipped/);
  st = runToCompletion(st);
  assert.equal(st.status, 'complete');
  assert.ok(!st.completed.includes('spec'));
});

test('override + resume unblocks a gated run', () => {
  const adapters = {
    ...defaultAdapters,
    build: makeAdapter('build', ({ intent }) => ({ output: 'x', artifact: `# Tests\n\nIntent: ${intent}\n\n(no marker)\n` })),
  };
  let st = runToCompletion(createRun('X'), { gate: ironLawGate, adapters }); // blocked at build
  assert.equal(st.status, 'blocked');
  st = override(st, { gate: ironLawGate, adapters });
  assert.equal(st.status, 'complete');
});

test('skip at complete is a no-op', () => {
  const st = runToCompletion(createRun('X'));
  assert.equal(skip(st).status, 'complete');
});
