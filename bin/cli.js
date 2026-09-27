#!/usr/bin/env node

import { runCli } from '../src/cli/index.js';

runCli().then((code) => {
  if (typeof code === 'number' && code !== 0) {
    process.exit(code);
  }
}).catch((err) => {
  console.error('[code-anything] Fatal error:', err);
  process.exit(1);
});
