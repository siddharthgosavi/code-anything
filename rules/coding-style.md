# Coding Style Rules

- **Immutability First**: Default to immutable variables and data structures. Avoid in-place mutations of arrays and objects.
- **Short Functions**: Strive for functions under 40 lines. Each function should have a single, well-defined responsibility.
- **Guard Clauses**: Use early returns to reduce nesting levels. Never nest more than 3 levels deep.
- **Explicit Types**: Avoid wildcard types (`any`, `interface{}`). Fully type function signatures and return types.
- **Clean Naming**: Use descriptive, domain-aligned names. Avoid cryptic abbreviations.
