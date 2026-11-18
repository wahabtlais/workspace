import { Link } from "react-router";
import { Award, CheckCircle2, Circle, XCircle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { KeyValue, Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AIAction } from "@/components/shell/AskPanel";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useData, useLookup } from "@/store/hooks";
import { certificationCriteria } from "@/lib/certification";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const LIFE = ["Applied", "Screening", "Interview", "Offer", "Onboarding", "In training", "Certified", "Deployed"];

export function CriteriaList({ criteria }: { criteria: ReturnType<typeof certificationCriteria> }) {
  return (
    <ul className="divide-y divide-line">
      {criteria.map((c) => (
        <li key={c.key} className="flex items-center gap-3 py-2.5">
          {c.met === true ? <CheckCircle2 className="size-5 text-emerald-600" /> : c.met === false ? <XCircle className="size-5 text-red-600" /> : <Circle className="size-5 text-line-strong" />}
          <span className="flex-1 text-[14px]">{c.label}</span>
          <span className={cn("text-[13px] tabular", c.met === false ? "font-medium text-red-700" : "text-muted")}>{c.detail}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TFProfile({ id }: { id: string }) {
  const d = useData();
  const L = useLookup();
  const tf = d.tfs.find((t) => t.id === id);
  if (!tf) return <Workspace area="su" title="Teaching Fellow not found"><p>Unknown record.</p></Workspace>;
  const crit = certificationCriteria(d, tf);
  const stageIdx = LIFE.indexOf(tf.stage === "Alumni" ? "Deployed" : tf.stage);
  const obs = d.visits.filter((v) => v.tfId === tf.id).sort((a, b) => b.date.localeCompare(a.date));
  const classes = d.classes.filter((c) => c.teacherId === tf.id);
  return (
    <Workspace area="su" hideSubnav title={tf.name} description={`${tf.background} · ${d.tfCohorts.find((c) => c.id === tf.cohortId)?.name}`}
      crumbs={[{ label: "School Upskilling", to: "/school-upskilling" }, { label: "Teaching Fellows", to: "/school-upskilling/teaching-fellows" }, { label: tf.name }]}
      meta={<StatusBadge status={tf.stage} />} aiActions={<AIAction label="Prepare coaching plan" prompt="Draft a coaching plan" context={tf.name} />}>
      <Card>
        <CardHeader title="Lifecycle" />
        <CardBody>
          <ol className="flex flex-wrap gap-1.5">
            {LIFE.map((s, i) => <li key={s} className={cn("rounded-full px-3 py-1 text-[12px] font-medium", i < stageIdx ? "bg-su-50 text-su" : i === stageIdx ? "bg-su text-white" : "bg-slate-100 text-subtle")}>{s}</li>)}
          </ol>
        </CardBody>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card><CardHeader title="Profile" /><CardBody><KeyValue items={[["Email", tf.email], ["Applied", formatDate(tf.appliedAt, { day: "numeric", month: "short", year: "numeric" })], ["Baseline score", tf.preScore !== undefined ? `${tf.preScore}%` : "—"], ["Post score", tf.postScore !== undefined ? `${tf.postScore}%` : "—"], ["School", tf.schoolId ? <Link className="text-brand-700 hover:underline" to={`/school-upskilling/schools/${tf.schoolId}`}>{L.schools.get(tf.schoolId)?.name}</Link> : "Not deployed"], ["Certified", tf.certifiedAt ? formatDate(tf.certifiedAt, { day: "numeric", month: "short", year: "numeric" }) : "—"]]} /></CardBody></Card>
        <Card><CardHeader icon={<Award />} title="Certification criteria" subtitle="Evaluated automatically" /><CardBody><CriteriaList criteria={crit} /></CardBody></Card>
      </div>
      {classes.length > 0 && <Card><CardHeader title="Classes taught" /><CardBody><MiniTable head={["Class", "Pupils", "Timetable"]} rows={classes.map((c) => [`Grade ${c.grade}-${c.section}`, c.pupilIds.length, c.period])} /></CardBody></Card>}
      <Card><CardHeader title="Observations & coaching" /><CardBody><MiniTable empty="No visits yet" head={["Date", "Purpose", "Officer", "Score", "Status"]} rows={obs.map((v) => [formatDate(v.date), v.purpose, L.person(v.officerId), v.score !== undefined ? `${v.score} / 4` : "—", <StatusBadge status={v.status} />])} /></CardBody></Card>
    </Workspace>
  );
}
