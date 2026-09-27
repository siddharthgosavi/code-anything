# ADR-001: Single Source of Truth for Agent/Command Definitions

**Status:** Proposed
**Date:** 2026-09-27

## Context
Three delivery channels currently exist — markdown files (`agents/*.md`, `commands/*.md`), in-memory JS catalogs (`src/agents/index.js`, `src/commands/index.js` registered via the plugin), and OpenCode's directory conventions. They drift silently (see `docs/PROJECT_REVIEW.md` ARCH-1; README cites agent slugs like `graphql-architect` / `k8s-operator` that do not exist in the agency catalog).

## Decision
Markdown files are canonical. The JS catalogs become build artifacts generated from markdown (or the plugin reads installed files natively). Until the generator lands, `tests/catalog-parity.test.js` fails CI on any drift between JS catalogs, `agents/*.md`, and router slugs.

## Consequences
Adds a build/codegen step; markdown frontmatter (`description`, `tools`, `model`) becomes the contract; drift becomes a loud CI failure instead of a silent behavior mismatch.
