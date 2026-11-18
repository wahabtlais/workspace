import { Link } from "react-router";
import { Award, CalendarCheck, CheckCircle2, Circle, ClipboardCheck, Eye, School } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { StatTile } from "@/components/common/StatTile";
import { useData, usePersona } from "@/store/hooks";
import { attendeeRate, TF_ATTENDANCE_THRESHOLD } from "@/lib/metrics";
import { DEMO_TODAY, formatDate, relativeDay } from "@/lib/utils";
import { TodayClasses } from "./TeacherToday";

function Criterion({ ok, label, detail }: { ok: boolean | null; label: string; detail: string }) {
  return (
    <li className="flex items-start gap-3 py-2">
      {ok ? <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" /> : <Circle className={ok === false ? "mt-0.5 size-5 text-red-500" : "mt-0.5 size-5 text-line-strong"} />}
      <span><span className="block text-[14px] font-medium">{label}</span><span className="text-[12px] text-muted">{detail}</span></span>
    </li>
  );
}

function InTraining() {
  const d = useData();
  const p = usePersona();
  const tf = d.tfs.find((t) => t.id === p.scope.tfId)!;
  const regs = d.registers.filter((r) => r.kind === "tf");
  const rate = attendeeRate(regs, tf.id);
  const course = d.courses.find((c) => c.env === "TF")!;
  const version = d.curricula.find((c) => c.id === course.curriculumId)!.versions.find((v) => v.id === course.versionId)!;
  const lessons = version.modules.flatMap((m) => m.lessons);
  const done = d.progress.find((x) => x.learnerId === tf.id && x.courseId === course.id)?.completedLessonIds.length ?? 0;
  const next = d.trainingSessions.find((s) => s.date >= DEMO_TODAY);
  const mid = d.assessmentSessions.find((s) => s.id === "as-tf-mid")?.entries.find((e) => e.subjectId === tf.id);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px] font-semibold">Welcome back, {tf.name.split(" ")[0]}</h1>
        <p className="mt-1 text-[14px] text-muted">{d.tfCohorts.find((c) => c.id === tf.cohortId)?.name} · training ends {formatDate("2026-12-17", { day: "numeric", month: "long" })}</p>
      </div>
      {mid && mid.status !== "submitted" && (
        <div className="flex flex-col gap-3 rounded-xl border border-su/30 bg-su-50 p-4 sm:flex-row sm:items-center">
          <ClipboardCheck className="size-6 text-su" />
          <div className="flex-1"><p className="font-semibold">Mid-training checkpoint is open</p><p className="text-[13px] text-muted">15 questions · about 20 minutes · closes today at 17:00</p></div>
          <Button asChild><Link to="/tf/assessments">Start checkpoint</Link></Button>
        </div>
      )}
      {tf.certifiedAt && (
        <Link to="/tf/certificate" className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <Award className="size-6 text-emerald-700" /><span className="flex-1"><span className="block font-semibold">You are a certified Teaching Fellow</span><span className="text-[13px] text-muted">Certified {formatDate(tf.certifiedAt, { day: "numeric", month: "long" })} · view your certificate · deployment comes next</span></span>
        </Link>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Course progress" value={`${done}/${lessons.length}`} sub="lessons completed" progress={(done / lessons.length) * 100} to="/tf/training" />
        <StatTile label="Training attendance" value={`${rate}%`} target={`${TF_ATTENDANCE_THRESHOLD}%`} progress={rate} tone={rate < TF_ATTENDANCE_THRESHOLD ? "danger" : "success"} to="/tf/attendance" />
        <StatTile label="Next session" value={next ? relativeDay(next.date) : "—"} sub={next ? `${next.title} · ${next.time}` : undefined} icon={<CalendarCheck />} />
      </div>
      <Card>
        <CardHeader icon={<Award />} title="Your path to certification" subtitle="Criteria are checked automatically; the Project Manager approves the final decision." />
        <CardBody>
          <ul className="divide-y divide-line">
            <Criterion ok={true} label="Pre-training baseline completed" detail={`Score ${tf.preScore}%`} />
            <Criterion ok={rate >= TF_ATTENDANCE_THRESHOLD} label={`Training attendance at least ${TF_ATTENDANCE_THRESHOLD}%`} detail={`Currently ${rate}%`} />
            <Criterion ok={null} label="Post-training assessment passed" detail="Scheduled for 15 December" />
            <Criterion ok={null} label="Practicum observation" detail="During Module 5" />
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

function Deployed() {
  const d = useData();
  const p = usePersona();
  const tf = d.tfs.find((t) => t.id === p.scope.tfId)!;
  const school = d.schools.find((s) => s.id === tf.schoolId);
  const obs = d.visits.filter((v) => v.tfId === tf.id && v.score !== undefined).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-su-50 text-su"><School className="size-5" /></span>
          <div className="flex-1"><p className="font-semibold">Deployed to {school?.name}</p><p className="text-[13px] text-muted">{school?.region} · certified {formatDate(tf.certifiedAt ?? "2025-12-22", { day: "numeric", month: "short", year: "numeric" })}</p></div>
          <Badge tone="success" dot>Certified Teaching Fellow</Badge>
        </div>
      </Card>
      {d.classes.some((c) => c.teacherId === tf.id) ? <TodayClasses basePath="/tf" showLang /> : <Card className="p-5 text-[14px] text-muted">Your Project Officer will assign your classes and timetable at {school?.name}. They will appear here, with registers and pupil assessments.</Card>}
      <Card>
        <CardHeader icon={<Eye />} title="Observation feedback" subtitle="From your Project Officer’s classroom visits" />
        <CardBody className="space-y-2">
          {obs.slice(0, 3).map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2 text-[13px]">
              <span>{formatDate(v.date, { day: "numeric", month: "long" })} · {v.purpose}</span>
              <span className="flex items-center gap-2"><Progress value={((v.score ?? 0) / 4) * 100} className="w-20" /><span className="tabular font-medium">{v.score} / 4</span></span>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

export default function TFHome() {
  const p = usePersona();
  const tf = useData().tfs.find((t) => t.id === p.scope.tfId);
  return tf?.stage === "Deployed" ? <Deployed /> : <InTraining />;
}
