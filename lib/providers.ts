// Model provider registry, shared by the browser and the server.
// Free-tier details were checked on 2026-10-23 and change often; the links point
// to each provider's own page for current limits.

export type ModelProvider =
  | "claude"
  | "openai"
  | "gemini"
  | "openrouter"
  | "groq"
  | "mistral"
  | "zhipu"
  | "siliconflow"
  | "ollama";

/** Display and fallback order. */
export const MODEL_PROVIDERS: ModelProvider[] = ["claude", "openai", "gemini", "openrouter", "groq", "mistral", "zhipu", "siliconflow", "ollama"];

export type ProviderApi = "anthropic" | "openai" | "gemini" | "openai-compatible";

export interface ProviderInfo {
  id: ModelProvider;
  label: string;
  api: ProviderApi;
  /** Dot color used in pickers. */
  color: string;
  /** Default OpenAI-compatible base URL. */
  baseURL?: string;
  /** Alternative endpoints a user key may belong to (allowlisted, never user-supplied URLs). */
  regions?: Record<string, { label: string; baseURL: string }>;
  /** Server environment variables that hold an API key (first non-empty wins). */
  envKeys: string[];
  /** Server environment variable that overrides the base URL. */
  envBaseUrl?: string;
  /** Pricing for people using their own account. */
  pricing: "free" | "free-tier" | "paid";
  /** One-line summary of what's free. */
  freeNote: string;
  /** Data-use caveat for free tiers. */
  privacyNote?: string;
  /** Where to create a key. */
  keyUrl?: string;
  /** Runs without a key (local servers). */
  keyless?: boolean;
  /** Visitors can paste their own key in Settings. */
  byok: boolean;
  /** How the model list is refreshed beyond the built-in catalog. */
  discovery?: "openrouter-free" | "models-endpoint";
  /** Default output cap; free tiers often limit tokens per minute. */
  maxTokens?: number;
}

