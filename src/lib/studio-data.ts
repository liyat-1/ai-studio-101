/* Mock data for the Directful AI Studio prototype. Browser-safe; no live AI. */

export type AgentId =
  | "marketing" | "revenue" | "research" | "brand" | "results" | "compliance" | "reply" | "operations"
  | "creator" | "autopilot" | "checker" | "segmentation";
export type Capability = "Lead" | "Plan & Target" | "Creator" | "Autopilot" | "Check & Test" | "Chat";
export type Role = "Hotel Admin" | "General Manager" | "Front Desk" | "Directful Team";
export const ROLES: Role[] = ["Hotel Admin", "General Manager", "Front Desk", "Directful Team"];

/** The signed-in prototype user. Real enforcement must happen on the server. */
export const CURRENT_USER = { name: "Selam Bekele", role: "General Manager" as Role, initials: "SB" };

export type Agent = {
  id: AgentId;
  name: string;
  short: string; // dropdown line
  description: string;
  tier: "Core" | "Add-on";
  capabilities: Capability[];
  chatAccessible: boolean;
  status: "Available" | "Not activated" | "Coming soon";
  price?: string;
  icon: string;
  welcome?: { headline: string; text: string; prompts: string[] };
};

export const AGENTS: Agent[] = [
  {
    id: "marketing", name: "Marketing Manager", short: "Lead agent · Campaign strategy and coordination",
    description: "Your lead marketing agent. Coordinates campaigns, delegates specialist tasks, and helps turn marketing objectives into actionable work.",
    tier: "Core", capabilities: ["Lead", "Plan & Target", "Chat"], chatAccessible: true, status: "Available", icon: "Compass",
    welcome: {
      headline: "Let's make your next campaign count.",
      text: "Plan campaigns, reach the right guests, and turn more stays into direct bookings with your AI marketing team.",
      prompts: ["Create a campaign for OTA guests to book direct", "Improve my direct booking strategy", "Find opportunities in my guest database", "Review my marketing performance"],
    },
  },
  {
    id: "revenue", name: "Revenue Manager", short: "Revenue strategy · Offers and rate protection",
    description: "Evaluates offers against your rate floor and availability, and recommends promotions that grow direct revenue.",
    tier: "Core", capabilities: ["Plan & Target", "Check & Test", "Chat"], chatAccessible: true, status: "Available", icon: "TrendingUp",
    welcome: {
      headline: "Make every offer work harder.",
      text: "Explore revenue opportunities, evaluate offers, and find ways to increase direct bookings without compromising your rate strategy.",
      prompts: ["Find an opportunity to increase direct bookings", "Review my current offers", "Recommend a promotion", "Check my rate strategy"],
    },
  },
  {
    id: "research", name: "Marketing Researcher", short: "Audience intelligence · Guest research",
    description: "Analyses your guest database to find the segments, patterns, and timing worth pursuing.",
    tier: "Core", capabilities: ["Plan & Target", "Chat"], chatAccessible: true, status: "Available", icon: "ScanSearch",
    welcome: {
      headline: "Discover what your guests respond to.",
      text: "Understand your audience, uncover guest behavior patterns, and identify the opportunities worth pursuing.",
      prompts: ["Find my best guest segments", "Identify OTA guests", "Research campaign opportunities", "Understand my guest audience"],
    },
  },
  {
    id: "brand", name: "Brand Guardian", short: "Brand consistency · Tone and creative direction",
    description: "Applies your brand voice and terminology to every message and flags anything that feels off-brand.",
    tier: "Core", capabilities: ["Check & Test", "Creator", "Chat"], chatAccessible: true, status: "Available", icon: "Fingerprint",
    welcome: {
      headline: "Keep every message unmistakably yours.",
      text: "Review tone, terminology, and creative direction so each guest touchpoint sounds like The Meridian.",
      prompts: ["Review my brand voice", "Rewrite this message in our tone", "Check words we should avoid", "Audit my latest campaign copy"],
    },
  },
  {
    id: "results", name: "Results Analyst", short: "Performance insights · Campaign evaluation",
    description: "Turns campaign results into clear lessons and recommends what to try next.",
    tier: "Core", capabilities: ["Check & Test", "Chat"], chatAccessible: true, status: "Available", icon: "ChartNoAxesCombined",
    welcome: {
      headline: "Learn what actually moved bookings.",
      text: "Evaluate campaign outcomes, compare messages, and carry the lessons into your next send.",
      prompts: ["Summarize last month's campaigns", "Which message performed best?", "Recommend my next experiment", "Explain a drop in clicks"],
    },
  },
  {
    id: "compliance", name: "Compliance", short: "Consent · Messaging requirements",
    description: "Checks consent, opt-out wording, and messaging rules before anything reaches a guest.",
    tier: "Core", capabilities: ["Check & Test", "Chat"], chatAccessible: true, status: "Available", icon: "ShieldCheck",
    welcome: {
      headline: "Send with confidence.",
      text: "Confirm consent, opt-out wording, and channel rules before your messages reach guests.",
      prompts: ["Check my SMS consent coverage", "Review opt-out wording", "What rules apply to WhatsApp?", "Audit a draft campaign"],
    },
  },
  {
    id: "reply", name: "Reply Agent", short: "Guest responses · Conversation assistance",
    description: "Drafts on-brand answers to guest replies using approved responses from your Knowledge Base.",
    tier: "Add-on", capabilities: ["Chat", "Autopilot"], chatAccessible: true, status: "Available", price: "$49 / month", icon: "MessagesSquare",
    welcome: {
      headline: "Answer every guest like your best concierge.",
      text: "Draft thoughtful replies from approved property knowledge and keep conversations moving.",
      prompts: ["Draft a reply about late checkout", "Show unanswered guest questions", "Answer a parking question", "Review today's replies"],
    },
  },
  {
    id: "operations", name: "Operations", short: "Hotel workflows · Operational coordination",
    description: "Keeps campaign work aligned with day-to-day hotel operations and team handoffs.",
    tier: "Add-on", capabilities: ["Chat", "Autopilot"], chatAccessible: true, status: "Available", price: "$39 / month", icon: "Workflow",
    welcome: {
      headline: "Keep the property running in step.",
      text: "Coordinate handoffs, check operational readiness, and keep teams aligned with what marketing promises.",
      prompts: ["Is the restaurant ready for a breakfast offer?", "Prepare a front desk handoff", "Review this week's arrivals", "Organize operational tasks"],
    },
  },
  {
    id: "creator", name: "Campaign Creator", short: "Generates full multi-channel sequences",
    description: "Builds complete sequences across email, SMS, RCS, WhatsApp and voice from a single brief.",
    tier: "Add-on", capabilities: ["Creator"], chatAccessible: false, status: "Available", price: "Included with Pro", icon: "Sparkles",
  },
  {
    id: "autopilot", name: "Autopilot", short: "Runs always-on campaigns",
    description: "Keeps lifecycle campaigns running and adjusts timing based on guest behaviour, within approved rules.",
    tier: "Add-on", capabilities: ["Autopilot"], chatAccessible: false, status: "Not activated", price: "$99 / month", icon: "Repeat",
  },
  {
    id: "checker", name: "Campaign Checker", short: "Pre-send quality checks",
    description: "Runs link, rendering, character-length and personalisation checks before approval.",
    tier: "Core", capabilities: ["Check & Test"], chatAccessible: false, status: "Available", icon: "ListChecks",
  },
  {
    id: "segmentation", name: "Guest Segmentation", short: "Predictive audience builder",
    description: "Predicts likely direct bookers and builds lookalike audiences from your stay history.",
    tier: "Add-on", capabilities: ["Plan & Target"], chatAccessible: false, status: "Coming soon", price: "From $59 / month", icon: "UsersRound",
  },
];

