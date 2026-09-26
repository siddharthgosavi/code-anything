import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenCodeInstaller } from './installer.js';
import { runDoctor } from './doctor.js';
import { GraphifyRunner } from './graphify-runner.js';
import { MODEL_PRESETS } from './presets.js';
import { listDivisions, listDivisionAgents, searchAgents, installAgencyAgents } from './agency.js';
import { routePrompt } from '../lib/router.js';
import { colors, log } from '../lib/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG_PATH = path.resolve(__dirname, '../../package.json');

function getVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
    return pkg.version;
  } catch {
    return '1.0.0';
  }
}

function showHelp() {
  console.log(`
${colors.bold}everything-opencode${colors.reset} v${getVersion()}
Complete OpenCode coding agent configuration with Graphify code intelligence.

${colors.bold}Usage:${colors.reset}
  npx everything-opencode [command] [options]

${colors.bold}Commands:${colors.reset}
  ${colors.cyan}install${colors.reset} (default)    Configure OpenCode (agents, skills, commands, rules, hooks)
  ${colors.cyan}doctor${colors.reset}               Check OpenCode, active sessions, and Graphify health
  ${colors.cyan}route <prompt>${colors.reset}       Intelligently choose relevant agents for a prompt/task
  ${colors.cyan}graphify [action]${colors.reset}    Manage Graphify AST knowledge graph
      ${colors.gray}init${colors.reset}             Build AST knowledge graph (--code-only)
      ${colors.gray}query <text>${colors.reset}      Query the codebase knowledge graph
      ${colors.gray}status${colors.reset}           Show graph node/edge statistics
  ${colors.cyan}agency [action]${colors.reset}      Manage 279 Agency Agents across 18 divisions
      ${colors.gray}list [--division <name>]${colors.reset} List divisions or agents in a division
      ${colors.gray}search <query>${colors.reset}          Search agency agents by topic/role
      ${colors.gray}route <prompt>${colors.reset}          Find matching agents and workflows for a prompt
      ${colors.gray}install [agents...]${colors.reset}      Install selected agents, --division <name>, or --all
  ${colors.cyan}preset list${colors.reset}          List available model presets
  ${colors.cyan}help${colors.reset}                 Show this help message
  ${colors.cyan}version${colors.reset}              Show version number

${colors.bold}Options:${colors.reset}
  -p, --project            Install for current project (.opencode/) [default]
  -g, --global             Install globally (~/.config/opencode/)
  --preset <name>          Model preset (inherit | anthropic | openai | google | explabs | github)
  --division <name>        Target agency agents division (e.g. engineering, security, design)
  --all                    Select all agents
  --dry-run                Simulate installation without writing changes
  --json                   Output results in JSON format
  --verbose                Enable verbose logging/details
  -h, --help               Display help
  -v, --version            Display version

${colors.bold}Examples:${colors.reset}
  npx everything-opencode
  npx everything-opencode install --global
  npx everything-opencode agency list
  npx everything-opencode agency search "database"
  npx everything-opencode agency install --division engineering
  npx everything-opencode agency install database-optimizer rag-pipeline-engineer
  npx everything-opencode doctor
  npx everything-opencode graphify init
  npx everything-opencode graphify query "authMiddleware"
`);
}

