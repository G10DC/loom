#!/usr/bin/env node
// scripts/run.mjs — dry run: weave the spine for an intent and write artifacts to runs/<ts>/.
// Usage: node scripts/run.mjs "<intent>"

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { runWorkflow } from '../lib/engine.js';

function ts() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function main() {
  const intent = process.argv.slice(2).join(' ').trim() || 'untitled idea';
  const { phases, artifacts, status } = runWorkflow(intent);
  const dir = path.resolve('runs', ts());
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, doc] of Object.entries(artifacts)) fs.writeFileSync(path.join(dir, name), doc);
  console.log(`loom -> ${status} | ${phases.join(' -> ')}`);
  console.log(`artifacts written to ${dir}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
