"use client";

import { create } from "zustand";
import {
  enqueueSpeech,
  interrupt,
  onSpeakingChange,
  setMuted as setAudioMuted,
  setVoice as setAudioVoice,
  unlockAudio,
} from "@/lib/audio";

export type Role = "user" | "assistant";
export interface Message {
  id: string;
  role: Role;
  content: string;
}

export type Status = "idle" | "listening" | "thinking" | "speaking";

export const VOICES = [
  { id: "zh-CN-XiaoxiaoNeural", label: "晓晓（女声・温柔）" },
  { id: "zh-CN-XiaoyiNeural", label: "晓伊（女声・活泼）" },
  { id: "zh-CN-YunxiNeural", label: "云希（男声・阳光）" },
  { id: "zh-CN-YunyangNeural", label: "云扬（男声・稳重）" },
] as const;

interface ChatState {
  messages: Message[];
  isThinking: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  muted: boolean;
  voice: string;
  status: () => Status;
  setListening: (v: boolean) => void;
  setMuted: (v: boolean) => void;
  setVoice: (v: string) => void;
  sendMessage: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  resetConversation: () => void;
}

let uid = 0;
const nextId = () => `m${Date.now()}_${uid++}`;

/** Split streamed text into speakable sentences for low-latency TTS. */
const SENTENCE_END = /[。！？!?；;…\n]/;

const GREETING = "你好，我是小晨，很高兴见到你。今天想聊点什么呢？";

export const useChatStore = create<ChatState>((set, get) => {
  // Wire the audio engine's speaking state into the store exactly once.
  if (typeof window !== "undefined") {
    onSpeakingChange((speaking) => set({ isSpeaking: speaking }));
  }

  return {
    messages: [{ id: nextId(), role: "assistant", content: GREETING }],
    isThinking: false,
    isSpeaking: false,
    isListening: false,
    muted: false,
    voice: "zh-CN-XiaoxiaoNeural",

    status: () => {
      const s = get();
      if (s.isListening) return "listening";
      if (s.isSpeaking) return "speaking";
      if (s.isThinking) return "thinking";
      return "idle";
    },

    setListening: (v) => set({ isListening: v }),

    setMuted: (v) => {
      setAudioMuted(v);
      set({ muted: v });
    },

    setVoice: (v) => {
      setAudioVoice(v);
      set({ voice: v });
    },

    stopSpeaking: () => {
      interrupt();
      set({ isSpeaking: false });
    },

    resetConversation: () => {
      interrupt();
      set({
        messages: [{ id: nextId(), role: "assistant", content: GREETING }],
        isThinking: false,
        isSpeaking: false,
      });
    },

    sendMessage: async (text: string) => {
      const clean = text.trim().slice(0, 2000);
      if (!clean || get().isThinking) return;

      unlockAudio(); // user gesture → allow audio playback
      interrupt(); // barge-in: stop any current speech

      const userMsg: Message = { id: nextId(), role: "user", content: clean };
      const assistantId = nextId();
      const history = [...get().messages, userMsg];

      set({
        messages: [...history, { id: assistantId, role: "assistant", content: "" }],
        isThinking: true,
      });

      const appendAssistant = (chunk: string) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          ),
        }));

      let speechBuffer = "";
      const flushSpeech = (force: boolean) => {
        if (get().muted) {
          speechBuffer = "";
          return;
        }
        if (force) {
          if (speechBuffer.trim()) enqueueSpeech(speechBuffer);
          speechBuffer = "";
          return;
        }
        // Flush every complete sentence; keep the tail in the buffer.
        let idx: number;
        while ((idx = speechBuffer.search(SENTENCE_END)) !== -1) {
          const sentence = speechBuffer.slice(0, idx + 1);
          speechBuffer = speechBuffer.slice(idx + 1);
          if (sentence.trim().length >= 2) enqueueSpeech(sentence);
        }
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map(({ role, content }) => ({ role, content })),
          }),
        });
        if (!res.ok || !res.body) {
          const msg =
            res.status === 429
              ? "我说得有点快，请稍等几秒再发哦。"
              : "抱歉，服务暂时不可用，请稍后再试。";
          appendAssistant(msg);
          speechBuffer = msg;
          flushSpeech(true);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (!chunk) continue;
          appendAssistant(chunk);
          speechBuffer += chunk;
          flushSpeech(false);
        }
        flushSpeech(true);
      } catch {
        appendAssistant("抱歉，网络出了点问题，请稍后再试。");
      } finally {
        set({ isThinking: false });
      }
    },
  };
});
