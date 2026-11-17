import { useState } from "react";
import { Link } from "react-router";
import { BookOpen, Rocket } from "lucide-react";
import type { Program } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workspace, Segmented } from "@/components/common/Workspace";
import { StatTile } from "@/components/common/StatTile";
import { AIAction } from "@/components/shell/AskPanel";
import { MiniTable } from "@/pages/staff/home/widgets";
import { VERSION_LABEL } from "@/pages/staff/home/panelsLearning";
import { useData } from "@/store/hooks";
import { envFor } from "./CurriculumDetail";

export const V_TONE = { draft: "neutral", in_review: "warning", approved: "info", published: "success" } as const;

export function useCollection() {
  const [c, setC] = useState<Program>("FB");
  const switcher = <Segmented value={c} onChange={setC} options={[{ value: "FB", label: "Future Builders" }, { value: "SU", label: "School Upskilling" }]} />;
  return { c, switcher };
}

export function CurriculumOverview() {
  const d = useData();
  const { c, switcher } = useCollection();
  const curs = d.curricula.filter((x) => x.collection === c);
  const versions = curs.flatMap((x) => x.versions);
  return (
    <Workspace area="curriculum" title="Curriculum Management" description="Two collections, one process: draft → review → approve → publish → learn → improve." meta={switcher}
      aiActions={<AIAction label="Summarise trainer feedback" prompt="Summarise trainer feedback themes" context="Curriculum" />}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Curricula" value={curs.length} sub={`${d.objectives.filter((o) => o.collection === c).length} objectives in the framework`} icon={<BookOpen />} to="/curriculum/curricula" />
        <StatTile label="In review" value={versions.filter((v) => v.status === "in_review").length} tone="warning" to="/curriculum/reviews" />
        <StatTile label="Approved, not published" value={versions.filter((v) => v.status === "approved").length} to="/curriculum/publishing" icon={<Rocket />} />
        <StatTile label="Improvement items" value={d.backlog.filter((b) => curs.some((x) => x.id === b.curriculumId) && b.status !== "Done").length} to="/curriculum/backlog" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {curs.map((x) => {
          const latest = x.versions[x.versions.length - 1];
          const live = d.courses.find((k) => k.curriculumId === x.id);
          return (
            <Link key={x.id} to={`/curriculum/${x.id}`}>
              <Card className="h-full p-4 transition hover:border-brand-300">
                <div className="flex items-start justify-between gap-2"><p className="font-semibold">{x.title}</p><Badge tone={V_TONE[latest.status]} dot>{latest.label} · {VERSION_LABEL[latest.status]}</Badge></div>
                <p className="mt-1 text-[13px] text-muted">{x.audience}</p>
                <p className="mt-3 text-[12px] text-muted">{latest.modules.length} modules · {latest.modules.reduce((a, m) => a + m.lessons.length, 0)} lessons · {live ? <span className="text-emerald-700">live in {envFor(x).replace("Future Builders ", "")} ({x.versions.find((v) => v.id === live.versionId)?.label})</span> : "not live yet"}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </Workspace>
  );
}

export function Frameworks() {
  const d = useData();
  const { c, switcher } = useCollection();
  const objs = d.objectives.filter((o) => o.collection === c);
  const usage = (id: string) => d.curricula.flatMap((x) => x.versions[x.versions.length - 1].modules.flatMap((m) => m.lessons)).filter((l) => l.objectiveIds.includes(id)).length;
  return (
    <Workspace area="curriculum" title="Frameworks" description="Learning objectives and competencies per collection. Objectives are tagged on lessons, questions and scores." meta={switcher}>
      <Card><CardHeader title="Learning objectives" /><CardBody>
        <MiniTable head={["Code", "Objective", "Competency", "Lessons", "Assessed"]} rows={objs.map((o) => [<b>{o.code}</b>, o.text, o.competencyId ? d.competencies.find((x) => x.id === o.competencyId)?.name : "—", usage(o.id), d.forms.some((f) => f.objectiveIds.includes(o.id)) ? <Badge tone="success">Yes</Badge> : <Badge tone="warning">No assessment</Badge>])} />
      </CardBody></Card>
      {c === "FB" && <Card><CardHeader title="Competencies" subtitle="Shared across the AI, web and entrepreneurship pathways" /><CardBody className="flex flex-wrap gap-2">{d.competencies.map((x) => <Badge key={x.id} tone="fb">{x.name}</Badge>)}</CardBody></Card>}
    </Workspace>
  );
}
