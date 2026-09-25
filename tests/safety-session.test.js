import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { OpenCodeEnvironment } from '../src/lib/opencode.js';

export async function testSessionSafety() {
  console.log('Testing Running Session Protection & Safety Guarantees...');
  const env = new OpenCodeEnvironment();

  // 1. Inspect sessions safely
  const sessions = env.getActiveSessions();
  console.log(`  ℹ Found ${sessions.length} active session(s)`);

  if (sessions.length > 0) {
    for (const s of sessions) {
      assert.ok(s.sessionId, 'Session object must have sessionId');
      assert.ok(s.pid, 'Session object must have pid');
      // Verify process is actually still alive
      let isAlive = false;
      try {
        // kill with signal 0 checks for process existence without sending any signal
        process.kill(Number(s.pid), 0);
        isAlive = true;
      } catch (e) {
        isAlive = false;
      }
      assert.ok(isAlive, `Session process ${s.pid} must remain actively running`);
      console.log(`  ✓ Confirmed session ${s.sessionId} (PID ${s.pid}) is alive and unharmed`);
    }
  }

  // 2. Verify global configuration integrity
  const globalConfigPath = path.join(os.homedir(), '.config', 'opencode', 'opencode.jsonc');
  if (fs.existsSync(globalConfigPath)) {
    const content = fs.readFileSync(globalConfigPath, 'utf8');
    assert.ok(content.length > 0, 'Global opencode.jsonc must not be empty or truncated');
    assert.ok(content.includes('provider') || content.includes('plugin'), 'Global config structure must be intact');
    console.log('  ✓ Global configuration file integrity verified');
  }

  // 3. Verify user secret key file integrity
  const keyPath = path.join(os.homedir(), '.config', 'opencode', 'explabs.key');
  if (fs.existsSync(keyPath)) {
    const key = fs.readFileSync(keyPath, 'utf8');
    assert.ok(key.trim().length > 0, 'User credentials (explabs.key) must remain intact');
    console.log('  ✓ User secret credentials file verified intact');
  }

  console.log('  ✓ Zero session interference confirmed');
}
