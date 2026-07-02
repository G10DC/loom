// test/adapters.test.js — M2: uniform adapter interface; default + no-op + custom.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultAdapters, noopAdapter, makeAdapter } from '../lib/adapters.js';
import { createRun, advance, runToCompletion, runWorkflow } from '../lib/engine.js';
import { render } from '../lib/phases.js';

test('default adapters expose the uniform { name, run } shape and return { output, artifact }', () => {
  for (const name of Object.keys(defaultAdapters)) {
    const a = defaultAdapters[name];
    assert.equal(a.name, name);
    const res = a.run({ intent: 'X' }, {});
    assert.equal(typeof res.output, 'string');
    assert.equal(typeof res.artifact, 'string');
  }
});

test('a phase runs via the no-op adapter with the SAME interface as the default', () => {
  const adapters = { ...defaultAdapters, brainstorm: noopAdapter('brainstorm') };
  let st = createRun('idea X');
  st = advance(st, { adapters });
  assert.match(st.artifacts['brainstorm.md'], /\(no-op adapter\)/);
  // interface parity: both return { output, artifact }
  assert.deepEqual(
    Object.keys(defaultAdapters.brainstorm.run({ intent: 'X' }, {})),
    Object.keys(noopAdapter('brainstorm').run({ intent: 'X' }, {})),
  );
});

test('default adapters reproduce the deterministic templates (M0/M1 parity)', () => {
  assert.equal(defaultAdapters.verify.run({ intent: 'idea X' }, {}).artifact, render('verify', 'idea X'));
});

test('a custom adapter (compose an external skill) drops in without touching the engine', () => {
  const external = makeAdapter('spec', ({ intent }) => ({
    output: 'delegated',
    artifact: `# Spec\n\nIntent: ${intent}\n\n(delegated to an external skill)\n`,
  }));
  const adapters = { ...defaultAdapters, spec: external };
  let st = createRun('idea X');
  st = advance(st, { adapters }); // brainstorm
  st = advance(st, { adapters }); // spec -> custom
  assert.match(st.artifacts['spec.md'], /delegated to an external skill/);
  st = runToCompletion(st, { adapters });
  assert.equal(st.status, 'complete');
  assert.equal(st.completed.length, 5);
});

test('full run with default adapters matches runWorkflow output', () => {
  const viaDefault = runToCompletion(createRun('idea X'), { adapters: defaultAdapters }).artifacts;
  assert.deepEqual(viaDefault, runWorkflow('idea X').artifacts);
});
