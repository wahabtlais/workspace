import { Link } from "react-router";
import { CalendarCheck, ClipboardList, GraduationCap, MapPin, School, TrendingDown } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/common/StatTile";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Workspace } from "@/components/common/Workspace";
import { AIAction } from "@/components/shell/AskPanel";
import { useData, useLookup } from "@/store/hooks";
import { attendanceRate, registerCompletion } from "@/lib/metrics";
import { DEMO_TODAY, formatDate, relativeDay } from "@/lib/utils";

const STAGES = ["Applied", "Screening", "Interview", "Offer", "Onboarding", "In training", "Certified", "Deployed", "Alumni"] as const;

export default function SUOverview() {
  const d = useData();
  const L = useLookup();
  const pupilRegs = d.registers.filter((r) => r.kind === "pupil");
  const comp = registerCompletion(pupilRegs);
  const upcoming = d.visits.filter((v) => v.status === "Planned").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const overdue = d.followUps.filter((f) => f.program === "SU" && f.status !== "Done" && f.due < DEMO_TODAY);
  const sessions = d.assessmentSessions.filter((s) => s.audience === "pupils");
  return (
    <Workspace area="su" title="School Upskilling" description="Partner schools, Teaching Fellows, classroom delivery and results in one place."
      aiActions={<AIAction label="Draft monthly report" prompt="Draft the School Upskilling monthly report" context="School Upskilling" />}
      actions={<Button asChild><Link to="/school-upskilling/visits">Plan a visit</Link></Button>}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Active partner schools" value={d.schools.filter((s) => s.status === "Active").length} sub={`${d.classes.length} classes · ${d.pupils.length} pupils`} icon={<School />} to="/school-upskilling/schools" />
        <StatTile label="Pupil attendance (term)" value={`${attendanceRate(pupilRegs)}%`} target="85%" progress={attendanceRate(pupilRegs)} icon={<CalendarCheck />} to="/school-upskilling/reports" />
        <StatTile label="Register completion" value={`${comp.rate}%`} sub={`${comp.due - comp.done} missing registers`} tone={comp.rate < 95 ? "warning" : "success"} progress={comp.rate} icon={<ClipboardList />} to="/school-upskilling/classes" />
        <StatTile label="Pre-assessments closed" value={`${sessions.filter((s) => s.status === "Closed").length}/${sessions.length}`} sub="2026–27 pupil baseline" icon={<GraduationCap />} to="/assessments/tracker" />
      </div>
      <Card>
        <CardHeader title="Teaching Fellow lifecycle" subtitle="All cohorts, by stage" action={<Link to="/school-upskilling/teaching-fellows" className="text-[13px] font-medium text-brand-600 hover:underline">Open Teaching Fellows</Link>} />
        <CardBody>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
            {STAGES.map((s, i) => (
              <div key={s} className="relative rounded-lg border border-line bg-canvas/50 p-3 text-center">
                <p className="text-[22px] font-semibold tabular">{d.tfs.filter((t) => t.stage === s).length}</p>
                <p className="text-[11px] text-muted">{s}</p>
                {i < STAGES.length - 1 && <span className="absolute -right-1.5 top-1/2 hidden h-px w-3 bg-line-strong lg:block" />}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader icon={<MapPin />} title="Upcoming visits" />
          <CardBody className="space-y-2">
            {upcoming.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-lg border border-line p-3">
                <span><span className="block text-[14px] font-medium">{L.schools.get(v.schoolId)?.name}</span><span className="text-[12px] text-muted">{v.purpose} · {L.person(v.officerId)}</span></span>
                <span className="text-[12px] font-medium">{relativeDay(v.date)}</span>
              </div>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader icon={<TrendingDown />} title="Needs attention" subtitle="Overdue follow-ups and rule alerts" />
          <CardBody className="space-y-2">
            {[...overdue, ...d.followUps.filter((f) => f.program === "SU" && f.status !== "Done" && f.due >= DEMO_TODAY).slice(0, 4)].map((f) => (
              <Link key={f.id} to="/school-upskilling/follow-ups" className="flex items-center justify-between gap-3 rounded-lg border border-line p-3 hover:border-brand-200">
                <span className="min-w-0"><span className="block truncate text-[14px] font-medium">{f.title}</span><span className="text-[12px] text-muted">{f.source}</span></span>
                <span className="shrink-0 text-right"><StatusBadge status={f.status} /><span className={`block text-[11px] ${f.due < DEMO_TODAY ? "text-red-700" : "text-muted"}`}>Due {formatDate(f.due)}</span></span>
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>
    </Workspace>
  );
}
