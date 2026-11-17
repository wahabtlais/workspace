import type {
  Applicant, Consent, FBCohort, FBSession, FBStudent, FollowUp, InternshipOpening, Organization,
  Pathway, Placement, PortfolioItem, Project, Register, Team,
} from "../types";
import { addDays, DEMO_TODAY, pick, seededRandom } from "@/lib/utils";
import { FAMILY_NAMES, FEMALE_NAMES, MALE_NAMES } from "./people";
import { scheduledDates } from "./su";

const rand = seededRandom(1518);

export const PATHWAY_LABEL: Record<Pathway, string> = { ai: "AI & Machine Learning", web: "Web Development", ent: "Entrepreneurship" };

export const fbCohorts: FBCohort[] = [
  { id: "fbc-1", name: "Future Builders 2025–26", status: "Graduated", start: "2025-09-22", end: "2026-06-26", trainerIds: ["s-sami", "s-dana", "s-fadi"], poId: "s-hala" },
  { id: "fbc-2", name: "Future Builders 2026–27", status: "Active", start: "2026-09-21", end: "2027-06-25", trainerIds: ["s-sami", "s-dana", "s-fadi"], poId: "s-hala" },
  { id: "fbc-3", name: "Future Builders 2027–28", status: "Admissions", start: "2027-09-20", end: "2028-06-23", trainerIds: [], poId: "s-hala" },
];

const FULL: Consent = { participation: true, dataProcessing: true, media: true, portfolioSharing: true, internshipSharing: true, aiAssistant: true };
const PATHS: Pathway[] = ["web", "ai", "ent"];

function studentName(i: number) {
  if (i === 0) return ["Jana Saab", "Jana"];
  const female = i % 2 === 0;
  const [first] = pick(rand, female ? FEMALE_NAMES : MALE_NAMES);
  return [`${first} ${pick(rand, FAMILY_NAMES)}`, first];
}

export const students: FBStudent[] = [];
for (let i = 0; i < 40; i++) {
  const active = i < 26;
  const [name, firstName] = studentName(i);
  const pathway = PATHS[i % 3];
  const pending = i === 24 || i === 25;
  const consent: Consent = pending
    ? { participation: false, dataProcessing: false, media: false, portfolioSharing: false, internshipSharing: false, aiAssistant: false }
    : { ...FULL, media: rand() > 0.25, internshipSharing: rand() > 0.15, aiAssistant: rand() > 0.2 };
  if (i === 0) Object.assign(consent, FULL);
  students.push({
    id: `fbs-${String(i + 1).padStart(2, "0")}`, name, firstName,
    age: 15 + Math.floor(rand() * 4), cohortId: active ? "fbc-2" : "fbc-1", pathway,
    status: pending ? "Pending consent" : active ? "Active" : "Graduated",
    guardianName: `${pick(rand, ["Mrs.", "Mr."])} ${name.split(" ")[1] ?? "Saab"}`,
    consent,
    mentorId: active && !pending ? (pathway === "ai" ? "s-sami" : pathway === "web" ? "s-dana" : "s-fadi") : undefined,
    readiness: active ? 20 + Math.floor(rand() * 55) : 75 + Math.floor(rand() * 25),
    competencies: {
      "cmp-problem": 1 + Math.floor(rand() * 3), "cmp-collab": 1 + Math.floor(rand() * 3),
      "cmp-comm": 1 + Math.floor(rand() * 3), "cmp-tech": 1 + Math.floor(rand() * 3), "cmp-initiative": 1 + Math.floor(rand() * 3),
    },
  });
}
students[0].age = 16;
students[0].readiness = 58;

