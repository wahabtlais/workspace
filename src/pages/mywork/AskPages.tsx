import { Bot, Sparkles } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/components/common/Workspace";
import { MiniTable } from "@/pages/staff/home/widgets";
import { SUGGESTIONS } from "@/ai/scripts";
import { useData, usePersona } from "@/store/hooks";
import { useUI } from "@/store/uiStore";
import { relativeDay } from "@/lib/utils";

const LIBRARY: { agent: string; tasks: string[]; roles: string[] }[] = [
  { agent: "Program Delivery Agent", tasks: ["Draft visit report for Cedar Hill", "Which schools haven’t been visited this month?", "Which students are at risk?", "Draft a coaching plan"], roles: ["su_pm", "su_po", "su_trainer", "fb_pm", "fb_po", "fb_trainer", "exec"] },
  { agent: "Curriculum Agent", tasks: ["Draft a lesson for an objective", "Summarise trainer feedback themes", "Draft a curriculum improvement report"], roles: ["curriculum", "su_trainer", "fb_trainer"] },
  { agent: "Reporting & Insights Agent", tasks: ["Draft the monthly management report", "Summarise pupil attendance this term", "Draft an indicator variance note"], roles: ["exec", "su_pm", "fb_pm", "fundraising", "me"] },
  { agent: "Fundraising Agent", tasks: ["Check eligibility for Girls in Tech Futures 2027", "Draft the semi-annual report for Northbridge"], roles: ["fundraising", "exec"] },
  { agent: "Operations & HR Agent", tasks: ["I need a laptop for the new trainer next week", "Summarise open requests by stage"], roles: ["*"] },
];

export function AskChat() {
  const p = usePersona();
  const setAsk = useUI((s) => s.setAsk);
  const sugg = SUGGESTIONS[p.role] ?? SUGGESTIONS.default;
  return (
    <Workspace area="ask" title="Ask CodeBrave" description="Answers and drafts using only what you are allowed to see. Nothing is submitted without your confirmation.">
      <Card className="bg-gradient-to-br from-ai-50 to-surface"><CardBody className="pt-6 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-ai-600 text-white"><Sparkles className="size-6" /></span>
        <p className="mt-3 text-[18px] font-semibold">What would you like help with, {p.name.split(" ")[0]}?</p>
        <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2">{sugg.map((s) => <Button key={s} variant="ai" size="sm" onClick={() => setAsk(true, "Ask CodeBrave", s)}>{s}</Button>)}</div>
        <Button className="mt-4 bg-ai-600 hover:bg-ai-700" onClick={() => setAsk(true)}>Open the assistant</Button>
      </CardBody></Card>
    </Workspace>
  );
}

export function TaskLibrary() {
  const p = usePersona();
  const setAsk = useUI((s) => s.setAsk);
  const mine = LIBRARY.filter((l) => l.roles.includes("*") || l.roles.includes(p.role));
  return (
    <Workspace area="ask" title="Task library" description="What each agent can do for your role. One click: no prompt writing needed.">
      <div className="grid gap-4 md:grid-cols-2">{mine.map((l) => <Card key={l.agent}><CardHeader icon={<Bot />} title={l.agent} /><CardBody className="space-y-2">{l.tasks.map((t) => <button key={t} onClick={() => setAsk(true, l.agent, t)} className="flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-left text-[13px] hover:border-ai-200 hover:bg-ai-50/50"><Sparkles className="size-3.5 text-ai-500" />{t}</button>)}</CardBody></Card>)}</div>
    </Workspace>
  );
}

export function MyRuns() {
  const d = useData();
  const p = usePersona();
  const runs = d.inbox.filter((i) => i.source === "Ask CodeBrave" && i.toPersona === p.id);
  const history = [["Summarised pupil attendance this term", "Reporting & Insights Agent", "2026-11-14", "Completed"], ["Drafted monthly report outline", "Reporting & Insights Agent", "2026-11-03", "Completed"], ["Pre-filled travel request", "Operations & HR Agent", "2026-10-28", "Confirmed by user"]];
  return (
    <Workspace area="ask" title="My runs" description="Delegated AI tasks: steps, sources and outcomes. Every run is traceable.">
      <Card><CardBody className="pt-4"><MiniTable head={["Task", "Agent", "When", "Outcome"]} rows={[...runs.map((r) => [r.title, r.detail.replace("Created from Ask CodeBrave · ", ""), relativeDay(r.createdAt), <Badge tone="ai">Proposed action created</Badge>]), ...history.map(([a, b, c, e]) => [a, b, relativeDay(c), <Badge tone="success">{e}</Badge>])]} /></CardBody></Card>
    </Workspace>
  );
}
