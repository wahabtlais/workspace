import { useState } from "react";
import { Check, X } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Workspace } from "@/components/common/Workspace";
import { RegisterSheet } from "@/components/attendance/RegisterSheet";
import { STATUS_STYLE } from "@/components/attendance/labels";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { decideCorrection } from "@/store/actions";
import { attendeeRate, TF_ATTENDANCE_THRESHOLD } from "@/lib/metrics";
import { DEMO_TODAY, formatDate, relativeDay } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function Training() {
  const d = useData();
  const L = useLookup();
  const persona = usePersona();
  const sessions = d.trainingSessions;
  const regs = d.registers.filter((r) => r.kind === "tf");
  const cohort = d.tfs.filter((t) => t.cohortId === "tfc-2");
  const today = sessions.find((s) => s.date === DEMO_TODAY);
  const [sel, setSel] = useState<string | undefined>(today?.id ?? sessions.filter((s) => s.date < DEMO_TODAY).at(-1)?.id);
  const session = sessions.find((s) => s.id === sel);
  const canRecord = persona.role === "su_trainer";
  const pending = regs.flatMap((r) => r.corrections.filter((c) => c.status === "pending").map((c) => ({ r, c })));
  const past = sessions.filter((s) => s.date <= DEMO_TODAY);

  return (
    <Workspace area="su" title="Training & TF attendance" description={`TF Cohort 2026–27 · ${sessions.length} sessions · attendance is a certification criterion (≥ ${TF_ATTENDANCE_THRESHOLD}%)`}>
      {persona.role === "su_pm" && pending.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader title="Corrections waiting for your approval" subtitle="Approving recalculates attendance and the certification criterion" />
          <CardBody className="space-y-2">
            {pending.map(({ r, c }) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3 text-[13px]">
                <span className="flex-1"><b>{L.person(r.attendeeIds[c.index])}</b> · {formatDate(r.date)} · {c.from} → {c.to}<span className="block text-muted">{c.reason} · requested by {L.person(c.requestedBy)}</span></span>
                <Button size="sm" variant="success" onClick={() => decideCorrection(r.id, c.id, true)}><Check /> Approve</Button>
                <Button size="sm" variant="secondary" onClick={() => decideCorrection(r.id, c.id, false)}><X /> Reject</Button>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader title="Sessions" />
          <ul className="max-h-[560px] overflow-y-auto border-t border-line scrollbar-thin">
            {sessions.map((s) => {
              const reg = regs.find((r) => r.contextId === s.id);
              return (
                <li key={s.id}>
                  <button onClick={() => setSel(s.id)} className={cn("w-full border-b border-line px-4 py-2.5 text-left hover:bg-canvas", sel === s.id && "bg-brand-50/60")}>
                    <span className="flex items-center justify-between gap-2"><span className="text-[13px] font-medium">{s.title}</span>
                      {reg ? (reg.status === "pending_sync" ? <Badge tone="warning">Sync</Badge> : <Badge tone="success">Done</Badge>) : s.date === DEMO_TODAY ? <Badge tone="warning">Due today</Badge> : s.date < DEMO_TODAY ? <Badge tone="danger">Missing</Badge> : null}</span>
                    <span className="text-[11px] text-muted">{relativeDay(s.date)} · {s.time} · {L.person(s.trainerId)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
        <div className="space-y-4">
          {session && (
            <>
              <Card className="p-4"><p className="font-semibold">{session.title}</p><p className="text-[13px] text-muted">{session.module} · {formatDate(session.date, { weekday: "long", day: "numeric", month: "long" })} · {session.time} · {session.venue}</p></Card>
              {session.date > DEMO_TODAY ? <Card className="p-6 text-center text-[13px] text-muted">The register opens on the day of the session.</Card> : (
                <RegisterSheet key={session.id} kind="tf" contextId={session.id} date={session.date} label={`TF training: ${session.title}`} canEdit={canRecord} canCorrect={canRecord}
                  attendees={cohort.map((t) => ({ id: t.id, name: t.name, sub: `Attendance ${attendeeRate(regs, t.id)}%` }))} />
              )}
              {!canRecord && session.date === DEMO_TODAY && <p className="text-[12px] text-muted">Only trainers record training attendance. Switch to Jad Mansour (SU Trainer) to take this register.</p>}
            </>
          )}
          <Card>
            <CardHeader title="Cohort attendance" subtitle="Each square is one delivered session" />
            <CardBody className="overflow-x-auto">
              <table className="text-[12px]"><tbody>
                {cohort.map((t) => {
                  const rate = attendeeRate(regs, t.id);
                  return (
                    <tr key={t.id}>
                      <td className="whitespace-nowrap py-1 pr-3 font-medium">{t.name}</td>
                      <td className="py-1"><div className="flex gap-1">{past.map((s) => { const r = regs.find((x) => x.contextId === s.id); const m = r?.marks[r.attendeeIds.indexOf(t.id)]; return <span key={s.id} title={`${s.date}: ${m ?? "not recorded"}`} className={cn("size-3.5 rounded-[3px]", m ? STATUS_STYLE[m].dot : "border border-line-strong")} />; })}</div></td>
                      <td className={cn("pl-3 tabular font-medium", rate < TF_ATTENDANCE_THRESHOLD ? "text-red-700" : "text-fg")}>{rate}%</td>
                    </tr>
                  );
                })}
              </tbody></table>
              <p className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted">{(["P", "A", "L", "E"] as const).map((k) => <span key={k} className="inline-flex items-center gap-1"><span className={cn("size-2.5 rounded-sm", STATUS_STYLE[k].dot)} />{{ P: "Present", A: "Absent", L: "Late", E: "Excused" }[k]}</span>)}</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </Workspace>
  );
}
