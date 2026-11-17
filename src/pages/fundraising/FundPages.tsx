import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable } from "@/components/data/DataTable";
import { FundraisingPanel } from "@/pages/staff/home/panelsOrg";
import { useData, useLookup } from "@/store/hooks";
import { formatDate } from "@/lib/utils";

export function FundOverview() {
  return <Workspace area="fundraising" title="Fundraising & Partnerships" description="Pipeline, grants, obligations and evidence, connected to live program indicators."><FundraisingPanel /></Workspace>;
}

export function Donors() {
  const d = useData();
  const L = useLookup();
  const orgs = d.organizations.filter((o) => o.type === "Donor" || o.type === "Partner");
  return (
    <Workspace area="fundraising" title="Donors & partners" description="Relationship owner, giving history and interaction log, from the shared organization registry.">
      <DataTable rows={orgs} search={(o) => o.name} filters={[{ key: "t", label: "Type", options: ["Donor", "Partner"], get: (o) => o.type }]}
        columns={[
          { key: "n", header: "Organization", cell: (o) => <span className="font-medium">{o.name}</span> },
          { key: "t", header: "Type", cell: (o) => <Badge tone="outline">{o.type}</Badge> },
          { key: "s", header: "Sector", cell: (o) => <span className="text-muted">{o.sector}</span>, hideOnMobile: true },
          { key: "g", header: "Active grants", cell: (o) => d.grants.filter((g) => g.donorId === o.id && g.status !== "Closed").length },
          { key: "p", header: "Pipeline", cell: (o) => d.opportunities.filter((x) => x.funder === o.name && !["Awarded", "Declined"].includes(x.stage)).length },
          { key: "c", header: "Contact", cell: (o) => <span className="text-muted">{o.contact}</span>, hideOnMobile: true },
          { key: "r", header: "Owner", cell: (o) => L.person(o.ownerId) },
        ]} />
    </Workspace>
  );
}

export function Proposals() {
  const d = useData();
  const props = d.opportunities.filter((o) => ["Drafting", "Submitted"].includes(o.stage));
  const sections = ["Organization background", "Need & context", "Approach", "Results framework", "Budget narrative"];
  return (
    <Workspace area="fundraising" title="Proposals" description="Sections drafted with help from the Fundraising Agent, every figure cited from Results & Indicators, then reviewed and approved.">
      {props.map((o, k) => (
        <Card key={o.id}><CardHeader title={o.title} subtitle={`${o.funder} · deadline ${formatDate(o.deadline)}`} action={<StatusBadge status={o.stage} />} />
          <CardBody className="grid gap-2 sm:grid-cols-5">{sections.map((s, i) => { const done = o.stage === "Submitted" || i < 2 + k; return <div key={s} className="rounded-lg border border-line p-2.5 text-[12px]"><p className="font-medium">{s}</p><Badge tone={done ? "success" : "neutral"} className="mt-1">{done ? "Drafted" : "To do"}</Badge></div>; })}</CardBody>
        </Card>
      ))}
    </Workspace>
  );
}
