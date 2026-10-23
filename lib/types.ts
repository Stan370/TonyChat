// Shared type definitions for the application

import type { ModelProvider } from "@/lib/providers";

export type { ModelProvider } from "@/lib/providers";
export { MODEL_PROVIDERS, PROVIDER_LABELS } from "@/lib/providers";

/** An agent (bot) that can be listed in the marketplace and chatted with. */
export interface Agent {
  id: string;
  name: string;
  description: string;
  /** Emoji, or a same-origin image path such as "/user.jpg". */
  avatar: string;
  /** Background color behind an emoji avatar (any CSS color). */
  avatarBg?: string;
  category: string;
  tags: string[];
  author: string;
  systemPrompt: string;
  /** Preferred model id. Retired ids are resolved through LEGACY_MODEL_ALIASES. */
  model?: string;
  /** @deprecated kept for agents saved by older versions; derived from `model` now. */
  modelProvider?: ModelProvider;
  /** Suggested first messages shown on an empty chat. */
  starters?: string[];
  /** Shown in the featured row of the marketplace. */
  featured?: boolean;
  /** True for agents created in this browser. */
  custom?: boolean;
  createdAt?: string;
}

/** @deprecated use Agent. Kept so older imports keep compiling. */
export type Bot = Agent;

export type ChatRole = "user" | "assistant";

/** A text file attached to a user message (sent to the model inline). */
export interface Attachment {
  name: string;
  /** Code-fence language used when the file is inlined, e.g. "html" or "csv". */
  language?: string;
  content: string;
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
  attachments?: Attachment[];
  /** Model that produced an assistant message. */
  model?: string;
  error?: boolean;
  createdAt?: string;
}

/** A chat thread stored in this browser. Messages are stored separately. */
export interface Conversation {
  id: string;
  agentId: string;
  title: string;
  /** Model explicitly chosen for this conversation (otherwise the agent's). */
  model?: string;
  createdAt: string;
  updatedAt: string;
  /** Sent automatically when the conversation is first opened (home page, use cases). */
  pendingPrompt?: string;
  pendingAttachments?: Attachment[];
  /** Pre-filled composer content (e.g. "remix this game"). */
  draft?: { text: string; attachments?: Attachment[] };
}

export type UseCaseCategory = "games" | "websites" | "coding" | "writing" | "learning" | "business" | "life";

export interface UseCase {
  id: string;
  title: string;
  description: string;
  category: UseCaseCategory;
  featured?: boolean;
  emoji: string;
  /** Agent that runs the prompt. */
  agentId: string;
  prompt: string;
  /** Files sent along with the prompt (e.g. a sample CSV). */
  attachments?: Attachment[];
  /** A playable, hand-built example that ships with TonyChat. */
  demo?: {
    src: string;
    cover: string;
    /** Composer text used by "Remix" (the demo source is attached automatically). */
    remixPrompt: string;
  };
}

/** Body accepted by POST /api/chat and the legacy /api/chat/{provider} routes. */
export interface ChatRequestBody {
  model?: string;
  systemPrompt?: string;
  messages?: ChatMessage[];
  /** Legacy single-turn field used by older clients. */
  message?: string;
  conversationId?: string;
  agentId?: string;
}

// Model configuration types
export interface ModelProviderConfig {
  modelProvider: ModelProvider;
  /**
   * Unique model reference used across the app. First-party models use the plain
   * API id ("claude-opus-5-5"); other providers use "provider:apiId"
   * ("groq:openai/gpt-oss-120b").
   */
  model: string;
  /** Id sent to the provider API when it differs from `model`. */
  apiModel?: string;
  label: string;
  /** Free to use with a free account or free tier. */
  free?: boolean;
  /** Found at runtime (provider model list) rather than in the built-in catalog. */
  discovered?: boolean;
  description?: string;
  /** Upper bound sent as max_tokens / max_completion_tokens / maxOutputTokens. */
  maxTokens?: number;
  /** Only sent to models that still accept sampling parameters. */
  temperature?: number;
  topP?: number;
  /** Claude effort level (output_config.effort). */
  effort?: "low" | "medium" | "high" | "xhigh" | "max";
  /** Provider default for the model picker. */
  default?: boolean;
  preview?: boolean;
  /** @deprecated legacy fields from the old config; ignored. */
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
}

export interface ResolvedModel {
  config: ModelProviderConfig;
  /** Set when the requested id was retired and mapped to `config.model`. */
  migratedFrom?: string;
}

export type ProviderAvailability = Record<ModelProvider, boolean>;

export interface LLMParams {
  frequency_penalty?: number;
  max_tokens?: number;
  presence_penalty?: number;
  temperature?: number;
  top_p?: number;
}

export type LLMRoleType = "user" | "system" | "assistant" | "function";

export interface LLMMessage {
  content: string;
  role: LLMRoleType;
}

interface UserMessageContentPartText {
  text: string;
  type: "text";
}

interface UserMessageContentPartImage {
  image_url: {
    detail?: "auto" | "low" | "high";
    url: string;
  };
  type: "image_url";
}

export type UserMessageContentPart =
  | UserMessageContentPartText
  | UserMessageContentPartImage;

export interface OpenAIChatMessage {
  content: string | UserMessageContentPart[];
  function_call?: {
    arguments: string;
    name: string;
  };
  name?: string;
  role: LLMRoleType;
}

export interface ChatStreamPayload {
  frequency_penalty?: number;
  max_tokens?: number;
  messages: OpenAIChatMessage[];
  model: string;
  n?: number;
  plugins?: string[];
  presence_penalty?: number;
  provider?: string;
  stream?: boolean;
  temperature: number;
  tool_choice?: string;
  top_p?: number;
}

export interface ChatCompletionFunctions {
  description?: string;
  name: string;
  parameters?: {
    [key: string]: any;
  };
}
