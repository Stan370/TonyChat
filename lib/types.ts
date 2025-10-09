// Shared type definitions for the application

export interface Bot {
  id: string;
  name: string;
  description: string;
  category: string;
  avatar: string;
  rating: number;
  downloads: number;
  price: "free" | "premium";
  tags: string[];
  author: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  category: string;
  tags: string[];
  author: string;
  systemPrompt: string;
  modelProvider?: "openai" | "gemini" | "claude";
  model?: string;
}

export interface Conversation {
  id: string;
  agent_id: string;
  agent_name?: string;
  agent_description?: string;
  agent_category?: string;
  create_time?: string;
  update_time?: string;
}

export interface Message {
  id?: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  content_type: "text" | "image";
  create_time?: string;
}

// Model configuration types
export interface ModelProviderConfig {
  modelProvider: "openai" | "gemini" | "claude";
  model: string;
  description?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
}

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