export const agentById = (id: string) => AGENTS.find((a) => a.id === id);
export const CHAT_AGENTS = AGENTS.filter((a) => a.chatAccessible);

/** Direct chat permissions per role. Separate from internal collaboration (below). */
export type AgentPermissions = Record<Role, { chat: boolean; configure: boolean; inspect: boolean }>;
const p = (chat: Role[], configure: Role[] = ["Hotel Admin", "Directful Team"], inspect: Role[] = ["Hotel Admin", "General Manager", "Directful Team"]): AgentPermissions =>
  Object.fromEntries(ROLES.map((r) => [r, { chat: chat.includes(r), configure: configure.includes(r), inspect: inspect.includes(r) }])) as AgentPermissions;

export const DEFAULT_PERMISSIONS: Record<AgentId, AgentPermissions> = {
  marketing: p(["Hotel Admin", "General Manager", "Directful Team"]),
  revenue: p(["Hotel Admin", "General Manager", "Directful Team"]),
  research: p(["Hotel Admin", "Directful Team"]),
  brand: p(["Hotel Admin", "General Manager", "Directful Team"]),
  results: p(["Hotel Admin", "General Manager", "Directful Team"]),
  compliance: p(["Hotel Admin", "Directful Team"]),
  reply: p(["Hotel Admin", "General Manager", "Front Desk", "Directful Team"]),
  operations: p(["Hotel Admin", "Front Desk", "Directful Team"]),
  creator: p([]), autopilot: p([]), checker: p([]), segmentation: p([]),
};

