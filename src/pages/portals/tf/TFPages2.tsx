import { Award, BookOpen, Eye, School } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CriteriaList } from "@/pages/su/TFProfile";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useData, useLookup } from "@/store/hooks";
import { certificationCriteria } from "@/lib/certification";
import { formatDate } from "@/lib/utils";
import { useTF } from "./TFPages";

export function Certificate() {
  const d = useData();
  const tf = useTF();
  const crit = certificationCriteria(d, tf);
  return (
    <div className="space-y-4">
      <h1 className="text-[24px] font-semibold">Certificate</h1>
      {tf.certifiedAt ? (
        <Card className="border-su/40 bg-gradient-to-br from-su-50 to-surface p-8 text-center">
          <Award className="mx-auto size-10 text-su" />
          <p className="mt-3 text-[13px] uppercase tracking-wide text-muted">CodeBrave certifies that</p>
          <p className="mt-1 text-[26px] font-semibold">{tf.name}</p>
          <p className="mt-1 text-[14px] text-muted">has completed Teaching Fellow training · {d.tfCohorts.find((c) => c.id === tf.cohortId)?.name}</p>
          <p className="mt-3 text-[12px] text-subtle">Issued {formatDate(tf.certifiedAt, { day: "numeric", month: "long", year: "numeric" })} · fictional certificate</p>
        </Card>
      ) : <Card><CardHeader title="Not certified yet" subtitle="Your progress against the certification criteria" /><CardBody><CriteriaList criteria={crit} /></CardBody></Card>}
    </div>
  );
}

export function Deployment() {
  const d = useData();
  const L = useLookup();
  const tf = useTF();
  const school = tf.schoolId ? L.schools.get(tf.schoolId) : undefined;
  const classes = d.classes.filter((c) => c.teacherId === tf.id);
  const DAYS = ["", "Mon", "Tue", "Wed", "Thu", "Fri"];
  return (
    <div className="space-y-4">
      <h1 className="text-[24px] font-semibold">My deployment</h1>
      {school ? <>
        <Card className="flex items-center gap-3 p-4"><School className="size-6 text-su" /><div><p className="font-semibold">{school.name}</p><p className="text-[13px] text-muted">{school.region} · principal {school.principal} · Project Officer {L.person(school.poId)}</p></div></Card>
        <Card><CardHeader title="Timetable" /><CardBody><MiniTable head={["Class", "Days", "Period", "Pupils"]} rows={classes.map((c) => [`Grade ${c.grade}-${c.section}`, c.days.map((x) => DAYS[x]).join(" & "), c.period, c.pupilIds.length])} /></CardBody></Card>
      </> : <Card className="p-6 text-[14px] text-muted">You’ll be assigned to a school after certification. Your Project Manager will confirm the school and timetable here.</Card>}
    </div>
  );
}

export function Coaching() {
  const d = useData();
  const L = useLookup();
  const tf = useTF();
  const obs = d.visits.filter((v) => v.tfId === tf.id && v.status !== "Planned").sort((a, b) => b.date.localeCompare(a.date));
  const actions = d.followUps.filter((f) => f.tfId === tf.id);
  return (
    <div className="space-y-4">
      <h1 className="text-[24px] font-semibold">Observations & coaching</h1>
      <Card><CardHeader icon={<Eye />} title="Observations" /><CardBody><MiniTable empty="No observations yet" head={["Date", "Visit", "Observer", "Score"]} rows={obs.map((v) => [formatDate(v.date), v.purpose, L.person(v.officerId), v.score !== undefined ? `${v.score} / 4` : "—"])} /></CardBody></Card>
      <Card><CardHeader title="Coaching actions" /><CardBody>{actions.length ? actions.map((a) => <p key={a.id} className="flex items-center justify-between border-b border-line py-2 text-[14px] last:border-0">{a.title}<Badge tone="info">{a.status}</Badge></p>) : <p className="text-[13px] text-muted">No coaching actions right now.</p>}</CardBody></Card>
    </div>
  );
}

export function TFResources() {
  const d = useData();
  return (
    <div className="space-y-3">
      <h1 className="text-[24px] font-semibold">Resources</h1>
      {d.resources.filter((r) => r.collection === "SU").map((r) => <Card key={r.id} className="flex items-center gap-3 p-4"><BookOpen className="size-5 text-su" /><span className="flex-1"><span className="block font-medium">{r.title}</span><span className="text-[12px] text-muted">{r.kind}</span></span><Badge tone="outline">{r.objectiveIds.map((o) => d.objectives.find((x) => x.id === o)?.code).join(", ")}</Badge></Card>)}
    </div>
  );
}
