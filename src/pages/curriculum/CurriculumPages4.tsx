import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Star } from "lucide-react";
import type { BacklogItem } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workspace } from "@/components/common/Workspace";
import { Board } from "@/components/data/Board";
import { AIAction } from "@/components/shell/AskPanel";
import { useDemo } from "@/store/demoStore";
import { useData, useLookup } from "@/store/hooks";
import { formatDate, seededRandom } from "@/lib/utils";
import { useCollection } from "./CurriculumPages";

export function TrainerFeedbackPage() {
  const d = useData();
  const L = useLookup();
  const themes = ["Timing", "Difficulty", "Materials", "Engagement"].map((t) => ({ t, n: d.trainerFeedback.filter((f) => f.theme === t).length }));
  return (
    <Workspace area="curriculum" title="Trainer feedback" description="One-tap feedback after each session, stored per lesson and version." aiActions={<AIAction label="Summarise themes" prompt="Summarise trainer feedback themes" />}>
      <div className="flex flex-wrap gap-2">{themes.map((x) => <Badge key={x.t} tone="outline">{x.t}: {x.n}</Badge>)}</div>
      <div className="grid gap-3 md:grid-cols-2">
        {d.trainerFeedback.map((f) => (
          <Card key={f.id} className="p-4">
            <div className="flex items-center justify-between"><p className="font-medium">{f.lessonTitle}</p><span className="flex" aria-label={`${f.rating} of 5`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} className={i < f.rating ? "size-4 fill-accent-400 text-accent-400" : "size-4 text-line-strong"} />)}</span></div>
            <p className="text-[12px] text-muted">{d.curricula.find((c) => c.id === f.curriculumId)?.title} · {L.person(f.trainerId)} · {formatDate(f.date)}</p>
            <p className="mt-2 text-[13px]">“{f.comment}”</p><Badge tone="neutral" className="mt-2">{f.theme}</Badge>
          </Card>
        ))}
      </div>
    </Workspace>
  );
}

export function Outcomes() {
  const d = useData();
  const { c, switcher } = useCollection();
  const rand = seededRandom(c === "FB" ? 5 : 6);
  const data = d.objectives.filter((o) => o.collection === c).map((o) => ({ code: o.code, text: o.text, score: Math.round(48 + rand() * 40) }));
  return (
    <Workspace area="curriculum" title="Outcomes" description="Performance by objective, from tagged assessment items. Threshold: 60%." meta={switcher}
      aiActions={<AIAction label="Draft improvement report" prompt="Draft a curriculum improvement report" />}>
      <Card><CardHeader title="Average score by objective" subtitle="Objectives below 60% are flagged for the improvement backlog" /><CardBody>
        <div className="h-[280px]"><ResponsiveContainer><BarChart data={data} margin={{ left: -16, right: 8 }}><CartesianGrid vertical={false} stroke="#eef0f3" /><XAxis dataKey="code" tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} interval={0} /><YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "#f5f6f8" }} content={({ payload }) => { const r = payload?.[0]?.payload as (typeof data)[number] | undefined; return r ? <div className="max-w-60 rounded-lg border border-line bg-surface px-3 py-2 text-[12px] shadow-pop"><p className="font-medium">{r.code}: {r.score}%</p><p className="text-muted">{r.text}</p></div> : null; }} />
          <Bar dataKey="score" fill="#3366bf" radius={[4, 4, 0, 0]} maxBarSize={32} /></BarChart></ResponsiveContainer></div>
        <p className="mt-2 text-[12px] text-muted">Below threshold: {data.filter((x) => x.score < 60).map((x) => x.code).join(", ") || "none"}</p>
      </CardBody></Card>
    </Workspace>
  );
}

const COLS: BacklogItem["status"][] = ["Idea", "Planned", "In next version", "Done"];
export function Backlog() {
  const d = useData();
  const update = useDemo((s) => s.update);
  return (
    <Workspace area="curriculum" title="Improvement backlog" description="Ideas from outcomes, item analysis and trainer feedback, planned into the next version. Drag to update.">
      <Board columns={COLS} items={d.backlog} getColumn={(b) => b.status} onMove={(b, to) => update((x) => { const r = x.backlog.find((y) => y.id === b.id); if (r) r.status = to as BacklogItem["status"]; })}
        renderCard={(b) => <div><p className="text-[13px] font-medium">{b.title}</p><p className="mt-1 text-[12px] text-muted">{d.curricula.find((c) => c.id === b.curriculumId)?.title}</p><p className="mt-1 text-[11px] text-subtle">{b.source}</p><Badge tone={b.priority === "High" ? "danger" : b.priority === "Medium" ? "warning" : "neutral"} className="mt-2">{b.priority}</Badge></div>} />
    </Workspace>
  );
}
