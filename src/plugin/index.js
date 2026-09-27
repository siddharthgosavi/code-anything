import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { AGENTS } from '../agents/index.js';
import { COMMANDS } from '../commands/index.js';
import { onToolExecuteBefore, onToolExecuteAfter, onSessionCompacting } from './hooks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGED_SKILLS_DIR = path.resolve(__dirname, '../../skills');

/**
 * Resolve a stable skills directory (SEC-5 fix).
 * Prefer the location the installer copies skills into (project/global
 * config) so npm-cache eviction cannot silently break registered paths.
 * Falls back to the packaged dir only when nothing is installed yet.
 */
export function resolveSkillsDir(directory = process.cwd()) {
  const projectSkills = path.join(directory, '.opencode', 'skills');
  if (fs.existsSync(projectSkills)) return projectSkills;

  const globalConfigDir = process.env.XDG_CONFIG_HOME
    ? path.join(process.env.XDG_CONFIG_HOME, 'opencode')
    : path.join(os.homedir(), '.config', 'opencode');
  const globalSkills = path.join(globalConfigDir, 'skills');
  if (fs.existsSync(globalSkills)) return globalSkills;

  return PACKAGED_SKILLS_DIR;
}

/**
 * Configure OpenCode settings dynamically.
 */
export function applyCodeAnythingConfig(config, options = {}) {
  // 1. Register agents
  config.agent = config.agent || {};
  for (const [name, agentDef] of Object.entries(AGENTS)) {
    if (!config.agent[name]) {
      config.agent[name] = agentDef;
    }
  }

  // 2. Register commands
  config.command = config.command || {};
  for (const [name, cmdDef] of Object.entries(COMMANDS)) {
    if (!config.command[name]) {
      config.command[name] = cmdDef;
    }
  }

  // 3. Add skills path (installed location preferred — SEC-5)
  const skillsDir = resolveSkillsDir(options.directory || process.cwd());
  config.skills = config.skills || {};
  config.skills.paths = config.skills.paths || [];
  if (!config.skills.paths.includes(skillsDir)) {
    config.skills.paths.push(skillsDir);
  }

  // 4. Set sensible compaction defaults if not set
  config.compaction = config.compaction || {};
  if (config.compaction.auto === undefined) {
    config.compaction.auto = true;
  }
  if (config.compaction.reserved === undefined) {
    config.compaction.reserved = 8000;
  }

  // 5. Add default instructions reference if empty
  config.instructions = config.instructions || [];
  if (config.instructions.length === 0) {
    config.instructions.push('AGENTS.md');
  }
}

/**
 * OpenCode Plugin Object
 */
export const CodeAnythingPlugin = async (ctx = {}) => {
  const directory = ctx.directory || process.cwd();

  return {
    id: "code-anything",
    config: async (config) => {
      applyCodeAnythingConfig(config, { directory });
    },
    "tool.execute.before": async (input, output) => {
      await onToolExecuteBefore(input, output, { directory });
    },
    "tool.execute.after": async (input, output) => {
      await onToolExecuteAfter(input, output, { directory });
    },
    "experimental.session.compacting": async (input, output) => {
      await onSessionCompacting(input, output, { directory });
    }
  };
};

export default {
  id: "code-anything",
  server: async (_input, options = {}) => {
    return {
      config: async (config) => {
        applyCodeAnythingConfig(config);
      },
      "tool.execute.before": async (input, output) => {
        await onToolExecuteBefore(input, output, options);
      },
      "tool.execute.after": async (input, output) => {
        await onToolExecuteAfter(input, output, options);
      },
      "experimental.session.compacting": async (input, output) => {
        await onSessionCompacting(input, output, options);
      }
    };
  }
};
