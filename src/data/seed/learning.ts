import type { Competency, Course, Curriculum, Lesson, LessonProgress, LMSAssignment, LMSSubmission, Module, Objective } from "../types";
import { seededRandom } from "@/lib/utils";

const rand = seededRandom(4242);

export const competencies: Competency[] = [
  { id: "cmp-problem", name: "Problem solving" },
  { id: "cmp-collab", name: "Collaboration" },
  { id: "cmp-comm", name: "Communication" },
  { id: "cmp-tech", name: "Technical craft" },
  { id: "cmp-initiative", name: "Initiative & ownership" },
];

export const objectives: Objective[] = [
  { id: "obj-su-1", collection: "SU", code: "SU.DL.1", text: "Explain how computers store and process information" },
  { id: "obj-su-2", collection: "SU", code: "SU.DL.2", text: "Use the internet safely and responsibly" },
  { id: "obj-su-3", collection: "SU", code: "SU.CT.1", text: "Decompose a problem into steps (algorithms)" },
  { id: "obj-su-4", collection: "SU", code: "SU.CT.2", text: "Use loops, events and conditionals in block-based code" },
  { id: "obj-su-5", collection: "SU", code: "SU.PD.1", text: "Plan an active-learning lesson with clear objectives" },
  { id: "obj-su-6", collection: "SU", code: "SU.PD.2", text: "Manage a hands-on, device-based classroom" },
  { id: "obj-su-7", collection: "SU", code: "SU.PD.3", text: "Use formative assessment and rubrics to adapt teaching" },
  { id: "obj-fb-1", collection: "FB", code: "FB.WEB.1", text: "Build semantic, accessible HTML pages", competencyId: "cmp-tech" },
  { id: "obj-fb-2", collection: "FB", code: "FB.WEB.2", text: "Create responsive layouts with CSS", competencyId: "cmp-tech" },
  { id: "obj-fb-3", collection: "FB", code: "FB.WEB.3", text: "Add interactivity with JavaScript and the DOM", competencyId: "cmp-tech" },
  { id: "obj-fb-4", collection: "FB", code: "FB.AI.1", text: "Prepare and explore a dataset", competencyId: "cmp-tech" },
  { id: "obj-fb-5", collection: "FB", code: "FB.AI.2", text: "Train and evaluate a simple classifier", competencyId: "cmp-problem" },
  { id: "obj-fb-6", collection: "FB", code: "FB.AI.3", text: "Discuss bias and responsible use of AI", competencyId: "cmp-comm" },
  { id: "obj-fb-7", collection: "FB", code: "FB.ENT.1", text: "Identify a problem through customer interviews", competencyId: "cmp-problem" },
  { id: "obj-fb-8", collection: "FB", code: "FB.ENT.2", text: "Describe a value proposition and business model", competencyId: "cmp-initiative" },
  { id: "obj-fb-9", collection: "FB", code: "FB.ENT.3", text: "Pitch an idea clearly to an audience", competencyId: "cmp-comm" },
  { id: "obj-fb-10", collection: "FB", code: "FB.CORE.1", text: "Work in a team using agile routines", competencyId: "cmp-collab" },
];

let lessonN = 0;
function lessons(titles: [string, string[]][]): Lesson[] {
  return titles.map(([title, objectiveIds]) => ({ id: `les-${++lessonN}`, title, minutes: [45, 60, 90, 120][Math.floor(rand() * 4)], objectiveIds }));
}
function mod(id: string, title: string, l: [string, string[]][]): Module {
  return { id, title, lessons: lessons(l) };
}

