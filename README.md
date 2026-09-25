# Everything OpenCode

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![OpenCode](https://img.shields.io/badge/OpenCode-ready-purple.svg)
![Graphify](https://img.shields.io/badge/Graphify-integrated-orange.svg)

**The complete, production-ready configuration suite and plugin for the OpenCode coding agent.**

Adapted from the battle-tested patterns of [everything-claude-code](https://github.com/worldflowai/everything-claude-code), fully re-architected for OpenCode with native **Graphify Code Intelligence**, model flexibility, robust lifecycle hooks, and zero session disruption.

---

## Quick Start: One Command Setup

To configure OpenCode in your project, simply run:

```bash
npx everything-opencode
```

Or install globally for all projects:

```bash
npx everything-opencode install --global
```

That's it! Your OpenCode setup is immediately equipped with:
- **10 Specialized Subagents** (`planner`, `architect`, `tdd-guide`, `code-reviewer`, `security-reviewer`, `build-error-resolver`, `e2e-runner`, `refactor-cleaner`, `doc-updater`, `graph-analyst`)
- **14 Slash Commands** (`/plan`, `/tdd`, `/verify`, `/code-review`, `/build-fix`, `/refactor-clean`, `/e2e`, `/test-coverage`, `/update-docs`, `/checkpoint`, `/learn`, `/graph-query`, `/graph-build`, `/setup-pm`)
- **10 Modular Skills** (`graphify-intelligence`, `tdd-workflow`, `verification-loop`, `backend-patterns`, `frontend-patterns`, `coding-standards`, `continuous-learning`, `eval-harness`, `security-review`, `strategic-compaction`)
- **First-Class Graphify Integration** (instant AST dependency graphs, call flow queries, community clustering)
- **Safe Session Protection** (never terminates or disturbs your active OpenCode sessions)

---

## Graphify Code Intelligence

Unlike Claude Code configurations that rely on naive text grep or expensive manual codemaps that burn tens of thousands of tokens, `everything-opencode` natively integrates with **[Graphify](https://github.com/worldflowai/graphify)**.

### Why Graphify?
- **Zero Token AST Parsing**: Indexes codefiles in milliseconds using local Tree-Sitter AST parsers.
- **Precision Subgraphs**: Query exact callers, callees, and dependencies instead of endless grep noise.
- **Community Clustering**: View architectural clusters and god-node bottlenecks in `graphify-out/GRAPH_REPORT.md`.

### Using Graphify with OpenCode:
```bash
# Build knowledge graph for current project (code-only, fast, zero API cost)
npx everything-opencode graphify init

# Query relationships for a function or symbol
npx everything-opencode graphify query "authMiddleware"

# Check graph status
npx everything-opencode graphify status
```

In OpenCode:
- Type `/graph-query <symbol>` to run relationship queries on demand.
- Type `/graph-build` to refresh the AST knowledge graph.
- The `graph-analyst` subagent automatically analyzes architecture and blast radius before large refactors.
- Built-in `tool.execute.before` hook proactively advises the agent to use the knowledge graph instead of slow grepping.

---

## Flaws of everything-claude-code Fixed

`everything-opencode` directly resolves the core flaws and architectural limitations of `everything-claude-code`:

1. **Graphify vs. Manual Codemaps**: Replaced expensive, text-based markdown codemaps (which burned 50k+ tokens and quickly decayed) with real Tree-Sitter AST knowledge graphs.
2. **Dynamic Model Selection vs. Hardcoded Opus**: `everything-claude-code` hardcoded `model: opus` in every agent, breaking when users lacked Anthropic API keys or used local/alternative models. `everything-opencode` defaults to `inherit` (using your active session model) and offers flexible presets (`openai`, `google`, `anthropic`, `explabs`, `github`).
3. **Native OpenCode Schema vs. Claude Markdown Commands**: Converted freeform markdown command prompts into schema-compliant OpenCode commands with `$ARGV` substitution and agent delegation.
4. **Non-Intrusive Hooks vs. Hard Blocking**: Removed anti-patterns like blocking dev servers outside tmux or violently blocking file creation for non-whitelisted markdown files (`process.exit(1)`).
5. **100% Cross-Platform Node.js**: Eliminated platform-dependent bash scripts (`.sh`) and unhandled `globalThis.Bun` bugs. Runs on Node.js 18+, Bun, Linux, macOS, and Windows.
6. **Pre-Compaction Memory Snapshots**: Uses OpenCode's native `experimental.session.compacting` hook to dump structured state snapshots before context reduction, avoiding context amnesia without polluting start prompts.
7. **One-Command NPX Setup**: Eliminated manual symlink management and config surgery in favor of a single `npx everything-opencode` command with atomic `.bak` backups.

*For full architectural analysis, see [FLAWS_FIXED.md](FLAWS_FIXED.md).*

---

## Active Session Safety Guarantee

If you have existing, long-running OpenCode sessions:
- `everything-opencode` **NEVER** terminates, signals, or kills running `opencode` processes.
- All configuration edits are **non-destructive**: your existing providers (e.g. ExperientialLabs, OpenAI, Anthropic), custom API keys (e.g. `explabs.key`), custom MCP servers, and existing plugins (e.g. `@upstash/context7-opencode`) are 100% preserved.
- Automatic backups (`opencode.jsonc.bak`) are created before writing any changes.

---

## Available Agents

| Agent | Scope & Role | Tools Permitted |
| :--- | :--- | :--- |
| `planner` | Phased implementation planning, risk assessment. **Read-only** until confirmation. | `bash, read, glob, grep, task, webfetch, skill` |
| `architect` | High-level system design, module boundaries, data models, scalability trade-offs. | `bash, read, glob, grep, task, webfetch, skill` |
| `tdd-guide` | Enforces Red-Green-Refactor cycles and >= 80% test coverage. | `bash, read, glob, grep, edit, write, task, skill` |
| `code-reviewer` | Senior review of recent changes: correctness, security, performance, clean code. | `bash, read, glob, grep, task, skill` |
| `security-reviewer` | Vulnerability auditing: OWASP Top 10, injection, secrets, authorization bypasses. | `bash, read, glob, grep, task, skill` |
| `build-error-resolver` | Multi-language compiler debugger (Rust, Go, TypeScript, Python, C++). | `bash, read, glob, grep, edit, write, task, websearch, skill` |
| `e2e-runner` | Playwright/Cypress end-to-end testing and user journey verification. | `bash, read, glob, grep, edit, write, task, websearch, skill` |
| `refactor-cleaner` | Eliminates dead code, reduces cognitive complexity, modernizes syntax. | `bash, read, glob, grep, edit, write, task, skill` |
| `doc-updater` | Keeps README.md, AGENTS.md, and API references synchronized with code. | `bash, read, glob, grep, edit, write, task, skill` |
| `graph-analyst` | Explores Graphify knowledge graph, blast radius, callers/callees, and dead code. | `bash, read, glob, grep, task, skill` |

---

## Available Slash Commands

- `/plan [task]` - Create a phased plan and wait for confirmation.
- `/tdd [target]` - Implement via test-driven development.
- `/verify` - Run the complete verification loop (lint, types, tests, build).
- `/code-review` - Conduct a senior code review on the git diff.
- `/build-fix` - Diagnose and resolve compiler errors.
- `/refactor-clean` - Remove dead code and simplify logic.
- `/e2e [flow]` - Generate and run Playwright E2E tests.
- `/test-coverage` - Measure and boost coverage to >= 80%.
- `/update-docs` - Sync documentation with recent changes.
- `/checkpoint` - Save progress snapshot for session resumption.
- `/learn` - Extract patterns and conventions discovered during the session.
- `/graph-query [symbol]` - Query codebase knowledge graph via Graphify.
- `/graph-build` - Build or refresh the Graphify AST knowledge graph.
- `/setup-pm [manager]` - Configure preferred package manager.

---

## Model Presets

By default, all agents use `inherit` to run with your active session model.
If you prefer dedicated models per agent role, select a preset:

```bash
# View available presets
npx everything-opencode preset list

# Install with a specific preset
npx everything-opencode install --preset google
npx everything-opencode install --preset openai
npx everything-opencode install --preset anthropic
npx everything-opencode install --preset explabs
```

---

## Health Check: Doctor Command

Run the doctor diagnostic tool at any time:

```bash
npx everything-opencode doctor
```

Outputs:
- OpenCode CLI version and status
- Active running sessions (read-only verification)
- Graphify CLI status & knowledge graph node/edge counts
- Detected package manager (npm, pnpm, yarn, bun)
- Registered agents, commands, and skills

---

## Using as an OpenCode Plugin

You can also load `everything-opencode` directly via OpenCode's plugin system in your `opencode.json` / `opencode.jsonc`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "everything-opencode"
  ]
}
```

---

## Running the Test Suite

```bash
npm test
```

Includes test coverage for:
- Session safety & process protection
- Non-destructive JSONC configuration merging
- Plugin lifecycle hooks & guardrails
- Graphify AST extraction & query integration
- Package manager detection
- CLI routing & execution

---

## License

MIT © [WorldFlow & Antigravity Contributors](LICENSE)
