import { useState } from "react";
import { Link } from "react-router";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workspace, Segmented } from "@/components/common/Workspace";
import { AIMenu } from "@/components/shell/AskPanel";
import { BarList } from "@/ai/AIMessage";
import { useData } from "@/store/hooks";
import { useLiveIndicators } from "@/lib/indicators";
import { attendanceRate } from "@/lib/metrics";
import { addDays, DEMO_TODAY, formatDate } from "@/lib/utils";

const AX = { fontSize: 11, fill: "#5f6b7a" };
const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : 0);
const monday = (iso: string) => addDays(iso, -((new Date(iso + "T00:00:00Z").getUTCDay() + 6) % 7));

function Src({ children, to }: { children: React.ReactNode; to?: string }) {
  return <p className="mt-2 text-[11.5px] text-muted">Source: {children}{to && <> · <Link to={to} className="text-brand-700 hover:underline">drill down</Link></>}</p>;
}

/** Results overview: charts calculated from the shared records, with filters and drill-downs. */
export function ResultsDashboard() {
  const d = useData();
  const inds = useLiveIndicators();
  const [program, setProgram] = useState<"all" | "SU" | "FB">("all");
  const [grade, setGrade] = useState<string>("all");
  const [histId, setHist] = useState("ind-su-att");
  const showSU = program !== "FB", showFB = program !== "SU";
  const gradeOf = (classId?: string) => d.classes.find((c) => c.id === classId)?.grade;

  const last = d.pupilResults.filter((r) => r.academicYear === "2025–26" && r.preAvg !== null && r.postAvg !== null && (grade === "all" || r.grade === Number(grade)));
  const bySchool = d.schools.filter((s) => last.some((r) => r.schoolId === s.id)).map((s) => { const rows = last.filter((r) => r.schoolId === s.id); return { name: s.name.split(" ")[0], pre: avg(rows.map((r) => r.preAvg!)), post: avg(rows.map((r) => r.postAvg!)) }; });
  const byGrade = [5, 6, 7, 8].map((g) => { const rows = d.pupilResults.filter((r) => r.academicYear === "2025–26" && r.grade === g && r.preAvg !== null && r.postAvg !== null); return { name: `Grade ${g}`, pre: avg(rows.map((r) => r.preAvg!)), post: avg(rows.map((r) => r.postAvg!)) }; }).filter((x) => x.pre > 0);

  const weeks = [...new Set(d.registers.filter((r) => r.date <= DEMO_TODAY && r.date >= "2026-09-21").map((r) => monday(r.date)))].sort();
  const trend = weeks.map((w) => {
    const v = (k: string) => { const rs = d.registers.filter((r) => r.kind === k && monday(r.date) === w && (k !== "pupil" || grade === "all" || gradeOf(r.contextId) === Number(grade))); return rs.some((r) => r.status !== "missing") ? attendanceRate(rs) : null; };
    return { week: formatDate(w), Pupils: v("pupil"), "Future Builders": v("fb"), "TF training": v("tf") };
  });

  const pre = d.assessmentSessions.filter((s) => s.audience === "pupils" && s.academicYear === "2026–27" && (grade === "all" || gradeOf(s.classId) === Number(grade)));
  const completion = d.schools.filter((s) => pre.some((x) => x.schoolId === s.id)).map((s) => { const e = pre.filter((x) => x.schoolId === s.id).flatMap((x) => x.entries); const v = Math.round((e.filter((x) => x.status === "submitted").length / Math.max(1, e.length)) * 100); return { label: s.name.split(" ").slice(0, 2).join(" "), value: v, flag: v < 80 }; });

  const since = addDays(DEMO_TODAY, -30);
  const coverage = d.schools.filter((s) => s.status === "Active").map((s) => { const obs = d.visits.filter((v) => v.schoolId === s.id && v.score !== undefined && v.date >= "2026-09-01").map((v) => v.score!); const visited = d.visits.some((v) => v.schoolId === s.id && v.status !== "Planned" && v.date >= since && v.date <= DEMO_TODAY); return { label: `${s.name.split(" ").slice(0, 2).join(" ")}${visited ? "" : " (no visit in 30 days)"}`, value: avg(obs), flag: avg(obs) < 2.5 || !visited }; });

  const tfFunnel = [{ label: "All Teaching Fellows", value: d.tfs.length }, ...(["In training", "Certified", "Deployed"] as const).map((s) => ({ label: s, value: d.tfs.filter((t) => t.stage === s).length }))];
  const fbProg = ["crs-ai", "crs-web"].map((cid) => { const course = d.courses.find((c) => c.id === cid); const cur = d.curricula.find((c) => c.id === course?.curriculumId); const total = cur?.versions.find((v) => v.id === course?.versionId)?.modules.reduce((a, m) => a + m.lessons.length, 0) || 1; const ps = d.progress.filter((p) => p.courseId === cid); return { label: course?.title.replace(" Pathway", "") ?? cid, value: Math.round(avg(ps.map((p) => (p.completedLessonIds.length / total) * 100))) }; });
  const placements = ["Shortlisted", "Shared with host", "Interview", "Agreement", "Placed", "Completed"].map((st) => ({ label: st, value: d.placements.filter((p) => p.stage === st).length }));

  const targets = inds.filter((i) => program === "all" || i.program === program).map((i) => ({ label: `${i.code} ${i.name}${i.illustrative ? " *" : ""}`, value: Math.round((i.current / i.target) * 100), flag: i.current / i.target < 0.95 }));
  const hist = inds.find((i) => i.id === histId) ?? inds[0];
  const histSeries = hist.series.filter((x) => x.value > 0).map((x, k, arr) => (k === arr.length - 1 && hist.live ? { ...x, value: hist.current } : x));

  return (
    <Workspace area="results" title="Results & Indicators" description="How CodeBrave is doing against its targets, calculated from the records programs keep every day. Every chart links to its evidence."
      aiActions={<AIMenu context="Results" items={[{ label: "Explain indicator changes", prompt: "Explain the change in observation scores and learning gain" }, { label: "Summarize attendance across programs", prompt: "Summarise attendance across programs" }, { label: "Draft a variance note", prompt: "Draft an indicator variance note" }]} />}>
      <div className="flex flex-wrap items-center gap-2">
        <Segmented value={program} onChange={setProgram} options={[{ value: "all", label: "All programs" }, { value: "SU", label: "School Upskilling" }, { value: "FB", label: "Future Builders" }]} />
        {showSU && <select aria-label="Grade" className="h-9 rounded-lg border border-line-strong bg-surface px-2 text-[13px]" value={grade} onChange={(e) => setGrade(e.target.value)}><option value="all">All grades</option>{[5, 6, 7, 8].map((g) => <option key={g} value={g}>Grade {g}</option>)}</select>}
        <span className="ml-auto flex flex-wrap gap-2 text-[12px]"><Badge tone="info">Live: calculated from records</Badge><Badge tone="neutral">* Illustrative sample figure</Badge></span>
      </div>

      <Card>
        <CardHeader title="Targets vs actuals" subtitle="Latest value as % of the annual target. ▲ = below 95% of target." action={<Link to="/results/library" className="text-[13px] text-brand-600 hover:underline">Indicator library</Link>} />
        <CardBody><BarList data={targets} suffix="%" max={130} /><Src to="/results/library">indicator library (definitions, owners, calculation)</Src></CardBody>
      </Card>

      {showSU && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card><CardHeader title="Pupil learning gains by school" subtitle={`Pre vs post average score, 2025–26${grade !== "all" ? ` · Grade ${grade}` : ""}`} /><CardBody>
            <div className="h-[260px]"><ResponsiveContainer><BarChart data={bySchool} margin={{ left: -16, right: 8 }}><CartesianGrid vertical={false} stroke="#eef0f3" /><XAxis dataKey="name" tick={AX} axisLine={false} tickLine={false} interval={0} /><YAxis domain={[0, 100]} tick={AX} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#f5f6f8" }} /><Legend wrapperStyle={{ fontSize: 12 }} /><Bar dataKey="pre" name="Pre-assessment" fill="#a8b4c4" radius={[4, 4, 0, 0]} maxBarSize={18} /><Bar dataKey="post" name="Post-assessment" fill="#0f8a7e" radius={[4, 4, 0, 0]} maxBarSize={18} /></BarChart></ResponsiveContainer></div>
            <Src to="/results/annual">Assessment Hub, annual pupil pre/post (aggregated by class)</Src>
          </CardBody></Card>
          <Card><CardHeader title="Learning gains by grade" subtitle="Pre vs post average score, 2025–26" /><CardBody>
            <div className="h-[260px]"><ResponsiveContainer><BarChart data={byGrade} margin={{ left: -16, right: 8 }}><CartesianGrid vertical={false} stroke="#eef0f3" /><XAxis dataKey="name" tick={AX} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={AX} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#f5f6f8" }} /><Legend wrapperStyle={{ fontSize: 12 }} /><Bar dataKey="pre" name="Pre-assessment" fill="#a8b4c4" radius={[4, 4, 0, 0]} maxBarSize={28} /><Bar dataKey="post" name="Post-assessment" fill="#0f8a7e" radius={[4, 4, 0, 0]} maxBarSize={28} /></BarChart></ResponsiveContainer></div>
            <Src to="/results/annual">Assessment Hub, annual pupil pre/post</Src>
          </CardBody></Card>
        </div>
      )}

      <Card><CardHeader title="Attendance trend" subtitle="Weekly attendance rate since the start of term (present + late; excused excluded)" /><CardBody>
        <div className="h-[260px]"><ResponsiveContainer><LineChart data={trend} margin={{ left: -16, right: 16, top: 8 }}><CartesianGrid vertical={false} stroke="#eef0f3" /><XAxis dataKey="week" tick={AX} axisLine={false} tickLine={false} /><YAxis domain={[50, 100]} tickFormatter={(v) => `${v}%`} tick={AX} axisLine={false} tickLine={false} /><Tooltip formatter={(v) => `${v}%`} /><Legend wrapperStyle={{ fontSize: 12 }} />{showSU && <Line dataKey="Pupils" stroke="#0f8a7e" strokeWidth={2} dot={false} connectNulls />}{showFB && <Line dataKey="Future Builders" stroke="#7c4dbd" strokeWidth={2} dot={false} connectNulls />}{showSU && <Line dataKey="TF training" stroke="#3366bf" strokeWidth={2} dot={false} connectNulls />}</LineChart></ResponsiveContainer></div>
        <Src>attendance service registers (pupil figures aggregated)</Src>
      </CardBody></Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {showSU && <Card><CardHeader title="Assessment completion by school" subtitle="Pupil pre-assessment 2026–27: saved submissions only. ▲ = below 80%." /><CardBody><BarList data={completion} suffix="%" max={100} /><Src to="/assessments/tracker">live submission tracker</Src></CardBody></Card>}
        {showSU && <Card><CardHeader title="Visit and observation coverage" subtitle="Average observation score since September (out of 4). ▲ = below 2.5 or no visit in 30 days." /><CardBody><BarList data={coverage} max={4} /><Src to="/school-upskilling/visits">visits & observations</Src></CardBody></Card>}
        {showSU && <Card><CardHeader title="Teaching Fellow certification" subtitle="Teaching Fellows by current stage" /><CardBody><BarList data={tfFunnel} /><Src to="/school-upskilling/teaching-fellows">TF pipeline and certification criteria</Src></CardBody></Card>}
        {showFB && <Card><CardHeader title="Future Builders learning progress" subtitle="Average share of published lessons completed, per pathway (%)" /><CardBody><BarList data={fbProg} suffix="%" max={100} /><Src to="/learning/progress">Learning Hub progress</Src></CardBody></Card>}
        {showFB && <Card><CardHeader title="Internship and placement outcomes" subtitle="Students at each placement stage" /><CardBody><BarList data={placements} /><Src to="/future-builders/internships">internships</Src></CardBody></Card>}
      </div>

      <Card><CardHeader title="Historical trend" subtitle={hist.live ? "Earlier months are recorded snapshots; the latest point is calculated live" : "Illustrative sample series"} action={<select aria-label="Indicator" className="h-8 max-w-56 rounded-md border border-line-strong bg-surface px-2 text-[13px]" value={histId} onChange={(e) => setHist(e.target.value)}>{inds.map((i) => <option key={i.id} value={i.id}>{i.code} {i.name}</option>)}</select>} /><CardBody>
        <div className="h-[220px]"><ResponsiveContainer><LineChart data={histSeries} margin={{ left: -16, right: 16, top: 8 }}><CartesianGrid vertical={false} stroke="#eef0f3" /><XAxis dataKey="period" tick={AX} axisLine={false} tickLine={false} /><YAxis tick={AX} axisLine={false} tickLine={false} /><Tooltip /><Line dataKey="value" name={hist.name} stroke="#3366bf" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
        <Src to={`/results/${hist.id}`}>{hist.source}</Src>
      </CardBody></Card>
    </Workspace>
  );
}
