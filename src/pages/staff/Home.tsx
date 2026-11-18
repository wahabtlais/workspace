import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import type { RoleKey } from "@/data/types";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInbox, usePersona } from "@/store/hooks";
import { DEMO_TODAY, formatDate } from "@/lib/utils";
import { SuPmPanel, SuPoPanel, SuTrainerPanel } from "./home/panelsSU";
import { AtRiskCard, FbPmPanel, FbPoPanel } from "./home/panelsFB";
import { CurriculumPanel, FbTrainerPanel } from "./home/panelsLearning";
import { FundraisingPanel, OpsPanel } from "./home/panelsOrg";
import { AdminPanel, MePanel, SafeguardingPanel } from "./home/panelsOther";
import { ActivityFeed, InboxPreview } from "./home/widgets";
import { ExecCockpit } from "@/pages/exec/Cockpit";
import { DiscoveryCard } from "@/pages/ai/AIPages";
import { discoveries } from "@/ai/discovery";
import { useData } from "@/store/hooks";
import { Link } from "react-router";

const PANELS: Partial<Record<RoleKey, () => ReactNode>> = {
  exec: () => <ExecCockpit />, su_pm: SuPmPanel, su_po: SuPoPanel, su_trainer: SuTrainerPanel,
  fb_pm: FbPmPanel, fb_po: FbPoPanel, fb_trainer: FbTrainerPanel, curriculum: CurriculumPanel,
  ops_hr: OpsPanel, fundraising: FundraisingPanel, me: MePanel, admin: AdminPanel, safeguarding_lead: SafeguardingPanel,
};

export default function Home() {
  const persona = usePersona();
  const open = useInbox().filter((i) => i.status === "open");
  const d = useData();
  const found = persona.role === "exec" ? [] : discoveries(persona, d).slice(0, 2);
  const Panel = PANELS[persona.role];
  const first = persona.name.split(" ")[0];
  return (
    <>
      <PageHeader
        title={`Good morning, ${first}`}
        description={`${formatDate(DEMO_TODAY, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · You have ${open.length} item${open.length === 1 ? "" : "s"} waiting in your Inbox.`}
        meta={<><Badge tone="outline">{persona.title}</Badge></>}
        actions={<Button asChild variant="secondary"><Link to="/ai/discover"><Sparkles className="text-ai-600" /> What can AI do for me?</Link></Button>}
      />
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          {found.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-end justify-between gap-2"><h2 className="flex items-center gap-1.5 text-[15px] font-semibold"><Sparkles className="size-4 text-ai-600" /> AI found something useful in your work</h2><Link to="/ai/discover" className="shrink-0 text-[13px] text-ai-700 hover:underline">Discover more</Link></div>
              <div className="grid gap-3 md:grid-cols-2">{found.map((x) => <DiscoveryCard key={x.id} x={x} />)}</div>
            </section>
          )}
          {Panel ? <Panel /> : null}
        </div>
        <div className="space-y-5">
          <InboxPreview />
          {persona.role === "fb_pm" && <AtRiskCard />}
          <ActivityFeed />
        </div>
      </div>
    </>
  );
}
