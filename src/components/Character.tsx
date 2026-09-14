"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { useLipSync } from "@/hooks/useLipSync";
import { useChatStore } from "@/store/chatStore";

const MODEL_URL = "/models/character.vrm";

interface Rig {
  vrm: VRM;
  /**
   * three-vrm normalized bones live in the model's load-time frame.
   * VRM 0.x models face -Z there (VRMUtils.rotateVRM0 only rotates the scene),
   * so pitch/arm rotation signs must flip between VRM 0.x and 1.0.
   */
  sign: number;
  hipsBaseY: number;
  headY: number;
  nextBlinkAt: number;
  blinkStartedAt: number;
  gesture: number; // smoothed 0..1 "talking gesture" weight
  lookAtTarget: THREE.Object3D;
}

function safeSetExpression(vrm: VRM, name: string, value: number): void {
  const em = vrm.expressionManager;
  if (em && em.getExpression(name)) em.setValue(name, value);
}

export default function Character() {
  const gltf = useLoader(GLTFLoader, MODEL_URL, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as {
    target: THREE.Vector3;
    update: () => void;
  } | null;

  const lipSync = useLipSync();
  const rigRef = useRef<Rig | null>(null);

  const vrm = useMemo(() => {
    const loaded = gltf.userData.vrm as VRM;
    VRMUtils.removeUnnecessaryVertices(loaded.scene);
    VRMUtils.combineSkeletons(loaded.scene);
    VRMUtils.rotateVRM0(loaded); // VRM0 → face +Z like VRM1
    loaded.scene.traverse((obj) => {
      obj.frustumCulled = false;
      if (obj instanceof THREE.Mesh) obj.castShadow = true;
    });
    return loaded;
  }, [gltf]);

  // One-time pose + camera framing once the VRM is ready.
  useEffect(() => {
    const sign = vrm.meta?.metaVersion === "0" ? -1 : 1;

    // Relax the T-pose into a natural A-pose.
    const lUp = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
    const rUp = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
    const lLo = vrm.humanoid.getNormalizedBoneNode("leftLowerArm");
    const rLo = vrm.humanoid.getNormalizedBoneNode("rightLowerArm");
    if (lUp) lUp.rotation.z = sign * -1.15;
    if (rUp) rUp.rotation.z = sign * 1.15;
    if (lLo) lLo.rotation.z = sign * -0.25;
    if (rLo) rLo.rotation.z = sign * 0.25;

    const hips = vrm.humanoid.getNormalizedBoneNode("hips");
    const head = vrm.humanoid.getRawBoneNode("head");

    // Frame a medium close-up on head + upper torso.
    let headY = 1.35;
    if (head) {
      const p = new THREE.Vector3();
      head.getWorldPosition(p);
      headY = p.y;
    }
    camera.position.set(0, headY - 0.02, 1.05);
    camera.lookAt(new THREE.Vector3(0, headY - 0.12, 0));

    // Eye contact: look slightly toward the camera.
    const lookAtTarget = new THREE.Object3D();
    lookAtTarget.position.set(0, headY, 1.2);
    vrm.scene.add(lookAtTarget);
    if (vrm.lookAt) vrm.lookAt.target = lookAtTarget;

    rigRef.current = {
      vrm,
      sign,
      hipsBaseY: hips ? hips.position.y : 0,
      headY,
      nextBlinkAt: 1.5,
      blinkStartedAt: -10,
      gesture: 0,
      lookAtTarget,
    };

    return () => {
      rigRef.current = null;
      VRMUtils.deepDispose(vrm.scene);
    };
  }, [vrm, camera]);

  // OrbitControls mounts after the first commit — aim it at the face once available.
  useEffect(() => {
    const rig = rigRef.current;
    if (!controls || !rig) return;
    controls.target.set(0, rig.headY - 0.12, 0);
    controls.update();
  }, [controls, vrm]);

  useFrame((state, delta) => {
    const rig = rigRef.current;
    if (!rig) return;
    const t = state.clock.elapsedTime;
    const { vrm: v, sign } = rig;

    // ── Lip-sync (returns smoothed speech energy for body gestures) ─────────
    const energy = lipSync.update(v, delta);
    const speaking = useChatStore.getState().isSpeaking;

    // Smooth gesture weight: ramps up while talking, decays back to idle.
    const gestureTarget = speaking ? Math.min(1, 0.3 + energy * 1.4) : 0;
    rig.gesture += (gestureTarget - rig.gesture) * Math.min(1, 3 * delta);
    const g = rig.gesture;

    // ── Blinking (random 2–5 s), suppressed mid-blink ────────────────────────
    if (t >= rig.nextBlinkAt) {
      rig.blinkStartedAt = t;
      rig.nextBlinkAt = t + 2 + Math.random() * 3;
    }
    const blinkPhase = (t - rig.blinkStartedAt) / 0.15;
    const blink = blinkPhase < 1 ? Math.sin(Math.min(blinkPhase, 1) * Math.PI) : 0;
    safeSetExpression(v, "blink", blink);

    // Gentle warmth while talking.
    safeSetExpression(v, "happy", 0.06 + g * 0.18);

    // ── Idle body motion: breathing, weight shift, micro head movement ─────
    const hips = v.humanoid.getNormalizedBoneNode("hips");
    const spine = v.humanoid.getNormalizedBoneNode("spine");
    const chest = v.humanoid.getNormalizedBoneNode("chest");
    const neck = v.humanoid.getNormalizedBoneNode("neck");
    const head = v.humanoid.getNormalizedBoneNode("head");

    const breathe = Math.sin(t * 1.7);
    if (hips) {
      hips.position.y = rig.hipsBaseY + breathe * 0.004;
      hips.rotation.z = Math.sin(t * 0.31) * 0.015; // slow weight shift
      hips.rotation.y = Math.sin(t * 0.23) * 0.02;
    }
    if (spine) {
      spine.rotation.x = sign * (breathe * 0.012 + g * 0.05); // breath + lean-in
      spine.rotation.y = Math.sin(t * 0.4 + 1.0) * 0.015;
    }
    if (chest) chest.rotation.x = sign * breathe * 0.01;

    // Head: micro sway when idle, rhythmic nods scaled by speech energy.
    const nod = g * Math.sin(t * 2.3) * 0.045 * energy;
    if (neck) {
      neck.rotation.x = sign * (Math.sin(t * 0.6 + 0.5) * 0.02 + nod);
      neck.rotation.y = Math.sin(t * 0.42) * 0.03 + g * Math.sin(t * 1.1) * 0.02;
      neck.rotation.z = Math.sin(t * 0.35 + 2.0) * 0.012;
    }
    if (head) {
      head.rotation.x = sign * (Math.sin(t * 0.5 + 1.2) * 0.015 + nod * 0.6);
      head.rotation.y = Math.sin(t * 0.3 + 0.8) * 0.025;
    }

    // Wandering gaze around the camera keeps eye contact alive.
    rig.lookAtTarget.position.x = Math.sin(t * 0.37) * 0.12;
    rig.lookAtTarget.position.y += (Math.sin(t * 0.53) * 0.05 - (rig.lookAtTarget.position.y - (camera.position.y - 0.02))) * 0.1;

    // ── Talking gesture: right forearm raises subtly and sways with speech ──
    const rUp = v.humanoid.getNormalizedBoneNode("rightUpperArm");
    const rLo = v.humanoid.getNormalizedBoneNode("rightLowerArm");
    const lUp = v.humanoid.getNormalizedBoneNode("leftUpperArm");
    if (rUp) {
      rUp.rotation.z = sign * (1.15 - g * 0.18 + Math.sin(t * 1.3) * 0.015);
      rUp.rotation.x = sign * g * Math.sin(t * 1.9) * 0.06;
    }
    if (rLo) rLo.rotation.z = sign * (0.25 + g * 0.55 + g * Math.sin(t * 2.6) * 0.12);
    if (lUp) lUp.rotation.z = sign * (-1.15 - Math.sin(t * 1.3 + 0.7) * 0.015);

    // vrm.update applies expressions/lookAt and simulates spring bones (hair).
    v.update(delta);
  });

  return <primitive object={vrm.scene} />;
}