export async function runCli(argv = process.argv.slice(2)) {
  const args = [...argv];
  const command = args[0] && !args[0].startsWith('-') ? args.shift() : 'install';

  // Flags
  const isGlobal = args.includes('-g') || args.includes('--global');
  const dryRun = args.includes('--dry-run');
  const isJson = args.includes('--json');
  const isVerbose = args.includes('--verbose');
  const presetIndex = args.indexOf('--preset');
  const preset = presetIndex !== -1 && args[presetIndex + 1] ? args[presetIndex + 1] : 'inherit';

  if (args.includes('-h') || args.includes('--help') || command === 'help') {
    showHelp();
    return 0;
  }

  if (args.includes('-v') || args.includes('--version') || command === 'version') {
    console.log(`everything-opencode v${getVersion()}`);
    return 0;
  }

  try {
    switch (command) {
      case 'install':
      case 'init':
      case 'setup': {
        const installer = new OpenCodeInstaller({
          global: isGlobal,
          preset,
          dryRun,
          cwd: process.cwd()
        });
        await installer.install();
        return 0;
      }

      case 'doctor':
      case 'check': {
        await runDoctor({ cwd: process.cwd() });
        return 0;
      }

      case 'graphify': {
        const subAction = args[0] || 'status';
        const runner = new GraphifyRunner(process.cwd());

        if (subAction === 'init' || subAction === 'build' || subAction === 'extract') {
          log.info('Building Graphify AST knowledge graph...');
          const out = runner.extractAst();
          console.log(out || 'Extraction completed.');
          const stats = runner.getStats();
          if (stats.exists) {
            log.success(`Graph created: ${stats.nodes} nodes, ${stats.edges} edges, ${stats.communities} communities.`);
          }
        } else if (subAction === 'query') {
          const queryText = args.slice(1).join(' ');
          if (!queryText) {
            log.error('Please specify a query: npx everything-opencode graphify query "<text>"');
            return 1;
          }
          const result = runner.query(queryText);
          console.log(result);
        } else if (subAction === 'status') {
          const stats = runner.getStats();
          if (stats.exists) {
            log.success(`Knowledge graph active: ${stats.nodes} nodes, ${stats.edges} edges.`);
            console.log(`  Path: ${stats.path}`);
            console.log(`  Architecture report: ${stats.hasReport ? 'Available' : 'Not generated'}`);
          } else {
            log.warn('No knowledge graph found in current directory.');
            console.log('Run: npx everything-opencode graphify init');
          }
        } else {
          log.error(`Unknown graphify action: ${subAction}. Use 'init', 'query', or 'status'.`);
          return 1;
        }
        return 0;
      }

      case 'route': {
        const promptText = args.filter(a => !a.startsWith('-')).join(' ');
        if (!promptText) {
          log.error('Please specify a prompt: npx everything-opencode route "<task description>"');
          return 1;
        }
        const result = routePrompt(promptText, { verbose: isVerbose });
        if (isJson) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          displayRouteResult(result, { verbose: isVerbose });
        }
        return 0;
      }

      case 'agency':
      case 'agents': {
        const subAction = args[0] && !args[0].startsWith('-') ? args.shift() : 'list';
        const divIndex = args.indexOf('--division');
        const division = divIndex !== -1 && args[divIndex + 1] ? args[divIndex + 1] : null;
        const all = args.includes('--all');

        if (subAction === 'list') {
          if (division) {
            listDivisionAgents(division);
          } else {
            listDivisions();
          }
        } else if (subAction === 'search' || subAction === 'find') {
          const query = args.filter(a => !a.startsWith('-')).join(' ');
          if (!query) {
            log.error('Please specify a search query: npx everything-opencode agency search "<term>"');
            return 1;
          }
          searchAgents(query);
        } else if (subAction === 'route') {
          const promptText = args.filter(a => !a.startsWith('-')).join(' ');
          if (!promptText) {
            log.error('Please specify a prompt: npx everything-opencode agency route "<task description>"');
            return 1;
          }
          const result = routePrompt(promptText, { verbose: isVerbose });
          if (isJson) {
            console.log(JSON.stringify(result, null, 2));
          } else {
            displayRouteResult(result, { verbose: isVerbose });
          }
        } else if (subAction === 'install' || subAction === 'add') {
          const positionalAgents = args.filter((a, idx) => {
            if (a.startsWith('-')) return false;
            if (idx > 0 && args[idx - 1] === '--division') return false;
            return true;
          });

          await installAgencyAgents({
            division,
            all,
            agents: positionalAgents,
            global: isGlobal,
            dryRun,
            cwd: process.cwd()
          });
        } else {
          log.error(`Unknown agency action: ${subAction}. Use 'list', 'search', 'route', or 'install'.`);
          return 1;
        }
        return 0;
      }

      case 'preset': {
        const sub = args[0] || 'list';
        if (sub === 'list') {
          log.header('Available Model Presets');
          for (const [key, p] of Object.entries(MODEL_PRESETS)) {
            console.log(`${colors.bold}${colors.cyan}${key}${colors.reset}: ${p.name}`);
            console.log(`  ${colors.gray}${p.description}${colors.reset}`);
            if (Object.keys(p.models).length > 0) {
              const sample = Object.entries(p.models).slice(0, 3).map(([a, m]) => `${a}->${m}`).join(', ');
              console.log(`  Models: ${sample}...`);
            }
            console.log();
          }
        }
        return 0;
      }

      default:
        log.error(`Unknown command: ${command}`);
        showHelp();
        return 1;
    }
  } catch (err) {
    log.error(`Execution failed: ${err.message}`);
    log.debug(err.stack);
    return 1;
  }
}

export function displayRouteResult(result, options = {}) {
  const isVerbose = options.verbose;
  log.header(`Agent Selection for: "${result.prompt}"`);

  const p = result.primaryAgent;
  console.log(`${colors.bold}Primary Recommendation:${colors.reset}`);
  console.log(`  ${colors.green}${colors.bold}@${p.slug}${colors.reset} (${p.name}) [Tier ${p.tier} - ${p.division}]`);
  console.log(`  ${colors.gray}${p.description}${colors.reset}`);
  if (p.slashCommand) {
    console.log(`  Slash Command: ${colors.cyan}${p.slashCommand}${colors.reset}`);
  }
  if (isVerbose && p.matchDetails) {
    console.log(`  ${colors.yellow}Match Details:${colors.reset} [score: ${p.score}] ${p.matchDetails.join(', ')}`);
  }
  console.log();

  if (result.workflow && result.workflow.length > 0) {
    console.log(`${colors.bold}Recommended Multi-Agent Workflow:${colors.reset}`);
    const chainStr = result.workflow.map((w, idx) => `${idx + 1}. ${colors.cyan}@${w.slug}${colors.reset} (${w.role})`).join('\n  ');
    console.log(`  ${chainStr}\n`);
  }

  if (result.candidates && result.candidates.length > 1) {
    console.log(`${colors.bold}Alternative Candidates:${colors.reset}`);
    for (const c of result.candidates.slice(1, 4)) {
      console.log(`  • ${colors.cyan}@${c.slug}${colors.reset} [score: ${c.score}] - ${c.name} (${c.division})`);
      if (isVerbose && c.matchDetails) {
        console.log(`      ${colors.gray}Details: ${c.matchDetails.join(', ')}${colors.reset}`);
      }
    }
    console.log();
  }

  console.log(`${colors.bold}Reasoning:${colors.reset}`);
  console.log(`  ${colors.gray}${result.reason}${colors.reset}\n`);

  console.log(`${colors.bold}How to invoke in OpenCode:${colors.reset}`);
  console.log(`  Type ${colors.cyan}@${p.slug}${colors.reset} in your prompt or run ${colors.cyan}${result.recommendedCommand}${colors.reset}\n`);
}

