---
name: eval-harness
description: Framework and methodology for evaluating code modifications, regression benchmarks, grader types, and pass@k metrics.
---

# Agent Evaluation & Verification Harness

## Purpose
Systematic verification and benchmarking of agent actions to ensure high quality code output and zero regression rate.

## Evaluation Dimensions

### 1. Deterministic Graders
- **Syntax / Compilation Grader**: Pass if zero compiler / linter errors.
- **Unit Test Grader**: Pass if 100% of unit tests pass and new code has test coverage.
- **Type Grader**: Pass if type checker emits 0 diagnostics.

### 2. Behavioral Graders
- **Regression Grader**: Existing baseline tests must pass without modification.
- **Contract Grader**: API schema, response shapes, and database constraints remain backward-compatible.
- **Idempotency Grader**: Applying the verification loop multiple times yields consistent results.

### 3. Metric Tracking
- Track pass@1 (tests pass on first attempt) vs pass@k (tests pass after k iterations).
- Aim for pass@1 > 85% by validating plans before code modification.
