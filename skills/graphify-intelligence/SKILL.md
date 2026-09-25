---
name: graphify-intelligence
description: Master codebase knowledge graphs using Graphify CLI. Query AST dependencies, call graphs, communities, and architecture without token waste.
---

# Graphify Code Intelligence Skill

Graphify turns any codebase into a queryable AST + semantic knowledge graph.
Instead of running expensive linear regex greps across thousands of lines, Graphify builds a graph in `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md`.

## When to Use Graphify

Use Graphify whenever you need to:
1. Trace Callers and Callees: Find all usages or callers of a function or class.
2. Understand Blast Radius: See what breaks before refactoring or removing a component.
3. Map Architecture: Review communities and functional clusters without reading every file.
4. Find Dead Code: Discover isolated nodes with zero inbound edges.

## Graphify CLI Commands

### 1. Build / Refresh Knowledge Graph
```bash
# Code-only extraction (AST parser, instant, zero API token cost):
graphify extract . --code-only

# Deep semantic extraction (if LLM API key is configured):
graphify extract . --mode deep
```

### 2. Querying the Graph
```bash
# Query a symbol, function, or concept:
graphify query "functionName"
graphify query "auth middleware"
```
The output returns the exact subgraph:
- Nodes (File, Line, Symbol, Community)
- Directed Edges (calls, imports, inherits, indirect_call)

### 3. Reading Architecture Reports
Check `graphify-out/GRAPH_REPORT.md` for a comprehensive breakdown of project communities, god-nodes, bottlenecks, and cross-cutting dependencies.

### 4. Interactive Visualization
```bash
# Generate standalone interactive HTML graph:
graphify export html
```

## Best Practices
- Run `graphify query "<symbol>"` BEFORE grepping through files. It is faster, more accurate, and saves thousands of context tokens.
- Refresh the graph with `graphify extract . --code-only` after large refactors or new file additions.
