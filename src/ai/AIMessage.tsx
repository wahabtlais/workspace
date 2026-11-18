import { useState } from "react";
import { Link } from "react-router";
import { Bot, Check, ChevronDown, Copy, FileText, Inbox, Info, Loader2, Paperclip, Pencil, Save, ShieldCheck, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/misc";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { saveDoc } from "./general";
import { logAI } from "./engine";
import { getPersona } from "@/config/personas";
import type { Turn } from "./aiStore";
import type { Block } from "./types";

const DATA_LABEL: Record<string, string> = { standard: "General organizational data", "staff-HR": "Staff HR data", "learner-PII": "Learner records (pseudonymised)", "minor-PII": "Minor learner data", "pupil-data": "Pupil data (aggregated only)", safeguarding: "Safeguarding (never used)", financial: "Financial data" };

/** Simple, readable horizontal bars. Highlighted bars carry a text marker, so colour is never the only signal. */
export function BarList({ data, unit, max, suffix = "" }: { data: { label: string; value: number; flag?: boolean }[]; unit?: string; max?: number; suffix?: string }) {
  const top = max ?? Math.max(...data.map((d) => Math.abs(d.value)), 1);
  return (
    <div className="space-y-1.5">
      {data.map((d) => (
        <div key={d.label} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-2 text-[12px] sm:grid-cols-[minmax(0,14rem)_1fr_auto]">
          <span className="truncate text-muted" title={d.label}>{d.label}</span>
          <span className="h-2.5 rounded-full bg-canvas"><span className={cn("block h-2.5 rounded-full", d.flag ? "bg-amber-500" : "bg-brand-500")} style={{ width: `${Math.max(2, (Math.abs(d.value) / top) * 100)}%` }} /></span>
          <span className={cn("tabular w-14 text-right font-medium", d.flag && "text-amber-800")}>{d.value > 0 && unit === "%" ? "+" : ""}{d.value}{unit === "%" ? "%" : suffix}{d.flag ? " ▲" : ""}</span>
        </div>
      ))}
    </div>
  );
}

function DocBlock({ block }: { block: Extract<Block, { kind: "doc" }> }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(block.body);
  const copy = () => { void navigator.clipboard?.writeText(text); toast({ tone: "success", title: "Copied to clipboard" }); };
  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <FileText className="size-4 text-muted" />
        <span className="flex-1 text-[13px] font-medium">{block.title}</span>
        {block.docType && <Badge tone="outline">{block.docType}</Badge>}
        <Button size="sm" variant="ghost" onClick={() => setEditing((e) => !e)}>{editing ? <><Check /> Done</> : <><Pencil /> Edit</>}</Button>
        <Button size="sm" variant="ghost" onClick={copy}><Copy /> Copy</Button>
        <Button size="sm" variant="ghost" onClick={() => toast({ tone: "ai", title: "Saved (simulated)", body: saveDoc(`${block.title.replace(/^Subject: /, "")} (AI draft)`, block.docType === "Sheet" ? "Sheet" : "Google Doc", "AI Workspace") })}><Save /> Save</Button>
      </div>
      {editing ? <Textarea className="m-0 min-h-48 rounded-none border-0 font-[inherit] text-[13px] leading-relaxed" value={text} onChange={(e) => setText(e.target.value)} aria-label={`Edit ${block.title}`} />
        : <div dir="auto" className="whitespace-pre-wrap px-3 py-3 text-[13px] leading-relaxed">{text}</div>}
    </div>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.kind) {
    case "text": return <p className="text-[13.5px] leading-relaxed">{b.text}</p>;
    case "bullets": return <div>{b.title && <p className="mb-1 text-[13px] font-semibold">{b.title}</p>}<ul className="list-disc space-y-1 pl-5 text-[13.5px] leading-relaxed">{b.items.map((x) => <li key={x}>{x}</li>)}</ul></div>;
    case "table": return (
      <div>{b.title && <p className="mb-1.5 text-[13px] font-semibold">{b.title}</p>}
        <div className="overflow-x-auto rounded-lg border border-line"><table className="w-full text-[12.5px]"><thead className="bg-canvas text-left text-muted"><tr>{b.head.map((h) => <th key={h} className="whitespace-nowrap px-3 py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>{b.rows.map((r, i) => <tr key={i} className="border-t border-line">{r.map((c, j) => <td key={j} className={cn("px-3 py-2 align-top", typeof c === "number" && "tabular")}>{c}</td>)}</tr>)}</tbody></table></div>
      </div>
    );
    case "chart": return <div className="rounded-lg border border-line p-3"><p className="mb-2 text-[13px] font-semibold">{b.title}</p><BarList data={b.data} unit={b.unit} />{b.note && <p className="mt-2 text-[11.5px] text-muted">{b.note}</p>}</div>;
    case "doc": return <DocBlock block={b} />;
    case "notice": return (
      <div className={cn("flex gap-2 rounded-lg px-3 py-2 text-[12.5px]", b.tone === "governance" ? "bg-ai-50 text-ai-800" : b.tone === "warning" ? "bg-amber-50 text-amber-900" : "bg-canvas text-muted")}>
        {b.tone === "governance" ? <ShieldCheck className="mt-0.5 size-4 shrink-0" /> : <Info className="mt-0.5 size-4 shrink-0" />}<span>{b.text}</span>
      </div>
    );
  }
}

export function AIMessage({ t, onConfirm, onDismiss, onFollowUp, compact }: { t: Turn; onConfirm: () => void; onDismiss: () => void; onFollowUp: (p: string) => void; compact?: boolean }) {
  const r = t.response;
  const [why, setWhy] = useState(false);
  const plain = () => r.blocks.map((b) => b.kind === "text" ? b.text : b.kind === "bullets" ? [b.title, ...b.items.map((i) => `• ${i}`)].filter(Boolean).join("\n") : b.kind === "doc" ? `${b.title}\n${b.body}` : b.kind === "table" ? [b.title, b.head.join(" | "), ...b.rows.map((x) => x.join(" | "))].filter(Boolean).join("\n") : b.kind === "chart" ? `${b.title}\n${b.data.map((x) => `${x.label}: ${x.value}`).join("\n")}` : b.text).join("\n\n");
  const toInbox = () => {
    const s = useDemo.getState();
    s.addInbox({ toPersona: s.personaId, kind: "task", title: `Follow up: ${t.prompt.length > 60 ? t.prompt.slice(0, 58) + "…" : t.prompt}`, detail: "Saved from AI Workspace", link: "/ai", source: "AI Workspace" });
    logAI(getPersona(s.personaId), "Result sent to Inbox", t.prompt);
    toast({ tone: "success", title: "Added to your Inbox" });
  };
  return (
    <div className="space-y-3">
      <div className="ml-auto max-w-[85%] space-y-1.5">
        {t.files.length > 0 && <div className="flex flex-wrap justify-end gap-1.5">{t.files.map((f) => <span key={f.id} className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11.5px] text-muted"><Paperclip className="size-3" />{f.name}</span>)}</div>}
        <div className="rounded-2xl rounded-br-sm bg-brand-600 px-3.5 py-2 text-[13.5px] text-white">{t.prompt}</div>
      </div>
      <div className={cn("rounded-xl border border-line bg-surface", compact ? "p-3" : "p-4")}>
        <div className="mb-2 flex items-center gap-2 text-[12px] text-muted">
          <Bot className="size-3.5 text-ai-600" /> {r.agent}
          {r.restricted && <Badge tone="ai">Permission check</Badge>}
          <Badge tone="outline" className="ml-auto">Simulated AI</Badge>
        </div>
        {!t.done && (
          <ol className="space-y-1">
            {r.steps.map((s, i) => <li key={s} className="flex items-center gap-2 text-[12px] text-muted">{i < t.stepsDone ? <Check className="size-3.5 text-emerald-600" /> : i === t.stepsDone ? <Loader2 className="size-3.5 animate-spin text-ai-500" /> : <span className="size-3.5 rounded-full border border-line-strong" />}{s}</li>)}
          </ol>
        )}
        {t.done && (
          <div className="animate-fade-in space-y-3">
            {r.blocks.map((b, i) => <BlockView key={i} b={b} />)}
            {r.sources.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {r.sources.map((s) => { const inner = <><FileText className="size-3" />{s.label}{s.why && <span className="text-subtle">· {s.why}</span>}</>; return s.link ? <Link key={s.label} to={s.link} className="inline-flex items-center gap-1 rounded-md bg-canvas px-2 py-0.5 text-[11.5px] text-muted hover:text-brand-700">{inner}</Link> : <span key={s.label} className="inline-flex items-center gap-1 rounded-md bg-canvas px-2 py-0.5 text-[11.5px] text-muted">{inner}</span>; })}
              </div>
            )}
            <div>
              <button onClick={() => setWhy((w) => !w)} className="inline-flex items-center gap-1 text-[12px] font-medium text-ai-700 hover:underline"><ShieldCheck className="size-3.5" /> How I got this <ChevronDown className={cn("size-3.5 transition", why && "rotate-180")} /></button>
              {why && (
                <div className="mt-2 space-y-1.5 rounded-lg bg-ai-50/60 p-3 text-[12px] text-ai-900">
                  {r.reasoning && <p>{r.reasoning}</p>}
                  <p><b>Steps:</b> {r.steps.join(" → ")}</p>
                  <p><b>Data used:</b> {r.dataUsed && r.dataUsed.length ? r.dataUsed.map((x) => DATA_LABEL[x]).join(", ") : "No organizational records"}. Only records you are allowed to see were used. Safeguarding records are never available to AI.</p>
                  <p>This answer was written to the audit log.</p>
                </div>
              )}
            </div>
            {r.proposedAction && (
              <div className="rounded-lg border border-dashed border-ai-200 bg-ai-50/50 p-3">
                <p className="text-[12px] text-ai-800">Suggested next step: nothing changes until you confirm.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {t.action === "confirmed" ? <Badge tone="success" dot>Done: {r.proposedAction.label}</Badge> : t.action === "dismissed" ? <Badge tone="neutral">Dismissed</Badge> : <>
                    <Button size="sm" onClick={onConfirm}><Check /> {r.proposedAction.label}</Button>
                    <Button size="sm" variant="ghost" onClick={onDismiss}><X /> Not now</Button>
                  </>}
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-1 border-t border-line pt-2">
              <Button size="sm" variant="ghost" onClick={() => { void navigator.clipboard?.writeText(plain()); toast({ tone: "success", title: "Copied to clipboard" }); }}><Copy /> Copy</Button>
              <Button size="sm" variant="ghost" onClick={() => toast({ tone: "ai", title: "Saved (simulated)", body: saveDoc(`${t.prompt.slice(0, 50)} (AI result)`, "Google Doc", "AI Workspace") })}><Save /> Save to Documents</Button>
              <Button size="sm" variant="ghost" onClick={toInbox}><Inbox /> Send to my Inbox</Button>
            </div>
            {r.followUps && r.followUps.length > 0 && (
              <div className="flex flex-wrap gap-1.5">{r.followUps.map((f) => <button key={f} onClick={() => onFollowUp(f)} className="inline-flex items-center gap-1 rounded-full border border-ai-200 bg-ai-50/40 px-2.5 py-1 text-[12px] text-ai-800 hover:bg-ai-50"><Sparkles className="size-3" />{f}</button>)}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