export const PROVIDERS: Record<ModelProvider, ProviderInfo> = {
  claude: {
    id: "claude",
    label: "Anthropic",
    api: "anthropic",
    color: "#d97757",
    envKeys: ["ANTHROPIC_API_KEY"],
    pricing: "paid",
    freeNote: "Paid API. Highest quality for coding and long tasks.",
    keyUrl: "https://platform.claude.com/",
    byok: true,
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    api: "openai",
    color: "#10a37f",
    envKeys: ["OPENAI_API_KEY"],
    pricing: "paid",
    freeNote: "Paid API.",
    keyUrl: "https://platform.openai.com/api-keys",
    byok: true,
  },
  gemini: {
    id: "gemini",
    label: "Google",
    api: "gemini",
    color: "#4285f4",
    envKeys: ["GEMINI_API_KEY", "GOOGLE_GEMINI_API_KEY", "GOOGLE_API_KEY"],
    envBaseUrl: "GOOGLE_GEMINI_BASE_URL",
    pricing: "free-tier",
    freeNote: "Free tier with a Google AI Studio key: Gemini Flash and Flash-Lite models, rate-limited. Pro and Argon need billing.",
    privacyNote: "On the free tier Google may use prompts to improve its products.",
    keyUrl: "https://aistudio.google.com/apikey",
    byok: true,
  },
  openrouter: {
    id: "openrouter",
    label: "OpenRouter",
    api: "openai-compatible",
    color: "#6366f1",
    baseURL: "https://openrouter.ai/api/v1",
    envKeys: ["OPENROUTER_API_KEY"],
    envBaseUrl: "OPENROUTER_BASE_URL",
    pricing: "free",
    freeNote: "About 20 free models (the list changes often): 50 requests a day, or 1,000 a day after a one-time $10 top-up. No card needed to start.",
    privacyNote: "Some free model hosts log prompts for training.",
    keyUrl: "https://openrouter.ai/settings/keys",
    byok: true,
    discovery: "openrouter-free",
    maxTokens: 16000,
  },
  groq: {
    id: "groq",
    label: "Groq",
    api: "openai-compatible",
    color: "#f55036",
    baseURL: "https://api.groq.com/openai/v1",
    envKeys: ["GROQ_API_KEY"],
    envBaseUrl: "GROQ_BASE_URL",
    pricing: "free-tier",
    freeNote: "Free tier, no card: very fast open models (GPT-OSS, Qwen) at about 30 requests a minute and 1,000 a day.",
    keyUrl: "https://console.groq.com/keys",
    byok: true,
    discovery: "models-endpoint",
    // Free-tier tokens-per-minute limits count max_tokens, so keep this modest.
    maxTokens: 6000,
  },
  mistral: {
    id: "mistral",
    label: "Mistral",
    api: "openai-compatible",
    color: "#fa520f",
    baseURL: "https://api.mistral.ai/v1",
    envKeys: ["MISTRAL_API_KEY"],
    envBaseUrl: "MISTRAL_BASE_URL",
    pricing: "free-tier",
    freeNote: "Free Experiment plan, no card: all Mistral models with low rate limits.",
    privacyNote: "The free plan requires agreeing that prompts may be used for training.",
    keyUrl: "https://console.mistral.ai/api-keys",
    byok: true,
    discovery: "models-endpoint",
    maxTokens: 16000,
  },
  zhipu: {
    id: "zhipu",
    label: "Zhipu GLM",
    api: "openai-compatible",
    color: "#3859ff",
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    regions: {
      cn: { label: "China (bigmodel.cn)", baseURL: "https://open.bigmodel.cn/api/paas/v4" },
      global: { label: "International (z.ai)", baseURL: "https://api.z.ai/api/paas/v4" },
    },
    envKeys: ["ZHIPU_API_KEY", "ZAI_API_KEY"],
    envBaseUrl: "ZHIPU_BASE_URL",
    pricing: "free-tier",
    freeNote: "GLM-4.7-Flash and GLM-4-Flash are free to call (one request at a time). Good Chinese and English.",
    keyUrl: "https://bigmodel.cn/usercenter/proj-mgmt/apikeys",
    byok: true,
    maxTokens: 16000,
  },
  siliconflow: {
    id: "siliconflow",
    label: "SiliconFlow",
    api: "openai-compatible",
    color: "#7c3aed",
    baseURL: "https://api.siliconflow.cn/v1",
    regions: {
      cn: { label: "China (siliconflow.cn)", baseURL: "https://api.siliconflow.cn/v1" },
      global: { label: "International (siliconflow.com)", baseURL: "https://api.siliconflow.com/v1" },
    },
    envKeys: ["SILICONFLOW_API_KEY"],
    envBaseUrl: "SILICONFLOW_BASE_URL",
    pricing: "free-tier",
    freeNote: "Small open models (Qwen3-8B, GLM-4-9B, DeepSeek-R1 distill) are free after identity verification.",
    keyUrl: "https://cloud.siliconflow.cn/account/ak",
    byok: true,
    maxTokens: 8000,
  },
  ollama: {
    id: "ollama",
    label: "Ollama (local)",
    api: "openai-compatible",
    color: "#64748b",
    baseURL: "http://localhost:11434/v1",
    envKeys: [],
    envBaseUrl: "OLLAMA_BASE_URL",
    pricing: "free",
    freeNote: "Run open models on your own machine for free. For self-hosted TonyChat: set OLLAMA_BASE_URL on the server.",
    keyless: true,
    byok: false,
    discovery: "models-endpoint",
  },
};

export const PROVIDER_LABELS: Record<ModelProvider, string> = Object.fromEntries(
  MODEL_PROVIDERS.map(id => [id, PROVIDERS[id].label]),
) as Record<ModelProvider, string>;

export const PROVIDER_COLORS: Record<ModelProvider, string> = Object.fromEntries(
  MODEL_PROVIDERS.map(id => [id, PROVIDERS[id].color]),
) as Record<ModelProvider, string>;

export function isModelProvider(value: unknown): value is ModelProvider {
  return typeof value === "string" && (MODEL_PROVIDERS as string[]).includes(value);
}

/** Providers whose model ids are stored with a "provider:" prefix (first-party ids stay plain). */
export const PREFIXED_PROVIDERS: ModelProvider[] = ["openrouter", "groq", "mistral", "zhipu", "siliconflow", "ollama"];
