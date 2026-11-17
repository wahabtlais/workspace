import { useState } from "react";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { STATUS_STYLE } from "@/components/attendance/labels";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useDemo, nowIso } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { attendeeRate, TF_ATTENDANCE_THRESHOLD } from "@/lib/metrics";
import { DEMO_TODAY, formatDate, relativeDay } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function useTF() {
  const d = useData();
  const p = usePersona();
  return d.tfs.find((t) => t.id === p.scope.tfId)!;
}

export function MyTraining() {
  const d = useData();
  const L = useLookup();
  const tf = useTF();
  const course = d.courses.find((c) => c.env === "TF")!;
  const v = d.curricula.find((c) => c.id === course.curriculumId)!.versions.find((x) => x.id === course.versionId)!;
  const done = d.progress.find((x) => x.learnerId === tf.id)?.completedLessonIds ?? [];
  const total = v.modules.reduce((a, m) => a + m.lessons.length, 0);
  const upcoming = d.trainingSessions.filter((s) => s.date >= DEMO_TODAY).slice(0, 4);
  if (tf.cohortId !== "tfc-2") return <Card className="p-6 text-[14px]">You completed training in {d.tfCohorts.find((c) => c.id === tf.cohortId)?.name}. Refresher resources are in Resources.</Card>;
  return (
    <div className="space-y-4">
      <div><h1 className="text-[24px] font-semibold">{course.title}</h1><p className="text-[13px] text-muted">Version {v.label} · {done.length}/{total} lessons</p><Progress value={(done.length / total) * 100} className="mt-2 max-w-md" tone="success" /></div>
      <Card><CardHeader title="Upcoming sessions" /><CardBody className="space-y-2">{upcoming.map((s) => <div key={s.id} className="flex items-center justify-between rounded-lg border border-line p-3"><span><span className="block font-medium">{s.title}</span><span className="text-[12px] text-muted">{s.module} · {s.venue} · {L.person(s.trainerId)}</span></span><span className="text-[12px] font-medium">{relativeDay(s.date)} · {s.time}</span></div>)}</CardBody></Card>
      {v.modules.map((m) => <Card key={m.id}><CardHeader title={m.title} /><ul className="divide-y divide-line border-t border-line">{m.lessons.map((l) => <li key={l.id} className="flex items-center gap-3 px-5 py-2.5 text-[14px]">{done.includes(l.id) ? <CheckCircle2 className="size-4 text-emerald-600" /> : <span className="size-4 rounded-full border border-line-strong" />}{l.title}</li>)}</ul></Card>)}
    </div>
  );
}

export function MyTrainingAttendance() {
  const d = useData();
  const tf = useTF();
  const regs = d.registers.filter((r) => r.kind === "tf" && r.attendeeIds.includes(tf.id)).sort((a, b) => a.date.localeCompare(b.date));
  const rate = attendeeRate(regs, tf.id);
  const label = { P: "Present", A: "Absent", L: "Late", E: "Excused" } as const;
  return (
    <div className="space-y-4">
      <h1 className="text-[24px] font-semibold">My training attendance</h1>
      <Card className="p-4"><p className="text-[13px] text-muted">Attendance counts toward certification (minimum {TF_ATTENDANCE_THRESHOLD}%).</p><p className="mt-1 text-[28px] font-semibold tabular">{regs.length ? `${rate}%` : "—"}</p><Progress value={rate} className="mt-2" tone={rate < TF_ATTENDANCE_THRESHOLD ? "danger" : "success"} />{rate < TF_ATTENDANCE_THRESHOLD && regs.length > 0 && <p className="mt-2 text-[13px] text-red-700">You are below the threshold. Talk to your trainer about catch-up sessions.</p>}</Card>
      <Card><CardBody className="pt-4"><MiniTable empty="No training sessions recorded" head={["Date", "Session", "Mark"]} rows={regs.map((r) => { const m = r.marks[r.attendeeIds.indexOf(tf.id)]; return [formatDate(r.date), d.trainingSessions.find((s) => s.id === r.contextId)?.title, m ? <span className="inline-flex items-center gap-1.5"><span className={cn("size-2.5 rounded-full", STATUS_STYLE[m].dot)} />{label[m]}</span> : "—"]; })} /></CardBody></Card>
    </div>
  );
}

