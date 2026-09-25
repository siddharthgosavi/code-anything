import assert from 'assert';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { 
  onToolExecuteBefore, 
  onToolExecuteAfter, 
  onSessionCompacting, 
  resetHookCounters 
} from '../src/plugin/hooks.js';

export async function testPluginHooks() {
  console.log('Testing Plugin Lifecycle Hooks...');
  resetHookCounters();

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eo-hooks-'));

  // 1. Graphify reminder hook
  const graphifyOut = path.join(tmpDir, 'graphify-out');
  fs.mkdirSync(graphifyOut, { recursive: true });
  fs.writeFileSync(path.join(graphifyOut, 'graph.json'), JSON.stringify({ nodes: [] }));

  const inputBash = { tool: 'bash' };
  const outputBash = { args: { command: 'grep -r "test" .' } };

  await onToolExecuteBefore(inputBash, outputBash, { directory: tmpDir });
  assert.ok(
    outputBash.args.command.includes('[graphify]'),
    'Graphify reminder should be prepended to search commands when graph.json exists'
  );
  console.log('  ✓ Graphify intelligence hook verified');

  // 2. Destructive command prevention
  const dangerousOutput = { args: { command: 'rm -rf /' } };
  let caught = false;
  try {
    await onToolExecuteBefore({ tool: 'bash' }, dangerousOutput, { directory: tmpDir });
  } catch (err) {
    caught = true;
    assert.ok(err.message.includes('destructive'));
  }
  assert.ok(caught, 'Destructive rm -rf / must be blocked');
  console.log('  ✓ Dangerous command safety guardrail verified');

  // 3. Pre-compaction state snapshotting
  await onSessionCompacting({ sessionID: 'ses_test_123' }, {}, { directory: tmpDir });
  const sessionsDir = path.join(tmpDir, '.opencode', 'sessions');
  assert.ok(fs.existsSync(sessionsDir), 'Sessions snapshot directory should be created');
  const snapshots = fs.readdirSync(sessionsDir);
  assert.ok(snapshots.length > 0, 'Compaction snapshot file should exist');

  const snapshotData = JSON.parse(fs.readFileSync(path.join(sessionsDir, snapshots[0]), 'utf8'));
  assert.strictEqual(snapshotData.sessionID, 'ses_test_123');
  console.log('  ✓ Pre-compaction state snapshotting verified');

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
