import { Lock } from "lucide-react";
import { usePersona } from "@/store/hooks";
import { useUI } from "@/store/uiStore";
import { Button } from "@/components/ui/button";

export function AccessDenied({ area, reason }: { area: string; reason?: string }) {
  const persona = usePersona();
  const setPicker = useUI((s) => s.setPersonaPicker);
  return (
    <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-600"><Lock className="size-5" /></div>
      <h2 className="text-lg font-semibold">You don’t have access to {area}</h2>
      <p className="mt-2 text-[14px] text-muted">
        {reason ?? <>As <strong className="text-fg">{persona.title}</strong>, this area isn’t part of your role. Access is granted by role, scope and data class, and is denied by default.</>}
      </p>
      <p className="mt-3 text-[12px] text-subtle">Prototype: switch persona to see what other roles can open.</p>
      <Button variant="secondary" className="mt-5" onClick={() => setPicker(true)}>Switch persona</Button>
    </div>
  );
}
