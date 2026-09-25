import pluginDefault, { EverythingOpenCodePlugin, applyEverythingOpenCodeConfig } from './plugin/index.js';
import { AGENTS } from './agents/index.js';
import { COMMANDS } from './commands/index.js';
import { MODEL_PRESETS } from './cli/presets.js';

export {
  EverythingOpenCodePlugin,
  applyEverythingOpenCodeConfig,
  AGENTS,
  COMMANDS,
  MODEL_PRESETS
};

export default pluginDefault;
