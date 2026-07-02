# loom 🧵

A **Claude Code skill** that **weaves the Superpower Workflow** — Brainstorm → Spec → Plan →
Build-TDD → Verify — into one **self-wiring phase spine** with methodology gates between phases,
markdown-first artifacts, and composable external skills. One skill, not a bundle of hundreds.

> *A loom weaves separate threads into one cloth. `loom` weaves separate process skills into one
> coherent development workflow.*

## Why — the wedge
| Incumbent | `loom`'s wedge |
|---|---|
| obra/superpowers (manual wiring) | **zero-wiring** — one skill auto-wires the chain |
| ClaudeFast Code Kit (167 files) | **one skill, not 167** (anti-bloat) |
| Feature-Driven-Flow (rigid 7-phase) | phases **with escape hatches** + a context budget |
| GSD (standalone context-rot fix) | context-discipline **baked into each phase** |
| Hermes (autonomous only) | **assist / autopilot toggle** |
| wshobson/agents, anthropics/skills | **compose, don't reinvent** |

## The phase spine
```
Brainstorm ──► Spec ──► Plan ──► Build (TDD) ──► Verify
 validate     write      map        tests-first       prove done
```
Iron-law gates between phases: **no fix without root cause · no completion without verification ·
no code without a failing test**. A trivial task gets an escape hatch.

## Modules
| # | Module | File |
|---|---|---|
| 1 | Orchestration Engine (state machine, checkpoint/resume, mode) | `lib/engine.js` |
| 2 | Phase Execution Adapters (compose external skills) | `lib/adapters.js` |
| 3 | Artifact & Context Management (versioned store) | `lib/store.js` |
| 4 | Methodology Enforcement & Validation (iron-law gates) | `lib/gates.js` |
| 5 | UX / Progress (status, intervene, override) | `lib/ux.js` |
| + | Per-phase context budget | `lib/budget.js` |
| + | Shared phase definitions + templates | `lib/phases.js` |
| + | Checkpoint disk I/O | `lib/checkpoint.js` |

## Repo layout
```
loom/
├── SKILL.md            # the Claude Code skill
├── README.md           # this file
├── package.json        # node:test, zero runtime deps
├── lib/                # pure, tested modules (engine, adapters, gates, store, budget, ux, …)
├── scripts/run.mjs     # dry run: weave the spine -> runs/<ts>/
├── test/               # offline tests (node:test)
└── IDEA.md · REQUIREMENTS.md · ROADMAP.md · ARCHITECTURE.md · RISKS.md · SOURCES.md
```

## Install
loom is a Claude Code **skill**; make it discoverable:
```bash
cd /path/to/loom
ln -sf "$PWD" ~/.claude/skills/loom      # live edits picked up
```

## Use
```bash
npm test                 # 42 offline tests
npm run run -- "your intent"   # weave the spine; artifacts in runs/<ts>/
```

## Status
**M0–M7 complete** (42 tests, offline, deterministic, zero runtime deps). Deferred: domain/stack
calibration, cross-session learning, public-release hardening — see `ROADMAP.md`.
