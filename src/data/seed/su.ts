import type {
  AttendanceStatus, ExcusedReason, FollowUp, Pupil, Register, School, SchoolClass,
  SchoolTeacher, TeachingFellow, TFCohort, TrainingSession, Visit,
} from "../types";
import { addDays, DEMO_TODAY, pick, seededRandom } from "@/lib/utils";
import { FEMALE_NAMES, INITIALS, MALE_NAMES } from "./people";

const rand = seededRandom(20261117);

export const schools: School[] = [
  { id: "sch-01", name: "Cedar Hill Public School", nameAr: "مدرسة تلة الأرز الرسمية", region: "Northern Region", grades: [5, 6, 7], status: "Active", mouStatus: "Signed", mouExpires: "2027-08-31", principal: "Mr. Antoine Rahme", poId: "s-omar", trainerId: "s-jad", joined: "2023-09-15" },
  { id: "sch-02", name: "Riverside Intermediate School", nameAr: "مدرسة ضفاف النهر المتوسطة", region: "Valley Region", grades: [6, 7, 8], status: "Active", mouStatus: "Signed", mouExpires: "2027-08-31", principal: "Ms. Hanan Chidiac", poId: "s-omar", trainerId: "s-jad", joined: "2023-09-15" },
  { id: "sch-03", name: "Olive Grove Public School", nameAr: "مدرسة بستان الزيتون الرسمية", region: "Valley Region", grades: [5, 6], status: "Active", mouStatus: "Renewal due", mouExpires: "2026-12-31", principal: "Mr. Walid Sfeir", poId: "s-omar", trainerId: "s-jad", joined: "2024-01-10" },
  { id: "sch-04", name: "Hilltop Secondary School", nameAr: "مدرسة قمة التلة الثانوية", region: "Northern Region", grades: [7, 8], status: "Active", mouStatus: "Signed", mouExpires: "2028-08-31", principal: "Ms. Rola Yammine", poId: "s-omar", trainerId: "s-nour", joined: "2024-09-01" },
  { id: "sch-05", name: "Sunrise Intermediate School", nameAr: "مدرسة الشروق المتوسطة", region: "Northern Region", grades: [6, 7, 8], status: "Active", mouStatus: "Signed", mouExpires: "2027-08-31", principal: "Mr. Georges Abi Nader", poId: "s-omar", trainerId: "s-nour", joined: "2024-09-01" },
  { id: "sch-06", name: "Lighthouse Public School", nameAr: "مدرسة المنارة الرسمية", region: "Coastal Region", grades: [5, 6, 7], status: "Active", mouStatus: "Signed", mouExpires: "2027-08-31", principal: "Ms. Samar Kanaan", poId: "s-lina", trainerId: "s-nour", joined: "2023-09-15" },
  { id: "sch-07", name: "Pinewood Intermediate School", nameAr: "مدرسة غابة الصنوبر المتوسطة", region: "Central Region", grades: [6, 7, 8], status: "Active", mouStatus: "Signed", mouExpires: "2027-08-31", principal: "Mr. Fouad Harb", poId: "s-lina", trainerId: "s-jad", joined: "2024-09-01" },
  { id: "sch-08", name: "Stonebridge Public School", nameAr: "مدرسة الجسر الحجري الرسمية", region: "Central Region", grades: [5, 6, 7], status: "Active", mouStatus: "Signed", mouExpires: "2027-08-31", principal: "Ms. Nadia Bou Saleh", poId: "s-lina", trainerId: "s-nour", joined: "2024-09-01" },
  { id: "sch-09", name: "Meadowview School", nameAr: "مدرسة المروج", region: "Coastal Region", grades: [6, 7], status: "Active", mouStatus: "Renewal due", mouExpires: "2027-01-31", principal: "Mr. Pierre Daccache", poId: "s-lina", trainerId: "s-jad", joined: "2025-01-15" },
  { id: "sch-10", name: "Harbor Gate Intermediate School", nameAr: "مدرسة بوابة الميناء المتوسطة", region: "Coastal Region", grades: [6, 7, 8], status: "Active", mouStatus: "Signed", mouExpires: "2028-08-31", principal: "Ms. Joumana Rizkallah", poId: "s-lina", trainerId: "s-nour", joined: "2025-09-01" },
  { id: "sch-11", name: "Almond Valley Public School", nameAr: "مدرسة وادي اللوز الرسمية", region: "Valley Region", grades: [5, 6], status: "Onboarding", mouStatus: "Draft", mouExpires: "2029-08-31", principal: "Mr. Charbel Tannous", poId: "s-omar", trainerId: "s-jad", joined: "2026-10-20" },
  { id: "sch-12", name: "Springfield Intermediate School", nameAr: "مدرسة الينابيع المتوسطة", region: "Central Region", grades: [6, 7, 8], status: "Onboarding", mouStatus: "Draft", mouExpires: "2029-08-31", principal: "Ms. Carole Maalouf", poId: "s-lina", trainerId: "s-nour", joined: "2026-11-02" },
];

