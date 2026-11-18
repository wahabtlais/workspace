import type { CalendarEvent, DemoData, LessonInsight, OpsRequest } from "../types";

/** Fictional calendar for the demo month (November 2026), plus a few early-December events. */
function buildEvents(): CalendarEvent[] {
  const ev: CalendarEvent[] = [];
  let n = 1;
  const add = (e: Omit<CalendarEvent, "id">) => ev.push({ id: `ev-${String(n++).padStart(3, "0")}`, ...e });
  const mgmt = ["s-rana", "s-karim", "s-maya", "s-tarek", "s-yasmin", "s-ziad", "s-joelle"];
  for (const date of ["2026-11-02", "2026-11-09", "2026-11-16", "2026-11-23", "2026-11-30"]) add({ title: "Management team weekly", type: "Meeting", date, start: "09:30", end: "10:30", location: "Head office, Room 1", organizerId: "s-rana", participantIds: mgmt, agenda: "1. Decisions waiting\n2. Off-track indicators\n3. Risks above 12\n4. Upcoming obligations", related: { kind: "department", id: "Executive", label: "Executive" } });
  for (const date of ["2026-11-04", "2026-11-11", "2026-11-18", "2026-11-25"]) add({ title: "School Upskilling team check-in", type: "Meeting", date, start: "10:00", end: "11:00", online: true, meetLink: "https://meet.google.com/sim-sup-team", organizerId: "s-maya", participantIds: ["s-maya", "s-omar", "s-lina", "s-jad", "s-nour"], agenda: "Visits this week, coaching follow-ups, assessment windows", related: { kind: "department", id: "School Upskilling", label: "School Upskilling" } });
  for (const date of ["2026-11-06", "2026-11-13", "2026-11-20", "2026-11-27"]) add({ title: "Future Builders team retro", type: "Meeting", date, start: "14:00", end: "15:00", location: "Innovation hub", organizerId: "s-tarek", participantIds: ["s-tarek", "s-hala", "s-sami", "s-dana", "s-fadi"], agenda: "What went well, at-risk students, project milestones", related: { kind: "cohort", id: "fbc-2", label: "FB 2026–27" } });
  add({ title: "Ministry liaison follow-up", type: "Meeting", date: "2026-11-19", start: "11:00", end: "12:00", online: true, meetLink: "https://meet.google.com/sim-min-lia", organizerId: "s-rana", participantIds: ["s-rana", "s-maya"], externalParticipants: ["Ministry digital education liaison"], agenda: "Term 1 results summary, 2027 expansion criteria, Arabic worksheets pilot", related: { kind: "department", id: "School Upskilling", label: "School Upskilling" } });
  add({ title: "Board update preparation", type: "Meeting", date: "2026-11-24", start: "10:00", end: "11:30", location: "Head office, Room 1", organizerId: "s-rana", participantIds: ["s-rana", "s-karim", "s-joelle", "s-mira"], agenda: "Draft deck review, figures check with M&E, asks for the board" });
  add({ title: "Quarterly results review", type: "Meeting", date: "2026-11-26", start: "09:00", end: "12:00", location: "Head office, Room 2", organizerId: "s-mira", participantIds: ["s-mira", "s-rana", "s-maya", "s-tarek"], agenda: "Indicators against targets, data quality, evidence for donor reports" });
  add({ title: "Interview: Trainer, School Upskilling (Candidate A.)", type: "Interview", date: "2026-11-10", start: "13:00", end: "14:00", location: "Head office, Room 2", organizerId: "s-ziad", participantIds: ["s-ziad", "s-maya", "s-jad"], related: { kind: "department", id: "Operations & HR", label: "Recruitment · vc-1" } });
  add({ title: "Interview: Trainer, School Upskilling (Candidate B.)", type: "Interview", date: "2026-11-19", start: "13:00", end: "14:00", online: true, meetLink: "https://meet.google.com/sim-int-trb", organizerId: "s-ziad", participantIds: ["s-ziad", "s-maya", "s-jad"], related: { kind: "department", id: "Operations & HR", label: "Recruitment · vc-1" } });
  add({ title: "Interview: M&E Assistant (Candidate E.)", type: "Interview", date: "2026-11-23", start: "11:00", end: "11:45", online: true, meetLink: "https://meet.google.com/sim-int-mea", organizerId: "s-ziad", participantIds: ["s-ziad", "s-mira"], related: { kind: "department", id: "Operations & HR", label: "Recruitment · vc-2" } });
  add({ title: "Curriculum review: Entrepreneurship v1.0", type: "Curriculum review", date: "2026-11-05", start: "14:00", end: "15:30", location: "Innovation hub", organizerId: "s-yasmin", participantIds: ["s-yasmin", "s-fadi", "s-tarek"], related: { kind: "curriculum", id: "cur-ent", label: "Entrepreneurship Pathway" } });
  add({ title: "Curriculum review: AI pathway v1.3", type: "Curriculum review", date: "2026-11-18", start: "14:00", end: "15:30", online: true, meetLink: "https://meet.google.com/sim-cur-ai1", organizerId: "s-yasmin", participantIds: ["s-yasmin", "s-sami", "s-tarek"], agenda: "Reviewer comments, train/test split lesson, applied project module", related: { kind: "curriculum", id: "cur-ai", label: "AI & Machine Learning Pathway" } });
  add({ title: "Curriculum review: Classroom Unit 2 feedback", type: "Curriculum review", date: "2026-11-25", start: "14:00", end: "15:00", location: "Cedar Hill Public School", organizerId: "s-yasmin", participantIds: ["s-yasmin", "s-maya", "s-jad"], externalParticipants: ["Salma Haidar (class teacher)"], agenda: "Feedback on “My first animation”, observation findings, proposed revision", related: { kind: "curriculum", id: "cur-cls", label: "Classroom Digital Skills" } });
  add({ title: "MoU renewal meeting with the principal", type: "School visit", date: "2026-11-26", start: "09:00", end: "10:00", location: "Olive Grove Public School", organizerId: "s-omar", participantIds: ["s-omar", "s-maya"], externalParticipants: ["Mr. Walid Sfeir (principal)"], agenda: "Renewal terms, 2027 timetable, device needs", related: { kind: "school", id: "sch-03", label: "Olive Grove Public School" } });
  add({ title: "Mentor matching session", type: "Future Builders", date: "2026-11-12", start: "16:00", end: "17:30", location: "Innovation hub", organizerId: "s-hala", participantIds: ["s-hala", "s-sami", "s-dana"], related: { kind: "cohort", id: "fbc-2", label: "FB 2026–27" } });
  add({ title: "Community workshop: Careers in tech", type: "Future Builders", date: "2026-11-21", start: "10:00", end: "13:00", location: "Innovation hub", organizerId: "s-hala", participantIds: ["s-hala", "s-tarek", "s-fadi"], description: "Open workshop for students and families with alumni speakers.", related: { kind: "cohort", id: "fbc-2", label: "FB 2026–27" } });
  add({ title: "Client check-in: Mount Pine Bakery website", type: "Future Builders", date: "2026-11-28", start: "11:00", end: "11:45", online: true, meetLink: "https://meet.google.com/sim-cli-mpb", organizerId: "s-sami", participantIds: ["s-sami", "s-hala"], externalParticipants: ["Nabil Saade (client)"], related: { kind: "project", id: "prj-c1", label: "Client project" } });
  add({ title: "Future Builders Demo Day", type: "Future Builders", date: "2026-12-16", start: "16:00", end: "19:00", location: "Innovation hub, main hall", organizerId: "s-tarek", participantIds: ["s-tarek", "s-hala", "s-sami", "s-dana", "s-fadi", "s-rana"], description: "Teams present their projects to clients, hosts and families." });
  add({ title: "Pupil pre-assessment window closes", type: "Deadline", date: "2026-11-27", organizerId: "s-maya", participantIds: ["s-maya", "s-omar", "s-lina", "s-mira"], related: { kind: "department", id: "School Upskilling", label: "Annual pupil assessment 2026–27" } });
  add({ title: "Term 1 registers complete", type: "Deadline", date: "2026-11-30", organizerId: "s-maya", participantIds: ["s-maya", "s-omar", "s-lina"], description: "All pupil class registers for Term 1 submitted and synced." });
  add({ title: "Board papers circulated", type: "Deadline", date: "2026-12-04", organizerId: "s-rana", participantIds: ["s-rana", "s-karim"] });
  add({ title: "Staff training: Safeguarding refresher", type: "Training", date: "2026-11-24", start: "14:00", end: "16:00", online: true, meetLink: "https://meet.google.com/sim-sg-ref", organizerId: "s-nadine", participantIds: ["s-nadine", "s-omar", "s-lina", "s-hala", "s-sami", "s-dana", "s-fadi", "s-jad", "s-nour"] });
  return ev;
}

