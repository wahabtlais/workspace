import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Dialog } from "radix-ui";
import { BookOpen, Building2, FileText, GraduationCap, HandCoins, Search, Send, School, Users } from "lucide-react";
import { canSee } from "@/config/access";
import { useData, usePersona } from "@/store/hooks";
import { useUI } from "@/store/uiStore";
import type { LucideIcon } from "lucide-react";

interface Hit { group: string; label: string; sub: string; to: string; icon: LucideIcon }

export function GlobalSearch() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearch);
  const [q, setQ] = useState("");
  const data = useData();
  const persona = usePersona();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && persona.surface === "staff") { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen, persona.surface]);

  const hits = useMemo<Hit[]>(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    const m = (s: string) => s.toLowerCase().includes(term);
    const out: Hit[] = [];
    if (canSee(persona, "su")) {
      data.schools.filter((s) => m(s.name) || m(s.region)).forEach((s) => out.push({ group: "Schools", label: s.name, sub: `${s.region} · ${s.status}`, to: `/school-upskilling/schools/${s.id}`, icon: School }));
      data.tfs.filter((t) => m(t.name)).forEach((t) => out.push({ group: "Teaching Fellows", label: t.name, sub: `${t.stage}`, to: `/school-upskilling/teaching-fellows/${t.id}`, icon: Users }));
    }
    if (canSee(persona, "fb")) {
      const agg = persona.role === "fundraising" || persona.role === "curriculum";
      if (!agg) data.students.filter((s) => m(s.name)).forEach((s) => out.push({ group: "Students", label: s.name, sub: `Future Builders · ${s.status}`, to: `/future-builders/students/${s.id}`, icon: GraduationCap }));
    }
    if (canSee(persona, "curriculum")) data.curricula.filter((c) => m(c.title)).forEach((c) => out.push({ group: "Curricula", label: c.title, sub: `${c.collection === "SU" ? "School Upskilling" : "Future Builders"} collection`, to: `/curriculum/${c.id}`, icon: BookOpen }));
    if (canSee(persona, "fundraising")) {
      data.grants.filter((g) => m(g.title)).forEach((g) => out.push({ group: "Grants", label: g.title, sub: g.status, to: `/fundraising/grants/${g.id}`, icon: HandCoins }));
      data.organizations.filter((o) => m(o.name)).forEach((o) => out.push({ group: "Organizations", label: o.name, sub: o.type, to: `/fundraising/donors`, icon: Building2 }));
    }
    data.requests.filter((r) => (m(r.title) || m(r.id)) && (canSee(persona, "operations") || r.requesterId === persona.staffId)).forEach((r) => out.push({ group: "Requests", label: r.title, sub: `${r.id} · ${r.status}`, to: canSee(persona, "operations") ? "/operations/requests" : "/requests", icon: Send }));
    data.kb.filter((k) => m(k.title) || m(k.summary)).forEach((k) => out.push({ group: "Knowledge", label: k.title, sub: k.category, to: `/knowledge/${k.id}`, icon: FileText }));
    return out.slice(0, 30);
  }, [q, data, persona]);

  const groups = [...new Set(hits.map((h) => h.group))];
  const go = (to: string) => { setOpen(false); setQ(""); navigate(to); };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-950/40 animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-[10vh] z-50 w-[calc(100vw-32px)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-surface shadow-pop animate-pop-in focus:outline-none">
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          <Dialog.Description className="sr-only">Search records, documents and knowledge you have access to</Dialog.Description>
          <div className="flex items-center gap-3 border-b border-line px-4">
            <Search className="size-4 text-muted" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search schools, people, curricula, grants, knowledge…" className="h-12 flex-1 bg-transparent text-[15px] outline-none" />
          </div>
          <div className="max-h-[55vh] overflow-y-auto p-2 scrollbar-thin">
            {q.trim().length < 2 && <p className="px-3 py-6 text-center text-[13px] text-muted">Search is permission-aware: you only see records your role allows. Pupil records are never searchable.</p>}
            {q.trim().length >= 2 && hits.length === 0 && <p className="px-3 py-6 text-center text-[13px] text-muted">No results you have access to for “{q}”.</p>}
            {groups.map((g) => (
              <div key={g} className="mb-2">
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">{g}</p>
                {hits.filter((h) => h.group === g).map((h) => (
                  <button key={h.to + h.label} onClick={() => go(h.to)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-canvas">
                    <h.icon className="size-4 text-muted" />
                    <span className="min-w-0 flex-1"><span className="block truncate text-[14px] text-fg">{h.label}</span><span className="block truncate text-[12px] text-muted">{h.sub}</span></span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
