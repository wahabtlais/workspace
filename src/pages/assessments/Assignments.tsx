import { useState } from "react";
import { CalendarPlus, Plus } from "lucide-react";
import type { AssessmentSession } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/overlay";
import { Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData } from "@/store/hooks";
import { addDays, DEMO_TODAY, formatDate, uid } from "@/lib/utils";

const field = "mt-1 h-9 w-full rounded-lg border border-line px-2 text-[13px] font-normal";

function NewAssignment({ onClose }: { onClose: () => void }) {
  const d = useData();
  const update = useDemo((s) => s.update);
  const forms = d.forms.filter((f) => f.status === "Published");
  const [formId, setForm] = useState(forms[0].id);
  const [target, setTarget] = useState("tfc-2");
  const [date, setDate] = useState(addDays(DEMO_TODAY, 3));
  const targets = [
    ...d.tfCohorts.filter((c) => c.status === "In training").map((c) => ({ id: c.id, label: c.name, kind: "tf" as const })),
    ...d.fbCohorts.filter((c) => c.status === "Active").map((c) => ({ id: c.id, label: c.name, kind: "fb" as const })),
    ...d.classes.map((c) => ({ id: c.id, label: `${d.schools.find((s) => s.id === c.schoolId)?.name} · Grade ${c.grade}-${c.section}`, kind: "pupils" as const })),
  ];
  const save = () => {
    const t = targets.find((x) => x.id === target)!;
    const f = forms.find((x) => x.id === formId)!;
    const cls = d.classes.find((c) => c.id === target);
    const subjects = t.kind === "tf" ? d.tfs.filter((x) => x.cohortId === target).map((x) => x.id) : t.kind === "fb" ? d.students.filter((s) => s.cohortId === target && s.status === "Active").map((s) => s.id) : cls!.pupilIds;
    update((x) => { x.assessmentSessions.push({ id: uid("as"), formId, title: f.title, phase: f.type === "Pre/post test" ? "post" : "quiz", audience: t.kind, academicYear: "2026–27", classId: cls?.id, schoolId: cls?.schoolId, cohortId: cls ? undefined : target, date, conductedBy: cls?.teacherId ?? "s-jad", status: "Scheduled", entries: subjects.map((s) => ({ subjectId: s, status: "not_started" as const })) }); });
    toast({ tone: "success", title: "Assessment assigned", body: `${subjects.length} learners · ${formatDate(date)} · reminders scheduled` });
    onClose();
  };
  return (
    <DialogContent title="New assignment" description="Who responds, about whom, and when." footer={<><DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose><Button onClick={save}>Assign</Button></>}>
      <div className="space-y-3">
        <label className="block text-[13px] font-medium">Form<select className={field} value={formId} onChange={(e) => setForm(e.target.value)}>{forms.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}</select></label>
        <label className="block text-[13px] font-medium">Respondents<select className={field} value={target} onChange={(e) => setTarget(e.target.value)}>{targets.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select></label>
        <label className="block text-[13px] font-medium">Date<input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} /></label>
      </div>
    </DialogContent>
  );
}

export default function Assignments() {
  const d = useData();
  const update = useDemo((s) => s.update);
  const [open, setOpen] = useState(false);
  const byForm = d.forms.map((f) => ({ f, sessions: d.assessmentSessions.filter((s) => s.formId === f.id) })).filter((x) => x.sessions.length);
  const pupilPost = d.assessmentSessions.filter((s) => s.audience === "pupils" && s.phase === "post" && s.academicYear === "2026–27");
  const schedulePost = () => {
    const sessions: AssessmentSession[] = d.classes.map((c) => ({ id: `as-post-${c.id}`, formId: "frm-pupil-pp", title: "Pupil post-assessment 2026–27", phase: "post", audience: "pupils", academicYear: "2026–27", schoolId: c.schoolId, classId: c.id, date: "2027-06-07", conductedBy: c.teacherId, status: "Scheduled", entries: c.pupilIds.map((p) => ({ subjectId: p, status: "not_started" as const })) }));
    update((x) => { x.assessmentSessions.push(...sessions); });
    toast({ tone: "success", title: `Post-assessment scheduled for ${sessions.length} classes`, body: "Week of 7 June 2027. Class teachers get reminders a week before." });
  };
  return (
    <Workspace area="assessments" title="Assignments" description="Assign forms to classes, cohorts or individuals, with dates and reminders."
      actions={<Button onClick={() => setOpen(true)}><Plus /> New assignment</Button>}>
      <Card className="border-su/30">
        <CardHeader icon={<CalendarPlus />} title="Annual pupil assessments 2026–27" subtitle="Every partner class takes the same pre-assessment (October) and post-assessment (June). Results feed annual reporting." />
        <CardBody className="flex flex-wrap items-center gap-3">
          <Badge tone="success">Pre-assessment: {d.assessmentSessions.filter((s) => s.audience === "pupils" && s.phase === "pre").length} classes assigned</Badge>
          {pupilPost.length ? <Badge tone="info">Post-assessment: {pupilPost.length} classes scheduled for June 2027</Badge> : <Button size="sm" variant="secondary" onClick={schedulePost}>Schedule post-assessment for all {d.classes.length} classes</Button>}
        </CardBody>
      </Card>
      <div className="space-y-3">
        {byForm.map(({ f, sessions }) => (
          <Card key={f.id}>
            <CardHeader title={f.title} subtitle={`${f.type} · ${sessions.length} session${sessions.length > 1 ? "s" : ""}`} action={<div className="flex flex-wrap gap-1">{["Scheduled", "Live", "Reconciling", "Closed"].map((st) => { const n = sessions.filter((s) => s.status === st).length; return n ? <StatusBadge key={st} status={`${st}`} /> : null; })}</div>} />
            <CardBody className="pt-0 text-[13px] text-muted">
              {["Scheduled", "Live", "Reconciling", "Closed"].map((st) => { const n = sessions.filter((s) => s.status === st).length; return n ? <span key={st} className="mr-4">{st}: <b className="text-fg">{n}</b></span> : null; })}
              <span>Next date: {formatDate(sessions.map((s) => s.date).filter((x) => x >= DEMO_TODAY).sort()[0] ?? sessions[0].date)}</span>
            </CardBody>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>{open && <NewAssignment onClose={() => setOpen(false)} />}</Dialog>
    </Workspace>
  );
}
