---
name: loom
description: Weave the Superpower Workflow — Brainstorm, Spec, Plan, Build-TDD, Verify — into one self-wiring phase spine. Enforces iron-law gates between phases (no fix without root cause, no completion without verification, no code without a failing test); markdown-first artifacts; composes external skills instead of bundling them. Use for non-trivial features going from a raw idea to a verified build.
---

# loom

A loom weaves separate threads into one cloth. `loom` weaves separate process skills — brainstorm,
spec, plan, build, verify — into one coherent development workflow, with methodology gates between
phases. One skill, self-wiring — never a bundle of hundreds of files.

## The phase spine (fixed order)

```
Brainstorm ──► Spec ──► Plan ──► Build (TDD) ──► Verify
 validate     write      map        tests-first       prove done
 assumptions  spec       impl       then implement    no claims w/o evidence
```

Each phase emits one **markdown artifact** (`brainstorm.md`, `spec.md`, `plan.md`, `tests.md`,
`report.md`) — token-cheap, version-controllable, the human-readable trail.

## Iron-law gates (between phases)

- **No fix without a root-cause investigation first.**
- **No completion claim without fresh verification evidence.**
- **No production code without a failing test first.**

A phase missing required evidence is **blocked** with a reason. Trivial tasks get an **escape hatch**
(skip to Build) — bias toward caution, but use judgment.

## How to use

1. State the intent (the feature/idea).
2. Run the spine: `npm run run -- "<intent>"` writes the artifacts to `runs/<timestamp>/`.
3. Move phase by phase; do not advance until the gate passes.

## Principles

- **Zero-wiring** — one skill auto-wires the chain; no manual configuration.
- **Compose, don't reinvent** — orchestrate `anthropics/skills` / `wshobson/agents`; never bundle copies.
- **Markdown-first** — every artifact is markdown.
- **Reversible** — every phase/gate is bypassable; nothing irreversible.

## Status

M0–M7 complete: phase spine + resumable state machine (checkpoint/resume) + composable adapters +
iron-law gates (escape hatch) + versioned artifact store + per-phase context budget +
assist/autopilot mode + UX (status / skip / override). Offline, deterministic, 42 tests.
Deferred: domain/stack calibration, cross-session learning, public-release hardening (`ROADMAP.md`).
