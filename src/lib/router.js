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
  'kubernetes', 'k8s', 'helm', 'docker', 'compose', 'terraform', 'graphql', 'rest', 'api',
  'playwright', 'cypress',
  'react', 'vue', 'angular', 'nextjs', 'typescript', 'javascript', 'python', 'rust', 'golang',
  'c++', 'java', 'wcag', 'accessibility', 'a11y', 'indexing', 'indexes', 'schema design',
  'sql', 'jwt', 'oauth', 'owasp', 'vite', 'webpack', 'esbuild', 'pnpm', 'npm', 'yarn', 'bun',
  'ci/cd', 'pipeline', 'deploy', 'infrastructure', 'cluster', 'microservice', 'middleware'
];

/**
 * ENG-1: Curated domain keyword overrides for the highest-value Tier-2
 * agency agents. The Tier-2 catalog ships only short descriptions, so
 * pure token-overlap scoring lets persona agents hijack technical prompts
 * (e.g. "docker compose" -> blender-add-on-engineer). Explicit triggers
 * keep the scorer deterministic while we work toward embedding scoring.
 * Matched with the same rule as Tier-1 keywords (score 4.0 x weight).
 */
export const AGENCY_KEYWORD_OVERRIDES = {
  'database-optimizer': ['postgres', 'postgresql', 'sql', 'query', 'queries', 'indexing', 'indexes', 'schema', 'database'],
  'database-reliability-engineer': ['database', 'replication', 'backup', 'postgres', 'mysql', 'failover'],
  'devops-automator': ['devops', 'ci/cd', 'pipeline', 'deploy', 'kubernetes', 'helm', 'docker', 'compose', 'terraform', 'infrastructure', 'cluster', 'vpc', 'github actions'],
  'platform-engineer': ['platform', 'kubernetes', 'terraform', 'helm', 'ci/cd', 'internal developer', 'paved road', 'docker'],
  'sre-site-reliability-engineer': ['sre', 'slo', 'error budget', 'observability', 'on-call', 'incident', 'reliability'],
  'api-platform-engineer': ['graphql', 'rest', 'endpoint', 'endpoints', 'api', 'resolvers', 'schema', 'openapi', 'versioning', 'middleware', 'rate limit'],
  'backend-architect': ['backend', 'microservice', 'microservices', 'api', 'service', 'architecture'],
  'ai-engineer': ['ai', 'ml', 'model', 'models', 'fine-tune', 'finetune', 'llm', 'training', 'inference', 'mlflow', 'deployment of model', 'serving'],
  'data-engineer': ['etl', 'elt', 'spark', 'airflow', 'dbt', 'lakehouse', 'data pipeline', 'streaming'],
  'rag-pipeline-engineer': ['rag', 'embedding', 'embeddings', 'vector', 'pinecone', 'weaviate', 'chunking', 'retrieval'],
  'prompt-engineer': ['prompt', 'prompting', 'system prompt', 'few-shot'],
  'frontend-developer': ['react', 'nextjs', 'vue', 'css', 'ui', 'component', 'components', 'accessibility', 'web vitals', 'bundle'],
  'test-automation-engineer': ['playwright', 'cypress', 'selenium', 'test automation', 'e2e'],
  'ai-generated-code-security-auditor': ['supabase', 'row level security', 'rls', 'vibe coded', 'prompt injection'],
  'section-508-accessibility-specialist': ['wcag', 'accessibility', 'a11y', 'screen reader', '508']
};

function hasWord(text, word) {
  const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  return new RegExp('(^|[^a-z0-9_])' + escaped + '([^a-z0-9_]|$)', 'i').test(text);
}

/**
 * ENG-1: Word-boundary PREFIX match for technology identifiers, so the
 * prompt says "postgres" and the description says "PostgreSQL" (or
 * "indexes" vs "indexing", "deploy" vs "deployment") still match.
 * Prefix-only — never substring ('test' must not match 'latest').
 */
function hasWordPrefix(text, word) {
  const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  return new RegExp('(^|[^a-z0-9_])' + escaped, 'i').test(text);
}

function stem(w) {
  if (w.length > 5) {
    if (w.endsWith('ing')) return w.slice(0, -3);
    if (w.endsWith('tion')) return w.slice(0, -4);
    if (w.endsWith('ies')) return w.slice(0, -3) + 'y';
    if (w.endsWith('ed')) return w.slice(0, -2);
    if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  }
  return w;
}

/**
 * Clean, tokenize, and stem a prompt string
 */
function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(stem);
}

