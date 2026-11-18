import type { Announcement, Asset, AuditEntry, BacklogItem, DocumentRec, EvidenceItem, LeaveEntry, Meeting, MentorSession, OnboardingRec, Resource, SafeguardingCase, TemplateDoc, TrainerFeedback, Vacancy } from "../types";

export const assets: Asset[] = [
  { id: "as-01", tag: "CB-LT-014", type: "Laptop", model: "14-inch staff laptop", status: "On loan", holder: "s-omar", location: "Field", dueBack: "2027-06-30" },
  { id: "as-02", tag: "CB-LT-015", type: "Laptop", model: "14-inch staff laptop", status: "Available", location: "Head office store" },
  { id: "as-03", tag: "CB-LT-016", type: "Laptop", model: "14-inch staff laptop", status: "Available", location: "Head office store" },
  { id: "as-04", tag: "CB-TB-031", type: "Tablet", model: "10-inch field tablet", status: "In repair", location: "Vendor", dueBack: "2026-11-28" },
  { id: "as-05", tag: "CB-TB-032", type: "Tablet", model: "10-inch field tablet", status: "On loan", holder: "s-lina", location: "Field" },
  { id: "as-06", tag: "CB-TB-040", type: "Tablet", model: "10-inch classroom tablet", status: "On loan", holder: "Cedar Hill Public School", location: "sch-01" },
  { id: "as-07", tag: "CB-PJ-004", type: "Projector", model: "Portable projector", status: "Available", location: "Training centre" },
  { id: "as-08", tag: "CB-RT-009", type: "Router", model: "4G hotspot", status: "On loan", holder: "s-jad", location: "Training centre" },
  { id: "as-09", tag: "CB-LT-021", type: "Laptop", model: "Student laptop", status: "On loan", holder: "fbs-01", location: "Innovation hub", dueBack: "2027-06-25" },
  { id: "as-10", tag: "CB-PH-002", type: "Phone", model: "Field phone", status: "Retired", location: "Head office store" },
];

export const leave: LeaveEntry[] = [
  { id: "lv-1", staffId: "s-dana", type: "Annual", from: "2026-12-22", to: "2026-12-24", status: "Pending" },
  { id: "lv-2", staffId: "s-yasmin", type: "Annual", from: "2026-11-27", to: "2026-11-27", status: "Pending" },
  { id: "lv-3", staffId: "s-karim", type: "Training", from: "2026-11-23", to: "2026-11-25", status: "Approved" },
  { id: "lv-4", staffId: "s-omar", type: "Sick", from: "2026-11-12", to: "2026-11-12", status: "Approved" },
  { id: "lv-5", staffId: "s-ghassan", type: "Annual", from: "2026-12-28", to: "2027-01-02", status: "Approved" },
  { id: "lv-6", staffId: "s-reem", type: "Annual", from: "2026-11-30", to: "2026-12-01", status: "Approved" },
];

export const meetings: Meeting[] = [
  { id: "mt-1", title: "Management meeting", date: "2026-11-24", attendees: ["s-rana", "s-karim", "s-maya", "s-tarek", "s-joelle", "s-ziad"], status: "Upcoming",
    agenda: [{ item: "Decision: Education Resilience Window go / no-go", source: "Decisions" }, { item: "Off-track: observation score 2.8 vs 3.0", source: "Indicators" }, { item: "Risk: grant gr-4 closing with open client project", source: "Risks" }, { item: "Approve 6 replacement field tablets", source: "Approvals" }],
    decisions: [], followUps: [] },
  { id: "mt-2", title: "Management meeting", date: "2026-11-10", attendees: ["s-rana", "s-karim", "s-maya", "s-tarek", "s-joelle"], status: "Held",
    agenda: [{ item: "TF cohort 2026–27 progress", source: "School Upskilling" }, { item: "FB admissions cycle", source: "Future Builders" }],
    decisions: ["Start FB 2027–28 admissions on 25 Oct", "Adopt the annual pupil pre/post assessment in all partner schools"],
    followUps: [{ text: "Investigate Stonebridge attendance decline", ownerId: "s-maya", done: false }, { text: "Prepare tablet replacement budget", ownerId: "s-ziad", done: true }] },
];

