import { Link, useLocation } from "react-router";
import { Hammer, ListChecks } from "lucide-react";
import { findNav } from "@/config/navigation";
import { access, ACCESS_LABEL } from "@/config/access";
import { SECTION_INFO } from "@/config/sections";
import { PageHeader } from "@/components/common/PageHeader";
import { Guard } from "@/components/shell/Guard";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePersona } from "@/store/hooks";
import { cn } from "@/lib/utils";

/** Phase A scaffold: every route exists, is permission-checked and navigable. Working screens are built in Phase B/C. */
export default function SectionPage() {
  const { pathname } = useLocation();
  const persona = usePersona();
  const nav = findNav(pathname);
  if (!nav) return <PageHeader title="Page not found" description="This page doesn’t exist in the prototype." />;
  const { item, child } = nav;
  const exact = child?.path === pathname || item.path === pathname;
  const title = exact ? (child && child.path !== item.path ? child.label : item.label) : "Record detail";
  const info = SECTION_INFO[pathname];
  const level = access(persona, item.area);
  return (
    <Guard area={item.area}>
      <PageHeader
        crumbs={[{ label: item.label, to: item.path }, ...(child && child.path !== item.path ? [{ label: child.label, to: child.path }] : []), ...(!exact ? [{ label: "Detail" }] : [])]}
        title={title}
        description={info?.description ?? `${item.label} · ${title}`}
        meta={<Badge tone="outline">Your access: {ACCESS_LABEL[level]}</Badge>}
      />
      {item.children && item.children.length > 1 && (
        <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {item.children.map((c) => (
            <Link key={c.path} to={c.path} className={cn("whitespace-nowrap rounded-full border px-3 py-1 text-[12.5px] font-medium", c.path === child?.path ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line bg-surface text-muted hover:text-fg")}>{c.label}</Link>
          ))}
        </div>
      )}
      <Card>
        <CardHeader icon={<Hammer />} title="Scaffolded in Phase A" subtitle="This route, its navigation and its access rules are in place. The working screen is built in the next phase." />
        <CardBody>
          {info ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {info.planned.map((p) => <li key={p} className="flex items-start gap-2 rounded-lg bg-canvas px-3 py-2 text-[13px]"><ListChecks className="mt-0.5 size-4 shrink-0 text-brand-600" />{p}</li>)}
            </ul>
          ) : <p className="text-[13px] text-muted">This page will be built in Phase B on the shared fictional dataset.</p>}
        </CardBody>
      </Card>
    </Guard>
  );
}
