import { useNavigate } from "react-router";
import { Check, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/overlay";
import { Avatar } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { personas, SURFACE_HOME, SURFACE_LABEL } from "@/config/personas";
import type { Persona, Surface } from "@/data/types";
import { useDemo } from "@/store/demoStore";
import { useUI, toast } from "@/store/uiStore";
import { cn } from "@/lib/utils";

const GROUPS: { surface: Surface; blurb: string }[] = [
  { surface: "staff", blurb: "Employees: navigation and data depend on role" },
  { surface: "teacher", blurb: "Restricted register & assessment access for their own classes" },
  { surface: "tf", blurb: "Teaching Fellows in training or deployed to schools" },
  { surface: "student", blurb: "Future Builders students (15–18)" },
  { surface: "partner", blurb: "Invite-only: clients, internship hosts, donors" },
];

export function PersonaSwitcher() {
  const open = useUI((s) => s.personaPickerOpen);
  const setOpen = useUI((s) => s.setPersonaPicker);
  const personaId = useDemo((s) => s.personaId);
  const setPersona = useDemo((s) => s.setPersona);
  const navigate = useNavigate();

  const choose = (p: Persona) => {
    setPersona(p.id);
    setOpen(false);
    navigate(SURFACE_HOME[p.surface]);
    toast({ tone: "info", title: `Now viewing as ${p.name}`, body: `${p.title} · ${SURFACE_LABEL[p.surface]}` });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent wide title="Switch persona" description="Prototype only. See the platform through each person’s eyes: navigation, records, fields and restricted areas change with the role.">
        <div className="space-y-6">
          {GROUPS.map((g) => (
            <section key={g.surface}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted">{SURFACE_LABEL[g.surface]}</h3>
                <span className="text-[12px] text-subtle">{g.blurb}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {personas.filter((p) => p.surface === g.surface).map((p) => {
                  const active = p.id === personaId;
                  return (
                    <button key={p.id} onClick={() => choose(p)}
                      className={cn("group flex items-start gap-3 rounded-xl border p-3 text-left transition", active ? "border-brand-400 bg-brand-50/60 ring-1 ring-brand-200" : "border-line hover:border-brand-200 hover:bg-canvas")}>
                      <Avatar name={p.name} size={36} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-medium text-fg">{p.name}</span>
                          {p.bilingual && <Badge tone="outline" className="px-1.5 py-0 text-[10px]">EN · ع</Badge>}
                          {active && <Check className="ml-auto size-4 text-brand-600" />}
                        </div>
                        <p className="truncate text-[12px] text-muted">{p.title}</p>
                        <p className="mt-1 line-clamp-2 text-[12px] text-subtle"><Sparkles className="mr-1 inline size-3 text-ai-500" />{p.demoMoment}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
