// Server-only: streaming adapters for each model provider.
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from "@google/generative-ai";
import { apiModelId } from "@/lib/modelConfig";
import { PROVIDERS, type ModelProvider } from "@/lib/providers";
import type { ChatMessage, ModelProviderConfig } from "@/lib/types";
import type { ProviderCredentials } from "./providerAuth";

export { getServerAvailability as getAvailability } from "./providerAuth";

export interface ProviderRequest {
  config: ModelProviderConfig;
  systemPrompt?: string;
  /** Alternating history that starts and ends with a user message. */
  messages: ChatMessage[];
  signal?: AbortSignal;
}

/**
 * Each adapter awaits the upstream connection before returning, so auth,
 * model-not-found and rate-limit errors surface as a thrown error (and become
 * a proper HTTP status) instead of a broken stream.
 */
type ProviderAdapter = (req: ProviderRequest, credentials: ProviderCredentials) => Promise<AsyncIterable<string>>;

const TRUNCATED_NOTE = "\n\n[Response truncated: the model reached its output limit.]";
const REFUSAL_NOTE = "\n\n[The model declined to continue this response.]";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tony-chat-nine.vercel.app";

export class ChatError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const streamClaude: ProviderAdapter = async (req, credentials) => {
  const client = new Anthropic({ apiKey: credentials.apiKey });
  const { config } = req;

  const stream = await client.beta.messages.create(
    {
      model: apiModelId(config),
      max_tokens: config.maxTokens ?? 64000,
      ...(req.systemPrompt ? { system: req.systemPrompt } : {}),
      messages: req.messages.map(m => ({ role: m.role, content: m.content })),
      ...(config.effort ? { output_config: { effort: config.effort } } : {}),
      ...(config.temperature !== undefined ? { temperature: config.temperature } : {}),
      // Server-side refusal fallback: if the model declines for policy reasons,
      // the API retries on its default fallback model inside the same call.
      // Models without fallback support simply run alone.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      stream: true,
    },
    { signal: req.signal },
  );

  return (async function* () {
    let stopReason: string | null | undefined;
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      } else if (event.type === "message_delta") {
        stopReason = event.delta.stop_reason;
      }
    }
    if (stopReason === "refusal") yield REFUSAL_NOTE;
    else if (stopReason === "max_tokens") yield TRUNCATED_NOTE;
  })();
};

function chatMessages(req: ProviderRequest): OpenAI.Chat.ChatCompletionMessageParam[] {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (req.systemPrompt) messages.push({ role: "system", content: req.systemPrompt });
  for (const m of req.messages) messages.push({ role: m.role, content: m.content });
  return messages;
}

/**
 * Turns an OpenAI-style chunk stream into text. Reasoning deltas
 * (`reasoning_content` / `reasoning`, sent by GLM, DeepSeek-R1, GPT-OSS and
 * others) are wrapped in <think>…</think> so the UI can show them collapsed.
 */
async function* chunkText(stream: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>) {
  let finishReason: string | null | undefined;
  let thinking = false;
  let answered = false;
  for await (const chunk of stream) {
    const choice = chunk.choices[0];
    const delta = (choice?.delta ?? {}) as { content?: string | null; reasoning_content?: string | null; reasoning?: string | null };
    const reasoning = delta.reasoning_content ?? delta.reasoning;
    if (reasoning && !answered) {
      if (!thinking) {
        thinking = true;
        yield "<think>";
      }
      yield reasoning;
    }
    if (delta.content) {
      if (thinking) {
        thinking = false;
        yield "</think>\n\n";
      }
      answered = true;
      yield delta.content;
    }
    if (choice?.finish_reason) finishReason = choice.finish_reason;
  }
  if (thinking) yield "</think>\n\n";
  if (finishReason === "length") yield TRUNCATED_NOTE;
  else if (finishReason === "content_filter") yield REFUSAL_NOTE;
}

const streamOpenAI: ProviderAdapter = async (req, credentials) => {
  const client = new OpenAI({
    apiKey: credentials.apiKey,
    baseURL: credentials.baseURL || undefined,
    organization: credentials.byok ? undefined : process.env.OPENAI_ORG_ID || undefined,
  });
  const { config } = req;

  const stream = await client.chat.completions.create(
    {
      model: apiModelId(config),
      messages: chatMessages(req),
      // GPT-5.x models reject max_tokens; max_completion_tokens covers reasoning + output.
      max_completion_tokens: config.maxTokens ?? 32000,
      ...(config.temperature !== undefined ? { temperature: config.temperature } : {}),
      ...(config.topP !== undefined ? { top_p: config.topP } : {}),
      stream: true,
    },
    { signal: req.signal },
  );
  return chunkText(stream);
};

