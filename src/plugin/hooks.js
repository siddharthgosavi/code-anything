import fs from 'fs';
import path from 'path';
import { execSafe } from '../lib/utils.js';

let toolCallCount = 0;
let graphifyReminded = false;
let compactReminded = false;

/**
 * Handle tool.execute.before lifecycle event
 */
export async function onToolExecuteBefore(input, output, { directory = process.cwd() } = {}) {
  toolCallCount++;

  // 1. Graphify Code Intelligence check
  const graphJsonPath = path.join(directory, 'graphify-out', 'graph.json');
  if (!graphifyReminded && fs.existsSync(graphJsonPath) && input.tool === 'bash') {
    const cmd = output.args?.command || '';
    // If command looks like a search or file grep
    if (/grep\s|find\s|rg\s|ag\s/.test(cmd) && !cmd.includes('graphify')) {
      output.args.command = `echo '[graphify] Knowledge graph active at graphify-out/. Consider using "graphify query <symbol>" for precise AST call-graphs.' ; ` + output.args.command;
      graphifyReminded = true;
    }
  }

  // 2. Compaction reminder after extensive tool usage
  if (!compactReminded && toolCallCount >= 40) {
    if (input.tool === 'bash' && output.args?.command) {
      output.args.command = `echo '[everything-opencode] Session has reached ${toolCallCount} tool calls. Consider running /checkpoint or compacting to maintain peak context quality.' ; ` + output.args.command;
      compactReminded = true;
    }
  }

  // 3. Destructive command safety guard
  if (input.tool === 'bash' && output.args?.command) {
    const cmd = output.args.command;
    if (/\brm\s+-rf\s+[\/\\]$/.test(cmd.trim()) || /\brm\s+-rf\s+~/.test(cmd.trim())) {
      throw new Error('[everything-opencode] Blocked potentially destructive system deletion command.');
    }
  }
}

/**
 * Handle tool.execute.after lifecycle event
 */
export async function onToolExecuteAfter(input, output, { directory = process.cwd() } = {}) {
  // 1. Detect PR creation and log helper
  if (input.tool === 'bash') {
    const cmd = input.args?.command || '';
    if (/gh\s+pr\s+create/.test(cmd)) {
      const outText = typeof output === 'string' ? output : (output?.output || '');
      const prMatch = outText.match(/https:\/\/github\.com\/[^\s]+\/pull\/\d+/);
      if (prMatch) {
        console.error(`[everything-opencode] Pull Request created: ${prMatch[0]}`);
      }
    }
  }

  // 2. Gentle formatting on edit if prettier exists
  if ((input.tool === 'edit' || input.tool === 'write') && input.args?.file_path) {
    const filePath = path.resolve(directory, input.args.file_path);
    if (fs.existsSync(filePath) && /\.(ts|tsx|js|jsx|json)$/.test(filePath)) {
      const nodeModulesPrettier = path.join(directory, 'node_modules', '.bin', 'prettier');
      if (fs.existsSync(nodeModulesPrettier)) {
        execSafe(`"${nodeModulesPrettier}" --write "${filePath}"`, { cwd: directory, timeout: 5000 });
      }
    }
  }
}

/**
 * Handle experimental.session.compacting lifecycle event
 */
export async function onSessionCompacting(input, output, { directory = process.cwd() } = {}) {
  try {
    const sessionsDir = path.join(directory, '.opencode', 'sessions');
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotPath = path.join(sessionsDir, `compaction-snapshot-${timestamp}.json`);

    const snapshot = {
      timestamp: new Date().toISOString(),
      toolCallsAtCompaction: toolCallCount,
      sessionID: input?.sessionID || 'unknown',
      directory
    };

    fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf8');
    console.error(`[everything-opencode] Session state preserved before compaction at: ${snapshotPath}`);
  } catch (err) {
    // Non-fatal
  }
}

export function resetHookCounters() {
  toolCallCount = 0;
  graphifyReminded = false;
  compactReminded = false;
}
