import { SYSTEM_PROMPT } from "./persona";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_TURNS = 20; // keep context (and cost) bounded
const MAX_CHARS = 2000; // sanitize user text length

function sanitizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatMessage[] = [];
  for (const m of raw) {
    if (
      typeof m === "object" &&
      m !== null &&
      "role" in m &&
      "content" in m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0
    ) {
      out.push({ role: m.role, content: m.content.slice(0, MAX_CHARS) });
    }
  }
  return out.slice(-MAX_TURNS);
}

/** Fallback reply streamed when no LLM key is configured or upstream fails. */
function fallbackReply(reason: "nokey" | "error"): string {
  return reason === "nokey"
    ? "你好，我是小晨。目前还没有配置大模型 API 密钥，所以我暂时不能真正思考。请在服务器的 .env 文件里填入 LLM_API_KEY（推荐 DeepSeek，价格很低），重启后我就能和你正常聊天啦。"
    : "抱歉，我这边连接大模型服务时出了点问题，请稍后再试一次。";
}

function streamFromText(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chars = Array.from(text);
  let i = 0;
  return new ReadableStream({
    async pull(controller) {
      if (i >= chars.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(chars[i]!));
      i += 1;
      // Small delay so the UI still demos the "streaming" experience.
      await new Promise((r) => setTimeout(r, 18));
    },
  });
}

/**
 * Calls an OpenAI-compatible chat completions endpoint with stream=true and
 * returns a plain-text stream of content deltas (no SSE framing for the client).
 */
export async function streamChat(rawMessages: unknown): Promise<ReadableStream<Uint8Array>> {
  const messages = sanitizeMessages(rawMessages);
  if (messages.length === 0) {
    return streamFromText("你好，我是小晨，很高兴见到你。想聊点什么呢？");
  }

  const apiKey = process.env.LLM_API_KEY?.trim();
  const baseUrl = (process.env.LLM_BASE_URL ?? "https://api.deepseek.com").replace(/\/+$/, "");
  const model = process.env.LLM_MODEL ?? "deepseek-chat";

  if (!apiKey) return streamFromText(fallbackReply("nokey"));

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.7,
        max_tokens: 600,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });
  } catch {
    return streamFromText(fallbackReply("error"));
  }

  if (!upstream.ok || !upstream.body) {
    return streamFromText(fallbackReply("error"));
  }

  // Re-parse upstream SSE and forward only the delta text.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload) as {
            choices?: { delta?: { content?: string } }[];
          };
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        } catch {
          // ignore malformed keep-alive lines
        }
      }
    },
    cancel() {
      void reader.cancel();
    },
  });
}
