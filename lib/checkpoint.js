// lib/checkpoint.js
// M1 — checkpoint persistence (disk I/O). The state machine in lib/engine.js is pure; this module
// is the only place that touches the filesystem for run state.

import fs from 'node:fs';
import path from 'node:path';
import { serialize, deserialize } from './engine.js';

/**
 * Persists a run state to <dir>/checkpoint.json (overwrites). Creates the dir if missing.
 * @param {import('./engine.js').RunState} state
 * @param {string} dir
 */
export function saveCheckpoint(state, dir) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'checkpoint.json'), serialize(state));
}

/**
 * Loads a run state from <dir>/checkpoint.json.
 * @param {string} dir
 * @returns {import('./engine.js').RunState}
 */
export function loadCheckpoint(dir) {
  return deserialize(fs.readFileSync(path.join(dir, 'checkpoint.json'), 'utf-8'));
}
