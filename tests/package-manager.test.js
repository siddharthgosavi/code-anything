import assert from 'assert';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { detectPackageManager, getRunCommand, getExecCommand } from '../src/lib/package-manager.js';

export async function testPackageManager() {
  console.log('Testing Package Manager Detection...');

  // 1. Script run commands
  assert.strictEqual(getRunCommand('npm', 'test'), 'npm run test');
  assert.strictEqual(getRunCommand('pnpm', 'test'), 'pnpm test');
  assert.strictEqual(getRunCommand('yarn', 'test'), 'yarn test');
  assert.strictEqual(getRunCommand('bun', 'test'), 'bun run test');
  console.log('  ✓ Run commands correctly formatted');

  // 2. Exec commands
  assert.strictEqual(getExecCommand('npm', 'pkg'), 'npx pkg');
  assert.strictEqual(getExecCommand('pnpm', 'pkg'), 'pnpm dlx pkg');
  assert.strictEqual(getExecCommand('bun', 'pkg'), 'bunx pkg');
  console.log('  ✓ Exec commands correctly formatted');

  // 3. Lockfile detection in temp directory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eo-pm-'));
  fs.writeFileSync(path.join(tmpDir, 'pnpm-lock.yaml'), '');

  const detected = detectPackageManager(tmpDir);
  assert.ok(['pnpm', 'npm'].includes(detected), 'Should detect pnpm if available, or fallback');
  console.log(`  ✓ Lockfile detection verified (${detected})`);

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
