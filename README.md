# 小晨 (Xiao Chen) — Chinese-Speaking Interactive 3D AI Character

A production-quality single-page web app where a 3D VRM humanoid converses in Mandarin
Chinese (简体中文) with **real audio-driven lip-sync**, procedural idle/talking body
animation, streamed LLM replies, and a **completely free TTS path**.

![stack](https://img.shields.io/badge/stack-Next.js%20%2B%20R3F%20%2B%20three--vrm-blue)

## Features

- **3D character**: free official VRoid sample VRM (`public/models/character.vrm`),
  medium close-up framing, soft three-point studio lighting, dark elegant theme.
- **Alive at all times**: breathing, random blinks (2–5 s), micro head sway, weight
  shift, spring-bone hair physics; while talking: nods, lean-in, subtle hand gesture.
- **Real lip-sync**: a Web Audio `AnalyserNode` taps the playing TTS audio. RMS energy
  drives the `aa` viseme; spectral centroid blends `ih` (bright) vs `ou` (round).
  Fast-attack / slow-release smoothing — visibly tied to the audio, never a timer flap.
- **Streaming chat**: tokens appear live; each finished sentence is synthesized
  immediately, so speech starts before the full reply is done.
- **Free TTS**: Microsoft Edge neural voices via [`msedge-tts`](https://www.npmjs.com/package/msedge-tts)
  (no key, no cost). Voice picker: 晓晓 / 晓伊 / 云希 / 云扬. Automatic fallback to the
  browser's `speechSynthesis` (zh-CN) if the backend TTS fails.
- **Voice input**: Web Speech API (zh-CN) via the 🎤 button (Chrome/Edge).
- **Controls**: send, mic, stop-speaking (interrupt), mute, voice picker, reset.
  Status chips: 聆听中 / 思考中 / 说话中 / 空闲.
- **Security**: LLM key stays server-side; per-IP rate limits on `/api/chat` and
  `/api/tts`; user text capped at 2000 chars.

## Architecture note

The original spec called for Vite + a separate Express server. This deployment
platform runs a single **Next.js (App Router)** process, which serves both the React
frontend and the backend as API route handlers — same separation, one server:

| Spec (Vite + Express)      | This repo (Next.js)              |
|----------------------------|----------------------------------|
| `server/index.ts` `/api/*` | `src/app/api/chat/route.ts`, `src/app/api/tts/route.ts` |
| `server/llm.ts`            | `src/server/llm.ts`              |
| `server/tts.ts`            | `src/server/tts.ts`              |
| `server/persona.ts`        | `src/server/persona.ts` (edit the system prompt here) |
| `src/*` (React app)        | `src/app`, `src/components`, `src/hooks`, `src/lib`, `src/store` |

Everything else (R3F + `@pixiv/three-vrm`, Zustand, analyser-based lip-sync, free
edge TTS) is exactly as specified.

## Setup

**Node version**: Node **20+** (tested on Node 22).

```bash
npm install
cp .env.example .env      # then fill LLM_API_KEY
npm run dev               # http://localhost:3000
```

### 1. Get a cheap LLM key (DeepSeek recommended)

1. Register at <https://platform.deepseek.com> (Chinese mobile number or email).
2. Top up a small amount (¥10 lasts a very long time) and create an API key.
3. Put it in `.env`:
   ```env
   LLM_BASE_URL=https://api.deepseek.com
   LLM_API_KEY=sk-...
   LLM_MODEL=deepseek-chat
   ```
   **Approximate cost**: deepseek-chat is roughly ¥2 / 1M input tokens (cache miss)
   and ¥8 / 1M output tokens — a typical short chat turn costs a few thousandths of
   a yuan (well under $0.001).

Any OpenAI-compatible endpoint works. Alternatives:
- **Qwen**: `LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`, `LLM_MODEL=qwen-flash`
- **Zhipu (free tier!)**: `LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4`, `LLM_MODEL=glm-4-flash`

Without a key the app still runs: 小晨 politely explains (in Chinese, with voice and
lip-sync) that the key is missing.

### 2. How TTS works (free)

`/api/tts` uses the **`msedge-tts` npm package** (pure JS, no Python needed). It opens
the same WebSocket that the Microsoft Edge browser's "Read Aloud" feature uses, so the
neural voices (`zh-CN-XiaoxiaoNeural` etc.) are free and require **no API key**. Audio
is returned as an in-memory `audio/mpeg` response — nothing is written to disk.
If synthesis fails (network/firewall), the client automatically falls back to the
browser's built-in `speechSynthesis` with a zh-CN voice.

### 3. Replace the character

Drop any **VRM 0.x or 1.0** file at `public/models/character.vrm`. Both versions are
handled (orientation and viseme names are normalized automatically). Good sources:
[VRoid Hub](https://hub.vroid.com) (check the license badge), VRoid Studio exports, or
the bundled official VRoid sample:

```bash
curl -L -o public/models/character.vrm \
  https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/stable/AvatarSample_A.vrm
```

### 4. Known limits

- **Autoplay**: browsers block audio until a user gesture. The first click on
  send / 🎤 unlocks the `AudioContext`; if you reload mid-conversation the first
  reply may be silent until you interact once.
- **Mic**: Web Speech API needs Chrome/Edge and mic permission; it streams audio to
  Google/Microsoft servers (that's how the browser API works). HTTPS (or localhost) required.
- **edge-tts**: an unofficial endpoint; Microsoft occasionally rotates tokens. Update
  `msedge-tts` if voices stop working — the browser-TTS fallback keeps the app usable.
- One rate-limit window per server instance (in-memory); use Redis for multi-instance.

## 中文简介

这是一个会说中文的 3D 虚拟人网页应用：

- 输入中文（或点击 🎤 说话），小晨会以流式方式回复，并用微软 Edge 免费神经语音朗读；
- 口型通过 Web Audio 分析真实音频能量驱动（不是定时开合），身体有呼吸、眨眼、
  点头等自然动作；
- 大模型默认使用 DeepSeek（价格极低），也可切换到通义千问 / 智谱 GLM-4-Flash（有免费档）；
- 语音合成完全免费，无需任何密钥；后端只做 LLM 代理和 TTS 代理，API 密钥不会暴露到浏览器。

运行：`npm install && npm run dev`，并在 `.env` 中填入 `LLM_API_KEY`。
人设提示词在 `src/server/persona.ts` 中，可直接修改。

## License notes

The bundled avatar is the official **VRoid Project sample model (AvatarSample_A)**,
distributed for free use under the VRoid sample-model license (usable in apps/games;
see hub.vroid.com for details). Replace it with your own VRM for commercial branding.
