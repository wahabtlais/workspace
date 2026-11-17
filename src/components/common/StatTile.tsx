import * as React from "react";
import { Link } from "react-router";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/misc";

export function StatTile({ label, value, sub, icon, trend, target, progress, tone = "brand", to, className }: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: { value: string; good: boolean; up?: boolean };
  target?: string;
  progress?: number;
  tone?: "brand" | "success" | "warning" | "danger" | "ai";
  to?: string;
  className?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        {icon && <span className="rounded-lg bg-canvas p-1.5 text-muted [&_svg]:size-4">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="tabular text-[26px] font-semibold leading-none text-fg">{value}</span>
        {trend && (
          <span className={cn("inline-flex items-center text-[12px] font-medium", trend.good ? "text-emerald-700" : "text-red-700")}>
            {(trend.up ?? trend.good) ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {trend.value}
          </span>
        )}
      </div>
      {progress !== undefined && <Progress value={progress} tone={tone} className="mt-3" />}
      {(sub || target) && (
        <div className="mt-2 flex items-center justify-between gap-2 text-[12px] text-muted">
          <span className="truncate">{sub}</span>
          {target && <span className="shrink-0">Target {target}</span>}
        </div>
      )}
    </>
  );
  const cls = cn("block rounded-xl border border-line bg-surface p-4 shadow-card", to && "transition hover:border-brand-200 hover:shadow-md", className);
  return to ? <Link to={to} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}
