---
description: Query the codebase knowledge graph via Graphify for symbols, callers, and dependencies.
---

# Graph Query Command

This command queries the Graphify knowledge graph to find connections, callers, and dependencies for a symbol or question.

## Usage

```
/graph-query [symbol-or-concept]
```

## How It Works
1. Runs `graphify query "$ARGV"` via bash.
2. Returns the directed subgraph of callers, callees, definitions, and communities.
3. Provides high precision without flooding the context window with text greps.
