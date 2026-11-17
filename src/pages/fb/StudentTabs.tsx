import { Lock } from "lucide-react";
import type { FBStudent } from "@/data/types";
import { Card, CardBody } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { STATUS_STYLE } from "@/components/attendance/labels";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useData, useLookup } from "@/store/hooks";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function AttendanceTab({ s }: { s: FBStudent }) {
  const d = useData();
  const regs = d.registers.filter((r) => r.kind === "fb" && r.attendeeIds.includes(s.id)).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Card><CardBody className="pt-4">
      <div className="mb-3 flex flex-wrap gap-1" aria-label="Attendance history, oldest first">{[...regs].reverse().map((r) => { const m = r.marks[r.attendeeIds.indexOf(s.id)]; return <span key={r.id} title={`${r.date}: ${m}`} className={cn("size-4 rounded-sm", m ? STATUS_STYLE[m].dot : "border border-line")} />; })}</div>
      <MiniTable head={["Date", "Session", "Mark"]} rows={regs.slice(0, 10).map((r) => { const sess = d.fbSessions.find((x) => x.id === r.contextId); return [formatDate(r.date), `${sess?.type}: ${sess?.title}`, r.marks[r.attendeeIds.indexOf(s.id)] ?? "—"]; })} />
    </CardBody></Card>
  );
}

export function LearningTab({ s }: { s: FBStudent }) {
  const d = useData();
  const subs = d.submissions.filter((x) => x.learnerId === s.id);
  return <Card><CardBody className="pt-4"><MiniTable empty="No submissions yet" head={["Assignment", "Submitted", "Status", "Score"]} rows={subs.map((x) => [d.lmsAssignments.find((a) => a.id === x.assignmentId)?.title, formatDate(x.submittedAt), <StatusBadge status={x.status === "Returned" ? "Completed" : "Submitted"} />, x.score ?? "—"])} /></CardBody></Card>;
}

export function ProjectsTab({ s }: { s: FBStudent }) {
  const d = useData();
  const project = d.projects.find((p) => p.id === d.teams.find((t) => t.id === s.teamId)?.projectId);
  return <Card><CardBody className="pt-4">{project ? <MiniTable head={["Milestone", "Due", "Status"]} rows={project.milestones.map((m) => [m.title, formatDate(m.due), <StatusBadge status={m.status} />])} /> : <p className="text-[13px] text-muted">No team project.</p>}</CardBody></Card>;
}

export function MentoringTab({ s }: { s: FBStudent }) {
  const d = useData();
  const L = useLookup();
  return <Card><CardBody className="pt-4"><MiniTable empty="No mentor sessions logged" head={["Date", "Mentor", "Focus", "Notes"]} rows={d.mentorSessions.filter((m) => m.studentId === s.id).map((m) => [formatDate(m.date), L.person(m.mentorId), m.focus, m.notes])} /><p className="mt-2 text-[12px] text-muted">Mentor notes are visible to staff only, never to the student or partners.</p></CardBody></Card>;
}

export function SafeguardingTab({ allowed }: { allowed: boolean }) {
  return <Card className="p-6 text-center">{allowed ? <p className="text-[14px]">No open safeguarding case for this student.</p> : <><Lock className="mx-auto size-6 text-muted" /><p className="mt-3 font-medium">Restricted</p><p className="text-[13px] text-muted">Only designated safeguarding leads can see safeguarding flags. Agents never access them.</p></>}</Card>;
}