const tfFoundationsV1: Module[] = [
  mod("m-tf-1", "Digital literacy foundations", [["How computers represent information", ["obj-su-1"]], ["Safe and responsible internet use", ["obj-su-2"]], ["Algorithms in everyday life", ["obj-su-3"]]]),
  mod("m-tf-2", "Teaching with block-based coding", [["Introduction to block-based coding", ["obj-su-4"]], ["Loops, events and conditionals", ["obj-su-4"]], ["Designing a coding lesson", ["obj-su-5"]]]),
  mod("m-tf-3", "Classroom management for active learning", [["Routines for a hands-on classroom", ["obj-su-6"]], ["Group work and differentiation", ["obj-su-6", "obj-su-5"]], ["Managing devices in class", ["obj-su-6"]]]),
  mod("m-tf-4", "Assessment for learning", [["Formative assessment techniques", ["obj-su-7"]], ["Using rubrics with pupils", ["obj-su-7"]], ["Running pre/post assessments", ["obj-su-7"]]]),
];
const classroomV2: Module[] = [
  mod("m-cl-1", "Unit 1 · Computers around us (Grades 5–6)", [["What is a computer?", ["obj-su-1"]], ["Inputs and outputs", ["obj-su-1"]], ["Being safe online", ["obj-su-2"]]]),
  mod("m-cl-2", "Unit 2 · Thinking like a programmer", [["Step-by-step instructions", ["obj-su-3"]], ["My first animation", ["obj-su-4"]], ["Games with conditionals", ["obj-su-4"]]]),
  mod("m-cl-3", "Unit 3 · Create and share (Grades 7–8)", [["Plan a project", ["obj-su-3"]], ["Build and test", ["obj-su-4"]], ["Show and tell", ["obj-su-2"]]]),
];
const aiV12: Module[] = [
  mod("m-ai-1", "Working with data", [["Python warm-up", ["obj-fb-4"]], ["Data & datasets", ["obj-fb-4"]], ["Cleaning data", ["obj-fb-4"]], ["Visualising data", ["obj-fb-4"]]]),
  mod("m-ai-2", "Machine learning basics", [["What is a model?", ["obj-fb-5"]], ["Training a classifier", ["obj-fb-5"]], ["Evaluating models", ["obj-fb-5"]]]),
  mod("m-ai-3", "AI and society", [["Responsible AI", ["obj-fb-6"]], ["Bias in data", ["obj-fb-6"]]]),
];
const webV2: Module[] = [
  mod("m-web-1", "Foundations of the web", [["How the web works", ["obj-fb-1"]], ["HTML structure", ["obj-fb-1"]], ["Accessible pages", ["obj-fb-1"]]]),
  mod("m-web-2", "Styling & layout", [["CSS layout", ["obj-fb-2"]], ["Responsive design", ["obj-fb-2"]]]),
  mod("m-web-3", "Interactivity", [["JavaScript basics", ["obj-fb-3"]], ["DOM & events", ["obj-fb-3"]], ["Forms & validation", ["obj-fb-3"]], ["APIs & fetch", ["obj-fb-3"]]]),
];
const entV1: Module[] = [
  mod("m-ent-1", "Discover", [["Finding problems worth solving", ["obj-fb-7"]], ["Customer interviews", ["obj-fb-7"]]]),
  mod("m-ent-2", "Design the business", [["Value proposition", ["obj-fb-8"]], ["Business model canvas", ["obj-fb-8"]], ["Pricing basics", ["obj-fb-8"]]]),
  mod("m-ent-3", "Launch", [["Prototyping", ["obj-fb-7", "obj-fb-8"]], ["Pitching", ["obj-fb-9"]], ["Financial basics", ["obj-fb-8"]]]),
];
const clone = (m: Module[]): Module[] => JSON.parse(JSON.stringify(m));

