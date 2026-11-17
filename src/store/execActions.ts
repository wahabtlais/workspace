import type { Decision, RoleKey } from "@/data/types";
import { getPersona } from "@/config/personas";
import { uid } from "@/lib/utils";
import { useDemo } from "./demoStore";
import { decideRequest } from "./opsActions";
import { toast } from "./uiStore";

const S = () => useDemo.getState();

/** Recording a decision updates the record it governs, closes the related Inbox items and creates a follow-up task. */
export function decideDecision(id: string, status: Decision["status"]) {
  const dec = S().data.decisions.find((x) => x.id === id);
  if (!dec) return;
  const approve = status === "Approved";
  const requesterRole = (S().data.staff.find((s) => s.id === dec.requestedBy)?.role ?? "exec") as RoleKey;
  S().update((d) => {
    const x = d.decisions.find((y) => y.id === id)!;
    x.status = status;
    d.inbox.forEach((i) => { if (i.status === "open" && (i.ref === id || (i.toRole === "exec" && i.link === "/executive/decisions" && i.title.includes(dec.title.replace(/^.*?: /, "").slice(0, 20))))) i.status = "done"; });
    if (dec.obligationId) { const o = d.obligations.find((y) => y.id === dec.obligationId); if (o) o.status = approve ? "Approved" : "Drafting"; }
    if (dec.opportunityId) { const o = d.opportunities.find((y) => y.id === dec.opportunityId); if (o) o.stage = approve ? "Drafting" : status === "Declined" ? "Declined" : o.stage; }
    d.activity.unshift({ id: uid("ac"), at: new Date().toISOString(), actor: getPersona(S().personaId).name, text: `${status.toLowerCase()} decision: ${dec.title}`, area: "Executive" });
  });
  if (dec.requestId && status !== "Deferred") {
    const req = S().data.requests.find((r) => r.id === dec.requestId);
    if (req?.chain.some((c) => c.status === "pending" && c.role === "exec")) decideRequest(dec.requestId, approve);
  }
  if (status !== "Deferred") {
    S().addInbox({ toRole: requesterRole, kind: "task", title: `${approve ? "Act on approved decision" : "Decision declined"}: ${dec.title}`, detail: approve ? "Follow-up task created from the executive decision" : "See the decision log for context", link: dec.link ?? "/executive/decisions", source: "Executive", ref: id });
  }
  S().notify({ toRole: requesterRole, text: `Decision ${status.toLowerCase()}: ${dec.title}`, link: "/executive/decisions", tone: approve ? "success" : "info" });
  toast({ tone: approve ? "success" : "info", title: `Decision ${status.toLowerCase()}`, body: dec.obligationId && approve ? "The report is approved and ready to submit to the donor." : dec.requestId && approve ? "The linked request moved to its next step." : "The requester received a follow-up task." });
}

export function createDecision(input: Omit<Decision, "id" | "status">) {
  const id = uid("dec");
  S().update((d) => { d.decisions.unshift({ ...input, id, status: "Pending" }); });
  S().addInbox({ toRole: "exec", kind: "approval", title: input.title, detail: input.context, link: "/executive/decisions", source: getPersona(S().personaId).name, ref: id, priority: "high" });
  return id;
}
