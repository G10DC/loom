// test/store.test.js — M4: versioned artifact store (no silent overwrite; read-by-name).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, canReadPrev } from '../lib/store.js';

test('save appends a version; get returns the latest', () => {
  const s = createStore();
  s.save('spec.md', 'v1');
  s.save('spec.md', 'v2');
  assert.equal(s.versions('spec.md'), 2);
  assert.equal(s.get('spec.md'), 'v2');
});

test('no silent overwrite: an earlier version is still retrievable', () => {
  const s = createStore();
  s.save('spec.md', 'first');
  s.save('spec.md', 'second');
  assert.equal(s.get('spec.md', 1), 'first');
  assert.equal(s.get('spec.md', 2), 'second');
  assert.notEqual(s.get('spec.md', 1), s.get('spec.md'));
});

test('get of an unknown name returns null', () => {
  assert.equal(createStore().get('nope.md'), null);
});

test('FR-6 read-by-name: phase N+1 can read phase N artifact by name', () => {
  const s = createStore();
  s.save('brainstorm.md', '# Brainstorm\n...');
  assert.equal(canReadPrev(s, 'brainstorm.md'), true);
  assert.equal(canReadPrev(s, 'spec.md'), false);
});

test('list enumerates saved artifact names', () => {
  const s = createStore();
  s.save('a.md', 'x');
  s.save('b.md', 'y');
  assert.deepEqual(s.list().sort(), ['a.md', 'b.md']);
});