/** OpenRouter, Groq, Mistral, Zhipu, SiliconFlow and Ollama all speak the OpenAI chat format. */
const streamCompatible: ProviderAdapter = async (req, credentials) => {
  const { config } = req;
  const client = new OpenAI({
    apiKey: credentials.apiKey || "none",
    baseURL: credentials.baseURL,
    maxRetries: 1,
    defaultHeaders: config.modelProvider === "openrouter" ? { "HTTP-Referer": SITE_URL, "X-Title": "TonyChat" } : undefined,
  });
  const create = (withLimit: boolean) =>
    client.chat.completions.create(
      {
        model: apiModelId(config),
        messages: chatMessages(req),
        ...(withLimit && config.maxTokens ? { max_tokens: config.maxTokens } : {}),
        stream: true,
      },
      { signal: req.signal },
    );

  try {
    return chunkText(await create(true));
  } catch (error) {
    // Free models often have smaller output limits than our default; retry once without a cap.
    const status = error instanceof OpenAI.APIError ? error.status ?? 0 : 0;
    if (config.maxTokens && [400, 413, 422].includes(status) && /token|context|too large|length/i.test((error as Error).message)) {
      return chunkText(await create(false));
    }
    throw error;
  }
};

const streamGemini: ProviderAdapter = async (req, credentials) => {
  const genAI = new GoogleGenerativeAI(credentials.apiKey ?? "");
  const { config } = req;
  const model = genAI.getGenerativeModel(
    {
      model: apiModelId(config),
      ...(req.systemPrompt ? { systemInstruction: req.systemPrompt } : {}),
    },
    credentials.baseURL ? { baseUrl: credentials.baseURL } : undefined,
  );

  const result = await model.generateContentStream(
    {
      contents: req.messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: config.maxTokens ?? 32768,
        // Gemini 3+ recommends the default temperature; only send overrides when configured.
        ...(config.temperature !== undefined ? { temperature: config.temperature } : {}),
        ...(config.topP !== undefined ? { topP: config.topP } : {}),
      },
    },
    { signal: req.signal },
  );

  return (async function* () {
    let finishReason: string | undefined;
    for await (const chunk of result.stream) {
      const candidate = chunk.candidates?.[0];
      if (candidate?.finishReason) finishReason = candidate.finishReason;
      const text = candidate?.content?.parts?.map(p => p.text ?? "").join("") ?? "";
      if (text) yield text;
    }
    if (finishReason === "MAX_TOKENS") yield TRUNCATED_NOTE;
    else if (finishReason && !["STOP", "FINISH_REASON_UNSPECIFIED"].includes(finishReason)) yield REFUSAL_NOTE;
  })();
};

const ADAPTERS: Record<(typeof PROVIDERS)[ModelProvider]["api"], ProviderAdapter> = {
  anthropic: streamClaude,
  openai: streamOpenAI,
  gemini: streamGemini,
  "openai-compatible": streamCompatible,
};

function errorStatus(error: unknown): number | undefined {
  if (error instanceof Anthropic.APIError) return error.status;
  if (error instanceof OpenAI.APIError) return error.status;
  if (error instanceof GoogleGenerativeAIFetchError) return error.status;
  return undefined;
}

function keyHint(provider: ModelProvider, byok: boolean): string {
  if (byok) return "Update your key in Settings.";
  const name = PROVIDERS[provider].envKeys[0];
  return name ? `Check ${name} in the server environment.` : "Check the server configuration.";
}

/** Translate an upstream SDK error into a user-facing ChatError. */
export function toChatError(error: unknown, provider: ModelProvider, model: string, byok = false): ChatError {
  if (error instanceof ChatError) return error;
  const status = errorStatus(error);
  const label = PROVIDERS[provider].label;
  const detail = (error instanceof Error ? error.message : String(error)).slice(0, 300);
  const freeTier = PROVIDERS[provider].pricing !== "paid";
  switch (status) {
    case 401:
    case 403:
      return new ChatError(`${label} rejected the API key. ${keyHint(provider, byok)}`, 502);
    case 402:
      return new ChatError(`${label} says the account is out of credit: ${detail}`, 402);
    case 404:
      return new ChatError(`Model "${model}" isn't available on ${label} right now. Pick another model.`, 502);
    case 413:
    case 429:
      return new ChatError(
        freeTier
          ? `${label}'s free-tier limit was reached. Wait a minute or pick another model. (${detail})`
          : `${label} is rate limiting requests. Try again shortly.`,
        429,
      );
    case 400:
      return new ChatError(`${label} rejected the request: ${detail}`, 400);
    default:
      return new ChatError(`The ${label} request failed: ${detail}`, 502);
  }
}

export async function openProviderStream(req: ProviderRequest, credentials: ProviderCredentials): Promise<AsyncIterable<string>> {
  const provider = req.config.modelProvider;
  try {
    return await ADAPTERS[PROVIDERS[provider].api](req, credentials);
  } catch (error) {
    throw toChatError(error, provider, req.config.model, credentials.byok);
  }
}
