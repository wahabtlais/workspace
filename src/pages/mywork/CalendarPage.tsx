import { useMemo, useState } from "react";
import { Link } from "react-router";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, ExternalLink, MapPin, Pencil, Plus, Trash2, Users, Video } from "lucide-react";
import type { CalendarEvent, EventType } from "@/data/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/misc";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/overlay";
import { Workspace, Segmented } from "@/components/common/Workspace";
import { useData, usePersona } from "@/store/hooks";
import { calendarItems, deleteEvent, saveEvent, simulatedMeetLink, type CalItem } from "@/store/calendarActions";
import { addDays, cn, DEMO_TODAY, formatDate } from "@/lib/utils";

export const EVENT_TYPES: EventType[] = ["Meeting", "School visit", "Training", "Future Builders", "Interview", "Curriculum review", "Deadline", "Grant obligation", "Leave"];
export const TYPE_STYLE: Record<EventType, string> = {
  "Meeting": "bg-brand-50 text-brand-800 border-brand-200",
  "School visit": "bg-emerald-50 text-emerald-800 border-emerald-200",
  "Training": "bg-sky-50 text-sky-800 border-sky-200",
  "Future Builders": "bg-violet-50 text-violet-800 border-violet-200",
  "Interview": "bg-pink-50 text-pink-800 border-pink-200",
  "Curriculum review": "bg-indigo-50 text-indigo-800 border-indigo-200",
  "Deadline": "bg-red-50 text-red-800 border-red-200",
  "Grant obligation": "bg-amber-50 text-amber-900 border-amber-200",
  "Leave": "bg-slate-100 text-slate-700 border-slate-200",
};

const dow = (iso: string) => (new Date(iso + "T00:00:00Z").getUTCDay() + 6) % 7;
const startOfWeek = (iso: string) => addDays(iso, -dow(iso));
const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Draft = Omit<CalendarEvent, "id"> & { id?: string };

