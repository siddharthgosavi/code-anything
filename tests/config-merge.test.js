import assert from 'assert';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { stripJsonComments, stripTrailingCommas, parseJsonc, safeReadJson, safeWriteJson } from '../src/lib/jsonc.js';
import { applyCodeAnythingConfig } from '../src/plugin/index.js';
import { AGENTS } from '../src/agents/index.js';
import { COMMANDS } from '../src/commands/index.js';

export async function testConfigMerge() {
  console.log('Testing Config Parsing & Non-Destructive Merging...');

  // 1. JSONC comment stripping
  const sampleJsonc = `
  {
    // User's custom provider
    "provider": {
      "my-llm": {
        "apiKey": "secret-key-123", /* inline comment */
      },
    },
    "plugin": [
      "@upstash/context7-opencode",
    ],
  }
  `;

  const parsed = parseJsonc(sampleJsonc);
  assert.strictEqual(parsed.provider['my-llm'].apiKey, 'secret-key-123');
  assert.strictEqual(parsed.plugin[0], '@upstash/context7-opencode');
  console.log('  ✓ JSONC comments and trailing commas parsed successfully');

  // 2. Non-destructive config augmentation
  const config = { ...parsed };
  applyCodeAnythingConfig(config);

  // Existing settings preserved
  assert.strictEqual(config.provider['my-llm'].apiKey, 'secret-key-123');
  assert.strictEqual(config.plugin[0], '@upstash/context7-opencode');

  // Agents registered
  assert.ok(config.agent.planner, 'planner agent must be registered');
  assert.ok(config.agent['code-reviewer'], 'code-reviewer agent must be registered');
  assert.ok(config.agent['graph-analyst'], 'graph-analyst agent must be registered');
  assert.strictEqual(Object.keys(config.agent).length, Object.keys(AGENTS).length);

  // Commands registered
  assert.ok(config.command.plan, '/plan command must be registered');
  assert.ok(config.command['graph-query'], '/graph-query command must be registered');
  assert.strictEqual(Object.keys(config.command).length, Object.keys(COMMANDS).length);

  // Skills path added
  assert.ok(config.skills.paths.length > 0, 'skills.paths must contain code-anything skills');
  console.log('  ✓ Config merge preserves user keys and registers agents/commands/skills');

  // 3. Safe read and atomic backup write
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eo-test-'));
  const targetConfig = path.join(tmpDir, 'opencode.jsonc');

  safeWriteJson(targetConfig, { initial: true });
  assert.ok(fs.existsSync(targetConfig));

  safeWriteJson(targetConfig, { initial: false, updated: true }, { backup: true });
  assert.ok(fs.existsSync(`${targetConfig}.bak`), 'Backup file must be created on overwrite');

  const bakContent = JSON.parse(fs.readFileSync(`${targetConfig}.bak`, 'utf8'));
  assert.strictEqual(bakContent.initial, true, 'Backup must preserve previous version');

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log('  ✓ Safe writing and automatic backup verified');
}
