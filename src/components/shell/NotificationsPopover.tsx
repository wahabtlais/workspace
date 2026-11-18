import { Link } from "react-router";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/overlay";
import { useDemo } from "@/store/demoStore";
import { useNotifications, usePersona } from "@/store/hooks";
import { cn, relativeDay } from "@/lib/utils";

const DOT = { info: "bg-brand-500", success: "bg-emerald-500", warning: "bg-amber-500", danger: "bg-red-500", ai: "bg-ai-500" };

export function NotificationsPopover({ dark }: { dark?: boolean }) {
  const persona = usePersona();
  const list = useNotifications();
  const markRead = useDemo((s) => s.markNotificationsRead);
  const unread = list.filter((n) => !n.read).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={cn("relative rounded-lg p-2", dark ? "text-white/80 hover:bg-white/10" : "text-muted hover:bg-canvas hover:text-fg")} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
          <Bell className="size-[18px]" />
          {unread > 0 && <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">{unread}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px]">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="font-semibold">Notifications</p>
          {unread > 0 && <button className="text-[12px] font-medium text-brand-600 hover:underline" onClick={() => markRead(persona.id, persona.role)}>Mark all read</button>}
        </div>
        <ul className="max-h-[360px] overflow-y-auto scrollbar-thin">
          {list.length === 0 && <li className="px-4 py-8 text-center text-[13px] text-muted">You’re all caught up.</li>}
          {list.map((n) => (
            <li key={n.id}>
              <Link to={n.link ?? "#"} className={cn("flex gap-3 px-4 py-3 hover:bg-canvas", !n.read && "bg-brand-50/40")}>
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-line-strong" : DOT[n.tone])} />
                <span className="min-w-0">
                  <span className="block text-[13px] text-fg">{n.text}</span>
                  <span className="text-[11px] text-subtle">{relativeDay(n.at)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
