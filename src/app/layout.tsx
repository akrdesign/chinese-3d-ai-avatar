import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "小晨 · 3D AI 数字助理",
  description: "会说中文的 3D 虚拟人：DeepSeek 对话 + 免费微软神经语音 + 实时口型同步。",
};

export const viewport: Viewport = {
  themeColor: "#0b0e14",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#0b0e14] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
