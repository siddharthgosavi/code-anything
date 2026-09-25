# Graphify Knowledge Graph Workflow Rules

- **Check for Graph First**: Always check if `graphify-out/graph.json` exists before attempting codebase exploration.
- **Query Relationships**:
  - To find what calls function X: `graphify query "functionX"`
  - To find imports and dependencies: `graphify query "moduleName"`
- **Read High-Level Architecture**: Read `graphify-out/GRAPH_REPORT.md` to understand community clusters and core dependencies.
- **Refresh Graph on Substantial Changes**: Run `graphify extract . --code-only` after creating new modules or significant refactoring.
