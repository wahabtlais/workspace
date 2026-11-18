import type { DemoData, Persona } from "@/data/types";
import { attendanceRate, attendeeRate, sessionProgress } from "@/lib/metrics";
import { liveValues } from "@/lib/indicators";
import { addDays, DEMO_TODAY, formatDate } from "@/lib/utils";
import { useDemo } from "@/store/demoStore";
import { saveDoc } from "./general";
import type { AIResponse } from "./types";

const has = (p: string, ...w: string[]) => w.some((x) => p.includes(x));
const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : 0);

function findSchool(d: DemoData, text: string) {
  return d.schools.find((s) => text.toLowerCase().includes(s.name.split(" ")[0].toLowerCase()));
}

/** Insight on observation scores vs pupil learning gain per school (computed, used by Executive and Discovery). */
export function observationGainLink(d: DemoData) {
  const rows = d.schools.map((s) => {
    const obs = d.visits.filter((v) => v.schoolId === s.id && v.score !== undefined).map((v) => v.score!);
    const res = d.pupilResults.filter((r) => r.schoolId === s.id && r.academicYear === "2025–26" && r.preAvg !== null && r.postAvg !== null);
    return { s, obs: avg(obs), gain: avg(res.map((r) => (r.postAvg ?? 0) - (r.preAvg ?? 0))), n: obs.length, hasGain: res.length > 0 };
  }).filter((r) => r.n > 0 && r.hasGain);
  const hi = rows.filter((r) => r.obs >= 3), lo = rows.filter((r) => r.obs < 3);
  return { rows, hiGain: avg(hi.map((r) => r.gain)), loGain: avg(lo.map((r) => r.gain)), hiN: hi.length, loN: lo.length };
}

/** Recurring challenges in visit notes (computed from the notes text). */
export function visitThemes(d: DemoData, schoolIds?: string[]) {
  const THEMES: [string, string[]][] = [["Devices not charged or not enough devices", ["charg", "device", "tablet"]], ["Too little time for hands-on practice", ["time", "rushed", "period"]], ["Large classes, hard to support every pupil", ["large class", "crowded", "40 pupils"]], ["Unreliable internet", ["internet", "connection", "offline"]]];
  const notes = d.visits.filter((v) => v.notes && (!schoolIds || schoolIds.includes(v.schoolId)) && v.date >= "2026-09-01");
  return THEMES.map(([theme, words]) => ({ theme, visits: notes.filter((v) => words.some((w) => v.notes!.toLowerCase().includes(w))) })).filter((t) => t.visits.length > 0).sort((a, b) => b.visits.length - a.visits.length);
}

