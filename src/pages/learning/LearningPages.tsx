import { Link } from "react-router";
import { Award, GraduationCap, Megaphone } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { Workspace } from "@/components/common/Workspace";
import { DataTable } from "@/components/data/DataTable";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useData, useLookup } from "@/store/hooks";
import { formatDate, relativeDay } from "@/lib/utils";

function lessonCount(d: ReturnType<typeof useData>, courseId: string) {
  const k = d.courses.find((c) => c.id === courseId)!;
  return d.curricula.find((c) => c.id === k.curriculumId)!.versions.find((v) => v.id === k.versionId)!.modules.reduce((a, m) => a + m.lessons.length, 0);
}

export function Courses() {
  const d = useData();
  return (
    <Workspace area="learning" title="Courses" description="One Learning Hub engine, two environments: the Future Builders Student Portal and the TF Learning Portal. Courses are published snapshots of curriculum versions.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {d.courses.map((k) => {
          const cur = d.curricula.find((c) => c.id === k.curriculumId)!;
          const learners = d.progress.filter((p) => p.courseId === k.id);
          const total = lessonCount(d, k.id);
          const avg = learners.length ? Math.round((learners.reduce((a, p) => a + p.completedLessonIds.length, 0) / learners.length / total) * 100) : 0;
          return (
            <Card key={k.id} className="p-4">
              <div className="flex items-center justify-between gap-2"><Badge tone={k.env === "FB" ? "fb" : "su"}>{k.env === "FB" ? "Student Portal" : "TF Portal"}</Badge><Badge tone="outline">{cur.versions.find((v) => v.id === k.versionId)?.label}</Badge></div>
              <p className="mt-2 font-semibold">{k.title}</p>
              <p className="text-[12px] text-muted">{total} lessons · {learners.length} learners · published {formatDate(k.publishedAt)}</p>
              <div className="mt-3 flex items-center gap-2 text-[12px]"><Progress value={avg} className="flex-1" /><span className="tabular">{avg}% avg progress</span></div>
              <Link to={`/curriculum/${cur.id}`} className="mt-2 inline-block text-[12px] text-brand-700 hover:underline">Source curriculum</Link>
            </Card>
          );
        })}
      </div>
      {d.curricula.filter((c) => c.collection === "FB" && c.pathway && !d.courses.some((k) => k.curriculumId === c.id)).map((c) => <Card key={c.id} className="border-dashed p-4 text-[13px] text-muted">{c.title} has no published course yet. Students on this pathway use pilot materials until it is published from Curriculum.</Card>)}
    </Workspace>
  );
}

export function Progress_() {
  const d = useData();
  const L = useLookup();
  const rows = d.progress.map((p) => ({ p, total: lessonCount(d, p.courseId), course: d.courses.find((c) => c.id === p.courseId)! }));
  return (
    <Workspace area="learning" title="Cohort progress" description="Lesson completion per learner. At-risk learners are below 40% progress.">
      <DataTable rows={rows} search={(r) => L.person(r.p.learnerId)} initialSort={{ key: "pr", dir: "asc" }} filters={[{ key: "c", label: "Course", options: d.courses.map((c) => c.title), get: (r) => r.course.title }]}
        columns={[
          { key: "l", header: "Learner", cell: (r) => <span className="font-medium">{L.person(r.p.learnerId)}</span> },
          { key: "c", header: "Course", cell: (r) => <span className="text-muted">{r.course.title}</span> },
          { key: "pr", header: "Progress", sort: (r) => r.p.completedLessonIds.length / r.total, cell: (r) => { const v = Math.round((r.p.completedLessonIds.length / r.total) * 100); return <span className="flex items-center gap-2"><Progress value={v} className="w-24" tone={v < 40 ? "danger" : "brand"} /><span className="tabular text-[12px]">{r.p.completedLessonIds.length}/{r.total}</span>{v < 40 && <Badge tone="danger">At risk</Badge>}</span>; } },
        ]} />
    </Workspace>
  );
}

export function Certificates() {
  const d = useData();
  const certified = d.tfs.filter((t) => t.certifiedAt);
  return (
    <Workspace area="learning" title="Certificates" description="Issued automatically from templates when completion criteria are approved.">
      <Card><CardHeader icon={<Award />} title="Teaching Fellow certificates" /><CardBody><MiniTable head={["Teaching Fellow", "Cohort", "Issued"]} rows={certified.map((t) => [t.name, d.tfCohorts.find((c) => c.id === t.cohortId)?.name, formatDate(t.certifiedAt!, { day: "numeric", month: "short", year: "numeric" })])} /></CardBody></Card>
      <Card><CardHeader icon={<GraduationCap />} title="Future Builders completion certificates" /><CardBody><MiniTable head={["Graduate", "Pathway", "Issued"]} rows={d.students.filter((s) => s.status === "Graduated").map((s) => [s.name, s.pathway.toUpperCase(), "26 Jun 2026"])} /></CardBody></Card>
    </Workspace>
  );
}

export function Announcements() {
  const d = useData();
  const L = useLookup();
  return (
    <Workspace area="learning" title="Announcements" description="Posted to the Student Portal or the TF Portal. Student-facing posts are moderated.">
      <div className="grid gap-3 md:grid-cols-2">{d.announcements.map((a) => <Card key={a.id} className="p-4"><div className="flex items-center justify-between"><Badge tone={a.env === "FB" ? "fb" : "su"}><Megaphone /> {a.env === "FB" ? "Student Portal" : "TF Portal"}</Badge><span className="text-[12px] text-muted">{relativeDay(a.date)}</span></div><p className="mt-2 font-semibold">{a.title}</p><p className="text-[13px] text-muted">{a.body}</p><p className="mt-2 text-[12px] text-subtle">{L.person(a.authorId)}</p></Card>)}</div>
    </Workspace>
  );
}
