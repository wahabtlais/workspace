import { Link } from "react-router";
import { Check, X } from "lucide-react";
import type { FBSession } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { Workspace } from "@/components/common/Workspace";
import { StatTile } from "@/components/common/StatTile";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MiniTable } from "@/pages/staff/home/widgets";
import { decideCorrection } from "@/store/actions";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { attendanceRate, attendeeRate } from "@/lib/metrics";
import { PATHWAY_LABEL } from "@/data/seed/fb";
import { formatDate } from "@/lib/utils";

const TYPES: FBSession["type"][] = ["Learning session", "Workshop", "Student meeting", "Mentor meeting"];

export function FBAttendance() {
  const d = useData();
  const L = useLookup();
  const persona = usePersona();
  const regs = d.registers.filter((r) => r.kind === "fb");
  const active = d.students.filter((s) => s.cohortId === "fbc-2" && s.status === "Active");
  const follow = d.followUps.filter((f) => f.program === "FB" && f.studentId);
  const pending = regs.flatMap((r) => r.corrections.filter((c) => c.status === "pending").map((c) => ({ r, c })));
  return (
    <Workspace area="fb" title="Attendance" description="All Future Builders activities: learning sessions, workshops, student meetings and mentor meetings."
      actions={<Button asChild><Link to="/future-builders/cohorts">Take a register</Link></Button>}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TYPES.map((t) => { const r = regs.filter((x) => d.fbSessions.find((s) => s.id === x.contextId)?.type === t); return <StatTile key={t} label={t} value={`${attendanceRate(r)}%`} sub={`${r.length} registers`} progress={attendanceRate(r)} />; })}
      </div>
      {pending.length > 0 && ["fb_po", "fb_pm"].includes(persona.role) && (
        <Card className="border-amber-200"><CardHeader title="Corrections to approve" /><CardBody className="space-y-2">{pending.map(({ r, c }) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3 text-[13px]"><span className="flex-1"><b>{L.person(r.attendeeIds[c.index])}</b> · {formatDate(r.date)} · {c.from} → {c.to} · {c.reason}</span><Button size="sm" variant="success" onClick={() => decideCorrection(r.id, c.id, true)}><Check /> Approve</Button><Button size="sm" variant="secondary" onClick={() => decideCorrection(r.id, c.id, false)}><X /> Reject</Button></div>
        ))}</CardBody></Card>
      )}
      <Card><CardHeader title="Absence follow-ups" subtitle="Created automatically after 3 consecutive absences" /><CardBody>
        <MiniTable empty="No absence follow-ups" head={["Student", "Created", "Owner", "Due", "Status"]} rows={follow.map((f) => [<Link className="font-medium hover:underline" to={`/future-builders/students/${f.studentId}`}>{L.person(f.studentId)}</Link>, formatDate(f.createdAt), L.person(f.ownerId), formatDate(f.due), <StatusBadge status={f.status} />])} />
      </CardBody></Card>
      <Card><CardHeader title="By student" subtitle="Future Builders 2026–27" /><CardBody>
        <MiniTable head={["Student", "Pathway", "Attendance"]} rows={active.map((s) => ({ s, r: attendeeRate(regs, s.id) })).sort((a, b) => a.r - b.r).map(({ s, r }) => [<Link className="font-medium hover:underline" to={`/future-builders/students/${s.id}`}>{s.name}</Link>, PATHWAY_LABEL[s.pathway], <span className="flex items-center gap-2"><Progress value={r} className="w-24" tone={r < 75 ? "danger" : r < 85 ? "warning" : "success"} /><span className="tabular">{r}%</span></span>])} />
      </CardBody></Card>
    </Workspace>
  );
}

export function Pathways() {
  const d = useData();
  return (
    <Workspace area="fb" title="Pathways & competencies" description="Three pathways share one competency framework, owned by Curriculum Management.">
      <div className="grid gap-4 lg:grid-cols-3">
        {(["ai", "web", "ent"] as const).map((p) => {
          const cur = d.curricula.find((c) => c.pathway === p)!;
          const v = cur.versions[cur.versions.length - 1];
          return (
            <Card key={p}><CardHeader title={PATHWAY_LABEL[p]} subtitle={`${d.students.filter((s) => s.pathway === p && s.status === "Active").length} active students`} /><CardBody>
              <p className="text-[13px]"><Link to={`/curriculum/${cur.id}`} className="font-medium text-brand-700 hover:underline">{cur.title} {v.label}</Link></p>
              <ul className="mt-2 space-y-1 text-[13px] text-muted">{v.modules.map((m) => <li key={m.id}>• {m.title} ({m.lessons.length})</li>)}</ul>
              <div className="mt-3 flex flex-wrap gap-1">{d.objectives.filter((o) => o.code.includes(p === "ai" ? "AI" : p === "web" ? "WEB" : "ENT")).map((o) => <Badge key={o.id} tone="outline" title={o.text}>{o.code}</Badge>)}</div>
            </CardBody></Card>
          );
        })}
      </div>
      <Card><CardHeader title="Competency framework" /><CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{d.competencies.map((c) => { const st = d.students.filter((s) => s.status === "Active"); const avg = st.reduce((a, s) => a + (s.competencies[c.id] ?? 0), 0) / st.length; return <div key={c.id} className="rounded-lg bg-canvas p-3"><p className="text-[13px] font-medium">{c.name}</p><p className="mt-1 text-[20px] font-semibold tabular">{avg.toFixed(1)}<span className="text-[12px] text-muted"> / 4</span></p><p className="text-[11px] text-subtle">cohort average</p></div>; })}</CardBody></Card>
    </Workspace>
  );
}

export function Clients() {
  const d = useData();
  const L = useLookup();
  const clients = d.organizations.filter((o) => o.type === "Client");
  return (
    <Workspace area="fb" title="Clients" description="Organizations that bring real projects to student teams. Clients see their own project only, through Partner Access.">
      <div className="grid gap-4 md:grid-cols-2">
        {clients.map((c) => { const p = d.projects.find((x) => x.clientId === c.id); const done = p?.milestones.filter((m) => m.status === "Approved").length ?? 0; return (
          <Card key={c.id} className="p-4">
            <div className="flex items-center justify-between"><p className="font-semibold">{c.name}</p><Badge tone="outline">{c.sector}</Badge></div>
            <p className="text-[13px] text-muted">Contact: {c.contact} · relationship: {L.person(c.ownerId)}</p>
            {p ? <><p className="mt-3 text-[13px] font-medium">{p.title}</p><div className="mt-1 flex items-center gap-2"><Progress value={(done / p.milestones.length) * 100} className="flex-1" /><span className="text-[12px] tabular">{done}/{p.milestones.length}</span></div></> : <p className="mt-3 text-[13px] text-muted">Intake: requirements form sent.</p>}
          </Card>
        ); })}
      </div>
    </Workspace>
  );
}
