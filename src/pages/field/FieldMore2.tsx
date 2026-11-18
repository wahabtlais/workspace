import { useState } from "react";
import { CloudOff, RefreshCw, Wifi } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SegmentBar, SessionTracker } from "@/components/assessment/SessionTracker";
import { pupilAttendanceAccess } from "@/config/access";
import { useDemo } from "@/store/demoStore";
import { useData, usePersona } from "@/store/hooks";
import { subjectNamer } from "@/lib/names";
import { formatDate } from "@/lib/utils";
import { mySchoolIds } from "./FieldMore";

export function FieldForms() {
  const d = useData();
  const p = usePersona();
  const ids = mySchoolIds(d, p);
  const sessions = d.assessmentSessions.filter((s) => (s.status === "Live" || s.status === "Reconciling") && (p.role === "su_trainer" ? s.audience === "tf" : !!s.schoolId && ids.includes(s.schoolId)));
  const [sel, setSel] = useState<string | null>(null);
  const nameFor = subjectNamer(d, { pupilsAsCodes: pupilAttendanceAccess(p).level !== "individual" });
  if (sel) return <><button className="text-[13px] text-muted" onClick={() => setSel(null)}>← Forms</button><SessionTracker sessionId={sel} nameFor={nameFor} /></>;
  const label = (s: (typeof sessions)[number]) => { const c = d.classes.find((x) => x.id === s.classId); return c ? `${d.schools.find((x) => x.id === s.schoolId)?.name.split(" ")[0]} · Grade ${c.grade}-${c.section}` : s.title; };
  return (
    <>
      <h1 className="text-[22px] font-semibold">Assessment forms</h1>
      {sessions.length === 0 && <Card className="p-5 text-[14px] text-muted">No live assessments in your schools.</Card>}
      {sessions.map((s) => <button key={s.id} className="block w-full text-left" onClick={() => setSel(s.id)}><Card className="p-4"><div className="flex items-center justify-between"><p className="font-semibold">{label(s)}</p><Badge tone={s.status === "Live" ? "info" : "warning"}>{s.status}</Badge></div><p className="text-[12px] text-muted">{s.title}</p><div className="mt-2"><SegmentBar entries={s.entries} /></div></Card></button>)}
      <Card className="p-4 text-[13px]"><p className="font-semibold">School Needs Assessment</p><p className="text-muted">For the Almond Valley meeting on {formatDate("2026-11-23")}. Downloaded for offline use.</p></Card>
    </>
  );
}

export function FieldSync() {
  const offline = useDemo((s) => s.offline);
  const queue = useDemo((s) => s.syncQueue);
  const setOffline = useDemo((s) => s.setOffline);
  const syncNow = useDemo((s) => s.syncNow);
  return (
    <>
      <h1 className="text-[22px] font-semibold">Sync</h1>
      <Card className="p-5 text-center">
        {offline ? <CloudOff className="mx-auto size-10 text-amber-600" /> : <Wifi className="mx-auto size-10 text-emerald-600" />}
        <p className="mt-2 font-semibold">{offline ? "Offline" : "Online"}</p>
        <p className="text-[13px] text-muted">{queue.length ? `${queue.length} item${queue.length > 1 ? "s" : ""} saved on this phone` : "Everything is synced"}</p>
        <div className="mt-4 grid gap-2">
          <Button variant="secondary" className="h-11" onClick={() => setOffline(!offline)}>{offline ? "Reconnect (simulated)" : "Go offline (simulated)"}</Button>
          <Button className="h-11" disabled={offline || !queue.length} onClick={() => syncNow()}><RefreshCw /> Sync now</Button>
        </div>
      </Card>
      {queue.map((q) => <Card key={q.id} className="flex items-center justify-between p-3 text-[13px]"><span>{q.label}<span className="block text-[11px] text-muted">{q.kind} · saved {q.queuedAt.slice(11, 16)}</span></span><Badge tone={q.status === "syncing" ? "info" : "warning"}>{q.status === "syncing" ? "Syncing" : "Waiting"}</Badge></Card>)}
    </>
  );
}
