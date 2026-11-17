import { Link } from "react-router";
import { BookOpen, ClipboardList, GraduationCap, Rocket, Send, Users } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge, type Tone } from "@/components/ui/badge";
import { StatTile } from "@/components/common/StatTile";
import { AIAction } from "@/components/shell/AskPanel";
import { useData } from "@/store/hooks";
import { formatDate } from "@/lib/utils";
import { MiniTable } from "./widgets";

const MS_TONE: Record<string, Tone> = { "Not started": "neutral", "In progress": "info", Submitted: "warning", Approved: "success", "Changes requested": "danger" };

export function FbTrainerPanel() {
  const d = useData();
  const backlog = d.submissions.filter((s) => s.status === "Submitted" && s.assignmentId.startsWith("asg-ai")).length;
  const live = d.assessmentSessions.find((s) => s.id === "as-fb-ai-quiz");
  const ms = d.projects.flatMap((p) => p.milestones.filter((m) => m.status === "Submitted" || m.status === "In progress" || m.status === "Changes requested").map((m) => ({ p, m })));
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Grading backlog" value={backlog} sub="AI pathway submissions" tone={backlog ? "warning" : "success"} icon={<GraduationCap />} to="/learning/grading" />
        <StatTile label="Live quiz" value={`${live?.entries.filter((e) => e.status === "submitted").length ?? 0}/${live?.entries.length ?? 0}`} sub="submitted so far" icon={<ClipboardList />} to="/assessments/tracker" />
        <StatTile label="Milestones in flight" value={ms.length} icon={<Rocket />} to="/future-builders/projects" />
        <StatTile label="Mentees" value={d.students.filter((s) => s.mentorId === "s-sami").length} icon={<Users />} to="/future-builders/mentorship" />
      </div>
      <Card>
        <CardHeader title="Team project milestones" subtitle="Submitted, in progress or needing changes" />
        <CardBody>
          <MiniTable head={["Milestone", "Project", "Team", "Due", "Status"]} rows={ms.map(({ p, m }) => [
            <span className="font-medium">{m.title}</span>, <span className="text-muted">{p.title}</span>, <span className="text-muted">{d.teams.find((t) => t.id === p.teamId)?.name}</span>,
            <span className="text-muted">{formatDate(m.due)}</span>, <Badge tone={MS_TONE[m.status]}>{m.status}</Badge>,
          ])} />
        </CardBody>
      </Card>
    </>
  );
}

const V_TONE: Record<string, Tone> = { draft: "neutral", in_review: "warning", approved: "info", published: "success" };
export const VERSION_LABEL: Record<string, string> = { draft: "Draft", in_review: "In review", approved: "Approved, not published", published: "Published" };

export function CurriculumPanel() {
  const d = useData();
  const versions = d.curricula.flatMap((c) => c.versions.map((v) => ({ c, v })));
  const count = (s: string) => versions.filter((x) => x.v.status === s).length;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Drafts" value={count("draft")} icon={<BookOpen />} to="/curriculum/curricula" />
        <StatTile label="In review" value={count("in_review")} tone="warning" icon={<ClipboardList />} to="/curriculum/reviews" />
        <StatTile label="Ready to publish" value={count("approved")} icon={<Send />} to="/curriculum/publishing" />
        <StatTile label="Published courses" value={d.courses.length} sub="in Student & TF portals" icon={<GraduationCap />} to="/learning" />
      </div>
      <Card>
        <CardHeader title="Curriculum versions" subtitle="Both collections · running cohorts stay pinned to their published version" action={<AIAction label="Draft a lesson" prompt="Draft a lesson for an objective" context="Curriculum" />} />
        <CardBody>
          <MiniTable head={["Curriculum", "Collection", "Version", "Status", "Updated"]} rows={versions.map(({ c, v }) => [
            <Link to={`/curriculum/${c.id}`} className="font-medium hover:underline">{c.title}</Link>,
            <Badge tone={c.collection === "SU" ? "su" : "fb"}>{c.collection === "SU" ? "School Upskilling" : "Future Builders"}</Badge>,
            <span className="tabular">{v.label}</span>, <Badge tone={V_TONE[v.status]} dot>{VERSION_LABEL[v.status]}</Badge>, <span className="text-muted">{formatDate(v.createdAt)}</span>,
          ])} />
        </CardBody>
      </Card>
    </>
  );
}
