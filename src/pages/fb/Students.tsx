import { EyeOff } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/misc";
import { Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable } from "@/components/data/DataTable";
import { MiniTable } from "@/pages/staff/home/widgets";
import { access } from "@/config/access";
import { useData, usePersona } from "@/store/hooks";
import { attendeeRate } from "@/lib/metrics";
import { PATHWAY_LABEL } from "@/data/seed/fb";

export default function Students() {
  const d = useData();
  const persona = usePersona();
  const regs = d.registers.filter((r) => r.kind === "fb");
  const agg = access(persona, "fb") === "aggregate";
  if (agg) {
    return (
      <Workspace area="fb" title="Students" description="Your role sees aggregated, de-identified figures only.">
        <Card><CardHeader icon={<EyeOff />} title="Aggregated view" subtitle="Individual student records are not available to your role" /><CardBody>
          <MiniTable head={["Cohort", "Pathway", "Students", "Average readiness"]} rows={d.fbCohorts.flatMap((c) => (["ai", "web", "ent"] as const).map((p) => { const st = d.students.filter((s) => s.cohortId === c.id && s.pathway === p); return st.length ? [c.name, PATHWAY_LABEL[p], st.length, `${Math.round(st.reduce((a, s) => a + s.readiness, 0) / st.length)}%`] : null; }).filter(Boolean) as React.ReactNode[][])} />
        </CardBody></Card>
      </Workspace>
    );
  }
  const scoped = persona.scope.fbCohortIds;
  return (
    <Workspace area="fb" title="Students" description="Every student’s 360° profile: progress, attendance, projects, portfolio, consent and mentoring.">
      <DataTable rows={d.students.filter((s) => !scoped || scoped.includes(s.cohortId))} rowLink={(s) => `/future-builders/students/${s.id}`} search={(s) => s.name}
        filters={[{ key: "c", label: "Cohort", options: d.fbCohorts.map((c) => c.name), get: (s) => d.fbCohorts.find((c) => c.id === s.cohortId)!.name }, { key: "p", label: "Pathway", options: Object.values(PATHWAY_LABEL), get: (s) => PATHWAY_LABEL[s.pathway] }, { key: "s", label: "Status", options: ["Active", "Pending consent", "Graduated"], get: (s) => s.status }]}
        columns={[
          { key: "n", header: "Student", sort: (s) => s.name, cell: (s) => <span><span className="block font-medium">{s.name}</span><span className="text-[12px] text-muted">Age {s.age}</span></span> },
          { key: "p", header: "Pathway", cell: (s) => PATHWAY_LABEL[s.pathway] },
          { key: "t", header: "Team", cell: (s) => <span className="text-muted">{d.teams.find((t) => t.id === s.teamId)?.name ?? "—"}</span>, hideOnMobile: true },
          { key: "a", header: "Attendance", sort: (s) => attendeeRate(regs, s.id), cell: (s) => s.status === "Active" ? <span className="flex items-center gap-2"><span className="w-12 tabular">{attendeeRate(regs, s.id)}%</span><Progress value={attendeeRate(regs, s.id)} className="w-14" tone={attendeeRate(regs, s.id) < 75 ? "danger" : "brand"} /></span> : "—" },
          { key: "r", header: "Readiness", sort: (s) => s.readiness, cell: (s) => <span className="tabular">{s.readiness}%</span>, hideOnMobile: true },
          { key: "s", header: "Status", cell: (s) => <StatusBadge status={s.status} /> },
        ]} />
    </Workspace>
  );
}
