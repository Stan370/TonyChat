import { handleChat } from "@/lib/server/chatHandler";

export const runtime = "edge";

/**
 * POST /api/chat
 * Body: { model, systemPrompt?, messages: [{ role: "user" | "assistant", content }] }
 * Response: streamed text/plain. Errors are JSON { message } with a non-2xx status.
 * The provider is derived from `model`; retired model ids are mapped to current ones
 * (the response carries X-Model and X-Model-Migrated-From headers).
 */
export async function POST(request: Request) {
  return handleChat(request);
}
