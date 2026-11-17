import { Badge, type Tone } from "@/components/ui/badge";

const TONES: Record<string, Tone> = {
  Active: "success", Approved: "success", Published: "success", Completed: "success", Certified: "success", Deployed: "success", Placed: "success", Submitted: "info", Done: "success", Passed: "success", Closed: "neutral", "Report approved": "success", Awarded: "success", Signed: "success", Consented: "success", Held: "neutral",
  "In progress": "info", "In review": "warning", "In training": "info", Live: "info", Scheduled: "neutral", Planned: "neutral", Open: "info", Matching: "info", Upcoming: "neutral", Drafting: "info", Qualifying: "info", Identified: "neutral", Assigned: "info", Interview: "info", Screening: "neutral", Applied: "neutral", Offer: "info", Onboarding: "info", Decision: "warning", Admitted: "success", Shortlisted: "neutral", "Shared with host": "info", Agreement: "info", "In follow-up": "warning", Mitigating: "warning", "In approval": "warning", Reconciling: "warning",
  Pending: "warning", "Pending consent": "warning", "Renewal due": "warning", Draft: "neutral", Waitlist: "warning", "Changes requested": "danger", Declined: "danger", Rejected: "danger", Withdrawn: "neutral", Alumni: "neutral", Graduated: "success", Recruiting: "info", Paused: "neutral", "Not started": "neutral", "In repair": "warning", "On loan": "info", Available: "success", Retired: "neutral", Filled: "success", "Report drafted": "info", Idea: "neutral", "In next version": "info", Deferred: "neutral",
};

export function StatusBadge({ status, dot = true }: { status: string; dot?: boolean }) {
  return <Badge tone={TONES[status] ?? "neutral"} dot={dot}>{status}</Badge>;
}
