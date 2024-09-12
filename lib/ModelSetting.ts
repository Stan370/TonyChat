export interface ModelProviderConfig {
  modelProvider: "openai" | "gemini" | "claude";
  model: string;
  //optional
  description?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;//It is a value that is added to the log-probability of a token each time it occurs in the generated text. A higher frequency_penalty value will result in the model being more conservative in its use of repeated tokens.
  presencePenalty?: number;//This parameter is used to encourage the model to include a diverse range of tokens in the generated text. It is a value that is subtracted from the log-probability of a token each time it is generated. A higher presence_penalty value will result in the model being more likely to generate tokens that have not yet been included in the generated text.
  stop?: string[];
  stream?: boolean;
}

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
]
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
]
  export const cluadeConfig: ModelProviderConfig[] = [
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

// 语言模型的设置参数
export interface LLMParams {
  /**
   * 控制生成文本中的惩罚系数，用于减少重复性
   * @default 0
   */
  frequency_penalty?: number;
  max_tokens?: number;
  presence_penalty?: number;
  /**
   * 生成文本的随机度量，用于控制文本的创造性和多样性
   * @default 0.6
   */
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
  /**
   * @title 内容
   * @description 消息内容
   */
  content: string | UserMessageContentPart[];

  function_call?: {
    arguments: string;
    name: string;
  };
  name?: string;
  /**
   * 角色
   * @description 消息发送者的角色
   */
  role: LLMRoleType;
}

/**
 * @title Chat Stream Payload
 */
export interface ChatStreamPayload {
  /**
   * @title 控制生成文本中的惩罚系数，用于减少重复性
   * @default 0
   */
  frequency_penalty?: number;
  /**
   * @title 生成文本的最大长度
   */
  max_tokens?: number;
  /**
   * @title 聊天信息列表
   */
  messages: OpenAIChatMessage[];
  /**
   * @title 模型名称
   */
  model: string;
  /**
   * @title 返回的文本数量
   */
  n?: number;
  /**
   * 开启的插件列表
   */
  plugins?: string[];
  /**
   * @title 控制生成文本中的惩罚系数，用于减少主题的变化
   * @default 0
   */
  presence_penalty?: number;
  /**
   * @default openai
   */
  provider?: string;
  /**
   * @title 是否开启流式请求
   * @default true
   */
  stream?: boolean;
  /**
   * @title 生成文本的随机度量，用于控制文本的创造性和多样性
   * @default 0.5
   */
  temperature: number;
  tool_choice?: string;
  /**
   * @title 控制生成文本中最高概率的单个令牌
   * @default 1
   */
  top_p?: number;
}

export interface ChatCompletionFunctions {
  /**
   * The description of what the function does.
   * @type {string}
   * @memberof ChatCompletionFunctions
   */
  description?: string;
  /**
   * The name of the function to be called. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64.
   * @type {string}
   * @memberof ChatCompletionFunctions
   */
  name: string;
  /**
   * The parameters the functions accepts, described as a JSON Schema object. See the [guide](/docs/guides/gpt/function-calling) for examples, and the [JSON Schema reference](https://json-schema.org/understanding-json-schema/) for documentation about the format.
   * @type {{ [key: string]: any }}
   * @memberof ChatCompletionFunctions
   */
  parameters?: {
    [key: string]: any;
  };
}
