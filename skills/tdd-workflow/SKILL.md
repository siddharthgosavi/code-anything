---
name: tdd-workflow
description: Enforce Test-Driven Development (Red-Green-Refactor) practices, test isolation, mock patterns, and >= 80% coverage.
---

# Test-Driven Development (TDD) Workflow

## Core Philosophy
Write tests BEFORE writing implementation code. No production code is committed without an automated test demonstrating why it exists.

## The 4-Phase Cycle

### Phase 1: RED (Failing Test)
1. Write a minimal unit or integration test describing desired functionality.
2. Execute the test runner (e.g. `npm test`, `pytest`, `cargo test`, `go test`).
3. CONFIRM the test fails for the expected reason (not due to syntax error or misconfigured test setup).

### Phase 2: GREEN (Minimal Implementation)
1. Implement the simplest code that makes the test pass.
2. Avoid premature optimization or implementing speculative features.
3. Re-run tests to confirm all tests pass.

### Phase 3: REFACTOR (Improve Structure)
1. Clean up duplicated logic, improve variable names, extract helpers.
2. Verify tests remain 100% green throughout refactoring.

### Phase 4: COVERAGE & EDGE CASES
1. Add boundary and negative test cases:
   - Null / undefined / empty inputs
   - Boundary integers / oversized payloads
   - Network failure / timeouts
   - Concurrent race conditions
2. Verify line and branch test coverage meets or exceeds 80%.
