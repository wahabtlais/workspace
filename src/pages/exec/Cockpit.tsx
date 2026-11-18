import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { CalendarClock, Check, CircleAlert, Clock, Gauge, Lightbulb, RefreshCw, Send, Sparkles, TrendingUp, X } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { executiveBriefing, observationGainLink } from "@/ai/contextual";
import { BarList } from "@/ai/AIMessage";
import { logAI } from "@/ai/engine";
import { getPersona } from "@/config/personas";
import { useData, useLookup, usePersona } from "@/store/hooks";
import { useDemo } from "@/store/demoStore";
import { toast, useUI } from "@/store/uiStore";
import { decideDecision } from "@/store/execActions";
import { personaForStaff } from "@/store/calendarActions";
import { useLiveIndicators } from "@/lib/indicators";
import { attendeeRate } from "@/lib/metrics";
import { addDays, DEMO_TODAY, formatDate, relativeDay } from "@/lib/utils";

/** Ask a responsible manager to investigate or act. Creates an Inbox task with the evidence link and notifies them. */
export function requestInvestigation(topic: string, ownerId: string, link: string, why: string) {
  const s = useDemo.getState();
  const me = getPersona(s.personaId);
  const owner = personaForStaff(ownerId);
  const name = s.data.staff.find((x) => x.id === ownerId)?.name ?? "the owner";
  s.addInbox({ ...(owner ? { toPersona: owner.id } : { toRole: "exec" as const }), kind: "task", priority: "high", title: `Investigate: ${topic}`, detail: `Requested by ${me.name} · ${why}`, link, source: "Executive" });
  if (owner) s.notify({ toPersona: owner.id, text: `${me.name} asked you to investigate: ${topic}`, link, tone: "warning" });
  logAI(me, `Leadership request sent to ${name}`, topic);
  toast({ tone: "success", title: `Sent to ${name}`, body: "They have an Inbox task with the evidence attached. You’ll be notified when they respond." });
}

function AskOwner({ topic, ownerId, link, why }: { topic: string; ownerId: string; link: string; why: string }) {
  const L = useLookup();
  const [sent, setSent] = useState(false);
  return sent ? <Badge tone="success" dot>Sent to {L.person(ownerId).split(" ")[0]}</Badge>
    : <Button size="sm" variant="secondary" onClick={() => { requestInvestigation(topic, ownerId, link, why); setSent(true); }}><Send /> Ask {L.person(ownerId).split(" ")[0]} to investigate</Button>;
}

function Explain({ prompt, context }: { prompt: string; context: string }) {
  const setAsk = useUI((s) => s.setAsk);
  return <Button size="sm" variant="ai" onClick={() => setAsk(true, context, prompt)}><Sparkles /> Explain</Button>;
}

