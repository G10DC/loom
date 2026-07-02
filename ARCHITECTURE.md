# loom — Architecture

## Core idea: an orchestration layer
`loom` sits **between the user's intent and the agent's execution** as a phase orchestrator. It does
not replace the agent or the individual process skills; it **weaves** them into one workflow and
enforces methodology gates between phases.

```
user intent
   │
   ▼
┌─────────────────────────────── loom orchestration layer ───────────────────────────────┐
│                                                                                         │
│  1. Orchestration Engine ──► phase state machine, checkpoint/resume, mode (assist/auto) │
│  2. Phase Adapters       ──► per-phase delegation to external skills (compose, no bundle)│
│  3. Artifact & Context   ──► markdown artifacts, versioned, inter-phase read-by-name     │
│  4. Methodology Gates    ──► iron-law checks between phases + escape hatch               │
│  5. UX / Progress        ──► status, intervene, resume                                   │
│                                                                                         │
│  cross-cutting:  Context budget (per phase) · Transparency log · Compose-over-build     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
   │
   ▼
phase spine: Brainstorm ──► Spec ──► Plan ──► Build (TDD) ──► Verify
   │              │          │         │           │
   ▼              ▼          ▼         ▼           ▼
 artifact     artifact   artifact   artifact   artifact (+ gate evidence)
```

## Module interfaces (names are stable — the TDD plan reuses them verbatim)

### 1. Orchestration Engine — `lib/engine.js`
```js
runWorkflow(intent: string, opts?: { mode?: 'assist'|'autopilot' }): Promise<RunResult>
//   drives Brainstorm→Spec→Plan→Build→Verify; returns { phases, artifacts, status }
checkpoint(): CheckpointId        // persist current state
resume(checkpointId: CheckpointId): Promise<RunResult>   // reload + continue
```
- Phase transitions are explicit and logged. `mode` toggles confirmation behavior (FR-8).

### 2. Phase Adapter — `lib/adapters/<phase>.js` (uniform contract)
```js
interface PhaseAdapter {
  name: string;                                  // 'brainstorm' | 'spec' | 'plan' | 'build' | 'verify'
  run(input: PhaseInput, ctx: RunCtx): Promise<{ output: string; artifact: Artifact }>;
}
```
- `input` carries the previous phase's artifact; `ctx` carries run id, mode, budget, logger.
- Each adapter delegates to a **named external skill** (FR-T1 compose); a `noop` adapter exists for smoke tests.

### 3. Artifact Store — `lib/artifacts.js`
```js
save(phase: string, doc: string): ArtifactId     // markdown; versioned (no silent overwrite)
get(phase: string): Artifact | null              // read-by-name across phases
list(): Artifact[]
```
- Files: `brainstorm.md`, `spec.md`, `plan.md`, tests, `report.md` under `runs/<id>/`.

### 4. Methodology Gate — `lib/gates.js`
```js
check(phase: string, evidence: Evidence): { pass: boolean; reason: string; override?: 'escape-hatch' }
```
- Iron laws (FR-5): root-cause-before-fix, verify-before-complete, failing-test-before-code.
- `override: 'escape-hatch'` permits trivial-task bypass (logged).

### 5. Context Budget — `lib/budget.js`
```js
track(phase: string, tokens: number): void
shouldCompact(): { compact: boolean; reason: string }
```
- Per-phase window discipline (FR-7); compose, don't duplicate.

## Data flow per phase
1. **Engine** loads phase N's adapter + the previous artifact from the **store**.
2. **Adapter** runs (delegating to an external skill), produces `{ output, artifact }`.
3. **Store** persists the artifact (versioned).
4. **Gate** checks methodology evidence; blocks or passes (escape hatch logs an override).
5. **Budget** tracks tokens; warns/compacts at thresholds.
6. **Engine** transitions to phase N+1 (or awaits confirmation in assist mode).

## Claude Code integration
- Shipped as a Claude Code **skill** (`SKILL.md`); invoked when a task matches the workflow intent.
- Adapters invoke external skills by name (anthropics/skills, wshobson/agents) — no vendored copies.
- Markdown artifacts double as the human-readable trail (NFR-6).

## Design constraints (from requirements)
- **One skill**, minimal surface (NFR-1) — never a 167-file bundle.
- **Compose over build** (NFR-2) — adapters, not reimplementations.
- **Reversible** (NFR-3) — every phase/gate bypassable.
- **Markdown-first** (NFR-6) — all artifacts markdown.
