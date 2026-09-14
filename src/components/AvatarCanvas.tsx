"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useProgress } from "@react-three/drei";
import Character from "./Character";

function LoadingOverlay() {
  const { progress, active } = useProgress();
  if (!active && progress >= 100) return null;
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#0b0e14]/80 backdrop-blur-sm">
      <div className="text-sm tracking-widest text-slate-300">正在加载虚拟形象…</div>
      <div className="h-1.5 w-56 overflow-hidden rounded-full bg-slate-700/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400 transition-all duration-200"
          style={{ width: `${Math.max(5, progress)}%` }}
        />
      </div>
      <div className="text-xs text-slate-500">{progress.toFixed(0)}%</div>
    </div>
  );
}

export default function AvatarCanvas() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Soft studio backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#232a3d_0%,#141824_55%,#0b0e14_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0b0e14] to-transparent" />

      <LoadingOverlay />

      <Canvas
        className="absolute inset-0"
        camera={{ fov: 27, near: 0.1, far: 20, position: [0, 1.35, 1.1] }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        {/* Soft three-point studio lighting */}
        <ambientLight intensity={0.55} color="#cdd6ff" />
        <directionalLight position={[1.5, 2.2, 2.5]} intensity={1.35} color="#fff4e6" />
        <directionalLight position={[-2.2, 1.4, 1.2]} intensity={0.5} color="#9db4ff" />
        <directionalLight position={[0, 1.8, -2.5]} intensity={0.9} color="#7f9cff" />

        <Suspense fallback={null}>
          <Character />
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={true}
          minDistance={0.7}
          maxDistance={2.2}
          minPolarAngle={Math.PI * 0.35}
          maxPolarAngle={Math.PI * 0.58}
          minAzimuthAngle={-Math.PI * 0.25}
          maxAzimuthAngle={Math.PI * 0.25}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}
