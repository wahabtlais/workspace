import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleDashed, CloudUpload, Loader2, Lock, Pause, Play, RefreshCw, RotateCcw, XCircle } from "lucide-react";
import type { AssessmentEntry, AssessmentSession, EntryStatus } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useDemo } from "@/store/demoStore";
import { closeSession, resolveEntry, retrySubmission, setSessionStatus, simulateActivity, syncSession } from "@/store/actions";
import { sessionProgress } from "@/lib/metrics";
import { cn } from "@/lib/utils";

export const ENTRY_META: Record<EntryStatus, { label: string; icon: typeof CheckCircle2; cls: string; bar: string }> = {
  submitted: { label: "Submitted", icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50", bar: "bg-emerald-500" },
  in_progress: { label: "In progress", icon: Loader2, cls: "text-brand-700 bg-brand-50", bar: "bg-brand-400" },
  not_started: { label: "Not started", icon: CircleDashed, cls: "text-slate-600 bg-slate-100", bar: "bg-slate-300" },
  pending_sync: { label: "Waiting to sync", icon: CloudUpload, cls: "text-amber-800 bg-amber-50", bar: "bg-amber-400" },
  failed: { label: "Failed upload", icon: XCircle, cls: "text-red-700 bg-red-50", bar: "bg-red-500" },
};
const ORDER: EntryStatus[] = ["submitted", "in_progress", "pending_sync", "failed", "not_started"];
const RESOLUTIONS = ["Absent", "Exempt", "Paper copy entered", "Retake scheduled"] as const;

export function SegmentBar({ entries }: { entries: AssessmentEntry[] }) {
  const p = sessionProgress(entries);
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100" role="img" aria-label={ORDER.map((s) => `${ENTRY_META[s].label} ${p[s]}`).join(", ")}>
      {ORDER.map((s) => p[s] > 0 && <div key={s} className={cn("h-full border-r-2 border-surface last:border-0", ENTRY_META[s].bar)} style={{ width: `${(p[s] / entries.length) * 100}%` }} />)}
    </div>
  );
}

