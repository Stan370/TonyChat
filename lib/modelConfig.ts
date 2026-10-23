import { MODEL_PROVIDERS, PREFIXED_PROVIDERS, PROVIDERS, isModelProvider } from "@/lib/providers";
import type { ModelProvider, ModelProviderConfig, ProviderAvailability, ResolvedModel } from "@/lib/types";

/*
 * Model catalog. Last reviewed 2026-10-22 against the provider model pages:
 *   - Anthropic: https://platform.claude.com/docs/en/about-claude/models
 *   - OpenAI:    https://developers.openai.com/api/docs/models/all
 *   - Google:    https://ai.google.dev/gemini-api/docs/models
 *
 * Only ids listed here can be requested. Anything else (including retired ids
 * saved by older versions of TonyChat) is mapped to a current model by
 * resolveModel(), so old agents and old clients keep working.
 *
 * Models from other providers (OpenRouter, Groq, Mistral, Zhipu, SiliconFlow,
 * Ollama) use "provider:apiId" references. Their free model lists change often,
 * so the server also discovers models at runtime (lib/server/discovery.ts).
 *
 * Sampling parameters: current Claude, GPT-5.x and Gemini 3+ models either
 * reject non-default temperature/top_p or recommend leaving them alone, so the
 * configs below do not set them. Add `temperature` only for a model that
 * accepts it.
 */

export const claudeConfig: ModelProviderConfig[] = [
  {
    modelProvider: "claude",
    model: "claude-opus-5-5",
    label: "Claude Opus 5.5",
    description: "Anthropic's default model for complex reasoning, coding and agentic work.",
    maxTokens: 64000,
    effort: "medium",
    default: true,
  },
  {
    modelProvider: "claude",
    model: "claude-fable-5-1",
    label: "Claude Fable 5.1",
    description: "Anthropic's most capable model for the hardest, long-horizon tasks. Highest cost.",
    maxTokens: 64000,
    effort: "medium",
  },
  {
    modelProvider: "claude",
    model: "claude-sonnet-5-5",
    label: "Claude Sonnet 5.5",
    description: "Fast and capable for everyday chat, writing and coding.",
    maxTokens: 64000,
    effort: "low",
  },
  {
    modelProvider: "claude",
    model: "claude-haiku-5-5",
    label: "Claude Haiku 5.5",
    description: "Fastest and cheapest Claude model for lightweight tasks.",
    maxTokens: 64000,
    effort: "low",
  },
];

export const openaiConfig: ModelProviderConfig[] = [
  {
    modelProvider: "openai",
    model: "gpt-5.6-terra",
    label: "GPT-5.6 Terra",
    description: "OpenAI's balanced mid-size model.",
    maxTokens: 32000,
    default: true,
  },
  {
    modelProvider: "openai",
    model: "gpt-5.6-sol",
    label: "GPT-5.6 Sol",
    description: "OpenAI's flagship GPT-5.6 model.",
    maxTokens: 32000,
  },
  {
    modelProvider: "openai",
    model: "gpt-5.6-luna",
    label: "GPT-5.6 Luna",
    description: "OpenAI's small, low-latency model.",
    maxTokens: 32000,
  },
  {
    modelProvider: "openai",
    model: "gpt-5.5",
    label: "GPT-5.5",
    description: "Previous-generation OpenAI model.",
    maxTokens: 32000,
  },
];

export const geminiConfig: ModelProviderConfig[] = [
  {
    modelProvider: "gemini",
    model: "gemini-3.8-flash",
    label: "Gemini 3.8 Flash",
    description: "Google's most capable Flash model. Included in the free tier.",
    maxTokens: 32768,
    free: true,
    default: true,
  },
  {
    modelProvider: "gemini",
    model: "gemini-3.5-flash-lite",
    label: "Gemini 3.5 Flash-Lite",
    description: "Highest-throughput, lowest-cost Gemini model. Included in the free tier.",
    maxTokens: 32768,
    free: true,
  },
  {
    modelProvider: "gemini",
    model: "gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash-Lite",
    description: "Cost-efficient model. Included in the free tier.",
    maxTokens: 32768,
    free: true,
  },
  {
    modelProvider: "gemini",
    model: "gemini-4-argon",
    label: "Gemini 4 Argon",
    description: "Google's flagship reasoning model. Paid tier only.",
    maxTokens: 32768,
  },
  {
    modelProvider: "gemini",
    model: "gemini-3.1-pro-preview",
    label: "Gemini 3.1 Pro (preview)",
    description: "Pro-tier preview model. Paid tier only; previews can be retired at short notice.",
    maxTokens: 32768,
    preview: true,
  },
];

const prefixed = (provider: ModelProvider, apiModel: string, rest: Omit<ModelProviderConfig, "modelProvider" | "model" | "apiModel">): ModelProviderConfig => ({
  modelProvider: provider,
  model: `${provider}:${apiModel}`,
  apiModel,
  maxTokens: PROVIDERS[provider].maxTokens,
  ...rest,
});

