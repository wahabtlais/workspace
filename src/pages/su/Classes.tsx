import { useParams } from "react-router";
import { Lock } from "lucide-react";
import { Workspace, KeyValue } from "@/components/common/Workspace";
import { DataTable } from "@/components/data/DataTable";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { StatTile } from "@/components/common/StatTile";
import { ClassHistory } from "@/components/classes/ClassHistory";
import { pupilAttendanceAccess } from "@/config/access";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { attendanceRate, registerCompletion } from "@/lib/metrics";
import { DEMO_TODAY } from "@/lib/utils";
import { ClassLearningProfile } from "./ClassLearningProfile";
import { weekday } from "@/data/seed/su";

const DAYS = ["", "Mon", "Tue", "Wed", "Thu", "Fri"];

export function ClassesList() {
  const d = useData();
  const L = useLookup();
  const acc = pupilAttendanceAccess(usePersona());
  const rows = d.classes.map((c) => {
    const regs = d.registers.filter((r) => r.kind === "pupil" && r.contextId === c.id);
    const today = c.days.includes(weekday(DEMO_TODAY));
    const todayReg = regs.find((r) => r.date === DEMO_TODAY);
    return { c, school: L.schools.get(c.schoolId)!.name, rate: attendanceRate(regs), comp: registerCompletion(regs), today, todayDone: !!todayReg && todayReg.status !== "missing" };
  });
  return (
    <Workspace area="su" title="Classes & rosters" description="Classes taught with CodeBrave in partner schools. Pupils are records only: they have no accounts. Rosters and registers need the pupil-data grant.">
      {acc.level !== "individual" && <p className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-4 py-2.5 text-[13px] text-muted"><Lock className="size-4" /> {acc.level === "none" ? "You can see classes but not pupil attendance." : "You see class-level summaries. Individual pupil rows are hidden."}</p>}
      <DataTable rows={rows} search={(r) => `${r.school} grade ${r.c.grade} ${r.c.section} ${L.person(r.c.teacherId)}`} rowLink={(r) => `/school-upskilling/classes/${r.c.id}`}
        filters={[{ key: "school", label: "School", options: [...new Set(rows.map((r) => r.school))], get: (r) => r.school }, { key: "grade", label: "Grade", options: ["5", "6", "7", "8"], get: (r) => String(r.c.grade) }, { key: "t", label: "Teacher type", options: ["Teaching Fellow", "School teacher"], get: (r) => (r.c.teacherType === "tf" ? "Teaching Fellow" : "School teacher") }]}
        columns={[
          { key: "class", header: "Class", sort: (r) => r.school + r.c.grade + r.c.section, cell: (r) => <span><span className="block font-medium">Grade {r.c.grade}-{r.c.section}</span><span className="text-[12px] text-muted">{r.school}</span></span> },
          { key: "teacher", header: "Class teacher", cell: (r) => <span>{L.person(r.c.teacherId)}<span className="block text-[11px] text-subtle">{r.c.teacherType === "tf" ? "Teaching Fellow" : "School teacher"}</span></span>, hideOnMobile: true },
          { key: "tt", header: "Timetable", cell: (r) => <span className="text-muted">{r.c.days.map((x) => DAYS[x]).join(" & ")}</span>, hideOnMobile: true },
          { key: "pupils", header: "Pupils", sort: (r) => r.c.pupilIds.length, cell: (r) => <span className="tabular">{r.c.pupilIds.length}</span> },
          ...(acc.level !== "none" ? [
            { key: "att", header: "Attendance", sort: (r: (typeof rows)[number]) => r.rate, cell: (r: (typeof rows)[number]) => <span className="flex items-center gap-2"><span className="w-12 tabular">{r.rate}%</span><Progress value={r.rate} className="w-14" tone={r.rate < 80 ? "warning" : "brand"} /></span> },
            { key: "miss", header: "Missing registers", sort: (r: (typeof rows)[number]) => r.comp.due - r.comp.done, cell: (r: (typeof rows)[number]) => r.comp.due - r.comp.done ? <Badge tone="danger">{r.comp.due - r.comp.done}</Badge> : <Badge tone="success">0</Badge> },
          ] : []),
          { key: "today", header: "Today", cell: (r) => !r.today ? <span className="text-subtle">No class</span> : r.todayDone ? <Badge tone="success" dot>Register in</Badge> : <Badge tone="warning" dot>Register due</Badge> },
        ]} />
    </Workspace>
  );
}

export function ClassDetail() {
  const { id } = useParams();
  const d = useData();
  const L = useLookup();
  const persona = usePersona();
  const acc = pupilAttendanceAccess(persona);
  const c = d.classes.find((x) => x.id === id);
  if (!c) return <Workspace area="su" title="Class not found"><p>Unknown class.</p></Workspace>;
  const school = L.schools.get(c.schoolId)!;
  const regs = d.registers.filter((r) => r.kind === "pupil" && r.contextId === c.id);
  const comp = registerCompletion(regs);
  return (
    <Workspace area="su" hideSubnav title={`Grade ${c.grade}-${c.section}`} description={`${school.name} · ${c.subject}`}
      crumbs={[{ label: "School Upskilling", to: "/school-upskilling" }, { label: "Classes & rosters", to: "/school-upskilling/classes" }, { label: `${school.name.split(" ")[0]} ${c.grade}-${c.section}` }]}>
      <Card><CardBody className="pt-5"><KeyValue cols={4} items={[["Class teacher", L.person(c.teacherId)], ["Teacher type", c.teacherType === "tf" ? "Teaching Fellow" : "School-employed teacher"], ["Timetable", `${c.days.map((x) => DAYS[x]).join(" & ")} · ${c.period}`], ["Pupils", c.pupilIds.length]]} /></CardBody></Card>
      <ClassLearningProfile cls={c} />
      {acc.level === "none" ? (
        <Card className="p-8 text-center"><Lock className="mx-auto size-6 text-muted" /><p className="mt-3 font-semibold">Pupil registers are restricted</p><p className="mx-auto mt-1 max-w-md text-[13px] text-muted">{acc.reason}</p></Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile label="Attendance this term" value={`${attendanceRate(regs)}%`} progress={attendanceRate(regs)} />
            <StatTile label="Registers submitted" value={`${comp.done}/${comp.due}`} progress={comp.rate} tone={comp.rate < 95 ? "warning" : "success"} />
            <StatTile label="Corrections" value={regs.reduce((a, r) => a + r.corrections.length, 0)} sub={`${regs.reduce((a, r) => a + r.corrections.filter((x) => x.status === "pending").length, 0)} pending`} />
          </div>
          {acc.level === "individual" ? <ClassHistory cls={c} canApprove={persona.role === "su_po"} /> : <p className="text-[13px] text-muted">Individual registers are visible to the class teacher and assigned Project Officers with the pupil-data grant.</p>}
        </>
      )}
    </Workspace>
  );
}
