import * as React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ icon, title, body, action, className }: { icon?: React.ReactNode; title: string; body?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface/60 px-6 py-10 text-center", className)}>
      {icon && <div className="mb-3 rounded-full bg-canvas p-3 text-muted [&_svg]:size-5">{icon}</div>}
      <p className="font-medium text-fg">{title}</p>
      {body && <p className="mt-1 max-w-md text-[13px] text-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
