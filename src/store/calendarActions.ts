import type { CalendarEvent, DemoData, EventType } from "@/data/types";
import { getPersona, personas } from "@/config/personas";
import { addDays, uid } from "@/lib/utils";
import { useDemo } from "./demoStore";
import { toast } from "./uiStore";

const S = () => useDemo.getState();

export const personaForStaff = (staffId: string) => personas.find((p) => p.staffId === staffId);

/** Simulated: produces a link in the Google Meet format. No meeting is created anywhere. */
export function simulatedMeetLink() {
  const c = () => Math.random().toString(36).replace(/[^a-z]/g, "").padEnd(4, "x");
  return `https://meet.google.com/sim-${c().slice(0, 3)}-${c().slice(0, 4)}`;
}

export function saveEvent(ev: Omit<CalendarEvent, "id"> & { id?: string }) {
  const me = getPersona(S().personaId);
  const isNew = !ev.id;
  const id = ev.id ?? uid("ev");
  S().update((d) => {
    const i = d.events.findIndex((x) => x.id === id);
    const rec = { ...ev, id } as CalendarEvent;
    if (i >= 0) d.events[i] = rec; else d.events.push(rec);
  });
  for (const sid of ev.participantIds) {
    const p = personaForStaff(sid);
    if (p && p.id !== me.id) S().notify({ toPersona: p.id, text: `${isNew ? "New" : "Updated"} ${ev.type.toLowerCase()}: ${ev.title} (${ev.date}${ev.start ? ` ${ev.start}` : ""})`, link: "/calendar", tone: "info" });
  }
  toast({ tone: "success", title: isNew ? "Event created" : "Event updated", body: `${ev.participantIds.length} participant${ev.participantIds.length === 1 ? "" : "s"} notified${ev.meetLink ? " · Meet link is simulated" : ""}.` });
  return id;
}

export function deleteEvent(id: string) {
  S().update((d) => { d.events = d.events.filter((e) => e.id !== id); });
  toast({ tone: "info", title: "Event deleted" });
}

/** Everything on the shared calendar: events plus records from other workspaces (read-only here). */
export interface CalItem {
  id: string; title: string; type: EventType; date: string; start?: string; end?: string; location?: string;
  online?: boolean; meetLink?: string; participantIds: string[]; external?: string[]; agenda?: string; description?: string;
  related?: CalendarEvent["related"]; source: "Calendar" | "Visits" | "TF training" | "FB sessions" | "Grant obligations" | "Leave"; link?: string; event?: CalendarEvent;
}

export function calendarItems(d: DemoData): CalItem[] {
  const school = (id: string) => d.schools.find((s) => s.id === id);
  const items: CalItem[] = d.events.map((e) => ({ ...e, participantIds: [e.organizerId, ...e.participantIds.filter((x) => x !== e.organizerId)], external: e.externalParticipants, source: "Calendar", event: e }));
  for (const v of d.visits) {
    const s = school(v.schoolId);
    items.push({ id: v.id, title: `${v.purpose}: ${s?.name ?? ""}`, type: "School visit", date: v.date, start: "09:00", end: "11:00", location: s?.name, participantIds: [v.officerId], source: "Visits", link: `/school-upskilling/schools/${v.schoolId}`, related: s ? { kind: "school", id: s.id, label: s.name } : undefined });
  }
  for (const t of d.trainingSessions) { const [a, b] = t.time.split("–"); items.push({ id: t.id, title: `TF training: ${t.title}`, type: "Training", date: t.date, start: a, end: b, location: t.venue, participantIds: [t.trainerId], source: "TF training", link: "/school-upskilling/training", related: { kind: "cohort", id: t.tfCohortId, label: "TF Cohort 2026–27" } }); }
  for (const s of d.fbSessions) { const [a, b] = s.time.split("–"); items.push({ id: s.id, title: `${s.type}: ${s.title}`, type: "Future Builders", date: s.date, start: a, end: b, location: "Innovation hub", participantIds: [s.leadId], source: "FB sessions", link: "/future-builders/cohorts", related: { kind: "cohort", id: s.cohortId, label: "FB 2026–27" } }); }
  for (const o of d.obligations) items.push({ id: o.id, title: `Due: ${o.title}`, type: "Grant obligation", date: o.due, participantIds: [o.ownerId], source: "Grant obligations", link: "/fundraising/obligations" });
  for (const l of d.leave) {
    for (let day = l.from; day <= l.to; day = addDays(day, 1)) {
      const wd = new Date(day + "T00:00:00Z").getUTCDay();
      if (wd === 0 || wd === 6) continue;
      items.push({ id: `${l.id}-${day}`, title: `${d.staff.find((s) => s.id === l.staffId)?.name.split(" ")[0]}: ${l.type} leave${l.status === "Pending" ? " (pending)" : ""}`, type: "Leave", date: day, participantIds: [l.staffId], source: "Leave", link: "/operations/leave" });
    }
  }
  return items.sort((a, b) => (a.date + (a.start ?? "00")).localeCompare(b.date + (b.start ?? "00")));
}