export function contextualResponse(p: string, persona: Persona, d: DemoData, context?: string): AIResponse | null {
  const ctx = (context ?? "").toLowerCase();
  const school = findSchool(d, `${ctx} ${p}`);

  // ---------- School Upskilling ----------
  if (school && has(p, "summar", "profile", "brief", "prepare")) {
    const visits = d.visits.filter((v) => v.schoolId === school.id).sort((a, b) => b.date.localeCompare(a.date));
    const last = visits.find((v) => v.status !== "Planned");
    const next = visits.filter((v) => v.status === "Planned").sort((a, b) => a.date.localeCompare(b.date))[0];
    const classes = d.classes.filter((c) => c.schoolId === school.id);
    const regs = d.registers.filter((r) => r.kind === "pupil" && classes.some((c) => c.id === r.contextId));
    const fu = d.followUps.filter((f) => f.schoolId === school.id && f.status !== "Done");
    const live = d.assessmentSessions.filter((s) => s.schoolId === school.id && (s.status === "Live" || s.status === "Reconciling"));
    const obs = visits.filter((v) => v.score !== undefined).slice(0, 3).map((v) => v.score!);
    const themes = visitThemes(d, [school.id]);
    const brief = has(p, "visit brief", "prepare");
    return {
      agent: "Program Delivery Agent",
      steps: ["Reading the school record", "Reading visits, observations and follow-ups", "Summarising attendance (aggregated)", brief ? "Preparing questions for the visit" : "Writing the summary"],
      blocks: [
        { kind: "text", text: `${school.name} (${school.region}) has ${classes.length} classes and ${classes.reduce((a, c) => a + c.pupilIds.length, 0)} pupils in the program. Pupil attendance this term is ${attendanceRate(regs)}%. ${obs.length ? `Recent observation scores: ${obs.join(", ")} / 4.` : "No observation scores yet."}` },
        { kind: "table", title: brief ? `Visit brief${next ? `: ${formatDate(next.date)}` : ""}` : "At a glance", head: ["Area", "Status"], rows: [["Last visit", last ? `${formatDate(last.date)} · ${last.purpose}` : "None"], ["Next visit", next ? `${formatDate(next.date)} · ${next.purpose}` : "Not planned"], ["Open follow-ups", fu.length ? fu.map((f) => f.title).join("; ") : "None"], ["Live assessments", live.length ? live.map((s) => { const c = sessionProgress(s.entries); return `${s.title}: ${c.submitted}/${s.entries.length}`; }).join("; ") : "None"], ["Agreement", `${school.mouStatus}, until ${formatDate(school.mouExpires, { month: "short", year: "numeric" })}`]] },
        ...(brief ? [{ kind: "bullets" as const, title: "Suggested focus for the visit", items: [fu[0] ? `Check progress on: ${fu[0].title}` : "Confirm Term 2 timetable with the principal", themes[0] ? `Recurring challenge in recent notes: ${themes[0].theme.toLowerCase()}` : "Observe pupil-led activity", live.length ? "Help the teacher finish the live assessment (failed or pending submissions)" : "Remind teachers about the post-assessment window"] }] : []),
      ],
      sources: [{ label: `School: ${school.name}`, link: `/school-upskilling/schools/${school.id}` }, { label: "Visits & observations", link: "/school-upskilling/visits" }, { label: "Attendance (aggregated)", why: "Pupil names are never shown to the assistant" }],
      reasoning: "I combined the latest records for this school. Attendance is an aggregate rate; individual pupil data was not used.",
      dataUsed: ["standard", "pupil-data"],
      proposedAction: { label: brief ? "Save the brief to Documents" : "Save summary to Documents", apply: () => saveDoc(`${brief ? "Visit brief" : "School summary"}: ${school.name} (AI draft)`, "Google Doc", `School · ${school.name.split(" ")[0]}`) },
      followUps: [`Draft visit report for ${school.name}`, `Suggest follow-up actions for ${school.name}`, "Which schools haven’t been visited this month?"],
    };
  }

  if (has(p, "analy") && has(p, "observation")) {
    const scoped = school ? [school.id] : persona.scope.schoolIds;
    const vs = d.visits.filter((v) => v.score !== undefined && (!scoped || scoped.includes(v.schoolId)));
    const byTf = d.tfs.filter((t) => vs.some((v) => v.tfId === t.id)).map((t) => { const s = vs.filter((v) => v.tfId === t.id).sort((a, b) => a.date.localeCompare(b.date)); return { t, first: s[0].score!, last: s[s.length - 1].score!, n: s.length }; }).sort((a, b) => a.last - b.last).slice(0, 8);
    const themes = visitThemes(d, scoped);
    return {
      agent: "Program Delivery Agent",
      steps: ["Reading observation scores", "Comparing first and latest observation for each Teaching Fellow", "Reading observation notes for patterns"],
      blocks: [
        { kind: "chart", title: "Latest observation score by Teaching Fellow (out of 4)", data: byTf.map((r) => ({ label: r.t.name, value: r.last, flag: r.last < 2.5 })), note: "Highlighted: below the 2.5 coaching threshold." },
        { kind: "table", title: "Change since first observation", head: ["Teaching Fellow", "First", "Latest", "Observations"], rows: byTf.map((r) => [r.t.name, r.first, r.last, r.n]) },
        { kind: "bullets", title: "Patterns in observation notes", items: themes.length ? themes.map((t) => `${t.theme}: mentioned in ${t.visits.length} visit${t.visits.length > 1 ? "s" : ""}`) : ["No recurring patterns in the notes."] },
      ],
      sources: [{ label: "Visits & observations", link: "/school-upskilling/visits" }, { label: "Observation rubric" }],
      reasoning: "Scores below 2.5 trigger coaching under the program rules. Themes come from keywords in the observation notes.",
      dataUsed: ["standard", "learner-PII"],
      followUps: ["Prepare a coaching plan", "Consolidate recurring challenges into an improvement brief"],
    };
  }

  if (has(p, "follow-up action", "suggest follow", "next steps for")) {
    const s = school ?? d.schools[0];
    const low = d.visits.filter((v) => v.schoolId === s.id && v.score !== undefined && v.score < 2.5);
    return {
      agent: "Program Delivery Agent",
      steps: ["Reading open follow-ups", "Reading the latest observations", "Suggesting actions"],
      blocks: [{ kind: "table", title: `Suggested follow-ups: ${s.name}`, head: ["Action", "Owner", "By"], rows: [[low.length ? "Coaching session on classroom routines" : "Share good practice with a peer school", d.staff.find((x) => x.id === s.poId)?.name ?? "Project Officer", formatDate(addDays(DEMO_TODAY, 7))], ["Check device charging routine with the principal", d.staff.find((x) => x.id === s.poId)?.name ?? "Project Officer", formatDate(addDays(DEMO_TODAY, 10))], ["Confirm post-assessment dates", d.staff.find((x) => x.id === s.trainerId)?.name ?? "Trainer", formatDate(addDays(DEMO_TODAY, 14))]] }],
      sources: [{ label: `School: ${s.name}`, link: `/school-upskilling/schools/${s.id}` }, { label: "Follow-ups & coaching", link: "/school-upskilling/follow-ups" }],
      reasoning: "Follow-ups are suggested from low observation scores, recurring notes and upcoming assessment dates.",
      dataUsed: ["standard"],
      proposedAction: { label: "Add these to Follow-ups", apply: () => { useDemo.getState().update((x) => { x.followUps.unshift({ id: `fu-ai-${Date.now()}`, title: `Coaching and device routine check: ${s.name} (AI suggested)`, program: "SU", schoolId: s.id, ownerId: s.poId, due: addDays(DEMO_TODAY, 7), status: "Open", source: "Suggested by AI, confirmed by a person", createdAt: DEMO_TODAY }); }); return `Follow-up added for ${s.name}.`; } },
    };
  }

  if (has(p, "recurring challenge", "improvement brief", "consolidate")) {
    const themes = visitThemes(d, persona.role === "su_po" ? persona.scope.schoolIds : undefined);
    return {
      agent: "Program Delivery Agent",
      steps: ["Reading visit notes since September", "Grouping recurring challenges", "Drafting an improvement brief"],
      blocks: [
        { kind: "chart", title: "Recurring challenges in visit notes (visits)", data: themes.map((t) => ({ label: t.theme, value: t.visits.length })) },
        { kind: "doc", title: "Improvement brief (draft)", docType: "Google Doc", body: `Since September, ${themes.reduce((a, t) => a + t.visits.length, 0)} visit notes mention recurring practical challenges. The most common is “${themes[0]?.theme.toLowerCase() ?? "device readiness"}” (${themes[0]?.visits.length ?? 0} visits, ${new Set(themes[0]?.visits.map((v) => v.schoolId)).size} schools).\n\nRecommendations:\n1. Share a one-page device routine with every school (charge the night before, numbered devices).\n2. Ask the curriculum team to add a 5-minute unplugged warm-up so lessons can start while devices are handed out.\n3. Review device numbers with schools that have more than 30 pupils per class.` },
      ],
      sources: themes.slice(0, 3).map((t) => ({ label: `${t.visits.length} visits: ${t.theme}`, why: t.visits.slice(0, 3).map((v) => `${d.schools.find((s) => s.id === v.schoolId)?.name.split(" ")[0]} ${formatDate(v.date)}`).join(", "), link: "/school-upskilling/visits" })),
      reasoning: "I grouped notes by keywords and counted visits and schools for each theme, so each claim can be checked against the visits listed.",
      dataUsed: ["standard"],
      proposedAction: { label: "Save the brief and share with the Curriculum Manager", apply: () => { useDemo.getState().addInbox({ toRole: "curriculum", kind: "review", title: "Improvement brief from school visits", detail: "Shared by a Project Officer · drafted by AI from visit notes", link: "/curriculum", source: "AI Workspace" }); return saveDoc("Improvement brief: recurring classroom challenges (AI draft)", "Google Doc", "School Upskilling · visits"); } },
    };
  }

  // ---------- Future Builders ----------
  if (has(p, "cohort progress", "summarise cohort", "summarize cohort")) {
    const act = d.students.filter((s) => s.cohortId === "fbc-2" && s.status === "Active");
    const regs = d.registers.filter((r) => r.kind === "fb");
    const by = (["ai", "web", "ent"] as const).map((pw) => { const ss = act.filter((s) => s.pathway === pw); return { pw, n: ss.length, att: avg(ss.map((s) => attendeeRate(regs, s.id))), subs: d.submissions.filter((x) => ss.some((s) => s.id === x.learnerId)).length }; });
    return {
      agent: "Program Delivery Agent",
      steps: ["Reading cohort 2026–27 attendance", "Reading submissions and lesson progress", "Comparing pathways"],
      blocks: [
        { kind: "text", text: `${act.length} active students. Average session attendance is ${attendanceRate(regs)}%. ${by.filter((b) => b.att < 80).map((b) => b.pw.toUpperCase()).join(", ") || "No pathway"} is below 80% attendance.` },
        { kind: "chart", title: "Average attendance by pathway (%)", unit: "%", data: by.map((b) => ({ label: { ai: "AI & ML", web: "Web development", ent: "Entrepreneurship" }[b.pw], value: b.att, flag: b.att < 80 })) },
        { kind: "table", head: ["Pathway", "Students", "Attendance", "Submissions"], rows: by.map((b) => [b.pw.toUpperCase(), b.n, `${b.att}%`, b.subs]) },
      ],
      sources: [{ label: "Future Builders attendance", link: "/future-builders/attendance" }, { label: "Learning Hub submissions", link: "/learning/progress" }],
      reasoning: "Averages per pathway from session registers and submitted assignments this term.",
      dataUsed: ["learner-PII"],
      followUps: ["Which students are at risk?", "Analyze project progress", "Prepare mentorship summaries"],
    };
  }

  if (has(p, "project progress", "analyze project", "analyse project")) {
    const rows = d.projects.map((pr) => { const done = pr.milestones.filter((m) => m.status === "Approved").length; const late = pr.milestones.filter((m) => m.due < DEMO_TODAY && !["Approved", "Submitted"].includes(m.status)).length; return { pr, done, late }; });
    return {
      agent: "Program Delivery Agent",
      steps: ["Reading team and client projects", "Checking milestones against due dates"],
      blocks: [
        { kind: "chart", title: "Approved milestones per project", data: rows.map((r) => ({ label: r.pr.title, value: r.done, flag: r.late > 0 })), note: "Highlighted: at least one overdue milestone." },
        { kind: "table", head: ["Project", "Type", "Approved", "Overdue"], rows: rows.map((r) => [r.pr.title, r.pr.kind === "client" ? "Client" : "Team", `${r.done}/${r.pr.milestones.length}`, r.late]) },
      ],
      sources: [{ label: "Projects", link: "/future-builders/projects" }],
      reasoning: "A milestone is overdue when its due date has passed and it has not been submitted or approved.",
      dataUsed: ["standard"],
      followUps: ["Draft a message to teams with overdue milestones"],
    };
  }

  if (has(p, "mentorship")) {
    const ms = d.mentorSessions.slice(0, 6);
    return {
      agent: "Program Delivery Agent",
      steps: ["Reading mentorship session notes", "Summarising focus areas"],
      blocks: [{ kind: "table", title: "Recent mentorship sessions", head: ["Date", "Mentor", "Student", "Focus"], rows: ms.map((m) => [formatDate(m.date), d.staff.find((s) => s.id === m.mentorId)?.name ?? "", `Student ${m.studentId.slice(-2)}`, m.focus]) }, { kind: "text", text: "Common focus areas: portfolio preparation and interview confidence. Students are pseudonymised in AI summaries." }],
      sources: [{ label: "Mentorship", link: "/future-builders/mentorship" }],
      reasoning: "Summaries use mentors' own session notes; student names are replaced by codes.",
      dataUsed: ["learner-PII"],
    };
  }

  // ---------- Curriculum ----------
  if (has(p, "review this lesson", "review lesson", "review the lesson")) {
    const title = context?.replace(/^Lesson:\s*/, "") ?? "this lesson";
    return {
      agent: "Curriculum Agent",
      steps: ["Reading the lesson plan", "Checking objectives, timing and assessment alignment", "Checking feedback from delivery"],
      blocks: [
        { kind: "table", title: `AI review: ${title}`, head: ["Check", "Result"], rows: [["Objectives are measurable", "Yes"], ["Timing adds up to the period length", "Tight: activities need 50 of 45 minutes"], ["Differentiation for mixed levels", "Present, could be more specific"], ["Linked to an assessment item", "Yes (pre/post item 4)"], ["Accessibility & language", "Add Arabic key-word list"]] },
        { kind: "bullets", title: "Recommendations", items: ["Shorten the build activity by 5 minutes or split it across two periods", "Add pair-programming roles (driver / navigator) to share devices", "Add a printed key-word list in Arabic and English"] },
        { kind: "notice", tone: "governance", text: "AI never publishes or overwrites approved curriculum. A Curriculum Manager decides what to change." },
      ],
      sources: [{ label: "Lesson plan", why: "The lesson you are viewing" }, { label: "Teacher & trainer feedback", link: "/curriculum/feedback" }],
      reasoning: "I check each lesson against the same quality criteria as the human review checklist.",
      dataUsed: ["standard"],
      followUps: ["Recommend differentiated activities", "Analyze teacher and trainer feedback"],
    };
  }

  if (has(p, "differentiat")) {
    return {
      agent: "Curriculum Agent",
      steps: ["Reading the lesson objective", "Reading the class learning profile (aggregated)", "Suggesting activities at three levels"],
      blocks: [{ kind: "table", title: "Differentiated activities", head: ["Level", "Activity", "Support"], rows: [["Needs support", "Rebuild a finished animation from shuffled blocks", "Picture cards with block names"], ["On track", "Make a character move and change costume", "Checklist of steps"], ["Ready for more", "Add a loop and a second character that reacts", "Challenge card, no hints"]] }, { kind: "notice", tone: "governance", text: "Groups are for one lesson only. The platform never assigns permanent ability labels to pupils." }],
      sources: [{ label: "Class learning profile (aggregated)" }],
      reasoning: "Three levels based on the class's aggregated pre-assessment results for this objective.",
      dataUsed: ["standard"],
    };
  }

  if (has(p, "feedback") && has(p, "analy", "summar", "theme")) {
    const fb = d.trainerFeedback;
    const byLesson = [...new Set(fb.map((f) => f.lessonTitle))].map((l) => { const xs = fb.filter((f) => f.lessonTitle === l); return { l, n: xs.length, r: avg(xs.map((x) => x.rating)) }; }).sort((a, b) => a.r - b.r);
    const flagged = byLesson.filter((x) => x.n >= 3 && x.r < 3);
    return {
      agent: "Curriculum Agent",
      steps: ["Reading teacher and trainer feedback", "Grouping by lesson and theme", "Checking observation findings"],
      blocks: [
        { kind: "chart", title: "Average rating by lesson (out of 5)", data: byLesson.slice(0, 8).map((x) => ({ label: x.l, value: x.r, flag: x.n >= 3 && x.r < 3 })), note: "Highlighted: three or more pieces of feedback averaging below 3." },
        { kind: "bullets", title: "What stands out", items: flagged.length ? flagged.map((x) => `“${x.l}” has ${x.n} pieces of feedback averaging ${x.r} / 5, mostly about timing and devices. It passed AI review before publication, so this is new evidence from delivery.`) : ["No lesson has repeated low ratings."] },
      ],
      sources: [{ label: "Teacher & trainer feedback", link: "/curriculum/feedback" }, { label: "Observation notes (themes only)", link: "/school-upskilling/visits" }],
      reasoning: "Lessons with at least three pieces of feedback and an average below 3 are flagged for review.",
      dataUsed: ["standard"],
      followUps: flagged.length ? [`Suggest improvements for “${flagged[0].l}”`] : [],
    };
  }

  // ---------- Operations ----------
  if (has(p, "process improvement", "bottleneck", "improve the process")) {
    const inAppr = d.requests.filter((r) => r.status === "In approval");
    const stuck = inAppr.map((r) => r.chain.find((c) => c.status === "pending")?.label ?? "").reduce<Record<string, number>>((a, l) => ({ ...a, [l]: (a[l] ?? 0) + 1 }), {});
    return {
      agent: "Operations & HR Agent",
      steps: ["Reading request approval chains", "Finding where requests wait longest"],
      blocks: [{ kind: "chart", title: "Requests currently waiting, by approval step", data: Object.entries(stuck).map(([label, value]) => ({ label, value })) }, { kind: "bullets", title: "Suggestions", items: ["Auto-approve equipment under USD 300 at the line-manager step", "Send a reminder after 48 hours at any step", "Let Finance approve travel in a weekly batch"] }],
      sources: [{ label: "Requests", link: "/operations/requests" }],
      reasoning: "Counted requests by the step they are currently waiting at.",
      dataUsed: ["staff-HR"],
    };
  }

  // ---------- Fundraising ----------
  if (has(p, "funding opportunit", "research funding", "new funding")) {
    const o = [...d.opportunities].filter((x) => !["Awarded", "Declined"].includes(x.stage)).sort((a, b) => (b.fit ?? 0) - (a.fit ?? 0));
    return {
      agent: "Fundraising Agent",
      steps: ["Reading the opportunity pipeline", "Comparing each call with CodeBrave's profile", "Ranking by fit and deadline"],
      blocks: [{ kind: "table", title: "Opportunities ranked by fit", head: ["Opportunity", "Funder", "Amount", "Deadline", "Fit"], rows: o.map((x) => [x.title, x.funder, `USD ${x.amount.toLocaleString("en-US")}`, formatDate(x.deadline), x.fit ? `${x.fit}%` : "—"]) }, { kind: "notice", tone: "info", text: "Simulated: in production, new calls would also be found from funder websites and newsletters you subscribe to." }],
      sources: [{ label: "Opportunities", link: "/fundraising/opportunities" }],
      reasoning: "Fit combines program focus, geography, amount and our evidence base.",
      dataUsed: ["financial"],
      followUps: ["Check eligibility for Girls in Tech Futures 2027", "Draft a proposal for the best-fit opportunity"],
    };
  }

  if (has(p, "proposal")) {
    const v = liveValues(d);
    const ev = d.evidence.filter((e) => e.consent === "Consented");
    return {
      agent: "Fundraising Agent",
      steps: ["Reading the call criteria", "Pulling live indicators as evidence", "Selecting consented stories", "Drafting sections"],
      blocks: [{ kind: "doc", title: "Proposal draft: Girls in Tech Futures 2027", docType: "Google Doc", body: `1. Need\nYoung women are under-represented in technology careers in our region.\n\n2. Our track record\n• ${v["ind-fb-active"]} students active in Future Builders this year, ${v["ind-fb-att"]}% attendance\n• ${v["ind-fb-intern"]} internship placements\n• Pupils in partner schools improved by ${v["ind-su-gain"]} points between pre- and post-assessments\n\n3. Evidence\n${ev.slice(0, 2).map((e) => `• ${e.title}: “${e.excerpt}”`).join("\n")}\n\n4. Plan and budget\n[To complete with the program team]` }],
      sources: [{ label: "Results & Indicators (live)", why: "Every figure links to its indicator", link: "/results" }, { label: `${ev.length} consented evidence items`, why: "Only consented stories are used", link: "/fundraising/evidence" }],
      reasoning: "Figures are pulled live, so the draft matches the indicator library. Stories without consent were excluded.",
      dataUsed: ["standard"],
      proposedAction: { label: "Save to Proposals as a draft", apply: () => saveDoc("Proposal draft: Girls in Tech Futures 2027 (AI draft)", "Google Doc", "Fundraising · proposals") },
    };
  }

  // ---------- Executive ----------
  if (has(p, "briefing", "brief me", "what changed")) return executiveBriefing(d);

  if (has(p, "explain") && has(p, "indicator", "observation", "attendance", "gain", "change")) {
    const link = observationGainLink(d);
    return {
      agent: "Reporting & Insights Agent",
      steps: ["Reading the indicator history", "Looking for related indicators", "Checking the records behind the change"],
      blocks: [
        { kind: "text", text: `Schools where Teaching Fellows average 3.0 or more in observations had a pupil learning gain of +${link.hiGain} points last year, compared with +${link.loGain} in schools below 3.0 (${link.hiN} and ${link.loN} schools).` },
        { kind: "chart", title: "Pupil learning gain by school (points)", data: link.rows.map((r) => ({ label: r.s.name.split(" ")[0], value: r.gain, flag: r.obs < 3 })), note: "Highlighted: schools with average observation score below 3.0." },
        { kind: "notice", tone: "info", text: "This is a relationship, not proof of cause. Class size and school resources may also play a part." },
      ],
      sources: [{ label: "Indicator SU-02 Learning gain", link: "/results/ind-su-gain" }, { label: "Indicator SU-06 Observation score", link: "/results/ind-su-obs" }, { label: "Visits & observations", link: "/school-upskilling/visits" }],
      reasoning: "I grouped schools by their average observation score and compared their average pre/post gain.",
      dataUsed: ["standard"],
      proposedAction: { label: "Ask Maya Saleh to investigate", apply: () => { useDemo.getState().addInbox({ toRole: "su_pm", kind: "task", title: "Investigate: observation scores and learning gain", detail: "Requested by Rana Khoury from an AI insight · evidence attached", link: "/results", source: "Executive" }); return "Maya Saleh has a new task with the evidence attached."; } },
    };
  }

  if (has(p, "risks and opportunities", "strategic action", "opportunities and risks")) {
    const risks = [...d.risks].filter((r) => r.status !== "Closed").sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact).slice(0, 3);
    const opps = d.opportunities.filter((o) => ["Qualifying", "Drafting"].includes(o.stage)).slice(0, 2);
    return {
      agent: "Reporting & Insights Agent",
      steps: ["Reading the risk register", "Reading the funding pipeline", "Linking both to strategic priorities"],
      blocks: [
        { kind: "table", title: "Top risks", head: ["Risk", "Score", "Mitigation"], rows: risks.map((r) => [r.title, r.likelihood * r.impact, r.mitigation]) },
        { kind: "table", title: "Opportunities", head: ["Opportunity", "Amount", "Deadline"], rows: opps.map((o) => [o.title, `USD ${o.amount.toLocaleString("en-US")}`, formatDate(o.deadline)]) },
        { kind: "bullets", title: "Suggested strategic actions", items: ["Use the observation-to-learning-gain evidence in the Girls in Tech proposal", "Prioritise coaching in the two schools below 2.5 before the post-assessment", "Decide on the laptop refresh before the January cohort starts"] },
      ],
      sources: [{ label: "Risks & issues", link: "/executive/risks" }, { label: "Opportunities", link: "/fundraising/opportunities" }],
      reasoning: "Risks ranked by likelihood × impact; opportunities filtered to active stages.",
      dataUsed: ["standard", "financial"],
    };
  }

  return null;
}

