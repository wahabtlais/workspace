import { useState } from "react";
import { ArrowLeft, Briefcase, BookOpen, Landmark, Paperclip, Plus, Rocket, School, Sparkles, UserCheck } from "lucide-react";
import type { OpsRequest, RequestDestination } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/misc";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/overlay";
import { Workspace } from "@/components/common/Workspace";
import { EmptyState } from "@/components/common/EmptyState";
import { RequestCard } from "@/pages/ops/Requests";
import { chainFor, createRequest, ownerFor } from "@/store/opsActions";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { addDays, cn, DEMO_TODAY, formatDate } from "@/lib/utils";

export { Calendar } from "./CalendarPage";

type RType = OpsRequest["type"];
const DESTS: { id: RequestDestination; icon: typeof Briefcase; body: string; types: RType[] }[] = [
  { id: "Operations & HR", icon: Briefcase, body: "Equipment, travel, leave, purchases, general admin", types: ["Equipment", "Travel", "Leave", "Purchase", "General"] },
  { id: "School Upskilling Manager", icon: School, body: "Support for a school, TF or field activity", types: ["Program support", "General"] },
  { id: "Future Builders Manager", icon: Rocket, body: "Support for a cohort, project or student activity", types: ["Program support", "General"] },
  { id: "Curriculum Manager", icon: BookOpen, body: "Changes or new resources for a lesson or grade", types: ["Curriculum", "General"] },
  { id: "Executive", icon: Landmark, body: "Requests that need a co-founder’s decision", types: ["General", "Purchase"] },
];

type Field = { key: string; label: string; kind?: "text" | "date" | "number" | "textarea" | "select"; options?: string[]; placeholder?: string };
function fieldsFor(type: RType, schools: string[]): Field[] {
  switch (type) {
    case "Equipment": return [{ key: "item", label: "Item", placeholder: "e.g. Laptop with charger" }, { key: "qty", label: "Quantity", kind: "number" }, { key: "date", label: "Needed by", kind: "date" }, { key: "cost", label: "Estimated cost (USD)", kind: "number" }, { key: "why", label: "Justification", kind: "textarea" }];
    case "Travel": return [{ key: "dest", label: "Destination" }, { key: "from", label: "From", kind: "date" }, { key: "to", label: "To", kind: "date" }, { key: "purpose", label: "Purpose", kind: "textarea" }, { key: "cost", label: "Estimated cost (USD)", kind: "number" }];
    case "Leave": return [{ key: "leaveType", label: "Leave type", kind: "select", options: ["Annual", "Sick", "Training", "Unpaid"] }, { key: "from", label: "From", kind: "date" }, { key: "to", label: "To", kind: "date" }, { key: "notes", label: "Notes", kind: "textarea" }];
    case "Purchase": return [{ key: "item", label: "Item or service" }, { key: "supplier", label: "Preferred supplier (optional)" }, { key: "cost", label: "Amount (USD)", kind: "number" }, { key: "why", label: "Justification", kind: "textarea" }];
    case "Curriculum": return [{ key: "program", label: "Program", kind: "select", options: ["School Upskilling", "Future Builders", "Teaching Fellows"] }, { key: "grade", label: "Grade or pathway", placeholder: "e.g. Grades 5–6" }, { key: "lesson", label: "Lesson or resource", placeholder: "e.g. Unit 2 worksheets" }, { key: "why", label: "What is needed and why", kind: "textarea" }];
    case "Program support": return [{ key: "where", label: "School or cohort", kind: "select", options: schools }, { key: "issue", label: "Issue" }, { key: "help", label: "Requested assistance", kind: "textarea" }];
    default: return [{ key: "subject", label: "Subject" }, { key: "desc", label: "Description", kind: "textarea" }];
  }
}

