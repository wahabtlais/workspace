import type { DataClass, DemoData, Persona } from "@/data/types";
import { uid } from "@/lib/utils";
import { nowIso, useDemo } from "@/store/demoStore";
import { contextualResponse } from "./contextual";
import { generalResponse } from "./general";
import { runScript } from "./scripts";
import type { AIResponse, Attachment, Block } from "./types";

const has = (p: string, ...w: string[]) => w.some((x) => p.includes(x));

/** Governance rules applied before any answer is produced (simulated: production enforces these server-side). */
function governance(p: string, persona: Persona): AIResponse | null {
  if (has(p, "safeguarding") && has(p, "case", "incident", "detail", "who reported", "list", "show me", "open concerns")) {
    return {
      agent: "AI Workspace", restricted: true, steps: ["Checking what this request needs", "Safeguarding records are excluded from AI"],
      blocks: [
        { kind: "notice", tone: "governance", text: "I can’t access safeguarding records. They are never available to AI assistants, for anyone, including leadership." },
        { kind: "text", text: "If you need to report a concern, use “Report a concern”. If you need information about an existing case, contact the Safeguarding Lead directly." },
      ],
      sources: [{ label: "Safeguarding: report a concern", link: "/safeguarding" }, { label: "AI & your data", why: "What AI can and cannot use", link: "/ai/trust" }],
      reasoning: "Safeguarding is the most restricted data class. It is excluded from every AI index and assistant.",
      dataUsed: [],
    };
  }
  const pupilIndividual = has(p, "pupil names", "names of pupils", "which pupils", "list pupils", "list the pupils", "pupil's", "individual pupil", "child's");
  if (pupilIndividual && !persona.grants.includes("pupil-data")) {
    return {
      agent: "AI Workspace", restricted: true, steps: ["Checking your permissions for pupil data"],
      blocks: [
        { kind: "notice", tone: "governance", text: "Pupils are children, so individual pupil information has stricter controls. Your role can see aggregated figures only (by school, grade or class)." },
        { kind: "text", text: "I can give you the same answer as class- or school-level figures instead. For example: “Summarise pupil attendance this term”." },
      ],
      sources: [{ label: "AI & your data", link: "/ai/trust" }],
      reasoning: "Your role does not have the pupil-data permission. Class teachers and assigned Project Officers with that permission can see individual records.",
      dataUsed: [], followUps: ["Summarise pupil attendance this term"],
    };
  }
  if (has(p, "salary", "salaries", "payroll") && !persona.grants.includes("staff-HR")) {
    return {
      agent: "AI Workspace", restricted: true, steps: ["Checking your permissions for staff HR data"],
      blocks: [{ kind: "notice", tone: "governance", text: "Salary and payroll information is staff-HR data. Your role doesn’t have access to it, so I can’t use it either." }],
      sources: [{ label: "AI & your data", link: "/ai/trust" }], reasoning: "AI inherits your permissions; it never has more access than you.", dataUsed: [],
    };
  }
  return null;
}

function fromScript(prompt: string, persona: Persona, d: DemoData, context?: string): AIResponse {
  const run = runScript(prompt, persona, d, context);
  if (run.answer[0]?.startsWith("Here’s what I can do")) return generic(prompt, persona);
  const blocks: Block[] = [];
  for (const line of run.answer) {
    const last = blocks[blocks.length - 1];
    if (line.startsWith("• ")) {
      if (last?.kind === "bullets") last.items.push(line.slice(2));
      else blocks.push({ kind: "bullets", items: [line.slice(2)] });
    } else blocks.push({ kind: "text", text: line });
  }
  return { agent: run.agent, steps: run.steps, blocks, sources: run.sources.map((label) => ({ label })), proposedAction: run.proposedAction, reasoning: "Computed from the platform records you are allowed to see.", dataUsed: ["standard"] };
}

function generic(prompt: string, persona: Persona): AIResponse {
  return {
    agent: "AI Workspace",
    steps: ["Understanding your request", "Planning a structure", "Drafting a starting point"],
    blocks: [
      { kind: "text", text: `Here is a starting point for “${prompt}”. Edit it directly, or tell me what to change.` },
      { kind: "doc", title: "Draft", docType: "Google Doc", body: `Purpose\nWhat this is for and who will read it.\n\nKey points\n1. The situation today\n2. What we propose and why\n3. What we need, from whom, by when\n\nNext steps\nOwner, date and how we will know it worked.` },
      { kind: "notice", tone: "info", text: `Simulated AI: the prototype recognises common work tasks (emails, translations, analyses, presentations, plans, summaries and CodeBrave records). In production, ${persona.name.split(" ")[0]} could ask for any legitimate work task.` },
    ],
    sources: [], reasoning: "A general structure for a work document.", dataUsed: [],
    followUps: ["Analyze the sample expense spreadsheet", "Draft an email to a school principal", "Which of my tasks could AI do for me?"],
  };
}

/** One entry point for every AI surface: AI Workspace, contextual actions and the side panel. */
export function respond(prompt: string, persona: Persona, d: DemoData, opts: { context?: string; files?: Attachment[] } = {}): AIResponse {
  const p = prompt.toLowerCase();
  const files = opts.files ?? [];
  return governance(p, persona) ?? generalResponse(p, persona, d, files) ?? contextualResponse(p, persona, d, opts.context) ?? fromScript(prompt, persona, d, opts.context);
}

/** Every AI answer and confirmed action is written to the audit log (Admin › Audit log, AI & your data). */
export function logAI(persona: Persona, action: string, target: string, dataClass: DataClass = "standard") {
  useDemo.getState().update((d) => {
    d.audit.unshift({ id: uid("au"), at: nowIso(), actor: `AI assistant (for ${persona.name})`, action, target: target.length > 80 ? target.slice(0, 77) + "…" : target, dataClass });
  });
}
