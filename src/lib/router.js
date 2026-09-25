import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIVISIONS_PATH = path.resolve(__dirname, '../../agents/agency/divisions.json');

/**
 * Core Tier-1 Meta-Agents with intent triggers and weights
 */
export const CORE_AGENT_PATTERNS = [
  {
    slug: 'planner',
    tier: 1,
    name: 'Planner',
    description: 'Phased implementation planning and risk analysis (read-only until approval)',
    slashCommand: '/plan',
    keywords: [
      'plan', 'planning', 'roadmap', 'breakdown', 'step-by-step', 'phased',
      'how to implement', 'strategy', 'implementation plan', 'requirements'
    ],
    weight: 1.2
  },
  {
    slug: 'architect',
    tier: 1,
    name: 'System Architect',
    description: 'High-level system design, module boundaries, data models, scalability',
    slashCommand: '/plan',
    keywords: [
      'architect', 'architecture', 'system design', 'module boundaries',
      'scalability', 'data model', 'microservices', 'monolith', 'tech stack',
      'trade-offs', 'high level design', 'database schema design'
    ],
    weight: 1.2
  },
  {
    slug: 'tdd-guide',
    tier: 1,
    name: 'TDD Guide',
    description: 'Test-driven development (Red -> Green -> Refactor) and >= 80% coverage',
    slashCommand: '/tdd',
    keywords: [
      'tdd', 'test', 'tests', 'testing', 'unit test', 'unit tests',
      'red green refactor', 'test driven', 'test-driven', 'write test',
      'implement', 'implementation', 'feature', 'bug fix', 'coverage',
      'login validation', 'business logic'
    ],
    weight: 1.3
  },
  {
    slug: 'code-reviewer',
    tier: 1,
    name: 'Code Reviewer',
    description: 'Senior code review on diffs, PR quality, maintainability and style',
    slashCommand: '/code-review',
    keywords: [
      'review', 'reviews', 'code review', 'pr review', 'pull request', 'diff',
      'code quality', 'clean code', 'audit code', 'inspect changes', 'critique'
    ],
    weight: 1.2
  },
  {
    slug: 'security-reviewer',
    tier: 1,
    name: 'Security Reviewer',
    description: 'Vulnerability auditing, OWASP Top 10, auth bypasses, secrets, and injection',
    slashCommand: '/code-review',
    keywords: [
      'security', 'vulnerability', 'vulnerabilities', 'owasp', 'injection', 'auth bypass', 'jwt',
      'secret', 'secrets', 'credential', 'api key', 'xss', 'csrf', 'cve', 'sanitize',
      'penetration', 'secure', 'permission', 'rbac'
    ],
    weight: 1.3
  },
  {
    slug: 'build-error-resolver',
    tier: 1,
    name: 'Build Error Resolver',
    description: 'Multi-language compiler debugger (Rust, Go, TypeScript, Python, C++)',
    slashCommand: '/build-fix',
    keywords: [
      'build error', 'compiler error', 'type error', 'compilation failed',
      'cargo build', 'tsc error', 'syntax error', 'module not found',
      'build fail', 'cannot compile', 'linking error', 'exit code 1'
    ],
    weight: 1.4
  },
  {
    slug: 'e2e-runner',
    tier: 1,
    name: 'E2E Runner',
    description: 'Playwright/Cypress end-to-end testing and browser user journeys',
    slashCommand: '/e2e',
    keywords: [
      'e2e', 'end to end', 'playwright', 'cypress', 'browser test', 'browser tests',
      'user journey', 'ui test', 'integration test', 'headless browser'
    ],
    weight: 1.2
  },
  {
    slug: 'refactor-cleaner',
    tier: 1,
    name: 'Refactor Cleaner',
    description: 'Dead code elimination, complexity reduction, syntax modernization',
    slashCommand: '/refactor-clean',
    keywords: [
      'refactor', 'refactoring', 'cleanup', 'dead code', 'clean code', 'reduce complexity',
      'simplify', 'modernize', 'remove unused', 'deduplicate'
    ],
    weight: 1.1
  },
  {
    slug: 'doc-updater',
    tier: 1,
    name: 'Documentation Updater',
    description: 'Synchronizes README, AGENTS.md, and API references with recent code changes',
    slashCommand: '/update-docs',
    keywords: [
      'doc', 'docs', 'documentation', 'readme', 'api doc', 'changelog',
      'update docs', 'document', 'jsdoc', 'swagger'
    ],
    weight: 1.1
  },
  {
    slug: 'graph-analyst',
    tier: 1,
    name: 'Graph Analyst',
    description: 'Explores Graphify knowledge graph, blast radius, callers, callees',
    slashCommand: '/graph-query',
    keywords: [
      'graphify', 'knowledge graph', 'ast graph', 'blast radius', 'callers',
      'callees', 'dependencies', 'dependency graph', 'who calls', 'where is used'
    ],
    weight: 1.2
  }
];

