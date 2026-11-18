import { useState } from "react";
import { Check, Flag, Undo2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { Workspace, Segmented } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AIAction } from "@/components/shell/AskPanel";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { decideMilestone } from "@/store/fbActions";
import { PATHWAY_LABEL } from "@/data/seed/fb";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function Projects() {
  const d = useData();
  const L = useLookup();
  const persona = usePersona();
  const [kind, setKind] = useState<"all" | "team" | "client">("all");
  const [sel, setSel] = useState(d.projects[0].id);
  const list = d.projects.filter((p) => kind === "all" || p.kind === kind);
  const p = d.projects.find((x) => x.id === sel)!;
  const team = d.teams.find((t) => t.id === p.teamId)!;
  const canReview = ["fb_trainer", "fb_pm", "fb_po"].includes(persona.role);
  return (
    <Workspace area="fb" title="Projects" description="Team projects and real client projects: milestones, feedback and delivery sign-off."
      meta={<Segmented value={kind} onChange={setKind} options={[{ value: "all", label: "All" }, { value: "team", label: "Team projects" }, { value: "client", label: "Client projects" }]} />}
      aiActions={<AIAction label="Summarise project status" prompt="Summarise team project milestones" />}>
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="space-y-2">
          {list.map((x) => { const done = x.milestones.filter((m) => m.status === "Approved").length; return (
            <button key={x.id} onClick={() => setSel(x.id)} className={cn("w-full rounded-xl border bg-surface p-3 text-left shadow-card", sel === x.id ? "border-brand-400 ring-1 ring-brand-200" : "border-line hover:border-line-strong")}>
              <div className="flex items-center justify-between gap-2"><span className="text-[14px] font-medium">{x.title}</span><Badge tone={x.kind === "client" ? "fb" : "outline"}>{x.kind === "client" ? "Client" : "Team"}</Badge></div>
              <p className="text-[12px] text-muted">{d.teams.find((t) => t.id === x.teamId)?.name}{x.clientId ? ` · ${L.orgs.get(x.clientId)?.name}` : ""}</p>
              <div className="mt-2 flex items-center gap-2"><Progress value={(done / x.milestones.length) * 100} className="flex-1" /><span className="text-[11px] tabular">{done}/{x.milestones.length}</span></div>
            </button>
          ); })}
        </div>
        <div className="space-y-4">
          <Card><CardHeader title={p.title} subtitle={p.summary} /><CardBody className="flex flex-wrap gap-2 text-[13px]">
            <Badge tone="outline">{PATHWAY_LABEL[team.pathway]}</Badge><Badge tone="outline">{team.name}: {team.memberIds.map((m) => d.students.find((s) => s.id === m)?.firstName).join(", ")}</Badge>
            {p.clientId && <Badge tone="fb">Client: {L.orgs.get(p.clientId)?.name}</Badge>}
          </CardBody></Card>
          <Card><CardHeader icon={<Flag />} title="Milestones" subtitle={p.kind === "client" ? "The client signs off milestones in Partner Access; trainers review team milestones here." : "Trainer review"} /><CardBody className="space-y-2">
            {p.milestones.map((m) => (
              <div key={m.id} className="rounded-lg border border-line p-3">
                <div className="flex flex-wrap items-center gap-2"><span className="flex-1 font-medium">{m.title}</span><span className="text-[12px] text-muted">Due {formatDate(m.due)}</span><StatusBadge status={m.status} /></div>
                {m.feedback && <p className="mt-1 text-[12px] text-muted">Feedback: {m.feedback}</p>}
                {m.status === "Submitted" && canReview && p.kind === "team" && <div className="mt-2 flex gap-2"><Button size="sm" variant="success" onClick={() => decideMilestone(p.id, m.id, "Approved", "Well done.")}><Check /> Approve</Button><Button size="sm" variant="secondary" onClick={() => decideMilestone(p.id, m.id, "Changes requested", "Please address the review notes.")}><Undo2 /> Request changes</Button></div>}
                {m.status === "Submitted" && p.kind === "client" && <p className="mt-2 text-[12px] text-amber-700">Waiting for client sign-off in Partner Access.</p>}
              </div>
            ))}
          </CardBody></Card>
        </div>
      </div>
    </Workspace>
  );
}
