// test/gates.test.js — M3: iron-law gates (block missing evidence; escape hatch overrides).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { permissiveGate, strictGate, ironLawGate } from '../lib/gates.js';
import { createRun, runToCompletion } from '../lib/engine.js';
import { defaultAdapters, makeAdapter } from '../lib/adapters.js';

test('permissiveGate passes everything', () => {
  assert.deepEqual(permissiveGate('any', {}), { pass: true, reason: 'no gate' });
});

test('strict gate blocks a phase whose artifact lacks required evidence', () => {
  const gate = strictGate({
    build: (ev) => (/failing test/i.test(ev.artifact) ? true : { pass: false, reason: 'no failing test' }),
  });
  const adapters = {
    ...defaultAdapters,
    build: makeAdapter('build', ({ intent }) => ({ output: 'x', artifact: `# Tests\n\nIntent: ${intent}\n\n(no tests yet)\n` })),
  };
  const st = runToCompletion(createRun('idea X'), { gate, adapters });
  assert.equal(st.status, 'blocked');
  assert.equal(st.blocked.phase, 'build');
  assert.match(st.blocked.reason, /failing test/);
});

test('strict gate passes when the default artifact carries the marker', () => {
  const gate = strictGate({
    build: (ev) => (/failing test/i.test(ev.artifact) ? true : { pass: false, reason: 'no failing test' }),
  });
  const st = runToCompletion(createRun('idea X'), { gate }); // default adapters contain "failing test"
  assert.equal(st.status, 'complete');
  assert.equal(st.gateResults.build.pass, true);
});

test('escape hatch (force) overrides a blocked gate, completes, and logs the override', () => {
  const gate = strictGate({ build: () => ({ pass: false, reason: 'no failing test' }) });
  let st = runToCompletion(createRun('idea X'), { gate });
  assert.equal(st.status, 'blocked');
  st = runToCompletion(st, { gate, force: true });
  assert.equal(st.status, 'complete');
  assert.match(st.log.join(' | '), /build -> forced/);
  assert.equal(st.gateResults.build.reason, 'forced (escape hatch)');
});

test('ironLawGate (reference set) lets a default run complete', () => {
  const st = runToCompletion(createRun('idea X'), { gate: ironLawGate });
  assert.equal(st.status, 'complete');
});
