// test/mode.test.js — M6: assist (await confirm) vs autopilot.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, advance, runToCompletion, runWorkflow } from '../lib/engine.js';

test('assist mode: advance awaits confirmation before accepting a phase', () => {
  let st = createRun('X', { mode: 'assist' });
  st = advance(st); // no confirmation
  assert.equal(st.status, 'awaiting-confirm');
  assert.equal(st.awaitingConfirm, 'brainstorm');
  assert.deepEqual(st.completed, []); // phase not accepted yet
  assert.match(st.log.at(-1), /awaiting confirm/);
});

test('assist mode: confirming accepts the phase, clears the await, moves on', () => {
  let st = createRun('X', { mode: 'assist' });
  st = advance(st, { confirmed: true });
  assert.deepEqual(st.completed, ['brainstorm']);
  assert.equal(st.status, 'running');
  assert.equal(st.awaitingConfirm, undefined);
});

test('autopilot (default) never awaits and completes like M0', () => {
  const st = runToCompletion(createRun('X'));
  assert.equal(st.status, 'complete');
  assert.equal(st.mode, 'autopilot');
});

test('FR-8: both modes complete the spine on the same input with identical results', () => {
  const auto = runToCompletion(createRun('X', { mode: 'autopilot' }));
  let st = createRun('X', { mode: 'assist' });
  while (st.status !== 'complete') st = advance(st, { confirmed: true });
  assert.equal(st.status, 'complete');
  assert.deepEqual(auto.completed, st.completed);
  assert.deepEqual(auto.artifacts, st.artifacts);
});

test('runWorkflow (autopilot convenience) still completes', () => {
  assert.equal(runWorkflow('X').status, 'complete');
});
