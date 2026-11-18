import { Link } from "react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workspace } from "@/components/common/Workspace";
import { StatTile } from "@/components/common/StatTile";
import { DataTable } from "@/components/data/DataTable";
import { MiniTable } from "@/pages/staff/home/widgets";
import { pupilAttendanceAccess } from "@/config/access";
import { useData, usePersona } from "@/store/hooks";
import { sessionContext, subjectNamer } from "@/lib/names";
import { seededRandom } from "@/lib/utils";

export function Responses() {
  const d = useData();
  const persona = usePersona();
  const nameFor = subjectNamer(d, { pupilsAsCodes: pupilAttendanceAccess(persona).level !== "individual" });
  const rows = d.assessmentSessions.flatMap((s) => s.entries.filter((e) => e.status === "submitted" || e.status === "pending_sync").map((e) => ({ s, e })));
  return (
    <Workspace area="assessments" title="Responses" description="All submissions across forms. Pupils appear by roster code unless you hold the pupil-data grant.">
      <DataTable rows={rows} search={({ s, e }) => `${nameFor(e.subjectId)} ${sessionContext(d, s)} ${s.title}`} pageSize={30}
        filters={[{ key: "f", label: "Form", options: [...new Set(rows.map((r) => r.s.title))], get: (r) => r.s.title }, { key: "a", label: "Audience", options: ["pupils", "tf", "fb"], get: (r) => r.s.audience }]}
        columns={[
          { key: "w", header: "Respondent", sort: (r) => nameFor(r.e.subjectId), cell: (r) => <span className="font-medium">{nameFor(r.e.subjectId)}</span> },
          { key: "s", header: "Session", cell: (r) => <Link to={`/assessments/tracker/${r.s.id}`} className="hover:underline">{sessionContext(d, r.s)}</Link> },
          { key: "f", header: "Form", cell: (r) => <span className="text-muted">{r.s.title}</span>, hideOnMobile: true },
          { key: "sc", header: "Score", sort: (r) => r.e.score ?? 0, cell: (r) => <span className="tabular">{r.e.score ?? "—"}%</span> },
          { key: "dv", header: "Device", cell: (r) => <span className="text-muted">{r.e.device}</span>, hideOnMobile: true },
          { key: "st", header: "Status", cell: (r) => r.e.status === "pending_sync" ? <Badge tone="warning">Waiting to sync</Badge> : <Badge tone="success">Received</Badge> },
        ]} />
    </Workspace>
  );
}

export function Analytics() {
  const d = useData();
  const tfBase = d.assessmentSessions.find((s) => s.id === "as-tf-base")!;
  const tfMid = d.assessmentSessions.find((s) => s.id === "as-tf-mid")!;
  const avg = (xs: (number | null | undefined)[]) => { const v = xs.filter((x): x is number => typeof x === "number"); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0; };
  const rand = seededRandom(31);
  const items = Array.from({ length: 20 }, (_, i) => ({ item: `Q${i + 1}`, correct: Math.round(35 + rand() * 55) }));
  const hardest = items.reduce((a, b) => (a.correct < b.correct ? a : b));
  return (
    <Workspace area="assessments" title="Analytics" description="Pre/post comparison, item analysis and results by objective.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Pupils 2025–26: pre → post" value={`${avg(d.pupilResults.map((r) => r.preAvg))} → ${avg(d.pupilResults.map((r) => r.postAvg))}`} sub="average score, all classes" tone="success" />
        <StatTile label="TF baseline (October)" value={`${avg(tfBase.entries.map((e) => e.score))}%`} sub="Cohort 2026–27" />
        <StatTile label="TF checkpoint (live)" value={`${avg(tfMid.entries.filter((e) => e.status === "submitted").map((e) => e.score))}%`} sub="submitted so far" />
        <StatTile label="Hardest pupil item" value={hardest.item} sub={`${hardest.correct}% correct · sent to Curriculum`} tone="warning" />
      </div>
      <Card>
        <CardHeader title="Item analysis: Digital Skills Pupil Assessment (pre, 2026–27)" subtitle="% of pupils answering each item correctly · items below 45% feed the curriculum improvement backlog" />
        <CardBody>
          <div className="h-[240px]">
            <ResponsiveContainer>
              <BarChart data={items} margin={{ left: -16, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#eef0f3" />
                <XAxis dataKey="item" tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} interval={0} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f5f6f8" }} formatter={(v) => [`${v}% correct`, ""]} separator="" />
                <Bar dataKey="correct" fill="#3366bf" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Results by objective" subtitle="Objective tags link questions → scores → curriculum" />
        <CardBody><MiniTable head={["Objective", "Assessed by", "Average"]} rows={d.objectives.filter((o) => o.collection === "SU").slice(0, 4).map((o, i) => [<span><b>{o.code}</b> <span className="text-muted">{o.text}</span></span>, "Pupil pre/post", `${[58, 61, 44, 49][i]}%`])} /></CardBody>
      </Card>
    </Workspace>
  );
}
