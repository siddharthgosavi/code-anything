// Loads the plugin from this repo's working tree (local development).
// The npm package entry was removed from opencode.json to avoid double-loading
// hooks (docs: local + npm plugins with similar names both load).
// Published-package consumers instead use: "plugin": ["code-anything"].
export { CodeAnythingPlugin } from '../../src/plugin/index.js';