/**
 * Compute semantic match score for an agent.
 *
 * Scoring model (deterministic v1 — see ADR-002):
 *  - Tier-1 agents and Tier-2 agents with curated overrides: keyword hits
 *    dominate (4.0 x weight each) so explicit domain triggers decide.
 *  - Tier-2 without overrides: slug/name tokens contribute at reduced value
 *    (1.5 generic / 2.5 specific) and are only counted when the prompt is
 *    technically aligned (tech-affinity), so persona agents ("service",
 *    "add-on", "pipeline" in a slug) can't hijack dev prompts.
 *  - Description overlap is length-normalized, so long descriptions don't
 *    win by volume.
 * Trade-off: magic numbers remain (v1); the golden-set eval is the guard.
 */
function scoreAgent(promptTokens, promptLower, agent) {
  let score = 0;
  const matchDetails = [];

  const division = agent.division || 'core';
  const isTechPrompt = TECH_IDENTIFIERS.some(t => hasWordPrefix(promptLower, t)) ||
    promptTokens.some(t => ['code', 'function', 'test', 'build', 'compile', 'refactor', 'bug', 'error', 'table', 'migration', 'deploy', 'cluster', 'cloud', 'pipeline'].includes(t));

  const overrideKeywords = AGENCY_KEYWORD_OVERRIDES[agent.slug];
  const isTier2Persona = !agent.keywords && !overrideKeywords;

  // 1. Slug tokens — deflated and gated for persona agents (ENG-1 fix:
  // previously a 3.5-per-token + 4.0 bonus let 'add'+'on' from
  // blender-add-on-engineer beat every devops agent on "docker compose").
  const slugTokens = agent.slug.split('-').map(stem);
  let matchedSlugCount = 0;
  for (const st of slugTokens) {
    if (promptTokens.includes(st) && st.length > 2) {
      matchedSlugCount++;
      let val = GENERIC_SLUG_TOKENS.has(st) ? 1.0 : 3.5;
      if (isTier2Persona) {
        if (!isTechPrompt) val = 0;
        else val = Math.min(val, 2.0);
      }
      if (val > 0) {
        score += val;
        matchDetails.push(`slug token: ${st}`);
      }
    }
  }
  if (matchedSlugCount >= 2 && !isTier2Persona) {
    score += 4.0;
    matchDetails.push('compound slug match');
  }
  if (promptLower.includes(agent.slug)) {
    score += 10.0;
    matchDetails.push(`exact slug: ${agent.slug}`);
  }

  // 2. Name tokens — same persona gating as slug
  if (agent.name) {
    const nameTokens = tokenize(agent.name);
    for (const nt of nameTokens) {
      if (promptTokens.includes(nt) && nt.length > 2) {
        let val = GENERIC_SLUG_TOKENS.has(nt) ? 0.5 : 2.0;
        if (isTier2Persona) {
          if (!isTechPrompt) val = 0;
          else val = Math.min(val, 1.0);
        }
        if (val > 0) {
          score += val;
          matchDetails.push(`name token: ${nt}`);
        }
      }
    }
  }

  // 3. Keywords: Tier-1 native keywords OR curated Tier-2 overrides
  const keywords = agent.keywords || overrideKeywords;
  if (keywords) {
    for (const kw of keywords) {
      if (hasWord(promptLower, kw) || (kw.length > 4 && hasWordPrefix(promptLower, kw))) {
        score += 4.0 * (agent.weight || 1.0);
        matchDetails.push(`keyword: "${kw}"`);
      }
    }
  }

  // 4. Technology identifier matches in description
  if (agent.description) {
    const descLower = agent.description.toLowerCase();
    for (const tech of TECH_IDENTIFIERS) {
      if (hasWordPrefix(promptLower, tech) && hasWordPrefix(descLower, tech)) {
        score += 5.0;
        matchDetails.push(`tech match: ${tech}`);
      }
    }

    // 5. Length-normalized description overlap
    const descTokens = tokenize(agent.description);
    const stop = new Set(['with', 'from', 'that', 'this', 'have', 'your', 'expert', 'specialist', 'based', 'every', 'other', 'systems', 'building', 'across']);
    let overlap = 0;
    const seen = new Set();
    for (const dt of descTokens) {
      if (dt.length > 3 && !stop.has(dt) && !seen.has(dt) && promptTokens.includes(dt)) {
        overlap++;
        seen.add(dt);
      }
    }
    if (overlap > 0) {
      const norm = overlap / Math.max(8, new Set(descTokens).size / 4);
      const contribution = Math.min(4.0, norm * 4.0);
      if (isTier2Persona && !isTechPrompt) {
        // persona agents with mere vocabulary overlap stay silent
      } else {
        score += contribution;
        if (contribution >= 1.0) matchDetails.push(`desc overlap: ${overlap} tokens`);
      }
    }
  }

  // 6. Division domain weighting
  if (isTechPrompt) {
    if (TECHNICAL_DIVISIONS.has(division)) {
      score *= 1.35;
    } else if (NON_TECHNICAL_DIVISIONS.has(division)) {
      score *= 0.4;
    }
  } else if (NON_TECHNICAL_DIVISIONS.has(division)) {
    score *= 1.1; // business prompts still favor business divisions
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
