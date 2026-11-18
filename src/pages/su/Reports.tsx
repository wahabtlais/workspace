import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/misc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { Workspace } from "@/components/common/Workspace";
import { AIAction } from "@/components/shell/AskPanel";
import { AnnualResults } from "@/components/reports/AnnualResults";
import { MiniTable } from "@/pages/staff/home/widgets";
import { pupilAttendanceAccess } from "@/config/access";
import { useData, usePersona } from "@/store/hooks";
import { attendanceRate, attendeeRate, registerCompletion, TF_ATTENDANCE_THRESHOLD } from "@/lib/metrics";

export default function SUReports() {
  const d = useData();
  const persona = usePersona();
  const acc = pupilAttendanceAccess(persona);
  const pupilRegs = d.registers.filter((r) => r.kind === "pupil");
  const tfRegs = d.registers.filter((r) => r.kind === "tf");
  const cohort = d.tfs.filter((t) => t.cohortId === "tfc-2");
  return (
    <Workspace area="su" title="School Upskilling reports" description="Program results, pupil attendance and TF training attendance. Pupil figures are aggregated by default."
      aiActions={<AIAction label="Draft program report" prompt="Draft the School Upskilling monthly report" />}>
      <Tabs defaultValue="annual">
        <TabsList><TabsTrigger value="annual">Annual pre/post results</TabsTrigger><TabsTrigger value="pupil">Pupil attendance</TabsTrigger><TabsTrigger value="tf">TF attendance</TabsTrigger></TabsList>
        <TabsContent value="annual" className="mt-4"><AnnualResults /></TabsContent>
        <TabsContent value="pupil" className="mt-4">
          {acc.level === "none" ? <Card className="p-6 text-[13px] text-muted">{acc.reason}</Card> : (
            <Card>
              <CardHeader title="Pupil classroom attendance by school and grade" subtitle={`Overall ${attendanceRate(pupilRegs)}% · register completion ${registerCompletion(pupilRegs).rate}% · aggregated, no pupil names`} />
              <CardBody>
                <MiniTable head={["School", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "All", "Registers"]} rows={d.schools.filter((s) => s.status === "Active").map((s) => {
                  const cell = (g: number) => { const ids = d.classes.filter((c) => c.schoolId === s.id && c.grade === g).map((c) => c.id); return ids.length ? `${attendanceRate(pupilRegs.filter((r) => ids.includes(r.contextId)))}%` : "—"; };
                  const all = pupilRegs.filter((r) => d.classes.some((c) => c.id === r.contextId && c.schoolId === s.id));
                  return [<span className="font-medium">{s.name}</span>, cell(5), cell(6), cell(7), cell(8), <b>{attendanceRate(all)}%</b>, `${registerCompletion(all).rate}%`];
                })} />
              </CardBody>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="tf" className="mt-4">
          <Card>
            <CardHeader title="TF Cohort 2026–27 training attendance" subtitle={`Certification threshold ${TF_ATTENDANCE_THRESHOLD}% · cohort average ${attendanceRate(tfRegs)}%`} />
            <CardBody>
              <MiniTable head={["Teaching Fellow", "Attendance", "Status"]} rows={cohort.map((t) => { const r = attendeeRate(tfRegs, t.id); return [t.name, <span className="flex items-center gap-2"><Progress value={r} className="w-24" tone={r < TF_ATTENDANCE_THRESHOLD ? "danger" : "success"} /><span className="tabular">{r}%</span></span>, r < TF_ATTENDANCE_THRESHOLD ? "Below threshold" : "On track"]; })} />
            </CardBody>
          </Card>
        </TabsContent>
      </Tabs>
    </Workspace>
  );
}
