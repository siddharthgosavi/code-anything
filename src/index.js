import pluginDefault, { EverythingOpenCodePlugin, applyEverythingOpenCodeConfig } from './plugin/index.js';
import { AGENTS } from './agents/index.js';
import { COMMANDS } from './commands/index.js';
import { MODEL_PRESETS } from './cli/presets.js';
import { loadAgencyCatalog, listDivisions, listDivisionAgents, searchAgents, installAgencyAgents } from './cli/agency.js';
import { routePrompt, CORE_AGENT_PATTERNS } from './lib/router.js';

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
  installAgencyAgents,
  routePrompt,
  CORE_AGENT_PATTERNS
};

export default pluginDefault;
