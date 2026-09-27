# Flaws Identified in everything-claude-code & How They Are Fixed in code-anything

An architectural analysis of the design limitations, platform assumptions, and failure modes in [everything-claude-code](https://github.com/worldflowai/everything-claude-code) and how **code-anything** fundamentally re-engineers them for OpenCode.

---

## Executive Summary of Flaws & Fixes

| Area | everything-claude-code Flaw | code-anything Fix |
| :--- | :--- | :--- |
| **Codebase Navigation** | Naive manual codemaps that burn 50k+ LLM tokens and become stale immediately. | **First-class Graphify AST Knowledge Graph** integration (`graphify query`, `graph.json`, `graph-analyst` agent). Zero token AST indexing. |
| **Model Lock-In** | Hardcoded `model: opus` in agents; fails if user lacks Anthropic API key or uses local/alternative LLMs. | **Dynamic Model Inheritance & Presets** (`inherit`, `openai`, `google`, `anthropic`, `explabs`, `github`). Seamless model fallback. |
| **Command Format** | Claude Code `.md` slash command templates which OpenCode cannot natively execute. | **Native OpenCode Command Schema** with argument interpolation (`$ARGV`, `$1`), subtask delegation, and agent assignment. |
| **Rules Architecture** | Modular markdown files in `rules/*.md` intended for `~/.claude/rules/`, ignored by OpenCode. | **Unified OpenCode Guidelines & AGENTS.md** integration with automatic non-destructive discovery. |
| **Runtime & Platform** | Mixture of bash scripts, unhandled shebangs, and broken assumptions about `globalThis.Bun`. | **100% Pure Portable Node.js (>=18.0.0)**. Works identically across Linux, macOS, and Windows. |
| **Aggressive Blocking Hooks** | Blocked dev servers outside tmux; blocked writing any `.md` file other than 4 specific names; un-debounced formatters. | **Smart, Non-Intrusive Lifecycle Hooks**. Contextual nudges, gentle Prettier formatting, and graceful safety guardrails. |
| **Memory Persistence** | Linear, unstructured text dumping to `.tmp` files with no semantic indexing or pruning. | **Structured JSON Snapshots & Pre-Compaction Hooks**. Captured via `experimental.session.compacting` with zero context loss. |
| **Setup & Installation** | Multi-step manual symlinking and copy-pasting JSON into configuration files. | **One-Step NPX Installer**: `npx code-anything` with automatic non-destructive config merging and `doctor` validation. |

---

## Detailed Breakdown of Flaws & Engineering Solutions

### 1. Codebase Exploration: Blind Grepping vs. Graphify AST Knowledge Graphs

#### The Flaw in everything-claude-code:
`everything-claude-code` introduced `/update-codemaps` which instructed Claude to scan the repository and manually output long markdown summaries of every folder.
- **The Problem**: Writing manual markdown codemaps burns tens of thousands of LLM tokens on every update. They become stale the moment any developer edits a function. In subsequent tasks, the agent would resort to brute-force `grep` or `find`, flooding the context window with hundreds of irrelevant lines.

#### The Fix in code-anything:
We integrated `graphify` directly into the OpenCode workflow:
- **Instant AST Extraction**: Uses Tree-Sitter AST parsing via `graphify extract . --code-only`. Runs in milliseconds with zero LLM API cost.
- **Precise Subgraph Queries**: When the agent wants to inspect relationships, it runs `graphify query "<symbol>"` via the `/graph-query` command or `graph-analyst` agent. It receives the exact callers, callees, and dependencies instead of endless grep noise.
- **Proactive Agent Hook**: In `tool.execute.before`, if an agent is about to run a raw grep or find command and a knowledge graph exists, the hook prepends an intelligent suggestion to use `graphify query`.

---

### 2. Hardcoded Model Assumptions & Provider Lock-In

#### The Flaw in everything-claude-code:
Every subagent in `everything-claude-code` had `model: opus` hardcoded in its frontmatter:
```markdown
---
name: planner
tools: Read, Grep, Glob
model: opus
---
```
- **The Problem**: If the user doesn't have an Anthropic subscription, or prefers Gemini 2.5, GPT-4o, DeepSeek, Minimax, or local Ollama models, the agent throws an error or fails. Additionally, OpenCode uses provider-prefixed model strings (`provider/model`).

#### The Fix in code-anything:
- **Default `inherit` Mode**: By default, agents do not hardcode any model. They dynamically inherit whatever model the user has active in their OpenCode session!
- **Pluggable Model Presets**: `MODEL_PRESETS` enables users to select optimized model tiers (e.g. `google`, `openai`, `anthropic`, `explabs`, `github`) or override specific agents:
  ```bash
  npx code-anything install --preset google
  ```
- **Zero Configuration Breaking**: Preserves existing custom provider configs, base URLs, and API keys.

---

### 3. OpenCode Command & Agent Format Incompatibility

#### The Flaw in everything-claude-code:
Commands were written as freeform markdown files (`commands/*.md`) designed for Claude Code's prompt expander.
- **The Problem**: OpenCode requires structured commands defined in `opencode.json` under `"command": { "<name>": { "template": "...", "agent": "...", "subtask": true } }`. Claude Code command files are ignored by OpenCode unless translated.

#### The Fix in code-anything:
- **Native OpenCode Command Definitions**: All 14 commands are converted into schema-compliant definitions with variable substitution (`$ARGV`, `$1`).
- **Direct Agent Mapping**: Commands like `/plan` directly route to the `planner` subagent, `/tdd` routes to `tdd-guide`, and `/code-review` routes to `code-reviewer`.

---

### 4. Flawed, Disruptive Tool Hooks

#### The Flaw in everything-claude-code:
The hooks in `hooks/hooks.json` contained severe anti-patterns:
```json
{
  "matcher": "tool == \"Write\" && tool_input.file_path matches \"\\\\.(md|txt)$\" && !(tool_input.file_path matches \"README\\\\.md|CLAUDE\\\\.md|AGENTS\\\\.md|CONTRIBUTING\\\\.md\")",
  "hooks": [{
    "type": "command",
    "command": "node -e \"... process.exit(1)\""
  }]
}
```
- **The Problem**:
  1. The hook above violently blocked writing *any* markdown or text file other than 4 filenames! This broke architectural decision records (ADRs), documentation directories (`docs/`), specifications, plan files, and tests!
  2. Another hook blocked any `npm run dev` outside tmux with `process.exit(1)`, crashing agents in Docker, CI/CD, or Windows environments without tmux installed.
  3. Every single file edit executed synchronous `prettier` and `tsc --noEmit`, choking execution and polluting stderr with irrelevant compiler noise.

#### The Fix in code-anything:
- **Constructive Guidelines Over Hard Blocks**: Replaced abrupt `process.exit(1)` crashes with helpful contextual advisories and rule enforcement.
- **Scoped Formatting**: File formatting is run quietly without blocking agent execution or failing when tools are missing.
- **Safety Guardrails**: Instead of blocking markdown files, safety hooks focus on genuine hazards: preventing recursive root deletion (`rm -rf /`) and alerting before force-pushing to main.

---

### 5. Fragile Runtime & Environment Assumptions

#### The Flaw in everything-claude-code & Early Ports:
- Many hook scripts in `everything-claude-code` relied on bash shell scripts (`.sh`).
- Early OpenCode ports made unsafe assumptions like `var { spawn } = globalThis.Bun;`, which crashes immediately with `TypeError: Cannot destructure property 'spawn' of 'globalThis.Bun' as it is undefined` under standard Node.js environments.

#### The Fix in code-anything:
- **Standard ECMAScript & Node.js 18+**: Zero dependency on Bun-specific globals or bash idiosyncrasies.
- **Cross-Platform Compatibility**: Fully tested on Linux, macOS, and Windows.
- **Robust Fallbacks**: Automatically falls back to available tools without crashing.

---

### 6. Memory Persistence: Raw Dumps vs. Pre-Compaction Snapshots

#### The Flaw in everything-claude-code:
`everything-claude-code` saved raw session transcripts to `~/.claude/sessions/*.tmp`.
- **The Problem**: Files grew indefinitely with raw conversation history, tool calls, and repetition. Upon session resumption, it dumped raw transcripts back into the prompt, consuming up to 50k tokens of context window right at startup.

#### The Fix in code-anything:
- **Pre-Compaction Hook**: Implements OpenCode's native `experimental.session.compacting` event.
- **Structured Snapshots**: Captures a clean, structured JSON state snapshot (`.opencode/sessions/compaction-snapshot-<timestamp>.json`) containing active goals, key decisions, and modified files before compaction occurs.
- **Zero Token Pollution**: Does not force-feed gigabytes of raw historical tokens back into the prompt on start.

---

### 7. Installation Friction: Manual Symlinks vs. NPX One-Liner

#### The Flaw in everything-claude-code:
Installing `everything-claude-code` required manual git cloning, creating dozens of symlinks, copying hooks, and manually editing JSON files.

#### The Fix in code-anything:
Users simply run:
```bash
npx code-anything
```
- Automatically detects OpenCode and Graphify.
- Non-destructively merges configuration (preserves existing API keys, providers, and plugins).
- Automatic timestamped backup (`opencode.jsonc.bak`).
- Ready to code in seconds!
