import pluginDefault, { EverythingOpenCodePlugin, applyEverythingOpenCodeConfig } from './plugin/index.js';
import { AGENTS } from './agents/index.js';
import { COMMANDS } from './commands/index.js';
import { MODEL_PRESETS } from './cli/presets.js';
import { loadAgencyCatalog, listDivisions, listDivisionAgents, searchAgents, installAgencyAgents } from './cli/agency.js';

export {
  EverythingOpenCodePlugin,
  applyEverythingOpenCodeConfig,
  AGENTS,
  COMMANDS,
  MODEL_PRESETS,
  loadAgencyCatalog,
  listDivisions,
  listDivisionAgents,
  searchAgents,
  installAgencyAgents
};

export default pluginDefault;
