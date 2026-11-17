import type { AttendanceStatus, ExcusedReason, Persona, Register, RoleKey } from "@/data/types";
import { getPersona } from "@/config/personas";
import { attendeeRate, TF_ATTENDANCE_THRESHOLD } from "@/lib/metrics";
import { addDays, DEMO_TODAY, uid } from "@/lib/utils";
import { nowIso, useDemo } from "./demoStore";
import { toast } from "./uiStore";

const S = () => useDemo.getState();
const me = (): Persona => getPersona(S().personaId);
const actorName = () => me().name;

export interface RegisterDraft {
  kind: Register["kind"];
  contextId: string;
  date: string;
  attendeeIds: string[];
  marks: (AttendanceStatus | null)[];
  reasons: Record<number, ExcusedReason>;
  lateMinutes: Record<number, number>;
  label: string;
}

/* ================= Attendance ================= */

export function registerId(kind: Register["kind"], contextId: string, date: string) {
  return kind === "pupil" ? `reg-${contextId}-${date}` : `reg-${contextId}`;
}

/** Submit a register. Never fills unmarked attendees; the UI blocks submission until every attendee is marked. */
export function submitRegister(draft: RegisterDraft) {
  const offline = S().offline;
  const id = registerId(draft.kind, draft.contextId, draft.date);
  const at = nowIso();
  const p = me();
  S().update((d) => {
    const existing = d.registers.find((r) => r.id === id);
    const rec: Register = {
      id, kind: draft.kind, contextId: draft.contextId, date: draft.date, attendeeIds: draft.attendeeIds, marks: draft.marks,
      reasons: draft.reasons, lateMinutes: draft.lateMinutes, status: offline ? "pending_sync" : "submitted",
      recordedBy: p.staffId ?? p.scope.teacherId ?? p.scope.tfId ?? p.id, recordedAt: at, syncedAt: offline ? undefined : at,
      corrections: existing?.corrections ?? [],
    };
    if (existing) Object.assign(existing, rec); else d.registers.push(rec);
    d.inbox.forEach((i) => { if (i.kind === "register" && i.status === "open" && (i.toPersona === p.id || (!i.toPersona && i.toRole === p.role))) i.status = "done"; });
    d.activity.unshift({ id: uid("ac"), at, actor: p.name, text: `recorded attendance: ${draft.label}`, area: "Attendance" });
  });
  if (offline) S().enqueue({ kind: "register", label: draft.label, refId: id });
  applyAttendanceRules(draft);
  toast(offline
    ? { tone: "warning", title: "Saved on this device", body: "The register will sync automatically when you reconnect." }
    : { tone: "success", title: "Register submitted", body: `${draft.label}: summaries updated.` });
}

function applyAttendanceRules(draft: RegisterDraft) {
  const d = S().data;
  if (draft.kind === "fb") {
    const regs = d.registers.filter((r) => r.kind === "fb").sort((a, b) => a.date.localeCompare(b.date));
    draft.attendeeIds.forEach((sid, i) => {
      if (draft.marks[i] !== "A") return;
      const mine = regs.filter((r) => r.attendeeIds.includes(sid)).slice(-3);
      const streak = mine.length === 3 && mine.every((r) => r.marks[r.attendeeIds.indexOf(sid)] === "A");
      const open = d.followUps.some((f) => f.studentId === sid && f.status !== "Done");
      if (streak && !open) {
        const st = d.students.find((s) => s.id === sid);
        S().update((x) => {
          x.followUps.unshift({ id: uid("fu"), title: "Absence follow-up: 3 consecutive sessions missed", program: "FB", studentId: sid, ownerId: "s-hala", due: addDays(DEMO_TODAY, 2), status: "Open", source: "Absence streak rule (3 sessions)", createdAt: DEMO_TODAY });
        });
        S().addInbox({ toRole: "fb_po", kind: "task", title: `Absence follow-up: ${st?.name ?? sid}`, detail: "3 consecutive sessions missed · rule-generated", link: `/future-builders/students/${sid}`, source: "Attendance rule", priority: "high" });
        toast({ tone: "warning", title: "Absence streak detected", body: `A follow-up task was created for the Project Officer (${st?.firstName}).` });
      }
    });
  }
  if (draft.kind === "tf") {
    const regs = d.registers.filter((r) => r.kind === "tf");
    draft.attendeeIds.forEach((tfId) => {
      const rate = attendeeRate(regs, tfId);
      const tf = d.tfs.find((t) => t.id === tfId);
      const exists = d.inbox.some((i) => i.status === "open" && i.toRole === "su_pm" && i.title.includes(tf?.name ?? "§"));
      if (rate < TF_ATTENDANCE_THRESHOLD && !exists) {
        S().addInbox({ toRole: "su_pm", kind: "alert", title: `${tf?.name} is below the ${TF_ATTENDANCE_THRESHOLD}% training attendance threshold`, detail: `Now ${rate}% · certification criterion not met`, link: "/school-upskilling/teaching-fellows/certification", source: "Attendance rule", priority: "high" });
      }
    });
  }
}

