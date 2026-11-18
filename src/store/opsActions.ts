import type { OpsRequest, RequestDestination, RoleKey } from "@/data/types";
import { getPersona } from "@/config/personas";
import { DEMO_TODAY } from "@/lib/utils";
import { useDemo } from "./demoStore";
import { toast } from "./uiStore";

const S = () => useDemo.getState();

/** Approve or reject the current step of a request; the next approver is notified via the Inbox. */
export function decideRequest(id: string, approve: boolean) {
  const p = getPersona(S().personaId);
  let next: { role: RoleKey; label: string } | undefined;
  let title = "";
  let requester = "";
  S().update((d) => {
    const r = d.requests.find((x) => x.id === id);
    if (!r) return;
    title = r.title; requester = r.requesterId;
    const step = r.chain.find((s) => s.status === "pending");
    if (!step) return;
    step.status = approve ? "approved" : "rejected"; step.by = p.staffId; step.at = DEMO_TODAY;
    (r.history ??= []).push({ at: DEMO_TODAY, text: `${step.label} ${approve ? "approved" : "rejected"}`, by: p.staffId });
    if (!approve) { r.status = "Rejected"; return; }
    const w = r.chain.find((s) => s.status === "waiting");
    if (w) { w.status = "pending"; next = { role: w.role, label: w.label }; } else r.status = "Approved";
    d.inbox.forEach((i) => { if (i.status === "open" && i.kind === "approval" && i.detail.includes(r.id) && i.toRole === p.role) i.status = "done"; });
  });
  if (next) S().addInbox({ toRole: next.role, kind: "approval", title: `Approve: ${title}`, detail: `${id} · ${next.label} step`, link: "/operations/requests", source: "Operations & HR" });
  const reqPersona = ["p-exec", "p-su-pm", "p-su-po", "p-su-trainer", "p-fb-pm", "p-fb-po", "p-fb-trainer", "p-curriculum", "p-ops", "p-fundraising", "p-me"].map(getPersona).find((x) => x.staffId === requester);
  if (reqPersona) S().notify({ toPersona: reqPersona.id, text: `${id} ${approve ? (next ? `approved, now with ${next.label}` : "fully approved") : "was rejected"}`, link: "/requests", tone: approve ? "success" : "danger" });
  toast({ tone: approve ? "success" : "warning", title: approve ? (next ? `Approved · sent to ${next.label}` : "Request approved") : "Request rejected", body: "The requester was notified." });
}

export function assignRequest(id: string, assigneeId: string) {
  S().update((d) => { const r = d.requests.find((x) => x.id === id); if (r) { r.status = "Assigned"; r.assigneeId = assigneeId; (r.history ??= []).push({ at: DEMO_TODAY, text: "Assigned for fulfilment", by: assigneeId }); } });
  toast({ tone: "success", title: "Assigned", body: "The assignee received a task." });
}

export function completeRequest(id: string) {
  S().update((d) => {
    const r = d.requests.find((x) => x.id === id);
    if (!r) return;
    r.status = "Completed";
    (r.history ??= []).push({ at: DEMO_TODAY, text: "Completed" });
    if (r.type === "Equipment") { const a = d.assets.find((x) => x.status === "Available" && x.type === "Laptop"); if (a) { a.status = "On loan"; a.holder = r.requesterId; a.location = "Issued"; } }
  });
  toast({ tone: "success", title: "Request completed", body: "Equipment requests allocate an available asset automatically." });
}

export const CHAINS: Record<OpsRequest["type"], { role: RoleKey; label: string }[]> = {
  Leave: [{ role: "su_pm", label: "Line manager" }, { role: "ops_hr", label: "HR" }],
  Equipment: [{ role: "su_pm", label: "Line manager" }, { role: "ops_hr", label: "Operations" }],
  Travel: [{ role: "su_pm", label: "Line manager" }, { role: "ops_hr", label: "Finance" }],
  Purchase: [{ role: "su_pm", label: "Line manager" }, { role: "ops_hr", label: "Finance" }, { role: "exec", label: "Executive (over USD 1,000)" }],
  General: [{ role: "ops_hr", label: "Operations" }],
  Curriculum: [{ role: "curriculum", label: "Curriculum Manager" }],
  "Program support": [{ role: "su_pm", label: "Program manager" }],
};

/** Responsible person per destination and type (who fulfils the request once approved). */
export function ownerFor(dest: RequestDestination, type: OpsRequest["type"]): string {
  if (dest === "Curriculum Manager") return "s-yasmin";
  if (dest === "School Upskilling Manager") return "s-maya";
  if (dest === "Future Builders Manager") return "s-tarek";
  if (dest === "Executive") return "s-rana";
  return type === "Leave" ? "s-reem" : type === "Travel" || type === "Purchase" ? "s-ghassan" : "s-ziad";
}

export function chainFor(type: OpsRequest["type"], dest: RequestDestination, amount: number | undefined, role: RoleKey) {
  const lineMgr: RoleKey = role.startsWith("fb") ? "fb_pm" : role.startsWith("su") ? "su_pm" : "exec";
  const progRole: RoleKey = dest === "Future Builders Manager" ? "fb_pm" : dest === "Executive" ? "exec" : "su_pm";
  const base = dest === "Executive" ? [{ role: "exec" as RoleKey, label: "Co-founder" }] : CHAINS[type];
  return base.filter((s) => !(s.label.startsWith("Executive") && (amount ?? 0) <= 1000)).map((s, i) => ({
    role: s.label === "Line manager" ? lineMgr : s.label === "Program manager" ? progRole : s.role,
    label: s.label === "Program manager" ? (dest === "Future Builders Manager" ? "FB Project Manager" : "SU Project Manager") : s.label,
    status: (i === 0 ? "pending" : "waiting") as "pending" | "waiting",
  }));
}

export function createRequest(type: OpsRequest["type"], title: string, details: string, amount?: number, opts: { destination?: RequestDestination; fields?: { label: string; value: string }[]; aiFilled?: boolean } = {}) {
  const p = getPersona(S().personaId);
  const destination = opts.destination ?? (type === "Curriculum" ? "Curriculum Manager" : type === "Program support" ? "School Upskilling Manager" : "Operations & HR");
  const chain = chainFor(type, destination, amount, p.role);
  const id = `REQ-${String(S().data.requests.length + 1).padStart(4, "0")}`;
  const ownerId = ownerFor(destination, type);
  S().update((d) => { d.requests.unshift({ id, type, title, requesterId: p.staffId ?? p.id, createdAt: DEMO_TODAY, amount, details, chain, status: "In approval", destination, fields: opts.fields, ownerId, aiFilled: opts.aiFilled, history: [{ at: DEMO_TODAY, text: opts.aiFilled ? "Submitted (filled with AI, reviewed by the requester)" : "Submitted", by: p.staffId }] }); });
  S().addInbox({ toRole: chain[0].role, kind: "approval", title: `Approve: ${title}`, detail: `${id} · from ${p.name}`, link: "/operations/requests", source: destination });
  toast({ tone: "success", title: `${id} submitted`, body: `Sent to ${chain[0].label}. You’ll be notified at each step.` });
  return id;
}
