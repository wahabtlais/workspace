import { GraduationCap } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workspace } from "@/components/common/Workspace";
import { StatTile } from "@/components/common/StatTile";
import { DataTable } from "@/components/data/DataTable";
import { AIAction } from "@/components/shell/AskPanel";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useData } from "@/store/hooks";
import { attendanceRate } from "@/lib/metrics";
import { PATHWAY_LABEL } from "@/data/seed/fb";
import { useLiveIndicators } from "@/lib/indicators";

export function Graduation() {
  const d = useData();
  const grads = d.students.filter((s) => s.status === "Graduated");
  return (
    <Workspace area="fb" title="Graduation & alumni" description="Completion criteria, certificates, alumni directory and follow-up surveys.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Graduates 2025–26" value={grads.length} icon={<GraduationCap />} />
        <StatTile label="In education, training or work" value="79%" sub="6-month follow-up survey" tone="success" />
        <StatTile label="Completed internships" value={d.placements.filter((p) => p.stage === "Completed").length} />
      </div>
      <Card><CardHeader title="Completion criteria (2026–27)" subtitle="Checked automatically before graduation" /><CardBody className="flex flex-wrap gap-2">{["Attendance ≥ 80%", "Pathway course completed", "Team project delivered", "Portfolio with 3+ items", "Career readiness ≥ 60%"].map((c) => <Badge key={c} tone="outline">{c}</Badge>)}</CardBody></Card>
      <DataTable rows={grads} title="Alumni directory" search={(s) => s.name} columns={[{ key: "n", header: "Name", cell: (s) => <span className="font-medium">{s.name}</span> }, { key: "p", header: "Pathway", cell: (s) => PATHWAY_LABEL[s.pathway] }, { key: "c", header: "Cohort", cell: () => "2025–26" }, { key: "f", header: "Follow-up", cell: (s) => <Badge tone={s.readiness > 85 ? "success" : "neutral"}>{s.readiness > 85 ? "Employed / studying" : "Survey sent"}</Badge> }]} />
    </Workspace>
  );
}

export function FBReports() {
  const d = useData();
  const inds = useLiveIndicators();
  const regs = d.registers.filter((r) => r.kind === "fb");
  const cell = (ids: string[], t: string) => { const r = regs.filter((x) => d.fbSessions.find((s) => s.id === x.contextId)?.type === t && x.attendeeIds.some((a) => ids.includes(a))); return r.length ? `${attendanceRate(r)}%` : "—"; };
  return (
    <Workspace area="fb" title="Future Builders reports" description="By student, cohort, activity type and period." aiActions={<AIAction label="Draft program report" prompt="Draft the Future Builders monthly report" />}>
      <Card><CardHeader title="Attendance by pathway and activity" /><CardBody>
        <MiniTable head={["Pathway", "Learning sessions", "Workshops", "Student meetings", "Mentor meetings"]} rows={(["ai", "web", "ent"] as const).map((p) => { const ids = d.students.filter((s) => s.pathway === p).map((s) => s.id); return [PATHWAY_LABEL[p], cell(ids, "Learning session"), cell(ids, "Workshop"), cell(ids, "Student meeting"), cell(ids, "Mentor meeting")]; })} />
      </CardBody></Card>
      <Card><CardHeader title="Indicators" /><CardBody><MiniTable head={["Code", "Indicator", "Latest", "Target"]} rows={inds.filter((i) => i.program === "FB").map((i) => [i.code, i.name, i.illustrative ? `${i.current} (illustrative)` : i.current, i.target])} /></CardBody></Card>
    </Workspace>
  );
}
