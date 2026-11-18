import { DEMO_TODAY, addDays, uid } from "@/lib/utils";
import { useDemo } from "@/store/demoStore";
import { createRequest } from "@/store/opsActions";
import { getPersona } from "@/config/personas";

const S = () => useDemo.getState();
const me = () => getPersona(S().personaId);

/** Proposed actions an agent can carry out after the user confirms. Each returns a confirmation sentence. */
export const AI_ACTIONS = {
  laptopRequest: () => { createRequest("Equipment", "Laptop for the new trainer", "Prepared by Ask CodeBrave from a sentence and confirmed by the requester.", 950); return "Equipment request submitted to your line manager."; },
  planVisits: (schoolIds: string[]) => {
    S().update((d) => schoolIds.forEach((sid, i) => { const s = d.schools.find((x) => x.id === sid)!; d.visits.push({ id: uid("vis"), schoolId: sid, date: addDays(DEMO_TODAY, 2 + i), officerId: s.poId, tfId: d.tfs.find((t) => t.schoolId === sid)?.id, purpose: "Classroom observation", status: "Planned" }); }));
    return `${schoolIds.length} visit${schoolIds.length === 1 ? "" : "s"} added to the visit planner and calendars.`;
  },
  visitReport: (schoolName: string) => {
    S().update((d) => {
      d.documents.unshift({ id: uid("dc"), title: `Visit report (draft): ${schoolName}, ${DEMO_TODAY}`, type: "Google Doc", context: `Visit · ${schoolName}`, ownerId: me().staffId ?? "s-omar", updatedAt: DEMO_TODAY, access: "Inherits from the visit" });
      const v = d.visits.filter((x) => d.schools.find((s) => s.id === x.schoolId)?.name === schoolName && x.status === "Completed").sort((a, b) => b.date.localeCompare(a.date))[0];
      if (v) v.status = "Report drafted";
    });
    return "Draft visit report saved to Documents and linked to the visit. Review it before approval.";
  },
  coachingPlan: (tfId?: string) => {
    const d = S().data;
    const v = d.visits.filter((x) => x.score !== undefined && (!tfId || x.tfId === tfId)).sort((a, b) => (a.score ?? 4) - (b.score ?? 4))[0];
    const tf = d.tfs.find((t) => t.id === v?.tfId);
    S().update((x) => { x.followUps.unshift({ id: uid("fu"), title: `Coaching plan: ${tf?.name ?? "Teaching Fellow"} (AI draft)`, program: "SU", schoolId: v?.schoolId, tfId: tf?.id, ownerId: v?.officerId ?? "s-omar", due: addDays(DEMO_TODAY, 7), status: "Open", source: "Drafted by the Program Delivery Agent", createdAt: DEMO_TODAY }); });
    return `Coaching plan for ${tf?.name ?? "the Teaching Fellow"} added to Follow-ups & coaching.`;
  },
  checkIn: (studentIds: string[]) => {
    S().update((d) => studentIds.forEach((sid) => { if (!d.followUps.some((f) => f.studentId === sid && f.status !== "Done")) d.followUps.unshift({ id: uid("fu"), title: "Check-in about recent absences", program: "FB", studentId: sid, ownerId: "s-hala", due: addDays(DEMO_TODAY, 2), status: "Open", source: "Suggested by the Program Delivery Agent", createdAt: DEMO_TODAY }); }));
    S().addInbox({ toRole: "fb_po", kind: "task", title: `Check in with ${studentIds.length} student${studentIds.length === 1 ? "" : "s"}`, detail: "Drafted message ready · suggested by Ask CodeBrave", link: "/future-builders/attendance", source: "Ask CodeBrave" });
    return "Check-in tasks created for the Project Officer, with a draft message.";
  },
  eligibility: (oppId: string) => {
    S().update((d) => { const o = d.opportunities.find((x) => x.id === oppId); if (!o) return; o.eligibility = [{ item: "Registered non-profit for 3+ years", met: true }, { item: "Program fits the call’s focus", met: true }, { item: "Works with the target age group", met: true }, { item: "Audited accounts for last 2 years", met: true }, { item: "Co-funding requirement can be met", met: null }]; o.fit = 81; if (o.stage === "Identified") o.stage = "Qualifying"; });
    return "Eligibility checklist pre-filled on the opportunity (4 of 5 met). A person decides go / no-go.";
  },
  draftDoc: (title: string, context: string) => {
    S().update((d) => { d.documents.unshift({ id: uid("dc"), title: `${title} (AI draft)`, type: "Google Doc", context, ownerId: me().staffId ?? "s-rana", updatedAt: DEMO_TODAY, access: "Private draft until shared" }); });
    return `“${title}” saved as a draft in Knowledge › Documents. Every figure cites its indicator.`;
  },
  draftLesson: () => {
    const cur = S().data.curricula.find((c) => c.id === "cur-career")!;
    const v = cur.versions[cur.versions.length - 1];
    if (v.status !== "draft") return "The latest Career Readiness version is not a draft; create a new draft first.";
    S().update((d) => { d.curricula.find((c) => c.id === "cur-career")!.versions.find((x) => x.id === v.id)!.modules[0].lessons.push({ id: uid("les"), title: "Professional email writing", minutes: 60, objectiveIds: ["obj-fb-9"], aiDrafted: true, plan: { objectives: "Learners can write a clear, polite professional email.", activities: ["Warm-up: spot the problems in a bad email (10 min)", "Model and template (15 min)", "Pairs write and swap feedback (25 min)", "Share & reflect (10 min)"], materials: "Slides, email template, devices", differentiation: "Sentence starters for learners who need support", assessment: "Exit ticket: write a 3-sentence email to a client" } }); });
    return "Lesson “Professional email writing” added to Career Readiness Essentials (draft). Review it before sending for review.";
  },
};
