import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { GraphifyRunner } from '../src/cli/graphify-runner.js';

/**
 * Part 1 (always runs): graph file validation against a deterministic
 * fixture — no graphify CLI required, works on CI.
 */
function testGraphValidation() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ca-graph-'));
  try {
    const outDir = path.join(tmp, 'graphify-out');
    fs.mkdirSync(outDir, { recursive: true });
    const graphPath = path.join(outDir, 'graph.json');
    const runner = new GraphifyRunner(tmp);

    // missing graph
    assert.deepStrictEqual(runner.getStats(), { exists: false });
    assert.strictEqual(runner.hasGraph(), false);

    // corrupt graph must not masquerade as healthy
    fs.writeFileSync(graphPath, '{"nodes": [trunc');
    assert.strictEqual(runner.getStats().corrupt, true);
    assert.strictEqual(runner.hasGraph(), false);

    // valid fixture graph
    fs.writeFileSync(graphPath, JSON.stringify({
      nodes: [{ id: 'OpenCodeInstaller' }, { id: 'Installer' }],
      links: [{ source: 'OpenCodeInstaller', target: 'Installer' }]
    }));
    const stats = runner.getStats();
    assert.ok(stats.exists && stats.nodes === 2 && stats.edges === 1);
    assert.strictEqual(runner.hasGraph(), true);
    console.log('  ✓ missing/corrupt/valid graph states correctly discriminated (fixture)');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/**
 * Part 2 (skips when graphify CLI absent): live integration against a
 * real project graph. Requires both the Python `graphify` binary and a
 * previously built `graphify-out/graph.json` — i.e. a local dev machine.
 */
function testLiveIntegration() {
  const runner = new GraphifyRunner(process.cwd());
  if (!runner.isAvailable()) {
    console.log('  - SKIPPED: graphify CLI not installed (optional dependency)');
    return false;
  }
  const version = runner.getVersion();
  assert.ok(version && version.includes('graphify'), 'Graphify version should be detected');
  console.log(`  ✓ Graphify detected: ${version}`);

  if (!runner.hasGraph()) {
    console.log('  - SKIPPED: no local graphify-out/graph.json (run /graph-build to enable)');
    return true;
  }
  const stats = runner.getStats();
  assert.ok(stats.nodes > 0 && stats.edges > 0);
  console.log(`  ✓ Graph statistics verified: ${stats.nodes} nodes, ${stats.edges} edges`);

  const queryResult = runner.query('OpenCodeInstaller');
  assert.ok(queryResult && queryResult.length > 0, 'Graph query should return results');
  console.log('  ✓ Graphify AST query successfully executed');
  return true;
}

export async function testGraphifyIntegration() {
  console.log('Testing Graphify Integration...');
  testGraphValidation();
  testLiveIntegration();
}
