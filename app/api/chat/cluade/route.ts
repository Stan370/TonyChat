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

    const stream = await anthropic.completions.create({
      model: model || "claude-2",
      max_tokens_to_sample: 300,
      prompt: `Human: ${message}\n\nAssistant:`,
      stream: true,
    });

    for await (const completion of stream) {
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ text: completion.completion })}\n\n`)
      );
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