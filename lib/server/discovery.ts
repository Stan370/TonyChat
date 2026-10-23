// Server-only: discover current models from provider APIs, and verify visitor keys.
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { PROVIDERS, type ModelProvider } from "@/lib/providers";
import type { ModelProviderConfig } from "@/lib/types";
import { keyTag, serverBaseURL, type ProviderCredentials } from "./providerAuth";

const TTL_MS = 60 * 60 * 1000;
const TIMEOUT_MS = 8000;
const cache = new Map<string, { at: number; models: ModelProviderConfig[] }>();

/** Ids that aren't chat models (speech, embeddings, safety classifiers, OCR, images). */
const NON_CHAT = /embed|whisper|tts|speech|audio|transcri|guard|safeguard|moderation|safety|ocr|rerank|orpheus|playai|lyria|image|flux|diffusion|kolors|voxtral/i;

interface OpenRouterModel {
  id: string;
  name?: string;
  context_length?: number;
  architecture?: { modality?: string };
  top_provider?: { max_completion_tokens?: number | null };
}

async function getJSON(url: string, headers: Record<string, string> = {}): Promise<{ status: number; body: any }> {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

/** OpenRouter's public model list, filtered to free text-output chat models. */
async function openRouterFree(baseURL: string): Promise<ModelProviderConfig[]> {
  const { status, body } = await getJSON(`${baseURL}/models`);
  if (status !== 200 || !Array.isArray(body?.data)) return [];
  const cap = PROVIDERS.openrouter.maxTokens ?? 16000;
  return (body.data as OpenRouterModel[])
    .filter(m => m.id === "openrouter/free" || m.id.endsWith(":free"))
    .filter(m => (m.architecture?.modality ?? "->text").split("->")[1] === "text" && !NON_CHAT.test(m.id))
    .map(m => {
      const maxOut = m.top_provider?.max_completion_tokens;
      return {
        modelProvider: "openrouter" as const,
        model: `openrouter:${m.id}`,
        apiModel: m.id,
        label: m.id === "openrouter/free" ? "Free router (auto)" : (m.name ?? m.id).replace(/^[^:]+:\s*/, ""),
        description: m.context_length ? `${Math.round(m.context_length / 1000)}K context · ${m.id}` : m.id,
        free: true,
        discovered: true,
        default: m.id === "openrouter/free" || undefined,
        maxTokens: maxOut ? Math.min(cap, maxOut) : cap,
      };
    });
}

/** OpenAI-style GET /models (Groq, Mistral, Ollama). */
async function listedModels(credentials: ProviderCredentials): Promise<ModelProviderConfig[]> {
  const { provider, baseURL, apiKey } = credentials;
  if (!baseURL) return [];
  const { status, body } = await getJSON(`${baseURL}/models`, apiKey ? { Authorization: `Bearer ${apiKey}` } : {});
  if (status !== 200 || !Array.isArray(body?.data)) return [];
  const info = PROVIDERS[provider];
  return (body.data as { id: string; active?: boolean }[])
    .filter(m => typeof m.id === "string" && m.active !== false && !NON_CHAT.test(m.id))
    // Mistral lists every dated snapshot; the "-latest" aliases are the stable choices.
    .filter(m => provider !== "mistral" || m.id.endsWith("-latest"))
    .map(m => ({
      modelProvider: provider,
      model: `${provider}:${m.id}`,
      apiModel: m.id,
      label: m.id,
      description: provider === "ollama" ? "Runs on your Ollama server" : undefined,
      free: info.pricing !== "paid",
      discovered: true,
      maxTokens: info.maxTokens,
    }));
}

/** Current models for a provider beyond the built-in catalog (cached for an hour). */
export async function discoverModels(provider: ModelProvider, credentials?: ProviderCredentials): Promise<ModelProviderConfig[]> {
  const info = PROVIDERS[provider];
  if (!info.discovery) return [];
  const baseURL = credentials?.baseURL ?? serverBaseURL(provider) ?? "";
  // OpenRouter's list is public, so it doesn't depend on whose key is used.
  const cacheKey = info.discovery === "openrouter-free" ? `openrouter|${baseURL}` : credentials ? `${provider}|${keyTag(credentials)}|${baseURL}` : "";
  if (!cacheKey) return [];
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.models;
  try {
    const models = info.discovery === "openrouter-free" ? await openRouterFree(baseURL) : await listedModels(credentials!);
    cache.set(cacheKey, { at: Date.now(), models });
    return models;
  } catch (error) {
    console.warn(`[discovery] ${provider}: ${error instanceof Error ? error.message : error}`);
    return hit?.models ?? [];
  }
}

export interface KeyCheck {
  ok: boolean;
  message: string;
  models?: ModelProviderConfig[];
}

/** Check a visitor's key with a free, read-only call, and list the models it unlocks. */
export async function verifyKey(credentials: ProviderCredentials): Promise<KeyCheck> {
  const { provider, apiKey, baseURL } = credentials;
  const label = PROVIDERS[provider].label;
  const rejected: KeyCheck = { ok: false, message: `${label} rejected this key. Check that it was copied completely.` };
  try {
    switch (PROVIDERS[provider].api) {
      case "anthropic":
        await new Anthropic({ apiKey }).models.list({ limit: 1 });
        return { ok: true, message: `${label} key works.` };
      case "openai":
        await new OpenAI({ apiKey, baseURL }).models.list();
        return { ok: true, message: `${label} key works.` };
      case "gemini": {
        const base = baseURL ?? "https://generativelanguage.googleapis.com";
        const { status } = await getJSON(`${base}/v1beta/models?pageSize=1`, { "x-goog-api-key": apiKey ?? "" });
        return status === 200 ? { ok: true, message: "Google AI Studio key works." } : rejected;
      }
      default: {
        if (provider === "openrouter") {
          const { status } = await getJSON(`${baseURL}/key`, { Authorization: `Bearer ${apiKey}` });
          if (status !== 200) return rejected;
          return { ok: true, message: "OpenRouter key works.", models: await discoverModels("openrouter", credentials) };
        }
        const { status } = await getJSON(`${baseURL}/models`, { Authorization: `Bearer ${apiKey}` });
        if (status === 401 || status === 403) return rejected;
        if (status !== 200) return { ok: true, message: `Saved. ${label} didn't confirm the key (HTTP ${status}); it will be checked on your first message.` };
        const models = await discoverModels(provider, credentials);
        return { ok: true, message: `${label} key works.`, models };
      }
    }
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 401 || status === 403) return rejected;
    return { ok: false, message: `Couldn't reach ${label}: ${error instanceof Error ? error.message : "network error"}` };
  }
}
