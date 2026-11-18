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
import { formatDate } from "@/lib/utils";


import { useLiveIndicators } from "@/lib/indicators";
export { useLiveIndicators };

const DEFINITIONS: Record<string, [string, string, string]> = {
  "ind-su-reach": ["Number of pupils enrolled in classes taught with CodeBrave curriculum in partner schools.", "Count of pupil records on active class rosters.", "Academic year 2026–27, to date"],
  "ind-su-gain": ["Average improvement between the annual pupil pre-assessment and post-assessment.", "Mean of (post average − pre average) per class, for classes with both results.", "Academic year 2025–26 (completed)"],
  "ind-su-att": ["Share of expected pupil attendance at CodeBrave classroom sessions.", "(Present + late) ÷ (all marks − excused), submitted registers only.", "Term 1, 2026–27"],
  "ind-su-reg": ["Share of scheduled class registers that were submitted.", "Submitted or pending-sync registers ÷ scheduled registers. Registers are never auto-filled.", "Term 1, 2026–27"],
  "ind-su-cert": ["Teaching Fellows who met every certification criterion and were certified.", "Count of Teaching Fellows with a certification date.", "Cumulative since 2024"],
  "ind-su-obs": ["Average classroom observation score for Teaching Fellows (rubric 1–4).", "Mean of observation scores recorded since 1 September.", "Term 1, 2026–27"],
  "ind-su-visit": ["Share of active partner schools visited in the last 30 days.", "Schools with a completed visit in the last 30 days ÷ active schools.", "Rolling 30 days"],
  "ind-fb-active": ["Future Builders students currently active in the 2026–27 cohort.", "Count of students with status Active.", "Cohort 2026–27"],
  "ind-fb-att": ["Share of expected attendance at Future Builders sessions.", "(Present + late) ÷ (all marks − excused).", "Cohort 2026–27, to date"],
  "ind-fb-intern": ["Students placed in, or who completed, an internship.", "Count of placements at stage Placed or Completed.", "Academic year 2026–27"],
};

export function IndicatorLibrary() {
  const L = useLookup();
  const rows = useLiveIndicators();
  return (
    <Workspace area="results" title="Indicator library" description="Official figures with provenance. Live indicators recalculate as programs record attendance, results and decisions.">
      <DataTable rows={rows} rowLink={(i) => `/results/${i.id}`} search={(i) => `${i.code} ${i.name}`} filters={[{ key: "p", label: "Program", options: ["SU", "FB", "Org"], get: (i) => i.program }]}
        columns={[
          { key: "c", header: "Code", sort: (i) => i.code, cell: (i) => <span className="tabular text-muted">{i.code}</span> },
          { key: "n", header: "Indicator", cell: (i) => <span className="font-medium">{i.name}{i.live ? <Badge tone="info" className="ml-2">Live</Badge> : <Badge tone="neutral" className="ml-2" title="Illustrative figure for the prototype: not calculated from platform records.">Illustrative</Badge>}</span> },
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
      crumbs={[{ label: "Results & Indicators", to: "/results" }, { label: "Indicator library", to: "/results/library" }, { label: i.code }]} aiActions={<AIAction label="Explain this variance" prompt="Draft an indicator variance note" context={i.code} />}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card><CardHeader title="Trend" subtitle={`Target ${i.target}${i.unit === "%" ? "%" : ""} · earlier months are illustrative snapshots${i.live ? "; the latest point is calculated live" : ""}`} /><CardBody>
          <div className="h-[240px]"><ResponsiveContainer><LineChart data={series} margin={{ left: -12, right: 16, top: 8 }}><CartesianGrid vertical={false} stroke="#eef0f3" /><XAxis dataKey="period" tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} /><Tooltip /><ReferenceLine y={i.target} stroke="#8a94a3" strokeDasharray="4 4" label={{ value: "Target", fontSize: 11, fill: "#5f6b7a", position: "insideTopRight" }} /><Line dataKey="value" stroke="#3366bf" strokeWidth={2} dot={{ r: 4, fill: "#3366bf", stroke: "#fff", strokeWidth: 2 }} /></LineChart></ResponsiveContainer></div>
        </CardBody></Card>
        <Card><CardHeader title="Details" /><CardBody><KeyValue cols={2} items={[["Current", `${i.current}${i.unit === "%" ? "%" : ""}`], ["Baseline", i.baseline], ["Owner", L.person(i.ownerId)], ["Computation", i.live ? "Live from platform records" : "Illustrative snapshot (not calculated)"]]} /><p className="mt-4 text-[12px] font-medium text-muted">Used in grants</p>{grants.map((g) => <Link key={g.id} to={`/fundraising/grants/${g.id}`} className="block text-[13px] text-brand-700 hover:underline">{g.title}</Link>)}</CardBody></Card>
      </div>
      <Card><CardHeader title="Definition" subtitle={i.live ? "Calculated live from platform records" : "Illustrative snapshot, not calculated from platform records"} /><CardBody><KeyValue cols={2} items={[["What it measures", DEFINITIONS[i.id]?.[0] ?? i.name], ["How it is calculated", DEFINITIONS[i.id]?.[1] ?? "Recorded manually by the indicator owner (illustrative in the prototype)."], ["Period", DEFINITIONS[i.id]?.[2] ?? "Academic year 2026–27"], ["Target and owner", `${i.target}${i.unit === "%" ? "%" : ""} · ${L.person(i.ownerId)}`], ["Evidence", <Link to="/results/evidence" className="text-brand-700 hover:underline">Evidence library (consented stories and documents)</Link>]]} /></CardBody></Card>
      <Card><CardHeader icon={<Database />} title="Provenance" subtitle="The records behind this number (aggregated where learners are minors)" /><CardBody>
        <MiniTable head={["Source", "Records", "Last updated"]} rows={[[i.source, i.id.startsWith("ind-su") ? `${d.schools.filter((s) => s.status === "Active").length} schools · ${d.classes.length} classes` : `${d.fbCohorts.length} cohorts`, formatDate("2026-11-17")], ["Data checks", "No duplicates · 0 rejected rows", formatDate("2026-11-16")]]} />
      </CardBody></Card>
    </Workspace>
  );
}
