import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import type { OpsRequest } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/misc";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/overlay";
import { Workspace } from "@/components/common/Workspace";
import { EmptyState } from "@/components/common/EmptyState";
import { AIAction } from "@/components/shell/AskPanel";
import { RequestCard } from "@/pages/ops/Requests";
import { createRequest } from "@/store/opsActions";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { addDays, DEMO_TODAY, formatDate } from "@/lib/utils";

interface Ev { date: string; time?: string; title: string; kind: string }

export function Calendar() {
  const d = useData();
  const p = usePersona();
  const L = useLookup();
  const sid = p.staffId;
  const evs: Ev[] = [
    ...d.visits.filter((v) => v.officerId === sid && v.date >= DEMO_TODAY).map((v) => ({ date: v.date, title: `${v.purpose}: ${L.schools.get(v.schoolId)?.name}`, kind: "Visit" })),
    ...d.trainingSessions.filter((s) => s.trainerId === sid || p.role === "su_pm").filter((s) => s.date >= DEMO_TODAY).map((s) => ({ date: s.date, time: s.time, title: `TF training: ${s.title}`, kind: "Training" })),
    ...d.fbSessions.filter((s) => s.leadId === sid || p.role === "fb_pm").filter((s) => s.date >= DEMO_TODAY).map((s) => ({ date: s.date, time: s.time, title: `${s.type}: ${s.title}`, kind: "FB session" })),
    ...d.meetings.filter((m) => m.attendees.includes(sid ?? "") && m.date >= DEMO_TODAY).map((m) => ({ date: m.date, time: "10:00", title: m.title, kind: "Meeting" })),
    ...d.obligations.filter((o) => o.ownerId === sid && o.status !== "Submitted").map((o) => ({ date: o.due, title: `Due: ${o.title}`, kind: "Deadline" })),
    ...d.leave.filter((l) => l.staffId === sid).map((l) => ({ date: l.from, title: `Leave (${l.type})`, kind: "Leave" })),
  ].filter((e) => e.date <= addDays(DEMO_TODAY, 45)).sort((a, b) => a.date.localeCompare(b.date));
  const days = [...new Set(evs.map((e) => e.date))];
  return (
    <Workspace area="calendar" title="My calendar" description="Sessions, visits, trainings, meetings, deadlines and leave from every workspace. Synced with Google Calendar (simulated).">
      {days.length === 0 ? <EmptyState icon={<CalendarDays />} title="Nothing scheduled in the next six weeks" /> : days.map((day) => (
        <Card key={day}><CardHeader title={formatDate(day, { weekday: "long", day: "numeric", month: "long" })} /><CardBody className="space-y-1.5">
          {evs.filter((e) => e.date === day).map((e, i) => <div key={i} className="flex items-center gap-3 text-[14px]"><span className="w-24 text-[12px] text-muted tabular">{e.time ?? "All day"}</span><span className="flex-1">{e.title}</span><Badge tone="outline">{e.kind}</Badge></div>)}
        </CardBody></Card>
      ))}
    </Workspace>
  );
}

function NewRequest({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<OpsRequest["type"]>("Equipment");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState<number | undefined>();
  return (
    <DialogContent title="New request" description="Choose a type; the approval chain is set automatically." footer={<><DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose><Button disabled={!title.trim()} onClick={() => { createRequest(type, title, details, amount); onClose(); }}>Submit</Button></>}>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">{(["Leave", "Equipment", "Travel", "Purchase", "General"] as const).map((t) => <button key={t} onClick={() => setType(t)} className={`rounded-full border px-3 py-1 text-[13px] ${type === t ? "border-brand-400 bg-brand-50 text-brand-700" : "border-line text-muted"}`}>{t}</button>)}</div>
        <label className="block text-[13px] font-medium">What do you need?<Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === "Leave" ? "Annual leave, 2 days (3–4 Dec)" : "Laptop for the new trainer"} /></label>
        {(type === "Purchase" || type === "Equipment" || type === "Travel") && <label className="block text-[13px] font-medium">Estimated cost (USD)<Input className="mt-1" type="number" value={amount ?? ""} onChange={(e) => setAmount(Number(e.target.value) || undefined)} /></label>}
        <label className="block text-[13px] font-medium">Details<Textarea className="mt-1" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} /></label>
      </div>
    </DialogContent>
  );
}

export function MyRequests() {
  const d = useData();
  const p = usePersona();
  const [open, setOpen] = useState(false);
  const mine = d.requests.filter((r) => r.requesterId === p.staffId);
  return (
    <Workspace area="requests" title="My requests" description="Requests you made and where each one is in its approval chain."
      actions={<Button onClick={() => setOpen(true)}><Plus /> New request</Button>} aiActions={<AIAction label="Fill a request from a sentence" prompt="I need a laptop for the new trainer next week" />}>
      {mine.length === 0 ? <EmptyState title="You have no requests" body="Use “New request”, or ask Ask CodeBrave in your own words." /> : mine.map((r) => <RequestCard key={r.id} r={r} canAct={false} />)}
      <Dialog open={open} onOpenChange={setOpen}>{open && <NewRequest onClose={() => setOpen(false)} />}</Dialog>
    </Workspace>
  );
}
