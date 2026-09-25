# OpenCode Agent Guidelines & Instructions

Welcome to this repository. This project is configured with **everything-opencode** and **Graphify** code intelligence.

## 1. Codebase Navigation with Graphify
- Before running broad or blind `grep` commands across the repository, check if `graphify-out/graph.json` exists.
- Run `graphify query "<symbol or question>"` via bash to obtain the exact dependency subgraph and call flow.
- Review `graphify-out/GRAPH_REPORT.md` for architecture clusters and community summaries.
- Run `/graph-build` or `graphify extract . --code-only` to update the AST graph when new files are added.

## 2. Planning & Phased Execution
- For non-trivial features, refactoring, or migrations, run `/plan` to invoke the `planner` agent.
- Formulate a phased plan detailing files, functions, dependencies, and risks.
- **NEVER** write or edit code while in planning mode until explicit confirmation is given.

## 3. Test-Driven Development (TDD)
- Use `/tdd` to invoke the `tdd-guide` agent.
- Adhere strictly to RED -> GREEN -> REFACTOR.
- Maintain >= 80% test coverage on all new or modified logic.

## 4. Verification Loops
- Run `/verify` before completing tasks.
- Ensure:
  1. Linting & formatting pass cleanly.
  2. Type checker passes with zero diagnostics.
  3. All unit and integration tests pass.
  4. Build compiles cleanly without warnings.

## 5. Security Guardrails
- Zero hardcoded secrets, API keys, or credentials.
- Parameterize all SQL/database queries.
- Sanitize user inputs and validate schemas at boundaries.
- Run `/code-review` before opening Pull Requests.

## 6. Context Window & Memory
- Avoid dumping large files or unbounded command outputs into the terminal.
- Run `/checkpoint` to save progress before major milestones.
- Keep tool counts monitored; compact strategically when sessions grow long.
