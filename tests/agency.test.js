import assert from 'assert';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  loadAgencyCatalog,
  searchAgents,
  installAgencyAgents
} from '../src/cli/agency.js';

export async function testAgency() {
  // 1. Catalog integrity
  const catalog = loadAgencyCatalog();
  const divisions = catalog.divisions || {};
  const divisionKeys = Object.keys(divisions);

  assert.strictEqual(divisionKeys.length, 18, 'Should have exactly 18 divisions');

  let totalAgents = 0;
  for (const [key, meta] of Object.entries(divisions)) {
    assert.ok(meta.label, `Division ${key} should have a label`);
    assert.ok(Array.isArray(meta.agents), `Division ${key} should have an agents array`);
    totalAgents += meta.agents.length;

    // Check agent properties
    for (const agent of meta.agents) {
      assert.ok(agent.name, 'Agent must have a name');
      assert.ok(agent.slug, 'Agent must have a slug');
      assert.ok(agent.description, 'Agent must have a description');
      assert.ok(/^#[0-9A-F]{6}$/i.test(agent.color), `Agent color ${agent.color} must be valid 6-char hex`);
      assert.strictEqual(agent.division, key, 'Agent division must match');
    }
  }

  assert.strictEqual(totalAgents, 279, 'Should have exactly 279 total agents');
  console.log('  ✓ Catalog integrity verified: 279 agents across 18 divisions');

  // 2. Frontmatter of converted agents
  const dbOptimizerFile = path.resolve(process.cwd(), 'agents/agency/engineering/database-optimizer.md');
  assert.ok(fs.existsSync(dbOptimizerFile), 'database-optimizer.md must exist');
  const dbOptContent = fs.readFileSync(dbOptimizerFile, 'utf8');
  assert.ok(dbOptContent.includes('mode: subagent'), 'Must include mode: subagent');
  assert.ok(dbOptContent.includes('color: "#F59E0B"'), 'Must have hex color #F59E0B');
  assert.ok(dbOptContent.includes('Graphify'), 'Engineering agent must have Graphify instructions');
  console.log('  ✓ Agent frontmatter and Graphify instructions verified');

  // 3. Test installation into temporary directory
  const testDir = path.join(os.tmpdir(), `agency-test-${Date.now()}`);
  const targetAgentsDir = path.join(testDir, '.opencode', 'agents');
  fs.mkdirSync(targetAgentsDir, { recursive: true });

  try {
    // Install individual agent
    await installAgencyAgents({
      agents: ['database-optimizer'],
      cwd: testDir
    });

    const installedFile = path.join(targetAgentsDir, 'database-optimizer.md');
    assert.ok(fs.existsSync(installedFile), 'database-optimizer.md should be copied to target dir');

    // Install division pack
    await installAgencyAgents({
      division: 'testing',
      cwd: testDir
    });

    const qaFile = path.join(targetAgentsDir, 'test-automation-engineer.md');
    assert.ok(fs.existsSync(qaFile), 'test-automation-engineer.md should be copied');
    console.log('  ✓ Agent installation and division packs verified');
  } finally {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}
