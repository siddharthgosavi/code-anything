import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { log, colors } from '../lib/utils.js';
import { OpenCodeEnvironment } from '../lib/opencode.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AGENCY_ROOT = path.resolve(__dirname, '../../agents/agency');
const DIVISIONS_FILE = path.join(AGENCY_ROOT, 'divisions.json');

/**
 * Load the agency catalog from divisions.json
 */
export function loadAgencyCatalog() {
  if (!fs.existsSync(DIVISIONS_FILE)) {
    return { divisions: {} };
  }
  return JSON.parse(fs.readFileSync(DIVISIONS_FILE, 'utf8'));
}

/**
 * List all divisions in the agency agents catalog.
 */
export function listDivisions() {
  const catalog = loadAgencyCatalog();
  const divisions = catalog.divisions || {};

  log.header('Agency Agents Divisions (279 Total Specialists)');
  console.log('Browse curated specialized subagents ready for OpenCode (adapted from msitarzewski/agency-agents):\n');

  let totalAgents = 0;
  for (const [key, meta] of Object.entries(divisions)) {
    const count = (meta.agents || []).length;
    totalAgents += count;
    const label = meta.label || key;
    const colorHex = meta.color || '#3B82F6';
    const sampleAgents = (meta.agents || []).slice(0, 3).map(a => `@${a.slug}`).join(', ');

    console.log(`  ${colors.bold}${label.padEnd(22)}${colors.reset} [${count} agents] (id: ${key})`);
    console.log(`    Sample: ${sampleAgents}${count > 3 ? ', ...' : ''}`);
  }

  console.log(`\nTotal: ${colors.bold}${totalAgents}${colors.reset} agents across ${Object.keys(divisions).length} divisions.\n`);
  console.log(`Run ${colors.cyan}npx code-anything agency list --division <name>${colors.reset} to inspect a division.`);
  console.log(`Run ${colors.cyan}npx code-anything agency install --division <name>${colors.reset} to install.`);
}

/**
 * List all agents in a specific division.
 */
export function listDivisionAgents(divisionName) {
  const catalog = loadAgencyCatalog();
  const div = catalog.divisions?.[divisionName.toLowerCase()];

  if (!div) {
    log.error(`Unknown division "${divisionName}".`);
    console.log(`Available divisions: ${Object.keys(catalog.divisions || {}).join(', ')}`);
    return;
  }

  log.header(`Division: ${div.label} (${(div.agents || []).length} Agents)`);

  for (const agent of div.agents || []) {
    const emoji = agent.emoji ? `${agent.emoji} ` : '';
    console.log(`  ${colors.bold}@${agent.slug}${colors.reset} — ${emoji}${agent.name}`);
    if (agent.vibe) {
      console.log(`    ${colors.dim}Vibe: ${agent.vibe}${colors.reset}`);
    }
    console.log(`    ${agent.description}`);
    console.log('');
  }

  console.log(`Install these agents: ${colors.cyan}npx code-anything agency install --division ${divisionName}${colors.reset}`);
}

/**
 * Search across all 279 agency agents.
 */
export function searchAgents(query) {
  const catalog = loadAgencyCatalog();
  const q = query.toLowerCase().trim();

  log.header(`Searching Agency Agents: "${query}"`);

  const results = [];
  for (const [divKey, div] of Object.entries(catalog.divisions || {})) {
    for (const agent of div.agents || []) {
      const matchScore = 
        (agent.slug.includes(q) ? 3 : 0) +
        (agent.name.toLowerCase().includes(q) ? 2 : 0) +
        (agent.description.toLowerCase().includes(q) ? 1 : 0) +
        ((agent.vibe || '').toLowerCase().includes(q) ? 1 : 0);

      if (matchScore > 0) {
        results.push({ ...agent, division: divKey, score: matchScore });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);

  if (results.length === 0) {
    log.warn(`No agents found matching "${query}".`);
    return;
  }

  console.log(`Found ${colors.bold}${results.length}${colors.reset} matching agent(s):\n`);

  for (const agent of results.slice(0, 20)) {
    const emoji = agent.emoji ? `${agent.emoji} ` : '';
    console.log(`  ${colors.bold}@${agent.slug}${colors.reset} [${agent.division}] — ${emoji}${agent.name}`);
    console.log(`    ${agent.description}`);
    console.log('');
  }

  if (results.length > 20) {
    console.log(`... and ${results.length - 20} more matching agents.`);
  }

  console.log(`To install: ${colors.cyan}npx code-anything agency install <slug>${colors.reset}`);
}

/**
 * Install selected agency agents, division packs, or all agents.
 */
export async function installAgencyAgents(options = {}) {
  const {
    division,
    all = false,
    agents = [],
    global = false,
    cwd = process.cwd(),
    dryRun = false
  } = options;

  const catalog = loadAgencyCatalog();
  const env = new OpenCodeEnvironment(cwd);

  const targetDir = global
    ? path.join(env.globalConfigDir, 'agents')
    : path.join(env.projectConfigDir, 'agents');

  const toInstall = [];

  if (all) {
    for (const div of Object.values(catalog.divisions || {})) {
      for (const agent of div.agents || []) {
        toInstall.push(agent);
      }
    }
  } else if (division) {
    const div = catalog.divisions?.[division.toLowerCase()];
    if (!div) {
      log.error(`Unknown division "${division}".`);
      console.log(`Available divisions: ${Object.keys(catalog.divisions || {}).join(', ')}`);
      return;
    }
    toInstall.push(...(div.agents || []));
  } else if (agents.length > 0) {
    // Find matching agents by slug or name
    const requested = new Set(agents.map(a => a.toLowerCase().replace(/^@/, '')));
    for (const div of Object.values(catalog.divisions || {})) {
      for (const agent of div.agents || []) {
        if (requested.has(agent.slug.toLowerCase()) || requested.has(agent.name.toLowerCase())) {
          toInstall.push(agent);
          requested.delete(agent.slug.toLowerCase());
          requested.delete(agent.name.toLowerCase());
        }
      }
    }

    if (requested.size > 0) {
      log.warn(`Could not find agent(s): ${Array.from(requested).join(', ')}`);
    }
  } else {
    log.error('Please specify agents to install, --division <name>, or --all.');
    console.log(`Example: ${colors.cyan}npx code-anything agency install --division engineering${colors.reset}`);
    return;
  }

  if (toInstall.length === 0) {
    log.warn('No agents selected for installation.');
    return;
  }

  log.header(`Installing Agency Agents (${toInstall.length} agents)`);
  log.info(`Target directory: ${colors.bold}${targetDir}${colors.reset}`);

  if (!dryRun && !fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let installedCount = 0;
  for (const agent of toInstall) {
    const srcFile = path.resolve(AGENCY_ROOT, agent.division, `${agent.slug}.md`);
    const destFile = path.join(targetDir, `${agent.slug}.md`);

    if (!fs.existsSync(srcFile)) {
      log.warn(`Source file not found: ${srcFile}`);
      continue;
    }

    if (!dryRun) {
      fs.copyFileSync(srcFile, destFile);
    }
    installedCount++;
  }

  if (dryRun) {
    log.info(`[Dry Run] Would install ${installedCount} agent(s) into: ${targetDir}`);
  } else {
    log.success(`Successfully installed ${installedCount} agent(s) to ${targetDir}`);
    console.log('\nYou can now invoke them in OpenCode via @:');
    const sample = toInstall.slice(0, 5).map(a => `@${a.slug}`).join('  ');
    console.log(`  ${sample}${toInstall.length > 5 ? '  ...' : ''}\n`);
  }
}