export function executiveBriefing(d: DemoData): AIResponse {
  const v = liveValues(d);
  const pending = d.decisions.filter((x) => x.status === "Pending");
  const off = d.indicators.filter((i) => (v[i.id] ?? i.series[i.series.length - 1]?.value ?? 0) < i.target * 0.9);
  const due = d.obligations.filter((o) => o.status !== "Submitted" && o.due <= addDays(DEMO_TODAY, 30));
  const link = observationGainLink(d);
  return {
    agent: "Reporting & Insights Agent",
    steps: ["Reading live indicators", "Reading decisions, risks and obligations", "Finding what changed this week", "Writing the briefing"],
    blocks: [
      { kind: "bullets", title: "This week in brief", items: [
        `${pending.length} decision${pending.length === 1 ? "" : "s"} waiting for you${pending[0] ? `, the most urgent: “${pending[0].title}” (due ${formatDate(pending[0].due)})` : ""}.`,
        `${off.length} indicator${off.length === 1 ? " is" : "s are"} more than 10% below target: ${off.slice(0, 3).map((i) => i.name).join(", ") || "none"}.`,
        `${due.length} donor obligation${due.length === 1 ? "" : "s"} due in the next 30 days.`,
        `Insight: schools with stronger classroom observations show a higher pupil learning gain (+${link.hiGain} vs +${link.loGain} points).`,
      ] },
      { kind: "notice", tone: "info", text: "Every figure comes from live platform records and links to its source. Illustrative indicators are labelled as such." },
    ],
    sources: [{ label: "Results & Indicators (live)", link: "/results" }, { label: "Decisions", link: "/executive/decisions" }, { label: "Obligations", link: "/fundraising/obligations" }],
    reasoning: "The briefing lists only items that need leadership attention: decisions, off-track indicators, near deadlines and a notable pattern.",
    dataUsed: ["standard", "financial"],
    followUps: ["Explain the change in observation scores and learning gain", "What are our top risks and opportunities?", "Suggest strategic actions"],
  };
}
