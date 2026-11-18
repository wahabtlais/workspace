import type { DemoData } from "@/data/types";
import { countMarks } from "@/lib/metrics";
import { DEMO_TODAY } from "@/lib/utils";

export interface Ctx { offline: boolean; queue: number }
export interface Step {
  persona: string;
  path: string;
  title: string;
  instruction: string | ((d: DemoData) => string);
  check?: (d: DemoData, c: Ctx) => boolean;
  outcome: string;
}
export interface Scenario { id: string; title: string; summary: string; roles: string; steps: Step[] }

const todayVisit = (d: DemoData) => d.visits.find((v) => v.schoolId === "sch-01" && v.date === DEMO_TODAY && v.purpose === "Classroom observation");
const latest = (d: DemoData, id: string) => { const c = d.curricula.find((x) => x.id === id)!; return c.versions[c.versions.length - 1]; };
const todayTs = (d: DemoData) => d.trainingSessions.find((s) => s.date === DEMO_TODAY)!;
const todayFb = (d: DemoData) => d.fbSessions.find((s) => s.date === DEMO_TODAY && s.type === "Learning session")!;
const lowestFb = (d: DemoData) => d.students.find((s) => s.id === "fbs-07")!;
const reg = (d: DemoData, id: string) => d.registers.find((r) => r.id === id);

export const SCENARIOS: Scenario[] = [
  { id: "field", title: "A day in the field", roles: "SU Project Officer → SU Project Manager", summary: "Offline observation on a phone, sync, an automatic coaching task, an AI-drafted visit report, and the PM seeing it.", steps: [
    { persona: "p-su-po", path: "/field/sync", title: "Go offline", instruction: "You are Omar, in a school with no signal. In Field mode, tap “Go offline (simulated)”.", check: (_d, c) => c.offline, outcome: "The phone is offline. Everything you do is saved on the device." },
    { persona: "p-su-po", path: "/field", title: "Complete the observation", instruction: "Open today’s Cedar Hill visit, rate the four rubric items (use mostly 1–2 to see the coaching rule) and submit.", check: (d) => todayVisit(d)?.status === "Completed", outcome: "The observation is saved on the phone and marked “Unsynced”." },
    { persona: "p-su-po", path: "/field/sync", title: "Reconnect and sync", instruction: "Tap “Reconnect (simulated)”. The queue uploads automatically.", check: (d, c) => !c.offline && c.queue === 0 && todayVisit(d)?.pendingSync === false, outcome: "Synced. The visit, the school timeline and indicators are updated." },
    { persona: "p-su-po", path: "/field", title: "Coaching task created", instruction: "A score below 2.5 creates a coaching task automatically. Check Follow-ups on Today.", check: (d) => d.followUps.some((f) => f.tfId === "tf-01" && f.createdAt === DEMO_TODAY), outcome: "Rule fired: coaching task for Layla Hassan, plus an alert to the PM." },
    { persona: "p-su-po", path: "/field", title: "AI drafts the visit report", instruction: "Tap “Draft today’s visit report”, review the draft, then “Save draft to Documents”.", check: (d) => d.documents.some((x) => x.title.startsWith("Visit report (draft): Cedar Hill")), outcome: "The draft report is saved and linked to the visit." },
    { persona: "p-su-pm", path: "/school-upskilling/follow-ups", title: "The PM sees it", instruction: "As Maya (PM), see the new coaching task on the board and the low-score notification.", outcome: "One action in the field is visible to the program manager." },
  ] },
  { id: "curriculum", title: "From curriculum to classroom", roles: "Curriculum Manager → FB Trainer → FB PM → Student", summary: "AI lesson drafting, review with comments, approval, publishing, and the course appearing in the Student Portal.", steps: [
    { persona: "p-curriculum", path: "/curriculum/cur-career", title: "Draft a lesson with AI", instruction: "In Career Readiness Essentials v0.1, click “Draft lesson with AI”, generate, and add it to the draft.", check: (d) => latest(d, "cur-career").modules.some((m) => m.lessons.some((l) => l.aiDrafted)), outcome: "An AI-drafted lesson is in the draft, clearly labelled for review." },
    { persona: "p-curriculum", path: "/curriculum/cur-career", title: "Send for review", instruction: "Click “Send for review”.", check: (d) => latest(d, "cur-career").status === "in_review", outcome: "Reviewers were notified in their Inbox." },
    { persona: "p-fb-trainer", path: "/curriculum/cur-career", title: "Trainer comments", instruction: "As Sami (trainer), open the Review tab and add a comment.", check: (d) => latest(d, "cur-career").comments.some((c) => c.authorId === "s-sami"), outcome: "The comment is visible to the author and the approver." },
    { persona: "p-fb-pm", path: "/curriculum/cur-career", title: "Approve", instruction: "As Tarek (PM), click “Approve or request changes” and approve.", check: (d) => latest(d, "cur-career").status === "approved", outcome: "Approved. “Publish” is now available to the Curriculum Manager." },
    { persona: "p-curriculum", path: "/curriculum/cur-career", title: "Publish", instruction: "As Yasmin, click “Publish to Student Portal” and confirm.", check: (d) => d.courses.some((c) => c.curriculumId === "cur-career"), outcome: "A course snapshot was created; the cohort is pinned to this version." },
    { persona: "p-student", path: "/student/learning", title: "The student sees it", instruction: "As Jana, Career Readiness Essentials now appears next to her pathway course, including the AI-drafted lesson.", outcome: "Curriculum → Learning Hub → Student Portal, end to end." },
  ] },
];