const APPROVER: Record<Register["kind"], RoleKey> = { pupil: "su_po", tf: "su_pm", fb: "fb_po" };

export function requestCorrection(regId: string, index: number, to: AttendanceStatus, reason: string) {
  const reg = S().data.registers.find((r) => r.id === regId);
  if (!reg) return;
  S().update((d) => {
    const r = d.registers.find((x) => x.id === regId)!;
    r.corrections.push({ id: uid("corr"), index, from: r.marks[index], to, reason, requestedBy: actorName(), requestedAt: nowIso(), status: "pending" });
  });
  const back = reg.kind === "tf" ? "/school-upskilling/training" : reg.kind === "fb" ? "/future-builders/attendance" : "/school-upskilling/classes";
  S().addInbox({ toRole: APPROVER[reg.kind], kind: "approval", title: `Attendance correction to approve (${reg.date})`, detail: `${reg.marks[index] ?? "—"} → ${to} · ${reason}`, link: back, source: "Attendance", priority: "high" });
  toast({ tone: "info", title: "Correction requested", body: "The original mark is kept until an approver decides." });
}

export function decideCorrection(regId: string, corrId: string, approve: boolean) {
  S().update((d) => {
    const r = d.registers.find((x) => x.id === regId);
    const c = r?.corrections.find((x) => x.id === corrId);
    if (!r || !c) return;
    c.status = approve ? "approved" : "rejected";
    c.decidedBy = actorName();
    c.decidedAt = nowIso();
    if (approve) { r.marks[c.index] = c.to; if (c.to === "E") r.reasons[c.index] = "Other"; }
    d.inbox.forEach((i) => { if (i.status === "open" && i.title.startsWith("Attendance correction") && i.toRole === getPersona(useDemo.getState().personaId).role) i.status = "done"; });
  });
  toast({ tone: approve ? "success" : "info", title: approve ? "Correction approved" : "Correction rejected", body: approve ? "Summaries and certification criteria have been recalculated. The original mark stays in the history." : "The original mark stands." });
}

/* ================= Assessment Hub: live tracking & reconciliation ================= */

const DEVICES = ["Tablet 01", "Tablet 02", "Tablet 03", "Tablet 04", "Tablet 05", "Lab PC 2"];

/** Simulates live activity in a session: learners start, finish, and occasionally hit upload failures. */
export function simulateActivity(sessionId: string) {
  const offline = S().offline;
  const queued: string[] = [];
  S().update((d) => {
    const s = d.assessmentSessions.find((x) => x.id === sessionId);
    if (!s || s.status !== "Live") return;
    let changes = 0;
    for (const e of s.entries) {
      if (changes >= 4) break;
      const r = Math.random();
      if (e.status === "not_started" && r < 0.5) { e.status = "in_progress"; e.device = DEVICES[Math.floor(Math.random() * DEVICES.length)]; changes++; }
      else if (e.status === "in_progress" && r < 0.6) {
        e.score = 30 + Math.floor(Math.random() * 60);
        e.submittedAt = nowIso();
        if (offline) { e.status = "pending_sync"; queued.push(e.subjectId); }
        else if (r < 0.08) { e.status = "failed"; e.error = "Upload timed out on school Wi-Fi"; }
        else e.status = "submitted";
        changes++;
      }
    }
  });
  queued.forEach((sub) => S().enqueue({ kind: "assessment", label: "Assessment submission", refId: `${sessionId}::${sub}` }));
}

export function retrySubmission(sessionId: string, subjectId: string) {
  const offline = S().offline;
  S().update((d) => {
    const e = d.assessmentSessions.find((x) => x.id === sessionId)?.entries.find((x) => x.subjectId === subjectId);
    if (!e) return;
    e.error = undefined;
    e.score = e.score ?? 30 + Math.floor(Math.random() * 60);
    e.submittedAt = nowIso();
    e.status = offline ? "pending_sync" : "submitted";
  });
  if (offline) S().enqueue({ kind: "assessment", label: "Assessment resubmission", refId: `${sessionId}::${subjectId}` });
  toast(offline ? { tone: "warning", title: "Queued for sync" } : { tone: "success", title: "Submission recovered" });
}

