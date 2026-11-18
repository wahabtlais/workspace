import { Link, useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2, FlaskConical, Play, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/store/demoStore";
import { useGuide } from "./guideStore";
import { SCENARIOS } from "./scenarios";

const SIMULATED = [
  "All people, schools, pupils, donors and figures are fictional.",
  "There is no real backend, authentication or integration: data lives in this browser session.",
  "AI responses are scripted and computed from the fictional records; actions run only after confirmation.",
  "Offline mode is simulated with the toggle in the prototype bar.",
  "Indicators marked “Live” are calculated from records; anything marked “Illustrative” is a sample figure.",
];

export default function DemoCenter() {
  const navigate = useNavigate();
  const g = useGuide();
  const start = (id: string) => {
    const sc = SCENARIOS.find((s) => s.id === id)!;
    useDemo.getState().resetDemo();
    g.start(id);
    useDemo.getState().setPersona(sc.steps[0].persona);
    navigate(sc.steps[0].path);
  };
  return (
    <div className="min-h-[calc(100vh-40px)] bg-canvas">
      <div className="bg-ink-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <Link to="/" className="inline-flex items-center gap-1 text-[13px] text-white/60 hover:text-white"><ArrowLeft className="size-4" /> Back to the platform</Link>
          <h1 className="mt-3 flex items-center gap-3 text-[28px] font-semibold"><FlaskConical className="size-7 text-accent-400" /> Demo Center</h1>
          <p className="mt-2 max-w-3xl text-[15px] text-white/70">Eleven guided walkthroughs of the CodeBrave platform. Each one starts from a clean dataset, switches between the people involved, and only moves on when the real action has happened in the app.</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SCENARIOS.map((s, i) => {
            const done = g.completed.includes(s.id);
            return (
              <Card key={s.id} className="flex flex-col p-5">
                <div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-full bg-brand-50 text-[13px] font-semibold text-brand-700">{i + 1}</span>{done && <Badge tone="success"><CheckCircle2 /> Completed</Badge>}{g.scenarioId === s.id && <Badge tone="warning">In progress</Badge>}</div>
                <p className="mt-3 text-[17px] font-semibold">{s.title}</p>
                <p className="mt-1 flex-1 text-[13px] text-muted">{s.summary}</p>
                <p className="mt-3 flex items-center gap-1.5 text-[12px] text-subtle"><Users className="size-3.5" />{s.roles} · {s.steps.length} steps</p>
                <Button className="mt-4" onClick={() => start(s.id)}><Play /> Start (resets demo data)</Button>
              </Card>
            );
          })}
        </div>
        <Card className="p-5">
          <p className="font-semibold">What is simulated</p>
          <ul className="mt-2 space-y-1 text-[13px] text-muted">{SIMULATED.map((x) => <li key={x}>• {x}</li>)}</ul>
          <p className="mt-3 text-[13px] text-muted">Tip: the guide sits bottom-left. Use “Take me there” to switch persona and page, and “Reset demo” in the top bar between stakeholder sessions.</p>
        </Card>
      </div>
    </div>
  );
}
