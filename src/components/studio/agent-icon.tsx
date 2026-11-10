import portraits from "@/assets/agent-portraits.jpg";
import { AGENTS } from "@/lib/studio-data";
import { cn } from "@/lib/utils";

const COLS = 4;
const ROWS = 3;

/** Clean 3D portrait per agent (one sprite sheet), with a small sparkle badge marking it as AI. */
export function AgentMark({ id, size = "md", muted }: { id: string; size?: "xs" | "sm" | "md" | "lg" | "xl"; muted?: boolean | undefined }) {
  const i = Math.max(0, AGENTS.findIndex((a) => a.id === id)) % (COLS * ROWS);
  const x = (i % COLS) / (COLS - 1) * 100;
  const y = Math.floor(i / COLS) / (ROWS - 1) * 100;
  const box = { xs: "size-5", sm: "size-7", md: "size-9", lg: "size-11", xl: "size-16" }[size];
  const badge = { xs: "hidden", sm: "size-2.5", md: "size-3", lg: "size-3.5", xl: "size-5" }[size];
  return (
    <span className={cn("relative inline-block shrink-0", box, muted && "opacity-50 grayscale")} aria-hidden>
      <span
        className="block size-full ring-1 ring-border"
        style={{ borderRadius: 9999, backgroundImage: `url(${portraits})`, backgroundSize: `${COLS * 100}% ${ROWS * 100}%`, backgroundPosition: `${x}% ${y}%` }}
      />
      <svg viewBox="0 0 24 24" className={cn("ai-spark absolute -right-0.5 -bottom-0.5", badge)}>
        <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12C11.4 17.8 6.2 12.6 0 12 6.2 11.4 11.4 6.2 12 0Z" />
      </svg>
    </span>
  );
}
