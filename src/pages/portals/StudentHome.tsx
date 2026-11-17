import { Link } from "react-router";
import { ArrowRight, Briefcase, CalendarClock, FolderKanban, Rocket, Sparkles, Star } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { useData, usePersona } from "@/store/hooks";
import { PATHWAY_LABEL } from "@/data/seed/fb";
import { formatDate, relativeDay } from "@/lib/utils";

export default function StudentHome() {
  const d = useData();
  const p = usePersona();
  const me = d.students.find((s) => s.id === p.scope.studentId)!;
  const course = d.courses.find((c) => c.env === "FB" && c.pathway === me.pathway);
  const version = course && d.curricula.find((c) => c.id === course.curriculumId)?.versions.find((v) => v.id === course.versionId);
  const lessons = version?.modules.flatMap((m) => m.lessons) ?? [];
  const done = d.progress.find((x) => x.learnerId === me.id && x.courseId === course?.id)?.completedLessonIds ?? [];
  const nextLesson = lessons.find((l) => !done.includes(l.id));
  const due = d.lmsAssignments.filter((a) => a.courseId === course?.id && !d.submissions.some((s) => s.assignmentId === a.id && s.learnerId === me.id));
  const team = d.teams.find((t) => t.id === me.teamId);
  const project = d.projects.find((x) => x.id === team?.projectId);
  const nextMs = project?.milestones.find((m) => m.status !== "Approved");
  const placement = d.placements.find((x) => x.studentId === me.id);
  const opening = d.openings.find((o) => o.id === placement?.openingId);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-fb to-[#b8461a] p-6 text-white">
        <p className="text-[13px] text-white/80">{PATHWAY_LABEL[me.pathway]} · {team?.name}</p>
        <h1 className="mt-1 text-[26px] font-semibold">Hi {me.firstName}, here’s what’s next</h1>
        {nextLesson && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl bg-white/15 p-4 sm:flex-row sm:items-center">
            <div className="flex-1"><p className="text-[12px] text-white/75">Continue learning</p><p className="font-semibold">{nextLesson.title}</p></div>
            <Button asChild variant="secondary" className="border-0"><Link to="/student/learning">Continue <ArrowRight /></Link></Button>
          </div>
        )}
        <div className="mt-4 flex items-center gap-3 text-[13px]">
          <Progress value={(done.length / Math.max(1, lessons.length)) * 100} className="max-w-xs bg-white/25 [&>div]:bg-white" />
          <span>{done.length} of {lessons.length} lessons</span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader icon={<CalendarClock />} title="Coming up" />
          <CardBody className="space-y-2">
            {due.map((a) => (
              <Link key={a.id} to="/student/assignments" className="flex items-center justify-between rounded-lg border border-line p-3 hover:border-fb/40">
                <span><span className="block font-medium">{a.title}</span><span className="text-[12px] text-muted">Assignment · {a.points} points</span></span>
                <Badge tone="warning">Due {relativeDay(a.due)}</Badge>
              </Link>
            ))}
            {nextMs && (
              <Link to="/student/team" className="flex items-center justify-between rounded-lg border border-line p-3 hover:border-fb/40">
                <span><span className="block font-medium">{nextMs.title}</span><span className="text-[12px] text-muted">Team milestone · {project?.title}</span></span>
                <Badge tone="info">{nextMs.status}</Badge>
              </Link>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader icon={<Briefcase />} title="Internships" />
          <CardBody>
            {placement && opening ? (
              <div className="rounded-lg bg-fb-50 p-4">
                <p className="text-[12px] font-medium text-fb">Good news</p>
                <p className="font-semibold">You’re shortlisted for {opening.title}</p>
                <p className="mt-1 text-[13px] text-muted">{d.organizations.find((o) => o.id === opening.hostId)?.name} · starts {formatDate(opening.start, { day: "numeric", month: "long" })}</p>
                <p className="mt-2 text-[12px] text-muted">Your portfolio is shared with a host only when you and your guardian say yes.</p>
              </div>
            ) : <p className="text-[13px] text-muted">Openings will appear here.</p>}
            <Button asChild variant="link" className="mt-2"><Link to="/student/career">See all openings</Link></Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader icon={<FolderKanban />} title="Your portfolio" />
          <CardBody>
            <p className="text-[13px] text-muted">{d.portfolio.filter((x) => x.studentId === me.id).length} items · you choose who sees each one.</p>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-fb/40 p-3 text-[13px]"><Star className="size-4 text-fb" /> Your trainer endorsed your bakery wireframes. Add a reflection?</div>
            <Button asChild variant="link" className="mt-2"><Link to="/student/portfolio">Open portfolio</Link></Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader icon={<Sparkles />} title="Learning Assistant" subtitle="I give hints, not answers." />
          <CardBody>
            <p className="text-[13px] text-muted">Stuck on the sign-up form? I can explain ideas from your course and nudge you in the right direction.</p>
            <Button asChild variant="ai" className="mt-3"><Link to="/student/assistant"><Rocket /> Ask for a hint</Link></Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
