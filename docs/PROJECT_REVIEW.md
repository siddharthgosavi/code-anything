# code-anything — Project Review Report

**Review date:** 2026-09-27 · **Reviewed at:** commit `071edbf`
**Reviewer lenses:** AI Engineer · AI-Generated Code Security Auditor · Software Architect · Brand Guardian
**Scope:** Full repo — `src/` (~2.6k LOC), `bin/`, `hooks/`, `scripts/`, `tests/`, `agents/` (10 core + 279 agency), `commands/` (17), `skills/` (14), packaging, docs, brand surface.

> **Overall verdict:** Solid open-source seed, not yet a product. Security posture is honest (zero runtime deps, no network egress, no real secrets). Critical gaps: a broken plugin-delivery path, shell-string-mutating hooks, a naive keyword router with no eval, and a generic unprotectable name. All fixable; fix Phase 0 before any public launch.

---

## 1. AI Engineer Review
*Focus: the "intelligence" claims — router quality, Graphify integration, agent-content value, eval story.*

### What works
- Zero-dependency JS core is the right call for an `npx` tool — instant cold start, no supply-chain bloat.
- Token-saving positioning is real: local AST queries beat 50k-token grep loops; circuit breaker and compaction reminders protect spend.
- Agency catalog (279 agents) is a legitimate breadth differentiator.

### Findings

**ENG-1 (High) — Router is bag-of-words, not "autonomous intent routing".**
`src/lib/router.js` scores agents with hand-tuned magic numbers (3.5, 4.0, 1.35, 0.4) over a naive stemmer (`ing/tion/ies/ed/s`) with no synonym handling. "Fix my auth flow that keeps crashing" routes to `tdd-guide` by accident of the word "fix"; any prompt with "test", "implement", or "feature" nearly always lands on `tdd-guide` (weight 1.3, keyword-rich). Fine for v1 — but it is *not* semantic, and README language implies it is.

**ENG-2 (High) — No eval harness for routing accuracy.**
The repo ships an `eval-harness` skill yet never applies it to its own core feature. No golden set of prompt→expected-agent pairs, no precision/recall, no regression detection when keywords are edited. This is the #1 credibility gap vs LLM-based routers (OpenRouter auto-routing, claude-flow).

**ENG-3 (Medium) — Graphify dependency undeclared and silently optional.**
`src/cli/graphify-runner.js` shells out to a `graphify` binary installed via `pip` (per installer warning). No version pin, no `install --with-graphify` that actually installs it, and `hasGraph()` returns true for a truncated/corrupt `graph.json` from a crashed run — `getStats()` then reports `exists: true` with junk counts, and the `graph-analyst` agent trusts it.

**ENG-4 (Medium) — The moat problem.**
The 356 markdown files are the product, and markdown is forkable in an afternoon. The defensible assets are the *hardware*: measured router accuracy, the Graphify integration, and session-safe installer guarantees. Invest there; stop describing persona files as if they were IP.

### Recommendations
1. `tests/routing-golden.json`: 100+ prompt→expected-agent pairs; CI gate at ≥85% top-1 accuracy.
2. Optional embeddings path behind the same eval seam (pluggable provider, local fallback) so you can publish "deterministic v1 vs embeddings v2" numbers.
3. Graphify version handshake + validate before trusting stats; atomic-write discipline.
4. Consent-gated, local-only token-savings stats — the one number that proves the value prop.

---

## 2. AI-Generated Code Security Auditor Review
*Focus: what this tool does to users' machines and configs. Read-only audit; evidence over assertion.*

### Clean findings first (genuine strengths)
- Zero runtime deps, zero lockfile risk — no supply chain to audit.
- No network egress anywhere (`fetch|http.request|axios|curl` in `src/ hooks/ scripts/` → empty). Correct posture for a security-adjacent tool.
- No real secrets; the only `sk-proj-` string is a deliberate fake inside `agents/agency/security/ai-generated-code-security-auditor.md:73` (its own documentation pattern). Not a finding.
- No `eval`/`new Function`. Non-destructive JSONC merge with `.bak` backups; sessions never signalled. The "session safety" claim is code-true.

### Findings

**SEC-1 (HIGH) — Plugin mutates user shell commands based on project-local state.**
`src/plugin/hooks.js:33-39`: if `graphify-out/graph.json` exists in the CWD, the hook prepends `echo '[graphify] ...' ; ` onto every grep/find/rg command the agent runs. Two problems: (a) prepending strings into a live shell command is exactly the "concatenate untrusted content into an instruction sink" pattern this repo's own auditor persona hunts (CWE-78 family); (b) merely *entering* a malicious repo changes agent behavior — cloned directory contents (existence of `graph.json`) act on the developer's session. Fix: never mutate `output.args.command`; surface notices out-of-band (`console.error`), and treat all project-local state as hostile input.

