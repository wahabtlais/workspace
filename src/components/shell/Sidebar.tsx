import { Link, NavLink, useLocation } from "react-router";
import { ChevronDown } from "lucide-react";
import { STAFF_NAV, findNav, type NavItem } from "@/config/navigation";
import { access, ACCESS_LABEL } from "@/config/access";
import { useOpenInboxCount, usePersona } from "@/store/hooks";
import { useUI } from "@/store/uiStore";
import { Brand } from "./Brand";
import { cn } from "@/lib/utils";

function Item({ item, active, inboxCount, accessLabel }: { item: NavItem; active: boolean; inboxCount: number; accessLabel?: string }) {
  const { pathname } = useLocation();
  const close = () => useUI.getState().setMobileNav(false);
  const showChildren = active && item.children && item.children.length > 1;
  const activeChild = findNav(pathname)?.child?.path;
  return (
    <li>
      <Link to={item.path} onClick={close} aria-current={active ? "page" : undefined}
        className={cn("group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13.5px] transition", active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/[0.06] hover:text-white")}>
        <item.icon className={cn("size-[17px] shrink-0", active ? "text-accent-400" : "text-white/50 group-hover:text-white/80")} />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge === "inbox" && inboxCount > 0 && <span className="rounded-full bg-accent-400 px-1.5 text-[11px] font-semibold text-ink-950 tabular">{inboxCount}</span>}
        {accessLabel && <span className="hidden rounded bg-white/10 px-1 text-[10px] text-white/60 group-hover:inline">{accessLabel}</span>}
        {item.children && item.children.length > 1 && <ChevronDown className={cn("size-3.5 text-white/40 transition", !active && "-rotate-90")} />}
      </Link>
      {showChildren && (
        <ul className="mb-1 ml-[22px] mt-0.5 space-y-px border-l border-white/10 pl-2.5">
          {item.children!.map((c) => (
            <li key={c.path}>
              <NavLink to={c.path} end onClick={close}
                className={cn("block rounded-md px-2 py-[5px] text-[12.5px]", activeChild === c.path ? "bg-white/10 font-medium text-white" : "text-white/60 hover:text-white")}>
                {c.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function SidebarContent() {
  const persona = usePersona();
  const { pathname } = useLocation();
  const current = findNav(pathname)?.item.path;
  const inboxCount = useOpenInboxCount();
  return (
    <div className="flex h-full flex-col bg-ink-900">
      <div className="flex h-14 items-center px-4"><Brand sub="Staff Workspace" /></div>
      <nav className="flex-1 overflow-y-auto px-2.5 pb-4 scrollbar-dark" aria-label="Main">
        {STAFF_NAV.map((g) => {
          const items = g.items.filter((i) => access(persona, i.area) !== "none");
          if (!items.length) return null;
          return (
            <div key={g.label} className="mt-4 first:mt-1">
              <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/35">{g.label}</p>
              <ul className="space-y-px">
                {items.map((i) => {
                  const lvl = access(persona, i.area);
                  return <Item key={i.path} item={i} active={current === i.path} inboxCount={inboxCount} accessLabel={lvl === "aggregate" || lvl === "view" || lvl === "scoped" ? ACCESS_LABEL[lvl] : undefined} />;
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-4 py-3 text-[11px] leading-snug text-white/40">
        Menu shows only what {persona.name.split(" ")[0]}’s role allows.
      </div>
    </div>
  );
}

export function Sidebar() {
  const mobileOpen = useUI((s) => s.mobileNavOpen);
  const setMobile = useUI((s) => s.setMobileNav);
  return (
    <>
      <aside className="hidden w-[248px] shrink-0 lg:block"><div className="sticky top-0 h-[calc(100vh-40px)]"><SidebarContent /></div></aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50 animate-fade-in" onClick={() => setMobile(false)} />
          <div className="absolute inset-y-0 left-0 w-[272px] shadow-pop animate-slide-in-right"><SidebarContent /></div>
        </div>
      )}
    </>
  );
}
