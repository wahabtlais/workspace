import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { findNav } from "@/config/navigation";
import { access, ACCESS_LABEL, type Area } from "@/config/access";
import { PageHeader, type Crumb } from "@/components/common/PageHeader";
import { Guard } from "@/components/shell/Guard";
import { Badge } from "@/components/ui/badge";
import { usePersona } from "@/store/hooks";
import { cn } from "@/lib/utils";

/** Standard workspace page: breadcrumbs, title, sub-navigation, access check and the access-level chip. */
export function Workspace({ area, title, description, actions, aiActions, crumbs, meta, children, hideSubnav }: {
  area: Area; title: ReactNode; description?: ReactNode; actions?: ReactNode; aiActions?: ReactNode; crumbs?: Crumb[]; meta?: ReactNode; children: ReactNode; hideSubnav?: boolean;
}) {
  const { pathname } = useLocation();
  const persona = usePersona();
  const nav = findNav(pathname);
  const level = access(persona, area);
  const baseCrumbs: Crumb[] = nav ? [{ label: nav.item.label, to: nav.item.path }, ...(nav.child && nav.child.path !== nav.item.path ? [{ label: nav.child.label, to: nav.child.path }] : [])] : [];
  return (
    <Guard area={area}>
      <PageHeader crumbs={crumbs ?? baseCrumbs} title={title} description={description} actions={actions} aiActions={aiActions}
        meta={<>{meta}{level !== "full" && level !== "none" && <Badge tone="outline">Your access: {ACCESS_LABEL[level]}</Badge>}</>} />
      {!hideSubnav && nav?.item.children && nav.item.children.length > 1 && (
        <div className="-mt-2 mb-5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {nav.item.children.map((c) => (
            <Link key={c.path} to={c.path} className={cn("whitespace-nowrap rounded-full border px-3 py-1 text-[12.5px] font-medium", c.path === nav.child?.path ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line bg-surface text-muted hover:text-fg")}>{c.label}</Link>
          ))}
        </div>
      )}
      <div className="space-y-5">{children}</div>
    </Guard>
  );
}

export function KeyValue({ items, cols = 2 }: { items: [string, ReactNode][]; cols?: 2 | 3 | 4 }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-3", cols === 2 ? "sm:grid-cols-2" : cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4")}>
      {items.map(([k, v]) => (
        <div key={k}><dt className="text-[12px] text-muted">{k}</dt><dd className="mt-0.5 text-[14px] text-fg">{v}</dd></div>
      ))}
    </dl>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[] }) {
  return (
    <div role="tablist" className="inline-flex rounded-lg border border-line bg-surface p-0.5">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
          className={cn("rounded-md px-3 py-1.5 text-[13px] font-medium", value === o.value ? "bg-brand-600 text-white" : "text-muted hover:text-fg")}>{o.label}</button>
      ))}
    </div>
  );
}
