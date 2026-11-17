import { Link } from "react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarCheck, ClipboardList, GraduationCap, MapPin, School, Target, TriangleAlert, Users } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { StatTile } from "@/components/common/StatTile";
import { AIAction } from "@/components/shell/AskPanel";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { useDemo } from "@/store/demoStore";
import { attendanceRate, attendeeRate, registerCompletion, TF_ATTENDANCE_THRESHOLD } from "@/lib/metrics";
import { DEMO_TODAY, formatDate, pct } from "@/lib/utils";
import { MiniTable } from "./widgets";

export function ExecPanel() {
  const d = useData();
  const ind = (id: string) => d.indicators.find((i) => i.id === id)!;
  const latest = (id: string) => { const s = ind(id).series; return [...s].reverse().find((x) => x.value > 0)?.value ?? 0; };
  const rows = d.indicators.map((i) => {
    const v = [...i.series].reverse().find((x) => x.value > 0)?.value ?? 0;
    return { name: i.code, label: i.name, pct: Math.min(130, Math.round((v / i.target) * 100)), v, target: i.target, unit: i.unit };
  });
  const pending = d.decisions.filter((x) => x.status === "Pending").length;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Pupils reached" value={latest("ind-su-reach")} target="900" progress={pct(latest("ind-su-reach"), 900)} icon={<Users />} to="/results" />
        <StatTile label="Learning gain 2025–26" value={`+${latest("ind-su-gain")}`} sub="points, pre → post" target="+20" progress={100} tone="success" icon={<Target />} to="/results/annual" />
        <StatTile label="TFs certified" value={latest("ind-su-cert")} sub="14 in training now" target="26" progress={pct(12, 26)} icon={<GraduationCap />} to="/school-upskilling/teaching-fellows" />
        <StatTile label="Decisions waiting" value={pending} sub="with context, one-click decide" tone="warning" icon={<ClipboardList />} to="/executive/decisions" />
      </div>
      <Card>
        <CardHeader title="Indicators against target" subtitle="Latest value as % of target · 100% = on target" action={<AIAction label="Explain variances" context="Executive overview" prompt="Draft the monthly management report" />} />
        <CardBody>
          <div className="h-[340px]">
            <ResponsiveContainer>
              <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24 }} barCategoryGap={6}>
                <CartesianGrid horizontal={false} stroke="#eef0f3" />
                <XAxis type="number" domain={[0, 130]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={52} interval={0} tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f5f6f8" }} content={({ payload }) => {
                  const r = payload?.[0]?.payload as (typeof rows)[number] | undefined;
                  return r ? <div className="rounded-lg border border-line bg-surface px-3 py-2 text-[12px] shadow-pop"><p className="font-medium">{r.label}</p><p className="text-muted">{r.v}{r.unit === "%" ? "%" : ""} of {r.target}{r.unit === "%" ? "%" : ""} target · {r.pct}%</p></div> : null;
                }} />
                <Bar dataKey="pct" fill="#3366bf" radius={[0, 4, 4, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted"><TriangleAlert className="size-3.5 text-amber-600" /> Off track: observation score 2.8 (target 3.0) and register completion. Every figure links to its source records.</p>
        </CardBody>
      </Card>
    </>
  );
}

function useSchoolRows() {
  const d = useData();
  return d.schools.filter((s) => s.status === "Active").map((s) => {
    const classIds = d.classes.filter((c) => c.schoolId === s.id).map((c) => c.id);
    const regs = d.registers.filter((r) => r.kind === "pupil" && classIds.includes(r.contextId));
    const vis = d.visits.filter((v) => v.schoolId === s.id && v.status !== "Planned").sort((a, b) => b.date.localeCompare(a.date));
    const obs = vis.filter((v) => v.score !== undefined);
    const obsAvg = obs.length ? Math.round((obs.reduce((a, v) => a + (v.score ?? 0), 0) / obs.length) * 10) / 10 : null;
    return { s, att: attendanceRate(regs), completion: registerCompletion(regs).rate, lastVisit: vis[0]?.date, obsAvg };
  });
}

