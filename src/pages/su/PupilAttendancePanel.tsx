import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EyeOff, Lock, ShieldCheck } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { MiniTable } from "@/pages/staff/home/widgets";
import { pupilAttendanceAccess } from "@/config/access";
import { useData, usePersona } from "@/store/hooks";
import { attendanceRate, attendeeRate, registerCompletion } from "@/lib/metrics";
import { pupilName } from "@/lib/names";
import { addDays, formatDate } from "@/lib/utils";
import { TERM_START } from "@/data/seed/su";

/** Restricted pupil classroom attendance for one school; detail depends on the viewer’s grant. */
export function PupilAttendancePanel({ schoolId }: { schoolId: string }) {
  const d = useData();
  const persona = usePersona();
  const acc = pupilAttendanceAccess(persona);
  const classes = d.classes.filter((c) => c.schoolId === schoolId);
  const regs = d.registers.filter((r) => r.kind === "pupil" && classes.some((c) => c.id === r.contextId));

  if (acc.level === "none") {
    return (
      <Card className="p-8 text-center">
        <Lock className="mx-auto size-6 text-muted" />
        <p className="mt-3 font-semibold">Pupil attendance is restricted</p>
        <p className="mx-auto mt-1 max-w-md text-[13px] text-muted">{acc.reason}</p>
      </Card>
    );
  }

  const weeks = Array.from({ length: 6 }, (_, w) => {
    const from = addDays(TERM_START, w * 7), to = addDays(from, 7);
    return { week: `Wk of ${formatDate(from)}`, rate: attendanceRate(regs.filter((r) => r.date >= from && r.date < to)) };
  });
  const comp = registerCompletion(regs);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-[13px]">
        <ShieldCheck className="size-4 text-su" /> <span className="font-medium">Your view: {acc.level === "individual" ? "Individual pupils (logged)" : acc.level === "summary" ? "Class summaries" : "Aggregated only"}</span>
        <span className="text-muted">· {acc.reason}</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Weekly attendance" subtitle="All classes at this school · present + late, excused excluded" />
          <CardBody>
            <div className="h-[200px]">
              <ResponsiveContainer>
                <LineChart data={weeks} margin={{ left: -16, right: 12, top: 8 }}>
                  <CartesianGrid vertical={false} stroke="#eef0f3" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [`${v}%`, "Attendance"]} />
                  <Line dataKey="rate" stroke="#0f8a7e" strokeWidth={2} dot={{ r: 4, fill: "#0f8a7e", stroke: "#fff", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Register completion" />
          <CardBody>
            <p className="text-[28px] font-semibold tabular">{comp.rate}%</p>
            <Progress value={comp.rate} className="mt-2" tone={comp.rate < 95 ? "warning" : "success"} />
            <p className="mt-2 text-[13px] text-muted">{comp.done} of {comp.due} scheduled registers submitted · {comp.due - comp.done} missing</p>
          </CardBody>
        </Card>
      </div>
      {acc.level !== "aggregate" ? (
        <Card>
          <CardHeader title="By class" />
          <CardBody>
            <MiniTable head={["Class", "Teacher", "Pupils", "Attendance", "Missing registers"]} rows={classes.map((c) => {
              const cr = regs.filter((r) => r.contextId === c.id);
              const rate = attendanceRate(cr);
              return [<span className="font-medium">Grade {c.grade}-{c.section}</span>, <span className="text-muted">{d.tfs.find((t) => t.id === c.teacherId)?.name ?? d.schoolTeachers.find((t) => t.id === c.teacherId)?.name}</span>, c.pupilIds.length,
                <span className="flex items-center gap-2"><span className="w-12 tabular">{rate}%</span><Progress value={rate} className="w-16" tone={rate < 80 ? "warning" : "brand"} /></span>, cr.filter((r) => r.status === "missing").length];
            })} />
          </CardBody>
        </Card>
      ) : <p className="flex items-center gap-1.5 text-[13px] text-muted"><EyeOff className="size-4" /> Class and pupil detail is hidden for your role.</p>}
      {acc.level === "individual" && (
        <Card>
          <CardHeader title="Pupils with lowest attendance" subtitle="Every view of individual pupil records is logged in the audit trail" action={<Badge tone="outline">pupil-data</Badge>} />
          <CardBody>
            <MiniTable head={["Pupil", "Code", "Class", "Attendance"]} rows={classes.flatMap((c) => c.pupilIds.map((pid) => ({ pid, c, rate: attendeeRate(regs, pid) }))).sort((a, b) => a.rate - b.rate).slice(0, 8).map(({ pid, c, rate }) => {
              const p = d.pupils.find((x) => x.id === pid)!;
              return [<span className="font-medium">{pupilName(p)}</span>, <span className="text-muted tabular">{p.code}</span>, `Grade ${c.grade}-${c.section}`, <span className="tabular">{rate}%</span>];
            })} />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
