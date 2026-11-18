import { Link } from "react-router";
import type { FollowUp } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/misc";
import { Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Board } from "@/components/data/Board";
import { DataTable } from "@/components/data/DataTable";
import { AIAction } from "@/components/shell/AskPanel";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData, useLookup } from "@/store/hooks";
import { attendanceRate } from "@/lib/metrics";
import { DEMO_TODAY, formatDate } from "@/lib/utils";

export function Trainers() {
  const d = useData();
  const trainers = d.staff.filter((s) => s.role === "su_trainer");
  const regs = d.registers.filter((r) => r.kind === "tf");
  return (
    <Workspace area="su" title="Trainers" description="Trainer profiles, assignments, sessions delivered and feedback.">
      <div className="grid gap-4 md:grid-cols-2">
        {trainers.map((t) => {
          const sessions = d.trainingSessions.filter((s) => s.trainerId === t.id);
          const delivered = sessions.filter((s) => s.date < DEMO_TODAY);
          const fb = d.trainerFeedback.filter((f) => f.trainerId === t.id);
          return (
            <Card key={t.id}>
              <CardHeader title={<span className="flex items-center gap-3"><Avatar name={t.name} />{t.name}</span>} subtitle={`${t.title} · since ${formatDate(t.startDate, { month: "short", year: "numeric" })}`} />
              <CardBody>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-canvas p-3"><p className="text-[20px] font-semibold tabular">{delivered.length}</p><p className="text-[11px] text-muted">sessions delivered</p></div>
                  <div className="rounded-lg bg-canvas p-3"><p className="text-[20px] font-semibold tabular">{attendanceRate(regs.filter((r) => delivered.some((s) => s.id === r.contextId)))}%</p><p className="text-[11px] text-muted">TF attendance</p></div>
                  <div className="rounded-lg bg-canvas p-3"><p className="text-[20px] font-semibold tabular">{d.schools.filter((s) => s.trainerId === t.id).length}</p><p className="text-[11px] text-muted">schools supported</p></div>
                </div>
                <p className="mt-3 text-[12px] font-medium text-muted">Recent lesson feedback</p>
                {fb.map((f) => <p key={f.id} className="mt-1 text-[13px]">“{f.comment}” <span className="text-muted">· {f.lessonTitle}</span></p>)}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </Workspace>
  );
}

const COLS: FollowUp["status"][] = ["Open", "In progress", "Done"];

export function FollowUps({ program = "SU" }: { program?: "SU" | "FB" }) {
  const d = useData();
  const L = useLookup();
  const update = useDemo((s) => s.update);
  const items = d.followUps.filter((f) => f.program === program);
  return (
    <Workspace area={program === "SU" ? "su" : "fb"} title={program === "SU" ? "Follow-ups & coaching" : "Follow-ups"} description="Actions created from observations, attendance rules and visits. Drag cards to update their status."
      aiActions={<AIAction label="Prepare coaching plan" prompt="Draft a coaching plan" />}>
      <Board columns={COLS} items={items} getColumn={(f) => f.status}
        onMove={(f, to) => { update((x) => { const r = x.followUps.find((y) => y.id === f.id); if (r) r.status = to as FollowUp["status"]; }); toast({ tone: "success", title: `Moved to ${to}` }); }}
        renderCard={(f) => (
          <div>
            <p className="text-[13px] font-medium">{f.title}</p>
            <p className="mt-1 text-[12px] text-muted">{f.schoolId ? L.schools.get(f.schoolId)?.name : f.studentId ? <Link className="hover:underline" to={`/future-builders/students/${f.studentId}`}>{L.person(f.studentId)}</Link> : ""}</p>
            <p className="mt-1 text-[11px] text-subtle">{f.source}</p>
            <div className="mt-2 flex items-center justify-between"><span className="text-[11px] text-muted">{L.person(f.ownerId)}</span><Badge tone={f.due < DEMO_TODAY && f.status !== "Done" ? "danger" : "neutral"}>Due {formatDate(f.due)}</Badge></div>
          </div>
        )} />
    </Workspace>
  );
}

export function FieldActivities() {
  const d = useData();
  const L = useLookup();
  const rows = d.visits.filter((v) => v.purpose === "School meeting" || v.purpose === "Equipment check");
  return (
    <Workspace area="su" title="Field activities" description="Other on-site activities (meetings, equipment checks, events), logged with the same offline mechanism as observations.">
      <DataTable rows={rows} search={(v) => `${L.schools.get(v.schoolId)?.name} ${v.purpose}`} initialSort={{ key: "d", dir: "desc" }}
        columns={[{ key: "d", header: "Date", sort: (v) => v.date, cell: (v) => formatDate(v.date) }, { key: "a", header: "Activity", cell: (v) => v.purpose }, { key: "s", header: "School", cell: (v) => <span className="font-medium">{L.schools.get(v.schoolId)?.name}</span> }, { key: "o", header: "Officer", cell: (v) => L.person(v.officerId) }, { key: "st", header: "Status", cell: (v) => <StatusBadge status={v.status} /> }]} />
    </Workspace>
  );
}

export function TeamAssignments() {
  const d = useData();
  const team = d.staff.filter((s) => s.department === "School Upskilling");
  return (
    <Workspace area="su" title="Team & assignments" description="Who covers which schools and Teaching Fellow cohorts.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {team.map((s) => {
          const schools = d.schools.filter((x) => x.poId === s.id || x.trainerId === s.id);
          return (
            <Card key={s.id} className="p-4">
              <div className="flex items-center gap-3"><Avatar name={s.name} size={36} /><div><p className="font-medium">{s.name}</p><p className="text-[12px] text-muted">{s.title}</p></div></div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.role === "su_pm" ? <Badge tone="su">All partner schools</Badge> : schools.map((x) => <Badge key={x.id} tone="outline">{x.name.replace(/ (Public|Intermediate|Secondary)? ?School/, "")}</Badge>)}
                {s.role === "su_trainer" && <Badge tone="info">TF Cohort 2026–27</Badge>}
              </div>
              <p className="mt-3 text-[12px] text-muted">Workload: {s.role === "su_pm" ? "program lead" : `${schools.length} schools`}</p>
            </Card>
          );
        })}
      </div>
    </Workspace>
  );
}