SCENARIOS.push({ id: "student", title: "A student’s journey", roles: "FB PM → FB PO → Student → Trainer → Host", summary: "Admission, the guardian-consent gate, an assignment graded and returned, portfolio sharing, and a consent-checked internship match.", steps: [
  { persona: "p-fb-pm", path: "/future-builders/admissions", title: "Admit an applicant", instruction: "Open Christelle Nader (Decision column) and click “Admit”.", check: (d) => d.applicants.find((a) => a.id === "app-09")?.stage === "Admitted", outcome: "Admitted. The student account exists but is blocked until a guardian consents." },
  { persona: "p-fb-po", path: "/future-builders/admissions", title: "Guardian consent", instruction: "As Hala, in “Waiting for guardian consent”, click “Simulate guardian consent” for Christelle.", check: (d) => d.students.some((s) => s.name === "Christelle Nader" && s.status === "Active"), outcome: "Consent recorded; the account is active. Media consent stays off." },
  { persona: "p-student", path: "/student/assignments", title: "Submit an assignment", instruction: "As Jana, submit “Accessible sign-up form”.", check: (d) => d.submissions.some((s) => s.assignmentId === "asg-web-2" && s.learnerId === "fbs-01"), outcome: "Submitted. It appears in the trainer’s grading queue." },
  { persona: "p-fb-trainer", path: "/learning/grading", title: "Grade and return", instruction: "As the trainer, select Jana Saab’s submission, choose a level for each rubric criterion and click “Return to learner”.", check: (d) => d.submissions.some((s) => s.assignmentId === "asg-web-2" && s.learnerId === "fbs-01" && s.status === "Returned"), outcome: "Feedback returned to the Student Portal with a notification." },
  { persona: "p-student", path: "/student/portfolio", title: "Curate the portfolio", instruction: "As Jana, set “Responsive landing page exercise” to “Shared with host”.", check: (d) => d.portfolio.find((p) => p.id === "pf-2")?.visibility === "Shared with host", outcome: "Allowed because Jana and her guardian consented to portfolio sharing." },
  { persona: "p-fb-po", path: "/future-builders/internships", title: "Share with the host", instruction: "As Hala, in the placement pipeline, click “Share with host” on Jana’s card.", check: (d) => d.placements.find((p) => p.id === "pl-1")?.stage === "Shared with host", outcome: "Consent and the host safeguarding check passed; the host was notified." },
  { persona: "p-host", path: "/partner/candidates", title: "The host’s view", instruction: "As Rita (Brightline Digital), see Jana by first name with consented portfolio items only.", outcome: "No contact details, grades or school records leave CodeBrave." },
] });