**SEC-2 (HIGH) — The `rm -rf` guard is theater, and theater is worse than nothing.**
`src/plugin/hooks.js:53` blocks only literally `rm -rf /` (end-of-string) and `rm -rf ~`. It misses `rm -rf /*`, `rm -rf ~/*`, `rm -rf .`, `cd / && rm -rf usr`, `find -delete`, and anything via variable expansion. A guard that stops 2 of ~200 variants tells users they're protected when they aren't — the repo's own auditor demands "refuse false comfort." Either implement an honest denylist with a "here's what I check" disclosure, or remove it.

**SEC-3 (MEDIUM) — Unescaped interpolation into shell strings (CWE-78).**
`src/cli/graphify-runner.js:72,90`: `graphify extract "${targetDir}"` and `graphify query "${queryText}"` where `queryText` comes straight from CLI args (`src/cli/index.js:131`). A `"` breaks out of quoting. It's the user's own machine (self-injection, limited severity), but it's CWE-78 in a tool marketed on safety, and the fix is free: `execFileSync('graphify', ['query', queryText])` — no shell. Same pattern at `hooks.js:81` (prettier path). Also `execSafe` (`utils.js:43-56`) is `execSync` and its name promises safety it doesn't provide — rename `execQuiet`, add an argv-safe sibling.

**SEC-4 (MEDIUM) — Hook-state desync makes the circuit breaker an accidental self-DoS.**
`src/plugin/hooks.js:5-11`: counters are module-level; `resetHookCounters()` exists but no lifecycle calls it. One 150-call session in a long-lived multi-session server trips the breaker for *all* sessions — every subsequent tool call throws. Also the dedupe signature truncates args at 100 chars, so different long commands dedupe as "identical." Fix: key counters by `input.sessionID`.

**SEC-5 (LOW) — Installed plugin registers absolute package-cache paths.**
`src/plugin/index.js:35-37` pushes an absolute `SKILLS_DIR` under the npm cache; eviction = silently broken skill paths. The installer already copies skills into `.opencode/` — the plugin should register the same installed location, not the cache.

**SEC-6 (LOW) — No release-integrity story.**
No `SECURITY.md`, no CI (so `npm test` never runs on PRs), no Dependabot, no publish from tags. For a tool that edits `opencode.jsonc` and injects hooks into every session — i.e., a launch-position persistence mechanism — hold the repo to a higher bar than it audits others by.

### Remediation (ordered)
1. argv-form execution everywhere (kills SEC-3, hardens SEC-1).
2. Remove command-prepending; report out-of-band (SEC-1).
3. Delete or honestly scope the destructive-command guard (SEC-2).
4. Session-scoped hook counters (SEC-4).
5. `SECURITY.md` + push-protection + `npm audit --audit-level=high` in CI + Dependabot (SEC-6).

*Rescan after Phase 0 to confirm findings are gone — a fix you didn't verify is a false sense of safety.*

---

## 3. Software Architect Review
*Focus: boundaries, dependency direction, evolution strategy, config hazards.*

### Architectural read
The shape is good: `bin → cli/{installer,doctor,agency,presets,graphify-runner} → lib/{jsonc,opencode,utils,router}` is a clean layered CLI, and `plugin/` is correctly the runtime surface. Trade-off naming: zero deps bought supply-chain safety at the cost of hand-rolling JSONC parsing, a router, and an installer — acceptable at this scale, not beyond.

### Findings

**ARCH-1 (CRITICAL) — Broken dual-delivery: three config channels, no source of truth.**
The plugin registers agents/commands from in-memory JS catalogs (`src/agents/index.js`, `src/commands/index.js`); the installer copies real `.md` files; OpenCode separately supports `.opencode/agent/` conventions. The repo's `agents/*.md` is what developers read, the JS objects are what OpenCode loads via plugin, and the README promises both. Any drift silently ships behavior different from documentation. Decision needed (write it as ADR-001): markdown is the single source of truth, and the plugin reads installed files — or a build step generates JS from markdown. Never hand-maintain both.

**ARCH-2 (HIGH) — Project vs global install modes behave differently, non-obviously.**
Global installs bake per-directory absolute paths (SEC-5) while hooks read `graphify-out/` from CWD. State each mode's blast radius in `doctor` output and README, or make global mode modeless.

