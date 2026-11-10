import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AgentMark } from "@/components/studio/agent-icon";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AGENT_ACTIVITY, COLLABORATION, CURRENT_USER, KB_CATEGORIES, ROLES, agentById, type AgentId, type AgentPermissions } from "@/lib/studio-data";
import { actions, canChat, useStudio } from "@/lib/studio-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/marketplace/$agentId")({
  loader: ({ params }) => { const a = agentById(params.agentId); if (!a) throw notFound(); return { name: a.name, description: a.description }; },
  head: ({ loaderData }) => ({ meta: loaderData ? [
    { title: `${loaderData.name} — Agent Settings — Directful` },
    { name: "description", content: loaderData.description },
    { property: "og:title", content: `${loaderData.name} — Directful` },
    { property: "og:description", content: loaderData.description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] : [{ title: "Agent not found — Directful" }, { name: "robots", content: "noindex" }] }),
  notFoundComponent: () => <div className="p-10 text-sm">That agent doesn't exist. <Link to="/marketplace" className="text-primary underline">Back to the marketplace</Link></div>,
  component: AgentDetails,
});

const TABS = ["Overview", "Permissions", "Instructions", "Knowledge Access", "Activity"] as const;
type Tab = (typeof TABS)[number];

function AgentDetails() {
  const { agentId } = Route.useParams();
  const a = agentById(agentId)!;
  const id = a.id as AgentId;
  const [tab, setTab] = useState<Tab>("Overview");
  const perms = useStudio((s) => s.permissions);
  const allowed = a.status === "Available" && canChat(perms, id, CURRENT_USER.role);

  return (
    <div className="mx-auto max-w-[920px] px-5 py-6 lg:px-10">
      <Link to="/marketplace" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" /> Agent Marketplace</Link>
      <div className="mt-4 flex flex-wrap items-start gap-4">
        <AgentMark id={id} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{a.name}</h1>
          <p className="text-sm text-muted-foreground">{a.short}</p>
        </div>
        {allowed && <Button asChild><Link to="/ai-studio" search={{ agent: id }}>Ask agent</Link></Button>}
      </div>

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b" aria-label="Agent settings">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn("-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm", tab === t ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>)}
      </nav>

      <div className="studio-fade py-6" key={tab}>
        {tab === "Overview" && (
          <dl className="grid gap-px overflow-hidden border bg-border text-sm sm:grid-cols-2">
            <Row label="Role">{a.short.split(" · ")[0]}</Row>
            <Row label="Tier">{a.tier}{a.price ? ` · ${a.price}` : ""}</Row>
            <Row label="Availability">{a.status}</Row>
            <Row label="Direct chat">{a.chatAccessible ? "Yes, in AI Studio" : "No — works behind the scenes"}</Row>
            <Row label="Capabilities">{a.capabilities.join(" · ")}</Row>
            <Row label="Works with">{(COLLABORATION[id] ?? []).map((x) => agentById(x)?.name).join(", ") || (id === "marketing" ? "—" : "Called by Marketing Manager")}</Row>
            <div className="bg-card px-4 py-3 sm:col-span-2"><dt className="text-xs text-muted-foreground">Description</dt><dd className="mt-1">{a.description}</dd></div>
          </dl>
        )}
        {tab === "Permissions" && <Permissions id={id} chatAccessible={a.chatAccessible} />}
        {tab === "Instructions" && <Instructions id={id} />}
        {tab === "Knowledge Access" && <KnowledgeAccess id={id} />}
        {tab === "Activity" && (
          <ol className="border bg-card">
            {(AGENT_ACTIVITY[id] ?? AGENT_ACTIVITY["default"]!).map((x) => <li key={x.what + x.when} className="flex justify-between gap-3 border-b px-4 py-2.5 text-sm last:border-b-0"><span>{x.what}</span><span className="shrink-0 text-xs text-muted-foreground">{x.when}</span></li>)}
          </ol>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="bg-card px-4 py-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1">{children}</dd></div>;
}

function Permissions({ id, chatAccessible }: { id: AgentId; chatAccessible: boolean }) {
  const saved = useStudio((s) => s.permissions[id]);
  const [p, setP] = useState<AgentPermissions>(saved);
  const dirty = JSON.stringify(p) !== JSON.stringify(saved);
  const cols = [["chat", "Can chat"], ["configure", "Can configure"], ["inspect", "Can inspect activity"]] as const;
  return (
    <div className="space-y-4">
      <table className="w-full border bg-card text-sm">
        <thead className="border-b bg-muted/60 text-xs text-muted-foreground"><tr><th className="px-4 py-2 text-left font-medium">Role</th>{cols.map(([, l]) => <th key={l} className="px-4 py-2 text-left font-medium">{l}</th>)}</tr></thead>
        <tbody className="divide-y">
          {ROLES.map((r) => (
            <tr key={r}>
              <td className="px-4 py-2.5">{r}{r === CURRENT_USER.role && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}</td>
              {cols.map(([k]) => (
                <td key={k} className="px-4 py-2.5">
                  <Switch aria-label={`${r} ${k}`} disabled={k === "chat" && !chatAccessible} checked={p[r][k]} onCheckedChange={(v) => setP({ ...p, [r]: { ...p[r], [k]: v } })} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="flex gap-2 text-xs text-muted-foreground"><Info className="size-3.5 shrink-0" />Direct chat access is separate from teamwork: the Marketing Manager can still involve this agent even when a role can't chat with it.</p>
      <div className="flex gap-2">
        <Button disabled={!dirty} onClick={() => { actions.setPermissions(id, p); toast.success("Permissions saved"); }}>Save permissions</Button>
        {dirty && <Button variant="ghost" onClick={() => setP(saved)}>Discard</Button>}
      </div>
    </div>
  );
}

function Instructions({ id }: { id: AgentId }) {
  const saved = useStudio((s) => s.instructions[id] ?? "");
  const [text, setText] = useState(saved);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Property-specific guidance this agent follows on every task.</p>
      <Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Prioritize direct bookings. Never recommend promotions below the approved rate floor." />
      <Button disabled={text === saved} onClick={() => { actions.setInstructions(id, text); toast.success("Instructions saved"); }}>Save instructions</Button>
    </div>
  );
}

function KnowledgeAccess({ id }: { id: AgentId }) {
  const sources = useStudio((s) => s.knowledge);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Choose which shared sources from the <Link to="/knowledge" search={{}} className="text-primary hover:underline">Knowledge Base</Link> this agent can use. Content is managed there.</p>
      <ul className="divide-y border bg-card">
        {sources.filter((k) => k.category !== "questions").map((k) => (
          <li key={k.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <div className="min-w-0 flex-1"><div className="truncate">{k.name}</div><div className="text-xs text-muted-foreground">{KB_CATEGORIES.find((c) => c.id === k.category)?.label} · {k.status}</div></div>
            <Switch aria-label={`Access to ${k.name}`} checked={k.agents.includes(id)} onCheckedChange={() => actions.toggleAccess(k.id, id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
