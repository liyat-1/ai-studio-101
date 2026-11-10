import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, CircleMinus, Eye, PanelRightClose, PanelRightOpen, Plus, Sparkles, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ApproveDialog } from "@/components/studio/approve-dialog";
import { ChannelPreview } from "@/components/studio/channel-preview";
import { Segmented, channelOptions, parseChannel, parseStep, stepOptions } from "@/components/studio/draft-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { contentChecks, smsSegments, type CheckStatus } from "@/lib/campaign-checks";
import { CHANNELS, EMAIL_LAYOUTS, STEPS, type Channel, type Step, type StepContent } from "@/lib/studio-data";
import { actions, useStudio } from "@/lib/studio-store";
import { cn } from "@/lib/utils";

type Tab = "content" | "flow" | "test" | "review";
type Search = { step?: Step; channel?: Channel; tab?: Tab };

export const Route = createFileRoute("/campaigns/draft/edit")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const step = parseStep(s["step"]); const channel = parseChannel(s["channel"]);
    const tab = ["content", "flow", "test", "review"].includes(s["tab"] as string) ? (s["tab"] as Tab) : undefined;
    return { ...(step !== undefined ? { step } : {}), ...(channel ? { channel } : {}), ...(tab ? { tab } : {}) };
  },
  head: () => ({ meta: [
    { title: "Edit Campaign — Directful" },
    { name: "description", content: "Edit each message and channel of your campaign." },
    { property: "og:title", content: "Edit Campaign — Directful" },
    { property: "og:description", content: "Edit each message and channel of your campaign." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: EditorPage,
});

const ALT_SUBJECTS = ["Your next stay deserves a little extra.", "Breakfast is on us next time, {first_name}", "Come back to The Meridian — breakfast included", "A warmer welcome when you book direct"];

function EditorPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/campaigns/draft/edit" });
  const d = useStudio((s) => s.draft);
  const step = search.step ?? 0;
  const channel = search.channel ?? d.channels[0] ?? "email";
  const tab = search.tab ?? "content";
  const [side, setSide] = useState(true);
  const [approve, setApprove] = useState(false);
  const set = (p: Search) => navigate({ search: (prev) => ({ ...prev, ...p }), replace: true });
  const s = d.steps[step]!;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b bg-card px-5 py-2.5">
        <Link to="/campaigns/draft" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" /> Overview</Link>
        <span className="truncate text-sm font-medium">{d.name}</span>
        <nav className="flex gap-1" aria-label="Editor sections">
          {(["content", "flow", "test", "review"] as Tab[]).map((t) => (
            <button key={t} onClick={() => set({ tab: t })} className={cn("rounded-sm px-3 py-1.5 text-sm capitalize", tab === t ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground")}>{t}</button>
          ))}
        </nav>
        <div className="ml-auto flex gap-2">
          <Button asChild size="sm" variant="outline"><Link to="/campaigns/draft/preview" search={{ step, channel }}><Eye /> Preview</Link></Button>
          <Button size="sm" onClick={() => setApprove(true)} disabled={d.status.startsWith("Approved")}>Approve & send</Button>
        </div>
      </header>

      {tab === "content" && (
        <>
          <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3">
            <Segmented label="Sequence" value={step} options={stepOptions} onChange={(v) => set({ step: v })} />
            <Segmented label="Channel" value={channel} options={channelOptions} onChange={(v) => set({ channel: v })} mark={(c) => d.channels.includes(c)} />
            <button onClick={() => setSide((x) => !x)} className="ml-auto hidden items-center gap-1 text-xs text-muted-foreground hover:text-foreground md:flex">{side ? <><PanelRightClose className="size-4" /> Hide preview</> : <><PanelRightOpen className="size-4" /> Show preview</>}</button>
          </div>
          <div className={cn("grid flex-1", side && "md:grid-cols-[1fr_380px]")}>
            <div className="min-w-0 px-5 py-5">
              {!d.channels.includes(channel) && (
                <div className="mb-4 flex items-center justify-between gap-3 border bg-muted/60 px-3 py-2 text-sm">
                  <span>{CHANNELS.find((c) => c.id === channel)?.label} isn't part of this campaign yet.</span>
                  <Button size="sm" variant="outline" onClick={() => actions.updateDraft({ channels: [...d.channels, channel] })}><Plus /> Add channel</Button>
                </div>
              )}
              <div className="studio-fade max-w-[680px]" key={`${step}-${channel}`}><ChannelEditor stepIndex={step} s={s} channel={channel} /></div>
            </div>
            {side && (
              <aside className="space-y-5 border-l bg-canvas/60 px-4 py-5">
                <ChannelPreview step={s} channel={channel} offer={d.offer} device="mobile" compact />
                <Checks s={s} channel={channel} step={step} />
                <BrandGuidance />
              </aside>
            )}
          </div>
        </>
      )}
      {tab === "flow" && <FlowTab />}
      {tab === "test" && <TestTab />}
      {tab === "review" && <ReviewTab onApprove={() => setApprove(true)} />}
      <ApproveDialog open={approve} onOpenChange={setApprove} />
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 flex justify-between text-xs font-medium text-muted-foreground"><span>{label}</span>{hint}</span>{children}</label>;
}

function ChannelEditor({ stepIndex, s, channel }: { stepIndex: number; s: StepContent; channel: Channel }) {
  const up = <K extends keyof StepContent>(k: K, p: Partial<StepContent[K]>) => actions.updateStep(stepIndex, k, p);
  if (channel === "email") {
    const e = s.email;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-sm font-medium">Email · {STEPS[stepIndex]}</h2>
          <Button size="sm" variant="ghost" onClick={() => { const next = ALT_SUBJECTS[(ALT_SUBJECTS.indexOf(e.subject) + 1) % ALT_SUBJECTS.length]!; up("email", { subject: next }); toast("Marketing Manager suggested a new subject line"); }}><Sparkles /> Suggest subject</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sender name"><Input value={e.sender} onChange={(x) => up("email", { sender: x.target.value })} /></Field>
          <Field label="Subject" hint={<span className="num">{e.subject.length}/60</span>}><Input value={e.subject} onChange={(x) => up("email", { subject: x.target.value })} /></Field>
        </div>
        <Field label="Preheader"><Input value={e.preheader} onChange={(x) => up("email", { preheader: x.target.value })} /></Field>
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Layout</div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {EMAIL_LAYOUTS.map((l) => (
              <button key={l} onClick={() => up("email", { layout: l })} className={cn("rounded-sm border bg-card p-1.5 text-left text-[11px]", e.layout === l ? "border-primary ring-1 ring-primary" : "hover:border-foreground/30")}>
                <LayoutThumb l={l} /><span className="mt-1 block">{l}</span>
              </button>
            ))}
          </div>
        </div>
        <Field label="Heading"><Input value={e.heading} onChange={(x) => up("email", { heading: x.target.value })} /></Field>
        <Field label="Body" hint="Use {first_name} to personalize"><Textarea rows={5} value={e.body} onChange={(x) => up("email", { body: x.target.value })} /></Field>
        <Field label="Button text"><Input value={e.cta} onChange={(x) => up("email", { cta: x.target.value })} /></Field>
      </div>
    );
  }
  if (channel === "sms") {
    const t = s.sms.text; const seg = smsSegments(t);
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-medium">SMS · {STEPS[stepIndex]}</h2>
        <Field label="Message" hint={<span className={cn("num", seg > 1 && "text-warning")}>{t.length} chars · {seg} {seg === 1 ? "message" : "messages"}</span>}>
          <Textarea rows={5} value={t} onChange={(x) => up("sms", { text: x.target.value })} />
        </Field>
        <div className="flex flex-wrap gap-2">
          {!/reply stop/i.test(t) && <Button size="sm" variant="outline" onClick={() => up("sms", { text: t.trim() + " Reply STOP to opt out." })}><Plus /> Add STOP wording</Button>}
          {!/mrdn\.co\//.test(t) && <Button size="sm" variant="outline" onClick={() => up("sms", { text: t.trim() + " mrdn.co/stay" })}><Plus /> Add short link</Button>}
          {!t.startsWith("The Meridian") && <Button size="sm" variant="outline" onClick={() => up("sms", { text: "The Meridian Hotel: " + t })}><Plus /> Hotel name first</Button>}
        </div>
        <label className="flex items-center justify-between gap-3 border bg-card px-3 py-2.5 text-sm">
          <span>Attach an image (MMS)<span className="block text-xs text-muted-foreground">Only some carriers show images. Others receive text only.</span></span>
          <Switch checked={s.sms.media} onCheckedChange={(v) => up("sms", { media: v })} />
        </label>
      </div>
    );
  }
  if (channel === "rcs") {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-medium">RCS rich card · {STEPS[stepIndex]}</h2>
        <Field label="Card title"><Input value={s.rcs.title} onChange={(x) => up("rcs", { title: x.target.value })} /></Field>
        <Field label="Card text"><Textarea rows={3} value={s.rcs.text} onChange={(x) => up("rcs", { text: x.target.value })} /></Field>
        <Field label="Primary button"><Input value={s.rcs.cta} onChange={(x) => up("rcs", { cta: x.target.value })} /></Field>
        <p className="text-xs text-muted-foreground">Image: pool at sunset (from Brand Kit). A “Call the hotel” button is added automatically.</p>
      </div>
    );
  }
  if (channel === "whatsapp") {
    const b = s.whatsapp.buttons;
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-medium">WhatsApp · {STEPS[stepIndex]}</h2>
        <Field label="Message"><Textarea rows={4} value={s.whatsapp.text} onChange={(x) => up("whatsapp", { text: x.target.value })} /></Field>
        <div>
          <div className="mb-1 text-xs font-medium text-muted-foreground">Buttons (up to 3)</div>
          <div className="space-y-2">
            {b.map((x, i) => (
              <div key={i} className="flex gap-2">
                <Input value={x} onChange={(ev) => up("whatsapp", { buttons: b.map((y, j) => (j === i ? ev.target.value : y)) })} />
                <Button size="icon" variant="ghost" aria-label="Remove button" onClick={() => up("whatsapp", { buttons: b.filter((_, j) => j !== i) })}><X /></Button>
              </div>
            ))}
            {b.length < 3 && <Button size="sm" variant="outline" onClick={() => up("whatsapp", { buttons: [...b, "View rooms"] })}><Plus /> Add button</Button>}
          </div>
        </div>
      </div>
    );
  }
  const v = s.voice;
  const sel = (label: string, value: string, opts: string[], k: "voice" | "style" | "language") => (
    <Field label={label}><select value={value} onChange={(x) => up("voice", { [k]: x.target.value })} className="h-9 w-full rounded-md border bg-background px-2 text-sm">{opts.map((o) => <option key={o}>{o}</option>)}</select></Field>
  );
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium">Voice message · {STEPS[stepIndex]}</h2>
      <Field label="Script" hint={<span className="num">~{Math.round(v.script.split(/\s+/).length / 2.6)}s</span>}><Textarea rows={5} value={v.script} onChange={(x) => up("voice", { script: x.target.value })} /></Field>
      <div className="grid gap-4 sm:grid-cols-3">
        {sel("Voice", v.voice, ["Hana", "Daniel", "Meron"], "voice")}
        {sel("Speaking style", v.style, ["Warm", "Professional", "Upbeat"], "style")}
        {sel("Language", v.language, ["English", "Amharic", "French"], "language")}
      </div>
      <p className="text-xs text-muted-foreground">Play the audio in the preview on the right. It updates as you edit the script.</p>
    </div>
  );
}

