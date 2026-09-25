# Performance & Context Management Rules

- **Context Preservation**: Avoid running commands that flood terminal output with unbounded listings. Pipe to `head -n 20` or use targeted grep patterns.
- **Query Graphs Over Blind Grep**: Use `graphify query` to locate function calls and dependencies. Grepping entire workspaces wastes tokens and clutters context.
- **Compaction Readiness**: When sessions reach high tool counts (>40 tool calls), run `/checkpoint` or `/compact` to preserve session quality.
- **Model Efficiency**: Use fast models for routine tasks (documentation, formatting, quick file edits) and frontier models for architecture and complex debugging.
