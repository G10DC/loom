// lib/engine.js
// M0 — hardcoded phase spine. Weaves the Superpower Workflow
// (Brainstorm -> Spec -> Plan -> Build-TDD -> Verify) and emits one markdown artifact per phase.
//
// This is the minimal-viable orchestrator: a FIXED, explicit sequence with no adapters, no network,
// no Claude calls — deterministic and offline. Adapters (M2), gates (M3), checkpoint/resume (M1),
// budget (M5) and mode toggle (M6) layer on top of this spine in later milestones.

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

/**
 * Runs the hardcoded 5-phase spine. Deterministic and offline.
 * @param {string} intent the idea to weave through the workflow
 * @returns {{ phases: string[], artifacts: Object<string,string>, status: string }}
 */
export function runWorkflow(intent) {
  const artifacts = {};
  for (const phase of PHASES) {
    artifacts[ARTIFACT_NAMES[phase]] = TEMPLATES[phase](intent);
  }
  return { phases: [...PHASES], artifacts, status: 'complete' };
}
