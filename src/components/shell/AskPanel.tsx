import { useEffect, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { ArrowUp, Bot, Check, FileText, Loader2, Sparkles, X } from "lucide-react";
import { runScript, SUGGESTIONS, type AIRun } from "@/ai/scripts";
import { SheetContent } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDemo } from "@/store/demoStore";
import { useData, usePersona } from "@/store/hooks";
import { toast, useUI } from "@/store/uiStore";

interface Turn { id: number; prompt: string; run: AIRun; stepsDone: number; done: boolean; actionTaken?: boolean }

function useAskEngine() {
  const persona = usePersona();
  const data = useData();
  const addInbox = useDemo((s) => s.addInbox);
  const [turns, setTurns] = useState<Turn[]>([]);
  const counter = useRef(0);

  const ask = (prompt: string) => {
    const id = ++counter.current;
    const run = runScript(prompt, persona, data, useUI.getState().askContext);
    setTurns((t) => [...t, { id, prompt, run, stepsDone: 0, done: false }]);
    run.steps.forEach((_, i) => {
      window.setTimeout(() => setTurns((t) => t.map((x) => (x.id === id ? { ...x, stepsDone: i + 1 } : x))), 450 * (i + 1));
    });
    window.setTimeout(() => setTurns((t) => t.map((x) => (x.id === id ? { ...x, done: true } : x))), 450 * (run.steps.length + 1));
  };

  const takeAction = (turn: Turn) => {
    const a = turn.run.proposedAction;
    if (!a) return;
    const msg = a.apply();
    toast({ tone: "ai", title: "Done (simulated)", body: msg });
    addInbox({ toPersona: persona.id, kind: "task", title: `Review: ${a.label}`, detail: `Created from Ask CodeBrave · ${turn.run.agent}`, link: "/ask/runs", source: "Ask CodeBrave" });
    setTurns((t) => t.map((x) => (x.id === turn.id ? { ...x, actionTaken: true } : x)));
  };

  return { persona, turns, ask, takeAction };
}

function TurnView({ t, onAction }: { t: Turn; onAction: () => void }) {
  return (
    <div className="space-y-3">
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand-600 px-3.5 py-2 text-[13px] text-white">{t.prompt}</div>
      <div className="rounded-xl border border-line bg-surface p-3.5">
        <div className="mb-2 flex items-center gap-2 text-[12px] text-muted">
          <Bot className="size-3.5 text-ai-600" /> {t.run.agent}
          <Badge tone="ai" className="ml-auto">Simulated AI</Badge>
        </div>
        <ol className="space-y-1">
          {t.run.steps.map((s, i) => (
            <li key={s} className="flex items-center gap-2 text-[12px] text-muted">
              {i < t.stepsDone ? <Check className="size-3.5 text-emerald-600" /> : i === t.stepsDone ? <Loader2 className="size-3.5 animate-spin text-ai-500" /> : <span className="size-3.5 rounded-full border border-line-strong" />}
              {s}
            </li>
          ))}
        </ol>
        {t.done && (
          <div className="mt-3 animate-fade-in border-t border-line pt-3">
            <div className="space-y-1 text-[13px] leading-relaxed text-fg">{t.run.answer.map((line, i) => <p key={i}>{line}</p>)}</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {t.run.sources.map((s) => <span key={s} className="inline-flex items-center gap-1 rounded-md bg-canvas px-2 py-0.5 text-[11px] text-muted"><FileText className="size-3" />{s}</span>)}
            </div>
            {t.run.proposedAction && (
              <div className="mt-3 rounded-lg border border-dashed border-ai-200 bg-ai-50/50 p-2.5">
                <p className="text-[12px] text-ai-700">Proposed action: needs your confirmation</p>
                <Button size="sm" variant={t.actionTaken ? "secondary" : "primary"} className="mt-2" disabled={t.actionTaken} onClick={onAction}>
                  {t.actionTaken ? <><Check /> Done</> : t.run.proposedAction.label}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AskPanel() {
  const { askOpen, askContext, askPrompt, setAsk } = useUI();
  const { persona, turns, ask, takeAction } = useAskEngine();
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (askOpen && askPrompt) {
      useUI.setState({ askPrompt: undefined });
      ask(askPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [askOpen, askPrompt]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const suggestions = SUGGESTIONS[persona.role] ?? SUGGESTIONS.default;
  const first = persona.name.split(" ")[0];

  return (
    <Dialog.Root open={askOpen} onOpenChange={(o) => setAsk(o)}>
      <SheetContent title="Ask CodeBrave" className="max-w-[440px]">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-ai-600 text-white"><Sparkles className="size-4" /></span>
            <div>
              <p className="font-semibold leading-tight">Ask CodeBrave</p>
              <p className="text-[12px] text-muted">Works with {first}’s permissions only</p>
            </div>
          </div>
          <button onClick={() => setAsk(false)} className="rounded-md p-1.5 text-muted hover:bg-canvas" aria-label="Close"><X className="size-4" /></button>
        </div>
        {askContext && <div className="border-b border-line bg-ai-50/60 px-5 py-2 text-[12px] text-ai-700">Context: <span className="font-medium">{askContext}</span></div>}
        <div ref={scroller} className="flex-1 space-y-5 overflow-y-auto px-5 py-5 scrollbar-thin">
          {turns.length === 0 && (
            <div>
              <p className="text-[14px] text-fg">Hi {first}. You don’t need to write a prompt: pick a task or ask in your own words.</p>
              <div className="mt-4 space-y-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="flex w-full items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-left text-[13px] hover:border-ai-200 hover:bg-ai-50/50">
                    <Sparkles className="size-3.5 shrink-0 text-ai-500" /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {turns.map((t) => <TurnView key={t.id} t={t} onAction={() => takeAction(t)} />)}
        </div>
        <form className="border-t border-line p-3" onSubmit={(e) => { e.preventDefault(); if (input.trim()) { ask(input.trim()); setInput(""); } }}>
          <div className="flex items-center gap-2 rounded-xl border border-line-strong bg-surface px-3 py-1.5 focus-within:border-ai-500 focus-within:ring-2 focus-within:ring-ai-100">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask in your own words…" className="h-8 flex-1 bg-transparent text-sm outline-none" aria-label="Ask CodeBrave" />
            <Button type="submit" size="icon-sm" className="bg-ai-600 hover:bg-ai-700" aria-label="Send"><ArrowUp /></Button>
          </div>
          <p className="mt-1.5 text-center text-[11px] text-subtle">Simulated AI: scripted responses computed from the fictional records. Proposed actions run only after you confirm. Agents never see safeguarding records.</p>
        </form>
      </SheetContent>
    </Dialog.Root>
  );
}

export function AIAction({ label, prompt, context, size = "sm" }: { label: string; prompt?: string; context?: string; size?: "sm" | "md" }) {
  const setAsk = useUI((s) => s.setAsk);
  return (
    <Button variant="ai" size={size} onClick={() => setAsk(true, context, prompt ?? label)}>
      <Sparkles /> {label}
    </Button>
  );
}