function LayoutThumb({ l }: { l: string }) {
  return (
    <span className="flex h-12 flex-col gap-0.5 bg-muted p-1" aria-hidden>
      {l === "Promotional" && <span className="h-2 bg-sidebar" />}
      {["Hero", "Offer Tile", "Promotional", "Video"].includes(l) && <span className="relative h-4 bg-chart-3/60">{l === "Video" && <span className="absolute inset-0 m-auto size-2 rounded-full bg-card" />}</span>}
      <span className={cn("flex gap-0.5", l === "Editorial" && "h-full")}><span className="flex-1 space-y-0.5"><span className="block h-1 w-3/4 bg-foreground/40" /><span className="block h-1 bg-foreground/20" /></span>{l === "Editorial" && <span className="w-3 bg-chart-3/60" />}</span>
      {l === "Offer Tile" && <span className="h-1.5 border border-highlight" />}
    </span>
  );
}

const statusIcon: Record<CheckStatus, React.ReactNode> = {
  Passed: <Check className="size-3.5 text-success" />, "Needs attention": <TriangleAlert className="size-3.5 text-warning" />, "Not applicable": <CircleMinus className="size-3.5 text-muted-foreground" />,
};

function Checks({ s, channel, step }: { s: StepContent; channel: Channel; step: number }) {
  const list = [...contentChecks(s, channel, step), { label: "Audience matched", status: "Passed" as const }, { label: "Compliance reviewed", status: "Passed" as const }];
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Content checks</h3>
      <ul className="space-y-1.5 text-sm">
        {list.map((c) => <li key={c.label} className="flex gap-2">{statusIcon[c.status]}<span className={cn(c.status === "Not applicable" && "text-muted-foreground")}>{c.label}{"hint" in c && c.hint && <span className="block text-xs text-warning">{c.hint}</span>}</span></li>)}
      </ul>
    </div>
  );
}

