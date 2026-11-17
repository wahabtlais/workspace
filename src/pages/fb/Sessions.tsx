import { useState } from "react";
import { useSearchParams } from "react-router";
import type { FBSession } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workspace, Segmented } from "@/components/common/Workspace";
import { RegisterSheet } from "@/components/attendance/RegisterSheet";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { attendeeRate, countMarks } from "@/lib/metrics";
import { PATHWAY_LABEL } from "@/data/seed/fb";
import { DEMO_TODAY, relativeDay } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TYPES: FBSession["type"][] = ["Learning session", "Workshop", "Student meeting", "Mentor meeting"];

/** Cohorts & sessions: every FB activity type has a register (trainers or authorized staff record). */
export default function CohortSessions() {
  const d = useData();
  const L = useLookup();
  const persona = usePersona();
  const [params] = useSearchParams();
  const regs = d.registers.filter((r) => r.kind === "fb");
  const [type, setType] = useState<FBSession["type"] | "All">("All");
  const sessions = d.fbSessions.filter((s) => type === "All" || s.type === type).filter((s) => s.date <= "2026-11-27").sort((a, b) => b.date.localeCompare(a.date));
  const [sel, setSel] = useState<string | undefined>(params.get("session") ?? d.fbSessions.find((s) => s.date === DEMO_TODAY)?.id);
  const session = d.fbSessions.find((s) => s.id === sel);
  const canRecord = ["fb_trainer", "fb_po", "fb_pm"].includes(persona.role);
  const attendees = session ? d.students.filter((s) => s.cohortId === "fbc-2" && s.status === "Active" && (!session.pathway || s.pathway === session.pathway)) : [];
  return (
    <Workspace area="fb" title="Cohorts & sessions" description="Learning sessions, workshops, student meetings and mentor meetings, each with its own register.">
      <div className="grid gap-4 md:grid-cols-3">
        {d.fbCohorts.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-center justify-between"><p className="font-semibold">{c.name}</p><Badge tone={c.status === "Active" ? "success" : c.status === "Admissions" ? "info" : "neutral"}>{c.status}</Badge></div>
            <p className="mt-1 text-[13px] text-muted">{d.students.filter((s) => s.cohortId === c.id).length} students · PO {L.person(c.poId)}</p>
          </Card>
        ))}
      </div>
      <Segmented value={type} onChange={setType} options={[{ value: "All", label: "All" }, ...TYPES.map((t) => ({ value: t, label: t }))]} />
      <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        <Card className="h-fit">
          <CardHeader title="Sessions" subtitle="Future Builders 2026–27" />
          <ul className="max-h-[600px] overflow-y-auto border-t border-line scrollbar-thin">
            {sessions.map((s) => {
              const r = regs.find((x) => x.contextId === s.id);
              return (
                <li key={s.id}>
                  <button onClick={() => setSel(s.id)} className={cn("w-full border-b border-line px-4 py-2.5 text-left hover:bg-canvas", sel === s.id && "bg-brand-50/60")}>
                    <span className="flex items-center justify-between gap-2"><span className="text-[13px] font-medium">{s.title}</span>
                      {r ? <Badge tone={r.status === "pending_sync" ? "warning" : "success"}>{r.status === "pending_sync" ? "Sync" : `${countMarks(r).P + countMarks(r).L}/${r.attendeeIds.length}`}</Badge> : s.date === DEMO_TODAY ? <Badge tone="warning">Due today</Badge> : s.date < DEMO_TODAY ? <Badge tone="danger">Missing</Badge> : <Badge tone="neutral">Upcoming</Badge>}</span>
                    <span className="text-[11px] text-muted">{relativeDay(s.date)} · {s.type}{s.pathway ? ` · ${PATHWAY_LABEL[s.pathway]}` : ""}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
        <div className="space-y-4">
          {session ? (<>
            <Card className="p-4"><p className="font-semibold">{session.title}</p><p className="text-[13px] text-muted">{session.type}{session.pathway ? ` · ${PATHWAY_LABEL[session.pathway]}` : " · whole cohort"} · {relativeDay(session.date)} · {session.time} · led by {L.person(session.leadId)}</p></Card>
            {session.date > DEMO_TODAY ? <Card className="p-6 text-center text-[13px] text-muted">The register opens on the day of the session.</Card> :
              <RegisterSheet key={session.id} kind="fb" contextId={session.id} date={session.date} label={`${session.type}: ${session.title}`} canEdit={canRecord} canCorrect={canRecord}
                attendees={attendees.map((s) => ({ id: s.id, name: s.name, sub: `${PATHWAY_LABEL[s.pathway]} · attendance ${attendeeRate(regs, s.id)}%` }))} />}
            <p className="text-[12px] text-muted">Rule: 3 consecutive absences create a follow-up task for the Project Officer.</p>
          </>) : <Card><CardBody className="pt-5 text-[13px] text-muted">Select a session.</CardBody></Card>}
        </div>
      </div>
    </Workspace>
  );
}
