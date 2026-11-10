import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AgentMark } from "@/components/studio/agent-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AGENTS, CURRENT_USER, type AgentId, type Capability } from "@/lib/studio-data";
import { canChat, useStudio } from "@/lib/studio-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/marketplace/")({
  head: () => ({ meta: [
    { title: "Agent Marketplace — Directful" },
    { name: "description", content: "Discover, configure, and manage the AI agents supporting your hotel's marketing and operations." },
    { property: "og:title", content: "Agent Marketplace — Directful" },
    { property: "og:description", content: "Your hotel's AI workforce in one directory." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Marketplace,
});

const CAPS: Capability[] = ["Lead", "Plan & Target", "Creator", "Autopilot", "Check & Test", "Chat"];

function Marketplace() {
  const perms = useStudio((s) => s.permissions);
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("all");
  const [cap, setCap] = useState("all");
  const [avail, setAvail] = useState("all");
  const list = useMemo(() => AGENTS.filter((a) =>
    (!q || (a.name + a.description).toLowerCase().includes(q.toLowerCase())) &&
    (tier === "all" || a.tier === tier) &&
    (cap === "all" || a.capabilities.includes(cap as Capability)) &&
    (avail === "all" || a.status === avail)), [q, tier, cap, avail]);

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-semibold tracking-tight">Your AI workforce</h1>
      <p className="mt-1 max-w-[620px] text-sm text-muted-foreground">Discover, configure, and manage the agents supporting your hotel's marketing and operations.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1"><Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agents" className="pl-8" aria-label="Search agents" /></div>
        <Filter value={tier} onChange={setTier} label="Tier" options={["Core", "Add-on"]} />
        <Filter value={cap} onChange={setCap} label="Capability" options={CAPS} />
        <Filter value={avail} onChange={setAvail} label="Availability" options={["Available", "Not activated", "Coming soon"]} />
      </div>

      {list.length === 0 && <p className="mt-10 text-center text-sm text-muted-foreground">No agents match these filters.</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => {
          const chat = a.chatAccessible && a.status === "Available";
          const allowed = chat && canChat(perms, a.id, CURRENT_USER.role);
          return (
            <article key={a.id} className={cn("flex flex-col border bg-card p-4 shadow-card", a.status !== "Available" && "bg-card/70")}>
              <div className="flex items-start gap-3">
                <AgentMark id={a.id} muted={a.status === "Coming soon"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2"><h2 className="truncate font-medium">{a.name}</h2><span className={cn("shrink-0 rounded-sm px-1.5 py-0.5 text-[11px] font-medium", a.tier === "Core" ? "bg-primary-soft text-primary" : "bg-highlight/20 text-highlight-foreground")}>{a.tier}</span></div>
                  <StatusDot status={a.status} />
                </div>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{a.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">{a.capabilities.map((c) => <span key={c} className="rounded-sm border px-1.5 py-0.5 text-[11px] text-muted-foreground">{c}</span>)}</div>
              <div className="mt-auto flex items-center gap-2 pt-4">
                {a.status === "Not activated" ? <Button size="sm" onClick={() => toast.success(`Activation request sent for ${a.name}`, { description: "Your Hotel Admin will confirm pricing." })}>Request activation</Button>
                  : a.status === "Coming soon" ? <Button size="sm" variant="outline" onClick={() => toast(`We'll let you know when ${a.name} is ready`)}>Notify me</Button>
                  : allowed ? <Button asChild size="sm"><Link to="/ai-studio" search={{ agent: a.id as AgentId }}>Ask agent</Link></Button>
                  : chat ? <span className="flex items-center gap-1 text-xs text-muted-foreground" title="Ask a Hotel Admin for access"><Lock className="size-3" /> Restricted for your role</span>
                  : <span className="text-xs text-muted-foreground">Works behind the scenes</span>}
                <Button asChild size="sm" variant="ghost"><Link to="/marketplace/$agentId" params={{ agentId: a.id }}>Details & settings</Link></Button>
                {a.price && <span className="ml-auto text-xs text-muted-foreground">{a.price}</span>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function StatusDot({ status }: { status: string }) {
  return <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><span className={cn("size-1.5 rounded-full", status === "Available" ? "bg-success" : status === "Not activated" ? "bg-warning" : "bg-track")} />{status}</span>;
}

function Filter({ value, onChange, label, options }: { value: string; onChange: (v: string) => void; label: string; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-auto min-w-[140px]" aria-label={label}><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="all">All {label.toLowerCase()}</SelectItem>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  );
}
