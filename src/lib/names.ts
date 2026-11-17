import type { DemoData, Pupil } from "@/data/types";

export function pupilName(p: Pupil, lang: "en" | "ar" = "en") {
  return lang === "ar" ? `${p.firstNameAr} ${p.initialAr}.` : `${p.firstName} ${p.initial}.`;
}

/** Resolves any assessment/attendance subject id to a display name. */
export function subjectNamer(d: DemoData, opts: { lang?: "en" | "ar"; pupilsAsCodes?: boolean } = {}) {
  const pupils = new Map(d.pupils.map((p) => [p.id, p]));
  const tfs = new Map(d.tfs.map((t) => [t.id, t]));
  const students = new Map(d.students.map((s) => [s.id, s]));
  return (id: string) => {
    const p = pupils.get(id);
    if (p) return opts.pupilsAsCodes ? p.code : pupilName(p, opts.lang);
    const t = tfs.get(id);
    if (t) return opts.lang === "ar" ? t.nameAr : t.name;
    return students.get(id)?.name ?? id;
  };
}

export function sessionContext(d: DemoData, s: { classId?: string; schoolId?: string; cohortId?: string }) {
  if (s.classId) {
    const c = d.classes.find((x) => x.id === s.classId);
    const sch = d.schools.find((x) => x.id === s.schoolId);
    return `${sch?.name ?? ""} · Grade ${c?.grade}-${c?.section}`;
  }
  return d.tfCohorts.find((c) => c.id === s.cohortId)?.name ?? d.fbCohorts.find((c) => c.id === s.cohortId)?.name ?? "";
}