function SchoolTable({ schoolIds }: { schoolIds?: string[] }) {
  const L = useLookup();
  const rows = useSchoolRows().filter((r) => !schoolIds || schoolIds.includes(r.s.id));
  return (
    <MiniTable head={["School", "Project Officer", "Last visit", "Pupil attendance", "Registers", "Observation"]}
      rows={rows.map((r) => [
        <Link to={`/school-upskilling/schools/${r.s.id}`} className="font-medium text-fg hover:text-brand-700 hover:underline">{r.s.name}</Link>,
        <span className="text-muted">{L.person(r.s.poId)}</span>,
        <span className="text-muted">{r.lastVisit ? formatDate(r.lastVisit) : "—"}</span>,
        <span className="flex items-center gap-2"><span className="w-10 tabular">{r.att}%</span><Progress value={r.att} className="w-16" tone={r.att < 80 ? "warning" : "brand"} /></span>,
        <Badge tone={r.completion < 90 ? "warning" : "success"}>{r.completion}%</Badge>,
        r.obsAvg === null ? "—" : <Badge tone={r.obsAvg < 2.5 ? "danger" : r.obsAvg < 3 ? "warning" : "success"}>{r.obsAvg} / 4</Badge>,
      ])} />
  );
}

export function SuPmPanel() {
  const d = useData();
  const pupilRegs = d.registers.filter((r) => r.kind === "pupil");
  const tfRegs = d.registers.filter((r) => r.kind === "tf");
  const cohort = d.tfs.filter((t) => t.cohortId === "tfc-2");
  const below = cohort.filter((t) => attendeeRate(tfRegs, t.id) < TF_ATTENDANCE_THRESHOLD);
  const comp = registerCompletion(pupilRegs);
  const active = d.schools.filter((s) => s.status === "Active").length;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Partner schools" value={active} sub={`${d.schools.length - active} onboarding`} icon={<School />} to="/school-upskilling/schools" />
        <StatTile label="TFs in training" value={cohort.length} sub={`${below.length} below ${TF_ATTENDANCE_THRESHOLD}% attendance`} tone={below.length ? "warning" : "brand"} icon={<GraduationCap />} to="/school-upskilling/training" />
        <StatTile label="Pupil attendance (term)" value={`${attendanceRate(pupilRegs)}%`} target="85%" progress={attendanceRate(pupilRegs)} icon={<CalendarCheck />} to="/school-upskilling/reports" />
        <StatTile label="Register completion" value={`${comp.rate}%`} sub={`${comp.due - comp.done} missing registers`} target="95%" progress={comp.rate} tone={comp.rate < 95 ? "warning" : "success"} icon={<ClipboardList />} />
      </div>
      <Card>
        <CardHeader title="School coverage" subtitle="Aggregated by school. Individual pupil records are not shown here." action={<AIAction label="Find schools not visited" prompt="Which schools haven’t been visited this month?" context="School Upskilling" />} />
        <CardBody><SchoolTable /></CardBody>
      </Card>
    </>
  );
}

