import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { Readable } from "stream";

/** Whitelisted free zh-CN neural voices (Microsoft Edge TTS, no API key). */
export const ALLOWED_VOICES = [
  "zh-CN-XiaoxiaoNeural",
  "zh-CN-XiaoyiNeural",
  "zh-CN-YunxiNeural",
  "zh-CN-YunyangNeural",
] as const;

export type VoiceName = (typeof ALLOWED_VOICES)[number];

const MAX_TTS_CHARS = 500;

/** Strip characters that would be read aloud awkwardly or break SSML. */
function cleanForSpeech(text: string): string {
  return text
    .replace(/[*#`>_~\[\]()（）<>{}|]/g, " ")
    .replace(/https?:\/\/\S+/g, "链接")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TTS_CHARS);
}

/**
 * Synthesize `text` with a free Edge neural voice and return an MP3 buffer.
 * A fresh MsEdgeTTS instance per request keeps the websocket lifecycle simple.
 */
export async function synthesize(text: string, voice: string): Promise<Buffer> {
  const clean = cleanForSpeech(text);
  if (!clean) throw new Error("empty text");

  const chosen: VoiceName = (ALLOWED_VOICES as readonly string[]).includes(voice)
    ? (voice as VoiceName)
    : ((process.env.TTS_VOICE as VoiceName | undefined) ?? "zh-CN-XiaoxiaoNeural");

  const tts = new MsEdgeTTS();
  await tts.setMetadata(chosen, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(clean);

  const chunks: Buffer[] = [];
  for await (const chunk of audioStream as Readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array));
  }
  const buf = Buffer.concat(chunks);
  if (buf.length === 0) throw new Error("empty audio");
  return buf;
}
