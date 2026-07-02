# loom — Requirements

Functional (FR) and non-functional (NFR) requirements. Each FR maps to a roadmap milestone and
has a measurable, baseline-relative acceptance criterion. Numbering follows implementation order.

## Global acceptance — Definition of Done (per module)
A module ships only when **all** hold:
- **Quality gate**: the phase spine runs end-to-end without dropping an iron-law check.
- **Reversibility**: every phase/gate is bypassable; no irreversible state.
- **Measurability**: each phase emits a verifiable artifact + a status record.
- **Simplicity**: the module is the smallest design that satisfies its FR (no bundle-bloat).

---

## Functional requirements

| ID | Milestone | Requirement | Acceptance criterion |
|---|---|---|---|
| **FR-1** | M0 | **Skill scaffold**: a Claude Code skill (`SKILL.md` + frontmatter) discoverable in `~/.claude/skills/`, English-only, no runtime deps. | Skill loads; `description` matches the workflow intent; offline tests pass. |
| **FR-2** | M0 | **Phase spine (hardcoded MVP)**: Brainstorm → Spec → Plan → Build-TDD → Verify runs as a fixed sequence emitting one markdown artifact per phase. | A dry run produces `spec.md`, `plan.md`, `tests`, `report.md` in order; each phase logged. |
| **FR-3** | M1 | **Workflow Orchestration Engine**: a phase state machine with checkpoint + resume. | An interrupted run resumes from the last checkpoint with no lost artifact; phase transitions are logged. |
| **FR-4** | M2 | **Phase Execution Adapters**: a uniform adapter interface so each phase delegates to a composable external skill (e.g. anthropics/skills) instead of bundling logic. | A phase runs with a no-op adapter (smoke) AND with one real external-skill adapter; interface identical. |
| **FR-5** | M3 | **Iron-law gates**: between phases, validation blocks regressions (no-fix-without-root-cause; no-completion-without-verification; no-prod-code-without-failing-test). | A phase missing required evidence is blocked with a reason; a documented override (escape hatch) lets it proceed for trivial tasks. |
| **FR-6** | M4 | **Artifact & Context Management**: markdown artifacts (spec/plan/status/tests/report) persisted with inter-phase data flow. | Phase N+1 can read phase N's artifact by name; no artifact is silently overwritten (versioned). |
| **FR-7** | M5 | **Context-discipline per phase**: each phase tracks a window budget and warns/compacts at thresholds. | A phase exceeding budget emits a warn; compact-at-threshold preserves the phase's conclusions (tested). |
| **FR-8** | M6 | **Assist / Autopilot toggle**: human-guided default; an opt-in autonomous mode runs phases without confirmation. | Both modes complete the spine; in assist mode each phase gate awaits confirmation (tested). |
| **FR-9** | M7 | **UX / Progress**: status display (current phase, gate state, artifacts), intervene, resume. | A run's status is queryable mid-flight; a user can intervene (skip/override) and resume. |

## Cross-cutting functional requirements

| ID | Requirement | Acceptance |
|---|---|---|
| **FR-T1** | **Compose, don't reinvent**: orchestrate `anthropics/skills` / `wshobson/agents`; never bundle copies. | No vendored skill logic; adapters reference external skills by name. |
| **FR-T2** | **Transparency**: every phase/gate/override is logged with what changed and why. | A run produces a readable changelog of phases, gates, and overrides. |
| **FR-T3** | **Zero-wiring**: the spine auto-wires phases; no manual chain configuration by the user. | A fresh install runs the spine with no config file and no manual step. |

---

## Non-functional requirements

| ID | Requirement | Rationale |
|---|---|---|
| **NFR-1 Simplicity** | One skill, minimal surface; the smallest design that runs the spine. | The wedge vs ClaudeFast (167 files) — bloat is an explicit risk (cf. ECC). |
| **NFR-2 Composability** | Never reinvent what anthropics/skills or wshobson/agents provide. | Reinventing = maintenance burden + drift from upstream. |
| **NFR-3 Reversibility** | Every phase/gate bypassable; no irreversible state. | Progressive use requires safe escape hatches and rollback. |
| **NFR-4 Measurability** | Phase success has a verifiable criterion (tests pass, evidence present). | "Optimization without measurement is vanity." |
| **NFR-5 Transparency** | The user always sees which phase, which gate, which override. | Hidden automation erodes trust even when correct. |
| **NFR-6 Markdown-first** | All artifacts markdown (token-cheap + version-controllable). | Token-cheap; diffable history. |
| **NFR-7 Security / hygiene** | English-only, no third-party attribution metadata, no `curl\|bash`, validated inputs. | Standard distribution hygiene. |

---

## Out of scope (non-goals)
- Becoming a 167-file bundle or an "agent OS" (ClaudeFast / ECC scale).
- Reinventing skills that anthropics/skills or wshobson/agents already ship.
- Replacing a token-discipline skill or a methodology skill — compose with them.
- Vector / semantic memory infrastructure.
