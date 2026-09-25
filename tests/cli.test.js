import assert from 'assert';
import { runCli } from '../src/cli/index.js';

export async function testCli() {
  console.log('Testing CLI Commands & Options...');

  // 1. Version flag
  const codeVer = await runCli(['--version']);
  assert.strictEqual(codeVer, 0);
  console.log('  ✓ --version works');

  // 2. Preset list
  const codePreset = await runCli(['preset', 'list']);
  assert.strictEqual(codePreset, 0);
  console.log('  ✓ preset list works');

  // 3. Dry-run installation (project level, harmless)
  const codeDryRun = await runCli(['install', '--dry-run']);
  assert.strictEqual(codeDryRun, 0);
  console.log('  ✓ install --dry-run works');

  // 4. Doctor check
  const codeDoctor = await runCli(['doctor']);
  assert.strictEqual(codeDoctor, 0);
  console.log('  ✓ doctor works');
}
