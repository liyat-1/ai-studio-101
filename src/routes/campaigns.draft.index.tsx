import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Check, Eye, FlaskConical, Pencil } from "lucide-react";
import { useState } from "react";
import { AgentMark } from "@/components/studio/agent-icon";
import { ApproveDialog } from "@/components/studio/approve-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COLLAB_STEPS } from "@/lib/agent-responses";
import { contentChecks } from "@/lib/campaign-checks";
import { AUDIENCES, CHANNELS, OFFERS, STEPS, TIMINGS, agentById, fillGuest, type Channel, type StepContent } from "@/lib/studio-data";
import { actions, useStudio } from "@/lib/studio-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/campaigns/draft/")({
  head: () => ({ meta: [
    { title: "Campaign Draft — Directful" },
    { name: "description", content: "Review an AI-prepared campaign draft before approving it." },
    { property: "og:title", content: "Campaign Draft — Directful" },
    { property: "og:description", content: "Review an AI-prepared campaign draft before approving it." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: DraftOverview,
});

const excerpt = (s: StepContent, c: Channel) =>
  fillGuest(c === "email" ? s.email.subject : c === "sms" ? s.sms.text : c === "rcs" ? s.rcs.title + " — " + s.rcs.text : c === "whatsapp" ? s.whatsapp.text : s.voice.script);

function DraftOverview() {
  const d = useStudio((s) => s.draft);
  const mode = useStudio((s) => s.mode);
  const [approve, setApprove] = useState(false);
  const approved = d.status.startsWith("Approved");
  const issues = d.steps.flatMap((s, i) => d.channels.flatMap((c) => contentChecks(s, c, i).filter((x) => x.status === "Needs attention").map((x) => ({ ...x, where: `${STEPS[i]} · ${CHANNELS.find((y) => y.id === c)?.label}` }))));
  const toggleChannel = (c: Channel) => actions.updateDraft({ channels: d.channels.includes(c) ? (d.channels.length > 1 ? d.channels.filter((x) => x !== c) : d.channels) : [...d.channels, c] });

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-6 lg:px-10">
      <Link to="/ai-studio" search={{ agent: "marketing" }} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" /> Back to conversation</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{d.name}</h1>
          </div>
          <p className={cn("mt-1 text-sm", approved ? "text-success" : "text-warning")}>{d.status}{!approved && " — nothing has been sent"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link to="/campaigns/draft/preview" search={{}}><Eye /> Preview</Link></Button>
          <Button asChild variant="outline"><Link to="/campaigns/draft/edit" search={{ tab: "test" }}><FlaskConical /> Test</Link></Button>
          <Button asChild variant="outline"><Link to="/campaigns/draft/edit" search={{}}><Pencil /> Edit campaign</Link></Button>
          <Button onClick={() => setApprove(true)} disabled={approved}>{approved ? <><Check /> Approved</> : "Approve & send"}</Button>
        </div>
      </div>

      <section className="mt-6 grid gap-px overflow-hidden border bg-border text-sm sm:grid-cols-3 lg:grid-cols-6">
        <Fact label="Objective" wide>{d.objective}</Fact>
        <Fact label="Audience">
          {mode === "expert" ? (
            <Select value={d.audience} onValueChange={(v) => actions.updateDraft({ audience: v, eligible: AUDIENCES.find((a) => a.id === v)!.count })}>
              <SelectTrigger className="h-7 px-2 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{AUDIENCES.map((a) => <SelectItem key={a.id} value={a.id}>{a.id} · {a.count.toLocaleString()}</SelectItem>)}</SelectContent>
            </Select>
          ) : d.audience}
        </Fact>
        <Fact label="Eligible guests"><span className="num">{d.eligible.toLocaleString()}</span></Fact>
        <Fact label="Offer">
          <Select value={d.offer} onValueChange={(v) => actions.updateDraft({ offer: v })}>
            <SelectTrigger className="h-7 px-2 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{OFFERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </Fact>
        <Fact label="Timing">
          <Select value={d.timing} onValueChange={(v) => actions.updateDraft({ timing: v })}>
            <SelectTrigger className="h-7 px-2 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{TIMINGS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </Fact>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <section>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">Sequence · {STEPS.length} messages</h2>
            <div className="flex flex-wrap gap-1">
              {CHANNELS.map((c) => (
                <button key={c.id} onClick={() => toggleChannel(c.id)} aria-pressed={d.channels.includes(c.id)} className={cn("rounded-sm border px-2 py-1 text-xs", d.channels.includes(c.id) ? "border-primary bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground")}>{c.label}</button>
              ))}
            </div>
          </div>
          <ol className="mt-3 border bg-card">
            {d.steps.map((s, i) => (
              <li key={i} className="border-b p-4 last:border-b-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{STEPS[i]} <span className="ml-2 text-xs font-normal text-muted-foreground">{s.delay}</span></div>
                  <Link to="/campaigns/draft/edit" search={{ step: i as 0 | 1 | 2 }} className="text-xs text-primary hover:underline">Edit</Link>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {d.channels.map((c) => (
                    <li key={c} className="flex gap-3 text-sm">
                      <span className="w-20 shrink-0 text-xs leading-5 text-muted-foreground">{CHANNELS.find((x) => x.id === c)?.label}</span>
                      <span className="line-clamp-1">{excerpt(s, c)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <aside className="space-y-4">
          <div className="border bg-card">
            <h2 className="border-b px-4 py-2.5 text-sm font-medium">Agent checks</h2>
            <ul className="divide-y">
              {COLLAB_STEPS.map((c) => (
                <li key={c.agent} className="flex items-start gap-2.5 px-4 py-2.5 text-sm">
                  <AgentMark id={c.agent} size="sm" />
                  <div className="min-w-0 flex-1"><div>{agentById(c.agent)?.name.replace("Marketing ", "")}</div>{mode === "expert" && <p className="mt-0.5 text-xs text-muted-foreground">{c.detail}</p>}</div>
                  <span className="flex items-center gap-1 text-xs text-success"><Check className="size-3.5" />{c.summary.split(" ")[1]}</span>
                </li>
              ))}
            </ul>
          </div>
          {issues.length > 0 && (
            <div className="border border-warning/40 bg-warning-soft p-4 text-sm">
              <div className="flex items-center gap-2 font-medium text-warning"><AlertTriangle className="size-4" /> {issues.length} {issues.length === 1 ? "item needs" : "items need"} attention</div>
              <ul className="mt-2 space-y-1 text-xs">{issues.slice(0, 5).map((x, i) => <li key={i}><span className="text-muted-foreground">{x.where}:</span> {x.hint ?? x.label}</li>)}</ul>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Generating a campaign never sends it. Messages go out only after you approve.</p>
        </aside>
      </div>
      <ApproveDialog open={approve} onOpenChange={setApprove} />
    </div>
  );
}

function Fact({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <div className={cn("bg-card px-4 py-3", wide && "sm:col-span-3 lg:col-span-2")}><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1">{children}</div></div>;
}
