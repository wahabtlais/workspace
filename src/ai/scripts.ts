import type { DemoData, Persona } from "@/data/types";
import { attendanceRate, attendeeRate, sessionProgress } from "@/lib/metrics";
import { certificationCriteria, isEligible } from "@/lib/certification";
import { liveValues } from "@/lib/indicators";
import { addDays, DEMO_TODAY, formatDate } from "@/lib/utils";
import { AI_ACTIONS } from "./actions";

export interface AIRun {
  agent: string;
  steps: string[];
  answer: string[];
  sources: string[];
  proposedAction?: { label: string; apply: () => string };
}

const has = (p: string, ...w: string[]) => w.some((x) => p.includes(x));

/** Scripted, deterministic responses computed from the shared fictional records, so demos never fail. */
export function runScript(prompt: string, persona: Persona, d: DemoData, context?: string): AIRun {
  const p = prompt.toLowerCase();

  if (has(p, "laptop", "equipment", "need a ")) return { agent: "Operations & HR Agent", steps: ["Understanding the request", "Matching the Equipment request type", "Pre-filling the form from your profile"], answer: ["I prepared an Equipment request:", "• Item: standard staff laptop with charger and bag", `• Needed by: ${formatDate(addDays(DEMO_TODAY, 7))}`, "• Approval chain: line manager → Operations", "Nothing is submitted until you confirm."], sources: ["Knowledge base: Equipment and laptop requests", "Request type: Equipment"], proposedAction: { label: "Submit this request", apply: AI_ACTIONS.laptopRequest } };

  if (has(p, "visit report")) {
    const school = d.schools.find((s) => (context ?? p).toLowerCase().includes(s.name.split(" ")[0].toLowerCase())) ?? d.schools[0];
    const v = d.visits.filter((x) => x.schoolId === school.id && x.status !== "Planned").sort((a, b) => b.date.localeCompare(a.date))[0];
    return { agent: "Program Delivery Agent", steps: ["Reading the latest visit and observation", "Checking open follow-ups for the school", "Drafting the report"], answer: [`Draft visit report: ${school.name}, ${v ? formatDate(v.date) : "latest visit"}`, `• Observation score: ${v?.score ?? "n/a"} / 4 (${v?.score !== undefined && v.score < 2.5 ? "below the 2.5 coaching threshold" : "on track"})`, `• Open follow-ups: ${d.followUps.filter((f) => f.schoolId === school.id && f.status !== "Done").length}`, `• Recommended focus: ${v?.score !== undefined && v.score < 2.5 ? "classroom routines and device management" : "extend pupil-led activities"}`], sources: [`Visits: ${school.name}`, "Observation rubric", "Follow-ups"], proposedAction: { label: "Save draft to Documents", apply: () => AI_ACTIONS.visitReport(school.name) } };
  }

  if (has(p, "visited")) {
    const since = addDays(DEMO_TODAY, -30);
    const missing = d.schools.filter((s) => s.status === "Active" && !d.visits.some((v) => v.schoolId === s.id && v.status !== "Planned" && v.date >= since && v.date <= DEMO_TODAY) && !d.visits.some((v) => v.schoolId === s.id && v.status === "Planned"));
    return { agent: "Program Delivery Agent", steps: ["Reading visits for the last 30 days", "Comparing with active partner schools", "Checking planned visits"], answer: missing.length ? [`${missing.length} active school${missing.length > 1 ? "s have" : " has"} no visit in the last 30 days and none planned:`, ...missing.map((s) => `• ${s.name} (${s.region})`)] : ["Every active school was visited in the last 30 days or has a planned visit."], sources: ["Visits & observations", "Schools registry"], proposedAction: missing.length ? { label: `Plan ${missing.length} visit${missing.length > 1 ? "s" : ""}`, apply: () => AI_ACTIONS.planVisits(missing.map((s) => s.id)) } : undefined };
  }

  if (has(p, "coaching")) {
    const low = d.visits.filter((v) => v.score !== undefined && v.score < 2.5).sort((a, b) => b.date.localeCompare(a.date))[0];
    const tf = d.tfs.find((t) => t.id === low?.tfId);
    return { agent: "Program Delivery Agent", steps: ["Finding the most recent low observation", "Reviewing rubric criteria", "Drafting a 3-week coaching plan"], answer: [`Coaching plan for ${tf?.name ?? "the Teaching Fellow"} (score ${low?.score ?? "n/a"} / 4):`, "• Week 1: co-plan a lesson with clear routines for collecting devices", "• Week 2: observe a peer TF’s classroom routines", "• Week 3: follow-up observation focused on pupil engagement"], sources: ["Observation rubric", "Knowledge base: classroom routines"], proposedAction: { label: "Add plan to Follow-ups", apply: () => AI_ACTIONS.coachingPlan(tf?.id) } };
  }

  if (has(p, "at risk", "at-risk", "drifting", "check-in")) {
    const regs = d.registers.filter((r) => r.kind === "fb");
    const risky = d.students.filter((s) => s.cohortId === "fbc-2" && s.status === "Active").map((s) => ({ s, rate: attendeeRate(regs, s.id) })).filter((x) => x.rate < 75).sort((a, b) => a.rate - b.rate);
    return { agent: "Program Delivery Agent", steps: ["Reading Future Builders attendance", "Checking submissions and team activity", "Pseudonymising learner data"], answer: risky.length ? [`${risky.length} student${risky.length > 1 ? "s are" : " is"} below 75% attendance (names pseudonymised for the agent):`, ...risky.map(({ s, rate }) => `• Student ${s.id.slice(-2)} (${s.pathway.toUpperCase()}): ${rate}% attendance, ${d.submissions.filter((x) => x.learnerId === s.id).length} submissions this term`), "I can create check-in tasks for the Project Officer."] : ["No students are below 75% attendance."], sources: ["Attendance service (pseudonymised)", "Learning Hub submissions"], proposedAction: risky.length ? { label: "Create check-in tasks", apply: () => AI_ACTIONS.checkIn(risky.map((x) => x.s.id)) } : undefined };
  }

  if (has(p, "eligib")) {
    const o = d.opportunities.find((x) => p.includes(x.title.toLowerCase().slice(0, 12))) ?? d.opportunities.find((x) => x.id === "opp-1")!;
    return { agent: "Fundraising Agent", steps: ["Reading the call text", "Comparing with the organization profile", "Checking past proposals and live indicators"], answer: [`Eligibility for “${o.title}” (${o.funder}):`, "• Registered non-profit 3+ years: met", "• Program fits the call’s focus: met", "• Works with the target age group: met", "• Audited accounts: met", "• Co-funding: needs a human decision", "Suggested fit: 81%."], sources: ["Call text (simulated)", "Organization profile", "Indicators FB-01, FB-03"], proposedAction: { label: "Apply checklist to the opportunity", apply: () => AI_ACTIONS.eligibility(o.id) } };
  }

  if (has(p, "certif")) {
    const rows = d.tfs.filter((t) => t.cohortId === "tfc-2").map((t) => ({ t, c: certificationCriteria(d, t) }));
    const ready = rows.filter((r) => isEligible(r.c)), blocked = rows.filter((r) => r.c.some((x) => x.met === false));
    return { agent: "Program Delivery Agent", steps: ["Evaluating certification criteria for TF Cohort 2026–27"], answer: [`${ready.length} TF${ready.length === 1 ? "" : "s"} meet every criterion; ${blocked.length} have a criterion not met; the rest are waiting for the post-training assessment.`, ...blocked.map((r) => `• ${r.t.name}: ${r.c.filter((x) => x.met === false).map((x) => `${x.label} (${x.detail})`).join("; ")}`), ...ready.map((r) => `• Ready: ${r.t.name}`)], sources: ["Attendance service: TF training", "Assessment Hub: TF assessments"] };
  }

  if (has(p, "consent")) {
    const pend = d.students.filter((s) => s.status === "Pending consent");
    return { agent: "Ask CodeBrave", steps: ["Checking consent records"], answer: pend.length ? [`${pend.length} admitted student${pend.length > 1 ? "s are" : " is"} waiting for guardian consent; their accounts stay inactive:`, ...pend.map((s) => `• ${s.firstName} (${s.cohortId === "fbc-3" ? "2027–28" : "2026–27"})`)] : ["No students are waiting for consent."], sources: ["Consent & Safeguarding service"] };
  }

  if (has(p, "obligation", "deadline", "due")) {
    const o = d.obligations.filter((x) => x.status !== "Submitted").sort((a, b) => a.due.localeCompare(b.due));
    return { agent: "Fundraising Agent", steps: ["Reading grant obligations"], answer: ["Upcoming donor obligations:", ...o.map((x) => `• ${formatDate(x.due)}: ${x.title} (${x.status})`)], sources: ["Grants & obligations"] };
  }

  if (has(p, "submission", "assessment status", "missing")) {
    const live = d.assessmentSessions.filter((s) => s.status === "Live" || s.status === "Reconciling");
    return { agent: "Ask CodeBrave", steps: ["Reading live assessment sessions"], answer: [`${live.length} session${live.length === 1 ? " is" : "s are"} live or reconciling:`, ...live.map((s) => { const c = sessionProgress(s.entries); return `• ${s.title}: ${c.submitted}/${s.entries.length} submitted, ${c.failed} failed, ${c.pending_sync} waiting to sync`; })], sources: ["Assessment Hub: live tracker"] };
  }

  if (has(p, "request")) {
    const by = (st: string) => d.requests.filter((r) => r.status === st).length;
    const stuck = d.requests.filter((r) => r.status === "In approval").map((r) => `${r.id} waiting for ${r.chain.find((c) => c.status === "pending")?.label}`);
    return { agent: "Operations & HR Agent", steps: ["Reading requests and approval chains"], answer: [`In approval: ${by("In approval")} · approved: ${by("Approved")} · assigned: ${by("Assigned")} · completed: ${by("Completed")}`, ...stuck.map((x) => `• ${x}`)], sources: ["Operations & HR: requests"] };
  }

  if (has(p, "lesson")) return { agent: "Curriculum Agent", steps: ["Reading the objective FB.ENT.3 (pitching)", "Checking the Career Readiness draft", "Drafting a lesson plan"], answer: ["Draft lesson: “Professional email writing” (60 min, objective FB.ENT.3).", "Warm-up spot-the-problems, a model template, pair writing with feedback, exit ticket.", "It goes into the Career Readiness Essentials draft for your review."], sources: ["Framework: FB objectives", "Curriculum: Career Readiness Essentials v0.1"], proposedAction: { label: "Add lesson to the draft", apply: AI_ACTIONS.draftLesson } };

  if (has(p, "attendance")) {
    const v = liveValues(d);
    return { agent: "Reporting & Insights Agent", steps: ["Reading aggregated attendance", "Comparing with targets"], answer: [`Pupil classroom attendance: ${v["ind-su-att"]}% (target 85%), register completion ${v["ind-su-reg"]}%.`, `Future Builders session attendance: ${v["ind-fb-att"]}%. TF training attendance: ${attendanceRate(d.registers.filter((r) => r.kind === "tf"))}%.`, "Pupil figures are aggregated; agents never see pupil names."], sources: ["Indicators SU-03, SU-04, FB-02 (live)"] };
  }

  if (has(p, "report", "draft", "summar", "how are we doing", "priorit", "variance")) {
    const v = liveValues(d);
    return { agent: "Reporting & Insights Agent", steps: ["Gathering live indicators", "Collecting consented evidence", "Drafting sections", "Checking every figure against its source"], answer: ["Highlights for the draft:", `• Pupils reached: ${v["ind-su-reach"]} of 900`, `• Learning gain 2025–26: +${v["ind-su-gain"]} points (target +20)`, `• TFs certified: ${v["ind-su-cert"]} of 26 · observation average ${v["ind-su-obs"]} / 4 (target 3.0)`, `• FB attendance ${v["ind-fb-att"]}% · ${v["ind-fb-active"]} active students`, "Every figure links to its indicator. Drafts stay drafts until a person approves them."], sources: ["Results & Indicators (live)", "Evidence library (consented only)"], proposedAction: { label: "Save as draft document", apply: () => AI_ACTIONS.draftDoc(context ? `${context} report` : "Monthly management report", context ?? "Executive") } };
  }

  if (has(p, "how do i", "policy", "leave", "register", "safeguard")) {
    const kb = d.kb.find((k) => p.split(/\W+/).some((w) => w.length > 4 && k.title.toLowerCase().includes(w))) ?? d.kb[1];
    return { agent: "Ask CodeBrave", steps: ["Searching the knowledge base"], answer: [`From “${kb.title}”:`, kb.summary, "Open the article in Knowledge for the full steps."], sources: [`Knowledge base: ${kb.title}`] };
  }

  return { agent: "Ask CodeBrave", steps: ["Searching the knowledge base", "Checking records you can access"], answer: [`Here’s what I can do for you as ${persona.title}:`, "• Answer questions from the knowledge base and your permitted data", "• Prepare drafts (reports, plans, lessons) for you to edit", "• Fill requests and tasks from a sentence; you confirm before anything changes", "Try the Task library for one-click tasks."], sources: ["Knowledge base"] };
}

