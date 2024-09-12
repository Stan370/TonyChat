import { getServerConfig } from "@/config/server";
import { ServerRuntime } from "next";
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const runtime: ServerRuntime = "edge";

export async function POST(request: Request) {
  try {
    const config = await getServerConfig();
    const { message, model } = await request.json();

    const openai = new OpenAI({
      apiKey: config.openaiApiKey,
      baseURL: config.openaiBaseUrl || config.openaiProxyUrl,
    });

    const response = await openai.chat.completions.create(
      {
        model: model || "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
        stream: true,
      }
    );

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    const errorMessage = error.error?.message || "An unexpected error occurred";
    const errorCode = error.status || 500;
    console.error(error);

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode,
    });
  }
}