/** Seeded pending records come from devices that have since reconnected: syncing confirms them. */
export function syncSession(sessionId: string) {
  if (S().offline) { toast({ tone: "warning", title: "You are offline", body: "Reconnect to sync pending submissions." }); return; }
  let n = 0;
  S().update((d) => {
    d.assessmentSessions.find((x) => x.id === sessionId)?.entries.forEach((e) => { if (e.status === "pending_sync") { e.status = "submitted"; n++; } });
  });
  toast({ tone: "success", title: `${n} pending submission${n === 1 ? "" : "s"} synced` });
}

export function setSessionStatus(sessionId: string, status: "Live" | "Reconciling") {
  S().update((d) => {
    const s = d.assessmentSessions.find((x) => x.id === sessionId);
    if (!s) return;
    s.status = status;
    if (status === "Live" && s.date > DEMO_TODAY) s.date = DEMO_TODAY;
  });
  toast({ tone: "info", title: status === "Live" ? "Session is live" : "Reconciliation started", body: status === "Reconciling" ? "Resolve every learner without a valid submission before closing." : "Submissions now appear in the tracker as they arrive." });
}

export function resolveEntry(sessionId: string, subjectId: string, resolution: "Absent" | "Exempt" | "Paper copy entered" | "Retake scheduled", score?: number) {
  S().update((d) => {
    const e = d.assessmentSessions.find((x) => x.id === sessionId)?.entries.find((x) => x.subjectId === subjectId);
    if (!e) return;
    e.resolution = resolution;
    if (resolution === "Paper copy entered") { e.status = "submitted"; e.score = score ?? 50; e.device = "Paper (entered by teacher)"; e.error = undefined; }
  });
}

export function closeSession(sessionId: string) {
  const s = S().data.assessmentSessions.find((x) => x.id === sessionId);
  if (!s) return false;
  const open = s.entries.filter((e) => e.status !== "submitted" && !e.resolution);
  if (open.length) { toast({ tone: "danger", title: "Can’t close yet", body: `${open.length} learner${open.length === 1 ? "" : "s"} still need a submission or a reason.` }); return false; }
  S().update((d) => { const x = d.assessmentSessions.find((y) => y.id === sessionId)!; x.status = "Closed"; x.closedAt = nowIso(); x.closedBy = actorName(); });
  S().logActivity({ actor: actorName(), text: `closed ${s.title} after reconciliation`, area: "Assessment Hub" });
  if (s.audience === "pupils") S().notify({ toRole: "su_pm", text: `${s.title} closed for a class: annual results updated`, link: "/results/annual", tone: "success" });
  toast({ tone: "success", title: "Session closed", body: "Results are final and now count in reporting." });
  return true;
}

/* ================= Curriculum: review, approval, publishing ================= */

export function sendForReview(curId: string, verId: string) {
  const cur = S().data.curricula.find((c) => c.id === curId)!;
  const reviewers: RoleKey[] = cur.collection === "SU" ? ["su_pm", "su_trainer"] : ["fb_pm", "fb_trainer"];
  S().update((d) => {
    const v = d.curricula.find((c) => c.id === curId)!.versions.find((x) => x.id === verId)!;
    v.status = "in_review";
    v.reviewerIds = cur.collection === "SU" ? ["s-maya", "s-jad"] : ["s-tarek", "s-sami"];
  });
  reviewers.forEach((role) => S().addInbox({ toRole: role, kind: "review", title: `Review curriculum: ${cur.title}`, detail: `Sent for review by ${actorName()}`, link: `/curriculum/${curId}`, source: "Curriculum" }));
  toast({ tone: "success", title: "Sent for review", body: "Reviewers were notified in their Inbox." });
}

export function addReviewComment(curId: string, verId: string, text: string) {
  const p = me();
  S().update((d) => {
    d.curricula.find((c) => c.id === curId)!.versions.find((x) => x.id === verId)!.comments.push({ id: uid("c"), authorId: p.staffId ?? p.id, text, at: nowIso() });
  });
  S().addInbox({ toRole: "curriculum", kind: "mention", title: `${p.name} commented on a curriculum version`, detail: text.slice(0, 80), link: `/curriculum/${curId}`, source: "Curriculum" });
}

export function decideVersion(curId: string, verId: string, approve: boolean, note?: string) {
  const p = me();
  S().update((d) => {
    const v = d.curricula.find((c) => c.id === curId)!.versions.find((x) => x.id === verId)!;
    v.status = approve ? "approved" : "draft";
    if (approve) { v.approvedBy = p.staffId; v.approvedAt = nowIso(); }
    if (note) v.comments.push({ id: uid("c"), authorId: p.staffId ?? p.id, text: (approve ? "Approved: " : "Changes requested: ") + note, at: nowIso() });
    d.inbox.forEach((i) => { if (i.kind === "review" && i.link === `/curriculum/${curId}` && i.toRole === p.role) i.status = "done"; });
  });
  const title = S().data.curricula.find((c) => c.id === curId)!.title;
  S().addInbox({ toRole: "curriculum", kind: approve ? "task" : "alert", title: approve ? `Ready to publish: ${title}` : `Changes requested: ${title}`, detail: `${approve ? "Approved" : "Returned"} by ${p.name}`, link: `/curriculum/${curId}`, source: "Curriculum", priority: approve ? "high" : "normal" });
  toast({ tone: approve ? "success" : "warning", title: approve ? "Version approved" : "Changes requested", body: approve ? "Publish is now available to the Curriculum Manager." : "The version is back in draft." });
}

