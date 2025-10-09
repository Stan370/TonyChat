import { getServerConfig } from "@/config/server";
import { ServerRuntime } from "next";
import Anthropic from '@anthropic-ai/sdk';
import { getModelConfig } from "@/lib/modelConfig";

export const runtime: ServerRuntime = "edge";

export async function POST(request: Request) {
  try {
    const config = await getServerConfig();
    const { message, conversationId, agentId, systemPrompt, model } = await request.json();

    if (!config.anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    const anthropic = new Anthropic({
      apiKey: config.anthropicApiKey,
    });

    // Get model configuration
    const modelConfig = getModelConfig(model || "claude-3-sonnet-20240229");

    const response = await anthropic.messages.create({
      model: model || "claude-3-sonnet-20240229",
      max_tokens: modelConfig?.maxTokens || 4096,
      temperature: modelConfig?.temperature || 0.7,
      system: systemPrompt || undefined,
      messages: [{
        role: 'user',
        content: message
      }],
    });

    const aiResponse = response.content[0]?.type === 'text' ? response.content[0].text : "Sorry, I couldn't generate a response.";

    return new Response(JSON.stringify(aiResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    const errorMessage = error.message || "An unexpected error occurred";
    console.error('Error in Claude chat:', error);

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: 500,
    });
  }
}