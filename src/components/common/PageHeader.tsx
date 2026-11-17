import * as React from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb { label: string; to?: string }

export function PageHeader({ crumbs, title, description, actions, aiActions, meta, className }: {
  crumbs?: Crumb[];
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  aiActions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-[13px] text-muted">
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="size-3.5 text-subtle rtl:rotate-180" />}
              {c.to ? <Link to={c.to} className="hover:text-fg hover:underline">{c.label}</Link> : <span className="text-fg/80">{c.label}</span>}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold leading-tight text-fg">{title}</h1>
          {description && <p className="mt-1.5 max-w-3xl text-[14px] text-muted">{description}</p>}
          {meta && <div className="mt-2.5 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {(actions || aiActions) && (
          <div className="flex flex-wrap items-center gap-2">
            {aiActions}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
