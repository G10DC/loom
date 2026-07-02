// lib/adapters.js — M2: phase execution adapters. Uniform interface so each phase can delegate to
// any external skill. The default adapter reproduces the M0/M1 templates; a no-op adapter is the
// smoke-test stand-in. Real adapters (anthropics/skills / wshobson/agents) drop in with the same shape.

import { PHASES, render } from './phases.js';

/**
 * @typedef {(input: { intent: string, prevArtifact?: string }, ctx: object) => { output: string, artifact: string }} AdapterRun
 * @typedef {{ name: string, run: AdapterRun }} PhaseAdapter
 */

/** The default per-phase adapters (deterministic markdown templates). */
export const defaultAdapters = Object.fromEntries(
  PHASES.map((phase) => [
    phase,
    {
      name: phase,
      run: ({ intent }) => ({ output: 'ok', artifact: render(phase, intent) }),
    },
  ]),
);

/** Builds a no-op adapter for smoke tests: emits a minimal markdown artifact carrying the intent. */
export function noopAdapter(name) {
  return {
    name,
    run: ({ intent }) => ({ output: 'noop', artifact: `# ${name}\n\nIntent: ${intent}\n\n(no-op adapter)\n` }),
  };
}

/** Builds a custom adapter from a run function (for real external-skill delegation). */
export function makeAdapter(name, run) {
  return { name, run };
}
