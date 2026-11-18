import { useState } from "react";
import { Check, ShieldAlert, UserPlus, X } from "lucide-react";
import type { Applicant } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/overlay";
import { KeyValue, Workspace } from "@/components/common/Workspace";
import { Board } from "@/components/data/Board";
import { AIAction } from "@/components/shell/AskPanel";
import { useData } from "@/store/hooks";
import { admitApplicant, moveApplicant, recordConsent } from "@/store/fbActions";
import { PATHWAY_LABEL } from "@/data/seed/fb";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router";

const STAGES: Applicant["stage"][] = ["Applied", "Screening", "Interview", "Decision", "Admitted", "Waitlist", "Declined"];

function ApplicantDialog({ a, onClose }: { a: Applicant; onClose: () => void }) {
  const eligible = a.age >= 15 && a.age <= 18;
  return (
    <DialogContent title={a.name} description={`Applied ${formatDate(a.appliedAt)} · ${a.school}`}
      footer={<>
        <DialogClose asChild><Button variant="secondary">Close</Button></DialogClose>
        {a.stage === "Decision" && <><Button variant="secondary" onClick={() => { moveApplicant(a.id, "Waitlist"); onClose(); }}>Waitlist</Button><Button variant="danger" onClick={() => { moveApplicant(a.id, "Declined"); onClose(); }}><X /> Decline</Button><Button variant="success" disabled={!eligible} onClick={() => { admitApplicant(a.id); onClose(); }}><Check /> Admit</Button></>}
        {["Applied", "Screening", "Interview"].includes(a.stage) && <Button onClick={() => { moveApplicant(a.id, STAGES[STAGES.indexOf(a.stage) + 1]); onClose(); }}>Move to {STAGES[STAGES.indexOf(a.stage) + 1]}</Button>}
      </>}>
      <KeyValue items={[["Age", <>{a.age} {eligible ? <Badge tone="success">Eligible (15–18)</Badge> : <Badge tone="danger">Outside 15–18</Badge>}</>], ["Pathway preference", PATHWAY_LABEL[a.pathwayPref]], ["Screening score", a.score !== undefined ? `${a.score} / 100` : "Not scored yet"], ["Guardian", a.guardianName]]} />
      <div className="mt-4 rounded-lg bg-canvas p-3 text-[13px]"><p className="font-medium">Motivation</p><p className="mt-1 text-muted">“{a.motivation}”</p></div>
      <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted"><ShieldAlert className="size-3.5" /> Guardian consent is collected after admission; the account activates only when required consents are given.</p>
    </DialogContent>
  );
}

export default function Admissions() {
  const d = useData();
  const [sel, setSel] = useState<Applicant | null>(null);
  const pending = d.students.filter((s) => s.status === "Pending consent");
  return (
    <Workspace area="fb" title="Admissions" description="Applications → screening → interview → decision → guardian consent → enrolment. Drag cards between stages or open an application."
      aiActions={<AIAction label="Summarise this cycle" prompt="Summarise admissions this cycle" />}>
      <Board columns={STAGES} items={d.applicants} getColumn={(a) => a.stage} onMove={(a, to) => (to === "Admitted" ? admitApplicant(a.id) : moveApplicant(a.id, to as Applicant["stage"]))}
        renderCard={(a) => (
          <button onClick={() => setSel(a)} className="block w-full text-left">
            <p className="font-medium">{a.name}</p>
            <p className="text-[12px] text-muted">{a.age} · {PATHWAY_LABEL[a.pathwayPref]}</p>
            {a.score !== undefined && <Badge tone={a.score >= 75 ? "success" : a.score >= 60 ? "info" : "warning"} className="mt-1.5">Score {a.score}</Badge>}
          </button>
        )} />
      <Card>
        <CardHeader icon={<UserPlus />} title="Waiting for guardian consent" subtitle="Admitted students cannot sign in until required consents are recorded" />
        <CardBody className="space-y-2">
          {pending.length === 0 && <p className="text-[13px] text-muted">No students waiting.</p>}
          {pending.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3">
              <span className="flex-1"><Link to={`/future-builders/students/${s.id}`} className="font-medium hover:underline">{s.name}</Link><span className="block text-[12px] text-muted">Guardian: {s.guardianName} · consent link sent</span></span>
              <Badge tone="warning" dot>Account inactive</Badge>
              <Button size="sm" variant="secondary" onClick={() => recordConsent(s.id)}>Simulate guardian consent</Button>
            </div>
          ))}
        </CardBody>
      </Card>
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>{sel && <ApplicantDialog a={sel} onClose={() => setSel(null)} />}</Dialog>
    </Workspace>
  );
}
