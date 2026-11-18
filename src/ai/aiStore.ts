import { create } from "zustand";
import type { Persona, RoleKey } from "@/data/types";
import { getPersona } from "@/config/personas";
import { uid } from "@/lib/utils";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { logAI, respond } from "./engine";
import { SAMPLE_FILES } from "./files";
import type { AIResponse, Attachment } from "./types";

export interface Turn { id: string; prompt: string; files: Attachment[]; context?: string; response: AIResponse; stepsDone: number; done: boolean; action?: "confirmed" | "dismissed" }
export interface Conversation { id: string; title: string; personaId: string; context?: string; createdAt: string; turns: Turn[] }

type Seed = { title: string; prompt: string; files?: string[]; when: string };
const SEEDS: Partial<Record<RoleKey, Seed[]>> & { default: Seed[] } = {
  ops_hr: [{ title: "Expense review Jul–Oct", prompt: "Analyze this spreadsheet for trends and anomalies", files: ["expenses"], when: "Yesterday" }, { title: "Email to Finance", prompt: "Draft an email to Finance about the possible duplicate internet invoice", when: "Yesterday" }],
  curriculum: [{ title: "Teacher survey themes", prompt: "Analyze this survey and summarise the themes", files: ["survey"], when: "Mon" }, { title: "Parent letter in Arabic", prompt: "Translate this letter into Arabic", files: ["parents"], when: "Last week" }],
  fundraising: [{ title: "Northbridge call: key facts", prompt: "Extract the key dates, amounts and criteria", files: ["call"], when: "Yesterday" }, { title: "Proposal draft", prompt: "Draft a proposal for Girls in Tech Futures 2027", when: "Mon" }],
  exec: [{ title: "Weekly briefing", prompt: "Give me this week's executive briefing", when: "Mon" }, { title: "Board deck outline", prompt: "Create a board presentation outline for December", when: "Last week" }],
  su_po: [{ title: "Visit brief: Cedar Hill", prompt: "Prepare a visit brief for Cedar Hill", when: "Today" }, { title: "Recurring challenges", prompt: "Consolidate recurring challenges from my visit reports into an improvement brief", when: "Last week" }],
  su_pm: [{ title: "Ministry meeting notes", prompt: "Summarize these meeting notes", files: ["notes"], when: "Fri" }, { title: "Observation analysis", prompt: "Analyze observations across schools", when: "Last week" }],
  su_trainer: [{ title: "Certification readiness", prompt: "Which TFs are ready for certification?", when: "Yesterday" }],
  fb_pm: [{ title: "Cohort progress", prompt: "Summarise cohort progress", when: "Mon" }, { title: "At-risk students", prompt: "Which students are at risk?", when: "Last week" }],
  fb_po: [{ title: "At-risk students", prompt: "Which students are at risk?", when: "Yesterday" }],
  fb_trainer: [{ title: "Project progress", prompt: "Analyze project progress", when: "Yesterday" }],
  me: [{ title: "Indicator explanation", prompt: "Explain the change in observation scores and learning gain", when: "Mon" }],
  default: [{ title: "Plan my week", prompt: "Help me plan my week", when: "Mon" }],
};

const filesFor = (ids?: string[]) => (ids ?? []).map((id) => SAMPLE_FILES.find((f) => f.sampleId === id)!).filter(Boolean);
const me = () => getPersona(useDemo.getState().personaId);

function compute(prompt: string, persona: Persona, files: Attachment[], context?: string) {
  return respond(prompt, persona, useDemo.getState().data, { context, files });
}

interface AIState {
  conversations: Conversation[];
  seeded: string[];
  ensureSeeded: (persona: Persona) => void;
  create: (context?: string) => string;
  ask: (convId: string, prompt: string, files?: Attachment[], context?: string) => void;
  setAction: (convId: string, turnId: string, action: Turn["action"]) => void;
  confirm: (convId: string, turn: Turn) => void;
  remove: (convId: string) => void;
}

export const useAI = create<AIState>()((set, get) => ({
  conversations: [],
  seeded: [],

  ensureSeeded: (persona) => {
    if (get().seeded.includes(persona.id)) return;
    const seeds = SEEDS[persona.role] ?? SEEDS.default;
    const convs: Conversation[] = seeds.map((s) => {
      const files = filesFor(s.files);
      return { id: uid("conv"), title: s.title, personaId: persona.id, createdAt: s.when, turns: [{ id: uid("t"), prompt: s.prompt, files, response: compute(s.prompt, persona, files), stepsDone: 99, done: true }] };
    });
    set((st) => ({ seeded: [...st.seeded, persona.id], conversations: [...st.conversations, ...convs] }));
  },

  create: (context) => {
    const id = uid("conv");
    set((st) => ({ conversations: [{ id, title: "New conversation", personaId: me().id, context, createdAt: "Today", turns: [] }, ...st.conversations] }));
    return id;
  },

  ask: (convId, prompt, files = [], context) => {
    const persona = me();
    const response = compute(prompt, persona, files, context);
    const turnId = uid("t");
    set((st) => ({ conversations: st.conversations.map((c) => c.id === convId ? { ...c, title: c.turns.length ? c.title : prompt.length > 48 ? prompt.slice(0, 46) + "…" : prompt, turns: [...c.turns, { id: turnId, prompt, files, context, response, stepsDone: 0, done: false }] } : c) }));
    const patch = (fn: (t: Turn) => Turn) => set((st) => ({ conversations: st.conversations.map((c) => c.id === convId ? { ...c, turns: c.turns.map((t) => (t.id === turnId ? fn(t) : t)) } : c) }));
    response.steps.forEach((_, i) => window.setTimeout(() => patch((t) => ({ ...t, stepsDone: i + 1 })), 420 * (i + 1)));
    window.setTimeout(() => {
      patch((t) => ({ ...t, done: true }));
      logAI(persona, response.restricted ? "Declined a request (restricted data)" : `Answered: “${prompt}”`, response.sources[0]?.label ?? (files[0]?.name ?? "General work task"), response.restricted ? "safeguarding" : response.dataUsed?.[response.dataUsed.length - 1] ?? "standard");
    }, 420 * (response.steps.length + 1));
  },

  setAction: (convId, turnId, action) => set((st) => ({ conversations: st.conversations.map((c) => c.id === convId ? { ...c, turns: c.turns.map((t) => (t.id === turnId ? { ...t, action } : t)) } : c) })),

  confirm: (convId, turn) => {
    const a = turn.response.proposedAction;
    if (!a) return;
    const msg = a.apply();
    logAI(me(), `Action confirmed by user: ${a.label}`, turn.prompt);
    toast({ tone: "ai", title: "Done (simulated)", body: msg });
    get().setAction(convId, turn.id, "confirmed");
  },

  remove: (convId) => set((st) => ({ conversations: st.conversations.filter((c) => c.id !== convId) })),
}));
