import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import type { LMSSubmission } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/misc";
import { Workspace } from "@/components/common/Workspace";
import { EmptyState } from "@/components/common/EmptyState";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function Grading() {
  const d = useData();
  const L = useLookup();
  const persona = usePersona();
  const update = useDemo((s) => s.update);
  const env = persona.role.startsWith("su") ? "TF" : persona.role.startsWith("fb") ? "FB" : null;
  const queue = d.submissions.filter((s) => s.status === "Submitted" && (!env || d.courses.find((c) => c.id === d.lmsAssignments.find((a) => a.id === s.assignmentId)?.courseId)?.env === env));
  const [sel, setSel] = useState<string | undefined>(queue[0]?.id);
  const sub = queue.find((s) => s.id === sel) ?? queue[0];
  const asg = sub && d.lmsAssignments.find((a) => a.id === sub.assignmentId)!;
  const [levels, setLevels] = useState<Record<number, number>>({});
  const [fb, setFb] = useState("");
  const score = asg ? Math.round((Object.values(levels).reduce((a, b) => a + b + 1, 0) / (asg.rubric.length * 4)) * 100) : 0;
  const complete = asg && Object.keys(levels).length === asg.rubric.length;
  const submit = (s: LMSSubmission) => {
    update((x) => { const r = x.submissions.find((y) => y.id === s.id)!; r.status = "Returned"; r.score = score; r.feedback = fb || "Well done. See rubric notes."; r.gradedBy = persona.staffId; });
    if (s.learnerId === "fbs-01") useDemo.getState().notify({ toPersona: "p-student", text: `Feedback returned: ${asg!.title} (${score}/100)`, link: "/student/assignments", tone: "success" });
    if (s.learnerId === "tf-15") useDemo.getState().notify({ toPersona: "p-tf", text: `Feedback returned: ${asg!.title} (${score}/100)`, link: "/tf/training", tone: "success" });
    toast({ tone: "success", title: "Graded and returned", body: `${L.person(s.learnerId)} · ${score}/100. Feedback is visible in their portal.` });
    setLevels({}); setFb(""); setSel(undefined);
  };
  return (
    <Workspace area="learning" title="Grading queue" description="Rubric grading with feedback returned to the learner’s portal.">
      {queue.length === 0 ? <EmptyState title="Nothing to grade" body="New submissions appear here as learners submit." /> : (
        <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
          <Card className="h-fit"><CardHeader title={`${queue.length} waiting`} />
            <ul className="max-h-[560px] overflow-y-auto border-t border-line scrollbar-thin">{queue.map((s) => (
              <li key={s.id}><button onClick={() => { setSel(s.id); setLevels({}); setFb(""); }} className={cn("w-full border-b border-line px-4 py-2.5 text-left hover:bg-canvas", sub?.id === s.id && "bg-brand-50/60")}>
                <span className="block text-[13px] font-medium">{L.person(s.learnerId)}</span><span className="text-[11px] text-muted">{d.lmsAssignments.find((a) => a.id === s.assignmentId)?.title} · {formatDate(s.submittedAt)}</span>
              </button></li>))}</ul>
          </Card>
          {sub && asg && (
            <Card>
              <CardHeader title={asg.title} subtitle={`${L.person(sub.learnerId)} · submitted ${formatDate(sub.submittedAt)}`} action={<Button variant="ai" size="sm" onClick={() => setFb("Clear structure and good use of the starter. Next step: explain why you chose this approach, and test with one more example.")}><Sparkles /> Suggest feedback</Button>} />
              <CardBody className="space-y-4">
                <div className="rounded-lg bg-canvas p-3 text-[13px] text-muted">{sub.content}</div>
                {asg.rubric.map((r, i) => (
                  <div key={r.criterion}><p className="text-[14px] font-medium">{r.criterion}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{r.levels.map((lvl, j) => <button key={lvl} onClick={() => setLevels((x) => ({ ...x, [i]: j }))} className={cn("rounded-lg border px-2 py-2 text-[12px]", levels[i] === j ? "border-brand-500 bg-brand-50 font-semibold text-brand-700" : "border-line text-muted")}>{lvl}</button>)}</div>
                  </div>
                ))}
                <Textarea rows={3} value={fb} onChange={(e) => setFb(e.target.value)} placeholder="Feedback for the learner" />
                <div className="flex items-center gap-3"><Badge tone="outline">Score {complete ? score : "—"}/100</Badge><Button className="ms-auto" disabled={!complete} onClick={() => submit(sub)}><Check /> Return to learner</Button></div>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </Workspace>
  );
}
