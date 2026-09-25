import assert from 'assert';
import { routePrompt, CORE_AGENT_PATTERNS } from '../src/lib/router.js';

export async function testRouter() {
  console.log('Testing Agent Router Intelligence...');

  // 1. Core meta-agents count and integrity
  assert.strictEqual(CORE_AGENT_PATTERNS.length, 10, 'Should have 10 core Tier-1 meta-agents');

  // 2. Test: Planning intent
  const planResult = routePrompt('I need a phased step-by-step roadmap to migrate our REST API to GraphQL');
  assert.ok(planResult.success, 'Routing should succeed');
  assert.ok(['planner', 'architect', 'graphql-architect'].includes(planResult.primaryAgent.slug), 'Should route to planner, architect, or graphql-architect');
  assert.ok(planResult.workflow.length >= 2, 'Should provide a multi-agent workflow');
  console.log('  ✓ Planning & GraphQL intent correctly routed:', planResult.primaryAgent.slug);

  // 3. Test: Database optimization intent
  const dbResult = routePrompt('Optimize our slow PostgreSQL query and suggest indexes for user_orders table');
  assert.ok(dbResult.success);
  assert.ok(['database-optimizer', 'database-reliability-engineer'].includes(dbResult.primaryAgent.slug), 'Should route to database optimizer');
  console.log('  ✓ Database optimization intent correctly routed:', dbResult.primaryAgent.slug);

  // 4. Test: Security audit intent
  const secResult = routePrompt('Audit our authentication middleware for JWT vulnerability and OWASP injection risks');
  assert.ok(secResult.success);
  assert.ok(['security-reviewer', 'application-security-engineer', 'security-architect'].includes(secResult.primaryAgent.slug), 'Should route to security reviewer');
  console.log('  ✓ Security audit intent correctly routed:', secResult.primaryAgent.slug);

  // 5. Test: Compiler / Build error intent
  const buildResult = routePrompt('cargo build failed with unresolved import and type mismatch in module');
  assert.ok(buildResult.success);
  assert.strictEqual(buildResult.primaryAgent.slug, 'build-error-resolver');
  console.log('  ✓ Build error intent correctly routed:', buildResult.primaryAgent.slug);

  // 6. Test: TDD implementation
  const tddResult = routePrompt('Implement user login validation function using red green refactor unit tests');
  assert.ok(tddResult.success);
  assert.strictEqual(tddResult.primaryAgent.slug, 'tdd-guide');
  console.log('  ✓ TDD implementation intent correctly routed:', tddResult.primaryAgent.slug);

  // 7. Test: E2E Playwright testing
  const e2eResult = routePrompt('Write Playwright browser tests for our checkout user journey flow');
  assert.ok(e2eResult.success);
  assert.ok(['e2e-runner', 'test-automation-engineer'].includes(e2eResult.primaryAgent.slug));
  console.log('  ✓ E2E testing intent correctly routed:', e2eResult.primaryAgent.slug);

  // 8. Test: DevOps & Cloud Infrastructure specialist
  const devopsResult = routePrompt('Set up CI/CD pipeline automation and deploy our backend microservice to cloud infrastructure');
  assert.ok(devopsResult.success);
  assert.ok(devopsResult.candidates.some(c => c.slug.includes('devops') || c.division === 'engineering' || c.division === 'security'));
  console.log('  ✓ DevOps & Cloud Infrastructure intent correctly matched:', devopsResult.primaryAgent.slug);

  // 9. Test: Empty prompt fallback
  const emptyResult = routePrompt('');
  assert.strictEqual(emptyResult.primaryAgent.slug, 'planner');
  console.log('  ✓ Empty prompt fallback verified');
}