/** Create or edit a calendar event. Also used by school profiles to request a meeting. */
export function EventEditor({ initial, onClose, title = "New event" }: { initial: Draft; onClose: () => void; title?: string }) {
  const d = useData();
  const [ev, setEv] = useState<Draft>(initial);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setEv((e) => ({ ...e, [k]: v }));
  const relatedOptions = [
    ...d.schools.map((s) => ({ kind: "school" as const, id: s.id, label: s.name })),
    ...d.fbCohorts.map((c) => ({ kind: "cohort" as const, id: c.id, label: c.name })),
    ...d.projects.map((p) => ({ kind: "project" as const, id: p.id, label: p.title })),
    ...["Executive", "School Upskilling", "Future Builders", "Curriculum", "Operations & HR", "Fundraising"].map((x) => ({ kind: "department" as const, id: x, label: x })),
  ];
  const ok = ev.title.trim() && ev.date;
  return (
    <DialogContent wide title={title} description="Participants are notified. Online meetings get a simulated Google Meet link." footer={<><DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose><Button disabled={!ok} onClick={() => { saveEvent(ev); onClose(); }}>{ev.id ? "Save changes" : "Create event"}</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-[13px] font-medium sm:col-span-2">Title<Input className="mt-1" value={ev.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Term 2 planning with the principal" /></label>
        <label className="block text-[13px] font-medium">Type<select className="mt-1 h-9 w-full rounded-lg border border-line-strong bg-surface px-2 text-[14px]" value={ev.type} onChange={(e) => set("type", e.target.value as EventType)}>{EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className="block text-[13px] font-medium">Date<Input type="date" className="mt-1" value={ev.date} onChange={(e) => set("date", e.target.value)} /></label>
        <label className="block text-[13px] font-medium">Start<Input type="time" className="mt-1" value={ev.start ?? ""} onChange={(e) => set("start", e.target.value || undefined)} /></label>
        <label className="block text-[13px] font-medium">End<Input type="time" className="mt-1" value={ev.end ?? ""} onChange={(e) => set("end", e.target.value || undefined)} /></label>
        <label className="block text-[13px] font-medium sm:col-span-2">Location<Input className="mt-1" value={ev.location ?? ""} onChange={(e) => set("location", e.target.value || undefined)} placeholder={ev.online ? "Online" : "e.g. Head office, Room 1"} /></label>
        <div className="rounded-lg border border-line p-3 sm:col-span-2">
          <label className="flex items-center gap-2 text-[13px] font-medium"><input type="checkbox" checked={!!ev.online} onChange={(e) => setEv((x) => ({ ...x, online: e.target.checked, meetLink: e.target.checked ? x.meetLink : undefined }))} /> Online meeting</label>
          {ev.online && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {ev.meetLink ? <span className="inline-flex items-center gap-1.5 rounded-md bg-canvas px-2 py-1 text-[12.5px]"><Video className="size-3.5 text-brand-600" />{ev.meetLink}</span>
                : <Button size="sm" variant="secondary" onClick={() => set("meetLink", simulatedMeetLink())}><Video /> Create Google Meet link</Button>}
              <Badge tone="warning">Simulated: not a real Google Meet</Badge>
            </div>
          )}
        </div>
        <div className="sm:col-span-2">
          <p className="text-[13px] font-medium">Participants</p>
          <div className="mt-1 grid max-h-40 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-line p-2 scrollbar-thin sm:grid-cols-2">
            {d.staff.map((s) => <label key={s.id} className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={ev.participantIds.includes(s.id)} onChange={(e) => set("participantIds", e.target.checked ? [...ev.participantIds, s.id] : ev.participantIds.filter((x) => x !== s.id))} />{s.name}<span className="truncate text-[11.5px] text-subtle">{s.department}</span></label>)}
          </div>
          <Input className="mt-2" value={(ev.externalParticipants ?? []).join(", ")} onChange={(e) => set("externalParticipants", e.target.value ? e.target.value.split(",").map((x) => x.trim()) : undefined)} placeholder="External participants, comma separated (e.g. school principal)" />
        </div>
        <label className="block text-[13px] font-medium sm:col-span-2">Related to<select className="mt-1 h-9 w-full rounded-lg border border-line-strong bg-surface px-2 text-[14px]" value={ev.related ? `${ev.related.kind}:${ev.related.id}` : ""} onChange={(e) => set("related", relatedOptions.find((o) => `${o.kind}:${o.id}` === e.target.value))}><option value="">Nothing specific</option>{(["school", "cohort", "project", "department"] as const).map((k) => <optgroup key={k} label={k[0].toUpperCase() + k.slice(1)}>{relatedOptions.filter((o) => o.kind === k).map((o) => <option key={o.id} value={`${o.kind}:${o.id}`}>{o.label}</option>)}</optgroup>)}</select></label>
        <label className="block text-[13px] font-medium sm:col-span-2">Agenda<Textarea className="mt-1" rows={3} value={ev.agenda ?? ""} onChange={(e) => set("agenda", e.target.value || undefined)} placeholder="One item per line" /></label>
        <label className="block text-[13px] font-medium sm:col-span-2">Description<Textarea className="mt-1" rows={2} value={ev.description ?? ""} onChange={(e) => set("description", e.target.value || undefined)} /></label>
      </div>
    </DialogContent>
  );
}

function EventDetail({ it, onEdit, onClose }: { it: CalItem; onEdit: () => void; onClose: () => void }) {
  const d = useData();
  const p = usePersona();
  const name = (id: string) => d.staff.find((s) => s.id === id)?.name ?? id;
  const canEdit = it.event && (it.event.organizerId === p.staffId || it.event.participantIds.includes(p.staffId ?? "") || p.role === "exec" || p.role === "ops_hr");
  const relLink = it.related?.kind === "school" ? `/school-upskilling/schools/${it.related.id}` : it.related?.kind === "curriculum" ? `/curriculum/${it.related.id}` : it.related?.kind === "cohort" ? "/future-builders/cohorts" : undefined;
  return (
    <DialogContent title={it.title} description={<span className="inline-flex flex-wrap items-center gap-2"><span className={cn("rounded-md border px-1.5 py-0.5 text-[11.5px]", TYPE_STYLE[it.type])}>{it.type}</span>{it.source !== "Calendar" && <span className="text-[12px]">From {it.source}</span>}</span>}
      footer={<>{canEdit && it.event && <Button variant="ghost" className="mr-auto text-red-700" onClick={() => { deleteEvent(it.event!.id); onClose(); }}><Trash2 /> Delete</Button>}{it.link && <Button asChild variant="secondary"><Link to={it.link}>Open in {it.source}</Link></Button>}{canEdit && <Button onClick={onEdit}><Pencil /> Edit</Button>}</>}>
      <div className="space-y-2.5 text-[13.5px]">
        <p className="flex items-center gap-2"><Clock className="size-4 text-muted" />{formatDate(it.date, { weekday: "long", day: "numeric", month: "long" })}{it.start ? ` · ${it.start}${it.end ? `–${it.end}` : ""}` : " · All day"}</p>
        {it.location && <p className="flex items-center gap-2"><MapPin className="size-4 text-muted" />{it.location}</p>}
        {it.meetLink && <p className="flex flex-wrap items-center gap-2"><Video className="size-4 text-brand-600" /><span className="text-brand-700">{it.meetLink}</span><Badge tone="warning">Simulated link</Badge></p>}
        <p className="flex items-start gap-2"><Users className="mt-0.5 size-4 text-muted" /><span>{[...it.participantIds.map(name), ...(it.external ?? [])].join(", ")}</span></p>
        {it.related && <p className="text-[12.5px] text-muted">Related to: {relLink ? <Link to={relLink} className="text-brand-700 hover:underline">{it.related.label}</Link> : it.related.label}</p>}
        {it.agenda && <div className="rounded-lg bg-canvas p-3"><p className="text-[12px] font-semibold uppercase tracking-wide text-subtle">Agenda</p><p className="mt-1 whitespace-pre-wrap">{it.agenda}</p></div>}
        {it.description && <p className="text-muted">{it.description}</p>}
      </div>
    </DialogContent>
  );
}

function Pill({ it, onOpen }: { it: CalItem; onOpen: () => void }) {
  return <button onClick={onOpen} className={cn("block w-full truncate rounded border px-1.5 py-0.5 text-left text-[11.5px]", TYPE_STYLE[it.type])} title={it.title}>{it.start && <span className="tabular font-medium">{it.start} </span>}{it.title}</button>;
}

export function Calendar() {
  const d = useData();
  const p = usePersona();
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [cursor, setCursor] = useState(DEMO_TODAY);
  const [scope, setScope] = useState<"mine" | "team" | "org">(p.role === "exec" ? "org" : "mine");
  const [types, setTypes] = useState<EventType[]>(EVENT_TYPES);
  const [open, setOpen] = useState<CalItem>();
  const [edit, setEdit] = useState<Draft>();
  const me = d.staff.find((s) => s.id === p.staffId);
  const all = useMemo(() => calendarItems(d), [d]);
  const team = d.staff.filter((s) => s.department === me?.department).map((s) => s.id);
  const items = all.filter((i) => types.includes(i.type) && (scope === "org" || (scope === "mine" ? i.participantIds.includes(p.staffId ?? "") : i.participantIds.some((x) => team.includes(x)))));
  const on = (day: string) => items.filter((i) => i.date === day);

  const monthStart = cursor.slice(0, 8) + "01";
  const gridStart = startOfWeek(monthStart);
  const weekStart = startOfWeek(cursor);
  const move = (dir: number) => setCursor(view === "month" ? (() => { const dt = new Date(monthStart + "T00:00:00Z"); dt.setUTCMonth(dt.getUTCMonth() + dir); return dt.toISOString().slice(0, 10); })() : addDays(cursor, (view === "week" ? 7 : 1) * dir));
  const label = view === "month" ? formatDate(monthStart, { month: "long", year: "numeric" }) : view === "week" ? `${formatDate(weekStart)} – ${formatDate(addDays(weekStart, 6), { day: "numeric", month: "short", year: "numeric" })}` : formatDate(cursor, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const newEvent = (date = cursor): Draft => ({ title: "", type: "Meeting", date, start: "10:00", end: "11:00", organizerId: p.staffId ?? "s-rana", participantIds: p.staffId ? [p.staffId] : [] });

  return (
    <Workspace area="calendar" title="Calendar" description="One shared calendar: meetings, school visits, trainings, Future Builders activities, interviews, reviews, deadlines, grant obligations and leave."
      actions={<Button onClick={() => setEdit(newEvent())}><Plus /> New event</Button>}
      meta={<Badge tone="outline">Google Calendar sync: simulated</Badge>}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1"><Button size="icon-sm" variant="secondary" aria-label="Previous" onClick={() => move(-1)}><ChevronLeft /></Button><Button size="sm" variant="secondary" onClick={() => setCursor(DEMO_TODAY)}>Today</Button><Button size="icon-sm" variant="secondary" aria-label="Next" onClick={() => move(1)}><ChevronRight /></Button></div>
        <h2 className="mr-auto text-[16px] font-semibold">{label}</h2>
        <Segmented value={scope} onChange={setScope} options={[{ value: "mine", label: "Mine" }, { value: "team", label: "My team" }, { value: "org", label: "Organization" }]} />
        <Segmented value={view} onChange={setView} options={[{ value: "month", label: "Month" }, { value: "week", label: "Week" }, { value: "day", label: "Day" }]} />
      </div>
      <div className="flex flex-wrap gap-1.5">{EVENT_TYPES.map((t) => <button key={t} onClick={() => setTypes((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]))} className={cn("rounded-full border px-2.5 py-0.5 text-[12px]", types.includes(t) ? TYPE_STYLE[t] : "border-line text-subtle line-through")}>{t}</button>)}</div>

      {view === "month" && (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-7 border-b border-line bg-canvas text-center text-[11.5px] font-medium text-muted">{WD.map((w) => <div key={w} className="py-1.5">{w}</div>)}</div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)).map((day) => {
              const list = on(day);
              const inMonth = day.slice(0, 7) === monthStart.slice(0, 7);
              return (
                <div key={day} className={cn("min-h-24 border-b border-r border-line p-1 sm:min-h-28", !inMonth && "bg-canvas/60")}>
                  <button onClick={() => { setCursor(day); setView("day"); }} className={cn("mb-1 flex size-6 items-center justify-center rounded-full text-[12px]", day === DEMO_TODAY ? "bg-brand-600 font-semibold text-white" : inMonth ? "text-fg hover:bg-canvas" : "text-subtle")}>{Number(day.slice(8))}</button>
                  <div className="hidden space-y-0.5 sm:block">{list.slice(0, 3).map((it) => <Pill key={it.id} it={it} onOpen={() => setOpen(it)} />)}{list.length > 3 && <button onClick={() => { setCursor(day); setView("day"); }} className="text-[11px] text-muted hover:underline">+{list.length - 3} more</button>}</div>
                  {list.length > 0 && <span className="block text-center text-[11px] text-brand-700 sm:hidden">{list.length}</span>}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {view === "week" && (
        <div className="grid gap-2 md:grid-cols-7">
          {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((day) => (
            <Card key={day} className={cn("p-2", day === DEMO_TODAY && "ring-2 ring-brand-200")}>
              <button onClick={() => { setCursor(day); setView("day"); }} className="mb-2 text-left text-[12px] font-semibold hover:underline">{formatDate(day, { weekday: "short", day: "numeric", month: "short" })}</button>
              <div className="space-y-1">{on(day).map((it) => <Pill key={it.id} it={it} onOpen={() => setOpen(it)} />)}{!on(day).length && <p className="text-[11.5px] text-subtle">Nothing scheduled</p>}</div>
            </Card>
          ))}
        </div>
      )}

      {view === "day" && (
        <Card className="divide-y divide-line">
          {on(cursor).length === 0 ? <div className="flex flex-col items-center gap-2 p-10 text-center text-muted"><CalendarDays className="size-6" /><p>Nothing scheduled.</p><Button size="sm" onClick={() => setEdit(newEvent(cursor))}><Plus /> Add an event</Button></div>
            : on(cursor).map((it) => (
              <button key={it.id} onClick={() => setOpen(it)} className="flex w-full items-start gap-3 p-3 text-left hover:bg-canvas">
                <span className="w-24 shrink-0 pt-0.5 text-[12.5px] text-muted tabular">{it.start ? `${it.start}${it.end ? `–${it.end}` : ""}` : "All day"}</span>
                <span className="min-w-0 flex-1"><span className="block font-medium">{it.title}</span><span className="block text-[12.5px] text-muted">{[it.location, it.meetLink ? "Google Meet (simulated)" : undefined, `${it.participantIds.length + (it.external?.length ?? 0)} participants`].filter(Boolean).join(" · ")}</span></span>
                <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[11.5px]", TYPE_STYLE[it.type])}>{it.type}</span>
                {it.link && <ExternalLink className="mt-1 size-3.5 shrink-0 text-subtle" />}
              </button>
            ))}
        </Card>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(undefined)}>{open && <EventDetail it={open} onClose={() => setOpen(undefined)} onEdit={() => { setEdit(open.event); setOpen(undefined); }} />}</Dialog>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(undefined)}>{edit && <EventEditor initial={edit} title={edit.id ? "Edit event" : "New event"} onClose={() => setEdit(undefined)} />}</Dialog>
    </Workspace>
  );
}
