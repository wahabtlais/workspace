import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData, usePersona } from "@/store/hooks";
import { formatDate } from "@/lib/utils";

/** Donors see only reports approved by leadership and submitted for their grant. */
export function DonorReportsLive() {
  const d = useData();
  const p = usePersona();
  const submitted = d.obligations.filter((o) => p.scope.grantIds?.includes(o.grantId) && o.status === "Submitted" && /report/i.test(o.title));
  const archive: [string, string][] = [["Semi-annual report (Jan–Jun 2026)", "2026-07-15"], ["Annual learning report 2025–26", "2026-09-30"]];
  return (
    <div className="space-y-3">
      <h1 className="text-[24px] font-semibold">Approved reports</h1>
      {submitted.map((o) => <Card key={o.id} className="flex items-center gap-3 border-emerald-200 p-4"><FileText className="size-5 text-emerald-700" /><span className="flex-1"><span className="block font-medium">{o.title}</span><span className="text-[12px] text-muted">Approved by CodeBrave leadership · submitted {formatDate("2026-11-17")}</span></span><Badge tone="success">New</Badge></Card>)}
      {archive.map(([t, dt]) => <Card key={t} className="flex items-center gap-3 p-4"><FileText className="size-5 text-muted" /><span className="flex-1"><span className="block font-medium">{t}</span><span className="text-[12px] text-muted">Approved and shared {formatDate(dt)}</span></span><Badge tone="neutral">Archived</Badge></Card>)}
      <p className="text-[12px] text-muted">Only reports approved by CodeBrave leadership are shared here. Figures are aggregated.</p>
    </div>
  );
}
