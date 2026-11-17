import { useParams } from "react-router";
import { Check, Lock, ShieldCheck, X } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { KeyValue, Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AIAction } from "@/components/shell/AskPanel";
import { access } from "@/config/access";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { recordConsent } from "@/store/fbActions";
import { attendeeRate } from "@/lib/metrics";
import { PATHWAY_LABEL } from "@/data/seed/fb";
import { AttendanceTab, LearningTab, MentoringTab, ProjectsTab, SafeguardingTab } from "./StudentTabs";

const CONSENT_LABEL: Record<string, string> = { participation: "Participation", dataProcessing: "Data processing", media: "Photos & media", portfolioSharing: "Portfolio sharing", internshipSharing: "Sharing with internship hosts", aiAssistant: "Learning Assistant (AI)" };
const TABS = ["overview", "attendance", "learning", "projects", "consent", "mentoring", "safeguarding"];

export default function Student360() {
  const { id } = useParams();
  const d = useData();
  const L = useLookup();
  const persona = usePersona();
  const s = d.students.find((x) => x.id === id);
  if (!s) return <Workspace area="fb" title="Student not found"><p>Unknown student.</p></Workspace>;
  if (access(persona, "fb") === "aggregate") return <Workspace area="fb" title="Restricted"><Card className="p-8 text-center"><Lock className="mx-auto size-6 text-muted" /><p className="mt-3">Your role sees aggregated Future Builders data only.</p></Card></Workspace>;
  const regs = d.registers.filter((r) => r.kind === "fb");
  const team = d.teams.find((t) => t.id === s.teamId);
  const project = d.projects.find((p) => p.id === team?.projectId);
  const placement = d.placements.find((p) => p.studentId === s.id);
  return (
    <Workspace area="fb" hideSubnav title={s.name} description={`${PATHWAY_LABEL[s.pathway]} · ${d.fbCohorts.find((c) => c.id === s.cohortId)?.name} · age ${s.age}`}
      crumbs={[{ label: "Future Builders", to: "/future-builders" }, { label: "Students", to: "/future-builders/students" }, { label: s.name }]}
      meta={<StatusBadge status={s.status} />} aiActions={<AIAction label="Summarise recent activity" prompt="Which students are at risk?" context={s.name} />}>
      {s.status === "Pending consent" && (
        <Card className="flex flex-wrap items-center gap-3 border-amber-200 bg-amber-50/50 p-4">
          <ShieldCheck className="size-5 text-amber-700" /><span className="flex-1 text-[14px]"><b>Account inactive:</b> waiting for guardian consent from {s.guardianName}.</span>
          <Button size="sm" variant="secondary" onClick={() => recordConsent(s.id)}>Simulate guardian consent</Button>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-4">
        {[["Attendance", `${attendeeRate(regs, s.id)}%`], ["Career readiness", `${s.readiness}%`], ["Assignments graded", `${d.submissions.filter((x) => x.learnerId === s.id && x.status === "Returned").length}`], ["Portfolio items", `${d.portfolio.filter((p) => p.studentId === s.id).length}`]].map(([k, v]) => <Card key={k} className="p-4"><p className="text-[12px] text-muted">{k}</p><p className="text-[22px] font-semibold tabular">{v}</p></Card>)}
      </div>
      <Tabs defaultValue="overview">
        <TabsList>{TABS.map((t) => <TabsTrigger key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</TabsTrigger>)}</TabsList>
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card><CardBody className="pt-5"><KeyValue cols={3} items={[["Team", team?.name ?? "—"], ["Mentor", L.person(s.mentorId)], ["Guardian", s.guardianName], ["Project", project?.title ?? "—"], ["Internship", placement ? `${d.openings.find((o) => o.id === placement.openingId)?.title} · ${placement.stage}` : "—"], ["Cohort", d.fbCohorts.find((c) => c.id === s.cohortId)?.name]]} /></CardBody></Card>
          <Card><CardHeader title="Competencies" subtitle="0 = not yet · 4 = strong" /><CardBody className="grid gap-3 sm:grid-cols-2">{d.competencies.map((c) => <div key={c.id} className="flex items-center gap-3 text-[13px]"><span className="w-40">{c.name}</span><Progress value={((s.competencies[c.id] ?? 0) / 4) * 100} className="flex-1" /><span className="tabular">{s.competencies[c.id] ?? 0}/4</span></div>)}</CardBody></Card>
        </TabsContent>
        <TabsContent value="attendance" className="mt-4"><AttendanceTab s={s} /></TabsContent>
        <TabsContent value="learning" className="mt-4"><LearningTab s={s} /></TabsContent>
        <TabsContent value="projects" className="mt-4"><ProjectsTab s={s} /></TabsContent>
        <TabsContent value="consent" className="mt-4"><Card><CardHeader title="Consents" subtitle="Checked by the platform before anything leaves the internal boundary" /><CardBody className="grid gap-2 sm:grid-cols-2">{Object.entries(s.consent).map(([k, v]) => <div key={k} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-[13px]"><span>{CONSENT_LABEL[k]}</span>{v ? <Badge tone="success"><Check /> Given</Badge> : <Badge tone="neutral"><X /> Not given</Badge>}</div>)}</CardBody></Card></TabsContent>
        <TabsContent value="mentoring" className="mt-4"><MentoringTab s={s} /></TabsContent>
        <TabsContent value="safeguarding" className="mt-4"><SafeguardingTab allowed={persona.role === "safeguarding_lead"} /></TabsContent>
      </Tabs>
    </Workspace>
  );
}
