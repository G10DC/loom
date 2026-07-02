// lib/gates.js — M3: methodology gates between phases (iron laws). A gate is a pure function
// (phase, evidence) -> { pass, reason }. permissiveGate passes everything (default); strictGate
// applies per-phase rules. The engine consults the gate after a phase runs; a failed gate blocks
// the run until an escape-hatch (force) overrides it (logged).

/** Always passes — used when no gate is configured. */
export function permissiveGate() {
  return { pass: true, reason: 'no gate' };
}

/**
 * Builds a gate applying per-phase rules. A rule returns `true` (pass) or `{ pass, reason }`.
 * Phases without a rule pass. @param {Object<string, (ev: {artifact: string, state: object}) => (true | {pass:boolean, reason:string})>} rules
 */
export function strictGate(rules = {}) {
  return (phase, evidence) => {
    const rule = rules[phase];
    if (!rule) return { pass: true, reason: 'no rule for phase' };
    const r = rule(evidence);
    return r === true ? { pass: true, reason: 'ok' } : r;
  };
}

/** The iron-law gate set (reference): verify demands a failing-test marker in the test artifact. */
export const ironLawGate = strictGate({
  build: (ev) => (/failing test/i.test(ev.artifact)
    ? true
    : { pass: false, reason: 'no failing test — no production code without a failing test first' }),
  verify: (ev) => (/complete/i.test(ev.artifact)
    ? true
    : { pass: false, reason: 'no completion claim without fresh verification evidence' }),
});
