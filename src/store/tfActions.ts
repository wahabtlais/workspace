import { DEMO_TODAY } from "@/lib/utils";
import { certificationCriteria, isEligible } from "@/lib/certification";
import { useDemo } from "./demoStore";
import { toast } from "./uiStore";

const S = () => useDemo.getState();
const personaFor = (tfId: string) => (tfId === "tf-15" ? "p-tf" : tfId === "tf-01" ? "p-tf-deployed" : undefined);

export function approveCertification(tfIds: string[]) {
  const d = S().data;
  const ok = tfIds.filter((id) => { const t = d.tfs.find((x) => x.id === id); return t && isEligible(certificationCriteria(d, t)); });
  if (!ok.length) return;
  S().update((x) => {
    ok.forEach((id) => {
      const t = x.tfs.find((y) => y.id === id)!;
      const post = x.assessmentSessions.find((s) => s.id === "as-tf-post")?.entries.find((e) => e.subjectId === id);
      t.stage = "Certified"; t.certifiedAt = DEMO_TODAY; t.postScore = post?.score ?? t.postScore;
    });
    x.inbox.forEach((i) => { if (i.status === "open" && i.toRole === "su_pm" && ok.some((id) => i.ref === id)) i.status = "done"; });
    x.activity.unshift({ id: `ac-cert-${Date.now()}`, at: `${DEMO_TODAY}T12:00:00`, actor: "Maya Saleh", text: `approved certification for ${ok.length} Teaching Fellow${ok.length > 1 ? "s" : ""}`, area: "School Upskilling" });
  });
  ok.forEach((id) => { const p = personaFor(id); if (p) S().notify({ toPersona: p, text: "Congratulations! Your Teaching Fellow certificate is ready.", link: "/tf/certificate", tone: "success" }); });
  toast({ tone: "success", title: `${ok.length} certification${ok.length > 1 ? "s" : ""} approved`, body: "Certificates issued in the TF Portal; the TFs are now available in the deployment planner." });
}

export function deployTF(tfId: string, schoolId: string) {
  const school = S().data.schools.find((s) => s.id === schoolId);
  S().update((x) => { const t = x.tfs.find((y) => y.id === tfId)!; t.stage = "Deployed"; t.schoolId = schoolId; });
  const p = personaFor(tfId);
  if (p) S().notify({ toPersona: p, text: `You are deployed to ${school?.name}. Your Project Officer will share the timetable.`, link: "/tf/deployment", tone: "success" });
  S().notify({ toRole: "su_po", text: `New Teaching Fellow deployed to ${school?.name}`, link: `/school-upskilling/schools/${schoolId}`, tone: "info" });
  toast({ tone: "success", title: "Teaching Fellow deployed", body: `${school?.name}: the school profile, TF profile and TF Portal were updated.` });
}

/** Called when a TF submits an assessment: if every criterion is now met, the PM is asked to certify. */
export function checkReadyForCertification(tfId: string) {
  const d = S().data;
  const t = d.tfs.find((x) => x.id === tfId);
  if (!t || t.stage !== "In training") return;
  if (isEligible(certificationCriteria(d, t)) && !d.inbox.some((i) => i.ref === tfId && i.status === "open")) {
    S().addInbox({ toRole: "su_pm", kind: "approval", title: `Ready for certification: ${t.name}`, detail: "All criteria met: baseline, attendance, post-assessment, practicum", link: "/school-upskilling/teaching-fellows/certification", source: "Certification rule", ref: tfId, priority: "high" });
  }
}