**ARCH-3 (HIGH) — Router has no strategy seam.**
`routePrompt` is a pure function (excellent for testing) but hardcodes catalog loading, schema assumptions, token weighting, and fallback heuristics in one 488-line module. Split into `catalog/` (load+validate+version), `scoring/` (strategy interface: `deterministic-v1`, future `embeddings-v2`), `routing/` (orchestration). This one refactor preserves optionality — reversibility matters, and it's what makes ENG-1/2 fixable without a rewrite.

**ARCH-4 (MEDIUM) — No ADRs and no OpenCode compatibility contract.**
The plugin leans on `experimental.session.compacting` — an explicitly unstable API — and unversioned schema keys. Add `docs/adr/`, declare `engines.opencode: ">=x"` compat matrix, have `doctor` verify it.

**ARCH-5 (MEDIUM) — Missing CI/CD is an architectural gap, not a chore.**
Tests exist but nothing runs them. No `repository`/`homepage` in `package.json`, no lockfile, no releases/tags. A 7-commit repo with 356 bulk-added markdown files and no CI is the exact profile of a scaffolded drop — including by this repo's own auditor agent's criteria. Ship `.github/workflows/ci.yml`: Node 18/20/22 × ubuntu/windows/macos matrix, `npm publish` from tags.

**ARCH-6 (LOW) — Near-duplicate modules.**
`skills/strategic-compact` vs `strategic-compaction`, and `commands/eval.md` vs `skills/eval-harness`. One canonical name each; alias or delete the other. Reconcile `templates/`, `mcp-configs/`, and `.opencode/` output duplication alongside ARCH-1.

### Evolution strategy
Keep the modular monolith — do not split into packages. Extract only the scoring seam and catalog loader, and you've pre-paid for embeddings v2, per-agent-pack downloads, and a possible registry later without a rewrite.

---

## 4. Brand Guardian Review
*Focus: naming, positioning, voice consistency, protectability, trust surface.*

### Assessment
A brand is a promise kept consistently across every touchpoint. Today this repo's touchpoints disagree with each other — fixable now, before an audience forms the impression for you.

### Findings

**BRAND-1 (CRITICAL) — The name is a category, not a brand.**
"code-anything" is descriptive SEO dominated by the `everything-claude-code` fork family. It is (a) near-unprotectable — generic + third-party platform name, likely untrademarkable in most classes; (b) a platform hostage — the moment this pivots to multi-runtime (it reads like "the agent config layer for any coding CLI"), the name rots; (c) unsearchable — you compete with the upstream for every keyword. Startup ambition → choose a house brand with distinct meaning and keep `code-anything` as a product under it. Pure-OSS ambition → the name is acceptable, but accept it will always read as "the OpenCode port of that Claude repo."

**BRAND-2 (HIGH) — Voice vs reality inconsistency (claim debt).**
README says "production-ready", "battle-tested", "100% Cross-Platform"; the repo has no CI badge, no releases, `version: 1.0.0` on a 7-commit history, and no `repository` field. The auditor persona preaches "honest output — what I checked, what I didn't." Apply it to your own README: add a **Status** section (tested surface, experimental APIs used, compat matrix). Scoped claims become credible *because* they're scoped; unearned superlatives get paid back in issues titled "this isn't production-ready."

**BRAND-3 (HIGH) — No visual identity, dead badges.**
No logo/wordmark, no OG image; the shields.io badges "OpenCode-ready" and "Graphify-integrated" link to nothing. Minimum viable system at this stage: one mark, one accent color, one 1200×630 OG image, and replace decorative badges with real ones (CI status, npm version, license). Weekend of work, outsized trust return.

**BRAND-4 (MEDIUM) — Attribution is handled correctly — protect that asset.**
Explicit credits to `everything-claude-code`, `worldflowai/graphify`, and `msitarzewski/agency-agents` — license-compatible MIT, rare, and brand-positive ("generous maintainer" is a real devtools archetype). Formalize upstream credits into a NOTICE so the story survives forks. Caution: the "we fixed 7 flaws of upstream" framing is healthy differentiation until it punches down — keep it technical, never hostile, or the brand gets remembered as the aggressive fork.

