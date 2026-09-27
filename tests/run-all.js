import { testConfigMerge } from './config-merge.test.js';
import { testPluginHooks } from './plugin-hooks.test.js';
import { testGraphifyIntegration } from './graphify-integration.test.js';
import { testPackageManager } from './package-manager.test.js';
import { testSessionSafety } from './safety-session.test.js';
import { testAgency } from './agency.test.js';
import { testRouter } from './router.test.js';
import { testRoutingEval } from './routing-eval.test.js';
import { testCatalogParity } from './catalog-parity.test.js';
import { testCli } from './cli.test.js';
import { colors, log } from '../src/lib/utils.js';

async function runAllTests() {
  log.header('code-anything Test Suite');

  const tests = [
    { name: 'Session Safety & Protection', fn: testSessionSafety },
    { name: 'Config Parsing & Non-Destructive Merge', fn: testConfigMerge },
    { name: 'Plugin Lifecycle Hooks & Guards', fn: testPluginHooks },
    { name: 'Graphify Code Intelligence Integration', fn: testGraphifyIntegration },
    { name: 'Package Manager Detection', fn: testPackageManager },
    { name: 'Agency Agents Catalog & Installation', fn: testAgency },
    { name: 'Autonomous Agent Selection & Routing', fn: testRouter },
    { name: 'Routing Golden-Set Eval (ENG-2)', fn: testRoutingEval },
    { name: 'Catalog Parity (ARCH-1)', fn: testCatalogParity },
    { name: 'CLI Routing & Commands', fn: testCli }
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    console.log(`\n${colors.bold}▶ Running: ${t.name}${colors.reset}`);
    try {
      await t.fn();
      console.log(`${colors.green}✔ PASSED: ${t.name}${colors.reset}`);
      passed++;
    } catch (err) {
      console.error(`${colors.red}✖ FAILED: ${t.name}${colors.reset}`);
      console.error(err);
      failed++;
    }
  }

  log.header('Test Results');
  console.log(`Total:  ${tests.length}`);
  console.log(`Passed: ${colors.green}${passed}${colors.reset}`);
  console.log(`Failed: ${failed > 0 ? colors.red + failed : colors.green + '0'}${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log(`${colors.bold}${colors.green}All tests passed successfully!${colors.reset}\n`);
  }
}

runAllTests().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
