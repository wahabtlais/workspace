import { useState } from "react";
import { ChevronRight, Clock, MessageSquare, Minus, Plus, Sparkles } from "lucide-react";
import type { Curriculum, CurriculumVersion, Lesson } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/misc";
import { Avatar } from "@/components/ui/misc";
import { useData, useLookup } from "@/store/hooks";
import { addReviewComment } from "@/store/actions";
import { relativeDay } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Structure({ ver }: { ver: CurriculumVersion }) {
  const d = useData();
  const [open, setOpen] = useState<Lesson | null>(null);
  const code = (id: string) => d.objectives.find((o) => o.id === id)?.code;
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <div className="space-y-3">
        {ver.modules.map((m, mi) => (
          <Card key={m.id}>
            <CardHeader title={`Module ${mi + 1} · ${m.title}`} subtitle={`${m.lessons.length} lessons · ${m.lessons.reduce((a, l) => a + l.minutes, 0)} min`} />
            <ul className="divide-y divide-line border-t border-line">
              {m.lessons.map((l) => (
                <li key={l.id}>
                  <button onClick={() => setOpen(l)} className={cn("flex w-full flex-wrap items-center gap-2 px-5 py-2.5 text-left hover:bg-canvas", open?.id === l.id && "bg-brand-50/50")}>
                    <span className="flex-1 text-[14px]">{l.title}</span>
                    {l.aiDrafted && <Badge tone="ai"><Sparkles /> AI draft</Badge>}
                    {l.objectiveIds.map((o) => <Badge key={o} tone="outline">{code(o)}</Badge>)}
                    <span className="text-[12px] text-muted tabular">{l.minutes} min</span>
                    <ChevronRight className="size-4 text-subtle" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <Card className="h-fit lg:sticky lg:top-20">
        {open ? (
          <>
            <CardHeader title={open.title} subtitle={`${open.minutes} minutes · ${open.objectiveIds.map(code).join(", ")}`} />
            <CardBody className="space-y-2 text-[13px]">
              {open.plan ? (<>
                <p><b>Objective.</b> {open.plan.objectives}</p>
                <div><b>Activities</b><ul className="mt-1 list-disc space-y-0.5 ps-5">{open.plan.activities.map((a) => <li key={a}>{a}</li>)}</ul></div>
                <p><b>Materials.</b> {open.plan.materials}</p>
                <p><b>Differentiation.</b> {open.plan.differentiation}</p>
                <p><b>Assessment.</b> {open.plan.assessment}</p>
              </>) : <p className="text-muted">Lesson plan uses the standard template: objectives, timing, activities, materials, differentiation, assessment. {open.objectiveIds.map((o) => d.objectives.find((x) => x.id === o)?.text).join("; ")}.</p>}
            </CardBody>
          </>
        ) : <CardBody className="pt-5 text-[13px] text-muted">Select a lesson to see its plan and objectives.</CardBody>}
      </Card>
    </div>
  );
}

export function Review({ cur, ver }: { cur: Curriculum; ver: CurriculumVersion }) {
  const L = useLookup();
  const [text, setText] = useState("");
  return (
    <Card>
      <CardHeader icon={<MessageSquare />} title="Review comments" subtitle={ver.reviewerIds.length ? `Reviewers: ${ver.reviewerIds.map((r) => L.person(r)).join(", ")}` : "Not yet sent for review"} />
      <CardBody className="space-y-3">
        {ver.comments.length === 0 && <p className="text-[13px] text-muted">No comments yet.</p>}
        {ver.comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <Avatar name={L.person(c.authorId)} size={30} />
            <div className="flex-1 rounded-lg bg-canvas p-3">
              <p className="text-[12px] text-muted"><b className="text-fg">{L.person(c.authorId)}</b> · {relativeDay(c.at)}{c.target && <> · on <i>{c.target}</i></>}{c.resolved && <Badge tone="success" className="ml-2">Resolved</Badge>}</p>
              <p className="mt-1 text-[13px]">{c.text}</p>
            </div>
          </div>
        ))}
        {ver.status !== "published" && (
          <div className="flex gap-2 pt-2">
            <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment for the author and reviewers…" />
            <Button disabled={!text.trim()} onClick={() => { addReviewComment(cur.id, ver.id, text.trim()); setText(""); }}>Comment</Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function Compare({ cur, ver }: { cur: Curriculum; ver: CurriculumVersion }) {
  const idx = cur.versions.findIndex((v) => v.id === ver.id);
  const prev = idx > 0 ? cur.versions[idx - 1] : undefined;
  if (!prev) return <Card className="p-6 text-[13px] text-muted">This is the first version; there is nothing to compare with.</Card>;
  const titles = (v: CurriculumVersion) => v.modules.flatMap((m) => m.lessons.map((l) => `${m.title} › ${l.title}`));
  const before = new Set(titles(prev)), after = new Set(titles(ver));
  const added = [...after].filter((t) => !before.has(t)), removed = [...before].filter((t) => !after.has(t));
  return (
    <Card>
      <CardHeader title={`${prev.label} → ${ver.label}`} subtitle={`${added.length} lessons added · ${removed.length} removed · ${[...after].filter((t) => before.has(t)).length} unchanged`} />
      <CardBody className="space-y-1.5">
        {added.map((t) => <p key={t} className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-[13px] text-emerald-900"><Plus className="size-3.5" />{t}</p>)}
        {removed.map((t) => <p key={t} className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-1.5 text-[13px] text-red-900 line-through"><Minus className="size-3.5" />{t}</p>)}
        {added.length + removed.length === 0 && <p className="text-[13px] text-muted">No structural changes.</p>}
        <p className="pt-2 text-[13px]"><b>Change log:</b> {ver.changeLog || <span className="text-muted">Not written yet.</span>}</p>
      </CardBody>
    </Card>
  );
}

export function History({ cur }: { cur: Curriculum }) {
  const L = useLookup();
  const events = cur.versions.flatMap((v) => [
    { at: v.createdAt, text: `${v.label} created` },
    ...(v.approvedAt ? [{ at: v.approvedAt, text: `${v.label} approved by ${L.person(v.approvedBy)}` }] : []),
    ...(v.publishedAt ? [{ at: v.publishedAt, text: `${v.label} published` }] : []),
  ]).sort((a, b) => b.at.localeCompare(a.at));
  return (
    <Card><CardBody className="pt-5"><ol className="space-y-3">{events.map((e, i) => <li key={i} className="flex gap-3 text-[13px]"><Clock className="mt-0.5 size-4 text-subtle" /><span><b>{e.text}</b><span className="block text-[12px] text-muted">{relativeDay(e.at)}</span></span></li>)}</ol></CardBody></Card>
  );
}
