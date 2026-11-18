import type { ReactNode } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/misc";
import { Workspace } from "@/components/common/Workspace";
import { DataTable } from "@/components/data/DataTable";
import { Board } from "@/components/data/Board";
import { useData, useLookup } from "@/store/hooks";
import { formatDate } from "@/lib/utils";
import { AIMenu } from "@/components/shell/AskPanel";

export function Directory() {
  const d = useData();
  const L = useLookup();
  return (
    <Workspace area="operations" title="People directory" description="Everyone at CodeBrave, with role, department and manager. Contracts and personal records are restricted to HR." aiActions={<AIMenu context="Operations & HR" items={[{ label: "Analyze an operational spreadsheet", prompt: "Analyze this spreadsheet for trends and anomalies" }, { label: "Summarize requests", prompt: "Summarise open requests" }, { label: "Suggest process improvements", prompt: "Find the bottlenecks in our requests and suggest process improvements" }, { label: "Draft an email", prompt: "Draft an email to Finance about the possible duplicate internet invoice" }, { label: "Prepare meeting notes", prompt: "Summarize these meeting notes" }]} />}>
      <DataTable rows={d.staff} search={(s) => `${s.name} ${s.title}`} filters={[{ key: "d", label: "Department", options: [...new Set(d.staff.map((s) => s.department))], get: (s) => s.department }]}
        columns={[
          { key: "n", header: "Name", sort: (s) => s.name, cell: (s) => <span className="flex items-center gap-2"><Avatar name={s.name} size={28} /><span><span className="block font-medium">{s.name}</span><span className="text-[12px] text-muted">{s.email}</span></span></span> },
          { key: "t", header: "Title", cell: (s) => s.title },
          { key: "d", header: "Department", cell: (s) => <Badge tone="outline">{s.department}</Badge>, hideOnMobile: true },
          { key: "m", header: "Manager", cell: (s) => <span className="text-muted">{s.managerId ? L.person(s.managerId) : "—"}</span>, hideOnMobile: true },
          { key: "l", header: "Location", cell: (s) => <span className="text-muted">{s.location}</span>, hideOnMobile: true },
          { key: "s", header: "Since", sort: (s) => s.startDate, cell: (s) => formatDate(s.startDate, { month: "short", year: "numeric" }) },
        ]} />
    </Workspace>
  );
}

export function OrgChart() {
  const d = useData();
  const node = (id: string, depth: number): ReactNode => {
    const s = d.staff.find((x) => x.id === id)!;
    const reports = d.staff.filter((x) => x.managerId === id);
    return (
      <li key={id} className="mt-2">
        <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 shadow-card" style={{ marginInlineStart: depth * 28 }}>
          <Avatar name={s.name} size={28} /><span><span className="block text-[13px] font-medium">{s.name}</span><span className="text-[11px] text-muted">{s.title}</span></span>
        </div>
        {reports.length > 0 && <ul>{reports.map((r) => node(r.id, depth + 1))}</ul>}
      </li>
    );
  };
  return (
    <Workspace area="operations" title="Org chart" description="Reporting lines, derived from the people directory.">
      <Card><CardBody className="pt-4"><ul>{node("s-rana", 0)}{node("s-karim", 0)}</ul></CardBody></Card>
    </Workspace>
  );
}

export function Recruitment() {
  const d = useData();
  const items = d.vacancies.flatMap((v) => v.candidates.map((c) => ({ ...c, vacancy: v.title })));
  return (
    <Workspace area="operations" title="Staff recruitment" description="Vacancies and candidates. Uses the same pipeline pattern as TF recruitment and FB admissions.">
      <div className="flex flex-wrap gap-2">{d.vacancies.map((v) => <Badge key={v.id} tone="info">{v.title} · {v.candidates.length} candidates</Badge>)}</div>
      <Board columns={["Applied", "Screening", "Interview", "Offer", "Hired"]} items={items} getColumn={(c) => c.stage} renderCard={(c) => <div><p className="font-medium">{c.name}</p><p className="text-[12px] text-muted">{c.vacancy}</p></div>} />
    </Workspace>
  );
}

export function StaffOnboarding() {
  const d = useData();
  const L = useLookup();
  return (
    <Workspace area="operations" title="Onboarding" description="Checklists for new staff and Teaching Fellows: contracts, accounts, equipment, policies.">
      <div className="grid gap-4 lg:grid-cols-2">{d.onboarding.map((o) => <Card key={o.id}><CardHeader title={o.personName} subtitle={`${o.kind} · starts ${formatDate(o.startDate)}`} /><CardBody className="space-y-1">{o.steps.map((s) => <p key={s.label} className="flex items-center justify-between text-[13px]"><span>{s.done ? "✓" : "○"} {s.label}</span><span className="text-muted">{L.person(s.owner)}</span></p>)}</CardBody></Card>)}</div>
    </Workspace>
  );
}
