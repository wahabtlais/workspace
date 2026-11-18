import { FileText } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/misc";
import { Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AIAction } from "@/components/shell/AskPanel";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useData } from "@/store/hooks";
import { DEMO_TODAY, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function TeamsWorkload() {
  const d = useData();
  const rows = d.staff.filter((s) => s.role !== "admin").map((s) => {
    const schools = d.schools.filter((x) => x.poId === s.id || x.trainerId === s.id).length;
    const follow = d.followUps.filter((f) => f.ownerId === s.id && f.status !== "Done").length;
    const sessions = d.trainingSessions.filter((x) => x.trainerId === s.id).length + d.fbSessions.filter((x) => x.leadId === s.id).length;
    const reqs = d.requests.filter((r) => r.chain.some((c) => c.status === "pending" && c.role === s.role)).length;
    const load = Math.min(100, schools * 9 + follow * 12 + sessions * 2 + reqs * 8 + (s.role === "exec" ? 50 : 20));
    return { s, schools, follow, sessions, reqs, load };
  });
  return (
    <Workspace area="executive" title="Teams & workload" description="Derived from assignments in the platform (schools, sessions, follow-ups, approvals), not timesheets.">
      <Card><CardBody className="pt-4">
        <MiniTable head={["Person", "Department", "Schools", "Sessions", "Open follow-ups", "Approvals", "Load"]} rows={rows.sort((a, b) => b.load - a.load).map((r) => [
          <span className="flex items-center gap-2"><Avatar name={r.s.name} size={24} />{r.s.name}</span>, <span className="text-muted">{r.s.department}</span>, r.schools, r.sessions, r.follow, r.reqs,
          <span className={cn("inline-block min-w-14 rounded px-2 py-0.5 text-center text-[12px] font-medium tabular", r.load >= 75 ? "bg-red-100 text-red-800" : r.load >= 50 ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-800")}>{r.load}%</span>])} />
      </CardBody></Card>
    </Workspace>
  );
}

export function ProjectsMilestones() {
  const d = useData();
  const ent = d.curricula.find((c) => c.id === "cur-ent")!;
  const items = [
    ...d.projects.flatMap((p) => p.milestones.filter((m) => m.status !== "Approved").map((m) => ({ area: "Future Builders", title: `${p.title}: ${m.title}`, due: m.due, status: m.status }))),
    ...d.obligations.filter((o) => o.status !== "Submitted").map((o) => ({ area: "Fundraising", title: o.title, due: o.due, status: o.status })),
    { area: "School Upskilling", title: "TF Cohort 2026–27 certification", due: "2026-12-18", status: "In progress" },
    { area: "Curriculum", title: "Entrepreneurship Pathway v1.0 publication", due: "2026-11-20", status: ent.versions.some((v) => v.status === "published") ? "Completed" : "In progress" },
  ].sort((a, b) => a.due.localeCompare(b.due));
  return (
    <Workspace area="executive" title="Projects & milestones" description="Cross-organization milestones. Slipped items are highlighted in red.">
      <Card><CardBody className="pt-4"><MiniTable head={["Milestone", "Area", "Due", "Status"]} rows={items.map((i) => [<span className={cn(i.due < DEMO_TODAY && i.status !== "Completed" && "font-medium text-red-700")}>{i.title}</span>, <Badge tone="outline">{i.area}</Badge>, formatDate(i.due), <StatusBadge status={i.status} />])} /></CardBody></Card>
    </Workspace>
  );
}

export function ExecReports() {
  const reports = [["Board report Q3 2026", "Approved", "2026-10-15"], ["Monthly management report: October", "Approved", "2026-11-04"], ["Monthly management report: November", "Draft", "2026-11-30"], ["Annual impact report 2025–26", "Published", "2026-09-30"]];
  return (
    <Workspace area="executive" title="Reports" description="Board and organizational reports: generated from indicators, reviewed and approved." aiActions={<AIAction label="Draft November report" prompt="Draft the monthly management report" />}>
      <div className="grid gap-3 md:grid-cols-2">{reports.map(([t, s, dt]) => <Card key={t} className="flex items-center gap-3 p-4"><FileText className="size-5 text-muted" /><span className="flex-1"><span className="block font-medium">{t}</span><span className="text-[12px] text-muted">{formatDate(dt)}</span></span><StatusBadge status={s} /></Card>)}</div>
    </Workspace>
  );
}
