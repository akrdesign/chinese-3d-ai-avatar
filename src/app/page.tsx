"use client";

import dynamic from "next/dynamic";
import ChatPanel from "@/components/ChatPanel";

// The 3D canvas touches WebGL/AudioContext → client-only, no SSR.
const AvatarCanvas = dynamic(() => import("@/components/AvatarCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0b0e14] text-sm text-slate-500">
      正在初始化 3D 场景…
    </div>
  ),
});

export default function Home() {
  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden md:flex-row">
      {/* 3D stage: top on mobile, left/center on desktop */}
      <section className="relative h-[46dvh] min-h-0 flex-1 md:h-auto" aria-label="3D 虚拟形象">
        <AvatarCanvas />
      </section>

      {/* Chat: bottom sheet on mobile, right panel on desktop */}
      <aside className="h-[54dvh] min-h-0 w-full border-t border-white/5 md:h-auto md:w-[400px] md:border-l md:border-t-0 lg:w-[440px]">
        <ChatPanel />
      </aside>
    </main>
  );
}
