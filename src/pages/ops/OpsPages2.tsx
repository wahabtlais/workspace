import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable } from "@/components/data/DataTable";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useData, useLookup } from "@/store/hooks";
import { formatDate } from "@/lib/utils";

export function Leave() {
  const d = useData();
  const L = useLookup();
  return (
    <Workspace area="operations" title="Leave & attendance (staff)" description="Leave requests, balances and the team calendar. Payroll stays in the external system.">
      <Card><CardHeader title="Team calendar" subtitle="Approved and pending leave" /><CardBody><MiniTable head={["Person", "Type", "From", "To", "Status"]} rows={[...d.leave].sort((a, b) => a.from.localeCompare(b.from)).map((l) => [L.person(l.staffId), l.type, formatDate(l.from), formatDate(l.to), <StatusBadge status={l.status} />])} /></CardBody></Card>
      <Card><CardHeader title="Balances" /><CardBody><MiniTable head={["Person", "Annual leave left", "Sick days used"]} rows={d.staff.slice(0, 8).map((s, i) => [s.name, `${18 - ((i * 3) % 11)} days`, `${i % 4}`])} /></CardBody></Card>
    </Workspace>
  );
}

export function Assets() {
  const d = useData();
  const L = useLookup();
  return (
    <Workspace area="operations" title="Assets & equipment" description="Laptops and devices for staff, the field and students: loans, returns and repairs.">
      <DataTable rows={d.assets} search={(a) => `${a.tag} ${a.model}`} filters={[{ key: "s", label: "Status", options: ["Available", "On loan", "In repair", "Retired"], get: (a) => a.status }, { key: "t", label: "Type", options: ["Laptop", "Tablet", "Projector", "Router", "Phone"], get: (a) => a.type }]}
        columns={[{ key: "t", header: "Tag", cell: (a) => <span className="font-medium tabular">{a.tag}</span> }, { key: "m", header: "Item", cell: (a) => `${a.type} · ${a.model}` }, { key: "s", header: "Status", cell: (a) => <StatusBadge status={a.status} /> }, { key: "h", header: "Holder", cell: (a) => (a.holder ? L.person(a.holder) : "—") }, { key: "d", header: "Due back", cell: (a) => (a.dueBack ? formatDate(a.dueBack) : "—") }]} />
    </Workspace>
  );
}

export function OpsTasks() {
  const d = useData();
  const L = useLookup();
  return (
    <Workspace area="operations" title="Projects & tasks" description="The shared Work service: tasks from every workspace, with owners and due dates.">
      <DataTable rows={d.followUps} search={(f) => f.title} filters={[{ key: "p", label: "Program", options: ["SU", "FB"], get: (f) => f.program }, { key: "s", label: "Status", options: ["Open", "In progress", "Done"], get: (f) => f.status }]}
        columns={[{ key: "t", header: "Task", cell: (f) => <span className="font-medium">{f.title}</span> }, { key: "o", header: "Owner", cell: (f) => L.person(f.ownerId) }, { key: "d", header: "Due", sort: (f) => f.due, cell: (f) => formatDate(f.due) }, { key: "s", header: "Status", cell: (f) => <StatusBadge status={f.status} /> }]} />
    </Workspace>
  );
}

export function Policies() {
  const d = useData();
  const L = useLookup();
  return (
    <Workspace area="operations" title="Policies" description="Policies with owners, review dates and staff acknowledgements.">
      <Card><CardBody className="pt-4"><MiniTable head={["Policy", "Owner", "Review due", "Acknowledged"]} rows={d.kb.filter((k) => k.category === "Policy").map((k, i) => [<span className="font-medium">{k.title}</span>, L.person(k.ownerId), formatDate(k.reviewDue), <Badge tone={i === 1 ? "warning" : "success"}>{i === 1 ? "19/22 staff" : "22/22 staff"}</Badge>])} /></CardBody></Card>
    </Workspace>
  );
}
