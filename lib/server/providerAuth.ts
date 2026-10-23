// Server-only: which API key and endpoint to use for a provider on this request.
import { MODEL_PROVIDERS, PROVIDERS, type ModelProvider } from "@/lib/providers";
import type { ProviderAvailability } from "@/lib/types";

/** Request headers a browser uses to send its own ("bring your own") key. */
export const KEY_HEADER = "x-provider-key";
export const REGION_HEADER = "x-provider-region";

export interface ProviderCredentials {
  provider: ModelProvider;
  apiKey?: string;
  baseURL?: string;
  /** True when the key came from the visitor rather than the server environment. */
  byok: boolean;
}

function env(name: string | undefined): string | undefined {
  if (!name) return undefined;
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export function serverKey(provider: ModelProvider): string | undefined {
  for (const name of PROVIDERS[provider].envKeys) {
    const value = env(name);
    if (value) return value;
  }
  return undefined;
}

/** Base URL from the server environment, falling back to the provider default. */
export function serverBaseURL(provider: ModelProvider): string | undefined {
  if (provider === "openai") return env("OPENAI_PROXY_URL") ?? env("OPENAI_BASE_URL");
  return env(PROVIDERS[provider].envBaseUrl) ?? PROVIDERS[provider].baseURL;
}

/** Keyless providers (Ollama) only count as configured when the operator set their URL. */
function keylessConfigured(provider: ModelProvider): boolean {
  return Boolean(PROVIDERS[provider].keyless && env(PROVIDERS[provider].envBaseUrl));
}

/** Providers usable with the server's own configuration (no visitor key). */
export function getServerAvailability(): ProviderAvailability {
  return Object.fromEntries(MODEL_PROVIDERS.map(p => [p, Boolean(serverKey(p)) || keylessConfigured(p)])) as ProviderAvailability;
}

function cleanKey(value: string | null): string | undefined {
  const key = value?.trim();
  // API keys are short printable tokens; anything else is rejected outright.
  if (!key || key.length > 512 || !/^[\x21-\x7e]+$/.test(key)) return undefined;
  return key;
}

/**
 * Credentials for a request: the visitor's own key when the browser sent one,
 * otherwise the server's key. Regions come from a fixed allowlist, never from a URL.
 */
export function credentialsFor(provider: ModelProvider, headers?: Headers): ProviderCredentials | undefined {
  const info = PROVIDERS[provider];
  const userKey = info.byok ? cleanKey(headers?.get(KEY_HEADER) ?? null) : undefined;
  if (userKey) {
    const region = headers?.get(REGION_HEADER) ?? "";
    const regionURL = info.regions?.[region]?.baseURL;
    return { provider, apiKey: userKey, baseURL: regionURL ?? serverBaseURL(provider), byok: true };
  }
  const key = serverKey(provider);
  if (key) return { provider, apiKey: key, baseURL: serverBaseURL(provider), byok: false };
  if (keylessConfigured(provider)) return { provider, apiKey: "local", baseURL: serverBaseURL(provider), byok: false };
  return undefined;
}

/** Short, non-reversible tag for cache keys (keys are never stored or logged). */
export function keyTag(credentials: ProviderCredentials): string {
  if (!credentials.byok) return "server";
  let hash = 2166136261;
  for (const char of credentials.apiKey ?? "") hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `user-${(hash >>> 0).toString(36)}`;
}