const SCHOOL_CODES: Record<string, string> = {
  "sch-01": "CH", "sch-02": "RV", "sch-03": "OG", "sch-04": "HT", "sch-05": "SR",
  "sch-06": "LH", "sch-07": "PW", "sch-08": "SB", "sch-09": "MV", "sch-10": "HG",
};

export const schoolTeachers: SchoolTeacher[] = [
  { id: "st-01", name: "Salma Haidar", nameAr: "سلمى حيدر", schoolId: "sch-01", subject: "ICT & Sciences" },
  { id: "st-02", name: "Bassam Khoury", nameAr: "بسام خوري", schoolId: "sch-02", subject: "Mathematics" },
  { id: "st-03", name: "Rouba Nehme", nameAr: "ربى نعمة", schoolId: "sch-05", subject: "ICT" },
  { id: "st-04", name: "Imad Zgheib", nameAr: "عماد زغيب", schoolId: "sch-07", subject: "Sciences" },
  { id: "st-05", name: "Hoda Merhi", nameAr: "هدى مرعي", schoolId: "sch-08", subject: "ICT" },
  { id: "st-06", name: "Mona Assaf", nameAr: "منى عساف", schoolId: "sch-10", subject: "Mathematics" },
];

/* ---------------- Teaching Fellows ---------------- */

export const tfCohorts: TFCohort[] = [
  { id: "tfc-1", name: "TF Cohort 2025–26", status: "Deployed", start: "2025-10-06", end: "2025-12-19", trainerIds: ["s-jad", "s-nour"] },
  { id: "tfc-2", name: "TF Cohort 2026–27", status: "In training", start: "2026-10-06", end: "2026-12-17", trainerIds: ["s-jad", "s-nour"] },
  { id: "tfc-3", name: "TF Cohort 2027–28 (recruitment)", status: "Recruiting", start: "2027-09-28", end: "2027-12-16", trainerIds: [] },
];

const TF_NAMES: [string, string, string][] = [
  ["Layla Hassan", "ليلى حسن", "BSc Computer Science"], ["Elias Karam", "إلياس كرم", "BA Education"],
  ["Rita Moussa", "ريتا موسى", "BSc Mathematics"], ["Hadi Zein", "هادي زين", "BSc Information Systems"],
  ["Sara Aoun", "سارة عون", "BA Primary Education"], ["Nabil Ghanem", "نبيل غانم", "BSc Physics"],
  ["Joud Bitar", "جود بيطار", "BSc Computer Engineering"], ["Wael Salem", "وائل سالم", "BA English Literature"],
  ["Tala Chamoun", "تالا شمعون", "BSc Computer Science"], ["Majd Rahal", "مجد رحال", "BSc Biology"],
  ["Hiba Daou", "هبة ضو", "BA Education"], ["Khaled Mrad", "خالد مراد", "BSc Computer Science"],
  ["Celine Atallah", "سيلين عطالله", "BA Psychology"], ["Adam Fakhoury", "آدم فاخوري", "BSc IT"],
  ["Rami Youssef", "رامي يوسف", "BSc Computer Science"], ["Yara Nasr", "يارا نصر", "BA Education"],
  ["Bilal Hobeika", "بلال حبيقة", "BSc Mathematics"], ["Ghina Sleiman", "غنى سليمان", "BSc Computer Science"],
  ["Omar Daher", "عمر ضاهر", "BSc Information Systems"], ["Lina Karam", "لينا كرم", "BA Primary Education"],
  ["Fadi Saab", "فادي صعب", "BSc Physics"], ["Aya Hamdan", "آية حمدان", "BSc Computer Engineering"],
  ["Ziad Aoun", "زياد عون", "BA English"], ["Mira Haddad", "ميرا حداد", "BSc Computer Science"],
  ["Tarek Ghanem", "طارق غانم", "BSc Biology"], ["Rania Zein", "رانيا زين", "BA Education"],
  ["Youssef Bitar", "يوسف بيطار", "BSc IT"], ["Farah Salem", "فرح سالم", "BA Psychology"],
  ["Maryam Chamoun", "مريم شمعون", "BSc Computer Science"], ["Jad Rahal", "جاد رحال", "BA Education"],
  ["Zeina Mrad", "زينة مراد", "BSc Mathematics"], ["Ahmad Daou", "أحمد ضو", "BSc IT"],
  ["Layal Fakhoury", "ليال فاخوري", "BA Primary Education"], ["Sami Atallah", "سامي عطالله", "BSc Computer Science"],
  ["Dana Hobeika", "دانا حبيقة", "BSc Physics"], ["Hassan Sleiman", "حسن سليمان", "BA English"],
];

