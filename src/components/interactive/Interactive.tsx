import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, FlaskConical, GripVertical, Layers, MousePointerClick, Puzzle, RotateCcw, Sparkles, Swords, Waypoints } from "lucide-react";
import type { DemoData } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/store/demoStore";
import { toast } from "@/store/uiStore";
import { useData, usePersona } from "@/store/hooks";
import { cn, DEMO_TODAY } from "@/lib/utils";

export const FORMATS = [
  { id: "drag", icon: Puzzle, title: "Drag-and-drop activity", body: "Learners put the steps of a concept in the right order.", ready: true },
  { id: "sim", icon: MousePointerClick, title: "Interactive simulation", body: "Learners change inputs and watch what happens.", ready: false },
  { id: "challenge", icon: Swords, title: "Concept challenge", body: "Short scenario questions with instant explanations.", ready: false },
  { id: "experiment", icon: FlaskConical, title: "Virtual experiment", body: "Try a hypothesis safely and compare results.", ready: false },
  { id: "scenario", icon: Waypoints, title: "Scenario-based learning", body: "Branching story where choices have consequences.", ready: false },
] as const;

/** The one working example: “How the web works” as an ordering activity. */
const STEPS = [
  { id: "type", text: "You type an address (e.g. bakery.example) in the browser", why: "Everything starts with a request from the browser." },
  { id: "dns", text: "DNS looks up the server’s IP address", why: "Names are for people; computers need a numeric address." },
  { id: "req", text: "The browser sends an HTTP request to the server", why: "It asks the server for the page." },
  { id: "server", text: "The server finds the page and sends a response", why: "The response contains HTML, CSS and JavaScript." },
  { id: "render", text: "The browser renders the page on your screen", why: "It turns the code into what you see." },
];

export function interactiveFor(d: DemoData, curriculumId: string, lessonTitle: string) {
  return d.interactives.find((x) => x.curriculumId === curriculumId && x.lessonTitle === lessonTitle);
}

