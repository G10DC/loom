// lib/engine.js
// Phase spine + state machine. Weaves the Superpower Workflow
// (Brainstorm -> Spec -> Plan -> Build-TDD -> Verify) as an explicit, resumable state machine.
//
// Pure and offline: no network, no Claude calls, deterministic. Adapters (M2) are injected via
// deps; the default adapters reproduce the deterministic templates. Gates (M3), budget (M5) and
// mode toggle (M6) layer on via deps/state in later milestones.

import { PHASES, ARTIFACT_NAMES } from './phases.js';
import { defaultAdapters } from './adapters.js';

// ── State machine (pure) ────────────────────────────────────────────────────────────────

/**
 * Initial run state: nothing done, all phases pending.
 * @param {string} intent
 * @param {{ mode?: 'assist'|'autopilot' }} [opts]
 * @returns {RunState}
 */
export function createRun(intent, opts = {}) {
  return {
    intent,
    mode: opts.mode || 'autopilot',
    completed: [],
    pending: [...PHASES],
    artifacts: {},
    status: 'running',
    log: [],
    gateResults: {},
  };
}

/**
 * Runs exactly ONE pending phase via its adapter; idempotent once complete. Returns a NEW state.
 * M3: if deps.gate is set and the phase's artifact fails the gate (and deps.force is not set),
 * the run enters status 'blocked' with { phase, reason } and the phase is NOT accepted.
 * deps.force is the escape hatch (logged as "forced").
 * @param {RunState} state
 * @param {{ adapters?: Object<string, PhaseAdapter>, gate?: Function, force?: boolean }} [deps]
 * @returns {RunState}
 */
export function advance(state, deps = {}) {
  if (state.status === 'complete' || state.pending.length === 0) {
    return { ...state, status: 'complete' };
  }
  const adapters = deps.adapters || defaultAdapters;
  const phase = state.pending[0];
  const rest = state.pending.slice(1);
  // M6: assist mode awaits explicit confirmation before accepting each phase (autopilot skips this).
  if (state.mode === 'assist' && !deps.confirmed) {
    return { ...state, status: 'awaiting-confirm', awaitingConfirm: phase, log: [...state.log, `${phase} -> awaiting confirm`] };
  }
  const prevName = state.completed.length ? ARTIFACT_NAMES[state.completed[state.completed.length - 1]] : null;
  const prevArtifact = prevName ? state.artifacts[prevName] : null;
  const { artifact } = adapters[phase].run({ intent: state.intent, prevArtifact }, {});
  const nextArtifacts = { ...state.artifacts, [ARTIFACT_NAMES[phase]]: artifact };

  if (deps.gate && !deps.force) {
    const verdict = deps.gate(phase, { artifact, state });
    if (!verdict.pass) {
      return {
        ...state,
        status: 'blocked',
        blocked: { phase, reason: verdict.reason },
        artifacts: nextArtifacts,
        gateResults: { ...state.gateResults, [phase]: verdict },
        log: [...state.log, `${phase} -> blocked: ${verdict.reason}`],
      };
    }
  }

  const forced = Boolean(deps.force && state.blocked);
  const next = {
    ...state,
    completed: [...state.completed, phase],
    pending: rest,
    artifacts: nextArtifacts,
    status: rest.length === 0 ? 'complete' : 'running',
    log: [...state.log, forced ? `${phase} -> forced` : `${phase} -> done`],
    gateResults: deps.gate
      ? { ...state.gateResults, [phase]: { pass: true, reason: forced ? 'forced (escape hatch)' : 'ok' } }
      : state.gateResults,
  };
  delete next.blocked;
  delete next.awaitingConfirm;
  return next;
}

/**
 * Advances while the run is 'running'. Stops at 'complete' or 'blocked' (a blocked run needs an
 * escape hatch via deps.force, or a gate change, to resume).
 * @param {RunState} state
 * @param {{ adapters?: Object<string, PhaseAdapter>, gate?: Function, force?: boolean }} [deps]
 * @returns {RunState}
 */
export function runToCompletion(state, deps = {}) {
  let s = state;
  // Resume from 'blocked' when an escape hatch (force) is requested.
  if (s.status === 'blocked' && deps.force) s = advance(s, deps);
  while (s.status === 'running') s = advance(s, deps);
  return s;
}

/**
 * Full uninterrupted run. Convenience wrapper over createRun + runToCompletion.
 * @param {string} intent
 * @returns {{ phases: string[], artifacts: Object<string,string>, status: string, log: string[] }}
 */
export function runWorkflow(intent) {
  const s = runToCompletion(createRun(intent));
  return { phases: [...PHASES], artifacts: s.artifacts, status: s.status, log: s.log };
}

// ── Checkpoint serialization (pure; disk I/O lives in lib/checkpoint.js) ────────────────

export function serialize(state) {
  return JSON.stringify(state);
}

export function deserialize(json) {
  return JSON.parse(json);
}

/**
 * @typedef {Object} RunState
 * @property {string} intent
 * @property {'assist'|'autopilot'} mode
 * @property {string[]} completed
 * @property {string[]} pending
 * @property {Object<string,string>} artifacts
 * @property {'running'|'complete'|'blocked'|'awaiting-confirm'} status
 * @property {string[]} log
 * @property {Object<string, {pass: boolean, reason: string}>} gateResults
 */
