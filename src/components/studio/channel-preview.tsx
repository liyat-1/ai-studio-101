import hero from "@/assets/email-hero.jpg";
import room from "@/assets/email-room.jpg";
import { ExternalLink, Play } from "lucide-react";
import { VoicePlayer } from "@/components/studio/voice-player";
import { fillGuest, type Channel, type StepContent } from "@/lib/studio-data";
import { cn } from "@/lib/utils";

export type Device = "desktop" | "mobile";

/* Guest-facing canvases intentionally use the hotel's own styling (serif, wordmark)
   on top of Directful tokens so dark mode can be previewed. */

export function EmailCanvas({ e, offer, device }: { e: StepContent["email"]; offer: string; device: Device }) {
  const pad = device === "desktop" ? "px-10 py-8" : "px-5 py-6";
  const body = fillGuest(e.body);
  const heading = fillGuest(e.heading);
  const cta = <span className="inline-block rounded-sm bg-sidebar px-6 py-3 font-sans text-xs font-medium tracking-[0.12em] text-sidebar-accent-foreground uppercase">{e.cta}</span>;
  const offerTile = offer !== "No offer" && (
    <div className="mt-6 border border-highlight/60 bg-highlight/10 px-5 py-4 text-center">
      <div className="font-sans text-[11px] tracking-[0.2em] text-highlight-foreground uppercase">Direct booking benefit</div>
      <div className="mt-1 text-xl">{offer === "Free breakfast" ? "Complimentary breakfast" : offer}</div>
    </div>
  );
  return (
    <article className="bg-card text-[15px] leading-relaxed text-card-foreground" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div className="border-b py-4 text-center text-xs tracking-[0.4em] uppercase">The Meridian</div>
      {e.layout === "Promotional" && <div className="bg-sidebar py-6 text-center text-sidebar-accent-foreground"><div className="font-sans text-[11px] tracking-[0.2em] uppercase opacity-80">Book direct</div><div className="mt-1 text-2xl">{offer === "Free breakfast" ? "Breakfast on us" : offer}</div></div>}
      {(e.layout === "Hero" || e.layout === "Offer Tile" || e.layout === "Promotional") && <img src={hero} alt="Hotel pool at sunset" className="block h-auto w-full" />}
      {e.layout === "Video" && (
        <div className="relative"><img src={room} alt="Guest room" className="block h-auto w-full" /><span className="absolute inset-0 grid place-items-center"><span className="grid size-14 place-items-center rounded-full bg-card/90 text-foreground"><Play className="size-6" /></span></span></div>
      )}
      <div className={cn(pad, e.layout === "Editorial" && device === "desktop" && "grid grid-cols-[1fr_200px] gap-6")}>
        <div>
          <h1 className={cn("leading-tight", device === "desktop" ? "text-[28px]" : "text-[22px]")}>{heading}</h1>
          <p className="mt-4">{body}</p>
          {e.layout === "Offer Tile" && offerTile}
          <div className="mt-6">{cta}</div>
        </div>
        {e.layout === "Editorial" && <img src={room} alt="Guest room" className={cn("h-auto w-full", device === "mobile" && "mt-6")} />}
      </div>
      <div className="border-t px-6 py-4 text-center font-sans text-[11px] text-muted-foreground">The Meridian Hotel · Bole Road, Addis Ababa · Unsubscribe</div>
    </article>
  );
}

function Phone({ title, children, tone = "default" }: { title: string; children: React.ReactNode; tone?: "default" | "whatsapp" }) {
  return (
    <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[22px] border-[6px] border-sidebar bg-background shadow-card">
      <div className={cn("border-b px-4 py-2.5 text-center text-xs font-medium", tone === "whatsapp" ? "bg-success text-primary-foreground" : "bg-card")}>{title}</div>
      <div className={cn("min-h-[300px] space-y-2 p-3", tone === "whatsapp" && "bg-success-soft")}>{children}</div>
    </div>
  );
}

export function ChannelPreview({ step, channel, offer, device = "mobile", compact }: { step: StepContent; channel: Channel; offer: string; device?: Device; compact?: boolean }) {
  if (channel === "email") {
    return (
      <div className={cn("mx-auto", device === "desktop" ? "max-w-[620px]" : "max-w-[360px]")}>
        <div className="mb-2 border bg-card px-3 py-2 text-xs">
          <div className="flex justify-between gap-2"><span className="font-medium text-card-foreground">{step.email.sender}</span><span className="text-muted-foreground">10:00</span></div>
          <div className="truncate text-card-foreground">{fillGuest(step.email.subject)}</div>
          <div className="truncate text-muted-foreground">{step.email.preheader}</div>
        </div>
        <div className="border"><EmailCanvas e={step.email} offer={offer} device={device} /></div>
      </div>
    );
  }
  if (channel === "sms") {
    return (
      <Phone title="The Meridian · Text message">
        <div className="max-w-[85%] rounded-lg rounded-bl-sm bg-muted px-3 py-2 text-[13px] leading-snug text-foreground">{fillGuest(step.sms.text).split(/(mrdn\.co\/\S+)/).map((p, i) => (/^mrdn/.test(p) ? <span key={i} className="text-primary underline">{p}</span> : p))}</div>
        <div className="text-[10px] text-muted-foreground">Delivered · Standard SMS{step.sms.media ? " · MMS image where supported" : ", no images"}</div>
      </Phone>
    );
  }
  if (channel === "rcs") {
    return (
      <Phone title="The Meridian Hotel ✓">
        <div className="max-w-[90%] overflow-hidden rounded-lg border bg-card">
          <img src={hero} alt="Hotel pool at sunset" className="h-28 w-full object-cover" />
          <div className="p-3"><div className="text-sm font-medium">{step.rcs.title}</div><p className="mt-1 text-xs text-muted-foreground">{step.rcs.text}</p></div>
          <div className="border-t py-2 text-center text-xs font-medium text-primary">{step.rcs.cta}</div>
          <div className="border-t py-2 text-center text-xs font-medium text-primary">Call the hotel</div>
        </div>
      </Phone>
    );
  }
  if (channel === "whatsapp") {
    return (
      <Phone title="The Meridian Hotel" tone="whatsapp">
        <div className="max-w-[88%] overflow-hidden rounded-lg rounded-tl-sm bg-card">
          <img src={room} alt="Guest room" className="h-28 w-full object-cover" />
          <p className="px-3 py-2 text-[13px] leading-snug">{fillGuest(step.whatsapp.text)}</p>
          {step.whatsapp.buttons.map((b) => <div key={b} className="flex items-center justify-center gap-1 border-t py-2 text-xs font-medium text-primary"><ExternalLink className="size-3" />{b}</div>)}
        </div>
      </Phone>
    );
  }
  return (
    <div className="mx-auto max-w-[460px] space-y-3">
      <p className="text-xs text-muted-foreground">This is the voice message guests hear when they answer.</p>
      <VoicePlayer script={step.voice.script} voice={`${step.voice.voice} · ${step.voice.style} · ${step.voice.language}`} compact={compact} />
      <div className="border bg-card p-3 text-sm leading-relaxed"><div className="mb-1 text-xs font-medium text-muted-foreground">Transcript</div>{step.voice.script}</div>
    </div>
  );
}
