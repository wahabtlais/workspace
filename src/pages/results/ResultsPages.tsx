import { Link, useParams } from "react-router";
import { Line, LineChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Database } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { KeyValue, Workspace } from "@/components/common/Workspace";
import { DataTable } from "@/components/data/DataTable";
import { AIAction } from "@/components/shell/AskPanel";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useData, useLookup } from "@/store/hooks";
import { attendanceRate, registerCompletion } from "@/lib/metrics";
import { formatDate } from "@/lib/utils";

const latest = (s: { value: number }[]) => [...s].reverse().find((x) => x.value > 0)?.value ?? 0;

/** Some indicators are computed live from platform records, so actions update them immediately. */
export function useLiveIndicators() {
  const d = useData();
  const pupil = d.registers.filter((r) => r.kind === "pupil");
  const fb = d.registers.filter((r) => r.kind === "fb");
  const live: Record<string, number> = {
    "ind-su-att": attendanceRate(pupil), "ind-su-reg": registerCompletion(pupil).rate, "ind-fb-att": attendanceRate(fb),
    "ind-su-cert": d.tfs.filter((t) => t.certifiedAt).length, "ind-fb-active": d.students.filter((s) => s.cohortId === "fbc-2" && s.status === "Active").length,
  };
  return d.indicators.map((i) => ({ ...i, current: live[i.id] ?? latest(i.series), live: i.id in live }));
}

export function IndicatorLibrary() {
  const L = useLookup();
  const rows = useLiveIndicators();
  return (
    <Workspace area="results" title="Indicator library" description="Official figures with provenance. Live indicators recalculate as programs record attendance, results and decisions.">
      <DataTable rows={rows} rowLink={(i) => `/results/${i.id}`} search={(i) => `${i.code} ${i.name}`} filters={[{ key: "p", label: "Program", options: ["SU", "FB", "Org"], get: (i) => i.program }]}
        columns={[
          { key: "c", header: "Code", sort: (i) => i.code, cell: (i) => <span className="tabular text-muted">{i.code}</span> },
          { key: "n", header: "Indicator", cell: (i) => <span className="font-medium">{i.name}{i.live && <Badge tone="info" className="ml-2">Live</Badge>}</span> },
          { key: "v", header: "Current", sort: (i) => i.current / i.target, cell: (i) => <span className="flex items-center gap-2"><span className="w-14 tabular">{i.current}{i.unit === "%" ? "%" : ""}</span><Progress value={Math.min(100, (i.current / i.target) * 100)} className="w-20" tone={i.current >= i.target * 0.95 ? "success" : "warning"} /></span> },
          { key: "t", header: "Target", cell: (i) => <span className="tabular text-muted">{i.target}{i.unit === "%" ? "%" : ""}</span> },
          { key: "s", header: "Source", cell: (i) => <span className="text-[12px] text-muted">{i.source}</span>, hideOnMobile: true },
          { key: "o", header: "Owner", cell: (i) => <span className="text-muted">{L.person(i.ownerId)}</span>, hideOnMobile: true },
        ]} />
    </Workspace>
  );
}

export function IndicatorDetail() {
  const { id } = useParams();
  const d = useData();
  const L = useLookup();
  const i = useLiveIndicators().find((x) => x.id === id);
  if (!i) return <Workspace area="results" title="Indicator not found"><p>Unknown indicator.</p></Workspace>;
  const series = i.series.filter((s) => s.value > 0).map((s, k, arr) => (k === arr.length - 1 && i.live ? { ...s, value: i.current } : s));
  const grants = d.grants.filter((g) => i.grantIds.includes(g.id));
  return (
    <Workspace area="results" hideSubnav title={`${i.code} · ${i.name}`} description={i.source}
      crumbs={[{ label: "Results & Indicators", to: "/results" }, { label: i.code }]} aiActions={<AIAction label="Explain this variance" prompt="Draft an indicator variance note" context={i.code} />}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card><CardHeader title="Trend" subtitle={`Target ${i.target}${i.unit === "%" ? "%" : ""}`} /><CardBody>
          <div className="h-[240px]"><ResponsiveContainer><LineChart data={series} margin={{ left: -12, right: 16, top: 8 }}><CartesianGrid vertical={false} stroke="#eef0f3" /><XAxis dataKey="period" tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} /><Tooltip /><ReferenceLine y={i.target} stroke="#8a94a3" strokeDasharray="4 4" label={{ value: "Target", fontSize: 11, fill: "#5f6b7a", position: "insideTopRight" }} /><Line dataKey="value" stroke="#3366bf" strokeWidth={2} dot={{ r: 4, fill: "#3366bf", stroke: "#fff", strokeWidth: 2 }} /></LineChart></ResponsiveContainer></div>
        </CardBody></Card>
        <Card><CardHeader title="Details" /><CardBody><KeyValue cols={2} items={[["Current", `${i.current}${i.unit === "%" ? "%" : ""}`], ["Baseline", i.baseline], ["Owner", L.person(i.ownerId)], ["Computation", i.live ? "Live from records" : "Monthly snapshot"]]} /><p className="mt-4 text-[12px] font-medium text-muted">Used in grants</p>{grants.map((g) => <Link key={g.id} to={`/fundraising/grants/${g.id}`} className="block text-[13px] text-brand-700 hover:underline">{g.title}</Link>)}</CardBody></Card>
      </div>
      <Card><CardHeader icon={<Database />} title="Provenance" subtitle="The records behind this number (aggregated where learners are minors)" /><CardBody>
        <MiniTable head={["Source", "Records", "Last updated"]} rows={[[i.source, i.id.startsWith("ind-su") ? `${d.schools.filter((s) => s.status === "Active").length} schools · ${d.classes.length} classes` : `${d.fbCohorts.length} cohorts`, formatDate("2026-11-17")], ["Data checks", "No duplicates · 0 rejected rows", formatDate("2026-11-16")]]} />
      </CardBody></Card>
    </Workspace>
  );
}
