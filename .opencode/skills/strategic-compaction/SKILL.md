---
name: strategic-compaction
description: Managing context window limits, token optimization, strategic checkpointing, and memory persistence across compactions.
---

# Strategic Compaction & Context Management

## Context Window Dynamics
As coding sessions progress, tool outputs, file contents, and reasoning accumulate.
Unchecked context growth causes:
1. Degradation in agent reasoning quality and attention.
2. Latency increases.
3. Wasteful token expenditures.

## Compaction Strategies

### 1. Pruning Intermediate Tool Outputs
- Don't keep megabytes of terminal logs or repetitive grep outputs in context.
- Use targeted commands (e.g. `head`, `tail`, `grep -m 10`) rather than dumping full files into stdout.
- Use Graphify queries (`graphify query`) instead of massive file listings.

### 2. Strategic Checkpoints
- After completing a phase (e.g., plan approval, passing a test suite), run `/checkpoint` to write progress to disk.
- When context exceeds ~40 tool calls, prepare for compaction by summarizing current state, open questions, and next steps.

### 3. Preserving Critical Decisions
- The `code-anything` plugin hooks into OpenCode's `experimental.session.compacting` lifecycle event to dump critical working memory before compaction occurs, ensuring seamless continuation.
