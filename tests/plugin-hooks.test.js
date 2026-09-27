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

  // 1. Graphify advisory must NOT mutate the command (SEC-1)
  const graphifyOut = path.join(tmpDir, 'graphify-out');
  fs.mkdirSync(graphifyOut, { recursive: true });
  fs.writeFileSync(path.join(graphifyOut, 'graph.json'), JSON.stringify({ nodes: [], links: [] }));

  const inputBash = { tool: 'bash', sessionID: 'ses_a' };
  const outputBash = { args: { command: 'grep -r "test" .' } };
  const originalCommand = outputBash.args.command;

  await onToolExecuteBefore(inputBash, outputBash, { directory: tmpDir });
  assert.strictEqual(
    outputBash.args.command,
    originalCommand,
    'SEC-1: hook must never mutate output.args.command'
  );
  assert.ok(
    !outputBash.args.command.includes('[graphify]') &&
    !outputBash.args.command.includes('echo'),
    'SEC-1: no echo/prepend injected into executed shell text'
  );
  console.log('  ✓ Graphify advisory leaves executed command byte-identical');

  // 2. Corrupt/truncated graph.json must not trigger advisories (ENG-3)
  fs.writeFileSync(path.join(graphifyOut, 'graph.json'), '{"nodes": [tru');
  const outputCorrupt = { args: { command: 'rg "pattern" src/' } };
  const cmdBefore = outputCorrupt.args.command;
  await onToolExecuteBefore({ tool: 'bash', sessionID: 'ses_corrupt' }, outputCorrupt, { directory: tmpDir });
  assert.strictEqual(outputCorrupt.args.command, cmdBefore);
  fs.rmSync(graphifyOut, { recursive: true, force: true });
  console.log('  ✓ Corrupt graph file handled safely');

  // 3. Destructive commands blocked across variants (SEC-2 honest scope)
  const dangerous = [
    'rm -rf /',
    'rm -rf /*',
    'rm -rf ~',
    'rm -rf $HOME',
    'mkfs.ext4 /dev/sda1',
    'dd if=/dev/zero of=/dev/sda'
  ];
  for (const cmd of dangerous) {
    const out = { args: { command: cmd } };
    let caught = false;
    try {
      await onToolExecuteBefore({ tool: 'bash', sessionID: `ses_d_${hash(cmd)}` }, out, { directory: tmpDir });
    } catch (err) {
      caught = true;
      assert.ok(/Blocked/.test(err.message), `message should say Blocked for: ${cmd}`);
    }
    assert.ok(caught, `Destructive command must be blocked: ${cmd}`);
  }
  console.log('  ✓ Destructive command tripwire covers rm/mkfs/dd variants');

  // 4. Circuit breaker is session-scoped, not global (SEC-4)
  resetHookCounters();
  const bigSession = { tool: 'bash', sessionID: 'ses_big' };
  let tripped = false;
  for (let i = 0; i < 160; i++) {
    try {
      await onToolExecuteBefore(bigSession, { args: { command: `echo ${i}` } }, { directory: tmpDir });
    } catch {
      tripped = true;
      break;
    }
  }
  assert.ok(tripped, 'Runaway session should trip its own breaker');
  // Other session unaffected:
  await onToolExecuteBefore({ tool: 'bash', sessionID: 'ses_other' }, { args: { command: 'ls' } }, { directory: tmpDir });
  console.log('  ✓ Circuit breaker isolated per session (SEC-4)');

  // 5. Identical repeat detection uses full args, not 100-char prefix
  resetHookCounters();
  const long1 = 'echo "' + 'A'.repeat(120) + ' first"';
  const long2 = 'echo "' + 'A'.repeat(120) + ' second"';
  let repeatedTripped = false;
  for (const cmd of [long1, long2, long1, long2, long1]) {
    try {
      await onToolExecuteBefore({ tool: 'bash', sessionID: 'ses_long' }, { args: { command: cmd } }, { directory: tmpDir });
    } catch {
      repeatedTripped = true;
    }
  }
  assert.ok(!repeatedTripped, 'Different long commands must NOT dedupe as identical (SEC-4)');
  console.log('  ✓ Repeat-signature uses full payload hash');

  // 6. Pre-compaction state snapshotting
  await onSessionCompacting({ sessionID: 'ses_test_123' }, {}, { directory: tmpDir });
  const sessionsDir = path.join(tmpDir, '.opencode', 'sessions');
  assert.ok(fs.existsSync(sessionsDir), 'Sessions snapshot directory should exist');
  const snapshots = fs.readdirSync(sessionsDir);
  assert.ok(snapshots.length > 0, 'Compaction snapshot file should exist');

  const snapshotData = JSON.parse(fs.readFileSync(path.join(sessionsDir, snapshots[0]), 'utf8'));
  assert.strictEqual(snapshotData.sessionID, 'ses_test_123');
  console.log('  ✓ Pre-compaction state snapshotting verified');

  resetHookCounters();
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

function hash(s) {
  return s.replace(/\W/g, '_').slice(0, 16);
}