const DEPLOY_SCHOOLS = ["sch-01", "sch-02", "sch-03", "sch-04", "sch-05", "sch-06", "sch-07", "sch-08", "sch-09", "sch-10", "sch-01", "sch-06"];
const RECRUIT_STAGES = ["Applied", "Applied", "Screening", "Screening", "Interview", "Interview", "Offer", "Onboarding"] as const;

export const tfs: TeachingFellow[] = TF_NAMES.map(([name, nameAr, background], i) => {
  const id = `tf-${String(i + 1).padStart(2, "0")}`;
  const email = name.toLowerCase().replace(/[^a-z]+/g, ".") + "@fellows.codebrave.example";
  if (i < 14) {
    const deployed = i < 12;
    return {
      id, name, nameAr, background, email, cohortId: "tfc-1", stage: deployed ? "Deployed" : "Alumni",
      schoolId: deployed ? DEPLOY_SCHOOLS[i] : undefined,
      preScore: 48 + Math.round(rand() * 20), postScore: 72 + Math.round(rand() * 22),
      certifiedAt: "2025-12-22", appliedAt: "2025-06-10",
    } satisfies TeachingFellow;
  }
  if (i < 28) {
    return { id, name, nameAr, background, email, cohortId: "tfc-2", stage: "In training", preScore: 42 + Math.round(rand() * 24), appliedAt: "2026-06-15" } satisfies TeachingFellow;
  }
  return { id, name, nameAr, background, email, cohortId: "tfc-3", stage: RECRUIT_STAGES[i - 28], appliedAt: addDays("2026-10-20", (i - 28) * 3) } satisfies TeachingFellow;
});

/* ---------------- Classes & pupils (pupils have no accounts) ---------------- */

interface ClassSpec { schoolId: string; grade: number; section: string; teacherId: string; teacherType: "tf" | "school"; days: number[]; period: string }

const CLASS_SPECS: ClassSpec[] = [
  { schoolId: "sch-01", grade: 5, section: "A", teacherId: "tf-01", teacherType: "tf", days: [1, 3], period: "Period 2 · 08:50" },
  { schoolId: "sch-01", grade: 6, section: "A", teacherId: "st-01", teacherType: "school", days: [2, 4], period: "Period 3 · 09:45" },
  { schoolId: "sch-01", grade: 6, section: "B", teacherId: "st-01", teacherType: "school", days: [1, 3], period: "Period 4 · 10:40" },
  { schoolId: "sch-01", grade: 7, section: "A", teacherId: "tf-11", teacherType: "tf", days: [2, 4], period: "Period 5 · 11:35" },
];
const TEACHER_FOR: Record<string, { tf: string; school?: string }> = {
  "sch-02": { tf: "tf-02", school: "st-02" }, "sch-03": { tf: "tf-03" }, "sch-04": { tf: "tf-04" },
  "sch-05": { tf: "tf-05", school: "st-03" }, "sch-06": { tf: "tf-06" }, "sch-07": { tf: "tf-07", school: "st-04" },
  "sch-08": { tf: "tf-08", school: "st-05" }, "sch-09": { tf: "tf-09" }, "sch-10": { tf: "tf-10", school: "st-06" },
};
const DAY_PATTERNS = [[1, 3], [2, 4], [1, 4], [2, 5], [3, 5]];
const PERIODS = ["Period 1 · 07:55", "Period 2 · 08:50", "Period 3 · 09:45", "Period 4 · 10:40", "Period 5 · 11:35"];

