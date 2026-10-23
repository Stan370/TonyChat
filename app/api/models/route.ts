import { MODEL_PROVIDERS, PROVIDERS, isModelProvider } from "@/lib/providers";
import { discoverModels, verifyKey } from "@/lib/server/discovery";
import { credentialsFor, getServerAvailability } from "@/lib/server/providerAuth";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/models
 * { providers: which providers work with the server's own keys,
 *   models: models discovered at runtime (OpenRouter's free list, plus
 *           Groq/Mistral/Ollama lists for server-configured providers) }
 */
export async function GET() {
  const providers = getServerAvailability();
  const lists = await Promise.all(
    MODEL_PROVIDERS.filter(p => PROVIDERS[p].discovery).map(provider => {
      const credentials = credentialsFor(provider);
      // OpenRouter's free list is public, so show it even before a key is added.
      if (!credentials && provider !== "openrouter") return [];
      return discoverModels(provider, credentials);
    }),
  );
  return Response.json(
    { providers, models: lists.flat() },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
  );
}

/**
 * POST /api/models  { provider }  with the visitor's key in X-Provider-Key
 * (and optional X-Provider-Region). Verifies the key with a free read-only call
 * and returns the models it unlocks. The key is not stored.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const provider = body?.provider;
  if (!isModelProvider(provider) || !PROVIDERS[provider].byok) {
    return Response.json({ ok: false, message: "Unknown provider." }, { status: 400 });
  }
  const credentials = credentialsFor(provider, request.headers);
  if (!credentials?.byok) {
    return Response.json({ ok: false, message: "Paste a key first." }, { status: 400 });
  }
  const result = await verifyKey(credentials);
  return Response.json(result, { status: result.ok ? 200 : 400, headers: { "Cache-Control": "no-store" } });
}
