import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SessionTracker, SegmentBar } from "@/components/assessment/SessionTracker";
import { StatusBadge } from "@/components/common/StatusBadge";
import { LangToggle, useTeacherT } from "@/i18n/teacher";
import { useData, usePersona } from "@/store/hooks";
import { subjectNamer } from "@/lib/names";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const T = {
  en: { title: "Pupil assessments", sub: "Annual pre- and post-assessments for your classes. Track who has submitted and reconcile before closing.", none: "No assessments for your classes yet." },
  ar: { title: "تقييمات التلاميذ", sub: "التقييمات القبلية والبعدية السنوية لصفوفك. تابع من أرسل وقم بالمطابقة قبل الإغلاق.", none: "لا توجد تقييمات لصفوفك بعد." },
};

export function ClassAssessments({ base }: { base: string }) {
  const { t, lang, dir } = useTeacherT();
  const d = useData();
  const persona = usePersona();
  const ids = persona.scope.classIds ?? [];
  const sessions = d.assessmentSessions.filter((s) => s.classId && ids.includes(s.classId)).sort((a, b) => (a.status === "Live" ? -1 : b.status === "Live" ? 1 : b.date.localeCompare(a.date)));
  const [sel, setSel] = useState(sessions[0]?.id);
  const L = T[lang];
  const nameFor = subjectNamer(d, { lang });
  return (
    <div dir={base === "/tf" ? dir : undefined} lang={base === "/tf" ? lang : undefined} className="space-y-5">
      {base === "/tf" && <div className="flex justify-end"><LangToggle /></div>}
      <div><h1 className="text-[24px] font-semibold">{L.title}</h1><p className="mt-1 text-[14px] text-muted">{L.sub}</p></div>
      {sessions.length === 0 ? <Card className="p-8 text-center text-muted">{L.none}</Card> : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {sessions.map((s) => {
              const c = d.classes.find((x) => x.id === s.classId)!;
              return (
                <button key={s.id} onClick={() => setSel(s.id)} className={cn("rounded-xl border bg-surface p-4 text-start shadow-card", sel === s.id ? "border-su ring-1 ring-su/30" : "border-line hover:border-line-strong")}>
                  <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 font-semibold"><ClipboardCheck className="size-4 text-su" />{t("grade")} {"⁦"}{c.grade}-{c.section}{"⁩"}</span><StatusBadge status={s.status} /></div>
                  <p className="mt-1 text-[13px] text-muted">{s.title} · {formatDate(s.date)}</p>
                  <div className="mt-3"><SegmentBar entries={s.entries} /></div>
                </button>
              );
            })}
          </div>
          {sel && <SessionTracker key={sel} sessionId={sel} nameFor={nameFor} />}
        </>
      )}
    </div>
  );
}
