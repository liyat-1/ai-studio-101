import {
  ChartNoAxesCombined, Compass, Fingerprint, ListChecks, MessagesSquare, Repeat, ScanSearch, ShieldCheck, Sparkles, TrendingUp, UsersRound, Workflow, type LucideIcon,
} from "lucide-react";
import { agentById } from "@/lib/studio-data";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = { ChartNoAxesCombined, Compass, Fingerprint, ListChecks, MessagesSquare, Repeat, ScanSearch, ShieldCheck, Sparkles, TrendingUp, UsersRound, Workflow };

export function AgentMark({ id, size = "md", muted }: { id: string; size?: "sm" | "md" | "lg"; muted?: boolean }) {
  const a = agentById(id);
  const Icon = ICONS[a?.icon ?? "Compass"] ?? Compass;
  return (
    <span
      className={cn(
        "agent-mark grid shrink-0 place-items-center rounded-sm border",
        id === "marketing" && !muted ? "agent-mark-lead" : "",
        muted && "opacity-50",
        size === "sm" ? "size-6" : size === "lg" ? "size-11" : "size-8",
      )}
      aria-hidden
    >
      <Icon className={size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4"} strokeWidth={1.75} />
    </span>
  );
}
