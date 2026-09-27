---
name: strategic-compaction
description: Managing context window limits, token optimization, strategic checkpointing, and memory persistence across compactions. Suggests manual compaction at logical intervals rather than arbitrary auto-compaction.
---

# Strategic Compaction & Context Management

## Context Window Dynamics
As coding sessions progress, tool outputs, file contents, and reasoning accumulate.
Unchecked context growth causes:
1. Degradation in agent reasoning quality and attention.
2. Latency increases.
3. Wasteful token expenditures.

Compaction at logical boundaries beats arbitrary auto-compaction:
- **After exploration, before execution** — compact research context, keep the implementation plan.
- **After completing a milestone** — fresh start for the next phase.
- **Before major context shifts** — clear exploration context before a different task.

## Compaction Strategies

### 1. Pruning Intermediate Tool Outputs
- Don't keep megabytes of terminal logs or repetitive grep outputs in context.
- Use targeted commands (e.g. `head`, `tail`, `grep -m 10`) rather than dumping full files into stdout.
- Use Graphify queries (`graphify query`) instead of massive file listings.

### 2. Strategic Checkpoints
- After completing a phase (e.g., plan approval, passing a test suite), run `/checkpoint` to write progress to disk.
- When context exceeds ~40 tool calls, prepare for compaction by summarizing current state, open questions, and next steps.

### 3. Threshold Suggestions (suggest-compact)
The bundled `scripts/hooks/suggest-compact.js` runs on PreToolUse (Edit/Write):
1. Tracks tool-call invocations per session (`OPENCODE_SESSION_ID`).
2. Suggests `/compact` at a configurable threshold (`COMPACT_THRESHOLD`, default 50) and repeats every 25 calls after it.
3. Read the suggestion: the hook tells you *when*, you decide *if*.

### 4. Preserving Critical Decisions
- The `code-anything` plugin hooks into OpenCode's `experimental.session.compacting` lifecycle event to dump critical working memory before compaction occurs, ensuring seamless continuation.
- Memory persistence hooks (`scripts/hooks/session-start.js` / `session-end.js`) carry state across sessions.

## Best Practices
1. Compact after planning — once the plan is final, compact to start fresh.
2. Compact after debugging — clear error-resolution context before continuing.
3. Don't compact mid-implementation — preserve context for related changes.

## Related
- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) — token optimization section