export const applicants: Applicant[] = [
  ["Karim Abou Jaoude", 16, "Riverside Intermediate School", "ai", "Applied", undefined],
  ["Rawan Itani", 15, "Lighthouse Public School", "web", "Applied", undefined],
  ["Elie Sarkis", 17, "Hilltop Secondary School", "ent", "Applied", undefined],
  ["Nour El Hage", 16, "Pinewood Intermediate School", "ai", "Screening", 71],
  ["Tamara Wehbe", 15, "Cedar Hill Public School", "web", "Screening", 64],
  ["Fares Akl", 17, "Sunrise Intermediate School", "ent", "Screening", 58],
  ["Lea Hajj", 16, "Harbor Gate Intermediate School", "web", "Interview", 82],
  ["Ibrahim Kassem", 17, "Stonebridge Public School", "ai", "Interview", 77],
  ["Christelle Nader", 16, "Meadowview School", "ai", "Decision", 88],
  ["Mohammad Srour", 15, "Olive Grove Public School", "web", "Decision", 73],
  ["Sabine Feghali", 17, "Riverside Intermediate School", "ent", "Waitlist", 66],
  ["Anthony Rizk", 14, "Pinewood Intermediate School", "web", "Declined", 52],
].map(([name, age, school, pathwayPref, stage, score], i) => ({
  id: `app-${String(i + 1).padStart(2, "0")}`, name: name as string, age: age as number, school: school as string,
  pathwayPref: pathwayPref as Pathway, stage: stage as Applicant["stage"], score: score as number | undefined,
  appliedAt: addDays("2026-10-25", i * 2), guardianName: `Guardian of ${(name as string).split(" ")[0]}`,
  motivation: "I want to build things that help people in my town and learn how technology really works.",
}));

/* ---------------- Sessions & attendance (FB activities) ---------------- */

export const fbSessions: FBSession[] = [];
{
  let n = 1;
  const add = (date: string, type: FBSession["type"], title: string, leadId: string, time: string, pathway?: Pathway) =>
    fbSessions.push({ id: `fbsess-${String(n++).padStart(3, "0")}`, cohortId: "fbc-2", type, title, date, time, leadId, pathway });
  const AI = ["Python warm-up", "Data & datasets", "Cleaning data", "Visualising data", "What is a model?", "Training a classifier", "Evaluating models", "Responsible AI", "Project sprint"];
  const WEB = ["How the web works", "HTML structure", "CSS layout", "Responsive design", "JavaScript basics", "DOM & events", "Forms & validation", "APIs & fetch", "Project sprint"];
  const ENT = ["Finding problems worth solving", "Customer interviews", "Value proposition", "Business model canvas", "Prototyping", "Pricing basics", "Pitching", "Financial basics", "Project sprint"];
  const WS = ["Teamwork & agile", "Design thinking", "Git & collaboration", "Public speaking", "Career stories", "Online safety & ethics", "Demo day prep", "Portfolio clinic", "Client communication"];
  for (let w = 0; w < 10; w++) {
    const mon = addDays("2026-09-21", w * 7);
    add(mon, "Learning session", AI[w % AI.length], "s-sami", "15:30–17:30", "ai");
    add(addDays(mon, 1), "Learning session", WEB[w % WEB.length], "s-dana", "15:30–17:30", "web");
    add(addDays(mon, 2), "Learning session", ENT[w % ENT.length], "s-fadi", "15:30–17:30", "ent");
    if (w % 2 === 0) add(addDays(mon, 3), "Workshop", WS[w % WS.length], "s-hala", "15:30–17:00");
    else add(addDays(mon, 3), "Student meeting", "Cohort check-in", "s-hala", "16:00–17:00");
    if (w % 2 === 1) add(addDays(mon, 4), "Mentor meeting", "Mentor circle", "s-sami", "16:00–17:00", "ai");
  }
}