for (const s of schools.slice(1, 10)) {
  const t = TEACHER_FOR[s.id];
  const grades = s.grades.length >= 3 ? s.grades.slice(0, 3) : [s.grades[0], s.grades[1] ?? s.grades[0], s.grades[s.grades.length - 1]];
  const sectionsUsed: Record<number, number> = {};
  grades.forEach((g, k) => {
    sectionsUsed[g] = (sectionsUsed[g] ?? 0) + 1;
    const useSchool = Boolean(t.school) && k === 2;
    const n = Number(s.id.slice(-2));
    CLASS_SPECS.push({
      schoolId: s.id, grade: g, section: String.fromCharCode(64 + sectionsUsed[g]),
      teacherId: useSchool ? t.school! : t.tf, teacherType: useSchool ? "school" : "tf",
      days: DAY_PATTERNS[(k + n) % DAY_PATTERNS.length],
      period: PERIODS[(k * 2 + n) % PERIODS.length],
    });
  });
}
// The second TF at Lighthouse takes the Grade 7 class
const lh7 = CLASS_SPECS.find((c) => c.schoolId === "sch-06" && c.grade === 7);
if (lh7) lh7.teacherId = "tf-12";

export const pupils: Pupil[] = [];
export const classes: SchoolClass[] = CLASS_SPECS.map((spec) => {
  const id = `cls-${spec.schoolId.slice(-2)}-${spec.grade}${spec.section}`;
  const size = 22 + Math.floor(rand() * 7);
  const classPupils: Pupil[] = [];
  for (let n = 1; n <= size; n++) {
    const female = rand() < 0.5;
    const [firstName, firstNameAr] = pick(rand, female ? FEMALE_NAMES : MALE_NAMES);
    const [initial, initialAr] = pick(rand, INITIALS);
    classPupils.push({
      id: `${id}-p${String(n).padStart(2, "0")}`, classId: id, schoolId: spec.schoolId,
      code: `${SCHOOL_CODES[spec.schoolId]}-${spec.grade}${spec.section}-${String(n).padStart(2, "0")}`,
      firstName, firstNameAr, initial, initialAr, gender: female ? "F" : "M",
    });
  }
  classPupils.sort((a, b) => (a.firstName + a.initial).localeCompare(b.firstName + b.initial));
  pupils.push(...classPupils);
  return {
    id, schoolId: spec.schoolId, grade: spec.grade, section: spec.section, teacherId: spec.teacherId,
    teacherType: spec.teacherType, subject: "Digital Skills", days: spec.days, period: spec.period,
    pupilIds: classPupils.map((p) => p.id),
  };
});

/* ---------------- Pupil classroom registers (6 weeks of term) ---------------- */

export const TERM_START = "2026-10-05";
const REASONS: ExcusedReason[] = ["Illness", "Family", "School activity", "Transport", "Other"];
const UNRELIABLE_CLASSES = new Set(["cls-05-8A", "cls-09-7A", "cls-10-8A"]);

export function weekday(iso: string) {
  return new Date(iso + "T00:00:00Z").getUTCDay();
}

export function scheduledDates(days: number[], from: string, toExclusive: string) {
  const out: string[] = [];
  for (let d = from; d < toExclusive; d = addDays(d, 1)) if (days.includes(weekday(d))) out.push(d);
  return out;
}

function markFor(pPresent: number): { m: AttendanceStatus; reason?: ExcusedReason; late?: number } {
  const r = rand();
  if (r < pPresent) return { m: "P" };
  if (r < pPresent + 0.035) return { m: "L", late: 5 + Math.floor(rand() * 20) };
  if (r < pPresent + 0.06) return { m: "E", reason: pick(rand, REASONS) };
  return { m: "A" };
}

function fill(attendeeIds: string[], p: (i: number) => number) {
  const reasons: Record<number, ExcusedReason> = {};
  const lateMinutes: Record<number, number> = {};
  const marks = attendeeIds.map((_, i) => {
    const r = markFor(p(i));
    if (r.reason) reasons[i] = r.reason;
    if (r.late) lateMinutes[i] = r.late;
    return r.m;
  });
  return { marks, reasons, lateMinutes };
}

