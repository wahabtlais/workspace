import { useMemo, useState } from "react";
import { Check, CloudOff, History, PencilLine, TriangleAlert } from "lucide-react";
import type { AttendanceStatus, ExcusedReason, Register } from "@/data/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/misc";
import { useDemo } from "@/store/demoStore";
import { registerId, requestCorrection, submitRegister } from "@/store/actions";
import { cn } from "@/lib/utils";
import { REASONS, REG_LABELS, STATUS_STYLE } from "./labels";

export interface Attendee { id: string; name: string; sub?: string }
const ORDER: AttendanceStatus[] = ["P", "A", "L", "E"];

/** Shared register for all three attendance workflows. Starts blank, never marks anyone present silently. */
export function RegisterSheet({ kind, contextId, date, attendees, label, lang = "en", canEdit = true, canCorrect = true }: {
  kind: Register["kind"]; contextId: string; date: string; attendees: Attendee[]; label: string; lang?: "en" | "ar"; canEdit?: boolean; canCorrect?: boolean;
}) {
  const L = REG_LABELS[lang];
  const offline = useDemo((s) => s.offline);
  const existing = useDemo((s) => s.data.registers.find((r) => r.id === registerId(kind, contextId, date)));
  const locked = !!existing && existing.status !== "missing" && existing.status !== "draft";
  const idxOf = (id: string) => existing?.attendeeIds.indexOf(id) ?? -1;
  const [marks, setMarks] = useState<(AttendanceStatus | null)[]>(() => attendees.map(() => null));
  const [reasons, setReasons] = useState<Record<number, ExcusedReason>>({});
  const [late, setLate] = useState<Record<number, number>>({});
  const [correcting, setCorrecting] = useState<number | null>(null);
  const [corrTo, setCorrTo] = useState<AttendanceStatus>("E");
  const [corrReason, setCorrReason] = useState("");

  const shown = locked ? attendees.map((a) => existing!.marks[idxOf(a.id)] ?? null) : marks;
  const counts = useMemo(() => { const c = { P: 0, A: 0, L: 0, E: 0, n: 0 }; shown.forEach((m) => { if (m) c[m]++; else c.n++; }); return c; }, [shown]);
  const missingReason = !locked && marks.some((m, i) => m === "E" && !reasons[i]);
  const set = (i: number, m: AttendanceStatus) => setMarks((x) => x.map((v, j) => (j === i ? m : v)));
  const submit = () => submitRegister({ kind, contextId, date, attendeeIds: attendees.map((a) => a.id), marks, reasons, lateMinutes: late, label });

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-canvas/60 px-4 py-3">
        {ORDER.map((s) => <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[12px] ring-1 ring-line"><span className={cn("size-2 rounded-full", STATUS_STYLE[s].dot)} />{L[s]} <b className="tabular">{counts[s]}</b></span>)}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[12px] ring-1 ring-line"><span className="size-2 rounded-full border border-line-strong" />{L.unmarked} <b className="tabular">{counts.n}</b></span>
        <span className="ms-auto">
          {locked && existing!.status === "pending_sync" && <Badge tone="warning"><CloudOff /> {L.pendingSync}</Badge>}
          {locked && existing!.status === "submitted" && <Badge tone="success"><Check /> {L.readOnly}</Badge>}
        </span>
      </div>
      {!locked && <p className="flex items-center gap-1.5 border-b border-line px-4 py-2 text-[12px] text-muted"><TriangleAlert className="size-3.5 text-amber-600" />{L.noDefault}</p>}
      <ul className="divide-y divide-line">
        {attendees.map((a, i) => {
          const m = shown[i];
          const ri = idxOf(a.id);
          const corr = existing?.corrections.filter((c) => c.index === ri) ?? [];
          return (
            <li key={a.id} className="px-4 py-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <Avatar name={a.name} size={30} />
                <div className="min-w-[140px] flex-1"><p className="text-[14px] font-medium">{a.name}</p>{a.sub && <p className="text-[11px] text-subtle">{a.sub}</p>}</div>
                <div className="flex gap-1.5" role="radiogroup" aria-label={a.name}>
                  {ORDER.map((s) => (
                    <button key={s} role="radio" aria-checked={m === s} disabled={locked || !canEdit} onClick={() => set(i, s)}
                      className={cn("h-10 min-w-11 rounded-lg border px-2.5 text-[13px] font-semibold transition disabled:cursor-default", m === s ? STATUS_STYLE[s].on : "border-line bg-surface text-muted hover:border-line-strong", locked && m !== s && "opacity-40")}>
                      {lang === "ar" ? L[s] : s}
                    </button>
                  ))}
                </div>
                {locked && canCorrect && <Button size="icon-sm" variant="ghost" aria-label={L.requestCorrection} title={L.requestCorrection} onClick={() => { setCorrecting(i); setCorrReason(""); }}><PencilLine /></Button>}
              </div>
              {!locked && m === "E" && (
                <div className="mt-2 flex flex-wrap gap-1.5 ps-[42px]">
                  {REASONS.map((r) => <button key={r} onClick={() => setReasons((x) => ({ ...x, [i]: r }))} className={cn("rounded-full border px-2.5 py-1 text-[12px]", reasons[i] === r ? "border-sky-600 bg-sky-50 text-sky-800" : "border-line text-muted")}>{L.reasons[r]}</button>)}
                </div>
              )}
              {!locked && m === "L" && (
                <label className="mt-2 flex items-center gap-2 ps-[42px] text-[12px] text-muted">{L.minutes}
                  <input type="number" min={1} max={90} value={late[i] ?? ""} onChange={(e) => setLate((x) => ({ ...x, [i]: Number(e.target.value) }))} className="h-8 w-20 rounded-md border border-line px-2" />
                </label>
              )}
              {locked && m === "E" && existing!.reasons[ri] && <p className="mt-1 ps-[42px] text-[12px] text-muted">{L.reason}: {L.reasons[existing!.reasons[ri]]}</p>}
              {corr.length > 0 && (
                <div className="mt-2 space-y-1 ps-[42px]">
                  {corr.map((c) => <p key={c.id} className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted"><History className="size-3.5" />{L.original}: {c.from ? L[c.from] : L.unmarked} → {L[c.to]} · {c.reason} <Badge tone={c.status === "pending" ? "warning" : c.status === "approved" ? "success" : "danger"}>{L[c.status]}</Badge></p>)}
                </div>
              )}
              {correcting === i && (
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-canvas p-2 ms-[42px]">
                  <select value={corrTo} onChange={(e) => setCorrTo(e.target.value as AttendanceStatus)} className="h-8 rounded-md border border-line px-2 text-[13px]">{ORDER.map((s) => <option key={s} value={s}>{L[s]}</option>)}</select>
                  <input value={corrReason} onChange={(e) => setCorrReason(e.target.value)} placeholder={L.correctionReason} className="h-8 min-w-[200px] flex-1 rounded-md border border-line px-2 text-[13px]" />
                  <Button size="sm" disabled={!corrReason.trim()} onClick={() => { requestCorrection(existing!.id, ri, corrTo, corrReason); setCorrecting(null); }}>{L.send}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setCorrecting(null)}>{L.cancel}</Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {!locked && canEdit && (
        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur">
          <span className={cn("text-[13px] font-medium", counts.n ? "text-amber-700" : "text-emerald-700")}>{counts.n ? L.notMarked(counts.n) : L.allMarked}</span>
          {counts.n > 0 && <Button variant="secondary" size="sm" onClick={() => setMarks((x) => x.map((v) => v ?? "P"))}>{L.markRest(counts.n)}</Button>}
          <Button className="ms-auto" size="lg" disabled={counts.n > 0 || missingReason} onClick={submit}>{offline ? <CloudOff /> : <Check />}{offline ? L.submitOffline : L.submit}</Button>
        </div>
      )}
    </Card>
  );
}