const activeStudents = students.filter((s) => s.cohortId === "fbc-2" && s.status === "Active");
const STREAK = new Set(["fbs-07", "fbs-14"]);
export const fbRegisters: Register[] = fbSessions
  .filter((s) => s.date < DEMO_TODAY)
  .map((s, k, arr) => {
    const attendees = s.pathway ? activeStudents.filter((st) => st.pathway === s.pathway) : activeStudents;
    const recent = k >= arr.length - 9;
    const marks = attendees.map((st) => {
      if (STREAK.has(st.id) && recent) return "A" as const;
      const r = rand();
      return r < 0.88 ? ("P" as const) : r < 0.93 ? ("L" as const) : r < 0.96 ? ("E" as const) : ("A" as const);
    });
    const reasons: Register["reasons"] = {};
    const lateMinutes: Register["lateMinutes"] = {};
    marks.forEach((m, i) => {
      if (m === "E") reasons[i] = "School activity";
      if (m === "L") lateMinutes[i] = 10;
    });
    return {
      id: `reg-${s.id}`, kind: "fb" as const, contextId: s.id, date: s.date, attendeeIds: attendees.map((a) => a.id),
      marks, reasons, lateMinutes, status: "submitted" as const, recordedBy: s.leadId,
      recordedAt: `${s.date}T17:35:00`, syncedAt: `${s.date}T17:35:00`, corrections: [],
    };
  });

/* ---------------- Organizations ---------------- */

export const organizations: Organization[] = [
  { id: "org-cl-1", name: "Mount Pine Bakery Co.", type: "Client", sector: "Food & retail", contact: "Nabil Saade", ownerId: "s-hala" },
  { id: "org-cl-2", name: "Green Steps Recycling", type: "Client", sector: "Environment", contact: "Hind Abboud", ownerId: "s-hala" },
  { id: "org-cl-3", name: "Valley Clinic Network", type: "Client", sector: "Health", contact: "Dr. Roy Haddad", ownerId: "s-tarek" },
  { id: "org-cl-4", name: "Old Port Tours", type: "Client", sector: "Tourism", contact: "Maha Kassis", ownerId: "s-hala" },
  { id: "org-ho-1", name: "Brightline Digital", type: "Internship host", sector: "Software agency", contact: "Rita Kassab", ownerId: "s-hala", safeguardingCheck: "Passed" },
  { id: "org-ho-2", name: "Nexa Data Labs", type: "Internship host", sector: "Data & analytics", contact: "Marc Tohme", ownerId: "s-hala", safeguardingCheck: "Passed" },
  { id: "org-ho-3", name: "Startup Garage Hub", type: "Internship host", sector: "Incubator", contact: "Lama Aridi", ownerId: "s-tarek", safeguardingCheck: "Passed" },
  { id: "org-ho-4", name: "CityWeb Studio", type: "Internship host", sector: "Web design", contact: "Paul Khalife", ownerId: "s-hala", safeguardingCheck: "Pending" },
  { id: "org-ho-5", name: "Harbor Logistics", type: "Internship host", sector: "Logistics", contact: "Ghada Mansour", ownerId: "s-tarek", safeguardingCheck: "Not started" },
  { id: "org-do-1", name: "Northbridge Foundation", type: "Donor", sector: "Education philanthropy", contact: "Helen Moore", ownerId: "s-joelle" },
  { id: "org-do-2", name: "Horizon Education Fund", type: "Donor", sector: "Multilateral fund", contact: "Daniel Okafor", ownerId: "s-joelle" },
  { id: "org-do-3", name: "Atlas Community Trust", type: "Donor", sector: "Community foundation", contact: "Sofia Lindqvist", ownerId: "s-bassel" },
  { id: "org-do-4", name: "Meridian Tech for Good", type: "Donor", sector: "Corporate foundation", contact: "Priya Raman", ownerId: "s-joelle" },
  { id: "org-do-5", name: "Blue Harbor Bank Foundation", type: "Donor", sector: "Corporate foundation", contact: "Karl Weber", ownerId: "s-bassel" },
  { id: "org-pa-1", name: "Civic Futures Alliance", type: "Partner", sector: "NGO network", contact: "Amal Zeidan", ownerId: "s-joelle" },
  { id: "org-pa-2", name: "Regional Education Office (fictional)", type: "Partner", sector: "Public education", contact: "Office of Digital Learning", ownerId: "s-maya" },
];

