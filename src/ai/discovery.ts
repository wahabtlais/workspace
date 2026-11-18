import type { DemoData, Persona, RoleKey } from "@/data/types";
import { attendeeRate } from "@/lib/metrics";
import { liveValues } from "@/lib/indicators";
import { certificationCriteria, isEligible } from "@/lib/certification";
import { observationGainLink, visitThemes } from "./contextual";

export type DiscoveryKind = "Analysis" | "Report" | "Presentation" | "Chart" | "Document" | "Automation" | "Email";

export interface Discovery {
  id: string;
  title: string;
  /** Why this is relevant to this person now. */
  why: string;
  evidence: string[];
  kind: DiscoveryKind;
  prompt: string;
  file?: string;
  context?: string;
  /** True when found in the person's own authorized work data, false for a role recommendation. */
  fromData: boolean;
  link?: { label: string; to: string };
}

const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : 0);

export function lessonFeedbackFlags(d: DemoData) {
  return [...new Set(d.trainerFeedback.map((f) => f.lessonTitle))].map((l) => {
    const xs = d.trainerFeedback.filter((f) => f.lessonTitle === l);
    return { lesson: l, curriculumId: xs[0].curriculumId, n: xs.length, rating: avg(xs.map((x) => x.rating)), latest: xs.map((x) => x.date).sort().pop()! };
  }).filter((x) => x.n >= 3 && x.rating < 3);
}

