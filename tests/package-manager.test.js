import assert from 'assert';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  detectPackageManager,
  getRunCommand,
  getExecCommand,
  SUPPORTED_MANAGERS
} from '../src/lib/package-manager.js';
import { hasExecutable } from '../src/lib/utils.js';

export async function testPackageManager() {
  console.log('Testing Package Manager Detection...');

  // 1. Script run commands (pure)
  assert.strictEqual(getRunCommand('npm', 'test'), 'npm run test');
  assert.strictEqual(getRunCommand('pnpm', 'test'), 'pnpm test');
  assert.strictEqual(getRunCommand('yarn', 'test'), 'yarn test');
  assert.strictEqual(getRunCommand('bun', 'test'), 'bun run test');
  console.log('  ✓ Run commands correctly formatted');

  // 2. Exec commands (pure)
  assert.strictEqual(getExecCommand('npm', 'pkg'), 'npx pkg');
  assert.strictEqual(getExecCommand('pnpm', 'pkg'), 'pnpm dlx pkg');
  assert.strictEqual(getExecCommand('bun', 'pkg'), 'bunx pkg');
  console.log('  ✓ Exec commands correctly formatted');

  // 3. Environment override wins and must be respected (step 1 precedence).
  //    npm is guaranteed present wherever these tests run (the suite itself
  //    runs under npm), so this assertion is deterministic across CI images.
  const prev = process.env.OPENCODE_PACKAGE_MANAGER;
  process.env.OPENCODE_PACKAGE_MANAGER = 'npm';
  try {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ca-pm-'));
    fs.writeFileSync(path.join(tmp, 'pnpm-lock.yaml'), '');
    assert.strictEqual(detectPackageManager(tmp), 'npm',
      'explicit env override must win over lockfiles');
    fs.rmSync(tmp, { recursive: true, force: true });
  } finally {
    if (prev === undefined) delete process.env.OPENCODE_PACKAGE_MANAGER;
    else process.env.OPENCODE_PACKAGE_MANAGER = prev;
  }
  console.log('  ✓ env override takes precedence over lockfiles');

  // 4. Lockfile detection respects binary availability: a pnpm-lock.yaml
  //    yields 'pnpm' only if the pnpm binary exists; otherwise it must
  //    still resolve to a supported, installed manager (never a phantom).
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ca-pm-lock-'));
  try {
    fs.writeFileSync(path.join(tmpDir, 'pnpm-lock.yaml'), '');
    const detected = detectPackageManager(tmpDir);
    assert.ok(SUPPORTED_MANAGERS.includes(detected),
      `must return a supported manager, got ${detected}`);
    assert.ok(hasExecutable(detected),
      `detected manager '${detected}' must actually be installed`);
    if (hasExecutable('pnpm')) {
      assert.strictEqual(detected, 'pnpm', 'pnpm lock + pnpm binary → pnpm');
    }
    console.log(`  ✓ lockfile detection verified (${detected})`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  // 5. Bare directory falls back to an installed manager.
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'ca-pm-empty-'));
  try {
    const d = detectPackageManager(empty);
    assert.ok(SUPPORTED_MANAGERS.includes(d) && hasExecutable(d));
  } finally {
    fs.rmSync(empty, { recursive: true, force: true });
  }
  console.log('  ✓ bare directory falls back to installed manager');
}
