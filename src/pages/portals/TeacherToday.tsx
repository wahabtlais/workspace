import { Link } from "react-router";
import { CalendarCheck, ClipboardCheck, CloudOff, Lock, Users } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { LangToggle, useTeacherT } from "@/i18n/teacher";
import { useDemo } from "@/store/demoStore";
import { useData, usePersona } from "@/store/hooks";
import { attendanceRate, sessionProgress } from "@/lib/metrics";
import { weekday } from "@/data/seed/su";
import { DEMO_TODAY, formatDate } from "@/lib/utils";
import { ClassCurriculum } from "@/components/classes/ClassCurriculum";

/** Today view for anyone who teaches classes: school-employed class teachers and deployed TFs. Bilingual EN / AR. */
export function TodayClasses({ basePath, showLang }: { basePath: string; showLang?: boolean }) {
  const { t, lang, dir } = useTeacherT();
  const persona = usePersona();
  const d = useData();
  const offline = useDemo((s) => s.offline);
  const classIds = persona.scope.classIds ?? [];
  const myClasses = d.classes.filter((c) => classIds.includes(c.id));
  const school = d.schools.find((s) => s.id === persona.scope.schoolIds?.[0]);
  const dow = weekday(DEMO_TODAY);
  const name = (c: (typeof myClasses)[number]) => `${t("grade")} ⁦${c.grade}-${c.section}⁩`;
  const live = d.assessmentSessions.filter((s) => s.classId && classIds.includes(s.classId) && (s.status === "Live" || s.status === "Reconciling"));

  return (
    <div className="space-y-5" dir={showLang ? dir : undefined} lang={showLang ? lang : undefined}>
      {showLang && <div className="flex justify-end"><LangToggle /></div>}
      <div>
        <h1 className="text-[24px] font-semibold">{t("hello")}, {persona.name.split(" ")[0]}</h1>
        <p className="mt-1 text-[14px] text-muted">
          {formatDate(DEMO_TODAY, { weekday: "long", day: "numeric", month: "long" })} · {lang === "ar" ? school?.nameAr : school?.name}
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-canvas px-2 py-1 text-[12px] text-muted"><Lock className="size-3.5" /> {t("ownClassesOnly")}</p>
      </div>
      {offline && <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900"><CloudOff className="size-4" /> {t("offlineNote")}</div>}

      <section>
        <h2 className="mb-3 text-[15px] font-semibold">{t("todayClasses")}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {myClasses.map((c) => {
            const meetsToday = c.days.includes(dow);
            const reg = d.registers.find((r) => r.kind === "pupil" && r.contextId === c.id && r.date === DEMO_TODAY);
            const status = !meetsToday ? "none" : !reg || reg.status === "missing" || reg.status === "draft" ? "due" : reg.status === "pending_sync" ? "sync" : "done";
            return (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[17px] font-semibold">{name(c)}</p>
                    <p className="text-[13px] text-muted">{c.period} · {c.pupilIds.length} {t("pupils")}</p>
                  </div>
                  {status === "due" && <Badge tone="warning" dot>{t("registerDue")}</Badge>}
                  {status === "done" && <Badge tone="success" dot>{t("registerDone")}</Badge>}
                  {status === "sync" && <Badge tone="warning" dot>{t("pendingSync")}</Badge>}
                  {status === "none" && <Badge tone="neutral">{t("notScheduled")}</Badge>}
                </div>
                {meetsToday && (
                  <Button asChild size="lg" className="mt-4 w-full" variant={status === "due" ? "primary" : "secondary"}>
                    <Link to={`${basePath}/classes/${c.id}/register`}><CalendarCheck /> {status === "due" ? t("takeRegister") : t("viewRegister")}</Link>
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {live.length > 0 && (
        <Card>
          <CardHeader icon={<ClipboardCheck />} title={t("liveAssessment")} />
          <CardBody className="space-y-3">
            {live.map((s) => {
              const c = d.classes.find((x) => x.id === s.classId)!;
              const p = sessionProgress(s.entries);
              return (
                <div key={s.id} className="rounded-lg border border-line p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{name(c)} · {s.title}</p>
                    <Button asChild size="sm" variant="secondary"><Link to={`${basePath}/assessments`}>{t("openTracker")}</Link></Button>
                  </div>
                  <Progress value={(p.submitted / s.entries.length) * 100} className="mt-3" tone="success" />
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
                    <span>✓ {p.submitted}/{s.entries.length}</span><span>⏳ {p.in_progress}</span><span>○ {p.not_started}</span>
                    <span className="text-amber-700">⇅ {p.pending_sync}</span><span className="text-red-700">✕ {p.failed}</span>
                  </p>
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}

      {myClasses.length > 0 && <ClassCurriculum grades={[...new Set(myClasses.map((c) => c.grade))]} lang={lang} />}

      <Card>
        <CardHeader icon={<Users />} title={t("attendanceThisTerm")} />
        <CardBody className="grid gap-3 sm:grid-cols-2">
          {myClasses.map((c) => {
            const regs = d.registers.filter((r) => r.kind === "pupil" && r.contextId === c.id);
            const rate = attendanceRate(regs);
            const missing = regs.filter((r) => r.status === "missing").length;
            return (
              <div key={c.id} className="rounded-lg bg-canvas p-3">
                <div className="flex items-center justify-between"><span className="font-medium">{name(c)}</span><span className="tabular text-[18px] font-semibold">{rate}%</span></div>
                <Progress value={rate} className="mt-2" />
                <p className="mt-2 text-[12px] text-muted">{t("missingRegisters")}: {missing}</p>
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}

export default function TeacherToday() {
  return <TodayClasses basePath="/teacher" />;
}