/** Free and free-tier providers. Runtime discovery adds more models to these lists. */
export const freeProviderConfig: ModelProviderConfig[] = [
  prefixed("openrouter", "openrouter/free", {
    label: "Free router (auto)",
    description: "OpenRouter picks an available free model for each request.",
    free: true,
    default: true,
  }),
  prefixed("groq", "openai/gpt-oss-120b", { label: "GPT-OSS 120B", description: "OpenAI's open-weight model on Groq's fast hardware.", free: true, default: true }),
  prefixed("groq", "openai/gpt-oss-20b", { label: "GPT-OSS 20B", description: "Smaller, faster open-weight model on Groq.", free: true }),
  prefixed("mistral", "mistral-small-latest", { label: "Mistral Small", description: "Fast general model. Free on the Experiment plan.", free: true, default: true }),
  prefixed("mistral", "mistral-medium-latest", { label: "Mistral Medium", description: "Stronger general model. Free on the Experiment plan.", free: true }),
  prefixed("mistral", "mistral-large-latest", { label: "Mistral Large", description: "Mistral's largest model. Free on the Experiment plan.", free: true }),
  prefixed("mistral", "codestral-latest", { label: "Codestral", description: "Mistral's coding model. Free on the Experiment plan.", free: true }),
  prefixed("zhipu", "glm-4.7-flash", { label: "GLM-4.7-Flash", description: "Free hybrid-reasoning model, 200K context.", free: true, default: true }),
  prefixed("zhipu", "glm-4-flash-250414", { label: "GLM-4-Flash", description: "Free fast model, 128K context.", free: true }),
  prefixed("siliconflow", "Qwen/Qwen3-8B", { label: "Qwen3 8B", description: "Free small Qwen model.", free: true, default: true }),
  prefixed("siliconflow", "THUDM/GLM-4-9B-0414", { label: "GLM-4 9B", description: "Free small GLM model.", free: true }),
  prefixed("siliconflow", "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B", { label: "DeepSeek-R1 Qwen3 8B", description: "Free small reasoning model.", free: true }),
  prefixed("siliconflow", "Qwen/Qwen2.5-Coder-7B-Instruct", { label: "Qwen2.5 Coder 7B", description: "Free small coding model.", free: true }),
];

// Combined model configurations
export const allModelConfigs: ModelProviderConfig[] = [
  ...claudeConfig,
  ...openaiConfig,
  ...geminiConfig,
  ...freeProviderConfig,
];

/**
 * Retired ids that earlier versions of TonyChat offered, mapped to their
 * closest current replacement. Ids not listed here fall back to the tier
 * heuristic in legacyReplacement().
 */
export const LEGACY_MODEL_ALIASES: Record<string, string> = {
  // Anthropic
  "claude-2.1": "claude-sonnet-5-5",
  "claude-2.0": "claude-sonnet-5-5",
  "claude-instant-1.2": "claude-haiku-5-5",
  "claude-3.0": "claude-sonnet-5-5",
  "claude-3-opus-20240229": "claude-opus-5-5",
  "claude-3-sonnet-20240229": "claude-sonnet-5-5",
  "claude-3-5-sonnet-20240620": "claude-sonnet-5-5",
  "claude-3-haiku-20240307": "claude-haiku-5-5",
  // OpenAI (replacements follow OpenAI's deprecation notices)
  "gpt-4": "gpt-5.6-sol",
  "gpt-4-32k": "gpt-5.6-sol",
  "gpt-4o": "gpt-5.6-sol",
  "gpt-4o-2024-05-13": "gpt-5.6-sol",
  "gpt-4o-2024-08-06": "gpt-5.6-sol",
  "chatgpt-4o-latest": "gpt-5.6-sol",
  "gpt-4o-mini": "gpt-5.6-terra",
  "gpt-4o-mini-2024-07-18": "gpt-5.6-terra",
  "gpt-3.5-turbo": "gpt-5.6-terra",
  // Google
  "gemini-pro": "gemini-3.8-flash",
  "gemini-pro-vision": "gemini-3.8-flash",
  "gemini-1.0-pro": "gemini-3.8-flash",
  "gemini-1.5-flash": "gemini-3.8-flash",
  "gemini-1.5-pro": "gemini-4-argon",
};

/** Infer the provider from a model id, for ids that are not in the catalog. */
export function inferProvider(model: string): ModelProvider | undefined {
  const id = model.toLowerCase();
  if (id.startsWith("claude")) return "claude";
  if (id.startsWith("gemini")) return "gemini";
  if (/^(gpt|chatgpt|o\d|text-davinci|davinci|babbage)/.test(id)) return "openai";
  return undefined;
}

