// Server-only: shared request handling for /api/chat and the legacy /api/chat/{provider} routes.
import { apiModelId, getModelConfig, resolveModel } from "@/lib/modelConfig";
import { PROVIDERS } from "@/lib/providers";
import { stripThinking } from "@/lib/thinking";
import type { ChatMessage, ChatRequestBody, ModelProvider, ModelProviderConfig } from "@/lib/types";
import { ChatError, openProviderStream, toChatError } from "@/lib/server/chatProviders";
import { discoverModels } from "@/lib/server/discovery";
import { credentialsFor, type ProviderCredentials } from "@/lib/server/providerAuth";

// Basic abuse limits for a public deployment that pays for the API keys.
const MAX_MESSAGES = 60;
const MAX_TOTAL_CHARS = 200_000;
const MAX_SYSTEM_CHARS = 20_000;

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Fence long enough that backticks inside the file can't close it early. */
function fenceFor(content: string): string {
  const longestRun = (content.match(/`+/g) ?? []).reduce((max, run) => Math.max(max, run.length), 0);
  return "`".repeat(Math.max(3, longestRun + 1));
}

/** Inline attached files after the message text so every provider sees them. */
function contentWithAttachments(m: ChatMessage): string {
  const files = (Array.isArray(m.attachments) ? m.attachments : [])
    .filter(a => a && typeof a.content === "string")
    .map(a => {
      const fence = fenceFor(a.content);
      const name = typeof a.name === "string" ? a.name.slice(0, 200) : "attachment";
      const language = typeof a.language === "string" ? a.language.replace(/[^\w+-]/g, "").slice(0, 20) : "";
      return `Attached file: ${name}\n${fence}${language}\n${a.content}\n${fence}`;
    });
  const text = typeof m.content === "string" ? m.content : "";
  return [text.trim() ? text : "", ...files].filter(Boolean).join("\n\n");
}

/** Normalise the body into an alternating user/assistant history ending with a user turn. */
function normaliseMessages(body: ChatRequestBody): ChatMessage[] {
  const raw: ChatMessage[] = Array.isArray(body.messages)
    ? body.messages
    : typeof body.message === "string"
      ? [{ role: "user", content: body.message }]
      : [];

  const cleaned: ChatMessage[] = [];
  for (const m of raw) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || m.error) continue;
    // Earlier reasoning is shown to the user but not sent back to the model.
    const content = m.role === "assistant" ? stripThinking(typeof m.content === "string" ? m.content : "") : contentWithAttachments(m);
    if (!content.trim()) continue;
    const last = cleaned[cleaned.length - 1];
    // Merge consecutive same-role turns (e.g. a user retry after a failed reply).
    if (last && last.role === m.role) last.content += `\n\n${content}`;
    else cleaned.push({ role: m.role, content });
  }
  while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();
  return cleaned.slice(-MAX_MESSAGES);
}

/**
 * Requests paid for by the server's keys may only use built-in models, free
 * OpenRouter models or models the provider lists for that key. Visitors using
 * their own key may pick any model id.
 */
async function isModelAllowed(config: ModelProviderConfig, credentials: ProviderCredentials): Promise<boolean> {
  if (getModelConfig(config.model)) return true;
  const id = apiModelId(config);
  if (!/^[\w.\-/:@+]{1,160}$/.test(id)) return false;
  if (credentials.byok) return true;
  if (config.modelProvider === "openrouter") return id === "openrouter/free" || id.endsWith(":free");
  if (config.modelProvider === "ollama") return true;
  const discovered = await discoverModels(config.modelProvider, credentials);
  return discovered.some(m => m.model === config.model);
}

export async function handleChat(request: Request, providerHint?: ModelProvider): Promise<Response> {
  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be JSON.", 400);
  }

  const resolved = resolveModel(body.model, providerHint);
  if (!resolved) return jsonError(`Unknown model "${body.model}".`, 400);
  const { config, migratedFrom } = resolved;

  const messages = normaliseMessages(body);
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return jsonError("The conversation must end with a user message.", 400);
  }
  const totalChars = messages.reduce((n, m) => n + m.content.length, 0);
  if (totalChars > MAX_TOTAL_CHARS) return jsonError("The conversation is too long. Start a new chat.", 413);
  const systemPrompt = typeof body.systemPrompt === "string" ? body.systemPrompt.slice(0, MAX_SYSTEM_CHARS) : undefined;

  const provider = config.modelProvider;
  const credentials = credentialsFor(provider, request.headers);
  if (!credentials) {
    const info = PROVIDERS[provider];
    const fix = info.byok
      ? `Add your own ${info.pricing === "paid" ? "" : "free "}${info.label} key in Settings${info.envKeys[0] ? `, or set ${info.envKeys[0]} on the server` : ""}.`
      : `Set ${info.envBaseUrl} on the server.`;
    return jsonError(`${info.label} isn't set up yet. ${fix}`, 503);
  }
  if (!(await isModelAllowed(config, credentials))) {
    return jsonError(`Model "${config.model}" isn't available on this server. Pick another model, or use your own ${PROVIDERS[provider].label} key.`, 400);
  }

  let textStream: AsyncIterable<string>;
  try {
    textStream = await openProviderStream({ config, systemPrompt, messages, signal: request.signal }, credentials);
  } catch (error) {
    const chatError = toChatError(error, config.modelProvider, config.model, credentials.byok);
    console.error(`[chat] ${config.model}:`, error);
    return jsonError(chatError.message, chatError.status);
  }

  const headers: Record<string, string> = {
    "X-Model": config.model,
    "X-Model-Provider": config.modelProvider,
    "Cache-Control": "no-cache",
  };
  if (migratedFrom) headers["X-Model-Migrated-From"] = migratedFrom;

  // Legacy clients sent `message` and expected the full reply as a JSON string.
  const legacyClient = typeof body.message === "string" && !Array.isArray(body.messages);
  if (legacyClient) {
    try {
      let text = "";
      for await (const chunk of textStream) text += chunk;
      return new Response(JSON.stringify(text), {
        headers: { ...headers, "Content-Type": "application/json" },
      });
    } catch (error) {
      const chatError = toChatError(error, config.modelProvider, config.model, credentials.byok);
      return jsonError(chatError.message, chatError.status);
    }
  }

  const encoder = new TextEncoder();
  const iterator = textStream[Symbol.asyncIterator]();
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) controller.close();
        else controller.enqueue(encoder.encode(value));
      } catch (error) {
        const message = error instanceof ChatError ? error.message : toChatError(error, config.modelProvider, config.model, credentials.byok).message;
        console.error(`[chat] stream ${config.model}:`, error);
        controller.enqueue(encoder.encode(`\n\n[Error: ${message}]`));
        controller.close();
      }
    },
    async cancel() {
      await iterator.return?.();
    },
  });

  return new Response(stream, {
    headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" },
  });
}
