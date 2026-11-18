import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ClipboardPen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/misc";
import { useData, useLookup } from "@/store/hooks";
import { submitObservation } from "@/store/suActions";
import { cn } from "@/lib/utils";

const RUBRIC = ["Lesson objectives are clear to pupils", "Pupils are actively engaged with devices", "Classroom routines are managed well", "Teacher checks understanding during the lesson"];

export function FieldVisit() {
  const { id } = useParams();
  const d = useData();
  const L = useLookup();
  const navigate = useNavigate();
  const v = d.visits.find((x) => x.id === id);
  const [scores, setScores] = useState<number[]>(RUBRIC.map(() => 0));
  const [notes, setNotes] = useState("");
  if (!v) return <p>Visit not found.</p>;
  const school = L.schools.get(v.schoolId)!;
  const cls = d.classes.find((c) => c.teacherId === v.tfId && c.schoolId === v.schoolId);
  return (
    <>
      <Link to="/field" className="text-[13px] text-muted">← Today</Link>
      <Card className="p-4"><p className="text-[18px] font-semibold">{school.name}</p><p className="text-[13px] text-muted">{school.region} · principal {school.principal}</p><p className="mt-2 text-[13px]">{v.purpose}{v.tfId ? ` · ${L.person(v.tfId)}` : ""}{cls ? ` · Grade ${cls.grade}-${cls.section} (${cls.pupilIds.length} pupils, ${cls.period})` : ""}</p></Card>
      {v.status !== "Planned" ? <Card className="p-4 text-[14px]">Completed · score {v.score} / 4 {v.pendingSync && <Badge tone="warning">Waiting to sync</Badge>}</Card> : (
        <>
          {RUBRIC.map((r, i) => (
            <Card key={r} className="p-4"><p className="text-[14px] font-medium">{i + 1}. {r}</p>
              <div className="mt-3 grid grid-cols-4 gap-2" role="radiogroup" aria-label={r}>{[1, 2, 3, 4].map((n) => <button key={n} role="radio" aria-checked={scores[i] === n} onClick={() => setScores((s) => s.map((x, k) => (k === i ? n : x)))} className={cn("h-12 rounded-xl border text-[16px] font-semibold", scores[i] === n ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-surface")}>{n}</button>)}</div>
              <p className="mt-1.5 flex justify-between text-[11px] text-subtle"><span>1 · Beginning</span><span>4 · Excellent</span></p>
            </Card>
          ))}
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes: what went well, what to work on" />
          <Button className="h-12 w-full text-[15px]" disabled={scores.some((s) => !s)} onClick={() => { submitObservation(v, scores, notes); navigate("/field"); }}><ClipboardPen /> Submit observation</Button>
        </>
      )}
    </>
  );
}
