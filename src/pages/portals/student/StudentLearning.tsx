import { useState } from "react";
import { BookOpen, CheckCircle2, Circle, Send } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress, Textarea } from "@/components/ui/misc";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/overlay";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData, usePersona } from "@/store/hooks";
import { DEMO_TODAY, formatDate, relativeDay, uid } from "@/lib/utils";

export function useMe() {
  const d = useData();
  const p = usePersona();
  return d.students.find((s) => s.id === p.scope.studentId)!;
}

export function MyLearning() {
  const d = useData();
  const me = useMe();
  const update = useDemo((s) => s.update);
  const course = d.courses.find((c) => c.env === "FB" && c.pathway === me.pathway);
  if (!course) return <Card className="p-8 text-center text-muted">Your pathway course hasn’t been published yet. Your trainer will share materials in class.</Card>;
  const v = d.curricula.find((c) => c.id === course.curriculumId)!.versions.find((x) => x.id === course.versionId)!;
  const prog = d.progress.find((x) => x.learnerId === me.id && x.courseId === course.id);
  const done = prog?.completedLessonIds ?? [];
  const total = v.modules.reduce((a, m) => a + m.lessons.length, 0);
  const complete = (lid: string) => { update((x) => { let pr = x.progress.find((y) => y.learnerId === me.id && y.courseId === course.id); if (!pr) { pr = { learnerId: me.id, courseId: course.id, completedLessonIds: [] }; x.progress.push(pr); } pr.completedLessonIds.push(lid); }); toast({ tone: "success", title: "Lesson completed", body: "Nice work! Your progress was saved." }); };
  return (
    <div className="space-y-5">
      <div><h1 className="text-[24px] font-semibold">{course.title}</h1><p className="text-[13px] text-muted">Version {v.label} · {done.length} of {total} lessons complete</p><Progress value={(done.length / total) * 100} className="mt-2 max-w-md" /></div>
      {v.modules.map((m, i) => (
        <Card key={m.id}><CardHeader icon={<BookOpen />} title={`Module ${i + 1}: ${m.title}`} />
          <ul className="divide-y divide-line border-t border-line">{m.lessons.map((l) => { const isDone = done.includes(l.id); return (
            <li key={l.id} className="flex items-center gap-3 px-5 py-3">{isDone ? <CheckCircle2 className="size-5 text-emerald-600" /> : <Circle className="size-5 text-line-strong" />}<span className="flex-1 text-[14px]">{l.title}</span><span className="text-[12px] text-muted">{l.minutes} min</span>{!isDone && <Button size="sm" variant="secondary" onClick={() => complete(l.id)}>Mark complete</Button>}</li>
          ); })}</ul>
        </Card>
      ))}
    </div>
  );
}

export function MyAssignments() {
  const d = useData();
  const me = useMe();
  const update = useDemo((s) => s.update);
  const [open, setOpen] = useState<string | null>(null);
  const [text, setText] = useState("");
  const course = d.courses.find((c) => c.env === "FB" && c.pathway === me.pathway);
  const list = d.lmsAssignments.filter((a) => a.courseId === course?.id);
  const submit = (aid: string) => {
    update((x) => { x.submissions.push({ id: uid("sub"), assignmentId: aid, learnerId: me.id, submittedAt: `${DEMO_TODAY}T15:00:00`, status: "Submitted", content: text || "Link to my project files." }); });
    useDemo.getState().addInbox({ toRole: "fb_trainer", kind: "grading", title: `New submission: ${me.name}`, detail: list.find((a) => a.id === aid)?.title ?? "", link: "/learning/grading", source: "Learning Hub" });
    toast({ tone: "success", title: "Submitted!", body: "Your trainer will grade it and you’ll get feedback here." });
    setOpen(null); setText("");
  };
  return (
    <div className="space-y-4">
      <h1 className="text-[24px] font-semibold">Assignments</h1>
      {list.map((a) => { const sub = d.submissions.find((s) => s.assignmentId === a.id && s.learnerId === me.id); return (
        <Card key={a.id} className="p-4"><div className="flex flex-wrap items-center gap-3"><div className="flex-1"><p className="font-semibold">{a.title}</p><p className="text-[12px] text-muted">Due {relativeDay(a.due)} · {a.points} points · rubric: {a.rubric.map((r) => r.criterion).join(", ")}</p></div>
          {!sub && <Button onClick={() => setOpen(a.id)}><Send /> Submit</Button>}
          {sub?.status === "Submitted" && <Badge tone="info">Submitted {formatDate(sub.submittedAt)} · waiting for feedback</Badge>}
          {sub?.status === "Returned" && <Badge tone="success">Graded: {sub.score}/100</Badge>}</div>
          {sub?.feedback && <p className="mt-2 rounded-lg bg-fb-50 p-3 text-[13px]"><b>Feedback:</b> {sub.feedback}</p>}
        </Card>
      ); })}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>{open && <DialogContent title="Submit your work" footer={<><DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose><Button onClick={() => submit(open)}>Submit</Button></>}><Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a link to your work and add a short note for your trainer" /></DialogContent>}</Dialog>
    </div>
  );
}