export const evidence: EvidenceItem[] = [
  { id: "ev-1", title: "Grade 6 pupils present their first animations", kind: "Story", program: "SU", indicatorIds: ["ind-su-gain"], consent: "Consented", addedBy: "s-omar", date: "2026-11-05", excerpt: "After four weeks, every pupil in Grade 6-A built and shared an animated story." },
  { id: "ev-2", title: "Teaching Fellow reflection: managing 30 pupils and 8 tablets", kind: "Quote", program: "SU", indicatorIds: ["ind-su-obs"], consent: "Consented", addedBy: "s-lina", date: "2026-10-29", excerpt: "“Rotation stations changed everything in my classroom.”" },
  { id: "ev-3", title: "Bakery client meeting with Team Pixel", kind: "Photo", program: "FB", indicatorIds: ["ind-fb-client"], consent: "Pending", addedBy: "s-hala", date: "2026-10-16", excerpt: "Photo of students presenting wireframes (faces blurred until guardian media consent is confirmed)." },
  { id: "ev-4", title: "Alumni story: from Future Builders to junior developer", kind: "Story", program: "FB", indicatorIds: ["ind-fb-grad"], consent: "Consented", addedBy: "s-carla", date: "2026-09-12", excerpt: "A 2025–26 graduate now works part-time as a QA tester while studying." },
  { id: "ev-5", title: "School needs assessment summary, Almond Valley", kind: "Document", program: "SU", indicatorIds: [], consent: "Not required", addedBy: "s-omar", date: "2026-10-22", excerpt: "Lab with 12 working devices; two teachers interested in coding clubs." },
];

export const resources: Resource[] = [
  { id: "rs-1", title: "Block coding starter project pack", kind: "Starter code", collection: "SU", objectiveIds: ["obj-su-4"], updatedAt: "2026-10-01" },
  { id: "rs-2", title: "Classroom routines video walkthrough", kind: "Video", collection: "SU", objectiveIds: ["obj-su-6"], updatedAt: "2026-09-20" },
  { id: "rs-3", title: "Rubric templates for pupil projects", kind: "Document", collection: "SU", objectiveIds: ["obj-su-7"], updatedAt: "2026-10-12" },
  { id: "rs-4", title: "City air-quality dataset (cleaned)", kind: "Dataset", collection: "FB", objectiveIds: ["obj-fb-4"], updatedAt: "2026-09-05" },
  { id: "rs-5", title: "Responsive layout slides", kind: "Slides", collection: "FB", objectiveIds: ["obj-fb-2"], updatedAt: "2026-08-28" },
  { id: "rs-6", title: "Customer interview script", kind: "Document", collection: "FB", objectiveIds: ["obj-fb-7"], updatedAt: "2026-10-03" },
  { id: "rs-7", title: "Classifier notebook template", kind: "Starter code", collection: "FB", objectiveIds: ["obj-fb-5"], updatedAt: "2026-10-20" },
];

export const trainerFeedback: TrainerFeedback[] = [
  { id: "tf-fb-1", curriculumId: "cur-ai", lessonTitle: "Evaluating models", trainerId: "s-sami", rating: 3, theme: "Difficulty", comment: "Students needed a train/test split warm-up first.", date: "2026-11-10" },
  { id: "tf-fb-2", curriculumId: "cur-ai", lessonTitle: "Cleaning data", trainerId: "s-sami", rating: 4, theme: "Materials", comment: "Dataset worked well; add a messier example.", date: "2026-10-12" },
  { id: "tf-fb-3", curriculumId: "cur-web", lessonTitle: "CSS layout", trainerId: "s-dana", rating: 4, theme: "Timing", comment: "Needed 20 more minutes for grid practice.", date: "2026-10-06" },
  { id: "tf-fb-4", curriculumId: "cur-web", lessonTitle: "Accessible pages", trainerId: "s-dana", rating: 5, theme: "Engagement", comment: "Screen-reader demo was a highlight.", date: "2026-09-29" },
  { id: "tf-fb-5", curriculumId: "cur-tf", lessonTitle: "Managing devices in class", trainerId: "s-jad", rating: 3, theme: "Timing", comment: "Practice time too short for TFs new to tablets.", date: "2026-10-29" },
  { id: "tf-fb-6", curriculumId: "cur-tf", lessonTitle: "Loops, events and conditionals", trainerId: "s-nour", rating: 4, theme: "Difficulty", comment: "Good pacing; mixed prior knowledge.", date: "2026-10-20" },
];

