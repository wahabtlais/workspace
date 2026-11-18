import { Link } from "react-router";
import { AlertTriangle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workspace } from "@/components/common/Workspace";
import { DataTable } from "@/components/data/DataTable";
import { AIAction } from "@/components/shell/AskPanel";
import { MiniTable } from "@/pages/staff/home/widgets";
import { VERSION_LABEL } from "@/pages/staff/home/panelsLearning";
import { useData, useLookup } from "@/store/hooks";
import { formatDate } from "@/lib/utils";
import { envFor } from "./CurriculumDetail";
import { useCollection, V_TONE } from "./CurriculumPages";

export function CurriculaList() {
  const d = useData();
  const L = useLookup();
  const { c, switcher } = useCollection();
  return (
    <Workspace area="curriculum" title="Curricula & builder" description="Curriculum → module → lesson, with objectives tagged at every level. Open one to edit, review or publish." meta={switcher}>
      <DataTable rows={d.curricula.filter((x) => x.collection === c)} rowLink={(x) => `/curriculum/${x.id}`} search={(x) => x.title}
        columns={[
          { key: "t", header: "Curriculum", sort: (x) => x.title, cell: (x) => <span><span className="block font-medium">{x.title}</span><span className="text-[12px] text-muted">{x.audience}</span></span> },
          { key: "v", header: "Versions", cell: (x) => <span className="flex flex-wrap gap-1">{x.versions.map((v) => <Badge key={v.id} tone={V_TONE[v.status]}>{v.label}</Badge>)}</span> },
          { key: "s", header: "Latest status", cell: (x) => { const v = x.versions[x.versions.length - 1]; return <Badge tone={V_TONE[v.status]} dot>{VERSION_LABEL[v.status]}</Badge>; } },
          { key: "e", header: "Publishes to", cell: (x) => <span className="text-muted">{envFor(x)}</span>, hideOnMobile: true },
          { key: "o", header: "Owner", cell: (x) => <span className="text-muted">{L.person(x.ownerId)}</span>, hideOnMobile: true },
        ]} />
    </Workspace>
  );
}

export function LessonPlans() {
  const d = useData();
  const { c, switcher } = useCollection();
  const rows = d.curricula.filter((x) => x.collection === c).flatMap((x) => { const v = x.versions[x.versions.length - 1]; return v.modules.flatMap((m) => m.lessons.map((l) => ({ x, v, m, l }))); });
  return (
    <Workspace area="curriculum" title="Lesson plans" description="Structured lesson plans from the latest version of each curriculum." meta={switcher}
      aiActions={<AIAction label="Draft a lesson" prompt="Draft a lesson for an objective" />}>
      <DataTable rows={rows} rowLink={(r) => `/curriculum/${r.x.id}`} search={(r) => `${r.l.title} ${r.x.title}`}
        filters={[{ key: "c", label: "Curriculum", options: [...new Set(rows.map((r) => r.x.title))], get: (r) => r.x.title }]}
        columns={[
          { key: "l", header: "Lesson", sort: (r) => r.l.title, cell: (r) => <span className="font-medium">{r.l.title}{r.l.aiDrafted && <Badge tone="ai" className="ml-2">AI draft</Badge>}</span> },
          { key: "m", header: "Module", cell: (r) => <span className="text-muted">{r.m.title}</span>, hideOnMobile: true },
          { key: "x", header: "Curriculum", cell: (r) => <span className="text-muted">{r.x.title} {r.v.label}</span> },
          { key: "o", header: "Objectives", cell: (r) => <span className="flex gap-1">{r.l.objectiveIds.map((o) => <Badge key={o} tone="outline">{d.objectives.find((x) => x.id === o)?.code}</Badge>)}</span> },
          { key: "t", header: "Time", sort: (r) => r.l.minutes, cell: (r) => <span className="tabular">{r.l.minutes} min</span> },
        ]} />
    </Workspace>
  );
}

export function CurriculumAssessments() {
  const d = useData();
  const { c, switcher } = useCollection();
  const objs = d.objectives.filter((o) => o.collection === c);
  const uncovered = objs.filter((o) => !d.forms.some((f) => f.objectiveIds.includes(o.id)));
  return (
    <Workspace area="curriculum" title="Assessments & rubrics" description="Authored here, stored in the Assessment Hub, linked to objectives." meta={switcher}>
      {uncovered.length > 0 && <Card className="border-amber-200 p-4"><p className="flex items-center gap-2 font-medium text-amber-900"><AlertTriangle className="size-4" /> Coverage check: {uncovered.length} objective{uncovered.length > 1 ? "s have" : " has"} no assessment</p><p className="mt-1 text-[13px] text-muted">{uncovered.map((o) => o.code).join(", ")}</p></Card>}
      <Card><CardBody className="pt-4"><MiniTable head={["Form", "Type", "Objectives", "Updated"]} rows={d.forms.filter((f) => f.program === c).map((f) => [<Link className="font-medium hover:underline" to="/assessments">{f.title}</Link>, f.type, f.objectiveIds.map((o) => d.objectives.find((x) => x.id === o)?.code).join(", ") || "—", formatDate(f.updatedAt)])} /></CardBody></Card>
    </Workspace>
  );
}
