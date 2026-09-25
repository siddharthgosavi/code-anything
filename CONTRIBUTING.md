# Contributing to everything-opencode

Thank you for your interest in improving **everything-opencode**!

## How to Contribute

1. **New Agents & Prompts**: Specialized subagents for specific frameworks (e.g. Next.js, Django, Axum, Flutter).
2. **New Skills**: Reusable patterns for databases, caching, state management, or microservices.
3. **Graphify Enhancements**: Additional graph visualization, community clustering, or AST analysis tools.
4. **Model Presets**: Pre-configured model mappings for emerging LLM providers.

## Development Workflow

1. Clone or navigate to the repository.
2. Run test suite:
   ```bash
   node tests/run-all.js
   ```
3. Test the CLI locally:
   ```bash
   node bin/cli.js doctor
   node bin/cli.js install --dry-run
   ```
4. Verify all tests pass before submitting a pull request.
