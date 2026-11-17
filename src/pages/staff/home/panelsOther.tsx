import { Link } from "react-router";
import { Bot, CheckCircle2, Lock, Plug, ShieldAlert, Target, TriangleAlert, Users } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/common/StatTile";
import { AIAction } from "@/components/shell/AskPanel";
import { useData, useLookup } from "@/store/hooks";
import { personas } from "@/config/personas";
import { MiniTable } from "./widgets";

function latest(series: { value: number }[]) {
  return [...series].reverse().find((x) => x.value > 0)?.value ?? 0;
}

export function MePanel() {
  const d = useData();
  const L = useLookup();
  const rows = d.indicators.map((i) => ({ i, v: latest(i.series), on: latest(i.series) >= i.target * 0.95 }));
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Indicators tracked" value={rows.length} icon={<Target />} to="/results" />
        <StatTile label="On track" value={rows.filter((r) => r.on).length} tone="success" icon={<CheckCircle2 />} />
        <StatTile label="Off track" value={rows.filter((r) => !r.on).length} tone="warning" icon={<TriangleAlert />} />
        <StatTile label="Linked to grants" value={rows.filter((r) => r.i.grantIds.length).length} icon={<Users />} to="/fundraising/grants" />
      </div>
      <Card>
        <CardHeader title="Indicator library" subtitle="Every value has provenance back to its source records" action={<AIAction label="Draft variance note" prompt="Draft an indicator variance note" />} />
        <CardBody>
          <MiniTable head={["Code", "Indicator", "Latest", "Target", "Status", "Owner"]} rows={rows.map(({ i, v, on }) => [
            <span className="tabular text-muted">{i.code}</span>, <span className="font-medium">{i.name}</span>, <span className="tabular">{v}{i.unit === "%" ? "%" : ""}</span>,
            <span className="tabular text-muted">{i.target}{i.unit === "%" ? "%" : ""}</span>, on ? <Badge tone="success" dot>On track</Badge> : <Badge tone="warning" dot>Off track</Badge>, <span className="text-muted">{L.person(i.ownerId)}</span>,
          ])} />
        </CardBody>
      </Card>
    </>
  );
}

export function AdminPanel() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Demo users" value={personas.length} sub="5 user types, 19 roles" icon={<Users />} to="/admin" />
        <StatTile label="Integrations" value="2 / 4" sub="Google SSO, Calendar connected" icon={<Plug />} to="/admin/integrations" />
        <StatTile label="Agents" value={7} sub="Levels 1–2 enabled" icon={<Bot />} to="/admin/agents" />
        <StatTile label="Pending access requests" value={1} tone="warning" icon={<Lock />} to="/admin" />
      </div>
      <Card>
        <CardHeader title="Admins configure; they don’t see data" subtitle="Break-glass access is time-limited and audited" />
        <CardBody className="grid gap-3 sm:grid-cols-3">
          {[["Attendance policies", "Statuses, correction windows, thresholds and approvers for all three attendance workflows", "/admin/attendance-policies"],
            ["Request types & approvals", "Leave, equipment, travel, purchase and general requests with approval chains", "/admin/request-types"],
            ["Agent Hub", "Agents, tools, runs, usage and budgets", "/admin/agents"]].map(([t, b, to]) => (
            <Link key={t} to={to} className="rounded-xl border border-line p-4 hover:border-brand-200"><p className="font-medium">{t}</p><p className="mt-1 text-[13px] text-muted">{b}</p></Link>
          ))}
        </CardBody>
      </Card>
    </>
  );
}

export function SafeguardingPanel() {
  return (
    <Card>
      <CardHeader icon={<ShieldAlert />} title="Safeguarding cases" subtitle="Restricted to designated safeguarding leads. Excluded from search, analytics and AI agents." />
      <CardBody>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Open cases" value={2} sub="both in follow-up" tone="warning" />
          <StatTile label="Host checks pending" value={2} sub="placements blocked until passed" />
          <StatTile label="Concerns this term" value={3} />
        </div>
        <Button asChild className="mt-4"><Link to="/safeguarding/cases">Open restricted case list</Link></Button>
        <Badge tone="outline" className="ml-3">Every view is logged</Badge>
      </CardBody>
    </Card>
  );
}