SCENARIOS.push({ id: "tf", title: "Becoming a Teaching Fellow", roles: "SU PM → Trainer → Teaching Fellow", summary: "Recruitment, training attendance, the post-training assessment, automatic eligibility, certification, certificate and deployment.", steps: [
  { persona: "p-su-pm", path: "/school-upskilling/teaching-fellows/recruitment", title: "Recruitment board", instruction: "As Maya, drag an applicant to the next stage on the 2027–28 recruitment board.", outcome: "The same pipeline pattern is used for admissions and staff recruitment." },
  { persona: "p-su-trainer", path: "/school-upskilling/training", title: "Training register", instruction: "As Jad, take today’s training register (mark everyone) and submit.", check: (d) => !!reg(d, `reg-${todayTs(d).id}`), outcome: "Attendance and the certification criterion updated for every TF." },
  { persona: "p-su-trainer", path: "/assessments/tracker/as-tf-post", title: "Open the post-assessment", instruction: "Open the TF post-training assessment session (“Open session”).", check: (d) => d.assessmentSessions.find((s) => s.id === "as-tf-post")?.status !== "Scheduled", outcome: "The session is live; TFs see it in their portal." },
  { persona: "p-tf", path: "/tf/assessments", title: "Take the post-assessment", instruction: "As Rami, answer the post-training assessment (correct answers pass) and submit.", check: (d) => d.assessmentSessions.find((s) => s.id === "as-tf-post")?.entries.find((e) => e.subjectId === "tf-15")?.status === "submitted", outcome: "Result recorded; the trainer’s tracker updated and eligibility was re-checked." },
  { persona: "p-su-pm", path: "/school-upskilling/teaching-fellows/certification", title: "Approve certification", instruction: "As Maya, Rami now meets every criterion. Click “Approve”.", check: (d) => !!d.tfs.find((t) => t.id === "tf-15")?.certifiedAt, outcome: "Certificate issued, indicator SU-05 updated, Rami notified." },
  { persona: "p-tf", path: "/tf/certificate", title: "Certificate in the TF Portal", instruction: "As Rami, open the certificate.", outcome: "The certificate is generated from the template with live data." },
  { persona: "p-su-pm", path: "/school-upskilling/teaching-fellows/deployment", title: "Deploy", instruction: "As Maya, assign Rami to a school in “Ready to deploy”.", check: (d) => d.tfs.find((t) => t.id === "tf-15")?.stage === "Deployed", outcome: "Deployed: TF profile, school profile and TF Portal are updated." },
  { persona: "p-tf", path: "/tf/deployment", title: "Rami’s deployment", instruction: "As Rami, see the school assignment in the TF Portal.", outcome: "Recruitment → training → certification → deployment in one record." },
] });

