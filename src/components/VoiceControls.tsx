"use client";

import { useChatStore, VOICES } from "@/store/chatStore";

export default function VoiceControls() {
  const voice = useChatStore((s) => s.voice);
  const muted = useChatStore((s) => s.muted);
  const isSpeaking = useChatStore((s) => s.isSpeaking);
  const setVoice = useChatStore((s) => s.setVoice);
  const setMuted = useChatStore((s) => s.setMuted);
  const stopSpeaking = useChatStore((s) => s.stopSpeaking);
  const resetConversation = useChatStore((s) => s.resetConversation);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-white/5 px-4 py-2.5">
      <label className="flex items-center gap-2 text-xs text-slate-400">
        <span>音色</span>
        <select
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          className="rounded-lg border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-slate-200 outline-none transition hover:border-white/20 focus:border-sky-400/60"
          aria-label="选择语音音色"
        >
          {VOICES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </label>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={stopSpeaking}
          disabled={!isSpeaking}
          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 transition enabled:hover:border-rose-400/50 enabled:hover:text-rose-300 disabled:opacity-35"
          title="停止说话"
        >
          ■ 停止
        </button>
        <button
          onClick={() => setMuted(!muted)}
          className={`rounded-lg border px-2.5 py-1.5 text-xs transition ${
            muted
              ? "border-amber-400/50 text-amber-300"
              : "border-white/10 text-slate-300 hover:border-white/25"
          }`}
          title={muted ? "取消静音" : "静音"}
        >
          {muted ? "🔇 已静音" : "🔊 声音"}
        </button>
        <button
          onClick={resetConversation}
          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-white/25"
          title="重置对话"
        >
          ↺ 重置
        </button>
      </div>
    </div>
  );
}
