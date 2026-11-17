import type { Persona, Surface } from "@/data/types";

/** Demo personas (all fictional): one per role, plus learners, a class teacher and partners. */
export const personas: Persona[] = [
  { id: "p-exec", name: "Rana Khoury", title: "Co-founder & Executive Director", role: "exec", surface: "staff", staffId: "s-rana", grants: ["standard", "financial"], scope: {}, summary: "Org indicators, decisions, risks and obligations", demoMoment: "Approves a donor report, assigns a risk follow-up, drills into a program" },
  { id: "p-su-pm", name: "Maya Saleh", title: "Project Manager, School Upskilling", role: "su_pm", surface: "staff", staffId: "s-maya", grants: ["standard", "learner-PII"], scope: {}, summary: "TF pipeline, certification, school coverage, pupil summaries", demoMoment: "Approves a certification batch and an attendance correction" },
  { id: "p-su-po", name: "Omar Haddad", title: "Project Officer, School Upskilling", role: "su_po", surface: "staff", staffId: "s-omar", grants: ["standard", "learner-PII", "pupil-data"], scope: { schoolIds: ["sch-01", "sch-02", "sch-03", "sch-04", "sch-05", "sch-11"] }, summary: "Today’s visits, forms to complete, sync status", demoMoment: "Completes an observation offline; a coaching task is created" },
  { id: "p-su-trainer", name: "Jad Mansour", title: "Trainer, School Upskilling", role: "su_trainer", surface: "staff", staffId: "s-jad", grants: ["standard", "learner-PII"], scope: { tfCohortIds: ["tfc-2"] }, summary: "Training sessions, TF progress, grading queue", demoMoment: "Records a training register and grades a TF assignment" },
  { id: "p-fb-pm", name: "Tarek Daher", title: "Project Manager, Future Builders", role: "fb_pm", surface: "staff", staffId: "s-tarek", grants: ["standard", "learner-PII", "minor-PII"], scope: { fbCohortIds: ["fbc-1", "fbc-2", "fbc-3"] }, summary: "Admissions funnel, cohort health, client projects, placements", demoMoment: "Admits an applicant; consent blocks activation until a guardian approves" },
  { id: "p-fb-po", name: "Hala Rizk", title: "Project Officer, Future Builders", role: "fb_po", surface: "staff", staffId: "s-hala", grants: ["standard", "learner-PII", "minor-PII"], scope: { fbCohortIds: ["fbc-2"] }, summary: "Attendance follow-ups, internships, client relationships", demoMoment: "Follows up an absence streak and matches an internship" },
  { id: "p-fb-trainer", name: "Sami Khalil", title: "Trainer & Mentor, AI Pathway", role: "fb_trainer", surface: "staff", staffId: "s-sami", grants: ["standard", "learner-PII"], scope: { fbCohortIds: ["fbc-2"] }, summary: "Cohort progress, at-risk students, team milestones", demoMoment: "Reviews a team milestone; AI summarises at-risk students" },
  { id: "p-curriculum", name: "Yasmin Awad", title: "Curriculum Manager", role: "curriculum", surface: "staff", staffId: "s-yasmin", grants: ["standard"], scope: {}, summary: "Both collections, reviews, outcomes, improvement backlog", demoMoment: "Drafts a lesson with AI, sends for review, publishes to a portal" },
  { id: "p-ops", name: "Ziad Hamdan", title: "Operations & HR Lead", role: "ops_hr", surface: "staff", staffId: "s-ziad", grants: ["standard", "staff-HR", "financial"], scope: {}, summary: "Requests queue, leave, onboarding, assets, workload", demoMoment: "Approves an equipment request and assigns an asset" },
  { id: "p-fundraising", name: "Joelle Matar", title: "Fundraising & Partnerships Lead", role: "fundraising", surface: "staff", staffId: "s-joelle", grants: ["standard", "financial"], scope: {}, summary: "Pipeline, deadlines, obligations, donor activity", demoMoment: "Runs an AI eligibility check and drafts a donor report" },
  { id: "p-me", name: "Mira Chahine", title: "M&E Officer", role: "me", surface: "staff", staffId: "s-mira", grants: ["standard"], scope: {}, summary: "Indicators, targets, results and evidence", demoMoment: "Verifies indicator figures with provenance before a donor report" },
  { id: "p-admin", name: "Elie Gerges", title: "Platform Administrator", role: "admin", surface: "staff", staffId: "s-elie", grants: ["standard"], scope: {}, summary: "Users & roles, policies, integrations, Agent Hub, audit", demoMoment: "Configures attendance policies; no data access by default" },
  { id: "p-safeguarding", name: "Nadine Fares", title: "Safeguarding Lead", role: "safeguarding_lead", surface: "staff", staffId: "s-nadine", grants: ["standard", "safeguarding"], scope: {}, summary: "Restricted safeguarding cases", demoMoment: "Sees the restricted case list no other persona can open" },
  { id: "p-teacher", name: "Salma Haidar", title: "Class teacher, Cedar Hill Public School", role: "class_teacher", surface: "teacher", grants: ["pupil-data"], scope: { schoolIds: ["sch-01"], classIds: ["cls-01-6A", "cls-01-6B"], teacherId: "st-01" }, summary: "Own classes only: registers and pupil assessments (English / العربية)", demoMoment: "Takes a Grade 6 register offline, syncs, sees the class summary update", bilingual: true },
  { id: "p-tf-deployed", name: "Layla Hassan", title: "Teaching Fellow (deployed), Cedar Hill", role: "tf", surface: "tf", grants: ["pupil-data"], scope: { tfId: "tf-01", schoolIds: ["sch-01"], classIds: ["cls-01-5A"], tfCohortIds: ["tfc-1"] }, summary: "Deployment, my classes, observation feedback", demoMoment: "Takes a class register and reads observation feedback", bilingual: true },
  { id: "p-tf", name: "Rami Youssef", title: "Teaching Fellow (in training)", role: "tf", surface: "tf", grants: [], scope: { tfId: "tf-15", tfCohortIds: ["tfc-2"] }, summary: "Training progress, attendance, assessments, certificate", demoMoment: "Takes the mid-training checkpoint and tracks certification" },
  { id: "p-student", name: "Jana Saab", title: "Future Builders student, Web Development", role: "fb_student", surface: "student", grants: [], scope: { studentId: "fbs-01", fbCohortIds: ["fbc-2"] }, summary: "What’s next, assignments, team project, portfolio, internships", demoMoment: "Submits an assignment, curates portfolio, applies to an internship" },
  { id: "p-client", name: "Nabil Saade", title: "Client, Mount Pine Bakery Co.", role: "client", surface: "partner", grants: [], scope: { orgId: "org-cl-1" }, summary: "Own project, milestones and feedback only", demoMoment: "Signs off a project milestone" },
  { id: "p-host", name: "Rita Kassab", title: "Internship host, Brightline Digital", role: "host", surface: "partner", grants: [], scope: { orgId: "org-ho-1" }, summary: "Openings, consented candidates, interns, check-ins", demoMoment: "Reviews a consented candidate portfolio" },
  { id: "p-donor", name: "Helen Moore", title: "Program officer, Northbridge Foundation", role: "donor", surface: "partner", grants: [], scope: { orgId: "org-do-1", grantIds: ["gr-1"] }, summary: "Approved reports and indicators for their grant", demoMoment: "Views an approved report with aggregated results" },
];

export const SURFACE_LABEL: Record<Surface, string> = {
  staff: "Staff Workspace",
  teacher: "Class Teacher",
  tf: "TF Learning Portal",
  student: "Student Portal",
  partner: "Partner Access",
};

export const SURFACE_HOME: Record<Surface, string> = {
  staff: "/",
  teacher: "/teacher",
  tf: "/tf",
  student: "/student",
  partner: "/partner",
};

export function getPersona(id: string) {
  return personas.find((p) => p.id === id) ?? personas[0];
}
