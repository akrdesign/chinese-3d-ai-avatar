import { NextRequest } from "next/server";
import { synthesize } from "@/server/tts";
import { clientIp, rateLimit } from "@/server/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rl = rateLimit(`tts:${clientIp(req)}`, 60, 60_000);
  if (!rl.ok) {
    return new Response(JSON.stringify({ error: "rate limited" }), {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfterSec) },
    });
  }

  let body: { text?: unknown; voice?: unknown };
  try {
    body = (await req.json()) as { text?: unknown; voice?: unknown };
  } catch {
    return new Response(JSON.stringify({ error: "invalid body" }), { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text : "";
  const voice = typeof body.voice === "string" ? body.voice : "";
  if (!text.trim()) {
    return new Response(JSON.stringify({ error: "text required" }), { status: 400 });
  }

  try {
    const audio = await synthesize(text, voice);
    return new Response(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[tts] synthesis failed:", err);
    // Client falls back to browser speechSynthesis on non-200.
    return new Response(JSON.stringify({ error: "tts failed" }), { status: 502 });
  }
}
