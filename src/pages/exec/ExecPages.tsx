import { Link } from "react-router";
import { Check, Clock, Target, X } from "lucide-react";
import type { Decision } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AIMenu } from "@/components/shell/AskPanel";
import { ExecCockpit } from "./Cockpit";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { formatDate } from "@/lib/utils";
import { useLiveIndicators } from "@/lib/indicators";
import { decideDecision } from "@/store/execActions";


export function ExecOverview() {
  return (
    <Workspace area="executive" title="Executive cockpit" description="Program health, decisions, off-track indicators, risks and what is coming up. Drill down to the evidence or ask a manager to act."
      aiActions={<AIMenu context="Executive" items={[{ label: "Generate executive briefing", prompt: "Give me this week's executive briefing" }, { label: "Explain indicator changes", prompt: "Explain the change in observation scores and learning gain" }, { label: "Identify risks and opportunities", prompt: "What are our top risks and opportunities?" }, { label: "Suggest strategic actions", prompt: "Suggest strategic actions" }]} />}>
      <ExecCockpit full />
    </Workspace>
  );
}

export function ProgramsImpact() {
  const inds = useLiveIndicators();
  return (
    <Workspace area="executive" title="Programs & impact" description="School Upskilling and Future Builders performance, with drill-down to the records behind each figure.">
      <div className="grid gap-5 lg:grid-cols-2">
        {(["SU", "FB"] as const).map((p) => (
          <Card key={p}><CardHeader title={p === "SU" ? "School Upskilling" : "Future Builders"} action={<Link to={p === "SU" ? "/school-upskilling" : "/future-builders"} className="text-[13px] text-brand-600 hover:underline">Open program</Link>} />
            <CardBody className="space-y-3">{inds.filter((i) => i.program === p).map((i) => { const v = i.current; const pct = Math.min(100, (v / i.target) * 100); return (
              <Link key={i.id} to={`/results/${i.id}`} className="block rounded-lg p-2 hover:bg-canvas"><div className="flex items-center justify-between text-[13px]"><span>{i.name}</span><span className="tabular font-medium">{v}{i.unit === "%" ? "%" : ""} / {i.target}{i.unit === "%" ? "%" : ""}</span></div><Progress value={pct} className="mt-1.5" tone={pct >= 95 ? "success" : pct >= 80 ? "brand" : "warning"} /></Link>
            ); })}</CardBody></Card>
        ))}
      </div>
    </Workspace>
  );
}

export function Priorities() {
  const d = useData();
  const L = useLookup();
  return (
    <Workspace area="executive" title="Strategic priorities" description="Objectives → key results → linked indicators and projects.">
      {d.priorities.map((p) => { const avg = Math.round(p.keyResults.reduce((a, k) => a + k.progress, 0) / p.keyResults.length); return (
        <Card key={p.id}><CardHeader icon={<Target />} title={p.objective} subtitle={`Owner: ${L.person(p.ownerId)}`} action={<Badge tone={avg >= 90 ? "success" : avg >= 60 ? "info" : "warning"}>{avg}%</Badge>} />
          <CardBody className="space-y-2">{p.keyResults.map((k) => <div key={k.text} className="flex items-center gap-3 text-[13px]"><span className="flex-1">{k.text}{k.indicatorId && <Link to={`/results/${k.indicatorId}`} className="ml-2 text-[11px] text-brand-700 hover:underline">{d.indicators.find((i) => i.id === k.indicatorId)?.code}</Link>}</span><Progress value={k.progress} className="w-32" /><span className="w-10 text-right tabular">{k.progress}%</span></div>)}</CardBody>
        </Card>
      ); })}
    </Workspace>
  );
}

export function Decisions() {
  const d = useData();
  const L = useLookup();
  const persona = usePersona();
  const decide = (x: Decision, status: Decision["status"]) => decideDecision(x.id, status);
  const canDecide = persona.role === "exec";
  return (
    <Workspace area="executive" title="Decisions" description="Everything waiting on leadership, with context and one-click decide.">
      {d.decisions.map((x) => (
        <Card key={x.id} className="p-4">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1"><p className="font-semibold">{x.title}</p><p className="mt-1 text-[13px] text-muted">{x.context}</p><p className="mt-1 text-[12px] text-subtle">Requested by {L.person(x.requestedBy)} · due {formatDate(x.due)}{x.link && <> · <Link className="text-brand-700 hover:underline" to={x.link}>Open context</Link></>}</p></div>
            {x.status === "Pending" && canDecide ? <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => decide(x, "Deferred")}><Clock /> Defer</Button><Button size="sm" variant="secondary" onClick={() => decide(x, "Declined")}><X /> Decline</Button><Button size="sm" variant="success" onClick={() => decide(x, "Approved")}><Check /> Approve</Button></div> : <StatusBadge status={x.status} />}
          </div>
        </Card>
      ))}
    </Workspace>
  );
}
