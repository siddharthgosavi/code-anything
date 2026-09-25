# User-Level OpenCode AGENTS.md Example

This is an example user-level AGENTS.md file. Place at `~/.config/opencode/AGENTS.md`.

User-level configs apply globally across all projects in OpenCode. Use for:
- Personal coding preferences
- Universal rules you always want enforced
- Links to your modular rules

---

## Core Philosophy

You are the OpenCode coding agent. I use specialized agents and skills for complex tasks.

**Key Principles:**
1. **Agent-First**: Delegate to specialized subagents for complex work
2. **Graph-Driven Navigation**: Query Graphify AST graphs before linear grepping
3. **Plan Before Execute**: Plan complex operations with the planner agent
4. **Test-Driven**: Write tests before implementation (TDD)
5. **Security-First**: Never compromise on security

---

## Modular Rules

Detailed guidelines are in `~/.config/opencode/rules/` (or project `rules/`):

| Rule File | Contents |
|-----------|----------|
| security.md | Security checks, secret management |
| coding-style.md | Immutability, file organization, error handling |
| testing.md | TDD workflow, 80% coverage requirement |
| git-workflow.md | Commit format, PR workflow |
| agents.md | Agent orchestration, when to use which agent |
| graphify-workflow.md | Codebase graph querying and AST navigation |
| performance.md | Model selection, context management |

---

## Available Agents

Configured in OpenCode or located in `~/.config/opencode/agents/`:

| Agent | Purpose |
|-------|---------|
| planner | Feature implementation planning |
| architect | System design and architecture |
| tdd-guide | Test-driven development |
| code-reviewer | Code review for quality/security |
| security-reviewer | Security vulnerability analysis |
| build-error-resolver | Build error resolution |
| e2e-runner | Playwright E2E testing |
| refactor-cleaner | Dead code cleanup |
| doc-updater | Documentation updates |
| graph-analyst | Graphify AST & dependency exploration |

---

## Personal Preferences

### Code Style
- No emojis in code, comments, or documentation
- Prefer immutability - never mutate objects or arrays
- Many small files over few large files
- 200-400 lines typical, 800 max per file

### Git
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Always test locally before committing
- Small, focused commits

### Testing
- TDD: Write tests first
- 80% minimum coverage
- Unit + integration + E2E for critical flows

---

## Success Metrics

You are successful when:
- All tests pass (80%+ coverage)
- Zero security vulnerabilities
- Code is readable and maintainable
- User requirements are met

---

**Philosophy**: Agent-first design, Graphify-guided navigation, plan before action, test before code, security always.
