"use client";

import { useRef } from "react";
import type { VRM } from "@pixiv/three-vrm";
import { sampleLipSync } from "@/lib/audio";

/**
 * Per-frame lip-sync driver.
 *
 * Maps live audio features to VRM visemes:
 *  - RMS volume → `aa` (primary jaw-open shape)
 *  - spectral centroid → blends `ih` (bright/high) vs `ou` (dark/round)
 * Attack is fast, release is slower (real mouths close slower than they open),
 * everything is lerped so the motion never pops.
 */
export function useLipSync() {
  const state = useRef({ aa: 0, ih: 0, ou: 0, energy: 0 });

  const update = (vrm: VRM, delta: number): number => {
    const em = vrm.expressionManager;
    const s = state.current;
    const sample = sampleLipSync();

    const targetAa = sample.active ? sample.volume : 0;
    // Centroid ~0.15..0.8 → split into round vs bright side-shapes.
    const bright = sample.active ? Math.max(0, (sample.centroid - 0.45) * 1.8) : 0;
    const round = sample.active ? Math.max(0, (0.4 - sample.centroid) * 1.6) : 0;
    const targetIh = Math.min(0.6, bright * sample.volume);
    const targetOu = Math.min(0.7, round * sample.volume);

    // Asymmetric smoothing: open fast (~25/s), close slower (~10/s).
    const k = (target: number, cur: number) =>
      cur + (target - cur) * Math.min(1, (target > cur ? 25 : 10) * delta);

    s.aa = k(targetAa, s.aa);
    s.ih = k(targetIh, s.ih);
    s.ou = k(targetOu, s.ou);
    s.energy = s.energy + (targetAa - s.energy) * Math.min(1, 4 * delta);

    if (em) {
      em.setValue("aa", Math.min(1, s.aa * 0.9));
      em.setValue("ih", s.ih);
      em.setValue("ou", s.ou);
    }
    // Smoothed energy feeds body "talking" gestures (nods, hand motion).
    return s.energy;
  };

  return { update };
}
