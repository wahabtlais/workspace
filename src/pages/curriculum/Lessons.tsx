import { useState } from "react";
import { Link, useParams } from "react-router";
import { BookOpen, Check, ChevronRight, CircleAlert, ClipboardCheck, Eye, FileText, Lock, MessageSquare, Presentation, Sparkles, Users, X } from "lucide-react";
import type { Curriculum, LessonInsight } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/misc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { Workspace } from "@/components/common/Workspace";
import { StatTile } from "@/components/common/StatTile";
import { AIMenu } from "@/components/shell/AskPanel";
import { MiniTable } from "@/pages/staff/home/widgets";
import { lessonFeedbackFlags } from "@/ai/discovery";
import { visitThemes } from "@/ai/contextual";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { toast } from "@/store/uiStore";
import { analyzeInsight, approveInsight, dismissInsight, findLesson, planFor, publishInsight, saveRecommendation } from "@/store/curriculumLoop";
import { cn, formatDate } from "@/lib/utils";
import { InteractiveDesigner } from "@/components/interactive/Interactive";

const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const lessonPath = (curId: string, title: string) => `/curriculum/lessons/${curId}/les-${slug(title)}`;
const VTONE = { draft: "neutral", in_review: "warning", approved: "info", published: "success" } as const;

/** Program → Grade → Subject/Pathway for each curriculum, derived from its audience and units. */
function placement(c: Curriculum, unitTitle: string) {
  if (c.id === "cur-cls") return { program: "School Upskilling", grade: unitTitle.includes("7–8") ? "Grades 7–8" : "Grades 5–6", subject: "Digital skills (classroom)" };
  if (c.collection === "SU") return { program: "Teaching Fellows", grade: "Pre-service training", subject: "Teaching practice" };
  return { program: "Future Builders", grade: "Ages 15–18", subject: `${c.title.replace(" Pathway", "")} pathway` };
}

export function QualityOverview() {
  const d = useData();
  const versions = d.curricula.flatMap((c) => c.versions);
  const lessonsIn = (st: string[]) => d.curricula.reduce((a, c) => a + c.versions.filter((v) => st.includes(v.status)).slice(-1).reduce((b, v) => b + v.modules.reduce((x, m) => x + m.lessons.length, 0), 0), 0);
  const flags = lessonFeedbackFlags(d);
  const recs = d.lessonInsights.filter((i) => i.status === "Recommendation ready");
  const monitoring = d.lessonInsights.filter((i) => i.status === "Monitoring").length;
  const obs = visitThemes(d).reduce((a, t) => a + t.visits.length, 0);
  return (
    <section className="space-y-3">
      <h2 className="text-[16px] font-semibold">Curriculum quality</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Awaiting review" value={versions.filter((v) => v.status === "in_review").length} sub={`${lessonsIn(["in_review"])} lessons in review`} tone="warning" to="/curriculum/reviews" />
        <StatTile label="Lessons reviewed by AI" value={lessonsIn(["in_review", "approved", "published"])} sub="Checked before human review" icon={<Sparkles />} to="/curriculum/lesson-plans" />
        <StatTile label="Published lessons" value={lessonsIn(["published"])} sub="Live for teachers and learners" icon={<BookOpen />} tone="success" to="/curriculum/lesson-plans" />
        <StatTile label="Recommendations to approve" value={recs.length} sub={`${monitoring} lesson${monitoring === 1 ? "" : "s"} with new evidence`} tone={recs.length ? "warning" : "brand"} to="/curriculum/lesson-plans" />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="p-4"><p className="flex items-center gap-1.5 text-[13px] font-semibold"><MessageSquare className="size-4 text-muted" /> Teacher & trainer feedback</p><p className="mt-1 text-[24px] font-semibold tabular">{d.trainerFeedback.length}</p><p className="text-[12px] text-muted">{d.trainerFeedback.filter((f) => f.date >= "2026-10-18").length} in the last 30 days · <Link to="/curriculum/feedback" className="text-brand-700 hover:underline">open</Link></p></Card>
        <Card className="p-4"><p className="flex items-center gap-1.5 text-[13px] font-semibold"><Eye className="size-4 text-muted" /> Observation findings</p><p className="mt-1 text-[24px] font-semibold tabular">{obs}</p><p className="text-[12px] text-muted">visit notes with a recurring classroom challenge</p></Card>
        <Card className="p-4"><p className="flex items-center gap-1.5 text-[13px] font-semibold"><CircleAlert className="size-4 text-amber-600" /> Lessons with recurring difficulties</p>
          {flags.length ? flags.map((f) => <Link key={f.lesson} to={lessonPath(f.curriculumId, f.lesson)} className="mt-2 block rounded-lg bg-amber-50 px-3 py-2 text-[13px] text-amber-900 hover:underline">“{f.lesson}”: {f.n} reports, avg {f.rating} / 5</Link>) : <p className="mt-2 text-[13px] text-muted">None right now.</p>}
        </Card>
      </div>
    </section>
  );
}

