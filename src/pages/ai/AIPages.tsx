import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { BarChart3, Bot, Check, ClipboardList, EyeOff, FileText, Lightbulb, Lock, Presentation, ScrollText, ShieldCheck, Sparkles, UserCheck, Workflow, X } from "lucide-react";
import type { DataClass } from "@/data/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/components/common/Workspace";
import { EmptyState } from "@/components/common/EmptyState";
import { MiniTable } from "@/pages/staff/home/widgets";
import { discoveries, ROLE_CAPABILITIES, type Discovery, type DiscoveryKind } from "@/ai/discovery";
import { useData, usePersona } from "@/store/hooks";
import { formatDate } from "@/lib/utils";

const KIND_ICON: Record<DiscoveryKind, typeof BarChart3> = { Analysis: BarChart3, Report: FileText, Presentation, Chart: BarChart3, Document: FileText, Automation: Workflow, Email: FileText };

export function useTryAI() {
  const nav = useNavigate();
  return (x: { prompt: string; file?: string; context?: string }) => nav("/ai", { state: { prompt: x.prompt, file: x.file, context: x.context } });
}

export function DiscoveryCard({ x, onDismiss }: { x: Discovery; onDismiss?: () => void }) {
  const tryIt = useTryAI();
  const Icon = KIND_ICON[x.kind];
  return (
    <Card className="flex flex-col p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ai-50 text-ai-700"><Icon className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5"><Badge tone="ai">{x.kind}</Badge>{x.fromData && <Badge tone="outline">Found in your work</Badge>}</div>
          <p className="mt-1.5 font-semibold leading-snug">{x.title}</p>
        </div>
      </div>
      <p className="mt-2 text-[13px] text-muted"><span className="font-medium text-fg">Why this is relevant: </span>{x.why}</p>
      {x.evidence.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{x.evidence.map((e) => <span key={e} className="rounded-md bg-canvas px-2 py-0.5 text-[11.5px] text-muted">{e}</span>)}</div>}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
        <Button size="sm" className="bg-ai-600 hover:bg-ai-700" onClick={() => tryIt(x)}><Sparkles /> Try it</Button>
        {x.link && <Button asChild size="sm" variant="secondary"><Link to={x.link.to}>{x.link.label}</Link></Button>}
        {onDismiss && <Button size="sm" variant="ghost" className="ml-auto" onClick={onDismiss}><X /> Not useful</Button>}
      </div>
    </Card>
  );
}

const CREATE: { kind: DiscoveryKind; title: string; body: string; prompt: string; file?: string }[] = [
  { kind: "Report", title: "Reports", body: "Management notes, donor reports, school summaries", prompt: "Draft the monthly management report" },
  { kind: "Presentation", title: "Presentations", body: "Slide outlines with speaker notes", prompt: "Create a board presentation outline for December" },
  { kind: "Chart", title: "Charts", body: "Turn a spreadsheet into a clear chart", prompt: "Analyze this spreadsheet for trends and anomalies", file: "expenses" },
  { kind: "Analysis", title: "Analyses", body: "Survey themes, trends, anomalies", prompt: "Analyze this survey and summarise the themes", file: "survey" },
  { kind: "Document", title: "Documents", body: "Letters, translations, briefs", prompt: "Translate this letter into Arabic", file: "parents" },
  { kind: "Automation", title: "Automations", body: "Hand over repetitive work", prompt: "Which of my tasks could AI do for me?" },
];

export function AIDiscover() {
  const p = usePersona();
  const d = useData();
  const tryIt = useTryAI();
  const [hidden, setHidden] = useState<string[]>([]);
  const found = discoveries(p, d).filter((x) => !hidden.includes(x.id));
  const caps = ROLE_CAPABILITIES[p.role] ?? ROLE_CAPABILITIES.default;
  return (
    <Workspace area="ask" title="Discover what AI can help you accomplish" description={`Ideas picked for ${p.title.toLowerCase().startsWith("co-founder") ? "leadership" : `your role as ${p.title}`}, based on your current work. Only you can see these suggestions.`} meta={<Badge tone="ai">Simulated AI</Badge>}>
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3"><div><h2 className="text-[16px] font-semibold">Found in your work</h2><p className="text-[13px] text-muted">Spotted in records you already have access to. Nothing has been changed.</p></div></div>
        {found.length ? <div className="grid gap-4 lg:grid-cols-2">{found.map((x) => <DiscoveryCard key={x.id} x={x} onDismiss={() => setHidden((h) => [...h, x.id])} />)}</div>
          : <EmptyState icon={<Lightbulb />} title="Nothing new right now" body="When AI notices something useful in your work, it will appear here, not as a notification." />}
      </section>
      <section className="space-y-3">
        <h2 className="text-[16px] font-semibold">Recommended for your role</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {caps.map((c) => (
            <button key={c.title} onClick={() => tryIt({ prompt: c.prompt, file: c.prompt.includes("spreadsheet") ? "expenses" : c.prompt.includes("meeting notes") ? "notes" : c.prompt.includes("letter into Arabic") ? "parents" : undefined })} className="rounded-xl border border-line bg-surface p-3.5 text-left transition hover:border-ai-200 hover:bg-ai-50/40">
              <Badge tone="outline">{c.kind}</Badge>
              <p className="mt-2 text-[14px] font-semibold">{c.title}</p>
              <p className="mt-1 text-[12.5px] text-ai-700">Try: “{c.prompt}”</p>
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-[16px] font-semibold">Things you can create</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CREATE.map((c) => { const Icon = KIND_ICON[c.kind]; return (
            <button key={c.title} onClick={() => tryIt(c)} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5 text-left transition hover:border-ai-200">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-ai-700"><Icon className="size-4" /></span>
              <span><span className="block text-[14px] font-semibold">{c.title}</span><span className="block text-[12.5px] text-muted">{c.body}</span></span>
            </button>
          ); })}
        </div>
      </section>
    </Workspace>
  );
}

