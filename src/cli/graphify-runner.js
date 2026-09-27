import fs from 'fs';
import path from 'path';
import { execSafe, execArgv, hasExecutable, log } from '../lib/utils.js';

const GRAPH_FILE = 'graph.json';

export class GraphifyRunner {
  constructor(cwd = process.cwd()) {
    this.cwd = cwd;
    this.graphifyOutDir = path.join(this.cwd, 'graphify-out');
    this.graphJsonPath = path.join(this.graphifyOutDir, GRAPH_FILE);
    this.graphReportPath = path.join(this.graphifyOutDir, 'GRAPH_REPORT.md');
  }

  /**
   * Check if graphify CLI is available.
   */
  isAvailable() {
    return hasExecutable('graphify');
  }

  /**
   * Get installed graphify version.
   */
  getVersion() {
    return execArgv('graphify', ['--version']) || null;
  }

  /**
   * Read + validate the knowledge graph file.
   * A leftover/corrupt/truncated graph.json (e.g. from a crashed extraction)
   * must NOT be reported as a healthy graph.
   * @returns {{ok: boolean, data?: object, reason?: string}}
   */
  readValidGraph() {
    if (!fs.existsSync(this.graphJsonPath)) {
      return { ok: false, reason: 'missing' };
    }
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(this.graphJsonPath, 'utf8'));
    } catch {
      return { ok: false, reason: 'corrupt' };
    }
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, reason: 'corrupt' };
    }
    const nodeCount = Array.isArray(parsed.nodes)
      ? parsed.nodes.length
      : (parsed.nodes && typeof parsed.nodes === 'object' ? Object.keys(parsed.nodes).length : 0);
    if (!('nodes' in parsed)) {
      return { ok: false, reason: 'corrupt', data: parsed };
    }
    return { ok: true, data: parsed, nodeCount };
  }

  /**
   * Check if a *valid* knowledge graph has been built for this project.
   */
  hasGraph() {
    return this.readValidGraph().ok;
  }

  /**
   * Get graph statistics (nodes, edges, communities, file size).
   * exists=false with reason='corrupt' signals a present but unusable graph.
   */
  getStats() {
    const graph = this.readValidGraph();
    if (graph.reason === 'missing') {
      return { exists: false };
    }
    if (!graph.ok) {
      return { exists: false, corrupt: true, path: this.graphJsonPath, reason: graph.reason };
    }

    try {
      const stats = fs.statSync(this.graphJsonPath);
      const data = graph.data;
      const nodes = graph.nodeCount;
      const edges = Array.isArray(data.links) ? data.links.length : (Array.isArray(data.edges) ? data.edges.length : 0);
      const communities = data.communities ? Object.keys(data.communities).length : 0;

      return {
        exists: true,
        path: this.graphJsonPath,
        sizeBytes: stats.size,
        nodes,
        edges,
        communities,
        hasReport: fs.existsSync(this.graphReportPath)
      };
    } catch (err) {
      return { exists: true, error: err.message };
    }
  }

  /**
   * Extract knowledge graph using AST (code-only, fast, zero API token cost).
   * Runs without a shell so target paths containing quotes/spaces are inert.
   */
  extractAst(targetDir = this.cwd) {
    if (!this.isAvailable()) {
      throw new Error('graphify CLI is not installed or not in PATH.');
    }

    log.info(`Running graphify extract on ${targetDir} (--code-only)...`);
    const output = execArgv('graphify', ['extract', targetDir, '--code-only'], {
      cwd: targetDir,
      timeout: 120000
    });
    if (output === null) {
      throw new Error('graphify extract failed. Check graphify CLI availability and permissions.');
    }
    return output;
  }

  /**
   * Query the knowledge graph for a symbol, function, or concept.
   * Uses argv-form execution — no shell quoting on user input (CWE-78 safe).
   */
  query(queryText) {
    if (!this.isAvailable()) {
      throw new Error('graphify CLI is not installed.');
    }
    if (!this.hasGraph()) {
      throw new Error(`Valid graph not found at ${this.graphJsonPath}. Run extraction first.`);
    }

    const output = execArgv('graphify', ['query', String(queryText)], {
      cwd: this.cwd,
      timeout: 30000
    });
    if (output === null) {
      throw new Error('graphify query failed.');
    }
    return output;
  }

  /**
   * Export interactive HTML graph visualization.
   */
  exportHtml() {
    if (!this.hasGraph()) {
      throw new Error('Valid graph file does not exist.');
    }
    return execArgv('graphify', ['export', 'html'], { cwd: this.cwd });
  }
}
