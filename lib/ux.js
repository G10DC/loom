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

/** Intervene: drop the current (next) phase without running it. Clears any suspended flag
 *  (blocked / awaitingConfirm) that pointed at the dropped phase, so the state stays consistent. */
export function skip(state) {
  if (state.status === 'complete' || state.pending.length === 0) return state;
  const [dropped, ...rest] = state.pending;
  const clearingBlocked = state.blocked?.phase === dropped;
  const clearingAwait = state.awaitingConfirm === dropped;
  const next = {
    ...state,
    pending: rest,
    status: rest.length === 0 ? 'complete' : clearingBlocked || clearingAwait ? 'running' : state.status,
    log: [...state.log, `${dropped} -> skipped`],
  };
  if (clearingBlocked) delete next.blocked;
  if (clearingAwait) delete next.awaitingConfirm;
  return next;
}

/** Escape-hatch: force through gates AND confirm through awaits, then resume to completion. */
export function override(state, deps = {}) {
  return runToCompletion(state, { ...deps, force: true, confirmed: true });
}
