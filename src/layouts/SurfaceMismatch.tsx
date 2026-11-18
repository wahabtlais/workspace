import { useNavigate } from "react-router";
import { DoorClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SURFACE_HOME, SURFACE_LABEL } from "@/config/personas";
import type { Surface } from "@/data/types";
import { usePersona } from "@/store/hooks";
import { useUI } from "@/store/uiStore";

/** Shown when the current persona opens a surface they do not belong to (e.g. a student opening the Staff Workspace). */
export function SurfaceMismatch({ target }: { target: Surface }) {
  const persona = usePersona();
  const navigate = useNavigate();
  const setPicker = useUI((s) => s.setPersonaPicker);
  return (
    <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-600"><DoorClosed className="size-5" /></div>
      <h2 className="text-lg font-semibold">The {SURFACE_LABEL[target]} isn’t available to you</h2>
      <p className="mt-2 text-[14px] text-muted">{persona.name} signs in to the <strong className="text-fg">{SURFACE_LABEL[persona.surface]}</strong>. Each experience is separate, with its own navigation and data boundaries.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button onClick={() => navigate(SURFACE_HOME[persona.surface])}>Go to {SURFACE_LABEL[persona.surface]}</Button>
        <Button variant="secondary" onClick={() => setPicker(true)}>Switch persona</Button>
      </div>
    </div>
  );
}
