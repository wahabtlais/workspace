import { useState } from "react";
import { ClipboardPen, CloudOff, MapPin, Plus } from "lucide-react";
import type { Visit } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/overlay";
import { Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable } from "@/components/data/DataTable";
import { AIAction } from "@/components/shell/AskPanel";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { DEMO_TODAY, formatDate, relativeDay } from "@/lib/utils";
import { ObservationDialog, PlanVisit } from "./VisitDialogs";

export default function Visits() {
  const d = useData();
  const L = useLookup();
  const persona = usePersona();
  const [obs, setObs] = useState<Visit | null>(null);
  const [plan, setPlan] = useState(false);
  const mineOnly = persona.role === "su_po";
  const planned = d.visits.filter((v) => v.status === "Planned" && (!mineOnly || v.officerId === persona.staffId)).sort((a, b) => a.date.localeCompare(b.date));
  const done = d.visits.filter((v) => v.status !== "Planned" && (!mineOnly || v.officerId === persona.staffId));
  return (
    <Workspace area="su" title="Visits & observations" description="Plan visits, complete observations (works offline) and turn low scores into coaching."
      aiActions={<AIAction label="Suggest visit schedule" prompt="Which schools haven’t been visited this month?" />}
      actions={<Button onClick={() => setPlan(true)}><Plus /> Plan a visit</Button>}>
      <Card>
        <CardHeader icon={<MapPin />} title="Planned visits" subtitle={mineOnly ? "Your visits" : "All Project Officers"} />
        <CardBody className="space-y-2">
          {planned.length === 0 && <p className="text-[13px] text-muted">No planned visits. Use “Plan a visit” to add one.</p>}
          {planned.map((v) => (
            <div key={v.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3">
              <span className="w-24 text-[13px] font-medium">{relativeDay(v.date)}</span>
              <span className="min-w-0 flex-1"><span className="block font-medium">{L.schools.get(v.schoolId)?.name}</span><span className="text-[12px] text-muted">{v.purpose}{v.tfId ? ` · ${L.person(v.tfId)}` : ""} · {L.person(v.officerId)}</span></span>
              {v.purpose === "Classroom observation" && v.date <= DEMO_TODAY && <Button size="sm" onClick={() => setObs(v)}><ClipboardPen /> Start observation</Button>}
            </div>
          ))}
        </CardBody>
      </Card>
      <DataTable rows={done} title="Completed visits" search={(v) => `${L.schools.get(v.schoolId)?.name} ${L.person(v.tfId)}`} initialSort={{ key: "date", dir: "desc" }}
        filters={[{ key: "p", label: "Purpose", options: ["Classroom observation", "Coaching check-in", "School meeting", "Equipment check"], get: (v) => v.purpose }]}
        columns={[
          { key: "date", header: "Date", sort: (v) => v.date, cell: (v) => formatDate(v.date) },
          { key: "s", header: "School", sort: (v) => L.schools.get(v.schoolId)?.name ?? "", cell: (v) => <span className="font-medium">{L.schools.get(v.schoolId)?.name}</span> },
          { key: "p", header: "Purpose", cell: (v) => <span className="text-muted">{v.purpose}</span>, hideOnMobile: true },
          { key: "tf", header: "Teaching Fellow", cell: (v) => (v.tfId ? L.person(v.tfId) : "—"), hideOnMobile: true },
          { key: "score", header: "Score", sort: (v) => v.score ?? -1, cell: (v) => v.score === undefined ? "—" : <Badge tone={v.score < 2.5 ? "danger" : v.score < 3 ? "warning" : "success"}>{v.score} / 4</Badge> },
          { key: "st", header: "Status", cell: (v) => v.pendingSync ? <Badge tone="warning"><CloudOff /> Waiting to sync</Badge> : <StatusBadge status={v.status} /> },
        ]} />
      <Dialog open={!!obs} onOpenChange={(o) => !o && setObs(null)}>{obs && <ObservationDialog visit={obs} onClose={() => setObs(null)} />}</Dialog>
      <Dialog open={plan} onOpenChange={setPlan}>{plan && <PlanVisit onClose={() => setPlan(false)} />}</Dialog>
    </Workspace>
  );
}
