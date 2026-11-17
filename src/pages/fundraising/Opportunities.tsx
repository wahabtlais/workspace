import { useState } from "react";
import { CheckCircle2, Circle, Loader2, Sparkles, XCircle } from "lucide-react";
import type { FundOpportunity } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/overlay";
import { Workspace } from "@/components/common/Workspace";
import { Board } from "@/components/data/Board";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData, useLookup } from "@/store/hooks";
import { formatDate, relativeDay } from "@/lib/utils";

const STAGES: FundOpportunity["stage"][] = ["Identified", "Qualifying", "Drafting", "Submitted", "Awarded", "Declined"];
const DEFAULT_CHECKS = ["Registered non-profit for 3+ years", "Program fits the call’s focus", "Works with the target age group", "Audited accounts for last 2 years", "Co-funding requirement can be met"];

function OpportunityDialog({ o, onClose }: { o: FundOpportunity; onClose: () => void }) {
  const update = useDemo((s) => s.update);
  const [running, setRunning] = useState(false);
  const checks = o.eligibility ?? DEFAULT_CHECKS.map((item) => ({ item, met: null as boolean | null }));
  const run = () => {
    setRunning(true);
    window.setTimeout(() => {
      update((d) => { const x = d.opportunities.find((y) => y.id === o.id)!; x.eligibility = DEFAULT_CHECKS.map((item, i) => ({ item, met: i === 4 ? null : i !== 2 || x.program !== "Org" })); x.fit = 78; if (x.stage === "Identified") x.stage = "Qualifying"; });
      setRunning(false);
      toast({ tone: "ai", title: "Eligibility checklist pre-filled", body: "4 of 5 criteria met; co-funding needs a human decision." });
    }, 1600);
  };
  const go = () => { update((d) => { d.opportunities.find((y) => y.id === o.id)!.stage = "Drafting"; }); useDemo.getState().addInbox({ toRole: "exec", kind: "approval", title: `Go / no-go: ${o.title}`, detail: `${o.funder} · USD ${o.amount.toLocaleString("en-US")}`, link: "/executive/decisions", source: "Fundraising" }); toast({ tone: "success", title: "Moved to drafting", body: "Executive was asked to confirm go / no-go." }); onClose(); };
  return (
    <DialogContent wide title={o.title} description={`${o.funder} · USD ${o.amount.toLocaleString("en-US")} · deadline ${formatDate(o.deadline, { day: "numeric", month: "long", year: "numeric" })}`}
      footer={<><DialogClose asChild><Button variant="secondary">Close</Button></DialogClose><Button variant="ai" onClick={run} disabled={running}>{running ? <Loader2 className="animate-spin" /> : <Sparkles />} Check eligibility</Button>{(o.stage === "Identified" || o.stage === "Qualifying") && <Button onClick={go}>Go: start drafting</Button>}</>}>
      <p className="mb-2 text-[13px] font-medium">Eligibility checklist {o.fit !== undefined && <Badge tone="info" className="ml-2">Fit {o.fit}%</Badge>}</p>
      <ul className="space-y-1.5">{checks.map((c) => <li key={c.item} className="flex items-center gap-2 text-[14px]">{c.met === true ? <CheckCircle2 className="size-4 text-emerald-600" /> : c.met === false ? <XCircle className="size-4 text-red-600" /> : <Circle className="size-4 text-subtle" />}{c.item}{c.met === null && <span className="text-[12px] text-muted">· needs a decision</span>}</li>)}</ul>
      <p className="mt-4 text-[12px] text-muted">The Fundraising Agent pre-fills from the call text and the organization profile. A person decides go / no-go.</p>
    </DialogContent>
  );
}

export default function Opportunities() {
  const d = useData();
  const L = useLookup();
  const update = useDemo((s) => s.update);
  const [sel, setSel] = useState<FundOpportunity | null>(null);
  return (
    <Workspace area="fundraising" title="Opportunities" description="Pipeline from identified to awarded. Open a card to run an eligibility check; drag to change stage.">
      <Board columns={STAGES} items={d.opportunities} getColumn={(o) => o.stage} onMove={(o, to) => update((x) => { x.opportunities.find((y) => y.id === o.id)!.stage = to as FundOpportunity["stage"]; })}
        renderCard={(o) => (
          <button onClick={() => setSel(d.opportunities.find((x) => x.id === o.id)!)} className="block w-full text-left">
            <p className="font-medium">{o.title}</p><p className="text-[12px] text-muted">{o.funder}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1"><Badge tone="outline">USD {Math.round(o.amount / 1000)}k</Badge><Badge tone={o.program === "SU" ? "su" : o.program === "FB" ? "fb" : "neutral"}>{o.program}</Badge>{o.fit !== undefined && <Badge tone="info">Fit {o.fit}%</Badge>}</div>
            <p className="mt-1.5 text-[11px] text-subtle">Deadline {relativeDay(o.deadline)} · {L.person(o.ownerId)}</p>
          </button>
        )} />
      <Dialog open={!!sel} onOpenChange={(v) => !v && setSel(null)}>{sel && <OpportunityDialog o={d.opportunities.find((x) => x.id === sel.id)!} onClose={() => setSel(null)} />}</Dialog>
    </Workspace>
  );
}
