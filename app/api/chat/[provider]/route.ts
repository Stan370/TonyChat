import { handleChat } from "@/lib/server/chatHandler";
import type { ModelProvider } from "@/lib/types";

export const runtime = "edge";

// Legacy per-provider endpoints. "cluade" and "google" are the folder names
// earlier versions shipped; they are kept so old clients keep working.
const PROVIDER_ALIASES: Record<string, ModelProvider> = {
  openai: "openai",
  claude: "claude",
  cluade: "claude",
  anthropic: "claude",
  gemini: "gemini",
  google: "gemini",
};

export async function POST(request: Request, { params }: { params: { provider: string } }) {
  const provider = PROVIDER_ALIASES[params.provider];
  if (!provider) {
    return new Response(JSON.stringify({ message: `Unknown provider "${params.provider}".` }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  return handleChat(request, provider);
}
