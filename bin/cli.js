#!/usr/bin/env node

import { runCli } from '../src/cli/index.js';

runCli().then((code) => {
  if (typeof code === 'number' && code !== 0) {
    process.exit(code);
  }
}).catch((err) => {
  console.error('[everything-opencode] Fatal error:', err);
  process.exit(1);
});