SCENARIOS.push({ id: "grant", title: "Winning and reporting a grant", roles: "Fundraising → Co-founder → Donor", summary: "AI eligibility check, a go / no-go decision, a donor report from live indicators, executive approval, submission and the donor’s view.", steps: [
  { persona: "p-fundraising", path: "/fundraising/opportunities", title: "Check eligibility", instruction: "Open “Girls in Tech Futures call 2027” and click “Check eligibility”.", check: (d) => !!d.opportunities.find((o) => o.id === "opp-1")?.eligibility, outcome: "Checklist pre-filled by the Fundraising Agent; co-funding needs a human decision." },
  { persona: "p-fundraising", path: "/fundraising/opportunities", title: "Ask for go / no-go", instruction: "Open the same card and click “Request go / no-go decision”.", check: (d) => d.decisions.some((x) => x.opportunityId === "opp-1"), outcome: "A decision with context is in the Co-founder’s Inbox." },
  { persona: "p-exec", path: "/executive/decisions", title: "Executive decides", instruction: "As Rana, approve “Go / no-go: Girls in Tech Futures call 2027”.", check: (d) => d.opportunities.find((o) => o.id === "opp-1")?.stage === "Drafting", outcome: "Opportunity moved to Drafting; Fundraising received a follow-up task." },
  { persona: "p-fundraising", path: "/fundraising/reports", title: "Draft the donor report", instruction: "As Joelle, with the Northbridge grant selected, click “Draft report”, then “Send for approval”.", check: (d) => d.obligations.find((o) => o.id === "obl-1")?.status === "In review", outcome: "Draft built from live indicators and consented evidence, sent to the Executive." },
  { persona: "p-exec", path: "/executive/decisions", title: "Approve the report", instruction: "As Rana, approve “Approve semi-annual report to Northbridge Foundation”.", check: (d) => d.obligations.find((o) => o.id === "obl-1")?.status === "Approved", outcome: "Approved; the obligation is ready to submit." },
  { persona: "p-fundraising", path: "/fundraising/reports", title: "Submit to the donor", instruction: "As Joelle, click “Draft report”, then “Submit to donor”.", check: (d) => d.obligations.find((o) => o.id === "obl-1")?.status === "Submitted", outcome: "Submitted and archived; the donor was notified." },
  { persona: "p-donor", path: "/partner/reports", title: "The donor’s view", instruction: "As Helen (Northbridge Foundation), the new approved report is listed.", outcome: "Donors see approved reports and aggregated figures only." },
] });

SCENARIOS.push({ id: "org", title: "Running the organization", roles: "Co-founder", summary: "Live indicators on the home page, drill-down to provenance, a new risk, decisions that act on linked records, and an agenda built automatically.", steps: [
  { persona: "p-exec", path: "/", title: "Spot what is off track", instruction: "As Rana, look at “Indicators against target”. Live values recalculate from records; illustrative ones are labelled.", outcome: "Leadership works from the same figures as the programs." },
  { persona: "p-exec", path: "/results/ind-su-obs", title: "Drill to evidence", instruction: "Open SU-06 (observation score): trend, provenance and the grants that use it.", outcome: "Every number links back to the records behind it." },
  { persona: "p-exec", path: "/executive/risks", title: "Add a risk", instruction: "Describe a new risk and click “Add risk”.", check: (d) => d.risks.length > 6, outcome: "The risk is on the register and on the next meeting agenda." },
  { persona: "p-exec", path: "/executive/decisions", title: "Decide", instruction: "Approve “Budget for 6 replacement field tablets”.", check: (d) => d.decisions.find((x) => x.id === "dec-4")?.status === "Approved", outcome: "The linked request REQ-0007 moved past its executive step; Operations got a follow-up task." },
  { persona: "p-exec", path: "/executive/meetings", title: "Agenda builds itself", instruction: "Open the upcoming management meeting: pending decisions, high risks (including yours) and off-track indicators are already on the agenda.", outcome: "No one assembles the agenda by hand." },
] });

const laptop = (d: DemoData) => d.requests.find((r) => r.title === "Laptop for the new trainer" && r.requesterId === "s-omar");

SCENARIOS.push({ id: "request", title: "Getting things done", roles: "Project Officer → PM → Operations", summary: "A request typed in plain language, pre-filled by AI, approved through its chain from the Inbox, and fulfilled with an asset.", steps: [
  { persona: "p-su-po", path: "/", title: "Ask in your own words", instruction: "As Omar, click “Ask CodeBrave”, type “I need a laptop for the new trainer next week”, then “Submit this request”.", check: (d) => !!laptop(d), outcome: "Request created with the right type and approval chain; nothing was sent without confirmation." },
  { persona: "p-su-pm", path: "/inbox", title: "Line manager approves", instruction: "As Maya, approve the laptop request directly from the Inbox.", check: (d) => laptop(d)?.chain[0].status === "approved", outcome: "Moved to Operations; Omar was notified." },
  { persona: "p-ops", path: "/operations/requests", title: "Operations fulfils", instruction: "As Ziad, approve, “Assign to Reem”, then “Mark complete”.", check: (d) => laptop(d)?.status === "Completed", outcome: "Completed; an available laptop was allocated in Assets." },
  { persona: "p-su-po", path: "/requests", title: "Requester sees the result", instruction: "As Omar, see the full approval trail under My requests.", outcome: "One Inbox, one approvals mechanism, for people and AI-proposed actions." },
] });