export const pupilRegisters: Register[] = [];
for (const c of classes) {
  const dates = scheduledDates(c.days, TERM_START, DEMO_TODAY);
  const total = dates.length;
  const time = c.period.slice(-5);
  dates.forEach((date, k) => {
    const id = `reg-${c.id}-${date}`;
    const unreliable = UNRELIABLE_CLASSES.has(c.id);
    const missing = unreliable ? rand() < 0.3 || (k >= total - 2 && rand() < 0.7) : rand() < 0.03;
    if (missing) {
      pupilRegisters.push({ id, kind: "pupil", contextId: c.id, date, attendeeIds: [...c.pupilIds], marks: c.pupilIds.map(() => null), reasons: {}, lateMinutes: {}, status: "missing", corrections: [] });
      return;
    }
    // Stonebridge shows a declining attendance trend over the term
    const base = c.schoolId === "sch-08" ? 0.9 - (k / Math.max(1, total - 1)) * 0.2 : 0.86 + rand() * 0.06;
    pupilRegisters.push({
      id, kind: "pupil", contextId: c.id, date, attendeeIds: [...c.pupilIds], ...fill(c.pupilIds, () => base),
      status: "submitted", recordedBy: c.teacherId, recordedAt: `${date}T${time}:00`, syncedAt: `${date}T${time}:00`, corrections: [],
    });
  });
}

/* ---------------- TF training sessions & registers ---------------- */

const MODULES = [
  "Module 1 · Digital literacy foundations",
  "Module 2 · Teaching with block-based coding",
  "Module 3 · Classroom management for active learning",
  "Module 4 · Assessment for learning",
  "Module 5 · Practicum & reflection",
];
const SESSION_TITLES = [
  "Welcome & program orientation", "How computers represent information", "Safe and responsible internet use",
  "Introduction to block-based coding", "Loops, events and conditionals", "Designing a coding lesson",
  "Routines for a hands-on classroom", "Group work and differentiation", "Managing devices in class",
  "Formative assessment techniques", "Using rubrics with pupils", "Running pre/post assessments",
  "Microteaching round 1", "Microteaching round 2", "Lesson study & peer feedback",
  "Inclusive classrooms", "Working with school leadership", "Reflective practice",
  "Practicum preparation", "Mock observation", "Certification review", "Graduation & deployment briefing",
];

export const trainingSessions: TrainingSession[] = scheduledDates([2, 4], "2026-10-06", "2026-12-18").map((date, i) => ({
  id: `ts-${String(i + 1).padStart(2, "0")}`,
  tfCohortId: "tfc-2",
  title: SESSION_TITLES[i % SESSION_TITLES.length],
  date,
  time: "14:00–17:00",
  venue: i % 5 === 4 ? "Cedar Hill Public School (practicum)" : "CodeBrave Training Centre, Room 2",
  trainerId: i % 3 === 2 ? "s-nour" : "s-jad",
  module: MODULES[Math.min(MODULES.length - 1, Math.floor(i / 4.5))],
}));

const cohort2 = tfs.filter((t) => t.cohortId === "tfc-2").map((t) => t.id);
const LOW_ATTENDANCE = new Set(["tf-20", "tf-24"]);
export const tfRegisters: Register[] = trainingSessions
  .filter((s) => s.date < DEMO_TODAY)
  .map((s) => ({
    id: `reg-${s.id}`, kind: "tf" as const, contextId: s.id, date: s.date, attendeeIds: [...cohort2],
    ...fill(cohort2, (i) => (LOW_ATTENDANCE.has(cohort2[i]) ? 0.6 : 0.94)),
    status: "submitted" as const, recordedBy: s.trainerId, recordedAt: `${s.date}T17:05:00`, syncedAt: `${s.date}T17:05:00`, corrections: [],
  }));

// One TF below threshold has an absence with a pending correction (trainer → PM approval)
{
  const reg = tfRegisters[tfRegisters.length - 3];
  const idx = reg.attendeeIds.indexOf("tf-24");
  reg.marks[idx] = "A";
  delete reg.reasons[idx];
  delete reg.lateMinutes[idx];
  reg.corrections.push({
    id: "corr-tf-01", index: idx, from: "A", to: "E",
    reason: "Medical appointment; certificate provided to the trainer.",
    requestedBy: "s-jad", requestedAt: "2026-11-14T10:20:00", status: "pending",
  });
}

/* ---------------- Visits & follow-ups ---------------- */