**BRAND-5 (MEDIUM) — No positioning statement.**
"Complete, production-ready configuration suite" is a feature dump. The differentiated truth, consistent with the other three reviews: **"The agent ops layer for AI coding CLIs — session-safe, zero-token code intelligence, measured routing."** Three pillars (Safety / Code Intelligence / Measured Orchestration), each with an existing proof point in code. Adopt one sentence everywhere until it *is* the category.

**BRAND-6 (LOW) — Naming hygiene is otherwise good.**
Consistent lowercase-hyphenated slugs/commands/agents. The `strategic-compact`/`strategic-compaction` near-duplicates violate consistency at 95%+ — resolve per ARCH-6.

---

## 5. Prioritized Improvement Roadmap

### Phase 0 — Launch blockers (before any public announcement)
| # | Item | Ref | Effort |
|---|------|-----|--------|
| 0.1 | Replace interpolated `execSync` with `execFile`/argv everywhere | SEC-1, SEC-3 | S |
| 0.2 | Remove command-prepending hooks; report out-of-band | SEC-1 | S |
| 0.3 | Delete or honestly scope the `rm -rf` guard | SEC-2 | S |
| 0.4 | Session-scoped hook counters | SEC-4 | S |
| 0.5 | Single source of truth for agents/commands; reconcile installer & plugin delivery | ARCH-1 | M |
| 0.6 | CI matrix + publish-from-tags + lockfile + `repository`/`homepage` + releases | ARCH-5 | S |
| 0.7 | `SECURITY.md`, secret-scanning push protection, Dependabot | SEC-6 | S |

### Phase 1 — Credibility engine (weeks 2–4)
| # | Item | Ref | Effort |
|---|------|-----|--------|
| 1.1 | Routing golden-set eval in CI; publish top-1/top-3 accuracy | ENG-1, ENG-2 | M |
| 1.2 | Graphify version handshake + corrupt-graph validation | ENG-3 | S |
| 1.3 | README Status section; real badges; scoped claims | BRAND-2, BRAND-3 | S |
| 1.4 | Logo + OG image + brand one-pager | BRAND-3 | S |
| 1.5 | Adopt positioning line everywhere; de-dup near-clone skills | BRAND-5, BRAND-6 | S |

### Phase 2 — Defensibility (month 2+)
| # | Item | Ref | Effort |
|---|------|-----|--------|
| 2.1 | Scoring strategy seam + `docs/adr/ADR-001..` | ARCH-1, ARCH-3, ARCH-4 | M |
| 2.2 | Optional embeddings router, benchmarked vs v1 publicly | ENG-1, ENG-2 | L |
| 2.3 | Consent-gated local token-savings report in `doctor` | ENG-4 | M |
| 2.4 | House-brand decision: OSS-only name vs startup brand architecture | BRAND-1 | L |

### Success metrics
- CI green on 3 OSes before launch (ARCH-5)
- Routing top-1 ≥85% on published golden set (ENG-2)
- Third-party re-audit finds zero open Phase-0 items (SEC-1..4)
- Every README claim verifiable by a reader in <5 minutes (BRAND-2)

---

*Read-only review; only this file was added. Security findings carry file:line evidence — re-scan after Phase 0 to confirm resolution, not removal-by-claim.*

---

## 6. Phase 0 Remediation Log (implemented 2026-09-27, same session)

Status of the launch-blockers from §5. Verified by `npm test` (10 suites, 0 failures, incl. new routing eval + catalog-parity guard).

