/**
 * OpenCode slash commands with parameter support and Graphify awareness.
 */

export const COMMANDS = {
  plan: {
    description: "Restate requirements, assess risks, and create a phased step-by-step implementation plan before touching code.",
    agent: "planner",
    template: `Please analyze the following task and create a comprehensive implementation plan before making any code changes:

Task: $ARGV

1. Restate requirements and constraints clearly.
2. Check if a Graphify knowledge graph exists in graphify-out/ to review component connections.
3. Detail phased steps with file paths, functions, and risk level.
4. Present the plan and WAIT for my explicit confirmation before proceeding.`
  },

  tdd: {
    description: "Implement feature or bug fix using strict Test-Driven Development (Red-Green-Refactor).",
    agent: "tdd-guide",
    template: `Follow strict Test-Driven Development to implement:

Target: $ARGV

1. RED: Write a failing test first that specifies the expected behavior. Run it and verify failure.
2. GREEN: Write the minimal implementation to make the test pass.
3. REFACTOR: Clean up implementation, verify tests remain green, and ensure >= 80% coverage.`
  },

  verify: {
    description: "Run comprehensive verification loop: formatting, type-check, tests, and build.",
    template: `Run the project verification loop:
1. Syntax / Formatting check
2. Type checking (e.g. tsc, cargo check, go vet, etc.)
3. Test suite execution
4. Build verification

Report results clearly with any actionable fixes required.`
  },

  "code-review": {
    description: "Review current git diff / changes for bugs, architecture adherence, and security.",
    agent: "code-reviewer",
    template: `Perform a thorough code review of recent changes:

Focus areas: $ARGV

1. Check git diff / status.
2. Review correctness, edge cases, error handling.
3. Check for security vulnerabilities and performance bottlenecks.
4. Provide structured feedback (Critical, Major, Minor, Commendations).`
  },

  "build-fix": {
    description: "Analyze build, compiler, or type errors and apply minimal targeted fixes.",
    agent: "build-error-resolver",
    template: `Investigate and fix current build or compiler errors:

Context / Error: $ARGV

1. Reproduce the error using the project's build command.
2. Analyze root cause without hacky suppressions.
3. Apply minimal correct fix.
4. Re-run build to verify resolution.`
  },

  "refactor-clean": {
    description: "Identify and eliminate dead code, simplify functions, and reduce complexity.",
    agent: "refactor-cleaner",
    template: `Clean up and refactor target code:

Target: $ARGV

1. Run tests before touching anything to establish baseline.
2. Remove dead code, unused exports, and duplicate logic.
3. Simplify nested branching.
4. Re-run tests to guarantee zero regressions.`
  },

  e2e: {
    description: "Generate and execute end-to-end user journey tests.",
    agent: "e2e-runner",
    template: `Create or update E2E tests for the following flow:

Flow: $ARGV

Use resilient locators (getByRole, getByText), verify user journeys, and test happy and failure paths.`
  },

  "test-coverage": {
    description: "Measure test coverage and generate tests for uncovered paths to reach >= 80%.",
    template: `Analyze test coverage for: $ARGV

1. Run test suite with coverage reporting enabled.
2. Identify uncovered branches and edge cases.
3. Add targeted unit/integration tests to bring coverage to >= 80%.`
  },

  "update-docs": {
    description: "Synchronize README, API documentation, and architecture notes with code changes.",
    agent: "doc-updater",
    template: `Review recent changes and update documentation:

1. Check modified files and new APIs.
2. Update README.md or API docs as necessary.
3. Ensure setup, usage examples, and architecture references are completely accurate.`
  },

  checkpoint: {
    description: "Save current progress state and pending tasks for session resumption.",
    template: `Create a progress checkpoint:
1. Summarize what has been accomplished in this session.
2. List files modified.
3. Document any active architectural decisions.
4. List remaining pending tasks.`
  },

  learn: {
    description: "Extract reusable knowledge, conventions, and patterns discovered during the session.",
    template: `Extract learnings from this session:
1. What project conventions, gotchas, or unique patterns were discovered?
2. Format as reusable guidelines suitable for AGENTS.md or project documentation.`
  },

  "graph-query": {
    description: "Query the codebase knowledge graph via Graphify for symbols, callers, and dependencies.",
    agent: "graph-analyst",
    template: `Run a Graphify knowledge graph query:

Query: $ARGV

Execute "graphify query \\"$ARGV\\"" using bash and summarize the relevant nodes, call paths, and connected dependencies.`
  },

  "graph-build": {
    description: "Build or refresh the Graphify AST knowledge graph for the current repository.",
    agent: "graph-analyst",
    template: `Build or refresh the codebase knowledge graph:

Execute "graphify extract . --code-only" to generate or update graphify-out/graph.json. Then inspect node and community statistics.`
  },

  "setup-pm": {
    description: "Configure or switch project package manager (npm, pnpm, yarn, bun).",
    template: `Configure package manager preference:

Selection / Preference: $ARGV

Detect or set preferred package manager (npm, pnpm, yarn, bun) and verify lockfiles.`
  }
};
