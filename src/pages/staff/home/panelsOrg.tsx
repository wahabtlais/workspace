import { Link } from "react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarClock, CheckCircle2, ClipboardList, HandCoins, Target, TriangleAlert, Users } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge, type Tone } from "@/components/ui/badge";
import { StatTile } from "@/components/common/StatTile";
import { AIAction } from "@/components/shell/AskPanel";
import { useData, useLookup } from "@/store/hooks";
import { addDays, DEMO_TODAY, formatDate, relativeDay } from "@/lib/utils";
import { MiniTable } from "./widgets";

const REQ_TONE: Record<string, Tone> = { "In approval": "warning", Approved: "info", Assigned: "info", Completed: "success", Rejected: "danger" };

export function OpsPanel() {
  const d = useData();
  const L = useLookup();
  const open = d.requests.filter((r) => r.status === "In approval");
  const atOps = open.filter((r) => r.chain.some((s) => s.role === "ops_hr" && s.status === "pending"));
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Waiting for Operations" value={atOps.length} sub="approve or assign" tone={atOps.length ? "warning" : "success"} icon={<ClipboardList />} to="/operations/requests" />
        <StatTile label="In approval (all)" value={open.length} icon={<CalendarClock />} to="/operations/requests" />
        <StatTile label="Completed this month" value={d.requests.filter((r) => r.status === "Completed").length} icon={<CheckCircle2 />} />
        <StatTile label="Staff" value={d.staff.length} sub="across 8 departments" icon={<Users />} to="/operations" />
      </div>
      <Card>
        <CardHeader title="Requests" subtitle="Every request follows its type’s approval chain" action={<AIAction label="Summarise open requests" prompt="Summarise open requests by stage" />} />
        <CardBody>
          <MiniTable head={["Request", "Type", "Requester", "Current step", "Status"]} rows={d.requests.slice(0, 8).map((r) => {
            const step = r.chain.find((s) => s.status === "pending");
            return [<span><span className="font-medium">{r.title}</span><span className="block text-[11px] text-subtle">{r.id}</span></span>, <span className="text-muted">{r.type}</span>,
              <span className="text-muted">{L.person(r.requesterId)}</span>, <span className="text-muted">{step ? step.label : "—"}</span>, <Badge tone={REQ_TONE[r.status]}>{r.status}</Badge>];
          })} />
        </CardBody>
      </Card>
    </>
  );
}

const STAGES = ["Identified", "Qualifying", "Drafting", "Submitted", "Awarded"] as const;

export function FundraisingPanel() {
  const d = useData();
  const pipe = STAGES.map((s) => ({ stage: s, value: Math.round(d.opportunities.filter((o) => o.stage === s).reduce((a, o) => a + o.amount, 0) / 1000) }));
  const due = d.obligations.filter((o) => o.status !== "Submitted" && o.due <= addDays(DEMO_TODAY, 45)).sort((a, b) => a.due.localeCompare(b.due));
  const open = d.opportunities.filter((o) => ["Identified", "Qualifying", "Drafting"].includes(o.stage)).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const pipelineK = pipe.slice(0, 4).reduce((a, p) => a + p.value, 0);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Open pipeline" value={"USD " + pipelineK + "k"} sub={`${open.length} opportunities before submission`} icon={<HandCoins />} to="/fundraising/opportunities" />
        <StatTile label="Active grants" value={d.grants.filter((g) => g.status !== "Closed").length} sub="2 School Upskilling · 2 Future Builders" icon={<Target />} to="/fundraising/grants" />
        <StatTile label="Obligations next 45 days" value={due.length} tone={due.length ? "warning" : "success"} icon={<CalendarClock />} to="/fundraising/obligations" />
        <StatTile label="Next deadline" value={open[0] ? relativeDay(open[0].deadline) : "—"} sub={open[0]?.title} icon={<TriangleAlert />} to="/fundraising/opportunities" />
      </div>
      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Pipeline by stage" subtitle="Total requested, USD thousands" action={<AIAction label="Check eligibility" prompt="Check eligibility for Girls in Tech Futures 2027" context="Opportunities" />} />
          <CardBody>
            <div className="h-[220px]">
              <ResponsiveContainer>
                <BarChart data={pipe} margin={{ left: -12, right: 8 }}>
                  <CartesianGrid vertical={false} stroke="#eef0f3" />
                  <XAxis dataKey="stage" tick={{ fontSize: 12, fill: "#5f6b7a" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#5f6b7a" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f5f6f8" }} formatter={(v) => ["USD " + v + "k", ""]} separator="" />
                  <Bar dataKey="value" fill="#3366bf" radius={[4, 4, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="Upcoming obligations" action={<AIAction label="Draft donor report" prompt="Draft the semi-annual report for Northbridge" />} />
          <CardBody className="space-y-2">
            {due.map((o) => (
              <Link key={o.id} to="/fundraising/obligations" className="flex items-center justify-between gap-3 rounded-lg border border-line p-2.5 hover:border-brand-200">
                <span className="min-w-0"><span className="block truncate text-[13px] font-medium">{o.title}</span><span className="block truncate text-[12px] text-muted">{d.grants.find((g) => g.id === o.grantId)?.title}</span></span>
                <span className="shrink-0 text-right"><span className="block text-[12px] font-medium">{formatDate(o.due)}</span><Badge tone={o.status === "In review" ? "warning" : "neutral"}>{o.status}</Badge></span>
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
