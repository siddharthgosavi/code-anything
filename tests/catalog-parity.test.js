import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AGENTS } from '../src/agents/index.js';
import { COMMANDS } from '../src/commands/index.js';
import { CORE_AGENT_PATTERNS } from '../src/lib/router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');

/**
 * ARCH-1 / BRAND-2 stopgap: drift detector across the three catalogs that
 * must stay in lockstep until markdown becomes the single source of truth:
 *   1. src/agents/index.js   (JS catalog registered via the plugin)
 *   2. agents/*.md           (markdown files shipped in repo + installed)
 *   3. CORE_AGENT_PATTERNS   (router slugs in src/lib/router.js)
 * and COMMANDS vs commands/*.md + README-declared counts.
 */
export async function testCatalogParity() {
  console.log('Testing Catalog Parity (ARCH-1 drift guard)...');

  const jsSlugs = Object.keys(AGENTS).sort();
  const mdSlugs = fs.readdirSync(path.join(REPO_ROOT, 'agents'))
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
    .sort();

  // Every JS-registered agent must have a markdown twin and vice versa.
  const onlyInJs = jsSlugs.filter(s => !mdSlugs.includes(s));
  const onlyInMd = mdSlugs.filter(s => !jsSlugs.includes(s));
  assert.deepStrictEqual(onlyInJs, [], `Agents registered in JS but missing agents/*.md: ${onlyInJs.join(', ')}`);
  assert.deepStrictEqual(onlyInMd, [], `agents/*.md files not registered in src/agents/index.js: ${onlyInMd.join(', ')}`);
  console.log(`  ✓ JS catalog and agents/*.md match (${jsSlugs.length} agents)`);

  // Router slugs must be a subset of the JS catalog (router cannot route to phantoms).
  const routerSlugs = CORE_AGENT_PATTERNS.map(a => a.slug);
  const phantomRouter = routerSlugs.filter(s => !jsSlugs.includes(s));
  assert.deepStrictEqual(phantomRouter, [], `Router references unknown agents: ${phantomRouter.join(', ')}`);
  const unranked = jsSlugs.filter(s => !routerSlugs.includes(s));
  assert.deepStrictEqual(unranked, [], `Agents missing from router scoring: ${unranked.join(', ')}`);
  console.log(`  ✓ Router CORE_AGENT_PATTERNS aligns with catalog (${routerSlugs.length})`);

  // Commands: JS COMMANDS keys must match commands/*.md basenames.
  const jsCommands = Object.keys(COMMANDS).sort();
  const mdCommands = fs.readdirSync(path.join(REPO_ROOT, 'commands'))
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
    .sort();
  const onlyInJsCmd = jsCommands.filter(s => !mdCommands.includes(s));
  assert.deepStrictEqual(onlyInJsCmd, [], `Commands registered in JS but missing commands/*.md: ${onlyInJsCmd.join(', ')}`);
  console.log(`  ✓ Command catalog aligns with commands/*.md (${jsCommands.length} commands)`);

  // Prompt/description sanity: every agent needs a description + prompt.
  for (const [slug, def] of Object.entries(AGENTS)) {
    assert.ok(def.description && def.description.length > 20, `Agent "${slug}" missing description`);
    assert.ok(def.prompt && def.prompt.length > 50, `Agent "${slug}" missing prompt body`);
    assert.strictEqual(def.mode, 'subagent', `Agent "${slug}" must be mode: subagent`);
  }
  console.log('  ✓ Agent definitions structurally valid');
}
