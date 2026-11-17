import type { DemoData, TeachingFellow } from "@/data/types";
import { attendeeRate, TF_ATTENDANCE_THRESHOLD } from "./metrics";

export const POST_PASS = 70;

export interface Criterion { key: string; label: string; met: boolean | null; detail: string }

/** Certification criteria evaluated automatically from attendance and Assessment Hub results. */
export function certificationCriteria(d: DemoData, tf: TeachingFellow): Criterion[] {
  const regs = d.registers.filter((r) => r.kind === "tf" && r.attendeeIds.includes(tf.id));
  const rate = regs.length ? attendeeRate(regs, tf.id) : null;
  const post = d.assessmentSessions.find((s) => s.id === "as-tf-post")?.entries.find((e) => e.subjectId === tf.id);
  const postScore = tf.postScore ?? (post?.status === "submitted" ? post.score : undefined);
  const practicum = d.visits.some((v) => v.tfId === tf.id && v.score !== undefined && v.score >= 2.5);
  return [
    { key: "base", label: "Pre-training baseline completed", met: tf.preScore !== undefined, detail: tf.preScore !== undefined ? `Score ${tf.preScore}%` : "Not taken" },
    { key: "att", label: `Training attendance ≥ ${TF_ATTENDANCE_THRESHOLD}%`, met: rate === null ? null : rate >= TF_ATTENDANCE_THRESHOLD, detail: rate === null ? "No sessions yet" : `${rate}%` },
    { key: "post", label: `Post-training assessment ≥ ${POST_PASS}%`, met: postScore === undefined ? null : postScore >= POST_PASS, detail: postScore === undefined ? "Not taken yet" : `${postScore}%` },
    { key: "prac", label: "Practicum observation ≥ 2.5 / 4", met: tf.stage === "Certified" || tf.stage === "Deployed" || tf.stage === "Alumni" ? true : practicum ? true : null, detail: practicum || tf.certifiedAt ? "Observed" : "Scheduled in Module 5" },
  ];
}

export function isEligible(c: Criterion[]) {
  return c.every((x) => x.met === true);
}