function Briefing() {
  const d = useData();
  const nav = useNavigate();
  const [at, setAt] = useState("08:00");
  const b = executiveBriefing(d);
  const bullets = b.blocks.find((x) => x.kind === "bullets");
  return (
    <Card className="border-ai-200 bg-gradient-to-br from-ai-50/70 to-surface">
      <CardHeader icon={<Sparkles className="text-ai-600" />} title="Your briefing" subtitle={`Generated today at ${at} from live records · Simulated AI`}
        action={<div className="flex flex-wrap gap-1"><Button size="sm" variant="ghost" onClick={() => { setAt(new Date().toTimeString().slice(0, 5)); toast({ tone: "ai", title: "Briefing refreshed", body: "Recomputed from the latest records." }); }}><RefreshCw /> Refresh</Button><Button size="sm" variant="secondary" onClick={() => nav("/ai", { state: { prompt: "Give me this week's executive briefing", context: "Executive" } })}>Discuss in AI Workspace</Button></div>} />
      <CardBody>
        {bullets?.kind === "bullets" && <ul className="space-y-2 text-[14px] leading-relaxed">{bullets.items.map((x) => <li key={x} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-ai-500" />{x}</li>)}</ul>}
        <div className="mt-3 flex flex-wrap gap-1.5">{b.sources.map((s) => <Link key={s.label} to={s.link ?? "/results"} className="rounded-md bg-surface px-2 py-0.5 text-[11.5px] text-muted ring-1 ring-line hover:text-brand-700">{s.label}</Link>)}</div>
      </CardBody>
    </Card>
  );
}

export function ExecCockpit({ full }: { full?: boolean }) {
  const d = useData();
  const L = useLookup();
  const persona = usePersona();
  const inds = useLiveIndicators();
  const canDecide = persona.role === "exec";
  const pending = d.decisions.filter((x) => x.status === "Pending").sort((a, b) => a.due.localeCompare(b.due));
  const ratio = (i: (typeof inds)[number]) => i.current / i.target;
  const off = inds.filter((i) => ratio(i) < 0.95);
  const risks = d.risks.filter((r) => r.status !== "Closed" && r.likelihood * r.impact >= 12).sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact);
  const health = (["SU", "FB", "Org"] as const).map((p) => {
    const xs = inds.filter((i) => i.program === p);
    const offN = xs.filter((i) => ratio(i) < 0.95).length;
    return { p, xs, offN, label: { SU: "School Upskilling", FB: "Future Builders", Org: "Organization" }[p], to: { SU: "/school-upskilling", FB: "/future-builders", Org: "/results" }[p] };
  }).filter((h) => h.xs.length);
  const link = observationGainLink(d);
  const regs = d.registers.filter((r) => r.kind === "fb");
  const byPath = (["ai", "web", "ent"] as const).map((pw) => { const ss = d.students.filter((s) => s.cohortId === "fbc-2" && s.status === "Active" && s.pathway === pw); return { pw, att: ss.length ? Math.round(ss.reduce((a, s) => a + attendeeRate(regs, s.id), 0) / ss.length) : 0 }; });
  const lowPath = [...byPath].sort((a, b) => a.att - b.att)[0];
  const horizon = addDays(DEMO_TODAY, 30);
  const upcoming = [
    ...d.obligations.filter((o) => o.status !== "Submitted" && o.due <= horizon).map((o) => ({ date: o.due, title: o.title, kind: "Donor obligation", to: "/fundraising/obligations" })),
    ...d.events.filter((e) => ["Deadline", "Meeting"].includes(e.type) && e.date >= DEMO_TODAY && e.date <= horizon && e.participantIds.includes("s-rana") && !e.title.startsWith("Management team weekly")).map((e) => ({ date: e.date, title: e.title, kind: e.type, to: "/calendar" })),
    ...d.projects.filter((p) => p.kind === "client").flatMap((p) => p.milestones.filter((m) => m.due >= DEMO_TODAY && m.due <= horizon).map((m) => ({ date: m.due, title: `${p.title}: ${m.title}`, kind: "Client milestone", to: "/future-builders/projects" }))),
    { date: "2026-12-16", title: "Future Builders Demo Day", kind: "Milestone", to: "/calendar" },
  ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 7);
  const pathName = { ai: "AI & ML", web: "Web development", ent: "Entrepreneurship" };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        {health.map((h) => (
          <Link key={h.p} to={h.to} className="block">
            <Card className="h-full p-4 transition hover:border-brand-300">
              <div className="flex items-center justify-between gap-2"><p className="font-semibold">{h.label}</p><Badge tone={h.offN === 0 ? "success" : h.offN === 1 ? "warning" : "danger"} dot>{h.offN === 0 ? "On track" : `${h.offN} off track`}</Badge></div>
              <div className="mt-3 space-y-2">{h.xs.slice(0, 3).map((i) => { const pc = Math.min(100, Math.round(ratio(i) * 100)); return (
                <div key={i.id}><div className="flex justify-between gap-2 text-[12px]"><span className="truncate text-muted">{i.name}{i.illustrative && " *"}</span><span className="tabular font-medium">{i.current}{i.unit === "%" ? "%" : ""} / {i.target}{i.unit === "%" ? "%" : ""}</span></div><Progress value={pc} className="mt-1" tone={pc >= 95 ? "success" : pc >= 80 ? "brand" : "warning"} /></div>
              ); })}</div>
            </Card>
          </Link>
        ))}
      </div>
      <p className="-mt-2 text-[11.5px] text-subtle">* Illustrative figure, not calculated from platform records. All other figures are live.</p>

      <Briefing />

      <Card>
        <CardHeader icon={<CircleAlert />} title="Needs your attention" subtitle="Only what needs leadership: decisions, off-track indicators and high risks. Details stay in each workspace." />
        <CardBody className="space-y-3">
          {pending.map((x) => (
            <div key={x.id} className="rounded-lg border border-line p-3">
              <div className="flex flex-wrap items-start gap-2"><Badge tone="info">Decision</Badge><p className="min-w-0 flex-1 font-medium">{x.title}</p><span className="text-[12px] text-muted">due {relativeDay(x.due)}</span></div>
              <p className="mt-1 text-[13px] text-muted"><span className="font-medium text-fg">Why: </span>{x.context}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {canDecide && <><Button size="sm" variant="success" onClick={() => decideDecision(x.id, "Approved")}><Check /> Approve</Button><Button size="sm" variant="secondary" onClick={() => decideDecision(x.id, "Declined")}><X /> Decline</Button><Button size="sm" variant="ghost" onClick={() => decideDecision(x.id, "Deferred")}><Clock /> Defer</Button></>}
                {x.link && <Button asChild size="sm" variant="ghost"><Link to={x.link}>See evidence</Link></Button>}
                <span className="text-[12px] text-subtle">Requested by {L.person(x.requestedBy)}</span>
              </div>
            </div>
          ))}
          {off.map((i) => (
            <div key={i.id} className="rounded-lg border border-line p-3">
              <div className="flex flex-wrap items-start gap-2"><Badge tone="warning">Off track</Badge><p className="min-w-0 flex-1 font-medium">{i.name}{i.illustrative && <span className="ml-1 text-[12px] font-normal text-subtle">(illustrative)</span>}</p><span className="tabular text-[13px] font-semibold">{i.current}{i.unit === "%" ? "%" : ""} <span className="font-normal text-muted">/ {i.target}{i.unit === "%" ? "%" : ""}</span></span></div>
              <p className="mt-1 text-[13px] text-muted"><span className="font-medium text-fg">Why: </span>{Math.round(ratio(i) * 100)}% of target ({i.code}). Owner: {L.person(i.ownerId)}. Source: {i.source}.</p>
              <div className="mt-2 flex flex-wrap gap-2"><Explain context={i.name} prompt={i.id === "ind-su-obs" ? "Explain the change in observation scores and learning gain" : `Explain the change in the ${i.name.toLowerCase()} indicator`} /><Button asChild size="sm" variant="ghost"><Link to={`/results/${i.id}`}>See evidence</Link></Button><AskOwner topic={`${i.name} below target`} ownerId={i.ownerId} link={`/results/${i.id}`} why={`${i.current} against a target of ${i.target}`} /></div>
            </div>
          ))}
          {risks.map((r) => (
            <div key={r.id} className="rounded-lg border border-line p-3">
              <div className="flex flex-wrap items-start gap-2"><Badge tone="danger">Risk {r.likelihood * r.impact}</Badge><p className="min-w-0 flex-1 font-medium">{r.title}</p><span className="text-[12px] text-muted">{r.status}</span></div>
              <p className="mt-1 text-[13px] text-muted"><span className="font-medium text-fg">Why: </span>likelihood {r.likelihood} × impact {r.impact}. Mitigation: {r.mitigation}</p>
              <div className="mt-2 flex flex-wrap gap-2"><Button asChild size="sm" variant="ghost"><Link to="/executive/risks">Risk register</Link></Button><AskOwner topic={`Update on risk: ${r.title}`} ownerId={r.ownerId} link="/executive/risks" why={`Risk score ${r.likelihood * r.impact}`} /></div>
            </div>
          ))}
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader icon={<Lightbulb className="text-ai-600" />} title="Insights from AI" subtitle="Patterns across workspaces, with the evidence behind them" />
          <CardBody className="space-y-4">
            <div>
              <p className="font-medium">Observation quality and learning gain move together</p>
              <p className="mt-1 text-[13px] text-muted">Schools averaging 3.0+ in classroom observations gained +{link.hiGain} points last year, against +{link.loGain} in the others. This is a relationship, not proof of cause.</p>
              <div className="mt-2"><BarList data={link.rows.slice(0, 6).map((r) => ({ label: r.s.name.split(" ").slice(0, 2).join(" "), value: r.gain, flag: r.obs < 3 }))} /></div>
              <p className="mt-1 text-[11.5px] text-muted">Learning gain in points. ▲ = observation average below 3.0.</p>
              <div className="mt-2 flex flex-wrap gap-2"><Explain context="Executive insight" prompt="Explain the change in observation scores and learning gain" /><AskOwner topic="Observation scores and learning gain" ownerId="s-maya" link="/school-upskilling/visits" why="Prioritise coaching before the post-assessment" /></div>
            </div>
            <div className="border-t border-line pt-4">
              <p className="font-medium">{pathName[lowPath.pw]} has the lowest Future Builders attendance</p>
              <p className="mt-1 text-[13px] text-muted">Average {lowPath.att}% against {byPath.filter((b) => b !== lowPath).map((b) => `${b.att}% (${pathName[b.pw]})`).join(" and ")}.</p>
              <div className="mt-2 flex flex-wrap gap-2"><Explain context="Future Builders" prompt="Summarise cohort progress" /><AskOwner topic={`Attendance in the ${pathName[lowPath.pw]} pathway`} ownerId="s-tarek" link="/future-builders/attendance" why={`${lowPath.att}% average attendance`} /></div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader icon={<CalendarClock />} title="Coming up in the next 30 days" action={<Link to="/calendar" className="text-[13px] text-brand-600 hover:underline">Calendar</Link>} />
          <CardBody className="space-y-1">
            {upcoming.map((u) => (
              <Link key={u.title + u.date} to={u.to} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-canvas">
                <span className="w-16 shrink-0 text-[12px] text-muted tabular">{formatDate(u.date)}</span>
                <span className="min-w-0 flex-1 truncate text-[13.5px]">{u.title}</span>
                <Badge tone="outline">{u.kind}</Badge>
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>

      {full && (
        <Card>
          <CardHeader icon={<TrendingUp />} title="Organizational developments" subtitle="What changed recently across CodeBrave" />
          <CardBody className="space-y-2">
            {d.activity.slice(0, 6).map((a) => <div key={a.id} className="flex items-start gap-3 text-[13px]"><span className="w-20 shrink-0 text-[12px] text-muted">{relativeDay(a.at)}</span><span className="flex-1"><span className="font-medium">{a.actor}</span> {a.text}</span></div>)}
          </CardBody>
        </Card>
      )}
      <p className="flex items-center gap-1.5 text-[12px] text-subtle"><Gauge className="size-3.5" /> Operational detail stays in each workspace; this view shows only what needs leadership.</p>
    </div>
  );
}
