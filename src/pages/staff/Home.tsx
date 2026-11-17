import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import type { RoleKey } from "@/data/types";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInbox, usePersona } from "@/store/hooks";
import { useUI } from "@/store/uiStore";
import { DEMO_TODAY, formatDate } from "@/lib/utils";
import { ExecPanel, SuPmPanel, SuPoPanel, SuTrainerPanel } from "./home/panelsSU";
import { AtRiskCard, FbPmPanel, FbPoPanel } from "./home/panelsFB";
import { CurriculumPanel, FbTrainerPanel } from "./home/panelsLearning";
import { FundraisingPanel, OpsPanel } from "./home/panelsOrg";
import { AdminPanel, MePanel, SafeguardingPanel } from "./home/panelsOther";
import { ActivityFeed, InboxPreview } from "./home/widgets";

const PANELS: Partial<Record<RoleKey, () => ReactNode>> = {
  exec: ExecPanel, su_pm: SuPmPanel, su_po: SuPoPanel, su_trainer: SuTrainerPanel,
  fb_pm: FbPmPanel, fb_po: FbPoPanel, fb_trainer: FbTrainerPanel, curriculum: CurriculumPanel,
  ops_hr: OpsPanel, fundraising: FundraisingPanel, me: MePanel, admin: AdminPanel, safeguarding_lead: SafeguardingPanel,
};

export default function Home() {
  const persona = usePersona();
  const open = useInbox().filter((i) => i.status === "open");
  const setAsk = useUI((s) => s.setAsk);
  const Panel = PANELS[persona.role];
  const first = persona.name.split(" ")[0];
  return (
    <>
      <PageHeader
        title={`Good morning, ${first}`}
        description={`${formatDate(DEMO_TODAY, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · You have ${open.length} item${open.length === 1 ? "" : "s"} waiting in your Inbox.`}
        meta={<><Badge tone="outline">{persona.title}</Badge></>}
        actions={<Button variant="secondary" onClick={() => setAsk(true, "Home")}><Sparkles className="text-ai-600" /> What can AI do for me?</Button>}
      />
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">{Panel ? <Panel /> : null}</div>
        <div className="space-y-5">
          <InboxPreview />
          {persona.role === "fb_pm" && <AtRiskCard />}
          <ActivityFeed />
        </div>
      </div>
    </>
  );
}