/* ---------------- Teams & projects ---------------- */

const byPath = (p: Pathway) => activeStudents.filter((s) => s.pathway === p).map((s) => s.id);
const TEAM_DEFS: [string, Pathway, number, string][] = [
  ["Team Pixel", "web", 0, "prj-01"], ["Team Stack", "web", 1, "prj-02"],
  ["Team Neuron", "ai", 0, "prj-03"], ["Team Insight", "ai", 1, "prj-04"],
  ["Team Launchpad", "ent", 0, "prj-05"], ["Team Spark", "ent", 1, "prj-06"],
];
export const teams: Team[] = TEAM_DEFS.map(([name, pathway, half, projectId], i) => {
  const ids = byPath(pathway);
  const mid = Math.ceil(ids.length / 2);
  return { id: `team-${i + 1}`, name, cohortId: "fbc-2", pathway, memberIds: half === 0 ? ids.slice(0, mid) : ids.slice(mid), projectId };
});
for (const t of teams) for (const m of t.memberIds) { const s = students.find((x) => x.id === m); if (s) s.teamId = t.id; }

const ms = (titles: [string, string, Project["milestones"][number]["status"]][]) =>
  titles.map(([title, due, status], i) => ({ id: `ms-${Math.floor(rand() * 1e6)}-${i}`, title, due, status }));

export const projects: Project[] = [
  { id: "prj-01", kind: "client", title: "Online ordering site for Mount Pine Bakery", teamId: "team-1", clientId: "org-cl-1", summary: "A mobile-friendly site where customers browse daily bakes and place pickup orders.",
    milestones: ms([["Requirements & scope sign-off", "2026-10-16", "Approved"], ["Wireframes", "2026-10-30", "Approved"], ["Working prototype", "2026-11-20", "Submitted"], ["Launch & handover", "2026-12-18", "Not started"]]) },
  { id: "prj-02", kind: "team", title: "School events board", teamId: "team-2", summary: "A web app for school clubs to publish events and collect sign-ups.",
    milestones: ms([["Problem statement", "2026-10-14", "Approved"], ["Prototype", "2026-11-18", "In progress"], ["Demo day", "2026-12-16", "Not started"]]) },
  { id: "prj-03", kind: "client", title: "Recycling demand forecast for Green Steps", teamId: "team-3", clientId: "org-cl-2", summary: "Predict weekly collection volumes per neighbourhood to plan truck routes.",
    milestones: ms([["Data access & scope", "2026-10-20", "Approved"], ["Exploratory analysis", "2026-11-10", "Changes requested"], ["Model v1", "2026-12-04", "Not started"], ["Client presentation", "2027-01-15", "Not started"]]) },
  { id: "prj-04", kind: "team", title: "Plant disease image classifier", teamId: "team-4", summary: "A classifier that flags common leaf diseases from phone photos.",
    milestones: ms([["Dataset collection", "2026-10-23", "Approved"], ["Baseline model", "2026-11-20", "In progress"], ["Demo day", "2026-12-16", "Not started"]]) },
  { id: "prj-05", kind: "client", title: "Visitor booking pilot for Old Port Tours", teamId: "team-5", clientId: "org-cl-4", summary: "Test a simple booking and feedback flow for walking tours and measure demand.",
    milestones: ms([["Customer interviews", "2026-10-21", "Approved"], ["Pilot plan", "2026-11-13", "Submitted"], ["Pilot results", "2026-12-11", "Not started"]]) },
  { id: "prj-06", kind: "team", title: "Second-hand school books marketplace", teamId: "team-6", summary: "A student-run model for reselling textbooks between grades.",
    milestones: ms([["Problem validation", "2026-10-22", "Approved"], ["Business model", "2026-11-19", "In progress"], ["Pitch", "2026-12-16", "Not started"]]) },
];