export const curricula: Curriculum[] = [
  {
    id: "cur-tf", collection: "SU", title: "Teaching Fellow Foundations", audience: "Teaching Fellows (pre-service training)", ownerId: "s-yasmin",
    versions: [
      { id: "cur-tf-v10", label: "v1.0", status: "published", modules: tfFoundationsV1, changeLog: "First complete version for the 2026–27 cohort.", createdAt: "2026-08-20", reviewerIds: ["s-jad", "s-maya"], comments: [], approvedBy: "s-maya", approvedAt: "2026-09-18", publishedAt: "2026-09-25" },
      { id: "cur-tf-v11", label: "v1.1", status: "draft", modules: [...clone(tfFoundationsV1), mod("m-tf-5", "Practicum & reflection", [["Microteaching", ["obj-su-5"]], ["Inclusive classrooms", ["obj-su-6"]]])], changeLog: "Adds a practicum module based on trainer feedback from cohort 2025–26.", createdAt: "2026-11-03", reviewerIds: [], comments: [] },
    ],
  },
  {
    id: "cur-cls", collection: "SU", title: "Classroom Digital Skills, Grades 5–8", audience: "School pupils (taught by class teachers)", ownerId: "s-yasmin",
    versions: [
      { id: "cur-cls-v10", label: "v1.0", status: "published", modules: clone(classroomV2).slice(0, 2), changeLog: "Initial classroom units.", createdAt: "2025-08-01", reviewerIds: ["s-maya"], comments: [], approvedBy: "s-maya", approvedAt: "2025-08-28", publishedAt: "2025-09-01" },
      { id: "cur-cls-v20", label: "v2.0", status: "approved", modules: classroomV2, changeLog: "Adds Unit 3 for Grades 7–8 and aligns all units to the pre/post assessment.", createdAt: "2026-10-01", reviewerIds: ["s-maya", "s-jad"], comments: [{ id: "c-1", authorId: "s-jad", text: "Unit 3 timing works well for 45-minute periods.", at: "2026-10-12T09:00:00", resolved: true }], approvedBy: "s-maya", approvedAt: "2026-10-20" },
    ],
  },
  {
    id: "cur-ai", collection: "FB", title: "AI & Machine Learning Pathway", audience: "Future Builders students (15–18)", pathway: "ai", ownerId: "s-yasmin",
    versions: [
      { id: "cur-ai-v12", label: "v1.2", status: "published", modules: aiV12, changeLog: "Refreshed datasets and added a model evaluation lesson.", createdAt: "2026-07-10", reviewerIds: ["s-sami", "s-tarek"], comments: [], approvedBy: "s-tarek", approvedAt: "2026-08-30", publishedAt: "2026-09-10" },
      { id: "cur-ai-v13", label: "v1.3", status: "in_review", modules: [...clone(aiV12), mod("m-ai-4", "Applied project", [["Scoping an ML project", ["obj-fb-5"]], ["Presenting results", ["obj-fb-6"]]])], changeLog: "Adds an applied-project module that links to client projects.", createdAt: "2026-11-05", reviewerIds: ["s-sami", "s-tarek"],
        comments: [{ id: "c-2", authorId: "s-sami", text: "Can we add a short lesson on train/test splits before Evaluating models?", at: "2026-11-12T14:10:00", target: "Evaluating models" }] },
    ],
  },
  {
    id: "cur-web", collection: "FB", title: "Web Development Pathway", audience: "Future Builders students (15–18)", pathway: "web", ownerId: "s-yasmin",
    versions: [
      { id: "cur-web-v20", label: "v2.0", status: "published", modules: webV2, changeLog: "Restructured around accessibility-first HTML.", createdAt: "2026-07-01", reviewerIds: ["s-dana", "s-tarek"], comments: [], approvedBy: "s-tarek", approvedAt: "2026-08-25", publishedAt: "2026-09-08" },
    ],
  },
  {
    id: "cur-ent", collection: "FB", title: "Entrepreneurship Pathway", audience: "Future Builders students (15–18)", pathway: "ent", ownerId: "s-yasmin",
    versions: [
      { id: "cur-ent-v10", label: "v1.0", status: "approved", modules: entV1, changeLog: "First structured version, replacing the pilot materials.", createdAt: "2026-10-05", reviewerIds: ["s-fadi", "s-tarek"], comments: [{ id: "c-3", authorId: "s-fadi", text: "Approved from my side. Students are asking for this.", at: "2026-11-09T11:00:00", resolved: true }], approvedBy: "s-tarek", approvedAt: "2026-11-10" },
    ],
  },
  {
    id: "cur-career", collection: "FB", title: "Career Readiness Essentials", audience: "Future Builders students (15–18)", ownerId: "s-yasmin",
    versions: [
      { id: "cur-career-v01", label: "v0.1", status: "draft", modules: [mod("m-car-1", "Getting ready for work", [["Writing your first CV", ["obj-fb-10"]], ["Interview practice", ["obj-fb-9"]]])], changeLog: "Initial outline.", createdAt: "2026-11-14", reviewerIds: [], comments: [] },
    ],
  },
];