/**
 * Load cached agency catalog
 */
let cachedAgencyCatalog = null;
function getAgencyCatalog() {
  if (cachedAgencyCatalog) return cachedAgencyCatalog;
  try {
    if (fs.existsSync(DIVISIONS_PATH)) {
      cachedAgencyCatalog = JSON.parse(fs.readFileSync(DIVISIONS_PATH, 'utf8'));
    }
  } catch (err) {
    cachedAgencyCatalog = { divisions: {} };
  }
  return cachedAgencyCatalog || { divisions: {} };
}

const TECHNICAL_DIVISIONS = new Set([
  'core',
  'engineering',
  'architecture',
  'security',
  'testing',
  'spatial-computing',
  'gis',
  'game-development'
]);

const NON_TECHNICAL_DIVISIONS = new Set([
  'paid-media',
  'marketing',
  'sales',
  'finance',
  'hr',
  'support'
]);

const GENERIC_SLUG_TOKENS = new Set([
  'analyst', 'specialist', 'expert', 'engineer', 'manager', 'lead',
  'architect', 'consultant', 'coordinator', 'officer', 'steward',
  'query', 'search', 'data', 'agent', 'guide', 'worker', 'assistant'
]);

const TECH_IDENTIFIERS = [
  'postgresql', 'postgres', 'mysql', 'sqlite', 'mongodb', 'redis', 'supabase', 'planetscale',
  'kubernetes', 'k8s', 'helm', 'docker', 'terraform', 'graphql', 'rest', 'playwright', 'cypress',
  'react', 'vue', 'angular', 'nextjs', 'typescript', 'javascript', 'python', 'rust', 'golang',
  'c++', 'java', 'wcag', 'accessibility', 'a11y', 'indexing', 'indexes', 'schema design',
  'sql', 'jwt', 'oauth', 'owasp', 'vite', 'webpack', 'esbuild', 'pnpm', 'npm', 'yarn', 'bun'
];

function hasWord(text, word) {
  const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  return new RegExp('(^|[^a-z0-9_])' + escaped + '([^a-z0-9_]|$)', 'i').test(text);
}

/**
 * Clean and tokenize a prompt string
 */
function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Compute semantic match score for an agent
 */