export const SUGGESTIONS: Record<string, string[]> = {
  exec: ["How are we doing on our strategic priorities?", "Summarise open requests", "Which TFs are ready for certification?"],
  su_pm: ["Which TFs are ready for certification?", "Which schools haven’t been visited this month?", "Summarise pupil attendance this term"],
  su_po: ["Draft visit report for Cedar Hill", "Prepare a coaching plan", "Which schools haven’t been visited this month?"],
  su_trainer: ["Which TFs are ready for certification?", "Show assessment submission status"],
  fb_pm: ["Which students are at risk?", "Who is missing guardian consent?", "Draft the Future Builders monthly report"],
  fb_po: ["Which students are at risk?", "Who is missing guardian consent?"],
  fb_trainer: ["Which students are at risk?", "Show assessment submission status"],
  curriculum: ["Draft a lesson for Career Readiness", "Summarise attendance across programs"],
  ops_hr: ["I need a laptop for the new trainer next week", "Summarise open requests"],
  fundraising: ["Check eligibility for Girls in Tech Futures 2027", "Which donor obligations are due?", "Draft the semi-annual report for Northbridge"],
  me: ["Summarise attendance across programs", "Draft an indicator variance note"],
  default: ["How do I take a register?", "I need a laptop for the new trainer next week"],
};