/** Publish an approved version. FB collections go to the Student Portal, TF curricula to the TF Portal; running cohorts are pinned to the new snapshot. */
export function publishVersion(curId: string, verId: string) {
  const cur = S().data.curricula.find((c) => c.id === curId)!;
  const env: "FB" | "TF" | null = cur.collection === "FB" ? "FB" : cur.audience.startsWith("Teaching Fellows") ? "TF" : null;
  const at = nowIso();
  S().update((d) => {
    const c = d.curricula.find((x) => x.id === curId)!;
    c.versions.forEach((v) => { if (v.id === verId) { v.status = "published"; v.publishedAt = at; } });
    if (!env) return;
    const existing = d.courses.find((x) => x.curriculumId === curId);
    if (existing) { existing.versionId = verId; existing.publishedAt = at; }
    else d.courses.push({ id: `crs-${curId.replace("cur-", "")}`, env, curriculumId: curId, versionId: verId, title: c.title, pathway: c.pathway, cohortIds: [env === "FB" ? "fbc-2" : "tfc-2"], publishedAt: at });
    d.inbox.forEach((i) => { if (i.link === `/curriculum/${curId}` && i.toRole === "curriculum" && i.status === "open") i.status = "done"; });
  });
  const ver = cur.versions.find((v) => v.id === verId)!;
  if (env === "FB") {
    const targets = S().data.students.filter((s) => s.cohortId === "fbc-2" && (!cur.pathway || s.pathway === cur.pathway));
    if (targets.some((s) => s.id === "fbs-01")) S().notify({ toPersona: "p-student", text: `New course available: ${cur.title}`, link: "/student/learning", tone: "success" });
    S().notify({ toRole: "fb_pm", text: `${cur.title} ${ver.label} published to the Student Portal (${targets.length} students)`, link: "/learning", tone: "success" });
  } else if (env === "TF") {
    S().notify({ toPersona: "p-tf", text: `Training course updated: ${cur.title} ${ver.label}`, link: "/tf/training", tone: "info" });
  }
  S().logActivity({ actor: actorName(), text: `published ${cur.title} ${ver.label}${env ? ` to the ${env === "FB" ? "Student" : "TF"} Portal` : " as classroom materials"}`, area: "Curriculum" });
  toast({ tone: "success", title: `${cur.title} ${ver.label} published`, body: env ? `Now live in the ${env === "FB" ? "Future Builders Student Portal" : "TF Learning Portal"}.` : "Available to SU class teachers as classroom materials." });
}

export function createDraft(curId: string) {
  let label = "";
  S().update((d) => {
    const c = d.curricula.find((x) => x.id === curId)!;
    const latest = c.versions[c.versions.length - 1];
    const [maj, min] = latest.label.replace("v", "").split(".").map(Number);
    label = `v${maj}.${min + 1}`;
    c.versions.push({ id: uid(`${curId}-v`), label, status: "draft", modules: JSON.parse(JSON.stringify(latest.modules)), changeLog: "", createdAt: DEMO_TODAY, reviewerIds: [], comments: [] });
  });
  toast({ tone: "success", title: `Draft ${label} created`, body: "Copied from the latest version. Published cohorts are unaffected." });
}

export function addLesson(curId: string, verId: string, moduleId: string, lesson: { title: string; minutes: number; objectiveIds: string[]; aiDrafted?: boolean; plan?: { objectives: string; activities: string[]; materials: string; differentiation: string; assessment: string } }) {
  S().update((d) => {
    const m = d.curricula.find((c) => c.id === curId)!.versions.find((v) => v.id === verId)!.modules.find((x) => x.id === moduleId)!;
    m.lessons.push({ id: uid("les"), ...lesson });
  });
  toast({ tone: lesson.aiDrafted ? "ai" : "success", title: "Lesson added", body: lesson.aiDrafted ? "AI draft added. Review it before sending for review." : lesson.title });
}

export function updateChangeLog(curId: string, verId: string, text: string) {
  S().update((d) => { d.curricula.find((c) => c.id === curId)!.versions.find((v) => v.id === verId)!.changeLog = text; });
}