/** Opportunities found in the person's own work, computed from records they are allowed to see. */
export function discoveries(p: Persona, d: DemoData): Discovery[] {
  const out: Discovery[] = [];
  const role = p.role;

  if (role === "ops_hr") {
    const sheet = d.documents.find((x) => x.title.startsWith("Operations-expenses"));
    if (sheet) out.push({ id: "dx-exp", fromData: true, kind: "Analysis", title: "Your October expense sheet has unusual values", why: `You added ${sheet.title} to Documents on 14 Nov. Two categories are far above their usual level, one possibly a duplicate invoice.`, evidence: ["Staff transport: +79% vs the Jul–Sep average", "Internet & phones: almost double the usual bill"], prompt: "Analyze this spreadsheet for trends and anomalies", file: "expenses" });
    const waiting = d.requests.filter((r) => r.status === "In approval").length;
    if (waiting) out.push({ id: "dx-req", fromData: true, kind: "Automation", title: `${waiting} requests are waiting for approval`, why: "Most of them are waiting at the same step. AI can show where requests slow down and suggest simple rules, such as auto-approving small equipment requests.", evidence: [`${waiting} requests in approval right now`], prompt: "Find the bottlenecks in our requests and suggest process improvements", link: { label: "Open requests", to: "/operations/requests" } });
  }

  if (role === "curriculum") {
    for (const f of lessonFeedbackFlags(d)) out.push({ id: `dx-les-${f.lesson}`, fromData: true, kind: "Analysis", title: `“${f.lesson}” keeps getting difficulty reports`, why: `It passed AI and human review before publication, but ${f.n} teachers and trainers have rated it ${f.rating} / 5 since October, and observation notes mention the same problem. New evidence can justify a revision.`, evidence: [`${f.n} pieces of feedback, average ${f.rating} / 5`, "Recurring themes: timing, devices"], prompt: "Analyze teacher and trainer feedback themes", context: "Curriculum", link: { label: "Open the lesson", to: "/curriculum/lessons/cur-cls/les-my-first-animation" } });
    out.push({ id: "dx-survey", fromData: true, kind: "Report", title: "62 teachers answered the Term 1 survey", why: "The survey file is in your Documents. AI can group the comments into themes and link them to lessons in minutes.", evidence: ["Teacher-feedback-survey-Term-1.csv"], prompt: "Analyze this survey and summarise the themes", file: "survey" });
  }

  if (role === "fundraising") {
    const v = liveValues(d);
    const ev = d.evidence.filter((e) => e.consent === "Consented").length;
    const opp = d.opportunities.find((o) => o.id === "opp-1");
    if (opp) out.push({ id: "dx-prop", fromData: true, kind: "Document", title: `Your impact evidence could strengthen “${opp.title}”`, why: `The call asks for outcome data. Results & Indicators already shows a pupil learning gain of +${v["ind-su-gain"]} points and ${v["ind-fb-intern"]} internship placements, and there are ${ev} consented stories you can use.`, evidence: [`Learning gain +${v["ind-su-gain"]} (live)`, `${ev} consented evidence items`], prompt: "Draft a proposal for Girls in Tech Futures 2027", link: { label: "Open opportunity", to: "/fundraising/opportunities" } });
    out.push({ id: "dx-call", fromData: true, kind: "Analysis", title: "A new call for proposals arrived from Northbridge", why: "It is 14 pages long. AI can pull out the deadline, amounts and criteria and check them against our profile.", evidence: ["Northbridge-call-for-proposals-2027.pdf"], prompt: "Extract the key dates, amounts and criteria", file: "call" });
  }

  if (role === "su_po" || role === "su_pm") {
    const themes = visitThemes(d, role === "su_po" ? p.scope.schoolIds : undefined);
    if (themes[0]) {
      const schools = new Set(themes[0].visits.map((v) => v.schoolId)).size;
      out.push({ id: "dx-themes", fromData: true, kind: "Report", title: `${themes[0].visits.length} visit reports mention the same challenge`, why: `“${themes[0].theme}” appears in visit notes from ${schools} schools since September. AI can consolidate these into an improvement brief and share it with the curriculum team.`, evidence: themes.slice(0, 3).map((t) => `${t.theme}: ${t.visits.length} visits`), prompt: "Consolidate recurring challenges from my visit reports into an improvement brief", link: { label: "Open visits", to: "/school-upskilling/visits" } });
    }
    if (role === "su_po") out.push({ id: "dx-brief", fromData: true, kind: "Document", title: "Tomorrow: visit to Riverside Intermediate", why: "AI can prepare a one-page brief from the last visits, open follow-ups and live assessments so you arrive prepared.", evidence: ["Planned visit tomorrow"], prompt: "Prepare a visit brief for Riverside", context: "Riverside Intermediate School" });
    if (role === "su_pm") out.push({ id: "dx-obs", fromData: true, kind: "Chart", title: "Two Teaching Fellows are below the coaching threshold", why: "Observation scores below 2.5 trigger coaching. AI can show each TF's progress since their first observation.", evidence: ["Observation scores since September"], prompt: "Analyze observations across schools" });
  }

  if (role === "su_trainer") {
    const rows = d.tfs.filter((t) => t.cohortId === "tfc-2").map((t) => certificationCriteria(d, t));
    const blocked = rows.filter((c) => c.some((x) => x.met === false)).length;
    out.push({ id: "dx-cert", fromData: true, kind: "Analysis", title: `${blocked} Teaching Fellows have a certification criterion not met`, why: "Before the post-assessment, AI can show who is at risk and why, so you can plan catch-up sessions.", evidence: [`${rows.filter(isEligible).length} already eligible`], prompt: "Which TFs are ready for certification?" });
  }

  if (role.startsWith("fb_")) {
    const regs = d.registers.filter((r) => r.kind === "fb");
    const risky = d.students.filter((s) => s.cohortId === "fbc-2" && s.status === "Active" && attendeeRate(regs, s.id) < 75).length;
    if (risky) out.push({ id: "dx-risk", fromData: true, kind: "Analysis", title: `${risky} students are below 75% attendance`, why: "Attendance usually drops before students stop coming. AI can combine attendance and submissions and draft check-in tasks (students are pseudonymised for the assistant).", evidence: [`${risky} below the 75% threshold`], prompt: "Which students are at risk?" });
    out.push({ id: "dx-proj", fromData: true, kind: "Chart", title: "Project milestones are due this month", why: "AI can show which teams are behind and draft a friendly reminder.", evidence: [`${d.projects.length} active projects`], prompt: "Analyze project progress" });
  }

  if (role === "exec" || role === "me") {
    const link = observationGainLink(d);
    out.push({ id: "dx-link", fromData: true, kind: "Analysis", title: "Classroom observation quality and learning gain move together", why: `Schools where Teaching Fellows average 3.0+ in observations had a learning gain of +${link.hiGain} points, against +${link.loGain} elsewhere. Worth investigating before the post-assessment.`, evidence: [`${link.hiN} schools at 3.0+, ${link.loN} below`, "Indicators SU-02 and SU-06 (live)"], prompt: "Explain the change in observation scores and learning gain", context: "Executive" });
    if (role === "exec") out.push({ id: "dx-brief-exec", fromData: true, kind: "Report", title: "Your weekly briefing is ready to generate", why: "AI reads decisions, off-track indicators, risks and obligations and writes a one-page summary with links to every source.", evidence: [`${d.decisions.filter((x) => x.status === "Pending").length} pending decisions`], prompt: "Give me this week's executive briefing" });
  }

  return out;
}

