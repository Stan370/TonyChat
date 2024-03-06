import { getServerConfig } from "@/config/server";
import { ServerRuntime } from "next";
import OpenAI from "openai";

export const runtime: ServerRuntime = "edge";

export async function POST(request: Request) {
  try {
    const config = await getServerConfig();

    const openai = new OpenAI({
      apiKey: config.openaiApiKey || "",
      baseURL: config.openaiBaseUrl || config.openaiProxyUrl,
    });
    console.log(openai.baseURL);

    const response = await openai.chat.completions.create(
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Say this is a test" }],
        stream: true,
      },
      { headers: {     Authorization: `Bearer ${openai.apiKey}`,
        Accept: "*/*" } }
    );

    for await (const chunk of response) {
      console.log(chunk.choices[0].delta);
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
    return;
  } catch (error: any) {
    const errorMessage = error.error?.message || "An unexpected error occurred";
    const errorCode = error.status || 500;
    console.log(error);

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode,
    });
  }
}
