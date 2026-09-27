# ADR-003: Hooks Must Not Mutate Executed Commands

**Status:** Accepted
**Date:** 2026-09-27

## Context
`tool.execute.before` previously prepended `echo ... ;` into shell commands based on CWD state (`graphify-out/graph.json` presence). A cloned repo could therefore alter executed shell text (SEC-1), and the `rm -rf` guard was bypassable theater (SEC-2).

## Decision
Hooks never edit `output.args`. Advisories go out-of-band (`console.error`, surfaced to the model, invisible to the command). The destructive guard is documented as a best-effort tripwire with explicitly checked patterns and env-var opt-out; subprocess spawns use argv-form execution (no shell).

## Consequences
Project-local data is no longer an instruction sink. Safety claims become scoped and verifiable instead of implied.
