import { Link } from "react-router";
import { Check, ChevronRight, MapPin, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/store/demoStore";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { useUI } from "@/store/uiStore";
import { DEMO_TODAY, formatDate } from "@/lib/utils";

export function FieldToday() {
  const d = useData();
  const L = useLookup();
  const p = usePersona();
  const update = useDemo((s) => s.update);
  const setAsk = useUI((s) => s.setAsk);
  const visits = d.visits.filter((v) => v.officerId === p.staffId && (v.date === DEMO_TODAY || (v.status === "Planned" && v.date > DEMO_TODAY))).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const session = p.role === "su_trainer" ? d.trainingSessions.find((s) => s.date === DEMO_TODAY) : undefined;
  const follow = d.followUps.filter((f) => f.ownerId === p.staffId && f.status !== "Done").slice(0, 5);
  return (
    <>
      <div><p className="text-[13px] text-muted">{formatDate(DEMO_TODAY, { weekday: "long", day: "numeric", month: "long" })}</p><h1 className="text-[22px] font-semibold">Good morning, {p.name.split(" ")[0]}</h1></div>
      {session && <Link to="/field/attendance"><Card className="flex items-center gap-3 p-4"><span className="flex size-10 items-center justify-center rounded-xl bg-su-50 text-su"><Check className="size-5" /></span><span className="flex-1"><span className="block font-semibold">Training register due</span><span className="text-[12px] text-muted">{session.title} · {session.time}</span></span><ChevronRight className="size-5 text-subtle" /></Card></Link>}
      {visits.length > 0 && <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">Visits</h2>}
      {visits.map((v) => (
        <Link key={v.id} to={`/field/visit/${v.id}`}>
          <Card className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><MapPin className="size-5" /></span>
            <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{L.schools.get(v.schoolId)?.name}</span><span className="text-[12px] text-muted">{v.date === DEMO_TODAY ? "Today" : formatDate(v.date)} · {v.purpose}{v.tfId ? ` · ${L.person(v.tfId)}` : ""}</span></span>
            {v.status === "Planned" ? <Badge tone="info">To do</Badge> : v.pendingSync ? <Badge tone="warning">Unsynced</Badge> : <Badge tone="success">Done</Badge>}
          </Card>
        </Link>
      ))}
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">Follow-ups</h2>
      {follow.length === 0 && <p className="text-[13px] text-muted">No open follow-ups.</p>}
      {follow.map((f) => (
        <Card key={f.id} className="flex items-center gap-3 p-3">
          <span className="min-w-0 flex-1"><span className="block text-[14px] font-medium">{f.title}</span><span className="text-[12px] text-muted">Due {formatDate(f.due)}</span></span>
          <Button size="sm" variant="secondary" className="h-10" onClick={() => update((x) => { const r = x.followUps.find((y) => y.id === f.id); if (r) r.status = "Done"; })}><Check /> Done</Button>
        </Card>
      ))}
      <Button variant="ai" className="h-11 w-full" onClick={() => setAsk(true, "Field mode", "Draft visit report for Cedar Hill")}><Sparkles /> Draft today’s visit report</Button>
    </>
  );
}