/** Which specialists the Marketing Manager may use internally, regardless of the user's direct access. */
export const COLLABORATION: Partial<Record<AgentId, AgentId[]>> = {
  marketing: ["research", "revenue", "brand", "compliance", "creator", "checker"],
};

export const RESTRICTION_NOTE = "Restricted for your role · Ask a Hotel Admin (Dawit Haile) for access";

/* ---------------- Knowledge Base ---------------- */
export type KnowledgeCategory = "property" | "brand" | "policies" | "documents" | "questions";
export const KB_CATEGORIES: { id: KnowledgeCategory; label: string }[] = [
  { id: "property", label: "Property Knowledge" },
  { id: "brand", label: "Brand Kit" },
  { id: "policies", label: "Policies & Guidelines" },
  { id: "documents", label: "Documents & Resources" },
  { id: "questions", label: "Guest Questions & Auto-responses" },
];
export type SourceStatus = "Active" | "Processing" | "Needs review" | "Inactive";
export type KnowledgeSource = {
  id: string; category: KnowledgeCategory; name: string; type: "Text" | "Document" | "URL" | "Image";
  status: SourceStatus; updated: string; content: string; agents: AgentId[];
};

export const KNOWLEDGE: KnowledgeSource[] = [
  { id: "k1", category: "property", name: "Property overview", type: "Text", status: "Active", updated: "Nov 4, 2026", agents: ["marketing", "research", "reply", "brand"], content: "The Meridian Hotel is a premium city hotel on Bole Road, Addis Ababa, 12 minutes from Bole International Airport. 186 rooms and suites for business and leisure travelers." },
  { id: "k2", category: "property", name: "Contact information", type: "Text", status: "Active", updated: "Oct 12, 2026", agents: ["marketing", "reply", "operations"], content: "+251 11 661 4000 · reservations@meridian-addis.com · meridian-addis.com" },
  { id: "k3", category: "property", name: "Rooms & suites", type: "Text", status: "Active", updated: "Oct 30, 2026", agents: ["marketing", "revenue", "reply"], content: "Deluxe King (112), Deluxe Twin (44), Executive Room (20), Meridian Suite (10). All with rain showers, workspace, and city views." },
  { id: "k4", category: "property", name: "Dining & facilities", type: "Text", status: "Active", updated: "Oct 30, 2026", agents: ["marketing", "reply", "operations"], content: "Saba Restaurant (breakfast 6:30–10:30), Rooftop Lounge, spa, 24h fitness centre, three meeting rooms, secure underground parking." },
  { id: "k5", category: "property", name: "Check-in & checkout", type: "Text", status: "Active", updated: "Sep 18, 2026", agents: ["reply", "operations"], content: "Check-in from 14:00, checkout until 12:00. Late checkout until 15:00 subject to availability, 50% of the nightly rate." },
  { id: "k6", category: "brand", name: "Brand voice", type: "Text", status: "Active", updated: "Nov 2, 2026", agents: ["marketing", "brand", "reply"], content: "Warm, confident, professional, welcoming. Speak like an attentive host — never pushy, never casual slang." },
  { id: "k7", category: "brand", name: "Preferred terminology", type: "Text", status: "Active", updated: "Nov 2, 2026", agents: ["brand", "marketing"], content: "Use: direct bookings, stay, guests, complimentary. Avoid: cheap, deal of the century, act now, limited time only." },
  { id: "k8", category: "brand", name: "Logo & colors", type: "Image", status: "Active", updated: "Aug 21, 2026", agents: ["brand"], content: "Primary navy #1E2A44, warm gold #C9A35B, ivory #F6F1E7. Wordmark: THE MERIDIAN in spaced capitals." },
  { id: "k9", category: "policies", name: "Rate protection rules", type: "Text", status: "Active", updated: "Oct 28, 2026", agents: ["revenue", "marketing"], content: "Never discount below ETB 9,800 per night for Deluxe rooms. Percentage discounts above 25% require GM approval." },
  { id: "k10", category: "policies", name: "Consent & messaging policy", type: "Document", status: "Active", updated: "Oct 15, 2026", agents: ["compliance", "marketing"], content: "SMS and WhatsApp require explicit opt-in. Every SMS includes 'Reply STOP to opt out'. No sends between 21:00 and 08:00 local time." },
  { id: "k11", category: "policies", name: "Cancellation policy", type: "Text", status: "Needs review", updated: "Jul 3, 2026", agents: ["reply"], content: "Free cancellation until 48 hours before arrival. Within 48 hours, first night is charged." },
  { id: "k12", category: "documents", name: "2026 Fact Sheet.pdf", type: "Document", status: "Active", updated: "Sep 9, 2026", agents: ["marketing", "reply"], content: "Two-page property fact sheet with amenities, room counts and meeting capacity." },
  { id: "k13", category: "documents", name: "meridian-addis.com", type: "URL", status: "Active", updated: "Nov 8, 2026", agents: ["marketing", "research", "reply"], content: "Website content crawled from 24 pages." },
  { id: "k14", category: "documents", name: "Approved promotions Q4.xlsx", type: "Document", status: "Processing", updated: "Nov 9, 2026", agents: ["revenue"], content: "Free breakfast on direct booking; third night on us (min. 3 nights); 15% off weekend stays." },
];

