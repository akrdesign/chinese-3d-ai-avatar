(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/hooks/useLipSync.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useLipSync",
    ()=>useLipSync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/audio.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function useLipSync() {
    _s();
    const state = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        aa: 0,
        ih: 0,
        ou: 0,
        energy: 0
    });
    const update = (vrm, delta)=>{
        const em = vrm.expressionManager;
        const s = state.current;
        const sample = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sampleLipSync"])();
        const targetAa = sample.active ? sample.volume : 0;
        // Centroid ~0.15..0.8 → split into round vs bright side-shapes.
        const bright = sample.active ? Math.max(0, (sample.centroid - 0.45) * 1.8) : 0;
        const round = sample.active ? Math.max(0, (0.4 - sample.centroid) * 1.6) : 0;
        const targetIh = Math.min(0.6, bright * sample.volume);
        const targetOu = Math.min(0.7, round * sample.volume);
        // Asymmetric smoothing: open fast (~25/s), close slower (~10/s).
        const k = (target, cur)=>cur + (target - cur) * Math.min(1, (target > cur ? 25 : 10) * delta);
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
    return {
        update
    };
}
_s(useLipSync, "xgbtc73FD1JRNjFhvrPSxfjovBs=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Character.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Character
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$GLTFLoader$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/loaders/GLTFLoader.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-156d8d12.esm.js [app-client] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-156d8d12.esm.js [app-client] (ecmascript) <export G as useLoader>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-156d8d12.esm.js [app-client] (ecmascript) <export C as useThree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$pixiv$2f$three$2d$vrm$2f$lib$2f$three$2d$vrm$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@pixiv/three-vrm/lib/three-vrm.module.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useLipSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useLipSync.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$chatStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/chatStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
const MODEL_URL = "/models/character.vrm";
function safeSetExpression(vrm, name, value) {
    const em = vrm.expressionManager;
    if (em && em.getExpression(name)) em.setValue(name, value);
}
function Character() {
    _s();
    const gltf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__["useLoader"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$loaders$2f$GLTFLoader$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLTFLoader"], MODEL_URL, {
        "Character.useLoader[gltf]": (loader)=>{
            loader.register({
                "Character.useLoader[gltf]": (parser)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$pixiv$2f$three$2d$vrm$2f$lib$2f$three$2d$vrm$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VRMLoaderPlugin"](parser)
            }["Character.useLoader[gltf]"]);
        }
    }["Character.useLoader[gltf]"]);
    const camera = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])({
        "Character.useThree[camera]": (s)=>s.camera
    }["Character.useThree[camera]"]);
    const controls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])({
        "Character.useThree[controls]": (s)=>s.controls
    }["Character.useThree[controls]"]);
    const lipSync = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useLipSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLipSync"])();
    const rigRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const vrm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Character.useMemo[vrm]": ()=>{
            const loaded = gltf.userData.vrm;
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$pixiv$2f$three$2d$vrm$2f$lib$2f$three$2d$vrm$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VRMUtils"].removeUnnecessaryVertices(loaded.scene);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$pixiv$2f$three$2d$vrm$2f$lib$2f$three$2d$vrm$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VRMUtils"].combineSkeletons(loaded.scene);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$pixiv$2f$three$2d$vrm$2f$lib$2f$three$2d$vrm$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VRMUtils"].rotateVRM0(loaded); // VRM0 → face +Z like VRM1
            loaded.scene.traverse({
                "Character.useMemo[vrm]": (obj)=>{
                    obj.frustumCulled = false;
                    if (obj instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"]) obj.castShadow = true;
                }
            }["Character.useMemo[vrm]"]);
            return loaded;
        }
    }["Character.useMemo[vrm]"], [
        gltf
    ]);
    // One-time pose + camera framing once the VRM is ready.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Character.useEffect": ()=>{
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
                const p = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
                head.getWorldPosition(p);
                headY = p.y;
            }
            camera.position.set(0, headY - 0.02, 1.05);
            camera.lookAt(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, headY - 0.12, 0));
            // Eye contact: look slightly toward the camera.
            const lookAtTarget = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Object3D"]();
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
                lookAtTarget
            };
            return ({
                "Character.useEffect": ()=>{
                    rigRef.current = null;
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$pixiv$2f$three$2d$vrm$2f$lib$2f$three$2d$vrm$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VRMUtils"].deepDispose(vrm.scene);
                }
            })["Character.useEffect"];
        }
    }["Character.useEffect"], [
        vrm,
        camera
    ]);
    // OrbitControls mounts after the first commit — aim it at the face once available.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Character.useEffect": ()=>{
            const rig = rigRef.current;
            if (!controls || !rig) return;
            controls.target.set(0, rig.headY - 0.12, 0);
            controls.update();
        }
    }["Character.useEffect"], [
        controls,
        vrm
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "Character.useFrame": (state, delta)=>{
            const rig = rigRef.current;
            if (!rig) return;
            const t = state.clock.elapsedTime;
            const { vrm: v, sign } = rig;
            // ── Lip-sync (returns smoothed speech energy for body gestures) ─────────
            const energy = lipSync.update(v, delta);
            const speaking = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$chatStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChatStore"].getState().isSpeaking;
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
        }
    }["Character.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("primitive", {
        object: vrm.scene
    }, void 0, false, {
        fileName: "[project]/src/components/Character.tsx",
        lineNumber: 194,
        columnNumber: 10
    }, this);
}
_s(Character, "A+LwXK3Kh6GBRNRptpOIZDAlHqY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__["useLoader"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useLipSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLipSync"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c = Character;
var _c;
__turbopack_context__.k.register(_c, "Character");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/AvatarCanvas.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AvatarCanvas
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/OrbitControls.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Progress$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Progress.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Character$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Character.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function LoadingOverlay() {
    _s();
    const { progress, active } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Progress$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProgress"])();
    if (!active && progress >= 100) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#0b0e14]/80 backdrop-blur-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-sm tracking-widest text-slate-300",
                children: "正在加载虚拟形象…"
            }, void 0, false, {
                fileName: "[project]/src/components/AvatarCanvas.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-1.5 w-56 overflow-hidden rounded-full bg-slate-700/60",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400 transition-all duration-200",
                    style: {
                        width: `${Math.max(5, progress)}%`
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/AvatarCanvas.tsx",
                    lineNumber: 15,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/AvatarCanvas.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-slate-500",
                children: [
                    progress.toFixed(0),
                    "%"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/AvatarCanvas.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/AvatarCanvas.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_s(LoadingOverlay, "PzC6FiPSUK9CQnmCAt0VOzxPVxI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Progress$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProgress"]
    ];
});
_c = LoadingOverlay;
function AvatarCanvas() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative h-full w-full overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#232a3d_0%,#141824_55%,#0b0e14_100%)]"
            }, void 0, false, {
                fileName: "[project]/src/components/AvatarCanvas.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0b0e14] to-transparent"
            }, void 0, false, {
                fileName: "[project]/src/components/AvatarCanvas.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LoadingOverlay, {}, void 0, false, {
                fileName: "[project]/src/components/AvatarCanvas.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Canvas"], {
                className: "absolute inset-0",
                camera: {
                    fov: 27,
                    near: 0.1,
                    far: 20,
                    position: [
                        0,
                        1.35,
                        1.1
                    ]
                },
                gl: {
                    antialias: true,
                    alpha: true
                },
                dpr: [
                    1,
                    2
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ambientLight", {
                        intensity: 0.55,
                        color: "#cdd6ff"
                    }, void 0, false, {
                        fileName: "[project]/src/components/AvatarCanvas.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                        position: [
                            1.5,
                            2.2,
                            2.5
                        ],
                        intensity: 1.35,
                        color: "#fff4e6"
                    }, void 0, false, {
                        fileName: "[project]/src/components/AvatarCanvas.tsx",
                        lineNumber: 42,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                        position: [
                            -2.2,
                            1.4,
                            1.2
                        ],
                        intensity: 0.5,
                        color: "#9db4ff"
                    }, void 0, false, {
                        fileName: "[project]/src/components/AvatarCanvas.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                        position: [
                            0,
                            1.8,
                            -2.5
                        ],
                        intensity: 0.9,
                        color: "#7f9cff"
                    }, void 0, false, {
                        fileName: "[project]/src/components/AvatarCanvas.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                        fallback: null,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Character$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/components/AvatarCanvas.tsx",
                            lineNumber: 47,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/AvatarCanvas.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrbitControls"], {
                        makeDefault: true,
                        enablePan: false,
                        enableZoom: true,
                        minDistance: 0.7,
                        maxDistance: 2.2,
                        minPolarAngle: Math.PI * 0.35,
                        maxPolarAngle: Math.PI * 0.58,
                        minAzimuthAngle: -Math.PI * 0.25,
                        maxAzimuthAngle: Math.PI * 0.25,
                        enableDamping: true,
                        dampingFactor: 0.08
                    }, void 0, false, {
                        fileName: "[project]/src/components/AvatarCanvas.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/AvatarCanvas.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/AvatarCanvas.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_c1 = AvatarCanvas;
var _c, _c1;
__turbopack_context__.k.register(_c, "LoadingOverlay");
__turbopack_context__.k.register(_c1, "AvatarCanvas");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/AvatarCanvas.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/AvatarCanvas.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_08dwqyc._.js.map