import { FileSpreadsheet, FileText, Image as ImageIcon, Sparkles, X } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

export type Attachment = { id: string; name: string; size: number; kind: "image" | "pdf" | "sheet" | "doc"; url?: string };

export const toAttachment = (f: File): Attachment => {
  const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
  const kind: Attachment["kind"] = f.type.startsWith("image/") ? "image" : ext === "pdf" ? "pdf" : ["xls", "xlsx", "csv"].includes(ext) ? "sheet" : "doc";
  return { id: crypto.randomUUID(), name: f.name, size: f.size, kind, ...(kind === "image" ? { url: URL.createObjectURL(f) } : {}) };
};
const fmtSize = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
const LABEL = { image: "Image", pdf: "PDF", sheet: "Spreadsheet", doc: "Document" };

function TypeTile({ a, big }: { a: Attachment; big?: boolean }) {
  const s = big ? "size-9" : "size-6";
  if (a.kind === "image" && a.url) return <img src={a.url} alt="" className={cn(s, "shrink-0 rounded-[6px] object-cover")} />;
  const Icon = a.kind === "pdf" ? FileText : a.kind === "sheet" ? FileSpreadsheet : a.kind === "image" ? ImageIcon : FileText;
  return <span className={cn(s, "grid shrink-0 place-items-center rounded-[6px]", a.kind === "pdf" ? "bg-destructive-soft text-destructive" : a.kind === "sheet" ? "bg-success-soft text-success" : "bg-primary-soft text-primary")}><Icon className={big ? "size-4" : "size-3.5"} /></span>;
}

/** Chip row above the composer, with a hover preview like modern AI apps. */
export function AttachmentChips({ items, onRemove }: { items: Attachment[]; onRemove: (id: string) => void }) {
  if (!items.length) return null;
  return (
    <div className="flex gap-2 overflow-x-auto px-3 pt-3">
      {items.map((a) => (
        <HoverCard key={a.id} openDelay={150}>
          <HoverCardTrigger asChild>
            <span className="studio-fade flex shrink-0 cursor-default items-center gap-2 rounded-[10px] border bg-card py-1.5 pl-1.5 pr-2 text-sm shadow-card">
              <TypeTile a={a} />
              <span className="max-w-[160px] truncate">{a.name}</span>
              <button onClick={() => onRemove(a.id)} aria-label={`Remove ${a.name}`} className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="size-3.5" /></button>
            </span>
          </HoverCardTrigger>
          <HoverCardContent align="start" className="w-[300px] rounded-[12px] p-3">
            <div className="flex items-center gap-2"><TypeTile a={a} big /><div className="min-w-0"><div className="truncate text-sm font-medium">{a.name}</div><div className="font-mono text-[11px] text-muted-foreground uppercase">{LABEL[a.kind]} · {fmtSize(a.size)}</div></div></div>
            {a.kind === "image" && a.url ? <img src={a.url} alt={a.name} className="mt-3 max-h-40 w-full rounded-[8px] object-cover" /> : (
              <div className="mt-3 rounded-[8px] border bg-muted/40 p-2.5">
                <div className="flex items-center gap-1 text-[11px] text-primary"><Sparkles className="size-3" /> Ready for your agent</div>
                <p className="mt-1 text-xs text-muted-foreground">Your agent reads this file when you send the message and can cite it in its answer.</p>
              </div>
            )}
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
}

/** Compact attachment cards shown inside a sent message. */
export function AttachmentCards({ items }: { items: Attachment[] }) {
  return (
    <div className="mb-2 flex flex-wrap justify-end gap-2">
      {items.map((a) => (
        <div key={a.id} className="flex w-[150px] flex-col justify-between rounded-[12px] border bg-card p-2.5 text-left shadow-card">
          {a.kind === "image" && a.url ? <img src={a.url} alt={a.name} className="h-16 w-full rounded-[8px] object-cover" /> : <div className="line-clamp-2 text-sm font-medium">{a.name}</div>}
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground"><TypeTile a={a} /> {LABEL[a.kind]} · {fmtSize(a.size)}</div>
        </div>
      ))}
    </div>
  );
}