/** What AI can do for each role, with an example to try. */
export const ROLE_CAPABILITIES: Partial<Record<RoleKey, { title: string; prompt: string; kind: DiscoveryKind }[]>> & { default: { title: string; prompt: string; kind: DiscoveryKind }[] } = {
  exec: [{ title: "Weekly executive briefing", prompt: "Give me this week's executive briefing", kind: "Report" }, { title: "Explain why an indicator changed", prompt: "Explain the change in observation scores and learning gain", kind: "Analysis" }, { title: "Board presentation outline", prompt: "Create a board presentation outline for December", kind: "Presentation" }, { title: "Risks and opportunities", prompt: "What are our top risks and opportunities?", kind: "Analysis" }],
  su_pm: [{ title: "Observation analysis across schools", prompt: "Analyze observations across schools", kind: "Chart" }, { title: "Certification readiness", prompt: "Which TFs are ready for certification?", kind: "Analysis" }, { title: "Meeting notes to actions", prompt: "Summarize these meeting notes", kind: "Document" }],
  su_po: [{ title: "Visit brief before you go", prompt: "Prepare a visit brief for Cedar Hill", kind: "Document" }, { title: "Visit report from your notes", prompt: "Draft visit report for Cedar Hill", kind: "Document" }, { title: "Coaching plan", prompt: "Prepare a coaching plan", kind: "Document" }],
  su_trainer: [{ title: "Certification readiness", prompt: "Which TFs are ready for certification?", kind: "Analysis" }, { title: "Live assessment status", prompt: "Show assessment submission status", kind: "Analysis" }],
  fb_pm: [{ title: "Cohort progress summary", prompt: "Summarise cohort progress", kind: "Report" }, { title: "Project progress", prompt: "Analyze project progress", kind: "Chart" }, { title: "Missing guardian consent", prompt: "Who is missing guardian consent?", kind: "Analysis" }],
  fb_po: [{ title: "Students needing support", prompt: "Which students are at risk?", kind: "Analysis" }, { title: "Mentorship summaries", prompt: "Prepare mentorship summaries", kind: "Report" }],
  fb_trainer: [{ title: "Project progress", prompt: "Analyze project progress", kind: "Chart" }, { title: "Students needing support", prompt: "Which students are at risk?", kind: "Analysis" }],
  curriculum: [{ title: "Review a lesson", prompt: "Review this lesson", kind: "Analysis" }, { title: "Feedback themes by lesson", prompt: "Analyze teacher and trainer feedback themes", kind: "Chart" }, { title: "Differentiated activities", prompt: "Recommend differentiated activities", kind: "Document" }, { title: "Translate a worksheet into Arabic", prompt: "Translate this letter into Arabic", kind: "Document" }],
  ops_hr: [{ title: "Expense analysis", prompt: "Analyze this spreadsheet for trends and anomalies", kind: "Analysis" }, { title: "Request bottlenecks", prompt: "Find the bottlenecks in our requests and suggest process improvements", kind: "Automation" }, { title: "Professional emails", prompt: "Draft an email to Finance about the possible duplicate internet invoice", kind: "Email" }],
  fundraising: [{ title: "Research funding opportunities", prompt: "Research funding opportunities that fit us", kind: "Analysis" }, { title: "Eligibility check", prompt: "Check eligibility for Girls in Tech Futures 2027", kind: "Analysis" }, { title: "Proposal draft with live evidence", prompt: "Draft a proposal for Girls in Tech Futures 2027", kind: "Document" }],
  me: [{ title: "Explain an indicator change", prompt: "Explain the change in observation scores and learning gain", kind: "Analysis" }, { title: "Attendance summary", prompt: "Summarise attendance across programs", kind: "Report" }],
  default: [{ title: "Plan my week", prompt: "Help me plan my week", kind: "Document" }, { title: "Professional email", prompt: "Draft an email to a school principal asking to meet about Term 1 progress", kind: "Email" }],
};
