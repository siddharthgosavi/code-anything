# Testing Rules

- **Test-Driven Mindset**: Write tests before implementing new features or fixing bugs.
- **Coverage Target**: Maintain >= 80% line and branch coverage on new logic.
- **Test Isolation**: Tests must be independent and repeatable. No shared mutable state across test cases.
- **Fast Execution**: Keep unit test suites blazing fast. Mock expensive external services and network I/O.
- **Assert Behavior**: Test contracts and external behaviors rather than internal implementation details.
