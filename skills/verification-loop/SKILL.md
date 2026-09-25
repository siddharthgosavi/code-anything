---
name: verification-loop
description: Continuous verification loop covering formatting, type checking, unit tests, integration tests, and build steps.
---

# Continuous Verification Loop

## Purpose
A rigorous, automated verification loop ensures that code remains deployable at all times and regressions are caught immediately.

## Verification Stages

### 1. Formatting & Linting
- Ensure style consistency and identify common lint issues:
  ```bash
  # JS/TS
  npm run lint || npx eslint .
  # Rust
  cargo fmt --check && cargo clippy --all-targets -- -D warnings
  # Go
  golangci-lint run
  # Python
  ruff check . && ruff format --check .
  ```

### 2. Static Type Checking
- Catch type errors and interface contract mismatches:
  ```bash
  # JS/TS
  npx tsc --noEmit
  # Rust
  cargo check --all-targets
  # Python
  mypy .
  ```

### 3. Automated Test Suite
- Run fast unit tests first, then integration tests:
  ```bash
  npm test
  pytest -v
  cargo test
  go test -race ./...
  ```

### 4. Build Artifacts
- Verify that distribution packages and binaries build cleanly without warnings:
  ```bash
  npm run build
  cargo build --release
  go build ./...
  ```