const QS = [
  { q: "Which routine helps most when pupils collect tablets?", a: ["Everyone collects at once", "Numbered rotation stations", "Teacher hands out silently"], c: 1 },
  { q: "A loop in block-based coding is used to…", a: ["Repeat instructions", "Store a number", "End the program"], c: 0 },
  { q: "A good exit ticket checks…", a: ["Attendance", "The lesson objective", "Homework completion"], c: 1 },
];

export function TFAssessments() {
  const d = useData();
  const tf = useTF();
  const update = useDemo((s) => s.update);
  const session = d.assessmentSessions.find((s) => s.id === "as-tf-mid");
  const entry = session?.entries.find((e) => e.subjectId === tf.id);
  const [ans, setAns] = useState<Record<number, number>>({});
  const offline = useDemo((s) => s.offline);
  const submit = () => {
    const score = Math.round((QS.filter((q, i) => ans[i] === q.c).length / QS.length) * 100);
    update((x) => { const e = x.assessmentSessions.find((s) => s.id === "as-tf-mid")!.entries.find((y) => y.subjectId === tf.id)!; e.status = offline ? "pending_sync" : "submitted"; e.score = score; e.submittedAt = nowIso(); e.device = "Personal laptop"; });
    if (offline) useDemo.getState().enqueue({ kind: "assessment", label: "TF checkpoint", refId: `as-tf-mid::${tf.id}` });
    toast(offline ? { tone: "warning", title: "Saved on your device", body: "Your answers will be sent when you reconnect." } : { tone: "success", title: `Submitted · ${score}%`, body: "Your trainer’s live tracker updated." });
  };
  return (
    <div className="space-y-4">
      <h1 className="text-[24px] font-semibold">Assessments</h1>
      {session && entry && tf.cohortId === "tfc-2" && (
        <Card><CardHeader icon={<ClipboardCheck />} title="Mid-training checkpoint" subtitle="Short version for the prototype · auto-scored" action={entry.status === "submitted" || entry.status === "pending_sync" ? <Badge tone={entry.status === "submitted" ? "success" : "warning"}>{entry.status === "submitted" ? `Submitted · ${entry.score}%` : "Waiting to sync"}</Badge> : <Badge tone="info">Open today</Badge>} />
          {(entry.status === "not_started" || entry.status === "in_progress" || entry.status === "failed") && <CardBody className="space-y-4">
            {QS.map((q, i) => <div key={i}><p className="text-[14px] font-medium">{i + 1}. {q.q}</p><div className="mt-2 grid gap-2 sm:grid-cols-3">{q.a.map((a, j) => <button key={a} onClick={() => setAns((x) => ({ ...x, [i]: j }))} className={cn("rounded-lg border px-3 py-2 text-left text-[13px]", ans[i] === j ? "border-su bg-su-50 font-medium text-su" : "border-line")}>{a}</button>)}</div></div>)}
            <Button disabled={Object.keys(ans).length < QS.length} onClick={submit}>Submit checkpoint</Button>
          </CardBody>}
        </Card>
      )}
      <Card><CardHeader title="History" /><CardBody><MiniTable head={["Assessment", "Date", "Score"]} rows={d.assessmentSessions.filter((s) => s.audience === "tf").map((s) => [s.title, formatDate(s.date), s.entries.find((e) => e.subjectId === tf.id)?.score !== undefined ? `${s.entries.find((e) => e.subjectId === tf.id)!.score}%` : s.status === "Scheduled" ? "Scheduled" : "—"])} /></CardBody></Card>
    </div>
  );
}