SCENARIOS.push({ id: "access", title: "Who sees what", roles: "Trainer · Fundraising · Host · Agent · Operations", summary: "The same student and school records seen through different roles: full, aggregated, consented-only, pseudonymised, and denied.", steps: [
  { persona: "p-fb-trainer", path: "/future-builders/students/fbs-01", title: "Trainer: in scope", instruction: "As Sami, Jana’s full profile is visible: attendance, learning, projects, consent, mentoring. Safeguarding stays restricted.", outcome: "Scoped roles see individual records for their own cohorts." },
  { persona: "p-fundraising", path: "/future-builders/students", title: "Fundraising: aggregated only", instruction: "As Joelle, Future Builders students appear only as aggregated counts.", outcome: "No individual learner data for roles that don’t need it." },
  { persona: "p-host", path: "/partner/candidates", title: "Host: consented only", instruction: "As Rita, candidates show a first name and consented portfolio items only.", outcome: "Consent is checked before anything leaves the internal boundary." },
  { persona: "p-fb-trainer", path: "/future-builders", title: "Agent: pseudonymised", instruction: "As Sami, ask Ask CodeBrave “Which students are at risk?”: learners appear as “Student 07”.", outcome: "Agents inherit the user’s permissions and receive minor PII pseudonymised." },
  { persona: "p-ops", path: "/school-upskilling/schools/sch-01", title: "Operations: denied", instruction: "As Ziad, open the school’s “Pupil attendance” tab: it is locked, even though he can see the school.", outcome: "School access never grants pupil data; that is a separate grant." },
] });

SCENARIOS.push({ id: "register", title: "Taking the register", roles: "Class teacher → Project Officer → Fundraising → Operations", summary: "An offline classroom register in English or Arabic, sync, the class history and restricted summaries updating for each role.", steps: [
  { persona: "p-teacher", path: "/teacher", title: "Go offline", instruction: "As Salma, use “Online” in the prototype bar to go offline. Try العربية to see the right-to-left interface.", check: (_d, c) => c.offline, outcome: "Offline: the register will be saved on the device." },
  { persona: "p-teacher", path: "/teacher/classes/cls-01-6A/register", title: "Take the Grade 6-A register", instruction: "Mark 2 absent, 1 late and 1 excused (choose a reason), use “Mark remaining as present”, then “Save on device”.", check: (d) => { const r = reg(d, `reg-cls-01-6A-${DEMO_TODAY}`); if (!r) return false; const c = countMarks(r); return c.A >= 2 && c.L >= 1 && c.E >= 1; }, outcome: "Saved on the device as “waiting to sync”. Nobody was marked present automatically." },
  { persona: "p-teacher", path: "/teacher/classes/cls-01-6A", title: "Reconnect and sync", instruction: "Go back online in the prototype bar. The register syncs and appears in the class history.", check: (d, c) => !c.offline && reg(d, `reg-cls-01-6A-${DEMO_TODAY}`)?.status === "submitted", outcome: "Synced. The class summary and register completion updated." },
  { persona: "p-su-po", path: "/school-upskilling/schools/sch-01", title: "Project Officer’s view", instruction: "As Omar (pupil-data grant), open “Pupil attendance”: class summaries and logged pupil detail include today.", outcome: "Restricted detail for the assigned PO, with every view logged." },
  { persona: "p-fundraising", path: "/school-upskilling/reports", title: "Fundraising’s view", instruction: "As Joelle, the “Pupil attendance” report is aggregated by school and grade, with no names.", outcome: "Donor reporting uses aggregates only." },
  { persona: "p-ops", path: "/school-upskilling/schools/sch-01", title: "No pupil-data grant", instruction: "As Ziad, the “Pupil attendance” tab is locked.", outcome: "Access to pupil data is a separate, explicit grant." },
] });

