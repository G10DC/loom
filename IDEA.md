# loom

> *A loom weaves separate threads into one cloth. `loom` weaves separate process skills —
> brainstorm, spec, plan, build, verify — into one coherent development workflow.*

A **single, self-wiring Claude Code skill** that orchestrates the **Superpower Workflow**
(Brainstorm → Spec → Plan → Build-TDD → Verify), with context-discipline baked in, markdown-first
artifacts, and an assist/autopilot toggle. It **composes** existing skills rather than bundling
hundreds of files.

Status: **idea / research phase.** This document distills three inputs:
1. a GitResearcher run on the intent (generic workflow-engine state of the art — see `research-gitresearcher/final_report.md`);
2. the thetoolnerd "10 best Claude skills" survey + the **Superpower Workflow** (Brainstorm → Spec → Plan → Build);
3. a manual competitor scan of the **direct** superpowers alternatives.

---

## Why — the wedge

The space is crowded, but every incumbent trades off against one principle `loom` keeps:

| Incumbent | Their stance | `loom`'s wedge |
|---|---|---|
| **obra/superpowers** | process skills, but **manual wiring** of the chain | **zero-wiring**: one skill auto-wires the phase chain |
| **ClaudeFast Code Kit** | integrated: 18 agents + **167 skill files** | **one skill, not 167** (anti-bloat — cf. chisel NFR-3) |
| **Feature-Driven-Flow** | markdown-first, **rigid** 7-phase | phases **with escape hatches** for trivial tasks + a context budget |
| **GSD** | context-rot prevention, **standalone** | context-discipline **baked into each phase** |
| **Hermes Agent** | **autonomous** multi-step orchestration | **assist / autopilot toggle** (human-guided *or* autonomous) |
| **wshobson/agents** + **anthropics/skills** | skill libraries to **pair with** superpowers | **compose, don't reinvent** — orchestrate them |

The through-line: `loom` is the **thinnest** layer that makes the Superpower Workflow run
end-to-end with zero wiring, instead of the **thickest** (a 167-file bundle). It pairs naturally
with `chisel` (context discipline) and `karpathy-guidelines` (methodology).

---

## The workflow (phase spine)

```
Brainstorm ──► Spec ──► Plan ──► Build (TDD) ──► Verify
   validate     write      map        tests-first       prove done
   assumptions  spec       impl       then implement    no claims w/o evidence
```

Each phase is an **adapter** that may invoke an existing skill (e.g. brainstorm → a brainstorming
skill; build → a TDD skill). Between phases, **iron-law gates** block regressions:

- *No fix without root-cause investigation first.*
- *No completion claim without fresh verification evidence.*
- *No production code without a failing test first.*

Trivial tasks get an **escape hatch** (skip to Build) — bias toward caution, but use judgment.

---

## Modules (from GitResearcher, adapted)

| # | Module | Responsibility |
|---|---|---|
| 1 | **Workflow Orchestration Engine** | phase state machine, checkpoints, resume, error recovery |
| 2 | **Phase Execution Adapters** | per-phase interface to concrete skill invocations + output capture |
| 3 | **Artifact & Context Management** | markdown artifacts (spec/plan/status/test), inter-phase data flow, context-mode integration |
| 4 | **Methodology Enforcement & Validation** | iron-law gates, validation checkpoints, override policy |
| 5 | **UX / Progress** | status display, artifact review, intervene, checkpoint resume |

---

## Design sparks (S1–S6)

- **S1 Zero-config / self-wiring** — the headline differentiator vs Superpowers.
- **S2 Context-discipline per phase** — every phase respects a window budget (synergy with `chisel`).
- **S3 Markdown-first artifacts** — spec/plan/notes as markdown: token-cheap + version-controllable.
- **S4 Rigid spine, escape hatches** — fixed phase order, overridable for trivial tasks.
- **S5 Assist / Autopilot toggle** — human-guided default, autonomous opt-in (vs Hermes).
- **S6 Compose, don't reinvent** — orchestrate `anthropics/skills` + `wshobson/agents`, never bundle.

---

## Requirements (sketch — **formalized** in [`REQUIREMENTS.md`](./REQUIREMENTS.md), [`ROADMAP.md`](./ROADMAP.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`RISKS.md`](./RISKS.md))

**Functional**
- FR-1 Run the full phase spine end-to-end with zero manual wiring.
- FR-2 Per-phase adapters invoking composable external skills (not bundled copies).
- FR-3 Checkpoint + resume across phases; no lost state on interruption.
- FR-4 Iron-law gates enforced between phases, with a documented override (escape hatch).
- FR-5 Markdown artifacts emitted at each phase (spec.md, plan.md, status.md, tests, report).
- FR-6 Context budget tracked per phase (warn / compact at thresholds).
- FR-7 Assist / Autopilot mode toggle.

**Non-functional**
- NFR-1 **Simplicity** — one skill, minimal surface; the "smallest design that runs the spine."
- NFR-2 **Composability** — never reinvent what anthropics/skills or wshobson/agents already provide.
- NFR-3 **Reversibility** — every phase/gate bypassable; no irreversible state.
- NFR-4 **Measurability** — phase success has a verifiable criterion (tests pass, evidence present).
- NFR-5 **Transparency** — the user always sees which phase, which gate, which override.

---

## Roadmap (minimal-viable-orchestrator first)

GitResearcher's strategic recommendation: **start with a minimal viable orchestrator, add
complexity later.** Sketch (to be detailed in a ROADMAP):

1. **MVP spine** — hardcoded Brainstorm→Spec→Plan→Build→Verify with markdown artifacts, no adapters yet.
2. **Phase adapters** — plug in external skills per phase (compose anthropics/skills).
3. **Iron-law gates** — validation between phases + escape hatch.
4. **Checkpoint/resume** — state persistence across interruptions.
5. **Context budget** — per-phase window discipline (pair with `chisel`).
6. **Autopilot mode** — assisted default, autonomous opt-in.
7. **UX/progress** — status, intervene, review.

---

## Next

- Formalize REQUIREMENTS.md + ROADMAP.md (TDD, like chisel).
- Decide: which external skills to compose per phase (brainstorming, TDD, writing-plans…).
- Scaffold the skill (SKILL.md + adapters), offline-tested, English-only, no LLM-provenance traces.

See [`SOURCES.md`](./SOURCES.md) for every input behind this idea, and
[`research-gitresearcher/`](./research-gitresearcher/) for the full GitResearcher report.
