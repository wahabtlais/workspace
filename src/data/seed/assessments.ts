import type { AssessmentEntry, AssessmentForm, AssessmentSession, EntryStatus, PupilAnnualResult, SchoolClass, TeachingFellow, FBStudent } from "../types";
import { addDays, DEMO_TODAY, pick, seededRandom } from "@/lib/utils";

const rand = seededRandom(777);

export const forms: AssessmentForm[] = [
  { id: "frm-pupil-pp", title: "Digital Skills Pupil Assessment (pre/post)", type: "Pre/post test", program: "SU", audience: "Pupils", questionCount: 20, status: "Published", ownerId: "s-yasmin", updatedAt: "2026-09-20", objectiveIds: ["obj-su-1", "obj-su-2", "obj-su-3", "obj-su-4"] },
  { id: "frm-tf-base", title: "TF Pre-training Baseline", type: "Pre/post test", program: "SU", audience: "Teaching Fellows", questionCount: 30, status: "Published", ownerId: "s-yasmin", updatedAt: "2026-09-15", objectiveIds: ["obj-su-1", "obj-su-4", "obj-su-5", "obj-su-6", "obj-su-7"] },
  { id: "frm-tf-mid", title: "TF Mid-training Checkpoint", type: "Quiz", program: "SU", audience: "Teaching Fellows", questionCount: 15, status: "Published", ownerId: "s-yasmin", updatedAt: "2026-11-02", objectiveIds: ["obj-su-4", "obj-su-5", "obj-su-6"] },
  { id: "frm-tf-post", title: "TF Post-training Assessment", type: "Pre/post test", program: "SU", audience: "Teaching Fellows", questionCount: 30, status: "Published", ownerId: "s-yasmin", updatedAt: "2026-09-15", objectiveIds: ["obj-su-1", "obj-su-4", "obj-su-5", "obj-su-6", "obj-su-7"] },
  { id: "frm-obs", title: "Classroom Observation Rubric", type: "Observation", program: "SU", audience: "Teaching Fellows", questionCount: 12, status: "Published", ownerId: "s-maya", updatedAt: "2026-08-30", objectiveIds: ["obj-su-5", "obj-su-6", "obj-su-7"] },
  { id: "frm-school-needs", title: "School Needs Assessment", type: "Visit", program: "SU", audience: "Schools", questionCount: 18, status: "Published", ownerId: "s-maya", updatedAt: "2026-06-12", objectiveIds: [] },
  { id: "frm-fb-quiz-ai", title: "AI Pathway Quiz: Models & Evaluation", type: "Quiz", program: "FB", audience: "FB students", questionCount: 10, status: "Published", ownerId: "s-sami", updatedAt: "2026-11-10", objectiveIds: ["obj-fb-5"] },
  { id: "frm-fb-admit", title: "FB Admissions Screening", type: "Evaluation", program: "FB", audience: "FB students", questionCount: 14, status: "Published", ownerId: "s-tarek", updatedAt: "2026-10-01", objectiveIds: [] },
  { id: "frm-host-checkin", title: "Internship Host Check-in", type: "Survey", program: "FB", audience: "Hosts", questionCount: 8, status: "Published", ownerId: "s-hala", updatedAt: "2026-06-15", objectiveIds: [] },
  { id: "frm-staff-pulse", title: "Staff Pulse Survey", type: "Survey", program: "Org", audience: "Staff", questionCount: 9, status: "Draft", ownerId: "s-ziad", updatedAt: "2026-11-11", objectiveIds: [] },
];

const ERRORS = ["Upload timed out on school Wi-Fi", "Device storage full", "Form version mismatch; resubmission needed", "Connection lost during upload"];
const DEVICES = ["Tablet 01", "Tablet 02", "Tablet 03", "Tablet 04", "Tablet 05", "Tablet 06", "Lab PC 2", "Lab PC 4"];

function liveEntries(ids: string[], mean: number): AssessmentEntry[] {
  return ids.map((subjectId) => {
    const r = rand();
    const status: EntryStatus = r < 0.55 ? "submitted" : r < 0.7 ? "in_progress" : r < 0.84 ? "not_started" : r < 0.93 ? "pending_sync" : "failed";
    const scored = status === "submitted" || status === "pending_sync";
    return {
      subjectId, status, device: status === "not_started" ? undefined : pick(rand, DEVICES),
      score: scored ? Math.round(Math.max(5, Math.min(100, mean + (rand() - 0.5) * 36))) : undefined,
      submittedAt: scored ? `${DEMO_TODAY}T09:${String(10 + Math.floor(rand() * 40)).padStart(2, "0")}:00` : undefined,
      error: status === "failed" ? pick(rand, ERRORS) : undefined,
    };
  });
}

function closedEntries(ids: string[], mean: number, date: string): AssessmentEntry[] {
  return ids.map((subjectId) => {
    if (rand() < 0.05) return { subjectId, status: "not_started" as const, resolution: "Absent" as const };
    return { subjectId, status: "submitted" as const, score: Math.round(Math.max(5, Math.min(100, mean + (rand() - 0.5) * 34))), submittedAt: `${date}T10:00:00`, device: pick(rand, DEVICES) };
  });
}

