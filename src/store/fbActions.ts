import type { Applicant, Milestone, Placement } from "@/data/types";
import { getPersona } from "@/config/personas";
import { DEMO_TODAY, uid } from "@/lib/utils";
import { nowIso, useDemo } from "./demoStore";
import { toast } from "./uiStore";

const S = () => useDemo.getState();
const actor = () => getPersona(S().personaId).name;

export function moveApplicant(id: string, stage: Applicant["stage"]) {
  S().update((d) => { const a = d.applicants.find((x) => x.id === id); if (a) a.stage = stage; });
}

/** Admitting creates a student record that stays inactive until a guardian consents. */
export function admitApplicant(id: string) {
  const a = S().data.applicants.find((x) => x.id === id);
  if (!a) return;
  const sid = uid("fbs");
  S().update((d) => {
    const ap = d.applicants.find((x) => x.id === id)!;
    ap.stage = "Admitted";
    d.students.push({
      id: sid, name: a.name, firstName: a.name.split(" ")[0], age: a.age, cohortId: "fbc-3", pathway: a.pathwayPref, status: "Pending consent",
      guardianName: a.guardianName, consent: { participation: false, dataProcessing: false, media: false, portfolioSharing: false, internshipSharing: false, aiAssistant: false },
      readiness: 0, competencies: {},
    });
  });
  S().addInbox({ toRole: "fb_po", kind: "task", title: `Collect guardian consent: ${a.name}`, detail: "Account activates only after required consents", link: `/future-builders/students/${sid}`, source: "Consent rule" });
  S().logActivity({ actor: actor(), text: `admitted ${a.name} to Future Builders 2027–28`, area: "Future Builders" });
  toast({ tone: "success", title: `${a.name} admitted`, body: "Admission letter generated. The account stays inactive until a guardian gives consent." });
}

export function recordConsent(studentId: string) {
  S().update((d) => {
    const s = d.students.find((x) => x.id === studentId);
    if (!s) return;
    s.consent = { participation: true, dataProcessing: true, media: false, portfolioSharing: true, internshipSharing: true, aiAssistant: true };
    s.status = "Active";
    d.inbox.forEach((i) => { if (i.link === `/future-builders/students/${studentId}` && i.title.startsWith("Collect guardian consent")) i.status = "done"; });
  });
  const s = S().data.students.find((x) => x.id === studentId);
  toast({ tone: "success", title: "Guardian consent recorded", body: `${s?.firstName}’s account is now active. Media consent was not given and stays off.` });
}

export function decideMilestone(projectId: string, msId: string, status: Milestone["status"], feedback?: string) {
  S().update((d) => {
    const m = d.projects.find((p) => p.id === projectId)?.milestones.find((x) => x.id === msId);
    if (!m) return;
    m.status = status;
    if (feedback) m.feedback = feedback;
    const next = d.projects.find((p) => p.id === projectId)!.milestones.find((x) => x.status === "Not started");
    if (status === "Approved" && next) next.status = "In progress";
  });
  const p = S().data.projects.find((x) => x.id === projectId)!;
  if (status === "Approved") {
    S().notify({ toPersona: "p-student", text: `Milestone approved by the client: ${p.title}`, link: "/student/team", tone: "success" });
    S().notify({ toRole: "fb_trainer", text: `Client approved a milestone on ${p.title}. Portfolio evidence suggested for the team.`, link: "/future-builders/projects", tone: "success" });
  }
  toast({ tone: status === "Approved" ? "success" : "warning", title: status === "Approved" ? "Milestone approved" : "Changes requested", body: status === "Approved" ? "Project progress updated; students can add it to their portfolios." : "The team was notified with your feedback." });
}

/** Sharing a candidate with a host requires student + guardian internship-sharing consent and a passed host safeguarding check. */
export function shareWithHost(placementId: string) {
  const d = S().data;
  const pl = d.placements.find((x) => x.id === placementId)!;
  const st = d.students.find((x) => x.id === pl.studentId)!;
  const host = d.organizations.find((o) => o.id === d.openings.find((x) => x.id === pl.openingId)?.hostId);
  if (!st.consent.internshipSharing || !st.consent.portfolioSharing) { toast({ tone: "danger", title: "Blocked: consent missing", body: `${st.firstName}’s guardian has not consented to sharing with hosts.` }); return; }
  if (host?.safeguardingCheck !== "Passed") { toast({ tone: "danger", title: "Blocked: host check incomplete", body: `${host?.name} has not passed the safeguarding check.` }); return; }
  S().update((x) => { x.placements.find((y) => y.id === placementId)!.stage = "Shared with host"; });
  if (host.id === "org-ho-1") S().addInbox({ toPersona: "p-host", kind: "review", title: `New candidate shared: ${st.firstName}`, detail: "Consented portfolio · Junior front-end intern", link: "/partner/candidates", source: "Future Builders" });
  toast({ tone: "success", title: "Shared with host", body: "Only consented portfolio items and first name are visible to the host." });
}

export function advancePlacement(placementId: string, stage: Placement["stage"]) {
  S().update((d) => { const p = d.placements.find((x) => x.id === placementId); if (p) p.stage = stage; });
  if (stage === "Placed") {
    const pl = S().data.placements.find((x) => x.id === placementId)!;
    if (pl.studentId === "fbs-01") S().notify({ toPersona: "p-student", text: "Your internship placement is confirmed!", link: "/student/career", tone: "success" });
    toast({ tone: "success", title: "Placement confirmed", body: "The student profile, host view and placement indicator were updated." });
  }
}

export function addShortlist(openingId: string, studentId: string) {
  S().update((d) => { d.placements.push({ id: uid("pl"), openingId, studentId, stage: "Shortlisted", checkIns: [] }); });
  toast({ tone: "success", title: "Added to shortlist" });
}

export const TODAY = DEMO_TODAY;
export const now = nowIso;
