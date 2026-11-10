import { useSyncExternalStore } from "react";
import {
  AGENTS, DEFAULT_PERMISSIONS, DRAFT_SEED, GUEST_QUESTIONS, KNOWLEDGE,
  type AgentId, type AgentPermissions, type GuestQuestion, type KnowledgeSource, type StepContent,
} from "@/lib/studio-data";

export type Mode = "simple" | "expert";
export type Message =
  | { id: string; from: "user"; text: string }
  | { id: string; from: "agent"; text: string; kind?: "text" | "campaign" | "list"; items?: string[] };
export type Conversation = { id: string; agent: AgentId; title: string; updated: string; messages: Message[] };

type Draft = typeof DRAFT_SEED & { generated: boolean; status: "Draft · Awaiting approval" | "Approved · Scheduled" };

type State = {
  mode: Mode;
  conversations: Conversation[];
  active: Partial<Record<AgentId, string | null>>; // active conversation per agent
  permissions: Record<AgentId, AgentPermissions>;
  instructions: Partial<Record<AgentId, string>>;
  knowledge: KnowledgeSource[];
  questions: GuestQuestion[];
  draft: Draft;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const seedConversations: Conversation[] = [
  {
    id: "c-seed-1", agent: "marketing", title: "December festive campaign ideas", updated: "Yesterday",
    messages: [
      { id: "m1", from: "user", text: "What should we run for the December holidays?" },
      { id: "m2", from: "agent", kind: "list", text: "Three directions worth considering for December:", items: ["Genna weekend staycation for Addis locals", "Corporate year-end meeting packages", "Returning guest thank-you with late checkout"] },
    ],
  },
  {
    id: "c-seed-2", agent: "revenue", title: "Weekend occupancy gap", updated: "Nov 6",
    messages: [
      { id: "m3", from: "user", text: "Weekends look soft in January. Any ideas?" },
      { id: "m4", from: "agent", text: "January weekends are pacing at 58% vs 71% last year. A 'third night on us' offer stays above your ETB 9,800 rate floor and targets leisure guests who already stay two nights." },
    ],
  },
];

let state: State = {
  mode: "simple",
  conversations: seedConversations,
  active: {},
  permissions: structuredClone(DEFAULT_PERMISSIONS),
  instructions: { marketing: "Prioritize direct bookings. Maintain a professional, welcoming hotel voice. Never recommend promotions below the property's approved rate floor." },
  knowledge: KNOWLEDGE,
  questions: GUEST_QUESTIONS,
  draft: { ...structuredClone(DRAFT_SEED), generated: false, status: "Draft · Awaiting approval" },
};

const listeners = new Set<() => void>();
const set = (fn: (s: State) => State) => { state = fn(state); listeners.forEach((l) => l()); };
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const getServer = () => state;

export function useStudio<T>(select: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => select(state), () => select(getServer()));
}

export const actions = {
  setMode: (mode: Mode) => set((s) => ({ ...s, mode })),
  newConversation: (agent: AgentId) => set((s) => ({ ...s, active: { ...s.active, [agent]: null } })),
  openConversation: (agent: AgentId, id: string) => set((s) => ({ ...s, active: { ...s.active, [agent]: id } })),
  /** Appends the user's message; returns the conversation id. */
  send: (agent: AgentId, text: string) => {
    let id = state.active[agent] ?? null;
    const msg: Message = { id: uid(), from: "user", text };
    if (!id) {
      id = uid();
      const conv: Conversation = { id, agent, title: text.length > 48 ? text.slice(0, 48) + "…" : text, updated: "Just now", messages: [msg] };
      set((s) => ({ ...s, conversations: [conv, ...s.conversations], active: { ...s.active, [agent]: id } }));
    } else {
      const cid = id;
      set((s) => ({ ...s, conversations: s.conversations.map((c) => (c.id === cid ? { ...c, updated: "Just now", messages: [...c.messages, msg] } : c)) }));
    }
    return id;
  },
  reply: (convId: string, m: Omit<Extract<Message, { from: "agent" }>, "id" | "from">) =>
    set((s) => ({ ...s, conversations: s.conversations.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, { id: uid(), from: "agent", ...m }] } : c)) })),
  generateDraft: () => set((s) => ({ ...s, draft: { ...s.draft, generated: true } })),
  updateDraft: (patch: Partial<Draft>) => set((s) => ({ ...s, draft: { ...s.draft, ...patch } })),
  updateStep: <K extends keyof StepContent>(step: number, key: K, patch: Partial<StepContent[K]>) =>
    set((s) => ({
      ...s,
      draft: { ...s.draft, steps: s.draft.steps.map((st, i) => (i === step ? { ...st, [key]: typeof st[key] === "object" ? { ...(st[key] as object), ...patch } : patch } : st)) },
    })),
  setPermissions: (agent: AgentId, p: AgentPermissions) => set((s) => ({ ...s, permissions: { ...s.permissions, [agent]: p } })),
  setInstructions: (agent: AgentId, text: string) => set((s) => ({ ...s, instructions: { ...s.instructions, [agent]: text } })),
  toggleAccess: (sourceId: string, agent: AgentId) =>
    set((s) => ({ ...s, knowledge: s.knowledge.map((k) => (k.id === sourceId ? { ...k, agents: k.agents.includes(agent) ? k.agents.filter((a) => a !== agent) : [...k.agents, agent] } : k)) })),
  upsertSource: (src: KnowledgeSource) =>
    set((s) => ({ ...s, knowledge: s.knowledge.some((k) => k.id === src.id) ? s.knowledge.map((k) => (k.id === src.id ? src : k)) : [src, ...s.knowledge] })),
  removeSource: (id: string) => set((s) => ({ ...s, knowledge: s.knowledge.filter((k) => k.id !== id) })),
  updateQuestion: (q: GuestQuestion) => set((s) => ({ ...s, questions: s.questions.map((x) => (x.id === q.id ? q : x)) })),
};

export const newId = uid;

/** Mock check: can a role chat directly with an agent? The real check belongs on the server. */
export const canChat = (perms: Record<AgentId, AgentPermissions>, agent: AgentId, role: keyof AgentPermissions) =>
  !!AGENTS.find((a) => a.id === agent)?.chatAccessible && perms[agent][role].chat;
