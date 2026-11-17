import { useState } from "react";
import { Link } from "react-router";
import { FileText, Loader2, ShieldAlert, Wand2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/misc";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/overlay";
import { Workspace } from "@/components/common/Workspace";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { DEMO_TODAY, formatDate, uid } from "@/lib/utils";

function GenerateDialog({ tplId, onClose }: { tplId: string; onClose: () => void }) {
  const d = useData();
  const persona = usePersona();
  const update = useDemo((s) => s.update);
  const tpl = d.templates.find((t) => t.id === tplId)!;
  const [busy, setBusy] = useState(false);
  const [ctx, setCtx] = useState(tpl.category === "Agreement" ? d.schools[10].name : d.tfs[14].name);
  const gen = () => { setBusy(true); window.setTimeout(() => { update((x) => { x.documents.unshift({ id: uid("dc"), title: `${tpl.name}: ${ctx}`, type: "Google Doc", context: ctx, ownerId: persona.staffId ?? "s-ziad", updatedAt: DEMO_TODAY, access: "Inherits from the source record" }); }); toast({ tone: "success", title: "Document generated", body: "Created as a Google Doc (simulated) and linked to the record." }); onClose(); }, 1200); };
  return (
    <DialogContent title={`Generate: ${tpl.name}`} description="Merge fields are filled from platform data." footer={<><DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose><Button onClick={gen} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Wand2 />} Generate</Button></>}>
      <label className="text-[13px] font-medium">For<input value={ctx} onChange={(e) => setCtx(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-line px-2 text-[13px] font-normal" /></label>
      <p className="mt-3 text-[12px] text-muted">Fields: {tpl.fields.map((f) => <code key={f} className="mr-1 rounded bg-canvas px-1">{`{${f}}`}</code>)}</p>
    </DialogContent>
  );
}

export function Templates() {
  const d = useData();
  const [sel, setSel] = useState<string | null>(null);
  return (
    <Workspace area="knowledge" title="Templates" description="Document templates with merge fields: MoUs, certificates, agreements, reports, letters.">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{d.templates.map((t) => <Card key={t.id} className="p-4"><div className="flex items-center gap-2"><FileText className="size-4 text-muted" /><p className="flex-1 font-medium">{t.name}</p><Badge tone="outline">{t.category}</Badge></div><p className="mt-1 text-[12px] text-muted">{t.fields.length} merge fields · updated {formatDate(t.updatedAt)}</p><Button size="sm" variant="secondary" className="mt-3" onClick={() => setSel(t.id)}><Wand2 /> Generate document</Button></Card>)}</div>
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>{sel && <GenerateDialog tplId={sel} onClose={() => setSel(null)} />}</Dialog>
    </Workspace>
  );
}

export function ReportConcern() {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const submit = () => { useDemo.getState().notify({ toRole: "safeguarding_lead", text: "New safeguarding concern reported", link: "/safeguarding/cases", tone: "danger" }); setSent(true); };
  return (
    <Workspace area="safeguarding" title="Report a concern" description="Anyone can report. Reports go only to designated safeguarding leads and never to AI agents, search or analytics.">
      <Card className="max-w-2xl"><CardHeader icon={<ShieldAlert />} title={sent ? "Thank you. Your report was received." : "What are you worried about?"} subtitle={sent ? "A safeguarding lead will follow up within one working day. If someone is in immediate danger, contact emergency services." : "Describe what you saw or heard. Stick to facts; you do not need to investigate."} />
        <CardBody>{sent ? <Button variant="secondary" onClick={() => { setSent(false); setText(""); }}>Report another concern</Button> : <><Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="What happened, when and where…" /><Button className="mt-3" disabled={!text.trim()} onClick={submit}>Send to safeguarding lead</Button></>}</CardBody>
      </Card>
    </Workspace>
  );
}

export function Cases() {
  const d = useData();
  const L = useLookup();
  return (
    <Workspace area="safeguarding-cases" title="Safeguarding cases" description="Restricted. Every view is logged.">
      <Card><CardBody className="space-y-2 pt-4">{d.safeguardingCases.map((c) => <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3"><span className="font-medium tabular">{c.id}</span><span className="flex-1 text-[13px]">{c.category} · {c.program} · opened {formatDate(c.opened)} · {c.actions} actions · {L.person(c.leadId)}</span><Badge tone={c.status === "Closed" ? "neutral" : "warning"}>{c.status}</Badge></div>)}</CardBody></Card>
      <p className="text-[12px] text-muted"><Link to="/admin/audit" className="underline">Access to this page is recorded in the audit log.</Link></p>
    </Workspace>
  );
}
