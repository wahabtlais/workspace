import { useState } from "react";
import { Check, X } from "lucide-react";
import type { SchoolClass } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RegisterSheet } from "@/components/attendance/RegisterSheet";
import { useData } from "@/store/hooks";
import { decideCorrection } from "@/store/actions";
import { countMarks } from "@/lib/metrics";
import { pupilName } from "@/lib/names";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** Register history for a class; open any date to see the register. Optional approval of pending corrections. */
export function ClassHistory({ cls, lang = "en", canApprove = false, showNames = true }: { cls: SchoolClass; lang?: "en" | "ar"; canApprove?: boolean; showNames?: boolean }) {
  const d = useData();
  const regs = d.registers.filter((r) => r.kind === "pupil" && r.contextId === cls.id).sort((a, b) => b.date.localeCompare(a.date));
  const [open, setOpen] = useState<string | null>(null);
  const pending = regs.flatMap((r) => r.corrections.filter((c) => c.status === "pending").map((c) => ({ r, c })));
  const ar = lang === "ar";
  return (
    <div className="space-y-4">
      {canApprove && pending.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader title="Corrections waiting for your approval" subtitle="The original mark is kept; approving recalculates summaries" />
          <CardBody className="space-y-2">
            {pending.map(({ r, c }) => {
              const p = d.pupils.find((x) => x.id === r.attendeeIds[c.index]);
              return (
                <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3 text-[13px]">
                  <span className="flex-1"><b>{p ? (showNames ? pupilName(p) : p.code) : "Pupil"}</b> · {formatDate(r.date)} · {c.from ?? "—"} → {c.to} <span className="block text-muted">{c.reason} · requested by {c.requestedBy}</span></span>
                  <Button size="sm" variant="success" onClick={() => decideCorrection(r.id, c.id, true)}><Check /> Approve</Button>
                  <Button size="sm" variant="secondary" onClick={() => decideCorrection(r.id, c.id, false)}><X /> Reject</Button>
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}
      <Card>
        <CardHeader title={ar ? "سجل الحضور" : "Register history"} subtitle={ar ? "انقر على تاريخ لعرض السجل" : "Select a date to open the register"} />
        <div className="divide-y divide-line border-t border-line">
          {regs.map((r) => {
            const c = countMarks(r);
            const isOpen = open === r.id;
            return (
              <div key={r.id}>
                <button onClick={() => setOpen(isOpen ? null : r.id)} className={cn("flex w-full flex-wrap items-center gap-3 px-5 py-3 text-start hover:bg-canvas", isOpen && "bg-canvas")}>
                  <span className="w-36 text-[14px] font-medium">{formatDate(r.date, { weekday: "short", day: "numeric", month: "short" })}</span>
                  {r.status === "missing" ? <Badge tone="danger" dot>{ar ? "سجل ناقص" : "Missing register"}</Badge> : r.status === "pending_sync" ? <Badge tone="warning" dot>{ar ? "بانتظار المزامنة" : "Waiting to sync"}</Badge> : <Badge tone="success" dot>{ar ? "تم الإرسال" : "Submitted"}</Badge>}
                  {r.status !== "missing" && <span className="text-[12px] text-muted tabular">P {c.P} · A {c.A} · L {c.L} · E {c.E}</span>}
                  {r.corrections.length > 0 && <Badge tone="outline">{r.corrections.length} correction{r.corrections.length > 1 ? "s" : ""}</Badge>}
                </button>
                {isOpen && r.status !== "missing" && (
                  <div className="bg-canvas px-4 pb-4">
                    <RegisterSheet kind="pupil" contextId={cls.id} date={r.date} lang={lang} canEdit={false} canCorrect={!canApprove}
                      label={`Grade ${cls.grade}-${cls.section}, ${r.date}`}
                      attendees={r.attendeeIds.map((id) => { const p = d.pupils.find((x) => x.id === id)!; return { id, name: showNames ? pupilName(p, lang) : p.code, sub: showNames ? p.code : undefined }; })} />
                  </div>
                )}
                {isOpen && r.status === "missing" && <p className="bg-canvas px-5 pb-4 text-[13px] text-muted">{ar ? "لم يتم إرسال سجل لهذه الحصة. تم إرسال تذكير إلى المعلم." : "No register was submitted for this class session. A reminder was sent to the class teacher."}</p>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
