import { getServerConfig } from "@/config/server";
import { ServerRuntime } from "next";
import OpenAI from "openai";
import { getModelConfig } from "@/lib/modelConfig";

export const runtime: ServerRuntime = "edge";

export async function POST(request: Request) {
  try {
    const config = await getServerConfig();
    const { message, conversationId, agentId, systemPrompt, model } = await request.json();

    const openai = new OpenAI({
      apiKey: config.openaiApiKey,
      baseURL: config.openaiProxyUrl,
    });

    // Get model configuration
    const modelConfig = getModelConfig(model || "gpt-4o-mini");
    
    // Build messages array with system prompt if provided
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
    
    // Add system prompt if provided
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    
    // Add user message
    messages.push({ role: "user", content: message });

    const response = await openai.chat.completions.create(
      {
        model: model || "gpt-4o-mini",
        messages: messages,
        temperature: modelConfig?.temperature || 0.7,
        max_tokens: modelConfig?.maxTokens || 4096,
        top_p: modelConfig?.topP || 1,
        frequency_penalty: modelConfig?.frequencyPenalty || 0,
        presence_penalty: modelConfig?.presencePenalty || 0,
        stream: false, // Changed to false to get complete response
      }
    );

    const aiResponse = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return new Response(JSON.stringify(aiResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    const errorMessage = error.error?.message || "An unexpected error occurred";
    const errorCode = error.status || 500;
    console.error(error);

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode,
    });
  }
}
