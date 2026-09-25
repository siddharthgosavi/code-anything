import os from 'os';
import path from 'path';
import fs from 'fs';
import { execSafe, hasExecutable, log } from './utils.js';
import { safeReadJson } from './jsonc.js';

export class OpenCodeEnvironment {
  constructor(cwd = process.cwd()) {
    this.cwd = cwd;
    this.homeDir = os.homedir();
    this.globalConfigDir = process.env.XDG_CONFIG_HOME 
      ? path.join(process.env.XDG_CONFIG_HOME, 'opencode')
      : path.join(this.homeDir, '.config', 'opencode');
    this.projectConfigDir = path.join(this.cwd, '.opencode');
  }

  /**
   * Check if opencode binary is installed.
   */
  isInstalled() {
    return hasExecutable('opencode');
  }

  /**
   * Get opencode version string.
   */
  getVersion() {
    return execSafe('opencode --version') || 'unknown';
  }

  /**
   * Resolve active configuration file paths.
   */
  getConfigFile(target = 'project') {
    if (target === 'global') {
      const jsoncPath = path.join(this.globalConfigDir, 'opencode.jsonc');
      const jsonPath = path.join(this.globalConfigDir, 'opencode.json');
      if (fs.existsSync(jsoncPath)) return jsoncPath;
      if (fs.existsSync(jsonPath)) return jsonPath;
      return jsonPath;
    } else {
      const jsoncPath = path.join(this.projectConfigDir, 'opencode.jsonc');
      const jsonPath = path.join(this.projectConfigDir, 'opencode.json');
      if (fs.existsSync(jsoncPath)) return jsoncPath;
      if (fs.existsSync(jsonPath)) return jsonPath;
      return jsonPath;
    }
  }

  /**
   * Read config without mutating.
   */
  readConfig(target = 'project') {
    const file = this.getConfigFile(target);
    return {
      file,
      ...safeReadJson(file, {})
    };
  }

  /**
   * Safely detect active running opencode sessions without killing or interfering.
   */
  getActiveSessions() {
    try {
      const isWindows = process.platform === 'win32';
      let cmdOutput;
      if (isWindows) {
        cmdOutput = execSafe('tasklist /FI "IMAGENAME eq opencode.exe" /FO CSV /NH') || '';
      } else {
        cmdOutput = execSafe('ps aux | grep opencode | grep -v grep') || '';
      }

      const sessions = [];
      const lines = cmdOutput.split('\n').filter(Boolean);
      for (const line of lines) {
        const sessionMatch = line.match(/-s\s+([^\s]+)/) || line.match(/--session\s+([^\s]+)/);
        const pidMatch = line.match(/^\S+\s+(\d+)/);
        sessions.push({
          raw: line.trim(),
          pid: pidMatch ? pidMatch[1] : null,
          sessionId: sessionMatch ? sessionMatch[1] : 'interactive/daemon'
        });
      }
      return sessions;
    } catch {
      return [];
    }
  }

  /**
   * Resolve target skills directory.
   */
  getSkillsDir(target = 'project') {
    return target === 'global'
      ? path.join(this.globalConfigDir, 'skills')
      : path.join(this.projectConfigDir, 'skills');
  }

  /**
   * Resolve target agents directory.
   */
  getAgentsDir(target = 'project') {
    return target === 'global'
      ? path.join(this.globalConfigDir, 'agents')
      : path.join(this.projectConfigDir, 'agents');
  }

  /**
   * Resolve instructions/rules file (AGENTS.md).
   */
  getAgentsMarkdownPath(target = 'project') {
    return target === 'global'
      ? path.join(this.globalConfigDir, 'AGENTS.md')
      : path.join(this.cwd, 'AGENTS.md');
  }
}
