import { useState } from "react";
import { Check, Lock, Undo2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/misc";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData, usePersona } from "@/store/hooks";
import { decideMilestone } from "@/store/fbActions";
import { DEMO_TODAY, formatDate } from "@/lib/utils";

export function ClientMilestones() {
  const d = useData();
  const p = usePersona();
  const project = d.projects.find((x) => x.clientId === p.scope.orgId);
  const [fb, setFb] = useState("");
  if (!project) return null;
  return (
    <div className="space-y-4">
      <h1 className="text-[24px] font-semibold">Milestones</h1>
      {project.milestones.map((m) => (
        <Card key={m.id} className="p-4">
          <div className="flex flex-wrap items-center gap-2"><p className="flex-1 font-semibold">{m.title}</p><span className="text-[12px] text-muted">Due {formatDate(m.due)}</span><StatusBadge status={m.status === "Submitted" ? "In review" : m.status} /></div>
          {m.status === "Submitted" && <div className="mt-3 space-y-2"><p className="text-[13px] text-muted">The team submitted this milestone for your sign-off.</p><Textarea rows={2} value={fb} onChange={(e) => setFb(e.target.value)} placeholder="Feedback for the team (optional)" /><div className="flex gap-2"><Button variant="success" onClick={() => decideMilestone(project.id, m.id, "Approved", fb || "Looks great, approved.")}><Check /> Sign off</Button><Button variant="secondary" onClick={() => decideMilestone(project.id, m.id, "Changes requested", fb || "Please adjust before sign-off.")}><Undo2 /> Request changes</Button></div></div>}
          {m.feedback && m.status !== "Submitted" && <p className="mt-2 text-[13px] text-muted">Your feedback: {m.feedback}</p>}
        </Card>
      ))}
    </div>
  );
}

export function ClientFeedback() {
  const [sent, setSent] = useState(false);
  return (
    <Card className="max-w-xl"><CardHeader title="Project feedback" subtitle="Shared with the Future Builders team and the student team" /><CardBody>{sent ? <p className="text-[14px]">Thank you. Your feedback was shared with the team.</p> : <><Textarea rows={4} placeholder="How is the project going for you?" /><Button className="mt-3" onClick={() => { setSent(true); toast({ tone: "success", title: "Feedback sent" }); }}>Send feedback</Button></>}</CardBody></Card>
  );
}

export function HostOpenings() {
  const d = useData();
  const p = usePersona();
  return (
    <div className="space-y-3">
      <h1 className="text-[24px] font-semibold">Openings</h1>
      {d.openings.filter((o) => o.hostId === p.scope.orgId).map((o) => <Card key={o.id} className="flex items-center justify-between p-4"><span><span className="block font-semibold">{o.title}</span><span className="text-[12px] text-muted">{o.seats} seats · from {formatDate(o.start)}</span></span><StatusBadge status={o.status} /></Card>)}
    </div>
  );
}

export function HostCandidates() {
  const d = useData();
  const p = usePersona();
  const openings = d.openings.filter((o) => o.hostId === p.scope.orgId);
  const shared = d.placements.filter((pl) => openings.some((o) => o.id === pl.openingId) && !["Shortlisted", "Completed"].includes(pl.stage));
  return (
    <div className="space-y-4">
      <h1 className="text-[24px] font-semibold">Candidates</h1>
      <p className="inline-flex items-center gap-1.5 text-[13px] text-muted"><Lock className="size-3.5" /> First names and consented portfolio items only. No contact details, grades or school records.</p>
      {shared.length === 0 && <Card className="p-6 text-[13px] text-muted">No candidates shared yet.</Card>}
      {shared.map((pl) => { const s = d.students.find((x) => x.id === pl.studentId)!; const items = d.portfolio.filter((x) => x.studentId === s.id && x.visibility === "Shared with host"); return (
        <Card key={pl.id} className="p-4"><div className="flex flex-wrap items-center gap-2"><p className="flex-1 font-semibold">{s.firstName}</p><Badge tone="outline">{d.openings.find((o) => o.id === pl.openingId)?.title}</Badge><StatusBadge status={pl.stage} /></div>
          <p className="mt-2 text-[12px] font-medium text-muted">Shared portfolio</p>{items.length ? items.map((it) => <p key={it.id} className="text-[13px]">• {it.title}{it.endorsed && <Badge tone="success" className="ml-2">Trainer endorsed</Badge>}</p>) : <p className="text-[13px] text-muted">No items shared yet.</p>}
        </Card>
      ); })}
    </div>
  );
}

export function HostInterns() {
  const d = useData();
  const p = usePersona();
  const update = useDemo((s) => s.update);
  const openings = d.openings.filter((o) => o.hostId === p.scope.orgId);
  const interns = d.placements.filter((pl) => openings.some((o) => o.id === pl.openingId) && ["Placed", "Completed"].includes(pl.stage));
  const [note, setNote] = useState("");
  const submit = (id: string) => { update((x) => { x.placements.find((y) => y.id === id)!.checkIns.push({ date: DEMO_TODAY, by: p.name, note, rating: 4 }); }); setNote(""); toast({ tone: "success", title: "Check-in submitted", body: "The Project Officer was notified." }); };
  return (
    <div className="space-y-4">
      <h1 className="text-[24px] font-semibold">Interns & check-ins</h1>
      {interns.map((pl) => { const s = d.students.find((x) => x.id === pl.studentId)!; return (
        <Card key={pl.id} className="p-4"><div className="flex items-center gap-2"><p className="flex-1 font-semibold">{s.firstName}</p><StatusBadge status={pl.stage} /></div>
          {pl.checkIns.map((c) => <p key={c.date + c.note} className="mt-1 text-[13px] text-muted">{formatDate(c.date)} · {c.note} · {c.rating}/5</p>)}
          {pl.stage === "Placed" && <div className="mt-3 flex gap-2"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Check-in note" className="h-9 flex-1 rounded-lg border border-line px-3 text-[13px]" aria-label="Check-in note" /><Button disabled={!note} onClick={() => submit(pl.id)}>Submit check-in</Button></div>}
        </Card>
      ); })}
      {interns.length === 0 && <Card className="p-6 text-[13px] text-muted">No current interns.</Card>}
    </div>
  );
}
