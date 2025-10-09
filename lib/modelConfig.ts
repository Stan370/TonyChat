import { ModelProviderConfig } from "@/lib/types";

export const openaiConfig: ModelProviderConfig[] = [
  // OpenAI Models
  {
    modelProvider: "openai",
    model: "gpt-4",
    description: "Most capable GPT-4 model, better at following instructions",
    temperature: 0.7,
    maxTokens: 8000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0
  },
  {
    modelProvider: "openai",
    model: "gpt-4o-2024-05-13",
    description: "Current version that gpt-4o points to.",
    temperature: 0.7,
    maxTokens: 4096,
  },
  {
    modelProvider: "openai",
    model: "gpt-4o-2024-08-06",
    description: "Latest snapshot that supports Structured Outputs",
    temperature: 0.7,
    maxTokens: 16384,
  },
  {
    modelProvider: "openai",
    model: "chatgpt-4o-latest",
    description: "Dynamic model continuously updated to the current version of GPT-4o in ChatGPT. For research and evaluation.",
    temperature: 0.8,
    maxTokens: 16384,
    topP: 0.95,
  },
  {
    modelProvider: "openai",
    model: "gpt-4o-mini",
    description: "Affordable and intelligent small model for fast, lightweight tasks. Cheaper and more capable than GPT-3.5 Turbo.",
    temperature: 0.7,
    maxTokens: 16384,
  },
  {
    modelProvider: "openai",
    model: "gpt-4o-mini-2024-07-18",
    description: "Current version that gpt-4o-mini points to.",
    temperature: 0.7,
    maxTokens: 16384,
  },
  {
    modelProvider: "openai",
    model: "gpt-4-32k",
    description: "Same capabilities as standard GPT-4 with 4x the context length",
    maxTokens: 32000,
    temperature: 0.5
  },
  {
    modelProvider: "openai",
    model: "gpt-3.5-turbo",
    description: "Most capable GPT-3.5 model, optimized for chat at 1/10th the cost of text-davinci-003",
    temperature: 0.9,
    maxTokens: 4000,
    stream: true
  },
  {
    modelProvider: "openai",
    model: "gpt-4o",
    description: "Preview version of GPT-4 with improved capabilities",
    temperature: 0.8,
    maxTokens: 16384,
    topP: 0.9
  },
];

export const geminiConfig: ModelProviderConfig[] = [
  // Gemini Models
  {
    modelProvider: "gemini",
    model: "gemini-pro",
    description: "Gemini's largest model for text generation tasks",
    temperature: 0.8,
    maxTokens: 8192,
    topP: 0.95
  },
  {
    modelProvider: "gemini",
    model: "gemini-pro-vision",
    description: "Multimodal model capable of understanding text and images",
    temperature: 0.7,
    maxTokens: 4096
  },
  {
    modelProvider: "gemini",
    model: "gemini-1.5-flash",
    description: "Gemini 1.5 Flash: Ultra-fast model with 1,048,576,000 input token limit. Supports system instructions, JSON mode, JSON schema, adjustable safety settings, caching, fine-tuning, and function calling.",
    temperature: 0.7,
    maxTokens: 8192,
    topP: 1,
  },
  {
    modelProvider: "gemini",
    model: "gemini-1.5-pro",
    description: "Gemini 1.5 Pro: Advanced model with 1,048,576,000 input token limit. Supports system instructions, JSON mode, JSON schema, adjustable safety settings, caching, fine-tuning, and function calling.",
    temperature: 0.7,
    maxTokens: 8192,
    topP: 1,
  },
  {
    modelProvider: "gemini",
    model: "gemini-1.0-pro",
    description: "Gemini 1.0 Pro: Original pro model. Supports up to 3,600 images per prompt, 1 hour of video, and 9.5 hours of audio. Features system instructions, JSON mode, JSON schema, adjustable safety settings, caching, fine-tuning, and function calling.",
    temperature: 0.7,
    maxTokens: 8192,
    topP: 1,
  }
];

export const claudeConfig: ModelProviderConfig[] = [
  // Claude Models
  {
    modelProvider: "claude",
    model: "claude-2.1",
    description: "Latest version of Claude with improved capabilities",
    temperature: 0.7,
    maxTokens: 100000,
    topP: 0.9
  },
  {
    modelProvider: "claude",
    model: "claude-instant-1.2",
    description: "Faster and more cost-effective version of Claude",
    temperature: 0.8,
    maxTokens: 10000,
    stop: ["\n\nHuman:", "\n\nAssistant:"]
  },
  {
    modelProvider: "claude",
    model: "claude-3.0",
    description: "Fictional next-generation Claude model with advanced capabilities",
    temperature: 0.6,
    maxTokens: 200000,
    topP: 0.95,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1
  },
  {
    modelProvider: "claude",
    model: "claude-3-5-sonnet-20240620",
    description: "Most intelligent model for highly complex tasks.",
    temperature: 0.7,
    maxTokens: 8192,
    topP: 0.9,
    frequencyPenalty: 0.2,
    presencePenalty: 0.2,
    stream: true
  },
  {
    modelProvider: "claude",
    model: "claude-3-opus-20240229",
    description: "Powerful model for highly complex tasks with top-level intelligence.",
    temperature: 0.75,
    maxTokens: 4096,
    topP: 0.85,
    frequencyPenalty: 0.3,
    presencePenalty: 0.3,
    stream: true
  },
  {
    modelProvider: "claude",
    model: "claude-3-sonnet-20240229",
    description: "Strong utility, balanced for scaled deployments.",
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9,
    frequencyPenalty: 0.2,
    presencePenalty: 0.2,
    stream: true
  },
  {
    modelProvider: "claude",
    model: "claude-3-haiku-20240307",
    description: "Fastest and most compact model for near-instant responsiveness.",
    temperature: 0.6,
    maxTokens: 4096,
    topP: 0.95,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
    stream: false
  }
];

// Combined model configurations
export const allModelConfigs: ModelProviderConfig[] = [
  ...openaiConfig,
  ...geminiConfig,
  ...claudeConfig
];

// Helper functions
export function getModelsByProvider(provider: "openai" | "gemini" | "claude"): ModelProviderConfig[] {
  return allModelConfigs.filter(config => config.modelProvider === provider);
}

export function getModelConfig(model: string): ModelProviderConfig | undefined {
  return allModelConfigs.find(config => config.model === model);
}
