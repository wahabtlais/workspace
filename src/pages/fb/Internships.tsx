import { Link } from "react-router";
import { Check, Lock, Share2, UserPlus } from "lucide-react";
import type { Placement } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/components/common/Workspace";
import { Board } from "@/components/data/Board";
import { AIAction } from "@/components/shell/AskPanel";
import { useData, useLookup } from "@/store/hooks";
import { addShortlist, advancePlacement, shareWithHost } from "@/store/fbActions";
import { PATHWAY_LABEL } from "@/data/seed/fb";
import { formatDate } from "@/lib/utils";

const STAGES: Placement["stage"][] = ["Shortlisted", "Shared with host", "Interview", "Agreement", "Placed", "Completed"];

export default function Internships() {
  const d = useData();
  const L = useLookup();
  const open = d.openings.filter((o) => o.status !== "Filled");
  return (
    <Workspace area="fb" title="Internships" description="Host opportunities, matching, consent checks, placement agreements and check-ins."
      aiActions={<AIAction label="Suggest a shortlist" prompt="Suggest internship matches" />}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {open.map((o) => {
          const host = L.orgs.get(o.hostId)!;
          const matches = d.students.filter((s) => s.status === "Active" && s.pathway === o.pathway && !d.placements.some((p) => p.studentId === s.id && p.openingId === o.id)).sort((a, b) => b.readiness - a.readiness).slice(0, 2);
          return (
            <Card key={o.id} className="p-4">
              <p className="font-semibold">{o.title}</p>
              <p className="text-[12px] text-muted">{host.name} · {o.seats} seats · from {formatDate(o.start)}</p>
              <div className="mt-2 flex flex-wrap gap-1"><Badge tone="outline">{PATHWAY_LABEL[o.pathway]}</Badge>{host.safeguardingCheck === "Passed" ? <Badge tone="success"><Check /> Host check passed</Badge> : <Badge tone="warning"><Lock /> Host check: {host.safeguardingCheck}</Badge>}</div>
              {matches.length > 0 && <div className="mt-3 space-y-1"><p className="text-[11px] font-medium uppercase tracking-wide text-subtle">Suggested matches</p>{matches.map((s) => <div key={s.id} className="flex items-center justify-between text-[13px]"><span>{s.name} <span className="text-muted">· readiness {s.readiness}%</span></span><Button size="icon-sm" variant="ghost" aria-label="Add to shortlist" onClick={() => addShortlist(o.id, s.id)}><UserPlus /></Button></div>)}</div>}
            </Card>
          );
        })}
      </div>
      <Card><CardHeader title="Placement pipeline" subtitle="A candidate is shared only with student + guardian consent and a passed host check. Drag to move." /><CardBody>
        <Board columns={STAGES} items={d.placements} getColumn={(p) => p.stage} onMove={(p, to) => (to === "Shared with host" ? shareWithHost(p.id) : advancePlacement(p.id, to as Placement["stage"]))}
          renderCard={(p) => {
            const s = d.students.find((x) => x.id === p.studentId)!;
            const o = d.openings.find((x) => x.id === p.openingId)!;
            const ok = s.consent.internshipSharing && s.consent.portfolioSharing;
            return (
              <div>
                <Link to={`/future-builders/students/${s.id}`} className="font-medium hover:underline">{s.name}</Link>
                <p className="text-[12px] text-muted">{o.title} · {L.orgs.get(o.hostId)?.name}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">{ok ? <Badge tone="success">Consent to share</Badge> : <Badge tone="danger">No sharing consent</Badge>}{p.checkIns.length > 0 && <Badge tone="outline">{p.checkIns.length} check-ins</Badge>}</div>
                {p.stage === "Shortlisted" && <Button size="sm" variant="secondary" className="mt-2" onClick={() => shareWithHost(p.id)}><Share2 /> Share with host</Button>}
              </div>
            );
          }} />
      </CardBody></Card>
    </Workspace>
  );
}
