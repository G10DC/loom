# Loom Iron-Law Workflow Verification Honesty Bounds

The honesty layer is the operational expression of the **G10DC Trellis Standard**: **the processing engine reasons over verified evidence with stated confidence, never hallucinates capabilities or impact.**

## Domain & Scope
**Domain**: Phase Gate Concurrency & TDD Enforcement

## Core Epistemic Rules

1. **Iron-Law Verification: No fix without root cause analysis; no completion without verification test pass.**
2. **TDD Gate Enforcement: No implementation code written without a prior failing test failure.**
3. **Confidence Rating: High (all phase gates verified passing), Medium (hotfix bypass), Low (unverified build).**

## Three-Tier Confidence Model

- **High Confidence**: Full AST/schema validation passing, deterministic evidence available, verified state.
- **Medium Confidence**: Heuristic analysis or partial indexing; requires agent verification step.
- **Low Confidence**: Inferred or unindexed target; candidate output ONLY, never auto-committed.

## Epistemic Invariant

> Absence of evidence is not evidence of absence. Output is presented as a structured candidate set with confidence scores so caveats cannot be silently dropped downstream.