export function WebJourneyActivity() {
  const shuffled = useMemo(() => [STEPS[3], STEPS[0], STEPS[4], STEPS[1], STEPS[2]], []);
  const [order, setOrder] = useState(shuffled);
  const [drag, setDrag] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const move = (from: number, to: number) => { if (to < 0 || to >= order.length) return; const o = [...order]; const [x] = o.splice(from, 1); o.splice(to, 0, x); setOrder(o); setChecked(false); };
  const correct = order.filter((s, i) => s.id === STEPS[i].id).length;
  const done = checked && correct === STEPS.length;
  return (
    <div className="space-y-3">
      <p className="text-[13.5px]"><b>What happens when you open a website?</b> Drag the steps into the right order (or use the arrows), then check.</p>
      <ol className="space-y-1.5">
        {order.map((s, i) => {
          const ok = checked && s.id === STEPS[i].id;
          return (
            <li key={s.id} draggable onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}
              className={cn("flex items-center gap-2 rounded-lg border bg-surface px-2.5 py-2 text-[13px]", checked ? (ok ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50") : "border-line", drag === i && "opacity-50")}>
              <GripVertical className="size-4 shrink-0 cursor-grab text-subtle" />
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-canvas text-[12px] font-semibold">{i + 1}</span>
              <span className="flex-1">{s.text}{done && <span className="block text-[12px] text-emerald-800">{s.why}</span>}</span>
              <button aria-label={`Move “${s.text}” up`} onClick={() => move(i, i - 1)} className="rounded p-1 text-muted hover:bg-canvas"><ArrowUp className="size-3.5" /></button>
              <button aria-label={`Move “${s.text}” down`} onClick={() => move(i, i + 1)} className="rounded p-1 text-muted hover:bg-canvas"><ArrowDown className="size-3.5" /></button>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => setChecked(true)}><Check /> Check my order</Button>
        <Button size="sm" variant="ghost" onClick={() => { setOrder(shuffled); setChecked(false); }}><RotateCcw /> Start again</Button>
        {checked && (done ? <Badge tone="success" dot>All correct: you’ve traced a full web request</Badge> : <Badge tone="warning" dot>{correct} of {STEPS.length} in the right place. Hint: names must become numbers first.</Badge>)}
      </div>
    </div>
  );
}

/** Lesson-page panel: choose a format, let AI generate it (simulated), preview and publish. */
export function InteractiveDesigner({ curriculumId, lessonTitle }: { curriculumId: string; lessonTitle: string }) {
  const d = useData();
  const p = usePersona();
  const rec = interactiveFor(d, curriculumId, lessonTitle);
  const [format, setFormat] = useState<string>(rec?.format ?? "drag");
  const [generating, setGenerating] = useState(false);
  const supported = lessonTitle === "How the web works";
  const owner = p.role === "curriculum";
  const save = (status: "draft" | "published") => useDemo.getState().update((x) => {
    const i = x.interactives.findIndex((r) => r.curriculumId === curriculumId && r.lessonTitle === lessonTitle);
    const r = { curriculumId, lessonTitle, format, status, updatedAt: DEMO_TODAY };
    if (i >= 0) x.interactives[i] = r; else x.interactives.push(r);
  });
  const generate = () => { setGenerating(true); window.setTimeout(() => { save("draft"); setGenerating(false); toast({ tone: "ai", title: "Interactive draft ready (simulated AI)", body: "Preview it, then publish when you are happy." }); }, 1400); };
  const publish = () => { save("published"); useDemo.getState().notify({ toPersona: "p-student", text: `New interactive activity: ${lessonTitle}`, link: "/student/learning", tone: "success" }); toast({ tone: "success", title: "Published to the Learning Hub", body: "Students in the pathway see it on the lesson." }); };
  return (
    <Card className="border-ai-200">
      <CardHeader icon={<Layers className="text-ai-600" />} title="Interactive learning experience" subtitle="Optional format for theoretical concepts. AI turns the lesson content into an activity; a person reviews and publishes it." action={<Badge tone="warning">Proposed capability · simulated</Badge>} />
      <CardBody className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {FORMATS.map((f) => (
            <button key={f.id} disabled={!owner} onClick={() => setFormat(f.id)} className={cn("rounded-xl border p-3 text-left text-[12.5px]", format === f.id ? "border-ai-400 bg-ai-50 ring-1 ring-ai-200" : "border-line hover:border-ai-200", !owner && "cursor-default")}>
              <f.icon className="size-4 text-ai-700" /><span className="mt-1.5 block text-[13px] font-semibold">{f.title}</span><span className="block text-muted">{f.body}</span>
              {!f.ready && <span className="mt-1 block text-[11px] text-subtle">Concept only in the prototype</span>}
            </button>
          ))}
        </div>
        {!supported ? <p className="text-[13px] text-muted">In the prototype, a working example exists for “How the web works” (Web Development pathway). Open that lesson to try it.</p>
          : format !== "drag" ? <p className="text-[13px] text-muted">This format is shown as a proposal only. Choose “Drag-and-drop activity” to see the working example.</p>
            : !rec ? (owner ? <Button className="bg-ai-600 hover:bg-ai-700" disabled={generating} onClick={generate}><Sparkles /> {generating ? "Generating from the lesson plan…" : "Generate with AI"}</Button> : <p className="text-[13px] text-muted">Not created yet. The Curriculum Manager can generate one.</p>)
              : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2"><Badge tone={rec.status === "published" ? "success" : "neutral"} dot>{rec.status === "published" ? "Published to the Learning Hub" : "Draft · preview below"}</Badge>{owner && rec.status === "draft" && <Button size="sm" onClick={publish}>Publish to Learning Hub</Button>}</div>
                  <div className="rounded-xl border border-line bg-canvas/50 p-4"><WebJourneyActivity /></div>
                  <p className="text-[12px] text-muted">Generated from the lesson objective and activities (simulated). Published as an add-on to the lesson; the approved lesson version itself is unchanged.</p>
                </div>
              )}
      </CardBody>
    </Card>
  );
}
