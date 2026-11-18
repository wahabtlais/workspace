import { Link } from "react-router";
import { Rocket } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/components/common/Workspace";
import { DataTable } from "@/components/data/DataTable";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useData, useLookup } from "@/store/hooks";
import { formatDate } from "@/lib/utils";
import { envFor } from "./CurriculumDetail";
import { useCollection } from "./CurriculumPages";

export function Resources() {
  const d = useData();
  const { c, switcher } = useCollection();
  return (
    <Workspace area="curriculum" title="Resources library" description="Videos, slides, documents, datasets and starter code, tagged to objectives." meta={switcher}>
      <DataTable rows={d.resources.filter((r) => r.collection === c)} search={(r) => r.title} filters={[{ key: "k", label: "Kind", options: ["Video", "Slides", "Document", "Dataset", "Starter code"], get: (r) => r.kind }]}
        columns={[{ key: "t", header: "Resource", cell: (r) => <span className="font-medium">{r.title}</span> }, { key: "k", header: "Kind", cell: (r) => <Badge tone="outline">{r.kind}</Badge> }, { key: "o", header: "Objectives", cell: (r) => r.objectiveIds.map((o) => d.objectives.find((x) => x.id === o)?.code).join(", ") }, { key: "u", header: "Updated", cell: (r) => formatDate(r.updatedAt) }]} />
    </Workspace>
  );
}

export function Reviews() {
  const d = useData();
  const L = useLookup();
  const rows = d.curricula.flatMap((c) => c.versions.filter((v) => v.status === "in_review" || v.comments.some((x) => !x.resolved)).map((v) => ({ c, v })));
  return (
    <Workspace area="curriculum" title="Reviews" description="Versions waiting for reviewers, with open comments.">
      <Card><CardBody className="pt-4"><MiniTable empty="Nothing in review" head={["Curriculum", "Version", "Reviewers", "Open comments", ""]} rows={rows.map(({ c, v }) => [<span className="font-medium">{c.title}</span>, v.label, v.reviewerIds.map((r) => L.person(r)).join(", ") || "—", v.comments.filter((x) => !x.resolved).length, <Button asChild size="sm" variant="secondary"><Link to={`/curriculum/${c.id}`}>Open</Link></Button>])} /></CardBody></Card>
    </Workspace>
  );
}

export function Publishing() {
  const d = useData();
  const ready = d.curricula.flatMap((c) => c.versions.filter((v) => v.status === "approved").map((v) => ({ c, v })));
  return (
    <Workspace area="curriculum" title="Publishing" description="Approved versions become immutable course snapshots in the Student Portal or the TF Portal. Running cohorts stay pinned to their version.">
      <Card><CardHeader icon={<Rocket />} title="Ready to publish" /><CardBody>
        {ready.length === 0 ? <p className="text-[13px] text-muted">No approved versions waiting.</p> : ready.map(({ c, v }) => (
          <div key={v.id} className="flex flex-wrap items-center gap-3 border-b border-line py-2.5 last:border-0">
            <span className="flex-1"><span className="block font-medium">{c.title} {v.label}</span><span className="text-[12px] text-muted">Target: {envFor(c)}{v.approvedAt ? ` · approved ${formatDate(v.approvedAt)}` : ""}</span></span>
            <Button asChild size="sm"><Link to={`/curriculum/${c.id}`}>Review & publish</Link></Button>
          </div>
        ))}
      </CardBody></Card>
      <Card><CardHeader title="Live courses" subtitle="Publishing log" /><CardBody><MiniTable head={["Course", "Environment", "Version", "Cohorts", "Published"]} rows={d.courses.map((k) => { const c = d.curricula.find((x) => x.id === k.curriculumId)!; return [<span className="font-medium">{k.title}</span>, k.env === "FB" ? "Student Portal" : "TF Portal", c.versions.find((v) => v.id === k.versionId)?.label, k.cohortIds.map((id) => d.fbCohorts.find((x) => x.id === id)?.name ?? d.tfCohorts.find((x) => x.id === id)?.name).join(", "), formatDate(k.publishedAt)]; })} /></CardBody></Card>
    </Workspace>
  );
}
