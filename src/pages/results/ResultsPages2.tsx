import { Database, Image, Quote } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { Workspace } from "@/components/common/Workspace";
import { AnnualResults } from "@/components/reports/AnnualResults";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useData, useLookup } from "@/store/hooks";
import { formatDate } from "@/lib/utils";
import { useLiveIndicators } from "./ResultsPages";

export function Targets() {
  const d = useData();
  const rows = useLiveIndicators();
  return (
    <Workspace area="results" title="Targets" description="Committed targets per grant, with current progress.">
      {d.grants.map((g) => <Card key={g.id}><CardHeader title={g.title} subtitle={d.organizations.find((o) => o.id === g.donorId)?.name} /><CardBody><MiniTable head={["Indicator", "Current", "Target", "Progress"]} rows={rows.filter((i) => g.indicatorIds.includes(i.id)).map((i) => [i.name, `${i.current}${i.unit === "%" ? "%" : ""}`, `${i.target}${i.unit === "%" ? "%" : ""}`, <Progress value={Math.min(100, (i.current / i.target) * 100)} className="w-28" />])} /></CardBody></Card>)}
    </Workspace>
  );
}

export function Annual() {
  return <Workspace area="results" title="Annual results" description="Annual pupil pre/post assessment results for reporting. A class counts once its session is reconciled and closed."><AnnualResults /></Workspace>;
}

export function Evidence() {
  const d = useData();
  const L = useLookup();
  const icon = { Story: Quote, Photo: Image, Quote: Quote, Document: Database };
  return (
    <Workspace area="results" title="Evidence library" description="Consented stories, photos and quotes tagged to programs and indicators. Unconsented media never leaves the platform.">
      <div className="grid gap-3 md:grid-cols-2">{d.evidence.map((e) => { const I = icon[e.kind]; return <Card key={e.id} className="p-4"><div className="flex items-center gap-2"><I className="size-4 text-muted" /><p className="flex-1 font-medium">{e.title}</p><Badge tone={e.consent === "Consented" ? "success" : e.consent === "Pending" ? "warning" : "neutral"}>{e.consent}</Badge></div><p className="mt-1 text-[13px] text-muted">{e.excerpt}</p><p className="mt-2 text-[12px] text-subtle">{e.program} · {L.person(e.addedBy)} · {formatDate(e.date)} · {e.indicatorIds.map((x) => d.indicators.find((i) => i.id === x)?.code).join(", ") || "no indicator"}</p></Card>; })}</div>
    </Workspace>
  );
}
