import { fileURLToPath } from 'url';
import path from 'path';
import { AGENTS } from '../agents/index.js';
import { COMMANDS } from '../commands/index.js';
import { onToolExecuteBefore, onToolExecuteAfter, onSessionCompacting } from './hooks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILLS_DIR = path.resolve(__dirname, '../../skills');
const AGENTS_MD_PATH = path.resolve(__dirname, '../../templates/AGENTS.md');

/**
 * Configure OpenCode settings dynamically.
 */
export function applyEverythingOpenCodeConfig(config) {
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

  // 3. Add skills path
  config.skills = config.skills || {};
  config.skills.paths = config.skills.paths || [];
  if (!config.skills.paths.includes(SKILLS_DIR)) {
    config.skills.paths.push(SKILLS_DIR);
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
export const EverythingOpenCodePlugin = async (ctx = {}) => {
  const directory = ctx.directory || process.cwd();

  return {
    id: "everything-opencode",
    config: async (config) => {
      applyEverythingOpenCodeConfig(config);
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
  id: "everything-opencode",
  server: async (_input, options = {}) => {
    return {
      config: async (config) => {
        applyEverythingOpenCodeConfig(config);
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
