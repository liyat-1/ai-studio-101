import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Morphing blob. `level` (0–1) scales it so it "breathes" with the voice. */
export function VoiceBlob({ level = 0, size = 160, idle }: { level?: number; size?: number; idle?: boolean }) {
  return (
    <div className="voice-blob" data-idle={idle ? "true" : "false"} style={{ width: size, height: size, ["--level" as string]: String(1 + Math.min(level, 1) * 0.28) }} aria-hidden>
      <i /><i /><i />
    </div>
  );
}

type Rec = { start: () => void; stop: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; interimResults: boolean; continuous: boolean; lang: string };

/** Listens to the microphone: live level for the blob + browser speech-to-text. */
export function useVoiceInput(onText: (t: string) => void) {
  const [active, setActive] = useState(false);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const cleanup = useRef<() => void>(() => {});

  const stop = () => { cleanup.current(); cleanup.current = () => {}; setActive(false); setLevel(0); };
  useEffect(() => stop, []); // eslint-disable-line react-hooks/exhaustive-deps

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser(); analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let raf = 0;
      const loop = () => { analyser.getByteFrequencyData(data); let s = 0; for (const v of data) s += v; setLevel(Math.min(1, s / data.length / 90)); raf = requestAnimationFrame(loop); };
      loop();
      const W = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
      const SR = W.SpeechRecognition ?? W.webkitSpeechRecognition;
      let rec: Rec | null = null;
      if (SR) {
        rec = new SR(); rec.interimResults = true; rec.continuous = true; rec.lang = "en-US";
        rec.onresult = (e) => { let t = ""; for (let i = 0; i < e.results.length; i++) t += e.results[i]![0]!.transcript; onText(t); };
        rec.start();
      } else setError("Speech-to-text isn't supported in this browser — the orb still listens.");
      cleanup.current = () => { cancelAnimationFrame(raf); rec?.stop(); stream.getTracks().forEach((t) => t.stop()); void ctx.close(); };
      setActive(true);
    } catch {
      setError("Microphone access was blocked. Allow it in your browser to talk to your agent.");
    }
  };
  return { active, level, error, start, stop };
}

export function VoiceOverlay({ open, level, transcript, error, agentName, onDone, onCancel }: { open: boolean; level: number; transcript: string; error: string | null; agentName: string; onDone: () => void; onCancel: () => void }) {
  if (!open) return null;
  return (
    <div className={cn("studio-fade absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-background/85 px-6 backdrop-blur-md")} role="dialog" aria-label="Voice input">
      <VoiceBlob level={level} size={190} />
      <div className="text-center">
        <div className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Listening · {agentName}</div>
        <p className="mt-3 min-h-[3rem] max-w-[520px] text-xl leading-snug">{transcript || <span className="text-muted-foreground">Say what you'd like to achieve…</span>}</p>
        {error && <p className="mt-2 text-xs text-warning">{error}</p>}
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="rounded-full border bg-card px-4 py-2 text-sm hover:bg-muted">Cancel</button>
        <button onClick={onDone} className="rounded-full bg-sidebar px-5 py-2 text-sm text-sidebar-accent-foreground hover:opacity-90">Done</button>
      </div>
    </div>
  );
}
