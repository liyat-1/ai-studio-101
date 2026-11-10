import { CHANNELS, STEPS, type Channel, type Step } from "@/lib/studio-data";
import { cn } from "@/lib/utils";

export const parseStep = (v: unknown): Step | undefined => (v === 0 || v === 1 || v === 2 ? v : v === "0" || v === "1" || v === "2" ? (Number(v) as Step) : undefined);
export const parseChannel = (v: unknown): Channel | undefined => (CHANNELS.some((c) => c.id === v) ? (v as Channel) : undefined);

export function Segmented<T extends string | number>({ value, options, onChange, label, mark }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string; mark?: (id: T) => boolean }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex flex-wrap rounded-sm border bg-card p-0.5">
      {options.map((o) => (
        <button key={String(o.id)} role="tab" aria-selected={o.id === value} onClick={() => onChange(o.id)}
          className={cn("flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-sm transition-colors", o.id === value ? "bg-sidebar text-sidebar-accent-foreground" : "text-muted-foreground hover:text-foreground")}>
          {o.label}{mark?.(o.id) && <span className="size-1.5 rounded-full bg-primary" aria-label="in campaign" />}
        </button>
      ))}
    </div>
  );
}

export const stepOptions = STEPS.map((s, i) => ({ id: i as Step, label: s }));
export const channelOptions = CHANNELS.map((c) => ({ id: c.id, label: c.label }));
