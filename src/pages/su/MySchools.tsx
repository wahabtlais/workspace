import { Link } from "react-router";
import { CalendarCheck, ClipboardCheck, Eye, ListTodo, School } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { attendanceRate, sessionProgress } from "@/lib/metrics";
import { DEMO_TODAY, formatDate, relativeDay } from "@/lib/utils";

/** The schools this person works with: assigned schools for POs and trainers, all partner schools for the manager. */
export function useMySchools() {
  const d = useData();
  const p = usePersona();
  if (p.role === "su_po") return d.schools.filter((s) => p.scope.schoolIds?.includes(s.id));
  if (p.role === "su_trainer") return d.schools.filter((s) => s.trainerId === p.staffId);
  return d.schools;
}

export function MySchools() {
  const d = useData();
  const L = useLookup();
  const p = usePersona();
  const schools = useMySchools();
  const title = p.role === "su_pm" ? "Partner schools" : "My schools";
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><h2 className="text-[16px] font-semibold">{title}</h2><p className="text-[13px] text-muted">{p.role === "su_pm" ? "Every partner school at a glance. Open a school for its full profile." : "The schools assigned to you, with what needs doing at each one."}</p></div>
        <Link to="/school-upskilling/schools" className="text-[13px] font-medium text-brand-600 hover:underline">Directory & comparison</Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {schools.map((s) => {
          const classIds = d.classes.filter((c) => c.schoolId === s.id).map((c) => c.id);
          const regs = d.registers.filter((r) => r.kind === "pupil" && classIds.includes(r.contextId));
          const att = attendanceRate(regs);
          const missing = regs.filter((r) => r.status === "missing").length;
          const vis = d.visits.filter((v) => v.schoolId === s.id);
          const last = vis.filter((v) => v.status !== "Planned" && v.date <= DEMO_TODAY).sort((a, b) => b.date.localeCompare(a.date))[0];
          const next = vis.filter((v) => v.status === "Planned").sort((a, b) => a.date.localeCompare(b.date))[0];
          const obs = vis.filter((v) => v.score !== undefined).sort((a, b) => b.date.localeCompare(a.date))[0];
          const fu = d.followUps.filter((f) => f.schoolId === s.id && f.status !== "Done").length;
          const live = d.assessmentSessions.filter((x) => x.schoolId === s.id && (x.status === "Live" || x.status === "Reconciling"));
          const pend = live.reduce((a, x) => { const c = sessionProgress(x.entries); return a + c.failed + c.pending_sync + c.not_started; }, 0);
          const flags = [obs?.score !== undefined && obs.score < 2.5, missing > 2, fu > 1, s.mouStatus !== "Signed" && s.status === "Active"].filter(Boolean).length;
          return (
            <Link key={s.id} to={`/school-upskilling/schools/${s.id}`}>
              <Card className="h-full p-4 transition hover:border-brand-300">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0"><p className="truncate font-semibold">{s.name}</p><p className="text-[12px] text-muted">{s.region} · PO {L.person(s.poId).split(" ")[0]} · Trainer {L.person(s.trainerId).split(" ")[0]}</p></div>
                  {s.status !== "Active" ? <Badge tone="info">Onboarding</Badge> : flags === 0 ? <Badge tone="success" dot>On track</Badge> : <Badge tone="warning" dot>{flags} to check</Badge>}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[12.5px]">
                  <span className="flex items-center gap-1.5"><CalendarCheck className="size-3.5 text-muted" />{regs.length ? `${att}% attendance` : "No registers yet"}</span>
                  <span className="flex items-center gap-1.5"><Eye className="size-3.5 text-muted" />{obs ? <span className={obs.score! < 2.5 ? "font-medium text-amber-800" : ""}>Obs. {obs.score} / 4</span> : "No observations"}</span>
                  <span className="flex items-center gap-1.5"><School className="size-3.5 text-muted" />{last ? `Visited ${formatDate(last.date)}` : "Not visited yet"}</span>
                  <span className="flex items-center gap-1.5"><ListTodo className="size-3.5 text-muted" />{fu} open follow-up{fu === 1 ? "" : "s"}</span>
                </div>
                {(next || live.length > 0 || s.mouStatus !== "Signed") && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-2.5 text-[11.5px]">
                    {next && <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-emerald-800">Next visit {relativeDay(next.date).toLowerCase()}</span>}
                    {live.length > 0 && <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-amber-900"><ClipboardCheck className="size-3" />Assessment live · {pend} not yet submitted</span>}
                    {s.mouStatus !== "Signed" && <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-700">MoU: {s.mouStatus}</span>}
                  </div>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
