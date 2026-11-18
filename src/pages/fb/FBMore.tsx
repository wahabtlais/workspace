import { Link } from "react-router";
import { Award } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { Workspace } from "@/components/common/Workspace";
import { StatTile } from "@/components/common/StatTile";
import { DataTable } from "@/components/data/DataTable";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useData, useLookup } from "@/store/hooks";
import { PATHWAY_LABEL } from "@/data/seed/fb";
import { formatDate } from "@/lib/utils";
import { AIMenu } from "@/components/shell/AskPanel";

export function Portfolios() {
  const d = useData();
  const L = useLookup();
  return (
    <Workspace area="fb" title="Portfolios" description="Student-curated evidence of work. Students control visibility; sharing outside CodeBrave needs consent.">
      <DataTable rows={d.portfolio} search={(p) => `${p.title} ${L.person(p.studentId)}`} filters={[{ key: "v", label: "Visibility", options: ["Private", "Cohort", "Shared with host", "Public"], get: (p) => p.visibility }]}
        columns={[
          { key: "t", header: "Item", cell: (p) => <span className="font-medium">{p.title}</span> },
          { key: "s", header: "Student", cell: (p) => <Link className="hover:underline" to={`/future-builders/students/${p.studentId}`}>{L.person(p.studentId)}</Link> },
          { key: "k", header: "Kind", cell: (p) => <Badge tone="outline">{p.kind}</Badge> },
          { key: "v", header: "Visibility", cell: (p) => <Badge tone={p.visibility === "Private" ? "neutral" : p.visibility === "Cohort" ? "info" : "fb"}>{p.visibility}</Badge> },
          { key: "e", header: "Endorsed", cell: (p) => (p.endorsed ? <Badge tone="success"><Award /> Trainer endorsed</Badge> : "—") },
          { key: "d", header: "Added", cell: (p) => formatDate(p.addedAt) },
        ]} />
    </Workspace>
  );
}

const CHECKLIST = ["CV drafted", "Mock interview", "Online profile", "Portfolio with 3+ items", "Soft-skills workshop"];
export function Career() {
  const d = useData();
  const active = d.students.filter((s) => s.status === "Active");
  return (
    <Workspace area="fb" title="Career readiness" description="Readiness checklist, workshops and a readiness score that informs internship matching.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Average readiness" value={`${Math.round(active.reduce((a, s) => a + s.readiness, 0) / active.length)}%`} />
        <StatTile label="Ready for internships (≥ 50%)" value={active.filter((s) => s.readiness >= 50).length} />
        <StatTile label="Next workshop" value="Portfolio clinic" sub="Thursday 26 Nov" />
      </div>
      <DataTable rows={active} rowLink={(s) => `/future-builders/students/${s.id}`} search={(s) => s.name} initialSort={{ key: "r", dir: "desc" }}
        columns={[
          { key: "n", header: "Student", cell: (s) => <span className="font-medium">{s.name}</span> },
          { key: "p", header: "Pathway", cell: (s) => PATHWAY_LABEL[s.pathway] },
          { key: "r", header: "Readiness", sort: (s) => s.readiness, cell: (s) => <span className="flex items-center gap-2"><Progress value={s.readiness} className="w-24" /><span className="tabular">{s.readiness}%</span></span> },
          { key: "c", header: "Checklist", cell: (s) => <span className="text-[12px] text-muted">{Math.round((s.readiness / 100) * CHECKLIST.length)}/{CHECKLIST.length} done</span> },
        ]} />
    </Workspace>
  );
}

export function Mentorship() {
  const d = useData();
  const L = useLookup();
  const mentors = [...new Set(d.students.map((s) => s.mentorId).filter(Boolean))] as string[];
  return (
    <Workspace area="fb" title="Mentorship" description="Mentor pool, matching and session logs. Mentors see their mentees only." aiActions={<AIMenu context="Mentorship" items={[{ label: "Prepare mentorship summaries", prompt: "Prepare mentorship summaries" }, { label: "Identify learners needing support", prompt: "Which students are at risk?" }]} />}>
      <div className="grid gap-4 md:grid-cols-3">
        {mentors.map((m) => <Card key={m} className="p-4"><p className="font-semibold">{L.person(m)}</p><p className="text-[13px] text-muted">{d.students.filter((s) => s.mentorId === m).length} mentees · {d.mentorSessions.filter((x) => x.mentorId === m).length} sessions logged</p></Card>)}
      </div>
      <Card><CardHeader title="Recent mentor sessions" /><CardBody><MiniTable head={["Date", "Mentor", "Student", "Focus"]} rows={d.mentorSessions.map((m) => [formatDate(m.date), L.person(m.mentorId), L.person(m.studentId), m.focus])} /></CardBody></Card>
    </Workspace>
  );
}
