import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { ArrowUp, BarChart3, FileSearch, Languages, Lightbulb, ListChecks, Mail, MessageSquarePlus, Paperclip, Presentation, ShieldCheck, Sparkles, Trash2, Upload, X, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/overlay";
import { Workspace } from "@/components/common/Workspace";
import { AIMessage } from "@/ai/AIMessage";
import { useAI } from "@/ai/aiStore";
import { SAMPLE_FILES } from "@/ai/files";
import { discoveries } from "@/ai/discovery";
import { kindFromName, SUPPORTED_TYPES, type Attachment } from "@/ai/types";
import { useData, usePersona } from "@/store/hooks";
import { cn, uid } from "@/lib/utils";

export const CAPABILITIES = [
  { icon: BarChart3, title: "Analyze data", body: "Find trends and anomalies in Excel or CSV files", prompt: "Analyze this spreadsheet for trends and anomalies", file: "expenses" },
  { icon: Mail, title: "Write emails & letters", body: "Professional drafts from one sentence", prompt: "Draft an email to a school principal asking to meet about Term 1 progress" },
  { icon: Presentation, title: "Create presentations", body: "Slide outlines and speaker notes", prompt: "Create a board presentation outline for December" },
  { icon: FileText, title: "Summarize documents & meetings", body: "Decisions, actions and owners", prompt: "Summarize these meeting notes", file: "notes" },
  { icon: Languages, title: "Translate & rewrite", body: "Arabic ⇄ English, simpler or more formal", prompt: "Translate this letter into Arabic", file: "parents" },
  { icon: Lightbulb, title: "Research & brainstorm", body: "Ideas, options and risks", prompt: "Brainstorm ideas for engaging parents in the digital skills program" },
  { icon: FileSearch, title: "Extract information", body: "Dates, amounts and criteria from long documents", prompt: "Extract the key dates, amounts and criteria", file: "call" },
  { icon: ListChecks, title: "Plan & organize", body: "Turn your tasks into a plan", prompt: "Help me plan my week" },
];

export const sampleFiles = (id?: string) => (id ? SAMPLE_FILES.filter((f) => f.sampleId === id) : []);

function Composer({ onSend, autoFocus }: { onSend: (text: string, files: Attachment[]) => void; autoFocus?: boolean }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const send = () => { if (!text.trim() && !files.length) return; onSend(text.trim() || "Analyze this file", files); setText(""); setFiles([]); };
  const add = (f: Attachment) => { setFiles((x) => (x.some((y) => y.name === f.name) ? x : [...x, f])); setOpen(false); };
  return (
    <div className="border-t border-line bg-surface p-3">
      {files.length > 0 && <div className="mb-2 flex flex-wrap gap-1.5">{files.map((f) => <span key={f.id} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-canvas px-2 py-1 text-[12px]"><Paperclip className="size-3 text-muted" />{f.name}<span className="text-subtle">{f.size}</span><button aria-label={`Remove ${f.name}`} onClick={() => setFiles((x) => x.filter((y) => y.id !== f.id))}><X className="size-3" /></button></span>)}</div>}
      <div className="flex items-end gap-2 rounded-xl border border-line-strong bg-surface px-2 py-1.5 focus-within:border-ai-500 focus-within:ring-2 focus-within:ring-ai-100">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild><Button size="icon-sm" variant="ghost" aria-label="Attach a file"><Paperclip /></Button></PopoverTrigger>
          <PopoverContent align="start" className="w-80 p-2">
            <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">Sample files (fictional)</p>
            {SAMPLE_FILES.map((f) => <button key={f.id} onClick={() => add(f)} className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-canvas"><FileText className="mt-0.5 size-4 text-muted" /><span className="min-w-0"><span className="block truncate text-[12.5px] font-medium">{f.name}</span><span className="block text-[11.5px] text-muted">{f.description} · {f.size}</span></span></button>)}
            <div className="mt-1 border-t border-line pt-1">
              <button onClick={() => input.current?.click()} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] hover:bg-canvas"><Upload className="size-4 text-muted" /> Upload from this device</button>
              <p className="px-2 pb-1 text-[11px] text-subtle">Excel, CSV, Word, PDF, PowerPoint, text and images, up to 25 MB. Simulated: uploaded files are not read in the prototype.</p>
            </div>
          </PopoverContent>
        </Popover>
        <input ref={input} type="file" accept={SUPPORTED_TYPES} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) add({ id: uid("file"), name: f.name, kind: kindFromName(f.name), size: `${Math.max(1, Math.round(f.size / 1024))} KB` }); e.target.value = ""; }} />
        <textarea autoFocus={autoFocus} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder="Ask for anything you need for your work…" aria-label="Message the AI assistant" className="max-h-40 min-h-9 flex-1 resize-none bg-transparent py-2 text-[14px] outline-none" />
        <Button size="icon-sm" className="mb-0.5 bg-ai-600 hover:bg-ai-700" aria-label="Send" onClick={send}><ArrowUp /></Button>
      </div>
      <p className="mt-1.5 text-center text-[11px] text-subtle">Simulated AI with fictional data. It uses only what you are allowed to see, never safeguarding records, and changes nothing without your confirmation.</p>
    </div>
  );
}

function Welcome({ onAsk }: { onAsk: (prompt: string, files: Attachment[]) => void }) {
  const p = usePersona();
  const d = useData();
  const found = discoveries(p, d).filter((x) => x.fromData).slice(0, 2);
  return (
    <div className="mx-auto max-w-3xl px-2 py-6">
      <div className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-ai-600 text-white"><Sparkles className="size-6" /></span>
        <h2 className="mt-3 text-[22px] font-semibold">What can I help you with, {p.name.split(" ")[0]}?</h2>
        <p className="mt-1 text-[14px] text-muted">Any work task: analysis, writing, planning, translation. Just describe it the way you would to a colleague.</p>
      </div>
      <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {CAPABILITIES.map((c) => (
          <button key={c.title} onClick={() => onAsk(c.prompt, sampleFiles(c.file))} className="group flex items-start gap-3 rounded-xl border border-line bg-surface p-3 text-left transition hover:border-ai-200 hover:bg-ai-50/40">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ai-50 text-ai-700"><c.icon className="size-4" /></span>
            <span className="min-w-0"><span className="block text-[13.5px] font-semibold">{c.title}</span><span className="block text-[12.5px] text-muted">{c.body}</span><span className="mt-1 block truncate text-[12px] text-ai-700 group-hover:underline">Try: “{c.prompt}”{c.file ? " + sample file" : ""}</span></span>
          </button>
        ))}
      </div>
      {found.length > 0 && (
        <div className="mt-6 rounded-xl border border-ai-200 bg-ai-50/40 p-4">
          <div className="flex items-center justify-between gap-2"><p className="text-[13px] font-semibold text-ai-900">Found in your work</p><Link to="/ai/discover" className="text-[12.5px] text-ai-700 hover:underline">See all suggestions</Link></div>
          <div className="mt-2 space-y-2">{found.map((x) => <button key={x.id} onClick={() => onAsk(x.prompt, sampleFiles(x.file))} className="block w-full rounded-lg bg-surface p-3 text-left text-[13px] hover:ring-1 hover:ring-ai-200"><span className="font-medium">{x.title}</span><span className="mt-0.5 block text-[12.5px] text-muted">{x.why}</span></button>)}</div>
        </div>
      )}
    </div>
  );
}

export default function AIWorkspace() {
  const persona = usePersona();
  const { conversations, ensureSeeded, create, ask, confirm, setAction, remove } = useAI();
  const [params, setParams] = useSearchParams();
  const loc = useLocation();
  const nav = useNavigate();
  const scroller = useRef<HTMLDivElement>(null);
  const mine = conversations.filter((c) => c.personaId === persona.id);
  const activeId = params.get("c") ?? undefined;
  const active = mine.find((c) => c.id === activeId);
  const last = active?.turns[active.turns.length - 1];

  useEffect(() => { ensureSeeded(persona); }, [persona, ensureSeeded]);

  // Arriving with a task (from Discovery, a capability card or a contextual action).
  useEffect(() => {
    const st = loc.state as { prompt?: string; file?: string; context?: string } | null;
    if (st?.prompt) {
      const id = create(st.context);
      ask(id, st.prompt, sampleFiles(st.file), st.context);
      nav(`/ai?c=${id}`, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.state]);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [active?.turns.length, last?.done]);

  const send = (text: string, files: Attachment[]) => {
    let id = active?.id;
    if (!id) { id = create(); setParams({ c: id }); }
    ask(id, text, files, active?.context);
  };

  return (
    <Workspace area="ask" title="AI Workspace" description="Your secure assistant for any work task. It works with your permissions, explains its answers and never changes records without you."
      actions={<Button variant="secondary" onClick={() => setParams({})}><MessageSquarePlus /> New conversation</Button>}
      meta={<Badge tone="ai">Simulated AI</Badge>}>
      <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <Card className="p-2">
            <p className="px-2 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">Conversations</p>
            <button onClick={() => setParams({})} className={cn("flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px]", !active ? "bg-ai-50 font-medium text-ai-800" : "hover:bg-canvas")}><MessageSquarePlus className="size-4" /> New conversation</button>
            <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
              {mine.map((c) => (
                <div key={c.id} className={cn("group flex items-center gap-1 rounded-md", c.id === activeId ? "bg-canvas" : "hover:bg-canvas")}>
                  <button onClick={() => setParams({ c: c.id })} className="min-w-0 flex-1 px-2 py-2 text-left"><span className={cn("block truncate text-[13px]", c.id === activeId && "font-medium")}>{c.title}</span><span className="block text-[11px] text-subtle">{c.createdAt}{c.context ? ` · ${c.context}` : ""}</span></button>
                  <button onClick={() => { remove(c.id); if (c.id === activeId) setParams({}); }} aria-label={`Delete ${c.title}`} className="mr-1 rounded p-1 text-subtle opacity-0 hover:text-red-600 group-hover:opacity-100 focus:opacity-100"><Trash2 className="size-3.5" /></button>
                </div>
              ))}
            </div>
          </Card>
          <Link to="/ai/trust" className="block rounded-xl border border-line bg-surface p-3 hover:border-ai-200">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold"><ShieldCheck className="size-4 text-ai-600" /> Secure by design</p>
            <p className="mt-1 text-[12px] text-muted">Uses only what {persona.name.split(" ")[0]} can see. Every answer is logged. See what AI can use →</p>
          </Link>
          <Link to="/ai/discover" className="block rounded-xl border border-line bg-surface p-3 hover:border-ai-200">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold"><Lightbulb className="size-4 text-ai-600" /> Discover</p>
            <p className="mt-1 text-[12px] text-muted">Ideas picked for your role and your current work →</p>
          </Link>
        </aside>
        <Card className="flex flex-col overflow-hidden">
          <div ref={scroller} className="flex-1 space-y-6 overflow-y-auto p-4 scrollbar-thin sm:p-5" style={{ height: "calc(100vh - 330px)", minHeight: 460 }}>
            {!active || active.turns.length === 0 ? <Welcome onAsk={send} /> : active.turns.map((t) => (
              <AIMessage key={t.id} t={t} onConfirm={() => confirm(active.id, t)} onDismiss={() => setAction(active.id, t.id, "dismissed")} onFollowUp={(f) => ask(active.id, f, [], active.context)} />
            ))}
          </div>
          <Composer onSend={send} autoFocus />
        </Card>
      </div>
    </Workspace>
  );
}
