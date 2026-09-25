# Agent Delegation Rules

- **Use Specialized Subagents**:
  - For planning complex tasks, delegate to `planner`.
  - For system design and architecture, delegate to `architect`.
  - For test-first implementation, delegate to `tdd-guide`.
  - For pre-PR quality audits, delegate to `code-reviewer`.
  - For security vulnerabilities, delegate to `security-reviewer`.
  - For compiler and build troubleshooting, delegate to `build-error-resolver`.
  - For dependency and graph navigation, delegate to `graph-analyst`.
- **Enforce Plan Approval**: Never start modifying code in plan mode until the user explicitly confirms the plan.
- **Isolate Subtasks**: Subagents should focus strictly on their designated scope and report concise, structured findings.
