import { Link } from "react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Briefcase, CalendarCheck, ClipboardList, Rocket, ShieldCheck, TriangleAlert, Users } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatTile } from "@/components/common/StatTile";
import { AIAction } from "@/components/shell/AskPanel";
import { useData } from "@/store/hooks";
import { attendanceRate, attendeeRate } from "@/lib/metrics";
import { PATHWAY_LABEL } from "@/data/seed/fb";
import { MiniTable } from "./widgets";

const STAGES = ["Applied", "Screening", "Interview", "Decision", "Admitted", "Waitlist"] as const;

export function FbPmPanel() {
  const d = useData();
  const fbRegs = d.registers.filter((r) => r.kind === "fb");
  const active = d.students.filter((s) => s.cohortId === "fbc-2" && s.status === "Active");
  const pending = d.students.filter((s) => s.status === "Pending consent");
  const funnel = STAGES.map((st) => ({ stage: st, n: d.applicants.filter((a) => a.stage === st).length }));
  const placements = d.placements.filter((p) => p.stage !== "Completed").length;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Active students" value={active.length} sub={`${pending.length} awaiting guardian consent`} target="30" icon={<Users />} to="/future-builders/students" />
        <StatTile label="Session attendance" value={`${attendanceRate(fbRegs)}%`} target="85%" progress={attendanceRate(fbRegs)} icon={<CalendarCheck />} to="/future-builders/attendance" />
        <StatTile label="Internships in progress" value={placements} sub="matching → placed" icon={<Briefcase />} to="/future-builders/internships" />
        <StatTile label="Client projects" value={d.projects.filter((p) => p.kind === "client").length} sub="active this cohort" icon={<Rocket />} to="/future-builders/projects" />
      </div>
      <Card>
        <CardHeader title="Admissions 2027–28" subtitle="Applicants by stage" action={<Link to="/future-builders/admissions" className="text-[13px] font-medium text-brand-600 hover:underline">Open pipeline</Link>} />
        <CardBody>
          <div className="h-[220px]">
            <ResponsiveContainer>
              <BarChart data={funnel} margin={{ left: -16, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#eef0f3" />
                <XAxis dataKey="stage" tick={{ fontSize: 12, fill: "#5f6b7a" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f5f6f8" }} formatter={(v) => [`${v} applicants`, ""]} separator="" />
                <Bar dataKey="n" fill="#3366bf" radius={[4, 4, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {pending.length > 0 && <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted"><ShieldCheck className="size-3.5 text-amber-600" /> {pending.length} admitted students can’t sign in until a guardian gives consent.</p>}
        </CardBody>
      </Card>
    </>
  );
}

export function AtRiskCard() {
  const d = useData();
  const fbRegs = d.registers.filter((r) => r.kind === "fb");
  const rows = d.students.filter((s) => s.cohortId === "fbc-2" && s.status === "Active").map((s) => ({ s, r: attendeeRate(fbRegs, s.id) })).sort((a, b) => a.r - b.r).slice(0, 6);
  return (
    <Card>
      <CardHeader title="Students to watch" subtitle="Lowest attendance in Future Builders 2026–27" action={<AIAction label="Summarise at-risk students" prompt="Which students are at risk?" />} />
      <CardBody>
        <MiniTable head={["Student", "Pathway", "Attendance", "Status"]} rows={rows.map(({ s, r }) => [
          <Link to={`/future-builders/students/${s.id}`} className="font-medium hover:underline">{s.name}</Link>, <span className="text-muted">{PATHWAY_LABEL[s.pathway]}</span>, <span className="tabular">{r}%</span>,
          r < 75 ? <Badge tone="danger" dot>Absence streak</Badge> : r < 85 ? <Badge tone="warning" dot>Watch</Badge> : <Badge tone="success" dot>On track</Badge>,
        ])} />
      </CardBody>
    </Card>
  );
}

export function FbPoPanel() {
  const d = useData();
  const follow = d.followUps.filter((f) => f.program === "FB" && f.status !== "Done");
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Open follow-ups" value={follow.length} sub="absence & consent" tone={follow.length ? "warning" : "success"} icon={<TriangleAlert />} to="/future-builders/attendance" />
        <StatTile label="Consent pending" value={d.students.filter((s) => s.status === "Pending consent").length} sub="accounts inactive" icon={<ShieldCheck />} to="/future-builders/admissions" />
        <StatTile label="Placements in progress" value={d.placements.filter((p) => p.stage !== "Completed").length} icon={<Briefcase />} to="/future-builders/internships" />
        <StatTile label="Hosts pending checks" value={d.organizations.filter((o) => o.type === "Internship host" && o.safeguardingCheck !== "Passed").length} sub="safeguarding due diligence" icon={<ClipboardList />} />
      </div>
      <AtRiskCard />
    </>
  );
}