/** Simulated AI: turns a sentence into a destination, type and pre-filled fields. */
function aiFill(text: string, schools: { name: string }[]): { dest: RequestDestination; type: RType; values: Record<string, string> } {
  const p = text.toLowerCase();
  const num = Number(p.match(/\b(\d+)\b/)?.[1] ?? (p.includes("two") ? 2 : p.includes("three") ? 3 : 1));
  const date = p.includes("next week") ? addDays(DEMO_TODAY, 7) : p.includes("tomorrow") ? addDays(DEMO_TODAY, 1) : addDays(DEMO_TODAY, 14);
  const school = schools.find((s) => p.includes(s.name.split(" ")[0].toLowerCase()));
  if (/laptop|computer|projector|headset|tablet|router/.test(p)) { const item = p.match(/laptop|computer|projector|headset|tablet|router/)![0]; return { dest: "Operations & HR", type: "Equipment", values: { item: `${item[0].toUpperCase()}${item.slice(1)}${num > 1 ? "s" : ""}`, qty: String(num), date, cost: String(item === "laptop" ? 950 * num : 150 * num), why: text } }; }
  if (/leave|day off|vacation|holiday/.test(p)) return { dest: "Operations & HR", type: "Leave", values: { leaveType: p.includes("sick") ? "Sick" : "Annual", from: date, to: addDays(date, Math.max(0, num - 1)), notes: text } };
  if (/travel|trip|transport/.test(p)) return { dest: "Operations & HR", type: "Travel", values: { dest: school?.name ?? "Field schools", from: date, to: date, purpose: text, cost: "180" } };
  if (/worksheet|lesson|curriculum|arabic version|resource/.test(p)) return { dest: "Curriculum Manager", type: "Curriculum", values: { program: "School Upskilling", grade: p.match(/grades? ?[\d–-]+/)?.[0].replace(/^g/, "G") ?? "Grades 5–6", lesson: p.includes("worksheet") ? "Worksheets" : "Lesson materials", why: text } };
  if (/coaching|support|help|struggl/.test(p)) return { dest: /student|cohort|fb|future builders/.test(p) ? "Future Builders Manager" : "School Upskilling Manager", type: "Program support", values: { where: school?.name ?? "", issue: p.includes("coaching") ? "Coaching needed" : "Support needed", help: text } };
  if (/buy|purchase|order|print/.test(p)) return { dest: "Operations & HR", type: "Purchase", values: { item: text.slice(0, 60), cost: "250", why: text } };
  return { dest: "Operations & HR", type: "General", values: { subject: text.slice(0, 60), desc: text } };
}

function titleFrom(type: RType, v: Record<string, string>) {
  switch (type) {
    case "Equipment": return `${v.qty && v.qty !== "1" ? `${v.qty} × ` : ""}${v.item || "Equipment"}${v.date ? ` by ${formatDate(v.date)}` : ""}`;
    case "Travel": return `Travel: ${v.dest || "destination"}${v.from ? `, ${formatDate(v.from)}` : ""}`;
    case "Leave": return `${v.leaveType || "Annual"} leave${v.from ? ` (${formatDate(v.from)}${v.to && v.to !== v.from ? `–${formatDate(v.to)}` : ""})` : ""}`;
    case "Purchase": return `Purchase: ${v.item || "item"}`;
    case "Curriculum": return `${v.lesson || "Curriculum resource"} (${v.grade || v.program || ""})`;
    case "Program support": return `Support for ${v.where || "a school"}: ${v.issue || ""}`.trim();
    default: return v.subject || "General request";
  }
}

