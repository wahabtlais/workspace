import { ChevronDown, FlaskConical, RotateCcw, Wifi, WifiOff } from "lucide-react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { SURFACE_LABEL } from "@/config/personas";
import { useDemo } from "@/store/demoStore";
import { usePersona } from "@/store/hooks";
import { useUI } from "@/store/uiStore";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Facilitator controls, visually separated from the product UI. */
export function PrototypeBar() {
  const persona = usePersona();
  const offline = useDemo((s) => s.offline);
  const queue = useDemo((s) => s.syncQueue);
  const setOffline = useDemo((s) => s.setOffline);
  const resetDemo = useDemo((s) => s.resetDemo);
  const setPicker = useUI((s) => s.setPersonaPicker);
  const [confirm, setConfirm] = useState(false);
  const syncing = queue.some((q) => q.status === "syncing");

  return (
    <div className="relative z-40 flex h-10 items-center gap-2 bg-ink-950 px-3 text-[12px] text-white/80 sm:gap-3 sm:px-4">
      <span className="hidden items-center gap-1.5 font-semibold tracking-wide text-accent-400 sm:inline-flex"><FlaskConical className="size-3.5" />PROTOTYPE</span>
      <span className="hidden text-white/50 md:inline">Fictional data · simulated backend & AI</span>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button onClick={() => setPicker(true)} className="inline-flex h-7 max-w-[380px] items-center gap-1.5 whitespace-nowrap rounded-md bg-white/10 px-2.5 hover:bg-white/15" aria-label="Switch persona">
          <span className="hidden text-white/60 sm:inline">Viewing as</span>
          <span className="truncate font-medium text-white">{persona.name}</span>
          <span className="hidden truncate text-white/50 lg:inline">· {SURFACE_LABEL[persona.surface]}</span>
          <ChevronDown className="size-3.5 shrink-0" />
        </button>
        <button onClick={() => setOffline(!offline)} aria-pressed={offline}
          className={cn("inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 font-medium", offline ? "bg-amber-500 text-ink-950 hover:bg-amber-400" : "bg-white/10 hover:bg-white/15")}>
          {offline ? <WifiOff className="size-3.5" /> : <Wifi className="size-3.5" />}
          <span className="hidden sm:inline">{offline ? "Offline" : syncing ? "Syncing…" : "Online"}</span>
          {queue.length > 0 && <span className="rounded bg-ink-950/20 px-1 tabular">{queue.length}</span>}
        </button>
        <button onClick={() => setConfirm(true)} className="inline-flex h-7 items-center gap-1.5 rounded-md bg-white/10 px-2.5 hover:bg-white/15">
          <RotateCcw className="size-3.5" /><span className="hidden sm:inline">Reset demo</span>
        </button>
      </div>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent title="Reset the demo?" description="All changes made in this browser session are discarded and the baseline fictional dataset is restored."
          footer={<><DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose><Button variant="danger" onClick={() => { resetDemo(); setConfirm(false); }}>Reset demo</Button></>}>
          <p className="text-[14px] text-muted">Use this between stakeholder walkthroughs so every session starts from the same state.</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
