import { Link, useParams } from "react-router";
import { ArrowLeft, ArrowRight, CalendarCheck, Lock } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { RegisterSheet } from "@/components/attendance/RegisterSheet";
import { ClassHistory } from "@/components/classes/ClassHistory";
import { LangToggle, useTeacherT } from "@/i18n/teacher";
import { useData, usePersona } from "@/store/hooks";
import { attendanceRate } from "@/lib/metrics";
import { pupilName } from "@/lib/names";
import { DEMO_TODAY, formatDate } from "@/lib/utils";
import { weekday } from "@/data/seed/su";

const T = {
  en: { back: "Back to my classes", notToday: "This class has no lesson today. Registers can only be taken for scheduled lessons.", denied: "This class isn’t yours. Teachers can open their own classes only.", register: "Register", today: "Today", openClass: "Open class" },
  ar: { back: "العودة إلى صفوفي", notToday: "لا توجد حصة لهذا الصف اليوم. يمكن تسجيل الحضور للحصص المجدولة فقط.", denied: "هذا الصف ليس صفك. يمكن للمعلمين فتح صفوفهم فقط.", register: "سجل الحضور", today: "اليوم", openClass: "فتح الصف" },
};

function useMyClass(base: string) {
  const { id } = useParams();
  const persona = usePersona();
  const d = useData();
  const mine = (persona.scope.classIds ?? []).includes(id ?? "");
  return { c: mine ? d.classes.find((x) => x.id === id) : undefined, base };
}

/** Wraps TF-portal class pages with their own language toggle and direction (teacher-related pages only). */
function Bilingual({ wrap, children }: { wrap: boolean; children: React.ReactNode }) {
  const { dir, lang } = useTeacherT();
  if (!wrap) return <>{children}</>;
  return <div dir={dir} lang={lang} className="space-y-5"><div className="flex justify-end"><LangToggle /></div>{children}</div>;
}

export function MyClasses({ base }: { base: string }) {
  const { t } = useTeacherT();
  const persona = usePersona();
  const d = useData();
  const classes = d.classes.filter((c) => (persona.scope.classIds ?? []).includes(c.id));
  return (
    <Bilingual wrap={base === "/tf"}>
      <h1 className="text-[24px] font-semibold">{t("myClasses")}</h1>
      <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-muted"><Lock className="size-3.5" /> {t("ownClassesOnly")}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {classes.map((c) => {
          const rate = attendanceRate(d.registers.filter((r) => r.kind === "pupil" && r.contextId === c.id));
          return (
            <Link key={c.id} to={`${base}/classes/${c.id}`}>
              <Card className="p-4 transition hover:border-su/40">
                <div className="flex items-center justify-between"><p className="text-[17px] font-semibold">{t("grade")} {"⁦"}{c.grade}-{c.section}{"⁩"}</p><ArrowRight className="size-4 text-muted rtl:rotate-180" /></div>
                <p className="text-[13px] text-muted">{c.period} · {c.pupilIds.length} {t("pupils")}</p>
                <div className="mt-3 flex items-center gap-2 text-[13px]"><Progress value={rate} className="flex-1" /><span className="tabular">{rate}%</span></div>
                <p className="mt-1 text-[11px] text-subtle">{t("attendanceThisTerm")}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </Bilingual>
  );
}

export function MyClassDetail({ base }: { base: string }) {
  const { c } = useMyClass(base);
  const { t, lang } = useTeacherT();
  const L = T[lang];
  if (!c) return <Card className="p-8 text-center"><Lock className="mx-auto size-6 text-muted" /><p className="mt-3">{L.denied}</p></Card>;
  const today = c.days.includes(weekday(DEMO_TODAY));
  return (
    <Bilingual wrap={base === "/tf"}>
      <Link to={`${base}/classes`} className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-fg"><ArrowLeft className="size-4 rtl:rotate-180" />{L.back}</Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-[24px] font-semibold">{t("grade")} {"⁦"}{c.grade}-{c.section}{"⁩"}</h1><p className="text-[13px] text-muted">{c.period} · {c.pupilIds.length} {t("pupils")}</p></div>
        {today && <Button asChild size="lg"><Link to={`${base}/classes/${c.id}/register`}><CalendarCheck /> {t("takeRegister")}</Link></Button>}
      </div>
      <ClassHistory cls={c} lang={lang} />
    </Bilingual>
  );
}

export function TakeRegister({ base }: { base: string }) {
  const { c } = useMyClass(base);
  const { t, lang } = useTeacherT();
  const d = useData();
  const L = T[lang];
  if (!c) return <Card className="p-8 text-center"><Lock className="mx-auto size-6 text-muted" /><p className="mt-3">{L.denied}</p></Card>;
  const today = c.days.includes(weekday(DEMO_TODAY));
  return (
    <Bilingual wrap={base === "/tf"}>
      <Link to={`${base}/classes/${c.id}`} className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-fg"><ArrowLeft className="size-4 rtl:rotate-180" />{t("grade")} {"⁦"}{c.grade}-{c.section}{"⁩"}</Link>
      <div><h1 className="text-[24px] font-semibold">{L.register} · {t("grade")} {"⁦"}{c.grade}-{c.section}{"⁩"}</h1><p className="text-[13px] text-muted">{L.today} · {formatDate(DEMO_TODAY, { weekday: "long", day: "numeric", month: "long" })} · {c.period}</p></div>
      {today ? (
        <RegisterSheet kind="pupil" contextId={c.id} date={DEMO_TODAY} lang={lang} label={`Grade ${c.grade}-${c.section} register`}
          attendees={c.pupilIds.map((id) => { const p = d.pupils.find((x) => x.id === id)!; return { id, name: pupilName(p, lang), sub: p.code }; })} />
      ) : <Card><CardBody className="pt-5 text-[14px] text-muted">{L.notToday}</CardBody></Card>}
    </Bilingual>
  );
}
