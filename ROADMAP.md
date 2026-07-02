# loom — Roadmap

Ordering principle: **minimal-viable-orchestrator first, add complexity later** (the research's
strategic recommendation). Each milestone is independently testable and ships a working slice.

## At a glance

| Milestone | Goal | Exit criteria (DoD) |
|---|---|---|
| **M0** | Skill scaffold + hardcoded phase spine | FR-1, FR-2: skill loads; dry run emits the 5 markdown artifacts in order. |
| **M1** | Workflow Orchestration Engine (state machine + checkpoint/resume) | FR-3: interrupted run resumes with no lost artifact. |
| **M2** | Phase Execution Adapters (compose external skills) | FR-4: a phase runs via no-op adapter AND a real external-skill adapter, identical interface. |
| **M3** | Iron-law gates + escape hatch | FR-5: missing-evidence phase is blocked; override works for trivial tasks. |
| **M4** | Artifact & Context Management (markdown, versioned) | FR-6: phase N+1 reads phase N's artifact by name; no silent overwrite. |
| **M5** | Context-discipline per phase (budget) | FR-7: over-budget phase warns; compact preserves conclusions. |
| **M6** | Assist / Autopilot toggle | FR-8: both modes complete the spine; assist awaits gate confirmation. |
| **M7** | UX / Progress (status, intervene, resume) | FR-9: status queryable mid-flight; intervene + resume tested. |

## Milestone detail

### M0 — Skill scaffold + hardcoded phase spine
- `SKILL.md` (frontmatter + workflow description), English-only.
- Hardcoded sequence: Brainstorm → Spec → Plan → Build-TDD → Verify.
- One markdown artifact per phase (`brainstorm.md`, `spec.md`, `plan.md`, tests, `report.md`).
- Offline tests (node:test), no runtime deps.
- **Exit**: `npm test` green; a dry run produces all artifacts in order.

### M1 — Workflow Orchestration Engine
- Phase state machine; explicit transitions; status record per phase.
- Checkpoint (persist state) + resume (reload + continue).
- **Exit**: kill mid-run → resume → identical final artifacts vs uninterrupted run.

### M2 — Phase Execution Adapters
- Uniform adapter interface: `adapter.run(input, ctx) → {output, artifact}`.
- Each phase delegates to a named external skill (anthropics/skills / wshobson/agents).
- No-op adapter (smoke) + one real adapter (e.g. brainstorm).
- **Exit**: swap adapter without touching the engine; interface contract holds.

### M3 — Iron-law gates
- Between-phase validation: root-cause-before-fix; verify-before-complete; failing-test-before-code.
- Block + reason on missing evidence; documented escape hatch for trivial tasks.
- **Exit**: a regression-style case is blocked; override proceeds and is logged.

### M4 — Artifact & Context Management
- Markdown artifact store; versioned (no silent overwrite); inter-phase read-by-name.
- Integrate context-mode patterns (reuse, don't reinvent).
- **Exit**: phase N+1 resolves phase N's artifact by name across a multi-phase run.

### M5 — Context-discipline per phase
- Per-phase window budget; warn at threshold; compact preserving conclusions.
- Follow compose-don't-duplicate rules.
- **Exit**: an over-budget phase triggers warn + compact; phase conclusions survive.

### M6 — Assist / Autopilot toggle
- Assist (default): each gate awaits user confirmation.
- Autopilot: phases run without confirmation; overrides still logged.
- **Exit**: both modes complete the spine on the same input; behavior difference is only confirmation.

### M7 — UX / Progress
- Status query (current phase, gate state, artifact list); intervene (skip/override); resume.
- **Exit**: status correct mid-flight; intervene changes flow as requested; resume continues.

## Sequencing rules
1. **M0 before anything.** No orchestration without a runnable spine.
2. **One milestone at a time** during validation, so gains are attributable.
3. **Compose over build** at every milestone — if anthropics/skills has it, adapter, don't reimplement.
4. **TDD per milestone** — failing test first, minimal code, frequent commits.

## Deferred (after M7)
- Domain/stack calibration (cf. gstack).
- Cross-session learning (opt-in, user-wipeable).
- Public release hardening (signed distribution; no `curl|bash`).
