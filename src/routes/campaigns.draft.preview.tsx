import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Moon, Pencil, Sun } from "lucide-react";
import { useState } from "react";
import { ChannelPreview, type Device } from "@/components/studio/channel-preview";
import { Segmented, channelOptions, parseChannel, parseStep, stepOptions } from "@/components/studio/draft-controls";
import { Button } from "@/components/ui/button";
import type { Channel, Step } from "@/lib/studio-data";
import { useStudio } from "@/lib/studio-store";
import { cn } from "@/lib/utils";

type Search = { step?: Step; channel?: Channel };

export const Route = createFileRoute("/campaigns/draft/preview")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const step = parseStep(s["step"]); const channel = parseChannel(s["channel"]);
    return { ...(step !== undefined ? { step } : {}), ...(channel ? { channel } : {}) };
  },
  head: () => ({ meta: [
    { title: "Campaign Preview — Directful" },
    { name: "description", content: "See exactly what guests receive on every channel." },
    { property: "og:title", content: "Campaign Preview — Directful" },
    { property: "og:description", content: "See exactly what guests receive on every channel." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PreviewPage,
});

function PreviewPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/campaigns/draft/preview" });
  const d = useStudio((s) => s.draft);
  const step = search.step ?? 0;
  const channel = search.channel ?? d.channels[0] ?? "email";
  const [device, setDevice] = useState<Device>("desktop");
  const [dark, setDark] = useState(false);
  const set = (p: Search) => navigate({ search: (prev) => ({ ...prev, ...p }), replace: true });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b bg-card px-5 py-3">
        <Link to="/campaigns/draft" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" /> Draft overview</Link>
        <span className="text-sm font-medium">Preview · {d.name}</span>
        <Button asChild size="sm" variant="outline" className="ml-auto"><Link to="/campaigns/draft/edit" search={{ step, channel }}><Pencil /> Edit this message</Link></Button>
      </header>
      <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3">
        <Segmented label="Sequence" value={step} options={stepOptions} onChange={(v) => set({ step: v })} />
        <Segmented label="Channel" value={channel} options={channelOptions} onChange={(v) => set({ channel: v })} mark={(c) => d.channels.includes(c)} />
        {channel === "email" && (
          <div className="ml-auto flex items-center gap-2">
            <Segmented label="Device" value={device} options={[{ id: "desktop", label: "Desktop" }, { id: "mobile", label: "Mobile" }]} onChange={setDevice} />
            <Button size="icon" variant="outline" onClick={() => setDark((x) => !x)} aria-label={dark ? "Light mode" : "Dark mode"}>{dark ? <Sun /> : <Moon />}</Button>
          </div>
        )}
      </div>
      {!d.channels.includes(channel) && <p className="bg-warning-soft px-5 py-2 text-xs text-warning">This channel isn't in the campaign yet. Add it from the draft overview to send it.</p>}
      <div className={cn("flex-1 bg-canvas px-5 py-8", dark && channel === "email" && "dark")}>
        <div className="studio-fade" key={`${step}-${channel}-${device}`}>
          <ChannelPreview step={d.steps[step]!} channel={channel} offer={d.offer} device={device} />
        </div>
      </div>
    </div>
  );
}