/** Live submission tracker + reconciliation for one assessment session. */
export function SessionTracker({ sessionId, nameFor, canManage = true }: { sessionId: string; nameFor: (id: string) => string; canManage?: boolean }) {
  const session = useDemo((s) => s.data.assessmentSessions.find((x) => x.id === sessionId)) as AssessmentSession | undefined;
  const offline = useDemo((s) => s.offline);
  const [filter, setFilter] = useState<EntryStatus | "all" | "unresolved">("all");
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    if (!auto || session?.status !== "Live") return;
    const t = window.setInterval(() => simulateActivity(sessionId), 2500);
    return () => window.clearInterval(t);
  }, [auto, session?.status, sessionId]);

  const p = useMemo(() => (session ? sessionProgress(session.entries) : {}), [session]);
  if (!session) return null;
  const unresolved = session.entries.filter((e) => e.status !== "submitted" && !e.resolution);
  const list = session.entries.filter((e) => filter === "all" || (filter === "unresolved" ? e.status !== "submitted" && !e.resolution : e.status === filter));
  const reconciling = session.status === "Reconciling";
  const closed = session.status === "Closed";

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={session.status} />
            {session.status === "Live" && <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-700"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex size-2 rounded-full bg-emerald-500" /></span>Updating live</span>}
            {offline && <Badge tone="warning">Offline: new submissions queue on devices</Badge>}
            <span className="ms-auto text-[13px] text-muted tabular">{p.submitted ?? 0} of {session.entries.length} submitted</span>
          </div>
          <div className="mt-3"><SegmentBar entries={session.entries} /></div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" n={session.entries.length} />
            {ORDER.map((s) => <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)} label={ENTRY_META[s].label} n={p[s] ?? 0} dot={ENTRY_META[s].bar} />)}
            {(reconciling || closed) && <FilterChip active={filter === "unresolved"} onClick={() => setFilter("unresolved")} label="Needs a reason" n={unresolved.length} dot="bg-red-500" />}
          </div>
          {canManage && !closed && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
              {session.status === "Scheduled" && <Button onClick={() => setSessionStatus(sessionId, "Live")}><Play /> Open session</Button>}
              {session.status === "Live" && <>
                <Button variant="secondary" onClick={() => setAuto((a) => !a)}>{auto ? <Pause /> : <Play />}{auto ? "Pause simulation" : "Simulate live activity"}</Button>
                <Button variant="secondary" onClick={() => syncSession(sessionId)} disabled={!(p.pending_sync ?? 0)}><RefreshCw /> Sync pending ({p.pending_sync ?? 0})</Button>
                <Button className="ms-auto" onClick={() => { setAuto(false); setSessionStatus(sessionId, "Reconciling"); }}>End session & reconcile</Button>
              </>}
              {reconciling && <>
                <Button variant="secondary" onClick={() => syncSession(sessionId)} disabled={!(p.pending_sync ?? 0)}><RefreshCw /> Sync pending ({p.pending_sync ?? 0})</Button>
                <span className={cn("inline-flex items-center gap-1.5 text-[13px]", unresolved.length ? "text-amber-700" : "text-emerald-700")}>{unresolved.length ? <AlertTriangle className="size-4" /> : <CheckCircle2 className="size-4" />}{unresolved.length ? `${unresolved.length} learner${unresolved.length === 1 ? "" : "s"} still need a submission or a reason` : "Everyone is accounted for"}</span>
                <Button className="ms-auto" disabled={unresolved.length > 0} onClick={() => closeSession(sessionId)}><Lock /> Close session</Button>
              </>}
            </div>
          )}
          {closed && <p className="mt-3 flex items-center gap-1.5 text-[13px] text-muted"><Lock className="size-4" /> Closed after reconciliation. Results are final and included in reporting.</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Learners" subtitle={reconciling ? "Give every learner without a valid submission a reason before closing" : "Status updates as devices submit"} />
        <div className="grid gap-px border-t border-line bg-line sm:grid-cols-2 xl:grid-cols-3">
          {list.map((e) => {
            const M = ENTRY_META[e.status];
            return (
              <div key={e.subjectId} className="bg-surface p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium">{nameFor(e.subjectId)}</p>
                    <p className="text-[11px] text-subtle">{e.device ?? "No device yet"}{e.submittedAt ? ` · ${e.submittedAt.slice(11, 16)}` : ""}</p>
                  </div>
                  <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", M.cls)}><M.icon className={cn("size-3", e.status === "in_progress" && "animate-spin")} />{M.label}</span>
                </div>
                {e.score !== undefined && (e.status === "submitted" || e.status === "pending_sync") && <p className="mt-1.5 text-[12px] text-muted">Score <b className="text-fg tabular">{e.score}%</b></p>}
                {e.error && <p className="mt-1.5 flex items-center gap-1 text-[12px] text-red-700"><AlertTriangle className="size-3.5" />{e.error}</p>}
                {e.resolution && <p className="mt-1.5 text-[12px]"><Badge tone="neutral">Resolved: {e.resolution}</Badge></p>}
                {canManage && !closed && e.status === "failed" && <Button size="sm" variant="secondary" className="mt-2" onClick={() => retrySubmission(sessionId, e.subjectId)}><RotateCcw /> Retry upload</Button>}
                {canManage && reconciling && e.status !== "submitted" && !e.resolution && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {RESOLUTIONS.map((r) => <button key={r} onClick={() => resolveEntry(sessionId, e.subjectId, r)} className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted hover:border-brand-300 hover:text-brand-700">{r}</button>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {list.length === 0 && <p className="p-6 text-center text-[13px] text-muted">No learners in this view.</p>}
      </Card>
    </div>
  );
}

function FilterChip({ active, onClick, label, n, dot }: { active: boolean; onClick: () => void; label: string; n: number; dot?: string }) {
  return (
    <button onClick={onClick} aria-pressed={active} className={cn("inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium", active ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line bg-surface text-muted hover:text-fg")}>
      {dot && <span className={cn("size-2 rounded-full", dot)} />}{label}<span className="tabular opacity-70">{n}</span>
    </button>
  );
}
