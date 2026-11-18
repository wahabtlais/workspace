import { Link } from "react-router";
import { Briefcase, CalendarCheck, Rocket, Users } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { StatTile } from "@/components/common/StatTile";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Workspace } from "@/components/common/Workspace";
import { AIMenu } from "@/components/shell/AskPanel";
import { useData } from "@/store/hooks";
import { attendanceRate, attendeeRate } from "@/lib/metrics";
import { PATHWAY_LABEL } from "@/data/seed/fb";
import { DEMO_TODAY, relativeDay } from "@/lib/utils";
import type { Pathway } from "@/data/types";

export default function FBOverview() {
  const d = useData();
  const regs = d.registers.filter((r) => r.kind === "fb");
  const active = d.students.filter((s) => s.cohortId === "fbc-2" && s.status === "Active");
  const upcoming = d.fbSessions.filter((s) => s.date >= DEMO_TODAY).slice(0, 5);
  return (
    <Workspace area="fb" title="Future Builders" description="Ages 15–18 · AI & machine learning, web development and entrepreneurship · real client projects and internships."
      aiActions={<AIMenu context="Future Builders" items={[{ label: "Summarize cohort progress", prompt: "Summarise cohort progress" }, { label: "Identify learners needing support", prompt: "Which students are at risk?" }, { label: "Analyze project progress", prompt: "Analyze project progress" }, { label: "Prepare mentorship summaries", prompt: "Prepare mentorship summaries" }, { label: "Draft monthly report", prompt: "Draft the Future Builders monthly report" }]} />}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Active students" value={active.length} sub="Future Builders 2026–27" icon={<Users />} to="/future-builders/students" />
        <StatTile label="Session attendance" value={`${attendanceRate(regs)}%`} target="85%" progress={attendanceRate(regs)} icon={<CalendarCheck />} to="/future-builders/attendance" />
        <StatTile label="Projects in flight" value={d.projects.length} sub={`${d.projects.filter((p) => p.kind === "client").length} for real clients`} icon={<Rocket />} to="/future-builders/projects" />
        <StatTile label="Internship pipeline" value={d.placements.filter((p) => p.stage !== "Completed").length} sub={`${d.openings.filter((o) => o.status !== "Filled").length} open roles`} icon={<Briefcase />} to="/future-builders/internships" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {(["ai", "web", "ent"] as Pathway[]).map((p) => {
          const st = active.filter((s) => s.pathway === p);
          const rate = attendanceRate(regs.filter((r) => st.some((s) => r.attendeeIds.includes(s.id))));
          const course = d.courses.find((c) => c.pathway === p);
          return (
            <Card key={p} className="p-4">
              <p className="font-semibold">{PATHWAY_LABEL[p]}</p>
              <p className="text-[13px] text-muted">{st.length} students · {d.teams.filter((t) => t.pathway === p).length} teams</p>
              <div className="mt-3 flex items-center gap-2 text-[13px]"><Progress value={rate} className="flex-1" /><span className="tabular">{rate}%</span></div>
              <p className="mt-1 text-[11px] text-subtle">attendance</p>
              <p className="mt-2 text-[12px]">{course ? <Badge tone="success">Course live: {d.curricula.find((c) => c.id === course.curriculumId)?.versions.find((v) => v.id === course.versionId)?.label}</Badge> : <Badge tone="warning">No published course yet</Badge>}</p>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card><CardHeader title="Coming up" /><CardBody className="space-y-2">{upcoming.map((s) => <Link key={s.id} to={`/future-builders/cohorts?session=${s.id}`} className="flex items-center justify-between rounded-lg border border-line p-3 hover:border-brand-200"><span><span className="block font-medium">{s.title}</span><span className="text-[12px] text-muted">{s.type}{s.pathway ? ` · ${PATHWAY_LABEL[s.pathway]}` : ""}</span></span><span className="text-[12px] font-medium">{relativeDay(s.date)} · {s.time}</span></Link>)}</CardBody></Card>
        <Card><CardHeader title="Needs attention" /><CardBody className="space-y-2">
          {d.followUps.filter((f) => f.program === "FB" && f.status !== "Done").map((f) => <Link key={f.id} to="/future-builders/attendance" className="flex items-center justify-between gap-2 rounded-lg border border-line p-3 hover:border-brand-200"><span><span className="block text-[14px] font-medium">{f.title}</span><span className="text-[12px] text-muted">{f.studentId ? d.students.find((s) => s.id === f.studentId)?.name : f.source}</span></span><StatusBadge status={f.status} /></Link>)}
          {active.filter((s) => attendeeRate(regs, s.id) < 75).length > 0 && <p className="text-[12px] text-muted">Students below 75% attendance: {active.filter((s) => attendeeRate(regs, s.id) < 75).map((s) => s.firstName).join(", ")}</p>}
        </CardBody></Card>
      </div>
    </Workspace>
  );
}
