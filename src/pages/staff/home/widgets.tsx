import { Link } from "react-router";
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardCheck, FileSignature, GraduationCap, Inbox as InboxIcon, Megaphone, TriangleAlert, type LucideIcon } from "lucide-react";
import type { InboxItem, InboxKind } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { useData, useInbox } from "@/store/hooks";
import { cn, relativeDay } from "@/lib/utils";

export const KIND_META: Record<InboxKind, { label: string; icon: LucideIcon; tone: "info" | "warning" | "ai" | "success" | "neutral" | "danger" }> = {
  approval: { label: "Approval", icon: FileSignature, tone: "info" },
  task: { label: "Task", icon: CheckCircle2, tone: "neutral" },
  grading: { label: "Grading", icon: GraduationCap, tone: "info" },
  form: { label: "Form", icon: ClipboardCheck, tone: "neutral" },
  register: { label: "Register", icon: CalendarDays, tone: "warning" },
  alert: { label: "Alert", icon: TriangleAlert, tone: "danger" },
  mention: { label: "Mention", icon: Megaphone, tone: "neutral" },
  review: { label: "Review", icon: ClipboardCheck, tone: "info" },
};

export function InboxRow({ item, compact }: { item: InboxItem; compact?: boolean }) {
  const meta = KIND_META[item.kind];
  return (
    <Link to={item.link} className={cn("group flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-canvas", item.status === "done" && "opacity-60")}>
      <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", item.priority === "high" ? "bg-red-50 text-red-600" : "bg-canvas text-muted")}><meta.icon className="size-4" /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-medium text-fg">{item.title}</span>
        <span className="block truncate text-[12px] text-muted">{item.detail}</span>
      </span>
      {!compact && <Badge tone={meta.tone}>{meta.label}</Badge>}
      <span className="shrink-0 text-[11px] text-subtle">{item.due ? `Due ${relativeDay(item.due)}` : relativeDay(item.createdAt)}</span>
    </Link>
  );
}

export function InboxPreview() {
  const items = useInbox().filter((i) => i.status === "open");
  return (
    <Card className="h-full">
      <CardHeader icon={<InboxIcon />} title="Needs your attention" subtitle={`${items.length} open item${items.length === 1 ? "" : "s"} in your Inbox`}
        action={<Link to="/inbox" className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:underline">Open Inbox <ArrowRight className="size-3.5" /></Link>} />
      <CardBody className="pt-0">
        {items.length === 0 ? <EmptyState title="Nothing waiting for you" body="Approvals, tasks, grading and registers will appear here." /> : (
          <div className="-mx-2">{items.slice(0, 6).map((i) => <InboxRow key={i.id} item={i} compact />)}</div>
        )}
      </CardBody>
    </Card>
  );
}

export function ActivityFeed() {
  const activity = useData().activity;
  return (
    <Card>
      <CardHeader title="Recent activity" subtitle="Across the workspaces you can see" />
      <CardBody className="pt-0">
        <ol className="space-y-3">
          {activity.slice(0, 6).map((a) => (
            <li key={a.id} className="flex gap-3 text-[13px]">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-400" />
              <span className="min-w-0"><span className="font-medium text-fg">{a.actor}</span> <span className="text-muted">{a.text}</span>
                <span className="block text-[11px] text-subtle">{a.area} · {relativeDay(a.at)}</span></span>
            </li>
          ))}
        </ol>
      </CardBody>
    </Card>
  );
}

export function MiniTable({ head, rows, empty }: { head: string[]; rows: React.ReactNode[][]; empty?: string }) {
  if (!rows.length) return <EmptyState title={empty ?? "Nothing to show"} />;
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[520px] text-[13px]">
        <thead><tr className="border-y border-line bg-canvas/60 text-left text-[12px] text-muted">{head.map((h) => <th key={h} className="px-5 py-2 font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-b border-line last:border-0 hover:bg-canvas/50">{r.map((c, j) => <td key={j} className="px-5 py-2.5 align-middle">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
