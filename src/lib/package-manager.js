import fs from 'fs';
import path from 'path';
import { hasExecutable } from './utils.js';

export const SUPPORTED_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'];

/**
 * Detect the preferred package manager for a project or global environment.
 */
export function detectPackageManager(cwd = process.cwd()) {
  // 1. Environment variable override
  const envPm = process.env.OPENCODE_PACKAGE_MANAGER || process.env.CLAUDE_PACKAGE_MANAGER;
  if (envPm && SUPPORTED_MANAGERS.includes(envPm.toLowerCase()) && hasExecutable(envPm)) {
    return envPm.toLowerCase();
  }

  // 2. package.json "packageManager" field
  const pkgJsonPath = path.join(cwd, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      if (pkg.packageManager) {
        const pmName = pkg.packageManager.split('@')[0].trim();
        if (SUPPORTED_MANAGERS.includes(pmName) && hasExecutable(pmName)) {
          return pmName;
        }
      }
    } catch {}
  }

  // 3. Lock files
  const lockfiles = [
    { file: 'pnpm-lock.yaml', pm: 'pnpm' },
    { file: 'yarn.lock', pm: 'yarn' },
    { file: 'bun.lockb', pm: 'bun' },
    { file: 'bun.lock', pm: 'bun' },
    { file: 'package-lock.json', pm: 'npm' }
  ];

  for (const { file, pm } of lockfiles) {
    if (fs.existsSync(path.join(cwd, file)) && hasExecutable(pm)) {
      return pm;
    }
  }

  // 4. Executable availability priority
  for (const pm of ['pnpm', 'bun', 'yarn', 'npm']) {
    if (hasExecutable(pm)) {
      return pm;
    }
  }

  return 'npm';
}

/**
 * Get run command for a package manager.
 */
export function getRunCommand(pm, script) {
  switch (pm) {
    case 'pnpm':
      return `pnpm ${script}`;
    case 'yarn':
      return `yarn ${script}`;
    case 'bun':
      return `bun run ${script}`;
    default:
      return `npm run ${script}`;
  }
}

/**
 * Get execution command for npx/dlx.
 */
export function getExecCommand(pm, pkg) {
  switch (pm) {
    case 'pnpm':
      return `pnpm dlx ${pkg}`;
    case 'bun':
      return `bunx ${pkg}`;
    case 'yarn':
      return `yarn dlx ${pkg}`;
    default:
      return `npx ${pkg}`;
  }
}
