// lib/phases.js — shared phase definitions + markdown templates. Imported by engine + adapters.

export const PHASES = ['brainstorm', 'spec', 'plan', 'build', 'verify'];

export const ARTIFACT_NAMES = {
  brainstorm: 'brainstorm.md',
  spec: 'spec.md',
  plan: 'plan.md',
  build: 'tests.md',
  verify: 'report.md',
};

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

/** Renders a phase's markdown artifact for an intent (deterministic). */
export function render(phase, intent) {
  return TEMPLATES[phase](intent);
}
