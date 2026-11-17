import { ArrowDown, ArrowUp, GitBranch, Trash2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

export type QType = "Single choice" | "Short text" | "Number" | "Scale 1–5" | "Yes / No" | "Photo" | "Signature" | "GPS location" | "Code answer";
export interface Q { id: string; label: string; type: QType; options: string[]; required: boolean; showIf?: { q: string; equals: string } }
export const QTYPES: QType[] = ["Single choice", "Yes / No", "Scale 1–5", "Short text", "Number", "Photo", "Signature", "GPS location", "Code answer"];

export function QuestionCard({ q, i, qs, patch, move, remove }: { q: Q; i: number; qs: Q[]; patch: (id: string, p: Partial<Q>) => void; move: (i: number, d: -1 | 1) => void; remove: (id: string) => void }) {
  const parents = qs.slice(0, i).filter((x) => x.options.length);
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-canvas text-[12px] font-semibold">{i + 1}</span>
        <Input value={q.label} onChange={(e) => patch(q.id, { label: e.target.value })} className="min-w-[200px] flex-1" aria-label={`Question ${i + 1}`} />
        <Badge tone="outline">{q.type}</Badge>
        <label className="inline-flex items-center gap-1 text-[12px] text-muted"><input type="checkbox" checked={q.required} onChange={(e) => patch(q.id, { required: e.target.checked })} className="accent-brand-600" />Required</label>
        <Button size="icon-sm" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp /></Button>
        <Button size="icon-sm" variant="ghost" disabled={i === qs.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown /></Button>
        <Button size="icon-sm" variant="ghost" onClick={() => remove(q.id)} aria-label="Delete"><Trash2 /></Button>
      </div>
      {q.options.length > 0 && <p className="mt-2 ps-9 text-[12px] text-muted">Options: {q.options.join(" · ")}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-2 ps-9 text-[12px] text-muted">
        <GitBranch className="size-3.5" /> Show only if
        <select className="h-7 rounded-md border border-line px-1" value={q.showIf?.q ?? ""} onChange={(e) => patch(q.id, { showIf: e.target.value ? { q: e.target.value, equals: qs.find((x) => x.id === e.target.value)?.options[0] ?? "" } : undefined })}>
          <option value="">always shown</option>{parents.map((x) => <option key={x.id} value={x.id}>Q{qs.indexOf(x) + 1}</option>)}
        </select>
        {q.showIf && <>equals <select className="h-7 rounded-md border border-line px-1" value={q.showIf.equals} onChange={(e) => patch(q.id, { showIf: { ...q.showIf!, equals: e.target.value } })}>{qs.find((x) => x.id === q.showIf!.q)?.options.map((o) => <option key={o}>{o}</option>)}</select></>}
      </div>
    </Card>
  );
}

export function FormPreview({ title, qs, answers, setAnswer }: { title: string; qs: Q[]; answers: Record<string, string>; setAnswer: (q: string, v: string) => void }) {
  const visible = (q: Q) => !q.showIf || answers[q.showIf.q] === q.showIf.equals;
  return (
    <Card className="mx-auto max-w-xl"><CardHeader title={title} subtitle="Preview: skip logic applies as you answer" /><CardBody className="space-y-4">
      {qs.filter(visible).map((q) => (
        <div key={q.id}>
          <p className="text-[14px] font-medium">{q.label}{q.required && <span className="text-red-600"> *</span>}</p>
          {q.options.length > 0 ? <div className="mt-2 flex flex-wrap gap-2">{q.options.map((o) => <button key={o} onClick={() => setAnswer(q.id, o)} className={cn("rounded-lg border px-3 py-1.5 text-[13px]", answers[q.id] === o ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line")}>{o}</button>)}</div>
            : q.type === "Scale 1–5" ? <div className="mt-2 flex gap-2">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setAnswer(q.id, String(n))} className={cn("size-10 rounded-lg border", answers[q.id] === String(n) ? "border-brand-500 bg-brand-50" : "border-line")}>{n}</button>)}</div>
            : <Input className="mt-2" placeholder={q.type} />}
        </div>
      ))}
    </CardBody></Card>
  );
}
