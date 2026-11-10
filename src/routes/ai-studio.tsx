import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUp, Check, ChevronDown, ChevronRight, CircleDashed, History, Lock, Paperclip, Plus, SlidersHorizontal, Sparkles, X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AgentMark } from "@/components/studio/agent-icon";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { COLLAB_STEPS, mockReply } from "@/lib/agent-responses";
import { AGENTS, CHANNELS, CHAT_AGENTS, CURRENT_USER, RESTRICTION_NOTE, STEPS, agentById, type AgentId } from "@/lib/studio-data";
import { actions, canChat, useStudio, type Conversation, type Message, type Mode } from "@/lib/studio-store";
import { cn } from "@/lib/utils";

type Search = { agent?: AgentId };

export const Route = createFileRoute("/ai-studio")({
  validateSearch: (s: Record<string, unknown>): Search => (typeof s["agent"] === "string" && AGENTS.some((a) => a.id === s["agent"]) ? { agent: s["agent"] as AgentId } : {}),
  head: () => ({ meta: [
    { title: "AI Studio — Directful" },
    { name: "description", content: "Work with your hotel's AI marketing team in one workspace: plan campaigns, research guests, and review drafts." },
    { property: "og:title", content: "AI Studio — Directful" },
    { property: "og:description", content: "One workspace for your hotel's AI marketing team." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: StudioPage,
});

type Pending = { convId: string; collab: boolean; done: number } | null;

function StudioPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/ai-studio" });
  const perms = useStudio((s) => s.permissions);
  const mode = useStudio((s) => s.mode);
  const conversations = useStudio((s) => s.conversations);
  const activeMap = useStudio((s) => s.active);

  const requested = search.agent ?? "marketing";
  const allowed = canChat(perms, requested, CURRENT_USER.role);
  const agentId: AgentId = allowed ? requested : "marketing";
  const agent = agentById(agentId)!;

  useEffect(() => {
    if (search.agent && !allowed) toast.error(`${agentById(search.agent)?.name} is restricted for your role`, { description: "Opened Marketing Manager instead." });
  }, [search.agent, allowed]);

  const mine = conversations.filter((c) => c.agent === agentId);
  const activeId = activeMap[agentId] ?? null;
  const active = conversations.find((c) => c.id === activeId) ?? null;
  const [pending, setPending] = useState<Pending>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const switchAgent = (id: AgentId) => {
    if (id === agentId) return;
    if (active) toast(`Your conversation with ${agent.name} is saved`, { description: "Find it again by switching back.", action: { label: "Go back", onClick: () => navigate({ search: { agent: agentId } }) } });
    navigate({ search: { agent: id } });
  };

  const send = (text: string) => {
    const t = text.trim();
    if (!t || pending) return;
    const convId = actions.send(agentId, t);
    const r = mockReply(agentId, t);
    setPending({ convId, collab: r.collaborate, done: 0 });
    if (r.collaborate) {
      COLLAB_STEPS.forEach((_, i) => setTimeout(() => setPending((p) => (p && p.convId === convId ? { ...p, done: i + 1 } : p)), 600 * (i + 1)));
    }
    setTimeout(() => {
      if (r.kind === "campaign") actions.generateDraft();
      actions.reply(convId, { kind: r.kind, text: r.text, ...(r.items ? { items: r.items } : {}) });
      setPending(null);
    }, r.collaborate ? 600 * (COLLAB_STEPS.length + 1) : 900);
  };

  const history = (
    <HistoryList agentId={agentId} items={mine} activeId={activeId} onPick={(id) => { actions.openConversation(agentId, id); setHistoryOpen(false); }} onNew={() => { actions.newConversation(agentId); setHistoryOpen(false); }} />
  );

  return (
    <div className="flex h-[calc(100vh-3rem)] md:h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card/60 lg:flex">{history}</aside>
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="left" className="w-72 p-0"><SheetHeader className="sr-only"><SheetTitle>Conversations</SheetTitle></SheetHeader><div className="flex h-full flex-col">{history}</div></SheetContent>
      </Sheet>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <button className="rounded-sm p-1.5 hover:bg-muted lg:hidden" onClick={() => setHistoryOpen(true)} aria-label="Conversations"><History className="size-4" /></button>
          <span className="truncate text-sm font-medium">{active ? active.title : "New conversation"}</span>
          <span className="truncate text-xs text-muted-foreground">· {agent.name}</span>
          {active && <Button size="sm" variant="ghost" className="ml-auto" onClick={() => actions.newConversation(agentId)}><Plus /> New with {agent.name.split(" ")[0]}</Button>}
        </header>

        <div className="studio-fade min-h-0 flex-1 overflow-y-auto" key={agentId + (active?.id ?? "new")}>
          {active ? <Thread conv={active} mode={mode} pending={pending?.convId === active.id ? pending : null} /> : <Welcome agentId={agentId} onPick={send} />}
        </div>

        <div className="shrink-0 px-4 pb-4">
          <div className="mx-auto max-w-[760px]">
            <Composer agentId={agentId} mode={mode} disabled={!!pending} onSend={send} onAgent={switchAgent} />
          </div>
        </div>
      </section>
    </div>
  );
}

function HistoryList({ agentId, items, activeId, onPick, onNew }: { agentId: AgentId; items: Conversation[]; activeId: string | null; onPick: (id: string) => void; onNew: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2 border-b px-3 py-3">
        <AgentMark id={agentId} size="sm" />
        <span className="flex-1 truncate text-sm font-medium">{agentById(agentId)?.name}</span>
        <button onClick={onNew} aria-label="New conversation" className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><Plus className="size-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="px-2 pb-1 pt-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Conversations</div>
        {items.length === 0 && <p className="px-2 py-2 text-xs text-muted-foreground">No conversations yet. Each agent keeps its own history.</p>}
        {items.map((c) => (
          <button key={c.id} onClick={() => onPick(c.id)} className={cn("block w-full rounded-sm px-2 py-2 text-left text-sm", c.id === activeId ? "bg-primary-soft text-foreground" : "hover:bg-muted")}>
            <div className="truncate">{c.title}</div>
            <div className="text-[11px] text-muted-foreground">{c.updated}</div>
          </button>
        ))}
      </div>
    </>
  );
}

function Welcome({ agentId, onPick }: { agentId: AgentId; onPick: (t: string) => void }) {
  const a = agentById(agentId)!;
  return (
    <div className="mx-auto flex min-h-full max-w-[760px] flex-col justify-end px-4 pb-6 pt-10 md:justify-center">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><AgentMark id={agentId} size="sm" /> {a.name} · {a.short.split(" · ")[0]}</div>
      <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight text-foreground md:text-[40px]">{a.welcome?.headline}</h1>
      <p className="mt-3 max-w-[560px] text-[15px] text-muted-foreground">{a.welcome?.text}</p>
      <div className="mt-8 grid gap-px overflow-hidden border bg-border sm:grid-cols-2">
        {a.welcome?.prompts.map((p) => (
          <button key={p} onClick={() => onPick(p)} className="group flex items-center justify-between gap-3 bg-card px-4 py-3 text-left text-sm hover:bg-primary-soft">
            {p}<ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Thread({ conv, mode, pending }: { conv: Conversation; mode: Mode; pending: Pending }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [conv.messages.length, pending?.done]);
  return (
    <div className="mx-auto max-w-[760px] space-y-6 px-4 py-6">
      {conv.messages.map((m) => <MessageView key={m.id} m={m} agent={conv.agent} mode={mode} />)}
      {pending && (
        <div className="flex gap-3">
          <AgentMark id={conv.agent} size="sm" />
          <div className="flex-1 pt-0.5">
            {pending.collab ? <Collaboration done={pending.done} mode={mode} live /> : <span className="studio-dots text-sm text-muted-foreground">Thinking</span>}
          </div>
        </div>
      )}
      <div ref={end} />
    </div>
  );
}

function MessageView({ m, agent, mode }: { m: Message; agent: AgentId; mode: Mode }) {
  if (m.from === "user") return <div className="flex justify-end"><div className="max-w-[80%] rounded-md bg-muted px-3.5 py-2 text-sm whitespace-pre-wrap">{m.text}</div></div>;
  return (
    <div className="flex gap-3">
      <AgentMark id={agent} size="sm" />
      <div className="min-w-0 flex-1 space-y-3 pt-0.5 text-sm leading-relaxed">
        <div className="text-xs font-medium text-muted-foreground">{agentById(agent)?.name}</div>
        {m.kind === "campaign" && <Collaboration done={COLLAB_STEPS.length} mode={mode} />}
        <p>{m.text}</p>
        {m.items && <ol className="space-y-1.5">{m.items.map((it, i) => <li key={it} className="flex gap-2"><span className="num w-4 shrink-0 text-muted-foreground">{i + 1}.</span>{it}</li>)}</ol>}
        {m.kind === "campaign" && <DraftCard />}
        {mode === "expert" && m.kind !== "campaign" && <p className="text-[11px] text-muted-foreground">Sources: Brand voice · Rate protection rules · Guest database (Nov 9)</p>}
      </div>
    </div>
  );
}

function Collaboration({ done, mode, live }: { done: number; mode: Mode; live?: boolean }) {
  const [open, setOpen] = useState(false);
  const complete = done >= COLLAB_STEPS.length;
  return (
    <div className="border bg-card">
      <button onClick={() => mode === "expert" && setOpen((o) => !o)} className={cn("flex w-full items-center gap-2 px-3 py-2 text-left text-xs", mode === "expert" && "hover:bg-muted/60")}>
        <Sparkles className="size-3.5 text-primary" />
        <span className="font-medium">{complete ? "Worked with your AI team" : "Working with your AI team"}</span>
        <span className="text-muted-foreground">· {Math.min(done, COLLAB_STEPS.length)}/{COLLAB_STEPS.length}</span>
        {mode === "expert" && <ChevronDown className={cn("ml-auto size-3.5 transition-transform", open && "rotate-180")} />}
      </button>
      {(live || mode === "expert" || !complete) && (
        <ul className="border-t px-3 py-2">
          {COLLAB_STEPS.map((s, i) => (
            <li key={s.agent} className="py-1 text-xs">
              <div className="flex items-center gap-2">
                {i < done ? <Check className="size-3.5 text-success" /> : <CircleDashed className={cn("size-3.5 text-muted-foreground", i === done && "animate-spin")} />}
                <span className="font-medium">{agentById(s.agent)?.name}</span>
                <span className="text-muted-foreground">— {i < done ? s.summary : i === done ? "working…" : "waiting"}</span>
              </div>
              {open && i < done && <p className="ml-5.5 mt-1 pl-0.5 text-muted-foreground">{s.detail}</p>}
            </li>
          ))}
        </ul>
      )}
      {mode === "simple" && complete && !live && <p className="border-t px-3 py-2 text-xs text-muted-foreground">Audience, offer, brand voice and messaging rules were checked.</p>}
    </div>
  );
}

function DraftCard() {
  const d = useStudio((s) => s.draft);
  return (
    <div className="studio-fade border bg-card shadow-card">
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div>
          <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Campaign draft</div>
          <div className="mt-0.5 font-medium">{d.name}</div>
        </div>
        <span className={cn("shrink-0 rounded-sm px-2 py-0.5 text-[11px] font-medium", d.status.startsWith("Approved") ? "bg-success-soft text-success" : "bg-warning-soft text-warning")}>{d.status.startsWith("Approved") ? "Approved" : "Not sent · Needs approval"}</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3 text-xs sm:grid-cols-4">
        <div><dt className="text-muted-foreground">Audience</dt><dd className="num mt-0.5 text-sm">{d.eligible.toLocaleString()} guests</dd></div>
        <div><dt className="text-muted-foreground">Channels</dt><dd className="mt-0.5 text-sm">{d.channels.map((c) => CHANNELS.find((x) => x.id === c)?.label).join(" + ")}</dd></div>
        <div><dt className="text-muted-foreground">Sequence</dt><dd className="mt-0.5 text-sm">{STEPS.length} messages</dd></div>
        <div><dt className="text-muted-foreground">Offer</dt><dd className="mt-0.5 text-sm">{d.offer}</dd></div>
      </dl>
      <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3">
        <Button asChild size="sm"><Link to="/campaigns/draft">Review draft</Link></Button>
        <Button asChild size="sm" variant="outline"><Link to="/campaigns/draft/edit" search={{}}>Edit</Link></Button>
        <Button asChild size="sm" variant="ghost"><Link to="/campaigns/draft/preview" search={{}}>Preview</Link></Button>
        <span className="ml-auto text-xs text-muted-foreground">Nothing is sent until you approve.</span>
      </div>
    </div>
  );
}

function Composer({ agentId, mode, disabled, onSend, onAgent }: { agentId: AgentId; mode: Mode; disabled: boolean; onSend: (t: string) => void; onAgent: (id: AgentId) => void }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const a = agentById(agentId)!;
  useEffect(() => { const el = ref.current; if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 200) + "px"; } }, [text]);
  useEffect(() => { ref.current?.focus(); }, [agentId]);
  const submit = () => { if (!text.trim() || disabled) return; onSend(files.length ? `${text}\n\n📎 ${files.join(", ")}` : text); setText(""); setFiles([]); };
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <AgentPicker agentId={agentId} onPick={onAgent} />
        <ModePicker mode={mode} />
      </div>
      <div className="composer border bg-card shadow-card transition-shadow focus-within:border-primary/50">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3 pt-3">
            {files.map((f) => <span key={f} className="flex items-center gap-1 rounded-sm bg-muted px-2 py-1 text-xs">{f}<button aria-label={`Remove ${f}`} onClick={() => setFiles((fs) => fs.filter((x) => x !== f))}><X className="size-3" /></button></span>)}
          </div>
        )}
        <textarea
          ref={ref} rows={1} value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder={`Tell your ${a.name} what you want to achieve…`}
          className="block w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[15px] outline-none placeholder:text-muted-foreground"
          aria-label="Message"
        />
        <div className="flex items-center gap-1 px-2 pb-2">
          <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => { setFiles((fs) => [...fs, ...Array.from(e.target.files ?? []).map((f) => f.name)]); e.target.value = ""; }} />
          <button onClick={() => fileRef.current?.click()} aria-label="Attach files" className="rounded-sm p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Paperclip className="size-4" /></button>
          <span className="hidden truncate text-xs text-muted-foreground sm:block">{agentId === "marketing" ? "Your AI team can collaborate to help complete this task." : "Enter to send · Shift + Enter for a new line"}</span>
          <button onClick={submit} disabled={!text.trim() || disabled} aria-label="Send" className="ml-auto grid size-8 place-items-center rounded-sm bg-primary text-primary-foreground transition-opacity hover:bg-primary-hover disabled:opacity-30"><ArrowUp className="size-4" /></button>
        </div>
      </div>
    </div>
  );
}

function AgentPicker({ agentId, onPick }: { agentId: AgentId; onPick: (id: AgentId) => void }) {
  const perms = useStudio((s) => s.permissions);
  const a = agentById(agentId)!;
  const list = useMemo(() => CHAT_AGENTS.map((x) => ({ ...x, ok: canChat(perms, x.id, CURRENT_USER.role) })), [perms]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 items-center gap-2 rounded-sm border bg-card px-2 text-sm font-medium hover:bg-muted data-[state=open]:bg-muted">
        <AgentMark id={agentId} size="sm" /> {a.name} <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-[340px] p-1">
        <DropdownMenuLabel className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Chat with</DropdownMenuLabel>
        {list.map((x) => (
          <DropdownMenuItem key={x.id} disabled={!x.ok} onSelect={() => x.ok && onPick(x.id)} className="items-start gap-3 py-2 data-[disabled]:opacity-100">
            <AgentMark id={x.id} size="sm" muted={!x.ok} />
            <div className={cn("min-w-0 flex-1", !x.ok && "text-muted-foreground")}>
              <div className="flex items-center gap-1.5 text-sm font-medium">{x.name}{!x.ok && <Lock className="size-3" />}</div>
              <div className="text-xs text-muted-foreground">{x.ok ? x.short : RESTRICTION_NOTE}</div>
            </div>
            {x.id === agentId ? <Check className="mt-1 size-4 text-primary" /> : x.ok && <span className="mt-1.5 size-1.5 rounded-full bg-success" title="Available" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-[11px] text-muted-foreground">Marketing Manager can still involve restricted specialists behind the scenes.</p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ModePicker({ mode }: { mode: Mode }) {
  const opts: { id: Mode; label: string; sub: string }[] = [
    { id: "simple", label: "Simple", sub: "Guided experience · plain language and recommended defaults" },
    { id: "expert", label: "Expert", sub: "Advanced workspace · sources, agent details and granular settings" },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-sm border bg-card px-2 text-sm hover:bg-muted data-[state=open]:bg-muted">
        <SlidersHorizontal className="size-3.5 text-muted-foreground" /> {mode === "simple" ? "Simple" : "Expert"} <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-[300px] p-1">
        <DropdownMenuLabel className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Experience</DropdownMenuLabel>
        {opts.map((o) => (
          <DropdownMenuItem key={o.id} onSelect={() => actions.setMode(o.id)} className="items-start gap-2 py-2">
            <div className="flex-1"><div className="text-sm font-medium">{o.label}</div><div className="text-xs text-muted-foreground">{o.sub}</div></div>
            {mode === o.id && <Check className="mt-0.5 size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-[11px] text-muted-foreground">Changes detail only. Your agent and conversation stay the same.</p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
