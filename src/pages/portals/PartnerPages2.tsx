import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useLiveIndicators } from "@/pages/results/ResultsPages";
import { useData, usePersona } from "@/store/hooks";
import { formatDate } from "@/lib/utils";

export function DonorReports() {
  return (
    <div className="space-y-3">
      <h1 className="text-[24px] font-semibold">Approved reports</h1>
      {[["Semi-annual report (Jan–Jun 2026)", "2026-07-15"], ["Annual learning report 2025–26", "2026-09-30"]].map(([t, dt]) => <Card key={t} className="flex items-center gap-3 p-4"><FileText className="size-5 text-muted" /><span className="flex-1"><span className="block font-medium">{t}</span><span className="text-[12px] text-muted">Approved and shared {formatDate(dt)}</span></span><Badge tone="success">Approved</Badge></Card>)}
      <p className="text-[12px] text-muted">Only reports approved by CodeBrave leadership are shared here.</p>
    </div>
  );
}

export function DonorIndicators() {
  const d = useData();
  const p = usePersona();
  const g = d.grants.find((x) => x.id === p.scope.grantIds?.[0])!;
  const inds = useLiveIndicators().filter((i) => g.indicatorIds.includes(i.id));
  return (
    <div className="space-y-3">
      <h1 className="text-[24px] font-semibold">Indicators</h1>
      {inds.map((i) => <Card key={i.id} className="p-4"><div className="flex items-center justify-between text-[14px]"><span>{i.name}</span><b className="tabular">{i.current}{i.unit === "%" ? "%" : ""} / {i.target}{i.unit === "%" ? "%" : ""}</b></div><Progress value={Math.min(100, (i.current / i.target) * 100)} className="mt-2" /></Card>)}
      <p className="text-[12px] text-muted">Aggregated figures only. No pupil or student names are shared.</p>
    </div>
  );
}

export function DonorMilestones() {
  const d = useData();
  const p = usePersona();
  return (
    <div className="space-y-3">
      <h1 className="text-[24px] font-semibold">Milestones & obligations</h1>
      {d.obligations.filter((o) => p.scope.grantIds?.includes(o.grantId)).map((o) => <Card key={o.id} className="flex items-center justify-between p-4"><span><span className="block font-medium">{o.title}</span><span className="text-[12px] text-muted">Due {formatDate(o.due)}</span></span><StatusBadge status={o.status === "Submitted" ? "Completed" : "Upcoming"} /></Card>)}
    </div>
  );
}

export function TeacherHelp() {
  const items = [
    ["How do I take a register? · كيف أسجّل الحضور؟", "Open Today, choose your class, mark every pupil, then submit. Nobody is marked present automatically. It works offline."],
    ["I made a mistake in a submitted register · أخطأت في سجل مُرسل", "Open the register, use the pencil next to the pupil and request a correction with a reason. Your Project Officer approves it."],
    ["What is the live assessment tracker? · ما هي متابعة التقييم؟", "It shows which pupils submitted, which haven’t, and uploads that failed or are waiting to sync. Before closing, give every missing pupil a reason."],
  ];
  return (
    <div className="max-w-2xl space-y-3">
      <h1 className="text-[24px] font-semibold">Help · مساعدة</h1>
      {items.map(([q, a]) => <Card key={q} className="p-4"><p className="font-semibold">{q}</p><p className="mt-1 text-[14px] text-muted">{a}</p></Card>)}
    </div>
  );
}
