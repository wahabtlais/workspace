import { Bot, CheckCircle2, Circle, Plug } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { Workspace } from "@/components/common/Workspace";
import { DataTable } from "@/components/data/DataTable";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useData } from "@/store/hooks";
import { formatDate } from "@/lib/utils";

export function RequestTypes() {
  const types = [["Leave", "Line manager → HR"], ["Equipment", "Line manager → Operations"], ["Travel", "Line manager → Finance"], ["Purchase", "Line manager → Finance → Executive (over USD 1,000)"], ["General", "Operations"], ["Attendance correction", "Policy approver (per workflow)"], ["Curriculum version", "Reviewers → Project Manager"], ["Donor report", "M&E check → Executive"]];
  return <Workspace area="admin" title="Request types & approvals" description="Configurable request types and approval chains. Humans and AI-proposed actions use the same approvals."><Card><CardBody className="pt-4"><MiniTable head={["Type", "Approval chain"]} rows={types.map(([a, b]) => [<span className="font-medium">{a}</span>, b])} /></CardBody></Card></Workspace>;
}

export function Integrations() {
  const items = [["Google sign-in (SSO)", true, "Staff sign in with Workspace accounts"], ["Google Calendar", true, "Sessions, visits and leave pushed to calendars"], ["Google Drive / Docs", false, "Generated documents created as Google Docs"], ["Google Sheets sync", false, "Per-dataset ownership: import, export, or two-way (exceptional)"]] as const;
  return (
    <Workspace area="admin" title="Integrations" description="Integrate before replacing. All connections are simulated in the prototype.">
      <div className="grid gap-3 md:grid-cols-2">{items.map(([t, on, desc]) => <Card key={t} className="flex items-start gap-3 p-4"><Plug className="mt-0.5 size-5 text-muted" /><div className="flex-1"><p className="font-medium">{t}</p><p className="text-[13px] text-muted">{desc}</p></div>{on ? <Badge tone="success">Connected</Badge> : <Badge tone="neutral">Not connected</Badge>}</Card>)}</div>
      <Card><CardHeader title="Sheets mapping wizard (preview)" subtitle="Example: importing a school roster sheet" /><CardBody><MiniTable head={["Sheet column", "Platform field", "Check"]} rows={[["Student name", "Pupil first name + initial", <Badge tone="success">OK</Badge>], ["Class", "Class (grade-section)", <Badge tone="success">OK</Badge>], ["Phone (parent)", "Not imported", <Badge tone="warning">Excluded: not needed</Badge>]]} /></CardBody></Card>
    </Workspace>
  );
}

const AGENTS = [["Ask CodeBrave (orchestrator)", "Everyone", 2, 412, 38], ["Curriculum Agent", "Curriculum, trainers", 2, 64, 12], ["Program Delivery Agent", "PMs, POs, trainers", 2, 188, 21], ["Reporting & Insights Agent", "Executive, PMs, Fundraising", 2, 57, 18], ["Fundraising Agent", "Fundraising, Executive", 2, 22, 9], ["Operations & HR Agent", "All staff", 2, 140, 6], ["Learning Assistant", "FB students", 1, 0, 0]] as const;

export function AgentHub() {
  return (
    <Workspace area="admin" title="Agent Hub" description="Seven agents; everything else is a tool or a deterministic workflow. Agents act with the requesting person’s permissions and never see safeguarding data.">
      <Card><CardBody className="pt-4"><MiniTable head={["Agent", "Serves", "Autonomy", "Runs (30 days)", "Cost (USD)"]} rows={AGENTS.map(([n, s, lvl, runs, cost]) => [<span className="flex items-center gap-2 font-medium"><Bot className="size-4 text-ai-600" />{n}</span>, s, <span className="flex gap-1">{[1, 2, 3, 4].map((l) => <Badge key={l} tone={l <= lvl ? "ai" : "neutral"}>L{l}</Badge>)}</span>, runs, <span className="flex items-center gap-2"><Progress value={(cost / 40) * 100} className="w-16" tone="ai" />{cost}</span>])} /></CardBody></Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4"><p className="text-[12px] text-muted">Monthly budget</p><p className="text-[22px] font-semibold">USD 104 / 250</p><Progress value={42} className="mt-2" tone="ai" /></Card>
        <Card className="p-4"><p className="text-[12px] text-muted">Proposed actions approved</p><p className="text-[22px] font-semibold">91%</p><p className="text-[12px] text-muted">two-phase writes via Approvals</p></Card>
        <Card className="p-4"><p className="text-[12px] text-muted">Guardrails</p>{["No safeguarding data", "Pupil data aggregated only", "Minor PII pseudonymised"].map((g) => <p key={g} className="flex items-center gap-1.5 text-[13px]"><CheckCircle2 className="size-3.5 text-emerald-600" />{g}</p>)}</Card>
      </div>
    </Workspace>
  );
}

export function AuditLog() {
  const d = useData();
  return (
    <Workspace area="admin" title="Audit log" description="Append-only record of writes and every access to sensitive data classes.">
      <DataTable rows={d.audit} search={(a) => `${a.actor} ${a.action} ${a.target}`} filters={[{ key: "c", label: "Data class", options: ["standard", "learner-PII", "pupil-data", "safeguarding"], get: (a) => a.dataClass }]}
        columns={[{ key: "t", header: "When", cell: (a) => `${formatDate(a.at)} ${a.at.slice(11, 16)}` }, { key: "a", header: "Actor", cell: (a) => <span className="font-medium">{a.actor}</span> }, { key: "x", header: "Action", cell: (a) => a.action }, { key: "g", header: "Target", cell: (a) => <span className="text-muted">{a.target}</span> }, { key: "c", header: "Data class", cell: (a) => <Badge tone={a.dataClass === "safeguarding" ? "danger" : a.dataClass === "pupil-data" ? "warning" : "outline"}>{a.dataClass}</Badge> }]} />
    </Workspace>
  );
}

export function DataProtection() {
  const rows = [["Pupil attendance", "pupil-data", "End of academic year + 2 years, then aggregated"], ["FB student records", "minor-PII", "Graduation + 5 years"], ["Safeguarding cases", "safeguarding", "Per safeguarding policy"], ["Staff records", "staff-HR", "Employment + 7 years"], ["AI run logs", "standard", "12 months"]];
  return (
    <Workspace area="admin" title="Data protection" description="Retention rules, data export and deletion requests, access reviews.">
      <Card><CardHeader title="Retention schedule" /><CardBody><MiniTable head={["Data", "Class", "Retention"]} rows={rows.map(([a, b, c]) => [a, <Badge tone="outline">{b}</Badge>, c])} /></CardBody></Card>
      <Card><CardHeader title="Requests" /><CardBody className="space-y-1 text-[13px]">{([["Export request from a guardian", true], ["Quarterly access review: pupil-data grants", false]] as const).map(([t, done]) => <p key={t} className="flex items-center gap-2">{done ? <CheckCircle2 className="size-4 text-emerald-600" /> : <Circle className="size-4 text-subtle" />}{t}</p>)}</CardBody></Card>
    </Workspace>
  );
}
