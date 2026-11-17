import { useState } from "react";
import { CloudOff } from "lucide-react";
import type { Visit } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/misc";
import { DialogClose, DialogContent } from "@/components/ui/overlay";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { addDays, DEMO_TODAY, formatDate, uid } from "@/lib/utils";
import { cn } from "@/lib/utils";

const RUBRIC = ["Lesson objectives are clear to pupils", "Pupils are actively engaged with devices", "Classroom routines are managed well", "Teacher checks understanding during the lesson"];

export function ObservationDialog({ visit, onClose }: { visit: Visit; onClose: () => void }) {
  const L = useLookup();
  const offline = useDemo((s) => s.offline);
  const [scores, setScores] = useState<number[]>(RUBRIC.map(() => 0));
  const [notes, setNotes] = useState("");
  const done = scores.every((s) => s > 0);
  const avg = done ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
  const submit = () => {
    const { update, enqueue, addInbox } = useDemo.getState();
    const tfName = L.person(visit.tfId);
    update((d) => {
      const v = d.visits.find((x) => x.id === visit.id)!;
      v.status = "Completed"; v.score = avg; v.notes = notes; v.pendingSync = offline;
      if (avg < 2.5) d.followUps.unshift({ id: uid("fu"), title: `Coaching plan: ${tfName}`, program: "SU", schoolId: visit.schoolId, tfId: visit.tfId, ownerId: visit.officerId, due: addDays(DEMO_TODAY, 5), status: "Open", source: `Observation score ${avg} / 4 on ${formatDate(DEMO_TODAY)}`, createdAt: DEMO_TODAY });
    });
    if (offline) enqueue({ kind: "observation", label: `Observation: ${L.schools.get(visit.schoolId)?.name}`, refId: visit.id });
    if (avg < 2.5) {
      addInbox({ toRole: "su_po", kind: "task", title: `Coaching plan for ${tfName}`, detail: `Observation ${avg} / 4 · scores below 2.5 create a coaching task`, link: "/school-upskilling/follow-ups", source: "Observation rule", priority: "high" });
      toast({ tone: "warning", title: "Coaching task created", body: `Score ${avg} / 4 is below 2.5. A follow-up was added to the board.` });
    }
    toast(offline ? { tone: "warning", title: "Observation saved on this device", body: "It will sync when you reconnect." } : { tone: "success", title: "Observation submitted", body: `Average ${avg} / 4` });
    onClose();
  };
  return (
    <DialogContent wide title="Classroom observation" description={`${L.schools.get(visit.schoolId)?.name} · ${L.person(visit.tfId)} · rubric from the Assessment Hub`}
      footer={<>{offline && <Badge tone="warning" className="mr-auto"><CloudOff /> Offline: will sync later</Badge>}<DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose><Button disabled={!done} onClick={submit}>Submit observation</Button></>}>
      <div className="space-y-4">
        {RUBRIC.map((r, i) => (
          <div key={r}>
            <p className="text-[14px] font-medium">{r}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {["Beginning", "Developing", "Proficient", "Excellent"].map((lvl, j) => (
                <button key={lvl} onClick={() => setScores((s) => s.map((v, k) => (k === i ? j + 1 : v)))} className={cn("rounded-lg border px-2 py-2 text-[12px]", scores[i] === j + 1 ? "border-brand-500 bg-brand-50 font-semibold text-brand-700" : "border-line text-muted hover:border-line-strong")}>{j + 1} · {lvl}</button>
              ))}
            </div>
          </div>
        ))}
        <div><p className="text-[14px] font-medium">Notes</p><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What went well, what to work on…" className="mt-2" /></div>
        {done && <p className={cn("rounded-lg px-3 py-2 text-[13px]", avg < 2.5 ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-800")}>Average {avg} / 4{avg < 2.5 ? " · a coaching follow-up will be created automatically" : ""}</p>}
      </div>
    </DialogContent>
  );
}

export function PlanVisit({ onClose }: { onClose: () => void }) {
  const d = useData();
  const persona = usePersona();
  const update = useDemo((s) => s.update);
  const [schoolId, setSchool] = useState(d.schools[0].id);
  const [date, setDate] = useState(addDays(DEMO_TODAY, 2));
  const [purpose, setPurpose] = useState<Visit["purpose"]>("Classroom observation");
  const save = () => {
    const s = d.schools.find((x) => x.id === schoolId)!;
    update((x) => { x.visits.push({ id: uid("vis"), schoolId, date, officerId: persona.staffId ?? s.poId, tfId: d.tfs.find((t) => t.schoolId === schoolId)?.id, purpose, status: "Planned" }); });
    toast({ tone: "success", title: "Visit planned", body: `${s.name} · ${formatDate(date)}. Added to the calendar.` });
    onClose();
  };
  const field = "mt-1 h-9 w-full rounded-lg border border-line px-2 text-[13px] font-normal";
  return (
    <DialogContent title="Plan a visit" footer={<><DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose><Button onClick={save}>Plan visit</Button></>}>
      <div className="space-y-3">
        <label className="block text-[13px] font-medium">School<select className={field} value={schoolId} onChange={(e) => setSchool(e.target.value)}>{d.schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label className="block text-[13px] font-medium">Date<input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="block text-[13px] font-medium">Purpose<select className={field} value={purpose} onChange={(e) => setPurpose(e.target.value as Visit["purpose"])}>{["Classroom observation", "Coaching check-in", "School meeting", "Equipment check"].map((p) => <option key={p}>{p}</option>)}</select></label>
      </div>
    </DialogContent>
  );
}