export const courses: Course[] = [
  { id: "crs-tf", env: "TF", curriculumId: "cur-tf", versionId: "cur-tf-v10", title: "Teaching Fellow Foundations", cohortIds: ["tfc-2"], publishedAt: "2026-09-25" },
  { id: "crs-ai", env: "FB", curriculumId: "cur-ai", versionId: "cur-ai-v12", title: "AI & Machine Learning Pathway", pathway: "ai", cohortIds: ["fbc-2"], publishedAt: "2026-09-10" },
  { id: "crs-web", env: "FB", curriculumId: "cur-web", versionId: "cur-web-v20", title: "Web Development Pathway", pathway: "web", cohortIds: ["fbc-2"], publishedAt: "2026-09-08" },
];

const RUBRIC = [
  { criterion: "Meets the brief", levels: ["Beginning", "Developing", "Proficient", "Excellent"] },
  { criterion: "Quality of work", levels: ["Beginning", "Developing", "Proficient", "Excellent"] },
  { criterion: "Reflection & explanation", levels: ["Beginning", "Developing", "Proficient", "Excellent"] },
];

export const lmsAssignments: LMSAssignment[] = [
  { id: "asg-web-1", courseId: "crs-web", title: "Responsive landing page", due: "2026-11-06", points: 100, rubric: RUBRIC },
  { id: "asg-web-2", courseId: "crs-web", title: "Accessible sign-up form", due: "2026-11-20", points: 100, rubric: RUBRIC },
  { id: "asg-ai-1", courseId: "crs-ai", title: "Explore a city dataset", due: "2026-11-03", points: 100, rubric: RUBRIC },
  { id: "asg-ai-2", courseId: "crs-ai", title: "Train your first classifier", due: "2026-11-16", points: 100, rubric: RUBRIC },
  { id: "asg-tf-1", courseId: "crs-tf", title: "Lesson plan: loops with block-based coding", due: "2026-11-12", points: 100, rubric: RUBRIC },
  { id: "asg-tf-2", courseId: "crs-tf", title: "Reflection: managing devices in class", due: "2026-11-26", points: 100, rubric: RUBRIC },
];

export function buildSubmissions(fbLearners: { id: string; pathway: string }[], tfIds: string[]): LMSSubmission[] {
  const out: LMSSubmission[] = [];
  let n = 1;
  const push = (assignmentId: string, learnerId: string, graded: boolean, at: string) => {
    const score = 60 + Math.floor(rand() * 38);
    out.push({
      id: `sub-${n++}`, assignmentId, learnerId, submittedAt: at, status: graded ? "Returned" : "Submitted",
      content: "Submitted work (link to project files).", score: graded ? score : undefined,
      feedback: graded ? (score > 85 ? "Excellent work: clear structure and well explained." : "Good progress. Review the rubric notes on layout and explain your choices.") : undefined,
      gradedBy: graded ? "trainer" : undefined,
    });
  };
  for (const s of fbLearners) {
    if (s.pathway === "web") {
      push("asg-web-1", s.id, true, "2026-11-05T19:00:00");
      if (s.id !== "fbs-01" && rand() < 0.4) push("asg-web-2", s.id, false, "2026-11-16T18:00:00");
    }
    if (s.pathway === "ai") {
      push("asg-ai-1", s.id, true, "2026-11-02T20:00:00");
      if (rand() < 0.75) push("asg-ai-2", s.id, false, "2026-11-15T21:00:00");
    }
  }
  for (const t of tfIds) if (rand() < 0.8) push("asg-tf-1", t, false, "2026-11-11T22:00:00");
  return out;
}

export function buildProgress(learners: { id: string; courseId: string }[]): LessonProgress[] {
  return learners.map(({ id, courseId }) => {
    const course = courses.find((c) => c.id === courseId)!;
    const version = curricula.find((c) => c.id === course.curriculumId)!.versions.find((v) => v.id === course.versionId)!;
    const all = version.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const done = Math.floor(all.length * (0.35 + rand() * 0.4));
    return { learnerId: id, courseId, completedLessonIds: all.slice(0, done) };
  });
}
