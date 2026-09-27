---
name: agent-orchestrator
description: Autonomous agent selection, intent routing, and multi-agent workflow orchestration for OpenCode. Automatically matches user prompts to the most capable specialist agent or coordinates multi-agent handoffs.
---

# Autonomous Agent Routing & Orchestration Skill

This skill empowers OpenCode to dynamically analyze incoming user prompts, select the most relevant specialist subagent from the 10 Core Meta-Agents and 279 Agency Domain Specialists, and execute seamless multi-agent workflows.

---

## 1. Fast Intent Classification & Agent Routing

Whenever a user writes a prompt, identify the primary domain and invoke or delegate to the corresponding specialist:

| User Intent / Task Domain | Primary Agent | Workflow Sequence | Slash Command |
| :--- | :--- | :--- | :--- |
| **New Feature / Complex Implementation** | `@planner` | `@planner` ➔ `@architect` ➔ `@tdd-guide` ➔ `@code-reviewer` | `/plan` |
| **System Architecture / High-Level Design** | `@architect` | `@architect` ➔ `@planner` ➔ `@code-reviewer` | `/plan` |
| **Test-Driven Feature / Bug Fix** | `@tdd-guide` | `@tdd-guide` ➔ `@code-reviewer` | `/tdd` |
| **Database Schema, SQL Queries, Indexing** | `@database-optimizer` | `@database-optimizer` ➔ `@tdd-guide` ➔ `@code-reviewer` | - |
| **Security Audit, OWASP, Auth, Secrets** | `@security-reviewer` | `@security-reviewer` ➔ `@code-reviewer` | `/code-review` |
| **Build Failure, Compiler / Type Errors** | `@build-error-resolver` | `@build-error-resolver` ➔ `@tdd-guide` | `/build-fix` |
| **Playwright / Cypress E2E Browser Testing** | `@e2e-runner` | `@e2e-runner` ➔ `@code-reviewer` | `/e2e` |
| **Dead Code, Refactoring & Complexity** | `@refactor-cleaner` | `@graph-analyst` ➔ `@refactor-cleaner` ➔ `@tdd-guide` | `/refactor-clean` |
| **Documentation, README, API Sync** | `@doc-updater` | `@doc-updater` | `/update-docs` |
| **Codebase Navigation & Blast Radius** | `@graph-analyst` | `@graph-analyst` ➔ (Implementation Agent) | `/graph-query` |
| **Kubernetes, Cloud & DevOps** | `@k8s-operator` | `@terraform-expert` ➔ `@k8s-operator` ➔ `@security-reviewer` | - |
| **GraphQL Schema & Resolvers** | `@graphql-architect` | `@graphql-architect` ➔ `@tdd-guide` | - |
| **Accessibility (a11y) & WCAG Audits** | `@accessibility-auditor`| `@accessibility-auditor` ➔ `@tdd-guide` | - |

---

## 2. Dynamic Agency Specialist Lookup

If the user's prompt involves a specialized domain outside the core 10 meta-agents (e.g. GIS, Game Dev, Machine Learning, Payment Systems, Medical Compliance):

1. Run the routing query via CLI:
   ```bash
   npx code-anything route "<user task prompt>"
   ```
2. Or search the 279 Agency catalog:
   ```bash
   npx code-anything agency search "<keyword>"
   ```
3. Load the specialist agent:
   ```bash
   npx code-anything agency install <slug>
   ```

---

## 3. Sequential Multi-Agent Handoff Protocol

When coordinating multiple agents for a non-trivial task, follow this structured handoff protocol:

```markdown
### 🔄 Subagent Handoff: [@source-agent ➔ @target-agent]
- **Goal Completed**: [Summary of analysis or code produced]
- **Key Artifacts**: [Files created/modified, diagrams, schemas]
- **Handoff Directive**: [Exact objective for the next specialist]
- **Next Subagent**: @<target-agent>
```

---

## 4. Execution Rules

1. **Auto-Select Promptly**: Do not attempt to solve highly specialized tasks in a generic manner when a dedicated specialist agent exists.
2. **Read-Only Planning Guard**: If `@planner` is invoked, maintain a strict read-only posture until the user reviews and confirms the phased plan.
3. **Graphify AST First**: For architectural or refactoring tasks, query the Graphify knowledge graph (`graphify query "<symbol>"`) to map dependencies before making edits.
