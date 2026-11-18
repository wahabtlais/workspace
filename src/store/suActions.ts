import type { Visit } from "@/data/types";
import { addDays, DEMO_TODAY, formatDate, uid } from "@/lib/utils";
import { useDemo } from "./demoStore";
import { toast } from "./uiStore";

const S = () => useDemo.getState();

/** Submit a classroom observation. Works offline; a low score creates a coaching follow-up automatically. */
export function submitObservation(visit: Visit, scores: number[], notes: string) {
  const offline = S().offline;
  const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  const d = S().data;
  const tfName = d.tfs.find((t) => t.id === visit.tfId)?.name ?? "Teaching Fellow";
  const school = d.schools.find((s) => s.id === visit.schoolId)?.name ?? "";
  S().update((x) => {
    const v = x.visits.find((y) => y.id === visit.id)!;
    v.status = "Completed"; v.score = avg; v.notes = notes; v.pendingSync = offline;
    if (avg < 2.5) x.followUps.unshift({ id: uid("fu"), title: `Coaching plan: ${tfName}`, program: "SU", schoolId: visit.schoolId, tfId: visit.tfId, ownerId: visit.officerId, due: addDays(DEMO_TODAY, 5), status: "Open", source: `Observation score ${avg} / 4 on ${formatDate(DEMO_TODAY)}`, createdAt: DEMO_TODAY });
    x.inbox.forEach((i) => { if (i.status === "open" && i.kind === "form" && i.title.includes(school.split(" ")[0])) i.status = "done"; });
  });
  if (offline) S().enqueue({ kind: "observation", label: `Observation: ${school}`, refId: visit.id });
  if (avg < 2.5) {
    S().addInbox({ toRole: "su_po", kind: "task", title: `Coaching plan for ${tfName}`, detail: `Observation ${avg} / 4 · scores below 2.5 create a coaching task`, link: "/school-upskilling/follow-ups", source: "Observation rule", priority: "high" });
    S().notify({ toRole: "su_pm", text: `Low observation score at ${school} (${avg} / 4): coaching task created`, link: "/school-upskilling/follow-ups", tone: "warning" });
  }
  S().logActivity({ actor: "Omar Haddad", text: `submitted an observation for ${school} (score ${avg})`, area: "School Upskilling" });
  toast(offline ? { tone: "warning", title: "Observation saved on this phone", body: "It will sync when you reconnect." } : { tone: "success", title: "Observation submitted", body: `Average ${avg} / 4${avg < 2.5 ? " · coaching task created" : ""}` });
  return avg;
}
