import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import type { Curriculum, CurriculumVersion, LessonPlan } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DialogClose, DialogContent } from "@/components/ui/overlay";
import { useData } from "@/store/hooks";
import { addLesson } from "@/store/actions";

const STEPS = ["Reading the objective and competency", "Checking existing lessons in this module", "Drafting activities and timing", "Aligning the assessment to the objective"];

function draftPlan(objective: string, title: string): LessonPlan {
  return {
    objectives: `By the end of the lesson, learners can: ${objective.toLowerCase()}.`,
    activities: [`Warm-up (10 min): a real example related to “${title}”.`, "Guided practice (20 min): pairs work through a structured task with a checklist.", "Independent build (20 min): learners apply the idea to their own mini-project.", "Share & reflect (10 min): two pairs present; class names one improvement."],
    materials: "Slides, starter files, one device per pair, printed checklist.",
    differentiation: "Extension challenge for fast finishers; partially completed starter for learners who need support.",
    assessment: "Exit ticket with 3 questions tagged to the objective; trainer checks the checklist during practice.",
  };
}

export function AIDraftLesson({ cur, ver, onClose }: { cur: Curriculum; ver: CurriculumVersion; onClose: () => void }) {
  const d = useData();
  const objectives = d.objectives.filter((o) => o.collection === cur.collection);
  const [moduleId, setModule] = useState(ver.modules[0]?.id);
  const [objId, setObj] = useState(objectives[0]?.id);
  const [title, setTitle] = useState("Practice lesson");
  const [step, setStep] = useState(-1);
  const obj = objectives.find((o) => o.id === objId)!;
  const plan = step >= STEPS.length ? draftPlan(obj.text, title) : null;
  const run = () => { setStep(0); STEPS.forEach((_, i) => window.setTimeout(() => setStep(i + 1), 500 * (i + 1))); };
  const field = "mt-1 h-9 w-full rounded-lg border border-line px-2 text-[13px] font-normal";
  return (
    <DialogContent wide title={<span className="inline-flex items-center gap-2"><Sparkles className="size-4 text-ai-600" />Draft a lesson with AI</span>} description="Curriculum Agent drafts a lesson aligned to an objective. You review and edit it; nothing is published automatically."
      footer={<><DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>{plan ? <Button onClick={() => { addLesson(cur.id, ver.id, moduleId, { title, minutes: 60, objectiveIds: [objId], aiDrafted: true, plan }); onClose(); }}><Check /> Add to draft</Button> : <Button variant="ai" disabled={step >= 0} onClick={run}><Sparkles /> Generate draft</Button>}</>}>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-[13px] font-medium">Module<select className={field} value={moduleId} onChange={(e) => setModule(e.target.value)}>{ver.modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select></label>
        <label className="text-[13px] font-medium">Objective<select className={field} value={objId} onChange={(e) => setObj(e.target.value)}>{objectives.map((o) => <option key={o.id} value={o.id}>{o.code} · {o.text}</option>)}</select></label>
        <label className="text-[13px] font-medium">Lesson title<input className={field} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      </div>
      {step >= 0 && (
        <ol className="mt-4 space-y-1">
          {STEPS.map((s, i) => <li key={s} className="flex items-center gap-2 text-[13px] text-muted">{i < step ? <Check className="size-4 text-emerald-600" /> : i === step ? <Loader2 className="size-4 animate-spin text-ai-500" /> : <span className="size-4 rounded-full border border-line-strong" />}{s}</li>)}
        </ol>
      )}
      {plan && (
        <div className="mt-4 space-y-3 rounded-xl border border-ai-200 bg-ai-50/40 p-4 text-[13px] animate-fade-in">
          <div className="flex items-center gap-2"><Badge tone="ai">AI draft · review before use</Badge><Badge tone="outline">{obj.code}</Badge></div>
          <p><b>Objective.</b> {plan.objectives}</p>
          <div><b>Activities</b><ul className="mt-1 list-disc space-y-0.5 ps-5">{plan.activities.map((a) => <li key={a}>{a}</li>)}</ul></div>
          <p><b>Materials.</b> {plan.materials}</p>
          <p><b>Differentiation.</b> {plan.differentiation}</p>
          <p><b>Assessment.</b> {plan.assessment}</p>
        </div>
      )}
    </DialogContent>
  );
}
