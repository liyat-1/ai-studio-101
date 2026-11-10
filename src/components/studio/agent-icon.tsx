import {
  ChartNoAxesCombined, Compass, Fingerprint, ListChecks, MessagesSquare, Repeat, ScanSearch, ShieldCheck, Sparkles, TrendingUp, UsersRound, Workflow, type LucideIcon,
} from "lucide-react";
import { agentById } from "@/lib/studio-data";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = { ChartNoAxesCombined, Compass, Fingerprint, ListChecks, MessagesSquare, Repeat, ScanSearch, ShieldCheck, Sparkles, TrendingUp, UsersRound, Workflow };
const ORB = new Set(["marketing", "revenue", "research", "brand", "results", "compliance", "reply", "operations"]);

/** Glossy gradient avatar per agent; the icon describes the agent's job. */
export function AgentMark({ id, size = "md", muted }: { id: string; size?: "xs" | "sm" | "md" | "lg" | "xl"; muted?: boolean | undefined }) {
  const a = agentById(id);
  const Icon = ICONS[a?.icon ?? "Compass"] ?? Compass;
  const box = { xs: "size-5", sm: "size-7", md: "size-9", lg: "size-12", xl: "size-16" }[size];
  const icon = { xs: "size-3", sm: "size-3.5", md: "size-4", lg: "size-5", xl: "size-7" }[size];
  return (
    <span className={cn("orb grid shrink-0 place-items-center rounded-[32%]", ORB.has(id) ? `orb-${id}` : "orb-other", muted && "orb-muted", box)} aria-hidden>
      <Icon className={icon} strokeWidth={2} />
    </span>
  );
}
