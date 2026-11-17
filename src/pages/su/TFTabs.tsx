import { Link } from "react-router";
import { Award, CheckCircle2, Circle, XCircle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable } from "@/components/data/DataTable";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData, useLookup } from "@/store/hooks";
import { attendeeRate } from "@/lib/metrics";
import { certificationCriteria, isEligible } from "@/lib/certification";
import { DEMO_TODAY } from "@/lib/utils";

export function Training() {
  const d = useData();
  const regs = d.registers.filter((r) => r.kind === "tf");
  const cohort = d.tfs.filter((t) => t.cohortId === "tfc-2");
  const done = d.trainingSessions.filter((s) => s.date < DEMO_TODAY).length;
  return (
    <div className="space-y-4">
      <Card className="p-4"><div className="flex flex-wrap items-center gap-4"><div className="flex-1"><p className="font-semibold">TF Cohort 2026–27 · In training</p><p className="text-[13px] text-muted">{done} of {d.trainingSessions.length} sessions delivered · course: Teaching Fellow Foundations</p></div><Progress value={(done / d.trainingSessions.length) * 100} className="w-48" /><Button asChild variant="secondary"><Link to="/school-upskilling/training">Schedule & registers</Link></Button></div></Card>
      <DataTable rows={cohort} rowLink={(t) => `/school-upskilling/teaching-fellows/${t.id}`} search={(t) => t.name}
        columns={[
          { key: "n", header: "Teaching Fellow", sort: (t) => t.name, cell: (t) => <span className="font-medium">{t.name}</span> },
          { key: "b", header: "Baseline", sort: (t) => t.preScore ?? 0, cell: (t) => <span className="tabular">{t.preScore}%</span> },
          { key: "p", header: "Course progress", cell: (t) => { const n = d.progress.find((x) => x.learnerId === t.id)?.completedLessonIds.length ?? 0; return <span className="flex items-center gap-2"><Progress value={(n / 12) * 100} className="w-20" /><span className="text-[12px] tabular">{n}/12</span></span>; } },
          { key: "a", header: "Attendance", sort: (t) => attendeeRate(regs, t.id), cell: (t) => { const r = attendeeRate(regs, t.id); return <Badge tone={r < 80 ? "danger" : "success"}>{r}%</Badge>; } },
        ]} />
    </div>
  );
}

export function Certification() {
  const d = useData();
  const update = useDemo((s) => s.update);
  const cohort = d.tfs.filter((t) => t.cohortId === "tfc-2");
  const approve = (id: string) => {
    update((x) => { const t = x.tfs.find((y) => y.id === id)!; t.stage = "Certified"; t.certifiedAt = DEMO_TODAY; });
    toast({ tone: "success", title: "Certification approved", body: "The certificate appears in the TF Portal and the TF is available for deployment." });
  };
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-muted">Criteria are evaluated automatically from training attendance and Assessment Hub results. The Project Manager approves each certification.</p>
      {cohort.map((t) => {
        const c = certificationCriteria(d, t);
        const ok = isEligible(c);
        return (
          <Card key={t.id} className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Link to={`/school-upskilling/teaching-fellows/${t.id}`} className="w-44 font-medium hover:underline">{t.name}</Link>
              <div className="flex flex-1 flex-wrap gap-1.5">
                {c.map((x) => <span key={x.key} title={x.label} className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-0.5 text-[12px]">{x.met === true ? <CheckCircle2 className="size-3.5 text-emerald-600" /> : x.met === false ? <XCircle className="size-3.5 text-red-600" /> : <Circle className="size-3.5 text-subtle" />}{x.label.replace(/ ≥.*/, "")}<span className="text-muted">· {x.detail}</span></span>)}
              </div>
              {t.stage === "Certified" ? <StatusBadge status="Certified" /> : <Button size="sm" disabled={!ok} title={ok ? "" : "All criteria must be met"} onClick={() => approve(t.id)}><Award /> Approve</Button>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function Deployment() {
  const d = useData();
  const L = useLookup();
  const update = useDemo((s) => s.update);
  const ready = d.tfs.filter((t) => t.stage === "Certified");
  const deployed = d.tfs.filter((t) => t.stage === "Deployed");
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Ready to deploy" subtitle="Certified Teaching Fellows without a school" />
        <CardBody>
          {ready.length === 0 ? <p className="text-[13px] text-muted">No certified TFs waiting. Approved certifications appear here.</p> : ready.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center gap-3 border-b border-line py-2 last:border-0">
              <span className="flex-1 font-medium">{t.name}</span>
              <select defaultValue="" onChange={(e) => { const sid = e.target.value; update((x) => { const r = x.tfs.find((y) => y.id === t.id)!; r.stage = "Deployed"; r.schoolId = sid; }); toast({ tone: "success", title: `${t.name} deployed`, body: L.schools.get(sid)?.name }); }} className="h-9 rounded-lg border border-line px-2 text-[13px]">
                <option value="" disabled>Assign to school…</option>
                {d.schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          ))}
        </CardBody>
      </Card>
      <DataTable rows={deployed} title="Deployed" rowLink={(t) => `/school-upskilling/teaching-fellows/${t.id}`}
        columns={[{ key: "n", header: "Teaching Fellow", cell: (t) => <span className="font-medium">{t.name}</span> }, { key: "s", header: "School", cell: (t) => L.schools.get(t.schoolId ?? "")?.name ?? "—" }, { key: "c", header: "Classes", cell: (t) => d.classes.filter((c) => c.teacherId === t.id).map((c) => `${c.grade}-${c.section}`).join(", ") || "—" }]} />
    </div>
  );
}
