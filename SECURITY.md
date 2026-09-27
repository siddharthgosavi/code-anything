# Security Policy

code-anything configures OpenCode (your coding agent), injects lifecycle
hooks, and edits `opencode.jsonc`. We take that responsibility seriously.

## What this project guarantees (and what it doesn't)

**Guarantees (verified by `tests/`):**
- Non-destructive config merges with `.bak` backups; existing providers, keys, and MCP servers are preserved.
- Never terminates, signals, or kills running `opencode` processes.
- Hooks never mutate executed commands (`tests/plugin-hooks.test.js`, ADR-003).
- Zero runtime dependencies; zero network egress from CLI, plugin, hooks, and scripts.
- Destructive-command tripwire is **best-effort only** — it catches literal `rm -rf /` / `~` / `/*` / `$HOME`, `mkfs`, raw-device `dd`, and fork bombs. It is NOT a sandbox. OpenCode permission prompts remain your safety boundary.

**Non-guarantees:**
- We cannot secure the repositories or MCP servers you choose to configure.
- Agent behavior depends on your model provider and prompts; the circuit breaker prevents runaway spend within a session, not bad model output.

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.x     | ✅        |

## Reporting a vulnerability

Email **security@syviontech.com** or open a [private security advisory](https://github.com/siddharthgosavi/code-anything/security/advisories/new).
Do not open a public issue for unfixed vulnerabilities.

We aim to acknowledge within 72 hours and ship a fix or advisory within 14 days for confirmed issues.

## Threat model summary

| Vector | Mitigation |
| ------ | ---------- |
| Malicious clone changing agent behavior via local files | Advisories are out-of-band only (no command injection from CWD state) |
| Supply chain | Zero runtime deps; `npm audit --audit-level=high` runs in CI |
| Credential leakage | Config merge never logs values; plugin reads keys only to preserve them; secret scanning enabled |
| Runaway agent spend | Session-scoped circuit breaker (tool-call caps + identical-repeat detection) |
