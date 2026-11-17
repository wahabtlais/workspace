import { Link, useParams } from "react-router";
import { Radio } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable } from "@/components/data/DataTable";
import { SegmentBar, SessionTracker } from "@/components/assessment/SessionTracker";
import { pupilAttendanceAccess, access } from "@/config/access";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { sessionProgress } from "@/lib/metrics";
import { sessionContext, subjectNamer } from "@/lib/names";
import { formatDate, relativeDay } from "@/lib/utils";

const AUD = { pupils: "School pupils", tf: "Teaching Fellows", fb: "FB students" } as const;

function visibleSessions(role: string) {
  if (role === "su_trainer") return (a: string) => a === "tf";
  if (role === "fb_trainer" || role === "fb_pm" || role === "fb_po") return (a: string) => a === "fb";
  if (role === "su_po") return (a: string) => a === "pupils";
  return () => true;
}

export function TrackerList() {
  const d = useData();
  const persona = usePersona();
  const L = useLookup();
  const ok = visibleSessions(persona.role);
  const scoped = persona.scope.schoolIds;
  const sessions = d.assessmentSessions.filter((s) => ok(s.audience) && (!scoped || !s.schoolId || scoped.includes(s.schoolId)));
  const live = sessions.filter((s) => s.status === "Live" || s.status === "Reconciling");
  return (
    <Workspace area="assessments" title="Live submission tracker" description="Who has submitted, who hasn’t, and which records failed or are waiting to sync. Sessions are reconciled before they close.">
      {live.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {live.map((s) => {
            const p = sessionProgress(s.entries);
            return (
              <Link key={s.id} to={`/assessments/tracker/${s.id}`}>
                <Card className="p-4 transition hover:border-brand-300">
                  <div className="flex items-center justify-between gap-2"><span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-700"><Radio className="size-3.5" />{s.status === "Live" ? "LIVE" : "RECONCILING"}</span><Badge tone="outline">{AUD[s.audience]}</Badge></div>
                  <p className="mt-2 font-semibold">{sessionContext(d, s)}</p>
                  <p className="text-[12px] text-muted">{s.title} · {L.person(s.conductedBy)}</p>
                  <div className="mt-3"><SegmentBar entries={s.entries} /></div>
                  <p className="mt-2 flex flex-wrap gap-x-3 text-[12px] text-muted"><span>{p.submitted}/{s.entries.length} submitted</span>{p.failed > 0 && <span className="text-red-700">{p.failed} failed</span>}{p.pending_sync > 0 && <span className="text-amber-700">{p.pending_sync} waiting to sync</span>}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
      <DataTable rows={sessions} rowLink={(s) => `/assessments/tracker/${s.id}`} search={(s) => `${sessionContext(d, s)} ${s.title}`} initialSort={{ key: "date", dir: "desc" }}
        filters={[{ key: "st", label: "Status", options: ["Scheduled", "Live", "Reconciling", "Closed"], get: (s) => s.status }, { key: "a", label: "Audience", options: Object.values(AUD), get: (s) => AUD[s.audience] }, { key: "ph", label: "Type", options: ["pre", "post", "quiz"], get: (s) => s.phase }]}
        columns={[
          { key: "ctx", header: "Class / cohort", sort: (s) => sessionContext(d, s), cell: (s) => <span><span className="block font-medium">{sessionContext(d, s)}</span><span className="text-[12px] text-muted">{s.title}</span></span> },
          { key: "date", header: "Date", sort: (s) => s.date, cell: (s) => relativeDay(s.date) },
          { key: "st", header: "Status", sort: (s) => s.status, cell: (s) => <StatusBadge status={s.status} /> },
          { key: "p", header: "Progress", cell: (s) => <span className="flex items-center gap-2"><span className="w-28"><SegmentBar entries={s.entries} /></span><span className="tabular text-[12px]">{sessionProgress(s.entries).submitted}/{s.entries.length}</span></span> },
          { key: "by", header: "Conducted by", cell: (s) => <span className="text-muted">{L.person(s.conductedBy)}</span>, hideOnMobile: true },
        ]} />
    </Workspace>
  );
}

export function TrackerDetail() {
  const { id } = useParams();
  const d = useData();
  const persona = usePersona();
  const L = useLookup();
  const s = d.assessmentSessions.find((x) => x.id === id);
  if (!s) return <Workspace area="assessments" title="Session not found"><p>Unknown session.</p></Workspace>;
  const pupilLevel = pupilAttendanceAccess(persona).level;
  const nameFor = subjectNamer(d, { pupilsAsCodes: s.audience === "pupils" && pupilLevel !== "individual" });
  const canManage = access(persona, "assessments") !== "view" && access(persona, "assessments") !== "aggregate";
  return (
    <Workspace area="assessments" hideSubnav title={sessionContext(d, s)} description={`${s.title} · ${formatDate(s.date, { weekday: "long", day: "numeric", month: "long" })} · conducted by ${L.person(s.conductedBy)}`}
      crumbs={[{ label: "Assessments", to: "/assessments" }, { label: "Live tracker", to: "/assessments/tracker" }, { label: sessionContext(d, s) }]}
      meta={s.audience === "pupils" && pupilLevel !== "individual" ? <Badge tone="outline">Pupils shown by roster code</Badge> : undefined}>
      <SessionTracker sessionId={s.id} nameFor={nameFor} canManage={canManage} />
    </Workspace>
  );
}
