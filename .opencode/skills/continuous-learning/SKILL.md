---
name: continuous-learning
description: Pattern extraction and continuous knowledge synthesis from coding sessions into structured project knowledge.
---

# Continuous Learning & Knowledge Synthesis

## Goal
Capture non-obvious conventions, recurring bugs, framework quirks, and architectural decisions discovered during agent sessions, converting them into persistent rules and instructions.

## What to Extract
1. **Repository Quirks**: Unexpected build flags, environment setup steps, or workspace quirks.
2. **Library Patterns**: Specific library idioms (e.g. "always use parking_lot instead of std::sync in this crate").
3. **Bug Post-Mortems**: Root causes of tricky bugs and exact guardrails to prevent regressions.
4. **Performance Rules**: Database indexing requirements, memory limits, or query patterns.

## Where to Persist
- Update `AGENTS.md` under a dedicated "Learned Patterns" section.
- For architectural decisions, create or update Architecture Decision Records (ADRs).
- For test conventions, update the project's test guideline.