export type GuestQuestion = { id: string; q: string; a?: string; status: "Approved" | "Unanswered" | "Needs review"; asked: number; auto: boolean };
export const GUEST_QUESTIONS: GuestQuestion[] = [
  { id: "g1", q: "Do you offer airport transfers?", a: "Yes — a complimentary airport shuttle runs every hour from 06:00 to 23:00. Private transfers are ETB 1,200.", status: "Approved", asked: 64, auto: true },
  { id: "g2", q: "What time is breakfast?", a: "Breakfast at Saba Restaurant is served daily from 6:30 to 10:30.", status: "Approved", asked: 51, auto: true },
  { id: "g3", q: "Is parking available?", a: "Secure underground parking is complimentary for hotel guests.", status: "Approved", asked: 38, auto: true },
  { id: "g4", q: "Can I bring my dog?", status: "Unanswered", asked: 9, auto: false },
  { id: "g5", q: "Do you have rooms for 4 adults?", status: "Unanswered", asked: 7, auto: false },
  { id: "g6", q: "Can I get a late checkout?", a: "Late checkout until 15:00 is available on request for 50% of the nightly rate.", status: "Needs review", asked: 22, auto: false },
];

/* ---------------- Campaign draft ---------------- */
export type Channel = "email" | "sms" | "rcs" | "whatsapp" | "voice";
export const CHANNELS: { id: Channel; label: string }[] = [
  { id: "email", label: "Email" }, { id: "sms", label: "SMS" }, { id: "rcs", label: "RCS" }, { id: "whatsapp", label: "WhatsApp" }, { id: "voice", label: "Voice" },
];
export const STEPS = ["Initial", "Follow-up 1", "Follow-up 2"] as const;
export type Step = 0 | 1 | 2;

export type EmailLayout = "Offer Tile" | "Hero" | "Editorial" | "Video" | "Minimal" | "Promotional";
export const EMAIL_LAYOUTS: EmailLayout[] = ["Offer Tile", "Hero", "Editorial", "Video", "Minimal", "Promotional"];

export type StepContent = {
  delay: string;
  email: { sender: string; subject: string; preheader: string; heading: string; body: string; cta: string; layout: EmailLayout };
  sms: { text: string; media: boolean };
  rcs: { title: string; text: string; cta: string };
  whatsapp: { text: string; buttons: string[] };
  voice: { script: string; voice: string; style: string; language: string };
};

