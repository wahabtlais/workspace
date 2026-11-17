import { CheckCircle2, Info, Sparkles, TriangleAlert, X, XCircle } from "lucide-react";
import { useUI } from "@/store/uiStore";
import { cn } from "@/lib/utils";

const ICON = { info: Info, success: CheckCircle2, warning: TriangleAlert, danger: XCircle, ai: Sparkles };
const COLOR = { info: "text-brand-600", success: "text-emerald-600", warning: "text-amber-600", danger: "text-red-600", ai: "text-ai-600" };

export function Toaster() {
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismiss);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(380px,calc(100vw-32px))] flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICON[t.tone];
        return (
          <div key={t.id} className="pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-pop animate-slide-in-right">
            <Icon className={cn("mt-0.5 size-5 shrink-0", COLOR[t.tone])} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-fg">{t.title}</p>
              {t.body && <p className="mt-0.5 text-[13px] text-muted">{t.body}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="rounded p-0.5 text-subtle hover:text-fg" aria-label="Dismiss"><X className="size-4" /></button>
          </div>
        );
      })}
    </div>
  );
}
