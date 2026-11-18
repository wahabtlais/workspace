import { Link, useNavigate, useParams } from "react-router";
import type { TFStage } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { Workspace } from "@/components/common/Workspace";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Board } from "@/components/data/Board";
import { DataTable } from "@/components/data/DataTable";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData, useLookup } from "@/store/hooks";
import { formatDate } from "@/lib/utils";
import TFProfile from "./TFProfile";
import { Certification, Deployment, Training } from "./TFTabs";

const REC: TFStage[] = ["Applied", "Screening", "Interview", "Offer", "Onboarding"];
const TABS = ["recruitment", "onboarding", "training", "certification", "deployment", "directory"] as const;

export default function TeachingFellows() {
  const { sub } = useParams();
  const navigate = useNavigate();
  if (sub?.startsWith("tf-")) return <TFProfile id={sub} />;
  const tab = (TABS as readonly string[]).includes(sub ?? "") ? sub! : "recruitment";
  return (
    <Workspace area="su" title="Teaching Fellows" description="Recruitment → onboarding → training → certification → deployment → ongoing support, in one place.">
      <Tabs value={tab} onValueChange={(v) => navigate(`/school-upskilling/teaching-fellows/${v}`)}>
        <TabsList>{TABS.map((t) => <TabsTrigger key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</TabsTrigger>)}</TabsList>
        <TabsContent value="recruitment" className="mt-4"><Recruitment /></TabsContent>
        <TabsContent value="onboarding" className="mt-4"><Onboarding /></TabsContent>
        <TabsContent value="training" className="mt-4"><Training /></TabsContent>
        <TabsContent value="certification" className="mt-4"><Certification /></TabsContent>
        <TabsContent value="deployment" className="mt-4"><Deployment /></TabsContent>
        <TabsContent value="directory" className="mt-4"><Directory /></TabsContent>
      </Tabs>
    </Workspace>
  );
}

function Recruitment() {
  const d = useData();
  const update = useDemo((s) => s.update);
  const items = d.tfs.filter((t) => REC.includes(t.stage));
  return (
    <>
      <p className="mb-3 text-[13px] text-muted">TF Cohort 2027–28 · drag a card to move an applicant. The application form and scoring rubric come from the Assessment Hub.</p>
      <Board columns={REC} items={items} getColumn={(t) => t.stage}
        onMove={(t, to) => { update((x) => { const r = x.tfs.find((y) => y.id === t.id); if (r) r.stage = to as TFStage; }); toast({ tone: "success", title: `${t.name} moved to ${to}` }); }}
        renderCard={(t) => (
          <Link to={`/school-upskilling/teaching-fellows/${t.id}`} className="block">
            <p className="font-medium">{t.name}</p>
            <p className="text-[12px] text-muted">{t.background}</p>
            <p className="mt-1.5 text-[11px] text-subtle">Applied {formatDate(t.appliedAt)}</p>
          </Link>
        )} />
    </>
  );
}

function Onboarding() {
  const d = useData();
  const L = useLookup();
  const update = useDemo((s) => s.update);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {d.onboarding.map((o) => {
        const done = o.steps.filter((s) => s.done).length;
        return (
          <Card key={o.id}>
            <CardHeader title={o.personName} subtitle={`${o.kind} · starts ${formatDate(o.startDate, { day: "numeric", month: "short", year: "numeric" })}`} action={<Badge tone={done === o.steps.length ? "success" : "info"}>{done}/{o.steps.length}</Badge>} />
            <CardBody>
              <Progress value={(done / o.steps.length) * 100} className="mb-3" />
              <ul className="space-y-1">
                {o.steps.map((s, i) => (
                  <li key={s.label}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-canvas">
                      <input type="checkbox" checked={s.done} className="size-4 accent-brand-600" onChange={() => update((x) => { const st = x.onboarding.find((y) => y.id === o.id)!.steps[i]; st.done = !st.done; })} />
                      <span className="flex-1 text-[14px]">{s.label}</span><span className="text-[12px] text-muted">{L.person(s.owner)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}

function Directory() {
  const d = useData();
  const L = useLookup();
  return (
    <DataTable rows={d.tfs} search={(t) => `${t.name} ${t.background}`} rowLink={(t) => `/school-upskilling/teaching-fellows/${t.id}`}
      filters={[{ key: "stage", label: "Stage", options: ["Applied", "Screening", "Interview", "Offer", "Onboarding", "In training", "Certified", "Deployed", "Alumni"], get: (t) => t.stage }, { key: "c", label: "Cohort", options: d.tfCohorts.map((c) => c.name), get: (t) => d.tfCohorts.find((c) => c.id === t.cohortId)!.name }]}
      columns={[
        { key: "n", header: "Name", sort: (t) => t.name, cell: (t) => <span className="font-medium">{t.name}</span> },
        { key: "s", header: "Stage", sort: (t) => t.stage, cell: (t) => <StatusBadge status={t.stage} /> },
        { key: "c", header: "Cohort", cell: (t) => <span className="text-muted">{d.tfCohorts.find((c) => c.id === t.cohortId)?.name}</span>, hideOnMobile: true },
        { key: "b", header: "Background", cell: (t) => <span className="text-muted">{t.background}</span>, hideOnMobile: true },
        { key: "sch", header: "School", cell: (t) => (t.schoolId ? L.schools.get(t.schoolId)?.name : "—") },
      ]} />
  );
}
