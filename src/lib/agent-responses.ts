import type { AgentId } from "@/lib/studio-data";

/** Deterministic mock replies for the prototype. No live AI is called. */
export type MockReply = { kind: "campaign" | "text" | "list"; text: string; items?: string[]; collaborate: boolean };

const isCampaign = (t: string) => /campaign|ota|promotion|direct book|send|guests who/i.test(t);

const BY_AGENT: Record<string, MockReply> = {
  revenue: { kind: "list", collaborate: false, text: "Here's where I see room to grow direct revenue without touching your rate floor (ETB 9,800):", items: ["January weekends pace 13 pts behind last year — 'Third night on us' keeps ADR above the floor.", "Free breakfast on direct bookings costs ~ETB 650 per room-night vs ~18% OTA commission.", "Executive Rooms are under-sold on direct channels; an upgrade offer is low-risk."] },
  research: { kind: "list", collaborate: false, text: "Your strongest segments from the last 12 months:", items: ["OTA repeaters — 1,140 guests who stayed twice, both via Booking.com or Expedia.", "Addis locals — 860 guests within 30 km, high weekend dining spend.", "Corporate travelers — 1,920 Mon–Thu stays, 62% open rate on email."] },
  brand: { kind: "text", collaborate: false, text: "Your voice reads warm and confident. I'd soften phrases like “Don't miss out” to “We'd love to welcome you back” and keep “complimentary” rather than “free” in email subject lines." },
  results: { kind: "list", collaborate: false, text: "Last month in summary:", items: ["Email: 41% open, 6.2% click — subject lines with the guest's name won by 9 pts.", "SMS: 18% click, 34 direct bookings attributed.", "Follow-up 2 drove 22% of conversions — keep it."] },
  compliance: { kind: "list", collaborate: false, text: "Consent coverage for your guest database:", items: ["Email: 8,410 guests opted in (92%).", "SMS: 5,230 opted in — 'Reply STOP to opt out' required in every message.", "WhatsApp: 1,870 opted in; template messages must be pre-approved."] },
  reply: { kind: "text", collaborate: false, text: "Here's a draft: “Thank you for asking! Late checkout until 15:00 is available on request for 50% of the nightly rate. Just let the front desk know on the morning of departure.” This uses the approved answer from your Knowledge Base." },
  operations: { kind: "text", collaborate: false, text: "Saba Restaurant can absorb up to 40 additional breakfast covers per morning. I'll flag the front desk to tag direct bookings with the breakfast benefit on arrival." },
  marketing: { kind: "list", collaborate: false, text: "Here's how I'd approach it:", items: ["Win back OTA guests with a direct booking benefit.", "Re-engage Addis locals for weekend dining and staycations.", "Ask your Results Analyst which past message resonated most before we write new copy."] },
};

export function mockReply(agent: AgentId, text: string): MockReply {
  if (agent === "marketing" && isCampaign(text)) {
    return {
      kind: "campaign", collaborate: true,
      text: "Let's build a campaign around converting OTA guests into direct bookings. I checked the audience, the available offers, and messaging requirements with your team, then prepared a draft.",
    };
  }
  return BY_AGENT[agent] ?? BY_AGENT.marketing;
}

export const COLLAB_STEPS: { agent: AgentId; summary: string; detail: string }[] = [
  { agent: "research", summary: "Audience identified", detail: "2,450 guests booked via OTAs in the last 18 months and have email or SMS consent. 860 live in Addis Ababa." },
  { agent: "revenue", summary: "Offer checked", detail: "Free breakfast (~ETB 650 per room-night) stays above the ETB 9,800 rate floor. 50% off was rejected — it requires GM approval." },
  { agent: "brand", summary: "Content reviewed", detail: "Applied the 'warm, confident' voice. Replaced 'free' with 'complimentary' in email copy. Hotel name included in the first message." },
  { agent: "compliance", summary: "Requirements checked", detail: "STOP wording present on all SMS. Send window kept between 08:00 and 21:00 local time." },
];