const LIVE = new Set(["cls-01-6A", "cls-08-6A", "cls-10-8A"]);
const RECONCILING = "cls-05-8A";
const SCHEDULED = "cls-09-7A";

export function buildAssessmentSessions(classes: SchoolClass[], tfs: TeachingFellow[], students: FBStudent[]): AssessmentSession[] {
  const out: AssessmentSession[] = [];
  classes.forEach((c, i) => {
    const mean = 34 + c.grade * 2 + (c.schoolId === "sch-08" ? -6 : 0) + rand() * 6;
    const base = { formId: "frm-pupil-pp", phase: "pre" as const, audience: "pupils" as const, academicYear: "2026–27", schoolId: c.schoolId, classId: c.id, conductedBy: c.teacherId, title: "Pupil pre-assessment 2026–27", id: `as-pre-${c.id}` };
    if (LIVE.has(c.id)) out.push({ ...base, date: DEMO_TODAY, status: "Live", entries: liveEntries(c.pupilIds, mean) });
    else if (c.id === RECONCILING) {
      const entries = liveEntries(c.pupilIds, mean).map((e) => (e.status === "in_progress" ? { ...e, status: "not_started" as const } : e));
      out.push({ ...base, date: addDays(DEMO_TODAY, -1), status: "Reconciling", entries });
    } else if (c.id === SCHEDULED) {
      out.push({ ...base, date: addDays(DEMO_TODAY, 1), status: "Scheduled", entries: c.pupilIds.map((subjectId) => ({ subjectId, status: "not_started" as const })) });
    } else {
      const date = addDays("2026-10-06", i % 9);
      out.push({ ...base, date, status: "Closed", entries: closedEntries(c.pupilIds, mean, date), closedAt: `${addDays(date, 1)}T12:00:00`, closedBy: c.teacherId });
    }
  });
  const cohort2 = tfs.filter((t) => t.cohortId === "tfc-2");
  out.push({ id: "as-tf-base", formId: "frm-tf-base", title: "TF pre-training baseline", phase: "pre", audience: "tf", academicYear: "2026–27", cohortId: "tfc-2", date: "2026-10-06", conductedBy: "s-jad", status: "Closed",
    entries: cohort2.map((t) => ({ subjectId: t.id, status: "submitted" as const, score: t.preScore, submittedAt: "2026-10-06T15:00:00" })), closedAt: "2026-10-07T09:00:00", closedBy: "s-jad" });
  out.push({ id: "as-tf-mid", formId: "frm-tf-mid", title: "TF mid-training checkpoint", phase: "quiz", audience: "tf", academicYear: "2026–27", cohortId: "tfc-2", date: DEMO_TODAY, conductedBy: "s-jad", status: "Live",
    entries: liveEntries(cohort2.map((t) => t.id), 71).map((e) => (e.subjectId === "tf-15" ? { subjectId: e.subjectId, status: "not_started" as const } : e)) });
  out.push({ id: "as-tf-post", formId: "frm-tf-post", title: "TF post-training assessment", phase: "post", audience: "tf", academicYear: "2026–27", cohortId: "tfc-2", date: "2026-12-15", conductedBy: "s-jad", status: "Scheduled",
    entries: cohort2.map((t) => ({ subjectId: t.id, status: "not_started" as const })) });
  const ai = students.filter((s) => s.cohortId === "fbc-2" && s.pathway === "ai" && s.status === "Active");
  out.push({ id: "as-fb-ai-quiz", formId: "frm-fb-quiz-ai", title: "AI pathway quiz: models & evaluation", phase: "quiz", audience: "fb", academicYear: "2026–27", cohortId: "fbc-2", date: DEMO_TODAY, conductedBy: "s-sami", status: "Live", entries: liveEntries(ai.map((s) => s.id), 74) });
  return out;
}

/** Last year (2025–26) complete pre/post results, used by annual reporting. */
export function buildPupilResults(classes: SchoolClass[]): PupilAnnualResult[] {
  return classes
    .filter((c) => c.schoolId !== "sch-10")
    .map((c) => {
      const pre = 33 + c.grade * 2 + rand() * 6 - (c.schoolId === "sch-08" ? 4 : 0);
      const gain = c.schoolId === "sch-08" ? 11 + rand() * 4 : 19 + rand() * 9;
      const enrolled = c.pupilIds.length - 1 + Math.floor(rand() * 3);
      return {
        academicYear: "2025–26", classId: c.id, schoolId: c.schoolId, grade: c.grade,
        preAvg: Math.round(pre * 10) / 10, postAvg: Math.round((pre + gain) * 10) / 10,
        assessedPre: enrolled - Math.floor(rand() * 2), assessedPost: enrolled - Math.floor(rand() * 3), enrolled,
      };
    });
}
