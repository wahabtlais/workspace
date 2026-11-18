import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { RegisterSheet } from "@/components/attendance/RegisterSheet";
import { pupilAttendanceAccess } from "@/config/access";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { attendanceRate, attendeeRate, registerCompletion } from "@/lib/metrics";
import { weekday } from "@/data/seed/su";
import { DEMO_TODAY, formatDate } from "@/lib/utils";

export function mySchoolIds(d: ReturnType<typeof useData>, p: ReturnType<typeof usePersona>) {
  return p.scope.schoolIds ?? d.schools.filter((s) => s.trainerId === p.staffId).map((s) => s.id);
}

export function FieldSchools() {
  const d = useData();
  const p = usePersona();
  const [open, setOpen] = useState<string | null>(null);
  const ids = mySchoolIds(d, p);
  return (
    <>
      <h1 className="text-[22px] font-semibold">My schools</h1>
      {d.schools.filter((s) => ids.includes(s.id)).map((s) => {
        const cls = d.classes.filter((c) => c.schoolId === s.id);
        const regs = d.registers.filter((r) => r.kind === "pupil" && cls.some((c) => c.id === r.contextId));
        const last = d.visits.filter((v) => v.schoolId === s.id && v.status !== "Planned").sort((a, b) => b.date.localeCompare(a.date))[0];
        return (
          <Card key={s.id} className="p-4">
            <button className="w-full text-left" onClick={() => setOpen(open === s.id ? null : s.id)} aria-expanded={open === s.id}>
              <div className="flex items-center justify-between"><p className="font-semibold">{s.name}</p><Badge tone={s.status === "Active" ? "success" : "info"}>{s.status}</Badge></div>
              <p className="text-[12px] text-muted">{cls.length} classes · last visit {last ? formatDate(last.date) : "none"}</p>
            </button>
            {open === s.id && (
              <div className="mt-3 space-y-2 border-t border-line pt-3 text-[13px]">
                <p>Principal: {s.principal}</p>
                {regs.length > 0 && <div><p className="text-muted">Pupil attendance (term) · registers {registerCompletion(regs).rate}% complete</p><Progress value={attendanceRate(regs)} className="mt-1" /><p className="text-right text-[12px] tabular">{attendanceRate(regs)}%</p></div>}
                {cls.map((c) => { const today = d.registers.find((r) => r.contextId === c.id && r.date === DEMO_TODAY); return <p key={c.id} className="flex justify-between"><span>Grade {c.grade}-{c.section} · {c.pupilIds.length} pupils</span><span className="text-muted">{!c.days.includes(weekday(DEMO_TODAY)) ? "no class today" : today ? "register in" : "register due"}</span></p>; })}
              </div>
            )}
          </Card>
        );
      })}
    </>
  );
}

export function FieldAttendance() {
  const d = useData();
  const p = usePersona();
  const L = useLookup();
  if (p.role === "su_trainer") {
    const s = d.trainingSessions.find((x) => x.date === DEMO_TODAY);
    const regs = d.registers.filter((r) => r.kind === "tf");
    const cohort = d.tfs.filter((t) => t.cohortId === "tfc-2");
    return s ? <><h1 className="text-[22px] font-semibold">Training register</h1><p className="text-[13px] text-muted">{s.title} · {s.time}</p><RegisterSheet kind="tf" contextId={s.id} date={s.date} label={`TF training: ${s.title}`} attendees={cohort.map((t) => ({ id: t.id, name: t.name, sub: `${attendeeRate(regs, t.id)}% so far` }))} /></> : <Card className="p-5">No training session today.</Card>;
  }
  const ids = mySchoolIds(d, p);
  const acc = pupilAttendanceAccess(p);
  const today = d.classes.filter((c) => ids.includes(c.schoolId) && c.days.includes(weekday(DEMO_TODAY)));
  const missing = d.registers.filter((r) => r.kind === "pupil" && r.status === "missing" && d.classes.some((c) => c.id === r.contextId && ids.includes(c.schoolId)));
  return (
    <>
      <h1 className="text-[22px] font-semibold">Class registers</h1>
      <p className="text-[12px] text-muted">Class teachers record registers. You monitor them for your schools ({acc.level === "individual" ? "pupil-data grant" : "summaries only"}).</p>
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">Today</h2>
      {today.map((c) => { const r = d.registers.find((x) => x.contextId === c.id && x.date === DEMO_TODAY); return <Card key={c.id} className="flex items-center justify-between p-3 text-[14px]"><span>{L.schools.get(c.schoolId)?.name.split(" ")[0]} · Grade {c.grade}-{c.section}<span className="block text-[12px] text-muted">{L.person(c.teacherId)}</span></span>{r ? <Badge tone={r.status === "pending_sync" ? "warning" : "success"}>{r.status === "pending_sync" ? "Syncing" : "Submitted"}</Badge> : <Badge tone="warning">Due</Badge>}</Card>; })}
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">Missing registers ({missing.length})</h2>
      {missing.slice(0, 6).map((r) => { const c = d.classes.find((x) => x.id === r.contextId)!; return <Card key={r.id} className="flex justify-between p-3 text-[13px]"><span>{L.schools.get(c.schoolId)?.name.split(" ")[0]} · Grade {c.grade}-{c.section}</span><span className="text-muted">{formatDate(r.date)}</span></Card>; })}
    </>
  );
}
