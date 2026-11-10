import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CHANNELS, STEPS } from "@/lib/studio-data";
import { actions, useStudio } from "@/lib/studio-store";

/** Final, explicit approval. Nothing is scheduled until the user confirms here. */
export function ApproveDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const d = useStudio((s) => s.draft);
  const [ok, setOk] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setOk(false); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve and schedule this campaign?</AlertDialogTitle>
          <AlertDialogDescription>Once approved, messages go out to real guests at the scheduled time.</AlertDialogDescription>
        </AlertDialogHeader>
        <dl className="grid grid-cols-[120px_1fr] gap-y-1.5 border-y py-3 text-sm">
          <dt className="text-muted-foreground">Campaign</dt><dd>{d.name}</dd>
          <dt className="text-muted-foreground">Audience</dt><dd>{d.audience} · <span className="num">{d.eligible.toLocaleString()}</span> guests</dd>
          <dt className="text-muted-foreground">Channels</dt><dd>{d.channels.map((c) => CHANNELS.find((x) => x.id === c)?.label).join(" + ")}</dd>
          <dt className="text-muted-foreground">Messages</dt><dd>{STEPS.length} in sequence</dd>
          <dt className="text-muted-foreground">First send</dt><dd>{d.timing}</dd>
        </dl>
        <label className="flex items-start gap-2 text-sm">
          <Checkbox checked={ok} onCheckedChange={(v) => setOk(v === true)} className="mt-0.5" />
          I've reviewed the content and want to send this to {d.eligible.toLocaleString()} guests.
        </label>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep as draft</AlertDialogCancel>
          <AlertDialogAction disabled={!ok} onClick={() => { actions.updateDraft({ status: "Approved · Scheduled" }); toast.success("Campaign approved and scheduled", { description: `First message goes out at the ${d.timing.toLowerCase()}.` }); }}>
            Approve & schedule
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
