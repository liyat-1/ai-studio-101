import type { Channel, StepContent } from "@/lib/studio-data";

export type CheckStatus = "Passed" | "Needs attention" | "Not applicable";
export type Check = { label: string; status: CheckStatus; hint?: string };

/** Standard SMS: 160 characters for one segment, 153 per segment once split. */
export const smsSegments = (text: string) => (text.length <= 160 ? 1 : Math.ceil(text.length / 153));

const HOTEL = "The Meridian";

export function contentChecks(step: StepContent, channel: Channel, stepIndex: number): Check[] {
  const has = (s: string) => s.includes(HOTEL);
  const pass = (ok: boolean, label: string, hint?: string): Check => ({ label, status: ok ? "Passed" : "Needs attention", hint: ok ? undefined : hint });
  const na = (label: string): Check => ({ label, status: "Not applicable" });
  const first = stepIndex === 0;

  switch (channel) {
    case "email":
      return [
        pass(step.email.subject.trim().length > 0, "Subject line present", "Add a subject line."),
        pass(step.email.subject.length <= 60, "Subject under 60 characters", "Long subjects get cut off on phones."),
        first ? pass(has(step.email.sender + step.email.body), "Hotel name included", "Mention The Meridian in the first message.") : na("Hotel name included"),
        pass(step.email.cta.trim().length > 0, "Button text set", "Add text for the booking button."),
        na("STOP wording"),
      ];
    case "sms":
      return [
        first ? pass(has(step.sms.text), "Hotel name included", "Start with the hotel name.") : na("Hotel name included"),
        pass(/reply stop/i.test(step.sms.text), "STOP wording included", "Add “Reply STOP to opt out”."),
        pass(/mrdn\.co\//.test(step.sms.text), "Short link configured", "Add your booking short link."),
        pass(smsSegments(step.sms.text) === 1, "Fits in one message", `${step.sms.text.length} characters — sends as ${smsSegments(step.sms.text)} messages.`),
      ];
    case "rcs":
      return [pass(step.rcs.title.trim().length > 0, "Card title set", "Add a card title."), pass(step.rcs.cta.trim().length > 0, "Button set", "Add a button."), na("STOP wording")];
    case "whatsapp":
      return [pass(step.whatsapp.buttons.length > 0, "Interactive button added", "Add at least one button."), pass(step.whatsapp.text.length <= 1024, "Within WhatsApp length", "Shorten the message."), { label: "Template approval", status: "Needs attention", hint: "WhatsApp templates need Meta approval before sending." }];
    case "voice":
      return [pass(has(step.voice.script), "Hotel name spoken", "Say the hotel name early."), pass(step.voice.script.split(/\s+/).length <= 90, "Under 35 seconds", "Shorten the script.")];
  }
}
