import { Link, NavLink, Outlet } from "react-router";
import { ArrowLeft, CalendarCheck, ClipboardList, CloudOff, Home, RefreshCw, School, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/shell/Brand";
import { useDemo } from "@/store/demoStore";
import { usePersona } from "@/store/hooks";
import { useUI } from "@/store/uiStore";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/field", label: "Today", icon: Home, end: true },
  { to: "/field/schools", label: "Schools", icon: School },
  { to: "/field/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/field/forms", label: "Forms", icon: ClipboardList },
  { to: "/field/sync", label: "Sync", icon: RefreshCw },
];

/** Phone-first field experience for Project Officers and Trainers. On desktop it renders inside a phone-width frame. */
export function FieldLayout() {
  const persona = usePersona();
  const offline = useDemo((s) => s.offline);
  const queue = useDemo((s) => s.syncQueue);
  const resetCount = useDemo((s) => s.resetCount);
  const setPicker = useUI((s) => s.setPersonaPicker);
  if (!["su_po", "su_trainer"].includes(persona.role)) {
    return (
      <div className="mx-auto mt-12 max-w-sm rounded-2xl border border-line bg-surface p-6 text-center shadow-card">
        <p className="font-semibold">Field mode is for Project Officers and Trainers</p>
        <p className="mt-1 text-[13px] text-muted">Switch to Omar Haddad (Project Officer) or Jad Mansour (Trainer) to try it.</p>
        <Button className="mt-4" onClick={() => setPicker(true)}>Switch persona</Button>
      </div>
    );
  }
  return (
    <div className="min-h-[calc(100vh-40px)] bg-slate-200/70 sm:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-[430px] flex-col bg-canvas shadow-pop sm:min-h-[760px] sm:overflow-hidden sm:rounded-[28px] sm:border-8 sm:border-ink-900">
        <header className="sticky top-0 z-20 flex items-center gap-2 bg-ink-900 px-4 py-3 text-white">
          <BrandMark size={24} />
          <div className="min-w-0 flex-1 leading-tight"><p className="text-[14px] font-semibold">Field mode</p><p className="truncate text-[11px] text-white/60">{persona.name}</p></div>
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium", offline ? "bg-amber-400 text-ink-950" : "bg-white/10")}>{offline ? <CloudOff className="size-3.5" /> : <Wifi className="size-3.5" />}{offline ? "Offline" : "Online"}{queue.length > 0 && ` · ${queue.length}`}</span>
        </header>
        {offline && <div className="bg-amber-50 px-4 py-2 text-[12px] text-amber-900">Working offline. Everything you submit is saved on this phone and syncs when you reconnect.</div>}
        <main key={`${persona.id}-${resetCount}`} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-24 animate-fade-in">
          <Outlet />
          <Link to="/" className="flex items-center justify-center gap-1 pt-2 text-[12px] text-muted"><ArrowLeft className="size-3.5" /> Back to Staff Workspace</Link>
        </main>
        <nav className="sticky bottom-0 z-20 grid grid-cols-5 border-t border-line bg-surface" aria-label="Field mode">
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => cn("relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium", isActive ? "text-brand-700" : "text-muted")}>
              <t.icon className="size-5" />{t.label}
              {t.label === "Sync" && queue.length > 0 && <span className="absolute right-4 top-1.5 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">{queue.length}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
