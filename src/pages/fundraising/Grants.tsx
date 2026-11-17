import { Link, useParams } from "react-router";
import { CalendarClock, FileText } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/misc";
import { KeyValue, Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AIAction } from "@/components/shell/AskPanel";
import { MiniTable } from "@/pages/staff/home/widgets";
import { useLiveIndicators } from "@/pages/results/ResultsPages";
import { useData, useLookup } from "@/store/hooks";
import { formatDate, relativeDay } from "@/lib/utils";

export function GrantsList() {
  const d = useData();
  return (
    <Workspace area="fundraising" title="Grants" description="Award terms, restrictions, committed indicators and obligations.">
      <div className="grid gap-4 md:grid-cols-2">
        {d.grants.map((g) => { const obl = d.obligations.filter((o) => o.grantId === g.id && o.status !== "Submitted"); return (
          <Link key={g.id} to={`/fundraising/grants/${g.id}`}><Card className="h-full p-4 transition hover:border-brand-300">
            <div className="flex items-center justify-between gap-2"><p className="font-semibold">{g.title}</p><StatusBadge status={g.status} /></div>
            <p className="text-[13px] text-muted">{d.organizations.find((o) => o.id === g.donorId)?.name} · {g.currency} {g.amount.toLocaleString("en-US")}</p>
            <p className="mt-2 text-[12px] text-muted">{formatDate(g.start, { month: "short", year: "numeric" })} – {formatDate(g.end, { month: "short", year: "numeric" })} · {g.indicatorIds.length} indicators · {obl.length} open obligations</p>
          </Card></Link>
        ); })}
      </div>
    </Workspace>
  );
}

export function GrantDetail() {
  const { id } = useParams();
  const d = useData();
  const L = useLookup();
  const inds = useLiveIndicators();
  const g = d.grants.find((x) => x.id === id);
  if (!g) return <Workspace area="fundraising" title="Grant not found"><p>Unknown grant.</p></Workspace>;
  const elapsed = Math.round(((new Date("2026-11-17").getTime() - new Date(g.start).getTime()) / (new Date(g.end).getTime() - new Date(g.start).getTime())) * 100);
  return (
    <Workspace area="fundraising" hideSubnav title={g.title} description={d.organizations.find((o) => o.id === g.donorId)?.name}
      crumbs={[{ label: "Fundraising & Partnerships", to: "/fundraising" }, { label: "Grants", to: "/fundraising/grants" }, { label: g.title }]}
      meta={<StatusBadge status={g.status} />} aiActions={<AIAction label="Draft donor report" prompt={`Draft the semi-annual report for ${d.organizations.find((o) => o.id === g.donorId)?.name}`} context={g.title} />}>
      <Card><CardBody className="pt-5"><KeyValue cols={4} items={[["Amount", `${g.currency} ${g.amount.toLocaleString("en-US")}`], ["Period", `${formatDate(g.start, { month: "short", year: "numeric" })} – ${formatDate(g.end, { month: "short", year: "numeric" })}`], ["Time elapsed", <span className="flex items-center gap-2"><Progress value={elapsed} className="w-24" />{elapsed}%</span>], ["Restrictions", g.restrictions]]} /></CardBody></Card>
      <Card><CardHeader title="Committed indicators" subtitle="Live values from Results & Indicators" /><CardBody><MiniTable head={["Indicator", "Current", "Target", ""]} rows={inds.filter((i) => g.indicatorIds.includes(i.id)).map((i) => [<Link to={`/results/${i.id}`} className="hover:underline">{i.name}</Link>, `${i.current}${i.unit === "%" ? "%" : ""}`, `${i.target}${i.unit === "%" ? "%" : ""}`, <Progress value={Math.min(100, (i.current / i.target) * 100)} className="w-28" />])} /></CardBody></Card>
      <Card><CardHeader icon={<CalendarClock />} title="Obligations" /><CardBody><MiniTable head={["Obligation", "Due", "Owner", "Status"]} rows={d.obligations.filter((o) => o.grantId === g.id).map((o) => [o.title, relativeDay(o.due), L.person(o.ownerId), <StatusBadge status={o.status} />])} /></CardBody></Card>
      <Card><CardHeader icon={<FileText />} title="Documents" /><CardBody className="text-[13px] text-muted">{d.documents.filter((x) => x.context.includes(g.id)).map((x) => <p key={x.id}>{x.title} · {x.type}</p>)}<p>Grant agreement (PDF) · Budget (Sheet, owned by Finance)</p></CardBody></Card>
    </Workspace>
  );
}

export function Obligations() {
  const d = useData();
  const L = useLookup();
  const months = [...new Set(d.obligations.map((o) => o.due.slice(0, 7)))].sort();
  return (
    <Workspace area="fundraising" title="Obligations calendar" description="Reports, audits and visits owed to donors. Reminders go out at 30, 14 and 7 days.">
      {months.map((m) => (
        <Card key={m}><CardHeader title={formatDate(m + "-01", { month: "long", year: "numeric" })} /><CardBody className="space-y-2">
          {d.obligations.filter((o) => o.due.startsWith(m)).map((o) => <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3"><span className="w-20 text-[13px] font-medium">{formatDate(o.due)}</span><span className="flex-1"><span className="block font-medium">{o.title}</span><span className="text-[12px] text-muted">{d.grants.find((g) => g.id === o.grantId)?.title} · {L.person(o.ownerId)}</span></span><StatusBadge status={o.status} /></div>)}
        </CardBody></Card>
      ))}
    </Workspace>
  );
}
