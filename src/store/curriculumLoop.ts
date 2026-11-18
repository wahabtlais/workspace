import type { Curriculum, Lesson, LessonInsight, LessonPlan, Objective } from "@/data/types";
import { getPersona } from "@/config/personas";
import { logAI } from "@/ai/engine";
import { DEMO_TODAY, uid } from "@/lib/utils";
import { publishVersion } from "./actions";
import { nowIso, useDemo } from "./demoStore";
import { toast } from "./uiStore";

const S = () => useDemo.getState();
const me = () => getPersona(S().personaId);

/** A complete lesson plan. Lessons without a stored plan get a standard structure built from their objectives. */
export function planFor(l: Lesson, objectives: Objective[]): LessonPlan {
  if (l.plan) return l.plan;
  const obj = l.objectiveIds.map((id) => objectives.find((o) => o.id === id)?.text).filter(Boolean).join("; ");
  const m = l.minutes;
  const intro = Math.round(m * 0.15), demo = Math.round(m * 0.2), main = Math.round(m * 0.45), wrap = m - intro - demo - main;
  return {
    objectives: obj || `Learners can explain and apply the main idea of “${l.title}”.`,
    activities: [`Warm-up (${intro} min): question or quick game linked to “${l.title}”`, `Model (${demo} min): facilitator demonstrates with a worked example`, `Practice (${main} min): pairs complete the main task with a checklist`, `Wrap-up (${wrap} min): share one result and complete the exit ticket`],
    materials: "Slides, printed checklist, devices (one per pair)",
    differentiation: "Support: partially completed example and picture cards. Challenge: an extension task with no hints.",
    assessment: "Exit ticket aligned to the lesson objective; observed during practice using the rubric.",
  };
}

export function findLesson(cur: Curriculum, key: string) {
  const versions = [...cur.versions].reverse();
  const live = versions.find((v) => v.status === "published") ?? versions[0];
  const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  for (const v of [live, ...versions]) for (const m of v.modules) { const l = m.lessons.find((x) => x.id === key || `les-${slug(x.title)}` === key || slug(x.title) === key); if (l) return { ver: v, mod: m, lesson: l }; }
  return undefined;
}

const RECOMMENDATION = (minutes: number): NonNullable<LessonInsight["recommendation"]> => ({
  summary: "Delivery evidence shows pupils lose 12–15 minutes waiting for devices, so most do not finish the animation or the reflection. The lesson passed review because the plan was sound on paper; the problem only appears in real classrooms with shared, uncharged tablets.",
  changes: [
    "Start with a 7-minute unplugged warm-up (act out a sequence) while devices are handed out, so no time is lost",
    "Work in pairs with driver / navigator roles, so one tablet per pair is enough",
    "Give a starter project with the character already on stage, so pupils build the sequence rather than set up",
    "Keep reflection as a 3-minute exit ticket linked to pre/post item 4",
    "Add a ‘charge the night before’ checklist to the teacher notes",
  ],
  minutes,
  plan: {
    objectives: "Pupils create a short animation using a sequence of blocks, and explain the order of their steps.",
    activities: ["Unplugged warm-up (7 min): pupils act out a sequence while devices are handed out", "Demo (8 min): teacher remixes the starter project", "Build in pairs (22 min): driver / navigator, swap roles halfway", "Exit ticket (5 min): order four blocks correctly", "Tidy-up (3 min): numbered devices returned"],
    materials: "Starter project link, one tablet per pair (charged the night before), printed block cards, projector",
    differentiation: "Support: rebuild a finished example using picture cards. Challenge: add a second character that reacts. Pairs are for this lesson only, never fixed groups.",
    assessment: "Exit ticket aligned to pre/post item 4 (ordering a sequence).",
  },
});

export function analyzeInsight(id: string) {
  const ins = S().data.lessonInsights.find((x) => x.id === id);
  if (!ins) return;
  const cur = S().data.curricula.find((c) => c.id === ins.curriculumId)!;
  const minutes = findLesson(cur, ins.lessonTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"))?.lesson.minutes ?? 45;
  S().update((d) => { const x = d.lessonInsights.find((i) => i.id === id)!; x.status = "Recommendation ready"; x.recommendation = RECOMMENDATION(minutes); });
  logAI(me(), `Analyzed ${ins.evidence.length} pieces of delivery evidence`, `Lesson: ${ins.lessonTitle}`);
  toast({ tone: "ai", title: "Recommendation ready (simulated AI)", body: "Review and edit it. Nothing changes in the curriculum until you approve." });
}

export function saveRecommendation(id: string, rec: NonNullable<LessonInsight["recommendation"]>) {
  S().update((d) => { const x = d.lessonInsights.find((i) => i.id === id)!; x.recommendation = { ...rec, editedBy: me().staffId }; });
  toast({ tone: "success", title: "Edits saved" });
}

/** The Curriculum Manager approves: a new version is created with the revised lesson. Approved curriculum is never overwritten. */
export function approveInsight(id: string) {
  const ins = S().data.lessonInsights.find((x) => x.id === id);
  if (!ins?.recommendation) return;
  const p = me();
  let label = "";
  const verId = uid(`${ins.curriculumId}-v`);
  S().update((d) => {
    const c = d.curricula.find((x) => x.id === ins.curriculumId)!;
    const base = c.versions[c.versions.length - 1];
    const [maj, min] = base.label.replace("v", "").split(".").map(Number);
    label = `v${maj}.${min + 1}`;
    const modules = JSON.parse(JSON.stringify(base.modules)) as typeof base.modules;
    for (const m of modules) for (const l of m.lessons) if (l.title === ins.lessonTitle) { l.plan = ins.recommendation!.plan; l.minutes = ins.recommendation!.minutes; }
    c.versions.push({ id: verId, label, status: "approved", modules, changeLog: `Revised “${ins.lessonTitle}” using delivery evidence (${ins.evidence.length} items: teacher and trainer feedback, observations, assessment). AI recommendation edited and approved by ${p.name}.`, createdAt: DEMO_TODAY, reviewerIds: [p.staffId ?? ""], comments: [], approvedBy: p.staffId, approvedAt: nowIso() });
    const x = d.lessonInsights.find((i) => i.id === id)!; x.status = "Approved"; x.versionId = verId; x.decidedBy = p.staffId;
  });
  toast({ tone: "success", title: `${label} created and approved`, body: "The published version is unchanged until you publish." });
}

export function publishInsight(id: string) {
  const ins = S().data.lessonInsights.find((x) => x.id === id);
  if (!ins?.versionId) return;
  publishVersion(ins.curriculumId, ins.versionId);
  S().update((d) => { d.lessonInsights.find((i) => i.id === id)!.status = "Published"; });
  S().notify({ toPersona: "p-teacher", text: `Updated lesson plan: ${ins.lessonTitle}`, link: "/teacher", tone: "info" });
  S().notify({ toPersona: "p-tf-deployed", text: `Updated lesson plan: ${ins.lessonTitle}`, link: "/tf", tone: "info" });
  S().notify({ toRole: "su_pm", text: `Curriculum update published: ${ins.lessonTitle}`, link: "/curriculum", tone: "success" });
}

export function dismissInsight(id: string) {
  S().update((d) => { d.lessonInsights.find((i) => i.id === id)!.status = "Dismissed"; });
  toast({ tone: "info", title: "Recommendation dismissed", body: "The evidence stays on the lesson record." });
}