function buildInsights(): LessonInsight[] {
  return [{
    id: "li-1", curriculumId: "cur-cls", lessonTitle: "My first animation", status: "Monitoring",
    aiReview: { at: "2025-08-20", result: "Passed with notes", notes: ["Objectives are measurable", "Linked to pre/post item 4", "Timing is tight: activities need 45 of 45 minutes"] },
    evidence: [
      { kind: "Teacher feedback", text: "Pupils spend about 15 minutes waiting for tablets; most don’t finish the animation.", by: "Salma Haidar (Cedar Hill)", date: "2026-10-14" },
      { kind: "Teacher feedback", text: "Half the class shares devices. It is too much for one period.", by: "Bassam Khoury (Riverside)", date: "2026-10-28" },
      { kind: "Trainer feedback", text: "Teachers skip the reflection step to save time.", by: "Jad Mansour", date: "2026-11-04" },
      { kind: "Observation", text: "Pupils waiting for devices at the start; most groups did not finish the animation task.", by: "Omar Haddad · Cedar Hill visit", date: "2026-11-05" },
      { kind: "Observation", text: "Tablets not charged; the lesson started 12 minutes late.", by: "Lina Farah · Stonebridge visit", date: "2026-11-09" },
      { kind: "Assessment", text: "Pre-assessment item 4 (ordering a sequence): 41% correct across 9 classes, the lowest item.", by: "Assessment Hub (aggregated)", date: "2026-11-12" },
    ],
  }];
}