/** Map an unknown or retired id to the closest current model by tier. */
function legacyReplacement(model: string, provider: ModelProvider): string {
  const id = model.toLowerCase();
  switch (provider) {
    case "claude":
      if (/haiku|instant/.test(id)) return "claude-haiku-5-5";
      if (/fable|mythos/.test(id)) return "claude-fable-5-1";
      if (/opus/.test(id)) return "claude-opus-5-5";
      return "claude-sonnet-5-5";
    case "openai":
      if (/nano/.test(id)) return "gpt-5.6-luna";
      if (/mini|3\.5/.test(id)) return "gpt-5.6-terra";
      return "gpt-5.6-sol";
    case "gemini":
      if (/lite/.test(id)) return "gemini-3.5-flash-lite";
      if (/pro|ultra/.test(id)) return "gemini-4-argon";
      return "gemini-3.8-flash";
    default:
      return allModelConfigs[0].model;
  }
}

// Helper functions

/** Unique reference for a provider's API model id. */
export function modelRef(provider: ModelProvider, apiModel: string): string {
  return PREFIXED_PROVIDERS.includes(provider) ? `${provider}:${apiModel}` : apiModel;
}

/** Split "provider:apiId" references; returns undefined for plain first-party ids. */
export function parseModelRef(ref: string): { provider: ModelProvider; apiModel: string } | undefined {
  const colon = ref.indexOf(":");
  if (colon <= 0) return undefined;
  const provider = ref.slice(0, colon);
  const apiModel = ref.slice(colon + 1);
  if (!isModelProvider(provider) || !PREFIXED_PROVIDERS.includes(provider) || !apiModel) return undefined;
  return { provider, apiModel };
}

/** The id to send to the provider's API. */
export function apiModelId(config: ModelProviderConfig): string {
  return config.apiModel ?? parseModelRef(config.model)?.apiModel ?? config.model;
}

/** A catalog-style entry for a model that is only known by reference (discovered or typed by a user). */
export function describeUnknownModel(ref: string): ModelProviderConfig | undefined {
  const parsed = parseModelRef(ref);
  if (!parsed) return undefined;
  const { provider, apiModel } = parsed;
  return {
    modelProvider: provider,
    model: ref,
    apiModel,
    label: apiModel.replace(/:free$/, ""),
    free: PROVIDERS[provider].pricing === "free" || apiModel.endsWith(":free"),
    discovered: true,
    maxTokens: PROVIDERS[provider].maxTokens,
  };
}

export function getModelsByProvider(provider: ModelProvider, extra: ModelProviderConfig[] = []): ModelProviderConfig[] {
  const seen = new Set<string>();
  return [...allModelConfigs, ...extra].filter(config => {
    if (config.modelProvider !== provider || seen.has(config.model)) return false;
    seen.add(config.model);
    return true;
  });
}

export function getDefaultModel(provider: ModelProvider, extra: ModelProviderConfig[] = []): ModelProviderConfig | undefined {
  const models = getModelsByProvider(provider, extra);
  return models.find(m => m.default) ?? models[0];
}

/** Built-in catalog lookup. Use resolveModel() for anything user- or storage-supplied. */
export function getModelConfig(model: string): ModelProviderConfig | undefined {
  return allModelConfigs.find(config => config.model === model);
}

/** Catalog or discovered entry, or a description built from a "provider:apiId" reference. */
export function findModel(ref: string, extra: ModelProviderConfig[] = []): ModelProviderConfig | undefined {
  return getModelConfig(ref) ?? extra.find(m => m.model === ref) ?? describeUnknownModel(ref);
}

/** Human-readable name for any model reference. */
export function modelLabel(ref: string, extra: ModelProviderConfig[] = []): string {
  return findModel(ref, extra)?.label ?? ref;
}

/**
 * Resolve any model reference (current, discovered, retired or unknown) to a
 * model entry. Returns undefined only when the provider can't be inferred.
 */
export function resolveModel(model: string | undefined, fallbackProvider?: ModelProvider, extra: ModelProviderConfig[] = []): ResolvedModel | undefined {
  if (model) {
    const known = findModel(model, extra);
    if (known) return { config: known };

    const alias = LEGACY_MODEL_ALIASES[model];
    if (alias) return { config: getModelConfig(alias)!, migratedFrom: model };

    const provider = inferProvider(model);
    if (provider) {
      return { config: getModelConfig(legacyReplacement(model, provider))!, migratedFrom: model };
    }
  }
  const fallback = fallbackProvider ? getDefaultModel(fallbackProvider, extra) : undefined;
  if (fallback) return { config: fallback, migratedFrom: model };
  return undefined;
}

/**
 * Pick the model to use: the first preferred reference whose provider is
 * available, otherwise the default model of the first available provider.
 */
export function pickAvailableModel(
  preferred: (string | undefined)[],
  availability: ProviderAvailability | null,
  extra: ModelProviderConfig[] = [],
): ModelProviderConfig {
  for (const ref of preferred) {
    const resolved = resolveModel(ref, undefined, extra);
    if (resolved && (!availability || availability[resolved.config.modelProvider])) {
      return resolved.config;
    }
  }
  if (availability) {
    for (const provider of MODEL_PROVIDERS) {
      const fallback = availability[provider] ? getDefaultModel(provider, extra) : undefined;
      if (fallback) return fallback;
    }
  }
  return allModelConfigs[0];
}