function NewRequest({ onClose }: { onClose: () => void }) {
  const d = useData();
  const L = useLookup();
  const p = usePersona();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dest, setDest] = useState<RequestDestination>();
  const [type, setType] = useState<RType>();
  const [values, setValues] = useState<Record<string, string>>({});
  const [ai, setAi] = useState(false);
  const [sentence, setSentence] = useState("");
  const [attach, setAttach] = useState<string[]>([]);
  const schoolNames = [...d.schools.map((s) => s.name), ...d.fbCohorts.map((c) => c.name)];
  const fields = type ? fieldsFor(type, schoolNames) : [];
  const chain = dest && type ? chainFor(type, dest, Number(values.cost) || undefined, p.role) : [];
  const owner = dest && type ? ownerFor(dest, type) : undefined;
  const missing = fields.filter((f) => !["supplier", "notes", "cost"].includes(f.key) && !values[f.key]).length;
  const fill = () => { const r = aiFill(sentence, d.schools); setDest(r.dest); setType(r.type); setValues(r.values); setAi(true); setStep(3); };
  const submit = () => {
    if (!type || !dest) return;
    createRequest(type, titleFrom(type, values), values.why || values.purpose || values.help || values.desc || values.notes || "", Number(values.cost) || undefined, { destination: dest, aiFilled: ai, fields: [...fields.filter((f) => values[f.key]).map((f) => ({ label: f.label, value: f.kind === "date" ? formatDate(values[f.key], { day: "numeric", month: "short", year: "numeric" }) : values[f.key] })), ...(attach.length ? [{ label: "Attachments", value: attach.join(", ") }] : [])] });
    onClose();
  };
  return (
    <DialogContent wide title="New request" description={step === 1 ? "Start with who the request is for. The form adapts to what you choose." : step === 2 ? `To: ${dest}` : `${dest} · ${type}`}
      footer={<>{step > 1 && <Button variant="ghost" className="mr-auto" onClick={() => setStep(step === 3 ? 2 : 1)}><ArrowLeft /> Back</Button>}<DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>{step === 3 && <Button disabled={missing > 0} onClick={submit}>Submit request</Button>}</>}>
      {step === 1 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-ai-200 bg-ai-50/50 p-3">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ai-900"><Sparkles className="size-4" /> Describe it in your own words</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row"><Input value={sentence} onChange={(e) => setSentence(e.target.value)} placeholder="e.g. I need two laptops for the new trainers next week" /><Button className="bg-ai-600 hover:bg-ai-700" disabled={!sentence.trim()} onClick={fill}>Fill with AI</Button></div>
            <p className="mt-1.5 text-[11.5px] text-ai-800">Simulated AI fills the form. You review every field before anything is submitted.</p>
          </div>
          <p className="text-[13px] font-semibold">Or choose who it is for</p>
          <div className="grid gap-2 sm:grid-cols-2">{DESTS.map((x) => (
            <button key={x.id} onClick={() => { setDest(x.id); setType(x.types.length === 1 ? x.types[0] : undefined); setStep(x.types.length === 1 ? 3 : 2); setAi(false); setValues({}); }} className="flex items-start gap-3 rounded-xl border border-line p-3 text-left hover:border-brand-300 hover:bg-brand-50/40">
              <x.icon className="mt-0.5 size-5 text-brand-600" /><span><span className="block text-[14px] font-semibold">{x.id}</span><span className="block text-[12.5px] text-muted">{x.body}</span><span className="mt-1 block text-[11.5px] text-subtle">Handled by {L.person(ownerFor(x.id, x.types[0]))}</span></span>
            </button>
          ))}</div>
        </div>
      )}
      {step === 2 && dest && (
        <div className="grid gap-2 sm:grid-cols-2">{DESTS.find((x) => x.id === dest)!.types.map((t) => (
          <button key={t} onClick={() => { setType(t); setStep(3); setValues({}); }} className="rounded-xl border border-line p-3 text-left hover:border-brand-300 hover:bg-brand-50/40"><span className="block text-[14px] font-semibold">{t}</span><span className="block text-[12.5px] text-muted">{fieldsFor(t, []).map((f) => f.label).slice(0, 4).join(" · ")}</span></button>
        ))}</div>
      )}
      {step === 3 && type && dest && (
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="space-y-3">
            {ai && <div className="flex items-start gap-2 rounded-lg bg-ai-50 px-3 py-2 text-[12.5px] text-ai-900"><Sparkles className="mt-0.5 size-4 shrink-0" /><span>Filled with AI from: “{sentence}”. Please check each field. <button className="underline" onClick={() => setStep(1)}>Change destination</button></span></div>}
            {fields.map((f) => (
              <label key={f.key} className="block text-[13px] font-medium">{f.label}
                {f.kind === "textarea" ? <Textarea className="mt-1" rows={3} value={values[f.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
                  : f.kind === "select" ? <select className="mt-1 h-9 w-full rounded-lg border border-line-strong bg-surface px-2 text-[14px]" value={values[f.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}><option value="">Choose…</option>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>
                    : <Input className={cn("mt-1", ai && values[f.key] && "border-ai-200 bg-ai-50/30")} type={f.kind ?? "text"} placeholder={f.placeholder} value={values[f.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />}
              </label>
            ))}
            <div>
              <p className="text-[13px] font-medium">Attachments</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">{attach.map((a) => <Badge key={a} tone="outline"><Paperclip className="size-3" /> {a}</Badge>)}<label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-dashed border-line-strong px-2 py-1 text-[12px] text-muted hover:bg-canvas"><Paperclip className="size-3" /> Add file<input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setAttach((a) => [...a, f.name]); }} /></label></div>
              <p className="mt-1 text-[11px] text-subtle">Simulated: file names are recorded, files are not uploaded.</p>
            </div>
          </div>
          <aside className="space-y-3 rounded-xl bg-canvas p-3 text-[12.5px]">
            <div><p className="font-semibold">Responsible person</p><p className="mt-0.5 flex items-center gap-1.5"><UserCheck className="size-3.5 text-muted" />{L.person(owner)}</p></div>
            <div><p className="font-semibold">Approval route</p><ol className="mt-1 space-y-1">{chain.map((c, i) => <li key={i} className="flex items-center gap-1.5"><span className="flex size-4 items-center justify-center rounded-full bg-surface text-[10px] ring-1 ring-line">{i + 1}</span>{c.label}</li>)}<li className="flex items-center gap-1.5 text-muted"><span className="flex size-4 items-center justify-center rounded-full bg-surface text-[10px] ring-1 ring-line">✓</span>Fulfilment by {L.person(owner).split(" ")[0]}</li></ol></div>
            <p className="text-muted">You’ll be notified at every step.</p>
          </aside>
        </div>
      )}
    </DialogContent>
  );
}

export function MyRequests() {
  const d = useData();
  const p = usePersona();
  const [open, setOpen] = useState(false);
  const mine = d.requests.filter((r) => r.requesterId === p.staffId);
  return (
    <Workspace area="requests" title="My requests" description="Requests you made, who is responsible and where each one is in its approval route."
      actions={<Button onClick={() => setOpen(true)}><Plus /> New request</Button>}>
      {mine.length === 0 ? <EmptyState title="You have no requests yet" body="Use “New request”. You can describe what you need in a sentence and AI will fill the form for you to review." action={<Button size="sm" onClick={() => setOpen(true)}><Plus /> New request</Button>} /> : mine.map((r) => <RequestCard key={r.id} r={r} canAct={false} />)}
      <Dialog open={open} onOpenChange={setOpen}>{open && <NewRequest onClose={() => setOpen(false)} />}</Dialog>
    </Workspace>
  );
}