/* ---------------- Internships, portfolios ---------------- */

export const openings: InternshipOpening[] = [
  { id: "op-1", hostId: "org-ho-1", title: "Junior front-end intern", pathway: "web", seats: 2, start: "2027-01-11", status: "Matching" },
  { id: "op-2", hostId: "org-ho-2", title: "Data assistant intern", pathway: "ai", seats: 2, start: "2027-01-11", status: "Matching" },
  { id: "op-3", hostId: "org-ho-3", title: "Startup operations intern", pathway: "ent", seats: 1, start: "2027-02-01", status: "Open" },
  { id: "op-4", hostId: "org-ho-4", title: "Web design intern", pathway: "web", seats: 1, start: "2027-02-01", status: "Open" },
  { id: "op-5", hostId: "org-ho-1", title: "QA & testing intern (summer)", pathway: "web", seats: 2, start: "2026-07-01", status: "Filled" },
];

const grads = students.filter((s) => s.cohortId === "fbc-1");
export const placements: Placement[] = [
  { id: "pl-1", openingId: "op-1", studentId: "fbs-01", stage: "Shortlisted", checkIns: [] },
  { id: "pl-2", openingId: "op-1", studentId: "fbs-04", stage: "Shared with host", checkIns: [] },
  { id: "pl-3", openingId: "op-2", studentId: "fbs-02", stage: "Interview", checkIns: [] },
  { id: "pl-4", openingId: "op-2", studentId: "fbs-05", stage: "Agreement", checkIns: [] },
  { id: "pl-5", openingId: "op-5", studentId: grads[0].id, stage: "Completed", checkIns: [{ date: "2026-07-20", by: "Rita Kassab", note: "Reliable and curious; picked up our test tooling quickly.", rating: 4 }, { date: "2026-08-24", by: "Rita Kassab", note: "Delivered a full regression checklist.", rating: 5 }] },
  { id: "pl-6", openingId: "op-5", studentId: grads[3].id, stage: "Completed", checkIns: [{ date: "2026-07-20", by: "Rita Kassab", note: "Good teamwork; needs confidence in stand-ups.", rating: 3 }] },
];

export const portfolio: PortfolioItem[] = [
  { id: "pf-1", studentId: "fbs-01", title: "Mount Pine Bakery: wireframes", kind: "Project", visibility: "Shared with host", endorsed: true, addedAt: "2026-10-31" },
  { id: "pf-2", studentId: "fbs-01", title: "Responsive landing page exercise", kind: "Assignment", visibility: "Cohort", endorsed: false, addedAt: "2026-10-15" },
  { id: "pf-3", studentId: "fbs-01", title: "Reflection: my first client meeting", kind: "Reflection", visibility: "Private", endorsed: false, addedAt: "2026-10-17" },
  { id: "pf-4", studentId: "fbs-02", title: "Exploring city air-quality data", kind: "Assignment", visibility: "Cohort", endorsed: true, addedAt: "2026-10-28" },
  { id: "pf-5", studentId: "fbs-04", title: "Accessible forms mini-project", kind: "Project", visibility: "Shared with host", endorsed: true, addedAt: "2026-11-05" },
];

export const fbFollowUps: FollowUp[] = [
  { id: "fu-fb-2", title: "Absence follow-up: 3 consecutive sessions missed", program: "FB", studentId: "fbs-14", ownerId: "s-hala", due: addDays(DEMO_TODAY, 2), status: "Open", source: "Absence streak rule (3 sessions)", createdAt: "2026-11-13" },
  { id: "fu-fb-3", title: "Guardian consent outstanding for 2 admitted students", program: "FB", ownerId: "s-hala", due: addDays(DEMO_TODAY, 3), status: "In progress", source: "Consent rule blocks account activation", createdAt: "2026-11-08" },
];

export function scheduledFbDates(days: number[]) {
  return scheduledDates(days, "2026-09-21", DEMO_TODAY);
}
