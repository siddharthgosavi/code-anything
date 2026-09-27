# ADR-004: Package Rename — everything-opencode → code-anything

**Status:** Accepted
**Date:** 2026-09-27
**Deciders:** Software Architect (trade-off analysis), PR & Communications Manager (narrative)

## Context
The npm name `everything-opencode` is held by an unrelated package (`jakezp`, v0.1.6). The `npx everything-opencode` quick-start therefore installs someone else's code — a functional blocker (SEC-adjacent: supply-chain confusion) and a brand blocker (BRAND-1). "everything-*" is also a crowded, unprotectable naming family cloned from the Claude ecosystem. The GitHub repo already lives at `siddharthgosavi/code-anything`.

## Decision
Rename the npm package, CLI bin, plugin id, and all references to **`code-anything`**, matching the existing GitHub repo name. Single bin alias (drop legacy `opencode-everything`). One name everywhere: repo, npm, CLI, plugin id, docs.

## Options considered
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Keep `everything-opencode`, file npm name dispute | No code churn | Upstream dispute takes weeks-months, outcome uncertain; stays in crowded unprotectable family; platform-hostage if OpenCode renames | ❌ |
| Scoped `@syviontech/everything-opencode` | Available now, brand-safe | `npx @scope/pkg` UX friction; scoped = reads "private-ish" for OSS adoption | ❌ (kept as fallback) |
| **`code-anything`** (chosen) | npm AVAILABLE; equals GitHub repo name (single identity); distinct & searchable; not a Claude-parasite name; platform-neutral (works if OpenCode forks/renames) | Generic words — weak on its own, so pair with a positioning line + mark; needs full rename sweep | ✅ |

## Consequences
- `npx code-anything` resolves to THIS project — the blocker is gone without waiting on npm arbitration.
- Every touchpoint (repo URL, npm, bin, plugin id, README) shares one string → no cross-surface drift (directly addresses BRAND-2 consistency).
- Trade-off paid: "code-anything" is common English, so brand distinctiveness comes from the **tagline** ("The agent ops layer for AI coding CLIs") and the **mark** (logo/OG), not the word alone.
- Rename sweep must be complete and verified (`grep -r` = 0 stale refs, suite green) or it re-creates the ARCH-1 drift we just fixed. Enforced below.

## Migration
Old readers: update `opencode.json` plugin entry `everything-opencode` → `code-anything`. `doctor` prints the hint. No data migration; configs are re-merged on next install.
