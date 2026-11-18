import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Loader2, MapPin, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPersona } from "@/config/personas";
import { useDemo } from "@/store/demoStore";
import { cn } from "@/lib/utils";
import { useGuide } from "./guideStore";
import { SCENARIOS } from "./scenarios";

/** Floating presenter guide: shows the current step, takes you there, and detects completion from the shared data. */
export function GuidePanel() {
  const g = useGuide();
  const data = useDemo((s) => s.data);
  const offline = useDemo((s) => s.offline);
  const queue = useDemo((s) => s.syncQueue.length);
  const personaId = useDemo((s) => s.personaId);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [seen, setSeen] = useState<Record<string, boolean>>({});
  const sc = SCENARIOS.find((s) => s.id === g.scenarioId);
  if (!sc) return null;
  const step = sc.steps[g.step];
  const key = `${sc.id}-${g.step}`;
  const done = step.check ? step.check(data, { offline, queue }) : !!seen[key];
  const last = g.step === sc.steps.length - 1;
  const here = personaId === step.persona && pathname === step.path;
  const persona = getPersona(step.persona);
  const go = () => { useDemo.getState().setPersona(step.persona); navigate(step.path); };
  const instruction = typeof step.instruction === "function" ? step.instruction(data) : step.instruction;
  const allDone = last && done;

  return (
    <div className="fixed bottom-4 left-4 z-[65] w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 text-white shadow-pop" role="region" aria-label="Demo guide">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className="rounded bg-accent-400 px-1.5 text-[10px] font-bold uppercase text-ink-950">Demo</span>
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold">{sc.title}</p>
        <span className="text-[11px] text-white/60 tabular">{g.step + 1}/{sc.steps.length}</span>
        <button onClick={() => g.setMinimized(!g.minimized)} className="rounded p-1 text-white/70 hover:bg-white/10" aria-label={g.minimized ? "Expand guide" : "Minimize guide"}>{g.minimized ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}</button>
        <button onClick={() => { g.exit(); navigate("/demo"); }} className="rounded p-1 text-white/70 hover:bg-white/10" aria-label="Exit scenario"><X className="size-4" /></button>
      </div>
      <div className="flex h-1 gap-0.5 px-4">{sc.steps.map((_, i) => <span key={i} className={cn("flex-1 rounded-full", i < g.step || (i === g.step && done) ? "bg-emerald-400" : i === g.step ? "bg-accent-400" : "bg-white/15")} />)}</div>
      {!g.minimized && (
        <div className="space-y-3 p-4 pt-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/50">Step {g.step + 1} · as {persona.name} ({persona.title})</p>
            <p className="mt-0.5 text-[15px] font-semibold">{step.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-white/80">{instruction}</p>
          </div>
          {!here && <Button size="sm" className="w-full bg-white text-ink-900 hover:bg-white/90" onClick={go}><MapPin /> Take me there{personaId !== step.persona ? ` as ${persona.name.split(" ")[0]}` : ""}</Button>}
          <div className={cn("rounded-lg px-3 py-2 text-[12px]", done ? "bg-emerald-500/15 text-emerald-200" : "bg-white/5 text-white/60")}>
            {done ? <span className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0" />{step.outcome}</span> : step.check ? <span className="flex items-center gap-2"><Loader2 className="size-3.5 animate-spin" />Waiting for this action in the app…</span> : <button className="underline" onClick={() => setSeen((s) => ({ ...s, [key]: true }))}>I’ve seen this, mark the step done</button>}
          </div>
          {allDone ? (
            <div className="rounded-lg bg-accent-400/15 p-3 text-[13px]"><p className="flex items-center gap-2 font-semibold text-accent-400"><Trophy className="size-4" />Scenario complete</p><p className="mt-1 text-white/70">{sc.summary}</p><Button size="sm" className="mt-2 w-full" onClick={() => { g.finish(); g.exit(); navigate("/demo"); }}>Back to the Demo Center</Button></div>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="text-white/70 hover:bg-white/10 hover:text-white" disabled={g.step === 0} onClick={() => g.setStep(g.step - 1)}><ArrowLeft /> Back</Button>
              <Button size="sm" className="ms-auto" variant={done ? "primary" : "ghost"} onClick={() => { const n = g.step + 1; g.setStep(n); const ns = sc.steps[n]; useDemo.getState().setPersona(ns.persona); navigate(ns.path); }}>{done ? "Next step" : "Skip"} <ArrowRight /></Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
