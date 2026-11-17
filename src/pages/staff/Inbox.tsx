import { useState } from "react";
import { Link } from "react-router";
import { Check, ExternalLink, Inbox as InboxIcon, RotateCcw } from "lucide-react";
import type { InboxKind } from "@/data/types";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/store/demoStore";
import { useInbox } from "@/store/hooks";
import { cn, relativeDay } from "@/lib/utils";
import { KIND_META } from "./home/widgets";

const FILTERS: { key: string; label: string; kinds?: InboxKind[] }[] = [
  { key: "all", label: "All" },
  { key: "approvals", label: "Approvals & reviews", kinds: ["approval", "review"] },
  { key: "tasks", label: "Tasks", kinds: ["task", "mention"] },
  { key: "grading", label: "Grading", kinds: ["grading"] },
  { key: "forms", label: "Registers & forms", kinds: ["register", "form"] },
  { key: "alerts", label: "Alerts", kinds: ["alert"] },
];

export default function Inbox() {
  const items = useInbox();
  const complete = useDemo((s) => s.completeInbox);
  const update = useDemo((s) => s.update);
  const [filter, setFilter] = useState("all");
  const [showDone, setShowDone] = useState(false);
  const kinds = FILTERS.find((f) => f.key === filter)?.kinds;
  const list = items.filter((i) => (!kinds || kinds.includes(i.kind)) && (showDone ? i.status === "done" : i.status === "open"));
  const count = (k?: InboxKind[]) => items.filter((i) => i.status === "open" && (!k || k.includes(i.kind))).length;

  return (
    <>
      <PageHeader crumbs={[{ label: "My Work" }, { label: "Inbox" }]} title="Inbox"
        description="One place for everything that needs you: approvals, tasks, grading, registers, forms and alerts, from every workspace and from AI agents." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} aria-pressed={filter === f.key}
            className={cn("inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium", filter === f.key ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line bg-surface text-muted hover:text-fg")}>
            {f.label}<span className="tabular text-[12px] opacity-70">{count(f.kinds)}</span>
          </button>
        ))}
        <label className="ml-auto inline-flex items-center gap-2 text-[13px] text-muted">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} className="size-4 accent-brand-600" /> Show completed
        </label>
      </div>
      <Card>
        {list.length === 0 ? (
          <div className="p-6"><EmptyState icon={<InboxIcon />} title={showDone ? "No completed items yet" : "You’re all caught up"} body="New approvals, tasks and alerts from any workspace will appear here." /></div>
        ) : (
          <ul className="divide-y divide-line">
            {list.map((i) => {
              const meta = KIND_META[i.kind];
              return (
                <li key={i.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", i.priority === "high" ? "bg-red-50 text-red-600" : "bg-canvas text-muted")}><meta.icon className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-fg">{i.title}</p>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      {i.priority === "high" && <Badge tone="danger">High priority</Badge>}
                    </div>
                    <p className="mt-0.5 text-[13px] text-muted">{i.detail}</p>
                    <p className="mt-1 text-[12px] text-subtle">From {i.source} · {relativeDay(i.createdAt)}{i.due ? ` · Due ${relativeDay(i.due)}` : ""}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button asChild variant="secondary" size="sm"><Link to={i.link}><ExternalLink /> Open</Link></Button>
                    {i.status === "open"
                      ? <Button size="sm" variant="subtle" onClick={() => complete(i.id)}><Check /> Mark done</Button>
                      : <Button size="sm" variant="ghost" onClick={() => update((d) => { const x = d.inbox.find((y) => y.id === i.id); if (x) x.status = "open"; })}><RotateCcw /> Reopen</Button>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
