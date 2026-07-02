# loom — Risk Register

Severity: 🔴 critical · 🟠 high · 🟡 medium. Each risk has a mitigation and the milestone that owns it.

| ID | Risk | Sev | Mitigation | Owner |
|---|---|---|---|---|
| **R1** | **Bundle bloat / scope creep** — drifting toward a 167-file "agent OS" (ClaudeFast / ECC pattern). | 🔴 | NFR-1 simplicity gate per milestone; compose-over-build (FR-T1); one skill, adapters only. | all |
| **R2** | **Skill-invocation variability** — external skills change shape; adapters break. | 🟠 | Adapter interface is the only contract; pin a `noop` smoke adapter; version-pin composed skills; fail-non-fatal with a clear reason. | M2 |
| **R3** | **Context rot on long spines** — a 5-phase run fills the window; quality + cost degrade. | 🟠 | Per-phase budget (FR-7); compact preserving conclusions; pair with `chisel`; artifacts are read-on-demand, not bulk-loaded. | M5 |
| **R4** | **Iron-law false positives** — gates over-block legitimate trivial work, frustrating users. | 🟠 | Documented escape hatch (FR-5); override is logged; default bias toward caution, but `assist` mode lets the user proceed. | M3 |
| **R5** | **Resume / state corruption** — checkpoint/resume loses or duplicates an artifact. | 🔴 | Versioned artifacts (FR-6); resume test = interrupted vs uninterrupted run produce identical output; idempotent transitions. | M1 |
| **R6** | **Composability breakage** — upstream skill (anthropics/skills) ships a breaking change. | 🟡 | Adapters reference skills by name + version; CI smoke against the no-op adapter; document the composed-skill manifest. | M2 |
| **R7** | **Zero-wiring assumption** — "auto-wires phases" hides a fragile implicit discovery. | 🟠 | The spine is a fixed, explicit sequence (not discovered); "zero-wiring" means *no user config*, not *implicit resolution*. Document the distinction. | M0 |
| **R8** | **Over-engineering the engine** — building a general workflow framework instead of a spine. | 🟠 | Scope cap: the engine runs exactly the 5-phase spine; generalization is a deferred non-goal. | all |

## Top three to watch
1. **R1 (bloat)** — the silent project-killer; the wedge against ClaudeFast dies if `loom` balloons. Enforce NFR-1 every milestone.
2. **R5 (resume corruption)** — checkpoint/resume is the trust foundation; a lost/duplicated artifact invalidates the whole run. Test interrupted-vs-uninterrupted equivalence.
3. **R2 + R6 (adapter/composability)** — composing external skills is the whole point; fragility there undermines "compose, don't reinvent." Pin the interface, smoke-test the no-op adapter.

## Risk cadence
- Review the register at each milestone exit; add risks discovered during validation.
- A milestone does **not** exit if a 🔴 risk it owns is open and unmitigated.
