import { Sparkles, ShieldCheck } from "lucide-react";
import type { SchoolClass } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarList } from "@/ai/AIMessage";
import { useData } from "@/store/hooks";
import { useUI } from "@/store/uiStore";
import { attendanceRate } from "@/lib/metrics";

/** Class-level learning profile from aggregated results, feedback and observations. Never labels individual pupils. */
export function ClassLearningProfile({ cls }: { cls: SchoolClass }) {
  const d = useData();
  const setAsk = useUI((s) => s.setAsk);
  const session = d.assessmentSessions.find((s) => s.classId === cls.id && s.phase === "pre" && s.academicYear === "2026–27");
  const scores = session?.entries.filter((e) => e.status === "submitted" && e.score !== undefined).map((e) => e.score!) ?? [];
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const bands = [{ label: "Below 40", value: scores.filter((s) => s < 40).length }, { label: "40–69", value: scores.filter((s) => s >= 40 && s < 70).length }, { label: "70 and above", value: scores.filter((s) => s >= 70).length }];
  const prev = d.pupilResults.find((r) => r.classId === cls.id && r.academicYear === "2025–26");
  const obs = d.visits.filter((v) => v.classId === cls.id || (v.schoolId === cls.schoolId && v.tfId === cls.teacherId)).filter((v) => v.notes).slice(-2);
  const att = attendanceRate(d.registers.filter((r) => r.kind === "pupil" && r.contextId === cls.id));
  const level = avg === null ? "Not enough data yet" : avg < 50 ? "Start at foundation level" : avg < 70 ? "Grade-level, with scaffolding" : "Grade-level, with extension tasks";
  return (
    <Card className="border-ai-200">
      <CardHeader icon={<Sparkles className="text-ai-600" />} title="Class learning profile" subtitle="Suggested by AI from aggregated class results, teacher feedback and observations · Simulated AI"
        action={<button className="text-[13px] text-ai-700 hover:underline" onClick={() => setAsk(true, `Grade ${cls.grade}-${cls.section}`, "Recommend differentiated activities")}>Ask for activities</button>} />
      <CardBody className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-[12px] text-muted">Pre-assessment 2026–27 · {scores.length} saved submissions</p>
          <p className="mt-1 text-[22px] font-semibold tabular">{avg ?? "—"}<span className="text-[13px] font-normal text-muted"> class average{prev?.postAvg ? ` · last year's class ended at ${prev.postAvg}` : ""}</span></p>
          <div className="mt-3"><BarList data={bands} /></div>
          <p className="mt-2 text-[11.5px] text-muted">Number of pupils per score band. Attendance this term: {att}%.</p>
        </div>
        <div className="space-y-2 text-[13px]">
          <p><span className="font-semibold">Suggested difficulty: </span>{level}.</p>
          <p><span className="font-semibold">Scaffolding: </span>{avg !== null && avg < 60 ? "Picture cards for block names, worked examples before independent tasks, and pair roles so every pupil handles a device." : "Short worked example, then pairs; keep a challenge card ready for pairs who finish early."}</p>
          <p><span className="font-semibold">Reinforce: </span>Ordering a sequence (pre/post item 4) was the weakest item across classes; revisit it in the next two lessons.</p>
          {obs.length > 0 && <p className="text-muted"><span className="font-semibold text-fg">From observations: </span>{obs.map((v) => v.notes).join(" ")}</p>}
          <div className="flex items-start gap-1.5 rounded-lg bg-ai-50/60 px-3 py-2 text-[12px] text-ai-900"><ShieldCheck className="mt-0.5 size-3.5 shrink-0" />This profile describes the class as a whole. It never assigns ability labels to individual pupils, and any groups suggested are for one lesson only.</div>
          <Badge tone="outline">Teachers decide what to use</Badge>
        </div>
      </CardBody>
    </Card>
  );
}
