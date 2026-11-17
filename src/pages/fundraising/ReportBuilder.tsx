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

export default function ReportBuilder() {
  const d = useData();
  const inds = useLiveIndicators();
  const update = useDemo((s) => s.update);
  const [grantId, setGrant] = useState("gr-1");
  const [step, setStep] = useState<"idle" | "drafting" | "ready">("idle");
  const g = d.grants.find((x) => x.id === grantId)!;
  const obl = d.obligations.find((o) => o.grantId === grantId && o.status !== "Submitted");
  const draft = () => { setStep("drafting"); window.setTimeout(() => setStep("ready"), 1500); };
  const sendForApproval = () => {
    if (obl) update((x) => { x.obligations.find((o) => o.id === obl.id)!.status = "In review"; });
    useDemo.getState().addInbox({ toRole: "exec", kind: "approval", title: `Approve donor report: ${g.title}`, detail: "Drafted with the Reporting & Insights Agent · figures cited", link: "/fundraising/reports", source: "Fundraising", priority: "high" });
    toast({ tone: "success", title: "Sent for executive approval", body: "It now appears in the Co-founder’s Inbox." });
  };
  return (
    <Workspace area="fundraising" title="Report builder" description="Donor reports assembled from live indicators and consented evidence. Drafts stay drafts until a person approves them.">
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <select value={grantId} onChange={(e) => { setGrant(e.target.value); setStep("idle"); }} className="h-9 rounded-lg border border-line px-2 text-[13px]" aria-label="Grant">{d.grants.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</select>
        <span className="text-[13px] text-muted">{obl ? `Next: ${obl.title} · due ${formatDate(obl.due)}` : "No open obligation"}</span>
        <Button variant="ai" className="ms-auto" disabled={step === "drafting"} onClick={draft}>{step === "drafting" ? <Loader2 className="animate-spin" /> : <Sparkles />} Draft report</Button>
      </Card>
      {step === "ready" && (
        <Card className="animate-fade-in"><CardHeader icon={<FileText />} title={`${g.title}: progress report (draft)`} subtitle="Every figure links to its indicator" action={<Badge tone="ai">AI draft · needs review</Badge>} />
          <CardBody className="space-y-3 text-[14px]">
            <p>During this period CodeBrave continued delivery across {d.schools.filter((s) => s.status === "Active").length} partner schools and the active Future Builders cohort.</p>
            <ul className="space-y-1">{inds.filter((i) => g.indicatorIds.includes(i.id)).map((i) => <li key={i.id}>• {i.name}: <b>{i.current}{i.unit === "%" ? "%" : ""}</b> against a target of {i.target}{i.unit === "%" ? "%" : ""} <Badge tone="outline">{i.code}</Badge></li>)}</ul>
            <p className="text-muted">Story: {d.evidence.find((e) => e.consent === "Consented")?.excerpt}</p>
            <div className="flex gap-2 pt-2"><Button variant="secondary" onClick={() => toast({ tone: "success", title: "Figures verified", body: "M&E confirmed every figure against its source." })}><Check /> Verify figures (M&E)</Button><Button onClick={sendForApproval}><Send /> Send for approval</Button></div>
          </CardBody>
        </Card>
      )}
    </Workspace>
  );
}
