import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/misc";
import { Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData, useLookup } from "@/store/hooks";
import { formatDate, uid } from "@/lib/utils";
import { useLiveIndicators } from "@/lib/indicators";
import { cn } from "@/lib/utils";

export function Risks() {
  const d = useData();
  const L = useLookup();
  const update = useDemo((s) => s.update);
  const [title, setTitle] = useState("");
  const cell = (l: number, i: number) => d.risks.filter((r) => r.likelihood === l && r.impact === i && r.status !== "Closed");
  const add = () => { update((x) => { x.risks.unshift({ id: uid("rsk"), title, area: "Organization", likelihood: 4, impact: 3, ownerId: "s-rana", mitigation: "To be defined", status: "Open" }); }); toast({ tone: "success", title: "Risk added", body: "It will appear on the next management meeting agenda." }); setTitle(""); };
  return (
    <Workspace area="executive" title="Risks & issues" description="Risk register with likelihood, impact, owner and mitigation.">
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit"><CardHeader title="Heat map" subtitle="Likelihood (rows, 5 at top) × impact (columns)" /><CardBody>
          <div className="grid grid-cols-5 gap-1">{[5, 4, 3, 2, 1].flatMap((l) => [1, 2, 3, 4, 5].map((i) => { const n = cell(l, i).length; const sc = l * i; return <div key={`${l}${i}`} title={`Likelihood ${l} × impact ${i}: ${n} risk(s)`} className={cn("flex aspect-square items-center justify-center rounded text-[12px] font-semibold", sc >= 15 ? "bg-red-200" : sc >= 8 ? "bg-amber-100" : "bg-emerald-50", n ? "text-fg ring-2 ring-fg/50" : "text-transparent")}>{n || "·"}</div>; }))}</div>
        </CardBody></Card>
        <div className="space-y-3">
          <Card className="flex gap-2 p-3"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Describe a new risk…" aria-label="New risk" /><Button disabled={!title.trim()} onClick={add}><Plus /> Add risk</Button></Card>
          {d.risks.map((r) => <Card key={r.id} className="p-4"><div className="flex flex-wrap items-center gap-2"><p className="flex-1 font-medium">{r.title}</p><Badge tone={r.likelihood * r.impact >= 12 ? "danger" : "warning"}>L{r.likelihood} × I{r.impact}</Badge><StatusBadge status={r.status} /></div><p className="mt-1 text-[13px] text-muted">{r.area} · owner {L.person(r.ownerId)} · mitigation: {r.mitigation}</p></Card>)}
        </div>
      </div>
    </Workspace>
  );
}

export function Meetings() {
  const d = useData();
  const L = useLookup();
  const update = useDemo((s) => s.update);
  const inds = useLiveIndicators();
  const liveAgenda = [
    ...d.decisions.filter((x) => x.status === "Pending").map((x) => ({ item: `Decide: ${x.title}`, source: "Decisions" })),
    ...d.risks.filter((r) => r.status !== "Closed" && r.likelihood * r.impact >= 12).map((r) => ({ item: `Risk: ${r.title}`, source: "Risks" })),
    ...inds.filter((i) => i.live && i.current < i.target * 0.95).map((i) => ({ item: `Off track: ${i.name} (${i.current} vs ${i.target})`, source: "Indicators" })),
  ];
  return (
    <Workspace area="executive" title="Meetings" description="Agendas built automatically from open risks, pending decisions and off-track indicators. Minutes create follow-up tasks.">
      {d.meetings.map((m) => (
        <Card key={m.id}><CardHeader title={`${m.title} · ${formatDate(m.date, { weekday: "long", day: "numeric", month: "long" })}`} subtitle={m.attendees.map((a) => L.person(a).split(" ")[0]).join(", ")} action={<StatusBadge status={m.status} />} />
          <CardBody className="grid gap-4 lg:grid-cols-3">
            <div><p className="mb-1 text-[12px] font-semibold uppercase text-subtle">Agenda</p>{(m.status === "Upcoming" ? liveAgenda : m.agenda).map((a) => <p key={a.item} className="text-[13px]">• {a.item} <Badge tone="outline" className="ml-1">{a.source}</Badge></p>)}</div>
            <div><p className="mb-1 text-[12px] font-semibold uppercase text-subtle">Decisions</p>{m.decisions.length ? m.decisions.map((x) => <p key={x} className="text-[13px]">• {x}</p>) : <p className="text-[13px] text-muted">To be recorded in the meeting.</p>}</div>
            <div><p className="mb-1 text-[12px] font-semibold uppercase text-subtle">Follow-ups</p>{m.followUps.length ? m.followUps.map((f, i) => <label key={f.text} className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={f.done} className="accent-brand-600" onChange={() => update((x) => { const ff = x.meetings.find((y) => y.id === m.id)!.followUps[i]; ff.done = !ff.done; })} />{f.text} <span className="text-muted">· {L.person(f.ownerId)}</span></label>) : <p className="text-[13px] text-muted">None yet.</p>}</div>
          </CardBody>
        </Card>
      ))}
    </Workspace>
  );
}