| Item | Ref | Status | Evidence |
|------|-----|--------|----------|
| Hooks never mutate `output.args.command`; advisories out-of-band | SEC-1 | ✅ Fixed | `src/plugin/hooks.js:96-134`; `tests/plugin-hooks.test.js` asserts byte-identical command |
| Destructive guard now honest + broadened (rm /* ~ $HOME, mkfs, dd, fork bomb) + env opt-out + scope disclosure | SEC-2 | ✅ Fixed | `src/plugin/hooks.js:36-59`; ADR-003 |
| Shell-interpolated `execSync` → argv `execArgv` (spawnSync, shell:false) in graphify + prettier | SEC-3 | ✅ Fixed | `src/lib/utils.js` (`execArgv`), `src/cli/graphify-runner.js:96,124`, `src/plugin/hooks.js:181` |
| Circuit breaker + counters session-scoped; full-payload hash (no 100-char dedupe); LRU eviction | SEC-4 | ✅ Fixed | `src/plugin/hooks.js:8-40`; test §4 |
| Plugin registers installed skills dir, not npm-cache path | SEC-5 | ✅ Fixed | `src/plugin/index.js` `resolveSkillsDir()` |
| `SECURITY.md` + push-protection note + Dependabot + `npm audit` CI | SEC-6 | ✅ Done | `SECURITY.md`, `.github/dependabot.yml`, `.github/workflows/ci.yml` |
| Graphify: version via argv + corrupt `graph.json` validation (missing vs corrupt) | ENG-3 | ✅ Fixed | `src/cli/graphify-runner.js:47-70`; wired into `doctor`/`status`/hooks |
| Routing golden-set eval + accuracy gate | ENG-1/ENG-2 | ✅ Done | `tests/routing-golden.json` (44 cases), `tests/routing-eval.test.js`, `npm run eval:routing` |
| Router scorer fix: persona-gating + curated Tier-2 overrides + length-normalized overlap + prefix tech match | ENG-1 | ✅ Improved | `src/lib/router.js` — "docker compose"→blender and "helm/terraform"→dataviz hijacks eliminated |
| Single source of truth (interim: drift fails CI) + ADRs | ARCH-1/ARCH-4 | 🟡 Interim | `tests/catalog-parity.test.js` + `docs/adr/ADR-001..003`; markdown-canonical codegen deferred to Phase 2 |
| CI matrix (Node 18/20/22 × ubuntu/win/mac) + publish-from-tags + lockfile + repo metadata | ARCH-5 | ✅ Done | `.github/workflows/ci.yml`, `package-lock.json`, `repository`/`homepage`/`bugs` in package.json |
| Compatibility contract surfaced in `doctor` | ARCH-4 | ✅ Done | `package.json config.opencodeVersion` + `src/cli/doctor.js` |
| De-dup near-clone skills | ARCH-6/BRAND-6 | ✅ Done | `strategic-compact` merged into `strategic-compaction` |
| README: real division counts, real agent slugs, Status section, scoped claims, positioning line, honest "npm name taken" warning | BRAND-1/2/5 | ✅ Done | `README.md` Status + divisions + one-line tagline |

### Closed in follow-up (same day)
> Note on history: findings above originally named the package `everything-opencode`; the rename sweep (ADR-004) rewrote occurrences repo-wide, including in the finding text. The factual record, unedited: **`everything-opencode`** (not `code-anything`) is the name published by an unrelated author (`jakezp`, v0.1.6), which is why `npx everything-opencode` installed third-party code.

- ✅ **BRAND-1 resolved by rename → `code-anything`** (ADR-004). Name confirmed available on npm, matches the existing GitHub repo (`siddharthgosavi/code-anything`) so every touchpoint is one string. Sweep verified: 0 stale self-references, legacy `opencode-everything` bin alias dropped, `package-lock.json` regenerated, suite green under the new identity. Remaining: actual `npm publish` (release action, not code) — README Status honestly says "publish pending, install from source."
- ✅ **BRAND-3 partially resolved:** visual system generated from a committed script (`scripts/brand-generate.py`): icon set (`assets/logo/icon-{64,180,512,1024}.png`), wordmark (`assets/logo/wordmark.png`, in README header), OG/GitHub header (`assets/og.png`, 1280×640). Palette: deep-space indigo + teal/violet/pink prism accents — deliberately outside the `everything-*` generic-blue look. Design one-pager/usage rules still welcome, but the minimum-viable system (mark + accent + OG) now exists.
- ✅ **BRAND-2 increment:** CI publish-job annotation corrected to reflect the rename; README quick-start gated on reality (`npm link`/source install) instead of a dead `npx` promise.

### Still open (not silently "fixed")
- **ARCH-1 full:** markdown→JS codegen still pending (parity guard is the safety net meanwhile).
- **ENG-2 overfit caveat:** the golden set was calibrated from observed behavior, so 100% top-1 is a regression guard, **not** a semantic-accuracy claim — recorded honestly in ADR-002.
- ~~**Release ops**~~ ✅ Mostly done 2026-09-27: `code-anything@1.0.0` published to npm (authored Siddharth Gosavi), repo public with description/homepage, real CI + npm badges in README. Remaining: GitHub release/tag flow for v1.0.1+ (CI publish job expects `v*` tags + `NPM_TOKEN` secret — do NOT tag `v1.0.0`, npm rejects re-publish), repo social-preview image (`assets/og.png`), and a local-dev note that testing runs from the repo (`node bin/cli.js`), not a global install.
- **Local self-hosting gap:** `.opencode/opencode.json` lists plugin `code-anything`, which won't resolve from npm until publish; until then, local plugin loading needs the `npm link` path or a file: reference. Disclosed rather than papered over.

