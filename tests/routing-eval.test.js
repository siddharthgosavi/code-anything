import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { routePrompt, CORE_AGENT_PATTERNS } from '../src/lib/router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GOLDEN_PATH = path.join(__dirname, 'routing-golden.json');
const DIVISIONS_PATH = path.join(__dirname, '..', 'agents', 'agency', 'divisions.json');
const TIER1_DIR = path.join(__dirname, '..', 'agents');

/**
 * ENG-2: Measured routing accuracy on a fixed golden set.
 * ENG-1: Regression guard — keyword/score edits must keep top-1 above threshold.
 */
export async function testRoutingEval() {
  console.log('Testing Routing Golden-Set Eval...');

  const golden = JSON.parse(fs.readFileSync(GOLDEN_PATH, 'utf8'));
  assert.ok(Array.isArray(golden.cases) && golden.cases.length >= 40, 'Golden set should contain >= 40 cases');

  const catalog = JSON.parse(fs.readFileSync(DIVISIONS_PATH, 'utf8'));
  const tier2Slugs = new Set();
  for (const div of Object.values(catalog.divisions || {})) {
    for (const a of div.agents || []) tier2Slugs.add(a.slug);
  }
  const tier1Slugs = new Set(CORE_AGENT_PATTERNS.map(a => a.slug));

  // ARCH-1 stopgap: every accepted slug in the golden set must exist in a
  // real catalog (router cannot route to phantoms; catalog and router drift
  // loudly here instead of silently at runtime).
  for (const c of golden.cases) {
    for (const slug of c.accept) {
      assert.ok(
        tier1Slugs.has(slug) || tier2Slugs.has(slug) || fs.existsSync(path.join(TIER1_DIR, `${slug}.md`)),
        `Golden case references unknown agent slug: "${slug}" (catalog/router drift — ARCH-1)`
      );
    }
  }
  console.log(`  ✓ Golden set consistent with agent catalogs (${golden.cases.length} cases)`);

  let top1 = 0;
  let top3 = 0;
  const misses = [];

  for (const c of golden.cases) {
    const result = routePrompt(c.prompt);
    const primary = result.primaryAgent.slug;
    const rank = result.candidates.findIndex(x => c.accept.includes(x.slug)) + 1;

    if (c.accept.includes(primary)) top1++;
    else misses.push(`"${c.prompt}" -> @${primary} (expected @${c.accept.join('|')})`);

    if (c.accept.includes(primary) || (rank > 0 && rank <= 3)) top3++;
  }

  const accuracy1 = top1 / golden.cases.length;
  const accuracy3 = top3 / golden.cases.length;
  const threshold = golden.minTop1Accuracy ?? 0.85;

  console.log(`  Top-1 accuracy: ${(accuracy1 * 100).toFixed(1)}% (${top1}/${golden.cases.length})`);
  console.log(`  Top-3 accuracy: ${(accuracy3 * 100).toFixed(1)}% (${top3}/${golden.cases.length})`);

  if (misses.length) {
    console.log('  Misses:');
    for (const m of misses.slice(0, 12)) console.log(`    - ${m}`);
  }

  assert.ok(
    accuracy1 >= threshold,
    `Routing top-1 accuracy ${(accuracy1 * 100).toFixed(1)}% below required ${(threshold * 100).toFixed(0)}% (ENG-1/ENG-2)`
  );
  console.log(`  ✓ Routing accuracy meets >= ${(threshold * 100).toFixed(0)}% gate`);
}
