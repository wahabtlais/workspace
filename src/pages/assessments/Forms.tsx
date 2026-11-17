import { Link } from "react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable } from "@/components/data/DataTable";
import { useData, useLookup } from "@/store/hooks";
import { formatDate } from "@/lib/utils";

export const TYPES = ["Pre/post test", "Quiz", "Observation", "Survey", "Evaluation", "Visit", "Data collection"];

export default function FormsLibrary() {
  const d = useData();
  const L = useLookup();
  return (
    <Workspace area="assessments" title="Forms library" description="One engine for quizzes, pre/post tests, observations, evaluations, surveys and data collection. Forms are versioned and linked to learning objectives."
      actions={<Button asChild><Link to="/assessments/builder"><Plus /> New form</Link></Button>}>
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-7">
        {TYPES.map((t) => <div key={t} className="rounded-xl border border-line bg-surface p-3 shadow-card"><p className="text-[20px] font-semibold tabular">{d.forms.filter((f) => f.type === t).length}</p><p className="text-[12px] text-muted">{t}</p></div>)}
      </div>
      <DataTable rows={d.forms} search={(f) => f.title} initialSort={{ key: "u", dir: "desc" }}
        filters={[{ key: "t", label: "Type", options: TYPES, get: (f) => f.type }, { key: "p", label: "Program", options: ["SU", "FB", "Org"], get: (f) => f.program }, { key: "s", label: "Status", options: ["Draft", "Published", "Archived"], get: (f) => f.status }]}
        columns={[
          { key: "t", header: "Form", sort: (f) => f.title, cell: (f) => <span><span className="block font-medium">{f.title}</span><span className="text-[12px] text-muted">{f.questionCount} questions · for {f.audience}</span></span> },
          { key: "ty", header: "Type", cell: (f) => <Badge tone="outline">{f.type}</Badge> },
          { key: "p", header: "Program", cell: (f) => <Badge tone={f.program === "SU" ? "su" : f.program === "FB" ? "fb" : "neutral"}>{f.program === "SU" ? "School Upskilling" : f.program === "FB" ? "Future Builders" : "Organization"}</Badge>, hideOnMobile: true },
          { key: "o", header: "Objectives", cell: (f) => <span className="text-[12px] text-muted">{f.objectiveIds.map((o) => d.objectives.find((x) => x.id === o)?.code).join(", ") || "—"}</span>, hideOnMobile: true },
          { key: "s", header: "Status", cell: (f) => <StatusBadge status={f.status} /> },
          { key: "u", header: "Updated", sort: (f) => f.updatedAt, cell: (f) => <span className="text-muted">{formatDate(f.updatedAt)} · {L.person(f.ownerId).split(" ")[0]}</span> },
        ]} />
    </Workspace>
  );
}