function scoreAgent(promptTokens, promptLower, agent) {
  let score = 0;
  const matchDetails = [];

  const division = agent.division || 'core';
  const isTechPrompt = TECH_IDENTIFIERS.some(t => hasWord(promptLower, t)) ||
    promptTokens.some(t => ['code', 'function', 'test', 'build', 'compile', 'refactor', 'bug', 'error', 'table', 'migration', 'deploy', 'cluster', 'cloud', 'pipeline'].includes(t));

  // 1. Slug exact match or partial match
  const slugTokens = agent.slug.split('-');
  let matchedSlugCount = 0;
  for (const st of slugTokens) {
    if (promptTokens.includes(st) && st.length > 2) {
      matchedSlugCount++;
      const val = GENERIC_SLUG_TOKENS.has(st) ? 1.0 : 3.5;
      score += val;
      matchDetails.push(`slug token: ${st}`);
    }
  }
  if (matchedSlugCount >= 2) {
    score += 4.0; // Compound slug match bonus
  }
  if (promptLower.includes(agent.slug)) {
    score += 10.0;
    matchDetails.push(`exact slug: ${agent.slug}`);
  }

  // 2. Name match
  if (agent.name) {
    const nameTokens = tokenize(agent.name);
    for (const nt of nameTokens) {
      if (promptTokens.includes(nt) && nt.length > 2) {
        const val = GENERIC_SLUG_TOKENS.has(nt) ? 0.5 : 2.0;
        score += val;
        matchDetails.push(`name token: ${nt}`);
      }
    }
  }

  // 3. Keywords match (for core agents)
  if (agent.keywords) {
    for (const kw of agent.keywords) {
      if (hasWord(promptLower, kw)) {
        score += 4.0 * (agent.weight || 1.0);
        matchDetails.push(`keyword: "${kw}"`);
      }
    }
  }

  // 4. Technology identifier matches in description
  if (agent.description) {
    const descLower = agent.description.toLowerCase();
    for (const tech of TECH_IDENTIFIERS) {
      if (hasWord(promptLower, tech) && hasWord(descLower, tech)) {
        score += 5.0;
        matchDetails.push(`tech match: ${tech}`);
      }
    }

    const descTokens = tokenize(agent.description);
    for (const dt of descTokens) {
      if (promptTokens.includes(dt) && dt.length > 3) {
        if (!['with', 'from', 'that', 'this', 'have', 'your', 'expert', 'specialist', 'based', 'every', 'other'].includes(dt)) {
          score += 0.8;
        }
      }
    }
  }

  // 5. Division domain weighting
  if (isTechPrompt) {
    if (TECHNICAL_DIVISIONS.has(division)) {
      score *= 1.35;
    } else if (NON_TECHNICAL_DIVISIONS.has(division)) {
      score *= 0.4;
    }
  }

  return { score, matchDetails };
}

/**
 * Route a user prompt to the best matched agent(s)
 * 
 * @param {string} prompt - The natural language user request
 * @param {object} options - Options { limit, threshold, includeAgency }
 * @returns {object} Routing result containing primaryAgent, alternatives, workflow, and reason
 */
export function routePrompt(prompt, options = {}) {
  const {
    limit = 5,
    threshold = 1.5,
    includeAgency = true
  } = options;

  if (!prompt || typeof prompt !== 'string') {
    return {
      success: false,
      primaryAgent: CORE_AGENT_PATTERNS[0],
      candidates: [],
      workflow: [],
      reason: 'Empty prompt provided, defaulting to planner'
    };
  }

  const promptLower = prompt.toLowerCase();
  const promptTokens = tokenize(prompt);

  const candidates = [];

  // 1. Evaluate Core Meta-Agents (Tier 1)
  for (const agent of CORE_AGENT_PATTERNS) {
    const { score, matchDetails } = scoreAgent(promptTokens, promptLower, agent);
    if (score >= threshold) {
      candidates.push({
        slug: agent.slug,
        name: agent.name,
        tier: 1,
        division: 'core',
        description: agent.description,
        slashCommand: agent.slashCommand,
        score: Math.round(score * 10) / 10,
        matchDetails
      });
    }
  }

  // 2. Evaluate Agency Specialist Agents (Tier 2)
  if (includeAgency) {
    const catalog = getAgencyCatalog();
    const divisions = catalog.divisions || {};

    for (const [divKey, divMeta] of Object.entries(divisions)) {
      const agents = divMeta.agents || [];
      for (const agent of agents) {
        const { score, matchDetails } = scoreAgent(promptTokens, promptLower, agent);
        if (score >= threshold) {
          candidates.push({
            slug: agent.slug,
            name: agent.name,
            tier: 2,
            division: divKey,
            description: agent.description,
            slashCommand: null,
            score: Math.round(score * 10) / 10,
            matchDetails
          });
        }
      }
    }
  }

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);

  // Determine Primary Agent
  let primaryAgent = candidates[0];
  if (!primaryAgent) {
    // Default fallback based on basic intent
    if (promptTokens.includes('fix') || promptTokens.includes('bug')) {
      primaryAgent = {
        slug: 'tdd-guide',
        name: 'TDD Guide',
        tier: 1,
        division: 'core',
        description: 'Test-driven development (Red -> Green -> Refactor)',
        slashCommand: '/tdd',
        score: 1.0,
        matchDetails: ['fallback: bugfix heuristic']
      };
    } else {
      primaryAgent = {
        slug: 'planner',
        name: 'Planner',
        tier: 1,
        division: 'core',
        description: 'Phased implementation planning and risk analysis',
        slashCommand: '/plan',
        score: 1.0,
        matchDetails: ['fallback: default planning']
      };
    }
  }

  // Determine Multi-Agent Sequential Workflow
  const workflow = buildWorkflowChain(primaryAgent, candidates, promptLower);

  return {
    success: true,
    prompt,
    primaryAgent,
    candidates: candidates.slice(0, limit),
    workflow,
    recommendedCommand: primaryAgent.slashCommand || `@${primaryAgent.slug}`,
    reason: generateRoutingReason(primaryAgent, workflow)
  };
}

