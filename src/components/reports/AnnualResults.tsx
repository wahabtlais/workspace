import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Info } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { StatTile } from "@/components/common/StatTile";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useData } from "@/store/hooks";

const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);

/** Annual pupil pre/post reporting. 2025–26 is complete; 2026–27 baseline is computed live from closed sessions. */
export function AnnualResults() {
  const d = useData();
  const last = d.pupilResults.filter((r) => r.academicYear === "2025–26");
  const bySchool = d.schools.filter((s) => last.some((r) => r.schoolId === s.id)).map((s) => {
    const rows = last.filter((r) => r.schoolId === s.id);
    const pre = avg(rows.map((r) => r.preAvg ?? 0))!, post = avg(rows.map((r) => r.postAvg ?? 0))!;
    return { school: s.name.replace(/ (Public|Intermediate|Secondary)? ?School/, ""), pre, post, gain: Math.round((post - pre) * 10) / 10 };
  });
  const totalPre = avg(last.map((r) => r.preAvg ?? 0))!, totalPost = avg(last.map((r) => r.postAvg ?? 0))!;
  const sessions = d.assessmentSessions.filter((s) => s.audience === "pupils" && s.academicYear === "2026–27");
  const closed = sessions.filter((s) => s.status === "Closed");
  const scores = closed.flatMap((s) => s.entries.filter((e) => e.status === "submitted" && e.score !== undefined).map((e) => e.score!));
  const enrolled = sessions.reduce((a, s) => a + s.entries.length, 0);
  const grades = [5, 6, 7, 8].map((g) => {
    const cls = closed.filter((s) => d.classes.find((c) => c.id === s.classId)?.grade === g);
    const sc = cls.flatMap((s) => s.entries.filter((e) => e.score !== undefined && e.status === "submitted").map((e) => e.score!));
    const lastG = last.filter((r) => r.grade === g);
    return [`Grade ${g}`, avg(lastG.map((r) => r.preAvg ?? 0)) ?? "—", avg(lastG.map((r) => r.postAvg ?? 0)) ?? "—", avg(sc) ?? "—", `${cls.length}/${sessions.filter((s) => d.classes.find((c) => c.id === s.classId)?.grade === g).length}`];
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="2025–26 average gain" value={`+${Math.round((totalPost - totalPre) * 10) / 10}`} sub={`pre ${totalPre} → post ${totalPost}`} target="+20" tone="success" progress={100} />
        <StatTile label="Pupils assessed 2025–26" value={last.reduce((a, r) => a + r.assessedPost, 0)} sub={`of ${last.reduce((a, r) => a + r.enrolled, 0)} enrolled`} />
        <StatTile label="2026–27 baseline average" value={avg(scores) ?? "—"} sub={`${scores.length} pupils · closed sessions only`} />
        <StatTile label="2026–27 pre-assessment coverage" value={`${closed.length}/${sessions.length}`} sub={`classes closed · ${enrolled} pupils enrolled`} progress={(closed.length / sessions.length) * 100} tone={closed.length < sessions.length ? "warning" : "success"} />
      </div>
      <Card>
        <CardHeader title="2025–26 learning gain by school" subtitle="Average post-assessment score minus pre-assessment score (points)" action={<Badge tone="outline">Aggregated · no pupil names</Badge>} />
        <CardBody>
          <div className="h-[260px]">
            <ResponsiveContainer>
              <BarChart data={bySchool} margin={{ left: -16, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#eef0f3" />
                <XAxis dataKey="school" tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f5f6f8" }} content={({ payload }) => { const r = payload?.[0]?.payload as (typeof bySchool)[number] | undefined; return r ? <div className="rounded-lg border border-line bg-surface px-3 py-2 text-[12px] shadow-pop"><p className="font-medium">{r.school}</p><p className="text-muted">Pre {r.pre} → post {r.post} · gain +{r.gain}</p></div> : null; }} />
                <Bar dataKey="gain" fill="#0f8a7e" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="By grade" subtitle="2025–26 pre/post and the 2026–27 baseline so far" />
        <CardBody><MiniTable head={["Grade", "Pre 2025–26", "Post 2025–26", "Pre 2026–27 (so far)", "Classes closed"]} rows={grades} /></CardBody>
      </Card>
      <Card>
        <CardHeader title="2026–27 pre-assessment sessions" subtitle="A class counts in reporting only after its session is reconciled and closed" />
        <CardBody>
          <MiniTable head={["School · class", "Status", "Submitted", "Average"]} rows={sessions.filter((s) => s.status !== "Closed").concat(closed.slice(0, 4)).map((s) => {
            const c = d.classes.find((x) => x.id === s.classId)!; const sub = s.entries.filter((e) => e.status === "submitted");
            return [`${d.schools.find((x) => x.id === s.schoolId)?.name} · ${c.grade}-${c.section}`, <Badge tone={s.status === "Closed" ? "success" : s.status === "Live" ? "info" : "warning"}>{s.status}</Badge>, <span className="flex items-center gap-2"><Progress value={(sub.length / s.entries.length) * 100} className="w-16" /><span className="tabular text-[12px]">{sub.length}/{s.entries.length}</span></span>, s.status === "Closed" ? avg(sub.map((e) => e.score ?? 0)) : "—"];
          })} />
          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted"><Info className="size-3.5" /> Post-assessments for 2026–27 are scheduled for June 2027.</p>
        </CardBody>
      </Card>
    </div>
  );
}
