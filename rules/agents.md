# Autonomous Agent Selection & Delegation Rules

When receiving a user prompt or task, evaluate the task's intent and domain to select and delegate to the most capable specialist agent:

## 1. Core Meta-Agent Routing Matrix
- **Implementation Planning / Roadmaps / Multi-Phase Tasks**: Invoke `@planner` (`/plan`). Maintain read-only posture until plan approval.
- **System Architecture / High-Level Design / Module Boundaries**: Invoke `@architect`.
- **Feature Implementation / Bug Fixing / TDD**: Invoke `@tdd-guide` (`/tdd`). Enforce Red -> Green -> Refactor and >= 80% coverage.
- **Code Quality / PR Diffs / Maintainability**: Invoke `@code-reviewer` (`/code-review`).
- **Security Audits / Secrets / Auth / OWASP**: Invoke `@security-reviewer`.
- **Compiler / Build / Type Errors**: Invoke `@build-error-resolver` (`/build-fix`).
- **Browser Automation / E2E Testing**: Invoke `@e2e-runner` (`/e2e`).
- **Dead Code Cleanup / Refactoring**: Invoke `@refactor-cleaner` (`/refactor-clean`).
- **Documentation & README Synchronization**: Invoke `@doc-updater` (`/update-docs`).
- **Call Flow / AST Blast Radius Navigation**: Invoke `@graph-analyst` (`/graph-query`).

## 2. Agency Specialists Auto-Selection (279 Roles across 18 Divisions)
For deep domain-specific tasks, invoke or install the corresponding Agency Specialist:
- **Database / SQL / Indexing**: `@database-optimizer`, `@database-reliability-engineer`
- **GraphQL**: `@graphql-architect`
- **DevOps / Containers**: `@k8s-operator`, `@ci-cd-pipeline-engineer`, `@terraform-expert`
- **Accessibility**: `@accessibility-auditor`
- **Performance & Benchmarking**: `@performance-benchmarker`
- **API Design & Testing**: `@api-designer`, `@api-tester`
- *To find any domain specialist*: Run `npx code-anything route "<task prompt>"` or `npx code-anything agency search "<keyword>"`.

## 3. Delegation Guardrails
- **Plan Approval**: Never modify code during planning until explicit user confirmation is given.
- **Isolate Subtasks**: Subagents must focus strictly on their designated domain and report structured findings.
- **Sequential Multi-Agent Handoffs**: Pass context from Planner -> Architect -> Specialist -> TDD Guide -> Code Reviewer.

