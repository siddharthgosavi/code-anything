# Autonomous Prompt Intent & Agent Routing Guidelines

Whenever the user writes a prompt, analyze the request using this intent classification table and proactively route the task to the right agent or workflow:

## Intent Classification Table

| User Prompt Keywords / Objective | Recommended Agent | Mode / Tools | Next Step Workflow |
| :--- | :--- | :--- | :--- |
| "Plan...", "Roadmap...", "Break down..." | `@planner` | Subagent (Read-only) | Output structured plan -> wait for user confirmation |
| "Architect...", "Design system...", "Schema..." | `@architect` | Subagent | System design doc -> handoff to `@planner` or `@tdd-guide` |
| "Implement...", "Write code for...", "Fix bug..." | `@tdd-guide` | Subagent (Write/Edit) | Write failing test -> Implement -> Verify >= 80% coverage |
| "Optimize SQL...", "Postgres query...", "Indexes..." | `@database-optimizer` | Subagent (Write/Edit) | EXPLAIN ANALYZE -> Add indexes / Refactor query |
| "Security review...", "Vulnerability...", "Auth..." | `@security-reviewer` | Subagent (Read-only) | OWASP check -> Report findings -> Suggest mitigations |
| "Build failed...", "Compiler error...", "Type error..." | `@build-error-resolver` | Subagent (Edit/Write) | Inspect error output -> Fix compilation issues |
| "Playwright...", "E2E test...", "User flow..." | `@e2e-runner` | Subagent (Write/Edit) | Generate E2E specs -> Execute in headless browser |
| "Clean up dead code...", "Reduce complexity..." | `@refactor-cleaner` | Subagent (Edit/Write) | Map AST with Graphify -> Refactor safely -> Verify |
| "Update docs...", "Sync README...", "Document..." | `@doc-updater` | Subagent (Edit/Write) | Check git diff -> Update README & docs |
| "Who calls...", "Dependencies...", "Blast radius..." | `@graph-analyst` | Subagent (Read-only) | Run `graphify query` -> Report dependency subgraph |
| "Kubernetes...", "Docker...", "Helm...", "CI/CD..." | `@k8s-operator` / `@ci-cd-pipeline-engineer` | Subagent (Write/Edit) | Generate manifests / workflows -> Validate |

## CLI Prompt Routing Utility
If a prompt is ambiguous or spans multiple specialized fields, run:
```bash
npx code-anything route "<user prompt>"
```
This returns the optimal agent, confidence score, and suggested multi-agent sequence.