function BrandGuidance() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Brand guidance</h3>
      <dl className="grid grid-cols-[96px_1fr] gap-y-1 text-sm">
        <dt className="text-muted-foreground">Voice</dt><dd>Warm and welcoming</dd>
        <dt className="text-muted-foreground">Say</dt><dd>Direct bookings, complimentary</dd>
        <dt className="text-muted-foreground">Avoid</dt><dd>Pushy sales language</dd>
        <dt className="text-muted-foreground">Hotel name</dt><dd>Required in first message</dd>
      </dl>
      <button onClick={() => setOpen((o) => !o)} className="mt-2 text-xs text-primary hover:underline">{open ? "Hide" : "View"} full brand instructions</button>
      {open && <p className="mt-2 border bg-card p-2 text-xs text-muted-foreground">Warm, confident, professional, welcoming. Speak like an attentive host — never pushy, never casual slang. Avoid: cheap, deal of the century, act now, limited time only.</p>}
    </div>
  );
}

function FlowTab() {
  const d = useStudio((s) => s.draft);
  return (
    <div className="mx-auto w-full max-w-[640px] px-5 py-8">
      <h2 className="text-sm font-medium">Sequence timing</h2>
      <p className="mt-1 text-xs text-muted-foreground">Guests who book directly leave the sequence automatically.</p>
      <ol className="mt-4 space-y-3">
        {d.steps.map((s, i) => (
          <li key={i} className="flex items-center gap-3 border bg-card px-4 py-3 text-sm">
            <span className="num grid size-6 place-items-center rounded-full bg-muted text-xs">{i + 1}</span>
            <span className="w-24 font-medium">{STEPS[i]}</span>
            <Input className="h-8 max-w-[220px]" value={s.delay} onChange={(e) => actions.updateStep(i, "delay", e.target.value as never)} aria-label={`${STEPS[i]} timing`} />
            <span className="ml-auto text-xs text-muted-foreground">{d.channels.length} channels</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-muted-foreground">Branching and A/B testing are in the full Flow Editor.</p>
    </div>
  );
}

function TestTab() {
  const [to, setTo] = useState("selam.bekele@meridian-addis.com");
  return (
    <div className="mx-auto w-full max-w-[520px] px-5 py-8">
      <h2 className="text-sm font-medium">Send a test to yourself</h2>
      <p className="mt-1 text-xs text-muted-foreground">Tests go only to the address or number below — never to guests.</p>
      <div className="mt-4 flex gap-2"><Input value={to} onChange={(e) => setTo(e.target.value)} aria-label="Test recipient" /><Button onClick={() => toast.success(`Test of all 3 messages queued for ${to}`, { description: "This is a prototype. No real message is delivered." })} disabled={!to.trim()}>Send test</Button></div>
    </div>
  );
}

function ReviewTab({ onApprove }: { onApprove: () => void }) {
  const d = useStudio((s) => s.draft);
  const rows = d.steps.flatMap((s, i) => d.channels.map((c) => ({ i, c, checks: contentChecks(s, c, i) })));
  const issues = rows.reduce((n, r) => n + r.checks.filter((x) => x.status === "Needs attention").length, 0);
  return (
    <div className="mx-auto w-full max-w-[720px] px-5 py-8">
      <h2 className="text-sm font-medium">Final review</h2>
      <table className="mt-4 w-full border bg-card text-sm">
        <tbody className="divide-y">
          {rows.map((r) => {
            const bad = r.checks.filter((x) => x.status === "Needs attention");
            return (
              <tr key={`${r.i}-${r.c}`}>
                <td className="px-3 py-2">{STEPS[r.i]}</td>
                <td className="px-3 py-2 text-muted-foreground">{CHANNELS.find((x) => x.id === r.c)?.label}</td>
                <td className="px-3 py-2">{bad.length ? <span className="text-warning">{bad.map((b) => b.label).join(", ")}</span> : <span className="text-success">All checks passed</span>}</td>
                <td className="px-3 py-2 text-right"><Link to="/campaigns/draft/edit" search={{ step: r.i as Step, channel: r.c }} className="text-xs text-primary hover:underline">Open</Link></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{issues ? `${issues} items need attention` : "Ready to approve"}</span>
        <Button onClick={onApprove} disabled={d.status.startsWith("Approved")}>Approve & send</Button>
      </div>
    </div>
  );
}
