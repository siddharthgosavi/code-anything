---
name: coding-standards
description: Universal coding standards: immutability, naming conventions, small focused functions, robust error handling, and clean code hygiene.
---

# Universal Coding Standards

## 1. Clean Code & Simplicity
- **Small, focused functions**: Keep functions under 40 lines. Each function does one thing well.
- **Low cyclomatic complexity**: Guard clauses and early returns instead of deeply nested `if/else` blocks.
- **Descriptive naming**: Names reveal intent (`isUserAuthenticated`, `fetchPendingTransactions`). Avoid abbreviations (`tmp`, `data`, `obj`, `res2`).

## 2. Immutability & State Safety
- Prefer immutable data structures (`const`, `readonly`, `Object.freeze`, persistent records).
- Avoid mutating arguments or global variables.
- Return new object/array copies on transformation (`map`, `filter`, spread syntax).

## 3. Strong Typing & Interface Segregation
- Avoid escape hatches (`any` in TypeScript, raw `interface{}` in Go, untyped `Any` in Python).
- Define narrow, purpose-specific interfaces rather than giant god-interfaces.
- Validate external inputs at system boundaries using schemas (Zod, Pydantic, serde, etc.).

## 4. Error Handling
- Never swallow exceptions silently.
- Always include contextual details when wrapping or logging errors.
- Clean up resources in `finally` blocks, defer statements, or RAII guards.
