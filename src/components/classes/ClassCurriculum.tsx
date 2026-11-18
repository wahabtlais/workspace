import { useState } from "react";
import { BookOpen, FileText } from "lucide-react";
import type { Lesson } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/overlay";
import { useData } from "@/store/hooks";
import { planFor } from "@/store/curriculumLoop";

/** The classroom curriculum assigned to a teacher's grades (published version only). */
export function ClassCurriculum({ grades, lang = "en" }: { grades: number[]; lang?: "en" | "ar" }) {
  const d = useData();
  const [open, setOpen] = useState<Lesson>();
  const ar = lang === "ar";
  const cur = d.curricula.find((c) => c.id === "cur-cls");
  const live = cur ? [...cur.versions].reverse().find((v) => v.status === "published") : undefined;
  if (!cur || !live) return null;
  const units = live.modules.filter((m) => grades.some((g) => (g <= 6 ? !m.title.includes("7–8") : m.title.includes("7–8"))));
  const updated = d.lessonInsights.filter((i) => i.status === "Published").map((i) => i.lessonTitle);
  const plan = open ? planFor(open, d.objectives) : undefined;
  return (
    <Card>
      <CardHeader icon={<BookOpen />} title={ar ? "دروس صفوفي" : "Lessons for my classes"} subtitle={`${cur.title} ${live.label} · ${ar ? "منشور" : "published"}`} />
      <CardBody className="space-y-3">
        {units.map((u) => (
          <div key={u.id}>
            <p className="text-[13px] font-semibold">{u.title}</p>
            <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
              {u.lessons.map((l) => (
                <button key={l.id} onClick={() => setOpen(l)} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-start text-[13px] hover:border-brand-300">
                  <FileText className="size-4 text-muted" /><span className="flex-1">{l.title}</span>
                  {updated.includes(l.title) && <Badge tone="success">{ar ? "محدّث" : "Updated"}</Badge>}
                  <span className="text-[12px] text-muted tabular">{l.minutes} {ar ? "د" : "min"}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </CardBody>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(undefined)}>
        {open && plan && (
          <DialogContent title={open.title} description={`${open.minutes} min · ${cur.title} ${live.label}`}>
            <div className="space-y-3 text-[13.5px]" dir="ltr">
              <p><span className="font-semibold">Objective: </span>{plan.objectives}</p>
              <ol className="list-decimal space-y-1 pl-5">{plan.activities.map((a) => <li key={a}>{a}</li>)}</ol>
              <p><span className="font-semibold">Materials: </span>{plan.materials}</p>
              <p><span className="font-semibold">Differentiation: </span>{plan.differentiation}</p>
              <p><span className="font-semibold">Assessment: </span>{plan.assessment}</p>
              <p className="text-[12px] text-muted">Slides and worksheets open in Google Slides and Docs (simulated).</p>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Card>
  );
}
