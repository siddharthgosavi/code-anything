/**
 * Model Presets for OpenCode.
 * If preset is 'inherit' (default), agents do NOT hardcode a model and instead inherit
 * whatever model the user has active in their OpenCode session!
 */
export const MODEL_PRESETS = {
  inherit: {
    name: "Inherit Session Model",
    description: "Use whichever model is active in your OpenCode session (no overrides)",
    models: {}
  },
  anthropic: {
    name: "Anthropic Claude",
    description: "Claude 3.7 Sonnet for complex agents, Haiku for fast agents",
    models: {
      planner: "anthropic/claude-3-7-sonnet",
      architect: "anthropic/claude-3-7-sonnet",
      "code-reviewer": "anthropic/claude-3-7-sonnet",
      "security-reviewer": "anthropic/claude-3-7-sonnet",
      "tdd-guide": "anthropic/claude-3-7-sonnet",
      "build-error-resolver": "anthropic/claude-3-7-sonnet",
      "e2e-runner": "anthropic/claude-3-5-haiku",
      "refactor-cleaner": "anthropic/claude-3-5-haiku",
      "doc-updater": "anthropic/claude-3-5-haiku",
      "graph-analyst": "anthropic/claude-3-7-sonnet"
    }
  },
  openai: {
    name: "OpenAI",
    description: "GPT-4o and o3-mini for reasoning, GPT-4o-mini for docs/cleanup",
    models: {
      planner: "openai/gpt-4o",
      architect: "openai/o3-mini",
      "code-reviewer": "openai/gpt-4o",
      "security-reviewer": "openai/gpt-4o",
      "tdd-guide": "openai/gpt-4o",
      "build-error-resolver": "openai/gpt-4o",
      "e2e-runner": "openai/gpt-4o-mini",
      "refactor-cleaner": "openai/gpt-4o-mini",
      "doc-updater": "openai/gpt-4o-mini",
      "graph-analyst": "openai/gpt-4o"
    }
  },
  google: {
    name: "Google Gemini",
    description: "Gemini 2.5 Pro for planning/architecture/review, Flash for fast tasks",
    models: {
      planner: "google/gemini-2.5-pro",
      architect: "google/gemini-2.5-pro",
      "code-reviewer": "google/gemini-2.5-pro",
      "security-reviewer": "google/gemini-2.5-pro",
      "tdd-guide": "google/gemini-2.5-pro",
      "build-error-resolver": "google/gemini-2.5-flash",
      "e2e-runner": "google/gemini-2.5-flash",
      "refactor-cleaner": "google/gemini-2.5-flash",
      "doc-updater": "google/gemini-2.5-flash",
      "graph-analyst": "google/gemini-2.5-pro"
    }
  },
  explabs: {
    name: "Experiential Labs (Free Tier)",
    description: "Minimax M3 and Nemotron 550b for planning, Gemma 4 / Laguna for fast tasks",
    models: {
      planner: "explabs/minimax-m3-free",
      architect: "explabs/nemotron-3-ultra-550b-a55b-free",
      "code-reviewer": "explabs/minimax-m3-free",
      "security-reviewer": "explabs/nemotron-3-ultra-550b-a55b-free",
      "tdd-guide": "explabs/minimax-m3-free",
      "build-error-resolver": "explabs/gemma-4-26b-a4b-it-free",
      "e2e-runner": "explabs/laguna-s-2.1-free",
      "refactor-cleaner": "explabs/gemma-4-26b-a4b-it-free",
      "doc-updater": "explabs/ling-3.0-flash-fin-free",
      "graph-analyst": "explabs/minimax-m3-free"
    }
  },
  github: {
    name: "GitHub Copilot",
    description: "GitHub Copilot Claude / GPT models",
    models: {
      planner: "github-copilot/claude-3.7-sonnet",
      architect: "github-copilot/claude-3.7-sonnet",
      "code-reviewer": "github-copilot/claude-3.7-sonnet",
      "security-reviewer": "github-copilot/claude-3.7-sonnet",
      "tdd-guide": "github-copilot/claude-3.7-sonnet",
      "build-error-resolver": "github-copilot/claude-3.5-sonnet",
      "e2e-runner": "github-copilot/gpt-4o-mini",
      "refactor-cleaner": "github-copilot/gpt-4o-mini",
      "doc-updater": "github-copilot/gpt-4o-mini",
      "graph-analyst": "github-copilot/claude-3.7-sonnet"
    }
  }
};

/**
 * Resolve agent model based on preset and optional overrides.
 */
export function resolveAgentModel(agentName, presetName = 'inherit', overrides = {}) {
  if (overrides[agentName]?.model) {
    return overrides[agentName].model;
  }
  const preset = MODEL_PRESETS[presetName] || MODEL_PRESETS.inherit;
  return preset.models[agentName] || undefined;
}
