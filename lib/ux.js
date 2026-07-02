// lib/ux.js — M7: UX / progress. Query and control a run mid-flight: status(), skip() (intervene),
// override() (escape-hatch a blocked gate and resume). Pure helpers over the run state.

import { runToCompletion } from './engine.js';

/** Summarizes a run for display: current phase, progress, gate state, artifact list. */
export function status(state) {
  return {
    status: state.status,
    mode: state.mode,
    phase: state.pending[0] ?? null,
    completed: [...state.completed],
    pending: [...state.pending],
    blocked: state.blocked ?? null,
    artifacts: Object.keys(state.artifacts),
    gates: state.gateResults,
  };
}

/** Intervene: drop the current (next) phase without running it. No-op at complete. */
export function skip(state) {
  if (state.status === 'complete' || state.pending.length === 0) return state;
  const [dropped, ...rest] = state.pending;
  const clearedAwait = dropped === state.awaitingConfirm;
  const next = {
    ...state,
    pending: rest,
    status: rest.length === 0 ? 'complete' : clearedAwait ? 'running' : state.status,
    log: [...state.log, `${dropped} -> skipped`],
  };
  if (clearedAwait) delete next.awaitingConfirm;
  return next;
}

/** Escape-hatch a blocked gate and resume to completion (forces the blocked phase). */
export function override(state, deps = {}) {
  return runToCompletion(state, { ...deps, force: true });
}