const officerFor = (schoolId: string) => schools.find((s) => s.id === schoolId)!.poId;
export const visits: Visit[] = [];
{
  let n = 1;
  for (const s of schools.slice(0, 10)) {
    const tfAtSchool = tfs.filter((t) => t.schoolId === s.id);
    for (let k = 0; k < 6; k++) {
      const date = addDays("2026-09-21", k * 9 + Math.floor(rand() * 4) + (Number(s.id.slice(-2)) % 3));
      if (date >= DEMO_TODAY) continue;
      const tf = tfAtSchool.length ? tfAtSchool[k % tfAtSchool.length] : undefined;
      const purpose: Visit["purpose"] = k % 3 === 2 ? "Coaching check-in" : k === 0 ? "School meeting" : "Classroom observation";
      const baseScore = s.id === "sch-08" ? 2.0 : tf?.id === "tf-09" ? 2.2 : 2.7 + rand() * 0.9;
      visits.push({
        id: `vis-${String(n++).padStart(3, "0")}`, schoolId: s.id, date, officerId: officerFor(s.id), tfId: tf?.id,
        purpose, status: k < 4 ? "Report approved" : "Completed",
        score: purpose === "Classroom observation" ? Math.round(Math.min(4, Math.max(1, baseScore + (rand() - 0.5) * 0.6)) * 10) / 10 : undefined,
      });
    }
  }
  const planned: [string, string, string, Visit["purpose"]][] = [
    ["sch-01", DEMO_TODAY, "tf-01", "Classroom observation"],
    ["sch-03", DEMO_TODAY, "tf-03", "Coaching check-in"],
    ["sch-02", addDays(DEMO_TODAY, 1), "tf-02", "Classroom observation"],
    ["sch-05", addDays(DEMO_TODAY, 2), "tf-05", "Classroom observation"],
    ["sch-08", addDays(DEMO_TODAY, 1), "tf-08", "Classroom observation"],
    ["sch-06", addDays(DEMO_TODAY, 3), "tf-06", "Coaching check-in"],
    ["sch-11", addDays(DEMO_TODAY, 6), "", "School meeting"],
  ];
  for (const [schoolId, date, tfId, purpose] of planned) {
    visits.push({ id: `vis-${String(n++).padStart(3, "0")}`, schoolId, date, officerId: officerFor(schoolId), tfId: tfId || undefined, purpose, status: "Planned" });
  }
}

export const suFollowUps: FollowUp[] = [
  { id: "fu-01", title: "Coaching plan: classroom routines with Wael Salem", program: "SU", schoolId: "sch-08", tfId: "tf-08", ownerId: "s-lina", due: addDays(DEMO_TODAY, 3), status: "In progress", source: "Observation score 1.9 / 4 on 2 Nov", createdAt: "2026-11-02" },
  { id: "fu-02", title: "Investigate declining pupil attendance at Stonebridge", program: "SU", schoolId: "sch-08", ownerId: "s-lina", due: addDays(DEMO_TODAY, 5), status: "Open", source: "Attendance trend rule (−18 pts over 6 weeks)", createdAt: "2026-11-10" },
  { id: "fu-03", title: "Co-plan Grade 7 lesson with Tala Chamoun", program: "SU", schoolId: "sch-09", tfId: "tf-09", ownerId: "s-lina", due: addDays(DEMO_TODAY, -1), status: "Open", source: "Observation score 2.1 / 4 on 28 Oct", createdAt: "2026-10-28" },
  { id: "fu-04", title: "Replace two faulty tablets in the computer lab", program: "SU", schoolId: "sch-05", ownerId: "s-omar", due: addDays(DEMO_TODAY, 7), status: "Open", source: "Equipment check", createdAt: "2026-11-09" },
  { id: "fu-05", title: "MoU renewal meeting with Olive Grove principal", program: "SU", schoolId: "sch-03", ownerId: "s-maya", due: addDays(DEMO_TODAY, 10), status: "Open", source: "MoU expires 31 Dec", createdAt: "2026-11-05" },
  { id: "fu-06", title: "Missing registers: Sunrise Grade 8-A", program: "SU", schoolId: "sch-05", ownerId: "s-omar", due: addDays(DEMO_TODAY, 2), status: "Open", source: "Missing register rule", createdAt: "2026-11-13" },
];

/* Practicum observations for TF Cohort 2026–27 (Module 5 practicum at Cedar Hill and Lighthouse). */
tfs.filter((t) => t.cohortId === "tfc-2").forEach((t, i) => {
  const atCedar = i % 2 === 0;
  visits.push({
    id: `vis-prac-${t.id}`, schoolId: atCedar ? "sch-01" : "sch-06", date: i % 3 === 0 ? "2026-11-10" : "2026-11-12",
    officerId: atCedar ? "s-omar" : "s-lina", tfId: t.id, purpose: "Classroom observation", status: "Report approved",
    score: Math.round((2.6 + ((i * 7) % 9) / 10) * 10) / 10, notes: "Practicum observation (TF training Module 5).",
  });
});
