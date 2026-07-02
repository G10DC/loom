# loom — Sources

Everything behind the idea. Three inputs, fused in [`IDEA.md`](./IDEA.md).

## 1. Workflow-engine research pass
- Intent explored: *"a skill that orchestrates a structured agent development workflow … chaining
  process skills the way obra/superpowers does, following the Superpower Workflow."*
- Repos surveyed (state of the art in agent workflows): `prefecthq/prefect`,
  `josephsenior/langgraph-workflow-orchestrator`, `meirwah/awesome-workflow-engines`,
  `rod_trent/agentplatform`, `voltagent/awesome-ai-agent-papers`.
- Note: this pass surfaced **generic workflow engines**, not the direct Claude-skill competitors
  below — those come from the manual scan. It yielded the 5-module breakdown and the
  "minimal-viable-orchestrator first" / "compose, don't reinvent" recommendations.

## 2. thetoolnerd — "10 Best AI Claude Skills to Supercharge Your Workflow (2026)"
- URL: https://www.thetoolnerd.com/p/10-best-ai-claude-skills-to-supercharge
- **Superpower Workflow** (the chain `loom` runs): Brainstorm → Spec → Plan → Build (TDD).
- The 10 skills surveyed:
  1. **obra/superpowers** (147.7K) — brainstorming, process-skill chaining. **Core inspiration.**
  2. **anthropics/skills** (196.1K) — skill-creator (meta-skill).
  3. **anthropics/skills — design** (391.8K) — official frontend design guidelines.
  4. **juliusbrussee/caveman** (124.4K) — token reduction (locally superseded by `chisel`).
  5. **vercel-labs/agent-browser** (257K) — agent reads the web / docs.
  6. **heygen-com/hyperframes** (36.1K) — product videos.
  7. **remotion-dev/skills** (299.9K) — Remotion video.
  8. **coreyhaines31/marketingskills** (103.6K) — SEO / copywriting.
  9. **mattpocock/skills** (110.3K) — `grill-me`, code interrogation / review.
  10. **context-mode** (trending) — context/token reduction via sandbox.

## 3. Competitor scan (direct superpowers alternatives — manual research)
- **ClaudeFast Code Kit** — integrated: 18 agents + 167 skill files; claims to remove the manual
  wiring standalone frameworks (Superpowers) need. `loom`'s wedge: one skill, not 167.
- **GSD** — prevents context rot in complex projects. `loom`: context-discipline baked into each phase.
- **gstack** — structure for teams with a defined tech stack (stack-aware).
- **Hermes Agent** — autonomous multi-step orchestration. `loom`: assist / autopilot toggle.
- **Feature-Driven-Flow** — markdown-first, rigid seven-phase workflow. `loom`: phases + escape hatches.
- **wshobson/agents** — library of specialized agent definitions (paired with Superpowers).
- **anthropics/skills** — official, cross-platform skill library. `loom` composes these, never reinvents.

## Sibling skills already on this machine (composition candidates)
- `chisel` — token/context discipline (NFR/phase-budget partner).
- `karpathy-guidelines` — methodology (think-before-code, surgical changes, goal-driven) — overlaps
  with `loom`'s iron-law gates; align, don't duplicate.
