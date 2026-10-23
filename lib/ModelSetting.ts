// Re-export types from the unified types file
export type {
  ModelProvider,
  ModelProviderConfig,
  LLMParams,
  LLMRoleType,
  LLMMessage,
  UserMessageContentPart,
  OpenAIChatMessage,
  ChatStreamPayload,
  ChatCompletionFunctions
} from "@/lib/types";

// Re-export model configurations
export {
  openaiConfig,
  geminiConfig,
  claudeConfig,
  allModelConfigs,
  LEGACY_MODEL_ALIASES,
  getModelsByProvider,
  getDefaultModel,
  getModelConfig,
  resolveModel,
  pickAvailableModel,
  inferProvider
} from "@/lib/modelConfig";
