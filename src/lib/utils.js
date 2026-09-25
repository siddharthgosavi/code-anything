import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// ANSI escape sequences for clean terminal output
export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

export const log = {
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  debug: (msg) => {
    if (process.env.DEBUG || process.env.OPENCODE_DEBUG) {
      console.log(`${colors.gray}[DEBUG] ${msg}${colors.reset}`);
    }
  },
  step: (step, total, msg) => console.log(`${colors.bold}${colors.magenta}[${step}/${total}]${colors.reset} ${msg}`),
  header: (title) => {
    const bar = '─'.repeat(Math.max(40, title.length + 4));
    console.log(`\n${colors.cyan}┌${bar}┐${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset}  ${colors.bold}${title}${colors.reset}  ${colors.cyan}│${colors.reset}`);
    console.log(`${colors.cyan}└${bar}┘${colors.reset}\n`);
  }
};

/**
 * Execute command safely, returning trimmed stdout or null on error.
 */
export function execSafe(command, options = {}) {
  try {
    const stdout = execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: options.timeout || 15000,
      ...options
    });
    return stdout.trim();
  } catch (err) {
    log.debug(`execSafe failed for: ${command} (${err.message})`);
    return null;
  }
}

/**
 * Check if a command/executable exists in PATH.
 */
export function hasExecutable(name) {
  const isWindows = process.platform === 'win32';
  const checkCmd = isWindows ? `where ${name}` : `which ${name}`;
  return execSafe(checkCmd) !== null;
}

/**
 * Recursively copy a directory from src to dest.
 */
export function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Deep merge two objects without modifying the original target.
 */
export function deepMerge(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
        // Deduplicate primitives or merge
        const mergedArray = [...target[key]];
        for (const item of source[key]) {
          const exists = mergedArray.some(existing => 
            JSON.stringify(existing) === JSON.stringify(item)
          );
          if (!exists) {
            mergedArray.push(item);
          }
        }
        output[key] = mergedArray;
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}
