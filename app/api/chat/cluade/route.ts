import { getServerConfig } from "@/config/server";
import { ServerRuntime } from "next";
import Anthropic from '@anthropic-ai/sdk';

export const runtime: ServerRuntime = "edge";

export async function POST(request: Request) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  try {
    const config = await getServerConfig();
    const { message, model } = await request.json();

    if (!config.anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    const anthropic = new Anthropic({
      apiKey: config.anthropicApiKey,
    });

    const response = await anthropic.messages.create({
      model: model || "claude-3-sonnet-20240229",
      max_tokens: 4096,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: message
      }],
      stream: true
    });

    for await (const chunk of response) {
      if (chunk.type === 'content_block_delta') {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ text: chunk.delta })}\n\n`)
        );
      }
    }
  } catch (error: any) {
    console.error('Error in Claude chat:', error);
    await writer.write(
      encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`)
    );
  } finally {
    await writer.close();
  }

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}