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
const PHASE = { pre: "Pre-assessment", post: "Post-assessment", quiz: "Course assessment" } as const;
const VERSION = (aud: string) => aud === "pupils" ? "Classroom Digital Skills v1.0" : aud === "tf" ? "TF Foundations v1.0" : "FB pathway course";

const LEGEND: [string, string, string][] = [
  ["bg-emerald-500", "Submitted", "Saved on the server. Only these count as submitted."],
  ["bg-brand-400", "In progress", "Started on a device, not yet submitted."],
  ["bg-slate-300", "Not started", "No attempt yet (or not submitted)."],
  ["bg-amber-400", "Pending sync", "Completed offline; waiting to upload."],
  ["bg-red-500", "Failed", "Upload failed; retry or correct."],
  ["bg-white ring-1 ring-slate-400", "Absent", "Recorded at reconciliation instead of a submission; excluded from results."],
];

function AnnualPupilSummary() {
  const d = useData();
  const pupil = d.assessmentSessions.filter((s) => s.audience === "pupils" && s.academicYear === "2026–27");
  const grades = [...new Set(d.classes.map((c) => c.grade))].sort();
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="font-semibold">Annual pupil measurement · 2026–27</p><p className="text-[12.5px] text-muted">Pre/post assessments by grade feed annual results. Post-assessments open in May 2027.</p></div><Link to="/results/annual" className="text-[13px] text-brand-600 hover:underline">Annual results</Link></div>
      <div className="mt-3 overflow-x-auto"><table className="w-full text-[12.5px]"><thead className="text-left text-muted"><tr><th className="py-1.5 pr-3 font-medium">Grade</th><th className="pr-3 font-medium">Classes</th><th className="pr-3 font-medium">Pre: sessions closed</th><th className="pr-3 font-medium">Pre: submitted</th><th className="pr-3 font-medium">Absent</th><th className="pr-3 font-medium">Still open</th><th className="font-medium">Post</th></tr></thead>
        <tbody>{grades.map((g) => {
          const ss = pupil.filter((s) => d.classes.find((c) => c.id === s.classId)?.grade === g && s.phase === "pre");
          const entries = ss.flatMap((s) => s.entries);
          const sub = entries.filter((e) => e.status === "submitted").length;
          const absent = entries.filter((e) => e.resolution === "Absent").length;
          const open = ss.filter((s) => s.status !== "Closed").length;
          return <tr key={g} className="border-t border-line"><td className="py-2 pr-3 font-medium">Grade {g}</td><td className="pr-3">{d.classes.filter((c) => c.grade === g).length}</td><td className="pr-3 tabular">{ss.filter((s) => s.status === "Closed").length}/{ss.length}</td><td className="pr-3 tabular">{entries.length ? Math.round((sub / entries.length) * 100) : 0}% ({sub}/{entries.length})</td><td className="pr-3 tabular">{absent}</td><td className="pr-3">{open ? <Badge tone="warning">{open} open</Badge> : <Badge tone="success">All closed</Badge>}</td><td className="text-muted">May 2027</td></tr>;
        })}</tbody></table></div>
    </Card>
  );
}

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
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-xl border border-line bg-surface px-4 py-3 text-[12px]">{LEGEND.map(([c, l, t]) => <span key={l} className="inline-flex items-center gap-1.5" title={t}><span className={`size-2.5 rounded-sm ${c}`} /><span className="font-medium">{l}</span><span className="hidden text-muted xl:inline">· {t}</span></span>)}</div>
      {sessions.some((s) => s.audience === "pupils") && <AnnualPupilSummary />}
      <DataTable rows={sessions} rowLink={(s) => `/assessments/tracker/${s.id}`} search={(s) => `${sessionContext(d, s)} ${s.title}`} initialSort={{ key: "date", dir: "desc" }}
        filters={[{ key: "st", label: "Status", options: ["Scheduled", "Live", "Reconciling", "Closed"], get: (s) => s.status }, { key: "a", label: "Audience", options: Object.values(AUD), get: (s) => AUD[s.audience] }, { key: "y", label: "Academic year", options: [...new Set(d.assessmentSessions.map((s) => s.academicYear))], get: (s) => s.academicYear }, { key: "ph", label: "Type", options: Object.values(PHASE), get: (s) => PHASE[s.phase] }, { key: "g", label: "Grade", options: [5, 6, 7, 8].map((g) => `Grade ${g}`), get: (s) => { const c = d.classes.find((x) => x.id === s.classId); return c ? `Grade ${c.grade}` : "—"; } }, { key: "sch", label: "School", options: d.schools.map((x) => x.name), get: (s) => L.schools.get(s.schoolId ?? "")?.name ?? "—" }, { key: "ph", label: "Type", options: ["pre", "post", "quiz"], get: (s) => s.phase }]}
        columns={[
          { key: "ctx", header: "Class / cohort", sort: (s) => sessionContext(d, s), cell: (s) => <span><span className="block font-medium">{sessionContext(d, s)}</span><span className="text-[12px] text-muted">{s.title}</span></span> },
          { key: "type", header: "Type", cell: (s) => <span className="text-[12.5px]"><span className="block">{PHASE[s.phase]}</span><span className="text-muted">{s.academicYear} · {VERSION(s.audience)}</span></span>, hideOnMobile: true },
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
