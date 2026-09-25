---
description: Build or refresh the Graphify AST knowledge graph for the current repository.
---

# Graph Build Command

This command builds or updates the Graphify AST knowledge graph in `graphify-out/graph.json`.

## Usage

```
/graph-build
```

## How It Works
1. Runs `graphify extract . --code-only`.
2. Scans code files with Tree-Sitter AST parsers.
3. Writes `graphify-out/graph.json` with nodes, edges, and communities with zero LLM API token cost.