export function LessonLibrary() {
  const d = useData();
  const [q, setQ] = useState("");
  const flags = lessonFeedbackFlags(d).map((f) => f.lesson);
  type Row = { c: Curriculum; vLabel: string; vStatus: keyof typeof VTONE; title: string; minutes: number; aiDrafted?: boolean };
  const tree = new Map<string, Map<string, Map<string, Map<string, Row[]>>>>();
  for (const c of d.curricula) {
    const v = [...c.versions].reverse().find((x) => x.status === "published") ?? c.versions[c.versions.length - 1];
    for (const m of v.modules) for (const l of m.lessons) {
      if (q && !`${l.title} ${m.title} ${c.title}`.toLowerCase().includes(q.toLowerCase())) continue;
      const p = placement(c, m.title);
      const g = tree.get(p.program) ?? new Map(); tree.set(p.program, g);
      const s = g.get(p.grade) ?? new Map(); g.set(p.grade, s);
      const u = s.get(p.subject) ?? new Map(); s.set(p.subject, u);
      const rows = u.get(m.title) ?? []; u.set(m.title, rows);
      rows.push({ c, vLabel: v.label, vStatus: v.status, title: l.title, minutes: l.minutes, aiDrafted: l.aiDrafted });
    }
  }
  return (
    <Workspace area="curriculum" title="Lessons" description="Every lesson, organized Program → Grade → Subject or pathway → Unit → Lesson. Open a lesson for its plan, slides, resources, feedback and access."
      aiActions={<AIMenu context="Curriculum" items={[{ label: "Review a lesson", prompt: "Review this lesson" }, { label: "Analyze teacher and trainer feedback", prompt: "Analyze teacher and trainer feedback themes" }, { label: "Recommend differentiated activities", prompt: "Recommend differentiated activities" }, { label: "Draft a new lesson", prompt: "Draft a lesson for Career Readiness" }]} />}>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search lessons, units or curricula" className="max-w-sm" aria-label="Search lessons" />
      {[...tree.entries()].map(([program, grades]) => (
        <Card key={program}>
          <CardHeader icon={<BookOpen />} title={program} />
          <CardBody className="space-y-4">
            {[...grades.entries()].map(([grade, subjects]) => [...subjects.entries()].map(([subject, units]) => (
              <div key={grade + subject}>
                <p className="flex flex-wrap items-center gap-1 text-[13px] font-semibold"><span>{grade}</span><ChevronRight className="size-3.5 text-subtle" /><span>{subject}</span></p>
                <div className="mt-2 space-y-2">
                  {[...units.entries()].map(([unit, rows]) => (
                    <details key={unit} open className="rounded-lg border border-line">
                      <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px] font-medium"><span className="flex-1">{unit}</span><Badge tone={VTONE[rows[0].vStatus]} dot>{rows[0].c.title} {rows[0].vLabel}</Badge></summary>
                      <div className="divide-y divide-line border-t border-line">
                        {rows.map((r) => (
                          <Link key={r.title} to={lessonPath(r.c.id, r.title)} className="flex items-center gap-3 px-3 py-2 text-[13.5px] hover:bg-canvas">
                            <FileText className="size-4 text-muted" /><span className="flex-1">{r.title}{r.aiDrafted && <Badge tone="ai" className="ml-2">AI draft</Badge>}</span>
                            {flags.includes(r.title) && <Badge tone="warning">Recurring difficulty</Badge>}
                            <span className="text-[12px] text-muted tabular">{r.minutes} min</span><ChevronRight className="size-4 text-subtle" />
                          </Link>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )))}
          </CardBody>
        </Card>
      ))}
    </Workspace>
  );
}

function Stepper({ ins }: { ins: LessonInsight }) {
  const order = ["Monitoring", "Recommendation ready", "Approved", "Published"];
  const at = ins.status === "Dismissed" ? 0 : order.indexOf(ins.status);
  const steps = ["Published & AI-reviewed", "Delivered in classrooms", `Evidence collected (${ins.evidence.length})`, "AI recommendation", "Manager approval", "New version published"];
  const done = [true, true, true, at >= 1, at >= 2, at >= 3];
  return (
    <ol className="flex flex-wrap gap-1.5">
      {steps.map((s, i) => <li key={s} className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px]", done[i] ? "bg-emerald-50 text-emerald-800" : i === done.indexOf(false) ? "bg-amber-50 font-medium text-amber-900 ring-1 ring-amber-200" : "bg-slate-100 text-subtle")}>{done[i] ? <Check className="size-3" /> : <span className="tabular">{i + 1}</span>}{s}</li>)}
    </ol>
  );
}

function ImprovementLoop({ ins, cur }: { ins: LessonInsight; cur: Curriculum }) {
  const p = usePersona();
  const isOwner = p.role === "curriculum";
  const rec = ins.recommendation;
  const [edit, setEdit] = useState(false);
  const [changes, setChanges] = useState(rec?.changes.join("\n") ?? "");
  const [acts, setActs] = useState(rec?.plan.activities.join("\n") ?? "");
  const [diff, setDiff] = useState(rec?.plan.differentiation ?? "");
  const ver = cur.versions.find((v) => v.id === ins.versionId);
  return (
    <Card className="border-ai-200">
      <CardHeader icon={<Sparkles className="text-ai-600" />} title="Improvement loop" subtitle={`This lesson ${ins.aiReview.result.toLowerCase()} AI review on ${formatDate(ins.aiReview.at, { day: "numeric", month: "short", year: "numeric" })}. New evidence from delivery has arrived since.`} />
      <CardBody className="space-y-4">
        <Stepper ins={ins} />
        {ins.status === "Monitoring" && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-ai-50/60 p-3 text-[13px] text-ai-900">
            <span className="flex-1">{ins.evidence.length} pieces of evidence point to the same difficulty. AI can analyze them and recommend changes, even though the lesson already passed review.</span>
            {isOwner ? <Button size="sm" className="bg-ai-600 hover:bg-ai-700" onClick={() => analyzeInsight(ins.id)}><Sparkles /> Analyze new evidence</Button> : <Badge tone="outline">Curriculum Manager action</Badge>}
          </div>
        )}
        {rec && ins.status !== "Dismissed" && (
          <div className="space-y-3 rounded-lg border border-line p-3">
            <div className="flex flex-wrap items-center gap-2"><Badge tone="ai">AI recommendation</Badge>{rec.editedBy && <Badge tone="outline">Edited by a person</Badge>}<Badge tone="outline">Simulated AI</Badge></div>
            <p className="text-[13.5px]">{rec.summary}</p>
            {edit ? (
              <div className="space-y-2">
                <label className="block text-[13px] font-medium">Recommended changes (one per line)<Textarea className="mt-1" rows={5} value={changes} onChange={(e) => setChanges(e.target.value)} /></label>
                <label className="block text-[13px] font-medium">Revised activities (one per line)<Textarea className="mt-1" rows={5} value={acts} onChange={(e) => setActs(e.target.value)} /></label>
                <label className="block text-[13px] font-medium">Differentiation<Textarea className="mt-1" rows={2} value={diff} onChange={(e) => setDiff(e.target.value)} /></label>
                <div className="flex gap-2"><Button size="sm" onClick={() => { saveRecommendation(ins.id, { ...rec, changes: changes.split("\n").filter(Boolean), plan: { ...rec.plan, activities: acts.split("\n").filter(Boolean), differentiation: diff } }); setEdit(false); }}>Save edits</Button><Button size="sm" variant="ghost" onClick={() => setEdit(false)}>Cancel</Button></div>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                <div><p className="text-[12px] font-semibold uppercase tracking-wide text-subtle">Recommended changes</p><ul className="mt-1 list-disc space-y-1 pl-5 text-[13px]">{rec.changes.map((c) => <li key={c}>{c}</li>)}</ul></div>
                <div><p className="text-[12px] font-semibold uppercase tracking-wide text-subtle">Revised timing ({rec.minutes} min)</p><ul className="mt-1 space-y-1 text-[13px]">{rec.plan.activities.map((a) => <li key={a}>{a}</li>)}</ul></div>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
              {ins.status === "Recommendation ready" && isOwner && <>
                <Button size="sm" variant="secondary" onClick={() => setEdit(true)}>Edit</Button>
                <Button size="sm" variant="success" onClick={() => approveInsight(ins.id)}><Check /> Approve and create new version</Button>
                <Button size="sm" variant="ghost" onClick={() => dismissInsight(ins.id)}><X /> Dismiss</Button>
              </>}
              {ins.status === "Approved" && ver && <>{isOwner ? <Button size="sm" onClick={() => publishInsight(ins.id)}>Publish {ver.label} to classroom materials</Button> : <Badge tone="info">{ver.label} approved · waiting to be published</Badge>}</>}
              {ins.status === "Published" && ver && <Badge tone="success" dot>{ver.label} published · teachers and Teaching Fellows notified</Badge>}
              {!isOwner && ins.status === "Recommendation ready" && <Badge tone="outline">Waiting for the Curriculum Manager</Badge>}
              <span className="ml-auto text-[12px] text-muted">AI never publishes or overwrites approved curriculum.</span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function LessonPage() {
  const { curId, lessonKey } = useParams();
  const d = useData();
  const L = useLookup();
  const [access, setAccess] = useState<Record<string, string>>({});
  const cur = d.curricula.find((c) => c.id === curId);
  const found = cur && lessonKey ? findLesson(cur, lessonKey) : undefined;
  if (!cur || !found) return <Workspace area="curriculum" title="Lesson not found"><p>Unknown lesson.</p></Workspace>;
  const { ver, mod, lesson } = found;
  const pl = placement(cur, mod.title);
  const plan = planFor(lesson, d.objectives);
  const ins = d.lessonInsights.find((i) => i.curriculumId === cur.id && i.lessonTitle === lesson.title);
  const fb = d.trainerFeedback.filter((f) => f.lessonTitle === lesson.title);
  const objs = d.objectives.filter((o) => lesson.objectiveIds.includes(o.id));
  const resources = d.resources.filter((r) => r.objectiveIds.some((o) => lesson.objectiveIds.includes(o)));
  const forms = d.forms.filter((f) => f.objectiveIds.some((o) => lesson.objectiveIds.includes(o)));
  const versionsWith = cur.versions.filter((v) => v.modules.some((m) => m.lessons.some((l) => l.title === lesson.title)));
  const roles = cur.id === "cur-cls"
    ? [["Curriculum team", "Edit"], ["SU Project Manager & trainers", "Review and comment"], [`Class teachers (${pl.grade})`, "View and teach"], [`Teaching Fellows deployed in ${pl.grade}`, "View and teach"], ["Pupils", "No access (pupils have no accounts)"]]
    : cur.collection === "SU" ? [["Curriculum team", "Edit"], ["SU trainers", "Review and teach"], ["Teaching Fellows in training", "View (published only)"]]
      : [["Curriculum team", "Edit"], ["FB trainers for this pathway", "Review and teach"], ["Students in this pathway", "View (published only)"], ["Other pathways", "No access"]];
  const evidence = [...(ins?.evidence ?? []).map((e) => ({ kind: e.kind as string, text: e.text, by: e.by, date: e.date })), ...fb.filter((f) => !ins?.evidence.some((e) => e.text === f.comment)).map((f) => ({ kind: `${f.source ?? "Trainer"} feedback (${f.rating}/5)`, text: f.comment, by: L.person(f.trainerId), date: f.date }))].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Workspace area="curriculum" hideSubnav title={lesson.title}
      crumbs={[{ label: "Curriculum", to: "/curriculum" }, { label: "Lessons", to: "/curriculum/lesson-plans" }, { label: lesson.title }]}
      description={`${pl.program} › ${pl.grade} › ${pl.subject} › ${mod.title}`}
      meta={<><Badge tone={VTONE[ver.status]} dot>{cur.title} {ver.label} · {ver.status.replace("_", " ")}</Badge><Badge tone="outline">{lesson.minutes} min</Badge>{lesson.aiDrafted && <Badge tone="ai">AI draft</Badge>}</>}
      aiActions={<AIMenu context={`Lesson: ${lesson.title}`} items={[{ label: "Review this lesson", prompt: "Review this lesson" }, { label: "Analyze feedback", prompt: "Analyze teacher and trainer feedback themes" }, { label: "Recommend differentiated activities", prompt: "Recommend differentiated activities" }, { label: "Translate the plan into Arabic", prompt: "Translate this letter into Arabic" }]} />}>
      {ins && <ImprovementLoop key={ins.status} ins={ins} cur={cur} />}
      <Tabs defaultValue="plan">
        <TabsList>
          <TabsTrigger value="plan">Lesson plan</TabsTrigger>
          <TabsTrigger value="slides">Slides</TabsTrigger>
          <TabsTrigger value="interactive">Interactive experience</TabsTrigger>
          <TabsTrigger value="resources">Resources & assessments</TabsTrigger>
          <TabsTrigger value="feedback">Feedback & evidence ({evidence.length})</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
        </TabsList>
        <TabsContent value="plan" className="mt-4 space-y-4">
          <Card><CardHeader title="Learning objectives" /><CardBody className="space-y-2"><p className="text-[14px]">{plan.objectives}</p><div className="flex flex-wrap gap-1.5">{objs.map((o) => <Badge key={o.id} tone="outline">{o.code} · {o.text}</Badge>)}</div></CardBody></Card>
          <Card><CardHeader title="Timing and activities" subtitle={`${lesson.minutes} minutes`} /><CardBody><ol className="space-y-2">{plan.activities.map((a, i) => <li key={a} className="flex gap-3 text-[14px]"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-canvas text-[12px] font-semibold">{i + 1}</span>{a}</li>)}</ol></CardBody></Card>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4"><p className="text-[12px] font-semibold uppercase tracking-wide text-subtle">Materials</p><p className="mt-1 text-[13.5px]">{plan.materials}</p></Card>
            <Card className="p-4"><p className="text-[12px] font-semibold uppercase tracking-wide text-subtle">Differentiation</p><p className="mt-1 text-[13.5px]">{plan.differentiation}</p></Card>
            <Card className="p-4"><p className="text-[12px] font-semibold uppercase tracking-wide text-subtle">Assessment</p><p className="mt-1 text-[13.5px]">{plan.assessment}</p></Card>
          </div>
        </TabsContent>
        <TabsContent value="slides" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[lesson.title, "Today we will…", ...plan.activities.map((a) => a.split(":")[0]), "Exit ticket"].map((t, i) => (
              <div key={i} className="flex aspect-video flex-col justify-between rounded-xl border border-line bg-gradient-to-br from-brand-50 to-surface p-4"><span className="text-[11px] text-subtle">Slide {i + 1}</span><p className={cn("font-semibold", i === 0 ? "text-[18px]" : "text-[15px]")}>{t}</p><span className="flex items-center gap-1 text-[11px] text-muted"><Presentation className="size-3" />{cur.title}</span></div>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-muted">Slide preview (simulated). In production the deck opens in Google Slides.</p>
        </TabsContent>
        <TabsContent value="interactive" className="mt-4"><InteractiveDesigner curriculumId={cur.id} lessonTitle={lesson.title} /></TabsContent>
        <TabsContent value="resources" className="mt-4 space-y-4">
          <Card><CardHeader title="Supporting resources" /><CardBody><MiniTable empty="No resources tagged to these objectives" head={["Resource", "Type", "Updated"]} rows={resources.map((r) => [r.title, r.kind, formatDate(r.updatedAt)])} /></CardBody></Card>
          <Card><CardHeader icon={<ClipboardCheck />} title="Linked assessments" /><CardBody><MiniTable empty="No assessments linked yet" head={["Assessment", "Type", "Audience", "Status"]} rows={forms.map((f) => [f.title, f.type, f.audience, f.status])} /></CardBody></Card>
        </TabsContent>
        <TabsContent value="feedback" className="mt-4">
          <Card><CardBody className="space-y-2 pt-4">
            {evidence.map((e, i) => (
              <div key={i} className="rounded-lg border border-line p-3"><div className="flex flex-wrap items-center gap-2 text-[12px] text-muted"><Badge tone={e.kind === "Observation" ? "info" : e.kind === "Assessment" ? "warning" : "outline"}>{e.kind}</Badge>{e.by} · {formatDate(e.date)}</div><p className="mt-1.5 text-[13.5px]">“{e.text}”</p></div>
            ))}
            {evidence.length === 0 && <p className="text-[13px] text-muted">No feedback recorded for this lesson yet.</p>}
          </CardBody></Card>
        </TabsContent>
        <TabsContent value="versions" className="mt-4">
          <Card><CardBody className="pt-4"><MiniTable head={["Version", "Status", "Created", "Published", "Change log"]} rows={versionsWith.map((v) => [<Link to={`/curriculum/${cur.id}`} className="font-medium hover:underline">{v.label}</Link>, <Badge tone={VTONE[v.status]} dot>{v.status.replace("_", " ")}</Badge>, formatDate(v.createdAt), v.publishedAt ? formatDate(v.publishedAt) : "—", <span className="text-[12px] text-muted">{v.changeLog}</span>])} /></CardBody></Card>
        </TabsContent>
        <TabsContent value="access" className="mt-4">
          <Card>
            <CardHeader icon={<Lock />} title="Who can see and use this lesson" subtitle={`Access is set at grade level (${pl.grade}) and can be narrowed for a single lesson.`} />
            <CardBody>
              <MiniTable head={["Who", "Grade-level access", "This lesson"]} rows={roles.map(([who, lvl]) => [<span className="flex items-center gap-1.5"><Users className="size-3.5 text-muted" />{who}</span>, lvl, lvl.startsWith("No access") ? "—" :
                <select aria-label={`Lesson access for ${who}`} className="h-8 rounded-md border border-line-strong bg-surface px-2 text-[13px]" value={access[who] ?? "Same as grade"} onChange={(e) => { setAccess((a) => ({ ...a, [who]: e.target.value })); toast({ tone: "success", title: "Access updated (simulated)", body: `${who}: ${e.target.value} for “${lesson.title}”.` }); }}><option>Same as grade</option><option>Hidden for this lesson</option><option>View only</option></select>])} />
              <p className="mt-2 text-[12px] text-muted">Drafts are only visible to the curriculum team and reviewers. Published versions never change; edits always create a new version.</p>
            </CardBody>
          </Card>
        </TabsContent>
      </Tabs>
    </Workspace>
  );
}
