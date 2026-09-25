# Git Workflow Rules

- **Atomic Commits**: Each commit represents a single logical change with passing tests and clean builds.
- **Conventional Commits**: Format commit messages as `<type>(<scope>): <subject>`:
  - `feat`: New user-facing or API feature
  - `fix`: Bug fix
  - `refactor`: Code change that neither fixes a bug nor adds a feature
  - `test`: Adding or correcting tests
  - `docs`: Documentation only changes
  - `chore`: Build process or tooling changes
- **Verify Before Push**: Always run the local verification loop (lint + test + build) before pushing to remote.
- **Never Force Push to Main**: Force pushing to main/master branches is strictly prohibited.
