import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Plays the script with the browser's speech voice so the prototype has real, audible playback. */
export function VoicePlayer({ script, voice, compact }: { script: string; voice: string; compact?: boolean }) {
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [rate, setRate] = useState(1);
  const timer = useRef<number | null>(null);
  const duration = Math.max(4, Math.round(script.split(/\s+/).length / 2.6 / rate));
  const bars = useMemo(() => Array.from({ length: compact ? 36 : 56 }, (_, i) => 25 + Math.round(Math.abs(Math.sin(i * 1.7) * 55 + Math.cos(i * 0.6) * 20))), [compact]);

  const stopTimer = () => { if (timer.current) window.clearInterval(timer.current); timer.current = null; };
  const reset = () => { stopTimer(); window.speechSynthesis?.cancel(); setState("idle"); setElapsed(0); };
  useEffect(() => reset, [script, rate]); // eslint-disable-line react-hooks/exhaustive-deps

  const tick = () => { stopTimer(); timer.current = window.setInterval(() => setElapsed((e) => Math.min(e + 0.1, duration)), 100); };

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (!synth) { toast.error("Audio playback isn't supported in this browser."); return; }
    if (state === "playing") { synth.pause(); stopTimer(); setState("paused"); return; }
    if (state === "paused") { synth.resume(); tick(); setState("playing"); return; }
    const u = new SpeechSynthesisUtterance(script);
    u.rate = rate;
    u.onend = () => { stopTimer(); setElapsed(duration); setState("idle"); };
    synth.cancel(); synth.speak(u); setElapsed(0); tick(); setState("playing");
  };
  const fmt = (s: number) => `0:${String(Math.floor(s)).padStart(2, "0")}`;
  const progress = elapsed / duration;

  return (
    <div className="border bg-card p-3">
      <div className="flex items-center gap-3">
        <button onClick={toggle} aria-label={state === "playing" ? "Pause" : "Play"} className="grid size-9 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground hover:bg-primary-hover">
          {state === "playing" ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
        <div className="flex h-9 flex-1 items-center gap-[2px]" aria-hidden>
          {bars.map((h, i) => (
            <span key={i} className={cn("w-full rounded-[1px] transition-colors", i / bars.length < progress ? "bg-primary" : "bg-track")} style={{ height: `${h}%` }} />
          ))}
        </div>
        <span className="num w-20 shrink-0 text-right text-xs text-muted-foreground">{fmt(elapsed)} / {fmt(duration)}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Voice: <span className="text-foreground">{voice}</span></span>
        <span aria-hidden>·</span>
        <label className="flex items-center gap-1">Speed
          <select value={rate} onChange={(e) => setRate(Number(e.target.value))} className="border bg-background px-1 py-0.5 text-foreground">
            {[0.75, 1, 1.25, 1.5].map((r) => <option key={r} value={r}>{r}×</option>)}
          </select>
        </label>
        {state !== "idle" && <button onClick={reset} className="ml-auto flex items-center gap-1 hover:text-foreground"><RotateCcw className="size-3" /> Restart</button>}
      </div>
      {!compact && <p className="mt-2 text-[11px] text-muted-foreground">Sample playback uses your browser's voice. Studio-quality audio in the “{voice}” voice is generated when you approve.</p>}
    </div>
  );
}
