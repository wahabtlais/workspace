import { useDemo } from "@/store/demoStore";

/** Arabic / RTL is supported only in school-teacher-related experiences. English is the platform default. */
const DICT = {
  en: {
    today: "Today", myClasses: "My classes", assessments: "Assessments", help: "Help",
    hello: "Good morning", todayClasses: "Today’s classes", takeRegister: "Take register", viewRegister: "View register",
    registerDue: "Register due", registerDone: "Register submitted", pendingSync: "Waiting to sync", notScheduled: "No class today",
    pupils: "pupils", grade: "Grade", period: "Period", attendanceThisTerm: "Attendance this term", missingRegisters: "Missing registers",
    liveAssessment: "Live assessment", openTracker: "Open tracker", recentRegisters: "Recent registers", ownClassesOnly: "You can see your own classes only.",
    language: "Language", offlineNote: "You’re offline. Registers are saved on this device and sync automatically.",
    present: "Present", absent: "Absent", late: "Late", excused: "Excused", unmarked: "Not marked",
    teacherPortal: "Class Teacher", school: "School",
  },
  ar: {
    today: "اليوم", myClasses: "صفوفي", assessments: "التقييمات", help: "مساعدة",
    hello: "صباح الخير", todayClasses: "حصص اليوم", takeRegister: "تسجيل الحضور", viewRegister: "عرض السجل",
    registerDue: "السجل مطلوب", registerDone: "تم إرسال السجل", pendingSync: "بانتظار المزامنة", notScheduled: "لا توجد حصة اليوم",
    pupils: "تلميذ", grade: "الصف", period: "الحصة", attendanceThisTerm: "الحضور هذا الفصل", missingRegisters: "سجلات ناقصة",
    liveAssessment: "تقييم جارٍ", openTracker: "فتح المتابعة", recentRegisters: "السجلات الأخيرة", ownClassesOnly: "يمكنك رؤية صفوفك فقط.",
    language: "اللغة", offlineNote: "أنت غير متصل. تُحفظ السجلات على هذا الجهاز وتتم مزامنتها تلقائيًا.",
    present: "حاضر", absent: "غائب", late: "متأخر", excused: "معذور", unmarked: "غير مسجّل",
    teacherPortal: "بوابة المعلم", school: "المدرسة",
  },
} as const;

export type TeacherKey = keyof (typeof DICT)["en"];

export function useTeacherT() {
  const lang = useDemo((s) => s.lang);
  const t = (k: TeacherKey) => DICT[lang][k];
  return { t, lang, dir: lang === "ar" ? ("rtl" as const) : ("ltr" as const) };
}

export function LangToggle({ dark }: { dark?: boolean }) {
  const lang = useDemo((s) => s.lang);
  const setLang = useDemo((s) => s.setLang);
  const base = dark ? "text-white/70 hover:text-white" : "text-muted hover:text-fg";
  return (
    <div role="group" aria-label="Language" className={`inline-flex items-center rounded-lg border p-0.5 text-[12px] ${dark ? "border-white/15" : "border-line"}`}>
      {(["en", "ar"] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} lang={l}
          className={`rounded-md px-2 py-1 font-medium ${lang === l ? (dark ? "bg-white/15 text-white" : "bg-brand-50 text-brand-700") : base}`}>
          {l === "en" ? "English" : "العربية"}
        </button>
      ))}
    </div>
  );
}
