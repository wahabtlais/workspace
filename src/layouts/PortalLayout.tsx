import { Link, NavLink, Outlet } from "react-router";
import type { PortalNavItem } from "@/config/navigation";
import type { Surface } from "@/data/types";
import { PORTAL_ICONS } from "@/components/shell/portalIcons";
import { BrandMark } from "@/components/shell/Brand";
import { NotificationsPopover } from "@/components/shell/NotificationsPopover";
import { SyncStatus } from "@/components/shell/TopBar";
import { Avatar } from "@/components/ui/misc";
import { LangToggle, useTeacherT } from "@/i18n/teacher";
import { useDemo } from "@/store/demoStore";
import { usePersona } from "@/store/hooks";
import { useUI } from "@/store/uiStore";
import { SurfaceMismatch } from "./SurfaceMismatch";
import { cn } from "@/lib/utils";

const ACCENT: Record<Exclude<Surface, "staff">, { ring: string; active: string; chip: string }> = {
  student: { ring: "bg-fb", active: "bg-fb-50 text-fb", chip: "bg-fb-50 text-fb" },
  tf: { ring: "bg-su", active: "bg-su-50 text-su", chip: "bg-su-50 text-su" },
  teacher: { ring: "bg-su", active: "bg-su-50 text-su", chip: "bg-su-50 text-su" },
  partner: { ring: "bg-brand-600", active: "bg-brand-50 text-brand-700", chip: "bg-brand-50 text-brand-700" },
};

export function PortalLayout({ surface, title, nav, bilingual }: { surface: Exclude<Surface, "staff">; title: string; nav: PortalNavItem[]; bilingual?: boolean }) {
  const persona = usePersona();
  const resetCount = useDemo((s) => s.resetCount);
  const setPicker = useUI((s) => s.setPersonaPicker);
  const { lang, dir } = useTeacherT();
  const useAr = bilingual && lang === "ar";
  const accent = ACCENT[surface];
  const label = (i: PortalNavItem) => (useAr && i.labelAr ? i.labelAr : i.label);
  const home = nav[0]?.path ?? "/";

  if (persona.surface !== surface) {
    return <div className="px-4 py-6"><SurfaceMismatch target={surface} /></div>;
  }

  return (
    <div dir={useAr ? "rtl" : "ltr"} lang={useAr ? "ar" : "en"} className="min-h-[calc(100vh-40px)] bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link to={home} className="flex items-center gap-2.5">
            <BrandMark />
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold">CodeBrave</span>
              <span className={cn("block rounded px-1 text-[11px] font-medium", accent.chip)}>{title}</span>
            </span>
          </Link>
          <div className="ms-auto flex items-center gap-1.5">
            <SyncStatus />
            {bilingual && <LangToggle />}
            <NotificationsPopover />
            <button onClick={() => setPicker(true)} className="flex items-center gap-2 rounded-lg p-1 hover:bg-canvas" aria-label="Account">
              <Avatar name={persona.name} size={30} />
              <span className="hidden text-start leading-tight md:block">
                <span className="block text-[13px] font-medium">{persona.name}</span>
                <span className="block max-w-[200px] truncate text-[11px] text-muted">{persona.title}</span>
              </span>
            </button>
          </div>
        </div>
        <nav className="mx-auto max-w-6xl overflow-x-auto px-2 scrollbar-thin" aria-label={title}>
          <ul className="flex gap-1 pb-2">
            {nav.map((i) => {
              const Icon = PORTAL_ICONS[i.icon] ?? PORTAL_ICONS.home;
              return (
                <li key={i.path}>
                  <NavLink to={i.path} end={i.path === home}
                    className={({ isActive }) => cn("flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium", isActive ? accent.active : "text-muted hover:bg-canvas hover:text-fg")}>
                    <Icon className="size-4" /> {label(i)}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <main key={`${persona.id}-${resetCount}`} className="mx-auto max-w-6xl px-4 py-6 animate-fade-in" dir={dir === "rtl" && bilingual ? "rtl" : undefined}>
        <Outlet />
      </main>
    </div>
  );
}
