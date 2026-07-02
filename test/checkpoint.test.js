// test/checkpoint.test.js — M1: checkpoint persistence (disk round-trip + resume via disk).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRun, advance, runToCompletion, runWorkflow } from '../lib/engine.js';
import { saveCheckpoint, loadCheckpoint } from '../lib/checkpoint.js';

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'loom-ckpt-'));
}

test('saveCheckpoint writes checkpoint.json; loadCheckpoint reads it back identically', () => {
  const dir = tmpDir();
  let st = createRun('idea X');
  st = advance(st);
  saveCheckpoint(st, dir);
  assert.ok(fs.existsSync(path.join(dir, 'checkpoint.json')));
  const loaded = loadCheckpoint(dir);
  assert.deepEqual(loaded, st);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('FR-3 via disk: interrupt -> save -> load -> resume -> identical to uninterrupted run', () => {
  const dir = tmpDir();
  const full = runWorkflow('idea X');
  let st = createRun('idea X');
  st = advance(st); // interrupted after 1 phase
  saveCheckpoint(st, dir);
  const resumed = runToCompletion(loadCheckpoint(dir));
  assert.equal(resumed.status, 'complete');
  assert.deepEqual(resumed.artifacts, full.artifacts);
  fs.rmSync(dir, { recursive: true, force: true });
});
