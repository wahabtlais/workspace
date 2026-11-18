import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Dialog } from "radix-ui";
import { ArrowUp, ChevronDown, Maximize2, Sparkles, X } from "lucide-react";
import { SheetContent, Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { AIMessage } from "@/ai/AIMessage";
import { useAI } from "@/ai/aiStore";
import { SUGGESTIONS } from "@/ai/scripts";
import { usePersona } from "@/store/hooks";
import { useUI } from "@/store/uiStore";

/** Contextual AI side panel. Shares conversations with the full AI Workspace. */
export function AskPanel() {
  const { askOpen, askContext, askPrompt, setAsk } = useUI();
  const persona = usePersona();
  const { conversations, create, ask, confirm, setAction } = useAI();
  const [convId, setConvId] = useState<string>();
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const nav = useNavigate();
  const conv = conversations.find((c) => c.id === convId && c.personaId === persona.id);
  const last = conv?.turns[conv.turns.length - 1];

  useEffect(() => {
    if (askOpen && askPrompt) {
      useUI.setState({ askPrompt: undefined });
      const id = create(askContext);
      setConvId(id);
      ask(id, askPrompt, [], askContext);
    } else if (askOpen && !conv) {
      setConvId(create(askContext));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [askOpen, askPrompt]);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [conv?.turns.length, last?.done]);

  const send = (text: string) => {
    let id = conv?.id;
    if (!id) { id = create(askContext); setConvId(id); }
    ask(id, text, [], askContext);
  };
  const suggestions = SUGGESTIONS[persona.role] ?? SUGGESTIONS.default;
  const first = persona.name.split(" ")[0];

  return (
    <Dialog.Root open={askOpen} onOpenChange={(o) => setAsk(o)}>
      <SheetContent title="AI assistant" className="max-w-[480px]">
        <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-ai-600 text-white"><Sparkles className="size-4" /></span>
            <div>
              <p className="font-semibold leading-tight">AI assistant</p>
              <p className="text-[12px] text-muted">Works with {first}’s permissions only</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => { setAsk(false); nav(conv && conv.turns.length ? `/ai?c=${conv.id}` : "/ai"); }}><Maximize2 /> Open in AI Workspace</Button>
            <button onClick={() => setAsk(false)} className="rounded-md p-1.5 text-muted hover:bg-canvas" aria-label="Close"><X className="size-4" /></button>
          </div>
        </div>
        {askContext && <div className="border-b border-line bg-ai-50/60 px-5 py-2 text-[12px] text-ai-700">Working on: <span className="font-medium">{askContext}</span></div>}
        <div ref={scroller} className="flex-1 space-y-5 overflow-y-auto px-5 py-5 scrollbar-thin">
          {(!conv || conv.turns.length === 0) && (
            <div>
              <p className="text-[14px] text-fg">Hi {first}. Pick a task or describe what you need in your own words.</p>
              <div className="mt-4 space-y-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="flex w-full items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-left text-[13px] hover:border-ai-200 hover:bg-ai-50/50">
                    <Sparkles className="size-3.5 shrink-0 text-ai-500" /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {conv?.turns.map((t) => <AIMessage key={t.id} compact t={t} onConfirm={() => confirm(conv.id, t)} onDismiss={() => setAction(conv.id, t.id, "dismissed")} onFollowUp={send} />)}
        </div>
        <form className="border-t border-line p-3" onSubmit={(e) => { e.preventDefault(); if (input.trim()) { send(input.trim()); setInput(""); } }}>
          <div className="flex items-center gap-2 rounded-xl border border-line-strong bg-surface px-3 py-1.5 focus-within:border-ai-500 focus-within:ring-2 focus-within:ring-ai-100">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask in your own words…" className="h-8 flex-1 bg-transparent text-sm outline-none" aria-label="Ask the AI assistant" />
            <Button type="submit" size="icon-sm" className="bg-ai-600 hover:bg-ai-700" aria-label="Send"><ArrowUp /></Button>
          </div>
          <p className="mt-1.5 text-center text-[11px] text-subtle">Simulated AI using the fictional records. Suggested changes run only after you confirm. AI never sees safeguarding records.</p>
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

/** Several AI actions relevant to the current page, in one menu. */
export function AIMenu({ label = "AI actions", context, items }: { label?: string; context?: string; items: { label: string; prompt?: string }[] }) {
  const setAsk = useUI((s) => s.setAsk);
  return (
    <Menu>
      <MenuTrigger asChild><Button variant="ai" size="sm"><Sparkles /> {label} <ChevronDown className="size-3.5" /></Button></MenuTrigger>
      <MenuContent className="w-72">
        <MenuLabel>{context ? `AI for ${context}` : "AI for this page"}</MenuLabel>
        {items.map((i) => <MenuItem key={i.label} onSelect={() => setAsk(true, context, i.prompt ?? i.label)}><Sparkles className="size-3.5 text-ai-500" /> {i.label}</MenuItem>)}
      </MenuContent>
    </Menu>
  );
}
