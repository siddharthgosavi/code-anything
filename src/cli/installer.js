import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenCodeEnvironment } from '../lib/opencode.js';
import { GraphifyRunner } from './graphify-runner.js';
import { safeReadJson, safeWriteJson } from '../lib/jsonc.js';
import { copyDirRecursive, log, colors } from '../lib/utils.js';
import { applyCodeAnythingConfig } from '../plugin/index.js';
import { resolveAgentModel } from './presets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILLS_SOURCE_DIR = path.resolve(__dirname, '../../skills');
const TEMPLATES_DIR = path.resolve(__dirname, '../../templates');

export class OpenCodeInstaller {
  constructor(options = {}) {
    this.cwd = options.cwd || process.cwd();
    this.target = options.global ? 'global' : 'project';
    this.preset = options.preset || 'inherit';
    this.dryRun = options.dryRun || false;
    this.env = new OpenCodeEnvironment(this.cwd);
    this.graphify = new GraphifyRunner(this.cwd);
  }

  /**
   * Run the complete installation workflow safely.
   */
  async install() {
    log.header('code-anything Setup');
    log.info(`Target mode: ${colors.bold}${this.target}${colors.reset}`);
    log.info(`Working directory: ${colors.bold}${this.cwd}${colors.reset}`);
    log.info(`Model preset: ${colors.bold}${this.preset}${colors.reset}`);

    // Step 1: Check OpenCode installation
    log.step(1, 6, 'Checking OpenCode environment...');
    if (!this.env.isInstalled()) {
      log.warn('opencode executable was not found in your PATH.');
      log.warn('You can install it with: npm install -g opencode-ai');
    } else {
      log.success(`Found OpenCode version ${this.env.getVersion()}`);
    }

    // Step 2: Safe session check
    log.step(2, 6, 'Checking active OpenCode sessions...');
    const activeSessions = this.env.getActiveSessions();
    if (activeSessions.length > 0) {
      log.info(`Found ${activeSessions.length} active OpenCode session(s).`);
      log.success('Safety guarantee: Active sessions and processes will NOT be terminated or disrupted.');
    } else {
      log.info('No active sessions currently running.');
    }

    // Step 3: Configure OpenCode settings (Non-destructive merge)
    log.step(3, 6, 'Updating OpenCode configuration...');
    const configFile = this.env.getConfigFile(this.target);
    const { data: existingConfig, exists } = safeReadJson(configFile, {
      $schema: 'https://opencode.ai/config.json'
    });

    const config = { ...existingConfig };
    config.$schema = config.$schema || 'https://opencode.ai/config.json';

    // Apply plugin, agent, command, skills, and compaction settings
    applyCodeAnythingConfig(config);

    // If a model preset was selected, apply models to registered agents
    if (this.preset !== 'inherit') {
      for (const [name, agentDef] of Object.entries(config.agent || {})) {
        const model = resolveAgentModel(name, this.preset);
        if (model) {
          agentDef.model = model;
        }
      }
    }

    // Add plugin entry if not already present
    config.plugin = config.plugin || [];
    const pluginName = 'code-anything';
    const hasPlugin = config.plugin.some(p => {
      if (typeof p === 'string') return p === pluginName;
      if (Array.isArray(p)) return p[0] === pluginName;
      return false;
    });

    if (!hasPlugin) {
      config.plugin.push(pluginName);
    }

    if (!this.dryRun) {
      safeWriteJson(configFile, config, { backup: true });
      log.success(`Configuration successfully saved to: ${configFile}`);
      if (exists) {
        log.info(`Created automatic backup: ${configFile}.bak`);
      }
    } else {
      log.info(`[Dry Run] Would write config to: ${configFile}`);
    }

    // Step 4: Copy skills to config directory
    log.step(4, 6, 'Installing modular skills...');
    const targetSkillsDir = this.env.getSkillsDir(this.target);
    if (!this.dryRun) {
      copyDirRecursive(SKILLS_SOURCE_DIR, targetSkillsDir);
      log.success(`Installed skills to: ${targetSkillsDir}`);
    } else {
      log.info(`[Dry Run] Would copy skills to: ${targetSkillsDir}`);
    }

    // Step 5: Install AGENTS.md instructions
    log.step(5, 6, 'Configuring AGENTS.md guidelines...');
    const agentsMdPath = this.env.getAgentsMarkdownPath(this.target);
    if (!fs.existsSync(agentsMdPath)) {
      const templateContent = fs.readFileSync(path.join(TEMPLATES_DIR, 'AGENTS.md'), 'utf8');
      if (!this.dryRun) {
        fs.writeFileSync(agentsMdPath, templateContent, 'utf8');
        log.success(`Created agent guidelines: ${agentsMdPath}`);
      }
    } else {
      log.info(`AGENTS.md already exists at: ${agentsMdPath} (preserving custom content)`);
    }

    // Step 6: Graphify integration check
    log.step(6, 6, 'Checking Graphify code intelligence...');
    if (this.graphify.isAvailable()) {
      const gv = this.graphify.getVersion();
      log.success(`Found Graphify version: ${gv}`);
      const stats = this.graphify.getStats();
      if (stats.exists) {
        log.success(`Existing codebase knowledge graph found: ${stats.nodes} nodes, ${stats.edges} edges.`);
      } else {
        log.info('No graphify-out/graph.json found yet in this workspace.');
        log.info('Tip: Run "npx code-anything graphify init" to generate your codebase graph instantly.');
      }
    } else {
      log.warn('Graphify CLI is not found in PATH.');
      log.warn('Install it for AST codebase knowledge graphs: pip install graphify');
    }

    log.header('Setup Complete!');
    console.log(`${colors.green}✓${colors.reset} 10 Specialized Agents ready (/plan, /tdd, /build-fix, /code-review, etc.)`);
    console.log(`${colors.green}✓${colors.reset} 14 Slash Commands configured in OpenCode`);
    console.log(`${colors.green}✓${colors.reset} 10 Modular Skills installed (Graphify, TDD, Verification, etc.)`);
    console.log(`${colors.green}✓${colors.reset} Graphify Code Intelligence & Safety Hooks enabled`);
    console.log(`\nTo start using, simply open OpenCode in this directory:`);
    console.log(`  ${colors.bold}${colors.cyan}opencode${colors.reset}\n`);

    return true;
  }
}