export function SuPoPanel() {
  const d = useData();
  const p = usePersona();
  const L = useLookup();
  const queue = useDemo((s) => s.syncQueue);
  const mine = p.scope.schoolIds ?? [];
  const today = d.visits.filter((v) => v.officerId === p.staffId && v.date === DEMO_TODAY);
  const upcoming = d.visits.filter((v) => v.officerId === p.staffId && v.status === "Planned" && v.date > DEMO_TODAY);
  const follow = d.followUps.filter((f) => f.ownerId === p.staffId && f.status !== "Done");
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Visits today" value={today.length} sub={`${upcoming.length} more this week`} icon={<MapPin />} to="/school-upskilling/visits" />
        <StatTile label="Open follow-ups" value={follow.length} sub="coaching & actions" icon={<ClipboardList />} to="/school-upskilling/follow-ups" />
        <StatTile label="My schools" value={mine.length} icon={<School />} to="/school-upskilling/schools" />
        <StatTile label="Unsynced items" value={queue.length} sub={queue.length ? "Reconnect to sync" : "Everything is synced"} tone={queue.length ? "warning" : "success"} icon={<CalendarCheck />} />
      </div>
      <Card>
        <CardHeader title="Today in the field" subtitle={formatDate(DEMO_TODAY, { weekday: "long", day: "numeric", month: "long" })} action={<AIAction label="Draft visit report" context="Cedar Hill Public School" prompt="Draft visit report for Cedar Hill" />} />
        <CardBody className="space-y-2">
          {today.map((v) => (
            <Link key={v.id} to="/school-upskilling/visits" className="flex items-center gap-3 rounded-lg border border-line p-3 hover:border-brand-200">
              <span className="flex size-9 items-center justify-center rounded-lg bg-su-50 text-su"><MapPin className="size-4" /></span>
              <span className="min-w-0 flex-1"><span className="block font-medium">{L.schools.get(v.schoolId)?.name}</span><span className="block text-[12px] text-muted">{v.purpose}{v.tfId ? ` · ${L.person(v.tfId)}` : ""}</span></span>
              <Badge tone="info">Planned</Badge>
            </Link>
          ))}
          <div className="pt-2"><SchoolTable schoolIds={mine} /></div>
        </CardBody>
      </Card>
    </>
  );
}

export function SuTrainerPanel() {
  const d = useData();
  const tfRegs = d.registers.filter((r) => r.kind === "tf");
  const cohort = d.tfs.filter((t) => t.cohortId === "tfc-2");
  const next = d.trainingSessions.find((s) => s.date >= DEMO_TODAY);
  const backlog = d.submissions.filter((s) => s.status === "Submitted" && s.assignmentId.startsWith("asg-tf")).length;
  const live = d.assessmentSessions.find((s) => s.id === "as-tf-mid");
  const submitted = live?.entries.filter((e) => e.status === "submitted").length ?? 0;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Next session" value={next ? (next.date === DEMO_TODAY ? "Today" : formatDate(next.date)) : "—"} sub={next?.title} icon={<CalendarCheck />} to="/school-upskilling/training" />
        <StatTile label="Cohort attendance" value={`${attendanceRate(tfRegs)}%`} target={`${TF_ATTENDANCE_THRESHOLD}%`} progress={attendanceRate(tfRegs)} icon={<Users />} />
        <StatTile label="Grading backlog" value={backlog} sub="TF assignments to grade" tone={backlog ? "warning" : "success"} icon={<GraduationCap />} to="/learning/grading" />
        <StatTile label="Live checkpoint" value={`${submitted}/${live?.entries.length ?? 0}`} sub="submitted so far" icon={<ClipboardList />} to="/assessments/tracker" />
      </div>
      <Card>
        <CardHeader title="TF Cohort 2026–27" subtitle={`Training attendance · certification threshold ${TF_ATTENDANCE_THRESHOLD}%`} action={<AIAction label="Summarise attendance" prompt="Summarise TF training attendance" />} />
        <CardBody>
          <MiniTable head={["Teaching Fellow", "Background", "Baseline", "Attendance", "Criterion"]}
            rows={cohort.map((t) => { const r = attendeeRate(tfRegs, t.id); return [
              <span className="font-medium">{t.name}</span>, <span className="text-muted">{t.background}</span>, <span className="tabular">{t.preScore}%</span>,
              <span className="flex items-center gap-2"><span className="w-12 tabular">{r}%</span><Progress value={r} className="w-16" tone={r < TF_ATTENDANCE_THRESHOLD ? "danger" : "success"} /></span>,
              r < TF_ATTENDANCE_THRESHOLD ? <Badge tone="danger" dot>Not met</Badge> : <Badge tone="success" dot>Met</Badge>,
            ]; })} />
        </CardBody>
      </Card>
    </>
  );
}
