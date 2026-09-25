# Everything OpenCode - WorldFlowAI Setup Guide

Quick reference for using the `everything-opencode` toolkit with synapse and arbiter projects.

## Installed Components

| Type | Items |
|------|-------|
| **Agents** | architect, build-error-resolver, code-reviewer, planner, refactor-cleaner, security-reviewer, tdd-guide, doc-updater, e2e-runner, graph-analyst |
| **Commands** | /build-fix, /checkpoint, /code-review, /learn, /plan, /refactor-clean, /tdd, /verify, /setup-pm, /e2e, /graph-build, /graph-query |
| **Skills** | backend-patterns, coding-standards, continuous-learning, eval-harness, security-review, verification-loop, graphify-intelligence |
| **Rules** | coding-style, git-workflow, security, testing, hooks, agent-instructions |
| **Hooks** | memory-persistence, strategic-compact, continuous-learning-activator, graphify-reminder |

## Quick Start Workflows

### Starting a New Feature

```
1. /plan              # Plan the implementation approach
2. /tdd               # Write tests first
3. /verify            # Validate changes work
4. /code-review       # Self-review before PR
5. /checkpoint        # Save progress state
```

### Deep Architecture & Knowledge Graph Analysis

```
1. /graph-build       # Index AST call-graph without API token consumption
2. /graph-query <sym> # Query callers, callees, and dependencies
3. @graph-analyst     # Ask graph analyst for architecture & blast-radius analysis
```

### Debugging Build Errors (Synapse/Rust)

```
/build-fix            # Analyzes cargo errors and suggests fixes
```

### Code Quality Review

```
/code-review          # Comprehensive code review
/refactor-clean       # Identify refactoring opportunities
```

### Learning & Memory

```
/learn                # Extract reusable knowledge from current session
/checkpoint           # Save session state for later resumption
```

## Project-Specific Guidance

### Synapse (Rust Workspace)

**Best agents for synapse:**
- `build-error-resolver` - Rust compile errors can be cryptic
- `architect` - Multi-crate workspace decisions
- `security-reviewer` - LLM data handling requires scrutiny
- `graph-analyst` - Call-graph traversal across Rust workspace crates

**Typical workflow:**
```bash
# In synapse directory
opencode

# Plan feature
> /plan

# After implementation
> cargo build 2>&1 | head -50  # If errors...
> /build-fix

# Before PR
> /code-review
> cargo +nightly fmt --check && cargo clippy --all-targets -- -D warnings && cargo test
```

**Key synapse patterns:**
- Use `parking_lot::{Mutex,RwLock}` not std
- Max 100 char line width
- Clippy pedantic + nursery enabled
- Conventional commits required

### Arbiter (ML/Python)

**Best agents for arbiter:**
- `tdd-guide` - ML code benefits from test-driven approach
- `architect` - Pipeline architecture decisions
- `eval-harness` - Model evaluation patterns
- `graph-analyst` - Python function call tree and dependency analysis

**Typical workflow:**
```bash
# In arbiter directory
opencode

# Plan experiment/feature
> /plan

# Test-driven development
> /tdd

# Validate
> /verify
```

**Key arbiter patterns:**
- Recall-focused metrics (safety critical)
- PII/Org sensitivity handling
- Model lifecycle management

## Hooks (Automatic)

These run automatically in OpenCode via plugin lifecycle hooks or configured shell hooks:

| Hook | When | What it does |
|------|------|--------------|
| SessionStart | New session | Loads recent session context and detects package manager |
| PreCompact | Before /compact | Saves state before context reduction |
| Stop | Session end | Persists learnings, runs continuous-learning |
| PreToolUse (Edit/Write) | Every ~40-50 edits | Suggests running /checkpoint or /compact |
| PreToolUse (Bash) | Code search | Suggests graphify query when knowledge graph exists |

### Memory Persistence

Sessions automatically save state to `~/.config/opencode/sessions/` or `.opencode/sessions/`. To resume:
```bash
# Start new session, previous context loads automatically
opencode

# Or inspect recent session files
ls -la ~/.config/opencode/sessions/
```

### Strategic Compaction

After extended tool calls, you'll see a reminder to run `/compact` or `/checkpoint`. This helps maintain context quality during long sessions.

## When to Use Each Agent

| Situation | Agent/Command |
|-----------|---------------|
| Planning new feature | `/plan` → planner agent |
| Designing system architecture | architect agent |
| AST call-graph inspection | `/graph-query` → graph-analyst |
| Fixing Rust / build errors | `/build-fix` → build-error-resolver |
| Pre-PR quality check | `/code-review` → code-reviewer |
| Security-sensitive changes | security-reviewer agent |
| Writing tests first | `/tdd` → tdd-guide agent |
| Cleaning up code | `/refactor-clean` → refactor-cleaner |
| Updating documentation | doc-updater agent |
| Validating changes | `/verify` → verification-loop skill |

## Installation & Setup

```bash
# One-shot installation via npx
npx everything-opencode

# Or add as plugin in opencode.json
{
  "plugin": ["everything-opencode"]
}
```

## File Locations

```
~/.config/opencode/
|-- opencode.json                         # Global OpenCode configuration
|-- package-manager.json                  # Package manager preference
|-- sessions/                             # Session memory files
`-- skills/learned/                       # Learned skills

./ (Project Root)
|-- opencode.json                         # Project OpenCode configuration
|-- .opencode/
|   |-- package-manager.json              # Project package manager
|   `-- sessions/                         # Project session snapshots
|-- graphify-out/                         # Graphify AST knowledge graph
`-- AGENTS.md                             # Agent instructions and rules
```

## Troubleshooting

**Plugin or commands not showing:**
```bash
# Run doctor to verify environment
npx everything-opencode doctor
```

**Verify package manager:**
```bash
node scripts/setup-package-manager.js --detect
```
