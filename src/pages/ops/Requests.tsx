import { Check, CheckCheck, UserCheck, X } from "lucide-react";
import type { OpsRequest } from "@/data/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AIAction } from "@/components/shell/AskPanel";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { assignRequest, completeRequest, decideRequest } from "@/store/opsActions";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ApprovalChain({ r }: { r: OpsRequest }) {
  const L = useLookup();
  return (
    <ol className="flex flex-wrap items-center gap-1.5 text-[12px]">
      {r.chain.map((s, i) => (
        <li key={i} className="flex items-center gap-1.5">
          <span className={cn("rounded-full px-2 py-0.5", s.status === "approved" ? "bg-emerald-50 text-emerald-800" : s.status === "pending" ? "bg-amber-50 font-medium text-amber-900 ring-1 ring-amber-200" : s.status === "rejected" ? "bg-red-50 text-red-800" : "bg-slate-100 text-subtle")}>
            {s.label}{s.by ? ` · ${L.person(s.by).split(" ")[0]}` : ""}
          </span>
          {i < r.chain.length - 1 && <span className="text-subtle">→</span>}
        </li>
      ))}
    </ol>
  );
}

export function RequestCard({ r, canAct }: { r: OpsRequest; canAct: boolean }) {
  const L = useLookup();
  const persona = usePersona();
  const pending = r.chain.find((s) => s.status === "pending");
  const myTurn = canAct && pending?.role === persona.role;
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><p className="font-medium">{r.title}</p><Badge tone="outline">{r.type}</Badge><StatusBadge status={r.status} />{r.aiFilled && <Badge tone="ai">Filled with AI</Badge>}</div>
          <p className="mt-0.5 text-[12px] text-muted">{r.id} · {L.person(r.requesterId)} · {formatDate(r.createdAt)}{r.amount ? ` · USD ${r.amount.toLocaleString("en-US")}` : ""}{r.assigneeId ? ` · assigned to ${L.person(r.assigneeId)}` : ""}</p>
          <p className="mt-0.5 text-[12px] text-muted">To: <span className="font-medium text-fg">{r.destination ?? "Operations & HR"}</span>{r.ownerId ? <> · Responsible: <span className="font-medium text-fg">{L.person(r.ownerId)}</span></> : null}</p>
          {r.details && <p className="mt-1 text-[13px] text-muted">{r.details}</p>}
          {r.fields && r.fields.length > 0 && <dl className="mt-2 grid gap-x-4 gap-y-1 text-[12.5px] sm:grid-cols-2">{r.fields.map((x) => <div key={x.label} className="flex gap-1.5"><dt className="text-muted">{x.label}:</dt><dd>{x.value}</dd></div>)}</dl>}
          <div className="mt-2"><ApprovalChain r={r} /></div>
          {r.history && r.history.length > 0 && <details className="mt-2 text-[12px]"><summary className="cursor-pointer text-muted hover:text-fg">Status history ({r.history.length})</summary><ol className="mt-1.5 space-y-1 border-l border-line pl-3">{r.history.map((h, i) => <li key={i}><span className="text-muted tabular">{formatDate(h.at)}</span> · {h.text}{h.by ? <span className="text-muted"> · {L.person(h.by)}</span> : null}</li>)}</ol></details>}
        </div>
        <div className="flex flex-wrap gap-2">
          {myTurn && <><Button size="sm" variant="secondary" onClick={() => decideRequest(r.id, false)}><X /> Reject</Button><Button size="sm" variant="success" onClick={() => decideRequest(r.id, true)}><Check /> Approve</Button></>}
          {canAct && persona.role === "ops_hr" && r.status === "Approved" && <Button size="sm" onClick={() => assignRequest(r.id, "s-reem")}><UserCheck /> Assign to Reem</Button>}
          {canAct && persona.role === "ops_hr" && r.status === "Assigned" && <Button size="sm" variant="secondary" onClick={() => completeRequest(r.id)}><CheckCheck /> Mark complete</Button>}
        </div>
      </div>
    </Card>
  );
}

const GROUPS: OpsRequest["status"][] = ["In approval", "Approved", "Assigned", "Completed", "Rejected"];

export default function Requests() {
  const d = useData();
  return (
    <Workspace area="operations" title="Requests" description="All requests across the organization: equipment, travel, leave, purchases, curriculum and program support. Each follows its approval route; approvers act here or from their Inbox."
      aiActions={<AIAction label="Summarise bottlenecks" prompt="Summarise open requests by stage" />}>
      <div className="flex flex-wrap gap-2">{GROUPS.map((g) => <Badge key={g} tone="outline">{g}: {d.requests.filter((r) => r.status === g).length}</Badge>)}</div>
      {GROUPS.map((g) => { const list = d.requests.filter((r) => r.status === g); return list.length ? (
        <section key={g} className="space-y-2"><h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">{g}</h2>{list.map((r) => <RequestCard key={r.id} r={r} canAct />)}</section>
      ) : null; })}
    </Workspace>
  );
}
