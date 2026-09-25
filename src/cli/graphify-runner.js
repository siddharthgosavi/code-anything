import fs from 'fs';
import path from 'path';
import { execSafe, hasExecutable, log } from '../lib/utils.js';

export class GraphifyRunner {
  constructor(cwd = process.cwd()) {
    this.cwd = cwd;
    this.graphifyOutDir = path.join(this.cwd, 'graphify-out');
    this.graphJsonPath = path.join(this.graphifyOutDir, 'graph.json');
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
    return execSafe('graphify --version') || null;
  }

  /**
   * Check if knowledge graph has been built for this project.
   */
  hasGraph() {
    return fs.existsSync(this.graphJsonPath);
  }

  /**
   * Get graph statistics (nodes, edges, communities, file size).
   */
  getStats() {
    if (!this.hasGraph()) {
      return { exists: false };
    }

    try {
      const stats = fs.statSync(this.graphJsonPath);
      const data = JSON.parse(fs.readFileSync(this.graphJsonPath, 'utf8'));
      const nodes = Array.isArray(data.nodes) ? data.nodes.length : (data.nodes ? Object.keys(data.nodes).length : 0);
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
   */
  extractAst(targetDir = this.cwd) {
    if (!this.isAvailable()) {
      throw new Error('graphify CLI is not installed or not in PATH.');
    }

    log.info(`Running graphify extract on ${targetDir} (--code-only)...`);
    const output = execSafe(`graphify extract "${targetDir}" --code-only`, {
      cwd: targetDir,
      timeout: 120000
    });
    return output;
  }

  /**
   * Query the knowledge graph for a symbol, function, or concept.
   */
  query(queryText) {
    if (!this.isAvailable()) {
      throw new Error('graphify CLI is not installed.');
    }
    if (!this.hasGraph()) {
      throw new Error(`Graph not found at ${this.graphJsonPath}. Run extraction first.`);
    }

    const output = execSafe(`graphify query "${queryText}"`, {
      cwd: this.cwd,
      timeout: 30000
    });
    return output;
  }

  /**
   * Export interactive HTML graph visualization.
   */
  exportHtml() {
    if (!this.hasGraph()) {
      throw new Error('Graph file does not exist.');
    }
    return execSafe('graphify export html', { cwd: this.cwd });
  }
}
