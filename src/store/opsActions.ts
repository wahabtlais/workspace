import type { OpsRequest, RoleKey } from "@/data/types";
import { getPersona } from "@/config/personas";
import { DEMO_TODAY, uid } from "@/lib/utils";
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
  S().update((d) => { const r = d.requests.find((x) => x.id === id); if (r) { r.status = "Assigned"; r.assigneeId = assigneeId; } });
  toast({ tone: "success", title: "Assigned", body: "The assignee received a task." });
}

export function completeRequest(id: string) {
  S().update((d) => {
    const r = d.requests.find((x) => x.id === id);
    if (!r) return;
    r.status = "Completed";
    if (r.type === "Equipment") { const a = d.assets.find((x) => x.status === "Available" && x.type === "Laptop"); if (a) { a.status = "On loan"; a.holder = r.requesterId; a.location = "Issued"; } }
  });
  toast({ tone: "success", title: "Request completed", body: "Equipment requests allocate an available asset automatically." });
}

const CHAINS: Record<OpsRequest["type"], { role: RoleKey; label: string }[]> = {
  Leave: [{ role: "su_pm", label: "Line manager" }, { role: "ops_hr", label: "HR" }],
  Equipment: [{ role: "su_pm", label: "Line manager" }, { role: "ops_hr", label: "Operations" }],
  Travel: [{ role: "su_pm", label: "Line manager" }, { role: "ops_hr", label: "Finance" }],
  Purchase: [{ role: "su_pm", label: "Line manager" }, { role: "ops_hr", label: "Finance" }, { role: "exec", label: "Executive (over USD 1,000)" }],
  General: [{ role: "ops_hr", label: "Operations" }],
};

export function createRequest(type: OpsRequest["type"], title: string, details: string, amount?: number) {
  const p = getPersona(S().personaId);
  const lineMgr: RoleKey = p.role.startsWith("fb") ? "fb_pm" : p.role.startsWith("su") ? "su_pm" : "exec";
  const chain = CHAINS[type].filter((s) => !(s.label.startsWith("Executive") && (amount ?? 0) <= 1000)).map((s, i) => ({ role: s.label === "Line manager" ? lineMgr : s.role, label: s.label, status: (i === 0 ? "pending" : "waiting") as "pending" | "waiting" }));
  const id = `REQ-${String(S().data.requests.length + 1).padStart(4, "0")}`;
  S().update((d) => { d.requests.unshift({ id, type, title, requesterId: p.staffId ?? p.id, createdAt: DEMO_TODAY, amount, details, chain, status: "In approval" }); });
  S().addInbox({ toRole: chain[0].role, kind: "approval", title: `Approve: ${title}`, detail: `${id} · from ${p.name}`, link: "/operations/requests", source: "Operations & HR" });
  toast({ tone: "success", title: `${id} submitted`, body: `Sent to ${chain[0].label}. You’ll be notified at each step.` });
  return uid("x");
}
