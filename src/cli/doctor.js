import fs from 'fs';
import path from 'path';
import { OpenCodeEnvironment } from '../lib/opencode.js';
import { GraphifyRunner } from './graphify-runner.js';
import { detectPackageManager } from '../lib/package-manager.js';
import { safeReadJson } from '../lib/jsonc.js';
import { colors, log } from '../lib/utils.js';

export async function runDoctor(options = {}) {
  const cwd = options.cwd || process.cwd();
  const env = new OpenCodeEnvironment(cwd);
  const graphify = new GraphifyRunner(cwd);

  log.header('code-anything Doctor');

  // 1. OpenCode Environment
  console.log(`${colors.bold}OpenCode CLI:${colors.reset}`);
  if (env.isInstalled()) {
    console.log(`  ${colors.green}✓${colors.reset} Installed (${env.getVersion()})`);
    // ARCH-4: surface the declared compatibility contract from package.json
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
      const tested = pkg.config?.opencodeVersion;
      if (tested) console.log(`  ${colors.gray}• Tested against OpenCode ${tested}.${colors.reset}`);
    } catch { /* non-fatal */ }
  } else {
    console.log(`  ${colors.red}✗${colors.reset} opencode CLI not found in PATH`);
  }

  // 2. Active Sessions (Read-Only Safety Check)
  console.log(`\n${colors.bold}Active OpenCode Sessions:${colors.reset}`);
  const sessions = env.getActiveSessions();
  if (sessions.length > 0) {
    console.log(`  ${colors.cyan}ℹ${colors.reset} Detected ${sessions.length} running session(s):`);
    for (const s of sessions) {
      console.log(`    - Session ID: ${colors.bold}${s.sessionId}${colors.reset} (PID: ${s.pid || 'unknown'})`);
    }
    console.log(`  ${colors.green}✓${colors.reset} Safe Mode: Running sessions are protected and completely untouched.`);
  } else {
    console.log(`  ${colors.gray}• No running opencode processes detected.${colors.reset}`);
  }

  // 3. Graphify Integration
  console.log(`\n${colors.bold}Graphify Knowledge Graph:${colors.reset}`);
  if (graphify.isAvailable()) {
    console.log(`  ${colors.green}✓${colors.reset} Graphify CLI installed (${graphify.getVersion()})`);
    const stats = graphify.getStats();
    if (stats.exists) {
      console.log(`  ${colors.green}✓${colors.reset} Project graph found at graphify-out/graph.json`);
      console.log(`    - Nodes: ${colors.bold}${stats.nodes}${colors.reset}`);
      console.log(`    - Edges: ${colors.bold}${stats.edges}${colors.reset}`);
      console.log(`    - Communities: ${colors.bold}${stats.communities}${colors.reset}`);
      console.log(`    - Architecture report: ${stats.hasReport ? colors.green + 'Available' + colors.reset : colors.gray + 'Not yet generated' + colors.reset}`);
      
      const savedTokens = Math.round((stats.nodes * 150 + stats.edges * 50) / 1000);
      console.log(`    - ${colors.cyan}Context Savings:${colors.reset} ~${savedTokens}k tokens avoided per query vs. blind code reading`);
    } else if (stats.corrupt) {
      console.log(`  ${colors.red}✗${colors.reset} graph.json exists but is corrupt/unparseable.`);
      console.log(`    Rebuild: ${colors.cyan}npx code-anything graphify init${colors.reset}`);
    } else {
      console.log(`  ${colors.yellow}!${colors.reset} No project graph built yet.`);
      console.log(`    Run: ${colors.cyan}npx code-anything graphify init${colors.reset}`);
    }
  } else {
    console.log(`  ${colors.yellow}!${colors.reset} Graphify CLI not installed.`);
    console.log(`    Install: ${colors.cyan}pip install graphify${colors.reset}`);
  }

  // 4. Package Manager
  console.log(`\n${colors.bold}Package Manager:${colors.reset}`);
  const pm = detectPackageManager(cwd);
  console.log(`  ${colors.green}✓${colors.reset} Detected preferred manager: ${colors.bold}${pm}${colors.reset}`);

  // 5. OpenCode Configuration
  console.log(`\n${colors.bold}OpenCode Configuration:${colors.reset}`);
  const projectConfig = env.readConfig('project');
  const globalConfig = env.readConfig('global');

  if (projectConfig.exists) {
    const agentsCount = Object.keys(projectConfig.data.agent || {}).length;
    const commandsCount = Object.keys(projectConfig.data.command || {}).length;
    console.log(`  ${colors.green}✓${colors.reset} Project config: ${projectConfig.file}`);
    console.log(`    - Agents: ${agentsCount}`);
    console.log(`    - Commands: ${commandsCount}`);
    console.log(`    - Plugins: ${JSON.stringify(projectConfig.data.plugin || [])}`);
  } else {
    console.log(`  ${colors.gray}• No local project config (.opencode/opencode.json)${colors.reset}`);
  }

  if (globalConfig.exists) {
    console.log(`  ${colors.green}✓${colors.reset} Global config: ${globalConfig.file}`);
  }

  // 6. Guidelines file
  const agentsMd = env.getAgentsMarkdownPath('project');
  if (fs.existsSync(agentsMd)) {
    console.log(`  ${colors.green}✓${colors.reset} AGENTS.md present in project root`);
  } else {
    console.log(`  ${colors.gray}• No AGENTS.md in project root${colors.reset}`);
  }

  console.log('\nDoctor check complete.\n');
  return true;
}
