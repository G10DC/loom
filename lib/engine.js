// lib/engine.js
// Phase spine + state machine. Weaves the Superpower Workflow
// (Brainstorm -> Spec -> Plan -> Build-TDD -> Verify) as an explicit, resumable state machine.
//
// Pure and offline: no network, no Claude calls, deterministic. M1 adds checkpoint/resume on top
// of the M0 spine. Adapters (M2), gates (M3), budget (M5) and mode toggle (M6) layer on later.

export const PHASES = ['brainstorm', 'spec', 'plan', 'build', 'verify'];

export const ARTIFACT_NAMES = {
  brainstorm: 'brainstorm.md',
  spec: 'spec.md',
  plan: 'plan.md',
  build: 'tests.md',
  verify: 'report.md',
};

// Per-phase markdown templates. Stable, deterministic, intent-carrying.
const TEMPLATES = {
  brainstorm: (intent) =>
    `# Brainstorm\n\nIntent: ${intent}\n\nPressure-test the idea: state assumptions explicitly, ` +
    `challenge them, explore alternatives. Reject scope before any code.\n\n- Problem\n- Assumptions\n- Alternatives\n- Decision\n`,
  spec: (intent) =>
    `# Spec\n\nIntent: ${intent}\n\nTechnical specification derived from the brainstorm. ` +
    `Functional requirements, acceptance criteria, non-goals.\n\n- Requirements\n- Acceptance\n- Non-goals\n`,
  plan: (intent) =>
    `# Plan\n\nIntent: ${intent}\n\nImplementation plan as bite-sized, testable tasks.\n\n` +
    `- Task 1 -> verify: [check]\n- Task 2 -> verify: [check]\n`,
  build: (intent) =>
    `# Tests (TDD)\n\nIntent: ${intent}\n\nBuild test-first: write the failing test, run it, implement ` +
    `the minimal code to pass, run it, commit. No production code without a failing test first.\n`,
  verify: (intent) =>
    `# Report\n\nIntent: ${intent}\n\nVerification gate. Iron laws enforced:\n` +
    `- No fix without a root-cause investigation first.\n` +
    `- No completion claim without fresh verification evidence.\n` +
    `- No production code without a failing test first.\n\nStatus: complete.\n`,
};

// ── State machine (pure) ────────────────────────────────────────────────────────────────

/**
 * Initial run state: nothing done, all phases pending.
 * @param {string} intent
 * @returns {RunState}
 */
export function createRun(intent) {
  return {
    intent,
    completed: [],
    pending: [...PHASES],
    artifacts: {},
    status: 'running',
    log: [],
  };
}

/**
 * Runs exactly ONE pending phase; idempotent once complete. Returns a NEW state (immutable).
 * @param {RunState} state
 * @returns {RunState}
 */
export function advance(state) {
  if (state.status === 'complete' || state.pending.length === 0) {
    return { ...state, status: 'complete' };
  }
  const phase = state.pending[0];
  const rest = state.pending.slice(1);
  return {
    ...state,
    completed: [...state.completed, phase],
    pending: rest,
    artifacts: { ...state.artifacts, [ARTIFACT_NAMES[phase]]: TEMPLATES[phase](state.intent) },
    status: rest.length === 0 ? 'complete' : 'running',
    log: [...state.log, `${phase} -> done`],
  };
}

/**
 * Advances until the run is complete.
 * @param {RunState} state
 * @returns {RunState}
 */
export function runToCompletion(state) {
  let s = state;
  while (s.status !== 'complete') s = advance(s);
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
 * @property {string[]} completed
 * @property {string[]} pending
 * @property {Object<string,string>} artifacts
 * @property {'running'|'complete'} status
 * @property {string[]} log
 */