const NOTES = [
  "Tablets were not charged at the start; the lesson began late.",
  "Good pupil engagement. Not enough devices for pairs, so groups of four.",
  "Lesson felt rushed; the practice activity was cut short.",
  "Clear routines. Teacher used numbered devices well.",
  "Internet connection dropped; teacher switched to the offline activity.",
  "Pupils waited for devices; the period was too short to finish.",
];

export function refine(d: DemoData) {
  d.events = buildEvents();
  d.lessonInsights = buildInsights();
  for (const c of d.curricula.filter((x) => x.id === "cur-cls")) for (const v of c.versions) for (const m of v.modules) for (const l of m.lessons) if (l.title === "My first animation") {
    l.minutes = 45;
    l.plan = { objectives: "Pupils create a short animation using sequences of blocks, and explain the order of their steps.", activities: ["Warm-up (5 min): recap of sequences", "Demo (10 min): teacher builds a moving character", "Build (25 min): pupils create their own animation on a tablet", "Reflection (5 min): pupils explain their sequence to a partner"], materials: "Tablets with the block-coding app, projector", differentiation: "Support: rebuild a finished example. Challenge: add a second character.", assessment: "Observation during the build; linked to pre/post item 4." };
  }

  // Delivery feedback on a lesson that passed review before publication.
  d.trainerFeedback.push(
    { id: "tf-fb-7", curriculumId: "cur-cls", lessonTitle: "My first animation", trainerId: "st-01", source: "Teacher", rating: 2, theme: "Timing", comment: "Pupils spend about 15 minutes waiting for tablets; most don’t finish the animation.", date: "2026-10-14" },
    { id: "tf-fb-8", curriculumId: "cur-cls", lessonTitle: "My first animation", trainerId: "tf-01", source: "Teaching Fellow", rating: 3, theme: "Timing", comment: "Great lesson, but 45 minutes is not enough for Grade 5.", date: "2026-10-21" },
    { id: "tf-fb-9", curriculumId: "cur-cls", lessonTitle: "My first animation", trainerId: "st-02", source: "Teacher", rating: 2, theme: "Materials", comment: "Half the class shares devices. It is too much for one period.", date: "2026-10-28" },
    { id: "tf-fb-10", curriculumId: "cur-cls", lessonTitle: "My first animation", trainerId: "s-jad", source: "Trainer", rating: 2, theme: "Timing", comment: "Teachers skip the reflection step to save time.", date: "2026-11-04" },
  );

  // Observation notes give the AI recurring themes to find.
  let i = 0;
  for (const v of d.visits) if (v.status !== "Planned" && v.date >= "2026-09-01" && !v.notes && v.purpose !== "Equipment check") v.notes = NOTES[i++ % NOTES.length];

  d.documents.unshift(
    { id: "dc-6", title: "Operations-expenses-Jul-Oct-2026.xlsx", type: "Sheet", context: "Operations & HR · Finance", ownerId: "s-ziad", updatedAt: "2026-11-14", access: "Operations & HR + Executive" },
    { id: "dc-7", title: "Teacher-feedback-survey-Term-1.csv", type: "Sheet", context: "Curriculum · feedback", ownerId: "s-yasmin", updatedAt: "2026-11-13", access: "Curriculum + SU managers" },
  );

  // Requests: destination, responsible person and history.
  const DEST: Record<OpsRequest["type"], OpsRequest["destination"]> = { Leave: "Operations & HR", Equipment: "Operations & HR", Travel: "Operations & HR", Purchase: "Operations & HR", General: "Operations & HR", Curriculum: "Curriculum Manager", "Program support": "School Upskilling Manager" };
  for (const r of d.requests) {
    r.destination ??= DEST[r.type];
    r.ownerId ??= r.type === "Leave" ? "s-reem" : r.type === "Travel" || r.type === "Purchase" ? "s-ghassan" : "s-ziad";
    r.history ??= [{ at: r.createdAt, text: "Submitted", by: r.requesterId }, ...r.chain.filter((c) => c.status === "approved" || c.status === "rejected").map((c) => ({ at: c.at ?? r.createdAt, text: `${c.label} ${c.status}`, by: c.by }))];
  }
  d.requests.push(
    { id: "REQ-0013", type: "Curriculum", destination: "Curriculum Manager", title: "Arabic version of Unit 2 worksheets", requesterId: "s-omar", createdAt: "2026-11-13", ownerId: "s-yasmin", details: "Teachers at three schools asked for Arabic worksheets for Unit 2.", fields: [{ label: "Program", value: "School Upskilling" }, { label: "Grade", value: "Grades 5–6" }, { label: "Lesson / resource", value: "Unit 2 worksheets" }], chain: [{ role: "curriculum", label: "Curriculum Manager", status: "pending" }], status: "In approval", history: [{ at: "2026-11-13", text: "Submitted", by: "s-omar" }] },
    { id: "REQ-0014", type: "Program support", destination: "School Upskilling Manager", title: "Extra coaching support for Stonebridge", requesterId: "s-lina", createdAt: "2026-11-10", ownerId: "s-maya", details: "Two TFs below the coaching threshold before the post-assessment.", fields: [{ label: "School / cohort", value: "Stonebridge Public School" }, { label: "Issue", value: "Observation scores below 2.5" }, { label: "Assistance requested", value: "Two extra coaching visits from a trainer" }], chain: [{ role: "su_pm", label: "SU Project Manager", status: "approved", by: "s-maya", at: "2026-11-11" }], status: "Assigned", assigneeId: "s-nour", history: [{ at: "2026-11-10", text: "Submitted", by: "s-lina" }, { at: "2026-11-11", text: "Approved and assigned to Nour Aziz", by: "s-maya" }] },
  );

  d.inbox.unshift({ id: "ib-req13", toRole: "curriculum", kind: "approval", title: "Approve: Arabic version of Unit 2 worksheets", detail: "REQ-0013 · from Omar Haddad", link: "/inbox", createdAt: "2026-11-13T10:00:00", status: "open", source: "Curriculum Manager" });

  d.audit.unshift(
    { id: "au-7", at: "2026-11-16T16:20:00", actor: "AI assistant (for Ziad Hamdan)", action: "Answered: “Analyze this spreadsheet for trends and anomalies”", target: "Operations-expenses-Jul-Oct-2026.xlsx", dataClass: "financial" },
    { id: "au-8", at: "2026-11-16T09:05:00", actor: "AI assistant (for Rana Khoury)", action: "Answered: “Give me this week's executive briefing”", target: "Results & Indicators (live)", dataClass: "standard" },
    { id: "au-9", at: "2026-11-15T11:30:00", actor: "AI assistant (for Tarek Daher)", action: "Declined a request (restricted data)", target: "Safeguarding records", dataClass: "safeguarding" },
  );
}