export const backlog: BacklogItem[] = [
  { id: "bl-1", curriculumId: "cur-ai", title: "Add train/test split lesson before model evaluation", source: "Trainer feedback + low quiz item scores", priority: "High", status: "In next version" },
  { id: "bl-2", curriculumId: "cur-tf", title: "Extend device-management practice time", source: "Trainer feedback (2 trainers)", priority: "Medium", status: "Planned" },
  { id: "bl-3", curriculumId: "cur-cls", title: "Simplify Unit 2 vocabulary for Grade 5", source: "Pupil pre-assessment item analysis", priority: "Medium", status: "Idea" },
  { id: "bl-4", curriculumId: "cur-web", title: "Add a messier real-world form example", source: "Trainer feedback", priority: "Low", status: "Idea" },
  { id: "bl-5", curriculumId: "cur-tf", title: "Add practicum module", source: "Cohort 2025–26 outcomes", priority: "High", status: "In next version" },
];

export const announcements: Announcement[] = [
  { id: "an-1", env: "FB", title: "Demo day is on 16 December", body: "Every team presents for 5 minutes. Guardians and clients are invited.", authorId: "s-hala", date: "2026-11-12" },
  { id: "an-2", env: "FB", title: "New internship openings", body: "Brightline Digital and Nexa Data Labs are hosting interns from January.", authorId: "s-hala", date: "2026-11-03" },
  { id: "an-3", env: "TF", title: "Mid-training checkpoint on 17 November", body: "15 questions on Modules 2–3. Bring your laptop.", authorId: "s-jad", date: "2026-11-10" },
  { id: "an-4", env: "TF", title: "Practicum schools confirmed", body: "Practicum sessions take place at Cedar Hill and Lighthouse.", authorId: "s-maya", date: "2026-11-01" },
];

export const mentorSessions: MentorSession[] = [
  { id: "ms-1", mentorId: "s-sami", studentId: "fbs-02", date: "2026-11-13", focus: "Choosing a dataset for the team project", notes: "Agreed to compare two public datasets by Friday." },
  { id: "ms-2", mentorId: "s-dana", studentId: "fbs-01", date: "2026-11-11", focus: "Preparing for the client prototype review", notes: "Practise explaining design choices in plain language." },
  { id: "ms-3", mentorId: "s-fadi", studentId: "fbs-03", date: "2026-11-09", focus: "Customer interview findings", notes: "Draft 3 hypotheses for the pilot." },
  { id: "ms-4", mentorId: "s-sami", studentId: "fbs-05", date: "2026-10-30", focus: "Internship interview practice", notes: "Strong technical answers; work on examples of teamwork." },
];

export const audit: AuditEntry[] = [
  { id: "au-1", at: "2026-11-17T08:12:00", actor: "Omar Haddad", action: "Viewed pupil register rows", target: "Cedar Hill · Grade 5-A", dataClass: "pupil-data" },
  { id: "au-2", at: "2026-11-16T15:05:00", actor: "Lina Farah", action: "Submitted observation", target: "Stonebridge · visit", dataClass: "standard" },
  { id: "au-3", at: "2026-11-16T11:40:00", actor: "Nadine Fares", action: "Opened safeguarding case", target: "SG-2026-007", dataClass: "safeguarding" },
  { id: "au-4", at: "2026-11-15T10:02:00", actor: "Elie Gerges", action: "Changed attendance policy window", target: "TF training: 48h → 72h", dataClass: "standard" },
  { id: "au-5", at: "2026-11-14T10:20:00", actor: "Jad Mansour", action: "Requested attendance correction", target: "TF training register", dataClass: "learner-PII" },
  { id: "au-6", at: "2026-11-13T09:00:00", actor: "Reporting & Insights Agent (for Joelle Matar)", action: "Read aggregated indicators", target: "Grant gr-3", dataClass: "standard" },
];

