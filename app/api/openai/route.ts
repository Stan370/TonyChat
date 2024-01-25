import { getServerConfig } from "@/config/server";
import { ServerRuntime } from "next";
import OpenAI from "openai";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";

export const runtime: ServerRuntime = "edge";

export async function POST(request: Request) {
  const json = await request.json();
  const { messages } = json as {
    messages: any[];
  };

  console.log("openai messages", messages, "\n\n\n");

  try {
    const config = await getServerConfig();

    const openai = new OpenAI({
      apiKey: config.openaiApiKey || "",
    });

    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages as ChatCompletionCreateParamsBase["messages"],
      stream: true,
    });

    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
  } catch (error: any) {
    const errorMessage = error.error?.message || "An unexpected error occurred";
    const errorCode = error.status || 500;
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode,
    });
  }
}
