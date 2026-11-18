import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, Plus, Sparkles } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/misc";
import { Workspace, Segmented } from "@/components/common/Workspace";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData, usePersona } from "@/store/hooks";
import { DEMO_TODAY, uid } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { TYPES } from "./Forms";
import { FormPreview, QTYPES, QuestionCard, type Q, type QType } from "./BuilderParts";

const START: Q[] = [
  { id: "q1", label: "Did the lesson start on time?", type: "Yes / No", options: ["Yes", "No"], required: true },
  { id: "q2", label: "How many minutes late?", type: "Number", options: [], required: true, showIf: { q: "q1", equals: "No" } },
  { id: "q3", label: "Pupil engagement", type: "Scale 1–5", options: [], required: true },
];

export default function Builder() {
  const d = useData();
  const persona = usePersona();
  const navigate = useNavigate();
  const update = useDemo((s) => s.update);
  const [title, setTitle] = useState("Classroom quick check");
  const [type, setType] = useState("Observation");
  const [qs, setQs] = useState<Q[]>(START);
  const [mode, setMode] = useState<"build" | "preview">("build");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [objs, setObjs] = useState<string[]>(["obj-su-6"]);

  const patch = (id: string, p: Partial<Q>) => setQs((x) => x.map((q) => (q.id === id ? { ...q, ...p } : q)));
  const move = (i: number, dir: -1 | 1) => setQs((x) => { const y = [...x]; const [q] = y.splice(i, 1); y.splice(i + dir, 0, q); return y; });
  const add = (t: QType) => setQs((x) => [...x, { id: uid("q"), label: "New question", type: t, options: t === "Single choice" ? ["Option 1", "Option 2"] : t === "Yes / No" ? ["Yes", "No"] : [], required: false }]);
  const suggest = () => { setQs((x) => [...x, { id: uid("q"), label: "Which routine did pupils follow when collecting devices?", type: "Single choice", options: ["Rotation stations", "Teacher hands out", "No clear routine"], required: true }]); toast({ tone: "ai", title: "AI suggested a question", body: "Aligned to SU.PD.2 (classroom management). Review it before publishing." }); };
  const save = (status: "Draft" | "Published") => {
    update((x) => { x.forms.unshift({ id: uid("frm"), title, type: type as never, program: "SU", audience: "Teaching Fellows", questionCount: qs.length, status, ownerId: persona.staffId ?? "s-yasmin", updatedAt: DEMO_TODAY, objectiveIds: objs }); });
    toast({ tone: "success", title: status === "Draft" ? "Saved as draft" : "Form published", body: status === "Published" ? "It can now be assigned. Published versions are immutable." : undefined });
    navigate("/assessments");
  };

  return (
    <Workspace area="assessments" title="Form builder" description="No-code forms with question types, skip logic, validation and objective tags."
      actions={<><Button variant="secondary" onClick={() => save("Draft")}>Save draft</Button><Button onClick={() => save("Published")}>Publish</Button></>}
      aiActions={<Button variant="ai" size="sm" onClick={suggest}><Sparkles /> Suggest a question</Button>}>
      <Card><CardBody className="grid gap-3 pt-5 md:grid-cols-[1fr_200px_1fr]">
        <label className="text-[13px] font-medium">Title<Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="text-[13px] font-medium">Type<select className="mt-1 h-9 w-full rounded-lg border border-line px-2 text-[13px]" value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
        <div className="text-[13px] font-medium">Linked objectives<div className="mt-1 flex flex-wrap gap-1">{d.objectives.filter((o) => o.collection === "SU").map((o) => <button key={o.id} title={o.text} onClick={() => setObjs((x) => (x.includes(o.id) ? x.filter((y) => y !== o.id) : [...x, o.id]))} className={cn("rounded-full border px-2 py-0.5 text-[11px]", objs.includes(o.id) ? "border-brand-400 bg-brand-50 text-brand-700" : "border-line text-muted")}>{o.code}</button>)}</div></div>
      </CardBody></Card>
      <Segmented value={mode} onChange={setMode} options={[{ value: "build", label: "Build" }, { value: "preview", label: <span className="inline-flex items-center gap-1"><Eye className="size-3.5" />Preview</span> }]} />
      {mode === "build" ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
          <div className="space-y-3">{qs.map((q, i) => <QuestionCard key={q.id} q={q} i={i} qs={qs} patch={patch} move={move} remove={(id) => setQs((x) => x.filter((y) => y.id !== id))} />)}</div>
          <Card className="h-fit"><CardHeader title="Add a question" /><CardBody className="grid gap-1.5">{QTYPES.map((t) => <Button key={t} variant="secondary" size="sm" className="justify-start" onClick={() => add(t)}><Plus />{t}</Button>)}</CardBody></Card>
        </div>
      ) : <FormPreview title={title} qs={qs} answers={answers} setAnswer={(q, v) => setAnswers((a) => ({ ...a, [q]: v }))} />}
    </Workspace>
  );
}
