import type { AttendanceStatus, ExcusedReason } from "@/data/types";

export const REG_LABELS = {
  en: {
    P: "Present", A: "Absent", L: "Late", E: "Excused", unmarked: "Not marked",
    notMarked: (n: number) => `${n} not marked yet`, allMarked: "Everyone is marked", markRest: (n: number) => `Mark remaining ${n} as present`,
    submit: "Submit register", submitOffline: "Save on device", reason: "Reason", minutes: "Minutes late",
    readOnly: "Submitted", requestCorrection: "Request correction", correctionReason: "Why is this change needed?", send: "Send", cancel: "Cancel",
    corrections: "Corrections", pending: "Pending approval", approved: "Approved", rejected: "Rejected", original: "Original",
    pendingSync: "Saved on this device · waiting to sync", noDefault: "Every pupil must be marked. Nobody is marked present automatically.",
    reasons: { Illness: "Illness", Family: "Family", "School activity": "School activity", Transport: "Transport", Other: "Other" } as Record<ExcusedReason, string>,
  },
  ar: {
    P: "حاضر", A: "غائب", L: "متأخر", E: "معذور", unmarked: "غير مسجّل",
    notMarked: (n: number) => `${n} لم يتم تسجيلهم بعد`, allMarked: "تم تسجيل الجميع", markRest: (n: number) => `تسجيل الـ${n} المتبقين كحاضرين`,
    submit: "إرسال السجل", submitOffline: "حفظ على الجهاز", reason: "السبب", minutes: "دقائق التأخير",
    readOnly: "تم الإرسال", requestCorrection: "طلب تصحيح", correctionReason: "لماذا هذا التعديل مطلوب؟", send: "إرسال", cancel: "إلغاء",
    corrections: "التصحيحات", pending: "بانتظار الموافقة", approved: "تمت الموافقة", rejected: "مرفوض", original: "الأصل",
    pendingSync: "محفوظ على هذا الجهاز · بانتظار المزامنة", noDefault: "يجب تسجيل كل تلميذ. لا يتم تسجيل أي أحد كحاضر تلقائيًا.",
    reasons: { Illness: "مرض", Family: "ظرف عائلي", "School activity": "نشاط مدرسي", Transport: "مواصلات", Other: "آخر" } as Record<ExcusedReason, string>,
  },
};

export type RegLabels = (typeof REG_LABELS)["en"];

export const STATUS_STYLE: Record<AttendanceStatus, { on: string; dot: string }> = {
  P: { on: "bg-emerald-600 text-white border-emerald-600", dot: "bg-emerald-500" },
  A: { on: "bg-red-600 text-white border-red-600", dot: "bg-red-500" },
  L: { on: "bg-amber-500 text-white border-amber-500", dot: "bg-amber-500" },
  E: { on: "bg-sky-600 text-white border-sky-600", dot: "bg-sky-500" },
};

export const REASONS: ExcusedReason[] = ["Illness", "Family", "School activity", "Transport", "Other"];
