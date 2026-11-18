import { Link } from "react-router";
import { CloudOff, HelpCircle, Inbox, Menu as MenuIcon, RefreshCw, Search, Sparkles, UserRound } from "lucide-react";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@/components/ui/overlay";
import { Avatar } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/store/demoStore";
import { useOpenInboxCount, usePersona } from "@/store/hooks";
import { useUI } from "@/store/uiStore";
import { NotificationsPopover } from "./NotificationsPopover";

export function SyncStatus({ label }: { label?: { offline: string; syncing: string; unsynced: string } }) {
  const offline = useDemo((s) => s.offline);
  const queue = useDemo((s) => s.syncQueue);
  const syncNow = useDemo((s) => s.syncNow);
  if (!offline && queue.length === 0) return null;
  const syncing = queue.some((q) => q.status === "syncing");
  const L = label ?? { offline: "Offline", syncing: "Syncing", unsynced: "Unsynced" };
  return (
    <button onClick={() => syncNow()} disabled={offline || syncing}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-[12px] font-medium text-amber-800 disabled:cursor-default"
      title={offline ? "Changes are saved on this device and will sync when you reconnect" : "Sync now"}>
      {offline ? <CloudOff className="size-3.5" /> : <RefreshCw className={syncing ? "size-3.5 animate-spin" : "size-3.5"} />}
      {offline ? L.offline : syncing ? L.syncing : L.unsynced}{queue.length > 0 && ` · ${queue.length}`}
    </button>
  );
}

export function TopBar() {
  const persona = usePersona();
  const inboxCount = useOpenInboxCount();
  const { setSearch, setAsk, setPersonaPicker, setMobileNav } = useUI();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur sm:px-5">
      <button className="rounded-lg p-2 text-muted hover:bg-canvas lg:hidden" onClick={() => setMobileNav(true)} aria-label="Open menu"><MenuIcon className="size-5" /></button>
      <button onClick={() => setSearch(true)} className="flex h-9 min-w-0 max-w-md flex-1 items-center gap-2 rounded-lg border border-line bg-canvas px-3 text-left text-[13px] text-subtle hover:border-line-strong">
        <Search className="size-4 shrink-0" />
        <span className="truncate">Search records, documents, knowledge…</span>
        <span className="ml-auto hidden rounded border border-line bg-surface px-1.5 text-[11px] text-muted sm:inline">Ctrl K</span>
      </button>
      <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
        <SyncStatus />
        <Button variant="ai" size="sm" onClick={() => setAsk(true)} className="hidden sm:inline-flex"><Sparkles /> Ask AI</Button>
        <Button variant="ai" size="icon-sm" onClick={() => setAsk(true)} className="sm:hidden" aria-label="Ask AI"><Sparkles /></Button>
        <NotificationsPopover />
        <Link to="/inbox" className="relative rounded-lg p-2 text-muted hover:bg-canvas hover:text-fg" aria-label={`Inbox, ${inboxCount} open`}>
          <Inbox className="size-[18px]" />
          {inboxCount > 0 && <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">{inboxCount}</span>}
        </Link>
        <Menu>
          <MenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-lg p-1 hover:bg-canvas" aria-label="Account menu">
              <Avatar name={persona.name} size={30} />
              <span className="hidden text-left leading-tight xl:block">
                <span className="block text-[13px] font-medium text-fg">{persona.name}</span>
                <span className="block max-w-[180px] truncate text-[11px] text-muted">{persona.title}</span>
              </span>
            </button>
          </MenuTrigger>
          <MenuContent>
            <MenuLabel>{persona.name}</MenuLabel>
            <MenuItem asChild><Link to="/requests"><UserRound /> My profile & requests</Link></MenuItem>
            <MenuItem asChild><Link to="/knowledge"><HelpCircle /> Help & how-to</Link></MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={() => setPersonaPicker(true)}><Sparkles /> Switch persona (prototype)</MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </header>
  );
}
