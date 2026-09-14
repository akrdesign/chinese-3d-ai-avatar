"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useChatStore, Status } from "@/store/chatStore";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { unlockAudio } from "@/lib/audio";
import VoiceControls from "./VoiceControls";

const STATUS_META: Record<Status, { label: string; cls: string; dot: string }> = {
  idle: { label: "空闲", cls: "text-slate-400 border-white/10", dot: "bg-slate-500" },
  listening: { label: "聆听中", cls: "text-emerald-300 border-emerald-400/40", dot: "bg-emerald-400 animate-pulse" },
  thinking: { label: "思考中", cls: "text-sky-300 border-sky-400/40", dot: "bg-sky-400 animate-pulse" },
  speaking: { label: "说话中", cls: "text-violet-300 border-violet-400/40", dot: "bg-violet-400 animate-pulse" },
};

export default function ChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const isThinking = useChatStore((s) => s.isThinking);
  const isSpeaking = useChatStore((s) => s.isSpeaking);
  const isListening = useChatStore((s) => s.isListening);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const stopSpeaking = useChatStore((s) => s.stopSpeaking);
  const setListening = useChatStore((s) => s.setListening);

  const status: Status = isListening
    ? "listening"
    : isSpeaking
      ? "speaking"
      : isThinking
        ? "thinking"
        : "idle";
  const meta = STATUS_META[status];

  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const speech = useSpeechRecognition({
    onInterim: (text) => setInput(text),
    onFinal: (text) => {
      setInput("");
      void sendMessage(text);
    },
    onListeningChange: setListening,
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const busy = isThinking || isSpeaking;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isThinking) return;
    void sendMessage(input);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleMic = () => {
    unlockAudio();
    if (speech.listening) speech.stop();
    else {
      if (isSpeaking) stopSpeaking();
      speech.start();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#10141f]/95 backdrop-blur">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/30 to-violet-500/30 text-lg">
          晨
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-100">小晨 · AI 数字助理</div>
          <div className="text-xs text-slate-500">免费语音 · DeepSeek 驱动</div>
        </div>
        <span
          className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${meta.cls}`}
          role="status"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      <VoiceControls />

      {/* Messages */}
      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-br-sm bg-sky-600/90 text-white"
                  : "rounded-bl-sm border border-white/5 bg-slate-800/70 text-slate-100"
              }`}
            >
              {m.content || (
                <span className="inline-flex gap-1 py-1" aria-label="思考中">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <form onSubmit={submit} className="border-t border-white/5 p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-slate-800/60 p-2 focus-within:border-sky-400/50">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder={isListening ? "请说话…" : "输入消息，回车发送…"}
            className="max-h-28 min-h-[38px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            aria-label="聊天输入框"
          />
          {speech.supported && (
            <button
              type="button"
              onClick={toggleMic}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-base transition ${
                isListening
                  ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300"
                  : "border-white/10 text-slate-300 hover:border-white/25"
              }`}
              title={isListening ? "停止录音" : "语音输入（中文）"}
              aria-label="语音输入"
            >
              🎤
            </button>
          )}
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="flex h-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 text-sm font-medium text-white transition enabled:hover:brightness-110 disabled:opacity-40"
          >
            {isSpeaking ? "说话中…" : isThinking ? "思考中…" : "发送"}
          </button>
        </div>
        <div className="mt-1.5 px-1 text-[11px] text-slate-600">
          小晨会用简体中文回答 · 语音由微软 Edge 免费神经语音合成
        </div>
      </form>
    </div>
  );
}
