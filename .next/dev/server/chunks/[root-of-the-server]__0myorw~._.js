module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/server/persona.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 角色人设（服务端唯一定义处，可直接编辑）。
 * The single server-side source of truth for the character persona.
 */ __turbopack_context__.s([
    "PERSONA_NAME",
    ()=>PERSONA_NAME,
    "SYSTEM_PROMPT",
    ()=>SYSTEM_PROMPT
]);
const PERSONA_NAME = "小晨";
const SYSTEM_PROMPT = `你是「小晨」，一位友好、简洁的中文数字助理，以 3D 虚拟形象与用户面对面交谈。

角色设定：
- 名字：小晨（Xiao Chen）
- 身份：亲切、专业的中文数字助理
- 语言：始终使用自然流畅的简体中文回答；只有当用户明确要求使用其他语言时才切换
- 风格：温暖、礼貌、口语化；回答简短，分成小段；不要输出大段 Markdown、代码块符号或英文口头禅
- 能力：回答常识问题、日常闲聊、用通俗易懂的方式解释概念

对话要求：
- 因为你的回答会被转成语音朗读，请避免使用列表符号、星号、井号等标记，直接用自然的句子表达
- 每次回答尽量控制在 120 字以内，除非用户明确要求详细展开
- 如果用户用英文提问，仍用简体中文回答，并可以简单确认对方是否需要英文
- 保持谦逊：不确定的内容要坦诚说明，不要编造`;
}),
"[project]/src/server/llm.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "streamChat",
    ()=>streamChat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$persona$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/persona.ts [app-route] (ecmascript)");
;
const MAX_TURNS = 20; // keep context (and cost) bounded
const MAX_CHARS = 2000; // sanitize user text length
function sanitizeMessages(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    for (const m of raw){
        if (typeof m === "object" && m !== null && "role" in m && "content" in m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0) {
            out.push({
                role: m.role,
                content: m.content.slice(0, MAX_CHARS)
            });
        }
    }
    return out.slice(-MAX_TURNS);
}
/** Fallback reply streamed when no LLM key is configured or upstream fails. */ function fallbackReply(reason) {
    return reason === "nokey" ? "你好，我是小晨。目前还没有配置大模型 API 密钥，所以我暂时不能真正思考。请在服务器的 .env 文件里填入 LLM_API_KEY（推荐 DeepSeek，价格很低），重启后我就能和你正常聊天啦。" : "抱歉，我这边连接大模型服务时出了点问题，请稍后再试一次。";
}
function streamFromText(text) {
    const encoder = new TextEncoder();
    const chars = Array.from(text);
    let i = 0;
    return new ReadableStream({
        async pull (controller) {
            if (i >= chars.length) {
                controller.close();
                return;
            }
            controller.enqueue(encoder.encode(chars[i]));
            i += 1;
            // Small delay so the UI still demos the "streaming" experience.
            await new Promise((r)=>setTimeout(r, 18));
        }
    });
}
async function streamChat(rawMessages) {
    const messages = sanitizeMessages(rawMessages);
    if (messages.length === 0) {
        return streamFromText("你好，我是小晨，很高兴见到你。想聊点什么呢？");
    }
    const apiKey = process.env.LLM_API_KEY?.trim();
    const baseUrl = (process.env.LLM_BASE_URL ?? "https://api.deepseek.com").replace(/\/+$/, "");
    const model = process.env.LLM_MODEL ?? "deepseek-chat";
    if (!apiKey) return streamFromText(fallbackReply("nokey"));
    let upstream;
    try {
        upstream = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                stream: true,
                temperature: 0.7,
                max_tokens: 600,
                messages: [
                    {
                        role: "system",
                        content: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$persona$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SYSTEM_PROMPT"]
                    },
                    ...messages
                ]
            })
        });
    } catch  {
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
        async pull (controller) {
            const { done, value } = await reader.read();
            if (done) {
                controller.close();
                return;
            }
            buffer += decoder.decode(value, {
                stream: true
            });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines){
                const trimmed = line.trim();
                if (!trimmed.startsWith("data:")) continue;
                const payload = trimmed.slice(5).trim();
                if (payload === "[DONE]") continue;
                try {
                    const json = JSON.parse(payload);
                    const delta = json.choices?.[0]?.delta?.content;
                    if (delta) controller.enqueue(encoder.encode(delta));
                } catch  {
                // ignore malformed keep-alive lines
                }
            }
        },
        cancel () {
            void reader.cancel();
        }
    });
}
}),
"[project]/src/server/ratelimit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Tiny in-memory fixed-window rate limiter (per IP + bucket name).
 * Good enough for a single-instance deployment; swap for Redis when scaling.
 */ __turbopack_context__.s([
    "clientIp",
    ()=>clientIp,
    "rateLimit",
    ()=>rateLimit
]);
const windows = new Map();
function rateLimit(key, limit, windowMs) {
    const now = Date.now();
    const w = windows.get(key);
    if (!w || now >= w.resetAt) {
        windows.set(key, {
            count: 1,
            resetAt: now + windowMs
        });
        return {
            ok: true,
            retryAfterSec: 0
        };
    }
    w.count += 1;
    if (w.count > limit) {
        return {
            ok: false,
            retryAfterSec: Math.ceil((w.resetAt - now) / 1000)
        };
    }
    return {
        ok: true,
        retryAfterSec: 0
    };
}
function clientIp(req) {
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return req.headers.get("x-real-ip") ?? "local";
}
/** Periodic cleanup so the map never grows unbounded. */ setInterval(()=>{
    const now = Date.now();
    for (const [k, w] of windows)if (now >= w.resetAt) windows.delete(k);
}, 60_000).unref?.();
}),
"[project]/src/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$llm$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/llm.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$ratelimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/ratelimit.ts [app-route] (ecmascript)");
;
;
const runtime = "nodejs";
const dynamic = "force-dynamic";
async function POST(req) {
    const rl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$ratelimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rateLimit"])(`chat:${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$ratelimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clientIp"])(req)}`, 20, 60_000);
    if (!rl.ok) {
        return new Response(JSON.stringify({
            error: "请求过于频繁，请稍后再试"
        }), {
            status: 429,
            headers: {
                "Content-Type": "application/json",
                "Retry-After": String(rl.retryAfterSec)
            }
        });
    }
    let body;
    try {
        body = await req.json();
    } catch  {
        return new Response(JSON.stringify({
            error: "invalid body"
        }), {
            status: 400
        });
    }
    const stream = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$llm$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["streamChat"])(body.messages);
    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no"
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0myorw~._.js.map