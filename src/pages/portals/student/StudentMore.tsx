import { Briefcase, Send, Users } from "lucide-react";
import type { PortfolioItem } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData, useLookup } from "@/store/hooks";
import { PATHWAY_LABEL } from "@/data/seed/fb";
import { formatDate, uid } from "@/lib/utils";
import { useMe } from "./StudentLearning";

export function TeamProject() {
  const d = useData();
  const me = useMe();
  const L = useLookup();
  const team = d.teams.find((t) => t.id === me.teamId);
  const p = d.projects.find((x) => x.id === team?.projectId);
  if (!team || !p) return <Card className="p-8 text-center text-muted">You’re not on a team yet.</Card>;
  return (
    <div className="space-y-4">
      <div><h1 className="text-[24px] font-semibold">{p.title}</h1><p className="text-[13px] text-muted">{team.name} · {p.clientId ? `Client: ${L.orgs.get(p.clientId)?.name}` : "Team project"}</p></div>
      <Card className="p-4"><p className="text-[13px] text-muted">{p.summary}</p><div className="mt-3 flex flex-wrap items-center gap-2"><Users className="size-4 text-muted" />{team.memberIds.map((m) => <Badge key={m} tone="outline">{d.students.find((s) => s.id === m)?.firstName}</Badge>)}</div><p className="mt-2 text-[11px] text-subtle">Teammates appear by first name only.</p></Card>
      <Card><CardHeader title="Milestones" /><CardBody className="space-y-2">{p.milestones.map((m) => <div key={m.id} className="flex items-center justify-between gap-2 rounded-lg border border-line p-3"><span><span className="block font-medium">{m.title}</span><span className="text-[12px] text-muted">Due {formatDate(m.due)}</span>{m.feedback && <span className="block text-[12px] text-muted">Feedback: {m.feedback}</span>}</span><StatusBadge status={m.status} /></div>)}</CardBody></Card>
    </div>
  );
}

const VIS: PortfolioItem["visibility"][] = ["Private", "Cohort", "Shared with host", "Public"];
export function Portfolio() {
  const d = useData();
  const me = useMe();
  const update = useDemo((s) => s.update);
  const items = d.portfolio.filter((x) => x.studentId === me.id);
  const setVis = (id: string, v: PortfolioItem["visibility"]) => {
    if ((v === "Shared with host" && !me.consent.portfolioSharing) || (v === "Public" && !me.consent.media)) { toast({ tone: "danger", title: "Needs consent", body: "Your guardian hasn’t agreed to this kind of sharing yet." }); return; }
    update((x) => { x.portfolio.find((y) => y.id === id)!.visibility = v; });
    toast({ tone: "success", title: `Visibility: ${v}` });
  };
  const addReflection = () => { update((x) => { x.portfolio.push({ id: uid("pf"), studentId: me.id, title: "Reflection: what I learned this week", kind: "Reflection", visibility: "Private", endorsed: false, addedAt: "2026-11-17" }); }); toast({ tone: "success", title: "Reflection added (private)" }); };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2"><div><h1 className="text-[24px] font-semibold">My portfolio</h1><p className="text-[13px] text-muted">You decide who sees each item.</p></div><Button variant="secondary" onClick={addReflection}>Add reflection</Button></div>
      {items.map((it) => (
        <Card key={it.id} className="p-4"><div className="flex flex-wrap items-center gap-3"><div className="flex-1"><p className="font-semibold">{it.title}</p><p className="text-[12px] text-muted">{it.kind} · added {formatDate(it.addedAt)}{it.endorsed && " · endorsed by your trainer"}</p></div>
          <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Visibility">{VIS.map((v) => <button key={v} role="radio" aria-checked={it.visibility === v} onClick={() => setVis(it.id, v)} className={`rounded-full border px-2.5 py-1 text-[12px] ${it.visibility === v ? "border-fb bg-fb-50 font-medium text-fb" : "border-line text-muted"}`}>{v}</button>)}</div></div></Card>
      ))}
    </div>
  );
}

export function Career() {
  const d = useData();
  const me = useMe();
  const L = useLookup();
  const update = useDemo((s) => s.update);
  const openings = d.openings.filter((o) => o.pathway === me.pathway && o.status !== "Filled");
  const apply = (oid: string, title: string) => {
    update((x) => { x.placements.push({ id: uid("pl"), openingId: oid, studentId: me.id, stage: "Shortlisted", checkIns: [] }); });
    useDemo.getState().addInbox({ toRole: "fb_po", kind: "task", title: `Internship application: ${me.name}`, detail: title, link: "/future-builders/internships", source: "Student Portal" });
    toast({ tone: "success", title: "Application sent", body: "Your Project Officer will review it. Hosts only see what you and your guardian agree to share." });
  };
  return (
    <div className="space-y-4">
      <h1 className="text-[24px] font-semibold">Career & internships</h1>
      <Card className="p-4"><p className="font-medium">Career readiness: {me.readiness}%</p><Progress value={me.readiness} className="mt-2" /><p className="mt-2 text-[12px] text-muted">Next step: book a mock interview with your mentor, {L.person(me.mentorId)}.</p></Card>
      {openings.map((o) => { const pl = d.placements.find((p) => p.openingId === o.id && p.studentId === me.id); return (
        <Card key={o.id} className="p-4"><div className="flex flex-wrap items-center gap-3"><Briefcase className="size-5 text-fb" /><div className="flex-1"><p className="font-semibold">{o.title}</p><p className="text-[12px] text-muted">{L.orgs.get(o.hostId)?.name} · {PATHWAY_LABEL[o.pathway]} · from {formatDate(o.start)}</p></div>
          {pl ? <StatusBadge status={pl.stage} /> : <Button onClick={() => apply(o.id, o.title)}><Send /> Apply</Button>}</div></Card>
      ); })}
    </div>
  );
}
