import assert from 'assert';
import { GraphifyRunner } from '../src/cli/graphify-runner.js';

export async function testGraphifyIntegration() {
  console.log('Testing Graphify Integration...');
  const runner = new GraphifyRunner(process.cwd());

  // 1. Availability check
  const available = runner.isAvailable();
  assert.ok(available, 'Graphify CLI should be available in test environment');
  const version = runner.getVersion();
  assert.ok(version.includes('graphify'), 'Graphify version should be detected');
  console.log(`  ✓ Graphify detected: ${version}`);

  // 2. Stats check
  const stats = runner.getStats();
  assert.ok(stats.exists, 'Project graph.json should exist');
  assert.ok(stats.nodes > 0, 'Graph should contain extracted nodes');
  assert.ok(stats.edges > 0, 'Graph should contain extracted edges');
  console.log(`  ✓ Graph statistics verified: ${stats.nodes} nodes, ${stats.edges} edges`);

  // 3. Query execution
  const queryResult = runner.query('OpenCodeInstaller');
  assert.ok(queryResult && queryResult.length > 0, 'Graph query should return results');
  assert.ok(queryResult.includes('NODE') || queryResult.includes('EDGE'), 'Query should return graph nodes/edges');
  console.log('  ✓ Graphify AST query successfully executed');
}
