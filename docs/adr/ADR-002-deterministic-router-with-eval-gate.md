# ADR-002: Deterministic v1 Router with Measured Eval Gate

**Status:** Accepted
**Date:** 2026-09-27

## Context
The router's keyword/token scorer had no quality measurement; probe-driven mistakes ("docker compose" -> `blender-add-on-engineer`, "kubernetes helm" -> `data-visualization-engineer`) showed persona agents hijacking technical prompts.

## Decision
Keep a fully deterministic scorer (Tier-1 keywords + curated Tier-2 domain overrides in `AGENCY_KEYWORD_OVERRIDES` + persona gating + length-normalized description overlap). Gate all scoring changes behind `tests/routing-eval.test.js` (golden set, top-1 >=85%). Optional embeddings scoring is a strategy behind the same seam and must beat v1 on the published set before defaulting.

## Consequences
Zero provider calls, instant, reproducible; scoring edits are regression-checked.

## Limitations (honesty note)
The golden set was calibrated from observed behavior on 2026-09-27, so early "100%" numbers overstate real-world accuracy -- treat the eval as a regression guard, not a semantic-quality claim. New misses get added as cases. The full ARCH-3 scoring/ strategy seam (extracting the curated overrides + weights into modules) is deferred to Phase 2; the eval makes that refactor safe when taken.
