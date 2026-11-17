import { Briefcase, CheckCircle2, Flag, Lock, Target } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { StatTile } from "@/components/common/StatTile";
import { useData, usePersona } from "@/store/hooks";
import { formatDate } from "@/lib/utils";

function Boundary({ text }: { text: string }) {
  return <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-surface px-2 py-1 text-[12px] text-muted ring-1 ring-line"><Lock className="size-3.5" /> {text}</p>;
}

function ClientHome() {
  const d = useData();
  const p = usePersona();
  const project = d.projects.find((x) => x.clientId === p.scope.orgId)!;
  const team = d.teams.find((t) => t.id === project.teamId);
  const approved = project.milestones.filter((m) => m.status === "Approved").length;
  return (
    <div className="space-y-5">
      <div><h1 className="text-[24px] font-semibold">{project.title}</h1><p className="mt-1 text-muted">Delivered by {team?.name}, Future Builders · {project.summary}</p>
        <Boundary text="You see this project only. Student contact details and grades are never shared." /></div>
      <Card>
        <CardHeader icon={<Flag />} title="Milestones" subtitle={`${approved} of ${project.milestones.length} approved`} />
        <CardBody>
          <Progress value={(approved / project.milestones.length) * 100} className="mb-4" />
          <ol className="space-y-2">
            {project.milestones.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line p-3">
                <span className="flex items-center gap-2">{m.status === "Approved" ? <CheckCircle2 className="size-4 text-emerald-600" /> : <Flag className="size-4 text-muted" />}<span className="font-medium">{m.title}</span></span>
                <span className="flex items-center gap-2 text-[12px] text-muted">{formatDate(m.due)} <Badge tone={m.status === "Submitted" ? "warning" : m.status === "Approved" ? "success" : "neutral"}>{m.status === "Submitted" ? "Ready for your review" : m.status}</Badge></span>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}

function HostHome() {
  const d = useData();
  const p = usePersona();
  const org = d.organizations.find((o) => o.id === p.scope.orgId)!;
  const openings = d.openings.filter((o) => o.hostId === org.id);
  const shared = d.placements.filter((pl) => openings.some((o) => o.id === pl.openingId) && pl.stage !== "Shortlisted");
  return (
    <div className="space-y-5">
      <div><h1 className="text-[24px] font-semibold">{org.name}</h1><p className="mt-1 text-muted">Internship host · safeguarding check: {org.safeguardingCheck}</p>
        <Boundary text="You see a candidate only after the student and their guardian agree to share." /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Open roles" value={openings.filter((o) => o.status !== "Filled").length} icon={<Briefcase />} />
        <StatTile label="Candidates shared with you" value={shared.filter((x) => x.stage !== "Completed").length} />
        <StatTile label="Completed internships" value={shared.filter((x) => x.stage === "Completed").length} />
      </div>
      <Card>
        <CardHeader title="Your openings" />
        <CardBody className="space-y-2">
          {openings.map((o) => <div key={o.id} className="flex items-center justify-between rounded-lg border border-line p-3"><span><span className="block font-medium">{o.title}</span><span className="text-[12px] text-muted">{o.seats} seats · starts {formatDate(o.start)}</span></span><Badge tone={o.status === "Filled" ? "success" : "info"}>{o.status}</Badge></div>)}
        </CardBody>
      </Card>
    </div>
  );
}

function DonorHome() {
  const d = useData();
  const p = usePersona();
  const grant = d.grants.find((g) => g.id === p.scope.grantIds?.[0])!;
  const inds = d.indicators.filter((i) => grant.indicatorIds.includes(i.id));
  return (
    <div className="space-y-5">
      <div><h1 className="text-[24px] font-semibold">{grant.title}</h1><p className="mt-1 text-muted">{grant.currency} {grant.amount.toLocaleString("en-US")} · {formatDate(grant.start, { month: "short", year: "numeric" })} – {formatDate(grant.end, { month: "short", year: "numeric" })}</p>
        <Boundary text="You see approved reports and aggregated indicators for your grant only. No identifiable student or pupil data." /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {inds.map((i) => {
          const v = [...i.series].reverse().find((x) => x.value > 0)?.value ?? 0;
          const u = i.unit === "%" ? "%" : "";
          return <StatTile key={i.id} label={i.name} value={`${v}${u}`} target={`${i.target}${u}`} progress={Math.min(100, (v / i.target) * 100)} icon={<Target />} />;
        })}
      </div>
    </div>
  );
}

export default function PartnerHome() {
  const p = usePersona();
  if (p.role === "client") return <ClientHome />;
  if (p.role === "host") return <HostHome />;
  return <DonorHome />;
}
