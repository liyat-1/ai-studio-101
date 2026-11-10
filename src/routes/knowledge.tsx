import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileText, Globe, Image as ImageIcon, Loader2, Plus, Search, Type, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AgentMark } from "@/components/studio/agent-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { KB_CATEGORIES, agentById, type GuestQuestion, type KnowledgeCategory, type KnowledgeSource, type SourceStatus } from "@/lib/studio-data";
import { actions, newId, useStudio } from "@/lib/studio-store";
import { cn } from "@/lib/utils";

type Search = { cat?: KnowledgeCategory };

export const Route = createFileRoute("/knowledge")({
  validateSearch: (s: Record<string, unknown>): Search => (KB_CATEGORIES.some((c) => c.id === s["cat"]) ? { cat: s["cat"] as KnowledgeCategory } : {}),
  head: () => ({ meta: [
    { title: "Knowledge Base — Directful" },
    { name: "description", content: "Property information, brand resources, and policies your AI team uses to work accurately." },
    { property: "og:title", content: "Knowledge Base — Directful" },
    { property: "og:description", content: "The shared source of truth for your hotel's AI team." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: KnowledgePage,
});

const statusCls: Record<SourceStatus, string> = {
  Active: "bg-success-soft text-success", Processing: "bg-primary-soft text-primary", "Needs review": "bg-warning-soft text-warning", Inactive: "bg-muted text-muted-foreground",
};
const typeIcon = { Text: Type, Document: FileText, URL: Globe, Image: ImageIcon };

function KnowledgePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/knowledge" });
  const cat = search.cat ?? "property";
  const sources = useStudio((s) => s.knowledge);
  const questions = useStudio((s) => s.questions);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const list = useMemo(() => sources.filter((k) => k.category === cat && (!q || (k.name + k.content).toLowerCase().includes(q.toLowerCase()))), [sources, cat, q]);
  const current = sources.find((k) => k.id === open) ?? null;
  const count = (c: KnowledgeCategory) => (c === "questions" ? questions.filter((x) => x.status !== "Approved").length : sources.filter((k) => k.category === c).length);

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
          <p className="mt-1 max-w-[620px] text-sm text-muted-foreground">Give your AI team the property information, brand resources, and policies they need to work accurately.</p>
        </div>
        {cat !== "questions" && <Button onClick={() => setAdding(true)}><Plus /> Add source</Button>}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[250px_1fr]">
        <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Knowledge categories">
          {KB_CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => navigate({ search: { cat: c.id }, replace: true })} className={cn("flex items-center justify-between gap-3 whitespace-nowrap rounded-sm px-3 py-2 text-left text-sm md:whitespace-normal", cat === c.id ? "bg-primary-soft font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              {c.label}<span className={cn("num text-xs", c.id === "questions" && count(c.id) > 0 && "text-warning")}>{count(c.id)}</span>
            </button>
          ))}
        </nav>

        <section className="min-w-0">
          {cat === "questions" ? <Questions items={questions} /> : (
            <>
              <div className="relative mb-3"><Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sources" className="pl-8" aria-label="Search sources" /></div>
              {list.length === 0 ? <p className="border bg-card px-4 py-10 text-center text-sm text-muted-foreground">No sources here yet. Add a document, website, or note so your AI team can use it.</p> : (
                <ul className="divide-y border bg-card">
                  {list.map((k) => {
                    const Icon = typeIcon[k.type];
                    return (
                      <li key={k.id}>
                        <button onClick={() => setOpen(k.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50">
                          <Icon className="size-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{k.name}</div><div className="truncate text-xs text-muted-foreground">{k.type} · Updated {k.updated} · {k.agents.length} agents can use</div></div>
                          <span className={cn("flex shrink-0 items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-medium", statusCls[k.status])}>{k.status === "Processing" && <Loader2 className="size-3 animate-spin" />}{k.status}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </section>
      </div>

      <SourceSheet source={current} onClose={() => setOpen(null)} />
      <AddSource open={adding} onOpenChange={setAdding} category={cat} />
    </div>
  );
}

function SourceSheet({ source, onClose }: { source: KnowledgeSource | null; onClose: () => void }) {
  const [draft, setDraft] = useState("");
  const [lastId, setLastId] = useState<string | null>(null);
  if (source && source.id !== lastId) { setLastId(source.id); setDraft(source.content); }
  return (
    <Sheet open={!!source} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[460px]">
        {source && (
          <>
            <SheetHeader><SheetTitle>{source.name}</SheetTitle><SheetDescription>{source.type} · Updated {source.updated}</SheetDescription></SheetHeader>
            <div className="mt-5 space-y-5 px-4 pb-6">
              <label className="flex items-center justify-between gap-3 border px-3 py-2.5 text-sm">
                <span>Active<span className="block text-xs text-muted-foreground">Inactive sources are ignored by every agent.</span></span>
                <Switch checked={source.status !== "Inactive"} disabled={source.status === "Processing"} onCheckedChange={(v) => actions.upsertSource({ ...source, status: v ? "Active" : "Inactive" })} />
              </label>
              <div>
                <div className="mb-1 text-xs font-medium text-muted-foreground">Content</div>
                <Textarea rows={7} value={draft} onChange={(e) => setDraft(e.target.value)} />
                <div className="mt-2 flex gap-2">
                  <Button size="sm" disabled={draft === source.content} onClick={() => { actions.upsertSource({ ...source, content: draft, updated: "Just now", status: source.status === "Needs review" ? "Active" : source.status }); toast.success("Source updated"); }}>Save changes</Button>
                  {source.status === "Needs review" && draft === source.content && <Button size="sm" variant="outline" onClick={() => actions.upsertSource({ ...source, status: "Active" })}>Mark reviewed</Button>}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">Agents that can use this</div>
                {source.agents.length === 0 ? <p className="text-sm text-muted-foreground">No agents yet.</p> : (
                  <ul className="space-y-1.5">{source.agents.map((a) => <li key={a} className="flex items-center gap-2 text-sm"><AgentMark id={a} size="sm" />{agentById(a)?.name}</li>)}</ul>
                )}
                <p className="mt-2 text-xs text-muted-foreground">Change access from each agent's settings in the Agent Marketplace.</p>
              </div>
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { actions.removeSource(source.id); onClose(); toast("Source removed"); }}>Remove source</Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function AddSource({ open, onOpenChange, category }: { open: boolean; onOpenChange: (o: boolean) => void; category: KnowledgeCategory }) {
  const [kind, setKind] = useState<"Document" | "URL" | "Text">("Document");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const reset = () => { setName(""); setValue(""); setKind("Document"); };
  const valid = kind === "Document" ? !!name : kind === "URL" ? /\./.test(value) : !!name && !!value;
  const add = () => {
    const id = newId();
    const src: KnowledgeSource = { id, category, name: kind === "URL" ? value.replace(/^https?:\/\//, "") : name, type: kind, status: "Processing", updated: "Just now", content: kind === "Text" ? value : kind === "URL" ? `Website content from ${value}` : `Uploaded file ${name}`, agents: ["marketing"] };
    actions.upsertSource(src);
    setTimeout(() => actions.upsertSource({ ...src, status: kind === "Text" ? "Active" : "Needs review", content: kind === "URL" ? `Website content crawled from ${value}. 12 pages found.` : src.content }), 3000);
    toast("Processing source…", { description: "Your AI team can use it once it's ready." });
    onOpenChange(false); reset();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add a source</DialogTitle><DialogDescription>Added to {KB_CATEGORIES.find((c) => c.id === category)?.label}.</DialogDescription></DialogHeader>
        <div className="inline-flex rounded-sm border p-0.5">
          {(["Document", "URL", "Text"] as const).map((k) => <button key={k} onClick={() => setKind(k)} className={cn("rounded-[2px] px-3 py-1.5 text-sm", kind === k ? "bg-sidebar text-sidebar-accent-foreground" : "text-muted-foreground")}>{k === "Document" ? "Upload file" : k === "URL" ? "Website URL" : "Text"}</button>)}
        </div>
        {kind === "Document" && (
          <>
            <input ref={fileRef} type="file" className="hidden" onChange={(e) => setName(e.target.files?.[0]?.name ?? "")} />
            <button onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-2 border border-dashed px-4 py-8 text-sm text-muted-foreground hover:bg-muted/50">
              <Upload className="size-5" />{name || "Choose a PDF, Word or Excel file"}
            </button>
          </>
        )}
        {kind === "URL" && <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="https://meridian-addis.com/dining" aria-label="Website URL" />}
        {kind === "Text" && <><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Title, e.g. Pool hours" aria-label="Title" /><Textarea rows={4} value={value} onChange={(e) => setValue(e.target.value)} placeholder="The rooftop pool is open daily from 7:00 to 21:00." aria-label="Content" /></>}
        <DialogFooter><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={!valid} onClick={add}>Add source</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Questions({ items }: { items: GuestQuestion[] }) {
  const [filter, setFilter] = useState<"all" | GuestQuestion["status"]>("all");
  const shown = items.filter((x) => filter === "all" || x.status === filter);
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1">
        {(["all", "Unanswered", "Needs review", "Approved"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("rounded-sm border px-2.5 py-1 text-xs", filter === f ? "border-primary bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground")}>
            {f === "all" ? "All" : f} <span className="num">{f === "all" ? items.length : items.filter((x) => x.status === f).length}</span>
          </button>
        ))}
      </div>
      <ul className="space-y-2">{shown.map((x) => <QuestionRow key={x.id} q={x} />)}</ul>
    </div>
  );
}

function QuestionRow({ q }: { q: GuestQuestion }) {
  const [editing, setEditing] = useState(false);
  const [answer, setAnswer] = useState(q.a ?? "");
  return (
    <li className={cn("border bg-card p-4", q.status === "Unanswered" && "border-l-2 border-l-warning")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><div className="text-sm font-medium">{q.q}</div><div className="text-xs text-muted-foreground">Asked {q.asked} times</div></div>
        <span className={cn("rounded-sm px-2 py-0.5 text-[11px] font-medium", q.status === "Approved" ? statusCls.Active : q.status === "Unanswered" ? statusCls["Needs review"] : statusCls.Processing)}>{q.status}</span>
      </div>
      {editing ? (
        <div className="mt-3 space-y-2">
          <Textarea rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write the approved answer guests should receive." />
          <div className="flex gap-2"><Button size="sm" disabled={!answer.trim()} onClick={() => { actions.updateQuestion({ ...q, a: answer, status: "Approved" }); setEditing(false); toast.success("Answer approved"); }}>Approve answer</Button><Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button></div>
        </div>
      ) : (
        <>
          {q.a ? <p className="mt-2 text-sm text-muted-foreground">{q.a}</p> : <p className="mt-2 text-sm text-warning">No approved answer yet — the Reply Agent hands this to your team.</p>}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>{q.a ? "Edit answer" : "Write answer"}</Button>
            {q.status === "Needs review" && <Button size="sm" variant="ghost" onClick={() => actions.updateQuestion({ ...q, status: "Approved" })}>Approve as is</Button>}
            <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">Auto-respond
              <Switch checked={q.auto} disabled={q.status !== "Approved"} onCheckedChange={(v) => actions.updateQuestion({ ...q, auto: v })} aria-label={`Auto-respond to ${q.q}`} />
            </label>
          </div>
        </>
      )}
    </li>
  );
}