const tfReg = (d: DemoData) => reg(d, `reg-${todayTs(d).id}`);

SCENARIOS.push({ id: "training", title: "Training attendance and certification", roles: "SU Trainer → SU PM", summary: "A training register pushes a TF below the threshold, the PM is alerted, a correction is requested and approved, and the criterion recalculates.", steps: [
  { persona: "p-su-trainer", path: "/school-upskilling/training", title: "Record today’s session", instruction: "As Jad, take today’s register. Mark Mira Haddad absent, the rest as you like, and submit.", check: (d) => { const r = tfReg(d); return !!r && r.marks[r.attendeeIds.indexOf("tf-24")] === "A"; }, outcome: "Mira’s attendance dropped; the rule alerted the PM." },
  { persona: "p-su-pm", path: "/inbox", title: "PM alert", instruction: "As Maya, see the alert “Mira Haddad is below the 80% training attendance threshold”.", check: (d) => d.inbox.some((i) => i.title.includes("Mira Haddad") && i.toRole === "su_pm"), outcome: "Deterministic rule, no AI involved." },
  { persona: "p-su-pm", path: "/school-upskilling/teaching-fellows/certification", title: "Criterion not met", instruction: "Mira’s attendance criterion shows as not met in the certification queue.", outcome: "Certification eligibility is computed from attendance records." },
  { persona: "p-su-trainer", path: "/school-upskilling/training", title: "Request a correction", instruction: "As Jad, open an earlier session, click the pencil next to Mira, choose Excused, give a reason and send.", check: (d) => d.registers.some((r) => r.kind === "tf" && r.corrections.some((c) => c.requestedBy === "Jad Mansour")), outcome: "The original mark is kept; the correction waits for PM approval." },
  { persona: "p-su-pm", path: "/school-upskilling/training", title: "Approve the correction", instruction: "As Maya, approve the correction at the top of the page.", check: (d) => d.registers.some((r) => r.kind === "tf" && r.corrections.some((c) => c.status === "approved")), outcome: "Attendance and the certification criterion recalculated; history keeps the original." },
] });

SCENARIOS.push({ id: "drifting", title: "Spotting a student drifting", roles: "FB Trainer → FB Project Officer", summary: "A register triggers the absence-streak rule, AI summarises the student’s situation with pseudonymised data, and the PO logs the follow-up.", steps: [
  { persona: "p-fb-trainer", path: "/future-builders/cohorts", title: "Record today’s session", instruction: (d) => `As Sami, open today’s session “${todayFb(d).title}” and mark ${lowestFb(d).name} absent (mark the others), then submit.`, check: (d) => { const r = reg(d, `reg-${todayFb(d).id}`); return !!r && r.marks[r.attendeeIds.indexOf("fbs-07")] === "A"; }, outcome: "Fourth absence in a row: the absence-streak rule created a follow-up task." },
  { persona: "p-fb-trainer", path: "/future-builders", title: "Ask CodeBrave", instruction: "Click “Ask CodeBrave”, ask “Which students are at risk?”, then “Create check-in tasks”.", check: (d) => d.inbox.some((i) => i.title.startsWith("Check in with")), outcome: "Summary with pseudonymised names; tasks created only after confirmation." },
  { persona: "p-fb-po", path: "/future-builders/attendance", title: "Log the follow-up", instruction: (d) => `As Hala, find ${lowestFb(d).name} under “Absence follow-ups” and click “Log follow-up”.`, check: (d) => d.followUps.some((f) => f.studentId === "fbs-07" && f.status === "Done"), outcome: "Logged on the student profile; the task closed." },
] });
