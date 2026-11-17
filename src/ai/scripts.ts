import type { DemoData, Persona } from "@/data/types";
import { attendanceRate, attendeeRate, fbRegisters, pupilRegistersFor } from "@/lib/metrics";
import { addDays, DEMO_TODAY } from "@/lib/utils";

export interface AIRun {
  agent: string;
  steps: string[];
  answer: string[];
  sources: string[];
  proposedAction?: { label: string; kind: "request" | "task" };
}

const has = (p: string, ...words: string[]) => words.some((w) => p.includes(w));

/** Scripted, deterministic responses over the fictional dataset, so demos never fail. */
export function runScript(prompt: string, persona: Persona, data: DemoData): AIRun {
  const p = prompt.toLowerCase();

  if (has(p, "visited", "not been visited", "haven’t been visited", "havent been visited")) {
    const since = addDays(DEMO_TODAY, -30);
    const visited = new Set(data.visits.filter((v) => v.status !== "Planned" && v.date >= since).map((v) => v.schoolId));
    const notVisited = data.schools.filter((s) => s.status === "Active" && !visited.has(s.id));
    return {
      agent: "Program Delivery Agent",
      steps: ["Reading visit records for the last 30 days", "Comparing against active partner schools", "Checking planned visits"],
      answer: notVisited.length
        ? [`${notVisited.length} active school${notVisited.length > 1 ? "s have" : " has"} had no completed visit in the last 30 days:`, ...notVisited.map((s) => `• ${s.name} (${s.region})`), "Would you like me to propose visit dates in the visit planner?"]
        : ["Every active school has had at least one completed visit in the last 30 days."],
      sources: ["Visits & observations (last 30 days)", "Schools registry"],
      proposedAction: notVisited.length ? { label: "Propose visit dates", kind: "task" } : undefined,
    };
  }

  if (has(p, "laptop", "equipment", "need a")) {
    return {
      agent: "Operations & HR Agent",
      steps: ["Understanding the request", "Matching the Equipment request type", "Pre-filling the form from your profile"],
      answer: ["I prepared an Equipment request for you:", "• Item: standard staff laptop with charger and bag", `• Needed by: ${addDays(DEMO_TODAY, 7)}`, "• Approval chain: line manager → Operations", "Nothing is submitted until you confirm."],
      sources: ["Knowledge base: Equipment and laptop requests", "Request type: Equipment"],
      proposedAction: { label: "Submit this request", kind: "request" },
    };
  }

  if (has(p, "at-risk", "at risk", "drifting", "struggling")) {
    const regs = fbRegisters(data);
    const active = data.students.filter((s) => s.cohortId === "fbc-2" && s.status === "Active");
    const risky = active.map((s) => ({ s, rate: attendeeRate(regs, s.id) })).filter((x) => x.rate < 75).sort((a, b) => a.rate - b.rate);
    return {
      agent: "Program Delivery Agent",
      steps: ["Reading attendance for Future Builders 2026–27", "Checking recent submissions and team activity", "Pseudonymising learner data for the summary"],
      answer: risky.length
        ? [`${risky.length} student${risky.length > 1 ? "s are" : " is"} below 75% attendance:`, ...risky.map(({ s, rate }) => `• Student ${s.id.slice(-2)} (${s.pathway.toUpperCase()}): ${rate}% attendance, absence streak in the last 3 sessions`), "Absence follow-up tasks already exist for both. I can draft a check-in message for the PO."]
        : ["No students are currently below the 75% attendance threshold."],
      sources: ["Attendance service: FB registers", "Learning Hub submissions"],
      proposedAction: risky.length ? { label: "Draft check-in message", kind: "task" } : undefined,
    };
  }

  if (has(p, "attendance")) {
    const classIds = data.classes.map((c) => c.id);
    const rate = attendanceRate(pupilRegistersFor(data, classIds));
    return {
      agent: "Reporting & Insights Agent",
      steps: ["Reading aggregated attendance", "Comparing against targets", "Drafting a short summary"],
      answer: [`Pupil classroom attendance across partner schools is ${rate}% this term (target 85%).`, "One school shows a declining trend over six weeks; a follow-up is open with the assigned Project Officer.", "Figures are aggregated: no individual pupil names are used by agents."],
      sources: ["Indicator SU-03: pupil classroom attendance", "Attendance service (aggregates only)"],
    };
  }

  if (has(p, "report", "draft", "summar")) {
    return {
      agent: "Reporting & Insights Agent",
      steps: ["Gathering indicators", "Collecting evidence and recent activity", "Drafting sections", "Checking every figure against its source"],
      answer: ["Draft ready for your review. Highlights:", "• Pupils reached: 790 of 900 target (88%)", "• Average learning gain 2025–26: +22.1 points (target +20)", "• TFs certified: 12 (cohort 2026–27 in training)", "Every figure links to its indicator. The draft stays a draft until a person approves it."],
      sources: ["Results & Indicators: SU-01, SU-02, SU-05", "Evidence library", "Grant gr-1 template"],
      proposedAction: { label: "Open draft for editing", kind: "task" },
    };
  }

  return {
    agent: "Ask CodeBrave",
    steps: ["Searching the knowledge base", "Checking records you have access to"],
    answer: [
      `Here’s what I can help with as ${persona.title}:`,
      "• Answer questions from the knowledge base and your permitted data",
      "• Prepare drafts (reports, plans, messages) for you to edit",
      "• Fill in requests from a sentence; you confirm before anything is submitted",
      "Try: “Which schools haven’t been visited this month?” or “I need a laptop for the new trainer next week.”",
    ],
    sources: ["Knowledge base"],
  };
}

export const SUGGESTIONS: Record<string, string[]> = {
  exec: ["Summarise how we are doing on our strategic priorities", "Draft the monthly management report", "Which schools haven’t been visited this month?"],
  su_pm: ["Which schools haven’t been visited this month?", "Summarise pupil attendance this term", "Draft the School Upskilling monthly report"],
  su_po: ["Draft visit report for Cedar Hill", "Which schools haven’t been visited this month?", "I need a laptop for the new trainer next week"],
  su_trainer: ["Summarise TF training attendance", "Draft feedback for the lesson plan assignment"],
  fb_pm: ["Which students are at risk?", "Summarise admissions this cycle", "Draft the Future Builders monthly report"],
  fb_po: ["Which students are at risk?", "Draft a check-in message for absent students"],
  fb_trainer: ["Which students are at risk?", "Summarise team project milestones"],
  curriculum: ["Draft a lesson for an objective", "Summarise trainer feedback themes"],
  ops_hr: ["I need a laptop for the new trainer next week", "Summarise open requests by stage"],
  fundraising: ["Draft the semi-annual report for Northbridge", "Summarise pupil attendance this term"],
  me: ["Summarise pupil attendance this term", "Draft an indicator variance note"],
  default: ["What can you help me with?", "I need a laptop for the new trainer next week"],
};
