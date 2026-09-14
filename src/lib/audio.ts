/**
 * Client-side speech engine:
 *  - Sentence queue → /api/tts → sequential playback on ONE persistent <audio>
 *    element routed through a Web Audio AnalyserNode (drives lip-sync).
 *  - Fallback: browser speechSynthesis (zh-CN) when the backend TTS fails;
 *    lip-sync then uses a procedural envelope since no PCM is available.
 *  - `interrupt()` cancels everything instantly (stop button / new message).
 */

type SpeakingListener = (speaking: boolean) => void;

let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let audioEl: HTMLAudioElement | null = null;
let sourceConnected = false;

let queue: string[] = [];
let voiceName = "zh-CN-XiaoxiaoNeural";
let generation = 0; // bumped on interrupt; stale async work checks this
let playing = false;
let fetching = false;
let fallbackSpeaking = false; // browser speechSynthesis active
let listener: SpeakingListener | null = null;

const timeData = new Float32Array(1024);
let freqData: Uint8Array<ArrayBuffer> = new Uint8Array(512);

export function onSpeakingChange(fn: SpeakingListener): void {
  listener = fn;
}

export function setVoice(v: string): void {
  voiceName = v;
}

function notify() {
  listener?.(playing || fetching || fallbackSpeaking || queue.length > 0);
}

/** Must be called from a user gesture (send/mic click) to satisfy autoplay rules. */
export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  if (!audioCtx) {
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.5;
    freqData = new Uint8Array(analyser.frequencyBinCount);
    audioEl = new Audio();
    audioEl.crossOrigin = "anonymous";
    const src = audioCtx.createMediaElementSource(audioEl);
    src.connect(analyser);
    analyser.connect(audioCtx.destination);
    sourceConnected = true;
  }
  if (audioCtx.state === "suspended") void audioCtx.resume();
}

export function setMuted(muted: boolean): void {
  if (audioEl) audioEl.muted = muted;
  if (muted && fallbackSpeaking && typeof window !== "undefined") {
    window.speechSynthesis.cancel();
    fallbackSpeaking = false;
    notify();
  }
}

export function enqueueSpeech(text: string): void {
  const clean = text.trim();
  if (!clean) return;
  queue.push(clean);
  notify();
  void pump();
}

export function interrupt(): void {
  generation += 1;
  queue = [];
  fetching = false;
  playing = false;
  fallbackSpeaking = false;
  if (audioEl) {
    audioEl.pause();
    if (audioEl.src.startsWith("blob:")) URL.revokeObjectURL(audioEl.src);
    audioEl.removeAttribute("src");
    audioEl.load();
  }
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  notify();
}

async function pump(): Promise<void> {
  if (playing || fetching || queue.length === 0) return;
  const gen = generation;
  const text = queue.shift()!;
  fetching = true;
  notify();

  let blob: Blob | null = null;
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: voiceName }),
    });
    if (res.ok) blob = await res.blob();
  } catch {
    blob = null;
  }
  if (gen !== generation) return; // interrupted while fetching

  fetching = false;

  if (blob && audioEl && audioCtx) {
    playing = true;
    notify();
    const url = URL.createObjectURL(blob);
    audioEl.src = url;
    const finish = () => {
      URL.revokeObjectURL(url);
      if (gen !== generation) return;
      playing = false;
      notify();
      void pump();
    };
    audioEl.onended = finish;
    audioEl.onerror = finish;
    try {
      await audioEl.play();
    } catch {
      finish();
    }
    return;
  }

  // Backend TTS failed → browser speechSynthesis fallback (still free).
  speakWithBrowser(text, gen);
}

function speakWithBrowser(text: string, gen: number): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    void pump();
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "zh-CN";
  const zh = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("zh"));
  if (zh) utter.voice = zh;
  fallbackSpeaking = true;
  notify();
  const done = () => {
    if (gen !== generation) return;
    fallbackSpeaking = false;
    notify();
    void pump();
  };
  utter.onend = done;
  utter.onerror = done;
  window.speechSynthesis.speak(utter);
}

export interface LipSyncSample {
  /** 0..1 overall mouth-open energy (RMS). */
  volume: number;
  /** 0..1 normalized spectral centroid — high = bright vowels (i), low = round (u/o). */
  centroid: number;
  /** true while any speech (real or fallback) is audible. */
  active: boolean;
}

/**
 * Per-frame audio feature extraction for the lip-sync loop.
 * When the browser-TTS fallback is speaking there is no analyser signal, so a
 * layered-sine envelope keeps the mouth moving organically instead of a timer flap.
 */
export function sampleLipSync(): LipSyncSample {
  if (fallbackSpeaking) {
    const t = performance.now() / 1000;
    const v =
      0.35 +
      0.3 * Math.abs(Math.sin(t * 9.1)) +
      0.2 * Math.abs(Math.sin(t * 15.7 + 1.3)) +
      0.15 * Math.sin(t * 3.3);
    return { volume: Math.min(1, Math.max(0, v)), centroid: 0.4 + 0.25 * Math.sin(t * 5.1), active: true };
  }

  if (!analyser || !playing) return { volume: 0, centroid: 0.5, active: false };

  analyser.getFloatTimeDomainData(timeData);
  let sum = 0;
  for (let i = 0; i < timeData.length; i++) sum += timeData[i]! * timeData[i]!;
  const rms = Math.sqrt(sum / timeData.length);
  // Map RMS (~0..0.3 for speech) into a 0..1 mouth range with soft knee.
  const volume = Math.min(1, Math.pow(rms * 6.5, 0.85));

  analyser.getByteFrequencyData(freqData);
  let num = 0;
  let den = 0;
  for (let i = 0; i < freqData.length; i++) {
    num += i * freqData[i]!;
    den += freqData[i]!;
  }
  const centroid = den > 0 ? num / den / freqData.length : 0.5;

  return { volume, centroid: Math.min(1, centroid * 3), active: true };
}