function aiUse(cls: DataClass, grants: DataClass[]): { ok: "Yes" | "Limited" | "No"; how: string } {
  switch (cls) {
    case "standard": return { ok: "Yes", how: "Documents, knowledge base and records your role can open" };
    case "financial": return grants.includes("financial") ? { ok: "Yes", how: "Budgets, grants and expenses you can already see" } : { ok: "No", how: "Your role has no financial access" };
    case "staff-HR": return grants.includes("staff-HR") ? { ok: "Yes", how: "Leave and HR records you manage" } : { ok: "No", how: "Your role has no staff-HR access" };
    case "learner-PII": return grants.includes("learner-PII") ? { ok: "Limited", how: "Pseudonymised: names replaced by codes before the assistant sees them" } : { ok: "No", how: "Your role has no learner access" };
    case "minor-PII": return grants.includes("minor-PII") ? { ok: "Limited", how: "Students under 18: pseudonymised and never used for training" } : { ok: "No", how: "Stricter controls for children" };
    case "pupil-data": return grants.includes("pupil-data") ? { ok: "Limited", how: "Your assigned classes only; every view is logged" } : { ok: "Limited", how: "Aggregated figures only (school, grade or class)" };
    case "safeguarding": return { ok: "No", how: "Never available to any AI assistant, for any role" };
  }
}

const CLASSES: { cls: DataClass; label: string }[] = [
  { cls: "standard", label: "General organizational information" }, { cls: "financial", label: "Financial information" }, { cls: "staff-HR", label: "Staff HR records" },
  { cls: "learner-PII", label: "Learner records (Future Builders, Teaching Fellows)" }, { cls: "minor-PII", label: "Information about students under 18" },
  { cls: "pupil-data", label: "School pupil data (children)" }, { cls: "safeguarding", label: "Safeguarding records" },
];

const RULES = [
  { icon: UserCheck, title: "Your permissions, never more", body: "AI works as you. It cannot open anything you couldn't open yourself." },
  { icon: Lock, title: "Stricter rules for children", body: "Pupil and under-18 information is aggregated or pseudonymised before AI sees it." },
  { icon: EyeOff, title: "Safeguarding is excluded", body: "Safeguarding records are never indexed or available to any assistant." },
  { icon: Check, title: "You confirm every change", body: "AI can draft and suggest. Records only change after a person confirms." },
  { icon: ClipboardList, title: "Answers show their evidence", body: "Every answer explains how it was produced and links to its sources." },
  { icon: ScrollText, title: "Everything is audited", body: "Questions, answers and confirmed actions are written to the audit log." },
];

export function AITrust() {
  const p = usePersona();
  const d = useData();
  const mine = d.audit.filter((a) => a.actor.includes(p.name) && (a.actor.startsWith("AI") || a.actor.includes("Agent")));
  return (
    <Workspace area="ask" title="AI & your data" description="How AI works safely at CodeBrave: what it can use for you, what it never sees, and how every use is recorded.">
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900"><ShieldCheck className="mt-0.5 size-4 shrink-0" /><span><b>Prototype:</b> these rules are demonstrated in the interface. In production they are enforced by the platform's permission service before any data reaches an AI model. No AI provider is connected here.</span></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{RULES.map((r) => <Card key={r.title} className="p-4"><r.icon className="size-5 text-ai-600" /><p className="mt-2 font-semibold">{r.title}</p><p className="mt-1 text-[13px] text-muted">{r.body}</p></Card>)}</div>
      <Card>
        <CardHeader icon={<ShieldCheck />} title={`What AI can use for ${p.name.split(" ")[0]}`} subtitle={`Based on your role (${p.title}) and your data permissions`} />
        <CardBody>
          <MiniTable head={["Information", "Can AI use it?", "How"]} rows={CLASSES.map(({ cls, label }) => { const u = aiUse(cls, p.grants); return [label, <Badge tone={u.ok === "Yes" ? "success" : u.ok === "Limited" ? "warning" : "neutral"} dot>{u.ok}</Badge>, <span className="text-muted">{u.how}</span>]; })} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader icon={<Bot />} title="Your recent AI activity" subtitle="Every question, answer and confirmed action is recorded" />
        <CardBody>
          {mine.length ? <MiniTable head={["When", "What happened", "Related to", "Data"]} rows={mine.slice(0, 12).map((a) => [`${formatDate(a.at)} ${a.at.slice(11, 16)}`, a.action, a.target, <Badge tone="outline">{a.dataClass}</Badge>])} />
            : <EmptyState icon={<ScrollText />} title="No AI activity yet" body="Ask something in the AI Workspace and it will appear here." action={<Button asChild size="sm"><Link to="/ai">Open AI Workspace</Link></Button>} />}
        </CardBody>
      </Card>
      {p.role === "admin" && <p className="text-[13px] text-muted">Agent runs, diagnostics and model usage are in <Link to="/admin/agents" className="text-brand-700 hover:underline">Admin › Agent Hub</Link>.</p>}
    </Workspace>
  );
}