export const templates: TemplateDoc[] = [
  { id: "tp-1", name: "School MoU", category: "Agreement", fields: ["school_name", "principal", "start_date", "grades"], updatedAt: "2026-06-01" },
  { id: "tp-2", name: "TF certificate", category: "Certificate", fields: ["tf_name", "cohort", "certified_on"], updatedAt: "2026-09-01" },
  { id: "tp-3", name: "Internship placement agreement", category: "Agreement", fields: ["student_first_name", "host", "start", "end", "guardian_consent_ref"], updatedAt: "2026-08-15" },
  { id: "tp-4", name: "Donor narrative report", category: "Report", fields: ["grant", "period", "indicators", "stories"], updatedAt: "2026-07-20" },
  { id: "tp-5", name: "FB admission letter", category: "Letter", fields: ["student_first_name", "pathway", "cohort_start"], updatedAt: "2026-10-10" },
];

export const documents: DocumentRec[] = [
  { id: "dc-1", title: "MoU: Cedar Hill Public School 2024–27", type: "PDF", context: "School · Cedar Hill", ownerId: "s-maya", updatedAt: "2024-09-01", access: "Inherits from school record" },
  { id: "dc-2", title: "Visit report: Stonebridge, 2 Nov", type: "Google Doc", context: "Visit · Stonebridge", ownerId: "s-lina", updatedAt: "2026-11-03", access: "Inherits from visit" },
  { id: "dc-3", title: "Semi-annual report draft: Northbridge", type: "Google Doc", context: "Grant · gr-1", ownerId: "s-joelle", updatedAt: "2026-11-15", access: "Fundraising + Executive" },
  { id: "dc-4", title: "FB 2026–27 cohort plan", type: "Sheet", context: "Cohort · FB 2026–27", ownerId: "s-tarek", updatedAt: "2026-09-10", access: "Future Builders team" },
  { id: "dc-5", title: "Placement agreement: Brightline (summer)", type: "PDF", context: "Placement · op-5", ownerId: "s-hala", updatedAt: "2026-06-20", access: "FB PM/PO + host" },
];

export const safeguardingCases: SafeguardingCase[] = [
  { id: "SG-2026-007", opened: "2026-11-16", category: "Wellbeing concern", program: "FB", status: "Open", leadId: "s-nadine", actions: 2 },
  { id: "SG-2026-005", opened: "2026-10-21", category: "Online safety", program: "SU", status: "In follow-up", leadId: "s-nadine", actions: 4 },
  { id: "SG-2026-002", opened: "2026-09-09", category: "Conduct", program: "FB", status: "Closed", leadId: "s-nadine", actions: 6 },
];

export const vacancies: Vacancy[] = [
  { id: "vc-1", title: "Trainer, School Upskilling", department: "School Upskilling", status: "Open", candidates: [{ name: "Candidate A. (fictional)", stage: "Offer" }, { name: "Candidate B. (fictional)", stage: "Interview" }, { name: "Candidate C. (fictional)", stage: "Screening" }] },
  { id: "vc-2", title: "M&E Assistant", department: "M&E", status: "Open", candidates: [{ name: "Candidate D. (fictional)", stage: "Applied" }, { name: "Candidate E. (fictional)", stage: "Screening" }] },
];

export const onboarding: OnboardingRec[] = [
  { id: "ob-1", personName: "New SU Trainer (starts 1 Dec)", kind: "Staff", startDate: "2026-12-01", steps: [{ label: "Contract signed", done: true, owner: "s-reem" }, { label: "Laptop issued", done: false, owner: "s-ziad" }, { label: "Google account", done: false, owner: "s-elie" }, { label: "Policy acknowledgements", done: false, owner: "s-reem" }, { label: "Safeguarding training", done: false, owner: "s-nadine" }] },
  { id: "ob-2", personName: "Zeina Mrad (TF, cohort 2027–28)", kind: "Teaching Fellow", startDate: "2027-09-28", steps: [{ label: "Fellowship agreement", done: true, owner: "s-reem" }, { label: "Background check", done: true, owner: "s-nadine" }, { label: "Platform account", done: false, owner: "s-elie" }, { label: "Pre-training baseline", done: false, owner: "s-jad" }] },
];