const LINK = "mrdn.co/stay";
export const DRAFT_SEED: { name: string; objective: string; audience: string; eligible: number; channels: Channel[]; offer: string; timing: string; steps: StepContent[] } = {
  name: "OTA Guest Direct Booking Campaign",
  objective: "Encourage guests who booked through OTAs to book directly next time.",
  audience: "OTA All",
  eligible: 2450,
  channels: ["email", "sms"],
  offer: "Free breakfast",
  timing: "Recommended send time",
  steps: [
    {
      delay: "Day 0 · Tue 10:00",
      email: { sender: "The Meridian Hotel", subject: "Your next stay deserves a little extra.", preheader: "Book directly next time and enjoy complimentary breakfast.", heading: "Thank you for staying with us, {first_name}.", body: "We loved welcoming you to The Meridian. When you book your next stay directly with us, breakfast at Saba Restaurant is on the house — every morning of your stay.", cta: "Book direct", layout: "Offer Tile" },
      sms: { text: `Thank you for staying with The Meridian Hotel. Book directly next time and enjoy complimentary breakfast. ${LINK} Reply STOP to opt out.`, media: false },
      rcs: { title: "Breakfast is on us", text: "Book your next Meridian stay directly and enjoy complimentary breakfast every morning.", cta: "Book direct" },
      whatsapp: { text: "Hello {first_name}, thank you for staying with The Meridian Hotel. Book your next stay directly and breakfast is on us.", buttons: ["Book direct", "View rooms"] },
      voice: { script: "Hello, this is The Meridian Hotel in Addis Ababa. Thank you for staying with us. When you book your next stay directly, breakfast is on us. You'll find the link in your messages.", voice: "Hana", style: "Warm", language: "English" },
    },
    {
      delay: "Day 4 · Sat 11:00",
      email: { sender: "The Meridian Hotel", subject: "Breakfast is still on us, {first_name}", preheader: "Your direct booking benefit is waiting.", heading: "Mornings at Saba, on us.", body: "Freshly baked bread, Ethiopian coffee ceremony, and a view over Bole. Book directly for your next visit and breakfast is complimentary.", cta: "Plan my stay", layout: "Hero" },
      sms: { text: `The Meridian Hotel: your complimentary breakfast is waiting when you book direct. ${LINK} Reply STOP to opt out.`, media: false },
      rcs: { title: "Plan your next visit", text: "Business or leisure — book direct and start every morning at Saba.", cta: "See dates" },
      whatsapp: { text: "Planning your next trip to Addis? Book directly with The Meridian and enjoy breakfast on us.", buttons: ["See dates"] },
      voice: { script: "Hello again from The Meridian Hotel. A quick reminder that breakfast is complimentary when you book directly with us.", voice: "Hana", style: "Warm", language: "English" },
    },
    {
      delay: "Day 10 · Fri 10:00",
      email: { sender: "Selam at The Meridian", subject: "A personal note from The Meridian", preheader: "Last reminder: complimentary breakfast on direct bookings.", heading: "We'd love to welcome you back.", body: "This is our last note about your direct booking benefit. Book with us before December 15 and enjoy complimentary breakfast throughout your stay.", cta: "Book direct", layout: "Minimal" },
      sms: { text: `Last reminder from The Meridian Hotel: book direct by Dec 15 for complimentary breakfast. ${LINK} Reply STOP to opt out.`, media: false },
      rcs: { title: "Last reminder", text: "Book direct by December 15 for complimentary breakfast.", cta: "Book direct" },
      whatsapp: { text: "A last reminder from The Meridian: book direct by December 15 and breakfast is on us.", buttons: ["Book direct"] },
      voice: { script: "This is The Meridian Hotel with a final reminder. Book directly by December 15th and enjoy complimentary breakfast.", voice: "Hana", style: "Warm", language: "English" },
    },
  ],
};

export const AUDIENCES = [
  { id: "OTA All", count: 2450 }, { id: "OTA Local", count: 860 }, { id: "Everyone", count: 9120 }, { id: "Everyone Local", count: 3310 },
];
export const OFFERS = ["No offer", "50% off", "Third night on us", "Free breakfast"];
export const TIMINGS = ["As soon as approved", "Tomorrow", "Recommended send time"];

export const AGENT_ACTIVITY: Record<string, { what: string; when: string }[]> = {
  default: [
    { what: "Used property brand guidelines", when: "Today, 09:42" },
    { what: "Reviewed email content", when: "Today, 09:41" },
    { what: "Checked campaign offer", when: "Yesterday, 16:10" },
    { what: "Identified guest audience", when: "Nov 7, 14:22" },
    { what: "Completed compliance review", when: "Nov 6, 11:05" },
  ],
};

/** Variables in message copy rendered with a sample guest. */
export const fillGuest = (s: string) => s.replace(/\{first_name\}/g, "Liya");
