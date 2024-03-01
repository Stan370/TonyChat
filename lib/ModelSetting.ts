/**
 * LLM 模型
 */
export enum LanguageModel {
  /**
   * GPT 3.5 Turbo
   */
  GPT3_5 = "gpt-3.5-turbo",
  GPT3_5_1106 = "gpt-3.5-turbo-1106",
  GPT3_5_16K = "gpt-3.5-turbo-16k",
  /**
   * GPT 4
   */
  GPT4 = "gpt-4",
  GPT4_32K = "gpt-4-32k",
  GPT4_PREVIEW = "gpt-4-0125-preview",
  GPT4_VISION_PREVIEW = "gpt-4-vision-preview",
}

export interface ChatModelCard {
  description?: string;
  displayName?: string;
  /**
   * whether model supports file upload
   */
  files?: boolean;
  /**
   * whether model supports function call
   */
  functionCall?: boolean;
  hidden?: boolean;
  id: string;
  /**
   * whether model is custom
   */
  isCustom?: boolean;
  /**
   * whether model is legacy (deprecated but not removed yet)
   */
  legacy?: boolean;
  tokens?: number;
  /**
   *  whether model supports vision
   */
  vision?: boolean;
}

export interface ModelProviderCard {
  chatModels: ChatModelCard[];
  enabled?: boolean;
  id: string;
}

// 语言模型的设置参数
export interface LLMParams {
  /**
   * 控制生成文本中的惩罚系数，用于减少重复性
   * @default 0
   */
  frequency_penalty?: number;
  /**
   * 生成文本的最大长度
   */
  max_tokens?: number;
  /**
   * 控制生成文本中的惩罚系数，用于减少主题的变化
   * @default 0
   */
  presence_penalty?: number;
  /**
   * 生成文本的随机度量，用于控制文本的创造性和多样性
   * @default 0.6
   */
  temperature?: number;
  /**
   * 控制生成文本中最高概率的单个 token
   * @default 1
   */
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
  tools?: ChatCompletionTool[];
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