/**
 * Build multi-agent workflow chain based on primary candidate and intent
 */
function buildWorkflowChain(primary, candidates, promptLower) {
  const chain = [];
  const added = new Set();

  function add(slug, role) {
    if (!added.has(slug)) {
      added.add(slug);
      chain.push({ slug, role });
    }
  }

  // 1. Complex feature / new implementation
  if (primary.slug === 'planner' || primary.slug === 'architect' || promptLower.includes('implement') || promptLower.includes('feature')) {
    add('planner', 'Requirements & Phased Breakdown');
    if (primary.slug === 'architect' || promptLower.includes('architecture') || promptLower.includes('design')) {
      add('architect', 'System & Interface Design');
    }
    // Check if there is a domain specialist in top candidates
    const specialist = candidates.find(c => c.tier === 2);
    if (specialist) {
      add(specialist.slug, `Domain Specialist (${specialist.division})`);
    }
    add('tdd-guide', 'Test-Driven Implementation');
    add('code-reviewer', 'Code Quality & Correctness Review');
    if (promptLower.includes('auth') || promptLower.includes('security') || promptLower.includes('api key') || promptLower.includes('payment')) {
      add('security-reviewer', 'Security & Permissions Audit');
    }
    return chain;
  }

  // 2. Bugfix workflow
  if (primary.slug === 'build-error-resolver' || promptLower.includes('bug') || promptLower.includes('error') || promptLower.includes('fail')) {
    if (primary.slug === 'build-error-resolver') {
      add('build-error-resolver', 'Compiler & Type Diagnostic');
    } else {
      add('graph-analyst', 'Blast Radius & Call Flow Navigation');
    }
    add('tdd-guide', 'Reproduce with Failing Test & Fix');
    add('code-reviewer', 'Review Fix & Prevent Regressions');
    return chain;
  }

  // 3. Security / Audit workflow
  if (primary.slug === 'security-reviewer' || promptLower.includes('vulnerability') || promptLower.includes('security') || promptLower.includes('audit')) {
    add('security-reviewer', 'Vulnerability & OWASP Analysis');
    add('code-reviewer', 'Maintainability & Quality Inspection');
    return chain;
  }

  // 4. Default: Primary + Code Reviewer
  add(primary.slug, primary.name);
  if (primary.slug !== 'code-reviewer') {
    add('code-reviewer', 'Verification & Quality Review');
  }

  return chain;
}

/**
 * Generate user-facing explanation for the routing decision
 */
function generateRoutingReason(primary, workflow) {
  if (primary.tier === 1) {
    return `Selected core meta-agent @${primary.slug} based on matched intent (${primary.matchDetails.slice(0, 2).join(', ')}). Suggested workflow chain: ${workflow.map(w => '@' + w.slug).join(' ➔ ')}.`;
  }
  return `Selected specialized division agent @${primary.slug} (${primary.division}) for domain expertise. Recommended workflow: ${workflow.map(w => '@' + w.slug).join(' ➔ ')}.`;
}
