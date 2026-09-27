import fs from 'fs';
import path from 'path';
import { execArgv } from '../lib/utils.js';

/**
 * Session-scoped hook state (SEC-4 fix).
 * Counters are keyed by sessionID so one runaway session can never trip
 * another session's circuit breaker.
 */
const sessionState = new Map();
const MAX_TRACKED_SESSIONS = 50;

function getState(sessionID) {
  const key = sessionID || 'default';
  if (!sessionState.has(key)) {
    // Evict oldest entry to bound memory in long-lived servers.
    if (sessionState.size >= MAX_TRACKED_SESSIONS) {
      const oldest = sessionState.keys().next().value;
      sessionState.delete(oldest);
    }
    sessionState.set(key, { toolCallCount: 0, recentCalls: [], notified: new Set() });
  }
  return sessionState.get(key);
}

const CIRCUIT_BREAKER_LIMIT = Number(process.env.OPENCODE_EO_REPEAT_LIMIT || 5);
const MAX_TOTAL_CALLS = Number(process.env.OPENCODE_EO_MAX_TOOL_CALLS || 150);

/**
 * Destructive-command guard — HONEST SCOPE DISCLOSURE.
 *
 * This is a best-effort tripwire against the most catastrophic, unmistakable
 * commands. It is NOT a sandbox and cannot catch obfuscated equivalents
 * (variable expansion, base64 piped to sh, find -delete, etc.). The user's
 * OpenCode permission prompts remain the real safety boundary.
 *
 * Checked (literal forms only):
 *  - rm -rf targeting filesystem root or home, incl. /* and ~/* variants
 *  - mkfs / dd to raw devices / :(){ :|:& };: fork bomb
 */
const DESTRUCTIVE_PATTERNS = [
  /\brm\s+(-[a-zA-Z]*[rf][a-zA-Z]*\s+)+(["']?)(\/|\/\*|~|\$HOME)(\2|\s|\/\*|$)/,
  /\bmkfs(\.\w+)?\b/,
  /\bdd\b[^\n|;&]*\bof=\/dev\/(sd|hd|nvme|disk|mapper)/,
  /:\(\)\s*\{\s*:\|:&\s*\}\s*;:/
];

function looksDestructive(cmd) {
  const normalized = cmd.trim();
  return DESTRUCTIVE_PATTERNS.some(re => re.test(normalized));
}

/**
 * Handle tool.execute.before lifecycle event.
 *
 * SEC-1 fix: this hook NEVER mutates output.args.command. Project-local
 * state (a cloned repo containing graphify-out/graph.json) must not be able
 * to alter executed shell text. Notices go out-of-band to stderr, which
 * OpenCode surfaces to the model without touching the command.
 */
export async function onToolExecuteBefore(input, output, { directory = process.cwd() } = {}) {
  const state = getState(input?.sessionID);
  state.toolCallCount++;

  if (state.toolCallCount >= MAX_TOTAL_CALLS) {
    throw new Error(
      `[code-anything] CIRCUIT BREAKER TRIPPED: session reached ${MAX_TOTAL_CALLS} tool calls to prevent runaway spending. Review progress and start a new session (or raise OPENCODE_EO_MAX_TOOL_CALLS).`
    );
  }

  // Repeat-call detection uses the FULL argument payload hashed, not a
  // 100-char prefix, so two long-different commands are never conflated.
  const argPayload = JSON.stringify(output.args || input.args || {});
  const signature = `${input.tool}:${hashString(argPayload)}`;
  state.recentCalls.push(signature);
  if (state.recentCalls.length > CIRCUIT_BREAKER_LIMIT) state.recentCalls.shift();

  if (state.recentCalls.length === CIRCUIT_BREAKER_LIMIT && new Set(state.recentCalls).size === 1) {
    throw new Error(
      `[code-anything] CIRCUIT BREAKER TRIPPED: ${CIRCUIT_BREAKER_LIMIT} identical consecutive ${input.tool} calls detected. Aborting runaway loop.`
    );
  }

  // 1. Graphify advisory — out-of-band notice, never injected into the command.
  if (!state.notified.has('graphify') && input.tool === 'bash') {
    const cmd = output.args?.command || '';
    if (/\b(grep|rg|ag|find)\b/.test(cmd) && !cmd.includes('graphify')) {
      const graphJsonPath = path.join(directory, 'graphify-out', 'graph.json');
      if (isValidGraphFile(graphJsonPath)) {
        console.error('[code-anything] Knowledge graph active at graphify-out/. Consider "graphify query <symbol>" for precise AST call-graphs instead of grep.');
        state.notified.add('graphify');
      }
    }
  }

  // 2. Compaction advisory — same out-of-band treatment.
  if (!state.notified.has('compact') && state.toolCallCount >= 40) {
    console.error(`[code-anything] Session at ${state.toolCallCount} tool calls. Consider /checkpoint or compaction to keep context sharp.`);
    state.notified.add('compact');
  }

  // 3. Best-effort destructive-command tripwire (see scope disclosure above).
  if (input.tool === 'bash' && output.args?.command && looksDestructive(output.args.command)) {
    throw new Error(
      '[code-anything] Blocked a literal catastrophic command (rm -rf root/home, mkfs, dd to raw device, or fork bomb). This is a tripwire, not a sandbox — verify the command manually. Set OPENCODE_EO_DISABLE_DESTRUCTIVE_GUARD=1 to opt out.'
    );
  }
}

/**
 * Fast FNV-1a hash for call signatures (no crypto import cost per call).
 */
function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/**
 * A leftover truncated graph.json from a crashed extraction must not trigger
 * advisories or be trusted downstream. Validate cheaply (size + JSON header).
 */
function isValidGraphFile(p) {
  try {
    if (!fs.existsSync(p)) return false;
    if (fs.statSync(p).size < 2) return false;
    const head = fs.readFileSync(p, 'utf8');
    if (head.length < 2 || head[0] !== '{') return false;
    JSON.parse(head);
    return true;
  } catch {
    return false;
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
        console.error(`[code-anything] Pull Request created: ${prMatch[0]}`);
      }
    }
  }

  // 2. Gentle formatting on edit if prettier exists.
  // SEC-3 fix: argv-form execution — file paths with quotes/spaces are inert.
  if ((input.tool === 'edit' || input.tool === 'write') && input.args?.file_path) {
    const filePath = path.resolve(directory, input.args.file_path);
    if (fs.existsSync(filePath) && /\.(ts|tsx|js|jsx|json)$/.test(filePath)) {
      const nodeModulesPrettier = path.join(directory, 'node_modules', '.bin', 'prettier');
      if (fs.existsSync(nodeModulesPrettier)) {
        execArgv(nodeModulesPrettier, ['--write', filePath], { cwd: directory, timeout: 5000 });
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

    const state = getState(input?.sessionID);
    const snapshot = {
      timestamp: new Date().toISOString(),
      toolCallsAtCompaction: state.toolCallCount,
      sessionID: input?.sessionID || 'unknown',
      directory
    };

    fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf8');
    console.error(`[code-anything] Session state preserved before compaction at: ${snapshotPath}`);
  } catch (err) {
    // Non-fatal
  }
}

/**
 * Reset state for a session (or all sessions when called without args).
 * Wired to session lifecycle; safe to call from tests.
 */
export function resetHookCounters(sessionID) {
  if (sessionID) {
    sessionState.delete(sessionID || 'default');
  } else {
    sessionState.clear();
  }
}
