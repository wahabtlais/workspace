import { useState } from "react";
import { Check, FileText, Loader2, Send, Sparkles } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/components/common/Workspace";
import { useLiveIndicators } from "@/pages/results/ResultsPages";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData } from "@/store/hooks";
import { formatDate } from "@/lib/utils";
import { createDecision } from "@/store/execActions";

export default function ReportBuilder() {
  const d = useData();
  const inds = useLiveIndicators();
  const update = useDemo((s) => s.update);
  const [grantId, setGrant] = useState("gr-1");
  const [step, setStep] = useState<"idle" | "drafting" | "ready">("idle");
  const g = d.grants.find((x) => x.id === grantId)!;
  const obl = d.obligations.filter((o) => o.grantId === grantId && o.status !== "Submitted").sort((a, b) => a.due.localeCompare(b.due))[0];
  const draft = () => { setStep("drafting"); window.setTimeout(() => setStep("ready"), 1500); };
  const pendingDecision = d.decisions.find((x) => x.obligationId === obl?.id && x.status === "Pending");
  const sendForApproval = () => {
    if (!obl) return;
    update((x) => { x.obligations.find((o) => o.id === obl.id)!.status = "In review"; });
    if (!pendingDecision) createDecision({ title: `Approve donor report: ${obl.title}`, context: `${g.title} · drafted with the Reporting & Insights Agent, figures cited from live indicators`, requestedBy: "s-joelle", due: obl.due, link: "/fundraising/reports", obligationId: obl.id });
    toast({ tone: "success", title: "Sent for executive approval", body: "It now appears in the Co-founder’s Inbox and Decisions." });
  };
  const submitToDonor = () => {
    if (!obl) return;
    update((x) => { x.obligations.find((o) => o.id === obl.id)!.status = "Submitted"; });
    if (g.id === "gr-1") useDemo.getState().notify({ toPersona: "p-donor", text: `New approved report: ${obl.title}`, link: "/partner/reports", tone: "success" });
    useDemo.getState().logActivity({ actor: "Joelle Matar", text: `submitted ${obl.title} to the donor`, area: "Fundraising" });
    toast({ tone: "success", title: "Submitted to the donor", body: "The submitted version is archived and visible in the donor’s Partner Access." });
  };
  return (
    <Workspace area="fundraising" title="Report builder" description="Donor reports assembled from live indicators and consented evidence. Drafts stay drafts until a person approves them.">
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <select value={grantId} onChange={(e) => { setGrant(e.target.value); setStep("idle"); }} className="h-9 rounded-lg border border-line px-2 text-[13px]" aria-label="Grant">{d.grants.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</select>
        <span className="text-[13px] text-muted">{obl ? `Next: ${obl.title} · due ${formatDate(obl.due)}` : "No open obligation"}</span>{obl && <Badge tone={obl.status === "Approved" ? "success" : obl.status === "In review" ? "warning" : "neutral"}>{obl.status}</Badge>}
        <Button variant="ai" className="ms-auto" disabled={step === "drafting"} onClick={draft}>{step === "drafting" ? <Loader2 className="animate-spin" /> : <Sparkles />} Draft report</Button>
      </Card>
      {step === "ready" && (
        <Card className="animate-fade-in"><CardHeader icon={<FileText />} title={`${g.title}: progress report (draft)`} subtitle="Every figure links to its indicator" action={<Badge tone="ai">AI draft · needs review</Badge>} />
          <CardBody className="space-y-3 text-[14px]">
            <p>During this period CodeBrave continued delivery across {d.schools.filter((s) => s.status === "Active").length} partner schools and the active Future Builders cohort.</p>
            <ul className="space-y-1">{inds.filter((i) => g.indicatorIds.includes(i.id)).map((i) => <li key={i.id}>• {i.name}: <b>{i.current}{i.unit === "%" ? "%" : ""}</b> against a target of {i.target}{i.unit === "%" ? "%" : ""} <Badge tone="outline">{i.code}</Badge></li>)}</ul>
            <p className="text-muted">Story: {d.evidence.find((e) => e.consent === "Consented")?.excerpt}</p>
            <div className="flex gap-2 pt-2"><Button variant="secondary" onClick={() => toast({ tone: "success", title: "Figures verified", body: "M&E confirmed every figure against its source." })}><Check /> Verify figures (M&E)</Button>{obl?.status === "Approved" ? <Button variant="success" onClick={submitToDonor}><Send /> Submit to donor</Button> : obl?.status === "In review" ? <Badge tone="warning">Waiting for executive approval</Badge> : <Button onClick={sendForApproval}><Send /> Send for approval</Button>}</div>
          </CardBody>
        </Card>
      )}
    </Workspace>
  );
}
