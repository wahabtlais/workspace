import { useState } from "react";
import { Link, useParams } from "react-router";
import { CalendarPlus, ChevronDown, FileText, Lock, Mail, MapPin, Phone, Video } from "lucide-react";
import type { CalendarEvent } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { Dialog, Menu, MenuContent, MenuItem, MenuTrigger, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { KeyValue, Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AIMenu } from "@/components/shell/AskPanel";
import { MiniTable } from "@/pages/staff/home/widgets";
import { EventEditor } from "@/pages/mywork/CalendarPage";
import { pupilAttendanceAccess } from "@/config/access";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { attendanceRate, sessionProgress } from "@/lib/metrics";
import { addDays, DEMO_TODAY, formatDate } from "@/lib/utils";
import { PupilAttendancePanel } from "./PupilAttendancePanel";

const DAYS = ["", "Mon", "Tue", "Wed", "Thu", "Fri"];
type Draft = Omit<CalendarEvent, "id"> & { id?: string };

export default function SchoolProfile() {
  const { id } = useParams();
  const d = useData();
  const L = useLookup();
  const persona = usePersona();
  const [meeting, setMeeting] = useState<Draft>();
  const s = d.schools.find((x) => x.id === id);
  if (!s) return <Workspace area="su" title="School not found"><p>Unknown school.</p></Workspace>;
  const classes = d.classes.filter((c) => c.schoolId === s.id);
  const visits = d.visits.filter((v) => v.schoolId === s.id).sort((a, b) => b.date.localeCompare(a.date));
  const tfs = d.tfs.filter((t) => t.schoolId === s.id);
  const pupilTab = pupilAttendanceAccess(persona).level !== "none";
  const docs = d.documents.filter((x) => x.context.includes(s.name.split(" ")[0]));
  const regs = d.registers.filter((r) => r.kind === "pupil" && classes.some((c) => c.id === r.contextId));
  const sessions = d.assessmentSessions.filter((x) => x.schoolId === s.id);
  const followUps = d.followUps.filter((f) => f.schoolId === s.id).sort((a, b) => a.due.localeCompare(b.due));
  const events = d.events.filter((e) => e.related?.kind === "school" && e.related.id === s.id).sort((a, b) => b.date.localeCompare(a.date));
  const cur = d.curricula.find((c) => c.id === "cur-cls")!;
  const live = cur.versions.filter((v) => v.status === "published").pop();
  const next = cur.versions[cur.versions.length - 1];
  const obsScores = visits.filter((v) => v.score !== undefined);
  const me = persona.staffId ?? "s-maya";
  const ask = (who: "principal" | "trainer") => setMeeting({
    title: who === "principal" ? `Meeting with ${s.principal}: Term 1 progress` : `Planning with ${L.person(s.trainerId)}: ${s.name.split(" ")[0]}`,
    type: "Meeting", date: addDays(DEMO_TODAY, 3), start: "10:00", end: "11:00", location: who === "principal" ? s.name : undefined, online: who === "trainer", organizerId: me,
    participantIds: [...new Set([me, who === "trainer" ? s.trainerId : s.poId])], externalParticipants: who === "principal" ? [`${s.principal} (principal)`] : undefined,
    agenda: who === "principal" ? "1. Term 1 attendance and assessment completion\n2. Visit findings and follow-ups\n3. Term 2 timetable" : "1. Coaching priorities\n2. TF observation results\n3. Post-assessment preparation",
    related: { kind: "school", id: s.id, label: s.name },
  });

  return (
    <Workspace area="su" title={s.name} hideSubnav
      crumbs={[{ label: "School Upskilling", to: "/school-upskilling" }, { label: "Schools", to: "/school-upskilling/schools" }, { label: s.name }]}
      description={`${s.region} · partner since ${formatDate(s.joined, { month: "long", year: "numeric" })}`}
      meta={<><StatusBadge status={s.status} /><StatusBadge status={s.mouStatus} /></>}
      actions={<Menu><MenuTrigger asChild><Button variant="secondary"><CalendarPlus /> Request a meeting <ChevronDown className="size-3.5" /></Button></MenuTrigger><MenuContent><MenuItem onSelect={() => ask("principal")}>With the principal ({s.principal})</MenuItem><MenuItem onSelect={() => ask("trainer")}>With the trainer ({L.person(s.trainerId)})</MenuItem></MenuContent></Menu>}
      aiActions={<AIMenu context={s.name} items={[{ label: "Summarize this school", prompt: `Summarize the school profile for ${s.name}` }, { label: "Prepare a visit brief", prompt: `Prepare a visit brief for ${s.name}` }, { label: "Analyze observations", prompt: `Analyze observations for ${s.name}` }, { label: "Draft a visit report", prompt: `Draft visit report for ${s.name}` }, { label: "Suggest follow-up actions", prompt: `Suggest follow-up actions for ${s.name}` }, { label: "Identify missing submissions", prompt: "Show assessment submission status" }]} />}>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classes">Classes ({classes.length})</TabsTrigger>
          <TabsTrigger value="attendance"><span className="inline-flex items-center gap-1">{!pupilTab && <Lock className="size-3" />}Pupil attendance</span></TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="assessments">Assessments ({sessions.length})</TabsTrigger>
          <TabsTrigger value="visits">Visits ({visits.length})</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups ({followUps.filter((f) => f.status !== "Done").length})</TabsTrigger>
          <TabsTrigger value="meetings">Meetings & contacts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card><CardBody className="pt-5"><KeyValue cols={4} items={[["Principal", s.principal], ["Grades served", s.grades.map((g) => `Grade ${g}`).join(", ")], ["Project Officer", L.person(s.poId)], ["Trainer", L.person(s.trainerId)], ["Agreement", <>{s.mouStatus} · until {formatDate(s.mouExpires, { day: "numeric", month: "short", year: "numeric" })}</>], ["Classes", classes.length], ["Pupils (records, no accounts)", classes.reduce((a, c) => a + c.pupilIds.length, 0)], ["Teaching Fellows", tfs.length]]} /></CardBody></Card>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4"><p className="text-[12px] text-muted">Pupil attendance this term</p><p className="mt-1 text-[24px] font-semibold tabular">{regs.length ? `${attendanceRate(regs)}%` : "—"}</p><Progress value={attendanceRate(regs)} className="mt-2" /><p className="mt-2 text-[12px] text-muted">{regs.filter((r) => r.status === "missing").length} missing registers · aggregated</p></Card>
            <Card className="p-4"><p className="text-[12px] text-muted">Average observation score</p><p className="mt-1 text-[24px] font-semibold tabular">{obsScores.length ? (obsScores.reduce((a, v) => a + v.score!, 0) / obsScores.length).toFixed(1) : "—"} <span className="text-[14px] font-normal text-muted">/ 4</span></p><p className="mt-2 text-[12px] text-muted">{obsScores.length} observations · coaching threshold 2.5</p></Card>
            <Card className="p-4"><p className="text-[12px] text-muted">Pupil assessments 2026–27</p><p className="mt-1 text-[24px] font-semibold tabular">{sessions.filter((x) => x.status === "Closed").length}/{sessions.length}</p><p className="mt-2 text-[12px] text-muted">sessions closed · {sessions.filter((x) => x.status === "Live").length} live now</p></Card>
          </div>
          <Card>
            <CardHeader title="Teaching Fellows deployed here" />
            <CardBody>
              <MiniTable empty="No Teaching Fellows deployed yet" head={["Teaching Fellow", "Classes", "Latest observation"]} rows={tfs.map((t) => {
                const o = visits.find((v) => v.tfId === t.id && v.score !== undefined);
                return [<Link to={`/school-upskilling/teaching-fellows/${t.id}`} className="font-medium hover:underline">{t.name}</Link>, classes.filter((c) => c.teacherId === t.id).map((c) => `${c.grade}-${c.section}`).join(", ") || "—", o ? `${o.score} / 4 · ${formatDate(o.date)}` : "—"];
              })} />
            </CardBody>
          </Card>
        </TabsContent>
        <TabsContent value="classes" className="mt-4">
          <Card><CardBody className="pt-4">
            <MiniTable head={["Class", "Class teacher", "Timetable", "Pupils", "Attendance"]} rows={classes.map((c) => [
              <Link to={`/school-upskilling/classes/${c.id}`} className="font-medium hover:underline">Grade {c.grade}-{c.section}</Link>,
              <span>{L.person(c.teacherId)} <span className="text-[11px] text-subtle">({c.teacherType === "tf" ? "Teaching Fellow" : "school teacher"})</span></span>,
              <span className="text-muted">{c.days.map((x) => DAYS[x]).join(" & ")} · {c.period}</span>, c.pupilIds.length, `${attendanceRate(regs.filter((r) => r.contextId === c.id))}%`])} />
            <p className="mt-2 text-[12px] text-muted">Open a class for its roster and register history (subject to pupil-data permissions).</p>
          </CardBody></Card>
        </TabsContent>
        <TabsContent value="attendance" className="mt-4"><PupilAttendancePanel schoolId={s.id} /></TabsContent>
        <TabsContent value="curriculum" className="mt-4 space-y-3">
          <Card>
            <CardHeader title={cur.title} subtitle={`Live version ${live?.label ?? "—"} · next version ${next.label} (${next.status.replace("_", " ")})`} action={<Link to="/curriculum/lessons" className="text-[13px] text-brand-600 hover:underline">Open in Curriculum</Link>} />
            <CardBody>
              <MiniTable head={["Grade", "Units taught", "Lessons", "Status"]} rows={s.grades.map((g) => {
                const units = (live?.modules ?? []).filter((m) => (g <= 6 ? !m.title.includes("7–8") : m.title.includes("7–8") || m.title.includes("Unit 2")));
                return [`Grade ${g}`, units.map((u) => u.title.split("·")[0].trim()).join(", ") || "Unit 3 (in next version)", units.reduce((a, u) => a + u.lessons.length, 0), units.length ? <Badge tone="success">Assigned</Badge> : <Badge tone="warning">Waiting for v2.0</Badge>];
              })} />
            </CardBody>
          </Card>
        </TabsContent>
        <TabsContent value="assessments" className="mt-4">
          <Card><CardBody className="pt-4">
            <MiniTable empty="No assessment sessions for this school yet" head={["Assessment", "Class", "Type", "Status", "Submitted", "Not yet saved"]} rows={sessions.map((x) => { const c = sessionProgress(x.entries); return [
              <Link to={`/assessments/tracker/${x.id}`} className="font-medium hover:underline">{x.title}</Link>, L.className(x.classId ?? ""), x.phase === "pre" ? "Pre-assessment" : x.phase === "post" ? "Post-assessment" : "Quiz", <StatusBadge status={x.status} />, `${c.submitted}/${x.entries.length}`,
              c.failed + c.pending_sync + c.not_started + c.in_progress ? <span className="text-amber-800">{c.in_progress} in progress · {c.pending_sync} pending sync · {c.failed} failed · {c.not_started} not started</span> : "—"]; })} />
          </CardBody></Card>
        </TabsContent>
        <TabsContent value="visits" className="mt-4">
          <Card><CardBody className="pt-4">
            <MiniTable head={["Date", "Purpose", "Officer", "Teaching Fellow", "Score", "Notes", "Status"]} rows={visits.map((v) => [formatDate(v.date), v.purpose, L.person(v.officerId), v.tfId ? L.person(v.tfId) : "—", v.score !== undefined ? `${v.score} / 4` : "—", <span className="text-[12px] text-muted">{v.notes ?? "—"}</span>, <StatusBadge status={v.status} />])} />
          </CardBody></Card>
        </TabsContent>
        <TabsContent value="followups" className="mt-4">
          <Card><CardBody className="pt-4">
            <MiniTable empty="No follow-ups for this school" head={["Follow-up", "Owner", "Due", "Source", "Status"]} rows={followUps.map((f) => [f.title, L.person(f.ownerId), <span className={f.due < DEMO_TODAY && f.status !== "Done" ? "text-red-700" : ""}>{formatDate(f.due)}</span>, <span className="text-[12px] text-muted">{f.source}</span>, <StatusBadge status={f.status} />])} />
          </CardBody></Card>
        </TabsContent>
        <TabsContent value="meetings" className="mt-4 space-y-4">
          <Card>
            <CardHeader title="Meetings & communication" action={<Button size="sm" variant="secondary" onClick={() => ask("principal")}><CalendarPlus /> Request a meeting</Button>} />
            <CardBody className="space-y-2">
              {[...events.map((e) => ({ date: e.date, title: e.title, who: [...e.participantIds.map(L.person), ...(e.externalParticipants ?? [])].join(", "), online: !!e.meetLink })), ...visits.filter((v) => v.purpose === "School meeting").map((v) => ({ date: v.date, title: "School meeting (visit)", who: L.person(v.officerId), online: false }))].sort((a, b) => b.date.localeCompare(a.date)).map((m, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-line p-3 text-[13px]"><span className="w-16 shrink-0 text-[12px] text-muted">{formatDate(m.date)}</span><span className="flex-1"><span className="block font-medium">{m.title}{m.online && <Video className="ml-1 inline size-3.5 text-brand-600" />}</span><span className="text-[12px] text-muted">{m.who}</span></span>{m.date >= DEMO_TODAY ? <Badge tone="info">Upcoming</Badge> : <Badge tone="neutral">Held</Badge>}</div>
              ))}
              {events.length === 0 && visits.every((v) => v.purpose !== "School meeting") && <p className="text-[13px] text-muted">No meetings recorded yet.</p>}
            </CardBody>
          </Card>
          <div className="grid gap-3 sm:grid-cols-3">
            {[[s.principal, "Principal"], [L.person(s.poId), "CodeBrave Project Officer"], [L.person(s.trainerId), "CodeBrave Trainer"]].map(([n, r]) => (
              <Card key={n} className="p-4"><p className="font-medium">{n}</p><p className="text-[13px] text-muted">{r}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-muted"><span className="inline-flex items-center gap-1"><Phone className="size-3.5" />+000 00 000 000</span><span className="inline-flex items-center gap-1"><Mail className="size-3.5" />contact@school.example</span><span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{s.region}</span></div>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <Card><CardBody className="space-y-2 pt-4">
            {[...docs, { id: "x", title: `School needs assessment (${s.name})`, type: "Google Doc", updatedAt: s.joined, access: "Inherits from school record" }].map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-line p-3"><FileText className="size-4 text-muted" /><span className="flex-1"><span className="block text-[14px] font-medium">{doc.title}</span><span className="text-[12px] text-muted">{doc.type} · {doc.access}</span></span><span className="text-[12px] text-muted">{formatDate(doc.updatedAt)}</span></div>
            ))}
          </CardBody></Card>
        </TabsContent>
      </Tabs>
      <Dialog open={!!meeting} onOpenChange={(o) => !o && setMeeting(undefined)}>{meeting && <EventEditor initial={meeting} title="Request a meeting" onClose={() => setMeeting(undefined)} />}</Dialog>
    </Workspace>
  );
}
